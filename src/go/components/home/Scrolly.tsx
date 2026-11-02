// "One program, scrolled": each sheet moves the playhead of the starter program to a moment worth seeing.
import { useEffect, useRef, useState } from 'react';
import { createPlayer, execute, loadEditor, loadStage, traceOf, type Stage, type State } from '../../lib/run';
import { getSettings, reduced } from '../../lib/settings';
import { STARTER } from './demo';

type Story = { title: string; text: string; kind?: string; after?: number; find?: (k: string, s: State) => boolean };
const STORY: Story[] = [
  { kind: 'start', title: 'it starts in main', text: 'Goroutine G1 begins in main. Every function call gets its own frame on the goroutine\'s stack, holding its local variables.' },
  { find: (k, s) => /append/.test(String(s.title)) || ((s.event?.fx || []).some((e: { type: string }) => e.type === 'alloc') && k !== 'call'), title: 'append outgrows its array', text: 'nums has room for two values. Appending a third makes Go allocate a bigger backing array, copy the values, and repoint the slice. The bracket under the array shows len; the shaded part is cap.' },
  { kind: 'call', title: 'a call opens a frame', text: 'newPoint gets a fresh frame on G1\'s stack with its own x and y. The arguments are copies, not references.' },
  { kind: 'return', after: 1, title: 'the frame dies, p survives', text: 'newPoint returns &p. Its frame is gone, but p is still pointed to, so it has to live on the heap. That is what escape analysis decides.' },
  { kind: 'spawn', title: 'go starts a second goroutine', text: 'A new lane appears: G2, with its own stack. It shares nums with main through the closure. The arrow is the same variable, not a copy.' },
  { find: (k) => k === 'send' || k === 'recv' || k === 'block', title: 'channels hand values across', text: 'done is unbuffered, so a send waits for a receiver. Watch the value travel from one goroutine to the other.' },
  { kind: 'finish', title: 'main returns, everything stops', text: 'When main returns, the program exits, even if other goroutines are still around. The output is in the terminal.' },
];

export function Scrolly() {
  const stageRef = useRef<HTMLDivElement>(null), codeRef = useRef<HTMLPreElement>(null), sheets = useRef<(HTMLElement | null)[]>([]);
  const [cap, setCap] = useState<{ color: string; label: string; html: string; i: number } | null>(null);
  const [marks, setMarks] = useState<{ at: number[]; n: number } | null>(null), [on, setOn] = useState(-1);

  useEffect(() => {
    let dead = false, stage: Stage | null = null, io: IntersectionObserver | null = null, walk: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      const [{ GothikStage: S }, { GothikEditor }] = await Promise.all([loadStage(), loadEditor()]);
      if (dead || !stageRef.current) return;
      stage = S.create(stageRef.current, { compact: true, speed: () => getSettings().speed }) as Stage;
      const lines = STARTER.split('\n').slice(0, -1).map((l: string) => GothikEditor.highlightLine(l));
      const player = createPlayer({
        stage, onShow: (s, i, prev) => {
          const n = S.narrate(s, prev, getSettings().depth);
          setCap({ color: n.color, label: n.label, html: n.html, i });
          const ln = s.line >= 0 ? s.line + 1 : 0, code = codeRef.current;
          if (!code) return;
          code.innerHTML = lines.map((l: string, k: number) => '<span class="' + (k + 1 === ln ? 'now' : '') + '">' + l + ' </span>').join('\n');
          const lh = parseFloat(getComputedStyle(code).lineHeight) || 18;
          code.scrollTo({ top: Math.max(0, (ln - 4) * lh), behavior: reduced() ? 'auto' : 'smooth' });
        },
      });
      const r = await execute(STARTER, { owner: 'scrolly' }), t = traceOf(r);
      if (dead || !t) return;
      const kinds: string[] = []; let prev: State = null;
      for (let i = 0; i < t.length; i++) { kinds.push(S.inferKind(t[i], prev)); prev = t[i]; }
      let after = 0;
      const at = STORY.map((st) => {
        let k = -1;
        for (let i = after; i < t.length; i++) if (st.kind ? kinds[i] === st.kind : st.find!(kinds[i], t[i])) { k = i; break; }
        if (k < 0) k = Math.min(t.length - 1, after);
        k = Math.min(t.length - 1, k + (st.after || 0));
        after = k;
        return k;
      });
      at[at.length - 1] = t.length - 1;
      setMarks({ at, n: t.length });
      player.setTrace(t, 0);
      // step through the in-between states quickly so movement reads as motion, not a cut
      const walkTo = (target: number) => {
        clearTimeout(walk);
        if (Math.abs(target - player.idx) <= 1 || reduced()) { player.show(target, true); return; }
        const dir = Math.sign(target - player.idx), stepMs = Math.max(40, 360 / Math.abs(target - player.idx));
        const go = () => { if (player.idx === target) return; player.show(player.idx + dir, Math.abs(target - player.idx) <= 2); walk = setTimeout(go, stepMs); };
        go();
      };
      io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { const i = sheets.current.indexOf(e.target as HTMLElement); setOn(i); walkTo(at[i]); }
      }, { rootMargin: '-45% 0px -45% 0px' });
      sheets.current.forEach((s) => s && io!.observe(s));
    })();
    return () => { dead = true; io?.disconnect(); clearTimeout(walk); stage?.destroy(); };
  }, []);

  return (
    <section className="scrolly" aria-label="One program, scrolled">
      <div className="scrolly-copy">
        <header className="scrolly-head"><p className="mono faint">{"// one program, scrolled"}</p><h2 className="mono">scroll, and the program runs.</h2><p className="dim">The picture on the right is the real engine executing the starter program. Each section below moves its playhead to a moment worth seeing.</p></header>
        {STORY.map((x, i) => (
          <article key={i} className={'sheet' + (on === i ? ' on' : '')} ref={(el) => { sheets.current[i] = el; }}>
            <p className="mono sheet-step">step <b>{marks ? marks.at[i] + 1 + ' / ' + marks.n : '—'}</b></p><h3 className="mono">{x.title}</h3><p>{x.text}</p>
          </article>
        ))}
      </div>
      <div className="scrolly-fig"><div className="scrolly-sticky">
        <div className="scrolly-stage" ref={stageRef}>
          {cap && <div className="caption swap" key={cap.i}><span className="chip kind" style={{ color: cap.color }}><span className="dot" />{cap.label}</span><span className="text" dangerouslySetInnerHTML={{ __html: cap.html }} /></div>}
        </div>
        <pre className="scrolly-code mono" ref={codeRef} aria-hidden="true" />
      </div></div>
    </section>
  );
}
