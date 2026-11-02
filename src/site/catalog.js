// Tinkerlab's catalogue: every course (from the Academy), playground, practice and reference page, by category.
// Read by the home page (/) and the switcher in every header. Courses come from the Academy index, so they never drift.
import { categories, inCategory } from '../academy/data.js';

const EXTRA = {
  devops: {
    brand: 'KubeDojo', home: '/kubernetes',
    playgrounds: [{ title: 'Cluster playground', href: '/app', blurb: 'kind, k3d, docker, kubectl and Helm 2 in a simulated terminal, with a live view of the cluster', cmd: '$ kind create cluster --name dojo' }],
    practice: [], reference: [{ title: 'Kubernetes guides', href: '/blog' }],
  },
  go: {
    brand: 'gothik', home: '/go',
    playgrounds: [
      { title: 'Go playground', href: '/go/playground', blurb: 'Write Go and watch stack frames, the heap, goroutines and channels move', cmd: 'go run main.go  # step through it' },
      { title: 'Internals labs', href: '/go/internals', blurb: 'Strings, slices, maps and the scheduler, taken apart', cmd: 'strings · slices · maps · GMP' },
      { title: 'Compare programs', href: '/go/compare', blurb: 'Run two programs side by side and see what differs', cmd: 'diff a.go b.go  # as they run' },
    ],
    practice: [{ title: 'Gotchas', href: '/go/gotchas' }, { title: 'Interview questions', href: '/go/interview' }, { title: 'Daily puzzle', href: '/go/puzzle' }],
    reference: [{ title: 'Articles', href: '/go/articles' }, { title: 'Glossary', href: '/go/glossary' }, { title: 'Reading shelf', href: '/go/reading' }],
  },
  ai: { brand: 'Full-Stack AI', home: null, playgrounds: [], practice: [], reference: [] }, // no home of its own: its courses (with their simulators) are in the Academy
};

export const NAME = 'Tinkerlab';
export const tracks = categories.map(cat => {
  const courses = inCategory(cat.id);
  const x = EXTRA[cat.id] || { brand: cat.title, home: null, playgrounds: [], practice: [], reference: [] };
  return {
    id: cat.id, name: cat.title, tagline: cat.blurb, ...x,
    courses: courses.map(c => ({ title: c.title, href: `/academy/${c.slug}`, lessons: c.lessons.length, ids: c.lessons.map(l => l.id), blurb: c.subtitle })),
    simulate: courses.filter(c => c.simulate).map(c => ({ title: c.title, href: `/academy/${c.slug}/simulate` })),
    practice: [...x.practice, ...courses.filter(c => c.engine === 'studio').map(c => ({ title: `${c.title}: review`, href: `/academy/${c.slug}/review` }))],
    reference: [...x.reference, ...courses.filter(c => c.engine === 'studio').map(c => ({ title: `${c.title}: glossary`, href: `/academy/${c.slug}/glossary` }))],
  };
});
// where each section starts, for the switcher's "Go to" row: Tinkerlab, the sections with a home page, and the Academy
export const sections = [{ title: 'Tinkerlab home', href: '/' }, ...tracks.filter(t => t.home).map(t => ({ title: t.brand, href: t.home, cat: t.id })), { title: 'Academy', href: '/academy' }];
// which category a page belongs to, for "Jump back in"
export function trackOf(path, courseBySlug) {
  if (/^\/go(\/|$)/.test(path)) return 'go';
  if (/^\/(kubernetes|app|blog)(\/|$)/.test(path)) return 'devops';
  const m = /^\/academy\/([\w-]+)/.exec(path); return (m && courseBySlug(m[1])?.category) || null;
}
