const { PG, sim, run, stop } = require('./harness.js');
(async () => {
  await run(`cat > kind-config.yaml <<'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: local-cluster-1
nodes:
  - role: control-plane
  - role: worker
  - role: worker
EOF`, false);
  await run('kind create cluster --config kind-config.yaml', false);
  await run('kubectl get pods -A');
  await run('kubectl label node local-cluster-1-worker role=app');
  await run('kubectl label node local-cluster-1-worker2 role=data');
  await run('kubectl get nodes --show-labels | head -3');
  await run('kubectl describe node local-cluster-1-control-plane | grep Taints');
  await run('for ns in web cache db; do kubectl create namespace $ns; done');
  await run('kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web');
  await run('kubectl get pods -n web');
  await run('kubectl rollout status deployment/web -n web');
  await run('kubectl get pods -n web -o wide');
  await run('kubectl expose deployment web --port=80 -n web');
  await run('kubectl get svc -n web');
  await run('kubectl create deployment cache --image=redis:7-alpine -n cache');
  await run('kubectl rollout status deployment/cache -n cache');
  await run('kubectl exec -n cache deploy/cache -- redis-cli ping');
  await run(`kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: db
  namespace: db
spec:
  replicas: 1
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      nodeSelector:
        role: data
      containers:
        - name: postgres
          image: postgres:16-alpine
          env:
            - name: POSTGRES_PASSWORD
              value: local-only
          ports:
            - containerPort: 5432
EOF`);
  await run('kubectl rollout status deployment/db -n db');
  await run('kubectl get pods -A -o wide | grep -v kube-system');
  await run('kubectl run dns-test -n cache --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- http://web.web');
  stop();
})().catch(e => { console.error(e); process.exit(1); });
