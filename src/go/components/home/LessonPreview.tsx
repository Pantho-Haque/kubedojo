// "A lesson, up close": one real lesson's four steps, playable on the home page.
import { Link } from '../../lib/router';
import { useState } from 'react';
import { Icon } from '../Icon';
import { D, TRACK_HUE, md } from '../../lib/data';
import { loadEditor, loadStage } from '../../lib/run';
import { href } from '../../lib/routes';
import { codeHTML, traceFor, useLazy } from './demo';

const PHASES = ['read', 'watch', 'try', 'check'] as const;
type Built = { transcript: { color: string; html: string }[]; code: string };

export function LessonPreview({ id }: { id: string }) {
  const l = D.lesson(id)!, prog = D.program(l.examples?.[0]), step = (type: string) => l.steps.find((x) => x.type === type);
  const q = l.quiz.find((x) => x.type === 'multiple-choice');
  const [built, setBuilt] = useState<Built | null>(null), [phase, setPhase] = useState<(typeof PHASES)[number]>('read'), [switched, setSwitched] = useState(false);
  const [guess, setGuess] = useState(''), [revealed, setRevealed] = useState<string | null>(null), [pick, setPick] = useState<{ c: string; n: number } | null>(null);
  const ref = useLazy<HTMLDivElement>(async () => {
    const [{ GothikStage: S }, { GothikEditor: E }, { t }] = await Promise.all([loadStage(), loadEditor(), prog ? traceFor(prog.source, 'lp') : { t: null }]);
    const transcript = t ? Array.from({ length: Math.min(t.length, 8) }, (_, i) => S.narrate(t[i], i ? t[i - 1] : null, 'simple')).filter((x, i) => i === 0 || x.kind !== 'branch') : [];
    const src = prog?.source || '';
    setBuilt({ transcript, code: codeHTML((x: string) => E.highlightLine(x), src, 1, src.split('\n').length - 1) });
  });

  const want = String(prog?.expected?.stdout ?? '').trim();
  const panel = () => {
    if (!built) return null;
    if (phase === 'read') return <>
      <p className="lp-hook" dangerouslySetInnerHTML={{ __html: md(l.hook) }} /><p dangerouslySetInnerHTML={{ __html: md(step('explain')?.text || '') }} />
      {l.pitfalls?.[0] && <div className="callout"><strong>Looks right, but…</strong><p style={{ color: 'var(--text)' }}>“{l.pitfalls[0].claim}”</p><p>{l.pitfalls[0].explanation}</p></div>}
    </>;
    if (phase === 'watch') return <>
      {prog?.watch && <div className="callout"><strong>Watch for</strong><p style={{ color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: md(prog.watch) }} /></div>}
      <ol className="transcript">{built.transcript.map((x, i) => <li key={i}><span className="tdot" style={{ background: x.color }} /><span dangerouslySetInnerHTML={{ __html: x.html }} /></li>)}</ol>
    </>;
    if (phase === 'try') return <>
      <p>{step('predict')?.text || ''}</p>
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: built.code }} />
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <input className="input mono" placeholder="what will it print?" style={{ flex: 1, minWidth: 200 }} value={guess} onChange={(e) => setGuess(e.target.value)} />
        <button className="btn sm" type="button" onClick={() => setRevealed(guess.trim())}>Reveal</button>
      </div>
      <p className="dim" aria-live="polite">{revealed !== null && <>{revealed && revealed.replace(/\s+/g, ' ') === want.replace(/\s+/g, ' ') ? <><span style={{ color: 'var(--ok)' }}>Exactly right.</span> </> : 'It prints '}<code>{want}</code>. In the lesson you would now step through it to see why.</>}</p>
    </>;
    if (!q) return null;
    const ok = pick && pick.c === q.answer;
    return (
      <div className={'quiz-q' + (pick ? (ok ? ' right' : ' wrong') : '')} key={pick?.n}>
        <span className="eyebrow">Question</span>
        <p style={{ color: 'var(--text)', fontWeight: 560 }}>{q.question}</p>
        <div className="choices">{(q.choices || []).map((c) => <button key={c} type="button" onClick={() => setPick({ c, n: (pick?.n || 0) + 1 })}>{c}</button>)}</div>
        <p className="feedback" aria-live="polite">{pick && <>{ok ? <span style={{ color: 'var(--ok)' }}>Correct.</span> : <span style={{ color: 'var(--bad)' }}>Not quite.</span>} {q.explanation || ''}</>}</p>
      </div>
    );
  };

  return (
    <div className="lp" ref={ref}>
      {built && <>
        <div className="lp-side">
          <span className="eyebrow" style={{ color: TRACK_HUE[l.track] }}>{D.track(l.track)?.title || ''} · {l.id}</span>
          <h3 className="mono">{l.title.toLowerCase()}</h3>
          <div className="phases" role="tablist" aria-label="Lesson steps">
            {PHASES.map((p) => <button key={p} role="tab" type="button" aria-selected={phase === p} onClick={() => { setPhase(p); setSwitched(true); }}>{p[0].toUpperCase() + p.slice(1)}</button>)}
          </div>
          <p className="faint" style={{ fontSize: 12 }}>{l.estimatedMinutes || 5} min · {l.level}</p>
          <Link className="btn primary" href={href.lesson(l.id)}>Open this lesson <Icon name="arrow" /></Link>
        </div>
        <div className={'lp-panel' + (switched ? ' enter' : '')} key={phase} role="tabpanel">{panel()}</div>
      </>}
    </div>
  );
}
