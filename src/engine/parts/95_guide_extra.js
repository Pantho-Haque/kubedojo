/* ===================== guide: the new sections (spliced into PG.GUIDE) ===================== */
(() => {
  const G = PG.GUIDE; const at = prefix => G.findIndex(s => s.t.startsWith(prefix)); const insertAfter = (prefix, sec) => { const i = at(prefix); G.splice(i < 0 ? G.length : i + 1, 0, sec); }; const add = (prefix, ...items) => { const s = G[at(prefix)]; if (s) s.items.push(...items); };
  insertAfter('0 ·', { t: '0c · Look around the files', items: [
    ['Make a few folders and files to look at', 'mkdir -p ~/lab/a/b ~/lab/.hidden\necho hello > ~/lab/a/f.txt\nprintf \'#!/bin/sh\\necho hi\\n\' > ~/lab/run.sh'],
    ['Long listing with hidden files: permissions, owner, size, time', 'ls -la ~/lab'],
    ['Human-readable sizes, newest first', 'ls -lht ~'],
    ['Everything below a folder', 'ls -R ~/lab'],
    ['The folder tree (the Helm chart)', 'tree ~/myapp'],
    ['Only two levels, with hidden files', 'tree -a -L 2 ~'],
    ['Folders only / skip some names', 'tree -d ~/myapp\ntree -I "charts|files" ~/myapp'],
  ] });
  insertAfter('0 ·', { t: '0b · Edit files with vi', items: [
    ['Open (or create) a file: i = start typing, Esc = stop, :wq = save and quit', 'vi ~/notes.txt'],
    ['Edit the Helm chart values in place (:q! leaves without saving)', 'vi ~/myapp/values.yaml'],
    ['Look without touching', 'view ~/myapp/Chart.yaml'],
    ['Check what you saved', 'cat ~/notes.txt'],
  ] });
  insertAfter('3 · Deploy', { t: '3b · Inside a pod', items: [
    ['Open a shell in a pod (deploy/NAME works)', 'kubectl exec -it deploy/web -n web -- sh'],
    ['…then, at the root@… prompt: what is running?', 'ps\nwhoami\nhostname\nenv | head -5'],
    ['…what files does it have?', 'ls /\ncat /etc/os-release\nls /usr/share/nginx/html\ncat /etc/nginx/conf.d/default.conf'],
    ['…the network, from the inside', 'curl -s localhost | head -3\nnslookup web\nping -c 2 web\nnetstat -tln'],
    ['…write a file, read it back', 'echo "hello from inside" > /tmp/note.txt\ncat /tmp/note.txt'],
    ['…leave the pod', 'exit'],
    ['One command, no shell', 'kubectl exec deploy/web -n web -- ps aux'],
    ['Copy a file in and out', 'echo "from my laptop" > note.txt\nPOD=$(kubectl get pod -n web -l app=web -o jsonpath=\'{.items[0].metadata.name}\')\nkubectl cp note.txt web/$POD:/tmp/note.txt\nkubectl exec -n web $POD -- cat /tmp/note.txt'],
    ['Debug a pod that has no tools: attach a busybox shell (press Enter yourself)', "kubectl debug -it -n web $(kubectl get pod -n web -l app=web -o jsonpath='{.items[0].metadata.name}') --image=busybox:1.36 --target=nginx -- sh"],
    ['…inside the debug shell (you see the target container\'s processes), then leave', 'ps\nwhoami\nexit'],
    ['Redis: really use it', 'kubectl exec -n cache deploy/cache -- redis-cli set greeting hello\nkubectl exec -n cache deploy/cache -- redis-cli get greeting\nkubectl exec -n cache deploy/cache -- redis-cli keys "*"'],
    ['Postgres: ask it something', 'kubectl exec -n db deploy/db -- psql -U postgres -c "select version()"'],
  ] });
  insertAfter('3b · Inside', { t: '3c · Probes, init containers, sidecars, OOM', items: [
    ['A readiness probe on a path that does not exist', "kubectl apply -f - <<'EOF'\napiVersion: apps/v1\nkind: Deployment\nmetadata: { name: probe, namespace: web }\nspec:\n  replicas: 1\n  selector: { matchLabels: { app: probe } }\n  template:\n    metadata: { labels: { app: probe } }\n    spec:\n      containers:\n        - name: nginx\n          image: nginx:1.27\n          readinessProbe: { httpGet: { path: /healthz, port: 80 }, periodSeconds: 5 }\nEOF\nkubectl expose deploy probe --port=80 -n web"],
    ['It runs, but is NOT Ready — and has no endpoints', 'kubectl get pods -n web -l app=probe\nkubectl get endpoints probe -n web\nkubectl describe pod -n web -l app=probe | tail -6'],
    ['Fix it from inside the pod, watch it become Ready', 'kubectl exec -n web deploy/probe -- sh -c "echo ok > /usr/share/nginx/html/healthz"\nkubectl get pods -n web -l app=probe -w'],
    ['A liveness probe that always fails: restarts', "kubectl apply -f - <<'EOF'\napiVersion: v1\nkind: Pod\nmetadata: { name: live, namespace: web }\nspec:\n  containers:\n    - name: nginx\n      image: nginx:1.27\n      livenessProbe: { httpGet: { path: /nope, port: 80 }, periodSeconds: 5, failureThreshold: 2 }\nEOF"],
    ['…watch RESTARTS climb, then read the events', 'kubectl get pod live -n web -w\nkubectl get events -n web --field-selector involvedObject.name=live'],
    ['OOMKilled: a memory limit that is too small', "kubectl apply -f - <<'EOF'\napiVersion: v1\nkind: Pod\nmetadata: { name: hungry, namespace: web }\nspec:\n  containers:\n    - name: pg\n      image: postgres:16-alpine\n      env: [{ name: POSTGRES_PASSWORD, value: x }]\n      resources: { limits: { memory: 20Mi } }\nEOF\nkubectl get pod hungry -n web -w"],
    ['…see why', 'kubectl describe pod hungry -n web | grep -A4 "Last State"'],
    ['Init container fills a shared folder; nginx serves it (+ a sidecar)', "kubectl apply -f - <<'EOF'\napiVersion: apps/v1\nkind: Deployment\nmetadata: { name: site, namespace: web }\nspec:\n  replicas: 1\n  selector: { matchLabels: { app: site } }\n  template:\n    metadata: { labels: { app: site } }\n    spec:\n      initContainers:\n        - name: prepare\n          image: busybox:1.36\n          command: [\"sh\", \"-c\", \"echo '<h1>written by the init container</h1>' > /work/index.html\"]\n          volumeMounts: [{ name: html, mountPath: /work }]\n      containers:\n        - name: nginx\n          image: nginx:1.27\n          volumeMounts: [{ name: html, mountPath: /usr/share/nginx/html }]\n        - name: sidecar\n          image: busybox:1.36\n          command: [\"sleep\", \"3600\"]\n      volumes:\n        - { name: html, emptyDir: {} }\nEOF\nkubectl expose deploy site --port=80 -n web"],
    ['Watch it start: Init:0/1 → PodInitializing → 2/2', 'kubectl get pods -n web -l app=site -w'],
    ['Its page came from the init container', 'kubectl run c1 --rm -i --restart=Never --image=busybox:1.36 -n web -- wget -qO- http://site'],
    ['Pick a container with -c', 'kubectl logs deploy/site -n web -c nginx\nkubectl exec deploy/site -n web -c sidecar -- ps\nkubectl describe pod -n web -l app=site | sed -n "/Init Containers/,/Conditions/p"'],
    ['An init container that waits for a Service', "kubectl apply -f - <<'EOF'\napiVersion: v1\nkind: Pod\nmetadata: { name: waiter, namespace: web }\nspec:\n  initContainers:\n    - name: wait-db\n      image: busybox:1.36\n      command: [\"sh\", \"-c\", \"until nslookup mydb; do echo waiting; sleep 2; done\"]\n  containers:\n    - name: app\n      image: nginx:1.27\nEOF"],
    ['…it waits (Init:0/1). Create the Service it needs:', 'kubectl create deployment mydb --image=redis:7-alpine -n web\nkubectl expose deploy mydb --port=6379 -n web\nkubectl get pod waiter -n web -w'],
  ] });
  insertAfter('3c · Probes', { t: '4c · Ingress (kind needs ingress-nginx)', items: [
    ['A kind cluster with ports 80/443 mapped (new cluster, name: ing)', "cat > ingress-kind.yaml <<'EOF'\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nname: ing\nnodes:\n  - role: control-plane\n    extraPortMappings:\n      - containerPort: 80\n        hostPort: 80\n      - containerPort: 443\n        hostPort: 443\n  - role: worker\nEOF\nkind create cluster --config ingress-kind.yaml"],
    ['Two apps behind two Services', 'kubectl create namespace web\nkubectl create deployment web --image=nginx:1.27 -n web\nkubectl expose deploy web --port=80 -n web\nkubectl create deployment api --image=httpd:2.4 -n web\nkubectl expose deploy api --port=80 -n web'],
    ['The Ingress rules (host-based)', "kubectl apply -f - <<'EOF'\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata: { name: site, namespace: web }\nspec:\n  ingressClassName: nginx\n  rules:\n    - host: web.local\n      http:\n        paths:\n          - { path: /, pathType: Prefix, backend: { service: { name: web, port: { number: 80 } } } }\n    - host: api.local\n      http:\n        paths:\n          - { path: /, pathType: Prefix, backend: { service: { name: api, port: { number: 80 } } } }\nEOF"],
    ['Nothing answers yet: there is no controller', 'curl -s http://localhost/ | head -2'],
    ['Install the controller', 'kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml\nkubectl get pods -n ingress-nginx\nkubectl get ingress -n web'],
    ['Choose the app with a Host header', 'curl -s -H "Host: web.local" http://localhost/ | head -3\ncurl -s -H "Host: api.local" http://localhost/ | head -3\ncurl -s -H "Host: nope.local" http://localhost/ | head -3'],
    ['…or make the names resolve, like a real laptop', "echo '127.0.0.1 web.local api.local' | sudo tee -a /etc/hosts\ncurl -s http://api.local/ | head -3\ncurl -s -o /dev/null -w '%{http_code}\\n' http://web.local/"],
    ['Finished? Go back to your first cluster (and remove this one)', 'kubectl config use-context kind-local-cluster-1\nkind delete cluster --name ing\nkubectl config use-context kind-local-cluster-1'],
  ] });
  add('7 · Your own images',
    ['Dockerfile: COPY your own page, ENV, EXPOSE, WORKDIR, RUN', "mkdir -p site\necho '<h1>My custom page</h1>' > site/index.html\ncat > site/Dockerfile <<'EOF'\nFROM nginx:1.27\nLABEL team=web\nENV APP_ENV=prod\nWORKDIR /usr/share/nginx/html\nCOPY index.html .\nRUN echo 'built at build time' > build.txt\nEXPOSE 80\nEOF\ndocker build -t site:v1 site"],
    ['Look inside the image\'s config', 'docker inspect site:v1 | head -20'],
    ['Run it: your COPY\'d page is what answers', 'kind load docker-image site:v1 --name local-cluster-1\nkubectl create deployment site1 --image=site:v1 -n web --port=80\nkubectl expose deploy site1 --port=80 -n web\nkubectl rollout status deploy/site1 -n web\nkubectl run c1 --rm -i --restart=Never --image=busybox:1.36 -n web -- wget -qO- http://site1'],
    ['…and inside the container, the files are there', 'kubectl exec deploy/site1 -n web -- cat /usr/share/nginx/html/build.txt'],
    ['Multi-stage build (COPY --from)', "cat > site/Dockerfile.ms <<'EOF'\nFROM alpine:3.20 AS builder\nRUN mkdir -p /out && echo 'compiled artifact' > /out/app.txt\nFROM nginx:1.27\nCOPY --from=builder /out/app.txt /usr/share/nginx/html/index.html\nEOF\ndocker build -f site/Dockerfile.ms -t ms:1 site"],
    ['ENV can satisfy a base image (postgres needs a password)', "printf 'FROM postgres:16-alpine\\nENV POSTGRES_PASSWORD=secret\\n' > site/Dockerfile.pg\ndocker build -f site/Dockerfile.pg -t mypg:1 site\nkind load docker-image mypg:1 --name local-cluster-1\nkubectl create deployment mypg --image=mypg:1 -n db\nkubectl get pods -n db"],
    ['CMD decides what runs: sleep infinity stays up, echo exits', "printf 'FROM alpine:3.20\\nCMD [\"sleep\",\"infinity\"]\\n' > site/Dockerfile.sl\ndocker build -f site/Dockerfile.sl -t sl:1 site\nprintf 'FROM alpine:3.20\\nCMD [\"echo\",\"hi\"]\\n' > site/Dockerfile.ec\ndocker build -f site/Dockerfile.ec -t ec:1 site\nkind load docker-image sl:1 ec:1 --name local-cluster-1\nkubectl create deployment sl --image=sl:1 -n web\nkubectl create deployment ec --image=ec:1 -n web\nkubectl get pods -n web"],
    ['A missing COPY source fails like the real thing', 'printf "FROM nginx:1.27\\nCOPY nope.html /x/\\n" > site/Dockerfile.bad\ndocker build -f site/Dockerfile.bad -t bad:1 site'],
  );
  insertAfter('7 · Your own', { t: '7b · docker on its own (no cluster)', items: [
    ['Run a container, throw it away', 'docker run --rm alpine echo hello from alpine'],
    ['A web server on a host port', 'docker run -d --name web1 -p 8085:80 nginx:1.27\ncurl -s localhost:8085 | head -3'],
    ['Look around inside it', 'docker exec web1 ps\ndocker exec web1 cat /etc/nginx/conf.d/default.conf\ndocker logs web1'],
    ['An interactive shell in a fresh container', 'docker run -it --rm alpine sh'],
    ['…type: whoami / cat /etc/os-release / exit', 'whoami\ncat /etc/os-release | head -2\nexit'],
    ['Bind mount: your folder is the web root (edit it live)', "mkdir -p mysite && echo '<h1>v1</h1>' > mysite/index.html\ndocker run -d --name bm -p 8086:80 -v ./mysite:/usr/share/nginx/html nginx:1.27\ncurl -s localhost:8086\necho '<h1>v2 edited</h1>' > mysite/index.html\ncurl -s localhost:8086"],
    ['A named volume outlives the container', 'docker run --rm -v mydata:/data alpine sh -c "echo persisted > /data/note.txt"\ndocker volume ls\ndocker run --rm -v mydata:/data alpine cat /data/note.txt'],
    ['Copy files in and out; inspect', "echo hello > local.txt\ndocker cp local.txt web1:/tmp/local.txt\ndocker exec web1 cat /tmp/local.txt\ndocker inspect --format '{{.State.Status}} {{.NetworkSettings.IPAddress}}' web1"],
    ['Resource use and processes', 'docker stats --no-stream\ndocker top web1'],
    ['docker compose: three services from one file', "mkdir -p stack/html && echo '<h1>compose site</h1>' > stack/html/index.html\ncat > stack/compose.yaml <<'EOF'\nservices:\n  web:\n    image: nginx:1.27\n    ports: [\"9000:80\"]\n    volumes: [\"./html:/usr/share/nginx/html\"]\n    depends_on: [cache]\n  cache:\n    image: redis:7-alpine\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD: secret\nEOF\ncd stack && docker compose up -d"],
    ['…use it, then take it down', 'docker compose ps\ncurl -s localhost:9000\ndocker compose exec cache redis-cli ping\ndocker compose down\ncd ~'],
    ['Search, login, clean up', 'docker search nginx\ndocker login -u me -p pw registry.example.com\ndocker system prune -f'],
  ] });
  add('9 · Helm',
    ['Scaffold a brand-new chart', 'helm2 create shop\nls shop shop/templates\nhelm2 lint shop'],
    ['Install it twice under different names', 'helm2 install shop --name s1 --namespace web --wait --timeout 120\nhelm2 install shop --name s2 --namespace web\nhelm2 ls'],
    ['Package it, install from the .tgz', 'helm2 package shop\nls *.tgz\nhelm2 install shop-0.1.0.tgz --name s3 --namespace web'],
    ['Charts from the stable repo', 'helm2 search stable/\nhelm2 inspect values stable/redis\nhelm2 install stable/redis --name r1 --namespace web --set usePassword=true,password=s3cret'],
    ['…use what it installed', 'kubectl rollout status deploy/r1-redis-master -n web\nkubectl get pods,svc,secret -n web -l release=r1\nkubectl exec -n web deploy/r1-redis-master -- redis-cli ping'],
    ['A database from a chart', 'helm2 install stable/postgresql --name pg --namespace web --set postgresqlPassword=hunter2\nkubectl rollout status deploy/pg-postgresql -n web\nkubectl get pods -n web -l release=pg'],
    ['A parent chart with a subchart (dependency)', "helm2 create app\nprintf 'dependencies:\\n  - name: redis\\n    version: 10.x.x\\n    repository: https://charts.helm.sh/stable\\n    condition: redis.enabled\\n' > app/requirements.yaml\nprintf 'redis:\\n  enabled: true\\n  usePassword: true\\n' >> app/values.yaml\nhelm2 dependency update app\nhelm2 dependency list app"],
    ['…the subchart is rendered with the parent', 'helm2 template app --name d1 --namespace web | grep "^# Source"\nhelm2 template app --name d1 --namespace web --set redis.enabled=false | grep -c "charts/redis"'],
  );
  insertAfter('9 · Helm', { t: '9b · kubectl power tools', items: [
    ['Wait until things are ready (scripts love this)', 'kubectl wait --for=condition=available deployment/web -n web --timeout=60s\nkubectl wait --for=condition=ready pod -l app=web -n web --timeout=60s'],
    ['Wait on any field', "kubectl wait --for=jsonpath='{.status.phase}'=Running pod -l app=web -n web"],
    ['Edit a live object (opens the Files tab; Apply or Cancel in the banner)', 'kubectl edit deployment web -n web'],
    ['Pick your own columns', 'kubectl get pods -A -o custom-columns=NS:.metadata.namespace,NAME:.metadata.name,NODE:.spec.nodeName,STATUS:.status.phase'],
    ['Sort, and show a label as a column', 'kubectl get pods -A --sort-by=.metadata.name -L app'],
    ['JSONPath filters', "kubectl get deploy web -n web -o jsonpath='{.spec.template.spec.containers[?(@.name==\"nginx\")].image}'\nkubectl get pod -n web -l app=web -o jsonpath='{.items[0].status.conditions[?(@.type==\"Ready\")].status}'"],
    ['Pause a rollout, change things, resume', 'kubectl rollout pause deployment/web -n web\nkubectl set image deployment/web nginx=nginx:1.26 -n web\nkubectl get deploy web -n web\nkubectl rollout resume deployment/web -n web'],
    ['Replace from a file', 'kubectl get deploy web -n web -o yaml > web.yaml\nsed -i "" "s/replicas: 2/replicas: 3/" web.yaml\nkubectl replace -f web.yaml'],
    ['More create commands', 'kubectl create cronjob hello --image=busybox:1.36 --schedule="*/1 * * * *" -n web -- echo hi\nkubectl create ingress site --rule="web.local/*=web:80" --class=nginx -n web\nkubectl create pdb webpdb --selector=app=web --min-available=1 -n web'],
    ['Built-in docs', 'kubectl explain deployment.spec\nkubectl explain pod'],
    ['API health', 'kubectl get --raw /healthz'],
  ] });
  insertAfter('10 · Who may', { t: '10b · Shell tools (pipes, loops, jq, awk)', items: [
    ['Refresh a command every 2 seconds (Ctrl-C to stop)', 'watch -n 2 kubectl get pods -A'],
    ['Count pods per namespace', "kubectl get pods -A --no-headers | awk '{print $1}' | sort | uniq -c"],
    ['kubectl + jq', "kubectl get pods -n web -o json | jq -r '.items[].metadata.name'"],
    ['jq: pick fields into new objects', "kubectl get pods -n web -o json | jq -c '.items[] | {name: .metadata.name, node: .spec.nodeName}'"],
    ['for loop', 'for ns in web cache db; do echo "== $ns"; kubectl get pods -n $ns --no-headers | wc -l; done'],
    ['if / while / arithmetic', 'i=0\nwhile [ $i -lt 3 ]; do echo "round $i"; i=$((i+1)); done\nif [ -f note.txt ]; then echo "note.txt exists"; else echo "no note"; fi'],
    ['cut, sed, grep -A, tee, xargs', "echo 'a,b,c' | cut -d, -f2\nkubectl describe pod -n web -l app=web | sed -n '/Events/,$p' | head\nkubectl get pods -A | grep -A1 coredns\nkubectl get ns --no-headers | tee namespaces.txt | wc -l\ncat namespaces.txt | awk '{print $1}' | xargs -n1 echo ns:"],
    ['find, alias, date', "find ~ -name '*.yaml'\nalias kgp='kubectl get pods'\nkgp -A\ndate +%Y-%m-%d"],
  ] });
  // completion lists for the new commands live in PG.complete (90_ui.js)
})();
