---
id: d-storage
title: 'Writable layers, volumes, and bind mounts'
emoji: "\U0001F4BE"
stage: 2
format: html
quiz:
  - q: >-
      You remove a container using a named volume. Is that volume automatically
      erased?
    options:
      - 'Yes'
      - Normally no
    answer: 1
    why: >-
      Volume deletion is separate; Compose down -v can remove its project
      volumes.
practice:
  kind: docker
  mission: storage
---
<table><tr><th>Storage</th><th>Use it for</th><th>Lifetime</th></tr><tr><td>Writable container layer</td><td>Disposable files</td><td>Until that container is removed</td></tr><tr><td>Named volume</td><td>App/database data managed by Docker</td><td>Until explicitly removed</td></tr><tr><td>Bind mount</td><td>A chosen host path, often source code</td><td>The host path has its own lifetime</td></tr><tr><td>tmpfs</td><td>Temporary memory-backed files</td><td>Not persistent after the container stops</td></tr></table>
<h2>Practice safely in the browser</h2><div data-docker-sim></div>
<details class="file"><summary>Common traps and useful edge cases</summary><ul><li>A mount hides files already present at its target path; they may not be gone from the image.</li><li>Linux permissions use numeric UIDs/GIDs. A non-root container may not be allowed to write a host directory.</li><li>Use read-only bind mounts when writing is unnecessary. Mounting a host directory can let the container modify host files.</li><li>A named volume is not a backup and does not automatically replicate to another machine.</li><li>A new empty volume can receive existing image contents at the mount target; an existing volume keeps its old contents.</li></ul></details>
