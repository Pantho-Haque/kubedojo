import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePageMeta } from '../components/usePageMeta.js';
import NotFound from '../pages/NotFound.jsx';
import { courseBySlug, lessonById, lessonHref, useCourseLessons } from './data.js';
import { academyMeta } from './meta.js';
import { answer, markDone, setLast, setTask, tryKey, useProgress, winChallenge } from './progress.js';

// The practice simulator a lesson embeds, by kind: it mounts into the slot the lesson body leaves for it.
const SLOT = '[data-sim],[data-helm-sim],[data-docker-sim],[data-tf-sim],[data-ci-sim]';
async function mountPractice(slot, lesson, onWin) {
  const S = await import('./engine/sims.js'); const p = lesson.practice;
  if (p.kind === 'k8s') return S.Sim(slot, { ...p.config, id: lesson.id }, onWin);
  if (p.kind === 'docker') return S.DockerSim(slot, p.mission, onWin);
  if (p.kind === 'helm' || p.kind === 'helm2') return S.HelmSim(slot, p.mission, onWin, { v2: p.kind === 'helm2' });
  if (p.kind === 'terraform') return S.TerraformSim(slot, p.mission, onWin);
  return S.PipelineSim(slot, p.mission, onWin);
}

function Quiz({ lesson, picked }) {
  if (!lesson.quiz.length) return null;
  return (
    <section className="ac-quiz" id="quiz" aria-labelledby="quiz-h">
      <h2 id="quiz-h">Check yourself</h2>
      {lesson.quiz.map((q, qi) => {
        const got = picked?.[qi]; const right = got === q.answer;
        return (
          <div key={qi} className={'ac-q' + (right ? ' ok' : '')}>
            <p dangerouslySetInnerHTML={{ __html: q.q }} />
            <div className="ac-opts" role="group" aria-label={`Question ${qi + 1}`}>
              {q.options.map((o, oi) => (
                <button key={oi} type="button" className={got === oi ? (oi === q.answer ? 'right' : 'wrong') : ''} aria-pressed={got === oi} onClick={() => answer(lesson.id, qi, oi)} dangerouslySetInnerHTML={{ __html: o }} />
              ))}
            </div>
            <p className="ac-why" aria-live="polite">{got == null ? '' : right ? <><b>Right.</b> <span dangerouslySetInnerHTML={{ __html: q.why }} /></> : 'Not quite. Try another answer.'}</p>
          </div>
        );
      })}
    </section>
  );
}

// "Set up and try": a lesson's own Kubernetes lab, separate from Simulate and from the playground, saved per lesson.
// Coming back to the block you last used restores your cluster; any other block (or Start over) sets it up afresh.
function TryDrawer({ course, lesson, request, onClose }) {
  const host = useRef(null); const api = useRef(null); const [info, setInfo] = useState('');
  const key = tryKey(course.slug, lesson.slug); const blockKey = key + '.block';
  const setUp = i => {
    const t = lesson.tries[i]; api.current.setUp(t.setup, t.cmds);
    try { localStorage.setItem(blockKey, String(i)); } catch { /* unsaved */ }
    setInfo(t.skipped ? `Ready. The lab runs the first ${t.cmds.length} line${t.cmds.length === 1 ? '' : 's'} of this block; the other ${t.skipped} need a real cluster.` : 'Ready. Press Enter to run the command on the prompt.');
  };
  useEffect(() => {
    let alive = true;
    import('./engine/k8slab.js').then(({ mountK8sLab }) => { if (alive) api.current = mountK8sLab(host.current, { storageKey: key, hash: '#play', compact: true }); });
    return () => { alive = false; api.current?.stop(); api.current = null; };
  }, [key]);
  useEffect(() => { // each click on "Set up and try" puts the lab in that block's state
    const go = () => {
      if (!api.current) return setTimeout(go, 50);
      let last = null; try { last = localStorage.getItem(blockKey); } catch { /* none */ }
      if (request.n === 1 && api.current.restored && last === String(request.i)) { setInfo(`Restored your cluster from ${new Date(api.current.savedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}. Start over sets this block up again.`); return; }
      setUp(request.i);
    };
    go();
  }, [request.n]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="ac-try ac-product" aria-label="Try it: this lesson’s own practice cluster">
      <div className="ac-try-bar">
        <b>Try it · this lesson’s own cluster</b>
        <span className="ac-try-info" role="status">{info}</span>
        <button type="button" onClick={() => api.current && setUp(request.i)}>↺ Start over</button>
        <button type="button" onClick={onClose} aria-label="Close the practice terminal">✕</button>
      </div>
      <div className="ac-try-lab" ref={host} />
    </section>
  );
}

