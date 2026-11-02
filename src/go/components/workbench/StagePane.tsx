// The right-hand pane: lens tabs, depth, share; the stage (with caption, empty state and the
// other lenses on top); and the timeline transport.
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon';
import { canSpeak } from '../../lib/shell';
import { getSettings, setSetting, useSettings, useT } from '../../lib/settings';
import { useHydrated, useStoreVersion } from '../../lib/store';
import { notes, SPEEDS, srcHash, TUTOR_ON, useBench, useStep, type Bench, type Lens } from './bench';
import { GanttView, MemoryView, TableView } from './lenses';
import { noteTool, qrTool, tutorTool } from './tools';

const LENSES: [Lens, string, string?][] = [['stage', 'Stage'], ['gantt', 'Goroutines', 'When each goroutine runs, waits and finishes'], ['table', 'Table'], ['memory', 'Memory', 'Heap size over time and the garbage collector']];

function Caption({ b }: { b: Bench }) {
  useStep(b); useSettings(); // the narration depth changes the words
  const c = b.caption();
  if (!c) return null;
  return (
    <div className="caption swap" aria-hidden="true" key={(b.cur?.i ?? -1) + c.html}>
      <span className="chip kind" style={{ color: c.color, borderColor: 'color-mix(in srgb,' + c.color + ' 45%,transparent)' }}><span className="dot" />{c.label}</span>
      <span className="text" dangerouslySetInnerHTML={{ __html: c.html }} />
      {c.pinned && <button className="icon-btn" type="button" style={{ width: 22, height: 22, marginLeft: 'auto' }} aria-label="Close details" onClick={() => b.onPick(null)}><Icon name="x" /></button>}
    </div>
  );
}

function EmptyState({ b }: { b: Bench }) {
  const e = b.empty, run = () => b.run({ autoplay: true, force: true });
  if (!e) return null;
  return (
    <div className="stage-empty">
      {e.kind === 'idle' ? <div>
        <span className="mark" style={{ width: 44, height: 44, fontSize: 22, borderRadius: 12 }}>g.</span>
        <h3>Your program will play here</h3>
        <p>Press <kbd>⌘</kbd><kbd>↵</kbd> or <b>Run</b>. Every step becomes a frame on this stage — zoom, pan and scrub through it.</p>
        <button className="btn primary" type="button" onClick={run}><Icon name="play" />Run and watch</button>
      </div> : e.kind === 'problems' ? <div>
        <h3 style={{ color: 'var(--bad)' }}>{e.list.length} thing{e.list.length > 1 ? 's' : ''} to fix first</h3>
        <p>{e.list[0].message} <span className="faint">(line {e.list[0].line})</span></p>
        <button className="btn" type="button" onClick={() => b.editor?.focusLine(e.list[0].line)}>Show me</button>
      </div> : <div>
        <h3>Execution stopped</h3>
        <p>{e.msg || 'The program ran too long.'} Your code is still here.</p>
        <button className="btn" type="button" onClick={run}>Try again</button>
      </div>}
    </div>
  );
}

function PresentBar({ b }: { b: Bench }) {
  useStep(b); useStoreVersion(); // notes live in the store
  const i = b.player?.trace ? b.player.idx : -1, text = i >= 0 ? notes()[srcHash(b.editor?.value ?? '')]?.[i] : undefined;
  return (
    <div className="present-bar" id="present-bar">
      <div className="present-note" id="present-note" hidden={!text}>{text || ''}</div>
      <div className="row">
        <button className="btn sm" type="button" onClick={() => noteTool(b)}>Pin a note to this step (N)</button>
        <button className="btn sm" type="button" onClick={() => qrTool(b)}>QR code (Q)</button>
        <span className="spacer" />
        <button className="btn sm" type="button" onClick={() => b.present(false)}>Exit (Esc)</button>
      </div>
    </div>
  );
}

/** A red dot that follows the pointer while presenting. */
function Laser() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let idle: ReturnType<typeof setTimeout> | undefined;
    const move = (e: PointerEvent) => {
      const el = ref.current; if (!el) return;
      el.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; el.classList.add('on');
      clearTimeout(idle); idle = setTimeout(() => el.classList.remove('on'), 1800);
    };
    addEventListener('pointermove', move);
    return () => { removeEventListener('pointermove', move); clearTimeout(idle); };
  }, []);
  return createPortal(<div className="laser" id="laser" aria-hidden="true" ref={ref} />, document.querySelector('.gk') || document.body); // inside gothik's styles
}

