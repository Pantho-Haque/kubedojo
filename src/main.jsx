import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { loadPost } from './blog/data.js';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import './styles/base.css';
import './styles/home.css';
import './styles/blog.css';

// Production builds are prerendered to static HTML per route and hydrated here. The single-file build (VITE_ROUTER=hash) is
// rendered from scratch with hash routing so it works from file://.
const hash = import.meta.env.VITE_ROUTER === 'hash';
const Router = hash ? HashRouter : BrowserRouter;
const root = document.getElementById('root');
const tree = <StrictMode><Router><App /></Router></StrictMode>;

async function start() {
  const path = location.pathname.replace(/\/+$/, '');
  if (!hash && root.hasAttribute('data-prerendered') && !path.startsWith('/app')) {
    const m = /^\/blog\/([\w-]+)$/.exec(path); if (m) await loadPost(m[1]); // the post must be in memory before hydrating, or the markup would not match
    hydrateRoot(root, tree);
  } else createRoot(root).render(tree);
}
start();
