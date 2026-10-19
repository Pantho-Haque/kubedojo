---
id: d-debug
title: 'Debug first, clean up carefully'
emoji: "\U0001F50E"
stage: 2
format: html
---
<div class="cmd"><pre tabindex="0">docker ps -a
docker logs --tail 100 pizza-demo
docker inspect pizza-demo
docker exec -it pizza-demo sh
docker stats
docker system df</pre><button class="copy">Copy</button></div>
<p>First ask: did it exit, is it unhealthy, or is it simply unreachable? Then inspect logs, command, environment, mounts, network, and port mapping. <code>exec</code> needs a running container and the requested program must exist inside it.</p>
<details class="file"><summary>Common traps and useful edge cases</summary><ul><li>Name already in use: inspect <code>docker ps -a</code>; a stopped container still has its name.</li><li>Port allocated: another container or host process is using that address/port.</li><li>No space left: inspect images, writable layers, volumes, build cache, and log size before deleting anything.</li><li>Write application logs to stdout/stderr so the configured logging driver can collect them. Files written inside the container do not automatically appear in <code>docker logs</code>. Limit/rotate logs so a noisy app cannot fill the disk.</li><li>Inspect first, remove named disposable resources second. Global prune commands can affect other projects; volumes may contain important data.</li></ul></details>
<div class="box keep"><div class="tag">Remember</div><ul><li>ps → logs → inspect → targeted fix.</li><li>Rebuild containers from images and config instead of relying on hand-edits inside them.</li></ul></div>
