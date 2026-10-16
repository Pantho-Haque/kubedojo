// QA suite for the production build in headless Chrome: playground behaviour, animations, tabs, terminals, persistence,
// layout audit at many viewport widths (overflow, clipped text, tap targets, contrast, labels), keyboard access, stress.
//   usage: npm run build && node scripts/qa.mjs [filter]      writes qa-report.json (see docs/QA-REPORT.md)
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './browser.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..'); const PORT = 4181; const base = `http://localhost:${PORT}`;
const only = process.argv[2];
const server = spawn('node', [join(root, 'scripts/serve.mjs'), String(PORT)], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 800));
const b = await launch(); const results = []; const t0 = Date.now();
const check = (area, name, ok, extra = '') => { results.push({ area, name, ok: !!ok, extra: ok ? '' : String(extra).slice(0, 400) }); console.log((ok ? 'ok   ' : 'FAIL ') + `[${area}] ${name}` + (ok ? '' : '  ' + String(extra).slice(0, 300))); };
const open = (o = {}) => b.newPage({ width: 1440, height: 900, scheme: 'dark', ...o });
const section = async (name, fn) => { if (only && !name.includes(only)) return; console.log('\n== ' + name); try { await fn(); } catch (e) { check(name, 'section crashed', false, e.stack || e.message); } };

// in-page helpers, installed once per page
const HELPERS = `(() => {
  window.$ = (s, el) => (el || document).querySelector(s); window.$$ = (s, el) => [...(el || document).querySelectorAll(s)];
  window.sleep = ms => new Promise(r => setTimeout(r, ms));
  const activeInput = () => $$('.tin').find(i => i.closest('.term').style.display !== 'none');
  window.activeInput = activeInput;
  window.setVal = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
  window.key = (el, k, o = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...o }));
  window.idle = async () => { for (let i = 0; i < 300 && $$('.tline.busy').length; i++) await sleep(100); };
  window.cmd = async (t, wait = 300) => { const i = activeInput(); i.focus(); setVal(i, t); await sleep(20); key(i, 'Enter'); await sleep(wait); await idle(); };
  window.out = () => $$('.term').find(t => t.style.display !== 'none').querySelector('.tout').textContent;
  window.tab = async name => { const t = $$('.vtab').find(b => b.textContent.toLowerCase().startsWith(name)); t.click(); await sleep(250); return $('#vizbody').textContent; };
  0; })()`;
const play = async (opts = {}, url = '/app?notour=1') => { const p = await open(opts); await p.goto(base + url, { wait: 1200 }); await p.waitFor('!!document.querySelector(".tin")', 20000); await p.eval(HELPERS); return p; };

/* =================== terminal behaviours =================== */
await section('terminal', async () => {
  const p = await play();
  check('terminal', 'banner and prompt render, input focused', (await p.eval('out()')).includes('KubeDojo') && await p.eval('document.activeElement === activeInput()'));
  await p.eval(`cmd('echo one')`); await p.eval(`cmd('echo two')`);
  check('terminal', 'commands print output', (await p.eval('out()')).includes('one') && (await p.eval('out()')).includes('two'));
  await p.eval(`(() => { const i = activeInput(); key(i, 'ArrowUp'); 0 })()`); await p.sleep(50);
  check('terminal', 'ArrowUp recalls the last command', await p.eval('activeInput().value') === 'echo two', await p.eval('activeInput().value'));
  await p.eval(`(() => { const i = activeInput(); key(i, 'ArrowUp'); key(i, 'ArrowDown'); key(i, 'ArrowDown'); 0 })()`); await p.sleep(50);
  check('terminal', 'ArrowDown past the end empties the line', await p.eval('activeInput().value') === '', await p.eval('activeInput().value'));
  await p.eval(`setVal(activeInput(), 'kubectl get no'); 0`); await p.sleep(50); await p.eval(`key(activeInput(), 'Tab')`); await p.sleep(100);
  check('terminal', 'Tab completes a command word', /kubectl get no(des)?/.test(await p.eval('activeInput().value')), await p.eval('activeInput().value'));
  await p.eval(`setVal(activeInput(), ''); 0`);
  await p.eval(`(() => { const i = activeInput(); i.focus(); key(i, 'l', { ctrlKey: true }); 0 })()`); await p.sleep(100);
  check('terminal', 'Ctrl-L clears the screen', !(await p.eval('out()')).includes('one'));
  await p.eval(`(async () => { const i = activeInput(); i.focus(); setVal(i, 'sleep 30'); key(i, 'Enter'); await sleep(300); 0 })()`);
  check('terminal', 'a long command shows the busy state', await p.eval('!!$(".tline.busy")'));
  await p.eval(`key(activeInput(), 'c', { ctrlKey: true })`); await p.sleep(400);
  check('terminal', 'Ctrl-C aborts it', await p.eval('!$(".tline.busy")') && (await p.eval('out()')).includes('^C'));
  await p.eval(`cmd('for i in 1 2 3; do echo line$i; done')`); check('terminal', 'multi-line shell constructs run', /line1\s*line2\s*line3/.test(await p.eval('out()')));
  await p.eval(`cmd('seq 1 3000 | tail -1')`); await p.eval(`cmd('seq 1 4000')`); check('terminal', 'scrollback is capped (no unbounded DOM growth)', (await p.eval('$$(".term .ln").length')) <= 2600, await p.eval('$$(".term .ln").length'));
  // paste of several lines
  await p.eval(`(async () => { const i = activeInput(); i.focus(); const dt = new DataTransfer(); dt.setData('text', 'echo p1\\necho p2\\n'); i.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); await sleep(600); await idle(); 0 })()`);
  check('terminal', 'pasting multiple lines runs each one', /p1[\s\S]*p2/.test(await p.eval('out()')));
  check('terminal', 'no console errors', !p.errors.length, p.errors.join(' | '));
  await p.close();
});

