---
id: d-security
title: 'Permissions, resources, and safe defaults'
emoji: "\U0001F6E1️"
stage: 2
format: html
---
<ul><li>Use a non-root user where the app supports it. Check volume ownership.</li><li>Avoid <code>--privileged</code>, host namespaces, and mounting the Docker socket unless you understand the access they grant.</li><li>Drop unneeded capabilities; use read-only filesystems and writable tmpfs/volumes where appropriate.</li><li>Set reasonable memory/CPU limits and test behavior under them.</li><li>Use maintained images, rebuild for patches, and minimize exposed host ports.</li></ul>
<details class="file"><summary>Common traps and useful edge cases</summary><p>Rootless Engine and a non-root container user are different layers of protection. Never treat container isolation as permission to run untrusted code with powerful host mounts. On many Linux setups, access to a rootful Docker daemon is effectively host-administrator access. A memory limit can lead to OOM termination; exit 137 alone is not proof—inspect OOMKilled. CPU limiting generally slows work rather than killing it.</p></details>
<div class="cmd"><pre tabindex="0">docker stats
docker inspect --format "{{.State.OOMKilled}}" pizza-demo</pre><button class="copy">Copy</button></div>
