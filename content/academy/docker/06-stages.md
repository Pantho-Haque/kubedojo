---
id: d-stages
title: 'Build stages, secrets, and small images'
emoji: "\U0001F3D7️"
stage: 1
format: html
---
<div class="box idea"><div class="tag">The big idea</div>A multi-stage build uses one stage to compile or prepare artifacts, then copies only what runtime needs into another stage.</div>
<details class="file"><summary>📄 The pattern, not a complete app</summary><pre tabindex="0">FROM golang:1.25 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /out/app .

FROM scratch
COPY --from=build /out/app /app
USER 10001:10001
ENTRYPOINT ["/app"]</pre></details>
<p>This pattern needs a compatible static binary. Real apps may also need CA certificates, timezone data, or other runtime files. A tiny image that cannot do its job is not an improvement.</p>
<details class="file"><summary>Common traps and useful edge cases</summary><ul><li>Do not pass build credentials through ARG, ENV, or COPY. Use BuildKit secret/SSH mounts, and ensure your build command does not print or copy the secret.</li><li>Deleting a copied secret in a later layer does not erase it from earlier image layers.</li><li>Minimal/distroless images may have no shell. Debug with logs, inspect, or a suitable debug image rather than assuming <code>sh</code> exists.</li></ul></details>
<div class="cmd"><pre tabindex="0">docker build --secret id=token,src=./token.txt .
# Dockerfile consumes it during one step:
# RUN --mount=type=secret,id=token your-tool --token-file /run/secrets/token</pre><button class="copy">Copy</button></div>
