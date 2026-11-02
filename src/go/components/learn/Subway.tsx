// The curriculum as a subway map: one line per track, one station per lesson; finished stations are filled.
import { Link } from '../../lib/router';
import { TRACK_HUE } from '../../lib/data';
import { useCatalog } from '../../lib/packs';
import { P, useProgress } from '../../lib/progress';
import { useHydrated } from '../../lib/store';
import { href } from '../../lib/routes';

const SHORT: Record<string, string> = { A: 'foundations', B: 'memory', C: 'scheduler', D: 'concurrency', E: 'observe', F: 'capstones' };
const css = (o: Record<string, string | number>) => o as React.CSSProperties;

export function Subway({ compact = false, highlight = null }: { compact?: boolean; highlight?: string[] | null }) {
  useProgress();
  const { lessons, tracks } = useCatalog(), h = useHydrated();
  const done = (id: string) => h && P.done(id), cur = h ? P.last : null, hl = highlight ? new Set(highlight) : null;
  const gapX = compact ? 40 : 48, gapY = compact ? 46 : 62, x0 = compact ? 130 : 132, y0 = 30;
  const maxN = Math.max(...tracks.map((t) => lessons.filter((l) => l.track === t.id).length));
  const W = x0 + (maxN - 1) * gapX + 40, H = y0 + (tracks.length - 1) * gapY + 34;
  return (
    <svg className={'subway' + (compact ? ' compact' : '')} viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="group" aria-label="Curriculum map">
      {tracks.map((t, ti) => {
        const ls = lessons.filter((l) => l.track === t.id), y = y0 + ti * gapY, hue = TRACK_HUE[t.id], lastX = x0 + (ls.length - 1) * gapX;
        return (
          <g key={t.id}>
            <text x={0} y={y} className="sw-track" fill={hue}>{t.id + ' · ' + (SHORT[t.id] || t.title)}</text>
            <path className="sw-line" d={`M${x0 - 18} ${y} H${lastX}`} stroke={hue} style={css({ '--len': lastX - x0 + 18, animationDelay: ti * 90 + 'ms' })} />
            {ls.map((l, i) => i > 0 && done(l.id) && done(ls[i - 1].id) && <path key={'d' + l.id} className="sw-done" d={`M${x0 + (i - 1) * gapX} ${y} H${x0 + i * gapX}`} stroke={hue} />)}
            {ls.map((l, i) => {
              const x = x0 + i * gapX, d = done(l.id);
              return (
                <Link key={l.id} href={href.lesson(l.id)} className={'sw-st' + (d ? ' done' : '') + (l.id === cur ? ' cur' : '') + (hl && !hl.has(l.id) ? ' dim' : '')} style={css({ '--hue': hue, animationDelay: ti * 90 + i * 22 + 'ms' })}>
                  <title>{l.id + ' · ' + l.title + (d ? ' (complete)' : '')}</title>
                  {l.id === cur && <circle className="sw-pulse" cx={x} cy={y} r={9} />}
                  <circle className="sw-dot" cx={x} cy={y} r={compact ? 6 : 7.5} />
                  {!compact && <text x={x} y={y + 22} className="sw-id" aria-hidden="true">{l.id.slice(1)}</text>}
                </Link>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
