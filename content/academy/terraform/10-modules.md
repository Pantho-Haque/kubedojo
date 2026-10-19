---
id: tf-modules
title: 'Modules: reuse without copy-paste'
emoji: "\U0001F9E9"
stage: 2
format: html
quiz:
  - q: What are a module’s inputs?
    options:
      - Its variables
      - Its state file
    answer: 0
    why: Variables are inputs; outputs are what callers can read.
  - q: You make three shops with count and remove the first one. What can happen?
    options:
      - Nothing changes
      - 'The others shift position, so Terraform may replace them'
    answer: 1
    why: >-
      count tracks items by position. for_each tracks them by key, so removing
      one leaves the others alone.
---
<div class="box story"><div class="tag">The problem</div>You need the same setup (a server, a bucket, and DNS) for test, staging, and production. Copy-pasting it three times means fixing every bug three times.</div>
<div class="box idea"><div class="tag">The big idea</div>A module is a folder of .tf files: variables are its inputs and outputs are its results. Call it many times with different inputs. Every Terraform folder is already a module, called the root module.</div>
<pre tabindex="0">module "shop_test" {
  source = "./modules/shop"   # a local folder
  size   = "small"
}

module "shop_prod" {
  source = "./modules/shop"
  size   = "large"
}

module "network" {
  source  = "terraform-aws-modules/vpc/aws"   # from the public registry
  version = "~> 5.0"                          # always pin registry versions
}</pre>
<p>Read a module’s output with <code>module.shop_prod.server_ip</code>. After adding a module or changing its source, run <code>terraform init</code> again to download it.</p>
<h2>Many copies inside one module</h2>
<p><code>count = 3</code> makes three numbered copies. <code>for_each</code> makes one copy per item in a map or set, named by its key. Prefer <code>for_each</code> when items can be added or removed in the middle.</p>
<div class="box like"><div class="tag">Think of it like…</div>A pizza recipe card. The card (the module) stays the same; each order (a module call) chooses its own size and toppings (the variables).</div>
<div class="box keep"><div class="tag">Remember</div><ul><li>A module is a folder with inputs (variables) and outputs.</li><li>Pin registry module versions; run init after changing sources.</li><li>Prefer for_each over count when items can be removed.</li></ul></div>
