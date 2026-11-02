// XP, badges and per-track progress, all computed from what this browser stored.
import { D } from '../../lib/data';
import { lessons as allLessons } from '../../lib/packs';
import { P } from '../../lib/progress';
import { store } from '../../lib/store';

export type Stats = ReturnType<typeof stats>;

/** Pass hydrated=false on the server and the first client render: everything reads as empty. */
export function stats(hydrated = true) {
  const get = <T,>(k: string, fb: T): T => (hydrated ? store.get<T | null>(k, null) ?? fb : fb);
  const done = (id: string) => hydrated && P.done(id);
  const ls = (hydrated ? allLessons() : D.lessons).filter((l) => l.track !== 'X'), finished = ls.filter((l) => done(l.id));
  let correct = 0;
  if (hydrated) for (const l of allLessons()) correct += Object.values(P.answers(l.id)).filter((a) => a.correct).length;
  const pz = get<{ days: Record<string, { ok?: boolean }>; best?: number }>('gothik-puzzle-v1', { days: {}, best: 0 });
  const wins = Object.values(pz.days || {}).filter((d) => d.ok).length;
  const seen = get<unknown[]>('gothik-gotchas-seen-v1', []).length;
  const shares = get<{ shares?: number }>('gothik-stats-v1', {}).shares || 0;
  const saved = get<unknown[]>('gothik-programs-v1', []).length;
  const tracks = D.tracks.map((t) => {
    const tl = ls.filter((l) => l.track === t.id);
    return { t, total: tl.length, done: tl.filter((l) => done(l.id)).length, last: hydrated ? Math.max(0, ...tl.map((l) => P.updated(l.id))) : 0 };
  });
  const xp = finished.length * 100 + correct * 10 + wins * 25 + seen * 5 + Math.min(10, shares) * 15;
  const level = Math.floor((Math.sqrt(1 + (8 * xp) / 100) - 1) / 2) + 1, at = (n: number) => (100 * n * (n - 1)) / 2;
  return { done: finished.length, total: ls.length, correct, wins, best: pz.best || 0, seen, gotchas: D.gotchas.length, shares, saved, tracks, xp, level, from: at(level), to: at(level + 1) };
}

export const BADGES: [string, string, string, (x: Stats) => boolean][] = [
  ['first-lesson', 'First steps', 'Finish a lesson', (x) => x.done >= 1],
  ...['A', 'B', 'C', 'D', 'E', 'F'].map((id): [string, string, string, (x: Stats) => boolean] => ['track-' + id, 'Track ' + id, 'Finish every lesson in track ' + id, (x) => { const t = x.tracks.find((r) => r.t.id === id); return !!t && t.total > 0 && t.done === t.total; }]),
  ['all-lessons', 'Gopher, fully', 'Finish all lessons', (x) => x.total > 0 && x.done === x.total],
  ['quiz-50', 'Fifty right', 'Answer 50 questions correctly', (x) => x.correct >= 50],
  ['puzzle-1', 'Puzzler', 'Solve a daily puzzle', (x) => x.wins >= 1],
  ['streak-3', 'Three in a row', 'Reach a 3-day puzzle streak', (x) => x.best >= 3],
  ['streak-7', 'A full week', 'Reach a 7-day puzzle streak', (x) => x.best >= 7],
  ['gotchas-10', 'Trap spotter', 'Open 10 gotchas', (x) => x.seen >= 10],
  ['gotchas-all', 'Seen them all', 'Open every gotcha', (x) => x.gotchas > 0 && x.seen >= x.gotchas],
  ['sharer', 'Show and tell', 'Share a program', (x) => x.shares >= 1],
  ['saver', 'Collector', 'Save a program of your own', (x) => x.saved >= 1],
];
