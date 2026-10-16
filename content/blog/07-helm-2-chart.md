---
title: "Deploy with a Helm 2 chart: every template, explained"
slug: helm-2-chart
order: 7
tags: [helm]
description: "Package an application as a Helm 2 chart and deploy it: image pull secret, ConfigMap, Secret, Service, Ingress, autoscaling and more."
date: 2026-10-14
source: 05-helm-deployment.md
---

# 05 — Deploy with a Helm 2 chart: every template, explained

How to package an application as a Helm 2 chart and deploy it into a namespace: what each file in the chart is
for, when you need it, and how the pieces fit together into a complete, production-shaped release (image pull
secret, ConfigMap, Secret, Service, Ingress, autoscaling, disruption budget and more).

> **Not tested yet.** Written from Helm 2's documented behaviour. The chart is a complete, runnable example
> (`myapp`, which runs nginx) so every template can be shown in context. Run it once and fix anything that
> differs on your versions. It assumes the cluster and namespaces from
> [01-kind-cluster-spin.md](01-kind-cluster-spin.md) (or [02-k3d-cluster-spin.md](02-k3d-cluster-spin.md)).

> **Helm 2 is end-of-life** (support ended in 2020) and Tiller, its in-cluster server, is a known security
> weak point (section 2.4). Use Helm 2 only because a project pins it. For a new project use Helm 3, which has
> no Tiller; section 11 lists the differences.

---

## 1. How Helm 2 works

```
 your terminal                          the cluster
 ┌────────────┐   helm install    ┌────────────────────┐   creates    ┌───────────────────┐
 │ helm       │ ────────────────► │ Tiller (a pod in   │ ───────────► │ Deployment,       │
 │ (client)   │   chart + values  │ kube-system)       │   objects    │ Service, Secret…  │
 └────────────┘                   └────────────────────┘              └───────────────────┘
```

| Word | Meaning |
| --- | --- |
| **Chart** | A folder of templates plus default settings: one application, packaged |
| **Values** | The settings that fill the templates: image tag, replicas, hostnames |
| **Template** | A Kubernetes YAML file with `{{ … }}` holes that values fill in |
| **Release** | One installed copy of a chart, with a name (`web-prod`). Install the same chart twice, get two releases |
| **Revision** | A numbered version of a release. Every upgrade makes a new one; rollback goes back to an old one |
| **Tiller** | The server half of Helm 2. The client sends it the chart; Tiller renders it and applies it |

Three consequences of Tiller to remember:

- **The client and Tiller must be the same Helm version**, or Helm refuses with an "incompatible versions"
  error.
- **Tiller acts with its own ServiceAccount's permissions**, not yours. Whatever it may do, anyone who can talk to
  it may do.
- **Tiller stores every release inside the cluster**, as ConfigMaps in `kube-system`, including the values and
  the rendered manifests. See section 2.4 and section 8.

---

## 2. Set up Helm 2 on your cluster

### 2.1 The client

Pick the Helm 2 version to use and keep it the same everywhere (client and Tiller). This guide uses **2.17.0**,
the last Helm 2 release.

**Native binary:**

```bash
curl -fsSL https://get.helm.sh/helm-v2.17.0-darwin-amd64.tar.gz | tar xz
```

```bash
sudo mv darwin-amd64/helm /usr/local/bin/helm2
```

```bash
helm2 version --client --short
```

`Client: v2.17.0+g…`. On Apple Silicon this runs under Rosetta. Old Helm 2 builds are made with an old Go
toolchain, and on some macOS versions they **crash with a segmentation fault**. If yours does, use the
container version instead.

**Container version** (a Linux copy of the client, started per command). Create the kubeconfig it will use. It
must use the cluster's address as seen *from inside Docker's `kind` network*, so it has its own file:

```bash
mkdir -p ~/.helm2
```

```bash
kind get kubeconfig --internal --name local-cluster-1 > ~/.kube/kind-internal
```

Do these in this order. If `~/.kube/kind-internal` does not exist when Docker is asked to share it, Docker
creates an **empty folder** with that name and everything after fails. (This container setup is for kind. On k3d, use the native binary.)

Then define a shell function (put it in `~/.zshrc` to keep it):

```bash
helm2() {
  docker run --rm -i --platform linux/amd64 --network kind \
    -v "$HOME/.kube/kind-internal:/root/.kube/config:ro" \
    -v "$HOME/.helm2:/root/.helm" \
    -v "$PWD:/work" -w /work \
    --entrypoint helm lachlanevenson/k8s-helm:v2.17.0 "$@"
}
```

Line by line:

- `docker run --rm -i` — run Helm in a throwaway container.
- `--platform linux/amd64` — the image is Intel-only; Docker emulates it on Apple Silicon.
- `--network kind` — join the network where the cluster's API server has the name the internal kubeconfig uses.
- `-v …kind-internal:/root/.kube/config:ro` — hand Helm the kubeconfig, read-only.
- `-v ~/.helm2:/root/.helm` — keep Helm's settings and repository cache between runs.
- `-v "$PWD:/work" -w /work` — make the current folder visible inside, so `helm2 install ./myapp` finds your chart.
- `--entrypoint helm … "$@"` — run `helm` with whatever arguments you typed.

Check that the image tag exists (`docker pull lachlanevenson/k8s-helm:v2.17.0`); any image that contains the
Helm 2 client works the same way.

### 2.2 Tiller: its account and its permission

```bash
kubectl -n kube-system create serviceaccount tiller
```

```bash
kubectl create clusterrolebinding tiller --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
```

This gives Tiller `cluster-admin`, which is the easy lab setup and the unsafe one (section 2.4).

### 2.3 Install Tiller, matching the client version

```bash
docker pull --platform linux/amd64 ghcr.io/helm/tiller:v2.17.0
```

Tiller's image is Intel-only too. On Apple Silicon, turn on *Use Rosetta for x86_64/amd64 emulation* in Docker
Desktop first.

```bash
helm2 init --service-account tiller --tiller-image ghcr.io/helm/tiller:v2.17.0 --stable-repo-url https://charts.helm.sh/stable
```

