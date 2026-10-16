// Markdown -> blog posts, at build time (the browser never ships a markdown parser).
//   content/blog/NN-slug.md  (front matter: title, slug, order, tags, description, date)
//   -> { index: [meta…], posts: { slug: { …meta, html, toc } }, problems: [string…] }
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import yaml from 'highlight.js/lib/languages/yaml';
import json from 'highlight.js/lib/languages/json';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import { hlText } from '../../src/playground/highlight.js';

hljs.registerLanguage('bash', bash); hljs.registerLanguage('yaml', yaml); hljs.registerLanguage('json', json); hljs.registerLanguage('dockerfile', dockerfile);
const ALIAS = { sh: 'bash', shell: 'bash', zsh: 'bash', yml: 'yaml' };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// same rule GitHub uses, so the anchors written for the original markdown keep working
export const slugify = t => String(t).toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s/g, '-');

// a bash block can be offered as "Run in the playground" when every line is a command the simulator understands and nothing is a placeholder
const RUNNABLE_START = /^(kind|k3d|kubectl|kc|docker|helm2|ls|cat|echo|mkdir|cd|tree|curl|jq|printf)\b/;
function runnable(code) {
  const lines = code.split('\n'); if (lines.length > 30) return null;
  let inHeredoc = null;
  for (const raw of lines) {
    const l = raw.trim(); if (inHeredoc) { if (l === inHeredoc) inHeredoc = null; continue; } if (!l || l.startsWith('#')) continue;
    if (/<[A-Za-z_-]+>|\.\.\.|…|\bbrew\b|\bsudo\b|\bapt\b|\$\{?[A-Z_]+\}?\s*$/.test(l) && !/<<'?\w+'?/.test(l)) return null;
    const hd = /<<-?\s*'?(\w+)'?/.exec(l); if (hd) inHeredoc = hd[1];
    if (!RUNNABLE_START.test(l) && !/^[A-Za-z_]+=/.test(l) && !/^(-|\w+:|\s)/.test(raw)) return null;
  }
  if (inHeredoc) return null;
  const cmds = lines.filter(x => x.trim() !== '' && !x.trim().startsWith('#') || /^\s/.test(x)); // keep heredoc bodies, drop comments
  return cmds.length ? lines.filter(x => !x.trim().startsWith('#')) : null;
}

