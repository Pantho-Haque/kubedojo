// The Learn page: path chips, subway map, resume card, progress, XP, the lesson list, badges and lesson packs.
import { Link } from '../../lib/router';
import { useState } from 'react';
import { Icon } from '../Icon';
import { D, TRACK_HUE, clip } from '../../lib/data';
import { useCatalog } from '../../lib/packs';
import { P, learnPath, upNext, useProgress } from '../../lib/progress';
import { useHydrated, useStored } from '../../lib/store';
import { href } from '../../lib/routes';
import { Subway } from './Subway';
import { BADGES, stats, type Stats } from './stats';
import { LessonPacks } from './LessonPacks';

const Ring = ({ pct }: { pct: number }) => (
  <svg className="ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18" className="ring-bg" /><circle cx="22" cy="22" r="18" className="ring-fg" style={{ strokeDasharray: (pct * 113.1).toFixed(1) + ' 113.1' }} /></svg>
);

export function LearnView() {
  useProgress();
  const h = useHydrated(), { lessons, tracks } = useCatalog();
  const pathId = useStored<string>('gothik-path-v1', 'path-1'), [query, setQuery] = useState('');
  const x = stats(h);
  const done = (id: string) => h && P.done(id);
  const total = lessons.length, count = h ? P.count() : 0;
  const last = h && P.last ? upNext() : null, resumeLabel = last && last.id === P.last ? 'Continue' : 'Up next';
  const path = D.paths.find((p) => p.id === pathId), hl = path ? new Set(path.lessons) : null;

  const q = query.trim().toLowerCase();
  const groups = tracks.map((t) => {
    // imported lessons are never hidden by the path
    const ls = lessons.filter((l) => l.track === t.id && (!hl || hl.has(l.id) || t.id === 'X') && (!q || (l.id + ' ' + l.title + ' ' + l.hook).toLowerCase().includes(q)));
    return { t, ls };
  }).filter((g) => g.ls.length);
  const n = groups.reduce((a, g) => a + g.ls.length, 0);

  return (
    <div className="page">
      <header className="page-head learn-head">
        <div>
          <p className="mono faint">{"// learn"}</p>
          <h1 className="mono">your path through go.</h1>
          <p>No locked doors: open any lesson. The lines below are the six tracks; filled stations are lessons you have finished. Prefer reading first? Every lesson is also an <Link href={href.articles}>article with a live example</Link>.</p>
        </div>
        <div className="learn-side">
          {last ? (
            <Link className="resume card" href={href.lesson(last.id)}>
              <span className="eyebrow">{resumeLabel}{path ? ' · ' + path.title + ' ' + path.lessons.filter(done).length + '/' + path.lessons.length : ''}</span>
              <strong>{last.id + ' · ' + last.title}</strong><span className="dim">{clip(last.hook, 90)}</span><span className="resume-go"><Icon name="arrow" /></span>
            </Link>
          ) : (
            <Link className="resume card" href={href.lesson('A01')}>
              <span className="eyebrow">Start here</span><strong>A01 · {D.lesson('A01')?.title || ''}</strong>
              <span className="dim">Five minutes. You will see your first program run.</span><span className="resume-go"><Icon name="arrow" /></span>
            </Link>
          )}
          <div className="progress-box">{count > 0 && <Ring pct={count / total} />}<div><b className="mono">{count}/{total}</b><span className="dim">lessons complete</span></div></div>
          <XpBox x={x} />
        </div>
      </header>

      <div className="path-chips" role="group" aria-label="Learning paths">
        <button className="chip-btn" type="button" aria-pressed={pathId === 'all'} onClick={() => learnPath.set('all')}>Everything</button>
        {D.paths.map((p) => <button key={p.id} className="chip-btn" type="button" aria-pressed={pathId === p.id} onClick={() => learnPath.set(p.id)}>{p.title} <span className="faint">{p.lessons.length}</span></button>)}
      </div>
      <p className="dim" style={{ margin: '10px 0 0', fontSize: 13 }}>{path ? (path.about || '') + ' Lessons on this path are highlighted, and “Next lesson” follows it.' : 'All six tracks in order. New to Go? Pick “Newcomer” for a shorter first route.'}</p>
      <div className="subway-wrap"><Subway highlight={path?.lessons} /></div>

      <div className="row" style={{ margin: '28px 0 8px' }}>
        <input className="input" type="search" placeholder="Filter lessons…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ maxWidth: 320, flex: 1 }} aria-label="Filter lessons" />
        <span className="dim" style={{ fontSize: 12 }}>{n} lesson{n === 1 ? '' : 's'}</span>
      </div>
      <div className="learn-list">
        {groups.length ? groups.map(({ t, ls }) => (
          <section key={t.id} id={`track-${t.id}`} className="track-sec" style={{ ['--hue' as string]: TRACK_HUE[t.id] }}>
            <h2 className="mono"><span className="track-dot" />{t.title} <span className="faint">{ls.filter((l) => done(l.id)).length}/{ls.length}</span></h2>
            <div className="lesson-rows stagger">
              {ls.map((l) => (
                <Link key={l.id} className="lesson-row" href={href.lesson(l.id)}>
                  <span className="mono lr-id">{l.id}</span>
                  <span className="lr-main"><strong>{l.title}</strong><span className="dim">{clip(l.hook, 110)}</span></span>
                  <span className={'badge ' + l.level.toLowerCase()}>{l.level}</span>
                  <span className="mono faint lr-min">{l.estimatedMinutes || 5}m</span>
                  <span className="lr-state">{done(l.id) ? <Icon name="check" /> : h && P.status(l.id) === 'in-progress' ? <span className="half" /> : null}</span>
                </Link>
              ))}
            </div>
          </section>
        )) : <div className="empty"><h3>No lessons match.</h3><p>Try another word, or clear the path filter.</p></div>}
      </div>
      <Achievements x={x} />
      <LessonPacks />
    </div>
  );
}

