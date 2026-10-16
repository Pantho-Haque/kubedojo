const { PG, sim, run, stop, sh, out } = require('./harness.js');
(async () => {
  await run('kind create cluster --name lab', false); await run('kubectl create namespace web', false);
  await run(`kubectl apply -f - <<'EOF'
apiVersion: v1
kind: ConfigMap
metadata: { name: app-cfg, namespace: web }
data:
  app.conf: |
    greeting = hello
  LOG_LEVEL: debug
---
apiVersion: apps/v1
kind: Deployment
metadata: { name: web, namespace: web }
spec:
  replicas: 1
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          envFrom:
            - configMapRef: { name: app-cfg }
          volumeMounts:
            - { name: cfg, mountPath: /etc/myapp }
      volumes:
        - { name: cfg, configMap: { name: app-cfg } }
EOF`, false);
  await run('kubectl expose deploy web --port=80 -n web', false);
  await run('kubectl create deployment cache --image=redis:7-alpine -n web', false);
  await run('kubectl rollout status deploy/web -n web', false); await run('kubectl rollout status deploy/cache -n web', false);
  const P = sim.currentCluster().res.pods.find(p => p.metadata.name.startsWith('web-')).metadata.name;
  console.log('=== one-shot exec ===');
  for (const c of ['ps', 'ps aux', 'cat /etc/myapp/app.conf', 'cat /usr/share/nginx/html/index.html | head -3', 'ls /etc/nginx', 'env | grep LOG_LEVEL', 'hostname', 'uname -a', 'df -h | head -2', 'netstat -tln', 'curl -s localhost | head -2', 'wget -qO- http://web | head -2', 'nslookup web', 'ping -c 2 web', 'nc -zv web 80', 'sh -c "echo hi; exit 3"', 'nosuchcmd', 'cat /var/log/nginx/access.log | head -2'])
    await run(`kubectl exec -n web ${P} -- ${c}`);
  console.log('=== redis ===');
  const R = sim.currentCluster().res.pods.find(p => p.metadata.name.startsWith('cache-')).metadata.name;
  await run(`kubectl exec -n web ${R} -- redis-cli set foo bar`); await run(`kubectl exec -n web ${R} -- redis-cli get foo`); await run(`kubectl exec -n web ${R} -- ps`);
  console.log('=== interactive session ===');
  out.length = 0; for (const line of [`kubectl exec -it -n web ${P} -- sh`, 'whoami', 'pwd', 'cd /etc/myapp', 'pwd', 'ls', 'cat app.conf', 'echo "x=1" > /tmp/note.txt', 'cat /tmp/note.txt', 'ps', 'for i in 1 2; do echo n$i; done', 'curl -s localhost | head -1', 'exit', 'echo back on my laptop']) { const pr = sh.prompt(); await sh.submit(line); out.unshift ? 0 : 0; console.log(pr + line); }
  console.log(out.join('\n')); stop();
})().catch(e => { console.error(e); process.exit(1); });