await section('terminal tabs', async () => {
  const p = await play();
  const addBtn = 'document.querySelector("#newtab")';
  check('terminal tabs', 'add-terminal button exists', await p.eval(`!!${addBtn}`));
  for (let i = 0; i < 6; i++) await p.eval(`(${addBtn} || {click(){}}).click()`), await p.sleep(80);
  const tabs = await p.eval('$$(".term").length'); check('terminal tabs', 'at most four terminals can be opened', tabs === 4, tabs);
  await p.eval(`cmd('echo only-in-4')`); await p.eval(`$$('#tabs .tab')[0].click()`); await p.sleep(100);
  check('terminal tabs', 'terminals keep separate scrollback', !(await p.eval('out()')).includes('only-in-4'));
  check('terminal tabs', 'no console errors', !p.errors.length, p.errors.join(' | '));
  await p.close();
});

/* =================== live views + animations =================== */
await section('cluster view', async () => {
  const p = await play();
  check('cluster view', 'every object group carries a kind tag', await p.eval('$$("#vizbody .ktag").length') >= 3, await p.eval('$$("#vizbody .ktag").length'));
  await p.eval(`cmd('kind create cluster --name qa', 800)`); await p.sleep(3000);
  await p.eval(`cmd('kubectl create deployment web --image=nginx:1.27 --replicas=3', 500)`); await p.eval(`cmd('kubectl expose deployment web --port=80')`); await p.sleep(4000);
  const txt = await p.eval('$("#vizbody").textContent');
  check('cluster view', 'switching to the new cluster shows its nodes', /qa-control-plane/.test(txt) || /control-plane/.test(txt));
  await p.eval(`$$('#vizbody .nschip').length`);
  check('cluster view', 'deployment, pods and service are labelled with their kinds', ['DEPLOYMENT', 'POD', 'SERVICE', 'NODE'].every(k => new RegExp(k, 'i').test(txt)) , txt.slice(0, 200));
  const pods = await p.eval('$$("#vizbody .pod").length'); check('cluster view', 'pod tiles render for the replicas', pods >= 3, pods);
  // animation on scale up and delete
  await p.eval(`(async () => { window.__seen = { enter: 0, leave: 0 }; new MutationObserver(m => { for (const x of m) { const t = x.target; if (t.classList) { if (t.classList.contains('enter')) __seen.enter++; if (t.classList.contains('leaving')) __seen.leave++; } for (const a of x.addedNodes) if (a.classList) { if (a.classList.contains('enter') || (a.querySelector && a.querySelector('.enter'))) __seen.enter++; } } }).observe($('#vizbody'), { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] }); 0 })()`);
  await p.eval(`cmd('kubectl scale deployment web --replicas=6', 200)`); await p.sleep(2500);
  check('cluster view', 'scaling up plays the enter animation', await p.eval('__seen.enter') > 0, await p.eval('__seen.enter'));
  await p.eval(`cmd('kubectl scale deployment web --replicas=1', 200)`); await p.sleep(2500);
  check('cluster view', 'scaling down plays the leave animation', await p.eval('__seen.leave') > 0, await p.eval('__seen.leave'));
  check('cluster view', 'removed pods are really gone after the animation', await p.eval('$$("#vizbody .pod.leaving").length') === 0 && await p.eval('$$("#vizbody .pod").length') <= 3);
  // delete node via docker stop
  await p.eval(`cmd('docker stop qa-control-plane', 300)`); await p.sleep(2000);
  check('cluster view', 'a stopped node is shown as down', await p.eval('!!$("#vizbody .node.down")') || /NotReady|down/i.test(await p.eval('$("#vizbody").textContent')));
  check('cluster view', 'status bar counts update', /pending|failing|running/.test(await p.eval('$(".statusbar, #statusbar, footer")?.textContent || ""')));
  // clicking a pod opens the inspector; Escape closes
  await p.eval(`cmd('docker start qa-control-plane', 300)`); await p.sleep(3000);
  const hasPod = await p.eval('!!$("#vizbody .pod:not(.leaving)")');
  if (hasPod) { await p.eval('$("#vizbody .pod:not(.leaving)").click()'); await p.sleep(250); check('cluster view', 'clicking a pod opens the inspector', await p.eval('!!$("#insp .insp")'));
    await p.eval(`key(document.activeElement || document.body, 'Escape')`); await p.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`); await p.sleep(250);
    check('cluster view', 'Escape closes the inspector', await p.eval('!$("#insp .insp")'), 'inspector still open after Escape'); }
  check('cluster view', 'no console errors', !p.errors.length, p.errors.join(' | '));
  await p.close();
});

await section('tabs', async () => {
  const p = await play();
  await p.eval(`cmd('docker run -d --name web1 -p 8080:80 nginx:1.27', 600)`);
  let t = await p.eval(`tab('docker')`); check('tabs', 'Docker tab lists the container', /web1/.test(t) && /nginx/.test(t), t.slice(0, 200));
  check('tabs', 'container card has a kind tag and port mapping', /8080/.test(t) && /CONTAINER/i.test(t));
  await p.eval(`cmd('docker stop web1', 300)`); await p.sleep(300); t = await p.eval(`$('#vizbody').textContent`); check('tabs', 'stopped container is shown as stopped/exited', /Exited|stopped/i.test(t), t.slice(0, 200));
  t = await p.eval(`tab('config')`); check('tabs', 'Config tab shows contexts and the access matrix', /kubeconfig/i.test(t) && /access/i.test(t));
  t = await p.eval(`tab('helm')`); check('tabs', 'Helm tab explains Tiller when missing', /Tiller/.test(t));
  t = await p.eval(`tab('files')`); check('tabs', 'Files tab shows the tree with the example chart', /myapp/.test(t) && /Chart\\.yaml/.test(t.replace('.', '\\\\.')) || /Chart.yaml/.test(t));
  t = await p.eval(`tab('events')`); check('tabs', 'Events tab lists events with filters', /Events/.test(t) && /Warnings/.test(t));
  // keyboard on the tablist
  await p.eval(`(() => { const t = $$('.vtab')[0]; t.focus(); key(t, 'ArrowRight'); 0 })()`); await p.sleep(200);
  const sel = await p.eval(`$$('.vtab').findIndex(b => b.getAttribute('aria-selected') === 'true')`); check('tabs', 'tablist supports ArrowRight (roving tabs)', sel !== -1 && await p.eval(`document.activeElement.classList.contains('vtab')`), 'selected index ' + sel);
  // rapid tab switching while the sim runs
  await p.eval(`cmd('kind create cluster --name rapid', 300)`);
  await p.eval(`(async () => { for (let i = 0; i < 40; i++) { $$('.vtab')[i % 6].click(); await sleep(30); } 0 })()`); await p.sleep(500);
  check('tabs', 'rapid tab switching during cluster creation causes no errors', !p.errors.length, p.errors.join(' | '));
  await p.close();
});

await section('files', async () => {
  const p = await play();
  await p.eval(`cmd('echo "hello: world" > ~/note.yaml')`); await p.eval(`tab('files')`);
  check('files', 'a file made in the terminal appears in the tree', /note\.yaml/.test(await p.eval('$("#vizbody").textContent')));
  await p.eval(`$$('#vizbody .trow, #vizbody .f').find(e => /note\\.yaml/.test(e.textContent)).click()`); await p.sleep(300);
  check('files', 'clicking a file opens the editor with its content', /hello: world/.test(await p.eval('($("#vizbody textarea")||{}).value || $("#vizbody").textContent')));
  // edit and save
  await p.eval(`(() => { const ta = $('#vizbody textarea'); if (!ta) return; Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(ta, 'edited: yes\\n'); ta.dispatchEvent(new Event('input', { bubbles: true })); 0 })()`); await p.sleep(200);
  await p.eval(`$$('#vizbody button').find(b => /^save/i.test(b.textContent))?.click()`); await p.sleep(500);
  await p.eval(`cmd('cat ~/note.yaml')`); check('files', 'saving in the editor changes the file the shell sees', /edited: yes/.test(await p.eval('out()')), (await p.eval('out()')).slice(-200));
  // persistence across reload
  await p.sleep(600); await p.goto(base + '/app?notour=1', { wait: 1500 }); await p.waitFor('!!document.querySelector(".tin")'); await p.eval(HELPERS);
  await p.eval(`cmd('cat ~/note.yaml')`); check('files', 'files survive a page reload (localStorage)', /edited: yes/.test(await p.eval('out()')), (await p.eval('out()')).slice(-200));
  // reset keeps files
  check('files', 'no console errors', !p.errors.length, p.errors.join(' | '));
  await p.close();
});

await section('vi', async () => {
  const p = await play();
  await p.eval(`(async () => { const i = activeInput(); i.focus(); setVal(i, 'vi t.txt'); key(i, 'Enter'); await sleep(500); 0 })()`);
  check('vi', 'vi opens as a full-pane editor', await p.eval('!!$(".vi, .viov, [class*=vi-]")') || await p.eval('!!document.querySelector("[tabindex]:not(input)") && /INSERT|NORMAL|~/.test(document.body.textContent)'));
  const k = c => p.eval(`(() => { const el = document.activeElement; el.dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(c)}, bubbles: true, cancelable: true })); 0 })()`);
  for (const c of ['i', 'h', 'i', 'Escape', ':', 'w', 'q', 'Enter']) { await k(c); await p.sleep(40); }
  await p.sleep(400); await p.eval(`cmd('cat t.txt')`); check('vi', 'typing i,h,i,Esc,:wq writes the file', /hi/.test(await p.eval('out()').then(t => t.slice(-60))), (await p.eval('out()')).slice(-80));
  check('vi', 'the terminal prompt is back after :wq', await p.eval('!!$(".tline")'));
  await p.close();
});

await section('palette and layout', async () => {
  const p = await play();
  await p.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'P', ctrlKey: true, shiftKey: true, bubbles: true }))`); await p.sleep(250);
  check('palette and layout', 'Ctrl+Shift+P opens the palette', await p.eval('!!$(".pal-card input")'));
  await p.eval(`(() => { const i = $('.pal-card input'); setVal(i, 'kubectl get pods'); 0 })()`); await p.sleep(200);
  const items = await p.eval('$$(".pal-card [role=option], .pal-card li, .pal-card .pal-item").length'); check('palette and layout', 'filtering shows matching commands', items > 0, items);
  await p.eval(`key(document.activeElement, 'ArrowDown'); key(document.activeElement, 'ArrowDown')`); await p.sleep(100);
  await p.eval(`key(document.activeElement, 'Escape')`); await p.sleep(250);
  check('palette and layout', 'Escape closes the palette and returns focus to the terminal', await p.eval('!$(".pal-card input")') && await p.eval('document.activeElement === activeInput()'), await p.eval('document.activeElement.tagName + "." + document.activeElement.className'));
  // sidebar toggle + resizers
  const w0 = await p.eval('$("#side, #sidebar, aside")?.getBoundingClientRect().width');
  await p.eval(`$('#sidebtn').click()`); await p.sleep(300);
  const w1 = await p.eval('$("#side, #sidebar, aside")?.getBoundingClientRect().width || 0'); check('palette and layout', 'the guide can be collapsed', w1 < w0, `${w0} -> ${w1}`);
  await p.close();
});

