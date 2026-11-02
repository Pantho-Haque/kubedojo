// Calls to action that depend on this browser's progress: start, or continue where the learner left off.
import { Link } from '../../lib/router';
import { Icon } from '../Icon';
import { D } from '../../lib/data';
import { P, upNext, useProgress } from '../../lib/progress';
import { useHydrated } from '../../lib/store';
import { href } from '../../lib/routes';

// what upNext() returns with nothing stored: the first lesson of the default (Newcomer) path
const FIRST = D.paths.find((p) => p.id === 'path-1')?.lessons[0] || D.lessons[0].id;

export function HeroCta({ final = false }: { final?: boolean }) {
  useProgress();
  const h = useHydrated(), last = h ? P.last : null, startId = h ? upNext().id : FIRST;
  return <>
    <div className="hero-cta">
      <Link className="btn primary lg" href={href.lesson(startId)}>{last ? 'Continue with ' + startId : final ? 'Start lesson A01' : 'Start the first lesson'} <Icon name="arrow" /></Link>
      <Link className="btn lg" href={href.playground}>{final ? 'Paste your own code' : 'Open the playground'}</Link>
    </div>
    {!final && !last && <p className="dim" style={{ fontSize: 14, marginTop: 10 }}>New to Go? The lessons start from <code>package main</code>, and “Next lesson” walks you through the <Link href={href.learn}>Newcomer path</Link>.</p>}
  </>;
}

export function DoneFact() {
  useProgress();
  const done = useHydrated() ? P.count() : 0;
  return done ? <span style={{ color: 'var(--accent)' }}>{done}/{D.lessons.length} done</span> : null;
}
