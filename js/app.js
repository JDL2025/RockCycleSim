// =====================================================================
// Rock Cycle Explorer — menus, panels, pop-ups,
// celebrations, read-aloud and music. Same parts as Plate Motion
// Explorer, so the sites feel like one family.
// The 3D block lives in scene.js; the rock cycle itself is in cycle.js.
// =====================================================================
import { icon } from './icons.js';
import { createSpeech } from './speech.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

export function createUI(api) {
  const ui = { api, esc, icon, store };
  const speech = createSpeech();
  ui.speech = speech;

  // ---------------------------------------------------------------
  // HUD line and banner
  // ---------------------------------------------------------------
  const HUD_DEFAULT = 'Tap a step in the menu bar below.';
  ui.setHud = t => { $('#hudLine').textContent = t ?? HUD_DEFAULT; };
  let bannerEl = null, bannerTimer = 0;
  // the message at the top of the screen. ms = 0 means it stays until the next message.
  ui.banner = (html, ms = 0, cls = '') => {
    clearTimeout(bannerTimer);
    if (html === null) { if (bannerEl) bannerEl.remove(); bannerEl = null; return; }
    if (!bannerEl) { bannerEl = document.createElement('div'); document.body.appendChild(bannerEl); }
    bannerEl.className = 'banner' + (cls ? ' ' + cls : '');
    bannerEl.innerHTML = html;
    placeBanner();
    if (ms) bannerTimer = setTimeout(() => ui.banner(null), ms);
    return bannerEl;
  };
  ui.placeBanner = () => placeBanner();
  function placeBanner() {
    if (!bannerEl) return;
    let L = insets.l; const R = innerWidth - insets.r;
    const hud = $('#hud').getBoundingClientRect();
    if (ui.isSheet()) bannerEl.style.top = (hud.bottom + 8) + 'px';              // tall screens: below the title
    else { bannerEl.style.top = ''; L = Math.max(L, $('#appTitle').getBoundingClientRect().right + 14); }   // wide screens: beside the title
    bannerEl.style.left = ((L + R) / 2) + 'px';
    bannerEl.style.maxWidth = Math.max(240, Math.min(600, R - L - 24)) + 'px';
  }

  // ---------------------------------------------------------------
  // Free space for the 3D block (between the left bar, title and menu bar)
  // ---------------------------------------------------------------
  const insets = { l: 0, r: 0, t: 0, b: 0 };
  ui.isSheet = () => matchMedia('(max-width: 760px), (orientation: portrait) and (max-width: 1100px)').matches;
  function updateInsets() {
    const W = innerWidth, H = innerHeight;
    const rail = $('#rail').getBoundingClientRect(), dock = $('#dock').getBoundingClientRect(), hud = $('#hud').getBoundingClientRect();
    insets.l = rail.right + 6; insets.t = Math.max(hud.bottom + 6, 70); insets.b = H - dock.top + 6; insets.r = 10;
    api.setInsets(insets.l, insets.r, insets.t, insets.b);
    placeBanner();
  }
  ui.updateInsets = updateInsets;
  ui.insets = insets;
  window.addEventListener('resize', () => requestAnimationFrame(updateInsets));

  // ---------------------------------------------------------------
  // Panels (Help, Music, How to explore, Is this the real size?, About)
  // ---------------------------------------------------------------
  function closePanels(except) {
    $$('.panel').forEach(p => { if (p.id !== 'panel-' + except) p.hidden = true; });
    $$('.rail-btn[data-panel]').forEach(b => b.setAttribute('aria-expanded', b.dataset.panel === except && !$('#panel-' + except).hidden ? 'true' : 'false'));
    if (except !== 'help') speech.stop();
  }
  ui.closePanels = () => closePanels(null);
  function openPanel(name) {
    const p = $('#panel-' + name); if (!p) return;
    const willOpen = p.hidden;
    closePanels(name);
    p.hidden = !willOpen;
    $$('.rail-btn[data-panel]').forEach(b => b.setAttribute('aria-expanded', String(b.dataset.panel === name && willOpen)));
  }
  ui.openPanel = openPanel;
  document.addEventListener('click', e => {
    const say = e.target.closest('[data-say-target]');
    if (say) { speech.read($(say.dataset.sayTarget), say); return; }
    const b = e.target.closest('[data-panel]');
    if (b) { openPanel(b.dataset.panel); return; }
    const c = e.target.closest('[data-close]');
    if (c) { const p = c.closest('.panel'); if (p) { p.hidden = true; closePanels(null); if (p.id === 'panel-help') store.set('rce-help-seen', '1'); } }
  });
  // tapping the 3D block closes any open panel
  api.onTap = () => { if ($$('.panel').some(p => !p.hidden)) closePanels(null); };
  if (!speech.ok) $$('.say-btn').forEach(b => b.hidden = true);

  // text parts (help boxes)
  ui.part = {
    bullets: a => a && a.length ? `<ul class="bul">${a.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '',
    steps: a => a && a.length ? `<ol class="steps-list">${a.map(t => `<li>${esc(t)}</li>`).join('')}</ol>` : '',
    facts: (a, cls = 'two') => a && a.length ? `<div class="qfacts ${cls}">${a.map(([k, v]) => `<div class="qf" data-say="${esc(k)}: ${esc(v)}"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>` : ''
  };

  // ---------------------------------------------------------------
  // A burst of light at a spot on the screen
  // ---------------------------------------------------------------
  ui.burst = (x, y, green = true, color = '') => {
    const b = document.createElement('div'); b.className = 'pop-burst' + (color ? ' big' : '');
    b.style.transform = `translate(${x}px, ${y}px)`;
    if (color) b.style.setProperty('--bc', color);
    let h = `<div class="ring ${green ? 'green' : ''}"></div><div class="ring r2 ${green ? 'green' : ''}"></div>`;
    for (let i = 0; i < 12; i++) h += `<div class="spark" style="--a:${i * 30}deg;--d:${70 + (i % 3) * 22}px"></div>`;
    b.innerHTML = h; document.body.appendChild(b);
    setTimeout(() => b.remove(), 1600);
  };

  // ---------------------------------------------------------------
  // Color flash: "Igneous rock has been created!" (x, y = the grain on screen)
  // ---------------------------------------------------------------
  let flareEls = [];
  ui.flare = (text, color = '#ffb74d', x = innerWidth / 2, y = innerHeight / 2) => {
    flareEls.forEach(e => e.remove()); flareEls = [];
    const flash = document.createElement('div'); flash.className = 'flare-flash';
    flash.style.background = `radial-gradient(circle at ${x}px ${y}px, ${color}cc 0%, ${color}55 22%, transparent 60%)`;
    const msg = document.createElement('div'); msg.className = 'flare-msg';
    msg.style.setProperty('--fc', color);
    msg.style.left = ((insets.l + innerWidth - insets.r) / 2) + 'px';
    msg.style.top = Math.max(insets.t + 40, Math.min(innerHeight * 0.42, y - 150)) + 'px';
    msg.innerHTML = `<span>${esc(text)}</span>`;
    document.body.append(flash, msg); flareEls = [flash, msg];
    ui.burst(x, y, false, color);
    setTimeout(() => ui.burst(x, y, false, '#ffffff'), 250);
    setTimeout(() => { flash.remove(); }, 1500);
    setTimeout(() => { msg.classList.add('out'); }, 3400);
    setTimeout(() => { msg.remove(); }, 4100);
  };
  ui.clearFlare = () => { flareEls.forEach(e => e.remove()); flareEls = []; };

  // ---------------------------------------------------------------
  // Pop-up box in the middle of the screen (students tap the button to close it)
  // ---------------------------------------------------------------
  let modalEl = null;
  ui.modal = ({ title = '', text = '', button = 'OK', icon: ic = '', onOk = null, buttons = null, tone = '' } = {}) => {
    ui.closeModal();
    speech.stop();
    const m = document.createElement('div'); m.className = 'modal-back';
    const btns = buttons || [{ label: button, onClick: onOk }];
    m.innerHTML = `<div class="modal ${tone}" role="dialog" aria-modal="true">
        ${speech.ok ? `<button class="say-btn small modal-say"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg><span>Read to me</span></button>` : ''}
        ${ic ? `<div class="modal-ico">${icon(ic)}</div>` : ''}
        <div class="modal-body">${title ? `<h2>${esc(title)}</h2>` : ''}<p class="lead">${esc(text)}</p></div>
        <div class="modal-btns">${btns.map((b, i) => `<button class="modal-ok ${b.cls || ''}" data-mb="${i}">${esc(b.label)}</button>`).join('')}</div>
      </div>`;
    document.body.appendChild(m); modalEl = m;
    const sb = m.querySelector('.modal-say'); if (sb) sb.onclick = () => speech.read(m.querySelector('.modal-body'), sb);
    m.querySelectorAll('[data-mb]').forEach(el => el.onclick = () => { ui.closeModal(); const f = btns[+el.dataset.mb].onClick; f && f(); });
    return m;
  };
  ui.closeModal = () => { if (modalEl) { speech.stop(); modalEl.remove(); modalEl = null; } };

  // ---------------------------------------------------------------
  // Full-screen celebration: confetti and fireworks
  // ---------------------------------------------------------------
  ui.celebrate = (title, sub = 'Great work!', { msg: showMsg = true, dur = 5.4 } = {}) => {
    const cv = document.createElement('canvas'); cv.className = 'celebrate';
    const msg = document.createElement('div'); msg.className = 'celebrate-msg';
    msg.innerHTML = `<b>${esc(title)}</b><span>${esc(sub)}</span>`;
    document.body.append(cv); if (showMsg) document.body.append(msg);
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    const COLORS = ['#e9b47c', '#7fe0a0', '#8cc4f0', '#ffd84d', '#ff8f7a', '#c39bff', '#ffffff'];
    const R = (a, b) => a + Math.random() * (b - a);
    const conf = [];
    const n = Math.round(Math.min(260, W * H / 4500));
    for (let i = 0; i < n; i++) conf.push({ x: R(0, W), y: R(-H * 0.9, -10), vx: R(-50, 50), vy: R(140, 280), r: R(0, 6.28), vr: R(-7, 7), w: R(6, 11), h: R(10, 17), c: COLORS[i % COLORS.length], ph: R(0, 6.28) });
    const sparks = [];
    const bursts = [0.15, 0.6, 1.0, 1.45, 1.9, 2.4, 2.9, 3.5, 4.2, 5.0, 5.8].filter(t => t < dur - 1.5).map(t => ({ t, x: R(W * 0.15, W * 0.85), y: R(H * 0.12, H * 0.5), c: COLORS[Math.floor(R(0, COLORS.length))], done: false }));
    const t0 = performance.now(); let last = t0;
    const step = now => {
      const t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, W, H);
      const fade = t > dur - 0.9 ? Math.max(0, (dur - t) / 0.9) : 1;
      for (const b of bursts) if (!b.done && t >= b.t) {
        b.done = true;
        for (let i = 0; i < 70; i++) { const a = R(0, 6.28), sp = R(120, 400); sparks.push({ x: b.x, y: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: R(1.0, 1.7), age: 0, c: Math.random() < 0.25 ? '#ffffff' : b.c }); }
      }
      ctx.globalCompositeOperation = 'lighter';
      for (const p of sparks) {
        p.age += dt; if (p.age > p.life) continue;
        p.vx *= 0.985; p.vy = p.vy * 0.985 + 160 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        const a = (1 - p.age / p.life) * fade;
        ctx.globalAlpha = a; ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, 6.283); ctx.fill();
        ctx.globalAlpha = a * 0.25; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      for (const p of conf) {
        p.ph += dt * 3; p.x += (p.vx + Math.sin(p.ph) * 40) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        if (p.y > H + 20 && t < dur - 1.6) { p.y = R(-60, -10); p.x = R(0, W); }
        ctx.save(); ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.scale(1, Math.abs(Math.cos(p.ph)) * 0.8 + 0.2);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
      if (t < dur) requestAnimationFrame(step); else cv.remove();
    };
    requestAnimationFrame(step);
    setTimeout(() => msg.remove(), 3600);
  };

  // ---------------------------------------------------------------
  // Quiet background music (settings in js/data/music.js)
  // ---------------------------------------------------------------
  ui.music = (() => {
    const M = window.MUSIC;
    const stub = { duck() {}, set() {}, isOn: () => false };
    if (!M || !M.songs || !M.songs.length) { const b = $('#musicBtn'); if (b) b.remove(); return stub; }
    const audio = new Audio(); audio.loop = true; audio.preload = 'none'; audio.volume = M.volume ?? 0.6;
    let on = store.get('rce-music') ? store.get('rce-music') === 'on' : M.on !== false;
    let song = store.get('rce-song') || M.song || M.songs[0].id;
    if (!M.songs.some(x => x.id === song)) song = M.songs[0].id;
    const ducks = new Set(); let unlocked = false, hidden = false;
    // iPads play the .m4a files; a few other browsers need the .webm copy
    const useWebm = !audio.canPlayType('audio/mp4; codecs="mp4a.40.2"') && !!audio.canPlayType('audio/webm; codecs="opus"');
    const fileOf = id => { const f = (M.songs.find(x => x.id === id) || M.songs[0]).file; return useWebm ? f.replace(/\.m4a$/, '.webm') : f; };
    function apply() {
      const want = on && unlocked && ducks.size === 0 && !hidden;
      if (want) {
        if (!audio.src.endsWith(fileOf(song))) audio.src = fileOf(song);
        const pr = audio.play(); if (pr && pr.catch) pr.catch(() => {});
      } else audio.pause();
      const b = $('#musicBtn'); if (b) b.classList.toggle('muted', !on);
      const t = $('#musicToggle'); if (t) t.checked = on;
      $$('[data-song]').forEach(r => { r.setAttribute('aria-checked', String(r.dataset.song === song)); r.classList.toggle('playing', r.dataset.song === song && want); });
    }
    // browsers only start sound after a tap, so wait for the first one
    const unlock = () => { if (unlocked) return; unlocked = true; apply(); };
    ['click', 'touchend', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, true));
    document.addEventListener('visibilitychange', () => { hidden = document.hidden; apply(); });
    const set = v => { on = v; store.set('rce-music', on ? 'on' : 'off'); unlocked = true; apply(); };
    const tg = $('#musicToggle'); if (tg) tg.onchange = () => set(tg.checked);
    const list = $('#songList');
    if (list) {
      list.innerHTML = M.songs.map(x => `<button class="song" data-song="${esc(x.id)}" role="radio" aria-checked="false"><i></i><b>${esc(x.name)}</b><span>${esc(x.mood || '')}</span><em class="eq" aria-hidden="true"><u></u><u></u><u></u></em></button>`).join('');
      list.querySelectorAll('[data-song]').forEach(r => r.onclick = () => { song = r.dataset.song; store.set('rce-song', song); on = true; store.set('rce-music', 'on'); unlocked = true; audio.src = fileOf(song); apply(); });
    }
    const mapi = { duck(key, d) { if (d) ducks.add(key); else ducks.delete(key); apply(); }, set, isOn: () => on, _audio: audio };
    speech.onChange = reading => mapi.duck('speech', reading);
    apply();
    return mapi;
  })();

  // ---------------------------------------------------------------
  // About, "Is this the real size?", first-time help
  // ---------------------------------------------------------------
  const D = window.ROCK_CYCLE || {};
  $('#scaleBody').innerHTML = `<button class="say-btn" data-say-target="#scaleBody"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg><span>Read to me</span></button>${ui.part.bullets(D.scale || [])}`;
  $('#aboutBody').innerHTML = `
    <p><b>Rock Cycle Explorer</b> is an independent classroom project. It was not made by or endorsed by any museum, university, publisher, or agency.</p>
    <p><b>The idea:</b> inspired by the 3D rock cycle simulation on SciSim (scisim.org). Everything on this site was built new, for iPads.</p>
    <p><b>Ground and rock pictures:</b> real photos from Poly Haven (polyhaven.com), free to use (CC0).</p>
    <p><b>Music:</b> by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0. The songs have fun names on this site. Their real titles are: ${((window.MUSIC && window.MUSIC.songs) || []).map(x => `“${esc(x.original || x.name)}”`).join(', ')}.</p>
    <p><b>3D engine:</b> Three.js (MIT license). <b>Fonts:</b> Atkinson Hyperlegible and Big Shoulders Display (SIL Open Font License).</p>`;
  if ('requestFullscreen' in document.documentElement && !navigator.standalone) {
    $('#fullscreenBtn').hidden = false;
    $('#fullscreenBtn').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); };
  }
  requestAnimationFrame(updateInsets);
  return ui;
}
