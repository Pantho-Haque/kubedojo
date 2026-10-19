---
id: h-team
title: 'Environments, packages, and GitOps'
emoji: "\U0001F91D"
stage: 2
format: html
quiz:
  - q: Why pin a chart version?
    options:
      - To make the package choice reproducible
      - To force every Pod onto one node
      - To encrypt Secrets
    answer: 0
    why: Review upgrades deliberately rather than unknowingly changing the chart.
---
<details class="file"><summary>📄 Two environments, one chart</summary><pre tabindex="0"># values-dev.yaml
replicaCount: 1
---
# values-prod.yaml (a separate file)
replicaCount: 3</pre></details>
<div class="cmd"><pre tabindex="0">helm upgrade --install pizza ./pizza-chart -n dev --create-namespace -f values-dev.yaml --wait
helm upgrade --install pizza ./pizza-chart -n staging --create-namespace -f values-prod.yaml --wait</pre><button class="copy">Copy</button></div>
<p><b>Sharing:</b> <code>helm package ./pizza-chart</code> makes a versioned archive. Charts can come from a chart repository or an OCI registry. Read their documentation and pin a chart version so an install is reproducible.</p>
<p><b>Dependencies:</b> a chart can list other charts in <code>Chart.yaml</code>. <code>helm dependency update</code> resolves them and writes a lock file; <code>helm dependency build</code> uses that lock. Keep credentials out of ordinary values files committed to git.</p>
<p><b>GitOps:</b> a controller watches git and applies the desired configuration. For example, Argo CD can use Helm to render manifests while Argo CD manages application synchronization. In that workflow, do not assume a normal Helm-managed release or change the same app independently with both tools.</p>
<p><b>Later:</b> learn helpers, schema validation, hooks, tests, and CRDs as your chart needs them. Hooks and data migrations need their own failure plan; Helm does not automatically solve those for you.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>One chart, explicit values for each environment.</li><li>Choose one owner for deployments: your Helm workflow or your GitOps controller.</li></ul></div>
