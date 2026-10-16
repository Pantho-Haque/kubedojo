/* ================================================================= vi editor === */
/* Pure state machine: feed it keys, read screen(). The page draws it (90_ui.js); tests drive it directly.
   Keys: a single character, or Escape Enter Backspace Delete Tab Left Right Up Down Home End PageUp PageDown C-r C-f C-b C-d C-u C-c. */
PG.Vi = class {
  constructor(o) { // {text, name, exists, readOnly, write(name,text)->errString|null}
    this.name = o.name || ''; this.readOnly = !!o.readOnly; this.writeFn = o.write; this.rows = o.rows || 20; this.cols = o.cols || 80;
    const t = o.text || ''; this.lines = t === '' ? [''] : t.replace(/\n$/, '').split('\n');
    this.y = 0; this.x = 0; this.top = 0; this.left = 0; this.mode = 'n'; this.count = ''; this.op = null; this.opCount = ''; this.pre = ''; this.cl = null;
    this.reg = { text: '', line: false }; this.undo = []; this.redo = []; this.dirty = false; this.number = false; this.last = null; this.done = false; this.want = 0;
    this.msg = !this.name ? '' : o.exists === false ? `"${this.name}" [New]` : `"${this.name}" ${t ? this.lines.length : 0}L, ${t.length}B`;
  }
  /* ---- helpers ---- */
  get line() { return this.lines[this.y]; }
  text() { return this.lines.length === 1 && this.lines[0] === '' ? '' : this.lines.join('\n') + '\n'; }
  snap() { this.undo.push({ l: this.lines.slice(), y: this.y, x: this.x }); if (this.undo.length > 200) this.undo.shift(); this.redo = []; this.dirty = true; }
  clamp() { this.y = Math.max(0, Math.min(this.y, this.lines.length - 1)); const max = this.mode === 'i' ? this.line.length : Math.max(0, this.line.length - 1); this.x = Math.max(0, Math.min(this.x, max)); }
  firstNb(y) { const m = /\S/.exec(this.lines[y]); return m ? m.index : Math.max(0, this.lines[y].length - 1); }
  cls(c) { return c === undefined || /\s/.test(c) ? 0 : /\w/.test(c) ? 1 : 2; }
  reset() { this.count = ''; this.op = null; this.opCount = ''; this.pre = ''; }
  /* ---- word motions ---- */
  nextW(y, x) {
    const L = this.lines; const c = this.cls(L[y][x]); if (c) while (x < L[y].length && this.cls(L[y][x]) === c) x++;
    for (; ;) { if (x >= L[y].length) { if (y === L.length - 1) return { y, x: L[y].length }; y++; x = 0; if (L[y].length === 0) return { y, x: 0 }; continue; } if (this.cls(L[y][x]) === 0) { x++; continue; } return { y, x }; }
  }
  prevW(y, x) {
    const L = this.lines;
    for (; ;) { if (x === 0) { if (y === 0) return { y: 0, x: 0 }; y--; x = L[y].length; if (x === 0) return { y, x: 0 }; } x--; if (this.cls(L[y][x]) !== 0) break; }
    const c = this.cls(L[y][x]); while (x > 0 && this.cls(L[y][x - 1]) === c) x--; return { y, x };
  }
  endW(y, x) {
    const L = this.lines;
    for (; ;) { x++; if (x >= L[y].length) { if (y === L.length - 1) return { y, x: Math.max(0, L[y].length - 1) }; y++; x = -1; continue; } if (this.cls(L[y][x]) !== 0) break; }
    const c = this.cls(L[y][x]); while (x + 1 < L[y].length && this.cls(L[y][x + 1]) === c) x++; return { y, x };
  }
  /* motion -> {y,x,line?,incl?} or null */
  motion(k, n) {
    const has = n !== null; const c = n || 1; const L = this.lines; let p = { y: this.y, x: this.x };
    switch (k) {
      case 'h': case 'Left': case 'Backspace': if (this.x === 0) return null; return { y: this.y, x: Math.max(0, this.x - c) };
      case 'l': case 'Right': case ' ': return { y: this.y, x: Math.min(this.line.length, this.x + c) };
      case 'j': case 'Down': case 'Enter': if (this.y + c > L.length - 1 && this.y === L.length - 1) return null; return { y: Math.min(L.length - 1, this.y + c), x: this.want, line: true, keep: true };
      case 'k': case 'Up': if (this.y === 0) return null; return { y: Math.max(0, this.y - c), x: this.want, line: true, keep: true };
      case '0': case 'Home': return { y: this.y, x: 0 };
      case '^': return { y: this.y, x: this.firstNb(this.y) };
      case '$': case 'End': { const y = Math.min(L.length - 1, this.y + c - 1); return { y, x: Math.max(0, L[y].length - 1), incl: true, eol: true }; }
      case 'G': { const y = has ? Math.min(L.length, c) - 1 : L.length - 1; return { y, x: this.firstNb(y), line: true }; }
      case 'gg': { const y = has ? Math.min(L.length, c) - 1 : 0; return { y, x: this.firstNb(y), line: true }; }
      case 'w': for (let i = 0; i < c; i++) p = this.nextW(p.y, p.x); return p;
      case 'b': for (let i = 0; i < c; i++) p = this.prevW(p.y, p.x); return p;
      case 'e': for (let i = 0; i < c; i++) p = this.endW(p.y, p.x); return { ...p, incl: true };
      case 'n': case 'N': { if (!this.last) { this.msg = 'E35: No previous regular expression'; return null; } const fwd = (k === 'n') === (this.last.dir === 1); return this.find(this.last.pat, fwd ? 1 : -1); }
    }
    return null;
  }
  find(pat, dir) {
    let rx; try { rx = new RegExp(pat, 'g'); } catch (e) { rx = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'); }
    const L = this.lines, N = L.length;
    for (let i = 0; i <= N; i++) {
      const y = ((dir === 1 ? this.y + i : this.y - i) % N + N) % N; let ms = [...L[y].matchAll(rx)].filter(m => m[0] !== '');
      if (i === 0) ms = ms.filter(m => (dir === 1 ? m.index > this.x : m.index < this.x));
      if (ms.length) { const m = dir === 1 ? ms[0] : ms[ms.length - 1]; if (i > 0 && (dir === 1 ? y <= this.y : y >= this.y)) this.msg = dir === 1 ? 'search hit BOTTOM, continuing at TOP' : 'search hit TOP, continuing at BOTTOM'; return { y, x: m.index }; }
    }
    this.msg = `E486: Pattern not found: ${pat}`; return null;
  }
  /* ---- edit primitives ---- */
  getRange(a, b) { // charwise [a,b) positions (a<=b)
    if (a.y === b.y) return this.lines[a.y].slice(a.x, b.x);
    let s = this.lines[a.y].slice(a.x) + '\n'; for (let y = a.y + 1; y < b.y; y++) s += this.lines[y] + '\n'; return s + this.lines[b.y].slice(0, b.x);
  }
  delRange(a, b) { const t = this.lines[a.y].slice(0, a.x) + this.lines[b.y].slice(b.x); this.lines.splice(a.y, b.y - a.y + 1, t); this.y = a.y; this.x = a.x; }
  applyOp(op, m, n) {
    let a = { y: this.y, x: this.x }, b = { y: m.y, x: m.x }; const L = this.lines;
    if (b.y < a.y || (b.y === a.y && b.x < a.x)) [a, b] = [b, a];
    if (m.line) {
      const text = L.slice(a.y, b.y + 1).join('\n'); this.reg = { text, line: true };
      if (op === 'y') { this.y = a.y; this.msg = b.y > a.y ? `${b.y - a.y + 1} lines yanked` : ''; return; }
      this.snap(); L.splice(a.y, b.y - a.y + 1); if (op === 'c') { L.splice(a.y, 0, ''); this.y = a.y; this.x = 0; this.mode = 'i'; this.clamp(); return; }
      if (!L.length) L.push(''); this.y = Math.min(a.y, L.length - 1); this.x = this.firstNb(this.y); if (b.y > a.y) this.msg = `${b.y - a.y + 1} fewer lines`; return;
    }
    if (m.incl) b = { y: b.y, x: b.x + 1 };
    const text = this.getRange(a, b); if (!text && op !== 'c') return; this.reg = { text, line: false };
    if (op === 'y') { this.y = a.y; this.x = a.x; return; }
    this.snap(); this.delRange(a, b); if (op === 'c') { this.mode = 'i'; this.clamp(); } else this.clamp();
  }
  put(before) {
    const r = this.reg; if (!r.text && !r.line) { this.msg = 'E353: Nothing in register "'; return; } this.snap();
    if (r.line) { const at = before ? this.y : this.y + 1; this.lines.splice(at, 0, ...r.text.split('\n')); this.y = at; this.x = this.firstNb(at); return; }
    const at = before ? this.x : Math.min(this.line.length, this.x + 1); const ln = this.line; const parts = r.text.split('\n');
    if (parts.length === 1) { this.lines[this.y] = ln.slice(0, at) + r.text + ln.slice(at); this.x = at + r.text.length - 1; return; }
    const tail = ln.slice(at); this.lines[this.y] = ln.slice(0, at) + parts[0]; this.lines.splice(this.y + 1, 0, ...parts.slice(1, -1), parts[parts.length - 1] + tail); this.x = at;
  }
  /* ---- keys ---- */
  key(k) {
    if (this.done) return;
    if (this.mode === 'i') { this.msg = ''; this.insertKey(k); } else if (this.mode === 'c') this.cmdKey(k); else { this.msg = ''; this.normalKey(k); }
    this.clamp(); if (this.mode !== 'i' && !this.keepWant) this.want = this.x; this.keepWant = false; this.scroll();
  }
  scroll() {
    const r = this.rows; if (this.y < this.top) this.top = this.y; if (this.y >= this.top + r) this.top = this.y - r + 1;
    const nw = this.number ? String(this.lines.length).length + 1 : 0; const w = Math.max(10, this.cols - nw); const dx = this.disp(this.y, this.x);
    if (dx < this.left) this.left = dx; if (dx >= this.left + w) this.left = dx - w + 1;
  }
  disp(y, x) { let c = 0; const s = this.lines[y]; for (let i = 0; i < x && i < s.length; i++) c += s[i] === '\t' ? 8 - (c % 8) : 1; return c; }
  expand(s) { let o = ''; for (const ch of s) o += ch === '\t' ? ' '.repeat(8 - (o.length % 8)) : ch; return o; }
  insertKey(k) {
    if (k === 'Escape' || k === 'C-c') { this.mode = 'n'; this.x = Math.max(0, this.x - 1); return; }
    const ln = this.line;
    if (k === 'Enter') { this.lines[this.y] = ln.slice(0, this.x); this.lines.splice(this.y + 1, 0, ln.slice(this.x)); this.y++; this.x = 0; }
    else if (k === 'Backspace') { if (this.x > 0) { this.lines[this.y] = ln.slice(0, this.x - 1) + ln.slice(this.x); this.x--; } else if (this.y > 0) { const p = this.lines[this.y - 1]; this.lines.splice(this.y - 1, 2, p + ln); this.y--; this.x = p.length; } }
    else if (k === 'Delete') { if (this.x < ln.length) this.lines[this.y] = ln.slice(0, this.x) + ln.slice(this.x + 1); else if (this.y < this.lines.length - 1) this.lines.splice(this.y, 2, ln + this.lines[this.y + 1]); }
    else if (k === 'Left') this.x = Math.max(0, this.x - 1); else if (k === 'Right') this.x = Math.min(ln.length, this.x + 1);
    else if (k === 'Up' || k === 'Down') { this.y = Math.max(0, Math.min(this.lines.length - 1, this.y + (k === 'Up' ? -1 : 1))); this.x = Math.min(this.x, this.line.length); }
    else if (k === 'Home') this.x = 0; else if (k === 'End') this.x = ln.length;
    else if (k === 'Tab') { this.lines[this.y] = ln.slice(0, this.x) + '\t' + ln.slice(this.x); this.x++; }
    else if (k.length === 1) { this.lines[this.y] = ln.slice(0, this.x) + k + ln.slice(this.x); this.x++; }
  }
  normalKey(k) {
    if (k === 'Escape' || k === 'C-c') { this.reset(); return; }
    if (this.pre === 'r') { const n = Number(this.count) || 1; this.reset(); if (k.length === 1 && this.x + n <= this.line.length) { this.snap(); this.lines[this.y] = this.line.slice(0, this.x) + k.repeat(n) + this.line.slice(this.x + n); this.x += n - 1; } return; }
    if (this.pre === 'Z') { this.reset(); if (k === 'Z') this.ex('x'); else if (k === 'Q') this.ex('q!'); return; }
    let key = k; if (this.pre === 'g') { this.pre = ''; if (k !== 'g') { this.reset(); return; } key = 'gg'; }
    else if (k === 'g') { this.pre = 'g'; return; }
    if (/^[1-9]$/.test(k) || (k === '0' && (this.op ? this.opCount : this.count))) { if (this.op) this.opCount += k; else this.count += k; return; }
    const n1 = this.count ? Number(this.count) : null, n2 = this.opCount ? Number(this.opCount) : null; const n = n1 === null && n2 === null ? null : (n1 || 1) * (n2 || 1);
    if (this.op) { // operator pending
      const op = this.op; this.reset();
      if (key === op) { const y2 = Math.min(this.lines.length - 1, this.y + (n || 1) - 1); this.applyOp(op, { y: y2, x: 0, line: true }); if (op === 'c') this.mode = 'i'; return; }
      let mk = key; if (op === 'c' && key === 'w' && this.cls(this.line[this.x]) !== 0) mk = 'e';
      const m = mk === 'e' && key === 'w' && this.cls(this.line[this.x + 1]) !== this.cls(this.line[this.x]) && !(n > 1) ? { y: this.y, x: this.x } : this.motion(mk, n); if (!m) return;
      if (key === 'w' && m.y > this.y && op !== 'c') { m.y = this.y; m.x = this.line.length; }
      if (mk === 'e' && key === 'w') m.incl = true;
      this.applyOp(op, m, n); return;
    }
    if ('dcy'.includes(key) && key.length === 1) { this.op = key; return; }
    if (key === '.') { this.reset(); this.msg = 'repeat (.) is not supported in this vi'; return; }
    const cnt = n || 1; this.reset();
    switch (key) {
      case 'i': this.snap(); this.mode = 'i'; return;
      case 'a': this.snap(); this.mode = 'i'; if (this.line.length) this.x++; return;
      case 'I': this.snap(); this.mode = 'i'; this.x = this.firstNb(this.y); if (!/\S/.test(this.line)) this.x = this.line.length; return;
      case 'A': this.snap(); this.mode = 'i'; this.x = this.line.length; return;
      case 'o': this.snap(); this.lines.splice(this.y + 1, 0, ''); this.y++; this.x = 0; this.mode = 'i'; return;
      case 'O': this.snap(); this.lines.splice(this.y, 0, ''); this.x = 0; this.mode = 'i'; return;
      case 'x': case 'Delete': if (this.line.length) this.applyOp('d', { y: this.y, x: Math.min(this.line.length, this.x + cnt), line: false }); return;
      case 'X': if (this.x > 0) this.applyOp('d', { y: this.y, x: Math.max(0, this.x - cnt) }); return;
      case 's': this.applyOp('c', { y: this.y, x: Math.min(this.line.length, this.x + cnt) }); this.mode = 'i'; return;
      case 'S': this.applyOp('c', { y: Math.min(this.lines.length - 1, this.y + cnt - 1), x: 0, line: true }); return;
      case 'D': this.applyOp('d', this.motion('$', cnt)); return;
      case 'C': this.applyOp('c', this.motion('$', cnt)); this.mode = 'i'; return;
      case 'Y': this.applyOp('y', { y: Math.min(this.lines.length - 1, this.y + cnt - 1), x: 0, line: true }); return;
      case 'p': for (let i = 0; i < cnt; i++) this.put(false); return;
      case 'P': for (let i = 0; i < cnt; i++) this.put(true); return;
      case 'r': this.pre = 'r'; this.count = String(cnt); return;
      case 'Z': this.pre = 'Z'; return;
      case 'J': { if (this.y >= this.lines.length - 1) return; this.snap(); const a = this.line.replace(/\s+$/, ''), b = this.lines[this.y + 1].replace(/^\s+/, ''); this.lines.splice(this.y, 2, a + (a && b ? ' ' : '') + b); this.x = Math.max(0, a.length); return; }
      case '~': { if (!this.line.length) return; this.snap(); const ch = this.line[this.x]; this.lines[this.y] = this.line.slice(0, this.x) + (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()) + this.line.slice(this.x + 1); this.x++; return; }
      case 'u': { const s = this.undo.pop(); if (!s) { this.msg = 'Already at oldest change'; return; } this.redo.push({ l: this.lines, y: this.y, x: this.x }); this.lines = s.l; this.y = s.y; this.x = s.x; return; }
      case 'C-r': { const s = this.redo.pop(); if (!s) { this.msg = 'Already at newest change'; return; } this.undo.push({ l: this.lines, y: this.y, x: this.x }); this.lines = s.l; this.y = s.y; this.x = s.x; return; }
      case ':': this.mode = 'c'; this.cl = { p: ':', t: '' }; return;
      case '/': case '?': this.mode = 'c'; this.cl = { p: key, t: '' }; return;
      case 'C-f': case 'PageDown': this.y = Math.min(this.lines.length - 1, this.y + this.rows - 2); this.top = Math.min(this.y, this.top + this.rows - 2); return;
      case 'C-b': case 'PageUp': this.y = Math.max(0, this.y - this.rows + 2); return;
      case 'C-d': this.y = Math.min(this.lines.length - 1, this.y + (this.rows >> 1)); return;
      case 'C-u': this.y = Math.max(0, this.y - (this.rows >> 1)); return;
      case 'v': case 'V': this.msg = 'visual mode is not supported in this vi: use d/y/c with a motion (dw, y$, 3dd …)'; return;
    }
    const m = this.motion(key, n);
    if (m) { this.y = m.y; this.x = m.x; if (m.keep) this.keepWant = true; if (key === 'G' || key === 'gg') { /* absolute jump */ } }
  }
  cmdKey(k) {
    const c = this.cl;
    if (k === 'Escape' || k === 'C-c') { this.mode = 'n'; this.cl = null; return; }
    if (k === 'Backspace') { if (!c.t) { this.mode = 'n'; this.cl = null; } else c.t = c.t.slice(0, -1); return; }
    if (k === 'Enter') { this.mode = 'n'; this.cl = null; if (c.p === ':') this.ex(c.t); else if (c.t) { this.last = { pat: c.t, dir: c.p === '/' ? 1 : -1 }; const m = this.find(c.t, this.last.dir); if (m) { this.y = m.y; this.x = m.x; } } else if (this.last) { const m = this.find(this.last.pat, this.last.dir); if (m) { this.y = m.y; this.x = m.x; } } return; }
    if (k.length === 1) c.t += k; else if (k === 'Tab') c.t += '\t';
  }
  /* ---- ex commands ---- */
  save(name) {
    name = name || this.name; if (!name) { this.msg = 'E32: No file name'; return false; }
    if (this.readOnly && name === this.name) { this.msg = 'E45: \'readonly\' option is set (add ! to override)'; return false; }
    const t = this.text(); const err = this.writeFn ? this.writeFn(name, t) : null; if (err) { this.msg = err; return false; }
    if (!this.name) this.name = name; if (name === this.name) this.dirty = false; this.msg = `"${name}" ${t ? this.lines.length : 0}L, ${t.length}B written`; return true;
  }
  ex(cmd) {
    cmd = cmd.trim().replace(/^:+/, ''); if (!cmd) return;
    if (/^\d+$/.test(cmd)) { this.y = Math.max(0, Math.min(this.lines.length - 1, Number(cmd) - 1)); this.x = this.firstNb(this.y); return; }
    if (cmd === '$') { this.y = this.lines.length - 1; this.x = this.firstNb(this.y); return; }
    let m;
    if ((m = /^(?:(%)|(\d+|\.|\$)(?:,(\d+|\.|\$))?)?s([^\w\s])(.*)$/.exec(cmd))) return this.sub(m);
    if ((m = /^(?:(%)|(\d+|\.|\$)(?:,(\d+|\.|\$))?)?d$/.exec(cmd))) { const [a, b] = this.range(m); this.y = a; this.x = 0; this.applyOp('d', { y: b, x: 0, line: true }); return; }
    const [, name, bang, arg] = /^(\w+)(!?)\s*(.*)$/.exec(cmd) || [];
    switch (name) {
      case 'w': case 'write': this.save(arg); return;
      case 'wq': case 'x': case 'xit': case 'exit': if (name !== 'wq' && !this.dirty && this.name && !arg) { this.done = true; return; } if (this.save(arg)) this.done = true; return;
      case 'q': case 'quit': case 'qa': case 'qall': case 'cq': if (this.dirty && !bang) { this.msg = 'E37: No write since last change (add ! to override)'; return; } this.done = true; return;
      case 'set': case 'se': for (const o of arg.split(/\s+/)) { if (/^(nu|number)$/.test(o)) this.number = true; else if (/^(nonu|nonumber)$/.test(o)) this.number = false; else if (o && !/^(ts|sw|tabstop|shiftwidth|expandtab|et|autoindent|ai|noai|hlsearch|hls|nohls|ic|ignorecase|list|nolist|paste|nopaste)/.test(o)) { this.msg = `E518: Unknown option: ${o}`; } else if (o) this.msg = `(":set ${o}" is accepted but has no effect here)`; } return;
      case 'noh': case 'nohlsearch': return;
      case 'h': case 'help': this.msg = 'i a o insert · Esc normal · h j k l move · w b e 0 $ gg G · x dd dw yy p u · /text n · :w :q :wq :q! · :%s/a/b/g · ZZ save+quit'; return;
      case 'e': case 'edit': if (!bang && this.dirty) { this.msg = 'E37: No write since last change (add ! to override)'; return; } this.msg = 'opening another file is not supported: quit and run vi again'; return;
    }
    if (cmd[0] === '!') { this.msg = 'shell escapes are not supported: quit with :q and run the command in the terminal'; return; }
    this.msg = `E492: Not an editor command: ${cmd}`;
  }
  range(m) { const L = this.lines.length; const p = s => s === '.' ? this.y : s === '$' ? L - 1 : Number(s) - 1; if (m[1]) return [0, L - 1]; const a = m[2] ? p(m[2]) : this.y; const b = m[3] ? p(m[3]) : a; return [Math.max(0, Math.min(a, b)), Math.min(L - 1, Math.max(a, b))]; }
  sub(m) {
    const d = m[4]; const rest = m[5]; const parts = []; let cur = '', esc = false;
    for (const ch of rest) { if (esc) { cur += ch === d ? ch : '\\' + ch; esc = false; } else if (ch === '\\') esc = true; else if (ch === d && parts.length < 2) { parts.push(cur); cur = ''; } else cur += ch; }
    parts.push(cur); const [pat, rep = '', flags = ''] = parts; if (!pat) { this.msg = 'E35: No previous regular expression'; return; }
    let rx; try { rx = new RegExp(pat, flags.includes('g') ? (flags.includes('i') ? 'gi' : 'g') : flags.includes('i') ? 'i' : ''); } catch (e) { this.msg = 'E486: Pattern not found: ' + pat; return; }
    const [a, b] = this.range(m); this.last = { pat, dir: 1 }; let cnt = 0; const snapL = this.lines.slice(), sy = this.y, sx = this.x;
    for (let y = a; y <= b; y++) { const nl = this.lines[y].replace(rx, (...g) => { cnt++; return rep.replace(/\\(\d)|\\&|&/g, (s, dg) => dg !== undefined ? (g[Number(dg)] ?? '') : s === '\\&' ? '&' : g[0]); }); this.lines[y] = nl; }
    if (!cnt) { this.msg = `E486: Pattern not found: ${pat}`; return; }
    this.undo.push({ l: snapL, y: sy, x: sx }); this.redo = []; this.dirty = true; this.y = b; this.x = this.firstNb(b); if (cnt > 1) this.msg = `${cnt} substitutions`;
  }
  /* ---- view ---- */
  screen() {
    const nw = this.number ? String(this.lines.length).length + 1 : 0; const rows = [];
    for (let i = 0; i < this.rows; i++) { const y = this.top + i; if (y >= this.lines.length) { rows.push('~'); continue; } const t = this.expand(this.lines[y]).slice(this.left, this.left + this.cols - nw); rows.push((this.number ? String(y + 1).padStart(nw - 1) + ' ' : '') + t); }
    const crow = this.y - this.top, ccol = this.disp(this.y, this.x) - this.left + nw;
    const pct = this.lines.length <= this.rows ? 'All' : this.top === 0 ? 'Top' : this.top + this.rows >= this.lines.length ? 'Bot' : Math.floor(100 * this.top / (this.lines.length - this.rows)) + '%';
    const left = this.mode === 'c' ? this.cl.p + this.cl.t : this.mode === 'i' ? '-- INSERT --' : this.msg;
    return { rows, cursor: this.mode === 'c' ? { row: this.rows, col: 1 + this.cl.t.length } : { row: crow, col: ccol }, bottom: left, ruler: this.mode === 'c' ? '' : `${this.y + 1},${this.x + 1}  ${pct}`, mode: this.mode };
  }
};

/* the command: vi / vim / view open a full-pane editor in the page; there is no screen to draw on in a headless run */
{
  const viCmd = async (ctx, args, ro) => {
    const files = args.filter(a => !a.startsWith('-')); const name = files[0]; let text = '', exists = false, path = null;
    if (name) { path = ctx.resolve(name); if (ctx.fs.isDir(path)) { ctx.eprintln(`"${name}" is a directory`); return 1; } const t = ctx.fs.read(path); if (t !== undefined) { text = t; exists = true; } }
    const term = ctx.sh.term; if (!term || !term.edit) { ctx.println('(vi draws a full-screen editor in the browser page; it cannot run here)'); return 1; }
    const vi = new PG.Vi({ text, name: name || '', exists: name ? exists : undefined, readOnly: ro, write: (n, t) => { const p = ctx.resolve(n); if (ctx.fs.isDir(p)) return `"${n}" is a directory`; ctx.fs.write(p, t); return null; } });
    await term.edit(vi); return 0;
  };
  PG.commands.vi = PG.commands.vim = PG.commands.nvim = async (ctx, args) => viCmd(ctx, args, false);
  PG.commands.view = async (ctx, args) => viCmd(ctx, args, true);
  PG.commands.nano = async ctx => { ctx.eprintln('nano is not installed here: use vi (try: vi notes.txt, then i to type, Esc, :wq to save)'); return 1; };
}