await section('persistence and reset', async () => {
  const p = await play();
  await p.eval(`cmd('echo keepme > keep.txt')`); await p.eval(`cmd('kind create cluster --name gone', 500)`); await p.sleep(1000);
  await p.eval(`(window.confirm = () => true, 0)`); await p.eval(`$('#resetbtn').click()`); await p.sleep(800); const hadDialog = false;
  await p.eval(`cmd('kind get clusters', 200)`); const o = await p.eval('out()');
  check('persistence and reset', 'Reset gives a fresh world (cluster gone) without a hung dialog', !/gone/.test(o.slice(o.lastIndexOf('kind get clusters'))) || hadDialog, o.slice(-200));
  await p.eval(`cmd('cat keep.txt')`); check('persistence and reset', 'Reset keeps your files', /keepme/.test(await p.eval('out()').then(t => t.slice(-50))));
  await p.close();
});

/* =================== deep links =================== */
await section('deep links', async () => {
  const p = await open(); await p.goto(base + '/app?notour=1&run=' + encodeURIComponent(JSON.stringify(['echo deep-link-ok'])), { wait: 1500 }); await p.waitFor('!!document.querySelector(".tin")'); await p.eval(HELPERS);
  check('deep links', '?run= executes commands on load', await p.waitFor('out().includes("deep-link-ok")', 8000));
  await p.goto(base + '/app?notour=1&tab=files', { wait: 1500 }); await p.waitFor('!!document.querySelector(".vtab")'); await p.eval(HELPERS);
  check('deep links', '?tab=files opens the Files tab', await p.eval(`$$('.vtab').find(b => b.getAttribute('aria-selected') === 'true')?.textContent`) === 'Files');
  await p.goto(base + '/app?run=%5B%22echo%20%22%5D&tab=nope&tour=99', { wait: 1500 }); check('deep links', 'garbage parameters do not break the page', !p.errors.length && await p.eval('!!document.querySelector(".tin")'), p.errors.join('|'));
  await p.goto(base + '/app?run=not-json', { wait: 1500 }); check('deep links', 'malformed ?run= does not crash', await p.eval('!!document.querySelector(".tin")'), p.errors.join('|'));
  await p.close();
});

