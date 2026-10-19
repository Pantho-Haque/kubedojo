---
id: h-real
title: Use Helm on your learning cluster
emoji: "\U0001F4BB"
stage: 3
format: html
---
<p class="lead">Now use a real terminal. Use the disposable kind or k3s cluster from the Kubernetes course. These steps install an nginx web server as our stand-in pizza app.</p>
<label class="task"><input type="checkbox" data-task="h-tools"><span>Have a learning cluster and Helm ready; check the selected context</span></label><div class="cmd"><pre tabindex="0">brew install helm
helm version --short
kubectl config current-context
kubectl get nodes</pre><button class="copy">Copy</button></div>
<p>Stop if the context names an important or unfamiliar cluster. Continue from a new working folder on your Mac. The next command creates a small <code>pizza-chart</code> directory.</p>
<label class="task"><input type="checkbox" data-task="h-files"><span>Create the four chart files</span></label><div class="cmd"><pre tabindex="0">mkdir -p pizza-chart/templates
cat &gt; pizza-chart/Chart.yaml &lt;&lt;'EOF'
apiVersion: v2
name: pizza-chart
description: A small chart for learning Helm
type: application
version: 0.1.0
appVersion: "1.27"
EOF
cat &gt; pizza-chart/values.yaml &lt;&lt;'EOF'
replicaCount: 1
image:
  repository: nginx
  tag: "1.27"
EOF
cat &gt; pizza-chart/templates/deployment.yaml &lt;&lt;'EOF'
apiVersion: apps/v1
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
EOF
cat &gt; pizza-chart/templates/service.yaml &lt;&lt;'EOF'
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}
spec:
  selector:
    app.kubernetes.io/instance: {{ .Release.Name }}
  ports:
  - port: 80
    targetPort: 80
EOF</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="h-preview"><span>Lint and preview; find the Deployment and Service in the output</span></label><div class="cmd"><pre tabindex="0">helm lint ./pizza-chart
helm template pizza ./pizza-chart --set replicaCount=2</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="h-deploy"><span>Install two copies into a practice namespace</span></label><div class="cmd"><pre tabindex="0">helm install pizza ./pizza-chart -n helm-practice --create-namespace --set replicaCount=2 --wait --timeout 2m
helm list -n helm-practice
kubectl get pods,svc -n helm-practice</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="h-browser"><span>Open the app at http://localhost:8080</span></label><div class="cmd"><pre tabindex="0">kubectl -n helm-practice port-forward svc/pizza 8080:80</pre><button class="copy">Copy</button></div>
<p>Keep the port-forward terminal open while browsing. Use another terminal for the next commands; Ctrl+C stops forwarding.</p>
<label class="task"><input type="checkbox" data-task="h-change"><span>Upgrade to three copies and image 1.28, then inspect the revision</span></label><div class="cmd"><pre tabindex="0">helm upgrade pizza ./pizza-chart -n helm-practice --set replicaCount=3 --set image.tag=1.28 --wait --timeout 2m
helm history pizza -n helm-practice
helm get values pizza -n helm-practice</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="h-failure"><span>Try a missing image; expect a timeout, then inspect its Events</span></label><div class="cmd"><pre tabindex="0">helm upgrade pizza ./pizza-chart -n helm-practice --set replicaCount=3 --set image.tag=does-not-exist --wait --timeout 30s
kubectl get pods -n helm-practice
kubectl get events -n helm-practice --sort-by=.lastTimestamp</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="h-restore"><span>Read history, then roll back to the successful revision (2 in this fresh exercise)</span></label><div class="cmd"><pre tabindex="0">helm history pizza -n helm-practice
helm rollback pizza 2 -n helm-practice --wait --timeout 2m
kubectl get pods -n helm-practice</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="h-remove"><span>Uninstall only this practice release</span></label><div class="cmd"><pre tabindex="0">helm uninstall pizza -n helm-practice
helm list -n helm-practice
kubectl get deploy,svc -n helm-practice</pre><button class="copy">Copy</button></div>
<p>Our chart has no database or persistent storage. Other charts can retain PVCs, CRDs, or hook-created resources; uninstall is not a universal data-cleanup command. The namespace remains.</p>
