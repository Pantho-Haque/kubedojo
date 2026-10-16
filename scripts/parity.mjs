// Dev tool: renders the same scenarios in the ORIGINAL single-file prototype and in this React build (headless Chrome,
// Math.random seeded) and diffs the resulting DOM structure of every panel. usage: node scripts/parity.mjs [scenario-name]
//   needs: a production build (npm run build), Google Chrome, and the prototype at ../k8s-playground.html
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
const execFileP = promisify(execFile);
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ORIGINAL = join(root, '..', 'k8s-playground.html');
const tmp = '/tmp/kd-parity'; rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });

// seeded Math.random + a collector that writes a structural signature of every panel into <pre id="__sig">
const probe = `<script>(function(){var s=12345;Math.random=function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function vol(t){return t.replace(/K8s Playground|KubeDojo/g,'APP').replace(/([-·])[bcdfghjklmnpqrstvwxz2456789]{5}(?![a-z0-9])/g,'$1XXXXX').replace(/\\b\\d+(s|m|h|d)\\b/g,'N').replace(/sim time \\d\\d:\\d\\d:\\d\\d/,'sim time T').replace(/:3\\d{4}\\//g,':NODEPORT/').replace(/:\\d{5}\\b/g,':PORT').replace(/\\b[0-9a-f]{12,64}\\b/g,'HEX').replace(/\\b\\d+ (seconds?|minutes?|hours?)\\b/g,'N $1').replace(/\\(\\d+\\.\\d+ ?(s|ms)\\)/g,'(T)')}
function sig(el){var out=[];(function walk(n,d){if(n.nodeType===3){var t=n.textContent.replace(/\\s+/g,' ').trim();if(t)out.push(d+'#'+vol(t));return}if(n.nodeType!==1)return;if(n.id==='__sig')return;if(n.tagName==='A'&&n.className==='brand'){for(var k=0;k<n.childNodes.length;k++)walk(n.childNodes[k],d);return}var cls=[].slice.call(n.classList).sort().join('.');var at=['title','id','type','placeholder','spellcheck'].filter(function(a){return n.hasAttribute(a)}).map(function(a){return a+'='+vol(n.getAttribute(a))}).join(' ');var st=n.getAttribute('style')?'|'+n.style.cssText:'';if(n.hidden)at+=' hidden';out.push(d+n.tagName.toLowerCase()+(cls?'.'+cls:'')+(at?' ['+at+']':'')+st);for(var i=0;i<n.childNodes.length;i++)walk(n.childNodes[i],d+' ')})(el,'');return out.join('\\n')}
setTimeout(function(){document.body.normalize();var parts=['header','#side','#termpane','#vizbody','#insp'].map(function(q){var e=document.querySelector(q);return '=== '+q+'\\n'+(e?sig(e):'(missing)')});var pre=document.createElement('pre');pre.id='__sig';pre.textContent=parts.join('\\n');document.body.appendChild(pre)},__WAIT__)})()</script>`;

let profile = 0;
async function render(url, wait) { // returns the signature text
  let out = ''; try { out = (await execFileP(CHROME, ['--headless=new', '--disable-gpu', '--window-size=1700,1000', `--user-data-dir=${tmp}/prof-${profile++}`, `--virtual-time-budget=${wait + 3000}`, '--dump-dom', url], { maxBuffer: 1 << 28, timeout: 90000 })).stdout.toString(); } catch (e) { out = String(e.stdout || ''); } // Chrome sometimes dies at teardown after printing the DOM
  const m = /<pre id="__sig">([\s\S]*?)<\/pre>/.exec(out); if (!m) return '(no signature)';
  return m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}

// patched copies
const WAIT = 22000; const p = probe.replace('__WAIT__', String(WAIT));
let html = readFileSync(ORIGINAL, 'utf8'); html = html.replace('<head>', '<head>' + p); writeFileSync(join(tmp, 'original.html'), html);
cpSync(join(root, 'dist'), join(tmp, 'react'), { recursive: true }); rmSync(join(tmp, 'react/_headers'), { force: true }); // no CSP: the probe is an inline script
let idx = readFileSync(join(tmp, 'react/app/index.html'), 'utf8'); idx = idx.replace('<head>', '<head>' + p); writeFileSync(join(tmp, 'react/app/index.html'), idx);
const server = spawn('node', [join(root, 'scripts/serve.mjs'), '4175', join(tmp, 'react')], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));

