---
title: "Users and permissions: who may do what, in which namespace"
slug: users-and-permissions
order: 2
tags: [rbac, security]
description: "Roles, bindings, ServiceAccounts and the layers of a complete access-control setup for a cluster."
date: 2026-10-14
source: 00-concepts-user-permissions.md
---

# 00 — Users and permissions: who may do what, in which namespace

How to give people and programs exactly the access they need in each namespace, and nothing more, and what
makes up a complete access-control setup (an ACL) for a cluster. Read [00-concepts.md](00-concepts.md) first if
namespaces, contexts or kubeconfig are new to you.

> **Not tested yet.** Written from Kubernetes' documented behaviour. The hands-on parts use the kind cluster
> `local-cluster-1` and the namespaces `web`, `cache` and `db` from
> [01-kind-cluster-spin.md](01-kind-cluster-spin.md); they work the same on k3d. Run them once and fix anything
> that differs on your version.

---

## 1. The big picture: three questions, asked in order

Every request to the cluster, whether from `kubectl` or from a program, goes through the API server, which
asks three questions in a fixed order:

| Question | Name | Answered by |
| --- | --- | --- |
| **Who are you?** | Authentication | Certificates, tokens, or a login provider (OIDC / SSO) |
| **Are you allowed to do this?** | Authorization | **RBAC** (Roles and bindings): the heart of the ACL |
| **Is this request acceptable?** | Admission | Rules about the object itself, such as Pod Security or quotas |

A request that fails any step is refused. Most of what follows is about the middle one, RBAC.

Two facts that surprise people:

- **Kubernetes has no user accounts.** There is no `kubectl create user`. A "user" is simply a name that your
  authentication method vouches for: the CN field in a certificate, or a name in an SSO token. Kubernetes only
  stores what that name may do.
- **RBAC only grants.** There are no "deny" rules. Access is the sum of every rule that matches. No rule means
  no access, which is the safe default.

---

## 2. The objects

| Object | Scope | What it is |
| --- | --- | --- |
| **Role** | one namespace | A list of permissions: "these verbs on these resources" |
| **ClusterRole** | whole cluster | The same, but not tied to a namespace. Also used for cluster-wide resources (nodes, namespaces) |
| **RoleBinding** | one namespace | Attaches a Role **or ClusterRole** to a user, group or ServiceAccount, **inside that namespace** |
| **ClusterRoleBinding** | whole cluster | Attaches a ClusterRole to a subject in **every** namespace |
| **ServiceAccount** | one namespace | An identity for a **program** running in a pod (people use users and groups) |

**A permission is a verb on a resource:**

```yaml
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
```

- **Verbs:** `get`, `list`, `watch` (read), `create`, `update`, `patch`, `delete`, `deletecollection` (write).
- **Resources:** `pods`, `services`, `deployments`, `secrets`, `configmaps`, and so on. Sub-resources are written
  with a slash: `pods/log` (read logs), `pods/exec` (open a shell), `pods/portforward`.
- **apiGroups:** `""` (empty) for the core group (pods, services, secrets, configmaps), `apps` for
  deployments, and so on. `kubectl api-resources` lists each resource with its group.

**Subjects:** who the binding applies to. Three kinds: `User` (a name), `Group` (a name that many users share)
and `ServiceAccount`.

### The one idea that makes namespace permissions work

A **RoleBinding can point at a ClusterRole**. The ClusterRole defines *what* (a reusable job description), and
the RoleBinding limits *where* (one namespace). So you write "developer" once and hand it out per namespace:

```
ClusterRole  "edit"        what is allowed        (defined once)
RoleBinding  in ns "web"   alice  →  edit         alice can edit in web only
RoleBinding  in ns "db"    bob    →  edit         bob can edit in db only
```

### Built-in ClusterRoles worth knowing

You rarely need to write a role from scratch. Kubernetes ships these:

| ClusterRole | Lets the subject |
| --- | --- |
| `view` | Read most objects in the namespace. **Cannot read Secrets** |
| `edit` | Read and change most objects, **including Secrets**, and run `exec`. Cannot change roles or bindings |
| `admin` | Everything in the namespace, including roles and bindings there, but not the namespace object itself or its quota |
| `cluster-admin` | Everything, everywhere. Bound at cluster level it is root |

```bash
kubectl get clusterroles | grep -vE '^system:'
```

Lists them (without the many `system:` internal roles).

---

## 3. Hands-on 1: a program with limited access (ServiceAccount)

