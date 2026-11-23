// =====================================================================
// Rock Cycle Explorer — Rock Types mode.
//   12 glowing crystals sit on the 3D model where each rock really forms.
//   Tap one: a pop-up with a real photo and facts. Close it: the crystal
//   becomes a little cartoon rock to drag into Igneous, Sedimentary or
//   Metamorphic at the bottom. One rock at a time. When all 12 are sorted,
//   the Rock Types Quiz: tap 2 rocks of each kind.
// All the words are in js/data/rocktypes.js.
// =====================================================================
import { FZ, ZF, VX, H, Hf, fold, gneissY } from './geo.js';

// where each crystal sits on the 3D model (block coordinates; FZ = just in front of the cut face)
const ON_GROUND = (x, z, up = 0.13) => [x, H(x, z) + up, z];
const ON_FACE = (x, y) => [x, y, FZ + 0.12];
const SPOTS = {
  granite:   () => ON_FACE(-2.35, -1.45),                 // the big blob of igneous rock that cooled underground
  basalt:    () => ON_GROUND(1.75, ZF - 0.3),             // the lava flow
  obsidian:  () => ON_GROUND(0.33, ZF - 0.3),             // the side of the volcano
  pumice:    () => ON_GROUND(VX + 0.05, ZF - 0.62, 0.16), // near the top of the volcano
  sandstone: () => ON_FACE(1.45, Hf(1.45) - 0.38),        // sand layers under the river plain
  limestone: () => ON_FACE(3.35, Hf(3.35) - 0.42),        // under the sea floor
  coal:      () => ON_FACE(-0.7, Hf(-0.7) - 0.62),        // an old swamp layer
  rocksalt:  () => ON_FACE(2.6, fold(2.6) - 1.12),        // deep, where an old sea dried up
  marble:    () => ON_FACE(2.12, gneissY(2.12) + 0.05),   // baked next to the magma chamber
  slate:     () => ON_FACE(3.35, gneissY(3.35) + 0.18),   // the squeezed metamorphic layer
  gneiss:    () => ON_FACE(-0.75, -1.45),                 // the wavy metamorphic band
  quartzite: () => ON_FACE(-3.4, gneissY(-3.4))           // squeezed deep under the mountains
};
const KINDS = ['igneous', 'sedimentary', 'metamorphic'];
// bright crystal colors, handed out at random (never tied to the kind of rock)
const GEM_COLORS = ['#ff4fd8', '#4fe3ff', '#ffd84d', '#7dff8a', '#ff8a3d', '#a98bff', '#ff5a7a', '#3dffc8', '#ffffff', '#5aa8ff', '#e0ff4f', '#ff9ef0'];
const SAY_ICON = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
const shuffled = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// ---------- little cartoon rocks (SVG, 64 x 64) ----------
const LOOK = {
  granite:   { base: '#e8c2b8', edge: '#8c6e66' }, basalt:    { base: '#55585f', edge: '#26272b' },
  obsidian:  { base: '#16161b', edge: '#000000' }, pumice:    { base: '#efebe2', edge: '#a89f8e' },
  sandstone: { base: '#e6c48a', edge: '#9c7440' }, limestone: { base: '#cfc8b2', edge: '#857c66' },
  coal:      { base: '#1d1d20', edge: '#000000' }, rocksalt:  { base: '#f6b8c4', edge: '#b5677a' },
  marble:    { base: '#f6f6f3', edge: '#a9a9a4' }, slate:     { base: '#4c5462', edge: '#262b33' },
  gneiss:    { base: '#efefef', edge: '#7a7a7a' }, quartzite: { base: '#dc9fa1', edge: '#9a5f62' }
};
let iconN = 0;
export function rockIcon(key) {
  const L = LOOK[key] || LOOK.granite, r = rng(7 + key.length * 131 + key.charCodeAt(0)), id = 'ri' + (iconN++);
  // a lumpy rock outline
  let d = '';
  const n = 9, flat = key === 'slate' ? 0.55 : 0.78;
  for (let i = 0; i <= n; i++) {
    const a = (i % n) / n * Math.PI * 2, rr = 23 + r() * 5;
    d += (i ? 'L' : 'M') + (Math.cos(a) * rr * 1.08).toFixed(1) + ',' + (Math.sin(a) * rr * flat + 2).toFixed(1);
  }
  let tex = '';
  const dots = (cnt, colors, s0, s1) => { for (let i = 0; i < cnt; i++) { const x = -22 + r() * 44, y = -14 + r() * 30; tex += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(s0 + r() * (s1 - s0)).toFixed(1)}" fill="${colors[i % colors.length]}"/>`; } };
  if (key === 'granite') dots(46, ['#1d1d1d', '#ffffff', '#d98a86', '#9d8f8c'], 0.9, 2.2);
  if (key === 'basalt') { dots(30, ['#6b6e75'], 0.4, 0.9); for (let i = 0; i < 8; i++) { const x = -18 + r() * 36, y = -10 + r() * 22; tex += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(1.5 + r() * 2.5).toFixed(1)}" ry="${(1.2 + r() * 1.8).toFixed(1)}" fill="#1c1d21" stroke="#7a7d84" stroke-width=".7"/>`; } }
  if (key === 'obsidian') tex += `<path d="M-14,-6 C-6,-14 8,-14 16,-6" stroke="#fff" stroke-width="2.4" opacity=".7" fill="none" stroke-linecap="round"/><path d="M-6,4 C0,0 6,0 10,4" stroke="#fff" stroke-width="1.5" opacity=".45" fill="none" stroke-linecap="round"/>`;
  if (key === 'pumice') dots(34, ['#b9b09e', '#cfc7b6'], 0.7, 1.8);
  if (key === 'sandstone') { tex += `<path d="M-24,-2 C-8,-5 8,1 24,-2 M-24,8 C-8,5 8,11 24,8" stroke="#b98c4a" stroke-width="2" opacity=".5" fill="none"/>`; dots(60, ['#a57d43', '#f2dcae'], 0.4, 0.8); }
  if (key === 'limestone') { tex += `<path d="M-8,-2 a4,4 0 1 1 4,4 a6,6 0 1 1 -8,-6" stroke="#6f6754" stroke-width="1.4" fill="none"/><path d="M8,6 l-6,-10 l12,0 z" fill="#e6dfc8" stroke="#6f6754" stroke-width="1.1"/><path d="M5,-4 l3,9 M8,-4 l0,9 M11,-4 l-3,9" stroke="#6f6754" stroke-width=".8"/>`; dots(16, ['#9f977f'], 0.5, 1); }
  if (key === 'coal') { tex += `<path d="M-14,-8 L-2,-12 L6,-2 L-6,2 Z" fill="#3c3c44"/><path d="M4,4 L16,0 L18,10 L8,12 Z" fill="#33333a"/><path d="M-10,-6 L-3,-9" stroke="#fff" stroke-width="1.6" opacity=".55" stroke-linecap="round"/>`; }
  if (key === 'marble') tex += `<path d="M-20,-6 C-10,0 -6,-10 4,-2 S16,2 22,-4 M-14,10 C-6,6 2,14 12,8" stroke="#a7acb4" stroke-width="1.3" fill="none"/>`;
  if (key === 'slate') tex += `<path d="M-24,-6 H24 M-24,0 H24 M-24,6 H24" stroke="#6b7484" stroke-width="1.2"/><path d="M-12,-8 L-2,-9" stroke="#9aa3b2" stroke-width="1.4" opacity=".7"/>`;
  if (key === 'gneiss') tex += `<path d="M-26,-8 C-14,-14 -6,-2 4,-8 S18,-14 26,-8 M-26,2 C-14,-4 -6,8 4,2 S18,-4 26,2 M-26,11 C-14,6 -6,16 4,11 S18,6 26,11" stroke="#262626" stroke-width="3" fill="none"/>`;
  if (key === 'quartzite') dots(70, ['#f7dede', '#b97376', '#ffffff'], 0.5, 1.1);
  const body = key === 'rocksalt'
    ? `<g stroke="#9b5266" stroke-width="1.8" stroke-linejoin="round"><path d="M-22,-4 l12,-6 l12,6 l0,16 l-12,6 l-12,-6 z" fill="#f2a6b8"/><path d="M-22,-4 l12,6 l12,-6 M-10,2 v16" fill="none"/><path d="M0,-12 l11,-5 l11,5 l0,14 l-11,5 l-11,-5 z" fill="#f8c6d1"/><path d="M0,-12 l11,5 l11,-5 M11,-7 v14" fill="none"/></g><path d="M-18,-4 l6,-3 M4,-12 l5,-2" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`
    : `<clipPath id="${id}"><path d="${d}Z"/></clipPath><path d="${d}Z" fill="url(#${id}g)"/><g clip-path="url(#${id})">${tex}</g><path d="${d}Z" fill="none" stroke="${L.edge}" stroke-width="2.2" stroke-linejoin="round"/>`;
  return `<svg viewBox="-32 -32 64 64" class="rk-ico" aria-hidden="true"><defs><radialGradient id="${id}g" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="${L.base}"/><stop offset="1" stop-color="${L.base}"/></radialGradient></defs><ellipse cx="0" cy="24" rx="20" ry="4" fill="#000" opacity=".25"/>${body}</svg>`;
}

export function createRocks(api, ui, R, energy) {
  const THREE = api.THREE, esc = ui.esc, $ = s => document.querySelector(s);
  const KEYS = Object.keys(R.rocks);
  const fill = (t, o) => String(t).replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
  const kindName = k => R.kinds[k].name.toLowerCase();

  // ---------- the Modes menu button ----------
  const mb = document.createElement('button');
  mb.className = 'rail-btn'; mb.dataset.mode = 'rocks'; mb.setAttribute('aria-pressed', 'false');
  mb.innerHTML = `<svg viewBox="0 0 24 24"><path d="M7 3h10l4 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 6 3-6M12 21 9 9M12 21l3-12"/></svg><span>${esc(R.button)}</span>`;
  mb.onclick = () => energy.setMode('rocks');
  $('#modes').appendChild(mb);

  // ---------- the crystals (3D) ----------
  const group = new THREE.Group(); group.visible = false; api.block.add(group);
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const starTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.translate(32, 32); g.fillStyle = '#fff'; for (const s of [1, 0.45]) { g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 4 * s : 30 * s; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.rotate(Math.PI / 4); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const V2 = (x, y) => new THREE.Vector2(x, y);
  function shapeGeo(i) {
    let g;
    switch (i % 7) {
      case 0: g = new THREE.OctahedronGeometry(0.12); g.scale(1, 1.55, 1); break;                                     // tall diamond
      case 1: g = new THREE.LatheGeometry([V2(0, -0.17), V2(0.075, -0.09), V2(0.075, 0.08), V2(0, 0.18)], 6); break;   // six-sided crystal
      case 2: g = new THREE.IcosahedronGeometry(0.12); break;                                                         // round gem
      case 3: g = new THREE.LatheGeometry([V2(0, -0.15), V2(0.14, 0.02), V2(0.1, 0.08), V2(0, 0.08)], 8); break;       // cut jewel
      case 4: g = new THREE.DodecahedronGeometry(0.115); break;                                                       // chunky gem
      case 5: g = new THREE.LatheGeometry([V2(0, -0.2), V2(0.07, 0), V2(0, 0.2)], 4); break;                           // long spike
      default: g = new THREE.TetrahedronGeometry(0.15); break;                                                        // pyramid
    }
    if (g.index) g = g.toNonIndexed(); g.computeVertexNormals();
    return g;
  }
  const gemMat = color => new THREE.ShaderMaterial({
    uniforms: { uCol: { value: new THREE.Color(color) }, uDim: { value: 0 }, uPulse: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vP = mv.xyz; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uCol; uniform float uDim; uniform float uPulse; varying vec3 vN; varying vec3 vP;
      void main(){ vec3 n = normalize(vN), v = normalize(-vP), L = normalize(vec3(.4,.8,.6));
        float d = max(dot(n,L),0.), rim = pow(1. - max(dot(n,v),0.), 2.), sp = pow(max(dot(reflect(-L,n),v),0.), 20.);
        vec3 c = uCol * (.45 + .7 * d) + vec3(1.) * sp * 1.1 + uCol * rim * .9 + uCol * uPulse * .3 + vec3(.15) * (1. - d);
        float g = dot(c, vec3(.3,.59,.11)); c = mix(c, vec3(g) * .45, uDim);
        gl_FragColor = vec4(min(c, vec3(1.)), 1.); }`
  });
  const colors = shuffled(GEM_COLORS);
  const gems = {};
  KEYS.forEach((k, i) => {
    const pos = (SPOTS[k] || (() => [0, 0, FZ + 0.12]))(), color = colors[i % colors.length];
    const g = new THREE.Group(); g.position.set(...pos); g.scale.setScalar(1.45);     // bigger, so they're easy to see and tap
    const meshes = [];
    const add = (geo, s, x = 0, y = 0, rz = 0) => { const m = new THREE.Mesh(geo, gemMat(color)); m.scale.setScalar(s); m.position.set(x, y, 0); m.rotation.z = rz; g.add(m); meshes.push(m); };
    if (i % 4 === 3) { const geo = shapeGeo(1); add(geo, 1.05); add(geo, 0.7, -0.07, -0.03, 0.5); add(geo, 0.6, 0.07, -0.04, -0.45); }   // a little cluster
    else add(shapeGeo(i), 0.95 + (i % 3) * 0.12);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 }));
    glow.scale.setScalar(0.62); g.add(glow);
    const stars = [0, 1, 2].map(j => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.scale.setScalar(0.1); g.add(s); return s; });
    group.add(g);
    gems[k] = { key: k, g, meshes, glow, stars, pos, color, phase: i * 1.7, base: pos[1] };
  });

  // ---------- state ----------
  let active = false, mode = 'learn', current = null, popup = null, quizBack = null, hintBack = null, lastHint = -1, tk = 0;
  const P = () => ui.progress;
  const sorted = () => (P() ? P().rocksSorted() : {});
  const sortedCount = () => KEYS.filter(k => sorted()[k]).length;

  function setGemStates() {
    const s = sorted();
    for (const k of KEYS) {
      const gm = gems[k];
      const sortedNow = !!s[k], review = mode === 'review';
      gm.g.visible = review || (!sortedNow && current !== k);
      gm.dim = !review && !!current && current !== k;
    }
    api.requestRender();
  }
  api.frameHooks.add((rdt, sdt, now) => {
    if (!active) return;
    const t = now / 1000;
    for (const k of KEYS) {
      const gm = gems[k]; if (!gm.g.visible) continue;
      gm.g.position.y = gm.base + Math.sin(t * 1.6 + gm.phase) * 0.03;
      gm.meshes.forEach((m, j) => { m.rotation.y += rdt * (0.9 + j * 0.3); m.material.uniforms.uDim.value = gm.dim ? 0.75 : 0; m.material.uniforms.uPulse.value = gm.dim ? 0 : 0.5 + 0.5 * Math.sin(t * 3 + gm.phase); });
      gm.glow.material.opacity = gm.dim ? 0.12 : 0.65 + 0.3 * Math.sin(t * 2.4 + gm.phase);
      gm.glow.scale.setScalar((gm.dim ? 0.4 : 0.6) * (1 + 0.12 * Math.sin(t * 2.4 + gm.phase)));
      gm.stars.forEach((s, j) => {
        const a = t * (0.9 + j * 0.25) + gm.phase + j * 2.1, rr = 0.15 + 0.05 * Math.sin(t * 1.3 + j);
        s.position.set(Math.cos(a) * rr, 0.04 + Math.sin(a * 1.3) * 0.1, Math.sin(a) * rr * 0.5 + 0.05);
        const tw = Math.max(0, Math.sin(t * 3.2 + j * 2 + gm.phase)); s.material.opacity = gm.dim ? 0 : tw * tw;
        s.scale.setScalar(0.05 + 0.07 * tw);
      });
    }
    if (iconEl && !dragging && !flying) placeIcon();
  });

  // ---------- tapping a crystal ----------
  const cv = api.renderer.domElement; let down = null;
  cv.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  cv.addEventListener('pointerup', e => {
    if (!active || !down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t; down = null;
    if (moved > 12 || dt > 700 || popup || quizBack) return;
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = null, bd = 50;
    for (const k of KEYS) {
      const gm = gems[k]; if (!gm.g.visible) continue;
      const p = api.project([gm.g.position.x, gm.g.position.y, gm.g.position.z]); if (!p.ok) continue;
      const dd = Math.hypot(p.x - x, p.y - y); if (dd < bd) { bd = dd; best = k; }
    }
    if (!best) return;
    if (mode === 'learn' && current && current !== best) { ui.setHud(R.hudBusy); pulseIcon(); return; }
    openPopup(best);
  });

  // ---------- the rock pop-up ----------
  function closePopup() { if (popup) { popup.remove(); popup = null; ui.speech.stop(); } }
  function openPopup(k) {
    closePopup();
    const rk = R.rocks[k], kd = R.kinds[rk.kind], Lb = R.labels, review = mode === 'review' || !!sorted()[k];
    popup = document.createElement('div'); popup.className = 'modal-back rk-back';
    const row = (ic, label, text) => text ? `<div class="rk-row"><i>${ic}</i><p class="say"><b>${esc(label)}:</b> ${esc(text)}</p></div>` : '';
    popup.innerHTML = `<div class="rk-pop" role="dialog" aria-modal="true" aria-label="${esc(rk.name)}" style="--g:${gems[k].color};--k:${kd.color}">
      <button class="close" aria-label="Close">✕</button>
      <div class="rk-photo"><img src="assets/rocks/${esc(rk.photo.file)}" alt="${esc(rk.name)}"><span class="rk-credit">${esc(R.photoBy)}: ${esc(rk.photo.by)} · ${esc(rk.photo.license)}</span></div>
      <div class="rk-body">
        <div class="rk-head"><h2 class="say">${esc(rk.name)}</h2>${ui.speech.ok ? `<button class="say-btn small" data-say>${SAY_ICON}<span>Read to me</span></button>` : ''}</div>
        <p class="rk-kind say">${esc(kd.name)} rock</p>
        ${row('🔥', Lb.forms, rk.forms)}${row('🔄', Lb.startsAs, rk.startsAs)}${row('📍', Lb.found, rk.found)}${row('🛠️', Lb.used, rk.used)}${row('⭐', Lb.wow, rk.wow)}
        <button class="rk-go">${esc(review ? R.popupButtonReview : R.popupButton)}</button>
      </div></div>`;
    document.body.appendChild(popup);
    const done = () => { closePopup(); if (!review) makeIcon(k); };
    popup.querySelector('.rk-go').onclick = done;
    popup.querySelector('.close').onclick = done;
    const sb = popup.querySelector('[data-say]'); if (sb) sb.onclick = () => ui.speech.read(popup.querySelector('.rk-body'), sb);
  }

  // ---------- the cartoon rock to drag ----------
  let iconEl = null, dragging = false, flying = false;
  function iconHome() { const gm = gems[current], r = cv.getBoundingClientRect(), p = api.project([gm.g.position.x, gm.base, gm.g.position.z]); return { x: r.left + p.x, y: r.top + p.y }; }
  function placeIcon() { if (!iconEl || !current) return; const h = iconHome(); iconEl.style.left = h.x + 'px'; iconEl.style.top = h.y + 'px'; }
  function pulseIcon() { if (!iconEl) return; iconEl.classList.remove('nudge'); void iconEl.offsetWidth; iconEl.classList.add('nudge'); }
  function makeIcon(k) {
    current = k; setGemStates(); showBins(true);
    iconEl = document.createElement('div'); iconEl.className = 'rk-drag'; iconEl.style.setProperty('--g', gems[k].color);
    iconEl.innerHTML = `${rockIcon(k)}<span class="rk-name">${esc(R.rocks[k].name)}</span><em class="rk-tag">${esc(R.dragMe)}</em>`;
    document.body.appendChild(iconEl);
    placeIcon(); iconEl.classList.add('appear');
    ui.setHud(R.hudDrag);
    iconEl.addEventListener('pointerdown', startDrag);
  }
  function removeIcon() { if (iconEl) { iconEl.remove(); iconEl = null; } dragging = false; flying = false; }
  function startDrag(e) {
    if (!iconEl || flying) return;
    e.preventDefault(); dragging = true; iconEl.classList.add('lifted');
    try { iconEl.setPointerCapture(e.pointerId); } catch (_) {}
    const move = ev => { iconEl.style.left = ev.clientX + 'px'; iconEl.style.top = ev.clientY + 'px'; hoverBin(ev.clientX, ev.clientY); };
    const up = ev => {
      iconEl.removeEventListener('pointermove', move); iconEl.removeEventListener('pointerup', up); iconEl.removeEventListener('pointercancel', up);
      dragging = false; iconEl.classList.remove('lifted'); hoverBin(-1, -1);
      const bin = ev.type === 'pointerup' ? binAt(ev.clientX, ev.clientY) : null;
      if (!bin) { flyTo(iconHome(), null); return; }
      if (bin.dataset.kind === R.rocks[current].kind) correct(bin); else wrong(bin);
    };
    iconEl.addEventListener('pointermove', move); iconEl.addEventListener('pointerup', up); iconEl.addEventListener('pointercancel', up);
    move(e);
  }
  function flyTo(to, then, ms = 380) {
    if (!iconEl) return;
    flying = true;
    const x0 = parseFloat(iconEl.style.left), y0 = parseFloat(iconEl.style.top), t0 = performance.now(), my = tk;
    const step = now => {
      if (my !== tk || !iconEl) return;
      const f = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - f, 3);
      iconEl.style.left = x0 + (to.x - x0) * e + 'px'; iconEl.style.top = y0 + (to.y - y0) * e + 'px';
      if (f < 1) requestAnimationFrame(step); else { flying = false; if (then) then(); }
    };
    requestAnimationFrame(step);
  }

  // ---------- the 3 category boxes at the bottom ----------
  const bins = document.createElement('div'); bins.id = 'rkBins'; bins.hidden = true;
  bins.innerHTML = `<div class="rk-bar"><span class="rk-count"></span><span class="rk-actions"></span></div>
    <div class="rk-bins">${KINDS.map(k => `<div class="rk-bin" data-kind="${k}" style="--k:${R.kinds[k].color}">
      <div class="rk-bin-head"><b>${esc(R.kinds[k].name)}</b><span>${esc(R.kinds[k].about)}</span></div>
      <div class="rk-slots">${[0, 1, 2, 3].map(() => '<div class="rk-slot"></div>').join('')}</div></div>`).join('')}</div>`;
  document.body.appendChild(bins);
  function showBins(dramatic) {
    if (!bins.hidden) return;
    bins.hidden = false;
    if (dramatic) { bins.classList.remove('enter'); void bins.offsetWidth; bins.classList.add('enter'); }
    requestAnimationFrame(() => ui.updateInsets());
  }
  function fillBins() {
    const s = sorted();
    KINDS.forEach(kind => {
      const slots = bins.querySelectorAll(`.rk-bin[data-kind="${kind}"] .rk-slot`);
      const ks = KEYS.filter(k => R.rocks[k].kind === kind && s[k]);
      slots.forEach((sl, i) => { const k = ks[i]; sl.dataset.rock = k || ''; sl.classList.toggle('full', !!k); sl.innerHTML = k ? `${rockIcon(k)}<span>${esc(R.rocks[k].name)}</span>` : ''; });
    });
    const n = sortedCount();
    bins.querySelector('.rk-count').textContent = fill(R.counter, { n });
    const acts = bins.querySelector('.rk-actions');
    acts.innerHTML = n === KEYS.length ? `<button class="rk-btn go" data-quiz>${esc(R.takeQuiz)}</button><button class="rk-btn" data-over>${esc(R.startOver)}</button>` : '';
    const q = acts.querySelector('[data-quiz]'); if (q) q.onclick = openQuizIntro;
    const o = acts.querySelector('[data-over]'); if (o) o.onclick = startOver;
  }
  bins.addEventListener('click', e => {           // tap a sorted rock to read about it again
    const sl = e.target.closest('.rk-slot.full'); if (sl && !current && !quizBack) openPopup(sl.dataset.rock);
  });
  function binAt(x, y) {
    for (const b of bins.querySelectorAll('.rk-bin')) { const r = b.getBoundingClientRect(); if (x > r.left - 12 && x < r.right + 12 && y > r.top - 24 && y < r.bottom + 12) return b; }
    return null;
  }
  function hoverBin(x, y) { const h = x < 0 ? null : binAt(x, y); bins.querySelectorAll('.rk-bin').forEach(b => b.classList.toggle('hover', b === h)); }
  function flash(b, cls) { b.classList.remove('gold', 'bad'); void b.offsetWidth; b.classList.add(cls); }

  function correct(bin) {
    const k = current, kind = R.rocks[k].kind, my = tk;
    flash(bin, 'gold');
    const r = bin.getBoundingClientRect(); ui.burst(r.left + r.width / 2, r.top + 30, false, '#ffd84d');
    const slot = [...bin.querySelectorAll('.rk-slot')].find(s => !s.classList.contains('full'));
    const sr = (slot || bin).getBoundingClientRect();
    iconEl.classList.add('into');
    flyTo({ x: sr.left + sr.width / 2, y: sr.top + sr.height / 2 }, () => {
      if (my !== tk) return;
      removeIcon(); current = null;
      if (P()) P().rockSorted(k);
      fillBins();
      const sl = [...bin.querySelectorAll('.rk-slot')].find(s => s.dataset.rock === k); if (sl) { sl.classList.add('pop'); }
      setGemStates();
      if (sortedCount() === KEYS.length) allSorted(); else ui.setHud(R.hud);
    }, 300);
  }
  function wrong(bin) {
    flash(bin, 'bad');
    flyTo(iconHome(), null, 450);
    hintPop(fill(R.hint, { forms: R.rocks[current].forms }));
  }
  const HINT_COLORS = ['177,77,255', '255,138,31', '255,63,164', '34,227,200', '79,195,247', '198,244,50', '255,216,77'];
  function closeHint() { if (hintBack) { hintBack.remove(); hintBack = null; ui.speech.stop(); } }
  function hintPop(text) {
    closeHint();
    let i; do { i = Math.floor(Math.random() * HINT_COLORS.length); } while (i === lastHint); lastHint = i;
    hintBack = document.createElement('div'); hintBack.className = 'dg-hint-back';
    hintBack.innerHTML = `<div class="dg-hint" role="alertdialog" aria-modal="true" style="--h:${HINT_COLORS[i]}">
      <div class="dg-hint-top"><h3><i>💡</i>${esc(R.hintTitles[Math.floor(Math.random() * R.hintTitles.length)])}</h3>${ui.speech.ok ? `<button class="say-btn small" data-say>${SAY_ICON}<span>Read to me</span></button>` : ''}</div>
      <p class="dg-hint-text say">${esc(text)}</p><button class="dg-hint-go">${esc(R.hintButton)}</button></div>`;
    document.body.appendChild(hintBack);
    hintBack.querySelector('.dg-hint-go').onclick = closeHint;
    hintBack.addEventListener('click', e => { if (e.target === hintBack) closeHint(); });
    const sb = hintBack.querySelector('[data-say]'); if (sb) sb.onclick = () => ui.speech.read(hintBack.querySelector('.dg-hint-text'), sb);
  }

  function allSorted() {
    const my = tk;
    mode = 'review'; setGemStates(); fillBins(); ui.setHud(R.hudDone);
    ui.celebrate(R.allSorted, R.allSortedSub, { dur: 3.6 });
    setTimeout(() => { if (my === tk && active) openQuizIntro(); }, 3900);
  }
  function startOver() { if (P()) P().rocksReset(); closeQuiz(); removeIcon(); current = null; mode = 'learn'; fillBins(); setGemStates(); ui.setHud(R.hud); }

  // ---------- the Rock Types Quiz: tap 2 rocks of each kind ----------
  const Q = R.quiz;
  function closeQuiz() { if (quizBack) { quizBack.remove(); quizBack = null; ui.speech.stop(); } }
  function openQuizIntro() { if (P() && P().hasPass('rocks')) P().passIntro('rocks', runQuiz); else runQuiz(); }
  function runQuiz() {
    closeQuiz();
    const asks = shuffled(KINDS).flatMap(k => [k, k]), results = [];
    const grid = shuffled(KEYS), used = new Set();
    let q = 0, tries = 0, answered = false;
    quizBack = document.createElement('div'); quizBack.className = 'modal-back quiz-back';
    quizBack.innerHTML = `<div class="modal quiz t-lime rk-quiz" role="dialog" aria-modal="true" aria-label="${esc(Q.title)}">
      <button class="close qz-x" aria-label="Close">✕</button>
      <div class="qz-top"><span class="qz-title">${esc(Q.title)}</span><span class="qz-step"></span></div>
      <div class="qz-read"><div class="qz-qrow rk-qrow"><h3 class="qz-q say"></h3>${ui.speech.ok ? `<button class="say-btn small" data-say>${SAY_ICON}<span>Read to me</span></button>` : ''}</div>
        <p class="rk-qfb" aria-live="polite"></p>
        <div class="rk-grid">${grid.map(k => `<button class="rk-card" data-k="${k}"><img src="assets/rocks/${esc(R.rocks[k].photo.file)}" alt=""><span>${esc(R.rocks[k].name)}</span></button>`).join('')}</div></div>
      <div class="qz-next"></div></div>`;
    document.body.appendChild(quizBack);
    const $q = s => quizBack.querySelector(s);
    $q('.qz-x').onclick = closeQuiz;
    const sb = $q('[data-say]'); if (sb) sb.onclick = () => ui.speech.read($q('.qz-read'), sb);
    function ask() {
      const kind = asks[q], second = q > 0 && asks[q - 1] === kind;
      tries = 0; answered = false;
      $q('.qz-step').textContent = fill(Q.step, { n: q + 1 });
      $q('.qz-q').innerHTML = esc(fill(second ? Q.askAnother : Q.ask, { a: kind === 'igneous' ? 'an' : 'a', kind: '\u0001' })).replace('\u0001', `<b style="color:${R.kinds[kind].color}">${esc(kindName(kind))}</b>`);
      $q('.rk-qfb').textContent = ''; $q('.qz-next').innerHTML = '';
      quizBack.querySelectorAll('.rk-card.wrong').forEach(c => c.classList.remove('wrong'));
    }
    quizBack.querySelector('.rk-grid').addEventListener('click', e => {
      const c = e.target.closest('.rk-card'); if (!c || answered || used.has(c.dataset.k)) return;
      const k = c.dataset.k, rk = R.rocks[k], kind = asks[q], fb = $q('.rk-qfb');
      ui.speech.stop();
      if (rk.kind === kind) {
        answered = true; used.add(k); results[q] = tries === 0 ? 'first' : 'later';
        c.classList.add('right'); c.style.setProperty('--k', R.kinds[kind].color);
        fb.className = 'rk-qfb ok'; fb.textContent = fill(Q.right, { name: rk.name, kind: kindName(kind) });
        const r = c.getBoundingClientRect(); ui.burst(r.left + r.width / 2, r.top + r.height / 2, true);
        const last = q === asks.length - 1;
        $q('.qz-next').innerHTML = `<button class="qz-go">${esc(last ? Q.finish : Q.next)}</button>`;
        $q('.qz-go').onclick = () => { if (last) score(); else { q++; ask(); } };
      } else {
        tries++;
        c.classList.remove('wrong'); void c.offsetWidth; c.classList.add('wrong');
        fb.className = 'rk-qfb no'; fb.textContent = fill(Q.wrong, { name: rk.name, kind: kindName(rk.kind) });
      }
    });
    function score() {
      const n = asks.length, first = results.filter(r => r === 'first').length, perfect = first === n, pct = Math.round(first / n * 100);
      const rec = P() ? P().recordQuiz('rocks', first, n) : null;
      quizBack.querySelector('.modal').innerHTML = `<button class="close qz-x" aria-label="Close">✕</button>
        <div class="qz-top"><span class="qz-title">${esc(Q.title)}</span></div>
        <div class="qz-read qz-score"><h3>${esc(perfect ? Q.perfectTitle : Q.scoreTitle)}</h3>
          <div class="qz-scorerow"><p class="qz-big say"><b>${first}</b> ${esc(Q.outOf)} <b>${n}</b> ${esc(Q.firstTry)}</p>
          <span class="qz-pct${perfect ? ' perfect' : ''}" aria-label="${pct} percent">${pct}<small>%</small></span></div>
          ${rec ? rec.html : ''}<p class="say">${esc(perfect ? Q.perfectSub : Q.goodJob)}</p></div>
        <div class="qz-next two"><button class="qz-ghost" data-again>${esc(Q.again)}</button>${P() ? `<button class="qz-ghost" data-progress>${esc((window.PROGRESS || {}).seeProgress || 'My Progress')}</button>` : ''}<button class="qz-go" data-done>${esc(Q.done)}</button></div>`;
      $q('.qz-x').onclick = closeQuiz; $q('[data-done]').onclick = closeQuiz;
      $q('[data-again]').onclick = runQuiz;
      const pb = $q('[data-progress]'); if (pb) pb.onclick = () => { closeQuiz(); P().openPanel(); };
      if (perfect) ui.celebrate(Q.perfectTitle, Q.perfectSub, { dur: 6.5 });
    }
    ask();
  }

  // ---------- coming into and leaving Rock Types mode ----------
  function enter() {
    if (active) return;
    active = true; tk++;
    document.body.classList.add('mode-rocks');
    api.hideLabels = true; api.awake = true; group.visible = true;
    if (api.grain && api.grain.scale) api.grain.scale(0.001);
    current = null; mode = sortedCount() === KEYS.length ? 'review' : 'learn';
    fillBins(); setGemStates();
    if (sortedCount() > 0) showBins(false); else { bins.hidden = true; }
    ui.setHud(mode === 'review' ? R.hudDone : R.hud);
    ui.updateInsets(); api.setView('tilt', 1200);
  }
  function leave() {
    if (!active) return;
    active = false; tk++;
    closePopup(); closeHint(); closeQuiz(); removeIcon(); current = null;
    group.visible = false; bins.hidden = true;
    document.body.classList.remove('mode-rocks');
    api.hideLabels = false;
    if (api.grain && api.grain.scale) api.grain.scale(1);
    ui.updateInsets();
  }
  energy.onMode(m => (m === 'rocks' ? enter() : leave()));
  window.addEventListener('resize', () => { if (active) requestAnimationFrame(() => ui.updateInsets()); });

  // where each crystal is on the screen right now (used by the site's tests)
  const gemScreen = () => KEYS.map(k => { const gm = gems[k], r = cv.getBoundingClientRect(), p = api.project([gm.g.position.x, gm.g.position.y, gm.g.position.z]); return { k, kind: R.rocks[k].kind, x: r.left + p.x, y: r.top + p.y, vis: gm.g.visible, dim: !!gm.dim }; });
  return { enter, leave, isActive: () => active, openPopup, runQuiz, gemScreen, state: () => ({ current, mode, sorted: sortedCount(), dragging, popup: !!popup }) };
}
