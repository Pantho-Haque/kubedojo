import { Link } from 'react-router-dom';
import { metaFor } from '../site/meta.js';
import { usePageMeta } from '../components/usePageMeta.js';

export default function NotFound() {
  usePageMeta(metaFor('/404-not-found'));
  return (
    <div className="wrap notfound">
      <h1>That page is not here.</h1>
      <p>The link may be old, or mistyped. The guides and the playground are one click away.</p>
      <p className="row"><Link className="btn btn-primary" to="/blog">Go to the blog</Link> <Link className="btn" to="/">Home</Link></p>
    </div>
  );
}
