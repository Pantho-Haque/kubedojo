// After `vite build` (client) and `vite build --ssr` (server bundle): render every public route to static HTML, and write the
// SEO and deployment files. Nothing here needs a server at run time.
//   dist/index.html, blog/index.html, blog/<slug>/index.html, privacy/index.html, app/index.html, 404.html
//   dist/sitemap.xml + feed.xml (only with VITE_SITE_URL), robots.txt, _headers, _deploy/{nginx.conf,vercel.json}
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..'); const dist = join(root, 'dist');
const SITE_URL = (process.env.VITE_SITE_URL || '').replace(/\/$/, '');
const { render, routes, shells, metaFor } = await import(pathToFileURL(join(root, 'dist-ssr/entry-server.js')).href);
const template = readFileSync(join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--app-head-->') || !template.includes('<!--app-html-->')) throw new Error('index.html lost its placeholders');
const fontPreload = (readdirSync(join(dist, 'assets')).filter(f => /^ibm-plex-mono-latin-600-normal.*\.woff2$/.test(f))[0]) || null; // the heading face: fetched at once, no flash of the fallback
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const SITE_NAME = 'KubeDojo';

function head(m) {
  const url = SITE_URL ? SITE_URL + (m.path === '/' ? '/' : m.path) : '';
  const img = SITE_URL ? SITE_URL + '/og.png' : '/og.png';
  const t = [...(fontPreload ? [`<link rel="preload" href="/assets/${fontPreload}" as="font" type="font/woff2" crossorigin />`] : []), `<title>${esc(m.title)}</title>`, `<meta name="description" content="${esc(m.description)}" />`];
  if (url) t.push(`<link rel="canonical" href="${esc(url)}" />`);
  if (m.noindex) t.push('<meta name="robots" content="noindex" />');
  t.push(`<meta property="og:site_name" content="${SITE_NAME}" />`, `<meta property="og:type" content="${m.type === 'article' ? 'article' : 'website'}" />`, `<meta property="og:title" content="${esc(m.title)}" />`, `<meta property="og:description" content="${esc(m.description)}" />`, `<meta property="og:image" content="${esc(img)}" />`, `<meta property="og:image:width" content="1200" />`, `<meta property="og:image:height" content="630" />`);
  if (url) t.push(`<meta property="og:url" content="${esc(url)}" />`);
  if (m.published) t.push(`<meta property="article:published_time" content="${esc(m.published)}" />`);
  t.push('<meta name="twitter:card" content="summary_large_image" />', `<meta name="twitter:title" content="${esc(m.title)}" />`, `<meta name="twitter:description" content="${esc(m.description)}" />`, `<meta name="twitter:image" content="${esc(img)}" />`);
  if (SITE_URL) t.push(`<link rel="alternate" type="application/rss+xml" title="${SITE_NAME}" href="${SITE_URL}/feed.xml" />`);
  for (const j of m.jsonld || []) t.push(`<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`);
  return t.join('\n    ');
}
const write = (rel, text) => { const f = join(dist, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, text); };
const page = (path, html) => template.replace('<!--app-head-->', head(metaFor(path))).replace('<div id="root"><!--app-html--></div>', html ? `<div id="root" data-prerendered>${html}</div>` : '<div id="root"></div>');

const list = routes();
for (const r of list) write(r === '/' ? 'index.html' : join(r.slice(1), 'index.html'), page(r, await render(r)));
for (const r of shells()) write(join(r.slice(1), 'index.html'), page(r, '')); // the playground and Simulate are client-only: empty shells with the right title
write('404.html', page('/__not-found__', await render('/__not-found__')));
console.log(`prerender: ${list.length} routes + ${shells().length} client-only shells + 404`);

// ---- SEO files
write('robots.txt', `User-agent: *\nAllow: /\n${SITE_URL ? `\nSitemap: ${SITE_URL}/sitemap.xml\n` : ''}`);
if (SITE_URL) {
  const posts = JSON.parse(readFileSync(join(root, 'src/blog/generated/index.json'), 'utf8'));
  const day = new Date().toISOString().slice(0, 10);
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...list, ...shells()].map(r => `  <url><loc>${SITE_URL}${r === '/' ? '/' : r}</loc><lastmod>${(posts.find(p => '/blog/' + p.slug === r) || { date: day }).date}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  write('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${SITE_NAME}</title><link>${SITE_URL}/blog</link><description>${esc(metaFor('/blog').description)}</description>\n${posts.map(p => `<item><title>${esc(p.title)}</title><link>${SITE_URL}/blog/${p.slug}</link><guid>${SITE_URL}/blog/${p.slug}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`).join('\n')}\n</channel></rss>\n`);
}

// ---- security headers. The page makes no network requests, so connect-src is 'none'; the one inline script (theme, applied before first paint) is allowed by hash.
const inline = /<script>([\s\S]*?)<\/script>/.exec(template); if (!inline) throw new Error('theme script not found in index.html');
const hash = 'sha256-' + createHash('sha256').update(inline[1]).digest('base64');
const CSP = `default-src 'self'; script-src 'self' '${hash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
const SEC = { 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'DENY', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()' };
write('_headers', `/*\n${Object.entries(SEC).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/*.html\n  Cache-Control: public, max-age=0, must-revalidate\n`);
write('_deploy/vercel.json', JSON.stringify({ cleanUrls: true, trailingSlash: false, headers: [{ source: '/(.*)', headers: Object.entries(SEC).map(([key, value]) => ({ key, value })) }, { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }] }, null, 2) + '\n');
const sec = Object.entries(SEC).map(([k, v]) => `    add_header ${k} "${v.replace(/"/g, '\\"')}" always;`).join('\n');
write('_deploy/nginx.conf', `# Static hosting for KubeDojo. Every route is a prerendered file; unknown paths get the 404 page.\nserver {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  gzip on; gzip_types text/css application/javascript application/json image/svg+xml;\n${sec}\n  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; ${Object.entries(SEC).map(([k, v]) => `add_header ${k} "${v.replace(/"/g, '\\"')}" always;`).join(' ')} }\n  location / { try_files $uri $uri/index.html =404; }\n  error_page 404 /404.html;\n}\n`);
console.log('prerender: wrote SEO + deployment files (CSP hash ' + hash.slice(0, 18) + '…)');
