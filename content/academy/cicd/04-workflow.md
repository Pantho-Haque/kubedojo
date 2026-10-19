---
id: ci-workflow
title: 'Read a workflow: triggers, jobs, steps'
emoji: "\U0001F4C4"
stage: 1
format: html
quiz:
  - q: >-
      The build job has <code>needs: test</code>. The tests fail. What happens
      to build?
    options:
      - It runs anyway
      - It is skipped
    answer: 1
    why: needs makes build wait for test and skip if test fails.
  - q: Where does GitHub look for workflow files?
    options:
      - .github/workflows/
      - The repository root
      - deploy/
    answer: 0
    why: Any YAML file in .github/workflows/ is a workflow.
---
<p class="lead">GitHub Actions reads YAML files in <code>.github/workflows/</code>. Each file is a workflow.</p>
<table><tr><th>Part</th><th>What it means</th></tr>
<tr><td><code>on:</code></td><td>Triggers: when to run. For example on every pull request, and on pushes to main.</td></tr>
<tr><td><code>jobs:</code></td><td>Separate pieces of work. Each job runs on a fresh virtual machine, a <b>runner</b>.</td></tr>
<tr><td><code>needs:</code></td><td>Order: <code>build</code> waits for <code>test</code>, and is skipped if <code>test</code> fails.</td></tr>
<tr><td><code>steps:</code></td><td>Commands or reusable actions run one after another inside a job.</td></tr>
<tr><td><code>uses:</code></td><td>A ready-made action, such as <code>actions/checkout</code>, which downloads your code onto the runner.</td></tr>
<tr><td><code>permissions:</code></td><td>What the job’s automatic token may do. Give each job only what it needs.</td></tr></table>
<details class="file"><summary>📄 .github/workflows/ci.yaml · the course pipeline</summary><pre tabindex="0"># Test every pull request. On main: build, scan, push, then point deploy/ at the new image.
name: ci

on:
  pull_request:
  push:
    branches: [main]
    # A commit that only changes deploy/ (a promotion or a rollback) needs no new build.
    paths-ignore:
      - "deploy/**"
      - "argocd/**"

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.13"
      - name: Run unit tests
        working-directory: app
        run: python -m unittest -v

  build:
    needs: test
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      image: ${{ steps.name.outputs.image }}
    steps:
      - uses: actions/checkout@v4
      - name: Choose the image name (registry names must be lowercase)
        id: name
        run: echo "image=ghcr.io/${GITHUB_REPOSITORY,,}" &gt;&gt; "$GITHUB_OUTPUT"
      - name: Build, tagged with the commit SHA
        run: docker build --build-arg APP_VERSION="$GITHUB_SHA" -t "${{ steps.name.outputs.image }}:$GITHUB_SHA" app
      - name: Scan for known vulnerabilities (fails on fixable HIGH or CRITICAL)
        run: &gt;-
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.58.1
          image --exit-code 1 --ignore-unfixed --severity HIGH,CRITICAL
          "${{ steps.name.outputs.image }}:$GITHUB_SHA"
      - name: Log in to GitHub Container Registry
        run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin
      - name: Push
        run: docker push "${{ steps.name.outputs.image }}:$GITHUB_SHA"

  promote:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - name: Commit the new image tag to deploy/ (Argo CD deploys it)
        env:
          IMAGE: ${{ needs.build.outputs.image }}
        run: |
          sed -i "s|newName: .*|newName: $IMAGE|; s|newTag: .*|newTag: $GITHUB_SHA|" deploy/kustomization.yaml
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git commit -am "deploy: pizza $GITHUB_SHA"
          git pull --rebase origin main
          git push
</pre></details>
<div class="box idea"><div class="tag">The big idea</div>Read it as a story: on a pull request, only test. On main, test, then build, scan, and push the image, then commit the new tag so Argo CD can deploy it.</div>
<p><b>Why <code>if: github.event_name == 'push'</code>?</b> Pull requests should be checked, but only merged code should become an image that can reach the cluster.</p>
<div class="box keep"><div class="tag">Remember</div><ul><li>on = when, jobs = what, needs = order, steps = how.</li><li>Each job starts on a clean runner; nothing is left over from your laptop.</li><li>A failed job stops every job that needs it.</li></ul></div>
