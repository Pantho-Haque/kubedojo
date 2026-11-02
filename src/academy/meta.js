// Per-route metadata for the Academy: used by the prerenderer (via entry-server.jsx) and by Academy pages on navigation.
// The Academy holds every Tinkerlab course (Kubernetes & DevOps, Go, AI & ML), so its pages carry the Tinkerlab name.
import { categories, courseBySlug, lessonCount, courses, loadedCourse } from './data.js';

const NAME = 'Tinkerlab';
const TOOLS = { glossary: ['Glossary', 'Every term in the course with a short definition, and deep dives for the big ideas.'], review: ['Review', 'Spaced review of the questions you answered, due today.'], cheatsheet: ['Cheat sheet', 'The commands and formulas from every lesson on one page.'], certificate: ['Certificate', 'Your certificate for finishing the course.'], project: ['Project board', 'The capstone project, one milestone at a time, with the board growing as you finish each step.'] };

export function academyMeta(path) {
  const p = path.replace(/\/+$/, '');
  const base = { path: p, type: 'website' };
  if (p === '/academy') return { ...base, title: `Academy · ${NAME}`, description: `Learn ${categories.map(c => c.title).join(', ').replace(/, ([^,]+)$/, ' and $1')} step by step: ${courses.length} courses, ${lessonCount()} short lessons, quizzes, and simulators that run in your browser.` };
  if (p === '/academy/progress') return { ...base, title: `My progress · Academy · ${NAME}`, description: 'What you finished in the Tinkerlab Academy, kept only in this browser, and how to reset it.', noindex: true };
  const [, slug, rest] = /^\/academy\/([\w-]+)(?:\/([\w-]+))?$/.exec(p) || [];
  const c = slug && courseBySlug(slug);
  if (c && !rest) return { ...base, title: `${c.title} · Academy · ${NAME}`, description: `${c.subtitle}. ${c.description}` };
  if (c?.simulate && rest === 'simulate') return { ...base, title: `Simulate ${c.title} · Academy · ${NAME}`, description: `Click-through ${c.title} experiments with a live picture and a practice terminal. Nothing runs on your computer.` };
  if (c?.engine === 'studio' && TOOLS[rest]) return { ...base, title: `${TOOLS[rest][0]} · ${c.title} · ${NAME} Academy`, description: TOOLS[rest][1], noindex: ['review', 'certificate', 'project'].includes(rest) };
  const l = c && c.lessons.find(x => x.slug === rest);
  // the description lives with the course's lessons (loaded for any lesson page, and on the server for every page)
  if (l) return { ...base, type: 'article', title: `${l.title} · ${c.title} · ${NAME} Academy`, description: loadedCourse(c.slug)?.lessons[l.slug]?.description || c.subtitle };
  return { path: p, title: `Page not found · ${NAME}`, description: 'This page does not exist.', type: 'website', noindex: true };
}
