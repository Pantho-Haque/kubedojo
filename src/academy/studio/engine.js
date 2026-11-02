// The learn-studio runtime of the Full-Stack AI courses (the original ai-ring HTML, the source of truth), embedded in the Academy.
// It is the original runtime, verbatim apart from the lines marked "Academy:". What embedding changed:
//   - it draws into a shadow root on the lesson page (its CSS can't leak out, and the site's can't leak in);
//   - its #/ links and routes are Academy URLs (/academy/<course>/<lesson>#c<card>, …/glossary, …), followed by the site router;
//   - no page header, footer, welcome dialog, favicon or theme/motion settings: the site's theme and the OS motion setting rule;
//   - learner code compiles in a same-origin runner page (public/studio-eval.html), because the site's CSP has no 'unsafe-eval'.
/* eslint-disable no-redeclare, no-useless-escape, no-unused-vars -- kept verbatim from the original runtime */
import CSS from './studio.css?inline';

let sheet = null; // one parsed stylesheet, shared by every studio shadow root
const made = {};
export const studio = (C, slug) => (made[slug] ||= makeStudio(C, slug));

// Academy: the runner page lends its Function constructor; code built with it runs here, in this tab, synchronously.
let EVAL = null, evalP = null;
const evalReady = () => evalP ||= new Promise(res => {
  const f = document.createElement('iframe'); f.src = '/studio-eval.html'; f.hidden = true; f.tabIndex = -1; f.title = 'Code runner'; f.setAttribute('aria-hidden', 'true');
  f.onload = () => { EVAL = f.contentWindow.Function; res(); }; document.body.append(f);
});

function makeStudio(C, slug) {
const doc = document, root = doc.documentElement, NS = 'http://www.w3.org/2000/svg';
let SR = doc, HOST = null, NAV = u => { location.href = u; }, DONE = () => {}, HASH = '#/'; // Academy: the shadow root drawn into, the router, "lesson finished", the current route
const $ = (s, r = SR) => r.querySelector(s), $$ = (s, r = SR) => [...r.querySelectorAll(s)];
// Academy: the original #/ routes as Academy URLs
const BASE = '/academy/' + slug;
function url(hash) {
  const p = String(hash).replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  if (p[0] === 'l') return BASE + '/' + p[1] + '#c' + (+p[2] || 0); // every card is in the history, so Back returns to it
  if (p[0] === 'done') return BASE + '/' + p[1] + '#done';
  if (p[0] === 'project') return BASE + '/project#m' + (p[1] || 0);
  if (p[0] === 'glossary') return BASE + '/glossary' + (p[1] ? '#' + encodeURIComponent(p[1]) : '');
  if (p[0] === 'cheat') return BASE + '/cheatsheet';
  if (p[0] === 'review' || p[0] === 'certificate') return BASE + '/' + p[0];
  return BASE;
}
const goHash = hash => NAV(url(hash));

/* ---------- tiny DOM helpers ---------- */
function h(tag, a, ...kids) {
  const svg = tag.startsWith('svg:'), e = svg ? doc.createElementNS(NS, tag.slice(4)) : doc.createElement(tag);
  if (a) for (const k in a) {
    const v = a[k]; if (v == null || v === false) continue;
    if (k === 'class') e.setAttribute('class', v);
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k === 'value' && !svg) e.value = v;
    else if (k === 'href' && /^#\//.test(v)) e.setAttribute('href', url(v)); // Academy: real URLs, followed by the router
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(3)) if (c != null && c !== false) e.append(c.nodeType ? c : doc.createTextNode(c));
  return e;
}
const IC = {
  map:'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15', review:'M21 12a9 9 0 1 1-3-6.7 M21 4v5h-5', book:'M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z M4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3',
  sheet:'M9 6h11 M9 12h11 M9 18h11 M4.5 6h.01 M4.5 12h.01 M4.5 18h.01', search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-4.3-4.3',
  gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  flame:'M12 22c4 0 7-2.8 7-7 0-4.5-4-7-5-12-3 2.5-6 6-6 9.5C7 11 6 10 6 8.5 5 10 5 12 5 15c0 4.2 3 7 7 7z', check:'M5 12.5l4.5 4.5L19 7.5', x:'M6 6l12 12 M18 6L6 18',
  play:'M7 4.5v15l12.5-7.5z', pause:'M8 5v14 M16 5v14', prev:'M15 6l-6 6 6 6', next:'M9 6l6 6-6 6', reset:'M3 12a9 9 0 1 0 3-6.7 M3 4v5h5',
  bulb:'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z', eye:'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  arrow:'M5 12h14 M13 6l6 6-6 6', undo:'M9 14L4 9l5-5 M4 9h10.5a5.5 5.5 0 0 1 0 11H11', term:'M4 17l6-5-6-5 M12 19h8', sliders:'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
  code:'M16 18l6-6-6-6 M8 6l-6 6 6 6', key:'M2 6h20v12H2z M6 10h.01 M10 10h.01 M14 10h.01 M18 10h.01 M7 14h10', film:'M3 4h18v16H3z M3 9h18 M8 4l2 5 M14 4l2 5',
  quiz:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.2 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5 M12 17.5h.01', copy:'M9 9h11v11H9z M5 15H4V4h11v1', clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  target:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 12h.01', star:'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z',
  print:'M6 9V3h12v6 M6 18H4v-7h16v7h-2 M6 14h12v7H6z', down:'M12 4v12 M6 11l6 6 6-6 M4 20h16', up:'M12 20V8 M6 13l6-6 6 6 M4 4h16', trash:'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13'
};
function icon(n, cls) { const s = doc.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'ic' + (cls ? ' ' + cls : '')); s.setAttribute('aria-hidden', 'true'); const p = doc.createElementNS(NS, 'path'); p.setAttribute('d', IC[n] || IC.star); s.append(p); return s; }
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plain = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, a, b) => b || a).replace(/[`*]/g, '');
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/* ---------- math: a small TeX subset rendered as native MathML ---------- */
const TEX_SYM = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ', pi: 'π', sigma: 'σ', tau: 'τ', phi: 'φ', omega: 'ω', eta: 'η', rho: 'ρ', Sigma: 'Σ', Delta: 'Δ', Omega: 'Ω', Theta: 'Θ',
  cdot: '·', times: '×', div: '÷', colon: ':', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈', in: '∈', notin: '∉', to: '→', rightarrow: '→', leftarrow: '←', Rightarrow: '⇒', infty: '∞', pm: '±',
  ldots: '…', cdots: '⋯', sum: '∑', prod: '∏', lVert: '‖', rVert: '‖', '|': '‖', mid: '|', partial: '∂', nabla: '∇', top: '⊤', propto: '∝', forall: '∀', exists: '∃', cap: '∩', cup: '∪', subset: '⊂',
  lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉', langle: '⟨', rangle: '⟩', sim: '∼', equiv: '≡', gg: '≫', ll: '≪', circ: '∘', star: '⋆' };
const TEX_FN = ['log', 'ln', 'exp', 'max', 'min', 'arg', 'cos', 'sin', 'tanh', 'softmax', 'argmax', 'argmin', 'rank', 'score', 'sign', 'len', 'dim', 'top', 'IDF', 'tf', 'avgdl'];
function tex(src, block) {
  const s = String(src); let i = 0;
  const ws = () => { while (s[i] === ' ') i++; };
  const group = () => { const out = expr('}'); i++; return '<mrow>' + out + '</mrow>'; };
  const arg = () => { ws(); if (s[i] === '{') { i++; return group(); } return atom(); };
  function raw() { ws(); if (s[i] !== '{') return ''; i++; let t = '', d = 1; while (i < s.length) { if (s[i] === '{') d++; else if (s[i] === '}' && !--d) break; t += s[i++]; } i++; return t; }
  function atom() {
    ws(); const c = s[i]; if (c === undefined) return '';
    if (c === '{') { i++; return group(); }
    if (c === '\\') {
      i++; let n = ''; if (/[a-zA-Z]/.test(s[i])) while (/[a-zA-Z]/.test(s[i] || '')) n += s[i++]; else n = s[i++];
      if (n === 'frac') { const a = arg(), b = arg(); return '<mfrac>' + a + b + '</mfrac>'; }
      if (n === 'sqrt') return '<msqrt>' + arg() + '</msqrt>';
      if (n === 'text') return '<mtext>' + esc(raw()) + '</mtext>';
      if (n === 'mathrm' || n === 'operatorname') return '<mi mathvariant="normal">' + esc(raw()) + '</mi>';
      if (n === 'mathbf') return '<mi mathvariant="bold">' + esc(raw()) + '</mi>';
      if (n === 'mathbb') return '<mi>' + esc(raw()).replace(/[A-Z]/g, ch => ({ R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', C: 'ℂ', E: '𝔼', P: 'ℙ' }[ch] || ch)) + '</mi>';
      if (n === 'hat' || n === 'bar' || n === 'vec' || n === 'tilde') return '<mover accent="true">' + arg() + '<mo>' + { hat: '^', bar: '¯', vec: '→', tilde: '~' }[n] + '</mo></mover>';
      if (['left', 'right', 'big', 'Big', 'bigg', 'displaystyle'].includes(n)) return '';
      if ([',', ';', ' ', 'quad', 'qquad'].includes(n)) return '<mspace width="' + (n === 'quad' ? '1em' : n === 'qquad' ? '2em' : '0.25em') + '"/>';
      if (n === '{' || n === '}' || n === '%' || n === '_' || n === '#' || n === '&') return '<mo>' + esc(n) + '</mo>';
      if (n === 'bmod') return '<mo lspace="0.3em" rspace="0.3em">mod</mo>';
      if (TEX_FN.includes(n)) return '<mi mathvariant="normal">' + (n === 'argmax' ? 'arg max' : n === 'argmin' ? 'arg min' : n) + '</mi><mo>\u2061</mo>'; // function application gives ln 0.7 its space
      const v = TEX_SYM[n];
      if (v) return /[α-ωΑ-Ω∞∂∇]/.test(v) ? '<mi>' + v + '</mi>' : (n === 'sum' || n === 'prod') ? '<mo largeop="true" movablelimits="true">' + v + '</mo>' : '<mo>' + v + '</mo>';
      return '<mtext>\\' + esc(n) + '</mtext>';
    }
    i++;
    if (/[0-9.]/.test(c)) { let t = c; for (;;) { if (/[0-9.]/.test(s[i] || '')) t += s[i++]; else if (s.startsWith('{,}', i) && /[0-9]/.test(s[i + 3] || '')) { t += ','; i += 3; } else break; } return '<mn>' + t + '</mn>'; } // 1{,}000 is one number
    if (/[a-zA-Z]/.test(c)) return '<mi>' + c + '</mi>';
    if (c === "'") return '<mo>′</mo>';
    return '<mo>' + (c === '-' ? '−' : esc(c)) + '</mo>';
  }
  function expr(stop) {
    let out = '';
    for (;;) {
      ws(); if (i >= s.length || s[i] === stop || s[i] === '}') break;
      let base = atom(), sub = null, sup = null;
      for (;;) { ws(); if (s[i] === '_') { i++; sub = arg(); } else if (s[i] === '^') { i++; sup = arg(); } else break; }
      if (sub || sup) {
        base = base || '<mrow></mrow>';
        const big = block && /largeop|arg max|arg min|>max<|>min</.test(base);
        base = big ? (sub && sup ? '<munderover>' + base + sub + sup + '</munderover>' : sub ? '<munder>' + base + sub + '</munder>' : '<mover>' + base + sup + '</mover>')
          : (sub && sup ? '<msubsup>' + base + sub + sup + '</msubsup>' : sub ? '<msub>' + base + sub + '</msub>' : '<msup>' + base + sup + '</msup>');
      }
      out += base;
    }
    return out;
  }
  return '<math display="' + (block ? 'block' : 'inline') + '"><mrow>' + expr(null) + '</mrow></math>';
}
/* ---------- glossary + rich text ---------- */
const G = {}; for (const k in C.glossary || {}) { const v = C.glossary[k]; G[k.toLowerCase()] = { name: k, def: typeof v === 'string' ? v : v.def, deep: typeof v === 'object' ? v.deep : null }; }
function rt(s) { // code spans are left alone: `x[[0]]` is Python, not a glossary link
  return String(s == null ? '' : s).split(/(`[^`]+`)/).map((part, i) => i % 2 ? '<code>' + esc(part.slice(1, -1)) + '</code>' : part
    .replace(/\\\((.+?)\\\)/g, (_, m) => tex(m, false))
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, l) => '<button type="button" class="term" data-term="' + esc(t.trim()) + '" aria-expanded="false">' + (l || t) + '</button>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')).join('');
}
const paras = b => (Array.isArray(b) ? b : String(b || '').split(/\n\s*\n/)).filter(Boolean).map(p => '<p>' + rt(p) + '</p>').join('');
let pop = null, popFor = null;
function closePop() { if (pop) { pop.remove(); popFor.setAttribute('aria-expanded', 'false'); popFor.removeAttribute('aria-describedby'); pop = popFor = null; } }
function openPop(btn) {
  if (popFor === btn) return closePop(); closePop();
  const g = G[btn.dataset.term.toLowerCase()]; if (!g) return;
  pop = h('div', { class: 'pop', role: 'tooltip', id: 'gpop' }, h('strong', { text: g.name }), h('div', { html: rt(g.def) }), g.deep ? h('a', { class: 'pop-deep', href: '#/glossary/' + encodeURIComponent(btn.dataset.term.toLowerCase()) }, 'Deep dive: formula, figure, example →') : null);
  SR.append(pop); popFor = btn; // Academy: in the shadow root, placed against the host (it is position: relative)
  const r = btn.getBoundingClientRect(), w = pop.offsetWidth, ph = pop.offsetHeight, o = HOST.getBoundingClientRect();
  const below = r.bottom + ph + 12 < innerHeight;
  pop.style.left = clamp(r.left - o.left + r.width / 2 - w / 2, 8 - o.left, doc.documentElement.clientWidth - w - 8 - o.left) + 'px';
  pop.style.top = (below ? r.bottom - o.top + 8 : r.top - o.top - ph - 8) + 'px';
  btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-describedby', 'gpop');
}
// Academy: page-level listeners are added while a view is shown (see show()); events from the shadow root are read at their real target
function onClick(e) {
  const tg = e.composedPath()[0], t = tg.closest && tg.closest('.term'); if (t) { e.preventDefault(); openPop(t); } else if (!tg.closest || !tg.closest('.pop')) closePop();
  const a = tg.closest && tg.closest('a[href]'); // Academy: links inside the studio go through the site router
  if (a && SR.contains && SR.contains(a) && !a.target && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0 && /^\/(?!\/)/.test(a.getAttribute('href'))) { e.preventDefault(); NAV(a.getAttribute('href')); }
}
const onScroll = () => { if (pop && popFor && !popFor.isConnected) closePop(); };