function XpBox({ x }: { x: Stats }) {
  const pct = Math.round(((x.xp - x.from) / Math.max(1, x.to - x.from)) * 100);
  return (
    <div className="progress-box xp-box" title={x.xp + ' XP: 100 per lesson, 10 per correct answer, 25 per puzzle solved, 5 per gotcha, 15 per share'}>
      <div><b className="mono">level {x.level}</b><span className="dim">{x.xp} XP · next at {x.to}</span><span className="xp-bar" aria-hidden="true"><i style={{ width: pct + '%' }} /></span></div>
    </div>
  );
}

function Achievements({ x }: { x: Stats }) {
  const earned = BADGES.filter((b) => b[3](x)).length;
  return (
    <section className="achievements">
      <h2 className="mono">achievements <span className="faint">{earned}/{BADGES.length}</span></h2>
      <ul className="badges">
        {BADGES.map(([id, title, how, ok]) => {
          const got = ok(x);
          return (
            <li key={id} className={'badge-card' + (got ? ' got' : '')} data-badge={id}>
              <span className="badge-dot" aria-hidden="true">{got && <Icon name="check" />}</span>
              <span><strong>{title}</strong><span className="dim">{how}</span></span>
              <span className="sr-only">{got ? 'earned' : 'not earned yet'}</span>
            </li>
          );
        })}
      </ul>
      <h3 className="mono" style={{ marginTop: 20 }}>certificates</h3>
      <p className="dim" style={{ fontSize: 13 }}>Finish a track to unlock its certificate. You can print it or save it as an image.</p>
      <div className="row" style={{ flexWrap: 'wrap', marginTop: 8 }}>
        {x.tracks.map((r) => r.done === r.total && r.total
          ? <Link key={r.t.id} className="btn sm primary" href={href.certificate(r.t.id)}><Icon name="check" />{r.t.title}</Link>
          : <span key={r.t.id} className="chip" title={r.done + ' of ' + r.total + ' done'}>{r.t.title} · {r.done}/{r.total}</span>)}
      </div>
    </section>
  );
}
