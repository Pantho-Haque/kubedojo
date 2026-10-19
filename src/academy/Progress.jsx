import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../components/usePageMeta.js';
import { courses } from './data.js';
import { academyMeta } from './meta.js';
import { resetAcademy, resetCourse, useProgress } from './progress.js';

// A reset asks once more in place (no browser dialog): the first click arms it, the second does it.
function ResetButton({ label, onReset }) {
  const [armed, setArmed] = useState(false);
  return armed
    ? <span className="ac-confirm"><button type="button" className="btn btn-sm ac-danger" onClick={() => { onReset(); setArmed(false); }}>Yes, reset</button><button type="button" className="btn btn-sm" onClick={() => setArmed(false)}>Keep it</button></span>
    : <button type="button" className="btn btn-sm" onClick={() => setArmed(true)}>{label}</button>;
}

export default function Progress() {
  usePageMeta(academyMeta('/academy/progress'));
  const p = useProgress();
  return (
    <div className="wrap ac-progress-page">
      <header className="ac-hero">
        <h1>My progress</h1>
        <p className="lede">Everything here lives only in this browser: finished lessons, quiz answers, checklist ticks, and the simulators’ saved sessions. Nothing is sent anywhere.</p>
      </header>
      <ul className="ac-prog-list">
        {courses.map(c => {
          const done = c.lessons.filter(l => p.done[l.id]).length, ch = c.lessons.filter(l => p.ch[l.id]).length, prac = c.lessons.filter(l => l.practice).length;
          return (
            <li key={c.slug}>
              <div><Link to={`/academy/${c.slug}`}><b>{c.title}</b></Link><span className="ac-meta">{done} of {c.lessons.length} lessons{prac ? ` · ${ch} of ${prac} practice challenges` : ''}</span></div>
              <span className="ac-bar" aria-hidden="true"><i style={{ width: `${(100 * done) / c.lessons.length}%` }} /></span>
              <ResetButton label="Reset this course" onReset={() => resetCourse(c)} />
            </li>
          );
        })}
      </ul>
      <section className="ac-storage" aria-labelledby="storage-h">
        <h2 id="storage-h">What is saved, and how to remove it</h2>
        <ul>
          <li><code>kd.academy.v1</code>: lessons finished, quiz answers, checklist ticks, and where you stopped.</li>
          <li><code>kd.academy.sim.v1.…</code>: each Simulate experiment’s picture, step, challenges, and terminal. <b>↺ Start over</b> in Simulate clears one; <code>clear</code> in its terminal clears that terminal’s history.</li>
          <li><code>kd.academy.try.v1.…</code>: each lesson’s “Set up and try” cluster. <b>↺ Start over</b> in the drawer sets it up again.</li>
          <li><code>kd.academy.tour.v1.…</code>: that you have seen a Simulate tour.</li>
        </ul>
        <p>Resetting a course removes its keys; resetting the Academy removes all of them. The playground keeps its own state and is not affected.</p>
        <ResetButton label="Reset the whole Academy" onReset={resetAcademy} />
      </section>
    </div>
  );
}
