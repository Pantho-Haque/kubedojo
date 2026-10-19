// One terminal tab: scrollback, input line, history, fish-style suggestions, and the object the simulator's shell talks to
// (print / clear / edit / cols). Pure state (no DOM); TermView.jsx renders it.
import PG from '../engine/engine.js';

export const selText = () => { const g = window.getSelection(); return g ? g.toString() : ''; };

const HIST = []; // every command typed in any tab, for the grey suggestion
let guideCmds = null;
export function suggestFor(v) {
  if (!v || /^\s+$/.test(v)) return '';
  for (let i = HIST.length - 1; i >= 0; i--) if (HIST[i].length > v.length && HIST[i].startsWith(v)) return HIST[i];
  if (!guideCmds) { guideCmds = []; for (const sec of PG.GUIDE) for (const it of sec.items) if (!it[1].includes('\n')) guideCmds.push(it[1]); }
  return guideCmds.find(c => c.length > v.length && c.startsWith(v)) || '';
}

const BANNER = 'KubeDojo — everything here is simulated: no Docker, no real cluster.\nType "help", click commands in the left panel, search them all with Ctrl/⌘ Shift P, or press ▶ (top right) for a walkthrough. You start inside a fake PRODUCTION cluster: look before you type!\n';

let UID = 0;
export class TermModel {
  constructor(store, id, label) {
    this.store = store; this.id = id; this.label = label; this.uid = ++UID; // id restarts at 1 after Reset (it picks the welcome banner); uid never repeats (React key)
    this.shell = new PG.Shell(store.sim, this); store.sim.shells.push(this.shell);
    this.hist = []; this.hi = 0; this.running = false; this.value = ''; this.lines = []; this.seq = 0; this.vi = null;
    this.inputEl = null; this.viEl = null; this.getCols = null; this.forceScroll = false;
    this.version = 0; this.listeners = new Set(); this.queued = false; this.saveT = null;
    if (id === 1) this.print(BANNER, 'dim');
  }
  /* ---- external-store plumbing (useSyncExternalStore) ---- */
  subscribe = l => { this.listeners.add(l); return () => this.listeners.delete(l); };
  getSnapshot = () => this.version;
  emit() { this.version++; for (const l of [...this.listeners]) l(); }
  notify() { if (this.queued) return; this.queued = true; queueMicrotask(() => { this.queued = false; this.emit(); }); this.scheduleSave(); } // output is batched: a 3000-line command renders once
  scheduleSave() { if (this.saveT) return; this.saveT = setTimeout(() => { this.saveT = null; this.store.saveTerm(this); }, 800); }
  setValue(v) { this.value = v; this.emit(); } // typing must update synchronously (controlled input)

  /* ---- what the shell calls ---- */
  print(text, cls) { this.lines.push({ id: ++this.seq, text, cls, pre: /\S {3,}\S/.test(text) }); if (this.lines.length > 2500) this.lines.splice(0, this.lines.length - 2500); this.notify(); }
  printCmd(prompt, text) { this.lines.push({ id: ++this.seq, cmd: true, prompt, text }); this.notify(); }
  clear() { this.lines = []; clearTimeout(this.saveT); this.saveT = null; this.store.forgetTerm(this); this.notify(); } // also removes this terminal's saved history
  get cols() { return this.getCols ? this.getCols() : 80; } // ls column layout
  edit(vi) { return new Promise(resolve => { this.vi = { vi, resolve, seq: ++this.seq }; this.store.bump(); }); } // full-pane vi: keys go to the editor until :q
  finishVi() { const v = this.vi; if (!v) return; this.vi = null; this.store.bump(); v.resolve(); setTimeout(() => { if (this.store.active === this) this.focus(); }, 0); }

  focus() { (this.vi ? this.viEl : this.inputEl)?.focus(); }
  prompt() { return this.shell.prompt(); }

  suggestionFor(el) { const v = this.value; return el && el.selectionStart === v.length && el.selectionEnd === v.length && !this.running ? suggestFor(v) : ''; }

  async enter(text) {
    if (this.running) return; const p = this.shell.prompt(); this.printCmd(p, text);
    if (text.trim() && this.hist[this.hist.length - 1] !== text) this.hist.push(text); if (text.trim() && HIST[HIST.length - 1] !== text) HIST.push(text); this.hi = this.hist.length; this.forceScroll = true;
    this.running = true; this.emit();
    try { await this.shell.submit(text); } catch (e) { this.print('internal error: ' + e, 'err'); }
    this.running = false; this.forceScroll = true; this.emit(); if (this.store.active === this) this.focus(); this.store.bump();
  }
  async pasteLines(text) { const lines = text.replace(/\r/g, '').split('\n'); if (lines[lines.length - 1] === '') lines.pop(); const first = this.value + lines[0]; this.setValue(''); await this.enter(first); for (const l of lines.slice(1)) await this.enter(l); }
  async runText(text) { for (const l of text.split('\n')) await this.enter(l); }

  /* ---- keyboard (React synthetic event) ---- */
  key(e) {
    const el = e.currentTarget; this.forceScroll = true; this.notify();
    const sg = this.suggestionFor(el), v = this.value;
    if (sg) { // fish-style: Tab / → / End / Ctrl-F take the whole grey suggestion, Option(or Ctrl)+→ / Option+F take one word
      const word = (e.key === 'ArrowRight' && (e.altKey || e.ctrlKey)) || (e.altKey && e.code === 'KeyF');
      if (word && !e.metaKey) { e.preventDefault(); const m = /^\s*\S+/.exec(sg.slice(v.length)); this.setValue(v + (m ? m[0] : sg.slice(v.length))); return; }
      if (!e.shiftKey && !e.metaKey && !e.altKey && ((e.key === 'ArrowRight' && !e.ctrlKey) || e.key === 'End' || e.key === 'Tab' || (e.ctrlKey && e.key === 'f'))) { e.preventDefault(); this.setValue(sg); return; }
    }
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k' && !this.running) { e.preventDefault(); this.clear(); return; }
    if (e.key === 'Enter') { e.preventDefault(); const t = this.value; this.setValue(''); this.enter(t); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (this.hi > 0) { this.hi--; this.setValue(this.hist[this.hi]); } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (this.hi < this.hist.length - 1) { this.hi++; this.setValue(this.hist[this.hi]); } else { this.hi = this.hist.length; this.setValue(''); } }
    else if (e.ctrlKey && (e.key === 'c' || e.key === 'C') && (selText() || el.selectionStart !== el.selectionEnd)) { /* copy the selection, do not abort */ }
    else if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) { e.preventDefault(); if (this.running) { this.shell.abort(); this.print('^C', 'dim'); } else { this.printCmd(this.shell.prompt(), this.value + '^C'); this.setValue(''); this.shell.buf = null; } }
    else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) { e.preventDefault(); this.clear(); }
    else if (e.key === 'Tab') {
      e.preventDefault(); const t = this.value; const r = PG.complete(this.shell, t); if (!r.matches.length) return;
      const common = r.matches.reduce((a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return a.slice(0, i); });
      const head = t.slice(0, t.length - r.word.length);
      if (r.matches.length === 1) this.setValue(head + r.matches[0] + (r.matches[0].endsWith('/') || r.matches[0].endsWith('=') ? '' : ' '));
      else { this.setValue(head + common); if (common === r.word) this.print(this.shell.prompt() + t + '\n' + r.matches.join('   '), 'dim'); }
    }
  }

  dispose() { clearTimeout(this.saveT); const sim = this.store.sim; const i = sim.shells.indexOf(this.shell); if (i >= 0) sim.shells.splice(i, 1); this.shell.abort(); }
}
