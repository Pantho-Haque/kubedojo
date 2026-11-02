'use strict';
// Loads the <script id="modules"> block from gothik.html.
const vm = require('node:vm');
const { block } = require('./_html.cjs');
let mods = null;
// same realm as the tests, so deepStrictEqual sees ordinary objects
const loadModules = () => { if (!mods) { vm.runInThisContext(block('modules')); mods = globalThis; } return mods; };
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const T = loadModules().GothikTraceImport;

// Real dumps from Go 1.27 (`go tool trace -d=parsed`), program in fixtures/trace-program.go.txt.
// chan-p1.txt keeps its stack lines; the others were filtered to event lines only.
const fx = (name) => fs.readFileSync(path.join(__dirname, 'fixtures', 'trace', name), 'utf8');
const FIXTURES = ['chan-p1', 'chan-p4', 'mutex-p1', 'mutex-p4', 'sleep-p1', 'sleep-p4', 'syscall-p1', 'syscall-p4'];
const allRuns = (r) => r.goroutines.flatMap((g) => g.runs);

for (const name of FIXTURES) {
  test(`real trace ${name}: well-formed runs`, () => {
    const r = T.parse(fx(name + '.txt'));
    assert.equal(r.error, undefined);
    assert.deepEqual(r.warnings, []);
    assert.equal(r.t0, 0);
    assert.ok(r.t1 > 0 && r.origin > 0);
    assert.equal(r.procs, name.endsWith('p4') ? 4 : 1);
    assert.ok(r.goroutines.some((g) => g.id === 'G1'));
    for (const g of r.goroutines) {
      assert.match(g.id, /^G\d+$/);
      g.runs.forEach((run, i) => {
        assert.ok(['running', 'runnable', 'waiting', 'syscall'].includes(run.state));
        assert.ok(run.start >= 0 && run.end > run.start && run.end <= r.t1, 'non-empty and within trace');
        if (i) assert.ok(g.runs[i - 1].end <= run.start, 'ordered, non-overlapping');
        if (run.state === 'running') assert.ok(run.p >= 0 && run.p < r.procs);
      });
      if (g.ended != null) assert.ok(g.runs.every((x) => x.end <= g.ended));
      if (g.created != null) assert.ok(g.runs.every((x) => x.start >= g.created));
    }
  });
}

test('reasons and states from the scenarios survive', () => {
  assert.ok(allRuns(T.parse(fx('chan-p1.txt'))).some((x) => x.state === 'waiting' && x.reason === 'chan receive'));
  assert.ok(allRuns(T.parse(fx('sleep-p1.txt'))).some((x) => x.state === 'waiting' && x.reason === 'sleep'));
  assert.ok(allRuns(T.parse(fx('mutex-p4.txt'))).some((x) => x.state === 'waiting' && x.reason === 'sync'));
  const sys = T.parse(fx('syscall-p1.txt'));
  assert.ok(allRuns(sys).filter((x) => x.state === 'syscall').length >= 10);
  // mutex scenario: 4 workers created and finished inside the trace.
  const done = T.parse(fx('mutex-p4.txt')).goroutines.filter((g) => g.created != null && g.ended != null);
  assert.ok(done.length >= 4);
});

