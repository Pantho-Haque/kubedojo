import { Link, NavLink, Outlet } from 'react-router-dom';
import { SITE } from '../site/site.js';
import { posts } from '../blog/data.js';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { appIntent } from '../playground/loader.js';

function Header() {
  return (
    <header className="site-header">
      <div className="wrap bar">
        <Link to="/" className="brand" aria-label={`${SITE.name} home`}><Logo /><span>{SITE.name}</span></Link>
        <nav className="main-nav" aria-label="Main">
          {SITE.nav.map(n => <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>{n.label}</NavLink>)}
        </nav>
        <ThemeToggle />
        <Link to={SITE.app.to} className="btn btn-primary btn-sm" {...appIntent}><span className="long">{SITE.app.label}</span><span className="short">Playground</span></Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Link to="/" className="brand" aria-label={`${SITE.name} home`}><Logo /><span>{SITE.name}</span></Link>
            <p className="foot-note">A simulator for learning kind, k3d, docker, kubectl and Helm 2. It runs in your browser and never touches your computer or a real cluster.</p>
          </div>
          <nav aria-label="Product"><h2>Product</h2><ul><li><Link to="/app" {...appIntent}>Playground</Link></li><li><Link to="/blog">Blog</Link></li><li><Link to="/privacy">Privacy</Link></li></ul></nav>
          <nav aria-label="Guides"><h2>The guides</h2><ul>{posts.slice(0, 6).map(p => <li key={p.slug}><Link to={`/blog/${p.slug}`}>{p.title.replace(/:.*$/, '')}</Link></li>)}</ul></nav>
        </div>
        <p className="foot-fine">Everything on this site runs locally in your browser. No analytics, no cookies.</p>
      </div>
    </footer>
  );
}

export default function SiteLayout() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}><Outlet /></main>
      <Footer />
    </>
  );
}
