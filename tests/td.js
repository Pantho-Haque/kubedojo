const { PG, sim, run, stop, sh } = require('./harness.js');
(async () => {
  await run(`cat > kc.yaml <<'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: ing
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
      - containerPort: 443
        hostPort: 443
  - role: worker
EOF`, false);
  await run('kind create cluster --config kc.yaml', false); await run('kubectl create namespace web', false);
  await run('kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web', false); await run('kubectl expose deploy web --port=80 -n web', false);
  await run('kubectl create deployment api --image=httpd:2.4 -n web', false); await run('kubectl expose deploy api --port=80 -n web', false);
  await run(`kubectl apply -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: site, namespace: web }
spec:
  ingressClassName: nginx
  rules:
    - host: web.local
      http:
        paths:
          - { path: /, pathType: Prefix, backend: { service: { name: web, port: { number: 80 } } } }
    - host: api.local
      http:
        paths:
          - { path: /, pathType: Prefix, backend: { service: { name: api, port: { number: 80 } } } }
EOF`, false);
  await run('curl -s http://localhost/ | head -2');
  await run('kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml');
  await sim.wait(20, { aborted: false });
  await run('kubectl get ingress -n web'); await run('kubectl get pods -n ingress-nginx');
  await run('curl -s -H "Host: web.local" http://localhost/ | head -3');
  await run('curl -s -H "Host: api.local" http://localhost/ | head -3');
  await run('curl -s -H "Host: nope.local" http://localhost/ | head -3');
  await run('curl -s http://web.local/ | head -2');
  await run("echo '127.0.0.1 web.local api.local' | sudo tee -a /etc/hosts");
  await run('curl -s http://api.local/ | head -3'); await run('curl -s http://web.local/nothing | head -3');
  await run('curl -s -o /dev/null -w "%{http_code}\\n" http://web.local/');
  console.log('### docker run web container');
  await run('mkdir site; echo "<h1>from docker run</h1>" > site/index.html; printf "FROM nginx:1.27\\nCOPY index.html /usr/share/nginx/html/\\n" > site/Dockerfile; docker build -t site:1 site >/dev/null; docker run -d --name s1 -p 9090:80 site:1; curl -s http://localhost:9090/');
  stop();
})().catch(e => { console.error(e); process.exit(1); });
