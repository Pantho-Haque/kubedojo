---
title: "Deploy apps into your namespaces, one at a time"
slug: deploy-apps
order: 6
tags: [kubectl, namespaces]
description: "Run an app in each namespace, place pods on chosen nodes, and reach what you deployed."
date: 2026-10-14
source: 04-deployment.md
---

# 04 — Deploy apps into your namespaces, one at a time

Run an app in each namespace, place pods on chosen nodes, and use what you deployed. This assumes the cluster
from [01-kind-cluster-spin.md](01-kind-cluster-spin.md) (or [02-k3d-cluster-spin.md](02-k3d-cluster-spin.md))
is running, `kubectl config current-context` shows it, and the namespaces `web`, `cache` and `db` exist.
The commands are the same on kind and k3d, except where a note says otherwise.

## Part 1 — Deploy, one app at a time

Each app below goes into its own namespace. A **Deployment** is the standard way to run an app: you say
"keep N copies of this image running", and Kubernetes creates the pods and replaces any that die.

### 1.1 `web` — nginx, two copies, in namespace `web`

```bash
kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web
```

- `deployment web` — the Deployment's name (its pods are named `web-<hash>-<hash>`).
- `--image=nginx:1.27` — what to run. Always pin a version rather than `latest`; [03-run-your-image.md](03-run-your-image.md) shows why.
- `--replicas=2` — two pods.
- `-n web` — in the `web` namespace.

Wait for it:

```bash
kubectl rollout status deployment/web -n web
```

Prints `successfully rolled out`. Now see where the scheduler put the pods:

```bash
kubectl get pods -n web -o wide
```

The `NODE` column shows each pod's node. With no instructions the scheduler spreads them over the workers.

Give the pods a stable name inside the cluster with a **Service**:

```bash
kubectl expose deployment web --port=80 -n web
```

```bash
kubectl get service -n web
```

`web` with a `CLUSTER-IP`. Other pods can now reach nginx at `web` (same namespace) or `web.web`
(`<service>.<namespace>`, from any namespace).

### 1.2 `cache` — Redis, in namespace `cache`

```bash
kubectl create deployment cache --image=redis:7-alpine -n cache
```

```bash
kubectl rollout status deployment/cache -n cache
```

```bash
kubectl expose deployment cache --port=6379 -n cache
```

Prove it works by running a command inside the pod:

```bash
kubectl exec -n cache deploy/cache -- redis-cli ping
```

Prints `PONG`.

### 1.3 `db` — Postgres, pinned to the `data` node

This one is placed deliberately. A YAML manifest lets you say more than the one-line `create` can. The
`nodeSelector` below means "only on a node labelled `role=data`" (Part 4.3 of [01-kind-cluster-spin.md](01-kind-cluster-spin.md) labelled `worker2` that way):

```bash
kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: db
  namespace: db
spec:
  replicas: 1
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      nodeSelector:
        role: data
      containers:
        - name: postgres
          image: postgres:16-alpine
          env:
            - name: POSTGRES_PASSWORD
              value: local-only
          ports:
            - containerPort: 5432
EOF
```

- `kubectl apply -f -` — create or update whatever the YAML describes; `-` means "read it from the lines
that follow".
- `selector.matchLabels` / `template.metadata.labels` — how the Deployment recognises its own pods. The two
must match.
- `nodeSelector` — the placement rule.
- `env` — a throwaway password. Real secrets belong in a Kubernetes Secret, not in YAML you commit.

```bash
kubectl rollout status deployment/db -n db
```

```bash
kubectl expose deployment db --port=5432 -n db
```

```bash
kubectl exec -n db deploy/db -- psql -U postgres -c 'select version()'
```

Prints the Postgres version.

### 1.4 A single bare pod

A Deployment is for apps that must stay up. For a quick one-off, run a plain pod:

```bash
kubectl run toolbox --image=busybox:1.36 -n web --restart=Never --command -- sleep 3600
```

`--restart=Never` makes it a plain pod: if it dies, nothing recreates it. `sleep 3600` keeps it alive for an
hour so you can work inside it.

### 1.5 Pin a pod to a specific node by name

Besides labels, every node has a built-in `kubernetes.io/hostname` label:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: pinned
  namespace: web
spec:
  nodeSelector:
    kubernetes.io/hostname: local-cluster-1-worker
  containers:
    - name: nginx
      image: nginx:1.27
