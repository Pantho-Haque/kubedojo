---
id: ci-bridge
title: Where each tool fits in the pipeline
emoji: "\U0001F517"
stage: 0
format: html
quiz:
  - q: Which step ends CI and hands over to GitOps?
    options:
      - Writing the new image tag to git
      - Running the tests
      - Creating the cluster
    answer: 0
    why: 'Once git has the new tag, Argo CD takes over.'
  - q: >-
      Why is pull-based GitOps safer than a pipeline running kubectl against
      production?
    options:
      - CI never needs production cluster credentials
      - It skips the tests
    answer: 0
    why: >-
      The agent inside the cluster pulls changes, so no outside system holds a
      key to it.
---
<p class="lead">Every course you have taken becomes one station in the pipeline.</p>
<div class="flow"><span>💬 commit</span>→<span>🧪 test</span>→<span>🐳 build image</span>→<span>🔍 scan</span>→<span>📦 push to registry</span>→<span>🗂️ new tag in git</span>→<span>🐙 Argo CD syncs</span>→<span>☸️ pods update</span></div>
<table><tr><th>Station</th><th>Tool</th><th>From which course</th></tr>
<tr><td>Build the image</td><td>Docker (inside GitHub Actions)</td><td>Docker & Compose</td></tr>
<tr><td>Describe what runs</td><td>Kubernetes YAML, Kustomize, or a Helm chart</td><td>Kubernetes, Helm</td></tr>
<tr><td>Deploy and keep it running</td><td>Argo CD in the cluster, then Kubernetes controllers</td><td>Kubernetes</td></tr>
<tr><td>The cluster, registry, and network themselves</td><td>Terraform, usually in its own pipeline</td><td>Terraform</td></tr></table>
<div class="box idea"><div class="tag">The big idea</div>CI ends when a tested image is in the registry and its tag is written to git. GitOps starts there: Argo CD notices the change in git and deploys it.</div>
<p><b>Push versus pull.</b> A classic pipeline <i>pushes</i> to the cluster with kubectl and needs cluster credentials. With GitOps, Argo CD runs inside the cluster and <i>pulls</i> from git, so CI never needs a key to production.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>CI produces a tested image and a new tag in git.</li><li>Argo CD pulls from git and deploys; CI needs no cluster credentials.</li><li>Terraform builds the cluster; this pipeline deploys apps onto it.</li></ul></div>
