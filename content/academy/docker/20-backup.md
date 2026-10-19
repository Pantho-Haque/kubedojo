---
id: d-backup
title: 'Back up, restore, and remove only your lab'
emoji: "\U0001F9F0"
stage: 4
format: html
---
<div class="box idea"><div class="tag">The big idea</div>A volume survives container replacement. A backup lets you recover when the volume or host is lost. Prove the backup works by restoring it.</div>
<p>For this SQLite demo, use SQLite’s backup API for a consistent copy. Other databases have their own dump/snapshot and restore procedures; do not blindly copy live database files.</p>
<label class="task"><input type="checkbox" data-task="d-backup-copy"><span>Create a consistent backup and copy it out of Docker</span></label><div class="cmd"><pre tabindex="0">docker compose exec -T api python -c "import sqlite3; src=sqlite3.connect('/data/pizza.db'); dst=sqlite3.connect('/tmp/pizza-backup.db'); src.backup(dst); dst.close(); src.close()"
docker compose cp api:/tmp/pizza-backup.db ./pizza-backup.db</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="d-backup-restore"><span>Stop API writes, restore the saved copy, and start the stack</span></label><div class="cmd"><pre tabindex="0">docker compose stop api
docker compose run --rm --no-deps -v "$PWD/pizza-backup.db:/backup/pizza.db:ro" api python -c "import shutil; shutil.copyfile('/backup/pizza.db', '/data/pizza.db')"
docker compose up -d --wait
curl http://localhost:8080</pre><button class="copy">Copy</button></div>
<p>The next visit should continue from the backed-up count. Store an additional copy outside this machine before depending on it.</p>
<label class="task"><input type="checkbox" data-task="d-backup-clean"><span>Stop and remove this project’s containers while keeping its named volume</span></label><div class="cmd"><pre tabindex="0">docker compose down</pre><button class="copy">Copy</button></div>
<details class="file"><summary>Common traps and useful edge cases</summary><p>When you deliberately want to erase the practice counter too, use <code>docker compose down -v</code> in this project. Keep the backup file. Do not use a global volume prune as a shortcut. Logs, images, and build cache have separate lifecycles and cleanup commands.</p></details>
