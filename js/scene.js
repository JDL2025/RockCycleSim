// =====================================================================
// Rock Cycle Explorer — the 3D block of Earth's crust.
// createScene(container) -> api. Draws the land, the cut rock faces, the
// sea and the river, the glowing grain of rock, labels and effects
// (rain cloud, arrows, lava, ash). Handles touch: drag to turn, pinch to
// zoom, two fingers to move.
// =====================================================================
import * as THREE from '../lib/three.module.min.js';
import * as G from './geo.js';
import * as SH from './glsl.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createScene(container) {
  const api = {};
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  let PR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(PR);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 600);
  const FOV_T = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const SUN = new THREE.Vector3(-0.55, 0.85, 0.5).normalize();
  api.THREE = THREE; api.scene = scene; api.camera = camera; api.renderer = renderer;
  api.space = null;          // Energy mode adds a space scene (stars, Sun, Earth) drawn behind the block
  api.inputOn = true;        // false = touches don't move the block (during the space scenes)

  const U = {
    uT: { value: 0 }, uSun: { value: SUN }, uLava: { value: 999 }, uFront: { value: 0.6 }, uGlow: { value: 0 },
    uErupt: { value: 0 }, uHeat: { value: 0 }, uMouth: { value: new THREE.Vector2(G.MOUTH[0], G.MOUTH[1]) }, uCam: { value: new THREE.Vector3() }
  };
  api.U = U;

  // ---------- textures (photos of real ground and rock, CC0 from Poly Haven) ----------
  const blank = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1); blank.needsUpdate = true;
  const TEX = ['grass', 'slope', 'rock', 'snow', 'sand', 'volc', 'rock_n', 'grass_n', 'sed', 'gneiss', 'granite', 'basalt', 'crust'];
  const FACE_TEX = new Set(['sed', 'gneiss', 'granite', 'basalt', 'crust']);
  const tex = {}; for (const n of TEX) tex[n] = { value: blank };
  const loader = new THREE.TextureLoader();
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  api.ready = Promise.all(TEX.map(n => new Promise(res => {
    loader.load(`assets/tex/${n}.jpg`, t => {
      t.wrapS = t.wrapT = FACE_TEX.has(n) ? THREE.MirroredRepeatWrapping : THREE.RepeatWrapping;
      t.anisotropy = aniso; t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true;
      tex[n].value = t; res();
    }, undefined, () => res());
  })));

  const block = new THREE.Group(); scene.add(block); api.block = block;

  // ---------- the ground ----------
  const NX = 384, NZ = 154, W8 = G.XR - G.XL, D = 2 * G.ZF;
  const tg = new THREE.PlaneGeometry(W8, D, NX, NZ); tg.rotateX(-Math.PI / 2);
  const tp = tg.attributes.position, hg = new Float32Array(tp.count);
  for (let i = 0; i < tp.count; i++) { const h = G.H(tp.getX(i), tp.getZ(i)); hg[i] = h; tp.setY(i, h); }
  tg.computeVertexNormals();
  // sunlight and shade, worked out once (soft shadows from the mountains, darker in hollows)
  const sampleH = (x, z) => {
    const fx = (x - G.XL) / W8 * NX, fz = (z + G.ZF) / D * NZ;
    if (fx < 0 || fz < 0 || fx > NX || fz > NZ) return null;
    const i = Math.min(NX - 1, Math.floor(fx)), j = Math.min(NZ - 1, Math.floor(fz)), u = fx - i, v = fz - j, k = j * (NX + 1) + i;
    return lerp(lerp(hg[k], hg[k + 1], u), lerp(hg[k + NX + 1], hg[k + NX + 2], u), v);
  };
  const sxz = Math.hypot(SUN.x, SUN.z), dx = SUN.x / sxz, dz = SUN.z / sxz, rise = SUN.y / sxz;
  const aSun = new Float32Array(tp.count), aAO = new Float32Array(tp.count);
  const AOD = []; for (let a = 0; a < 8; a++) AOD.push([Math.cos(a * Math.PI / 4), Math.sin(a * Math.PI / 4)]);
  for (let i = 0; i < tp.count; i++) {
    const x0 = tp.getX(i), z0 = tp.getZ(i), h0 = hg[i];
    let vis = 1, t = 0.025;
    while (t < 4) {
      const hh = sampleH(x0 + dx * t, z0 + dz * t); if (hh === null) break;
      const d = h0 + rise * t + 0.006 - hh;
      vis = Math.min(vis, clamp((d + 0.012) / (0.03 + 0.05 * t), 0, 1));
      if (vis <= 0) break;
      t *= 1.07; t += 0.004;
    }
    let occ = 0;
    for (const [cx, cz] of AOD) for (const r of [0.08, 0.25]) {
      const hh = sampleH(x0 + cx * r, z0 + cz * r); if (hh !== null) occ += clamp((hh - h0) / r, 0, 1.5);
    }
    aSun[i] = vis; aAO[i] = clamp(1 - occ / 16 * 0.9, 0.42, 1);
  }
  tg.setAttribute('aSun', new THREE.BufferAttribute(aSun, 1));
  tg.setAttribute('aAO', new THREE.BufferAttribute(aAO, 1));
  const terrainMat = new THREE.ShaderMaterial({
    uniforms: { ...U, tGrass: tex.grass, tSlope: tex.slope, tRock: tex.rock, tSnow: tex.snow, tSand: tex.sand, tVolc: tex.volc, tRockN: tex.rock_n, tGrassN: tex.grass_n },
    vertexShader: SH.TERRAIN_V, fragmentShader: SH.TERRAIN_F
  });
  block.add(new THREE.Mesh(tg, terrainMat));

  // ---------- the cut rock faces (front, back and both ends) ----------
  const faceMat = new THREE.ShaderMaterial({
    uniforms: { ...U, tSed: tex.sed, tGneiss: tex.gneiss, tGranite: tex.granite, tBasalt: tex.basalt, tCrust: tex.crust, tSand: tex.sand },
    vertexShader: SH.FACE_V, fragmentShader: SH.FACE_F
  });
  // a vertical wall: ts = points along the wall, P(t) -> [x, z], top(t) = ground height, n = outward normal
  function wall(ts, P, top, n, flip) {
    const pos = [], nor = [], tops = [], idx = [];
    ts.forEach((t, i) => {
      const [x, z] = P(t), h = top(t);
      pos.push(x, h, z, x, G.YB, z); nor.push(...n, ...n); tops.push(h, h);
      if (i) { const a = (i - 1) * 2; if (flip) idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); else idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('aTop', new THREE.Float32BufferAttribute(tops, 1));
    g.setIndex(idx); return g;
  }
  const xs = []; for (let i = 0; i <= 480; i++) xs.push(G.XL + W8 * i / 480);
  const zs = []; for (let i = 0; i <= 160; i++) zs.push(-G.ZF + D * i / 160);
  block.add(new THREE.Mesh(wall(xs, x => [x, G.ZF], x => G.H(x, G.ZF), [0, 0, 1], false), faceMat));
  block.add(new THREE.Mesh(wall(xs, x => [x, -G.ZF], x => G.H(x, -G.ZF), [0, 0, -1], true), faceMat));
  block.add(new THREE.Mesh(wall(zs, z => [G.XL, z], z => G.H(G.XL, z), [-1, 0, 0], true), faceMat));
  block.add(new THREE.Mesh(wall(zs, z => [G.XR, z], z => G.H(G.XR, z), [1, 0, 0], false), faceMat));
  const bottom = new THREE.Mesh(new THREE.PlaneGeometry(W8, D), new THREE.MeshBasicMaterial({ color: 0x2a2220 }));
  bottom.rotation.x = Math.PI / 2; bottom.position.y = G.YB; block.add(bottom);

  // ---------- sea ----------
  const sx0 = G.SHORE - 0.45, seaG = new THREE.PlaneGeometry(G.XR - sx0, D, 90, 120); seaG.rotateX(-Math.PI / 2); seaG.translate((sx0 + G.XR) / 2, G.SEA, 0);
  const sp = seaG.attributes.position, dep = new Float32Array(sp.count);
  for (let i = 0; i < sp.count; i++) dep[i] = G.SEA - G.H(sp.getX(i), sp.getZ(i));
  seaG.setAttribute('aDepth', new THREE.BufferAttribute(dep, 1));
  const seaMesh = new THREE.Mesh(seaG, new THREE.ShaderMaterial({ uniforms: U, vertexShader: SH.SEA_V, fragmentShader: SH.SEA_F, transparent: true, depthWrite: false }));
  seaMesh.renderOrder = 2; block.add(seaMesh);
  // water seen through the sides of the block
  const wsMat = new THREE.ShaderMaterial({ vertexShader: SH.WATERSIDE_V, fragmentShader: SH.WATERSIDE_F, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  function waterWall(ts, P, ground) {
    const pos = [], idx = [];
    ts.forEach((t, i) => { const [x, z] = P(t), g = Math.min(G.SEA, ground(t)); pos.push(x, G.SEA, z, x, g, z); if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, wsMat); m.renderOrder = 3; block.add(m);
  }
  const wxs = []; for (let i = 0; i <= 80; i++) wxs.push(G.SHORE - 0.05 + (G.XR - G.SHORE + 0.05) * i / 80);
  waterWall(wxs, x => [x, G.ZF + 0.003], x => G.H(x, G.ZF));
  waterWall(wxs, x => [x, -G.ZF - 0.003], x => G.H(x, -G.ZF));
  waterWall(zs, z => [G.XR + 0.003, z], z => G.H(G.XR, z));

  // ---------- river ----------
  {
    const rp = [], ruv = [], ridx = [], RN = 300, x0 = G.RIV0 + 0.02, x1 = G.SHORE + 0.1;
    for (let i = 0; i <= RN; i++) {
      const x = x0 + (x1 - x0) * i / RN, z = G.riverZ(x), sl = (G.riverZ(x + 0.01) - G.riverZ(x - 0.01)) / 0.02, nl = Math.sqrt(1 + sl * sl);
      const hw = 0.05 * G.riverWide(x) * Math.min(1, (x - G.RIV0) / 0.3 + 0.35);
      const y = x < G.SHORE ? Math.max(G.riverBed(x) + G.RIVW, G.SEA + 0.002) : G.SEA + 0.002;
      rp.push(x + sl * hw / nl, y, z - hw / nl, x - sl * hw / nl, y, z + hw / nl); ruv.push(i / RN, 0, i / RN, 1);
      if (i) { const a = (i - 1) * 2; ridx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(ruv, 2)); g.setIndex(ridx);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: U, vertexShader: SH.RIVER_V, fragmentShader: SH.RIVER_F, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    m.renderOrder = 1; block.add(m);
  }
  // sand and mud carried by the river
  const SGN = 90, sgPos = new Float32Array(SGN * 3), sgT = [];
  for (let i = 0; i < SGN; i++) sgT.push(Math.random());
  const sgGeo = new THREE.BufferGeometry(); sgGeo.setAttribute('position', new THREE.BufferAttribute(sgPos, 3));
  const sedPts = new THREE.Points(sgGeo, new THREE.PointsMaterial({ color: 0x9a7848, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0.9 }));
  sedPts.renderOrder = 4; block.add(sedPts);

  // ---------- small pictures for effects (drawn once) ----------
  function canvasTex(w, h, paint) { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const radial = (c0, c1) => canvasTex(64, 64, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, c0); g.addColorStop(1, c1); c.fillStyle = g; c.fillRect(0, 0, w, w); });
  const glowT = radial('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
  const smokeT = canvasTex(128, 128, (c, w) => {
    for (let i = 0; i < 26; i++) {
      const x = w / 2 + (Math.random() - 0.5) * w * 0.45, y = w / 2 + (Math.random() - 0.5) * w * 0.45, r = w * (0.12 + Math.random() * 0.16);
      const g = c.createRadialGradient(x, y, 0, x, y, r); const v = 90 + Math.random() * 50;
      g.addColorStop(0, `rgba(${v},${v - 4},${v - 8},0.55)`); g.addColorStop(1, `rgba(${v},${v},${v},0)`); c.fillStyle = g; c.fillRect(0, 0, w, w);
    }
  });
  const cloudT = canvasTex(256, 160, (c, w, h) => {
    const puffs = [[0.5, 0.52, 0.3], [0.3, 0.6, 0.22], [0.7, 0.6, 0.22], [0.42, 0.38, 0.22], [0.6, 0.36, 0.2], [0.18, 0.7, 0.14], [0.82, 0.7, 0.14]];
    for (const [px, py, pr] of puffs) {
      const x = px * w, y = py * h, r = pr * w;
      const g = c.createRadialGradient(x - r * 0.25, y - r * 0.35, r * 0.1, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(232,236,242,0.97)'); g.addColorStop(0.85, 'rgba(170,180,195,0.85)'); g.addColorStop(1, 'rgba(150,160,175,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    const sh = c.createLinearGradient(0, h * 0.45, 0, h); sh.addColorStop(0, 'rgba(90,100,120,0)'); sh.addColorStop(1, 'rgba(90,100,120,0.45)');
    c.globalCompositeOperation = 'source-atop'; c.fillStyle = sh; c.fillRect(0, 0, w, h);
  });
  const arrowT = canvasTex(64, 64, c => {
    c.fillStyle = 'rgba(255,255,255,0.96)'; c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 3; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(32, 4); c.lineTo(59, 32); c.lineTo(42, 32); c.lineTo(42, 60); c.lineTo(22, 60); c.lineTo(22, 32); c.lineTo(5, 32); c.closePath(); c.fill(); c.stroke();
  });
  const starT = canvasTex(64, 64, (c, w) => {
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(200,235,255,0.6)'); g.addColorStop(1, 'rgba(160,220,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, w); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(32, 4); c.lineTo(32, 60); c.moveTo(4, 32); c.lineTo(60, 32); c.stroke();
  });
  const sprite = (map, color, opts = {}) => {
    const m = new THREE.SpriteMaterial({ map, color, transparent: true, depthWrite: false, depthTest: opts.depthTest ?? true, blending: opts.add ? THREE.AdditiveBlending : THREE.NormalBlending, opacity: opts.opacity ?? 1 });
    const s = new THREE.Sprite(m); s.renderOrder = opts.order ?? 5; return s;
  };
  // glow over the crater and the magma chamber
  const craterGlow = sprite(glowT, 0xff8a2a, { add: true, opacity: 0.6 }); craterGlow.scale.set(0.55, 0.55, 1); craterGlow.position.set(G.VX, G.Hf(G.VX) + 0.05, G.ZF - 0.06); block.add(craterGlow);
  const chamberGlow = sprite(glowT, 0xff6a1a, { add: true, opacity: 0.35 }); chamberGlow.scale.set(2.6, 1.2, 1); chamberGlow.position.set(G.CHM.x, G.CHM.y, G.ZF + 0.06); block.add(chamberGlow);

  // ---------- rain cloud (weathering) ----------
  const cloud = new THREE.Group(); cloud.visible = false; block.add(cloud);
  const cs = sprite(cloudT, 0xffffff, { order: 6 }); cs.scale.set(1.25, 0.78, 1); cloud.add(cs);
  const RAIN = 90, rainPos = new Float32Array(RAIN * 6), rainSeed = [];
  for (let i = 0; i < RAIN; i++) rainSeed.push([(Math.random() - 0.5) * 0.95, Math.random(), (Math.random() - 0.5) * 0.5]);
  const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xbfe2ff, transparent: true, opacity: 0.75 })); rain.renderOrder = 5; cloud.add(rain);

  // ---------- arrows and the rising column (compaction, squeezing, uplift) ----------
  const arrows = []; for (let i = 0; i < 4; i++) { const a = sprite(arrowT, 0xffffff, { depthTest: false, order: 11 }); a.scale.set(0.22, 0.22, 1); a.visible = false; block.add(a); arrows.push(a); }
  const column = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xfff1b8, transparent: true, opacity: 0.22, depthWrite: false }));
  column.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), new THREE.LineBasicMaterial({ color: 0xffe082 })));
  column.visible = false; column.renderOrder = 9; block.add(column);

  // ---------- eruption: lava fountain and ash cloud ----------
  const FN = 90, fPos = new Float32Array(FN * 3), fVel = [], fLife = new Float32Array(FN);
  for (let i = 0; i < FN; i++) { fVel.push([0, 0, 0]); fLife[i] = -1; }
  const fGeo = new THREE.BufferGeometry(); fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
  const fountain = new THREE.Points(fGeo, new THREE.PointsMaterial({ map: glowT, color: 0xffa040, size: 0.1, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  fountain.visible = false; fountain.renderOrder = 7; block.add(fountain);
  const ash = []; for (let i = 0; i < 18; i++) { const a = sprite(smokeT, 0x8a8580, { order: 7 }); a.userData.t = i / 18; a.visible = false; block.add(a); ash.push(a); }
  const VENT = new THREE.Vector3(G.VX, G.Hf(G.VX) + 0.04, G.ZF - 0.07);

  // ---------- heat glow and cooling sparkles around the grain ----------
  const halo = sprite(glowT, 0xff7a20, { add: true, depthTest: false, order: 9, opacity: 0 }); halo.scale.set(0.9, 0.9, 1); block.add(halo);
  const sparks = []; for (let i = 0; i < 12; i++) { const s = sprite(starT, 0xcfeeff, { add: true, depthTest: false, order: 11, opacity: 0 }); s.userData.a = Math.random() * 6.28; s.userData.r = 0.12 + Math.random() * 0.14; s.userData.p = Math.random() * 6.28; block.add(s); sparks.push(s); }

  // ---------- the grain of rock (always visible) and its trail ----------
  // (the grain is 'transparent' only so it is drawn after its glow, which keeps its color true)
  const grain = new THREE.Mesh(new THREE.SphereGeometry(0.062, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffcdd2, depthTest: false, transparent: true }));
  grain.renderOrder = 12; block.add(grain);
  const grainGlow = sprite(glowT, 0xfff3a0, { add: true, depthTest: false, order: 11, opacity: 0.85 }); grainGlow.scale.set(0.42, 0.42, 1); grain.add(grainGlow);
  // a dark-and-white outline, so the grain shows up even on glowing magma
  const outlineT = canvasTex(128, 128, c => {
    c.strokeStyle = 'rgba(10,12,18,0.95)'; c.lineWidth = 14; c.beginPath(); c.arc(64, 64, 46, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,1)'; c.lineWidth = 6; c.beginPath(); c.arc(64, 64, 46, 0, Math.PI * 2); c.stroke();
  });
  const outline = sprite(outlineT, 0xffffff, { depthTest: false, order: 13 }); outline.scale.set(0.2, 0.2, 1); grain.add(outline);
  const ringT = canvasTex(128, 128, c => { c.strokeStyle = 'rgba(255,255,255,1)'; c.lineWidth = 7; c.beginPath(); c.arc(64, 64, 52, 0, Math.PI * 2); c.stroke(); });
  const ring = sprite(ringT, 0xffffff, { depthTest: false, order: 12, opacity: 0 }); ring.scale.set(0.3, 0.3, 1); block.add(ring);
  const TR = 140, trPos = new Float32Array(TR * 3), trA = new Float32Array(TR);
  const trGeo = new THREE.BufferGeometry(); trGeo.setAttribute('position', new THREE.BufferAttribute(trPos, 3)); trGeo.setAttribute('aA', new THREE.BufferAttribute(trA, 1)); trGeo.setDrawRange(0, 0);
  const trMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0xffeb3b) }, uPR: { value: PR }, uMap: { value: glowT } },
    vertexShader: 'attribute float aA; uniform float uPR; varying float vA; void main(){ vA = aA; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uPR * (5.0 + 9.0 * aA); }',
    fragmentShader: 'uniform vec3 uColor; uniform sampler2D uMap; varying float vA; void main(){ float a = texture2D(uMap, gl_PointCoord).a; gl_FragColor = vec4(uColor, a * (0.15 + 0.8 * vA)); }',
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const trail = new THREE.Points(trGeo, trMat); trail.renderOrder = 10; trail.frustumCulled = false; block.add(trail);
  let trN = 0;
  api.grain = {
    set(p) { grain.position.set(p[0], p[1], p[2]); api.requestRender(); },
    pos: () => [grain.position.x, grain.position.y, grain.position.z],
    color(hex) {                                     // the grain, its glow and its trail all take the rock's color
      grain.material.color.setHex(hex); trMat.uniforms.uColor.value.setHex(hex);
      grainGlow.material.color.setHex(hex);
    },
    trailReset() { trN = 0; trGeo.setDrawRange(0, 0); },
    trailPush(p) {
      trPos.copyWithin(3, 0, (TR - 1) * 3); trPos[0] = p[0]; trPos[1] = p[1]; trPos[2] = p[2];
      trN = Math.min(TR, trN + 1); for (let i = 0; i < trN; i++) trA[i] = 1 - i / TR;
      trGeo.setDrawRange(0, trN); trGeo.attributes.position.needsUpdate = true; trGeo.attributes.aA.needsUpdate = true;
    },
    pop() { popT = 0; },
    scale(s) { grain.scale.setScalar(s); }
  };
  let popT = 1;

  // ---------- effects the processes can turn on ----------
  // water seeping down through buried sediment (cementation)
  const SEEPN = 46, seepPos = new Float32Array(SEEPN * 3), seepSeed = [];
  for (let i = 0; i < SEEPN; i++) seepSeed.push([(Math.random() - 0.5) * 0.62, Math.random(), 0.6 + Math.random() * 0.5]);
  const seepGeo = new THREE.BufferGeometry(); seepGeo.setAttribute('position', new THREE.BufferAttribute(seepPos, 3));
  const seepMat = new THREE.PointsMaterial({ map: glowT, color: 0x8fd8ff, size: 0.08, transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const seep = new THREE.Points(seepGeo, seepMat); seep.renderOrder = 11; seep.frustumCulled = false; block.add(seep);
  const seepArrows = []; for (let i = 0; i < 3; i++) { const a = sprite(arrowT, 0x7fd3ff, { depthTest: false, order: 11, opacity: 0 }); a.material.rotation = Math.PI; a.scale.set(0.12, 0.12, 1); block.add(a); seepArrows.push(a); }
  const glue = sprite(glowT, 0xffd54f, { add: true, depthTest: false, order: 9, opacity: 0 }); glue.scale.set(0.7, 0.42, 1); block.add(glue);
  // Energy mode: vapor from the sea, and heat below the magma chamber
  const VAPN = 110, vapPos = new Float32Array(VAPN * 3), vapSeed = [];
  for (let i = 0; i < VAPN; i++) vapSeed.push([G.SHORE + 0.3 + Math.random() * (G.XR - G.SHORE - 0.4), (Math.random() - 0.5) * 2.8, Math.random()]);
  const vapGeo = new THREE.BufferGeometry(); vapGeo.setAttribute('position', new THREE.BufferAttribute(vapPos, 3));
  const vapMat = new THREE.PointsMaterial({ map: glowT, color: 0xf2f8ff, size: 0.32, transparent: true, opacity: 0, depthWrite: false });
  const vapPts = new THREE.Points(vapGeo, vapMat); vapPts.renderOrder = 6; vapPts.frustumCulled = false; block.add(vapPts);
  const deepGlow = []; for (let i = 0; i < 3; i++) { const g = sprite(glowT, i ? 0xff3010 : 0xff4a14, { add: true, depthTest: false, order: 9, opacity: 0 }); block.add(g); deepGlow.push(g); }
  const deepArrows = []; for (let i = 0; i < 5; i++) { const a = sprite(arrowT, 0xff6a3a, { depthTest: false, order: 11, opacity: 0 }); a.scale.set(0.16, 0.16, 1); block.add(a); deepArrows.push(a); }
  let fx = { cloudAt: null, vapor: 0, vaporTo: [3, 1, 0], deep: 0, arrows: null, column: null, cloud: null, heat: 0, heatColor: 0xff7a20, sparkle: 0, sparkColor: 0xcfeeff, seep: 0, glue: 0, eruptT: -1, lavaT: -1 };
  api.cloudSpot = p => [p[0], Math.max(p[1], 0.4) + 0.95, clamp(p[2], -1.2, 1.25)];
  api.fx = {
    clear() { fx.arrows = null; fx.column = null; fx.cloud = null; fx.heat = 0; fx.sparkle = 0; fx.seep = 0; fx.glue = 0; },
    // Energy mode: a cloud placed anywhere (pos = cloud middle), any size, rain on or off
    cloudAt(pos, size = 1, rain = false) { fx.cloudAt = pos ? { pos, size, rain } : null; },
    // Energy mode: water vapor rising from the sea toward a spot in the sky
    vapor(amount, to) { fx.vapor = amount; if (to) fx.vaporTo = to; },
    // Energy mode: red heat glowing under the magma chamber
    deepHeat(amount) { fx.deep = amount; },
    cloud(p) { fx.cloud = p; },                     // p = point under the cloud, or null
    arrows(kind, p) { fx.arrows = kind ? { kind, p } : null; },   // 'down', 'squeeze', 'up'
    column(p) { fx.column = p; },
    heat(amount, color = 0xff7a20) { fx.heat = amount; fx.heatColor = color; },
    sparkle(amount, color = 0xcfeeff) { fx.sparkle = amount; fx.sparkColor = color; },
    seep(amount) { fx.seep = amount; },          // water trickling down past the grain
    glue(amount) { fx.glue = amount; },          // minerals gluing the sediment: a golden glow
    erupt(frontSpeed) { fx.eruptT = 0; fx.lavaT = 0; U.uFront.value = frontSpeed; },
    resetLava() { fx.eruptT = -1; fx.lavaT = -1; U.uLava.value = 999; }
  };

  // ---------- labels ----------
  const tagsEl = document.getElementById('tags');
  const LABELS = [
    ['mtn', 'Mountains', [-2.5, 2.05, -0.25], false, 1], ['vol', 'Volcano', [G.VX + 0.05, G.Hf(G.VX) + 0.45, G.ZF - 0.35], false, 1],
    ['riv', 'River', [-0.6, 0.35, G.riverZ(-0.6)], false, 2], ['dlt', 'Delta', [G.MOUTH[0] + 0.32, 0.22, G.MOUTH[1] + 0.32], false, 3],
    ['sea', 'Sea', [3.55, 0.3, 0.55], false, 2], ['mag', 'Magma chamber', [G.CHM.x + 0.1, G.CHM.y - 0.05, G.ZF], true, 1],
    ['gra', 'Igneous rock', [G.PLU.x, G.PLU.y, G.ZF], true, 1], ['met', 'Metamorphic rock', [2.9, -2.2, G.ZF], true, 1],
    ['sed', 'Sedimentary layers', [2.55, -0.72, G.ZF], true, 1], ['lav', 'Lava layers', [G.VX + 0.66, 0.42, G.ZF], true, 2]
  ];
  api.labelText = {}; for (const l of LABELS) api.labelText[l[0]] = l[1];
  const tags = LABELS.map(([id, text, p, face, pri]) => {
    const el = document.createElement('div'); el.className = 'rtag' + (face ? ' face' : ''); el.textContent = text; el.style.display = 'none'; tagsEl.appendChild(el);
    return { id, el, p: new THREE.Vector3(...p), face, pri, w: 0, h: 0 };
  });
  api.setLabelText = (id, text) => { const t = tags.find(x => x.id === id); if (t) { t.el.textContent = text; t.w = 0; } };
  let labelsOn = true; api.setLabels = on => { labelsOn = on; api.requestRender(); }; api.labelsOn = () => labelsOn;
  const insets = { l: 0, r: 0, t: 0, b: 0 };
  const v3 = new THREE.Vector3();
  function placeLabels() {
    const fromAbove = view.pitch > 1.0, placed = [];
    const L = insets.l + 4, R = W - insets.r - 4, T = insets.t, B = H - insets.b;
    const order = [...tags].sort((a, b) => a.pri - b.pri);
    for (const t of order) {
      if (!labelsOn || api.hideLabels || !block.visible || block.scale.x < 0.6 || (t.face && fromAbove)) { t.el.style.display = 'none'; continue; }
      v3.copy(t.p).applyMatrix4(block.matrixWorld).project(camera);
      if (v3.z > 1 || Math.abs(v3.x) > 1.1 || Math.abs(v3.y) > 1.1) { t.el.style.display = 'none'; continue; }
      if (!t.w) { t.el.style.display = ''; t.w = t.el.offsetWidth; t.h = t.el.offsetHeight; }
      const x = (v3.x * 0.5 + 0.5) * W, y = (-v3.y * 0.5 + 0.5) * H;
      const box = [x - t.w / 2, y - t.h / 2, x + t.w / 2, y + t.h / 2];
      const hit = b => placed.some(q => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]);
      let ok = !hit(box);
      if (!ok) { box[1] -= t.h + 4; box[3] -= t.h + 4; ok = !hit(box); }
      if (ok && (box[0] < L || box[2] > R || box[1] < T || box[3] > B)) ok = false;
      if (!ok) { t.el.style.display = 'none'; continue; }
      placed.push(box);
      t.el.style.display = '';
      t.el.style.transform = `translate(${box[0].toFixed(1)}px, ${box[1].toFixed(1)}px)`;
    }
  }

  // ---------- camera ----------
  const VIEWS = { front: { yaw: 0, pitch: 0.06 }, tilt: { yaw: -0.42, pitch: 0.46 }, top: { yaw: 0, pitch: 1.42 } };
  const TARGET0 = new THREE.Vector3(0, -0.6, 0);
  const view = { yaw: VIEWS.tilt.yaw, pitch: VIEWS.tilt.pitch, k: 1, target: TARGET0.clone() };
  api.view = view;
  let W = 1, H = 1;
  // how far away the camera must be so the whole block fits in the free space (opening view)
  const CORNERS = [];
  for (const x of [G.XL, G.XR]) for (const z of [-G.ZF, G.ZF]) for (const y of [G.YB, 0.2]) CORNERS.push(new THREE.Vector3(x, y, z));
  CORNERS.push(new THREE.Vector3(G.MTN, 1.85, 0), new THREE.Vector3(G.MTN, 1.6, G.ZF), new THREE.Vector3(G.MTN, 1.6, -G.ZF));
  const fitCam = new THREE.PerspectiveCamera(camera.fov, 1, 0.05, 120), fv = new THREE.Vector3();
  let fitCache = null;
  function fits(v, d, aw, ah) {
    fitCam.aspect = aw / ah; fitCam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(FOV_T * ah / H)); fitCam.updateProjectionMatrix();
    fitCam.position.set(TARGET0.x + Math.sin(v.yaw) * Math.cos(v.pitch) * d, TARGET0.y + Math.sin(v.pitch) * d, TARGET0.z + Math.cos(v.yaw) * Math.cos(v.pitch) * d);
    fitCam.up.set(0, 1, 0); if (v.pitch > 1.3) fitCam.up.set(-Math.sin(v.yaw), 0, -Math.cos(v.yaw));
    fitCam.lookAt(TARGET0); fitCam.updateMatrixWorld();
    for (const c of CORNERS) {
      fv.copy(c).applyMatrix4(fitCam.matrixWorldInverse); if (fv.z > -0.2) return false;
      fv.copy(c).project(fitCam); if (Math.abs(fv.x) > 0.97 || Math.abs(fv.y) > 0.95) return false;
    }
    return true;
  }
  function fitDist() {
    const aw = Math.max(240, W - insets.l - insets.r), ah = Math.max(200, H - insets.t - insets.b);
    const key = aw + 'x' + ah;
    if (fitCache && fitCache.key === key) return fitCache.d;
    let d = 6;
    for (const v of [VIEWS.tilt]) { let lo = 4, hi = 80; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (fits(v, m, aw, ah)) hi = m; else lo = m; } d = Math.max(d, hi); }
    fitCache = { key, d }; return d;
  }
  api.fitDist = fitDist;
  const K_MIN = 0.2, K_MAX = 1.7;
  let viewTween = null;
  api.getView = () => ({ yaw: view.yaw, pitch: view.pitch, k: view.k, target: view.target.toArray() });
  // fly the camera to a view: { yaw, pitch, k, target: [x, y, z] }
  api.flyTo = (v, ms = 1400) => {
    const from = { yaw: view.yaw, pitch: view.pitch, k: view.k, t: view.target.clone() };
    const to = { yaw: v.yaw ?? view.yaw, pitch: v.pitch ?? view.pitch, k: v.k ?? view.k, t: v.target ? new THREE.Vector3(...v.target) : view.target.clone() };
    while (to.yaw - from.yaw > Math.PI) to.yaw -= 2 * Math.PI; while (from.yaw - to.yaw > Math.PI) to.yaw += 2 * Math.PI;
    rotV.y = rotV.p = 0; zoomV = 0;
    const t0 = performance.now();
    viewTween = now => {
      const t = clamp((now - t0) / ms, 0, 1), e = ease(t);
      view.yaw = lerp(from.yaw, to.yaw, e); view.pitch = lerp(from.pitch, to.pitch, e); view.k = lerp(from.k, to.k, e);
      view.target.lerpVectors(from.t, to.t, e);
      if (t >= 1) viewTween = null;
    };
    lastInput = performance.now(); api.requestRender();
  };
  api.setView = (name, ms = 1000) => {
    const v = VIEWS[name]; if (!v) return;
    const from = { yaw: view.yaw, pitch: view.pitch, k: view.k, t: view.target.clone() };
    let yawTo = v.yaw; while (yawTo - from.yaw > Math.PI) yawTo -= 2 * Math.PI; while (from.yaw - yawTo > Math.PI) yawTo += 2 * Math.PI;
    rotV.y = rotV.p = 0; zoomV = 0;
    const t0 = performance.now();
    viewTween = now => {
      const t = clamp((now - t0) / ms, 0, 1), e = ease(t);
      view.yaw = lerp(from.yaw, yawTo, e); view.pitch = lerp(from.pitch, v.pitch, e); view.k = lerp(from.k, 1, e);
      view.target.lerpVectors(from.t, TARGET0, e);
      if (t >= 1) viewTween = null;
    };
    api.requestRender();
  };
  api.setInsets = (l, r, t, b) => { insets.l = l; insets.r = r; insets.t = t; insets.b = b; tags.forEach(x => x.w = 0); api.requestRender(); };

  // ---------- touch & mouse ----------
  const el = renderer.domElement;
  const pointers = new Map();
  let gesture = null, rotV = { y: 0, p: 0 }, zoomV = 0, lastInput = performance.now();
  api.onTap = null;
  const worldPerPx = () => 2 * fitDist() * view.k * FOV_T / H;
  const camRight = new THREE.Vector3(), camUp = new THREE.Vector3(), tmpV = new THREE.Vector3();
  function panBy(dxp, dyp) {
    const s = worldPerPx();
    camRight.setFromMatrixColumn(camera.matrixWorld, 0); camUp.setFromMatrixColumn(camera.matrixWorld, 1);
    view.target.addScaledVector(camRight, -dxp * s).addScaledVector(camUp, dyp * s);
    view.target.x = clamp(view.target.x, -4.5, 4.5); view.target.y = clamp(view.target.y, -3, 2); view.target.z = clamp(view.target.z, -2, 2);
  }
  function zoomAt(f, px, py) {                       // zoom by factor f, keeping the spot under (px, py) still
    const k0 = view.k, k1 = clamp(k0 * f, K_MIN, K_MAX); if (k1 === k0) return false;
    const cx = (W + insets.l - insets.r) / 2, cy = (H + insets.t - insets.b) / 2;
    const mx = px - cx, my = py - cy, s = worldPerPx();
    camRight.setFromMatrixColumn(camera.matrixWorld, 0); camUp.setFromMatrixColumn(camera.matrixWorld, 1);
    const g = 1 - k1 / k0;
    view.target.addScaledVector(camRight, mx * s * g).addScaledVector(camUp, -my * s * g);
    view.k = k1; return true;
  }
  el.addEventListener('pointerdown', e => {
    if (!api.inputOn) return;
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    rotV.y = rotV.p = 0; zoomV = 0; viewTween = null; lastInput = performance.now();
    if (pointers.size === 1) gesture = { t0: performance.now(), x0: e.clientX, y0: e.clientY, moved: false, multi: false, lastT: performance.now(), pan: e.button === 2 || e.shiftKey };
    else if (gesture) { gesture.multi = true; gesture.pinch = pinchState(); }
  });
  function pinchState() { const [a, b] = [...pointers.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; }
  el.addEventListener('pointermove', e => {
    const p = pointers.get(e.pointerId); if (!p || !gesture) return;
    const ddx = e.clientX - p.x, ddy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; lastInput = performance.now();
    if (Math.hypot(e.clientX - gesture.x0, e.clientY - gesture.y0) > 8) gesture.moved = true;
    if (pointers.size === 1 && !gesture.multi) {
      if (gesture.pan) { panBy(ddx, ddy); return; }
      const now = performance.now(), dt = Math.max(8, now - gesture.lastT) / 16; gesture.lastT = now;
      const sp = 0.0062;
      view.yaw -= ddx * sp; view.pitch = clamp(view.pitch + ddy * sp * 0.8, -0.08, 1.48);
      rotV.y = -ddx * sp / dt; rotV.p = ddy * sp * 0.8 / dt;
    } else if (pointers.size === 2 && gesture.pinch) {
      const now = pinchState(), s = gesture.pinch;
      const f = Math.pow(s.d / Math.max(now.d, 1), 1.35);
      zoomAt(f, now.mx, now.my);
      panBy(now.mx - s.mx, now.my - s.my);
      zoomV = Math.log(f) * 0.6 + zoomV * 0.4;
      gesture.pinch = now;
    }
  });
  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (gesture && pointers.size === 0) {
      if (!gesture.moved && !gesture.multi && performance.now() - gesture.t0 < 500 && api.onTap) api.onTap(e.clientX, e.clientY);
      if (performance.now() - gesture.lastT > 70) rotV.y = rotV.p = 0;
      if (!gesture.multi) zoomV = 0;
      gesture = null;
    } else if (gesture && pointers.size === 1) { gesture.pinch = null; rotV.y = rotV.p = 0; }
  }
  el.addEventListener('pointerup', endPointer);
  el.addEventListener('pointercancel', endPointer);
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('wheel', e => {
    e.preventDefault(); if (!api.inputOn) return; viewTween = null; zoomV = 0; lastInput = performance.now();
    zoomAt(Math.exp(clamp(e.deltaY, -120, 120) * (e.ctrlKey ? 0.012 : 0.0035)), e.clientX, e.clientY);
  }, { passive: false });
  api.zoomBy = f => zoomAt(f, (W + insets.l - insets.r) / 2, (H + insets.t - insets.b) / 2);

  // ---------- size ----------
  function resize() {
    W = container.clientWidth || innerWidth; H = container.clientHeight || innerHeight;
    renderer.setSize(W, H, false); el.style.width = W + 'px'; el.style.height = H + 'px';
    tags.forEach(x => x.w = 0); api.W = W; api.H = H; dirty = true;
  }
  window.addEventListener('resize', resize);
  api.project = (p) => { v3.set(p[0], p[1], p[2]).applyMatrix4(block.matrixWorld).project(camera); return { x: (v3.x * 0.5 + 0.5) * W, y: (-v3.y * 0.5 + 0.5) * H, ok: v3.z < 1 }; };

  // ---------- render loop ----------
  let dirty = true, running = true;
  api.requestRender = () => { dirty = true; };
  api.frameHooks = new Set();
  api.afterRenderHooks = new Set();
  api.busy = false;                                    // true while a process is animating
  api.timeScale = 1;                                   // 0 = paused
  let last = performance.now(), frameN = 0, ambient = 0, perfN = 0, perfSum = 0;
  const shift = { x: 0, y: 0 };
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const rdt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now; frameN++;
    if (api.paused) { dirty = true; return; }             // another mode covers the 3D model: don't draw it
    const idle = !api.busy && !api.awake && !(api.space && api.space.on) && !gesture && now - lastInput > 7000 && !viewTween && Math.abs(rotV.y) < 1e-5 && Math.abs(zoomV) < 1e-4 && fx.lavaT < 0;
    if (idle && !dirty && frameN % 3) return;           // calm water when nobody is touching: fewer frames
    const dt = idle ? rdt * 3 : rdt;
    const sdt = dt * api.timeScale;                       // process time (stops when paused)
    ambient += dt; U.uT.value = ambient;
    if (viewTween) viewTween(now);
    if (!gesture) {
      if (Math.abs(rotV.y) > 1e-5 || Math.abs(rotV.p) > 1e-5) { view.yaw += rotV.y; view.pitch = clamp(view.pitch + rotV.p, -0.08, 1.48); rotV.y *= 0.93; rotV.p *= 0.93; }
      if (Math.abs(zoomV) > 1e-4) { if (!api.zoomBy(Math.exp(zoomV))) zoomV = 0; zoomV *= 0.86; }
    }
    for (const h of api.frameHooks) h(rdt, sdt, now);
    // river sediment
    for (let i = 0; i < SGN; i++) {
      const s = (sgT[i] + ambient * 0.04) % 1, x = G.RIV0 + 0.12 + (G.SHORE + 0.5 - G.RIV0 - 0.12) * s;
      const off = (((i * 0.618) % 1) - 0.5) * 0.07 * G.riverWide(Math.min(x, G.SHORE));
      sgPos[i * 3] = x; sgPos[i * 3 + 2] = G.riverZ(Math.min(x, G.SHORE)) + off * (x > G.SHORE ? 1 + (x - G.SHORE) * 6 : 1);
      sgPos[i * 3 + 1] = x < G.SHORE ? Math.max(G.riverBed(x) + G.RIVW, G.SEA) + 0.006 : G.SEA + 0.002 - (x - G.SHORE) * 0.06;
    }
    sgGeo.attributes.position.needsUpdate = true;
    // effects
    const gp = grain.position;
    if (popT < 1) { popT = Math.min(1, popT + rdt * 2.5); const s = 1 + 0.6 * Math.sin(popT * Math.PI); grain.scale.setScalar(s); ring.material.opacity = 1 - popT; ring.scale.setScalar(0.25 + popT * 0.9); ring.position.copy(gp); }
    else { ring.material.opacity = 0; }
    grainGlow.material.opacity = 0.5 + 0.2 * Math.sin(ambient * 5);
    cloud.visible = !!(fx.cloud || fx.cloudAt);
    rain.visible = !!fx.cloud || !!(fx.cloudAt && fx.cloudAt.rain);
    if (fx.cloudAt && !fx.cloud) { const c = fx.cloudAt; cloud.position.set(c.pos[0], c.pos[1], c.pos[2]); cs.scale.set(1.25 * c.size, 0.78 * c.size, 1); cs.material.opacity = Math.min(1, c.size * 1.4); }
    else { cs.scale.set(1.25, 0.78, 1); cs.material.opacity = 1; }
    if (fx.cloud) cloud.position.set(...api.cloudSpot(fx.cloud));
    if (rain.visible) {
      for (let i = 0; i < RAIN; i++) {
        const r = rainSeed[i]; r[1] = (r[1] + sdt * 1.6) % 1; const yy = -0.12 - r[1] * 0.85;
        rainPos.set([r[0], yy, r[2], r[0] - 0.008, yy - 0.07, r[2]], i * 6);
      }
      rainGeo.attributes.position.needsUpdate = true;
    }
    vapMat.opacity += (Math.min(1, fx.vapor) * 0.45 - vapMat.opacity) * Math.min(1, rdt * 3);
    if (vapMat.opacity > 0.01) {
      const to = fx.vaporTo;
      for (let i = 0; i < VAPN; i++) {
        const v = vapSeed[i]; v[2] = (v[2] + rdt * 0.16) % 1; const t = v[2], e = t * t;
        vapPos[i * 3] = v[0] + (to[0] - v[0]) * e + 0.05 * Math.sin(t * 9 + i);
        vapPos[i * 3 + 1] = G.SEA + 0.02 + (to[1] - G.SEA) * t;
        vapPos[i * 3 + 2] = v[1] + (to[2] - v[1]) * e;
      }
      vapGeo.attributes.position.needsUpdate = true;
    }
    deepGlow.forEach((g, i) => {
      const pulse = 0.55 + 0.45 * Math.sin(ambient * 2.6 - i * 0.9);
      g.material.opacity += (fx.deep * pulse - g.material.opacity) * Math.min(1, rdt * 4);
      g.position.set(G.CHM.x + (i ? (i === 1 ? -1 : 1) * 0.85 : 0), G.CHM.y - 0.66, G.FZ + 0.04);
      const sc = (i ? 1.9 : 2.9) * (0.8 + 0.25 * pulse); g.scale.set(sc, sc * 0.6, 1);
    });
    deepArrows.forEach((a, i) => {
      const s = (ambient * 0.45 + i / 5) % 1;
      a.material.opacity = fx.deep * Math.sin(s * Math.PI) * 0.95;
      a.position.set(G.CHM.x + (i - 2) * 0.4, G.CHM.y - 0.85 + s * 0.45, G.FZ + 0.06);
    });
    arrows.forEach(a => a.visible = false); column.visible = false;
    if (fx.arrows) {
      const { kind, p } = fx.arrows, wob = 0.03 * Math.sin(ambient * 6), z = G.FZ + 0.05;
      const [a0, a1] = arrows; a0.visible = a1.visible = true;
      if (kind === 'down') [a0, a1].forEach((a, i) => { a.material.rotation = Math.PI; a.position.set(p[0] + (i ? 0.17 : -0.17), p[1] + 0.3 + wob, z); });
      else if (kind === 'squeeze') { a0.material.rotation = -Math.PI / 2; a1.material.rotation = Math.PI / 2; a0.position.set(p[0] - 0.3 - wob, p[1], z); a1.position.set(p[0] + 0.3 + wob, p[1], z); }
      else if (kind === 'up') [a0, a1].forEach((a, i) => { a.material.rotation = 0; a.position.set(p[0] + (i ? 0.32 : -0.32), p[1] - 0.05 + wob, z); });
    }
    if (fx.column) {
      const p = fx.column, topY = G.Hf(p[0]), h = Math.max(0.02, topY - p[1] + 0.25);
      column.visible = true; column.scale.set(0.5, h, 1); column.position.set(p[0], p[1] - 0.25 + h / 2, G.FZ + 0.02);
    }
    halo.material.opacity += ((fx.heat > 0 ? 0.55 + 0.25 * Math.sin(ambient * 7) : 0) * Math.min(1, fx.heat) - halo.material.opacity) * Math.min(1, rdt * 6);
    halo.material.color.setHex(fx.heatColor); halo.position.copy(gp); halo.scale.setScalar(0.7 + 0.35 * Math.min(1, fx.heat));
    U.uHeat.value += ((fx.heatColor === 0xff7a20 || fx.heatColor === 0xff5010 ? fx.heat : 0) * 0.6 - U.uHeat.value) * Math.min(1, rdt * 3);
    seepMat.opacity += (Math.min(1, fx.seep) * 0.95 - seepMat.opacity) * Math.min(1, rdt * 5);
    if (seepMat.opacity > 0.01) {
      for (let i = 0; i < SEEPN; i++) {
        const r = seepSeed[i]; r[1] = (r[1] + sdt * 0.22 * r[2]) % 1;
        seepPos[i * 3] = gp.x + r[0] + 0.02 * Math.sin(r[1] * 12 + i); seepPos[i * 3 + 1] = gp.y + 0.62 - r[1] * 0.95; seepPos[i * 3 + 2] = G.FZ + 0.03;
      }
      seepGeo.attributes.position.needsUpdate = true;
    }
    seepArrows.forEach((a, i) => {
      a.material.opacity = seepMat.opacity * 0.95;
      const s = ((ambient * 0.35 + i / 3) % 1);
      a.position.set(gp.x + (i - 1) * 0.2, gp.y + 0.5 - s * 0.6, G.FZ + 0.05);
    });
    glue.material.opacity += ((fx.glue > 0 ? Math.min(1, fx.glue) * (0.7 + 0.25 * Math.sin(ambient * 5)) : 0) - glue.material.opacity) * Math.min(1, rdt * 4);
    glue.position.set(gp.x, gp.y, G.FZ + 0.04); glue.scale.set(0.55 + 0.25 * Math.min(1, fx.glue), 0.32 + 0.14 * Math.min(1, fx.glue), 1);
    for (const s of sparks) {
      s.material.color.setHex(fx.sparkColor);
      const target = fx.sparkle > 0 ? (0.5 + 0.5 * Math.sin(ambient * 6 + s.userData.p)) * fx.sparkle : 0;
      s.material.opacity += (target - s.material.opacity) * Math.min(1, rdt * 8);
      s.userData.a += rdt * 1.2; const r = s.userData.r;
      s.position.set(gp.x + Math.cos(s.userData.a) * r, gp.y + Math.sin(s.userData.a * 1.3) * r * 0.8, gp.z + 0.02);
      s.scale.setScalar(0.08 + 0.05 * Math.sin(ambient * 5 + s.userData.p));
    }
    // eruption: fountain for a few seconds, ash for longer, the lava flow glows then cools
    if (fx.eruptT >= 0) {
      fx.eruptT += sdt;
      const spawn = fx.eruptT < 3.2;
      fountain.visible = true;
      for (let i = 0; i < FN; i++) {
        if (fLife[i] < 0 && spawn && Math.random() < sdt * 30) {
          fLife[i] = 0; fPos.set([VENT.x, VENT.y, VENT.z], i * 3);
          const a = Math.random() * 6.28, sp = 0.15 + Math.random() * 0.35;
          fVel[i] = [Math.cos(a) * sp, 1.1 + Math.random() * 0.9, Math.sin(a) * sp * 0.6 - 0.1];
        }
        if (fLife[i] >= 0) {
          fLife[i] += sdt; const v = fVel[i]; v[1] -= 2.6 * sdt;
          fPos[i * 3] += v[0] * sdt; fPos[i * 3 + 1] += v[1] * sdt; fPos[i * 3 + 2] += v[2] * sdt;
          if (fLife[i] > 1.4 || fPos[i * 3 + 1] < G.H(fPos[i * 3], fPos[i * 3 + 2])) { fLife[i] = -1; fPos.set([0, -99, 0], i * 3); }
        }
      }
      fGeo.attributes.position.needsUpdate = true;
      const ashOn = fx.eruptT < 15;
      ash.forEach(a => {
        a.visible = ashOn; if (!ashOn) return;
        const s = (a.userData.t + fx.eruptT * 0.075) % 1;
        a.position.set(VENT.x - 0.05 + s * 0.85 + 0.05 * Math.sin(s * 9 + a.userData.t * 20), VENT.y + 0.12 + s * 1.5, VENT.z - 0.35 - s * 0.45);
        const sc = 0.25 + s * 0.95; a.scale.set(sc, sc, 1); a.material.rotation = a.userData.t * 6 + s;
        a.material.opacity = 0.75 * (1 - s) * Math.min(1, (15 - fx.eruptT) / 3) * Math.min(1, fx.eruptT * 2);
      });
      if (!spawn && fLife.every(l => l < 0) && !ashOn) { fx.eruptT = -1; fountain.visible = false; }
    }
    if (fx.lavaT >= 0) { fx.lavaT += sdt; U.uLava.value = fx.lavaT; if (fx.lavaT > 30) { fx.lavaT = -1; U.uLava.value = 999; } }
    U.uErupt.value += ((fx.eruptT >= 0 && fx.eruptT < 4 ? 1 : 0) - U.uErupt.value) * Math.min(1, rdt * 2.5);
    U.uGlow.value = U.uErupt.value * 0.8 + (fx.lavaT >= 0 ? 0.3 * Math.exp(-fx.lavaT / 6) : 0);
    craterGlow.material.opacity = 0.45 + 0.15 * Math.sin(ambient * 3) + U.uErupt.value * 0.5;
    craterGlow.scale.setScalar(0.5 + U.uErupt.value * 0.6);
    chamberGlow.material.opacity = 0.3 + 0.06 * Math.sin(ambient * 1.7) + U.uHeat.value * 0.3;
    chamberGlow.visible = view.pitch < 1.0;
    // camera
    const shTx = (insets.r - insets.l) / 2, shTy = (insets.b - insets.t) / 2;
    shift.x += (shTx - shift.x) * Math.min(1, rdt * 8); shift.y += (shTy - shift.y) * Math.min(1, rdt * 8);
    const dist = fitDist() * view.k;
    camera.position.set(
      view.target.x + Math.sin(view.yaw) * Math.cos(view.pitch) * dist,
      view.target.y + Math.sin(view.pitch) * dist,
      view.target.z + Math.cos(view.yaw) * Math.cos(view.pitch) * dist);
    camera.up.set(0, 1, 0);
    if (view.pitch > 1.3) camera.up.set(-Math.sin(view.yaw), 0, -Math.cos(view.yaw));
    camera.lookAt(view.target);
    camera.aspect = W / H;
    camera.setViewOffset(W, H, Math.round(shift.x), Math.round(shift.y), W, H);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    U.uCam.value.copy(camera.position);
    if (api.space && api.space.on) {
      api.space.update(rdt, now, W, H, insets);
      renderer.autoClear = false; renderer.clear();
      renderer.render(api.space.scene, api.space.camera);
      renderer.clearDepth();
      if (block.visible) renderer.render(scene, camera);
      renderer.autoClear = true;
    } else renderer.render(scene, camera);
    dirty = false;
    placeLabels();
    for (const f of api.afterRenderHooks) f();
    // slower iPads: draw fewer pixels so it stays smooth
    if (!idle && frameN > 30) {
      perfN++; perfSum += rdt;
      if (perfN >= 90) { const avg = perfSum / perfN; perfN = 0; perfSum = 0; if (avg > 0.034 && PR > 1) { PR = Math.max(1, PR - 0.5); renderer.setPixelRatio(PR); trMat.uniforms.uPR.value = PR; resize(); } }
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
    else if (!running) { running = true; last = performance.now(); dirty = true; requestAnimationFrame(frame); }
  });
  resize();
  api.ready.then(() => { dirty = true; });
  requestAnimationFrame(frame);
  return api;
}
