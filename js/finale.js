// =====================================================================
// Rock Cycle Explorer — the big finish screen.
//   Shows when a student has passed every quiz: a gold trophy, glowing
//   rays, fireworks and confetti, and 4 quadrants (one per mode) with the
//   student's stats, a medal, and shout-outs for the great things they did.
// The words are in js/data/progress.js ("finale").
// =====================================================================
const SAY_ICON = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
const TROPHY = `<svg viewBox="0 0 120 130" aria-hidden="true"><defs>
  <linearGradient id="fnGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c4"/><stop offset=".35" stop-color="#ffd84d"/><stop offset=".7" stop-color="#e0a21f"/><stop offset="1" stop-color="#a86a0c"/></linearGradient>
  <linearGradient id="fnGold2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#b87a12"/></linearGradient></defs>
  <path d="M30 18 C10 18 8 46 34 52" fill="none" stroke="url(#fnGold2)" stroke-width="7" stroke-linecap="round"/>
  <path d="M90 18 C110 18 112 46 86 52" fill="none" stroke="url(#fnGold2)" stroke-width="7" stroke-linecap="round"/>
  <path d="M26 10 H94 V30 C94 58 78 72 60 74 C42 72 26 58 26 30 Z" fill="url(#fnGold)" stroke="#8a560a" stroke-width="2"/>
  <path d="M60 22 l5 10 11 1.5 -8 7.5 2 11 -10 -5.5 -10 5.5 2 -11 -8 -7.5 11 -1.5 z" fill="#fff8d6" stroke="#c9890f" stroke-width="1.2"/>
  <path d="M34 14 C32 30 36 46 44 56" stroke="#fff" stroke-width="4" opacity=".55" fill="none" stroke-linecap="round"/>
  <rect x="53" y="73" width="14" height="16" fill="url(#fnGold2)"/>
  <path d="M38 89 H82 L86 104 H34 Z" fill="url(#fnGold)" stroke="#8a560a" stroke-width="2"/>
  <rect x="28" y="104" width="64" height="14" rx="3" fill="#6b3f12" stroke="#3d2408" stroke-width="2"/>
  <rect x="42" y="107" width="36" height="8" rx="2" fill="#ffd84d"/></svg>`;

