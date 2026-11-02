// "What's in the box": fragments of the workbench, drawn by the real engine when the section nears the viewport.
import { Link } from '../../lib/router';
import { useState } from 'react';
import { loadEditor, loadStage, type State } from '../../lib/run';
import { href } from '../../lib/routes';
import { PANIC_SRC, SCENARIOS, STARTER, capHTML, codeHTML, traceFor, useLazy } from './demo';

const CAPS: [string, string, string][] = [
  ['ghosts', 'values beside the code', 'As the playhead moves, each line shows what it just did. You read the program and its state in one place.'],
  ['scrub', 'scrub to any moment', 'Every step is kept, so going backwards is free. The strip marks calls, allocations, goroutine hand-offs and GC; the shaded curve is the heap. Drag it.'],
  ['gantt', 'goroutines over time', 'A second view lays every goroutine out on one timeline: when it runs, when it is ready, and when it is stuck waiting on a channel.'],
  ['depth', 'two depths of explanation', 'Plain words for learning, runtime vocabulary when you want it. Switch with one click; the stage stays the same.'],
  ['panic', 'errors that point at the line', 'Type errors are underlined as you type. A panic stops on the exact step, with every frame still on screen so you can see why.'],
  ['keys', 'made for the keyboard', 'Play, step, scrub, zoom and search without touching the mouse. Press ⌘K anywhere to jump to any lesson, example or term.'],
];
const KEYS = [['Space', 'play / pause'], ['→ ←', 'step'], ['J K L', 'back · pause · forward'], ['[ ]', 'jump between big events'], ['F', 'fit the stage'], ['⌘K', 'search everything'], ['⌘↵', 'run'], ['⌘B', 'toggle the guide']];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StageModule = any;
type Scrub = { S: StageModule; t: State[]; ticks: string };
type Frags = { html: Record<string, string>; scrub: Scrub | null };

export function Box() {
  const [f, setF] = useState<Frags | null>(null);
  const ref = useLazy<HTMLElement>(async () => {
    const [{ GothikStage: S }, { GothikEditor: E }, st, gor, pan] = await Promise.all([loadStage(), loadEditor(), traceFor(STARTER, 'box-a'), traceFor(SCENARIOS[2].src, 'box-b'), traceFor(PANIC_SRC, 'box-c')]);
    const hl = (l: string) => E.highlightLine(l), html: Record<string, string> = {};
    let scrub: Scrub | null = null;
    if (st.t) {
      const sum = S.summarize(st.t), n = st.t.length;
      html.ghosts = codeHTML(hl, STARTER, 12, 24, S.ghostsAt(sum, n - 2));
      scrub = { S, t: st.t, ticks: S.ticksSVG(sum) };
      // the same moment, two ways
      const k = sum.kinds.findIndex((x: string) => x === 'spawn'), i = k > 0 ? k : Math.floor(n / 2);
      html.depth = '<div class="frag-depth"><div><span class="mono faint">simple</span>' + capHTML(S.narrate(st.t[i], st.t[i - 1], 'simple')) + '</div><div><span class="mono faint">runtime</span>' + capHTML(S.narrate(st.t[i], st.t[i - 1], 'hood')) + '</div></div>';
    }
    if (gor.t) {
      const g = S.ganttSVG(S.summarize(gor.t), 560, -1);
      html.gantt = '<div class="gantt-view frag-gantt">' + g.html + '<div class="gantt-legend"><span><i style="background:var(--c-gor)"></i>running</span><span><i style="background:color-mix(in srgb, var(--c-gor) 32%, transparent)"></i>runnable</span><span><i style="background:var(--signal)"></i>waiting</span><span class="faint">workers.go · ' + gor.t.length + ' steps</span></div></div>';
    }
    if (pan.t) html.panic = codeHTML(hl, PANIC_SRC, 5, 12, new Map(), pan.r.line || 6) + capHTML(S.narrate(pan.t.at(-1), pan.t.at(-2), 'simple'));
    setF({ html, scrub });
  });

  const frag = (id: string) => {
    if (id === 'keys') return <dl className="frag-keys">{KEYS.map(([k, d]) => <div key={k}><dt>{k.split(' ').map((x) => <kbd key={x}>{x}</kbd>)}</dt><dd>{d}</dd></div>)}</dl>;
    if (!f) return null;
    if (id === 'scrub' && f.scrub) return <ScrubFrag {...f.scrub} />;
    if (f.html[id]) return { __html: f.html[id] };
    return <p className="dim" style={{ fontSize: 13 }}>This demo could not run just now. <Link href={href.playground}>Open the playground</Link> to try it live.</p>;
  };

  return (
    <section className="box" id="box" aria-labelledby="box-h" ref={ref}>
      <header className="sec-head"><p className="mono faint">{"// what's in the box"}</p><h2 className="mono" id="box-h">a workbench, not a video.</h2><p className="dim">Everything below is drawn by the real engine as this page loads. Nothing here is a screenshot.</p></header>
      {CAPS.map(([id, title, text]) => {
        const body = frag(id), raw = body && '__html' in body;
        return (
          <article key={id} className="cap">
            <div className="cap-copy"><h3 className="mono">{title}</h3><p>{text}</p></div>
            {raw ? <div className="cap-frag" id={'frag-' + id} dangerouslySetInnerHTML={body} />
              : <div className="cap-frag" id={'frag-' + id} aria-busy={body ? undefined : true}>{body || <div className="frag-skel" />}</div>}
          </article>
        );
      })}
    </section>
  );
}

function ScrubFrag({ S, t, ticks }: Scrub) {
  const n = t.length, [i, setI] = useState(Math.floor(n * 0.4));
  return (
    <div className="frag-tl">
      <svg viewBox={`0 0 ${Math.max(n - 1, 1)} 20`} preserveAspectRatio="none" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ticks }} />
      <input type="range" min={0} max={n - 1} value={i} onChange={(e) => setI(Number(e.target.value))} aria-label="Scrub the starter program" style={{ ['--p' as string]: (i / (n - 1)) * 100 + '%' }} />
      <div className="row mono faint" style={{ fontSize: 11, justifyContent: 'space-between' }}>
        <span>step <b className="tl-i">{i + 1}</b> / {n}</span>
        <span className="tl-key"><i style={{ background: 'var(--c-stack)' }} />call <i style={{ background: 'var(--c-heap)' }} />alloc <i style={{ background: 'var(--c-gor)' }} />go <i style={{ background: 'var(--c-chan)' }} />channel</span>
      </div>
      <div className="tl-cap" dangerouslySetInnerHTML={{ __html: capHTML(S.narrate(t[i], i ? t[i - 1] : null, 'simple')) }} />
    </div>
  );
}
