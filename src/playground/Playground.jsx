import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { store, useStoreSel } from './store.js';
import { selText } from './term.js';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import TerminalPane from './TerminalPane.jsx';
import VizPane from './VizPane.jsx';
import Gutter from './Gutter.jsx';
import StatusBar from './StatusBar.jsx';
import MobileNav from './MobileNav.jsx';
import Palette from './Palette.jsx';
import Tour from './Tour.jsx';
import ExportModal from './ExportModal.jsx';
import './playground.css';
import './playground-pro.css';
import './viz.css';

// The simulator is created once, before the first render, and lives for the whole session (it pauses while you are on the home page).
store.mount();

export default function Playground() {
  const noside = useStoreSel(s => s.noside), exportOpen = useStoreSel(s => s.exportOpen), paletteOpen = useStoreSel(s => s.paletteOpen), pane = useStoreSel(s => s.mobilePane), side = useStoreSel(s => s.layout.side), viz = useStoreSel(s => s.layout.viz);
  const [params] = useSearchParams();
  useEffect(() => {
    store.mount(); if (store.active) store.active.focus();
    const onSel = () => { if (store.renderHeld && !selText()) { store.renderHeld = false; store.bump(); } };
    const onErr = e => { const t = store.active; if (t) t.print('JS error: ' + e.message, 'err'); };
    const save = () => store.saveFsNow();
    const onKey = e => {
      if (e.key === 'Escape' && store.inspect && !store.paletteOpen && !store.exportOpen && store.tourIndex < 0 && !(e.target.closest && e.target.closest('.vi'))) { store.inspect = null; store.bump(); return; } // Esc closes the inspector
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') { e.preventDefault(); store.openPalette(); }
    };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('selectionchange', onSel); window.addEventListener('error', onErr); window.addEventListener('pagehide', save); window.addEventListener('beforeunload', save);
    store.applyParams(params);
    return () => { document.removeEventListener('keydown', onKey, true); document.removeEventListener('selectionchange', onSel); window.removeEventListener('error', onErr); window.removeEventListener('pagehide', save); window.removeEventListener('beforeunload', save); store.unmount(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- runs once per page load
  return (
    <div className={'pg-root' + (noside ? ' noside' : '')} data-pane={pane} style={{ '--side-w': side + 'px', '--viz-w': viz ? viz + 'px' : 'minmax(420px, 1.15fr)' }}>
      <Header />
      <main>
        <Sidebar />
        <Gutter which="side" />
        <TerminalPane />
        <Gutter which="viz" />
        <VizPane />
      </main>
      <StatusBar />
      <MobileNav />
      <Tour />
      {exportOpen && <ExportModal />}
      {paletteOpen && <Palette />}
    </div>
  );
}
