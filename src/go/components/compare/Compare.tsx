// Two programs, one timeline: a preset (?preset=id) or your own pair (#a=…&b=… share link),
// two editable mini players on one scrub slider, and a summary of what differs.
import { useRouter, useSearchParams } from '../../lib/router';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { MiniPlayer, type MiniApi } from '../MiniPlayer';
import { View } from '../View';
import NotFound from '../../pages/NotFound';
import { D } from '../../lib/data';
import { BASE, href } from '../../lib/routes';
import { loadStage, type State } from '../../lib/run';
import { copyText, hashParams, pack, unpack } from '../../lib/share';
import { toast } from '../../lib/shell';

type Metrics = { steps: number; objects: number; moved: number; goroutines: number; out: string; crashed: boolean };
type Stage = Awaited<ReturnType<typeof loadStage>>['GothikStage'];

// what the stage draws: distinct heap objects, plus the model's "moved to heap" decisions
function metrics(t: State[], S: Stage): Metrics {
  const ids = new Set<string>();
  for (const st of t) for (const o of st.objects || []) { const ln = typeof o.site === 'object' ? o.site?.line : o.site; if (ln > 0) ids.add(ln + ':' + o.id); }
  const last = t.at(-1);
  return { steps: t.length, objects: ids.size, moved: (last.escape || []).length, goroutines: new Set(t.flatMap((st) => S.goroutinesOf(st).map((g: { id: unknown }) => g.id))).size, out: last.output ?? '', crashed: !!last.exitStatus };
}

export function Compare() {
  const router = useRouter(), presetId = useSearchParams().get('preset');
  const list = D.comparisons, preset = presetId ? list.find((x) => x.id === presetId) : list[0];
  const [custom, setCustom] = useState<{ a: string; b: string } | null>(null);
  const [table, setTable] = useState<{ A?: Metrics; B?: Metrics }>({});
  const sides = useRef<{ A?: MiniApi; B?: MiniApi }>({});

  // a share link carries both programs in the fragment
  useEffect(() => {
    const read = async () => {
      const h = hashParams(), a = h.get('a'), b = h.get('b');
      if (!a || !b) return;
      try { const [x, y] = await Promise.all([unpack(a), unpack(b)]); setTable({}); setCustom({ a: x, b: y }); }
      catch { toast('This compare link is damaged; showing an example instead.', 4000); }
    };
    read();
    addEventListener('hashchange', read);
    return () => removeEventListener('hashchange', read);
  }, []);

  if (!preset) return <NotFound />;
  const src = custom ? { A: custom.a, B: custom.b } : { A: preset.A, B: preset.B };
  const runKey = custom ? 'custom:' + custom.a + '\0' + custom.b : preset.id;

  const update = async (k: 'A' | 'B', api: MiniApi) => {
    const t = api.player.trace; if (!t) return;
    const { GothikStage } = await loadStage();
    setTable((x) => ({ ...x, [k]: metrics(t, GothikStage) }));
  };
  const each = (f: (m: MiniApi) => void) => { for (const m of [sides.current.A, sides.current.B]) if (m) f(m); };
  const playBoth = () => each((m) => { if (m.player.trace) { m.player.show(0, false); m.player.play(); } else m.run(m.editor?.value ?? '', true); });
  const scrub = (f: number) => each((m) => { if (m.player.trace) { m.player.pause(); m.player.show(Math.round(f * (m.player.len - 1)), false); } });
  const copyLink = async () => {
    const [a, b] = await Promise.all([pack(sides.current.A?.editor?.value ?? src.A), pack(sides.current.B?.editor?.value ?? src.B)]);
    copyText(location.origin + BASE + '/compare#a=' + a + '&b=' + b);
  };
  const choose = (id: string) => { setCustom(null); setTable({}); router.push(href.compare(id)); };

  const { A: a, B: b } = table;
  const row = (label: string, x: string | number, y: string | number, fmt = (z: string | number) => String(z)) => (
    <tr key={label}><th scope="row">{label}</th><td className="mono">{fmt(x)}</td><td className="mono">{fmt(y)}</td><td>{x === y ? <span className="faint">same</span> : <b style={{ color: 'var(--signal)' }}>differs</b>}</td></tr>
  );
  return (
    <View>
      <div className="page compare-page">
        <header className="page-head">
          <p className="mono faint">{'// compare'}</p><h1 className="mono">two programs, one timeline.</h1>
          <p>Run two versions side by side and see what changes: steps, objects on the heap, variables that escape, and the output. Edit either side and both summaries update.</p>
          <div className="path-chips" role="group" aria-label="Examples">
            {list.map((x) => <button key={x.id} className="chip-btn" type="button" aria-pressed={!custom && x.id === preset.id} onClick={() => choose(x.id)}>{x.title}</button>)}
          </div>
        </header>
        {!custom && <p className="dim" id="cmp-note" style={{ margin: '-12px 0 16px' }}>{preset.note}</p>}
        <div className="cmp-bar row">
          <button className="btn sm primary" type="button" id="cmp-play" onClick={playBoth}><Icon name="play" />Play both</button>
          <input type="range" id="cmp-scrub" min={0} max={1000} defaultValue={0} key={runKey} aria-label="Both timelines" style={{ flex: 1, accentColor: 'var(--accent)' }} onChange={(e) => scrub(Number(e.target.value) / 1000)} />
          <button className="btn sm" type="button" id="cmp-link" onClick={copyLink}>Copy link</button>
        </div>
        <div className="compare-grid">
          {(['A', 'B'] as const).map((k) => (
            <section key={k} aria-label={'Program ' + k}>
              <h2 className="mono cmp-h"><span className="cmp-tag">{k}</span>{custom ? (k === 'A' ? 'your first program' : 'your second program') : k === 'A' ? preset.a : preset.b}</h2>
              <MiniPlayer key={runKey + k} className="cmp-box" source={src[k]} autoplay={false}
                onReady={(api) => { sides.current[k] = api; }}
                onShow={(_s, i, api) => { if (i === 0 || i === api.player.len - 1) update(k, api); }} />
            </section>
          ))}
        </div>
        <div id="cmp-table" aria-live="polite">
          {a && b && <table className="feat cmp-table"><thead><tr><th>Simplified model</th><th>A</th><th>B</th><th></th></tr></thead><tbody>
            {row('Steps', a.steps, b.steps)}{row('Objects on the heap', a.objects, b.objects)}{row('Variables moved to the heap', a.moved, b.moved)}{row('Goroutines', a.goroutines, b.goroutines)}
            {row('Output', a.out + (a.crashed ? ' (crashed)' : ''), b.out + (b.crashed ? ' (crashed)' : ''), (z) => String(z).trim() || '(nothing)')}
          </tbody></table>}
        </div>
      </div>
    </View>
  );
}
