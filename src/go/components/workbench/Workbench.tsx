// The workbench: guide | editor + console | splitter | stage + timeline. One controller (Bench)
// owns the editor, stage and player; these components render its state.
import { Link } from '../../lib/router';
import { useRouter, useSearchParams } from '../../lib/router';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { View } from '../View';
import type { Lesson } from '../../lib/data';
import { useCatalog, program } from '../../lib/packs';
import { href } from '../../lib/routes';
import { getSettings, setSetting, useSettings } from '../../lib/settings';
import { hush, registerCommands, toast, type Command } from '../../lib/shell';
import { hashParams } from '../../lib/share';
import { useHydrated } from '../../lib/store';
import { Bench, SPEEDS, STARTER, pending, useBench, type Pane } from './bench';
import { Console } from './Console';
import { LessonGuide, PlayGuide } from './Guide';
import { StagePane } from './StagePane';
import { ShareDialog, escapeTool, noteTool, qrTool } from './tools';

const clampSplit = (v: number) => Math.max(25, Math.min(75, v));
const toggleGuide = () => setSetting('guide', !getSettings().guide);
const toggleVoice = () => setSetting('voice', !getSettings().voice);

/** ?program=<id> on the playground (read on the client; it needs a Suspense boundary). */
function ProgramParam({ onChange }: { onChange: (id: string | null) => void }) {
  const id = useSearchParams().get('program');
  useEffect(() => onChange(id), [id, onChange]);
  return null;
}

