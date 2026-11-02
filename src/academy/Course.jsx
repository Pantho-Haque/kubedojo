import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePageMeta } from '../components/usePageMeta.js';
import NotFound from '../pages/NotFound.jsx';
import { categoryOf, courseBySlug, inCategory } from './data.js';
import { academyMeta } from './meta.js';
import { useProgress } from './progress.js';
import StudioPanel from './studio/StudioPanel.jsx';

export default function Course() {
  const { course } = useParams(); const c = courseBySlug(course); const p = useProgress();
  usePageMeta(academyMeta('/academy/' + course));
  useEffect(() => { window.scrollTo(0, 0); }, [course]);
  if (!c) return <NotFound />;
  const done = c.lessons.filter(l => p.done[l.id]).length;
  const cat = categoryOf(c), siblings = inCategory(c.category);
  const next = c.lessons.find(l => !p.done[l.id]) || c.lessons[0];
  return (
    <div className="wrap ac-course-page" data-cat={c.category}>
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/academy">Academy</Link><span aria-hidden="true">/</span><Link to={`/academy#${cat.id}`}>{cat.title}</Link><span aria-hidden="true">/</span><span>Course {siblings.indexOf(c) + 1} of {siblings.length}</span></nav>
      <header className="ac-hero">
        <h1>{c.title}</h1>
        <p className="lede">{c.subtitle}. {c.description}</p>
        <div className="ac-progress-line"><span className="ac-bar" aria-hidden="true"><i style={{ width: `${(100 * done) / c.lessons.length}%` }} /></span><span>{done} of {c.lessons.length} lessons done</span></div>
        <p className="ac-actions">
          <Link className="btn btn-academy" to={`/academy/${c.slug}/${next.slug}`}>{done ? 'Continue' : 'Start'}: {next.title} →</Link>
          {c.simulate && <Link className="btn" to={`/academy/${c.slug}/simulate`}>Open Simulate</Link>}
          {c.engine === 'go' && <Link className="btn" to="/go/playground">Open the Go playground</Link>}
        </p>
      </header>
      {c.engine === 'studio' && <StudioPanel course={c} />}
      <ol className="ac-stages">
        {c.stages.map((st, si) => {
          const ls = c.lessons.filter(l => l.stage === si), k = ls.filter(l => p.done[l.id]).length;
          return (
          <li key={st} className="ac-stage">
            <h2><span className="ac-label">Stage {String(si + 1).padStart(2, '0')}</span><span className="ac-stage-t">{st}</span><span className="ac-stage-n">{k ? `${k} of ${ls.length} done` : `${ls.length} lesson${ls.length === 1 ? '' : 's'}`}</span></h2>
            <ol className="ac-lessons">
              {ls.map(l => (
                <li key={l.slug} className={p.done[l.id] ? 'done' : ''}>
                  <Link to={`/academy/${c.slug}/${l.slug}`}>
                    <span className="ac-num" aria-hidden="true">{String(c.lessons.indexOf(l) + 1).padStart(2, '0')}</span>
                    <span className="ac-tick" aria-hidden="true">{p.done[l.id] ? '✓' : ''}</span>
                    <span className="ac-emoji" aria-hidden="true">{l.emoji}</span>
                    <span className="ac-ltitle">{l.title}{p.done[l.id] ? <span className="sr-only"> (done)</span> : null}</span>
                    <span className="ac-ltags">{l.practice ? <i>practice</i> : null}{l.quiz ? <i>{l.quiz} question{l.quiz === 1 ? '' : 's'}</i> : null}{l.tries ? <i>try it</i> : null}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </li>
          );
        })}
      </ol>
    </div>
  );
}
