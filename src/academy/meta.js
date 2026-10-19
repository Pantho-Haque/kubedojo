// Per-route metadata for the Academy: used by the prerenderer (via entry-server.jsx) and by Academy pages on navigation.
import { SITE } from '../site/site.js';
import { courseBySlug, lessonCount, courses, loadedCourse } from './data.js';

export function academyMeta(path) {
  const p = path.replace(/\/+$/, '');
  const base = { path: p, type: 'website' };
  if (p === '/academy') return { ...base, title: `Academy · ${SITE.name}`, description: `Learn Kubernetes and the tools around it step by step: ${courses.length} courses, ${lessonCount()} short lessons, quizzes, and simulators that run in your browser.` };
  if (p === '/academy/progress') return { ...base, title: `My progress · Academy · ${SITE.name}`, description: 'What you finished in the KubeDojo Academy, kept only in this browser, and how to reset it.', noindex: true };
  const [, slug, rest] = /^\/academy\/([\w-]+)(?:\/([\w-]+))?$/.exec(p) || [];
  const c = slug && courseBySlug(slug);
  if (c && !rest) return { ...base, title: `${c.title} · Academy · ${SITE.name}`, description: `${c.subtitle}. ${c.description}` };
  if (c && rest === 'simulate') return { ...base, title: `Simulate ${c.title} · Academy · ${SITE.name}`, description: `Click-through ${c.title} experiments with a live picture and a practice terminal. Nothing runs on your computer.` };
  const l = c && c.lessons.find(x => x.slug === rest);
  // the description lives with the course's lessons (loaded for any lesson page, and on the server for every page)
  if (l) return { ...base, type: 'article', title: `${l.title} · ${c.title} · ${SITE.name} Academy`, description: loadedCourse(c.slug)?.lessons[l.slug]?.description || c.subtitle };
  return { path: p, title: `Page not found · ${SITE.name}`, description: 'This page does not exist.', type: 'website', noindex: true };
}
