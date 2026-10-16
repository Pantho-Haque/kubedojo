import { useEffect, useId, useRef, useState } from 'react';
import { G, NODES, SCRIPT_LINES, SHEETS, layout, slotPos } from './scenes.js';

const tone = st => (st === 'Running' ? 'ok' : st === 'ContainerCreating' || st === 'Pending' ? 'warn' : 'bad');
const cube = 'M7 12.5 17 7.5l10 5v10l-10 5-10-5zM7 12.5l10 5 10-5M17 17.5v10';

/* An engineering-drawing of the cluster. State (which sheet) comes from the story; every change is a CSS transition on transform/opacity,
   so it is cheap. Hover a pod to read it in the title block; on a mouse, a CAD crosshair follows the pointer. */
export default function Drawing({ step = 0, crosshair = false }) {
  const hatchId = 'hatch' + useId().replace(/:/g, ''); // several drawings can be on a page: ids must be unique
  const sheet = SHEETS[Math.min(step, SHEETS.length - 1)]; const pods = layout(sheet);
  const [info, setInfo] = useState(null); const ref = useRef(null); const [xy, setXy] = useState(null);
  const webOn = pods.filter(p => p.on && p.w === 'web');
  const counts = { cp: 0, w1: 0, w2: 0 }; for (const p of pods) if (p.on) counts[p.node]++;
  const groups = n => { const g = {}; for (const p of pods) if (p.on && p.node === n) g[p.w] = (g[p.w] || 0) + 1; return Object.entries(g); };

  useEffect(() => { // CAD crosshair: one rAF-throttled pointer handler, only where a real pointer exists
    if (!crosshair || !ref.current || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const el = ref.current; let raf = 0, last = null;
    const move = e => { last = e; if (!raf) raf = requestAnimationFrame(() => { raf = 0; const r = el.getBoundingClientRect(); const x = last.clientX - r.left, y = last.clientY - r.top; el.style.setProperty('--cx', x + 'px'); el.style.setProperty('--cy', y + 'px'); setXy([Math.round(x * 720 / r.width), Math.round(y * 560 / r.height)]); }); };
    const leave = () => setXy(null);
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf); };
  }, [crosshair]);

  return (
    <figure className={'dwg' + (xy ? ' has-xy' : '')} data-step={step} ref={ref}>
      <svg viewBox="0 0 720 560" role="img" aria-label={`Drawing, sheet ${sheet.n} of ${SHEETS.length}: ${sheet.title}. ${sheet.note}.`}>
        <defs>
          <pattern id={hatchId} width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="1.2" /></pattern>
        </defs>
        {/* cluster boundary */}
        <g className="frame"><rect x="22" y="104" width="676" height="304" rx="2" /><text x="34" y="98" className="lbl">CLUSTER · dojo</text></g>
        {/* client and service */}
        <g className={'svc' + (sheet.svc ? ' on' : '')}>
          <text x="40" y="42" className="lbl">CLIENT</text><rect x="40" y="48" width="64" height="26" rx="2" className="box" /><text x="72" y="65" className="mono mid">curl</text>
          <path d={`M104 61H${G.svc.x - 16}`} className="wire flow" />
          <circle cx={G.svc.x} cy={G.svc.y + 9} r="16" className="box strong" /><text x={G.svc.x} y={G.svc.y + 13} className="mono mid">svc</text>
          <text x={G.svc.x + 24} y={G.svc.y + 4} className="lbl">SERVICE · web</text>
          {webOn.map(p => <line key={p.id + p.node + p.x + p.y} className="wire flow" x1={G.svc.x} y1={G.svc.y + 25} x2={p.x + 17} y2={p.y} />)}
        </g>
        {/* nodes */}
        {NODES.map((n, i) => {
          const down = sheet.down.includes(n.id); const x = G.nodeX[i];
          return (
            <g key={n.id} className={'node' + (down ? ' down' : '')}>
              <rect x={x} y={G.nodeY} width={G.nodeW} height={G.nodeH} rx="2" className="box strong" />
              {down && <rect x={x} y={G.nodeY} width={G.nodeW} height={G.nodeH} rx="2" fill={`url(#${hatchId})`} className="hatch" />}
              <line x1={x} y1={G.nodeY + 34} x2={x + G.nodeW} y2={G.nodeY + 34} className="rule" />
              <text x={x + 12} y={G.nodeY + 22} className="lbl tag">NODE</text><text x={x + 56} y={G.nodeY + 22} className="mono">{n.name}</text>
              <circle cx={x + G.nodeW - 16} cy={G.nodeY + 17} r="4.5" className={down ? 'led bad' : 'led ok'} />
              <text x={x + 12} y={G.nodeY + G.nodeH - 12 - groups(n.id).length * 15} className="lbl dim">{down ? 'NotReady' : `${counts[n.id]} pod${counts[n.id] === 1 ? '' : 's'}`}</text>
              {groups(n.id).map(([w, c], gi) => <g key={w}><text x={x + 12} y={G.nodeY + G.nodeH - 12 - (groups(n.id).length - 1 - gi) * 15} className="lbl tag">DEPLOYMENT</text><text x={x + 100} y={G.nodeY + G.nodeH - 12 - (groups(n.id).length - 1 - gi) * 15} className="mono">{w} ×{c}</text></g>)}
            </g>
          );
        })}
        {/* pods: always rendered, shown or hidden per sheet */}
        {pods.map((p, i) => {
          const pos = p.on ? { x: p.x, y: p.y } : slotPos(1, i); // hidden pods wait at a slot of the first worker
          return (
            <g key={p.id} className={`pod ${p.on ? 'on ' + tone(p.status) : 'off'}`} style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transitionDelay: p.on ? `${(i % 4) * 70}ms` : '0ms' }}
              onPointerEnter={() => p.on && setInfo(`${p.id} · ${p.node === 'w1' ? 'worker' : 'worker2'} · ${p.status}`)} onPointerLeave={() => setInfo(null)}>
              <rect width={G.slot} height={G.slot} rx="3" className="podbox" />
              <path d={cube} className="cube" transform="translate(0 0)" />
              {tone(p.status) === 'bad' && <path d="M9 9 25 25M25 9 9 25" className="cross" />}
            </g>
          );
        })}
        {/* annotations */}
        {sheet.callouts.map((c, i) => {
          const spec = { node: { x1: 120, y1: 390, x2: 120, y2: 426, tx: 40, ty: 440 }, frame: { x1: 640, y1: 104, x2: 640, y2: 92, tx: 372, ty: 98 }, pod: { x1: 291, y1: 216, x2: 200, y2: 428, tx: 40, ty: 440 }, svc: { x1: G.svc.x + 14, y1: G.svc.y, x2: G.svc.x + 40, y2: 28, tx: G.svc.x + 44, ty: 26 }, fail: { x1: 375, y1: 222, x2: 200, y2: 428, tx: 40, ty: 440 }, down: { x1: 300, y1: 390, x2: 150, y2: 428, tx: 40, ty: 440 } }[c.at];
          if (!spec) return null;
          return <g key={c.at + c.text} className={'callout ' + (c.tone || '')} style={{ animationDelay: `${300 + i * 150}ms` }}><path d={`M${spec.x1} ${spec.y1}L${spec.x2} ${spec.y2}`} className="leader" /><text x={spec.tx} y={spec.ty} className="note">{c.text}</text></g>;
        })}
        {/* the exported script */}
        <g className={'sheet-script' + (sheet.stamp ? ' on' : '')}>
          <rect x="396" y="112" width="288" height="284" rx="2" className="paper" /><text x="410" y="134" className="lbl tag">SETUP.SH</text>
          {SCRIPT_LINES.map((l, i) => <text key={i} x="410" y={160 + i * 26} className="mono sm">{l}</text>)}
          <g className="stamp" transform="translate(590 372) rotate(-9)"><rect x="-70" y="-22" width="140" height="44" rx="3" /><text x="0" y="6" className="stampt">VERIFIED</text></g>
        </g>
        {/* title block */}
        <g className="tb" transform="translate(396 438)"><rect width="304" height="104" className="box strong" /><line x1="0" y1="26" x2="304" y2="26" className="rule" /><line x1="0" y1="52" x2="304" y2="52" className="rule" /><line x1="0" y1="78" x2="304" y2="78" className="rule" /><line x1="214" y1="26" x2="214" y2="104" className="rule" />
          <text x="10" y="17" className="mono b">KUBEDOJO / SHEET {sheet.n} OF {SHEETS.length}</text>
          <text x="10" y="43" className="mono">{sheet.title}</text><text x="224" y="43" className="mono">REV {sheet.rev}</text>
          <text x="10" y="69" className="mono sm">{info || sheet.note}</text><text x="224" y="69" className="mono sm">{xy ? `X ${xy[0]}` : 'SCALE 1:1'}</text>
          <text x="10" y="95" className="mono sm">{`${pods.filter(p => p.on).length} pods · ${NODES.length - sheet.down.length}/${NODES.length} nodes`}</text><text x="224" y="95" className="mono sm">{xy ? `Y ${xy[1]}` : 'DWG 001'}</text></g>
      </svg>
      {crosshair && <><i className="xh xh-v" aria-hidden="true" /><i className="xh xh-h" aria-hidden="true" /></>}
    </figure>
  );
}
