// The Tinkerlab switcher at the start of every header: the mark, opening a menu of every playground and course by category.
// A native popover (no state, closes on Escape and outside clicks), placed under its button when it opens.
import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAME, sections, trackOf, tracks } from '../site/catalog.js';
import { courseBySlug } from '../academy/data.js';
import { TinkerMark } from './Logo.jsx';
import '../styles/switcher.css';

// "Jump back in" on the home page: the last page you were on in each category, saved as you leave it (a new route, or the tab).
function remember(path) {
  const id = trackOf(path, courseBySlug); if (!id) return;
  try { const all = JSON.parse(localStorage.getItem('tinkerlab:last') || '{}'); all[id] = { href: path, title: document.title, at: Date.now() }; localStorage.setItem('tinkerlab:last', JSON.stringify(all)); } catch { /* storage blocked */ }
}
function useRememberPage() {
  const { pathname, search, hash } = useLocation(); const here = pathname + search + hash;
  useEffect(() => { // the cleanup runs before the next page sets its title, so it saves this page's
    const save = () => remember(here); addEventListener('pagehide', save);
    return () => { removeEventListener('pagehide', save); save(); };
  }, [here]);
}

export default function SuiteSwitcher() {
  const btn = useRef(null), panel = useRef(null);
  useRememberPage();
  useEffect(() => {
    const p = panel.current, b = btn.current;
    const place = e => {
      const open = e.newState === 'open'; b.setAttribute('aria-expanded', open); if (!open) return;
      const r = b.getBoundingClientRect(), w = Math.min(760, innerWidth - 16);
      p.style.top = r.bottom + 8 + 'px'; p.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + 'px';
    };
    p.addEventListener('beforetoggle', place); return () => p.removeEventListener('beforetoggle', place);
  }, []);
  const close = () => panel.current?.hidePopover?.(); // a link was followed inside the app: the page stays, so close the menu
  const go = (x, cls) => <Link key={x.href + x.title} className={cls} to={x.href} onClick={close}>{x.title}</Link>;
  return (
    <span className="tlsw">
      <button ref={btn} type="button" className="tlsw-btn" popoverTarget="tlsw-menu" aria-expanded="false" aria-label={`${NAME}: all courses and playgrounds`}>
        <TinkerMark size={22} /><span className="tlsw-name">{NAME}</span>
        <svg className="tlsw-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
      </button>
      <span className="tlsw-sep" aria-hidden="true" />
      <nav ref={panel} id="tlsw-menu" className="tlsw-menu" popover="auto" aria-label={NAME}>
        <p className="tlsw-h">Go to</p>
        <div className="tlsw-chips tlsw-go">
          {sections.map(s => <Link key={s.href} className="tlsw-chip" data-cat={s.cat} to={s.href} onClick={close}>{s.cat ? <i /> : null}{s.title}</Link>)}
        </div>
        <p className="tlsw-h">Playgrounds</p>
        <div className="tlsw-chips">
          {tracks.flatMap(t => t.playgrounds.map(p => <Link key={p.href} className="tlsw-chip" data-cat={t.id} to={p.href} onClick={close}><i />{p.title}</Link>))}
          <Link className="tlsw-chip" data-cat="devops" to="/academy#simulate" onClick={close}><i />Simulate labs</Link>
        </div>
        <p className="tlsw-h">Courses</p>
        <div className="tlsw-cols">{tracks.map(t => (
          <section key={t.id} data-cat={t.id}>
            <Link className="tlsw-track" to={`/academy#${t.id}`} onClick={close}><i />{t.name}<small>{t.courses.length} courses →</small></Link>
            <ul>{t.courses.map(c => <li key={c.href}>{go(c)}<small>{c.lessons}</small></li>)}</ul>
            {t.practice.length + t.reference.length > 0 && <p className="tlsw-more">{[...t.practice, ...t.reference].map(x => go(x))}</p>}
          </section>
        ))}</div>
      </nav>
    </span>
  );
}
