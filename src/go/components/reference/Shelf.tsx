// The reading shelf: titles filter as you type; from 3 letters the full text is searched too
// (lib/reading.ts loads the search index on first use; it returns ids and snippets).
import { Link } from '../../lib/router';
import { useEffect, useState } from 'react';
import { D, type Doc } from '../../lib/data';
import { href } from '../../lib/routes';
import { searchShelf } from '../../lib/reading';
import { SectionTabs } from '../practice/SectionTabs';

let lastQuery = ''; // kept while the tab is open, like the prototype

export function Shelf() {
  const [q, setQ] = useState(lastQuery), [hits, setHits] = useState<{ q: string; map: Map<string, string> }>({ q: '', map: new Map() });
  const s = q.trim().toLowerCase();
  useEffect(() => {
    lastQuery = q;
    if (s.length < 3) return;
    let on = true;
    const t = setTimeout(() => {
      searchShelf(s, D.corpus)
        .then((list) => { if (on) setHits({ q: s, map: new Map(list.map((x) => [x.id, x.snip])) }); })
        .catch(() => { /* offline before the index loaded: titles still filter */ });
    }, 160);
    return () => { on = false; clearTimeout(t); };
  }, [q, s]);

  const full = s.length >= 3 && hits.q === s ? hits.map : null;
  const groups = new Map<string, { d: Doc; snip: string }[]>();
  for (const d of D.corpus) {
    const hitTitle = !s || d.title.toLowerCase().includes(s) || (d.topic + '/' + d.subtag).includes(s);
    const snip = full?.get(d.id);
    if (!hitTitle && snip == null) continue;
    const k = d.topic + ' / ' + d.subtag;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push({ d, snip: !hitTitle && snip ? snip : '' });
  }
  return (
    <div className="page">
      <header className="page-head">
        <p className="mono faint">{'// reading'}</p><h1 className="mono">the sources, in one place.</h1>
        <p>{D.corpus.length} documents from go.dev, the Go source tree and long-form articles that the lessons cite. Search titles and full text.</p>
        <input className="input" id="read-search" type="search" placeholder="Search all documents (e.g. mcache, work stealing)…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 420 }} aria-label="Search documents" />
      </header>
      <SectionTabs section="reference" active="reading" />
      <div id="read-list">
        {groups.size ? [...groups].map(([k, ds]) => (
          <section key={k} className="read-group"><h2 className="mono">{k}</h2>
            {ds.map(({ d, snip }) => (
              <Link key={d.id} className="read-row" href={href.doc(d.id)}>
                <strong>{d.title}</strong><span className="faint mono">{new URL(d.url).hostname}</span>{snip && <span className="dim snip">{snip}</span>}
              </Link>
            ))}
          </section>
        )) : <div className="empty"><h3>Nothing found.</h3><p>Try a shorter word.</p></div>}
      </div>
    </div>
  );
}
