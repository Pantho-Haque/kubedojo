// Runs the REAL simulator headlessly and records transcripts for the landing page, so every command and every line of output
// shown there is what the playground really prints. Writes src/landing/generated/demos.json.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const PG = require(join(root, 'tests/.engine.cjs')); PG.fast = true; PG.resetHook = async () => {};
Math.random = (() => { let s = 20241016; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })(); // stable output between builds

async function session(setup, steps, { exportScript } = {}) {
  const sim = new PG.Sim(); sim.start(2, 1); const out = []; const term = { print: t => out.push(t), clear() { }, cols: 100 };
  const sh = new PG.Shell(sim, term); sim.shells.push(sh);
  const run = async c => { out.length = 0; await sh.submit(c); return out.join('\n'); };
  for (const c of setup) await run(c);
  const lines = [];
  for (const st of steps) {
    const cmd = typeof st === 'string' ? st : st.cmd; const hidden = typeof st !== 'string' && st.hidden;
    const o = (await run(cmd)).replace(/\n$/, ''); if (hidden) continue;
    lines.push({ cmd: typeof st === 'string' ? st : (st.show || st.cmd), out: o.split('\n').filter((l, i, a) => !(i === a.length - 1 && l === '')) });
  }
  const script = exportScript ? PG.buildScript(sim, exportScript).script : null; sim.stop(); return { lines, script };
}
const KIND2 = ['cat > kind.yaml <<\'EOF\'', 'kind: Cluster', 'apiVersion: kind.x-k8s.io/v1alpha4', 'nodes:', '- role: control-plane', '- role: worker', '- role: worker', 'EOF', 'kind create cluster --name dojo --config kind.yaml > /dev/null'];
const cap = (lines, n) => lines.slice(0, n);
const trunc = s => (s.length > 118 ? s.slice(0, 117) + '…' : s);

const scenarios = [];
{ const r = await session(['kind create cluster --name dojo > /dev/null'], ['kubectl create deployment web --image=ngnix:1.27 --replicas=2', { cmd: 'sleep 25', hidden: true }, 'kubectl get pods', { cmd: "kubectl describe pod -l app=web | grep -E 'Failed|BackOff' | head -2", show: "kubectl describe pod -l app=web | grep -E 'Failed|BackOff' | head -2" }, 'kubectl set image deployment/web ngnix=nginx:1.27', { cmd: 'sleep 20', hidden: true }, 'kubectl get pods']);
  scenarios.push({ id: 'image', tab: 'ImagePullBackOff', title: 'A typo in the image name', lesson: 'Two replicas, zero running. The Events say why: the registry has no image called ngnix. Fix the name and the Deployment replaces the pods by itself.', lines: r.lines, run: ['kind create cluster --name dojo', 'kubectl create deployment web --image=ngnix:1.27 --replicas=2', 8, 'kubectl get pods'] }); }
{ const r = await session(['kind create cluster --name dojo > /dev/null'], ['kubectl run crash --image=busybox -- sh -c "echo starting; exit 1"', { cmd: 'sleep 40', hidden: true }, 'kubectl get pod crash', 'kubectl logs crash', "kubectl describe pod crash | grep -E 'BackOff|Back-off'"]);
  scenarios.push({ id: 'crash', tab: 'CrashLoopBackOff', title: 'A container that exits straight away', lesson: 'The image pulls fine and the process dies with exit code 1. Kubernetes restarts it with growing delays. Logs show what it printed before dying.', lines: r.lines, run: ['kind create cluster --name dojo', 'kubectl run crash --image=busybox -- sh -c "echo starting; exit 1"', 20, 'kubectl get pod crash', 'kubectl logs crash'] }); }
{ const r = await session(KIND2, ['kubectl create deployment web --image=nginx:1.27 --replicas=4', { cmd: 'sleep 15', hidden: true }, 'kubectl get pods -o wide', 'docker stop dojo-worker', { cmd: 'sleep 60', hidden: true }, 'kubectl get nodes', 'kubectl get pods -o wide']);
  scenarios.push({ id: 'node', tab: 'Node failure', title: 'A worker node disappears', lesson: 'kind nodes are Docker containers, so stopping one is a real node failure. The node goes NotReady and its pods are recreated on the nodes that are left.', lines: r.lines, run: [...KIND2.slice(0, -1), 'kind create cluster --name dojo --config kind.yaml', 'kubectl create deployment web --image=nginx:1.27 --replicas=4', 10, 'docker stop dojo-worker', 40, 'kubectl get nodes'] }); }
{ const r = await session(['kubectl create namespace web'], ['kubectl create serviceaccount dev -n web', 'kubectl auth can-i delete pods --as=system:serviceaccount:web:dev -n web', 'kubectl create role pod-admin --verb=get,list,delete --resource=pods -n web', 'kubectl create rolebinding dev-pods --role=pod-admin --serviceaccount=web:dev -n web', 'kubectl auth can-i delete pods --as=system:serviceaccount:web:dev -n web', 'kubectl auth can-i delete pods --as=system:serviceaccount:web:dev -n default']);
  scenarios.push({ id: 'rbac', tab: 'RBAC', title: 'Who may delete pods?', lesson: 'A new ServiceAccount can do nothing. A Role grants verbs on resources, a RoleBinding attaches it to the account, and only inside that one namespace.', lines: r.lines, run: ['kind create cluster --name dojo', 'kubectl create namespace web', 'kubectl create serviceaccount dev -n web', 'kubectl auth can-i delete pods --as=system:serviceaccount:web:dev -n web'] }); }

