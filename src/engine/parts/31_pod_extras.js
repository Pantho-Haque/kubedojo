/* ============ pod lifecycle, part 2: init containers, many containers, probes, OOMKilled ============ */
PG.memMi = q => { if (q === undefined || q === null) return null; const m = /^([\d.]+)\s*(Ki|Mi|Gi|K|M|G|k)?$/.exec(String(q)); if (!m) return null; const n = parseFloat(m[1]); const u = m[2] || ''; return (u === 'Ki' || u === 'K' || u === 'k') ? n / 1024 : (u === 'Gi' || u === 'G') ? n * 1024 : (u === 'Mi' || u === 'M') ? n : n / 1048576; };
PG.BASE_MEM = { nginx: 8, httpd: 12, caddy: 20, redis: 10, memcached: 6, postgres: 90, mysql: 380, mongo: 220, rabbitmq: 120, node: 60, python: 30, registry: 20, 'grafana/grafana': 110, 'prom/prometheus': 150, traefik: 40, busybox: 1, alpine: 1, ubuntu: 2 };
PG.baseMemOf = (image, info) => { const repo = info.baseName || PG.parseImage(image).repo; return PG.BASE_MEM[repo] !== undefined ? PG.BASE_MEM[repo] : (info.type === 'tool' ? 2 : 25); };
PG.webRootDir = info => { const f = PG.WEBROOT[info.baseName]; return f ? f.slice(0, f.lastIndexOf('/')) : null; };
// which status string wins when a pod has several containers
PG.cpuM = q => { if (q === undefined || q === null) return 0; const m = /^([\d.]+)(m)?$/.exec(String(q)); return m ? parseFloat(m[1]) * (m[2] ? 1 : 1000) : 0; };
PG.podRequests = spec => { let cpu = 0, mem = 0; for (const c of spec.containers || []) { const r = (c.resources || {}).requests || {}; cpu += PG.cpuM(r.cpu); mem += PG.memMi(r.memory) || 0; } return { cpu, mem }; };
PG.STATUS_RANK = { CrashLoopBackOff: 6, OOMKilled: 5, Error: 4, CreateContainerConfigError: 4, ContainerCreating: 2, Completed: 1, Running: 0 };

