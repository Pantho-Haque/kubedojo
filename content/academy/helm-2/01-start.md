---
id: h2-start
title: 'Start here: your Helm 2 path'
emoji: 🧭
stage: 0
quiz:
  - q: Why learn Helm 2 at all?
    options:
      - It is the newest Helm
      - Older clusters and charts still use it, and the KubeDojo playground runs it
      - Helm 3 cannot install charts
    answer: 1
    why: Helm 2 stopped getting updates in November 2020, but plenty of clusters, scripts, and charts still expect it.
  - q: What is the biggest difference between Helm 2 and Helm 3?
    options:
      - Helm 2 needs Tiller, a server running inside the cluster
      - Helm 2 has no charts
      - Helm 3 needs Tiller
    answer: 0
    why: Helm 3 removed Tiller. Everything else (charts, values, releases) carries over.
---

<p class="lead">You already know what Helm does if you took the Helm 3 course: a <b>chart</b> plus <b>values</b> becomes a <b>release</b>. Helm 2 does the same job with one extra moving part, and that part changes how you install, how you clean up, and how you stay safe.</p>

<div class="box idea"><div class="tag">The big idea</div>Helm 2 is two programs. The <b>helm2</b> client on your computer, and <b>Tiller</b>, a server that runs inside the cluster. The client sends charts to Tiller; Tiller talks to Kubernetes and remembers every release.</div>

## Why Helm 2 still matters

Helm 2 reached the end of its support in November 2020. You will still meet it:

- in older clusters whose upgrade never happened,
- in scripts and CI jobs written before Helm 3,
- and in the **KubeDojo playground**, which simulates Helm 2 with Tiller (its guide section *9 · Helm 2 + Tiller*).

On a machine that has both versions, Helm 2 is usually installed as **`helm2`** and Helm 3 as **`helm`**. This course follows that habit, like the playground does.

## What you will be able to do

1. Install Tiller and check that both halves match.
2. Install a release with `--name`, then upgrade it, break it, and roll it back.
3. Delete a release, and understand why `--purge` matters.
4. Explain why Tiller was a security risk, and move releases to Helm 3.

<div class="box keep"><div class="tag">Remember</div><ul><li>Helm 2 = the helm2 client + Tiller in the cluster.</li><li>Charts, values, and releases mean the same as in Helm 3.</li><li>Use <b>Simulate</b> any time to practise without a cluster.</li></ul></div>
