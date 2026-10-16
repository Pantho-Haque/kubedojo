---
title: "Concepts: what each piece is"
slug: concepts
order: 1
tags: [basics, concepts]
description: "Clusters, nodes, taints, contexts, kubeconfig, namespaces and Services, explained once so the guides can refer back to them."
date: 2026-10-14
source: 00-concepts.md
---

# Concepts: what each piece is

Read this once. The guides ([01-kind-cluster-spin.md](01-kind-cluster-spin.md),
[02-k3d-cluster-spin.md](02-k3d-cluster-spin.md), [04-deployment.md](04-deployment.md)) refer back to these
ideas.

## The big picture

You want a real Kubernetes cluster on your own computer to learn on, without cloud bills or risk. kind makes
one out of Docker containers:

```
 your Mac
 └── Docker Desktop
     ├── local-cluster-1-control-plane   container = the "brain" node
     ├── local-cluster-1-worker          container = a node that runs your pods
     ├── local-cluster-1-worker2         container = another one
     └── kind-registry                   (optional) container = a private image store
```

Inside the nodes, your applications run as pods, grouped into namespaces:

```
 local-cluster-1
 ├── namespace web     web-… ×2 (nginx)     Service web
 ├── namespace cache   cache-… (redis)      Service cache
 └── namespace db      db-… (postgres)      Service db
```

## kind

**K**ubernetes **i**n **D**ocker. Each Kubernetes *node* is one Docker container that itself runs Kubernetes
components. The result behaves like a real multi-machine cluster: same `kubectl`, same YAML, same objects.
Delete the cluster and nothing else on your Mac is touched. It is for learning and testing, not production.

## Cluster, nodes, control plane