export function Workbench({ mode, lesson = null }: { mode: 'play' | 'lesson'; lesson?: Lesson | null }) {
  const [b] = useState(() => new Bench(mode));
  useBench(b);
  const s = useSettings(), router = useRouter();
  const edHost = useRef<HTMLDivElement>(null), stageHost = useRef<HTMLDivElement>(null), work = useRef<HTMLDivElement>(null), guide = useRef<HTMLElement>(null);
  const [links, setLinks] = useState<{ link: string; embed: string } | null>(null);
  const [query, setQuery] = useState<string | null | undefined>(undefined); // undefined until the URL has been read
  const [hashTick, setHashTick] = useState(0);
  const openShare = async () => { if (!b.ready) return; b.player?.pause(); const l = await b.shareLinks(); b.bump('shares'); setLinks(l); };

  // editor + stage + player, once per mount
  useEffect(() => {
    const ed = edHost.current!;
    b.mount(ed, stageHost.current!);
    return () => b.unmount(ed);
  }, [b]);

  // what to show: a lesson, a share link (#src=…&at=n), an example (?program=id) or the saved draft
  const lessonId = lesson?.id;
  useEffect(() => {
    if (!b.ready || mode !== 'lesson' || !lesson || b.lesson?.id === lesson.id) return;
    b.openLesson(lesson);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b, b.mountId, mode, lessonId]);
  useEffect(() => {
    const f = () => setHashTick((x) => x + 1);
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  useEffect(() => {
    if (!b.ready || mode !== 'play' || query === undefined) return;
    const h = hashParams(), src = h.get('src');
    if (src) { if (src !== b.shared) b.openShared(src, Number(h.get('at')) || 0); }
    else {
      const id = query && program(query) ? query : null;
      if (!b.mode || (id && id !== b.programId)) b.openProgram(id);
    }
    if (pending.fn) { const f = pending.fn; pending.fn = null; f(b); }
  }, [b, b.mountId, mode, query, hashTick]);

  // settings the imperative parts follow
  useEffect(() => { b.stage?.setFollow(s.follow, false); }, [b, b.mountId, s.follow]);
  useEffect(() => { b.editor?.refresh(); }, [b, b.mountId, s.editorSize]);
  useEffect(() => { if (!s.voice) hush(); else b.reshow(); }, [b, s.voice]);

  // the player's keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const p = b.player;
      if (!p || e.defaultPrevented) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'b') { e.preventDefault(); toggleGuide(); return; }
      if ((e.target as HTMLElement).closest?.('input, textarea, select, [contenteditable], dialog')) return;
      if (mod || e.altKey) return;
      const jump = (dir: number) => { const marks = b.sum?.marks || []; const m = dir > 0 ? marks.find((i) => i > p.idx) : [...marks].reverse().find((i) => i < p.idx); if (m !== undefined) { p.pause(); p.show(m, true); } };
      const toggle = () => (p.trace ? p.toggle() : b.run({ autoplay: true })), present = () => b.present(!b.presenting);
      const acts: Record<string, () => void> = {
        ' ': toggle, k: () => p.toggle(), K: () => p.toggle(),
        ArrowRight: () => p.step(1), l: () => p.step(1), ArrowLeft: () => p.step(-1), j: () => p.step(-1),
        Home: () => { p.pause(); p.show(0, false); }, End: () => { p.pause(); p.show(p.len - 1, false); },
        ']': () => jump(1), '[': () => jump(-1), f: () => b.stage?.fit(), F: () => b.stage?.fit(), '+': () => b.stage?.zoomIn(), '=': () => b.stage?.zoomIn(), '-': () => b.stage?.zoomOut(),
        PageDown: () => p.step(1), PageUp: () => p.step(-1),
        p: present, P: present, v: toggleVoice, V: toggleVoice,
        // only claim these keys while presenting
        ...(b.presenting ? { n: () => noteTool(b), N: () => noteTool(b), q: () => qrTool(b), Q: () => qrTool(b), Escape: () => b.present(false) } : {}),
      };
      if (acts[e.key]) { e.preventDefault(); acts[e.key](); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [b]);

  // palette commands while the workbench is open
  useEffect(() => {
    // run after the palette has closed: the editor cannot take focus behind an open modal
    const cmd = (id: string, title: string, run: () => void, keys?: string): Command => ({ id: 'wb-' + id, kind: 'command', title, keys, run: () => setTimeout(run) });
    const starter = () => {
      const load = (x: Bench) => { x.swapIn(STARTER); x.run({ autoplay: true }); };
      if (mode === 'play') { load(b); if (location.search || location.hash) router.replace(href.playground, { scroll: false }); }
      else { pending.fn = load; router.push(href.playground); }
    };
    return registerCommands([
      cmd('run', 'Run program', () => b.run({ autoplay: true, force: true }), '⌘↵'),
      cmd('play', 'Play / pause', () => (b.player?.trace ? b.player.toggle() : b.run({ autoplay: true })), 'Space'),
      cmd('present', 'Presentation mode', () => b.present(!b.presenting), 'P'),
      cmd('tidy', 'Tidy indentation', () => b.tidy(), '⇧⌥F'),
      cmd('transcript', 'Save the step transcript as Markdown', () => b.exportTranscript()),
      cmd('voice', 'Read steps aloud (on/off)', toggleVoice, 'V'),
      cmd('escape', 'Compare escapes with the Go compiler', () => escapeTool(b)),
      cmd('share', 'Share link, embed or image', () => { openShare(); }),
      cmd('fit', 'Fit stage to view', () => b.stage?.fit(), 'F'),
      cmd('follow', 'Toggle follow camera', () => { setSetting('follow', !getSettings().follow); toast('Follow camera ' + (getSettings().follow ? 'on: the stage tracks each step.' : 'off.')); }),
      cmd('guide', 'Toggle guide panel', toggleGuide, '⌘B'),
      cmd('simple', 'Narration: simple words', () => setSetting('depth', 'simple')),
      cmd('hood', 'Narration: under the hood', () => setSetting('depth', 'hood')),
      cmd('starter', 'Load the starter program', starter),
      ...SPEEDS.map((sp) => cmd('speed-' + sp, 'Playback speed ' + sp + '×', () => setSetting('speed', sp))),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b, mode, router]);

  /* ---------- splitter (drag + keyboard) ---------- */
  const applySplit = (v: number) => { v = clampSplit(v); work.current?.style.setProperty('--split', v + '%'); return v; };
  const onSplitDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const sp = e.currentTarget;
    sp.setPointerCapture(e.pointerId); sp.classList.add('dragging');
    const box = work.current!.getBoundingClientRect(), gw = getSettings().guide && !b.presenting ? guide.current!.getBoundingClientRect().width : 0;
    const at = (x: number) => ((x - box.left - gw) / (box.width - gw)) * 100;
    const move = (ev: PointerEvent) => { sp.setAttribute('aria-valuenow', String(Math.round(applySplit(at(ev.clientX))))); };
    const up = (ev: PointerEvent) => { sp.classList.remove('dragging'); sp.removeEventListener('pointermove', move); sp.removeEventListener('pointerup', up); setSetting('split', applySplit(at(ev.clientX))); };
    sp.addEventListener('pointermove', move); sp.addEventListener('pointerup', up);
  };
  const onSplitKey = (e: React.KeyboardEvent) => {
    const d = ({ ArrowLeft: -2, ArrowRight: 2, Home: -100, End: 100 } as Record<string, number>)[e.key];
    if (d !== undefined) { e.preventDefault(); setSetting('split', clampSplit(getSettings().split + d)); }
  };

  const PANES: [Pane, string][] = [['guide', 'Guide'], ['code', 'Code'], ['stage', 'Stage']];
  return (
    <View style={{ overflow: 'hidden' }}>
      <div className={'work' + (!s.guide || b.presenting ? ' no-guide' : '')} id="work" data-pane={b.pane} ref={work} style={{ ['--split' as string]: s.split + '%' }}>
        <aside className="guide" id="guide" aria-label="Guide" ref={guide}>
          {mode === 'play' ? <PlayGuide b={b} /> : lesson ? <LessonGuide b={b} lesson={lesson} /> : null}
        </aside>

        <section className="pane code-pane" aria-label="Code editor">
          <div className="pane-head">
            <div className="file-tab"><span className="go">GO</span>main.go<span className={'dirty' + (b.dirty ? ' on' : '')} id="dirty-dot" title="Edited" /></div>
            <button className="icon-btn" id="guide-toggle" type="button" aria-label="Toggle guide panel" aria-pressed={s.guide} title="Toggle guide (⌘B)" onClick={toggleGuide}><Icon name="panel" /></button>
            <span className="spacer" />
            <label className="switch" title="Re-run as you type"><input type="checkbox" id="live-toggle" checked={s.live} onChange={(e) => setSetting('live', e.target.checked)} />Live</label>
            <button className="btn ghost sm" id="tidy-btn" type="button" title="Fix indentation (⇧⌥F)" onClick={() => b.tidy()}>Tidy</button>
            <button className={'btn primary sm' + (b.running ? ' running' : '')} id="run-btn" type="button" title="Run (⌘↵)" onClick={() => b.run({ autoplay: true, force: true })}><Icon name="play" />Run</button>
          </div>
          {/* the editor module fills this host itself */}
          <div className="editor" id="editor" ref={edHost} />
          <p className="sr-only" id="editor-help">Press Control or Command plus Enter to run. Escape leaves the editor so Tab can move focus.</p>
          <Console b={b} />
        </section>

        <div className="splitter" id="splitter" role="separator" aria-orientation="vertical" aria-label="Resize editor and stage" aria-valuemin={25} aria-valuemax={75} aria-valuenow={Math.round(s.split)} tabIndex={0} onPointerDown={onSplitDown} onKeyDown={onSplitKey} />

        <StagePane b={b} host={stageHost} onShare={openShare} />

        <nav className="pane-switch" role="tablist" aria-label="Panels">
          {PANES.map(([p, label]) => <button key={p} role="tab" type="button" data-pane={p} aria-selected={b.pane === p} onClick={() => b.setPane(p)}>{label}</button>)}
        </nav>
      </div>
      {mode === 'play' && <Suspense fallback={null}><ProgramParam onChange={setQuery} /></Suspense>}
      <ShareDialog b={b} links={links} onClose={() => setLinks(null)} />
    </View>
  );
}

/** /learn/[id]: built-in lessons render on the server; imported ones resolve once the browser's packs load. */
export function LessonWorkbench({ id }: { id: string }) {
  const { lessons } = useCatalog(), hydrated = useHydrated();
  const lesson = lessons.find((l) => l.id === id) || null;
  if (!lesson && hydrated) return (
    <View><div className="page empty"><h3>That page doesn&apos;t exist.</h3><p>The link may be old or mistyped.</p><Link className="btn primary" href={href.learn}>Go to Learn</Link></div></View>
  );
  return <Workbench mode="lesson" lesson={lesson} />;
}
