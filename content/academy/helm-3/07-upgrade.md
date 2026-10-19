---
id: h-upgrade
title: 'Upgrade, break, and roll back'
emoji: ↩️
stage: 2
format: html
quiz:
  - q: 'After revision 2 fails, rolling back to revision 1 creates…'
    options:
      - A new revision using revision 1’s configuration
      - A restored database backup
      - The original revision number with no history
    answer: 0
    why: Rollback itself is another recorded release operation.
practice:
  kind: helm
  mission: release
---
<div class="box story"><div class="tag">The problem</div>You installed version 1.27. Now you want a new image. It might work, or an image typo might leave new Pods unable to start.</div>
<div class="box idea"><div class="tag">The big idea</div>Upgrade changes an existing release and adds a revision. Rollback uses an earlier revision’s configuration and creates another revision. It does not travel back in time for your database contents.</div>
<h2>Try it before using a terminal</h2><div data-helm-sim></div>
<div class="cmd"><pre tabindex="0">helm upgrade pizza ./pizza-chart -n helm-practice --set image.tag=1.28 --wait --timeout 2m
helm history pizza -n helm-practice
helm rollback pizza 1 -n helm-practice --wait --timeout 2m</pre><button class="copy">Copy</button></div>
<p>Inspect history before choosing a revision. Here we use explicit rollback. Automatic failure handling and flags vary between Helm versions; check <code>helm upgrade --help</code>. Our chart keeps desired availability during rolling updates and requires space for one extra Pod.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>A release revision is different from a chart version and an image tag.</li><li>Rolling back manifests cannot undo a database migration or restore lost data.</li></ul></div>
