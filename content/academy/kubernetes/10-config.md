---
id: config
title: Config & Secrets
emoji: "\U0001F511"
stage: 2
format: html
quiz:
  - q: Where should a database password go?
    options:
      - ConfigMap
      - Secret
      - Hard-coded in the image
    answer: 1
    why: And then control who is allowed to read Secrets.
  - q: Is a Kubernetes Secret encrypted by default?
    options:
      - 'Yes, military-grade'
      - 'No, it''s base64, which anyone can decode'
    answer: 1
    why: >-
      <code>echo czNjcmV0IQ== | base64 -d</code> gives back
      <code>s3cret!</code>.
  - q: >-
      You changed a ConfigMap that's used as env vars, but the pods still see
      the old value. Why?
    options:
      - 'Env vars are read when the container starts, so restart the pods'
      - ConfigMaps are read-only
      - You need a new cluster
    answer: 0
    why: <code>kubectl rollout restart</code> fixes it.
---
<div class="box story"><div class="tag">The problem</div>Your pizza app needs a database address and a password. If you put them inside the image, you have to rebuild it for every environment, and anyone who pulls the image can read the password. 😬</div>
<div class="box idea"><div class="tag">The big idea</div>Keep config outside the image. A <b>ConfigMap</b> holds normal settings. A <b>Secret</b> holds sensitive values (passwords, tokens). Pods read them as environment variables or files.</div>
<div class="box like"><div class="tag">Think of it like…</div>The same lunchbox (image) goes everywhere, but each office gets a different sticky note (config).</div>
<details class="file"><summary>📄 configmap + secret + how a Deployment uses them</summary><pre tabindex="0">apiVersion: v1
kind: ConfigMap
metadata:
  name: pizza-config
data:
  MENU_SIZE: "large"
  DB_HOST: "postgres"
---
apiVersion: v1
kind: Secret
metadata:
  name: pizza-secret
stringData:              # write plain text; K8s stores it base64-encoded
  DB_PASSWORD: "s3cret!"
---
# inside the Deployment's container:
        envFrom:
        - configMapRef:
            name: pizza-config
        - secretRef:
            name: pizza-secret</pre></details>
<div class="box warnbox">⚠️ Secrets are <b>base64-encoded, not encrypted</b>. Anyone who can read Secrets in the cluster can read your password. Limit who can read them (see the Security lesson), and never commit them to git as plain text. Tools like Sealed Secrets or External Secrets help later.</div>
<p><b>Gotcha:</b> changing a ConfigMap does <b>not</b> restart pods. Environment variables are only read when a container starts, so restart the pods:</p>
<div class="cmd"><pre tabindex="0">kubectl create configmap pizza-config --from-literal=MENU_SIZE=large
kubectl create secret generic pizza-secret --from-literal=DB_PASSWORD='s3cret!'
kubectl rollout restart deployment pizza     # pick up new config</pre><button class="copy">Copy</button></div>
<div class="box keep"><div class="tag">Remember</div><ul><li>Same image everywhere. Config comes from ConfigMaps and Secrets.</li><li>A Secret is not encrypted. Control who can read it.</li></ul></div>
