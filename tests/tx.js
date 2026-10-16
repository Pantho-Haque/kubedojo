const { PG, sim, run, stop } = require('./harness.js'); const fs = require('fs'); const { execSync } = require('child_process'); let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };
(async () => {
  // 1) the fake production cluster (current context at start) -> local kind copy
  let r = PG.buildScript(sim, {}); fs.writeFileSync('/tmp/gen1.sh', r.script);
  ok(/kind create cluster --name 'local-prod-1'|kind create cluster --name local-prod-1/.test(r.script), 'gke -> kind name'); ok(/kind: Deployment/.test(r.script) && /name: shop-web/.test(r.script), 'deployments'); ok(!/clusterIP:/.test(r.script), 'no clusterIP'); ok(!/uid:/.test(r.script), 'no uid'); ok(!/gke-metrics-agent|fluentbit/.test(r.script), 'no system ds'); ok(/PRODUCTION cluster: this builds a local copy/.test(r.script), 'note');
  try { execSync('bash -n /tmp/gen1.sh'); } catch (e) { ok(false, 'bash -n gke ' + e.stderr); }
  // 2) a kind cluster with your own objects
  await run('kind create cluster --name lab\nkubectl create namespace web\nkubectl create deployment web --image=nginx:1.27 --replicas=2 -n web\nkubectl expose deployment web --port=80 -n web\nkubectl create secret generic s1 --from-literal=a=b -n web\nkubectl create configmap c1 --from-literal=k=v -n web\nkubectl run p1 --image=nginx -n web\nkubectl label node lab-control-plane role=app', false);
  r = PG.buildScript(sim, {}); fs.writeFileSync('/tmp/gen2.sh', r.script); console.log(r.script.split('\n').filter(l => !/^#|^$/.test(l)).slice(0, 12).join('\n'));
  ok(/kind create cluster --name lab /.test(r.script), 'kind name'); ok(/role=app/.test(r.script), 'node label'); ok(/kind: Namespace/.test(r.script) && /name: web/.test(r.script), 'namespace'); ok(/kind: Secret/.test(r.script), 'secret'); ok(/kind: Pod/.test(r.script) && !/nodeName/.test(r.script), 'pod without nodeName'); ok(!/ReplicaSet/.test(r.script), 'no RS'); ok(/rollout status deployment\/web -n web/.test(r.script), 'wait');
  ok(!/kind: Secret/.test(PG.buildScript(sim, { secrets: false }).script), 'secrets off'); ok(/k3d cluster create lab --servers 1 --agents 0/.test(PG.buildScript(sim, { tool: 'k3d' }).script), 'k3d');
  try { execSync('bash -n /tmp/gen2.sh'); console.log('bash -n OK'); } catch (e) { ok(false, 'bash -n ' + e.stderr); }
  console.log(bad ? bad + ' failing' : 'export checks pass'); stop(); process.exit(bad ? 1 : 0);
})();
