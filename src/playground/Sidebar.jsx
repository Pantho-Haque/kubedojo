import { memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PG from '../engine/engine.js';
import { store } from './store.js';
import { selText } from './term.js';
import { hintFor } from './academyHints.js';

/* The guide: ~240 ready-made commands. Click puts one on the prompt, ▶ runs it (multi-line ones always run).
   The filter box narrows every section at once. */
function Sidebar() {
  const [q, setQ] = useState(''); const [hints, setHints] = useState({}); // which sections have their Academy hint open
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const sections = useMemo(() => PG.GUIDE.map(sec => ({ sec, items: words.length ? sec.items.filter(([label, cmd]) => words.every(w => (label + ' ' + cmd + ' ' + sec.t).toLowerCase().includes(w))) : sec.items })).filter(x => x.items.length), [q]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <aside id="side">
      <div className="hd">Click a command to put it on the prompt (multi-line ones run). <b>▶</b> runs it. Any order: each command stands on its own.</div>
      <input className="gfilter" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Filter the guide…" aria-label="Filter the guide" spellCheck={false} autoComplete="off" />
      <div id="guide">
        {sections.map(({ sec, items }) => (
          <details key={sec.t + (words.length ? '*' : '')} open={words.length || hints[sec.t] ? true : (sec.open || undefined)}>
            <summary>{sec.t}{hintFor(sec.t) && <button type="button" className="ghint" aria-expanded={!!hints[sec.t]} aria-label={`Why? What “${sec.t}” is about, with Academy lessons`} title="Why? Learn it in the Academy" onClick={e => { e.preventDefault(); e.stopPropagation(); setHints(h => ({ ...h, [sec.t]: !h[sec.t] })); }}>?</button>}</summary>
            {hints[sec.t] && (() => { const h = hintFor(sec.t); return (
              <div className="ghintbox" role="note">{h.text}<ul>{h.links.map(([label, href]) => <li key={href}><Link to={href} target="_blank" rel="noopener">{label}<span aria-hidden="true"> ↗</span><span className="sr-only"> (Academy lesson, opens in a new tab)</span></Link></li>)}</ul></div>
            ); })()}
            {items.map(([label, cmd]) => {
              const multi = cmd.includes('\n'); const n = cmd.split('\n').length;
              return (
                <div className="gi" key={label + cmd}>
                  <div className="gl">{label}</div>
                  <div className="gc"><code onClick={e => { if (selText()) return; store.setPane('term'); store.runInTerm(cmd, e.shiftKey); }}>{multi ? cmd.split('\n')[0] + (n > 1 ? '  … (' + n + ' lines)' : '') : cmd}</code><button className="run" title="run" aria-label={`Run: ${label}`} onClick={() => { store.setPane('term'); store.runInTerm(cmd, true); }}>▶</button></div>
                </div>
              );
            })}
          </details>
        ))}
        {!sections.length && <p className="gnone">No command matches “{q}”.</p>}
      </div>
    </aside>
  );
}
export default memo(Sidebar); // only its own filter state redraws it, never the simulator ticks
