// A Go course lesson in the Academy: a slim bar (where you are, previous / next) over gothik's workbench, which fills the
// rest of the window. The prerendered page shows the lesson's text; the workbench (and its styles) load on the client.
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../components/usePageMeta.js';
import { useCourseLessons, lessonHref } from '../academy/data.js';
import { academyMeta } from '../academy/meta.js';
import { setLast, useProgress } from '../academy/progress.js';
import './go-lesson.css';

const Bench = lazy(() => import('./GoLessonBench.tsx'));

export default function GoLesson({ course, slug }) {
  const lesson = useCourseLessons(course.slug)?.lessons[slug];
  const i = course.lessons.findIndex(l => l.slug === slug), meta = course.lessons[i];
  const prev = course.lessons[i - 1], next = course.lessons[i + 1];
  const p = useProgress(); const [client, setClient] = useState(false);
  usePageMeta(academyMeta(`/academy/${course.slug}/${slug}`));
  useEffect(() => setClient(true), []);
  useEffect(() => { // where you are, for "Continue" on the home page and the Academy
    setLast({ course: course.slug, slug, href: lessonHref(course.slug, slug), title: meta.title, courseTitle: course.title, n: i + 1, total: course.lessons.length });
  }, [course, slug]); // eslint-disable-line react-hooks/exhaustive-deps
  const text = <div className="wrap ac-go-text"><h1>{meta.title}</h1><div className="prose" dangerouslySetInnerHTML={{ __html: lesson?.html || '' }} /></div>;
  return (
    <div className="ac-go">
      <nav className="ac-go-bar" aria-label="Breadcrumb">
        <span className="crumbs">
          <Link to="/academy">Academy</Link><span aria-hidden="true">/</span>
          <Link to={`/academy/${course.slug}`}>{course.title}</Link><span aria-hidden="true">/</span>
          <span>Stage {meta.stage + 1} · lesson {i + 1} of {course.lessons.length}{p.done[meta.id] ? <b className="ac-done"> · ✓ Done</b> : null}</span>
        </span>
        <span className="ac-go-pager">
          {prev && <Link to={lessonHref(course.slug, prev.slug)} title={prev.title}>← Previous</Link>}
          {next ? <Link to={lessonHref(course.slug, next.slug)} title={next.title}>Next →</Link> : <Link to={`/academy/${course.slug}`}>Back to the course</Link>}
        </span>
      </nav>
      <div className="ac-go-bench">{client ? <Suspense fallback={text}><Bench id={meta.id} /></Suspense> : text}</div>
    </div>
  );
}
