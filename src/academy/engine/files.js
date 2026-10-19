// The runnable example files shown in Simulate → Real files (ported from the tutorial prototype).
export const HELM_FILES={
'Chart.yaml':`apiVersion: v2
name: pizza-chart
description: A small chart for learning Helm
type: application
version: 0.1.0
appVersion: "1.27"
`,
'values.yaml':`replicaCount: 1
image:
  repository: nginx
  tag: "1.27"
`,
 'templates/deployment.yaml':`apiVersion: apps/v1
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
`,
 'templates/service.yaml':`apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}
spec:
  selector:
    app.kubernetes.io/instance: {{ .Release.Name }}
  ports:
  - port: 80
    targetPort: 80
`
};
export const DOCKER_FILES={
'app.py':`import os
import signal
import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import urlopen

UPSTREAM = os.getenv("UPSTREAM", "")
DB_PATH = os.getenv("DB_PATH", "/data/pizza.db")
PORT = int(os.getenv("PORT", "8000"))
if not UPSTREAM:
    with sqlite3.connect(DB_PATH) as db:
        db.execute("CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY, count INTEGER NOT NULL)")
        db.execute("INSERT OR IGNORE INTO visits VALUES (1, 0)")

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            if self.path == "/healthz":
                body = b"healthy\\n"
            elif self.path != "/":
                self.send_error(404)
                return
            elif UPSTREAM:
                with urlopen(UPSTREAM + "/", timeout=3) as response:
                    body = response.read()
            else:
                with sqlite3.connect(DB_PATH) as db:
                    db.execute("UPDATE visits SET count = count + 1 WHERE id = 1")
                    count = db.execute("SELECT count FROM visits WHERE id = 1").fetchone()[0]
                body = ("Pizza visits: " + str(count) + "\\n").encode()
            self.send_response(200)
        except Exception as error:
            print(type(error).__name__, flush=True)
            self.send_response(503)
            body = b"Backend unavailable. Check the api logs and UPSTREAM address.\\n"
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

def stop(signum, frame):
    raise SystemExit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGTERM, stop)
    with HTTPServer(("0.0.0.0", PORT), Handler) as server:
        print("Listening on port", PORT, flush=True)
        server.serve_forever()
`,
'Dockerfile':`# syntax=docker/dockerfile:1
FROM python:3.13-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1
RUN useradd --uid 10001 --create-home appuser \\
    && mkdir -p /data && chown appuser:appuser /data
COPY --chown=appuser:appuser app.py ./app.py
USER appuser
EXPOSE 8000
CMD ["python", "app.py"]
`,
'.dockerignore':`.git
.env
.env.*
*.db
__pycache__
*.pyc
`,
'compose.yaml':`name: pizza-learning
services:
  api:
    build: .
    environment:
      DB_PATH: /data/pizza.db
    volumes:
      - pizza-data:/data
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthz', timeout=2)"]
      interval: 3s
      timeout: 3s
      retries: 10
      start_period: 5s
    restart: unless-stopped
    init: true
    mem_limit: 128m
    cpus: 0.5
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
  web:
    build: .
    environment:
      UPSTREAM: http://api:8000
    ports:
      - "127.0.0.1:8080:8000"
    depends_on:
      api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthz', timeout=2)"]
      interval: 3s
      timeout: 3s
      retries: 10
    restart: unless-stopped
    init: true
    mem_limit: 128m
    cpus: 0.5
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
volumes:
  pizza-data:
`
};
export const TF_FILES={"main.tf": "# Pizza Express learning project. Runs on your computer, no cloud account:\n# - random_pet gives the shop a name\n# - terraform_data stands in for a server (built into Terraform 1.4+)\n# - local_file writes out/menu.txt, a real object you can open and break\nterraform {\n  required_version = \">= 1.6.0\"\n\n  required_providers {\n    local = {\n      source  = \"hashicorp/local\"\n      version = \"~> 2.5\"\n    }\n    random = {\n      source  = \"hashicorp/random\"\n      version = \"~> 3.6\"\n    }\n  }\n}\n\nlocals {\n  # A local names an expression once so several places can reuse it.\n  menu_lines = [for pizza in var.pizzas : \"- ${pizza}\"]\n}\n\n# A new region means a new shop name: changing a keeper forces replacement (-/+).\nresource \"random_pet\" \"shop\" {\n  length = 2\n  keepers = {\n    region = var.region\n  }\n}\n\n# Changing input updates this resource in place (~).\nresource \"terraform_data\" \"server\" {\n  input = {\n    size   = var.size\n    region = var.region\n  }\n}\n\n# References to both resources above make Terraform create this one last.\nresource \"local_file\" \"menu\" {\n  filename        = \"${path.module}/out/menu.txt\"\n  file_permission = \"0644\"\n  content         = <<-EOT\n    Shop:   ${random_pet.shop.id}\n    Server: ${terraform_data.server.output.size} in ${terraform_data.server.output.region}\n    Menu:\n    ${join(\"\\n\", local.menu_lines)}\n  EOT\n}\n", "variables.tf": "variable \"size\" {\n  description = \"Server size. Changing it updates terraform_data.server in place.\"\n  type        = string\n  default     = \"small\"\n\n  validation {\n    condition     = contains([\"small\", \"large\"], var.size)\n    error_message = \"The size must be \\\"small\\\" or \\\"large\\\".\"\n  }\n}\n\nvariable \"region\" {\n  description = \"Region. Changing it replaces random_pet.shop and rewrites the menu.\"\n  type        = string\n  default     = \"eu-west\"\n}\n\nvariable \"pizzas\" {\n  description = \"Pizzas listed in out/menu.txt.\"\n  type        = list(string)\n  default     = [\"Margherita\", \"Pepperoni\"]\n}\n", "outputs.tf": "output \"shop_name\" {\n  description = \"The generated shop name.\"\n  value       = random_pet.shop.id\n}\n\noutput \"menu_file\" {\n  description = \"The file Terraform manages.\"\n  value       = local_file.menu.filename\n}\n", "terraform.tfvars": "# Values here override the defaults in variables.tf.\nsize   = \"small\"\nregion = \"eu-west\"\npizzas = [\"Margherita\", \"Pepperoni\", \"Funghi\"]\n"};
export const CI_FILES={".github/workflows/ci.yaml": "# Test every pull request. On main: build, scan, push, then point deploy/ at the new image.\nname: ci\n\non:\n  pull_request:\n  push:\n    branches: [main]\n    # A commit that only changes deploy/ (a promotion or a rollback) needs no new build.\n    paths-ignore:\n      - \"deploy/**\"\n      - \"argocd/**\"\n\npermissions:\n  contents: read\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with:\n          python-version: \"3.13\"\n      - name: Run unit tests\n        working-directory: app\n        run: python -m unittest -v\n\n  build:\n    needs: test\n    if: github.event_name == 'push'\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n      packages: write\n    outputs:\n      image: ${{ steps.name.outputs.image }}\n    steps:\n      - uses: actions/checkout@v4\n      - name: Choose the image name (registry names must be lowercase)\n        id: name\n        run: echo \"image=ghcr.io/${GITHUB_REPOSITORY,,}\" >> \"$GITHUB_OUTPUT\"\n      - name: Build, tagged with the commit SHA\n        run: docker build --build-arg APP_VERSION=\"$GITHUB_SHA\" -t \"${{ steps.name.outputs.image }}:$GITHUB_SHA\" app\n      - name: Scan for known vulnerabilities (fails on fixable HIGH or CRITICAL)\n        run: >-\n          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.58.1\n          image --exit-code 1 --ignore-unfixed --severity HIGH,CRITICAL\n          \"${{ steps.name.outputs.image }}:$GITHUB_SHA\"\n      - name: Log in to GitHub Container Registry\n        run: echo \"${{ secrets.GITHUB_TOKEN }}\" | docker login ghcr.io -u \"$GITHUB_ACTOR\" --password-stdin\n      - name: Push\n        run: docker push \"${{ steps.name.outputs.image }}:$GITHUB_SHA\"\n\n  promote:\n    needs: build\n    runs-on: ubuntu-latest\n    permissions:\n      contents: write\n    steps:\n      - uses: actions/checkout@v4\n      - name: Commit the new image tag to deploy/ (Argo CD deploys it)\n        env:\n          IMAGE: ${{ needs.build.outputs.image }}\n        run: |\n          sed -i \"s|newName: .*|newName: $IMAGE|; s|newTag: .*|newTag: $GITHUB_SHA|\" deploy/kustomization.yaml\n          git config user.name \"github-actions[bot]\"\n          git config user.email \"41898282+github-actions[bot]@users.noreply.github.com\"\n          git commit -am \"deploy: pizza $GITHUB_SHA\"\n          git pull --rebase origin main\n          git push\n", "deploy/kustomization.yaml": "# Argo CD renders this folder. CI changes only the two image lines below.\napiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nnamespace: pizza\nresources:\n  - deployment.yaml\n  - service.yaml\nimages:\n  - name: pizza\n    newName: ghcr.io/owner/repo\n    newTag: not-built-yet\n", "argocd/application.yaml": "# Tells Argo CD: keep the pizza namespace matching deploy/ on the main branch.\napiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: pizza\n  namespace: argocd\nspec:\n  project: default\n  source:\n    repoURL: https://github.com/OWNER/REPO.git # the hands-on lesson fills this in\n    targetRevision: main\n    path: deploy\n  destination:\n    server: https://kubernetes.default.svc\n    namespace: pizza\n  syncPolicy:\n    automated:\n      prune: true # delete things removed from git\n      selfHeal: true # undo changes made outside git\n    syncOptions:\n      - CreateNamespace=true\n", "app/Dockerfile": "FROM python:3.13-slim\n# The app uses only the standard library. Removing pip also removes the\n# libraries bundled inside it, which vulnerability scanners flag.\nRUN python -m pip uninstall --yes pip\nWORKDIR /app\nCOPY app.py .\n# CI passes the commit SHA so GET / shows which build is running.\nARG APP_VERSION=dev\nENV APP_VERSION=$APP_VERSION PORT=8080\nUSER 10001\nEXPOSE 8080\nCMD [\"python\", \"app.py\"]\n", "app/app.py": "\"\"\"Pizza Express: a tiny web app for the CI/CD course. Standard library only.\"\"\"\nimport json\nimport os\nfrom http.server import BaseHTTPRequestHandler, HTTPServer\n\nVERSION = os.environ.get(\"APP_VERSION\", \"dev\")\nMENU = [\"Margherita\", \"Pepperoni\", \"Funghi\"]\n\n\ndef payload():\n    \"\"\"What GET / returns. The tests check this function.\"\"\"\n    return {\"menu\": MENU, \"version\": VERSION}\n\n\nclass Handler(BaseHTTPRequestHandler):\n    def do_GET(self):\n        if self.path == \"/healthz\":\n            body, kind = b\"ok\", \"text/plain\"\n        elif self.path == \"/\":\n            body, kind = json.dumps(payload()).encode(), \"application/json\"\n        else:\n            self.send_error(404)\n            return\n        self.send_response(200)\n        self.send_header(\"Content-Type\", kind)\n        self.send_header(\"Content-Length\", str(len(body)))\n        self.end_headers()\n        self.wfile.write(body)\n\n\nif __name__ == \"__main__\":\n    port = int(os.environ.get(\"PORT\", \"8080\"))\n    HTTPServer((\"0.0.0.0\", port), Handler).serve_forever()\n"};