```bash
kubectl -n kube-system rollout status deploy/tiller-deploy
```

```bash
helm2 version --short
```

```
Client: v2.17.0+g…
Server: v2.17.0+g…
```

Both lines must show the same version.

**If `helm2 init` fails, you are probably on an older Helm 2 (2.10–2.14).** Those describe Tiller as an
`extensions/v1beta1` Deployment, which modern Kubernetes removed. Have Helm print the description instead of
applying it, rewrite it to `apps/v1`, and apply that with kubectl:

```bash
helm2 init --service-account tiller --tiller-image ghcr.io/helm/tiller:v2.10.0 --stable-repo-url https://charts.helm.sh/stable --output yaml | perl -pe 's#^apiVersion: extensions/v1beta1#apiVersion: apps/v1#; s#^(\s+)replicas: 1#$1replicas: 1\n$1selector: {matchLabels: {app: helm, name: tiller}}#' | kubectl apply -f -
```

The `perl` part changes the API version and adds the `selector` that `apps/v1` requires. Then finish the
client side with `helm2 init --client-only --stable-repo-url https://charts.helm.sh/stable`.

### 2.4 Tiller's security problem, and the habit that follows

- Tiller with `cluster-admin` lets anyone who can reach it do anything in the cluster.
- **Release data is stored as ConfigMaps in `kube-system`**, including your values. A secret passed to a chart
  can be read by anyone who may read ConfigMaps there.

The habit: **do not put real secrets in values or in chart templates.** Create them separately (section 8) and
let the chart only reference them by name. A tighter setup (Tiller per namespace with a limited Role) exists
but is more work; see the Helm 2 docs on "securing your Helm installation".

---

## 3. What a chart is made of

```
myapp/
├── Chart.yaml            name, version, description of the chart
├── values.yaml           the default settings
├── requirements.yaml     other charts this one depends on (optional)
├── .helmignore           files to leave out of the package
├── files/
│   └── app.conf          plain files the templates can read
├── charts/               downloaded dependency charts (filled by `helm dep update`)
└── templates/
    ├── _helpers.tpl          named snippets reused by the other templates (no object created)
    ├── NOTES.txt             message printed after install
    ├── serviceaccount.yaml   the pod's identity
    ├── imagepullsecret.yaml  the registry login ("regsecret")
    ├── configmap.yaml        settings
    ├── secret.yaml           credentials
    ├── deployment.yaml       the app itself
    ├── service.yaml          a stable name and address for the pods
    ├── ingress.yaml          HTTP routing from outside
    ├── hpa.yaml              autoscaling the pods
    ├── pdb.yaml              limit disruption during node maintenance
    ├── networkpolicy.yaml    who may talk to the pods
    ├── pvc.yaml              storage
    ├── job-migrate.yaml      a task to run before each install or upgrade (a hook)
    ├── cronjob.yaml          a scheduled task
    └── tests/
        └── test-connection.yaml   a check run by `helm test`
```

Every file in `templates/` that does not start with `_` is rendered, and each document in it becomes a
Kubernetes object. Files that render to nothing (a switched-off `{{ if }}`) are simply skipped.

---

## 4. The template language in ten minutes

Templates are Go templates. Anything inside `{{ }}` is evaluated; the rest is copied as is.

**Where values come from:**

| Expression | Value |
| --- | --- |
| `.Values.image.tag` | A setting from `values.yaml`, `-f file` or `--set` |
| `.Release.Name` | The name you gave the release |
| `.Release.Namespace` | The namespace it is installed into |
| `.Release.Revision` | 1 for install, then 2, 3… on each upgrade |
| `.Release.IsInstall` / `.Release.IsUpgrade` | true on the matching operation |
| `.Release.Service` | `Tiller` in Helm 2 |
| `.Chart.Name`, `.Chart.Version`, `.Chart.AppVersion` | From `Chart.yaml` |
| `.Template.BasePath` | The `templates/` folder, for including another file |
| `.Files.Get "files/app.conf"` | The text of a file in the chart |
| `.Capabilities.APIVersions.Has "x/v1"` | Whether the cluster supports an API |

**What to do with them:**

| Syntax | Meaning |
| --- | --- |
| `{{ .Values.x \| quote }}` | Pipe a value through a function, here wrapping it in quotes |
| `{{ default "a" .Values.x }}` | Use `"a"` if `x` is empty |
| `{{ required "x is required" .Values.x }}` | Stop with an error if `x` is empty |
| `{{ if .Values.x }} … {{ else }} … {{ end }}` | Conditional |
| `{{ range $k, $v := .Values.map }} … {{ end }}` | Loop |
| `{{ with .Values.x }} … {{ end }}` | Run only if set, and make `.` mean `x` inside |
| `{{ toYaml .Values.x \| indent 8 }}` | Turn a value into YAML and indent it 8 spaces |
| `{{ include "myapp.fullname" . }}` | Run a named snippet from `_helpers.tpl` |
| `{{ printf "%s-%s" a b }}` | Build a string |
| `{{ .Values.x \| b64enc }}`, `sha256sum`, `trunc 63` | Encode, hash, shorten |

**Two details that cause most template bugs:**

- **`{{-` and `-}}` trim whitespace** on that side, including newlines. `{{- if … }}` removes the line break
  before it, which keeps the output free of blank lines.
- **Inside `range` and `with`, `.` changes.** To reach the top-level values from inside, save what you need
  first (`{{- $fullName := include "myapp.fullname" . -}}`) or use `$` (the root).

**Helm 2 limits.** There is no `lookup` function (Helm 3 only). Use `indent`, not `nindent` (older Helm 2
versions do not have it). A release name may be at most 53 characters.

---

## 5. Build the chart, file by file

Start in the folder where you keep your work:

```bash
mkdir -p myapp/templates/tests myapp/files
```

### 5.1 `Chart.yaml`: the chart's identity

```bash
cat > myapp/Chart.yaml <<'EOF'
apiVersion: v1
name: myapp
version: 0.1.0
appVersion: "1.0"
description: A sample web app
EOF
```

