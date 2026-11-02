// One lesson as an article. No hooks here, so the server renders it for built-in lessons and
// ImportedArticle renders the same markup on the client for lessons from a pack.
import { Link } from '../../lib/router';
import { Suspense } from 'react';
import { Icon } from '../Icon';
import { MiniPlayer } from '../MiniPlayer';
import { D, TRACK_HUE, clip, md, type Lesson, type Program } from '../../lib/data';
import { href } from '../../lib/routes';
import { ArticleQuiz, DoneChip, ReadingPanel } from './ArticleParts';

const html = (s: unknown) => ({ dangerouslySetInnerHTML: { __html: md(s) } });

export function Article({ lesson: l, prog, prev, next }: { lesson: Lesson; prog?: Program; prev?: Lesson; next?: Lesson }) {
  const explain = l.steps.find((s) => s.type === 'explain');
  const deeper = (l as Lesson & { deeper?: { source: string }[] }).deeper || [];
  const docChip = (s: string) => { const d = D.doc(s); return d && <Link key={s} className="chip" href={href.article(l.id, s)} title={d.title} scroll={false}>{clip(d.title.split(' — ')[0], 34)}</Link>; };
  return (
    <article className="article">
      <nav className="crumbs mono"><Link href={href.articles}>academy</Link> / <span style={{ color: TRACK_HUE[l.track] }}>{(D.track(l.track)?.title || (l.track === 'X' ? 'Imported lessons' : '')).toLowerCase()}</span> / {l.id.toLowerCase()}</nav>
      <h1 className="mono">{l.title.toLowerCase()}</h1>
      <p className="lead" {...html(l.hook)} />
      <div className="row" style={{ flexWrap: 'wrap', marginBottom: 24 }}>
        <span className={'badge ' + l.level.toLowerCase()}>{l.level}</span><span className="chip">{l.estimatedMinutes || 5} min</span>
        <DoneChip id={l.id} />
        <span className="spacer" /><Link className="btn sm primary" href={href.lesson(l.id)}>Open in the lab <Icon name="arrow" /></Link>
      </div>
      {prog && <figure className="art-fig">
        <MiniPlayer source={prog.source} autoplay={false} startAt="end" open={{ href: href.lesson(l.id), label: 'Full lab' }} />
        <figcaption className="dim">{prog.goal || ''}{prog.watch && <> <b>Watch for:</b> <span {...html(prog.watch)} /></>} Edit the code and it re-runs.</figcaption>
      </figure>}
      <h2>The idea</h2><p {...html(explain?.text || '')} />
      {!!l.goals?.length && <><h2>What you will be able to do</h2><ul>{l.goals.map((g, i) => <li key={i} {...html(g)} />)}</ul></>}
      {!!l.pitfalls?.length && <><h2>Looks right, but…</h2>{l.pitfalls.map((p, i) => <div key={i} className="callout"><strong>“<span {...html(p.claim)} />”</strong><p {...html(p.explanation)} /></div>)}</>}
      {!!l.claims?.length && <><h2>What the sources say</h2>{l.claims.map((c, i) => (
        <div key={i} className={'claim' + (c.model ? ' model' : '')}><p>{c.text}</p><div className="sources">{c.model && <span className="chip model">simplified model</span>}{(c.sources || []).map(docChip)}</div></div>
      ))}</>}
      <h2>Check yourself</h2><ArticleQuiz lesson={l} />
      <h2>Go deeper</h2>
      <ul className="deeper">{deeper.map((d) => { const doc = D.doc(d.source); return doc && <li key={doc.id}><Link href={href.article(l.id, doc.id)} scroll={false}>{doc.title}</Link> <span className="faint mono">{new URL(doc.url).hostname}</span></li>; })}</ul>
      <Suspense><ReadingPanel lessonId={l.id} /></Suspense>
      <nav className="art-nav">
        {prev ? <Link className="card" href={href.article(prev.id)}><span className="faint mono">← {prev.id}</span><strong>{prev.title}</strong></Link> : <span />}
        {next && <Link className="card" href={href.article(next.id)} style={{ textAlign: 'right' }}><span className="faint mono">{next.id} →</span><strong>{next.title}</strong></Link>}
      </nav>
    </article>
  );
}
