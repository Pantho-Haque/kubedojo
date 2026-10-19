import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { neighbours, posts, usePost } from '../blog/data.js';
import { markRead, setLast } from '../blog/progress.js';
import { metaFor } from '../site/meta.js';
import { usePageMeta } from '../components/usePageMeta.js';
import NotFound from './NotFound.jsx';
import { appIntent, preloadPlayground } from '../playground/loader.js';

const total = posts.filter(p => p.order > 0).length;

function Toc({ toc, active }) {
  if (!toc.length) return null;
  return (
    <nav className="toc" aria-label="On this page">
      <p className="toc-title">On this page</p>
      <ol>{toc.map(t => <li key={t.id} className={'d' + t.depth + (active === t.id ? ' on' : '')}><a href={`#${t.id}`} aria-current={active === t.id ? 'true' : undefined}>{t.text}</a></li>)}</ol>
    </nav>
  );
}

function PostBody({ slug }) {
  const post = usePost(slug); const { hash } = useLocation(); const navigate = useNavigate();
  const [active, setActive] = useState(''); const body = useRef(null);
  usePageMeta(post ? metaFor('/blog/' + slug) : {});

  useEffect(() => { // jump to #anchor (the router does not), or to the top
    if (!post) return; if (hash) { const el = document.getElementById(decodeURIComponent(hash.slice(1))); if (el) { el.scrollIntoView(); return; } } window.scrollTo(0, 0);
  }, [slug, hash, post]);
  useEffect(() => { // remember where you are in the course, mark the post read near the end, and follow the heading in view
    if (!post) return; setLast(slug);
    const heads = [...body.current.querySelectorAll('h2[id], h3[id]')];
    const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) setActive(e.target.id); }, { rootMargin: '-72px 0px -70% 0px' });
    heads.forEach(h => io.observe(h));
    // Mark the post read once the bottom is reached. Two strategies so it works for short posts (the
    // sentinel was already in view on mount) and for instant scrolls (the observer may not fire):
    //  1. IntersectionObserver on the #post-end sentinel.
    //  2. A throttled scroll listener that checks scrollY against the document height.
    let marked = false; const mark = () => { if (marked) return; marked = true; markRead(slug); };
    const end = document.getElementById('post-end');
    const done = new IntersectionObserver(([e]) => { if (e.isIntersecting) mark(); }, { threshold: 0 });
    if (end) done.observe(end);
    // Also fire once on mount: if the post fits entirely in the viewport, the sentinel is in view already.
    if (end && end.getBoundingClientRect().top < window.innerHeight) mark();
    let raf = 0; const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const d = document.documentElement; if (window.innerHeight + window.scrollY >= d.scrollHeight - 4) mark(); }); };
    window.addEventListener('scroll', onScroll, { passive: true });
    // And one immediate check (covers tests that scroll before the first scroll event fires).
    onScroll();
    return () => { io.disconnect(); done.disconnect(); window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [slug, post]);

  if (!post) return <NotFound />;
  const { prev, next } = neighbours(slug);
  const onClick = e => { // copy buttons, and in-site links without a page reload
    const copy = e.target.closest('.code-copy');
    if (copy) { const code = copy.closest('figure').querySelector('code'); const text = code.textContent; const done = () => { copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy'; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else { const r = document.createRange(); r.selectNodeContents(code); const s = getSelection(); s.removeAllRanges(); s.addRange(r); try { document.execCommand('copy'); } catch (er) { /* ignore */ } s.removeAllRanges(); done(); } return; }
    const a = e.target.closest('a'); if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('/') && !href.startsWith('//')) { e.preventDefault(); navigate(href); } // in-site links (posts, /app?run=…) without a page reload
  };
  return (
    <>
      <div className="read-progress" aria-hidden="true"></div>
      <div className="wrap post-layout">
        <article className="post">
          <nav className="crumbs" aria-label="Breadcrumb"><Link to="/blog">Blog</Link><span aria-hidden="true">/</span><span>{post.order === 0 ? 'Start here' : `Part ${post.order} of ${total}`}</span></nav>
          <header className="post-head">
            <h1>{post.title}</h1>
            <p className="lede">{post.description}</p>
            <p className="post-meta"><span>{post.minutes} min read</span><span aria-hidden="true">·</span><time dateTime={post.date}>Updated {post.date}</time>{post.tags.map(t => <Link key={t} className="tag" to={`/blog?tag=${t}`}>{t}</Link>)}</p>
          </header>
          <details className="toc-mobile"><summary>On this page</summary><Toc toc={post.toc} active={active} /></details>
          <div className="prose" ref={body} onClick={onClick} onPointerOver={e => { if (e.target.closest && e.target.closest('.code-try')) preloadPlayground(); }} dangerouslySetInnerHTML={{ __html: post.html }} />
          <div id="post-end" style={{ height: 1 }} />
          <aside className="try-cta"><div><strong>Try it before you type it on your machine.</strong><span>The playground runs every command in these guides against a simulated cluster.</span></div><Link className="btn btn-primary" to="/app" {...appIntent}>Open playground</Link></aside>
          <nav className="pager" aria-label="Previous and next post">
            {prev ? <Link className="prev" to={`/blog/${prev.slug}`}><span>Previous</span>{prev.title}</Link> : <span />}
            {next ? <Link className="next" to={`/blog/${next.slug}`}><span>Next</span>{next.title}</Link> : <span />}
          </nav>
        </article>
        <aside className="post-side"><Toc toc={post.toc} active={active} /><nav className="course-nav" aria-label="The course"><p className="toc-title">The course</p><ol>{posts.map(p => <li key={p.slug}><Link to={`/blog/${p.slug}`} aria-current={p.slug === slug ? 'page' : undefined}>{p.title.replace(/:.*$/, '')}</Link></li>)}</ol></nav></aside>
      </div>
    </>
  );
}

function Skeleton() { return <div className="wrap post-layout"><article className="post"><div className="skeleton h1" /><div className="skeleton p" /><div className="skeleton p" /></article></div>; }

export default function Post() {
  const { slug } = useParams();
  return <Suspense fallback={<Skeleton />}><PostBody key={slug} slug={slug} /></Suspense>;
}
