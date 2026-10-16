/* ================================================================ ls and tree === */
/* The virtual FS keeps no owners/permissions, so they are synthesised: dirs drwxr-xr-x, files -rw-r--r-- (-rwxr-xr-x when they start with #!),
   owner = the shell user (root inside a pod); times come from fs.mt (stamped on every write, simulated clock). */
{
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtT = ms => { const d = new Date(ms); return `${MON[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2)} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; };
  const human = n => n < 1024 ? String(n) : n < 10240 ? (n / 1024).toFixed(1) + 'K' : n < 1048576 ? Math.ceil(n / 1024) + 'K' : n < 10485760 ? (n / 1048576).toFixed(1) + 'M' : Math.ceil(n / 1048576) + 'M';
  const join = (d, n) => d === '/' ? '/' + n : d + '/' + n;
  const key = n => n.replace(/^\./, '').toLowerCase();
  const byName = (a, b) => key(a.name) < key(b.name) ? -1 : key(a.name) > key(b.name) ? 1 : a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  const meta = (ctx, p, name) => {
    const fs = ctx.fs; const dir = fs.isDir(p); const c = dir ? '' : (fs.read(p) || ''); const exec = !dir && /^#!/.test(c);
    return { name, p, dir, size: dir ? 4096 : c.length, mt: (fs.mt && fs.mt[p]) || PG.BASE_TIME, mode: dir ? 'drwxr-xr-x' : exec ? '-rwxr-xr-x' : '-rw-r--r--', exec,
      nlink: dir ? 2 + fs.list(p).filter(n => fs.isDir(join(p, n))).length : 1 };
  };
  const columns = (names, width = 80) => {
    if (!names.length) return '';
    for (let nc = Math.min(names.length, Math.floor(width / 3) || 1); nc >= 1; nc--) {
      const nr = Math.ceil(names.length / nc); if (Math.ceil(names.length / nr) < nc) continue; const w = []; for (let c = 0; c < nc; c++) w.push(Math.max(...names.slice(c * nr, c * nr + nr).map(s => s.length)));
      if (nc === 1 || w.reduce((a, b) => a + b, 0) + 2 * (nc - 1) <= width) { const rows = []; for (let r = 0; r < nr; r++) { let line = ''; for (let c = 0; c < nc; c++) { const s = names[c * nr + r]; if (s === undefined) continue; line += (c < nc - 1 && names[(c + 1) * nr + r] !== undefined) ? s.padEnd(w[c] + 2) : s; } rows.push(line.replace(/\s+$/, '')); } return rows.join('\n'); }
    }
  };
  const lsCmd = async (ctx, args) => {
    const fl = new Set(); const targets = [];
    for (let i = 0; i < args.length; i++) { const a = args[i]; if (a === '--') { targets.push(...args.slice(i + 1)); break; } if (a.startsWith('--') && a.length > 2) { const k = a.slice(2); fl.add(({ all: 'a', 'almost-all': 'A', 'human-readable': 'h', recursive: 'R', directory: 'd', reverse: 'r', classify: 'F' })[k] || k); } else if (a.startsWith('-') && a.length > 1) { for (const ch of a.slice(1)) fl.add(ch); } else targets.push(a); }
    const L = fl.has('l'), H = fl.has('h'), owner = ctx.sh.isPodShell ? 'root' : (ctx.env.USER || 'user'); const fmtSize = n => H ? human(n) : String(n);
    const decorate = m => m.name + (fl.has('F') ? (m.dir ? '/' : m.exec ? '*' : '') : fl.has('p') && m.dir ? '/' : '');
    const sortList = list => { list.sort(fl.has('S') ? (a, b) => b.size - a.size || byName(a, b) : fl.has('t') ? (a, b) => b.mt - a.mt || byName(a, b) : byName); if (fl.has('r')) list.reverse(); return list; };
    const render = (list, withTotal) => {
      if (!list.length) return withTotal && L ? 'total 0' : '';
      if (L) {
        const rows = list.map(m => [m.mode, String(m.nlink), owner, owner, fmtSize(m.size), fmtT(m.mt), decorate(m)]); const w = [1, 4].map(c => Math.max(...rows.map(r => r[c].length)));
        const body = rows.map(r => `${r[0]} ${r[1].padStart(w[0])} ${r[2].padEnd(owner.length)} ${r[3].padEnd(owner.length)} ${r[4].padStart(w[1])} ${r[5]} ${r[6]}`).join('\n');
        if (!withTotal) return body; const blocks = list.reduce((s, m) => s + (m.size ? Math.ceil(m.size / 4096) * 4 : m.dir ? 4 : 0), 0); return `total ${H ? human(blocks * 1024) : blocks}\n` + body;
      }
      const names = list.map(decorate); return ctx.tty && !fl.has('1') ? columns(names, (ctx.sh.term && ctx.sh.term.cols) || 80) : names.join('\n');
    };
    const entries = p => { let names = ctx.fs.list(p); if (!fl.has('a') && !fl.has('A')) names = names.filter(n => !n.startsWith('.')); const list = names.map(n => meta(ctx, join(p, n), n)); if (fl.has('a')) { list.push(meta(ctx, p, '.'), meta(ctx, p === '/' ? '/' : p.slice(0, p.lastIndexOf('/')) || '/', '..')); } return sortList(list); };
    let code = 0; const blocks = []; const files = []; const dirs = [];
    for (const t of (targets.length ? targets : ['.'])) { const p = ctx.resolve(t); if (!ctx.fs.exists(p)) { ctx.eprintln(`ls: cannot access '${t}': No such file or directory`); code = 2; continue; } if (ctx.fs.isDir(p) && !fl.has('d')) dirs.push({ t, p }); else files.push(meta(ctx, p, t)); }
    if (files.length) blocks.push(render(sortList(files), false));
    const header = targets.length > 1 || fl.has('R');
    const walk = (t, p) => { const list = entries(p); let s = (header ? t + ':\n' : '') + render(list, true); blocks.push(s.replace(/\n$/, '')); if (fl.has('R')) for (const m of list) if (m.dir && m.name !== '.' && m.name !== '..') walk(t === '/' ? '/' + m.name : t + '/' + m.name, m.p); };
    for (const d of dirs.sort((a, b) => 0)) walk(d.t, d.p);
    const out = blocks.filter(b => b !== '').join('\n\n'); if (out) ctx.println(out); return code;
  };
  PG.commands.ls = lsCmd; PG.commands.dir = lsCmd;
  PG.commands.ll = async (ctx, a) => lsCmd(ctx, ['-l', ...a]);

  PG.commands.tree = async (ctx, args) => {
    if (ctx.sh.isPodShell) { ctx.eprintln('sh: tree: not found'); return 127; }
    let all = false, dirsOnly = false, full = false, noReport = false, max = Infinity, ignore = null, dirsFirst = false; const targets = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '--noreport') noReport = true; else if (a === '--dirsfirst') dirsFirst = true; else if (a === '--') { targets.push(...args.slice(i + 1)); break; }
      else if (/^-L\d+$/.test(a)) max = Number(a.slice(2)); else if (a.startsWith('-') && a.length > 1 && !a.startsWith('--')) { for (const ch of a.slice(1)) { if (ch === 'a') all = true; else if (ch === 'd') dirsOnly = true; else if (ch === 'f') full = true; else if (ch === 'L') { max = Number(args[++i]); if (!(max >= 1)) { ctx.eprintln('tree: Invalid level, must be greater than 0.'); return 1; } } else if (ch === 'I') ignore = new RegExp('^(' + String(args[++i] || '').split('|').map(g => g.replace(/[.+^${}()[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')).join('|') + ')$'); } }
      else if (a.startsWith('--')) { /* unknown long flag: ignore */ } else targets.push(a);
    }
    let nd = 0, nf = 0; const lines = [];
    const walk = (p, shown, prefix, depth) => {
      let names = ctx.fs.list(p).filter(n => (all || !n.startsWith('.')) && !(ignore && ignore.test(n))); const list = names.map(n => ({ name: n, dir: ctx.fs.isDir(join(p, n)) })).filter(m => !dirsOnly || m.dir).sort((a, b) => (dirsFirst ? (b.dir - a.dir) : 0) || byName(a, b));
      list.forEach((m, i) => { const last = i === list.length - 1; const fp = join(p, m.name); lines.push(prefix + (last ? '└── ' : '├── ') + (full ? (shown === '/' ? '' : shown) + '/' + m.name : m.name)); if (m.dir) { nd++; if (depth < max) walk(fp, join(shown, m.name), prefix + (last ? '    ' : '│   '), depth + 1); } else nf++; });
    };
    let code = 0;
    for (const t of (targets.length ? targets : ['.'])) { const p = ctx.resolve(t); lines.push(t); if (!ctx.fs.isDir(p)) { if (ctx.fs.exists(p)) { nf++; } else { lines[lines.length - 1] = t + ' [error opening dir]'; code = 2; } continue; } walk(p, t.replace(/\/$/, '') || '/', '', 1); }
    if (!noReport) lines.push('', `${nd} ${nd === 1 ? 'directory' : 'directories'}` + (dirsOnly ? '' : `, ${nf} ${nf === 1 ? 'file' : 'files'}`));
    ctx.println(lines.join('\n')); return code;
  };
}
