---
title: "Create a local Kubernetes cluster with kind"
slug: kind-cluster
order: 3
tags: [kind]
description: "From nothing to a running multi-node cluster: install the tools, create local-cluster-1, switch kubectl to it, make namespaces."
date: 2026-10-14
source: 01-kind-cluster-spin.md
---

# 01 — Create a local Kubernetes cluster with kind

From nothing to a running multi-node cluster with namespaces ready for your apps: install the tools, create the
cluster `local-cluster-1`, switch kubectl to it, look at the nodes, make namespaces. Every command is here, one
per line, with what it does and what you should see. Nothing depends on a script: you type (or paste) each
command yourself.

New to the words (node, context, namespace)? Read [00-concepts.md](00-concepts.md) first, or alongside.

**Two habits that save time**

- **Paste one command at a time.** Long lines sometimes wrap in the terminal and run as two broken halves.
  Every command below is kept short for that reason.
- **Run the check at the end of each part** before moving on. If the output differs, stop and re-check the
  previous command before going further.

The names used throughout (change them if you like, but change them everywhere):


| Thing           | Name                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ |
| Cluster         | `local-cluster-1`                                                                    |
| kubectl context | `kind-local-cluster-1` (kind always adds the `kind-` prefix)                         |
| Nodes           | `local-cluster-1-control-plane`, `local-cluster-1-worker`, `local-cluster-1-worker2` |
| Namespaces      | `web`, `cache`, `db`                                                                 |

---

## Part 1 — Prepare the machine

**1.1 Start Docker.** kind runs every Kubernetes node as a Docker container, so Docker must be running.
Open Docker Desktop and wait until it says it is running, then:

```bash
docker info --format '{{.ServerVersion}}'
```

Prints a version number (for example `29.8.2`). An error like "Cannot connect to the Docker daemon" means
Docker is not up yet.

**1.2 Give Docker enough memory.** Docker Desktop → Settings → Resources. Three nodes need roughly
**4 GB or more**; 8 GB is comfortable. Apply & restart, then check what Docker actually has:

```bash
docker info --format '{{.MemTotal}}'
```

A number in bytes (`8000000000` ≈ 8 GB).

**1.3 Install the tools** (macOS with Homebrew):

```bash
brew install kind kubectl
```

- `kind` — creates and deletes the cluster.
- `kubectl` — the command you use to talk to any Kubernetes cluster. (Docker Desktop may already provide
one; if `kubectl version --client` works you can skip this.)

**Check:**

```bash
kind version
```

```bash
kubectl version --client
```

Both print a version. Nothing else is needed for this guide.

---



## Part 2 — Create the cluster

**2.1 Write the cluster description.** kind builds whatever a small YAML file describes. This one asks for
one control-plane node and two worker nodes:

```bash
cat > kind-config.yaml <<'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: local-cluster-1
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 8080
        listenAddress: "127.0.0.1"
  - role: worker
  - role: worker
EOF
```

Line by line:

- `name: local-cluster-1` — the cluster's name. It becomes the prefix of the node containers and the
suffix of the kubectl context.
- `role: control-plane` — the "brain" node: API server, scheduler, etcd.
- `role: worker` (twice) — nodes that run your pods. Two lines, two workers.
- `extraPortMappings` — opens a door from your Mac into the cluster: Mac port `8080` → port `30080` on the
node. It is used in Part 2.3 of [04-deployment.md](04-deployment.md). It can only be set **now**, when the cluster is created.

**kind cannot add a node to a running cluster.** To change the number of nodes, edit this file, delete the
cluster ([06-clean-up.md](06-clean-up.md)) and create it again. That takes about a minute, so experiment freely.

**2.2 Create it** (one to two minutes the first time: kind downloads a node image of about 1 GB):

```bash
kind create cluster --config kind-config.yaml
```

It prints a checklist (Preparing nodes, Writing configuration, Starting control-plane, Joining worker
nodes…) and ends with `Set kubectl context to "kind-local-cluster-1"`.

**2.3 Look at what Docker now has.** Each node is one container:

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}'
```

```
NAMES                           STATUS
local-cluster-1-worker2         Up ...
local-cluster-1-worker          Up ...
local-cluster-1-control-plane   Up ...
```

And kind's own view:

```bash
kind get clusters
```

```bash
kind get nodes --name local-cluster-1
```

**Check:** `kind get clusters` lists `local-cluster-1`, and three node containers are `Up`.

---



## Part 3 — Switch to the cluster

kubectl keeps a list of clusters it can talk to (the **kubeconfig**, `~/.kube/config`). Each entry is a
**context**: a cluster plus a user. Every kubectl command goes to the **current** context.

> **Why this part matters.** If your kubeconfig also holds a cloud or work cluster, a command meant for
> your toy cluster will happily run against that one. Always know the current context.

**3.1 List the contexts** (`*` marks the current one):

```bash
kubectl config get-contexts
```

You should see `kind-local-cluster-1` in the list.

**3.2 Show just the current one:**

```bash
kubectl config current-context
```

`kind create cluster` already switched to the new cluster, so this normally prints `kind-local-cluster-1`.

**3.3 Switch to it explicitly** (what you run any time the current context is something else):

```bash
kubectl config use-context kind-local-cluster-1
```

Prints `Switched to context "kind-local-cluster-1".`

**3.4 Confirm it answers:**

```bash
kubectl cluster-nfo --context kind-local-cluster-1
```

Prints the API server address (`https://127.0.0.1:<random port>`) and CoreDNS.

