// App-wide services the shell renders: toasts, the screen-reader announcer, the status bar,
// the command palette registry and the generic tool dialog. Each is a tiny external store.
import { useSyncExternalStore, type ReactNode } from 'react';
import { getSettings } from './settings';

function createStore<T>(initial: T) {
  let value = initial;
  const subs = new Set<() => void>();
  return {
    get: () => value,
    set(next: T | ((v: T) => T)) { value = typeof next === 'function' ? (next as (v: T) => T)(value) : next; subs.forEach((f) => f()); },
    subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
  };
}
function useValue<T>(s: ReturnType<typeof createStore<T>>, server: T) { return useSyncExternalStore(s.subscribe, s.get, () => server); }

/* ---------- toasts + announcer ---------- */
type Toast = { id: number; msg: string; out?: boolean };
const toasts = createStore<Toast[]>([]);
let toastSeq = 0;
export function toast(msg: string, ms = 2600) {
  const id = ++toastSeq;
  toasts.set((l) => [...l, { id, msg }]);
  setTimeout(() => { toasts.set((l) => l.map((t) => (t.id === id ? { ...t, out: true } : t))); setTimeout(() => toasts.set((l) => l.filter((t) => t.id !== id)), 260); }, ms);
}
export const useToasts = () => useValue(toasts, []);

const announcer = createStore('');
export const announce = (msg: string) => { announcer.set(''); setTimeout(() => announcer.set(msg), 30); };
export const useAnnouncement = () => useValue(announcer, '');

/* ---------- status bar ---------- */
export type Status = { state: string; tone: 'ok' | 'busy' | 'bad'; step: string; gor: string; heap: string; gc: string; cursor: string; saved: string };
const IDLE: Status = { state: 'Ready', tone: 'ok', step: '', gor: '', heap: '', gc: '', cursor: '', saved: 'Progress stays on this device' };
const statusStore = createStore<Status>(IDLE);
/** Update the status bar. Text fields may contain <b> markup. */
export const status = (o: Partial<Status>) => statusStore.set((s) => ({ ...s, ...o }));
export const clearStatus = () => statusStore.set((s) => ({ ...s, step: '', gor: '', heap: '', gc: '', cursor: '' }));
export const useStatus = () => useValue(statusStore, IDLE);

/* ---------- command palette ---------- */
export type Command = { id: string; kind: string; title: string; hint?: string; keys?: string; run: () => void };
const commands = createStore<Command[]>([]);
/** Register commands while a component is mounted; returns the unregister function (use it as an effect cleanup). */
export function registerCommands(list: Command[]) {
  commands.set((l) => [...l.filter((c) => !list.some((x) => x.id === c.id)), ...list]);
  return () => commands.set((l) => l.filter((c) => !list.includes(c)));
}
export const useCommands = () => useValue(commands, []);

type Dialog = 'palette' | 'settings' | 'keys' | 'tool' | null;
const dialog = createStore<{ open: Dialog; query?: string; tool?: { title: string; body: ReactNode } }>({ open: null });
export const openPalette = (query = '') => dialog.set({ open: 'palette', query });
export const openSettings = () => dialog.set({ open: 'settings' });
export const openKeys = () => dialog.set({ open: 'keys' });
/** Generic tool dialog: a title and any React content. */
export const openTool = (title: string, body: ReactNode) => dialog.set({ open: 'tool', tool: { title, body } });
export const closeDialog = () => dialog.set({ open: null });
export const useDialog = () => useValue(dialog, { open: null });

/* ---------- read aloud (native speech synthesis) ---------- */
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';
export function speak(text: string): Promise<void> {
  if (!canSpeak()) return Promise.resolve();
  speechSynthesis.cancel();
  return new Promise((done) => {
    const u = new SpeechSynthesisUtterance(String(text).slice(0, 400));
    u.lang = 'en-US'; u.rate = Math.min(1.6, Math.max(0.8, getSettings().speed));
    const timer = setTimeout(done, 12000); // some engines never fire 'end'
    u.onend = u.onerror = () => { clearTimeout(timer); done(); };
    speechSynthesis.speak(u);
  });
}
export const hush = () => { if (canSpeak()) speechSynthesis.cancel(); };

/* ---------- fuzzy match for the palette ---------- */
export function fuzzy(q: string, text: string): { score: number; parts: [string, boolean][] } | null {
  if (!q) return { score: 1, parts: [[text, false]] };
  const t = text.toLowerCase(), qq = q.toLowerCase(), at = t.indexOf(qq);
  if (at >= 0) return { score: 100 - at + (at === 0 ? 50 : 0), parts: [[text.slice(0, at), false], [text.slice(at, at + q.length), true], [text.slice(at + q.length), false]] };
  let i = 0, score = 0, last = -2;
  const parts: [string, boolean][] = [];
  for (let j = 0; j < text.length; j++) {
    const hit = i < qq.length && t[j] === qq[i];
    if (hit) { score += j === last + 1 ? 5 : 1; last = j; i++; }
    const prev = parts.at(-1);
    if (prev && prev[1] === hit) prev[0] += text[j]; else parts.push([text[j], hit]);
  }
  return i === qq.length ? { score, parts } : null;
}