The quickest way to see namespace-scoped permissions work. Create an identity in `web`, give it a Role in `web`,
and test what it can and cannot do. Run as your normal admin context
(`kubectl config current-context` shows `kind-local-cluster-1`).

**3.1 The identity:**

```bash
kubectl create serviceaccount dev-alice -n web
```

**3.2 A Role: what is allowed.** Create, read, change and delete pods, Services and Deployments, in `web`:

```bash
kubectl create role web-developer --verb=get,list,watch,create,update,patch,delete --resource=pods,services,deployments.apps -n web
```

`deployments.apps` is `resource.group`: Deployments live in the `apps` group.

**3.3 A RoleBinding: who gets it, and where:**

```bash
kubectl create rolebinding dev-alice-web --role=web-developer --serviceaccount=web:dev-alice -n web
```

`--serviceaccount=web:dev-alice` is `<namespace>:<name>`.

**3.4 Test it** without logging in as anyone, using impersonation (`--as`):

```bash
kubectl auth can-i create deployments -n web --as=system:serviceaccount:web:dev-alice
```

`yes`.

```bash
kubectl auth can-i create deployments -n db --as=system:serviceaccount:web:dev-alice
```

`no`. The binding is in `web` only.

```bash
kubectl auth can-i get secrets -n web --as=system:serviceaccount:web:dev-alice
```

`no`. Secrets were not in the Role.

```bash
kubectl auth can-i --list -n web --as=system:serviceaccount:web:dev-alice
```

Everything it may do in `web`, as a table. This is the best way to audit one identity.

**3.5 Actually be it.** Make a token and put it in its own kubeconfig entry, so you switch between "me" and
"alice" like any two contexts:

```bash
TOKEN=$(kubectl create token dev-alice -n web)
```

```bash
kubectl config set-credentials dev-alice --token="$TOKEN"
```

```bash
kubectl config set-context dev-alice-web --cluster=kind-local-cluster-1 --user=dev-alice --namespace=web
```

```bash
kubectl --context dev-alice-web get pods
```

Works. Now try the places it should not reach:

```bash
kubectl --context dev-alice-web get pods -n db
```

```
Error from server (Forbidden): pods is forbidden: User "system:serviceaccount:web:dev-alice" cannot list resource "pods" in API group "" in the namespace "db"
```

`Forbidden` is the RBAC answer. (The token expires after about an hour by default; run `kubectl create token`
again for a new one. Replace `kind-local-cluster-1` with `k3d-local-cluster-1` on k3d.)

---

## 4. Hands-on 2: a person with a certificate (a user in a group)

A person needs a name your authentication method accepts. On a lab cluster the simplest is a client certificate
signed by the cluster. In the certificate, **CN is the user name and O is the group**.

**4.1 Make a key and a certificate request:**

```bash
openssl genrsa -out alice.key 2048
```

```bash
openssl req -new -key alice.key -out alice.csr -subj "/CN=alice/O=web-developers"
```

**4.2 Ask the cluster to sign it.** The request goes in as a Kubernetes object:

```bash
kubectl apply -f - <<EOF
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: alice
spec:
  request: $(base64 < alice.csr | tr -d '\n')
  signerName: kubernetes.io/kube-apiserver-client
  expirationSeconds: 86400
  usages:
    - client auth
EOF
```

`expirationSeconds: 86400` makes the certificate valid for one day. Keep it short (see the warning below).

**4.3 Approve it and fetch the signed certificate:**

```bash
kubectl certificate approve alice
```

```bash
kubectl get csr alice -o jsonpath='{.status.certificate}' | base64 -d > alice.crt
```

(On older macOS the decode flag is `-D`.)

**4.4 Add alice to your kubeconfig** as a user and a context:

```bash
kubectl config set-credentials alice --client-certificate=alice.crt --client-key=alice.key --embed-certs=true
```

```bash
kubectl config set-context alice-web --cluster=kind-local-cluster-1 --user=alice --namespace=web
```

**4.5 She can log in but may do nothing yet.** No rule matches her:

```bash
kubectl --context alice-web get pods
```

`Forbidden`. That is the safe default.

**4.6 Bind the whole group, not the person.** Anyone whose certificate says `O=web-developers` gets the same
access, so you manage permissions per group and only the membership changes per person. Use the built-in
`edit` role, scoped to `web`:

```bash
kubectl create rolebinding web-developers-edit --clusterrole=edit --group=web-developers -n web
```

```bash
kubectl --context alice-web get pods
```

Works. And in another namespace:

```bash
kubectl --context alice-web get pods -n db
```

