// Runs the headless simulator scenarios in tests/ (Node, no browser). Each file must exit 0, print no "internal error",
// and assert-style suites must print their success line.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'tests');
const MUST = { 't9.js': /flagged: 0/, 'tvi.js': /all vi checks pass/, 'tx.js': /export checks pass/, 'tg2.js': /gcloud checks pass/, 'tq1.js': /qa1: \d+ passed, 0 failed/, 'tq2.js': /qa2: \d+ passed, 0 failed/, 'tq3.js': /qa3: fuzz clean/, 'ts.js': /all \d+ sed\/grep checks pass/, 'tstate.js': /state checks pass/ };
let failed = 0;
for (const f of readdirSync(dir).filter(f => /^t[a-z0-9]*\.js$/.test(f)).sort()) {
  const r = spawnSync('node', [f], { cwd: dir, encoding: 'utf8', timeout: 120000 }); const out = (r.stdout || '') + (r.stderr || '');
  const problems = [];
  if (r.status !== 0) problems.push('exit ' + r.status);
  if (/internal error/i.test(out)) problems.push('internal error in output');
  if (MUST[f] && !MUST[f].test(out)) problems.push('missing success line');
  console.log(problems.length ? 'FAIL' : 'ok  ', f, problems.join('; ')); if (problems.length) failed++;
}
for (const f of ['test_yaml.js', 'test_tpl.js']) { const r = spawnSync('node', [f], { cwd: dir, encoding: 'utf8' }); console.log(r.status === 0 ? 'ok  ' : 'FAIL', f); if (r.status !== 0) failed++; }
console.log(failed ? failed + ' failing' : 'all test files pass'); process.exit(failed ? 1 : 0);
