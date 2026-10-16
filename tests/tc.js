const { PG, sim, run, stop, sh, out } = require('./harness.js');
(async () => {
  await run('kind create cluster --name lab', false); await run('kubectl create namespace web', false);
  console.log('### 1. init container writes a page into a shared emptyDir; nginx serves it');
  await run(`kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: site, namespace: web }
spec:
  replicas: 1
  selector: { matchLabels: { app: site } }
  template:
    metadata: { labels: { app: site } }
    spec:
      initContainers:
        - name: prepare
          image: busybox:1.36
          command: ["sh", "-c", "echo '<h1>written by the init container</h1>' > /work/index.html"]
          volumeMounts: [{ name: html, mountPath: /work }]
      containers:
        - name: nginx
          image: nginx:1.27
          volumeMounts: [{ name: html, mountPath: /usr/share/nginx/html }]
        - name: sidecar
          image: busybox:1.36
          command: ["sleep", "3600"]
      volumes:
        - name: html
          emptyDir: {}
EOF`, false);
  await run('kubectl expose deploy site --port=80 -n web', false);
  await run('kubectl get pods -n web'); await sim.wait(3, { aborted: false }); await run('kubectl get pods -n web'); await sim.wait(10, { aborted: false }); await run('kubectl get pods -n web');
  await run('kubectl run c1 --rm -i --restart=Never --image=busybox:1.36 -n web -- wget -qO- http://site');
  await run('kubectl describe pod -n web -l app=site | sed -n "/Init Containers/,/Conditions/p" | head -30');
  const P = sim.currentCluster().res.pods.find(p => p.metadata.name.startsWith('site-')).metadata.name;
  await run(`kubectl exec -n web ${P} -c sidecar -- ps`); await run(`kubectl exec -n web ${P} -c nginx -- cat /usr/share/nginx/html/index.html`); await run(`kubectl logs -n web ${P} -c sidecar`); await run(`kubectl exec -n web ${P} -c nope -- ls`);
  console.log('### 2. readiness probe on a missing path -> not Ready, Service has no endpoints');
  await run(`kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: probe, namespace: web }
spec:
  replicas: 1
  selector: { matchLabels: { app: probe } }
  template:
    metadata: { labels: { app: probe } }
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          readinessProbe: { httpGet: { path: /healthz, port: 80 }, periodSeconds: 5 }
          livenessProbe: { httpGet: { path: /, port: 80 }, periodSeconds: 5 }
EOF`, false);
  await run('kubectl expose deploy probe --port=80 -n web', false);
  await sim.wait(30, { aborted: false });
  await run('kubectl get pods -n web -l app=probe'); await run('kubectl get endpoints probe -n web'); await run('kubectl describe pod -n web -l app=probe | tail -8');
  console.log('### 2b. make the path exist -> becomes Ready');
  const PP = sim.currentCluster().res.pods.find(p => p.metadata.name.startsWith('probe-')).metadata.name;
  await run(`kubectl exec -n web ${PP} -- sh -c "echo ok > /usr/share/nginx/html/healthz"`); await sim.wait(12, { aborted: false });
  await run('kubectl get pods -n web -l app=probe'); await run('kubectl get endpoints probe -n web');
  console.log('### 3. liveness probe failing -> restarts');
  await run(`kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata: { name: live, namespace: web }
spec:
  containers:
    - name: nginx
      image: nginx:1.27
      livenessProbe: { httpGet: { path: /nope, port: 80 }, periodSeconds: 5, failureThreshold: 2 }
EOF`, false);
  await sim.wait(60, { aborted: false }); await run('kubectl get pod live -n web'); await run('kubectl get events -n web --field-selector involvedObject.name=live | tail -4');
  console.log('### 4. OOMKilled');
  await run(`kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata: { name: hungry, namespace: web }
spec:
  containers:
    - name: pg
      image: postgres:16-alpine
      env: [{ name: POSTGRES_PASSWORD, value: x }]
      resources: { limits: { memory: 20Mi } }
EOF`, false);
  await sim.wait(25, { aborted: false }); await run('kubectl get pod hungry -n web'); await run('kubectl describe pod hungry -n web | grep -A4 "Last State"');
  console.log('### 5. wait-for-service init container');
  await run(`kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata: { name: waiter, namespace: web }
spec:
  initContainers:
    - name: wait-db
      image: busybox:1.36
      command: ["sh", "-c", "until nslookup mydb; do echo waiting; sleep 2; done"]
  containers:
    - name: app
      image: nginx:1.27
EOF`, false);
  await sim.wait(8, { aborted: false }); await run('kubectl get pod waiter -n web');
  await run('kubectl create deployment mydb --image=redis:7-alpine -n web', false); await run('kubectl expose deploy mydb --port=6379 -n web', false); await sim.wait(15, { aborted: false }); await run('kubectl get pod waiter -n web');
  stop();
})().catch(e => { console.error(e); process.exit(1); });
