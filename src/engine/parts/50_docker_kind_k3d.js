/* ================================================================= docker ==== */
PG.upText = (sim, c) => { const age = Math.max(0, Math.floor(sim.clock - c.startedAt)); const t = age < 60 ? age + ' seconds' : age < 3600 ? Math.floor(age / 60) + ' minutes' : Math.floor(age / 3600) + ' hours'; return c.status === 'running' ? 'Up ' + (age < 2 ? 'Less than a second' : t) : `Exited (${c.exitCode || 0}) ${t} ago`; };
PG.portsText = c => c.ports.map(p => `${p.hostIp}:${p.host}->${p.container}/${p.proto || 'tcp'}`).join(', ');
PG.goFormat = (fmt, rows, fieldNames) => {
  const isTable = /^table\s/.test(fmt); let f = fmt.replace(/^table\s+/, '');
  const cols = [...f.matchAll(/\{\{\.(\w+)\}\}/g)].map(m => m[1]);
  const render = o => f.replace(/\{\{\.(\w+)\}\}/g, (m, k) => o[k] ?? '').replace(/\\t/g, '\t').replace(/\\n/g, '\n');
  if (!isTable) return rows.map(render).join('\n');
  const lines = [cols.map(c => c.toUpperCase()).join('\t'), ...rows.map(render)].map(l => l.split('\t'));
  const w = []; lines.forEach(l => l.forEach((c, i) => w[i] = Math.max(w[i] || 0, c.length)));
  return lines.map(l => l.map((c, i) => i === l.length - 1 ? c : PG.pad(c, w[i] + 3)).join('')).join('\n');
};
const imgRow = (sim, key) => { const i = sim.images[key]; const lc = key.lastIndexOf(':'); const slash = key.lastIndexOf('/'); const repo = lc > slash ? key.slice(0, lc) : key; const tag = lc > slash ? key.slice(lc + 1) : 'latest'; return { Repository: repo, Tag: tag, ID: i.id, Size: (i.size >= 1000 ? (i.size / 1000).toFixed(2) + 'GB' : i.size + 'MB'), CreatedSince: i.created === undefined ? '2 weeks ago' : 'Less than a second ago' }; };
PG.dockerAvailable = ref => { const p = PG.parseImage(ref); if (p.host && !PG.PUBLIC_HOSTS.includes(p.host)) return false; return !!PG.CATALOG[p.repo] || /^(kindest|rancher|k3d)/.test(p.repo); };
PG.commands.docker = async (ctx, args) => {
  const sim = ctx.sim; const sub = args[0]; const rest = args.slice(1); const o = PG.opts(rest);
  const find = n => sim.container(n.replace(/^\//, ''));
  if (!sub || sub === '--help' || sub === 'help') { ctx.println(`Usage:  docker COMMAND
Supported in the playground:
  ps [-a] [--format]    images    pull    build -t name:tag DIR    tag    push    rmi
  run -d --name N -p H:C --restart=always --network N IMAGE        rm [-f]    stop    start    restart
  exec [-i] CONTAINER cmd      (kind/k3d nodes: crictl images|rmi|ps, mkdir, cp /dev/stdin FILE, ls, cat)
  network ls|connect NET CONTAINER      info [--format]     system df     logs CONTAINER`); return 0; }
  if (sub === 'info') { const f = rest.indexOf('--format'); const fmt = f >= 0 ? rest[f + 1] : null; const info = { ServerVersion: '29.8.2', MemTotal: '12262920192', NCPU: '6', Name: 'docker-desktop' }; if (fmt) ctx.println(fmt.replace(/\{\{\.(\w+)\}\}/g, (m, k) => info[k] ?? '')); else ctx.println(`Server:\n Server Version: 29.8.2\n Total Memory: 11.42GiB\n CPUs: 6\n Name: docker-desktop`); return 0; }
  if (sub === 'ps') {
    const fi = rest.indexOf('--format'); const fmt = fi >= 0 ? rest[fi + 1] : null; const list = sim.containers.filter(c => o.flags.has('a') || c.status === 'running');
    const rows = list.map(c => ({ ID: c.id, Names: c.name, Image: c.image, Status: PG.upText(sim, c), Ports: PG.portsText(c), Command: '"/usr/local/bin/entry…"', CreatedAt: PG.iso(c.created), RunningFor: PG.fmtAge(sim.clock - c.created) + ' ago', Networks: c.networks.join(',') }));
    if (fmt) { if (rows.length || /^table/.test(fmt)) ctx.println(PG.goFormat(fmt, rows)); return 0; }
    ctx.println(PG.table(rows.map(r => [r.ID, r.Image, r.Command, r.RunningFor, r.Status, r.Ports, r.Names]), ['CONTAINER ID', 'IMAGE', 'COMMAND', 'CREATED', 'STATUS', 'PORTS', 'NAMES'])); return 0;
  }
  if (sub === 'images' || sub === 'image') { const fi = rest.indexOf('--format'); const fmt = fi >= 0 ? rest[fi + 1] : null; const keys = Object.keys(sim.images); const rows = keys.map(k => imgRow(sim, k)); if (fmt) ctx.println(PG.goFormat(fmt, rows)); else ctx.println(PG.table(rows.map(r => [r.Repository, r.Tag, r.ID, r.CreatedSince, r.Size]), ['REPOSITORY', 'TAG', 'IMAGE ID', 'CREATED', 'SIZE'])); return 0; }
  if (sub === 'pull') { const ref = o.rest[0]; if (!ref) { ctx.eprintln('"docker pull" requires 1 argument'); return 1; } const p = PG.parseImage(ref); const key = p.host ? ref : p.repo + ':' + p.tag;
    if (!PG.dockerAvailable(ref)) { ctx.eprintln(`Error response from daemon: pull access denied for ${p.repo}, repository does not exist or may require 'docker login': denied: requested access to the resource is denied`); return 1; }
    ctx.println(`${p.tag}: Pulling from ${p.repo.includes('/') ? p.repo : 'library/' + p.repo}`); await ctx.delay(300); ctx.println(`Digest: sha256:${PG.hex(64)}`); ctx.println(`Status: Downloaded newer image for ${ref.includes(':') ? ref : ref + ':latest'}`);
    const info = PG.CATALOG[p.repo] || { size: 50 }; sim.images[key] = sim.images[key] || { id: PG.hex(12), size: info.size, meta: null }; return 0; }
  if (sub === 'tag') { const [src, dst] = o.rest; const sk = sim.images[src] ? src : (sim.images[PG.parseImage(src).repo + ':' + PG.parseImage(src).tag] ? PG.parseImage(src).repo + ':' + PG.parseImage(src).tag : null); if (!sk) { ctx.eprintln(`Error response from daemon: No such image: ${src}`); return 1; } sim.images[dst.includes(':') && dst.lastIndexOf(':') > dst.lastIndexOf('/') ? dst : dst + ':latest'] = sim.images[sk]; return 0; }
  if (sub === 'rmi') { for (const r of o.rest) { const k = sim.images[r] ? r : r + ':latest'; if (!sim.images[k]) { ctx.eprintln(`Error response from daemon: No such image: ${r}`); return 1; } delete sim.images[k]; ctx.println('Untagged: ' + r); } return 0; }
  if (sub === 'build') {
    const tags = []; let file = null; const bargs = {}; const pos = [];
    for (let k = 0; k < rest.length; k++) { const a = rest[k]; if (a === '-t' || a === '--tag') tags.push(rest[++k]); else if (a === '-f' || a === '--file') file = rest[++k]; else if (a === '--build-arg') { const kv = rest[++k]; const e = kv.indexOf('='); bargs[kv.slice(0, e)] = kv.slice(e + 1); } else if (a === '--platform' || a === '--target' || a === '--progress') k++; else if (!a.startsWith('-')) pos.push(a); }
    const dir = ctx.resolve(pos[pos.length - 1] || '.'); const dfPath = file ? ctx.resolve(file) : dir + '/Dockerfile'; const df = ctx.fs.read(dfPath);
    if (df === undefined) { ctx.eprintln(`ERROR: failed to solve: failed to read dockerfile: open ${file || 'Dockerfile'}: no such file or directory`); return 1; }
    ctx.println(`[+] Building ...`); await ctx.delay(300);
    const res = await PG.buildImage(ctx, df, dir, bargs); if (res.err) { ctx.eprintln(res.err); return 1; }
    ctx.println(` => [internal] load build definition from ${file || 'Dockerfile'}`.padEnd(78) + '0.0s'); for (const l of res.log) ctx.println(l); ctx.println(' => exporting to image'.padEnd(78) + '0.1s');
    for (const t of (tags.length ? tags : [])) { const key = t.includes(':') && t.lastIndexOf(':') > t.lastIndexOf('/') ? t : t + ':latest'; sim.images[key] = res.image; ctx.println(` => => naming to docker.io/library/${key}`.padEnd(78) + '0.0s'); }
    if (!tags.length) ctx.println(` => => writing image sha256:${res.image.id}${PG.hex(52)}`); return 0; }
  if (sub === 'push') { const ref = o.rest[0]; const p = PG.parseImage(ref); const key = ref.lastIndexOf(':') > ref.lastIndexOf('/') ? ref : ref + ':latest'; const img = sim.images[key];
    if (!img) { ctx.eprintln(`The push refers to repository [${p.host ? p.host + '/' : 'docker.io/'}${p.repo}]\nAn image does not exist locally with the tag: ${p.host ? p.host + '/' : ''}${p.repo}`); return 1; }
    if (!p.host) { ctx.eprintln(`denied: requested access to the resource is denied`); return 1; }
    const reg = sim.containers.find(c => c.kind === 'registry' && c.status === 'running' && c.ports.some(x => p.host.endsWith(':' + x.host))); 
    ctx.println(`The push refers to repository [${p.host}/${p.repo}]`);
    if (!reg) { await ctx.delay(200); ctx.eprintln(`Get "http://${p.host}/v2/": dial tcp [::1]:${p.host.split(':')[1] || 443}: connect: connection refused`); return 1; }
    await ctx.delay(300); ctx.println(`${PG.hex(12)}: Pushed`); ctx.println(`${p.tag}: digest: sha256:${PG.hex(64)} size: 1570`);
    sim.registries[reg.name][p.repo + ':' + p.tag] = { meta: img.meta, size: img.size }; sim.note(`registry ${reg.name} received ${p.repo}:${p.tag}`); return 0; }
  if (sub === 'run') {
    let name = null, ports = [], net = 'bridge', restart = '', detach = false, image = null, i = 0, cmdv = [], rm = false;
    for (; i < rest.length; i++) { const a = rest[i]; if (a === '-d') detach = true; else if (a === '--rm') rm = true; else if (a === '-i' || a === '-t' || a === '-it') { } else if (a === '--name') name = rest[++i]; else if (a === '-p') ports.push(rest[++i]); else if (a === '--network') net = rest[++i]; else if (a.startsWith('--restart')) restart = a.includes('=') ? a.split('=')[1] : rest[++i]; else if (a === '--platform' || a === '-v' || a === '-w' || a === '-e' || a === '--entrypoint') i++; else if (!a.startsWith('-')) { image = a; cmdv = rest.slice(i + 1); break; } }
    if (!image) { ctx.eprintln('"docker run" requires at least 1 argument'); return 125; }
    if (name && find(name)) { ctx.eprintln(`docker: Error response from daemon: Conflict. The container name "/${name}" is already in use by container "${find(name).id}${PG.hex(52)}". You have to remove (or rename) that container to be able to reuse that name.`); return 125; }
    const p = PG.parseImage(image); const key = p.host ? image : p.repo + ':' + p.tag; const local = sim.images[key] || sim.images[image];
    if (!local) { if (!PG.dockerAvailable(image)) { ctx.eprintln(`Unable to find image '${image}' locally\ndocker: Error response from daemon: pull access denied for ${p.repo}, repository does not exist or may require 'docker login'.`); return 125; } ctx.println(`Unable to find image '${image}' locally`); ctx.println(`${p.tag}: Pulling from ${p.repo.includes('/') ? p.repo : 'library/' + p.repo}`); await ctx.delay(400); ctx.println(`Status: Downloaded newer image for ${image}`); sim.images[key] = { id: PG.hex(12), size: (PG.CATALOG[p.repo] || {}).size || 50 }; }
    const mapped = ports.map(s => { const parts = s.split(':'); let hostIp = '0.0.0.0', host, cont; if (parts.length === 3) [hostIp, host, cont] = parts; else if (parts.length === 2) [host, cont] = parts; else { cont = parts[0]; host = cont; } return { hostIp, host: Number(host), container: Number(cont.split('/')[0]) }; });
    for (const m of mapped) { const clash = sim.containers.find(c => c.status === 'running' && c.ports.some(x => x.host === m.host && (x.hostIp === m.hostIp || x.hostIp === '0.0.0.0' || m.hostIp === '0.0.0.0'))); if (clash) { ctx.eprintln(`docker: Error response from daemon: driver failed programming external connectivity on endpoint ${name || 'container'}: Bind for ${m.hostIp}:${m.host} failed: port is already allocated.`); return 125; } }
    if (net !== 'bridge' && !sim.networks.includes(net)) { ctx.eprintln(`docker: Error response from daemon: network ${net} not found.`); return 125; }
    const isReg = p.repo === 'registry'; const c = sim.addContainer({ name: name || ['brave', 'calm', 'eager'][Math.floor(Math.random() * 3)] + '_' + PG.rnd(5), image, kind: isReg ? 'registry' : 'other', networks: [net], ports: mapped, restart });
    if (isReg) sim.registries[c.name] = {};
    const info = PG.CATALOG[p.repo] || {};
    if (!detach) { if (info.type === 'tool' && cmdv.length) { const e = /echo\s+(.*)/.exec(cmdv.join(' ')); if (e) ctx.println(e[1].replace(/^["']|["']$/g, '')); } c.status = 'exited'; if (rm) sim.containers.splice(sim.containers.indexOf(c), 1); return 0; }
    ctx.println(c.id + PG.hex(52)); return 0; }
  if (sub === 'rm') { for (const n of o.rest) { const c = find(n); if (!c) { ctx.eprintln(`Error response from daemon: No such container: ${n}`); return 1; } if (c.status === 'running' && !o.flags.has('f')) { ctx.eprintln(`Error response from daemon: cannot remove container "/${c.name}": container is running: stop the container before removing or force remove`); return 1; } sim.containers.splice(sim.containers.indexOf(c), 1); delete sim.registries[c.name]; ctx.println(n); sim.note('container ' + n + ' removed'); } return 0; }
  if (sub === 'stop' || sub === 'kill') { for (const n of o.rest) { const c = find(n); if (!c) { ctx.eprintln(`Error response from daemon: No such container: ${n}`); return 1; } c.status = 'exited'; c.startedAt = sim.clock; ctx.println(n); } return 0; }
  if (sub === 'start') { for (const n of o.rest) { const c = find(n); if (!c) { ctx.eprintln(`Error response from daemon: No such container: ${n}`); return 1; } const clash = c.ports.find(p => sim.containers.some(x => x !== c && x.status === 'running' && x.ports.some(y => y.host === p.host))); if (clash) { ctx.eprintln(`Error response from daemon: driver failed programming external connectivity: Bind for ${clash.hostIp}:${clash.host} failed: port is already allocated`); return 1; } c.status = 'running'; c.startedAt = sim.clock; ctx.println(n); } return 0; }
  if (sub === 'restart') { for (const n of o.rest) { const c = find(n); if (!c) { ctx.eprintln(`Error response from daemon: No such container: ${n}`); return 1; } c.status = 'running'; c.startedAt = sim.clock; ctx.println(n); } return 0; }
  if (sub === 'logs') { const c = find(o.rest[0] || ''); if (!c) { ctx.eprintln('Error response from daemon: No such container'); return 1; } ctx.println(c.kind === 'registry' ? 'time="2026-10-14T09:00:00Z" level=info msg="listening on [::]:5000"' : '(no logs in the simulation)'); return 0; }
  if (sub === 'network') { const [s2, ...r2] = rest; if (s2 === 'ls') { ctx.println(PG.table(sim.networks.map(n => [PG.hex(12), n, n === 'host' ? 'host' : n === 'none' ? 'null' : 'bridge', 'local']), ['NETWORK ID', 'NAME', 'DRIVER', 'SCOPE'])); return 0; }
    if (s2 === 'create') { sim.ensureNetwork(r2[r2.length - 1]); ctx.println(PG.hex(64)); return 0; }
    if (s2 === 'connect') { const [net, cn] = r2.filter(a => !a.startsWith('-')); if (!sim.networks.includes(net)) { ctx.eprintln(`Error response from daemon: network ${net} not found`); return 1; } const c = find(cn); if (!c) { ctx.eprintln(`Error response from daemon: No such container: ${cn}`); return 1; } if (c.networks.includes(net)) { ctx.eprintln(`Error response from daemon: endpoint with name ${c.name} already exists in network ${net}`); return 1; } c.networks.push(net); return 0; }
    ctx.eprintln('docker network: only ls, create, connect are simulated'); return 1; }
  if (sub === 'system') { if (rest[0] === 'df') { const imgs = Object.keys(sim.images); const tot = imgs.reduce((a, k) => a + sim.images[k].size, 0); ctx.println(`TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE\nImages          ${imgs.length}         ${imgs.length}         ${tot}MB     0B (0%)\nContainers      ${sim.containers.length}         ${sim.containers.filter(c => c.status === 'running').length}         1.2GB     0B (0%)\nLocal Volumes   2         0         120MB     120MB (100%)`); return 0; } if (rest[0] === 'prune') { ctx.println('Total reclaimed space: 0B'); return 0; } }
  if (sub === 'exec') {
    const cn = o.rest[0]; const c = find(cn || ''); const cmdv = rest.slice(rest.indexOf(cn) + 1);
    if (!c) { ctx.eprintln(`Error response from daemon: No such container: ${cn}`); return 1; }
    if (c.status !== 'running') { ctx.eprintln(`Error response from daemon: container ${c.id}${PG.hex(52)} is not running`); return 1; }
    const cl = sim.clusters[c.clusterId]; const node = cl && cl.nodes.find(n => n.containerName === c.name);
    if (!node) { ctx.eprintln(`(exec in "${c.name}" is only simulated for kind/k3d node containers)`); return 1; }
    return PG.nodeExec(ctx, cl, node, cmdv);
  }
  ctx.eprintln(`docker: '${sub}' is not simulated in the playground (try: docker --help)`); return 1;
};
PG.nodeExec = (ctx, cl, node, argv) => {
  const [cmd, ...a] = argv; const fs = node.fs;
  if (cmd === 'mkdir') { for (const p of a.filter(x => !x.startsWith('-'))) fs[p + '/'] = true; return 0; }
  if (cmd === 'cp' && a[0] === '/dev/stdin') { const dest = a[1]; fs[dest] = ctx.stdin || ''; const m = /\/etc\/containerd\/certs\.d\/([^/]+)\/hosts\.toml$/.exec(dest); if (m) { const h = /\[host\."([^"]+)"\]/.exec(ctx.stdin || ''); if (h) node.mirror[m[1]] = h[1]; } return 0; }
  if (cmd === 'crictl') {
    if (a[0] === 'images') { const rows = Object.keys(node.images).map(k => { const m = /^(.*):([^:/]+)$/.exec(k); return [m[1], m[2], PG.hex(13), '40MB']; }); ctx.println(PG.table(rows, ['IMAGE', 'TAG', 'IMAGE ID', 'SIZE'])); return 0; }
    if (a[0] === 'rmi') { if (a[1] === '--prune') { ctx.println('Deleted unused images (simulated)'); return 0; } for (const img of a.slice(1)) { const key = Object.keys(node.images).find(k => k === img || k === PG.normImage(img)); if (!key) { ctx.eprintln(`E1014 rpc error: code = NotFound desc = failed to get image: ${img}`); return 1; } const inUse = cl.res.pods.some(p => p.spec.nodeName === node.name && !p.metadata.deletionTimestamp && p.spec.containers.some(c => PG.normImage(c.image) === key)); if (inUse) { ctx.eprintln(`E1014 rpc error: code = Unknown desc = failed to delete image: image is in use by a running container`); return 1; } delete node.images[key]; ctx.println('Deleted: ' + key); } return 0; }
    if (a[0] === 'ps') { const pods = cl.res.pods.filter(p => p.spec.nodeName === node.name); ctx.println(PG.table(pods.map(p => [PG.hex(13), p.spec.containers[0].image, '2 minutes ago', 'Running', p.spec.containers[0].name, PG.hex(13), p.metadata.name]), ['CONTAINER', 'IMAGE', 'CREATED', 'STATE', 'NAME', 'POD ID', 'POD'])); return 0; }
  }
  if (cmd === 'ls') { const p = (a.filter(x => !x.startsWith('-'))[0] || '/').replace(/\/$/, ''); if (p === '/etc/kubernetes/manifests' && node.role === 'control-plane' && cl.tool === 'kind') { ctx.println('etcd.yaml\nkube-apiserver.yaml\nkube-controller-manager.yaml\nkube-scheduler.yaml'); return 0; } const kids = Object.keys(fs).filter(k => k.startsWith(p + '/')).map(k => k.slice(p.length + 1).split('/')[0]).filter(Boolean); if (kids.length || fs[p + '/']) { ctx.println([...new Set(kids)].join('\n')); return 0; } ctx.eprintln(`ls: cannot access '${p}': No such file or directory`); return 2; }
  if (cmd === 'cat') { const c = fs[a[0]]; if (c === undefined) { ctx.eprintln(`cat: ${a[0]}: No such file or directory`); return 1; } ctx.out(c); return 0; }
  ctx.eprintln(`(node shell: only mkdir, cp /dev/stdin, ls, cat, crictl images|ps|rmi are simulated; got "${cmd}")`); return 1;
};

/* =================================================================== kind ==== */
PG.commands.kind = async (ctx, args) => {
  const sim = ctx.sim; const sub = args[0]; const sub2 = args[1]; const rest = args.slice(1);
  const flag = (n, def) => { const i = args.indexOf(n); if (i >= 0) return args[i + 1]; const e = args.find(a => a.startsWith(n + '=')); return e ? e.split('=')[1] : def; };
  const kinds = () => Object.values(sim.clusters).filter(c => c.tool === 'kind');
  if (!sub || sub === '--help' || sub === 'help') { ctx.println(`kind creates and manages local Kubernetes clusters using Docker container 'nodes'
Usage:  kind [command]
  create cluster [--name N] [--config FILE]     delete cluster [--name N]
  get clusters | nodes [--name N] | kubeconfig [--name N] [--internal]
  load docker-image IMAGE [--name N] [--nodes a,b]      export kubeconfig [--name N]      version`); return 0; }
  if (sub === 'version') { ctx.println('kind v0.33.0 go1.27.0 darwin/arm64'); return 0; }
  if (sub === 'get' && sub2 === 'clusters') { const k = kinds(); if (!k.length) { ctx.eprintln('No kind clusters found.'); return 0; } ctx.println(k.map(c => c.id).join('\n')); return 0; }
  if (sub === 'get' && sub2 === 'nodes') { const name = flag('--name', 'kind'); const cl = sim.clusters['kind-' + name]; if (!cl) { ctx.eprintln(`No kind nodes found for cluster "${name}".`); return 0; } ctx.println(cl.nodes.map(n => n.name).join('\n')); return 0; }
  if (sub === 'get' && sub2 === 'kubeconfig') { const name = flag('--name', 'kind'); const cl = sim.clusters['kind-' + name]; if (!cl) { ctx.eprintln(`ERROR: unknown cluster "${name}"`); return 1; } const internal = args.includes('--internal'); ctx.out(PG.yaml.dump({ apiVersion: 'v1', kind: 'Config', clusters: [{ name: 'kind-' + name, cluster: { server: internal ? `https://${name}-control-plane:6443` : cl.api, 'certificate-authority-data': 'SIMULATED' } }], contexts: [{ name: 'kind-' + name, context: { cluster: 'kind-' + name, user: 'kind-' + name } }], 'current-context': 'kind-' + name, users: [{ name: 'kind-' + name, user: { 'client-certificate-data': 'SIMULATED', 'client-key-data': 'SIMULATED' } }] })); return 0; }
  if (sub === 'export' && sub2 === 'kubeconfig') { const name = flag('--name', 'kind'); const cl = sim.clusters['kind-' + name]; if (!cl) { ctx.eprintln(`ERROR: unknown cluster "${name}"`); return 1; } sim.addKubeEntries(cl.entry, cl.api, { kind: 'admin' }); sim.kubeconfig.current = cl.entry; ctx.println(`Set kubectl context to "kind-${name}"`); return 0; }
  if (sub === 'create' && sub2 === 'cluster') {
    let cfg = { nodes: [{ role: 'control-plane' }] }; const cf = flag('--config'); let name = flag('--name');
    if (cf) { const txt = ctx.fs.read(ctx.resolve(cf)); if (txt === undefined) { ctx.eprintln(`ERROR: failed to create cluster: failed to read configuration: open ${cf}: no such file or directory`); return 1; } let y; try { y = PG.yaml.parse(txt); } catch (e) { y = null; } if (!y || y.kind !== 'Cluster') { ctx.eprintln(`ERROR: failed to create cluster: unable to decode config from "${cf}": kind must be "Cluster"`); return 1; } cfg = { ...y, nodes: y.nodes && y.nodes.length ? y.nodes : [{ role: 'control-plane' }] }; if (!name && y.name) name = y.name; }
    name = name || 'kind';
    if (sim.clusters['kind-' + name]) { ctx.eprintln(`ERROR: failed to create cluster: node(s) already exist for a cluster with the name "${name}"`); return 1; }
    ctx.println(`Creating cluster "${name}" ...`);
    const nn = cfg.nodes.length; const steps = [` ✓ Ensuring node image (kindest/node:v1.35.0) 🖼`, ` ✓ Preparing nodes ${Array.from('📦'.repeat(nn)).join(' ')}`, ` ✓ Writing configuration 📜`, ` ✓ Starting control-plane 🕹️`, ` ✓ Installing CNI 🔌`, ` ✓ Installing StorageClass 💾`];
    if (cfg.nodes.some(n => n.role === 'worker')) steps.push(` ✓ Joining worker nodes 🚜`);
    for (const s of steps) { await ctx.delay(450); ctx.println(s); }
    const cl = PG.makeKindCluster(sim, { ...cfg, name }); PG.fastForward(sim, 45);
    ctx.println(`Set kubectl context to "kind-${name}"\nYou can now use your cluster with:\n\nkubectl cluster-info --context kind-${name}\n\nHave a nice day! 👋`); return 0;
  }
  if (sub === 'delete' && sub2 === 'cluster') {
    const name = flag('--name', 'kind'); ctx.println(`Deleting cluster "${name}" ...`); const cl = sim.clusters['kind-' + name];
    if (!cl) { const o = Object.values(sim.clusters).find(c => c.entry === name || c.id === name); if (o) ctx.info(`("${name}" is not a kind cluster, it is ${o.tool.toUpperCase()}. Delete it with: ${PG.deleteCommandFor(o)})`); return 0; }
    const names = sim.containers.filter(c => c.clusterId === cl.entry).map(c => c.name); sim.containers = sim.containers.filter(c => c.clusterId !== cl.entry); delete sim.clusters[cl.entry]; sim.removeKubeEntries(cl.entry); sim.forwards = sim.forwards.filter(f => f.cluster !== cl);
    ctx.println(`Deleted nodes: [${names.map(n => '"' + n + '"').join(' ')}]`); return 0;
  }
  if (sub === 'load' && sub2 === 'docker-image') {
    const name = flag('--name', 'kind'); const cl = sim.clusters['kind-' + name]; if (!cl) { ctx.eprintln(`ERROR: no nodes found for cluster "${name}"`); return 1; }
    const imgs = args.slice(2).filter((a, i, arr) => !a.startsWith('--') && arr[i - 1] !== '--name' && arr[i - 1] !== '--nodes'); const only = flag('--nodes');
    for (const im of imgs) { const p = PG.parseImage(im); const key = sim.images[im] ? im : p.repo + ':' + p.tag; if (!sim.images[key]) { ctx.eprintln(`ERROR: image: "${im}" not present locally`); return 1; } for (const n of cl.nodes) { if (only && !only.split(',').includes(n.name)) continue; ctx.println(`Image: "${im}" with ID "sha256:${sim.images[key].id}${PG.hex(52)}" not yet present on node "${n.name}", loading...`); await ctx.delay(150); n.images[PG.normImage(im)] = true; } }
    return 0;
  }
  ctx.eprintln(`kind: "${args.join(' ')}" is not simulated. Try: kind --help`); return 1;
};

/* ==================================================================== k3d ==== */
PG.commands.k3d = async (ctx, args) => {
  const sim = ctx.sim; const [a, b] = args; const rest = args.slice(2);
  const k3ds = () => Object.values(sim.clusters).filter(c => c.tool === 'k3d');
  const getCl = n => sim.clusters['k3d-' + n];
  if (!a || a === '--help' || a === 'help') { ctx.println(`k3d is a wrapper around k3s: Kubernetes in Docker with batteries.
  cluster create NAME [--servers N] [--agents N] [--port "8080:80@loadbalancer"] [--registry-create NAME:HOST:PORT]
  cluster list | stop NAME | start NAME | delete NAME
  node create NAME --cluster C [--role agent] | node list | node delete NAME
  image import IMAGE -c CLUSTER      registry list      kubeconfig get NAME      version`); return 0; }
  if (a === 'version') { ctx.println('k3d version v5.8.3\nk3s version v1.33.4-k3s1 (default)'); return 0; }
  if (a === 'cluster' && b === 'create') {
    const o = PG.opts(rest); const name = rest.find(x => !x.startsWith('-') && rest[rest.indexOf(x) - 1] !== '--servers' && rest[rest.indexOf(x) - 1] !== '--agents' && rest[rest.indexOf(x) - 1] !== '--port' && rest[rest.indexOf(x) - 1] !== '-p' && rest[rest.indexOf(x) - 1] !== '--registry-create' && rest[rest.indexOf(x) - 1] !== '--k3s-arg') || 'k3s-default';
    const f = n => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : (rest.find(x => x.startsWith(n + '=')) || '').split('=')[1]; };
    if (getCl(name)) { ctx.eprintln(`FATA[0000] Failed to create cluster '${name}' because a cluster with that name already exists`); return 1; }
    const ports = []; rest.forEach((x, i) => { if ((x === '--port' || x === '-p') && rest[i + 1]) { const m = /^(?:[\d.]+:)?(\d+):(\d+)@(.+)$/.exec(rest[i + 1]); if (m) ports.push({ host: Number(m[1]), container: Number(m[2]), target: m[3] }); } });
    let registry = null; const rc = f('--registry-create'); if (rc) { const p = rc.split(':'); registry = { name: p[0], host: p.length > 2 ? p[1] : '0.0.0.0', port: Number(p[p.length - 1]) || 5000 }; if (sim.container('k3d-' + registry.name)) { ctx.eprintln(`FATA[0000] Failed to create registry: container 'k3d-${registry.name}' already exists`); return 1; } }
    const clash = ports.find(p => sim.containers.some(c => c.status === 'running' && c.ports.some(x => x.host === p.host))); if (clash) { ctx.eprintln(`FATA[0000] Failed to create cluster: port ${clash.host} is already allocated`); return 1; }
    const lines = [`INFO[0000] Prep: Network`, `INFO[0000] Created network 'k3d-${name}'`, `INFO[0000] Created image volume k3d-${name}-images`]; if (registry) lines.push(`INFO[0000] Creating node 'k3d-${registry.name}'`, `INFO[0001] Successfully created registry 'k3d-${registry.name}'`);
    lines.push(`INFO[0001] Creating node 'k3d-${name}-server-0'`); for (let i = 0; i < (Number(f('--agents')) || 0); i++) lines.push(`INFO[0002] Creating node 'k3d-${name}-agent-${i}'`); lines.push(`INFO[0003] Creating LoadBalancer 'k3d-${name}-serverlb'`, `INFO[0008] Starting new tools node...`, `INFO[0012] Cluster '${name}' created successfully!`);
    for (const l of lines) { await ctx.delay(220); ctx.println(l); }
    PG.makeK3dCluster(sim, { name, servers: Number(f('--servers')) || 1, agents: Number(f('--agents')) || 0, ports, registry }); PG.fastForward(sim, 30);
    ctx.println(`INFO[0013] You can now use it like this:\nkubectl cluster-info`); ctx.println(`INFO[0013] Updated kubeconfig; current context: k3d-${name}`); return 0;
  }
  if (a === 'cluster' && b === 'list') { const l = k3ds(); ctx.println(PG.table(l.map(c => { const ctrs = sim.containers.filter(x => x.clusterId === c.entry); const run = ctrs.filter(x => x.status === 'running' && x.kind === 'node'); const s = c.nodes.filter(n => n.role === 'control-plane').length, ag = c.nodes.length - s; return [c.id, `${run.filter(x => /server/.test(x.name)).length}/${s}`, `${run.filter(x => /agent|k3d-.*-0$/.test(x.name) && !/server/.test(x.name)).length}/${ag}`, 'true']; }), ['NAME', 'SERVERS', 'AGENTS', 'LOADBALANCER'])); return 0; }
  if (a === 'cluster' && (b === 'stop' || b === 'start')) { const cl = getCl(rest[0]); if (!cl) { ctx.eprintln(`FATA[0000] No nodes found for given cluster`); return 1; } for (const c of sim.containers.filter(x => x.clusterId === cl.entry)) { c.status = b === 'stop' ? 'exited' : 'running'; c.startedAt = sim.clock; } ctx.println(`INFO[0000] ${b === 'stop' ? 'Stopping' : 'Starting'} cluster '${rest[0]}'`); if (b === 'start') PG.fastForward(sim, 15); return 0; }
  if (a === 'cluster' && b === 'delete') { const cl = getCl(rest[0]); if (!cl) { ctx.eprintln(`FATA[0000] No nodes found for given cluster`); return 1; } sim.containers = sim.containers.filter(c => c.clusterId !== cl.entry); delete sim.clusters[cl.entry]; sim.removeKubeEntries(cl.entry); sim.forwards = sim.forwards.filter(f => f.cluster !== cl); ctx.println(`INFO[0000] Deleting cluster '${rest[0]}'\nINFO[0002] Deleted k3d-${rest[0]}-serverlb\nINFO[0003] Removing cluster details from default kubeconfig...\nINFO[0003] Successfully deleted cluster ${rest[0]}!`); return 0; }
  if (a === 'node' && b === 'list') { const rows = []; for (const c of k3ds()) for (const x of sim.containers.filter(y => y.clusterId === c.entry)) rows.push([x.name, x.kind === 'lb' ? 'loadbalancer' : /server/.test(x.name) ? 'server' : 'agent', c.id, x.status === 'running' ? 'running' : 'exited']); for (const x of sim.containers.filter(y => y.kind === 'registry' && y.name.startsWith('k3d-'))) rows.push([x.name, 'registry', '', x.status === 'running' ? 'running' : 'exited']); ctx.println(PG.table(rows, ['NAME', 'ROLE', 'CLUSTER', 'STATUS'])); return 0; }
  if (a === 'node' && b === 'create') { const o = PG.opts(rest); const cn = rest[rest.indexOf('--cluster') + 1] || rest[rest.indexOf('-c') + 1]; const cl = getCl(cn); if (!cl) { ctx.eprintln(`FATA[0000] Failed to create node: cluster '${cn}' not found`); return 1; } const nm = rest.find(x => !x.startsWith('-') && x !== cn && !['agent', 'server'].includes(x)); const role = (rest[rest.indexOf('--role') + 1] || 'agent'); let i = 0; while (sim.container(`k3d-${nm}-${i}`)) i++; const full = `k3d-${nm}-${i}`; ctx.println(`INFO[0000] Adding 1 node(s) to the runtime local cluster '${cn}'...\nINFO[0000] Using the k3d-tools node to gather environment information\nINFO[0001] Starting new tools node...\nINFO[0003] Starting node '${full}'`); const ip = '172.19.0.' + (cl.nodes.length + 10); sim.addContainer({ name: full, image: 'rancher/k3s:v1.33.4-k3s1', kind: 'node', clusterId: cl.entry, networks: ['k3d-' + cn], ip }); cl.addNode({ name: full, role: role === 'server' ? 'control-plane' : 'worker', containerName: full, ip, version: 'v1.33.4+k3s1', osImage: 'K3s v1.33.4+k3s1', runtime: 'containerd://2.0.5-k3s2' }); PG.fastForward(sim, 8); ctx.println(`INFO[0006] Successfully created 1 node(s)!`); return 0; }
  if (a === 'node' && b === 'delete') { for (const nm of rest.filter(x => !x.startsWith('-'))) { const c = sim.container(nm); if (!c) { ctx.eprintln(`FATA[0000] No node '${nm}' found`); return 1; } const cl = sim.clusters[c.clusterId]; sim.containers.splice(sim.containers.indexOf(c), 1); if (cl) { const n = cl.nodes.find(x => x.containerName === nm); if (n) { cl.nodes.splice(cl.nodes.indexOf(n), 1); } } ctx.println(`INFO[0000] Deleted node '${nm}'`); } return 0; }
  if (a === 'image' && b === 'import') { const cn = rest[rest.indexOf('-c') + 1] || rest[rest.indexOf('--cluster') + 1]; const cl = getCl(cn); if (!cl) { ctx.eprintln(`FATA[0000] No clusters found (use -c <cluster>)`); return 1; } const im = rest.find(x => !x.startsWith('-') && x !== cn); const p = PG.parseImage(im); const key = sim.images[im] ? im : p.repo + ':' + p.tag; if (!sim.images[key]) { ctx.eprintln(`FATA[0000] Image '${im}' not found locally`); return 1; } ctx.println(`INFO[0000] Importing image(s) into cluster '${cn}'`); for (const n of cl.nodes) n.images[PG.normImage(im)] = true; ctx.println(`INFO[0002] Successfully imported 1 image(s) into 1 cluster(s)`); return 0; }
  if (a === 'registry' && b === 'list') { ctx.println(PG.table(sim.containers.filter(c => c.kind === 'registry' && c.name.startsWith('k3d-')).map(c => [c.name, 'registry', c.status === 'running' ? 'running' : 'exited']), ['NAME', 'ROLE', 'CLUSTER'])); return 0; }
  if (a === 'registry' && b === 'delete') { for (const n of rest.filter(x => !x.startsWith('-'))) { const c = sim.container(n); if (c) sim.containers.splice(sim.containers.indexOf(c), 1); ctx.println(`INFO[0000] Deleted registry ${n}`); } return 0; }
  if (a === 'kubeconfig') { ctx.println(`INFO[0000] Updated kubeconfig (simulated)`); return 0; }
  ctx.eprintln(`k3d: "${args.join(' ')}" is not simulated. Try: k3d --help`); return 1;
};
if (typeof module !== 'undefined') module.exports = PG;
