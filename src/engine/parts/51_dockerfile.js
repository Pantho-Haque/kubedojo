/* ============================================================ Dockerfile builder === */
PG.BASE_FS = {
  nginx: { '/usr/share/nginx/html/index.html': 'NGINX_PAGE', '/usr/share/nginx/html/50x.html': '<html><body><h1>An error occurred.</h1></body></html>\n', '/etc/nginx/nginx.conf': 'user  nginx;\nworker_processes  auto;\nevents { worker_connections  1024; }\nhttp { include /etc/nginx/mime.types; include /etc/nginx/conf.d/*.conf; }\n', '/etc/nginx/conf.d/default.conf': 'server {\n    listen       80;\n    server_name  localhost;\n    location / {\n        root   /usr/share/nginx/html;\n        index  index.html index.htm;\n    }\n}\n' },
  httpd: { '/usr/local/apache2/htdocs/index.html': '<html><body><h1>It works!</h1></body></html>\n', '/usr/local/apache2/conf/httpd.conf': 'ServerRoot "/usr/local/apache2"\nListen 80\n' },
  caddy: { '/usr/share/caddy/index.html': '<!DOCTYPE html><title>Caddy works!</title>\n', '/etc/caddy/Caddyfile': ':80 {\n\troot * /usr/share/caddy\n\tfile_server\n}\n' },
  redis: { '/data/': '', '/usr/local/bin/redis-server': '#!/bin/sh\n' }, postgres: { '/var/lib/postgresql/data/': '' },
};
PG.WEBROOT = { nginx: '/usr/share/nginx/html/index.html', httpd: '/usr/local/apache2/htdocs/index.html', caddy: '/usr/share/caddy/index.html' };
PG.parseDockerfile = text => {
  const lines = text.replace(/\r/g, '').split('\n'); const out = []; let i = 0;
  while (i < lines.length) { let l = lines[i++]; if (/^\s*(#|$)/.test(l)) continue; while (/\\\s*$/.test(l) && i < lines.length) { l = l.replace(/\\\s*$/, ' ') + lines[i++].replace(/^\s*#.*$/, ''); } const m = /^\s*([A-Za-z]+)\s*(.*)$/.exec(l); if (m) out.push({ cmd: m[1].toUpperCase(), args: m[2].trim(), line: i }); }
  return out;
};
PG.argvOf = a => { a = a.trim(); if (a[0] === '[') { try { return JSON.parse(a); } catch (e) { } } return ['/bin/sh', '-c', a]; };
PG.classifyArgv = argv => { // is this a long-running process, or does it exit (and print something)?
  if (!argv || !argv.length) return null; let a = [...argv]; if ((a[0] === '/bin/sh' || a[0] === 'sh' || a[0] === 'bash') && a[1] === '-c') { a = PG.lex(a[2] || '').filter(t => t.t === 'word').map(t => t.parts.map(p => p.v).join('')); }
  const j = a.join(' ');
  if (/\bsleep\s+(infinity|\d{3,})/.test(j) || /\btail\s+-f\b/.test(j) || /\bnginx\b/.test(j) || /\bhttpd\b|\bapache2/.test(j) || /\bredis-server\b|\bpostgres\b|\bmysqld\b|\bmongod\b|\bcaddy\b/.test(j) || /\b(python3?|node|java|ruby|php|go|dotnet|uvicorn|gunicorn|flask|npm|yarn|deno|bun)\b/.test(j) || /^\.?\/\S+/.test(a[0])) return { long: true, out: '' };
  const m = /^echo\s+(.*)$/.exec(j); if (/^(echo|true|false|exit|ls|cat|printf|date|hostname|env|pwd|whoami|id|uname)\b/.test(j) || /^sleep\s+\d{1,2}$/.test(j)) return { long: false, out: m ? m[1].replace(/^["']|["']$/g, '') : '' };
  return { long: true, out: '' };
};
// build an image from a Dockerfile; returns {image, log:[...]} or {err}
PG.buildImage = async (ctx, dfText, contextDir, buildArgs) => {
  const sim = ctx.sim; const ins = PG.parseDockerfile(dfText); const log = []; const stages = []; let cur = null; const total = ins.filter(x => ['FROM', 'COPY', 'ADD', 'RUN', 'WORKDIR'].includes(x.cmd)).length;
  if (!ins.some(x => x.cmd === 'FROM')) return { err: 'ERROR: failed to solve: dockerfile parse error: file with no instructions' };
  let step = 0; const args = { ...buildArgs }; const subst = s => s.replace(/\$\{(\w+)\}|\$(\w+)/g, (m, a, b) => { const k = a || b; return (cur && cur.meta.env[k] !== undefined) ? cur.meta.env[k] : args[k] !== undefined ? args[k] : ''; });
  const note = (label, ms) => log.push(` => ${label.length > 70 ? label.slice(0, 67) + '...' : label}`.padEnd(78) + (ms === undefined ? '0.0' : ms.toFixed(1)) + 's');
  const mkFs = meta => { const fs = new PG.FS(); fs.files = { ...meta.fs }; fs.dirs = new Set(['/', ...(meta.dirs || [])]); for (const f of Object.keys(meta.fs)) { let d = f.slice(0, f.lastIndexOf('/')); while (d) { fs.dirs.add(d); d = d.slice(0, d.lastIndexOf('/')); } } return fs; };
  const save = (meta, fs) => { meta.fs = fs.files; meta.dirs = [...fs.dirs]; };
  for (const x of ins) {
    const a = subst(x.args);
    if (x.cmd === 'ARG') { const m = /^(\w+)(?:=(.*))?$/.exec(a.trim()); if (m && args[m[1]] === undefined && m[2] !== undefined) args[m[1]] = m[2].replace(/^["']|["']$/g, ''); continue; }
    if (x.cmd === 'FROM') {
      const m = /^(\S+)(?:\s+AS\s+(\S+))?$/i.exec(a.trim()); if (!m) return { err: `ERROR: failed to solve: dockerfile parse error on line ${x.line}: FROM requires either one or three arguments` };
      step++; const prev = stages.find(s => s.name === m[1]); let meta;
      if (prev) meta = JSON.parse(JSON.stringify(prev.meta));
      else if (m[1] === 'scratch') meta = { base: null, env: {}, fs: {}, dirs: [] };
      else { const p = PG.parseImage(m[1]); const key = p.host ? m[1] : p.repo + ':' + p.tag; const local = sim.images[key]; if (local && local.meta) meta = JSON.parse(JSON.stringify(local.meta));
        else if (PG.CATALOG[p.repo] && !p.host) { const bf = {}; for (const [f, c] of Object.entries(PG.BASE_FS[p.repo] || {})) bf[f] = c === 'NGINX_PAGE' ? PG.CATALOG.nginx.page : c; meta = { base: p.repo, env: {}, fs: bf, dirs: [] }; }
        else if (local) meta = { base: null, env: {}, fs: {}, dirs: [] };
        else return { err: `ERROR: failed to solve: ${m[1]}: failed to resolve source metadata for docker.io/${p.repo.includes('/') ? p.repo : 'library/' + p.repo}:${p.tag}: pull access denied, repository does not exist or may require authorization` }; }
      cur = { name: m[2] || null, meta, ref: m[1] }; stages.push(cur); note(`[internal] load metadata for docker.io/library/${m[1]}`, 0.6); note(`[${step}/${total}] FROM docker.io/library/${m[1]}`, 0.1); continue;
    }
    if (!cur) return { err: `ERROR: failed to solve: dockerfile parse error on line ${x.line}: no build stage in current context` };
    const meta = cur.meta;
    if (x.cmd === 'ENV') { const kv = a.match(/(\w+)=("[^"]*"|'[^']*'|\S+)/g); if (kv) for (const p of kv) { const i = p.indexOf('='); meta.env[p.slice(0, i)] = p.slice(i + 1).replace(/^["']|["']$/g, ''); } else { const m = /^(\w+)\s+(.*)$/.exec(a); if (m) meta.env[m[1]] = m[2]; } }
    else if (x.cmd === 'EXPOSE') { const m = /(\d+)/.exec(a); if (m && !meta.port) meta.port = Number(m[1]); else if (m) meta.port = meta.port || Number(m[1]); }
    else if (x.cmd === 'WORKDIR') { step++; meta.workdir = a.startsWith('/') ? a : ((meta.workdir || '/').replace(/\/$/, '') + '/' + a); const fs = mkFs(meta); fs.mkdirp(meta.workdir, true); save(meta, fs); note(`[${step}/${total}] WORKDIR ${meta.workdir}`); }
    else if (x.cmd === 'CMD') meta.cmd = PG.argvOf(a);
    else if (x.cmd === 'ENTRYPOINT') meta.entrypoint = PG.argvOf(a);
    else if (x.cmd === 'USER') meta.user = a; else if (x.cmd === 'LABEL') meta.labels = { ...(meta.labels || {}), ...Object.fromEntries((a.match(/(\S+)=("[^"]*"|\S+)/g) || []).map(p => { const i = p.indexOf('='); return [p.slice(0, i), p.slice(i + 1).replace(/^"|"$/g, '')]; })) };
    else if (x.cmd === 'COPY' || x.cmd === 'ADD') {
      step++; let from = null; let rest = a; const fm = /^--from=(\S+)\s+/.exec(rest); if (fm) { from = fm[1]; rest = rest.slice(fm[0].length); } rest = rest.replace(/^--\w+=\S+\s+/g, '');
      const parts = rest.startsWith('[') ? JSON.parse(rest) : rest.split(/\s+/).filter(Boolean); const dest = parts.pop(); const srcs = parts; if (!srcs.length) return { err: `ERROR: failed to solve: dockerfile parse error on line ${x.line}: COPY requires at least two arguments` };
      const destAbs = ctx.fs.norm(dest.startsWith('/') ? dest : ((meta.workdir || '/').replace(/\/$/, '') + '/' + dest), '/') + (dest.endsWith('/') ? '/' : ''); const fs = mkFs(meta); const destIsDir = dest.endsWith('/') || srcs.length > 1 || dest === '.';
      let srcFiles; if (from) { const sg = stages.find(s => s.name === from || String(stages.indexOf(s)) === from); if (!sg) return { err: `ERROR: failed to solve: failed to resolve source "${from}"` }; srcFiles = sg.meta.fs; }
      for (const s of srcs) {
        let copied = 0;
        if (from) { const sp = s.startsWith('/') ? s : '/' + s; for (const [f, c] of Object.entries(srcFiles)) { if (f === sp || f.startsWith(sp.replace(/\/$/, '') + '/')) { const t = (f === sp && !destIsDir) ? destAbs : destAbs.replace(/\/$/, '') + '/' + (f === sp ? f.split('/').pop() : f.slice(sp.replace(/\/$/, '').length + 1)); fs.write(t, c); copied++; } } }
        else { const p = ctx.fs.norm(s === '.' ? '.' : s, contextDir); if (ctx.fs.isDir(p)) { for (const f of Object.keys(ctx.fs.files).filter(f => f.startsWith(p.replace(/\/$/, '') + '/'))) { fs.write(destAbs.replace(/\/$/, '') + '/' + f.slice(p.replace(/\/$/, '').length + 1), ctx.fs.read(f)); copied++; } } else if (ctx.fs.read(p) !== undefined) { fs.write(destIsDir ? destAbs.replace(/\/$/, '') + '/' + p.split('/').pop() : destAbs, ctx.fs.read(p)); copied++; } }
        if (!copied) return { err: `ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref: "/${s.replace(/^\//, '')}": not found` };
      }
      save(meta, fs); note(`[${step}/${total}] ${x.cmd} ${rest.slice(0, 60)}`);
    }
    else if (x.cmd === 'RUN') {
      step++; const fs = mkFs(meta); const sh2 = new PG.Shell(sim, { print() { }, clear() { } }); sh2.fsOverride = fs; sh2.lenient = true; sh2.cwd = meta.workdir || '/'; sh2.env.HOME = '/root'; fs.mkdirp(sh2.cwd, true);
      const cmdline = a.startsWith('[') ? PG.argvOf(a).join(' ') : a; try { await sh2.runScript(cmdline, { write() { } }); } catch (e) { if (e && e.abort) throw e; }
      save(meta, fs); note(`[${step}/${total}] RUN ${cmdline}`, 0.3);
    }
  }
  const fin = stages[stages.length - 1]; const meta = fin.meta; const bi = PG.CATALOG[meta.base] || { size: 5 };
  let size = (bi.size || 5) + Object.values(meta.fs).reduce((n, c) => n + (c ? c.length : 0), 0) / 1e6; size = Math.max(1, Math.round(size));
  return { log, image: { id: PG.hex(12), size, created: sim.clock, meta } };
};
if (typeof module !== 'undefined') module.exports = PG;
