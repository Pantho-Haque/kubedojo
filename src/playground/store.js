// The playground's UI state, as a small external store (React reads it through useStore()).
// The simulator objects (sim, clusters, shells) are live, mutable engine objects: components read them while rendering,
// and every change bumps `version`, exactly like the prototype redrew itself after each command / simulator tick.
import { useSyncExternalStore } from 'react';
import PG from '../engine/engine.js';
import { TermModel, selText } from './term.js';

export const FS_KEY = 'k8s-playground:fs:v1'; // same keys as the prototype, so your saved files carry over
export const TOUR_KEY = 'k8s-playground:tour:v1';
export const SYSTEM_NS = ['kube-system', 'kube-public', 'kube-node-lease', 'local-path-storage', 'ingress-nginx', 'default-system'];
const PALETTE = ['#4f9dff', '#ff8c42', '#b57cff', '#32d6a0', '#ff5c8a', '#e6c229', '#5ad1e6', '#9bd14f', '#ff7ae0', '#a0a8ff'];
export const nsColor = n => { if (SYSTEM_NS.includes(n)) return '#6b7280'; if (n === 'default') return '#8b95a5'; let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0; return PALETTE[h % PALETTE.length]; };

const loadFs = () => { try { const t = localStorage.getItem(FS_KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } };
const storageWorks = () => { try { localStorage.setItem(FS_KEY + ':probe', '1'); localStorage.removeItem(FS_KEY + ':probe'); return true; } catch (e) { return false; } };

export const VIZ_TABS = ['cluster', 'docker', 'config', 'helm', 'files', 'log'];
const LAYOUT_KEY = 'kubedojo:layout';
const LAYOUT_DEFAULT = { side: 310, viz: 0 }; // viz 0 = automatic width
const loadLayout = () => { try { return { ...LAYOUT_DEFAULT, ...JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}') }; } catch (e) { return { ...LAYOUT_DEFAULT }; } };

class Store {
  layout = loadLayout(); paletteOpen = false; mobilePane = 'term';
  version = 0; listeners = new Set();
  sim = null; terms = []; active = null; termSeq = 0;
  vizTab = 'cluster'; selCluster = null; inspect = null; showSystem = false; hiddenNs = new Set(); hoverSvc = null; openFile = null;
  noside = false; speed = 2; tourIndex = -1; exportOpen = false; renderHeld = false;
  fsStatus = 'unknown'; fsBytes = 0; saveT = null; seen = {}; _animV = -1; _anim = {};

  subscribe = l => { this.listeners.add(l); return () => this.listeners.delete(l); };
  getSnapshot = () => this.version;
  bump() { this.version++; for (const l of [...this.listeners]) l(); }

  /* ---- your files live in this browser (localStorage) ---- */
  saveFsNow = () => { if (!this.sim) return; try { const j = JSON.stringify(this.sim.fs.snapshot()); this.fsBytes = j.length; if (j.length > 4500000) { this.fsStatus = 'toobig'; return; } localStorage.setItem(FS_KEY, j); this.fsStatus = 'ok'; } catch (e) { this.fsStatus = 'unavailable'; } };
  scheduleSave() { clearTimeout(this.saveT); this.saveT = setTimeout(() => { this.saveFsNow(); if (this.vizTab === 'files') this.bump(); }, 300); }

  /* ---- world lifecycle ---- */
  boot() {
    for (const t of this.terms) t.dispose();
    this.fsStatus = storageWorks() ? 'ok' : 'unavailable';
    const sim = this.sim = new PG.Sim(loadFs()); sim.fs.onChange = () => this.scheduleSave(); sim.speed = this.speed; sim.start(250, 0.25); sim.onChange(() => this.bump());
    PG.resetHook = async () => { this.reset(); };
    PG.startTour = at => this.startTour(at); PG.openExport = () => { this.exportOpen = true; this.bump(); };
    this.terms = []; this.active = null; this.selCluster = null; this.inspect = null; this.hiddenNs = new Set(); this.seen = {}; this.openFile = null; this.termSeq = 0; this.addTerm(); this.bump();
  }
  reset() { this.sim.stop(); this.boot(); }
  mount() { if (!this.sim) this.boot(); else this.sim.start(250, 0.25); } // leaving the page pauses the simulated clock, coming back resumes it
  unmount() { if (this.sim) this.sim.stop(); this.saveFsNow(); }

  /* ---- terminals ---- */
  addTerm() { if (this.terms.length >= 4) return null; const t = new TermModel(this, ++this.termSeq, 'Terminal ' + (this.terms.length + 1)); this.terms.push(t); this.showTerm(t); return t; }
  showTerm(t) { this.active = t; this.bump(); setTimeout(() => t.focus(), 0); }
  closeTerm(t) { if (this.terms.length === 1) return; t.dispose(); this.terms = this.terms.filter(x => x !== t); this.showTerm(this.terms[this.terms.length - 1]); }
  async runInTerm(text, run) {
    const t = this.active; if (!t) return;
    if (t.running) { t.print('(a command is still running in this tab — press Ctrl-C, or use another tab)', 'dim'); return; }
    if (run || text.includes('\n')) await t.runText(text); else { t.setValue(text); t.focus(); }
  }

  /* ---- layout: pane widths (dragged or keyboard-resized) are remembered ---- */
  setLayout(patch, persist = true) { this.layout = { ...this.layout, ...patch }; if (persist) { try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(this.layout)); } catch (e) { } } this.bump(); }
  resetLayout() { this.layout = { ...LAYOUT_DEFAULT }; try { localStorage.removeItem(LAYOUT_KEY); } catch (e) { } this.bump(); }
  openPalette() { this.paletteOpen = true; this.bump(); }
  closePalette() { this.paletteOpen = false; this.bump(); setTimeout(() => this.active && this.active.focus(), 0); }
  setPane(p) { this.mobilePane = p; this.bump(); if (p === 'term') setTimeout(() => this.active && this.active.focus(), 0); }

  /* ---- views ---- */
  setViz(tab) { if (!VIZ_TABS.includes(tab)) return; if (tab !== this.vizTab) window.getSelection()?.removeAllRanges(); this.vizTab = tab; this.bump(); }
  toggleSide() { this.noside = !this.noside; this.bump(); }
  setSpeed(v) { this.speed = v; if (this.sim) this.sim.speed = v; this.bump(); }
  clusterList() { return Object.values(this.sim.clusters); }
  viewCluster() { const cur = this.sim.currentCluster(); const all = this.clusterList(); if (this.selCluster && this.sim.clusters[this.selCluster]) return this.sim.clusters[this.selCluster]; return cur || all[0] || null; }
  podAnim(uid, st) { // 'pop' the first time a pod shows up, 'flash' when its status changes (computed once per redraw)
    if (this._animV !== this.version) { this._animV = this.version; this._anim = {}; }
    if (uid in this._anim) return this._anim[uid];
    const prev = this.seen[uid]; this.seen[uid] = st; return (this._anim[uid] = prev === undefined ? 'pop' : prev !== st ? 'flash' : '');
  }
  inspectItem(k, ns, n) { const cl = this.viewCluster(); this.inspect = { cl: cl.entry, k, ns, n, mode: 'describe' }; this.bump(); }

  /* ---- tour / export ---- */
  startTour(at) { this.tourIndex = Math.max(0, at || 0); this.bump(); }
  endTour(markSeen = true) { this.tourIndex = -1; if (markSeen) { try { localStorage.setItem(TOUR_KEY, '1'); } catch (e) { } } this.bump(); setTimeout(() => this.active && this.active.focus(), 0); }
  tourSeen() { try { return !!localStorage.getItem(TOUR_KEY); } catch (e) { return false; } }

  /* ---- start-up options (query string), for demos and tests: ?run=<JSON array of commands/numbers>&tab=files&tour=3&notour=1 ---- */
  async applyParams(p) {
    if (this._applied) return; this._applied = true; // once per page load (React StrictMode runs effects twice in development)
    const run = p.get('run'); const tab = p.get('tab'); const tour = p.get('tour');
    if (tab && VIZ_TABS.includes(tab)) { this.vizTab = tab; this.bump(); }
    if (run) { try { for (const c of JSON.parse(run)) { if (typeof c === 'number') { await this.sim.wait(c, { aborted: false }); continue; } await this.active.runText(c); } } catch (e) { console.error(e); } }
    if (tour != null && tour !== '') setTimeout(() => this.startTour(Number(tour)), 200);
    else if (!run && !p.has('notour') && !this.tourSeen()) setTimeout(() => this.startTour(0), 600);
  }
}

export const store = new Store();
export const useStore = () => useSyncExternalStore(store.subscribe, store.getSnapshot);
export const useStoreSel = fn => useSyncExternalStore(store.subscribe, () => fn(store)); // re-render only when the selected primitive changes
export { selText };
