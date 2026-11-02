import { Link } from '../lib/router';
import { Icon } from '../components/Icon';
import { View } from '../components/View';
import { Box } from '../components/home/Box';
import { FootActions } from '../components/home/FootActions';
import { DoneFact, HeroCta } from '../components/home/HeroCta';
import { HeroDemo } from '../components/home/HeroDemo';
import { LessonPreview } from '../components/home/LessonPreview';
import { Scrolly } from '../components/home/Scrolly';
import { Subway } from '../components/learn/Subway';
import { D } from '../lib/data';
import { href } from '../lib/routes';

const FAQ = [
  ['Who is it for?', 'People who can write a little Go, or are learning it, and want to know what their code does to memory and goroutines. It also works as a whiteboard for teaching: paste a snippet and step through it with a class.'],
  ['Do I need Go installed?', 'No. gothik has its own Go interpreter that runs in your browser. Open a lesson and press play; there is nothing to install.'],
  ['Is this real Go?', 'It runs a large subset of Go 1.26 — functions, methods, structs, slices, maps, interfaces, generics, closures, goroutines, channels, select, sync and context — with a static checker that reports errors the way go vet and the compiler word them. Programs that need files, the network or cgo will not run.'],
  ['How accurate are the pictures?', 'Relationships are faithful: what points to what, which goroutine waits on which channel, when a slice gets a new array. Addresses, byte sizes, escape decisions and GC timing are a labelled teaching model, and the About page lists exactly what is modelled.'],
  ['Where is my progress saved?', 'In this browser only. Nothing is sent anywhere. You can export it to a file from Settings and import it on another machine.'],
  ['Can my team use it?', 'Yes. Share a link to any lesson, gotcha or program: the code travels in the link itself, so everyone sees the same thing. Teachers can also hand out lesson packs as JSON files.'],
];
const LEGEND = [['var(--c-stack)', 'stack frame'], ['var(--c-heap)', 'heap object'], ['var(--c-chan)', 'channel'], ['var(--c-gor)', 'goroutine'], ['var(--signal)', 'escaped / waiting'], ['var(--text-faint)', 'garbage']];

export default function Home() {
  const total = D.lessons.length, version = D.meta.version || '3';
  const firstOf = (t: string) => D.lessons.find((l) => l.track === t)?.id || 'A01';
  const semantics = String(D.registry.semantics || '').split(' (')[0] || 'Go subset';
  return (
    <View>
      <div className="home">
        <section className="hero">
          <div className="hero-copy stagger">
            <p className="hero-kicker mono"><span className="led ok" /> runs in your browser · go 1.26 subset · v{version}</p>
            <h1 className="hero-h mono">watch your go<br />run.</h1>
            <p className="hero-sub">gothik replays any Go program as a moving picture of memory. Frames open and close, values escape to the heap, goroutines pass data through channels, and every step gets a one-line explanation in plain English.</p>
            <HeroCta />
            <p className="hero-facts mono"><span>{total} lessons</span><span>{D.programs.length} programs that really run</span><span>runs in your browser, no install</span><DoneFact /></p>
          </div>
          <div className="hero-demo">
            <HeroDemo />
            <ul className="legend mono" aria-label="Colour key">
              {LEGEND.map(([c, label]) => <li key={label} style={{ ['--c' as string]: c }} className={label === 'garbage' ? 'dashed' : undefined}>{label}</li>)}
            </ul>
          </div>
        </section>

        <Scrolly />
        <Box />

        <section className="lessonp" aria-labelledby="lp-h">
          <header className="sec-head"><p className="mono faint">{"// a lesson, up close"}</p><h2 className="mono" id="lp-h">read, watch, try, check.</h2><p className="dim">Every lesson has the same four steps. This one is real: try the question at the end.</p></header>
          <LessonPreview id="A11" />
        </section>

        <section className="home-map">
          <div className="home-map-copy"><p className="mono faint">{"// the curriculum"}</p><h2 className="mono">{total} lessons on six lines.</h2><p className="dim">Start with variables and pointers, ride through the heap and the garbage collector, then into goroutines, channels and profiling. Every check is graded by running real code.</p><Link className="btn" href={href.learn}>See the whole map <Icon name="arrow" /></Link></div>
          <div className="home-map-fig"><Subway compact /></div>
        </section>

        <section className="limits"><p className="mono faint">{"// what it is not"}</p><div className="limits-grid">
          <div><h3 className="mono">not the go compiler</h3><p>A careful interpreter for a large subset of Go 1.26 that runs in your browser. Programs that need the network, files or cgo will not run.</p></div>
          <div><h3 className="mono">not your real memory</h3><p>Addresses, sizes and GC timing are a labelled teaching model. The relationships are faithful; the numbers are illustrative.</p></div>
          <div><h3 className="mono">not a black box</h3><p>Claims cite their sources: the Go spec, runtime source and the Go blog. {D.corpus.length} documents are bundled for offline reading.</p></div>
        </div></section>

        <section className="faq" aria-labelledby="faq-h">
          <header className="sec-head"><p className="mono faint">{"// questions"}</p><h2 className="mono" id="faq-h">the short answers.</h2></header>
          <div className="faq-list">{FAQ.map(([q, a]) => <details key={q}><summary>{q}<span className="faq-x" aria-hidden="true" /></summary><p>{a}</p></details>)}</div>
        </section>

        <section className="final-cta">
          <p className="mono faint">{"// $ gothik"}</p><h2 className="mono">open a lesson.<br />press space.</h2>
          <HeroCta final />
          <p className="faint mono" style={{ fontSize: 12 }}>or press <kbd>⌘K</kbd> to search everything</p>
        </section>

        <footer className="site-foot">
          <div className="foot-cols">
            <div className="foot-brand"><Link className="brand" href={href.home}><span className="mark" aria-hidden="true">g.</span><span className="word">gothik</span></Link><p className="dim">Go, made visible. One offline file.</p></div>
            <nav aria-label="Tracks"><h3 className="mono">learn</h3>{D.tracks.map((t) => <Link key={t.id} href={href.lesson(firstOf(t.id))}>{t.title}</Link>)}</nav>
            <nav aria-label="Tools"><h3 className="mono">tools</h3><Link href={href.playground}>Playground</Link><Link href={href.articles}>Articles</Link><Link href={href.reading}>Reading shelf</Link><Link href={href.glossary}>Glossary</Link><Link href={href.learn}>Learning map</Link></nav>
            <nav aria-label="gothik"><h3 className="mono">gothik</h3><Link href={href.about}>About &amp; sources</Link><FootActions /></nav>
          </div>
          <div className="titleblock mono"><span>gothik</span><span>v{version}</span><span>{semantics}</span><span>works offline · nothing leaves your browser</span></div>
        </footer>
      </div>
    </View>
  );
}
