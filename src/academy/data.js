// Academy data. The course index (small) ships with every Academy page; each course's lessons are their own chunk.
import index from './generated/index.json';

export const courses = index.courses; // sorted by course order
export const courseBySlug = slug => courses.find(c => c.slug === slug) || null;
export const lessonCount = () => courses.reduce((n, c) => n + c.lessons.length, 0);
// lesson ids are unique across the Academy; links inside lessons (data-go) use them
export function lessonById(id) { for (const c of courses) { const l = c.lessons.find(x => x.id === id); if (l) return { course: c, lesson: l }; } return null; }
export const lessonHref = (course, slug) => `/academy/${course}/${slug}`;

const loaders = import.meta.glob('./generated/courses/*.json');
const cache = new Map(); const pending = new Map();
export function seedCourse(c) { cache.set(c.slug, c); } // used by the prerenderer and before hydration
export const loadedCourse = slug => cache.get(slug) || null;
export function loadCourse(slug) {
  if (cache.has(slug)) return Promise.resolve(cache.get(slug));
  const key = `./generated/courses/${slug}.json`; if (!loaders[key]) return Promise.resolve(null);
  if (!pending.has(slug)) pending.set(slug, loaders[key]().then(m => { cache.set(slug, m.default); return m.default; }));
  return pending.get(slug);
}
// React Suspense helper: returns the course's lessons, or throws the loading promise
export function useCourseLessons(slug) {
  const hit = cache.get(slug); if (hit) return hit; if (!loaders[`./generated/courses/${slug}.json`]) return null;
  throw loadCourse(slug);
}
