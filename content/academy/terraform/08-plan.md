---
id: tf-plan
title: 'Read a plan: +, ~, -/+, -'
emoji: "\U0001F9FE"
stage: 2
format: html
quiz:
  - q: A plan shows <code>-/+</code> on your database. What does it mean?
    options:
      - The database gets a small in-place change
      - The old database is destroyed and a new one is created
    answer: 1
    why: >-
      Replacement means a new object; data on the old one may be lost unless it
      is backed up.
  - q: >-
      One resource is replaced and nothing else changes. What does the summary
      say?
    options:
      - '1 to add, 0 to change, 1 to destroy'
      - '0 to add, 1 to change, 0 to destroy'
    answer: 0
    why: A replacement is counted as one add and one destroy.
  - q: Which setting makes any plan that would destroy a resource fail?
    options:
      - prevent_destroy = true
      - sensitive = true
    answer: 0
    why: It is a lifecycle safety catch for critical resources.
practice:
  kind: terraform
  mission: change
---
<div class="box story"><div class="tag">The problem</div>A plan says “1 to add, 1 to change, 1 to destroy”. Is that safe? It depends on <i>what</i> gets destroyed. Reading the symbols is the most important Terraform skill.</div>
<table><tr><th>Symbol</th><th>Meaning</th><th>Typical cause</th></tr>
<tr><td><code>+</code></td><td>Create</td><td>A new block in your code</td></tr>
<tr><td><code>~</code></td><td>Update in place: the same object changes</td><td>A bigger server size, a new tag</td></tr>
<tr><td><code>-/+</code></td><td>Replace: destroy the old object, create a new one</td><td>A setting the platform cannot change on an existing object, such as the region</td></tr>
<tr><td><code>-</code></td><td>Destroy</td><td>You removed the block from the code</td></tr></table>
<div class="box idea"><div class="tag">The big idea</div>Look for -/+ and - first. Replacing a database or a disk can mean losing its data. Terraform marks the setting that causes it with “# forces replacement”.</div>
<pre tabindex="0">  # server.web must be replaced
-/+ resource "pretend_server" "web" {
      ~ region = "eu-west" -> "us-east" # forces replacement
        size   = "large"
    }

Plan: 1 to add, 1 to change, 1 to destroy.</pre>
<p>A replacement counts twice: one add and one destroy. Values Terraform cannot know until apply show as <code>(known after apply)</code>; the DNS record’s new address is one, so the DNS record shows <code>~</code> too.</p>
<h2>Practice safely in the browser</h2><div data-tf-sim></div>
<details class="file"><summary>Protect important resources</summary><p>Add <code>lifecycle { prevent_destroy = true }</code> to a database so any plan that would destroy it fails. Use <code>create_before_destroy = true</code> when the new object must exist before the old one goes.</p></details>
<div class="box keep"><div class="tag">Remember</div><ul><li>+ create, ~ update in place, -/+ replace, - destroy.</li><li>Check every -/+ and - before approving: replacement can lose data.</li><li>prevent_destroy guards critical resources.</li></ul></div>
