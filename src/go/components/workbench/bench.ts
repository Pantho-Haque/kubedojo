// The workbench controller: editor ⇄ stage ⇄ player ⇄ console, for the playground and lessons.
// It is the prototype's mutable `W` plus its logic, framework-free. React components read its
// fields; `changed()` re-renders the workbench, `stepped()` only the parts that follow the playhead.
import { check, createPlayer, execute, loadEditor, loadStage, traceOf, type Player, type RunOptions, type RunResult, type State } from '../../lib/run';
import { getSettings, setSetting } from '../../lib/settings';
import { announce, hush, speak, status, toast } from '../../lib/shell';
import { P } from '../../lib/progress';
import { program } from '../../lib/packs';
import { store } from '../../lib/store';
import { download, origin, pack, svgToPNG, unpack } from '../../lib/share';
import { href } from '../../lib/routes';
import { clip, type Lesson } from '../../lib/data';
import { useSyncExternalStore } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any; // the framework-free core modules (stage, editor, traces) are untyped

export { STARTER } from '../../lib/starter';
import { STARTER } from '../../lib/starter';

export const PHASES = [['read', 'Read'], ['watch', 'Watch'], ['try', 'Try'], ['check', 'Check']] as const;
export type Phase = (typeof PHASES)[number][0];
export type Lens = 'stage' | 'gantt' | 'table' | 'memory';
export type Pane = 'guide' | 'code' | 'stage';
export type Diag = { line: number; column: number; message: string };
export type Cap = { label: string; color: string; html: string; pinned?: boolean };
export type Escape = { site: number; name?: string; diagnostic: string; reason: string };
export type Alloc = { line: number; objects: number; moved: Escape[]; level: number };
export type Empty = { kind: 'idle' } | { kind: 'problems'; list: Diag[] } | { kind: 'stopped'; msg?: string } | null;
export type TryChallenge = { task: string; hint?: string; hints?: string[]; expect?: string; maxAllocs?: number; noRaces?: boolean; solution?: string };
type Sum = { writes: { line: number; items: string[] }[]; hits: Set<number>; marks: number[]; kinds: string[]; n: number; [k: string]: unknown };
type Opts = { seed: number; gcPercent: number; memoryLimit: number | null; schedule: 'default' | 'random'; preempt: number; picks: string[] };

export const SCHED_RUNS = 16;
const SCHED_PREEMPT = 2;
export const SPEEDS = [0.25, 0.5, 1, 2, 4];
const MYKEY = 'gothik-programs-v1', NKEY = 'gothik-notes-v1';
export type Mine = { id: string; name: string; tags: string[]; source: string; updated: number };
export const mine = (): Mine[] => { const v = store.get<Mine[]>(MYKEY, []); return Array.isArray(v) ? v : []; };
export const saveMineList = (list: Mine[]) => store.set(MYKEY, list);
export const notes = (): Record<string, Record<number, string>> => store.get(NKEY, null) || {};
export const saveNotes = (all: Record<string, Record<number, string>>) => store.set(NKEY, all);
export const srcHash = (t: string) => { let h = 2166136261; for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619); return (h >>> 0).toString(36); };
export const plain = (html: string) => new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
const lineOf = (s: State) => (s && s.line >= 0 ? s.line + 1 : 0);
const norm = (s: unknown) => String(s ?? '').replace(/\r/g, '').split('\n').map((l) => l.trim()).join('\n').trim();
const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A lesson's hands-on challenge: the capstone exercise if it has one, else its "try" task. */
export function tryOf(l: Lesson): TryChallenge | null {
  const cap = l.capstone;
  if (cap?.goal?.stdout != null) {
    const g = cap.goal, extra = [g.maxModelAllocations != null ? 'with at most ' + g.maxModelAllocations + ' heap allocation' + (g.maxModelAllocations === 1 ? '' : 's') : '', g.noRaces ? 'with no data race' : ''].filter(Boolean).join(' and ');
    return { task: 'Start from the program in the editor and change it so it prints `' + g.stdout.trim() + '`' + (extra ? ' ' + extra : '') + '.', hints: cap.hints, expect: '^\\s*' + reEsc(g.stdout.trim()) + '\\s*$', maxAllocs: g.maxModelAllocations, noRaces: g.noRaces, solution: program(cap.solution)?.source };
  }
  return l.try || null;
}

/** Distinct heap objects per source line, plus the model's "moved to heap" decisions. */
export function heapSummary(t: State[] | null) {
  const per = new Map<number, Set<unknown>>();
  for (const st of t || []) for (const o of st.objects || []) {
    const ln = typeof o.site === 'object' ? o.site?.line : o.site;
    if (!(ln > 0)) continue;
    if (!per.has(ln)) per.set(ln, new Set());
    per.get(ln)!.add(o.id);
  }
  const moved: Escape[] = t?.at(-1)?.escape || [];
  return { per, moved, objects: [...per.values()].reduce((n, x) => n + x.size, 0) };
}

