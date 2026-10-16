/* ============================================================== namespaces ==== */
PG.Cluster.prototype.addNamespace = function (name) {
  if (this.find('namespaces', name)) return this.find('namespaces', name);
  const ns = this.mk('namespaces', name, null, { spec: {}, status: { phase: 'Active' } }); ns.metadata.labels = { 'kubernetes.io/metadata.name': name };
  this.mk('serviceaccounts', 'default', name, {});
  this.mk('configmaps', 'kube-root-ca.crt', name, { data: { 'ca.crt': '-----BEGIN CERTIFICATE-----\nSIMULATED\n-----END CERTIFICATE-----\n' } });
  return ns;
};
PG.Cluster.prototype.deployment = function (ns, name, image, replicas, o = {}) {
  const labels = o.labels || { app: name };
  const spec = { containers: [{ name: o.containerName || name, image, ...(o.container || {}) }], ...(o.podSpec || {}) };
  return this.mk('deployments', name, ns, { metadata: { labels: { ...labels }, annotations: o.annotations || {} }, spec: { replicas, selector: { matchLabels: o.selector || { ...labels } }, template: { metadata: { labels: { ...labels } }, spec }, ...(o.strategy ? { strategy: o.strategy } : {}) }, status: {} });
};
PG.Cluster.prototype.service = function (ns, name, selector, ports, o = {}) {
  const svc = this.mk('services', name, ns, { metadata: { labels: o.labels || { app: name }, annotations: o.annotations || {} }, spec: { type: o.type || 'ClusterIP', selector, ports, ...(o.clusterIP ? { clusterIP: o.clusterIP } : {}) }, status: { loadBalancer: {} } });
  return this.normalizeService(svc);
};
PG.TOL_ALL = [{ operator: 'Exists' }];
PG.Cluster.prototype.systemBase = function (cpName) {
  for (const n of ['default', 'kube-system', 'kube-public', 'kube-node-lease']) this.addNamespace(n);
  PG.seedRoles(this);
  this.mk('services', 'kubernetes', 'default', { spec: { type: 'ClusterIP', clusterIP: '10.96.0.1', ports: [{ name: 'https', port: 443, targetPort: 6443, protocol: 'TCP' }] }, status: { loadBalancer: {} } });
  this.mk('configmaps', 'cluster-info', 'kube-public', { data: { kubeconfig: `apiVersion: v1\nclusters:\n- cluster:\n    certificate-authority-data: SIMULATED\n    server: ${this.api}\n  name: ""\n` } });
  this.statics = cpName ? ['etcd', 'kube-apiserver', 'kube-controller-manager', 'kube-scheduler'].map(c => ({ name: `${c}-${cpName}`, ns: 'kube-system', component: c, node: cpName, image: c === 'etcd' ? 'registry.k8s.io/etcd:3.6.4-0' : `registry.k8s.io/${c}:${this.k8sVersion}` })) : [];
};
PG.Cluster.prototype.dnsSvc = function () { this.mk('services', 'kube-dns', 'kube-system', { metadata: { labels: { 'k8s-app': 'kube-dns' } }, spec: { type: 'ClusterIP', clusterIP: '10.96.0.10', selector: { 'k8s-app': 'kube-dns' }, ports: [{ name: 'dns', port: 53, protocol: 'UDP', targetPort: 53 }, { name: 'dns-tcp', port: 53, protocol: 'TCP', targetPort: 53 }] }, status: { loadBalancer: {} } }); };
PG.Cluster.prototype.daemonset = function (ns, name, image, o = {}) {
  return this.mk('daemonsets', name, ns, { spec: { selector: { matchLabels: { 'k8s-app': name } }, template: { metadata: { labels: { 'k8s-app': name } }, spec: { containers: [{ name, image }], tolerations: PG.TOL_ALL } } }, status: {} });
};
PG.Cluster.prototype.systemDeployment = function (ns, name, image, replicas, labels) {
  return this.deployment(ns, name, image, replicas, { labels: labels || { 'k8s-app': name }, podSpec: { tolerations: PG.TOL_ALL } });
};
PG.fastForward = (sim, secs) => { for (let t = 0; t < secs; t += 1) sim.advance(1); };

