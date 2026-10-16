/* ============================================================= shell builtins === */
const C = PG.commands;
const readIn = async (ctx, files, cmd) => { // text from files or stdin
  if (files.length) { let out = ''; for (const f of files) { const p = ctx.resolve(f); const c = ctx.fs.read(p); if (c === undefined) { ctx.eprintln(`${cmd}: ${f}: ${ctx.fs.isDir(p) ? 'Is a directory' : 'No such file or directory'}`); return null; } out += c; } return out; }
  return ctx.stdin === null || ctx.stdin === undefined ? '' : ctx.stdin;
};
const opts = args => { const flags = new Set(); const rest = []; const kv = {}; for (let i = 0; i < args.length; i++) { const a = args[i]; if (a === '--') { rest.push(...args.slice(i + 1)); break; } if (a.startsWith('--') && a.length > 2) { const [k, v] = a.slice(2).split('='); if (v !== undefined) kv[k] = v; flags.add(k); } else if (a.startsWith('-') && a.length > 1 && !/^-\d/.test(a)) { for (const ch of a.slice(1)) flags.add(ch); } else rest.push(a); } return { flags, rest, kv }; };
PG.opts = opts;
C.echo = async (ctx, args) => { let nl = true; if (args[0] === '-n') { nl = false; args = args.slice(1); } let s = args.join(' '); if (args[0] === '-e') { s = args.slice(1).join(' ').replace(/\\n/g, '\n').replace(/\\t/g, '\t'); } ctx.out(s + (nl ? '\n' : '')); };
C.printf = async (ctx, args) => { if (!args.length) return; const fmt = args[0].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"'); const rest = args.slice(1); let i = 0; let out = fmt.replace(/%([sd%])/g, (m, c) => c === '%' ? '%' : String(rest[i++] ?? '')); ctx.out(out); };
C.cat = async (ctx, args) => { const o = opts(args); const t = await readIn(ctx, o.rest.filter(a => a !== '-'), 'cat'); if (t === null) return 1; ctx.out(t); };
C.mkdir = async (ctx, args) => { const o = opts(args); for (const d of o.rest) { const p = ctx.resolve(d); if (ctx.fs.exists(p) && !o.flags.has('p')) { ctx.eprintln(`mkdir: ${d}: File exists`); return 1; } ctx.fs.mkdirp(p); } };
C.rm = async (ctx, args) => { const o = opts(args); for (const f of o.rest) { const p = ctx.resolve(f); if (p === '/') { ctx.eprintln('rm: "/" may not be removed'); return 1; } const n = ctx.fs.remove(p, o.flags.has('r') || o.flags.has('R')); if (p === ctx.env.HOME || p === '/home') ctx.fs.mkdirp(p, true); if ((n === 0 && !o.flags.has('f'))) { ctx.eprintln(`rm: ${f}: No such file or directory`); return 1; } if (n === -1) { ctx.eprintln(`rm: ${f}: is a directory`); return 1; } } };
C.rmdir = async (ctx, args) => { for (const f of args) { const p = ctx.resolve(f); if (!ctx.fs.isDir(p)) { ctx.eprintln(`rmdir: ${f}: No such file or directory`); return 1; } ctx.fs.remove(p, false); } };
C.touch = async (ctx, args) => { for (const f of args) { const p = ctx.resolve(f); if (!ctx.fs.exists(p)) ctx.fs.write(p, ''); } };
C.cp = async (ctx, args) => { const o = opts(args); const [a, b] = o.rest; const pa = ctx.resolve(a); let pb = ctx.resolve(b); if (ctx.fs.isDir(pb)) pb += '/' + pa.split('/').pop(); if (ctx.fs.read(pa) === undefined) { ctx.eprintln(`cp: ${a}: No such file or directory`); return 1; } ctx.fs.write(pb, ctx.fs.read(pa)); };
C.mv = async (ctx, args) => { const o = opts(args); const [a, b] = o.rest; const pa = ctx.resolve(a); let pb = ctx.resolve(b); if (ctx.fs.isDir(pb)) pb += '/' + pa.split('/').pop(); if (ctx.fs.read(pa) === undefined && !ctx.fs.isDir(pa)) { ctx.eprintln(`mv: ${a}: No such file or directory`); return 1; } if (ctx.fs.isDir(pa)) { ctx.eprintln('mv: moving directories is not supported in the playground (move files individually)'); return 1; } ctx.fs.write(pb, ctx.fs.read(pa)); ctx.fs.remove(pa); };
C.cd = async (ctx, args) => { const p = ctx.resolve(args[0] || '~'); if (!ctx.fs.isDir(p)) { ctx.eprintln(`cd: no such file or directory: ${args[0]}`); return 1; } ctx.sh.cwd = p; ctx.sh.env.PWD = p; };
C.pwd = async ctx => { ctx.println(ctx.cwd); };
C.clear = async ctx => { ctx.clear(); };
C.whoami = async ctx => { ctx.println('user'); };
C.date = async ctx => { ctx.println(new Date(PG.BASE_TIME + ctx.sim.clock * 1000).toString().replace(/GMT.*/, 'UTC 2026')); };
C.uname = async ctx => { ctx.println('Darwin'); };
C.true = async () => 0; C.false = async () => 1;
C.sleep = async (ctx, args) => { await ctx.sleep(Number(args[0]) || 1); };
C.history = async ctx => { ctx.sh.history.forEach((h, i) => ctx.println(String(i + 1).padStart(4) + '  ' + h)); };
C.export = async (ctx, args) => { for (const a of args) { const [k, ...v] = a.split('='); ctx.sh.env[k] = v.join('='); ctx.sh.vars[k] = v.join('='); } };
C.unset = async (ctx, args) => { for (const a of args) { delete ctx.sh.env[a]; delete ctx.sh.vars[a]; } };
C.env = async ctx => { for (const [k, v] of Object.entries(ctx.env)) ctx.println(`${k}=${v}`); };
C.which = async (ctx, args) => { for (const a of args) { if (C[a]) ctx.println('/usr/local/bin/' + a); else { ctx.eprintln(`${a} not found`); return 1; } } };
C.base64 = async (ctx, args) => { const o = opts(args); const t = await readIn(ctx, o.rest, 'base64'); if (t === null) return 1; if (o.flags.has('d') || o.flags.has('D') || o.flags.has('decode')) ctx.out(PG.unb64(t.replace(/\s+/g, ''))); else ctx.println(PG.b64(t)); };
C.tr = async (ctx, args) => { // tr [-d] [-s] [-c] SET1 [SET2]: understands ranges (a-z), classes ([:upper:]) and \n \t escapes
  const o = opts(args); const t = ctx.stdin || '';
  const CLS = { lower: 'abcdefghijklmnopqrstuvwxyz', upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', digit: '0123456789', space: ' \t\n\r\f\v', alpha: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', alnum: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', punct: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~' };
  const expand = raw => { const s = raw.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\[:(\w+):\]/g, (m, c) => CLS[c] || m); let r = ''; for (let k = 0; k < s.length; k++) { if (s[k + 1] === '-' && k + 2 < s.length && s.charCodeAt(k + 2) >= s.charCodeAt(k)) { for (let c = s.charCodeAt(k); c <= s.charCodeAt(k + 2); c++) r += String.fromCharCode(c); k += 2; } else r += s[k]; } return r; };
  const a = expand(o.rest[0] || ''), comp = o.flags.has('c'); const inA = c => comp ? !a.includes(c) : a.includes(c);
  let out;
  if (o.flags.has('d')) out = t.split('').filter(c => !inA(c)).join('');
  else { const b = expand(o.rest[1] || ''); out = t.split('').map(c => { if (!inA(c)) return c; if (!b) return c; return comp ? b[b.length - 1] : (b[Math.min(a.indexOf(c), b.length - 1)] || c); }).join(''); }
  if (o.flags.has('s')) { const set = expand(o.flags.has('d') ? (o.rest[1] || '') : (o.rest[1] || o.rest[0] || '')); out = out.replace(/(.)\1+/gs, (m, c) => set.includes(c) ? c : m); }
  ctx.out(out);
};
C.grep = async (ctx, args) => { const o = opts(args); let A = 0, B = 0; const rest0 = []; for (let i = 0; i < args.length; i++) { const a = args[i]; let m; if ((m = /^-([ABC])(\d*)$/.exec(a))) { const n = m[2] !== '' ? Number(m[2]) : Number(args[++i]); if (m[1] === 'A' || m[1] === 'C') A = n; if (m[1] === 'B' || m[1] === 'C') B = n; } else if ((m = /^-(\d+)$/.exec(a))) { A = B = Number(m[1]); } } const pats = []; const files = []; let rest = o.rest.filter(x => !/^\d+$/.test(x) || !args.some((a, k) => /^-[ABC]$/.test(a) && args[k + 1] === x)); if (!rest.length) return 2; pats.push(rest.shift()); files.push(...rest); const t = await readIn(ctx, files, 'grep'); if (t === null) return 2; const flag = o.flags.has('i') ? 'i' : ''; let res; try { res = new RegExp(pats[0].replace(/\\\|/g, '|').replace(/\\\(/g, '(').replace(/\\\)/g, ')'), flag); } catch (e) { res = new RegExp(pats[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flag); } const lines = t.split('\n'); if (lines[lines.length - 1] === '') lines.pop(); const hit = lines.map(l => res.test(l) !== o.flags.has('v'));
  if (o.flags.has('c')) ctx.println(String(hit.filter(Boolean).length)); else if (o.flags.has('q')) { } else { const show = new Set(); hit.forEach((h, i) => { if (h) for (let k = Math.max(0, i - B); k <= Math.min(lines.length - 1, i + A); k++) show.add(k); }); let prev = -2; for (const i of [...show].sort((a, b) => a - b)) { if ((A || B) && prev >= 0 && i > prev + 1) ctx.println('--'); ctx.println(o.flags.has('o') && hit[i] ? (lines[i].match(res) || [lines[i]])[0] : (o.flags.has('n') ? (i + 1) + (hit[i] ? ':' : '-') : '') + lines[i]); prev = i; } }
  return hit.some(Boolean) ? 0 : 1; };
const nOpt = (args, def) => { let n = def; const rest = []; for (let i = 0; i < args.length; i++) { if (args[i] === '-n') n = Number(args[++i]); else if (/^-\d+$/.test(args[i])) n = Number(args[i].slice(1)); else rest.push(args[i]); } return { n, rest }; };
C.head = async (ctx, args) => { const { n, rest } = nOpt(args, 10); const t = await readIn(ctx, rest, 'head'); if (t === null) return 1; const l = t.split('\n'); if (l[l.length - 1] === '') l.pop(); ctx.out(l.slice(0, n).join('\n') + (l.length ? '\n' : '')); };
C.tail = async (ctx, args) => { const { n, rest } = nOpt(args, 10); const t = await readIn(ctx, rest, 'tail'); if (t === null) return 1; const l = t.split('\n'); if (l[l.length - 1] === '') l.pop(); ctx.out(l.slice(-n).join('\n') + (l.length ? '\n' : '')); };
C.wc = async (ctx, args) => { const o = opts(args); const t = await readIn(ctx, o.rest, 'wc'); if (t === null) return 1; if (o.flags.has('l')) ctx.println(String((t.match(/\n/g) || []).length).padStart(8)); else ctx.println(`${(t.match(/\n/g) || []).length} ${t.split(/\s+/).filter(Boolean).length} ${t.length}`); };
C.sort = async (ctx, args) => { const o = opts(args); const t = await readIn(ctx, o.rest, 'sort'); if (t === null) return 1; const l = t.split('\n'); if (l[l.length - 1] === '') l.pop(); l.sort(); if (o.flags.has('r')) l.reverse(); ctx.out(l.join('\n') + '\n'); };
C.uniq = async (ctx, args) => { const t = ctx.stdin || ''; const l = t.split('\n'); const out = l.filter((x, i) => i === 0 || x !== l[i - 1]); ctx.out(out.join('\n')); };
C.openssl = async (ctx, args) => {
  const sub = args[0]; const g = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
  if (sub === 'genrsa') { const out = g('-out'); const txt = '-----BEGIN RSA PRIVATE KEY-----\nSIMULATED-KEY-' + PG.hex(24) + '\n-----END RSA PRIVATE KEY-----\n'; if (out) ctx.fs.write(ctx.resolve(out), txt); else ctx.out(txt); ctx.eprintln('Generating RSA private key, 2048 bit long modulus (simulated)'); return 0; }
  if (sub === 'req') { const key = g('-key'), out = g('-out'), subj = g('-subj'); if (!key || !ctx.fs.read(ctx.resolve(key))) { ctx.eprintln('openssl: unable to load private key (use: openssl genrsa -out file 2048)'); return 1; } const cn = /CN=([^/]+)/.exec(subj || ''), org = [...(subj || '').matchAll(/O=([^/]+)/g)].map(x => x[1]); const txt = `-----BEGIN CERTIFICATE REQUEST-----\nCN=${cn ? cn[1] : ''};O=${org.join(',')};KEY=${ctx.fs.read(ctx.resolve(key)).split('\n')[1]}\n-----END CERTIFICATE REQUEST-----\n`; if (out) ctx.fs.write(ctx.resolve(out), txt); else ctx.out(txt); return 0; }
  ctx.eprintln('openssl: only "genrsa" and "req -new" are simulated'); return 1;
};
C.tar = async (ctx, args) => { if ((ctx.stdin || '').startsWith('SIMULATED-DOWNLOAD')) { ctx.fs.write(ctx.resolve('darwin-amd64/helm'), 'SIMULATED-HELM-BINARY'); ctx.fs.write(ctx.resolve('darwin-amd64/LICENSE'), 'Apache-2.0'); return 0; } ctx.eprintln('tar: nothing to extract in the playground'); return 1; };
C.brew = async (ctx, args) => {
  const [sub, ...pk] = args; if (sub === 'install' || sub === 'upgrade') { for (const p of pk.filter(x => !x.startsWith('-'))) { ctx.println(`==> Downloading https://ghcr.io/v2/homebrew/core/${p}`); await ctx.delay(150); ctx.println(`==> Pouring ${p}--bottle.arm64.tar.gz`); ctx.println(`🍺  /opt/homebrew/Cellar/${p}: installed (simulated)`); } return 0; }
  if (sub === 'uninstall') { ctx.println('Uninstalling (simulated)'); return 0; } ctx.println('brew: simulated. Try: brew install kind kubectl k3d'); 
};
C.lsof = async (ctx, args) => { const m = /:(\d+)/.exec(args.join(' ')); const port = m && Number(m[1]); const hit = port && ctx.sim.containers.find(c => c.status === 'running' && c.ports.some(p => p.host === port)); if (hit) ctx.println(`COMMAND   PID USER   FD   TYPE NODE NAME\ncom.docke 1234 user   99u  IPv4  TCP *:${port} (LISTEN)`); else return 1; };
C.open = async ctx => { ctx.println('(open: not available in the playground)'); };

C.help = async (ctx, args) => {
  ctx.println(`KubeDojo — a simulator. Nothing here is real: no Docker, no cluster. Type commands in ANY order.

  Cluster tools    kind · k3d · docker · kubectl (alias: kc, k) · helm2 · gcloud (clusters list/delete)
  Editor           vi FILE (also vim/view): i = type, Esc, :wq = save & quit, :q! = quit, :help
  Shell            echo cat ls tree mkdir rm cd pwd find grep awk sed cut head tail wc sort uniq tee xargs jq watch curl openssl
                   pipes |   redirects > >>   VAR=x  $(...)  $((1+2))   heredocs <<'EOF'   if/while/for   alias
  Playground       tour           (a 2-minute walkthrough of the whole page)
                   export-script  (build a bash script that recreates this setup on a real machine)
                   sim help       (load generator, crash a pod, speed, reset)

  Start here
    kind create cluster --name local-cluster-1       # or: k3d cluster create local-cluster-1 --agents 2
    kubectl config current-context                   # you start inside a fake PRODUCTION cluster!
    kubectl get nodes
    kubectl create namespace web
    kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web
    kubectl get pods -n web -o wide
    helm2 ls                                         # after: helm2 init  (chart is in ~/myapp)
    kubectl exec -it deploy/web -n web -- sh         # a real(ish) shell inside a pod: ps, cat, curl, exit
    docker run -it --rm alpine sh                    # …and inside a plain container

  Each tool has its own help:  kind --help · k3d --help · docker --help · kubectl --help · helm2 --help
  Keys:  ↑/↓ history · Tab complete · Ctrl-C stop a running command · Ctrl-L clear
  Click any command in the left panel to put it on the prompt (Shift+click runs it).`);
};
C.sim = async (ctx, args) => {
  const sub = args[0]; const sim = ctx.sim;
  if (!sub || sub === 'help') { ctx.println(`sim — playground controls
  sim load <deployment> <percent> [-n ns]   fake CPU demand, as % of ONE pod's request in total (e.g. 300). HPA reacts to it.
  sim crash <pod> [-n ns]                    make a container crash (watch CrashLoopBackOff)
  sim speed <1|2|4|8>                        how fast simulated time runs
  sim images                                 public images the playground can "pull"
  sim time                                   simulated clock
  sim reset                                  throw everything away and start over`); return 0; }
  if (sub === 'speed') { sim.speed = Math.max(1, Math.min(16, Number(args[1]) || 1)); ctx.println('simulated time now runs ' + sim.speed + 'x'); return 0; }
  if (sub === 'time') { ctx.println(`simulated time: ${PG.fmtAge(sim.clock)} since start`); return 0; }
  if (sub === 'images') { ctx.println('nginx httpd caddy redis memcached postgres mysql mongo rabbitmq busybox alpine ubuntu curlimages/curl registry hashicorp/consul traefik node python grafana/grafana prom/prometheus kennethreitz/httpbin\n(plus anything you build with docker build, or push to your local registry)'); return 0; }
  if (sub === 'reset') { await PG.resetHook(); return 0; }
  const o = opts(args.slice(1)); const nsI = args.indexOf('-n'); const ns = nsI >= 0 ? args[nsI + 1] : 'default';
  const cl = sim.currentCluster(); if (!cl) { ctx.eprintln('no current cluster (create one first)'); return 1; }
  if (sub === 'load') { const name = o.rest[0].replace(/^deploy(ment)?s?\//, ''); const dep = cl.find('deployments', name, ns); if (!dep) { ctx.eprintln(`deployment "${name}" not found in ${ns}`); return 1; } dep._load = Number(o.rest[1]); ctx.println(`simulated demand on ${name}: ${o.rest[1]}% of one pod's CPU request in total`); return 0; }
  if (sub === 'crash') { const p = cl.find('pods', o.rest[0].replace(/^pods?\//, ''), ns); if (!p) { ctx.eprintln('pod not found'); return 1; } p._sim.forceCrash = true; ctx.println('pod ' + p.metadata.name + ' will crash'); return 0; }
  ctx.eprintln('sim: unknown subcommand; try: sim help'); return 1;
};
if (typeof module !== 'undefined') module.exports = PG;
