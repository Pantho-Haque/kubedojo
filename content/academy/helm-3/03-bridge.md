---
id: h-bridge
title: Where Helm fits into Kubernetes
emoji: "\U0001F517"
stage: 0
format: html
quiz:
  - q: You close the terminal after installation. Who replaces a deleted Pod?
    options:
      - Helm must stay open
      - The Kubernetes Deployment/ReplicaSet controllers
      - Nobody
    answer: 1
    why: Kubernetes keeps reconciling the installed resources.
  - q: What tells Helm which cluster it will change?
    options:
      - The chart name
      - 'Your kubeconfig/current context, unless overridden'
      - The image tag
    answer: 1
    why: Check kubectl config current-context before installing.
---
<div class="box idea"><div class="tag">The big idea</div>Helm renders templates into ordinary Kubernetes YAML. During installation it sends resources to the Kubernetes API using your kubeconfig and permissions. Kubernetes controllers then create and maintain the Pods.</div>
<div class="flow"><span>Chart + values</span>→<span>Helm renders YAML</span>→<span>Kubernetes API</span>→<span>Deployment controller</span>→<span>Pods</span></div>
<p>A rendered Service is still a normal Service. Its selector must match the Pod labels. Helm does not replace the scheduler, kubelet, network, or storage system.</p>
<div class="cmd"><pre tabindex="0">helm template pizza ./pizza-chart
# prints YAML; does not install it
helm install pizza ./pizza-chart -n helm-practice --create-namespace --wait
# sends resources to your selected cluster and waits for readiness</pre><button class="copy">Copy</button></div>
<div class="box keep"><div class="tag">Remember</div><ul><li>helm template previews; helm install changes a cluster.</li><li>When a Pod disappears later, Kubernetes replaces it. Helm is not a continuously running repair loop.</li></ul></div>
