---
id: pod
title: 'Pods, and reading YAML without fear'
emoji: "\U0001FADB"
stage: 0
format: html
quiz:
  - q: You delete a Pod owned by a Deployment. What happens?
    options:
      - The same pod gets repaired in place
      - 'A new pod is created, with a new name and IP'
      - It waits for you
    answer: 1
    why: >-
      The Deployment replaces a deleted Pod. A crashed container can also
      restart inside an existing Pod.
  - q: What are the 4 top-level parts of almost every manifest?
    options:
      - 'name, image, port, replicas'
      - 'apiVersion, kind, metadata, spec'
      - 'docker, compose, up, down'
    answer: 1
    why: Learn these 4 and any YAML file becomes readable.
  - q: 'Usually, how many containers are in a Pod?'
    options:
      - One
      - Exactly two
      - At least five
    answer: 0
    why: >-
      One container per pod is the normal case. Extra “sidecar” containers are
      for special jobs like log shipping.
---
<div class="box story"><div class="tag">The problem</div>Kubernetes needs to know about your container: its image, its ports, how much memory it needs, and sometimes a helper container that must live right next to it.</div>
<div class="box idea"><div class="tag">The big idea</div>Kubernetes doesn't run bare containers. It runs <b>Pods</b>: a thin wrapper around one container (sometimes a few that belong together) that share an IP address and storage. A Pod is the smallest thing Kubernetes manages.</div>
<div class="box like"><div class="tag">Think of it like…</div>Peas in a pod 🫛. Usually just one pea.</div>
<h2>Pods are cattle, not pets 🐄</h2>
<p>Pods are disposable. When one dies, Kubernetes doesn't fix it. It creates a <b>brand-new</b> pod with a new name and a new IP. Never rely on one specific pod. The next lessons show how to live with that.</p>
<h2>Every YAML file has the same 4 parts</h2>
<pre tabindex="0">apiVersion: v1          <span style="color:#8b94a7"># which version of the API this follows</span>
kind: Pod               <span style="color:#8b94a7"># WHAT you're describing</span>
metadata:               <span style="color:#8b94a7"># name + labels (tags)</span>
  name: pizza
  labels:
    app: pizza
spec:                   <span style="color:#8b94a7"># the wish: what it should look like</span>
  containers:
  - name: pizza
    image: nginx:1.27
    ports:
    - containerPort: 80</pre>
<p>Indentation matters (use 2 spaces, never tabs). A <code>-</code> means “an item in a list”. That's really all YAML is.</p>
<div class="cmd"><pre tabindex="0">kubectl apply -f pod.yaml     # send the wish to the cluster
kubectl get pods              # see what's running
kubectl delete pod pizza      # gone, and nothing brings it back (yet!)</pre><button class="copy">Copy</button></div>
<div class="box keep"><div class="tag">Remember</div><ul><li>Pod = a wrapper around (usually) one container. The smallest thing K8s runs.</li><li>Pods are disposable: a new pod means a new name and a new IP.</li><li>Most workload manifests have apiVersion, kind, metadata, and spec. Some objects use other fields, such as data in a ConfigMap.</li></ul></div>
