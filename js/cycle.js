// =====================================================================
// Rock Cycle Explorer — the rock cycle: the 8 processes, the glowing
// grain of rock, what can happen next, and "A Rock's Journey".
// All the words come from js/data/rockcycle.js.
// =====================================================================
import * as G from './geo.js';

export function createCycle(api, ui, D) {
  const { esc, icon } = ui;
  const $ = s => document.querySelector(s);
  const P = D.processes, R = D.rocks;
  const st = { rock: 'granite', proc: '', exposedAs: 'granite', metaFrom: null, pos: G.LOC.granite.slice(), last: null, journey: null, log: [] };
  let anim = null, paused = false, speed = 1, eruptFired = false;
  const COLOR = hex => parseInt(String(hex).replace('#', ''), 16);

  // ---------- what the grain is ----------
  function info(rock = st.rock, metaFrom = st.metaFrom, exposedAs = st.exposedAs) {
    if (rock === 'gneiss' && metaFrom === 'basalt') return R.amphibolite;
    if (rock === 'exposed') {
      const b = info(exposedAs, metaFrom);
      return { ...R.exposed, name: R.exposed.name.replace('{rock}', b.name), kind: b.kind, color: b.color };
    }
    return R[rock];
  }
  const lower = s => s.charAt(0).toLowerCase() + s.slice(1);
  const nextOf = rock => D.next[rock] || [];

  // ---------- the menu bar ----------
  const dock = $('#dock');
  dock.innerHTML = D.order.map(k => `<button class="dock-btn proc" data-p="${k}">${icon('p_' + k)}<span>${esc(P[k].button)}</span><em class="next-tag">Next</em></button>`).join('') +
    `<button class="dock-btn journey" id="journeyBtn">${icon('journey')}<span>${esc(D.journey.button)}</span></button>`;
  dock.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { stopJourney(); ui.closePanels(); play(b.dataset.p, true); });
  const jBtn = $('#journeyBtn');
  jBtn.onclick = () => {
    ui.closePanels();
    if (st.journey) { stopJourney(); render(); return; }
    ui.modal({
      title: D.journey.title, text: D.journey.text, icon: 'journey',
      buttons: [{ label: D.journey.go, onClick: startJourney }]
    });
  };

  // ---------- the card ----------
  function render() {
    const r = info(), p = P[st.proc];
    const goingTo = anim ? P[anim.k].to : null;
    const next = nextOf(st.rock);
    let h = `<div class="now">
        <span class="kicker">${anim ? 'The grain is changing from' : 'The grain is now'}</span>
        <h2><i class="dot" style="background:${r.color}"></i>${esc(r.name)}</h2>
        <p class="short">${esc(r.kind)}</p>
      </div>
      ${ui.part.facts([['Where', r.where], ['Temperature', r.temp]])}`;
    if (p) {
      h += `<div class="box proc">
          <h3>${icon('p_' + st.proc)}${esc(p.name)}</h3>
          ${anim ? `<p class="turning">Turning into: <b>${esc(goingTo)}</b></p>` : ''}
          ${ui.part.bullets(p.bullets)}
          ${ui.part.facts([['How long it takes', p.time], ['Energy', p.energy]], 'one')}
        </div>`;
    } else {
      h += `<div class="box proc intro"><h3>${icon('loop')}${esc(D.intro.title)}</h3><p>${esc(D.intro.text)}</p></div>`;
    }
    if (!anim) {
      h += `<div class="box nextbox"><h3>${icon('next')}What can happen next?</h3>
          <p>From here the rock can go:</p>
          <div class="next-btns">${next.map(k => `<button class="next-btn" data-np="${k}">${icon('p_' + k)}<span>${esc(P[k].name)}</span></button>`).join('')}</div>
        </div>`;
    }
    if (st.log.length) {
      h += `<div class="box jbox"><h3>${icon('journey')}${esc(D.journey.title)}</h3><ol class="jlog">${st.log.map(t => `<li>${esc(t)}</li>`).join('')}</ol></div>`;
    }
    const el = ui.setCard(h, { badge: anim ? 'Watch!' : 'Rock card', badgeColor: r.color, badgeIcon: 'rock' });
    el.querySelectorAll('[data-np]').forEach(b => b.onclick = () => { stopJourney(); play(b.dataset.np, true); });
    // menu bar: the running process, and the green "next" ones
    dock.querySelectorAll('[data-p]').forEach(b => {
      const k = b.dataset.p;
      b.classList.toggle('on', !!anim && anim.k === k);
      b.classList.toggle('next', !anim && next.includes(k));
    });
    jBtn.classList.toggle('on', !!st.journey);
    jBtn.querySelector('span').textContent = st.journey ? D.journey.stopButton : D.journey.button;
    $('#replayBtn').disabled = !st.last;
  }

  // ---------- playing a process ----------
  function settle() {                       // a new process was chosen mid-way: finish the old one at once
    if (!anim) return false;
    const a = anim; anim = null;
    st.pos = a.pts[a.pts.length - 1].slice();
    arrive(a.k);
    return true;
  }
  function arrive(k) {
    const to = { weather: 'sediment', transport: 'deposit', compact: 'sandstone', heatp: 'gneiss', melt: 'magma', intrude: 'granite', erupt: 'basalt', uplift: 'exposed' }[k];
    if (k === 'heatp') st.metaFrom = st.rock === 'exposed' ? st.exposedAs : st.rock;
    else if (to !== 'exposed') st.metaFrom = null;
    if (to === 'exposed') st.exposedAs = st.rock === 'exposed' ? st.exposedAs : (['magma', 'sediment', 'deposit'].includes(st.rock) ? 'granite' : st.rock);
    st.rock = to;
  }
  function play(k, user, replay = false) {
    let jumped = settle() || replay, jumpMsg = '';
    if (user && !nextOf(st.rock).includes(k)) {             // this can't happen to the rock right now: jump to a rock it can happen to
      const s0 = D.startFrom[k];
      if (s0 === 'exposed') st.exposedAs = 'granite';
      st.rock = s0; st.metaFrom = null; st.pos = G.LOC[s0].slice(); jumped = true;
      jumpMsg = D.jumpText.replace('{process}', esc(P[k].name)).replace('{rock}', `<span class="hl">${esc(lower(info().name))}</span>`);
    }
    st.last = { k, rock: st.rock, pos: st.pos.slice(), exposedAs: st.exposedAs, metaFrom: st.metaFrom };
    const pts = G.makePath(k, st.pos);
    let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
    const dur = Math.max(4.6, Math.min(8, 2.2 + len * 0.75));
    st.proc = k;
    anim = { k, pts, t: 0, dur, jumped, from: info() };
    eruptFired = false;
    api.fx.clear();
    if (k === 'erupt') api.fx.resetLava();
    api.grain.trailReset();
    api.grain.color(COLOR(info().color));
    api.grain.set(pts[0]);
    if (jumped) api.grain.pop();
    api.busy = true;
    ui.banner(`<b>${esc(P[k].name)}</b> → ${esc(P[k].to)}${jumpMsg ? `<small>${jumpMsg}</small>` : ''}`, 0);
    ui.setHud(`Watching: ${P[k].name}`);
    render();
  }
  function finish() {
    const a = anim; if (!a) return;
    st.pos = a.pts[a.pts.length - 1].slice();
    anim = null; api.busy = false;
    api.fx.clear();
    arrive(a.k);
    const r = info();
    api.grain.color(COLOR(r.color));
    const sp = api.project(st.pos); if (sp.ok) ui.burst(sp.x, sp.y, true);
    ui.banner(`The grain is now <span class="hl">${esc(lower(r.name))}</span>.`, 4500);
    ui.setHud();
    render();
    if (st.journey) setTimeout(journeyStep, 900);
  }

  // ---------- the animation, every frame ----------
  api.frameHooks.add((rdt, sdt) => {
    if (!anim) return;
    const a = anim;
    a.t = Math.min(1, a.t + sdt / a.dur);
    const pts = a.pts, f = a.t * (pts.length - 1), i0 = Math.floor(f), i1 = Math.min(pts.length - 1, i0 + 1), u = f - i0;
    const p = [0, 1, 2].map(j => pts[i0][j] + (pts[i1][j] - pts[i0][j]) * u);
    api.grain.set(p);
    if (sdt > 0) api.grain.trailPush(p);
    const k = a.k, t = a.t;
    // the grain's color changes partway through
    if (t > 0.55 && !a.recolored) {
      a.recolored = true;
      const to = { weather: 'sediment', transport: 'deposit', compact: 'sandstone', heatp: st.rock === 'basalt' ? 'amphibolite' : 'gneiss', melt: 'magma', intrude: 'granite', erupt: 'basalt' }[k];
      if (to) api.grain.color(COLOR(R[to].color));
    }
    // effects for each process
    api.fx.clear();
    if (k === 'weather' && t < 0.8) api.fx.cloud(pts[0]);
    if (k === 'compact' && G.onFace(p)) api.fx.arrows('down', p);
    if (k === 'heatp') { if (G.onFace(p)) api.fx.arrows('squeeze', p); api.fx.heat(Math.min(1, t * 1.6), 0xff7a20); }
    if (k === 'melt') api.fx.heat(Math.min(1.2, 0.3 + t * 1.4), 0xff5010);
    if (k === 'intrude') { api.fx.heat(Math.max(0, 0.9 - t * 1.5), 0xff5010); if (t > 0.45) api.fx.sparkle(Math.min(1, (t - 0.45) * 3)); }
    if (k === 'uplift' && G.onFace(p)) { api.fx.arrows('up', p); api.fx.column(p); }
    if (k === 'erupt') {
      const fv = (pts.ventI || 1) / (pts.length - 1);
      if (t < fv) api.fx.heat(1, 0xff5010);
      if (!eruptFired && t >= fv) { eruptFired = true; api.fx.erupt(G.LAVL / Math.max(0.3, (1 - fv) * a.dur)); }
      if (t > 0.82) api.fx.sparkle(Math.min(1, (t - 0.82) * 5));
    }
    if (t >= 1) finish();
  });

  // ---------- pause, speed, replay ----------
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
    st.rock = L.rock; st.pos = L.pos.slice(); st.exposedAs = L.exposedAs; st.metaFrom = L.metaFrom;
    play(L.k, false, true);
  };

  // ---------- A Rock's Journey ----------
  function startJourney() {
    if (paused) pauseBtn.click();
    if (anim) { settle(); api.busy = false; api.fx.clear(); api.grain.set(st.pos); api.grain.color(COLOR(info().color)); }
    st.journey = { n: 0 };
    st.log = [`Start: ${lower(info().name)}`];
    journeyStep();
  }
  function journeyStep() {
    const J = st.journey; if (!J) return;
    if (J.n >= (D.journey.steps || 8)) {
      st.journey = null; render();
      ui.celebrate(D.journey.doneTitle, D.journey.doneSub);
      return;
    }
    const opts = nextOf(st.rock), k = opts[Math.floor(Math.random() * opts.length)];
    J.n++;
    const toName = k === 'heatp' && st.rock === 'basalt' ? R.amphibolite.name : P[k].to;
    st.log.push(`${P[k].name} → ${lower(toName)}`);
    play(k, false);
  }
  function stopJourney() { if (st.journey) { st.journey = null; } }

  // ---------- start ----------
  requestAnimationFrame(() => ui.updateInsets());
  api.grain.set(st.pos);
  api.grain.color(COLOR(R.granite.color));
  render();
  return {
    st, play: k => { stopJourney(); play(k, true); }, startJourney, stopJourney,
    isAnimating: () => !!anim, isPaused: () => paused, speed: () => speed, render
  };
}
