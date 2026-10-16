import { store, useStore } from './store.js';
import { SYSTEM_NS } from './store.js';
import { MOD } from './Header.jsx';

/* The bottom bar answers "is something broken, and where?" at a glance: counts of pods by state for the cluster you are looking at. */
export default function StatusBar() {
  useStore();
  const sim = store.sim; const cl = store.viewCluster(); const cur = sim.currentCluster();
  let run = 0, pend = 0, fail = 0, done = 0;
  if (cl) for (const p of cl.res.pods) { if (SYSTEM_NS.includes(p.metadata.namespace) || p.metadata.deletionTimestamp) continue; const st = cl.podStatus(p); if (st === 'Running') run++; else if (st === 'Completed') done++; else if (/Err|Crash|Error|BackOff|OOM|Unknown|Evicted/.test(st)) fail++; else pend++; }
  const nodes = cl ? cl.nodes : []; const down = nodes.filter(n => !n.ready).length;
  return (
    <footer id="statusbar" role="contentinfo">
      <span className={'sb-ctx ' + (cur && cur.tool === 'gke' ? 'prod' : '')} title="The cluster you are looking at">{cl ? `${cl.tool} · ${cl.id.length > 26 ? cl.id.slice(0, 24) + '…' : cl.id}` : 'no cluster'}</span>
      {cl && <span className="sb-sep" aria-hidden="true" />}
      {cl && <span className={'sb-n ' + (down ? 'bad' : '')} title="Nodes ready"><i className="sb-dot ok" />{nodes.length - down}/{nodes.length} nodes</span>}
      {cl && <span className="sb-n ok" title="Pods running"><i className="sb-dot ok" />{run} running</span>}
      {cl && <span className={'sb-n ' + (pend ? 'warn' : 'dim')} title="Pods starting or pending"><i className="sb-dot warn" />{pend} pending</span>}
      {cl && <span className={'sb-n ' + (fail ? 'bad' : 'dim')} title="Pods failing (ImagePullBackOff, CrashLoopBackOff, OOMKilled…)"><i className="sb-dot bad" />{fail} failing</span>}
      {cl && done > 0 && <span className="sb-n dim" title="Pods completed"><i className="sb-dot done" />{done} done</span>}
      <span className="sp" />
      <span className="sb-keys"><kbd>Tab</kbd> accept suggestion <kbd>Ctrl-C</kbd> stop <kbd>{MOD}⇧P</kbd> commands</span>
      <span className="sr-only" aria-live="polite">{fail ? `${fail} pods failing` : ''}</span>
    </footer>
  );
}
