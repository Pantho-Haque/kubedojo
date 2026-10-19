---
id: service
title: 'Services: one address for many pods'
emoji: "\U0001F4DE"
stage: 1
format: html
quiz:
  - q: How does a Service decide which pods get traffic?
    options:
      - You list pod IPs in it
      - Its selector matches pod labels
      - It picks random pods in the cluster
    answer: 1
    why: Labels + selectors.
  - q: Another pod wants to call our pizza Service. What address does it use?
    options:
      - 'The IP of pizza pod #1'
      - 'http://pizza'
      - localhost
    answer: 1
    why: DNS name = Service name.
  - q: A pod is deleted while traffic is flowing (3 replicas). What happens?
    options:
      - Requests go to the remaining pods
      - All requests fail until it's back
    answer: 0
    why: >-
      The Service removes shutting-down pods from its ready endpoints. Real
      connections and shutdown timing still need care; this model updates
      instantly.
practice:
  kind: k8s
  config:
    nodes: 3
    replicas: 3
    service: true
    actions:
      - traffic
      - killPod
      - scale
    challenge:
      text: 'Serve 40 requests while deleting at least 2 pods, with 0 failures.'
      check: service
setup:
  - 'kubectl create deployment pizza --image=nginx:1.27 --replicas=3'
---
<div class="box story"><div class="tag">The problem</div>Your frontend needs to call the pizza app. But pizza pods keep dying and coming back with <b>new IPs</b>. Which IP do you put in your config?!</div>
<div class="box idea"><div class="tag">The big idea</div>A <b>Service</b> gives a group of pods one <b>stable name and IP</b>, and spreads requests across whichever pods are healthy right now. Callers just use <code>http://pizza</code>.</div>
<div class="box like"><div class="tag">Think of it like…</div>A restaurant's phone number ☎️. Staff come and go, but customers always dial the same number, and whoever is on shift picks up.</div>
<h2>How does it find the pods? Labels!</h2>
<p>Pods carry name tags (labels) like <code>app: pizza</code>. The Service has a <b>selector</b>, <code>app: pizza</code>, meaning “send traffic to any pod with this tag”. Kubernetes updates EndpointSlices, the list of addresses behind the Service, as matching Pods become ready or disappear.</p>
<h2>🎮 Try it</h2><p>Send requests and watch how they're shared out. Then choose <b>Start automatic requests</b> and delete pods while it's running. Does any request fail?</p><div data-sim></div>
<details class="file"><summary>📄 service.yaml</summary><pre tabindex="0">apiVersion: v1
kind: Service
metadata:
  name: pizza          # becomes the DNS name: http://pizza
spec:
  selector:
    app: pizza         # send to pods with this label
  ports:
  - port: 80           # the port callers use
    targetPort: 80     # the port the container listens on</pre></details>
<p>The cluster has built-in DNS. Any pod can reach this Service at <code>http://pizza</code> (same namespace) or <code>http://pizza.default.svc.cluster.local</code> (from anywhere in the cluster).</p>
<div class="cmd"><pre tabindex="0">kubectl expose deployment pizza --port=80   # creates the Service for you
kubectl get svc
kubectl get endpointslices                  # the live list of pod IPs behind it</pre><button class="copy">Copy</button></div>
<div class="box keep"><div class="tag">Remember</div><ul><li>Pods change. Services don't.</li><li>Service selector ↔ pod labels: that's what connects things in Kubernetes.</li><li>Inside the cluster, call services by name: <code>http://pizza</code>.</li></ul></div>
