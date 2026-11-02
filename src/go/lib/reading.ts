// Offline copies of the documents the lessons cite. scripts/build-go.mjs splits the 3 MB shelf into one file per
// document and a search index; each is its own lazy chunk, so a page downloads only what it shows.
import type { Doc } from './data';

type Block = { html: string; title?: string; level?: number };
type Reading = { html: string; total: number; more: boolean };
const DOCS = import.meta.glob<{ default: Block[] }>('../generated/reading/*.json');

/**
 * The HTML to show for one document. The Go spec is cited by section, so by default that
 * section is shown (heading to the next heading of the same level); other long documents show
 * their first 10 blocks. `more` is true when there is more to show with full=true.
 */
export async function readingOf(doc: Doc, full = false): Promise<Reading | null> {
  const load = DOCS[`../generated/reading/${doc.sha256}.json`];
  if (!load) return null;
  const all = (await load()).default;
  const head = (b: Block) => /^<h(\d)/.exec(b.html)?.[1];
  const at = doc.section && !full ? all.findIndex((b) => head(b) && b.html.replace(/<[^>]+>/g, '').trim() === doc.section) : -1;
  let blocks = full ? all : all.slice(0, 10);
  if (at >= 0) { const end = all.findIndex((b, i) => i > at && head(b) && head(b)! <= head(all[at])!); blocks = all.slice(at, end < 0 ? undefined : end); }
  return { html: blocks.map((b) => b.html).join(''), total: all.length, more: !full && all.length > blocks.length };
}

/** Full-text search over the shelf: matching docs with a snippet around the first hit. The index loads on first use. */
export async function searchShelf(q: string, corpus: Doc[]): Promise<{ id: string; snip: string }[]> {
  q = q.trim().toLowerCase();
  if (q.length < 3) return [];
  const index = (await import('../generated/reading-search.json')).default as Record<string, string>;
  const out = [];
  for (const d of corpus) { const text = index[d.sha256]; const at = text ? text.indexOf(q) : -1; if (at >= 0) out.push({ id: d.id, snip: '…' + text.slice(Math.max(0, at - 60), at + 90).replace(/\s+/g, ' ') + '…' }); }
  return out;
}
