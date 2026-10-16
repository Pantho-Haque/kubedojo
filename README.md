# KubeDojo

**Practice Kubernetes on a cluster you can't break.** KubeDojo simulates `kind`, `k3d`, `docker`, `kubectl` and Helm 2 in the browser,
with a live view of the cluster that reacts to every command. When you are happy with what you built, it exports the cluster as a
real `setup.sh` for your own machine. A short course (the blog) teaches the real thing, step by step.

| | |
| --- | --- |
| `/` | Home page: a live demo, failure scenarios recorded from the simulator, the course, limits, FAQ |
| `/blog`, `/blog/<slug>` | The course: 9 posts rendered from the markdown in `content/blog/`, with search, tags, table of contents, copy and "Try in playground" buttons, reading progress |
| `/app` | The playground: guide of ~240 commands, up to 4 terminals, six live views, files editor with `vi`, guided tour, **⇩ Script** |
| `/privacy` | What is stored in the browser (nothing leaves it) |

Nothing leaves the page: no network calls after load (the shipped Content-Security-Policy forbids them), no Docker, no real cluster.
The browser stores only your virtual files, a "tour seen" flag, your theme and your reading progress.

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # prerendered static site in dist/
npm run preview        # serve dist/ the way production should (routes, 404, security headers) on :4173
npm run build:single   # dist-single/index.html: the whole app in ONE offline file (hash routing)
npm run check          # lint + tests + build
```

Node 22+. Chrome is needed only for the browser tests (`CHROME_BIN` to point at it).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint on the app and the scripts |
| `npm test` | Engine scenarios (30 Node suites for the simulator) and unit tests for the blog and demo pipeline |
| `node scripts/e2e.mjs` | ~100 checks in headless Chrome against the production build: every route, SEO tags, phone widths without horizontal scroll, navigation, blog search, code buttons, deep links into the playground, theme, live demo, accessibility basics, no external requests |
| `node scripts/perf.mjs` | Mobile-viewport probe: transfer size, layout shift and first paint against a budget |
| `node scripts/ui-test.mjs` | Drives the playground with synthetic input (typing, suggestions, vi, tour, export, files, tabs, reset…) |
| `npm run qa` | Rigorous browser QA (159 checks): terminal, tabs, animations, persistence, keyboard, layout / accessibility / contrast audit at six widths, stress. `node scripts/qa.mjs <section>` runs one section. Findings: `docs/QA-REPORT.md` |
| `node tests/tq1.js`, `tq2.js`, `tq3.js` | Engine QA batteries (assertions, randomized operations with invariants, grammar fuzz); run by `npm test` |
| `node scripts/parity.mjs` | Historical dev tool used for the port: renders scenarios in the original single-file prototype and diffs the DOM. It passed for every scenario before the playground UI was restyled; it will now report the intentional UI differences |
| `node scripts/make-icons.mjs` | Regenerates the PNG icons and the social card in `public/` |

## How it is built

```
content/blog/*.md          the course (front matter: title, slug, order, tags, description, date)
scripts/
  build-engine.mjs         simulator parts -> src/engine/engine.js (ESM) and tests/.engine.cjs
  build-blog.mjs           markdown -> src/blog/generated/ (HTML, TOC, reading time); fails on broken links or anchors
  build-demo.mjs           runs the REAL simulator to record the transcripts, hero frames and sample script shown on the home page
  prerender.mjs            renders every route to static HTML; writes sitemap, RSS, robots, _headers (CSP), nginx/vercel configs
src/
  engine/parts/            the framework-free simulator (shell, virtual FS, cluster controllers, kind/k3d/docker/kubectl/helm 2/gcloud, vi, export-script)
  playground/              the React playground (store.js, term.js, panes, views, tour, export modal, Embed.jsx for the home page demo)
  landing/, pages/, components/, styles/   the site: home sections, blog index and post, layout, design tokens
  blog/, site/             post loading, reading progress, per-route metadata and JSON-LD
```

Design notes: a "drafting table" concept (vellum / cyanotype, one redline accent, IBM Plex Mono for display, an annotated SVG cluster drawing that is built up as you scroll), light and dark themes (system preference, switchable), no icon cards. Motion is limited to transform/opacity, pauses off-screen, and is
off for `prefers-reduced-motion`. The home page ships ~110 KB over the wire; the simulator (a further ~160 KB gzipped) is loaded only when you ask
for it (hover/focus on a link to `/app`, or "Type your own commands").

Pages are prerendered and hydrated. The blog filters and reading progress start empty so the HTML always matches, then fill in after hydration.
The home demo's recorded session is the real simulator's output, generated at build time so it can never drift from what the playground prints.

## Adding or editing a post

Add `content/blog/NN-slug.md` with front matter, then `npm run build` (or `npm run dev`). Relative links to other posts (`other-file.md#anchor`)
are rewritten to routes and checked: a broken link or anchor fails the build. A `bash` block whose lines are all commands the simulator knows
(and have no `<placeholders>`) gets a **Try in playground** button automatically.

## Deploying

See [`deploy/README.md`](deploy/README.md). Set `VITE_SITE_URL=https://your-domain` at build time for canonical URLs, the sitemap and the RSS feed.
The build writes `dist/_headers` (Netlify, Cloudflare Pages), `dist/_deploy/nginx.conf` and `dist/_deploy/vercel.json`, and the `Dockerfile` serves it with nginx.

## The playground, briefly

- **Command palette** (Ctrl/⌘ Shift P): fuzzy search over the ~240 guide commands and every action (tour, export, new terminal, reset, views, home, blog). Enter puts a command on the prompt, Shift+Enter runs it.
- **Resizable panes**: drag the dividers, or focus one and use the arrow keys (Shift for bigger steps, Home/End for the limits, Enter collapses the guide, double-click resets). Sizes are remembered.
- **Status bar**: the cluster you are looking at, nodes ready, and pods running / pending / failing, so a broken deployment is visible without reading a table.
- **Terminal**: tabs, history, fish-style grey suggestions (Tab / → accept, Option/Ctrl + → one word), Tab completion, Ctrl-C, Ctrl-L / ⌘K, a modal `vi`, mouse selection and copy.
- **Phones and narrow windows**: one pane at a time (Guide, Terminal, Cluster) from a bottom bar.
- **Cluster view**: every object carries a kind tag and icon (Node, Deployment, Pod, Service, ConfigMap…); pods are grouped under their owner on the node that runs them, with a health ring and live counters. Adding or deleting a pod, node or Service animates in and out, status changes flash, and `prefers-reduced-motion` turns it all off. Docker, Config, Helm, Files and Events tabs share the same visual language.
- **Home page demo**: the same simulator, small, loaded only when asked, and shared with `/app` (what you build there is still there).

## What is simulated (and what is not)

Real enough to practise on: multi-node kind/k3d clusters, Deployments with rolling updates and rollbacks, probes, init containers, sidecars,
OOMKilled, node failure, HPA, PDB-blocked drains, RBAC, quotas, Ingress, Helm 2 + Tiller, `kubectl exec -it`, Dockerfiles, a modal `vi`, a Unix-ish shell.
It is a simulation: your own application code is never executed, only ~25 public Docker Hub images are known, and StatefulSets, PersistentVolumes,
CRDs and real TLS are not modelled. The first run of an exported script on a real machine is the real test.

## Licence

MIT, see `LICENSE`. The course text in `content/blog/` is yours to relicense as you see fit.