- `apiVersion: v1` — **Helm 2 charts use `v1`.** `v2` is for Helm 3 charts and Helm 2 rejects it.
- `name` — the chart's name; must match the folder.
- `version` — the version of the **chart** (bump it when you change the templates).
- `appVersion` — the version of the **application** inside (informational).

### 5.2 `values.yaml`: every setting in one place

The defaults for everything the templates read. A chart with a good `values.yaml` needs no template edits for
a new environment.

```bash
cat > myapp/values.yaml <<'EOF'
nameOverride: ""
fullnameOverride: ""

replicaCount: 2

image:
  repository: nginx
  tag: "1.27"
  pullPolicy: IfNotPresent

# The registry login. Prefer to create it with kubectl (section 8) and only give the name here.
imagePullSecret:
  name: ""                  # e.g. regsecret
  create: false             # true = build it from the values below (see warning in section 8)
  registry: ""
  username: ""
  password: ""
  email: ""

serviceAccount:
  create: true
  name: ""
  automountToken: false     # most apps never call the Kubernetes API

podAnnotations: {}
podSecurityContext: {}
securityContext: {}

env:                        # plain environment variables
  APP_MODE: production

config:                     # becomes a ConfigMap, loaded as environment variables
  LOG_LEVEL: info
  FEATURE_X: "true"

secret:
  existingSecret: ""        # name of a Secret you created yourself (recommended)
  create: false             # true = the chart makes one from `data` below
  data: {}                  # DB_PASSWORD: ""

service:
  type: ClusterIP
  port: 80
  targetPort: 80

ingress:
  enabled: false
  className: ""
  annotations: {}
  hosts:
    - host: myapp.local
      paths:
        - /
  tls: []

resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 200m
    memory: 128Mi

livenessProbe:
  httpGet:
    path: /
    port: http
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /
    port: http
  periodSeconds: 5

autoscaling:
  enabled: false
  minReplicas: 2
  maxReplicas: 6
  targetCPUUtilizationPercentage: 70

pdb:
  enabled: true
  minAvailable: 1

networkPolicy:
  enabled: false

persistence:
  enabled: false
  size: 1Gi
  storageClass: ""
  mountPath: /data

migration:
  enabled: false
  command: ["sh", "-c", "echo migrating"]

cronjob:
  enabled: false
  schedule: "0 * * * *"
  command: ["sh", "-c", "echo hourly"]

nodeSelector: {}
tolerations: []
affinity: {}
EOF
```

The rule behind the layout: **every behaviour a team might want to change is a value**, and every optional
object has an `enabled` (or `create`) switch so it can be turned off without editing a template.

### 5.3 `templates/_helpers.tpl`: names and labels, defined once

A file starting with `_` renders nothing. It holds named snippets that the other templates call with
`include`. Without it, every template would repeat the same naming and label logic.

```bash
cat > myapp/templates/_helpers.tpl <<'EOF'
{{- define "myapp.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "myapp.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "myapp.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "myapp.selectorLabels" -}}
app.kubernetes.io/name: {{ include "myapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "myapp.labels" -}}
helm.sh/chart: {{ include "myapp.chart" . }}
{{ include "myapp.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "myapp.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "myapp.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{- define "myapp.secretName" -}}
{{- default (include "myapp.fullname" .) .Values.secret.existingSecret -}}
{{- end -}}
EOF
```

What each snippet gives you:

- `myapp.fullname` — the name used for every object: `<release>-<chart>` (cut to 63 characters, the Kubernetes
  limit). Two releases of the same chart in one namespace never collide, because the release name differs.
- `myapp.selectorLabels` — the **two labels that identify this release's pods**. The Deployment's selector and
  the Service's selector both use exactly these. **They must never change after the first install**: a
  Deployment's selector cannot be edited.
- `myapp.labels` — the selector labels plus the standard descriptive ones (`app.kubernetes.io/…`), put on every
  object so `kubectl get all -l app.kubernetes.io/instance=<release>` finds the whole release.
- `myapp.serviceAccountName` / `myapp.secretName` — "the one this chart created, or the one the user named".

### 5.4 `serviceaccount.yaml`: the pod's identity

```bash
cat > myapp/templates/serviceaccount.yaml <<'EOF'
{{- if .Values.serviceAccount.create }}
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ include "myapp.serviceAccountName" . }}
  labels:
{{ include "myapp.labels" . | indent 4 }}
automountServiceAccountToken: {{ .Values.serviceAccount.automountToken }}
{{- end }}
EOF
```

- Pods use the namespace's shared `default` account unless told otherwise. A dedicated account per app means
  its permissions (if any) can be set per app. See [00-concepts-user-permissions.md](00-concepts-user-permissions.md).
- `automountServiceAccountToken: false` stops Kubernetes from putting an API token inside the pod. An app that
  never calls the API should not have one.
- The file also shows the standard pattern: `{{- if … }}` wraps the whole object, so one value switches it
  on or off.
- To give the app API permissions, add a `role.yaml` (a Role) and `rolebinding.yaml` for this account.

### 5.5 `imagepullsecret.yaml`: the registry login (`regsecret`)

Needed only when the image lives in a **private registry**. The public images (`nginx`, `redis`) and the local
registry from [03-run-your-image.md](03-run-your-image.md) need none. A pod that cannot pull shows
`ImagePullBackOff`, with `pull access denied` in `kubectl describe pod`.

`regsecret` is simply the conventional name for this Secret. Its type is `kubernetes.io/dockerconfigjson`, and
it holds a Docker login.

**The recommended way is to create it outside the chart** (so the password never enters a release record):

```bash
kubectl create secret docker-registry regsecret --docker-server=registry.example.com --docker-username=<user> --docker-password=<password> --docker-email=<email> -n web
```

Then the chart only needs the name: `--set imagePullSecret.name=regsecret`.

**If the chart must create it**, this template builds it from values:

```bash
cat > myapp/templates/imagepullsecret.yaml <<'EOF'
{{- if .Values.imagePullSecret.create }}
apiVersion: v1
kind: Secret
metadata:
  name: {{ required "imagePullSecret.name is required" .Values.imagePullSecret.name }}
  labels:
{{ include "myapp.labels" . | indent 4 }}
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: {{ include "myapp.dockerconfigjson" . | b64enc }}
{{- end }}
EOF
```

