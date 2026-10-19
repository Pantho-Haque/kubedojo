---
id: ci-tags
title: Image tags you can trust
emoji: "\U0001F3F7️"
stage: 1
format: html
quiz:
  - q: Why is <code>latest</code> risky in production?
    options:
      - It can point to a different image tomorrow
      - It is slower to download
    answer: 0
    why: Mutable tags make deploys unrepeatable and rollbacks unclear.
  - q: What does tagging with the commit SHA give you?
    options:
      - A direct link from the running image to the exact code
      - Smaller images
    answer: 0
    why: You can always answer “which code is running?”.
---
<div class="box story"><div class="tag">The problem</div>Production runs <code>pizza:latest</code>. A pod restarts on a new node and downloads <code>latest</code> again, but someone pushed a different image under that name an hour ago. Now two pods run two different versions, and nobody can tell which.</div>
<div class="box idea"><div class="tag">The big idea</div>Tag every image with the commit SHA that built it. A tag like pizza:3f9c2a1 always means exactly one build of exactly one commit, so you can trace, repeat, and roll back any deploy.</div>
<table><tr><th>Tag style</th><th>Good for</th><th>Problem</th></tr>
<tr><td><code>latest</code></td><td>Quick local tests</td><td>Changes under your feet; impossible to roll back to</td></tr>
<tr><td><code>v1.4.2</code></td><td>Human-friendly releases</td><td>Can be overwritten unless your registry blocks it</td></tr>
<tr><td><code>3f9c2a1…</code> (commit SHA)</td><td>Automatic pipelines</td><td>Not pretty, but always unique and traceable</td></tr></table>
<p>The course pipeline pushes to <b>GitHub Container Registry</b> (<code>ghcr.io/owner/repo:SHA</code>) using the workflow’s automatic token, so no password is stored anywhere.</p>
<details class="file"><summary>Even stronger: digests</summary><p>A digest like <code>pizza@sha256:ab12…</code> is a fingerprint of the image content itself and can never point to anything else. Some teams deploy by digest for the strongest guarantee.</p></details>
<div class="box keep"><div class="tag">Remember</div><ul><li>Never deploy latest.</li><li>Tag images with the commit SHA so every deploy is traceable.</li><li>Digests are fingerprints that can never change.</li></ul></div>
