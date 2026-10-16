// Server-only: pre-load every post synchronously so renderToString can print them (imported by entry-server.jsx only).
import { seedPost } from './data.js';
const all = import.meta.glob('./generated/posts/*.json', { eager: true });
for (const m of Object.values(all)) seedPost(m.default);
