// The stage pane's other lenses: a table of the current step, goroutines over time (with the
// schedule explorer), and heap size over time (with the GC knobs).
import { Fragment, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { SCHED_RUNS, useBench, useStep, type Bench } from './bench';
import type { State } from '../../lib/run';

function useWidth(ref: RefObject<HTMLElement | null>) {
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}
const jumpTo = (b: Bench, k: number) => { const p = b.player; if (p?.trace && k >= 0 && k < p.len) { p.pause(); p.show(k, true); } };

export function TableView({ b }: { b: Bench }) {
  useStep(b);
  return <div className="table-view" dangerouslySetInnerHTML={{ __html: b.cur && b.S ? b.S.table(b.cur.s) : '' }} />;
}

function SchedBar({ b, i }: { b: Bench; i: number }) {
  const p = b.player!, st = p.trace?.[i], o = b.opts, custom = o.schedule !== 'default' || o.picks.length > 0, choice = st?.choice;
  const ex = b.explored?.src === b.editor?.value ? b.explored : null;
  return (
    <div className="sched-bar">
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 13 }}>Schedules</strong>
        <span className="dim" style={{ fontSize: 12 }}>{o.picks.length ? 'You chose ' + o.picks.length + ' scheduling decision' + (o.picks.length > 1 ? 's' : '') + '.' : o.schedule === 'random' ? 'Random schedule, seed ' + o.seed + ', switching every ' + o.preempt + ' statements.' : 'The default, fixed schedule.'}</span>
        <span className="spacer" />
        <button className="btn sm" type="button" onClick={() => b.exploreSchedules()}>Try {SCHED_RUNS} schedules</button>
        {custom && <button className="btn sm ghost" type="button" onClick={() => b.resetSchedule()}>Back to default</button>}
      </div>
      {choice && choice.runnable?.length > 1
        ? <p className="sched-choice">At this step the scheduler had {choice.runnable.length} goroutines ready and ran <b>{choice.picked}</b>. Run another one here instead: {choice.runnable.filter((g: string) => g !== choice.picked).map((g: string) => <Fragment key={g}><button className="btn sm" type="button" onClick={() => b.forcePick(choice.n, g)}>{g}</button>{' '}</Fragment>)}</p>
        : p.trace?.some((x: State) => x.choice) ? <p className="faint" style={{ fontSize: 12, margin: '6px 0 0' }}>Steps where more than one goroutine was ready are marked; step to one to choose differently.</p> : null}
      {ex && <>
        <div className="sched-results">{ex.groups.map((gr, k) => (
          <div className="sched-out" key={k}><pre>{(gr.out.trim() || '(no output)') + (gr.crashed ? '\n(crashed)' : '')}</pre><span className="dim">{gr.seeds.length} of {SCHED_RUNS} schedules</span><button className="btn sm" type="button" onClick={() => b.watchSeed(gr.seeds[0])}>Watch one</button></div>
        ))}</div>
        <p className="dim" style={{ fontSize: 12, margin: '6px 0 0' }}>{ex.groups.length > 1 ? 'Different outputs from the same code mean the result depends on timing: usually a data race. Watch two of them and find where the goroutines interleave differently.' : 'Every schedule printed the same thing. That is a good sign, but not a proof that there is no race.'}</p>
      </>}
    </div>
  );
}

export function GanttView({ b }: { b: Bench }) {
  useBench(b); useStep(b);
  const ref = useRef<HTMLDivElement>(null), w = useWidth(ref);
  const i = Math.max(0, b.player?.idx ?? 0);
  if (!b.sum || !b.player?.trace) return <div className="gantt-view" ref={ref}><p className="dim">Run the program to see its goroutines over time.</p></div>;
  const g = b.S.ganttSVG(b.sum, Math.max(600, w - 32), i);
  return (
    <div className="gantt-view" ref={ref}>
      <SchedBar b={b} i={i} />
      <div dangerouslySetInnerHTML={{ __html: g.html }} onClick={(e) => {
        const svg = e.currentTarget.querySelector('svg'); if (!svg) return;
        const r = svg.getBoundingClientRect();
        jumpTo(b, Math.floor(((e.clientX - r.left) * (g.w / r.width) - g.x0) / g.sx));
      }} />
      <div className="gantt-legend"><span><i style={{ background: 'var(--c-gor)' }} />running</span><span><i style={{ background: 'color-mix(in srgb, var(--c-gor) 32%, transparent)' }} />runnable</span><span><i style={{ background: 'var(--signal)' }} />waiting</span><span className="faint">click to jump</span></div>
    </div>
  );
}

const GOGC: [number, string][] = [[-1, 'off'], [25, '25'], [50, '50'], [100, '100 (default)'], [200, '200'], [400, '400']];
const LIMITS: [string, string][] = [['', 'none'], ['2048', '2 KiB'], ['4096', '4 KiB'], ['8192', '8 KiB'], ['16384', '16 KiB']];