and a helper that builds the JSON. Add it to `_helpers.tpl`:

```bash
cat >> myapp/templates/_helpers.tpl <<'EOF'

{{- define "myapp.dockerconfigjson" -}}
{{- $auth := printf "%s:%s" .Values.imagePullSecret.username .Values.imagePullSecret.password | b64enc -}}
{{- printf "{\"auths\":{\"%s\":{\"username\":\"%s\",\"password\":\"%s\",\"email\":\"%s\",\"auth\":\"%s\"}}}" .Values.imagePullSecret.registry .Values.imagePullSecret.username .Values.imagePullSecret.password .Values.imagePullSecret.email $auth -}}
{{- end -}}
EOF
```

How the pod uses it: the Deployment (5.8) lists `imagePullSecrets: - name: regsecret`. Alternatively, attach it to
the ServiceAccount once, and every pod using that account gets it automatically.

Careful: a password with a `"` in it breaks the JSON above, and the password ends up in the release record
(section 2.4). That is why `kubectl create secret docker-registry` is the better choice.

### 5.6 `configmap.yaml`: settings

For settings that are not secret: log level, feature flags, URLs, whole config files.

```bash
cat > myapp/templates/configmap.yaml <<'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
{{ include "myapp.labels" . | indent 4 }}
data:
{{- range $key, $value := .Values.config }}
  {{ $key }}: {{ $value | quote }}
{{- end }}
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "myapp.fullname" . }}-files
  labels:
{{ include "myapp.labels" . | indent 4 }}
data:
  app.conf: |
{{ .Files.Get "files/app.conf" | indent 4 }}
EOF
```

```bash
cat > myapp/files/app.conf <<'EOF'
# example config file, shipped inside the chart
greeting = hello
EOF
```

Two ConfigMaps, for two ways to deliver settings:

- **As environment variables.** The first one holds key/value pairs from `values.yaml`; the Deployment loads
  them all with `envFrom`. Quote every value (`| quote`): environment variables are strings, and a bare
  `true` or `8080` would be rendered as a boolean or number and rejected.
- **As files.** The second holds a whole file read from the chart (`.Files.Get`), which the Deployment mounts
  as a file. Keep it separate from the first: a key like `app.conf` is not a valid environment variable name.

**A ConfigMap change does not restart pods by itself.** The Deployment (5.8) carries a checksum of the
ConfigMap in an annotation, so a changed ConfigMap changes the pod template, which makes Kubernetes roll the
pods.

### 5.7 `secret.yaml`: credentials

```bash
cat > myapp/templates/secret.yaml <<'EOF'
{{- if and .Values.secret.create (not .Values.secret.existingSecret) }}
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
{{ include "myapp.labels" . | indent 4 }}
type: Opaque
stringData:
{{- range $key, $value := .Values.secret.data }}
  {{ $key }}: {{ $value | quote }}
{{- end }}
{{- end }}
EOF
```

- `stringData` takes plain text and lets the API server store it encoded. (Under `data` you would have to
  base64-encode each value yourself.)
- The chart only creates the Secret when `secret.create` is true **and** no `existingSecret` is named. The
  recommended pattern is the opposite: create the Secret yourself (section 8) and set
  `secret.existingSecret=<name>`, so the credentials never pass through Helm.
- **A base64 Secret is not encrypted**, only encoded. Protect it with permissions
  ([00-concepts-user-permissions.md](00-concepts-user-permissions.md)) and, on a real cluster, encryption at
  rest.
- Do not generate random passwords in the template (`randAlphaNum`): every upgrade would generate a new one and
  Helm 2 has no `lookup` to read the old one.

### 5.8 `deployment.yaml`: the application

The most important file. It keeps N copies of your container running and replaces them safely on change.

```bash
cat > myapp/templates/deployment.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
{{ include "myapp.labels" . | indent 4 }}
spec:
{{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
{{- end }}
  selector:
    matchLabels:
{{ include "myapp.selectorLabels" . | indent 6 }}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
        checksum/secret: {{ include (print $.Template.BasePath "/secret.yaml") . | sha256sum }}
      {{- with .Values.podAnnotations }}
{{ toYaml . | indent 8 }}
      {{- end }}
      labels:
{{ include "myapp.selectorLabels" . | indent 8 }}
    spec:
      serviceAccountName: {{ include "myapp.serviceAccountName" . }}
      {{- if .Values.imagePullSecret.name }}
      imagePullSecrets:
        - name: {{ .Values.imagePullSecret.name }}
      {{- end }}
      {{- with .Values.podSecurityContext }}
      securityContext:
{{ toYaml . | indent 8 }}
      {{- end }}
      terminationGracePeriodSeconds: 30
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ required "image.tag is required" .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          {{- with .Values.securityContext }}
          securityContext:
{{ toYaml . | indent 12 }}
          {{- end }}
          ports:
            - name: http
              containerPort: {{ .Values.service.targetPort }}
              protocol: TCP
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
          {{- range $key, $value := .Values.env }}
            - name: {{ $key }}
              value: {{ $value | quote }}
          {{- end }}
          envFrom:
            - configMapRef:
                name: {{ include "myapp.fullname" . }}
            - secretRef:
                name: {{ include "myapp.secretName" . }}
                optional: true
          livenessProbe:
{{ toYaml .Values.livenessProbe | indent 12 }}
          readinessProbe:
{{ toYaml .Values.readinessProbe | indent 12 }}
          resources:
{{ toYaml .Values.resources | indent 12 }}
          volumeMounts:
            - name: files
              mountPath: /etc/myapp
              readOnly: true
          {{- if .Values.persistence.enabled }}
            - name: data
              mountPath: {{ .Values.persistence.mountPath }}
          {{- end }}
      volumes:
        - name: files
          configMap:
            name: {{ include "myapp.fullname" . }}-files
      {{- if .Values.persistence.enabled }}
        - name: data
          persistentVolumeClaim:
            claimName: {{ include "myapp.fullname" . }}
      {{- end }}
      {{- with .Values.nodeSelector }}
      nodeSelector:
{{ toYaml . | indent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
{{ toYaml . | indent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
{{ toYaml . | indent 8 }}
      {{- end }}
EOF
```

