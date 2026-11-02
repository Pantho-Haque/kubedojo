// One small program a day: guess the exact output, then watch it run. The day comes from the
// visitor's clock, so nothing day-dependent renders until the client has hydrated.
import { Link } from '../../lib/router';
import { useState } from 'react';
import { Icon } from '../Icon';
import { MiniPlayer } from '../MiniPlayer';
import { HighlightedCode } from '../HighlightedCode';
import { D } from '../../lib/data';
import { BASE, href } from '../../lib/routes';
import { copyText } from '../../lib/share';
import { toast } from '../../lib/shell';
import { store, useHydrated, useStored } from '../../lib/store';

const PZKEY = 'gothik-puzzle-v1';
type Rec = { days: Record<string, { ok: boolean; guess: string }>; best: number };

export const dayNo = (d = new Date()) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); // local calendar day
const PUZZLE_EPOCH = dayNo(new Date(2026, 9, 23)); // puzzle #1
const norm = (s: unknown) => String(s ?? '').replace(/\r/g, '').split('\n').map((x) => x.trim()).join('\n').trim();

export function puzzlePool() {
  const gotchas = D.gotchas.filter((g) => !g.panics).map((g) => ({ source: g.source, out: g.expected, why: g.why, link: href.gotcha(g.id) }));
  const programs = D.programs.filter((p) => { const o = p.expected?.stdout; return o && !p.expected!.model && o.length <= 160 && o.split('\n').length <= 6; })
    .map((p) => ({ source: p.source, out: p.expected!.stdout!, why: p.goal || D.lesson(p.lesson)?.steps.find((s) => s.type === 'explain')?.text || '', link: href.program(p.id) }));
  return [...gotchas, ...programs];
}
export function streakOf(rec: Rec, today: number) {
  let d = rec.days[today] ? today : today - 1, n = 0;
  while (rec.days[d]?.ok) { n++; d--; }
  return n;
}

export function Puzzle() {
  const hydrated = useHydrated();
  const rec = useStored<Rec | null>(PZKEY, null) || { days: {}, best: 0 };
  const [guess, setGuess] = useState('');
  if (!hydrated) return <p className="mono faint">{'// daily puzzle'}</p>;

  const pool = puzzlePool(), today = dayNo(), num = today - PUZZLE_EPOCH + 1;
  const pz = pool[(((today * 7919) % pool.length) + pool.length) % pool.length]; // 7919 is prime, so days walk the whole pool
  const mine = rec.days[today], streak = streakOf(rec, today);
  const lock = () => {
    if (!guess.trim()) { toast('Type what you think it prints first.'); return; }
    const next: Rec = { days: { ...rec.days, [today]: { ok: norm(guess) === norm(pz.out), guess } }, best: rec.best || 0 };
    next.best = Math.max(next.best, streakOf(next, today));
    store.set(PZKEY, next);
  };
  const share = () => copyText('gothik daily #' + num + ' ' + (mine!.ok ? '✅' : '❌') + (streak > 1 ? ' 🔥' + streak : '') + '\nWhat does this Go program print? ' + location.origin + BASE + href.puzzle);

  return (
    <>
      <p className="mono faint">{'// daily puzzle #' + num}</p>
      <h1 className="mono">what does it print?</h1>
      <p className="lead">One small program a day. Read it, type the exact output, then watch it run.</p>
      <div className="streak" id="pz-stats"><span>streak <b>{streak}</b></span><span>best <b>{rec.best || 0}</b></span><span>played <b>{Object.keys(rec.days).length}</b></span></div>
      {/* once revealed, the player below shows the same code */}
      {!mine && <HighlightedCode source={pz.source} className="code-block" style={{ marginTop: 16 }} />}
      <label className="field" style={{ marginTop: 16 }}><span>Your answer, one line per printed line</span>
        <textarea className="input mono" id="pz-guess" rows={4} style={{ height: 'auto', padding: '8px 10px', fontSize: 13 }} readOnly={!!mine} value={mine ? mine.guess : guess} onChange={(e) => setGuess(e.target.value)} />
      </label>
      {!mine && <div className="row" style={{ marginTop: 10 }}><button className="btn primary" type="button" id="pz-lock" onClick={lock}>Lock in</button></div>}
      {mine && <div id="pz-result">
        <div className={'puzzle-result ' + (mine.ok ? 'right' : 'wrong')}>
          <strong>{mine.ok ? 'Exactly right.' : 'Not this time.'}</strong><span className="dim">Go prints:</span><pre>{pz.out}</pre>
          {pz.why && <p className="dim">{pz.why}</p>}
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className="btn sm primary" type="button" id="pz-share" onClick={share}><Icon name="share" />Share result</button>
            <Link className="btn sm ghost" href={pz.link}>Open it in the lab</Link>
            <span className="faint" style={{ fontSize: 12 }}>A new puzzle every day.</span>
          </div>
        </div>
        <figure className="art-fig" style={{ marginTop: 20 }}><MiniPlayer source={pz.source} autoplay={false} output /></figure>
      </div>}
    </>
  );
}
