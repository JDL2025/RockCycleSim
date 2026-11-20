// =====================================================================
// Rock Cycle Explorer — the space scene for Energy mode.
// Stars, a burning Sun, the Earth (molten lava -> cooled crust -> today's
// Earth with oceans, forests, clouds and air), Earth sliced open to show
// its hot layers, energy waves from the Sun, and space rocks colliding.
// Drawn behind the 3D block by scene.js (api.space).
// =====================================================================
const NOISE3 = `
float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm3(vec3 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n3(p); p = p * 2.02 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
`;
const SPHERE_V = `
varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying vec3 vObj;
void main(){ vUv = uv; vObj = normalize(position); vN = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const WEDGE = `
uniform float uCut; uniform vec3 uCenter, uWedge;
bool inWedge(vec3 p){ if (uCut < 0.001) return false; vec2 d = normalize((p - uCenter).xz); return acos(clamp(dot(d, normalize(uWedge.xz)), -1.0, 1.0)) < uCut * 0.5; }
`;

export function createSpace(THREE, { W0 = 1, H0 = 1 } = {}) {
  const S = {};
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, W0 / H0, 0.1, 400);
  camera.position.set(0, 0, 14);
  S.scene = scene; S.camera = camera; S.on = false;
  S.camPos = new THREE.Vector3(0, 0, 14); S.camLook = new THREE.Vector3(0, 0, 0);
  const T = { value: 0 };

  // ---------- small pictures ----------
  function canvasTex(w, h, paint) { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const glowT = canvasTex(64, 64, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, w); });
  const waveT = canvasTex(128, 128, c => {               // a curved wave front, bulging to the right
    c.lineCap = 'round';
    for (const [lw, a] of [[18, 0.18], [10, 0.45], [4, 1]]) { c.strokeStyle = `rgba(255,236,170,${a})`; c.lineWidth = lw; c.beginPath(); c.arc(30, 64, 62, -0.85, 0.85); c.stroke(); }
  });
  const arrowT = canvasTex(64, 64, c => {
    c.fillStyle = 'rgba(255,214,90,1)'; c.strokeStyle = 'rgba(90,40,0,0.7)'; c.lineWidth = 3; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(60, 32); c.lineTo(34, 8); c.lineTo(34, 22); c.lineTo(6, 22); c.lineTo(6, 42); c.lineTo(34, 42); c.lineTo(34, 56); c.closePath(); c.fill(); c.stroke();
  });
  const sprite = (map, color, add = true, order = 5) => { const m = new THREE.SpriteMaterial({ map, color, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, opacity: 0 }); const s = new THREE.Sprite(m); s.renderOrder = order; scene.add(s); return s; };

  // ---------- stars ----------
  const SN = 2400, sp = new Float32Array(SN * 3), ss = new Float32Array(SN), sph = new Float32Array(SN);
  for (let i = 0; i < SN; i++) {
    const u = Math.random() * 2 - 1, a = Math.random() * 6.283, r = 120, q = Math.sqrt(1 - u * u);
    sp.set([r * q * Math.cos(a), r * u, r * q * Math.sin(a) - 20], i * 3); ss[i] = Math.random() < 0.06 ? 2.6 + Math.random() * 1.6 : 0.9 + Math.random() * 1.3; sph[i] = Math.random() * 6.28;
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('aS', new THREE.BufferAttribute(ss, 1)); sg.setAttribute('aPh', new THREE.BufferAttribute(sph, 1));
  const starMat = new THREE.ShaderMaterial({
    uniforms: { uT: T, uA: { value: 0 }, uPR: { value: Math.min(2, window.devicePixelRatio || 1) } },
    vertexShader: 'attribute float aS; attribute float aPh; uniform float uT, uPR; varying float vTw; void main(){ vTw = 0.65 + 0.35 * sin(uT * 2.0 + aPh * 7.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = aS * uPR; }',
    fragmentShader: 'uniform float uA; varying float vTw; void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.1, length(d)); gl_FragColor = vec4(vec3(0.85, 0.9, 1.0), a * vTw * uA); }',
    transparent: true, depthWrite: false
  });
  scene.add(new THREE.Points(sg, starMat));
  S.stars = v => { starMat.uniforms.uA.value = v; };

  // ---------- the Sun ----------
  const sun = new THREE.Group(); scene.add(sun); sun.visible = false;
  const sunMat = new THREE.ShaderMaterial({
    uniforms: { uT: T },
    vertexShader: SPHERE_V,
    fragmentShader: NOISE3 + `uniform float uT; varying vec3 vN; varying vec3 vP; varying vec3 vObj;
      void main(){
        vec3 p = vObj * 2.4;
        float n = fbm3(p + vec3(0.0, uT * 0.07, uT * 0.05)), n2 = fbm3(p * 2.6 - vec3(uT * 0.11, 0.0, uT * 0.06));
        float t = n * 0.75 + n2 * 0.45;
        vec3 c = mix(vec3(0.80, 0.16, 0.0), vec3(1.0, 0.60, 0.08), smoothstep(0.38, 0.72, t));
        c = mix(c, vec3(1.0, 0.95, 0.62), smoothstep(0.72, 0.98, t));
        float mu = max(dot(normalize(vN), normalize(cameraPosition - vP)), 0.0);
        c *= 0.6 + 0.55 * pow(mu, 0.45);
        c += vec3(1.0, 0.45, 0.08) * pow(1.0 - mu, 2.5) * 0.7;
        gl_FragColor = vec4(c * 1.2, 1.0);
      }`
  });
  sun.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), sunMat));
  const corona = [];
  for (const [sc, col, op] of [[2.9, 0xffb347, 0.55], [4.6, 0xff7a1a, 0.32], [7.5, 0xff5a10, 0.16]]) {
    const m = new THREE.SpriteMaterial({ map: glowT, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: op });
    const c = new THREE.Sprite(m); c.scale.set(sc, sc, 1); c.userData.base = op; c.userData.sc = sc; sun.add(c); corona.push(c);
  }
  S.sun = sun;

  // ---------- Earth ----------
  const earth = new THREE.Group(); scene.add(earth); earth.visible = false;
  const spin = new THREE.Group(); earth.add(spin);                 // turns; the cut faces do not
  const dayTex = new THREE.TextureLoader().load('assets/tex/earth.jpg'); dayTex.colorSpace = THREE.NoColorSpace; dayTex.anisotropy = 4;
  const EU = {
    uT: T, tDay: { value: dayTex }, uLava: { value: 0 }, uCrust: { value: 1 }, uOcean: { value: 1 }, uLand: { value: 1 }, uClouds: { value: 0.8 }, uAtmo: { value: 1 },
    uLight: { value: new THREE.Vector3(1, 0.2, 0.6).normalize() }, uAmb: { value: 0.1 },
    uCut: { value: 0 }, uCenter: { value: new THREE.Vector3() }, uWedge: { value: new THREE.Vector3(0.4, 0, 1).normalize() },
    uSteam: { value: 0 }, uSteamDir: { value: new THREE.Vector3(1, 0, 0) }
  };
  S.U = EU;
  const earthMat = new THREE.ShaderMaterial({
    uniforms: EU, vertexShader: SPHERE_V,
    fragmentShader: NOISE3 + WEDGE + `
      uniform sampler2D tDay; uniform float uT, uCrust, uOcean, uLand, uAmb, uSteam; uniform vec3 uLight, uSteamDir;
      varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying vec3 vObj;
      void main(){
        if (inWedge(vP)) discard;
        vec3 day = texture2D(tDay, vUv).rgb;
        float om = smoothstep(0.015, 0.08, day.b - day.r) * (1.0 - smoothstep(0.5, 0.7, day.r));
        float elev = fbm3(vObj * 3.0);
        // molten lava, swirling
        vec3 q = vObj * 2.6;
        float n = fbm3(q + vec3(uT * 0.10, -uT * 0.07, uT * 0.05)), n2 = fbm3(q * 3.0 + vec3(-uT * 0.2, uT * 0.15, 0.0));
        float cr = pow(1.0 - abs(n2 * 2.0 - 1.0), 7.0);
        vec3 lava = mix(vec3(0.42, 0.04, 0.0), vec3(1.0, 0.38, 0.03), smoothstep(0.3, 0.7, n)) + vec3(1.0, 0.82, 0.35) * cr;
        // cooled crust: dark brown and black, with glowing cracks that fade away
        vec3 crust = mix(vec3(0.06, 0.045, 0.04), vec3(0.24, 0.16, 0.10), fbm3(vObj * 7.0));
        float glowLeft = 1.0 - smoothstep(0.35, 1.0, uCrust);
        vec3 surf = mix(lava, crust, smoothstep(0.0, 1.0, uCrust));
        float emis = 1.0 - smoothstep(0.0, 0.65, uCrust);
        // oceans fill the low places first, then land turns green
        float oc = om * clamp((uOcean * 1.25 - elev + 0.05) / 0.12, 0.0, 1.0);
        float ld = (1.0 - om) * uLand;
        surf = mix(surf, day * 1.15, clamp(max(oc, ld), 0.0, 1.0));
        vec3 nn = normalize(vN);
        float lit = max(dot(nn, normalize(uLight)), 0.0);
        vec3 col = surf * (uAmb + 1.15 * lit);
        col = mix(col, surf * 1.25, emis);
        col += vec3(1.0, 0.35, 0.05) * cr * glowLeft * (1.0 - emis) * 1.3 * (1.0 - max(oc, ld));
        vec3 v = normalize(cameraPosition - vP);
        col += vec3(1.0, 0.95, 0.85) * pow(max(dot(reflect(-normalize(uLight), nn), v), 0.0), 30.0) * oc * 0.45;
        // the ocean heating up and steaming where the Sun's energy hits
        float sd = max(dot(normalize(vObj), normalize(uSteamDir)), 0.0);
        col = mix(col, vec3(0.92, 0.97, 1.0), uSteam * smoothstep(0.93, 0.995, sd) * (0.6 + 0.4 * fbm3(vObj * 18.0 + uT)));
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), earthMat); spin.add(earthMesh);
  const cloudMat = new THREE.ShaderMaterial({
    uniforms: EU, vertexShader: SPHERE_V, transparent: true, depthWrite: false,
    fragmentShader: NOISE3 + WEDGE + `uniform float uT, uClouds, uAmb; uniform vec3 uLight; varying vec3 vN; varying vec3 vP; varying vec3 vObj;
      void main(){ if (inWedge(vP) || uClouds < 0.01) discard;
        float n = fbm3(vObj * 3.2 + vec3(uT * 0.02, 0.0, 0.0)) + 0.5 * fbm3(vObj * 9.0);
        float a = smoothstep(0.78, 1.05, n) * uClouds;
        float lit = max(dot(normalize(vN), normalize(uLight)), 0.0);
        gl_FragColor = vec4(vec3(1.0) * (uAmb + lit * 1.05), a); }`
  });
  const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(1.012, 96, 64), cloudMat); spin.add(cloudMesh);
  const atmoMat = new THREE.ShaderMaterial({
    uniforms: EU, transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
    vertexShader: SPHERE_V,
    fragmentShader: `uniform float uAtmo; uniform vec3 uLight; varying vec3 vN; varying vec3 vP;
      void main(){ vec3 v = normalize(cameraPosition - vP); float rim = pow(max(0.0, 0.82 + dot(normalize(vN), v)), 3.0);
        float lit = 0.35 + 0.65 * max(dot(normalize(vN), normalize(uLight)) + 0.3, 0.0);
        vec3 c = vec3(0.35, 0.65, 1.0) * rim * uAtmo * 1.6 * lit; gl_FragColor = vec4(c, clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0)); }`
  });
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.1, 64, 48), atmoMat); earth.add(atmo);
  // the inside of Earth (shown on the two cut faces)
  const layerMat = new THREE.ShaderMaterial({
    uniforms: { uT: T, uShow: { value: 0 } }, side: THREE.DoubleSide, transparent: true,
    vertexShader: 'varying vec2 vL; void main(){ vL = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: NOISE3 + `uniform float uT, uShow; varying vec2 vL;
      void main(){
        float r = length(vL);
        float sw = fbm3(vec3(vL * 4.0, uT * 0.25)), sw2 = fbm3(vec3(vL * 9.0 + 3.0, -uT * 0.35));
        vec3 c;
        if (r < 0.19) c = mix(vec3(1.0, 1.0, 0.85), vec3(1.0, 0.86, 0.35), r / 0.19);                         // inner core
        else if (r < 0.55) c = mix(vec3(1.0, 0.72, 0.12), vec3(1.0, 0.48, 0.05), (r - 0.19) / 0.36) * (0.85 + 0.3 * sw2); // outer core
        else if (r < 0.955) c = mix(vec3(0.95, 0.30, 0.04), vec3(0.55, 0.10, 0.03), (r - 0.55) / 0.405) * (0.75 + 0.5 * sw); // mantle
        else c = mix(vec3(0.42, 0.30, 0.22), vec3(0.30, 0.22, 0.16), sw);                                       // crust
        float edge = 0.0; for (int i = 0; i < 3; i++){ float b = i == 0 ? 0.19 : i == 1 ? 0.55 : 0.955; edge = max(edge, 1.0 - smoothstep(0.0, 0.008, abs(r - b))); }
        c *= 1.0 - 0.45 * edge;
        gl_FragColor = vec4(c * 1.1, uShow);
      }`
  });
  const faces = [];
  for (let i = 0; i < 2; i++) { const f = new THREE.Mesh(new THREE.CircleGeometry(1, 96, -Math.PI / 2, Math.PI), layerMat); f.visible = false; earth.add(f); faces.push(f); }
  S.earth = earth; S.spin = spin; S.layerMat = layerMat;
  // open a wedge (angle in radians) facing direction theta (0 = toward +z)
  S.setCut = (angle, theta = 0.45) => {
    EU.uCut.value = angle; EU.uWedge.value.set(Math.sin(theta), 0, Math.cos(theta));
    faces.forEach((f, i) => { const a = theta + (i ? -1 : 1) * angle / 2; f.rotation.set(0, a - Math.PI / 2, 0); f.visible = angle > 0.001; });
    layerMat.uniforms.uShow.value = Math.min(1, angle * 3);
  };
  // a point on one cut face: radius r (0 = center, 1 = surface), height angle phi (0 = equator, up is positive)
  S.facePoint = (r, phi, theta = 0.45, side = 0) => {
    const a = theta + (side ? -1 : 1) * EU.uCut.value / 2;
    const v = new THREE.Vector3(Math.sin(a) * Math.cos(phi) * r, Math.sin(phi) * r, Math.cos(a) * Math.cos(phi) * r);
    return v.multiplyScalar(earth.scale.x).add(earth.position);
  };

  // ---------- energy from the Sun: wave fronts, arrows and sparks ----------
  const waves = [], arrows = [];
  for (let i = 0; i < 12; i++) { const w = sprite(waveT, 0xffd27a, true, 6); w.userData.s = i / 12; waves.push(w); }
  for (let i = 0; i < 26; i++) { const a = sprite(arrowT, 0xffffff, false, 7); a.userData.s = Math.random(); a.userData.o = [Math.random() - 0.5, Math.random() - 0.5]; arrows.push(a); }
  const PN = 160, pp = new Float32Array(PN * 3), pSeed = [];
  for (let i = 0; i < PN; i++) pSeed.push([Math.random(), Math.random() - 0.5, Math.random() - 0.5, 0.6 + Math.random() * 0.8]);
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const photons = new THREE.Points(pg, new THREE.PointsMaterial({ map: glowT, color: 0xffe08a, size: 0.16, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  photons.frustumCulled = false; scene.add(photons);
  const beam = { on: 0, from: new THREE.Vector3(), to: new THREE.Vector3(), spread: 1.2, speed: 0.22 };
  S.beam = beam;

  // ---------- where the energy hits the ocean: a flash, and water vapor rising ----------
  const hit = sprite(glowT, 0xfff2c0, true, 8);
  const VN = 120, vp = new Float32Array(VN * 3), vSeed = [];
  for (let i = 0; i < VN; i++) vSeed.push([Math.random(), Math.random() * 6.28, Math.random(), 0.5 + Math.random()]);
  const vg = new THREE.BufferGeometry(); vg.setAttribute('position', new THREE.BufferAttribute(vp, 3));
  const vapMat = new THREE.PointsMaterial({ map: glowT, color: 0xeaf6ff, size: 0.14, transparent: true, depthWrite: false, opacity: 0 });
  const vapor = new THREE.Points(vg, vapMat); vapor.frustumCulled = false; vapor.renderOrder = 9; scene.add(vapor);
  const steam = { on: 0, at: new THREE.Vector3(), n: new THREE.Vector3(0, 1, 0), height: 0.9 };
  S.steam = steam;
  S.hit = v => { hit.material.opacity = v; };

  // ---------- space rocks (forming the Earth, then crashing into it) ----------
  const rockGeo = new THREE.IcosahedronGeometry(1, 1);
  { const p = rockGeo.attributes.position; for (let i = 0; i < p.count; i++) { const k = 0.72 + ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * 0.5; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k); } rockGeo.computeVertexNormals(); }
  const RN = 170;
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x8c7a6a, roughness: 1, metalness: 0, flatShading: true });
  const rocks = new THREE.InstancedMesh(rockGeo, rockMat, RN); rocks.visible = false; rocks.frustumCulled = false; scene.add(rocks);
  scene.add(new THREE.AmbientLight(0x404858, 1.4));
  const sunLight = new THREE.DirectionalLight(0xfff0dd, 2.4); sunLight.position.set(6, 3, 6); scene.add(sunLight);
  const rockState = [];
  const dummy = new THREE.Object3D();
  function spawnRock(r, far) {
    const u = Math.random() * 2 - 1, a = Math.random() * 6.283;
    const dist = far ? 9 + Math.random() * 6 : 1.6 + Math.random() * 6;
    r.pos = new THREE.Vector3(Math.cos(a) * Math.sqrt(1 - u * u) * dist, u * dist * 0.35, Math.sin(a) * Math.sqrt(1 - u * u) * dist);
    r.vel = new THREE.Vector3(-r.pos.z, 0, r.pos.x).normalize().multiplyScalar(0.6 + Math.random() * 0.6).addScaledVector(r.pos.clone().normalize(), -0.25);
    r.size = 0.05 + Math.pow(Math.random(), 2) * 0.2; r.rot = new THREE.Euler(Math.random() * 6, Math.random() * 6, 0); r.spin = Math.random() * 2 - 1; r.alive = true;
  }
  for (let i = 0; i < RN; i++) { const r = {}; spawnRock(r, false); rockState.push(r); }
  const flashes = []; for (let i = 0; i < 18; i++) { const f = sprite(glowT, 0xffc070, true, 8); f.userData.t = 1; flashes.push(f); }
  let flashI = 0;
  function flash(p, size = 0.6, col = 0xffc070) { const f = flashes[flashI++ % flashes.length]; f.position.copy(p); f.userData.t = 0; f.userData.size = size; f.material.color.setHex(col); }
  S.flash = flash;
  // mode: 'off' | 'form' (rocks swirl in and build the Earth) | 'bombard' (a few rocks crash into it)
  const rockSim = { mode: 'off', rate: 0 };
  S.rocks = (mode, rate = 1) => {
    rockSim.mode = mode; rockSim.rate = rate; rocks.visible = mode !== 'off';
    if (mode === 'form') rockState.forEach(r => spawnRock(r, false));
    if (mode === 'bombard') rockState.forEach((r, i) => { spawnRock(r, true); r.alive = i < 14; });
  };

  // ---------- each frame ----------
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  S.update = (dt, now, W, H, insets) => {
    T.value += dt;
    // camera: aim at the free space between the menus
    camera.aspect = W / H;
    camera.position.copy(S.camPos); camera.lookAt(S.camLook);
    camera.setViewOffset(W, H, Math.round((insets.r - insets.l) / 2), Math.round((insets.b - insets.t) / 2), W, H);
    camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    EU.uCenter.value.copy(earth.position);
    // Sun's glow breathes
    corona.forEach((c, i) => { const b = 1 + 0.05 * Math.sin(T.value * (1.3 + i * 0.4) + i); c.scale.set(c.userData.sc * b, c.userData.sc * b, 1); });
    // energy streaming from the Sun
    const bOn = beam.on;
    const dir = tmp.copy(beam.to).sub(beam.from); const len = dir.length(); dir.normalize();
    const p0 = beam.from.clone().project(camera), p1 = beam.to.clone().project(camera);
    const ang = Math.atan2(p1.y - p0.y, (p1.x - p0.x) * camera.aspect);   // direction on the screen
    const side = tmp2.set(-dir.y, dir.x, 0).normalize();
    waves.forEach(w => {
      w.userData.s = (w.userData.s + dt * beam.speed) % 1; const s = w.userData.s;
      w.position.copy(beam.from).addScaledVector(dir, len * s);
      const sc = 0.7 + s * 1.1; w.scale.set(sc, sc, 1); w.material.rotation = ang;
      w.material.opacity = bOn * Math.sin(Math.PI * s) * 0.9;
    });
    arrows.forEach(a => {
      a.userData.s = (a.userData.s + dt * beam.speed * 1.4) % 1; const s = a.userData.s, o = a.userData.o;
      a.position.copy(beam.from).addScaledVector(dir, len * s).addScaledVector(side, o[0] * beam.spread * (1 - s * 0.7)).add(new THREE.Vector3(0, 0, o[1] * 0.6));
      a.scale.set(0.24, 0.24, 1); a.material.rotation = ang;
      a.material.opacity = bOn * Math.min(1, Math.sin(Math.PI * s) * 2);
    });
    for (let i = 0; i < PN; i++) {
      const q = pSeed[i]; q[0] = (q[0] + dt * beam.speed * q[3] * 1.3) % 1; const s = q[0];
      tmp2.set(-dir.y, dir.x, 0).normalize();
      const x = beam.from.x + dir.x * len * s + tmp2.x * q[1] * beam.spread * (1 - s * 0.8);
      const y = beam.from.y + dir.y * len * s + tmp2.y * q[1] * beam.spread * (1 - s * 0.8);
      const z = beam.from.z + dir.z * len * s + q[2] * 0.6 * (1 - s * 0.8);
      pp.set([x, y, z], i * 3);
    }
    pg.attributes.position.needsUpdate = true;
    photons.material.opacity = bOn * 0.9;
    // vapor rising off the ocean
    vapMat.opacity += (steam.on * 0.85 - vapMat.opacity) * Math.min(1, dt * 3);
    if (vapMat.opacity > 0.01) {
      const n = steam.n, t1 = tmp.set(-n.z, 0, n.x).normalize(), t2 = new THREE.Vector3().crossVectors(n, t1);
      for (let i = 0; i < VN; i++) {
        const v = vSeed[i]; v[0] = (v[0] + dt * 0.22 * v[3]) % 1; const s = v[0];
        const r = 0.05 + v[2] * 0.22 + s * 0.12;
        vp.set([
          steam.at.x + n.x * s * steam.height + (t1.x * Math.cos(v[1] + s * 3) + t2.x * Math.sin(v[1] + s * 3)) * r,
          steam.at.y + n.y * s * steam.height + (t1.y * Math.cos(v[1] + s * 3) + t2.y * Math.sin(v[1] + s * 3)) * r,
          steam.at.z + n.z * s * steam.height + (t1.z * Math.cos(v[1] + s * 3) + t2.z * Math.sin(v[1] + s * 3)) * r], i * 3);
      }
      vg.attributes.position.needsUpdate = true;
    }
    hit.position.copy(steam.at).addScaledVector(steam.n, 0.03); const hs = 0.35 + 0.08 * Math.sin(T.value * 9); hit.scale.set(hs, hs, 1);
    // space rocks
    if (rockSim.mode !== 'off') {
      const R = earth.visible ? earth.scale.x : 0;
      for (let i = 0; i < RN; i++) {
        const r = rockState[i];
        if (!r.alive) { dummy.scale.setScalar(0); dummy.updateMatrix(); rocks.setMatrixAt(i, dummy.matrix); continue; }
        tmp.copy(r.pos).sub(earth.position); const d = tmp.length();
        const pull = (rockSim.mode === 'form' ? 1.6 : 2.6) / Math.max(0.6, d * d);
        r.vel.addScaledVector(tmp.normalize(), -pull * dt * 2.2);
        if (rockSim.mode === 'form') r.vel.multiplyScalar(1 - dt * 0.25);
        r.pos.addScaledVector(r.vel, dt);
        if (d < R + r.size * 0.6) {                    // crash!
          flash(tmp.copy(earth.position).addScaledVector(r.pos.clone().sub(earth.position).normalize(), R * 1.01), 0.25 + r.size * 4, 0xffb060);
          if (rockSim.mode === 'form') spawnRock(r, Math.random() < 0.5); else { spawnRock(r, true); r.alive = Math.random() < rockSim.rate; }
        }
        r.rot.x += r.spin * dt; r.rot.y += r.spin * dt * 0.7;
        dummy.position.copy(r.pos); dummy.rotation.copy(r.rot); dummy.scale.setScalar(r.size); dummy.updateMatrix();
        rocks.setMatrixAt(i, dummy.matrix);
      }
      rocks.instanceMatrix.needsUpdate = true;
      // rocks bumping into each other out in space
      if (rockSim.mode === 'form' && Math.random() < dt * 6) { const r = rockState[(Math.random() * RN) | 0]; if (r.alive) flash(r.pos, 0.3 + r.size * 2, 0xffd9a0); }
    }
    flashes.forEach(f => { const u = f.userData; if (u.t >= 1) { f.material.opacity = 0; return; } u.t = Math.min(1, u.t + dt * 2.2); const s = u.size * (0.4 + u.t * 1.2); f.scale.set(s, s, 1); f.material.opacity = (1 - u.t) * 1.2; });
  };
  return S;
}
