/* ------------------------------------------------------------ virtual FS --- */
PG.FS = class {
  constructor() { this.files = {}; this.dirs = new Set(['/', '/home', '/home/user', '/tmp', '/etc']); this.onChange = null; this.mt = {}; this.stamp = null; }
  changed() { if (this.onChange) this.onChange(); }
  snapshot() { return { v: 1, files: this.files, dirs: [...this.dirs], mt: this.mt }; }
  restore(snap) { this.files = { ...(snap.files || {}) }; this.mt = { ...(snap.mt || {}) }; this.dirs = new Set(['/', '/home', '/home/user', '/tmp', '/etc', ...(snap.dirs || [])]); }
  norm(path, cwd) {
    if (!path.startsWith('/')) path = (cwd || '/') + '/' + path;
    const out = []; for (const p of path.split('/')) { if (!p || p === '.') continue; if (p === '..') out.pop(); else out.push(p); }
    return '/' + out.join('/');
  }
  exists(p) { return p in this.files || this.dirs.has(p); }
  isDir(p) { return this.dirs.has(p); }
  read(p) { return this.files[p]; }
  write(p, content) { const d = p.slice(0, p.lastIndexOf('/')) || '/'; this.mkdirp(d, true); this.files[p] = content; if (this.stamp) this.mt[p] = this.stamp(); this.changed(); }
  mkdirp(p, quiet) { let cur = ''; for (const part of p.split('/').filter(Boolean)) { cur += '/' + part; this.dirs.add(cur); } this.dirs.add('/'); if (!quiet) this.changed(); }
  list(p) { const pre = p === '/' ? '/' : p + '/'; const names = new Set();
    for (const f of Object.keys(this.files)) if (f.startsWith(pre)) names.add(f.slice(pre.length).split('/')[0]);
    for (const d of this.dirs) if (d.startsWith(pre) && d !== p) names.add(d.slice(pre.length).split('/')[0]);
    return [...names].sort(); }
  remove(p, recursive) {
    let n = 0; if (p in this.files) { delete this.files[p]; n++; }
    if (this.dirs.has(p)) { if (!recursive && this.list(p).length) return -1; for (const f of Object.keys(this.files)) if (f.startsWith(p + '/')) { delete this.files[f]; n++; } for (const d of [...this.dirs]) if (d === p || d.startsWith(p + '/')) { this.dirs.delete(d); n++; } }
    this.changed(); return n;
  }
};

