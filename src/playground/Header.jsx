import { Link } from 'react-router-dom';
import { store, useStore } from './store.js';
import Logo from '../components/Logo.jsx';
import Icon from './Icon.jsx';

const pad = n => String(n).padStart(2, '0');
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '');
export const MOD = isMac ? '⌘' : 'Ctrl+';

export default function Header() {
  useStore();
  const sim = store.sim; const cur = sim.kubeconfig.current; const cl = sim.currentCluster(); const prod = cl && cl.tool === 'gke';
  const t = Math.floor(sim.clock);
  return (
    <header>
      <button id="sidebtn" className="ibtn" title="Show or hide the guide" aria-label="Show or hide the guide" aria-pressed={!store.noside} onClick={() => store.toggleSide()}><Icon name="sidebar" /></button>
      <Link to="/" className="brand" title="Back to the KubeDojo home page"><Logo size={20} /><b>KubeDojo</b></Link>
      <span id="ctxbadge" className={'ctx ' + (!cur ? 'none' : prod ? 'prod' : 'local')} role="status" title="The kubectl context every command goes to">{cur ? <>{prod ? <span className="ctx-warn">PRODUCTION</span> : null}<span className="ctx-k">context</span><b>{cur}</b></> : <><span className="ctx-k">context</span><b>none</b></>}</span>
      <span className="sp"></span>
      <span id="timebox" title="Simulated time: pods take simulated seconds to start">
        <span className="live-dot" aria-hidden="true"></span><span id="clock">{`sim ${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`}</span>
        <span id="speed" className="seg" role="radiogroup" aria-label="Simulation speed">{[1, 2, 4, 8].map(v => <button key={v} type="button" role="radio" aria-checked={store.speed === v} className={store.speed === v ? 'on' : ''} onClick={() => store.setSpeed(v)}>{v}×</button>)}</span>
      </span>
      <button id="palbtn" className="pal" onClick={() => store.openPalette()} title={`Search commands and actions (${MOD}⇧P)`}><Icon name="search" size={15} /><span>Commands</span><kbd>{MOD}⇧P</kbd></button>
      <span id="helpbox">
        <button id="tourbtn" className="ibtn" title="A 2-minute walkthrough of every part of the page" aria-label="Start the tour" onClick={() => store.startTour(0)}><Icon name="play" /></button>
        <button id="exportbtn" className="ibtn" title="Build a bash script that recreates this environment on a real machine" aria-label="Export a setup script" onClick={() => { store.exportOpen = true; store.bump(); }}><Icon name="download" /></button>
        <button id="helpbtn" className="ibtn" title="Print the list of supported commands" aria-label="Help: list commands" onClick={() => store.runInTerm('help', true)}><Icon name="help" /></button>
        <button id="resetbtn" className="ibtn" title="Throw away the simulated world and start over (your files are kept)" aria-label="Reset the simulated world" onClick={() => { if (window.confirm('Throw away the simulated clusters and start over?\n\nYour files are kept (they live in this browser).')) store.reset(); }}><Icon name="reset" /></button>
      </span>
    </header>
  );
}
