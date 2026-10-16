import { useState } from 'react';
import PG from '../../engine/engine.js';
import { store } from '../store.js';
import { KindTag, VSection } from '../viz/ui.jsx';
import { useGhosts } from '../viz/hooks.js';

const KIND_OF = { Pod: 'Pod', Deployment: 'Deployment', ReplicaSet: 'ReplicaSet', Node: 'Node', Service: 'Service', Job: 'Job', DaemonSet: 'DaemonSet', HorizontalPodAutoscaler: 'HorizontalPodAutoscaler', Ingress: 'Ingress' };
const bucket = age => (age < 15 ? 'just now' : age < 120 ? 'last couple of minutes' : age < 900 ? 'last quarter hour' : 'earlier');
const ORDER = ['just now', 'last couple of minutes', 'last quarter hour', 'earlier'];

export default function EventsView() {
  const sim = store.sim; const cl = sim.currentCluster(); const [only, setOnly] = useState('all'); const items = [];
  for (const l of sim.log) items.push({ id: 's' + l.t + l.msg, t: l.t, type: 'sim', kind: 'Event', name: 'simulator', ns: '', reason: 'Note', text: l.msg });
  if (cl) for (const e of cl.res.events.slice(-80)) items.push({ id: e.name + e.reason + (e.t || '') + (e.message || '').slice(0, 20), t: e.lastT || e.t, type: e.type, kind: KIND_OF[e.kind] || 'Event', name: e.name, ns: e.ns, reason: e.reason, text: e.message + (e.count > 1 ? ' (x' + e.count + ')' : '') });
  const dup = new Map(); for (const i of items) { const n = dup.get(i.id) || 0; dup.set(i.id, n + 1); if (n) i.id += '#' + n; } // keys must be unique
  items.sort((a, b) => b.t - a.t); const warn = items.filter(i => i.type === 'Warning').length;
  const filtered = items.filter(i => only === 'all' || (only === 'warn' ? i.type === 'Warning' : i.type !== 'Warning')).slice(0, 120);
  const rows = useGhosts(filtered, i => i.id, 300);
  const groups = ORDER.map(b => [b, rows.filter(r => bucket(sim.clock - r.item.t) === b)]).filter(([, r]) => r.length);
  return <div className="cv">
    <VSection kind="Event" title="Events & notes" count={items.length} hint="what the cluster reports, newest first">
      <div className="evbar" role="group" aria-label="Filter events">
        {[['all', `All ${items.length}`], ['warn', `Warnings ${warn}`], ['normal', 'Normal']].map(([k, l]) => <button key={k} type="button" className={only === k ? 'on' : ''} aria-pressed={only === k} onClick={() => setOnly(k)}>{l}</button>)}
      </div>
      {!rows.length && <p className="dim">Nothing yet. Events appear as pods are scheduled, pulled, started and killed.</p>}
      <div className="log">
        {groups.map(([b, rs]) => <div className="evgrp" key={b}><div className="evgrp-h">{b}</div>
          {rs.map(r => { const i = r.item; return (
            <div className={'lg ' + i.type + (r.fresh ? ' enter' : '') + (r.leaving ? ' leaving' : '')} key={r.key}>
              <span className="ev-t">{PG.fmtAge(sim.clock - i.t)}</span><i className={'ev-dot ' + (i.type === 'Warning' ? 'warn' : i.type === 'sim' ? 'sim' : 'ok')} aria-hidden="true" />
              <div className="ev-b"><div className="ev-h"><KindTag kind={i.kind} label={i.kind + (i.name ? '/' + i.name : '')} size={12} />{i.ns && <span className="nspill">{i.ns}</span>}<b>{i.reason}</b></div><div className="ev-m">{i.text}</div></div>
            </div>); })}
        </div>)}
      </div>
    </VSection>
  </div>;
}
