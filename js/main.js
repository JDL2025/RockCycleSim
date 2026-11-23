// Rock Cycle Explorer — starts everything.
import { createScene } from './scene.js';
import { createUI } from './app.js';
import { createProgress } from './progress.js';

const ok = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2')); } catch (e) { return false; } })();
if (!ok) {
  document.getElementById('fail').hidden = false;
} else {
  const api = createScene(document.getElementById('stage'));
  const ui = createUI(api);
  window.RCE = { api, ui };
  // what each student has finished, and which modes are unlocked (saved on the iPad)
  try { if (window.PROGRESS) ui.progress = createProgress(ui, window.PROGRESS, window.QUIZZES, window.DIAGRAM, window.ROCK_TYPES); } catch (e) { console.warn('Progress not loaded', e); }

  // labels on/off
  const lb = document.getElementById('labelsBtn');
  lb.onclick = () => { const on = !api.labelsOn(); api.setLabels(on); lb.setAttribute('aria-pressed', String(on)); };

  api.ready.then(() => {
    document.getElementById('loading').remove();
    // the rock cycle is its own file, so a problem there can't stop the 3D view
    import('./quiz.js').then(q => { if (window.QUIZZES) ui.quiz = q.createQuiz(ui, window.QUIZZES); }).catch(e => console.warn('Quiz not loaded', e))
    .then(() => import('./cycle.js')).then(m => {
      if (window.ROCK_CYCLE) window.RCE.cycle = m.createCycle(api, ui, window.ROCK_CYCLE);
      if (ui.progress) ui.progress.refresh();                          // lock the Quiz button right away
      // Energy mode is its own file, so a problem there can't stop the Real World Rock Cycle
      return import('./energy.js').then(e => { if (window.ENERGY && window.RCE.cycle) window.RCE.energy = e.createEnergy(api, ui, window.RCE.cycle, window.ENERGY); if (ui.progress) ui.progress.refresh(); })
        // Rock Cycle Diagram mode is its own file too (it adds its own button to the Modes menu)
        .then(() => window.DIAGRAM && window.RCE.energy && import('./diagram.js').then(d => { window.RCE.diagram = d.createDiagram(api, ui, window.DIAGRAM, window.RCE.energy); if (ui.progress) ui.progress.refresh(); }).catch(e => console.warn('Diagram not loaded', e)))
        // Rock Types mode (adds its own button to the Modes menu too)
        .then(() => window.ROCK_TYPES && window.RCE.energy && import('./rocks.js').then(r => { window.RCE.rocks = r.createRocks(api, ui, window.ROCK_TYPES, window.RCE.energy); if (ui.progress) ui.progress.refresh(); }).catch(e => console.warn('Rock Types not loaded', e)))
        .then(() => ui.progress && ui.progress.refresh());            // show the locks on the new buttons
    }).catch(e => console.warn('Rock cycle not loaded', e));
  });
}

// Stop iPad Safari from pinch-zooming the whole page (same fix as Mars Explorer)
['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
