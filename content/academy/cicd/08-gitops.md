---
id: ci-gitops
title: 'GitOps: git is the desired state'
emoji: "\U0001F419"
stage: 2
format: html
quiz:
  - q: CI pushed a new tag to deploy/kustomization.yaml. What deploys it?
    options:
      - 'Argo CD, after it notices the change in git'
      - The test job
      - 'Nobody: you must run kubectl'
    answer: 0
    why: Argo CD watches git and applies the change.
  - q: An app is Synced but Degraded. What does that mean?
    options:
      - 'The cluster matches git, but the app is not working'
      - Git is out of date
    answer: 0
    why: Sync status and health are separate questions.
practice:
  kind: pipeline
  mission: gitops
---
<div class="box story"><div class="tag">The problem</div>The pipeline built and pushed pizza:3f9c2a1. How does the cluster find out? With kubectl in CI, the pipeline needs a production key. With GitOps, it only edits a file in git.</div>
<div class="box idea"><div class="tag">The big idea</div>Argo CD runs inside the cluster and watches a folder in git. When the folder changes, Argo CD applies it. When the cluster drifts from git, Argo CD puts it back. Git is the only way to change what runs.</div>
<details class="file"><summary>📄 argocd/application.yaml</summary><pre tabindex="0"># Tells Argo CD: keep the pizza namespace matching deploy/ on the main branch.
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: pizza
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/OWNER/REPO.git # the hands-on lesson fills this in
    targetRevision: main
    path: deploy
  destination:
    server: https://kubernetes.default.svc
    namespace: pizza
  syncPolicy:
    automated:
      prune: true # delete things removed from git
      selfHeal: true # undo changes made outside git
    syncOptions:
      - CreateNamespace=true
</pre></details>
<table><tr><th>Status</th><th>Meaning</th></tr>
<tr><td><b>Synced</b></td><td>The cluster matches git.</td></tr>
<tr><td><b>OutOfSync</b></td><td>Git and the cluster differ; Argo CD will sync if automated sync is on.</td></tr>
<tr><td><b>Healthy / Progressing / Degraded</b></td><td>Whether the synced resources actually work, for example whether pods are ready.</td></tr></table>
<p>Argo CD checks git about every 3 minutes by default. A webhook from GitHub can make it react within seconds.</p>
<h2>Practice safely in the browser</h2><div data-ci-sim></div>
<div class="box like"><div class="tag">Think of it like…</div>A thermostat. You set the temperature (git); the thermostat (Argo CD) keeps checking the room (the cluster) and heats or cools until they match.</div>
<div class="box keep"><div class="tag">Remember</div><ul><li>Argo CD pulls from git and applies what it finds.</li><li>Synced = cluster matches git; Healthy = it actually works.</li><li>To change production, change git.</li></ul></div>