test('exact parse of a small synthetic dump', () => {
  const dump = [
    'M=-1 P=-1 G=-1 Sync Time=1000 N=1 Trace=1 Mono=1 Wall=x',
    'M=1 P=0 G=-1 StateTransition Time=1000 ProcID=0 Undetermined->Running Reason=""',
    'M=1 P=0 G=-1 StateTransition Time=1000 GoID=1 Undetermined->Running Reason=""',
    'M=1 P=0 G=1 StateTransition Time=1100 GoID=7 NotExist->Runnable Reason=""',
    'Stack=',
    '\tmain.main @ 0x1',
    '\t\t/x/main.go:10',
    '',
    'M=1 P=0 G=1 StateTransition Time=1200 GoID=1 Running->Waiting Reason="chan receive"',
    'M=1 P=0 G=-1 StateTransition Time=1250 GoID=7 Runnable->Running Reason=""',
    'M=1 P=0 G=7 StateTransition Time=1250 GoID=7 Running->Runnable Reason=""', // zero-length running: dropped
    'M=1 P=0 G=-1 StateTransition Time=1250 GoID=7 Runnable->Running Reason=""',
    'M=1 P=0 G=7 StateTransition Time=1300 GoID=1 Waiting->Runnable Reason=""',
    'M=1 P=1 G=7 StateTransition Time=1400 GoID=7 Running->NotExist Reason=""',
    'M=1 P=1 G=-1 StateTransition Time=1450 GoID=1 Runnable->Running Reason=""',
    'M=1 P=1 G=1 Metric Time=1500 Name="/gc/heap/goal:bytes" Value=Value{Uint64(1)}',
  ].join('\n');
  assert.deepEqual(T.parse(dump), {
    t0: 0, t1: 500, origin: 1000, procs: 2, warnings: [],
    goroutines: [
      { id: 'G1', created: null, ended: null, runs: [
        { state: 'running', start: 0, end: 200, reason: '', p: 0 },
        { state: 'waiting', start: 200, end: 300, reason: 'chan receive', p: null },
        { state: 'runnable', start: 300, end: 450, reason: '', p: null },
        { state: 'running', start: 450, end: 500, reason: '', p: 1 }, // closed at t1
      ] },
      { id: 'G7', created: 100, ended: 400, runs: [
        { state: 'runnable', start: 100, end: 250, reason: '', p: null },
        { state: 'running', start: 250, end: 400, reason: '', p: 0 },
      ] },
    ],
  });
});

test('inconsistent transitions produce warnings, not errors', () => {
  const r = T.parse([
    'M=1 P=0 G=1 StateTransition Time=10 GoID=3 NotExist->Runnable Reason=""',
    'M=1 P=0 G=1 StateTransition Time=20 GoID=3 Waiting->Running Reason=""',
    'M=1 P=0 G=1 StateTransition Time=5 GoID=3 Running->Bogus Reason=""',
    'M=1 P=0 G=1 Broken',
  ].join('\n'));
  assert.equal(r.error, undefined);
  assert.equal(r.warnings.length, 4);
});

test('garbage input returns {error} and never throws', () => {
  for (const bad of [null, undefined, 42, {}, '', 'hello\nworld', '\x00\xff'.repeat(1000), 'M=garbage', 'M=1 P=0 G=1 Sync Time=5 N=1']) {
    const r = T.parse(bad);
    assert.equal(typeof r.error, 'string', String(bad).slice(0, 20));
  }
  const rnd = Array.from({ length: 5000 }, (_, i) => String.fromCharCode((i * 7919) % 0x2000)).join('');
  assert.ok(T.parse(rnd).error);
});

test('caps input at 2 million lines', () => {
  const ev = 'M=1 P=0 G=1 StateTransition Time=10 GoID=1 Undetermined->Running Reason=""\n';
  const r = T.parse(ev + 'x\n'.repeat(2000005) + 'M=1 P=0 G=1 StateTransition Time=99 GoID=1 Running->Waiting Reason=""\n');
  assert.equal(r.t1, 0);
  assert.match(r.warnings[0], /Stopped after 2,000,000 lines/);
});

test('toGantt draws one rect per run with tooltips and CSS variables', () => {
  const parsed = T.parse(fx('sleep-p4.txt'));
  const svg = T.toGantt(parsed, 900);
  assert.match(svg, /^<svg [^>]*viewBox="0 0 900 \d+"/);
  assert.equal((svg.match(/<rect /g) || []).length, allRuns(parsed).length);
  assert.equal((svg.match(/<title>/g) || []).length, allRuns(parsed).length);
  for (const v of ['var(--c-gor)', 'color-mix(in srgb,var(--c-gor) 32%,transparent)', 'var(--signal)', 'var(--c-chan)', 'var(--text-dim)']) assert.ok(svg.includes(v), v);
  assert.match(svg, /<title>G\d+ waiting \(sleep\) · /);
  assert.match(svg, />1000 µs</); // sleep trace is ~3.6 ms: µs ticks
  assert.ok(svg.includes('>G1</text>'));
});

test('toGantt escapes text and handles empty input', () => {
  const r = { t0: 0, t1: 2e6, goroutines: [{ id: 'G1', runs: [{ state: 'waiting', start: 0, end: 2e6, reason: '<b>&"', p: null }] }] };
  const svg = T.toGantt(r, 400);
  assert.ok(svg.includes('(&lt;b&gt;&amp;&quot;)'));
  assert.match(svg, />2 ms</);
  assert.match(T.toGantt({ error: 'x' }), /No goroutine data/);
  assert.match(T.toGantt(null), /No goroutine data/);
});
