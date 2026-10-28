import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { metaFor } from '../site/meta.js';
import { usePageMeta } from '../components/usePageMeta.js';
import { event } from '@pantho075/trackima';

export default function NotFound() {
  usePageMeta(metaFor('/404-not-found'));
  useEffect(() => { event('not_found', { path: location.pathname, from: document.referrer.slice(0, 120) }); }, []);
  return (
    <div className="wrap notfound">
      <h1>That page is not here.</h1>
      <p>The link may be old, or mistyped. The guides and the playground are one click away.</p>
      <p className="row"><Link className="btn btn-primary" to="/blog">Go to the blog</Link> <Link className="btn" to="/">Home</Link></p>
    </div>
  );
}
