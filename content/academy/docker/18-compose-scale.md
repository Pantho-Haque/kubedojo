---
id: d-compose-scale
title: 'Development, scaling, and production limits'
emoji: "\U0001F6E0️"
stage: 3
format: html
---
<p>For development, bind mounts or Compose Watch can shorten the edit/build/run loop. For deployment, prefer a tested image and explicit configuration so the result is reproducible.</p>
<div class="cmd"><pre tabindex="0">docker compose exec web python --version
docker compose run --rm --no-deps web python --version
# exec uses an existing container; run creates a one-off container.</pre><button class="copy">Copy</button></div>
<details class="file"><summary>Common traps and useful edge cases</summary><ul><li><code>docker compose run</code> does not publish the service’s ports by default; <code>--service-ports</code> opts in and may collide with running services.</li><li><code>--scale api=3</code> needs an app/data model that supports replicas. Do not scale our SQLite demo this way.</li><li>A fixed <code>container_name</code> prevents normal service scaling. Fixed host ports also collide across replicas.</li><li>Compose does not automatically supply a public load balancer or guaranteed zero-downtime rolling updates.</li><li>On a single Docker host, losing that host loses service availability. Restart policies do not provide multi-node failover.</li><li>For production, plan updates, TLS, backups, log rotation, alerts, and recovery. Compose is not a substitute for operating the host.</li></ul></details>
