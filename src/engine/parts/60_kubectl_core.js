/* ================================================================= kubectl ==== */
PG.KC_VALUE_FLAGS = new Set(['n', 'namespace', 'o', 'output', 'l', 'selector', 'field-selector', 'context', 'as', 'as-group', 'f', 'filename', 'image', 'replicas', 'port', 'type', 'name', 'verb', 'resource', 'resource-name', 'from-literal', 'from-file', 'docker-server', 'docker-username', 'docker-password', 'docker-email', 'serviceaccount', 'user', 'group', 'role', 'clusterrole', 'cpu-percent', 'cpu', 'min', 'max', 'requests', 'limits', 'tail', 'container', 'c', 'p', 'patch', 'target-port', 'cluster', 'token', 'client-certificate', 'client-key', 'kubeconfig', 'sort-by', 'hard', 'L', 'for', 'rule', 'class', 'min-available', 'max-unavailable', 'raw', 'target', 'schedule', 'env', 'labels', 'restart', 'timeout', 'to-revision', 'duration', 'dry-run', 'grace-period', 'request-timeout', 'since', 'cert', 'key', 'overrides', 'command-name', 'selector-label', 'namespace-selector']);
PG.kcParse = (args, extraValue = [], noValue = []) => {
  const f = {}; const pos = []; const bools = new Set(); let dashdash = null;
  const isVal = k => !noValue.includes(k) && (PG.KC_VALUE_FLAGS.has(k) || extraValue.includes(k));
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--') { dashdash = args.slice(i + 1); break; }
    if (a.startsWith('--')) { const eq = a.indexOf('='); if (eq > 0) { const k = a.slice(2, eq); const v = a.slice(eq + 1); if (f[k] !== undefined && k !== 'n') f[k] = [].concat(f[k], v); else f[k] = v; } else { const k = a.slice(2); if (isVal(k) && i + 1 < args.length) { const v = args[++i]; f[k] = f[k] !== undefined ? [].concat(f[k], v) : v; } else bools.add(k); } continue; }
    if (a.startsWith('-') && a.length > 1 && !/^-\d/.test(a)) {
      if (a.length === 2 || /^-[a-zA-Z]$/.test(a)) { const k = a.slice(1); if (isVal(k) && i + 1 < args.length) f[k] = args[++i]; else bools.add(k); }
      else if (/^-n./.test(a)) f.n = a.slice(2); else if (/^-o./.test(a)) f.o = a.slice(2); else if (/^-(it|ti)$/.test(a)) { bools.add('i'); bools.add('t'); } else for (const ch of a.slice(1)) bools.add(ch);
      continue;
    }
    pos.push(a);
  }
  if (f.namespace) f.n = f.namespace; if (f.output) f.o = f.output; if (f.selector) f.l = f.selector; if (f.filename) f.f = f.filename;
  return { f, pos, bools, dd: dashdash, has: k => bools.has(k) || f[k] !== undefined };
};
PG.sel = (str, labels) => { // label selector: a=b,c!=d,key,!key
  if (!str) return true; labels = labels || {};
  return str.split(',').every(t => { t = t.trim(); let m; if ((m = /^([^!=\s]+)\s*!=\s*(.+)$/.exec(t))) return labels[m[1]] !== m[2]; if ((m = /^([^=\s]+)\s*==?\s*(.+)$/.exec(t))) return labels[m[1]] === m[2]; if (t[0] === '!') return !(t.slice(1) in labels); return t in labels; });
};
PG.getPath = (o, path) => path.split('.').filter(Boolean).reduce((a, k) => a == null ? undefined : a[k], o);
PG.clean = o => JSON.parse(JSON.stringify(o, (k, v) => (k.startsWith('_') ? undefined : v)));
PG.fqName = (plural, name) => { const k = PG.KINDS[plural]; return `${k.kind.toLowerCase()}${k.group ? '.' + k.group : ''}/${name}`; };

