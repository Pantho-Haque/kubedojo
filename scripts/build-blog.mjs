// content/blog/*.md -> src/blog/generated/{index.json, posts/<slug>.json}. Fails the build on broken internal links.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPosts } from './lib/blog.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..'); const out = join(root, 'src/blog/generated');
const { index, posts, problems } = buildPosts(join(root, 'content/blog'));
if (problems.length) { console.error('blog: problems found\n  ' + problems.join('\n  ')); process.exit(1); }
rmSync(out, { recursive: true, force: true }); mkdirSync(join(out, 'posts'), { recursive: true });
writeFileSync(join(out, 'index.json'), JSON.stringify(index));
for (const [slug, p] of Object.entries(posts)) writeFileSync(join(out, 'posts', slug + '.json'), JSON.stringify(p));
console.log(`blog: ${index.length} posts, ${Object.values(posts).reduce((n, p) => n + p.words, 0)} words`);
