/* ===================== helm 2, part 2: create, package, repo charts, dependencies/subcharts ===================== */
const HELPERS = name => `{{- define "${name}.fullname" -}}
{{- printf "%s-%s" .Release.Name "${name}" | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- define "${name}.labels" -}}
app: ${name}
release: {{ .Release.Name }}
chart: {{ .Chart.Name }}-{{ .Chart.Version }}
heritage: {{ .Release.Service }}
{{- end -}}
`;
PG.REPO = {
  redis: { version: '10.5.7', appVersion: '5.0.7', description: 'DEPRECATED Open source, advanced key-value store.', files: name => ({
    'Chart.yaml': `apiVersion: v1\nname: redis\nversion: 10.5.7\nappVersion: "5.0.7"\ndescription: Open source, advanced key-value store.\n`,
    'values.yaml': `image:\n  repository: redis\n  tag: 7-alpine\n  pullPolicy: IfNotPresent\nusePassword: false\npassword: ""\nmaster:\n  port: 6379\npersistence:\n  enabled: false\n  size: 8Gi\nresources: {}\n`,
    'templates/_helpers.tpl': HELPERS('redis'),
    'templates/secret.yaml': `{{- if .Values.usePassword }}\napiVersion: v1\nkind: Secret\nmetadata:\n  name: {{ include "redis.fullname" . }}\n  labels:\n{{ include "redis.labels" . | indent 4 }}\ntype: Opaque\nstringData:\n  redis-password: {{ default "changeme" .Values.password | quote }}\n{{- end }}\n`,
    'templates/deployment.yaml': `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: {{ include "redis.fullname" . }}-master\n  labels:\n{{ include "redis.labels" . | indent 4 }}\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: redis\n      release: {{ .Release.Name }}\n  template:\n    metadata:\n      labels:\n        app: redis\n        release: {{ .Release.Name }}\n    spec:\n      containers:\n        - name: redis\n          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"\n          imagePullPolicy: {{ .Values.image.pullPolicy }}\n          {{- if .Values.usePassword }}\n          env:\n            - name: REDIS_PASSWORD\n              valueFrom:\n                secretKeyRef:\n                  name: {{ include "redis.fullname" . }}\n                  key: redis-password\n          {{- end }}\n          ports:\n            - name: redis\n              containerPort: {{ .Values.master.port }}\n          readinessProbe:\n            tcpSocket:\n              port: redis\n            periodSeconds: 5\n          resources:\n{{ toYaml .Values.resources | indent 12 }}\n`,
    'templates/service.yaml': `apiVersion: v1\nkind: Service\nmetadata:\n  name: {{ include "redis.fullname" . }}-master\n  labels:\n{{ include "redis.labels" . | indent 4 }}\nspec:\n  type: ClusterIP\n  ports:\n    - name: redis\n      port: {{ .Values.master.port }}\n      targetPort: redis\n  selector:\n    app: redis\n    release: {{ .Release.Name }}\n`,
    'templates/NOTES.txt': `Redis can be accessed via port {{ .Values.master.port }} on the following DNS name from within your cluster:\n\n{{ include "redis.fullname" . }}-master.{{ .Release.Namespace }}.svc.cluster.local\n`,
  }) },
  postgresql: { version: '8.6.4', appVersion: '11.7.0', description: 'DEPRECATED Chart for PostgreSQL, an object-relational database management system.', files: () => ({
    'Chart.yaml': `apiVersion: v1\nname: postgresql\nversion: 8.6.4\nappVersion: "11.7.0"\ndescription: Chart for PostgreSQL\n`,
    'values.yaml': `image:\n  repository: postgres\n  tag: 16-alpine\npostgresqlPassword: ""\npostgresqlDatabase: postgres\nservice:\n  port: 5432\nresources: {}\n`,
    'templates/_helpers.tpl': HELPERS('postgresql'),
    'templates/secret.yaml': `apiVersion: v1\nkind: Secret\nmetadata:\n  name: {{ include "postgresql.fullname" . }}\n  labels:\n{{ include "postgresql.labels" . | indent 4 }}\ntype: Opaque\nstringData:\n  postgresql-password: {{ default "changeme" .Values.postgresqlPassword | quote }}\n`,
    'templates/deployment.yaml': `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: {{ include "postgresql.fullname" . }}\n  labels:\n{{ include "postgresql.labels" . | indent 4 }}\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: postgresql\n      release: {{ .Release.Name }}\n  template:\n    metadata:\n      labels:\n        app: postgresql\n        release: {{ .Release.Name }}\n    spec:\n      containers:\n        - name: postgresql\n          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"\n          env:\n            - name: POSTGRES_DB\n              value: {{ .Values.postgresqlDatabase | quote }}\n            - name: POSTGRES_PASSWORD\n              valueFrom:\n                secretKeyRef:\n                  name: {{ include "postgresql.fullname" . }}\n                  key: postgresql-password\n          ports:\n            - name: postgresql\n              containerPort: 5432\n          readinessProbe:\n            exec:\n              command: ["pg_isready", "-U", "postgres"]\n            periodSeconds: 5\n`,
    'templates/service.yaml': `apiVersion: v1\nkind: Service\nmetadata:\n  name: {{ include "postgresql.fullname" . }}\n  labels:\n{{ include "postgresql.labels" . | indent 4 }}\nspec:\n  type: ClusterIP\n  ports:\n    - name: postgresql\n      port: {{ .Values.service.port }}\n      targetPort: postgresql\n  selector:\n    app: postgresql\n    release: {{ .Release.Name }}\n`,
    'templates/NOTES.txt': `PostgreSQL can be accessed via port {{ .Values.service.port }} on:\n\n{{ include "postgresql.fullname" . }}.{{ .Release.Namespace }}.svc.cluster.local\n\nPassword: kubectl get secret {{ include "postgresql.fullname" . }} -n {{ .Release.Namespace }} -o jsonpath='{.data.postgresql-password}' | base64 -d\n`,
  }) },
  mysql: { version: '1.6.9', appVersion: '5.7.30', description: 'DEPRECATED Fast, reliable, scalable, and easy to use open-source relational database system.', files: () => ({
    'Chart.yaml': `apiVersion: v1\nname: mysql\nversion: 1.6.9\nappVersion: "5.7.30"\ndescription: MySQL\n`,
    'values.yaml': `image:\n  repository: mysql\n  tag: "8"\nmysqlRootPassword: ""\nservice:\n  port: 3306\n`,
    'templates/_helpers.tpl': HELPERS('mysql'),
    'templates/secret.yaml': `apiVersion: v1\nkind: Secret\nmetadata:\n  name: {{ include "mysql.fullname" . }}\ntype: Opaque\nstringData:\n  mysql-root-password: {{ default "changeme" .Values.mysqlRootPassword | quote }}\n`,
    'templates/deployment.yaml': `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: {{ include "mysql.fullname" . }}\n  labels:\n{{ include "mysql.labels" . | indent 4 }}\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: mysql\n      release: {{ .Release.Name }}\n  template:\n    metadata:\n      labels:\n        app: mysql\n        release: {{ .Release.Name }}\n    spec:\n      containers:\n        - name: mysql\n          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"\n          env:\n            - name: MYSQL_ROOT_PASSWORD\n              valueFrom:\n                secretKeyRef:\n                  name: {{ include "mysql.fullname" . }}\n                  key: mysql-root-password\n          ports:\n            - name: mysql\n              containerPort: 3306\n          readinessProbe:\n            tcpSocket:\n              port: mysql\n            periodSeconds: 5\n`,
    'templates/service.yaml': `apiVersion: v1\nkind: Service\nmetadata:\n  name: {{ include "mysql.fullname" . }}\nspec:\n  ports:\n    - name: mysql\n      port: {{ .Values.service.port }}\n      targetPort: mysql\n  selector:\n    app: mysql\n    release: {{ .Release.Name }}\n`,
  }) },
  nginx: { version: '5.1.1', appVersion: '1.27', description: 'Web server (a copy of the guide chart, renamed).', files: () => { const out = {}; for (const [p, c] of Object.entries(PG.CHART_FILES || {})) { if (!p.startsWith('myapp/')) continue; out[p.slice(6)] = c.replace(/myapp/g, 'nginx'); } return out; } },
};
PG.repoChart = (name, version) => { const r = PG.REPO[name.replace(/^stable\//, '')]; if (!r) return null; const files = r.files(name); if (files['Chart.yaml'] && version) files['Chart.yaml'] = files['Chart.yaml'].replace(/^version: .*/m, 'version: ' + version); return { files, version: version || r.version }; };
PG.chartFromFiles = files => { const fs = new PG.FS(); for (const [rel, c] of Object.entries(files)) fs.write('/c/' + rel, c); return { fs, dir: '/c' }; };
// load a chart (and its charts/ subcharts) from any PG.FS
PG.loadChartFromFs = (fs, dir, label) => {
  const cy = fs.read(dir + '/Chart.yaml'); if (cy === undefined) return { err: `Error: no Chart.yaml exists in directory "${label || dir}"` };
  let meta; try { meta = PG.yaml.parse(cy); } catch (e) { return { err: 'Error: Chart.yaml: ' + e.message }; }
  if (!meta || !meta.name) return { err: 'Error: validation: chart.metadata.name is required' }; if (!meta.version) return { err: 'Error: validation: chart.metadata.version is required' };
  if (meta.apiVersion === 'v2') return { err: 'Error: apiVersion "v2" is not valid. The value must be "v1"' };
  let values = {}; const vy = fs.read(dir + '/values.yaml'); if (vy !== undefined) { try { values = PG.yaml.parse(vy) || {}; } catch (e) { return { err: 'Error: values.yaml: ' + e.message }; } }
  const tdir = dir + '/templates'; const templates = {}; if (fs.isDir(tdir)) { const walk = (d, rel) => { for (const n of fs.list(d)) { const p = d + '/' + n; if (fs.isDir(p)) walk(p, rel + n + '/'); else templates[rel + n] = fs.read(p); } }; walk(tdir, ''); }
  const subcharts = []; const reqTxt = fs.read(dir + '/requirements.yaml'); let reqs = []; if (reqTxt) { try { reqs = (PG.yaml.parse(reqTxt) || {}).dependencies || []; } catch (e) { } }
  if (fs.isDir(dir + '/charts')) for (const n of fs.list(dir + '/charts')) { const p = dir + '/charts/' + n; let sub = null; if (fs.isDir(p)) sub = PG.loadChartFromFs(fs, p, p); else if (n.endsWith('.tgz')) { try { const pk = JSON.parse((fs.read(p) || '').replace(/^PG-HELM-TGZ\n/, '')); const t = PG.chartFromFiles(pk.files); sub = PG.loadChartFromFs(t.fs, t.dir); } catch (e) { sub = null; } } if (sub && !sub.err) { const rq = reqs.find(r => r.name === sub.meta.name) || {}; sub.condition = rq.condition; sub.alias = rq.alias; subcharts.push(sub); } }
  return { dir, meta, values, templates, subcharts, reqs, fsRead: p => fs.read(dir + '/' + p) };
};
PG.loadChart = (ctx, path) => {
  if (/^stable\//.test(path) && !ctx.fs.isDir(ctx.resolve(path))) { const [nm, ver] = [path.replace(/^stable\//, ''), ctx.chartVersion]; const rc = PG.repoChart(nm, ver); if (!rc) return { err: `Error: chart "${nm}" matching ${ver || ''} not found in stable index. (try 'helm repo update'). no chart name found` }; const t = PG.chartFromFiles(rc.files); return PG.loadChartFromFs(t.fs, t.dir, path); }
  const dir = ctx.resolve(path);
  if (path.endsWith('.tgz') && ctx.fs.read(dir) !== undefined) { try { const pk = JSON.parse(ctx.fs.read(dir).replace(/^PG-HELM-TGZ\n/, '')); const t = PG.chartFromFiles(pk.files); return PG.loadChartFromFs(t.fs, t.dir, path); } catch (e) { return { err: `Error: file "${path}" does not appear to be a gzipped archive; got 'application/octet-stream'` }; } }
  if (!ctx.fs.isDir(dir)) return { err: `Error: path "${path}" not found` };
  return PG.loadChartFromFs(ctx.fs, dir, dir);
};
// render a chart and its subcharts
const renderOwn = PG.renderChart;
PG.renderChart = (chart, rel) => {
  const own = renderOwn(chart, rel); if (own.err || !(chart.subcharts || []).length) return own;
  const files = [...own.files];
  for (const sub of chart.subcharts) {
    const key = sub.alias || sub.meta.name; if (sub.condition) { const v = String(sub.condition).split(',')[0].trim().split('.').reduce((a, k) => a === undefined || a === null ? undefined : a[k], rel.values); if (v === false || v === 'false') continue; }
    const subVals = PG.deepMerge(sub.values, (rel.values && rel.values[key]) || {}); if (rel.values && rel.values.global) subVals.global = rel.values.global;
    const r = renderOwn(sub, { ...rel, values: subVals }); if (r.err) return r;
    for (const f of r.files) files.push({ ...f, file: `${chart.meta.name}/charts/${f.file}`, name: `charts/${sub.meta.name}/templates/${f.name}` });
  }
  return { ...own, files };
};
/* ---- subcommands: create / package / fetch / inspect / search / repo / dependency ---- */
const helmBase = PG.commands.helm2;
PG.commands.helm2 = async (ctx, args) => {
  const P = PG.kcParse(args, ['name', 'namespace', 'set', 'set-string', 'values', 'f', 'timeout', 'service-account', 'tiller-image', 'stable-repo-url', 'output', 'o', 'x', 'execute', 'tiller-namespace', 'revision', 'kube-context', 'version', 'repo', 'description', 'destination', 'd', 'untardir']); const sub = P.pos[0]; const sim = ctx.sim; sim.helmRepos = sim.helmRepos || [{ name: 'stable', url: 'https://charts.helm.sh/stable' }];
  if (sub === 'install' || sub === 'upgrade' || sub === 'template' || sub === 'lint') ctx.chartVersion = P.f.version;
  if (sub === 'create') {
    const name = P.pos[1]; if (!name) { ctx.eprintln('Error: the name of the new chart is required'); return 1; } const dir = ctx.resolve(name); if (ctx.fs.exists(dir)) { ctx.eprintln(`Error: file ${dir} already exists and is not a directory`); return 1; }
    for (const [p, c] of Object.entries(PG.CHART_FILES || {})) if (p.startsWith('myapp/')) ctx.fs.write(dir + '/' + p.slice(6), c.replace(/myapp/g, name)); ctx.fs.mkdirp(dir + '/charts'); ctx.println(`Creating ${name}`); return 0; }
  if (sub === 'package') { const chart = PG.loadChart(ctx, P.pos[1] || '.'); if (chart.err) { ctx.eprintln(chart.err); return 1; } const files = {}; const dir = chart.dir; for (const f of Object.keys(ctx.fs.files)) if (f.startsWith(dir + '/')) files[f.slice(dir.length + 1)] = ctx.fs.files[f]; const dest = P.f.destination || P.f.d ? ctx.resolve(P.f.destination || P.f.d) : ctx.cwd; const out = `${dest}/${chart.meta.name}-${chart.meta.version}.tgz`; ctx.fs.write(out, 'PG-HELM-TGZ\n' + JSON.stringify({ files })); ctx.println(`Successfully packaged chart and saved it to: ${out}`); return 0; }
  if (sub === 'fetch' || sub === 'pull') { const nm = (P.pos[1] || '').replace(/^stable\//, ''); const rc = PG.repoChart(nm, P.f.version); if (!rc) { ctx.eprintln(`Error: chart "${nm}" matching ${P.f.version || ''} not found in stable index. (try 'helm repo update'). no chart name found`); return 1; } const base = ctx.cwd; if (P.has('untar')) { for (const [p, c] of Object.entries(rc.files)) ctx.fs.write(`${P.f.untardir ? ctx.resolve(P.f.untardir) : base}/${nm}/${p}`, c); } else ctx.fs.write(`${base}/${nm}-${rc.version}.tgz`, 'PG-HELM-TGZ\n' + JSON.stringify({ files: rc.files })); return 0; }
  if (sub === 'inspect') { const what = P.pos[1]; const target = P.pos[2] || P.pos[1]; const nm = (what === 'values' || what === 'chart' || what === 'readme' ? target : P.pos[1]) || ''; const chart = PG.loadChart(ctx, nm); if (chart.err) { ctx.eprintln(chart.err); return 1; } if (what === 'chart') ctx.out(PG.yaml.dump(chart.meta)); else { ctx.out(chart.fsRead('values.yaml') || ''); } return 0; }
  if (sub === 'search') { const term = (P.pos[1] || '').replace(/^stable\//, ''); const rows = []; for (const [n, r] of Object.entries(PG.REPO)) { if (term && !n.includes(term)) continue; const vers = P.has('l') || P.has('versions') ? [r.version, ...['-1', '-2'].map((d, i) => r.version.replace(/\d+$/, x => String(Math.max(0, Number(x) + Number(d)))))] : [r.version]; for (const v of vers) rows.push([`stable/${n}`, v, r.appVersion, r.description]); } ctx.println(PG.table(rows, ['NAME', 'CHART VERSION', 'APP VERSION', 'DESCRIPTION'])); return 0; }
  if (sub === 'repo') { const s2 = P.pos[1]; if (s2 === 'list') { ctx.println(PG.table(sim.helmRepos.map(r => [r.name, r.url]), ['NAME', 'URL'])); return 0; } if (s2 === 'add') { sim.helmRepos = sim.helmRepos.filter(r => r.name !== P.pos[2]); sim.helmRepos.push({ name: P.pos[2], url: P.pos[3] }); ctx.println(`"${P.pos[2]}" has been added to your repositories`); return 0; } if (s2 === 'update') { ctx.println('Hang tight while we grab the latest from your chart repositories...\n...Skip local chart repository\n...Successfully got an update from the "stable" chart repository\nUpdate Complete.'); return 0; } if (s2 === 'remove') { sim.helmRepos = sim.helmRepos.filter(r => r.name !== P.pos[2]); ctx.println(`"${P.pos[2]}" has been removed from your repositories`); return 0; } ctx.eprintln('Error: helm repo: list | add NAME URL | update | remove NAME'); return 1; }
  if (sub === 'dependency' || sub === 'dep') {
    const s2 = P.pos[1]; const dir = ctx.resolve(P.pos[2] || '.'); const req = ctx.fs.read(dir + '/requirements.yaml'); if (s2 === 'list') { if (req === undefined) { ctx.eprintln(`WARNING: no requirements at ${dir}/charts`); return 0; } const deps = (PG.yaml.parse(req) || {}).dependencies || []; ctx.println(PG.table(deps.map(d => [d.name, d.version, d.repository, ctx.fs.isDir(dir + '/charts/' + d.name) ? 'ok' : 'missing']), ['NAME', 'VERSION', 'REPOSITORY', 'STATUS'])); return 0; }
    if (s2 !== 'update' && s2 !== 'build') { ctx.eprintln('Error: helm dependency: update | build | list CHART'); return 1; }
    ctx.println('Hang tight while we grab the latest from your chart repositories...\n...Successfully got an update from the "stable" chart repository\nUpdate Complete.'); if (req === undefined) { ctx.eprintln(`Error: no requirements.yaml file exists in ${dir}`); return 1; }
    const deps = (PG.yaml.parse(req) || {}).dependencies || []; ctx.println(`Saving ${deps.length} charts`); const lock = []; for (const d of deps) { const rc = PG.repoChart(d.name); if (!rc) { ctx.eprintln(`Error: can't get a valid version for repositories ${d.name}. Try changing the version constraint in requirements.yaml`); return 1; } ctx.println(`Downloading ${d.name} from repo ${d.repository}`); for (const [p, c] of Object.entries(rc.files)) ctx.fs.write(`${dir}/charts/${d.name}/${p}`, c); lock.push({ name: d.name, repository: d.repository, version: rc.version }); }
    ctx.fs.write(dir + '/requirements.lock', PG.yaml.dump({ dependencies: lock, digest: 'sha256:' + PG.hash('deps', 64), generated: PG.iso(ctx.sim.clock) })); ctx.println('Deleting outdated charts'); return 0; }
  return helmBase(ctx, args);
};
if (typeof module !== 'undefined') module.exports = PG;
