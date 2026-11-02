// The left pane: the playground's programs and examples, or a lesson's Read → Watch → Try → Check.
import { Link } from '../../lib/router';
import { useRouter } from '../../lib/router';
import { Fragment, memo, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { Quiz } from '../Quiz';
import { D, TRACK_HUE, clip, md, type Lesson } from '../../lib/data';
import { useCatalog, program } from '../../lib/packs';
import { P, nextLesson, useProgress } from '../../lib/progress';
import { href } from '../../lib/routes';
import { reduced, useSettings } from '../../lib/settings';
import { toast } from '../../lib/shell';
import { useHydrated, useStored } from '../../lib/store';
import { PHASES, STARTER, mine, saveMineList, tryOf, useBench, useStep, type Bench, type Mine } from './bench';
import { solutionTool } from './tools';

const html = (s: unknown) => ({ __html: md(s) });

/** Drop ?program= / #src= once the editor holds something else, so a reload keeps it. */
function useLeaveUrl() {
  const router = useRouter();
  return () => { if (location.search || location.hash) router.replace(href.playground, { scroll: false }); };
}

/* ---------- playground ---------- */
function MyPrograms({ b }: { b: Bench }) {
  const list = useStored<Mine[]>('gothik-programs-v1', []), leave = useLeaveUrl();
  const [name, setName] = useState(''), [q, setQ] = useState(''), [armed, setArmed] = useState<string | null>(null);
  useEffect(() => { if (!armed) return; const id = setTimeout(() => setArmed(null), 3000); return () => clearTimeout(id); }, [armed]);
  const query = q.trim().toLowerCase().replace(/^#/, '');
  const shown = (Array.isArray(list) ? list : []).filter((m) => !query || (m.name + ' ' + m.tags.join(' ')).toLowerCase().includes(query)).sort((a, b2) => b2.updated - a.updated);
  function save(raw: string) {
    const tags = [...raw.matchAll(/#([\w-]+)/g)].map((m) => m[1].toLowerCase());
    const nm = raw.replace(/#[\w-]+/g, '').replace(/\s+/g, ' ').trim() || 'Untitled program';
    const all = mine(), old = all.find((m) => m.name === nm), source = b.editor?.value ?? '';
    if (old) Object.assign(old, { source, tags, updated: Date.now() });
    else all.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: nm, tags, source, updated: Date.now() });
    const ok = saveMineList(all);
    toast(ok ? (old ? 'Updated “' + nm + '”.' : 'Saved “' + nm + '” on this device.') : 'Storage is blocked; kept until you close this tab.');
  }
  return (
    <div>
      <span className="eyebrow">My programs</span>
      <form className="row" id="my-save" style={{ marginTop: 8 }} onSubmit={(e) => { e.preventDefault(); save(name); setName(''); }}>
        <input className="input" id="my-name" placeholder="Name it, add #tags" aria-label="Name for the current program" style={{ flex: 1, minWidth: 0 }} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn sm" type="submit">Save</button>
      </form>
      <input className="input" id="my-search" type="search" placeholder="Search saved programs…" aria-label="Search saved programs" style={{ marginTop: 6, width: '100%' }} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="example-list" id="my-list" style={{ marginTop: 4 }}>
        {shown.length ? shown.map((m) => (
          <div className="row" style={{ gap: 2 }} key={m.id}>
            <button type="button" style={{ flex: 1, minWidth: 0 }} onClick={() => { b.swapIn(m.source); leave(); b.run({ autoplay: true }); }}>
              {m.name}<small>{[...m.tags.map((t) => '#' + t), new Date(m.updated).toLocaleDateString()].join(' ')}</small>
            </button>
            <button className={'icon-btn' + (armed === m.id ? ' armed' : '')} type="button" aria-label={'Delete ' + m.name} title={armed === m.id ? 'Click again to delete' : 'Delete (click twice)'}
              onClick={() => { if (armed !== m.id) { setArmed(m.id); toast('Click again to delete.'); return; } saveMineList(mine().filter((x) => x.id !== m.id)); setArmed(null); toast('Deleted.'); }}>
              <Icon name="x" />
            </button>
          </div>
        )) : <p className="faint" style={{ fontSize: 12, padding: '4px 2px' }}>{query ? 'No saved program matches.' : 'Nothing saved yet. Name the current program above to keep it.'}</p>}
      </div>
    </div>
  );
}

export function PlayGuide({ b }: { b: Bench }) {
  useBench(b);
  const { lessons, programs, tracks } = useCatalog(), router = useRouter(), leave = useLeaveUrl();
  return (
    <>
      <div className="guide-head" id="guide-head">
        <span className="eyebrow">Playground</span><h2>Write Go. Watch it run.</h2>
        <p className="dim" style={{ fontSize: 13 }}>Every line you type plays back on the stage. Nothing leaves your browser.</p>
      </div>
      <div className="guide-body scroll" id="guide-body">
        <div className="callout model"><strong>Try this</strong>Hover a variable in the code to find it on the stage. Click a line number to jump to the moment it runs. Drag to pan, ⌘-scroll to zoom.</div>
        <div><button className="btn sm" type="button" onClick={() => { b.swapIn(STARTER); leave(); b.run({ autoplay: true }); }}><Icon name="reset" />Starter program</button></div>
        <MyPrograms b={b} />
        <div><span className="eyebrow">Examples</span>
          <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
            {tracks.map((t) => {
              const ps = programs.filter((p) => lessons.find((l) => l.id === p.lesson)?.track === t.id);
              return ps.length ? (
                <details key={t.id} open={ps.some((p) => p.id === b.programId) || t.id === 'A'}>
                  <summary className="eyebrow" style={{ cursor: 'pointer', padding: '6px 0', color: TRACK_HUE[t.id] }}>{t.title}</summary>
                  <div className="example-list">{ps.map((p) => (
                    <button key={p.id} type="button" aria-current={p.id === b.programId ? 'true' : undefined} onClick={() => router.push(href.program(p.id))}>{p.title}<small>{p.id}</small></button>
                  ))}</div>
                </details>
              ) : null;
            })}
          </div>
        </div>
      </div>
      <div className="guide-foot" id="guide-foot">
        <Link className="btn ghost sm" href={href.learn}><Icon name="arrow" />Follow the lessons instead</Link>
        <Link className="btn ghost sm" href={href.compare()}>Compare two programs</Link>
      </div>
    </>
  );
}

/* ---------- lesson ---------- */
const TItem = memo(function TItem({ i, color, text, current, onPick }: { i: number; color: string; text: string; current: boolean; onPick: (i: number) => void }) {
  return <li data-i={i} aria-current={current ? 'step' : undefined} onClick={() => onPick(i)}><span className="tdot" style={{ background: color }} /><span dangerouslySetInnerHTML={{ __html: text }} /></li>;
});
function Transcript({ b }: { b: Bench }) {
  useBench(b); useStep(b);
  const { depth } = useSettings(), ref = useRef<HTMLOListElement>(null);
  const t = b.player?.trace ?? null, sum = b.sum, cur = b.cur?.i ?? -1;
  const items = useMemo(() => {
    if (!t || !sum) return null;
    const n = Math.min(t.length, 400), out: { i: number; color: string; text: string }[] = [];
    for (let i = 0; i < n; i++) {
      // routine branch/loop steps that change nothing are left out
      if (['branch', 'loop'].includes(sum.kinds[i]) && i > 0 && i < n - 1 && sum.writes[i].items.length === 0) continue;
      const x = b.narr(i, depth);
      out.push({ i, color: x.color, text: x.html });
    }
    return { out, more: t.length - n };
  }, [t, sum, depth, b]);
  useEffect(() => { ref.current?.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); }, [cur]);
  const pick = useMemo(() => (i: number) => { b.player?.pause(); b.player?.show(i, true); }, [b]);
  return (
    <ol className="transcript" id="transcript" ref={ref}>
      {!items ? <li className="dim">Run the program to see each step explained.</li> : <>
        {items.out.map((x) => <TItem key={x.i} {...x} current={x.i === cur} onPick={pick} />)}
        {items.more > 0 && <li className="dim">… {items.more} more steps</li>}
      </>}
    </ol>
  );
}

function ReadPhase({ b, l }: { b: Bench; l: Lesson }) {
  const { lessons } = useCatalog(), hydrated = useHydrated();
  const [guess, setGuess] = useState(b.prediction ?? '');
  const explain = l.steps.find((s) => s.type === 'explain');
  return (
    <>
      <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6 }} dangerouslySetInnerHTML={html(l.hook)} />
      {l.prereqs?.length ? <p className="dim" style={{ fontSize: 12 }}>Builds on: {l.prereqs.map((id, k) => {
        const x = lessons.find((y) => y.id === id);
        return <Fragment key={id}>{k ? ', ' : ''}{x && <Link href={href.lesson(id)} title={x.title}>{id}{hydrated && P.done(id) ? ' ✓' : ''}</Link>}</Fragment>;
      })}</p> : null}
      <div><h3>The idea</h3><p dangerouslySetInnerHTML={html(explain?.text || '')} /></div>
      {l.goals?.length ? <div><h3>By the end you can</h3><ul style={{ margin: '6px 0 0', paddingLeft: 18, color: 'var(--text-dim)' }}>{l.goals.map((g, k) => <li key={k} dangerouslySetInnerHTML={html(g)} />)}</ul></div> : null}
      {(l.pitfalls || []).map((p, k) => (
        <div className="callout" key={k}><strong>{p.title || 'Looks right, but…'}</strong><p style={{ color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: '“' + md(p.claim) + '”' }} /><p dangerouslySetInnerHTML={html(p.explanation)} /></div>
      ))}
      {l.claims?.some((c) => c.model) && <div className="callout model"><strong>Simplified model</strong><p>Parts of this lesson use a teaching model of the runtime. It is labelled wherever it appears.</p></div>}
      <div><span className="eyebrow">Sources</span>
        <div className="sources" style={{ marginTop: 8 }}>{(l.sources || []).map((s) => { const d = D.doc(s); return d ? <Link key={s} className="chip" href={href.article(l.id, s)} title={d.title}>{clip(d.title.split(' — ')[0], 28)}</Link> : null; })}</div>
      </div>
      <div className="predict-box"><h3>Predict first</h3>
        <p>Read the code. What will it print? A wrong guess is fine: comparing is how it sticks.</p>
        <textarea className="input mono" id="prediction" rows={3} style={{ height: 'auto', padding: '8px 10px', fontSize: 13, width: '100%' }} placeholder="Type the output you expect…" aria-label="Your predicted output" value={guess} onChange={(e) => setGuess(e.target.value)} />
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn primary sm" type="button" onClick={() => b.predict(guess)}>Lock in and watch <Icon name="arrow" /></button>
          <button className="btn ghost sm" type="button" onClick={() => b.goPhase('watch')}>Skip, just watch</button>
        </div>
      </div>
    </>
  );
}

