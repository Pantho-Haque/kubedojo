import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePageMeta } from '../components/usePageMeta.js';
import NotFound from '../pages/NotFound.jsx';
import { courseBySlug, lessonHref } from './data.js';
import { academyMeta } from './meta.js';
import { simKey } from './progress.js';

// Docker, Helm 3, Helm 2, Terraform, CI/CD: the one-window explorer (guided steps, free play, real files).
function ExplorerSimulate({ course }) {
  const host = useRef(null); const navigate = useNavigate();
  useEffect(() => {
    let api = null, alive = true; const el = host.current;
    import('./engine/explorer.js').then(({ Explorer }) => {
      if (!alive) return;
      const practice = course.lessons.find(l => l.slug === course.practice);
      api = Explorer(el, course.simulate, { name: course.title, practiceTitle: practice.title, storageKey: simKey(course.slug), onLesson: () => navigate(lessonHref(course.slug, practice.slug)) });
    });
    return () => { alive = false; api?.stop(); el.innerHTML = ''; };
  }, [course.slug]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="ac-product ac-sim-root" ref={host} />;
}

// Kubernetes: the Academy's own cluster lab (tutorial, playground, manifests), in its own shadow root.
function K8sSimulate() {
  const host = useRef(null); const api = useRef(null); const [restored, setRestored] = useState(null);
  useEffect(() => {
    let alive = true;
    import('./engine/k8slab.js').then(({ mountK8sLab }) => {
      if (!alive) return;
      api.current = mountK8sLab(host.current, { storageKey: simKey('kubernetes') + '.lab' });
      if (api.current.restored) setRestored(api.current.savedAt);
    });
    return () => { alive = false; api.current?.stop(); api.current = null; };
  }, []);
  return (
    <div className="ac-product ac-k8s">
      <div className="ac-k8s-bar">
        <b>Kubernetes Simulate</b>
        <span role="status">{restored ? `Restored your session from ${new Date(restored).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.` : 'Its own cluster: separate from the lessons and from the playground.'}</span>
        <button type="button" onClick={() => { api.current?.reset(); setRestored(null); }}>↺ Start over</button>
        <Link to="/academy/kubernetes">Kubernetes lessons</Link>
      </div>
      <div className="ac-k8s-lab" ref={host} />
    </div>
  );
}

export default function Simulate() {
  const { course: slug } = useParams(); const course = courseBySlug(slug);
  usePageMeta(academyMeta(`/academy/${slug}/simulate`));
  if (!course) return <NotFound />;
  return course.simulate === 'k8s' ? <K8sSimulate /> : <ExplorerSimulate key={course.slug} course={course} />;
}
