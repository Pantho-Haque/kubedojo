---
id: d-real
title: Build the real two-service app
emoji: "\U0001F4BB"
stage: 4
format: html
---
<p class="lead">Open a terminal only now. Install and start Docker Desktop or your chosen compatible Engine with Compose. This exercise is a small learning web server, not a production server.</p>
<label class="task"><input type="checkbox" data-task="d-real-tools"><span>Verify Docker and Compose, and confirm the Engine context</span></label><div class="cmd"><pre tabindex="0">docker version
docker compose version
docker context show</pre><button class="copy">Copy</button></div>
<p>Use a new working folder for this exercise. The next command writes four files there.</p>
<label class="task"><input type="checkbox" data-task="d-real-files"><span>Create the application files</span></label><div class="cmd"><pre tabindex="0">cat &gt; app.py &lt;&lt;'EOF'
import os
import signal
import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import urlopen

UPSTREAM = os.getenv("UPSTREAM", "")
DB_PATH = os.getenv("DB_PATH", "/data/pizza.db")
PORT = int(os.getenv("PORT", "8000"))
if not UPSTREAM:
    with sqlite3.connect(DB_PATH) as db:
        db.execute("CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY, count INTEGER NOT NULL)")
        db.execute("INSERT OR IGNORE INTO visits VALUES (1, 0)")

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            if self.path == "/healthz":
                body = b"healthy\n"
            elif self.path != "/":
                self.send_error(404)
                return
            elif UPSTREAM:
                with urlopen(UPSTREAM + "/", timeout=3) as response:
                    body = response.read()
            else:
                with sqlite3.connect(DB_PATH) as db:
                    db.execute("UPDATE visits SET count = count + 1 WHERE id = 1")
                    count = db.execute("SELECT count FROM visits WHERE id = 1").fetchone()[0]
                body = ("Pizza visits: " + str(count) + "\n").encode()
            self.send_response(200)
        except Exception as error:
            print(type(error).__name__, flush=True)
            self.send_response(503)
            body = b"Backend unavailable. Check the api logs and UPSTREAM address.\n"
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

def stop(signum, frame):
    raise SystemExit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGTERM, stop)
    with HTTPServer(("0.0.0.0", PORT), Handler) as server:
        print("Listening on port", PORT, flush=True)
        server.serve_forever()
EOF
cat &gt; Dockerfile &lt;&lt;'EOF'
# syntax=docker/dockerfile:1
FROM python:3.13-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1
RUN useradd --uid 10001 --create-home appuser \
    &amp;&amp; mkdir -p /data &amp;&amp; chown appuser:appuser /data
COPY --chown=appuser:appuser app.py ./app.py
USER appuser
EXPOSE 8000
CMD ["python", "app.py"]
EOF
cat &gt; .dockerignore &lt;&lt;'EOF'
.git
.env
.env.*
*.db
__pycache__
*.pyc
EOF
cat &gt; compose.yaml &lt;&lt;'EOF'
name: pizza-learning
services:
  api:
    build: .
    environment:
      DB_PATH: /data/pizza.db
    volumes:
      - pizza-data:/data
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthz', timeout=2)"]
      interval: 3s
      timeout: 3s
      retries: 10
      start_period: 5s
    restart: unless-stopped
    init: true
    mem_limit: 128m
    cpus: 0.5
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
  web:
    build: .
    environment:
      UPSTREAM: http://api:8000
    ports:
      - "127.0.0.1:8080:8000"
    depends_on:
      api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthz', timeout=2)"]
      interval: 3s
      timeout: 3s
      retries: 10
    restart: unless-stopped
    init: true
    mem_limit: 128m
    cpus: 0.5
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
volumes:
  pizza-data:
EOF</pre><button class="copy">Copy</button></div>
<details class="file"><summary>What does this app do?</summary><p>web proxies requests to api using its DNS name. api stores a visit counter in SQLite under /data. A GET to / intentionally increments the counter for this demo. The health endpoint does not increment it. The app uses Python’s standard library.</p><details class="file"><summary>📄 app.py</summary><pre tabindex="0">import os
import signal
import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import urlopen

UPSTREAM = os.getenv("UPSTREAM", "")
DB_PATH = os.getenv("DB_PATH", "/data/pizza.db")
PORT = int(os.getenv("PORT", "8000"))
if not UPSTREAM:
    with sqlite3.connect(DB_PATH) as db:
        db.execute("CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY, count INTEGER NOT NULL)")
        db.execute("INSERT OR IGNORE INTO visits VALUES (1, 0)")

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            if self.path == "/healthz":
                body = b"healthy\n"
            elif self.path != "/":
                self.send_error(404)
                return
            elif UPSTREAM:
                with urlopen(UPSTREAM + "/", timeout=3) as response:
                    body = response.read()
            else:
                with sqlite3.connect(DB_PATH) as db:
                    db.execute("UPDATE visits SET count = count + 1 WHERE id = 1")
                    count = db.execute("SELECT count FROM visits WHERE id = 1").fetchone()[0]
                body = ("Pizza visits: " + str(count) + "\n").encode()
            self.send_response(200)
        except Exception as error:
            print(type(error).__name__, flush=True)
            self.send_response(503)
            body = b"Backend unavailable. Check the api logs and UPSTREAM address.\n"
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

def stop(signum, frame):
    raise SystemExit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGTERM, stop)
    with HTTPServer(("0.0.0.0", PORT), Handler) as server:
        print("Listening on port", PORT, flush=True)
        server.serve_forever()
</pre></details></details>
<label class="task"><input type="checkbox" data-task="d-real-up"><span>Validate and start the stack</span></label><div class="cmd"><pre tabindex="0">docker compose config -q
docker compose up -d --build --wait
docker compose ps</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="d-real-visit"><span>Open http://localhost:8080 twice and see the number increase</span></label><div class="cmd"><pre tabindex="0">curl http://localhost:8080
curl http://localhost:8080</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="d-real-dns"><span>Ask web to reach api directly over the internal network</span></label><div class="cmd"><pre tabindex="0">docker compose exec web python -c "import urllib.request; print(urllib.request.urlopen('http://api:8000/').read().decode())"</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="d-real-replace"><span>Recreate the API and verify that the named volume kept its counter</span></label><div class="cmd"><pre tabindex="0">docker compose up -d --force-recreate --wait api
curl http://localhost:8080</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="d-real-break"><span>Stop the API, observe web’s error, then recover</span></label><div class="cmd"><pre tabindex="0">docker compose stop api
curl -i http://localhost:8080
docker compose start api
docker compose ps
# wait for api to become healthy, then:
curl http://localhost:8080</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="d-real-down"><span>Take the stack down and bring it back without deleting data</span></label><div class="cmd"><pre tabindex="0">docker compose down
docker compose up -d --wait
curl http://localhost:8080</pre><button class="copy">Copy</button></div>
<p>If port 8080 is busy, change only the host port in <code>127.0.0.1:8080:8000</code> and use that port in your browser. Keep the stack for the backup exercise next.</p>
