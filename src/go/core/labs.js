// Ported verbatim from the prototype (public/prototype.html). Framework-free; load it lazily on the client.
/* eslint-disable */
// @ts-nocheck

/* =====================================================================
   Pure helpers used by the views: a QR encoder (presentation mode), a reader for
   `go tool trace -d=parsed` dumps, and small teaching models of runtime internals.
   ===================================================================== */
// GothikQR — QR Code Model 2 encoder (byte mode, UTF-8, versions 1–40, ECC L/M/Q/H).
// GothikQR.matrix(text, {ecc, version?, mask?}) -> {version, ecc, mask, size, modules: [[0|1]]}
// GothikQR.svg(text, {ecc, border}) -> '<svg …>' (dark modules only, fill=currentColor)
(function () {
  'use strict';
  // Indexed by version (index 0 unused). Source: ISO/IEC 18004 table 9.
  const ECW = {
    L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  };
  const BLOCKS = {
    L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
  };
  const FMT = { L: 1, M: 0, Q: 3, H: 2 };

  // Modules available for codewords after removing all function patterns.
  function rawModules(v) {
    let n = (16 * v + 128) * v + 64;
    if (v >= 2) {
      const a = Math.floor(v / 7) + 2;
      n -= (25 * a - 10) * a - 55;
      if (v >= 7) n -= 36;
    }
    return n;
  }
  const dataCodewords = (v, e) => (rawModules(v) >> 3) - ECW[e][v] * BLOCKS[e][v];
  const fits = (v, e, len) => 4 + (v < 10 ? 8 : 16) + 8 * len <= dataCodewords(v, e) * 8;
  const capacity = (e) => { let n = dataCodewords(40, e) - 3; while (!fits(40, e, n)) n--; return n; };

  // GF(256) with the QR polynomial x^8+x^4+x^3+x^2+1.
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  for (let i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

  function rsDivisor(deg) {
    const r = new Array(deg).fill(0);
    r[deg - 1] = 1;
    for (let i = 0, root = 1; i < deg; i++, root = mul(root, 2)) {
      for (let j = 0; j < deg; j++) { r[j] = mul(r[j], root); if (j + 1 < deg) r[j] ^= r[j + 1]; }
    }
    return r;
  }
  function rsRemainder(data, div) {
    const r = new Array(div.length).fill(0);
    for (const b of data) {
      const f = b ^ r.shift();
      r.push(0);
      for (let i = 0; i < div.length; i++) r[i] ^= mul(div[i], f);
    }
    return r;
  }

  function codewords(bytes, v, e) {
    const cap = dataCodewords(v, e) * 8, bits = [];
    const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4);
    put(bytes.length, v < 10 ? 8 : 16);
    for (const b of bytes) put(b, 8);
    put(0, Math.min(4, cap - bits.length));
    put(0, (8 - (bits.length % 8)) % 8);
    for (let p = 0xec; bits.length < cap; p ^= 0xec ^ 0x11) put(p, 8);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));

    // Split into blocks (short blocks first, long ones have one more data codeword), then interleave.
    const nb = BLOCKS[e][v], ecLen = ECW[e][v], div = rsDivisor(ecLen);
    const shortLen = Math.floor((rawModules(v) >> 3) / nb) - ecLen, numShort = nb - ((rawModules(v) >> 3) % nb);
    const dBlocks = [], eBlocks = [];
    for (let i = 0, k = 0; i < nb; i++) {
      const d = data.slice(k, (k += shortLen + (i < numShort ? 0 : 1)));
      dBlocks.push(d);
      eBlocks.push(rsRemainder(d, div));
    }
    const out = [];
    for (let i = 0; i <= shortLen; i++) for (const d of dBlocks) if (i < d.length) out.push(d[i]);
    for (let i = 0; i < ecLen; i++) for (const ec of eBlocks) out.push(ec[i]);
    return out;
  }

  function alignmentPositions(v) {
    if (v === 1) return [];
    const n = Math.floor(v / 7) + 2, size = v * 4 + 17;
    const step = Math.floor((v * 8 + n * 3 + 5) / (n * 4 - 4)) * 2;
    const out = [6];
    for (let p = size - 7; out.length < n; p -= step) out.splice(1, 0, p);
    return out;
  }

  const MASKS = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
  ];

  function build(cw, v, e) {
    const size = v * 4 + 17;
    const m = Array.from({ length: size }, () => new Uint8Array(size)); // m[y][x]
    const fn = Array.from({ length: size }, () => new Uint8Array(size));
    const set = (x, y, dark) => { m[y][x] = dark ? 1 : 0; fn[y][x] = 1; };

    for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
      }
    }
    const al = alignmentPositions(v), last = al.length - 1;
    al.forEach((cy, i) => al.forEach((cx, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return; // finder corners
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }));
    if (v >= 7) {
      let r = v;
      for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
      const bits = (v << 12) | r;
      for (let i = 0; i < 18; i++) {
        const b = (bits >>> i) & 1, a = size - 11 + (i % 3), c = Math.floor(i / 3);
        set(a, c, b); set(c, a, b);
      }
    }
    const drawFormat = (mask) => {
      const d = (FMT[e] << 3) | mask;
      let r = d;
      for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const bits = ((d << 10) | r) ^ 0x5412, bit = (i) => (bits >>> i) & 1;
      for (let i = 0; i <= 5; i++) set(8, i, bit(i));
      set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
      set(8, size - 8, 1); // the always-dark module
    };
    drawFormat(0); // reserve the format areas so data placement skips them

    // Zig-zag placement in 2-wide columns from the bottom-right; column 6 is the timing pattern.
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      const up = ((right + 1) & 2) === 0;
      for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
        const x = right - j, y = up ? size - 1 - vert : vert;
        if (!fn[y][x] && i < cw.length * 8) { m[y][x] = (cw[i >> 3] >>> (7 - (i & 7))) & 1; i++; }
      }
    }
    const applyMask = (k) => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && MASKS[k](x, y)) m[y][x] ^= 1; };
    return { m, size, applyMask, drawFormat };
  }

  // ISO 18004 §7.8.3 penalty, written to match segno's reading of the N3 rule (edges count as light).
  function penalty(m, size) {
    let n1 = 0, n2 = 0, n3 = 0, dark = 0;
    const n3scan = (s) => {
      for (let i = 0; i + 7 <= size; ) {
        if (!(s[i] && !s[i + 1] && s[i + 2] && s[i + 3] && s[i + 4] && !s[i + 5] && s[i + 6])) { i++; continue; }
        const lightBefore = !s.slice(Math.max(i - 4, 0), i).some(Boolean);
        const lightAfter = !s.slice(i + 7, Math.min(i + 11, size)).some(Boolean);
        if (i === 0 || i === size - 7 || lightBefore || lightAfter) { n3 += 40; i += 7; } else i += 4;
      }
    };
    const runs = (s) => {
      let run = 1;
      for (let i = 1; i <= size; i++) {
        if (i < size && s[i] === s[i - 1]) run++;
        else { if (run >= 5) n1 += run - 2; run = 1; }
      }
    };
    for (let y = 0; y < size; y++) {
      const row = m[y], col = new Uint8Array(size);
      for (let x = 0; x < size; x++) {
        col[x] = m[x][y];
        dark += row[x];
        if (y && x && row[x] === row[x - 1] && row[x] === m[y - 1][x] && row[x] === m[y - 1][x - 1]) n2 += 3;
      }
      runs(row); runs(col); n3scan(row); n3scan(col);
    }
    return n1 + n2 + n3 + 10 * Math.floor(Math.abs((dark / (size * size)) * 100 - 50) / 5);
  }

  function matrix(text, opts = {}) {
    const e = String(opts.ecc || 'M').toUpperCase();
    if (!(e in FMT)) throw new Error(`GothikQR: unknown ecc level "${opts.ecc}" (use L, M, Q or H)`);
    const bytes = new TextEncoder().encode(String(text));
    let v = opts.version;
    if (v != null) {
      if (!(v >= 1 && v <= 40 && fits(v, e, bytes.length))) throw new Error(`GothikQR: ${bytes.length} bytes do not fit version ${v}-${e}`);
    } else {
      for (v = 1; v <= 40 && !fits(v, e, bytes.length); v++);
      if (v > 40) throw new Error(`GothikQR: text is ${bytes.length} bytes (UTF-8); a QR code with ECC ${e} holds at most ${capacity(e)} bytes`);
    }
    const q = build(codewords(bytes, v, e), v, e);
    let mask = opts.mask;
    if (mask == null) {
      let best = Infinity;
      for (let k = 0; k < 8; k++) {
        q.applyMask(k); q.drawFormat(k);
        const p = penalty(q.m, q.size);
        if (p < best) { best = p; mask = k; }
        q.applyMask(k); // XOR again to undo
      }
    }
    q.applyMask(mask); q.drawFormat(mask);
    return { version: v, ecc: e, mask, size: q.size, modules: q.m.map((r) => Array.from(r)) };
  }

  function svg(text, opts = {}) {
    const { size, modules } = matrix(text, opts);
    const b = opts.border == null ? 4 : opts.border, n = size + 2 * b;
    let d = '';
    modules.forEach((row, y) => {
      for (let x = 0; x < size; x++) {
        if (!row[x]) continue;
        let w = 1;
        while (x + w < size && row[x + w]) w++;
        d += `M${x + b} ${y + b}h${w}v1h-${w}z`;
        x += w;
      }
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path fill="currentColor" d="${d}"/></svg>`;
  }

  const api = Object.freeze({ matrix, svg, capacity });
  globalThis.GothikQR = api;
  if (typeof module !== 'undefined') module.exports = api;
})();

// GothikTraceImport — reads the text dump of `go tool trace -d=parsed trace.out` (Go 1.22+ trace format)
// and turns goroutine state transitions into per-goroutine runs; toGantt() draws them as an SVG timeline.
(function () {
  'use strict';
  const MAX_LINES = 2000000;
  const STATES = { Running: 'running', Runnable: 'runnable', Waiting: 'waiting', Syscall: 'syscall' };
  const HEAD = /^M=(-?\d+) P=(-?\d+) G=(-?\d+) (\w+) Time=(\d+)/;
  const TRANS = / (GoID|ProcID)=(\d+) (\w+)->(\w+)(?: Reason="((?:[^"\\]|\\.)*)")?/;
  const GOMAXPROCS = /Name="\/sched\/gomaxprocs:threads" Value=Value\{Uint64\((\d+)\)\}/;

  function parse(text) {
    if (typeof text !== 'string') return { error: 'Expected text from `go tool trace -d=parsed trace.out`.' };
    const gs = new Map(), warn = new Map();
    const note = (msg) => warn.set(msg, (warn.get(msg) || 0) + 1);
    let tMin = Infinity, tMax = -Infinity, lastT = -Infinity, maxP = -1, gomaxprocs = 0, events = 0, lines = 0;

    for (let pos = 0; pos < text.length; ) {
      if (++lines > MAX_LINES) { note(`Stopped after ${MAX_LINES.toLocaleString('en')} lines; the rest of the trace was ignored`); break; }
      let nl = text.indexOf('\n', pos);
      if (nl < 0) nl = text.length;
      const line = text.slice(pos, nl);
      pos = nl + 1;
      if (!line.startsWith('M=')) continue; // stacks, "Stack=", blank lines
      const h = HEAD.exec(line);
      if (!h) { note('Skipped unrecognised event lines'); continue; }
      const p = +h[2], kind = h[4], t = Number(h[5]);
      events++;
      if (t < lastT) note('Events out of time order');
      lastT = t;
      if (t < tMin) tMin = t;
      if (t > tMax) tMax = t;
      if (p > maxP) maxP = p;
      if (kind === 'Metric') {
        const m = GOMAXPROCS.exec(line);
        if (m) gomaxprocs = Math.max(gomaxprocs, +m[1]);
        continue;
      }
      if (kind !== 'StateTransition') continue;
      const tr = TRANS.exec(line);
      if (!tr) { note('Skipped unrecognised state transitions'); continue; }
      const [, what, idStr, from, to, reason = ''] = tr;
      if (what === 'ProcID') { maxP = Math.max(maxP, +idStr); continue; }

      let g = gs.get(+idStr);
      if (!g) gs.set(+idStr, (g = { n: +idStr, runs: [], created: null, ended: null, cur: null }));
      if (g.cur && from !== 'Undetermined' && STATES[from] !== g.cur.state) note('State transitions that did not match the previous state');
      if (g.cur) { g.cur.end = t; g.runs.push(g.cur); g.cur = null; }
      if (from === 'NotExist') g.created = t;
      if (to === 'NotExist') { g.ended = t; continue; }
      const state = STATES[to];
      if (!state) { note(`Ignored unknown goroutine state "${to}"`); continue; }
      g.cur = { state, start: t, end: t, reason, p: (state === 'running' || state === 'syscall') && p >= 0 ? p : null };
    }

    if (!events) return { error: 'No trace events found. Open the text file made by `go tool trace -d=parsed trace.out` (Go 1.22 or newer), not the binary trace.out itself.' };
    if (!gs.size) return { error: 'The trace has no goroutine state transitions.' };

    const rel = (t) => (t == null ? null : t - tMin);
    const goroutines = [...gs.values()].sort((a, b) => a.n - b.n).map((g) => {
      if (g.cur) { g.cur.end = tMax; g.runs.push(g.cur); }
      const runs = [];
      for (const r of g.runs) {
        if (r.end <= r.start) continue; // zero-length
        const prev = runs[runs.length - 1];
        const run = { state: r.state, start: rel(r.start), end: rel(r.end), reason: r.reason, p: r.p };
        if (prev && prev.end === run.start && prev.state === run.state && prev.reason === run.reason && prev.p === run.p) prev.end = run.end;
        else runs.push(run);
      }
      return { id: 'G' + g.n, runs, created: rel(g.created), ended: rel(g.ended) };
    });
    return {
      t0: 0,
      t1: tMax - tMin,
      origin: tMin, // absolute trace clock of t0, in ns
      procs: Math.max(maxP + 1, gomaxprocs),
      goroutines,
      warnings: [...warn].map(([msg, n]) => (n > 1 ? `${msg} (${n}×)` : msg)),
    };
  }

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // Formats ns with a unit chosen from `scale` (so all ticks on an axis share a unit).
  function fmt(ns, scale = ns) {
    const [div, unit] = scale >= 1e6 ? [1e6, 'ms'] : scale >= 1e3 ? [1e3, 'µs'] : [1, 'ns'];
    return `${+(ns / div).toFixed(2)} ${unit}`;
  }

  function niceStep(raw) {
    const mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * mag;
  }

  function toGantt(parsed, width = 800) {
    const W = Math.max(200, +width || 800), labelW = 44, axisH = 22, rowH = 16, padR = 12;
    const style = '<style>.gtg-l{fill:var(--text-dim);font:10px ui-monospace,monospace}.gtg-a{stroke:var(--text-dim);stroke-opacity:.35}' +
      '.gtg-running{fill:var(--c-gor)}.gtg-runnable{fill:color-mix(in srgb,var(--c-gor) 32%,transparent)}' +
      '.gtg-waiting{fill:var(--signal)}.gtg-syscall{fill:var(--c-chan)}</style>';
    if (!parsed || parsed.error || !parsed.goroutines || !parsed.goroutines.length) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 30" width="${W}" height="30">${style}<text class="gtg-l" x="8" y="19">No goroutine data</text></svg>`;
    }
    const gsList = parsed.goroutines, span = Math.max(1, parsed.t1), plotW = W - labelW - padR;
    const H = axisH + gsList.length * rowH + 4;
    const x = (t) => labelW + (t / span) * plotW;
    const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Goroutine timeline">`, style];

    const step = niceStep(span / Math.max(2, Math.floor(plotW / 90)));
    for (let t = 0; t <= span + 1e-9; t += step) {
      const px = x(t).toFixed(1);
      out.push(`<line class="gtg-a" x1="${px}" x2="${px}" y1="${axisH - 4}" y2="${H}"/><text class="gtg-l" x="${px}" y="${axisH - 8}" text-anchor="middle">${esc(fmt(t, step))}</text>`);
    }
    gsList.forEach((g, i) => {
      const y = axisH + i * rowH;
      out.push(`<text class="gtg-l" x="${labelW - 6}" y="${y + rowH / 2 + 3.5}" text-anchor="end">${esc(g.id)}</text>`);
      for (const r of g.runs) {
        // ponytail: one rect per run; huge traces (100k+ runs) give big SVGs — bucket sub-pixel runs if that bites.
        const w = Math.max(0.5, x(r.end) - x(r.start));
        const tip = `${g.id} ${r.state}${r.reason ? ` (${r.reason})` : ''} · ${fmt(r.start)} → ${fmt(r.end)} · ${fmt(r.end - r.start)}${r.p != null ? ` · P${r.p}` : ''}`;
        out.push(`<rect class="gtg-${r.state}" x="${x(r.start).toFixed(2)}" y="${y + 3}" width="${w.toFixed(2)}" height="${rowH - 6}"><title>${esc(tip)}</title></rect>`);
      }
    });
    out.push('</svg>');
    return out.join('');
  }

  const api = Object.freeze({ parse, toGantt });
  globalThis.GothikTraceImport = api;
  if (typeof module !== 'undefined') module.exports = api;
})();

