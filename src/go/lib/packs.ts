// Lesson packs a teacher wrote and the learner imported. They live in this browser and are
// merged with the built-in curriculum under an extra "Imported lessons" track (id X).
import { store, useStoreVersion } from './store';
import { D, type Lesson, type Program, type Track } from './data';

const PACKKEY = 'gothik-packs-v1';
export type Pack = { title: string; lessons: Lesson[]; programs: Program[]; [k: string]: unknown };

export const packs = {
  list: (): Pack[] => { const v = store.get<Pack[]>(PACKKEY, []); return Array.isArray(v) ? v : []; },
  save: (list: Pack[]) => store.set(PACKKEY, list),
};
export const lessons = (): Lesson[] => { const ps = typeof window === 'undefined' ? [] : packs.list(); return ps.length ? [...D.lessons, ...ps.flatMap((p) => p.lessons)] : D.lessons; };
export const programs = (): Program[] => { const ps = typeof window === 'undefined' ? [] : packs.list(); return ps.length ? [...D.programs, ...ps.flatMap((p) => p.programs)] : D.programs; };
export const tracks = (): Track[] => (typeof window !== 'undefined' && packs.list().length ? [...D.tracks, { id: 'X', title: 'Imported lessons' }] : D.tracks);
export const lesson = (id: string) => lessons().find((l) => l.id === id);
export const program = (id?: string | null) => programs().find((p) => p.id === id);

/** Built-in + imported content as React state (built-in only on the server and while hydrating). */
export function useCatalog() {
  const v = useStoreVersion();
  return v < 0 ? { lessons: D.lessons, programs: D.programs, tracks: D.tracks } : { lessons: lessons(), programs: programs(), tracks: tracks() };
}
