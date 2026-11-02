// content/academy/** -> src/academy/generated/{index.json, courses/<slug>.json, go-curriculum.json, studio/<slug>.js}. Fails the build on any problem
// (broken lesson links, bad quizzes, unsafe HTML, unknown practice, or a playground hint pointing nowhere).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAcademy } from './lib/academy.mjs';
import { ACADEMY_HINTS } from '../src/playground/academyHints.js';
const root = join(dirname(fileURLToPath(import.meta.url)), '..'); const out = join(root, 'src/academy/generated');
const { index, courses, go, studio, problems } = buildAcademy(join(root, 'content/academy'), ACADEMY_HINTS);
if (problems.length) { console.error('academy: problems found\n  ' + problems.join('\n  ')); process.exit(1); }
rmSync(out, { recursive: true, force: true }); mkdirSync(join(out, 'courses'), { recursive: true });
writeFileSync(join(out, 'index.json'), JSON.stringify(index));
for (const [slug, c] of Object.entries(courses)) writeFileSync(join(out, 'courses', slug + '.json'), JSON.stringify(c));
// the Go workbench and its tools read every Go lesson, in track order; studio courses are code, so they ship as modules
writeFileSync(join(out, 'go-curriculum.json'), JSON.stringify(go.sort((a, b) => a.id.localeCompare(b.id))));
mkdirSync(join(out, 'studio')); for (const [slug, src] of Object.entries(studio)) writeFileSync(join(out, 'studio', slug + '.js'), src);
const n = index.courses.reduce((s, c) => s + c.lessons.length, 0), t = index.courses.reduce((s, c) => s + c.lessons.reduce((x, l) => x + l.tries, 0), 0);
console.log(`academy: ${index.categories.length} categories, ${index.courses.length} courses, ${n} lessons, ${t} set-up-and-try blocks`);
