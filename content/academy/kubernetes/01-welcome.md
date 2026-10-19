---
id: welcome
title: Start here
emoji: "\U0001F44B"
stage: 0
format: html
---
<p class="lead">Kubernetes looks scary because people show you <b>everything at once</b>. We won't. You'll learn <b>one idea at a time</b>, each one fixing a real problem, and you'll <b>play</b> with a tiny fake cluster right here on the page.</p>
<div class="box idea"><b>Begin here. Nothing to install today.</b> Follow <b>Guided learning</b> from top to bottom. Read one lesson, try its practice, answer its questions, then choose <b>Next</b>. Stop whenever you like; your place is saved.</div>
<p><b>First tiny goal:</b> explain “Kubernetes keeps the number of app copies I asked for.” You do not need to memorize commands. In Stages 1–4, code blocks are examples to read. Stage 5 tells you when to open a real terminal.</p>
<details class="file"><summary>Six words to know before you begin</summary><ul><li><b>App:</b> a program that does a job, such as serving a website.</li><li><b>Server:</b> a computer that runs an app and answers requests.</li><li><b>Request:</b> a message asking the app to do something, such as show a page.</li><li><b>Terminal:</b> a window where you type commands for your computer.</li><li><b>kubectl:</b> the command-line tool you use to ask Kubernetes to show or change something.</li><li><b>K8s:</b> a short name for Kubernetes. The 8 stands for the eight letters between K and s.</li></ul></details>
<h2>Your path, with a finish line for each stage</h2>
<div class="worlds">
<div><b>1 · Understand the pieces · lessons 1–5</b><span>Start with “Why does Kubernetes exist?” Finish when you can explain an image, a container, a node, a Pod, and the desired-state loop in your own words.</span><button class="map-button" data-go="why">Start the basics</button></div>
<div><b>2 · Run and reach an app · lessons 6–9</b><span>Practice replacing a deleted pod, recovering from a lost machine, and sending requests through a Service. Finish when you can trace browser → entry point → Service → ready Pod.</span><button class="map-button" data-go="deploy">Practice running an app</button></div>
<div><b>3 · Give the app what it needs · lessons 10–12</b><span>Learn settings, passwords, disks, health checks, and capacity. Finish when you can fix a waiting pod and explain why stored data needs a volume and a backup.</span><button class="map-button" data-go="config">Learn app essentials</button></div>
<div><b>4 · Update and fix it · lessons 13–16</b><span>Ship a good version, recover from a broken one, solve the debugging cases, and learn permissions. Finish when you can choose the first command to investigate a failure.</span><button class="map-button" data-go="rollout">Practice operating an app</button></div>
<div><b>5 · Do it for real · lessons 17–20</b><span>Build the laptop cluster first. Repeat its deploy, break, and undo exercises without looking. Then build the k3s home lab, practice a restore, and complete the Graduation checklist.</span><button class="map-button" data-go="laptop">Build your first cluster</button></div>
</div>
<p><b>Pace:</b> one or two lessons per sitting is enough. Repeat a simulation until you can predict what will happen before clicking. A wrong answer is a chance to try again.</p><p><b>Explore the cluster</b> is the optional detailed lab. Save it until after Stage 2, or use it when you want to inspect a specific concept. You can finish the guided path without reading all 41 detailed lessons.</p><h2>How every lesson works</h2>
<div class="flow"><span>🎬 a problem</span>→<span>💡 one idea that fixes it</span>→<span>🎮 play with it</span>→<span>✅ 2–4 quick questions</span>→<span>📌 what to remember</span></div>
<p>Each lesson takes about 5–10 minutes. Your progress is saved in this browser. Some games have a ⭐ challenge. Collect them all.</p>
<p>Our example app for the whole course: <b>🍕 Pizza Express</b>, a small web app in a container. We'll take it from “runs on my laptop” to “runs on a cluster that fixes itself”.</p>
<p>By the end you'll have <b>built a 3-machine cluster, deployed an app, updated it, broken it, fixed it, and learned how to keep it running.</b> Ready?</p>
