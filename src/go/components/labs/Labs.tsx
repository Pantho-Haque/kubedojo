// Interactive teaching models of runtime internals (strings, interfaces, maps, stacks, the
// scheduler) plus a viewer for real `go tool trace` dumps. The models load on first use.
/* eslint-disable @typescript-eslint/no-explicit-any -- the lab models are framework-free JS */
import { Link } from '../../lib/router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../Icon';
import { HighlightedCode } from '../HighlightedCode';
import { href } from '../../lib/routes';
import { loadLabs } from '../../lib/run';
import { toast } from '../../lib/shell';

type LabsModule = Awaited<ReturnType<typeof loadLabs>>;
function useLabs(): LabsModule | null {
  const [m, setM] = useState<LabsModule | null>(null);
  useEffect(() => { let on = true; loadLabs().then((x) => { if (on) setM(x); }); return () => { on = false; }; }, []);
  return m;
}

const ModelNote = ({ children }: { children: ReactNode }) => <p className="callout model" style={{ marginTop: 16 }}><strong>Simplified model</strong>{children}</p>;

/** A step slider shared by the step-based models. Remount it (key) when the steps change. */
function Stepper<T>({ steps, start = 0, draw }: { steps: T[]; start?: number; draw: (st: T, i: number) => { cap: ReactNode; fig: ReactNode } }) {
  const [i, setI] = useState(start);
  const show = (n: number) => setI(Math.max(0, Math.min(steps.length - 1, n)));
  const { cap, fig } = draw(steps[i], i);
  return (
    <>
      <div className="row lab-steps">
        <button className="icon-btn" type="button" aria-label="Previous step" onClick={() => show(i - 1)}><Icon name="prev" /></button>
        <input type="range" min={0} max={Math.max(0, steps.length - 1)} value={i} aria-label="Step" style={{ flex: 1, accentColor: 'var(--accent)' }} onChange={(e) => show(Number(e.target.value))} />
        <button className="icon-btn" type="button" aria-label="Next step" onClick={() => show(i + 1)}><Icon name="next" /></button>
        <span className="mono faint lab-pos">{i + 1}/{steps.length}</span>
      </div>
      <div className="lab-cap" aria-live="polite">{cap}</div>
      <div className="lab-fig">{fig}</div>
    </>
  );
}

/* ---------- strings ---------- */
function LabStrings() {
  const L = useLabs(), [text, setText] = useState('héllo, 世界 🙂');
  const u = L?.GothikLabModels.utf8(text);
  const bytesOf = (k: number) => u.bytes.filter((b: any) => b.rune === k);
  return (
    <>
      <label className="field"><span>A Go string</span><input className="input mono" id="lab-str" value={text} maxLength={120} aria-label="Text to encode" onChange={(e) => setText(e.target.value)} /></label>
      <div id="lab-str-out" aria-live="polite">{u && <>
        <p className="lab-stats mono"><span>len(s) = <b>{u.len}</b></span><span>utf8.RuneCountInString(s) = <b>{u.runeCount}</b></span></p>
        <div className="utf8-row">{u.runes.map((r: any, k: number) => (
          <div key={k} className={'utf8-rune' + (r.size > 1 ? ' multi' : '')} title={'rune ' + k + ' · ' + r.code + ' · ' + r.size + ' byte' + (r.size > 1 ? 's' : '')}>
            <span className="ch">{r.char === ' ' ? '␠' : r.char}</span><span className="cp mono">{r.code}</span>
            <span className="bytes">{bytesOf(k).map((b: any) => <span key={b.i} className="b mono"><i>{b.i}</i>{b.hex}</span>)}</span>
          </div>
        ))}</div>
        <details className="lab-table"><summary>As a table</summary><table className="feat"><thead><tr><th>Rune</th><th>Code point</th><th>Starts at byte</th><th>Bytes</th></tr></thead><tbody>
          {u.runes.map((r: any, k: number) => <tr key={k}><td>{r.char}</td><td className="mono">{r.code}</td><td className="mono">{r.i}</td><td className="mono">{bytesOf(k).map((b: any) => b.hex).join(' ')}</td></tr>)}
        </tbody></table></details>
        <p className="dim" style={{ fontSize: 13, marginTop: 12 }}><code>s[i]</code> reads one byte. <code>for i, r := range s</code> jumps from rune to rune, so <code>i</code> takes the values {u.runes.map((r: any) => r.i).join(', ') || '(none)'}.</p>
      </>}</div>
      <ModelNote>This one is exact: Go strings are UTF-8 bytes. Text that JavaScript cannot represent as valid Unicode (lone surrogates) is shown as U+FFFD, as Go would.</ModelNote>
    </>
  );
}