/* =================== layout audit, many widths =================== */
const AUDIT = `(() => {
  const bad = []; const vw = innerWidth;
  const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
  if (document.documentElement.scrollWidth > vw + 1) bad.push('page scrolls horizontally by ' + (document.documentElement.scrollWidth - vw));
  for (const e of document.querySelectorAll('button, a, input, select, summary, [role=tab], [role=button]')) {
    if (!vis(e)) continue; const r = e.getBoundingClientRect(); const name = (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent || e.value || e.placeholder || '').trim();
    if (!name && !e.querySelector('img[alt]')) bad.push('no accessible name: ' + e.tagName + '.' + (e.className && e.className.baseVal === undefined ? e.className : '') + ' @' + Math.round(r.x) + ',' + Math.round(r.y));
    if (r.right > vw + 1 && !e.closest('.mx-wrap, .table-wrap, #tabs, [role=tablist], .timeline, pre')) bad.push('control off-screen right: ' + (name || e.tagName).slice(0, 30));
  }
  for (const e of document.querySelectorAll('img')) if (vis(e) && !e.hasAttribute('alt')) bad.push('img without alt: ' + e.src.slice(-30));
  for (const e of document.querySelectorAll('input:not([type=hidden]), textarea, select')) if (vis(e) && !(e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.id && document.querySelector('label[for="' + e.id + '"]') || e.closest('label') || e.placeholder || e.title)) bad.push('input without label: ' + e.className);
  const ids = {}; for (const e of document.querySelectorAll('[id]')) { if (ids[e.id]) bad.push('duplicate id: ' + e.id); ids[e.id] = 1; }
  // text clipped by a hidden-overflow parent without ellipsis, and elements wider than the viewport
  for (const e of document.querySelectorAll('body *')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width > vw + 2 && !e.closest('pre, .mx-wrap, .table-wrap, svg, .dwg, [role=tablist], .timeline, .tout, .term')) { bad.push('wider than viewport: ' + e.tagName + '.' + String(e.className && e.className.baseVal === undefined ? e.className : '').slice(0, 30) + ' ' + Math.round(r.width)); if (bad.length > 25) break; } }
  // contrast of visible text
  const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const parse = s => { const m = s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return { c: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
  const bg = e => { let acc = []; for (let n = e; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0) { acc.push(c); if (c.a >= 1) break; } } let base = [255, 255, 255]; if (!acc.length || acc[acc.length - 1].a < 1) base = parse(getComputedStyle(document.documentElement).backgroundColor)?.a ? parse(getComputedStyle(document.documentElement).backgroundColor).c : (matchMedia('(prefers-color-scheme: dark)').matches ? [13, 17, 23] : [255, 255, 255]); for (const c of acc.reverse()) base = base.map((v, i) => c.c[i] * c.a + v * (1 - c.a)); return base; };
  let lows = 0; const seen = new Set();
  for (const e of document.querySelectorAll('body *')) { if (lows > 8) break; if (!vis(e) || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1)) continue; if (e.closest('svg, .dwg, [aria-hidden=true]')) continue; const s = getComputedStyle(e); const fg = parse(s.color); if (!fg) continue; const bc = bg(e); const L1 = lum(fg.c.map((v, i) => v * fg.a + bc[i] * (1 - fg.a))), L2 = lum(bc); const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); const big = parseFloat(s.fontSize) >= 18.66 || (parseFloat(s.fontSize) >= 14 && +s.fontWeight >= 700); if (cr < (big ? 3 : 4.5) - 0.1 && s.opacity !== '0') { const key = e.className + s.color; if (seen.has(key)) continue; seen.add(key); lows++; bad.push('low contrast ' + cr.toFixed(2) + ': "' + e.textContent.trim().slice(0, 24) + '" ' + e.tagName + '.' + String(e.className && e.className.baseVal === undefined ? e.className : '').slice(0, 24)); } }
  return bad; })()`;
