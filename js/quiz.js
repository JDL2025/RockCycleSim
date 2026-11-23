// =====================================================================
// Rock Cycle Explorer — quizzes (multiple choice, two tries).
//   Right answer: "Correct!" and why.
//   1st wrong try: why it's wrong, then try again.
//   2nd wrong try: why it's wrong, then the right answer and why.
//   At the end: a score screen (right on the first try); fireworks for a perfect score.
// The questions are in js/data/quizzes.js.
// =====================================================================
export function createQuiz(ui, Q) {
  const esc = ui.esc, W = Q.words, LET = ['A', 'B', 'C', 'D', 'E'];
  let back = null;
  const sayBtn = () => ui.speech.ok ? `<button class="say-btn small" data-say><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg><span>Read to me</span></button>` : '';

  let closeHook = null;
  function close() {
    ui.speech.stop(); if (back) { back.remove(); back = null; }
    if (closeHook) { const h = closeHook; closeHook = null; h(); }
  }

  // open a quiz: key = 'realWorld' | 'sedimentary' | 'igneous', or a set of questions (used by Diagram mode)
  // side: true = the quiz sits on the right, with the 3D model still showing on the left
  // noScore: true = no score screen; the last button (set.finishLabel) closes it and onDone gets the results
  // noClose: true = no ✕ button (checkpoint questions must be answered)
  // progressKey: which saved score a question set belongs to (for mixing up answers on retakes)
  function open(key, onDone, opts = {}) {
    const set = typeof key === 'string' ? Q[key] : key; if (!set) return;
    // milestone quizzes start with a "Get ready" pop-up that says the score needed to pass
    if (!opts.noScore && typeof key === 'string' && ui.progress && ui.progress.hasPass(key)) { ui.closeModal(); close(); ui.progress.passIntro(key, () => run(key, set, onDone, opts)); return; }
    run(key, set, onDone, opts);
  }
  const shuffled = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  function run(key, set, onDone, { side = false, noScore = false, noClose = false, progressKey = null } = {}) {
    const pkey = typeof key === 'string' ? key : progressKey;
    let retake = !!(pkey && ui.progress && ui.progress.tries(pkey) > 0);     // answers are mixed up on retakes (not True/False)
    ui.closeModal(); close();
    const results = [];
    back = document.createElement('div'); back.className = 'modal-back quiz-back' + (side ? ' side' : '');
    document.body.appendChild(back);
    if (side && ui.quizSide) { ui.quizSide(true); closeHook = () => ui.quizSide(false); }
    const finish = () => { close(); onDone && onDone(results.slice()); };

    function frame(inner) {
      ui.speech.stop();
      back.innerHTML = `<div class="modal quiz t-${esc(set.theme || 'purple')}" role="dialog" aria-modal="true" aria-label="${esc(set.title)}">
          ${noClose ? '' : '<button class="close qz-x" aria-label="Close">✕</button>'}${inner}</div>`;
      const x = back.querySelector('.qz-x'); if (x) x.onclick = finish;
      const sb = back.querySelector('[data-say]'); if (sb) sb.onclick = () => ui.speech.read(back.querySelector('.qz-read'), sb);
    }

    function ask(i) {
      const item = set.questions[i], n = set.questions.length;
      let tries = 0, done = false;
      const ids = item.answers.map((_, j) => j), order = retake && item.answers.length > 2 ? shuffled(ids) : ids;   // order[shown place] = answer number
      frame(`
        <div class="qz-top"><span class="qz-title">${esc(set.title)}</span>${n > 1 ? `<span class="qz-step">Question ${i + 1} of ${n}</span>` : ''}</div>
        <div class="qz-read">
          <div class="qz-qrow">${sayBtn()}</div>
          <h3 class="qz-q">${esc(item.q)}</h3>
          <div class="qz-opts">${order.map((a, d) => `<button class="qopt" data-j="${a}"><i>${LET[d]}</i><span>${esc(item.answers[a].text)}</span></button>`).join('')}</div>
          <div class="qz-fb" aria-live="polite"></div>
        </div>
        <div class="qz-next"></div>`);
      const fb = back.querySelector('.qz-fb'), nextEl = back.querySelector('.qz-next'), opts = [...back.querySelectorAll('.qopt')];
      const showNext = () => {
        const last = i === n - 1;
        nextEl.innerHTML = `<button class="qz-go">${esc(last ? (noScore && set.finishLabel) || W.finish : W.next)}</button>`;
        nextEl.querySelector('button').onclick = () => last ? (noScore ? finish() : score()) : ask(i + 1);
      };
      opts.forEach(b => b.onclick = () => {
        if (done || b.disabled) return;
        ui.speech.stop();
        const j = +b.dataset.j;
        if (j === item.correct) {
          done = true; b.classList.add('right');
          opts.forEach(o => o.disabled = true);
          fb.className = 'qz-fb good';
          fb.innerHTML = `<p class="say"><b>${esc(W.right)}</b> ${esc(item.explain)}</p>`;
          results.push(tries === 0 ? 'first' : 'second');
          showNext();
          return;
        }
        tries++; b.classList.add('wrong'); b.disabled = true;
        const why = item.answers[j].why || '';
        if (tries === 1) {
          fb.className = 'qz-fb bad';
          fb.innerHTML = `<p class="say"><b>${esc(W.wrong)}</b> ${esc(why)}</p><p class="say qz-again">${esc(W.tryAgain)}</p>`;
        } else {
          done = true;
          opts.forEach(o => o.disabled = true);
          opts[order.indexOf(item.correct)].classList.add('right', 'reveal');
          fb.className = 'qz-fb bad';
          fb.innerHTML = `<p class="say"><b>${esc(W.wrong)}</b> ${esc(why)}</p>
            <p class="say qz-correct">${esc(W.reveal)} <b>${esc(item.answers[item.correct].text.replace(/[.!?…]$/, ''))}</b></p><p class="say">${esc(item.explain)}</p>`;
          results.push('missed');
          showNext();
        }
      });
    }

    function score() {
      const n = set.questions.length, first = results.filter(r => r === 'first').length, perfect = first === n, pct = Math.round(first / n * 100);
      const rec = ui.progress && typeof key === 'string' ? ui.progress.recordQuiz(key, first, n) : null;     // saves the best score; may unlock a mode
      const icon = r => r === 'first' ? '<b class="qs-ok">✓</b>' : r === 'second' ? '<b class="qs-2nd">✓</b>' : '<b class="qs-no">✗</b>';
      const note = r => r === 'first' ? 'Right on the first try' : r === 'second' ? 'Right on the second try' : 'Missed';
      frame(`
        <div class="qz-top"><span class="qz-title">${esc(set.title)}</span></div>
        <div class="qz-read qz-score">
          <div class="qz-qrow">${sayBtn()}</div>
          <h3>${esc(perfect ? W.perfectTitle : W.scoreTitle)}</h3>
          <div class="qz-scorerow">
            <p class="qz-big say"><b>${first}</b> out of <b>${n}</b> ${esc(W.firstTry)}</p>
            <span class="qz-pct${perfect ? ' perfect' : ''}" aria-label="${pct} percent">${pct}<small>%</small></span>
          </div>
          ${rec ? rec.html : ''}
          <p class="say">${esc(perfect ? W.perfectSub : W.goodJob)}</p>
          <ol class="qz-list">${set.questions.map((q, k) => `<li>${icon(results[k])}<span>${esc(q.q)}<em>${note(results[k])}</em></span></li>`).join('')}</ol>
        </div>
        <div class="qz-next two"><button class="qz-ghost" data-again>${esc(W.again)}</button>${ui.progress ? `<button class="qz-ghost" data-progress>${esc((window.PROGRESS || {}).seeProgress || 'My Progress')}</button>` : ''}<button class="qz-go" data-done>${esc(W.done)}</button></div>`);
      back.querySelector('[data-again]').onclick = () => { results.length = 0; retake = true; ask(0); };
      const pb = back.querySelector('[data-progress]'); if (pb) pb.onclick = () => { finish(); ui.progress.openPanel(); };
      back.querySelector('[data-done]').onclick = finish;
      if (rec && rec.finale) setTimeout(() => { finish(); ui.progress.finale(); }, 2200);     // everything passed: the big finish
      else if (perfect) ui.celebrate(W.perfectTitle, W.perfectSub, { dur: 6.5 });
    }

    ask(0);
  }

  return { open, close, isOpen: () => !!back };
}
