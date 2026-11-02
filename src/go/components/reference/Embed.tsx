// An iframe-friendly player: code, stage and timeline only, for /embed#src=…&at=n.
// The top bar and status bar are hidden while it is mounted (:root.embed in globals.css).
import { useEffect, useRef, useState } from 'react';
import { MiniPlayer } from '../MiniPlayer';
import { href } from '../../lib/routes';
import { hashParams, unpack } from '../../lib/share';

export function Embed() {
  const [prog, setProg] = useState<{ src: string; code: string; at: number } | null | 'bad'>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.classList.add('embed');
    const read = () => {
      const h = hashParams(), code = h.get('src') || '', at = Number(h.get('at')) || 0;
      unpack(code).then((src) => setProg({ src, code, at }), () => setProg('bad'));
    };
    read();
    addEventListener('hashchange', read);
    return () => { removeEventListener('hashchange', read); document.documentElement.classList.remove('embed'); };
  }, []);
  // "Open in gothik" leaves the iframe for a new tab
  if (prog === 'bad') return <div className="empty"><h3>This embed link is damaged.</h3><p>Copy the embed code again from gothik.</p></div>;
  return (
    <div ref={box} style={{ display: 'contents' }}>
      {prog && <MiniPlayer key={prog.code + '&' + prog.at} className="embed-box" source={prog.src} autoplay={false} at={prog.at} open={{ href: href.shared(prog.code, prog.at), label: 'Open in gothik', target: '_blank' }} />}
    </div>
  );
}