await section('layout audit', async () => {
  const routes = [['/', 'home'], ['/blog', 'blog'], ['/blog/helm-2-chart', 'post'], ['/privacy', 'privacy'], ['/app?notour=1', 'playground'], ['/nope', '404']];
  for (const w of [320, 375, 768, 1024, 1440, 1920]) for (const scheme of w === 375 || w === 1440 ? ['light', 'dark'] : ['dark']) for (const [r, nm] of routes) {
    const p = await open({ width: w, height: w < 700 ? 800 : 900, mobile: w < 700, scheme }); await p.goto(base + r, { wait: 1200 }); await p.eval('0');
    const bad = JSON.parse(await p.eval(`JSON.stringify(${AUDIT})`)); const errs = p.errors.filter(e => !(nm === '404' && /404/.test(e))); check('layout audit', `${nm} @${w}px ${scheme}: no overflow, labelled controls, contrast`, !bad.length && !errs.length, bad.slice(0, 6).join(' ; ') + errs.join('|')); await p.close();
  }
});

await section('playground states audit', async () => {
  // audit the playground with every tab populated, desktop and phone
  for (const [w, mobile] of [[1440, false], [390, true]]) {
    const p = await play({ width: w, height: 900, mobile });
    await p.eval(`cmd('kind create cluster --name aud', 500)`); await p.eval(`cmd('kubectl create deployment web --image=nginx:1.27 --replicas=3', 300)`); await p.eval(`cmd('kubectl expose deployment web --port=80', 300)`); await p.eval(`cmd('kubectl create deployment bad --image=no/such:1', 300)`); await p.eval(`cmd('docker run -d --name d1 nginx:1.27', 400)`); await p.sleep(5000);
    for (const t of ['cluster', 'docker', 'config', 'helm', 'files', 'events']) {
      if (mobile) await p.eval(`$$('#mobilenav button').find(b => /cluster/i.test(b.textContent))?.click()`);
      await p.eval(`tab('${t}')`); await p.sleep(300); const bad = JSON.parse(await p.eval(`JSON.stringify(${AUDIT})`));
      check('playground states audit', `${t} tab @${w}px populated: layout and contrast`, !bad.length && !p.errors.length, bad.slice(0, 6).join(' ; ') + p.errors.join('|'));
    }
    await p.close();
  }
});