/* ---- the connection: context -> cluster + identity ---- */
PG.kcConnect = (ctx, P) => {
  const sim = ctx.sim; const kc = sim.kubeconfig; const name = P.f.context || kc.current;
  if (!name) { ctx.eprintln('error: current-context is not set'); return null; }
  const c = sim.ctxByName(name); if (!c) { ctx.eprintln(`error: context "${name}" does not exist`); return null; }
  const ce = sim.clusterEntry(c.cluster); const ue = sim.userEntry(c.user);
  if (!ce) { ctx.eprintln(`error: cluster "${c.cluster}" does not exist`); return null; }
  const cl = sim.clusters[c.cluster];
  if (!cl || !cl.apiUp()) { const m = /:\/\/([^/]+)/.exec(ce.server); ctx.eprintln(`The connection to the server ${m ? m[1] : 'localhost:8080'} was refused - did you specify the right host or port?`); return null; }
  let id = null;
  const a = ue ? ue.auth : { kind: 'admin' };
  if (a.kind === 'admin') id = { user: 'kubernetes-admin', groups: ['system:masters', 'system:authenticated'] };
  else if (a.kind === 'token') { const t = sim.tokens[a.token]; if (!t) { ctx.eprintln('error: You must be logged in to the server (Unauthorized)'); return null; } if (sim.clock > t.exp) { ctx.eprintln('error: You must be logged in to the server (Unauthorized)'); return null; } id = t.identity; }
  else if (a.kind === 'cert') id = { user: a.cn, groups: [...(a.groups || []), 'system:authenticated'] };
  else id = { user: 'anonymous', groups: ['system:unauthenticated'] };
  if (P.f.as) { if (!(id.groups || []).includes('system:masters') && !cl.authorize(id, 'impersonate', 'users', null)) { ctx.eprintln(`Error from server (Forbidden): users "${P.f.as}" is forbidden: User "${id.user}" cannot impersonate resource "users" in API group "" at the cluster scope`); return null; } const m = /^system:serviceaccount:([^:]+):(.+)$/.exec(P.f.as); id = { user: P.f.as, groups: [...[].concat(P.f['as-group'] || []), 'system:authenticated', ...(m ? ['system:serviceaccounts', 'system:serviceaccounts:' + m[1]] : [])] }; }
  const ns = P.f.n || c.namespace || 'default';
  return { cl, id, ns, ctxName: name, ctxEntry: c };
};
PG.kcForbid = (ctx, K, plural, verb, name, ns, sub) => { const k = PG.KINDS[plural]; const res = plural + (sub ? '/' + sub : ''); const scope = k && k.ns ? `in the namespace "${ns}"` : 'at the cluster scope'; ctx.eprintln(`Error from server (Forbidden): ${res} ${name ? '"' + name + '" ' : ''}is forbidden: User "${K.id.user}" cannot ${verb} resource "${res}" in API group "${k ? k.group : ''}" ${scope}`); return 1; };
PG.kcCan = (K, verb, plural, ns, sub) => K.cl.authorize(K.id, verb, plural, PG.KINDS[plural] && !PG.KINDS[plural].ns ? null : ns, sub);

