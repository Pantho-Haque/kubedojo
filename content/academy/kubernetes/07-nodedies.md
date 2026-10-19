---
id: nodedies
title: When a whole machine dies
emoji: "\U0001F4A5"
stage: 1
format: html
quiz:
  - q: 'You run <code>replicas: 1</code> and its node dies. What do users see?'
    options:
      - 'Nothing, K8s is magic'
      - Downtime until a new pod starts somewhere else
      - The pod moves to another node without stopping
    answer: 1
    why: >-
      Pods don't move while running. They're recreated. With 2+ replicas on
      different nodes, the others keep serving.
  - q: node-2 comes back. Do the pods move back to it?
    options:
      - 'Yes, right away'
      - 'No. New pods may land there, but running pods stay where they are'
    answer: 1
    why: Kubernetes only places pods when they're created.
practice:
  kind: k8s
  config:
    nodes: 3
    replicas: 4
    actions:
      - killNode
      - killPod
    challenge:
      text: >-
        Kill a node, wait until all 4 pods are Running again, then repair the
        node.
      check: nodedies
---
<div class="box story"><div class="tag">The problem</div>3am. A hardware failure takes out node-2, along with every pod on it.</div>
<div class="box idea"><div class="tag">The big idea</div>The controller sees “wanted 4, have 2” and the scheduler places replacement pods on the nodes that are still alive. Your app shrinks for a moment, then heals, <b>if other nodes have room</b>. Keeping another ready replica on a different node can keep the app serving while replacements start.</div>
<h2>🎮 Try it</h2><p>Choose <b>Turn off</b> on one machine and watch replacement pods appear elsewhere. Then choose <b>Repair</b>. Notice that pods do <b>not</b> move back when the node returns, because Kubernetes doesn't rebalance on its own. Bonus: kill all three nodes.</p><div data-sim></div>
<p style="color:var(--mut);font-size:15px">In a real cluster, Kubernetes waits about 5 minutes before deciding a silent node is truly dead (it might just be a network hiccup). This practice speeds that delay up so you can see recovery happen.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>Pods never move. They're replaced.</li><li>Run at least 2 replicas of anything important.</li><li>Leave spare room on your nodes, or replacement pods will have nowhere to go.</li></ul></div>
