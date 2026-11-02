// gothik's reading shelf (src/go/data/academy-reading.json, 3 MB) -> one small file per document plus a search index, so a
// page loads only the document it shows (src/go/lib/reading.ts imports them lazily). Writes src/go/generated/.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..'), out = join(root, 'src/go/generated');
const shelf = JSON.parse(readFileSync(join(root, 'src/go/data/academy-reading.json'), 'utf8'));

// scraped pages: drop the source host's page chrome, and join one-line code blocks into one listing
function cleanBlocks(blocks) {
  const res = [];
  for (const b of blocks) {
    if (/Git at Google|accounts\.google\.com|go\.googlesource\.com\/\?format=HTML|^<p>blob: /.test(b.html)) continue;
    const m = /^<pre><code>([^\n]*)<\/code><\/pre>$/.exec(b.html), prev = res.at(-1);
    if (m && prev?.code != null) { prev.code += '\n' + m[1]; continue; }
    res.push(m ? { html: '', code: m[1] } : b);
  }
  return res.map(b => (b.code != null ? { html: '<pre><code>' + b.code + '</code></pre>' } : b));
}
const text = blocks => blocks.map(b => b.html).join(' ').replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").toLowerCase();

rmSync(out, { recursive: true, force: true }); mkdirSync(join(out, 'reading'), { recursive: true });
const search = {};
for (const [sha, doc] of Object.entries(shelf)) {
  writeFileSync(join(out, 'reading', sha + '.json'), JSON.stringify(cleanBlocks(doc.blocks)));
  search[sha] = text(doc.blocks);
}
writeFileSync(join(out, 'reading-search.json'), JSON.stringify(search));
console.log(`go: ${Object.keys(shelf).length} reading-shelf documents split`);
