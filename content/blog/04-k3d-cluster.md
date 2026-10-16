---
title: "Create a local Kubernetes cluster with k3d"
slug: k3d-cluster
order: 4
tags: [k3d]
description: "The same journey with k3d, plus live node add and remove, a load balancer, ingress, metrics and a built-in registry."
date: 2026-10-14
source: 02-k3d-cluster-spin.md
---

# 02 — Create a local Kubernetes cluster with k3d

The same journey as [01-kind-cluster-spin.md](01-kind-cluster-spin.md), with k3d instead of kind: install,
create the cluster `local-cluster-1`, switch kubectl to it, look at the nodes, make namespaces. Then the extras
that make k3d feel more like a managed cloud cluster (GKE): adding and removing nodes live, a load balancer,
ingress, metrics, a built-in registry and a dashboard.

k3d runs **k3s**, a small certified Kubernetes, inside Docker. Each node is a Docker container, as with kind.

> **Not tested yet.** Written from k3d's documented behaviour. Run it once and fix anything that differs
> (`k3d <command> --help` shows the exact flags for your version).

New to the words (node, context, namespace)? See [00-concepts.md](00-concepts.md).

## kind or k3d?

| | kind | k3d |
| --- | --- | --- |
| Add or remove a node on a running cluster | no, re-create the cluster | yes, `k3d node create` / `delete` |
| Load balancer, ingress, metrics-server | install them yourself | bundled with k3s |
| Local registry | a few manual steps | one flag |
| Kubernetes | upstream, as it ships | k3s, lighter and faster to start |
| Context name | `kind-<name>` | `k3d-<name>` |

Everything you learn about kubectl, namespaces, Deployments, Services and `nodeSelector` is the same on both.

The names used throughout:

| Thing | Name |
| --- | --- |
| Cluster | `local-cluster-1` |
| kubectl context | `k3d-local-cluster-1` (k3d always adds the `k3d-` prefix) |
| Nodes | `k3d-local-cluster-1-server-0`, `k3d-local-cluster-1-agent-0`, `k3d-local-cluster-1-agent-1` |
| Load balancer container | `k3d-local-cluster-1-serverlb` |
| Registry container | `k3d-local-registry` |
| Namespaces | `web`, `cache`, `db` |

k3s calls the control-plane a **server** and a worker an **agent**.

---

## Part 1 — Prepare the machine

**1.1 Start Docker** and give it enough memory, as in Part 1 of
[01-kind-cluster-spin.md](01-kind-cluster-spin.md): roughly 4 GB or more for three nodes.

```bash
docker info --format '{{.ServerVersion}}'
```

**1.2 Install the tools:**

```bash
brew install k3d
```

```bash
brew install --cask headlamp
```

`k3d` makes the cluster. `headlamp` is a desktop dashboard that reads your kubeconfig (used in Part 6). You
also need `kubectl`: `brew install kubectl` if `kubectl version --client` does not work.

**Check:**

```bash
k3d version
```

Prints the k3d and k3s versions.

---

## Part 2 — Create the cluster

```bash
k3d cluster create local-cluster-1 --servers 1 --agents 2 --port "8080:80@loadbalancer" --registry-create local-registry:0.0.0.0:5001
```

If your terminal wraps long lines, paste it in the shorter form, with `\` at the line ends:

```bash
k3d cluster create local-cluster-1 \
  --servers 1 --agents 2 \
  --port "8080:80@loadbalancer" \
  --registry-create local-registry:0.0.0.0:5001
