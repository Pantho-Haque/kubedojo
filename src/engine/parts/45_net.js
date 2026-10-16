/* ============================================================= network simulation === */
PG.NGINX_404 = '<html>\n<head><title>404 Not Found</title></head>\n<body>\n<center><h1>404 Not Found</h1></center>\n<hr><center>nginx/1.27.5</center>\n</body>\n</html>';
PG.netpolBlocks = (cl, srcNs, srcLabels, pod) => {
  const ns = pod.metadata.namespace;
  const pols = cl.res.networkpolicies.filter(p => p.metadata.namespace === ns && ((p.spec.policyTypes || ['Ingress']).includes('Ingress')) && ((!p.spec.podSelector || !Object.keys(p.spec.podSelector.matchLabels || {}).length) || PG.selMatch(p.spec.podSelector, pod.metadata.labels)));
  if (!pols.length) return null;
  for (const p of pols) for (const r of p.spec.ingress || []) { if (!r.from) return null; for (const f of r.from) { if (f.podSelector !== undefined && !f.namespaceSelector && srcNs === ns && (!Object.keys((f.podSelector.matchLabels) || {}).length || PG.selMatch(f.podSelector, srcLabels || {}))) return null; if (f.namespaceSelector) { const nso = cl.find('namespaces', srcNs); if (nso && (!Object.keys(f.namespaceSelector.matchLabels || {}).length || PG.selMatch(f.namespaceSelector, nso.metadata.labels))) return null; } } }
  return pols[0].metadata.name;
};
PG.podRespond = (cl, pod, req, steps, src) => {
  const info = PG.imageInfo(cl.sim, pod.spec.containers[0].image) || { type: 'tool' }; const path = req.path || '/';
  steps.push({ label: `Pod ${pod.metadata.name} (${pod.status.podIP})`, kind: 'pod', cluster: cl.entry, ns: pod.metadata.namespace, name: pod.metadata.name });
  if (info.type === 'web' && PG.webRootDir(info)) {
    const fsx = PG.podFS(cl, pod); const root = PG.webRootDir(info); const content = fsx.read(root + (path === '/' ? '/index.html' : path)); const status = content !== undefined ? 200 : 404; const body = content !== undefined ? content : PG.NGINX_404;
    pod._sim.logs.push(`${src || '10.244.0.1'} - - [${new Date(PG.BASE_TIME + cl.sim.clock * 1000).toUTCString().slice(5, 25).replace(/ /g, '/')}] "${req.method || 'GET'} ${path} HTTP/1.1" ${status} ${body.length} "-" "curl/8.7.1" "-"`);
    return { status, body };
  }
  if (info.type === 'web') {
    let status = 200, body = info.page || '';
    if (info.built) { if (path !== '/' && path !== '/index.html') { status = 404; body = PG.NGINX_404; } } else if (path !== '/' && info.page && info.page.includes('nginx')) { status = 404; body = PG.NGINX_404; }
    pod._sim.logs.push(`${src || '10.244.0.1'} - - [${new Date(PG.BASE_TIME + cl.sim.clock * 1000).toUTCString().slice(5, 25).replace(/ /g, '/').replace('/', '/')}] "${req.method || 'GET'} ${path} HTTP/1.1" ${status} ${body.length} "-" "curl/8.7.1" "-"`);
    return { status, body };
  }
  if (info.type === 'registry') return { status: 200, body: '{}' };
  if (info.type === 'tcp') return { error: { code: 52, msg: 'Empty reply from server' } };
  return { error: { code: 7, msg: 'Failed to connect: connection refused' } };
};
PG.viaService = (cl, svc, port, req, steps, src) => {
  const sp = (svc.spec.ports || []).find(p => p.port === port || p.nodePort === port) || (svc.spec.ports || [])[0];
  steps.push({ label: `Service ${svc.metadata.name} (${svc.spec.type}) ${svc.spec.clusterIP}:${sp ? sp.port : '?'}`, kind: 'svc', cluster: cl.entry, ns: svc.metadata.namespace, name: svc.metadata.name });
  const eps = cl.endpointsOf(svc).filter(e => !sp || e.svcPort === sp.port); if (!eps.length) return { error: { code: 56, msg: `no endpoints available for service "${svc.metadata.name}" (selector matches no Ready pod)`, status: 503 } };
  const ep = eps[Math.floor(Math.random() * eps.length)];
  return PG.podRespond(cl, ep.pod, req, steps, src);
};
// from the local machine
PG.localRequest = (sim, req) => {
  const port = req.port; const steps = [{ label: `your machine → localhost:${port}`, kind: 'host' }];
  const fw = sim.forwards.find(f => f.local === port && f.active);
  if (fw) {
    const cl = fw.cluster; steps.push({ label: `kubectl port-forward (${fw.target})`, kind: 'forward' }); if (fw.onConn) fw.onConn();
    let res; if (fw.svc) res = PG.viaService(cl, fw.svc, fw.remote, req, steps); else { const pod = fw.pod; res = pod && PG.podReady(pod) ? PG.podRespond(cl, pod, req, steps) : { error: { code: 56, msg: 'Recv failure: Connection reset by peer' } }; }
    return { ...res, steps };
  }
  for (const c of sim.containers) {
    if (c.status !== 'running') continue; const m = c.ports.find(p => p.host === port); if (!m) continue;
    if (c.kind === 'other' && !sim.clusters[c.clusterId]) return { ...PG.containerRespond(sim, c, m, req, steps), steps };
    if (c.kind === 'registry') { steps.push({ label: `docker port ${port} → ${c.name}:5000`, kind: 'container', name: c.name }); return { ...PG.registryResponse(sim, c, req), steps }; }
    const cl = sim.clusters[c.clusterId];
    if (c.kind === 'node' && cl) {
      steps.push({ label: `docker port ${m.hostIp}:${port} → ${c.name}:${m.container}`, kind: 'node', cluster: cl.entry, name: c.name });
      const svc = cl.res.services.find(s => (s.spec.ports || []).some(p => p.nodePort === m.container));
      const ig = PG.ingressNginx(cl); const igPort = ig && ig.svc ? (ig.svc.spec.ports || []).find(p => p.nodePort === m.container) : null;
      if ((m.container === 80 || m.container === 443 || igPort) && ig) {
        if (!ig.ready) return { error: { code: 52, msg: 'Empty reply from server' }, steps };
        steps.push({ label: 'ingress-nginx controller', kind: 'svc', cluster: cl.entry, ns: 'ingress-nginx', name: 'ingress-nginx-controller' });
        return { ...PG.routeIngress(cl, req, steps, 'nginx'), steps };
      }
      if (!svc) return { error: { code: 52, msg: 'Empty reply from server' }, steps };
      return { ...PG.viaService(cl, svc, m.container, req, steps), steps };
    }
    if (c.kind === 'lb' && cl) {
      const map = (cl.lbMaps || []).find(x => x.host === port); if (!map) continue;
      steps.push({ label: `k3d load balancer :${port} → :${map.target} on the nodes`, kind: 'lb', cluster: cl.entry, name: c.name });
      const lb = cl.res.services.find(s => s.spec.type === 'LoadBalancer' && s.metadata.name !== 'traefik' && (s.spec.ports || []).some(p => p.port === map.target));
      if (lb) return { ...PG.viaService(cl, lb, map.target, req, steps), steps };
      steps.push({ label: 'Traefik (ingress controller)', kind: 'svc', cluster: cl.entry, ns: 'kube-system', name: 'traefik' });
      return { ...PG.routeIngress(cl, req, steps, 'traefik'), steps };
    }
  }
  return { error: { code: 7, msg: `Failed to connect to localhost port ${port} after 0 ms: Couldn't connect to server` }, steps };
};
PG.containerRespond = (sim, c, m, req, steps) => { const info = PG.imageInfo(sim, c.image) || {}; if (info.type === 'web' && PG.containerAsPod) { const pod = PG.containerAsPod(sim, c); const root = PG.webRootDir(info); if (root) { const content = PG.podFS(null, pod).read(root + (req.path === '/' ? '/index.html' : req.path)); steps.push({ label: `docker port ${m.hostIp}:${m.host} → ${c.name}:${m.container}`, kind: 'container', name: c.name }); const status = content !== undefined ? 200 : 404; const body = content !== undefined ? content : PG.NGINX_404; pod._sim.logs.push(`172.17.0.1 - - [${new Date(PG.BASE_TIME + sim.clock * 1000).toUTCString().slice(5, 25).replace(/ /g, '/')}] "${req.method || 'GET'} ${req.path} HTTP/1.1" ${status} ${body.length} "-" "curl/8.7.1" "-"`); return m.container === (info.port || 80) ? { status, body } : { error: { code: 52, msg: 'Empty reply from server' } }; } } steps.push({ label: `docker port ${m.hostIp}:${m.host} → ${c.name}:${m.container}`, kind: 'container', name: c.name }); if (info.type === 'web' && m.container === (info.port || 80)) { const root = PG.webRootDir(info); let body = info.page || ''; let status = 200; if (root && info.fs) { const f = info.fs[root + (req.path === '/' ? '/index.html' : req.path)]; if (f !== undefined) body = f; else if (req.path !== '/') { status = 404; body = PG.NGINX_404; } } else if (root && req.path !== '/') { status = 404; body = PG.NGINX_404; } return { status, body }; } if (info.type === 'tcp') return { error: { code: 52, msg: 'Empty reply from server' } }; return { error: { code: 52, msg: 'Empty reply from server' } }; };
// route an HTTP request through the cluster's Ingress rules (Traefik on k3d, ingress-nginx on kind)
PG.routeIngress = (cl, req, steps, controller) => {
  const host = (req.headers.host || '').split(':')[0]; const notFound = controller === 'nginx' ? { status: 404, body: PG.NGINX_404 } : { status: 404, body: '404 page not found' };
  for (const ing of cl.res.ingresses) for (const rule of ing.spec.rules || []) { if (rule.host && rule.host !== host) continue; for (const p of (rule.http || { paths: [] }).paths) { const pre = p.path || '/'; const hit = p.pathType === 'Exact' ? req.path === pre : req.path.startsWith(pre); if (hit) { steps.push({ label: `Ingress ${ing.metadata.name}`, kind: 'ing', cluster: cl.entry, ns: ing.metadata.namespace, name: ing.metadata.name }); const svc = cl.find('services', p.backend.service.name, ing.metadata.namespace); if (!svc) return { status: 503, body: controller === 'nginx' ? '<html><body><h1>503 Service Temporarily Unavailable</h1></body></html>' : 'Service Unavailable' }; const pn = p.backend.service.port.number !== undefined ? p.backend.service.port.number : ((svc.spec.ports || []).find(x => x.name === p.backend.service.port.name) || {}).port; return PG.viaService(cl, svc, pn, req, steps); } } }
  return notFound;
};
PG.ingressNginx = cl => { const d = cl.find('deployments', 'ingress-nginx-controller', 'ingress-nginx'); if (!d) return null; const svc = cl.find('services', 'ingress-nginx-controller', 'ingress-nginx'); return { dep: d, svc, ready: (d.status || {}).readyReplicas > 0 }; };
PG.registryResponse = (sim, c, req) => {
  const data = sim.registries[c.name] || {}; const p = req.path;
  if (p === '/v2/' || p === '/v2') return { status: 200, body: '{}' };
  if (p === '/v2/_catalog') return { status: 200, body: JSON.stringify({ repositories: [...new Set(Object.keys(data).map(k => k.split(':')[0]))] }) };
  const m = /^\/v2\/(.+)\/tags\/list$/.exec(p); if (m) { const tags = Object.keys(data).filter(k => k.split(':')[0] === m[1]).map(k => k.split(':')[1]); if (!tags.length) return { status: 404, body: JSON.stringify({ errors: [{ code: 'NAME_UNKNOWN', message: 'repository name not known to registry' }] }) }; return { status: 200, body: JSON.stringify({ name: m[1], tags }) }; }
  return { status: 404, body: '404 page not found' };
};
// from inside a pod (kubectl run / exec)
PG.podRequest = (sim, cl, fromPod, req) => {
  const steps = [{ label: `pod ${fromPod.name} (${fromPod.ns})`, kind: 'pod', cluster: cl.entry, ns: fromPod.ns, name: fromPod.name }];
  const host = req.host; if (host === 'localhost' || host === '127.0.0.1') return { error: { code: 7, msg: 'connection refused (nothing listens inside this pod)' }, steps };
  const svc = cl.findServiceByHost(host, fromPod.ns);
  if (!svc) { const pod = cl.res.pods.find(p => p.status.podIP === host); if (pod) { return { ...PG.podRespond(cl, pod, req, steps), steps }; } return { error: { code: 6, msg: `Could not resolve host: ${host} (bad address '${host}')` }, steps }; }
  steps.push({ label: `cluster DNS: ${host} → ${svc.spec.clusterIP}`, kind: 'dns' });
  const targets = cl.matchPods(svc.metadata.namespace, svc.spec.selector);
  if (targets.length) { const blocked = PG.netpolBlocks(cl, fromPod.ns, fromPod.labels, targets[0]); if (blocked) return { error: { code: 28, msg: `download timed out (NetworkPolicy "${blocked}" in namespace ${svc.metadata.namespace} drops this traffic)`, blocked: true }, steps }; }
  return { ...PG.viaService(cl, svc, req.port || 80, req, steps, fromPod.ip || '10.244.1.9'), steps };
};
C.curl = async (ctx, args) => {
  const o = {}; let url = null; const hdrs = {}; let method = 'GET'; let outFile = null, write = null, silent = false, head = false, include = false;
  for (let i = 0; i < args.length; i++) { const a = args[i]; if (a === '-s' || a === '-fsSL' || a === '-sS' || a === '-S' || a === '-f' || a === '-L' || a === '-fsS') silent = silent || a.includes('s'); else if (a === '-o') outFile = args[++i]; else if (a === '-w') write = args[++i]; else if (a === '-H') { const [k, ...v] = args[++i].split(':'); hdrs[k.trim().toLowerCase()] = v.join(':').trim(); } else if (a === '-X') method = args[++i]; else if (a === '-d' || a === '--data') { args[++i]; method = method === 'GET' ? 'POST' : method; } else if (a === '-I') { head = true; include = true; } else if (a === '-i') include = true; else if (!a.startsWith('-')) url = a; }
  if (!url) { ctx.eprintln('curl: try \'curl --help\' for more information'); return 2; }
  const m = /^(?:(https?):\/\/)?(\[[^\]]+\]|[^\/:]+)(?::(\d+))?(\/[^?#]*)?(\?.*)?$/.exec(url); if (!m) { ctx.eprintln(`curl: (3) URL rejected: Malformed input to a URL function`); return 3; }
  const host = m[2]; const port = m[3] ? Number(m[3]) : (m[1] === 'https' ? 443 : 80); const path = m[4] || '/';
  const req = { host, port, path, method, headers: { host: host + (m[3] ? ':' + m[3] : ''), ...hdrs } };
  let resolvedHost = host; const hostsTxt = ctx.fs.read('/etc/hosts') || ''; const resolveI = args.indexOf('--resolve'); const resolveSpec = resolveI >= 0 ? args[resolveI + 1] : null;
  const inHosts = h => hostsTxt.split('\n').some(l => { const t = l.replace(/#.*/, '').trim().split(/\s+/); return /^(127\.0\.0\.1|::1|0\.0\.0\.0)$/.test(t[0]) && t.slice(1).includes(h); });
  if (!['localhost', '127.0.0.1', '[::1]', '0.0.0.0'].includes(host) && (inHosts(host) || host.endsWith('.localhost') || (resolveSpec && resolveSpec.startsWith(host + ':')))) { resolvedHost = 'localhost'; }
  else if (!['localhost', '127.0.0.1', '[::1]', '0.0.0.0'].includes(host) && /\./.test(host) && !/get\.helm\.sh|github\.com|charts\.helm\.sh/.test(host)) { ctx.eprintln(`curl: (6) Could not resolve host: ${host}` + (host.endsWith('.local') || !host.includes('.') ? '' : '') + `\n(the playground has no internet. To reach a local name, add it to /etc/hosts:  echo '127.0.0.1 ${host}' | sudo tee -a /etc/hosts   — or use  curl -H 'Host: ${host}' http://localhost/ )`); return 6; }
  const external = false;
  if (external && /\./.test(host) && !host.endsWith('.local')) { if (/get\.helm\.sh|github\.com|charts\.helm\.sh/.test(host)) { ctx.out('SIMULATED-DOWNLOAD'); return 0; } ctx.eprintln(`curl: (6) Could not resolve host: ${host}  (the playground has no internet; only localhost, port-forwards and in-cluster names work)`); return 6; }
  let res = PG.localRequest(ctx.sim, { ...req, port, host: resolvedHost });
  ctx.sim.traceReq(res.steps, !res.error && (res.status || 200) < 400);
  if (res.error) { if (res.error.status === 503 && !silent) { } if (!silent || true) ctx.eprintln(`curl: (${res.error.code}) ${res.error.msg}`); return res.error.code; }
  const status = res.status || 200;
  if (include) ctx.println(`HTTP/1.1 ${status} ${status === 200 ? 'OK' : status === 404 ? 'Not Found' : ''}\nServer: nginx\nContent-Type: text/html\n`);
  if (outFile === '/dev/null' || head) { } else if (outFile) ctx.fs.write(ctx.resolve(outFile), res.body); else ctx.println(res.body);
  if (write) ctx.out(write.replace(/%\{http_code\}/g, String(status)).replace(/\\n/g, '\n'));
  return 0;
};
if (typeof module !== 'undefined') module.exports = PG;
