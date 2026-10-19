---
id: d-cache
title: 'Build cache: what must run again?'
emoji: ⚡
stage: 1
format: html
quiz:
  - q: 'Source changes, dependency file stays the same. A well-ordered build can…'
    options:
      - Reuse dependency installation
      - Skip copying the changed source
    answer: 0
    why: Copying source after installing dependencies limits needless rebuilds.
practice:
  kind: docker
  mission: build
---
<div class="box idea"><div class="tag">The big idea</div>Docker can reuse unchanged build steps. Put slow dependency installation before frequently changing source files, when your project allows it.</div>
<details class="file"><summary>📄 Example for a Python app with dependencies</summary><pre tabindex="0">COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .</pre></details>
<h2>Practice safely in the browser</h2><div data-docker-sim></div>
<details class="file"><summary>Common traps and useful edge cases</summary><ul><li>Changing an earlier step invalidates dependent later steps in that stage.</li><li><code>--no-cache</code> rebuilds steps; use <code>--pull</code> when you also want a refreshed base tag.</li><li>A remote package repository changing does not itself change the text of a cached RUN step. Pin dependencies and rebuild deliberately.</li><li>BuildKit cache mounts speed downloads without making the cache part of the final image. Cache is disposable, not a backup.</li></ul></details>
