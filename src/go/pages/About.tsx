import { Link } from '../lib/router';
import { View } from '../components/View';
import { Bookmarklet } from '../components/reference/Bookmarklet';
import { D } from '../lib/data';
import { href } from '../lib/routes';

export default function About() {
  const reg = D.registry, m = D.meta;
  const topics: Record<string, number> = {};
  for (const d of D.corpus) topics[d.topic] = (topics[d.topic] || 0) + 1;
  const spec: [string, string | number][] = [['version', m.version || ''], ['semantics', String(reg.semantics || m.semanticsLabel || '')], ['lessons', D.lessons.length], ['programs', D.programs.length], ['documents', D.corpus.length], ['glossary', D.glossary.length]];
  return (
    <View>
      <div className="page article" style={{ maxWidth: 860 }}>
        <p className="mono faint">{'// about'}</p><h1 className="mono">gothik, honestly.</h1>
        <p className="lead">gothik teaches Go by running it. The interpreter runs in your browser, so your code and progress stay on your device.</p>
        <div className="spec-grid mono">{spec.map(([k, v]) => <div key={k}><span className="faint">{k}</span><b>{v}</b></div>)}</div>
        <h2>What the interpreter supports</h2>
        <table className="feat"><thead><tr><th>Feature</th><th>Status</th><th>Notes</th></tr></thead><tbody>
          {reg.features.map((f) => <tr key={f.id}><td>{f.title}</td><td><span className={'chip ' + (f.status === 'supported' ? 'accent' : 'signal')}>{f.status}</span></td><td className="dim">{f.description}</td></tr>)}
        </tbody></table>
        <h2>The model, and its limits</h2>
        <ul>
          <li>Execution is deterministic: goroutines are scheduled by a seeded, single-threaded model, so a replay is always identical.</li>
          <li>Addresses and byte sizes are synthetic model values on a 64-bit layout. Escape decisions use a small set of labelled rules, not the compiler&apos;s real output.</li>
          <li>Garbage collection is a tri-colour teaching model; it runs on <code>runtime.GC()</code> and when the model heap passes its goal.</li>
          <li>Anything outside the subset fails with a clear message rather than guessing.</li>
        </ul>
        <h2>Sources</h2>
        <p>{Object.entries(topics).map(([k, n], i) => <span key={k}>{i > 0 && ' '}<span className="chip">{k} · {n}</span></span>)}</p>
        <p className="dim">Browse them on the <Link href={href.reading}>reading shelf</Link>. Each document links to its original.</p>
        <h2>Open any Go snippet in gothik</h2>
        <p>Drag this button to your bookmarks bar. On Go by Example, the Go Tour, the Go Playground or pkg.go.dev, click it to open the program on that page here. Select some code first to send just that.</p>
        <Bookmarklet />
      </div>
    </View>
  );
}
