---
id: d-file
title: Read and write a Dockerfile
emoji: "\U0001F4C4"
stage: 1
format: html
quiz:
  - q: When does RUN execute?
    options:
      - While building the image
      - Whenever a container receives a request
    answer: 0
    why: CMD or ENTRYPOINT controls runtime startup.
---
<details class="file"><summary>📄 Our small Dockerfile</summary><pre tabindex="0"># syntax=docker/dockerfile:1
FROM python:3.13-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1
RUN useradd --uid 10001 --create-home appuser \
    &amp;&amp; mkdir -p /data &amp;&amp; chown appuser:appuser /data
COPY --chown=appuser:appuser app.py ./app.py
USER appuser
EXPOSE 8000
CMD ["python", "app.py"]
</pre></details>
<p><b>FROM</b> selects a base. <b>WORKDIR</b> sets a directory. <b>COPY</b> adds files from the build context. <b>RUN</b> executes during the build. <b>USER</b> selects the runtime user. <b>CMD</b> supplies the default startup command.</p>
<div class="cmd"><pre tabindex="0">docker build -t pizza:dev .
# the dot is the build context, not just the Dockerfile location</pre><button class="copy">Copy</button></div>
<details class="file"><summary>📄 .dockerignore keeps unwanted context out</summary><pre tabindex="0">.git
.env
.env.*
*.db
__pycache__
*.pyc
</pre></details>
<details class="file"><summary>Common traps and useful edge cases</summary><p><code>EXPOSE 8000</code> documents a port; it does not publish it to your laptop. A later <code>RUN export X=1</code> does not create persistent runtime config; use ENV or runtime environment settings. Files outside the build context cannot simply be copied with <code>../</code>.</p></details>
