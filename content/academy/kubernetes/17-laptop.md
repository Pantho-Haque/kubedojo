---
id: laptop
title: Your first real cluster (on your laptop)
emoji: "\U0001F4BB"
stage: 4
format: html
---
<p class="lead">Time to use a real cluster. Tick each box as you go; your progress is saved. You'll need <b>Docker Desktop</b> (or OrbStack or Colima) running.</p>
<h2>1 · Install the tools</h2>
<label class="task"><input type="checkbox" data-task="l-install"><span>Install kubectl, kind and helm</span></label><div class="cmd"><pre tabindex="0">brew install kubectl kind helm</pre><button class="copy">Copy</button></div>
<h2>2 · Create a 3-node cluster</h2>
<p><b>kind</b> = “Kubernetes IN Docker”. Each “node” is a container on your laptop, so it's fast and free to throw away.</p>
<label class="task"><input type="checkbox" data-task="l-config"><span>Write the cluster config</span></label><div class="cmd"><pre tabindex="0">cat &gt; kind.yaml &lt;&lt;'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
EOF</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="l-create"><span>Create the cluster (about 1 minute)</span></label><div class="cmd"><pre tabindex="0">kind create cluster --name pizza --config kind.yaml</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="l-nodes"><span>Look at your nodes: 1 control plane + 2 workers</span></label><div class="cmd"><pre tabindex="0">kubectl config current-context   # should say kind-pizza
kubectl get nodes</pre><button class="copy">Copy</button></div>
<p>Check that the context is <code>kind-pizza</code> before the exercises. A context tells kubectl which cluster it will change.</p>
<h2>3 · Deploy and expose 🍕</h2>
<label class="task"><input type="checkbox" data-task="l-deploy"><span>Create a Deployment with 3 replicas, and see which node each pod is on</span></label><div class="cmd"><pre tabindex="0">kubectl create deployment pizza --image=nginx:1.27 --replicas=3
kubectl get pods -o wide</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="l-expose"><span>Create a Service and open it in your browser at http://localhost:8080</span></label><div class="cmd"><pre tabindex="0">kubectl expose deployment pizza --port=80
kubectl port-forward svc/pizza 8080:80</pre><button class="copy">Copy</button></div>
<p>This command stays running. Keep this terminal open while browsing; use a second terminal for the next exercises. Press Ctrl+C to stop forwarding. You will see the nginx welcome page: it stands in for our pizza app.</p>
<h2>4 · Break it on purpose 🔨</h2>
<label class="task"><input type="checkbox" data-task="l-kill"><span>Delete ALL the pods and watch them come back (Ctrl+C to stop watching)</span></label><div class="cmd"><pre tabindex="0">kubectl delete pod -l app=pizza
kubectl get pods -w</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="l-node"><span>Kill a worker node. After about 40s it shows NotReady; after about 5 min its pods are replaced elsewhere. Then start it again.</span></label><div class="cmd"><pre tabindex="0">docker stop pizza-worker
kubectl get nodes -w       # Ctrl+C stops watching; the cluster keeps running
docker start pizza-worker</pre><button class="copy">Copy</button></div>
<h2>5 · Update, break, roll back 🚀</h2>
<label class="task"><input type="checkbox" data-task="l-update"><span>Ship a new version</span></label><div class="cmd"><pre tabindex="0">kubectl set image deployment/pizza nginx=nginx:1.28
kubectl rollout status deployment/pizza</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="l-bad"><span>Ship a broken version and see that the old pods keep running</span></label><div class="cmd"><pre tabindex="0">kubectl set image deployment/pizza nginx=nginx:does-not-exist
kubectl get pods          # ImagePullBackOff, but the old pods are still Running!
kubectl describe pod &lt;the-broken-one&gt;</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="l-undo"><span>Roll back</span></label><div class="cmd"><pre tabindex="0">kubectl rollout undo deployment/pizza</pre><button class="copy">Copy</button></div>
<h2>6 · The best trick: let kubectl write the YAML for you</h2>
<label class="task"><input type="checkbox" data-task="l-yaml"><span>Generate a YAML skeleton, read it, edit it, apply it</span></label><div class="cmd"><pre tabindex="0">kubectl create deployment pizza --image=nginx:1.27 --dry-run=client -o yaml &gt; pizza.yaml
kubectl apply -f pizza.yaml</pre><button class="copy">Copy</button></div>
<h2>7 · Clean up</h2>
<label class="task"><input type="checkbox" data-task="l-delete"><span>Delete the cluster (you can make a fresh one any time)</span></label><div class="cmd"><pre tabindex="0">kind delete cluster --name pizza</pre><button class="copy">Copy</button></div>
<div class="box keep">🎉 If you ticked everything, you've done what a junior platform engineer does in their first week.</div>
