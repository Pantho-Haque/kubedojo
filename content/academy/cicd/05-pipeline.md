---
id: ci-pipeline
title: Test → build → scan → push
emoji: "\U0001F9EA"
stage: 1
format: html
quiz:
  - q: The test job fails. Does a new image reach the registry?
    options:
      - 'Yes'
      - 'No'
    answer: 1
    why: 'build, scan, and push all depend on test, so they are skipped.'
  - q: >-
      The scan finds a fixable HIGH vulnerability in the base image. What is a
      good fix?
    options:
      - Update or slim the base image and push again
      - Turn off the scan
    answer: 0
    why: Fix the image; keep the gate.
practice:
  kind: pipeline
  mission: pipeline
---
<div class="box story"><div class="tag">The problem</div>A teammate pushes a change on a busy afternoon. Nobody ran the tests, and the new image contains a library with a known security hole. Which step should have stopped it?</div>
<table><tr><th>Job</th><th>Question it answers</th><th>If it fails</th></tr>
<tr><td>🧪 test</td><td>Does the code still do what we expect?</td><td>Nothing is built; the change is blocked.</td></tr>
<tr><td>🐳 build</td><td>Can we package it into an image?</td><td>Nothing to scan or ship.</td></tr>
<tr><td>🔍 scan</td><td>Does the image contain known, fixable vulnerabilities?</td><td>The image is never pushed.</td></tr>
<tr><td>📦 push</td><td>Store the image in a registry, tagged with the commit.</td><td>Argo CD has nothing new to deploy.</td></tr>
<tr><td>🗂️ promote</td><td>Write the new tag into git for Argo CD.</td><td>The cluster keeps running the previous version.</td></tr></table>
<div class="box idea"><div class="tag">The big idea</div>Each job is a gate. A red gate stops everything after it, so a broken or risky change never reaches the cluster. The working version keeps running.</div>
<h2>Practice safely in the browser</h2><div data-ci-sim></div>
<div class="box warnbox">A green pipeline only proves what your tests and scans check. Write tests for the things that would hurt most if they broke.</div>
<div class="box keep"><div class="tag">Remember</div><ul><li>test → build → scan → push → promote, in that order.</li><li>Any red job stops the rest; production keeps the last good version.</li><li>Scans catch known problems, not every problem.</li></ul></div>
