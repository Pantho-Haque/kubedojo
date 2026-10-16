---
title: "Stop, shut down and clean up"
slug: clean-up
order: 8
tags: [kind, k3d]
description: "Three levels of tidying, from deleting namespaces to removing the cluster and its kubectl context."
date: 2026-10-14
source: 06-clean-up.md
---

# 06 — Stop, shut down and clean up

For the kind cluster `local-cluster-1`; for a k3d cluster see the last section of
[02-k3d-cluster-spin.md](02-k3d-cluster-spin.md). Three levels, from lightest to complete. Pick the one you
need.


| You want                                 | Level                      |
| ---------------------------------------- | -------------------------- |
| Free memory for a while, keep everything | Part 2: stop the cluster      |
| Empty the cluster, keep the cluster      | Part 1: delete the namespaces |
| Remove everything this guide made        | Part 3: complete shutdown     |




## Part 1 — Delete the namespaces (the cluster stays)

```bash
kubectl delete namespace web cache db
```

Deletes the namespaces and everything inside them: Deployments, pods, Services. The cluster and its nodes
keep running, empty.

## Part 2 — Stop the cluster and start it again

kind has no stop command, but its nodes are Docker containers, so stop those. Everything inside the cluster
is kept:

```bash
docker stop $(kind get nodes --name local-cluster-1)
```

`kind get nodes` prints the three node names; `docker stop` stops each one. The memory is freed.

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}'
```

The three `local-cluster-1-…` containers are gone from the running list.

To bring it back:

```bash
docker start $(kind get nodes --name local-cluster-1)
```

Wait a minute or two, then:

```bash
kubectl get nodes
```

All three `Ready` (they show `NotReady` for a short while). Your namespaces and deployments are still there;
their pods restart on their own.

## Part 3 — Complete shutdown

Do these in order. Each removes one layer; stop wherever you like.

**1. Delete the cluster** (the three node containers and everything inside):

```bash
kind delete cluster --name local-cluster-1
```

kind also removes the cluster's entries from `~/.kube/config`: the context, cluster and user, all named
`kind-local-cluster-1`.

**2. Check what kubectl still lists:**

```bash
kubectl config get-contexts
```

`kind-local-cluster-1` should be gone. If it is still listed, it is a stale entry: this happens when the
cluster was removed another way (for example its containers were deleted with `docker rm`, so kind never
cleaned the file). Remove it by hand. A context is only a pointer, so deleting it never touches a cluster:

```bash
kubectl config delete-context kind-local-cluster-1
```

Read the exact name from the `NAME` column first, and never delete a cloud context (`gke_…`) you still use.
If the cluster and user entries are also left behind, remove them too (they share the context's name):

```bash
kubectl config delete-cluster kind-local-cluster-1
```

```bash
kubectl config delete-user kind-local-cluster-1
```

**3. Pick a current context on purpose.** If the deleted one was current, kubectl now has none:

```bash
kubectl config current-context
```

An error `current-context is not set` means exactly that. Choose one, or leave it empty until you need it:

```bash
kubectl config use-context <the context you want>
```

**4. Remove the registry**, if you made one in Part 1.2 of [03-run-your-image.md](03-run-your-image.md) (this deletes every image pushed to it):

```bash
docker rm -f kind-registry
```

**5. Check nothing is left in Docker:**

```bash
docker ps -a --format 'table {{.Names}}\t{{.Status}}'
```

```bash
kind get clusters
```

No `local-cluster-1-…` or `kind-registry` containers, and `kind get clusters` does not list
`local-cluster-1`.

**6. Delete the files you wrote** (optional):

```bash
rm kind-config.yaml
```

**7. Free the disk** (optional). The node image stays in Docker's cache:

```bash
docker image rm kindest/node:<tag>
```

Find the tag with `docker image ls | grep kindest`.

**8. Quit Docker Desktop** (optional) to free memory: menu-bar whale icon → Quit Docker Desktop. With the
cluster deleted, nothing is left running.

**9clean everything** clean unused resources at once (asks first, removes all stopped containers and dangling images):

```bash
docker system prune
```
