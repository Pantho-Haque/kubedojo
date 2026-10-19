// The Academy: KubeDojo's place to learn step by step. Its own layout and accent; the playground (the Dojo) stays separate.
import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { lazySync } from '../lazySync.js';
import Logo from '../components/Logo.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { Footer } from '../components/SiteLayout.jsx';
import NotFound from '../pages/NotFound.jsx';
import Shelf from './Shelf.jsx';
import Course from './Course.jsx';
// The shelf and course pages are light; lessons, Simulate, and progress are their own chunks.
const [Lesson, loadLesson] = lazySync(() => import('./Lesson.jsx'));
const [Simulate, loadSimulate] = lazySync(() => import('./Simulate.jsx'));
const [Progress, loadProgress] = lazySync(() => import('./Progress.jsx'));
// Before rendering a path for real (prerender, hydration), load the chunk it needs, so nothing suspends.
export function preloadRoute(path) {
  const m = /^\/academy(?:\/([\w-]+))?(?:\/([\w-]+))?\/?$/.exec(path) || [];
  return m[1] === 'progress' ? loadProgress() : m[2] === 'simulate' ? loadSimulate() : m[2] ? loadLesson() : Promise.resolve();
}
export const preloadAll = () => Promise.all([loadLesson(), loadSimulate(), loadProgress()]);
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
          <Link to="/" className="brand" aria-label="KubeDojo home"><Logo /><span>KubeDojo</span></Link>
          <Link to="/academy" className="ac-badge">Academy</Link>
        </div>
        <nav className="main-nav" aria-label="Academy">
          <NavLink end to="/academy" className={({ isActive }) => (isActive && !sim ? 'active' : undefined)}>Courses</NavLink>
          <Link to="/academy#simulate" className={sim ? 'active' : undefined} aria-current={sim ? 'page' : undefined}>Simulate</Link>
          <NavLink to="/academy/progress">My progress</NavLink>
        </nav>
        <ThemeToggle />
        <Link className="btn btn-sm ac-dojo-link" to="/app" target="_blank" rel="noopener">Playground<span aria-hidden="true"> ↗</span><span className="sr-only"> (opens in a new tab)</span></Link>
      </div>
    </header>
  );
}

function AcademyLayout() {
  const full = useLocation().pathname.replace(/\/+$/, '').endsWith('/simulate'); // Simulate fills the window, like the playground
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
        <Route path=":course/:lesson" element={<Lesson />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