/* ---------- storage (versioned, never throws) ---------- */
const KEY = 'ls:' + C.id, VER = 1;
const blank = () => ({ v: VER, les: {}, pos: null, xp: 0, days: [], rev: {}, stats: { q: 0, first: 0 }, name: '', set: { theme: 'system', motion: 'system', speed: 1 }, intro: false });
let corrupt = false;
function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { return blank(); }
  if (!raw) return blank();
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || typeof o.les !== 'object' || !Array.isArray(o.days)) throw new Error('shape');
    // ponytail: one schema version; add `if (o.v === 1) o = migrate1to2(o)` when the shape changes.
    if (o.v !== VER) throw new Error('version');
    const b = blank(); return Object.assign(b, o, { set: Object.assign(b.set, o.set) });
  } catch (e) { corrupt = true; try { localStorage.setItem(KEY + ':backup', raw); } catch (_) {} return blank(); }
}
let S = load();
function save() { S.t = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} } // Academy: no shared hub theme setting

/* ---------- course index ---------- */
const L = [];
C.modules.forEach((m, mi) => m.lessons.forEach((l, li) => { l.mod = m; l.mi = mi; l.li = li; l.i = L.length; L.push(l); }));
const byId = Object.fromEntries(L.map(l => [l.id, l]));
const QZ = {}; L.forEach(l => l.cards.forEach((c, ci) => { if (c.t === 'quiz' && c.kind !== 'explain') QZ[l.id + '#' + ci] = { l, c, ci }; }));
const lp = l => S.les[l.id] || (S.les[l.id] = { c: [], xp: 0 });
const isDone = l => !!(S.les[l.id] && S.les[l.id].done);
const cardDone = (l, ci) => !!(S.les[l.id] && S.les[l.id].c.includes(ci));
const nextLesson = () => L.find(l => !isDone(l));
const totalMins = L.reduce((a, l) => a + (l.mins || 5), 0);

/* ---------- time, streak, xp, review ---------- */
const DAY = 864e5;
const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / DAY) ;
function practiced() { const d = today(); if (!S.days.includes(d)) { S.days.push(d); S.days = S.days.slice(-400); } }
function streak() { const set = new Set(S.days); let d = today(); if (!set.has(d)) d--; let n = 0; while (set.has(d)) { n++; d--; } return n; }
const INT = [0, 1, 2, 4, 8, 16];
function schedule(qid, ok) {
  const r = S.rev[qid];
  if (!r) S.rev[qid] = ok ? { b: 1, due: today() + INT[1] } : { b: 0, due: today() };
  else { r.b = ok ? Math.min(5, r.b + 1) : Math.floor(r.b / 2); r.due = today() + INT[r.b]; }
}
const dueList = () => Object.keys(S.rev).filter(q => QZ[q] && S.rev[q].due <= today());
function addXP(n, l, el) {
  S.xp += n; if (l) lp(l).xp = (lp(l).xp || 0) + n; save(); updateHeader();
  if (el && !reduced()) { const r = el.getBoundingClientRect(); const p = h('div', { class: 'xp-pop', text: '+' + n + ' XP', style: { left: (r.right - 70) + 'px', top: (r.top - 8) + 'px' } }); SR.append(p); setTimeout(() => p.remove(), 950); }
}

/* ---------- theme + motion ---------- */
const mqFit = matchMedia('(min-width: 1024px) and (min-height: 620px)'), mqNarrow = matchMedia('(max-width: 640px)');
const mqDark = matchMedia('(prefers-color-scheme: dark)'), mqMotion = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => mqMotion.matches; // Academy: the OS setting rules
function applyTheme() { // Academy: follow the site's theme (html[data-theme], else the OS) on the host
  if (!HOST) return;
  HOST.dataset.theme = root.dataset.theme || (mqDark.matches ? 'dark' : 'light');
  HOST.dataset.motion = reduced() ? 'reduce' : 'full';
  HOST.style.removeProperty('--accent'); if (C.accent && HOST.dataset.theme === 'light') HOST.style.setProperty('--accent', C.accent); // dark keeps its tested accent
}
const D = ms => reduced() ? 0 : ms / (S.set.speed || 1);

function toast(msg) { const t = h('div', { text: msg }); $('#toast').replaceChildren(t); setTimeout(() => t.remove(), 3000); }

/* ---------- animation primitives ---------- */
const easeOut = t => 1 - Math.pow(1 - t, 3), easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function tween(dur, fn, ok, ease = easeOut) {
  return new Promise(res => {
    if (!dur) { fn(1); return res(); }
    const t0 = performance.now();
    const tick = now => { if (!ok()) return res(); const p = Math.min(1, (now - t0) / dur); fn(ease(p)); p < 1 ? requestAnimationFrame(tick) : res(); };
    requestAnimationFrame(tick);
  });
}
const anim = (el, kf, o) => { try { return el.animate(kf, o); } catch (e) { return null; } };

/* ---------- scene model (pure) ---------- */
const edgeProps = x => typeof x === 'string' ? { label: x } : Object.assign({}, x || {});
function applyOp(st, op) {
  const [o, a, b, c] = op;
  if (o === 'add') st.nodes[a] = Object.assign({}, b);
  else if (o === 'rm') { delete st.nodes[a]; for (const k in st.edges) if (k.split('>').includes(a)) delete st.edges[k]; }
  else if (o === 'set' && st.nodes[a]) Object.assign(st.nodes[a], b);
  else if (o === 'move' && st.nodes[a]) Object.assign(st.nodes[a], { x: b, y: c });
  else if (o === 'link') st.edges[a + '>' + b] = edgeProps(c);
  else if (o === 'unlink') delete st.edges[a + '>' + b];
  else if (o === 'var') { if (b == null) delete st.vars[a]; else st.vars[a] = b; }
}
function baseState(nodes, edges, vars) {
  const st = { nodes: {}, edges: {}, vars: Object.assign({}, vars || {}) };
  for (const id in nodes || {}) st.nodes[id] = Object.assign({}, nodes[id]);
  if (Array.isArray(edges)) for (const e of edges) st.edges[e[0] + '>' + e[1]] = edgeProps(e[2]);
  else Object.assign(st.edges, edges || {});
  return st;
}
function stateAt(sc, k) { const st = baseState(sc.nodes, sc.edges, sc.vars); for (let i = 0; i <= k; i++) for (const op of sc.steps[i].do || []) applyOp(st, op); return st; }
const SIZE = { box: [120, 52], circle: [64, 64], pill: [120, 40], db: [100, 66], group: [220, 150], bar: [40, 100], text: [120, 24] };
function size(p) { const d = SIZE[p.shape || 'box'] || SIZE.box; const w = p.w || (p.shape === 'text' ? Math.max(40, String(p.label || '').length * 8) : d[0]); return { w, h: p.shape === 'circle' ? (p.w || d[1]) : (p.h || d[1]) }; }

