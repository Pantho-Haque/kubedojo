// Per-route metadata: used by the prerenderer (title, description, canonical, Open Graph, JSON-LD) and by the client on navigation.
import { SITE, absolute } from './site.js';
import { bySlug, posts } from '../blog/data.js';

const PUBLISHER = { '@type': 'Organization', name: SITE.name };
export function metaFor(path) {
  const p = path.replace(/\/+$/, '') || '/';
  if (p === '/') return { path: '/', title: `${SITE.name}: practice Kubernetes on a cluster you can't break`, description: SITE.description, type: 'website', jsonld: [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, description: SITE.description, ...(SITE.url ? { url: SITE.url } : {}) },
    { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: SITE.name, applicationCategory: 'DeveloperApplication', operatingSystem: 'Any (runs in a web browser)', description: SITE.description, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }] };
  if (p === '/blog') return { path: p, title: `Blog · ${SITE.name}`, description: 'A step-by-step course on running a real multi-node Kubernetes cluster on your own computer with kind and k3d: concepts, deployments, images, Helm 2, permissions and clean-up.', type: 'website', jsonld: [{ '@context': 'https://schema.org', '@type': 'Blog', name: `${SITE.name} blog`, blogPost: posts.map(x => ({ '@type': 'BlogPosting', headline: x.title, url: absolute('/blog/' + x.slug) })) }] };
  const m = /^\/blog\/([\w-]+)$/.exec(p);
  if (m) { const post = bySlug(m[1]); if (post) return { path: p, title: `${post.title} · ${SITE.name}`, description: post.description, type: 'article', published: post.date, jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: post.description, datePublished: post.date, dateModified: post.date, author: PUBLISHER, publisher: PUBLISHER, ...(SITE.url ? { mainEntityOfPage: absolute(p) } : {}) }] }; }
  if (p === '/privacy') return { path: p, title: `Privacy · ${SITE.name}`, description: 'KubeDojo has no accounts, no analytics and no network calls. This page lists the only two things it stores in your browser.', type: 'website' };
  if (p === '/app') return { path: p, title: `Playground · ${SITE.name}`, description: 'The KubeDojo playground: a simulated kind, k3d, docker, kubectl and Helm 2 environment with a live view of the cluster.', type: 'website', noindex: false };
  return { path: p, title: `Page not found · ${SITE.name}`, description: 'This page does not exist.', type: 'website', noindex: true };
}
