// Academy progress, kept in this browser only (one key, kd.academy.v1): finished lessons, quiz answers, checklist ticks,
// practice challenges, and where you stopped. Simulate sessions and lesson terminals keep their own keys (see storage list).
import { useSyncExternalStore } from 'react';

const KEY = 'kd.academy.v1';
const EMPTY = Object.freeze({ done: {}, quiz: {}, tasks: {}, ch: {}, last: null });
let state = null; const subs = new Set();
const read = () => { try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); return d && d.v === 1 ? { ...EMPTY, ...d } : { ...EMPTY }; } catch { return { ...EMPTY }; } };
const write = () => { try { localStorage.setItem(KEY, JSON.stringify({ v: 1, ...state })); } catch { /* private mode or full: progress lives for this visit only */ } };
const get = () => (state ||= read());
function update(fn) { const next = structuredClone(get()); fn(next); state = next; write(); subs.forEach(f => f()); }
const subscribe = f => { subs.add(f); return () => subs.delete(f); };

// Empty on the server and during hydration (so the HTML matches), the saved progress right after.
export const useProgress = () => useSyncExternalStore(subscribe, get, () => EMPTY);
export const getProgress = get;

export const markDone = id => { if (!get().done[id]) update(s => { s.done[id] = 1; }); };
export const answer = (id, qi, opt) => update(s => { (s.quiz[id] ||= {})[qi] = opt; });
// checklist ticks are stored as lessonId:taskKey, so a course reset can find its own
export const setTask = (lessonId, key, on) => update(s => { const k = lessonId + ':' + key; if (on) s.tasks[k] = 1; else delete s.tasks[k]; });
export const winChallenge = id => { if (!get().ch[id]) update(s => { s.ch[id] = 1; }); };
// the home page reads `last` to offer "Continue …" without loading the Academy's data
export const setLast = last => update(s => { s.last = { ...last, at: Date.now() }; });

// Saved simulator state lives under these prefixes; a reset removes it with the progress.
export const simKey = course => `kd.academy.sim.v1.${course}`;
export const tryKey = (course, lesson) => `kd.academy.try.v1.${course}.${lesson}`;
export const tourKey = course => `kd.academy.tour.v1.${course}`;
function removeKeys(match) { try { for (const k of Object.keys(localStorage)) if (match(k)) localStorage.removeItem(k); } catch { /* storage blocked: nothing saved anyway */ } }

export function resetCourse(course) {
  update(s => {
    const ids = new Set(course.lessons.map(l => l.id));
    for (const id of ids) { delete s.done[id]; delete s.quiz[id]; delete s.ch[id]; }
    for (const k of Object.keys(s.tasks)) if (ids.has(k.split(':')[0])) delete s.tasks[k];
    if (s.last?.course === course.slug) s.last = null;
  });
  removeKeys(k => k === simKey(course.slug) || k.startsWith(simKey(course.slug) + '.') || k.startsWith(`kd.academy.try.v1.${course.slug}.`) || k === tourKey(course.slug));
}
export function resetAcademy() { state = { ...EMPTY }; removeKeys(k => k.startsWith('kd.academy.')); subs.forEach(f => f()); }