EOF
```



### 1.6 See everything

```bash
kubectl get pods -A -o wide
```

`-A` means all namespaces. Find your pods and their `NODE`:

- `web-…` ×2 (spread over both workers), plus `toolbox` and `pinned` (`pinned` on `local-cluster-1-worker`)
- `cache-…` on a worker
- `db-…` on `local-cluster-1-worker2`, because of `role=data`

Or just one folder at a time:

```bash
kubectl get all -n web
```

**Check:** every pod is `Running` and `READY` shows `1/1` (give the first image pulls a minute).

---



## Part 2 — Use what you deployed

**2.1 Open nginx from your Mac with a port-forward.** This tunnels a Mac port to a Service. It stays in the
foreground, so use a second terminal tab for the `curl`:

```bash
kubectl port-forward svc/web 8081:80 -n web
```

In the other tab:

```bash
curl -s http://localhost:8081 | head -5
```

The start of the nginx welcome page. Stop the tunnel with `Ctrl-C`.

**2.2 Reach one namespace from another.** Run a short-lived pod in `cache` that fetches the page from the
`web` Service:

```bash
kubectl run dns-test -n cache --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- http://web.web
```

In one sentence: it starts a temporary pod in `cache`, uses it to fetch a page from the `web` Service in another
namespace, prints the result, and deletes the pod.

| Part | Meaning |
| --- | --- |
| `kubectl run dns-test` | Create a single pod named `dns-test` |
| `-n cache` | Put it in the `cache` namespace, so the request comes from there |
| `--image=busybox:1.36` | The container image: a tiny Linux toolbox that includes `wget` |
| `--restart=Never` | A plain one-off pod: run once, do not restart when it finishes |
| `--rm` | Delete the pod when the command ends |
| `-i` | Keep stdin attached and wait for the command, so its output shows in your terminal |
| `--` | Everything after this is the command to run inside the pod, not options for kubectl |
| `wget -qO- http://web.web` | The command the pod runs |

The command inside the pod:

- `wget` downloads a URL.
- `-q` is quiet (no progress output).
- `-O-` writes the page to standard output instead of a file, so it appears on your screen.
- `http://web.web` is `<service>.<namespace>`: the Service `web` in the namespace `web`.

**What it proves.** The pod is in `cache` but reaches a Service in `web`. Cluster DNS turns `web.web` into the
Service's address, so a pod in one namespace can call a Service in another. The output is the nginx welcome
page HTML. Run from inside the `web` namespace, plain `web` would work too, because the namespace part
defaults to the pod's own.

A warning "couldn't attach to pod" is harmless: the pod finished before kubectl attached.

**2.3 Reach a Service without port-forward (NodePort).** This reaches `web` from your local machine at
`localhost:8080`, with no command left running.

**The problem.** A normal Service (ClusterIP) is reachable only from inside the cluster, and kind's nodes are
Docker containers, so their ports are not open on your local machine either. A request has to cross two
boundaries:

1. **Local machine to node container.** This is what `extraPortMappings` in Part 2.1 of [01-kind-cluster-spin.md](01-kind-cluster-spin.md) set up: local port
   `8080` goes to port `30080` on the control-plane container.
2. **Node to pod.** This is what a `NodePort` Service sets up: port `30080` on every node forwards to the
   Service's pods.

Create the Service:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: web-public
  namespace: web
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
EOF
```

```bash
curl -s http://localhost:8080 | head -5
```

The nginx page again, no tunnel running.

**The YAML, field by field**

| Field | Meaning |
| --- | --- |
| `name: web-public`, `namespace: web` | A second Service next to the existing `web` one, in the same namespace as the pods |
| `type: NodePort` | In addition to a normal cluster address, open a fixed port on every node |
| `selector: app: web` | Send traffic to pods labelled `app=web`; `kubectl create deployment web` labelled its pods that way |
| `port: 80` | The Service's own port, used inside the cluster |
| `targetPort: 80` | The port the nginx container listens on |
| `nodePort: 30080` | The port opened on each node. It must match the `containerPort: 30080` in `kind-config.yaml` and be in the range 30000–32767 |

**The path a request takes**

```
curl localhost:8080
  → local machine, port 8080
  → control-plane container, port 30080     (extraPortMappings)
  → Service web-public                      (NodePort)
  → one of the web pods, port 80
```

**Why it works through the control-plane node.** The `extraPortMappings` entry is on the control-plane node,
but the pods run on the workers. This still works because kube-proxy opens the node port on **every** node,
not only the ones running the pods. Traffic arriving at the control-plane's port `30080` is forwarded across
the cluster to a `web` pod on whichever worker has one.

**Compared with `port-forward` (2.1)**

| | `kubectl port-forward` | NodePort + `extraPortMappings` |
| --- | --- | --- |
| Needs a command left running | yes | no |
| Set up when | any time | the port mapping must exist when the cluster is created |
| Spreads traffic over pods | no, it picks one pod | yes, across all of them |

**If it does not answer:** check that the cluster was created with the `extraPortMappings` block, that
`kubectl get svc -n web` shows `30080` for `web-public`, and that `kubectl get endpoints web-public -n web`
lists pod IPs (an empty list means the selector matches nothing).

**2.4 Logs and a shell:**

```bash
kubectl logs deploy/web -n web --tail=5
```

```bash
kubectl exec -it toolbox -n web -- sh
```

A shell inside the `toolbox` pod (`exit` to leave).

**2.5 Watch Kubernetes heal itself.** In one tab:

```bash
kubectl get pods -n web -w
```

In another, delete one of the `web` pods (copy a real name from the list):

```bash
kubectl delete pod <web-pod-name> -n web
```

The Deployment immediately starts a replacement. The bare pods `toolbox` and `pinned` would not come back.
`Ctrl-C` ends the watch.

**2.6 Scale up and down:**

```bash
kubectl scale deployment web --replicas=4 -n web
```

```bash
kubectl scale deployment web --replicas=2 -n web
```

---

## Where next

- Run an image you built yourself: [03-run-your-image.md](03-run-your-image.md)
- Stop or remove it all: [06-clean-up.md](06-clean-up.md)
