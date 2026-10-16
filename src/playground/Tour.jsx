import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { store, useStore } from './store.js';
import { TOUR, DEMO } from './tourSteps.js';

/* The 11-step spotlight tour. Targets are found by their element ids (#ctxbadge, #side, #termpane …). */
export default function Tour() {
  useStore();
  const i = store.tourIndex; const active = i >= 0; const st = active ? TOUR[Math.min(i, TOUR.length - 1)] : null;
  const card = useRef(null); const [layout, setLayout] = useState(null);

  const place = () => {
    const c = card.current; if (!c || !st) return;
    const vw = window.innerWidth, vh = window.innerHeight, cw = c.offsetWidth, ch = c.offsetHeight; const tgt = st.sel ? document.querySelector(st.sel) : null;
    if (!tgt || st.center || !tgt.offsetParent) { setLayout({ spot: { display: 'none' }, left: Math.max(12, (vw - cw) / 2), top: Math.max(12, (vh - ch) / 2.4) }); return; }
    const r = tgt.getBoundingClientRect(); const pad = 5; const gap = 16; let x, y;
    if (r.right + gap + cw < vw) { x = r.right + gap; y = r.top; }
    else if (r.left - gap - cw > 0) { x = r.left - gap - cw; y = r.top; }
    else if (r.bottom + gap + ch < vh) { x = r.left; y = r.bottom + gap; }
    else if (r.top - gap - ch > 0) { x = r.left; y = r.top - gap - ch; }
    else { x = Math.max(12, r.left + 20); y = Math.max(12, r.bottom - ch - 20); }
    if (r.width > vw * 0.35 && r.height > vh * 0.5 && r.right + gap + cw >= vw) { x = Math.max(12, r.right - cw - 24); y = Math.max(12, r.bottom - ch - 24); }
    setLayout({ spot: { display: 'block', left: r.left - pad, top: r.top - pad, width: r.width + 2 * pad, height: r.height + 2 * pad }, left: Math.min(Math.max(12, x), vw - cw - 12), top: Math.min(Math.max(12, y), vh - ch - 12) });
  };

  useLayoutEffect(() => { // a step may need the guide open or another view showing
    if (!active) { setLayout(null); return; }
    if (st.open === 'side' && store.noside) { store.noside = false; store.bump(); }
    if (st.tab && store.vizTab !== st.tab) { store.vizTab = st.tab; store.bump(); }
    let r2; const r1 = requestAnimationFrame(() => { place(); r2 = requestAnimationFrame(place); });
    const onResize = () => place(); window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); window.removeEventListener('resize', onResize); };
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps -- re-place only when the step changes

  useEffect(() => {
    if (!active) return;
    const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); store.endTour(); } else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); } };
    document.addEventListener('keydown', onKey, true); return () => document.removeEventListener('keydown', onKey, true);
  });

  const go = n => { if (n >= TOUR.length) store.endTour(); else store.startTour(Math.max(0, n)); };
  const next = () => go(i + 1);
  return (
    <div id="tour" hidden={!active}>
      {active && <>
        <div className="tour-spot" style={layout ? layout.spot : { display: 'none' }}></div>
        <div className="tour-card" ref={card} style={layout ? { left: layout.left, top: layout.top } : { visibility: 'hidden' }}>
          <h3 dangerouslySetInnerHTML={{ __html: st.title }}></h3>
          <div className="tb" dangerouslySetInnerHTML={{ __html: st.html }}></div>
          <div className="tour-dots">{TOUR.map((_, k) => <i key={k} className={k <= i ? 'on' : ''}></i>)}</div>
          <div className="tour-foot">
            <span className="n">{i + 1} of {TOUR.length}</span>
            <button id="tour-skip" onClick={() => store.endTour()}>Skip</button>
            <button id="tour-back" style={{ visibility: i === 0 ? 'hidden' : 'visible' }} onClick={() => go(i - 1)}>← Back</button>
            {st.demo && <button id="tour-demo" className="demo" onClick={() => { store.endTour(); store.vizTab = 'cluster'; store.bump(); store.runInTerm(DEMO.join('\n'), true); }}>▶ Run the demo</button>}
            <button id="tour-next" className="go" onClick={next}>{i === TOUR.length - 1 ? 'Finish' : 'Next →'}</button>
          </div>
        </div>
      </>}
    </div>
  );
}
