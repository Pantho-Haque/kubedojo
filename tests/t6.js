const { PG, sim, run, stop, sh } = require('./harness.js');
(async () => {
  await run(`cat > kc.yaml <<'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: local-cluster-1
nodes:
  - role: control-plane
  - role: worker
  - role: worker
EOF`, false);
  await run('kind create cluster --config kc.yaml', false);
  await run('kubectl create namespace web', false);
  // registry flow
  await run('docker run -d --restart=always -p 127.0.0.1:5001:5000 --network bridge --name kind-registry registry:2');
  await run('docker run -d --name kind-registry registry:2');
  await run('docker network connect kind kind-registry');
  await run('docker network connect kind kind-registry');
  await run(`for node in $(kind get nodes --name local-cluster-1); do
  docker exec "$node" mkdir -p /etc/containerd/certs.d/localhost:5001
  printf '[host."http://kind-registry:5000"]\\n' | docker exec -i "$node" cp /dev/stdin /etc/containerd/certs.d/localhost:5001/hosts.toml
done`);
  await run('docker pull busybox:1.36', false);
  await run('docker tag busybox:1.36 localhost:5001/busybox:1.36');
  await run('docker push localhost:5001/busybox:1.36');
  await run('kubectl run regcheck -n web --rm -i --restart=Never --image=localhost:5001/busybox:1.36 -- echo it-works');
  await run('curl -s localhost:5001/v2/_catalog');
  // drain + PDB
  await run('kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web', false);
  await run(`kubectl apply -f - <<'EOF'
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web
  namespace: web
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: web
EOF`);
  await sim.wait(15, { aborted: false });
  await run('kubectl get pods -n web -o wide');
  await run('kubectl get pdb -n web');
  // node failure
  await run('docker stop local-cluster-1-worker2');
  await sim.wait(6, { aborted: false });
  await run('kubectl get nodes');
  await sim.wait(14, { aborted: false });
  await run('kubectl get pods -n web -o wide');
  await run('docker start local-cluster-1-worker2');
  await sim.wait(5, { aborted: false });
  await run('kubectl get nodes');
  // rollout / undo
  await run('kubectl set image deployment/web nginx=nginx:does-not-exist-image.example.com/x -n web');
  await sim.wait(15, { aborted: false });
  await run('kubectl get pods -n web');
  await run('kubectl rollout history deployment/web -n web');
  await run('kubectl rollout undo deployment/web -n web');
  await sim.wait(15, { aborted: false });
  await run('kubectl get pods -n web');
  // HPA
  await run('kubectl set resources deployment web --requests=cpu=50m -n web');
  await run('kubectl autoscale deployment web --cpu-percent=70 --min=2 --max=6 -n web');
  await run('kubectl get hpa -n web');
  await run('sim load web 300 -n web');
  await sim.wait(40, { aborted: false });
  await run('kubectl get hpa -n web');
  await run('kubectl get pods -n web');
  stop();
})().catch(e => { console.error(e); process.exit(1); });