// the stage is styled by page CSS; an exported SVG needs those styles inline
const STYLE_PROPS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'font-family', 'font-size', 'font-weight', 'letter-spacing', 'dominant-baseline', 'text-anchor', 'display', 'visibility', 'marker-start', 'marker-end'];
export const VIDEO_MAX = 150;
export const videoType = () => (typeof MediaRecorder === 'function' && typeof HTMLCanvasElement.prototype.captureStream === 'function' ? ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find((t) => MediaRecorder.isTypeSupported(t)) : undefined);

/* ---------- optional AI tutor (the learner's own API key, hosted builds only) ---------- */
export const TUTOR_ON = import.meta.env.VITE_GOTHIK_AI === '1';
export const TUTOR_KEY = 'gothik-ai-key';
const TUTOR_MODEL = 'claude-opus-5-5';
const TUTOR_SYSTEM = 'You are a patient Go tutor inside gothik, an app that animates a Go program step by step (stack frames, heap objects, slices, goroutines, channels, garbage collection). ' +
  'Teach Socratically: give a hint or a guiding question before a full answer, and give the full answer only when the learner asks for it or is clearly stuck after hints. ' +
  'Keep replies under 120 words, in plain language, with at most one short code snippet. Refer to what the learner can see on the stage when it helps. ' +
  'gothik runs a teaching model of the runtime: its addresses, sizes, scheduling and GC timing are simplified, so say so when a question depends on real runtime details. Be accurate about Go semantics.';

/** Something to run once the playground has loaded (a command started from a lesson). */
export const pending: { fn: ((b: Bench) => void) | null } = { fn: null };

export class Bench {
  S: Any = null; Ed: Any = null; editor: Any = null; stage: Any = null; player: Player | null = null; stageHost: HTMLElement | null = null;
  ready = false; dead = false; mountId = 0; // a new id per successful mount (effects key on it)
  opts: Opts = { seed: 42, gcPercent: 100, memoryLimit: null, schedule: 'default', preempt: 0, picks: [] };
  mode: 'play' | 'lesson' | null = null; lesson: Lesson | null = null; programId: string | null = null; key = 'playground'; shared: string | null = null;
  result: RunResult | null = null; lastRun: string | null = null; runId = 0; sum: Sum | null = null; narrCache = new Map<string, Any>();
  problems: Diag[] = []; allocs: Alloc[] = []; explored: { src: string; groups: { out: string; crashed: boolean; seeds: number[] }[] } | null = null;
  dirty = false; running = false; stale = false; exit: { cls: string; text: string } | null = null; empty: Empty = { kind: 'idle' };
  lens: Lens = 'stage'; pane: Pane = 'code'; presenting = false; recording = false;
  phase: Phase = 'read'; phasesDone = new Set<Phase>(); prediction: string | null = null; predictResult: { ok: boolean; actual: string } | null = null; tryMsg: { ok: boolean; text?: string } | null = null;
  cur: { s: State; i: number } | null = null; playing = false; capOverride: Cap | null = null; speaking: Promise<void> | null = null;
  tutorChat: { role: string; content: unknown }[] = []; tutorLog: { who: string; html: string }[] = []; tutorSrc: string | null = null; tutorKey = '';
  private timers: Record<string, ReturnType<typeof setTimeout>> = {};

  /* ---------- tiny external store: coarse changes + per-step changes ---------- */
  v = 0; sv = 0;
  private subs = new Set<() => void>(); private stepSubs = new Set<() => void>();
  sub = (f: () => void) => { this.subs.add(f); return () => { this.subs.delete(f); }; };
  subStep = (f: () => void) => { this.stepSubs.add(f); return () => { this.stepSubs.delete(f); }; };
  changed() { this.v++; this.subs.forEach((f) => f()); }
  stepped() { this.sv++; this.stepSubs.forEach((f) => f()); }

  /* ---------- mount / unmount ---------- */
  constructor(mode: 'play' | 'lesson') { this.pane = mode === 'lesson' ? 'guide' : 'code'; } // phones open a lesson on its text
  private mounts = 0;
  async mount(edHost: HTMLElement, stageHost: HTMLElement) {
    const token = ++this.mounts; // React may mount, unmount and mount again before the modules load
    this.dead = false;
    const [{ GothikStage: S }, { GothikEditor: Ed }] = await Promise.all([loadStage(), loadEditor()]);
    if (this.dead || token !== this.mounts) return;
    this.S = S; this.Ed = Ed; this.stageHost = stageHost;
    this.editor = Ed.mount(edHost, {
      onChange: (src: string) => this.onChange(src), onRun: () => this.run({ autoplay: true, force: true }),
      onHover: (w: string | null) => this.onHover(w), onGutter: (l: number) => this.onGutter(l),
      onCursor: (l: number, c: number) => status({ cursor: 'Ln ' + l + ', Col ' + c }), tabs: () => getSettings().tabs,
    });
    this.editor.el.setAttribute('aria-describedby', 'editor-help');
    this.editor.el.addEventListener('keydown', (e: KeyboardEvent) => { if (e.shiftKey && e.altKey && e.code === 'KeyF') { e.preventDefault(); this.tidy(); } });
    this.stage = S.create(stageHost, { speed: () => getSettings().speed, onFollow: (v: boolean) => setSetting('follow', v), onPick: (n: Any) => this.onPick(n) });
    this.stage.setFollow(getSettings().follow, false);
    this.player = createPlayer({ stage: this.stage, onShow: (s, i) => this.onShow(s, i), wait: () => (getSettings().voice ? this.speaking : null) });
    this.player.onState((p) => { this.playing = p; this.stepped(); });
    this.ready = true; this.mountId = token;
    this.changed();
  }
  unmount(edHost: HTMLElement | null) {
    this.dead = true;
    this.player?.pause(); hush();
    if (this.presenting) this.present(false);
    Object.values(this.timers).forEach(clearTimeout);
    this.stage?.destroy();
    if (edHost) edHost.innerHTML = '';
    this.ready = false; this.mode = null; this.lesson = null; this.shared = null; this.editor = this.stage = this.player = null;
  }
  private later(name: string, ms: number, f: () => void) { clearTimeout(this.timers[name]); this.timers[name] = setTimeout(f, ms); }