/* ---------- Stage: renders a scene state into SVG with smooth transitions ---------- */
function Stage(W, H, title, opt) {
  opt = opt || {};
  const svg = h('svg:svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': title, preserveAspectRatio: 'xMidYMid meet' });
  const lg = h('svg:g'), le = h('svg:g'), ln = h('svg:g'), lp_ = h('svg:g');
  svg.append(h('svg:title', { text: title }), lg, le, ln, lp_);
  const notes = h('div', { class: 'notes' }), vars = h('div', { class: 'vars' });
  const svi = h('div', { class: 'svi', style: { maxWidth: 'calc(50vh * ' + (W / H).toFixed(3) + ')' } }, svg, notes), sv = h('div', { class: 'sv' }, svi);
  // Fit mode (lesson fills the window): size the drawing to the box it is given, keeping its aspect ratio.
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
    const fixedNow = opt.h && !mqNarrow.matches; // fixed-height boards fall back to normal panning stages on phones
    sv.style.height = fixedNow ? opt.h + 'px' : '';
    if (!(mqFit.matches && doc.body.classList.contains('has-ol')) && !fixedNow) { svi.style.width = svi.style.height = ''; svi.style.maxWidth = 'calc(50vh * ' + (W / H).toFixed(3) + ')'; return; }
    const cw = sv.clientWidth, ch = sv.clientHeight; if (!cw || !ch) return;
    const w = Math.min(cw, ch * W / H); svi.style.maxWidth = 'none'; svi.style.width = w + 'px'; svi.style.height = (w * H / W) + 'px';
  }) : null;
  if (ro) ro.observe(sv);
  const el = h('div', { class: 'stage' }, h('div', { class: 'pan-hint', text: '↔ Swipe the diagram to see all of it. It follows the action.' }), sv, vars);
  if (opt.h) el.classList.add('fixed');
  function follow(ids) { // on narrow screens the diagram pans; keep the action in view
    if (sv.scrollWidth <= sv.clientWidth + 2 || !ids || !ids.length) return;
    const xs = ids.filter(i => N.has(i)).map(i => N.get(i).p.x); if (!xs.length) return;
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2 / W * svi.clientWidth;
    sv.scrollTo({ left: cx - sv.clientWidth / 2, behavior: reduced() ? 'auto' : 'smooth' });
  }
  const N = new Map(), E = new Map(), live = {}; let gen = 0, pgen = 0, curVars = {}, alive = true;
  const f1 = n => Math.round(n * 10) / 10;
  function mkNode(id, p) {
    const shape = p.shape || 'box', tag = shape === 'circle' ? 'svg:circle' : shape === 'db' ? 'svg:path' : 'svg:rect';
    const n = { shape, g: h('svg:g', { 'data-id': id }), inner: h('svg:g', { class: 'ni' }), ring: h(tag, { class: 'ring' }), sh: h(tag, { class: 'sh' }), lbl: h('svg:text', { class: 'lbl' }), sub: h('svg:text', { class: 'sub' }), bdg: h('svg:g', { class: 'bdg' }, h('svg:circle', { r: 9 }), h('svg:path', { class: 'bg' })) };
    if (shape === 'text') n.inner.append(n.lbl, n.sub); else n.inner.append(n.ring, n.sh, n.lbl, n.sub, n.bdg);
    n.g.append(n.inner); (shape === 'group' ? lg : ln).append(n.g); return n;
  }
  function geom(n) {
    const L_ = n.L, w = L_.w, hh = L_.h, s = n.shape;
    for (const el of [n.sh, n.ring]) {
      if (s === 'circle') el.setAttribute('r', w / 2);
      else if (s === 'db') { const rx = w / 2, ry = Math.min(10, hh / 6); el.setAttribute('d', `M${-rx},${-hh / 2 + ry}a${rx},${ry} 0 0 0 ${w},0a${rx},${ry} 0 0 0 ${-w},0v${hh - 2 * ry}a${rx},${ry} 0 0 0 ${w},0v${-(hh - 2 * ry)}`); }
      else { el.setAttribute('x', -w / 2); el.setAttribute('y', s === 'bar' ? -hh : -hh / 2); el.setAttribute('width', w); el.setAttribute('height', hh); el.setAttribute('rx', s === 'pill' ? hh / 2 : s === 'group' ? 14 : s === 'bar' ? 5 : 11); }
    }
    const hasSub = !!n.sub.textContent;
    if (s === 'group') { n.lbl.setAttribute('x', -w / 2 + 12); n.lbl.setAttribute('y', -hh / 2 + 16); n.sub.setAttribute('y', hh / 2 - 12); }
    else if (s === 'bar') { n.lbl.setAttribute('x', 0); n.lbl.setAttribute('y', -hh - 12); n.sub.setAttribute('y', 14); }
    else { n.lbl.setAttribute('x', 0); n.lbl.setAttribute('y', s === 'db' ? (hasSub ? -2 : 6) : hasSub ? -8 : 0); n.sub.setAttribute('y', s === 'db' ? 16 : 11); }
    const bx = s === 'circle' ? w * .36 : w / 2 - 3, by = s === 'circle' ? -w * .36 : s === 'bar' ? -hh + 3 : -hh / 2 + 3;
    n.bdg.setAttribute('transform', `translate(${bx},${by})`);
  }
  function styleNode(n, p) {
    const s = n.shape;
    n.g.setAttribute('class', 'nd k-' + (p.kind || 'n') + (p.state ? ' s-' + p.state : '') + (s === 'group' ? ' group' : '') + (s === 'text' ? ' txt' : '') + (n.dim ? ' dim' : '') + (n.foc ? ' foc' : ''));
    n.lbl.textContent = p.label != null ? p.label : ''; n.sub.textContent = p.sub || '';
    n.bdg.lastChild.setAttribute('d', GLYPH[p.state] || '');
  }
  const place = n => { n.g.setAttribute('transform', `translate(${f1(n.L.x)},${f1(n.L.y)})`); geom(n); };
  function center(id) { const n = N.get(id), L_ = n.L; return { x: L_.x, y: n.shape === 'bar' ? L_.y - L_.h / 2 : L_.y, w: L_.w, h: L_.h, c: n.shape === 'circle' }; }
  function clip(A, tx, ty) {
    const dx = tx - A.x, dy = ty - A.y, d = Math.hypot(dx, dy) || 1;
    if (A.c) { const r = A.w / 2 + 3; return [A.x + dx / d * r, A.y + dy / d * r]; }
    const s = Math.min((A.w / 2 + 3) / (Math.abs(dx) || 1e-9), (A.h / 2 + 3) / (Math.abs(dy) || 1e-9), 1);
    return [A.x + dx * s, A.y + dy * s];
  }
  function edgeGeo(a, b, bend) {
    const A = center(a), B = center(b); let cx = (A.x + B.x) / 2, cy = (A.y + B.y) / 2;
    const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
    if (bend) { cx += -dy / len * bend; cy += dx / len * bend; }
    return { p1: clip(A, bend ? cx : B.x, bend ? cy : B.y), p2: clip(B, bend ? cx : A.x, bend ? cy : A.y), c: [cx, cy], bend: !!bend };
  }
  function mkEdge(a, b) { const e = { a, b, g: h('svg:g', { class: 'ed' }), ln: h('svg:path', { class: 'ln' }), hd: h('svg:path', { class: 'hd', d: 'M1,0L-9,-5.5L-9,5.5Z' }), hd2: h('svg:path', { class: 'hd', d: 'M1,0L-9,-5.5L-9,5.5Z' }), tx: h('svg:text', { class: 'el' }) }; e.g.append(e.ln, e.hd, e.hd2, e.tx); le.append(e.g); return e; }
  function styleEdge(e) { const p = e.p; e.g.setAttribute('class', 'ed' + (p.dash ? ' dash' : '') + (p.tone ? ' t-' + p.tone : '') + (e.dim ? ' dim' : '')); e.tx.textContent = p.label || ''; }
  function drawEdge(e) {
    if (!N.has(e.a) || !N.has(e.b)) return;
    const G_ = e.geo = edgeGeo(e.a, e.b, e.p.bend || 0), { p1, p2, c } = G_;
    const from2 = G_.bend ? c : p1, from1 = G_.bend ? c : p2;
    const a2 = Math.atan2(p2[1] - from2[1], p2[0] - from2[0]), a1 = Math.atan2(p1[1] - from1[1], p1[0] - from1[0]);
    const head = e.p.arrow !== false, bi = !!e.p.bi;
    const q2 = head ? [p2[0] - Math.cos(a2) * 7, p2[1] - Math.sin(a2) * 7] : p2, q1 = bi ? [p1[0] - Math.cos(a1) * 7, p1[1] - Math.sin(a1) * 7] : p1;
    e.ln.setAttribute('d', G_.bend ? `M${q1.map(f1)}Q${c.map(f1)} ${q2.map(f1)}` : `M${q1.map(f1)}L${q2.map(f1)}`);
    e.hd.setAttribute('transform', `translate(${p2.map(f1)}) rotate(${f1(a2 * 57.2958)})`); e.hd.style.display = head ? '' : 'none';
    e.hd2.setAttribute('transform', `translate(${p1.map(f1)}) rotate(${f1(a1 * 57.2958)})`); e.hd2.style.display = bi ? '' : 'none';
    const m = G_.bend ? [.25 * p1[0] + .5 * c[0] + .25 * p2[0], .25 * p1[1] + .5 * c[1] + .25 * p2[1]] : [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    e.tx.setAttribute('x', f1(m[0])); e.tx.setAttribute('y', f1(m[1] - 8));
  }
  const drawEdges = () => E.forEach(drawEdge);
  function render(st, ms) {
    const dur = D(ms), my = ++gen;
    for (const [id, n] of N) if (!st.nodes[id]) {
      N.delete(id);
      if (dur) { const a = anim(n.inner, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.6)' }], { duration: D(220), easing: 'cubic-bezier(.3,0,.8,.15)', fill: 'forwards' }); a ? a.onfinish = () => n.g.remove() : n.g.remove(); } else n.g.remove();
    }
    const from = {}, to = {}; let moved = false;
    for (const id in st.nodes) {
      const p = st.nodes[id], t = Object.assign({ x: p.x, y: p.y }, size(p)); let n = N.get(id);
      if (!n) { moved = true; n = mkNode(id, p); N.set(id, n); n.L = Object.assign({}, t); n.p = p; styleNode(n, p); place(n); if (dur) anim(n.inner, [{ opacity: 0, transform: 'scale(.55)' }, { opacity: 1, transform: 'scale(1)' }], { duration: D(340), easing: 'cubic-bezier(.34,1.56,.64,1)' }); }
      else {
        const changed = n.p.state !== p.state || n.p.label !== p.label || n.p.sub !== p.sub || n.p.kind !== p.kind;
        n.p = p; styleNode(n, p);
        if (changed && dur) { anim(n.ring, [{ opacity: 0 }, { opacity: .9 }, { opacity: 0 }], { duration: D(650) }); anim(n.inner, [{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }, { transform: 'scale(1)' }], { duration: D(380), easing: 'ease-out' }); }
      }
      from[id] = Object.assign({}, n.L); to[id] = t;
      if (['x', 'y', 'w', 'h'].some(q => Math.abs(n.L[q] - t[q]) > .5)) moved = true;
    }
    for (const [k, e] of E) if (!st.edges[k] || !st.nodes[e.a] || !st.nodes[e.b]) { E.delete(k); if (dur) { const a = anim(e.g, [{ opacity: 1 }, { opacity: 0 }], { duration: D(200), fill: 'forwards' }); a ? a.onfinish = () => e.g.remove() : e.g.remove(); } else e.g.remove(); }
    const fresh = [];
    for (const k in st.edges) {
      const [a, b] = k.split('>'); if (!st.nodes[a] || !st.nodes[b]) continue;
      let e = E.get(k); if (!e) { e = mkEdge(a, b); E.set(k, e); fresh.push(e); moved = true; }
      e.p = st.edges[k]; styleEdge(e);
    }
    const stepF = f => { for (const id in to) { const n = N.get(id); if (!n) continue; const A = from[id], B = to[id]; for (const q of ['x', 'y', 'w', 'h']) n.L[q] = A[q] + (B[q] - A[q]) * f; place(n); } drawEdges(); };
    stepF(dur ? 0 : 1);
    if (dur) {
      for (const e of fresh) { let len = 0; try { len = e.ln.getTotalLength(); } catch (_) {} if (len && !e.p.dash) anim(e.ln, [{ strokeDasharray: len, strokeDashoffset: len }, { strokeDasharray: len, strokeDashoffset: 0 }], { duration: D(420), easing: 'ease-out' }); anim(e.g, [{ opacity: 0 }, { opacity: 1 }], { duration: D(250) }); }
      tween(dur, stepF, () => alive && my === gen);
    }
    // values panel
    vars.replaceChildren(...Object.entries(st.vars || {}).map(([k, v]) => { const el = h('span', { class: 'var' + (dur && curVars[k] !== undefined && curVars[k] !== v ? ' chg' : '') }, k + ' ', h('b', { text: String(v) })); return el; }));
    vars.hidden = !Object.keys(st.vars || {}).length; curVars = Object.assign({}, st.vars);
    return moved ? dur : 0;
  }
  function focus(ids) {
    const on = ids && ids.length;
    for (const [id, n] of N) { n.dim = on && !ids.includes(id) && n.shape !== 'group'; n.foc = on && ids.includes(id); styleNode(n, n.p); }
    for (const e of E.values()) { e.dim = on && !(ids.includes(e.a) && ids.includes(e.b)); styleEdge(e); }
  }
  function setNotes(list, st) {
    notes.replaceChildren(...(list || []).filter(([id]) => st.nodes[id]).map(([id, text]) => {
      const p = st.nodes[id], s = size(p), top = (p.shape === 'bar' ? p.y - s.h : p.y - s.h / 2), below = top < 64;
      return h('div', { class: 'note' + (below ? ' below' : ''), html: rt(text), style: { left: (p.x / W * 100) + '%', top: ((below ? (p.shape === 'bar' ? p.y : p.y + s.h / 2) : top) / H * 100) + '%' } });
    }));
  }
  function clearPackets() { pgen++; lp_.replaceChildren(); }
  function packet(a, b, label, tone) {
    return new Promise(res => {
      const dur = D(760), my = pgen;
      if (!dur || !N.has(a) || !N.has(b)) return res();
      let G_ = (E.get(a + '>' + b) || {}).geo, rev = false;
      if (!G_ && E.get(b + '>' + a)) { G_ = E.get(b + '>' + a).geo; rev = true; }
      if (!G_) G_ = edgeGeo(a, b, 0);
      follow([a, b]);
      const p1 = rev ? G_.p2 : G_.p1, p2 = rev ? G_.p1 : G_.p2, c = G_.c, q = G_.bend;
      const g = h('svg:g', { class: 'pk' + (tone ? ' t-' + tone : '') }, h('svg:circle', { r: 8 }), label ? h('svg:text', { y: -15, text: label }) : null);
      lp_.append(g);
      const at = t => q ? [(1 - t) * (1 - t) * p1[0] + 2 * (1 - t) * t * c[0] + t * t * p2[0], (1 - t) * (1 - t) * p1[1] + 2 * (1 - t) * t * c[1] + t * t * p2[1]] : [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];
      tween(dur, t => { const [x, y] = at(t); g.setAttribute('transform', `translate(${f1(x)},${f1(y)})`); }, () => alive && my === pgen, easeInOut).then(() => {
        if (!(alive && my === pgen)) { g.remove(); return res(); }
        const n = N.get(b); if (n) anim(n.inner, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: D(260) });
        anim(g, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }); setTimeout(() => { g.remove(); res(); }, 170);
      });
    });
  }
  return { el, svg, render, focus, setNotes, packet, clearPackets, follow, destroy() { alive = false; gen++; pgen++; if (ro) ro.disconnect(); }, nodes: N };
}