function WatchPhase({ b, l }: { b: Bench; l: Lesson }) {
  const prog = program(l.examples?.[0]), r = b.predictResult;
  return (
    <>
      {b.prediction != null && <div className="callout"><strong>Your prediction</strong>
        <pre className="mono" style={{ margin: '4px 0', whiteSpace: 'pre-wrap' }}>{b.prediction.trim() || '(nothing)'}</pre>
        <p id="predict-result" className="dim" style={{ fontSize: 12 }}>
          {!r ? 'Play to the end to compare.' : r.ok ? <span style={{ color: 'var(--ok)' }}><Icon name="check" /> Exactly right.</span>
            : <>Not quite. It printed:<pre className="mono" style={{ margin: '4px 0', whiteSpace: 'pre-wrap', color: 'var(--text)' }}>{clip(r.actual || '(nothing)', 400)}</pre>Step back through the timeline to find where your guess and the run part ways.</>}
        </p>
      </div>}
      {prog?.watch && !l.quiz.some((q) => q.question === prog.watch) && <div className="callout"><strong>Watch for</strong><p style={{ color: 'var(--text)' }} dangerouslySetInnerHTML={html(prog.watch)} /></div>}
      <div className="row"><button className="btn primary sm" type="button" onClick={() => b.playFromStart()}><Icon name="play" />Play from the start</button><span className="dim" style={{ fontSize: 12 }}>or step with <kbd>→</kbd></span></div>
      <div>
        <div className="row"><span className="eyebrow">What happens, step by step</span><span className="spacer" /><button className="btn ghost sm" type="button" title="Save these steps as a Markdown file" onClick={() => b.exportTranscript()}>Save as Markdown</button></div>
        <Transcript b={b} />
      </div>
      <button className="btn" type="button" onClick={() => b.goPhase('try')}>Now try it <Icon name="arrow" /></button>
    </>
  );
}

