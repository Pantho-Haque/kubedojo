import { openKeys, openSettings } from '../../lib/shell';
import { setSetting } from '../../lib/settings';

export function FootActions() {
  return <>
    <button type="button" className="linkish" onClick={openKeys}>Keyboard shortcuts</button>
    <button type="button" className="linkish" onClick={openSettings}>Settings &amp; progress</button>
    <button type="button" className="linkish" onClick={() => setSetting('theme', document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')}>Switch theme</button>
  </>;
}
