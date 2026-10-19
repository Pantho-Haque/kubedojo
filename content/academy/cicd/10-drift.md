---
id: ci-drift
title: Drift and self-heal
emoji: "\U0001FA79"
stage: 2
format: html
quiz:
  - q: selfHeal is on. Someone scales the app by hand from 2 to 5. What happens?
    options:
      - It stays at 5
      - 'Argo CD returns it to 2, as git says'
    answer: 1
    why: The cluster is brought back to the desired state in git.
  - q: You really need 5 copies. What is the GitOps way?
    options:
      - Change replicas in git and push
      - Keep running kubectl scale
    answer: 0
    why: Changes in git are permanent and reviewed.
practice:
  kind: pipeline
  mission: drift
---
<div class="box story"><div class="tag">The problem</div>During an incident someone runs <code>kubectl scale --replicas=5</code> on production. It helps. Nobody writes it down. Next week a deploy quietly puts it back to 2 and the incident returns.</div>
<div class="box idea"><div class="tag">The big idea</div>With selfHeal on, Argo CD notices any difference between the cluster and git within seconds or minutes, and undoes it. Manual changes do not last; changes in git do.</div>
<div class="cmd"><pre tabindex="0">kubectl -n pizza scale deploy/pizza --replicas=5   # a hand-made change
kubectl -n argocd get application pizza             # OutOfSync for a moment
kubectl -n pizza get deploy pizza                   # back to 2: git wins</pre><button class="copy">Copy</button></div>
<p><b>Need the change to stay?</b> Make it in git: change <code>replicas</code> in <code>deploy/</code>, commit, and push. During a real emergency, you can pause automated sync, but write the change into git before turning it back on.</p>
<h2>Practice safely in the browser</h2><div data-ci-sim></div>
<div class="box warnbox">Without selfHeal, Argo CD only shows OutOfSync and waits. With prune, it also deletes resources you removed from git. Know which options your apps use.</div>
<div class="box keep"><div class="tag">Remember</div><ul><li>Drift = the cluster differs from git.</li><li>selfHeal undoes hand-made changes; prune removes deleted resources.</li><li>Lasting changes go through git.</li></ul></div>
