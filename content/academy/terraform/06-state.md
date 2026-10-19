---
id: tf-state
title: 'The state file: Terraform’s memory'
emoji: "\U0001F5C2️"
stage: 1
format: html
quiz:
  - q: You delete terraform.tfstate and run plan. What happens?
    options:
      - 'Nothing, Terraform reads the cloud instead'
      - Terraform forgets what it made and plans to create everything again
    answer: 1
    why: >-
      Without state, existing objects are unknown to Terraform. Recovering means
      importing them back.
  - q: Should terraform.tfstate go into git?
    options:
      - 'Yes, so the team shares it'
      - 'No: it can hold secrets, so use a remote backend'
    answer: 1
    why: Remote backends share state safely and add locking.
---
<div class="box story"><div class="tag">The problem</div>Terraform created a server. Next week you run plan again. How does it know that server is “its” server, and not something new to create?</div>
<div class="box idea"><div class="tag">The big idea</div>Terraform keeps a state file, terraform.tfstate. It maps each resource address in your code to the real object it created, with that object’s ID and settings.</div>
<table><tr><th>In your code</th><th>In the state file</th><th>In the real world</th></tr>
<tr><td><code>local_file.menu</code></td><td>id = 3f2a…, filename = out/menu.txt</td><td>The actual file on disk</td></tr>
<tr><td><code>random_pet.shop</code></td><td>id = clever-otter</td><td>Nothing: this resource only lives in state</td></tr></table>
<div class="cmd"><pre tabindex="0">terraform state list               # every address Terraform manages
terraform state show local_file.menu
terraform output                   # values from output blocks</pre><button class="copy">Copy</button></div>
<h2>Four rules for state</h2>
<ul><li><b>Never edit it by hand.</b> Use <code>terraform state</code> commands or <code>moved</code> and <code>import</code> blocks instead.</li>
<li><b>Keep it private.</b> State can contain passwords and keys in plain text. Never commit it to git.</li>
<li><b>Share it properly in a team.</b> Store it in a remote backend with locking (lesson 12), so everyone uses one copy and two applies cannot run at once.</li>
<li><b>Back it up.</b> Lose the state and Terraform forgets what it made; it would try to create everything again.</li></ul>
<div class="box like"><div class="tag">Think of it like…</div>A cloakroom ticket. The coat (the real resource) hangs in the back; the ticket (state) proves which coat is yours. Lose the ticket and getting your coat back is a lot of work.</div>
<div class="box keep"><div class="tag">Remember</div><ul><li>State maps code addresses to real objects.</li><li>Never edit state by hand or commit it; keep it private and backed up.</li><li>Teams use a remote backend with locking.</li></ul></div>
