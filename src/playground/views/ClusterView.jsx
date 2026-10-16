import { Fragment } from 'react';
import PG from '../../engine/engine.js';
import { store, nsColor, SYSTEM_NS } from '../store.js';
import { selText } from '../term.js';
import { KindIcon, KindTag, Led, Meter, VSection } from '../viz/ui.jsx';
import { useFlash, useGhosts } from '../viz/hooks.js';

const statusClass = st => ({ Running: 'ok', Completed: 'done', Pending: 'warn', ContainerCreating: 'warn', Terminating: 'dying', Unknown: 'bad' }[st] || (/Err|Crash|Error|BackOff|OOM/.test(st) ? 'bad' : 'warn'));
const shortPod = p => { const o = p.metadata._owner; if (o && o.kind === 'ReplicaSet') return o.name.replace(/-[a-z0-9]{6,10}$/, '') + '·' + p.metadata.name.slice(-5); if (o && o.kind === 'DaemonSet') return o.name + '·' + p.metadata.name.slice(-5); if (o && o.kind === 'Job') return o.name.slice(-14) + '·' + p.metadata.name.slice(-4); return p.metadata.name.length > 22 ? p.metadata.name.slice(0, 20) + '…' : p.metadata.name; };
// who owns a pod, for grouping: Deployment (through its ReplicaSet), DaemonSet, Job, or a bare Pod
const ownerOf = p => { const o = p.metadata._owner; const ns = p.metadata.namespace; if (!o) return { kind: 'Pod', name: 'bare pods', ns, key: 'Pod/' + ns }; if (o.kind === 'ReplicaSet') { const n = o.name.replace(/-[a-z0-9]{6,10}$/, ''); return { kind: 'Deployment', name: n, ns, key: 'Deployment/' + ns + '/' + n }; } return { kind: o.kind, name: o.name, ns, key: o.kind + '/' + ns + '/' + o.name }; };
const inspectOnClick = (k, ns, n) => e => { if (selText()) return; e.stopPropagation(); store.inspectItem(k, ns, n); };
const setHover = nv => { const h = store.hoverSvc; if ((nv && !h) || (!nv && h) || (nv && h && nv.ns + JSON.stringify(nv.sel) !== h.ns + JSON.stringify(h.sel))) { store.hoverSvc = nv; store.bump(); } };

function PodTile({ cl, p, leaving, fresh }) {
  const sim = store.sim; const st = cl.podStatus(p); const ns = p.metadata.namespace; const flash = useFlash(st) || store.podAnim(p.metadata.uid, st) === 'flash';
  const h = store.hoverSvc; const hl = h && h.sel && PG.selMatch(h.sel, p.metadata.labels) && h.ns === ns ? ' hl' : '';
  const tr = sim.lastTrace && sim.clock - sim.lastTrace.t < 6 && sim.lastTrace.steps.some(s => s.kind === 'pod' && s.name === p.metadata.name) ? ' traffic' : '';
  const title = ns + '/' + p.metadata.name + '\n' + st + (p._sim.restarts ? ' (restarts: ' + p._sim.restarts + ')' : '') + (p.status.podIP ? '\n' + p.status.podIP : '') + '\nimage: ' + p.spec.containers[0].image;
  return (
    <div className={`pod ${statusClass(st)}${fresh ? ' enter' : ''}${leaving ? ' leaving' : ''}${flash ? ' flash' : ''}${hl}${tr}`} style={{ borderLeftColor: nsColor(ns) }} title={title} onClick={leaving ? undefined : inspectOnClick('pods', ns, p.metadata.name)}>
      <span className="pico"><KindIcon kind="Pod" size={15} /></span>
      <span className="ptxt"><b>{shortPod(p)}</b><i>{st}</i></span>
    </div>
  );
}

