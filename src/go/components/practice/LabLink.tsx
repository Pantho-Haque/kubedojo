// "Open in the lab": a playground share link carrying the program (packed on the client).
// Optionally records the gotcha as seen.
import { Link } from '../../lib/router';
import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { href } from '../../lib/routes';
import { pack } from '../../lib/share';
import { store } from '../../lib/store';

const SEENKEY = 'gothik-gotchas-seen-v1';

export function LabLink({ source, seen }: { source: string; seen?: string }) {
  const [to, setTo] = useState(href.playground);
  useEffect(() => {
    let on = true;
    pack(source).then((c) => { if (on) setTo(href.shared(c)); });
    if (seen) { const s = new Set(store.get<string[] | null>(SEENKEY, null) || []); if (!s.has(seen)) store.set(SEENKEY, [...s, seen]); }
    return () => { on = false; };
  }, [source, seen]);
  return <Link className="btn sm" id="gotcha-lab" href={to}>Open in the lab <Icon name="arrow" /></Link>;
}
