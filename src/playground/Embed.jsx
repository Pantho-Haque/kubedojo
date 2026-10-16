// The real simulator, small: a terminal and the cluster view, for the home page demo. It shares the singleton store with /app,
// so whatever you build here is still there when you open the full playground. Loaded only when the visitor asks for it.
import { useEffect } from 'react';
import { store, useStore } from './store.js';
import TerminalPane from './TerminalPane.jsx';
import VizPane from './VizPane.jsx';
import './playground.css';
import './playground-pro.css';
import './viz.css';
import './embed.css';

export default function Embed() {
  useStore();
  useEffect(() => {
    store.mount();
    if (store.active && !store.active.value) { store.active.setValue('kind create cluster --name dojo'); }
    return () => store.unmount();
  }, []);
  if (!store.sim) return null;
  return (
    <div className="pg-root pg-embed">
      <main><TerminalPane compact /><VizPane only="cluster" /></main>
    </div>
  );
}