/* ================================================================== kind ==== */
PG.makeKindCluster = (sim, cfg) => {
  const name = cfg.name || 'kind'; const entry = 'kind-' + name; const port = sim.nextApiPort();
  const cl = new PG.Cluster(sim, { id: name, tool: 'kind', entry, api: `https://127.0.0.1:${port}`, k8sVersion: 'v1.35.0' });
  sim.ensureNetwork('kind'); if (!sim.images['kindest/node:v1.35.0']) sim.images['kindest/node:v1.35.0'] = { id: PG.hex(12), size: 1010, created: sim.clock };
  const roles = cfg.nodes && cfg.nodes.length ? cfg.nodes : [{ role: 'control-plane' }];
  let w = 0; let cpN = 0; const names = [];
  roles.forEach((r, idx) => {
    const role = r.role || 'worker'; let nm;
    if (role === 'control-plane') { cpN++; nm = cpN === 1 ? `${name}-control-plane` : `${name}-control-plane${cpN}`; } else { w++; nm = w === 1 ? `${name}-worker` : `${name}-worker${w}`; }
    const ip = '172.18.0.' + (idx + 2); const ports = [];
    if (role === 'control-plane' && cpN === 1) ports.push({ hostIp: '127.0.0.1', host: port, container: 6443 });
    for (const m of r.extraPortMappings || []) ports.push({ hostIp: m.listenAddress || '0.0.0.0', host: m.hostPort, container: m.containerPort, proto: m.protocol || 'tcp' });
    sim.addContainer({ name: nm, image: 'kindest/node:v1.35.0', kind: 'node', clusterId: entry, networks: ['kind'], ports, restart: 'on-failure', ip });
    names.push({ nm, role, ip });
    for (const m of r.extraPortMappings || []) cl.portMaps.push({ host: m.hostPort, container: m.containerPort, node: nm, ip: m.listenAddress || '0.0.0.0' });
  });
  const hasWorkers = names.some(n => n.role === 'worker');
  for (const n of names) cl.addNode({ name: n.nm, role: n.role, containerName: n.nm, ip: n.ip, taints: n.role === 'control-plane' && hasWorkers ? [{ key: 'node-role.kubernetes.io/control-plane', effect: 'NoSchedule' }] : [] });
  const cp = names.find(n => n.role === 'control-plane');
  cl.systemBase(cp && cp.nm); cl.addNamespace('local-path-storage'); cl.dnsSvc();
  cl.daemonset('kube-system', 'kube-proxy', 'registry.k8s.io/kube-proxy:v1.35.0'); cl.daemonset('kube-system', 'kindnet', 'docker.io/kindest/kindnetd:v20250512-df8de77b');
  cl.systemDeployment('kube-system', 'coredns', 'registry.k8s.io/coredns/coredns:v1.12.0', 2, { 'k8s-app': 'kube-dns' });
  cl.systemDeployment('local-path-storage', 'local-path-provisioner', 'docker.io/kindest/local-path-provisioner:v20250214-acbabc1a', 1, { app: 'local-path-provisioner' });
  sim.clusters[entry] = cl; sim.addKubeEntries(entry, cl.api, { kind: 'admin' }); sim.kubeconfig.current = entry;
  return cl;
};

/* ================================================================== k3d ===== */
PG.makeK3dCluster = (sim, o) => {
  const name = o.name; const entry = 'k3d-' + name; const port = sim.nextApiPort();
  const cl = new PG.Cluster(sim, { id: name, tool: 'k3d', entry, api: `https://0.0.0.0:${port}`, k8sVersion: 'v1.33.4+k3s1' });
  sim.ensureNetwork('k3d-' + name);
  if (!sim.images['rancher/k3s:v1.33.4-k3s1']) sim.images['rancher/k3s:v1.33.4-k3s1'] = { id: PG.hex(12), size: 240, created: sim.clock };
  const net = 'k3d-' + name; const names = [];
  for (let i = 0; i < (o.servers || 1); i++) names.push({ nm: `k3d-${name}-server-${i}`, role: 'control-plane' });
  for (let i = 0; i < (o.agents || 0); i++) names.push({ nm: `k3d-${name}-agent-${i}`, role: 'worker' });
  names.forEach((n, idx) => { n.ip = '172.19.0.' + (idx + 3); sim.addContainer({ name: n.nm, image: 'rancher/k3s:v1.33.4-k3s1', kind: 'node', clusterId: entry, networks: [net], ip: n.ip, ports: [] }); cl.addNode({ name: n.nm, role: n.role, containerName: n.nm, ip: n.ip, version: 'v1.33.4+k3s1', osImage: 'K3s v1.33.4+k3s1', runtime: 'containerd://2.0.5-k3s2', labels: n.role === 'control-plane' ? { 'node-role.kubernetes.io/master': 'true' } : {} }); });
  const lbPorts = [{ hostIp: '0.0.0.0', host: port, container: 6443 }, ...(o.ports || []).map(p => ({ hostIp: '0.0.0.0', host: p.host, container: p.container }))];
  sim.addContainer({ name: `k3d-${name}-serverlb`, image: 'ghcr.io/k3d-io/k3d-proxy:5.8.3', kind: 'lb', clusterId: entry, networks: [net], ports: lbPorts, ip: '172.19.0.2' });
  cl.lbMaps = (o.ports || []).map(p => ({ host: p.host, target: p.container }));
  if (o.registry) { sim.addContainer({ name: 'k3d-' + o.registry.name, image: 'registry:2', kind: 'registry', networks: [net, 'bridge'], ports: [{ hostIp: o.registry.host || '0.0.0.0', host: o.registry.port, container: 5000 }], restart: 'always' }); sim.registries['k3d-' + o.registry.name] = {}; cl.registryName = 'k3d-' + o.registry.name; }
  cl.systemBase(null); cl.dnsSvc();
  const sys = (n, img, rep, lab) => cl.systemDeployment('kube-system', n, img, rep, lab);
  sys('coredns', 'rancher/mirrored-coredns-coredns:1.12.0', 1, { 'k8s-app': 'kube-dns' }); sys('local-path-provisioner', 'rancher/local-path-provisioner:v0.0.31', 1, { app: 'local-path-provisioner' });
  sys('metrics-server', 'rancher/mirrored-metrics-server:v0.7.2', 1, { 'k8s-app': 'metrics-server' }); sys('traefik', 'rancher/mirrored-library-traefik:3.3.6', 1, { 'app.kubernetes.io/name': 'traefik' });
  cl.mk('services', 'metrics-server', 'kube-system', { spec: { type: 'ClusterIP', clusterIP: '10.43.0.20', selector: { 'k8s-app': 'metrics-server' }, ports: [{ port: 443, targetPort: 10250 }] }, status: { loadBalancer: {} } });
  cl.service('kube-system', 'traefik', { 'app.kubernetes.io/name': 'traefik' }, [{ name: 'web', port: 80, targetPort: 80 }, { name: 'websecure', port: 443, targetPort: 443 }], { type: 'LoadBalancer', labels: { 'app.kubernetes.io/name': 'traefik' } });
  cl.daemonset('kube-system', 'svclb-traefik', 'rancher/klipper-lb:v0.4.13');
  sim.clusters[entry] = cl; sim.addKubeEntries(entry, cl.api, { kind: 'admin' }); sim.kubeconfig.current = entry; return cl;
};

