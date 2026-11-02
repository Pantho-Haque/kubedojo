import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';
import App, { loadAcademy, loadGo } from './App.jsx';
import './blog/data.server.js';
import './academy/data.server.js';
import { posts } from './blog/data.js';
import { courses } from './academy/data.js';
import { metaFor as siteMeta } from './site/meta.js';
import { academyMeta } from './academy/meta.js';
import { goMeta, goRoutes, goShells } from './go/meta.ts';

export const routes = () => [...goRoutes(), '/', '/kubernetes', '/blog', ...posts.map(p => '/blog/' + p.slug), '/privacy', '/academy', '/academy/progress', ...courses.flatMap(c => ['/academy/' + c.slug, ...c.lessons.map(l => `/academy/${c.slug}/${l.slug}`), ...(c.engine === 'studio' ? ['glossary', 'cheatsheet'].map(t => `/academy/${c.slug}/${t}`) : [])])];
// client-only pages: written as empty shells with the right title (like /app)
export const shells = () => ['/app', ...goShells(), ...courses.filter(c => c.simulate).map(c => `/academy/${c.slug}/simulate`), ...courses.filter(c => c.engine === 'studio').flatMap(c => ['review', 'certificate', 'project'].map(t => `/academy/${c.slug}/${t}`))];
export const metaFor = path => (/^\/academy(\/|$)/.test(path) ? academyMeta(path) : /^\/go(\/|$)/.test(path) ? goMeta(path) : siteMeta(path));
// react-dom/static waits for lazy chunks (the Academy, the playground loader) before printing, unlike renderToString
export async function render(url) {
  await (await loadAcademy()).preloadAll(); await loadGo(); // see lazySync: rendering must not suspend on a chunk
  // progressiveChunkSize: never move a big boundary (a long post) behind an inline reveal script: the CSP blocks inline scripts
  const { prelude } = await prerenderToNodeStream(<StaticRouter location={url}><App /></StaticRouter>, { progressiveChunkSize: Infinity });
  let html = ''; for await (const chunk of prelude) html += chunk; return html;
}
