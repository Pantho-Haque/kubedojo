---
id: h2-migrate
title: Move to Helm 3 with helm-2to3
emoji: 🚚
stage: 2
quiz:
  - q: What does helm 2to3 convert pizza do?
    options:
      - Rewrites the chart’s templates
      - Copies the release’s Helm 2 history into Helm 3’s format, so Helm 3 can manage it
      - Deletes the running Pods and reinstalls them
    answer: 1
    why: The app keeps running. Only Helm’s record of the release moves.
  - q: When should you run helm 2to3 cleanup?
    options:
      - First, before anything else
      - Last, after every release is converted and checked with Helm 3
      - Never
    answer: 1
    why: Cleanup removes Tiller and the Helm 2 data. Do it only when nothing needs Helm 2 any more.
---

<div class="box idea"><div class="tag">The big idea</div>Moving to Helm 3 does not touch your running apps. The <b>helm-2to3</b> plugin copies Helm 2’s settings and each release’s history into Helm 3’s format. Then Helm 3 manages them, and Tiller can go.</div>

```bash
helm plugin install https://github.com/helm/helm-2to3
helm 2to3 move config
helm 2to3 convert pizza --dry-run
helm 2to3 convert pizza
helm ls -A
helm 2to3 cleanup
```

1. **move config** copies repositories and plugins from Helm 2’s home to Helm 3’s.
2. **convert** moves one release at a time; try `--dry-run` first. Afterwards `helm ls -A` (Helm 3) shows it.
3. **cleanup** removes Tiller and the Helm 2 data. Run it last, once every release is converted.

<div class="box warnbox">Charts with <code>apiVersion: v2</code> are Helm 3 only. Helm 3 still installs older <code>apiVersion: v1</code> charts, and moves their <code>requirements.yaml</code> dependencies into <code>Chart.yaml</code> when you update them.</div>

<div class="box keep"><div class="tag">Remember</div><ul><li>move config → convert each release → check → cleanup.</li><li>Converting does not restart your app.</li><li>Clean up last.</li></ul></div>