**3.5 A safety habit.** Add `--context` to a single command to aim it without switching:

```bash
kubectl --context kind-local-cluster-1 get nodes
```

**Check:** `kubectl config current-context` prints `kind-local-cluster-1`.

---

## Part 4 — The nodes

**4.1 See them:**

```bash
kubectl get nodes
```

```
NAME                            STATUS   ROLES           AGE   VERSION
local-cluster-1-control-plane   Ready    control-plane   2m    v1.xx.x
local-cluster-1-worker          Ready    <none>          2m    v1.xx.x
local-cluster-1-worker2         Ready    <none>          2m    v1.xx.x
```

All three must be `Ready`. (`ROLES <none>` on a worker is normal.)

**4.2 More detail**: internal IPs, OS, container runtime:

```bash
kubectl get nodes -o wide
```

**4.3 Label the workers.** A label is a sticky note on an object. On its own it does nothing; it only matters
when a pod asks for it. In Part 1.3 of [04-deployment.md](04-deployment.md) the Postgres pod says `nodeSelector: role: data` ("run me only on a node
labelled `role=data`"), so the scheduler puts it on the node labelled that way. A pod with no `nodeSelector`
can land on any worker. These two labels set up that choice; `role=app` is not used until you write a pod that
selects it:

```bash
kubectl label node local-cluster-1-worker role=app
```

```bash
kubectl label node local-cluster-1-worker2 role=data
```

**Check:**

```bash
kubectl get nodes --show-labels
```

The two workers show `role=app` and `role=data` among their labels.

**4.4 Why pods never land on the control-plane.** A label lets a pod choose a node. A *taint* works the other
way round: it is a "keep out" sign on the node. The scheduler (the part that picks a node for each pod) will
not place a pod on a tainted node unless the pod carries a matching permission slip, called a *toleration*.

```bash
kubectl describe node local-cluster-1-control-plane | grep Taints
```

```
Taints:             node-role.kubernetes.io/control-plane:NoSchedule
```

A taint is written `key=value:effect`:

| Part | Here | Meaning |
| --- | --- | --- |
| key | `node-role.kubernetes.io/control-plane` | the name of the taint |
| value | (empty) | not needed, the key says it all |
| effect | `NoSchedule` | what the taint does |

The three effects:

- `NoSchedule` — new pods without a toleration are not placed here. Pods already running stay.
- `PreferNoSchedule` — a soft version: avoided, but used if nothing else fits.
- `NoExecute` — also evicts pods already running there that do not tolerate it.

**Why the control-plane has one.** It runs the cluster's brain (API server, scheduler, etcd). If your apps
shared the node and used up its CPU or memory, the whole cluster could slow down or stop answering. The
cluster's own components carry the toleration, so they can run there. Your pods do not, so they only run on
the workers.

**A single-node cluster is different.** With only a control-plane node, kind removes this taint, because
there would be nowhere else to run pods. The taint is present in this 3-node config, not always.

**Running a pod on the control-plane anyway.** Give the pod a toleration:

```yaml
spec:
  tolerations:
    - key: node-role.kubernetes.io/control-plane
      operator: Exists
      effect: NoSchedule
```

Each field says how to match a taint:

- `key` — which taint this toleration is for.
- `effect` — which effect it covers. Leave it out and it covers every effect of that key.
- `operator` — how the key (and value) are compared. Table below.

| operator | Matches when | `value` |
| --- | --- | --- |
| `Exists` | the node has a taint with that key, whatever its value | leave it out |
| `Equal` (the default) | the key **and** the value are both the same | required |

`Exists` fits here because the control-plane taint has no value. `Equal` fits a taint that has one, such as
`dedicated=data:NoSchedule`: the toleration then says `key: dedicated`, `operator: Equal`, `value: data`.
An `Exists` toleration with no `key` at all matches every taint, a pass for the whole cluster; use it
only for system components.

A toleration is permission, not a command. It lets a pod onto a tainted node but does not send it there. To
send it, add a `nodeSelector` as well.

Or remove the taint from the node. The trailing `-` means "delete this taint":

```bash
kubectl taint node local-cluster-1-control-plane node-role.kubernetes.io/control-plane:NoSchedule-
```

Not something to do routinely; it is mainly useful on very small clusters.

---



## Part 5 — Namespaces

A namespace is a folder inside the cluster. Names only have to be unique within one, and you can look at
one folder at a time. Create the three used below:

```bash
kubectl create namespace web
```

```bash
kubectl create namespace cache
```

```bash
kubectl create namespace db
```

**Check:**

```bash
kubectl get namespaces
```

`web`, `cache` and `db` are there, next to the built-in `default`, `kube-system`, `kube-public` and
`kube-node-lease`.

Every later command carries `-n <namespace>` to say which folder it means. Leave it off and kubectl uses
`default`. (To change that default for the current context: `kubectl config set-context --current --namespace=web`. This guide always spells out `-n`, so you can skip it.)

---

## Where next

- Deploy apps into the namespaces: [04-deployment.md](04-deployment.md)
- Run an image you built yourself: [03-run-your-image.md](03-run-your-image.md)
- Prefer a cluster whose nodes you can add and remove live: [02-k3d-cluster-spin.md](02-k3d-cluster-spin.md)
- Stop or remove it all: [06-clean-up.md](06-clean-up.md)