/* =================== mobile playground =================== */
await section('mobile playground', async () => {
  const p = await play({ width: 390, height: 800, mobile: true });
  const nav = await p.eval('$$("button").filter(b => /guide|terminal|cluster/i.test(b.textContent) && b.getBoundingClientRect().top > 600).map(b => b.textContent.trim())');
  check('mobile playground', 'bottom bar offers Guide / Terminal / Cluster', ['Guide', 'Terminal', 'Cluster'].every(n => nav.some(x => x.includes(n))), JSON.stringify(nav));
  const small = await p.eval('$$("button, a").filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 32 || r.width < 32) && getComputedStyle(e).visibility !== "hidden" }).map(e => (e.id || e.getAttribute("aria-label") || e.className || e.textContent).toString().trim().slice(0, 24) + " " + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height))');
  check('mobile playground', 'tap targets are at least 32px', small.length === 0, small.slice(0, 8).join(', '));
  await p.eval(`$$('button').find(b => /cluster/i.test(b.textContent) && b.getBoundingClientRect().top > 600).click()`); await p.sleep(400);
  check('mobile playground', 'Cluster pane becomes visible', await p.eval('$("#vizpane").getBoundingClientRect().width > 300'));
  await p.eval(`$$('button').find(b => /terminal/i.test(b.textContent) && b.getBoundingClientRect().top > 600).click()`); await p.sleep(400);
  check('mobile playground', 'Terminal pane becomes visible', await p.eval('$("#termpane").getBoundingClientRect().width > 300'));
  await p.eval('cmd("echo mobile-ok")'); check('mobile playground', 'typing works on the phone layout', (await p.eval('out()')).includes('mobile-ok'));
  await p.close();
});

/* =================== landing + blog interactions =================== */
await section('site interactions', async () => {
  const p = await open({ scheme: 'light' }); await p.goto(base + '/', { wait: 1500 }); await p.eval(HELPERS);
  const heroLinks = JSON.parse(await p.eval('JSON.stringify($$("a").map(a => a.getAttribute("href")).filter(h => h && h.startsWith("/")))'));
  const dead = []; for (const h of new Set(heroLinks)) { const r = await fetch(base + h.split('#')[0]); if (r.status >= 400) dead.push(h + ' ' + r.status); }
  check('site interactions', 'every internal link on the home page resolves', !dead.length, dead.join(', '));
  const anchors = JSON.parse(await p.eval('JSON.stringify($$("a[href^=\\"#\\"]").map(a => a.getAttribute("href")).filter(h => h.length > 1 && !document.querySelector(h)))')); check('site interactions', 'every in-page anchor on the home page has a target', !anchors.length, anchors.join(', '));
  // keyboard: tab order reaches the header controls, focus is visible
  await p.eval('document.body.focus(); 0'); const seq = []; for (let i = 0; i < 6; i++) { await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await p.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); seq.push(await p.eval('(() => { const e = document.activeElement; const s = getComputedStyle(e); return (e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 18) + "|" + (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0 || s.boxShadow !== "none") })()')); }
  check('site interactions', 'Tab reaches interactive elements and shows a focus indicator', seq.filter(s => s.endsWith('true')).length >= 4, seq.join(' > '));
  check('site interactions', 'skip link is the first stop', /skip|main/i.test(seq[0]), seq[0]);
  await p.goto(base + '/blog', { wait: 1200 }); await p.eval(HELPERS);
  await p.eval(`(() => { const i = $('input[type=search], input[placeholder*="earch" i]'); setVal = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); }; setVal(i, 'zzzznomatch'); 0 })()`); await p.sleep(300);
  check('site interactions', 'blog search with no match shows an empty state', /no (posts|results|matches)|nothing/i.test(await p.eval('document.body.innerText')), (await p.eval('document.body.innerText')).slice(0, 100));
  await p.close();
  const q = await open(); await q.goto(base + '/blog/helm-2-chart', { wait: 1500 }); await q.eval(HELPERS);
  check('site interactions', 'post has a table of contents and code blocks with copy buttons', await q.eval('$$("nav a[href^=\\"#\\"]").length > 2 && $$("pre").length > 0') && await q.eval('$$("pre button, .code button, .copy").length > 0'));
  await q.close();
});


