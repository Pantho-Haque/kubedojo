---
id: tf-idea
title: 'Infrastructure as code: write what you want'
emoji: "\U0001F4DD"
stage: 0
format: html
quiz:
  - q: Why write infrastructure in files instead of clicking in a web console?
    options:
      - Files run faster than clicks
      - 'Files can be reviewed, repeated, and kept in git'
      - Clouds do not allow clicking
    answer: 1
    why: 'The big win is a repeatable, reviewable record of what should exist.'
  - q: What is a provider?
    options:
      - A plugin that lets Terraform talk to one platform’s API
      - The company that hosts your app
      - A backup of your files
    answer: 0
    why: >-
      Terraform itself knows nothing about AWS or GitHub; providers add that
      knowledge.
---
<div class="box story"><div class="tag">The problem</div>Your 🍕 app needs a server, a storage bucket for menu photos, and a web address. You click through a cloud website to create them. Six months later you need the same setup for testing. Which buttons did you click? Which settings did you choose? Nobody remembers.</div>
<div class="box idea"><div class="tag">The big idea</div>Describe your infrastructure in text files. Terraform reads them and makes the real world match. The files become the single source of truth: you can review them, keep them in git, and run them again.</div>
<div class="box like"><div class="tag">Think of it like…</div>A recipe versus cooking from memory. With a recipe anyone can make the same pizza again, and you can see exactly what changed between versions.</div>
<h2>Three words to know</h2>
<table><tr><th>Word</th><th>Meaning</th></tr>
<tr><td><b>Resource</b></td><td>One thing Terraform manages: a server, a bucket, a DNS record, even a file.</td></tr>
<tr><td><b>Provider</b></td><td>A plugin that knows how to talk to one platform: AWS, Azure, Google Cloud, Kubernetes, GitHub, and thousands more.</td></tr>
<tr><td><b>Plan</b></td><td>A preview of exactly what Terraform will add, change, or destroy before it touches anything.</td></tr></table>
<p>Terraform is <b>declarative</b>: you write the end result (“one small server in eu-west”), not the steps (“click Create, choose a size…”). Kubernetes works the same way: you describe the desired state, and something else does the work.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>Infrastructure as code means infrastructure described in files you can review and repeat.</li><li>Providers talk to platforms; resources are the things they create.</li><li>Always read the plan before you approve it.</li></ul></div>
