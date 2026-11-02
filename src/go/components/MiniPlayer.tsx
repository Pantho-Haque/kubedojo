// A compact editor + stage + timeline in one box (the prototype's mini()). The stage, editor and
// engine are framework-free modules loaded on first mount; React owns the controls around them.
import { Link } from '../lib/router';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { createPlayer, execute, loadEditor, loadStage, traceOf, type Player, type Stage, type State } from '../lib/run';
import { getSettings, reduced } from '../lib/settings';

export type MiniApi = { player: Player; stage: Stage; editor: { value: string } | null; run: (src: string, autoplay?: boolean) => Promise<void> };
type Props = {
  source: string;
  editor?: boolean; // show the code (default true)
  autoplay?: boolean; // play when scrolled into view (default true)
  loop?: boolean; // restart after a pause at the end
  delay?: number; speed?: number;
  startAt?: 'end'; at?: number;
  output?: boolean; // show printed output under the stage
  open?: { href: string; label?: string; target?: '_blank' };
  onShow?: (s: State, i: number, api: MiniApi) => void;
  onReady?: (api: MiniApi) => void;
  className?: string; style?: React.CSSProperties;
};
type Cap = { color: string; label: string; html: string; bad?: boolean } | null;

let seq = 0;
export function MiniPlayer({ source, editor = true, autoplay = true, loop = false, delay = 1000, speed = 1, startAt, at, output = false, open, onShow, onReady, className = '', style }: Props) {
  const host = useRef<HTMLDivElement>(null), codeRef = useRef<HTMLDivElement>(null), stageRef = useRef<HTMLDivElement>(null);
  const [cap, setCap] = useState<Cap>(null), [pos, setPos] = useState({ i: 0, n: 0 }), [playing, setPlaying] = useState(false), [out, setOut] = useState('');
  const api = useRef<MiniApi | null>(null), cbs = useRef({ onShow, onReady });
  useEffect(() => { cbs.current = { onShow, onReady }; });

  useEffect(() => {
    let dead = false, visible = false, loopTimer: ReturnType<typeof setTimeout> | undefined, typeTimer: ReturnType<typeof setTimeout> | undefined, lastSrc: string | null = null;
    let io: IntersectionObserver | null = null, stage: Stage | null = null;
    const owner = 'mini' + ++seq, codeHost = codeRef.current;
    (async () => {
      const [{ GothikStage: S }, { GothikEditor }] = await Promise.all([loadStage(), loadEditor()]);
      if (dead || !stageRef.current) return;
      stage = S.create(stageRef.current, { compact: true, speed: () => getSettings().speed * speed }) as Stage;
      let ed: { value: string; update: (o: unknown) => void; setNow: (l: number, s: boolean) => void } | null = null;
      const scheduleLoop = () => { clearTimeout(loopTimer); loopTimer = setTimeout(() => { if (visible && !reduced()) { player.show(0, false); player.play(); } }, 2600); };
      const player = createPlayer({
        stage, delay,
        onShow: (s, i, prev) => {
          if (ed) { ed.update({ now: s.line >= 0 ? s.line + 1 : 0 }); if (s.line >= 0) ed.setNow(s.line + 1, true); }
          const n = S.narrate(s, prev, getSettings().depth);
          setCap({ color: n.color, label: n.label || n.kind, html: n.html });
          setPos({ i, n: player.len });
          if (output) setOut((s.stdout ?? s.output ?? '') || (i === 0 ? 'Press play: printed lines appear here.' : ''));
          cbs.current.onShow?.(s, i, api.current!);
          if (i === player.len - 1 && loop && !player.playing) scheduleLoop();
        },
      });
      player.onState((p) => { setPlaying(p); if (!p && loop && player.idx === player.len - 1) scheduleLoop(); });
      const run = async (src: string, play = false) => {
        if (src === lastSrc && player.trace) { if (play) player.play(); return; }
        lastSrc = src;
        const r = await execute(src, { owner });
        if (dead) return;
        const t = traceOf(r);
        if (!t) { setCap({ color: 'var(--bad)', label: 'error', html: String(r.error || 'Could not run').replace(/^main\.go:/, 'line ').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!), bad: true }); return; }
        let start = 0;
        if (startAt === 'end' || reduced()) { start = t.length - 1; while (start > 0 && !S.goroutinesOf(t[start]).some((g: { frames?: unknown[] }) => g.frames?.length)) start--; }
        if (at && at > 0) start = Math.min(at, t.length - 1);
        player.setTrace(t, start);
        if (play && visible && !reduced()) player.play();
      };
      if (editor && codeRef.current) {
        ed = GothikEditor.mount(codeRef.current, {
          onRun: () => run(ed!.value, true),
          onChange: () => { clearTimeout(typeTimer); typeTimer = setTimeout(() => run(ed!.value, false).then(() => player.show(player.len - 1, false)), 500); },
          tabs: () => getSettings().tabs,
        });
        ed!.value = source;
      }
      api.current = { player, stage, editor: ed, run };
      cbs.current.onReady?.(api.current);
      io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !player.trace) run(ed ? ed.value : source, autoplay);
        else if (visible && autoplay && !player.playing && player.idx < player.len - 1 && !reduced()) player.play();
        else if (!visible) player.pause();
      }, { threshold: 0.25 });
      if (host.current) io.observe(host.current);
    })();
    return () => { dead = true; io?.disconnect(); api.current?.player.pause(); clearTimeout(loopTimer); clearTimeout(typeTimer); stage?.destroy(); api.current = null; if (codeHost) codeHost.innerHTML = ''; };
    // the program is fixed for one mount; give the component a new `key` to load another
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={host} className={'mini ' + className} style={style}>
      {editor && <div className="mini-code" ref={codeRef} />}
      <div className="mini-stage" ref={stageRef}>
        {cap && <div className="caption mini-cap swap" key={pos.i + cap.html}>
          <span className={'chip kind' + (cap.bad ? ' bad' : '')} style={{ color: cap.color }}><span className="dot" />{cap.label}</span>
          <span className="text" dangerouslySetInnerHTML={{ __html: cap.html }} />
        </div>}
      </div>
      <div className="mini-bar">
        <button className="mini-play" type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={() => { const a = api.current; if (a?.player.trace) a.player.toggle(); else a?.run(a.editor?.value ?? source, true); }}>
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
        <input type="range" min={0} max={Math.max(0, pos.n - 1)} value={pos.i} aria-label="Timeline position" style={{ ['--p' as string]: (pos.n > 1 ? (pos.i / (pos.n - 1)) * 100 : 0) + '%' }}
          onChange={(e) => { const pl = api.current?.player; pl?.pause(); pl?.show(Number(e.target.value), false); }} />
        <span className="mini-pos mono">{pos.n ? pos.i + 1 : 0}/{pos.n}</span>
        {open && <Link className="btn sm ghost" href={open.href} target={open.target} rel={open.target ? 'noopener' : undefined}>{open.label || 'Open in lab'} <Icon name="arrow" /></Link>}
      </div>
      {output && <div className="mini-out"><span className="eyebrow">Output</span><pre className="mono" aria-live="polite">{out}</pre></div>}
    </div>
  );
}