  /* ---------- narration ---------- */
  narr(i: number, depth = getSettings().depth) {
    const t = this.player?.trace;
    if (!t || !this.S) return this.S ? this.S.narrate(null) : { color: 'var(--accent)', label: 'start', kind: 'start', html: '' };
    const key = i + '|' + depth;
    if (!this.narrCache.has(key)) this.narrCache.set(key, this.S.narrate(t[i], i ? t[i - 1] : null, depth));
    return this.narrCache.get(key);
  }
  caption(): Cap | null {
    if (this.capOverride) return this.capOverride;
    if (!this.cur) return null;
    const n = this.narr(this.cur.i);
    return { label: n.label || n.kind, color: n.color, html: n.html };
  }

  /* ---------- on every shown step ---------- */
  private onShow(s: State, i: number) {
    const ln = lineOf(s), player = this.player!;
    this.editor.update({ now: ln, ghosts: this.sum ? this.S.ghostsAt(this.sum, i) : new Map() });
    if (ln) this.editor.setNow(ln, true);
    this.cur = { s, i };
    this.capOverride = null;
    const n = this.narr(i);
    if (!player.playing) announce(n.html.replace(/<[^>]+>/g, ''));
    if (getSettings().voice) this.speaking = speak(plain(n.html));
    const gors = this.S.goroutinesOf(s).filter((g: Any) => g.state !== 'finished').length;
    status({
      step: 'step <b>' + (i + 1) + '</b>/' + player.len,
      gor: '<b>' + gors + '</b> goroutine' + (gors === 1 ? '' : 's'),
      heap: 'heap <b>' + (s.modelStats?.HeapAlloc ?? 0) + ' B</b>',
      gc: 'GC <b>' + (s.gc || 'idle') + '</b>',
    });
    this.stepped();
    if (i === player.len - 1 && this.mode === 'lesson' && this.phase === 'watch') {
      this.markPhase('watch');
      if (this.prediction != null && this.result) { const actual = norm(this.result.stdout); this.predictResult = { ok: norm(this.prediction) === actual, actual }; this.changed(); }
    }
  }
  /** Re-show the current step (after the voice is switched on, for example). */
  reshow() { const p = this.player; if (p?.trace && p.idx >= 0) this.onShow(p.trace[p.idx], p.idx); }

  /* ---------- problems + heap ---------- */
  showProblems(list: Diag[]) { this.problems = list; this.editor?.setDiagnostics(list); this.changed(); }
  private showAllocs(t: State[]) {
    const { per, moved } = heapSummary(t);
    const lines = new Set([...per.keys(), ...moved.map((m) => m.site)]);
    const max = Math.max(1, ...[...per.values()].map((x) => x.size));
    this.allocs = [...lines].map((line) => ({ line, objects: per.get(line)?.size || 0, moved: moved.filter((m) => m.site === line) }))
      .map((x) => ({ ...x, level: Math.max(x.objects / max, x.moved.length ? 0.6 : 0) })).sort((a, b) => b.objects - a.objects || a.line - b.line);
    this.editor.setHeat(new Map(this.allocs.map((x) => [x.line, x])));
  }

