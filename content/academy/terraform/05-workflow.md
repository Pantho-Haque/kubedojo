---
id: tf-workflow
title: 'init, plan, apply: the core loop'
emoji: "\U0001F501"
stage: 1
format: html
quiz:
  - q: You cloned a teammate’s Terraform folder. What do you run first?
    options:
      - terraform apply
      - terraform init
      - terraform destroy
    answer: 1
    why: init installs the providers the code needs. Plan and apply come after.
  - q: Does terraform plan create anything?
    options:
      - 'Yes, a draft copy of each resource'
      - 'No, it only shows what would change'
    answer: 1
    why: Plan is a preview. Only apply or destroy change real resources.
practice:
  kind: terraform
  mission: workflow
---
<div class="box story"><div class="tag">The problem</div>You wrote main.tf. Now what? Terraform never changes anything until you ask, and it always shows you its plan first.</div>
<div class="flow"><span>✍️ write .tf</span>→<span>📦 init</span>→<span>🧾 plan</span>→<span>👀 you read it</span>→<span>✅ apply</span></div>
<table><tr><th>Command</th><th>What it does</th><th>Changes real things?</th></tr>
<tr><td><code>terraform init</code></td><td>Downloads providers into <code>.terraform/</code> and records their exact versions in <code>.terraform.lock.hcl</code>. Run it once per folder, and again after adding providers or modules.</td><td>No</td></tr>
<tr><td><code>terraform plan</code></td><td>Reads the real resources, compares them with your code and the state file, and lists every change.</td><td>No</td></tr>
<tr><td><code>terraform apply</code></td><td>Makes the changes and records the results in the state file. Without a saved plan, it plans again and asks you to type <b>yes</b>.</td><td><b>Yes</b></td></tr>
<tr><td><code>terraform destroy</code></td><td>Plans to delete everything in the state file, then asks you.</td><td><b>Yes</b></td></tr></table>
<div class="cmd"><pre tabindex="0">terraform init
terraform plan -out=tfplan   # save the exact plan you reviewed
terraform apply tfplan       # do exactly that plan, nothing else</pre><button class="copy">Copy</button></div>
<div class="box idea"><div class="tag">The big idea</div>Saving the plan with -out and applying that file means Terraform does exactly what you reviewed, even if someone edits the code in between. If the state changed since you planned, Terraform rejects the stale plan.</div>
<h2>Practice safely in the browser</h2><div data-tf-sim></div>
<div class="box keep"><div class="tag">Remember</div><ul><li>init → plan → apply. Read every plan before applying.</li><li>plan never changes anything; apply does.</li><li>Commit .terraform.lock.hcl so everyone gets the same provider versions. Never commit .terraform/.</li></ul></div>
