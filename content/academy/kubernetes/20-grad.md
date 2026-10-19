---
id: grad
title: Graduation
emoji: "\U0001F393"
stage: 4
format: html
---
<p class="lead">This is your finish line, not an automatic certificate. Try the tasks below without following the earlier commands line by line. Go back to a lesson whenever you need it.</p>
<h2>Your final mission</h2>
<p>Use a disposable learning cluster and a small app. Check an item only after you have done it. Your first goal is confidence running a home lab; operating important production systems takes more practice and testing.</p>
<label class="task"><input type="checkbox" data-task="g-explain"><span>Explain how a request reaches a Pod, and why a Deployment replaces deleted Pods.</span></label>
<label class="task"><input type="checkbox" data-task="g-build"><span>Create a cluster, deploy three app copies, and reach them through a Service.</span></label>
<label class="task"><input type="checkbox" data-task="g-recover"><span>Delete a Pod, test a worker failure, and explain how and why recovery happens.</span></label>
<label class="task"><input type="checkbox" data-task="g-update"><span>Release a new version, diagnose a broken version, and roll back successfully.</span></label>
<label class="task"><input type="checkbox" data-task="g-maintain"><span>Rebuild a test cluster from saved manifests, restore backed-up data, and write down an upgrade and monitoring routine.</span></label>
<p><b>Done?</b> You have reached the end of the core path. Keep one small project running and practice the Day 2 routine. Learn the optional topics below as that project needs them.</p>
<h2>The whole picture on one page</h2>
<table><tr><th>Thing</th><th>In one line</th></tr>
<tr><td>Cluster</td><td>control plane (brain) + worker nodes (muscle)</td></tr>
<tr><td>Pod</td><td>wrapper around a container; disposable</td></tr>
<tr><td>Deployment</td><td>“keep N copies of this pod running”, plus rolling updates</td></tr>
<tr><td>Service</td><td>a stable name/IP that sends traffic to pods matching a label</td></tr>
<tr><td>Ingress / Gateway</td><td>one front door for HTTP, routes by hostname and path</td></tr>
<tr><td>ConfigMap / Secret</td><td>settings and passwords kept outside the image</td></tr>
<tr><td>PVC</td><td>“I need a disk that survives”</td></tr>
<tr><td>Probes</td><td>readiness = traffic on/off, liveness = restart</td></tr>
<tr><td>Requests / limits</td><td>reservation / ceiling for CPU and memory</td></tr>
<tr><td>Namespace / RBAC</td><td>folders / who may do what</td></tr>
<tr><td>Helm</td><td>packaged, templated YAML</td></tr></table>
<h2>kubectl in 10 commands</h2>
<div class="cmd"><pre tabindex="0">kubectl get pods -A                         # what's running everywhere
kubectl apply -f file.yaml                  # make the cluster match this file
kubectl describe pod &lt;name&gt;                 # details + Events (the debugging gold mine)
kubectl logs &lt;name&gt; [--previous] [-f]       # app output
kubectl exec -it &lt;name&gt; -- sh               # shell inside
kubectl scale deploy &lt;name&gt; --replicas=5
kubectl set image deploy/&lt;name&gt; &lt;ctr&gt;=&lt;image&gt;
kubectl rollout undo deploy/&lt;name&gt;
kubectl port-forward svc/&lt;name&gt; 8080:80
kubectl create ... --dry-run=client -o yaml # let kubectl write YAML for you</pre><button class="copy">Copy</button></div>
<details class="file"><summary>Optional next steps, after the final mission</summary>
<ul><li><b>Practise for free in your browser:</b> killercoda.com has hundreds of Kubernetes scenarios.</li>
<li><b>Build your own app</b> (any small API + database) and deploy it to your k3s cluster with a Helm chart. This is where it all sinks in.</li>
<li><b>Level up:</b> autoscaling (HPA), the Gateway API, GitOps with Argo CD, Operators and CRDs.</li>
<li><b>The hard way:</b> “Kubernetes The Hard Way” by Kelsey Hightower builds a cluster by hand, piece by piece.</li>
<li><b>Official references:</b> <a href="https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/" target="_blank" rel="noopener">Pod lifecycle</a>, <a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/" target="_blank" rel="noopener">Deployments and rollout settings</a>, and <a href="https://docs.k3s.io/datastore/backup-restore" target="_blank" rel="noopener">K3s backup and restore</a>.</li>
<li><b>Get certified:</b> CKAD (for app developers) → CKA (for cluster admins).</li>
<li><b>Deep-dive simulator:</b> the <button type="button" class="open-lab">behind-the-scenes lab</button> will make a lot more sense now. Try its Playground tab.</li></ul></details>
