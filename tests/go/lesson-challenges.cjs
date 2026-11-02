'use strict';
// Each lesson's Try challenge must be solvable: its pattern fails on the example as shipped
// and passes on the stored solution. Capstones use their own starter and goal.
const { data } = require('./_html.cjs');
const { test } = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const c = {}; vm.createContext(c); vm.runInContext(fs.readFileSync('src/go-interpreter.js', 'utf8'), c);
const lessons = data('curriculum'), programs = new Map(data('program-library').map((p) => [p.id, p]));

test('every lesson has specific goals and a solvable Try challenge', () => {
  for (const l of lessons) {
    assert.equal(l.goals.length, 3, l.id);
    assert.ok(!l.goals.some((g) => /behaves this way|Change one input/.test(g)), l.id + ' still has template goals');
    const re = new RegExp(l.try.expect);
    assert.ok(!re.test(c.GoInterpreter.run(programs.get(l.examples[0]).source).stdout), l.id + ': pattern already matches the example');
    const sol = c.GoInterpreter.run(l.try.solution);
    assert.equal(sol.exitStatus, 0, l.id);
    assert.ok(re.test(sol.stdout), l.id + ': solution does not match ' + l.try.expect);
  }
});

test('capstone starters miss the goal and their solutions reach it', () => {
  for (const l of lessons.filter((x) => x.capstone)) {
    const g = l.capstone.goal, meets = (r) => r.stdout.trim() === g.stdout.trim() &&
      (g.maxModelAllocations == null || r.states.at(-1).modelStats.Mallocs <= g.maxModelAllocations) &&
      (!g.noRaces || !r.states.some((s) => s.races?.length));
    assert.ok(!meets(c.GoInterpreter.run(l.capstone.starter)), l.id + ': starter already meets the goal');
    assert.ok(meets(c.GoInterpreter.run(programs.get(l.capstone.solution).source)), l.id + ': solution misses the goal');
  }
});