const NEW = ['kind create cluster --name local-cluster-1', 'kubectl create namespace web', 'kubectl create deployment web --image=nginx:1.27 --replicas=3 -n web', 'kubectl expose deployment web --port=80 -n web --type=NodePort', 3];
const SCENARIOS = {
  initial: { cmds: [], tab: 'cluster' },
  'initial-config': { cmds: [], tab: 'config' },
  'initial-helm': { cmds: [], tab: 'helm' },
  'initial-files': { cmds: [], tab: 'files' },
  'initial-events': { cmds: [], tab: 'log' },
  kind: { cmds: [...NEW, 'kubectl get pods -A -o wide', 'kubectl get svc -n web'], tab: 'cluster' },
  'kind-docker': { cmds: [...NEW, 'docker ps', 'docker run -d --name x -p 8080:80 nginx:1.27'], tab: 'docker' },
  failures: { cmds: [...NEW, 'kubectl create deployment bad --image=nope/missing:1 -n web', 'kubectl run boom --image=busybox -n web -- sh -c "exit 1"', 8, 'kubectl get pods -n web'], tab: 'cluster' },
  rbac: { cmds: [...NEW, 'kubectl create serviceaccount dev -n web', 'kubectl create role r --verb=get --resource=pods -n web', 'kubectl create rolebinding rb --role=r --serviceaccount=web:dev -n web', 'kubectl auth can-i get pods --as=system:serviceaccount:web:dev -n web'], tab: 'config' },
  helm: { cmds: [...NEW, 'kubectl -n kube-system create serviceaccount tiller', 'kubectl create clusterrolebinding tiller --clusterrole=cluster-admin --serviceaccount=kube-system:tiller', 'helm2 init --service-account tiller', 12, 'helm2 install myapp --name demo --namespace web', 6, 'helm2 ls'], tab: 'helm' },
  shell: { cmds: ['ls -la ~', 'tree ~/myapp -L 1', 'cat ~/myapp/Chart.yaml | head -3', 'echo hi | tr a-z A-Z', 'for i in 1 2 3; do echo $i; done', 'mkdir -p ~/lab/a && cd ~/lab && ls -la'], tab: 'files' },
  exec: { cmds: [...NEW, 'kubectl exec -it deploy/web -n web -- sh', 'ps', 'ls /', 'exit'], tab: 'cluster' },
};
const only = process.argv[2]; let bad = 0;
async function check([name, sc]) {
  const run = encodeURIComponent(JSON.stringify(sc.cmds));
  const a = await render('file://' + join(tmp, 'original.html') + `#notour&tab=${sc.tab}${sc.cmds.length ? '&run=' + run : ''}`, WAIT);
  const b = await render(`http://localhost:4175/app?notour=1&tab=${sc.tab}${sc.cmds.length ? '&run=' + run : ''}`, WAIT);
  if (a === b) { console.log('PASS', name, `(${a.split('\n').length} nodes compared)`); return; }
  bad++; const al = a.split('\n'), bl = b.split('\n'); let shown = 0; console.log('DIFF', name, `(original ${al.length} lines, react ${bl.length})`);
  writeFileSync(join(tmp, name + '.orig.txt'), a); writeFileSync(join(tmp, name + '.react.txt'), b);
  for (let i = 0, j = 0; (i < al.length || j < bl.length) && shown < 14; i++, j++) if (al[i] !== bl[j]) { console.log('  orig :', (al[i] || '').slice(0, 170)); console.log('  react:', (bl[j] || '').slice(0, 170)); shown++; }
}
const todo = Object.entries(SCENARIOS).filter(([n]) => !only || only === n); const pool = 1;
await Promise.all(Array.from({ length: pool }, async () => { while (todo.length) await check(todo.shift()); }));
server.kill(); console.log(bad ? bad + ' scenario(s) differ' : 'all scenarios identical');
