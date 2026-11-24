// =====================================================================
// Rock Cycle Explorer — progress.
//   What each student has finished (saved on the iPad), which modes are
//   unlocked, the "Get ready" pass-score pop-up, the My Progress panel,
//   the teacher "Unlock all" panel, and "Add to Home Screen".
// All the words are in js/data/progress.js. Pass scores are in
// js/data/quizzes.js and js/data/diagram.js ("pass").
// =====================================================================
import { showFinale } from './finale.js';
const KEY = 'rce-progress-1';
const PASS_HASH = 's6wc3w';            // the teacher password, scrambled so it isn't written here in plain text
const scramble = s => { let x = 5381; for (const c of ('rce:' + String(s).trim().toLowerCase())) x = ((x << 5) + x + c.charCodeAt(0)) >>> 0; return x.toString(36); };
const SAY_ICON = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
const LOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

export function createProgress(ui, W, QZ = {}, DG = null, RT = null) {
  const esc = ui.esc, $ = s => document.querySelector(s);
  const RC = window.ROCK_CYCLE || {};
  const STEP_KEYS = RC.order || [];
  const fill = (t, o) => String(t).replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
  const yellow = t => esc(t).replace(/\*(.+?)\*/g, '<span class="y">$1</span>');

  // the milestone quizzes: how many questions, how many to pass, what passing unlocks
  const QUIZ = {};
  if (QZ.realWorld) QUIZ.realWorld = { title: QZ.realWorld.title, theme: QZ.realWorld.theme || 'purple', n: QZ.realWorld.questions.length, need: QZ.realWorld.pass || QZ.realWorld.questions.length, next: 'energy' };
  if (QZ.sedimentary) QUIZ.sedimentary = { title: QZ.sedimentary.title, theme: QZ.sedimentary.theme || 'orange', n: QZ.sedimentary.questions.length, need: QZ.sedimentary.pass || QZ.sedimentary.questions.length, next: 'diagram' };
  if (QZ.igneous) QUIZ.igneous = { title: QZ.igneous.title, theme: QZ.igneous.theme || 'pink', n: QZ.igneous.questions.length, need: QZ.igneous.pass || QZ.igneous.questions.length, next: 'diagram' };
  if (DG) QUIZ.diagram = { title: DG.quiz.title, theme: 'teal', n: 15 + DG.quiz.questions.length, need: DG.quiz.pass || 15 + DG.quiz.questions.length, next: RT ? 'rocks' : null };
  if (RT) QUIZ.rocks = { title: RT.quiz.title, theme: 'lime', n: 12, need: RT.quiz.pass || 12, next: null };   // 6 surprise questions + 6 photo questions
  const LAST = RT ? 'rocks' : 'diagram';                 // passing this quiz finishes everything
  const ROCK_KEYS = RT ? Object.keys(RT.rocks) : [];

  // ---------- saved progress ----------
  const blank = () => ({ steps: {}, stories: {}, lesson: false, rocks: {}, quizzes: {}, teacher: false, fresh: {} });
  // a saved copy that's damaged (or from an old version) never stops the site: anything with the wrong shape starts fresh
  const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
  function clean(s) {
    const b = blank();
    for (const k of ['steps', 'stories', 'rocks', 'fresh', 'rockMiss']) b[k] = isObj(s[k]) ? s[k] : (k === 'rockMiss' ? {} : b[k]);
    b.quizzes = {};
    if (isObj(s.quizzes)) for (const [k, q] of Object.entries(s.quizzes)) if (isObj(q) && Number.isFinite(q.best) && Number.isFinite(q.n)) b.quizzes[k] = { best: q.best, last: Number.isFinite(q.last) ? q.last : q.best, tries: Number.isFinite(q.tries) ? q.tries : 1, n: q.n };
    b.lesson = s.lesson === true; b.teacher = s.teacher === true;
    if (Number.isFinite(s.bestStreak)) b.bestStreak = s.bestStreak;
    if (typeof s.completedAt === 'string' || Number.isFinite(s.completedAt)) b.completedAt = s.completedAt;
    if (isObj(s.rockQ) && Array.isArray(s.rockQ.pick) && isObj(s.rockQ.ans)) b.rockQ = { pick: s.rockQ.pick.filter(k => typeof k === 'string'), ans: s.rockQ.ans, used: !!s.rockQ.used };
    return b;
  }
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (isObj(s)) return clean(s); } catch (e) {} return blank(); }
  let S = load();
  // the Rock Types Quiz used to be out of 6: keep an old pass as a pass
  if (RT && S.quizzes.rocks && S.quizzes.rocks.n === 6) { const q = S.quizzes.rocks; q.best = q.best >= 4 ? Math.max(QUIZ.rocks.need, q.best * 2) : q.best * 2; q.last *= 2; q.n = 12; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} refresh(); }

  // ---------- the rules ----------
  const stepsDone = () => STEP_KEYS.filter(k => S.steps[k]).length;
  const passed = key => { const q = S.quizzes[key], d = QUIZ[key]; return !!(q && d && q.best >= d.need); };
  // which quizzes finish each mode
  const MODE_QUIZZES = { real: ['realWorld'], energy: ['sedimentary', 'igneous'], diagram: ['diagram'], rocks: ['rocks'] };
  const modeDone = m => (MODE_QUIZZES[m] || []).filter(k => QUIZ[k]).every(passed) && (MODE_QUIZZES[m] || []).some(k => QUIZ[k]);
  const canQuiz = () => S.teacher || stepsDone() >= STEP_KEYS.length;
  const canEnter = m => S.teacher || m === 'real'
    || (m === 'energy' && passed('realWorld'))
    || (m === 'diagram' && passed('sedimentary') && passed('igneous'))
    || (m === 'rocks' && passed('diagram'));
  const rocksDone = () => ROCK_KEYS.filter(k => S.rocks && S.rocks[k]).length;
  const milestones = () => [stepsDone() >= STEP_KEYS.length, passed('realWorld'), !!S.stories.sedimentary, passed('sedimentary'), !!S.stories.igneous, passed('igneous'), !!S.lesson, passed('diagram'),
    ...(RT ? [rocksDone() >= ROCK_KEYS.length, passed('rocks')] : [])];

  // ---------- things students finish ----------
  function step(k) { if (!S.steps[k]) { S.steps[k] = true; save(); } }
  function story(kind) { if (!S.stories[kind]) { S.stories[kind] = true; save(); } }
  function lesson() { if (!S.lesson) { S.lesson = true; save(); } }
  function streak(n) { if (n > (S.bestStreak || 0)) { S.bestStreak = n; save(); } }            // longest Diagram Quiz streak
  function rockMiss(k) { S.rockMiss = S.rockMiss || {}; if (!S.rockMiss[k]) { S.rockMiss[k] = true; save(); } }   // a wrong drop while sorting
  const allPassed = () => Object.keys(QUIZ).every(passed);
  function finaleData() {
    const quizzes = {};
    for (const [k, d] of Object.entries(QUIZ)) { const q = S.quizzes[k]; quizzes[k] = { title: d.title, n: d.n, need: d.need, best: q ? q.best : null, tries: q ? q.tries : 0 }; }
    return { steps: stepsDone(), quizzes, stories: !!(S.stories.sedimentary && S.stories.igneous), sorted: rocksDone(), firstSorts: ROCK_KEYS.filter(k => S.rocks && S.rocks[k] && !(S.rockMiss || {})[k]).length,
      streak: S.bestStreak || 0, completedAt: S.completedAt || null };
  }
  function finale() { ui.closeModal(); ui.closePanels(); return showFinale(ui, W, finaleData()); }
  function rockSorted(k) { S.rocks = S.rocks || {}; if (!S.rocks[k]) { S.rocks[k] = true; save(); } }
  function rocksReset() { S.rocks = {}; S.rockMiss = {}; S.rockQ = null; save(); }
  // the 6 rocks with a surprise question: { pick: [keys], ans: { key: true/false }, used: the quiz already counted them }
  const rockQ = () => JSON.parse(JSON.stringify(S.rockQ || { pick: [], ans: {}, used: false }));
  function rockQSet(q) { S.rockQ = q; save(); }
  function rockQAnswer(k, ok) { S.rockQ = S.rockQ || { pick: [], ans: {}, used: false }; S.rockQ.ans[k] = !!ok; save(); }
  function entered(m) { if (S.fresh[m]) { delete S.fresh[m]; save(); } }
  const tries = key => (S.quizzes[key] && S.quizzes[key].tries) || 0;
  // a quiz was finished: keep the best score, and say what it unlocked (as HTML for the score screen)
  function recordQuiz(key, first, n) {
    const d = QUIZ[key]; if (!d) return { html: '' };
    const before = { energy: canEnter('energy'), diagram: canEnter('diagram'), rocks: canEnter('rocks') }, wasPassed = passed(key);
    const q = S.quizzes[key] || { best: 0, last: 0, tries: 0 };
    q.tries++; q.last = first; q.best = Math.max(q.best, first); q.n = n;
    S.quizzes[key] = q;
    const unlocked = ['energy', 'diagram', ...(RT ? ['rocks'] : [])].filter(m => !before[m] && canEnter(m));
    unlocked.forEach(m => { S.fresh[m] = true; });
    // every quiz passed for the first time: the big finish screen
    const firstFinish = allPassed() && !S.completedAt;
    if (firstFinish) S.completedAt = Date.now();
    save();
    const ok = first >= d.need;
    let html = ok ? `<p class="pg-pass ok"><i>✓</i>${esc(W.passed)}</p>`
      : `<p class="pg-pass no">${esc(fill(W.notPassed, { need: d.need, n: d.n }))}</p>`;
    if (!ok && wasPassed && W.alreadyPassed) html += `<p class="pg-pass soft">${esc(W.alreadyPassed)}</p>`;
    unlocked.forEach(m => { html += `<p class="pg-unlock"><i>🔓</i>${esc(fill(W.unlockedNow, { mode: W.modes[m] }))}</p>`; });
    if (key === LAST && ok) html += `<p class="pg-unlock gold"><i>🏆</i>${esc(W.allDone)}</p>`;
    return { passed: ok, unlocked, html, finale: firstFinish };
  }

  // ---------- the "Get ready" pop-up at the start of a milestone quiz ----------
  function sayBtn() { return ui.speech.ok ? `<button class="say-btn small" data-say>${SAY_ICON}<span>Read to me</span></button>` : ''; }
  function passIntro(key, onGo, onCancel, extra) {
    const d = QUIZ[key]; if (!d) { onGo(); return; }
    ui.closeModal();
    const back = document.createElement('div'); back.className = 'modal-back quiz-back';
    const text = esc(fill(W.passIntro.text, { need: '\u0001', n: '\u0002' })).replace('\u0001', `<b>${d.need}</b>`).replace('\u0002', `<b>${d.n}</b>`);
    const next = d.next ? fill(W.passIntro.unlocks, { next: W.modes[d.next] }) : W.passIntro.last;
    back.innerHTML = `<div class="modal quiz t-${esc(d.theme)} pg-intro" role="dialog" aria-modal="true" aria-label="${esc(d.title)}">
      <button class="close qz-x" aria-label="Close">✕</button>
      <div class="qz-top"><span class="qz-title">${esc(d.title)}</span></div>
      <div class="qz-read"><div class="qz-qrow">${sayBtn()}</div>
        <h3 class="pg-intro-h"><i>🎯</i>${esc(W.passIntro.title)}</h3>
        <p class="say pg-intro-big">${text}</p>
        ${extra ? `<p class="say pg-intro-extra">${esc(extra)}</p>` : ''}
        <p class="say pg-intro-next">${esc(next)}</p></div>
      <div class="qz-next"><button class="qz-go">${esc(W.passIntro.start)}</button></div></div>`;
    document.body.appendChild(back);
    const close = () => { ui.speech.stop(); back.remove(); };
    back.querySelector('.qz-go').onclick = () => { close(); onGo(); };
    back.querySelector('.qz-x').onclick = () => { close(); if (onCancel) onCancel(); };
    const sb = back.querySelector('[data-say]'); if (sb) sb.onclick = () => ui.speech.read(back.querySelector('.qz-read'), sb);
  }

  // ---------- locked things ----------
  function explainLock(m) {
    ui.modal({ title: W.lockedTitle, html: `<p class="lead big pg-lock-msg"><i>🔒</i>${esc(W.lockedMode[m] || '')}</p>`,
      buttons: [{ label: W.lockedOk }, { label: W.lockedProgress, cls: 'ghost', onClick: openPanel }] });
  }
  function explainQuizLock() {
    ui.modal({ title: W.lockedTitle, html: `<p class="lead big pg-lock-msg"><i>🔒</i>${esc(fill(W.lockedQuiz, { n: stepsDone() }))}</p>`,
      buttons: [{ label: W.lockedOk }, { label: W.lockedProgress, cls: 'ghost', onClick: openPanel }] });
  }

  // ---------- show locks on the buttons ----------
  function refresh() {
    document.querySelectorAll('.rail-btn[data-mode]').forEach(b => {
      const m = b.dataset.mode, lock = !canEnter(m);
      if (!b.querySelector('.lock-badge')) b.insertAdjacentHTML('beforeend', `<i class="lock-badge">${LOCK_SVG}</i>`);
      b.classList.toggle('locked', lock); b.setAttribute('aria-disabled', String(lock));
      b.classList.toggle('fresh', !lock && !!S.fresh[m]);
      // a green check once the mode's last quiz is passed
      if (!b.querySelector('.done-badge')) b.insertAdjacentHTML('beforeend', '<i class="done-badge" aria-hidden="true">✓</i>');
      b.classList.toggle('mode-done', modeDone(m));
    });
    document.querySelectorAll('.dock-btn[data-p]').forEach(b => {
      const k = b.dataset.p;
      if (k === 'quiz') b.classList.toggle('locked', !canQuiz());
      else b.classList.toggle('done', !!S.steps[k]);
    });
    const tb = $('#teacherBtn'); if (tb) tb.classList.toggle('on', !!S.teacher);
    if (!$('#panel-progress').hidden) renderPanel();
    if (!$('#panel-teacher').hidden) renderTeacher();
  }

  // ---------- My Progress ----------
  function openPanel() { renderPanel(); if ($('#panel-progress').hidden) ui.openPanel('progress'); }
  function quizRow(key, title) {
    const d = QUIZ[key]; if (!d) return '';
    const q = S.quizzes[key], ok = passed(key), L = W.quizLine;
    let detail;
    if (!q) detail = `<span>${esc(fill(L.notTaken, { need: d.need, n: d.n }))}</span>`;
    else detail = `<span>${esc(fill(L.best, { best: q.best, n: d.n, pct: Math.round(q.best / d.n * 100) }))}</span>`
      + `<span>${esc(fill(L.last, { last: q.last, n: d.n }))} · ${esc(fill(L.tries, { tries: q.tries }))}</span>`
      + (ok ? '' : `<span>${esc(fill(L.need, { need: d.need, n: d.n }))}</span>`);
    const pct = q ? Math.round(q.best / d.n * 100) : 0;
    return `<div class="pg-row ${ok ? 'done' : 'todo'}"><i class="pg-ic">${ok ? '✓' : '○'}</i>
      <div class="pg-txt"><b>${esc(title)}</b>${detail}</div>
      ${q ? `<span class="pg-score t-${esc(d.theme)}${ok ? ' ok' : ''}">${pct}%${ok ? `<small>${esc(L.passed)}</small>` : ''}</span>` : ''}</div>`;
  }
  function doneRow(done, title) {
    return `<div class="pg-row ${done ? 'done' : 'todo'}"><i class="pg-ic">${done ? '✓' : '○'}</i><div class="pg-txt"><b>${esc(title)}</b><span>${esc(done ? W.rows.storyDone : W.rows.storyNot)}</span></div></div>`;
  }
  function section(n, m, inner) {
    const lock = !canEnter(m);
    return `<section class="pg-mode${lock ? ' locked' : ''}"><h3><span class="pg-num">${n}</span>${esc(W.modes[m])}${lock ? `<i class="pg-lock">${LOCK_SVG}</i>` : ''}</h3>
      ${lock ? `<p class="pg-locked">${esc(W.lockedMode[m] || '')}</p>` : inner}</section>`;
  }
  function renderPanel() {
    const body = $('#progressBody'); if (!body) return;
    const ms = milestones(), done = ms.filter(Boolean).length, BC = RC.buttonColors || {};
    const dots = STEP_KEYS.map(k => `<i class="pg-dot${S.steps[k] ? ' on' : ''}" style="--c:${BC[k] || '#7fe0a0'}" title="${esc((RC.steps && RC.steps[k] && RC.steps[k].button) || k)}"></i>`).join('');
    body.innerHTML = `
      ${allPassed() ? `<button class="wide-btn pg-trophy" data-trophy>${esc(W.finale.open)}</button>` : ''}
      <div class="pg-top"><div class="pg-bar"><i style="width:${Math.round(done / ms.length * 100)}%"></i></div>
        <p>${esc(fill(W.overall, { n: done, total: ms.length }))}</p></div>
      ${S.teacher ? `<p class="pg-teacher">${esc(W.teacher.done)}</p>` : ''}
      ${section(1, 'real', `
        <div class="pg-row ${ms[0] ? 'done' : 'todo'}"><i class="pg-ic">${ms[0] ? '✓' : '○'}</i>
          <div class="pg-txt"><b>${esc(W.rows.steps)}</b><span class="pg-dots">${dots}</span><span>${esc(fill(W.rows.stepsCount, { n: stepsDone() }))}</span></div></div>
        ${quizRow('realWorld', QUIZ.realWorld ? QUIZ.realWorld.title : '')}`)}
      ${section(2, 'energy', `
        ${doneRow(!!S.stories.sedimentary, W.rows.sedStory)}
        ${quizRow('sedimentary', QUIZ.sedimentary ? QUIZ.sedimentary.title : '')}
        ${doneRow(!!S.stories.igneous, W.rows.ignStory)}
        ${quizRow('igneous', QUIZ.igneous ? QUIZ.igneous.title : '')}`)}
      ${DG ? section(3, 'diagram', `${doneRow(!!S.lesson, W.rows.diagramLesson)}${quizRow('diagram', QUIZ.diagram.title)}`) : ''}
      ${RT ? section(4, 'rocks', `
        <div class="pg-row ${rocksDone() >= ROCK_KEYS.length ? 'done' : 'todo'}"><i class="pg-ic">${rocksDone() >= ROCK_KEYS.length ? '✓' : '○'}</i>
          <div class="pg-txt"><b>${esc(W.rows.rocksSort)}</b><span>${esc(fill(W.rows.rocksCount, { n: rocksDone() }))}</span></div></div>
        ${quizRow('rocks', QUIZ.rocks.title)}`) : ''}`;
    const tb = body.querySelector('[data-trophy]'); if (tb) tb.onclick = finale;
  }

  // ---------- teacher: Unlock all ----------
  let eraseArmed = false;
  function renderTeacher(msg = '', bad = false) {
    const body = $('#teacherBody'); if (!body) return;
    const T = W.teacher;
    eraseArmed = false;
    body.innerHTML = S.teacher
      ? `<p class="pg-t-ok">🔓 ${esc(T.done)}</p>${msg ? `<p class="pg-t-msg">${esc(msg)}</p>` : ''}
         <button class="wide-btn" data-lockagain>${esc(T.lockAgain)}</button>
         <button class="wide-btn ghost" data-preview>🏆 ${esc(T.preview)}</button>
         <button class="wide-btn ghost pg-erase" data-erase>${esc(T.erase)}</button>`
      : `<p>${esc(T.text)}</p>
         <div class="pg-t-form" role="group">
           <input type="text" class="pg-code" inputmode="numeric" name="rce-teacher-code" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
             data-1p-ignore data-lpignore="true" data-bwignore data-form-type="other" placeholder="${esc(T.placeholder)}" aria-label="${esc(T.placeholder)}">
           <button class="wide-btn" type="button" data-unlock>${esc(T.unlock)}</button></div>
         ${msg ? `<p class="pg-t-msg${bad ? ' bad' : ''}">${esc(msg)}</p>` : ''}`;
    // a plain text box (masked with dots), not a password field or form, so Safari and
    // password managers like 1Password don't treat the site as a login page
    const inp = body.querySelector('.pg-code'), go = body.querySelector('[data-unlock]');
    const tryCode = () => {
      const v = inp.value; inp.value = '';
      if (scramble(v) === PASS_HASH) { S.teacher = true; save(); renderTeacher(); }
      else { renderTeacher(T.wrong, true); const i2 = $('#teacherBody .pg-code'); if (i2) { i2.classList.add('bad'); i2.focus(); } }
    };
    if (go) go.onclick = tryCode;
    if (inp) inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); tryCode(); } };
    const pv = body.querySelector('[data-preview]'); if (pv) pv.onclick = finale;
    const la = body.querySelector('[data-lockagain]'); if (la) la.onclick = () => { S.teacher = false; save(); renderTeacher(T.lockedAgain); };
    const er = body.querySelector('[data-erase]');
    if (er) er.onclick = () => {
      if (!eraseArmed) { eraseArmed = true; er.textContent = T.eraseSure; er.classList.add('armed'); return; }
      S = blank(); S.teacher = true; save(); renderTeacher(T.erased);
    };
  }

  // ---------- Add to Home Screen ----------
  const standalone = () => window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
  function homeSteps() {
    const H = W.home;
    if (!standalone() && installEvt) { installEvt.prompt(); installEvt = null; return; }      // Chrome and Chromebooks can install in one tap
    ui.modal({
      title: H.title,
      html: standalone() ? `<p class="lead big">✓ ${esc(H.already)}</p>`
        : `<p class="lead"><b>${esc(H.intro)}</b></p><ol class="pg-home">${H.steps.map(s => `<li>${yellow(s)}</li>`).join('')}</ol>`,
      buttons: [{ label: H.ok }]
    });
  }

  // when the Unlock all panel closes, take the code box off the page
  const tp = $('#panel-teacher');
  if (tp && window.MutationObserver) new MutationObserver(() => { if (tp.hidden) { const b = $('#teacherBody'); if (b) b.innerHTML = ''; } }).observe(tp, { attributes: true, attributeFilter: ['hidden'] });

  // the left-menu buttons
  document.addEventListener('click', e => {
    if (e.target.closest('[data-panel="progress"]')) renderPanel();
    if (e.target.closest('[data-panel="teacher"]')) renderTeacher();
    if (e.target.closest('[data-home]') && !e.target.closest('#progressBody')) homeSteps();
  }, true);

  refresh();
  return { step, story, lesson, entered, recordQuiz, rockSorted, rocksReset, streak, rockMiss, finale, finaleData, rocksSorted: () => Object.assign({}, S.rocks), rockMisses: () => Object.assign({}, S.rockMiss || {}), rockQ, rockQSet, rockQAnswer, tries, canQuiz, canEnter, explainLock, explainQuizLock, passIntro,
    hasPass: key => !!QUIZ[key], openPanel, refresh, homeSteps, state: () => JSON.parse(JSON.stringify(S)) };
}
