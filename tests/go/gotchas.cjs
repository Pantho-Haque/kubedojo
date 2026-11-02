'use strict';
// Gotcha outputs were recorded from real Go (go run, Go 1.27). The engine must keep matching them.
const { test } = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm');
const { data, engine } = require('./_html.cjs');
test('every gotcha runs in the engine and prints what real Go prints', () => {
  const ctx = {}; vm.createContext(ctx); vm.runInContext(engine(), ctx);
  const gotchas = data('gotcha-data'), lessons = new Set(data('curriculum').map((l) => l.id));
  assert.ok(gotchas.length >= 20);
  assert.equal(new Set(gotchas.map((g) => g.id)).size, gotchas.length, 'ids are unique');
  for (const g of gotchas) {
    assert.ok(lessons.has(g.lesson), g.id + ' lesson');
    const r = ctx.GoInterpreter.run(g.source);
    assert.equal(r.states.at(-1).output.trimEnd(), g.expected, g.id + ' output');
    assert.equal(!!r.exitStatus, !!g.panics, g.id + ' exit status');
  }
});

test('every interview program runs in the engine and prints what real Go prints', () => {
  const ctx = {}; vm.createContext(ctx); vm.runInContext(engine(), ctx);
  const qs = data('interview-data'), lessons = new Set(data('curriculum').map((l) => l.id));
  assert.ok(qs.length >= 20);
  assert.equal(new Set(qs.map((q) => q.id)).size, qs.length, 'ids are unique');
  for (const q of qs) {
    assert.ok(lessons.has(q.lesson), q.id + ' lesson');
    for (const k of ['question', 'answer', 'watch', 'title']) assert.ok(q[k] && q[k].length > 10, q.id + ' ' + k);
    const r = ctx.GoInterpreter.run(q.source);
    assert.equal(r.states.at(-1).output.trimEnd(), q.expected, q.id + ' output');
    assert.equal(!!r.exitStatus, !!q.panics, q.id + ' exit status');
  }
});
