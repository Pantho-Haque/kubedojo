/* ===================================================== Go templates (for Helm) ===== */
PG.GoTpl = (() => {
  class TplError extends Error { constructor(msg) { super(msg); this.isTpl = true; } }
  const truthy = v => !(v === undefined || v === null || v === false || v === 0 || v === '' || (Array.isArray(v) && !v.length) || (PG.isObj(v) && !Object.keys(v).length));
  function lexAll(src) { // -> [{t:'text'|'act', v, line}]
    const out = []; let i = 0, line = 1;
    while (i < src.length) {
      const s = src.indexOf('{{', i);
      if (s < 0) { out.push({ t: 'text', v: src.slice(i), line }); break; }
      if (s > i) out.push({ t: 'text', v: src.slice(i, s), line });
      line += (src.slice(i, s).match(/\n/g) || []).length;
      let j = s + 2, q = null;
      for (; j < src.length; j++) { const c = src[j]; if (q) { if (c === '\\' && q === '"') j++; else if (c === q) q = null; } else if (c === '"' || c === '`') q = c; else if (c === '}' && src[j + 1] === '}') break; }
      let body = src.slice(s + 2, j); const act = { t: 'act', line, ltrim: false, rtrim: false };
      if (/^-\s/.test(body)) { act.ltrim = true; body = body.slice(1); }
      if (/\s-$/.test(body)) { act.rtrim = true; body = body.slice(0, -1); }
      act.v = body.trim(); out.push(act); line += (src.slice(s, j + 2).match(/\n/g) || []).length; i = j + 2;
    }
    for (let k = 0; k < out.length; k++) { if (out[k].t === 'act' && out[k].ltrim && out[k - 1] && out[k - 1].t === 'text') out[k - 1].v = out[k - 1].v.replace(/\s+$/, ''); if (out[k].t === 'act' && out[k].rtrim && out[k + 1] && out[k + 1].t === 'text') out[k + 1].v = out[k + 1].v.replace(/^\s+/, ''); }
    return out;
  }
  function tokExpr(s, line) {
    const toks = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if ('()|,'.includes(c)) { toks.push({ k: c }); i++; continue; }
      if (s.startsWith(':=', i)) { toks.push({ k: ':=' }); i += 2; continue; }
      if (c === '=' ) { toks.push({ k: '=' }); i++; continue; }
      if (c === '"') { let j = i + 1, str = ''; while (j < s.length && s[j] !== '"') { if (s[j] === '\\') { const n = s[j + 1]; str += n === 'n' ? '\n' : n === 't' ? '\t' : n; j += 2; } else str += s[j++]; } toks.push({ k: 'str', v: str }); i = j + 1; continue; }
      if (c === '`') { const j = s.indexOf('`', i + 1); toks.push({ k: 'str', v: s.slice(i + 1, j) }); i = j + 1; continue; }
      let j = i; while (j < s.length && !/[\s()|,]/.test(s[j]) && !(s[j] === '=' && j > i)) j++;
      const w = s.slice(i, j); i = j;
      if (/^-?\d+(\.\d+)?$/.test(w)) toks.push({ k: 'num', v: Number(w) });
      else if (w === 'true' || w === 'false') toks.push({ k: 'bool', v: w === 'true' });
      else if (w === 'nil') toks.push({ k: 'nil' });
      else if (w[0] === '$') toks.push({ k: 'var', v: w });
      else if (w[0] === '.') toks.push({ k: 'field', v: w });
      else toks.push({ k: 'id', v: w });
    }
    return toks;
  }
  function parsePipe(toks, p) { // returns {node, p}
    const node = { decl: null, assign: false, cmds: [] };
    if (toks[p] && toks[p].k === 'var') { let q = p; const names = [toks[q].v]; q++; if (toks[q] && toks[q].k === ',' && toks[q + 1] && toks[q + 1].k === 'var') { names.push(toks[q + 1].v); q += 2; } if (toks[q] && (toks[q].k === ':=' || toks[q].k === '=')) { node.decl = names; node.assign = toks[q].k === '='; p = q + 1; } }
    let cmd = [];
    const term = () => {
      const t = toks[p];
      if (t.k === '(') { p++; const r = parsePipe(toks, p); p = r.p; if (!toks[p] || toks[p].k !== ')') throw new TplError('unclosed paren'); p++; return { k: 'pipe', v: r.node }; }
      p++; return t;
    };
    while (p < toks.length && toks[p].k !== ')') {
      if (toks[p].k === '|') { node.cmds.push(cmd); cmd = []; p++; continue; }
      cmd.push(term());
    }
    node.cmds.push(cmd); return { node, p };
  }
  function parse(src, name) {
    const items = lexAll(src); const defs = {}; const root = { body: [] }; const stack = [{ node: root, field: 'body' }];
    const top = () => stack[stack.length - 1];
    const cur = () => top().node[top().field];
    for (const it of items) {
      if (it.t === 'text') { if (it.v) cur().push({ k: 'text', v: it.v }); continue; }
      let a = it.v; if (a.startsWith('/*')) continue;
      const kw = /^(if|else if|else|end|range|with|define|template|block)\b/.exec(a);
      const expr = s => { const toks = tokExpr(s, it.line); return parsePipe(toks, 0).node; };
      if (!kw) { cur().push({ k: 'act', pipe: expr(a), line: it.line, src: a }); continue; }
      const rest = a.slice(kw[0].length).trim();
      if (kw[1] === 'if' || kw[1] === 'with' || kw[1] === 'range') { const n = { k: kw[1], pipe: expr(rest), body: [], else: [], line: it.line, src: a }; cur().push(n); stack.push({ node: n, field: 'body' }); }
      else if (kw[1] === 'else if') { const parent = top().node; const n = { k: 'if', pipe: expr(rest), body: [], else: [], line: it.line, src: a }; parent.else.push(n); stack.pop(); stack.push({ node: parent, field: 'else', chain: true }); stack.push({ node: n, field: 'body' }); }
      else if (kw[1] === 'else') { const t = top(); if (t.field === 'body') t.field = 'else'; }
      else if (kw[1] === 'end') { stack.pop(); while (stack.length > 1 && top().chain) stack.pop(); if (!stack.length) throw new TplError(`template: ${name}:${it.line}: unexpected {{end}}`); }
      else if (kw[1] === 'define') { const nm = tokExpr(rest, it.line)[0].v; const n = { k: 'define', name: nm, body: [] }; stack.push({ node: n, field: 'body' }); defs[nm] = n; }
      else if (kw[1] === 'template' || kw[1] === 'block') { const toks = tokExpr(rest, it.line); const nm = toks[0].v; const arg = toks.length > 1 ? parsePipe(toks, 1).node : { cmds: [[{ k: 'field', v: '.' }]] }; cur().push({ k: 'tmpl', name: nm, arg, line: it.line }); }
    }
    if (stack.length > 1) throw new TplError(`template: ${name}: unexpected EOF (missing {{end}})`);
    return { root, defs };
  }
  const FUNCS = {};
  const str = v => v === undefined || v === null ? '' : typeof v === 'string' ? v : PG.isObj(v) || Array.isArray(v) ? JSON.stringify(v) : String(v);
  Object.assign(FUNCS, {
    print: (...a) => a.map(str).join(''), println: (...a) => a.map(str).join(' ') + '\n',
    printf: (f, ...a) => { let i = 0; return f.replace(/%([-+# 0]*\d*)([sdvqtf%])/g, (m, fl, ch) => { if (ch === '%') return '%'; const v = a[i++]; if (ch === 'q') return JSON.stringify(str(v)); if (ch === 'd') return String(Math.trunc(Number(v))); return str(v); }); },
    quote: (...a) => a.filter(x => x !== undefined && x !== null).map(x => JSON.stringify(str(x))).join(' '), squote: (...a) => a.map(x => "'" + str(x) + "'").join(' '),
    default: (d, v) => truthy(v) ? v : d, required: (m, v) => { if (v === undefined || v === null || v === '') throw new TplError(m); return v; },
    trunc: (n, s) => n >= 0 ? str(s).slice(0, n) : str(s).slice(n), trimSuffix: (x, s) => str(s).endsWith(x) ? str(s).slice(0, -x.length || undefined) : str(s), trimPrefix: (x, s) => str(s).startsWith(x) ? str(s).slice(x.length) : str(s),
    trim: s => str(s).trim(), upper: s => str(s).toUpperCase(), lower: s => str(s).toLowerCase(), title: s => str(s).replace(/\b\w/g, c => c.toUpperCase()),
    replace: (o, n, s) => str(s).split(o).join(n), contains: (sub, s) => str(s).includes(sub), hasPrefix: (p, s) => str(s).startsWith(p), hasSuffix: (p, s) => str(s).endsWith(p),
    indent: (n, s) => str(s).split('\n').map(l => ' '.repeat(n) + l).join('\n'), nindent: (n, s) => '\n' + str(s).split('\n').map(l => ' '.repeat(n) + l).join('\n'),
    toYaml: v => v === undefined || v === null ? '' : PG.yaml.dump(v).replace(/\n$/, ''), toJson: v => JSON.stringify(v), b64enc: s => PG.b64(str(s)), b64dec: s => PG.unb64(str(s)), sha256sum: s => PG.hash(str(s), 64),
    not: v => !truthy(v), and: (...a) => { for (const x of a) if (!truthy(x)) return x; return a[a.length - 1]; }, or: (...a) => { for (const x of a) if (truthy(x)) return x; return a[a.length - 1]; },
    eq: (a, ...b) => b.some(x => x === a || (typeof x === 'number' && typeof a === 'string' && false)), ne: (a, b) => a !== b, lt: (a, b) => a < b, gt: (a, b) => a > b, le: (a, b) => a <= b, ge: (a, b) => a >= b,
    len: v => v === undefined || v === null ? 0 : (typeof v === 'string' || Array.isArray(v)) ? v.length : Object.keys(v).length, list: (...a) => a, dict: (...a) => { const o = {}; for (let i = 0; i < a.length; i += 2) o[a[i]] = a[i + 1]; return o; },
    hasKey: (m, k) => PG.isObj(m) && k in m, empty: v => !truthy(v), coalesce: (...a) => a.find(truthy), ternary: (a, b, c) => c ? a : b, join: (sep, l) => (l || []).join(sep), first: l => l && l[0], last: l => l && l[l.length - 1],
    toString: v => str(v), int: v => Math.trunc(Number(v)), int64: v => Math.trunc(Number(v)), kindIs: (k, v) => ({ string: typeof v === 'string', map: PG.isObj(v), slice: Array.isArray(v), bool: typeof v === 'boolean', int: Number.isInteger(v), float64: typeof v === 'number', invalid: v === null || v === undefined }[k] || false),
    typeOf: v => typeof v === 'string' ? 'string' : Array.isArray(v) ? '[]interface {}' : PG.isObj(v) ? 'map[string]interface {}' : typeof v === 'boolean' ? 'bool' : 'float64', randAlphaNum: n => PG.rnd(n, 'abcdefghijklmnopqrstuvwxyz0123456789'), now: () => new Date(PG.BASE_TIME).toISOString(),
    regexMatch: (re, s) => new RegExp(re).test(str(s)), snakecase: s => str(s).replace(/([A-Z])/g, '_$1').toLowerCase(), kebabcase: s => str(s).replace(/([A-Z])/g, '-$1').toLowerCase(), index: (m, ...k) => k.reduce((a, x) => a && a[x], m),
  });
  FUNCS.toYAML = FUNCS.toYaml;
  function render(tpl, data, ctx) {
    // ctx: {templates: name->{body}, name, funcs}
    const scopes = [{ $: data }]; let out = '';
    const lookupVar = n => { for (let i = scopes.length - 1; i >= 0; i--) if (n in scopes[i]) return scopes[i][n]; throw new TplError(`undefined variable "${n}"`); };
    const setVar = (n, v, assign) => { if (assign) { for (let i = scopes.length - 1; i >= 0; i--) if (n in scopes[i]) { scopes[i][n] = v; return; } } scopes[scopes.length - 1][n] = v; };
    const access = (base, path, src) => { let v = base; for (const seg of path) { if (v === undefined || v === null) throw new TplError(`nil pointer evaluating interface {}.${seg}`); if (typeof v === 'object' && seg in v) v = v[seg]; else if (typeof v === 'function') { v = undefined; } else v = undefined; } return v; };
    const evalTerm = (t, dot, node) => {
      switch (t.k) {
        case 'str': case 'num': case 'bool': return t.v; case 'nil': return null;
        case 'pipe': return evalPipe(t.v, dot);
        case 'var': { const parts = t.v.split('.'); const v = lookupVar(parts[0]); return parts.length > 1 ? access(v, parts.slice(1)) : v; }
        case 'field': { if (t.v === '.') return dot; return access(dot, t.v.slice(1).split('.')); }
        case 'id': { if (FUNCS[t.v] || ctx.funcs[t.v]) return { fn: ctx.funcs[t.v] || FUNCS[t.v] }; if (t.v === 'lookup') throw new TplError('function "lookup" not defined'); throw new TplError(`function "${t.v}" not defined`); }
      }
    };
    const callable = (t, dot) => { // is this command head a function/method?
      if (t.k === 'id') return evalTerm(t, dot).fn;
      if (t.k === 'field' || t.k === 'var') { const parts = (t.k === 'field' ? t.v.slice(1) : t.v).split('.'); const last = parts[parts.length - 1]; const baseVal = t.k === 'field' ? access(dot, parts.slice(0, -1)) : access(lookupVar(parts[0]), parts.slice(1, -1)); if (baseVal && typeof baseVal[last] === 'function') return (...a) => baseVal[last](...a); }
      return null;
    };
    const evalPipe = (pipe, dot) => {
      let val; let first = true;
      for (const cmd of pipe.cmds) {
        if (!cmd.length) continue;
        const head = cmd[0]; const fn = callable(head, dot);
        const args = cmd.slice(fn ? 1 : 0).map(t => { const v = evalTerm(t, dot); return v && v.fn && t.k === 'id' ? v.fn : v; });
        if (fn) { const a = first ? args : [...args, val]; try { val = fn(...a); } catch (e) { if (e.isTpl) throw new TplError(`error calling ${head.v ? head.v.replace(/^\./, '') : 'function'}: ${e.message}`); throw e; } }
        else { if (args.length && !first) throw new TplError("can't give argument to non-function"); val = evalTerm(head, dot); if (!first) { /* piping into a non-function */ } }
        first = false;
      }
      if (pipe.decl) { const vals = pipe.decl; if (vals.length === 1) setVar(vals[0], val, pipe.assign); else setVar(vals[0], val, pipe.assign); }
      return val;
    };
    const execNodes = (nodes, dot) => {
      for (const n of nodes) {
        if (n.k === 'text') out += n.v;
        else if (n.k === 'act') { try { const v = evalPipe(n.pipe, dot); if (!n.pipe.decl) out += v === undefined ? '<no value>' : v === null ? '<nil>' : str(v); } catch (e) { if (e.isTpl) e.message = `template: ${ctx.name}:${n.line}:${1}: executing "${ctx.name}" at <${n.src}>: ${e.message}`; throw e; } }
        else if (n.k === 'if') { const v = evalPipe(n.pipe, dot); scopes.push({}); if (truthy(v)) execNodes(n.body, dot); else execNodes(n.else, dot); scopes.pop(); }
        else if (n.k === 'with') { const v = evalPipe(n.pipe, dot); scopes.push({}); if (truthy(v)) execNodes(n.body, v); else execNodes(n.else, dot); scopes.pop(); }
        else if (n.k === 'range') {
          const decl = n.pipe.decl; const savePipe = { ...n.pipe, decl: null }; const coll = evalPipe(savePipe, dot);
          const entries = Array.isArray(coll) ? coll.map((v, i) => [i, v]) : PG.isObj(coll) ? Object.keys(coll).sort().map(k => [k, coll[k]]) : [];
          if (!entries.length) { scopes.push({}); execNodes(n.else, dot); scopes.pop(); }
          for (const [k, v] of entries) { scopes.push({}); if (decl) { if (decl.length === 2) { scopes[scopes.length - 1][decl[0]] = k; scopes[scopes.length - 1][decl[1]] = v; } else scopes[scopes.length - 1][decl[0]] = v; } execNodes(n.body, v); scopes.pop(); }
        }
        else if (n.k === 'tmpl') { const arg = evalPipe(n.arg, dot); out += ctx.include(n.name, arg); }
      }
    };
    execNodes(tpl.root.body, data);
    return out;
  }
  return { parse, render, FUNCS, truthy, TplError };
})();
if (typeof module !== 'undefined') module.exports = PG;
