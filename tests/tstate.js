// The playground's saved world: snapshot -> JSON -> a fresh Sim -> the same clusters, objects, and behaviour.
const { PG, sim, run, stop } = require('./harness.js'); let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };
(async () => {
  await run('kind create cluster --name lab\nkubectl create namespace web\nkubectl create deployment web --image=nginx:1.27 --replicas=2 -n web\nkubectl expose deployment web --port=80 -n web\nkubectl create configmap c1 --from-literal=k=v -n web\ndocker run -d --name cache redis:7', false);
  await sim.wait(40);
  const before = await run('kubectl get deploy,svc,cm -n web -o name\nkubectl config current-context\ndocker ps --format {{.Names}}', false);
  const snap = JSON.parse(JSON.stringify(sim.snapshotState()));
  ok(snap.v === PG.STATE_V && Object.keys(snap.clusters).includes('kind-lab'), 'snapshot has the kind cluster');
  // a second world, as after a reload
  const sim2 = new PG.Sim(); ok(sim2.restoreState(snap), 'restore accepted');
  ok(sim2.clusters['kind-lab'] instanceof PG.Cluster && sim2.clusters['kind-lab'].sim === sim2, 'clusters are rebuilt and point at the new sim');
  ok(!sim2.restoreState({ v: 99 }), 'another version is refused');
  const out = []; const sh = new PG.Shell(sim2, { print: t => out.push(t), clear() {} }); sim2.shells.push(sh); sim2.start(2, 1);
  const run2 = async c => { out.length = 0; for (const l of c.split('\n')) await sh.submit(l); return out.join('\n'); };
  const after = await run2('kubectl get deploy,svc,cm -n web -o name\nkubectl config current-context\ndocker ps --format {{.Names}}');
  ok(after === before, 'same objects, context, and containers after restore');
  // the restored world keeps working: scale up and the controllers react
  await run2('kubectl scale deployment web --replicas=4 -n web'); await sim2.wait(40);
  const pods = await run2('kubectl get pods -n web --no-headers');
  ok(pods.split('\n').filter(l => /Running/.test(l)).length === 4, 'controllers run on the restored cluster');
  sim2.stop();
  console.log(bad ? bad + ' failing' : 'state checks pass'); stop(); process.exit(bad ? 1 : 0);
})();