/* ------------------------------------------------------------------ shell -- */
PG.Shell = class {
  constructor(sim, term) {
    this.sim = sim; this.term = term; this.env = { HOME: '/home/user', USER: 'user', PWD: '/home/user', KUBECONFIG: '' };
    this.cwd = '/home/user'; this.history = []; this.aborted = false; this.busy = false; this.buf = null; this.hd = null; this.vars = {};
    this.aliases = { kc: 'kubectl', k: 'kubectl' };
  }
  get fs() { return this.fsOverride || this.sim.fs; }
  prompt() { if (this.session) return this.session.prompt(); if (this.promptFn) return this.buf !== null ? '> ' : this.promptFn(); const d = this.cwd === '/home/user' ? '~' : this.cwd.startsWith('/home/user/') ? '~' + this.cwd.slice(9) : this.cwd; return this.buf !== null ? '> ' : `user@playground:${d}$ `; }
  abort() { this.aborted = true; if (this.session) this.session.aborted = true; this.sim.wake(); }

  /* ---- accumulate a (possibly multi-line) command, run when complete ---- */
  async submit(line) {
    if (this.session) { const r = await this.session.submit(line); if (this.session.pod) PG.syncVols(this.session.pod.cl, this.session.pod.pod, this.session.pod.container); if (this.session && this.session.exitRequested) { const done = this.session.onExit; this.session = null; if (done) done(); this.term.print('exit', 'dim'); } return r; }
    if (this.buf === null) this.buf = line; else this.buf += '\n' + line;
    if (this.needsMore(this.buf)) return false;
    const text = this.buf; this.buf = null;
    if (text.trim() === '') return true;
    this.history.push(text.split('\n')[0] + (text.includes('\n') ? ' …' : ''));
    this.busy = true; this.aborted = false;
    try { await this.runScript(text, null); } catch (e) { if (!(e && e.abort)) this.term.print('playground: internal error: ' + (e && e.stack || e), 'err'); }
    this.busy = false; this.aborted = false; this.sim.notify();
    return true;
  }
  needsMore(text) {
    const lines = text.split('\n'); let hd = null; let inFunc = false; let q = null; const plain = [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (hd) { if (l.trim() === hd) hd = null; continue; }
      const m = /<<-?\s*(['"]?)([A-Za-z_]\w*)\1/.exec(l); if (m && !/^\s*#/.test(l)) hd = m[2];
      if (/^\s*[\w-]+\(\)\s*\{\s*$/.test(l)) inFunc = true; if (inFunc && /^\}\s*$/.test(l)) inFunc = false;
      plain.push(l);
      for (let k = 0; k < l.length; k++) { const c = l[k]; if (q) { if (c === '\\' && q === '"') k++; else if (c === q) q = null; } else if (c === "'" || c === '"') q = c; else if (c === '#' && (k === 0 || /\s/.test(l[k - 1]))) break; else if (c === '\\') k++; }
      if (i === lines.length - 1 && /\\$/.test(l) && !hd) return true;
    }
    return !!(hd || (!q && this.compoundDepth(plain.join('\n')) > 0) || inFunc || q);
  }

  /* ---- statements ---- */
  splitStatements(text) {
    const lines = text.split('\n'); const out = []; let i = 0;
    while (i < lines.length) {
      let stmt = lines[i++];
      while (/\\$/.test(stmt) && i < lines.length) stmt = stmt.slice(0, -1) + ' ' + lines[i++].trim();
      if (/^\s*[\w-]+\(\)\s*\{\s*$/.test(stmt)) { const name = stmt.trim().split('(')[0]; const body = []; while (i < lines.length && !/^\}\s*$/.test(lines[i])) body.push(lines[i++]); i++; out.push({ func: name, body: body.join('\n') }); continue; }
      if (this.splitTop(stmt).some(x => /^(if|while)\b/.test(x) || /^for\s+\w+\s+in\b/.test(x))) { const all = [stmt]; while (this.compoundDepth(all.join('\n')) > 0 && i < lines.length) { let l = lines[i++]; while (/\\$/.test(l) && i < lines.length) l = l.slice(0, -1) + ' ' + lines[i++].trim(); all.push(l); } out.push({ compound: all.join('\n') }); continue; }
      const m = /<<-?\s*(['"]?)([A-Za-z_]\w*)\1/.exec(stmt);
      if (m) { const body = []; while (i < lines.length && lines[i].trim() !== m[2]) body.push(lines[i++]); i++; out.push({ text: stmt.replace(m[0], ' <<HEREDOC '), heredoc: { quoted: m[1] !== '', body: body.join('\n') + (body.length ? '\n' : '') } }); continue; }
      out.push({ text: stmt });
    }
    return out;
  }
  async runScript(text, sink) {
    let last = 0;
    for (const st of this.splitStatements(text)) {
      if (this.aborted) throw { abort: true }; if (this.exitRequested) break;
      if (st.func) { this.defineFunc(st); last = 0; continue; }
      if (st.compound) { last = await this.runCompound(st.compound, sink); continue; }
      last = await this.runLine(st.text, st.heredoc, sink);
    }
    return last;
  }
  defineFunc(st) { if (st.func === 'helm2') this.term.print('(helm2 is already built into the playground — no need to define it)', 'dim'); else { this.funcs = this.funcs || {}; this.funcs[st.func] = st.body; this.term.print(`function ${st.func} defined`, 'dim'); } }
  /* ---- compound commands: if / elif / else / fi, while … do … done, for … in … do … done (nestable) ---- */
  splitTop(text) { // split on ; and newlines that are outside quotes and $( )
    const out = []; let cur = '', q = null, depth = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { cur += c; if (c === '\\' && q === '"') cur += text[++i] || ''; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { q = c; cur += c; continue; }
      if (c === '\\') { cur += c + (text[++i] || ''); continue; }
      if (c === '#' && depth === 0 && (cur === '' || /\s$/.test(cur))) { while (i < text.length && text[i] !== '\n') i++; i--; continue; }
      if (c === '(') depth++; else if (c === ')') depth = Math.max(0, depth - 1);
      if (depth === 0 && (c === ';' || c === '\n')) { out.push(cur); cur = ''; continue; }
      cur += c;
    }
    out.push(cur); return out.map(x => x.trim()).filter(Boolean);
  }
  compoundDepth(text) { let d = 0; for (const st of this.splitTop(text)) { const w = /^(\w+)/.exec(st); if (!w) continue; const k = w[1]; if (k === 'if' || k === 'while' || (k === 'for' && /^for\s+\w+\s+in\b/.test(st))) d++; else if (k === 'fi' || k === 'done') d--; } return d; }
  parseCompound(stmts, i, stops) {
    const nodes = []; const kwOf = x => { const m = /^(\w+)/.exec(x.trim()); return m ? m[1] : ''; }; const drop = (idx, kw) => { stmts[idx] = stmts[idx].trim().slice(kw.length).trim(); };
    while (i < stmts.length) {
      const st = stmts[i].trim(); if (!st) { i++; continue; }
      const kw = kwOf(st); if (stops.includes(kw)) return { nodes, i };
      if (kw === 'if') {
        drop(i, 'if'); const clauses = []; let els = null;
        let r = this.parseCompound(stmts, i, ['then']); let cond = r.nodes; i = r.i; if (i >= stmts.length) throw new Error("expected 'then'"); drop(i, 'then');
        r = this.parseCompound(stmts, i, ['elif', 'else', 'fi']); clauses.push({ cond, body: r.nodes }); i = r.i;
        while (true) {
          if (i >= stmts.length) throw new Error("expected 'fi'"); const k = kwOf(stmts[i]);
          if (k === 'elif') { drop(i, 'elif'); r = this.parseCompound(stmts, i, ['then']); cond = r.nodes; i = r.i; if (i >= stmts.length) throw new Error("expected 'then'"); drop(i, 'then'); r = this.parseCompound(stmts, i, ['elif', 'else', 'fi']); clauses.push({ cond, body: r.nodes }); i = r.i; }
          else if (k === 'else') { drop(i, 'else'); r = this.parseCompound(stmts, i, ['fi']); els = r.nodes; i = r.i; }
          else if (k === 'fi') { drop(i, 'fi'); break; } else throw new Error('unexpected ' + k);
        }
        nodes.push({ t: 'if', clauses, els }); continue;
      }
      if (kw === 'while') {
        drop(i, 'while'); let r = this.parseCompound(stmts, i, ['do']); const cond = r.nodes; i = r.i; if (i >= stmts.length) throw new Error("expected 'do'"); drop(i, 'do');
        r = this.parseCompound(stmts, i, ['done']); i = r.i; if (i >= stmts.length) throw new Error("expected 'done'"); drop(i, 'done'); nodes.push({ t: 'while', cond, body: r.nodes }); continue;
      }
      if (kw === 'for' && /^for\s+\w+\s+in\b/.test(st)) {
        const m = /^for\s+(\w+)\s+in\b\s*(.*)$/.exec(st); i++; while (i < stmts.length && !stmts[i].trim()) i++; if (i >= stmts.length || kwOf(stmts[i]) !== 'do') throw new Error("expected 'do'"); drop(i, 'do');
        const r = this.parseCompound(stmts, i, ['done']); i = r.i; if (i >= stmts.length) throw new Error("expected 'done'"); drop(i, 'done'); nodes.push({ t: 'for', name: m[1], list: m[2], body: r.nodes }); continue;
      }
      nodes.push({ t: 'cmd', text: st }); i++;
    }
    return { nodes, i };
  }
  async runCompound(text, sink) {
    let r; try { r = this.parseCompound(this.splitTop(text), 0, []); } catch (e) { this.term.print('playground: syntax error: ' + e.message, 'err'); return 2; }
    return this.execNodes(r.nodes, sink);
  }
  async execNodes(nodes, sink) {
    let last = 0;
    for (const n of nodes) {
      if (this.aborted) throw { abort: true };
      if (n.t === 'cmd') last = await this.runLine(n.text, null, sink);
      else if (n.t === 'if') { let ran = false; for (const c of n.clauses) { if ((await this.execNodes(c.cond, sink)) === 0) { last = await this.execNodes(c.body, sink); ran = true; break; } } if (!ran && n.els) last = await this.execNodes(n.els, sink); else if (!ran) last = 0; }
      else if (n.t === 'while') { let g = 0; while (g++ < 200000) { if (this.aborted) throw { abort: true }; if ((await this.execNodes(n.cond, sink)) !== 0) break; last = await this.execNodes(n.body, sink); if (g % 100 === 0) await new Promise(r => setTimeout(r, 0)); } }
      else if (n.t === 'for') { const words = []; for (const t of lex(n.list)) if (t.t === 'word') words.push(...await this.expandWord(t)); for (const w of words) { this.vars[n.name] = w; last = await this.execNodes(n.body, sink); } }
    }
    return last;
  }

  /* ---- one line: lists of pipelines ---- */
  async runLine(text, heredoc, sink) {
    const toks = lex(text); if (!toks.length) return 0;
    // split into list items on ; && ||
    const items = []; let cur = []; let conn = null;
    for (const t of toks) { if (t.t === 'op' && (t.v === ';' || t.v === '&&' || t.v === '||')) { items.push({ toks: cur, conn }); conn = t.v; cur = []; } else cur.push(t); }
    items.push({ toks: cur, conn });
    const lastI = items[items.length - 1]; const lt = lastI.toks[lastI.toks.length - 1]; if (lt && lt.t === 'op' && lt.v === '&') { this.term.print('(background jobs with & are not supported — open a second terminal tab with the + button and run the next command there)', 'dim'); return 1; }
    let status = 0;
    for (const it of items) {
      if (it.conn === '&&' && status !== 0) continue; if (it.conn === '||' && status === 0) continue;
      if (!it.toks.length) continue;
      status = await this.runPipeline(it.toks, heredoc, sink);
      this.env['?'] = String(status);
    }
    return status;
  }
  async runPipeline(toks, heredoc, sink) {
    const cmds = []; let cur = [];
    for (const t of toks) { if (t.t === 'op' && t.v === '|') { cmds.push(cur); cur = []; } else cur.push(t); }
    cmds.push(cur);
    let stdin = null, status = 0;
    for (let i = 0; i < cmds.length; i++) {
      const last = i === cmds.length - 1; let buf = '';
      const target = last ? sink : { write: s => { buf += s; } };
      status = await this.runCommand(cmds[i], stdin, target, heredoc);
      stdin = buf;
    }
    return status;
  }
  async runCommand(toks, stdin, sink, heredoc) {
    const words = []; const redirs = [];
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (t.t === 'op') { if (t.v === '<<HEREDOC') { redirs.push({ op: 'hd' }); } else if (['>', '>>', '<', '2>', '2>>', '&>'].includes(t.v)) { const tg = toks[++i]; redirs.push({ op: t.v, target: tg }); } else if (t.v === '2>&1') redirs.push({ op: '2>&1' }); continue; }
      words.push(t);
    }
    // assignments
    let ai = 0; const assigns = [];
    while (ai < words.length) { const w = words[ai]; const p0 = w.parts[0]; if (p0 && p0.k === 'lit' && !p0.q && /^[A-Za-z_]\w*=/.test(p0.v)) { assigns.push(w); ai++; } else break; }
    const rest = words.slice(ai);
    if (!rest.length) { for (const a of assigns) { const [k, ...r] = a.parts[0].v.split('='); const first = { ...a.parts[0], v: r.join('=') }; const val = (await this.expandWord({ t: 'word', parts: [first, ...a.parts.slice(1)] }, true)).join(''); this.vars[k] = val; this.env[k] = val; } return 0; }
    let args = []; for (const w of rest) args.push(...await this.expandWord(w));
    while (args[0] === 'sudo') args.shift();
    if (!args.length) return 0;
    // redirections
    let outFile = null, append = false, errNull = false, errToOut = false, inText = stdin;
    for (const r of redirs) {
      if (r.op !== 'hd' && r.op !== '2>&1' && r.op !== '&>' && !(r.target && r.target.t === 'word')) { this.term.print("playground: syntax error near unexpected token `" + (r.target && r.target.v ? r.target.v : 'newline') + "'", 'err'); return 2; }
      if (r.op === 'hd') { inText = heredoc ? (heredoc.quoted ? heredoc.body : (await this.expandText(heredoc.body))) : ''; }
      else if (r.op === '>' || r.op === '>>') { outFile = this.fs.norm((await this.expandWord(r.target)).join(''), this.cwd); append = r.op === '>>'; }
      else if (r.op === '&>') { outFile = '/dev/null'; errNull = true; }
      else if (r.op === '2>' || r.op === '2>>') { const f = (await this.expandWord(r.target)).join(''); if (f === '/dev/null') errNull = true; }
      else if (r.op === '2>&1') errToOut = true;
      else if (r.op === '<') { const f = this.fs.norm((await this.expandWord(r.target)).join(''), this.cwd); const c = this.fs.read(f); if (c === undefined) { this.term.print(`playground: ${(await this.expandWord(r.target)).join('')}: No such file or directory`, 'err'); return 1; } inText = c; }
    }
    let outBuf = '';
    const write = s => { if (s === '') return; if (outFile) outBuf += s; else if (sink) sink.write(s); else this.term.print(s.replace(/\n$/, ''), undefined, true); };
    const ctx = this.makeCtx(inText, write, errNull, errToOut); ctx.tty = !outFile && !sink; // ls prints columns only on a terminal
    if (this.aliases[args[0]]) { const rep = this.aliases[args[0]].split(/\s+/).filter(Boolean); args.splice(0, 1, ...rep); }
    let name = args[0];
    const fn = this.cmdOverride ? (Object.prototype.hasOwnProperty.call(this.cmdOverride, name) ? this.cmdOverride[name] : undefined) : PG.commands[name];
    let code;
    if (this.funcs && this.funcs[name]) { code = await this.runScript(this.funcs[name].replace(/"\$@"|\$@/g, args.slice(1).join(' ')), sink); }
    else if (!fn) { if (this.lenient) code = 0; else { ctx.eprintln(this.notFoundMsg ? this.notFoundMsg(args[0]) : `playground: command not found: ${args[0]}` + PG.suggest(args[0])); code = 127; } }
    else {
      try { code = await fn(ctx, args.slice(1)); if (code === undefined) code = 0; }
      catch (e) { if (e && e.abort) { throw e; } ctx.eprintln('playground: ' + name + ': internal error: ' + (e && e.stack || e)); code = 1; }
    }
    if (outFile && outFile !== '/dev/null') { const old = append ? (this.fs.read(outFile) || '') : ''; this.fs.write(outFile, old + outBuf); }
    return code;
  }
  makeCtx(stdin, write, errNull, errToOut) {
    const sh = this; const sim = this.sim;
    return {
      sim, sh, stdin, env: this.env, cwd: this.cwd, fs: this.fs,
      out: s => write(s), println: s => write(s + '\n'),
      err: s => { if (errNull) return; if (errToOut) write(s); else sh.term.print(s.replace(/\n$/, ''), 'err'); },
      eprintln: s => { if (errNull) return; if (errToOut) write(s + '\n'); else sh.term.print(s, 'err'); },
      info: (s, cls) => sh.term.print(s, cls || 'dim'),
      clear: () => sh.term.clear(),
      aborted: () => sh.aborted,
      sleep: async secs => { await sim.wait(secs, sh); if (sh.aborted) throw { abort: true }; },
      delay: async ms => { if (PG.fast) return; await new Promise(r => setTimeout(r, ms)); if (sh.aborted) throw { abort: true }; },
      resolve: p => sh.fs.norm(p.replace(/^~(?=\/|$)/, sh.env.HOME), sh.cwd),
    };
  }

  /* ---- expansion ---- */
  async expandText(text) { // heredoc body: expand $VAR and $(...)
    let out = ''; let i = 0;
    while (i < text.length) {
      if (text[i] === '\\' && '$`\\'.includes(text[i + 1] || '')) { out += text[i + 1]; i += 2; continue; }
      if (text[i] === '$') { const r = readDollar(text, i); if (r) { out += await this.partValue(r.part); i = r.end; continue; } }
      out += text[i++];
    }
    return out;
  }
  async partValue(p) {
    if (p.k === 'lit') return p.v.replace(/\u0000HOME/g, this.env.HOME);
    if (p.k === 'var') { if (p.v === '@' || p.v === '*') return ''; return (this.vars[p.v] ?? this.env[p.v] ?? ''); }
    if (p.k === 'arith') return String(PG.arith(p.v, name => Number(this.vars[name] ?? this.env[name] ?? 0)));
    if (p.k === 'sub') { let buf = ''; const saved = this.aborted; await this.runScript(p.v, { write: s => { buf += s; } }); return buf.replace(/\n+$/, ''); }
    return '';
  }
  async expandWord(word, noSplit) {
    const fields = []; let cur = ''; let has = false;
    for (const p of word.parts) {
      const v = await this.partValue(p);
      if (p.k === 'lit' || p.q || noSplit) { cur += v; has = true; if (p.k !== 'lit' && !v && !p.q) { /* empty unquoted */ } }
      else { const pieces = v.split(/\s+/).filter(x => x !== ''); if (v.trim() === '') continue; pieces.forEach((pc, idx) => { if (idx === 0 && !/^\s/.test(v)) { cur += pc; has = true; } else { if (has) fields.push(cur); cur = pc; has = true; } }); if (/\s$/.test(v)) { fields.push(cur); cur = ''; has = false; } }
    }
    if (has) fields.push(cur);
    if (!noSplit && word.parts.some(p => p.k === 'lit' && !p.q && /[*?]/.test(p.v))) { const out = []; for (const f of fields) { const g = /[*?]/.test(f) ? this.glob(f) : null; if (g && g.length) out.push(...g); else out.push(f); } return out; }
    return fields;
  }
  glob(pattern) { // * and ? in the last path segment only
    const slash = pattern.lastIndexOf('/'); const dirPart = slash >= 0 ? pattern.slice(0, slash + 1) : ''; const base = pattern.slice(slash + 1);
    const dir = this.fs.norm((dirPart || '.').replace(/^\u0000HOME/, this.env.HOME).replace(/^~/, this.env.HOME), this.cwd); if (!this.fs.isDir(dir)) return [];
    const re = new RegExp('^' + base.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    return this.fs.list(dir).filter(n => re.test(n) && (n[0] !== '.' || base[0] === '.')).map(n => dirPart + n);
  }
};

function readDollar(s, i) {
  const n = s[i + 1];
  if (n === '(' && s[i + 2] === '(') { let d = 0, j = i + 1; for (; j < s.length; j++) { if (s[j] === '(') d++; else if (s[j] === ')') { d--; if (d === 0) break; } } if (s[j - 1] === ')') return { part: { k: 'arith', v: s.slice(i + 3, j - 1) }, end: j + 1 }; return null; }
  if (n === '(') { let d = 1, j = i + 2, q = null; for (; j < s.length && d > 0; j++) { const c = s[j]; if (q) { if (c === q) q = null; } else if (c === "'" || c === '"') q = c; else if (c === '(') d++; else if (c === ')') d--; } return { part: { k: 'sub', v: s.slice(i + 2, j - 1) }, end: j }; }
  if (n === '{') { const j = s.indexOf('}', i); if (j < 0) return null; return { part: { k: 'var', v: s.slice(i + 2, j) }, end: j + 1 }; }
  if (n === '?' || n === '@' || n === '*') return { part: { k: 'var', v: n }, end: i + 2 };
  const m = /^[A-Za-z_]\w*/.exec(s.slice(i + 1)); if (m) return { part: { k: 'var', v: m[0] }, end: i + 1 + m[0].length };
  if (/\d/.test(n || '')) return { part: { k: 'var', v: n }, end: i + 2 };
  return null;
}
const OPS = ['2>&1', '2>>', '2>', '&>', '<<HEREDOC', '>>', '>', '<', '||', '&&', '|', ';', '&'];
function lex(s) {
  const toks = []; let parts = []; let lit = ''; let has = false;
  const flush = q => { if (lit !== '') { parts.push({ k: 'lit', v: lit, q }); lit = ''; } };
  const end = () => { flush(false); if (has) toks.push({ t: 'word', parts }); parts = []; has = false; };
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ' || c === '\t' || c === '\n') { end(); i++; continue; }
    if (c === '#' && !has) break;
    if (c === "'") { let j = s.indexOf("'", i + 1); if (j < 0) j = s.length; flush(false); parts.push({ k: 'lit', v: s.slice(i + 1, j), q: true }); has = true; i = j + 1; continue; }
    if (c === '"') {
      flush(false); has = true; i++; let buf = '';
      while (i < s.length && s[i] !== '"') {
        if (s[i] === '\\' && i + 1 < s.length && '"\\$`'.includes(s[i + 1])) { buf += s[i + 1]; i += 2; continue; }
        if (s[i] === '$') { const r = readDollar(s, i); if (r) { if (buf) { parts.push({ k: 'lit', v: buf, q: true }); buf = ''; } parts.push({ ...r.part, q: true }); i = r.end; continue; } }
        buf += s[i++];
      }
      if (buf) parts.push({ k: 'lit', v: buf, q: true }); i++; continue;
    }
    if (c === '\\' && i + 1 < s.length) { lit += s[i + 1]; has = true; i += 2; continue; }
    if (c === '$') { const r = readDollar(s, i); if (r) { flush(false); parts.push({ ...r.part, q: false }); has = true; i = r.end; continue; } }
    if (c === '~' && !has && (i + 1 >= s.length || s[i + 1] === '/' || s[i + 1] === ' ')) { lit += '\u0000HOME'; has = true; i++; continue; }
    let matched = null;
    for (const op of OPS) { if (s.startsWith(op, i)) { if (op[0] === '2' && has) continue; matched = op; break; } }
    if (matched) { end(); toks.push({ t: 'op', v: matched }); i += matched.length; continue; }
    lit += c; has = true; i++;
  }
  end(); return toks;
}
PG.lex = lex;
PG.commands = {};
PG.arith = (expr, getVar) => { // safe integer arithmetic: + - * / % ( ) < > <= >= == != && ||
  const toks = expr.match(/\d+|[A-Za-z_]\w*|<=|>=|==|!=|&&|\|\||[-+*\/%()<>!]/g) || []; let p = 0;
  const prim = () => { const t = toks[p++]; if (t === '(') { const v = or(); p++; return v; } if (t === '-') return -prim(); if (t === '+') return prim(); if (t === '!') return prim() ? 0 : 1; if (/^\d/.test(t || '')) return Number(t); return getVar(t); };
  const mul = () => { let v = prim(); while (['*', '/', '%'].includes(toks[p])) { const o = toks[p++]; const r = prim(); v = o === '*' ? v * r : o === '/' ? (r ? Math.trunc(v / r) : 0) : (r ? v % r : 0); } return v; };
  const add = () => { let v = mul(); while (['+', '-'].includes(toks[p])) { const o = toks[p++]; const r = mul(); v = o === '+' ? v + r : v - r; } return v; };
  const cmp = () => { let v = add(); while (['<', '>', '<=', '>=', '==', '!='].includes(toks[p])) { const o = toks[p++]; const r = add(); v = ({ '<': v < r, '>': v > r, '<=': v <= r, '>=': v >= r, '==': v === r, '!=': v !== r }[o]) ? 1 : 0; } return v; };
  const and = () => { let v = cmp(); while (toks[p] === '&&') { p++; const r = cmp(); v = v && r ? 1 : 0; } return v; };
  const or = () => { let v = and(); while (toks[p] === '||') { p++; const r = and(); v = v || r ? 1 : 0; } return v; };
  try { return or(); } catch (e) { return 0; }
};
PG.suggest = name => { const names = Object.keys(PG.commands); const hit = names.filter(n => n.startsWith(name.slice(0, 2)) || name.startsWith(n.slice(0, 3)))[0]; return hit ? ` (did you mean "${hit}"? type "help" to list commands)` : ' (type "help" to list commands)'; };
if (typeof module !== 'undefined') module.exports = PG;
