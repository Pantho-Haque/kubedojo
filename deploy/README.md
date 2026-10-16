# Deploying KubeDojo

`npm run build` produces `dist/`: plain static files, one HTML file per route (`/`, `/blog`, `/blog/<slug>`, `/privacy`, `/app`) plus `404.html`.
No server code. Set `VITE_SITE_URL=https://your-domain` when building to get canonical URLs, `sitemap.xml` and `feed.xml`
(and `VITE_BASE=/sub/` if it is served from a sub-path).

The build also writes the security headers that matter, with the correct Content-Security-Policy hash for the one inline script:

| Host | What to use |
| --- | --- |
| Netlify, Cloudflare Pages | `dist/_headers` is picked up automatically. Unknown paths get `404.html`. |
| Vercel | copy `dist/_deploy/vercel.json` to the project root (clean URLs and the same headers). |
| nginx / Docker | `dist/_deploy/nginx.conf`, or just `docker build` with the Dockerfile in the project root. |
| GitHub Pages, S3 + CDN | upload `dist/`; add the headers in the CDN if it supports them. The site works without them. |

The policy sets `connect-src 'none'`: the app never makes a network request after loading, and the browser enforces it.
