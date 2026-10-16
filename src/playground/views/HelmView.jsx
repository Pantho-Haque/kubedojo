import PG from '../../engine/engine.js';
import { store } from '../store.js';
import { KindTag, Led, VSection } from '../viz/ui.jsx';
import { useGhosts } from '../viz/hooks.js';

export default function HelmView() {
  const cl = store.sim.currentCluster();
  const rels = cl ? Object.values(cl.helm.releases) : []; const rows = useGhosts(rels, r => r.name, 460);
  if (!cl) return <div className="empty"><p className="dim">No cluster selected.</p></div>;
  const tid = (() => { const dep = cl.find('deployments', 'tiller-deploy', 'kube-system'); if (!dep) return null; return { dep, ready: cl.matchPods('kube-system', dep.spec.selector).some(p => cl.podReady(p)), img: dep.spec.template.spec.containers[0].image, sa: dep.spec.template.spec.serviceAccountName || 'default' }; })();
  return <div className="cv">
    <VSection kind="Tiller" title="Tiller" hint="Helm 2's server, running in the cluster">
      {tid ? <div className={'tiller ' + (tid.ready ? 'ok' : 'bad')}><Led tone={tid.ready ? 'ok' : 'bad'} pulse={tid.ready} /><div><b>{tid.ready ? 'ready' : 'not ready'}</b><div className="dim">image <code>{tid.img}</code> · runs as ServiceAccount <b>{tid.sa}</b></div></div></div>
        : <div className="empty"><p className="dim">Not installed in this cluster.</p><div className="empty-actions"><button className="go" onClick={() => { store.setPane('term'); store.runInTerm('helm2 init --service-account tiller', false); }}>Put “helm2 init” on the prompt</button></div></div>}
    </VSection>
    <VSection kind="Release" title="Releases" count={rels.length} hint="installed charts and their revisions">
      {!rows.length && <p className="dim">None yet. <code>helm2 install myapp --name demo --namespace web</code></p>}
      <div className="rels">
        {rows.map(rw => {
          const r = rw.item; const cur = r.revs[r.revs.length - 1];
          return (
            <div className={'rel' + (rw.fresh ? ' enter' : '') + (rw.leaving ? ' leaving' : '')} key={rw.key}>
              <div className="rel-h"><KindTag kind="Release" /><b>{r.name}</b><span className="tag">ns {r.namespace}</span><span className={'tag ' + (cur.status === 'DEPLOYED' ? 'g' : 'r')}>{cur.status}</span><span className="dim">{cur.chart}-{cur.version}</span></div>
              <ol className="timeline">{r.revs.map(v => <li key={v.rev} className={(v.status === 'DEPLOYED' ? 'on' : '') + ' ' + (v.status === 'FAILED' ? 'fail' : '')} title={v.description}><i /><span>v{v.rev}</span><em>{v.status.toLowerCase()}</em></li>)}</ol>
              <div className="rel-objs">{cur.objs.map(o => <KindTag key={o.plural + o.name} kind={PG.KINDS[o.plural].kind} label={PG.KINDS[o.plural].kind + '/' + o.name} size={12} />)}</div>
            </div>
          );
        })}
      </div>
    </VSection>
    <VSection kind="File" title="Chart in ~/myapp" hint="edit, then helm2 template">
      <p className="dim">Edit <code>values.yaml</code> or any template in the <b>Files</b> tab, then run <code>helm2 template myapp --name demo</code> to see the change.</p>
    </VSection>
  </div>;
}
