// An AI course's own pages (glossary with deep dives, spaced review, cheat sheet, certificate, project board), in the Academy frame.
import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePageMeta } from '../../components/usePageMeta.js';
import { SITE } from '../../site/site.js';
import NotFound from '../../pages/NotFound.jsx';
import { courseBySlug } from '../data.js';
import { markDone } from '../progress.js';
import { TOOLS, useStudio } from './useStudio.js';
import './frame.css';

const NAMES = { ...Object.fromEntries(TOOLS), project: 'Project board' };
const ABOUT = {
  glossary: 'Every term in plain words, with deep dives: the formula, an animated figure, a worked example and a live lab.',
  review: 'Questions you answered in lessons come back here for spaced review, right before you would forget them.',
  cheatsheet: 'The key points and commands from every lesson on one page.',
  certificate: 'Your certificate of completion, once every lesson is done.',
  project: 'The capstone app, growing one build step at a time.',
};

function Tool({ c, tool }) {
  const { hash } = useLocation(); const navigate = useNavigate(); const host = useRef(null); const studio = useStudio(c.slug);
  const path = `/academy/${c.slug}/${tool}`;
  usePageMeta({ path, type: 'website', title: `${NAMES[tool]} · ${c.title} · ${SITE.name} Academy`, description: ABOUT[tool], noindex: tool === 'review' || tool === 'certificate' });
  useEffect(() => { window.scrollTo(0, 0); }, [tool]);
  useEffect(() => { if (studio) return studio.show(host.current, studio.toolHash(tool, hash), { nav: navigate, done: markDone }); }, [studio, tool, hash, navigate]);
  return (
    <div className="wrap ac-studio-tool">
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/academy">Academy</Link><span aria-hidden="true">/</span><Link to={`/academy/${c.slug}`}>{c.title}</Link><span aria-hidden="true">/</span><span>{NAMES[tool]}</span></nav>
      <div className="ac-studio-host" ref={host}><h1>{NAMES[tool]}</h1><p>{ABOUT[tool]}</p></div>
    </div>
  );
}

export default function StudioTools({ tool }) {
  const c = courseBySlug(useParams().course);
  if (c?.engine !== 'studio' || !NAMES[tool]) return <NotFound />;
  return <Tool key={c.slug + tool} c={c} tool={tool} />;
}
