/* ============================================================ more shell tools === */
PG.testExpr = (ctx, a) => {
  a = [...a]; const neg = a[0] === '!'; if (neg) a.shift(); let r = false;
  if (a.length === 1) r = a[0] !== '';
  else if (a.length === 2) { const [op, v] = a; r = op === '-z' ? v === '' : op === '-n' ? v !== '' : op === '-f' ? ctx.fs.read(ctx.resolve(v)) !== undefined : op === '-d' ? ctx.fs.isDir(ctx.resolve(v)) : op === '-e' ? ctx.fs.exists(ctx.resolve(v)) : false; }
  else if (a.length === 3) { const [x, op, y] = a; const nx = Number(x), ny = Number(y); r = op === '=' || op === '==' ? x === y : op === '!=' ? x !== y : op === '-eq' ? nx === ny : op === '-ne' ? nx !== ny : op === '-lt' ? nx < ny : op === '-le' ? nx <= ny : op === '-gt' ? nx > ny : op === '-ge' ? nx >= ny : false; }
  return neg ? !r : r;
};
C.test = async (ctx, args) => PG.testExpr(ctx, args) ? 0 : 1;
C['['] = async (ctx, args) => { if (args[args.length - 1] !== ']') { ctx.eprintln("[: missing `]'"); return 2; } return PG.testExpr(ctx, args.slice(0, -1)) ? 0 : 1; };
C['[['] = async (ctx, args) => { if (args[args.length - 1] !== ']]') { ctx.eprintln("[[: missing `]]'"); return 2; } return PG.testExpr(ctx, args.slice(0, -1)) ? 0 : 1; };
C.tour = async ctx => { if (PG.startTour) PG.startTour(0); else ctx.println('(the tour runs in the browser page: press the ▶ Tour button)'); };
C.less = C.more = async (ctx, args) => C.cat(ctx, args);
C.seq = async (ctx, args) => { const n = args.map(Number); const [a, st, b] = n.length === 1 ? [1, 1, n[0]] : n.length === 2 ? [n[0], 1, n[1]] : n; const out = []; for (let i = a; st > 0 ? i <= b : i >= b; i += st) out.push(i); ctx.println(out.join('\n')); };
C.read = async (ctx, args) => { const names = args.filter(a => !a.startsWith('-')); const line = (ctx.stdin || '').split('\n')[0]; const parts = line.split(/\s+/); names.forEach((n, i) => { const v = i === names.length - 1 ? parts.slice(i).join(' ') : parts[i] || ''; ctx.sh.vars[n] = v; ctx.sh.env[n] = v; }); return line === '' && !ctx.stdin ? 1 : 0; };
C.alias = async (ctx, args) => { if (!args.length) { for (const [k, v] of Object.entries(ctx.sh.aliases)) ctx.println(`alias ${k}='${v}'`); return 0; } for (const a of args) { const i = a.indexOf('='); if (i < 0) { const v = ctx.sh.aliases[a]; if (v) ctx.println(`alias ${a}='${v}'`); else { ctx.eprintln(`alias: ${a}: not found`); return 1; } } else ctx.sh.aliases[a.slice(0, i)] = a.slice(i + 1); } return 0; };
C.unalias = async (ctx, args) => { for (const a of args) delete ctx.sh.aliases[a]; };
C.tee = async (ctx, args) => { const o = PG.opts(args); const t = ctx.stdin || ''; for (const f of o.rest) { const p = ctx.resolve(f); ctx.fs.write(p, (o.flags.has('a') ? ctx.fs.read(p) || '' : '') + t); } ctx.out(t); };
C.cut = async (ctx, args) => {
  let d = '\t', f = null, c = null; const files = [];
  for (let i = 0; i < args.length; i++) { const a = args[i]; if (a === '-d') d = args[++i]; else if (a.startsWith('-d')) d = a.slice(2); else if (a === '-f') f = args[++i]; else if (a.startsWith('-f')) f = a.slice(2); else if (a === '-c') c = args[++i]; else if (a.startsWith('-c')) c = a.slice(2); else files.push(a); }
  const t = await readIn(ctx, files, 'cut'); if (t === null) return 1; const ranges = spec => spec.split(',').map(r => { const m = /^(\d*)-?(\d*)$/.exec(r); const hasDash = r.includes('-'); const a = m[1] ? Number(m[1]) : 1; const b = hasDash ? (m[2] ? Number(m[2]) : Infinity) : a; return [a, b]; });
  const pick = (arr, rs) => arr.filter((_, i) => rs.some(([a, b]) => i + 1 >= a && i + 1 <= b));
  const lines = t.split('\n'); if (lines[lines.length - 1] === '') lines.pop();
  ctx.println(lines.map(l => c ? pick(l.split(''), ranges(c)).join('') : pick(l.split(d), ranges(f || '1')).join(d)).join('\n'));
};
C.find = async (ctx, args) => {
  const o = []; let start = '.'; let name = null, type = null; for (let i = 0; i < args.length; i++) { if (args[i] === '-name' || args[i] === '-iname') name = args[++i]; else if (args[i] === '-type') type = args[++i]; else if (!args[i].startsWith('-') && i === 0) start = args[i]; }
  const base = ctx.resolve(start); const re = name ? new RegExp('^' + name.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$') : null;
  const rel = p => start.startsWith('/') || start.startsWith('~') ? p : (start === '.' ? '.' + p.slice(base.length) : start + p.slice(base.length));
  const all = [...ctx.fs.dirs].filter(d => d === base || d.startsWith(base + '/')).map(p => ({ p, d: true })).concat(Object.keys(ctx.fs.files).filter(f => f.startsWith(base + '/') || f === base).map(p => ({ p, d: false })));
  all.sort((a, b) => a.p.localeCompare(b.p)); const res = all.filter(x => (!type || (type === 'd') === x.d) && (!re || re.test(x.p.split('/').pop()))).map(x => rel(x.p));
  if (res.length) ctx.println(res.join('\n'));
};
C.xargs = async (ctx, args) => {
  let n = 0, repl = null; const cmd = []; for (let i = 0; i < args.length; i++) { if (args[i] === '-n') n = Number(args[++i]); else if (/^-n\d+$/.test(args[i])) n = Number(args[i].slice(2)); else if (args[i] === '-I') repl = args[++i]; else if (args[i].startsWith('-I')) repl = args[i].slice(2); else cmd.push(args[i]); }
  if (!cmd.length) cmd.push('echo'); const items = (ctx.stdin || '').split(repl ? '\n' : /\s+/).filter(Boolean); const q = x => "'" + String(x).replace(/'/g, "'\\''") + "'"; const sink = { write: s => ctx.out(s) }; const runs = [];
  if (repl) for (const it of items) runs.push(cmd.map(c => c.split(repl).join(it)).join(' ')); else if (n) for (let i = 0; i < items.length; i += n) runs.push(cmd.join(' ') + ' ' + items.slice(i, i + n).map(q).join(' ')); else runs.push(cmd.join(' ') + ' ' + items.map(q).join(' '));
  for (const r of runs) await ctx.sh.runScript(r, sink);
};
C.watch = async (ctx, args) => {
  let secs = 2; const rest = [...args]; while (rest[0] && rest[0].startsWith('-')) { if (rest[0] === '-n') { secs = Number(rest[1]) || 2; rest.splice(0, 2); } else rest.shift(); }
  const cmd = rest.join(' '); if (!cmd) { ctx.eprintln('watch: no command'); return 1; }
  while (true) { let buf = ''; await ctx.sh.runScript(cmd, { write: s => { buf += s; } }); ctx.clear(); ctx.println(`Every ${secs.toFixed(1)}s: ${cmd}    ${new Date(PG.BASE_TIME + ctx.sim.clock * 1000).toUTCString().slice(17, 25)}\n`); ctx.out(buf); await ctx.sleep(secs); }
};
const fmtDate = (fmt, t) => { const d = new Date(PG.BASE_TIME + t * 1000); const p = (n, w = 2) => String(n).padStart(w, '0'); const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], mons = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return fmt.replace(/%([YmdHMSsFTZaAbBejy%])/g, (m, c) => ({ Y: d.getUTCFullYear(), m: p(d.getUTCMonth() + 1), d: p(d.getUTCDate()), e: String(d.getUTCDate()).padStart(2), H: p(d.getUTCHours()), M: p(d.getUTCMinutes()), S: p(d.getUTCSeconds()), s: Math.floor(d.getTime() / 1000), F: `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`, T: `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`, Z: 'UTC', a: days[d.getUTCDay()].slice(0, 3), A: days[d.getUTCDay()], b: mons[d.getUTCMonth()].slice(0, 3), B: mons[d.getUTCMonth()], y: p(d.getUTCFullYear() % 100), j: p(Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5), 3), '%': '%' }[c])); };
C.date = async (ctx, args) => { const f = args.find(a => a.startsWith('+')); ctx.println(f ? fmtDate(f.slice(1), ctx.sim.clock) : fmtDate('%a %b %e %T UTC %Y', ctx.sim.clock)); };
C.sort = async (ctx, args) => { const o = PG.opts(args); const t = await readIn(ctx, o.rest, 'sort'); if (t === null) return 1; let l = t.split('\n'); if (l[l.length - 1] === '') l.pop(); if (o.flags.has('n')) l.sort((a, b) => parseFloat(a) - parseFloat(b)); else l.sort(); if (o.flags.has('u')) l = l.filter((x, i) => i === 0 || x !== l[i - 1]); if (o.flags.has('r')) l.reverse(); ctx.println(l.join('\n')); };
C.uniq = async (ctx, args) => { const o = PG.opts(args); const l = (ctx.stdin || '').split('\n'); if (l[l.length - 1] === '') l.pop(); const out = []; for (const x of l) { if (out.length && out[out.length - 1][0] === x) out[out.length - 1][1]++; else out.push([x, 1]); } ctx.println(out.map(([x, n]) => o.flags.has('c') ? String(n).padStart(4) + ' ' + x : x).join('\n')); };
C.wc = async (ctx, args) => { const o = PG.opts(args); const t = await readIn(ctx, o.rest, 'wc'); if (t === null) return 1; const lines = (t.match(/\n/g) || []).length, words = t.split(/\s+/).filter(Boolean).length; if (o.flags.has('l')) ctx.println(String(lines).padStart(8)); else if (o.flags.has('w')) ctx.println(String(words).padStart(8)); else if (o.flags.has('c')) ctx.println(String(t.length).padStart(8)); else ctx.println(`${String(lines).padStart(8)}${String(words).padStart(8)}${String(t.length).padStart(8)}`); };

