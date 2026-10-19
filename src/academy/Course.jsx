import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePageMeta } from '../components/usePageMeta.js';
import NotFound from '../pages/NotFound.jsx';
import { courseBySlug, courses } from './data.js';
import { academyMeta } from './meta.js';
import { useProgress } from './progress.js';

export default function Course() {
  const { course } = useParams(); const c = courseBySlug(course); const p = useProgress();
  usePageMeta(academyMeta('/academy/' + course));
  useEffect(() => { window.scrollTo(0, 0); }, [course]);
  if (!c) return <NotFound />;
  const done = c.lessons.filter(l => p.done[l.id]).length;
  const next = c.lessons.find(l => !p.done[l.id]) || c.lessons[0];
  return (
    <div className="wrap ac-course-page">
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/academy">Academy</Link><span aria-hidden="true">/</span><span>Course {courses.indexOf(c) + 1} of {courses.length}</span></nav>
      <header className="ac-hero">
        <h1>{c.title}</h1>
        <p className="lede">{c.subtitle}. {c.description}</p>
        <div className="ac-progress-line"><span className="ac-bar" aria-hidden="true"><i style={{ width: `${(100 * done) / c.lessons.length}%` }} /></span><span>{done} of {c.lessons.length} lessons done</span></div>
        <p className="ac-actions">
          <Link className="btn btn-academy" to={`/academy/${c.slug}/${next.slug}`}>{done ? 'Continue' : 'Start'}: {next.title} →</Link>
          <Link className="btn" to={`/academy/${c.slug}/simulate`}>Open Simulate</Link>
        </p>
      </header>
      <ol className="ac-stages">
        {c.stages.map((st, si) => (
          <li key={st}>
            <h2><span className="ac-label">Stage {si + 1}</span>{st}</h2>
            <ol className="ac-lessons">
              {c.lessons.filter(l => l.stage === si).map(l => (
                <li key={l.slug} className={p.done[l.id] ? 'done' : ''}>
                  <Link to={`/academy/${c.slug}/${l.slug}`}>
                    <span className="ac-tick" aria-hidden="true">{p.done[l.id] ? '✓' : ''}</span>
                    <span className="ac-emoji" aria-hidden="true">{l.emoji}</span>
                    <span className="ac-ltitle">{l.title}{p.done[l.id] ? <span className="sr-only"> (done)</span> : null}</span>
                    <span className="ac-ltags">{l.practice ? <i>practice</i> : null}{l.quiz ? <i>{l.quiz} questions</i> : null}{l.tries ? <i>try it</i> : null}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
}
