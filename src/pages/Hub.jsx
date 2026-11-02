// Tinkerlab home: every course (all in the Academy), playground and practice page, by category, in one place.
// The catalogue (site/catalog.js) reads the Academy's own index; each category keeps its own colour (--cat).
// The hero is a "bench" of three instruments, one per section, each a small looping moment of what that section does.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NAME, tracks as T } from '../site/catalog.js';
import { metaFor } from '../site/meta.js';
import { usePageMeta } from '../components/usePageMeta.js';
import { useProgress } from '../academy/progress.js';
import ThemeToggle from '../components/ThemeToggle.jsx';
import Logo, { TinkerMark } from '../components/Logo.jsx';
import '../styles/hub.css';

const sum = f => T.reduce((n, t) => n + f(t), 0);
const n = (k, w) => `${k} ${w}${k === 1 ? '' : 's'}`;
const lessonsIn = t => t.courses.reduce((k, c) => k + c.lessons, 0);
const playsIn = t => t.playgrounds.length + t.simulate.length;
const AI_ICON = 'M6.5 7L2 12l4.5 5 M17.5 7l4.5 5-4.5 5 M12 7.2l1.35 3.45 3.45 1.35-3.45 1.35L12 16.8l-1.35-3.45L7.2 12l3.45-1.35z';
const Glyph = ({ t, size = 30 }) => (t.id === 'devops' ? <Logo size={size} /> : t.id === 'go' ? <span className="tl-g" aria-hidden="true">g.</span>
  : <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={AI_ICON} /></svg>);
const startOf = t => t.home || `/academy#${t.id}`;

// The three instruments. Decorative (aria-hidden): each panel is one link to its section, labelled in words.
// The AI one is the sampling lesson's own example (ai-engineering/a.js): softmax of its logits at temperature 1.
const DEMO = {
  devops: (
    <pre className="b-term"><span className="b-cmd"><b>$</b> kubectl get pods</span>{'\n'}
      <span className="b-dim">NAME            READY  STATUS</span>{'\n'}
      web-7d9f-x2k    1/1    <span className="b-ok">Running</span>{'\n'}
      web-7d9f-p8q    <span className="b-swap"><span><span className="b-bad">0/1</span>    <span className="b-bad">CrashLoopBackOff</span></span><span>1/1    <span className="b-ok">Running</span></span></span>{'\n'}
      api-5c4b-m1z    1/1    <span className="b-ok">Running</span>
    </pre>
  ),
  go: (
    <div className="b-go">
      <pre className="b-code"><span>s := make([]int, 3, 4)</span><span className="b-step">s = append(s, 7)</span></pre>
      <div className="b-mem">
        <div className="b-frame"><span className="b-dim">stack · main</span><span>s <em>len <b className="b-flip"><i>3</i><i>4</i></b> cap 4</em></span></div>
        <span className="b-arrow" />
        <div className="b-heap"><span className="b-dim">heap</span><span className="b-cells"><i>0</i><i>0</i><i>0</i><i className="b-new">7</i></span></div>
      </div>
    </div>
  ),
  ai: (
    <div className="b-ai">
      <p><span className="b-dim">next token ·</span> The capital of France is <span className="b-tok">Paris</span><span className="b-caret" /></p>
      {[['Paris', 79], ['a', 11], ['located', 6], ['Lyon', 3]].map(([w, p], i) => (
        <span key={w} className="b-bar" style={{ '--p': p / 100, '--i': i }}><span>{w}</span><i /><span>.{String(p).padStart(2, '0')}</span></span>
      ))}
    </div>
  ),
};

function Bench() {
  return (
    <div className="tl-bench">{T.map(t => (
      <Link key={t.id} to={startOf(t)} className="tl-panel" data-cat={t.id} aria-label={`${t.home ? 'Open ' + t.brand : 'Browse the ' + t.name + ' courses'}: ${t.tagline}`}>
        <span className="tl-panel-bar" aria-hidden="true"><i />{t.brand}<span>{t.name}</span><b>open →</b></span>
        <span className="tl-panel-body" aria-hidden="true">{DEMO[t.id]}</span>
      </Link>
    ))}</div>
  );
}

function JumpBack() {
  const [last, setLast] = useState([]); // read after hydrating: the prerendered HTML has no history
  useEffect(() => { try { const l = JSON.parse(localStorage.getItem('tinkerlab:last') || '{}'); setLast(T.filter(t => l[t.id]).map(t => ({ t, ...l[t.id] })).sort((a, b) => b.at - a.at)); } catch { /* storage blocked */ } }, []);
  if (!last.length) return null;
  return (
    <section className="wrap tl-back" aria-labelledby="tl-back">
      <h2 id="tl-back">Jump back in</h2>
      <ul>{last.map(x => (
        <li key={x.t.id}><Link to={x.href} data-cat={x.t.id}><span className="tl-back-k"><i />{x.t.brand}</span><b>{x.title.replace(/ [·|—-] [^·|—-]+$/, '')}</b><span className="tl-back-go">Continue →</span></Link></li>
      ))}</ul>
    </section>
  );
}