/* ---------- interfaces: fixed cases, described from runtime/runtime2.go (eface, iface, itab) ---------- */
const IFACE_CASES: { code: string; kind: string; w1: string; w2: string; isNil?: boolean; itab?: string[]; note: string }[] = [
  { code: 'var a any', kind: 'eface', w1: 'nil', w2: 'nil', isNil: true, note: 'No type and no value: this is the only interface value equal to nil.' },
  { code: 'var a any = 42', kind: 'eface', w1: '*_type → int', w2: '→ 42 (a boxed copy)', note: 'A non-pointer value is copied into separate storage and the data word points at it. The runtime keeps ready-made copies of small integers, so 42 needs no allocation.' },
  { code: 'var a any = &p   // p is a Point', kind: 'eface', w1: '*_type → *Point', w2: '→ p itself', note: 'A pointer fits in the data word directly, so nothing is copied: the interface points at the same p.' },
  { code: 'var s fmt.Stringer = Point{1, 2}', kind: 'iface', w1: '*itab → (Stringer, Point)', w2: '→ copy of Point{1, 2}', itab: ['inter: fmt.Stringer', '_type: Point', 'fun[0]: Point.String'], note: 'An interface with methods points at an itab: the pair (interface type, concrete type) plus the method table. s.String() is a call through fun[0].' },
  { code: 'var p *MyErr = nil\nvar e error = p', kind: 'iface', w1: '*itab → (error, *MyErr)', w2: 'nil', itab: ['inter: error', '_type: *MyErr', 'fun[0]: (*MyErr).Error'], isNil: false, note: 'The type word is set even though the pointer is nil, so e != nil. This is the nil-error gotcha.' },
];
function LabIface() {
  const [k, setK] = useState(0), c = IFACE_CASES[k];
  return (
    <>
      <p className="dim">An interface value is two machine words. An empty interface (<code>any</code>) stores a type and a pointer to the data (<i>eface</i>). An interface with methods stores a pointer to an <i>itab</i> and a pointer to the data (<i>iface</i>). Pick a line to see both words.</p>
      <div className="iface-cases" role="radiogroup" aria-label="Examples">
        {IFACE_CASES.map((x, j) => <button key={j} type="button" role="radio" aria-checked={j === k} onClick={() => setK(j)}><code>{x.code.split('\n').pop()}</code></button>)}
      </div>
      <div id="iface-out" aria-live="polite">
        <HighlightedCode source={c.code} className="code-block" />
        <div className="iface-words"><span className="mono faint">{c.kind}</span>
          <div className="iface-word"><i>{c.kind === 'eface' ? 'type' : 'tab'}</i><b className="mono">{c.w1}</b></div>
          <div className="iface-word"><i>data</i><b className="mono">{c.w2}</b></div>
        </div>
        {c.itab && <div className="iface-itab"><span className="mono faint">itab</span>{c.itab.map((x) => <span key={x} className="mono">{x}</span>)}</div>}
        <p style={{ marginTop: 10 }}>{c.note}{c.isNil !== undefined && <> <b>{c.isNil ? '== nil' : '!= nil'}</b></>}</p>
      </div>
      <p className="dim" style={{ fontSize: 13, marginTop: 12 }}>Try it on the stage: the <Link href={href.gotcha('nil-error')}>nil-error gotcha</Link> and the <Link href={href.question('iq-interface-pair')}>interface interview question</Link>.</p>
      <ModelNote>Described from runtime/runtime2.go (eface, iface, itab). Real type descriptors and itabs carry more fields (hash, size, GC data), itabs are cached in a global table, and whether a boxed copy needs an allocation depends on escape analysis.</ModelNote>
    </>
  );
}