/* ---- sed: s///, addresses (N, N,M, $, /re/, /re/,/re/), p, d, -n, -e, -i ---- */
C.sed = async (ctx, args) => {
  let inplace = false, quiet = false; const scripts = []; const files = [];
  for (let i = 0; i < args.length; i++) { const a = args[i]; if (a === '-i') { inplace = true; if (args[i + 1] === '') i++; } else if (a === '-n') quiet = true; else if (a === '-e') scripts.push(args[++i]); else if (a === '-E' || a === '-r') { } else if (!scripts.length) scripts.push(a); else files.push(a); }
  const progs = []; for (const sc of scripts) for (const part of sc.split(/;|\n/).map(x => x.trim()).filter(Boolean)) {
    let rest = part, addr = null; const rx = /^\/((?:[^\/\\]|\\.)*)\//; const num = /^(\d+|\$)/; const parseA = () => { let m; if ((m = rx.exec(rest))) { rest = rest.slice(m[0].length); return { re: new RegExp(m[1]) }; } if ((m = num.exec(rest))) { rest = rest.slice(m[0].length); return { n: m[1] === '$' ? Infinity : Number(m[1]) }; } return null; };
    const a1 = parseA(); if (a1) { if (rest[0] === ',') { rest = rest.slice(1); const a2 = parseA(); addr = { a1, a2 }; } else addr = { a1 }; }
    const m2 = /^s(.)(.*?)\1(.*?)\1([gI]*)$/.exec(rest); if (m2) progs.push({ addr, cmd: 's', re: new RegExp(m2[2], (m2[4].includes('g') ? 'g' : '') + (m2[4].includes('I') ? 'i' : '')), rep: m2[3].replace(/\\n/g, '\n') }); else if (rest === 'p' || rest === 'd') progs.push({ addr, cmd: rest }); else { ctx.eprintln('sed: unsupported command: ' + part + ' (supported: s///, p, d, with line/regex addresses)'); return 1; } }
  const apply = t => { const lines = t.split('\n'); const trail = lines[lines.length - 1] === ''; if (trail) lines.pop(); const out = []; const active = progs.map(() => false);
    lines.forEach((line, idx) => { const n = idx + 1; let cur = line, printed = false, deleted = false;
      progs.forEach((pr, k) => { if (deleted) return; let on = true; if (pr.addr) { const { a1, a2 } = pr.addr; const hit1 = a1.re ? a1.re.test(cur) : (a1.n === Infinity ? n === lines.length : n === a1.n); if (!a2) on = hit1; else { if (!active[k] && hit1) active[k] = true, on = true; else on = active[k]; if (active[k]) { const end = a2.re ? a2.re.test(cur) && !(a1.re && hit1 && a2.re.source === a1.re.source && !active[k]) : (a2.n === Infinity ? n === lines.length : n >= a2.n); if (end && !(hit1 && n === idx + 1 && a2.re && false)) active[k] = false; } } }
        if (!on) return; if (pr.cmd === 'd') { deleted = true; } else if (pr.cmd === 'p') { out.push(cur); } else if (pr.cmd === 's') cur = cur.replace(pr.re, pr.rep); });
      if (!deleted && !quiet) out.push(cur); });
    return out.join('\n') + (out.length ? '\n' : ''); };
  if (inplace || files.length) { for (const f of files) { const p = ctx.resolve(f); const c = ctx.fs.read(p); if (c === undefined) { ctx.eprintln(`sed: ${f}: No such file or directory`); return 1; } if (inplace) ctx.fs.write(p, apply(c)); else ctx.out(apply(c)); } } else ctx.out(apply(ctx.stdin || ''));
};
/* ---- awk (a practical subset) ---- */
PG.awk = (prog, input, FS) => {
  const rules = []; let i = 0; const P = prog;
  const skipWs = () => { while (i < P.length && /[\s;]/.test(P[i])) i++; };
  const readBlock = () => { let d = 0, q = null, st = i; for (; i < P.length; i++) { const c = P[i]; if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; } if (c === '"') q = c; else if (c === '{') d++; else if (c === '}') { d--; if (d === 0) { i++; return P.slice(st + 1, i - 1); } } } return P.slice(st + 1); };
  while (skipWs(), i < P.length) { let pat = ''; while (i < P.length && P[i] !== '{') { if (P[i] === '/') { const j = P.indexOf('/', i + 1); pat += P.slice(i, j + 1); i = j + 1; } else pat += P[i++]; } pat = pat.trim(); let body = null; if (P[i] === '{') body = readBlock(); rules.push({ pat, body }); }
  const vars = {}; let NR = 0, F = [''];
  const tokenize = s => s.match(/"(?:[^"\\]|\\.)*"|\/(?:[^\/\\]|\\.)+\/|\$|\d+\.?\d*|[A-Za-z_]\w*|==|!=|<=|>=|&&|\|\||!~|\+\+|--|\+=|-=|\*=|\/=|[-+*\/%()<>=!~,?:]/g) || [];
  const num = v => { const n = Number(v); return v === '' || v === undefined || isNaN(n) ? 0 : n; };
  const isNum = v => typeof v === 'number' || (v !== '' && !isNaN(Number(v)));
  const evalExpr = (src) => {
    const t = tokenize(src); let p = 0;
    const prim = () => { const x = t[p++]; if (x === undefined) return ''; if (x === '(') { const v = ternary(); p++; return v; } if (x === '$') { const idx = prim(); const n = typeof idx === 'number' ? idx : num(idx); return n === 0 ? F[0] : (F[n] === undefined ? '' : F[n]); } if (x === '-') return -num(prim()); if (x === '!') return prim() ? 0 : 1; if (x[0] === '"') return x.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"'); if (x[0] === '/') return new RegExp(x.slice(1, -1)).test(F[0]) ? 1 : 0; if (/^\d/.test(x)) return Number(x); if (x === 'NR') return NR; if (x === 'NF') return F.length - 1; if (t[p] === '(') { p++; const args = []; if (t[p] !== ')') { do { args.push(ternary()); } while (t[p] === ',' && ++p); } p++; return ({ length: a => String(a === undefined ? F[0] : a).length, toupper: a => String(a).toUpperCase(), tolower: a => String(a).toLowerCase(), substr: (a, b, c) => String(a).substr(num(b) - 1, c === undefined ? undefined : num(c)), int: a => Math.trunc(num(a)), sqrt: a => Math.sqrt(num(a)) }[x] || (() => ''))(...args); } if (t[p] === '++' || t[p] === '--') { const v = num(vars[x]); vars[x] = v + (t[p++] === '++' ? 1 : -1); return v; } return vars[x] === undefined ? '' : vars[x]; };
    const mul = () => { let v = prim(); while (['*', '/', '%'].includes(t[p])) { const o = t[p++]; const r = num(prim()); v = o === '*' ? num(v) * r : o === '/' ? num(v) / r : num(v) % r; } return v; };
    const add = () => { let v = mul(); while (['+', '-'].includes(t[p])) { const o = t[p++]; const r = num(mul()); v = o === '+' ? num(v) + r : num(v) - r; } return v; };
    const concat = () => { let v = add(); while (p < t.length && !['==', '!=', '<=', '>=', '<', '>', '&&', '||', ')', ',', '~', '!~', '?', ':', '='].includes(t[p]) && !['+=', '-=', '*=', '/='].includes(t[p])) v = String(v) + String(add()); return v; };
    const cmp = () => { let v = concat(); while (['==', '!=', '<=', '>=', '<', '>', '~', '!~'].includes(t[p])) { const o = t[p++]; const r = concat(); if (o === '~' || o === '!~') { const hit = new RegExp(String(r)).test(String(v)); v = (o === '~') === hit ? 1 : 0; } else { const both = isNum(v) && isNum(r); const a = both ? num(v) : String(v), b = both ? num(r) : String(r); v = ({ '==': a === b, '!=': a !== b, '<=': a <= b, '>=': a >= b, '<': a < b, '>': a > b }[o]) ? 1 : 0; } } return v; };
    const and = () => { let v = cmp(); while (t[p] === '&&') { p++; const r = cmp(); v = v && r ? 1 : 0; } return v; };
    const or = () => { let v = and(); while (t[p] === '||') { p++; const r = and(); v = v || r ? 1 : 0; } return v; };
    const ternary = () => { const c = or(); if (t[p] === '?') { p++; const a = ternary(); p++; const b = ternary(); return c ? a : b; } return c; };
    return ternary();
  };
  const splitCommas = s => { const out = []; let d = 0, q = null, cur = ''; for (let k = 0; k < s.length; k++) { const c = s[k]; if (q) { cur += c; if (c === '\\') cur += s[++k]; else if (c === q) q = null; continue; } if (c === '"') { q = c; cur += c; continue; } if (c === '(') d++; if (c === ')') d--; if (c === ',' && d === 0) { out.push(cur); cur = ''; continue; } cur += c; } out.push(cur); return out; };
  const stmts = body => { const out = []; let cur = '', q = null, d = 0; for (let k = 0; k < body.length; k++) { const c = body[k]; if (q) { cur += c; if (c === '\\') cur += body[++k]; else if (c === q) q = null; continue; } if (c === '"') { q = c; cur += c; continue; } if (c === '{') d++; if (c === '}') d--; if ((c === ';' || c === '\n') && d === 0) { out.push(cur); cur = ''; continue; } cur += c; } out.push(cur); return out.map(x => x.trim()).filter(Boolean); };
  let out = '';
  const run = body => { for (const st of stmts(body)) { let m; if ((m = /^print(?:\s+(.*))?$/.exec(st))) out += (m[1] ? splitCommas(m[1]).map(x => String(evalExpr(x))).join(' ') : F[0]) + '\n'; else if ((m = /^printf\s+(.*)$/.exec(st))) { const a = splitCommas(m[1]); const f = String(evalExpr(a[0])); let k = 1; out += f.replace(/%(-?\d*)(s|d|f)/g, (mm, w, c) => { const v = a[k] !== undefined ? evalExpr(a[k++]) : ''; return String(c === 'd' ? Math.trunc(num(v)) : v).padStart(Math.abs(Number(w)) || 0); }); } else if ((m = /^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|=)\s*(.*)$/.exec(st))) { const v = evalExpr(m[3]); vars[m[1]] = m[2] === '=' ? v : m[2] === '+=' ? num(vars[m[1]]) + num(v) : m[2] === '-=' ? num(vars[m[1]]) - num(v) : m[2] === '*=' ? num(vars[m[1]]) * num(v) : num(vars[m[1]]) / num(v); } else if ((m = /^([A-Za-z_]\w*)(\+\+|--)$/.exec(st))) vars[m[1]] = num(vars[m[1]]) + (m[2] === '++' ? 1 : -1); } };
  const sep = FS === undefined ? null : FS; const lines = input.split('\n'); if (lines[lines.length - 1] === '') lines.pop();
  for (const r of rules) if (r.pat === 'BEGIN') run(r.body || '');
  for (const l of lines) { NR++; F = [l, ...(sep === null || sep === ' ' ? l.trim().split(/\s+/).filter(Boolean) : l.split(sep.length === 1 ? sep : new RegExp(sep)))]; for (const r of rules) { if (r.pat === 'BEGIN' || r.pat === 'END') continue; let ok = true; if (r.pat) ok = /^\/.*\/$/.test(r.pat) ? new RegExp(r.pat.slice(1, -1)).test(l) : !!evalExpr(r.pat); if (ok) { if (r.body === null) out += l + '\n'; else run(r.body); } } }
  for (const r of rules) if (r.pat === 'END') run(r.body || '');
  return out;
};
C.awk = async (ctx, args) => { let FS; const rest = []; for (let i = 0; i < args.length; i++) { if (args[i] === '-F') FS = args[++i]; else if (args[i].startsWith('-F')) FS = args[i].slice(2); else rest.push(args[i]); } const prog = rest.shift(); if (!prog) { ctx.eprintln('usage: awk [-F fs] program [file ...]'); return 2; } const t = await readIn(ctx, rest, 'awk'); if (t === null) return 2; try { ctx.out(PG.awk(prog, t, FS)); } catch (e) { ctx.eprintln('awk: syntax error: ' + e.message); return 2; } };

