const { PG, sim, run, stop, sh } = require('./harness.js');
(async () => {
  await run('kind create cluster --name lab', false); await run('kubectl create namespace web', false);
  await run('mkdir -p app', false);
  await run(`cat > app/index.html <<'EOF'
<h1>My custom page</h1>
EOF`, false);
  await run(`cat > app/Dockerfile <<'EOF'
# a web app
FROM nginx:1.27
LABEL team=web
ENV APP_ENV=prod
WORKDIR /usr/share/nginx/html
COPY index.html .
RUN echo "built at build time" > /usr/share/nginx/html/build.txt && \\
    mkdir -p /usr/share/nginx/html/api
EXPOSE 80
EOF`, false);
  await run('docker build -t my-app:v1 app', false);
  await run('kind load docker-image my-app:v1 --name lab', false);
  await run('kubectl create deployment my-app --image=my-app:v1 -n web --port=80', false);
  await run('kubectl expose deploy my-app --port=80 -n web', false);
  await run('kubectl rollout status deploy/my-app -n web', false);
  await run('kubectl run c1 --rm -i --restart=Never --image=busybox:1.36 -n web -- wget -qO- http://my-app');
  console.log('--- COPY of a missing file fails ---');
  await run('printf "FROM nginx:1.27\\nCOPY nope.html /x/\\n" > app/Dockerfile.bad; docker build -f app/Dockerfile.bad -t bad:1 app');
  console.log('--- multi-stage ---');
  await run(`cat > app/Dockerfile.ms <<'EOF'
FROM alpine:3.20 AS builder
RUN mkdir -p /out && echo "compiled artifact" > /out/app.txt
FROM nginx:1.27
COPY --from=builder /out/app.txt /usr/share/nginx/html/index.html
EOF`, false);
  await run('docker build -f app/Dockerfile.ms -t ms:1 app && kind load docker-image ms:1 --name lab', false);
  await run('kubectl create deployment ms --image=ms:1 -n web', false); await run('kubectl expose deploy ms --port=80 -n web', false);
  await sim.wait(15, { aborted: false });
  await run('kubectl run c2 --rm -i --restart=Never --image=busybox:1.36 -n web -- wget -qO- http://ms');
  console.log('--- CMD / ENV behaviours ---');
  await run('printf "FROM alpine:3.20\\nCMD [\\"sleep\\",\\"infinity\\"]\\n" > app/D.sleep; docker build -f app/D.sleep -t sl:1 app >/dev/null; printf "FROM alpine:3.20\\nCMD [\\"echo\\",\\"hi\\"]\\n" > app/D.echo; docker build -f app/D.echo -t ec:1 app >/dev/null; printf "FROM postgres:16-alpine\\nENV POSTGRES_PASSWORD=x\\n" > app/D.pg; docker build -f app/D.pg -t pg:1 app >/dev/null', false);
  await run('kind load docker-image sl:1 ec:1 pg:1 --name lab', false);
  for (const n of ['sl', 'ec', 'pg']) await run(`kubectl create deployment ${n} --image=${n}:1 -n web`, false);
  await sim.wait(25, { aborted: false });
  await run('kubectl get pods -n web');
  stop();
})().catch(e => { console.error(e); process.exit(1); });
