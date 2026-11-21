// =====================================================================
// Rock Cycle Explorer — Energy mode.
// Two step-by-step stories, each in 4 parts with a "Continue" button:
//   Sedimentary: the Sun's energy -> ocean water evaporates -> clouds and
//                storms over the mountain -> weathering & erosion.
//   Igneous:     space rocks build a molten Earth -> it cools into today's
//                Earth -> sliced open, it is still hot inside -> that heat
//                melts rock under the magma chamber.
// All the words are in js/data/energy.js.
// =====================================================================
import * as G from './geo.js';
import { createSpace } from './space.js';

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = v => Math.max(0, Math.min(1, v));

export function createEnergy(api, ui, cycle, E) {
  const THREE = api.THREE;
  const $ = s => document.querySelector(s);
  const box = $('#story'), boxText = $('#storyText'), boxStep = $('#storyStep'), boxBtns = $('#storyBtns');
  const skyFade = $('#skyFade'), white = $('#whiteFade'), tagsEl = $('#layerTags');
  const esc = ui.esc, yellow = t => esc(t).replace(/\*(.+?)\*/g, '<span class="y">$1</span>');
  let space = null, token = 0, mode = 'real', kind = '', spinSpeed = 0, layerTags = [];

  // ---------- little animation helpers (they stop at once if the student leaves) ----------
  const tweens = new Set();
  api.frameHooks.add(rdt => {
    for (const tw of [...tweens]) {
      if (tw.tk !== token) { tweens.delete(tw); tw.rej('stop'); continue; }
      tw.t += rdt; const e = Math.min(1, tw.t / tw.d); tw.fn(e);
      if (e >= 1) { tweens.delete(tw); tw.res(); }
    }
    if (space && spinSpeed) space.spin.rotation.y += rdt * spinSpeed;
  });
  const tween = (sec, fn = () => {}) => new Promise((res, rej) => tweens.add({ t: 0, d: sec, fn, res, rej, tk: token }));
  const sleep = sec => tween(sec);
  const until = test => new Promise((res, rej) => { const tk = token; const f = () => { if (tk !== token) return rej('stop'); if (test()) res(); else setTimeout(f, 150); }; f(); });
  const run = fn => fn().catch(e => { if (e !== 'stop') console.warn(e); });

  // ---------- the story box (words + "Continue the Energy Journey") ----------
  function hideBox() { box.hidden = true; ui.speech.stop(); }
  function showBox(i, lastButtons) {
    const list = E[kind];
    boxStep.textContent = `Part ${i + 1} of ${list.length}`;
    boxText.innerHTML = yellow(list[i]);
    boxBtns.innerHTML = '';
    const btn = (label, cls, fn) => { const b = document.createElement('button'); b.className = cls; b.textContent = label; b.onclick = fn; boxBtns.appendChild(b); };
    if (!lastButtons) btn(E.continue, 'go', () => run(() => PARTS[kind][i + 1]()));
    else {
      const other = kind === 'sedimentary' ? 'igneous' : 'sedimentary';
      if (ui.quiz) btn((window.QUIZZES.words || {}).takeQuiz || 'Take the Quiz', 'go quiz', () => ui.quiz.open(kind));
      btn(E.end.other[kind], ui.quiz ? 'ghost' : 'go', () => start(other));
      btn(E.end.back, 'ghost', () => setMode('real'));
    }
    box.hidden = false;
    box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  }

  // ---------- setting up and cleaning up ----------
  function ensureSpace() {
    if (space) return;
    space = createSpace(THREE, { W0: api.W, H0: api.H });
    api.space = space;
  }
  function cleanScene() {                 // put everything back the way the Real World Rock Cycle expects
    tweens.forEach(t => t.rej('stop')); tweens.clear();
    spinSpeed = 0; clearTags();
    if (space) {
      space.on = false; space.beam.on = 0; space.steam.on = 0; space.hit(0); space.rocks('off'); space.setCut(0);
      space.U.uSteam.value = 0; space.sun.visible = false; space.earth.visible = false; space.stars(0);
    }
    skyFade.style.opacity = 0; white.style.opacity = 0;
    api.block.visible = true; api.block.scale.setScalar(1);
    api.fx.cloudAt(null); api.fx.vapor(0); api.fx.deepHeat(0);
    api.inputOn = true; api.hideLabels = false;
  }
  // other modes (the Rock Cycle Diagram) hear about every mode change
  const modeHooks = [];
  function setMode(m) {
    token++; hideBox(); ui.closeModal(); ui.closePanels(); if (ui.quiz) ui.quiz.close();
    cleanScene(); cycle.reset();
    applyModeUI(m);
    if (m === 'real') { api.setView('tilt', 1200); return; }
    if (m === 'energy') askKind();
  }
  function applyModeUI(m) {
    const was = mode;
    mode = m;
    document.body.classList.toggle('mode-energy', m === 'energy');
    api.awake = m === 'energy';
    api.paused = m === 'diagram';                      // the 3D model rests while the diagram is showing
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
    ui.updateInsets();
    ui.setHud(m === 'energy' ? E.hud : undefined);
    if (was !== m || m === 'diagram') modeHooks.forEach(h => h(m));
  }
  function askKind() {
    ui.modal({
      title: E.popup.title, html: `<p class="lead big">${yellow(E.popup.text)}</p><p class="lead">${esc(E.popup.question)}</p>`, icon: 'sun',
      buttons: [{ label: E.popup.sedimentary, cls: 'sed', onClick: () => start('sedimentary') }, { label: E.popup.igneous, cls: 'ign', onClick: () => start('igneous') }],
      onClose: () => setMode('real')
    });
  }
  function start(k) {
    token++; hideBox(); ui.closeModal(); cleanScene(); cycle.reset();
    kind = k;
    if (mode !== 'energy') applyModeUI('energy');
    run(() => PARTS[k][0]());
  }

  // ---------- shared: zoom far out from the block into space ----------
  async function zoomOut() {
    ensureSpace();
    api.inputOn = false; api.hideLabels = true;
    space.on = true; space.stars(0);
    space.camPos.set(0, 0, 14); space.camLook.set(0, 0, 0);
    api.flyTo({ k: 7, pitch: 0.38 }, 2800);
    await tween(2.6, e => { skyFade.style.opacity = e; space.stars(e); });
    await tween(0.7, e => api.block.scale.setScalar(Math.max(0.001, 1 - ease(e))));
    api.block.visible = false;
  }
  // ---------- shared: come back from space to the block ----------
  async function backToBlock(view, ms = 2600) {
    api.block.visible = true; api.block.scale.setScalar(1);
    api.flyTo({ k: 7, pitch: 0.38 }, 10);
    await sleep(0.05);
    api.hideLabels = false;
    api.flyTo(view, ms);
    await tween(ms / 1000 * 0.7, e => { skyFade.style.opacity = 1 - e; space.stars(1 - e); if (space.earth.visible) space.earth.scale.setScalar(space.earth.scale.x * (1 - e * 0.08)); });
    space.on = false; space.earth.visible = false; space.sun.visible = false; space.beam.on = 0; space.steam.on = 0; space.hit(0);
    api.inputOn = true;
  }
  // earth "today" look
  function earthToday(lightTo) {
    const U = space.U;
    U.uLava.value = 0; U.uCrust.value = 1; U.uOcean.value = 1; U.uLand.value = 1; U.uClouds.value = 0.75; U.uAtmo.value = 1;
    U.uLight.value.copy(lightTo).normalize(); U.uSteam.value = 0; U.uAmb.value = 0.2;
  }

  // ================= SEDIMENTARY: powered by the Sun =================
  const SUN_AT = new THREE.Vector3(9.6, 0.7, -6), EARTH_AT = new THREE.Vector3(-4.2, -0.3, 0);
  const sed = [
    // A. out into space; the Sun sends energy toward Earth
    async () => {
      hideBox();
      await zoomOut();
      const earth = space.earth, sun = space.sun;
      // light from the Sun, turned a little toward the camera so students can see Earth clearly
      earthToday(SUN_AT.clone().sub(EARTH_AT).normalize().add(new THREE.Vector3(2.8, 0.8, 6.6).normalize().multiplyScalar(0.75)));
      space.U.uAmb.value = 0.42;
      earth.visible = true; earth.position.set(0, 0, 0); earth.scale.setScalar(0.25); space.spin.rotation.y = 2.2;
      spinSpeed = 0.05;
      sun.visible = true; sun.scale.setScalar(3.4); sun.position.set(17, 0.7, -6);
      await tween(2.4, e => {
        const k = ease(e);
        earth.position.lerpVectors(new THREE.Vector3(0, 0, 0), EARTH_AT, k); earth.scale.setScalar(0.25 + 0.85 * k);
        sun.position.x = 17 + (SUN_AT.x - 17) * k;
      });
      const b = space.beam;
      b.from.copy(SUN_AT).addScaledVector(EARTH_AT.clone().sub(SUN_AT).normalize(), 3.0); b.to.copy(EARTH_AT); b.spread = 1.6; b.speed = 0.2;
      await tween(1.2, e => { b.on = e; });
      await sleep(1.2);
      showBox(0);
    },
    // B. the energy reaches Earth and hits the ocean; water turns to vapor
    async () => {
      hideBox();
      const earth = space.earth, b = space.beam, st = space.steam;
      spinSpeed = 0;
      // turn Earth so the Pacific Ocean faces the incoming energy and the camera
      const camTo = new THREE.Vector3(-1.4, 0.5, 6.6), lookTo = new THREE.Vector3(-3.7, -0.1, 0);
      const d = SUN_AT.clone().sub(EARTH_AT).normalize().multiplyScalar(0.55).add(camTo.clone().sub(EARTH_AT).normalize().multiplyScalar(0.45)).normalize();
      const u = (-140 + 180) / 360, v = (90 - 5) / 180, ph = u * 2 * Math.PI, th = v * Math.PI;
      const ocean = new THREE.Vector3(-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th));
      const r0 = space.spin.rotation.y, rTo = Math.atan2(d.x, d.z) - Math.atan2(ocean.x, ocean.z);
      let rr = rTo; while (rr - r0 > Math.PI) rr -= 2 * Math.PI; while (r0 - rr > Math.PI) rr += 2 * Math.PI;
      const camFrom = space.camPos.clone(), lookFrom = space.camLook.clone();
      const hitPt = EARTH_AT.clone().addScaledVector(d, earth.scale.x);
      const toFrom = b.to.clone();
      await tween(2.6, e => {
        const k = ease(e);
        space.camPos.lerpVectors(camFrom, camTo, k); space.camLook.lerpVectors(lookFrom, lookTo, k);
        space.spin.rotation.y = r0 + (rr - r0) * k;
        b.to.lerpVectors(toFrom, hitPt, k); b.spread = 1.6 - 1.0 * k; b.speed = 0.2 + 0.1 * k;
      });
      st.at.copy(hitPt); st.n.copy(d); st.height = 0.9;
      space.U.uSteamDir.value.copy(ocean);
      space.flash(hitPt, 1.2, 0xfff2c0);
      await tween(1.5, e => { space.hit(e * 0.9); space.U.uSteam.value = e; st.on = e; });
      await sleep(2.2);
      showBox(1);
    },
    // C. vapor rises, we fly down to the block; the vapor condenses into a storm cloud over the mountain
    async () => {
      hideBox();
      const st = space.steam;
      const camFrom = space.camPos.clone(), lookFrom = space.camLook.clone();
      const near = st.at.clone().addScaledVector(st.n, 0.9);
      await tween(2.4, e => { const k = ease(e); space.camPos.lerpVectors(camFrom, near, k); space.camLook.lerpVectors(lookFrom, st.at, k); white.style.opacity = clamp01((e - 0.6) / 0.4); });
      // swap to the block
      space.on = false; space.beam.on = 0; st.on = 0; space.hit(0); space.earth.visible = false; space.sun.visible = false;
      skyFade.style.opacity = 0; space.stars(0);
      api.block.visible = true; api.block.scale.setScalar(1); api.hideLabels = false;
      // start close to the sea, so students see the little cloud form
      const C0 = [3.1, 1.15, 0.05];
      const seaView = { yaw: 0.32, pitch: 0.2, k: 0.4, target: [2.95, 0.92, 0.25] };
      api.flyTo(seaView, 10);
      api.fx.vapor(1, C0); api.fx.cloudAt(C0, 0.06);
      await tween(0.9, e => { white.style.opacity = 1 - e; });
      await tween(3.0, e => api.fx.cloudAt(C0, 0.06 + 0.94 * ease(e)));          // condensing into a cloud
      api.fx.vapor(0);
      // the camera follows the cloud over the land to the mountain
      const spot = api.cloudSpot(G.LOC.surface), endView = { yaw: -0.3, pitch: 0.3, k: 0.46 };
      await tween(5.0, e => {
        const k = ease(e), c = [C0[0] + (spot[0] - C0[0]) * k, C0[1] + (spot[1] - C0[1]) * k, C0[2] + (spot[2] - C0[2]) * k];
        api.fx.cloudAt(c, 1);
        api.flyTo({ yaw: seaView.yaw + (endView.yaw - seaView.yaw) * k, pitch: seaView.pitch + (endView.pitch - seaView.pitch) * k, k: seaView.k + (endView.k - seaView.k) * k,
          target: [c[0] - 0.15 * k, c[1] - 0.23 - 0.45 * k, c[2] + 0.2] }, 1);
      });
      api.inputOn = true;
      showBox(2);
    },
    // D. the storm: wind and rain weather the mountain (the same Weathering & Erosion animation)
    async () => {
      hideBox();
      api.fx.cloudAt(null);
      // zoom out a bit so the whole mountainside and river show while the rock weathers
      api.flyTo({ yaw: -0.38, pitch: 0.4, k: 0.62, target: [-1.2, -0.1, 0.35] }, 1500);
      cycle.play('weather', { quiet: true, cam: false });
      await sleep(0.5);
      await until(() => !cycle.isAnimating());
      await sleep(0.6);
      showBox(3, true);
    }
  ];

  // ================= IGNEOUS: powered by Earth's ancient heat =================
  const LAYER_SPOTS = [[0.978, 0.5], [0.76, 0.32], [0.38, 0.12], [0.08, -0.05]];   // [radius, angle up] for crust, mantle, outer core, inner core
  function clearTags() { layerTags.forEach(t => t.el.remove()); layerTags = []; }
  // the tags sit in a neat column to the right of Earth, each with a line pointing into its layer
  const lineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); lineSvg.setAttribute('class', 'lt-lines'); tagsEl.appendChild(lineSvg);
  api.afterRenderHooks.add(() => {
    if (!layerTags.length || !space) { if (lineSvg.innerHTML) lineSvg.innerHTML = ''; return; }
    const cam = space.camera, c = space.earth.position.clone().project(cam);
    const cx = (c.x * 0.5 + 0.5) * api.W, cy = (-c.y * 0.5 + 0.5) * api.H;
    const edge = space.earth.position.clone().add(new THREE.Vector3(space.earth.scale.x, 0, 0)).project(cam);
    const rpx = Math.abs((edge.x * 0.5 + 0.5) * api.W - cx);
    const colX = cx + rpx + 40, gap = 74, y0 = cy - gap * (layerTags.length - 1) / 2;
    let lines = '';
    layerTags.forEach((t, i) => {
      const p = space.facePoint(t.r, t.phi, 0.5, 1).project(cam);
      const px = (p.x * 0.5 + 0.5) * api.W, py = (-p.y * 0.5 + 0.5) * api.H, by = y0 + i * gap;
      t.el.style.transform = `translate(${colX.toFixed(1)}px, ${by.toFixed(1)}px)`;
      lines += `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${colX.toFixed(1)}" y2="${by.toFixed(1)}"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5"/>`;
    });
    lineSvg.innerHTML = lines;
  });
  const ign = [
    // A. rocks crash together and build a molten Earth
    async () => {
      hideBox();
      await zoomOut();
      const earth = space.earth, U = space.U;
      U.uLava.value = 1; U.uCrust.value = 0; U.uOcean.value = 0; U.uLand.value = 0; U.uClouds.value = 0; U.uAtmo.value = 0; U.uAmb.value = 0.25;
      U.uLight.value.set(0.6, 0.35, 1).normalize();
      space.camPos.set(0, 0.3, 10); space.camLook.set(0, 0, 0);
      earth.visible = true; earth.position.set(1.3, 0.5, -1); earth.scale.setScalar(0.12);
      spinSpeed = 0.12;
      space.rocks('form');
      await tween(10, e => {
        const k = ease(e);
        earth.scale.setScalar(0.12 + 1.38 * Math.pow(e, 0.8));
        earth.position.set(1.3 * (1 - k), 0.5 * (1 - k), -1 * (1 - k));
      });
      space.rocks('bombard', 0.85);
      await sleep(1.0);
      showBox(0);
    },
    // B. it cools: crust, air, oceans, clouds, forests
    async () => {
      hideBox();
      const U = space.U;
      space.rocks('bombard', 0.4);
      await tween(13, e => {
        U.uCrust.value = clamp01(e * 3.2);
        U.uAtmo.value = clamp01((e - 0.25) * 4);
        U.uOcean.value = clamp01((e - 0.38) * 3.0);
        U.uClouds.value = clamp01((e - 0.5) * 3) * 0.75;
        U.uLand.value = clamp01((e - 0.62) * 3.2);
        U.uAmb.value = 0.25 - 0.15 * clamp01(e * 2);
        if (e > 0.3) space.rocks('off');
      });
      await sleep(0.8);
      showBox(1);
    },
    // C. slice Earth open: it is still very hot inside
    async () => {
      hideBox();
      spinSpeed = 0;
      const camFrom = space.camPos.clone();
      const lookFrom = space.camLook.clone(), tall = api.H > api.W;           // tall screens: step back so the tags fit
      const camTo = tall ? new THREE.Vector3(0.3, 1.3, 15) : new THREE.Vector3(0.4, 1.3, 10.8), lookTo = tall ? new THREE.Vector3(1.0, -0.6, 0) : new THREE.Vector3(1.15, 0, 0);
      await tween(2.8, e => { const k = ease(e); space.camPos.lerpVectors(camFrom, camTo, k); space.camLook.lerpVectors(lookFrom, lookTo, k); space.setCut(k * Math.PI / 2, 0.5); });
      const L = E.layers;
      for (let i = 0; i < L.length; i++) {
        const el = document.createElement('div'); el.className = 'ltag';
        el.innerHTML = `<span class="lt-box"><svg viewBox="0 0 24 24"><path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 9v7"/></svg><b>${esc(L[i].name)}</b><em>${esc(L[i].temp)}</em></span>`;
        tagsEl.appendChild(el); layerTags.push({ el, r: LAYER_SPOTS[i][0], phi: LAYER_SPOTS[i][1] });
        await sleep(0.7);
      }
      await sleep(0.4);
      showBox(2);
    },
    // D. back to the block: Earth's heat glows under the magma chamber
    async () => {
      hideBox(); clearTags();
      await tween(1.0, e => { space.setCut((1 - e) * Math.PI / 2, 0.5); });
      await backToBlock({ yaw: 0.12, pitch: 0.12, k: 0.4, target: [G.CHM.x, G.CHM.y - 0.5, G.ZF] }, 3000);
      await tween(1.5, e => api.fx.deepHeat(e));
      await sleep(1.0);
      showBox(3, true);
    }
  ];
  const PARTS = { sedimentary: sed, igneous: ign };

  // ---------- the Modes menu ----------
  document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => setMode(b.dataset.mode));
  $('#storySay').onclick = () => ui.speech.read(boxText, $('#storySay'));
  return { setMode, mode: () => mode, start, onMode: fn => modeHooks.push(fn) };
}
