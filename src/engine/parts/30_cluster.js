/* ============================================================ resource kinds ==== */
PG.KINDS = {
  pods: { kind: 'Pod', api: 'v1', group: '', ns: true, names: ['pod', 'pods', 'po'] },
  services: { kind: 'Service', api: 'v1', group: '', ns: true, names: ['service', 'services', 'svc'] },
  endpoints: { kind: 'Endpoints', api: 'v1', group: '', ns: true, names: ['endpoints', 'endpoint', 'ep'], virtual: true },
  namespaces: { kind: 'Namespace', api: 'v1', group: '', ns: false, names: ['namespace', 'namespaces', 'ns'] },
  nodes: { kind: 'Node', api: 'v1', group: '', ns: false, names: ['node', 'nodes', 'no'], virtual: true },
  configmaps: { kind: 'ConfigMap', api: 'v1', group: '', ns: true, names: ['configmap', 'configmaps', 'cm'] },
  secrets: { kind: 'Secret', api: 'v1', group: '', ns: true, names: ['secret', 'secrets'] },
  serviceaccounts: { kind: 'ServiceAccount', api: 'v1', group: '', ns: true, names: ['serviceaccount', 'serviceaccounts', 'sa'] },
  persistentvolumeclaims: { kind: 'PersistentVolumeClaim', api: 'v1', group: '', ns: true, names: ['persistentvolumeclaim', 'persistentvolumeclaims', 'pvc'] },
  resourcequotas: { kind: 'ResourceQuota', api: 'v1', group: '', ns: true, names: ['resourcequota', 'resourcequotas', 'quota'] },
  events: { kind: 'Event', api: 'v1', group: '', ns: true, names: ['event', 'events', 'ev'], virtual: true },
  deployments: { kind: 'Deployment', api: 'apps/v1', group: 'apps', ns: true, names: ['deployment', 'deployments', 'deploy'] },
  replicasets: { kind: 'ReplicaSet', api: 'apps/v1', group: 'apps', ns: true, names: ['replicaset', 'replicasets', 'rs'] },
  daemonsets: { kind: 'DaemonSet', api: 'apps/v1', group: 'apps', ns: true, names: ['daemonset', 'daemonsets', 'ds'] },
  ingresses: { kind: 'Ingress', api: 'networking.k8s.io/v1', group: 'networking.k8s.io', ns: true, names: ['ingress', 'ingresses', 'ing'] },
  networkpolicies: { kind: 'NetworkPolicy', api: 'networking.k8s.io/v1', group: 'networking.k8s.io', ns: true, names: ['networkpolicy', 'networkpolicies', 'netpol'] },
  horizontalpodautoscalers: { kind: 'HorizontalPodAutoscaler', api: 'autoscaling/v2', group: 'autoscaling', ns: true, names: ['horizontalpodautoscaler', 'horizontalpodautoscalers', 'hpa'] },
  poddisruptionbudgets: { kind: 'PodDisruptionBudget', api: 'policy/v1', group: 'policy', ns: true, names: ['poddisruptionbudget', 'poddisruptionbudgets', 'pdb'] },
  jobs: { kind: 'Job', api: 'batch/v1', group: 'batch', ns: true, names: ['job', 'jobs'] },
  cronjobs: { kind: 'CronJob', api: 'batch/v1', group: 'batch', ns: true, names: ['cronjob', 'cronjobs', 'cj'] },
  roles: { kind: 'Role', api: 'rbac.authorization.k8s.io/v1', group: 'rbac.authorization.k8s.io', ns: true, names: ['role', 'roles'] },
  rolebindings: { kind: 'RoleBinding', api: 'rbac.authorization.k8s.io/v1', group: 'rbac.authorization.k8s.io', ns: true, names: ['rolebinding', 'rolebindings'] },
  clusterroles: { kind: 'ClusterRole', api: 'rbac.authorization.k8s.io/v1', group: 'rbac.authorization.k8s.io', ns: false, names: ['clusterrole', 'clusterroles'] },
  clusterrolebindings: { kind: 'ClusterRoleBinding', api: 'rbac.authorization.k8s.io/v1', group: 'rbac.authorization.k8s.io', ns: false, names: ['clusterrolebinding', 'clusterrolebindings'] },
  certificatesigningrequests: { kind: 'CertificateSigningRequest', api: 'certificates.k8s.io/v1', group: 'certificates.k8s.io', ns: false, names: ['certificatesigningrequest', 'certificatesigningrequests', 'csr'] },
  leases: { kind: 'Lease', api: 'coordination.k8s.io/v1', group: 'coordination.k8s.io', ns: true, names: ['lease', 'leases'], virtual: true },
};
PG.KIND_BY_NAME = {}; for (const [plural, k] of Object.entries(PG.KINDS)) for (const n of k.names) PG.KIND_BY_NAME[n] = plural;
PG.resolveKind = w => { if (!w) return null; w = w.toLowerCase(); const base = w.split('.')[0]; return PG.KIND_BY_NAME[w] || PG.KIND_BY_NAME[base] || null; };
PG.KIND_OF = {}; for (const [p, k] of Object.entries(PG.KINDS)) PG.KIND_OF[k.kind] = p;

PG.tolerates = (taint, tols) => (tols || []).some(t => {
  if (t.operator === 'Exists' && !t.key) return true;
  if (t.key !== taint.key) return false;
  if (t.effect && t.effect !== taint.effect) return false;
  if ((t.operator || 'Equal') === 'Exists') return true;
  return (t.value || '') === (taint.value || '');
});
PG.selMatch = (sel, labels) => { if (!sel) return false; const ml = sel.matchLabels || sel; return Object.keys(ml).length > 0 && Object.entries(ml).every(([k, v]) => (labels || {})[k] === String(v)); };

