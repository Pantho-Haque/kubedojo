---
id: tf-vars
title: 'Variables, outputs, and locals'
emoji: "\U0001F39B️"
stage: 1
format: html
quiz:
  - q: >-
      The default is "small", terraform.tfvars says "large", and you plan with
      -var size=small. Which value is used?
    options:
      - 'small, from -var'
      - 'large, from tfvars'
    answer: 0
    why: 'Command-line -var is read last, so it wins.'
  - q: Does sensitive = true keep a password out of the state file?
    options:
      - 'Yes'
      - 'No, it only hides it on screen'
    answer: 1
    why: State still contains it. Protect state like a secret.
---
<p class="lead">Hard-coded values make code hard to reuse. Variables are the inputs, outputs are the results, and locals are named helpers inside.</p>
<details class="file"><summary>📄 variables.tf</summary><pre tabindex="0">variable "size" {
  description = "Server size. Changing it updates terraform_data.server in place."
  type        = string
  default     = "small"

  validation {
    condition     = contains(["small", "large"], var.size)
    error_message = "The size must be \"small\" or \"large\"."
  }
}

variable "region" {
  description = "Region. Changing it replaces random_pet.shop and rewrites the menu."
  type        = string
  default     = "eu-west"
}

variable "pizzas" {
  description = "Pizzas listed in out/menu.txt."
  type        = list(string)
  default     = ["Margherita", "Pepperoni"]
}
</pre></details>
<details class="file"><summary>📄 terraform.tfvars</summary><pre tabindex="0"># Values here override the defaults in variables.tf.
size   = "small"
region = "eu-west"
pizzas = ["Margherita", "Pepperoni", "Funghi"]
</pre></details>
<details class="file"><summary>📄 outputs.tf</summary><pre tabindex="0">output "shop_name" {
  description = "The generated shop name."
  value       = random_pet.shop.id
}

output "menu_file" {
  description = "The file Terraform manages."
  value       = local_file.menu.filename
}
</pre></details>
<h2>Which value wins?</h2>
<p>Terraform reads values in this order, and <b>later ones win</b>:</p>
<ol><li>The <code>default</code> in the variable block</li><li>Environment variables such as <code>TF_VAR_size=large</code></li><li><code>terraform.tfvars</code>, then any <code>*.auto.tfvars</code> files</li><li><code>-var</code> and <code>-var-file</code> on the command line</li></ol>
<div class="cmd"><pre tabindex="0">terraform plan -var size=large          # a one-off override
terraform plan -var-file=prod.tfvars    # a whole environment</pre><button class="copy">Copy</button></div>
<div class="box idea"><div class="tag">The big idea</div>Variables let the same code build test and production with different values. Add a validation block so a typo fails at plan time instead of creating the wrong thing.</div>
<div class="box warnbox">Mark passwords with <code>sensitive = true</code>. That hides them in plan output, but they are still stored in the state file in plain text. Protect the state.</div>
<div class="box keep"><div class="tag">Remember</div><ul><li>variable = input, output = result, locals = named helper value.</li><li>Later sources win: default → TF_VAR_ → tfvars → -var.</li><li>sensitive hides values on screen, not in state.</li></ul></div>
