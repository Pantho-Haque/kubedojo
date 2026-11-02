// Built-in content. Safe on the server and the client. The 3 MB reading shelf is NOT
// imported here; lib/reading.ts fetches one document (or the search index) when it is needed.
// The lessons and their tracks are the Academy's Go courses (content/academy/go-*), built by scripts/build-academy.mjs.
import curriculum from '../../academy/generated/go-curriculum.json';
import academy from '../../academy/generated/index.json';
import programLibrary from '../data/program-library.json';
import paths from '../data/path.json';
import glossary from '../data/glossary.json';
import buildMeta from '../data/build-meta.json';
import registry from '../data/feature-registry.json';
import catalog from '../data/catalog.json';
import corpus from '../data/corpus-index.json';
import gotchas from '../data/gotcha.json';
import comparisons from '../data/compare.json';
import interview from '../data/interview.json';
import i18n from '../data/i18n.json';

export type Step = { id: string; type: 'predict' | 'try' | 'explain' | 'simulate' | string; text: string; example?: string; widget?: string };
export type Quiz = { id: string; type: 'predict-output' | 'multiple-choice' | 'fill-blank' | string; question: string; example?: string; choices?: string[]; answer?: string; explanation?: string; answerFromEngine?: boolean };
export type Pitfall = { id?: string; title?: string; claim: string; explanation: string; example?: string };
export type Capstone = { starter: string; solution: string; goal: { stdout: string; exitStatus: number; maxModelAllocations?: number; noRaces?: boolean }; hints: string[] };
export type Lesson = {
  id: string; title: string; track: string; level: string; tier?: string; prereqs?: string[]; hook: string; goals?: string[];
  steps: Step[]; examples?: string[]; pitfalls?: Pitfall[]; quiz: Quiz[]; sources?: string[]; next?: string[];
  claims?: { text: string; sources?: string[]; model?: boolean }[]; estimatedMinutes?: number; capstone?: Capstone;
  try?: { task: string; hint?: string; expect: string; solution?: string };
};
export type Program = { id: string; lesson: string; title: string; goal?: string; watch?: string; source: string; expected?: { stdout?: string; exitStatus?: number; model?: boolean; [k: string]: unknown }; status?: string };
export type Track = { id: string; title: string };
export type LearnPath = { id: string; title: string; about?: string; lessons: string[] };
export type Term = { term: string; beginner?: string; [k: string]: unknown };
export type Doc = { id: string; topic: string; subtag: string; title: string; url: string; sha256: string; section?: string; licenceNote?: string; [k: string]: unknown };
export type Gotcha = { id: string; title: string; lesson: string; claim: string; why: string; source: string; expected: string; panics?: boolean; [k: string]: unknown };
export type Comparison = { id: string; title: string; a: string; b: string; note: string; A: string; B: string };
export type InterviewQ = { id: string; title: string; question: string; answer: string; watch: string; lesson: string; source: string; expected: string; [k: string]: unknown };

// one track per Academy Go course (track A = Go foundations, …), in course order
const tracks: Track[] = academy.courses.filter((c) => c.engine === 'go').map((c) => ({ id: String(c.track), title: c.title }));
/** Each built-in lesson's page in the Academy: /academy/<course>/<lesson>. */
export const ACADEMY_URL: Record<string, string> = Object.fromEntries(academy.courses.filter((c) => c.engine === 'go').flatMap((c) => c.lessons.map((l) => [l.id, `/academy/${c.slug}/${l.slug}`])));

export const D = {
  lessons: curriculum as Lesson[],
  programs: programLibrary as Program[],
  tracks,
  paths: paths as LearnPath[],
  glossary: glossary as Term[],
  meta: buildMeta as { version: string; buildDate: string; semanticsLabel: string; [k: string]: string },
  registry: registry as { features: { id: string; status: string; title: string; description: string; lessons?: string[] }[]; [k: string]: unknown },
  catalog: catalog as Record<string, unknown>,
  corpus: corpus as Doc[],
  gotchas: gotchas as Gotcha[],
  comparisons: comparisons as Comparison[],
  interview: interview as InterviewQ[],
  i18n: i18n as Record<string, Record<string, string>>,
  lesson: (id: string) => (curriculum as Lesson[]).find((l) => l.id === id),
  program: (id?: string | null) => (programLibrary as Program[]).find((p) => p.id === id),
  track: (id: string) => (tracks as Track[]).find((t) => t.id === id),
  doc: (id: string) => (corpus as Doc[]).find((d) => d.id === id),
  gotcha: (id: string) => (gotchas as Gotcha[]).find((g) => g.id === id),
  lessonIndex: (id: string) => (curriculum as Lesson[]).findIndex((l) => l.id === id),
};

export const TRACK_HUE: Record<string, string> = { A: 'var(--c-stack)', B: 'var(--c-heap)', C: 'var(--c-gor)', D: 'var(--c-chan)', E: 'var(--c-gc)', F: 'var(--signal)', X: 'var(--text-dim)' };

// legacy lesson ids from v1 links (e.g. #lesson=maps → A12)
export const ALIAS: Record<string, string> = { variables: 'A02', pointers: 'A07', slices: 'A10', append: 'A11', constants: 'A04', strings: 'A09', control: 'A05', errors: 'A18', closures: 'A15', interfaces: 'A16', generics: 'A20', channels: 'D01', stack: 'B01', escape: 'B02', allocation: 'B03', gc: 'B04', maps: 'A12', profiling: 'E02', releases: 'E06', patterns: 'D05', sync: 'D03', context: 'D06', ordering: 'D04', goroutines: 'C01', creation: 'C02', network: 'C06', preemption: 'C05', tracing: 'E03', tools: 'E01' };

/** The internals labs and their tab labels. */
export const INTERNALS_TABS: Record<string, string> = { strings: 'Strings & UTF-8', iface: 'Interfaces', maps: 'Maps', stack: 'Stack growth', sched: 'Scheduler', trace: 'Real trace' };
export const LAB_TABS = ['strings', 'iface', 'maps', 'stack', 'sched', 'trace'] as const;

export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
/** Lesson text: `code` spans only. Returns HTML for dangerouslySetInnerHTML. */
export const md = (s: unknown) => esc(s).replace(/`([^`\n]+)`/g, '<code>$1</code>');
export const clip = (s: unknown, n: number) => { const t = String(s ?? ''); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