`Forbidden`.

> **There is no way to revoke a client certificate.** Kubernetes has no certificate revocation list. A leaked
> certificate stays valid until it expires. So issue short-lived certificates, and for real teams use SSO
> (OIDC), where access ends when the person's account does. To cut someone off immediately, remove the
> RoleBinding that grants their group.

---

## 5. What a complete ACL for a cluster consists of

Permissions are not only RBAC. A complete setup has layers, each stopping a different kind of mistake or
attack:

| Layer | Question it answers | Tool |
| --- | --- | --- |
| 1. Authentication | Who is this? | Client certificates (lab), OIDC / SSO (real), cloud IAM (GKE) |
| 2. Authorization | What may they do, and where? | Roles, ClusterRoles, bindings |
| 3. Workload identity | What may a **program** do? | One ServiceAccount per app, least permissions |
| 4. Admission | Is this object acceptable? | Pod Security labels, quotas, policy engines |
| 5. Network | Which pods may talk to which? | NetworkPolicy |
| 6. Resources | How much may a namespace use? | ResourceQuota, LimitRange |
| 7. Secrets | Who can read credentials? | RBAC on Secrets, encryption at rest |
| 8. Audit | Who did what, and who has access now? | Audit logs, regular reviews |

### 5.1 Plan before you write YAML: personas and a matrix

Write down who needs what. Example for the namespaces `web`, `cache` and `db`:

| Who | web | cache | db | Cluster-wide |
| --- | --- | --- | --- | --- |
| `platform-admins` | admin | admin | admin | cluster-admin (very few people) |
| `web-developers` | edit | view | none | none |
| `db-admins` | none | none | admin | none |
| `auditors` | view | view | view | view |
| `ci-deployer` (a program) | update Deployments | none | none | none |

Rules to design by:

- **Bind groups, never individuals.** Adding a person means adding them to a group, not editing RBAC.
- **Least privilege.** Start from no access and add what is needed.
- **Prefer the built-in `view`, `edit` and `admin`** bound per namespace with a RoleBinding. Write custom Roles
  only for gaps, such as the CI deployer.
- **Keep `cluster-admin` for a handful of people**, and for nothing automated.
- **Separate duties:** whoever can edit workloads in `db` is not automatically whoever can read its Secrets.

### 5.2 Layers 1–2: bind the matrix

As YAML, so it can be reviewed and kept in git:

```bash
kubectl apply -f - <<'EOF'
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: web-developers-edit, namespace: web }
roleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: edit }
subjects: [{ apiGroup: rbac.authorization.k8s.io, kind: Group, name: web-developers }]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: web-developers-view, namespace: cache }
roleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: view }
subjects: [{ apiGroup: rbac.authorization.k8s.io, kind: Group, name: web-developers }]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: db-admins-admin, namespace: db }
roleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: admin }
subjects: [{ apiGroup: rbac.authorization.k8s.io, kind: Group, name: db-admins }]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata: { name: auditors-view }
roleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: view }
subjects: [{ apiGroup: rbac.authorization.k8s.io, kind: Group, name: auditors }]
EOF
```

Each block is "who (`subjects`) gets which role (`roleRef`) where (`namespace`)". The last one is a
ClusterRoleBinding, so auditors can read every namespace.

`roleRef` cannot be edited after creation. To change which role a binding points to, delete and re-create it.

### 5.3 Layer 3: one ServiceAccount per app, with only what it needs

Pods run as the namespace's `default` ServiceAccount unless told otherwise, so give each app its own and
give it nothing it does not use. A CI deployer that may only update Deployments in `web`:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: ServiceAccount
metadata: { name: ci-deployer, namespace: web }
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { name: deployer, namespace: web }
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "patch", "update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: ci-deployer-deployer, namespace: web }
roleRef: { apiGroup: rbac.authorization.k8s.io, kind: Role, name: deployer }
subjects: [{ kind: ServiceAccount, name: ci-deployer, namespace: web }]
EOF
```

For pods that never talk to the Kubernetes API (most of them), do not hand them a token at all. In the pod
spec:

```yaml
spec:
  automountServiceAccountToken: false