function TryPhase({ b, l }: { b: Bench; l: Lesson }) {
  const { live } = useSettings(), tc = tryOf(l), m = b.tryMsg;
  const hints = tc?.hints || (tc?.hint ? [tc.hint] : []);
  return (
    <>
      <div><h3>Your challenge</h3><p style={{ color: 'var(--text)' }} dangerouslySetInnerHTML={html(tc?.task || l.steps.find((s) => s.type === 'try')?.text || 'Change one value in the code and run it again.')} /></div>
      {hints.map((x, i) => <details key={i}><summary className="dim" style={{ cursor: 'pointer' }}>Hint{hints.length > 1 ? ' ' + (i + 1) : ''}</summary><p dangerouslySetInnerHTML={html(x)} /></details>)}
      <p id="try-result" className="dim" style={{ fontSize: 12 }}>
        {m?.ok ? <><span style={{ color: 'var(--ok)' }}><Icon name="check" /> Challenge done.</span> Step back on the stage to see what your change did.</> : m?.text || (live ? 'The code re-runs as you type.' : 'Press Run after each change.')}
      </p>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn ghost sm" type="button" onClick={() => b.resetExample()}><Icon name="reset" />Reset the code</button>
        {tc?.solution && <button className="btn ghost sm" type="button" onClick={() => solutionTool(tc.solution!)}>Show one answer</button>}
      </div>
      <button className="btn" type="button" onClick={() => b.goPhase('check')}>Check yourself <Icon name="arrow" /></button>
    </>
  );
}

