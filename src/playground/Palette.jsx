import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PG from '../engine/engine.js';
import { store } from './store.js';
import Icon from './Icon.jsx';

const VIEWS = [['cluster', 'Cluster'], ['docker', 'Docker'], ['config', 'Config & access'], ['helm', 'Helm'], ['files', 'Files'], ['log', 'Events']];

function items(navigate) {
  const a = [];
  const act = (label, hint, run, icon) => a.push({ kind: 'action', group: 'Action', label, hint, run, icon });
  act('Start the guided tour', '', () => store.startTour(0), 'play');
  act('Export this cluster as a setup script', '', () => { store.exportOpen = true; store.bump(); }, 'download');
  act('New terminal tab', '', () => store.addTerm(), 'plus');
  act('Clear the terminal', '⌘K', () => { if (store.active) store.active.clear(); }, 'clear');
  act('Show or hide the guide', '', () => store.toggleSide(), 'sidebar');
  act('Reset the simulated world', '', () => { if (window.confirm('Throw away the simulated clusters and start over?\n\nYour files are kept (they live in this browser).')) store.reset(); }, 'reset');
  act('Reset the pane sizes', '', () => store.resetLayout(), 'sidebar');
  act('List supported commands (help)', '', () => store.runInTerm('help', true), 'help');
  act('Go to the KubeDojo home page', '', () => navigate('/'), 'home');
  act('Read the guides (blog)', '', () => navigate('/blog'), 'book');
  for (const [id, label] of VIEWS) a.push({ kind: 'action', group: 'View', label: 'Show ' + label, hint: '', icon: id === 'files' ? 'file' : 'cluster', run: () => { store.setViz(id); store.setPane('viz'); } });
  for (const sec of PG.GUIDE) for (const [label, cmd] of sec.items) a.push({ kind: 'command', group: sec.t.replace(/^\w+ · /, ''), label, cmd, icon: 'terminal' });
  return a;
}
const rank = (q, it) => { // every word must appear somewhere; earlier and in-label matches rank higher
  const hay = (it.label + ' ' + (it.cmd || '') + ' ' + it.group).toLowerCase(); let s = 0;
  for (const w of q) { const i = hay.indexOf(w); if (i < 0) return -1; s += i + (it.label.toLowerCase().includes(w) ? 0 : 40); }
  return s;
};

export default function Palette() {
  const navigate = useNavigate(); const all = useMemo(() => items(navigate), [navigate]);
  const [q, setQ] = useState(''); const [sel, setSel] = useState(0); const list = useRef(null);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = useMemo(() => { if (!words.length) return all.filter(x => x.kind === 'action').concat(all.filter(x => x.kind === 'command').slice(0, 14)); return all.map(x => [rank(words, x), x]).filter(([r]) => r >= 0).sort((x, y) => x[0] - y[0]).slice(0, 40).map(([, x]) => x); }, [q, all]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { const el = list.current && list.current.children[sel]; if (el) el.scrollIntoView({ block: 'nearest' }); }, [sel]);
  const choose = (it, run) => {
    store.closePalette();
    if (it.kind === 'action') { it.run(); return; }
    store.setPane('term'); store.runInTerm(it.cmd, run || it.cmd.includes('\n'));
  };
  const onKey = e => {
    if (e.key === 'Escape') { e.preventDefault(); store.closePalette(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(shown.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
    else if (e.key === 'Enter' && shown[sel]) { e.preventDefault(); choose(shown[sel], e.shiftKey); }
  };
  return (
    <div id="palette" onMouseDown={e => { if (e.target === e.currentTarget) store.closePalette(); }}>
      <div className="pal-card" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="pal-in"><Icon name="search" size={16} /><input autoFocus value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search guide commands and actions…" spellCheck={false} autoComplete="off" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-activedescendant={shown[sel] ? 'pal-' + sel : undefined} /></div>
        <ul id="pal-list" ref={list} role="listbox">
          {shown.map((it, i) => (
            <li key={it.kind + it.label + (it.cmd || '')} id={'pal-' + i} role="option" aria-selected={i === sel} className={i === sel ? 'on' : ''} onMouseMove={() => setSel(i)} onClick={() => choose(it)}>
              <Icon name={it.icon} size={15} /><span className="pl-main"><span className="pl-label">{it.label}</span>{it.cmd && <code>{it.cmd.split('\n')[0]}{it.cmd.includes('\n') ? ' …' : ''}</code>}</span><span className="pl-group">{it.hint || it.group}</span>
            </li>
          ))}
          {!shown.length && <li className="pal-empty" role="presentation">Nothing matches “{q}”. Try a tool name: kind, helm, rbac, probe…</li>}
        </ul>
        <div className="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> put on the prompt</span><span><kbd>Shift</kbd>+<kbd>Enter</kbd> run it</span><span><kbd>Esc</kbd> close</span></div>
      </div>
    </div>
  );
}