```

### 5.4 Layer 4: admission — Pod Security

RBAC says who may create a pod; Pod Security says what a pod may be (privileged, host networking, running as
root). It is switched on per namespace with a label:

```bash
kubectl label namespace web pod-security.kubernetes.io/enforce=baseline
```

`baseline` blocks the clearly dangerous settings; `restricted` is stricter. Use `pod-security.kubernetes.io/warn=restricted` first to see what would break without blocking anything.

### 5.5 Layer 5: network — NetworkPolicy

By default every pod can reach every other pod in every namespace. A NetworkPolicy closes that. A common start
is "deny all incoming traffic to `db`, then allow only what is needed":

```bash
kubectl apply -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-ingress, namespace: db }
spec:
  podSelector: {}
  policyTypes: ["Ingress"]
EOF
```

`podSelector: {}` means every pod in the namespace. A NetworkPolicy does nothing unless the cluster's network
plugin enforces it, and that depends on your setup and version. Check that `kind`'s default plugin, or k3s's
built-in controller, enforces policies before relying on it, or install a plugin that does (Calico, Cilium).

### 5.6 Layer 6: resources — quotas

Stops one namespace from using the whole cluster:

```bash
kubectl create quota web-quota --hard=pods=20,requests.cpu=4,requests.memory=8Gi -n web
```

### 5.7 Layer 7: secrets

- `view` already excludes Secrets; `edit` and `admin` include them. Give those roles only where needed.
- `list` on Secrets reveals their contents just like `get` does. Do not grant either casually.
- Encrypt Secrets at rest on real clusters (a setting on the API server; managed clusters like GKE offer it).

### 5.8 Layer 8: audit and review

Who can do something, and what can this identity do:

```bash
kubectl auth can-i delete pods -n db --as=alice --as-group=web-developers
```

```bash
kubectl auth can-i --list -n web --as=alice --as-group=web-developers
```

```bash
kubectl get rolebindings,clusterrolebindings -A -o wide
```

The last one lists every grant: look for `cluster-admin` bindings and for subjects you do not recognise.

```bash
kubectl get clusterrolebindings -o wide | grep cluster-admin
```

On a real cluster, also turn on API audit logging (who did what, when) and review RBAC on a schedule: when
people join, change teams or leave.

---

## 6. Dangerous permissions: check these before you grant

Some permissions are much more powerful than they look:

| Permission | Why it is dangerous |
| --- | --- |
| `*` in verbs or resources | Everything, including things added later |
| `create` on `pods` | A pod can mount Secrets and ServiceAccount tokens in its namespace, so it can reach what the namespace holds |
| `get` / `list` on `secrets` | Reads every password and token in the namespace |
| `pods/exec` | A shell inside a running pod, with all its access |
| `create` on `rolebindings` or `roles` | Can grant themselves more power (Kubernetes blocks giving more than you hold, unless you also have `escalate` or `bind`) |
| `escalate`, `bind`, `impersonate` | Direct ways to raise or borrow privileges |
| `nodes/proxy`, `nodes` | Reaches across the whole node |
| `cluster-admin` | Root |

---

## 7. On a managed cluster (GKE)

The same RBAC objects apply. Two additions:

- **Authentication and the first layer of permissions come from Google Cloud IAM.** A person needs an IAM role
  (for example one that lets them reach the cluster) before Kubernetes RBAC is even asked.
- **Groups come from Google Groups** (with Google Groups for RBAC enabled): bind the group's email in a
  RoleBinding, and managing membership happens in Google, not in Kubernetes.

So on GKE: IAM decides who may connect, RBAC decides what they may do in each namespace. Your lab cluster has
no IAM, so certificates or tokens stand in for it.

---

## 8. Clean up the lab objects

```bash
kubectl delete serviceaccount dev-alice ci-deployer -n web
```

```bash
kubectl delete role web-developer deployer -n web
```

```bash
kubectl delete rolebinding dev-alice-web web-developers-edit ci-deployer-deployer -n web
```

```bash
kubectl delete rolebinding web-developers-view -n cache
```

```bash
kubectl delete rolebinding db-admins-admin -n db
```

```bash
kubectl delete clusterrolebinding auditors-view
```

```bash
kubectl delete csr alice
```

```bash
kubectl config delete-context dev-alice-web
```

```bash
kubectl config delete-context alice-web
```

```bash
kubectl config delete-user dev-alice
```

```bash
kubectl config delete-user alice
```

```bash
rm alice.key alice.csr alice.crt
```

If you applied the NetworkPolicy, Pod Security label or quota from section 5, remove them too:

```bash
kubectl delete networkpolicy default-deny-ingress -n db
```

```bash
kubectl label namespace web pod-security.kubernetes.io/enforce-
```

```bash
kubectl delete quota web-quota -n web
```

Deleting the whole cluster ([06-clean-up.md](06-clean-up.md)) removes all of it at once.