// the hero: one scripted session, with a snapshot of the cluster after every step (nodes and their pods), taken from the real simulator
async function heroFrames() {
  const sim = new PG.Sim(); sim.start(2, 1); const out = []; const term = { print: t => out.push(t), clear() { }, cols: 100 }; const sh = new PG.Shell(sim, term); sim.shells.push(sh);
  const run = async c => { out.length = 0; await sh.submit(c); return out.join('\n').replace(/\n$/, ''); };
  const snap = () => { const cl = sim.currentCluster(); if (!cl) return null; return cl.nodes.map(n => ({ name: n.name.replace('dojo-', ''), ready: n.ready, role: n.role, pods: cl.res.pods.filter(p => p.spec.nodeName === n.name && p.metadata.namespace === 'default').map(p => ({ id: p.metadata.name.slice(-5), status: cl.podStatus(p) })) })); };
  for (const c of KIND2.slice(0, -1)) await run(c);
  const frames = [];
  const step = async (cmd, { wait, show } = {}) => { if (wait) await run('sleep ' + wait); const o = await run(cmd); frames.push({ cmd: show || cmd, out: o.split('\n').slice(0, 9).map(trunc), snap: snap() }); };
  await step('kind create cluster --name dojo --config kind.yaml'); await step('kubectl create deployment web --image=nginx:1.27 --replicas=4'); await step('kubectl get pods', { wait: 12 });
  await step('docker stop dojo-worker'); await step('kubectl get pods', { wait: 70 });
  sim.stop(); return frames;
}
// "Take it home": build a small cluster, then export it with the real generator
const exp = await session(KIND2, ['kubectl create namespace shop', 'kubectl create deployment web --image=nginx:1.27 --replicas=2 -n shop', 'kubectl expose deployment web --port=80 -n shop', "kubectl label node dojo-worker role=frontend"], { exportScript: {} });
const script = exp.script.split('\n');
const pick = (from, to) => script.slice(script.findIndex(l => l.includes(from)), script.findIndex(l => l.includes(to)) + 1);
const excerpt = [...script.filter(l => /^#!|^set -euo|^guard\(\)/.test(l)).map(l => (l.startsWith('guard()') ? 'guard() { …refuse to run unless kubectl points at the new local cluster… }' : l)), '', ...pick('# ---- the cluster ----', 'kubectl config use-context').map(l => (l.length > 110 ? l.slice(0, 108) + '…' : l)), '', ...pick('# Deployment', 'kubectl rollout status deployment/web').slice(0, 30)];

mkdirSync(join(root, 'src/landing/generated'), { recursive: true });
const hero = await heroFrames();
const data = { hero, scenarios: scenarios.map(s => ({ ...s, lines: s.lines.map(l => ({ cmd: l.cmd, out: cap(l.out, 9).map(trunc) })) })), script: { source: ['kubectl create namespace shop', 'kubectl create deployment web --image=nginx:1.27 --replicas=2 -n shop', 'kubectl expose deployment web --port=80 -n shop'], excerpt: excerpt.join('\n'), lines: script.length } };
writeFileSync(join(root, 'src/landing/generated/demos.json'), JSON.stringify(data, null, 1));
console.log(`demos: ${scenarios.length} scenarios, script excerpt ${excerpt.length} lines`);
process.exit(0);
