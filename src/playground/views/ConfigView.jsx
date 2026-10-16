import { store, SYSTEM_NS } from '../store.js';
import { KindTag, Led, VSection } from '../viz/ui.jsx';
import { useGhosts } from '../viz/hooks.js';

export default function ConfigView() {
  const sim = store.sim; const kc = sim.kubeconfig; const cl = sim.currentCluster();
  const ctxRows = useGhosts(kc.contexts, c => c.name, 440);
  let access = null;
  if (cl) {
    const subs = []; const add = (kind, name, ns) => { const k = kind + '|' + name + '|' + (ns || ''); if (!subs.find(s => s.k === k)) subs.push({ k, kind, name, ns }); };
    for (const b of [...cl.res.rolebindings, ...cl.res.clusterrolebindings]) for (const s of b.subjects || []) add(s.kind, s.name, s.namespace);
    const nss = cl.res.namespaces.map(n => n.metadata.name).filter(n => !SYSTEM_NS.includes(n));
    const checks = [['get', 'pods', 'r'], ['create', 'deployments', 'w'], ['get', 'secrets', 's'], ['delete', 'pods', 'd']];
    const idOf = s => s.kind === 'User' ? { user: s.name, groups: [] } : s.kind === 'Group' ? { user: '', groups: [s.name] } : { user: `system:serviceaccount:${s.ns}:${s.name}`, groups: [] };
    access = <VSection kind="ServiceAccount" title={`Access matrix · ${cl.id}`} count={subs.length} hint="who may do what, per namespace">
      <p className="dim">Computed from Roles and bindings by the same rules <code>kubectl auth can-i</code> uses.</p>
      {!subs.length ? <p className="dim">No bindings yet. Try the RBAC section in the guide.</p> : <>
        <div className="mx-wrap"><table className="tb mx"><tbody>
          <tr><th>Subject</th>{nss.map(n => <th key={n}>{n}</th>)}</tr>
          {subs.map((s, si) => <tr key={s.k}><td><KindTag kind={s.kind === 'ServiceAccount' ? 'ServiceAccount' : 'Context'} label={s.kind} /> <b>{s.name}</b>{s.ns ? <span className="dim"> ({s.ns})</span> : null}</td>{nss.map((n, ni) => <td key={n}>{checks.map(([v, r, l], ci) => <span key={l} className={'ck ' + (cl.authorize(idOf(s), v, r, n) ? 'y' : 'n')} style={{ animationDelay: (si * 40 + ni * 30 + ci * 25) + 'ms' }} title={v + ' ' + r}>{l}</span>)}</td>)}</tr>)}
        </tbody></table></div>
        <p className="dim">r = get pods · w = create deployments · s = get secrets · d = delete pods &nbsp; green = allowed</p>
      </>}
    </VSection>;
  }
  return <div className="cv">
    <VSection kind="Context" title="kubeconfig · contexts" count={kc.contexts.length} hint="which cluster, as which user, in which namespace">
      <div className="ctxgrid">
        {ctxRows.map(r => {
          const c = r.item; const u = sim.userEntry(c.user); const k = sim.clusters[c.cluster]; const a = u ? u.auth : { kind: '?' }; const cur = c.name === kc.current;
          return (
            <div className={'ctxc' + (cur ? ' cur' : '') + (r.fresh ? ' enter' : '') + (r.leaving ? ' leaving' : '')} key={r.key}>
              <div className="cx-h"><Led tone={k ? (k.apiUp() ? 'ok' : 'bad') : 'done'} pulse={cur && !!k} /><b>{c.name}</b>{cur && <span className="star" title="current context">★ current</span>}{k && k.tool === 'gke' && <span className="tag prodtag">PRODUCTION</span>}</div>
              <dl>
                <dt>cluster</dt><dd>{c.cluster}{sim.clusterEntry(c.cluster) ? '' : <> <span className="badc">missing</span></>}</dd>
                <dt>user</dt><dd>{c.user}{u ? '' : <> <span className="badc">missing</span></>}</dd>
                <dt>namespace</dt><dd>{c.namespace || 'default'}</dd>
                <dt>auth</dt><dd>{a.kind === 'cert' ? 'cert CN=' + a.cn + (a.groups.length ? ' O=' + a.groups.join(',') : '') : a.kind === 'token' ? 'token' : a.kind}</dd>
                <dt>status</dt><dd>{k ? (k.apiUp() ? <span className="okc">API up</span> : <span className="badc">API down</span>) : <span className="badc">cluster gone</span>}</dd>
              </dl>
            </div>
          );
        })}
      </div>
      <p className="dim">current-context: <b>{kc.current || '(not set)'}</b></p>
    </VSection>
    {access}
  </div>;
}
