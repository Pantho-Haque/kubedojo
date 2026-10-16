import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App.jsx';
import './blog/data.server.js';
import { posts } from './blog/data.js';
import { metaFor } from './site/meta.js';

export const routes = () => ['/', '/blog', ...posts.map(p => '/blog/' + p.slug), '/privacy'];
export { metaFor };
export function render(url) { return renderToString(<StaticRouter location={url}><App /></StaticRouter>); }
