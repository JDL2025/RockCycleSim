// =====================================================================
// Rock Cycle Explorer — Rock Cycle Diagram mode.
//   Lesson: the Big Circle (5 steps around the ring), then the Shortcuts
//           (3 "any rock can…" rules for the other 5 arrows).
//           A glowing grain rides each arrow; each arrow is animated in
//           its own style (wind, pressed layers, squeezing heat, flames, frost).
//   Explore: tap any rock or arrow picture to see it again.
//   Quiz:   drag (or tap, then tap) names onto the diagram, in 4 rounds.
// All the words are in js/data/diagram.js. The diagram is drawn in SVG,
// 1100 x 700 units, and scaled to fit the screen.
// =====================================================================
const NS = 'http://www.w3.org/2000/svg';
const VW = 1100, VH = 700, CW = 200, CH = 104;

// where each box sits (the same spots as the class assessment diagram)
const NODE_AT = { metamorphic: [550, 92], sedimentary: [165, 290], magma: [935, 290], sediment: [285, 600], igneous: [815, 600] };
// each arrow's line, and where its picture sits
const ARROW_GEO = {
  w1: { d: 'M712,600 L392,600', tile: [552, 600] },
  c1: { d: 'M182,612 C100,612 82,470 118,352', tile: [96, 478] },
  h1: { d: 'M150,232 C150,118 290,92 442,92', tile: [246, 122] },
  m1: { d: 'M658,92 C810,92 950,118 950,232', tile: [854, 122] },
  k1: { d: 'M985,352 C1022,470 1004,612 918,612', tile: [1006, 478] },
  w2: { d: 'M214,350 C228,430 262,480 266,540', tile: [246, 448] },
  w3: { d: 'M498,152 L342,540', tile: [398, 400] },
  h2: { d: 'M758,540 L602,152', tile: [702, 400] },
  m2: { d: 'M272,290 L826,290', tile: [550, 290] },
  m3: { d: 'M866,540 C872,470 880,410 884,352', tile: [858, 448] }
};
const MAIN_IDS = ['w1', 'c1', 'h1', 'm1', 'k1'];

