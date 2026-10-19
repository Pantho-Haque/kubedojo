import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appIntent } from '../playground/loader.js';

// The home page's two ways in, beside the hero: the Academy (learn step by step) and the Dojo (the playground).
// "Continue" is read after hydration from the Academy's own saved progress, so the prerendered HTML always matches.
export default function TwoDoors() {
  const [last, setLast] = useState(null);
  useEffect(() => { try { const d = JSON.parse(localStorage.getItem('kd.academy.v1') || 'null'); if (d?.last?.href) setLast(d.last); } catch { /* nothing saved */ } }, []);
  return (
    <div className="doors" aria-label="Two ways in">
      <div className="door door-academy">
        <p className="door-label">Academy · new to this</p>
        <h2>Learn step by step</h2>
        <p>Kubernetes, Docker, Helm 3 and 2, Terraform, CI/CD · quizzes · Simulate</p>
        <p className="door-cta"><Link className="btn btn-academy" to="/academy">Start learning →</Link>{last ? <Link className="door-continue" to={last.href}>or continue {last.courseTitle}, lesson {last.n}</Link> : null}</p>
      </div>
      <div className="door door-dojo">
        <p className="door-label">Dojo · ready to type</p>
        <h2>Practise on a simulated cluster</h2>
        <p>kind · k3d · kubectl · docker · Helm 2 · export setup.sh</p>
        <p className="door-cta"><Link className="btn btn-primary" to="/app" {...appIntent}>Open Dojo →</Link></p>
      </div>
    </div>
  );
}
