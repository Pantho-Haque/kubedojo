import { useEffect, useRef, useState } from 'react';

/* Keep removed list items on screen for `ms` so they can animate out.
   Returns [{ item, key, leaving, fresh }] in display order. `fresh` = added after the list first appeared (play the enter animation;
   the first render never animates, so switching tabs is calm). Render is pure: ghosts are registered in an effect. */
export function useGhosts(items, keyOf, ms = 420) {
  const known = useRef(null); const prev = useRef(new Map()); const ghosts = useRef(new Map()); const born = useRef(new Map()); const [, bump] = useState(0);
  const cur = new Map(items.map(it => [keyOf(it), it]));
  const gone = new Map(ghosts.current); for (const [k, it] of prev.current) if (!cur.has(k) && !gone.has(k)) gone.set(k, it); for (const k of cur.keys()) gone.delete(k);
  const firstRender = known.current === null;
  const out = items.map(it => { const k = keyOf(it); return { item: it, key: k, leaving: false, fresh: !firstRender && (!known.current.has(k) || Date.now() - (born.current.get(k) || 0) < 700) }; });
  for (const [k, it] of gone) out.push({ item: it, key: k, leaving: true, fresh: false });
  useEffect(() => {
    if (!known.current) known.current = new Set(); for (const k of cur.keys()) { if (!known.current.has(k) && !firstRender) born.current.set(k, Date.now()); known.current.add(k); ghosts.current.delete(k); }
    for (const [k, it] of gone) if (!ghosts.current.has(k)) { ghosts.current.set(k, it); setTimeout(() => { ghosts.current.delete(k); bump(n => n + 1); }, ms); }
    prev.current = cur;
  });
  return out;
}

// true for ~`ms` after `value` changes (not on the first render): drives a short highlight when a status flips
export function useFlash(value, ms = 900) {
  const [on, setOn] = useState(false); const last = useRef(value); const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } if (last.current !== value) { last.current = value; setOn(true); const t = setTimeout(() => setOn(false), ms); return () => clearTimeout(t); } }, [value, ms]);
  return on;
}