```

Flag by flag:

- `local-cluster-1` — the cluster name.
- `--servers 1` — one control-plane node. `--agents 2` — two worker nodes.
- `--port "8080:80@loadbalancer"` — local port 8080 → port 80 on the cluster's load balancer. This is how you
  reach Ingress and LoadBalancer Services from the browser, with no `port-forward`. Like kind's
  `extraPortMappings`, it is set at creation (add more `--port` flags for more ports).
- `--registry-create local-registry:0.0.0.0:5001` — starts a registry container named `k3d-local-registry`,
  published on local port 5001, and tells every node to use it.

It takes about a minute and ends by switching your kubectl context.

**Look at what Docker now has:**

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

Three node containers (`…-server-0`, `…-agent-0`, `…-agent-1`), the load balancer `…-serverlb`, and
`k3d-local-registry`.

```bash
k3d cluster list
```

**Check:** `local-cluster-1` is listed with `1/1` servers and `2/2` agents.

---

## Part 3 — Switch to the cluster

The context is `k3d-local-cluster-1`: k3d's prefix, the way kind's is `kind-`. How the names come about:
[00-concepts.md](00-concepts.md#names-kubeconfig-and-contexts).

> If your kubeconfig also holds a cloud or work cluster, a command meant for your lab cluster will run against
> that one when it is the current context. Always know the current context.

```bash
kubectl config get-contexts
```

```bash
kubectl config current-context
```

```bash
kubectl config use-context k3d-local-cluster-1
```

```bash
kubectl cluster-info --context k3d-local-cluster-1
```

To aim one command without switching: `kubectl --context k3d-local-cluster-1 get nodes`.

**Check:** `kubectl config current-context` prints `k3d-local-cluster-1`.

---

## Part 4 — The nodes

**4.1 See them:**

```bash
kubectl get nodes
```

```
k3d-local-cluster-1-server-0   Ready   control-plane,master
k3d-local-cluster-1-agent-0    Ready   <none>
k3d-local-cluster-1-agent-1    Ready   <none>
```

All three `Ready`.

**4.2 One difference from kind.** In kind, the control-plane node is tainted so your pods stay off it. In
k3s the server node has no such taint by default, so your pods **can** be scheduled on it too. If you want them
only on the agents, taint the server:

```bash
kubectl taint node k3d-local-cluster-1-server-0 node-role.kubernetes.io/control-plane=true:NoSchedule
```

(What a taint is, and how a toleration lets a pod past it: [00-concepts.md](00-concepts.md#taints-and-tolerations).)

**4.3 Node pools: labels and taints.** k3d has no node pools. The Kubernetes equivalent is a label that pods
select, and optionally a taint that keeps other pods away.

```bash
kubectl label node k3d-local-cluster-1-agent-0 pool=app
```

```bash
kubectl label node k3d-local-cluster-1-agent-1 pool=data
```

```bash
kubectl taint node k3d-local-cluster-1-agent-1 dedicated=data:NoSchedule
```

A pod then needs both the selector and the matching toleration to land on the `data` pool:

```yaml
spec:
  nodeSelector:
    pool: data
  tolerations:
    - key: dedicated
      operator: Equal
      value: data
      effect: NoSchedule
