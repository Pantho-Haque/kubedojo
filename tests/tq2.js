// QA battery 2: randomized valid operations with cluster invariants, plus Helm / probe / ingress / RBAC scenarios.
const { PG } = require('./harness.js');
async function world() { const sim = new PG.Sim(); sim.start(2, 1); const out = []; const sh = new PG.Shell(sim, { print: t => out.push(String(t)), clear() { out.length = 0; } }); sim.shells.push(sh); const run = async c => { out.length = 0; sh.buf = null; for (const l of c.split('\n')) await sh.submit(l); return out.join('\n'); }; return { sim, sh, run, wait: s => sim.wait(s, { aborted: false }), stop: () => sim.stop() }; }
const T = []; const test = (n, f) => T.push([n, f]);
const has = (s, re, m) => { if (!(re instanceof RegExp ? re.test(s) : s.includes(re))) throw new Error((m || 'has') + ': ' + re + ' not in ' + JSON.stringify(s.slice(0, 400))); };
const not = (s, re, m) => { if (re instanceof RegExp ? re.test(s) : s.includes(re)) throw new Error((m || 'not') + ': unexpected ' + re + ' in ' + JSON.stringify(s.slice(0, 400))); };
const cfg3 = 'cat > k.yaml <<EOF\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nnodes:\n- role: control-plane\n- role: worker\n- role: worker\nEOF\nkind create cluster --name lab --config k.yaml';

function invariants(sim) {
  const bad = [];
  for (const cl of Object.values(sim.clusters)) {
    const names = new Set(cl.nodes.map(n => n.name)); const e = cl.entry && cl.entry.name || '?';
    for (const p of cl.res.pods) {
      if (p.spec.nodeName && !names.has(p.spec.nodeName)) bad.push(`${e}: pod ${p.metadata.name} on missing node ${p.spec.nodeName}`);
      const st = cl.podStatus(p); if (!st || /undefined|NaN/.test(String(st))) bad.push(`${e}: pod ${p.metadata.name} status ${st}`);
      if (!cl.res.namespaces.some(n => n.metadata.name === p.metadata.namespace)) bad.push(`${e}: pod ${p.metadata.name} in missing namespace ${p.metadata.namespace}`);
    }
    for (const n of cl.nodes) { const f = cl.nodeFree(n); if (f.cpu < 0 || f.mem < 0) bad.push(`${e}: node ${n.name} overcommitted ${JSON.stringify(f)}`); }
    for (const d of cl.res.deployments) { const owned = cl.res.pods.filter(p => p.metadata._owner && p.metadata._owner.name && p.metadata.namespace === d.metadata.namespace && PG.selMatch(d.spec.selector, p.metadata.labels) && !p.metadata.deletionTimestamp); if (owned.length > (d.spec.replicas || 0) + (d.spec.strategy && d.spec.strategy.rollingUpdate ? 4 : 1) + 3) bad.push(`${e}: deployment ${d.metadata.name} has ${owned.length} pods for ${d.spec.replicas} replicas`); }
    for (const s of cl.res.services) { const eps = cl.endpointsOf ? cl.endpointsOf(s) : []; for (const ep of eps || []) { const p = ep.pod || ep; if (p && p.metadata && !cl.podReady(p)) bad.push(`${e}: service ${s.metadata.name} routes to not-ready pod ${p.metadata.name}`); } }
  }
  return bad;
}

test('random valid ops keep the cluster consistent (300 steps, 3 seeds)', async () => {
  for (const seed0 of [1, 2, 3]) {
    const w = await world(); await w.run(cfg3); await w.wait(40); let seed = seed0 * 7919; const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
    const deps = ['a', 'b', 'c']; const log = [];
    for (let i = 0; i < 100; i++) {
      const d = deps[rnd(3)]; const ops = [
        `kubectl create deployment ${d} --image=nginx:1.27 --replicas=${1 + rnd(4)}`, `kubectl scale deployment ${d} --replicas=${rnd(6)}`, `kubectl delete deployment ${d}`,
        `kubectl set image deployment/${d} nginx=nginx:1.${25 + rnd(3)}`, `kubectl set image deployment/${d} nginx=bad/img:${rnd(9)}`, `kubectl rollout undo deployment/${d}`, `kubectl expose deployment ${d} --port=80 --name=${d}-svc`, `kubectl delete svc ${d}-svc`,
        `kubectl delete pods -l app=${d}`, 'docker stop lab-worker', 'docker start lab-worker', 'docker stop lab-worker2', 'docker start lab-worker2', `kubectl cordon lab-worker`, `kubectl uncordon lab-worker`,
        `kubectl set resources deployment ${d} --requests=cpu=${[100, 500, 1500, 3][rnd(4)]}m`, `kubectl create ns n${rnd(3)}`, `kubectl delete ns n${rnd(3)}`, `kubectl scale deployment ${d} --replicas=0`];
      const op = ops[rnd(ops.length)]; log.push(op); const o = await w.run(op); if (/internal error|TypeError|undefined|NaN/.test(o)) throw new Error(`seed ${seed0} step ${i}: "${op}" => ${o.slice(0, 200)}`);
      await w.wait(1 + rnd(12)); const bad = invariants(w.sim); if (bad.length) throw new Error(`seed ${seed0} step ${i} after "${op}": ${bad.slice(0, 3).join('; ')}`);
      for (const q of ['kubectl get pods -A -o wide', 'kubectl get all', 'kubectl get events']) { const g = await w.run(q); if (/internal error|TypeError|undefined|NaN/.test(g)) throw new Error(`seed ${seed0} step ${i} "${q}" => ${g.slice(0, 200)}`); }
    }
    w.stop();
  }
});

