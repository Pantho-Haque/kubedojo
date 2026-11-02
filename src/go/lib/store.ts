// Guarded localStorage: works when storage is blocked (falls back to memory) and
// notifies subscribers so React can re-render with useSyncExternalStore.
import { useSyncExternalStore } from 'react';

const mem = new Map<string, unknown>();
const subs = new Set<() => void>();
let version = 0;
const bump = () => { version++; subs.forEach((f) => f()); };

export const store = {
  get<T>(k: string, fb: T): T {
    try { const v = localStorage.getItem(k); return v == null ? (mem.has(k) ? (mem.get(k) as T) : fb) : (JSON.parse(v) as T); }
    catch { return mem.has(k) ? (mem.get(k) as T) : fb; }
  },
  set(k: string, v: unknown): boolean {
    mem.set(k, v);
    let ok = true;
    try { localStorage.setItem(k, JSON.stringify(v)); } catch { ok = false; }
    bump();
    return ok;
  },
  del(k: string) { mem.delete(k); try { localStorage.removeItem(k); } catch { /* blocked */ } bump(); },
};

if (typeof window !== 'undefined') addEventListener('storage', bump);

export function subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; }

/** Re-render when anything in the store changes. -1 on the server and during hydration. */
export function useStoreVersion() {
  return useSyncExternalStore(subscribe, () => version, () => -1);
}

/** True once the client has hydrated, so stored values can be shown without a mismatch. */
export const useHydrated = () => useStoreVersion() >= 0;

/** Read one stored value reactively; the fallback is used on the server and while hydrating. */
export function useStored<T>(key: string, fallback: T): T {
  return useStoreVersion() < 0 ? fallback : store.get(key, fallback);
}