function Lab({ t, done }) {
  return (
    <div className="tl-lab" data-cat={t.id}>
      <div className="tl-lab-side">
        <p className="tl-lab-brand"><Glyph t={t} size={26} />{t.brand}</p>
        <h3>{t.name}</h3>
        <p>{t.tagline}</p>
        <p className="tl-lab-n">{n(t.courses.length, 'course')} · {lessonsIn(t)} lessons{playsIn(t) ? ` · ${n(playsIn(t), 'playground')}` : ''}</p>
        <p className="tl-lab-go">
          {t.home ? <Link to={t.home} className="btn btn-sm">Open {t.brand} →</Link> : <Link to={`/academy#${t.id}`} className="btn btn-sm">Browse in the Academy →</Link>}
          {t.playgrounds[0] && <Link to={t.playgrounds[0].href} className="tl-lab-play">{t.playgrounds[0].title}</Link>}
        </p>
      </div>
      <ol className="tl-rows">{t.courses.map((c, i) => {
        const k = c.ids.filter(id => done[id]).length;
        return (
          <li key={c.href}>
            <Link to={c.href} className="tl-row">
              <span className="tl-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="tl-row-t"><b>{c.title}</b><span>{c.blurb}</span></span>
              <span className="tl-row-n">{k ? `${k} of ${c.lessons} done` : `${c.lessons} lessons`}<span className="tl-meter" style={{ '--p': k / c.lessons }} aria-hidden="true" /></span>
            </Link>
          </li>
        );
      })}</ol>
    </div>
  );
}

export default function Hub() {
  usePageMeta(metaFor('/'));
  const { done } = useProgress();
  const ops = T.find(t => t.id === 'devops'), sims = ops.simulate;
  return (
    <div className="tl">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="wrap bar">
          <Link to="/" className="brand tl-brand" aria-label="Tinkerlab home"><TinkerMark /><span>{NAME}</span></Link>
          <nav className="main-nav" aria-label="Main"><a href="#courses">Courses</a><a href="#playgrounds">Playgrounds</a><a href="#practice">Practice</a></nav>
          <ThemeToggle />
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="tl-hero">
          <div className="wrap tl-hero-in">
            <div className="tl-hero-copy">
              <p className="tl-read"><span>{T.length} labs</span><span>{sum(t => t.courses.length)} courses</span><span>{sum(lessonsIn)} lessons</span><span>{sum(playsIn)} playgrounds</span></p>
              <h1>Learn by tinkering with things you can&apos;t break.</h1>
              <p className="tl-lead">A simulated Kubernetes cluster you can wreck, Go programs you can watch run, and AI models you can open up. Every lesson comes with an animation, a simulator and a quick check.</p>
              <p className="tl-ctas"><a className="btn btn-primary" href="#courses">Browse all courses</a><a className="btn" href="#playgrounds">Open a playground</a></p>
              <p className="tl-note">No install, no account. Everything runs in your browser.</p>
            </div>
            <Bench />
          </div>
        </section>

        <JumpBack />

        <section id="courses" className="wrap tl-sec">
          <div className="tl-head"><h2>Courses</h2><p>Every course lives in the <Link to="/academy">Academy</Link>, which keeps your progress across all of them.</p></div>
          {T.map(t => <Lab key={t.id} t={t} done={done} />)}
        </section>

        <section id="playgrounds" className="wrap tl-sec">
          <div className="tl-head"><h2>Playgrounds</h2><p>Open one and start typing. The AI &amp; ML courses keep their simulators inside each lesson.</p></div>
          <div className="tl-plays">
            {T.flatMap(t => t.playgrounds.map(p => (
              <Link key={p.href} to={p.href} className="tl-play" data-cat={t.id}>
                <code>{p.cmd}</code>
                <span className="tl-kicker"><i />{t.brand}</span><b>{p.title}</b><span>{p.blurb}</span>
              </Link>
            )))}
            <div id="simulate" className="tl-play tl-sim" data-cat="devops">
              <code>simulate --guided --break-it</code>
              <span className="tl-kicker"><i />{ops.brand}</span><b>Simulate labs</b><span>Guided experiments with a practice terminal and challenges, one per course.</span>
              <span className="tl-links">{sims.map(p => <Link key={p.href} to={p.href}>{p.title}</Link>)}</span>
            </div>
          </div>
        </section>

        <section id="practice" className="wrap tl-sec">
          <div className="tl-head"><h2>Practice and reference</h2><p>Drills for when you know the basics, and pages to look things up.</p></div>
          <div className="tl-refs">{T.map(t => (
            <div key={t.id} data-cat={t.id}><h3><i />{t.name}</h3>
              <ul>{[...t.practice, ...t.reference].map(x => <li key={x.href + x.title}><Link to={x.href}>{x.title}</Link></li>)}</ul></div>
          ))}</div>
        </section>
      </main>
      <footer className="site-footer tl-foot">
        <div className="wrap">
          <p className="tl-block"><span><TinkerMark size={18} />{NAME.toLowerCase()}</span>{T.map(t => <span key={t.id} data-cat={t.id}><i />{t.brand}</span>)}<span>runs in your browser</span></p>
          <p className="foot-note">{NAME} brings {T.map(t => t.brand).join(', ').replace(/, ([^,]+)$/, ' and $1')} together. Nothing you do here leaves this device. <Link to="/privacy">Privacy</Link></p>
        </div>
      </footer>
    </div>
  );
}
