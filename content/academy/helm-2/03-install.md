---
id: h2-install
title: Install a release with --name
emoji: 📦
stage: 1
practice:
  kind: helm2
  mission: tiller
quiz:
  - q: You run helm2 install ./pizza-chart without --name. What happens?
    options:
      - It fails
      - Tiller invents a release name, such as wandering-otter
      - The release is called pizza-chart
    answer: 1
    why: In Helm 2 the name is optional and random by default. Helm 3 made it required.
  - q: Which command lists the releases Tiller knows about?
    options:
      - helm2 ls
      - kubectl get releases
      - helm2 search
    answer: 0
    why: helm2 ls (or helm2 list) asks Tiller for its releases.
---

<div class="box idea"><div class="tag">The big idea</div>In Helm 2 the release name is a flag: <code>helm2 install ./pizza-chart --name pizza</code>. Leave it out and Tiller makes one up, which is hard to find again. Always name your releases.</div>

## Install, wait, and look

```bash
helm2 install ./pizza-chart --name pizza --namespace helm-practice --wait --timeout 120
helm2 ls
helm2 status pizza
```

- `--wait` keeps the command running until the Pods are ready, like in Helm 3.
- `--timeout` is a number of **seconds** in Helm 2 (Helm 3 uses durations such as `2m`).
- `helm2 ls` shows the release as **DEPLOYED**, in capital letters.

## Try it before using a terminal

Install Tiller first, then the release, and use **Next step** to follow the handoff from Tiller to Kubernetes.

<div data-helm-sim></div>

<div class="box keep"><div class="tag">Remember</div><ul><li>Name every release with --name.</li><li>--timeout counts seconds in Helm 2.</li><li>helm2 ls asks Tiller what is installed.</li></ul></div>