Object.assign(PG.Cluster.prototype, {
  podContainerSet(p) { return [...(p.spec.initContainers || []).map(c => ({ c, init: true })), ...p.spec.containers.map(c => ({ c, init: false }))]; },
  /* ---- what answers when a probe knocks? ---- */
  webStatus(p, c, info, path) {
    const root = PG.webRootDir(info);
    if (root) { const fs = PG.podFS(this, p, c.name); const file = root + (path === '/' || path === '' ? '/index.html' : path); return fs.read(file) !== undefined ? 200 : 404; }
    if (info.type === 'registry') return path.startsWith('/v2') ? 200 : 404;
    if (info.built && info.type === 'web') return path === '/' || /^\/(healthz?|ready|live|readyz|livez|status|ping)$/.test(path) ? 200 : 404;
    return path === '/' ? 200 : /^\/(healthz?|ready|live|ping)$/.test(path) && info.type === 'web' ? 200 : 404;
  },
  probeCheck(p, c, kind, probe, cs) {
    const info = PG.imageInfo(this.sim, c.image) || {}; const ip = p.status.podIP || '10.244.0.2';
    const resolvePort = port => { if (typeof port === 'string') { const cp = (c.ports || []).find(x => x.name === port); return cp ? cp.containerPort : null; } return Number(port); };
    if (probe.httpGet) {
      const port = resolvePort(probe.httpGet.port); const path = probe.httpGet.path || '/'; const listening = (info.type === 'web' || info.type === 'registry') && port === (info.port || 80);
      if (!listening) return { ok: false, msg: `Get "http://${ip}:${port}${path}": dial tcp ${ip}:${port}: connect: connection refused` };
      const st = this.webStatus(p, c, info, path); return st < 400 ? { ok: true } : { ok: false, msg: `HTTP probe failed with statuscode: ${st}` };
    }
    if (probe.tcpSocket) { const port = resolvePort(probe.tcpSocket.port); return port === info.port ? { ok: true } : { ok: false, msg: `dial tcp ${ip}:${port}: connect: connection refused` }; }
    if (probe.exec) {
      if (!cs.exec) cs.exec = { pending: false, ok: undefined };
      if (!cs.exec.pending) { cs.exec.pending = true; PG.execInPod({ sim: this.sim, sh: { aborted: false } }, this, p, probe.exec.command || [], c.name).then(r => { cs.exec.ok = r.code === 0; cs.exec.code = r.code; cs.exec.pending = false; }).catch(() => { cs.exec.pending = false; cs.exec.ok = false; }); }
      if (cs.exec.ok === undefined) return { ok: false, wait: true, msg: '' };
      return cs.exec.ok ? { ok: true } : { ok: false, msg: `command "${(probe.exec.command || []).join(' ')}" exited with ${cs.exec.code}` };
    }
    return { ok: true };
  },
  /* ---- init containers ---- */
  initCheck(p, c, info) {
    const argv = [...(c.command || []), ...(c.args || [])].length ? [...(c.command || []), ...(c.args || [])] : (info.cmdArgv || []);
    if (info.requireEnv) { const env = this.podEnvNames(p); if (!info.requireEnv.some(k => env.names.includes(k) || (info.env && k in info.env))) return { state: 'fail', msg: info.crashMsg }; }
    const joined = argv.join(' ');
    if (/\b(until|while)\b/.test(joined)) { // "wait for a dependency" pattern
      let m; const ns = p.metadata.namespace;
      if ((m = /(?:nslookup|getent hosts|ping(?: -c\s*\d+)?|dig(?: \+short)?)\s+([\w.-]+)/.exec(joined)) || (m = /nc\s+-\w*z\w*\s+([\w.-]+)\s+(\d+)/.exec(joined)) || (m = /(?:wget|curl)\b[^;|]*?(?:https?:\/\/)?([\w-]+(?:\.[\w-]+)*)(?::\d+)?/.exec(joined))) { const svc = this.findServiceByHost(m[1], ns); return svc && (/nslookup|getent|dig|ping/.test(joined) ? true : this.endpointsOf(svc).length > 0) ? { state: 'done' } : { state: 'run' }; }
      return { state: 'run' };
    }
    const cls = argv.length ? PG.classifyArgv(argv) : (info.type === 'tool' ? { long: false, out: '' } : { long: true });
    if (!cls) return { state: 'done' }; return cls.long ? { state: 'run' } : { state: 'done', out: cls.out };
  },
  stepInit(p) {
    const sm = p._sim, clock = this.clock, inits = p.spec.initContainers || []; const i = sm.initIdx;
    if (i >= inits.length) { sm.status = 'PodInitializing'; if (clock - sm.initDoneAt > 1) this.startContainers(p); return; }
    const c = inits[i]; const info = PG.imageInfo(this.sim, c.image) || { type: 'tool' }; const r = this.initCheck(p, c, info);
    if (r.state === 'done') {
      if (clock - sm.initAt < 2) { sm.status = `Init:${i}/${inits.length}`; return; }
      sm.initIdx++; sm.initAt = clock; sm.initCrash = false; this.emit(p, 'Normal', 'Started', `Started container ${c.name}`); sm.initLogs = sm.initLogs || {}; sm.initLogs[c.name] = r.out ? [r.out] : [];
      // let the init container's shell command write into shared volumes (e.g. fetch/prepare content for the main container)
      const argv = [...(c.command || []), ...(c.args || [])]; if (argv.length) PG.execInPod({ sim: this.sim, sh: { aborted: false } }, this, p, argv, c.name).then(res => { if (res.out) sm.initLogs[c.name] = res.out.split('\n'); }).catch(() => { });
      if (sm.initIdx >= inits.length) { sm.initDoneAt = clock; sm.status = 'PodInitializing'; } else sm.status = `Init:${sm.initIdx}/${inits.length}`; return;
    }
    if (r.state === 'fail') {
      if (!sm.initCrash) { sm.initCrash = true; sm.initRestarts = (sm.initRestarts || 0) + 1; sm.restarts = (sm.restarts || 0) + 1; sm.initFailAt = clock; sm.status = 'Init:Error'; sm.initLogs = sm.initLogs || {}; sm.initLogs[c.name] = (r.msg || 'init failed').split('\n'); this.emit(p, 'Warning', 'BackOff', `Back-off restarting failed container ${c.name} in pod ${p.metadata.name}`); }
      else { if (clock - sm.initFailAt > 3) sm.status = 'Init:CrashLoopBackOff'; if (clock - sm.initFailAt > Math.min(300, 10 * Math.pow(2, Math.min(5, sm.initRestarts - 1)))) { sm.initCrash = false; sm.initAt = clock; } } return;
    }
    sm.status = `Init:${i}/${inits.length}`;
  },
  /* ---- main containers ---- */
  startContainers(p) {
    const sm = p._sim, clock = this.clock; sm.stage = 'running'; sm.startedAt = clock; sm.status = 'Running'; sm.ready = false; p.status.phase = 'Running';
    sm.cs = p.spec.containers.map((c, i) => ({ startedAt: clock, ready: false, restarts: 0, status: 'Running', logs: i === 0 ? sm.logs : [], done: false, probes: {}, last: null }));
    p.spec.containers.forEach((c, i) => { const lines = this.startLogs(p, c); sm.cs[i].logs.push(...lines); });
  },
  stepContainer(p, i, c) {
    const sm = p._sim, st = sm.cs[i], clock = this.clock; if (st.done) return;
    if (st.waitUntil) { if (clock < st.waitUntil) { st.ready = false; st.status = 'CrashLoopBackOff'; return; } st.waitUntil = 0; st.startedAt = clock; st.status = 'Running'; st.probes = {}; }
    const info = PG.imageInfo(this.sim, c.image) || { type: 'tool' }; const cmd = this.runsCommand(c, info);
    let crashMsg = null, exits = false, oom = false;
    if (info.requireEnv) { const env = this.podEnvNames(p); if (!info.requireEnv.some(k => env.names.includes(k) || (info.env && k in info.env))) crashMsg = info.crashMsg; }
    if (i === 0 && sm.forceCrash) crashMsg = 'panic: simulated crash (sim crash)';
    const lim = PG.memMi(((c.resources || {}).limits || {}).memory); if (!crashMsg && lim !== null && lim < PG.baseMemOf(c.image, info) && clock - st.startedAt >= 3) oom = true;
    if (!crashMsg && !oom) { if (cmd && !cmd.long) exits = true; else if (!cmd && info.type === 'tool') exits = true; }
    if (crashMsg || exits || oom) {
      if (exits && p.spec.restartPolicy === 'Never') { if (!st.done && cmd && cmd.out) st.logs.push(cmd.out); st.done = true; st.ok = true; st.status = 'Completed'; st.ready = false; return; }
      if ((crashMsg || oom) && p.spec.restartPolicy === 'Never') { st.done = true; st.ok = false; st.status = oom ? 'OOMKilled' : 'Error'; st.ready = false; if (crashMsg) st.logs.push(...crashMsg.split('\n')); st.last = oom ? { reason: 'OOMKilled', exitCode: 137 } : { reason: 'Error', exitCode: 1 }; return; }
      if (clock - st.startedAt >= (oom ? 3 : 1.5) && !st.crashNow) {
        st.crashNow = true; st.restarts++; st.status = oom ? 'OOMKilled' : exits ? 'Completed' : 'Error'; st.ready = false; st.last = oom ? { reason: 'OOMKilled', exitCode: 137 } : exits ? { reason: 'Completed', exitCode: 0 } : { reason: 'Error', exitCode: 1 };
        if (crashMsg) st.logs.push(...crashMsg.split('\n')); else if (cmd && cmd.out) st.logs.push(cmd.out); st.backoff = Math.min(300, 10 * Math.pow(2, Math.min(5, st.restarts - 1))); st.restartAt = clock + 1.5;
        this.emit(p, 'Warning', 'BackOff', `Back-off restarting failed container ${c.name} in pod ${p.metadata.name}`);
      } else if (st.crashNow) { st.status = (clock - (st.restartAt - 1.5) > 1.2) ? 'CrashLoopBackOff' : st.status; if (clock >= st.restartAt + st.backoff) { st.crashNow = false; st.startedAt = clock; st.status = 'Running'; st.probes = {}; if (i === 0 && sm.forceCrash) sm.forceCrash = false; } }
      return;
    }
    st.crashNow = false; const age = clock - st.startedAt; const pr = st.probes;
    // startup probe gates the other two
    let startupOk = true; if (c.startupProbe) { startupOk = !!pr.startupDone; if (!startupOk && age >= (c.startupProbe.initialDelaySeconds || 0) && clock >= (pr.nextS || 0)) { const r = this.probeCheck(p, c, 'startup', c.startupProbe, st); pr.nextS = clock + (c.startupProbe.periodSeconds || 10); if (r.ok) pr.startupDone = true; else if (!r.wait) { pr.sFails = (pr.sFails || 0) + 1; this.emit(p, 'Warning', 'Unhealthy', 'Startup probe failed: ' + r.msg); if (pr.sFails >= (c.startupProbe.failureThreshold || 3)) { this.killContainer(p, i, c, 'startup'); return; } } } }
    if (startupOk && c.livenessProbe && age >= (c.livenessProbe.initialDelaySeconds || 0) && clock >= (pr.nextL || 0)) { const r = this.probeCheck(p, c, 'liveness', c.livenessProbe, st); pr.nextL = clock + (c.livenessProbe.periodSeconds || 10); if (r.ok) pr.lFails = 0; else if (!r.wait) { pr.lFails = (pr.lFails || 0) + 1; this.emit(p, 'Warning', 'Unhealthy', 'Liveness probe failed: ' + r.msg); if (pr.lFails >= (c.livenessProbe.failureThreshold || 3)) { this.killContainer(p, i, c, 'liveness'); return; } } }
    if (c.readinessProbe) {
      if (startupOk && age >= (c.readinessProbe.initialDelaySeconds || 0) && clock >= (pr.nextR || 0)) { const r = this.probeCheck(p, c, 'readiness', c.readinessProbe, st); pr.nextR = clock + (c.readinessProbe.periodSeconds || 10); if (r.ok) { pr.rFails = 0; pr.rOk = true; } else if (!r.wait) { pr.rFails = (pr.rFails || 0) + 1; this.emit(p, 'Warning', 'Unhealthy', 'Readiness probe failed: ' + r.msg); if (pr.rFails >= (c.readinessProbe.failureThreshold || 3)) pr.rOk = false; } }
      st.ready = startupOk && !!pr.rOk;
    } else if (!st.ready && age >= 2 && startupOk) st.ready = true;
    st.status = 'Running';
  },
  killContainer(p, i, c, why) {
    const st = p._sim.cs[i], clock = this.clock; st.restarts++; st.lkills = (st.lkills || 0) + 1; st.ready = false; st.probes = {}; st.last = { reason: 'Error', exitCode: 137 };
    this.emit(p, 'Normal', 'Killing', `Container ${c.name} failed ${why} probe, will be restarted`);
    if (st.lkills >= 3) { st.status = 'CrashLoopBackOff'; st.waitUntil = clock + Math.min(300, 10 * Math.pow(2, Math.min(5, st.lkills - 3))); this.emit(p, 'Warning', 'BackOff', `Back-off restarting failed container ${c.name} in pod ${p.metadata.name}`); }
    else { st.startedAt = clock; st.status = 'Running'; }
  },
  stepRunning(p) {
    const sm = p._sim; const cs = sm.cs; p.spec.containers.forEach((c, i) => this.stepContainer(p, i, c));
    sm.restarts = cs.reduce((a, x) => a + x.restarts, 0); const live = cs.filter(x => !x.done);
    if (!live.length) { const ok = cs.every(x => x.ok); sm.status = ok ? 'Completed' : cs.find(x => !x.ok).status; sm.ready = false; p.status.phase = ok ? 'Succeeded' : 'Failed'; sm.stage = 'done'; sm.readyCount = 0; return; }
    sm.ready = cs.every(x => x.ready); sm.readyCount = cs.filter(x => x.ready).length;
    let worst = 'Running'; for (const x of cs) if ((PG.STATUS_RANK[x.status] || 0) > (PG.STATUS_RANK[worst] || 0)) worst = x.status; sm.status = worst;
  },
});
