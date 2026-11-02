import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePageMeta } from '../components/usePageMeta.js';
import { categories, courses, inCategory, lessonCount } from './data.js';
import { academyMeta } from './meta.js';
import { simKey, useProgress } from './progress.js';

// When each course's Simulate was last used (read after mount: the HTML must match the prerendered page).
function useSavedSims() {
  const [saved, setSaved] = useState({});
  useEffect(() => {
    const out = {};
    try {
      for (const c of courses.filter(x => x.simulate)) for (const k of Object.keys(localStorage)) if (k.startsWith(simKey(c.slug) + '.')) {
        const at = JSON.parse(localStorage.getItem(k) || '{}').at; if (at && at > (out[c.slug] || 0)) out[c.slug] = at;
      }
    } catch { /* storage blocked: nothing is saved */ }
    setSaved(out);
  }, []);
  return saved;
}
const ago = t => { const d = Math.floor((Date.now() - t) / 864e5); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`; };

export default function Shelf() {
  usePageMeta(academyMeta('/academy'));
  const p = useProgress(); const saved = useSavedSims(); const { hash } = useLocation();
  useEffect(() => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView(); else window.scrollTo(0, 0); }, [hash]);
  return (
    <div className="wrap ac-shelf">
      <header className="ac-hero">
        <p className="kicker">Tinkerlab Academy</p>
        <h1>Learn it step by step.</h1>
        <p className="lede">{courses.length} courses and {lessonCount()} short lessons in {categories.length} categories: {categories.map(c => c.title).join(', ').replace(/, ([^,]+)$/, ' and $1')}. Each idea comes with an animation or a simulator you can break, and a quick check. Nothing runs on your computer, and your progress stays in this browser.</p>
        <nav className="ac-cats" aria-label="Categories">{categories.map(cat => <a key={cat.id} href={`#${cat.id}`} data-cat={cat.id}><i aria-hidden="true" />{cat.title}<span>{inCategory(cat.id).length}</span></a>)}</nav>
      </header>
      {p.last && (
        <Link className="ac-continue" to={p.last.href}>
          <span className="ac-label">Continue where you left off</span>
          <b>{p.last.courseTitle} · lesson {p.last.n} of {p.last.total} · {p.last.title}</b>
          <span className="ac-go" aria-hidden="true">→</span>
        </Link>
      )}
      {categories.map(cat => (
      <section key={cat.id} id={cat.id} className="ac-cat" data-cat={cat.id} aria-labelledby={`cat-${cat.id}`}>
        <h2 id={`cat-${cat.id}`} className="ac-section"><i aria-hidden="true" />{cat.title}</h2>
        <p className="ac-section-note">{cat.blurb}</p>
        <ul className="ac-courses">
          {inCategory(cat.id).map((c, i) => {
            const done = c.lessons.filter(l => p.done[l.id]).length;
            return (
              <li key={c.slug}>
                <Link to={`/academy/${c.slug}`} className="ac-course">
                  <span className="ac-label">Course {i + 1}{c.slug === 'helm-2' ? ' · new' : ''}</span>
                  <b>{c.title}</b>
                  <span className="ac-sub">{c.subtitle}</span>
                  <span className="ac-meta">{c.stages.length} stage{c.stages.length === 1 ? '' : 's'} · {c.lessons.length} lessons</span>
                  <span className="ac-bar" aria-hidden="true"><i style={{ width: `${(100 * done) / c.lessons.length}%` }} /></span>
                  <span className="ac-meta">{done ? `${done} of ${c.lessons.length} done` : 'Not started'}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      ))}
      <section id="simulate" aria-labelledby="sim-h" className="ac-simulate">
        <h2 id="sim-h" className="ac-section">Simulate</h2>
        <p className="ac-section-note">Click-through experiments, each with its own simulator: a live picture, guided steps, and a practice terminal. They are separate from the playground, and they remember where you stopped.</p>
        <ul className="ac-sims">
          {courses.filter(c => c.simulate).map(c => (
            <li key={c.slug}>
              <Link to={`/academy/${c.slug}/simulate`} className="ac-sim-card">
                <b>{c.title}</b>
                <span className="ac-sub">{c.simulate === 'k8s' ? 'Cluster, controllers, traffic, and YAML' : c.subtitle}</span>
                <span className={'ac-state' + (saved[c.slug] ? ' on' : '')}>{saved[c.slug] ? `Saved · ${ago(saved[c.slug])}` : 'Not started'}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
