import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';
import App, { loadAcademy } from './App.jsx';
import './blog/data.server.js';
import './academy/data.server.js';
import { posts } from './blog/data.js';
import { courses } from './academy/data.js';
import { metaFor as siteMeta } from './site/meta.js';
import { academyMeta } from './academy/meta.js';

export const routes = () => ['/', '/blog', ...posts.map(p => '/blog/' + p.slug), '/privacy', '/academy', '/academy/progress', ...courses.flatMap(c => ['/academy/' + c.slug, ...c.lessons.map(l => `/academy/${c.slug}/${l.slug}`)])];
// client-only pages: written as empty shells with the right title (like /app)
export const shells = () => ['/app', ...courses.map(c => `/academy/${c.slug}/simulate`)];
export const metaFor = path => (/^\/academy(\/|$)/.test(path) ? academyMeta(path) : siteMeta(path));
// react-dom/static waits for lazy chunks (the Academy, the playground loader) before printing, unlike renderToString
export async function render(url) {
  await (await loadAcademy()).preloadAll(); // see lazySync: rendering must not suspend on a chunk
  // progressiveChunkSize: never move a big boundary (a long post) behind an inline reveal script: the CSP blocks inline scripts
  const { prelude } = await prerenderToNodeStream(<StaticRouter location={url}><App /></StaticRouter>, { progressiveChunkSize: Infinity });
  let html = ''; for await (const chunk of prelude) html += chunk; return html;
}
