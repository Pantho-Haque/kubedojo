import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { allTags, posts } from '../blog/data.js';
import { useProgress } from '../blog/progress.js';
import { metaFor } from '../site/meta.js';
import { usePageMeta } from '../components/usePageMeta.js';

const haystack = p => [p.title, p.description, p.tags.join(' '), p.headings.join(' ')].join(' ').toLowerCase();
const index = posts.map(p => ({ p, h: haystack(p) }));

export default function Blog() {
  usePageMeta(metaFor('/blog'));
  // Filters live in component state and are mirrored into the URL (?q=…&tag=…) so a filtered list can be shared. They start empty so the
  // prerendered HTML always matches, and are read from the URL right after hydration.
  const [{ q, tag }, setF] = useState({ q: '', tag: '' });
  useEffect(() => { const p = new URLSearchParams(location.search); setF({ q: p.get('q') || '', tag: p.get('tag') || '' }); }, []);
  const { read, last } = useProgress();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = useMemo(() => index.filter(({ p, h }) => (!tag || p.tags.includes(tag)) && terms.every(t => h.includes(t))).map(x => x.p), [q, tag]); // eslint-disable-line react-hooks/exhaustive-deps
  const apply = next => { setF(next); const p = new URLSearchParams(); if (next.q) p.set('q', next.q); if (next.tag) p.set('tag', next.tag); history.replaceState(history.state, '', location.pathname + (p.size ? '?' + p : '')); };
  const set = (k, v) => apply({ q, tag, [k]: v });
  const resume = last && posts.find(p => p.slug === last);
  const done = posts.filter(p => read.has(p.slug)).length;
  return (
    <div className="wrap blog-index">
      <header className="page-head">
        <h1>Blog</h1>
        <p className="lede">A short course on running a real multi-node Kubernetes cluster on your own computer with kind or k3d: the concepts, deployments, your own images, Helm 2, permissions and clean-up. Read it in order or jump to what you need, and try every command in the playground first.</p>
        {(done > 0 || resume) && <p className="resume" aria-live="polite">{done > 0 && <span>{done} of {posts.length} read. </span>}{resume && <>Continue with <Link to={`/blog/${resume.slug}`}>{resume.title}</Link>.</>}</p>}
      </header>
      <div className="filters" role="search">
        <label className="search"><span className="sr-only">Search posts</span>
          <input type="search" value={q} onChange={e => set('q', e.target.value)} placeholder="Search: taints, helm, kind load…" autoComplete="off" spellCheck={false} /></label>
        <div className="chips" role="group" aria-label="Filter by tag">
          <button type="button" className={!tag ? 'on' : ''} aria-pressed={!tag} onClick={() => set('tag', '')}>All</button>
          {allTags().map(t => <button type="button" key={t} className={tag === t ? 'on' : ''} aria-pressed={tag === t} onClick={() => set('tag', tag === t ? '' : t)}>{t}</button>)}
        </div>
      </div>
      <p className="count" aria-live="polite">{shown.length === posts.length ? `${posts.length} posts` : `${shown.length} of ${posts.length} posts`}</p>
      {shown.length ? (
        <ol className="post-list">
          {shown.map(p => (
            <li key={p.slug} className={read.has(p.slug) ? 'is-read' : undefined}>
              <Link to={`/blog/${p.slug}`} className="row-link">
                <span className="n" aria-hidden="true">{String(p.order).padStart(2, '0')}</span>
                <span className="body">
                  <h2>{p.title}</h2>
                  <span className="desc">{p.description}</span>
                  <span className="meta">{p.tags.map(t => <i key={t}>{t}</i>)}<span>{read.has(p.slug) ? 'read' : `${p.minutes} min read`}</span></span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : <p className="empty">Nothing matches “{q}”. <button type="button" className="link-btn" onClick={() => apply({ q: '', tag: '' })}>Clear the filters</button></p>}
    </div>
  );
}
