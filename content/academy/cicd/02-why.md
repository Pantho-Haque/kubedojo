---
id: ci-why
title: 'Why automate: from “works on my laptop” to every commit tested'
emoji: "\U0001F914"
stage: 0
format: html
quiz:
  - q: What is the main benefit of a CI pipeline?
    options:
      - 'Every change gets the same checks, every time'
      - Developers no longer need to write tests
      - Servers become faster
    answer: 0
    why: The pipeline removes forgotten steps and “works on my machine” surprises.
  - q: 'In GitOps, where is the desired state of the cluster written?'
    options:
      - In git
      - In someone’s terminal history
      - Only inside the cluster
    answer: 0
    why: Git is the source of truth; the cluster is kept matching it.
---
<div class="box story"><div class="tag">The problem</div>Friday evening. You build the 🍕 image on your laptop, push it, and run kubectl apply by hand. It works for you. On Monday nobody knows which code is in production, a test you forgot to run is failing, and the person who knows the deploy steps is on holiday.</div>
<div class="box idea"><div class="tag">The big idea</div>Let a machine do the same careful steps for every change: test it, build it, check it, and deploy it. People review the change; the pipeline does the repetitive work the same way every time.</div>
<table><tr><th>Word</th><th>Meaning</th></tr>
<tr><td><b>CI</b> (continuous integration)</td><td>Every change is merged often and checked automatically: tests, build, scans.</td></tr>
<tr><td><b>CD</b> (continuous delivery or deployment)</td><td>Every change that passes can be released. Delivery: ready to release with one approval. Deployment: released automatically.</td></tr>
<tr><td><b>Pipeline</b></td><td>The ordered list of automatic steps a change goes through.</td></tr>
<tr><td><b>GitOps</b></td><td>Git holds the desired state of the cluster. A tool in the cluster keeps reality matching git.</td></tr></table>
<div class="box like"><div class="tag">Think of it like…</div>A pizza kitchen line. Every pizza passes the same stations: dough, toppings, oven, quality check. Nobody skips the oven on a busy night, and a burnt pizza never reaches the table.</div>
<div class="box keep"><div class="tag">Remember</div><ul><li>CI checks every change automatically.</li><li>CD makes passing changes ready to release, or releases them.</li><li>GitOps: git says what should run; the cluster follows.</li></ul></div>
