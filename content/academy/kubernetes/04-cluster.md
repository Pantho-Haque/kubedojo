---
id: cluster
title: 'The cluster: a brain and some muscles'
emoji: "\U0001F3E2"
stage: 0
format: html
quiz:
  - q: You run a kubectl command. Which component receives it?
    options:
      - Scheduler
      - API server
      - kubelet
      - etcd
    answer: 1
    why: The API server is the front door for everything.
  - q: Where is the desired state stored?
    options:
      - etcd
      - Inside the container
      - On your laptop
    answer: 0
    why: >-
      etcd is the cluster's memory. Lose it and the cluster forgets everything
      (that's why we back it up in Stage 5).
  - q: >-
      Which component runs on every worker node and actually gets containers
      running?
    options:
      - Controller manager
      - kubelet
      - Scheduler
    answer: 1
    why: kubelet is the agent on each node.
---
<div class="box story"><div class="tag">The problem</div>One server isn't enough: it can die, and it can only do so much. So you get 3 machines. Now who decides which app runs where? Who notices when a machine dies?</div>
<div class="box idea"><div class="tag">The big idea</div>A <b>cluster</b> is a group of machines called <b>nodes</b>. Some of them form the <b>control plane</b> (the brain 🧠). The rest are <b>worker nodes</b> (the muscles 💪) that actually run your containers.</div>
<div class="box like"><div class="tag">Think of it like…</div>A restaurant 🍽️. The office (control plane) takes orders and decides who cooks what. The kitchen stations (worker nodes) do the cooking.</div>
<p>Click each part to see what it does:</p>
<div class="cluster">
 <div class="cp"><div class="h">🧠 Control plane</div><div class="parts">
  <details><summary>🚪 API server</summary>“The order counter.” It's the <b>only</b> way in. kubectl, dashboards, and even the other parts all go through it.</details>
  <details><summary>📒 etcd</summary>“The order book.” A database that stores your wishes (desired state) and what's going on right now.</details>
  <details><summary>🪑 Scheduler</summary>“The host who seats guests.” When a new pod has no machine yet, it picks the best node (one with enough free CPU and memory).</details>
  <details><summary>🔁 Controller manager</summary>“The manager who keeps checking.” It runs the loops: “wanted 3, have 2, so make one more.”</details>
 </div></div>
 <div class="wk"><div class="h">💪 Every worker node has</div><div class="parts">
  <details><summary>👷 kubelet</summary>“The station chef.” It makes sure the containers assigned to <i>this</i> node are running, and reports back.</details>
  <details><summary>🐳 container runtime</summary>Usually containerd. It pulls images and starts containers when kubelet asks.</details>
  <details><summary>🔀 kube-proxy</summary>Sets up networking so traffic reaches the right pod (more on that in the Services lesson).</details>
 </div></div>
</div>
<h2>Follow one request through the cluster</h2>
<ol>
<li>You run <code>kubectl apply</code>. It goes to the <b>API server</b>.</li>
<li>The API server saves your wish in <b>etcd</b>.</li>
<li>A <b>controller</b> sees that a pod is needed and creates a pod record.</li>
<li>The <b>scheduler</b> sees a pod with no node and assigns it to node-2.</li>
<li>The <b>kubelet</b> on node-2 sees the assignment and tells the runtime to pull the image and start it.</li>
<li>kubelet reports “Running” back to the API server.</li></ol>
<p>This is the main coordination pattern: components <b>watch the API server and react</b>. The kubelet also talks to its local container runtime to actually start containers.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>Cluster = control plane (brain) + worker nodes (muscle).</li><li>Everything goes through the API server. etcd remembers. The scheduler places. Controllers fix. kubelet runs.</li></ul></div>
