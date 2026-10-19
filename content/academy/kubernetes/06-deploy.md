---
id: deploy
title: 'Deployments: stop looking after pods'
emoji: "\U0001F501"
stage: 1
format: html
quiz:
  - q: >-
      You delete a pod that belongs to a Deployment with <code>replicas:
      3</code>. What happens?
    options:
      - The Deployment now has 2
      - A new pod is created to get back to 3
      - The Deployment is deleted too
    answer: 1
    why: You saw it happen in the game.
  - q: How do you get 10 copies?
    options:
      - Copy-paste the pod YAML 10 times
      - Set replicas to 10 (or use kubectl scale)
      - Buy 10 servers
    answer: 1
    why: One number.
  - q: What is the <code>template</code> in a Deployment?
    options:
      - The pod recipe used to create every copy
      - A Helm chart
      - The list of nodes
    answer: 0
    why: Every pod the Deployment creates is stamped from that template.
practice:
  kind: k8s
  config:
    nodes: 3
    replicas: 3
    actions:
      - killPod
      - scale
    challenge:
      text: 'Delete 3 pods, then scale up to 6 Running replicas.'
      check: deploy
---
<div class="box story"><div class="tag">The problem</div>You created a Pod by hand, then deleted it. Nothing created a replacement. Its kubelet can restart a crashed container inside a surviving Pod, but a deleted Pod needs a controller to replace it.</div>
<div class="box idea"><div class="tag">The big idea</div>Create a <b>Deployment</b> instead: “keep <b>N</b> copies of this pod running, always.” It's the thermostat from the first lesson. You almost never create Pods yourself. You create Deployments, and they create the Pods.</div>
<p>Under the hood: a Deployment manages a <b>ReplicaSet</b>, which keeps N Pods alive. (That middle layer matters for updates later. For now you can ignore it.)</p>
<h2>🎮 Try it</h2><p>Below is a fake cluster with 3 nodes running a Deployment of 3 pizza pods. <b>Click a pod to delete it</b> 🔨, and use + / − to change the number of replicas. Watch the event log.</p><div data-sim></div>
<details class="file"><summary>📄 deployment.yaml</summary><pre tabindex="0">apiVersion: apps/v1
kind: Deployment
metadata:
  name: pizza
spec:
  replicas: 3              # the wish: 3 copies
  selector:
    matchLabels:
      app: pizza           # "the pods I own have this label"
  template:                # the pod recipe (same as the Pod lesson!)
    metadata:
      labels:
        app: pizza
    spec:
      containers:
      - name: pizza
        image: nginx:1.27</pre></details>
<div class="cmd"><pre tabindex="0">kubectl apply -f deployment.yaml
kubectl get pods -w                      # -w = keep watching live
kubectl delete pod &lt;one-of-the-pods&gt;     # a replacement gets a new name
kubectl scale deployment pizza --replicas=6</pre><button class="copy">Copy</button></div>
<div class="box keep"><div class="tag">Remember</div><ul><li>Don't create Pods. Create Deployments.</li><li><code>replicas</code> = how many copies. K8s keeps that number true forever.</li><li>To really remove pods, scale down or delete the Deployment. Deleting a pod just gets it replaced.</li></ul></div>
