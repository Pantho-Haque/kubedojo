'use strict';
const { test } = require('node:test'), assert = require('node:assert/strict');
const { data } = require('./_html.cjs');
test('glossary entries resolve first lessons and bundled sources', () => {
  const entries = data('glossary-data'), lessons = data('curriculum');
  const ids = new Map(lessons.map((l, i) => [l.id, i])), sources = new Set(data('corpus-index').map((d) => d.id));
  assert.ok(entries.length >= 60);
  for (const entry of entries) {
    assert(ids.has(entry.firstLesson), entry.term + ' first lesson');
    assert(entry.sources.every((s) => sources.has(s)), entry.term + ' sources');
  }
});
