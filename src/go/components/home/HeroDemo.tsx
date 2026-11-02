// The hero: four real programs to switch between, edit and watch, in a looping mini player.
import { useRef, useState } from 'react';
import { MiniPlayer, type MiniApi } from '../MiniPlayer';
import { href } from '../../lib/routes';
import { SCENARIOS } from './demo';

export function HeroDemo() {
  const [cur, setCur] = useState(SCENARIOS[0].id), api = useRef<MiniApi | null>(null), tabs = useRef<HTMLDivElement>(null);
  function pick(id: string) {
    const sc = SCENARIOS.find((x) => x.id === id)!;
    setCur(id);
    if (api.current?.editor) api.current.editor.value = sc.src;
    api.current?.run(sc.src, true);
  }
  function onKey(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const i = SCENARIOS.findIndex((x) => x.id === cur), n = (i + (e.key === 'ArrowRight' ? 1 : -1) + SCENARIOS.length) % SCENARIOS.length;
    tabs.current?.querySelectorAll('button')[n]?.focus();
    pick(SCENARIOS[n].id);
  }
  return <>
    <div className="scenarios" role="tablist" aria-label="Example programs" ref={tabs} onKeyDown={onKey}>
      {SCENARIOS.map((x) => <button key={x.id} role="tab" type="button" aria-selected={x.id === cur} onClick={() => pick(x.id)}>{x.label}</button>)}
    </div>
    <div className="window">
      <div className="window-bar"><span /><span /><span /><b className="mono">{SCENARIOS.find((x) => x.id === cur)!.file} — edit me</b></div>
      <MiniPlayer source={SCENARIOS[0].src} loop delay={1100} open={{ href: href.playground, label: 'Open full lab' }} onReady={(a) => { api.current = a; }} />
    </div>
  </>;
}