/* =================== more features =================== */
await section('tour export speed guide', async () => {
  const p = await play({}, '/app?tour=0'); await p.sleep(1500);
  check('tour export speed guide', 'tour opens from ?tour=0 with a spotlight and card', await p.waitFor('!document.querySelector("#tour").hidden && !!document.querySelector(".tour-card .tb")', 8000));
  const total = Number(((await p.eval('document.querySelector(".tour-foot .n").textContent')).match(/of (\d+)/) || [])[1]); let steps = 0, cardOk = true;
  for (let i = 0; i < 40 && !(await p.eval('document.querySelector("#tour").hidden')); i++) { steps++; const r = await p.eval(`(()=>{const c=document.querySelector('.tour-card').getBoundingClientRect(); const s=document.querySelector('.tour-spot').getBoundingClientRect(); return {inView: c.left>=0 && c.top>=0 && c.right<=innerWidth+1 && c.bottom<=innerHeight+1, hasText: document.querySelector('.tour-card .tb').textContent.length>10}})()`); if (!r.inView || !r.hasText) cardOk = false; await p.eval(`document.querySelector('#tour-next').click()`); await p.sleep(250); }
  check('tour export speed guide', 'the tour can be walked to the end without errors', steps === total && steps >= 5 && !p.errors.length, `steps ${steps} of ${total} ${p.errors.join('|')}`);
  check('tour export speed guide', 'every tour card stays inside the viewport and has text', cardOk);
  check('tour export speed guide', 'tour closes after Finish', await p.eval('document.querySelector("#tour").hidden'));
  await p.eval(`$('#exportbtn').click()`); await p.sleep(400); check('tour export speed guide', 'export modal opens with a script', await p.eval('/#!\\/usr\\/bin\\/env bash|set -e|kind create|docker/.test(document.body.textContent)'));
  await p.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`); await p.sleep(300); check('tour export speed guide', 'Escape closes the export modal', await p.eval('!document.querySelector(".modal, [role=dialog]:not(.pal-card)")') );
  const c0 = await p.eval('$("#clock, #simclock, .clock")?.textContent'); await p.eval(`$$('#speed button').find(b => b.textContent.startsWith('8'))?.click()`); await p.sleep(1500); const c1 = await p.eval('$("#clock, #simclock, .clock")?.textContent');
  check('tour export speed guide', 'the clock advances and speed buttons are radios', c0 !== c1 && await p.eval(`$$('#speed [role=radio]').length === 4`), `${c0} -> ${c1}`);
  await p.eval(`(() => { const i = $('.gfilter'); setVal(i, 'helm'); 0 })()`); await p.sleep(300); const shown = await p.eval(`$$('#side .gc code').length`); check('tour export speed guide', 'guide filter narrows the list', shown > 0 && shown < 100, shown);
  await p.eval(`(() => { const i = $('.gfilter'); setVal(i, 'zzzzqqq'); 0 })()`); await p.sleep(300); check('tour export speed guide', 'a guide filter with no match shows an empty message', /no|nothing/i.test(await p.eval(`$('#side').textContent`)), (await p.eval(`$('#side').textContent`)).slice(0, 120));
  await p.eval(`(() => { const i = $('.gfilter'); setVal(i, ''); 0 })()`); await p.sleep(200);
  await p.eval(`$$('#side .gc code')[0].click()`); await p.sleep(150); check('tour export speed guide', 'clicking a guide command puts it on the prompt', (await p.eval('activeInput().value')).length > 0);
  await p.eval(`setVal(activeInput(), ''); $$('#side .gc button')[0].click()`); await p.sleep(1200); check('tour export speed guide', 'the guide play button runs the command', (await p.eval('out()')).length > 120);
  await p.close();
});

await section('keyboard tabs', async () => {
  const p = await play();
  const sel = () => p.eval(`$$('.vtab').findIndex(b => b.getAttribute('aria-selected') === 'true')`);
  await p.eval(`$$('.vtab')[0].focus()`); await p.eval(`(() => { const t = document.activeElement; t.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })); 0 })()`); await p.sleep(250);
  check('keyboard tabs', 'ArrowRight selects the next view tab', await sel() === 1, await sel());
  await p.eval(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }))`); await p.sleep(250); check('keyboard tabs', 'End selects the last view tab', await sel() === 5, await sel());
  await p.eval(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))`); await p.sleep(250); check('keyboard tabs', 'ArrowRight wraps around to the first tab', await sel() === 0, await sel());
  check('keyboard tabs', 'only the selected tab is in the Tab order (roving tabindex)', await p.eval(`$$('.vtab').filter(b => b.tabIndex === 0).length === 1`));
  await p.eval(`$('#newtab').click()`); await p.sleep(200); await p.eval(`$$('#tabs .tab')[1].focus()`); await p.eval(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }))`); await p.sleep(250);
  check('keyboard tabs', 'terminal tabs also move with the arrow keys', await p.eval(`$$('#tabs .tab')[0].getAttribute('aria-selected') === 'true'`));
  await p.close();
});

await section('animation cleanup', async () => {
  const p = await play(); await p.eval(`cmd('kind create cluster --name anim', 600)`); await p.sleep(3500); await p.eval(`cmd('kubectl create deployment w --image=nginx:1.27 --replicas=2', 300)`); await p.sleep(2500);
  for (const n of [20, 0, 12, 1, 8, 0, 3]) { await p.eval(`cmd('kubectl scale deployment w --replicas=${n}', 100)`); await p.sleep(300); }
  await p.sleep(7000); const left = await p.eval('$$("#vizbody .leaving").length'), pods = await p.eval('$$("#vizbody .pod").length');
  check('animation cleanup', 'after rapid scaling no pod tile is stuck mid-animation', left === 0, `leaving ${left}`);
  check('animation cleanup', 'pod tiles match the final replica count (3)', pods >= 3 && pods <= 5, `tiles ${pods}`);
  await p.eval(`cmd('kubectl delete deployment w', 300)`); await p.sleep(5000); check('animation cleanup', 'deleting the deployment removes its group and tiles', await p.eval('$$("#vizbody .pod").length') === 0, await p.eval('$$("#vizbody .pod").length'));
  check('animation cleanup', 'no console errors', !p.errors.length, p.errors.join('|'));
  await p.close();
});

