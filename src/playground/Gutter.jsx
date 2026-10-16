import { useRef } from 'react';
import { store } from './store.js';

const LIMITS = { side: [200, 520], viz: [340, 1100] };
/* A pane divider: drag it, or focus it and use the arrow keys (Shift = bigger steps, Home/End = min/max, Enter = collapse the guide,
   double-click = reset). Exposed as a separator with aria-valuenow so screen readers announce the width. */
export default function Gutter({ which }) {
  const ref = useRef(null); const [min, max] = LIMITS[which];
  const current = () => { const m = ref.current.closest('main'); const el = m.querySelector(which === 'side' ? '#side' : '#vizpane'); return Math.round(el.getBoundingClientRect().width); };
  const set = w => store.setLayout({ [which]: Math.max(min, Math.min(max, Math.round(w))) });
  const onPointerDown = e => {
    if (e.button !== 0) return; e.preventDefault(); const g = ref.current; g.setPointerCapture(e.pointerId); const main = g.closest('main'); const rect = main.getBoundingClientRect(); document.body.style.userSelect = 'none';
    const move = ev => set(which === 'side' ? ev.clientX - rect.left : rect.right - ev.clientX);
    const up = () => { g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); document.body.style.userSelect = ''; };
    g.addEventListener('pointermove', move); g.addEventListener('pointerup', up);
  };
  const onKeyDown = e => {
    const step = e.shiftKey ? 64 : 16; const sign = which === 'side' ? 1 : -1; const w = store.layout[which] || current(); // the stored width is exact even between two quick key presses
    if (e.key === 'ArrowRight') { e.preventDefault(); set(w + sign * step); } else if (e.key === 'ArrowLeft') { e.preventDefault(); set(w - sign * step); }
    else if (e.key === 'Home') { e.preventDefault(); set(min); } else if (e.key === 'End') { e.preventDefault(); set(max); }
    else if ((e.key === 'Enter' || e.key === ' ') && which === 'side') { e.preventDefault(); store.toggleSide(); }
  };
  return <div ref={ref} className={'gutter ' + which} role="separator" aria-orientation="vertical" aria-label={which === 'side' ? 'Resize the guide' : 'Resize the cluster view'} aria-valuemin={min} aria-valuemax={max} aria-valuenow={store.layout[which] || undefined} tabIndex={0} title="Drag to resize, double-click to reset" onPointerDown={onPointerDown} onKeyDown={onKeyDown} onDoubleClick={() => store.setLayout({ [which]: LAYOUT_RESET[which] })} />;
}
const LAYOUT_RESET = { side: 310, viz: 0 };
