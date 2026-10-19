---
id: outside
title: Letting the internet in
emoji: "\U0001F30D"
stage: 1
format: html
quiz:
  - q: You want to quickly look at a service from your laptop while developing.
    options:
      - Ingress
      - kubectl port-forward
      - LoadBalancer
    answer: 1
    why: It's temporary and needs no setup.
  - q: Your database should NEVER be reachable from the internet. Which type?
    options:
      - ClusterIP
      - NodePort
      - LoadBalancer
    answer: 0
    why: 'ClusterIP is internal only, and it''s the default.'
  - q: >-
      You have 5 web apps and want them all on one public address, routed by
      hostname or path.
    options:
      - 5 NodePorts
      - Ingress / Gateway
      - port-forward ×5
    answer: 1
    why: 'One front door, many rooms.'
  - q: You created an Ingress but nothing works. What's the most likely cause?
    options:
      - No ingress controller is installed
      - Ingress needs 5 replicas
      - The YAML must be JSON
    answer: 0
    why: It happens to everyone once.
---
<div class="box story"><div class="tag">The problem</div>The Service works <i>inside</i> the cluster. But your customers are on the internet. How do they get in?</div>
<div class="box idea"><div class="tag">The big idea</div>You choose how a Service is reachable with its <b>type</b>. For websites, put one smart front door in front of all your Services: an <b>Ingress</b>, or its newer replacement, the <b>Gateway API</b>.</div>
<table><tr><th>Option</th><th>What it does</th><th>Use it for</th></tr>
<tr><td><code>kubectl port-forward</code></td><td>tunnels a port to your laptop</td><td>debugging, local dev</td></tr>
<tr><td><b>ClusterIP</b> (default)</td><td>only reachable from inside the cluster</td><td>databases, internal APIs</td></tr>
<tr><td><b>NodePort</b></td><td>opens a port (30000–32767) on every node</td><td>quick tests, home labs</td></tr>
<tr><td><b>LoadBalancer</b></td><td>the cloud gives you a public IP</td><td>one service = one public IP</td></tr>
<tr><td><b>Ingress / Gateway</b></td><td>one entry point that routes by hostname and path</td><td>websites with many services</td></tr></table>
<div class="box like"><div class="tag">Think of it like…</div>An Ingress is a building's reception desk 🛎️. One street address: “pizza.com/api, go to the API team; pizza.com, go to the web team.”</div>
<div class="flow"><span>🌍 internet</span>→<span>🛎️ Ingress (pizza.com)</span>→<span>/api → Service <b>api</b> → pods</span><span>/ → Service <b>web</b> → pods</span></div>
<div class="box warnbox">⚠️ <b>Common mistake:</b> an Ingress is only a set of <i>rules</i>. Something has to carry them out: an <b>ingress controller</b> running as pods in the cluster (for example Traefik, which our k3s setup installs). With no controller, the rules do nothing.</div>
<details class="file"><summary>📄 ingress.yaml</summary><pre tabindex="0">apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pizza
spec:
  rules:
  - host: pizza.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: pizza
            port:
              number: 80</pre></details>
<div class="cmd"><pre tabindex="0">kubectl port-forward svc/pizza 8080:80    # then open http://localhost:8080</pre><button class="copy">Copy</button></div>
<div class="box keep"><div class="tag">Remember</div><ul><li>ClusterIP = inside only (the default). LoadBalancer = public IP. Ingress = one smart front door.</li><li>Ingress rules need an ingress controller to do anything.</li></ul></div>
