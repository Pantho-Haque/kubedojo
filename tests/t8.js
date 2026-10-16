const { PG, sim, run, stop, sh, out } = require('./harness.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await run('kind create cluster --name lab', false);
  await run('kubectl create namespace web', false);
  await run('kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web', false);
  await run('kubectl rollout status deploy/web -n web', false);
  await run('kubectl expose deployment web --port=80 -n web', false);
  // shell features
  await run('echo a && echo b || echo c; false || echo fallback; X=5; echo "x=$X"; echo $?');
  await run("echo 'it''s' \"q $X\" | tr a-z A-Z");
  await run('for n in $(kind get nodes --name lab); do echo node:$n; done');
  await run('kubectl get nosuchthing');
  await run('kubectl get pods -n nonexistent');
  await run('kubectl get pod -n web -o name');
  await run('kubectl get svc web -n web -o jsonpath=\'{.spec.clusterIP}\'');
  await run('kubectl get svc web -n web -o yaml');
  await run('kubectl describe deploy web -n web | head -14');
  await run('kubectl describe svc web -n web');
  await run('kubectl get nodes -o wide');
  await run('kubectl get deploy,svc -n web');
  await run('kubectl get all -n web | head -6');
  // watch + ctrl-c
  const p1 = run('kubectl get pods -n web -w', false);
  await sim.wait(4, { aborted: false }); await run('kubectl scale deploy web --replicas=3 -n web', false); await sim.wait(6, { aborted: false });
  sh.abort(); await p1; console.log('watch output:\n' + out.join('\n') + '\n');
  // port-forward in shell 1, curl in shell 2
  const { Shell } = PG; const out2 = []; const sh2 = new Shell(sim, { print: t => out2.push(t), clear() { } }); sim.shells.push(sh2);
  const pf = sh.submit('kubectl port-forward svc/web 8081:80 -n web'); await sim.wait(2, { aborted: false });
  await sh2.submit('curl -s http://localhost:8081 | head -3'); await sh2.submit('curl -s http://localhost:8081 -o /dev/null -w "%{http_code}\\n"');
  console.log('second tab:\n' + out2.join('\n')); sh.abort(); await pf;
  console.log('pf output:\n' + out.join('\n') + '\n');
  await run('curl -s http://localhost:8081');
  // failure paths
  await run('helm2 ls', false);
  await run('helm2 init --service-account nosuchsa');
  await sim.wait(10, { aborted: false });
  await run('helm2 ls');
  await run('kubectl describe rs -n kube-system -l name=tiller | tail -4');
  await run("helm2 init --tiller-image gcr.io/kubernetes-helm/tiller:v2.10.0 --output yaml | perl -pe 's#^apiVersion: extensions/v1beta1#apiVersion: apps/v1#; s#^(\\s+)replicas: 1#$1replicas: 1\\n$1selector: {matchLabels: {app: helm, name: tiller}}#' | head -12");
  // context traps
  await run('kubectl config use-context gke_prod-project_asia-east1-a_prod-1');
  await run('kubectl get svc -n shop-frontend');
  await run('kubectl get svc shop-web-internal -n shop-frontend -o yaml | head -12');
  await run('kubectl config use-context kind-lab');
  // completion
  console.log('complete kubectl g ->', JSON.stringify(PG.complete(sh, 'kubectl g').matches));
  console.log('complete kubectl get po ->', JSON.stringify(PG.complete(sh, 'kubectl get po').matches));
  console.log('complete kubectl get pods -n w ->', JSON.stringify(PG.complete(sh, 'kubectl get pods -n w').matches));
  console.log('complete kubectl get pods  ->', PG.complete(sh, 'kubectl logs ').matches.length, 'pod names');
  await run('kubectl delete namespace web');
  await run('kubectl get ns');
  stop();
  const bad = out.concat(out2).filter(l => /internal error/.test(l)); if (bad.length) { console.log('INTERNAL ERRORS', bad); process.exit(2); }
})().catch(e => { console.error(e); process.exit(1); });
