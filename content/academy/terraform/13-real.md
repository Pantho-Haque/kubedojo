---
id: tf-real
title: Run Terraform on your computer
emoji: "\U0001F4BB"
stage: 3
format: html
---
<p class="lead">Now use a real terminal. This project uses only your computer: no cloud account and no cost. Terraform will manage a generated shop name, a pretend server, and a real file, <code>out/menu.txt</code>.</p>
<label class="task"><input type="checkbox" data-task="tf-tools"><span>Install Terraform and check that the version is 1.6 or newer</span></label><div class="cmd"><pre tabindex="0">brew tap hashicorp/tap
brew install hashicorp/tap/terraform
terraform version</pre><button class="copy">Copy</button></div>
<p>On Linux or Windows, use the official install page linked in the next lesson. OpenTofu works too: type <code>tofu</code> instead of <code>terraform</code>.</p>
<label class="task"><input type="checkbox" data-task="tf-files"><span>Create a practice folder with the four files</span></label><div class="cmd"><pre tabindex="0">mkdir -p ~/terraform-pizza &amp;&amp; cd ~/terraform-pizza
cat &gt; main.tf &lt;&lt;'EOF'
# Pizza Express learning project. Runs on your computer, no cloud account:
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
EOF
cat &gt; variables.tf &lt;&lt;'EOF'
variable "size" {
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
EOF
cat &gt; outputs.tf &lt;&lt;'EOF'
output "shop_name" {
  description = "The generated shop name."
  value       = random_pet.shop.id
}

output "menu_file" {
  description = "The file Terraform manages."
  value       = local_file.menu.filename
}
EOF
cat &gt; terraform.tfvars &lt;&lt;'EOF'
# Values here override the defaults in variables.tf.
size   = "small"
region = "eu-west"
pizzas = ["Margherita", "Pepperoni", "Funghi"]
EOF</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="tf-init"><span>Initialize: download the providers and look at the lock file</span></label><div class="cmd"><pre tabindex="0">terraform init
ls -a
head -n 12 .terraform.lock.hcl</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="tf-apply"><span>Validate and plan, read the plan, then apply it</span></label><div class="cmd"><pre tabindex="0">terraform fmt
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
cat out/menu.txt
terraform state list
terraform output</pre><button class="copy">Copy</button></div>
<p>The plan should say <b>3 to add, 0 to change, 0 to destroy</b>. After apply, open <code>out/menu.txt</code> in your editor.</p>
<label class="task"><input type="checkbox" data-task="tf-update"><span>Make the server large; find ~ (update in place) in the plan</span></label><div class="cmd"><pre tabindex="0">sed -i.bak 's/^size .*/size   = "large"/' terraform.tfvars
terraform plan -out=tfplan
terraform apply tfplan</pre><button class="copy">Copy</button></div>
<p>The server is updated in place. The menu file is replaced, because its content depends on the server’s output, which is only known after apply.</p>
<label class="task"><input type="checkbox" data-task="tf-replace"><span>Move to another region; find “forces replacement” in the plan</span></label><div class="cmd"><pre tabindex="0">sed -i.bak 's/^region .*/region = "us-east"/' terraform.tfvars
terraform plan -out=tfplan
terraform apply tfplan
cat out/menu.txt</pre><button class="copy">Copy</button></div>
<p>Expect <b>2 to add, 1 to change, 2 to destroy</b>: a new shop name, a new menu file, and an in-place server change.</p>
<label class="task"><input type="checkbox" data-task="tf-drift"><span>Cause drift by deleting the managed file, then let plan find it</span></label><div class="cmd"><pre tabindex="0">rm out/menu.txt
terraform plan
terraform apply</pre><button class="copy">Copy</button></div>
<p>Plan shows <code>+ local_file.menu</code>: Terraform noticed the file is gone. <code>terraform apply</code> without a saved plan shows the plan again and waits for you to type <b>yes</b>.</p>
<label class="task"><input type="checkbox" data-task="tf-destroy"><span>Destroy everything, then check what remains</span></label><div class="cmd"><pre tabindex="0">terraform destroy
terraform state list
ls out</pre><button class="copy">Copy</button></div>
<p>The empty <code>out/</code> folder, your .tf files, the lock file, and <code>.terraform/</code> stay. Delete <code>~/terraform-pizza</code> when you are done.</p>