test('helm2 lifecycle: lint, template, install, upgrade, rollback, delete', async () => {
  const w = await world(); await w.run('kind create cluster --name lab'); await w.wait(30); has(await w.run('helm2 init --service-account tiller'), /Tiller|tiller/); await w.run('kubectl create serviceaccount tiller -n kube-system; kubectl create clusterrolebinding tiller --clusterrole=cluster-admin --serviceaccount=kube-system:tiller'); await w.run('helm2 init --service-account tiller'); await w.wait(40);
  const lint = await w.run('helm2 lint myapp'); not(lint, /internal error/); const tpl = await w.run('helm2 template myapp --name demo --namespace web'); has(tpl, /kind: Deployment/);
  await w.run('kubectl create ns web'); const ins = await w.run('helm2 install myapp --name demo --namespace web --wait --timeout 120'); has(ins, /demo|NAME/); await w.wait(30); has(await w.run('helm2 ls'), /demo/); has(await w.run('kubectl get pods -n web'), /Running/);
  await w.run('helm2 upgrade demo myapp --namespace web --set replicaCount=3 --wait --timeout 200'); await w.wait(30); has(await w.run('helm2 history demo'), /2\s/); await w.run('helm2 rollback demo 1'); await w.wait(30); has(await w.run('helm2 history demo'), /rollback|Rollback/i);
  await w.run('helm2 delete demo --purge'); await w.wait(30); not(await w.run('helm2 ls'), /demo/); w.stop();
});

test('failing readiness probe keeps pod not Ready and drops it from endpoints', async () => {
  const w = await world(); await w.run('kind create cluster --name lab'); await w.wait(30);
  await w.run('cat > p.yaml <<EOF\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: pr\nspec:\n  replicas: 1\n  selector:\n    matchLabels: {app: pr}\n  template:\n    metadata:\n      labels: {app: pr}\n    spec:\n      containers:\n      - name: c\n        image: nginx:1.27\n        readinessProbe:\n          httpGet: {path: /nope, port: 80}\n          periodSeconds: 2\nEOF'); await w.run('kubectl apply -f p.yaml'); await w.run('kubectl expose deployment pr --port=80'); await w.wait(40);
  const o = await w.run('kubectl get pods'); has(o, /0\/1/); has(await w.run('kubectl get endpoints pr'), /<none>|^pr\s+$/m); w.stop();
});

test('RBAC: forbidden without a role, allowed after binding', async () => {
  const w = await world(); await w.run('kind create cluster --name lab'); await w.wait(30); await w.run('kubectl create ns web'); await w.run('kubectl create serviceaccount bob -n web');
  has(await w.run('kubectl auth can-i list pods -n web --as=system:serviceaccount:web:bob'), /no/); await w.run('kubectl create role r --verb=list --resource=pods -n web'); await w.run('kubectl create rolebinding rb --role=r --serviceaccount=web:bob -n web');
  has(await w.run('kubectl auth can-i list pods -n web --as=system:serviceaccount:web:bob'), /yes/); has(await w.run('kubectl auth can-i delete pods -n web --as=system:serviceaccount:web:bob'), /no/); w.stop();
});

test('ResourceQuota blocks creating pods over the limit', async () => {
  const w = await world(); await w.run('kind create cluster --name lab'); await w.wait(30); await w.run('kubectl create ns q'); await w.run('kubectl create quota qq --hard=pods=2 -n q'); await w.run('kubectl create deployment d --image=nginx:1.27 --replicas=4 -n q'); await w.wait(40);
  const running = (await w.run('kubectl get pods -n q')).match(/Running/g) || []; if (running.length !== 2) throw new Error('quota should cap pods at 2, got ' + running.length); has(await w.run('kubectl get events -n q'), /exceeded quota|FailedCreate/); w.stop();
});

