---
id: ci-start
title: 'Start here: your CI/CD & GitOps path'
emoji: "\U0001F6A6"
stage: 0
format: html
---
<p class="lead">You can build an image (Docker), run it (Kubernetes), package it (Helm), and create the ground it runs on (Terraform). This course joins them: every change you push is tested, built, and deployed automatically, and git always says what is running.</p>
<div class="box idea"><div class="tag">The big idea</div>A pipeline checks and packages every change. GitOps then deploys whatever git says should run, and keeps the cluster that way.</div>
<p><b>Before starting:</b> know what an image, a Deployment, and a git commit are. The Docker and Kubernetes courses cover the first two. No installation is needed until the final stage.</p>
<div class="worlds">
<div><b>1 · Meet the pipeline · lessons 1–3</b><span>Explain CI, CD, and GitOps, and where each tool from the other courses fits.</span><button class="map-button" data-go="ci-why">Learn the big idea</button></div>
<div><b>2 · Continuous integration · lessons 4–7</b><span>Read a GitHub Actions workflow, run test → build → scan → push in the simulator, tag images safely, and keep secrets out of logs.</span><button class="map-button" data-go="ci-workflow">Read your first workflow</button></div>
<div><b>3 · GitOps delivery · lessons 8–11</b><span>Let Argo CD deploy from git, split app and config, watch it undo hand-made changes, and roll back with git revert.</span><button class="map-button" data-go="ci-gitops">Deploy from git</button></div>
<div><b>4 · Use it for real · lessons 12–14</b><span>Learn team rules, then run the whole loop with your own GitHub repository and a local cluster.</span><button class="map-button" data-go="ci-real">Try the real exercise</button></div>
</div><p>Use <b>Explore CI/CD</b> for free practice at any time. Your progress here is saved separately from the other topics.</p>
