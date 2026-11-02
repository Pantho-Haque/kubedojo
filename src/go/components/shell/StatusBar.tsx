import { usePathname } from '../../lib/router';
import { useEffect } from 'react';
import { clearStatus, openKeys, useAnnouncement, useStatus, useToasts } from '../../lib/shell';
import { useT } from '../../lib/settings';
import { D } from '../../lib/data';

export function StatusBar() {
  const s = useStatus(), t = useT(), path = usePathname();
  useEffect(() => { if (!path.startsWith('/playground') && !/^\/learn\/./.test(path)) clearStatus(); }, [path]);
  const stat = (id: string, html: string, cls = 'stat hide-sm') => (html ? <span className={cls} id={id} dangerouslySetInnerHTML={{ __html: html }} /> : null);
  return (
    <footer className="statusbar" aria-label="Status">
      <span className="stat"><span className={'led ' + s.tone} id="sb-led" /><b id="sb-state">{t(s.state)}</b></span>
      <span className="stat hide-sm" id="sb-go">{D.meta.semanticsLabel || 'Go 1.26 subset'}</span>
      {stat('sb-step', s.step, 'stat')}
      {stat('sb-gor', s.gor)}
      {stat('sb-heap', s.heap)}
      {stat('sb-gc', s.gc)}
      <span className="spacer" />
      {stat('sb-cursor', s.cursor)}
      <span className="stat hide-sm" id="sb-saved">{t(s.saved)}</span>
      <button className="stat hide-sm" id="sb-keys" type="button" title="Keyboard shortcuts" onClick={openKeys}>? {t('keys')}</button>
    </footer>
  );
}

export function Toasts() {
  const list = useToasts(), said = useAnnouncement();
  return (
    <>
      <div id="toasts" role="status" aria-live="polite">{list.map((x) => <div key={x.id} className={'toast' + (x.out ? ' out' : '')}>{x.msg}</div>)}</div>
      <div className="sr-only" id="announcer" aria-live="polite">{said}</div>
    </>
  );
}
