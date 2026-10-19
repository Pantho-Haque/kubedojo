---
id: health
title: Health checks & resource limits
emoji: ❤️
stage: 2
format: html
quiz:
  - q: A readiness probe fails. What does Kubernetes do?
    options:
      - Restarts the container
      - Stops sending it traffic until the probe passes again
      - Deletes the node
    answer: 1
    why: Readiness only controls traffic.
  - q: A liveness probe keeps failing. What happens?
    options:
      - The container is restarted
      - Nothing
    answer: 0
    why: 'That''s what liveness is for: getting a stuck app unstuck.'
  - q: A pod's status says <code>OOMKilled</code>. What does that mean?
    options:
      - It used more memory than its limit and was killed
      - Out Of Money
      - The node is offline
    answer: 0
    why: OOM = Out Of Memory.
  - q: A pod is stuck Pending with “Insufficient cpu”. Why?
    options:
      - No node has enough unreserved CPU for its requests
      - The image is wrong
      - The app crashed
    answer: 0
    why: You just made this happen in the game.
practice:
  kind: k8s
  config:
    nodes: 2
    cap: 3
    replicas: 2
    actions:
      - scale
      - killPod
    challenge:
      text: 'Create a waiting pod, then free enough room for every remaining copy.'
      check: health
---
<div class="box story"><div class="tag">The problem</div>Two sneaky problems: (1) your app is “running” but frozen, and Kubernetes keeps sending it traffic. (2) One pod leaks memory and eats the whole node, starving the pods next to it.</div>
<div class="box idea"><div class="tag">The big idea</div><b>Probes</b> tell Kubernetes how to check your app's health. <b>Requests and limits</b> tell it how much CPU and memory your app needs and how much it's allowed to use.</div>
<table><tr><th>Probe</th><th>Question it asks</th><th>If it fails…</th></tr>
<tr><td>🟢 <b>readiness</b></td><td>“Can you take traffic right now?”</td><td>removed from the Service (not restarted)</td></tr>
<tr><td>❤️ <b>liveness</b></td><td>“Are you alive at all?”</td><td>the container is restarted</td></tr>
<tr><td>🐢 <b>startup</b></td><td>“Still booting, give me time”</td><td>holds off the other two for slow-starting apps</td></tr></table>
<table><tr><th>Setting</th><th>Meaning</th></tr>
<tr><td><b>requests</b></td><td>The <b>reservation</b>. The scheduler only places a pod on a node that has this much free.</td></tr>
<tr><td><b>limits</b></td><td>The <b>ceiling</b>. Go over the memory limit and the container is killed (<b>OOMKilled</b>). Go over the CPU limit and it's slowed down, not killed.</td></tr></table>
<h2>🎮 Try it</h2><p>This cluster has small nodes. Based on their requests, each node fits only 3 pizza pods. Scale up and see what happens when no node has room.</p><div data-sim></div>
<p>In this practice, a waiting pod is what <code>kubectl describe pod</code> would explain: <code>0/2 nodes are available: 2 Insufficient cpu</code>. To fix it, scale down or add capacity. Lower requests only if measurements show the app really needs fewer resources.</p>
<details class="file"><summary>📄 resources + probes in a container</summary><pre tabindex="0">      containers:
      - name: pizza
        image: nginx:1.27
        resources:
          requests: { cpu: "250m", memory: "128Mi" }  # 250m = 1/4 of a CPU core
          limits:   { memory: "256Mi" }
        readinessProbe:
          httpGet: { path: /, port: 80 }
          periodSeconds: 5
        livenessProbe:
          httpGet: { path: /, port: 80 }
          initialDelaySeconds: 10</pre></details>
<div class="box keep"><div class="tag">Remember</div><ul><li>Readiness = traffic on/off. Liveness = restart.</li><li>Requests = what the scheduler reserves. Limits = the hard ceiling.</li><li>Always set requests. Always set a memory limit.</li></ul></div>
