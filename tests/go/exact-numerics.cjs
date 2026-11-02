'use strict';
require('./_html.cjs'); // serves the old src/ paths from gothik.html
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('src/go-interpreter.js','utf8'),context);
function output(code,expected){const result=context.GoInterpreter.run('package main\nimport "fmt"\nfunc main(){\n'+code+'\n}');assert.equal(result.error,undefined);assert.equal(result.states.at(-1).output,expected);}
test('all integer widths wrap correctly beyond JavaScript exact range',()=>{output('var x uint64 = 18446744073709551615\nx++\nvar y int64 = 9223372036854775807\ny++\nfmt.Println(x,y)','0 -9223372036854775808');output('var x int64 = -1\nfmt.Println(uint64(x))','18446744073709551615');});
test('integer multiplication and division preserve low bits',()=>{output('var x int64 = 9007199254740993\nfmt.Println(x*3, x/3, x%3)','27021597764222979 3002399751580331 0');});
test('arbitrary integer constants can be reduced before materialization',()=>{output('const x = 999999999999999999999999999999999999\nfmt.Println(x / 999999999999999999999999999999999999)','1');});
test('shift and bitwise operations retain 64-bit values',()=>{output('var x uint64 = 1\nx = x << 63\nfmt.Println(x, x >> 62, x | 3)','9223372036854775808 2 9223372036854775811');});
test('inferred variables reject unrepresentable constants',()=>{const result=context.GoInterpreter.run('package main\nfunc main(){x := 9223372036854775808; _ = x}');assert.match(result.error,/overflows int/);});
test('decimal constants are rational until assigned',()=>{output('const x = 0.1 + 0.2\nfmt.Println(x, x == 0.3)\nvar n int = 1.5 + 1.5\nfmt.Println(n)','0.3 true\n3');});
test('numeric bases, separators and exponents preserve values',()=>{output('fmt.Println(0xff,0b101,0o17,012,1_000,1e2,.5)','255 5 15 10 1000 100 0.5');});
test('materialization rejects default integer and float overflow',()=>{for(const literal of ['9223372036854775808','1e1000']){const result=context.GoInterpreter.run('package main\nimport "fmt"\nfunc main(){fmt.Println('+literal+')}');assert.match(result.error,/overflows/);}});