/* ---- jq (a practical subset: paths, .[], select, map, object/array construction, length, keys, join, sort, unique, first/last, add, not, test, has, type, tostring, to_entries) ---- */
PG.jq = (filter, data) => {
  const splitTopJ = (s, sep) => { const out = []; let cur = '', d = 0, q = null; for (let i = 0; i < s.length; i++) { const c = s[i]; if (q) { cur += c; if (c === '\\') cur += s[++i]; else if (c === q) q = null; continue; } if (c === '"') { q = c; cur += c; continue; } if ('([{'.includes(c)) d++; if (')]}'.includes(c)) d--; if (d === 0 && s.startsWith(sep, i)) { out.push(cur); cur = ''; i += sep.length - 1; continue; } cur += c; } out.push(cur); return out; };
  const truthy = v => v !== null && v !== false && v !== undefined;
  const ev = (src, v) => {
    src = src.trim(); if (src === '') return [v];
    const pipes = splitTopJ(src, '|'); if (pipes.length > 1) return pipes.reduce((vals, st) => vals.flatMap(x => ev(st, x)), [v]);
    const ors = splitTopJ(src, ' or '); if (ors.length > 1) return [ors.some(o => ev(o, v).some(truthy))];
    const ands = splitTopJ(src, ' and '); if (ands.length > 1) return [ands.every(o => ev(o, v).some(truthy))];
    for (const op of ['==', '!=', '>=', '<=', '>', '<']) { const parts = splitTopJ(src, ' ' + op + ' '); if (parts.length === 2) { const a = ev(parts[0], v)[0], b = ev(parts[1], v)[0]; return [({ '==': JSON.stringify(a) === JSON.stringify(b), '!=': JSON.stringify(a) !== JSON.stringify(b), '>': a > b, '<': a < b, '>=': a >= b, '<=': a <= b })[op]]; } }
    let m;
    if (src === '.') return [v];
    if (/^-?\d+(\.\d+)?$/.test(src)) return [Number(src)]; if (src[0] === '"' && src[src.length - 1] === '"') return [JSON.parse(src)]; if (src === 'null') return [null]; if (src === 'true') return [true]; if (src === 'false') return [false];
    if (src[0] === '[' && src[src.length - 1] === ']' && !/^\[\d*\]$/.test(src)) return [ev(src.slice(1, -1), v).flat ? ev(src.slice(1, -1), v) : []];
    if (src[0] === '{' && src[src.length - 1] === '}') { const o = {}; for (const pair of splitTopJ(src.slice(1, -1), ',')) { const kv = splitTopJ(pair, ':'); if (kv.length === 1) { const k = kv[0].trim().replace(/^\./, ''); o[k] = (v || {})[k]; } else { const k = kv[0].trim().replace(/^"|"$/g, ''); o[k] = ev(kv.slice(1).join(':'), v)[0]; } } return [o]; }
    if ((m = /^select\((.*)\)$/.exec(src))) return ev(m[1], v).some(truthy) ? [v] : [];
    if ((m = /^map\((.*)\)$/.exec(src))) return [(Array.isArray(v) ? v : Object.values(v)).flatMap(x => ev(m[1], x))];
    if ((m = /^test\("(.*)"\)$/.exec(src))) return [new RegExp(m[1]).test(String(v))];
    if ((m = /^join\("(.*)"\)$/.exec(src))) return [(v || []).join(m[1])];
    if ((m = /^has\("(.*)"\)$/.exec(src))) return [v !== null && typeof v === 'object' && m[1] in v];
    if (src === 'length') return [v === null ? 0 : typeof v === 'string' || Array.isArray(v) ? v.length : typeof v === 'object' ? Object.keys(v).length : Math.abs(v)];
    if (src === 'keys') return [Array.isArray(v) ? v.map((_, i) => i) : Object.keys(v).sort()];
    if (src === 'not') return [!truthy(v)]; if (src === 'first') return [v[0]]; if (src === 'last') return [v[v.length - 1]]; if (src === 'add') return [v.reduce((a, b) => a === null ? b : typeof a === 'number' ? a + b : Array.isArray(a) ? a.concat(b) : typeof a === 'string' ? a + b : { ...a, ...b }, null)];
    if (src === 'sort') return [[...v].sort()]; if (src === 'unique') return [[...new Set(v.map(x => JSON.stringify(x)))].map(x => JSON.parse(x))]; if (src === 'tostring') return [typeof v === 'string' ? v : JSON.stringify(v)]; if (src === 'type') return [v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v === 'object' ? 'object' : typeof v];
    if (src === 'to_entries') return [Object.entries(v).map(([key, value]) => ({ key, value }))];
    if (src[0] === '.') { // path: .a.b[0][]?
      let cur = [v]; const re = /\.\.?([A-Za-z_][\w-]*|"[^"]*")|\[("[^"]*"|-?\d+)?\]|\.\[("[^"]*"|-?\d+)?\]/y; let pos = 0, mm;
      while (pos < src.length && (re.lastIndex = pos, (mm = re.exec(src)))) { pos = re.lastIndex; if (src[pos] === '?') pos++; const name = mm[1], idx = mm[2] !== undefined ? mm[2] : mm[3]; const isBracket = mm[0].includes('['); cur = cur.flatMap(x => { if (name !== undefined) return [x === null || x === undefined ? null : x[name.replace(/^"|"$/g, '')] === undefined ? null : x[name.replace(/^"|"$/g, '')]]; if (isBracket && idx === undefined) return Array.isArray(x) ? x : x && typeof x === 'object' ? Object.values(x) : []; const k = idx[0] === '"' ? JSON.parse(idx) : Number(idx); return [x === null ? null : x[k < 0 && Array.isArray(x) ? x.length + k : k] ?? null]; }); }
      if (pos < src.length) throw new Error('unsupported expression: ' + src.slice(pos)); return cur;
    }
    throw new Error('unsupported filter: ' + src);
  };
  return ev(filter, data);
};
C.jq = async (ctx, args) => {
  const raw = args.includes('-r') || args.includes('--raw-output'), compact = args.includes('-c'); const rest = args.filter(a => !a.startsWith('-') || a === '-'); const filter = rest.shift() || '.'; const t = await readIn(ctx, rest, 'jq'); if (t === null) return 2;
  let data; try { data = JSON.parse(t); } catch (e) { ctx.eprintln('jq: error: input is not valid JSON (try: kubectl … -o json | jq …)'); return 2; }
  let res; try { res = PG.jq(filter, data); } catch (e) { ctx.eprintln('jq: error: ' + e.message + ' (the playground supports a practical subset of jq)'); return 3; }
  for (const r of res) ctx.println(raw && typeof r === 'string' ? r : compact ? JSON.stringify(r) : JSON.stringify(r, null, 2));
};
delete C.xargs.stub;
if (typeof module !== 'undefined') module.exports = PG;
