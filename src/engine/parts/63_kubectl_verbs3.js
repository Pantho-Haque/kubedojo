/* ---- rollout ---- */
KV.rollout = async (ctx, K, P) => {
  const cl = K.cl; const ns = K.ns; const sub = P.pos[1]; const t = PG.parseTargets(P.pos.slice(2))[0];
  if (!t || t.plural !== 'deployments') { ctx.eprintln('error: rollout supports deployments: kubectl rollout status deployment/NAME'); return 1; }
  const d = cl.find('deployments', t.name, ns); if (!d) { ctx.eprintln(`Error from server (NotFound): deployments.apps "${t.name}" not found`); return 1; }
  const rss = () => cl.res.replicasets.filter(r => r.metadata._owner.name === d.metadata.name && r.metadata.namespace === ns);
  if (sub === 'status') {
    const tmo = P.f.timeout ? parseInt(P.f.timeout) : 0; const t0 = ctx.sim.clock; let last = '';
    while (true) {
      const s = d.status || {}; const want = d.spec.replicas === undefined ? 1 : d.spec.replicas; let msg;
      if ((s.updatedReplicas || 0) < want) msg = `Waiting for deployment "${t.name}" rollout to finish: ${s.updatedReplicas || 0} out of ${want} new replicas have been updated...`;
      else if ((s.replicas || 0) > (s.updatedReplicas || 0)) msg = `Waiting for deployment "${t.name}" rollout to finish: ${(s.replicas || 0) - (s.updatedReplicas || 0)} old replicas are pending termination...`;
      else if ((s.availableReplicas || 0) < (s.updatedReplicas || 0)) msg = `Waiting for deployment "${t.name}" rollout to finish: ${s.availableReplicas || 0} of ${s.updatedReplicas || 0} updated replicas are available...`;
      else { ctx.println(`deployment "${t.name}" successfully rolled out`); return 0; }
      if (msg !== last) { ctx.println(msg); last = msg; }
      if (tmo && ctx.sim.clock - t0 > tmo) { ctx.eprintln('error: timed out waiting for the condition'); return 1; }
      await ctx.sleep(1);
    }
  }
  if (!PG.kcCan(K, 'patch', 'deployments', ns)) return PG.kcForbid(ctx, K, 'deployments', 'patch', t.name, ns);
  if (sub === 'restart') { d.spec.template.metadata.annotations = { ...(d.spec.template.metadata.annotations || {}), 'kubectl.kubernetes.io/restartedAt': PG.iso(ctx.sim.clock) }; ctx.println(`deployment.apps/${t.name} restarted`); return 0; }
  if (sub === 'history') { const rows = rss().sort((a, b) => a.metadata.annotations['deployment.kubernetes.io/revision'] - b.metadata.annotations['deployment.kubernetes.io/revision']).map(r => [r.metadata.annotations['deployment.kubernetes.io/revision'], '<none>']); ctx.println(`deployment.apps/${t.name}\n` + PG.table(rows, ['REVISION', 'CHANGE-CAUSE'])); return 0; }
  if (sub === 'undo') { const sorted = rss().sort((a, b) => b.metadata.annotations['deployment.kubernetes.io/revision'] - a.metadata.annotations['deployment.kubernetes.io/revision']); const cur = sorted.find(r => r._hash === cl.depHash(d)); let prev; if (P.f['to-revision']) prev = sorted.find(r => r.metadata.annotations['deployment.kubernetes.io/revision'] === String(P.f['to-revision'])); else prev = sorted.find(r => r !== cur); if (!prev) { ctx.eprintln(`error: no rollout history found for deployment "${t.name}"`); return 1; } d.spec.template = PG.clone(prev._template); prev.metadata.annotations['deployment.kubernetes.io/revision'] = String(Math.max(...sorted.map(r => +r.metadata.annotations['deployment.kubernetes.io/revision'])) + 1); ctx.println(`deployment.apps/${t.name} rolled back`); return 0; }
  ctx.eprintln('error: supported: rollout status | restart | history | undo'); return 1;
};
/* ---- logs ---- */
KV.logs = async (ctx, K, P) => {
  const cl = K.cl; const ns = K.ns; const t = P.pos[1]; let pods = [];
  if (P.f.l) pods = cl.res.pods.filter(p => p.metadata.namespace === ns && PG.sel(P.f.l, p.metadata.labels));
  else if (!t) { ctx.eprintln('error: expected \'logs [-f] [-p] (POD | TYPE/NAME) [-c CONTAINER]\'.\nPOD or TYPE/NAME is a required argument for the logs command'); return 1; }
  else if (/^(deploy|deployment)s?\//.test(t)) { const d = cl.find('deployments', t.split('/')[1], ns); if (!d) { ctx.eprintln(`Error from server (NotFound): deployments.apps "${t.split('/')[1]}" not found`); return 1; } pods = cl.res.pods.filter(p => p.metadata.namespace === ns && p.metadata._owner && p.metadata._owner.kind === 'ReplicaSet' && p.metadata._owner.name.startsWith(d.metadata.name + '-')); }
  else { const p = cl.find('pods', t.replace(/^pods?\//, ''), ns); if (!p) { ctx.eprintln(`Error from server (NotFound): pods "${t}" not found`); return 1; } pods = [p]; }
  if (!pods.length) { ctx.eprintln(`No resources found in ${ns} namespace.`); return 1; }
  const p = pods[0]; if (!PG.kcCan(K, 'get', 'pods', ns, 'log')) return PG.kcForbid(ctx, K, 'pods', 'get', p.metadata.name, ns, 'log');
  const wantC = P.f.c || P.f.container; const allC = [...(p.spec.initContainers || []), ...p.spec.containers]; if (wantC && !allC.find(x => x.name === wantC)) { ctx.eprintln(`Error from server (BadRequest): container ${wantC} is not valid for pod ${p.metadata.name}`); return 1; }
  if (!wantC && p.spec.containers.length > 1) ctx.eprintln(`Defaulted container "${p.spec.containers[0].name}" out of: ${allC.map(x => x.name).join(', ')}`);
  const st = cl.podStatus(p); const cn = (wantC || p.spec.containers[0].name); const ci = p.spec.containers.findIndex(x => x.name === cn);
  if (ci >= 0 && (!['Running', 'Completed', 'Error', 'CrashLoopBackOff', 'OOMKilled'].includes(st) || p._sim.stage === 'scheduled' || p._sim.stage === 'pulling' || p._sim.stage === 'new' || p._sim.stage === 'init')) { ctx.eprintln(`Error from server (BadRequest): container "${cn}" in pod "${p.metadata.name}" is ${['ErrImagePull', 'ImagePullBackOff'].includes(st) ? 'waiting to start: trying and failing to pull image' : 'waiting to start: ' + (st === 'Pending' ? 'ContainerCreating' : st)}`); return 1; }
  let lines = ci >= 0 ? ((p._sim.cs && p._sim.cs[ci]) ? p._sim.cs[ci].logs : p._sim.logs).slice() : (((p._sim.initLogs || {})[cn]) || []).slice(); if (P.has('previous') || P.has('p')) lines = lines.slice(); const tail = P.f.tail !== undefined ? Number(P.f.tail) : null; if (tail !== null) lines = lines.slice(-tail);
  if (lines.length) ctx.println(lines.join('\n'));
  if (P.has('f') || P.has('follow')) { let n = p._sim.logs.length; while (true) { await ctx.sleep(1); const cur = p._sim.logs; if (cur.length > n) { ctx.println(cur.slice(n).join('\n')); n = cur.length; } } }
  return 0;
};
/* ---- port-forward ---- */
KV['port-forward'] = async (ctx, K, P) => {
  const cl = K.cl; const ns = K.ns; const t = P.pos[1]; const ports = P.pos.slice(2); if (!t || !ports.length) { ctx.eprintln('error: TYPE/NAME and list of ports are required for port-forward'); return 1; }
  const m = /^(?:([a-z]+)\/)?(.+)$/.exec(t); const plural = m[1] ? PG.resolveKind(m[1]) : 'pods'; const name = m[2];
  const obj = cl.find(plural, name, ns); if (!obj) { ctx.eprintln(`Error from server (NotFound): ${plural === 'pods' ? 'pods' : plural} "${name}" not found`); return 1; }
  if (!PG.kcCan(K, 'create', 'pods', ns, 'portforward')) return PG.kcForbid(ctx, K, 'pods', 'create', name, ns, 'portforward');
  const [lp, rp] = ports[0].includes(':') ? ports[0].split(':').map(Number) : [Number(ports[0]), Number(ports[0])];
  let fw = { local: lp, remote: rp, cluster: cl, active: true, target: `${m[1] || 'pod'}/${name}`, onConn: () => ctx.println(`Handling connection for ${lp}`) };
  if (plural === 'services') { if (!cl.endpointsOf(obj).length) { ctx.eprintln(`error: unable to forward port because pod is not running. Current status=Pending`); return 1; } fw.svc = obj; }
  else if (plural === 'deployments') { const pod = cl.res.pods.find(p => p.metadata.namespace === ns && p.metadata._owner && p.metadata._owner.name.startsWith(name + '-') && cl.podReady(p)); if (!pod) { ctx.eprintln('error: unable to forward port because pod is not running. Current status=Pending'); return 1; } fw.pod = pod; }
  else if (plural === 'pods') { if (!cl.podReady(obj)) { ctx.eprintln(`error: unable to forward port because pod is not running. Current status=${cl.podStatus(obj)}`); return 1; } fw.pod = obj; }
  else { ctx.eprintln(`error: cannot port-forward to ${plural}`); return 1; }
  const clash = ctx.sim.forwards.some(f => f.local === lp && f.active) || ctx.sim.containers.some(c => c.status === 'running' && c.ports.some(p => p.host === lp));
  if (clash) { ctx.eprintln(`Unable to listen on port ${lp}: Listeners failed to create with the following errors: [unable to create listener: Error listen tcp4 127.0.0.1:${lp}: bind: address already in use]\nerror: unable to listen on any of the requested ports: [{${lp} ${rp}}]`); return 1; }
  ctx.sim.forwards.push(fw); ctx.println(`Forwarding from 127.0.0.1:${lp} -> ${rp}\nForwarding from [::1]:${lp} -> ${rp}`);
  try { await ctx.sim.waitFor(() => false, ctx.sh, 1e9); } finally { fw.active = false; ctx.sim.forwards = ctx.sim.forwards.filter(f => f !== fw); }
  return 0;
};
/* ---- top ---- */
KV.top = async (ctx, K, P) => {
  const cl = K.cl; const what = P.pos[1]; if (!cl.metricsServer()) { ctx.eprintln('error: Metrics API not available'); return 1; }
  if (what === 'nodes' || what === 'node') { ctx.println(PG.table(cl.nodes.map((n, i) => [n.name, 120 + i * 40 + 'm', (2 + i) + '%', 700 + i * 90 + 'Mi', (6 + i) + '%']), ['NAME', 'CPU(cores)', 'CPU(%)', 'MEMORY(bytes)', 'MEMORY(%)'])); return 0; }
  if (what === 'pods' || what === 'pod') { const all = P.has('A'); const pods = cl.res.pods.filter(p => (all || p.metadata.namespace === K.ns) && cl.podReady(p)); const rows = pods.map(p => { const dep = p.metadata._owner && cl.find('deployments', p.metadata._owner.name.replace(/-[a-z0-9]{6,10}$/, ''), p.metadata.namespace); const req = ((p.spec.containers[0].resources || {}).requests || {}).cpu; const reqM = req ? (String(req).endsWith('m') ? parseInt(req) : parseFloat(req) * 1000) : 100; const util = dep ? Math.round((dep._load === undefined ? 5 : dep._load / Math.max(1, dep.status.readyReplicas || 1))) : 3; return [...(all ? [p.metadata.namespace] : []), p.metadata.name, Math.max(1, Math.round(reqM * util / 100)) + 'm', 8 + (parseInt(PG.hash(p.metadata.name, 4), 16) % 40) + 'Mi']; }); ctx.println(PG.table(rows, [...(all ? ['NAMESPACE'] : []), 'NAME', 'CPU(cores)', 'MEMORY(bytes)'])); return 0; }
  ctx.eprintln('error: top nodes | pods'); return 1;
};
/* ---- cordon / drain ---- */
PG.pdbBlocks = (cl, pod) => { for (const b of cl.res.poddisruptionbudgets.filter(b => b.metadata.namespace === pod.metadata.namespace && PG.selMatch(b.spec.selector, pod.metadata.labels))) { const mine = cl.matchPods(pod.metadata.namespace, b.spec.selector); const healthy = mine.filter(p => cl.podReady(p)).length; const allowed = b.spec.minAvailable !== undefined ? healthy - b.spec.minAvailable : (b.spec.maxUnavailable === undefined ? 1 : b.spec.maxUnavailable) - (mine.length - healthy); if (allowed <= 0 && cl.podReady(pod)) return b; } return null; };
KV.cordon = KV.uncordon = async (ctx, K, P) => { const cl = K.cl; if (!P.pos[1]) { ctx.eprintln(`error: USAGE: ${P.pos[0] || 'cordon'} NODE [flags]`); return 1; } const n = cl.nodeByName(P.pos[1]); if (!n) { ctx.eprintln(`Error from server (NotFound): nodes "${P.pos[1]}" not found`); return 1; } if (!PG.kcCan(K, 'patch', 'nodes', null)) return PG.kcForbid(ctx, K, 'nodes', 'patch', P.pos[1], null); const c = P.pos[0] === 'cordon'; if (n.unschedulable === c) { ctx.println(`node/${n.name} already ${c ? 'cordoned' : 'uncordoned'}`); return 0; } n.unschedulable = c; ctx.println(`node/${n.name} ${c ? 'cordoned' : 'uncordoned'}`); return 0; };
KV.drain = async (ctx, K, P) => {
  if (!P.pos[1]) { ctx.eprintln('error: USAGE: drain NODE [flags]'); return 1; }
  const cl = K.cl; const n = cl.nodeByName(P.pos[1]); if (!n) { ctx.eprintln(`Error from server (NotFound): nodes "${P.pos[1]}" not found`); return 1; }
  if (!PG.kcCan(K, 'patch', 'nodes', null)) return PG.kcForbid(ctx, K, 'nodes', 'patch', P.pos[1], null);
  if (!n.unschedulable) { n.unschedulable = true; ctx.println(`node/${n.name} cordoned`); } else ctx.println(`node/${n.name} already cordoned`);
  const pods = cl.res.pods.filter(p => p.spec.nodeName === n.name && !p.metadata.deletionTimestamp);
  const ds = pods.filter(p => ['DaemonSet', 'Node'].includes(cl.podOwnerKind(p))); const bare = pods.filter(p => !p.metadata._owner); const evict = pods.filter(p => !ds.includes(p) && p.metadata._owner);
  if (ds.length && !P.has('ignore-daemonsets')) { ctx.eprintln(`error: cannot delete DaemonSet-managed Pods (use --ignore-daemonsets to ignore): ${ds.filter(p => cl.podOwnerKind(p) === 'DaemonSet').map(p => p.metadata.namespace + '/' + p.metadata.name).join(', ')}`); return 1; }
  if (bare.length && !P.has('force')) { ctx.eprintln(`error: cannot delete Pods declare no controller (use --force to override): ${bare.map(p => p.metadata.namespace + '/' + p.metadata.name).join(', ')}`); return 1; }
  const eds = pods.filter(p => (p.spec.volumes || []).some(v => v.emptyDir)); if (eds.length && !P.has('delete-emptydir-data')) { ctx.eprintln(`error: cannot delete Pods with local storage (use --delete-emptydir-data to override): ${eds.map(p => p.metadata.namespace + '/' + p.metadata.name).join(', ')}`); return 1; }
  if (ds.length) ctx.eprintln(`Warning: ignoring DaemonSet-managed Pods: ${ds.map(p => p.metadata.namespace + '/' + p.metadata.name).join(', ')}`);
  const todo = [...evict, ...bare]; if (todo.length) ctx.println(`evicting ${todo.length} pod(s)`);
  const t0 = ctx.sim.clock; const tmo = P.f.timeout ? parseInt(P.f.timeout) : 0;
  for (const p of todo) { ctx.println(`evicting pod ${p.metadata.namespace}/${p.metadata.name}`);
    while (true) { if (!cl.res.pods.includes(p)) break; const b = PG.pdbBlocks(cl, p); if (!b) break; ctx.eprintln(`error when evicting pods/"${p.metadata.name}" -n "${p.metadata.namespace}" (will retry after 5s): Cannot evict pod as it would violate the pod's disruption budget.`); if (tmo && ctx.sim.clock - t0 > tmo) { ctx.eprintln('error: global timeout reached: ' + P.f.timeout); return 1; } await ctx.sleep(5); }
    if (cl.res.pods.includes(p)) { cl.killPod(p); await ctx.sim.waitFor(() => !cl.res.pods.includes(p), ctx.sh, 60); } ctx.println(`pod/${p.metadata.name} evicted`); }
  ctx.println(`node/${n.name} drained`); return 0;
};
/* ---- auth ---- */
KV.auth = async (ctx, K, P) => {
  const cl = K.cl; const sub = P.pos[1];
  if (sub === 'whoami') { ctx.println(PG.table([['Username', K.id.user], ['Groups', '[' + K.id.groups.join(' ') + ']']], ['ATTRIBUTE', 'VALUE'])); return 0; }
  if (sub !== 'can-i') { ctx.eprintln('error: supported: kubectl auth can-i VERB RESOURCE | --list | whoami'); return 1; }
  const ns = K.ns;
  if (P.has('list')) {
    const rows = []; const id = K.id; const subjMatch = s => (s.kind === 'User' && s.name === id.user) || (s.kind === 'Group' && id.groups.includes(s.name)) || (s.kind === 'ServiceAccount' && id.user === `system:serviceaccount:${s.namespace}:${s.name}`);
    const rulesOf = (ref, nsx) => { const r = ref.kind === 'ClusterRole' ? cl.find('clusterroles', ref.name) : cl.find('roles', ref.name, nsx); return r ? r.rules : []; };
    const rules = []; for (const b of cl.res.clusterrolebindings) if ((b.subjects || []).some(subjMatch)) rules.push(...rulesOf(b.roleRef)); for (const b of cl.res.rolebindings.filter(b => b.metadata.namespace === ns)) if ((b.subjects || []).some(subjMatch)) rules.push(...rulesOf(b.roleRef, ns));
    for (const r of rules) for (const res of r.resources) { const g = (r.apiGroups || [''])[0]; rows.push([res + (g && g !== '*' && g !== '' ? '.' + g : ''), '[]', '[]', '[' + r.verbs.join(' ') + ']']); }
    rows.push(['selfsubjectreviews.authentication.k8s.io', '[]', '[]', '[create]']); ctx.println(PG.table(rows, ['Resources', 'Non-Resource URLs', 'Resource Names', 'Verbs'])); return 0; }
  const verb = P.pos[2]; let res = P.pos[3]; if (!verb || !res) { ctx.eprintln('error: you must specify two or three arguments: verb, resource, and optional resourceName'); return 1; }
  let sub2 = P.f.subresource || null; if (res.includes('/')) { [res, sub2] = res.split('/'); }
  const plural = PG.resolveKind(res) || res; const ok = cl.authorize(K.id, verb, plural, PG.KINDS[plural] && !PG.KINDS[plural].ns ? null : ns, sub2);
  ctx.println(ok ? 'yes' : 'no'); return ok ? 0 : 1;
};
/* ---- config (kubeconfig) ---- */
PG.kubeconfigYaml = (sim, minify, ctxName) => {
  const kc = sim.kubeconfig; let ctxs = kc.contexts, cls = kc.clusters, us = kc.users; if (minify) { const c = sim.ctxByName(ctxName || kc.current); ctxs = c ? [c] : []; cls = cls.filter(x => c && x.name === c.cluster); us = us.filter(x => c && x.name === c.user); }
  return PG.yaml.dump({ apiVersion: 'v1', kind: 'Config', clusters: cls.map(c => ({ cluster: { 'certificate-authority-data': 'DATA+OMITTED', server: c.server }, name: c.name })), contexts: ctxs.map(c => ({ context: { cluster: c.cluster, ...(c.namespace ? { namespace: c.namespace } : {}), user: c.user }, name: c.name })), 'current-context': kc.current, preferences: {}, users: us.map(u => ({ name: u.name, user: u.auth.kind === 'token' ? { token: 'REDACTED' } : { 'client-certificate-data': 'DATA+OMITTED', 'client-key-data': 'DATA+OMITTED' } })) });
};
KV.config = async (ctx, K0, P) => {
  const sim = ctx.sim; const kc = sim.kubeconfig; const sub = P.pos[1]; const path = '/Users/user/.kube/config';
  if (sub === 'view') { ctx.out(PG.kubeconfigYaml(sim, P.has('minify'), P.f.context)); return 0; }
  if (sub === 'current-context') { if (!kc.current) { ctx.eprintln('error: current-context is not set'); return 1; } ctx.println(kc.current); return 0; }
  if (sub === 'get-contexts') { if (P.f.o === 'name') { ctx.println(kc.contexts.map(c => c.name).join('\n')); return 0; } const rows = kc.contexts.filter(c => !P.pos[2] || c.name === P.pos[2]).map(c => [c.name === kc.current ? '*' : '', c.name, c.cluster, c.user, c.namespace || '']); ctx.println(PG.table(rows, ['CURRENT', 'NAME', 'CLUSTER', 'AUTHINFO', 'NAMESPACE'])); return 0; }
  if (sub === 'get-clusters') { ctx.println('NAME\n' + kc.clusters.map(c => c.name).join('\n')); return 0; }
  if (sub === 'get-users') { ctx.println('NAME\n' + kc.users.map(c => c.name).join('\n')); return 0; }
  if (sub === 'use-context') { if (!sim.ctxByName(P.pos[2])) { ctx.eprintln(`error: no context exists with the name: "${P.pos[2]}"`); return 1; } kc.current = P.pos[2]; ctx.println(`Switched to context "${P.pos[2]}".`); return 0; }
  if (sub === 'rename-context') { const c = sim.ctxByName(P.pos[2]); if (!c) { ctx.eprintln(`error: cannot rename the context "${P.pos[2]}", it's not in ${path}`); return 1; } if (sim.ctxByName(P.pos[3])) { ctx.eprintln(`error: cannot rename the context "${P.pos[2]}", the context "${P.pos[3]}" already exists in ${path}`); return 1; } c.name = P.pos[3]; if (kc.current === P.pos[2]) kc.current = P.pos[3]; ctx.println(`Context "${P.pos[2]}" renamed to "${P.pos[3]}".`); return 0; }
  if (sub === 'delete-context') { const c = sim.ctxByName(P.pos[2]); if (!c) { ctx.eprintln(`error: cannot delete context ${P.pos[2]}, not in ${path}`); return 1; } kc.contexts = kc.contexts.filter(x => x !== c); if (kc.current === c.name) { kc.current = ''; ctx.eprintln('warning: this removed your active context, use "kubectl config use-context" to select a different one'); } ctx.println(`deleted context ${P.pos[2]} from ${path}`); return 0; }
  if (sub === 'delete-cluster') { if (!sim.clusterEntry(P.pos[2])) { ctx.eprintln(`error: cannot delete cluster ${P.pos[2]}, not in ${path}`); return 1; } kc.clusters = kc.clusters.filter(x => x.name !== P.pos[2]); ctx.println(`deleted cluster ${P.pos[2]} from ${path}`); return 0; }
  if (sub === 'delete-user') { if (!sim.userEntry(P.pos[2])) { ctx.eprintln(`error: cannot delete user ${P.pos[2]}, not in ${path}`); return 1; } kc.users = kc.users.filter(x => x.name !== P.pos[2]); ctx.println(`deleted user ${P.pos[2]} from ${path}`); return 0; }
  if (sub === 'unset') { if (P.pos[2] === 'current-context') { kc.current = ''; ctx.println('Property "current-context" unset.'); return 0; } ctx.eprintln('error: only "unset current-context" is simulated'); return 1; }
  if (sub === 'set-context') {
    const cur = P.has('current'); const name = cur ? kc.current : P.pos[2]; if (!name) { ctx.eprintln('error: you cannot specify a context name with --current when there is no current context'); return 1; } let c = sim.ctxByName(name); let verb = 'modified';
    if (!c) { c = { name, cluster: '', user: '', namespace: '' }; kc.contexts.push(c); verb = 'created'; } if (P.f.cluster) c.cluster = P.f.cluster; if (P.f.user) c.user = P.f.user; if (P.f.namespace !== undefined || P.f.n !== undefined) c.namespace = P.f.namespace !== undefined ? P.f.namespace : P.f.n; ctx.println(`Context "${name}" ${verb}.`); return 0; }
  if (sub === 'set-credentials') {
    const name = P.pos[2]; let auth = null;
    if (P.f.token) { auth = { kind: 'token', token: P.f.token }; }
    else if (P.f['client-certificate']) { const cert = ctx.fs.read(ctx.resolve(P.f['client-certificate'])); if (cert === undefined) { ctx.eprintln(`error: unable to read client-cert ${P.f['client-certificate']} for ${name} due to open ${P.f['client-certificate']}: no such file or directory`); return 1; } const m = /CN=([^;\n]+);O=([^;\n]*)/.exec(cert); if (!m) { ctx.eprintln('error: the certificate file is not a valid (simulated) certificate'); return 1; } auth = { kind: 'cert', cn: m[1], groups: m[2].split(',').filter(Boolean) }; }
    else { ctx.eprintln('error: supported: set-credentials NAME --token=… | --client-certificate=… --client-key=…'); return 1; }
    const ex = sim.userEntry(name); if (ex) ex.auth = auth; else kc.users.push({ name, auth }); ctx.println(`User "${name}" set.`); return 0; }
  if (sub === 'set-cluster') { const ex = sim.clusterEntry(P.pos[2]); if (ex) { if (P.f.server) ex.server = P.f.server; } else kc.clusters.push({ name: P.pos[2], server: P.f.server || 'https://localhost:6443' }); ctx.println(`Cluster "${P.pos[2]}" set.`); return 0; }
  ctx.eprintln('error: supported: view, current-context, get-contexts|clusters|users, use-context, rename-context, delete-context|cluster|user, set-context, set-credentials, set-cluster, unset current-context'); return 1;
};
/* ---- the rest ---- */
KV['cluster-info'] = async (ctx, K) => { ctx.println(`Kubernetes control plane is running at ${K.cl.api}\n${K.cl.tool === 'gke' ? 'GLBCDefaultBackend' : 'CoreDNS'} is running at ${K.cl.api}/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy\n\nTo further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.`); return 0; };
KV.version = async (ctx, K, P) => { ctx.println('Client Version: v1.36.1\nKustomize Version: v5.8.1'); if (!P.has('client')) { const cn = ctx.sim.kubeconfig.current; const c = ctx.sim.currentCluster(); if (c && c.apiUp()) ctx.println('Server Version: ' + c.k8sVersion); else ctx.eprintln('The connection to the server localhost:8080 was refused - did you specify the right host or port?'); } return 0; };
KV['api-resources'] = async (ctx) => { ctx.println(PG.table(Object.entries(PG.KINDS).map(([p, k]) => [p, k.names.filter(n => n !== p && n !== k.kind.toLowerCase()).join(',') , k.api, String(k.ns), k.kind]), ['NAME', 'SHORTNAMES', 'APIVERSION', 'NAMESPACED', 'KIND'])); return 0; };
KV.certificate = async (ctx, K, P) => { const cl = K.cl; if (P.pos[1] !== 'approve' && P.pos[1] !== 'deny') { ctx.eprintln('error: supported: certificate approve NAME'); return 1; } const c = cl.find('certificatesigningrequests', P.pos[2]); if (!c) { ctx.eprintln(`Error from server (NotFound): certificatesigningrequests.certificates.k8s.io "${P.pos[2]}" not found`); return 1; } if (!PG.kcCan(K, 'update', 'certificatesigningrequests', null, 'approval')) return PG.kcForbid(ctx, K, 'certificatesigningrequests', 'update', P.pos[2], null, 'approval'); const req = PG.unb64(c.spec.request || ''); const m = /CN=([^;\n]+);O=([^;\n]*)/.exec(req); if (!m) { ctx.eprintln('error: the request is not a valid (simulated) CSR'); return 1; } c.status = { conditions: [{ type: P.pos[1] === 'approve' ? 'Approved' : 'Denied', status: 'True', reason: 'KubectlApprove' }], certificate: PG.b64(`-----BEGIN CERTIFICATE-----\nCN=${m[1]};O=${m[2]};SIGNED-BY=kubernetes-ca\n-----END CERTIFICATE-----\n`) }; ctx.println(`certificatesigningrequest.certificates.k8s.io/${P.pos[2]} ${P.pos[1] === 'approve' ? 'approved' : 'denied'}`); return 0; };
KV.patch = async (ctx, K, P) => { const cl = K.cl; const t = PG.parseTargets(P.pos.slice(1))[0]; if (!t || !t.plural || !t.name || !P.f.p) { ctx.eprintln('error: patch needs TYPE NAME -p PATCH'); return 1; } if (P.f.type && P.f.type !== 'merge' && P.f.type !== 'strategic') { ctx.eprintln('error: only --type=merge / strategic are simulated'); return 1; } let patch; try { patch = JSON.parse(P.f.p); } catch (e) { ctx.eprintln(`error: unable to parse "${P.f.p}": ${e.message}`); return 1; } const o = cl.find(t.plural, t.name, K.ns); if (!o) { ctx.eprintln(`Error from server (NotFound): ${t.plural} "${t.name}" not found`); return 1; } if (!PG.kcCan(K, 'patch', t.plural, K.ns)) return PG.kcForbid(ctx, K, t.plural, 'patch', t.name, K.ns); const before = JSON.stringify(o); const merged = PG.deepMerge(PG.clone({ ...o, status: undefined }), patch); for (const k of Object.keys(merged)) if (!k.startsWith('_')) o[k] = merged[k]; ctx.println(`${PG.fqName(t.plural, t.name)} ${JSON.stringify(o) === before ? 'patched (no change)' : 'patched'}`); return 0; };
KV.events = async (ctx, K, P) => KV.get(ctx, K, { ...P, pos: ['get', 'events'], f: { ...P.f, 'sort-by': '.lastTimestamp' } });

PG.KC_HELP = `kubectl controls the Kubernetes cluster manager (simulated).

Basic:     get describe create apply delete run expose scale autoscale set label annotate taint patch
Rollout:   rollout status|restart|history|undo
Debug:     logs exec port-forward top events cordon uncordon drain
Access:    auth can-i | auth whoami | certificate approve | create token | create role|rolebinding|serviceaccount
Config:    config view|current-context|get-contexts|use-context|set-context|set-credentials|rename-context|delete-context
Other:     cluster-info version api-resources

Flags:  -n NAMESPACE  -A  -o wide|yaml|json|name|jsonpath=…  -l SELECTOR  --context CTX  --as USER  -f FILE|-  -w`;
PG.commands.kubectl = async (ctx, args) => {
  let P = PG.kcParse(args); if (P.pos[0] === 'logs') P = PG.kcParse(args, [], ['f', 'follow', 'p', 'previous']); const verb = P.pos[0]; // logs -f/-p are --follow/--previous, not --filename/--patch
  if (!verb || verb === 'help' || P.has('help') && !verb) { ctx.println(PG.KC_HELP); return 0; }
  if (P.has('help') || P.has('h')) { ctx.println(`Usage: kubectl ${verb} … (see "kubectl" for the list of simulated commands)`); return 0; }
  if (verb === 'config') return KV.config(ctx, null, P);
  if (verb === 'version' && P.has('client')) return KV.version(ctx, null, P);
  const fn = KV[verb]; if (!fn) { ctx.eprintln(`error: unknown command "${verb}" for "kubectl" (the playground simulates: get describe create apply delete run expose scale autoscale set label taint rollout logs exec port-forward top drain auth config …)`); return 1; }
  const K = PG.kcConnect(ctx, P); if (!K) return 1;
  K.ctxP = P; const ctx2 = Object.create(ctx); ctx2.K = K;
  const rc = await fn(ctx, K, P);
  if (!['get', 'describe', 'logs', 'top', 'auth', 'version', 'cluster-info', 'api-resources', 'events'].includes(verb) && K.cl.apiUp()) K.cl.tick(0);
  return rc;
};
PG.commands.kubectl.verbs = Object.keys(KV);
if (typeof module !== 'undefined') module.exports = PG;
