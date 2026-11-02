// Second-level tabs for the Practice and Reference sections of the top bar.
import { Link } from '../../lib/router';
import { href } from '../../lib/routes';

const SECTIONS = {
  practice: [['gotchas', href.gotchas, 'Gotchas'], ['interview', href.interview, 'Interview questions'], ['puzzle', href.puzzle, 'Daily puzzle']],
  reference: [['glossary', href.glossary, 'Glossary'], ['reading', href.reading, 'Reading'], ['internals', href.internals(), 'Internals labs']],
} as const;

export function SectionTabs({ section, active }: { section: keyof typeof SECTIONS; active: string }) {
  return (
    <nav className="seg lab-tabs section-tabs" aria-label={section === 'practice' ? 'Practice' : 'Reference'}>
      {SECTIONS[section].map(([k, to, label]) => <Link key={k} href={to} aria-current={k === active ? 'page' : undefined}>{label}</Link>)}
    </nav>
  );
}
