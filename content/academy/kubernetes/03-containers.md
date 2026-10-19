---
id: containers
title: Containers in 2 minutes
emoji: "\U0001F4E6"
stage: 0
format: html
quiz:
  - q: What's the difference between an image and a container?
    options:
      - They're the same thing
      - Image = the packaged app (frozen); container = a running copy of it
      - Container = the package; image = a screenshot of it
    answer: 1
    why: One image can run as many containers as you want.
  - q: Where does Kubernetes get your image from?
    options:
      - A registry like Docker Hub
      - It builds it from your source code
      - You copy it to each server on a USB stick
    answer: 0
    why: You build the image and push it. Kubernetes pulls it.
---
<div class="box story"><div class="tag">The problem</div>“It works on my machine!” is the oldest excuse in software. Your app needs Python 3.12 and certain libraries, and the server has something else installed.</div>
<div class="box idea"><div class="tag">The big idea</div>An <b>image</b> is a sealed package: your app plus everything it needs, frozen. A <b>container</b> is that image running. One image can run as many containers as you want.</div>
<div class="box like"><div class="tag">Think of it like…</div>An image is a laminated recipe card. A container is a dish cooked from it. You can cook 10 dishes from one card.</div>
<p>Images live in a <b>registry</b> (Docker Hub, GitHub Container Registry, …) with a name and a tag, like <code>nginx:1.27</code>. Kubernetes downloads (“pulls”) images from there. That's all you need to know about containers for this course.</p>
<details class="file"><summary>📄 A Dockerfile for our pizza app (no need to write one yet)</summary><pre tabindex="0">FROM python:3.12-slim
COPY . /app
RUN pip install -r /app/requirements.txt
CMD ["python", "/app/server.py"]</pre></details>
<div class="cmd"><pre tabindex="0">docker build -t myname/pizza:v1 .  # use your registry username
docker push myname/pizza:v1     # upload it to a registry so a cluster can pull it</pre><button class="copy">Copy</button></div>
<div class="box keep"><div class="tag">Remember</div><ul><li>Image = frozen package. Container = a running copy of it.</li><li>Kubernetes <b>runs</b> containers. It does <b>not</b> build them.</li></ul></div>
