---
id: ci-team
title: 'Team rules: protected branches, checks, approvals'
emoji: "\U0001F91D"
stage: 3
format: html
quiz:
  - q: Which setting stops anyone merging when the test job is red?
    options:
      - A required status check on main
      - A longer README
    answer: 0
    why: Required checks block the merge button until they pass.
  - q: Why keep CI fast?
    options:
      - Slow pipelines tempt people to skip them
      - GitHub charges per test
    answer: 0
    why: A pipeline that everyone uses beats a perfect one everyone avoids.
---
<div class="box story"><div class="tag">The problem</div>Someone pushes straight to main at 6 p.m. without a review. The pipeline is green because there are no tests for the part they changed. Production breaks.</div>
<div class="box idea"><div class="tag">The big idea</div>Make the safe path the only path: changes go through pull requests, required checks must pass, someone else approves, and production deploys need an extra approval.</div>
<table><tr><th>Rule</th><th>Where</th><th>Stops</th></tr>
<tr><td>Require a pull request and one approval</td><td>Repository rules for main</td><td>Unreviewed changes</td></tr>
<tr><td>Require the <code>test</code> check to pass</td><td>Repository rules</td><td>Merging red builds</td></tr>
<tr><td>Block force pushes</td><td>Repository rules</td><td>Rewriting shared history</td></tr>
<tr><td>Environment with required reviewers</td><td>Settings → Environments</td><td>Releasing to production without a second person</td></tr>
<tr><td>CODEOWNERS for <code>deploy/</code></td><td>A CODEOWNERS file</td><td>Production changes without the right reviewer</td></tr></table>
<p><b>Keep pipelines fast.</b> If CI takes 40 minutes, people find ways around it. Cache dependencies, run independent jobs in parallel, and keep slow tests for a nightly run.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>Protect main: pull requests, required checks, no force pushes.</li><li>Use environments with reviewers for production.</li><li>A fast pipeline is a pipeline people actually use.</li></ul></div>
