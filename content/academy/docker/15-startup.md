---
id: d-startup
title: Started is not ready
emoji: ⏳
stage: 3
format: html
quiz:
  - q: Short-form depends_on alone guarantees a database can answer queries?
    options:
      - 'Yes'
      - 'No'
    answer: 1
    why: >-
      Started does not necessarily mean ready; use a suitable health check and
      resilient app behavior.
practice:
  kind: docker
  mission: compose
---
<div class="box story"><div class="tag">The problem</div>Your web container starts immediately. The API is still preparing. The first request fails even though both containers say “running”.</div>
<div class="box idea"><div class="tag">The big idea</div>Short-form depends_on orders startup. A health check plus condition: service_healthy waits for a dependency to pass its check before starting the dependent service.</div>
<h2>Practice safely in the browser</h2><div data-docker-sim></div>
<details class="file"><summary>Common traps and useful edge cases</summary><p>This is startup coordination, not continuous supervision. If the API fails later, Compose does not automatically restart every dependent service. Apps must handle temporary failures. A successful health check only proves what its check actually tested.</p></details>