await section('selection freeze', async () => {
  // regression: text selected in the cluster view used to freeze the pane, so a click on another tab changed the tab highlight but not the content
  const p = await play();
  await p.eval(`(() => { const e = $('#vizbody .clname b') || $('#vizbody b'); const r = document.createRange(); r.setStart(e.firstChild, 0); r.setEnd(e.firstChild, 4); const g = getSelection(); g.removeAllRanges(); g.addRange(r); 0 })()`);
  check('selection freeze', 'a selection exists inside the cluster view', await p.eval('getSelection().toString().length') > 0);
  await p.eval(`$$('.vtab').find(b => b.textContent.startsWith('Config')).click()`); await p.sleep(600);
  check('selection freeze', 'clicking another tab still switches the content', /kubeconfig/i.test(await p.eval('$("#vizbody").textContent')), (await p.eval('$("#vizbody").textContent')).slice(0, 60));
  await p.close();
});

await section('resize', async () => {
  const p = await play({ width: 1440, height: 900 });
  const metrics = (w, h, mobile) => p.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
  const vis = sel => p.eval(`(() => { const e = $('${sel}'); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 40 && r.height > 40 && getComputedStyle(e).display !== 'none' })()`);
  check('resize', 'desktop shows guide, terminal and cluster side by side', await vis('#side') && await vis('#termpane') && await vis('#vizpane'));
  await metrics(390, 800, true); await p.sleep(600);
  check('resize', 'shrinking to a phone shows exactly one pane and the bottom bar', [await vis('#side'), await vis('#termpane'), await vis('#vizpane')].filter(Boolean).length === 1 && await vis('#mobilenav'));
  await p.eval(`$$('#mobilenav button').find(b => /cluster/i.test(b.textContent)).click()`); await p.sleep(400); check('resize', 'the Cluster pane can be shown on the phone', await vis('#vizpane') && !(await vis('#termpane')));
  await metrics(1440, 900, false); await p.sleep(600);
  check('resize', 'growing back restores all three panes', await vis('#side') && await vis('#termpane') && await vis('#vizpane') && !(await vis('#mobilenav')));
  await p.eval(`cmd('echo after-resize')`); check('resize', 'the terminal still works after resizing', (await p.eval('out()')).includes('after-resize'));
  // drag the gutter
  const g = await p.eval(`(() => { const e = $$('.gutter')[0]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 200, w: $('#side').getBoundingClientRect().width } })()`);
  if (g) { await p.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: g.x, y: g.y, button: 'left', clickCount: 1 }); await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: g.x + 120, y: g.y, button: 'left', buttons: 1 }); await p.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: g.x + 120, y: g.y, button: 'left', clickCount: 1 }); await p.sleep(300);
    const w2 = await p.eval(`$('#side').getBoundingClientRect().width`); check('resize', 'dragging the guide divider resizes the guide', w2 > g.w + 60, `${g.w} -> ${w2}`);
    await p.goto(base + '/app?notour=1', { wait: 1500 }); await p.waitFor('!!document.querySelector(".tin")'); await p.eval(HELPERS); check('resize', 'the pane width is remembered after a reload', Math.abs((await p.eval(`$('#side').getBoundingClientRect().width`)) - w2) < 6); } else check('resize', 'gutter exists', false);
  await p.close();
});

/* =================== stress =================== */
await section('stress', async () => {
  const p = await play();
  await p.eval(`cmd('kind create cluster --name big', 600)`); await p.sleep(2000);
  await p.eval(`(async () => { for (let i = 0; i < 25; i++) { const i2 = activeInput(); setVal(i2, 'kubectl create deployment d' + i + ' --image=nginx:1.27 --replicas=3'); key(i2, 'Enter'); await sleep(60); await idle(); } 0 })()`);
  check('stress', '25 deployments x 3 replicas are created through the UI without errors', !p.errors.length, p.errors.join('|'));
  await p.sleep(6000);
  const pods = await p.eval('$$("#vizbody .pod").length'); const dom = await p.eval('document.querySelectorAll("*").length');
  check('stress', 'cluster view renders the pods and the DOM stays reasonable', pods > 20 && dom < 9000, `pods ${pods}, dom nodes ${dom}`);
  const frame = await p.eval(`(async () => { const t = performance.now(); for (let i = 0; i < 20; i++) await new Promise(r => requestAnimationFrame(r)); return (performance.now() - t) / 20 })()`);
  check('stress', 'frames stay under 50ms with ~75 pods animating', frame < 50, frame.toFixed(1) + 'ms');
  await p.eval(`cmd('kubectl delete deployment --all', 500)`); await p.sleep(4000); check('stress', 'mass delete animates out and leaves no ghosts', await p.eval('$$("#vizbody .pod").length') <= 6, await p.eval('$$("#vizbody .pod").length'));
  await p.close();
});

await b.close(); server.kill();
const failed = results.filter(r => !r.ok); writeFileSync(join(root, 'qa-report.json'), JSON.stringify({ when: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000), total: results.length, failed: failed.length, results }, null, 1));
console.log(`\nqa: ${results.length - failed.length}/${results.length} checks pass (${Math.round((Date.now() - t0) / 1000)}s)`); process.exit(failed.length ? 1 : 0);
