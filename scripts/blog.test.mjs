import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildPosts, slugify } from './lib/blog.mjs';

const fixture = files => { const d = mkdtempSync(join(tmpdir(), 'kd-blog-')); for (const [n, c] of Object.entries(files)) writeFileSync(join(d, n), c); return d; };
const fm = (slug, extra = '') => `---\ntitle: "Post ${slug}"\nslug: ${slug}\norder: 1\ndate: 2026-01-02\n${extra}---\n\n`;

test('slugify follows the GitHub rule, so anchors in the original markdown keep working', () => {
  assert.equal(slugify('Names, kubeconfig and contexts'), 'names-kubeconfig-and-contexts');
  assert.equal(slugify('Part 1 — Prepare the machine'), 'part-1--prepare-the-machine');
  assert.equal(slugify('4.4 Why pods never land on the control-plane'), '44-why-pods-never-land-on-the-control-plane');
});

test('markdown becomes HTML: first H1 dropped, anchors, tables, highlighted code with copy/try controls', () => {
  const d = fixture({ 'a.md': fm('a') + '# Title\n\nIntro with `code`.\n\n## Part one\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n```bash\nkubectl get pods\n```\n\n### Sub heading\n' });
  const { posts, problems } = buildPosts(d); assert.deepEqual(problems, []);
  const p = posts.a; assert.ok(!p.html.includes('<h1'), 'the page title comes from front matter');
  assert.match(p.html, /<h2 id="part-one">/); assert.match(p.html, /<div class="table-wrap"[^>]*><table>/);
  assert.match(p.html, /class="code-copy"/); assert.match(p.html, /class="code-try" href="\/app\?run=/);
  assert.deepEqual(p.toc.map(t => t.id), ['part-one', 'sub-heading']); assert.ok(p.minutes >= 1);
});

test('relative .md links become blog routes; the file name used as link text becomes the post title', () => {
  const d = fixture({ 'a.md': fm('a', 'source: 01-a.md\n') + 'See [01-b.md](02-b.md#deep-part) and [other](02-b.md).\n', 'b.md': fm('b', 'source: 02-b.md\n') + '## Deep part\n\ntext\n' });
  const { posts, problems } = buildPosts(d); assert.deepEqual(problems, []);
  assert.match(posts.a.html, /<a href="\/blog\/b#deep-part">Post b<\/a>/); assert.match(posts.a.html, /<a href="\/blog\/b">other<\/a>/);
});

test('broken links and anchors fail the build instead of shipping', () => {
  const d = fixture({ 'a.md': fm('a') + '[x](missing.md) [y](b.md#nope)\n', 'b.md': fm('b', 'source: b.md\n') + '## Real\n' });
  const { problems } = buildPosts(d); assert.ok(problems.some(p => /unknown file missing\.md/.test(p))); assert.ok(problems.some(p => /#nope/.test(p)));
});

test('"Try in playground" is offered only for blocks of commands the simulator knows, without placeholders', () => {
  const d = fixture({ 'a.md': fm('a') + '```bash\nkubectl get nodes\n```\n\n```bash\nkubectl label node <node> role=db\n```\n\n```bash\nbrew install kind\n```\n\n```text\nNAME READY\n```\n' });
  const html = buildPosts(d).posts.a.html; assert.equal((html.match(/code-try/g) || []).length, 1);
});

test('Go templates in yaml blocks are highlighted with the template-aware colours', () => {
  const d = fixture({ 'a.md': fm('a') + '```yaml\nname: {{ include "x.fullname" . }}\n```\n' });
  assert.match(buildPosts(d).posts.a.html, /tk-hd/);
});

test('the real content builds cleanly: 9 unique posts, no broken links, every post has a description', () => {
  const { index, problems } = buildPosts(new URL('../content/blog', import.meta.url).pathname);
  assert.deepEqual(problems, []); assert.equal(index.length, 9); assert.equal(new Set(index.map(p => p.slug)).size, 9);
  for (const p of index) { assert.ok(p.description.length > 30, p.slug); assert.ok(p.minutes >= 1, p.slug); }
  assert.deepEqual(index.map(p => p.order), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
});

test('the transcripts on the home page come from the real simulator', () => {
  const d = JSON.parse(readFileSync(new URL('../src/landing/generated/demos.json', import.meta.url), 'utf8'));
  assert.equal(d.scenarios.length, 4); const out = s => d.scenarios.find(x => x.id === s).lines.flatMap(l => l.out).join('\n');
  assert.match(out('image'), /ImagePullBackOff/); assert.match(out('crash'), /CrashLoopBackOff/); assert.match(out('node'), /NotReady/); assert.match(out('rbac'), /\nno\n[\s\S]*\nyes\n/);
  const last = d.hero.at(-1).snap; assert.ok(last.some(n => !n.ready) && last.some(n => n.pods.length >= 4), 'hero ends with a dead node and its pods rescheduled');
  assert.match(d.script.excerpt, /guard\(\)/); assert.match(d.script.excerpt, /kind: Deployment/);
});

test('generated JSON exists for every post', () => {
  mkdirSync(new URL('../src/blog/generated/posts', import.meta.url), { recursive: true });
  for (const s of ['start-here', 'kind-cluster', 'helm-2-chart']) assert.ok(JSON.parse(readFileSync(new URL(`../src/blog/generated/posts/${s}.json`, import.meta.url), 'utf8')).html.length > 500);
});