/* ---------- Player: step-through animated scene with captions ---------- */
let activePlayer = null, activeQuiz = null, activePlay = null;
const STATES = { ok: 'Healthy / done', warn: 'Waiting / warning', bad: 'Failed / error', off: 'Inactive', active: 'Active now' };
const GLYPH = { ok: 'M-4 .3l2.6 2.6 5.2-5.4', warn: 'M0-4.4v4.8 M0 3.9v.1', bad: 'M-3.3-3.3l6.6 6.6 M3.3-3.3l-6.6 6.6' };
// A legend swatch is a tiny copy of a real node in that state: same fill, outline, dash and badge.
function swatch(state) {
  return h('svg:svg', { viewBox: '0 0 34 22', width: 34, height: 22, class: 'swt s-' + state, 'aria-hidden': 'true' },
    h('svg:rect', { class: 'swr', x: 2, y: 5, width: 24, height: 14, rx: 4.5 }),
    GLYPH[state] ? h('svg:g', { transform: 'translate(26 6)' }, h('svg:circle', { class: 'swb', r: 5.6 }), h('svg:path', { class: 'swg', d: GLYPH[state], transform: 'scale(.6)' })) : null);
}
function legendFor(sts) {
  const used = new Set(); sts.forEach(n => n && n.state && used.add(n.state));
  if (!used.size) return null;
  const order = ['active', 'ok', 'warn', 'bad', 'off'];
  return h('div', { class: 'legend', role: 'list', 'aria-label': 'Legend' }, order.filter(s => used.has(s)).map(s => h('span', { role: 'listitem' }, swatch(s), STATES[s])));
}
function Player(host, sc, o) {
  o = o || {};
  const [W, H] = sc.size || [800, 380], n = sc.steps.length;
  const stage = Stage(W, H, sc.title || plain(sc.h) || 'Animated diagram');
  const cap = h('div', { class: 'cap', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const ib = (ic, label, fn) => h('button', { class: 'ibtn', type: 'button', 'aria-label': label, title: label, onclick: fn }, icon(ic));
  const bReset = ib('reset', 'Restart (Home)', () => { pause(); go(0); });
  const bPrev = ib('prev', 'Previous step (←)', () => { pause(); go(k - 1); });
  const bNext = ib('next', 'Next step (→)', () => { pause(); go(k + 1); });
  const bPlay = h('button', { class: 'btn pri sm pp', type: 'button', onclick: () => playing ? pause() : play() });
  const range = h('input', { type: 'range', min: 0, max: n - 1, step: 1, value: 0, 'aria-label': 'Jump to step' });
  range.addEventListener('input', () => { pause(); go(+range.value, false); });
  const cnt = h('span', { class: 'pcnt' });
  const speed = h('select', { class: 'spd', 'aria-label': 'Animation speed', title: 'Speed ( [ and ] )' }, [0.5, 1, 1.5, 2].map(v => h('option', { value: v, selected: +S.set.speed === v }, v + '×')));
  speed.addEventListener('change', () => { S.set.speed = +speed.value; save(); });
  const pred = h('div', { class: 'predict', hidden: true });
  const all = [sc.nodes ? Object.values(sc.nodes) : [], ...sc.steps.map(s => (s.do || []).filter(x => x[0] === 'add' || x[0] === 'set').map(x => x[2]))].flat();
  const tx = h('details', { class: 'tx' }, h('summary', null, 'Read every step as text'), h('ol', null, sc.steps.map(s => h('li', { html: rt(s.cap) }))));
  const fig = h('figure', { class: 'viz', style: { margin: '10px 0 0' } }, stage.el, pred, cap,
    h('div', { class: 'ctrls', role: 'group', 'aria-label': 'Animation controls' }, bReset, bPrev, bPlay, bNext, range, cnt, speed),
    h('div', { class: 'vfoot' }, legendFor(all), reduced() ? h('div', { class: 'rm-note', text: 'Motion is reduced: each step changes instantly. Use Next to step through.' }) : null, tx));
  host.append(fig);
  let k = -1, playing = false, predicted = !o.predict, timer = null, alive = true, ended = false;
  function setPlay() { bPlay.replaceChildren(icon(playing ? 'pause' : (k >= n - 1 ? 'reset' : 'play')), h('span', null, playing ? 'Pause' : (k >= n - 1 ? 'Replay' : (k <= 0 ? 'Play' : 'Resume')))); bPlay.setAttribute('aria-label', (playing ? 'Pause' : 'Play') + ' (Space)'); }
  function go(t, animate = true) {
    t = clamp(t, 0, n - 1);
    if (!predicted && t >= o.predict.at) { if (k !== o.predict.at - 1) go(o.predict.at - 1, false); ask(); return false; }
    const fwd = animate && t === k + 1; k = t;
    const st = stateAt(sc, k), step = sc.steps[k], ops = step.do || [];
    stage.clearPackets();
    const moveDur = stage.render(st, animate ? 420 : 0);
    const foc = ops.find(x => x[0] === 'focus'); stage.focus(foc ? foc.slice(1) : null);
    stage.setNotes(ops.filter(x => x[0] === 'note').map(x => [x[1], x[2]]), st);
    const lead = foc ? foc.slice(1) : (ops.find(x => x[0] === 'send') || ops.find(x => ['add', 'set', 'move', 'note'].includes(x[0])) || []).slice(1, 3).filter(x => typeof x === 'string');
    stage.follow(lead);
    if (fwd) (async () => { if (moveDur) await new Promise(r => setTimeout(r, Math.min(moveDur, 300))); for (const x of ops) if (x[0] === 'send' && alive && k === t) await stage.packet(x[1], x[2], x[3], x[4]); })();
    cap.replaceChildren(h('span', { class: 'cap-n', text: k + 1 }), h('span', { class: 'cap-t', html: rt(step.cap) }));
    range.value = k; cnt.textContent = (k + 1) + ' / ' + n; bPrev.disabled = k === 0; bNext.disabled = k === n - 1;
    if (k === n - 1 && !ended) { ended = true; o.onEnd && o.onEnd(); }
    if (k === n - 1 && playing) { playing = false; }
    setPlay(); return true;
  }
  const dwell = i => { const ops = sc.steps[i].do || []; const sends = ops.filter(x => x[0] === 'send').length; return D(420) + sends * D(800) + (1400 + 24 * plain(sc.steps[i].cap).length) / (S.set.speed || 1); };
  function play() { if (k >= n - 1) go(0, false); playing = true; setPlay(); advance(); }
  function advance() { clearTimeout(timer); if (!playing || !alive) return; if (k >= n - 1) { playing = false; setPlay(); return; } if (!go(k + 1)) { playing = false; setPlay(); return; } if (playing) timer = setTimeout(advance, dwell(k)); }
  function pause() { playing = false; clearTimeout(timer); setPlay(); }
  function ask() {
    pause(); const p = o.predict; pred.hidden = false;
    const order = shuffle(p.options.map((_, i) => i));
    pred.replaceChildren(h('div', { class: 'pk-k' }, icon('eye'), 'Predict before you watch'), h('p', { class: 'pq', html: rt(p.q) }),
      h('div', { class: 'popts' }, order.map((i, j) => h('button', { class: 'opt', type: 'button', 'data-i': i, onclick: () => pick(i) }, h('span', { class: 'k', text: j + 1 }), h('span', { html: rt(p.options[i]) })))));
    const f = pred.querySelector('button'); f && f.focus({ preventScroll: true });
    pred.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
  }
  function pick(i) {
    predicted = true; const ok = i === o.predict.answer;
    pred.replaceChildren(h('div', { class: 'pres ' + (ok ? 'ok' : 'bad') }, icon(ok ? 'check' : 'eye'), h('div', null, h('strong', { text: ok ? 'You predicted it. Watch it happen.' : 'Good guess, but not quite. Watch what really happens.' }), o.predict.why ? h('div', { html: rt(o.predict.why) }) : null)));
    if (ok) { addXP(5, o.lesson, pred); practiced(); }
    go(o.predict.at);
  }
  function key(e) {
    if (e.target.matches('input[type=range],select')) return false;
    const m = { ArrowRight: () => { pause(); go(k + 1); }, ArrowLeft: () => { pause(); go(k - 1); }, Home: () => { pause(); go(0); }, End: () => { pause(); go(n - 1, false); },
      '[': () => { speed.selectedIndex = Math.max(0, speed.selectedIndex - 1); speed.dispatchEvent(new Event('change')); toast('Speed ' + speed.value + '×'); },
      ']': () => { speed.selectedIndex = Math.min(3, speed.selectedIndex + 1); speed.dispatchEvent(new Event('change')); toast('Speed ' + speed.value + '×'); } };
    if (e.key === ' ' && !e.target.closest('button,a,summary')) { e.preventDefault(); playing ? pause() : play(); return true; }
    if (m[e.key]) { e.preventDefault(); m[e.key](); return true; }
    return false;
  }
  go(0, false); setPlay();
  return { go, play, pause, key, get k() { return k; }, n, stage, destroy() { alive = false; clearTimeout(timer); stage.destroy(); } };
}

/* ---------- Playground: terminal | controls | code, with goals ---------- */
function lev(a, b) { const m = [...Array(b.length + 1).keys()]; for (let i = 1; i <= a.length; i++) { let p = m[0]; m[0] = i; for (let j = 1; j <= b.length; j++) { const t = m[j]; m[j] = Math.min(m[j] + 1, m[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } } return m[b.length]; }
const clone = o => { try { return structuredClone(o); } catch (e) { return JSON.parse(JSON.stringify(o)); } };
function Playground(host, c, l, onAll) {
  const kind = c.kind || 'controls';
  const ctrlDefaults = () => Object.fromEntries((c.controls || []).filter(k => k.type !== 'button').map(k => [k.id, k.value != null ? k.value : k.type === 'toggle' ? false : k.type === 'select' ? k.options[0] : k.min]));
  const init = () => { const s = c.init ? c.init() : {}; if (kind === 'controls') s.v = ctrlDefaults(); if (kind === 'code') Object.assign(s, { code: c.starter || '', out: [], err: null, api: {} }); return s; };
  let s = init(); const hist = [], done = new Set(); let hintI = 0, q = [], nq = [];
  const io = { send: (a, b, label, tone) => q.push([a, b, label, tone]), note: (id, text) => nq.push([id, text]) };
  const [W, H] = c.size || [800, 380];
  const stage = c.view ? Stage(W, H, c.title || plain(c.h) || 'Live simulation') : null;
  const live = h('div', { class: 'sr', 'aria-live': 'polite' });
  function refresh(ms = 380) {
    if (stage) { let v; try { v = c.view(s); } catch (e) { console.warn('view() failed', e); v = {}; } const st = baseState(v.nodes, v.edges, v.vars); stage.clearPackets(); const md = stage.render(st, ms); stage.focus(v.focus || null); stage.setNotes(nq.concat(v.notes || []), st); nq = []; const pq = q; q = []; (async () => { if (md && pq.length) await new Promise(r => setTimeout(r, Math.min(md, 250))); for (const p of pq) await stage.packet(...p); })(); }
    if (c.readout && ro) { try { ro.replaceChildren(...c.readout(s).map(([k, v]) => h('div', null, k + ': ', h('b', { text: String(v) })))); } catch (e) {} }
    checkGoals();
  }
  const goalEls = c.goals.map((g, i) => h('li', { class: 'goal' }, h('span', { class: 'gck', 'aria-hidden': 'true' }, icon('check')), h('div', { class: 'gb' }, h('span', { html: rt(g.text) }), h('span', { class: 'sr gst', text: ' (not done yet)' })),
    h('button', { class: 'btn sm ghost', type: 'button', title: 'Watch it done for you', onclick: () => showMe(i) }, icon('eye'), h('span', { class: 'hide-s' }, 'Show me'))));
  function checkGoals() {
    c.goals.forEach((g, i) => { if (done.has(i)) return; let ok = false; try { ok = !!g.check(s); } catch (e) {} if (ok) { done.add(i); goalEls[i].classList.add('done'); goalEls[i].querySelector('.gst').textContent = ' (done)'; live.textContent = 'Goal done: ' + plain(g.text); } });
    if (done.size === c.goals.length) onAll();
  }
  const push = () => { hist.push(clone(s)); if (hist.length > 60) hist.shift(); bUndo.disabled = false; };
  const bUndo = h('button', { class: 'btn sm ghost', type: 'button', disabled: true, onclick: () => { if (!hist.length) return; s = hist.pop(); bUndo.disabled = !hist.length; syncCtrls(); refresh(); } }, icon('undo'), 'Undo');
  const bReset = h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { push(); s = init(); syncCtrls(); if (kind === 'code' && ed) ed.value = s.code; if (out) print('— simulation reset —', 'd'); refresh(); } }, icon('reset'), 'Reset');
  const hintBox = h('div'); const hints = c.hints || [];
  const bHint = hints.length ? h('button', { class: 'btn sm ghost', type: 'button', onclick: showHint }, icon('bulb'), h('span', null, 'Hint')) : null;
  function showHint() { if (hintI >= hints.length) return; hintBox.replaceChildren(h('div', { class: 'hintbox' }, h('b', { text: 'Hint ' + (hintI + 1) + ' of ' + hints.length + ': ' }), h('span', { html: rt(hints[hintI]) }))); hintI++; /* only the latest hint shows, so the diagram keeps its room */ if (hintI >= hints.length) { bHint.disabled = true; bHint.lastChild.textContent = 'No more hints. Try “Show me”.'; } }
  const side = h('div', { class: 'side' }, c.goals.length ? [h('h3', null, 'Your goals'), h('ol', { class: 'goals' }, goalEls)] : null, live);
  const main = h('div', { class: 'stage-col' });
  if (stage) main.append(stage.el);
  main.append(h('div', { class: 'ptools' }, bReset, bUndo, bHint, h('span', { class: 'sp' })));
  let out = null, inp = null, ed = null, ro = null; const ctrlSync = [];
  function print(text, cls) { if (!out) return; out.append(h('div', { class: cls || '' , text })); out.scrollTop = out.scrollHeight; }
  /* terminal */
  if (kind === 'terminal') {
    out = h('div', { class: 'term-o', role: 'log', 'aria-label': 'Terminal output' });
    inp = h('input', { 'aria-label': 'Type a command', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: 'type a command, or "help"' });
    const th = []; let hi = 0;
    const names = () => c.cmds.map(x => x.help).concat(['help', 'clear']);
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); run(inp.value); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) inp.value = th[--hi]; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(th.length, hi + 1); inp.value = th[hi] || ''; }
      else if (e.key === 'Tab' && inp.value.trim()) { const m = names().filter(x => x.startsWith(inp.value)); if (m.length) { e.preventDefault(); const lit = m.map(x => x.split(/\s*[<\[]/)[0]); let pre = lit[0]; for (const x of lit) while (!x.startsWith(pre)) pre = pre.slice(0, -1); if (m.length === 1) inp.value = lit[0] + (/[<\[]/.test(m[0]) ? ' ' : ''); else if (pre.length > inp.value.length) inp.value = pre; else print(m.join('   '), 'd'); } }
    });
    function run(raw) {
      const cmd = raw.trim(); inp.value = ''; print((c.prompt || '$') + ' ' + cmd, 'c'); if (!cmd) return;
      th.push(cmd); hi = th.length;
      if (cmd === 'help') return print('Commands you can try:\n' + c.cmds.map(x => '  ' + x.help + (x.desc ? '   ' + x.desc : '')).join('\n') + '\n  clear   clear the screen', 'd');
      if (cmd === 'clear') return out.replaceChildren();
      for (const x of c.cmds) {
        const m = cmd.match(x.re); if (!m) continue;
        push(); let r; try { r = x.run(m, s, io); } catch (err) { r = { err: 'Simulator error: ' + err.message }; }
        if (typeof r === 'string') print(r, 'o'); else if (r) { if (r.out) print(r.out, 'o'); if (r.err) print(r.err, 'e'); }
        refresh(); practiced(); return;
      }
      const best = names().map(n => [lev(cmd.split(' ').slice(0, 2).join(' '), n.split(' ').slice(0, 2).join(' ')), n]).sort((a, b) => a[0] - b[0])[0];
      print('That command isn\'t part of this simulation: ' + cmd + (best && best[0] <= 6 ? '\nDid you mean:  ' + best[1] : '') + '\nType "help" to see what you can run.', 'e');
    }
    var termEl = (h('div', { class: 'termw', onclick: e => { if (!getSelection().toString()) inp.focus(); } }, out, h('div', { class: 'term-i' }, h('span', { text: c.prompt || '$' }), inp)));
    if (c.try) main.append(h('div', { class: 'tryrow' }, 'Try:', c.try.map(t => h('button', { class: 'tryb', type: 'button', text: t, onclick: () => { inp.value = t; inp.focus(); } }))));
    print(c.welcome || 'Type a command and press Enter. Type "help" to list commands.', 'd');
    var perform = async act => { inp.focus({ preventScroll: true }); inp.value = ''; for (const ch of act) { inp.value += ch; if (D(28)) await new Promise(r => setTimeout(r, 28)); } run(inp.value); };
  }
  /* controls */
  if (kind === 'controls') {
    const box = h('div', { class: 'ctrls-p' });
    let rafP = 0, dragging = false;
    const upd = () => { if (rafP) return; rafP = requestAnimationFrame(() => { rafP = 0; try { c.update && c.update(s, io); } catch (e) { console.warn(e); } refresh(240); practiced(); }); };
    for (const k of c.controls) {
      const id = 'c-' + l.id + '-' + k.id;
      if (k.type === 'range') {
        const o_ = h('output', { for: id }); const r = h('input', { type: 'range', id, min: k.min, max: k.max, step: k.step || 1, value: s.v[k.id] });
        const sync = () => { r.value = s.v[k.id]; o_.textContent = s.v[k.id] + (k.unit ? ' ' + k.unit : ''); };
        r.addEventListener('input', () => { if (!dragging) { push(); dragging = true; } s.v[k.id] = +r.value; sync(); upd(); });
        r.addEventListener('change', () => { dragging = false; });
        ctrlSync.push(sync); sync();
        box.append(h('div', { class: 'ctl' }, h('label', { for: id }, h('span', { text: k.label }), o_), r, h('div', { class: 'mm' }, h('span', { text: k.min }), h('span', { text: k.max }))));
      } else if (k.type === 'toggle') {
        const b = h('button', { class: 'sw', type: 'button', role: 'switch', id }, h('span', { text: k.label }), h('i'));
        const sync = () => b.setAttribute('aria-checked', String(!!s.v[k.id]));
        b.addEventListener('click', () => { push(); s.v[k.id] = !s.v[k.id]; sync(); upd(); }); ctrlSync.push(sync); sync();
        box.append(h('div', { class: 'ctl' }, b));
      } else if (k.type === 'select') {
        const sel = h('select', { id }, k.options.map(x => h('option', { value: x, text: x })));
        const sync = () => { sel.value = s.v[k.id]; };
        sel.addEventListener('change', () => { push(); s.v[k.id] = sel.value; upd(); }); ctrlSync.push(sync); sync();
        box.append(h('div', { class: 'ctl' }, h('label', { for: id, text: k.label }), sel));
      }
    }
    const btns = c.controls.filter(k => k.type === 'button');
    if (btns.length) box.append(h('div', { class: 'btnrow' }, btns.map(k => h('button', { class: 'btn sm' + (k.tone === 'bad' ? ' danger' : ''), type: 'button', 'data-ctl': k.id, onclick: () => { push(); try { k.run(s, io); } catch (e) { console.warn(e); } refresh(); practiced(); } }, k.label))));
    if (c.presets) box.prepend(h('div', { class: 'tryrow' }, 'Presets:', c.presets.map(p => h('button', { class: 'tryb', type: 'button', text: p.label, onclick: () => { push(); Object.assign(s.v, p.v); syncCtrls(); upd(); } }))));
    if (c.readout) { ro = h('div', { class: 'out', 'aria-live': 'polite', 'aria-label': 'Live values' }); box.append(ro); }
    side.prepend(box);
    var perform = async act => {
      if (typeof act === 'string') { const b = box.querySelector('[data-ctl="' + act + '"]'); b && b.click(); if (D(300)) await new Promise(r => setTimeout(r, 450)); return; }
      for (const id in act) {
        const k = c.controls.find(x => x.id === id); if (!k) continue; push();
        if (k.type === 'range' && D(300)) { const a = +s.v[id], b = +act[id]; await tween(D(500), t => { s.v[id] = Math.round((a + (b - a) * t) / (k.step || 1)) * (k.step || 1); syncCtrls(); upd(); }, () => true); }
        s.v[id] = act[id]; syncCtrls(); upd(); await new Promise(r => setTimeout(r, 60));
      }
    };
  }
  /* code */
  if (kind === 'code') {
    evalReady(); // Academy: load the code runner before the first Run
    ed = h('textarea', { class: 'editor', spellcheck: 'false', 'aria-label': 'Code editor. Press Ctrl+Enter to run. Press Escape then Tab to leave.', autocapitalize: 'off' }); ed.value = s.code;
    let esc_ = false;
    ed.addEventListener('keydown', e => {
      if (e.key === 'Escape') { esc_ = true; return; }
      if (e.key === 'Tab' && !esc_ && !e.shiftKey) { e.preventDefault(); const a = ed.selectionStart; ed.setRangeText('  ', a, ed.selectionEnd, 'end'); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); runCode(); }
      if (e.key !== 'Tab') esc_ = false;
    });
    const outEl = h('pre', { class: 'out', 'aria-live': 'polite', text: 'Output appears here. Press Run (Ctrl+Enter).' });
    function runCode() {
      if (!EVAL) { evalReady().then(runCode); return; } // Academy: compiled by the runner page (see evalReady)
      push(); s.code = ed.value; const lines = [], fmt = v => typeof v === 'string' ? v : (() => { try { return JSON.stringify(v); } catch (e) { return String(v); } })();
      const con = { log: (...a) => lines.push(a.map(fmt).join(' ')), error: (...a) => lines.push(a.map(fmt).join(' ')), warn: (...a) => lines.push(a.map(fmt).join(' ')) };
      try {
        // ponytail: learner code runs on the main thread; an infinite loop freezes the tab. Move to a Worker if courses need untrusted long-running code.
        const fn = new EVAL('console', '"use strict";\n' + s.code + '\n;return {' + (c.expose || []).map(n => n + ': typeof ' + n + ' !== "undefined" ? ' + n + ' : undefined').join(',') + '}');
        s.api = fn(con) || {}; s.err = null;
      } catch (e) { s.err = e.name + ': ' + e.message; s.api = {}; }
      s.out = lines; outEl.className = 'out' + (s.err ? ' err' : ''); outEl.textContent = s.err ? s.err + (lines.length ? '\n' + lines.join('\n') : '') : (lines.join('\n') || '(ran with no output)');
      refresh(); practiced();
    }
    var codeEl = h('div', { class: 'codew' }, ed, h('div', { class: 'ptools' }, h('button', { class: 'btn sm pri', type: 'button', onclick: runCode }, icon('play'), 'Run'), h('span', { class: 'rm-note', text: (isMac ? '⌘' : 'Ctrl') + '+Enter runs' })), outEl);
    if (!c.view) main.append(codeEl);
    var perform = async act => { ed.value = ''; if (D(10)) { for (let i = 0; i < act.length; i += 6) { ed.value = act.slice(0, i + 6); await new Promise(r => setTimeout(r, 12)); } } ed.value = act; runCode(); };
  }
  function syncCtrls() { ctrlSync.forEach(f => f()); }
  let chain = Promise.resolve();
  function showMe(i) { // queued, so quick clicks on several "Show me" buttons play one after another
    return chain = chain.then(async () => { for (const act of c.goals[i].solve) { await perform(act); await new Promise(r => setTimeout(r, D(250) ? 350 : 0)); } }).catch(e => console.warn(e));
  }
  main.append(hintBox); // hints sit under the diagram so they never squeeze the terminal or editor
  if (kind === 'terminal') side.append(termEl); // terminal and editor sit beside the diagram, under the goals
  if (kind === 'code' && c.view) side.append(codeEl);
  host.append(h('div', { class: 'play k-' + kind + (stage || kind !== 'controls' ? '' : ' solo') }, main, side));
  refresh(0);
  return { destroy() { stage && stage.destroy(); }, showMe, get state() { return s; }, done };
}

