import { Link } from 'react-router-dom';
import { posts, bySlug } from '../blog/data.js';
import { useProgress } from '../blog/progress.js';
import Section from './Section.jsx';

export default function Course() {
  const { read, last } = useProgress(); const resume = last && bySlug(last);
  const done = posts.filter(p => read.has(p.slug)).length;
  return (
    <Section id="guides" no={9} label="the guides" title="a short course, in the order you would do it.">
      {(done > 0 || resume) && (
        <p className="resume" aria-live="polite">
          {done > 0 && <span>{done} of {posts.length} read. </span>}
          {resume && <>Pick up at <Link to={`/blog/${resume.slug}`}>{resume.title}</Link>.</>}
        </p>
      )}
      <ol className="course">
        {posts.map(p => (
          <li key={p.slug} className={read.has(p.slug) ? 'is-read' : undefined}>
            <span className="n" aria-hidden="true">{String(p.order).padStart(2, '0')}</span>
            <div><h3><Link to={`/blog/${p.slug}`}>{p.title}</Link></h3><p>{p.description}</p></div>
            <span className="m">{read.has(p.slug) ? 'read' : `${p.minutes} min`}</span>
          </li>
        ))}
      </ol>
      <p className="after"><Link className="arrow-link" to="/blog">browse and search all posts</Link></p>
    </Section>
  );
}
