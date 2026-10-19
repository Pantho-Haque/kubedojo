---
id: ci-rollback
title: Roll back with git revert
emoji: ↩️
stage: 2
format: html
quiz:
  - q: Why is reverting the deploy commit fast?
    options:
      - The previous image is already built and stored
      - It skips Argo CD
    answer: 0
    why: Only one line in git changes; the image already exists.
  - q: Pods show ImagePullBackOff after a sync. A likely cause?
    options:
      - 'The image name is wrong, or the registry is private'
      - The tests failed
    answer: 0
    why: 'If tests had failed, nothing would have been promoted.'
---
<div class="box story"><div class="tag">The problem</div>Version two is live and customers report a bug. You need the old version back now, and you want a record of what happened.</div>
<div class="box idea"><div class="tag">The big idea</div>A deploy was a commit, so a rollback is a commit too. git revert the deploy commit and push: Argo CD deploys the previous image. Nothing is rebuilt, and history shows who rolled back and when.</div>
<div class="cmd"><pre tabindex="0">git log --oneline -- deploy/                   # find the deploy commit
git revert --no-edit &lt;deploy-commit&gt;
git push                                       # Argo CD deploys the previous tag</pre><button class="copy">Copy</button></div>
<table><tr><th>Option</th><th>Speed</th><th>When</th></tr>
<tr><td>Revert the deploy commit</td><td>Fast: the old image already exists</td><td>The newest release is bad and you need the last good one</td></tr>
<tr><td>Revert the code commit</td><td>Slower: CI builds a new image</td><td>You want the fix to go through the full pipeline</td></tr></table>
<p><b>When a sync fails:</b> look at the Application’s events and the pods. Common causes are a wrong image name (<i>ImagePullBackOff</i>), a private registry without a pull secret, or invalid YAML. Fix it in git; Argo CD retries.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>Rollback = git revert of the deploy commit, then push.</li><li>No rebuild is needed: the previous image is still in the registry.</li><li>Fix failed syncs in git, not in the cluster.</li></ul></div>
