---
id: d-model
title: 'Image, container, and Docker Engine'
emoji: "\U0001F4E6"
stage: 0
format: html
quiz:
  - q: >-
      Two containers use one image. Do they share all writable files
      automatically?
    options:
      - 'Yes'
      - 'No'
    answer: 1
    why: Each has its own writable layer unless you explicitly share storage.
  - q: Where do Linux containers run on a typical Mac Docker Desktop setup?
    options:
      - Directly on the macOS kernel
      - Inside a Linux VM
    answer: 1
    why: >-
      This explains some networking and filesystem differences from native
      Linux.
---
<div class="box story"><div class="tag">The problem</div>Your app works on your laptop but fails on another computer because the files, libraries, or setup differ.</div>
<div class="box idea"><div class="tag">The big idea</div>An image bundles the app and its userspace dependencies. Docker Engine creates containers from images. Containers isolate processes and share the host kernel; they are not each a full virtual machine.</div>
<div class="flow"><span>Dockerfile</span>→<span>Build an image</span>→<span>Run containers</span></div>
<p>The <b>Docker CLI</b> sends requests to the <b>daemon/Engine</b>. A <b>registry</b> stores images for sharing. On a Mac, Linux containers normally run inside a Linux VM managed by Docker Desktop or another compatible runtime.</p>
<details class="file"><summary>Common traps and useful edge cases</summary><p>A container still needs compatible OS and CPU support. Docker context selects an Engine; it may be remote. Bind-mount paths refer to the daemon’s host, not necessarily your laptop.</p></details>
<div class="box keep"><div class="tag">Remember</div><ul><li>Image = packaged filesystem and defaults. Container = an instance with its own writable layer.</li><li>Building, pulling, and running are separate actions.</li></ul></div>
