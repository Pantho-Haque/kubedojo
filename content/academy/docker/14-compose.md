---
id: d-compose
title: 'Compose: one file for the whole app'
emoji: "\U0001F9E9"
stage: 3
format: html
quiz:
  - q: What does a Compose service describe?
    options:
      - A recipe/configuration for an app component
      - A Kubernetes Service object
    answer: 0
    why: The word service has different meanings in Docker Compose and Kubernetes.
---
<div class="box idea"><div class="tag">The big idea</div>Compose describes services, networks, and volumes together. A service is the recipe for one app component; containers are the instances that run it.</div>
<details class="file"><summary>📄 Our complete compose.yaml</summary><pre tabindex="0">name: pizza-learning
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
</pre></details>
<p><b>web</b> answers the browser and calls <b>api</b>. The API stores a counter in a named volume. Only web publishes a host port. Both join the project network and use DNS service names.</p>
<div class="cmd"><pre tabindex="0">docker compose config
docker compose up -d --build --wait
docker compose ps
docker compose logs --tail 50</pre><button class="copy">Copy</button></div>
<details class="file"><summary>Common traps and useful edge cases</summary><p>Use the modern <code>docker compose</code> command. Top-level <code>version:</code> is obsolete for current Compose. A project name scopes container/network/volume names; <code>-p</code> overrides the default. Reuse the same project name when you want the same data volume.</p></details>