/* ---- k8s-shaped views of non-stored things ---- */
PG.nodeObj = (cl, n) => ({ apiVersion: 'v1', kind: 'Node', metadata: { name: n.name, labels: n.labels, creationTimestamp: PG.iso(n.createdAt), uid: PG.hash(n.name, 24), _t: n.createdAt }, spec: { ...(n.unschedulable ? { unschedulable: true } : {}), ...(n.taints.length ? { taints: n.taints } : {}), podCIDR: n.podCidr + '0/24' }, status: { conditions: [{ type: 'Ready', status: n.ready ? 'True' : 'Unknown' }], addresses: [{ type: 'InternalIP', address: n.ip }, { type: 'Hostname', address: n.name }], nodeInfo: { osImage: n.osImage, kubeletVersion: n.version, containerRuntimeVersion: n.runtime, architecture: 'arm64', kernelVersion: '6.12.13-linuxkit' }, capacity: { cpu: '6', memory: '11975508Ki', pods: '110' }, allocatable: { cpu: '6', memory: '11975508Ki', pods: '110' } }, _node: n });
PG.listObjs = (cl, plural, ns, all) => {
  if (plural === 'nodes') return cl.nodes.map(n => PG.nodeObj(cl, n));
  if (plural === 'endpoints') return cl.res.services.filter(s => all || s.metadata.namespace === ns).map(s => { const eps = cl.endpointsOf(s); return { apiVersion: 'v1', kind: 'Endpoints', metadata: { name: s.metadata.name, namespace: s.metadata.namespace, creationTimestamp: s.metadata.creationTimestamp, _t: s.metadata._t, labels: s.metadata.labels }, subsets: eps.length ? [{ addresses: [...new Set(eps.map(e => e.ip))].map(ip => ({ ip })), ports: [...new Set(eps.map(e => e.port))].map(p => ({ port: p, protocol: 'TCP' })) }] : [], _eps: eps }; });
  if (plural === 'events') return cl.res.events.filter(e => all || e.ns === ns).map(e => ({ apiVersion: 'v1', kind: 'Event', metadata: { name: e.name + '.' + PG.hex(8), namespace: e.ns, creationTimestamp: PG.iso(e.t), _t: e.t }, type: e.type, reason: e.reason, message: e.message, involvedObject: { kind: e.kind, name: e.name }, _e: e }));
  return cl.res[plural].filter(o => all || !PG.KINDS[plural].ns || o.metadata.namespace === ns);
};
PG.ageOf = (cl, o) => PG.fmtAge(cl.clock - (o.metadata._t === undefined ? cl.clock : o.metadata._t));
PG.podRow = (cl, p) => { const sm = p._sim; const n = p.spec.containers.length; const ready = p.metadata.deletionTimestamp ? 0 : (sm.readyCount !== undefined ? sm.readyCount : (cl.podReady(p) ? n : 0)); const st = cl.podStatus(p); return { ready: `${ready}/${n}`, status: st, restarts: String(sm.restarts || 0), age: PG.ageOf(cl, p) }; };
PG.portsStr = s => (s.spec.ports || []).map(p => `${p.port}${p.nodePort ? ':' + p.nodePort : ''}/${p.protocol || 'TCP'}`).join(',') || '<none>';
PG.extIp = s => { if (s.spec.type !== 'LoadBalancer') return s.spec.type === 'ExternalName' ? s.spec.externalName : '<none>'; const l = s.status && s.status.loadBalancer; if (!l || !l.ingress) return '<pending>'; return l.ingress.map(i => i.ip).join(','); };
PG.selStr = sel => sel && Object.keys(sel).length ? Object.entries(sel).map(([k, v]) => `${k}=${v}`).join(',') : '<none>';
PG.PRINT = {
  pods: { cols: ['NAME', 'READY', 'STATUS', 'RESTARTS', 'AGE'], wide: ['IP', 'NODE', 'NOMINATED NODE', 'READINESS GATES'], row: (o, cl, w) => { const r = PG.podRow(cl, o); return [o.metadata.name, r.ready, r.status, r.restarts, r.age, ...(w ? [o.status.podIP || '<none>', o.spec.nodeName || '<none>', '<none>', '<none>'] : [])]; } },
  services: { cols: ['NAME', 'TYPE', 'CLUSTER-IP', 'EXTERNAL-IP', 'PORT(S)', 'AGE'], wide: ['SELECTOR'], row: (o, cl, w) => [o.metadata.name, o.spec.type, o.spec.clusterIP || '<none>', PG.extIp(o), PG.portsStr(o), PG.ageOf(cl, o), ...(w ? [PG.selStr(o.spec.selector)] : [])] },
  endpoints: { cols: ['NAME', 'ENDPOINTS', 'AGE'], row: (o, cl) => [o.metadata.name, o._eps.length ? [...new Set(o._eps.map(e => e.ip + ':' + e.port))].slice(0, 3).join(',') + (new Set(o._eps.map(e => e.ip + ':' + e.port)).size > 3 ? ' + ' + (new Set(o._eps.map(e => e.ip + ':' + e.port)).size - 3) + ' more...' : '') : '<none>', PG.ageOf(cl, o)] },
  namespaces: { cols: ['NAME', 'STATUS', 'AGE'], row: (o, cl) => [o.metadata.name, o._deleteAt ? 'Terminating' : 'Active', PG.ageOf(cl, o)] },
  nodes: { cols: ['NAME', 'STATUS', 'ROLES', 'AGE', 'VERSION'], wide: ['INTERNAL-IP', 'EXTERNAL-IP', 'OS-IMAGE', 'KERNEL-VERSION', 'CONTAINER-RUNTIME'], row: (o, cl, w) => { const n = o._node; const roles = Object.keys(n.labels).filter(k => k.startsWith('node-role.kubernetes.io/')).map(k => k.split('/')[1]).join(',') || '<none>'; return [n.name, (n.ready ? 'Ready' : 'NotReady') + (n.unschedulable ? ',SchedulingDisabled' : ''), roles, PG.fmtAge(cl.clock - n.createdAt), n.version, ...(w ? [n.ip, '<none>', n.osImage, '6.12.13-linuxkit', n.runtime] : [])]; } },
  configmaps: { cols: ['NAME', 'DATA', 'AGE'], row: (o, cl) => [o.metadata.name, String(Object.keys(o.data || {}).length), PG.ageOf(cl, o)] },
  secrets: { cols: ['NAME', 'TYPE', 'DATA', 'AGE'], row: (o, cl) => [o.metadata.name, o.type || 'Opaque', String(Object.keys(o.data || {}).length + Object.keys(o.stringData || {}).length), PG.ageOf(cl, o)] },
  serviceaccounts: { cols: ['NAME', 'SECRETS', 'AGE'], row: (o, cl) => [o.metadata.name, '0', PG.ageOf(cl, o)] },
  persistentvolumeclaims: { cols: ['NAME', 'STATUS', 'VOLUME', 'CAPACITY', 'ACCESS MODES', 'STORAGECLASS', 'AGE'], row: (o, cl) => [o.metadata.name, (o.status || {}).phase || 'Pending', 'pvc-' + o.metadata.uid.slice(0, 8), (o.spec.resources || { requests: {} }).requests.storage || '1Gi', (o.spec.accessModes || ['RWO']).map(m => m.replace('ReadWriteOnce', 'RWO')).join(','), o.spec.storageClassName || 'standard', PG.ageOf(cl, o)] },
  resourcequotas: { cols: ['NAME', 'AGE', 'REQUEST', 'LIMIT'], row: (o, cl) => [o.metadata.name, PG.ageOf(cl, o), Object.entries(o.spec.hard || {}).filter(([k]) => !k.startsWith('limits')).map(([k, v]) => `${k}: ${PG.quotaUsed(cl, o, k)}/${v}`).join(', '), Object.entries(o.spec.hard || {}).filter(([k]) => k.startsWith('limits')).map(([k, v]) => `${k}: 0/${v}`).join(', ')] },
  events: { cols: ['LAST SEEN', 'TYPE', 'REASON', 'OBJECT', 'MESSAGE'], row: (o, cl) => [PG.fmtAge(cl.clock - o._e.t), o.type, o.reason, o._e.kind.toLowerCase() + '/' + o._e.name, o.message] },
  deployments: { cols: ['NAME', 'READY', 'UP-TO-DATE', 'AVAILABLE', 'AGE'], wide: ['CONTAINERS', 'IMAGES', 'SELECTOR'], row: (o, cl, w) => { const s = o.status || {}; return [o.metadata.name, `${s.readyReplicas || 0}/${o.spec.replicas === undefined ? 1 : o.spec.replicas}`, String(s.updatedReplicas || 0), String(s.availableReplicas || 0), PG.ageOf(cl, o), ...(w ? [o.spec.template.spec.containers.map(c => c.name).join(','), o.spec.template.spec.containers.map(c => c.image).join(','), PG.selStr(o.spec.selector.matchLabels)] : [])]; } },
  replicasets: { cols: ['NAME', 'DESIRED', 'CURRENT', 'READY', 'AGE'], wide: ['CONTAINERS', 'IMAGES', 'SELECTOR'], row: (o, cl, w) => [o.metadata.name, String(o.spec.replicas), String(o.status.replicas || 0), String(o.status.readyReplicas || 0), PG.ageOf(cl, o), ...(w ? [o.spec.template.spec.containers.map(c => c.name).join(','), o.spec.template.spec.containers.map(c => c.image).join(','), PG.selStr(o.spec.selector.matchLabels)] : [])] },
  daemonsets: { cols: ['NAME', 'DESIRED', 'CURRENT', 'READY', 'UP-TO-DATE', 'AVAILABLE', 'NODE SELECTOR', 'AGE'], row: (o, cl) => { const s = o.status || {}; return [o.metadata.name, String(s.desiredNumberScheduled || 0), String(s.currentNumberScheduled || 0), String(s.numberReady || 0), String(s.updatedNumberScheduled || 0), String(s.numberAvailable || 0), PG.selStr(o.spec.template.spec.nodeSelector).replace('<none>', 'kubernetes.io/os=linux'), PG.ageOf(cl, o)]; } },
  ingresses: { cols: ['NAME', 'CLASS', 'HOSTS', 'ADDRESS', 'PORTS', 'AGE'], row: (o, cl) => [o.metadata.name, o.spec.ingressClassName || '<none>', (o.spec.rules || []).map(r => r.host || '*').join(',') || '*', cl.tool === 'k3d' ? cl.nodes.map(n => n.ip).join(',') : (PG.ingressNginx && PG.ingressNginx(cl) ? 'localhost' : ''), (o.spec.tls || []).length ? '80, 443' : '80', PG.ageOf(cl, o)] },
  networkpolicies: { cols: ['NAME', 'POD-SELECTOR', 'AGE'], row: (o, cl) => [o.metadata.name, PG.selStr((o.spec.podSelector || {}).matchLabels).replace('<none>', '<none>'), PG.ageOf(cl, o)] },
  horizontalpodautoscalers: { cols: ['NAME', 'REFERENCE', 'TARGETS', 'MINPODS', 'MAXPODS', 'REPLICAS', 'AGE'], row: (o, cl) => { const t = ((o.spec.metrics || [])[0] || { resource: { target: { averageUtilization: 80 } } }).resource.target.averageUtilization; const s = o.status || {}; return [o.metadata.name, `${o.spec.scaleTargetRef.kind}/${o.spec.scaleTargetRef.name}`, s._util === null || s._util === undefined ? `<unknown>/${t}%` : `${s._util}%/${t}%`, String(o.spec.minReplicas || 1), String(o.spec.maxReplicas), String(s.currentReplicas || 0), PG.ageOf(cl, o)]; } },
  poddisruptionbudgets: { cols: ['NAME', 'MIN AVAILABLE', 'MAX UNAVAILABLE', 'ALLOWED DISRUPTIONS', 'AGE'], row: (o, cl) => { const pods = cl.matchPods(o.metadata.namespace, o.spec.selector).filter(p => cl.podReady(p)).length; const allowed = o.spec.minAvailable !== undefined ? Math.max(0, pods - o.spec.minAvailable) : Math.max(0, (o.spec.maxUnavailable || 1)); return [o.metadata.name, o.spec.minAvailable === undefined ? 'N/A' : String(o.spec.minAvailable), o.spec.maxUnavailable === undefined ? 'N/A' : String(o.spec.maxUnavailable), String(allowed), PG.ageOf(cl, o)]; } },
  jobs: { cols: ['NAME', 'STATUS', 'COMPLETIONS', 'DURATION', 'AGE'], row: (o, cl) => [o.metadata.name, o.status.succeeded ? 'Complete' : 'Running', `${o.status.succeeded || 0}/1`, o.status.succeeded ? PG.fmtAge(o._dur || 1) : PG.fmtAge(cl.clock - (o._started || o.metadata._t)), PG.ageOf(cl, o)] },
  cronjobs: { cols: ['NAME', 'SCHEDULE', 'TIMEZONE', 'SUSPEND', 'ACTIVE', 'LAST SCHEDULE', 'AGE'], row: (o, cl) => [o.metadata.name, o.spec.schedule, '<none>', String(!!o.spec.suspend), '0', o.status && o.status.lastScheduleTime ? '1m' : '<none>', PG.ageOf(cl, o)] },
  roles: { cols: ['NAME', 'CREATED AT'], row: (o) => [o.metadata.name, o.metadata.creationTimestamp] },
  clusterroles: { cols: ['NAME', 'CREATED AT'], row: (o) => [o.metadata.name, o.metadata.creationTimestamp] },
  rolebindings: { cols: ['NAME', 'ROLE', 'AGE'], wide: ['USERS', 'GROUPS', 'SERVICEACCOUNTS'], row: (o, cl, w) => [o.metadata.name, `${o.roleRef.kind}/${o.roleRef.name}`, PG.ageOf(cl, o), ...(w ? [(o.subjects || []).filter(s => s.kind === 'User').map(s => s.name).join(','), (o.subjects || []).filter(s => s.kind === 'Group').map(s => s.name).join(','), (o.subjects || []).filter(s => s.kind === 'ServiceAccount').map(s => (s.namespace || '') + '/' + s.name).join(',')] : [])] },
  clusterrolebindings: { cols: ['NAME', 'ROLE', 'AGE'], wide: ['USERS', 'GROUPS', 'SERVICEACCOUNTS'], row: (o, cl, w) => [o.metadata.name, `${o.roleRef.kind}/${o.roleRef.name}`, PG.ageOf(cl, o), ...(w ? [(o.subjects || []).filter(s => s.kind === 'User').map(s => s.name).join(','), (o.subjects || []).filter(s => s.kind === 'Group').map(s => s.name).join(','), (o.subjects || []).filter(s => s.kind === 'ServiceAccount').map(s => (s.namespace || '') + '/' + s.name).join(',')] : [])] },
  certificatesigningrequests: { cols: ['NAME', 'AGE', 'SIGNERNAME', 'REQUESTOR', 'REQUESTEDDURATION', 'CONDITION'], row: (o, cl) => [o.metadata.name, PG.ageOf(cl, o), o.spec.signerName, 'kubernetes-admin', o.spec.expirationSeconds ? PG.fmtAge(o.spec.expirationSeconds) : '<none>', (o.status && o.status.conditions && o.status.conditions[0]) ? 'Approved,Issued' : 'Pending'] },
  leases: { cols: ['NAME', 'HOLDER', 'AGE'], row: (o, cl) => [o.metadata.name, o.spec.holderIdentity, PG.ageOf(cl, o)] },
};
PG.quotaUsed = (cl, q, k) => k === 'pods' ? cl.res.pods.filter(p => p.metadata.namespace === q.metadata.namespace && p.status.phase !== 'Succeeded' && !p.metadata.deletionTimestamp).length : 0;
PG.renderTable = (cl, plural, objs, o) => {
  const P = PG.PRINT[plural]; const wide = o.wide; const all = o.all; const showLabels = o.showLabels;
  const header = [...(all && PG.KINDS[plural].ns ? ['NAMESPACE'] : []), ...P.cols, ...(wide && P.wide ? P.wide : []), ...(showLabels ? ['LABELS'] : [])];
  const rows = objs.map(x => [...(all && PG.KINDS[plural].ns ? [x.metadata.namespace] : []), ...P.row(x, cl, wide), ...(showLabels ? [Object.entries(x.metadata.labels || {}).map(([k, v]) => `${k}=${v}`).join(',') || '<none>'] : [])]);
  return { header, rows, text: (o.noHeaders ? '' : '') + (o.noHeaders ? rows.map(r => r.join('   ')).join('\n') : PG.table(rows, header)) };
};
/* ---- jsonpath (subset) ---- */
PG.jsonPath = (tmpl, root) => {
  const evalPath = (obj, path) => { let cur = [obj]; const re = /\.([\w\-\/]+(?:\.[\w\-\/]+)*)|\[(\*|\d+)\]|\['([^']+)'\]|\.\['([^']+)'\]|\.\[(\*)\]/g; const segs = []; let m; const p = path.replace(/^\./, '.'); const tokens = p.match(/\.[^.\[\]]+|\[[^\]]+\]/g) || []; for (const t of tokens) { cur = cur.flatMap(c => { if (c == null) return []; if (t[0] === '.') { const k = t.slice(1); return [c[k]]; } const inner = t.slice(1, -1); if (inner === '*') return Array.isArray(c) ? c : Object.values(c); if (/^\d+$/.test(inner)) return [c[Number(inner)]]; return [c[inner.replace(/^'|'$/g, '')]]; }); } return cur; };
  const str = v => v === undefined || v === null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  let out = ''; let i = 0;
  const parts = []; const re = /\{([^}]*)\}/g; let last = 0; let m;
  while ((m = re.exec(tmpl))) { if (m.index > last) parts.push({ t: 'lit', v: tmpl.slice(last, m.index) }); parts.push({ t: 'x', v: m[1].trim() }); last = re.lastIndex; }
  if (last < tmpl.length) parts.push({ t: 'lit', v: tmpl.slice(last) });
  const run = (ps, obj) => { let s = ''; for (let k = 0; k < ps.length; k++) { const p = ps[k]; if (p.t === 'lit') s += p.v.replace(/\\n/g, '\n').replace(/\\t/g, '\t'); else if (p.v.startsWith('range ')) { let depth = 1, j = k + 1; while (j < ps.length) { if (ps[j].t === 'x' && ps[j].v.startsWith('range ')) depth++; if (ps[j].t === 'x' && ps[j].v === 'end') depth--; if (!depth) break; j++; } const items = evalPath(obj, p.v.slice(6).trim()); for (const it of items) s += run(ps.slice(k + 1, j), it); k = j; } else if (/^"[^"]*"$/.test(p.v)) s += JSON.parse(p.v); else s += evalPath(obj, p.v).map(str).join(' '); } return s; };
  return run(parts, root);
};
PG.outputObjs = (ctx, cl, plural, objs, o, single) => { // -o yaml/json/name/jsonpath
  const fmt = o.out; const cleaned = objs.map(x => PG.cleanForOutput(cl, plural, x));
  if (fmt === 'yaml') { if (single) ctx.out(PG.yaml.dump(cleaned[0])); else ctx.out(PG.yaml.dump({ apiVersion: 'v1', kind: 'List', items: cleaned, metadata: { resourceVersion: '' } })); return true; }
  if (fmt === 'json') { ctx.println(JSON.stringify(single ? cleaned[0] : { apiVersion: 'v1', kind: 'List', items: cleaned, metadata: { resourceVersion: '' } }, null, 2)); return true; }
  if (fmt === 'name') { ctx.println(cleaned.map(x => PG.fqName(plural, x.metadata.name)).join('\n')); return true; }
  if (/^jsonpath=/.test(fmt)) { const t = fmt.replace(/^jsonpath=/, '').replace(/^['"]|['"]$/g, ''); ctx.out(PG.jsonPath(t, single ? cleaned[0] : { items: cleaned })); return true; }
  return false;
};
PG.cleanForOutput = (cl, plural, x) => { const c = PG.clean(x); if (plural === 'pods') { const p = x; const ready = cl.podReady(p); const cst = p._sim.cs || []; c.status = { ...(c.status || {}), phase: p.status.phase, conditions: [{ type: 'Initialized', status: (!(p.spec.initContainers || []).length || ['running', 'done'].includes(p._sim.stage)) ? 'True' : 'False' }, { type: 'Ready', status: ready ? 'True' : 'False' }], containerStatuses: p.spec.containers.map((co, i) => ({ name: co.name, image: co.image, ready: cst[i] ? !!cst[i].ready : ready, restartCount: cst[i] ? cst[i].restarts : (p._sim.restarts || 0), state: (cst[i] ? cst[i].status === 'Running' : ready) ? { running: { startedAt: p.status.startTime } } : { waiting: { reason: cst[i] ? cst[i].status : cl.podStatus(p) } } })), qosClass: 'BestEffort' }; } if (plural === 'secrets' && c.stringData) { c.data = { ...(c.data || {}), ...Object.fromEntries(Object.entries(c.stringData).map(([k, v]) => [k, PG.b64(String(v))])) }; delete c.stringData; } delete c.metadata._t; return c; };
if (typeof module !== 'undefined') module.exports = PG;
