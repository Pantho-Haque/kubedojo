---
id: storage
title: Storage that survives
emoji: "\U0001F4BE"
stage: 2
format: html
quiz:
  - q: >-
      A pod with no volume writes a file, then restarts. Is the file still
      there?
    options:
      - 'Yes'
      - 'No, container filesystems are temporary'
    answer: 1
    why: That's why PVCs exist.
  - q: What do you write to ask for storage?
    options:
      - PersistentVolumeClaim
      - StorageClass
      - ConfigMap
    answer: 0
    why: A claim is a request. The cluster fulfils it.
  - q: You need one log-collector pod on EVERY node.
    options:
      - Deployment
      - DaemonSet
      - Job
    answer: 1
    why: 'DaemonSet = one per node, automatically, including nodes added later.'
  - q: A backup script that runs every night?
    options:
      - CronJob
      - StatefulSet
      - Service
    answer: 0
    why: 'Like cron on Linux, but in the cluster.'
---
<div class="box story"><div class="tag">The problem</div>You run a database in a pod. It restarts… and every order is gone. A container's filesystem is temporary: it's thrown away with the container.</div>
<div class="box idea"><div class="tag">The big idea</div>For data that must survive, ask for a <b>PersistentVolumeClaim (PVC)</b>: “I need 5 GB of disk.” With a suitable storage provider configured, the cluster finds or creates storage (a <b>PersistentVolume</b>) and attaches it to your pod. If the pod dies, the disk stays, and the new pod gets the same disk.</div>
<div class="box like"><div class="tag">Think of it like…</div>A hotel 🏨. Pods are guests who check in and out. A PVC is a locker reservation: whoever holds it gets the same locker, with your things still inside.</div>
<table><tr><th>Term</th><th>What it is</th><th>Who makes it</th></tr>
<tr><td><b>PVC</b></td><td>the request: “I need 5Gi”</td><td>you</td></tr>
<tr><td><b>PV</b></td><td>the actual disk</td><td>usually created automatically</td></tr>
<tr><td><b>StorageClass</b></td><td>the kind of disk, and who provides it (cloud SSD, local disk…)</td><td>the cluster admin (k3s ships one called <code>local-path</code>)</td></tr></table>
<details class="file"><summary>📄 pvc.yaml + attaching it in a pod</summary><pre tabindex="0">apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pizza-data
spec:
  accessModes: ["ReadWriteOnce"]   # one node at a time
  resources:
    requests:
      storage: 5Gi
---
# in the pod spec:
      containers:
      - name: db
        image: postgres:17
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: pizza-data</pre></details>
<p><b>A volume is not a backup.</b> The local-path storage in our home lab lives on one machine. If that machine is lost, the data does not magically move to another one. Use suitable shared or replicated storage and separate backups when you need that protection.</p><h2>Other kinds of workloads</h2>
<table><tr><th>Kind</th><th>Use it when</th></tr>
<tr><td><b>Deployment</b></td><td>stateless apps: web servers, APIs (most things)</td></tr>
<tr><td><b>StatefulSet</b></td><td>databases: each replica gets a stable name (db-0, db-1) and its own disk</td></tr>
<tr><td><b>DaemonSet</b></td><td>exactly one pod on every node: log collectors, monitoring agents</td></tr>
<tr><td><b>Job / CronJob</b></td><td>run something until it finishes, once or on a schedule (backups, reports)</td></tr></table>
<p>Honest advice: for important production data, a managed database outside the cluster is often the calmer choice while you're learning.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>A container's filesystem is temporary. Use a PVC for anything you want to keep.</li><li>Deployment for stateless apps, StatefulSet for databases, DaemonSet for one-per-node, CronJob for scheduled tasks.</li></ul></div>
