---
id: h2-grad
title: Your Helm 2 finish line
emoji: 🎓
stage: 2
---

<p class="lead">You are ready to work with Helm 2 when you can do these without copying earlier commands. Try them in <b>Simulate</b> or in the KubeDojo playground (guide section <i>9 · Helm 2 + Tiller</i>).</p>

<label class="task"><input type="checkbox" data-task="h2-g-tiller"><span>Install Tiller with its own service account and check that the client and server versions match.</span></label>
<label class="task"><input type="checkbox" data-task="h2-g-install"><span>Install a chart with --name, wait for it, and find it with helm2 ls.</span></label>
<label class="task"><input type="checkbox" data-task="h2-g-recover"><span>Break an upgrade on purpose, read helm2 history, and roll back to the revision that worked.</span></label>
<label class="task"><input type="checkbox" data-task="h2-g-purge"><span>Delete a release, find it with helm2 ls --deleted, then purge it and reuse the name.</span></label>
<label class="task"><input type="checkbox" data-task="h2-g-migrate"><span>Explain why Tiller was a security risk, and the four steps of moving a release to Helm 3.</span></label>

<p><b>Next:</b> take the Helm 3 course to see the same ideas without Tiller.</p>
