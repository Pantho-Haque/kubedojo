// Gotchas and interview questions share one layout: a card grid, and a detail page with the
// program on a mini stage, the explanation, the lesson link and previous/next.
import { Link } from '../../lib/router';
import { View } from '../View';
import { MiniPlayer } from '../MiniPlayer';
import { D, TRACK_HUE } from '../../lib/data';
import { href } from '../../lib/routes';
import { SectionTabs } from './SectionTabs';
import { LabLink } from './LabLink';

const hue = (lesson: string) => TRACK_HUE[D.lesson(lesson)?.track || ''] || 'var(--accent)';

export function PracticeGrid({ tab, title, intro, cards }: {
  tab: 'gotchas' | 'interview'; title: string; intro: string;
  cards: { href: string; lesson: string; meta: string; title: string; text: string }[];
}) {
  return (
    <View>
      <div className="page">
        <header className="page-head"><p className="mono faint">{'// ' + tab}</p><h1 className="mono">{title}</h1><p>{intro}</p></header>
        <SectionTabs section="practice" active={tab} />
        <div className="acad-grid stagger">
          {cards.map((c) => (
            <Link key={c.href} className="acad-card" href={c.href} style={{ ['--hue' as string]: hue(c.lesson) }}>
              <span className="mono faint">{c.meta}</span><strong>{c.title}</strong><span className="dim">{c.text}</span>
            </Link>
          ))}
        </div>
      </div>
    </View>
  );
}

type Item = { id: string; title: string; lesson: string; source: string; expected: string; panics?: boolean };
export function PracticeDetail({ crumb, crumbHref, item, lead, intro, summary, answer, prints, crash, prev, next, seen }: {
  crumb: string; crumbHref: string; item: Item; lead: string; intro: string; summary: string; answer: string; prints: string; crash: string;
  prev?: { href: string; title: string }; next?: { href: string; title: string }; seen?: boolean;
}) {
  const l = D.lesson(item.lesson);
  return (
    <View>
      <article className="article">
        <nav className="crumbs mono"><Link href={crumbHref}>{crumb}</Link> / {item.id.replace(/^iq-/, '')}</nav>
        <h1 className="mono">{item.title.toLowerCase()}</h1>
        <p className="lead gotcha-claim">{lead}</p>
        <p>{intro}</p>
        <figure className="art-fig"><MiniPlayer key={item.id} source={item.source} autoplay={false} output /></figure>
        <details className="why">
          <summary>{summary}</summary>
          <p>{answer}</p>
          <p>{prints}</p>
          <pre className="code-block">{item.expected || '(nothing)'}</pre>
          {item.panics && <p>{crash}</p>}
        </details>
        <div className="row" style={{ marginTop: 20, flexWrap: 'wrap' }}>
          <LabLink source={item.source} seen={seen ? item.id : undefined} />
          {l && <Link className="btn sm ghost" href={href.lesson(l.id)}>Lesson {l.id}: {l.title}</Link>}
        </div>
        <nav className="art-nav">
          {prev ? <Link className="card" href={prev.href}><span className="faint mono">← previous</span><strong>{prev.title}</strong></Link> : <span />}
          {next && <Link className="card" href={next.href} style={{ textAlign: 'right' }}><span className="faint mono">next →</span><strong>{next.title}</strong></Link>}
        </nav>
      </article>
    </View>
  );
}
