// =====================================================================
// Rock Cycle Explorer — the rock cycle: the 8 steps, the glowing grain
// of rock, the message at the top of the screen, the color flashes,
// and the "Start here" / "Next" tags in the menu bar.
// All the words and colors come from js/data/rockcycle.js.
// =====================================================================
import * as G from './geo.js';

// camera views used by some steps
const TRANSPORT_VIEW = { yaw: 0.36, pitch: 0.36, k: 0.8, target: [0.6, -0.5, 0.1] };
// when each line of the message appears (fraction of the animation; 'sea' = when the grain reaches the ocean)
const CUES = { transport: [0, 'sea'], compact: [0, 0.45], cement: [0, 0.5], heatp: [0, 0.96], cool: [0, 0.9] };

export function createCycle(api, ui, D) {
  const { esc, icon } = ui;
  const $ = s => document.querySelector(s);
  const P = D.steps, R = D.rocks, ORDER = D.order;
  const st = { rock: D.start, pos: G.LOC[D.start].slice(), proc: '', lastDone: '' };
  let anim = null, savedView = null, viewTimer = 0;
  const COLOR = hex => parseInt(String(hex).replace('#', ''), 16);
  const yellow = t => esc(t).replace(/\*(.+?)\*/g, '<span class="y">$1</span>');

  // ---------- the menu bar ----------
  const dock = $('#dock');
  dock.innerHTML = ORDER.map(k => `<button class="dock-btn proc" data-p="${k}">${icon('p_' + k)}<span>${esc(P[k].button)}</span><em class="next-tag"></em></button>`).join('');
  dock.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { ui.closePanels(); play(b.dataset.p); });
  // "Start here" before anything has played; then "Next" on the step after the last one played (main path, in menu order)
  function updateDock() {
    const next = st.lastDone ? ORDER[(ORDER.indexOf(st.lastDone) + 1) % ORDER.length] : ORDER[0];
    dock.querySelectorAll('[data-p]').forEach(b => {
      const k = b.dataset.p, tagged = !anim && k === next;
      b.classList.toggle('on', !!anim && anim.k === k);
      b.classList.toggle('start', tagged && !st.lastDone);
      b.classList.toggle('next', tagged && !!st.lastDone);
      b.querySelector('.next-tag').textContent = st.lastDone ? D.nextTag : D.startTag;
    });
  }

  // ---------- the message at the top: lines appear one by one and all of them stay ----------
  let bannerEl = null;
  function bannerStart() { bannerEl = ui.banner('', 0, 'steps'); }
  function bannerLine(k, i) {
    if (!bannerEl) return;
    const p = document.createElement('p');
    p.innerHTML = (i === 0 ? `<b>${esc(P[k].name)}:</b> ` : '') + yellow(P[k].text[i]);
    bannerEl.appendChild(p); ui.placeBanner();
  }
  function bannerMade(k) {
    if (!bannerEl || !P[k].made) return;
    const p = document.createElement('p'); p.className = 'made'; p.textContent = P[k].made;
    p.style.color = R[P[k].to].color;
    bannerEl.appendChild(p); ui.placeBanner();
  }

  // ---------- playing a step ----------
  function settle() {                      // a new step was chosen mid-way: finish the old one at once (quietly)
    if (!anim) return;
    const a = anim; anim = null;
    st.pos = a.pts[a.pts.length - 1].slice(); st.rock = P[a.k].to; st.lastDone = a.k;
    api.grain.scale(1);
  }
  function restoreView(now) {
    clearTimeout(viewTimer);
    if (!savedView) return;
    const v = savedView;
    if (now) { savedView = null; api.flyTo(v, 1200); }
    else viewTimer = setTimeout(() => { savedView = null; api.flyTo(v, 1600); }, 2600);
  }
  function play(k, { quiet = false } = {}) {     // quiet = no message at the top (used by Energy mode)
    settle();
    ui.clearFlare();
    if (k !== 'cement') restoreView(true);
    let hopFrom = null;
    if (!P[k].from.includes(st.rock)) {               // this step starts from a different rock: the grain hops there first
      hopFrom = st.pos.slice(); st.rock = P[k].from[0]; st.pos = G.LOC[st.rock].slice();
    }
    const pts = G.makePath(k, st.pos);
    let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
    const dur = k === 'cement' ? 9 : Math.max(4.8, Math.min(8.5, 2.4 + len * 0.8));
    const n = P[k].text.length, c = CUES[k] || [];
    const cues = P[k].text.map((_, i) => {
      const v = c[i] ?? (i === 0 ? 0 : 0.9 * i / n);
      return v === 'sea' ? (pts.seaI || 0) / (pts.length - 1) : v;
    });
    st.proc = k;
    anim = { k, pts, t: 0, dur, cues, shown: 0, hop: hopFrom ? { t: 0, moved: false } : null, recolored: false, eruptFired: false };
    api.fx.clear();
    if (k === 'erupt') api.fx.resetLava();
    api.grain.trailReset();
    api.busy = true;
    if (hopFrom) { api.grain.set(hopFrom); } else { api.grain.set(pts[0]); api.grain.color(COLOR(R[st.rock].color)); }
    // camera moves for some steps
    if (k === 'transport') api.flyTo(TRANSPORT_VIEW, 1800);
    if (k === 'cement') {
      clearTimeout(viewTimer);
      if (!savedView) savedView = api.getView();
      api.flyTo({ yaw: 0.2, pitch: 0.12, k: 0.3, target: st.pos.slice() }, 1600);
    }
    if (quiet) { bannerEl = null; } else { bannerStart(); ui.setHud(`Watching: ${P[k].name}`); }
    anim.quiet = quiet;
    updateDock();
  }
  function finish() {
    const a = anim; if (!a) return;
    anim = null; api.busy = false; api.fx.clear();
    st.pos = a.pts[a.pts.length - 1].slice(); st.rock = P[a.k].to; st.lastDone = a.k;
    while (a.shown < P[a.k].text.length) bannerLine(a.k, a.shown++);
    const color = R[st.rock].color;
    api.grain.color(COLOR(color));
    const sp = api.project(st.pos);
    if (P[a.k].made) {
      ui.flare(P[a.k].made, color, sp.x, sp.y);      // the flash is the same color as the new grain
      api.grain.pop();
      bannerMade(a.k);
    } else if (sp.ok) ui.burst(sp.x, sp.y, true);
    if (a.k === 'cement') restoreView(false);
    if (!a.quiet) ui.setHud();
    updateDock();
  }

  // ---------- the animation, every frame ----------
  api.frameHooks.add((rdt, sdt) => {
    if (!anim) return;
    const a = anim;
    if (a.hop) {                                   // the grain shrinks away, then pops up where this step starts
      const h = a.hop; h.t = Math.min(1, h.t + sdt / 0.8);
      if (h.t < 0.5) api.grain.scale(Math.max(0.01, 1 - h.t * 2));
      else {
        if (!h.moved) { h.moved = true; api.grain.set(a.pts[0]); api.grain.color(COLOR(R[st.rock].color)); api.grain.trailReset(); api.grain.pop(); }
        api.grain.scale(Math.min(1, (h.t - 0.5) * 2));
      }
      if (h.t >= 1) { a.hop = null; api.grain.scale(1); }
      return;
    }
    a.t = Math.min(1, a.t + sdt / a.dur);
    const pts = a.pts, f = a.t * (pts.length - 1), i0 = Math.floor(f), i1 = Math.min(pts.length - 1, i0 + 1), u = f - i0;
    const p = [0, 1, 2].map(j => pts[i0][j] + (pts[i1][j] - pts[i0][j]) * u);
    const k = a.k, t = a.t;
    if (k === 'cement') p[0] += 0.006 * Math.sin(t * 60);       // a tiny wiggle while it is glued
    api.grain.set(p);
    if (sdt > 0 && k !== 'cement') api.grain.trailPush(p);
    while (a.shown < a.cues.length && t >= a.cues[a.shown]) bannerLine(k, a.shown++);
    if (!a.recolored && t > 0.55 && !P[k].made) { a.recolored = true; api.grain.color(COLOR(R[P[k].to].color)); }
    // effects for each step
    api.fx.clear();
    if (k === 'weather' && t < 0.8) api.fx.cloud(pts[0]);
    if (k === 'compact' && G.onFace(p)) api.fx.arrows('down', p);
    if (k === 'cement') {
      if (t > 0.1 && t < 0.7) api.fx.seep(Math.min(1, (t - 0.1) * 6, (0.7 - t) * 8));
      if (t > 0.48) { api.fx.glue(Math.min(1, (t - 0.48) * 3)); api.fx.sparkle(Math.min(1, (t - 0.55) * 4), 0xffe082); }
    }
    if (k === 'heatp') { if (G.onFace(p)) api.fx.arrows('squeeze', p); api.fx.heat(Math.min(1, t * 1.6), 0xff7a20); }
    if (k === 'melt') api.fx.heat(Math.min(1.2, 0.3 + t * 1.4), 0xff5010);
    if (k === 'cool') { api.fx.heat(Math.max(0, 0.9 - t * 1.5), 0xff5010); if (t > 0.45) api.fx.sparkle(Math.min(1, (t - 0.45) * 3)); }
    if (k === 'erupt') {
      const fv = (pts.ventI || 1) / (pts.length - 1);
      if (t < fv) api.fx.heat(1, 0xff5010);
      if (!a.eruptFired && t >= fv) { a.eruptFired = true; api.fx.erupt(G.LAVL / Math.max(0.3, (1 - fv) * a.dur)); }
      if (t > 0.82) api.fx.sparkle(Math.min(1, (t - 0.82) * 5));
    }
    if (t >= 1) finish();
  });

  // ---------- start ----------
  requestAnimationFrame(() => ui.updateInsets());
  api.grain.set(st.pos);
  api.grain.color(COLOR(R[st.rock].color));
  updateDock();
  // back to the very beginning (used when switching modes)
  function reset() {
    anim = null; api.busy = false; api.fx.clear(); api.fx.resetLava();
    clearTimeout(viewTimer); savedView = null; ui.clearFlare(); ui.banner(null);
    st.rock = D.start; st.pos = G.LOC[D.start].slice(); st.proc = ''; st.lastDone = '';
    api.grain.trailReset(); api.grain.scale(1); api.grain.set(st.pos); api.grain.color(COLOR(R[st.rock].color));
    updateDock();
  }
  return { st, play: (k, o) => play(k, o), reset, isAnimating: () => !!anim };
}
