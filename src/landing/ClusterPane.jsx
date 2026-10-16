// A small cluster picture: nodes and the pods on them. Fed by snapshots taken from the real simulator at build time.
const tone = s => (s === 'Running' ? 'ok' : s === 'ContainerCreating' || s === 'Pending' ? 'warn' : s === 'Terminating' ? 'dim' : 'bad');
export default function ClusterPane({ nodes }) {
  return (
    <div className="cp" aria-hidden="true">
      <div className="cp-title">cluster <b>dojo</b></div>
      {(nodes || []).map(n => (
        <div className={'cp-node' + (n.ready ? '' : ' down')} key={n.name}>
          <div className="cp-nh"><i className={'dot ' + (n.ready ? 'ok' : 'bad')}></i><span>{n.name}</span><em>{n.ready ? n.role : 'NotReady'}</em></div>
          <div className="cp-pods">{n.pods.map(p => <span key={p.id} className={'pod ' + tone(p.status)} title={p.status}>{p.id}</span>)}</div>
        </div>
      ))}
    </div>
  );
}