function CheckPhase({ b, l }: { b: Bench; l: Lesson }) {
  const hydrated = useHydrated(), done = hydrated && P.done(l.id), nx = hydrated ? nextLesson(l.id) : null;
  return (
    <>
      {done && <div className="callout ok-box"><strong><Icon name="check" /> Lesson complete</strong>
        {nx ? <><p>Up next: {nx.title}.</p><Link className="btn primary" href={href.lesson(nx.id)}>Next lesson: {nx.id} <Icon name="arrow" /></Link></>
          : <><p>That was the last lesson. Try the Gotchas or the Daily puzzle next.</p><Link className="btn primary" href={href.gotchas}>Open Gotchas <Icon name="arrow" /></Link></>}
      </div>}
      <Quiz lesson={l} onComplete={() => {
        b.markPhase('check');
        if (!P.done(l.id)) { P.mark(l.id, 'completed'); toast('Lesson ' + l.id + ' complete — nice.'); }
      }} />
    </>
  );
}

export function LessonGuide({ b, lesson: l }: { b: Bench; lesson: Lesson }) {
  useBench(b); useProgress();
  const { lessons, tracks } = useCatalog(), hydrated = useHydrated();
  const body = useRef<HTMLDivElement>(null);
  // before the controller opens the lesson (first paint, and on the server) show its Read phase
  const phase = b.lesson?.id === l.id ? b.phase : 'read';
  useEffect(() => { if (body.current) body.current.scrollTop = 0; }, [phase, l.id]);
  const idx = lessons.findIndex((x) => x.id === l.id), prev = idx > 0 ? lessons[idx - 1] : null, next = hydrated ? nextLesson(l.id) : null;
  const done = hydrated && P.done(l.id), track = tracks.find((t) => t.id === l.track);
  return (
    <>
      <div className="guide-head" id="guide-head">
        <div className="row"><span className="eyebrow" style={{ color: TRACK_HUE[l.track] }}>{track?.title || ''} · {l.id}</span><span className="spacer" /><span className={'badge ' + (l.level || 'core').toLowerCase()}>{l.level}</span></div>
        <h2>{l.title}</h2>
        <div className="phases" role="tablist" aria-label="Lesson steps">
          {PHASES.map(([p, label]) => <button key={p} role="tab" type="button" aria-selected={phase === p} className={b.phasesDone.has(p) ? 'done' : ''} onClick={() => b.setPhase(p)}>{label}</button>)}
        </div>
      </div>
      <div className="guide-body scroll" id="guide-body" ref={body}>
        {phase === 'read' ? <ReadPhase b={b} l={l} /> : phase === 'watch' ? <WatchPhase b={b} l={l} /> : phase === 'try' ? <TryPhase b={b} l={l} /> : <CheckPhase b={b} l={l} />}
      </div>
      <div className="guide-foot" id="guide-foot">
        {prev && <Link className="btn ghost sm" href={href.lesson(prev.id)} title={prev.title}>← {prev.id}</Link>}
        <span className="spacer" />
        {done ? <span className="chip accent"><Icon name="check" /> done</span> : <span className="chip">{l.estimatedMinutes || 5} min</span>}
        {next && <Link className="btn sm" href={href.lesson(next.id)} title={next.title}>{next.id} →</Link>}
      </div>
    </>
  );
}
