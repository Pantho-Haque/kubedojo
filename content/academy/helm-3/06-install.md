---
id: h-install
title: Install and watch the handoff
emoji: "\U0001F680"
stage: 1
format: html
quiz:
  - q: Helm times out waiting for readiness. What next?
    options:
      - Assume nothing was created
      - Inspect helm status and kubectl describe/events
      - Delete the whole cluster
    answer: 1
    why: Resources may exist even when the operation fails or times out.
practice:
  kind: helm
  mission: install
---
<p>Use the practice below to see each handoff. First preview, then install, then advance the process one step at a time.</p>
<h2>Try it before using a terminal</h2><div data-helm-sim></div>
<div class="cmd"><pre tabindex="0">helm install pizza ./pizza-chart -n helm-practice --create-namespace --wait --timeout 2m
helm list -n helm-practice
helm status pizza -n helm-practice
kubectl get deployments,pods,services -n helm-practice</pre><button class="copy">Copy</button></div>
<p>A namespace is where this release’s namespaced objects live. Our examples always name it so you can find the release later. <code>--wait</code> asks Helm to wait for supported readiness conditions; it does not prove every app feature works.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>Helm creates a release record; Kubernetes creates the Pods.</li><li>Use Helm to inspect release state and kubectl to inspect the actual resources.</li></ul></div>
