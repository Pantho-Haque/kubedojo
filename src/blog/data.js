// Blog data. The post index (small) ships with the landing/blog pages; each post's HTML is its own chunk, loaded on demand.
import index from './generated/index.json';

export const posts = index; // sorted by series order
export const bySlug = slug => index.find(p => p.slug === slug);
export const allTags = () => [...new Set(index.flatMap(p => p.tags))].sort();
export const neighbours = slug => { const i = index.findIndex(p => p.slug === slug); return { prev: index[i - 1] || null, next: index[i + 1] || null }; };

const loaders = import.meta.glob('./generated/posts/*.json');
const cache = new Map(); const pending = new Map();

export function seedPost(post) { cache.set(post.slug, post); } // used by the prerenderer and by hydration
export const getPostSync = slug => cache.get(slug) || null;
export function loadPost(slug) {
  if (cache.has(slug)) return Promise.resolve(cache.get(slug));
  const key = `./generated/posts/${slug}.json`; if (!loaders[key]) return Promise.resolve(null);
  if (!pending.has(slug)) pending.set(slug, loaders[key]().then(m => { const p = m.default; cache.set(slug, p); return p; }));
  return pending.get(slug);
}
// React Suspense helper: returns the post, or throws the loading promise
export function usePost(slug) {
  const hit = cache.get(slug); if (hit) return hit; if (!loaders[`./generated/posts/${slug}.json`]) return null;
  throw loadPost(slug);
}
