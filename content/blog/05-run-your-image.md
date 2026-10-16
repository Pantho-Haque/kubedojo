---
title: "Run your own image in the cluster"
slug: run-your-image
order: 5
tags: [docker, images]
description: "Get an image you built into the cluster with kind load or a local registry, then update it."
date: 2026-10-14
source: 03-run-your-image.md
---

# 03 — Run your own image in the cluster

Get an image you built into the cluster and run it, then update it. Two ways: copy it straight into the nodes,
or push it to a small local registry. This assumes the cluster from
[01-kind-cluster-spin.md](01-kind-cluster-spin.md) is running and the namespace `web` exists. The k3d version
of the registry is in [02-k3d-cluster-spin.md](02-k3d-cluster-spin.md).

## Part 1 — Run your own image

**The problem.** An image you build with `docker build` lives in your local machine's Docker. The kind nodes
are separate containers with their own image store, and they pull images from registries on the network
(Docker Hub and the like). They cannot see your local machine's image list. So `kubectl create deployment
my-app --image=my-app:v1` fails with `ErrImagePull`: the node looks for `my-app:v1` on Docker Hub and finds
nothing. Two ways to bridge that.

### 1.1 The quick way: copy the image into the nodes

`kind load` copies an image from your local Docker straight into every node's image store, so no registry is
involved. This walkthrough builds a tiny image of your own, loads it, runs it and updates it.

**1. Make an image to work with.** A folder with a two-line Dockerfile: nginx with its home page replaced:

```bash
mkdir my-app
```

```bash
cat > my-app/Dockerfile <<'EOF'
FROM nginx:1.27
RUN echo '<h1>hello from my-app v1</h1>' > /usr/share/nginx/html/index.html
EOF
```

**2. Build it** with a specific tag. `-t my-app:v1` means name `my-app`, tag `v1`; the final `my-app` is the
folder holding the Dockerfile:

```bash
docker build -t my-app:v1 my-app
```

**3. Copy it into the cluster's nodes:**

```bash
kind load docker-image my-app:v1 --name local-cluster-1
```

**Check** that the nodes now have it:

```bash
docker exec local-cluster-1-worker crictl images | grep my-app
```

A line with `docker.io/library/my-app` and tag `v1`. (`crictl` is the node's own image tool; `kind load` put
the image on all three nodes, not just this one.)

**4. Run it:**

```bash
kubectl create deployment my-app --image=my-app:v1 -n web
```

```bash
kubectl rollout status deployment/my-app -n web
```

Kubernetes finds `my-app:v1` already on the node and does not try to download it. That is the default for any
tag except `latest`. For `latest` (or no tag), Kubernetes always tries to pull, which would fail here. This
is why the guide uses `v1`, not `latest`.

**5. See your page:**

```bash
kubectl port-forward deploy/my-app 8082:80 -n web
```

In another tab:

```bash
curl -s http://localhost:8082
```

`<h1>hello from my-app v1</h1>`. Stop the tunnel with `Ctrl-C`.

**6. Ship a change.** The node keeps the image it already has under a given tag, so re-loading the same tag
does not update running pods. Use a **new tag** each time: rebuild as `v2`, load it, point the Deployment at it:

```bash
sed -i '' 's/v1/v2/' my-app/Dockerfile
```

```bash
docker build -t my-app:v2 my-app
```

```bash
kind load docker-image my-app:v2 --name local-cluster-1
```

```bash
kubectl set image deployment/my-app my-app=my-app:v2 -n web
```

```bash
kubectl rollout status deployment/my-app -n web
```

`kubectl set image deployment/my-app my-app=my-app:v2` reads as: in Deployment `my-app`, set the container
named `my-app` to image `my-app:v2`. (`create deployment` names the container after the image, here `my-app`,
which happens to match the Deployment's name. If unsure, `kubectl get deploy my-app -n web -o wide` shows it
in the CONTAINERS column.) Kubernetes replaces the pods one at a time. Repeat the port-forward and `curl` to see
`v2`.

The `sed -i ''` form is the macOS one; on Linux use `sed -i` without the quotes.

**If the pod shows `ErrImagePull` or `ImagePullBackOff`:** the image was not loaded under that exact name and
tag, or the tag is `latest`. Re-run the check in step 3 and compare the name with `kubectl get deploy my-app
-n web -o jsonpath='{.spec.template.spec.containers[0].image}'`.



### 1.2 The proper way: a local registry

A registry is a small container that stores images, like a private Docker Hub on your local machine. Build
once, push, and every node pulls from it. Do this when you rebuild often or want to mimic a real setup.

**How it fits together.** The registry is a plain Docker container, not a Kubernetes object, so it is reached
through Docker's own networking. No NodePort is needed.

*Pushing the image (from your terminal):*

- `-p 127.0.0.1:5001:5000` publishes the container's port 5000 on your local machine's port 5001
  (loopback only, so nothing else on your network can reach it).
- Because of that, `docker push localhost:5001/my-app:v1` from your terminal reaches the registry.
- A NodePort only exposes a Kubernetes Service. This container is not one.

*Pulling from the cluster (from the nodes):*

- A node cannot use `localhost:5001`, because inside a node `localhost` is the node itself.
- That is why the registry is connected to kind's Docker network, so nodes can reach it by name:
  `kind-registry:5000`.
- Each node also gets a mirror file saying "`localhost:5001` means `http://kind-registry:5000`".
- So pods use the image name `localhost:5001/my-app:v1`, and the node quietly fetches it from
  `kind-registry:5000`.

