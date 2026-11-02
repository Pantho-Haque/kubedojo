'use strict';
require('./_html.cjs'); // serves the old src/ paths from gothik.html
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const fixturePath='tests/differential/native-go.json';
test('at least 200 development-only native Go output goldens match the interpreter',{skip:!fs.existsSync(fixturePath)},()=>{const fixture=JSON.parse(fs.readFileSync(fixturePath,'utf8'));assert.ok(fixture.cases.length>=200);assert.equal(new Set(fixture.cases.map(program=>program.source)).size,fixture.cases.length);const context={};vm.createContext(context);for(const file of ['src/engine/checker.js','src/go-interpreter.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);for(const c of fixture.cases){const result=context.GoInterpreter.run(c.source);assert.equal(result.error,undefined,c.id);assert.equal(result.states.at(-1).output,c.expected,c.id);}});
