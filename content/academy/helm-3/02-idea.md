---
id: h-idea
title: 'Chart, values, release'
emoji: "\U0001F4E6"
stage: 0
format: html
quiz:
  - q: Which one names an installation?
    options:
      - Chart
      - Values
      - Release
    answer: 2
    why: A release identifies an installed instance.
  - q: You want the same app with three copies instead of one. Change…
    options:
      - The values used by the template
      - The Kubernetes source code
      - Every node by hand
    answer: 0
    why: >-
      Use the chart’s documented setting; charts can name their values
      differently.
---
<div class="box story"><div class="tag">The problem</div>Your pizza app needs a Deployment and a Service. The practice version needs one copy; another environment needs three. Copying the same files and remembering every edit quickly becomes tiring.</div>
<div class="box idea"><div class="tag">The big idea</div>A <b>chart</b> bundles the templates. <b>Values</b> fill in the choices. A <b>release</b> is a named installation of that chart in a cluster.</div>
<div class="box like"><div class="tag">Think of it like…</div>One cake recipe can make a small cake called “birthday” and a large one called “picnic”. Same recipe, different choices, two separate results.</div>
<table><tr><th>Word</th><th>Our example</th></tr><tr><td>Chart</td><td><code>pizza-chart</code>: Deployment + Service templates</td></tr><tr><td>Values</td><td><code>replicaCount: 3</code>, image tag <code>1.27</code></td></tr><tr><td>Release</td><td><code>pizza</code> installed in namespace <code>helm-practice</code></td></tr></table>
<div class="box keep"><div class="tag">Remember</div><ul><li>A chart is a package of instructions, not a running app.</li><li>One chart can be installed more than once with different release names or namespaces.</li></ul></div>