```
docker push localhost:5001/my-app:v1
  → local machine, port 5001
  → registry container, port 5000                        (-p 127.0.0.1:5001:5000)

pod: image localhost:5001/my-app:v1
  → node asks "localhost:5001" → mirror file says use http://kind-registry:5000
  → registry container, over kind's Docker network       (docker network connect)
```

**Start the registry** on port 5001 (restarts with Docker):

```bash
docker run -d --restart=always -p 127.0.0.1:5001:5000 --network bridge --name kind-registry registry:2
```

**Put it on kind's network** so the nodes can reach it by name:

```bash
docker network connect kind kind-registry
```

**Teach every node that** `localhost:5001` **means the registry.** Inside a node, `localhost` is the node itself,
so each node needs a small mirror file. This loop does all three nodes:

```bash
for node in $(kind get nodes --name local-cluster-1); do
  docker exec "$node" mkdir -p /etc/containerd/certs.d/localhost:5001
  printf '[host."http://kind-registry:5000"]\n' | docker exec -i "$node" cp /dev/stdin /etc/containerd/certs.d/localhost:5001/hosts.toml
done
```

**What the loop does, line by line**

```bash
for node in $(kind get nodes --name local-cluster-1); do
```

`kind get nodes` prints the three node container names. The loop runs everything up to `done` once per name,
with the current name in `$node`.

```bash
  docker exec "$node" mkdir -p /etc/containerd/certs.d/localhost:5001
```

`docker exec "$node" <command>` runs a command inside that node's container. Here it makes a folder named
after the registry address, `localhost:5001`, under `/etc/containerd/certs.d`. That is the folder containerd
(the node's container runtime) reads for per-registry settings when it pulls from `localhost:5001`. `-p`
means no error if the folder already exists.

```bash
  printf '[host."http://kind-registry:5000"]\n' | docker exec -i "$node" cp /dev/stdin /etc/containerd/certs.d/localhost:5001/hosts.toml
```

Three parts joined by `|`:

- `printf '[host."http://kind-registry:5000"]\n'` prints one line of text. It is the whole content of the
  file.
- `docker exec -i "$node" cp /dev/stdin <file>` runs `cp` inside the node. `-i` keeps stdin open, so the
  printed line flows in through the pipe, and `cp /dev/stdin <file>` writes it to the file. (This is the
  trick for writing a file into a container without an editor or a shell redirect.)
- The file is `hosts.toml`, in the folder from the previous line.

```bash
done
```

Ends the loop.

**The file it creates** has one line, `[host."http://kind-registry:5000"]`. Read it as: "for images from
`localhost:5001`, connect to the host `http://kind-registry:5000`". It uses plain `http`, so no certificate
setup is needed. Every node needs its own copy, which is why the loop runs three times.

This requires containerd to read that folder. If your kind version does not enable it by default, add this
to `kind-config.yaml` **before** creating the cluster (the cluster must be re-created):

```yaml
containerdConfigPatches:
  - |-
    [plugins."io.containerd.grpc.v1.cri".registry]
      config_path = "/etc/containerd/certs.d"
```

**Prove it:** push an image and run it from the registry.

```bash
docker pull busybox:1.36
```

```bash
docker tag busybox:1.36 localhost:5001/busybox:1.36
```

```bash
docker push localhost:5001/busybox:1.36
```

```bash
kubectl run regcheck -n web --rm -i --restart=Never --image=localhost:5001/busybox:1.36 -- echo it-works
```

Prints `it-works`. From now on, `docker build -t localhost:5001/my-app:v1 .` and `docker push localhost:5001/my-app:v1` is the whole loop, and your manifests use `image: localhost:5001/my-app:v1`.

---



## Part 2 — Habits and gotchas worth knowing

- **Never use the** `latest` **tag for local images.** Kubernetes then always tries to pull, and fails for an
image that exists only on your Mac (`ErrImagePull`). A specific tag plus `IfNotPresent`, or a registry,
avoids it.
- **Describe before guessing.** `kubectl describe pod <name> -n <ns>` ends with an *Events* list that says
what went wrong (image not found, no node fits, probe failing).
- **A Service is not a pod.** `port-forward` to a Service needs a Service that has pods behind it. A Service
of type `ExternalName` is only a nickname for another DNS name and cannot be forwarded.
- **Data is disposable.** Pod storage vanishes with the pod unless you add a volume. Fine for a lab.
- **The cluster survives a Mac restart** once Docker Desktop is back. If kubectl cannot connect, start the node
containers again: see Part 2 of [06-clean-up.md](06-clean-up.md).

---

## Where next

- Deploy more apps and place them on nodes: [04-deployment.md](04-deployment.md)
- Stop or remove it all: [06-clean-up.md](06-clean-up.md)
