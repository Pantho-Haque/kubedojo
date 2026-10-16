// Dev tool: drives the built React app in headless Chrome with synthetic mouse/keyboard events and checks the behaviours
// that the DOM-parity scenarios cannot see (typing, suggestions, history, vi, tour, export, files, tabs, inspector, reset…).
//   usage: npm run build && node scripts/ui-test.mjs [--original]     (--original runs the same steps against ../k8s-playground.html)
import { execFile, spawn } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
const execFileP = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const original = process.argv.includes('--original');
const tmp = '/tmp/kd-ui'; rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });

const steps = String.raw`
const sleep = ms => new Promise(r => setTimeout(r, ms));
const $ = (s, el) => (el || document).querySelector(s), $$ = (s, el) => [...(el || document).querySelectorAll(s)];
const ok = (name, cond, extra) => results.push((cond ? 'ok   ' : 'FAIL ') + name + (cond ? '' : '  ' + (extra || '')));
const setVal = (el, v) => { const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
const activeInput = () => $$('.tin').find(i => i.closest('.term').style.display !== 'none');
const key = (el, k, o = {}) => { const e = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...o }); el.dispatchEvent(e); return e; };
const typeCmd = async (t) => { const i = activeInput(); i.focus(); setVal(i, t); await sleep(30); };
const run = async (t, wait = 400) => { await typeCmd(t); key(activeInput(), 'Enter'); await sleep(wait); await idle(); };
const outText = () => $$('.tout').filter(o => o.closest('.term').style.display !== 'none').map(o => o.textContent).join('');
const ghost = () => { const g = $$('.ghost').find(x => x.closest('.term').style.display !== 'none'); return g ? g.textContent : ''; };
const until = async (fn, ms = 20000) => { const t0 = Date.now(); for (let i = 0; i < ms / 100; i++) { if (fn()) return true; await sleep(100); } return false; };
const idle = () => until(() => !$$('.tline.busy').length, 30000);
const clickEl = el => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); };
await sleep(800);
// ---- terminal basics
await run('echo hello-world'); ok('echo prints', /hello-world/.test(outText()));
await run('kind create cluster --name t1', 300); await idle(); ok('kind creates a cluster (context badge)', /kind-t1/.test($('#ctxbadge').textContent), $('#ctxbadge').textContent);
// ---- ghost suggestion, Tab, Alt+Right
await typeCmd('kubectl get po'); await sleep(50); ok('ghost suggests from guide', /kubectl get pods/.test(ghost()), ghost());
key(activeInput(), 'ArrowRight', { altKey: true }); await sleep(30); ok('Option+Right accepts one word', /^kubectl get pods$/.test(activeInput().value), activeInput().value);
key(activeInput(), 'Tab'); await sleep(30); ok('Tab accepts the rest of the suggestion', activeInput().value.length > 'kubectl get pods'.length, activeInput().value);
setVal(activeInput(), ''); await sleep(20);
// ---- history
await run('echo one'); await run('echo two'); key(activeInput(), 'ArrowUp'); await sleep(20); ok('ArrowUp recalls last command', activeInput().value === 'echo two', activeInput().value); key(activeInput(), 'ArrowUp'); await sleep(20); ok('ArrowUp again', activeInput().value === 'echo one'); key(activeInput(), 'ArrowDown'); key(activeInput(), 'ArrowDown'); await sleep(20); ok('ArrowDown clears at the end', activeInput().value === '');
ok('suggestion from history', (await (async () => { await typeCmd('echo t'); await sleep(30); return /echo two/.test(ghost()); })()), ghost()); setVal(activeInput(), '');
// ---- Tab completion + clear
await typeCmd('kubectl cre'); key(activeInput(), 'Tab'); await sleep(30); ok('Tab completes a kubectl verb (via suggestion or completion)', /^kubectl cre/.test(activeInput().value) && activeInput().value.length >= 'kubectl cre'.length); setVal(activeInput(), '');
await run('echo to-be-cleared'); key(activeInput(), 'l', { ctrlKey: true }); await sleep(50); ok('Ctrl-L clears', !/to-be-cleared/.test(outText()));
await run('echo again'); await run('clear'); ok('clear command clears', !/again/.test(outText()));
// ---- ctrl-c on a running command
await typeCmd('sleep 5'); key(activeInput(), 'Enter'); await sleep(100); key(activeInput(), 'c', { ctrlKey: true }); await sleep(300); ok('Ctrl-C prints ^C', /\^C/.test(outText()));
// ---- deploy + cluster view
await run('kubectl create namespace web'); await run('kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web', 600); await run('kubectl expose deployment web --port=80 -n web', 600); await sleep(2500);
ok('pod chips render', $$('#vizbody .pod').length >= 2, String($$('#vizbody .pod').length)); ok('service card renders', $$('#vizbody .svc').length >= 1);
// ---- inspector
const chip = $('#vizbody .pod'); if (chip) { clickEl(chip); await sleep(100); ok('clicking a pod opens the inspector', !!$('#insp .insp') && /Pod/.test($('#insp .ih').textContent), $('#insp').textContent.slice(0, 60)); const yb = $$('#insp .ih button').find(b => b.textContent === 'yaml'); clickEl(yb); await sleep(60); ok('inspector yaml mode', /apiVersion: v1/.test($('#insp pre').textContent)); clickEl($('#insp .close')); await sleep(60); ok('inspector closes', !$('#insp .insp')); }
// service hover highlight
const svc = $('#vizbody .svc'); if (svc) { svc.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); svc.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false })); await sleep(80); ok('hover on a Service lights its pods', $$('#vizbody .pod.hl').length >= 1, String($$('#vizbody .pod.hl').length)); }
// namespace chips + system toggle
const chipNs = $$('#vizbody .nschip').find(c => c.textContent === 'web'); if (chipNs) { clickEl(chipNs); await sleep(700); ok('namespace chip hides pods', $$('#vizbody .pod').length === 0); clickEl($$('#vizbody .nschip').find(c => c.textContent === 'web')); await sleep(200); }
const ss = $('#showsys'); ss.click(); await sleep(80); ok('system namespaces toggle shows kube-system chip', $$('#vizbody .nschip').some(c => c.textContent === 'kube-system')); $('#showsys').click(); await sleep(60);
// ---- other tabs
for (const [t, re] of [['docker', /Containers/], ['config', /kubeconfig/], ['helm', /Tiller/], ['files', /click a file to edit/], ['log', /Events/]]) { clickEl($$('.vtab').find(b => b.textContent.toLowerCase().startsWith(t === 'log' ? 'events' : t))); await sleep(120); ok('tab ' + t, re.test($('#vizbody').textContent)); }
// ---- files + editor
clickEl($$('.vtab').find(b => b.textContent === 'Files')); await sleep(150); clickEl($('#vizbody .f')); await sleep(100); ok('files: opening a file shows the editor with line numbers', !!$('#fta') && $('#fgut').textContent.length > 0);
const f = $$('#vizbody .f').find(x => /Chart\.yaml/.test(x.textContent)); clickEl(f); await sleep(100);
ok('editor shows coloured output', $('#fhl .hk') != null);
setVal($('#fta'), 'name: edited\n'); await sleep(60); clickEl($('#savefile')); await sleep(100); ok('Save writes the file', /saved/.test($('#savemsg').textContent));
await run('cat ~/myapp/Chart.yaml'); ok('saved content visible to the shell', /name: edited/.test(outText()), outText().slice(-80));
// new file
setVal($('#newfile'), '~/brand-new.yaml'); clickEl($('#mkfile')); await sleep(100); ok('+ creates and opens a new file', /brand-new/.test($('.fh b').textContent));
clickEl($('#rmfile')); await sleep(100); ok('Delete removes the file', !$$('#vizbody .f').some(x => /brand-new/.test(x.textContent)));
// persistence
await sleep(500); ok('files persist to localStorage', (localStorage.getItem('k8s-playground:fs:v1') || '').includes('name: edited'));
// ---- vi
clickEl($$('.vtab')[0]); await run('vi viTest.txt', 300); ok('vi overlay opens', !!$('.vi') && $('.vi').style.display !== 'none');
const vi = $('.vi'); const vk = (k, o) => { key(vi, k, o); }; for (const k of ['i', 'h', 'e', 'l', 'l', 'o', 'Escape', ':', 'w', 'q', 'Enter']) { vk(k); await sleep(5); } await sleep(150);
ok('vi closes after :wq', !$('.vi')); await run('cat viTest.txt'); ok('vi saved the file', /hello/.test(outText()), outText().slice(-60));
// ---- tabs
clickEl($('#newtab')); await sleep(150); ok('new terminal tab', $$('#tabs .tab').length === 2); await run('echo in-tab-2'); ok('second tab runs commands', /in-tab-2/.test(outText()));
clickEl($$('#tabs .tab')[0]); await sleep(100); ok('switching back shows tab 1 output', !/in-tab-2/.test(outText()) );
clickEl($$('#tabs .tab .x')[0]); await sleep(150); ok('closing the tab', $$('#tabs .tab').length === 1);
// ---- exec shell prompt
await run('kubectl exec -it deploy/web -n web -- sh', 900); ok('exec opens a pod shell prompt', /root@/.test($('.term .tline .prompt').textContent) || $$('.tline .prompt').some(p => /root@/.test(p.textContent)), $$('.tline .prompt').map(p => p.textContent).join('|')); await run('ps', 300); ok('ps inside the pod', /PID/.test(outText())); await run('exit', 300); ok('exit returns to the playground prompt', $$('.tline .prompt').some(p => /user@playground/.test(p.textContent)));
// ---- kubectl edit banner
await typeCmd('kubectl edit deployment web -n web'); key(activeInput(), 'Enter'); await sleep(900); ok('kubectl edit shows the banner', !$('#editbar').hidden && /kubectl edit/.test($('#editbar').textContent), $('#editbar').textContent.slice(0, 50));
const cancel = $('#ed-cancel'); if (cancel) { clickEl(cancel); await sleep(700); ok('Cancel hides the banner', $('#editbar').hidden); }
// ---- delete button fills the prompt
clickEl($('.cldel')); await sleep(80); ok('delete button puts the command on the prompt', /kind delete cluster --name t1/.test(activeInput().value), activeInput().value); setVal(activeInput(), '');
// ---- guide
const code = $$('#guide code').find(c => c.textContent === 'kubectl config current-context'); clickEl(code); await sleep(60); ok('guide click puts the command on the prompt', activeInput().value === 'kubectl config current-context'); setVal(activeInput(), '');
const runBtn = code.parentElement.querySelector('.run'); clickEl(runBtn); await sleep(400); ok('guide ▶ runs the command', /kind-t1|gke_/.test(outText()));
clickEl($('#sidebtn')); await sleep(60); ok('sidebar toggles', ($('.pg-root') || document.body).classList.contains('noside')); clickEl($('#sidebtn'));
// ---- speed select + clock
clickEl($$('#speed button').find(b => b.textContent === '4×')); await sleep(80); ok('speed control', $$('#speed button').find(b => b.textContent === '4×').getAttribute('aria-checked') === 'true');
ok('clock shows', /\d\d:\d\d:\d\d/.test($('#clock').textContent));
// ---- command palette, guide filter, status bar, resizable panes
key(document, 'P', { ctrlKey: true, shiftKey: true }); await sleep(200); ok('Ctrl+Shift+P opens the command palette', !!$('#palette'));
{ const pi = $('#palette input'); setVal(pi, 'current-context'); await sleep(150); ok('palette filters the guide commands', $$('#pal-list li').length >= 1 && /current-context/.test($('#pal-list').textContent), $('#pal-list').textContent.slice(0, 80));
  key(pi, 'Enter'); await sleep(200); ok('Enter on a command puts it on the prompt and closes the palette', !$('#palette') && /current-context/.test(activeInput().value), activeInput().value); setVal(activeInput(), ''); }
{ setVal($('.gfilter'), 'helm2 init'); await sleep(150); const rows = $$('#guide .gi').length; ok('guide filter narrows the list', rows >= 1 && rows < 20, String(rows)); setVal($('.gfilter'), ''); await sleep(100); ok('clearing the filter restores the guide', $$('#guide .gi').length > 100); }
ok('status bar shows nodes and pod counts', /nodes/.test($('#statusbar').textContent) && /running/.test($('#statusbar').textContent) && /failing/.test($('#statusbar').textContent), $('#statusbar').textContent.slice(0, 80));
{ const g = $('.gutter.side'); const before = g.getAttribute('aria-valuenow'); g.focus(); key(g, 'ArrowRight'); key(g, 'ArrowRight'); await sleep(120); const after = $('.gutter.side').getAttribute('aria-valuenow'); ok('the guide divider resizes with the keyboard and remembers it', Number(after) === Number(before || 310) + 32 && /"side":342/.test(localStorage.getItem('kubedojo:layout') || ''), before + ' -> ' + after); }
// ---- tour
clickEl($('#tourbtn')); await sleep(400); ok('tour opens', !$('#tour').hidden && /1 of 11/.test($('#tour').textContent), $('#tour').textContent.slice(0, 40));
for (let i = 0; i < 3; i++) { clickEl($('#tour-next')); await sleep(300); } ok('tour advances', /4 of 11/.test($('#tour').textContent)); ok('tour spotlight positioned', $('.tour-spot').style.display === 'block');
clickEl($('#tour-back')); await sleep(200); ok('tour back', /3 of 11/.test($('#tour').textContent)); key(document.body, 'Escape'); await sleep(100); ok('Esc closes the tour', $('#tour').hidden); ok('tour seen flag saved', localStorage.getItem('k8s-playground:tour:v1') === '1');
// ---- export
clickEl($('#exportbtn')); await sleep(300); ok('export modal opens with a script', !!$('#export') && /#!\/usr\/bin\/env bash/.test($('#ex-ta').value) && /kind create cluster --name t1/.test($('#ex-ta').value), ($('#ex-ta') || {}).value && $('#ex-ta').value.slice(0, 60));
ok('export includes the deployment', /name: web/.test($('#ex-ta').value));
const tool = $('#ex-tool'); setVal(tool, 'k3d'); tool.dispatchEvent(new Event('change', { bubbles: true })); await sleep(150); ok('export switches to k3d', /k3d cluster create t1/.test($('#ex-ta').value), $('#ex-ta').value.slice(600, 700));
clickEl($('#ex-x')); await sleep(100); ok('export closes', !$('#export'));
// ---- reset
window.confirm = () => true; clickEl($('#resetbtn')); await sleep(600); ok('Reset starts a fresh world', /gke_prod/.test($('#ctxbadge').textContent) && $$('#tabs .tab').length === 1, $('#ctxbadge').textContent);
ok('Reset keeps files', (localStorage.getItem('k8s-playground:fs:v1') || '').includes('name: edited'));
`;

