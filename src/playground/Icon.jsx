// 16-24px stroke icons as inline SVG (no emoji as UI icons, no icon font, no extra request).
const P = {
  sidebar: 'M3 4h18v16H3zM9 4v16',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  play: 'M7 4.5l12 7.5-12 7.5z',
  download: 'M12 3v12M7 10l5 5 5-5M4 20h16',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.5 9.2a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1.9-1.1 1.8M12 17h.01',
  reset: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  terminal: 'M3 5h18v14H3zM7 10l3 2-3 2M12 15h5',
  cluster: 'M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10',
  book: 'M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h12',
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  home: 'M3 11.5 12 4l9 7.5M5.5 10v10h13V10',
  file: 'M7 3h7l5 5v13H7zM14 3v5h5',
  clear: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chevron: 'M9 6l6 6-6 6',
};
export default function Icon({ name, size = 18 }) {
  return <svg className="ico" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={P[name]} /></svg>;
}

/* WAI-ARIA tabs: ArrowLeft/Right/Home/End move to (and activate) the neighbouring tab. Put on the role=tablist element; tabs use tabIndex = selected ? 0 : -1. */
export function tabKeys(e) {
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']; if (!keys.includes(e.key)) return;
  const tabs = [...e.currentTarget.querySelectorAll('[role=tab]')]; const i = tabs.indexOf(document.activeElement); if (i < 0) return;
  e.preventDefault(); const n = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  tabs[n].focus(); tabs[n].click();
}
