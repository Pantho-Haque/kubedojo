import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import PG from '../../engine/engine.js';
import { store, FS_KEY } from '../store.js';
import { selText } from '../term.js';
import { hlText } from '../highlight.js';
import { KindIcon } from '../viz/kinds.jsx';

const shown = p => p.replace('/home/user/', '~/');

// files as a folder tree (home first), folders open by default
function buildTree(paths) {
  const root = { dirs: new Map(), files: [] };
  for (const p of paths) { const home = p.startsWith('/home/user/'); const segs = (home ? p.slice(11) : p).split('/').filter(Boolean); let n = home ? (root.dirs.get('~') || root.dirs.set('~', { dirs: new Map(), files: [], path: '~' }).get('~')) : (root.dirs.get('/') || root.dirs.set('/', { dirs: new Map(), files: [], path: '/' }).get('/')); for (const s of segs.slice(0, -1)) { if (!n.dirs.has(s)) n.dirs.set(s, { dirs: new Map(), files: [], path: n.path + '/' + s }); n = n.dirs.get(s); } n.files.push({ name: segs[segs.length - 1], full: p }); }
  return root;
}
const count = n => n.files.length + [...n.dirs.values()].reduce((a, d) => a + count(d), 0);
function TreeNode({ name, node, depth, closed, toggle, openFile }) {
  const shut = closed.has(node.path);
  return (
    <div className="tdir">
      <button type="button" className={'trow dir' + (shut ? ' shut' : '')} style={{ paddingLeft: 6 + depth * 14 }} aria-expanded={!shut} onClick={() => toggle(node.path)}><svg className="chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg><KindIcon kind="Folder" size={14} /><span>{name}</span><em>{count(node)}</em></button>
      {!shut && <div className="tkids">{[...node.dirs.entries()].sort().map(([n, d]) => <TreeNode key={d.path} name={n} node={d} depth={depth + 1} closed={closed} toggle={toggle} openFile={openFile} />)}
        {node.files.sort((a, b) => a.name.localeCompare(b.name)).map(f => <div key={f.full} className={'f trow file ' + (f.full === openFile ? 'on' : '')} style={{ paddingLeft: 26 + depth * 14 }} title={f.full} onClick={() => { if (selText()) return; store.openFile = f.full; store.bump(); }}><KindIcon kind="File" size={13} /><span>{f.name}</span></div>)}</div>}
    </div>
  );
}

/* Editor with line numbers and colours behind the textarea; Tab = 2 spaces, Enter keeps the indent, Cmd/Ctrl-S saves.
   Unsaved edits are kept while the simulator redraws; they only follow the file if it changes underneath you while you have no edits. */
function FileEditor({ path }) {
  const sim = store.sim; const fsText = sim.fs.read(path) || '';
  const [text, setText] = useState(fsText); const [msg, setMsg] = useState('');
  const synced = useRef(fsText); const hl = useRef(null), gut = useRef(null), ta = useRef(null);
  useEffect(() => { if (fsText !== synced.current) // eslint-disable-line react-hooks/exhaustive-deps -- follows the file after every redraw, on purpose
 { if (text === synced.current) setText(fsText); synced.current = fsText; } });
  const sync = () => { const t = ta.current; if (!t) return; hl.current.scrollTop = t.scrollTop; hl.current.scrollLeft = t.scrollLeft; gut.current.scrollTop = t.scrollTop; };
  useLayoutEffect(sync, [text]);
  const save = value => { sim.fs.write(path, value); synced.current = value; setMsg(' saved ✓'); };
  const onKeyDown = e => {
    const t = e.currentTarget;
    if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); document.execCommand('insertText', false, '  '); }
    else if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) { const v = t.value, p = t.selectionStart; const ls = v.lastIndexOf('\n', p - 1) + 1; const ind = /^[ \t]*/.exec(v.slice(ls, p))[0]; e.preventDefault(); document.execCommand('insertText', false, '\n' + ind); }
    else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(t.value); }
  };
  const n = text.split('\n').length; let nums = ''; for (let i = 1; i <= n; i++) nums += i + '\n';
  return <>
    <div className="fh"><b>{shown(path)}</b><button id="savefile" onClick={() => { if (selText()) return; save(text); }}>Save</button><button id="rmfile" onClick={() => { sim.fs.remove(path); store.openFile = null; store.bump(); }}>Delete</button><span id="savemsg" className="dim">{msg}</span></div>
    <div className="ed">
      <div className="gut" id="fgut" ref={gut}>{nums}</div>
      <div className="edin">
        <pre className="hl" id="fhl" aria-hidden="true" ref={hl} dangerouslySetInnerHTML={{ __html: hlText(text, path) + '\n' }}></pre>
        <textarea id="fta" ref={ta} wrap="off" spellCheck={false} value={text} onChange={e => setText(e.target.value)} onScroll={sync} onKeyDown={onKeyDown}></textarea>
      </div>
    </div>
  </>;
}

export default function FilesView() {
  const sim = store.sim; const { fsStatus, fsBytes, openFile } = store; const files = Object.keys(sim.fs.files).sort(); const newfile = useRef(null);
  const [closed, setClosed] = useState(() => new Set()); const toggle = p => setClosed(s => { const n = new Set(s); if (n.has(p)) n.delete(p); else n.add(p); return n; }); const tree = buildTree(files);
  const mk = () => { let p = newfile.current.value.trim(); if (!p) return; p = sim.fs.norm(p.replace(/^~/, '/home/user'), '/home/user'); sim.fs.write(p, ''); store.openFile = p; store.bump(); };
  return (
    <div className="files">
      <div className="flist">
        <div className={'fsstat ' + fsStatus}>{fsStatus === 'ok' ? '💾 saved in this browser (' + Math.max(1, Math.round(fsBytes / 1024)) + ' KB)' : fsStatus === 'toobig' ? '⚠ too big to save (limit ≈ 4 MB)' : fsStatus === 'unavailable' ? '⚠ browser storage is unavailable here — files are lost on reload' : '…'}</div>
        <div className="dim">click a file to edit</div>
        <div className="ftree" role="tree">{[...tree.dirs.entries()].sort((a, b) => (a[0] === '~' ? -1 : b[0] === '~' ? 1 : 0)).map(([n, d]) => <TreeNode key={d.path} name={n === '~' ? '~ (home)' : n} node={d} depth={0} closed={closed} toggle={toggle} openFile={openFile} />)}</div>
        <div className="newf"><input id="newfile" ref={newfile} placeholder="~/new-file.yaml" spellCheck={false} onKeyDown={e => { if (e.key === 'Enter') mk(); }} /><button id="mkfile" onClick={mk}>+</button></div>
        <div className="fbtns">
          <button id="restorefiles" title="re-create the example chart files that are missing (never overwrites yours)" onClick={() => { const n = PG.seedChart(sim, true); if (store.active) store.active.print(n ? `(restored ${n} missing example file(s) in ~/myapp)` : '(no example files were missing)', 'dim'); store.bump(); }}>Restore example chart</button>
          <button id="wipefiles" title="delete ALL your files and start from the examples" onClick={() => { if (window.confirm('Delete ALL files you created or edited (and restore the examples)? The simulated cluster world restarts too.')) { try { localStorage.removeItem(FS_KEY); } catch (er) { } store.reset(); } }}>Wipe all my files</button>
        </div>
      </div>
      <div className="fedit">
        {openFile ? <FileEditor key={openFile} path={openFile} /> : <p className="dim">Open a file. Everything you create with <code>cat &gt; file &lt;&lt;'EOF'</code> shows up here too.</p>}
      </div>
    </div>
  );
}
