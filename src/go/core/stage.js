// Ported verbatim from the prototype (public/prototype.html). Framework-free; load it lazily on the client.
/* eslint-disable */
// @ts-nocheck

/* =====================================================================
   GothikStage — "code cinema"
   Three seams that port 1:1 to React:
     layout(state)  pure + deterministic → nodes/edges in world space
     render         keyed SVG nodes, patched in place (never rebuilt per step)
     animate        one rAF loop: node tweens, edges re-routed every frame,
                    value flights, camera
   narrate(state, prev, depth) → one plain-English caption per step.
   ===================================================================== */
'use strict';
(function (global) {
  const SVG = 'http://www.w3.org/2000/svg';
  const MONO = 'ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, Consolas, monospace';
  const G = { row: 26, head: 30, pad: 10, gap: 14, laneGap: 40, regionGap: 110, laneMin: 190, heapRowW: 620, maxCells: 16 };
  let CW = 7.25; // mono char width at 12px; measured once

  function measure() {
    try {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.font = '12px ' + MONO;
      CW = ctx.measureText('MMMMMMMMMM').width / 10 || CW;
    } catch { /* keep default */ }
  }
  const tw = (s) => String(s).length * CW;
  const clip = (s, n = 26) => { s = String(s ?? ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const refOf = (box) => box?.ref?.to || /^→\s*([AvF]\d+)/.exec(box?.value || '')?.[1] || null;
  const plainName = (n) => String(n || '').replace(/^G\d+\s*·\s*/, '');
  const num = (id) => Number(String(id).replace(/\D/g, '')) || 0;

  /* ---------- state normalisation (accepts trace v1 or v2) ---------- */
  function goroutinesOf(s) {
    if (Array.isArray(s.goroutines) && s.goroutines.length) return s.goroutines;
    // v1 fallback: one frame per goroutine holding its flattened locals
    const tasks = s.tasks?.length ? s.tasks : [{ id: 'G1', state: s.status === 'finished' ? 'finished' : 'running' }];
    return tasks.map((t) => {
      const fr = (s.frames || []).find((f) => f.goroutine === t.id);
      const locals = (s.stack || []).filter((b) => b.name.startsWith(t.id + ' ·')).map((b) => ({ ...b, name: plainName(b.name) }));
      const calls = fr?.calls?.length ? fr.calls : ['main'];
      return { id: t.id, state: t.state, wait: t.wait, frames: calls.map((name, i) => ({ id: t.id + ':' + i + ':' + name, name, locals: i === calls.length - 1 ? locals : [] })) };
    });
  }

  /* ---------- layout (pure) ---------- */
  function slotRows(boxes, objById) {
    return boxes.map((b) => {
      const ref = refOf(b);
      let text;
      if (b.captured) text = '↑ shared';
      else if (b.inline && objById.get(b.inline)) {
        const o = objById.get(b.inline);
        const vals = o.values || [];
        text = o.kind === 'struct' && o.fields ? '{' + vals.map((v, i) => o.fields[i] + ':' + v).join(' ') + '}' : (o.kind === 'struct' ? '{' + vals.join(' ') + '}' : '[' + vals.join(' ') + ']');
      } else if (ref) {
        const r = b.ref || {};
        text = /^\[\]/.test(b.kind) || r.len !== undefined ? 'len ' + (r.len ?? '?') + ' · cap ' + (r.cap ?? '?') : /^map/.test(b.kind) ? 'map' : /^chan/.test(b.kind) ? 'chan' : /^\*/.test(b.kind) ? 'pointer' : '→';
      } else text = b.value;
      return { id: b.id, label: clip(plainName(b.name), 18), kind: b.kind, text: clip(text, 30), raw: b.value, ref: b.captured ? b.id : ref, captured: !!b.captured, slice: b.ref && b.ref.len !== undefined ? b.ref : null };
    });
  }

  function card(key, type, title, sub, rows, opts = {}) {
    const labelW = rows.length ? Math.max(...rows.map((r) => tw(r.label))) : 0;
    const valW = rows.length ? Math.max(56, ...rows.map((r) => tw(r.text) + (r.ref ? 22 : 12))) : 0;
    const titleW = tw(title) + (sub ? tw(sub) + 16 : 0) + 2 * G.pad + (opts.extraW || 0);
    const w = Math.max(opts.minW || 140, titleW, 2 * G.pad + labelW + 14 + valW);
    const h = G.head + (rows.length ? rows.length * G.row + 8 : 10);
    const vx = w - G.pad - valW;
    const slots = new Map();
    rows.forEach((r, i) => {
      const cy = G.head + 4 + i * G.row + G.row / 2;
      slots.set(r.id, { i, cy, vx, vw: valW, port: r.ref ? { x: w - G.pad - 9, y: cy } : null, in: { x: vx, y: cy } });
    });
    return { key, type, title, sub, rows, w, h, slots, cls: opts.cls || [], meta: opts.meta || {} };
  }

  function objectNode(o, hobj, gcOn) {
    const cls = [];
    if (hobj && !hobj.reachable) cls.push('garbage');
    if (gcOn && hobj?.color === 'grey') cls.push('gc-grey');
    if (gcOn && hobj?.color === 'black') cls.push('gc-black');
    const esc = o.escape && /heap/.test(o.escape.placement || '');
    if (esc) cls.push('escaped');
    const vals = o.values || [];
    const kindLabel = o.kind === 'array' ? (o.type || 'array') : o.kind;
    const title = kindLabel + ' · ' + o.id;
    const sub = hobj ? hobj.size + ' B' : '';
    if (o.kind === 'array') {
      const shown = vals.slice(0, G.maxCells);
      const cw = shown.map((v) => Math.max(30, tw(clip(v, 12)) + 14));
      const cells = []; let x = G.pad;
      shown.forEach((v, i) => { cells.push({ x, w: cw[i], text: clip(v, 12), i }); x += cw[i]; });
      const more = vals.length > shown.length;
      const w = Math.max(tw(title) + tw(sub) + 2 * G.pad + 22 + (esc ? 64 : 0), x + G.pad + (more ? 26 : 0));
      const h = G.head + 30 + 18;
      const slots = new Map();
      (o.refs || []).forEach((r) => { const c = cells[r.slot]; if (c) slots.set('s' + r.slot, { cy: G.head + 15, port: { x: c.x + c.w / 2, y: G.head + 15 } }); });
      return { key: o.id, type: 'obj', variant: 'array', title, sub, cells, more, total: vals.length, w, h, slots, cls, meta: { o, esc } };
    }
    const fields = o.fields || [];
    const rows = vals.slice(0, 24).map((v, i) => ({ id: 's' + i, label: o.kind === 'map' ? clip(String(v).split(': ')[0], 14) : clip(fields[i] ?? (o.kind === 'struct' ? '.' + i : '#' + i), 14), text: clip(o.kind === 'map' ? String(v).split(': ').slice(1).join(': ') : v, 24), ref: (o.refs || []).find((r) => r.slot === i)?.to || null }));
    const n = card(o.id, 'obj', title, sub, rows, { cls, minW: 150, extraW: esc ? 64 : 0, meta: { o, esc } });
    n.variant = o.kind;
    return n;
  }

  function chanNode(o) {
    const m = /capacity (\d+)/.exec(o.detail || '') || [];
    const cap = o.cap ?? Number(m[1] ?? 0);
    const ws = Number(/waiting senders (\d+)/.exec(o.detail || '')?.[1] || 0);
    const wr = Number(/waiting receivers (\d+)/.exec(o.detail || '')?.[1] || 0);
    const buf = o.values || [];
    const slotW = 40, n = Math.max(cap, 1);
    const pipeW = cap ? n * slotW + 12 : 96;
    const title = (o.type || 'chan') + ' · ' + o.id;
    const sub = cap ? 'cap ' + cap : 'unbuffered';
    const w = Math.max(pipeW + 2 * G.pad, tw(title) + tw(sub) + 2 * G.pad + 20);
    const h = G.head + 40 + (ws || wr ? 18 : 0) + 6;
    return { key: o.id, type: 'chan', title, sub, cap, buf, ws, wr, pipe: { x: (w - pipeW) / 2, y: G.head + 6, w: pipeW, h: 30, slotW }, w, h, slots: new Map(), cls: [], meta: { o } };
  }

  function layout(state, opt = {}) {
    const narrow = !!opt.narrow; // tall stage: channels + heap go below the stacks
    const s = state || {};
    const nodes = new Map(), edges = [];
    const objects = s.objects || [];
    const objById = new Map(objects.map((o) => [o.id, o]));
    const heapById = new Map((s.heapObjects || []).map((h) => [h.id, h]));
    const gcOn = s.gc && s.gc !== 'idle';
    const cellHome = new Map(); // cell id → {node, slot}
    let y0 = 0;

    // globals strip
    const globals = (s.globals || []).filter((g) => !/^func/.test(g.kind || ''));
    if (globals.length) {
      const n = card('globals', 'globals', 'package main', 'globals', slotRows(globals, objById), { minW: 200 });
      n.x = 0; n.y = 0; nodes.set(n.key, n);
      globals.forEach((g) => cellHome.set(g.id, { node: n.key, slot: g.id }));
      y0 = n.h + 46;
    }

    // goroutine lanes with stacked frames
    const gors = goroutinesOf(s).filter((g) => g.state !== 'finished' || g.id === 'G1'); // finished goroutines are gone
    let x = 0;
    nodes.set('lbl:stacks', { key: 'lbl:stacks', type: 'label', text: 'GOROUTINES · STACKS', x: 0, y: y0 - 22, w: 160, h: 14 });
    const laneTops = [];
    for (const g of gors) {
      const frames = (g.frames || []).map((f, i, all) => {
        const rows = slotRows(f.locals || [], objById);
        const top = i === all.length - 1;
        return card(f.id, 'frame', f.name + '()', f.line !== undefined && f.line >= 0 ? 'line ' + (f.line + (s.event ? 0 : 1)) : '', rows, { cls: top ? ['top'] : [], meta: { g: g.id, depth: i } });
      });
      const laneW = Math.max(G.laneMin, ...frames.map((f) => f.w + 2 * G.pad), tw(g.id + ' ' + (g.wait || g.state)) + 60);
      let fy = y0 + 44;
      for (const f of frames) {
        f.x = x + (laneW - f.w) / 2; f.y = fy; fy += f.h + G.gap;
        nodes.set(f.key, f);
        f.rows.forEach((r) => { if (!r.captured) cellHome.set(r.id, { node: f.key, slot: r.id }); });
      }
      const waitCh = /^(?:send|receive)\s+(A\d+)/.exec(g.wait || '')?.[1] || null;
      const lane = { key: 'lane:' + g.id, type: 'lane', gid: g.id, state: s.active === g.id && g.state === 'runnable' ? 'running' : g.state, wait: g.wait, waitCh, x, y: y0, w: laneW, h: Math.max(fy - y0 + 6, 120), cls: [g.state === 'waiting' ? 'waiting' : '', g.state === 'finished' ? 'finished' : '', s.active === g.id ? 'active' : ''].filter(Boolean), slots: new Map() };
      nodes.set(lane.key, lane);
      laneTops.push({ gid: g.id, top: frames.at(-1)?.key || lane.key });
      x += laneW + G.laneGap;
    }
    const lanesRight = Math.max(x - G.laneGap, G.laneMin);
    let lanesBottom = y0 + 120;
    for (const n of nodes.values()) if (n.type === 'lane') lanesBottom = Math.max(lanesBottom, n.y + n.h);

    // channels: a column right of the stacks, or a row below them when narrow
    const chans = objects.filter((o) => o.kind === 'channel' && !o.owner);
    let chanRight = lanesRight, chanBottom = lanesBottom;
    if (chans.length) {
      const built = chans.map(chanNode);
      if (narrow) {
        let cx = 0; const cy = lanesBottom + 64;
        nodes.set('lbl:chans', { key: 'lbl:chans', type: 'label', text: 'CHANNELS', x: 0, y: cy - 22, w: 80, h: 14 });
        for (const c of built) { c.x = cx; c.y = cy; cx += c.w + G.gap + 10; chanBottom = Math.max(chanBottom, cy + c.h); nodes.set(c.key, c); }
      } else {
        const cx = lanesRight + G.regionGap * 0.8, colW = Math.max(...built.map((c) => c.w));
        let cy = y0 + 44;
        nodes.set('lbl:chans', { key: 'lbl:chans', type: 'label', text: 'CHANNELS', x: cx, y: y0 - 22, w: 80, h: 14 });
        for (const c of built) { c.x = cx + (colW - c.w) / 2; c.y = cy; cy += c.h + G.gap + 10; nodes.set(c.key, c); }
        chanRight = cx + colW;
      }
    }

    // heap: escaped cells first, then objects (allocation order), then garbage
    const hx = narrow ? 0 : chanRight + G.regionGap;
    const hy = narrow ? chanBottom + 64 : y0;
    const rowW = narrow ? Math.max(lanesRight, 460) : G.heapRowW;
    nodes.set('lbl:heap', { key: 'lbl:heap', type: 'label', text: 'HEAP', x: hx, y: hy - 22, w: 60, h: 14 });
    const heapNodes = [];
    for (const c of s.cells || []) {
      const rows = slotRows([{ ...c, name: c.name && c.name !== 'referenced value' ? c.name : 'value' }], objById);
      const n = card(c.id, 'cell', (plainName(c.name) && c.name !== 'referenced value' ? plainName(c.name) : 'value') + ' · ' + c.id, c.escaped ? 'escaped' : 'heap', rows, { minW: 150, meta: { c } });
      n.slotAlias = c.id; // pointers to this cell land on its single row
      heapNodes.push(n);
      cellHome.set(c.id, { node: n.key, slot: rows[0].id });
    }
    for (const o of objects) {
      if (o.kind === 'channel' || o.owner) continue;
      if (['struct', 'array'].includes(o.kind) && isInlineTarget(o.id, s)) continue;
      heapNodes.push(objectNode(o, heapById.get(o.id), gcOn));
    }
    for (const h of s.heapObjects || []) {
      if (objById.has(h.id) || h.reachable) continue;
      if (h.owner || h.temp || (h.owner === undefined && !gcOn)) continue; // value temporaries aren't garbage a learner cares about
      const gTitle = ({ array: 'old array', scalar: 'value', cell: 'value' }[h.kind] || h.kind || 'object') + ' · ' + h.id + ' · garbage';
      heapNodes.push({ key: h.id, type: 'obj', variant: 'ghost', title: gTitle, sub: h.size + ' B', rows: [], w: Math.max(170, tw(gTitle) + tw(h.size + ' B') + 2 * G.pad + 18), h: G.head + 12, slots: new Map(), cls: ['garbage', gcOn && h.color === 'black' ? 'gc-black' : ''].filter(Boolean), meta: {} });
    }
    heapNodes.sort((a, b) => (a.type === 'cell' ? 0 : 1) - (b.type === 'cell' ? 0 : 1) || num(a.key) - num(b.key));
    let rx = hx, ry = narrow ? hy : y0 + 44, rowH = 0;
    for (const n of heapNodes) {
      if (rx > hx && rx + n.w > hx + rowW) { rx = hx; ry += rowH + G.gap + 14; rowH = 0; }
      n.x = rx; n.y = ry; rx += n.w + G.gap + 6; rowH = Math.max(rowH, n.h);
      nodes.set(n.key, n);
    }

    // edges
    const anchorFor = (to) => {
      const home = cellHome.get(to);
      if (home) { const n = nodes.get(home.node); const sl = n?.slots.get(home.slot); if (sl) return { node: n.key, x: sl.in.x, y: sl.in.y }; }
      const n = nodes.get(to);
      if (n) return { node: n.key, x: 0, y: n.type === 'chan' ? G.head + 21 : Math.min(G.head / 2, n.h / 2) };
      return null;
    };
    const addEdge = (key, fromNode, fromSlot, to, extra = {}) => {
      const fn = nodes.get(fromNode); const sl = fn?.slots.get(fromSlot);
      if (!sl?.port) return;
      let target = anchorFor(to);
      const tn = target && nodes.get(target.node);
      if (tn?.variant === 'array' && extra.slice) {
        const c = tn.cells[Math.min(extra.slice.offset || 0, tn.cells.length - 1)];
        if (c) target = { node: tn.key, x: c.x + c.w / 2, y: G.head + 1, top: true };
      }
      if (!target || target.node === fromNode && !extra.captured) return;
      const kind = extra.kind || (tn?.type === 'chan' ? 'chan' : extra.slice ? 'slice' : 'ptr');
      edges.push({ key, from: { node: fromNode, x: sl.port.x, y: sl.port.y }, to: target, kind, slice: extra.slice || null, slot: fromSlot });
    };
    for (const n of nodes.values()) {
      if (!n.rows) continue;
      for (const r of n.rows) if (r.ref) addEdge(n.key + '>' + r.id, n.key, r.id, r.ref, { slice: r.slice, captured: r.captured, kind: r.captured ? 'ptr' : undefined });
      if (n.type === 'obj' && n.variant === 'array') for (const r of n.meta.o.refs || []) addEdge(n.key + '>s' + r.slot, n.key, 's' + r.slot, r.to, { slice: r.len !== undefined ? r : null });
    }
    // waiting goroutine → channel it is blocked on
    for (const n of nodes.values()) if (n.type === 'lane' && n.waitCh && nodes.has(n.waitCh)) {
      edges.push({ key: n.key + '>wait', from: { node: n.key, x: n.w, y: 18 }, to: { node: n.waitCh, x: 0, y: G.head + 21 }, kind: 'wait' });
    }

    // bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes.values()) { minX = Math.min(minX, n.x); minY = Math.min(minY, n.y); maxX = Math.max(maxX, n.x + n.w); maxY = Math.max(maxY, n.y + n.h); }
    if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 400; maxY = 300; }
    return { nodes, edges, bounds: { x: minX, y: minY, w: maxX - minX, h: maxY - minY + 30 }, laneTops };
  }
  function isInlineTarget(id, s) {
    const boxes = [...(s.globals || []), ...(s.cells || []), ...goroutinesOf(s).flatMap((g) => (g.frames || []).flatMap((f) => f.locals || []))];
    return boxes.some((b) => b.inline === id);
  }

  /* ---------- narration ---------- */
  const KIND = {
    start: ['start', 'accent'], call: ['call', 'stack'], return: ['return', 'stack'], assign: ['assign', 'stack'], declare: ['declare', 'stack'],
    branch: ['branch', 'dim'], loop: ['loop', 'dim'], spawn: ['go', 'gor'], send: ['send', 'chan'], recv: ['receive', 'chan'], block: ['block', 'signal'],
    wake: ['wake', 'gor'], select: ['select', 'chan'], sleep: ['sleep', 'signal'], lock: ['lock', 'signal'], unlock: ['unlock', 'signal'],
    'gc-roots': ['gc', 'gc'], 'gc-mark': ['gc', 'gc'], 'gc-scan': ['gc', 'gc'], 'gc-sweep': ['gc', 'gc'], panic: ['panic', 'bad'], print: ['print', 'dim'],
    finish: ['exit', 'accent'], error: ['error', 'bad'], alloc: ['alloc', 'heap'], step: ['step', 'dim'],
  };
  const COLOR = { accent: 'var(--accent)', stack: 'var(--c-stack)', heap: 'var(--c-heap)', gor: 'var(--c-gor)', chan: 'var(--c-chan)', gc: 'var(--c-gc)', bad: 'var(--bad)', signal: 'var(--signal)', dim: 'var(--text-faint)' };

  function allBoxes(s) {
    const out = new Map();
    for (const g of goroutinesOf(s)) for (const f of g.frames || []) for (const b of f.locals || []) if (!b.captured) out.set(b.id, { ...b, name: plainName(b.name), frame: f.name, g: g.id });
    for (const b of s.globals || []) out.set(b.id, { ...b, frame: 'package', g: '' });
    for (const b of s.cells || []) out.set(b.id, { ...b, name: plainName(b.name), frame: 'heap', g: '' });
    return out;
  }
  const em = (s) => '<em>' + esc(s) + '</em>';
  const b = (s) => '<b>' + esc(s) + '</b>';
  const nm = (s) => '<span class="num">' + esc(clip(s, 40)) + '</span>';
  function friendly(x) {
    const r = x.ref;
    if (r && r.len !== undefined) return 'a slice (len ' + nm(r.len) + ', cap ' + nm(r.cap) + ')';
    if (/^\*/.test(x.kind || '') && (r || /^→/.test(x.value || ''))) return 'a pointer to ' + esc(String(x.kind).slice(1));
    if (/^map/.test(x.kind || '')) return 'a map';
    if (/^chan/.test(x.kind || '')) return 'a channel';
    if (/^→/.test(x.value || '')) return 'a reference';
    return nm(x.value);
  }

  function inferKind(s, prev) {
    if (s.event?.kind) return s.event.kind;
    const t = s.title || '';
    if (s.status === 'error') return 'error';
    if (s.status === 'finished') return 'finish';
    if (!prev) return 'start';
    if (/^Call /.test(t)) return 'call';
    if (/^Return from/.test(t)) return 'return';
    if (/goroutine/i.test(t) && /Start/.test(t)) return 'spawn';
    if (/^Simplified GC: record/.test(t)) return 'gc-roots';
    if (/^Simplified GC: (discover|scan)/.test(t)) return 'gc-mark';
    if (/^Simplified GC: reclaim/.test(t)) return 'gc-sweep';
    if (/Hand a value|send completed/i.test(t)) return 'send';
    if (/Receive/.test(t)) return 'recv';
    if (/^Wait/.test(t)) return 'block';
    if (/loop|range/i.test(t)) return 'loop';
    if (/^Choose/.test(t)) return 'branch';
    if ((s.stdout || s.output || '').length > (prev.stdout || prev.output || '').length) return 'print';
    return 'assign';
  }

  function narrate(s, prev, depth = 'simple') {
    if (!s) return { kind: 'start', color: COLOR.accent, html: 'Press <b>Run</b> or start typing — your program will play here, step by step.' };
    const kind = inferKind(s, prev);
    const hood = depth === 'hood';
    const now = allBoxes(s), before = prev ? allBoxes(prev) : new Map();
    const fx = s.event?.fx || [];
    const line = s.line >= 0 ? s.line + 1 : null;
    const at = line ? ' <span class="faint">(line ' + line + ')</span>' : '';
    const gors = goroutinesOf(s), pg = prev ? goroutinesOf(prev) : [];
    const active = s.active || gors[0]?.id || 'G1';
    const objById = new Map((s.objects || []).map((o) => [o.id, o]));
    const owners = (id) => [...now.values()].filter((x) => refOf(x) === id).map((x) => x.name);
    const parts = [];

    // value changes (by cell id) — the heart of "what just happened"
    const changed = [], created = [];
    for (const [id, x] of now) {
      const p = before.get(id);
      if (!p) { if (prev) created.push(x); } else if (p.value !== x.value) changed.push({ x, p });
    }
    // slice growth: same variable, new backing array
    const grew = changed.filter(({ x, p }) => x.ref?.cap !== undefined && p.ref?.cap !== undefined && x.ref.to !== p.ref.to);

    switch (kind) {
      case 'start': parts.push('Your program starts. Goroutine ' + b('G1') + ' runs ' + em('main') + '.'); break;
      case 'call': {
        const g = gors.find((x) => x.id === active) || gors[0];
        const f = g?.frames?.at(-1);
        const args = (f?.locals || []).filter((x) => !x.captured && x.value != null && x.value !== '').slice(0, 4).map((x) => em(plainName(x.name)) + ' = ' + nm(x.value)).join(', ');
        const shared = (f?.locals || []).filter((x) => x.captured).slice(0, 4).map((x) => em(plainName(x.name))).join(', ');
        parts.push(b((f?.name || 'a function') + '()') + ' is called — a new stack frame opens on ' + b(g?.id || active) + (args ? ' with ' + args : '') + '.' + (shared ? ' It shares ' + shared + ' with the code that created it.' : ''));
        if (hood) parts.push('Arguments are copied into the callee\'s frame; the frame is freed when it returns.');
        break;
      }
      case 'return': {
        const g = gors.find((x) => x.id === active) || gors[0], pgx = pg.find((x) => x.id === g?.id);
        const popped = pgx?.frames?.at(-1)?.name || (/Return from (\w+)/.exec(s.title || '')?.[1]);
        parts.push((popped ? b(popped + '()') : 'The function') + ' returns. Its frame is popped, and its locals go with it.');
        if (hood) parts.push('Anything still pointed to after this must live on the heap (that is what escape analysis decides).');
        break;
      }
      case 'spawn': {
        const sp = fx.find((e) => e.type === 'spawn');
        const id = sp?.id || gors.find((g) => !pg.some((p) => p.id === g.id))?.id || 'a new goroutine';
        parts.push(b('go') + ' starts ' + b(id) + '. It is runnable and will run when the scheduler gives it a turn.');
        if (hood) parts.push('newproc puts ' + esc(id) + ' on the current P\'s run queue; this model schedules deterministically.');
        break;
      }
      case 'send': case 'recv': {
        const mv = fx.find((e) => e.type === 'move');
        if (mv) {
          const toCh = objById.get(mv.to)?.kind === 'channel';
          const ch = toCh ? mv.to : mv.from;
          const chName = owners(ch)[0] || ch;
          parts.push(toCh ? b(mv.from) + ' sends ' + nm(mv.value) + ' into ' + em(chName) + '.' : b(mv.to) + ' receives ' + nm(mv.value) + (chName ? ' from ' + em(chName) : '') + '.');
        } else parts.push(esc(s.title || 'Channel operation.'));
        if (hood) parts.push('A send to a waiting receiver hands the value over directly; otherwise it goes into the buffer or the sender parks.');
        break;
      }
      case 'block': case 'select': case 'sleep': case 'lock': {
        const g = gors.find((x) => x.state === 'waiting' && !pg.find((p) => p.id === x.id && p.state === 'waiting')) || gors.find((x) => x.state === 'waiting');
        const why = g?.wait || 'waiting';
        const m = /^(send|receive)\s+(A\d+)/.exec(why);
        parts.push(b(g?.id || active) + ' blocks — ' + (m ? (m[1] === 'send' ? 'nobody is ready to receive on ' : 'nothing to receive yet on ') + em(owners(m[2])[0] || m[2]) : esc(why)) + '. The scheduler switches to another goroutine.');
        if (hood) parts.push('gopark: the G is not runnable until another goroutine readies it.');
        break;
      }
      case 'wake': parts.push(b(fx.find((e) => e.type === 'wake')?.id || 'A goroutine') + ' wakes up — what it was waiting for has happened.'); break;
      case 'gc-roots': parts.push('Garbage collection begins at the ' + b('roots') + ': globals and every goroutine\'s stack.'); if (hood) parts.push('Tri-colour marking: everything starts white; roots are greyed.'); break;
      case 'gc-mark': case 'gc-scan': parts.push('Marking: anything reachable from a root is kept (shown ' + b('black') + '). Unreachable objects stay unmarked.'); break;
      case 'gc-sweep': {
        const freed = fx.filter((e) => e.type === 'free').length || (prev ? (prev.heapObjects || []).length - (s.heapObjects || []).length : 0);
        parts.push('Sweep: ' + (freed > 0 ? nm(freed) + ' unreachable object' + (freed === 1 ? ' is' : 's are') + ' freed.' : 'nothing to free — every object is still in use.'));
        break;
      }
      case 'panic': case 'error': { const msg = clip(String(s.error || s.text || s.title || '').replace(/^main\.go:\d+:\d+:\s*/, '').replace(/^panic:\s*/, ''), 120); parts.push('<span style="color:var(--bad)">Panic.</span> ' + esc(msg) + (/[.!?]$/.test(msg) ? '' : '.') + ' Go unwinds the stack and the program stops.'); break; }
      case 'finish': parts.push(em('main') + ' returned, so the program exits' + ((s.stdout || '').trim() ? ' after printing ' + nm((s.stdout || '').trim().split('\n').at(-1)) : '') + '.'); break;
      case 'print': {
        const out = (s.stdout || s.output || '').slice((prev?.stdout || prev?.output || '').length);
        parts.push('Prints ' + nm(out.replace(/\n$/, '')) + ' to the output.');
        break;
      }
      default: break;
    }

    if (!['start', 'call', 'finish', 'error', 'panic'].includes(kind)) {
      if (grew.length) {
        const { x, p } = grew[0];
        parts.push(b('append') + ' ran out of room (cap ' + nm(p.ref.cap) + '), so Go made a ' + b('new backing array') + ' with cap ' + nm(x.ref.cap) + ', copied the values over, and ' + em(x.name) + ' now points there.');
      } else if (changed.length) {
        const { x, p } = changed[0];
        parts.push(em(x.name) + ' changes from ' + friendly(p) + ' to ' + friendly(x) + '.' + (changed.length > 1 ? ' <span class="faint">(+' + (changed.length - 1) + ' more)</span>' : ''));
      }
      if (created.length && kind !== 'call') {
        const x = created[0];
        parts.push('New variable ' + em(x.name) + (x.frame && x.frame !== 'heap' ? ' in ' + b(x.frame + '()') : '') + ': ' + friendly(x) + '.');
      }
      // writes into heap objects (array elements, struct fields, map entries)
      if (!changed.length && prev) {
        const pObj = new Map((prev.objects || []).map((o) => [o.id, o]));
        for (const o of s.objects || []) {
          const po = pObj.get(o.id); if (!po || o.kind === 'channel') continue;
          const i = (o.values || []).findIndex((v, k) => v !== po.values?.[k]);
          if (i < 0 || po.values?.[i] === undefined) continue;
          const who = owners(o.id);
          const holder = [...now.values()].find((x) => refOf(x) === o.id);
          const slot = o.kind === 'struct' ? '.' + (o.fields?.[i] ?? i) : '[' + (i - (holder?.ref?.offset || 0)) + ']';
          parts.push((who.length ? em(who[0] + slot) : 'Element ' + esc('[' + i + ']')) + ' changes from ' + nm(po.values[i]) + ' to ' + nm(o.values[i]) + (who.length > 1 ? '. ' + who.slice(1).map(em).join(', ') + ' see' + (who.length === 2 ? 's' : '') + ' it too: they share the same backing storage.' : '.'));
          break;
        }
      }
    }
    const allocs = fx.filter((e) => e.type === 'alloc').map((e) => objById.get(e.id)).filter(Boolean).filter((o) => !o.owner);
    if (allocs.length && !grew.length) {
      const o = allocs[0];
      const reason = o.escape && /heap/.test(o.escape.placement || '') ? ' It escapes: ' + esc(o.escape.reason || 'it outlives its function') : '';
      parts.push('Allocates ' + b(o.kind === 'array' ? 'a backing array' : 'a ' + o.kind) + ' on the heap.' + reason);
      if (hood) parts.push('mallocgc picks a size class for it; sizes here are model bytes.');
    }
    if (!parts.length) parts.push(esc(s.title || 'Next step.'));
    const [label, tone] = KIND[kind] || KIND.step;
    return { kind, label, color: COLOR[tone], html: parts.join(' ') + at };
  }

  /* ---------- table view (screen-reader alternative) ---------- */
  function table(s) {
    if (!s) return '<p class="dim">Run the program to fill this table.</p>';
    const rows = [];
    for (const g of goroutinesOf(s)) for (const f of g.frames || []) for (const x of f.locals || []) rows.push([g.id + ' · ' + f.name + '()', plainName(x.name), x.kind, x.captured ? 'shared with outer frame' : x.value]);
    for (const x of s.globals || []) rows.push(['globals', x.name, x.kind, x.value]);
    for (const x of s.cells || []) rows.push(['heap cell', plainName(x.name), x.kind, x.value]);
    for (const o of s.objects || []) if (!o.owner) rows.push(['heap ' + o.id, o.kind, o.escape ? o.escape.placement : '', (o.values || []).join(', ') || 'empty']);
    for (const g of goroutinesOf(s)) rows.push(['goroutine', g.id, g.state, g.wait || '']);
    return '<table><caption>Program state at this step</caption><thead><tr><th>Where</th><th>Name</th><th>Type / state</th><th>Value</th></tr></thead><tbody>' +
      rows.map((r) => '<tr>' + r.map((c) => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  }

  /* ---------- trace summary (shared by workbench and home) ---------- */
  function ghostHTML(x) {
    const r = x.ref;
    if (x.captured) return null;
    if (r && r.len !== undefined) return '<b>' + esc(x.name) + '</b> len ' + r.len + ' cap ' + r.cap;
    if (r || /^→/.test(x.value || '')) return '<b>' + esc(x.name) + '</b> → ' + esc(/^\*/.test(x.kind) ? 'pointer' : x.kind);
    return '<b>' + esc(x.name) + '</b> = ' + esc(clip(x.value, 32));
  }
  // one pass over a trace: per-step writes (for inline values), kinds, heap curve, goroutine runs
  function summarize(t) {
    const out = { writes: [], hits: new Set(), marks: [], kinds: [], heap: [], maxHeap: 1, rows: new Map(), n: t.length };
    let prevB = new Map(), prev = null;
    for (let i = 0; i < t.length; i++) {
      const s = t[i], b = allBoxes(s), items = [];
      for (const [id, x] of b) { const p = prevB.get(id); if (!p || p.value !== x.value || JSON.stringify(p.ref) !== JSON.stringify(x.ref)) { const g = ghostHTML(x); if (g) items.push(g); } }
      const ln = s && s.line >= 0 ? s.line + 1 : 0;
      if (ln) out.hits.add(ln);
      out.writes.push({ line: ln, items });
      const k = inferKind(s, prev);
      out.kinds.push(k);
      if (!['assign', 'declare', 'branch', 'loop', 'step', 'print'].includes(k)) out.marks.push(i);
      const ha = s.modelStats?.HeapAlloc || 0; out.heap.push(ha); out.maxHeap = Math.max(out.maxHeap, ha);
      for (const g of goroutinesOf(s)) {
        if (!out.rows.has(g.id)) out.rows.set(g.id, []);
        const runs = out.rows.get(g.id), st = s.active === g.id && g.state !== 'finished' ? 'running' : g.state, last = runs.at(-1);
        if (last && last.st === st && last.end === i - 1) last.end = i; else runs.push({ st, start: i, end: i, wait: g.wait });
      }
      prevB = b; prev = s;
    }
    return out;
  }
  function ghostsAt(sum, i) {
    const m = new Map();
    for (let k = 0; k <= i && k < sum.writes.length; k++) { const w = sum.writes[k]; if (w.line && w.items.length) m.set(w.line, w.items.slice(0, 3).join(', ')); }
    return m;
  }
  // timeline strip: heap curve + one tick per notable event, in a viewBox of (n-1) x 20
  function ticksSVG(sum) {
    const n = Math.max(sum.n - 1, 1), tickW = Math.max(n / 500, 0.35);
    let area = 'M0 20 ';
    sum.heap.forEach((v, i) => { area += 'L' + i + ' ' + (20 - (v / sum.maxHeap) * 14).toFixed(2) + ' '; });
    area += 'L' + (sum.heap.length - 1) + ' 20 Z';
    let ticks = '';
    sum.kinds.forEach((k, i) => {
      if (['assign', 'declare', 'branch', 'loop', 'step'].includes(k)) return;
      const [, tone] = KIND[k] || KIND.step;
      const tall = ['spawn', 'send', 'recv', 'block', 'wake', 'panic', 'error', 'gc-roots', 'gc-sweep', 'call'].includes(k);
      ticks += '<rect x="' + (i - tickW / 2) + '" y="' + (tall ? 2 : 9) + '" width="' + tickW + '" height="' + (tall ? 12 : 6) + '" fill="' + COLOR[tone] + '" opacity="' + (tall ? 0.95 : 0.6) + '"/>';
    });
    return '<path d="' + area + '" fill="color-mix(in srgb, var(--c-heap) 14%, transparent)"/>' + ticks;
  }
  // goroutine lanes over time
  function ganttSVG(sum, w, playIdx = -1) {
    const ids = [...sum.rows.keys()], rowH = 30, x0 = 56, sx = (w - x0 - 8) / Math.max(sum.n, 1);
    const color = { running: 'var(--c-gor)', runnable: 'color-mix(in srgb, var(--c-gor) 32%, transparent)', waiting: 'var(--signal)' };
    let svg = '<svg viewBox="0 0 ' + w + ' ' + (ids.length * rowH + 30) + '" height="' + (ids.length * rowH + 30) + '" role="img" aria-label="Goroutine timeline"><text class="gh" x="' + x0 + '" y="10">STEPS →</text>';
    ids.forEach((id, r) => {
      const y = 24 + r * rowH;
      svg += '<text class="gl" x="0" y="' + (y + 10) + '">' + id + '</text>';
      for (const run of sum.rows.get(id)) if (run.st !== 'finished' && run.st !== 'dead') svg += '<rect x="' + (x0 + run.start * sx).toFixed(1) + '" y="' + y + '" width="' + Math.max(1.5, (run.end - run.start + 1) * sx - 1).toFixed(1) + '" height="20" rx="3" fill="' + (color[run.st] || 'var(--line-2)') + '"><title>' + id + ' ' + run.st + (run.wait ? ' (' + esc(run.wait) + ')' : '') + ' · steps ' + (run.start + 1) + '–' + (run.end + 1) + '</title></rect>';
    });
    if (playIdx >= 0) { const px = x0 + (playIdx + 0.5) * sx; svg += '<line class="play" x1="' + px + '" x2="' + px + '" y1="18" y2="' + (ids.length * rowH + 26) + '"/>'; }
    return { html: svg + '</svg>', x0, sx, w };
  }

  /* ---------- renderer + animator + camera ---------- */
  let uid = 0;
  const reduceMotion = () => document.documentElement.classList.contains('reduce-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const el = (tag, attrs = {}, kids = []) => {
    const e = document.createElementNS(SVG, tag);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    for (const c of [].concat(kids)) if (c) e.append(c);
    return e;
  };
  const txt = (x, y, s, cls, extra = {}) => el('text', { x, y, class: cls, ...extra }, [document.createTextNode(s)]);

  function create(host, opts = {}) {
    if (CW === 7.25) measure();
    const id = 'stg' + ++uid;
    const svg = el('svg', { class: 'stage-svg', role: 'img', 'aria-label': 'Program visualisation' });
    svg.innerHTML =
      '<defs>' +
      '<pattern id="' + id + '-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="var(--grid-dot)"/></pattern>' +
      ['ptr', 'slice', 'chan', 'wait', 'hl'].map((k) => '<marker id="' + id + '-a-' + k + '" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 z" fill="' + { ptr: 'var(--c-ptr)', slice: 'var(--c-heap)', chan: 'var(--c-chan)', wait: 'var(--signal)', hl: 'var(--accent)' }[k] + '"/></marker>').join('') +
      '</defs>';
    const cam = el('g', { class: 'cam' });
    const bg = el('rect', { x: -5000, y: -5000, width: 10000, height: 10000, fill: 'url(#' + id + '-dots)' });
    const world = el('g', { id: id + '-world', class: 'gk-world' }); // gk-world: see the stage rules in go.css
    const gEdges = el('g', { class: 'edges' });
    const gNodes = el('g', { class: 'nodes' });
    const gOver = el('g', { class: 'over' }); // slice len/cap brackets sit above the arrays they describe
    const gFx = el('g', { class: 'fx' });
    world.append(gEdges, gNodes, gOver, gFx);
    cam.append(bg, world);
    svg.append(cam);

    const mini = document.createElement('div');
    mini.className = 'minimap';
    mini.innerHTML = '<svg aria-hidden="true"><use href="#' + id + '-world"/><rect class="vp"/></svg>';
    const miniSvg = mini.firstChild, miniVp = miniSvg.querySelector('.vp');
    const zoom = document.createElement('div');
    zoom.className = 'zoom-ctl';
    zoom.innerHTML = '<button type="button" data-z="in" title="Zoom in (+)" aria-label="Zoom in">+</button><div class="pct" aria-live="off">100%</div><button type="button" data-z="out" title="Zoom out (−)" aria-label="Zoom out">−</button><button type="button" data-z="fit" title="Fit everything (F)" aria-label="Fit to view"><svg class="icon" style="width:14px;height:14px"><use href="#i-fit"/></svg></button><button type="button" data-z="follow" aria-pressed="true" title="Follow the action" aria-label="Follow the action"><svg class="icon" style="width:14px;height:14px"><use href="#i-follow"/></svg></button>';
    const pct = zoom.querySelector('.pct'), followBtn = zoom.querySelector('[data-z=follow]');
    host.append(svg);
    if (!opts.compact) host.append(mini);
    host.append(zoom);

    // state
    const live = new Map(); // key → {g, inner, node, cur:{x,y}, from, to}
    const liveEdges = new Map(); // key → {path, extra[], e}
    let current = null, lastState = null, lastLayout = null, follow = true, highlighted = null;
    let camNow = { x: 0, y: 0, k: 1 }, camFrom = null, camTo = null, camT0 = 0, camDur = 0;
    let moveT0 = 0, moveDur = 0, moving = false;
    const flights = [];
    let raf = 0;

    const size = () => ({ w: svg.clientWidth || host.clientWidth || 800, h: svg.clientHeight || host.clientHeight || 500 });

    /* --- node building --- */
    function buildNode(n) {
      const kids = [];
      if (n.type === 'label') {
        kids.push(txt(0, 7, n.text, 'region-label'));
        return kids;
      }
      if (n.type === 'lane') {
        kids.push(el('rect', { class: 'box', width: n.w, height: n.h, rx: 14 }));
        const label = n.gid + (n.state === 'waiting' ? ' · waiting' : n.state === 'finished' ? ' · done' : n.state === 'running' ? ' · running' : n.state === 'stopped' ? ' · stopped' : ' · runnable');
        const pw = tw(label) + 22;
        kids.push(el('rect', { class: 'pill', x: 10, y: 8, width: pw, height: 22, rx: 11 }));
        kids.push(txt(21, 19, label, 'title'));
        if (n.wait && n.state === 'waiting') kids.push(txt(pw + 18, 19, clip(n.wait.replace(/\s+A\d+$/, ''), 22), 'sub'));
        return kids;
      }
      kids.push(el('rect', { class: 'box', width: n.w, height: n.h, rx: 8 }));
      kids.push(el('path', { class: 'head', d: 'M0 8 a8 8 0 0 1 8 -8 h' + (n.w - 16) + ' a8 8 0 0 1 8 8 v' + (G.head - 8) + ' h' + -n.w + 'z' }));
      kids.push(txt(G.pad, G.head / 2, n.title, 'title'));
      if (n.sub) kids.push(txt(n.w - G.pad, G.head / 2, n.sub, 'sub', { 'text-anchor': 'end' }));
      if (n.meta?.esc) {
        const tx = G.pad + tw(n.title) + 8;
        kids.push(el('rect', { x: tx, y: 8, width: 56, height: 14, rx: 4, fill: 'var(--signal-soft)', stroke: 'var(--signal)', 'stroke-width': 0.8 }));
        kids.push(txt(tx + 28, 15, 'ESCAPES', 'tag', { fill: 'var(--signal)', 'text-anchor': 'middle' }));
        kids.push(el('title', {}, [document.createTextNode(n.meta.o.escape.reason || 'Escapes to the heap (simplified model)')]));
      }
      if (n.type === 'chan') {
        const p = n.pipe;
        kids.push(el('rect', { class: 'pipe', x: p.x, y: p.y, width: p.w, height: p.h, rx: p.h / 2 }));
        if (n.cap) {
          for (let i = 0; i < n.cap; i++) kids.push(el('rect', { class: 'slot', x: p.x + 6 + i * p.slotW + 3, y: p.y + 4, width: p.slotW - 6, height: p.h - 8, rx: 5 }));
          n.buf.slice(0, n.cap).forEach((v, i) => {
            kids.push(el('rect', { class: 'token', x: p.x + 6 + i * p.slotW + 4, y: p.y + 5, width: p.slotW - 8, height: p.h - 10, rx: 5, 'data-tok': i }));
            kids.push(txt(p.x + 6 + i * p.slotW + p.slotW / 2, p.y + p.h / 2, clip(v, 5), 'val', { 'text-anchor': 'middle' }));
          });
        } else {
          kids.push(txt(p.x + p.w / 2, p.y + p.h / 2, 'hand-off', 'sub', { 'text-anchor': 'middle' }));
        }
        if (n.ws || n.wr) kids.push(txt(G.pad, p.y + p.h + 14, [n.ws ? n.ws + ' sender' + (n.ws > 1 ? 's' : '') + ' waiting' : '', n.wr ? n.wr + ' receiver' + (n.wr > 1 ? 's' : '') + ' waiting' : ''].filter(Boolean).join(' · '), 'waiter'));
        return kids;
      }
      if (n.variant === 'array') {
        for (const c of n.cells) {
          kids.push(el('rect', { class: 'cell', x: c.x, y: G.head + 4, width: c.w, height: 22, 'data-cell': c.i }));
          kids.push(txt(c.x + c.w / 2, G.head + 15, c.text, 'val', { 'text-anchor': 'middle', 'data-cv': c.i }));
          kids.push(txt(c.x + c.w / 2, G.head + 36, String(c.i), 'idx', { 'text-anchor': 'middle' }));
        }
        if (n.more) kids.push(txt(n.cells.at(-1).x + n.cells.at(-1).w + 6, G.head + 15, '…' + n.total, 'sub'));
        for (const [, sl] of n.slots) if (sl.port) kids.push(el('circle', { class: 'port', cx: sl.port.x, cy: sl.port.y + 7, r: 3.5 }));
        return kids;
      }
      for (const r of n.rows || []) {
        const sl = n.slots.get(r.id);
        const y = sl.cy;
        kids.push(txt(G.pad, y, r.label, 'label'));
        kids.push(el('rect', { class: 'cell', x: sl.vx, y: y - 10, width: sl.vw, height: 20, rx: 4, 'data-slot': r.id }));
        kids.push(txt(sl.vx + 7, y, r.text, r.text === 'nil' || r.text === '<nil>' ? 'val nil' : 'val', { 'data-sv': r.id }));
        if (sl.port) kids.push(el('circle', { class: 'port', cx: sl.port.x, cy: sl.port.y, r: 4 }));
      }
      return kids;
    }
    const sigOf = (n) => JSON.stringify([n.type, n.title, n.sub, n.w, n.h, n.cls, n.rows?.map((r) => [r.label, r.text, !!r.ref]), n.cells?.map((c) => c.text), n.buf, n.ws, n.wr, n.state, n.wait, n.text, n.meta?.esc]);

    function enterAnim(n, inner) {
      if (reduceMotion()) return;
      const dur = 520 / (opts.speed?.() || 1);
      const frames = n.type === 'frame' ? [{ opacity: 0, transform: 'translateY(-16px) scale(.94)' }, { opacity: 1, transform: 'none' }]
        : n.type === 'lane' ? [{ opacity: 0, transform: 'scaleY(.4)' }, { opacity: 1, transform: 'none' }]
        : n.type === 'label' ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, transform: 'scale(.55)' }, { opacity: 1, transform: 'none' }];
      inner.animate(frames, { duration: dur, easing: n.type === 'label' ? 'ease-out' : 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards', delay: n.type === 'obj' || n.type === 'cell' ? dur * 0.45 : 0 });
    }
    function exitAnim(rec, done) {
      if (reduceMotion()) { done(); return; }
      const dur = 380 / (opts.speed?.() || 1);
      const frames = rec.node.type === 'frame' ? [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-12px) scale(.94)' }]
        : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.6)' }];
      const a = rec.inner.animate(frames, { duration: dur, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
      a.onfinish = done; a.oncancel = done;
    }

    function place(rec) { rec.g.setAttribute('transform', 'translate(' + rec.cur.x.toFixed(2) + ' ' + rec.cur.y.toFixed(2) + ')'); }

    function patch(lay, animate, prevState, state) {
      const prevVals = new Map();
      if (prevState && lastLayout) for (const n of lastLayout.nodes.values()) for (const r of n.rows || []) prevVals.set(n.key + '|' + r.id, r.text);
      const seen = new Set();
      for (const n of lay.nodes.values()) {
        seen.add(n.key);
        let rec = live.get(n.key);
        const sig = sigOf(n);
        if (rec && rec.leaving) { rec.inner.getAnimations().forEach((a) => a.cancel()); rec.leaving = false; rec.inner.style.opacity = ''; }
        if (!rec) {
          const g = el('g', { class: 'n n-' + n.type, 'data-key': n.key });
          const inner = el('g', { class: 'in' });
          inner.style.transformBox = 'fill-box';
          inner.style.transformOrigin = n.type === 'frame' ? '50% 0' : n.type === 'lane' ? '50% 0' : '50% 50%';
          g.append(inner);
          rec = { g, inner, node: n, cur: { x: n.x, y: n.y }, from: { x: n.x, y: n.y }, to: { x: n.x, y: n.y }, sig: '' };
          live.set(n.key, rec);
          gNodes.append(g);
          if (n.type === 'lane') gNodes.prepend(g);
          place(rec);
          if (animate) enterAnim(n, inner);
        }
        if (rec.sig !== sig) {
          rec.inner.replaceChildren(...buildNode(n));
          rec.sig = sig;
          if (animate && !reduceMotion()) {
            for (const r of n.rows || []) {
              const old = prevVals.get(n.key + '|' + r.id);
              if (old !== undefined && old !== r.text) flash(rec.inner, r.id);
            }
          }
        }
        rec.g.setAttribute('class', ['n', 'n-' + n.type, ...(n.cls || [])].join(' ') + (highlighted && matchesHL(n) ? ' hl' : ''));
        rec.node = n;
        rec.from = { ...rec.cur };
        rec.to = { x: n.x, y: n.y };
        if (!animate) { rec.cur = { ...rec.to }; place(rec); }
      }
      for (const [k, rec] of live) if (!seen.has(k) && !rec.leaving) {
        if (animate) { rec.leaving = true; exitAnim(rec, () => { if (rec.leaving) { rec.g.remove(); live.delete(k); } }); }
        else { rec.g.remove(); live.delete(k); }
      }
      // edges
      const eseen = new Set();
      for (const e of lay.edges) {
        eseen.add(e.key);
        let er = liveEdges.get(e.key);
        if (!er) {
          const path = el('path', { class: 'edge ' + e.kind, pathLength: 1, 'marker-end': 'url(#' + id + '-a-' + e.kind + ')' });
          if (e.kind === 'wait') { path.setAttribute('stroke', 'var(--signal)'); path.setAttribute('stroke-dasharray', '4 4'); path.style.animation = 'gk-march 1s linear infinite'; path.removeAttribute('pathLength'); }
          const extra = e.slice ? [el('rect', { class: 'cap-shade' }), el('path', { class: 'span-bracket' })] : [];
          gEdges.append(path); gOver.append(...extra);
          er = { path, extra, e };
          liveEdges.set(e.key, er);
          if (animate && e.kind !== 'wait' && !reduceMotion()) path.animate([{ strokeDashoffset: 1, strokeDasharray: 1 }, { strokeDashoffset: 0, strokeDasharray: 1 }], { duration: 700 / (opts.speed?.() || 1), easing: 'ease-out', delay: 180 / (opts.speed?.() || 1) });
        }
        er.e = e;
        er.path.classList.toggle('hl', !!highlighted && (highlighted.slots?.has(e.slot) || highlighted.keys?.has(e.from.node)));
      }
      for (const [k, er] of liveEdges) if (!eseen.has(k)) { er.path.remove(); er.extra.forEach((x) => x.remove()); liveEdges.delete(k); }
    }
    function flash(inner, slotId) {
      const r = inner.querySelector('[data-slot="' + CSS.escape(slotId) + '"]');
      const t = inner.querySelector('[data-sv="' + CSS.escape(slotId) + '"]');
      const dur = 900 / (opts.speed?.() || 1);
      r?.animate([{ fill: 'color-mix(in srgb, var(--signal) 35%, transparent)', stroke: 'var(--signal)' }, { fill: 'var(--bg-2)', stroke: 'var(--line-2)' }], { duration: dur, easing: 'ease-out' });
      t?.animate([{ opacity: 0, transform: 'translateY(9px)' }, { opacity: 1, transform: 'none' }], { duration: dur * 0.5, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    }

    /* --- edge geometry, recomputed every animated frame --- */
    function absOf(nodeKey, x, y) {
      const rec = live.get(nodeKey);
      return rec ? { x: rec.cur.x + x, y: rec.cur.y + y } : null;
    }
    function routeEdges() {
      for (const er of liveEdges.values()) {
        const e = er.e;
        const a = absOf(e.from.node, e.from.x, e.from.y), z = absOf(e.to.node, e.to.x, e.to.y);
        if (!a || !z) continue;
        let d;
        const tr = live.get(e.to.node);
        if (!e.to.top && tr && tr.node.type !== 'frame' && tr.node.type !== 'globals' && tr.cur.y > a.y + 30 && Math.abs(z.x - a.x) < 520) {
          // target sits below: come in through its top edge
          const zx = tr.cur.x + Math.min(28, tr.node.w / 2), zy = tr.cur.y;
          const dy = Math.max(36, (zy - a.y) * 0.5);
          d = 'M' + a.x + ' ' + a.y + ' C' + (a.x + 46) + ' ' + a.y + ' ' + zx + ' ' + (zy - dy) + ' ' + zx + ' ' + (zy - 3);
        } else if (e.to.top) {
          const dy = Math.max(40, Math.abs(z.y - a.y) * 0.5);
          d = 'M' + a.x + ' ' + a.y + ' C' + (a.x + 60) + ' ' + a.y + ' ' + z.x + ' ' + (z.y - dy) + ' ' + z.x + ' ' + (z.y - 3);
        } else if (z.x < a.x - 20 && Math.abs(z.y - a.y) < 400) {
          const bend = Math.max(60, (a.x - z.x) * 0.25);
          d = 'M' + a.x + ' ' + a.y + ' C' + (a.x + bend) + ' ' + (a.y - bend) + ' ' + (z.x - bend) + ' ' + (z.y - bend) + ' ' + (z.x - 3) + ' ' + z.y;
        } else {
          const dx = Math.max(40, Math.abs(z.x - a.x) * 0.45);
          d = 'M' + a.x + ' ' + a.y + ' C' + (a.x + dx) + ' ' + a.y + ' ' + (z.x - dx) + ' ' + z.y + ' ' + (z.x - 3) + ' ' + z.y;
        }
        er.path.setAttribute('d', d);
        if (e.slice && er.extra.length) {
          const rec = live.get(e.to.node), n = rec?.node;
          if (n?.cells?.length) {
            const off = Math.min(e.slice.offset || 0, n.cells.length - 1);
            const lenEnd = Math.min(off + Math.max(e.slice.len || 0, 0), n.cells.length) - 1;
            const capEnd = Math.min(off + Math.max(e.slice.cap || 0, 0), n.cells.length) - 1;
            const by = rec.cur.y + G.head + 4 + 22 + 3;
            const cx1 = rec.cur.x + n.cells[off].x;
            const capX2 = capEnd >= off ? rec.cur.x + n.cells[capEnd].x + n.cells[capEnd].w : cx1;
            er.extra[0].setAttribute('x', cx1); er.extra[0].setAttribute('y', rec.cur.y + G.head + 4); er.extra[0].setAttribute('width', Math.max(0, capX2 - cx1)); er.extra[0].setAttribute('height', 22);
            const lx2 = lenEnd >= off ? rec.cur.x + n.cells[lenEnd].x + n.cells[lenEnd].w : cx1;
            er.extra[1].setAttribute('d', lenEnd >= off ? 'M' + (cx1 + 2) + ' ' + by + ' v5 H' + (lx2 - 2) + ' v-5' : '');
          }
        }
      }
    }

    /* --- flights: values travelling between places --- */
    function launch(fromKey, toKey, label, cls, delay = 0) {
      if (reduceMotion()) return;
      const a = live.get(fromKey), z = live.get(toKey);
      if (!a || !z) return;
      const g = el('g', { class: 'flight ' + (cls || '') }, [el('circle', { r: 13 }), txt(0, 0.5, clip(label, 4))]);
      g.style.opacity = 0;
      gFx.append(g);
      const sp = opts.speed?.() || 1;
      flights.push({ g, fromKey, toKey, t0: performance.now() + delay / sp, dur: 760 / sp });
      tick();
    }
    function centerOf(key) {
      const rec = live.get(key);
      if (!rec) return null;
      const n = rec.node;
      return { x: rec.cur.x + n.w / 2, y: rec.cur.y + Math.min(n.h / 2, 40) };
    }

    /* --- camera --- */
    function applyCam() {
      cam.setAttribute('transform', 'translate(' + camNow.x.toFixed(2) + ' ' + camNow.y.toFixed(2) + ') scale(' + camNow.k.toFixed(4) + ')');
      pct.textContent = Math.round(camNow.k * 100) + '%';
      svg.classList.toggle('lod-low', camNow.k < 0.55);
      updateMini();
    }
    function camTarget(box, maxK = 1.15) {
      const { w, h } = size();
      const pad = opts.compact ? 18 : 48;
      const k = Math.max(0.2, Math.min(maxK, (w - 2 * pad) / Math.max(box.w, 1), (h - 2 * pad - (opts.compact ? 0 : 50)) / Math.max(box.h, 1)));
      return { k, x: w / 2 - (box.x + box.w / 2) * k, y: (h - (opts.compact ? 0 : 50)) / 2 - (box.y + box.h / 2) * k };
    }
    function moveCam(to, dur = 650) {
      if (reduceMotion() || dur <= 0) { camNow = to; camTo = null; applyCam(); return; }
      camFrom = { ...camNow }; camTo = to; camT0 = performance.now(); camDur = dur; tick();
    }
    function fit(animate = true) {
      if (!lastLayout) return;
      moveCam(camTarget(lastLayout.bounds), animate ? 600 : 0);
    }
    function followTo(lay, state) {
      // frame the active goroutine's top frame + whatever changed; recentre only if it left the middle 70%
      const keys = new Set();
      const top = lay.laneTops.find((t) => t.gid === (state.active || 'G1'))?.top;
      if (top) keys.add(top);
      for (const e of state.event?.fx || []) if (e.id && lay.nodes.has(e.id)) keys.add(e.id);
      if (state.event?.fx?.some((e) => e.type === 'move')) for (const e of state.event.fx) if (e.type === 'move') { if (lay.nodes.has(e.to)) keys.add(e.to); if (lay.nodes.has(e.from)) keys.add(e.from); }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const k of keys) { const n = lay.nodes.get(k); if (!n) continue; minX = Math.min(minX, n.x); minY = Math.min(minY, n.y); maxX = Math.max(maxX, n.x + n.w); maxY = Math.max(maxY, n.y + n.h); }
      if (!isFinite(minX)) return;
      const box = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
      const { w, h } = size();
      const k = camNow.k;
      // small programs: keep the whole picture in view whenever it fits at a readable zoom
      const whole = camTarget(lay.bounds);
      const b = lay.bounds;
      const allVisible = b.x * k + camNow.x >= 0 && b.y * k + camNow.y >= 0 && (b.x + b.w) * k + camNow.x <= w && (b.y + b.h) * k + camNow.y <= h - 50;
      if (whole.k >= 0.6) { if (!allVisible || Math.abs(whole.k - k) > 0.08) moveCam(whole, 700 / (opts.speed?.() || 1)); return; }
      const sx = box.x * k + camNow.x, sy = box.y * k + camNow.y, sw = box.w * k, sh = box.h * k;
      const inside = sx >= w * 0.12 && sy >= h * 0.1 && sx + sw <= w * 0.88 && sy + sh <= h * 0.8;
      if (inside) return;
      const t = camTarget({ x: box.x - 60, y: box.y - 60, w: box.w + 120, h: box.h + 120 }, Math.max(k, 0.7));
      moveCam({ ...t, k: Math.min(t.k, Math.max(k, 0.7)) }, 700 / (opts.speed?.() || 1));
    }
    function setFollow(on, notify = true) {
      follow = on;
      followBtn.setAttribute('aria-pressed', String(on));
      if (notify) opts.onFollow?.(on);
      if (on && lastLayout && lastState) followTo(lastLayout, lastState);
    }
    function zoomAt(f, px, py) {
      const { w, h } = size();
      px ??= w / 2; py ??= h / 2;
      const k = Math.max(0.15, Math.min(3, camNow.k * f));
      const wx = (px - camNow.x) / camNow.k, wy = (py - camNow.y) / camNow.k;
      camTo = null;
      camNow = { k, x: px - wx * k, y: py - wy * k };
      applyCam();
    }

    /* --- minimap --- */
    function updateMini() {
      if (opts.compact || !lastLayout) return;
      const b = lastLayout.bounds, pad = 30;
      miniSvg.setAttribute('viewBox', (b.x - pad) + ' ' + (b.y - pad) + ' ' + (b.w + 2 * pad) + ' ' + (b.h + 2 * pad));
      const { w, h } = size();
      miniVp.setAttribute('x', -camNow.x / camNow.k); miniVp.setAttribute('y', -camNow.y / camNow.k);
      miniVp.setAttribute('width', w / camNow.k); miniVp.setAttribute('height', h / camNow.k);
    }

    /* --- the loop --- */
    function tick() { if (!raf) raf = requestAnimationFrame(frame); }
    function frame(now) {
      raf = 0;
      let again = false;
      if (moving) {
        const t = Math.min(1, (now - moveT0) / moveDur), e = easeIO(t);
        for (const rec of live.values()) {
          rec.cur = { x: rec.from.x + (rec.to.x - rec.from.x) * e, y: rec.from.y + (rec.to.y - rec.from.y) * e };
          place(rec);
        }
        if (t < 1) again = true; else moving = false;
      }
      routeEdges();
      if (camTo) {
        const t = Math.min(1, (now - camT0) / camDur), e = ease(t);
        camNow = { x: camFrom.x + (camTo.x - camFrom.x) * e, y: camFrom.y + (camTo.y - camFrom.y) * e, k: camFrom.k + (camTo.k - camFrom.k) * e };
        applyCam();
        if (t < 1) again = true; else camTo = null;
      }
      for (let i = flights.length - 1; i >= 0; i--) {
        const f = flights[i];
        const t = (now - f.t0) / f.dur;
        if (t < 0) { again = true; continue; }
        const a = centerOf(f.fromKey), z = centerOf(f.toKey);
        if (!a || !z || t >= 1) { f.g.remove(); flights.splice(i, 1); continue; }
        const e = easeIO(Math.min(1, t));
        const mx = (a.x + z.x) / 2, my = Math.min(a.y, z.y) - 80 - Math.abs(z.x - a.x) * 0.12;
        const x = (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * mx + e * e * z.x;
        const y = (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * my + e * e * z.y;
        f.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + (0.7 + Math.sin(e * Math.PI) * 0.5).toFixed(3) + ')');
        f.g.style.opacity = t < 0.1 ? t * 10 : t > 0.88 ? (1 - t) * 8 : 1;
        again = true;
      }
      if (again) tick();
    }

    /* --- public: show a state --- */
    function show(state, { animate = true, prev = null } = {}) {
      // after main returns everything is gone; keep the last live picture, dimmed, so the result stays readable
      const ended = !!(state && state.status === 'finished' && prev && !goroutinesOf(state).some((g) => g.frames?.length));
      svg.classList.toggle('ended', ended);
      if (ended) state = { ...prev, event: state.event, status: 'finished' };
      const anim = animate && !reduceMotion();
      const { w: sw, h: sh } = size();
      const lay = layout(state, { narrow: !opts.wide && sw / Math.max(sh, 1) < 1.2 });
      patch(lay, anim, prev, state);
      const firstPaint = !lastLayout;
      lastLayout = lay; lastState = state;
      if (anim) { moving = true; moveT0 = performance.now(); moveDur = 560 / (opts.speed?.() || 1); }
      else for (const rec of live.values()) { rec.cur = { ...rec.to }; place(rec); }
      tick();
      if (firstPaint) fit(false);
      else if (follow) followTo(lay, state);
      else updateMini();
      // flights from the step's side effects
      if (anim && state) {
        const gid = state.active || 'G1';
        const topOf = (g) => lay.laneTops.find((t) => t.gid === g)?.top;
        for (const e of state.event?.fx || []) {
          if (e.type === 'move') {
            const fromK = lay.nodes.has(e.from) ? e.from : topOf(e.from);
            const toK = lay.nodes.has(e.to) ? e.to : topOf(e.to);
            if (fromK && toK) launch(fromK, toK, e.value, '', 60);
          } else if (e.type === 'alloc' && lay.nodes.has(e.id)) {
            const n = lay.nodes.get(e.id);
            launch(topOf(gid) || 'globals', e.id, 'new', 'alloc', 0);
            if (n.meta?.esc) launch(topOf(gid), e.id, '↗', '', 120);
          }
        }
        if (state.status === 'error' && !reduceMotion()) {
          const top = live.get(topOf(gid));
          top?.inner.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }], { duration: 420 });
        }
      }
      return lay;
    }

    /* --- highlight (editor hover ↔ stage) --- */
    function matchesHL(n) { return highlighted?.keys?.has(n.key); }
    function highlight(q) {
      highlighted = null;
      if (q && lastLayout) {
        const keys = new Set(), slots = new Set();
        for (const n of lastLayout.nodes.values()) for (const r of n.rows || []) if (q.names?.includes(r.label) || q.ids?.includes(r.id)) { keys.add(n.key); slots.add(r.id); if (r.ref) keys.add(r.ref); }
        for (const k of q.keys || []) keys.add(k);
        if (keys.size) highlighted = { keys, slots };
      }
      for (const rec of live.values()) {
        rec.g.classList.toggle('hl', !!highlighted && highlighted.keys.has(rec.node.key));
        rec.inner.querySelectorAll('[data-slot]').forEach((r) => r.classList.toggle('slot-hl', !!highlighted && highlighted.slots.has(r.getAttribute('data-slot'))));
      }
      for (const er of liveEdges.values()) er.path.classList.toggle('hl', !!highlighted && (highlighted.slots.has(er.e.slot) || highlighted.keys.has(er.e.to.node) && highlighted.keys.has(er.e.from.node)));
      return !!highlighted;
    }

    /* --- input: pan, zoom, pick --- */
    let drag = null;
    svg.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0) return;
      // remember what was pressed: with pointer capture, pointerup always targets the svg itself
      drag = { x: ev.clientX, y: ev.clientY, cx: camNow.x, cy: camNow.y, moved: false, id: ev.pointerId, target: ev.target };
      svg.setPointerCapture(ev.pointerId);
    });
    svg.addEventListener('pointermove', (ev) => {
      if (!drag || drag.id !== ev.pointerId) return;
      const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      if (!drag.moved) { drag.moved = true; svg.classList.add('panning'); if (follow) setFollow(false); }
      camTo = null;
      camNow = { ...camNow, x: drag.cx + dx, y: drag.cy + dy };
      applyCam();
    });
    const endDrag = (ev) => {
      if (!drag) return;
      const wasClick = !drag.moved, pressed = drag.target;
      drag = null; svg.classList.remove('panning');
      if (wasClick) {
        const g = pressed?.closest?.('.n');
        opts.onPick?.(g ? live.get(g.getAttribute('data-key'))?.node || null : null);
      }
    };
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', () => { drag = null; svg.classList.remove('panning'); });
    svg.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      const r = svg.getBoundingClientRect();
      if (ev.ctrlKey || ev.metaKey) zoomAt(Math.exp(-ev.deltaY * 0.01), ev.clientX - r.left, ev.clientY - r.top);
      else { camTo = null; camNow = { ...camNow, x: camNow.x - ev.deltaX, y: camNow.y - ev.deltaY }; applyCam(); }
      if (follow) setFollow(false);
    }, { passive: false });
    svg.addEventListener('dblclick', (ev) => {
      const g = ev.target.closest?.('.n');
      const rec = g && live.get(g.getAttribute('data-key'));
      if (rec && rec.node.type !== 'lane') {
        const n = rec.node;
        setFollow(false);
        moveCam(camTarget({ x: n.x - 40, y: n.y - 40, w: n.w + 80, h: n.h + 80 }, 2), 600);
      } else fit();
    });
    zoom.addEventListener('click', (ev) => {
      const z = ev.target.closest('[data-z]')?.getAttribute('data-z');
      if (z === 'in') { zoomAt(1.25); setFollow(false); }
      if (z === 'out') { zoomAt(0.8); setFollow(false); }
      if (z === 'fit') fit();
      if (z === 'follow') setFollow(!follow);
    });
    let miniDrag = false;
    const miniMove = (ev) => {
      if (!lastLayout) return;
      const r = miniSvg.getBoundingClientRect(), vb = miniSvg.viewBox.baseVal;
      const wx = vb.x + (ev.clientX - r.left) / r.width * vb.width, wy = vb.y + (ev.clientY - r.top) / r.height * vb.height;
      const { w, h } = size();
      camTo = null; camNow = { ...camNow, x: w / 2 - wx * camNow.k, y: h / 2 - wy * camNow.k }; applyCam();
      if (follow) setFollow(false);
    };
    mini.addEventListener('pointerdown', (ev) => { miniDrag = true; mini.setPointerCapture(ev.pointerId); miniMove(ev); });
    mini.addEventListener('pointermove', (ev) => miniDrag && miniMove(ev));
    mini.addEventListener('pointerup', () => { miniDrag = false; });
    const ro = new ResizeObserver(() => { updateMini(); });
    ro.observe(host);

    function clear() {
      for (const rec of live.values()) rec.g.remove();
      live.clear();
      for (const er of liveEdges.values()) { er.path.remove(); er.extra.forEach((x) => x.remove()); }
      liveEdges.clear();
      flights.splice(0).forEach((f) => f.g.remove());
      lastLayout = null; lastState = null;
    }
    function destroy() { cancelAnimationFrame(raf); ro.disconnect(); clear(); svg.remove(); mini.remove(); zoom.remove(); }

    return {
      show, clear, fit, highlight, destroy,
      zoomIn: () => { zoomAt(1.25); setFollow(false); }, zoomOut: () => { zoomAt(0.8); setFollow(false); },
      setFollow, get follow() { return follow; },
      get layout() { return lastLayout; },
      flash: (key) => { const rec = live.get(key); rec?.inner.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 400, iterations: 2 }); },
    };
  }

  global.GothikStage = Object.freeze({ create, layout, narrate, table, inferKind, goroutinesOf, allBoxes, refOf, measure, summarize, ghostsAt, ticksSVG, ganttSVG, KIND, COLOR });
})(globalThis);

export const GothikStage = globalThis.GothikStage;
