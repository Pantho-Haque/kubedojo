// Per-route metadata and the prerender list for gothik's pages (/go/…), in the shape src/site/meta.js uses.
import { D, INTERNALS_TABS } from './lib/data';

const NAME = 'gothik';
const DESC = 'gothik — write Go and watch it run: stack frames, heap, pointers, goroutines and channels, animated step by step.';
const page = (path: string, title: string, description = DESC, noindex = false) => ({ path, title: `${title} · ${NAME}`, description, type: 'website', ...(noindex && { noindex }) });

export function goMeta(path: string) {
  const p = path.replace(/\/+$/, '') || '/go';
  const [, a = '', b = '', c = ''] = p.split('/').slice(1);
  if (!a) return { path: p, title: `${NAME} — watch your Go run`, description: DESC, type: 'website' };
  const TOP: Record<string, string> = { learn: 'Learn', playground: 'Playground', articles: 'Articles', reading: 'Reading', glossary: 'Glossary', gotchas: 'Go gotchas', interview: 'Go interview questions', puzzle: 'Daily puzzle', compare: 'Compare two programs', about: 'About', embed: 'Embedded program', internals: 'Internals' };
  if (!b && TOP[a]) return page(p, TOP[a], DESC, a === 'embed');
  if (a === 'articles' && D.lesson(b)) return page(p, D.lesson(b)!.title);
  if (a === 'reading' && D.doc(b) && (!c || (c === 'full' && D.doc(b)!.section))) return page(p, D.doc(b)!.title);
  if (a === 'gotchas' && D.gotcha(b)) return page(p, D.gotcha(b)!.title);
  if (a === 'interview' && D.interview.some((q) => q.id === b)) return page(p, D.interview.find((q) => q.id === b)!.title);
  if (a === 'internals' && INTERNALS_TABS[b]) return page(p, 'Internals · ' + INTERNALS_TABS[b]);
  if (a === 'certificate' && D.track(b)) return page(p, 'Certificate · ' + D.track(b)!.title);
  if (a === 'learn') return page(p, D.lesson(b)?.title || 'Lesson', DESC, true); // forwards to the Academy
  return { path: p, title: `Page not found · ${NAME}`, description: 'This page does not exist.', type: 'website', noindex: true };
}

/** Every gothik page worth a prerendered file. */
export const goRoutes = () => [
  '/go', ...['learn', 'playground', 'articles', 'reading', 'glossary', 'gotchas', 'interview', 'puzzle', 'compare', 'about', 'embed'].map((x) => '/go/' + x),
  ...D.lessons.map((l) => '/go/articles/' + l.id),
  ...D.corpus.flatMap((d) => ['/go/reading/' + d.id, ...(d.section ? ['/go/reading/' + d.id + '/full'] : [])]),
  ...D.gotchas.map((g) => '/go/gotchas/' + g.id), ...D.interview.map((q) => '/go/interview/' + q.id),
  ...Object.keys(INTERNALS_TABS).map((t) => '/go/internals/' + t), ...D.tracks.map((t) => '/go/certificate/' + t.id),
];

/** Client-only pages that only forward: old /go/learn/<id> links (to the Academy) and /go/internals (to its first tab). */
export const goShells = () => ['/go/internals', ...D.lessons.map((l) => '/go/learn/' + l.id)];
