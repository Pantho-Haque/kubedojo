'use strict';
// Loads the <script id="modules"> block from gothik.html.
const vm = require('node:vm');
const { block } = require('./_html.cjs');
let mods = null;
// same realm as the tests, so deepStrictEqual sees ordinary objects
const loadModules = () => { if (!mods) { vm.runInThisContext(block('modules')); mods = globalThis; } return mods; };
const test = require('node:test');
const assert = require('node:assert/strict');
const M = loadModules().GothikLabModels;

// ---------- utf8 ----------
test('utf8: exact bytes and runes', () => {
  const r = M.utf8('aé🚀');
  assert.equal(r.len, 7);
  assert.equal(r.runeCount, 3);
  assert.deepEqual(r.runes, [
    { i: 0, char: 'a', code: 'U+0061', size: 1 },
    { i: 1, char: 'é', code: 'U+00E9', size: 2 },
    { i: 3, char: '🚀', code: 'U+1F680', size: 4 },
  ]);
  assert.deepEqual(r.bytes.map((b) => b.hex), ['61', 'C3', 'A9', 'F0', '9F', '9A', '80']);
  assert.deepEqual(r.bytes.map((b) => b.rune), [0, 1, 1, 2, 2, 2, 2]);
  assert.deepEqual(r.bytes[1], { i: 1, hex: 'C3', dec: 195, rune: 1 });
});

test('utf8: lone surrogates become U+FFFD; empty/nullish input', () => {
  const r = M.utf8('x\uD800y\uDC00');
  assert.deepEqual(r.runes.map((x) => [x.code, x.size, !!x.invalid]), [['U+0078', 1, false], ['U+FFFD', 3, true], ['U+0079', 1, false], ['U+FFFD', 3, true]]);
  assert.deepEqual(M.utf8(''), { bytes: [], runes: [], len: 0, runeCount: 0 });
  assert.equal(M.utf8(null).len, 0);
});

test('utf8: agrees with TextEncoder on varied strings', () => {
  for (const s of ['', 'plain ascii', 'Grüße', '世界', '👩‍💻 family 👨‍👩‍👧', 'ࠀ￿\u{10000}\u{10FFFF}', 'a\uDBFFb']) {
    const r = M.utf8(s);
    assert.deepEqual(r.bytes.map((b) => b.dec), [...new TextEncoder().encode(s)], s);
    assert.equal(r.runeCount, [...s].length);
    r.runes.forEach((x, k) => assert.ok(r.bytes.slice(x.i, x.i + x.size).every((b) => b.rune === k)));
  }
});

// ---------- swissMap ----------
test('fnv1a64 teaching hash matches published FNV-1a vectors', () => {
  assert.equal(M.fnv1a64('').toString(16), 'cbf29ce484222325');
  assert.equal(M.fnv1a64('a').toString(16), 'af63dc4c8601ec8c');
  assert.equal(M.fnv1a64('foobar').toString(16), '85944171f73967e8');
});

