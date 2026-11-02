// The live parts of an article: the "complete" chip, the quiz that completes the lesson, and the reading panel.
import { Link, useSearchParams } from '../../lib/router';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { Quiz } from '../Quiz';
import { D, type Lesson } from '../../lib/data';
import { P, useProgress } from '../../lib/progress';
import { reduced } from '../../lib/settings';
import { toast } from '../../lib/shell';
import { useHydrated } from '../../lib/store';
import { href } from '../../lib/routes';
import { readingOf } from '../../lib/reading';

export function DoneChip({ id }: { id: string }) {
  useProgress();
  return useHydrated() && P.done(id) ? <span className="chip accent"><Icon name="check" /> complete</span> : null;
}

export function ArticleQuiz({ lesson }: { lesson: Lesson }) {
  return <Quiz lesson={lesson} onComplete={() => { if (!P.done(lesson.id)) { P.mark(lesson.id, 'completed'); toast('Lesson ' + lesson.id + ' complete.'); } }} />;
}

type Reading = { html: string | null; total: number; more: boolean };
/** ?reading=<docId>(&full=1): one cited document, loaded on demand and shown inline. */
export function ReadingPanel({ lessonId }: { lessonId: string }) {
  const sp = useSearchParams(), id = sp.get('reading'), full = sp.get('full') === '1', doc = id ? D.doc(id) : undefined;
  const [r, setR] = useState<{ key: string; data: Reading | null } | null>(null), panel = useRef<HTMLElement>(null);
  const key = doc ? doc.id + (full ? '/full' : '') : '';
  useEffect(() => {
    if (!key) return;
    let on = true;
    readingOf(doc!, full).catch(() => null).then((data: Reading | null) => { if (on) setR({ key, data }); });
    return () => { on = false; };
  }, [key, doc, full]);
  const loaded = r?.key === key;
  useEffect(() => { if (loaded) panel.current?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); }, [loaded, key]);
  if (!doc) return null;
  const data = loaded ? r!.data : null;
  return (
    <section className="reading-panel" id="reading-panel" ref={panel}>
      <div className="row"><span className="eyebrow">Reading inside gothik</span><span className="spacer" /><a className="btn sm ghost" href={doc.url} target="_blank" rel="noopener">Original ↗</a><Link className="btn sm ghost" href={href.article(lessonId)} scroll={false}>Close</Link></div>
      <h3>{doc.title}</h3>
      <div className="reading-body">
        {!loaded ? <p className="dim">Loading…</p>
          : !data?.html ? <p className="dim">This document is not bundled. <a href={doc.url} rel="noopener" target="_blank">Open the original ↗</a></p>
          : <>
            <div dangerouslySetInnerHTML={{ __html: data.html }} />
            {data.more && <p><Link className="btn sm" href={href.article(lessonId, doc.id) + '&full=1'} scroll={false}>Show the whole document ({data.total} sections)</Link></p>}
          </>}
      </div>
    </section>
  );
}