// GothikModels — small, deterministic teaching models of Go runtime internals.
// Every function is pure and returns plain data for UI widgets. These are simplified on purpose;
// each one says where it departs from the real runtime.
(function () {
  'use strict';
  const hex = (n, w) => n.toString(16).toUpperCase().padStart(w, '0');

  // ---------- UTF-8: how a Go string's bytes relate to its runes ----------
  // Lone UTF-16 surrogates (impossible in Go source) become U+FFFD, as Go's string(rune) and TextEncoder do.
  function utf8(str) {
    const bytes = [], runes = [];
    for (const ch of String(str ?? '')) {
      let cp = ch.codePointAt(0);
      const invalid = cp >= 0xd800 && cp <= 0xdfff;
      if (invalid) cp = 0xfffd;
      const enc = cp < 0x80 ? [cp]
        : cp < 0x800 ? [0xc0 | (cp >> 6), 0x80 | (cp & 63)]
        : cp < 0x10000 ? [0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63)]
        : [0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63)];
      const rune = { i: bytes.length, char: invalid ? '�' : ch, code: 'U+' + hex(cp, 4), size: enc.length };
      if (invalid) rune.invalid = true;
      for (const b of enc) bytes.push({ i: bytes.length, hex: hex(b, 2), dec: b, rune: runes.length });
      runes.push(rune);
    }
    return { bytes, runes, len: bytes.length, runeCount: runes.length };
  }

  // ---------- Swiss-table map (Go 1.24+), simplified ----------
  // Teaching hash: 64-bit FNV-1a over the UTF-8 of String(key). Go uses a seeded AES/wyhash per map.
  // h1 = hash >> 7 picks the first group, h2 = low 7 bits is the control byte stored per slot.
  // Simplifications: linear group probing (Go probes quadratically), one table (Go splits big maps into
  // directories of tables), growth at 7/8 load even for a single group (Go's small map holds 8).
  const FNV_OFFSET = 0xcbf29ce484222325n, FNV_PRIME = 0x100000001b3n, MASK64 = (1n << 64n) - 1n;
  function fnv1a64(s) {
    let h = FNV_OFFSET;
    for (const b of new TextEncoder().encode(s)) h = ((h ^ BigInt(b)) * FNV_PRIME) & MASK64;
    return h;
  }

  function swissMap(ops, { groupSize = 8 } = {}) {
    const newGroups = (n) => Array.from({ length: n }, () => Array.from({ length: groupSize }, () => ({ ctrl: 'empty', key: undefined })));
    let groups = newGroups(1), used = 0, tombstones = 0;
    const steps = [];
    const hashOf = (key) => {
      const h = fnv1a64(String(key));
      return { hash: h.toString(16).padStart(16, '0'), h1: h >> 7n, h2: Number(h & 0x7fn).toString(16).padStart(2, '0') };
    };
    // Probe groups from h1; stop at the key, or at the first group that still has an empty slot.
    const find = (key, h) => {
      const probe = [];
      let free = null;
      for (let i = 0; i < groups.length; i++) {
        const gi = Number((h.h1 + BigInt(i)) & BigInt(groups.length - 1));
        const g = groups[gi];
        probe.push(gi);
        for (let s = 0; s < groupSize; s++) {
          if (g[s].ctrl === h.h2 && g[s].key === key) return { probe, at: { group: gi, slot: s }, free: null };
          if (!free && g[s].ctrl === 'deleted') free = { group: gi, slot: s };
        }
        const e = g.findIndex((s) => s.ctrl === 'empty');
        if (e >= 0) return { probe, at: null, free: free || { group: gi, slot: e } };
      }
      return { probe, at: null, free };
    };
    const record = (event, key, h, probe, slot, extra) => steps.push({
      event, key, hash: h && h.hash, h2: h && h.h2, start: h ? Number(h.h1 & BigInt(groups.length - 1)) : null,
      probe, slot, ...extra, used, tombstones, capacity: groups.length * groupSize,
      groups: groups.map((g) => ({ slots: g.map((s) => ({ ctrl: s.ctrl, key: s.key })) })),
    });
    const place = (key, h, at) => { groups[at.group][at.slot] = { ctrl: h.h2, key }; used++; };

    for (const op of ops || []) {
      const isDel = op && typeof op === 'object' && op.op === 'delete';
      const key = op && typeof op === 'object' && 'key' in op ? op.key : op;
      const h = hashOf(key);
      let r = find(key, h);
      if (isDel) {
        if (r.at) {
          const g = groups[r.at.group];
          // A tombstone is only needed when the group is full: an empty slot would end other keys' probes early.
          const ctrl = g.some((s) => s.ctrl === 'empty') ? 'empty' : 'deleted';
          g[r.at.slot] = { ctrl, key: undefined };
          used--;
          if (ctrl === 'deleted') tombstones++;
        }
        record('delete', key, h, r.probe, r.at, { found: !!r.at });
        continue;
      }
      if (r.at) { record('insert', key, h, r.probe, r.at, { found: true }); continue; }
      const reusesTombstone = r.free && groups[r.free.group][r.free.slot].ctrl === 'deleted';
      if (!r.free || (!reusesTombstone && used + tombstones + 1 > Math.floor((groups.length * groupSize * 7) / 8))) {
        const live = groups.flat().filter((s) => s.ctrl !== 'empty' && s.ctrl !== 'deleted');
        const from = groups.length;
        groups = newGroups(from * 2); used = 0; tombstones = 0;
        for (const s of live) { const hh = hashOf(s.key); place(s.key, hh, find(s.key, hh).free); }
        record('grow', key, null, [], null, { from, to: groups.length });
        r = find(key, h);
      }
      if (groups[r.free.group][r.free.slot].ctrl === 'deleted') tombstones--;
      place(key, h, r.free);
      record('insert', key, h, r.probe, r.free, { found: false });
    }
    return { steps, groupSize };
  }

  // ---------- Goroutine stack growth ----------
  // Model of runtime/stack.go: stacks start at 2 KiB (_FixedStack); a call that would overflow allocates a
  // stack doubled until the frame fits and copies the used part (newstack/copystack). At a GC point a stack
  // using under 1/4 of its size is halved (shrinkstack), never below the initial size.
  // Simplified: every frame is `frame` bytes and there is no stack guard area.
  // `depths` lists target call depths; the string 'gc' marks a GC safe point.
  function stackGrowth(depths, { initial = 2048, frame = 512 } = {}) {
    let size = initial, depth = 0, totalCopied = 0, maxSize = size;
    const steps = [];
    const push = (event, copied = 0) => { totalCopied += copied; steps.push({ event, depth, size, used: depth * frame, copied }); };
    for (const d of depths || []) {
      if (d === 'gc') {
        const used = depth * frame;
        if (used < size / 4 && size / 2 >= initial) { size /= 2; push('shrink', used); } else push('gc');
        continue;
      }
      const target = Math.max(0, Math.floor(Number(d)));
      if (!Number.isFinite(target)) continue;
      while (depth < target) {
        if ((depth + 1) * frame > size) {
          while ((depth + 1) * frame > size) size *= 2;
          maxSize = Math.max(maxSize, size);
          push('grow', depth * frame);
        }
        depth++;
        push('call');
      }
      while (depth > target) { depth--; push('return'); }
    }
    return { steps, initial, frame, maxSize, totalCopied };
  }

  // ---------- G/M/P scheduler ----------
  // Discrete ticks; each P runs its G for one unit of work per tick. Modeled on runtime/proc.go:
  //  - `go f()` from main puts every G on P0's local queue (cap 256); when full, half of it plus the new G
  //    move to the global queue (runqputslow).
  //  - findRunnable: every 61st schedtick check the global queue first; then local queue; then a batch from
  //    global (globrunqget); then steal half of a random victim's queue and run the last stolen G (runqsteal).
  //  - A G that uses up its `slice` is preempted onto the global queue (gopreempt_m → globrunqput).
  // Simplified: no runnext slot, no Ms/syscalls/netpoller, victims in a seeded random order.
  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gmp({ goroutines = [], procs = 2, seed = 1, slice = 2, localCap = 256, maxTicks = 100000 } = {}) {
    const rand = mulberry32(seed >>> 0);
    const nP = Math.min(256, Math.max(1, procs | 0));
    const P = Array.from({ length: nP }, (_, id) => ({ id, running: null, left: 0, local: [], schedtick: 0 }));
    const global = [], left = new Map(), steps = [];
    let t = 0;
    const snap = (event, extra) => steps.push({
      t, event, ...extra, ps: P.map((p) => ({ id: p.id, running: p.running, local: [...p.local] })), global: [...global],
    });

    goroutines.forEach((g, i) => {
      const id = g.id ?? 'G' + (i + 1);
      left.set(id, Math.max(1, Math.floor(g.work) || 1));
      if (P[0].local.length < localCap) P[0].local.push(id);
      else global.push(...P[0].local.splice(0, localCap / 2), id);
    });
    snap('start', {});

    const schedule = (p) => {
      let g = null, event, from, stolen;
      if (p.schedtick % 61 === 0 && global.length) { g = global.shift(); event = 'global'; from = 'global'; }
      if (g == null && p.local.length) { g = p.local.shift(); event = 'run'; from = 'local'; }
      if (g == null && global.length) {
        const n = Math.min(global.length, Math.floor(global.length / nP) + 1, localCap / 2);
        const batch = global.splice(0, n);
        g = batch.shift(); p.local.push(...batch); event = 'global'; from = 'global';
      }
      if (g == null) {
        const victims = P.filter((v) => v !== p);
        for (let i = victims.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [victims[i], victims[j]] = [victims[j], victims[i]]; }
        for (const v of victims) {
          if (!v.local.length) continue;
          stolen = v.local.length - Math.floor(v.local.length / 2);
          const got = v.local.splice(0, stolen);
          g = got.pop(); p.local.push(...got); event = 'steal'; from = v.id;
          break;
        }
      }
      if (g == null) return;
      p.running = g; p.left = slice; p.schedtick++;
      snap(event, { g, from, to: p.id, ...(stolen && { stolen }) });
    };

    let remaining = left.size;
    while (remaining > 0 && t < maxTicks) {
      for (const p of P) if (p.running == null) schedule(p);
      for (const p of P) {
        if (p.running == null) continue;
        const g = p.running;
        left.set(g, left.get(g) - 1); p.left--;
        if (left.get(g) === 0) { p.running = null; remaining--; snap('done', { g, from: p.id }); }
        else if (p.left === 0) { p.running = null; global.push(g); snap('preempt', { g, from: p.id, to: 'global' }); }
      }
      t++;
    }
    return { steps, procs: nP, ticks: t, finished: remaining === 0 };
  }

  const api = Object.freeze({ utf8, swissMap, stackGrowth, gmp, fnv1a64 });
  globalThis.GothikLabModels = api; // the engine owns globalThis.GothikModels
  if (typeof module !== 'undefined') module.exports = api;
})();

export const { GothikQR, GothikTraceImport } = globalThis;
export const GothikLabModels = globalThis.GothikLabModels;