function LessonBody({ course, slug }) {
  const all = useCourseLessons(course.slug); const lesson = all?.lessons[slug];
  const meta = course.lessons.find(l => l.slug === slug); const i = course.lessons.indexOf(meta);
  const p = useProgress(); const body = useRef(null); const navigate = useNavigate(); const { hash } = useLocation();
  const [tryReq, setTryReq] = useState(null);
  usePageMeta(academyMeta(`/academy/${course.slug}/${slug}`));
  const hasTasks = !!lesson && /data-task=/.test(lesson.html);

  useEffect(() => { // where you are, for "Continue" on the home page and the Academy
    if (!lesson) return;
    setLast({ course: course.slug, slug, href: lessonHref(course.slug, slug), title: lesson.title, courseTitle: course.title, n: i + 1, total: course.lessons.length });
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView(); else window.scrollTo(0, 0);
  }, [course, slug, lesson]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { // the lesson's practice simulator, and "Set up and try" buttons on runnable blocks
    const el = body.current; if (!el || !lesson) return;
    let sim = null, alive = true;
    const slot = lesson.practice && el.querySelector(SLOT);
    if (slot) { slot.classList.add('ac-product', 'ac-practice'); slot.id = 'practice'; mountPractice(slot, lesson, () => winChallenge(lesson.id)).then(s => { if (alive) sim = s; else s.stop(); }); }
    el.querySelectorAll('.cmd[data-try]').forEach(c => { if (!c.querySelector('.try')) { const b = document.createElement('button'); b.type = 'button'; b.className = 'try'; b.textContent = '▶ Set up and try'; c.append(b); } });
    return () => { alive = false; sim?.stop(); if (slot) slot.innerHTML = ''; };
  }, [lesson]);
  useEffect(() => { // checklist ticks come from saved progress
    body.current?.querySelectorAll('[data-task]').forEach(x => { x.checked = !!p.tasks[lesson.id + ':' + x.dataset.task]; });
  }, [p.tasks, lesson]);
  useEffect(() => { // finishing: every quiz answer right, or every checklist item ticked
    if (!lesson || p.done[lesson.id]) return;
    if (lesson.quiz.length && lesson.quiz.every((q, qi) => p.quiz[lesson.id]?.[qi] === q.answer)) markDone(lesson.id);
    else if (!lesson.quiz.length && hasTasks) { const keys = [...body.current.querySelectorAll('[data-task]')].map(x => x.dataset.task); if (keys.every(k => p.tasks[lesson.id + ':' + k])) markDone(lesson.id); }
  }, [p, lesson, hasTasks]);

  if (!lesson) return <NotFound />;
  const prev = course.lessons[i - 1], next = course.lessons[i + 1];
  const onClick = e => {
    const t = e.target;
    const copy = t.closest('.copy');
    if (copy) { const text = copy.parentElement.querySelector('pre').textContent; const done = () => { copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy'; }, 1500); }; if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); return; }
    const tryBtn = t.closest('.try'); if (tryBtn) { setTryReq(r => ({ i: Number(tryBtn.parentElement.dataset.try), n: (r?.n || 0) + 1 })); return; }
    const go = t.closest('[data-go]'); if (go) { const hit = lessonById(go.dataset.go); if (hit) navigate(lessonHref(hit.course.slug, hit.lesson.slug)); return; }
    if (t.closest('.open-lab')) { navigate('/academy/kubernetes/simulate'); return; }
    const a = t.closest('a'); if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute('href') || ''; if (href.startsWith('/') && !href.startsWith('//')) { e.preventDefault(); navigate(href); }
  };
  const onChange = e => { const k = e.target.dataset?.task; if (k) setTask(lesson.id, k, e.target.checked); };
  return (
    <div className={'wrap post-layout ac-lesson' + (tryReq ? ' has-try' : '')}>
      <article className="post">
        <nav className="crumbs" aria-label="Breadcrumb"><Link to="/academy">Academy</Link><span aria-hidden="true">/</span><Link to={`/academy/${course.slug}`}>{course.title}</Link><span aria-hidden="true">/</span><span>Stage {lesson.stage + 1} · lesson {i + 1} of {course.lessons.length}</span></nav>
        <header className="post-head">
          <h1><span aria-hidden="true">{lesson.emoji} </span>{lesson.title}</h1>
          <p className="post-meta"><span>{course.stages[lesson.stage]}</span>{p.done[lesson.id] ? <><span aria-hidden="true">·</span><span className="ac-done">✓ Done</span></> : null}{p.ch[lesson.id] ? <><span aria-hidden="true">·</span><span className="ac-done">⭐ Challenge complete</span></> : null}</p>
        </header>
        {/* the body is this repo's own content, checked at build time for scripts and event handlers */}
        <div className="prose ac-prose" ref={body} onClick={onClick} onChange={onChange} dangerouslySetInnerHTML={{ __html: lesson.html }} />
        <Quiz lesson={lesson} picked={p.quiz[lesson.id]} />
        <nav className="pager" aria-label="Previous and next lesson">
          {prev ? <Link className="prev" to={lessonHref(course.slug, prev.slug)}><span>Previous</span>{prev.title}</Link> : <span />}
          {next ? <Link className="next" to={lessonHref(course.slug, next.slug)} onClick={() => { if (!lesson.quiz.length && !hasTasks) markDone(lesson.id); }}><span>Next</span>{next.title}</Link>
            : <Link className="next" to={`/academy/${course.slug}`} onClick={() => { if (!lesson.quiz.length && !hasTasks) markDone(lesson.id); }}><span>Finished</span>Back to the {course.title} course</Link>}
        </nav>
      </article>
      <aside className="post-side">
        <nav className="course-nav" aria-label={`The ${course.title} course`}>
          <p className="toc-title">{course.title}</p>
          {course.stages.map((st, si) => (
            <div key={st} className="ac-side-stage">
              <p className="ac-label">Stage {si + 1} · {st}</p>
              <ol>{course.lessons.filter(l => l.stage === si).map(l => <li key={l.slug} className={p.done[l.id] ? 'done' : ''}><Link to={lessonHref(course.slug, l.slug)} aria-current={l.slug === slug ? 'page' : undefined}>{p.done[l.id] ? '✓ ' : ''}{l.title}</Link></li>)}</ol>
            </div>
          ))}
          <p className="ac-side-sim"><Link to={`/academy/${course.slug}/simulate`}>Open {course.title} Simulate →</Link></p>
        </nav>
      </aside>
      {tryReq && <TryDrawer course={course} lesson={lesson} request={tryReq} onClose={() => setTryReq(null)} />}
    </div>
  );
}

function Skeleton() { return <div className="wrap post-layout"><article className="post"><div className="skeleton h1" /><div className="skeleton p" /><div className="skeleton p" /></article></div>; }

export default function Lesson() {
  const { course: slug, lesson } = useParams(); const course = courseBySlug(slug);
  if (!course || !course.lessons.some(l => l.slug === lesson)) return <NotFound />;
  return <Suspense fallback={<Skeleton />}><LessonBody key={slug + '/' + lesson} course={course} slug={lesson} /></Suspense>;
}