// ---------- little geometry helpers: sample a path (M, L and C only) ----------
function sample(d) {
  const tok = d.match(/[MLC]|-?\d*\.?\d+/g); let i = 0, cur = [0, 0];
  const pts = [], num = () => +tok[i++];
  while (i < tok.length) {
    const c = tok[i++];
    if (c === 'M') { cur = [num(), num()]; pts.push(cur); }
    else if (c === 'L') { const p = [num(), num()]; for (let k = 1; k <= 24; k++) pts.push([cur[0] + (p[0] - cur[0]) * k / 24, cur[1] + (p[1] - cur[1]) * k / 24]); cur = p; }
    else if (c === 'C') {
      const a = [num(), num()], b = [num(), num()], p = [num(), num()], o = cur;
      for (let k = 1; k <= 48; k++) { const t = k / 48, u = 1 - t; pts.push([u * u * u * o[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t * t * t * p[0], u * u * u * o[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t * t * t * p[1]]); }
      cur = p;
    }
  }
  const s = [0]; for (let k = 1; k < pts.length; k++) s.push(s[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  return { pts, s, L: s[s.length - 1] };
}
function at(g, s) {
  s = Math.max(0, Math.min(g.L, s));
  let k = 1; while (k < g.s.length - 1 && g.s[k] < s) k++;
  const a = g.pts[k - 1], b = g.pts[k], f = (s - g.s[k - 1]) / Math.max(1e-6, g.s[k] - g.s[k - 1]);
  return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, a: Math.atan2(b[1] - a[1], b[0] - a[0]) };
}
function offsetPath(g, off, step, from, to) {
  let out = '';
  for (let s = from; s <= to + 0.01; s += step) {
    const p = at(g, s), o = off(s), nx = -Math.sin(p.a), ny = Math.cos(p.a);
    out += (out ? 'L' : 'M') + (p.x + nx * o).toFixed(1) + ',' + (p.y + ny * o).toFixed(1);
  }
  return out;
}
const deg = a => (a * 180 / Math.PI).toFixed(1);
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// ---------- the rock pictures inside the boxes (card is 200 x 104, centered) ----------
const PIC = {
  sediment() {
    const r = rng(11); let h = `<rect x="-100" y="-52" width="200" height="104" fill="url(#dgSand)"/>`;
    for (let i = 0; i < 70; i++) h += `<circle cx="${(-98 + r() * 196).toFixed(1)}" cy="${(-50 + r() * 100).toFixed(1)}" r="${(0.7 + r() * 0.8).toFixed(1)}" fill="#a88f5e" opacity=".6"/>`;
    const C = ['#b89b6a', '#8e8a80', '#c9b48a', '#a47c52', '#d8cfc0', '#9b8f7f'];
    for (let i = 0; i < 30; i++) {
      const rx = 4 + r() * 8;
      const cx = (-94 + r() * 188).toFixed(1), cy = (-48 + r() * 66).toFixed(1);
      h += `<ellipse cx="${cx}" cy="${cy}" rx="${rx.toFixed(1)}" ry="${(rx * (0.55 + r() * 0.3)).toFixed(1)}" transform="rotate(${(r() * 180).toFixed(0)} ${cx} ${cy})" fill="${C[i % C.length]}" stroke="#6b5a3e" stroke-width="1"/>`;
    }
    return h;
  },
  sedimentary() {
    const r = rng(5), C = ['#efd7a4', '#c98b55', '#f3e2bd', '#b5713f', '#dcb27a', '#9c5b34', '#e7c28c'];
    let h = '', y = -54, i = 0;
    while (y < 54) {
      const t = 9 + r() * 9, c = C[i++ % C.length], w = (r() * 2 - 1) * 1.6;
      h += `<path d="M-102,${y.toFixed(1)} Q-50,${(y + w).toFixed(1)} 0,${y.toFixed(1)} T102,${y.toFixed(1)} V${(y + t + 1).toFixed(1)} H-102Z" fill="${c}"/>`;
      h += `<path d="M-102,${y.toFixed(1)} Q-50,${(y + w).toFixed(1)} 0,${y.toFixed(1)} T102,${y.toFixed(1)}" stroke="#6e4426" stroke-width=".8" opacity=".35" fill="none"/>`;
      y += t;
    }
    for (let k = 0; k < 40; k++) h += `<circle cx="${(-98 + r() * 196).toFixed(1)}" cy="${(-50 + r() * 100).toFixed(1)}" r=".8" fill="#5a3a20" opacity=".35"/>`;
    return h;
  },
  metamorphic() {
    const C = ['#4b3b6b', '#f6f2fb', '#9b8db8', '#efe9f7', '#6c5a90', '#d6cce8'];
    let h = `<rect x="-100" y="-52" width="200" height="104" fill="#ddd5ea"/>`;
    let i = 0;
    for (let y = -56; y < 62; y += 9.5) {
      let d = '';
      for (let x = -104; x <= 104; x += 4) d += (d ? 'L' : 'M') + x + ',' + (y + Math.sin(x / 19 + y / 23) * 6 + Math.sin(x / 7.5) * 1.2).toFixed(1);
      h += `<path d="${d}" stroke="${C[i % C.length]}" stroke-width="${i % 2 ? 6.5 : 4.5}" fill="none"/>`;
      i++;
    }
    return h;
  },
  igneous() {
    const r = rng(23), C = ['#2a2626', '#f8f4ef', '#d98a86', '#b9a39e', '#f2b8a6', '#7a6a68', '#fbe4dc'];
    let h = `<rect x="-100" y="-52" width="200" height="104" fill="#e8c9c2"/>`;
    for (let i = 0; i < 95; i++) {
      const cx = -98 + r() * 196, cy = -50 + r() * 100, n = 4 + Math.floor(r() * 2), rad = 2.5 + r() * 4.5, a0 = r() * 6.3;
      let d = '';
      for (let k = 0; k < n; k++) { const a = a0 + k * 6.283 / n + r() * 0.5, rr = rad * (0.6 + r() * 0.5); d += (k ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1); }
      h += `<path d="${d}Z" fill="${C[i % C.length]}"/>`;
    }
    return h;
  },
  magma() {
    const r = rng(3);
    let h = `<rect x="-100" y="-52" width="200" height="104" fill="url(#dgMagma)"/>`;
    h += `<path d="M-90,-30 C-50,-46 -20,-10 20,-28 S80,-20 96,-36" stroke="#ffe9a0" stroke-width="3" opacity=".45" fill="none"/>`;
    h += `<path d="M-96,24 C-60,8 -30,40 10,20 S70,30 98,12" stroke="#c2390f" stroke-width="4" opacity=".35" fill="none"/>`;
    for (let i = 0; i < 9; i++) h += `<circle class="bub" cx="${(-80 + r() * 160).toFixed(0)}" cy="${(10 + r() * 30).toFixed(0)}" r="${(2.5 + r() * 3.5).toFixed(1)}" fill="#fff1b0" opacity=".75" style="animation-delay:-${(r() * 3).toFixed(2)}s"/>`;
    return h;
  }
};

// ---------- the little process pictures (in a 64 x 56 tile, centered) ----------
const ROCK = (dy = 0, fill = '#8d939c') => `<g transform="translate(0 ${dy})"><path d="M-17,14 C-19,3 -12,-5 -3,-7 C6,-9 15,-3 18,5 C19,9 19,12 18,14 Z" fill="${fill}" stroke="#2c3038" stroke-width="1.6"/><path d="M-8,4 L-2,2 M4,8 L9,6" stroke="#5c626b" stroke-width="1.4" stroke-linecap="round"/></g>`;
const ICON = {
  weather: `${ROCK(9)}<g><circle cx="-8" cy="-13" r="7" fill="#d5dae2"/><circle cx="1" cy="-17" r="8.5" fill="#e3e7ee"/><circle cx="10" cy="-12" r="6.5" fill="#d5dae2"/><rect x="-15" y="-13" width="31" height="7" rx="3.5" fill="#d5dae2"/></g><path d="M-9,-3 l-3,7 M-1,-3 l-3,7 M7,-3 l-3,7" stroke="#4fc3f7" stroke-width="2.2" stroke-linecap="round"/><path d="M16,-2 c4,-2 6,2 10,0" stroke="#bfe9ff" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  compact: `${ROCK(9, '#9aa0a8')}<path d="M-13,16 H13 M-14,20 H14" stroke="#5f666f" stroke-width="1.4"/><path d="M-13,-24 v9 m-4,-4 l4,4 l4,-4 M0,-26 v10 m-4,-4 l4,4 l4,-4 M13,-24 v9 m-4,-4 l4,4 l4,-4" stroke="#c8cfda" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M20,-4 c-3,4 -4,6 -4,8 a4,4 0 0 0 8,0 c0,-2 -1,-4 -4,-8z" fill="#3ddc84"/>`,
  heatp: `<ellipse cx="0" cy="12" rx="24" ry="13" fill="#ff8a2a" opacity=".55"/><ellipse cx="0" cy="12" rx="18" ry="9" fill="#ffb347" opacity=".6"/>${ROCK(7, '#8a7d78')}<path d="M-22,-20 l9,9 m-6,0 h6 v-6 M0,-25 v12 m-4,-4 l4,4 l4,-4 M22,-20 l-9,9 m0,-6 v6 h6" stroke="#ffd84d" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  melt: `<path d="M-18,12 C-22,0 -12,-6 -12,-18 C-6,-10 -4,-6 -6,2 C-2,-8 2,-14 0,-26 C8,-16 10,-8 6,2 C10,-4 14,-8 14,-16 C22,-6 22,4 18,12Z" fill="#ff6a1a"/><path d="M-10,12 C-12,4 -6,0 -6,-8 C-2,-2 0,2 -2,6 C2,0 4,-6 3,-14 C8,-6 9,0 7,6 C10,2 12,0 12,-6 C16,2 15,8 12,12Z" fill="#ffd84d"/>${ROCK(10, '#7d6f6a')}`,
  cool: `<ellipse cx="0" cy="14" rx="24" ry="12" fill="#8fe9ff" opacity=".45"/>${ROCK(9, '#9fb6c4')}<path d="M-12,-4 c-3,-4 3,-6 0,-10 c-3,-4 3,-6 0,-10 M0,-6 c-3,-4 3,-6 0,-10 c-3,-4 3,-6 0,-10 M12,-4 c-3,-4 3,-6 0,-10 c-3,-4 3,-6 0,-10" stroke="#9ff0ff" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
};
const splitName = n => { const i = n.indexOf(' and '); return i < 0 ? [n] : [n.slice(0, i + 4), n.slice(i + 5)]; };

// ---------- each process draws its arrow its own way ----------
function arrowFx(proc, g, c, main) {
  const sc = main ? 1 : 0.8, end = g.L - 15, taper = s => Math.max(0, Math.min(1, s / 26, (end - s) / 26));
  const trim = offsetPath(g, () => 0, 4, 0, end);
  let h = '';
  if (proc === 'weather') {                       // wispy wind: wavy flowing lines
    h += `<path class="fl fl26" d="${offsetPath(g, s => Math.sin(s / 46 * 6.283) * 6 * taper(s), 3, 0, end)}" stroke="${c}" stroke-width="${5 * sc}" stroke-dasharray="16 10" fill="none" stroke-linecap="round"/>`;
    for (const side of [-1, 1]) h += `<path class="fl fl28 fast" d="${offsetPath(g, s => side * (13 + Math.sin(s / 30 * 6.283 + side) * 3) * taper(s), 3, end * 0.12, end * 0.82)}" stroke="#d8f3ff" stroke-width="2" stroke-dasharray="10 18" opacity=".6" fill="none" stroke-linecap="round"/>`;
  } else if (proc === 'compact') {                // layers pressed together, then glued
    h += `<path d="${trim}" stroke="${c}" stroke-width="${6 * sc}" fill="none" stroke-linecap="round"/>`;
    h += `<path class="fl fl10 slow" d="${trim}" stroke="#c4f7d8" stroke-width="${18 * sc}" stroke-dasharray="3 7" opacity=".55" fill="none"/>`;
    for (let s = 34, k = 0; s < end - 14; s += 52, k++) { const p = at(g, s); h += `<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})"><path class="drip" style="animation-delay:-${(k * 0.37 % 1.6).toFixed(2)}s" d="M0,-7 c-3,4 -4,6 -4,8 a4,4 0 0 0 8,0 c0,-2 -1,-4 -4,-8z" fill="#7dffb0" stroke="#0e3a22" stroke-width=".8"/></g>`; }
  } else if (proc === 'heatp') {                  // squeezing heat: glow + chevrons pushing in
    h += `<path class="hglow" d="${trim}" stroke="#ff8a2a" stroke-width="${20 * sc}" opacity=".35" fill="none" filter="url(#dgBlur)"/>`;
    h += `<path class="fl fl26" d="${trim}" stroke="${c}" stroke-width="${6 * sc}" stroke-dasharray="18 8" fill="none" stroke-linecap="round"/>`;
    for (let s = 30; s < end - 18; s += 44) { const p = at(g, s); h += `<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${deg(p.a)})"><path class="chev-t" d="M-6,-21 L0,-14 L6,-21"/><path class="chev-b" d="M-6,21 L0,14 L6,21"/></g>`; }
  } else if (proc === 'melt') {                   // flames flickering along the line
    h += `<path d="${trim}" stroke="#ff6a1a" stroke-width="${6 * sc}" fill="none" stroke-linecap="round"/>`;
    h += `<path class="fl fl20" d="${trim}" stroke="#ffd84d" stroke-width="2" stroke-dasharray="10 10" fill="none"/>`;
    for (let s = 22, k = 0; s < end - 12; s += 28, k++) {
      const p = at(g, s), up = Math.cos(p.a) > 0 ? '' : ' scale(1 -1)';
      h += `<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${deg(p.a)})${up}"><path class="flame" style="animation-delay:-${(k * 0.17 % 0.6).toFixed(2)}s" d="M0,-3 C-6,-8 -4,-15 0,-${k % 2 ? 19 : 23} C4,-15 6,-8 0,-3Z" fill="url(#dgFlame)"/></g>`;
    }
  } else if (proc === 'cool') {                   // icy blue jagged frost line + twinkling crystals
    let z = ''; for (let s = 0, k = 0; s <= end; s += 10, k++) { const p = at(g, s), o = (k % 2 ? 6 : -6) * taper(s), nx = -Math.sin(p.a), ny = Math.cos(p.a); z += (z ? 'L' : 'M') + (p.x + nx * o).toFixed(1) + ',' + (p.y + ny * o).toFixed(1); }
    h += `<path class="fl fl28" d="${z}" stroke="${c}" stroke-width="${4.5 * sc}" stroke-dasharray="20 8" fill="none" stroke-linejoin="miter"/>`;
    h += `<path d="${z}" stroke="#ffffff" stroke-width="1.3" opacity=".8" fill="none"/>`;
    for (let s = 28, k = 0; s < end - 10; s += 50, k++) { const p = at(g, s), o = k % 2 ? 17 : -17, nx = -Math.sin(p.a), ny = Math.cos(p.a); h += `<g transform="translate(${(p.x + nx * o).toFixed(1)} ${(p.y + ny * o).toFixed(1)})"><path class="flake" style="animation-delay:-${(k * 0.45 % 1.8).toFixed(2)}s" d="M0,-6.5V6.5M-5.6,-3.2L5.6,3.2M-5.6,3.2L5.6,-3.2" stroke="#eafdff" stroke-width="1.8" stroke-linecap="round"/></g>`; }
  }
  return h;
}
function arrowHead(g, main) {
  const p = at(g, g.L), q = at(g, g.L - 20), a = Math.atan2(p.y - q.y, p.x - q.x), len = main ? 24 : 21, w = main ? 13 : 11;
  const bx = p.x - Math.cos(a) * len, by = p.y - Math.sin(a) * len, nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
  return `${p.x.toFixed(1)},${p.y.toFixed(1)} ${(bx + nx).toFixed(1)},${(by + ny).toFixed(1)} ${(bx - nx).toFixed(1)},${(by - ny).toFixed(1)}`;
}

export function createDiagram(api, ui, D, energy) {
  const esc = ui.esc, $ = s => document.querySelector(s);
  const box = $('#story'), boxText = $('#storyText'), boxStep = $('#storyStep'), boxBtns = $('#storyBtns');
  const L = D.lesson, Q = D.quiz, R = D.rocks, P = D.processes, A = D.arrows, B = L.buttons;
  const ROCK_KEYS = Object.keys(NODE_AT), ARROW_IDS = Object.keys(ARROW_GEO);
  const GEO = {}; ARROW_IDS.forEach(id => GEO[id] = sample(ARROW_GEO[id].d));

  // *words* -> colored: rock names get their rock's color, anything else is yellow
  const ROCK_WORDS = ['sedimentary', 'metamorphic', 'igneous', 'magma', 'sediment'];
  const fmt = t => esc(t).replace(/\*(.+?)\*/g, (m, w) => { const k = ROCK_WORDS.find(r => w.toLowerCase().includes(r)); return k ? `<b style="color:${R[k].color}">${w}</b>` : `<span class="y">${w}</span>`; });
  const procHead = p => `<b style="color:${P[p].color}">${esc(P[p].name)}:</b> `;

  // ---------- build the picture ----------
  const wrap = document.createElement('section'); wrap.id = 'diagram'; wrap.hidden = true; wrap.setAttribute('aria-label', D.button);
  box.parentNode.insertBefore(wrap, box);
  let lines = '', tiles = '', nodes = '';
  for (const id of ARROW_IDS) {
    const a = A[id], g = GEO[id], c = P[a.process].color, main = MAIN_IDS.includes(id), [tx, ty] = ARROW_GEO[id].tile;
    const ends = offsetPath(g, () => 0, 4, 0, g.L - 15);
    lines += `<g class="arrow${main ? ' main' : ''}" data-arrow="${id}">
      <path class="track" d="${ends}" stroke-width="${main ? 9 : 7}"/>
      <g class="fx">${arrowFx(a.process, g, c, main)}</g>
      <polygon class="head" points="${arrowHead(g, main)}" fill="${c}"/></g>`;
    const nm = splitName(P[a.process].name);
    tiles += `<g class="tile" data-tile="${id}" transform="translate(${tx} ${ty})">
      <rect class="hit" x="-66" y="-34" width="132" height="${nm.length > 1 ? 112 : 94}" rx="14"/>
      <g class="tile-in"><rect class="tbg" x="-32" y="-28" width="64" height="56" rx="14" stroke="${c}"/>${ICON[a.process]}</g>
      <text class="tlab" y="${nm.length > 1 ? 48 : 50}">${esc(nm[0])}</text>${nm[1] ? `<text class="tlab" y="69">${esc(nm[1])}</text>` : ''}
      <g class="slot"><rect x="-32" y="-28" width="64" height="56" rx="14"/><text y="11">?</text></g></g>`;
  }
  for (const k of ROCK_KEYS) {
    const [x, y] = NODE_AT[k], r = k === 'magma' ? 50 : 16, c = R[k].color, sw = k === 'magma' ? 136 : 188;
    nodes += `<g class="node" data-node="${k}" transform="translate(${x} ${y})"><g class="node-in">
      <rect class="nglow" x="${-CW / 2}" y="${-CH / 2}" width="${CW}" height="${CH}" rx="${r}" stroke="${c}" filter="url(#dgBlur)"/>
      <clipPath id="dgClip-${k}"><rect x="${-CW / 2}" y="${-CH / 2}" width="${CW}" height="${CH}" rx="${r}"/></clipPath>
      <g clip-path="url(#dgClip-${k})">${PIC[k]()}</g>
      <rect class="nborder" x="${-CW / 2}" y="${-CH / 2}" width="${CW}" height="${CH}" rx="${r}" stroke="${c}"/>
      <g class="nname"><rect x="${-sw / 2}" y="13" width="${sw}" height="32" rx="10"/><text y="36">${esc(R[k].name)}</text></g>
      <g class="nslot"><rect x="${-sw / 2}" y="13" width="${sw}" height="32" rx="10"/><text y="36">?</text></g>
      <rect class="nhit" x="${-CW / 2 - 10}" y="${-CH / 2 - 10}" width="${CW + 20}" height="${CH + 20}" rx="${r}"/></g></g>`;
  }
  wrap.innerHTML = `<svg class="dg" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(D.button)}">
    <defs>
      <filter id="dgBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
      <linearGradient id="dgFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff4d1a"/><stop offset=".55" stop-color="#ff9a3c"/><stop offset="1" stop-color="#ffe45c"/></linearGradient>
      <linearGradient id="dgSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7e6b0"/><stop offset="1" stop-color="#e2c27a"/></linearGradient>
      <radialGradient id="dgMagma" cx=".5" cy=".55" r=".75"><stop offset="0" stop-color="#fff0a0"/><stop offset=".25" stop-color="#ffd04d"/><stop offset=".6" stop-color="#ff9a3c"/><stop offset="1" stop-color="#d8461a"/></radialGradient>
    </defs>
    <g class="dg-lines">${lines}</g><g class="dg-tiles">${tiles}</g><g class="dg-nodes">${nodes}</g><g class="dg-grains"></g></svg>`;
  const svg = wrap.querySelector('svg'), grainLayer = svg.querySelector('.dg-grains');
  const nodeEl = k => svg.querySelector(`[data-node="${k}"]`);
  const arrowEls = id => [svg.querySelector(`[data-arrow="${id}"]`), svg.querySelector(`[data-tile="${id}"]`)];

  // ---------- the Modes menu button ----------
  const mb = document.createElement('button');
  mb.className = 'rail-btn'; mb.dataset.mode = 'diagram'; mb.setAttribute('aria-pressed', 'false');
  mb.innerHTML = `<svg viewBox="0 0 24 24"><rect x="9" y="2.5" width="6" height="5" rx="1.2"/><rect x="2.5" y="16.5" width="6" height="5" rx="1.2"/><rect x="15.5" y="16.5" width="6" height="5" rx="1.2"/><path d="M10.5 8.5 6.8 15M13.5 8.5l3.7 6.5M9.5 19h5"/></svg><span>${esc(D.button)}</span>`;
  mb.onclick = () => energy.setMode('diagram');
  $('#modes').appendChild(mb);

  // ---------- state ----------
  let active = false, tk = 0, busy = false, step = -1, quiz = null, scoreBack = null;
  const movers = [];

  // ---------- fit the diagram into the free space ----------
  function layout() {
    if (!active) return;
    const W = innerWidth, H = innerHeight;
    const hud = $('#hud').getBoundingClientRect(), rail = $('#rail').getBoundingClientRect(), modes = $('#modes').getBoundingClientRect();
    const bh = box.hidden ? 150 : Math.max(150, box.getBoundingClientRect().height);
    const bottom = H - bh - 26;
    const railsBottom = Math.max(rail.bottom, modes.bottom) + 8;
    // the top corners of the diagram are empty, so it can start beside the title
    const top = Math.max(16, hud.bottom - 46);
    const cands = [
      { x: rail.right + 8, y: top, w: modes.left - 8 - (rail.right + 8), h: bottom - top },
      { x: 8, y: railsBottom, w: W - 16, h: bottom - railsBottom }
    ].filter(c => c.w > 100 && c.h > 100);
    let best = cands[0] || { x: 0, y: 0, w: W, h: H }, bs = 0;
    for (const c of cands) { const s = Math.min(c.w / VW, c.h / VH); if (s > bs) { bs = s; best = c; } }
    Object.assign(svg.style, { left: best.x + 'px', top: best.y + 'px', width: best.w + 'px', height: best.h + 'px' });
  }
  window.addEventListener('resize', () => requestAnimationFrame(layout));
  const toScreen = (x, y) => { const m = svg.getScreenCTM(); return m ? { x: m.a * x + m.e, y: m.d * y + m.f } : { x, y }; };

  // ---------- the story box ----------
  function setBox(stepLabel, html, buttons, pop = true) {
    ui.speech.stop();
    boxStep.textContent = stepLabel;
    boxText.innerHTML = html;
    if (buttons) setButtons(buttons);
    box.hidden = false;
    if (pop) { box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop'); }
    requestAnimationFrame(layout);
  }
  function setButtons(list) {
    boxBtns.innerHTML = '';
    for (const b of list) {
      const el = document.createElement('button'); el.className = b.cls || 'go'; el.textContent = b.label;
      if (b.disabled) el.disabled = true;
      el.onclick = () => { if (!el.disabled) b.fn(); };
      boxBtns.appendChild(el);
    }
  }
  const enableNext = () => boxBtns.querySelectorAll('button[disabled]').forEach(b => b.disabled = false);

  // ---------- states for boxes and arrows ----------
  function setNode(k, cls) { const el = nodeEl(k); el.classList.remove('seen', 'here', 'qz', 'target', 'pick', 'bad'); if (cls) cls.split(' ').forEach(c => el.classList.add(c)); }
  function setArrow(id, cls) { for (const el of arrowEls(id)) { el.classList.remove('seen', 'live', 'q', 'target', 'pick', 'bad', 'filled'); if (cls) cls.split(' ').forEach(c => el.classList.add(c)); } }
  function popNode(k) {
    const inner = nodeEl(k).querySelector('.node-in');
    inner.classList.remove('pop'); void inner.getBoundingClientRect(); inner.classList.add('pop');
    const [x, y] = NODE_AT[k], s = toScreen(x, y); ui.burst(s.x, s.y, false, R[k].color);
  }
  function hereNode(k) { ROCK_KEYS.forEach(r => nodeEl(r).classList.remove('here')); if (k) nodeEl(k).classList.add('seen', 'here'); }

  // ---------- grains riding the arrows ----------
  const lerpColor = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`; };
  function ride(id, dur = 2.6) {
    const a = A[id], g = GEO[id], el = document.createElementNS(NS, 'g');
    el.innerHTML = `<circle r="18" class="gglow" filter="url(#dgBlur)"/><circle r="9" class="gcore"/>`;
    grainLayer.appendChild(el);
    return new Promise(res => movers.push({ id, g, el, t: 0, dur, c0: R[a.from].color, c1: R[a.to].color, res, tk }));
  }
  let last = 0;
  function loop(now) {
    if (!active) return;
    requestAnimationFrame(loop);
    const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
    for (let i = movers.length - 1; i >= 0; i--) {
      const m = movers[i];
      if (m.tk !== tk) { m.el.remove(); movers.splice(i, 1); continue; }
      m.t = Math.min(1, m.t + dt / m.dur);
      const e = m.t < 0.5 ? 2 * m.t * m.t : 1 - Math.pow(-2 * m.t + 2, 2) / 2;
      const p = at(m.g, e * (m.g.L - 6)), c = lerpColor(m.c0, m.c1, Math.max(0, Math.min(1, (m.t - 0.3) / 0.5)));
      m.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${(1 + 0.12 * Math.sin(now / 120)).toFixed(3)})`);
      m.el.firstChild.setAttribute('fill', c); m.el.lastChild.setAttribute('fill', c);
      if (m.t >= 1) { m.el.remove(); movers.splice(i, 1); m.res(); }
    }
  }
  // play arrows: they come alive, a grain rides each one, the boxes at the end light up
  async function playArrows(ids, keepLive = []) {
    const my = tk; busy = true;
    ARROW_IDS.forEach(id => { const [l] = arrowEls(id); if (l.classList.contains('live') && !ids.includes(id) && !keepLive.includes(id)) setArrow(id, 'seen'); });
    ids.forEach(id => { setArrow(id, 'live'); nodeEl(A[id].from).classList.add('seen'); });
    await Promise.all(ids.map(id => ride(id)));
    if (my !== tk) return false;
    const ends = [...new Set(ids.map(id => A[id].to))];
    ends.forEach(k => { nodeEl(k).classList.add('seen'); popNode(k); });
    hereNode(ends.length === 1 ? ends[0] : null);
    busy = false;
    return true;
  }

  // ---------- the lesson ----------
  const NSTEPS = L.circle.length + L.shortcuts.length;
  function resetAll() {
    tk++; busy = false; movers.forEach(m => m.el.remove()); movers.length = 0;
    ROCK_KEYS.forEach(k => setNode(k, ''));
    ARROW_IDS.forEach(id => setArrow(id, ''));
    svg.classList.remove('quiz');
  }
  function startLesson() {
    closeScore(); quiz = null; resetAll(); ui.setHud(D.hud);
    step = -1; hereNode('igneous');
    setBox(L.intro.step, fmt(L.intro.text), [{ label: B.start, fn: nextStep }]);
  }
  async function nextStep() {
    if (busy) return;
    step++;
    if (step < L.circle.length) {
      const c = L.circle[step], p = A[c.arrow].process;
      setBox(L.circleStep.replace('{n}', step + 1).replace('{total}', L.circle.length), procHead(p) + fmt(c.text), [{ label: B.next, fn: nextStep, disabled: true }]);
      if (await playArrows([c.arrow])) enableNext();
    } else if (step < NSTEPS) {
      const j = step - L.circle.length, s = L.shortcuts[j];
      setBox(L.shortcutStep.replace('{n}', j + 1).replace('{total}', L.shortcuts.length), fmt(s.text), [{ label: B.next, fn: nextStep, disabled: true }]);
      if (await playArrows(s.arrows)) enableNext();
    } else showEnd(true);
  }
  function endButtons() {
    return [{ label: B.quiz, cls: 'go quiz', fn: startQuiz }, { label: B.again, cls: 'ghost', fn: startLesson }, { label: B.back, cls: 'ghost', fn: () => energy.setMode('real') }];
  }
  function showEnd(celebrate) {
    step = NSTEPS;
    ROCK_KEYS.forEach(k => nodeEl(k).classList.add('seen'));
    hereNode(null);
    // the whole diagram comes alive for a moment, then settles
    ARROW_IDS.forEach(id => setArrow(id, celebrate ? 'live' : 'seen'));
    if (celebrate) { const my = tk; setTimeout(() => { if (my === tk && !quiz) ARROW_IDS.forEach(id => { if (arrowEls(id)[0].classList.contains('live')) setArrow(id, 'seen'); }); }, 6000); ROCK_KEYS.forEach((k, i) => setTimeout(() => { if (my === tk) popNode(k); }, 200 + i * 180)); }
    setBox(L.end.step, fmt(L.end.text), endButtons());
  }
  // explore: tap a box or an arrow picture you have already seen
  function textFor(id) {
    const c = L.circle.find(x => x.arrow === id);
    if (c) return procHead(A[id].process) + fmt(c.text);
    const s = L.shortcuts.find(x => x.arrows.includes(id));
    return procHead(A[id].process) + fmt(s ? s.text : '');
  }
  svg.addEventListener('click', e => {
    if (!active) return;
    if (quiz) return onQuizTap(e);
    if (busy) return;
    const t = e.target.closest('[data-tile]'), n = e.target.closest('[data-node]');
    if (t && (t.classList.contains('seen') || t.classList.contains('live'))) {
      const id = t.dataset.tile;
      boxStep.textContent = P[A[id].process].name; boxText.innerHTML = textFor(id); ui.speech.stop();
      playArrows([id]).then(ok => { if (ok && step >= NSTEPS) hereNode(null); });
    } else if (n && n.classList.contains('seen')) {
      const k = n.dataset.node;
      boxStep.textContent = R[k].name; boxText.innerHTML = fmt(R[k].about.replace(R[k].name.split(' ')[0], m => `*${m}*`)); ui.speech.stop();
      popNode(k);
    }
  });

  // ---------- the quiz ----------
  // scoring: each rock name (5) and each arrow (10) counts once: right on the first try or not
  function startQuiz() {
    closeScore(); resetAll(); ui.setHud(D.quizHud);
    svg.classList.add('quiz');
    ROCK_KEYS.forEach(k => setNode(k, 'seen qz'));
    ARROW_IDS.forEach(id => setArrow(id, 'q'));
    quiz = { round: 0, done: {}, miss: {}, sel: null };
    showRound();
  }
  function roundChips() {
    const r = Q.rounds[quiz.round];
    return quiz.round < 3 ? r.chips.filter(k => !quiz.done[k]) : r.chips;
  }
  function showRound(feedback = '') {
    const r = Q.rounds[quiz.round];
    quiz.sel = null;
    setBox(Q.roundStep.replace('{n}', quiz.round + 1), fmt(r.text) + `<span class="dg-fb">${feedback || esc(Q.tip)}</span>`, null, !feedback);
    boxBtns.innerHTML = `<div class="dg-tray">${roundChips().map(k => quiz.round < 3
      ? `<button class="dg-chip" data-chip="${k}">${esc(R[k].name)}</button>`
      : `<button class="dg-chip proc" data-chip="${k}"><svg viewBox="-32 -28 64 56" aria-hidden="true">${ICON[k]}</svg><span>${esc(P[k].name)}</span></button>`).join('')}</div>`;
    boxBtns.querySelectorAll('.dg-chip').forEach(bindChip);
    markTargets();
  }
  const isRockRound = () => quiz && quiz.round < 3;
  function targets() { return isRockRound() ? ROCK_KEYS.filter(k => !quiz.done['n:' + k]).map(k => ({ kind: 'node', key: k, el: nodeEl(k) })) : ARROW_IDS.filter(id => !quiz.done['a:' + id]).map(id => ({ kind: 'arrow', key: id, el: arrowEls(id)[1] })); }
  function markTargets() {
    ROCK_KEYS.forEach(k => nodeEl(k).classList.remove('target', 'pick'));
    ARROW_IDS.forEach(id => arrowEls(id).forEach(e => e.classList.remove('target', 'pick')));
    if (!quiz) return;
    for (const t of targets()) { t.el.classList.add('target'); if (quiz.sel) t.el.classList.add('pick'); }
  }
  function feedback(html) { const fb = boxText.querySelector('.dg-fb'); if (fb) { fb.innerHTML = html; fb.classList.remove('flash'); void fb.offsetWidth; fb.classList.add('flash'); } ui.speech.stop(); }
  function attempt(chip, t) {
    if (!quiz) return;
    const rockRound = isRockRound();
    const right = rockRound ? t.key === chip : A[t.key].process === chip;
    const unit = rockRound ? 'r:' + chip : 'x:' + t.key;          // what this try counts against
    if (!right) {
      quiz.miss[unit] = true;
      t.el.classList.remove('bad'); void t.el.getBoundingClientRect(); t.el.classList.add('bad');
      feedback(`<b class="no">${esc(Q.wrong)}</b> ${esc(rockRound ? R[chip].hint : Q.processHints[A[t.key].process])} <b class="again">${esc(Q.tryAgain)}</b>`);
      return;
    }
    if (rockRound) {
      quiz.done[chip] = true; quiz.done['n:' + t.key] = true;
      setNode(t.key, 'seen'); popNode(t.key);
      const c = boxBtns.querySelector(`[data-chip="${chip}"]`); if (c) c.remove();
      feedback(`<b class="ok">${esc(Q.right)}</b> ${fmt(`That’s *${R[chip].name.toLowerCase()}*.`)}`);
    } else {
      quiz.done['a:' + t.key] = true;
      setArrow(t.key, 'live filled');
      const my = tk; setTimeout(() => { if (my === tk && quiz) setArrow(t.key, 'seen filled'); }, 2200);
      const s = toScreen(...ARROW_GEO[t.key].tile); ui.burst(s.x, s.y, false, P[chip].color);
      feedback(`<b class="ok">${esc(Q.right)}</b> ${procHead(chip)}${fmt(`*${R[A[t.key].from].name.toLowerCase()}* → *${R[A[t.key].to].name.toLowerCase()}*`)}`);
    }
    quiz.sel = null; boxBtns.querySelectorAll('.dg-chip.sel').forEach(c => c.classList.remove('sel'));
    markTargets();
    const roundDone = rockRound ? roundChips().length === 0 : targets().length === 0;
    if (roundDone) {
      feedback(`<b class="ok">${esc(Q.roundDone)}</b>`);
      ROCK_KEYS.forEach(k => nodeEl(k).classList.remove('target'));
      const my = tk;
      setTimeout(() => { if (my !== tk || !quiz) return; if (quiz.round < 3) { quiz.round++; showRound(); } else showScore(); }, 1500);
    }
  }
  // dragging a name chip (or tap it, then tap a spot)
  let ghost = null;
  function bindChip(chip) {
    chip.addEventListener('pointerdown', e => {
      if (!quiz) return;
      e.preventDefault();
      const start = { x: e.clientX, y: e.clientY }; let dragging = false;
      try { chip.setPointerCapture(e.pointerId); } catch (_) {}
      const move = ev => {
        if (!dragging && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > 8) {
          dragging = true;
          ghost = chip.cloneNode(true); ghost.classList.add('dg-ghost'); ghost.classList.remove('sel'); document.body.appendChild(ghost);
          chip.classList.add('lifted');
        }
        if (dragging) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; hoverAt(ev.clientX, ev.clientY); }
      };
      const up = ev => {
        chip.removeEventListener('pointermove', move); chip.removeEventListener('pointerup', up); chip.removeEventListener('pointercancel', up);
        chip.classList.remove('lifted');
        if (ghost) { ghost.remove(); ghost = null; }
        hoverAt(-1, -1);
        if (dragging) { if (ev.type === 'pointerup') { const t = targetAt(ev.clientX, ev.clientY); if (t) attempt(chip.dataset.chip, t); } }
        else {                                             // a tap: choose this name
          const on = !chip.classList.contains('sel');
          boxBtns.querySelectorAll('.dg-chip.sel').forEach(c => c.classList.remove('sel'));
          if (on) chip.classList.add('sel');
          quiz.sel = on ? chip.dataset.chip : null;
          markTargets();
        }
      };
      chip.addEventListener('pointermove', move); chip.addEventListener('pointerup', up); chip.addEventListener('pointercancel', up);
    });
  }
  function targetAt(x, y) {
    let best = null, bd = 1e9;
    for (const t of targets()) {
      const r = (t.kind === 'node' ? t.el.querySelector('.nhit') : t.el.querySelector('.hit')).getBoundingClientRect();
      const pad = 14;
      if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) continue;
      const d = Math.hypot(x - (r.left + r.right) / 2, y - (r.top + r.bottom) / 2);
      if (d < bd) { bd = d; best = t; }
    }
    return best;
  }
  function hoverAt(x, y) { const t = x < 0 ? null : targetAt(x, y); for (const u of targets()) u.el.classList.toggle('hover', !!t && u.el === t.el); }
  function onQuizTap(e) {
    if (!quiz || !quiz.sel) return;
    const t = targetAt(e.clientX, e.clientY);
    if (t) attempt(quiz.sel, t);
  }

  // ---------- the score screen (looks like the other quizzes, in neon teal) ----------
  function closeScore() { if (scoreBack) { scoreBack.remove(); scoreBack = null; } }
  function showScore() {
    const units = [...ROCK_KEYS.map(k => 'r:' + k), ...ARROW_IDS.map(id => 'x:' + id)];
    const n = units.length, first = units.filter(u => !quiz.miss[u]).length, perfect = first === n, pct = Math.round(first / n * 100);
    ARROW_IDS.forEach(id => setArrow(id, 'live filled'));
    closeScore();
    scoreBack = document.createElement('div'); scoreBack.className = 'modal-back quiz-back';
    scoreBack.innerHTML = `<div class="modal quiz t-teal" role="dialog" aria-modal="true" aria-label="${esc(Q.title)}">
      <button class="close qz-x" aria-label="Close">✕</button>
      <div class="qz-top"><span class="qz-title">${esc(Q.title)}</span></div>
      <div class="qz-read qz-score">
        <h3>${esc(perfect ? Q.perfectTitle : Q.scoreTitle)}</h3>
        <div class="qz-scorerow">
          <p class="qz-big say"><b>${first}</b> ${esc(Q.outOf)} <b>${n}</b> ${esc(Q.firstTry)}</p>
          <span class="qz-pct${perfect ? ' perfect' : ''}" aria-label="${pct} percent">${pct}<small>%</small></span>
        </div>
        <p class="say">${esc(perfect ? Q.perfectSub : Q.goodJob)}</p>
      </div>
      <div class="qz-next"><button class="qz-ghost" data-again>${esc(Q.again)}</button><button class="qz-go" data-done>${esc(Q.done)}</button></div></div>`;
    document.body.appendChild(scoreBack);
    const done = () => { closeScore(); quiz = null; svg.classList.remove('quiz'); ROCK_KEYS.forEach(k => setNode(k, 'seen')); ui.setHud(D.hud); showEnd(false); ARROW_IDS.forEach(id => setArrow(id, 'seen')); };
    scoreBack.querySelector('[data-done]').onclick = done;
    scoreBack.querySelector('.qz-x').onclick = done;
    scoreBack.querySelector('[data-again]').onclick = startQuiz;
    if (perfect) ui.celebrate(Q.perfectTitle, Q.perfectSub, { dur: 6.5 });
  }

  // ---------- coming into and leaving Diagram mode ----------
  function enter() {
    if (active) { startLesson(); return; }          // tapped Diagram again: start over
    active = true; wrap.hidden = false; document.body.classList.add('mode-diagram');
    last = 0; requestAnimationFrame(loop);
    layout(); startLesson();
  }
  function leave() {
    if (!active) return;
    active = false; tk++; quiz = null; busy = false;
    movers.forEach(m => m.el.remove()); movers.length = 0;
    if (ghost) { ghost.remove(); ghost = null; }
    closeScore(); wrap.hidden = true; box.hidden = true; ui.speech.stop();
    document.body.classList.remove('mode-diagram');
    ui.updateInsets();                               // the menu bar is back: measure the 3D model's space again
  }
  energy.onMode(m => (m === 'diagram' ? enter() : leave()));

  return { enter, leave, startLesson, startQuiz, isActive: () => active, state: () => ({ step, quiz: quiz && { round: quiz.round, done: { ...quiz.done }, miss: { ...quiz.miss } }, busy }) };
}
