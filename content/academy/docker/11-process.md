---
id: d-process
title: 'Main process, shutdown, health, and restart'
emoji: ❤️
stage: 2
format: html
quiz:
  - q: >-
      A running container turns unhealthy. Will plain Docker necessarily restart
      it?
    options:
      - 'Yes'
      - 'No'
    answer: 1
    why: 'A health check is a health signal, not a universal restart controller.'
---
<div class="box idea"><div class="tag">The big idea</div>Docker tracks the main process. Health checks add a separate signal about whether the app works. Running and healthy are different states.</div>
<details class="file"><summary>📄 Prefer exec-form startup</summary><pre tabindex="0">ENTRYPOINT ["python"]
CMD ["app.py"]</pre></details>
<p><code>docker stop</code> sends a stop signal, then force-kills after the grace period if necessary. Your app should handle signals and close work cleanly. <code>init: true</code> in Compose helps forward signals and reap orphaned child processes.</p>
<details class="file"><summary>Common traps and useful edge cases</summary><ul><li>Plain Docker restart policies react to process exit. An <code>unhealthy</code> status alone does not automatically restart a running container.</li><li><code>restart: unless-stopped</code> is not a fix for bad config, and it does not undo an intentional stop.</li><li>Arguments after an image name replace its CMD defaults; ENTRYPOINT usually remains. Compose <code>command</code> and <code>entrypoint</code> override different parts of startup. Inspect both when a container runs the wrong command.</li><li>Exec-form command arguments are not expanded by a shell. Shell-form entrypoints can complicate signal delivery; if you need a wrapper, end it with <code>exec</code>.</li><li>A dependency becoming healthy once does not mean it will stay available. Apps still need timeouts, retries, and reconnection logic.</li></ul></details>
