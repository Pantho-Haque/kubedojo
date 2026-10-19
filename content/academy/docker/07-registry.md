---
id: d-registry
title: 'Tags, digests, registries, and platforms'
emoji: "\U0001F30D"
stage: 1
format: html
quiz:
  - q: You pull a new version of a tag. What happens to a running container?
    options:
      - It instantly updates
      - It keeps its current image until replaced
    answer: 1
    why: A running container does not change its image under its feet.
---
<div class="cmd"><pre tabindex="0">docker tag pizza:dev YOUR_USER/pizza:v1
docker login
docker push YOUR_USER/pizza:v1
docker pull YOUR_USER/pizza:v1</pre><button class="copy">Copy</button></div>
<p>Replace <code>YOUR_USER</code> with your registry namespace. A tag is a movable name; a digest identifies immutable content. Pulling a newer image does not replace already-running containers.</p>
<details class="file"><summary>Common traps and useful edge cases</summary><ul><li><code>latest</code> is just a tag; it is not a freshness guarantee.</li><li>Apple Silicon commonly uses arm64; many servers use amd64. An <code>exec format error</code> may indicate the wrong architecture or an invalid executable script.</li><li><code>docker buildx build --platform linux/amd64,linux/arm64 --push -t YOUR_USER/pizza:v1 .</code> publishes a multi-platform image when your builder supports it. Emulation can be slower.</li><li>Pin release images, scan them, and rebuild for fixes. Pinning a digest improves reproducibility but does not apply future security updates automatically.</li></ul></details>
