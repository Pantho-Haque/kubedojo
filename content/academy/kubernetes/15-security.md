---
id: security
title: 'Namespaces, permissions & staying safe'
emoji: "\U0001F6E1️"
stage: 3
format: html
quiz:
  - q: How do you see pods in ALL namespaces?
    options:
      - kubectl get pods -A
      - kubectl get everything
      - You can't
    answer: 0
    why: <code>-A</code> = <code>--all-namespaces</code>.
  - q: 'By default, can a pod in namespace “dev” talk to a pod in “prod”?'
    options:
      - 'No, namespaces are firewalls'
      - Yes. You need NetworkPolicies to block it
    answer: 1
    why: Namespaces organize things. They don't isolate the network.
  - q: Role vs RoleBinding?
    options:
      - Role = a list of permissions; RoleBinding = who gets them
      - They're the same thing
      - RoleBinding defines permissions; Role picks users
    answer: 0
    why: 'What is allowed, plus who it''s given to.'
---
<div class="box story"><div class="tag">The problem</div>Your team grows. Dev and prod share one cluster, an intern has kubectl, and one pod gets hacked. Who can touch what?</div>
<div class="box idea"><div class="tag">The big idea</div><b>Namespaces</b> are folders that keep things apart. <b>RBAC</b> (role-based access control) decides who, people and pods alike, may do what. Kubernetes is <b>not</b> locked down by default, so you add a few basics.</div>
<h2>Namespaces</h2>
<div class="cmd"><pre tabindex="0">kubectl create namespace prod
kubectl get pods -n prod      # look inside one namespace
kubectl get pods -A           # all namespaces</pre><button class="copy">Copy</button></div>
<p>Names only have to be unique within a namespace. Reach a Service in another namespace with <code>http://pizza.prod</code>.</p>
<h2>RBAC in one picture</h2>
<div class="flow"><span>📜 <b>Role</b>: “can get, list pods”</span>+<span>🔗 <b>RoleBinding</b>: “…given to alice”</span>=<span>✅ alice can read pods in prod</span></div>
<p>Nothing is allowed unless a binding allows it. Pods get an identity too, called a <b>ServiceAccount</b>, which you can grant permissions to the same way.</p>
<details class="file"><summary>📄 role.yaml</summary><pre tabindex="0">apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: prod
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: prod
  name: alice-reads-pods
subjects:
- kind: User
  name: alice
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io</pre></details>
<div class="cmd"><pre tabindex="0">kubectl auth can-i delete pods -n prod --as alice    # → no</pre><button class="copy">Copy</button></div>
<h2>The 5 security basics</h2>
<ol><li>Don't give everyone <code>cluster-admin</code>. Grant the smallest permissions that work.</li>
<li>Don't run containers as root (<code>securityContext: runAsNonRoot: true</code>).</li>
<li>Set requests and limits so one runaway pod can't starve the rest.</li>
<li>By default <b>every pod can talk to every pod</b>, across namespaces too. Use <b>NetworkPolicies</b> to restrict that.</li>
<li>Keep Secrets out of git, and keep the cluster and your images updated.</li></ol>
<div class="box keep"><div class="tag">Remember</div><ul><li>Namespace = folder. Role = what's allowed. RoleBinding = who gets it.</li><li>Kubernetes is open by default. Lock it down on purpose.</li></ul></div>