export function showFinale(ui, W, data) {
  const F = W.finale, esc = ui.esc;
  const fill = (t, o) => String(t).replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
  const pct = (b, n) => (n ? Math.round(b / n * 100) : 0);
  const Q = data.quizzes;
  const old = document.querySelector('.fn-back'); if (old) old.remove();

  // a medal for each part, from its quiz scores
  const medal = list => {
    const v = list.filter(q => q && q.best != null).map(q => q.best / q.n);
    if (!v.length) return '';                                   // nothing taken yet (teacher preview): no medal
    const avg = v.reduce((a, b) => a + b, 0) / v.length;
    const m = avg >= 0.9 ? 'gold' : avg >= 0.75 ? 'silver' : 'bronze';
    return `<span class="fn-medal ${m}"><i>${{ gold: '🥇', silver: '🥈', bronze: '🥉' }[m]}</i>${esc(F.medals[m])}</span>`;
  };
  const quizStat = q => !q ? '' : `<div class="fn-stat"><span>${esc(q.title)}</span><b>${q.best == null ? '—' : esc(fill(F.stats.quiz, { right: q.best, n: q.n }))}</b>${q.best == null ? '' : `<em>${pct(q.best, q.n)}%</em>`}</div>`;
  const line = (label, value) => `<div class="fn-stat"><span>${esc(label)}</span>${value ? `<b>${esc(value)}</b>` : ''}</div>`;
  const praiseFor = q => {
    if (!q || q.best == null) return [];
    const out = [];
    if (q.best === q.n) out.push(fill(F.praise.perfect, { quiz: q.title }));
    if (q.tries === 1 && q.best >= q.need) out.push(fill(F.praise.firstTry, { quiz: q.title }));
    else if (q.tries > 1) out.push(fill(F.praise.grit, { tries: q.tries, quiz: q.title }));
    return out;
  };
  const praise = list => `<ul class="fn-praise">${list.slice(0, 2).map(t => `<li class="say"><i>⭐</i>${esc(t)}</li>`).join('')}</ul>`;

  const parts = [
    { key: 'real', theme: '177,77,255', light: '#dcb0ff', medal: medal([Q.realWorld]),
      stats: line(fill(F.stats.steps, { n: data.steps })) + quizStat(Q.realWorld),
      praise: [...(data.steps >= 8 ? [F.praise.steps] : []), ...praiseFor(Q.realWorld)].reverse() },
    { key: 'energy', theme: '255,138,31', light: '#ffc47e', medal: medal([Q.sedimentary, Q.igneous]),
      stats: quizStat(Q.sedimentary) + quizStat(Q.igneous),
      praise: [...praiseFor(Q.sedimentary), ...praiseFor(Q.igneous), ...(data.stories ? [F.praise.stories] : [])] },
    { key: 'diagram', theme: '34,227,200', light: '#9ff7ea', medal: medal([Q.diagram]),
      stats: quizStat(Q.diagram) + (data.streak >= 2 ? line(fill(F.stats.streak, { n: data.streak })) : ''),
      praise: [...praiseFor(Q.diagram), ...(data.streak >= 5 ? [fill(F.praise.streak, { n: data.streak })] : [])] },
    { key: 'rocks', theme: '198,244,50', light: '#ecffa8', medal: medal([Q.rocks]),
      stats: line(fill(F.stats.sorted, { n: data.sorted })) + quizStat(Q.rocks) + line(fill(F.stats.firstSort, { n: data.firstSorts })),
      praise: [...praiseFor(Q.rocks), ...(data.firstSorts >= 6 ? [fill(F.praise.sorts, { n: data.firstSorts })] : []), ...(data.sorted >= 12 ? [F.praise.allRocks] : [])] }
  ].filter(p => p.key !== 'rocks' || Q.rocks);

  const all = Object.values(Q).filter(q => q.best != null);
  const right = all.reduce((a, q) => a + q.best, 0), total = Object.values(Q).reduce((a, q) => a + q.n, 0);
  const date = data.completedAt ? new Date(data.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  const back = document.createElement('div'); back.className = 'fn-back';
  back.setAttribute('role', 'dialog'); back.setAttribute('aria-modal', 'true'); back.setAttribute('aria-label', F.title);
  back.innerHTML = `<div class="fn-rays"></div><div class="fn-glow"></div>
    <div class="fn-wrap">
      <header class="fn-head">
        <button class="fn-trophy" aria-label="${esc(F.again)}">${TROPHY}</button>
        <div class="fn-titles"><h1 class="say">${esc(F.title)}</h1><p class="say">${esc(F.sub)}</p></div>
        ${ui.speech.ok ? `<button class="say-btn small fn-say" data-say>${SAY_ICON}<span>Read to me</span></button>` : ''}
      </header>
      <div class="fn-grid">${parts.map((p, i) => `<section class="fn-q" style="--q:${p.theme};--qt:${p.light};animation-delay:${0.5 + i * 0.18}s">
        <div class="fn-q-top"><h2 class="say">${esc(W.modes[p.key])}</h2>${p.medal}</div>
        <div class="fn-stats">${p.stats}</div>${praise(p.praise)}</section>`).join('')}</div>
      <footer class="fn-foot">
        <p class="fn-overall say">${esc(fill(F.overall, { right, total, pct: pct(right, total) }))}</p>
        ${date ? `<p class="fn-date">${esc(fill(F.completed, { date }))}</p>` : ''}
        <div class="fn-btns"><button class="fn-btn ghost" data-more>🎆 ${esc(F.again)}</button><button class="fn-btn" data-close>${esc(F.close)}</button></div>
      </footer>
    </div>`;
  document.body.appendChild(back);
  const boom = () => ui.celebrate('', '', { msg: false, dur: 7 });
  boom();
  const t2 = setTimeout(() => { if (back.isConnected) boom(); }, 4200);
  const close = () => { clearTimeout(t2); ui.speech.stop(); back.classList.add('out'); setTimeout(() => back.remove(), 350); };
  back.querySelector('[data-close]').onclick = close;
  back.querySelector('[data-more]').onclick = boom;
  back.querySelector('.fn-trophy').onclick = boom;
  const sb = back.querySelector('[data-say]'); if (sb) sb.onclick = () => ui.speech.read(back.querySelector('.fn-wrap'), sb);
  return back;
}
