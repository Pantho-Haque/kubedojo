import { useRef } from 'react';
import { store, useStore } from './store.js';
import { tabKeys } from './Icon.jsx';
import ClusterView from './views/ClusterView.jsx';
import DockerView from './views/DockerView.jsx';
import ConfigView from './views/ConfigView.jsx';
import HelmView from './views/HelmView.jsx';
import FilesView from './views/FilesView.jsx';
import EventsView from './views/EventsView.jsx';
import Inspector from './views/Inspector.jsx';

const TABS = [['cluster', 'Cluster'], ['docker', 'Docker'], ['config', 'Config & access'], ['helm', 'Helm'], ['files', 'Files'], ['log', 'Events']];
const VIEWS = { cluster: ClusterView, docker: DockerView, config: ConfigView, helm: HelmView, files: FilesView, log: EventsView };

/* While you are selecting text inside a panel, keep showing what was there, so the selection is not wiped by the next simulator tick
   (when the selection ends, the Playground re-renders). */
function useFrozenWhileSelecting(id, element, view) {
  const last = useRef(element); const lastView = useRef(view);
  if (lastView.current !== view) { lastView.current = view; last.current = element; return element; } // switching tabs always shows the new tab
  const g = window.getSelection(); const host = document.getElementById(id);
  const hold = !!(g && !g.isCollapsed && g.anchorNode && host && host.contains(g.anchorNode));
  if (hold) { store.renderHeld = true; return last.current; }
  last.current = element; return element;
}

export default function VizPane({ only = null }) { // only: show a single view without the tab bar (used by the home page demo)
  useStore();
  const View = VIEWS[only || store.vizTab];
  const body = useFrozenWhileSelecting('vizbody', <View />, only || store.vizTab);
  const insp = useFrozenWhileSelecting('insp', <Inspector />, 'insp');
  return (
    <section id="vizpane">
      <div id="viztabs" role="tablist" aria-label="Views" hidden={!!only} onKeyDown={tabKeys}>{TABS.map(([t, label]) => <button key={t} role="tab" aria-selected={store.vizTab === t} tabIndex={store.vizTab === t ? 0 : -1} className={'vtab' + (store.vizTab === t ? ' on' : '')} onClick={() => store.setViz(t)}>{label}</button>)}</div>
      <div id="vizbody">{body}</div>
      <div id="insp">{insp}</div>
    </section>
  );
}
