---
id: tf-bridge
title: 'Where Terraform fits with Docker, Kubernetes, and Helm'
emoji: "\U0001F517"
stage: 0
format: html
quiz:
  - q: Which job is the best fit for Terraform?
    options:
      - Restarting a crashed container
      - Creating the Kubernetes cluster and its database
      - Building a Docker image
    answer: 1
    why: >-
      Terraform creates and changes infrastructure. Kubernetes heals containers;
      Docker builds images.
  - q: You release a new app version every day. What usually deploys it?
    options:
      - Kubernetes and Helm
      - A new Terraform apply each time
    answer: 0
    why: >-
      App releases go through the deploy tools; Terraform changes the
      infrastructure underneath.
---
<p class="lead">Each tool in this course works on a different layer. Terraform usually builds the ground floor.</p>
<table><tr><th>Tool</th><th>Its job</th><th>Pizza example</th></tr>
<tr><td><b>Terraform</b></td><td>Create infrastructure: networks, clusters, databases, DNS, permissions</td><td>Make the Kubernetes cluster, the database, and pizza.example.com</td></tr>
<tr><td><b>Docker</b></td><td>Package an app into an image</td><td>Build pizza:v1</td></tr>
<tr><td><b>Kubernetes</b></td><td>Run and heal containers on a cluster</td><td>Keep 3 copies of pizza:v1 running</td></tr>
<tr><td><b>Helm</b></td><td>Install an app’s Kubernetes files with chosen settings</td><td>helm install pizza ./pizza-chart</td></tr></table>
<div class="flow"><span>🧱 Terraform builds the cluster</span>→<span>🐳 Docker builds the image</span>→<span>☸️ Kubernetes runs it</span>→<span>⛵ Helm installs and upgrades it</span></div>
<div class="box idea"><div class="tag">The big idea</div>Terraform manages things that live a long time and change slowly. Your app changes every day; deploy it with Kubernetes and Helm, not by running Terraform for every release.</div>
<p>Terraform <i>can</i> also install Helm charts and Kubernetes objects through its Helm and Kubernetes providers. Many teams still keep the layers separate, so an app release cannot accidentally change the cluster underneath it.</p>
<div class="box warnbox">Terraform creates and changes infrastructure. It is not the right tool for setting up the software inside a running server; build that into an image instead.</div>
<details class="file"><summary>What about OpenTofu?</summary><p>OpenTofu is an open-source fork of Terraform run by the Linux Foundation. Its files and commands are almost the same: type <code>tofu</code> instead of <code>terraform</code>. Everything in this course works with either.</p></details>
<div class="box keep"><div class="tag">Remember</div><ul><li>Terraform builds the place; Docker, Kubernetes, and Helm run the app in it.</li><li>Keep slow-changing infrastructure and fast-changing app releases separate.</li></ul></div>