/* ---------- Quiz: mcq | multi | order | fill | explain ---------- */
const PRAISE = ['Correct!', 'Nice!', 'Exactly right.', 'Spot on.', 'You got it.'];
function norm(v) { return String(v).trim().replace(/\s+/g, ' ').toLowerCase(); }
function Quiz(host, c, bar, o) {
  const kind = c.kind || 'mcq'; let tries = 0, solved = false, ready = () => false, correct = () => false, onWrong = () => {}, showRight = () => {}, lock = () => {};
  const body = h('div', { class: 'qbody' }); host.append(body);
  let keyFn = null;
  if (kind === 'mcq' || kind === 'multi') {
    const multi = kind === 'multi', sel = new Set(), order = c.fixed ? c.options.map((_, i) => i) : shuffle(c.options.map((_, i) => i));
    if (multi) body.append(h('p', { class: 'qsub', text: 'Select all that apply.' }));
    const btns = order.map((oi, j) => h('button', { class: 'opt', type: 'button', 'aria-pressed': 'false', 'data-i': oi, onclick: () => choose(oi) }, h('span', { class: 'k', text: j + 1 }), h('span', { html: rt(c.options[oi]) })));
    body.append(h('div', { class: 'opts', role: 'group', 'aria-label': 'Answer options' }, btns));
    function choose(oi) { if (solved) return; btns.forEach(b => b.classList.remove('wrong')); if (multi) sel.has(oi) ? sel.delete(oi) : sel.add(oi); else { sel.clear(); sel.add(oi); } btns.forEach(b => b.setAttribute('aria-pressed', String(sel.has(+b.dataset.i)))); refreshBtn(); }
    ready = () => sel.size > 0;
    const ans = new Set([].concat(c.answer));
    correct = () => sel.size === ans.size && [...sel].every(x => ans.has(x));
    onWrong = () => { btns.forEach(b => { if (sel.has(+b.dataset.i) && !ans.has(+b.dataset.i)) b.classList.add('wrong'); }); const w = [...sel].map(i => c.whyNot && c.whyNot[i]).filter(Boolean); return w.join(' '); };
    showRight = () => btns.forEach(b => { if (ans.has(+b.dataset.i)) b.classList.add('right'); });
    lock = () => btns.forEach(b => { b.disabled = true; });
    keyFn = e => { const d = +e.key; if (d >= 1 && d <= btns.length) { btns[d - 1].click(); return true; } return false; };
  } else if (kind === 'order') {
    let pool = shuffle(c.items.map((_, i) => i)); if (pool.every((x, i) => x === i)) pool.reverse();
    const picked = [], ans = h('div', { class: 'ans', role: 'list', 'aria-label': 'Your order' }), poolEl = h('div', { class: 'pool', role: 'list', 'aria-label': 'Pieces to place' });
    body.append(h('div', { class: 'ordz' }, h('div', { class: 'lab', text: 'Your order (tap a piece to remove it)' }), ans, h('div', { class: 'lab', text: 'Tap the pieces in the right order' }), poolEl));
    function draw() {
      ans.replaceChildren(...picked.map((i, j) => h('button', { class: 'tok', type: 'button', role: 'listitem', 'data-i': i, onclick: () => { if (solved) return; picked.splice(j, 1); pool.push(i); draw(); } }, h('b', { text: j + 1 }), h('span', { html: rt(c.items[i]) }))));
      poolEl.replaceChildren(...pool.map((i, j) => h('button', { class: 'tok', type: 'button', role: 'listitem', 'data-i': i, onclick: () => { if (solved) return; pool.splice(j, 1); picked.push(i); ans.classList.remove('wrong'); draw(); } }, h('span', { html: rt(c.items[i]) }))));
      refreshBtn();
    }
    ready = () => picked.length === c.items.length; correct = () => picked.every((x, i) => x === i);
    onWrong = () => { ans.classList.add('wrong'); const firstBad = picked.findIndex((x, i) => x !== i); return 'Position ' + (firstBad + 1) + ' is the first one out of place.'; };
    showRight = () => { picked.splice(0, picked.length, ...c.items.map((_, i) => i)); pool = []; draw(); ans.classList.add('right'); };
    lock = () => $$('button', body).forEach(b => b.disabled = true);
    setTimeout(draw);
  } else if (kind === 'fill') {
    const inp = h('input', { 'aria-label': 'Your answer', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: c.placeholder || 'type your answer' });
    const wrap = h('label', { class: 'fill' }, c.pre ? h('span', { text: c.pre }) : null, inp, c.post ? h('span', { text: c.post }) : null);
    body.append(wrap); inp.addEventListener('input', () => { wrap.classList.remove('wrong'); refreshBtn(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter' && ready()) { e.preventDefault(); bar.pri.click(); } });
    const acc = [].concat(c.answer);
    ready = () => !!inp.value.trim(); correct = () => acc.some(a => a instanceof RegExp ? a.test(inp.value.trim()) : (c.exact ? inp.value.trim() === a : norm(inp.value) === norm(a)));
    onWrong = () => { wrap.classList.add('wrong'); return ''; }; showRight = () => { const a = acc.find(x => typeof x === 'string'); if (a) inp.value = a; wrap.classList.add('right'); }; lock = () => { inp.readOnly = true; };
    setTimeout(() => o.autofocus !== false && inp.focus({ preventScroll: true }));
  } else if (kind === 'explain') {
    const ta = h('textarea', { class: 'expl', 'aria-label': 'Explain in your own words', placeholder: 'Write a sentence or two in your own words…' });
    body.append(ta); ta.addEventListener('input', refreshBtn);
    ready = () => ta.value.trim().length >= 8; correct = () => true; lock = () => { ta.readOnly = true; };
    showRight = () => body.append(h('div', { class: 'model' }, h('b', null, 'One good answer: '), h('span', { html: rt(c.model) })));
  }
  if (c.code) body.prepend(codeBlock(c.code));
  const bShow = h('button', { class: 'btn sm ghost', type: 'button', hidden: true, onclick: reveal }, icon('eye'), 'Show answer');
  bar.extra.replaceChildren(bShow);
  function refreshBtn() { if (solved) return; if (!ready() && o.skippable) bar.set('Continue', o.next); else bar.set(kind === 'explain' ? 'Compare' : 'Check', check, { disabled: !ready(), icon: 'check' }); }
  function check() {
    if (!ready() || solved) return; tries++;
    if (correct()) {
      solved = true; lock(); showRight();
      if (kind === 'explain') bar.msg('ok', 'Compare with your answer', 'Did you cover the same idea? Explaining it in your own words helps it stick.');
      else bar.msg('ok', PRAISE[Math.floor(Math.random() * PRAISE.length)], rt(c.why || ''));
      bShow.hidden = true; o.solved({ first: tries === 1, revealed: false });
    } else {
      const extra = onWrong(), hint = c.hints && c.hints[Math.min(tries - 1, c.hints.length - 1)];
      anim(body, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: reduced() ? 0 : 320 });
      bar.msg('bad', tries > 1 ? 'Still not quite.' : 'Not quite.', [extra ? rt(extra) : '', hint ? '<b>Hint:</b> ' + rt(hint) : 'Change your answer and check again.'].filter(Boolean).join(' '));
      if (tries >= 2) bShow.hidden = false;
      refreshBtn();
    }
  }
  function reveal() { if (solved) return; solved = true; lock(); showRight(); bShow.hidden = true; bar.msg('info', 'Here is the answer', rt(c.why || '')); o.solved({ first: false, revealed: true }); }
  refreshBtn();
  return { key: e => { if (e.key === 'h' && c.hints && !solved) { bar.msg('info', 'Hint', rt(c.hints[Math.min(tries, c.hints.length - 1)])); return true; } return keyFn ? keyFn(e) : false; }, check, reveal };
}
function codeBlock(code, lang) {
  const b = h('button', { class: 'cp', type: 'button', 'aria-label': 'Copy code' }, icon('copy'), 'Copy');
  b.onclick = () => { try { navigator.clipboard.writeText(code).then(() => toast('Copied'), () => toast('Copy not available here')); } catch (e) { toast('Copy not available here'); } };
  return h('div', { class: 'codeb' }, h('pre', { 'aria-label': (lang || 'Code') + ' example' }, h('code', { style: { background: 'none', border: 0, padding: 0, color: 'inherit' }, text: code })), b);
}

/* ---------- bottom action bar ---------- */
function makeBar(onBack) {
  const fb = h('div', { class: 'fb', role: 'status', 'aria-live': 'polite' });
  const pri = h('button', { class: 'btn pri', id: 'primary', type: 'button' });
  const extra = h('div', { class: 'bx' });
  const back = h('button', { class: 'btn ghost', type: 'button', onclick: onBack }, icon('prev'), h('span', { class: 'lbl' }, 'Back'));
  const el = h('div', { class: 'bar' }, h('div', { class: 'bar-in' }, back, fb, extra, pri));
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => { if (el.isConnected && el.offsetHeight) HOST.style.setProperty('--barh', el.offsetHeight + 'px'); }).observe(el);
  let fn = null; pri.addEventListener('click', () => { if (fn && !pri.disabled) fn(); });
  return {
    el, fb, extra, pri, back,
    set(label, f, opt) { opt = opt || {}; pri.replaceChildren(h('span', null, label), icon(opt.icon || 'arrow')); pri.disabled = !!opt.disabled; fn = f; },
    msg(kind, title, html) { el.className = 'bar' + (kind ? ' ' + kind : ''); fb.replaceChildren(); fb.classList.remove('anim'); void fb.offsetWidth; fb.classList.add('anim'); if (title || html) fb.append(kind ? icon(kind === 'ok' ? 'check' : kind === 'bad' ? 'x' : 'bulb', 'fbi') : '', h('div', null, title ? h('div', { class: 'fb-t', text: title }) : null, html ? h('div', { class: 'fb-d', html }) : null)); }
  };
}

/* ---------- card renderers ---------- */
const TYPE = { read: ['book', 'Concept'], viz: ['film', 'Watch it work'], quiz: ['quiz', 'Check yourself'], play: ['sliders', 'Try it yourself'], recap: ['check', 'Recap'], check: ['target', 'Make it real'] };
const kick = (t, txt) => h('div', { class: 'kicker' }, icon(TYPE[t][0]), txt || TYPE[t][1]);
const cardLabel = c => plain(c.h || c.q || TYPE[c.t][1]);
const CARD = {
  read(host, c, l, ci, bar, next) {
    host.append(kick('read', c.kicker), h('h2', { id: 'card-h', html: rt(c.h) }), h('div', { class: 'prose', html: paras(c.body) }));
    if (c.analogy) host.append(h('div', { class: 'analogy' }, icon('bulb'), h('div', null, h('b', null, 'Think of it like this'), h('div', { html: rt(c.analogy) }))));
    if (c.points) host.append(h('ul', { class: 'pts' }, c.points.map(p => h('li', { html: rt(p) }))));
    if (c.code) host.append(codeBlock(c.code, c.lang));
    bar.set('Continue', next);
  },
  viz(host, c, l, ci, bar, next) {
    host.append(kick('viz', c.kicker), h('h2', { id: 'card-h', html: rt(c.h) }));
    if (c.body) host.append(h('div', { class: 'prose', html: paras(c.body) }));
    const was = cardDone(l, ci);
    bar.set('Continue', next, { disabled: !was });
    if (!was) bar.msg('info', '', 'Step through to the end to continue. Press <kbd>→</kbd> or <b>Play</b>.');
    const p = Player(host, c, { predict: c.predict, lesson: l, onEnd: () => { bar.set('Continue', next); bar.msg('', '', ''); } });
    activePlayer = p; return () => { p.destroy(); activePlayer = null; };
  },
  quiz(host, c, l, ci, bar, next) {
    host.append(kick('quiz', c.kicker), h('h2', { id: 'card-h', class: 'q', html: rt(c.q) }));
    const qid = l.id + '#' + ci, was = cardDone(l, ci);
    const q = Quiz(host, c, bar, { next, skippable: was, solved: r => {
      if (!was && c.kind !== 'explain') { schedule(qid, r.first); S.stats.q++; if (r.first) S.stats.first++; if (!r.revealed) addXP(r.first ? 10 : 5, l, bar.pri); }
      practiced(); save(); bar.set('Continue', next);
    } });
    activeQuiz = q; return () => { activeQuiz = null; };
  },
  play(host, c, l, ci, bar, next) {
    host.append(kick('play', c.kicker), h('h2', { id: 'card-h', html: rt(c.h) }));
    if (c.body) host.append(h('div', { class: 'prose', html: paras(c.body) }));
    const was = cardDone(l, ci); let fired = false;
    bar.set('Continue', next, { disabled: !was });
    if (!was) bar.msg('info', '', 'Complete the ' + c.goals.length + ' goal' + (c.goals.length > 1 ? 's' : '') + ' to continue. Stuck? Use <b>Hint</b> or <b>Show me</b>.');
    const p = Playground(host, c, l, () => { if (fired) return; fired = true; bar.set('Continue', next); bar.msg('ok', 'All goals done!', rt(c.done || 'Keep experimenting if you like, or continue.')); if (!was) addXP(5, l, bar.pri); });
    activePlay = p; return () => { p.destroy(); activePlay = null; };
  },
  check(host, c, l, ci, bar, next) {
    host.append(kick('check', c.kicker), h('h2', { id: 'card-h', html: rt(c.h) }));
    if (c.body) host.append(h('div', { class: 'prose', html: paras(c.body) }));
    if (c.code) host.append(codeBlock(c.code, c.lang));
    const P = lp(l); P.chk = P.chk || {}; const st = P.chk[ci] = (P.chk[ci] || []).slice(0, c.items.length);
    while (st.length < c.items.length) st.push(false);
    const upd = () => {
      const n = st.filter(Boolean).length, all = n === st.length;
      bar.set('Continue', next, { disabled: !all && !cardDone(l, ci) });
      if (all) bar.msg('ok', 'Step verified', 'It works on your machine. That is the real win.');
      else bar.msg('info', '', n + ' of ' + st.length + ' done. Tick each item once it really works on your machine.');
    };
    host.append(h('ul', { class: 'chk', 'aria-label': 'Definition of done' }, c.items.map((it, i) => h('li', null,
      h('button', { class: 'chk-i', type: 'button', role: 'checkbox', 'aria-checked': String(!!st[i]), onclick: e => { st[i] = !st[i]; e.currentTarget.setAttribute('aria-checked', String(st[i])); save(); upd(); } },
        h('span', { class: 'cbx', 'aria-hidden': 'true' }, icon('check')), h('span', { html: rt(it) }))))));
    upd();
  },
  recap(host, c, l, ci, bar, next) {
    host.append(kick('recap', c.kicker), h('h2', { id: 'card-h', html: rt(c.h || 'What you learned') }), h('ul', { class: 'recap' }, c.points.map((p, i) => h('li', { style: { animationDelay: (i * 70) + 'ms' } }, icon('check'), h('span', { html: rt(p) })))));
    if (c.cheat) host.append(h('h3', { text: 'Cheat sheet' }), cheatTable(c.cheat));
    bar.set(ci === l.cards.length - 1 ? 'Finish lesson' : 'Continue', next, { icon: 'check' });
  }
};
const cheatTable = rows => h('table', { class: 'cheat' }, h('tbody', null, rows.map(r => h('tr', null, h('td', { text: r[0] }), h('td', { html: rt(r[1]) })))));

/* ---------- project modules: an app architecture that grows step by step ---------- */
const projSteps = m => m.project ? m.lessons.filter(x => m.project.steps[x.id]) : [];
function projState(m, k, ghost) { // state after the first k steps; ghost = draw step k+1's additions dashed
  const P = m.project, st = baseState(P.nodes, P.edges, P.vars), ids = projSteps(m).map(x => x.id);
  ids.slice(0, k).forEach(id => (P.steps[id].do || []).forEach(op => applyOp(st, op)));
  if (ghost && ids[k]) {
    const before = { nodes: new Set(Object.keys(st.nodes)), edges: new Set(Object.keys(st.edges)) };
    (P.steps[ids[k]].do || []).forEach(op => { if (op[0] !== 'var') applyOp(st, op); });
    for (const id in st.nodes) if (!before.nodes.has(id)) st.nodes[id] = Object.assign({}, st.nodes[id], { state: 'off' });
    for (const e in st.edges) if (!before.edges.has(e)) st.edges[e] = Object.assign({}, st.edges[e], { dash: true });
  }
  return st;
}
function projMini(l) {
  const m = l.mod, mi = C.modules.indexOf(m), steps = projSteps(m), k = steps.indexOf(l), P = m.project, [W, H] = P.size || [800, 360];
  const stage = Stage(W, H, P.name + ': your app before step ' + (k + 1), { h: 220 });
  const box = h('div', { class: 'projbox' }, h('div', { class: 'pj-h' }, icon('target'), h('div', null, h('b', { text: P.name + ' · step ' + (k + 1) + ' of ' + steps.length }), h('span', { text: k ? 'Your app so far. The dashed parts are what you add in this step.' : 'The dashed parts are what you build in this first step.' })), h('a', { class: 'btn sm ghost', href: '#/project/' + mi }, 'Project board')), stage.el);
  stage.render(projState(m, k, true), 0);
  return { el: box, destroy: stage.destroy };
}
function viewProject(mi) {
  const m = C.modules[mi], P = m && m.project; if (!P) { goHash('#/'); return; }
  const steps = projSteps(m), built = steps.filter(isDone).length, [W, H] = P.size || [800, 360];
  const stage = Stage(W, H, P.name + ' architecture');
  const cap = h('div', { class: 'pj-cap', 'aria-live': 'polite' });
  let sel = built;
  const chips = [h('button', { class: 'pj-step', type: 'button', 'data-k': 0 }, h('span', { class: 'dot', 'aria-hidden': 'true', text: '0' }), h('span', null, 'Empty project', h('small', { text: 'where you start' })))]
    .concat(steps.map((x, i) => h('button', { class: 'pj-step' + (isDone(x) ? ' done' : '') + (i === built ? ' next' : ''), type: 'button', 'data-k': i + 1 },
      h('span', { class: 'dot', 'aria-hidden': 'true' }, isDone(x) ? icon('check') : String(i + 1)), h('span', null, x.title, h('small', { text: isDone(x) ? 'built' : i === built ? 'up next' : 'not built yet' })))));
  function show(k, animate) {
    sel = k; chips.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.k === k)));
    stage.render(projState(m, k), animate ? 520 : 0);
    const x = steps[k - 1];
    cap.replaceChildren(...[h('b', { text: k ? 'After step ' + k + ': ' + x.title : 'Before step 1' }), h('span', { html: ' ' + rt(k ? (P.steps[x.id].cap || '') : (P.start || 'An empty repo and a plan.')) }), k > built ? h('em', { text: ' (preview: you have not built this yet)' }) : null].filter(Boolean)); // replaceChildren(null) would print "null"
  }
  chips.forEach(b => b.addEventListener('click', () => show(+b.dataset.k, true)));
  const nx = steps.find(x => !isDone(x));
  $('#main').append(h('div', { class: 'wrap view-in pj' },
    h('div', { class: 'ph' }, h('h1', { text: P.name }), h('p', { html: rt(P.desc || '') })),
    h('div', { class: 'pj-sum' }, progBar(Math.round(built / steps.length * 100), 'Project progress'), h('span', { text: built + ' of ' + steps.length + ' steps built' }),
      nx ? h('a', { class: 'btn pri sm', href: '#/l/' + nx.id + '/0' }, h('span', { text: 'Build step ' + (steps.indexOf(nx) + 1) + ': ' + nx.title }), icon('arrow')) : h('span', { class: 'tag ok', text: 'Project complete' })),
    h('div', { class: 'pj-grid' }, h('div', { class: 'pj-main' }, stage.el, cap), h('ol', { class: 'pj-steps', 'aria-label': 'Build steps' }, chips.map(c => h('li', null, c))))));
  show(sel, false);
  return () => stage.destroy();
}
/* ---------- views ---------- */
let lastLoc = null, cleanup = null;
function viewLesson(l, ci) {
  const card = l.cards[ci], P = lp(l);
  S.pos = { l: l.id, c: ci }; save();
  const dir = lastLoc && lastLoc.l === l.id && lastLoc.c > ci ? ' back' : ''; lastLoc = { l: l.id, c: ci };
  const go = i => goHash('#/l/' + l.id + '/' + i);
  const next = () => { if (!P.c.includes(ci)) P.c.push(ci); save(); if (ci < l.cards.length - 1) go(ci + 1); else { P.done = P.done || Date.now(); practiced(); save(); DONE(l.id); goHash('#/done/' + l.id); } };
  const bar = makeBar(() => ci > 0 ? go(ci - 1) : goHash('#/'));
  const segs = h('div', { class: 'segs', role: 'progressbar', 'aria-label': 'Lesson progress', 'aria-valuemin': 0, 'aria-valuemax': l.cards.length, 'aria-valuenow': P.c.length }, l.cards.map((c, i) => h('span', { class: 'seg' + (P.c.includes(i) ? ' done' : '') + (i === ci ? ' cur' : '') })));
  const host = h('section', { class: 'card t-' + card.t + dir, 'aria-labelledby': 'card-h' });
  if (ci === 0) host.append(h('div', { class: 'goalbox' }, icon('target'), h('div', null, h('b', { text: 'By the end of this lesson (about ' + (l.mins || 5) + ' min) you can:' }), h('span', { html: rt(l.goal) }), l.needs ? h('div', { class: 'rm-note', html: 'Helps to know first: ' + [].concat(l.needs).map(n => byId[n] ? '<a href="#/l/' + n + '/0">' + esc(byId[n].title) + '</a>' : esc(n)).join(', ') }) : null)));
  const pm = ci === 0 && projSteps(l.mod).includes(l) ? projMini(l) : null; if (pm) host.append(pm.el);
  bar.msg('', '', '');
  const un = CARD[card.t](host, card, l, ci, bar, next);
  $('#main').append(h('div', { class: 'lesson' }, h('div', { class: 'lmain' },
    h('div', { class: 'lhead' }, h('a', { class: 'btn sm ghost lexit', href: '#/', 'aria-label': 'Leave lesson, back to ' + (C.short || C.title), title: 'Back to the course' }, icon('prev'), h('span', { class: 'hide-s', text: 'Course' })),
      h('div', { class: 'lht' }, h('div', { class: 'crumb-m', text: 'Module ' + (l.mi + 1) + ' · ' + l.mod.title + ' · Lesson ' + (l.i + 1) + ' of ' + L.length }), h('h1', { text: l.title })),
      h('span', { class: 'crumb', text: (ci + 1) + ' of ' + l.cards.length }),
      h('button', { class: 'btn sm ghost', type: 'button', id: 'contents-btn', 'aria-label': 'Contents (C)', title: 'Contents (C)', onclick: openContents }, icon('sheet'), h('span', { class: 'hide-s' }, 'Contents'))),
    segs, host)), bar.el);
  return () => { if (un) un(); if (pm) pm.destroy(); };
}
const noTerms = t => String(t || '').replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, a, b) => b || a); // no term buttons inside links or summaries
// Brand mark: an SVG icon (COURSE.icon = 24x24 stroke path data) or 1-2 letters (COURSE.logo).
function logoMark(d) { // d: path data; defaults to the course icon
  d = d || C.icon;
  if (!d) return doc.createTextNode(C.logo || C.title[0]);
  const sv = doc.createElementNS(NS, 'svg'); sv.setAttribute('viewBox', '0 0 24 24'); sv.setAttribute('class', 'lm'); sv.setAttribute('aria-hidden', 'true');
  const pa = doc.createElementNS(NS, 'path'); pa.setAttribute('d', d); sv.append(pa); return sv;
}
const cap1 = t => t.charAt(0).toUpperCase() + t.slice(1);
function fmtMins(m) { if (m <= 0) return 'Done'; const hh = Math.floor(m / 60), mm = m % 60; return hh ? hh + ' h' + (mm ? ' ' + mm + ' min' : '') : mm + ' min'; }
const minsOf = ls => ls.reduce((a, l) => a + (l.mins || 5), 0);
const accuracy = () => S.stats && S.stats.q ? Math.round(S.stats.first / S.stats.q * 100) : null;
const progBar = (pct, label) => h('div', { class: 'pbar', role: 'progressbar', 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct }, h('i', { style: { width: pct + '%' } }));
function openContents() {
  if ($('dialog.drawer[open]')) return;
  $$('dialog.drawer').forEach(x => x.remove()); // a just-closed drawer may still be in the DOM
  const cur = S.pos && byId[S.pos.l], doneN = L.filter(isDone).length, inL = cur && HASH.startsWith('#/l/');
  const d = dialog('Contents', h('div', { class: 'drw' },
    inL ? h('section', { class: 'drw-this' }, h('h3', { text: 'This lesson' }), h('ol', null, cur.cards.map((c, i) => h('li', null, h('a', { href: '#/l/' + cur.id + '/' + i, class: 'drs' + (i === S.pos.c ? ' cur' : '') + (lp(cur).c.includes(i) ? ' done' : ''), 'aria-current': i === S.pos.c ? 'step' : null }, icon(lp(cur).c.includes(i) ? 'check' : TYPE[c.t][0]), h('span', { text: cardLabel(c) })))))) : null,
    h('div', { class: 'drw-p' }, progBar(Math.round(doneN / L.length * 100), 'Course progress'), h('span', { text: doneN + ' / ' + L.length + ' done' })),
    C.modules.map((m, mi) => h('section', null, h('h3', { text: 'Module ' + (mi + 1) + ' · ' + m.title }), h('ol', null, m.lessons.map(x => h('li', null,
      h('a', { href: '#/l/' + x.id + '/' + (cur === x ? S.pos.c : 0), class: 'drl' + (isDone(x) ? ' done' : '') + (cur === x ? ' cur' : ''), 'aria-current': cur === x ? 'page' : null },
        h('span', { class: 'dot', 'aria-hidden': 'true' }, isDone(x) ? icon('check') : String(x.i + 1)),
        h('span', null, x.title, h('small', { text: (x.mins || 5) + ' min' + (isDone(x) ? ' · done' : cur === x ? ' · you are here' : '') }))))))))), 'drawer');
  d.addEventListener('click', e => { if (e.target.closest('a[href]')) d.close(); }); // close on jump, even if the hash does not change
  setTimeout(() => { const c = $('.drs.cur', d) || $('.drl.cur', d); if (c) { if (!c.classList.contains('drs')) c.scrollIntoView({ block: 'center' }); c.focus({ preventScroll: true }); } }, 30); // in a lesson, its steps sit at the top
}
function viewCert() {
  const w = h('div', { class: 'wrap view-in' }); $('#main').append(w);
  if (!L.every(isDone)) {
    const rest = L.filter(l => !isDone(l)), n = L.length - rest.length;
    w.append(h('div', { class: 'ph' }, h('h1', { text: 'Certificate' }), h('p', { text: 'Finish every lesson to unlock your certificate of completion.' })),
      h('div', { class: 'cert-lock' }, h('div', { class: 'drw-p' }, progBar(Math.round(n / L.length * 100), 'Course progress'), h('span', { text: n + ' / ' + L.length + ' done' })),
        h('p', { text: 'Still to go (' + fmtMins(minsOf(rest)) + '):' }), h('ul', null, rest.map(l => h('li', null, h('a', { href: '#/l/' + l.id + '/0', text: l.title }), ' · ' + (l.mins || 5) + ' min')))));
    return;
  }
  const last = Math.max(...L.map(l => S.les[l.id].done || 0)), acc = accuracy();
  const date = new Date(last || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const nameEl = h('div', { class: 'cert-name', text: S.name || 'Your name' });
  const inp = h('input', { id: 'cert-name', autocomplete: 'name', placeholder: 'Type your name', maxlength: 60, value: S.name || '' });
  inp.addEventListener('input', () => { S.name = inp.value.slice(0, 60); save(); nameEl.textContent = S.name || 'Your name'; });
  w.append(h('div', { class: 'ph noprint' }, h('h1', { text: 'Your certificate' }), h('p', { text: 'Add your name, then print it or save it as a PDF.' })),
    h('div', { class: 'cert-ctl noprint' }, h('label', { class: 'field', for: 'cert-name' }, h('span', { class: 'sr', text: 'Name on certificate' }), icon('star'), inp), h('button', { class: 'btn pri', type: 'button', onclick: () => print() }, icon('print'), 'Print or save as PDF')),
    h('article', { class: 'cert', 'aria-label': 'Certificate of completion' }, h('div', { class: 'cert-in' },
      h('div', { class: 'cert-logo', 'aria-hidden': 'true' }, logoMark()), h('p', { class: 'cert-k', text: 'Certificate of completion' }),
      h('p', { class: 'cert-s', text: 'This certifies that' }), nameEl, h('p', { class: 'cert-s', text: 'has completed all ' + L.length + ' lessons of' }),
      h('h2', { class: 'cert-t', text: C.title }), C.subtitle ? h('p', { class: 'cert-s', text: C.subtitle }) : null, h('p', { class: 'cert-m', text: fmtMins(totalMins) + ' of guided lessons, simulations and practice · ' + date }),
      h('div', { class: 'cert-f' }, h('span', null, h('b', { text: acc == null ? '–' : acc + '%' }), ' first-try accuracy'), h('span', null, h('b', { text: String(S.xp) }), ' XP'), h('span', null, h('b', { text: String(S.days.length) }), S.days.length === 1 ? ' day of practice' : ' days of practice')))));
}
function viewDone(l) {
  const nx = L[l.i + 1], recap = l.cards.find(c => c.t === 'recap'), due = dueList().length, all = L.every(isDone);
  let pd = null; const pk = projSteps(l.mod).indexOf(l);
  if (pk >= 0) {
    const m = l.mod, P = m.project, [W, H] = P.size || [800, 360], stg = Stage(W, H, P.name + ' after step ' + (pk + 1), { h: 260 });
    pd = { el: h('section', { class: 'projdone', 'aria-label': 'Your app now' }, h('div', { class: 'pj-h' }, icon('target'), h('div', null, h('b', { text: P.name + ': step ' + (pk + 1) + ' of ' + projSteps(m).length + ' built' }), h('span', { html: rt(P.steps[l.id].cap || '') })), h('a', { class: 'btn sm ghost', href: '#/project/' + C.modules.indexOf(m) }, 'Project board')), stg.el), stg };
    stg.render(projState(m, pk), 0); setTimeout(() => stg.render(projState(m, pk + 1), 620), 450);
  }
  const conf = h('div', { class: 'confetti', 'aria-hidden': 'true' });
  const cols = ['var(--accent)', 'var(--ok)', 'var(--k-d)', 'var(--k-e)', 'var(--k-a)'];
  for (let i = 0; i < 24; i++) { const p = h('i', { style: { background: cols[i % 5], animationDelay: (i * 12) + 'ms' } }); p.style.setProperty('--x', (Math.random() * 640 - 320).toFixed(0) + 'px'); p.style.setProperty('--y', (Math.random() * 420 - 160).toFixed(0) + 'px'); p.style.setProperty('--r', (Math.random() * 720 - 360).toFixed(0) + 'deg'); conf.append(p); }
  setTimeout(() => conf.remove(), 1600);
  $('#main').append(conf, h('div', { class: 'donev view-in' },
    h('svg:svg', { class: 'bigck', viewBox: '0 0 104 104', 'aria-hidden': 'true' }, h('svg:circle', { cx: 52, cy: 52, r: 50 }), h('svg:path', { d: 'M30 54l15 15 29-31' })),
    h('h1', { text: all ? 'Course complete!' : 'Lesson complete!' }), h('p', { class: 'tg', text: l.title }),
    h('div', { class: 'stats' }, h('div', { class: 'stat' }, h('b', { text: l.cards.length }), h('span', null, 'steps finished')), h('div', { class: 'stat' }, h('b', { text: '+' + (lp(l).xp || 0) }), h('span', null, 'XP earned')), h('div', { class: 'stat' }, h('b', { text: streak() }), h('span', null, 'day streak'))),
    pd ? pd.el : null,
    recap ? h('ul', { class: 'recap' }, recap.points.map(p => h('li', null, icon('check'), h('span', { html: rt(p) })))) : null,
    h('div', { class: 'acts', style: { justifyContent: 'center' } },
      nx ? h('a', { class: 'btn pri', href: '#/l/' + nx.id + '/0', id: 'next-lesson' }, h('span', { text: 'Next: ' + nx.title }), icon('arrow')) : h('a', { class: 'btn pri', href: '#/certificate' }, icon('star'), 'Get your certificate'),
      due ? h('a', { class: 'btn', href: '#/review' }, icon('review'), 'Review ' + due + ' question' + (due > 1 ? 's' : '')) : null,
      h('a', { class: 'btn ghost', href: '#/' }, icon('map'), 'Back to path'))));
  setTimeout(() => { const b = $('#next-lesson') || $('.donev .btn.pri'); b && b.focus({ preventScroll: true }); }, 60);
  return () => { if (pd) pd.stg.destroy(); };
}
function viewReview() {
  const due = dueList(), w = h('div', { class: 'wrap view-in' }); $('#main').append(w);
  const seen = Object.keys(S.rev).filter(q => QZ[q]);
  const start = list => {
    let i = 0, right = 0; const queue = shuffle(list).slice(0, 12);
    const bar = makeBar(() => goHash('#/')); bar.back.lastChild.textContent = 'Exit';
    $('#main').append(bar.el);
    const one = () => {
      w.replaceChildren(); if (i >= queue.length) { bar.el.remove(); w.append(h('div', { class: 'empty' }, icon('check'), h('h1', { text: 'Review done' }), h('p', { text: right + ' of ' + queue.length + ' right on the first try. Items you missed will come back sooner.' }), h('a', { class: 'btn pri', href: '#/' }, 'Back to path'))); updateHeader('review'); return; }
      const { l, c } = QZ[queue[i]];
      w.append(h('div', { class: 'ph' }, h('h1', { text: 'Review' }), h('p', { text: 'Question ' + (i + 1) + ' of ' + queue.length + ' · from “' + l.title + '”' })));
      const host = h('section', { class: 'card', 'aria-labelledby': 'card-h' }, kick('quiz', 'Recall'), h('h2', { id: 'card-h', class: 'q', html: rt(c.q) })); w.append(host);
      bar.msg('', '', '');
      activeQuiz = Quiz(host, c, bar, { next: () => { i++; one(); }, solved: r => { schedule(queue[i], r.first); if (r.first) { right++; addXP(5, null, bar.pri); } practiced(); save(); bar.set(i < queue.length - 1 ? 'Next question' : 'Finish review', () => { i++; one(); }); } });
    };
    one();
  };
  if (due.length) { w.append(h('div', { class: 'ph' }, h('h1', { text: 'Review' }))); start(due); return () => { activeQuiz = null; }; }
  const nextDue = Object.values(S.rev).map(r => r.due).sort((a, b) => a - b)[0];
  w.append(h('div', { class: 'empty' }, icon('check'), h('h1', { text: seen.length ? 'All caught up' : 'Nothing to review yet' }),
    h('p', { text: seen.length ? 'Questions come back here right before you would forget them. Next review ' + (nextDue - today() <= 1 ? 'tomorrow' : 'in ' + (nextDue - today()) + ' days') + '.' : 'Questions you answer in lessons come back here for spaced review, so they stick.' }),
    h('div', { class: 'acts', style: { justifyContent: 'center' } }, seen.length ? h('button', { class: 'btn pri', type: 'button', onclick: () => { w.replaceChildren(); start(seen.slice(0, 50)); } }, icon('review'), 'Practice anyway') : h('a', { class: 'btn pri', href: (nextLesson() ? '#/l/' + nextLesson().id + '/0' : '#/') }, 'Go learn something'))));
  return () => { activeQuiz = null; };
}
function deepDive(g, cleanups, slug) {
  const D = g.deep; let built = false;
  const body = h('div', { class: 'deep-b' });
  const parts = [D.formula && 'the formula', D.figure && 'an animated figure', D.example && 'a worked example', D.lab && 'a live lab'].filter(Boolean);
  const det = h('details', { class: 'deep' }, h('summary', null, icon('next', 'chev'), h('span', { text: 'Deep dive: ' + (parts.join(', ') || 'how it works') })), body);
  const sec = (title, ...kids) => h('section', { class: 'deep-s' }, h('h4', { text: title }), ...kids);
  det.addEventListener('toggle', () => {
    if (!det.open || built) return; built = true; // build lazily: figures and labs only cost something once opened
    if (D.intuition) body.append(sec('The idea', h('div', { class: 'prose', html: paras(D.intuition) })));
    if (D.formula) body.append(sec('The formula', h('div', { class: 'math-block', role: 'math', 'aria-label': 'Formula for ' + g.name, html: [].concat(D.formula).map(f => tex(f, true)).join('') }),
      D.symbols ? h('table', { class: 'syms' }, h('tbody', null, D.symbols.map(([a, b]) => h('tr', null, h('td', { html: tex(a, false) }), h('td', { html: rt(b) }))))) : null));
    if (D.figure) { const f = h('div', { class: 'deep-fig' }); body.append(sec(D.figure.h || 'See it', f)); const pl = Player(f, D.figure, {}); cleanups.push(pl.destroy); }
    if (D.example) body.append(sec(D.example.h || 'Worked example', D.example.given ? h('p', { html: rt(D.example.given) }) : null, h('ol', { class: 'wsteps' }, D.example.steps.map(x => h('li', { html: rt(x) }))), D.example.result ? h('p', { class: 'wres', html: rt(D.example.result) }) : null));
    if (D.lab) { const f = h('div', { class: 'deep-lab' }); body.append(sec(D.lab.h || 'Try it', D.lab.body ? h('p', { html: rt(D.lab.body) }) : null, f)); const pg = Playground(f, Object.assign({ kind: 'controls', goals: [] }, D.lab), { id: slug }, () => {}); cleanups.push(pg.destroy); }
    if (D.pitfalls) body.append(sec('Watch out', h('ul', { class: 'pts' }, D.pitfalls.map(x => h('li', { html: rt(x) })))));
    if (D.code) body.append(sec('In code', codeBlock(D.code, D.lang)));
  });
  return det;
}
function viewGlossary(pre) {
  const keys = Object.keys(G).sort(), deepN = keys.filter(k => G[k].deep).length, want = pre ? norm(pre) : null, cleanups = [];
  let onlyDeep = false;
  const list = h('dl', { class: 'gl' });
  const inp = h('input', { type: 'search', 'aria-label': 'Filter terms', placeholder: 'Filter ' + keys.length + ' terms…', value: pre || '' });
  const chip = deepN ? h('button', { class: 'btn sm', type: 'button', id: 'deep-only', 'aria-pressed': 'false', onclick: () => { onlyDeep = !onlyDeep; chip.setAttribute('aria-pressed', String(onlyDeep)); draw(); } }, icon('quiz'), 'Deep dives only (' + deepN + ')') : null;
  const draw = () => {
    cleanups.splice(0).forEach(f => f()); const f = norm(inp.value);
    list.replaceChildren(...keys.filter(k => (!onlyDeep || G[k].deep) && (!f || k.includes(f) || norm(plain(G[k].def)).includes(f))).map(k => {
      const g = G[k], slug = 'g-' + k.replace(/\W+/g, '-');
      const card = h('div', { class: 'gi' + (g.deep ? ' has-deep' : ''), id: slug }, h('dt', null, g.name, g.deep ? h('span', { class: 'tag', text: 'Deep dive' }) : null), h('dd', { html: rt(g.def) }));
      if (g.deep) { const d = deepDive(g, cleanups, slug); card.append(d); if (k === want) d.open = true; }
      return card;
    }));
    if (!list.children.length) list.append(h('p', { class: 'empty', text: 'No terms match “' + inp.value + '”.' }));
  };
  inp.addEventListener('input', draw); draw();
  $('#main').append(h('div', { class: 'wrap view-in' }, h('div', { class: 'ph' }, h('h1', { text: 'Glossary' }), h('p', { text: 'Every term in plain words. Terms marked "Deep dive" open the full story: the formula, an animated figure, a worked example with real numbers, and a live lab.' })),
    h('div', { class: 'gl-tools' }, h('label', { class: 'field' }, icon('search'), inp), chip), list));
  if (want) setTimeout(() => { const el = $('#g-' + want.replace(/\W+/g, '-')); el && el.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' }); }, 80);
  return () => cleanups.forEach(f => f());
}
function viewCheat() {
  $('#main').append(h('div', { class: 'wrap view-in' }, h('div', { class: 'ph' }, h('h1', { text: 'Cheat sheet' }), h('button', { class: 'btn sm noprint', type: 'button', onclick: () => print() }, icon('print'), 'Print'), h('p', { text: 'The key points and commands from every lesson on one page.' })),
    C.modules.map((m, mi) => h('section', null, h('h2', { text: 'Module ' + (mi + 1) + ': ' + m.title }), m.lessons.map(l => { const r = l.cards.find(c => c.t === 'recap'); return h('div', { class: 'cs-l' }, h('h3', null, h('a', { href: '#/l/' + l.id + '/0', text: l.title }), isDone(l) ? h('span', { class: 'tag ok', style: { marginLeft: '8px' }, text: 'Done' }) : null), r ? h('ul', null, r.points.map(p => h('li', { html: rt(p) }))) : null, r && r.cheat ? cheatTable(r.cheat) : null); })))));
}
function route() {
  if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
  closePop(); activePlayer = activeQuiz = activePlay = null; $('#toast').replaceChildren();
  $$('dialog[open]').forEach(d => d.close());
  const p = HASH.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  const main = $('#main'); main.replaceChildren();
  if (p[0] === 'l' && byId[p[1]]) cleanup = viewLesson(byId[p[1]], clamp(parseInt(p[2], 10) || 0, 0, byId[p[1]].cards.length - 1));
  else if (p[0] === 'done' && byId[p[1]]) cleanup = viewDone(byId[p[1]]);
  else if (p[0] === 'project') cleanup = viewProject(+p[1]);
  else if (p[0] === 'review') cleanup = viewReview();
  else if (p[0] === 'glossary') cleanup = viewGlossary(p[1]);
  else if (p[0] === 'cheat') viewCheat();
  else if (p[0] === 'certificate') viewCert();
  else if (p[0] === 'panel') viewPanel();
  else { lastLoc = null; }
  updateHeader(p[0]);
  // Academy: the page scrolls, not the view; bring a new card into sight, and keep focus in the view as the original did
  if (HOST.getBoundingClientRect().top < 0) HOST.scrollIntoView({ block: 'start' });
  const a = SR.activeElement; if (p[0] !== 'panel' && (a ? !main.contains(a) : doc.activeElement === doc.body || !doc.activeElement)) main.focus({ preventScroll: true });
}

/* ---------- header, dialogs, search ---------- */
function updateHeader(r) {
  if (r !== undefined) $$('.tab[data-r]').forEach(a => a.dataset.r === (['l', 'done', 'project', 'certificate'].includes(r) ? '' : r || '') ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  const n = dueList().length, b = $('#due-b'); if (b) { b.hidden = !n; b.textContent = n; }
}
function dialog(title, body, cls) {
  const d = h('dialog', { class: 'dlg' + (cls ? ' ' + cls : ''), 'aria-labelledby': 'dlg-t' }, h('div', { class: 'dlg-h' }, h('h2', { id: 'dlg-t', text: title }), h('button', { class: 'ibtn', type: 'button', 'aria-label': 'Close', onclick: () => d.close() }, icon('x'))), h('div', { class: 'dlg-b' }, body));
  d.addEventListener('close', () => d.remove()); d.addEventListener('click', e => { if (e.target === d) d.close(); });
  SR.append(d); d.showModal(); return d;
}
function shortcuts() {
  const k = [['/', 'Search this course'], ['Enter', 'Check / Continue'], ['← →', 'Previous / next animation step'], ['Space', 'Play / pause animation'], ['Home End', 'First / last step'], ['[ ]', 'Slower / faster'], ['1 – 9', 'Pick an answer'], ['H', 'Hint'], ['M', 'Back to the course page'], ['C', 'Course contents (in a lesson)'], ['?', 'This list'], ['Esc', 'Close dialogs and popups']]; // Academy: Ctrl K belongs to the site
  dialog('Keyboard shortcuts', h('dl', { class: 'keys' }, k.map(([a, b]) => [h('dt', null, a.split(' ').map(x => h('kbd', { text: x }))), h('dd', { style: { margin: 0 }, text: b })])));
}
function settings() {
  const file = h('input', { type: 'file', accept: 'application/json', hidden: true });
  file.addEventListener('change', async () => { try { const o = JSON.parse(await file.files[0].text()); if (!o || o.v !== VER || typeof o.les !== 'object') throw 0; S = Object.assign(blank(), o); save(); route(); L.forEach(l => isDone(l) && DONE(l.id)); toast('Progress imported'); } catch (e) { toast('That file is not a progress export from this course.'); } });
  let armed = false; const rb = h('button', { class: 'btn sm danger', type: 'button' }, icon('trash'), 'Reset all progress');
  rb.onclick = () => { if (!armed) { armed = true; rb.lastChild.textContent = 'Click again to erase everything'; setTimeout(() => { armed = false; rb.lastChild.textContent = 'Reset all progress'; }, 4000); return; } const set = S.set; S = blank(); S.set = set; S.intro = true; save(); d.close(); route(); toast('Progress reset'); };
  const d = dialog('Progress backup', [ // Academy: theme and motion follow the site and the OS
    h('h3', { text: 'Your progress' }), h('p', { style: { fontSize: '14.5px', color: 'var(--dim)', margin: '4px 0 10px' }, text: 'Saved in this browser only. Export a backup to move it to another device.' }),
    h('div', { class: 'acts' }, h('button', { class: 'btn sm', type: 'button', onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' })), download: C.id + '-progress.json' }); a.click(); } }, icon('down'), 'Export'), h('button', { class: 'btn sm', type: 'button', onclick: () => file.click() }, icon('up'), 'Import'), rb), file]);
}
function searchIndex() {
  const ix = [];
  L.forEach(l => { ix.push({ t: l.title, s: plain(l.goal), href: '#/l/' + l.id + '/0', ic: 'book' }); l.cards.forEach((c, ci) => { if (c.h && ci) ix.push({ t: plain(c.h), s: l.title, href: '#/l/' + l.id + '/' + ci, ic: TYPE[c.t][0] }); if (c.t === 'recap' && c.cheat) c.cheat.forEach(r => ix.push({ t: r[0], s: plain(r[1]), href: '#/cheat', ic: 'sheet' })); }); });
  Object.keys(G).forEach(k => ix.push({ t: G[k].name, s: plain(G[k].def), href: '#/glossary/' + encodeURIComponent(k), ic: 'quiz' }));
  return ix;
}
function openSearch() {
  if ($('dialog.srch')) return;
  const ix = searchIndex(); let act = 0, res = [];
  const inp = h('input', { type: 'search', 'aria-label': 'Search the course', placeholder: 'Search lessons, steps, terms, commands…', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': 'sres', 'aria-autocomplete': 'list' });
  const ul = h('ul', { class: 'res', id: 'sres', role: 'listbox', 'aria-label': 'Results' });
  const draw = () => {
    const f = norm(inp.value);
    res = !f ? ix.filter(x => x.ic === 'book').slice(0, 8) : ix.map(x => [norm(x.t).startsWith(f) ? 0 : norm(x.t).includes(f) ? 1 : norm(x.s).includes(f) ? 2 : 9, x]).filter(a => a[0] < 9).sort((a, b) => a[0] - b[0]).slice(0, 12).map(a => a[1]);
    act = Math.min(act, Math.max(0, res.length - 1));
    ul.replaceChildren(...res.map((x, i) => h('li', { role: 'option', id: 'sr-' + i, 'aria-selected': String(i === act), onclick: () => goTo(x) }, icon(x.ic), h('div', null, x.t, h('small', { text: x.s.slice(0, 90) })))));
    if (!res.length) ul.append(h('li', { role: 'option', 'aria-disabled': 'true' }, 'No matches. Try a shorter word.'));
    inp.setAttribute('aria-activedescendant', res.length ? 'sr-' + act : '');
  };
  const goTo = x => { d.close(); goHash(x.href); };
  inp.addEventListener('input', () => { act = 0; draw(); });
  inp.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); act = Math.min(res.length - 1, act + 1); draw(); } else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(0, act - 1); draw(); } else if (e.key === 'Enter' && res[act]) { e.preventDefault(); goTo(res[act]); } });
  const d = h('dialog', { class: 'dlg srch', 'aria-label': 'Search' }, h('div', { class: 'srch-i' }, icon('search'), inp, h('kbd', null, 'Esc')), ul);
  d.addEventListener('close', () => d.remove()); d.addEventListener('click', e => { if (e.target === d) d.close(); });
  SR.append(d); d.showModal(); draw(); inp.focus();
}

/* ---------- keyboard ---------- */
function onKey(e0) {
  const t = e0.composedPath()[0], e = { key: e0.key, target: t, metaKey: e0.metaKey, ctrlKey: e0.ctrlKey, altKey: e0.altKey, preventDefault: () => e0.preventDefault() }; // Academy: read at the real target
  if (t.closest && !SR.contains(t) && t.closest('header, nav, dialog')) return; // Academy: keys in the site's own header and menus are theirs
  const typing = t.matches && t.matches('input:not([type=range]):not([type=file]),textarea,select,[contenteditable]');
  if (e.key === 'Escape') { closePop(); return; }
  if (typing || e.metaKey || e.ctrlKey || e.altKey || $('dialog[open]')) return;
  if (e.key === '?') { e.preventDefault(); shortcuts(); return; }
  if (e.key === '/') { e.preventDefault(); openSearch(); return; }
  if (e.key === 'm' || e.key === 'M') { goHash('#/'); return; }
  if ((e.key === 'c' || e.key === 'C') && HASH.startsWith('#/l/')) { e.preventDefault(); openContents(); return; }
  if (activeQuiz && activeQuiz.key(e)) return;
  if (activePlayer && activePlayer.key(e)) return;
  if (e.key === 'Enter' && !t.closest('button,a,summary,input,textarea,select')) { const p = $('#primary'); if (p && !p.disabled) { e.preventDefault(); p.click(); } }
}

/* ---------- Academy: the course's stats and its own pages, for the course page (the original home's hero stats and footer links) ---------- */
function viewPanel() {
  const doneN = L.filter(isDone).length, due = dueList().length, acc = accuracy(), st = streak(), outcomes = C.outcomes || L.slice(0, 6).map(l => l.goal);
  const stat = (ic, text) => h('span', null, icon(ic), h('span', { text }));
  const pm = C.modules.findIndex(m => m.project);
  $('#main').append(h('div', { class: 'panel' },
    h('p', { class: 'cstats', 'aria-label': 'Your stats' }, stat('flame', st + (st === 1 ? ' day' : ' days') + ' streak'), stat('star', S.xp + ' XP'), stat('target', acc == null ? 'no answers yet' : acc + '% right first try'), stat('clock', fmtMins(minsOf(L.filter(l => !isDone(l)))) + (doneN < L.length ? ' left' : ''))),
    h('div', { class: 'acts' }, h('a', { class: 'btn' + (due ? ' pri' : ''), href: '#/review' }, icon('review'), due ? 'Review ' + due : 'Review'), h('a', { class: 'btn', href: '#/glossary' }, icon('book'), 'Glossary'), h('a', { class: 'btn', href: '#/cheat' }, icon('sheet'), 'Cheat sheet'),
      pm >= 0 ? h('a', { class: 'btn', href: '#/project/' + pm }, icon('target'), 'Project board') : null, h('a', { class: 'btn', href: '#/certificate' }, icon('star'), 'Certificate')),
    h('details', { class: 'about', open: !doneN }, h('summary', null, icon('next', 'chev'), h('span', { text: 'What you will learn' })),
      h('ul', null, outcomes.map(o => h('li', null, icon('check'), h('span', { html: rt(cap1(noTerms(o))) })))),
      h('p', { class: 'about-m', text: C.modules.length + ' modules · ' + L.length + ' lessons · about ' + fmtMins(totalMins) + (C.level ? ' · ' + C.level : '') })),
    h('p', { class: 'panel-f' }, h('button', { class: 'linkb', type: 'button', onclick: () => shortcuts(), text: 'Keyboard shortcuts' }), h('button', { class: 'linkb', type: 'button', onclick: () => settings(), text: 'Progress backup' }))));
}

/* ---------- Academy: show a route in a host element; returns the cleanup ---------- */
// opts: nav(url) follows a link through the site router; done(lessonId) when a lesson is finished (also for lessons finished before)
function show(host, hash, opts) {
  HOST = host; NAV = opts.nav; DONE = opts.done || (() => {}); HASH = hash;
  SR = host.shadowRoot || host.attachShadow({ mode: 'open' });
  if (!sheet) { sheet = new CSSStyleSheet(); sheet.replaceSync(CSS); }
  SR.adoptedStyleSheets = [sheet];
  SR.replaceChildren(h('main', { id: 'main', tabindex: '-1' }), h('div', { class: 'toast', id: 'toast', role: 'status', 'aria-live': 'polite' }));
  applyTheme();
  const mo = new MutationObserver(applyTheme); mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  mqDark.addEventListener('change', applyTheme); mqMotion.addEventListener('change', applyTheme);
  doc.addEventListener('click', onClick); doc.addEventListener('keydown', onKey); addEventListener('scroll', onScroll, { passive: true });
  if (corrupt) { toast('Saved progress could not be read, so it was reset. A backup copy was kept.'); corrupt = false; }
  route();
  L.forEach(l => isDone(l) && DONE(l.id));
  return () => {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    closePop(); activePlayer = activeQuiz = activePlay = null;
    mo.disconnect(); mqDark.removeEventListener('change', applyTheme); mqMotion.removeEventListener('change', applyTheme);
    doc.removeEventListener('click', onClick); doc.removeEventListener('keydown', onKey); removeEventListener('scroll', onScroll);
    if (SR.replaceChildren) SR.replaceChildren();
  };
}
// The card to open for a lesson URL: #c<n>, #done, or (no hash: a link from the Academy) where you stopped, as the original course page linked it
function lessonHash(id, frag) {
  const l = byId[id]; if (!l) return '#/';
  if (frag === '#done') return '#/done/' + id;
  const m = /^#c(\d+)$/.exec(frag || ''); if (m) return '#/l/' + id + '/' + m[1];
  const inProg = !isDone(l) && S.les[id] && S.les[id].c.length && S.pos && S.pos.l === id;
  return '#/l/' + id + '/' + (inProg ? S.pos.c : 0);
}
const toolHash = (tool, frag) => tool === 'glossary' ? '#/glossary' + (frag && frag.length > 1 ? '/' + frag.slice(1) : '') : tool === 'cheatsheet' ? '#/cheat' : tool === 'project' ? '#/project/' + ((/^#m(\d+)$/.exec(frag || '') || [])[1] ?? C.modules.findIndex(m => m.project)) : '#/' + tool;
return { show, url, lessonHash, toolHash };
}
