'use strict';
// Re-runs every bundled program and compares output, trace facts and model stats with program.expected.
// Exits non-zero on the first mismatch.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { data, engine } = require('./_html.cjs');

const context = {};
vm.createContext(context);
vm.runInContext(engine(), context);
const { GoInterpreter } = context;

for (const program of data('program-library')) {
  const result = GoInterpreter.run(program.source);
  const last = result.states.at(-1);
  const actual = JSON.parse(JSON.stringify({
    stdout: last.output,
    exitStatus: 0,
    events: result.states.length,
    modelStats: last.modelStats,
    objects: last.objects.map((o) => ({ id: o.id, kind: o.kind, values: o.values })),
    model: /runtime\.(GC|ReadMemStats)|unsafe\./.test(program.source),
  }));
  assert.deepStrictEqual(actual, program.expected, program.id);
}
console.log('all ' + data('program-library').length + ' examples match');
