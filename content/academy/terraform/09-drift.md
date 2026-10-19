---
id: tf-drift
title: 'Drift: when someone clicks in the console'
emoji: "\U0001F575️"
stage: 2
format: html
quiz:
  - q: Someone changed a server by hand. What does the next terraform plan show?
    options:
      - 'No changes, because Terraform only reads its state file'
      - A change that puts the server back to match the code
    answer: 1
    why: 'Plan refreshes from the real world first, so it sees the drift.'
  - q: The manual change was correct and should stay. What do you do?
    options:
      - 'Update the code to match, then plan'
      - Delete the state file
    answer: 0
    why: Make the code the truth again; plan should then say No changes.
  - q: >-
      A bucket was created by hand last year. How do you bring it under
      Terraform?
    options:
      - An import block
      - terraform destroy
    answer: 0
    why: Import adopts the existing object into state.
practice:
  kind: terraform
  mission: drift
---
<div class="box story"><div class="tag">The problem</div>During an incident, a teammate makes the server bigger in the cloud website. It works. Nobody updates the code. Next week someone runs terraform apply…</div>
<div class="box idea"><div class="tag">The big idea</div>Drift is any difference between the real world and what Terraform last recorded. Every plan reads the real objects first, so plan shows the drift and offers to put things back to match your code.</div>
<p>When you find drift you have two honest choices:</p>
<ul><li><b>The code is right:</b> apply, and Terraform undoes the manual change.</li><li><b>The manual change is right:</b> edit the code to match, then plan until it says <i>No changes</i>.</li></ul>
<div class="cmd"><pre tabindex="0">terraform plan                  # shows the drift and the fix
terraform plan -refresh-only    # only update state to match reality
terraform apply -refresh-only</pre><button class="copy">Copy</button></div>
<h2>Adopt things that were made by hand</h2>
<p>If a resource was created by hand and never managed by Terraform, add an <code>import</code> block and plan. Terraform adopts the existing object instead of creating a duplicate.</p>
<pre tabindex="0">import {
  to = aws_s3_bucket.menu
  id = "pizza-menu"
}</pre>
<h2>Practice safely in the browser</h2><div data-tf-sim></div>
<div class="box warnbox">The cure for drift is a habit: change infrastructure only through code and reviewed plans. Give most people read-only access to the cloud console.</div>
<div class="box keep"><div class="tag">Remember</div><ul><li>Drift means reality differs from state; plan detects it.</li><li>Either apply to undo it, or update the code to keep it.</li><li>import blocks adopt existing resources.</li></ul></div>
