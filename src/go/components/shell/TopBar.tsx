import { Link } from '../../lib/router';
import { usePathname } from '../../lib/router';
import { useEffect, useRef } from 'react';
import SuiteSwitcher from '../../../components/SuiteSwitcher.jsx';
import { Icon } from '../Icon';
import { href, section } from '../../lib/routes';
import { openPalette, openSettings } from '../../lib/shell';
import { setSetting, useSettings, useT } from '../../lib/settings';
import { useHydrated } from '../../lib/store';

const NAV = [
  { key: 'learn', to: href.learn, label: 'Learn', title: 'Lessons, paths and articles' },
  { key: 'work', to: href.playground, label: 'Playground', title: 'Write and run your own Go' },
  { key: 'practice', to: href.gotchas, label: 'Practice', title: 'Gotchas, interview questions and the daily puzzle' },
  { key: 'reference', to: href.glossary, label: 'Reference', title: 'Glossary, reading shelf and internals labs' },
] as const;

export function TopBar() {
  const path = usePathname(), cur = section(path), t = useT();
  useSettings(); // re-render when the theme changes
  const nav = useRef<HTMLElement>(null);
  const dark = useHydrated() ? document.documentElement.dataset.theme !== 'light' : true;
  useEffect(() => {
    const n = nav.current; if (!n) return;
    n.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    n.classList.toggle('fits', n.scrollWidth <= n.clientWidth);
  }, [path]);
  return (
    <header className="topbar">
      <SuiteSwitcher />
      <Link className="brand" href={href.home}><span className="mark" aria-hidden="true">g.</span><span className="word">gothik</span><span className="sr-only"> home</span></Link>
      <nav className="nav" aria-label={t('Primary')} ref={nav}>
        {NAV.map((n) => <Link key={n.key} href={n.to} title={t(n.title)} aria-current={cur === n.key ? 'page' : undefined}>{t(n.label)}</Link>)}
      </nav>
      <div className="top-actions">
        <button className="cmdk" type="button" aria-haspopup="dialog" title="Command palette (⌘K / Ctrl+K)" onClick={() => openPalette()}>
          <Icon name="search" /><span>{t('Search lessons, run commands…')}</span><kbd>⌘K</kbd>
        </button>
        <button className="icon-btn" id="theme-toggle" type="button" aria-label={t(dark ? 'Switch to light theme' : 'Switch to dark theme')} title="Toggle theme"
          onClick={() => setSetting('theme', document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')}>
          <Icon name={dark ? 'sun' : 'moon'} />
        </button>
        <button className="icon-btn" type="button" aria-label={t('Settings')} title="Settings" onClick={openSettings}><Icon name="settings" /></button>
      </div>
    </header>
  );
}