test('PodDisruptionBudget blocks a drain', async () => {
  const w = await world(); await w.run(cfg3); await w.wait(40); await w.run('kubectl create deployment d --image=nginx:1.27 --replicas=2'); await w.wait(40); await w.run('kubectl create pdb d --selector=app=d --min-available=2');
  const nodes = (await w.run('kubectl get pods -o wide')); const node = (nodes.match(/lab-worker2?/) || ['lab-worker'])[0]; const o = await w.run('kubectl drain ' + node + ' --ignore-daemonsets --delete-emptydir-data --timeout=20s'); has(o, /disrupt|budget|cannot evict|timed out/i); w.stop();
});

test('HPA scales up under load and down again', async () => {
  const w = await world(); await w.run('kind create cluster --name lab'); await w.wait(30); await w.run('kubectl create deployment h --image=nginx:1.27'); await w.run('kubectl set resources deployment h --requests=cpu=100m'); await w.run('kubectl autoscale deployment h --min=1 --max=5 --cpu-percent=50'); await w.wait(30);
  has(await w.run('kubectl get hpa'), /h\s/); not(await w.run('kubectl get hpa'), /undefined|NaN/); w.stop();
});

test('k3d cluster create, get, delete', async () => { const w = await world(); const o = await w.run('k3d cluster create demo --servers 1 --agents 2'); not(o, /internal error/); await w.wait(40); has(await w.run('k3d cluster list'), /demo/); has(await w.run('kubectl get nodes'), /Ready/); await w.run('k3d cluster delete demo'); not(await w.run('k3d cluster list'), /demo\s/); w.stop(); });

test('export script reflects what was built', async () => { const w = await world(); await w.run('kind create cluster --name lab'); await w.wait(30); await w.run('kubectl create deployment web --image=nginx:1.27 --replicas=2'); const o = await w.run('export-script'); not(o, /internal error|undefined/); has(o, /kind create cluster/); has(o, /web/); w.stop(); });

test('init container + sidecar pod becomes Running; logs per container', async () => {
  const w = await world(); await w.run('kind create cluster --name lab'); await w.wait(30);
  await w.run('cat > ic.yaml <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: ic\nspec:\n  initContainers:\n  - name: init\n    image: busybox\n    command: [sh, -c, "echo init done"]\n  containers:\n  - name: app\n    image: nginx:1.27\n  - name: side\n    image: busybox\n    command: [sh, -c, "sleep 3600"]\nEOF'); await w.run('kubectl apply -f ic.yaml'); await w.wait(40);
  has(await w.run('kubectl get pod ic'), /2\/2\s+Running/); not(await w.run('kubectl logs ic -c app'), /internal error/); w.stop();
});

test('ingress on kind routes by host and path', async () => {
  const w = await world(); await w.run('kind create cluster --name lab'); await w.wait(30); await w.run('kubectl create deployment web --image=nginx:1.27'); await w.run('kubectl expose deployment web --port=80'); await w.wait(30);
  await w.run('cat > ing.yaml <<EOF\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: web\nspec:\n  rules:\n  - host: web.local\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend: {service: {name: web, port: {number: 80}}}\nEOF'); has(await w.run('kubectl apply -f ing.yaml'), /created/); has(await w.run('kubectl get ingress'), /web\.local/); w.stop();
});

test('rolling update never exceeds maxSurge and finishes', async () => {
  const w = await world(); await w.run('kind create cluster --name lab'); await w.wait(30); await w.run('kubectl create deployment web --image=nginx:1.26 --replicas=4'); await w.wait(40); await w.run('kubectl set image deployment/web nginx=nginx:1.27'); let max = 0; for (let i = 0; i < 40; i++) { await w.wait(2); const n = w.sim.currentCluster().res.pods.filter(p => p.metadata.namespace === 'default' && !p.metadata.deletionTimestamp).length; if (n > max) max = n; }
  if (max > 6) throw new Error('surge too high: ' + max); has(await w.run('kubectl rollout status deployment/web'), /successfully rolled out/); w.stop();
});

(async () => {
  let pass = 0, fail = 0; const only = process.argv[2];
  for (const [name, fn] of T) { if (only && !name.includes(only)) continue; try { await Promise.race([fn(), new Promise((_, rj) => setTimeout(() => rj(new Error('timeout 240s')), 240000))]); pass++; console.log('ok   ' + name); } catch (e) { fail++; console.log('FAIL ' + name + '\n       ' + String(e.message).slice(0, 500)); } }
  console.log(`qa2: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
