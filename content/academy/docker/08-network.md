---
id: d-network
title: 'Ports, localhost, and service names'
emoji: "\U0001F50C"
stage: 2
format: html
quiz:
  - q: 'From web, how do you call api on the same Compose network?'
    options:
      - 'http://localhost:8080'
      - 'http://api:8000'
    answer: 1
    why: Use the service name and the port the app listens on inside its container.
practice:
  kind: docker
  mission: network
---
<div class="box idea"><div class="tag">The big idea</div>A published port maps a host address/port to a container port. Inside a container, localhost refers to that container—not another service or your laptop.</div>
<div class="flow"><span>Laptop localhost:8080</span>→<span>Published port</span>→<span>web:8000</span>→<span>api:8000 on the shared network</span></div>
<h2>Practice safely in the browser</h2><div data-docker-sim></div>
<details class="file"><summary>Common traps and useful edge cases</summary><ul><li>The app generally needs to listen on <code>0.0.0.0</code> inside the container to accept connections arriving through its network interface.</li><li><code>-p 127.0.0.1:8080:8000</code> limits host publication to loopback. Omitting the host address commonly publishes on all interfaces.</li><li>Compose creates a project network with DNS service names. Use <code>api:8000</code> between services, not the host-published port.</li><li>Two containers cannot bind the same host address/port. EXPOSE alone does not publish a port.</li><li><code>host.docker.internal</code> is useful on Docker Desktop; native Linux may need explicit host-gateway configuration. Do not assume Desktop and Linux networking are identical.</li></ul></details>
