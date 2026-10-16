import { Fragment } from 'react';
import PG from '../../engine/engine.js';
import { store } from '../store.js';
import { KindTag, Led, Meter, VSection } from '../viz/ui.jsx';
import { useGhosts } from '../viz/hooks.js';

const portPills = c => (c.ports || []).map((p, i) => <span className="pport" key={i}>{p.hostIp || '127.0.0.1'}:{p.host}<em>→</em>{p.container}</span>);
function ContainerCard({ c, fresh, leaving }) {
  const sim = store.sim; const up = c.status === 'running';
  return (
    <div className={'ccard' + (up ? '' : ' stopped') + (fresh ? ' enter' : '') + (leaving ? ' leaving' : '')}>
      <div className="cc-h"><Led tone={up ? 'ok' : 'done'} pulse={up} /><b>{c.name}</b><KindTag kind={c.kind === 'registry' ? 'Registry' : c.kind === 'node' ? 'Node' : 'Container'} label={c.kind || 'container'} /></div>
      <div className="cc-img">{c.image}</div>
      <div className="cc-meta"><span>{PG.upText(sim, c)}</span>{c.networks.map(n => <span className="chip" key={n}>{n}</span>)}</div>
      {(c.ports || []).length > 0 && <div className="cc-ports">{portPills(c)}</div>}
    </div>
  );
}

export default function DockerView() {
  const sim = store.sim; const imgs = Object.entries(sim.images); const regs = sim.containers.filter(c => c.kind === 'registry');
  const rows = useGhosts(sim.containers, c => c.name, 460); const maxSize = Math.max(1, ...imgs.map(([, v]) => v.size));
  const groups = [['node', 'Cluster nodes (kind and k3d nodes are containers)'], ['registry', 'Registries'], ['other', 'Your containers']];
  const kindOf = c => (c.kind === 'node' || c.kind === 'registry' ? c.kind : /serverlb|loadbalancer/.test(c.name) ? 'node' : 'other');
  return <div className="cv">
    <VSection kind="Container" title="Containers" count={sim.containers.length} hint="what docker ps shows">
      {sim.containers.length ? groups.map(([g, label]) => { const rs = rows.filter(r => kindOf(r.item) === g); return rs.length ? <div className="cgroup" key={g}><div className="vlab">{label}</div><div className="cgrid">{rs.map(r => <ContainerCard key={r.key} c={r.item} fresh={r.fresh} leaving={r.leaving} />)}</div></div> : null; })
        : <div className="empty"><p className="dim">No containers yet. A kind or k3d cluster is a set of containers.</p><div className="empty-actions"><button className="go" onClick={() => { store.setPane('term'); store.runInTerm('kind create cluster --name local-cluster-1', true); }}>kind create cluster</button><button onClick={() => { store.setPane('term'); store.runInTerm('docker run -d --name x -p 8080:80 nginx:1.27', true); }}>docker run nginx</button></div></div>}
    </VSection>
    <VSection kind="Image" title="Images" count={imgs.length} hint="stored by docker on your machine">
      {imgs.length ? <div className="igrid">{imgs.map(([k, v]) => <div className="icard" key={k}><div className="ic-h"><b>{k}</b>{v.meta ? <span className="tag">built here</span> : null}</div><div className="ic-id">{v.id}</div><div className="ic-s"><Meter value={v.size} max={maxSize} tone="ok" label={`size ${v.size} MB`} /><span>{v.size >= 1000 ? (v.size / 1000).toFixed(2) + ' GB' : v.size + ' MB'}</span></div></div>)}</div>
        : <p className="dim">No local images. Try <code>docker pull nginx:1.27</code></p>}
    </VSection>
    <VSection kind="Network" title="Networks" count={sim.networks.length} hint="containers on the same network can reach each other">
      <div className="nets">{sim.networks.map(n => { const members = sim.containers.filter(c => c.networks.includes(n)); return (
        <div className="netc" key={n}><div className="net-h"><KindTag kind="Network" label={n} /><span className="dim">{members.length} container{members.length === 1 ? '' : 's'}</span></div>
          <div className="net-bus"><i className="bus-line" />{members.slice(0, 14).map(m => <span key={m.name} className={'bus-dot ' + (m.status === 'running' ? 'ok' : 'done')} title={m.name} />)}</div></div>); })}</div>
    </VSection>
    {regs.map(r => { const d = sim.registries[r.name] || {}; const keys = Object.keys(d); return <Fragment key={r.name}>
      <VSection kind="Registry" title={`Registry ${r.name}${r.status === 'running' ? '' : ' (stopped)'}`} count={keys.length} hint="images you pushed">
        {keys.length ? <div className="chips-row">{keys.map(k => <span className="chip" key={k}>{k}</span>)}</div> : <p className="dim">empty — <code>docker push localhost:5001/…</code></p>}
      </VSection></Fragment>; })}
  </div>;
}
