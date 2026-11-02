// Lesson progress, drafts and the learning path, stored on this device.
// Keeps the prototype's v2 shape and key so progress carries over.
import { store, useStoreVersion } from './store';
import { ACADEMY_URL, D, type Lesson, type LearnPath } from './data';
import { markDone } from '../../academy/progress.js';
import { lessons as allLessons } from './packs';

const PKEY = 'gothik-progress-v2';
type LessonRec = { status: 'not-started' | 'in-progress' | 'completed'; answers: Record<string, { value: string; correct: boolean }>; updated?: number };
type Progress = { version: 2; epoch: number; lessons: Record<string, LessonRec>; drafts: Record<string, { text: string; updated: number; alternatives?: unknown[] } | string>; last: string | null; legacy: unknown };

const empty = (epoch = 0): Progress => ({ version: 2, epoch, lessons: {}, drafts: {}, last: null, legacy: null });
function load(): Progress {
  const p = store.get<Progress | null>(PKEY, null);
  if (!p || typeof p !== 'object' || p.version !== 2) return empty();
  p.lessons ||= {}; p.drafts ||= {};
  return p;
}
const save = (p: Progress) => store.set(PKEY, p);
const edit = (f: (p: Progress) => void) => { const p = load(); f(p); return save(p); };

export const P = {
  status: (id: string) => load().lessons[id]?.status || 'not-started',
  done: (id: string) => P.status(id) === 'completed',
  count: () => Object.values(load().lessons).filter((r) => r.status === 'completed').length,
  mark(id: string, status: LessonRec['status']) {
    edit((p) => {
      const r = p.lessons[id] || { status: 'not-started', answers: {} };
      if (r.status === 'completed' && status !== 'completed' && status !== 'not-started') return;
      p.lessons[id] = { ...r, status, updated: Date.now() }; p.last = id;
    });
    if (status === 'completed' && ACADEMY_URL[id]) markDone(id); // the Academy's progress counts the same lesson
  },
  answer(id: string, qid: string, value: string, correct: boolean) {
    edit((p) => {
      const r = p.lessons[id] || { status: 'in-progress', answers: {} };
      r.answers = { ...(r.answers || {}), [qid]: { value: String(value), correct: !!correct } }; r.updated = Date.now();
      if (r.status === 'not-started') r.status = 'in-progress';
      p.lessons[id] = r;
    });
  },
  answers: (id: string) => load().lessons[id]?.answers || {},
  updated: (id: string) => load().lessons[id]?.updated || 0,
  draft(key: string): string | null { const d = load().drafts[key]; return typeof d === 'string' ? d : d?.text ?? null; },
  saveDraft(key: string, text: string) { edit((p) => { const old = p.drafts[key]; p.drafts[key] = { text, updated: Date.now(), alternatives: typeof old === 'object' ? old.alternatives || [] : [] }; }); },
  clearDraft(key: string) { edit((p) => { delete p.drafts[key]; }); },
  get last() { return load().last; },
  setLast(id: string) { edit((p) => { p.last = id; }); },
  export: () => JSON.stringify(load(), null, 2),
  import(text: string) {
    const p = JSON.parse(text);
    if (!p || p.version !== 2 || typeof p.lessons !== 'object') throw Error('This is not a gothik progress file.');
    save({ ...load(), ...p, lessons: p.lessons || {}, drafts: p.drafts || {} });
  },
  reset() { save(empty((load().epoch || 0) + 1)); },
};

/** Re-render on progress changes; returns P for convenience. Values read on the server are empty. */
export function useProgress() { useStoreVersion(); return P; }

/* ---------- learning path: "Next lesson" follows it while the lesson is on it ---------- */
const PATHKEY = 'gothik-path-v1';
export const learnPath = {
  get: () => store.get(PATHKEY, 'path-1'),
  set: (id: string) => store.set(PATHKEY, id),
  of: (): LearnPath | null => D.paths.find((x) => x.id === learnPath.get()) || null,
};
export function nextLesson(id: string): Lesson | null {
  const ls = allLessons(), path = learnPath.of(), i = path ? path.lessons.indexOf(id) : -1;
  if (i >= 0) return ls.find((l) => l.id === path!.lessons[i + 1]) || null;
  return ls[ls.findIndex((l) => l.id === id) + 1] || null;
}
/** The lesson a returning learner should open: the last one if unfinished, else the next unfinished one on the path. */
export function upNext(): Lesson {
  const ls = allLessons(), last = P.last ? ls.find((l) => l.id === P.last) : null;
  if (last && !P.done(last.id)) return last;
  const path = learnPath.of(), list = path ? path.lessons.map((id) => ls.find((l) => l.id === id)).filter(Boolean) as Lesson[] : ls;
  const i = last ? list.findIndex((l) => l.id === last.id) : -1;
  return list.slice(i + 1).find((l) => !P.done(l.id)) || list.find((l) => !P.done(l.id)) || ls.find((l) => !P.done(l.id)) || ls[0];
}
