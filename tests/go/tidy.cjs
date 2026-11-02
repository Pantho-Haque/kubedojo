'use strict';
// Tidy must leave gofmt-formatted programs untouched and fix the indentation of messy ones.
const { test } = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm');
const { block, data } = require('./_html.cjs');
const ctx = { document: {} }; ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(block('editor-script'), ctx);
const { tidy } = ctx.GothikEditor;

test('tidy only re-indents bundled programs, is idempotent, and leaves tab-indented ones alone', () => {
  // gotchas, interview questions and compare presets were written gofmt-style (tabs); the older examples were not
  const gofmted = [...data('gotcha-data').map((g) => [g.id, g.source]), ...data('interview-data').map((q) => [q.id, q.source]), ...data('compare-data').flatMap((c) => [[c.id + 'A', c.A], [c.id + 'B', c.B]])];
  const sources = [...data('program-library').map((p) => [p.id, p.source]), ...gofmted];
  assert.ok(sources.length > 100);
  const tidyIds = new Set(gofmted.map(([id]) => id));
  const words = (x) => x.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const [id, src] of sources) {
    const once = tidy(src);
    assert.deepEqual(words(once), words(src), id + ': only whitespace changes');
    assert.equal(tidy(once), once, id + ': idempotent');
    if (tidyIds.has(id)) assert.equal(once, src.replace(/\n*$/, '\n'), id + ': gofmt-style source is untouched');
  }
});

test('tidy fixes indentation, blank lines and trailing spaces, and is idempotent', () => {
  const messy = 'package main\n\n\n\nimport "fmt"\n\nfunc main() {   \n  x := 1\n      switch x {\n   case 1:\n fmt.Println("one {")\n  default:\nfmt.Println(`raw\n   kept }`)\n}\nouter:\n  for i := 0; i < 2; i++ {\nif i > 0 &&\nx > 0 {\nbreak outer\n}\n}\n}\n\n\n';
  const want = 'package main\n\nimport "fmt"\n\nfunc main() {\n\tx := 1\n\tswitch x {\n\tcase 1:\n\t\tfmt.Println("one {")\n\tdefault:\n\t\tfmt.Println(`raw\n   kept }`)\n\t}\nouter:\n\tfor i := 0; i < 2; i++ {\n\t\tif i > 0 &&\n\t\t\tx > 0 {\n\t\t\tbreak outer\n\t\t}\n\t}\n}\n';
  assert.equal(tidy(messy), want);
  assert.equal(tidy(want), want);
});