function Timeline({ b }: { b: Bench }) {
  useStep(b);
  const s = useSettings(), t = useT(), hydrated = useHydrated();
  const p = b.player, n = p?.trace ? p.len : 0, i = b.cur?.i ?? 0, end = !n || i >= n - 1;
  const ticks = useMemo(() => (b.sum && b.S ? b.S.ticksSVG(b.sum) : ''), [b.sum, b.S]);
  const to = (k: number) => { p?.pause(); p?.show(k, false); };
  return (
    <div className="timeline" id="timeline">
      <div className="transport">
        <button id="tl-start" type="button" aria-label="Go to start (Home)" title="Start (Home)" disabled={i === 0} onClick={() => to(0)}><Icon name="start" /></button>
        <button id="tl-back" type="button" aria-label="Step back (←)" title="Step back (← or J)" disabled={i === 0} onClick={() => p?.step(-1)}><Icon name="prev" /></button>
        <button id="tl-play" className="play" type="button" aria-label={t(b.playing ? 'Pause (Space)' : 'Play (Space)')} title="Play / pause (Space or K)" onClick={() => (p?.trace ? p.toggle() : b.run({ autoplay: true }))}><Icon name={b.playing ? 'pause' : 'play'} /></button>
        <button id="tl-step" type="button" aria-label="Step forward (→)" title="Step (→ or L)" disabled={end} onClick={() => p?.step(1)}><Icon name="next" /></button>
        <button id="tl-end" type="button" aria-label="Go to end (End)" title="End (End)" disabled={end} onClick={() => to(n - 1)}><Icon name="end" /></button>
      </div>
      <div className="track" id="track">
        <svg id="track-marks" preserveAspectRatio="none" aria-hidden="true" viewBox={'0 0 ' + Math.max(n - 1, 1) + ' 20'} dangerouslySetInnerHTML={{ __html: ticks }} />
        <input type="range" id="scrub" min={0} max={Math.max(0, n - 1)} value={i} step={1} aria-label="Timeline position" style={{ ['--p' as string]: (n > 1 ? (i / (n - 1)) * 100 : 0) + '%' }} onChange={(e) => to(Number(e.target.value))} />
      </div>
      <div className="tl-meta">
        <span>step <b id="tl-pos">{n ? i + 1 : 0}</b>/<span id="tl-len">{n}</span></span>
        <select className="speed" id="speed" aria-label="Playback speed" value={String(s.speed)} onChange={(e) => setSetting('speed', Number(e.target.value))}>
          {SPEEDS.map((v) => <option key={v} value={String(v)}>{v}×</option>)}
        </select>
        <button className="icon-btn" id="voice-btn" type="button" aria-pressed={s.voice} hidden={hydrated && !canSpeak()} aria-label="Read each step aloud" title="Read each step aloud (V)" style={{ width: 28, height: 28 }} onClick={() => setSetting('voice', !getSettings().voice)}><Icon name="voice" /></button>
        <button className="icon-btn" id="present-btn" type="button" aria-label="Presentation mode" title="Presentation mode (P)" style={{ width: 28, height: 28 }} onClick={() => b.present(!b.presenting)}><Icon name="present" /></button>
      </div>
    </div>
  );
}

export function StagePane({ b, host, onShare }: { b: Bench; host: RefObject<HTMLDivElement | null>; onShare: () => void }) {
  useBench(b);
  const s = useSettings();
  return (
    <section className="pane stage-pane" aria-label="Visualisation">
      <div className="pane-head">
        <div className="seg" role="tablist" aria-label="View">
          {LENSES.map(([l, label, title]) => <button key={l} role="tab" type="button" id={'lens-' + l} aria-selected={b.lens === l} title={title} onClick={() => b.setLens(l)}>{label}</button>)}
        </div>
        <div className="seg" aria-label="Explanation depth">
          <button id="depth-simple" type="button" aria-pressed={s.depth !== 'hood'} title="Plain-language narration" onClick={() => setSetting('depth', 'simple')}>Simple</button>
          <button id="depth-hood" type="button" aria-pressed={s.depth === 'hood'} title="Narrate with runtime vocabulary (under the hood)" onClick={() => setSetting('depth', 'hood')}>Runtime</button>
        </div>
        <span className="spacer" />
        <span className="chip model" title="Positions, addresses and sizes are a teaching model, not your machine's memory">simplified model</span>
        {TUTOR_ON && <button className="btn sm" id="tutor-btn" type="button" title="Ask an AI tutor about this step (uses your own Anthropic API key)" onClick={() => tutorTool(b)}>Ask tutor</button>}
        <button className="icon-btn" id="share-btn" type="button" aria-label="Share or export" title="Share link, embed or image" onClick={onShare}><Icon name="share" /></button>
      </div>
      {/* the stage appends its own SVG, minimap and zoom controls to this host */}
      <div className={'stage-wrap' + (b.stale ? ' stale' : '') + (b.lens !== 'stage' ? ' table-mode' : '')} id="stage-wrap" ref={host}>
        <Caption b={b} />
        <EmptyState b={b} />
        {b.lens === 'table' && <TableView b={b} />}
        {b.lens === 'gantt' && <GanttView b={b} />}
        {b.lens === 'memory' && <MemoryView b={b} />}
        {b.presenting && <><PresentBar b={b} /><Laser /></>}
      </div>
      <Timeline b={b} />
    </section>
  );
}
