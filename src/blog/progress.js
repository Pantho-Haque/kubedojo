// Reading progress, kept in this browser only: which posts you finished and which one you were on.
import { useEffect, useState } from 'react';
const READ = 'kubedojo:read', LAST = 'kubedojo:last';
const safe = fn => { try { return fn(); } catch (e) { return null; } };
export const readSet = () => new Set(safe(() => JSON.parse(localStorage.getItem(READ) || '[]')) || []);
export const markRead = slug => safe(() => { const s = readSet(); if (s.has(slug)) return; s.add(slug); localStorage.setItem(READ, JSON.stringify([...s])); });
export const setLast = slug => safe(() => localStorage.setItem(LAST, slug));
// Empty on the server and on the first client render (so the HTML matches), filled in right after.
export function useProgress() {
  const [state, setState] = useState({ read: new Set(), last: null });
  useEffect(() => { setState({ read: readSet(), last: safe(() => localStorage.getItem(LAST)) }); }, []);
  return state;
}
