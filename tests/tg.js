const { PG, sim, run, stop, sh, out } = require('./harness.js');
(async () => {
  console.log('### run one-shot + exec + inspect');
  await run('docker run --rm alpine echo hello from alpine');
  await run('docker run --rm busybox cat /etc/os-release');
  await run('docker run -d --name web -p 8080:80 nginx:1.27');
  await run('curl -s localhost:8080 | head -2');
  await run('docker exec web ps');
  await run('docker exec web cat /etc/nginx/conf.d/default.conf | head -4');
  await run('docker logs web --tail 3');
  await run("docker inspect --format '{{.State.Status}} {{.NetworkSettings.IPAddress}} {{.Config.Image}}' web");
  await run('docker stats --no-stream'); await run('docker top web');
  console.log('### bind mount: edit a file on the host, container sees it');
  await run('mkdir -p site && echo "<h1>v1 on host</h1>" > site/index.html');
  await run('docker run -d --name bm -p 8081:80 -v ./site:/usr/share/nginx/html nginx:1.27'); await run('curl -s localhost:8081');
  await run('echo "<h1>v2 edited</h1>" > site/index.html; curl -s localhost:8081');
  console.log('### named volume survives container removal');
  await run('docker run --rm -v mydata:/data alpine sh -c "echo persisted > /data/note.txt"');
  await run('docker volume ls'); await run('docker run --rm -v mydata:/data alpine cat /data/note.txt');
  console.log('### cp both ways + interactive');
  await run('echo hello > local.txt; docker cp local.txt web:/tmp/local.txt; docker exec web cat /tmp/local.txt; docker cp web:/etc/hostname ./hn.txt; cat hn.txt');
  out.length = 0; for (const line of ['docker run -it --rm --name inter alpine sh', 'whoami', 'cat /etc/os-release | head -1', 'echo hi > /tmp/a; ls /tmp', 'exit', 'docker ps -a -q']) { const pr = sh.prompt(); await sh.submit(line); console.log(pr + line); } console.log(out.join('\n'));
  console.log('### compose');
  await run(`mkdir -p proj && cat > proj/compose.yaml <<'EOF'
services:
  web:
    image: nginx:1.27
    ports: ["9000:80"]
    volumes: ["./html:/usr/share/nginx/html"]
    depends_on: [cache]
  cache:
    image: redis:7-alpine
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
EOF
mkdir -p proj/html; echo "<h1>compose site</h1>" > proj/html/index.html`, false);
  await run('cd proj && docker compose up -d'); await run('docker compose ps'); await run('curl -s localhost:9000');
  await run('docker compose exec cache redis-cli ping'); await run('docker exec proj-web-1 curl -s http://cache | head -2');
  await run('docker compose down'); await run('cd ..');
  await run('docker ps -a'); await run('docker system prune -f');
  stop();
})().catch(e => { console.error(e); process.exit(1); });