What each part does:

- **`apiVersion: apps/v1`** — the current API for Deployments. Older charts say `extensions/v1beta1` or
  `apps/v1beta1`, which modern Kubernetes removed. `apps/v1` also **requires `selector`**.
- **`replicas`** is left out when the autoscaler is on. If both set it, every upgrade would reset the count
  the autoscaler chose.
- **`selector.matchLabels`** — how the Deployment recognises its pods. It must match the pod template's labels
  and, once created, cannot be changed.
- **`strategy`** — `maxUnavailable: 0, maxSurge: 1` means "start one new pod, wait until it is ready, then stop
  one old pod": an update never drops below the full count.
- **`checksum/config`, `checksum/secret`** — hashes of those two files inside the pod template. Change a
  ConfigMap or Secret value and the hash changes, the pod template changes, and Kubernetes rolls the pods so
  they pick up the new settings.
- **`imagePullSecrets`** — the registry login from 5.5, only when a name is set.
- **`podSecurityContext` / `securityContext`** — run as non-root, drop privileges, read-only filesystem. Empty
  by default because it depends on the image; for an app you control, set `runAsNonRoot: true`,
  `allowPrivilegeEscalation: false`, `readOnlyRootFilesystem: true` and drop all capabilities.
- **`image`** — `repository:tag`. `required` makes the install fail with a clear message if no tag was given.
  Use a specific tag (`1.27`, a commit hash), never `latest`.
- **`env`** — the `POD_NAME` entry shows `valueFrom: fieldRef`, a value Kubernetes fills in (pod name, namespace,
  node name); the loop adds plain entries from `values.env`. To take a single key from a Secret, use
  `valueFrom: secretKeyRef: {name: …, key: …}`.
- **`envFrom`** — loads **every** key of the ConfigMap and the Secret as environment variables. `optional: true`
  lets the pod start when the Secret does not exist yet.
- **`livenessProbe`** — "is it stuck?" On failure, Kubernetes **restarts** the container.
- **`readinessProbe`** — "can it take traffic?" On failure, the pod is **taken out of the Service**, not
  restarted. This is what makes rolling updates safe. (A `startupProbe`, for slow-starting apps, holds off the
  other two until the first start succeeds.)
- **`resources`** — `requests` is what the scheduler reserves for the pod; `limits` is the ceiling. Without
  requests, autoscaling by CPU does not work. A pod over its memory limit is killed; over its CPU limit it is
  slowed down.
- **`volumeMounts` / `volumes`** — the files ConfigMap mounted as a read-only folder, and optionally the
  persistent volume from 5.13.
- **`nodeSelector`, `affinity`, `tolerations`** — placement, as in
  [04-deployment.md](04-deployment.md) and [00-concepts.md](00-concepts.md). Spread the replicas over nodes with a
  pod anti-affinity rule, passed as a value:

```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          topologyKey: kubernetes.io/hostname
          labelSelector:
            matchLabels:
              app.kubernetes.io/name: myapp
```

- **`terminationGracePeriodSeconds`** — how long a pod gets to finish in-flight requests after it is told to
  stop. Raise it for slow shutdowns.

**Namespaces:** none of these files sets `metadata.namespace`. The namespace comes from
`helm install --namespace web`, so the same chart installs anywhere.

### 5.9 `service.yaml`: a stable name for the pods

```bash
cat > myapp/templates/service.yaml <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
{{ include "myapp.labels" . | indent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - name: http
      port: {{ .Values.service.port }}
      targetPort: http
      protocol: TCP
  selector:
{{ include "myapp.selectorLabels" . | indent 4 }}
EOF
```

- `selector` — the **same** selector labels as the Deployment. This is how the Service finds the pods.
- `port` — the Service's port. `targetPort: http` — the container port **by name** (`http` from the
  Deployment), so the number lives in one place.
