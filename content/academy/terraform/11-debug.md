---
id: tf-debug
title: When it goes wrong
emoji: "\U0001F527"
stage: 2
format: html
quiz:
  - q: Plan fails with “Error acquiring the state lock”. What do you do first?
    options:
      - Force-unlock immediately
      - Check whether a teammate or CI job is running
    answer: 1
    why: >-
      The lock protects state from two writers. Force-unlock only after
      confirming nothing is running.
  - q: 'Apply created 2 of 3 resources, then failed. What is in state?'
    options:
      - 'Nothing: everything was rolled back'
      - The 2 that succeeded; the next plan shows what is missing
    answer: 1
    why: Terraform does not roll back; it records what succeeded.
---
<p class="lead">Most Terraform errors fall into a handful of patterns. Read the first error line, then find it here.</p>
<table><tr><th>You see</th><th>Usually means</th><th>First move</th></tr>
<tr><td>Required plugins are not installed, or Inconsistent dependency lock file</td><td>Providers are missing or changed</td><td><code>terraform init</code> (add <code>-upgrade</code> only on purpose)</td></tr>
<tr><td>Error acquiring the state lock</td><td>Another plan or apply is running, or one crashed</td><td>Wait and ask your team. Use <code>terraform force-unlock ID</code> only when you are sure nothing is running.</td></tr>
<tr><td>Resource already exists</td><td>Someone created it by hand, or state lost track of it</td><td>Adopt it with an <code>import</code> block</td></tr>
<tr><td>No valid credential sources found, or 403</td><td>The provider cannot log in to the platform</td><td>Check your cloud login and which account you are using</td></tr>
<tr><td>Cycle</td><td>Two resources reference each other</td><td>Break the loop; move one value into a variable or separate resource</td></tr>
<tr><td>Unsupported argument, or Invalid reference</td><td>A typo, or a setting from a different provider version</td><td><code>terraform validate</code>, then the docs for your pinned version</td></tr></table>
<div class="cmd"><pre tabindex="0">terraform fmt         # tidy the formatting
terraform validate    # catch typos without calling the cloud
TF_LOG=DEBUG terraform plan 2&gt; debug.log   # a very detailed log</pre><button class="copy">Copy</button></div>
<div class="box idea"><div class="tag">The big idea</div>When an apply fails halfway, nothing is rolled back. Resources that succeeded are in state; the rest are not. Fix the cause and plan again: the plan shows only what is still missing.</div>
<div class="box warnbox">Never delete the state file or run destroy to “start fresh” on shared infrastructure. Ask first.</div>
<div class="box keep"><div class="tag">Remember</div><ul><li>Read the first error line; most errors match a known pattern.</li><li>After a partial failure, fix the cause and plan again.</li><li>force-unlock only when you are sure nothing else is running.</li></ul></div>
