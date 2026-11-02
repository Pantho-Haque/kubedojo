// Run a Go program in a worker (with a sliced main-thread fallback) and play its trace.
// The engine (~230 KB) loads on first use, so pages that never run code never download it.
import { getSettings } from './settings';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type State = any; // one recorded step of the run (see src/core/engine.js)
export type RunResult = { states?: State[]; stdout?: string; stderr?: string; exitStatus?: number | null; error?: string; code?: string; line?: number; column?: number; diagnostics?: { line: number; column: number; message: string }[]; [k: string]: unknown };
export type RunOptions = { seed?: number; owner?: string; gcPercent?: number; memoryLimit?: number; schedule?: 'default' | 'random'; preempt?: number; /* split read-modify-writes every n statements */ picks?: unknown[] };

export const loadEngine = () => import('../core/engine');
export const loadStage = () => import('../core/stage');
export const loadEditor = () => import('../core/editor');
export const loadLabs = () => import('../core/labs');

const makeWorker = () => new Worker(new URL('../core/worker.js', import.meta.url), { type: 'module' });
const active = new Map<string, { stop: () => void }>(); // a newer run from the same owner stops the older one
export async function execute(source: string, { seed = 42, owner = 'main', ...options }: RunOptions = {}): Promise<RunResult> {
  const { GothikExecution } = await loadEngine();
  active.get(owner)?.stop();
  const run = GothikExecution.start(source, { seed, ...options, makeWorker });
  active.set(owner, run);
  const r = await run.promise;
  if (active.get(owner) === run) active.delete(owner);
  return r;
}
export const traceOf = (r?: RunResult | null): State[] | null => (r?.states && r.states.length ? r.states : null);

/** Static check (no run). */
export async function check(source: string) {
  const { GoInterpreter } = await loadEngine();
  try { return (GoInterpreter.check(source).diagnostics || []).slice(0, 20) as { line: number; column: number; message: string }[]; }
  catch (e) { const m = /:(\d+):(\d+):\s*(.*)$/.exec(String((e as Error).message || '')); return [{ line: Number(m?.[1] || 1), column: Number(m?.[2] || 1), message: m?.[3] || String((e as Error).message || e) }]; }
}

/* ---------- Player: drives one stage over one trace (framework-free) ---------- */
export type Stage = { show: (s: State, o: { animate: boolean; prev: State | null }) => void; clear: () => void; destroy: () => void; fit: () => void; zoomIn: () => void; zoomOut: () => void; highlight: (o: unknown) => boolean; [k: string]: unknown };
export type Player = ReturnType<typeof createPlayer>;
export function createPlayer({ stage, onShow, speed = () => getSettings().speed, delay = 950, wait = null }: {
  stage: Stage | null; onShow?: (s: State, i: number, prev: State | null) => void; speed?: () => number; delay?: number; wait?: (() => Promise<void> | null | undefined) | null;
}) {
  let trace: State[] | null = null, idx = 0, timer: ReturnType<typeof setTimeout> | undefined, playing = false;
  let onState: ((p: boolean) => void) | null = null;
  const len = () => (trace ? trace.length : 0);
  function show(i: number, animate = true) {
    if (!trace || !len()) return;
    i = Math.max(0, Math.min(len() - 1, i));
    const jump = Math.abs(i - idx) > 1, prev = i > 0 ? trace[i - 1] : null;
    idx = i;
    stage?.show(trace[i], { animate: animate && !jump, prev });
    onShow?.(trace[i], i, prev);
  }
  function play() {
    if (!trace || playing) return;
    if (idx >= len() - 1) show(0, false);
    playing = true; onState?.(true);
    const step = () => {
      if (!playing) return;
      if (idx >= len() - 1) { pause(); return; }
      show(idx + 1, true);
      const hold = wait?.(); // e.g. let the narration finish before the next step
      const next = () => { if (playing) timer = setTimeout(step, delay / speed()); };
      if (hold) hold.then(next); else next();
    };
    timer = setTimeout(step, 250 / speed());
  }
  function pause() { playing = false; clearTimeout(timer); onState?.(false); }
  return {
    setTrace(t: State[] | null, at = 0) { pause(); trace = t; idx = -1; stage?.clear(); if (t && t.length) { idx = 0; show(Math.min(at, t.length - 1), false); } },
    show, play, pause, toggle() { if (playing) pause(); else play(); },
    step: (d = 1) => { pause(); show(idx + d, true); },
    get idx() { return idx; }, get len() { return len(); }, get trace() { return trace; }, get playing() { return playing; },
    onState(f: (p: boolean) => void) { onState = f; },
  };
}
