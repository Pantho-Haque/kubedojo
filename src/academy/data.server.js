// Server-only: pre-load every course synchronously so the prerenderer can print each lesson (imported by entry-server.jsx).
import { seedCourse } from './data.js';
const all = import.meta.glob('./generated/courses/*.json', { eager: true });
for (const m of Object.values(all)) seedCourse(m.default);
