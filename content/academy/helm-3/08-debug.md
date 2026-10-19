---
id: h-debug
title: Find the problem at the right layer
emoji: "\U0001F50E"
stage: 2
format: html
quiz:
  - q: 'YAML renders, but Pods show ImagePullBackOff. Where do you look next?'
    options:
      - The Pod Events and image name/credentials
      - The CSS of the chart
      - Only Chart.yaml version
    answer: 0
    why: Rendering cannot check whether a container image can actually be pulled.
---
<table><tr><th>Problem</th><th>First check</th></tr><tr><td>Templates do not render</td><td><code>helm lint ./pizza-chart</code> and <code>helm template</code></td></tr><tr><td>Wrong setting took effect</td><td><code>helm get values pizza -n helm-practice --all</code></td></tr><tr><td>Want to see installed manifests</td><td><code>helm get manifest pizza -n helm-practice</code></td></tr><tr><td>Release failed or is stuck</td><td><code>helm status</code>, then <code>kubectl get pods</code> and <code>describe</code></td></tr><tr><td>App starts then crashes</td><td><code>kubectl logs</code>, or <code>logs --previous</code></td></tr></table>
<p>Local rendering does not prove that your cluster accepts the resources, that an image exists, or that the app is healthy. Validate at each layer.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>Start with the error message; find whether it belongs to Helm, Kubernetes, or the app.</li><li>Rendered manifests and release metadata can contain sensitive values. Do not publish diagnostic output without checking it.</li></ul></div>
