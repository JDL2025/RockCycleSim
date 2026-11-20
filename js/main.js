// Rock Cycle Explorer — starts everything.
import { createScene } from './scene.js';
import { createUI } from './app.js';

const ok = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2')); } catch (e) { return false; } })();
if (!ok) {
  document.getElementById('fail').hidden = false;
} else {
  const api = createScene(document.getElementById('stage'));
  const ui = createUI(api);
  window.RCE = { api, ui };

  // view buttons and labels
  const viewBtns = [...document.querySelectorAll('[data-view]')];
  viewBtns.forEach(b => b.onclick = () => {
    api.setView(b.dataset.view);
    viewBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  });
  const lb = document.getElementById('labelsBtn');
  lb.onclick = () => { const on = !api.labelsOn(); api.setLabels(on); lb.setAttribute('aria-pressed', String(on)); };

  api.ready.then(() => {
    document.getElementById('loading').remove();
    // the rock cycle is its own file, so a problem there can't stop the 3D view
    import('./cycle.js').then(m => {
      if (window.ROCK_CYCLE) window.RCE.cycle = m.createCycle(api, ui, window.ROCK_CYCLE);
    }).catch(e => console.warn('Rock cycle not loaded', e));
  });
}

// Stop iPad Safari from pinch-zooming the whole page (same fix as Mars Explorer)
['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