/* ================================================================= cluster === */
PG.Cluster = class {
  constructor(sim, o) {
    this.sim = sim; Object.assign(this, { id: o.id, tool: o.tool, entry: o.entry, api: o.api, k8sVersion: o.k8sVersion || 'v1.35.0' });
    this.nodes = []; this.res = {}; for (const p of Object.keys(PG.KINDS)) this.res[p] = [];
    this.portMaps = []; this.ipN = 1; this.svcN = 2; this.helm = { tiller: false, releases: {} }; this.lastHpa = 0; this.cronNext = {};
    this.podIpN = {};
  }
  get clock() { return this.sim.clock; }
  apiUp() { if (this.tool === 'gke') return true; const cp = this.nodes.find(n => n.role === 'control-plane'); if (!cp) return false; const c = this.sim.container(cp.containerName); return !!(c && c.status === 'running') || this.tool === 'gke'; }
  nodeByName(n) { return this.nodes.find(x => x.name === n); }
  /* ---- generic object store ---- */
  list(plural, ns) { return this.res[plural].filter(o => !ns || o.metadata.namespace === ns); }
  find(plural, name, ns) { return this.res[plural].find(o => o.metadata.name === name && (!PG.KINDS[plural].ns || o.metadata.namespace === ns)); }
  mk(plural, name, ns, body = {}) {
    const k = PG.KINDS[plural]; const t = this.clock;
    const obj = { apiVersion: k.api, kind: k.kind, metadata: { name, ...(k.ns ? { namespace: ns } : {}), uid: PG.hex(8) + '-' + PG.hex(4) + '-' + PG.hex(4) + '-' + PG.hex(12), creationTimestamp: PG.iso(t), labels: {}, annotations: {}, _t: t, ...(body.metadata || {}) }, ...Object.fromEntries(Object.entries(body).filter(([k2]) => k2 !== 'metadata')) };
    obj.metadata.name = name; if (k.ns) obj.metadata.namespace = ns;
    if (!Object.keys(obj.metadata.labels || {}).length) delete obj.metadata.labels; if (!Object.keys(obj.metadata.annotations || {}).length) delete obj.metadata.annotations;
    this.res[plural].push(obj); return obj;
  }
  del(plural, obj) { const i = this.res[plural].indexOf(obj); if (i >= 0) this.res[plural].splice(i, 1); }
  emit(obj, type, reason, message) {
    const k = obj.kind || 'Pod'; const last = this.res.events[this.res.events.length - 1]; if (last && last.kind === k && last.name === obj.metadata.name && last.reason === reason && last.message === message && last.ns === (obj.metadata.namespace || 'default')) { last.count = (last.count || 1) + 1; last.lastT = this.clock; return; }
    this.res.events.push({ ns: obj.metadata.namespace || 'default', kind: k, name: obj.metadata.name, type, reason, message, t: this.clock, lastT: this.clock, count: 1 });
    if (this.res.events.length > 400) this.res.events.shift();
  }
  ensureNs(name) { if (!this.find('namespaces', name)) this.mk('namespaces', name, null, { spec: {}, status: { phase: 'Active' } }); }

  /* ---- nodes ---- */
  addNode(o) {
    const n = { name: o.name, role: o.role, containerName: o.containerName || o.name, ip: o.ip, labels: { 'kubernetes.io/hostname': o.name, 'kubernetes.io/os': 'linux', 'kubernetes.io/arch': 'arm64', ...(o.role === 'control-plane' ? { 'node-role.kubernetes.io/control-plane': '' } : {}), ...(o.labels || {}) },
      taints: o.taints || [], unschedulable: false, ready: true, images: {}, mirror: {}, createdAt: this.clock, version: o.version || this.k8sVersion, osImage: o.osImage || 'Debian GNU/Linux 12 (bookworm)', runtime: o.runtime || 'containerd://2.1.3', fs: {}, roleLabel: o.roleLabel };
    n.podCidr = '10.244.' + this.nodes.length + '.'; this.nodes.push(n);
    this.mk('leases', n.name, 'kube-node-lease', { spec: { holderIdentity: n.name, renewTime: this.clock } });
    return n;
  }
  /* ---- pods ---- */
  podOwnerKind(p) { return p.metadata._owner ? p.metadata._owner.kind : ''; }
  newPod(ns, name, labels, spec, owner, extra = {}) {
    const pod = this.mk('pods', name, ns, { metadata: { labels: { ...labels }, annotations: extra.annotations || {}, _owner: owner }, spec: PG.clone(spec), status: { phase: 'Pending' } });
    pod.spec.restartPolicy = pod.spec.restartPolicy || 'Always'; pod.spec.serviceAccountName = pod.spec.serviceAccountName || 'default'; pod.spec.nodeName = pod.spec.nodeName || '';
    pod._sim = { stage: 'new', t0: this.clock, logs: [], status: 'Pending', restarts: 0, ready: false, reqCount: 0 };
    return pod;
  }
  podStatus(p) {
    if (p.metadata.deletionTimestamp) return 'Terminating';
    const sm = p._sim; const node = p.spec.nodeName && this.nodeByName(p.spec.nodeName);
    if (node && !node.ready && this.clock - node._downSince > 3) return 'Unknown';
    return sm.status;
  }
  podReady(p) { return !p.metadata.deletionTimestamp && p._sim.ready; }
  matchPods(ns, sel) { return this.res.pods.filter(p => p.metadata.namespace === ns && PG.selMatch(sel, p.metadata.labels) && !p.metadata.deletionTimestamp); }
  killPod(p, grace = 2) { if (p.metadata.deletionTimestamp) return; p.metadata.deletionTimestamp = PG.iso(this.clock); p._sim.deleteAt = this.clock + grace; this.emit(p, 'Normal', 'Killing', 'Stopping container ' + (p.spec.containers[0] || {}).name); }
  // what a (simulated) node can hold: 4 CPUs and 16 GiB. Only requests count, like the real scheduler.
  nodeFree(n) { let cpu = 4000, mem = 16384; for (const x of this.res.pods) { if (x.spec.nodeName !== n.name || (x._sim && x._sim.done)) continue; const r = PG.podRequests(x.spec); cpu -= r.cpu; mem -= r.mem; } return { cpu, mem }; }
  schedule(p) {
    const spec = p.spec; const need = PG.podRequests(spec); const short = n => { const f = this.nodeFree(n); return need.cpu > f.cpu ? 'cpu' : need.mem > f.mem ? 'memory' : null; };
    const cands = this.nodes.filter(n => {
      if (!n.ready || n.unschedulable) return false;
      if (short(n)) return false;
      if (spec.nodeSelector && !Object.entries(spec.nodeSelector).every(([k, v]) => n.labels[k] === v)) return false;
      if (!(n.taints || []).filter(t => t.effect !== 'PreferNoSchedule').every(t => PG.tolerates(t, spec.tolerations))) return false;
      return true;
    });
    if (!cands.length) { const why = []; const total = this.nodes.length; const sel = this.nodes.filter(n => spec.nodeSelector && !Object.entries(spec.nodeSelector).every(([k, v]) => n.labels[k] === v)).length; const taint = this.nodes.filter(n => (n.taints || []).some(t => t.effect !== 'PreferNoSchedule' && !PG.tolerates(t, spec.tolerations))).length; const unsched = this.nodes.filter(n => n.unschedulable).length;
      if (sel) why.push(`${sel} node(s) didn't match Pod's node affinity/selector`); if (taint) why.push(`${taint} node(s) had untolerated taint`); if (unsched) why.push(`${unsched} node(s) were unschedulable`);
      for (const r of ['cpu', 'memory']) { const k = this.nodes.filter(n => n.ready && !n.unschedulable && short(n) === r).length; if (k) why.push(`${k} Insufficient ${r}`); }
      return { fail: `0/${total} nodes are available: ${why.join(', ') || 'no ready nodes'}.` }; }
    const spread = n => this.res.pods.filter(x => x.spec.nodeName === n.name && !x.metadata.deletionTimestamp).length;
    const same = n => this.res.pods.filter(x => x.spec.nodeName === n.name && x.metadata._owner && p.metadata._owner && x.metadata._owner.name === p.metadata._owner.name).length;
    cands.sort((a, b) => (same(a) - same(b)) || (spread(a) - spread(b)) || a.name.localeCompare(b.name));
    return { node: cands[0] };
  }

  /* ---- images: can this node start this container? ---- */
  imagePlan(pod, node) {
    let delay = 0.6; const secrets = [...(pod.spec.imagePullSecrets || [])];
    const sa = this.find('serviceaccounts', pod.spec.serviceAccountName || 'default', pod.metadata.namespace); if (sa) secrets.push(...(sa.imagePullSecrets || []));
    for (const c of [...(pod.spec.initContainers || []), ...pod.spec.containers]) {
      const p = PG.parseImage(c.image); const norm = PG.normImage(c.image); const policy = c.imagePullPolicy || (p.tag === 'latest' ? 'Always' : 'IfNotPresent');
      if (policy !== 'Always' && node.images[norm]) continue;
      const full = norm.replace(/^docker\.io\//, 'docker.io/');
      const isInit = (pod.spec.initContainers || []).includes(c); const fail = (reason, msg) => ({ ok: false, init: isInit, image: c.image, reason: reason || 'ErrImagePull', msg: `Failed to pull image "${c.image}": ${msg}` });
      const hostKey = p.host;
      if (PG.SYSTEM_HOSTS.some(h => (hostKey ? hostKey + '/' + p.repo : 'docker.io/' + p.repo).startsWith(h)) || p.repo.startsWith('kindest/') || p.repo.startsWith('rancher/')) { delay = Math.max(delay, 1); continue; }
      if (hostKey && hostKey.startsWith('localhost')) {
        if (this.tool !== 'kind' || !node.mirror[hostKey]) return fail('ErrImagePull', `failed to resolve reference "${hostKey}/${p.repo}:${p.tag}": failed to do request: Head "https://${hostKey}/v2/${p.repo}/manifests/${p.tag}": dial tcp [::1]:${hostKey.split(':')[1]}: connect: connection refused`);
        const reg = this.sim.registryContainer(hostKey); if (!reg || !reg.networks.includes('kind')) return fail('ErrImagePull', `failed to do request: Head "http://kind-registry:5000/v2/${p.repo}/manifests/${p.tag}": dial tcp: lookup kind-registry: no such host`);
        if (!this.sim.registryHas(p)) return fail('ErrImagePull', `${hostKey}/${p.repo}:${p.tag}: not found`);
        delay = Math.max(delay, 2); continue;
      }
      if (hostKey && hostKey.startsWith('k3d-')) {
        const reg = this.sim.container(hostKey.split(':')[0]); if (this.tool !== 'k3d' || !reg || reg.status !== 'running') return fail('ErrImagePull', `failed to do request: dial tcp: lookup ${hostKey.split(':')[0]}: no such host`);
        if (!this.sim.registryHas(p)) return fail('ErrImagePull', `${hostKey}/${p.repo}:${p.tag}: not found`);
        delay = Math.max(delay, 2); continue;
      }
      if (hostKey && !PG.PUBLIC_HOSTS.includes(hostKey)) { // private registry: needs a pull secret
        const ok = secrets.some(s => { const sec = this.find('secrets', s.name, pod.metadata.namespace); if (!sec || sec.type !== 'kubernetes.io/dockerconfigjson') return false; const data = sec.data && sec.data['.dockerconfigjson'] ? PG.unb64(sec.data['.dockerconfigjson']) : (sec.stringData && sec.stringData['.dockerconfigjson']) || ''; return data.includes(hostKey); });
        if (!ok) return fail('ErrImagePull', `rpc error: code = Unknown desc = failed to pull and unpack image "${hostKey}/${p.repo}:${p.tag}": failed to resolve reference: pull access denied, repository does not exist or may require authorization: authorization failed: no basic auth credentials`);
        delay = Math.max(delay, 3); continue;
      }
      const info = PG.CATALOG[p.repo] && (!PG.CATALOG[p.repo].host || PG.CATALOG[p.repo].host === (hostKey || 'docker.io'));
      if (!info) return fail('ErrImagePull', `rpc error: code = Unknown desc = failed to pull and unpack image "${full}": failed to resolve reference "${full}": pull access denied, repository does not exist or may require authorization: server message: insufficient_scope: authorization failed`);
      delay = Math.max(delay, 1 + Math.min(5, (PG.CATALOG[p.repo].size || 50) / 150));
    }
    return { ok: true, delay };
  }
  podEnvNames(pod) {
    const c = pod.spec.containers[0] || {}; const names = (c.env || []).map(e => e.name); const missing = [];
    for (const e of c.envFrom || []) {
      if (e.configMapRef) { const cm = this.find('configmaps', e.configMapRef.name, pod.metadata.namespace); if (cm) names.push(...Object.keys(cm.data || {})); else if (!e.configMapRef.optional) missing.push(`configmap "${e.configMapRef.name}" not found`); }
      if (e.secretRef) { const s = this.find('secrets', e.secretRef.name, pod.metadata.namespace); if (s) names.push(...Object.keys(s.data || {}), ...Object.keys(s.stringData || {})); else if (!e.secretRef.optional) missing.push(`secret "${e.secretRef.name}" not found`); }
    }
    for (const e of c.env || []) { const k = e.valueFrom && e.valueFrom.secretKeyRef; if (k && !k.optional) { const s = this.find('secrets', k.name, pod.metadata.namespace); if (!s) missing.push(`secret "${k.name}" not found`); else if (!((s.data || {})[k.key] !== undefined || (s.stringData || {})[k.key] !== undefined)) missing.push(`couldn't find key ${k.key} in Secret ${pod.metadata.namespace}/${k.name}`); } }
    return { names, missing };
  }
  volumeProblem(pod) {
    for (const v of pod.spec.volumes || []) {
      if (v.configMap && !v.configMap.optional && !this.find('configmaps', v.configMap.name, pod.metadata.namespace)) return `MountVolume.SetUp failed for volume "${v.name}" : configmap "${v.configMap.name}" not found`;
      if (v.secret && !v.secret.optional && !this.find('secrets', v.secret.secretName, pod.metadata.namespace)) return `MountVolume.SetUp failed for volume "${v.name}" : secret "${v.secret.secretName}" not found`;
      if (v.persistentVolumeClaim && !this.find('persistentvolumeclaims', v.persistentVolumeClaim.claimName, pod.metadata.namespace)) return `persistentvolumeclaim "${v.persistentVolumeClaim.claimName}" not found`;
    }
    return null;
  }
  runsCommand(c, info) { let argv = [...(c.command || []), ...(c.args || [])]; if (!argv.length && info && info.cmdArgv) argv = info.cmdArgv; else if (!c.command && c.args && c.args.length && info && info.cmdArgv && info.cmdArgv.length) argv = [...(info.cmdArgv.slice(0, info.cmdArgv.length)), ...c.args]; if (!argv.length) return null; if (info && info.built) return PG.classifyArgv(argv); const joined = argv.join(' '); if (/(^|\s)sleep\s+\d{3,}/.test(joined) || /\bsleep\s+infinity\b/.test(joined) || /tail -f/.test(joined)) return { long: true }; const m = /echo\s+(.*?)(?:\s*$|;|\|)/.exec(joined.replace(/^sh -c\s+/, '')); return { long: false, out: m ? m[1].replace(/^["']|["']$/g, '') : '' }; }
  stepPod(p, dt) {
    const sm = p._sim; const clock = this.clock;
    if (p.metadata.deletionTimestamp) { if (clock >= sm.deleteAt) this.del('pods', p); return; }
    if (!p.spec.nodeName) {
      const r = this.schedule(p);
      if (r.fail) { sm.status = 'Pending'; if (!sm.failedSched || clock - sm.failedSched > 20) { this.emit(p, 'Warning', 'FailedScheduling', r.fail); sm.failedSched = clock; } return; }
      p.spec.nodeName = r.node.name; sm.stage = 'scheduled'; sm.t0 = clock; sm.status = 'ContainerCreating'; this.emit(p, 'Normal', 'Scheduled', `Successfully assigned ${p.metadata.namespace}/${p.metadata.name} to ${r.node.name}`); return;
    }
    const node = this.nodeByName(p.spec.nodeName);
    if (!node) { this.del('pods', p); return; }
    if (!node.ready) {
      sm.ready = false;
      if (clock - node._downSince > 9 && !['Node', 'DaemonSet'].includes(this.podOwnerKind(p))) this.del('pods', p);
      return;
    }
    if (sm.stage === 'scheduled' || sm.stage === 'pulling') {
      sm.stage = 'pulling'; const vp = this.volumeProblem(p);
      if (vp) { sm.status = 'ContainerCreating'; if (!sm.volWarn || clock - sm.volWarn > 15) { this.emit(p, 'Warning', 'FailedMount', vp); sm.volWarn = clock; } return; }
      if (!sm.plan || (!sm.plan.ok && clock >= (sm.nextCheck || 0))) {
        const wasFail = sm.plan && !sm.plan.ok; sm.plan = this.imagePlan(p, node); sm.planAt = clock;
        if (sm.plan.ok && !wasFail) this.emit(p, 'Normal', 'Pulling', `Pulling image "${p.spec.containers[0].image}"`);
        if (!sm.plan.ok) { sm.failCount = (sm.failCount || 0) + 1; this.emit(p, 'Warning', 'Failed', sm.plan.msg); this.emit(p, 'Warning', 'Failed', 'Error: ErrImagePull'); this.emit(p, 'Normal', 'BackOff', `Back-off pulling image "${sm.plan.image}"`); sm.nextCheck = clock + 10; sm.failAt = clock; }
        else sm.planAt = clock;
      }
      if (!sm.plan.ok) { sm.status = (sm.plan.init ? 'Init:' : '') + ((clock - sm.failAt < 4) ? 'ErrImagePull' : 'ImagePullBackOff'); return; }
      if (clock - sm.planAt < sm.plan.delay) { sm.status = 'ContainerCreating'; return; }
      for (const x of this.podContainerSet(p)) node.images[PG.normImage(x.c.image)] = true;
      const env = this.podEnvNames(p);
      if (env.missing.length) { sm.status = 'CreateContainerConfigError'; if (!sm.cfgWarn || clock - sm.cfgWarn > 10) { this.emit(p, 'Warning', 'Failed', 'Error: ' + env.missing[0]); sm.cfgWarn = clock; } return; }
      for (const x of this.podContainerSet(p)) { this.emit(p, 'Normal', 'Pulled', `Successfully pulled image "${x.c.image}"`); this.emit(p, 'Normal', 'Created', 'Created container ' + x.c.name); if (!x.init) this.emit(p, 'Normal', 'Started', 'Started container ' + x.c.name); }
      p.status.hostIP = node.ip; p.status.podIP = this.allocPodIp(node); p.status.startTime = PG.iso(clock);
      const inits = p.spec.initContainers || [];
      if (inits.length) { sm.stage = 'init'; sm.initIdx = 0; sm.initAt = clock; sm.status = `Init:0/${inits.length}`; return; }
      this.startContainers(p); return;
    }
    if (sm.stage === 'init') { this.stepInit(p); return; }
    if (sm.stage === 'running') { this.stepRunning(p); return; }
  }
  allocPodIp(node) { this.podIpN[node.name] = (this.podIpN[node.name] || 1) + 1; const base = this.tool === 'k3d' ? '10.42.' : this.tool === 'gke' ? '10.20.' : '10.244.'; return base + this.nodes.indexOf(node) + '.' + this.podIpN[node.name]; }
  startLogs(p, c) {
    const info = PG.imageInfo(this.sim, (c || p.spec.containers[0]).image) || {}; const t = PG.iso(this.clock).replace('T', ' ').replace('Z', '');
    if (info.type === 'web' && info.port === 80) return ['/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration', '/docker-entrypoint.sh: Configuration complete; ready for start up', `${t.replace(/-/g, '/')} [notice] 1#1: nginx/1.27.5`, `${t.replace(/-/g, '/')} [notice] 1#1: start worker processes`];
    if (info.port === 6379) return ['Ready to accept connections tcp'];
    if (info.port === 5432) return ['PostgreSQL init process complete; ready for start up.', 'database system is ready to accept connections'];
    return [];
  }
  /* ---- the controllers ---- */
  tick(dt) {
    // nodes
    for (const n of this.nodes) {
      const c = this.sim.container(n.containerName); const up = this.tool === 'gke' ? n.ready : !!(c && c.status === 'running');
      if (up && !n.ready) { n.ready = true; n.taints = n.taints.filter(t => t.key !== 'node.kubernetes.io/unreachable'); this.sim.note(`node ${n.name} is Ready again`); }
      if (!up && n.ready) { n.ready = false; n._downSince = this.clock; n.taints.push({ key: 'node.kubernetes.io/unreachable', effect: 'NoExecute' }); this.sim.note(`node ${n.name} went NotReady`); }
      if (n.ready) { const l = this.find('leases', n.name, 'kube-node-lease'); if (l) l.spec.renewTime = this.clock; }
    }
    if (!this.apiUp()) return;
    // namespaces terminating
    for (const ns of [...this.res.namespaces]) if (ns._deleteAt && this.clock >= ns._deleteAt) { for (const p of Object.keys(PG.KINDS)) if (PG.KINDS[p].ns && !PG.KINDS[p].virtual) this.res[p] = this.res[p].filter(o => o.metadata.namespace !== ns.metadata.name); this.del('namespaces', ns); }
    // static pods
    for (const s of this.statics || []) if (!this.res.pods.find(p => p.metadata.name === s.name && p.metadata.namespace === s.ns)) { const pod = this.newPod(s.ns, s.name, { component: s.component, tier: 'control-plane' }, { containers: [{ name: s.component, image: s.image }], tolerations: [{ operator: 'Exists' }], nodeName: s.node, priorityClassName: 'system-node-critical' }, { kind: 'Node', name: s.node }); pod._sim.stage = 'scheduled'; pod._sim.t0 = this.clock; pod._sim.status = 'ContainerCreating'; }
    this.tickDaemonSets(); this.tickDeployments(); this.tickJobs(); this.tickHpa();
    for (const p of [...this.res.pods]) this.stepPod(p, dt);
    // PVCs bind immediately (local-path)
    for (const c of this.res.persistentvolumeclaims) if (!c.status || c.status.phase !== 'Bound') c.status = { phase: 'Bound' };
  }
  eligible(spec, n) { if (!n.ready) return false; if (spec.nodeSelector && !Object.entries(spec.nodeSelector).every(([k, v]) => n.labels[k] === v)) return false; return (n.taints || []).filter(t => t.effect !== 'PreferNoSchedule' && t.key !== 'node.kubernetes.io/unreachable').every(t => PG.tolerates(t, spec.tolerations)); }
  tickDaemonSets() {
    for (const ds of this.res.daemonsets) {
      const sel = ds.spec.selector; const mine = this.res.pods.filter(p => p.metadata._owner && p.metadata._owner.kind === 'DaemonSet' && p.metadata._owner.name === ds.metadata.name && p.metadata.namespace === ds.metadata.namespace && !p.metadata.deletionTimestamp);
      let desired = 0;
      for (const n of this.nodes) { if (!this.eligible(ds.spec.template.spec, n)) continue; desired++; if (!mine.find(p => p.spec.nodeName === n.name)) { const pod = this.newPod(ds.metadata.namespace, ds.metadata.name + '-' + PG.rnd(5), ds.spec.template.metadata.labels, { ...ds.spec.template.spec, nodeName: n.name }, { kind: 'DaemonSet', name: ds.metadata.name }); pod._sim.stage = 'scheduled'; pod._sim.t0 = this.clock; pod._sim.status = 'ContainerCreating'; } }
      for (const p of mine) if (!this.nodeByName(p.spec.nodeName)) this.del('pods', p);
      const ready = mine.filter(p => p._sim.ready).length; ds.status = { desiredNumberScheduled: desired, currentNumberScheduled: mine.length, numberReady: ready, numberAvailable: ready, updatedNumberScheduled: mine.length };
    }
  }
  depHash(dep) { return PG.hash(JSON.stringify(dep.spec.template), 12).replace(/[a-f]/g, c => 'bcdfgh'['abcdef'.indexOf(c)]).slice(0, 9); }
  tickDeployments() {
    for (const dep of [...this.res.deployments]) {
      const ns = dep.metadata.namespace; const name = dep.metadata.name; const desired = dep.spec.replicas === undefined ? 1 : dep.spec.replicas;
      if (dep.spec.paused && this.res.replicasets.some(r => r.metadata._owner && r.metadata._owner.name === name && r.metadata.namespace === ns)) { const live = this.res.pods.filter(p => p.metadata._owner && p.metadata._owner.kind === 'ReplicaSet' && p.metadata.namespace === ns && p.metadata._owner.name.startsWith(name + '-') && !p.metadata.deletionTimestamp); dep.status = { ...(dep.status || {}), replicas: live.length, readyReplicas: live.filter(p => p._sim.ready).length, availableReplicas: live.filter(p => p._sim.ready).length }; continue; }
      const hash = this.depHash(dep); let rss = this.res.replicasets.filter(r => r.metadata._owner && r.metadata._owner.name === name && r.metadata.namespace === ns);
      let cur = rss.find(r => r._hash === hash);
      if (!cur) {
        const rev = Math.max(0, ...rss.map(r => +r.metadata.annotations['deployment.kubernetes.io/revision'])) + 1;
        const tl = { ...(dep.spec.template.metadata.labels || {}), 'pod-template-hash': hash };
        cur = this.mk('replicasets', name + '-' + hash, ns, { metadata: { labels: tl, annotations: { 'deployment.kubernetes.io/revision': String(rev), 'deployment.kubernetes.io/desired-replicas': String(desired) }, _owner: { kind: 'Deployment', name } }, spec: { replicas: rss.length ? 0 : desired, selector: { matchLabels: { ...(dep.spec.selector.matchLabels || {}), 'pod-template-hash': hash } }, template: { metadata: { labels: tl }, spec: dep.spec.template.spec } }, status: {} });
        cur._hash = hash; cur._template = PG.clone(dep.spec.template); cur._deployed = this.clock; rss.push(cur);
        this.emit(dep, 'Normal', 'ScalingReplicaSet', `Scaled up replica set ${cur.metadata.name} from 0 to ${cur.spec.replicas}`);
      }
      const old = rss.filter(r => r !== cur);
      const strat = dep.spec.strategy || {}; const ru = strat.rollingUpdate || {};
      const parse = (v, def, up) => { if (v === undefined || v === null) v = def; if (typeof v === 'string' && v.endsWith('%')) { const f = parseFloat(v) / 100 * desired; return up ? Math.ceil(f) : Math.floor(f); } return Number(v); };
      const maxSurge = parse(ru.maxSurge, '25%', true), maxUnavail = parse(ru.maxUnavailable, '25%', false);
      const podsOf = r => this.res.pods.filter(p => p.metadata._owner && p.metadata._owner.kind === 'ReplicaSet' && p.metadata._owner.name === r.metadata.name && p.metadata.namespace === ns && !p.metadata.deletionTimestamp);
      const oldActive = old.filter(r => r.spec.replicas > 0);
      if (!oldActive.length || strat.type === 'Recreate') { if (strat.type === 'Recreate' && oldActive.length) { oldActive.forEach(r => r.spec.replicas = 0); if (old.some(r => podsOf(r).length)) { /* wait */ } else cur.spec.replicas = desired; } else cur.spec.replicas = desired; }
      else {
        const total = rss.reduce((a, r) => a + r.spec.replicas, 0);
        const canUp = desired + maxSurge - total;
        if (canUp > 0 && cur.spec.replicas < desired) cur.spec.replicas += Math.min(canUp, desired - cur.spec.replicas);
        const available = rss.reduce((a, r) => a + podsOf(r).filter(p => p._sim.ready).length, 0);
        let canDown = available - (desired - maxUnavail);
        // unready old pods can always go
        for (const r of oldActive) { const unready = podsOf(r).filter(p => !p._sim.ready).length; const n = Math.min(r.spec.replicas, unready); if (n > 0) { r.spec.replicas -= n; } }
        for (const r of old) { if (canDown <= 0) break; const n = Math.min(r.spec.replicas, canDown); r.spec.replicas -= n; canDown -= n; }
      }
      // replicaset controller
      for (const r of rss) {
        const mine = podsOf(r);
        if (mine.length < r.spec.replicas) { for (let i = mine.length; i < r.spec.replicas; i++) { const pn = r.metadata.name + '-' + PG.rnd(5); const adm = this.admitPod(ns, r._template.spec, pn); if (adm) { if (!r._admWarn || this.clock - r._admWarn > 10) { this.emit(r, 'Warning', 'FailedCreate', 'Error creating: ' + adm); r._admWarn = this.clock; } break; } this.newPod(ns, pn, r.spec.template.metadata.labels, r._template.spec, { kind: 'ReplicaSet', name: r.metadata.name }, { annotations: r._template.metadata.annotations }); } }
        else if (mine.length > r.spec.replicas) { const sorted = [...mine].sort((a, b) => (a._sim.ready - b._sim.ready) || (b.metadata._t - a.metadata._t)); for (const p of sorted.slice(0, mine.length - r.spec.replicas)) this.killPod(p); }
        const rp = podsOf(r); r.status = { replicas: r.spec.replicas, readyReplicas: rp.filter(p => p._sim.ready).length, availableReplicas: rp.filter(p => p._sim.ready).length };
      }
      const allPods = rss.flatMap(podsOf);
      dep.status = { _updatedReady: podsOf(cur).filter(p => p._sim.ready).length, replicas: allPods.length, updatedReplicas: podsOf(cur).length, readyReplicas: allPods.filter(p => p._sim.ready).length, availableReplicas: allPods.filter(p => p._sim.ready).length, observedGeneration: 1 };
      // history limit
      const dead = old.filter(r => r.spec.replicas === 0 && !podsOf(r).length).sort((a, b) => a._deployed - b._deployed); while (dead.length > 10) this.del('replicasets', dead.shift());
    }
    // orphan replicasets of deleted deployments
    for (const r of [...this.res.replicasets]) if (!this.find('deployments', r.metadata._owner.name, r.metadata.namespace)) { r.spec.replicas = 0; for (const p of this.res.pods.filter(p => p.metadata._owner && p.metadata._owner.name === r.metadata.name && p.metadata.namespace === r.metadata.namespace)) this.killPod(p); if (!this.res.pods.some(p => p.metadata._owner && p.metadata._owner.name === r.metadata.name)) this.del('replicasets', r); }
  }
  tickJobs() {
    for (const cj of this.res.cronjobs) {
      const every = (/^\*\/(\d+) /.exec(cj.spec.schedule) ? +RegExp.$1 * 60 : /^\* \* \* \* \*/.test(cj.spec.schedule) ? 60 : 3600); const key = cj.metadata.namespace + '/' + cj.metadata.name;
      if (this.cronNext[key] === undefined) this.cronNext[key] = this.clock + every;
      if (this.clock >= this.cronNext[key] && !cj.spec.suspend) { this.cronNext[key] += every; const n = (cj._n = (cj._n || 0) + 1); this.mk('jobs', `${cj.metadata.name}-${29000000 + n}`, cj.metadata.namespace, { metadata: { _owner: { kind: 'CronJob', name: cj.metadata.name } }, spec: PG.clone(cj.spec.jobTemplate.spec), status: {} }); cj.status = { lastScheduleTime: PG.iso(this.clock) }; }
    }
    for (const j of this.res.jobs) {
      const ns = j.metadata.namespace; const mine = this.res.pods.filter(p => p.metadata._owner && p.metadata._owner.kind === 'Job' && p.metadata._owner.name === j.metadata.name && p.metadata.namespace === ns);
      if (j.status.succeeded) continue;
      if (!mine.length) { const lab = { 'job-name': j.metadata.name, 'controller-uid': j.metadata.uid.slice(0, 8), ...(j.spec.template.metadata && j.spec.template.metadata.labels || {}) }; this.newPod(ns, j.metadata.name + '-' + PG.rnd(5), lab, { ...j.spec.template.spec, restartPolicy: j.spec.template.spec.restartPolicy || 'Never' }, { kind: 'Job', name: j.metadata.name }); j.status.active = 1; j._started = this.clock; }
      else if (mine.some(p => p._sim.status === 'Completed' && p.status.phase === 'Succeeded')) { j.status = { succeeded: 1, completionTime: PG.iso(this.clock) }; j._dur = this.clock - (j._started || j.metadata._t); }
    }
  }
  metricsServer() { return this.res.deployments.some(d => d.metadata.name === 'metrics-server'); }
  depLoad(dep) { const total = dep._load; const reps = Math.max(1, dep.status ? dep.status.readyReplicas || 1 : 1); return total === undefined ? 5 : total / reps; }
  tickHpa() {
    if (this.clock - this.lastHpa < 5) return; this.lastHpa = this.clock;
    for (const h of this.res.horizontalpodautoscalers) {
      const ref = h.spec.scaleTargetRef; const dep = this.find('deployments', ref.name, h.metadata.namespace); if (!dep) { h.status = { currentReplicas: 0, desiredReplicas: 0 }; continue; }
      const req = (((dep.spec.template.spec.containers[0] || {}).resources || {}).requests || {}).cpu;
      const target = ((h.spec.metrics || [])[0] || { resource: { target: { averageUtilization: 80 } } }).resource.target.averageUtilization;
      const cur = dep.spec.replicas === undefined ? 1 : dep.spec.replicas;
      if (!req || !this.metricsServer()) { h.status = { currentReplicas: cur, desiredReplicas: cur, _util: null, _why: !this.metricsServer() ? 'FailedGetResourceMetric: unable to get metrics (metrics-server not installed)' : 'FailedGetResourceMetric: missing request for cpu in container' }; continue; }
      const util = Math.round(dep._load === undefined ? 5 : dep._load / Math.max(1, cur) );
      let want = Math.ceil(cur * util / target); want = Math.max(h.spec.minReplicas || 1, Math.min(h.spec.maxReplicas, want));
      if (want > cur) { dep.spec.replicas = want; h._lastScale = this.clock; this.emit(h, 'Normal', 'SuccessfulRescale', `New size: ${want}; reason: cpu resource utilization (percentage of request) above target`); }
      else if (want < cur && this.clock - (h._lastScale || 0) > 30) { dep.spec.replicas = Math.max(want, cur - Math.max(1, Math.floor(cur / 2))); h._lastScale = this.clock; this.emit(h, 'Normal', 'SuccessfulRescale', `New size: ${dep.spec.replicas}; reason: All metrics below target`); }
      h.status = { currentReplicas: cur, desiredReplicas: dep.spec.replicas === undefined ? 1 : dep.spec.replicas, _util: util };
    }
  }

  /* ---- services, endpoints, DNS ---- */
  allocClusterIP() { this.svcN++; return `10.96.${Math.floor(this.svcN / 250)}.${(this.svcN % 250) + 2}`; }
  endpointsOf(svc) {
    const sel = svc.spec.selector; if (!sel || !Object.keys(sel).length) return []; const out = [];
    for (const p of this.res.pods.filter(p => p.metadata.namespace === svc.metadata.namespace && PG.selMatch(sel, p.metadata.labels))) {
      if (!this.podReady(p) || !p.status.podIP) continue;
      for (const sp of svc.spec.ports || []) { let tp = sp.targetPort === undefined ? sp.port : sp.targetPort; if (typeof tp === 'string') { const cp = (p.spec.containers[0].ports || []).find(x => x.name === tp); tp = cp ? cp.containerPort : (PG.imageInfo(this.sim, p.spec.containers[0].image) || {}).port || sp.port; } out.push({ ip: p.status.podIP, port: tp, pod: p, svcPort: sp.port }); }
    }
    return out;
  }
  allocNodePort() { let p; do { p = 30000 + Math.floor(Math.random() * 2700); } while (this.res.services.some(s => (s.spec.ports || []).some(x => x.nodePort === p))); return p; }
  normalizeService(svc) {
    const s = svc.spec; s.type = s.type || 'ClusterIP'; s.clusterIP = s.clusterIP || this.allocClusterIP(); s.ports = (s.ports || []).map(p => ({ protocol: 'TCP', ...p })); s.sessionAffinity = 'None';
    if (s.type === 'NodePort' || s.type === 'LoadBalancer') for (const p of s.ports) if (!p.nodePort) p.nodePort = this.allocNodePort();
    if (s.type === 'LoadBalancer') {
      const internal = (svc.metadata.annotations || {})['networking.gke.io/load-balancer-type'] === 'Internal';
      svc.status = { loadBalancer: this.tool === 'k3d' ? { ingress: this.nodes.map(n => ({ ip: n.ip })) } : this.tool === 'gke' ? { ingress: [{ ip: internal ? '10.140.2.' + (10 + this.svcN % 200) : '34.89.' + (this.svcN % 250) + '.' + (this.svcN * 7 % 250), ipMode: 'VIP' }] } : { pending: true } };
    }
    return svc;
  }
  findServiceByHost(host, fromNs) {
    const h = host.replace(/\.svc\.cluster\.local\.?$/, '').replace(/\.svc$/, ''); const parts = h.split('.');
    const name = parts[0]; const ns = parts[1] || fromNs;
    const svc = this.find('services', name, ns); return svc || null;
  }
  /* ---- RBAC ---- */
  identityOf(user) { return user; }
  authorize(id, verb, resource, ns, sub) {
    if (!id) return true; if ((id.groups || []).includes('system:masters')) return true;
    const group = (PG.KINDS[resource] || {}).group || ''; const matches = rule => {
      const okV = (rule.verbs || []).some(v => v === '*' || v === verb); const rs = rule.resources || []; const full = sub ? resource + '/' + sub : resource;
      const okR = rs.some(r => r === '*' || r === full || (!sub && r === resource)); const okG = (rule.apiGroups || ['']).some(g => g === '*' || g === group);
      return okV && okR && okG;
    };
    const subjMatch = s => (s.kind === 'User' && s.name === id.user) || (s.kind === 'Group' && (id.groups || []).includes(s.name)) || (s.kind === 'ServiceAccount' && id.user === `system:serviceaccount:${s.namespace}:${s.name}`);
    const rulesOf = ref => { const r = ref.kind === 'ClusterRole' ? this.find('clusterroles', ref.name) : this.find('roles', ref.name, ref._ns); return r ? r.rules || [] : []; };
    for (const b of this.res.clusterrolebindings) if ((b.subjects || []).some(subjMatch) && rulesOf(b.roleRef).some(matches)) return true;
    if (ns) for (const b of this.res.rolebindings.filter(b => b.metadata.namespace === ns)) if ((b.subjects || []).some(subjMatch) && rulesOf({ ...b.roleRef, _ns: ns }).some(matches)) return true;
    return false;
  }
};
PG.BUILTIN_ROLES = () => {
  const ro = ['get', 'list', 'watch'], rw = [...ro, 'create', 'update', 'patch', 'delete', 'deletecollection'];
  const core = ['pods', 'pods/log', 'services', 'endpoints', 'configmaps', 'persistentvolumeclaims', 'serviceaccounts', 'events', 'resourcequotas', 'namespaces'];
  const apps = { apiGroups: ['apps'], resources: ['deployments', 'replicasets', 'daemonsets'] }, batch = { apiGroups: ['batch'], resources: ['jobs', 'cronjobs'] }, net = { apiGroups: ['networking.k8s.io'], resources: ['ingresses', 'networkpolicies'] }, asc = { apiGroups: ['autoscaling'], resources: ['horizontalpodautoscalers'] }, pol = { apiGroups: ['policy'], resources: ['poddisruptionbudgets'] };
  const rbac = { apiGroups: ['rbac.authorization.k8s.io'], resources: ['roles', 'rolebindings'] };
  const viewRules = [{ apiGroups: [''], resources: core, verbs: ro }, { ...apps, verbs: ro }, { ...batch, verbs: ro }, { ...net, verbs: ro }, { ...asc, verbs: ro }, { ...pol, verbs: ro }];
  const editRules = [{ apiGroups: [''], resources: [...core.filter(x => x !== 'namespaces' && x !== 'events'), 'secrets', 'pods/exec', 'pods/portforward', 'serviceaccounts/token'], verbs: rw }, { apiGroups: [''], resources: ['events', 'namespaces'], verbs: ro }, { ...apps, verbs: rw }, { ...batch, verbs: rw }, { ...net, verbs: rw }, { ...asc, verbs: rw }, { ...pol, verbs: rw }];
  return { view: viewRules, edit: editRules, admin: [...editRules, { ...rbac, verbs: rw }], 'cluster-admin': [{ apiGroups: ['*'], resources: ['*'], verbs: ['*'] }] };
};
PG.seedRoles = cl => { for (const [n, rules] of Object.entries(PG.BUILTIN_ROLES())) { const r = cl.mk('clusterroles', n, null, { rules }); } cl.mk('clusterrolebindings', 'cluster-admin', null, { roleRef: { kind: 'ClusterRole', name: 'cluster-admin' }, subjects: [{ kind: 'Group', name: 'system:masters' }] }); };
if (typeof module !== 'undefined') module.exports = PG;
