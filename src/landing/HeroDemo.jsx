import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import demos from './generated/demos.json';
import ClusterPane from './ClusterPane.jsx';

const frames = demos.hero;
const LiveDemo = lazy(() => import('../playground/Embed.jsx'));
const preloadLive = () => import('../playground/Embed.jsx');
const flatten = upTo => frames.slice(0, upTo + 1).flatMap(f => [{ k: 'cmd', t: f.cmd }, ...f.out.map(t => ({ k: 'out', t }))]);
const ROWS = 17;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* The hero: the real simulator's output for one session, typed out in a loop, with the cluster picture changing as it goes.
   Server render and no-JS show the finished session. The animation pauses off-screen and is skipped for reduced motion.
   "Type your own" swaps this for the live simulator, loaded only on demand. */
export default function HeroDemo() {
  const [lines, setLines] = useState(() => flatten(frames.length - 1));
  const [snap, setSnap] = useState(frames[frames.length - 1].snap);
  const [typing, setTyping] = useState(null);
  const [live, setLive] = useState(false);
  const root = useRef(null);

  // the HTML ships the finished session; with JS and motion allowed, start over before first paint so there is no flash
  useLayoutEffect(() => { if (!live && !matchMedia('(prefers-reduced-motion: reduce)').matches) { setLines([]); setSnap(null); } }, [live]);
  useEffect(() => {
    if (live || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let stop = false; let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 }); io.observe(root.current);
    const whenVisible = async () => { while (!visible && !stop) await sleep(300); };
    (async () => {
      while (!stop) {
        setLines([]); setSnap(null); await sleep(600);
        for (const f of frames) {
          await whenVisible(); if (stop) return;
          for (let c = 1; c <= f.cmd.length && !stop; c++) { setTyping(f.cmd.slice(0, c)); await sleep(c % 7 === 0 ? 70 : 24 + (c % 3) * 8); }
          setTyping(null); setLines(l => [...l, { k: 'cmd', t: f.cmd }]); await sleep(260); setSnap(f.snap);
          for (const t of f.out) { if (stop) return; setLines(l => [...l, { k: 'out', t }]); await sleep(t.length > 60 ? 70 : 45); }
          await sleep(1500);
        }
        await sleep(3200);
      }
    })();
    return () => { stop = true; io.disconnect(); };
  }, [live]);

  const shown = lines.slice(-ROWS);
  return (
    <figure className="demo" ref={root}>
      <figcaption className="demo-bar"><span>bench: terminal and cluster</span><span className="demo-live">{live ? 'live simulator' : 'real simulator output'}</span></figcaption>
      <div className="demo-body">
        {live ? (
          <div className="demo-embed"><Suspense fallback={<div className="demo-loading">Loading the simulator…</div>}><LiveDemo /></Suspense></div>
        ) : (<>
          <pre className="term" aria-label="Terminal session">
            {shown.map((l, i) => <div key={lines.length - shown.length + i} className={l.k}>{l.k === 'cmd' ? <><span className="ps">$</span> {l.t}</> : l.t}</div>)}
            {typing !== null ? <div className="cmd"><span className="ps">$</span> {typing}<span className="caret" /></div> : <div className="cmd"><span className="ps">$</span><span className="caret" /></div>}
          </pre>
          <ClusterPane nodes={snap} />
        </>)}
      </div>
      <div className="demo-foot">
        {live
          ? <p>This is the real simulator. Try <code>kind create cluster --name dojo</code>, then <code>kubectl create deployment web --image=nginx:1.27</code>.</p>
          : <button type="button" className="link-btn" onClick={() => setLive(true)} onPointerEnter={preloadLive} onFocus={preloadLive} onTouchStart={preloadLive}>Type your own commands <span aria-hidden="true">→</span></button>}
      </div>
    </figure>
  );
}
