// =====================================================================
// Rock Cycle Explorer — the rock cycle: the 8 steps, the glowing grain
// of rock, the message at the top of the screen, the color flashes,
// and "A Rock's Journey" (students pick the order).
// All the words come from js/data/rockcycle.js.
// =====================================================================
import * as G from './geo.js';

// camera views used by some steps
const TRANSPORT_VIEW = { yaw: 0.36, pitch: 0.36, k: 0.8, target: [0.6, -0.5, 0.1] };
// when each line of the message appears (fraction of the animation; 'sea' = when the grain reaches the ocean)
const CUES = { transport: [0, 'sea'], compact: [0, 0.45], cement: [0, 0.5], heatp: [0, 0.96], cool: [0, 0.9] };
const MADE_COLOR = { cement: '#ffb74d', heatp: '#b39ddb', cool: '#ff7043', erupt: '#ff7043' };

export function createCycle(api, ui, D) {
  const { esc, icon } = ui;
  const $ = s => document.querySelector(s);
  const P = D.steps, R = D.rocks, ORDER = D.order;
  const st = { rock: D.start, pos: G.LOC[D.start].slice(), proc: '', last: null, journey: null, log: [], started: false };
  let anim = null, paused = false, speed = 1, savedView = null, viewTimer = 0, journeyTimer = 0;
  const COLOR = hex => parseInt(String(hex).replace('#', ''), 16);
  const nextOf = rock => ORDER.filter(k => P[k].from.includes(rock));
  const yellow = t => esc(t).replace(/\*(.+?)\*/g, '<span class="y">$1</span>');
  const plain = t => String(t).replace(/\*/g, '');

  // ---------- the menu bar ----------
  const dock = $('#dock');
  dock.innerHTML = ORDER.map(k => `<button class="dock-btn proc" data-p="${k}">${icon('p_' + k)}<span>${esc(P[k].button)}</span><em class="next-tag">${esc(D.startTag)}</em></button>`).join('') +
    `<button class="dock-btn journey" id="journeyBtn">${icon('journey')}<span>${esc(D.journey.button)}</span></button>`;
  dock.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { stopJourney(); ui.closePanels(); play(b.dataset.p); });
  const jBtn = $('#journeyBtn');
  jBtn.onclick = () => { ui.closePanels(); if (st.journey) { stopJourney(); render(); } else openPicker(); };

  // ---------- the message at the top: lines appear one by one and all of them stay ----------
  let bannerEl = null;
  function bannerStart() {
    const step = st.journey ? `<span class="b-step">Step ${st.journey.i} of ${st.journey.order.length}</span>` : '';
    bannerEl = ui.banner(step, 0, 'steps');
  }
  function bannerLine(k, i) {
    if (!bannerEl) return;
    const p = document.createElement('p');
    p.innerHTML = (i === 0 ? `<b>${esc(P[k].name)}:</b> ` : '') + yellow(P[k].text[i]);
    bannerEl.appendChild(p); ui.placeBanner();
  }
  function bannerMade(k) {
    if (!bannerEl || !P[k].made) return;
    const p = document.createElement('p'); p.className = 'made'; p.textContent = P[k].made;
    bannerEl.appendChild(p); ui.placeBanner();
  }

  // ---------- the rock card ----------
  function render() {
    const r = R[st.rock], p = P[st.proc];
    let h = `<div class="now">
        <span class="kicker">${anim ? 'The grain is changing from' : 'The grain is now'}</span>
        <h2><i class="dot" style="background:${r.color}"></i>${esc(r.name)}</h2>
        <p class="short">${esc(r.kind)}</p>
      </div>
      ${ui.part.facts([['Where', r.where], ['Temperature', r.temp]])}`;
    if (p) {
      h += `<div class="box proc">
          <h3>${icon('p_' + st.proc)}${esc(p.name)}</h3>
          ${anim ? `<p class="turning">Turning into: <b>${esc(R[p.to].name)}</b></p>` : ''}
          ${ui.part.bullets(p.text.map(plain).concat(p.made ? [p.made] : []))}
          ${ui.part.facts([['How long it takes', p.time], ['Energy', p.energy]], 'one')}
        </div>`;
    } else {
      h += `<div class="box proc intro"><h3>${icon('loop')}${esc(D.intro.title)}</h3><p>${esc(D.intro.text)}</p></div>`;
    }
    if (!anim) {
      h += `<div class="box nextbox"><h3>${icon('next')}What can happen next?</h3>
          <p>From here the rock can go:</p>
          <div class="next-btns">${nextOf(st.rock).map(k => `<button class="next-btn" data-np="${k}">${icon('p_' + k)}<span>${esc(P[k].name)}</span></button>`).join('')}</div>
        </div>`;
    }
    if (st.log.length) h += `<div class="box jbox"><h3>${icon('journey')}${esc(D.journey.title)}</h3><ol class="jlog">${st.log.map(t => `<li>${esc(t)}</li>`).join('')}</ol></div>`;
    const el = ui.setCard(h, { badge: anim ? 'Watch!' : 'Rock card', badgeColor: r.color, badgeIcon: 'rock' });
    el.querySelectorAll('[data-np]').forEach(b => b.onclick = () => { stopJourney(); play(b.dataset.np); });
    dock.querySelectorAll('[data-p]').forEach(b => {
      b.classList.toggle('on', !!anim && anim.k === b.dataset.p);
      b.classList.toggle('start', !st.started && b.dataset.p === ORDER[0]);
    });
    jBtn.classList.toggle('on', !!st.journey);
    jBtn.querySelector('span').textContent = st.journey ? D.journey.stopButton : D.journey.button;
    $('#replayBtn').disabled = !st.last;
  }

  // ---------- playing a step ----------
  function settle() {                      // a new step was chosen mid-way: finish the old one at once (quietly)
    if (!anim) return;
    const a = anim; anim = null;
    st.pos = a.pts[a.pts.length - 1].slice(); st.rock = P[a.k].to;
    api.grain.scale(1);
  }
  function restoreView(now) {
    clearTimeout(viewTimer);
    if (!savedView) return;
    const v = savedView;
    if (now) { savedView = null; api.flyTo(v, 1200); }
    else viewTimer = setTimeout(() => { savedView = null; api.flyTo(v, 1600); }, 2600);
  }
  function play(k, { replay = null } = {}) {
    settle();
    clearTimeout(journeyTimer);
    ui.clearFlare();
    if (k !== 'cement') restoreView(true);
    let hopFrom = null;
    if (replay) { st.rock = replay.rock; st.pos = replay.pos.slice(); }
    else if (!P[k].from.includes(st.rock)) {           // this step starts from a different rock: the grain hops there first
      hopFrom = st.pos.slice(); st.rock = P[k].from[0]; st.pos = G.LOC[st.rock].slice();
    }
    st.last = { k, rock: st.rock, pos: st.pos.slice() };
    const pts = G.makePath(k, st.pos);
    let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
    const dur = k === 'cement' ? 9 : Math.max(4.8, Math.min(8.5, 2.4 + len * 0.8));
    const n = P[k].text.length, c = CUES[k] || [];
    const cues = P[k].text.map((_, i) => {
      const v = c[i] ?? (i === 0 ? 0 : 0.9 * i / n);
      return v === 'sea' ? (pts.seaI || 0) / (pts.length - 1) : v;
    });
    st.proc = k; st.started = true;
    anim = { k, pts, t: 0, dur, cues, shown: 0, hop: hopFrom ? { from: hopFrom, t: 0, moved: false } : null, recolored: false, eruptFired: false };
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
    bannerStart();
    ui.setHud(`Watching: ${P[k].name}`);
    render();
  }
  function finish() {
    const a = anim; if (!a) return;
    anim = null; api.busy = false; api.fx.clear();
    st.pos = a.pts[a.pts.length - 1].slice(); st.rock = P[a.k].to;
    while (a.shown < P[a.k].text.length) bannerLine(a.k, a.shown++);
    api.grain.color(COLOR(R[st.rock].color));
    const sp = api.project(st.pos);
    if (P[a.k].made) {
      ui.flare(P[a.k].made, MADE_COLOR[a.k] || '#ffd84d', sp.x, sp.y);
      api.grain.pop();
      bannerMade(a.k);
    } else if (sp.ok) ui.burst(sp.x, sp.y, true);
    if (a.k === 'cement') restoreView(false);
    ui.setHud();
    render();
    if (st.journey) journeyTimer = setTimeout(journeyStep, (D.journey.pauseSeconds ?? 3) * 1000 + (P[a.k].made ? 1500 : 0));
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

  // ---------- pause, speed, replay (under the rock card) ----------
  const pauseBtn = $('#pauseBtn'), speedBtn = $('#speedBtn');
  function applyTime() { api.timeScale = paused ? 0 : speed; }
  pauseBtn.onclick = () => {
    paused = !paused; applyTime();
    pauseBtn.innerHTML = paused ? `${icon('play')}<span>Play</span>` : `${icon('pause')}<span>Pause</span>`;
    pauseBtn.classList.toggle('primary', paused);
  };
  speedBtn.onclick = () => {
    speed = speed === 1 ? 2 : speed === 2 ? 0.5 : 1; applyTime();
    speedBtn.querySelector('span').textContent = `Speed ${speed === 0.5 ? '½' : speed}×`;
  };
  $('#replayBtn').onclick = () => {
    const L = st.last; if (!L) return;
    stopJourney();
    if (paused) pauseBtn.click();
    anim = null;
    play(L.k, { replay: L });
  };

  // ---------- A Rock's Journey: students pick the order ----------
  function openPicker() {
    const J = D.journey, order = [];
    ui.closeModal();
    const back = document.createElement('div'); back.className = 'modal-back';
    back.innerHTML = `<div class="modal jpick" role="dialog" aria-modal="true" aria-label="${esc(J.title)}">
        <button class="close" data-x aria-label="Close">✕</button>
        <div class="jread">
          ${ui.speech.ok ? `<button class="say-btn small" data-say><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg><span>Read to me</span></button>` : ''}
          <h2>${esc(J.title)}</h2>
          <ol class="steps-list">${J.directions.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
        </div>
        <div class="jgrid">${ORDER.map(k => `<button class="jstep" data-k="${k}"><i class="jn"></i>${icon('p_' + k)}<span class="jt">${esc(P[k].name)}</span></button>`).join('')}</div>
        <p class="jorder" aria-live="polite"></p>
        <div class="jbtns"><button class="ghost" data-clear>${esc(J.startOver)}</button><button class="go" data-go disabled>${esc(J.play)}</button></div>
      </div>`;
    document.body.appendChild(back);
    const close = () => { ui.speech.stop(); back.remove(); };
    const update = () => {
      back.querySelectorAll('.jstep').forEach(b => {
        const i = order.indexOf(b.dataset.k);
        b.classList.toggle('picked', i >= 0); b.querySelector('.jn').textContent = i >= 0 ? i + 1 : '';
      });
      const left = ORDER.length - order.length;
      back.querySelector('.jorder').innerHTML = left ? `Pick <b>${left}</b> more step${left === 1 ? '' : 's'}.` : `<b>Ready!</b> Tap ${esc(J.play)}.`;
      back.querySelector('[data-go]').disabled = left > 0;
    };
    back.querySelectorAll('.jstep').forEach(b => b.onclick = () => {
      const i = order.indexOf(b.dataset.k);
      if (i >= 0) order.splice(i, 1); else order.push(b.dataset.k);
      update();
    });
    back.querySelector('[data-clear]').onclick = () => { order.length = 0; update(); };
    back.querySelector('[data-x]').onclick = close;
    back.querySelector('[data-go]').onclick = () => { if (order.length === ORDER.length) { close(); startJourney(order.slice()); } };
    const sb = back.querySelector('[data-say]'); if (sb) sb.onclick = () => ui.speech.read(back.querySelector('.jread'), sb);
    update();
  }
  function startJourney(order) {
    if (paused) pauseBtn.click();
    settle(); api.busy = false; api.fx.clear(); api.grain.set(st.pos); api.grain.color(COLOR(R[st.rock].color)); api.grain.scale(1);
    st.journey = { order, i: 0 };
    st.log = [];
    journeyStep();
  }
  function journeyStep() {
    const J = st.journey; if (!J) return;
    if (J.i >= J.order.length) {
      st.journey = null; render();
      ui.celebrate(D.journey.doneTitle, D.journey.doneSub);
      return;
    }
    const k = J.order[J.i]; J.i++;
    st.log.push(P[k].name);
    play(k);
  }
  function stopJourney() { if (st.journey) { st.journey = null; clearTimeout(journeyTimer); } }

  // ---------- start ----------
  requestAnimationFrame(() => ui.updateInsets());
  api.grain.set(st.pos);
  api.grain.color(COLOR(R[st.rock].color));
  render();
  return {
    st, play: k => { stopJourney(); play(k); }, startJourney, stopJourney, openPicker,
    isAnimating: () => !!anim, isPaused: () => paused, speed: () => speed, render
  };
}
