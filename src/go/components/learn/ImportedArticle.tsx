// Articles for lessons imported from a pack: they exist only in this browser, so they render here.
import { Link } from '../../lib/router';
import { useCatalog } from '../../lib/packs';
import { useHydrated } from '../../lib/store';
import { href } from '../../lib/routes';
import { Article } from './Article';

export function ImportedArticle({ id }: { id: string }) {
  const { lessons, programs } = useCatalog(), i = lessons.findIndex((l) => l.id === id);
  if (!useHydrated()) return null;
  if (i < 0) return <div className="page empty"><h3>No such article.</h3><p>It may belong to a lesson pack that is not installed in this browser.</p><Link className="btn primary" href={href.articles}>All articles</Link></div>;
  const l = lessons[i];
  return <Article lesson={l} prog={programs.find((p) => p.id === l.examples?.[0])} prev={lessons[i - 1]} next={lessons[i + 1]} />;
}
