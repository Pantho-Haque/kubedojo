---
id: d-compose-config
title: 'Compose values, overrides, profiles, and secrets'
emoji: "\U0001F39B️"
stage: 3
format: html
---
<p>Keep two different jobs clear: Compose interpolates <code>&#36;{NAME}</code> in the YAML, while a container gets environment variables through <code>environment</code>, <code>env_file</code>, or image defaults.</p>
<details class="file"><summary>📄 Example fragment</summary><pre tabindex="0">services:
  web:
    image: "myapp:${TAG:-dev}"
    environment:
      LOG_LEVEL: "${LOG_LEVEL:-info}"
    env_file: runtime.env</pre></details>
<p>A project <code>.env</code> file can supply interpolation values; its entries are not all automatically injected into the container. An explicit <code>environment</code> entry takes precedence over the same key from <code>env_file</code>. Use <code>docker compose config</code> to see the resolved configuration.</p>
<details class="file"><summary>Common traps and useful edge cases</summary><ul><li>Shell variables can override interpolation defaults. Use <code>--env-file</code> intentionally and do not publish resolved config containing secrets.</li><li>Use <code>$$</code> when a dollar sign should reach the container command rather than be expanded by Compose.</li><li>Multiple <code>-f</code> files merge by Compose rules; lists do not all behave like simple replacement. Inspect the result. Paths are normally relative to the first Compose file.</li><li>Quote values that YAML might interpret unexpectedly, including boolean-like strings and port mappings.</li><li>Profiles enable optional services: <code>docker compose --profile tools up</code>. Dependencies and explicitly targeted services need attention.</li></ul></details>
