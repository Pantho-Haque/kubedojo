---
id: d-compose-life
title: 'Up, restart, recreate, down'
emoji: "\U0001F504"
stage: 3
format: html
quiz:
  - q: You changed environment in compose.yaml. Which applies it?
    options:
      - Only docker compose restart
      - 'docker compose up -d, allowing recreation'
    answer: 1
    why: Restart does not reread new configuration into an existing container.
---
<table><tr><th>Command</th><th>What to expect</th></tr><tr><td>up -d</td><td>Create/start services; recreate when required by changed configuration or image</td></tr><tr><td>stop / start</td><td>Stop/start existing containers; preserve their writable layers</td></tr><tr><td>restart</td><td>Restart existing containers; does not apply newly edited environment settings</td></tr><tr><td>up -d --build</td><td>Build images and apply service configuration</td></tr><tr><td>up -d --force-recreate</td><td>Replace containers even if config appears unchanged</td></tr><tr><td>down</td><td>Remove project containers and networks; keep named volumes by default</td></tr><tr><td>down -v</td><td>Also remove declared project named volumes and attached anonymous volumes; external volumes are excluded</td></tr></table>
<details class="file"><summary>Common traps and useful edge cases</summary><p>Removing a container is different from deleting its data volume. Anonymous volumes are harder to reattach reliably after replacement; use named volumes for persistent app data. Rebuilding an image alone is not the same as recreating the running service from it.</p></details>
