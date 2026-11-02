// URL map. The prototype used hash routes (#lesson=A07); the app uses real paths.
// Share links keep the program in the URL fragment (#src=…), so code is never sent to a server.
import { ACADEMY_URL, ALIAS, D, LAB_TABS } from './data';

/** gothik's sub-path inside Tinkerlab. Every path below carries it, so links, the router and copied URLs all agree. */
export const BASE = '/go';

export const href = {
  home: BASE,
  learn: BASE + '/learn',
  // built-in lessons live in the Academy; lessons from an imported pack exist only in this browser, so they open here
  lesson: (id: string) => ACADEMY_URL[id] || `${BASE}/learn/${id}`,
  playground: BASE + '/playground',
  program: (id: string) => `${BASE}/playground?program=${encodeURIComponent(id)}`,
  shared: (src: string, at = 0) => `${BASE}/playground#src=${src}${at ? '&at=' + at : ''}`,
  articles: BASE + '/articles',
  article: (id: string, reading?: string) => `${BASE}/articles/${id}${reading ? '?reading=' + reading : ''}`,
  reading: BASE + '/reading',
  doc: (id: string, full = false) => `${BASE}/reading/${id}${full ? '/full' : ''}`,
  glossary: BASE + '/glossary',
  gotchas: BASE + '/gotchas',
  gotcha: (id: string) => `${BASE}/gotchas/${id}`,
  interview: BASE + '/interview',
  question: (id: string) => `${BASE}/interview/${id}`,
  puzzle: BASE + '/puzzle',
  internals: (tab = 'strings') => `${BASE}/internals/${tab}`,
  compare: (preset?: string) => (preset ? `${BASE}/compare?preset=${preset}` : BASE + '/compare'),
  certificate: (track: string) => `${BASE}/certificate/${track}`,
  about: BASE + '/about',
  embed: (src: string, at = 0) => `${BASE}/embed#src=${src}${at ? '&at=' + at : ''}`,
};

/** Which top-bar section a path belongs to. */
export function section(path: string): 'learn' | 'work' | 'practice' | 'reference' | null {
  if (/^\/(learn|articles|certificate)(\/|$)/.test(path)) return 'learn';
  if (/^\/(playground|compare)(\/|$)/.test(path)) return 'work';
  if (/^\/(gotchas|interview|puzzle)(\/|$)/.test(path)) return 'practice';
  if (/^\/(glossary|reading|internals)(\/|$)/.test(path)) return 'reference';
  return null;
}

/** Translate a prototype hash link (#lesson=A07, #gotcha=nil-error, #playground&src=…) to an app URL. */
export function fromLegacyHash(hash: string): string | null {
  const raw = hash.replace(/^#/, '');
  if (!raw || raw.length > 100000) return null;
  const [head, ...rest] = raw.split('&');
  const eq = head.indexOf('=');
  const name = eq >= 0 ? head.slice(0, eq) : head;
  const params = new URLSearchParams(rest.join('&'));
  let id = eq >= 0 ? head.slice(eq + 1) : '';
  try { id = decodeURIComponent(id); } catch { return null; }
  const lessonId = ALIAS[id] || id, at = Number(params.get('at')) || 0;
  switch (name) {
    case 'home': return href.home;
    case 'learn': return href.learn;
    case 'academy': return href.articles;
    case 'reading': case 'library': return href.reading;
    case 'glossary': return href.glossary;
    case 'about': case 'brief': case 'styleguide': return href.about;
    case 'playground': return params.get('src') ? href.shared(params.get('src')!, at) : href.playground;
    case 'embed': return params.get('src') ? href.embed(params.get('src')!, at) : null;
    case 'gotchas': return href.gotchas;
    case 'gotcha': return D.gotcha(id) ? href.gotcha(id) : null;
    case 'interview': return id ? href.question(id) : href.interview;
    case 'puzzle': return href.puzzle;
    case 'internals': return (LAB_TABS as readonly string[]).includes(id || 'strings') ? href.internals(id || 'strings') : null;
    case 'compare': { const p = params.get('preset') || id; const a = params.get('a'), b = params.get('b'); return a || b ? `${BASE}/compare#a=${a || ''}&b=${b || ''}` : href.compare(p || undefined); }
    case 'certificate': return href.certificate(id);
    case 'lesson': return D.lesson(lessonId) ? href.lesson(lessonId) : null;
    case 'play': return D.program(id) ? href.program(id) : D.lesson(lessonId) ? href.program(D.lesson(lessonId)!.examples?.[0] || '') : href.playground;
    case 'article': return D.lesson(lessonId) ? href.article(lessonId, params.get('reading') || undefined) : null;
    case 'source': return D.doc(id) ? href.doc(id, params.get('full') === '1') : null;
    default: return null;
  }
}
