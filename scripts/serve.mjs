// Serves dist/ the way production hosting should: every route is a file (path, path/index.html), unknown paths get 404.html,
// and the security headers from dist/_headers (including the Content-Security-Policy) are sent, so violations show up locally.
//   usage: node scripts/serve.mjs [port] [dir]
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, isAbsolute, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const port = Number(process.argv[2] || 4173); const dir = isAbsolute(process.argv[3] || '') ? process.argv[3] : join(root, process.argv[3] || 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };
const sec = {}; try { const h = readFileSync(join(dir, '_headers'), 'utf8').split('\n\n')[0]; for (const l of h.split('\n').slice(1)) { const i = l.indexOf(':'); if (i > 0) sec[l.slice(0, i).trim()] = l.slice(i + 1).trim(); } } catch (e) { /* no _headers */ }
const file = p => { for (const c of [p, join(p, 'index.html'), p + '.html']) if (existsSync(c) && statSync(c).isFile()) return c; return null; };
createServer((req, res) => {
  const url = new URL(req.url, 'http://x'); const p = normalize(join(dir, decodeURIComponent(url.pathname)));
  if (!p.startsWith(dir)) { res.writeHead(403).end(); return; }
  let f = file(p); let status = 200; if (!f) { f = join(dir, '404.html'); status = 404; }
  const asset = url.pathname.startsWith('/assets/');
  const type = TYPES[extname(f)] || 'application/octet-stream'; let body = readFileSync(f); const headers = { ...sec, 'Content-Type': type, 'Cache-Control': asset ? 'public, max-age=31536000, immutable' : 'no-cache' };
  if (/text|javascript|json|svg|xml/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) { body = gzipSync(body); headers['Content-Encoding'] = 'gzip'; headers.Vary = 'Accept-Encoding'; } // so measured transfer sizes are realistic
  res.writeHead(status, headers); res.end(body);
}).listen(port, () => console.log(`serving ${dir} on http://localhost:${port}`));