- **Cluster** — the whole thing: one control plane plus workers.
- **Control-plane node** — runs the API server (what `kubectl` talks to), the scheduler (decides which node
  runs each pod), and etcd (the cluster's database). It is tainted so ordinary pods stay off it.
- **Worker node** — runs your pods.

kind fixes the node list at creation. To change it, delete the cluster and create it again from an edited
config file.

## Names, kubeconfig and contexts

`~/.kube/config` lists every cluster kubectl knows, and how to log in. A **context** is one entry: cluster +
user (+ optional default namespace). The **current context** is where every command goes. `kind create
cluster` adds `kind-<cluster name>` and switches to it; `k3d cluster create` does the same with
`k3d-<cluster name>`.

Why it matters: if the same file holds a cloud or work cluster, running `kubectl delete` while the wrong
context is current deletes things there. Check with `kubectl config current-context`.

### Where the name comes from

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: local-cluster-1      # <-- this line
```

`name:` is the cluster's name. kind uses it in two places:

- the node containers are named `<name>-control-plane`, `<name>-worker`, `<name>-worker2`;
- the kubectl context is named `kind-<name>`.

Without that line, kind falls back to the name `kind`: nodes called `kind-control-plane` and a context called
`kind-kind`.

The same name can be given on the command line, where it overrides the file:

```bash
kind create cluster --name local-cluster-1
```

### The `kind-` prefix is added by kind

When `kind create cluster` finishes, it writes new entries into `~/.kube/config`, named `kind-` plus the
cluster name. The prefix is fixed; the config file cannot change it. It exists so kind clusters are easy to
spot next to cloud ones such as `gke_...` in `kubectl config get-contexts`.

To use another context name, rename it afterwards (see "They are separate" below).

### The kubeconfig file: three lists and a pointer

`~/.kube/config` holds three separate lists, plus the current context:

```yaml
clusters:                          # WHERE the cluster is
- name: kind-local-cluster-1
  cluster:
    server: https://127.0.0.1:54321
    certificate-authority-data: ...

users:                             # WHO you log in as
- name: kind-local-cluster-1
  user:
    client-certificate-data: ...
    client-key-data: ...

contexts:                          # WHICH cluster + WHICH user (+ namespace)
- name: kind-local-cluster-1
  context:
    cluster: kind-local-cluster-1  # points into the clusters list
    user: kind-local-cluster-1     # points into the users list
    namespace: web                 # optional default namespace

current-context: kind-local-cluster-1
```

| Thing | What it is | Holds |
| --- | --- | --- |
| **Cluster** (kubeconfig entry) | The address of an API server | URL and CA certificate |
| **User** | An identity | Certificate and key, or a token |
| **Context** | A named pairing of one cluster and one user | Pointers to the other two, and an optional default namespace |

kubectl only ever uses **contexts**. When you run `kubectl get pods`, it takes the current context, follows
its `cluster` pointer to find where to send the request, and follows its `user` pointer to find how to
authenticate.

### A fourth name: kind's own

`local-cluster-1`, without the prefix, is the name `kind` knows the cluster by:

```bash
kind get clusters
```

```bash
kind delete cluster --name local-cluster-1
```

kind is not kubectl, so it does not use kubeconfig names. It uses the `name:` from your config file.

All the names side by side:

| Name | Used by | Example |
| --- | --- | --- |
| `local-cluster-1` | `kind` commands, node container names | `kind get nodes --name local-cluster-1` |
| `kind-local-cluster-1` (cluster entry) | kubeconfig internals | rarely typed |
| `kind-local-cluster-1` (user entry) | kubeconfig internals | rarely typed |
| `kind-local-cluster-1` (context) | `kubectl` | `kubectl config use-context kind-local-cluster-1` |

### They are separate: prove it by renaming the context

kind gave all three kubeconfig entries one name because it is the simplest choice, not because they must
match. Rename only the context:

```bash
kubectl config rename-context kind-local-cluster-1 lab
```

```bash
kubectl config get-contexts
```

The context is now `lab`. Its CLUSTER and AUTHINFO columns still say `kind-local-cluster-1`, because the
pointers inside it did not change, and everything still works:

```bash
kubectl --context lab get nodes
```

To undo:

```bash
kubectl config rename-context lab kind-local-cluster-1
```

Cloud tools do the same thing: your `gke_...` contexts also repeat one long name in all three columns.

### Looking at the real file

Show the file with secrets hidden:

```bash
kubectl config view
```

Show only the current context's entries:

```bash
kubectl config view --minify
```

List the names of each part:

```bash
kubectl config get-clusters
```

```bash
kubectl config get-users
```

```bash
kubectl config get-contexts
```

## Namespaces

Folders inside a cluster. They separate teams or environments, let two apps use the same name, and let you
list or delete one group at a time (`-n <name>` on commands, `-A` for all). Deleting a namespace deletes
everything in it. They are not a security wall by themselves.

### The system namespaces

Every cluster starts with a few namespaces that Kubernetes creates for itself. Your apps do not go in them.
This section says what each one holds, so you recognise what you see and know what is safe to leave alone.

```bash
kubectl get namespaces
```

```
NAME              STATUS
default           Active
kube-system       Active
kube-public       Active
kube-node-lease   Active
```

| Namespace | One-line purpose |
| --- | --- |
| `kube-system` | The cluster's own components: DNS, networking, the control plane |
| `kube-public` | Information that anyone, even without logging in, may read |
| `kube-node-lease` | One small heartbeat object per node |
| `default` | Where objects go when you give no `-n`; yours to use |

---

#### kube-system

The home of the cluster's own machinery. What is inside depends on the kind of cluster.

##### In a kind cluster (the 3-node cluster from [01-kind-cluster-spin.md](01-kind-cluster-spin.md))

| Pod | Kind | What it does |
| --- | --- | --- |
| `kube-apiserver-<control-plane>` | static pod | The API server: what `kubectl` talks to |
| `etcd-<control-plane>` | static pod | The cluster's database |
| `kube-scheduler-<control-plane>` | static pod | Picks a node for each new pod |
| `kube-controller-manager-<control-plane>` | static pod | Runs the loops that keep reality matching your Deployments and the like |
| `coredns-…` (usually 2) | Deployment | Cluster DNS: how `web.web` becomes an IP |
| `kube-proxy-…` (one per node) | DaemonSet | Makes Services work by routing traffic to their pods |
| `kindnet-…` (one per node) | DaemonSet | The network plugin: gives pods IPs and lets them reach each other |

Terms:

- **Static pod:** started by a node's kubelet from a file on disk, not by a Deployment. The name ends with the
  node name. In kind the files are in `/etc/kubernetes/manifests` on the control-plane node.
- **DaemonSet:** runs one pod on every node. A 3-node cluster has three `kube-proxy` and three `kindnet`
  pods.

Besides pods, the namespace holds:

- the Service `kube-dns` (the stable address in front of `coredns`);
- ConfigMaps such as `coredns` and `kube-proxy` (their settings);
- ServiceAccounts, and bootstrap tokens used when nodes join;
- Leases used for leader election between components.

kind's local storage provisioner is not here; it has its own namespace, `local-path-storage`.

##### In k3s and k3d

`coredns`, `local-path-provisioner`, `metrics-server` and `traefik` (the bundled ingress), plus `svclb-…`
pods for LoadBalancer Services. k3s runs the control plane inside one process, so there are no separate
`kube-apiserver`, `etcd` or `kube-scheduler` pods.

##### In GKE

Google runs the control plane, so there is no `kube-apiserver` or `etcd` pod to see. Typically present:
`kube-dns` and `kube-dns-autoscaler`, `metrics-server`, `konnectivity-agent`, the persistent disk driver
(`pdcsi-node`), logging and metrics agents (`fluentbit-…`, `gke-metrics-agent`), and network pods (`netd` or
`anetd`). The exact list varies with the cluster's settings.

##### Rules of thumb

- Do not deploy your own apps into `kube-system`.
- Do not delete things there casually. Deleting `coredns` breaks DNS for the whole cluster; deleting
  `kube-proxy` breaks Services.
- When pods cannot resolve names or reach Services, `kube-system` is the first place to look.

##### Looking at it

```bash
kubectl get pods -n kube-system -o wide
```

All the components and the node each runs on.

```bash
kubectl get daemonset,deployment -n kube-system
```

Which are per-node and which are replicated.

```bash
kubectl get configmap -n kube-system
```

```bash
docker exec local-cluster-1-control-plane ls /etc/kubernetes/manifests
```

The static pod files on the kind control-plane node: `etcd.yaml`, `kube-apiserver.yaml`,
`kube-controller-manager.yaml`, `kube-scheduler.yaml`.

---

#### kube-public

A namespace whose contents can be read by **everyone, including users who are not logged in**. It is meant for
cluster information that must be available before anyone has credentials.

##### What is in it

Normally one ConfigMap:

```bash
kubectl get configmap -n kube-public
```

```
NAME           DATA   AGE
cluster-info   1      10m
```

`cluster-info` holds a small kubeconfig fragment: the API server's address and the cluster's CA certificate.
A new node reads it when joining a cluster built with `kubeadm`, to find the API server and to check it is
talking to the right one. kind builds its nodes with kubeadm, so it is there.

```bash
kubectl get configmap cluster-info -n kube-public -o yaml
```

##### Facts

- There are no pods in it, and your apps do not go there.
- The public read access comes from a Role and RoleBinding that grant it to anonymous users. Nothing in this
  namespace should be secret.
- Many managed clusters, GKE included, leave `kube-public` empty or unused.
- It is rarely touched in day-to-day work. Seeing it empty is normal.

---

#### kube-node-lease

A namespace that holds one **Lease** object per node. A Lease is a tiny record with a name, an owner and a
"last renewed" timestamp.

##### What it is for

Each node's kubelet renews its own Lease every few seconds (about 10 by default). That is the node's
heartbeat: "I am alive". The control plane watches the timestamps. If a Lease has not been renewed for around
40–50 seconds, the node is marked `NotReady` (shown as `Unknown` in some outputs), and pods on it are later
rescheduled elsewhere.

Before Leases, each heartbeat updated the whole Node object, which is large; with many nodes that put real
load on etcd. A Lease is small and cheap to update, so the heartbeat can be frequent without cost. The full
Node status is now updated much less often.

##### Looking at it

```bash
kubectl get lease -n kube-node-lease
```

```
NAME                            HOLDER                          AGE
local-cluster-1-control-plane   local-cluster-1-control-plane   10m
local-cluster-1-worker          local-cluster-1-worker          10m
local-cluster-1-worker2         local-cluster-1-worker2         10m
```

One Lease per node, named after the node.

```bash
kubectl get lease local-cluster-1-worker -n kube-node-lease -o yaml
```

The `renewTime` field changes every few seconds. Run it twice to watch it move.

##### Facts

- There are no pods in it, and nothing for you to manage; it is entirely automatic.
- The Lease is deleted when its node is removed from the cluster.
- Components such as the scheduler also use Leases for leader election, but those live in `kube-system`, not
  here.
- Stopping a node container (`docker stop local-cluster-1-worker`) stops its Lease renewals; after the grace
  period the node goes `NotReady`. That is a quick way to watch the mechanism work.

---

#### Side by side

| | `kube-system` | `kube-public` | `kube-node-lease` |
| --- | --- | --- | --- |
| Holds | Cluster components (pods, Services, ConfigMaps) | One ConfigMap, `cluster-info` | One Lease per node |
| Pods inside | Yes | No | No |
| Who can read | Cluster admins | Everyone, anonymous included | Cluster admins |
| Changes over time | When components restart or upgrade | Almost never | Every few seconds, automatic |
| You should | Look, don't touch | Leave alone | Leave alone |

## Taints and tolerations

A label lets a pod choose a node. A **taint** works the other way round: it is a "keep out" sign on a node.
The scheduler will not place a pod on a tainted node unless the pod carries a matching permission slip, a
**toleration**.

A taint is written `key=value:effect`, for example `dedicated=data:NoSchedule`.

| Effect | What it does |
| --- | --- |
| `NoSchedule` | New pods without a toleration are not placed here. Pods already running stay. |
| `PreferNoSchedule` | A soft version: avoided, but used if nothing else fits. |
| `NoExecute` | Also evicts pods already running there that do not tolerate it. |

A toleration names the taint it covers (`key`, `effect`) and how to compare it (`operator`):

| operator | Matches when | `value` |
| --- | --- | --- |
| `Exists` | the node has a taint with that key, whatever its value | leave it out |
| `Equal` (the default) | the key **and** the value are both the same | required |

A toleration is permission, not a command: it lets a pod onto a tainted node but does not send it there. To
send it, add a `nodeSelector` as well. In kind the control-plane node carries the taint
`node-role.kubernetes.io/control-plane:NoSchedule`, which is why your pods land on the workers. The hands-on
version, with the commands, is Part 4.4 of [01-kind-cluster-spin.md](01-kind-cluster-spin.md).


## Objects you will meet

| Object | What it is | Example |
| --- | --- | --- |
| Pod | One running copy of an app (one or more containers). The smallest unit. | `web-7d9f…-abcde` |
| Deployment | "Keep N identical pods of this image running." Replaces dead pods, handles updates. | `web` |
| ReplicaSet | What a Deployment uses internally to hold the N pods. You rarely touch it. | `web-7d9f…` |
| Service | A stable name and address in front of changing pods. | `web.web` |
| ClusterIP Service | The default: reachable only inside the cluster. | `web` |
| NodePort Service | Also opens a fixed port on every node, for access from outside. | `web-public` |
| ExternalName Service | Only a DNS nickname for another name; no pods behind it. | — |
| Secret | Passwords and keys handed to pods. | — |
| ConfigMap | Non-secret settings or files handed to pods. | — |
| Label | A key=value sticky note on any object; selectors use them to find objects. | `role=data` |
| Taint / toleration | A node "keep out" mark / a pod's "I'm allowed" pass. | control-plane |

## How a pod finds a node

You ask for a Deployment. The Deployment makes pods. The **scheduler** picks a worker for each pod, by free
resources and by your rules (`nodeSelector`, taints). The node's **container runtime** (containerd, inside
the kind node) pulls the image and starts it.

That last step is why local images need a bridge: containerd inside the node pulls from registries on the
network, not from your Mac's Docker image list. See Part 8 of the guide (`kind load` or a local registry).

## How pods find each other: Services and DNS

Pod IPs change every time a pod is replaced, so you never use them. A Service gives a stable name, and
cluster DNS resolves it:

| From | Name to use |
| --- | --- |
| a pod in the same namespace | `web` |
| a pod in any namespace | `web.web` (`<service>.<namespace>`) |
| fully written | `web.web.svc.cluster.local` |

## Getting to your apps from the Mac

| Method | How | Good for |
| --- | --- | --- |
| `kubectl port-forward` | A tunnel from a Mac port to one Service or pod, for as long as the command runs | quick look, no setup |
| NodePort + `extraPortMappings` | A fixed Mac port wired to a node port at cluster creation | always-on access |
| Ingress / Gateway | HTTP routing by host and path | later, when you want to practise it |

## Docker networks and `localhost`

Inside a container, `localhost` means **that container**. So the registry is `localhost:5001` from your Mac
but `kind-registry:5000` from a node. The `kind` Docker network is what lets the nodes reach containers you
attach to it, like the registry.

## What a local cluster does not prove

- One machine: no real network latency, no real node failures, no cloud load balancers or storage classes.
- Throwaway data: pod storage disappears with the pod unless you add a volume.
- Your CPU architecture applies: on Apple Silicon, nodes are arm64, and an image built only for amd64 may
  not run.
