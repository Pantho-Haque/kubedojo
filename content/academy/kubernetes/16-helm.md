---
id: helm
title: 'Helm: stop copy-pasting YAML'
emoji: ⛵
stage: 3
format: html
quiz:
  - q: A Helm chart is…
    options:
      - A bundle of templated K8s manifests with values you fill in
      - A monitoring graph
      - A type of node
    answer: 0
    why: Think “app package”.
  - q: You want the same app in dev (1 replica) and prod (5 replicas).
    options:
      - Copy all the YAML into two folders and edit by hand
      - 'One chart, two values files'
      - Two clusters with different kubectl versions
    answer: 1
    why: 'Same template, different values.'
---
<div class="box story"><div class="tag">The problem</div>Your app now has a Deployment, Service, Ingress, ConfigMap, Secret and PVC, for dev, staging and prod. You're copy-pasting YAML and changing 3 values each time. 😩</div>
<div class="box idea"><div class="tag">The big idea</div><b>Helm</b> is a package manager for Kubernetes, like brew or apt. A <b>chart</b> is a template for all those YAML files, and you fill in <b>values</b> (image tag, replicas, hostname) for each environment. One command installs, upgrades or rolls back the whole bundle.</div>
<div class="cmd"><pre tabindex="0">helm repo add podinfo https://stefanprodan.github.io/podinfo
helm install my-app podinfo/podinfo --set replicaCount=3
helm upgrade my-app podinfo/podinfo --set replicaCount=5
helm list
helm rollback my-app 1
helm uninstall my-app</pre><button class="copy">Copy</button></div>
<details class="file"><summary>📄 One chart, different values per environment</summary><pre tabindex="0"># values-prod.yaml
replicaCount: 5
image:
  tag: v2
ingress:
  host: pizza.com

# then:
# helm install pizza ./pizza-chart -f values-prod.yaml</pre></details>
<p><b>Also worth knowing:</b> <b>Kustomize</b> is built into kubectl (<code>kubectl apply -k</code>) and patches plain YAML without templates. <b>GitOps</b> tools (Argo CD, Flux) make a git repo the source of truth, and a controller in the cluster keeps the cluster matching it. That's the reconciliation loop again!</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>Chart = templated YAML bundle. Values = your settings for each environment.</li><li>helm install / upgrade / rollback / uninstall.</li></ul></div>
