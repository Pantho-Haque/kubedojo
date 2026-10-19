---
id: ci-secrets
title: Secrets in pipelines
emoji: "\U0001F510"
stage: 1
format: html
quiz:
  - q: What is the safest way for a workflow to log in to AWS?
    options:
      - OIDC with a role that trusts this repository
      - An access key pasted into ci.yaml
    answer: 0
    why: OIDC gives short-lived credentials; nothing long-lived can leak.
  - q: The course pipeline pushes to ghcr.io. Which credential does it use?
    options:
      - The automatic GITHUB_TOKEN
      - Your personal password
    answer: 0
    why: >-
      With packages: write, the built-in token can push to the repository’s
      registry.
---
<div class="box story"><div class="tag">The problem</div>To deploy, someone pastes a cloud access key into the workflow file. The repository is public. Within minutes, bots find the key and start expensive servers.</div>
<div class="box idea"><div class="tag">The big idea</div>Never write secrets in files. Store them as encrypted repository secrets, give each job the smallest permissions it needs, and prefer short-lived tokens over long-lived keys.</div>
<table><tr><th>Need</th><th>Best option</th></tr>
<tr><td>Push images to ghcr.io from this repository</td><td>The automatic <code>GITHUB_TOKEN</code> with <code>packages: write</code>. Nothing to store.</td></tr>
<tr><td>Log in to a cloud (AWS, Azure, Google)</td><td><b>OIDC</b>: the cloud trusts a short-lived token GitHub creates for this repository. No stored key.</td></tr>
<tr><td>A third-party API key</td><td>A repository or environment secret, read as <code>secrets.NAME</code> in the workflow</td></tr></table>
<p>GitHub hides secret values in logs, but a step can still leak one if it writes the value in a different form. Never print secrets, even for debugging.</p>
<div class="box warnbox">Workflows from forks do not receive your secrets, by design. Do not work around this with the pull_request_target trigger unless you understand the risk: it can run untrusted code with your secrets.</div>
<div class="box keep"><div class="tag">Remember</div><ul><li>No secrets in files; use repository or environment secrets.</li><li>Give each job only the permissions it needs.</li><li>Prefer OIDC to long-lived cloud keys.</li></ul></div>
