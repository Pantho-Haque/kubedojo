PG.KV = {};
const KV = PG.KV;
PG.parseTargets = tokens => { // -> [{plural, name|null}]
  const out = []; if (!tokens.length) return out;
  if (tokens[0].includes('/')) { for (const t of tokens) { const [ty, nm] = t.split('/'); out.push({ plural: PG.resolveKind(ty), type: ty, name: nm }); } return out; }
  const types = tokens[0].split(','); const names = tokens.slice(1);
  if (types.length === 1 && names.length) { for (const n of names) out.push({ plural: PG.resolveKind(types[0]), type: types[0], name: n }); return out; }
  for (const t of types) out.push({ plural: PG.resolveKind(t), type: t, name: null }); return out;
};
PG.fieldSel = (sel, plural, o) => { if (!sel) return true; return sel.split(',').every(t => { const m = /^([\w.]+)\s*(!=|==?)\s*(.*)$/.exec(t); if (!m) return true; let v; if (m[1] === 'status.phase') v = o.status && o.status.phase || 'Pending'; else v = PG.getPath(o, m[1]); const eq = String(v === undefined ? '' : v) === m[3]; return m[2] === '!=' ? !eq : eq; }); };
PG.needNs = (ctx, K, ns) => { if (!K.cl.find('namespaces', ns)) { ctx.eprintln(`Error from server (NotFound): namespaces "${ns}" not found`); return false; } return true; };
PG.psa = (cl, ns, spec) => {
  const nso = cl.find('namespaces', ns); const lab = (nso && nso.metadata.labels) || {}; const out = { enforce: null, warn: null };
  const chk = level => { const v = []; const cs = spec.containers || [];
    for (const c of cs) { const sc = c.securityContext || {}; if (sc.privileged) v.push(`privileged (container "${c.name}" must not set securityContext.privileged=true)`); }
    if (spec.hostNetwork || spec.hostPID || spec.hostIPC) v.push(`host namespaces (${spec.hostNetwork ? 'hostNetwork=true' : spec.hostPID ? 'hostPID=true' : 'hostIPC=true'})`);
    if ((spec.volumes || []).some(x => x.hostPath)) v.push('hostPath volumes (volume "' + spec.volumes.find(x => x.hostPath).name + '")');
    if (level === 'restricted') { const nm = cs.map(c => `"${c.name}"`).join(', ');
      if (cs.some(c => !(c.securityContext || {}).allowPrivilegeEscalation === false || (c.securityContext || {}).allowPrivilegeEscalation !== false)) v.push(`allowPrivilegeEscalation != false (container${cs.length > 1 ? 's' : ''} ${nm} must set securityContext.allowPrivilegeEscalation=false)`);
      if (cs.some(c => !((c.securityContext || {}).capabilities || {}).drop)) v.push(`unrestricted capabilities (container${cs.length > 1 ? 's' : ''} ${nm} must set securityContext.capabilities.drop=["ALL"])`);
      if (cs.some(c => !(c.securityContext || {}).runAsNonRoot && !(spec.securityContext || {}).runAsNonRoot)) v.push(`runAsNonRoot != true (pod or container${cs.length > 1 ? 's' : ''} ${nm} must set securityContext.runAsNonRoot=true)`);
      if (cs.some(c => !((c.securityContext || {}).seccompProfile) && !((spec.securityContext || {}).seccompProfile))) v.push(`seccompProfile (pod or container${cs.length > 1 ? 's' : ''} ${nm} must set securityContext.seccompProfile.type to "RuntimeDefault" or "Localhost")`); }
    return v; };
  const e = lab['pod-security.kubernetes.io/enforce']; const w = lab['pod-security.kubernetes.io/warn'];
  if (e && e !== 'privileged') { const v = chk(e); if (v.length) out.enforce = `violates PodSecurity "${e}:latest": ${v.join(', ')}`; }
  if (w && w !== 'privileged') { const v = chk(w); if (v.length) out.warn = `would violate PodSecurity "${w}:latest": ${v.join(', ')}`; }
  return out;
};
PG.Cluster.prototype.admitPod = function (ns, spec, podName) {
  const sa = spec.serviceAccountName || 'default'; if (!this.find('serviceaccounts', sa, ns)) return `pods "${podName}" is forbidden: error looking up service account ${ns}/${sa}: serviceaccount "${sa}" not found`;
  const p = PG.psa(this, ns, spec); if (p.enforce) return `pods "${podName}" is forbidden: ${p.enforce}`;
  for (const q of this.res.resourcequotas.filter(q => q.metadata.namespace === ns)) { const h = (q.spec.hard || {}).pods; if (h !== undefined) { const used = PG.quotaUsed(this, q, 'pods'); if (used >= Number(h)) return `pods "${podName}" is forbidden: exceeded quota: ${q.metadata.name}, requested: pods=1, used: pods=${used}, limited: pods=${h}`; } }
  return null;
};
/* ---- create / update objects from manifests ---- */
PG.mkObject = (ctx, K, doc, ns, mode) => { // returns {ok, name, plural, verb} or {err}
  const cl = K.cl; const plural = PG.KIND_OF[doc.kind]; const src = ctx.src || 'STDIN';
  if (!plural || PG.KINDS[plural].virtual) return { err: `error: resource mapping not found for name: "${(doc.metadata || {}).name || ''}" namespace: "" from "${src}": no matches for kind "${doc.kind}" in version "${doc.apiVersion}"\nensure CRDs are installed first` };
  const kd = PG.KINDS[plural]; const meta = doc.metadata || {}; const name = meta.name; if (!name) return { err: `error: error validating "${src}": error validating data: [metadata.name: Required value]; if you choose to ignore these errors, turn validation off with --validate=false` };
  const nsx = kd.ns ? (meta.namespace || ns) : null;
  if (kd.ns && !cl.find('namespaces', nsx)) return { err: `Error from server (NotFound): error when creating "${src}": namespaces "${nsx}" not found` };
  const existing = cl.find(plural, name, nsx);
  if (existing && mode === 'create') return { err: `Error from server (AlreadyExists): error when creating "${src}": ${plural} "${name}" already exists` };
  const body = {}; for (const [k, v] of Object.entries(doc)) if (!['apiVersion', 'kind', 'metadata', 'status'].includes(k)) body[k] = PG.clone(v);
  const labels = PG.clone(meta.labels || {}); const annotations = PG.clone(meta.annotations || {});
  if (plural === 'deployments') {
    if (!doc.spec || !doc.spec.selector || !doc.spec.selector.matchLabels) return { err: `The Deployment "${name}" is invalid: spec.selector: Required value` };
    if (!doc.spec.template || !PG.selMatch(doc.spec.selector, ((doc.spec.template.metadata || {}).labels))) return { err: `The Deployment "${name}" is invalid: spec.template.metadata.labels: Invalid value: map[string]string{...}: \`selector\` does not match template \`labels\`` };
    body.spec.template.metadata = body.spec.template.metadata || {}; if (body.spec.replicas === undefined) body.spec.replicas = 1;
    if (existing && JSON.stringify(existing.spec.selector) !== JSON.stringify(body.spec.selector)) return { err: `The Deployment "${name}" is invalid: spec.selector: Invalid value: v1.LabelSelector{MatchLabels:map[string]string{...}}: field is immutable` };
  }
  if (plural === 'rolebindings' || plural === 'clusterrolebindings') { if (existing && JSON.stringify(existing.roleRef) !== JSON.stringify(body.roleRef)) return { err: `The ${kd.kind} "${name}" is invalid: roleRef: Invalid value: rbac.RoleRef{...}: cannot change roleRef` }; if (!body.roleRef) return { err: `The ${kd.kind} "${name}" is invalid: roleRef.kind: Unsupported value` }; }
  if (plural === 'pods') { const a = cl.admitPod(nsx, body.spec || {}, name); if (a) return { err: `Error from server (Forbidden): error when creating "${src}": ${a}` }; }
  if (existing) {
    const before = JSON.stringify({ l: existing.metadata.labels, a: existing.metadata.annotations, b: Object.fromEntries(Object.entries(existing).filter(([k]) => !['apiVersion', 'kind', 'metadata', 'status'].includes(k) && !k.startsWith('_'))) });
    if (plural === 'services') { const old = existing.spec; for (const p of body.spec.ports || []) { const op = (old.ports || []).find(x => x.port === p.port); if (op && !p.nodePort) p.nodePort = op.nodePort; } body.spec.clusterIP = body.spec.clusterIP || old.clusterIP; }
    if (plural === 'pods') { return { err: `The Pod "${name}" is invalid: spec: Forbidden: pod updates may not change fields other than \`spec.containers[*].image\`, \`spec.initContainers[*].image\`, \`spec.activeDeadlineSeconds\`, \`spec.tolerations\` (only additions to existing tolerations) or \`spec.terminationGracePeriodSeconds\` (allow it to be set to 1 if it was previously negative)` }; }
    existing.metadata.labels = Object.keys(labels).length ? labels : undefined; existing.metadata.annotations = Object.keys(annotations).length ? { ...annotations } : undefined;
    for (const [k, v] of Object.entries(body)) existing[k] = v;
    if (plural === 'services') cl.normalizeService(existing);
    const after = JSON.stringify({ l: existing.metadata.labels, a: existing.metadata.annotations, b: Object.fromEntries(Object.entries(existing).filter(([k]) => !['apiVersion', 'kind', 'metadata', 'status'].includes(k) && !k.startsWith('_'))) });
    return { ok: true, plural, name, verb: before === after ? 'unchanged' : 'configured', obj: existing };
  }
  let obj;
  if (plural === 'namespaces') { obj = cl.addNamespace(name); obj.metadata.labels = { 'kubernetes.io/metadata.name': name, ...labels }; if (Object.keys(annotations).length) obj.metadata.annotations = annotations; }
  else if (plural === 'pods') { obj = cl.newPod(nsx, name, labels, body.spec, null, { annotations }); }
  else { obj = cl.mk(plural, name, nsx, { metadata: { labels, annotations }, ...body }); if (plural === 'services') cl.normalizeService(obj); if (plural === 'secrets') obj.type = obj.type || 'Opaque'; if (plural === 'horizontalpodautoscalers') obj.status = {}; if (plural === 'jobs') obj.status = {}; if (plural === 'certificatesigningrequests') obj.status = {}; if (plural === 'persistentvolumeclaims') obj.status = { phase: 'Pending' }; if (plural === 'deployments' || plural === 'daemonsets') obj.status = {}; }
  const warn = (plural === 'pods' || plural === 'deployments') ? PG.psa(cl, nsx, plural === 'pods' ? body.spec : body.spec.template.spec).warn : null;
  return { ok: true, plural, name, verb: 'created', obj, warn };
};
PG.readManifest = (ctx, P) => {
  const f = P.f.f; if (!f) return { err: 'error: must specify one of -f and -k' };
  let text; if (f === '-') text = ctx.stdin; else { text = ctx.fs.read(ctx.resolve(f)); if (text === undefined) return { err: `error: the path "${f}" does not exist` }; }
  if (text === null || text === undefined || !text.trim()) return { err: 'error: no objects passed to apply' };
  let docs; try { docs = PG.yaml.parseDocs(text); } catch (e) { return { err: `error: error parsing ${f === '-' ? 'STDIN' : f}: ${e.message}` }; }
  const flat = []; for (const d of docs) { if (d && d.kind === 'List') flat.push(...(d.items || [])); else if (d && PG.isObj(d)) flat.push(d); else if (d !== undefined) return { err: `error: error parsing ${f === '-' ? 'STDIN' : f}: error converting YAML to JSON: yaml: line 1: did not find expected key` }; }
  return { docs: flat, src: f === '-' ? 'STDIN' : f };
};
KV.apply = async (ctx, K, P, mode = 'apply') => {
  if (/^https?:\/\//.test(P.f.f || '')) {
    const url = P.f.f; const cl = K.cl;
    if (/metrics-server/.test(url)) { if (cl.find('deployments', 'metrics-server', 'kube-system')) { ctx.println('serviceaccount/metrics-server unchanged\ndeployment.apps/metrics-server unchanged'); return 0; } for (const l of ['serviceaccount/metrics-server', 'clusterrole.rbac.authorization.k8s.io/system:metrics-server', 'service/metrics-server']) ctx.println(l + ' created'); cl.systemDeployment('kube-system', 'metrics-server', 'registry.k8s.io/metrics-server/metrics-server:v0.7.2', 1, { 'k8s-app': 'metrics-server' }); ctx.println('deployment.apps/metrics-server created'); return 0; }
    if (/ingress-nginx/.test(url)) { if (cl.find('deployments', 'ingress-nginx-controller', 'ingress-nginx')) { ctx.println('deployment.apps/ingress-nginx-controller unchanged'); return 0; } cl.addNamespace('ingress-nginx'); cl.systemDeployment('ingress-nginx', 'ingress-nginx-controller', 'registry.k8s.io/ingress-nginx/controller:v1.12.0', 1, { 'app.kubernetes.io/name': 'ingress-nginx' }); const sv = cl.mk('services', 'ingress-nginx-controller', 'ingress-nginx', { metadata: { labels: { 'app.kubernetes.io/name': 'ingress-nginx' } }, spec: { type: 'NodePort', selector: { 'app.kubernetes.io/name': 'ingress-nginx' }, ports: [{ name: 'http', port: 80, targetPort: 80 }, { name: 'https', port: 443, targetPort: 443 }] }, status: {} }); cl.normalizeService(sv); ctx.println('namespace/ingress-nginx created\nserviceaccount/ingress-nginx created\nservice/ingress-nginx-controller created\ndeployment.apps/ingress-nginx-controller created\ningressclass.networking.k8s.io/nginx created'); return 0; }
    if (/gateway-api/.test(url)) { ctx.println('customresourcedefinition.apiextensions.k8s.io/gateways.gateway.networking.k8s.io created\ncustomresourcedefinition.apiextensions.k8s.io/httproutes.gateway.networking.k8s.io created (simulated: CRDs are not modelled)'); return 0; }
    ctx.eprintln(`error: unable to read URL "${url}", server reported 404 Not Found, status code=404 (the playground has no internet; known URLs: metrics-server components.yaml, ingress-nginx deploy.yaml)`); return 1;
  }
  const m = PG.readManifest(ctx, P); if (m.err) { ctx.eprintln(m.err); return 1; }
  ctx.src = m.src; let code = 0;
  if (P.f['dry-run'] || P.has('dry-run')) { if (P.f.o === 'yaml') { ctx.out(m.docs.map(d => PG.yaml.dump(d)).join('---\n')); return 0; } for (const d of m.docs) ctx.println(`${PG.fqName(PG.KIND_OF[d.kind] || 'pods', (d.metadata || {}).name)} created (dry run)`); return 0; }
  for (const d of m.docs) {
    const plural = PG.KIND_OF[d.kind]; const ns = ((d.metadata || {}).namespace) || K.ns;
    if (plural) { const existed = K.cl.find(plural, (d.metadata || {}).name, ns); const verb = existed ? (mode === 'create' ? 'create' : 'patch') : 'create'; if (!PG.kcCan(K, verb, plural, ns)) { PG.kcForbid(ctx, K, plural, verb, (d.metadata || {}).name, ns); code = 1; continue; } }
    const r = PG.mkObject(ctx, K, d, K.ns, mode); if (r.err) { ctx.eprintln(r.err); code = 1; continue; }
    if (r.warn) ctx.eprintln(`Warning: ${r.warn}`);
    ctx.println(`${PG.fqName(r.plural, r.name)} ${r.verb}`);
  }
  return code;
};
/* ---- get ---- */
KV.get = async (ctx, K, P) => {
  const tokens = P.pos.slice(1); if (!tokens.length) { ctx.eprintln('You must specify the type of resource to get. Use "kubectl api-resources" for a complete list of supported resources.'); return 1; }
  const cl = K.cl; const all = P.has('A') || P.has('all-namespaces'); const out = P.f.o; const o = { wide: out === 'wide', all, showLabels: P.has('show-labels'), noHeaders: P.has('no-headers'), out };
  let targets;
  if (tokens[0] === 'all') targets = ['pods', 'services', 'daemonsets', 'deployments', 'replicasets', 'horizontalpodautoscalers', 'jobs', 'cronjobs'].map(p => ({ plural: p, name: null, prefix: true })); else targets = PG.parseTargets(tokens);
  for (const t of targets) if (!t.plural) { ctx.eprintln(`error: the server doesn't have a resource type "${t.type}"`); if (/^clusters?$/.test(t.type)) ctx.info('(a cluster is not a Kubernetes object, so kubectl cannot delete it. Use: kind delete cluster --name NAME · k3d cluster delete NAME · gcloud container clusters delete NAME --zone ZONE --quiet)'); return 1; }
  const multi = targets.length > 1 || tokens[0] === 'all'; const collected = []; let code = 0;
  for (const t of targets) {
    const verb = t.name ? 'get' : 'list'; if (!PG.kcCan(K, verb, t.plural, K.ns)) { PG.kcForbid(ctx, K, t.plural, verb, t.name, K.ns); return 1; }
    let objs = PG.listObjs(cl, t.plural, K.ns, all && PG.KINDS[t.plural].ns);
    if (t.name) { objs = objs.filter(x => x.metadata.name === t.name); if (!objs.length) { ctx.eprintln(`Error from server (NotFound): ${t.plural} "${t.name}" not found`); code = 1; continue; } }
    if (P.f.l) objs = objs.filter(x => PG.sel(P.f.l, x.metadata.labels)); if (P.f['field-selector']) objs = objs.filter(x => PG.fieldSel(P.f['field-selector'], t.plural, x));
    if (t.plural === 'events' && P.f['sort-by']) objs.sort((a, b) => a._e.t - b._e.t);
    collected.push({ t, objs });
  }
  if (out && out !== 'wide' && !/^custom/.test(out)) { const flat = collected.flatMap(c => c.objs.map(x => ({ p: c.t.plural, x }))); if (collected.length === 1) { if (!flat.length && !collected[0].t.name) { ctx.eprintln(`No resources found${PG.KINDS[collected[0].t.plural].ns && !all ? ' in ' + K.ns + ' namespace' : ''}.`); return code; } PG.outputObjs(ctx, cl, collected[0].t.plural, collected[0].objs, o, !!collected[0].t.name); } else { for (const f of flat) PG.outputObjs(ctx, cl, f.p, [f.x], o, true); } return code; }
  let printed = false; const widths = {};
  for (const { t, objs } of collected) {
    if (!objs.length) { if (!multi) ctx.eprintln(`No resources found${PG.KINDS[t.plural].ns && !all ? ' in ' + K.ns + ' namespace' : ''}.`); continue; }
    const tb = PG.renderTable(cl, t.plural, objs, o);
    let text = tb.text; if (multi) { const lines = text.split('\n'); const kn = PG.KINDS[t.plural].kind.toLowerCase() + (PG.KINDS[t.plural].group ? '.' + PG.KINDS[t.plural].group : ''); const ni = all && PG.KINDS[t.plural].ns ? 1 : 0; const rows = tb.rows.map(r => { const c = [...r]; c[ni] = kn + '/' + c[ni]; return c; }); text = PG.table(rows, tb.header); }
    if (printed) ctx.println(''); ctx.println(text); printed = true;
  }
  if (P.has('w') || P.has('watch')) {
    const t = collected[0].t; const seen = new Map(); const rowOf = x => PG.renderTable(cl, t.plural, [x], { ...o }).rows[0]; for (const x of collected[0].objs) seen.set(x.metadata.namespace + '/' + x.metadata.name, rowOf(x).join('|'));
    const tb0 = PG.renderTable(cl, t.plural, collected[0].objs, o); const w = tb0.header.map((h, i) => Math.max(h.length, ...tb0.rows.map(r => String(r[i]).length)) + 3);
    while (true) { await ctx.sleep(1); let objs = PG.listObjs(cl, t.plural, K.ns, all); if (t.name) objs = objs.filter(x => x.metadata.name === t.name); if (P.f.l) objs = objs.filter(x => PG.sel(P.f.l, x.metadata.labels));
      for (const x of objs) { const key = x.metadata.namespace + '/' + x.metadata.name; const r = rowOf(x); const s = r.join('|'); const prev = seen.get(key); const nowS = r.map((c, i) => i === 4 && t.plural === 'pods' ? '' : c).join('|'); if (prev === undefined || prev.split('|').slice(0, -1).join('|') !== s.split('|').slice(0, -1).join('|')) { seen.set(key, s); ctx.println(r.map((c, i) => { if (i === r.length - 1) return c; w[i] = Math.max(w[i] || 0, String(c).length + 3); return PG.pad(c, w[i]); }).join('')); } }
      for (const k of [...seen.keys()]) if (!objs.find(x => x.metadata.namespace + '/' + x.metadata.name === k)) seen.delete(k);
    }
  }
  return code;
};
/* ---- describe ---- */
PG.evFrom = e => /^(Scheduled|FailedScheduling)$/.test(e.reason) ? 'default-scheduler' : e.reason === 'ScalingReplicaSet' ? 'deployment-controller' : e.reason === 'SuccessfulRescale' ? 'horizontal-pod-autoscaler' : e.reason === 'FailedCreate' ? 'replicaset-controller' : 'kubelet';
PG.evTable = (cl, kind, name, ns) => { const ev = cl.res.events.filter(e => e.kind === kind && e.name === name && (!ns || e.ns === ns)).slice(-12); if (!ev.length) return 'Events:                <none>'; return 'Events:\n' + PG.table(ev.map(e => [e.type, e.reason, (e.count > 1 ? `${PG.fmtAge(cl.clock - e.lastT)} (x${e.count} over ${PG.fmtAge(cl.clock - e.t)})` : PG.fmtAge(cl.clock - e.t)), PG.evFrom(e), e.message]).map(r => ['  ' + r[0], r[1], r[2], r[3], r[4]]), ['  Type', 'Reason', 'Age', 'From', 'Message']); };
PG.kvLines = (m, indent) => { const e = Object.entries(m || {}); if (!e.length) return '<none>'; return e.map(([k, v], i) => (i ? indent : '') + k + '=' + v).join('\n'); };
PG.probeStr = (kind, pr) => { const t = pr.httpGet ? `http-get http://:${pr.httpGet.port}${pr.httpGet.path || '/'}` : pr.tcpSocket ? `tcp-socket :${pr.tcpSocket.port}` : `exec [${(pr.exec.command || []).join(' ')}]`; return `    ${kind}:`.padEnd(18) + `${t} delay=${pr.initialDelaySeconds || 0}s timeout=${pr.timeoutSeconds || 1}s period=${pr.periodSeconds || 10}s #success=${pr.successThreshold || 1} #failure=${pr.failureThreshold || 3}`; };
PG.DESC = {
  pods: (cl, p) => {
    const sm = p._sim; const node = cl.nodeByName(p.spec.nodeName); const st = cl.podStatus(p); const own = p.metadata._owner; const inits = p.spec.initContainers || [];
    const block = (c, idx, isInit) => {
      const cs = isInit ? null : (sm.cs && sm.cs[idx]); let state, ready, last = '', restarts = isInit ? (sm.initRestarts || 0) : (cs ? cs.restarts : (idx === 0 ? sm.restarts || 0 : 0));
      if (isInit) { const done = sm.initIdx !== undefined ? idx < sm.initIdx : ['running', 'done'].includes(sm.stage); const cur = sm.stage === 'init' && idx === sm.initIdx; state = done ? 'Terminated\n      Reason:       Completed\n      Exit Code:    0' : cur ? (/Err|CrashLoop/.test(st) ? `Waiting\n      Reason:       ${st.replace('Init:', '')}` : `Running\n      Started:      ${p.status.startTime}`) : `Waiting\n      Reason:       ${sm.stage === 'pulling' || sm.stage === 'scheduled' ? st.replace('Init:', '') : 'PodInitializing'}`; ready = done; }
      else if (!cs) { state = `Waiting\n      Reason:       ${st === 'Pending' ? 'PodInitializing' : st}`; ready = false; }
      else { state = cs.status === 'Running' ? `Running\n      Started:      ${p.status.startTime}` : cs.done && cs.ok ? 'Terminated\n      Reason:       Completed\n      Exit Code:    0' : `Waiting\n      Reason:       ${cs.status === 'OOMKilled' ? 'CrashLoopBackOff' : cs.status}`; ready = cs.ready; if (cs.last && cs.restarts) last = `    Last State:     Terminated\n      Reason:       ${cs.last.reason}\n      Exit Code:    ${cs.last.exitCode}\n`; }
      const res = c.resources || {}; const resTxt = (res.limits || res.requests) ? [res.limits ? '    Limits:\n      ' + Object.entries(res.limits).map(([k, v]) => k + ': ' + v).join('\n      ') : '', res.requests ? '    Requests:\n      ' + Object.entries(res.requests).map(([k, v]) => k + ': ' + v).join('\n      ') : ''].filter(Boolean).join('\n') + '\n' : '';
      const probes = [c.livenessProbe && PG.probeStr('Liveness', c.livenessProbe), c.readinessProbe && PG.probeStr('Readiness', c.readinessProbe), c.startupProbe && PG.probeStr('Startup', c.startupProbe)].filter(Boolean).join('\n'); const argv = [...(c.command || []), ...(c.args || [])];
      return `  ${c.name}:\n    Container ID:   containerd://${PG.hash(p.metadata.name + c.name, 40)}\n    Image:          ${c.image}\n    Image ID:       docker.io/library/${c.image.split(':')[0]}@sha256:${PG.hash(c.image, 40)}\n    Port:           ${(c.ports || []).map(x => x.containerPort + '/TCP').join(', ') || '<none>'}\n${argv.length ? '    Command:\n      ' + argv.join('\n      ') + '\n' : ''}    State:          ${state}\n${last}    Ready:          ${ready ? 'True' : 'False'}\n    Restart Count:  ${restarts}\n${resTxt}${probes ? probes + '\n' : ''}    Environment:    ${(c.env || []).length || (c.envFrom || []).length ? '\n' + [...(c.envFrom || []).map(e => '      ' + (e.configMapRef ? e.configMapRef.name + ' ConfigMap' : e.secretRef.name + ' Secret') + ' Optional: ' + !!(e.configMapRef || e.secretRef).optional), ...(c.env || []).map(e => '      ' + e.name + ': ' + (e.value !== undefined ? e.value : '(from source)'))].join('\n') : '<none>'}\n    Mounts:\n${(c.volumeMounts || []).map(m => `      ${m.mountPath} from ${m.name} (rw)`).join('\n')}${(c.volumeMounts || []).length ? '\n' : ''}      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access (ro)\n`;
    };
    const initDone = !inits.length || sm.stage === 'running' || sm.stage === 'done';
    return `Name:             ${p.metadata.name}\nNamespace:        ${p.metadata.namespace}\nPriority:         0\nService Account:  ${p.spec.serviceAccountName}\nNode:             ${node ? node.name + '/' + node.ip : '<none>'}\nStart Time:       ${p.status.startTime || '<none>'}\nLabels:           ${PG.kvLines(p.metadata.labels, '                  ')}\nAnnotations:      ${PG.kvLines(p.metadata.annotations, '                  ')}\nStatus:           ${p.status.phase === 'Running' && !cl.podReady(p) ? 'Running' : p.status.phase}\nIP:               ${p.status.podIP || ''}\nIPs:\n  IP:           ${p.status.podIP || ''}\nControlled By:  ${own ? own.kind + '/' + own.name : '<none>'}\n${inits.length ? 'Init Containers:\n' + inits.map((c, i) => block(c, i, true)).join('') : ''}Containers:\n${p.spec.containers.map((c, i) => block(c, i, false)).join('')}Conditions:\n  Type                        Status\n  PodReadyToStartContainers   ${p.status.podIP ? 'True' : 'False'}\n  Initialized                 ${initDone ? 'True' : 'False'}\n  Ready                       ${cl.podReady(p) ? 'True' : 'False'}\n  ContainersReady             ${cl.podReady(p) ? 'True' : 'False'}\n  PodScheduled                ${p.spec.nodeName ? 'True' : 'False'}\nVolumes:\n${(p.spec.volumes || []).map(v => `  ${v.name}:\n    Type:  ${v.configMap ? 'ConfigMap (a volume populated by a ConfigMap)\n    Name:  ' + v.configMap.name : v.secret ? 'Secret\n    SecretName:  ' + v.secret.secretName : v.emptyDir ? 'EmptyDir (a temporary directory that shares a pod\'s lifetime)' : v.persistentVolumeClaim ? 'PersistentVolumeClaim\n    ClaimName:  ' + v.persistentVolumeClaim.claimName : 'Other'}`).join('\n') || '  <none>'}\nQoS Class:        BestEffort\nNode-Selectors:   ${PG.kvLines(p.spec.nodeSelector, '                  ')}\nTolerations:      node.kubernetes.io/not-ready:NoExecute op=Exists for 300s\n                  node.kubernetes.io/unreachable:NoExecute op=Exists for 300s\n${PG.evTable(cl, 'Pod', p.metadata.name, p.metadata.namespace)}`;
  },
  nodes: (cl, n) => { const nd = n._node; const pods = cl.res.pods.filter(p => p.spec.nodeName === nd.name); return `Name:               ${nd.name}\nRoles:              ${Object.keys(nd.labels).filter(k => k.startsWith('node-role.kubernetes.io/')).map(k => k.split('/')[1]).join(',') || '<none>'}\nLabels:             ${PG.kvLines(nd.labels, '                    ')}\nAnnotations:        node.alpha.kubernetes.io/ttl: 0\nCreationTimestamp:  ${PG.iso(nd.createdAt)}\nTaints:             ${nd.taints.length ? nd.taints.map(t => `${t.key}${t.value ? '=' + t.value : ''}:${t.effect}`).join('\n                    ') : '<none>'}\nUnschedulable:      ${nd.unschedulable}\nConditions:\n  Type             Status  Reason\n  Ready            ${nd.ready ? 'True' : 'Unknown'}    ${nd.ready ? 'KubeletReady' : 'NodeStatusUnknown'}\nAddresses:\n  InternalIP:  ${nd.ip}\n  Hostname:    ${nd.name}\nCapacity:\n  cpu:     6\n  memory:  11975508Ki\n  pods:    110\nSystem Info:\n  Kernel Version:             6.12.13-linuxkit\n  OS Image:                   ${nd.osImage}\n  Operating System:           linux\n  Architecture:               arm64\n  Container Runtime Version:  ${nd.runtime}\n  Kubelet Version:            ${nd.version}\nNon-terminated Pods:          (${pods.length} in total)\n${PG.table(pods.map(p => ['  ' + p.metadata.namespace, p.metadata.name, '0 (0%)', '0 (0%)', '0 (0%)', '0 (0%)', PG.fmtAge(cl.clock - p.metadata._t)]), ['  Namespace', 'Name', 'CPU Requests', 'CPU Limits', 'Memory Requests', 'Memory Limits', 'Age'])}\n${PG.evTable(cl, 'Node', nd.name)}`; },
  services: (cl, s) => { const eps = cl.endpointsOf(s); return `Name:                     ${s.metadata.name}\nNamespace:                ${s.metadata.namespace}\nLabels:                   ${PG.kvLines(s.metadata.labels, '                          ')}\nAnnotations:              ${PG.kvLines(s.metadata.annotations, '                          ')}\nSelector:                 ${PG.selStr(s.spec.selector)}\nType:                     ${s.spec.type}\nIP Family Policy:         SingleStack\nIP Families:              IPv4\nIP:                       ${s.spec.clusterIP}\nIPs:                      ${s.spec.clusterIP}\n${s.spec.type === 'LoadBalancer' ? 'LoadBalancer Ingress:     ' + PG.extIp(s) + '\n' : ''}${(s.spec.ports || []).map(p => `Port:                     ${p.name || '<unset>'}  ${p.port}/${p.protocol}\nTargetPort:               ${p.targetPort === undefined ? p.port : p.targetPort}/${p.protocol}\n${p.nodePort ? 'NodePort:                 ' + (p.name || '<unset>') + '  ' + p.nodePort + '/' + p.protocol + '\n' : ''}`).join('')}Endpoints:                ${eps.length ? [...new Set(eps.map(e => e.ip + ':' + e.port))].join(',') : '<none>'}\nSession Affinity:         None\n${PG.evTable(cl, 'Service', s.metadata.name, s.metadata.namespace)}`; },
  deployments: (cl, d) => { const s = d.status || {}; const rss = cl.res.replicasets.filter(r => r.metadata._owner && r.metadata._owner.name === d.metadata.name && r.metadata.namespace === d.metadata.namespace); const cur = rss.find(r => r._hash === cl.depHash(d)); const c = d.spec.template.spec.containers[0]; const ru = (d.spec.strategy || {}).rollingUpdate || {}; return `Name:                   ${d.metadata.name}\nNamespace:              ${d.metadata.namespace}\nCreationTimestamp:      ${d.metadata.creationTimestamp}\nLabels:                 ${PG.kvLines(d.metadata.labels, '                        ')}\nAnnotations:            deployment.kubernetes.io/revision: ${cur ? cur.metadata.annotations['deployment.kubernetes.io/revision'] : 1}\nSelector:               ${PG.selStr(d.spec.selector.matchLabels)}\nReplicas:               ${d.spec.replicas} desired | ${s.updatedReplicas || 0} updated | ${s.replicas || 0} total | ${s.availableReplicas || 0} available | ${(s.replicas || 0) - (s.availableReplicas || 0)} unavailable\nStrategyType:           ${(d.spec.strategy || {}).type || 'RollingUpdate'}\nRollingUpdateStrategy:  ${ru.maxUnavailable === undefined ? '25%' : ru.maxUnavailable} max unavailable, ${ru.maxSurge === undefined ? '25%' : ru.maxSurge} max surge\nPod Template:\n  Labels:  ${PG.kvLines(d.spec.template.metadata.labels, '           ')}\n  Containers:\n   ${c.name}:\n    Image:      ${c.image}\n    Port:       ${(c.ports || []).map(x => x.containerPort + '/TCP').join(', ') || '<none>'}\n    Host Port:  0/TCP\n    Environment:  ${(c.env || []).length ? '' : '<none>'}\n    Mounts:       <none>\n  Volumes:        <none>\nConditions:\n  Type           Status  Reason\n  Available      ${(s.availableReplicas || 0) >= (d.spec.replicas || 0) - 1 ? 'True' : 'False'}    MinimumReplicasAvailable\n  Progressing    True    NewReplicaSetAvailable\nOldReplicaSets:  ${rss.filter(r => r !== cur && r.spec.replicas > 0).map(r => r.metadata.name + ' (' + (r.status.replicas || 0) + '/' + r.spec.replicas + ' replicas created)').join(', ') || '<none>'}\nNewReplicaSet:   ${cur ? cur.metadata.name + ' (' + (cur.status.replicas || 0) + '/' + cur.spec.replicas + ' replicas created)' : '<none>'}\n${PG.evTable(cl, 'Deployment', d.metadata.name, d.metadata.namespace)}`; },
  namespaces: (cl, n) => `Name:         ${n.metadata.name}\nLabels:       ${PG.kvLines(n.metadata.labels, '              ')}\nAnnotations:  <none>\nStatus:       ${n._deleteAt ? 'Terminating' : 'Active'}\n\nNo resource quota.\n\nNo LimitRange resource.`,
};
KV.describe = async (ctx, K, P) => {
  const tokens = P.pos.slice(1); const targets = PG.parseTargets(tokens); if (!targets.length) { ctx.eprintln('error: You must specify the type of resource to describe. Use "kubectl api-resources" for a complete list of supported resources.'); return 1; }
  let first = true; const cl = K.cl;
  for (const t of targets) {
    if (!t.plural) { ctx.eprintln(`error: the server doesn't have a resource type "${t.type}"`); if (/^clusters?$/.test(t.type)) ctx.info('(a cluster is not a Kubernetes object, so kubectl cannot delete it. Use: kind delete cluster --name NAME · k3d cluster delete NAME · gcloud container clusters delete NAME --zone ZONE --quiet)'); return 1; }
    let objs = PG.listObjs(cl, t.plural, K.ns, false); if (t.name) objs = objs.filter(x => x.metadata.name === t.name); else if (P.f.l) objs = objs.filter(x => PG.sel(P.f.l, x.metadata.labels));
    if (!objs.length) { ctx.eprintln(t.name ? `Error from server (NotFound): ${t.plural} "${t.name}" not found` : `No resources found in ${K.ns} namespace.`); return 1; }
    for (const o of objs) { if (!PG.kcCan(K, 'get', t.plural, K.ns)) return PG.kcForbid(ctx, K, t.plural, 'get', o.metadata.name, K.ns); if (!first) ctx.println('\n'); first = false; ctx.println((PG.DESC[t.plural] ? PG.DESC[t.plural](cl, o) : PG.yaml.dump(PG.cleanForOutput(cl, t.plural, o)).trimEnd() + '\n' + PG.evTable(cl, PG.KINDS[t.plural].kind, o.metadata.name, o.metadata.namespace))); }
  }
  return 0;
};
if (typeof module !== 'undefined') module.exports = PG;