```

**4.4 Add and remove nodes live.** This is the part kind cannot do.

Add a worker:

```bash
k3d node create extra --cluster local-cluster-1 --role agent
```

```bash
kubectl get nodes
```

A new node appears (named `k3d-extra-0`; `k3d node list` shows the exact name).

Remove it. Drain first so its pods move to other nodes:

```bash
kubectl drain k3d-extra-0 --ignore-daemonsets --delete-emptydir-data
```

```bash
kubectl delete node k3d-extra-0
```

```bash
k3d node delete k3d-extra-0
```

---

## Part 5 — Namespaces

Identical to kind:

```bash
kubectl create namespace web
```

```bash
kubectl create namespace cache
```

```bash
kubectl create namespace db
```

```bash
kubectl get namespaces
```

`web`, `cache` and `db` are there, next to the built-in `default`, `kube-system`, `kube-public` and
`kube-node-lease`.

To deploy apps into them (the same commands on k3d), see [04-deployment.md](04-deployment.md). Use the pool
labels from 4.3 instead of kind's `role=data` in the `nodeSelector`.

---

## Part 6 — What k3d gives you that kind does not

k3s bundles most of what a managed cluster provides, so there is little to install:

| GKE feature | Here | Install needed? |
| --- | --- | --- |
| Nodes you can add and remove live | `k3d node create` / `k3d node delete` | no |
| `type: LoadBalancer` gets an address | k3s's built-in service load balancer, reached through k3d's load balancer container | no |
| Ingress | Traefik, bundled with k3s | no |
| Metrics, `kubectl top`, pod autoscaling | metrics-server, bundled with k3s | no |
| Persistent volumes | `local-path` storage class, bundled with k3s | no |
| Container registry (Artifact Registry) | a registry container k3d creates and wires into the nodes | one flag |
| Node pools | node labels and taints | two commands |
| Console UI | Headlamp | one install |
| Node autoscaling, Autopilot, IAM | not available locally | — |

### 6.1 Reach an app with Ingress or a LoadBalancer

Deploy something first:

```bash
kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web
```

```bash
kubectl expose deployment web --port=80 -n web
```

**Ingress** (Traefik picks it up):

```bash
kubectl apply -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
  namespace: web
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 80
EOF
```

```bash
curl -s http://localhost:8080 | head -5
```

The nginx page: local port 8080 → load balancer → Traefik → Service → pod.

**LoadBalancer Service** (the GKE-style external address):

```bash
kubectl expose deployment web --name=web-lb --type=LoadBalancer --port=80 -n web
```

```bash
kubectl get service web-lb -n web
```

`EXTERNAL-IP` fills in with a node address. Port 80 through `localhost:8080` is already taken by Traefik, so
for a second LoadBalancer Service use another port (`--port=8081`) and add a matching `--port` mapping when
creating the cluster, or just use `kubectl port-forward`.

### 6.2 Metrics and pod autoscaling

```bash
kubectl top nodes
```

Works after about a minute (metrics-server is bundled). Then autoscale the pods. The autoscaler needs the pods
to declare a CPU request:

```bash
kubectl set resources deployment web --requests=cpu=50m -n web
```

```bash
kubectl autoscale deployment web --cpu=50% --min=2 --max=6 -n web
```

```bash
kubectl get hpa -n web
```

Shows current vs target CPU. It adds pods under load, up to 6, and removes them again. That is **pod**
autoscaling, which works as it does on GKE. Node autoscaling does not exist here.

### 6.3 Your own images

Two ways, as in [03-run-your-image.md](03-run-your-image.md), and both are simpler on k3d.

**Copy the image into the nodes** (the equivalent of `kind load`):

```bash
k3d image import my-app:v1 -c local-cluster-1
```

**Or use the registry** created with the cluster. Push from your terminal:

```bash
docker build -t localhost:5001/my-app:v1 .
```

```bash
docker push localhost:5001/my-app:v1
```

Inside the cluster the same registry has another name (a node's `localhost` is the node itself), and k3d has
already set up the mirror on every node. That replaces the manual registry steps in Part 1.2 of
[03-run-your-image.md](03-run-your-image.md):

```bash
kubectl create deployment my-app --image=k3d-local-registry:5000/my-app:v1 -n web
```

### 6.4 Dashboard

Open Headlamp from Applications. It lists your kubeconfig's contexts; pick `k3d-local-cluster-1`. It shows
nodes, namespaces, pods, logs and events: the nearest thing to the Cloud Console here.

---

## Part 7 — Stop, start, delete

Pause the cluster to free memory, and bring it back:

```bash
k3d cluster stop local-cluster-1
```

```bash
k3d cluster start local-cluster-1
```

Remove the cluster. This also removes its kubectl context:

```bash
k3d cluster delete local-cluster-1
```

The registry container created with `--registry-create` may be left behind. Remove it too:

```bash
docker rm -f k3d-local-registry
```

**Check:**

```bash
k3d cluster list
```

```bash
docker ps -a --format 'table {{.Names}}\t{{.Status}}'
```

No `k3d-…` containers should remain. If a stale context is left in your kubeconfig, remove it as in
[06-clean-up.md](06-clean-up.md), using the name `k3d-local-cluster-1`.
