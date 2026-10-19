---
id: h-values
title: Choose values and preview the result
emoji: "\U0001F39B️"
stage: 1
format: html
quiz:
  - q: 'Default: 1. File: 3. --set: 2. How many copies in the rendered YAML?'
    options:
      - '1'
      - '3'
      - '2'
    answer: 2
    why: The command-line override wins here.
  - q: You rendered new values. Did the cluster change?
    options:
      - 'Yes'
      - 'No'
    answer: 1
    why: Rendering is local. Install or upgrade is a separate action.
practice:
  kind: helm
  mission: values
---
<div class="box idea"><div class="tag">The big idea</div>Helm combines chart defaults with the values you supply. A values file passed with -f overrides defaults; command-line --set values override those. With several -f files, later files take precedence for the same key.</div>
<div class="cmd"><pre tabindex="0">helm template pizza ./pizza-chart -f values-prod.yaml --set replicaCount=2</pre><button class="copy">Copy</button></div>
<p>If the default is 1, the production file says 3, and <code>--set</code> says 2, the rendered Deployment asks for <b>2</b>. Changing a file or previewing it does not change an installed app.</p>
<h2>Try it before using a terminal</h2><div data-helm-sim></div>
<div class="box keep"><div class="tag">Remember</div><ul><li>Preview the resulting YAML before you install.</li><li>Values keys belong to each chart. An unused or misspelled key may do nothing unless the chart validates it.</li></ul></div>
