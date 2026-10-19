---
id: tf-files
title: 'Read a configuration: blocks and resources'
emoji: "\U0001F4C4"
stage: 1
format: html
quiz:
  - q: What is the address of <code>resource "random_pet" "shop"</code>?
    options:
      - shop.random_pet
      - random_pet.shop
      - resource.shop
    answer: 1
    why: 'Type first, then your name.'
  - q: >-
      The menu file uses <code>random_pet.shop.id</code>. What does Terraform
      do?
    options:
      - 'Creates the shop name first, then the file'
      - Creates both at once in a random order
    answer: 0
    why: 'A reference is a dependency, so the referenced resource is created first.'
---
<p class="lead">Terraform files end in <code>.tf</code> and use a language called HCL. All the .tf files in one folder are read together; that folder is called a <b>module</b>.</p>
<div class="box idea"><div class="tag">The big idea</div>Almost everything is a block: a keyword, one or two labels, and settings in braces. A resource block says “make one of these, call it this, with these settings”.</div>
<pre tabindex="0">resource "local_file" "menu" {    ← block type, resource type, your name for it
  filename = "out/menu.txt"       ← an argument: setting = value
  content  = random_pet.shop.id   ← a reference to another resource
}</pre>
<table><tr><th>Block</th><th>What it does</th></tr>
<tr><td><code>terraform { }</code></td><td>Which Terraform version and which providers (with versions) this code needs</td></tr>
<tr><td><code>provider "aws" { }</code></td><td>Settings for one provider, such as a region. Our example needs none.</td></tr>
<tr><td><code>resource "type" "name" { }</code></td><td>Something Terraform creates and manages. Its address is <code>type.name</code>, for example <code>local_file.menu</code>.</td></tr>
<tr><td><code>data "type" "name" { }</code></td><td>Reads something that already exists, without managing it.</td></tr>
<tr><td><code>variable</code>, <code>output</code>, <code>locals</code></td><td>Inputs, results, and named helper values (lesson 7).</td></tr></table>
<p><b>References decide the order.</b> Because the menu uses <code>random_pet.shop.id</code>, Terraform knows to create the shop name first. You rarely write the order yourself; Terraform draws a dependency graph from the references.</p>
<details class="file"><summary>📄 main.tf · the course example</summary><pre tabindex="0"># Pizza Express learning project. Runs on your computer, no cloud account:
# - random_pet gives the shop a name
# - terraform_data stands in for a server (built into Terraform 1.4+)
# - local_file writes out/menu.txt, a real object you can open and break
terraform {
  required_version = "&gt;= 1.6.0"

  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~&gt; 2.5"
    }
    random = {
      source  = "hashicorp/random"
      version = "~&gt; 3.6"
    }
  }
}

locals {
  # A local names an expression once so several places can reuse it.
  menu_lines = [for pizza in var.pizzas : "- ${pizza}"]
}

# A new region means a new shop name: changing a keeper forces replacement (-/+).
resource "random_pet" "shop" {
  length = 2
  keepers = {
    region = var.region
  }
}

# Changing input updates this resource in place (~).
resource "terraform_data" "server" {
  input = {
    size   = var.size
    region = var.region
  }
}

# References to both resources above make Terraform create this one last.
resource "local_file" "menu" {
  filename        = "${path.module}/out/menu.txt"
  file_permission = "0644"
  content         = &lt;&lt;-EOT
    Shop:   ${random_pet.shop.id}
    Server: ${terraform_data.server.output.size} in ${terraform_data.server.output.region}
    Menu:
    ${join("\n", local.menu_lines)}
  EOT
}
</pre></details>
<div class="box keep"><div class="tag">Remember</div><ul><li>A resource address is type.name, like local_file.menu.</li><li>References between resources decide the creation order.</li><li>All .tf files in one folder form one module.</li></ul></div>
