---
id: tf-team
title: 'Teams: remote state, locking, and reviews'
emoji: "\U0001F91D"
stage: 3
format: html
quiz:
  - q: Why use a remote backend with locking?
    options:
      - So everyone shares one state and two applies cannot run at once
      - To make Terraform faster
    answer: 0
    why: Shared state and locking prevent conflicting changes.
  - q: What should reviewers look at in a Terraform pull request?
    options:
      - Only the .tf changes
      - The .tf changes and the plan they produce
    answer: 1
    why: 'The plan shows what will really happen, including replacements.'
---
<div class="box story"><div class="tag">The problem</div>Two people run terraform apply at the same time from their laptops, each with their own state file. Now there are two servers and two different truths.</div>
<div class="box idea"><div class="tag">The big idea</div>In a team, state lives in one shared remote backend with locking, and changes go through review: open a pull request, let CI post the plan, approve, then apply from one place.</div>
<pre tabindex="0">terraform {
  backend "s3" {
    bucket       = "my-team-terraform-state"
    key          = "pizza/terraform.tfstate"
    region       = "eu-west-1"
    encrypt      = true
    use_lockfile = true   # lock state while someone plans or applies
  }
}</pre>
<p>Other backends include HCP Terraform, Azure Storage, and Google Cloud Storage. Move existing local state into a backend with <code>terraform init -migrate-state</code>.</p>
<h2>A safe team workflow</h2>
<div class="flow"><span>🌿 branch</span>→<span>✍️ edit .tf</span>→<span>🤖 CI runs fmt, validate, plan</span>→<span>👀 review the plan</span>→<span>✅ merge</span>→<span>🚀 CI applies</span></div>
<h2>Separate environments</h2>
<p>Keep test and production in separate folders, each with its own backend, calling the same modules with different values. A mistake in test then cannot touch production. Terraform workspaces also exist, but separate folders make the difference easier to see in a review.</p>
<div class="box warnbox">Never put secrets in .tf or .tfvars files in git. Read them at apply time from a secrets manager or environment variables, and remember they still end up in state.</div>
<div class="box keep"><div class="tag">Remember</div><ul><li>One remote backend with locking per environment.</li><li>Changes go through pull requests with the plan attached.</li><li>Separate folders for test and production, sharing the same modules.</li></ul></div>