export function MemoryView({ b }: { b: Bench }) {
  useBench(b); useStep(b);
  const ref = useRef<HTMLDivElement>(null), w = useWidth(ref);
  const t = b.player?.trace ?? null, i = Math.max(0, b.player?.idx ?? 0);
  const W = Math.max(600, w - 32), H = 220, pad = 34;
  // everything but the playhead depends only on the trace and the width
  const chart = useMemo(() => {
    if (!t) return null;
    const heap: number[] = t.map((x: State) => x.modelStats?.HeapAlloc ?? 0), goal: (number | null)[] = t.map((x: State) => (typeof x.gcGoal === 'number' ? x.gcGoal : null));
    const peak = heap.reduce((a, v) => Math.max(a, v), 0), max = Math.max(1, peak, ...goal.filter((g): g is number => g != null)) * 1.1;
    const X = (k: number) => pad + (k / Math.max(1, t.length - 1)) * (W - pad - 8), Y = (v: number) => H - 20 - (v / max) * (H - 36);
    const bands: { x: number; w: number; title: string }[] = [];
    for (let k = 0; k < t.length; k++) if (t[k].gc && t[k].gc !== 'idle') { const k0 = k; while (k < t.length && t[k].gc && t[k].gc !== 'idle') k++; bands.push({ x: X(k0), w: Math.max(2, X(k) - X(k0)), title: 'GC cycle ' + (bands.length + 1) + ' (steps ' + (k0 + 1) + '–' + k + ')' }); }
    const line = (vals: (number | null)[]) => vals.map((v, k) => (v == null ? null : X(k).toFixed(1) + ',' + Y(v).toFixed(1))).filter(Boolean).join(' ');
    return { X, Y, max, peak, bands, heapLine: line(heap), goalLine: goal.some((g) => g != null) ? line(goal) : null };
  }, [t, W]);
  const controls = (
    <div className="row" style={{ flexWrap: 'wrap', gap: 14, marginBottom: 10 }}>
      <label className="row" style={{ gap: 6, fontSize: 13 }}>GOGC <select className="speed" id="mem-gogc" aria-label="GOGC" value={b.opts.gcPercent} onChange={(e) => b.setGC(Number(e.target.value))}>{GOGC.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <label className="row" style={{ gap: 6, fontSize: 13 }}>Memory limit <select className="speed" id="mem-limit" aria-label="Memory limit" value={String(b.opts.memoryLimit ?? '')} onChange={(e) => b.setMemoryLimit(e.target.value ? Number(e.target.value) : null)}>{LIMITS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <span className="chip model">simplified model</span>
    </div>
  );
  if (!t || !chart) return <div className="gantt-view mem-view" ref={ref}>{controls}<p className="dim">Run the program to see its heap over time.</p></div>;
  const c = chart, cycles = c.bands.length;
  return (
    <div className="gantt-view mem-view" ref={ref}>
      {controls}
      <svg className="mem-chart" viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label={'Heap size over time: ' + cycles + ' GC cycles, peak ' + c.peak + ' bytes'}
        onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); jumpTo(b, Math.round(((e.clientX - r.left) / r.width) * (t.length - 1))); }}>
        {c.bands.map((x, k) => <rect key={k} x={x.x.toFixed(1)} y={8} width={x.w.toFixed(1)} height={H - 28} className="mem-gc"><title>{x.title}</title></rect>)}
        {[0, 0.5, 1].map((f) => <text key={f} className="gl" x={pad - 6} y={c.Y((c.max / 1.1) * f)} textAnchor="end">{Math.round((c.max / 1.1) * f)}</text>)}
        {c.goalLine && <polyline className="mem-goal" points={c.goalLine} />}
        <polyline className="mem-heap" points={c.heapLine} />
        <line className="play" x1={c.X(i)} x2={c.X(i)} y1={8} y2={H - 20} />
      </svg>
      <div className="gantt-legend"><span><i style={{ background: 'var(--c-heap)' }} />live heap (bytes)</span>{c.goalLine && <span><i style={{ background: 'var(--signal)' }} />heap goal: the next GC starts here</span>}<span><i style={{ background: 'color-mix(in srgb, var(--c-gc) 30%, transparent)' }} />GC running</span><span className="faint">click to jump</span></div>
      <p className="dim" style={{ fontSize: 13, marginTop: 10 }}>{cycles} GC cycle{cycles === 1 ? '' : 's'}, peak heap {c.peak} B. Higher GOGC lets the heap grow further before collecting: fewer cycles, more memory. A memory limit makes the GC run earlier when the heap gets close to it.</p>
    </div>
  );
}
