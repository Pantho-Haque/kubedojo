---
id: d-integration
title: How Docker connects to Kubernetes and Helm
emoji: "\U0001F517"
stage: 4
format: html
---
<div class="flow"><span>Dockerfile → image</span>→<span>Registry</span>→<span>Kubernetes Deployment uses the image</span>→<span>Helm packages the Kubernetes manifests</span></div>
<p>Compose is useful for describing a local or single-host stack. Kubernetes introduces scheduling and reconciliation across a cluster. Helm packages and configures Kubernetes resources.</p>
<table><tr><th>Docker / Compose idea</th><th>Kubernetes counterpart to learn</th></tr><tr><td>Image</td><td>The same compatible container image can be referenced in a Pod</td></tr><tr><td>Service process</td><td>Deployment + Pod template</td></tr><tr><td>Service-name networking</td><td>Service + cluster DNS</td></tr><tr><td>Named volume</td><td>PVC + a suitable storage provider</td></tr><tr><td>Environment / secret file</td><td>ConfigMap / Secret and access controls</td></tr><tr><td>Compose file</td><td>Several manifests; optionally packaged in a Helm chart</td></tr></table>
<p>These are conceptual parallels, not a lossless file conversion. In particular, Kubernetes does not use Compose depends_on, and normal Kubernetes runtimes do not require Docker Engine. Review storage, health, retries, and networking when moving an app.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>A useful learning order is Docker → Compose → Kubernetes → Helm.</li><li>Use the topic dropdown to continue; each topic keeps its own progress.</li></ul></div>
