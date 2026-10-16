const { PG, sim, run, stop, sh } = require('./harness.js');
(async () => {
  await run(`cat > kind-config.yaml <<'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: local-cluster-1
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 8080
        listenAddress: "127.0.0.1"
  - role: worker
  - role: worker
EOF`, false);
  await run('kind create cluster --config kind-config.yaml', false);
  await run('kubectl create namespace web', false);
  await run('kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web');
  await run('kubectl get pods -n web');
  await run('kubectl rollout status deployment/web -n web', false);
  await run(`kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: web-public
  namespace: web
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
EOF`);
  await run('curl -s http://localhost:8080 | head -5');
  await run('curl -s -o /dev/null -w \'%{http_code}\\n\' http://localhost:8080/nope');
  await run('curl -s http://localhost:9999');
  // own image
  await run('mkdir my-app', false);
  await run(`cat > my-app/Dockerfile <<'EOF'
FROM nginx:1.27
RUN echo '<h1>hello from my-app v1</h1>' > /usr/share/nginx/html/index.html
EOF`, false);
  await run('docker build -t my-app:v1 my-app');
  await run('kubectl create deployment my-app --image=my-app:v1 -n web');
  await new Promise(r => setTimeout(r, 200)); await sim.waitFor(() => sim.clock > 60 + 0, { aborted: false }, 100).catch(() => { });
  await run('kubectl get pods -n web');
  await run('kubectl describe pod -n web -l app=my-app | tail -12');
  await run('kind load docker-image my-app:v1 --name local-cluster-1');
  await run('docker exec local-cluster-1-worker crictl images | grep my-app');
  await sim.wait(25, { aborted: false });
  await run('kubectl get pods -n web');
  stop();
})().catch(e => { console.error(e); process.exit(1); });
