---
id: h2-upgrade
title: Upgrade, break, and roll back
emoji: 🔁
stage: 1
practice:
  kind: helm2
  mission: release
quiz:
  - q: An upgrade used an image that does not exist. The old Pods keep serving. What does helm2 history pizza show for the new revision?
    options:
      - DEPLOYED
      - FAILED
      - Nothing; failed upgrades are not recorded
    answer: 1
    why: Tiller records the failed revision. That history is what lets you roll back with confidence.
  - q: After helm2 rollback pizza 2, which revision number does the release have?
    options:
      - 2
      - A new, higher number that reuses revision 2’s settings
      - 1
    answer: 1
    why: A rollback is a new revision. History only ever grows.
---

<div class="box story"><div class="tag">The problem</div>You upgrade to three copies of a new version. Then someone ships an image tag that does not exist. The app must keep serving while you put it back.</div>

```bash
helm2 upgrade pizza ./pizza-chart --set replicaCount=3 --set image.tag=1.28 --wait --timeout 120
helm2 upgrade pizza ./pizza-chart --set replicaCount=3 --set image.tag=does-not-exist --wait --timeout 120
helm2 history pizza
helm2 rollback pizza 2 --wait
```

<div class="box idea"><div class="tag">The big idea</div>Tiller keeps every revision. <code>helm2 history</code> shows them; <code>helm2 rollback NAME REVISION</code> reapplies an old one as a new revision. When you pass <code>--set</code> or <code>-f</code>, <b>helm2 upgrade starts again from the chart’s defaults plus what you passed</b>, so earlier settings you did not repeat are dropped. Add <code>--reuse-values</code> to keep them.</div>

## Practise it

Install, upgrade to three copies, try the missing image, then roll back to the revision that worked.

<div data-helm-sim></div>

<div class="box keep"><div class="tag">Remember</div><ul><li>Failed revisions are recorded, and the old Pods can keep serving.</li><li>rollback creates a new revision.</li><li>Use --reuse-values when you mean “change only this”.</li></ul></div>
