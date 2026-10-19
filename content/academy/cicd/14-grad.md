---
id: ci-grad
title: Your CI/CD & GitOps finish line
emoji: "\U0001F393"
stage: 3
format: html
---
<p class="lead">You are ready to set up delivery for a small project when you can complete these tasks without copying earlier commands.</p>
<label class="task"><input type="checkbox" data-task="ci-g-explain"><span>Explain CI, CD, and GitOps, and which tool does each step from commit to running pod.</span></label>
<label class="task"><input type="checkbox" data-task="ci-g-pipeline"><span>Write a workflow that tests on pull requests and builds, scans, and pushes a SHA-tagged image from main.</span></label>
<label class="task"><input type="checkbox" data-task="ci-g-deploy"><span>Deploy an app with Argo CD from a folder in git and explain Synced versus Healthy.</span></label>
<label class="task"><input type="checkbox" data-task="ci-g-recover"><span>Show that a failing test blocks a release, that hand-made changes are undone, and roll back with git revert.</span></label>
<label class="task"><input type="checkbox" data-task="ci-g-team"><span>Protect main with required checks and reviews, and keep secrets out of files.</span></label>
<p><b>Next project:</b> add a staging folder and a production folder in <code>deploy/</code>, promote between them with a pull request, and replace the Kustomize folder with the Helm chart from the Helm course.</p>
<details class="file"><summary>Official references</summary><ul><li><a href="https://docs.github.com/actions" target="_blank" rel="noopener">GitHub Actions documentation</a></li><li><a href="https://docs.github.com/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions" target="_blank" rel="noopener">Security hardening for GitHub Actions</a></li><li><a href="https://argo-cd.readthedocs.io/en/stable/getting_started/" target="_blank" rel="noopener">Argo CD getting started</a></li><li><a href="https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/" target="_blank" rel="noopener">Argo CD automated sync</a></li><li><a href="https://opengitops.dev/" target="_blank" rel="noopener">OpenGitOps principles</a></li></ul></details>
