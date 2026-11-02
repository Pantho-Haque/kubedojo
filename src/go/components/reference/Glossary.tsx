// Searchable glossary. The wording follows the "Simple words / Under the hood" setting.
// /glossary#term scrolls to the term and flashes it.
import { Link } from '../../lib/router';
import { useEffect, useState } from 'react';
import { D } from '../../lib/data';
import { href } from '../../lib/routes';
import { setSetting, useSettings } from '../../lib/settings';
import { SectionTabs } from '../practice/SectionTabs';

const termId = (term: string) => 'term-' + term.replace(/\W+/g, '-');
const terms = [...D.glossary].sort((a, b) => a.term.localeCompare(b.term));
let lastQuery = ''; // kept while the tab is open, like the prototype

function focusTerm() {
  let term = '';
  try { term = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const n = term && document.getElementById(termId(term));
  if (!n) return;
  n.scrollIntoView({ block: 'center' });
  n.classList.add('flash');
  setTimeout(() => n.classList.remove('flash'), 1400);
}

export function Glossary() {
  const hood = useSettings().depth === 'hood';
  const [q, setQ] = useState(lastQuery);
  useEffect(() => { lastQuery = q; }, [q]);
  useEffect(() => {
    focusTerm();
    // the palette navigates with pushState, which fires no hashchange; the Navigation API sees it
    const nav = (globalThis as { navigation?: EventTarget }).navigation;
    const later = () => setTimeout(focusTerm, 60);
    addEventListener('hashchange', later);
    nav?.addEventListener('navigatesuccess', later);
    return () => { removeEventListener('hashchange', later); nav?.removeEventListener('navigatesuccess', later); };
  }, []);
  const s = q.trim().toLowerCase();
  const list = terms.filter((g) => !s || g.term.toLowerCase().includes(s) || String(g.beginner || '').toLowerCase().includes(s));
  return (
    <div className="page">
      <header className="page-head">
        <p className="mono faint">{'// glossary'}</p><h1 className="mono">words, plainly.</h1>
        <p>{D.glossary.length} terms. The wording follows the <b>{hood ? 'under the hood' : 'simple words'}</b> setting.</p>
        <div className="row">
          <input className="input" id="gloss-search" type="search" placeholder="Find a term…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320, flex: 1 }} aria-label="Find a term" />
          <div className="seg">
            <button type="button" aria-pressed={!hood} onClick={() => setSetting('depth', 'simple')}>Simple</button>
            <button type="button" aria-pressed={hood} onClick={() => setSetting('depth', 'hood')}>Precise</button>
          </div>
        </div>
      </header>
      <SectionTabs section="reference" active="glossary" />
      <dl className="gloss" id="gloss">
        {list.length ? list.map((g) => {
          const l = D.lesson(String(g.firstLesson || ''));
          return (
            <div key={g.term} className="gloss-item" id={termId(g.term)}>
              <dt className="mono">{g.term}</dt>
              <dd>{String((hood ? g.precise : g.beginner) ?? '')}{l && <> <Link href={href.lesson(l.id)} className="faint">first in {l.id} →</Link></>}</dd>
            </div>
          );
        }) : <div className="empty"><h3>No such term yet.</h3></div>}
      </dl>
    </div>
  );
}
