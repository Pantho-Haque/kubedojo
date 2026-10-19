---
id: d-life
title: 'Run, stop, start, remove'
emoji: ▶️
stage: 0
format: html
quiz:
  - q: 'After stop then start, does the same container keep its writable files?'
    options:
      - 'Yes'
      - 'No'
    answer: 0
    why: 'Removal or replacement discards that layer, not an ordinary stop/start.'
practice:
  kind: docker
  mission: life
---
<div class="cmd"><pre tabindex="0">docker run -d --name pizza-demo -p 127.0.0.1:8080:80 nginx:1.28
docker ps
docker stop pizza-demo
docker ps -a
docker start pizza-demo
docker rm -f pizza-demo</pre><button class="copy">Copy</button></div>
<p><code>run</code> creates a new container. <code>start</code> starts an existing stopped one. Stop keeps its writable layer; removal deletes that layer. A stopped container also keeps its name.</p>
<h2>Practice safely in the browser</h2><div data-docker-sim></div>
<details class="file"><summary>Common traps and useful edge cases</summary><ul><li><code>--rm</code> removes the container after it exits; do not store important data in its writable layer.</li><li>A container stops when its main process exits. <code>-d</code> detaches your terminal; it does not keep a finished process alive.</li><li><code>exec</code> runs a command inside a running container. <code>attach</code> attaches to its main process; input or signals can affect it.</li></ul></details>