/* =========================================== the "production" trap: a cloud cluster ==== */
PG.seedGke = sim => {
  const id = 'gke_prod-project_asia-east1-a_prod-1';
  const cl = new PG.Cluster(sim, { id, tool: 'gke', entry: id, api: 'https://34.80.10.20', k8sVersion: 'v1.33.5-gke.1080000' });
  ['a1b2', 'c3d4', 'e5f6'].forEach((s, i) => cl.addNode({ name: `gke-prod-1-default-pool-7f3a-${s}`, role: 'worker', containerName: 'none', ip: '10.140.0.' + (10 + i), version: 'v1.33.5-gke.1080000', osImage: 'Container-Optimized OS from Google', runtime: 'containerd://1.7.28', labels: { 'cloud.google.com/gke-nodepool': 'default-pool', 'node.kubernetes.io/instance-type': 'e2-standard-4' } }));
  cl.systemBase(null); cl.addNamespace('shop-frontend'); cl.dnsSvc();
  cl.systemDeployment('kube-system', 'kube-dns', 'gke.gcr.io/k8s-dns-kube-dns:1.23.1', 2, { 'k8s-app': 'kube-dns' }); cl.systemDeployment('kube-system', 'metrics-server', 'gke.gcr.io/metrics-server:v0.7.2', 1, { 'k8s-app': 'metrics-server' });
  cl.daemonset('kube-system', 'fluentbit-gke', 'gke.gcr.io/fluent-bit:v1.9.7'); cl.daemonset('kube-system', 'gke-metrics-agent', 'gke.gcr.io/gke-metrics-agent:1.15');
  cl.deployment('shop-frontend', 'shop-web', 'nginx:1.27', 2, { labels: { app: 'shop-web' }, container: { ports: [{ containerPort: 80 }], resources: { requests: { cpu: '100m', memory: '128Mi' } } } });
  cl.service('shop-frontend', 'shop-web', { app: 'shop-web' }, [{ port: 80, targetPort: 80 }]);
  cl.service('shop-frontend', 'shop-web-internal', { app: 'shop-web' }, [{ port: 80, targetPort: 80 }], { type: 'LoadBalancer', annotations: { 'networking.gke.io/load-balancer-type': 'Internal' } });
  cl.deployment('shop-frontend', 'redis', 'redis:7-alpine', 1, { labels: { app: 'redis' }, container: { ports: [{ containerPort: 6379 }] } });
  cl.service('shop-frontend', 'redis', { app: 'redis' }, [{ port: 6379, targetPort: 6379 }]);
  sim.clusters[id] = cl; sim.addKubeEntries(id, cl.api, { kind: 'admin' }); sim.kubeconfig.current = id;
  for (let i = 0; i < 80; i++) { sim.clock += 1; cl.tick(1); }
  const back = 86400 * 40;
  for (const p of Object.keys(cl.res)) for (const o of cl.res[p]) { if (o.metadata && o.metadata._t !== undefined) { o.metadata._t -= back; o.metadata.creationTimestamp = PG.iso(o.metadata._t); } }
  for (const n of cl.nodes) n.createdAt -= back; sim.clock = 0; for (const p of cl.res.pods) { p._sim.startedAt = (p._sim.startedAt || 0) - sim.clock; p._sim.t0 = -back; }
  const web = cl.find('services', 'shop-web-internal', 'shop-frontend'); web.metadata._t = -39600;
};
if (typeof module !== 'undefined') module.exports = PG;
