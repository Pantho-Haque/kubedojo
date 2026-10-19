---
id: h2-security
title: Tiller’s power, and how teams locked it down
emoji: 🔐
stage: 2
quiz:
  - q: Why was a default Tiller a security problem?
    options:
      - It was slow
      - Anyone who could reach Tiller could act with Tiller’s permissions, often cluster-admin
      - It stored charts in plain text
    answer: 1
    why: Tiller’s gRPC port had no authentication by default, so it bypassed the caller’s own RBAC.
  - q: How does Helm 3 avoid the problem?
    options:
      - It removed Tiller; the helm client acts with your own kubeconfig permissions
      - It encrypts Tiller
      - It runs Tiller on your laptop
    answer: 0
    why: Without a server in the cluster, Helm can only do what you are allowed to do.
---

<div class="box story"><div class="tag">The problem</div>A developer with read-only access to one namespace runs <code>helm2 install</code> and creates objects everywhere. Their RBAC said no; Tiller, running as cluster-admin, said yes.</div>

<div class="box idea"><div class="tag">The big idea</div>Tiller acts with <b>its own</b> service account’s permissions, not yours. With the common cluster-admin setup, anything that can reach Tiller’s port (44134) can change anything in the cluster.</div>

## How teams locked it down

- **One Tiller per team namespace**, each with a service account limited to that namespace: `helm2 init --tiller-namespace team-a --service-account tiller`, and clients use `--tiller-namespace team-a`.
- **TLS between client and Tiller**, so only holders of a certificate can talk to it: `helm2 init --tiller-tls --tiller-tls-verify ...`.
- **Keep history small**: `helm2 init --history-max 200` stops thousands of ConfigMaps piling up in kube-system.

<div class="box like"><div class="tag">Think of it like…</div>A master key hanging by the door. Convenient, until you notice that everyone who walks past can pick it up.</div>

<div class="box keep"><div class="tag">Remember</div><ul><li>Tiller’s permissions, not yours, decide what an install can do.</li><li>Lock it down per namespace, with TLS, and with a history limit.</li><li>Helm 3 removed the problem by removing Tiller.</li></ul></div>
