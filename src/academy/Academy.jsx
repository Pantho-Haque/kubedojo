// The Academy: every Tinkerlab course (Kubernetes & DevOps, Go, AI & ML) in one place, step by step. Its own layout and accent;
// the playgrounds stay separate.
import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { lazySync } from '../lazySync.js';
import ThemeToggle from '../components/ThemeToggle.jsx';
import SuiteSwitcher from '../components/SuiteSwitcher.jsx';
import { Footer } from '../components/SiteLayout.jsx';
import NotFound from '../pages/NotFound.jsx';
import Shelf from './Shelf.jsx';
import Course from './Course.jsx';
import { courseBySlug } from './data.js';
// The shelf and course pages are light; lessons, Simulate, and progress are their own chunks.
const [Lesson, loadLesson] = lazySync(() => import('./Lesson.jsx'));
const [Simulate, loadSimulate] = lazySync(() => import('./Simulate.jsx'));
const [Progress, loadProgress] = lazySync(() => import('./Progress.jsx'));
const [StudioTools, loadStudioTools] = lazySync(() => import('./studio/StudioTools.jsx'));
// Before rendering a path for real (prerender, hydration), load the chunk it needs, so nothing suspends.
export function preloadRoute(path) {
  const m = /^\/academy(?:\/([\w-]+))?(?:\/([\w-]+))?\/?$/.exec(path) || [];
  return m[1] === 'progress' ? loadProgress() : m[2] === 'simulate' ? loadSimulate() : STUDIO_TOOLS.includes(m[2]) ? loadStudioTools() : m[2] ? loadLesson() : Promise.resolve();
}
export const preloadAll = () => Promise.all([loadLesson(), loadSimulate(), loadProgress(), loadStudioTools()]);
// the studio courses' own pages, next to their lessons (/academy/<course>/<tool>)
export const STUDIO_TOOLS = ['glossary', 'review', 'cheatsheet', 'certificate', 'project'];
import './academy.css'; // the simulators' own styles (product.css) load with the simulator chunks

function Header() {
  const loc = useLocation(), { pathname } = loc;
  const [hash, setHash] = useState(''); // the prerender never sees a hash, so read it after hydrating
  useEffect(() => setHash(loc.hash), [loc.hash]);
  const sim = hash === '#simulate' || /\/simulate\/?$/.test(pathname); // Simulate is a shelf section plus per-course pages, so NavLink can't tell
  return (
    <header className="site-header ac-header">
      <div className="wrap bar">
        <div className="ac-brand">
          <SuiteSwitcher />
          <Link to="/academy" className="ac-badge">Academy</Link>
        </div>
        <nav className="main-nav" aria-label="Academy">
          <NavLink end to="/academy" className={({ isActive }) => (isActive && !sim ? 'active' : undefined)}>Courses</NavLink>
          <Link to="/academy#simulate" className={sim ? 'active' : undefined} aria-current={sim ? 'page' : undefined}>Simulate</Link>
          <NavLink to="/academy/progress">My progress</NavLink>
        </nav>
        <ThemeToggle />
        <Link className="btn btn-sm ac-dojo-link" to="/#playgrounds">Playgrounds</Link>
      </div>
    </header>
  );
}

function AcademyLayout() {
  // Simulate and Go lessons (the Go workbench) fill the window, like the playground
  const [, c, rest] = /^\/academy\/([\w-]+)\/([\w-]+)/.exec(useLocation().pathname) || [];
  const full = rest === 'simulate' || (courseBySlug(c)?.engine === 'go' && !STUDIO_TOOLS.includes(rest));
  return (
    <div className={'site academy' + (full ? ' ac-full' : '')}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}><Suspense fallback={<div className="wrap boot" role="status">Loading…</div>}><Outlet /></Suspense></main>
      {!full && <Footer />}
    </div>
  );
}

export default function Academy() {
  return (
    <Routes>
      <Route element={<AcademyLayout />}>
        <Route index element={<Shelf />} />
        <Route path="progress" element={<Progress />} />
        <Route path=":course" element={<Course />} />
        <Route path=":course/simulate" element={<Simulate />} />
        {STUDIO_TOOLS.map(t => <Route key={t} path={`:course/${t}`} element={<StudioTools tool={t} />} />)}
        <Route path=":course/:lesson" element={<Lesson />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
