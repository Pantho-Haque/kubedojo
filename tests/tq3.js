// QA battery 3: grammar-based fuzz of kubectl / docker / kind / helm2 / k3d / gcloud with realistic verbs, resources and flags.
// Any "internal error", JS exception text, or undefined/NaN/[object in the output is a bug.
const { PG } = require('./harness.js');
async function main() {
  const sim = new PG.Sim(); sim.start(2, 1); const out = []; const sh = new PG.Shell(sim, { print: t => out.push(String(t)), clear() { out.length = 0; } }); sim.shells.push(sh);
  const run = async c => { out.length = 0; sh.buf = null; await Promise.race([(async () => { for (const l of c.split('\n')) await sh.submit(l); })(), new Promise(r => setTimeout(() => { sh.abort(); r(); }, 2500))]); return out.join('\n'); };
  await run('kind create cluster --name lab'); await sim.wait(30, { aborted: false }); await run('kubectl create deployment web --image=nginx:1.27 --replicas=2'); await run('kubectl expose deployment web --port=80'); await run('kubectl create configmap cm --from-literal=a=1'); await run('kubectl create secret generic s --from-literal=a=1'); await run('kubectl create ns other'); await sim.wait(30, { aborted: false });
  const pick = (a, r) => a[Math.floor(r() * a.length)];
  let seed = +process.argv[3] || 424242; const r = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const RES = ['pods', 'po', 'deploy', 'deployments', 'svc', 'services', 'cm', 'secrets', 'ns', 'nodes', 'no', 'rs', 'ep', 'ing', 'sa', 'roles', 'rolebindings', 'clusterroles', 'pv', 'pvc', 'hpa', 'pdb', 'jobs', 'cronjobs', 'ds', 'sts', 'events', 'quota', 'netpol', 'all', 'pod/web', 'deploy/web', 'svc/web', 'nosuch', 'cm/cm', 'node/lab-control-plane'];
  const FL = ['-o json', '-o yaml', '-o wide', '-o name', '-o jsonpath={.items[*].metadata.name}', '-o custom-columns=N:.metadata.name', '-A', '-n other', '-n kube-system', '-l app=web', '--show-labels', '--no-headers', '--sort-by=.metadata.name', '--field-selector=status.phase=Running', '-w --timeout=1s', '--watch-only', '--all-namespaces', '-o go-template={{.kind}}', '--selector=', '-n', '-o', '--dry-run=client -o yaml', '--force', '--grace-period=0', '--cascade=foreground', '--all', '--request-timeout=1', '-v=9', '--context=nope', '--namespace='];
  const VERB = ['get', 'describe', 'delete', 'create', 'apply', 'edit', 'label', 'annotate', 'scale', 'rollout status', 'rollout history', 'rollout restart', 'rollout undo', 'logs', 'exec', 'top', 'cordon', 'drain', 'taint', 'patch', 'expose', 'explain', 'api-resources', 'auth can-i', 'config view', 'config get-contexts', 'cluster-info', 'wait', 'diff', 'port-forward', 'cp', 'run', 'set image', 'set env', 'set resources', 'autoscale', 'certificate', 'replace', 'version', 'events', 'debug'];
  const bad = []; const N = +process.argv[2] || 700;
  for (let i = 0; i < N; i++) {
    const tool = r(); let line;
    if (tool < .75) line = `kubectl ${pick(VERB, r)} ${r() < .8 ? pick(RES, r) : ''} ${r() < .3 ? 'web' : ''} ${pick(FL, r)} ${r() < .3 ? pick(FL, r) : ''}`;
    else if (tool < .85) line = `docker ${pick(['ps', 'ps -a', 'images', 'run -d nginx', 'run --rm busybox echo hi', 'stop x', 'rm x', 'rmi x', 'logs x', 'exec x ls', 'inspect x', 'network ls', 'volume ls', 'build .', 'build -t a:b .', 'pull busybox', 'tag a b', 'push a', 'stats --no-stream', 'top x', 'cp x:/a .', 'compose up', 'info', 'version', 'system prune -f', 'login', 'run', 'run -it', 'run -p', 'run -p 99999:80 nginx', 'run --name', 'ps --format {{.Names}}'], r)}`;
    else if (tool < .92) line = `kind ${pick(['get clusters', 'get nodes', 'create cluster --name x', 'create cluster --name lab', 'delete cluster --name nope', 'delete clusters --all', 'load docker-image a:b', 'export kubeconfig', 'get kubeconfig', 'create cluster --config /nope', 'version', 'build node-image'], r)}`;
    else if (tool < .97) line = `helm2 ${pick(['ls', 'version', 'init', 'repo list', 'search nginx', 'install myapp', 'install nosuch --name x', 'upgrade x myapp', 'delete x', 'rollback x 9', 'history x', 'status x', 'get values x', 'lint nosuch', 'template myapp', 'create foo', 'package myapp', 'dependency update', 'test x', 'inspect values myapp'], r)}`;
    else line = `${pick(['k3d cluster create t1', 'k3d cluster list', 'k3d cluster delete nope', 'k3d node list', 'gcloud container clusters list', 'gcloud config list', 'gcloud auth list', 'gcloud container clusters get-credentials x', 'gcloud compute instances list', 'curl localhost:99999', 'curl -s http://web', 'curl', 'wget', 'nslookup web', 'ping web', 'nc -z web 80', 'openssl version', 'export-script', 'help', 'sim', 'sim speed 8', 'sim help', 'guide', 'tour'], r)}`;
    let o; try { o = await run(line.replace(/\s+/g, ' ').trim()); } catch (e) { bad.push(line + ' => THROW ' + e.message); continue; }
    if (/internal error|TypeError|ReferenceError|RangeError|SyntaxError|at PG\.|\.engine\.cjs|undefined|NaN|\[object/.test(o)) bad.push(line + ' => ' + o.split('\n').find(l => /internal error|TypeError|ReferenceError|RangeError|undefined|NaN|\[object/.test(l)).slice(0, 160));
    if (i % 50 === 0) await sim.wait(5, { aborted: false });
  }
  const uniq = [...new Set(bad.map(b => b.replace(/^.*=> /, '').slice(0, 80)))];
  console.log(bad.length ? 'FOUND ' + bad.length + ' problem lines, ' + uniq.length + ' distinct:\n' + bad.slice(0, 40).join('\n') : 'qa3: fuzz clean (' + N + ' commands)');
  sim.stop(); process.exit(bad.length ? 1 : 0);
}
main();
