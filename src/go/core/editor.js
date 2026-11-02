// Ported verbatim from the prototype (public/prototype.html). Framework-free; load it lazily on the client.
/* eslint-disable */
// @ts-nocheck

/* =====================================================================
   GothikEditor — textarea + highlight overlay + decorations.
   Native undo is kept by editing through execCommand('insertText').
   ===================================================================== */
'use strict';
(function (global) {
  const KW = /^(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)$/;
  const TY = /^(?:bool|byte|complex64|complex128|error|float32|float64|int|int8|int16|int32|int64|rune|string|uint|uint8|uint16|uint32|uint64|uintptr|any|true|false|nil|iota)$/;
  const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`[^`]*`?)|(\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b|\b0[xXbBoO][\da-fA-F_]+\b)|([A-Za-z_]\w*)(\s*\()?|([()[\]{}])/g;
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  function highlightLine(src) {
    let out = '', last = 0, m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(src))) {
      out += esc(src.slice(last, m.index));
      const [all, com, str, n, id, call, br] = m;
      if (com) out += '<span class="c">' + esc(com) + '</span>';
      else if (str) out += '<span class="s">' + esc(str) + '</span>';
      else if (n) out += '<span class="n">' + esc(n) + '</span>';
      else if (id) out += (KW.test(id) ? '<span class="k">' + id + '</span>' : TY.test(id) ? '<span class="t">' + id + '</span>' : call ? '<span class="f">' + id + '</span>' : esc(id)) + (call ? esc(call) : '');
      else if (br) out += '<span class="b">' + esc(br) + '</span>';
      last = m.index + all.length;
    }
    return out + esc(src.slice(last));
  }

  // Tidy: gofmt-style indentation only (tabs by brace depth, case/default and labels one level out,
  // one tab for a continued expression), trailing spaces removed, at most one blank line, one final newline.
  // It does not realign comments or struct fields the way gofmt does.
  function tidy(src) {
    const strip = (l) => l.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`/g, '""').replace(/\/\/.*$/, '').trim();
    const out = [];
    let depth = 0, raw = false, comment = false, cont = false;
    for (const line of String(src).replace(/\r\n?/g, '\n').split('\n')) {
      if (raw) { // inside a raw string: keep the text, but count brackets after its closing backtick
        out.push(line.replace(/\s+$/, ''));
        if ((line.match(/`/g) || []).length % 2) { raw = false; for (const ch of strip(line.slice(line.indexOf('`') + 1))) { if ('{(['.includes(ch)) depth++; else if ('}])'.includes(ch)) depth = Math.max(0, depth - 1); } }
        continue;
      }
      const t = line.trim();
      if (comment) { out.push(t ? '\t'.repeat(depth) + t : ''); if (t.includes('*/')) comment = false; continue; }
      if (!t) { if (out.length && out[out.length - 1] !== '') out.push(''); cont = false; continue; }
      const code = strip(t);
      let d = depth - (/^[}\])]+/.exec(code)?.[0].length || 0);
      if (/^(case\b.*|default\s*):$/.test(code) || (/^[A-Za-z_]\w*:$/.test(code) && code !== 'default:')) d--;
      if (cont) d++;
      out.push('\t'.repeat(Math.max(0, d)) + t);
      for (const ch of code) { if ('{(['.includes(ch)) depth++; else if ('}])'.includes(ch)) depth = Math.max(0, depth - 1); }
      cont = /(&&|\|\||[^+]\+|[^-]-|[*\/%|^]|<<|>>|=)$/.test(code) && !/[{(\[,]$/.test(code);
      if ((code.match(/`/g) || []).length % 2) raw = true;
      if (code.includes('/*') && !code.includes('*/')) comment = true;
    }
    while (out.length && out[out.length - 1] === '') out.pop();
    return out.join('\n') + '\n';
  }

  function mount(host, opts = {}) {
    if (!host.querySelector('textarea')) {
      host.classList.add('editor');
      host.innerHTML = '<div class="gutter" aria-hidden="true"><div class="gutter-inner"></div></div><div class="code-area"><div class="deco" aria-hidden="true"><div class="deco-inner"></div></div><pre class="hl" aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Go source code"></textarea></div>';
    }
    const ta = host.querySelector('textarea'), hl = host.querySelector('.hl'), deco = host.querySelector('.deco-inner'), decoBox = host.querySelector('.deco');
    const gutter = host.querySelector('.gutter'), gin = host.querySelector('.gutter-inner'), area = host.querySelector('.code-area');
    let ghosts = new Map(), diags = [], hits = new Set(), heat = new Map(), now = -1, errLine = -1, hoverBox = null, pop = null, escFlag = false;
    let CW = 8, LH = 22;
    const PAD_T = 12, PAD_L = 16;
    function metrics() {
      const cs = getComputedStyle(ta);
      LH = parseFloat(cs.lineHeight) || 22;
      try { const c = document.createElement('canvas').getContext('2d'); c.font = cs.fontSize + ' ' + cs.fontFamily; CW = c.measureText('MMMMMMMMMM').width / 10; } catch { /* keep */ }
    }

    function paint() {
      const lines = ta.value.split('\n');
      const diagByLine = new Map();
      for (const d of diags) if (!diagByLine.has(d.line)) diagByLine.set(d.line, d);
      hl.innerHTML = lines.map((ln, i) => {
        const n = i + 1;
        let html = highlightLine(ln);
        const d = diagByLine.get(n);
        if (d) {
          const col = Math.max(0, Math.min(ln.length, (d.column || 1) - 1));
          const word = /^[\w.]+|^./.exec(ln.slice(col))?.[0] || ' ';
          html = highlightLine(ln.slice(0, col)) + '<span class="squiggle">' + highlightLine(ln.slice(col, col + word.length)) + '</span>' + highlightLine(ln.slice(col + word.length));
        }
        const g = ghosts.get(n);
        if (g) html += '<span class="ghost">   // ' + g + '</span>';
        return html;
      }).join('\n') + '\n';
      gin.innerHTML = lines.map((_, i) => { const h = heat.get(i + 1); return '<div class="ln' + (hits.has(i + 1) ? ' hit' : '') + (now === i + 1 ? ' now' : '') + (diagByLine.has(i + 1) || errLine === i + 1 ? ' err' : '') + (h ? ' heat' : '') + '" data-line="' + (i + 1) + '"' + (h ? ' style="--heat:' + h.level.toFixed(2) + '" title="' + (h.objects ? h.objects + ' heap object' + (h.objects === 1 ? '' : 's') : '') + (h.moved?.length ? (h.objects ? ' · ' : '') + h.moved.map((m) => m.diagnostic).join(', ').replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';') : '') + ' (model)"' : '') + '>' + (i + 1) + '</div>'; }).join('');
      paintDeco();
      sync();
    }
    function paintDeco() {
      // these sit inside .deco, which already has the editor padding, so no PAD_T / PAD_L here
      let html = '';
      if (now > 0) html += '<div class="now-line" style="transform:translateY(' + ((now - 1) * LH) + 'px)"></div>';
      const lines = new Set(diags.map((d) => d.line)); if (errLine > 0) lines.add(errLine);
      for (const l of lines) html += '<div class="err-line" style="top:' + ((l - 1) * LH) + 'px"></div>';
      if (hoverBox) html += '<div class="hover-word" style="top:' + ((hoverBox.line - 1) * LH) + 'px;left:' + (hoverBox.col * CW - 2) + 'px;width:' + (hoverBox.len * CW + 4) + 'px"></div>';
      // keep the now-line element so its transform can transition between lines
      const old = deco.querySelector('.now-line');
      deco.innerHTML = html;
      const fresh = deco.querySelector('.now-line');
      if (old && fresh) { fresh.style.transition = 'none'; fresh.style.transform = old.style.transform; fresh.getBoundingClientRect(); fresh.style.transition = ''; fresh.style.transform = 'translateY(' + ((now - 1) * LH) + 'px)'; }
    }
    function sync() {
      hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft;
      decoBox.scrollTop = ta.scrollTop; decoBox.style.transform = '';
      deco.style.transform = 'translate(' + -ta.scrollLeft + 'px,' + -ta.scrollTop + 'px)';
      gin.style.transform = 'translateY(' + -ta.scrollTop + 'px)';
    }
    function insert(text, selStart, selEnd) {
      ta.focus();
      if (selStart !== undefined) ta.setSelectionRange(selStart, selEnd ?? selStart);
      if (!document.execCommand || !document.execCommand('insertText', false, text)) {
        const s = ta.selectionStart, e = ta.selectionEnd;
        ta.setRangeText(text, s, e, 'end');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    const lineStart = (pos) => ta.value.lastIndexOf('\n', pos - 1) + 1;
    const indentUnit = () => (opts.tabs?.() ? '\t' : '    ');

    ta.addEventListener('keydown', (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'Enter') { e.preventDefault(); opts.onRun?.(); return; }
      if (e.key === 'Escape') { escFlag = true; return; }
      if (e.key === 'Tab') {
        if (escFlag) { escFlag = false; return; } // let focus move after Escape
        e.preventDefault();
        const s = ta.selectionStart, en = ta.selectionEnd, unit = indentUnit();
        if (s === en && !e.shiftKey) { insert(unit); return; }
        const a = lineStart(s), block = ta.value.slice(a, en);
        const next = e.shiftKey ? block.replace(/^(\t| {1,4})/gm, '') : block.replace(/^/gm, unit);
        insert(next, a, en);
        ta.setSelectionRange(a, a + next.length);
        return;
      }
      escFlag = false;
      if (mod && e.key === '/') {
        e.preventDefault();
        // whole lines from the caret's line to the end of the selection's last line
        const s = ta.selectionStart, en = ta.selectionEnd, a = lineStart(s), last = en > s && ta.value[en - 1] === '\n' ? en - 1 : en;
        const nl = ta.value.indexOf('\n', last), block = ta.value.slice(a, nl < 0 ? ta.value.length : nl);
        const lines = block.split('\n'), all = lines.every((l) => /^\s*\/\//.test(l) || !l.trim());
        const next = lines.map((l) => (all ? l.replace(/^(\s*)\/\/ ?/, '$1') : l.trim() ? l.replace(/^(\s*)/, '$1// ') : l)).join('\n');
        const end = a + block.length;
        insert(next, a, end);
        return;
      }
      if (e.key === 'Enter' && !mod && !e.altKey) {
        e.preventDefault();
        const s = ta.selectionStart, before = ta.value.slice(lineStart(s), s);
        const ind = /^\s*/.exec(before)[0], open = /[{(\[]\s*$/.test(before), closeNext = /^[}\])]/.test(ta.value.slice(ta.selectionEnd));
        if (open && closeNext) { insert('\n' + ind + indentUnit() + '\n' + ind); const p = s + 1 + ind.length + indentUnit().length; ta.setSelectionRange(p, p); }
        else insert('\n' + ind + (open ? indentUnit() : ''));
        return;
      }
      const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', '`': '`' };
      if (pairs[e.key] && !mod && !e.altKey) {
        const s = ta.selectionStart, en = ta.selectionEnd, nextCh = ta.value[en];
        if ((e.key === '"' || e.key === '`') && nextCh === e.key && s === en) { e.preventDefault(); ta.setSelectionRange(s + 1, s + 1); return; }
        if (s === en && nextCh && /\w/.test(nextCh)) return;
        e.preventDefault();
        const sel = ta.value.slice(s, en);
        insert(e.key + sel + pairs[e.key], s, en);
        ta.setSelectionRange(s + 1, s + 1 + sel.length);
        return;
      }
      if (')]}'.includes(e.key) && e.key && ta.value[ta.selectionStart] === e.key && ta.selectionStart === ta.selectionEnd) { e.preventDefault(); ta.setSelectionRange(ta.selectionStart + 1, ta.selectionStart + 1); return; }
      if (e.key === 'Backspace' && ta.selectionStart === ta.selectionEnd) {
        const s = ta.selectionStart, pair = ta.value.slice(s - 1, s + 1);
        if (['()', '[]', '{}', '""', '``'].includes(pair)) { e.preventDefault(); insert('', s - 1, s + 1); }
      }
    });
    ta.addEventListener('input', () => { paint(); opts.onChange?.(ta.value); cursor(); });
    ta.addEventListener('scroll', sync);
    const cursor = () => { const before = ta.value.slice(0, ta.selectionStart).split('\n'); opts.onCursor?.(before.length, before.at(-1).length + 1); };
    ta.addEventListener('keyup', cursor); ta.addEventListener('click', cursor); ta.addEventListener('focus', cursor);

    // hover → word under pointer
    ta.addEventListener('mousemove', (e) => {
      const r = ta.getBoundingClientRect();
      const line = Math.floor((e.clientY - r.top + ta.scrollTop - PAD_T) / LH) + 1;
      const col = Math.floor((e.clientX - r.left + ta.scrollLeft - PAD_L) / CW);
      const text = ta.value.split('\n')[line - 1] || '';
      let a = col, z = col;
      while (a > 0 && /\w/.test(text[a - 1])) a--;
      while (z < text.length && /\w/.test(text[z])) z++;
      const word = col >= 0 && col < text.length && /\w/.test(text[col]) ? text.slice(a, z) : '';
      const key = word ? line + ':' + a : '';
      if ((hoverBox?.key || '') !== key) {
        hoverBox = word && !/^\d/.test(word) && !/^(?:func|package|import|return|var|for|if|else|range|go|chan|make|len|cap|append|fmt|main)$/.test(word) ? { key, line, col: a, len: word.length, word } : null;
        const hit = opts.onHover?.(hoverBox?.word || null, line);
        if (!hit && hoverBox) hoverBox = null;
        paintDeco();
      }
      // diagnostic popup
      const d = diags.find((x) => x.line === line);
      if (d && col >= 0) showPop(d, line); else hidePop();
    });
    ta.addEventListener('mouseleave', () => { if (hoverBox) { hoverBox = null; opts.onHover?.(null); paintDeco(); } hidePop(); });
    function showPop(d, line) {
      if (!pop) { pop = document.createElement('div'); pop.className = 'diag-pop'; area.append(pop); }
      pop.textContent = d.message;
      pop.style.top = (line * LH + PAD_T - ta.scrollTop + 4) + 'px';
      pop.style.left = Math.max(8, ((d.column || 1) - 1) * CW + PAD_L - ta.scrollLeft) + 'px';
    }
    function hidePop() { pop?.remove(); pop = null; }

    gutter.addEventListener('click', (e) => { const l = Number(e.target.closest('[data-line]')?.dataset.line); if (l) opts.onGutter?.(l); });
    gutter.style.pointerEvents = 'auto';

    metrics();
    const api = {
      el: ta,
      get value() { return ta.value; },
      set value(v) { ta.value = v; ghosts = new Map(); diags = []; hits = new Set(); heat = new Map(); now = -1; errLine = -1; ta.scrollTop = 0; paint(); },
      setNow(line, scroll = true) {
        if (line === now) return; now = line; paint();
        if (scroll && line > 0) {
          const y = (line - 1) * LH + PAD_T;
          if (y < ta.scrollTop + LH || y > ta.scrollTop + ta.clientHeight - 3 * LH) ta.scrollTo({ top: Math.max(0, y - ta.clientHeight / 3), behavior: 'smooth' });
        }
      },
      setGhosts(map) { ghosts = map; paint(); },
      setHits(set) { hits = set; },
      setHeat(map) { heat = map || new Map(); paint(); }, // line → {objects, moved[], level 0..1}
      setDiagnostics(list, runtimeLine = -1) { diags = list || []; errLine = runtimeLine; paint(); },
      update(o) { if (o.ghosts) ghosts = o.ghosts; if (o.hits) hits = o.hits; if (o.now !== undefined) now = o.now; paint(); },
      focusLine(line) {
        const lines = ta.value.split('\n'); let off = 0;
        for (let i = 0; i < line - 1 && i < lines.length; i++) off += lines[i].length + 1;
        ta.focus(); ta.setSelectionRange(off, off);
        ta.scrollTo({ top: Math.max(0, (line - 1) * LH - ta.clientHeight / 3) });
      },
      refresh() { metrics(); paint(); },
      replaceAll(text) { // keeps the browser's undo history
        const line = ta.value.slice(0, ta.selectionStart).split('\n').length;
        insert(text, 0, ta.value.length);
        const lines = ta.value.split('\n'); let off = 0;
        for (let i = 0; i < Math.min(line, lines.length) - 1; i++) off += lines[i].length + 1;
        ta.setSelectionRange(off, off);
      },
    };
    paint();
    return api;
  }
  global.GothikEditor = Object.freeze({ mount, highlightLine, tidy });
})(globalThis);

export const GothikEditor = globalThis.GothikEditor;