- `type` — `ClusterIP` (inside the cluster only), `NodePort` (a fixed port on every node), `LoadBalancer`
  (an external address from the cloud or from k3d's load balancer).
- Other pods reach it as `<release>-myapp` (same namespace) or `<release>-myapp.<namespace>`.

### 5.10 `ingress.yaml`: HTTP routing from outside

Needs an ingress controller in the cluster (k3d bundles Traefik; on kind install one).

```bash
cat > myapp/templates/ingress.yaml <<'EOF'
{{- if .Values.ingress.enabled }}
{{- $fullName := include "myapp.fullname" . -}}
{{- $svcPort := .Values.service.port -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ $fullName }}
  labels:
{{ include "myapp.labels" . | indent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
{{ toYaml . | indent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}
  {{- end }}
  {{- if .Values.ingress.tls }}
  tls:
  {{- range .Values.ingress.tls }}
    - hosts:
      {{- range .hosts }}
        - {{ . | quote }}
      {{- end }}
      secretName: {{ .secretName }}
  {{- end }}
  {{- end }}
  rules:
  {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
        {{- range .paths }}
          - path: {{ . }}
            pathType: Prefix
            backend:
              service:
                name: {{ $fullName }}
                port:
                  number: {{ $svcPort }}
        {{- end }}
  {{- end }}
{{- end }}
EOF
```

- `networking.k8s.io/v1` is the current API (Kubernetes 1.19 and later). The older `extensions/v1beta1` and
  `networking.k8s.io/v1beta1` Ingresses are removed from current clusters. To support old and new clusters,
  branch on `.Capabilities.APIVersions.Has "networking.k8s.io/v1"`.
- `$fullName` and `$svcPort` are saved at the top because `.` changes meaning inside the `range` loops.
- `tls` names a Secret holding the certificate (type `kubernetes.io/tls`), created by hand or by cert-manager.
- `annotations` carry controller-specific settings, for example `nginx.ingress.kubernetes.io/proxy-body-size`.

### 5.11 `hpa.yaml`: autoscaling the pods

```bash
cat > myapp/templates/hpa.yaml <<'EOF'
{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
{{ include "myapp.labels" . | indent 4 }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "myapp.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
{{- end }}
EOF
```

- Adds pods when average CPU use passes the target (a percentage **of the pod's CPU request**, so requests are
  required), and removes them when it falls.
- Needs metrics-server (bundled with k3s; install it on kind).
- `autoscaling/v2` needs Kubernetes 1.23 or later; on older clusters use `autoscaling/v2beta2`.
- This is **pod** autoscaling. Adding nodes is a different system.

### 5.12 `pdb.yaml`: stay available during maintenance

```bash
cat > myapp/templates/pdb.yaml <<'EOF'
{{- if .Values.pdb.enabled }}
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
{{ include "myapp.labels" . | indent 4 }}
spec:
  minAvailable: {{ .Values.pdb.minAvailable }}
  selector:
    matchLabels:
{{ include "myapp.selectorLabels" . | indent 6 }}
{{- end }}
EOF
```

When someone drains a node (`kubectl drain`, an upgrade), Kubernetes evicts its pods. A PodDisruptionBudget
says "never take me below this many pods": a drain waits instead of evicting the last healthy copy. It only
helps with more than one replica; with `minAvailable: 1` and one replica, a drain would block forever. Needs
Kubernetes 1.21 or later for `policy/v1`.

### 5.13 `pvc.yaml`: storage that outlives the pod

```bash
cat > myapp/templates/pvc.yaml <<'EOF'
{{- if .Values.persistence.enabled }}
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
{{ include "myapp.labels" . | indent 4 }}
spec:
  accessModes:
    - ReadWriteOnce
  {{- if .Values.persistence.storageClass }}
  storageClassName: {{ .Values.persistence.storageClass }}
  {{- end }}
  resources:
    requests:
      storage: {{ .Values.persistence.size }}
{{- end }}
EOF
```

A claim asks the cluster for a disk. `ReadWriteOnce` means one node at a time. In a lab, the default storage
class (bundled in k3s and kind) hands out a local directory. With several replicas and `ReadWriteOnce`, use a
StatefulSet with `volumeClaimTemplates` instead, so each pod gets its own disk (see the end of this section).

### 5.14 `networkpolicy.yaml`: who may talk to the pods

```bash
cat > myapp/templates/networkpolicy.yaml <<'EOF'
{{- if .Values.networkPolicy.enabled }}
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
{{ include "myapp.labels" . | indent 4 }}
spec:
  podSelector:
    matchLabels:
{{ include "myapp.selectorLabels" . | indent 6 }}
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector: {}
      ports:
        - port: {{ .Values.service.targetPort }}
{{- end }}
EOF
```

By default every pod can reach every other pod. This allows traffic to the app's port only from other pods in
the **same namespace** and drops the rest. Add another `from` entry (`namespaceSelector`) for an ingress
controller in a different namespace. It does nothing unless the cluster's network plugin enforces policies (see
[00-concepts-user-permissions.md](00-concepts-user-permissions.md)).

### 5.15 `job-migrate.yaml`: a hook that runs before each install or upgrade

A **hook** is an object Helm runs at a point in the release's life, instead of installing it with the rest.
The classic use is a database migration.

```bash
cat > myapp/templates/job-migrate.yaml <<'EOF'
{{- if .Values.migration.enabled }}
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "myapp.fullname" . }}-migrate-{{ .Release.Revision }}
  labels:
{{ include "myapp.labels" . | indent 4 }}
  annotations:
    "helm.sh/hook": pre-install,pre-upgrade
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": hook-succeeded,before-hook-creation
spec:
  backoffLimit: 1
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          command:
{{ toYaml .Values.migration.command | indent 12 }}
{{- end }}
EOF
```

- `helm.sh/hook: pre-install,pre-upgrade` — run it **before** the rest is created or changed. Others:
  `post-install`, `post-upgrade`, `pre-delete`, `post-delete`, `pre-rollback`, `post-rollback`, `test-success`.
- `hook-weight` — the order among several hooks (lowest first).
- `hook-delete-policy` — `hook-succeeded` removes the Job when it finishes OK; `before-hook-creation` removes
  an old copy first so a repeat run does not collide.
- Helm waits for the hook Job to finish. If it fails, the install or upgrade fails and nothing else is changed.
- **A pre-install hook runs before the chart's ConfigMap and Secret exist.** If the job needs them, create them
  first (section 8), or mark those objects as hooks with a lower weight.

### 5.16 `cronjob.yaml`: a scheduled task

```bash
cat > myapp/templates/cronjob.yaml <<'EOF'
{{- if .Values.cronjob.enabled }}
apiVersion: batch/v1
kind: CronJob
metadata:
  name: {{ include "myapp.fullname" . }}-cron
  labels:
{{ include "myapp.labels" . | indent 4 }}
spec:
  schedule: {{ .Values.cronjob.schedule | quote }}
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 1
  failedJobsHistoryLimit: 3
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: cron
              image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
              command:
{{ toYaml .Values.cronjob.command | indent 16 }}
{{- end }}
EOF
```

Runs a container on a schedule (cron syntax). `concurrencyPolicy: Forbid` skips a run if the previous one is
still going. `batch/v1` needs Kubernetes 1.21 or later.

### 5.17 `NOTES.txt`: what to tell the user after install

Printed by `helm install` and `helm status`. Not a Kubernetes object.

```bash
cat > myapp/templates/NOTES.txt <<'EOF'
{{ .Chart.Name }} {{ .Chart.AppVersion }} is installed as release "{{ .Release.Name }}" in namespace "{{ .Release.Namespace }}".

{{- if .Values.ingress.enabled }}
Open:
{{- range .Values.ingress.hosts }}
  http://{{ .host }}
{{- end }}
{{- else }}
Reach it from your local machine:
  kubectl port-forward svc/{{ include "myapp.fullname" . }} 8080:{{ .Values.service.port }} --namespace {{ .Release.Namespace }}
  curl http://localhost:8080
{{- end }}
EOF
```

### 5.18 `tests/test-connection.yaml`: a built-in check