function PodGroups({ cl, pods, empty }) {
  const rows = useGhosts(pods, p => p.metadata.uid, 440);
  const groups = new Map(); for (const r of rows) { const o = ownerOf(r.item); if (!groups.has(o.key)) groups.set(o.key, { o, rows: [] }); groups.get(o.key).rows.push(r); }
  if (!groups.size) return <div className="pods-empty">{empty}</div>;
  return <>{[...groups.values()].map(({ o, rows: rs }) => (
    <div className="grp" key={o.key}>
      <div className="grp-h"><KindTag kind={o.kind} /><b>{o.name}</b><span className="nspill" style={{ '--c': nsColor(o.ns) }}>{o.ns}</span><span className="grp-n">{rs.filter(r => !r.leaving).length}</span></div>
      <div className="pods">{rs.map(r => <PodTile key={r.key} cl={cl} p={r.item} leaving={r.leaving} fresh={r.fresh} />)}</div>
    </div>
  ))}</>;
}

function NodeCard({ cl, n, visible, fresh, leaving }) {
  const pods = cl.res.pods.filter(p => p.spec.nodeName === n.name && visible(p.metadata.namespace));
  const total = cl.res.pods.filter(p => p.spec.nodeName === n.name).length;
  const custom = Object.entries(n.labels).filter(([k]) => !/^(kubernetes\.io|node-role|beta\.|node\.kubernetes|cloud\.google|topology)/.test(k));
  const short = n.name.replace(cl.id + '-', '').replace('k3d-' + cl.id + '-', '').replace(/^gke-prod-1-default-pool-/, '');
  const ready = n.ready;
  return (
    <div className={'node ' + (ready ? '' : 'down') + (fresh ? ' enter' : '') + (leaving ? ' leaving' : '')} onClick={leaving ? undefined : inspectOnClick('nodes', undefined, n.name)}>
      <div className="nh"><span className="nico"><KindIcon kind="Node" size={18} /></span><span className="nname"><b>{short}</b><KindTag kind="Node" /></span><Led tone={ready ? 'ok' : 'bad'} pulse={ready} /></div>
      <div className="nsub"><span className="tag">{n.role}</span><span className="dim ip">{n.ip}</span><span className="dim cnt">{total} pod{total === 1 ? '' : 's'}</span><Meter value={total} max={110} tone={total > 88 ? 'bad' : total > 60 ? 'warn' : 'ok'} label={`${total} of 110 pods`} /></div>
      <div className="nmeta">
        {custom.map(([k, v]) => <span className="lab" key={k}><em>label</em>{k.split('/').pop()}={v}</span>)}
        {n.taints.map((t, i) => <span className="taint" key={i}><em>taint</em>{t.key.split('/').pop()}{t.value ? '=' + t.value : ''}:{t.effect}</span>)}
        {n.unschedulable ? <span className="taint">cordoned</span> : null}{!ready ? <span className="taint">NotReady</span> : null}<span className="dim">{Object.keys(n.images).length} images</span>
      </div>
      <div className="npods"><PodGroups cl={cl} pods={pods} empty="no visible pods" /></div>
    </div>
  );
}

function HealthRing({ run, pend, fail, done }) {
  const total = run + pend + fail + done; const R = 30, C = 2 * Math.PI * R; const seg = (v, off) => ({ strokeDasharray: `${total ? (v / total) * C : 0} ${C}`, strokeDashoffset: -off });
  const a = total ? (run / total) * C : 0, b = total ? ((run + pend) / total) * C : 0, c = total ? ((run + pend + fail) / total) * C : 0;
  return (
    <svg className="ring" width="76" height="76" viewBox="0 0 76 76" role="img" aria-label={`${run} running, ${pend} pending, ${fail} failing, ${done} done`}>
      <circle cx="38" cy="38" r={R} className="ring-bg" />
      <circle cx="38" cy="38" r={R} className="ring-seg done" style={seg(done, c)} />
      <circle cx="38" cy="38" r={R} className="ring-seg bad" style={seg(fail, b)} />
      <circle cx="38" cy="38" r={R} className="ring-seg warn" style={seg(pend, a)} />
      <circle cx="38" cy="38" r={R} className="ring-seg ok" style={seg(run, 0)} />
      <text x="38" y="43" className="ring-n">{total}</text>
    </svg>
  );
}

