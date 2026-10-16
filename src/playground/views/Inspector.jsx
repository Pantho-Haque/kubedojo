import PG from '../../engine/engine.js';
import { store } from '../store.js';

/* The describe / YAML panel that opens when you click a pod, node, workload, Service or Ingress */
export default function Inspector() {
  const { inspect, sim } = store; if (!inspect) return null; const cl = sim.clusters[inspect.cl]; if (!cl) return null;
  let o = null; if (inspect.k === 'nodes') { const n = cl.nodeByName(inspect.n); o = n && PG.nodeObj(cl, n); } else o = cl.find(inspect.k, inspect.n, inspect.ns);
  const close = () => { store.inspect = null; store.bump(); };
  if (!o) return <div className="insp"><button className="close" onClick={close}>×</button><div className="dim">{inspect.n} no longer exists</div></div>;
  const txt = inspect.mode === 'yaml' ? PG.yaml.dump(PG.cleanForOutput(cl, inspect.k, o)) : (PG.DESC[inspect.k] ? PG.DESC[inspect.k](cl, o) : PG.yaml.dump(PG.cleanForOutput(cl, inspect.k, o)));
  const mode = m => () => { inspect.mode = m; store.bump(); };
  return (
    <div className="insp">
      <div className="ih"><b>{PG.KINDS[inspect.k].kind} {inspect.n}</b><button className={inspect.mode !== 'yaml' ? 'on' : ''} onClick={mode('describe')}>describe</button><button className={inspect.mode === 'yaml' ? 'on' : ''} onClick={mode('yaml')}>yaml</button><button className="close" onClick={close}>×</button></div>
      <pre>{txt}</pre>
    </div>
  );
}