```bash
cat > myapp/templates/tests/test-connection.yaml <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: "{{ include "myapp.fullname" . }}-test"
  labels:
{{ include "myapp.labels" . | indent 4 }}
  annotations:
    "helm.sh/hook": test-success
spec:
  restartPolicy: Never
  containers:
    - name: wget
      image: busybox:1.36
      command: ["wget"]
      args: ["-qO-", "{{ include "myapp.fullname" . }}:{{ .Values.service.port }}"]
EOF
```

A pod that only runs when you type `helm2 test <release>`. If it exits successfully the test passes. It proves
the Service resolves and answers.

### 5.19 `.helmignore`

```bash
cat > myapp/.helmignore <<'EOF'
.git/
*.swp
*.bak
*.tmp
EOF
```

Files listed here are left out when the chart is packaged. Same idea as `.gitignore`.

### 5.20 `requirements.yaml`: other charts you depend on

If your app needs Redis or Postgres, depend on their charts instead of writing them:

```yaml
dependencies:
  - name: redis
    version: "<pick one with: helm2 search stable/redis -l>"
    repository: https://charts.helm.sh/stable
    condition: redis.enabled
```

```bash
helm2 dependency update myapp
```

Downloads the dependency into `myapp/charts/`. `condition: redis.enabled` lets a user switch it off with a value.
Settings for the dependency go under its name in your values (`redis: {…}`). **Helm 2 uses `requirements.yaml`
next to `Chart.yaml`; Helm 3 puts dependencies inside `Chart.yaml`.**

### 5.21 Other objects you may add

| File | When you need it |
| --- | --- |
| `statefulset.yaml` | The app needs a stable identity and its own disk per pod (databases, queues): pods are named `name-0`, `name-1`, … and each gets a volume from `volumeClaimTemplates`. Replaces `deployment.yaml`, and needs a **headless Service** (`clusterIP: None`) named in `serviceName` |
| `role.yaml` + `rolebinding.yaml` | The app itself calls the Kubernetes API (a controller, an operator). Grant only the verbs it uses to the chart's ServiceAccount |
| `daemonset.yaml` | One pod on every node (log shippers, node monitors) |
| `servicemonitor.yaml` | You run Prometheus Operator and want the app's metrics scraped |
| `resourcequota.yaml`, `limitrange.yaml` | Usually **not** in an app chart: they belong to the namespace, set once by whoever owns the cluster |
| CRDs in `crds/` | Helm 2 has no special CRD handling (Helm 3 adds a `crds/` folder). Install CRDs separately |

---

## 6. Check the chart before installing it

**Is it well-formed?**

```bash
helm2 lint myapp
```

`1 chart(s) linted, no failures`. Warnings such as `icon is recommended` are harmless.

**What would it produce?** Render the templates locally. This needs no Tiller and changes nothing:

```bash
helm2 template myapp --name demo --namespace web
```

Read the output. Look for objects missing, indentation wrong, empty values. Render one file:

```bash
helm2 template myapp --name demo --namespace web -x templates/deployment.yaml
```

With settings:

```bash
helm2 template myapp --name demo --namespace web --set replicaCount=3,ingress.enabled=true
```

**Ask the server to check it too** (renders, validates against the API, installs nothing):

```bash
helm2 install myapp --name demo --namespace web --dry-run --debug
```

---

## 7. Install, upgrade, roll back, remove

Make sure `web` exists (`kubectl get ns web`) and that `kubectl config current-context` is your lab cluster.

**Install:**

```bash
helm2 install myapp --name demo --namespace web
```

- `myapp` — the chart folder. `--name demo` — the release name. `--namespace web` — where to put it.
- Prints the objects it created, then `NOTES.txt`.

```bash
helm2 ls
```

```
NAME   REVISION   UPDATED   STATUS     CHART       APP VERSION   NAMESPACE
demo   1          …         DEPLOYED   myapp-0.1.0 1.0           web
```

```bash
kubectl get all -n web -l app.kubernetes.io/instance=demo
```

Everything belonging to this release, found through the labels from `_helpers.tpl`.

**Test it:**

```bash
helm2 test demo
```

**Upgrade** — change an image tag or a setting, and Helm makes revision 2:

```bash
helm2 upgrade demo myapp --namespace web --set replicaCount=3 --set image.tag=1.27.1 --wait --timeout 300
```

- `--wait` — do not return until the pods are ready. `--timeout 300` — give up after 300 seconds.
- Settings you do not repeat **go back to the chart's defaults**, unless you add `--reuse-values`. This
  surprises everyone once. Keep your settings in files (section 9) and pass them every time.

**The command to use in a pipeline: install if new, upgrade if it exists:**

```bash
helm2 upgrade --install demo myapp --namespace web -f values.yaml --set image.tag=<tag> --wait --timeout 300
```

Add `--atomic` to roll back automatically if the upgrade fails.

**Look at what is installed:**

```bash
helm2 status demo
```

```bash
helm2 get values demo
```

```bash
helm2 get manifest demo
```

`get values` shows the settings used; `get manifest` the exact YAML Helm applied.

**History and rollback:**

```bash
helm2 history demo
```

```bash
helm2 rollback demo 1
```

Goes back to revision 1's chart and values, as a new revision 3.

**Remove it:**

```bash
helm2 delete demo --purge
```

Deletes every object and the release record. Without `--purge`, Helm 2 keeps the record and **the name cannot be
reused**.

---

## 8. Secrets and credentials: keep them out of the release

Helm 2 stores each release, including its values, as a ConfigMap in `kube-system`. So:

**Create credentials yourself, once, outside Helm:**

```bash
kubectl create secret generic demo-app -n web --from-literal=DB_PASSWORD=change-me
```

```bash
kubectl create secret docker-registry regsecret -n web --docker-server=registry.example.com --docker-username=<user> --docker-password=<password>
```

**Point the chart at them by name:**

```bash
helm2 upgrade --install demo myapp --namespace web --set secret.existingSecret=demo-app --set imagePullSecret.name=regsecret
```

The chart then carries only names, never values. Rotating a password means updating the Secret and restarting
the pods (`kubectl rollout restart deployment/demo-myapp -n web`).

