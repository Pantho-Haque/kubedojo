---
id: d-config
title: Config and secrets at build time and runtime
emoji: "\U0001F511"
stage: 2
format: html
---
<p><b>ARG</b> supplies build-time input. <b>ENV</b> defines an image environment default. <code>docker run -e</code> and Compose <code>environment</code> configure a container when it is created.</p>
<div class="cmd"><pre tabindex="0">docker run --rm -e MENU_SIZE=large pizza:dev
# A real app must read MENU_SIZE for this setting to do anything.</pre><button class="copy">Copy</button></div>
<p>Use secret files or an appropriate secret manager for sensitive values. Compose secrets can grant a service access to a file under <code>/run/secrets/</code>; the app must read it. Local Compose secrets do not by themselves create an encrypted vault.</p>
<details class="file"><summary>Common traps and useful edge cases</summary><ul><li>Environment variables may be visible to people with container-inspection access and may appear in diagnostics.</li><li><code>.env</code> is not a secret store, and <code>.dockerignore</code> is not the same as <code>.gitignore</code>. Keep credentials out of both image context and git.</li><li>Changing an environment file does not update an already-created container. Recreate it with the new configuration.</li></ul></details>
