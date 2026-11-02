// The Academy: every lesson as an article card, grouped by track, filtered as you type.
import { Link } from '../../lib/router';
import { useState } from 'react';
import { Icon } from '../Icon';
import { TRACK_HUE, clip } from '../../lib/data';
import { useCatalog } from '../../lib/packs';
import { P, useProgress } from '../../lib/progress';
import { useHydrated } from '../../lib/store';
import { href } from '../../lib/routes';

export function ArticleGrid({ children }: { children: React.ReactNode }) {
  useProgress();
  const { lessons, tracks } = useCatalog(), h = useHydrated(), [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const groups = tracks.map((t) => ({ t, ls: lessons.filter((l) => l.track === t.id && (!q || (l.title + ' ' + l.hook + ' ' + l.id).toLowerCase().includes(q))) })).filter((g) => g.ls.length);
  return <>
    <header className="page-head">
      {children}
      <input className="input" type="search" placeholder="Search articles…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ maxWidth: 360 }} aria-label="Search articles" />
    </header>
    <div>
      {groups.length ? groups.map(({ t, ls }) => (
        <section key={t.id} className="acad-track" style={{ ['--hue' as string]: TRACK_HUE[t.id] }}>
          <h2 className="mono"><span className="track-dot" />{t.title}</h2>
          <div className="acad-grid stagger">
            {ls.map((l) => (
              <Link key={l.id} className="acad-card" href={href.article(l.id)}>
                <span className="mono faint">{l.id} · {l.estimatedMinutes || 5} min</span><strong>{l.title}</strong><span className="dim">{clip(l.hook, 130)}</span>
                {h && P.done(l.id) && <span className="acad-done"><Icon name="check" /></span>}
              </Link>
            ))}
          </div>
        </section>
      )) : <div className="empty"><h3>No articles match.</h3></div>}
    </div>
  </>;
}
