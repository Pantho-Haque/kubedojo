const KEY = 'kubedojo:theme';
// The theme itself is applied by a tiny inline script in <head> before first paint (no flash); this only flips it.
export default function ThemeToggle() {
  const flip = () => {
    const root = document.documentElement; const cur = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark'; root.dataset.theme = next; try { localStorage.setItem(KEY, next); } catch (e) { /* private mode: the choice just is not remembered */ }
  };
  return (
    <button type="button" className="icon-btn theme-toggle" onClick={flip} aria-label="Switch between light and dark theme" title="Switch theme">
      <svg className="i-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>
      <svg className="i-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></svg>
    </button>
  );
}