function patch(html) { // append the driver just before the LAST </body> (the prototype's own script contains the text "</body>")
  const driver = `<script>window.addEventListener('load',()=>setTimeout(async()=>{window.results=[];const results=window.results;try{${steps}}catch(e){results.push('CRASH '+e.stack)}const pre=document.createElement('pre');pre.id='__out';pre.textContent=results.join('\\n');document.body.appendChild(pre)},1200))</script>`;
  const i = html.lastIndexOf('</body>'); return html.slice(0, i) + driver + html.slice(i);
}
const server = original ? null : (cpSync(join(root, 'dist'), join(tmp, 'app'), { recursive: true }), rmSync(join(tmp, 'app/_headers'), { force: true }), spawn('node', [join(root, 'scripts/serve.mjs'), '4176', join(tmp, 'app')], { stdio: 'ignore' })); // no CSP: the driver is an inline script
let url;
if (original) { writeFileSync(join(tmp, 'o.html'), patch(readFileSync(join(root, '..', 'k8s-playground.html'), 'utf8'))); url = 'file://' + join(tmp, 'o.html') + '#notour'; }
else { const p = join(tmp, 'app/app/index.html'); writeFileSync(p, patch(readFileSync(p, 'utf8'))); url = 'http://localhost:4176/app?notour=1'; }
await new Promise(r => setTimeout(r, 700));
let out = ''; try { out = (await execFileP(CHROME, ['--headless=new', '--disable-gpu', '--window-size=1700,1000', `--user-data-dir=${tmp}/prof`, '--virtual-time-budget=60000', '--dump-dom', url], { maxBuffer: 1 << 28, timeout: 170000 })).stdout.toString(); } catch (e) { out = String(e.stdout || ''); }
if (server) server.kill();
const m = /<pre id="__out">([\s\S]*?)<\/pre>/.exec(out); const text = m ? m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"') : '(no result: the page did not finish)';
console.log(text); console.log(/FAIL|CRASH|no result/.test(text) ? 'UI TEST FAILED' : 'ui tests pass'); process.exit(/FAIL|CRASH|no result/.test(text) ? 1 : 0);
