import { useEffect, useMemo, useRef, useState } from 'react';
import PG from '../engine/engine.js';
import { store } from './store.js';

/* ⇩ Script: reads the cluster of the CURRENT kubectl context and writes a bash script that builds the same thing for real. */
export default function ExportModal() {
  const sim = store.sim; const cl = sim.currentCluster();
  const defaults = useMemo(() => PG.buildScript(sim, {}).stats.defaults || { tool: 'kind', name: '' }, [sim]);
  const [tool, setTool] = useState(defaults.tool); const [name, setName] = useState(defaults.name);
  const [waits, setWaits] = useState(true); const [strict, setStrict] = useState(true); const [secrets, setSecrets] = useState(true);
  const built = useMemo(() => PG.buildScript(sim, { tool, name: name.trim() || undefined, waits, strict, secrets }), [sim, tool, name, waits, strict, secrets]);
  const [text, setText] = useState(built.script); const [msg, setMsg] = useState(''); const ta = useRef(null);
  useEffect(() => { setText(built.script); setMsg(''); }, [built]); // changing an option regenerates the script (your manual edits are replaced)
  const close = () => { store.exportOpen = false; store.bump(); if (store.active) store.active.focus(); };
  useEffect(() => { const k = e => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', k, true); return () => document.removeEventListener('keydown', k, true); }, []);
  const st = built.stats;
  const copy = () => { ta.current.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (er) { } if (!ok && navigator.clipboard) navigator.clipboard.writeText(ta.current.value).then(() => { }, () => { }); setMsg(' copied ✓'); };
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/x-shellscript' })); a.download = 'setup.sh'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); setMsg(' saved as setup.sh (run: bash setup.sh)'); };
  return (
    <div id="export" onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="ex-card">
        <div className="ex-h"><b>⇩ Script for a real machine</b><button id="ex-x" onClick={close}>Close ✕</button></div>
        <div className="ex-note" id="ex-src">{cl
          ? <>Built from the cluster in your <b>current context</b>, <code>{cl.entry}</code> ({cl.tool}), exactly as it is now: its {st.nodes} node{st.nodes === 1 ? '' : 's'} (with labels and taints) and every object you or Helm created, as YAML. Switch context (<code>kubectl config use-context …</code>) and reopen this to export another cluster. The script creates a real <b>{tool}</b> cluster and applies everything into it, and refuses to run unless kubectl points at that new cluster. <b>Read it, edit it below if you like, then run it on your computer</b> (<code>bash setup.sh</code>, Docker running).</>
          : 'There is no cluster in the current context. Create one, or switch context, then reopen this.'}</div>
        <div className="ex-opts">
          <label>build with <select id="ex-tool" value={tool} onChange={e => setTool(e.target.value)}><option value="kind">kind</option><option value="k3d">k3d</option></select></label>
          <label>cluster name <input id="ex-name" size={22} spellCheck={false} value={name} onChange={e => setName(e.target.value)} /></label>
          <label><input type="checkbox" id="ex-waits" checked={waits} onChange={e => setWaits(e.target.checked)} /> wait for deployments to be ready</label>
          <label><input type="checkbox" id="ex-strict" checked={strict} onChange={e => setStrict(e.target.checked)} /> stop at the first error</label>
          <label><input type="checkbox" id="ex-secrets" checked={secrets} onChange={e => setSecrets(e.target.checked)} /> include Secrets (values are written into the script)</label>
        </div>
        <div className="ex-stat" id="ex-stat">{st.empty ? null : <>
          {Object.entries(st.counts).map(([k, v]) => v + ' ' + k).join(' · ') || <b style={{ color: '#f4b740' }}>no user-made objects yet</b>}
          {st.left.length > 0 && <details><summary>left out</summary>{st.left.map((l, n) => <div key={n}>{l}</div>)}</details>}</>}</div>
        <textarea id="ex-ta" ref={ta} spellCheck={false} value={text} onChange={e => setText(e.target.value)}></textarea>
        <div className="ex-f"><button id="ex-copy" onClick={copy}>Copy</button><button id="ex-dl" className="go" onClick={download}>Download setup.sh</button><span id="ex-msg" className="dim">{msg}</span></div>
      </div>
    </div>
  );
}
