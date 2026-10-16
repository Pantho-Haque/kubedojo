const { PG, sim, run, stop, sh } = require('./harness.js');
(async () => {
  await run('k3d cluster create local-cluster-1 --servers 1 --agents 2 --port "8080:80@loadbalancer" --registry-create local-registry:0.0.0.0:5001');
  await run('kubectl config current-context');
  await run('kubectl get nodes');
  await run('k3d cluster list');
  await run('kubectl get pods -n kube-system');
  await run('kubectl create namespace web', false);
  await run('kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web', false);
  await run('kubectl expose deployment web --port=80 -n web', false);
  await run(`kubectl apply -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
  namespace: web
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 80
EOF`);
  await sim.wait(10, { aborted: false });
  await run('curl -s http://localhost:8080 | head -3');
  await run('kubectl top nodes');
  await run('kubectl set resources deployment web --requests=cpu=50m -n web');
  await run('kubectl autoscale deployment web --cpu-percent=70 --min=2 --max=6 -n web');
  await run('sim load web 300 -n web');
  await sim.wait(30, { aborted: false });
  await run('kubectl get hpa -n web');
  await run('kubectl get pods -n web');
  await run('k3d node create extra --cluster local-cluster-1 --role agent');
  await run('kubectl get nodes');
  await run('kubectl drain k3d-extra-0 --ignore-daemonsets --delete-emptydir-data');
  await run('kubectl delete node k3d-extra-0');
  await run('k3d node delete k3d-extra-0');
  await run('docker build -t localhost:5001/my-app:v1 .', false);
  await run('mkdir app && cat > app/Dockerfile <<\'EOF\'\nFROM nginx:1.27\nRUN echo \'<h1>k3d app</h1>\' > /usr/share/nginx/html/index.html\nEOF', false);
  await run('docker build -t localhost:5001/my-app:v1 app', false);
  await run('docker push localhost:5001/my-app:v1');
  await run('kubectl create deployment my-app --image=k3d-local-registry:5000/my-app:v1 -n web');
  await sim.wait(10, { aborted: false });
  await run('kubectl get pods -n web');
  await run('kubectl delete namespace web');
  await run('k3d cluster stop local-cluster-1');
  await run('kubectl get nodes');
  await run('k3d cluster delete local-cluster-1');
  await run('kubectl config get-contexts');
  stop();
})().catch(e => { console.error(e); process.exit(1); });
