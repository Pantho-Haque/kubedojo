---
id: ci-repos
title: App repository and config repository
emoji: "\U0001F5C2️"
stage: 2
format: html
quiz:
  - q: >-
      How do you promote an already-tested image from staging to production with
      GitOps?
    options:
      - Commit its tag to production’s config
      - Rebuild it on a production server
    answer: 0
    why: Promotion reuses the exact same image; only git changes.
  - q: Why separate app and config repositories in bigger teams?
    options:
      - Different permissions and change speeds
      - Git cannot store YAML
    answer: 0
    why: Separate repos let you control who can change production independently.
---
<p class="lead">Code and deployment settings change for different reasons, at different speeds, often by different people.</p>
<table><tr><th>Layout</th><th>How it works</th><th>Good for</th></tr>
<tr><td>One repository (this course)</td><td><code>app/</code> and <code>deploy/</code> live together; CI commits new tags into <code>deploy/</code></td><td>Learning, small teams</td></tr>
<tr><td>App repo + config repo</td><td>CI in the app repo opens a commit or pull request in a separate config repo</td><td>Many services, separate permissions, many environments</td></tr></table>
<details class="file"><summary>📄 deploy/kustomization.yaml</summary><pre tabindex="0"># Argo CD renders this folder. CI changes only the two image lines below.
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: pizza
resources:
  - deployment.yaml
  - service.yaml
images:
  - name: pizza
    newName: ghcr.io/owner/repo
    newTag: not-built-yet
</pre></details>
<div class="box idea"><div class="tag">The big idea</div>Promotion is a commit. Moving version 3f9c2a1 from staging to production means changing one line in production’s folder, reviewed like any other change.</div>
<p><b>No infinite loops:</b> commits pushed with the workflow’s <code>GITHUB_TOKEN</code> do not start new workflow runs, and <code>paths-ignore</code> skips builds for commits that only change <code>deploy/</code>.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>Code and deployment settings can live together or apart.</li><li>Promotion between environments is a reviewed commit.</li><li>A deploy-only commit should not trigger a rebuild.</li></ul></div>
