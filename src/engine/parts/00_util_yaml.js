/* ============================================================================
   KubeDojo — a browser simulator of kind / k3d / docker / kubectl / helm 2.
   Everything here is a SIMULATION: nothing leaves this page, no real cluster exists.
   ========================================================================== */
const PG = {};
PG.clone = o => o === undefined ? undefined : JSON.parse(JSON.stringify(o));
PG.rnd = (n, chars = 'bcdfghjklmnpqrstvwxz2456789') => { let s = ''; for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)]; return s; };
PG.hex = n => PG.rnd(n, '0123456789abcdef');
PG.isObj = x => x && typeof x === 'object' && !Array.isArray(x);
PG.deepMerge = (a, b) => { // JSON merge patch; arrays of named objects merge by name (strategic-ish)
  if (Array.isArray(a) && Array.isArray(b)) {
    if (b.length && b.every(x => PG.isObj(x) && x.name !== undefined) && a.every(x => PG.isObj(x) && x.name !== undefined)) {
      const out = PG.clone(a);
      for (const item of b) { const i = out.findIndex(x => x.name === item.name); if (i >= 0) out[i] = PG.deepMerge(out[i], item); else out.push(PG.clone(item)); }
      return out;
    }
    return PG.clone(b);
  }
  if (PG.isObj(a) && PG.isObj(b)) {
    const out = { ...a };
    for (const k of Object.keys(b)) { if (b[k] === null) delete out[k]; else out[k] = k in a ? PG.deepMerge(a[k], b[k]) : PG.clone(b[k]); }
    return out;
  }
  return PG.clone(b);
};
PG.fmtAge = s => { s = Math.max(0, Math.floor(s)); if (s < 120) return s + 's'; if (s < 600) return Math.floor(s / 60) + 'm' + (s % 60) + 's'; if (s < 10800) return Math.floor(s / 60) + 'm'; if (s < 172800) return Math.floor(s / 3600) + 'h'; return Math.floor(s / 86400) + 'd'; };
PG.pad = (s, n) => String(s) + ' '.repeat(Math.max(0, n - String(s).length));
PG.table = (rows, header) => { // rows: arrays of strings; header: array
  const all = [header, ...rows]; const w = header.map((_, i) => Math.max(...all.map(r => String(r[i] ?? '').length)));
  return all.map(r => r.map((c, i) => i === r.length - 1 ? String(c ?? '') : PG.pad(c ?? '', w[i] + 3)).join('')).join('\n');
};
PG.b64 = s => { try { return btoa(unescape(encodeURIComponent(s))); } catch (e) { return Buffer.from(s, 'utf8').toString('base64'); } };
PG.unb64 = s => { try { return decodeURIComponent(escape(atob(s))); } catch (e) { try { return Buffer.from(s, 'base64').toString('utf8'); } catch (e2) { return ''; } } };
PG.hash = (str, len = 64) => { // cheap stand-in for sha256
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57, out = '';
  for (let r = 0; out.length < len; r++) {
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    out += ((h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0'));
    str += r;
  }
  return out.slice(0, len);
};

/* ---------------------------------------------------------------- YAML ---- */
PG.yaml = (() => {
  function parseScalar(s) {
    s = s.trim();
    if (s === '' || s === '~' || s === 'null') return null;
    if (s === 'true') return true; if (s === 'false') return false;
    if (/^-?\d+$/.test(s)) return Number(s);
    if (/^-?\d+\.\d+$/.test(s)) return Number(s);
    if (s[0] === '"' && s[s.length - 1] === '"' && s.length >= 2) { try { return JSON.parse(s); } catch (e) { return s.slice(1, -1); } }
    if (s[0] === "'" && s[s.length - 1] === "'" && s.length >= 2) return s.slice(1, -1).replace(/''/g, "'");
    return s;
  }
  function parseFlow(str) { // single-line flow collections
    let i = 0;
    const ws = () => { while (i < str.length && /\s/.test(str[i])) i++; };
    function val(stop) {
      ws();
      if (str[i] === '{') { i++; const o = {}; ws(); while (str[i] !== '}' && i < str.length) { ws(); const k = key(); ws(); if (str[i] === ':') { i++; o[k] = val(',}'); } else o[k] = null; ws(); if (str[i] === ',') i++; ws(); } i++; return o; }
      if (str[i] === '[') { i++; const a = []; ws(); while (str[i] !== ']' && i < str.length) { a.push(val(',]')); ws(); if (str[i] === ',') i++; ws(); } i++; return a; }
      if (str[i] === '"' || str[i] === "'") { const q = str[i]; let j = i + 1; while (j < str.length && !(str[j] === q && str[j - 1] !== '\\')) j++; const raw = str.slice(i, j + 1); i = j + 1; return parseScalar(raw); }
      let j = i; while (j < str.length && !stop.includes(str[j])) j++; const raw = str.slice(i, j); i = j; return parseScalar(raw);
    }
    function key() { ws(); if (str[i] === '"' || str[i] === "'") { const v = val(':'); return String(v); } let j = i; while (j < str.length && !':,}'.includes(str[j])) j++; const k = str.slice(i, j).trim(); i = j; return k; }
    return val('');
  }
  function parseInline(s) { s = s.trim(); if (s[0] === '{' || s[0] === '[') return parseFlow(s); return parseScalar(s); }
  function stripComment(s) {
    let q = null;
    for (let i = 0; i < s.length; i++) { const c = s[i]; if (q) { if (c === '\\' && q === '"') i++; else if (c === q) q = null; } else if (c === '"' || c === "'") { if (i === 0 || /[\s:\[{,-]/.test(s[i - 1])) q = c; } else if (c === '#' && (i === 0 || /\s/.test(s[i - 1]))) return s.slice(0, i).trimEnd(); }
    return s;
  }
  const KEY = /^((?:"[^"]*")|(?:'[^']*')|(?:[^\s"'\[\]{},#&*!|>%@`-][^:]*?|-[^\s:][^:]*?))\s*:(?:\s+|$)/;
  function parse(text) {
    const L = text.split('\n').map(s => s.replace(/\t/g, '  ').replace(/\r$/, ''));
    let p = 0;
    const indentOf = s => s.match(/^ */)[0].length;
    const isSkip = s => /^\s*(#.*)?$/.test(s);
    const skip = () => { while (p < L.length && isSkip(L[p])) p++; };
    function blockScalar(style, parentIndent) {
      const lines = []; let bi = null;
      while (p < L.length) {
        const l = L[p];
        if (l.trim() === '') { lines.push(''); p++; continue; }
        const ind = indentOf(l); if (ind <= parentIndent) break;
        if (bi === null) bi = ind; lines.push(l.slice(Math.min(bi, ind))); p++;
      }
      while (lines.length && lines[lines.length - 1] === '') lines.pop();
      const keep = !style.includes('-');
      let out = style[0] === '>' ? lines.join(' ').replace(/ +/g, ' ') : lines.join('\n');
      return keep ? out + '\n' : out;
    }
    function parseNode(minIndent) {
      skip(); if (p >= L.length) return null;
      const ind = indentOf(L[p]); if (ind < minIndent) return null;
      const line = stripComment(L[p]).trim();
      if (line === '-' || line.startsWith('- ')) return parseSeq(ind);
      if (KEY.test(line) && line[0] !== '{' && line[0] !== '[') return parseMap(ind);
      p++; return parseInline(line);
    }
    function parseSeq(ind) {
      const arr = [];
      while (true) {
        skip(); if (p >= L.length) break;
        if (indentOf(L[p]) !== ind) break;
        const line = stripComment(L[p]); const t = line.trim();
        if (!(t === '-' || t.startsWith('- '))) break;
        const off = line.indexOf('-') + 1; const rest = line.slice(off);
        if (rest.trim() === '') { p++; arr.push(parseNode(ind + 1)); continue; }
        const lead = rest.match(/^ */)[0].length;
        L[p] = ' '.repeat(off + lead) + rest.trim();
        arr.push(parseNode(off + lead));
      }
      return arr;
    }
    function parseMap(ind) {
      const obj = {};
      while (true) {
        skip(); if (p >= L.length) break;
        if (indentOf(L[p]) !== ind) break;
        const line = stripComment(L[p]).trim();
        const m = KEY.exec(line); if (!m || line.startsWith('- ')) break;
        let key = m[1]; if (key[0] === '"' || key[0] === "'") key = parseScalar(key);
        let rest = line.slice(m[0].length).trim();
        p++;
        if (rest === '') {
          skip();
          if (p < L.length) {
            const ni = indentOf(L[p]); const nl = stripComment(L[p]).trim();
            if (ni > ind) obj[key] = parseNode(ind + 1);
            else if (ni === ind && (nl === '-' || nl.startsWith('- '))) obj[key] = parseSeq(ind);
            else obj[key] = null;
          } else obj[key] = null;
        } else if (/^[|>][+-]?$/.test(rest)) obj[key] = blockScalar(rest, ind);
        else obj[key] = parseInline(rest);
      }
      return obj;
    }
    const v = parseNode(0);
    return v;
  }
  function parseDocs(text) {
    const docs = []; let cur = [];
    for (const line of text.split('\n')) { if (/^---\s*$/.test(line)) { docs.push(cur.join('\n')); cur = []; } else cur.push(line); }
    docs.push(cur.join('\n'));
    return docs.map(d => /^\s*(#.*)?$/.test(d.split('\n').filter(l => l.trim() && !/^\s*#/.test(l)).join('\n')) ? undefined : parse(d)).filter(d => d !== undefined && d !== null);
  }
  /* dump in kubectl/go-yaml style (lists at the same indent as their key) */
  function needsQuote(s) {
    if (s === '') return true;
    if (/^(true|false|null|~|yes|no|on|off)$/i.test(s)) return true;
    if (/^-?\d+(\.\d+)?$/.test(s)) return true;
    if (/^\d{4}-\d\d-\d\d(T|\s|$)/.test(s)) return true;
    if (/^[\s]|[\s]$/.test(s)) return true;
    if (/^[-?:,\[\]{}#&*!|>'"%@`]/.test(s) && !/^-[^\s]/.test(s)) return true;
    if (/: |\s#/.test(s) || /:$/.test(s)) return true;
    return false;
  }
  function scalar(v) {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'string') { if (needsQuote(v)) return JSON.stringify(v); return v; }
    return String(v);
  }
  function dump(v, ind = 0) {
    const pad = ' '.repeat(ind);
    if (Array.isArray(v)) {
      if (!v.length) return pad + '[]';
      return v.map(it => {
        if (PG.isObj(it) && Object.keys(it).length) { const d = dump(it, ind + 2).split('\n'); d[0] = pad + '- ' + d[0].slice(ind + 2); return d.join('\n'); }
        if (Array.isArray(it) && it.length) { const d = dump(it, ind + 2).split('\n'); d[0] = pad + '- ' + d[0].slice(ind + 2); return d.join('\n'); }
        return pad + '- ' + (PG.isObj(it) ? '{}' : Array.isArray(it) ? '[]' : scalar(it));
      }).join('\n');
    }
    if (PG.isObj(v)) {
      const keys = Object.keys(v).filter(k => v[k] !== undefined && !k.startsWith('_'));
      if (!keys.length) return pad + '{}';
      return keys.map(k => {
        const x = v[k]; const ks = needsQuote(k) && !/^[\w./-]+$/.test(k) ? JSON.stringify(k) : k;
        if (Array.isArray(x)) return x.length ? pad + ks + ':\n' + dump(x, ind) : pad + ks + ': []';
        if (PG.isObj(x)) return Object.keys(x).filter(kk => !kk.startsWith('_')).length ? pad + ks + ':\n' + dump(x, ind + 2) : pad + ks + ': {}';
        if (typeof x === 'string' && x.includes('\n')) return pad + ks + ': |' + (x.endsWith('\n') ? '' : '-') + '\n' + x.replace(/\n$/, '').split('\n').map(l => pad + '  ' + l).join('\n');
        return pad + ks + ': ' + scalar(x);
      }).join('\n');
    }
    return pad + scalar(v);
  }
  return { parse, parseDocs, dump: (v) => dump(v, 0) + '\n', scalar: parseScalar };
})();
if (typeof module !== 'undefined') module.exports = PG;
