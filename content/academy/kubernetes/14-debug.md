---
id: debug
title: 'Detective mode: debugging'
emoji: "\U0001F575️"
stage: 3
format: html
quiz:
  - q: |-
      <pre tabindex="0">NAME        READY  STATUS            RESTARTS
      pizza-7d9   0/1    ImagePullBackOff  0</pre>Most likely cause?
    options:
      - A typo in the image name or tag (or a private image without credentials)
      - The app has a bug
      - The node is out of memory
    answer: 0
    why: 'The container never started, so it can''t be an app bug yet.'
  - q: >-
      <pre tabindex="0">NAME        READY  STATUS            RESTARTS

      pizza-5c1   0/1    CrashLoopBackOff  5</pre>What's the first command to
      run?
    options:
      - kubectl logs pizza-5c1 --previous
      - kubectl delete node
      - kubectl scale --replicas=0
    answer: 0
    why: >-
      <code>--previous</code> shows the output of the container that just
      crashed.
  - q: |-
      <pre tabindex="0">NAME        READY  STATUS   AGE
      pizza-x2k   0/1    Pending  10m</pre>Where will you find the answer?
    options:
      - kubectl describe pod pizza-x2k → Events
      - kubectl logs pizza-x2k
      - It'll fix itself in an hour
    answer: 0
    why: >-
      Start with Events to learn whether scheduling, image downloads, or storage
      setup is blocking it. A container that has not started cannot produce app
      logs.
  - q: |-
      <pre tabindex="0">NAME        READY  STATUS   RESTARTS
      pizza-a1b   0/1    Running  0</pre>It's running but gets no traffic. Why?
    options:
      - Its readiness probe is failing
      - The image is wrong
      - It was OOMKilled
    answer: 0
    why: Running + 0/1 READY points to readiness.
setup:
  - 'kubectl create deployment pizza --image=nginx:1.27 --replicas=3'
---
<div class="box story"><div class="tag">The problem</div>Something's broken. Don't panic. Almost every Kubernetes problem is solved with the same 4 commands, in this order.</div>
<div class="box idea"><div class="tag">The big idea</div><b>get → describe → logs → exec.</b> Check the status, read the events, read the app's output, look around inside.</div>
<div class="cmd"><pre tabindex="0">kubectl get pods                       # 1. what's the STATUS?
kubectl describe pod &lt;name&gt;            # 2. scroll to "Events" at the bottom. The answer is usually there
kubectl logs &lt;name&gt; --previous         # 3. what did the app say before it crashed?
kubectl exec -it &lt;name&gt; -- sh          # 4. open a shell inside the container
kubectl get events --sort-by=.lastTimestamp   # bonus: what happened recently?</pre><button class="copy">Copy</button></div>
<h2>Status cheat sheet</h2>
<table><tr><th>You see</th><th>It means</th><th>Look at</th></tr>
<tr><td><b>Pending</b></td><td>not placed on a node yet: no room, or its disk (PVC) isn't ready</td><td>describe → Events</td></tr>
<tr><td><b>ContainerCreating</b></td><td>pulling the image or attaching volumes</td><td>wait; describe if it's stuck</td></tr>
<tr><td><b>ImagePullBackOff</b></td><td>wrong image name or tag, or a private image without credentials</td><td>describe</td></tr>
<tr><td><b>CrashLoopBackOff</b></td><td>the app starts, then exits, over and over</td><td>logs --previous</td></tr>
<tr><td><b>OOMKilled</b></td><td>went over its memory limit</td><td>raise the limit, or fix the leak</td></tr>
<tr><td><b>CreateContainerConfigError</b></td><td>a ConfigMap or Secret it needs is missing</td><td>describe</td></tr>
<tr><td><b>Running</b> but <b>0/1</b> READY</td><td>the readiness probe is failing, so it gets no traffic</td><td>describe + logs</td></tr></table>
<p>Now the detective game. 🕵️ Solve these cases:</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>get → describe → logs → exec.</li><li>Pending = waiting to be scheduled or set up (use describe). CrashLoop = an app problem (use logs --previous).</li></ul></div>
