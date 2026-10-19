---
id: rollout
title: Updates with no downtime (and undo!)
emoji: "\U0001F680"
stage: 3
format: html
quiz:
  - q: 'During a rolling update, the new pods crash. What happens to the old ones?'
    options:
      - 'They were already deleted, so you''re down'
      - They keep running and serving; the rollout stalls
      - They crash too
    answer: 1
    why: >-
      In this practice, maxUnavailable is 0 and maxSurge is 1, so old copies
      stay available until their replacements are ready. Other rollout settings
      behave differently.
  - q: Which command goes back to the previous version?
    options:
      - kubectl rollout undo deployment/pizza
      - kubectl delete cluster
      - git revert
    answer: 0
    why: Kubernetes keeps old ReplicaSets around for exactly this.
  - q: >-
      What makes K8s wait until a new pod is truly ready before removing an old
      one?
    options:
      - The readiness probe
      - The Service type
      - The namespace
    answer: 0
    why: >-
      Without a readiness probe, a running container is usually treated as ready
      even if the app still needs time to prepare.
practice:
  kind: k8s
  config:
    nodes: 3
    replicas: 3
    service: true
    auto: true
    actions:
      - traffic
      - update
    challenge:
      text: >-
        Ship a good release AND recover from a broken one with rollback, with 0
        failed requests.
      check: rollout
setup:
  - 'kubectl create deployment pizza --image=pizza:v1 --replicas=3'
---
<div class="box story"><div class="tag">The problem</div>The old way to update: stop v1, start v2, and hope. Customers get errors in between, and if v2 is broken, everything is down.</div>
<div class="box idea"><div class="tag">The big idea</div>Change the image in your Deployment and Kubernetes does a <b>rolling update</b>: start one new pod, wait until it's Ready, remove one old pod, repeat. This practice keeps all desired copies available and allows one extra copy. With readiness checks, spare capacity, and an app that shuts down cleanly, this can avoid downtime. If new pods never become Ready in this model, the rollout stalls while the old pods keep serving. Then you roll back with one command.</div>
<h2>🎮 Try it</h2><p>Choose <b>Release a good version</b> and wait for version 2. Requests start automatically. Next release a broken version, wait for a red pod, and choose <b>Undo release</b>.</p><div data-sim></div>
<div class="cmd"><pre tabindex="0">kubectl set image deployment/pizza pizza=pizza:v2   # ship it
kubectl rollout status deployment/pizza              # watch it roll
kubectl rollout history deployment/pizza
kubectl rollout undo deployment/pizza                # go back to the previous version</pre><button class="copy">Copy</button></div>
<p>The readiness probe from the last lesson is what makes this safe. Without one, Kubernetes thinks a pod is ready the moment it starts.</p>
<p style="font-size:15px;color:var(--mut)">Other strategies exist: <b>Recreate</b> (stop everything, then start, for apps that can't run two versions at once), <b>blue/green</b> (switch all traffic at once) and <b>canary</b> (send 5% to the new version first). The rolling update is the default and usually enough.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>Changing the image triggers a rolling update: new up, old down, one at a time.</li><li>A broken release stalls instead of taking you down.</li><li><code>kubectl rollout undo</code> is your undo button.</li></ul></div>