export function buildPosts(dir) {
  const files = readdirSync(dir).filter(f => f.endsWith('.md')).sort(); const raw = [];
  for (const f of files) { const { data, content } = matter(readFileSync(join(dir, f), 'utf8')); raw.push({ file: f, data, content }); }
  const slugByFile = Object.fromEntries(raw.map(r => [r.data.source || r.file, r.data.slug])); // README.md -> start-here, 01-kind-cluster-spin.md -> kind-cluster
  for (const r of raw) slugByFile[r.file] = r.data.slug;
  const titleBySlug = Object.fromEntries(raw.map(r => [r.data.slug, r.data.title]));
  const problems = []; const posts = {}; const anchors = {};

  for (const r of raw) {
    const toc = []; const seen = new Map(); let first = true;
    const slugFor = text => { let s = slugify(text) || 'section'; const n = seen.get(s) || 0; seen.set(s, n + 1); return n ? `${s}-${n}` : s; };
    const marked = new Marked({ gfm: true, breaks: false });
    marked.use({
      renderer: {
        heading({ tokens, depth }) {
          const text = this.parser.parseInline(tokens); const plain = tokens.map(t => t.raw || t.text || '').join('').replace(/[`*_]/g, '');
          if (depth === 1 && first) { first = false; return ''; } // the page title comes from the front matter
          const id = slugFor(plain); if (depth === 2 || depth === 3) toc.push({ depth, id, text: plain });
          return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-label="Link to this section">#</a>${text}</h${depth}>\n`;
        },
        code({ text, lang }) {
          const l = ALIAS[(lang || '').toLowerCase()] || (lang || '').toLowerCase(); let body;
          if ((l === 'yaml' || l === 'dockerfile') && /\{\{|^(FROM|RUN|COPY)\b/m.test(text)) body = hlText(text, l === 'dockerfile' ? 'Dockerfile' : 'x.yaml').replace(/<span class="(h[a-z])"/g, '<span class="tk-$1"');
          else if (l && hljs.getLanguage(l)) body = hljs.highlight(text, { language: l, ignoreIllegals: true }).value; else body = esc(text);
          const run = l === 'bash' ? runnable(text) : null; const label = l || 'text';
          const tryLink = run ? `<a class="code-try" href="/app?run=${encodeURIComponent(JSON.stringify(run))}&amp;notour=1">Try in playground</a>` : '';
          return `<figure class="code" data-lang="${esc(label)}"><figcaption><span class="lang">${esc(label)}</span>${tryLink}<button type="button" class="code-copy" aria-label="Copy this code">Copy</button></figcaption><pre tabindex="0"><code>${body.replace(/\n$/, '')}</code></pre></figure>\n`;
        },
        table(token) { return `<div class="table-wrap" tabindex="0" role="region" aria-label="Table (scrolls sideways)"><table>${defaultTable(this, token)}</table></div>\n`; },
        link({ href, title, tokens }) {
          let text = this.parser.parseInline(tokens); let h = href || '';
          const m = /^([\w./-]+\.md)(#.*)?$/.exec(h);
          if (m) {
            const slug = slugByFile[m[1].split('/').pop()];
            if (!slug) problems.push(`${r.file}: link to unknown file ${h}`);
            else {
              h = `/blog/${slug}${m[2] || ''}`;
              if (/^(\d\d-|README).*\.md$/.test(text)) text = esc(titleBySlug[slug]); // a bare file name as link text becomes the post title
              if (m[2]) (r._xlinks ||= []).push([slug, m[2].slice(1)]);
            }
          }
          const ext = /^https?:\/\//.test(h);
          return `<a href="${esc(h)}"${title ? ` title="${esc(title)}"` : ''}${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
        },
      },
    });
    function defaultTable(rd, token) { // marked's own table markup, without its outer <table>
      const head = token.header.map((c, i) => `<th${token.align[i] ? ` align="${token.align[i]}"` : ''}>${rd.parser.parseInline(c.tokens)}</th>`).join('');
      const body = token.rows.map(row => `<tr>${row.map((c, i) => `<td${token.align[i] ? ` align="${token.align[i]}"` : ''}>${rd.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('\n');
      return `<thead><tr>${head}</tr></thead><tbody>${body}</tbody>`;
    }
    const html = marked.parse(r.content);
    const words = r.content.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length; const codeBlocks = (r.content.match(/```/g) || []).length / 2;
    const d = r.data; if (!d.slug || !d.title) problems.push(`${r.file}: front matter needs slug and title`);
    posts[d.slug] = { slug: d.slug, title: d.title, description: d.description || '', order: d.order ?? 99, tags: d.tags || [], date: String(d.date instanceof Date ? d.date.toISOString().slice(0, 10) : d.date || ''), minutes: Math.max(1, Math.round((words + codeBlocks * 40) / 200)), words, toc, html, _x: r._xlinks || [] };
    anchors[d.slug] = new Set(toc.map(t => t.id));
  }
  for (const p of Object.values(posts)) { for (const [slug, a] of p._x) if (anchors[slug] && !anchors[slug].has(a) && !(posts[slug] && posts[slug].html.includes(`id="${a}"`))) problems.push(`${p.slug}: link to /blog/${slug}#${a} has no such heading`); delete p._x; }
  const index = Object.values(posts).sort((a, b) => a.order - b.order).map(({ html: _html, toc: _toc, ...m }) => ({ ...m, headings: posts[m.slug].toc.filter(t => t.depth === 2).map(t => t.text) }));
  return { index, posts, problems };
}
