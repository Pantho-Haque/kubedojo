/* =============================================================== images === */
PG.parseImage = ref => {
  let r = ref, tag = '', host = '';
  const at = r.indexOf('@'); if (at > 0) r = r.slice(0, at);
  const lastSlash = r.lastIndexOf('/'); const colon = r.lastIndexOf(':');
  if (colon > lastSlash) { tag = r.slice(colon + 1); r = r.slice(0, colon); }
  const parts = r.split('/');
  if (parts.length > 1 && (parts[0].includes('.') || parts[0].includes(':') || parts[0] === 'localhost')) { host = parts.shift(); }
  let repo = parts.join('/'); if (!host && !repo.includes('/')) repo = repo; // library image
  return { host, repo, tag: tag || 'latest', hadTag: !!tag, full: ref };
};
PG.normImage = ref => { const p = PG.parseImage(ref); const host = p.host || 'docker.io'; const repo = (host === 'docker.io' && !p.repo.includes('/')) ? 'library/' + p.repo : p.repo; return `${host}/${repo}:${p.tag}`; };
const NGINX_PAGE = '<!DOCTYPE html>\n<html>\n<head>\n<title>Welcome to nginx!</title>\n<style>\nhtml { color-scheme: light dark; }\nbody { width: 35em; margin: 0 auto;\nfont-family: Tahoma, Verdana, Arial, sans-serif; }\n</style>\n</head>\n<body>\n<h1>Welcome to nginx!</h1>\n<p>If you see this page, the nginx web server is successfully installed and\nworking. Further configuration is required.</p>\n</body>\n</html>';
PG.CATALOG = { // public images the playground "can pull"
  nginx: { type: 'web', port: 80, page: NGINX_PAGE, size: 192 }, httpd: { type: 'web', port: 80, page: '<html><body><h1>It works!</h1></body></html>', size: 148 },
  caddy: { type: 'web', port: 80, page: '<!DOCTYPE html><title>Caddy works!</title>', size: 50 },
  redis: { type: 'tcp', port: 6379, size: 61 }, memcached: { type: 'tcp', port: 11211, size: 85 },
  postgres: { type: 'tcp', port: 5432, size: 275, requireEnv: ['POSTGRES_PASSWORD', 'POSTGRES_HOST_AUTH_METHOD'], crashMsg: 'Error: Database is uninitialized and superuser password is not specified.\n       You must specify POSTGRES_PASSWORD to a non-empty value for the superuser.' },
  mysql: { type: 'tcp', port: 3306, size: 590, requireEnv: ['MYSQL_ROOT_PASSWORD', 'MYSQL_ALLOW_EMPTY_PASSWORD', 'MYSQL_RANDOM_ROOT_PASSWORD'], crashMsg: '[ERROR] [Entrypoint]: Database is uninitialized and password option is not specified\n    You need to specify one of MYSQL_ROOT_PASSWORD, MYSQL_ALLOW_EMPTY_PASSWORD and MYSQL_RANDOM_ROOT_PASSWORD' },
  mongo: { type: 'tcp', port: 27017, size: 880 }, rabbitmq: { type: 'tcp', port: 5672, size: 230 },
  busybox: { type: 'tool', size: 4 }, alpine: { type: 'tool', size: 8 }, ubuntu: { type: 'tool', size: 78 }, 'curlimages/curl': { type: 'tool', size: 22 },
  registry: { type: 'registry', port: 5000, size: 25 }, 'hashicorp/consul': { type: 'tcp', port: 8500, size: 180 },
  traefik: { type: 'web', port: 80, page: '404 page not found', size: 150 }, node: { type: 'tool', size: 1100 }, python: { type: 'tool', size: 1000 },
  'grafana/grafana': { type: 'web', port: 3000, page: '<a href="/login">Found</a>.', size: 400 }, 'prom/prometheus': { type: 'web', port: 9090, page: '<a href="/graph">Found</a>.', size: 280 },
  'kindest/node': { type: 'system', size: 1000 },
  'lachlanevenson/k8s-helm': { type: 'tool', size: 60 }, 'alpine/helm': { type: 'tool', size: 60 },
  'helm/tiller': { type: 'system', size: 80, host: 'ghcr.io' }, 'kennethreitz/httpbin': { type: 'web', port: 80, page: '<!DOCTYPE html><title>httpbin.org</title>', size: 120 },
};
PG.SYSTEM_HOSTS = ['registry.k8s.io', 'k8s.gcr.io', 'gke.gcr.io', 'gcr.io', 'docker.io/kindest', 'ghcr.io/helm', 'rancher'];
PG.PUBLIC_HOSTS = ['', 'docker.io', 'ghcr.io', 'quay.io', 'registry.k8s.io', 'gcr.io', 'k8s.gcr.io', 'gke.gcr.io', 'mcr.microsoft.com'];
// a user-built image: behaviour = its base image, adjusted by what its Dockerfile did
PG.builtInfo = meta => {
  const base = PG.CATALOG[meta.base] || { type: 'tool' }; const info = { ...base, built: true, baseName: meta.base, env: meta.env || {}, fs: meta.fs || {}, workdir: meta.workdir, user: meta.user };
  const cmdArgv = (meta.entrypoint || meta.cmd) ? [...(meta.entrypoint || []), ...(meta.cmd || [])] : null; info.cmdArgv = cmdArgv;
  if (meta.port) info.port = meta.port;
  const root = PG.WEBROOT[meta.base]; if (root && meta.fs && meta.fs[root] !== undefined) info.page = meta.fs[root]; else if (root && meta.fs && meta.fs[root] === undefined && base.type === 'web') info.page = undefined;
  const cls = PG.classifyArgv(cmdArgv);
  if (base.type === 'tool' && cls && cls.long && meta.port) { info.type = 'web'; info.page = `<h1>simulated app</h1>\n<p>This image's CMD is <code>${(cmdArgv || []).join(' ')}</code>. The playground does not execute application code, so this is a placeholder response on port ${meta.port}.</p>\n`; }
  return info;
};
// what an image is, and how it behaves when a container starts
PG.imageInfo = (sim, ref) => {
  const p = PG.parseImage(ref); const fullName = (p.host ? p.host + '/' : 'docker.io/') + p.repo; if (PG.SYSTEM_HOSTS.some(h => fullName.startsWith(h)) || /^(kindest|rancher)\//.test(p.repo)) return { type: 'system', long: true }; const built = sim.images[p.repo + ':' + p.tag] && !p.host ? sim.images[p.repo + ':' + p.tag] : (sim.images[ref] || null);
  if (built && built.meta) return PG.builtInfo(built.meta);
  const fullHost = p.host; const key = (fullHost && PG.PUBLIC_HOSTS.includes(fullHost) && fullHost !== 'docker.io' ? '' : '') + p.repo;
  if (PG.CATALOG[p.repo]) return { ...PG.CATALOG[p.repo], baseName: p.repo };
  const short = p.repo.split('/').slice(-1)[0]; if (p.host && PG.CATALOG[short] && ['localhost:5001', 'k3d-local-registry:5000'].includes(p.host)) return PG.CATALOG[short];
  if (sim.registryHas(p)) { const r = sim.registryGet(p); if (r && r.meta) return PG.builtInfo(r.meta); }
  return null;
};

/* ============================================================== the sim === */
PG.BASE_TIME = Date.parse('2026-10-14T09:00:00Z');
PG.iso = t => new Date(PG.BASE_TIME + t * 1000).toISOString().replace(/\.\d+Z$/, 'Z');
PG.Sim = class {
  constructor(fsSnap) {
    this.clock = 0; this.fs = new PG.FS(); this.fs.stamp = () => PG.BASE_TIME + this.clock * 1000; this.fsRestored = false; if (fsSnap && fsSnap.files) { this.fs.restore(fsSnap); this.fsRestored = true; } this.listeners = []; this.waiters = []; this.timer = null; this.notifyT = null; this.speed = 1;
    this.containers = []; this.images = {}; this.networks = ['bridge', 'host', 'none']; this.registries = {}; // container name -> {images:{}}
    this.kubeconfig = { contexts: [], clusters: [], users: [], current: '' }; this.clusters = {};
    this.forwards = []; this.tokens = {}; this.trace = []; this.log = []; this.apiPorts = 0; this.shells = [];
    this.seed();
  }
  /* ---- time ---- */
  start(realMs = 250, simDt = 0.5) { this.stop(); this.timer = setInterval(() => this.advance(simDt * this.speed), realMs); }
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; }
  advance(dt) {
    this.clock += dt;
    for (const c of Object.values(this.clusters)) c.tick(dt);
    const w = this.waiters; this.waiters = [];
    for (const x of w) { if (this.clock >= x.until || x.shell.aborted) x.resolve(); else this.waiters.push(x); }
    this.notify();
  }
  wait(secs, shell) { return new Promise(resolve => this.waiters.push({ until: this.clock + secs, resolve, shell: shell || { aborted: false } })); }
  waitFor(pred, shell, maxSecs = 600) { // resolves true if pred became true
    return new Promise(resolve => { const t0 = this.clock; const check = () => { if (shell.aborted) return resolve(false); if (pred()) return resolve(true); if (this.clock - t0 > maxSecs) return resolve(false); this.waiters.push({ until: this.clock + 0.5, resolve: check, shell }); }; check(); });
  }
  wake() { const w = this.waiters; this.waiters = []; w.forEach(x => x.resolve()); }
  onChange(fn) { this.listeners.push(fn); }
  notify() { if (this.notifyT) return; this.notifyT = setTimeout(() => { this.notifyT = null; this.listeners.forEach(f => { try { f(); } catch (e) { console.error(e); } }); }, 30); }
  note(msg) { this.log.push({ t: this.clock, msg }); if (this.log.length > 200) this.log.shift(); }
  traceReq(steps, ok = true) { this.trace.push({ t: this.clock, steps, ok }); if (this.trace.length > 50) this.trace.shift(); this.lastTrace = this.trace[this.trace.length - 1]; }

  /* ---- docker-ish state ---- */
  container(name) { return this.containers.find(c => c.name === name); }
  addContainer(c) { c.id = PG.hex(12); c.created = this.clock; c.status = c.status || 'running'; c.startedAt = this.clock; c.ports = c.ports || []; c.networks = c.networks || ['bridge']; this.containers.push(c); return c; }
  // the registry container an image reference points at: by port for localhost:PORT, by name for k3d-<name>:5000
  registryFor(p) { const h = p.host || ''; let c = null; if (h.startsWith('k3d-')) c = this.container(h.split(':')[0]); else { const m = /:(\d+)$/.exec(h); if (m) c = this.containers.find(x => x.kind === 'registry' && x.ports.some(q => q.host === Number(m[1]))); } return c && c.status === 'running' ? c : null; }
  registryContainer(h) { return h ? this.registryFor({ host: h }) : this.containers.find(c => c.kind === 'registry' && c.status === 'running'); }
  registryHas(p) { const r = this.registryFor(p); if (!r) return false; return !!(this.registries[r.name] || {})[p.repo + ':' + p.tag]; }
  registryGet(p) { const r = this.registryFor(p); return r ? (this.registries[r.name] || {})[p.repo + ':' + p.tag] : null; }
  ensureNetwork(n) { if (!this.networks.includes(n)) this.networks.push(n); }
  nextApiPort() { return 40000 + Math.floor(Math.random() * 9000) + (this.apiPorts++); }

  /* ---- kubeconfig ---- */
  ctxByName(n) { return this.kubeconfig.contexts.find(c => c.name === n); }
  clusterEntry(n) { return this.kubeconfig.clusters.find(c => c.name === n); }
  userEntry(n) { return this.kubeconfig.users.find(c => c.name === n); }
  addKubeEntries(name, server, userSpec, namespace) {
    const kc = this.kubeconfig; kc.clusters = kc.clusters.filter(x => x.name !== name); kc.users = kc.users.filter(x => x.name !== name); kc.contexts = kc.contexts.filter(x => x.name !== name);
    kc.clusters.push({ name, server }); kc.users.push({ name, auth: userSpec || { kind: 'admin' } }); kc.contexts.push({ name, cluster: name, user: name, namespace: namespace || '' });
  }
  removeKubeEntries(name) { const kc = this.kubeconfig; kc.clusters = kc.clusters.filter(x => x.name !== name); kc.users = kc.users.filter(x => x.name !== name); kc.contexts = kc.contexts.filter(x => x.name !== name); if (kc.current === name) kc.current = ''; }
  currentCluster(ctxName) { const c = this.ctxByName(ctxName || this.kubeconfig.current); if (!c) return null; return this.clusters[c.cluster] || null; }

  /* ---- seed: a fake production cloud cluster, so "know your current context" is real ---- */
  seed() {
    this.fs.mkdirp('/home/user'); this.fs.mkdirp('/home/user/.kube');
    PG.seedGke(this);
    if (!this.fsRestored) PG.seedChart(this);
  }
};
if (typeof module !== 'undefined') module.exports = PG;
