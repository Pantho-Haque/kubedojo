/* ====================================================================== helm 2 === */
PG.seedChart = (sim, onlyMissing) => { const f = PG.CHART_FILES || {}; let n = 0; for (const [p, c] of Object.entries(f)) { if (onlyMissing && ('/home/user/' + p) in sim.fs.files) continue; sim.fs.write('/home/user/' + p, c); n++; } sim.fs.mkdirp('/home/user/myapp/charts'); return n; };
PG.HELM_VER = 'v2.17.0';
PG.helmDate = t => { const d = new Date(PG.BASE_TIME + t * 1000); const pad = n => String(n).padStart(2, '0'); return `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getUTCDay()]} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]} ${d.getUTCDate()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} ${d.getUTCFullYear()}`; };
PG.tillerInfo = cl => {
  const dep = cl.find('deployments', 'tiller-deploy', 'kube-system'); if (!dep) return { err: 'Error: could not find tiller' };
  const img = dep.spec.template.spec.containers[0].image; const ver = (/:(v[\d.]+)/.exec(img) || [])[1] || PG.HELM_VER;
  if (!cl.matchPods('kube-system', dep.spec.selector).some(p => cl.podReady(p))) return { err: 'Error: could not find a ready tiller pod' };
  if (ver !== PG.HELM_VER) return { err: `Error: incompatible versions client[${PG.HELM_VER}] server[${ver}]` };
  const sa = dep.spec.template.spec.serviceAccountName || 'default';
  return { dep, ver, id: { user: `system:serviceaccount:kube-system:${sa}`, groups: ['system:serviceaccounts', 'system:serviceaccounts:kube-system', 'system:authenticated'] } };
};
PG.parseSet = (sets, base) => {
  let out = PG.clone(base);
  for (const s of sets) {
    const parts = s.replace(/\\,/g, '\u0001').split(','); for (const part of parts) {
      const i = part.indexOf('='); if (i < 0) continue; const key = part.slice(0, i); let raw = part.slice(i + 1).replace(/\u0001/g, ','); let v;
      if (/^\{.*\}$/.test(raw)) v = raw.slice(1, -1).split(',').filter(Boolean); else v = raw === 'true' ? true : raw === 'false' ? false : raw === 'null' ? null : /^-?\d+$/.test(raw) && raw.length < 16 ? Number(raw) : raw;
      const path = key.split('.'); let cur = out; path.forEach((seg, idx) => { const m = /^([^\[]+)\[(\d+)\]$/.exec(seg); const last = idx === path.length - 1; if (m) { cur[m[1]] = cur[m[1]] || []; if (last) cur[m[1]][Number(m[2])] = v; else { cur[m[1]][Number(m[2])] = cur[m[1]][Number(m[2])] || {}; cur = cur[m[1]][Number(m[2])]; } } else if (last) cur[seg] = v; else { if (!PG.isObj(cur[seg])) cur[seg] = {}; cur = cur[seg]; } });
    }
  }
  return out;
};
PG.renderChart = (chart, rel) => { // rel: {name, namespace, values, isInstall, revision}
  const T = PG.GoTpl; const defs = {}; const parsedFiles = {}; const out = []; let notes = '';
  try {
    for (const [name, src] of Object.entries(chart.templates)) { const full = `${chart.meta.name}/templates/${name}`; const parsed = T.parse(src, full); parsedFiles[name] = { parsed, full }; Object.assign(defs, parsed.defs); }
  } catch (e) { return { err: `Error: parse error in "${chart.meta.name}/templates/": ${e.message}` }; }
  const kv = chart.meta; const data = { Values: rel.values, Release: { Name: rel.name, Namespace: rel.namespace, Service: 'Tiller', IsInstall: rel.isInstall, IsUpgrade: !rel.isInstall, Revision: rel.revision, Time: PG.iso(0) }, Chart: { Name: kv.name, Version: kv.version, AppVersion: kv.appVersion, Description: kv.description, ...kv }, Template: { BasePath: `${kv.name}/templates`, Name: '' }, Files: { Get: p => chart.fsRead(p) === undefined ? '' : chart.fsRead(p), Glob: () => ({}) }, Capabilities: { APIVersions: { Has: v => /^(v1|apps\/v1|batch\/v1|networking\.k8s\.io\/v1|policy\/v1|autoscaling\/v2|rbac\.authorization\.k8s\.io\/v1)$/.test(v) }, KubeVersion: { Major: '1', Minor: '35', GitVersion: 'v1.35.0' } } };
  const renderFile = (fileName, d) => {
    const pf = parsedFiles[fileName]; const ctx2 = { name: pf.full, funcs: {}, include: null };
    const inc = (n, dd) => { if (defs[n]) return T.render({ root: { body: defs[n].body } }, dd, { ...ctx2, name: n, funcs: { include: inc }, include: inc }); const m = Object.entries(parsedFiles).find(([, v]) => v.full === n); if (m) return T.render(m[1].parsed, dd, { name: n, funcs: { include: inc }, include: inc }); throw new T.TplError(`template "${n}" not defined`); };
    ctx2.funcs.include = inc; ctx2.include = inc; ctx2.funcs.tpl = (txt, dd) => T.render(T.parse(txt, 'tpl'), dd, ctx2);
    return T.render(pf.parsed, { ...d, Template: { ...d.Template, Name: pf.full } }, ctx2);
  };
  for (const name of Object.keys(chart.templates).sort()) {
    const base = name.split('/').pop(); if (base.startsWith('_')) continue;
    try { const text = renderFile(name, data); if (base === 'NOTES.txt') { notes = text; continue; } if (text.trim()) out.push({ file: `${kv.name}/templates/${name}`, name, text }); }
    catch (e) { if (e.isTpl) return { err: `Error: render error in "${kv.name}/templates/${name}": ${e.message}` }; throw e; }
  }
  return { files: out, notes: notes.trim() ? notes.replace(/^\n+/, '') : '', data };
};
PG.HELM_ORDER = ['Namespace', 'ResourceQuota', 'ServiceAccount', 'Secret', 'ConfigMap', 'PersistentVolumeClaim', 'Role', 'ClusterRole', 'RoleBinding', 'ClusterRoleBinding', 'Service', 'DaemonSet', 'Pod', 'Deployment', 'Job', 'CronJob', 'Ingress', 'NetworkPolicy', 'HorizontalPodAutoscaler', 'PodDisruptionBudget'];
PG.splitDocs = (files, err) => { // -> {docs:[{doc,file,hooks}], err}
  const docs = [];
  for (const f of files) { let ds; try { ds = PG.yaml.parseDocs(f.text); } catch (e) { return { err: `Error: YAML parse error on ${f.file}: error converting YAML to JSON: ${e.message}` }; }
    for (const d of ds) { if (!PG.isObj(d)) return { err: `Error: YAML parse error on ${f.file}: error converting YAML to JSON: yaml: did not find expected key` }; if (!d.kind) return { err: `Error: YAML parse error on ${f.file}: error validating data: kind not set` }; const hk = ((d.metadata || {}).annotations || {})['helm.sh/hook']; docs.push({ doc: d, file: f.file, hooks: hk ? String(hk).split(',').map(x => x.trim()) : [], w: Number(((d.metadata || {}).annotations || {})['helm.sh/hook-weight'] || 0), del: (((d.metadata || {}).annotations || {})['helm.sh/hook-delete-policy'] || '') }); } }
  docs.sort((a, b) => (PG.HELM_ORDER.indexOf(a.doc.kind) + 100) % 100 - (PG.HELM_ORDER.indexOf(b.doc.kind) + 100) % 100);
  return { docs };
};
PG.manifestText = docs => docs.map(d => `---\n# Source: ${d.file}\n${PG.yaml.dump(d.doc).trimEnd()}`).join('\n');
PG.releaseTable = (cl, objs) => { const groups = {}; for (const o of objs) { const k = PG.KINDS[o.plural]; const key = `${k.api}/${k.kind}`; (groups[key] = groups[key] || []).push(o); } return Object.entries(groups).map(([k, list]) => { const plural = list[0].plural; const real = list.map(o => cl.find(plural, o.name, o.ns)).filter(Boolean); if (!real.length) return ''; const tb = PG.renderTable(cl, plural, real, {}); return `==> ${k}\n${tb.text}`; }).filter(Boolean).join('\n\n'); };
PG.helmRecord = (cl, rel, rev) => { // store the revision as a ConfigMap in kube-system, like Tiller does
  const nm = `${rel.name}.v${rev.rev}`; const old = cl.find('configmaps', nm, 'kube-system'); if (old) cl.del('configmaps', old);
  cl.mk('configmaps', nm, 'kube-system', { metadata: { labels: { NAME: rel.name, OWNER: 'TILLER', STATUS: rev.status, VERSION: String(rev.rev) } }, data: { release: PG.b64(JSON.stringify({ name: rel.name, namespace: rel.namespace, manifest: rev.manifest, config: rev.userValues })) } });
};
PG.helmSetStatus = (cl, rel, rev, status) => { rev.status = status; const cm = cl.find('configmaps', `${rel.name}.v${rev.rev}`, 'kube-system'); if (cm) { cm.metadata.labels.STATUS = status; } };
PG.helmApply = async (ctx, cl, rel, docs, tid, verbWord) => {
  const K = { cl, id: tid.id, ns: rel.namespace }; const created = []; const c2 = Object.create(ctx); c2.src = 'helm';
  for (const d of docs) {
    const plural = PG.KIND_OF[d.doc.kind]; const ns = (d.doc.metadata || {}).namespace || rel.namespace;
    if (plural) { const exists = cl.find(plural, d.doc.metadata.name, ns); const verb = exists ? 'patch' : 'create'; if (!PG.kcCan(K, verb, plural, ns)) { const k = PG.KINDS[plural]; return { err: `Error: ${verbWord} failed: ${plural}${k.group ? '.' + k.group : ''} is forbidden: User "${tid.id.user}" cannot ${verb} resource "${plural}" in API group "${k.group}" ${k.ns ? 'in the namespace "' + ns + '"' : 'at the cluster scope'}`, created }; } }
    const r = PG.mkObject(c2, K, d.doc, rel.namespace, 'apply'); if (r.err) { const msg = r.err.replace(/^Error from server \([A-Za-z]+\): error when creating "helm": /, '').replace(/^error: /, ''); return { err: `Error: ${verbWord} failed: ${msg}`, created }; }
    if (r.obj && r.obj.metadata) { r.obj.metadata.annotations = { ...(r.obj.metadata.annotations || {}) }; if (!Object.keys(r.obj.metadata.annotations).length) delete r.obj.metadata.annotations; }
    created.push({ plural: r.plural, name: r.name, ns: PG.KINDS[r.plural].ns ? ns : null });
  }
  return { created };
};
PG.runHooks = async (ctx, cl, rel, hooks, event, tid) => {
  const these = hooks.filter(h => h.hooks.includes(event)).sort((a, b) => a.w - b.w);
  for (const h of these) {
    const K = { cl, id: tid.id, ns: rel.namespace }; const c2 = Object.create(ctx); c2.src = 'hook'; const d = PG.clone(h.doc);
    const pre = h.del.includes('before-hook-creation'); const plural = PG.KIND_OF[d.kind]; const ex = plural && cl.find(plural, d.metadata.name, rel.namespace);
    if (ex && pre) { cl.del(plural, ex); for (const p of cl.res.pods.filter(p => p.metadata._owner && p.metadata._owner.name === d.metadata.name)) cl.del('pods', p); }
    const r = PG.mkObject(c2, K, d, rel.namespace, 'apply'); if (r.err) return { err: `Error: ${event} hook failed: ${r.err}` };
    if (d.kind === 'Job') { const ok = await ctx.sim.waitFor(() => (r.obj.status || {}).succeeded, ctx.sh, 90); if (!ok) { return { err: `Error: ${event === 'pre-install' ? 'release ' + rel.name + ' failed: ' : 'UPGRADE FAILED: '}timed out waiting for the condition (hook Job ${d.metadata.name} did not complete)` }; } }
    if (h.del.includes('hook-succeeded') && plural) { cl.del(plural, r.obj); for (const p of cl.res.pods.filter(p => p.metadata._owner && p.metadata._owner.name === d.metadata.name)) cl.del('pods', p); }
  }
  return {};
};
PG.helmPrintStatus = (ctx, cl, rel, rev, header) => {
  ctx.println(`${header}\nLAST DEPLOYED: ${PG.helmDate(rev.t)}\nNAMESPACE: ${rel.namespace}\nSTATUS: ${rev.status}\n`);
  const tbl = PG.releaseTable(cl, rev.objs); if (tbl) ctx.println('RESOURCES:\n' + tbl + '\n'); if (rev.notes) ctx.println('NOTES:\n' + rev.notes + '\n');
};
PG.helmValuesFrom = (ctx, P, chart, base) => {
  let vals = PG.clone(base === undefined ? chart.values : base); const fl = [].concat(P.f.f || P.f.values || []);
  for (const f of fl) { const txt = ctx.fs.read(ctx.resolve(f)); if (txt === undefined) return { err: `Error: open ${f}: no such file or directory` }; let y; try { y = PG.yaml.parse(txt) || {}; } catch (e) { return { err: `Error: failed to parse ${f}: ${e.message}` }; } vals = PG.deepMerge(vals, y); }
  vals = PG.parseSet([].concat(P.f.set || [], P.f['set-string'] || []), vals);
  const user = {}; let uv = {}; for (const f of fl) { const txt = ctx.fs.read(ctx.resolve(f)); if (txt) uv = PG.deepMerge(uv, PG.yaml.parse(txt) || {}); } uv = PG.parseSet([].concat(P.f.set || [], P.f['set-string'] || []), uv);
  return { vals, user: uv };
};
const HELM_VALUE_FLAGS = ['name', 'namespace', 'set', 'set-string', 'values', 'f', 'timeout', 'service-account', 'tiller-image', 'stable-repo-url', 'output', 'o', 'x', 'execute', 'tiller-namespace', 'revision', 'kube-context', 'version', 'repo', 'description'];
PG.commands.helm2 = async (ctx, args) => {
  const sim = ctx.sim; const P = PG.kcParse(args, HELM_VALUE_FLAGS); if (P.f.values) P.f.f = [].concat(P.f.f || [], P.f.values); const sub = P.pos[0];
  if (!sub || P.has('help') || sub === 'help') { ctx.println(`The Kubernetes package manager, version 2 (simulated, ${PG.HELM_VER})
Commands:  init  version  ls  install  upgrade [--install]  delete [--purge]  status  history  rollback  get values|manifest|notes
           lint  template  test  dependency update  search  repo  
Flags:  --name NAME  --namespace NS  -f FILE  --set k=v  --wait  --timeout SECONDS  --dry-run --debug  --reuse-values  --atomic
The chart used in the guide is already in ~/myapp.  Start with:  kubectl -n kube-system create serviceaccount tiller ... then  helm2 init --service-account tiller`); return 0; }
  if (sub === 'version') { if (P.has('client') || !P.has('server')) ctx.println(P.has('short') ? `Client: ${PG.HELM_VER}+ga690bad` : `Client: &version.Version{SemVer:"${PG.HELM_VER}", GitCommit:"a690bad98af45b015bd3da1a41f6218b1a451dbe", GitTreeState:"clean"}`); if (!P.has('client')) { const K = PG.kcConnect(ctx, { f: {} }); if (!K) return 1; const t = (() => { const dep = K.cl.find('deployments', 'tiller-deploy', 'kube-system'); if (!dep) return { err: 'Error: could not find tiller' }; if (!K.cl.matchPods('kube-system', dep.spec.selector).some(p => K.cl.podReady(p))) return { err: 'Error: could not find a ready tiller pod' }; return { ver: (/:(v[\d.]+)/.exec(dep.spec.template.spec.containers[0].image) || [])[1] || PG.HELM_VER }; })(); if (t.err) { ctx.eprintln(t.err); return 1; } ctx.println(P.has('short') ? `Server: ${t.ver}+ga690bad` : `Server: &version.Version{SemVer:"${t.ver}", GitCommit:"a690bad98af45b015bd3da1a41f6218b1a451dbe", GitTreeState:"clean"}`); } return 0; }
  if (sub === 'init') {
    if (P.has('client-only')) { ctx.println('$HELM_HOME has been configured at /root/.helm.\nNot installing Tiller due to \'client-only\' flag having been set\nHappy Helming!'); return 0; }
    const K = PG.kcConnect(ctx, { f: {} }); if (!K) return 1; const cl = K.cl; const img = P.f['tiller-image'] || `gcr.io/kubernetes-helm/tiller:${PG.HELM_VER}`; const sa = P.f['service-account'] || null; const ver = (/:(v[\d.]+)/.exec(img) || [])[1] || PG.HELM_VER; const old = ver && parseInt(ver.split('.')[1]) < 16;
    const manifest = { apiVersion: old ? 'extensions/v1beta1' : 'apps/v1', kind: 'Deployment', metadata: { creationTimestamp: null, labels: { app: 'helm', name: 'tiller' }, name: 'tiller-deploy', namespace: 'kube-system' }, spec: { replicas: 1, strategy: {}, template: { metadata: { creationTimestamp: null, labels: { app: 'helm', name: 'tiller' } }, spec: { automountServiceAccountToken: true, containers: [{ env: [{ name: 'TILLER_NAMESPACE', value: 'kube-system' }], image: img, name: 'tiller', ports: [{ containerPort: 44134, name: 'tiller' }], resources: {} }], ...(sa ? { serviceAccountName: sa } : {}) } } }, status: {} };
    if (P.f.output || P.f.o) { ctx.out(PG.yaml.dump(manifest) + '---\n' + PG.yaml.dump({ apiVersion: 'v1', kind: 'Service', metadata: { labels: { app: 'helm', name: 'tiller' }, name: 'tiller-deploy', namespace: 'kube-system' }, spec: { ports: [{ name: 'tiller', port: 44134, targetPort: 'tiller' }], selector: { app: 'helm', name: 'tiller' }, type: 'ClusterIP' } })); return 0; }
    if (cl.find('deployments', 'tiller-deploy', 'kube-system')) { ctx.println('$HELM_HOME has been configured at /root/.helm.\nWarning: Tiller is already installed in the cluster.\n(Use --client-only to suppress this message, or --upgrade to upgrade Tiller to the current version.)\nHappy Helming!'); return 0; }
    if (old) { ctx.eprintln(`Error: error installing: the server could not find the requested resource (${manifest.apiVersion} Deployment is no longer served by this Kubernetes version).\nUse:  helm2 init ... --output yaml | perl -pe 's#^apiVersion: extensions/v1beta1#apiVersion: apps/v1#; …' | kubectl apply -f -`); return 1; }
    if (!PG.kcCan(K, 'create', 'deployments', 'kube-system')) return PG.kcForbid(ctx, K, 'deployments', 'create', 'tiller-deploy', 'kube-system');
    cl.deployment('kube-system', 'tiller-deploy', img, 1, { labels: { app: 'helm', name: 'tiller' }, selector: { app: 'helm', name: 'tiller' }, containerName: 'tiller', podSpec: sa ? { serviceAccountName: sa } : {} });
    cl.mk('services', 'tiller-deploy', 'kube-system', { metadata: { labels: { app: 'helm', name: 'tiller' } }, spec: { type: 'ClusterIP', clusterIP: cl.allocClusterIP(), selector: { app: 'helm', name: 'tiller' }, ports: [{ name: 'tiller', port: 44134, targetPort: 'tiller' }] }, status: {} });
    ctx.println(`$HELM_HOME has been configured at /root/.helm.\n\nTiller (the Helm server-side component) has been installed into your Kubernetes Cluster.\n\nPlease note: by default, Tiller is deployed with an insecure 'allow unauthenticated users' policy.\nTo prevent this, run \`helm init\` with the --tiller-tls-verify flag.\nFor more information on securing your installation see: https://v2.helm.sh/docs/securing_installation/\nHappy Helming!`); return 0;
  }
  // everything below needs the cluster and a ready Tiller
  if (sub === 'repo' || sub === 'search') { if (sub === 'repo') { ctx.println(P.pos[1] === 'list' ? 'NAME  \tURL\nstable\thttps://charts.helm.sh/stable' : '"stable" has been added to your repositories'); return 0; } ctx.println(PG.table([['stable/redis', '10.5.7', '5.0.7', 'DEPRECATED Open source, advanced key-value store.'], ['stable/postgresql', '8.6.4', '11.7.0', 'DEPRECATED Chart for PostgreSQL'], ['stable/mysql', '1.6.9', '5.7.30', 'DEPRECATED Fast, reliable, scalable, and easy to use open-source rel...']].filter(r => !P.pos[1] || r[0].includes(P.pos[1].replace('stable/', ''))), ['NAME', 'CHART VERSION', 'APP VERSION', 'DESCRIPTION'])); return 0; }
  if (sub === 'lint') { const chart = PG.loadChart(ctx, P.pos[1] || '.'); if (chart.err) { ctx.eprintln(chart.err); return 1; } const v = PG.helmValuesFrom(ctx, P, chart); if (v.err) { ctx.eprintln(v.err); return 1; } const r = PG.renderChart(chart, { name: 'release-name', namespace: 'default', values: v.vals, isInstall: true, revision: 1 }); ctx.println('==> Linting ' + (P.pos[1] || '.')); if (!chart.meta.icon) ctx.println('[INFO] Chart.yaml: icon is recommended'); if (r.err) { ctx.println(`[ERROR] templates/: ${r.err.replace(/^Error: /, '')}`); ctx.eprintln('\nError: 1 chart(s) linted, 1 chart(s) failed'); return 1; } const sp = PG.splitDocs(r.files); if (sp.err) { ctx.println('[ERROR] templates/: ' + sp.err.replace(/^Error: /, '')); ctx.eprintln('\nError: 1 chart(s) linted, 1 chart(s) failed'); return 1; } ctx.println('\n1 chart(s) linted, no failures'); return 0; }
  if (sub === 'template') { const chart = PG.loadChart(ctx, P.pos[1] || '.'); if (chart.err) { ctx.eprintln(chart.err); return 1; } const v = PG.helmValuesFrom(ctx, P, chart); if (v.err) { ctx.eprintln(v.err); return 1; } const r = PG.renderChart(chart, { name: P.f.name || 'RELEASE-NAME', namespace: P.f.namespace || 'default', values: v.vals, isInstall: true, revision: 1 }); if (r.err) { ctx.eprintln(r.err); return 1; } const only = [].concat(P.f.x || P.f.execute || []); const sel = r.files.filter(f => !only.length || only.some(o => f.file.endsWith(o.replace(/^templates\//, 'templates/')) || f.name === o.replace(/^templates\//, ''))); if (only.length && !sel.length) { ctx.eprintln(`Error: could not find template ${only[0]} in chart`); return 1; } ctx.out(sel.map(f => `---\n# Source: ${f.file}\n${f.text.replace(/^\n+/, '').trimEnd()}\n`).join('')); return 0; }
  if (sub === 'dependency' || sub === 'dep') { const dir = ctx.resolve(P.pos[2] || '.'); const req = ctx.fs.read(dir + '/requirements.yaml'); ctx.println('Hang tight while we grab the latest from your chart repositories...\n...Successfully got an update from the "stable" chart repository\nUpdate Complete.'); if (req === undefined) { ctx.println('(no requirements.yaml found — nothing to download)'); return 0; } ctx.fs.mkdirp(dir + '/charts'); ctx.println('Saving 1 charts\nDeleting outdated charts\n(simulated: dependency subcharts are not rendered by this playground)'); return 0; }
  const K = PG.kcConnect(ctx, { f: {} }); if (!K) return 1; const cl = K.cl;
  const tid = PG.tillerInfo(cl); if (tid.err) { ctx.eprintln(tid.err); return 1; }
  const rels = cl.helm.releases;
  const live = name => rels[name];
  if (sub === 'ls' || sub === 'list') { const all = P.has('all'); const rows = Object.values(rels).filter(r => (all || r.revs[r.revs.length - 1].status === 'DEPLOYED') && (!P.f.namespace || r.namespace === P.f.namespace) && (!P.pos[1] || r.name.includes(P.pos[1]))).map(r => { const v = r.revs[r.revs.length - 1]; return [r.name, String(v.rev), PG.helmDate(v.t), v.status, `${v.chart}-${v.version}`, v.appVersion || '', r.namespace]; }); if (rows.length) ctx.println(PG.table(rows, ['NAME', 'REVISION', 'UPDATED', 'STATUS', 'CHART', 'APP VERSION', 'NAMESPACE'])); return 0; }
  if (sub === 'install' || sub === 'upgrade') {
    const up = sub === 'upgrade'; let name, chartPath; if (up) { name = P.pos[1]; chartPath = P.pos[2]; } else { chartPath = P.pos[1]; name = P.f.name; }
    if (!chartPath) { ctx.eprintln(`Error: This command needs ${up ? 2 : 1} argument${up ? 's: release name, chart path' : ': chart name'}`); return 1; }
    const chart = PG.loadChart(ctx, chartPath); if (chart.err) { ctx.eprintln(chart.err); return 1; }
    if (!name) name = ['wise-ferret', 'cold-lynx', 'quiet-otter'][Math.floor(Math.random() * 3)];
    const ns = P.f.namespace || 'default'; const existing = live(name);
    const fresh = !existing || (!up && false);
    if (!up && existing) { ctx.eprintln(`Error: a release named ${name} already exists.\nRun: helm ls --all ${name}; to check the status of the release\nOr run: helm del --purge ${name}; to delete it`); return 1; }
    if (up && !existing && !P.has('install')) { ctx.eprintln(`Error: "${name}" has no deployed releases`); return 1; }
    if (up && existing && existing.revs[existing.revs.length - 1].status === 'FAILED' && existing.revs.length === 1 && !P.has('install')) { ctx.eprintln(`Error: "${name}" has no deployed releases`); return 1; }
    const isInstall = !existing; const prev = existing ? existing.revs[existing.revs.length - 1] : null;
    const baseVals = up && P.has('reuse-values') && prev ? prev.values : undefined; const v = PG.helmValuesFrom(ctx, P, chart, baseVals); if (v.err) { ctx.eprintln(v.err); return 1; }
    const userVals = up && P.has('reuse-values') && prev ? PG.deepMerge(prev.userValues, v.user) : v.user;
    const rev = existing ? prev.rev + 1 : 1; const rendered = PG.renderChart(chart, { name, namespace: ns, values: v.vals, isInstall, revision: rev }); if (rendered.err) { ctx.eprintln(rendered.err); return 1; }
    const sp = PG.splitDocs(rendered.files); if (sp.err) { ctx.eprintln(sp.err); return 1; }
    const hooks = sp.docs.filter(d => d.hooks.length); const body = sp.docs.filter(d => !d.hooks.length);
    if (P.has('dry-run')) { ctx.println(`${P.has('debug') ? '[debug] Created tunnel using local port: \'' + (40000 + Math.floor(Math.random() * 999)) + '\'\n' : ''}NAME:   ${name}\nREVISION: ${rev}\nRELEASED: ${PG.helmDate(ctx.sim.clock)}\nCHART: ${chart.meta.name}-${chart.meta.version}\nUSER-SUPPLIED VALUES:\n${PG.yaml.dump(userVals).trim()}\n\nCOMPUTED VALUES:\n${PG.yaml.dump(v.vals).trim()}\n\nHOOKS:\n${PG.manifestText(hooks)}\nMANIFEST:\n${PG.manifestText(body)}`); return 0; }
    // tiller applies
    if (!cl.find('namespaces', ns)) { ctx.eprintln(`Error: ${up ? 'UPGRADE FAILED' : 'release ' + name + ' failed'}: namespaces "${ns}" not found`); return 1; }
    const verbWord = up ? 'UPGRADE FAILED' : `release ${name}`; const record = existing || { name, namespace: ns, revs: [] }; if (!existing) rels[name] = record;
    const newRev = { rev, status: 'PENDING_INSTALL', t: ctx.sim.clock, chart: chart.meta.name, version: chart.meta.version, appVersion: chart.meta.appVersion, userValues: v.user === undefined ? {} : userVals, values: v.vals, manifest: PG.manifestText(body), docs: body, hooks, notes: rendered.notes, objs: [], description: isInstall ? 'Install complete' : 'Upgrade complete' };
    const h1 = await PG.runHooks(ctx, cl, record, hooks, isInstall ? 'pre-install' : 'pre-upgrade', tid); if (h1.err) { if (isInstall) delete rels[name]; ctx.eprintln(h1.err); return 1; }
    const res = await PG.helmApply(ctx, cl, record, body, tid, verbWord);
    newRev.objs = res.created;
    if (res.err) { newRev.status = 'FAILED'; newRev.description = res.err.replace(/^Error: /, ''); record.revs.push(newRev); PG.helmRecord(cl, record, newRev); ctx.eprintln(res.err); return 1; }
    // prune objects that were in the old revision but not in the new one
    if (prev) { for (const o of prev.objs) if (!newRev.objs.some(n => n.plural === o.plural && n.name === o.name && n.ns === o.ns)) { const ob = cl.find(o.plural, o.name, o.ns); if (ob) cl.del(o.plural, ob); } PG.helmSetStatus(cl, record, prev, 'SUPERSEDED'); }
    newRev.status = 'DEPLOYED'; record.revs.push(newRev); PG.helmRecord(cl, record, newRev); cl.tick(0);
    const h2 = await PG.runHooks(ctx, cl, record, hooks, isInstall ? 'post-install' : 'post-upgrade', tid);
    if (P.has('wait') || P.has('atomic')) { const tmo = Number(P.f.timeout || 300); const ok = await ctx.sim.waitFor(() => newRev.objs.filter(o => o.plural === 'deployments').every(o => { const d = cl.find('deployments', o.name, o.ns); return d && (d.status._updatedReady || 0) >= (d.spec.replicas === undefined ? 1 : d.spec.replicas) && (d.status.replicas || 0) <= (d.spec.replicas === undefined ? 1 : d.spec.replicas); }), ctx.sh, tmo);
      if (!ok) { if (P.has('atomic') && prev) { /* roll back */ for (const o of newRev.objs) { } newRev.status = 'FAILED'; PG.helmSetStatus(cl, record, newRev, 'FAILED'); ctx.eprintln(`Error: ${up ? 'UPGRADE FAILED' : 'release ' + name + ' failed'}: timed out waiting for the condition\n(--atomic: rolling back is simulated by: helm2 rollback ${name} ${prev.rev})`); return 1; } newRev.status = 'FAILED'; PG.helmSetStatus(cl, record, newRev, 'FAILED'); ctx.eprintln(`Error: ${up ? 'UPGRADE FAILED' : 'release ' + name + ' failed'}: timed out waiting for the condition`); return 1; } }
    PG.helmPrintStatus(ctx, cl, record, newRev, up ? `Release "${name}" has been upgraded. Happy Helming!` : `NAME:   ${name}`); return 0;
  }
  const rel = name => { const r = rels[name]; if (!r) ctx.eprintln(`Error: release: "${name}" not found`); return r; };
  if (sub === 'status') { const r = rel(P.pos[1]); if (!r) return 1; PG.helmPrintStatus(ctx, cl, r, r.revs[r.revs.length - 1], ''); return 0; }
  if (sub === 'history') { const r = rel(P.pos[1]); if (!r) return 1; ctx.println(PG.table(r.revs.map(v => [String(v.rev), PG.helmDate(v.t), v.status, `${v.chart}-${v.version}`, v.description]), ['REVISION', 'UPDATED', 'STATUS', 'CHART', 'DESCRIPTION'])); return 0; }
  if (sub === 'get') { const kind = ['values', 'manifest', 'notes', 'hooks'].includes(P.pos[1]) ? P.pos[1] : null; const nm = kind ? P.pos[2] : P.pos[1]; const r = rel(nm); if (!r) return 1; const v = P.f.revision ? r.revs.find(x => x.rev === Number(P.f.revision)) : r.revs[r.revs.length - 1]; if (!v) { ctx.eprintln(`Error: release: "${nm}" not found`); return 1; }
    if (kind === 'values') { ctx.out(PG.yaml.dump(P.has('all') ? v.values : v.userValues)); return 0; } if (kind === 'manifest') { ctx.println(v.manifest); return 0; } if (kind === 'notes') { ctx.println(v.notes || ''); return 0; } if (kind === 'hooks') { ctx.println(PG.manifestText(v.hooks)); return 0; }
    ctx.println(`REVISION: ${v.rev}\nRELEASED: ${PG.helmDate(v.t)}\nCHART: ${v.chart}-${v.version}\nUSER-SUPPLIED VALUES:\n${PG.yaml.dump(v.userValues).trim()}\n\nCOMPUTED VALUES:\n${PG.yaml.dump(v.values).trim()}\n\nHOOKS:\nMANIFEST:\n${v.manifest}`); return 0; }
  if (sub === 'delete' || sub === 'del' || sub === 'uninstall') {
    const r = rel(P.pos[1]); if (!r) return 1; const cur = r.revs[r.revs.length - 1]; if (cur.status === 'DELETED' && !P.has('purge')) { ctx.eprintln(`Error: release: "${r.name}" not found`); return 1; }
    for (const rv of r.revs) for (const o of rv.objs) { const ob = cl.find(o.plural, o.name, o.ns); if (ob) { if (o.plural === 'pods') cl.killPod(ob); else cl.del(o.plural, ob); } }
    if (P.has('purge')) { delete rels[r.name]; for (const cm of cl.res.configmaps.filter(c => c.metadata.namespace === 'kube-system' && c.metadata.labels && c.metadata.labels.NAME === r.name && c.metadata.labels.OWNER === 'TILLER')) cl.del('configmaps', cm); } else { PG.helmSetStatus(cl, r, cur, 'DELETED'); }
    cl.tick(0); ctx.println(`release "${r.name}" deleted`); return 0;
  }
  if (sub === 'rollback') { const r = rel(P.pos[1]); if (!r) return 1; const target = r.revs.find(v => v.rev === Number(P.pos[2])); if (!target) { ctx.eprintln(`Error: release has no ${P.pos[2]} version`); return 1; } const cur = r.revs[r.revs.length - 1];
    const res = await PG.helmApply(ctx, cl, r, target.docs, tid, 'ROLLBACK'); if (res.err) { ctx.eprintln(res.err.replace('ROLLBACK failed', 'ROLLBACK FAILED')); return 1; }
    for (const o of cur.objs) if (!res.created.some(n => n.plural === o.plural && n.name === o.name && n.ns === o.ns)) { const ob = cl.find(o.plural, o.name, o.ns); if (ob) cl.del(o.plural, ob); }
    PG.helmSetStatus(cl, r, cur, 'SUPERSEDED'); const nv = { ...target, rev: cur.rev + 1, t: ctx.sim.clock, status: 'DEPLOYED', objs: res.created, description: `Rollback to ${target.rev}` }; r.revs.push(nv); PG.helmRecord(cl, r, nv); ctx.println('Rollback was a success! Happy Helming!'); return 0; }
  if (sub === 'test') { const r = rel(P.pos[1]); if (!r) return 1; const v = r.revs[r.revs.length - 1]; const tests = v.hooks.filter(h => h.hooks.includes('test-success') || h.hooks.includes('test-failure')); if (!tests.length) { ctx.eprintln(`Error: no tests found in release ${r.name}`); return 1; } let bad = false;
    for (const h of tests) { const K2 = { cl, id: tid.id, ns: r.namespace }; const c2 = Object.create(ctx); c2.src = 'test'; const name = h.doc.metadata.name; const ex = cl.find('pods', name, r.namespace); if (ex) cl.del('pods', ex); const mk = PG.mkObject(c2, K2, h.doc, r.namespace, 'apply'); if (mk.err) { ctx.eprintln(mk.err); return 1; } ctx.println(`RUNNING: ${name}`); const pod = mk.obj; const ok = await ctx.sim.waitFor(() => ['Running', 'Completed', 'Error'].includes(cl.podStatus(pod)) || (['ErrImagePull', 'ImagePullBackOff'].includes(cl.podStatus(pod)) && ctx.sim.clock - pod._sim.t0 > 14), ctx.sh, 60);
      let passed = false; if (ok && ['Running', 'Completed'].includes(cl.podStatus(pod))) { const c = pod.spec.containers[0]; const argv = [...(c.command || []), ...(c.args || [])]; const res2 = await PG.execInPod(ctx, cl, pod, argv); passed = !res2.err && !res2.code; } if (!passed) bad = true; ctx.println(`${passed ? 'PASSED' : 'FAILED'}: ${name}`); cl.del('pods', pod); }
    return bad ? 1 : 0; }
  ctx.eprintln(`Error: unknown command "${sub}" for "helm" (simulated: init version ls install upgrade delete status history rollback get lint template test dependency)`); return 1;
};
PG.commands.helm = async (ctx, args) => { ctx.eprintln('helm: this machine has Helm 4 (no Tiller). The guide uses Helm 2 — run:  helm2 …'); return 1; };
PG.commands.perl = async (ctx, args) => { const i = args.indexOf('-pe'); const script = i >= 0 ? args[i + 1] : null; if (!script) { ctx.eprintln('perl: only "perl -pe \'s#a#b#; …\'" is simulated'); return 1; } const subs = []; const re = /s(.)(.*?)\1(.*?)\1([gi]*)(?:;|$)/g; let m; while ((m = re.exec(script.trim()))) subs.push({ pat: m[2], rep: m[3], fl: m[4] }); const lines = (ctx.stdin || '').split('\n'); const out = lines.map(l => { for (const s of subs) { const r = new RegExp(s.pat, s.fl.replace(/[^gi]/g, '')); l = l.replace(r, s.rep.replace(/\\n/g, '\n').replace(/\$(\d)/g, '$$$1')); } return l; }); ctx.out(out.join('\n')); };
if (typeof module !== 'undefined') module.exports = PG;
