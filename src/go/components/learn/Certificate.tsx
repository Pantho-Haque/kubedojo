// A self-issued certificate for a finished track: printable, or saved as SVG/PNG. Locked until every lesson is done.
import { Link } from '../../lib/router';
import { D, esc, type Track } from '../../lib/data';
import { useProgress } from '../../lib/progress';
import { download, svgToPNG } from '../../lib/share';
import { store, useHydrated, useStored } from '../../lib/store';
import { href } from '../../lib/routes';
import { stats } from './stats';

const W = 1100, H = 760;
export function certificateSVG(track: Track, name: string, date: string, count: number) {
  const C = { bg: '#fbfaf6', ink: '#1d2a27', dim: '#55645f', accent: '#0f5c55' };
  const t = (x: number, y: number, size: number, text: string, o: { mono?: boolean; bold?: boolean; fill?: string; ls?: number } = {}) =>
    '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="' + (o.mono ? 'ui-monospace,Menlo,Consolas,monospace' : 'Georgia,serif') + '" font-size="' + size + '" font-weight="' + (o.bold ? 700 : 400) + '" fill="' + (o.fill || C.ink) + '"' + (o.ls ? ' letter-spacing="' + o.ls + '"' : '') + '>' + esc(text) + '</text>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Certificate: ' + esc(name || 'A learner') + ' completed ' + esc(track.title) + '">' +
    '<rect width="' + W + '" height="' + H + '" fill="' + C.bg + '"/><rect x="28" y="28" width="' + (W - 56) + '" height="' + (H - 56) + '" fill="none" stroke="' + C.accent + '" stroke-width="3"/><rect x="40" y="40" width="' + (W - 80) + '" height="' + (H - 80) + '" fill="none" stroke="' + C.accent + '" stroke-width="1"/>' +
    '<rect x="' + (W / 2 - 30) + '" y="86" width="60" height="60" rx="16" fill="' + C.accent + '"/>' + t(W / 2, 128, 30, 'g.', { mono: true, bold: true, fill: '#fbfaf6' }) +
    t(W / 2, 200, 18, 'CERTIFICATE OF COMPLETION', { mono: true, ls: 6, fill: C.dim }) +
    t(W / 2, 300, 58, name || 'Your name here', { bold: true }) +
    t(W / 2, 370, 24, 'completed every lesson in the', { fill: C.dim }) +
    t(W / 2, 430, 40, track.title + ' track', { bold: true, fill: C.accent }) +
    t(W / 2, 490, 22, count + ' lessons · finished ' + date, { fill: C.dim }) +
    t(W / 2, 600, 22, 'gothik · watch your Go run', { mono: true }) +
    t(W / 2, 680, 14, 'Self-issued by gothik on the learner\'s device. It records their own progress; it is not an accredited credential.', { fill: C.dim }) + '</svg>';
}

export function Certificate({ track }: { track: string }) {
  useProgress();
  const h = useHydrated(), name = useStored('gothik-name', '') || '';
  const row = stats(h).tracks.find((r) => r.t.id === track);
  if (!h) return <div className="page" />; // progress is only known in the browser
  if (!row || row.done < row.total) {
    return <div className="page empty"><h3>Not unlocked yet</h3><p>{D.track(track)?.title}: {row ? row.done : 0} of {row ? row.total : 0} lessons done.</p><Link className="btn primary" href={href.learn}>Back to Learn</Link></div>;
  }
  // only runs in the browser (after the hydration check above), never during prerender
  // eslint-disable-next-line react-hooks/purity
  const date = new Date(row.last || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const svg = certificateSVG(row.t, name.trim(), date, row.total), file = 'gothik-certificate-' + row.t.id;
  return (
    <div className="page cert-page">
      <div className="row no-print" style={{ flexWrap: 'wrap', marginBottom: 16 }}>
        <Link className="btn sm ghost" href={href.learn}>← Learn</Link>
        <span className="spacer" />
        <label className="row" style={{ gap: 6 }}>Name <input className="input" maxLength={60} value={name} onChange={(e) => store.set('gothik-name', e.target.value)} aria-label="Name on the certificate" /></label>
        <button className="btn sm" type="button" onClick={() => print()}>Print</button>
        <button className="btn sm" type="button" onClick={() => download(new Blob([svg], { type: 'image/svg+xml' }), file + '.svg')}>Download SVG</button>
        <button className="btn sm primary" type="button" onClick={async () => { const b = await svgToPNG(svg, W, H); if (b) download(b, file + '.png'); }}>Download PNG</button>
      </div>
      <div className="cert-fig" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
