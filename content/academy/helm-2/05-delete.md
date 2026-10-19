---
id: h2-delete
title: Delete, and purge the history
emoji: 🧹
stage: 1
quiz:
  - q: You ran helm2 delete pizza and now helm2 install --name pizza fails with “cannot re-use a name”. Why?
    options:
      - Tiller still keeps the deleted release’s history, so the name is taken
      - The Pods are still running
      - Release names can only be used once per cluster, forever
    answer: 0
    why: helm2 delete keeps the history. helm2 delete --purge removes it and frees the name.
  - q: Which command shows releases that were deleted but not purged?
    options:
      - helm2 ls --deleted
      - kubectl get deleted
      - helm2 history --all
    answer: 0
    why: Deleted releases are hidden from a plain helm2 ls.
---

<div class="box idea"><div class="tag">The big idea</div><code>helm2 delete pizza</code> removes the app’s Kubernetes objects but <b>keeps the release history</b> in Tiller. The name stays taken, and you could even roll the deleted release back. <code>helm2 delete --purge pizza</code> removes the history too. Helm 3’s <code>uninstall</code> behaves like <code>--purge</code> by default.</div>

```bash
helm2 delete pizza
helm2 ls --deleted
helm2 delete --purge pizza
```

<div class="box warnbox">Purging is final: the history and the ability to roll back are gone. Charts can also leave things behind on purpose, such as PersistentVolumeClaims. Check with <code>kubectl get pvc -n helm-practice</code>.</div>

<div class="box keep"><div class="tag">Remember</div><ul><li>delete keeps history; delete --purge frees the name.</li><li>helm2 ls --deleted shows what is still remembered.</li><li>Helm 3 uninstall purges by default.</li></ul></div>
