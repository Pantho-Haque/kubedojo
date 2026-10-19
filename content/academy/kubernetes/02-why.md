---
id: why
title: Why does Kubernetes exist?
emoji: "\U0001F914"
stage: 0
format: html
quiz:
  - q: You told Kubernetes “run 3 copies”. One copy crashes at 2am. What happens?
    options:
      - Nothing until you wake up and restart it
      - Kubernetes notices 2 ≠ 3 and starts a new copy
      - The whole app restarts
    answer: 1
    why: 'That''s the loop: wanted 3, have 2, so start one. You keep sleeping.'
  - q: How do you talk to Kubernetes?
    options:
      - 'Give it step-by-step instructions: start this, then that'
      - Describe the end result you want and let it work out the steps
      - Log into each server and run docker commands
    answer: 1
    why: >-
      This is called <b>declarative</b>: you describe where you want to end up,
      not how to get there.
---
<div class="box story"><div class="tag">The problem</div>Your 🍕 app runs in a container on one server. Life is good… until:
<ul><li>Friday night, traffic triples → everything gets slow.</li>
<li>2am, the app crashes → nobody restarts it until you wake up.</li>
<li>The server's disk dies → the app is gone.</li>
<li>You ship a new version → you stop the old one, start the new one, and customers see errors in between.</li></ul>
So you start writing scripts to fix all this… congratulations, you're building Kubernetes. Badly. 😅</div>
<div class="box idea"><div class="tag">The big idea</div>Kubernetes is a <b>robot operator</b>. You don't tell it <i>what to do</i>. You tell it <i>what you want</i>, like “3 copies of pizza:v1, always”, and it works 24/7 to make reality match your wish.</div>
<div class="box like"><div class="tag">Think of it like…</div>A <b>thermostat</b> 🌡️. You set 22°C. You don't switch the heater on and off yourself. If someone opens a window, the thermostat notices and fixes it.</div>
<div class="loop"><span>📝 You write a wish<br><small>“3 copies”</small></span>→<span>👀 K8s checks reality<br><small>“only 2 running”</small></span>→<span>🔧 K8s fixes the gap<br><small>starts 1 more</small></span>→<span>🔁 repeat forever</span></div>
<p>This loop is called <b>reconciliation</b>, and honestly it's 80% of Kubernetes. Almost every other feature just gives that loop one more thing to keep correct.</p>
<h2>Do I even need it?</h2>
<p>For one tiny app, a single server or a hosting platform is simpler. Kubernetes is worth it when you have several services, need updates with no downtime, want apps to restart themselves and to scale. It's also the industry standard, so learning it pays off.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>You describe the <b>desired state</b>. Kubernetes makes the <b>actual state</b> match.</li><li>The compare-and-fix loop runs forever. It's at the heart of everything.</li></ul></div>
