// A lesson of an AI course (engine: studio): the Academy lesson frame around the studio's card deck.
// The prerendered page carries the lesson's text; the deck replaces it once the engine loads. Card n is #c<n>, the end is #done.
import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePageMeta } from '../../components/usePageMeta.js';
import { lessonHref, useCourseLessons } from '../data.js';
import { academyMeta } from '../meta.js';
import { markDone, setLast, useProgress } from '../progress.js';
import { TOOLS, useStudio } from './useStudio.js';
import './frame.css';

export default function StudioLesson({ course, slug }) {
  const lesson = useCourseLessons(course.slug)?.lessons[slug];
  const meta = course.lessons.find(l => l.slug === slug); const i = course.lessons.indexOf(meta);
  const p = useProgress(); const navigate = useNavigate(); const { hash } = useLocation();
  const host = useRef(null); const studio = useStudio(course.slug);
  usePageMeta(academyMeta(`/academy/${course.slug}/${slug}`));

  useEffect(() => { // where you are, for "Continue" on the home page and the Academy
    setLast({ course: course.slug, slug, href: lessonHref(course.slug, slug), title: meta.title, courseTitle: course.title, n: i + 1, total: course.lessons.length });
    window.scrollTo(0, 0);
  }, [course, slug]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { // the deck, at the card the URL names; finishing marks the lesson done in the Academy
    if (!studio) return;
    const route = studio.lessonHash(meta.id, hash);
    if (!hash) { navigate(studio.url(route), { replace: true }); return; } // name the card in the URL, so Back comes back to it
    return studio.show(host.current, route, { nav: navigate, done: markDone });
  }, [studio, hash, meta.id, navigate]);

  const prev = course.lessons[i - 1], next = course.lessons[i + 1];
  return (
    <div className="wrap post-layout ac-lesson ac-studio">
      <article className="post">
        <nav className="crumbs" aria-label="Breadcrumb"><Link to="/academy">Academy</Link><span aria-hidden="true">/</span><Link to={`/academy/${course.slug}`}>{course.title}</Link><span aria-hidden="true">/</span><span>Module {meta.stage + 1} · lesson {i + 1} of {course.lessons.length}</span></nav>
        <header className="post-head">
          <h1>{meta.title}</h1>
          <p className="post-meta"><span>{course.stages[meta.stage]}</span>{p.done[meta.id] ? <><span aria-hidden="true">·</span><span className="ac-done">✓ Done</span></> : null}</p>
        </header>
        <div className="ac-studio-host" ref={host}>
          {/* the course's own content, built from content/academy at build time; hidden once the studio draws */}
          <div className="prose ac-prose" dangerouslySetInnerHTML={{ __html: lesson?.html || '' }} />
        </div>
        <nav className="pager" aria-label="Previous and next lesson">
          {prev ? <Link className="prev" to={lessonHref(course.slug, prev.slug)}><span>Previous</span>{prev.title}</Link> : <span />}
          {next ? <Link className="next" to={lessonHref(course.slug, next.slug)}><span>Next</span>{next.title}</Link>
            : <Link className="next" to={`/academy/${course.slug}`}><span>Finished</span>Back to the {course.title} course</Link>}
        </nav>
      </article>
      <aside className="post-side">
        <nav className="course-nav" aria-label={`The ${course.title} course`}>
          <p className="toc-title">{course.title}</p>
          {course.stages.map((st, si) => (
            <div key={st} className="ac-side-stage">
              <p className="ac-label">Module {si + 1} · {st}</p>
              <ol>{course.lessons.filter(l => l.stage === si).map(l => <li key={l.slug} className={p.done[l.id] ? 'done' : ''}><Link to={lessonHref(course.slug, l.slug)} aria-current={l.slug === slug ? 'page' : undefined}>{p.done[l.id] ? '✓ ' : ''}{l.title}</Link></li>)}</ol>
            </div>
          ))}
          <p className="ac-side-sim ac-studio-tools">{TOOLS.map(([t, label]) => <Link key={t} to={`/academy/${course.slug}/${t}`}>{label}</Link>)}</p>
        </nav>
      </aside>
    </div>
  );
}
