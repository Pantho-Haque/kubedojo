---
id: h2-tiller
title: 'Tiller: the server Helm 2 needs'
emoji: 🛞
stage: 0
quiz:
  - q: Where does Tiller run?
    options:
      - On your laptop, next to the helm2 client
      - Inside the cluster, usually as the tiller-deploy Deployment in kube-system
      - In a cloud service run by the Helm project
    answer: 1
    why: helm2 init installs Tiller into the cluster. The client finds it there.
  - q: You run helm2 ls and see "Error could not find tiller". What is missing?
    options:
      - A chart
      - Tiller has not been installed in this cluster yet
      - Your values file
    answer: 1
    why: Every Helm 2 command that touches releases goes through Tiller, so install it first with helm2 init.
---

<div class="box story"><div class="tag">The problem</div>You type <code>helm2 install</code> and get <i>Error: could not find tiller</i>. Your chart is fine. Helm 2 just has nobody in the cluster to send it to.</div>

<div class="box idea"><div class="tag">The big idea</div><b>Tiller</b> is Helm 2’s server. <code>helm2 init</code> installs it into the cluster as the <code>tiller-deploy</code> Deployment in <code>kube-system</code>. From then on, the client sends every install, upgrade, and rollback to Tiller, and Tiller stores each release revision as a ConfigMap next to it.</div>

## Install Tiller

Tiller acts on the cluster with the permissions of its own service account, so create one first:

```bash
kubectl -n kube-system create serviceaccount tiller
kubectl create clusterrolebinding tiller --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
helm2 init --service-account tiller --wait
```

Then check both halves:

```bash
kubectl -n kube-system get deploy tiller-deploy
helm2 version --short
```

`helm2 version` prints a **Client** and a **Server** line. If the server line is missing, Tiller is not reachable; if the versions differ, run `helm2 init --upgrade`.

<div class="box like"><div class="tag">Think of it like…</div>A shop counter. You (the client) hand an order (the chart) over the counter; the clerk behind it (Tiller) does the work in the back room and files the receipt (the release history).</div>

<div class="box warnbox">The cluster-admin binding above is the quick, common setup, and the reason Tiller was risky: anything that can talk to Tiller can do anything in the cluster. Lesson 6 shows how teams locked it down.</div>

<div class="box keep"><div class="tag">Remember</div><ul><li>helm2 init installs Tiller into kube-system.</li><li>Tiller works with its own service account’s permissions.</li><li>helm2 version shows both halves; they should match.</li></ul></div>
