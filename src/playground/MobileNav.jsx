import { store, useStore } from './store.js';
import Icon from './Icon.jsx';

// Below ~900 px the three panes do not fit side by side: show one at a time, switched from a bottom bar.
export default function MobileNav() {
  useStore();
  const tabs = [['guide', 'Guide', 'book'], ['term', 'Terminal', 'terminal'], ['viz', 'Cluster', 'cluster']];
  return (
    <nav id="mobilenav" aria-label="Panes">
      {tabs.map(([id, label, icon]) => <button key={id} type="button" className={store.mobilePane === id ? 'on' : ''} aria-current={store.mobilePane === id ? 'page' : undefined} onClick={() => store.setPane(id)}><Icon name={icon} size={20} /><span>{label}</span></button>)}
    </nav>
  );
}