For team use, keep Secrets in git **encrypted**, with Sealed Secrets, SOPS or an external secrets operator that
syncs from a vault. Never commit a plain `values-secret.yaml`.

---

## 9. One chart, many environments

The same chart deploys every environment; only the values change. One file per environment, in git:

```bash
cat > values-dev.yaml <<'EOF'
replicaCount: 1
image:
  tag: "1.27"
ingress:
  enabled: true
  hosts:
    - host: myapp.dev.local
      paths: ["/"]
pdb:
  enabled: false
EOF
```

```bash
cat > values-prod.yaml <<'EOF'
replicaCount: 3
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
resources:
  requests: {cpu: 250m, memory: 256Mi}
  limits: {cpu: "1", memory: 512Mi}
networkPolicy:
  enabled: true
EOF
```

```bash
helm2 upgrade --install myapp-dev myapp --namespace dev -f values-dev.yaml
```

```bash
helm2 upgrade --install myapp-prod myapp --namespace prod -f values-prod.yaml --set image.tag=<tag>
```

**Which value wins** (last one beats earlier ones): the chart's `values.yaml`, then each `-f file` in the order
given, then `--set`. So the order is defaults → environment file → the one value the pipeline sets.

---

## 10. A checklist for "a perfect system"

| Area | Do this |
| --- | --- |
| **Naming and labels** | One `fullname` helper; the standard `app.kubernetes.io/*` labels on every object; never edit selector labels after the first install |
| **Image** | A specific tag or commit hash, never `latest`; a private registry uses `imagePullSecrets` (`regsecret`) created outside the chart |
| **Health** | A `readinessProbe` and a `livenessProbe` on every container |
| **Resources** | `requests` and `limits` on every container; autoscaling needs requests |
| **Availability** | At least 2 replicas, a rolling update with `maxUnavailable: 0`, a PodDisruptionBudget, anti-affinity to spread over nodes |
| **Config** | Non-secret settings in a ConfigMap; a checksum annotation so config changes roll the pods |
| **Secrets** | Created outside the chart, referenced by name; `existingSecret` pattern; encrypted in git |
| **Identity** | A ServiceAccount per app; no API token unless the app calls the API; a Role only if it does |
| **Security** | `runAsNonRoot`, `allowPrivilegeEscalation: false`, read-only root filesystem, dropped capabilities; Pod Security labels on the namespace |
| **Network** | A NetworkPolicy that allows only the traffic the app needs |
| **Data** | A migration hook (or init step) before the new version starts; PVCs or a StatefulSet for state |
| **Operations** | `NOTES.txt`; a `helm test`; `helm lint` and `helm template` in CI; `--atomic` or `--wait`; per-environment values files in git |
| **Portability** | `apps/v1`, `networking.k8s.io/v1` and similar current APIs; no hard-coded namespace; `.Capabilities` checks if you must support old clusters |

---

## 11. Helm 2 versus Helm 3

| | Helm 2 | Helm 3 |
| --- | --- | --- |
| Server in the cluster | Tiller (needs install, RBAC, version match) | None: Helm uses your own kubeconfig and permissions |
| Release records stored in | ConfigMaps in `kube-system` | Secrets in the release's own namespace |
| Release names | Global, unique across the cluster | Per namespace |
| `Chart.yaml` `apiVersion` | `v1`, dependencies in `requirements.yaml` | `v2`, dependencies inside `Chart.yaml` |
| Install | `helm install ./chart --name x` | `helm install x ./chart` |
| Delete | `helm delete x --purge` | `helm uninstall x` |
| Template function `lookup` | no | yes |
| CRDs | no special support | a `crds/` folder |

To move a running Helm 2 setup over, use the `helm 2to3` plugin, which converts releases in place.

---

## 12. When something goes wrong

| Message | Cause and fix |
| --- | --- |
| `Error: could not find tiller` | Tiller's pod is not ready: `kubectl -n kube-system rollout status deploy/tiller-deploy` |
| `Error: incompatible versions client[…] server[…]` | Client and Tiller differ. Reinstall one so both match (section 2) |
| `Error: no available release name found` | Tiller is reachable but has a problem, often its ServiceAccount permissions: recheck 2.2 |
| `Error: a release named demo already exists` | Use `helm2 upgrade --install`, or `helm2 delete demo --purge` first |
| `Error: UPGRADE FAILED: "demo" has no deployed releases` | The first install failed and left a record: `helm2 delete demo --purge`, then install again |
| `error converting YAML to JSON` / `did not find expected key` | Indentation or whitespace wrong in a template. Run `helm2 template` and read the output at the line number |
| `no matches for kind "X" in version "…"` | The template uses an API version your cluster does not have (or no longer has). Use a current one (5.8, 5.10) |
| `field is immutable` / `selector` error on upgrade | You changed the Deployment's selector. Delete the Deployment (`helm2 delete --purge`) and install again |
| Pods `ImagePullBackOff` | Wrong image or tag; private registry without `regsecret`; a local image not loaded ([03-run-your-image.md](03-run-your-image.md)) |
| Pods `CreateContainerConfigError` | A referenced ConfigMap or Secret key is missing; `kubectl describe pod` names it |
| `helm2: segmentation fault` | The native Helm 2 binary crashes on your OS: use the container version (2.1) |
| `~/.kube/kind-internal` is a directory | Docker made a folder because the file was missing: `rmdir` it, create the file, retry (2.1) |

---

## 13. Clean up

```bash
helm2 delete demo --purge
```

```bash
helm2 delete myapp-dev --purge
```

```bash
helm2 delete myapp-prod --purge
```

```bash
kubectl delete secret demo-app regsecret -n web
```

To remove Tiller itself:

```bash
kubectl -n kube-system delete deployment tiller-deploy
```

```bash
kubectl -n kube-system delete service tiller-deploy
```

```bash
kubectl delete clusterrolebinding tiller
```

```bash
kubectl -n kube-system delete serviceaccount tiller
```

Deleting the whole cluster ([06-clean-up.md](06-clean-up.md)) removes all of it, Tiller included.
