// The Academy's Kubernetes lab, mounted in a shadow root so its styles and element ids never meet the page's.
// Each mount is its own cluster: Simulate has one, and every lesson's "Set up and try" drawer has another.
import css from './k8slab.css?raw';
import html from './k8slab.html?raw';
import { labCore } from './k8slab-core.js';
import '../product.css'; // the bars around the lab (Simulate, the lesson drawer) use its tokens

const SAVE_V = 1;
// The lesson drawer shows only the picture and the terminal.
const COMPACT = '.labroot{grid-template-columns:minmax(0,1fr)!important;height:100%;min-height:0}aside,#tutfoot,#yamlfoot{display:none!important}main{padding:8px;height:100%;min-height:0}';

export function mountK8sLab(host, { storageKey, hash = '', compact = false } = {}) {
  const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${css}${compact ? COMPACT : ''}</style>${html}`;
  const ids = { i: new Set(), t: new Set(), r: new Set() };
  const T = {
    setInterval: (f, ms) => { const id = setInterval(f, ms); ids.i.add(id); return id; },
    setTimeout: (f, ms) => { const id = setTimeout(() => { ids.t.delete(id); f(); }, ms); ids.t.add(id); return id; },
    raf: f => { const id = requestAnimationFrame(t => { ids.r.delete(id); f(t); }); ids.r.add(id); return id; },
  };
  // the lesson block's lines still to type: after each one runs, the next waits on the prompt (set after the lab's own
  // Enter handler has emptied it, hence the timeout)
  let queue = [];
  const core = labCore(root, { hash, search: '', onRun: line => { if (queue.length && line.trim() === queue[0]) { queue.shift(); if (queue.length) T.setTimeout(() => core.setInput(queue[0]), 0); } } }, T);
  const read = () => { try { const d = JSON.parse(localStorage.getItem(storageKey) || 'null'); return d && d.v === SAVE_V ? d : null; } catch { return null; } };
  const write = () => { try { localStorage.setItem(storageKey, JSON.stringify({ v: SAVE_V, at: Date.now(), ...core.save() })); } catch { /* full or blocked: keep working unsaved */ } };
  const saved = storageKey && read();
  if (saved) { try { core.load(saved); } catch { forget(); } }
  // ponytail: saves on a 2 s timer and on leave; hook the lab's redraw if sessions ever grow large
  const saver = storageKey ? setInterval(write, 2000) : null;
  function forget() { try { localStorage.removeItem(storageKey); } catch { /* ignore */ } }
  return {
    restored: !!saved, savedAt: saved?.at || null,
    run: line => core.run(line), setInput: v => core.setInput(v), note: t => core.note(t),
    // Put the lab in the state a lesson needs: a fresh cluster, the earlier commands replayed, then this block's first line waiting on the prompt.
    setUp(setup, cmds) { queue = []; core.setMode('play'); core.labReset(); if (setup.length) core.note(`# setting up: ${setup.length} earlier step${setup.length === 1 ? '' : 's'} from this lesson`); for (const c of setup) core.run(c); core.note('# ready: press Enter to run the command below' + (cmds.length > 1 ? ` (${cmds.length} lines in this block, one at a time)` : '')); queue = [...cmds]; core.setInput(cmds[0]); },
    reset() { queue = []; forget(); core.setMode('play'); core.labReset(); core.drawLab(); },
    stop() { if (saver) { clearInterval(saver); write(); } ids.i.forEach(clearInterval); ids.t.forEach(clearTimeout); ids.r.forEach(cancelAnimationFrame); root.innerHTML = ''; },
  };
}

