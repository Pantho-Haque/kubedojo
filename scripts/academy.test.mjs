import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildAcademy } from './lib/academy.mjs';
import { labCanRun } from '../src/academy/engine/canrun.js';
import { ACADEMY_HINTS } from '../src/playground/academyHints.js';

const course = files => { const d = mkdtempSync(join(tmpdir(), 'kd-ac-')); mkdirSync(join(d, 'helm-2')); writeFileSync(join(d, 'helm-2', 'index.md'), '---\ntitle: T\norder: 1\nsubtitle: S\ndescription: D\nstages: [One]\npractice: a\n---\n'); for (const [n, c] of Object.entries(files)) writeFileSync(join(d, 'helm-2', n), c); return d; };
const lesson = (id, extra = '', body = 'Hello.') => `---\nid: ${id}\ntitle: L ${id}\nstage: 0\n${extra}---\n\n${body}\n`;

test('the real Academy content builds cleanly, and every playground hint lands on a lesson', () => {
  const { index, courses, problems } = buildAcademy(new URL('../content/academy', import.meta.url).pathname, ACADEMY_HINTS);
  assert.deepEqual(problems, []); assert.equal(index.courses.length, 6);
  assert.ok(Object.values(courses).every(c => Object.values(c.lessons).every(l => l.description)), 'every lesson has a description (kept with its course, not in the index)');
});

test('broken content fails the build: bad links, quizzes, unsafe HTML, unknown practice, hints pointing nowhere', () => {
  const d = course({ '01-a.md': lesson('a', '', '<button data-go="nope">x</button><img src=x onerror="alert(1)">'), '02-b.md': lesson('b', 'quiz:\n  - q: Q\n    options: [x]\n    answer: 3\n    why: w\npractice:\n  kind: helm2\n    mission: zzz\n'.replace('    mission', '  mission')) });
  const { problems } = buildAcademy(d, { 9: { text: 't', links: [['x', '/academy/helm-2/missing']] } });
  for (const re of [/data-go="nope"/, /event handlers/, /quiz question 1/, /unknown helm2 mission/, /missing is not an Academy lesson/]) assert.ok(problems.some(p => re.test(p)), re.source);
});

test('Markdown lessons: bash blocks become command blocks with a Copy button', () => {
  const { courses, problems } = buildAcademy(course({ '01-a.md': lesson('a', '', '## Part\n\n```bash\nhelm2 ls\n```') }));
  assert.deepEqual(problems, []); assert.match(courses['helm-2'].lessons.a.html, /<div class="cmd"><pre tabindex="0">helm2 ls<\/pre><button type="button" class="copy">/);
});

test('"Set up and try" is offered only for commands the Academy lab can run', () => {
  for (const c of ['kubectl get pods -o wide', 'kubectl create deployment web --image=nginx --replicas=2', 'kubectl set image deployment/web nginx=nginx:1.28', 'kubectl rollout undo deployment/web']) assert.ok(labCanRun(c), c);
  for (const c of ['kubectl apply -f x.yaml', 'kubectl get pods -A', 'kubectl delete pod -l app=web', 'kubectl get pods | grep web', 'helm install x ./c', 'docker ps']) assert.ok(!labCanRun(c), c);
});