function Kpi({ label, value, sub, tone = '' }) { return <div className={'kpi ' + tone}><span className="kpi-v" key={value}>{value}</span><span className="kpi-l">{label}</span>{sub && <span className="kpi-s">{sub}</span>}</div>; }

export default function ClusterView() {
  const sim = store.sim; const cl = store.viewCluster();
  const nodeRows = useGhosts(cl ? cl.nodes : [], n => n.name, 500);
  const depRows = useGhosts(cl ? cl.res.deployments.filter(d => !SYSTEM_NS.includes(d.metadata.namespace) || store.showSystem) : [], d => d.metadata.uid, 440);
  if (!cl) return (
    <div className="empty empty-cluster"><svg className="empty-art" viewBox="0 0 120 80" aria-hidden="true"><rect x="8" y="14" width="30" height="52" rx="3" /><rect x="45" y="14" width="30" height="52" rx="3" /><rect x="82" y="14" width="30" height="52" rx="3" /><path d="M16 26h14M53 26h14M90 26h14" /></svg>
      <h3>No cluster yet</h3><p>Nodes, pods and Services show up here as soon as you create a cluster. Pick one, and watch it appear.</p>
      <div className="empty-actions"><button className="go" onClick={() => { store.setPane('term'); store.runInTerm('kind create cluster --name local-cluster-1', true); }}>Create a kind cluster</button><button onClick={() => { store.setPane('term'); store.runInTerm('k3d cluster create local-cluster-1 --agents 2', true); }}>Create a k3d cluster</button><button onClick={() => store.startTour(0)}>Take the tour</button></div>
      <p><code>kind create cluster --name local-cluster-1</code></p></div>
  );
  const { showSystem, hiddenNs } = store; const cur = sim.currentCluster(); const isCur = cur === cl; const allNs = cl.res.namespaces.map(n => n.metadata.name);
  const visible = n => (showSystem || !SYSTEM_NS.includes(n)) && !hiddenNs.has(n);
  let run = 0, pend = 0, fail = 0, done = 0; for (const p of cl.res.pods) { if (!visible(p.metadata.namespace) || p.metadata.deletionTimestamp) continue; const st = cl.podStatus(p); if (st === 'Running') run++; else if (st === 'Completed') done++; else if (/Err|Crash|Error|BackOff|OOM|Unknown/.test(st)) fail++; else pend++; }
  const up = cl.nodes.filter(n => n.ready).length;

  const routes = [];
  for (const c of sim.containers) if (c.status === 'running') for (const p of c.ports) if (c.kind !== 'node' || p.container !== 6443) routes.push(<span className="route" key={c.name + p.host}>127.0.0.1:{p.host} → <b>{c.name.length > 26 ? '…' + c.name.slice(-24) : c.name}</b>:{p.container}</span>);
  sim.forwards.forEach((f, i) => { if (f.active) routes.push(<span className="route fw" key={'fw' + i}>:{f.local} ⇢ <b>{f.target}</b>:{f.remote} <i>(port-forward)</i></span>); });
  const orphans = cl.res.pods.filter(p => !p.spec.nodeName && visible(p.metadata.namespace));
  const dss = cl.res.daemonsets.filter(d => visible(d.metadata.namespace)); const cjs = cl.res.cronjobs.filter(d => visible(d.metadata.namespace)); const jobs = cl.res.jobs.filter(d => visible(d.metadata.namespace) && !d.metadata._owner);
  const svcs = cl.res.services.filter(s => visible(s.metadata.namespace) && !(s.metadata.namespace === 'default' && s.metadata.name === 'kubernetes'));
  const ings = cl.res.ingresses.filter(i => visible(i.metadata.namespace));
  const cms = cl.res.configmaps.filter(x => visible(x.metadata.namespace) && x.metadata.name !== 'kube-root-ca.crt'); const secs = cl.res.secrets.filter(x => visible(x.metadata.namespace) && !/service-account-token/.test(x.type || ''));
  const pvcs = cl.res.persistentvolumeclaims.filter(x => visible(x.metadata.namespace)); const sas = cl.res.serviceaccounts.filter(x => visible(x.metadata.namespace) && x.metadata.name !== 'default');
  const tr = sim.lastTrace && sim.clock - sim.lastTrace.t < 60 ? sim.lastTrace : null;
  const deps = depRows.filter(r => r.leaving || visible(r.item.metadata.namespace));

  return <div className="cv">
    <div className="cltabs">{store.clusterList().map(c => <button key={c.entry} className={'pill ' + (c === cl ? 'on' : '')} onClick={() => { if (selText()) return; store.selCluster = c.entry; store.bump(); }}>{c.tool.toUpperCase()} · {c.id.length > 22 ? c.id.slice(0, 20) + '…' : c.id}{c === cur ? ' ★' : ''}</button>)}</div>
    <div className={'clhead ' + (cl.tool === 'gke' ? 'prod' : '')}>
      <div className="clid">
        <span className="clico"><KindIcon kind="Context" size={22} /></span>
        <div className="clname"><b>{cl.id}</b>
          <div className="cltags"><span className="tag">{cl.tool}</span><span className="tag">{cl.k8sVersion}</span><span className="tag">context: {cl.entry}{isCur ? ' (current)' : ''}</span>
            <button className="cldel" title="puts the delete command for this cluster on the terminal prompt (you press Enter)" onClick={() => { if (selText()) return; if (store.active) { store.active.setValue(PG.deleteCommandFor(cl)); store.active.focus(); } }}>🗑 delete…</button></div>
          <div className="dim clapi">API {cl.api} {cl.apiUp() ? <span className="okc">● reachable</span> : <span className="badc">● UNREACHABLE (control-plane container stopped)</span>}</div>
        </div>
      </div>
      <div className="kpis">
        <HealthRing run={run} pend={pend} fail={fail} done={done} />
        <Kpi label="nodes ready" value={`${up}/${cl.nodes.length}`} tone={up < cl.nodes.length ? 'bad' : ''} />
        <Kpi label="running" value={run} tone="ok" /><Kpi label="pending" value={pend} tone={pend ? 'warn' : 'dim'} /><Kpi label="failing" value={fail} tone={fail ? 'bad' : 'dim'} />
      </div>
    </div>
    <div className="nschips">
      <span className="vlab"><KindIcon kind="Namespace" size={13} />Namespaces</span>
      <label className="chk"><input type="checkbox" id="showsys" checked={showSystem} onChange={e => { store.showSystem = e.target.checked; store.bump(); }} /> system</label>
      {allNs.filter(n => showSystem || !SYSTEM_NS.includes(n)).map(n => <button key={n} className={'nschip ' + (hiddenNs.has(n) ? 'off' : '')} style={{ '--c': nsColor(n) }} onClick={() => { if (selText()) return; if (hiddenNs.has(n)) hiddenNs.delete(n); else hiddenNs.add(n); store.bump(); }}>{n}</button>)}
    </div>
    <div className="net"><span className="me">💻 your machine</span>{routes.length ? routes : <span className="dim"> no published ports yet</span>}</div>
    {tr && <div className={'trace ' + (tr.ok ? 'ok' : 'bad')}><span className="dim">last request {PG.fmtAge(sim.clock - tr.t)} ago:</span> {tr.steps.map((s, i) => <Fragment key={i}>{i > 0 && <span className="arr">→</span>}<span className="step">{s.label}</span></Fragment>)}</div>}

    <VSection kind="Node" title="Nodes" count={cl.nodes.length} hint="the machines pods run on">
      <div className="nodes">{nodeRows.map(r => <NodeCard key={r.key} cl={cl} n={r.item} visible={visible} fresh={r.fresh} leaving={r.leaving} />)}</div>
      {orphans.length > 0 && <div className="pendingbox"><div className="grp-h"><KindTag kind="Pod" label="Unscheduled" /><b>waiting for a node</b></div><div className="pods"><PodGroups cl={cl} pods={orphans} empty="" /></div></div>}
    </VSection>

    {(deps.length > 0 || dss.length > 0 || cjs.length > 0 || jobs.length > 0) && <VSection kind="Deployment" title="Workloads" count={deps.length + dss.length + cjs.length + jobs.length} hint="what keeps pods running">
      <div className="wl">
        {deps.map(r => {
          const d = r.item; const want = d.spec.replicas === undefined ? 1 : d.spec.replicas;
          const ps = cl.res.pods.filter(p => p.metadata.namespace === d.metadata.namespace && p.metadata._owner && p.metadata._owner.kind === 'ReplicaSet' && p.metadata._owner.name.startsWith(d.metadata.name + '-') && !p.metadata.deletionTimestamp);
          const hpa = cl.res.horizontalpodautoscalers.find(x => x.spec.scaleTargetRef.name === d.metadata.name && x.metadata.namespace === d.metadata.namespace);
          const pdb = cl.res.poddisruptionbudgets.find(x => PG.selMatch(x.spec.selector, d.spec.template.metadata.labels) && x.metadata.namespace === d.metadata.namespace);
          const ready = (d.status || {}).readyReplicas || 0;
          return (
            <div className={'dep' + (r.fresh ? ' enter' : '') + (r.leaving ? ' leaving' : '')} key={r.key} onClick={r.leaving ? undefined : inspectOnClick('deployments', d.metadata.namespace, d.metadata.name)}>
              <span className="nsd" style={{ background: nsColor(d.metadata.namespace) }}></span><KindTag kind="Deployment" /><b>{d.metadata.name}</b> <span className="dim">{d.metadata.namespace}</span>
              <span className="reps">{ps.map(p => <i key={p.metadata.uid} className={'sq ' + statusClass(cl.podStatus(p))}></i>)}</span>
              <span className={'cnt ' + (ready === want ? 'ok' : 'warn')} key={ready + '/' + want}>{ready}/{want}</span><span className="dim img">{d.spec.template.spec.containers[0].image}</span>
              {hpa && <span className="tag"><KindIcon kind="HorizontalPodAutoscaler" size={11} /> HPA {hpa.spec.minReplicas || 1}–{hpa.spec.maxReplicas}{hpa.status && hpa.status._util != null ? ' @' + hpa.status._util + '%' : ''}</span>}
              {pdb && <span className="tag"><KindIcon kind="PodDisruptionBudget" size={11} /> PDB min {pdb.spec.minAvailable === undefined ? '-' : pdb.spec.minAvailable}</span>}
            </div>
          );
        })}
        {dss.map(d => <div className="dep" key={d.metadata.uid}><span className="nsd" style={{ background: nsColor(d.metadata.namespace) }}></span><KindTag kind="DaemonSet" /><b>{d.metadata.name}</b> <span className="dim">{d.metadata.namespace}</span><span className="cnt">{(d.status || {}).numberReady || 0}/{(d.status || {}).desiredNumberScheduled || 0}</span></div>)}
        {cjs.map(d => <div className="dep" key={d.metadata.uid}><span className="nsd" style={{ background: nsColor(d.metadata.namespace) }}></span><KindTag kind="CronJob" /><b>{d.metadata.name}</b> <span className="dim">{d.metadata.namespace}</span><span className="dim img">{d.spec.schedule}</span></div>)}
        {jobs.map(d => <div className="dep" key={d.metadata.uid}><span className="nsd" style={{ background: nsColor(d.metadata.namespace) }}></span><KindTag kind="Job" /><b>{d.metadata.name}</b> <span className="dim">{d.metadata.namespace}</span></div>)}
      </div>
    </VSection>}

    {(svcs.length > 0 || ings.length > 0) && <VSection kind="Service" title="Network" count={svcs.length + ings.length} hint="how traffic reaches pods">
      <div className="svcs">
        {svcs.map(s => {
          const eps = cl.endpointsOf(s); const lbl = s.spec.type === 'LoadBalancer' ? PG.extIp(s) : ''; const sel = s.spec.selector || {}; const n = new Set(eps.map(e => e.ip)).size;
          return (
            <div className="svc" key={s.metadata.uid} style={{ borderTopColor: nsColor(s.metadata.namespace) }} onClick={inspectOnClick('services', s.metadata.namespace, s.metadata.name)} onMouseEnter={() => setHover({ sel, ns: s.metadata.namespace })} onMouseLeave={() => setHover(null)}>
              <div className="svc-h"><KindTag kind="Service" /><b>{s.metadata.name}</b> <span className="tag">{s.spec.type}</span></div>
              <div className="dim">{s.metadata.namespace} · {s.spec.clusterIP || ''}</div>
              <div className="svc-p">{PG.portsStr(s)}{lbl ? ' · ' + lbl : ''}</div>
              <div className={'svc-ep ' + (n ? 'okc' : 'badc')}>{n ? '→ ' + n + ' pod(s)' : '→ no endpoints'}<span className="dots">{Array.from({ length: Math.min(n, 12) }, (_, i) => <i key={i} />)}</span></div>
            </div>
          );
        })}
        {ings.map(i => (
          <div className="svc ing" key={i.metadata.uid} onClick={inspectOnClick('ingresses', i.metadata.namespace, i.metadata.name)} onMouseEnter={() => setHover(null)}>
            <div className="svc-h"><KindTag kind="Ingress" /><b>{i.metadata.name}</b></div><div className="dim">{i.metadata.namespace}</div>
            {(i.spec.rules || []).map((r, ri) => (r.http ? r.http.paths : []).map((p, pi) => <div className="svc-p" key={ri + '-' + pi}>{r.host || '*'}{p.path} → {p.backend.service.name}:{p.backend.service.port.number}</div>))}
          </div>
        ))}
      </div>
    </VSection>}

    {(cms.length + secs.length + pvcs.length + sas.length > 0) && <VSection kind="ConfigMap" title="Config & storage" count={cms.length + secs.length + pvcs.length + sas.length} hint="settings and identities pods use">
      <div className="cfg">
        {[['ConfigMap', 'configmaps', cms], ['Secret', 'secrets', secs], ['PersistentVolumeClaim', 'persistentvolumeclaims', pvcs], ['ServiceAccount', 'serviceaccounts', sas]].filter(([, , l]) => l.length).map(([kind, plural, list]) => (
          <div className="cfg-g" key={kind}><KindTag kind={kind} /><div className="cfg-items">{list.map(x => <button className="cfg-i" key={x.metadata.uid} style={{ '--c': nsColor(x.metadata.namespace) }} onClick={inspectOnClick(plural, x.metadata.namespace, x.metadata.name)} title={x.metadata.namespace + '/' + x.metadata.name}>{x.metadata.name}</button>)}</div></div>
        ))}
      </div>
    </VSection>}

    <div className="legend"><span className="sw ok"></span>Running <span className="sw warn"></span>Starting/Pending <span className="sw bad"></span>Failing <span className="sw done"></span>Completed <span className="sw dying"></span>Terminating &nbsp;·&nbsp; left edge = namespace &nbsp;·&nbsp; click anything to inspect &nbsp;·&nbsp; hover a Service to light its pods</div>
  </div>;
}