test('swissMap: exact steps for a small map, grows at 7/8 load', () => {
  const { steps, groupSize } = M.swissMap(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
  assert.equal(groupSize, 8);
  assert.deepEqual(steps.map((s) => s.event), ['insert', 'insert', 'insert', 'insert', 'insert', 'insert', 'insert', 'grow', 'insert']);
  assert.deepEqual(steps.map((s) => s.h2), ['0c', '25', '72', '73', '40', '59', '26', null, '57']);
  assert.deepEqual(steps[0].groups[0].slots[0], { ctrl: '0c', key: 'a' });
  assert.deepEqual(steps[0].groups[0].slots[1], { ctrl: 'empty', key: undefined });
  assert.equal(steps[0].hash, M.fnv1a64('a').toString(16).padStart(16, '0'));
  assert.deepEqual([steps[7].from, steps[7].to, steps[7].capacity, steps[7].used], [1, 2, 16, 7]);
  assert.deepEqual([steps[8].start, steps[8].probe, steps[8].slot], [1, [1], { group: 1, slot: 5 }]);
});

const liveKeys = (step) => step.groups.flatMap((g) => g.slots.filter((s) => s.ctrl !== 'empty' && s.ctrl !== 'deleted').map((s) => s.key));

test('swissMap: invariants over 300 inserts', () => {
  const keys = Array.from({ length: 300 }, (_, i) => 'key' + i);
  const { steps } = M.swissMap(keys);
  const last = steps[steps.length - 1];
  assert.deepEqual(liveKeys(last).sort(), [...keys].sort());
  assert.equal(last.used, 300);
  for (const s of steps) {
    assert.ok(s.used + s.tombstones <= Math.floor((s.capacity * 7) / 8));
    assert.equal(s.groups.length & (s.groups.length - 1), 0, 'power-of-two group count');
    if (s.event === 'insert') {
      // linear probing: probe = start, start+1, ... mod groups; key lands in the last probed group
      s.probe.forEach((g, i) => assert.equal(g, (s.start + i) % s.groups.length));
      assert.equal(s.slot.group, s.probe[s.probe.length - 1]);
      assert.deepEqual(s.groups[s.slot.group].slots[s.slot.slot], { ctrl: s.h2, key: s.key });
    }
  }
  // Re-inserting finds every key; duplicates do not change the map.
  const again = M.swissMap([...keys, ...keys]).steps.slice(-300);
  assert.ok(again.every((s) => s.event === 'insert' && s.found));
});

test('swissMap: delete leaves a tombstone only in a full group, and probing continues past it', () => {
  const keys = Array.from({ length: 100 }, (_, i) => 'k' + i);
  const base = M.swissMap(keys).steps.at(-1);
  const full = base.groups.findIndex((g) => g.slots.every((s) => s.ctrl !== 'empty'));
  assert.ok(full >= 0, 'fixture needs a full group');
  const victim = base.groups[full].slots[0].key;
  const roomy = base.groups.findIndex((g) => g.slots.some((s) => s.ctrl === 'empty') && g.slots.some((s) => s.key !== undefined));
  const easy = base.groups[roomy].slots.find((s) => s.key !== undefined).key;

  const { steps } = M.swissMap([...keys, { op: 'delete', key: victim }, { op: 'delete', key: easy }, { op: 'delete', key: 'nope' }, ...keys]);
  const [d1, d2, d3] = steps.slice(-103, -100);
  assert.deepEqual([d1.event, d1.found, d1.groups[full].slots[0].ctrl, d1.tombstones], ['delete', true, 'deleted', 1]);
  assert.deepEqual([d2.found, d2.tombstones, d2.groups[roomy].slots.some((s) => s.ctrl === 'deleted')], [true, 1, false]);
  assert.deepEqual([d3.found, d3.slot], [false, null]);
  // Every surviving key is still found (lookups skip the tombstone); the victim is re-inserted.
  const re = steps.slice(-100);
  assert.deepEqual(re.filter((s) => !s.found).map((s) => s.key).sort(), [victim, easy].sort());
  assert.equal(liveKeys(steps.at(-1)).length, 100);
  assert.ok(steps.at(-1).tombstones <= 1);
});

// ---------- stackGrowth ----------
test('stackGrowth: exact sequence', () => {
  const r = M.stackGrowth([5, 1, 'gc', 'gc', 0], { initial: 2048, frame: 512 });
  assert.deepEqual(r.steps.map((s) => [s.event, s.depth, s.size, s.used, s.copied]), [
    ['call', 1, 2048, 512, 0], ['call', 2, 2048, 1024, 0], ['call', 3, 2048, 1536, 0], ['call', 4, 2048, 2048, 0],
    ['grow', 4, 4096, 2048, 2048], ['call', 5, 4096, 2560, 0],
    ['return', 4, 4096, 2048, 0], ['return', 3, 4096, 1536, 0], ['return', 2, 4096, 1024, 0], ['return', 1, 4096, 512, 0],
    ['shrink', 1, 2048, 512, 512], ['gc', 1, 2048, 512, 0], // 512 is not < 2048/4, and 2 KiB is the floor anyway
    ['return', 0, 2048, 0, 0],
  ]);
  assert.deepEqual([r.maxSize, r.totalCopied], [4096, 2560]);
});

test('stackGrowth: invariants and large frames', () => {
  const r = M.stackGrowth([3, 40, 'gc', 10, 'gc', 'gc', 'gc', 0, 'gc', 'gc', 'gc', 'gc', 64, 'nonsense', -5], { initial: 2048, frame: 700 });
  for (const s of r.steps) {
    assert.ok(s.used <= s.size);
    assert.ok(Number.isInteger(Math.log2(s.size / 2048)) && s.size >= 2048);
    if (s.event === 'grow' || s.event === 'shrink') assert.equal(s.copied, s.used);
  }
  assert.equal(r.steps.at(-1).depth, 0);
  assert.ok(r.steps.some((s) => s.event === 'shrink'));
  // one call needing 4x space doubles twice in a single grow (one copy), like newstack
  const big = M.stackGrowth([1], { initial: 2048, frame: 8000 });
  assert.deepEqual(big.steps.map((s) => [s.event, s.size]), [['grow', 8192], ['call', 8192]]);
});

// ---------- gmp ----------
const gs = (n, work) => Array.from({ length: n }, (_, i) => ({ id: 'G' + (i + 1), work: typeof work === 'function' ? work(i) : work }));

function checkConservation(r, ids) {
  const done = new Set();
  for (const s of r.steps) {
    if (s.event === 'done') { assert.ok(!done.has(s.g)); done.add(s.g); }
    const seen = [...s.ps.flatMap((p) => (p.running ? [p.running, ...p.local] : p.local)), ...s.global];
    assert.equal(new Set(seen).size, seen.length, 'no goroutine in two places');
    assert.deepEqual([...seen, ...done].sort(), [...ids].sort(), `t=${s.t} ${s.event}`);
    assert.ok(s.ps.every((p) => p.local.length <= 256));
  }
  assert.equal(done.size, ids.length);
}

test('gmp: exact opening for 6 goroutines on 2 Ps', () => {
  const r = M.gmp({ goroutines: gs(6, 3), procs: 2, seed: 7 });
  const ev = r.steps.slice(0, 4).map((s) => [s.t, s.event, s.g, s.from, s.to]);
  assert.deepEqual(ev, [
    [0, 'start', undefined, undefined, undefined],
    [0, 'run', 'G1', 'local', 0],
    [0, 'steal', 'G4', 0, 1], // P1 is empty: steals G2..G4 (half of 5, rounded up) and runs the last one
    [1, 'preempt', 'G1', 0, 'global'],
  ]);
  assert.deepEqual(r.steps[2].ps.map((p) => p.local), [['G5', 'G6'], ['G2', 'G3']]);
  assert.equal(r.steps[2].stolen, 3);
  assert.ok(r.finished);
  checkConservation(r, gs(6).map((g) => g.id));
});

test('gmp: deterministic for a seed; conserves goroutines with 4 Ps', () => {
  const opts = { goroutines: gs(40, (i) => 1 + (i % 7)), procs: 4, seed: 42 };
  assert.deepEqual(M.gmp(opts), M.gmp(opts));
  const r = M.gmp(opts);
  checkConservation(r, gs(40).map((g) => g.id));
  assert.ok(r.steps.some((s) => s.event === 'steal'));
  assert.ok(r.steps.some((s) => s.event === 'preempt'));
  assert.equal(r.steps.filter((s) => s.event === 'done').length, 40);
});

test('gmp: local queue overflow goes to the global queue; schedtick%61 fairness', () => {
  const r = M.gmp({ goroutines: gs(300, 1), procs: 1, seed: 1 });
  const start = r.steps[0];
  // 257th go statement: half of P0's queue (128) plus the new G move to global
  assert.equal(start.global.length, 129);
  assert.deepEqual(start.global.slice(0, 2), ['G1', 'G2']);
  assert.equal(start.global.at(-1), 'G257');
  assert.equal(start.ps[0].local.length, 171);
  // First pick (schedtick 0) and every 61st pick check global first even though the local queue is non-empty.
  const picks = r.steps.filter((s) => ['run', 'global', 'steal'].includes(s.event));
  assert.equal(picks[0].event, 'global');
  assert.equal(picks[61].event, 'global');
  assert.ok(picks[61].ps[0].local.length > 0);
  assert.ok(picks.slice(1, 61).every((s) => s.event === 'run'));
  checkConservation(r, gs(300).map((g) => g.id));
});

test('gmp: edge inputs', () => {
  assert.deepEqual(M.gmp({}).steps.length, 1);
  const r = M.gmp({ goroutines: [{ work: 0 }, { id: 'x', work: 2.7 }], procs: 0 });
  assert.equal(r.procs, 1);
  assert.ok(r.finished);
  assert.deepEqual(r.steps.filter((s) => s.event === 'done').map((s) => s.g).sort(), ['G1', 'x']);
});
