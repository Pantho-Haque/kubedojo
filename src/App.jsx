import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { loadPlayground } from './playground/loader.js';
import { lazySync } from './lazySync.js';
import SiteLayout from './components/SiteLayout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Home from './pages/Home.jsx';
import Blog from './pages/Blog.jsx';
import Post from './pages/Post.jsx';
import Privacy from './pages/Privacy.jsx';
import NotFound from './pages/NotFound.jsx';

// The playground (simulator + UI, ~160 KB gzipped) is its own chunk: the home page and the blog never download it.
const Playground = lazy(loadPlayground);
// The Academy is its own chunk too; see lazySync for why the prerenderer and the hydration load it before rendering.
const [Academy, loadAcademy] = lazySync(() => import('./academy/Academy.jsx'));
export { loadAcademy };

export default function App() {
  return (
    <Routes>
      <Route path="/app" element={<ErrorBoundary><Suspense fallback={<div className="boot" role="status">Loading the playground…</div>}><Playground /></Suspense></ErrorBoundary>} />
      <Route path="/academy/*" element={<ErrorBoundary><Suspense fallback={<div className="boot" role="status">Loading the Academy…</div>}><Academy /></Suspense></ErrorBoundary>} />
      <Route element={<div className="site"><SiteLayout /></div>}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<Post />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