/** Text input state plus a copy that settles after `ms`, for models that rebuild on input. */
function useDebounced(initial: string, ms: number) {
  const [v, setV] = useState(initial), [settled, setSettled] = useState(initial);
  useEffect(() => { const t = setTimeout(() => setSettled(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return [v, setV, settled] as const;
}

/* ---------- maps (Swiss tables) ---------- */
function LabMaps() {
  const L = useLabs();
  const [text, setText, settled] = useDebounced('apple\nbanana\ncherry\ndate\nelder\nfig\ngrape\n-banana\nhoneydew\nkiwi', 250);
  const all = settled.split('\n').map((x) => x.trim()).filter(Boolean);
  const ops = all.slice(0, 200).map((x) => (x.startsWith('-') && x.length > 1 ? { op: 'delete', key: x.slice(1) } : x));
  const steps: any[] = L ? L.GothikLabModels.swissMap(ops, { groupSize: 8 }).steps : [];
  return (
    <>
      <label className="field"><span>Operations, one per line: a key inserts it, <code>-key</code> deletes it</span>
        <textarea className="input mono" id="lab-ops" rows={5} style={{ height: 'auto', padding: '8px 10px' }} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      {all.length > 200 && <p className="faint" id="lab-ops-note" style={{ fontSize: 12 }}>Only the first 200 operations are used.</p>}
      <div id="lab-map">{L && (!steps.length ? <p className="dim">Add a key to see where it lands.</p> : (
        <Stepper key={settled} steps={steps} start={steps.length - 1} draw={(st) => ({
          cap: st.event === 'grow' ? <><b>grow:</b> the table was 7/8 full, so it doubled from {st.from} to {st.to} group{st.to > 1 ? 's' : ''} and re-inserted every key.</>
            : st.event === 'delete' ? <><b>delete {st.key}:</b> {st.found ? (st.slot && st.groups[st.slot.group].slots[st.slot.slot].ctrl === 'deleted' ? <>its group is full, so the slot becomes a <i>tombstone</i>: probes for other keys keep going past it.</> : 'its group has an empty slot, so the slot simply becomes empty.') : 'not in the map; nothing changes.'}</>
            : <><b>insert {st.key}:</b> hash {st.hash}, control byte h2 = {st.h2}. Probing starts at group {st.start}{st.probe.length > 1 ? ' and moves on to group ' + st.probe.slice(1).join(', ') : ''}{st.found ? '; the key is already there.' : '; it lands in group ' + st.slot.group + ', slot ' + st.slot.slot + '.'}</>,
          fig: <>
            <p className="lab-stats mono"><span>{st.used} keys</span><span>{st.tombstones} tombstones</span><span>{st.capacity} slots</span></p>
            {st.groups.map((g: any, gi: number) => (
              <div key={gi} className={'sw-group' + (st.probe.includes(gi) ? ' probed' : '')}><span className="mono faint">group {gi}</span>
                <div className="sw-slots">{g.slots.map((sl: any, si: number) => (
                  <span key={si} className={'sw-slot ' + (sl.ctrl === 'empty' ? 'empty' : sl.ctrl === 'deleted' ? 'tomb' : 'full') + (st.slot && st.slot.group === gi && st.slot.slot === si ? ' hit' : '')}>
                    <b className="mono">{sl.ctrl === 'empty' ? '·' : sl.ctrl === 'deleted' ? '✕' : sl.ctrl}</b><span>{sl.key ?? ''}</span>
                  </span>
                ))}</div>
              </div>
            ))}
          </>,
        })} />
      ))}</div>
      <ModelNote>Go 1.24 maps are Swiss tables: groups of 8 slots, each with a 7-bit control byte from the hash (h2), and the rest of the hash (h1) picks where probing starts. Here the hash is FNV-1a, not Go&apos;s seeded hash; probing is linear (Go probes quadratically); and there is one table, where Go splits big maps into several.</ModelNote>
    </>
  );
}

/* ---------- stack growth ---------- */
const kb = (n: number) => (n / 1024).toFixed(n % 1024 ? 1 : 0) + ' KiB';
function LabStack() {
  const L = useLabs(), [text, setText] = useState('2, 5, 9, 3, gc, 1, gc, 6');
  const depths = text.split(/[\s,]+/).filter(Boolean).slice(0, 60).map((x) => (x.toLowerCase() === 'gc' ? 'gc' : Math.min(64, Math.max(0, parseInt(x, 10) || 0))));
  const res = L?.GothikLabModels.stackGrowth(depths);
  return (
    <>
      <label className="field"><span>Call depths to reach in turn (a recursion going deeper and back), and <code>gc</code> for a garbage collection</span>
        <input className="input mono" id="lab-depths" value={text} aria-label="Call depths" onChange={(e) => setText(e.target.value)} />
      </label>
      <div id="lab-stack">{res && (!res.steps.length ? <p className="dim">Enter call depths from 1 to 64, such as 5 or 20 3 gc. Depth 0 means no frames, so there is nothing to draw.</p> : (
        <Stepper key={depths.join()} steps={res.steps as any[]} draw={(st, i) => ({
          cap: st.event === 'grow' ? <><b>grow:</b> the next frame would not fit, so the stack moves to a new {kb(st.size)} block and {kb(st.copied)} is copied. Pointers into the old stack are adjusted.</>
            : st.event === 'shrink' ? <><b>shrink:</b> at this GC the stack used less than a quarter of its space, so it was halved to {kb(st.size)}.</>
            : st.event === 'gc' ? <><b>gc:</b> the stack is busy enough to keep its size.</> : st.event === 'call' ? <><b>call:</b> a new frame; depth {st.depth}.</> : <><b>return:</b> a frame is popped; depth {st.depth}.</>,
          fig: <>
            <p className="lab-stats mono"><span>size {kb(st.size)}</span><span>used {kb(st.used)}</span><span>copied so far {kb(res.steps.slice(0, i + 1).reduce((n: number, x: any) => n + (x.event === 'grow' ? x.copied : 0), 0))}</span></p>
            <div className="stack-bar" style={{ ['--w' as string]: ((st.size / res.maxSize) * 100).toFixed(1) + '%' }}>
              <div className="stack-used" style={{ width: ((st.used / st.size) * 100).toFixed(1) + '%' }}>{Array.from({ length: st.depth }, (_, k) => <i key={k} title={'frame ' + (k + 1)} />)}</div>
            </div>
          </>,
        })} />
      ))}</div>
      <ModelNote>Modelled on runtime/stack.go: a goroutine stack starts at 2 KiB; a call that would overflow it gets a stack twice as big and the used part is copied over; at a GC a stack using under a quarter of its size is halved. Here every frame is 512 bytes and there is no guard area.</ModelNote>
    </>
  );
}

/* ---------- scheduler (G, M, P) ---------- */
const clamp = (v: string, lo: number, hi: number) => Math.max(lo, Math.min(hi, parseInt(v, 10) || lo));
function LabSched() {
  const L = useLabs();
  const [o, setO] = useState({ procs: 2, G: 8, work: 3, seed: 1 });
  // the inputs show the value actually used, as the prototype does
  const num = (k: keyof typeof o, label: string, lo: number, hi: number, id: string, title?: string) => (
    <label className="field" title={title}><span>{label}</span>
      <input className="input" type="number" id={id} min={lo} max={hi} value={o[k]} style={{ width: 90 }} onChange={(e) => setO({ ...o, [k]: clamp(e.target.value, lo, hi) })} />
    </label>
  );
  const res = L?.GothikLabModels.gmp({ goroutines: Array.from({ length: o.G }, () => ({ work: o.work })), procs: o.procs, seed: o.seed, slice: 2 });
  const steals = res ? res.steps.filter((x: any) => x.event === 'steal').length : 0;
  return (
    <>
      <div className="row" style={{ flexWrap: 'wrap', gap: 16 }}>
        {num('procs', 'Ps (GOMAXPROCS)', 1, 8, 'lab-p')}
        {num('G', 'Goroutines', 1, 40, 'lab-g')}
        {num('work', 'Work each (ticks)', 1, 12, 'lab-w', 'How many time slices each goroutine needs before it finishes')}
        {num('seed', 'Seed (random choices)', 1, 999, 'lab-seed', 'Changes the random choices, such as which P a thief steals from first')}
      </div>
      <div id="lab-sched">{res && <>
        <p className="lab-stats mono"><span>{res.ticks} ticks</span><span>{steals} steal{steals === 1 ? '' : 's'}</span><span>{res.steps.filter((x: any) => x.event === 'preempt').length} preemptions</span></p>
        <Stepper key={JSON.stringify(o)} steps={res.steps as any[]} draw={(st) => {
          const say: Record<string, ReactNode> = {
            start: "Every goroutine starts on P0's local queue.",
            run: <>P{st.to} runs <b>{st.g}</b> from its own queue.</>,
            global: <>P{st.to} takes <b>{st.g}</b> from the global queue.</>,
            steal: <>P{st.to} had nothing to do, so it stole {st.stolen} goroutine{st.stolen > 1 ? 's' : ''} from P{st.from} and runs <b>{st.g}</b>.</>,
            preempt: <><b>{st.g}</b> used up its time slice on P{st.from} and goes to the global queue.</>,
            done: <><b>{st.g}</b> finished on P{st.from}.</>,
          };
          const chip = (g: string, cls = '') => <span key={g} className={'g-chip ' + cls + (g === st.g ? ' hot' : '')}>{g}</span>;
          return {
            cap: <><span className="mono faint">tick {st.t}</span> {say[st.event] || st.event}</>,
            fig: <>
              <div className="gmp">{st.ps.map((p: any) => (
                <div key={p.id} className="gmp-p"><span className="mono faint">P{p.id}</span>
                  <div className="gmp-run">{p.running ? chip(p.running, 'run') : <span className="faint">idle</span>}</div>
                  <div className="gmp-q" aria-label={'P' + p.id + ' local queue'}>{p.local.length ? p.local.map((g: string) => chip(g)) : <span className="faint">empty queue</span>}</div>
                </div>
              ))}</div>
              <div className="gmp-global"><span className="mono faint">global queue</span>{st.global.length ? st.global.map((g: string) => chip(g)) : <span className="faint">empty</span>}</div>
            </>,
          };
        }} />
      </>}</div>
      <ModelNote>Modelled on runtime/proc.go: main starts every goroutine on P0&apos;s local run queue; an idle P takes from its own queue, every 61st time checks the global queue first, then takes a batch from the global queue, then steals half of another P&apos;s queue. A goroutine that uses up its time slice goes to the global queue. There is no runnext slot, no Ms, syscalls or network poller, and victims are picked in a seeded order.</ModelNote>
    </>
  );
}

/* ---------- a real trace ---------- */
const fmtNs = (ns: number) => (ns >= 1e6 ? (ns / 1e6).toFixed(2) + ' ms' : (ns / 1e3).toFixed(1) + ' µs');
function LabTrace({ sample }: { sample: string }) {
  const L = useLabs(), outRef = useRef<HTMLDivElement>(null);
  const [res, setRes] = useState<{ parsed: any; sample: boolean; svg: string } | null>(null);
  const load = async (file?: File | null, text?: string) => {
    if (!file && text == null) return;
    if (file && file.size > 300e6) { toast('That file is too big (300 MB max).'); return; }
    const T = (L || await loadLabs()).GothikTraceImport;
    const parsed = T.parse(text ?? await file!.text());
    setRes({ parsed, sample: text != null, svg: parsed.error ? '' : T.toGantt(parsed, Math.max(640, outRef.current?.clientWidth || 900)) });
  };
  const p = res?.parsed;
  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); load(e.dataTransfer.files[0]); }}>
      <p>See when the goroutines of a <b>real</b> Go program ran, waited and blocked. Record a trace, turn it into text, and open the text here. Nothing is uploaded.</p>
      <pre className="code-block">{'// in your program\nf, _ := os.Create("trace.out")\ntrace.Start(f)   // import "runtime/trace"\ndefer trace.Stop()\n\n$ go run .\n$ go tool trace -d=parsed trace.out > trace.txt'}</pre>
      <div className="row" style={{ flexWrap: 'wrap', marginTop: 12 }}>
        <label className="btn sm primary" style={{ cursor: 'pointer' }}>Open trace.txt…<input type="file" id="trace-file" accept=".txt,text/plain" hidden onChange={(e) => { load(e.target.files?.[0]); e.target.value = ''; }} /></label>
        <button className="btn sm" type="button" id="trace-sample-btn" title="A real trace recorded with Go 1.27 and GOMAXPROCS=4" onClick={() => load(null, sample)}>No Go installed? Load a sample trace</button>
        <span className="faint" style={{ fontSize: 12 }}>or drop the file on this page</span>
      </div>
      <div id="trace-out" aria-live="polite" ref={outRef}>
        {p?.error ? <p style={{ color: 'var(--bad)' }}>{p.error}</p> : p && <>
          {res!.sample && <p className="dim" style={{ fontSize: 13, marginTop: 12 }}>Sample: one goroutine sends 5 values on an unbuffered channel, sleeping 100 µs between sends, while another receives them; GOMAXPROCS=4. Notice how little time each goroutine spends running.</p>}
          <p className="lab-stats mono"><span>{p.goroutines.length} goroutines</span><span>{p.procs || '?'} Ps</span><span>{fmtNs(p.t1)} traced</span></p>
          {p.warnings?.length > 0 && <p className="faint" style={{ fontSize: 12 }}>{p.warnings.slice(0, 3).map((w: string, k: number) => <span key={k}>{k > 0 && <br />}{w}</span>)}</p>}
          <div className="trace-fig" dangerouslySetInnerHTML={{ __html: res!.svg }} />
          <div className="gantt-legend"><span><i style={{ background: 'var(--c-gor)' }} />running</span><span><i style={{ background: 'color-mix(in srgb, var(--c-gor) 32%, transparent)' }} />runnable</span><span><i style={{ background: 'var(--signal)' }} />waiting</span><span><i style={{ background: 'var(--c-chan)' }} />syscall</span><span className="faint">hover a bar for details</span></div>
        </>}
      </div>
      <p className="callout" style={{ marginTop: 16 }}><strong>Real data, different view</strong>This view shows a real program&apos;s goroutine states over time. It has no memory picture, because a trace records scheduling, not values.</p>
    </div>
  );
}

export function Lab({ tab, sample = '' }: { tab: string; sample?: string }) {
  switch (tab) {
    case 'iface': return <LabIface />;
    case 'maps': return <LabMaps />;
    case 'stack': return <LabStack />;
    case 'sched': return <LabSched />;
    case 'trace': return <LabTrace sample={sample} />;
    default: return <LabStrings />;
  }
}