  /* ---------- run ---------- */
  runOptions(): RunOptions {
    const o = this.opts, out: Any = { seed: o.seed, gcPercent: o.gcPercent, owner: 'workbench' }; // preempt is a statement count
    if (o.memoryLimit) out.memoryLimit = o.memoryLimit;
    if (o.schedule !== 'default') { out.schedule = o.schedule; out.preempt = o.preempt; }
    if (o.picks.length) { out.picks = o.picks; out.preempt = o.preempt || SCHED_PREEMPT; }
    return out as RunOptions;
  }
  private playheadKey() {
    const p = this.player!;
    if (!p.trace || p.idx < 0) return null;
    if (p.idx >= p.len - 1) return { end: true, line: 0, nth: 0 };
    const ln = lineOf(p.trace[p.idx]);
    let nth = 0;
    for (let k = 0; k <= p.idx; k++) if (lineOf(p.trace[k]) === ln) nth++;
    return { end: false, line: ln, nth };
  }
  private findPlayhead(t: State[], key: ReturnType<Bench['playheadKey']>) {
    if (!key) return 0;
    if (key.end) return t.length - 1;
    let nth = 0, best = 0;
    for (let k = 0; k < t.length; k++) if (lineOf(t[k]) === key.line) { nth++; best = k; if (nth === key.nth) return k; }
    return best;
  }
  async run({ autoplay = false, keep = false, force = false } = {}) {
    const { editor, player } = this;
    if (!editor || !player) return;
    const src: string = editor.value;
    if (!force && src === this.lastRun && player.trace) { if (autoplay) player.play(); return; }
    if (src !== this.lastRun && this.lastRun != null) this.opts.picks = []; // forced picks belong to one program
    const id = ++this.runId;
    const problems = await check(src);
    if (this.dead || id !== this.runId) return;
    this.showProblems(problems);
    if (problems.length) {
      this.running = false;
      status({ state: problems.length + ' problem' + (problems.length > 1 ? 's' : ''), tone: 'bad' });
      if (!player.trace) this.empty = { kind: 'problems', list: problems };
      else { this.stale = true; this.capOverride = { label: 'paused', color: this.S.COLOR.bad, html: 'Showing the last version that ran. Fix line <span class="num">' + problems[0].line + '</span> — ' + problems[0].message.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!) + ' — and it updates.' }; this.stepped(); }
      this.changed();
      return;
    }
    const key = keep ? this.playheadKey() : null;
    this.lastRun = src;
    status({ state: 'Running', tone: 'busy' });
    this.running = true; this.changed();
    let r: RunResult;
    try { r = await execute(src, this.runOptions()); } catch (e) { r = { states: [], error: String((e as Error)?.message || e), code: 'INTERNAL' }; }
    if (this.dead || id !== this.runId) return;
    this.running = false;
    this.result = r;
    const t = traceOf(r);
    if (!t) {
      const list = r.diagnostics?.length ? r.diagnostics : [{ line: r.line || 1, column: r.column || 1, message: String(r.error || 'Could not run this program.').replace(/^main\.go:\d+:\d+:\s*/, '') }];
      if (r.code === 'STOPPED') { this.empty = { kind: 'stopped', msg: r.error }; status({ state: 'Stopped', tone: 'bad' }); }
      else { this.showProblems(list); this.empty = { kind: 'problems', list }; status({ state: 'Error', tone: 'bad' }); }
      this.exit = { cls: 'chip bad', text: r.code === 'STOPPED' ? 'stopped' : 'did not run' };
      this.changed();
      return;
    }
    this.empty = null;
    this.sum = this.S.summarize(t); this.narrCache = new Map();
    editor.setHits(this.sum!.hits);
    this.showAllocs(t);
    const limit = r.code === 'LIMIT';
    const runtimeErr = !limit && (r.code === 'RUNTIME' || (!!r.exitStatus && r.exitStatus !== 0) || !!r.error);
    this.stale = false;
    editor.setDiagnostics([], runtimeErr || limit ? r.line || -1 : -1);
    this.exit = { cls: 'chip ' + (runtimeErr || limit ? 'bad' : 'accent'), text: limit ? 'stopped · step limit' : runtimeErr ? 'panic · exit ' + (r.exitStatus || 2) : 'exit 0 · ' + t.length + ' steps' };
    status({ state: limit ? 'Stopped at ' + t.length + ' steps' : runtimeErr ? 'Panicked' : 'Ready', tone: runtimeErr || limit ? 'bad' : 'ok' });
    if (limit) toast('Stopped after ' + (t.length - 1) + ' steps — is there a loop that never ends?', 4000);
    // a crash opens on the crash; otherwise keep the playhead where it was
    player.setTrace(t, (runtimeErr || limit) && !autoplay ? t.length - 1 : key ? this.findPlayhead(t, key) : 0);
    if (this.mode === 'lesson' && this.phase === 'try') this.checkTry();
    this.changed();
    if (autoplay) player.play();
  }

  /* ---------- editor callbacks ---------- */
  private onChange(src: string) {
    this.dirty = true;
    this.later('draft', 400, () => { P.saveDraft(this.key, src); status({ saved: 'Saved on this device' }); });
    this.later('check', 220, () => check(src).then((l) => { if (!this.dead && src === this.editor?.value) this.showProblems(l); }));
    if (getSettings().live) this.later('live', 480, () => this.run({ keep: true }));
    else if (this.player?.trace && src !== this.lastRun) this.exit = { cls: 'chip', text: 'edited · press Run' };
    this.changed();
  }
  private onHover(word: string | null) {
    if (!this.player?.trace) return false;
    return this.stage.highlight(word ? { names: [word] } : null);
  }
  private onGutter(line: number) {
    const p = this.player!, t = p.trace;
    if (!t) return;
    for (let d = 1; d <= t.length; d++) { const k = (p.idx + d) % t.length; if (lineOf(t[k]) === line) { p.pause(); p.show(k, true); return; } }
    toast('Line ' + line + ' never runs in this program.');
  }
  onPick(node: Any) {
    const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
    if (!node || node.type === 'label') { this.stage.highlight(null); this.capOverride = null; this.stepped(); return; }
    this.stage.highlight({ keys: [node.key] });
    const o = node.meta?.o, c = node.meta?.c, C = this.S.COLOR;
    let html;
    if (node.type === 'frame') html = '<b>' + esc(node.title) + '</b> is a stack frame on ' + esc(node.meta.g) + '. It holds ' + node.rows.length + ' local' + (node.rows.length === 1 ? '' : 's') + ' and disappears when the function returns.';
    else if (node.type === 'lane') html = 'Goroutine <b>' + esc(node.gid) + '</b> is ' + esc(node.state) + (node.wait ? ' (' + esc(node.wait) + ')' : '') + '. Each goroutine has its own stack of frames.';
    else if (node.type === 'chan') html = 'A channel with ' + (node.cap ? 'a buffer of ' + node.cap : 'no buffer — a sender waits for a receiver') + '. ' + node.buf.length + ' value' + (node.buf.length === 1 ? '' : 's') + ' inside right now.';
    else if (node.type === 'cell') html = '<b>' + esc(node.title) + '</b> lives on the heap because something still points to it after its function returned.';
    else if (o) html = 'A <b>' + esc(o.kind) + '</b> on the heap' + (o.site ? ', allocated at line <span class="num">' + (o.site.line ?? o.site) + '</span>' : '') + '. ' + (o.escape?.reason ? 'Why the heap? ' + esc(o.escape.reason) : '') + (node.cls.includes('garbage') ? ' Nothing points to it any more, so the GC can reclaim it.' : '');
    else if (c) html = esc(c.name);
    else html = esc(node.title || '');
    this.capOverride = { label: node.type === 'obj' ? 'heap' : node.type, color: node.type === 'frame' ? C.stack : node.type === 'chan' ? C.chan : node.type === 'lane' ? C.gor : C.heap, html, pinned: true };
    this.stepped();
  }

  /* ---------- load lesson / program ---------- */
  loadSource(src: string, key: string) {
    this.key = key; this.lastRun = null; this.result = null; this.sum = null;
    this.editor.value = src;
    this.dirty = false;
    this.player!.setTrace(null);
    this.cur = null; this.capOverride = null; this.exit = null; this.stale = false;
    this.problems = []; this.editor.setDiagnostics([]);
    this.allocs = [];
    this.empty = { kind: 'idle' };
    status({ state: 'Ready', tone: 'ok', step: '', gor: '', heap: '', gc: '' });
    this.changed(); this.stepped();
  }
  /** Load a program into the playground; unsaved edits stay one ⌘Z away. */
  swapIn(src: string) {
    const before: string = this.editor.value, dirty = this.dirty;
    this.programId = null; this.loadSource(src, 'playground');
    if (dirty && before !== src) { this.editor.value = before; this.editor.replaceAll(src); toast('Loaded. Press ⌘Z in the editor to get your previous code back.', 4500); }
    P.saveDraft('playground', src);
  }
  openProgram(progId: string | null) {
    this.mode = 'play'; this.lesson = null; this.programId = progId;
    const p = progId ? program(progId) : null;
    this.loadSource(p ? p.source : P.draft('playground') ?? STARTER, 'playground');
    this.run({ autoplay: !!p });
  }
  openShared(code: string, at: number) {
    this.shared = code; this.mode = 'play'; this.lesson = null; this.programId = null;
    this.changed();
    unpack(code)
      .then((src) => { this.loadSource(src, 'playground'); return this.run(); })
      .then(() => this.player!.show(at, false))
      .catch(() => { this.loadSource(P.draft('playground') ?? STARTER, 'playground'); toast('This share link is damaged or too large.', 4000); });
  }
  openLesson(l: Lesson) {
    this.mode = 'lesson'; this.lesson = l; this.phase = 'read'; this.prediction = null; this.predictResult = null; this.tryMsg = null;
    this.phasesDone = new Set(P.done(l.id) ? PHASES.map(([x]) => x) : []);
    P.setLast(l.id);
    this.loadSource(P.draft(l.id) ?? program(l.examples?.[0])?.source ?? STARTER, l.id);
    this.run();
  }

  /* ---------- lesson phases ---------- */
  markPhase(p: Phase) {
    if (this.phasesDone.has(p)) return;
    this.phasesDone.add(p);
    if (this.lesson && P.status(this.lesson.id) === 'not-started') P.mark(this.lesson.id, 'in-progress');
    this.changed();
  }
  /** A phase tab was clicked. */
  setPhase(p: Phase) { if (this.phase === 'read') this.markPhase('read'); this.enterPhase(p); }
  /** A "Now try it →" style button: the current phase counts as done. */
  goPhase(p: Phase) {
    this.markPhase(this.phase); this.enterPhase(p);
    if (p === 'watch') { this.setPane('stage'); this.run({ autoplay: true }); }
  }
  private enterPhase(p: Phase) {
    this.phase = p;
    const l = this.lesson;
    if (p === 'try' && l) {
      this.tryMsg = null;
      const cap = l.capstone;
      // build it from the starter, not the finished program
      if (cap?.starter && this.editor.value === program(l.examples?.[0])?.source) { this.loadSource(cap.starter, l.id); this.run(); }
      this.checkTry();
    }
    this.changed();
  }
  predict(text: string) {
    this.prediction = text; this.predictResult = null;
    this.markPhase('read'); this.enterPhase('watch'); this.setPane('stage');
    this.run().then(() => { this.player?.show(0, false); this.player?.play(); });
  }
  playFromStart() { this.setPane('stage'); if (this.player?.trace) { this.player.show(0, false); this.player.play(); } else this.run({ autoplay: true }); }
  resetExample() {
    const l = this.lesson, src = l?.capstone?.starter || program(l?.examples?.[0])?.source;
    if (!l || !src) return;
    P.clearDraft(l.id); this.loadSource(src, l.id); this.tryMsg = null; this.run();
  }
  checkTry() {
    const l = this.lesson, tc = l && tryOf(l), r = this.result;
    if (!l || this.phase !== 'try' || !r || r.exitStatus || !traceOf(r)) return;
    let ok = false;
    if (tc?.expect) { try { ok = new RegExp(tc.expect).test(r.stdout || ''); } catch { return; } }
    else ok = this.editor.value !== program(l.examples?.[0])?.source; // no pattern: any change that runs counts
    const t = r.states!, mallocs = t.at(-1)?.modelStats?.Mallocs ?? 0;
    if (ok && tc?.maxAllocs != null && mallocs > tc.maxAllocs) { this.tryMsg = { ok: false, text: 'The output is right, but the run made ' + mallocs + ' heap allocations. Aim for ' + tc.maxAllocs + '.' }; this.changed(); return; }
    if (ok && tc?.noRaces && t.some((s: State) => s.races?.length)) { this.tryMsg = { ok: false, text: 'The output is right, but there is still a data race. Add synchronization.' }; this.changed(); return; }
    if (!ok) return;
    this.tryMsg = { ok: true };
    this.markPhase('try');
    this.changed();
  }

  /* ---------- layout ---------- */
  setPane(p: Pane) {
    const was = this.pane;
    this.pane = p;
    if (p === 'stage' && was !== 'stage') requestAnimationFrame(() => this.stage?.fit()); // laid out while hidden on phones
    this.changed();
  }
  setLens(l: Lens) { this.lens = l; this.changed(); this.stepped(); }
  present(on: boolean) {
    if (on === this.presenting) return;
    this.presenting = on;
    document.documentElement.classList.toggle('presenting', on);
    if (on) { this.setPane('stage'); toast('Presentation mode. Arrows or a clicker step; Esc exits.'); }
    this.changed();
    requestAnimationFrame(() => { this.editor?.refresh(); this.stage?.fit(); });
  }

  /* ---------- run options: GC knobs and the schedule explorer ---------- */
  setGC(gcPercent: number) { this.opts.gcPercent = gcPercent; this.changed(); this.run({ force: true, keep: true }); }
  setMemoryLimit(v: number | null) { this.opts.memoryLimit = v; this.changed(); this.run({ force: true, keep: true }); }
  async exploreSchedules() {
    const src: string = this.editor.value, groups = new Map<string, { out: string; crashed: boolean; seeds: number[] }>();
    status({ state: 'Trying schedules', tone: 'busy' });
    for (let seed = 1; seed <= SCHED_RUNS; seed++) {
      const r = await execute(src, { owner: 'explore', seed, schedule: 'random', preempt: SCHED_PREEMPT as Any, gcPercent: this.opts.gcPercent });
      if (this.dead) return;
      const t = traceOf(r); if (!t) continue;
      const last = t.at(-1), key = (last.output ?? '') + '\u0000' + !!last.exitStatus;
      if (!groups.has(key)) groups.set(key, { out: last.output ?? '', crashed: !!last.exitStatus, seeds: [] });
      groups.get(key)!.seeds.push(seed);
    }
    this.explored = { src, groups: [...groups.values()].sort((a, b) => b.seeds.length - a.seeds.length) };
    status({ state: 'Ready', tone: 'ok' });
    announce(this.explored.groups.length === 1 ? 'Every schedule printed the same output.' : this.explored.groups.length + ' different outputs from ' + SCHED_RUNS + ' schedules.');
    this.changed(); this.stepped();
  }
  forcePick(n: number, gid: string) {
    const p = this.player!;
    const prior = (p.trace || []).filter((x: State) => x.choice && x.choice.n < n).sort((a: State, b: State) => a.choice.n - b.choice.n).map((x: State) => x.choice.picked);
    this.opts.picks = [...prior, gid];
    const at = p.idx;
    this.run({ force: true }).then(() => { if (p.trace) p.show(Math.min(at, p.len - 1), false); });
  }
  watchSeed(seed: number) { this.opts = { ...this.opts, schedule: 'random', preempt: SCHED_PREEMPT, seed, picks: [] }; this.run({ force: true }); }
  resetSchedule() { this.opts = { ...this.opts, schedule: 'default', preempt: 0, seed: 42, picks: [] }; this.explored = null; this.run({ force: true }); }

  /* ---------- share + image/video export ---------- */
  async shareLinks() {
    const code = await pack(this.editor.value), at = Math.max(0, this.player?.idx ?? 0);
    return { link: origin() + href.shared(code, at), embed: origin() + href.embed(code, at) };
  }
  bump(k: string) { const st = store.get<Record<string, number> | null>('gothik-stats-v1', null) || {}; st[k] = (st[k] || 0) + 1; store.set('gothik-stats-v1', st); }
  snapshotSVG() {
    const src = this.stageHost!.querySelector('.stage-svg') as SVGSVGElement, box = src.getBoundingClientRect(), player = this.player!;
    const w = Math.round(box.width), h = Math.round(box.height), H = h + 64;
    const clone = src.cloneNode(true) as SVGSVGElement;
    const from = [src, ...src.querySelectorAll('*')], to = [clone, ...clone.querySelectorAll('*')];
    from.forEach((el, i) => { const cs = getComputedStyle(el); to[i].setAttribute('style', STYLE_PROPS.map((p) => p + ':' + cs.getPropertyValue(p)).join(';')); });
    const page = getComputedStyle(document.querySelector('.gk') || document.body), NS = 'http://www.w3.org/2000/svg';
    const mk = (tag: string, attrs: Record<string, string | number>, text?: string) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, String(attrs[k])); if (text) e.textContent = text; return e; };
    Object.entries({ xmlns: NS, width: w, height: H, viewBox: '0 0 ' + w + ' ' + H }).forEach(([k, v]) => clone.setAttribute(k, String(v)));
    clone.removeAttribute('class');
    clone.prepend(mk('rect', { width: w, height: H, fill: page.backgroundColor }));
    const text = plain(this.narr(player.idx).html), font = 'font-family:' + page.fontFamily + ';';
    clone.append(
      mk('rect', { y: h, width: w, height: 64, fill: getComputedStyle(document.querySelector('.gk') || document.documentElement).getPropertyValue('--bg-2').trim() || page.backgroundColor }),
      mk('text', { x: 16, y: h + 26, style: font + 'font-size:14px;fill:' + page.color }, clip(text, Math.floor((w - 32) / 7.4))),
      mk('text', { x: 16, y: h + 48, style: font + 'font-size:11px;opacity:.6;fill:' + page.color }, 'made with gothik · step ' + (player.idx + 1) + ' of ' + player.len + ' · simplified model'),
    );
    return { svg: new XMLSerializer().serializeToString(clone), w, h: H };
  }
  async exportImage(kind: 'png' | 'svg') {
    const { svg, w, h } = this.snapshotSVG(), name = 'gothik-step-' + (this.player!.idx + 1);
    this.bump('exports');
    if (kind === 'svg') return download(new Blob([svg], { type: 'image/svg+xml' }), name + '.svg');
    const b = await svgToPNG(svg, w, h);
    if (b) download(b, name + '.png'); else toast('Could not draw the image.');
  }
  /** A slideshow video of the run: each step is drawn with its caption and held for a beat. */
  async recordVideo() {
    const type = videoType(), player = this.player;
    if (!type || !player?.trace || this.recording) return;
    this.recording = true; player.pause();
    const back = player.idx, last = Math.min(player.len, VIDEO_MAX) - 1;
    const first = this.snapshotSVG(), c = document.createElement('canvas');
    c.width = first.w; c.height = first.h;
    const ctx = c.getContext('2d')!, chunks: Blob[] = [];
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: type, videoBitsPerSecond: 3e6 });
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    const stopped = new Promise((done) => { rec.onstop = done; });
    const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
    let cancelled = false;
    const cancel = (e: KeyboardEvent) => { if (e.key === 'Escape') cancelled = true; };
    addEventListener('keydown', cancel);
    rec.start(250);
    try {
      for (let i = 0; i <= last && !cancelled && !this.dead; i++) {
        player.show(i, false);
        status({ state: 'Recording ' + (i + 1) + '/' + (last + 1) + ' · Esc stops', tone: 'busy' });
        await new Promise(requestAnimationFrame);
        const img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(this.snapshotSVG().svg);
        await img.decode();
        const hold = i === last ? 1600 : Math.max(250, 800 / getSettings().speed);
        for (let t = 0; t < hold; t += 100) { ctx.drawImage(img, 0, 0, c.width, c.height); await sleep(100); } // repaint so every frame has data
      }
    } finally {
      rec.stop(); await stopped;
      removeEventListener('keydown', cancel);
      this.recording = false;
      if (!this.dead) player.show(back, false);
      status({ state: 'Ready', tone: 'ok' });
    }
    this.bump('exports');
    download(new Blob(chunks, { type }), 'gothik-run.' + (type.startsWith('video/mp4') ? 'mp4' : 'webm'));
    toast(cancelled ? 'Stopped early; saved what was recorded.' : 'Video saved.');
  }

  /* ---------- editor tools ---------- */
  tidy() {
    if (!this.editor) return;
    const next = this.Ed.tidy(this.editor.value);
    if (next === this.editor.value) { toast('Already tidy.'); return; }
    this.editor.replaceAll(next);
  }
  /** The whole run as Markdown: one numbered line per step, in the current narration depth. */
  transcriptMarkdown() {
    const t = this.player?.trace; if (!t) return '';
    const title = this.lesson ? this.lesson.id + ' · ' + this.lesson.title : 'Playground program';
    let out = '# ' + title + '\n\nRecorded with gothik (simplified model), ' + t.length + ' steps, ' + (getSettings().depth === 'hood' ? 'runtime' : 'simple') + ' narration.\n\n```go\n' + String(this.editor.value).trimEnd() + '\n```\n\n## Steps\n\n';
    for (let i = 0; i < t.length; i++) out += (i + 1) + '. ' + plain(this.narr(i).html).replace(/\s+/g, ' ').trim() + '\n';
    const printed = t.at(-1).output ?? '';
    return out + (printed ? '\n## Output\n\n```\n' + String(printed).trimEnd() + '\n```\n' : '');
  }
  exportTranscript() {
    if (!this.player?.trace) { toast('Run a program first.'); return; }
    download(new Blob([this.transcriptMarkdown()], { type: 'text/markdown' }), (this.lesson ? this.lesson.id.toLowerCase() : 'gothik') + '-transcript.md');
  }

  /* ---------- AI tutor ---------- */
  private tutorContext() {
    const t = this.player?.trace, i = this.player?.idx ?? 0;
    const step = t ? plain(this.narr(i).html) : '', out = t ? String(t[i].output ?? '') : '';
    return 'Program (main.go):\n```go\n' + String(this.editor.value).slice(0, 12000) + '\n```\n' +
      (this.lesson ? 'Lesson: ' + this.lesson.id + ' ' + this.lesson.title + ' (phase: ' + this.phase + ')\n' : '') +
      (t ? 'The stage is at step ' + (i + 1) + ' of ' + t.length + ', line ' + (t[i].line + 1) + ': ' + step + '\nOutput so far:\n' + out.slice(-1500) + '\n' : 'The program has not run yet.\n') +
      (this.problems.length ? 'Compiler problems: ' + this.problems.slice(0, 5).map((d) => 'line ' + d.line + ': ' + d.message).join('; ') + '\n' : '');
  }
  tutorAdd(who: string, html: string) { this.tutorLog = [...this.tutorLog, { who, html }]; return this.tutorLog; }
  saveTutorKey(k: string, remember: boolean) { this.tutorKey = k.trim(); if (remember) store.set(TUTOR_KEY, this.tutorKey); else store.del(TUTOR_KEY); }
  async askTutor(question: string): Promise<string> {
    const key = this.tutorKey || store.get(TUTOR_KEY, '');
    if (!key) throw Object.assign(new Error('Add your Anthropic API key first.'), { kind: 'key' });
    // Each question carries a fresh snapshot of the program and step; earlier turns stay as they were (append-only).
    this.tutorChat.push({ role: 'user', content: this.tutorContext() + '\nQuestion: ' + question });
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2026-10-21', 'anthropic-beta': 'server-side-fallback-2026-07-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: TUTOR_MODEL, max_tokens: 16000, output_config: { effort: 'low' }, fallbacks: 'default', cache_control: { type: 'ephemeral' }, system: TUTOR_SYSTEM, messages: this.tutorChat }),
    }).catch(() => { this.tutorChat.pop(); throw new Error('Could not reach the API. Check your connection.'); });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.tutorChat.pop();
      const msg = res.status === 401 ? 'That API key was rejected.' : res.status === 429 ? 'Rate limited. Wait a moment and ask again.' : res.status >= 500 ? 'The API is busy. Try again shortly.' : (body.error?.message || 'The request failed (' + res.status + ').');
      throw Object.assign(new Error(msg), { kind: res.status === 401 ? 'key' : 'api' });
    }
    if (body.stop_reason === 'refusal') { this.tutorChat.pop(); return 'The tutor could not help with that one. Try asking about the program in a different way.'; }
    this.tutorChat.push({ role: 'assistant', content: body.content }); // keep every block, unchanged
    return (body.content || []).filter((b: Any) => b.type === 'text').map((b: Any) => b.text).join('\n').trim() || '(no answer)';
  }
}

/** Re-render on coarse workbench changes (a run, an edit, a phase). */
export const useBench = (b: Bench) => useSyncExternalStore(b.sub, () => b.v, () => 0);
/** Re-render when the playhead moves. */
export const useStep = (b: Bench) => useSyncExternalStore(b.subStep, () => b.sv, () => 0);
