---
title: "Local Kubernetes with kind and k3d: start here"
slug: start-here
order: 0
tags: [overview]
description: "What this learning lab covers, in which order to read it, and the one rule to follow before you run anything."
date: 2026-10-16
source: README.md
---


How to run a real, multi-node Kubernetes cluster on your own computer, using **kind** or **k3d** (Kubernetes in
Docker), then deploy apps into it, one at a time, into namespaces you choose. It is a learning lab: cheap to
build, safe to break, gone in one command.

Written from a working setup on macOS (Apple Silicon, Docker Desktop, Homebrew). The idea is general: only
the install commands are macOS-specific.

## Read in this order

| File | What it gives you |
| --- | --- |
| [00-concepts.md](00-concepts.md) | The words and ideas: kind, nodes, taints, contexts and kubeconfig, namespaces (including `kube-system`, `kube-public`, `kube-node-lease`), pods, Services. Read once, come back as needed. |
| [00-concepts-user-permissions.md](00-concepts-user-permissions.md) | Who may do what in which namespace: RBAC (Roles, bindings, ServiceAccounts), hands-on users and groups, and the layers of a complete cluster ACL. |
| [01-kind-cluster-spin.md](01-kind-cluster-spin.md) | Install the tools, create the 3-node cluster `local-cluster-1` with kind, switch to it, look at the nodes, make namespaces. |
| [02-k3d-cluster-spin.md](02-k3d-cluster-spin.md) | The same with k3d, plus what k3d adds: live node add/remove, load balancer, ingress, metrics, a built-in registry, a dashboard. |
| [03-run-your-image.md](03-run-your-image.md) | Get an image you built into the cluster and run it: `kind load`, or a local registry. |
| [04-deployment.md](04-deployment.md) | Deploy apps into the namespaces one at a time, place pods on nodes, and use them: port-forward, DNS between namespaces, NodePort, scaling. |
| [05-helm-deployment.md](05-helm-deployment.md) | Package an app as a Helm 2 chart and deploy it: every template explained (Deployment, Service, ConfigMap, Secret, image pull secret `regsecret`, Ingress, autoscaling, hooks and more), plus Tiller setup and a production checklist. |
| [06-clean-up.md](06-clean-up.md) | Delete the namespaces, stop and start the cluster, or shut everything down and remove the kubectl context. |

## Try it in your browser

Every command in these guides can be run first in the **KubeDojo playground**: a simulator of `kind`, `k3d`, `docker`, `kubectl` and Helm 2 with a live picture of the cluster. Nothing touches your computer, so you can follow along, make mistakes and reset. When it works, the playground can export the same cluster as a setup script for your real machine.

[Open the playground](/app)

Start with 01 (kind) or 02 (k3d). After that 03 and 04 work on either, in any order.

## The whole thing on one page

What the kind guide builds, with the commands it uses:

| Step | What happens | The command |
| --- | --- | --- |
| 1 | Install the tools | `brew install kind kubectl` |
| 2 | Describe a 3-node cluster named `local-cluster-1` | write `kind-config.yaml` |
| 3 | Create it (runs Docker containers as nodes) | `kind create cluster --config kind-config.yaml` |
| 4 | Point kubectl at it | `kubectl config use-context kind-local-cluster-1` |
| 5 | Check the nodes | `kubectl get nodes` |
| 6 | Label the workers to place pods later | `kubectl label node <node> role=<value>` |
| 7 | Make namespaces | `kubectl create namespace <name>` |
| 8 | Deploy an app into a namespace | `kubectl create deployment <name> --image=<image> -n <namespace>` |
| 9 | Give it a stable name | `kubectl expose deployment <name> --port=<port> -n <namespace>` |
| 10 | Look at it, from your local machine | `kubectl get pods -A -o wide`, `kubectl port-forward` |
| 11 | Remove it | `kind delete cluster --name local-cluster-1` |

Time: about 15 minutes the first run (most of it downloading images), a couple of minutes after that.

## What you need

- A Mac (or Linux) with **Docker** running, and about **4–8 GB of memory** given to it.
- **Homebrew** for the install commands.
- A terminal. Everything is typed commands; no GUI steps except Docker's settings.

## One rule before you start

`kubectl` sends every command to the **current context**. If your computer also has a cloud or work cluster
in `~/.kube/config`, that cluster may be the current one. Before any command that changes something:

```bash
kubectl config current-context
```

It should say `kind-local-cluster-1` (or `k3d-local-cluster-1`).
