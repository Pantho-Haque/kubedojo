// One document from the shelf. The Go spec is cited by section, so /reading/[id] shows that
// section and /reading/[id]/full the whole document. The text loads on demand (lib/reading.ts).
import { useEffect, useState } from 'react';
import { Link } from '../../lib/router';
import { View } from '../View';
import { D, type Doc } from '../../lib/data';
import { href } from '../../lib/routes';
import { readingOf } from '../../lib/reading';
import { FullRedirect } from './FullRedirect';

type Reading = Awaited<ReturnType<typeof readingOf>>;

export function DocPage({ doc, full }: { doc: Doc; full: boolean }) {
  const lesson = D.lessons.find((l) => (l.sources || []).includes(doc.id));
  const key = doc.id + (full ? '/full' : '');
  const [got, setGot] = useState<{ key: string; r: Reading } | null>(null);
  useEffect(() => {
    let on = true;
    readingOf(doc, !doc.section || full).catch(() => null).then((r) => { if (on) setGot({ key, r }); });
    return () => { on = false; };
  }, [doc, full, key]);
  const r = got?.key === key ? got.r : undefined;
  return (
    <View>
      {!full && doc.section && <FullRedirect to={href.doc(doc.id, true)} />}
      <article className="article">
        <nav className="crumbs mono"><Link href={href.reading}>reading</Link> / {doc.topic + '/' + doc.subtag}</nav>
        <h1 className="mono" style={{ fontSize: 24 }}>{doc.title}</h1>
        <div className="row" style={{ margin: '12px 0 24px', flexWrap: 'wrap' }}>
          <a className="btn sm" href={doc.url} target="_blank" rel="noopener">Original ↗</a>
          {lesson && <Link className="btn sm ghost" href={href.article(lesson.id)}>Related: {lesson.title}</Link>}
          <span className="faint" style={{ fontSize: 12 }}>{doc.licenceNote || ''}</span>
        </div>
        <div className="reading-body">
          {r === undefined ? <p className="dim">Loading…</p> : r ? <>
            <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: r.html }} />
            {r.more && <p><Link className="btn sm" href={href.doc(doc.id, true)}>Show the whole document ({r.total} sections)</Link></p>}
          </> : <p className="dim">This document is not bundled. <a href={doc.url} rel="noopener" target="_blank">Open the original ↗</a></p>}
        </div>
      </article>
    </View>
  );
}
