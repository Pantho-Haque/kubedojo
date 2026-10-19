---
id: h-files
title: Look inside a small chart
emoji: "\U0001F5C2️"
stage: 1
format: html
quiz:
  - q: Where do default settings live?
    options:
      - Chart.yaml
      - values.yaml
      - In every node
    answer: 1
    why: Templates read these defaults unless you override them.
  - q: Changing only appVersion changes our container image?
    options:
      - 'Yes'
      - 'No'
    answer: 1
    why: >-
      Our Deployment template uses .Values.image.tag; appVersion is just package
      metadata here.
---
<p>Our chart has just four files. Open one at a time. You will create these exact files in the real exercise.</p>
<details class="file"><summary>📄 Folder map</summary><pre tabindex="0">pizza-chart/
  Chart.yaml
  values.yaml
  templates/
    deployment.yaml
    service.yaml</pre></details>
<details class="file"><summary>📄 Chart.yaml — the package label</summary><pre tabindex="0">apiVersion: v2
name: pizza-chart
description: A small chart for learning Helm
type: application
version: 0.1.0
appVersion: "1.27"
</pre></details>
<details class="file"><summary>📄 values.yaml — the default choices</summary><pre tabindex="0">replicaCount: 1
image:
  repository: nginx
  tag: "1.27"
</pre></details>
<details class="file"><summary>📄 templates/deployment.yaml — the app recipe</summary><pre tabindex="0">apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}
spec:
  replicas: {{ .Values.replicaCount }}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app.kubernetes.io/instance: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app.kubernetes.io/instance: {{ .Release.Name }}
    spec:
      containers:
      - name: web
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: 80
        readinessProbe:
          httpGet:
            path: /
            port: 80
        resources:
          requests:
            cpu: 100m
            memory: 64Mi
          limits:
            memory: 128Mi
</pre></details>
<details class="file"><summary>📄 templates/service.yaml — the stable address</summary><pre tabindex="0">apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}
spec:
  selector:
    app.kubernetes.io/instance: {{ .Release.Name }}
  ports:
  - port: 80
    targetPort: 80
</pre></details>
<p><code>{{ .Values.replicaCount }}</code> is a blank Helm fills with a value. <code>{{ .Release.Name }}</code> becomes the installation name. Matching labels connect our Service to our Pods.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>Chart version describes the package. appVersion is informational; our image.tag setting controls the container image.</li><li>Start with simple substitutions. Learn template conditions, loops, and helper functions after this small chart makes sense.</li></ul></div>
