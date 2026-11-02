'use strict';
require('./_html.cjs'); // serves the old src/ paths from gothik.html
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('src/go-interpreter.js','utf8'),context);
function output(code,expected){const result=context.GoInterpreter.run('package main\nimport "fmt"\nfunc main(){\n'+code+'\n}');assert.equal(result.error,undefined);assert.equal(result.states.at(-1).output,expected);}
test('non-ASCII byte slicing preserves partial and complete UTF-8 sequences',()=>{output('s := "é"\nfmt.Println(len(s),s[:2],s[0],s[1])\nfmt.Printf("%q",s[:1])','2 é 195 169\n"\\xc3"');});
test('invalid UTF-8 bytes survive strings and range consumes one invalid byte',()=>{output('s := "\\xffA"\nfmt.Println(len(s),s[0])\nfor i,r := range s { fmt.Println(i,r) }','2 255\n0 65533\n1 65');});
test('byte and rune slice conversions distinguish storage units',()=>{output('s := "গো"\nb := []byte(s)\nr := []rune(s)\nfmt.Println(len(b),len(r),string(b),string(r))','6 2 গো গো');});
test('supplementary runes and raw strings encode consistently',()=>{output('s := `🦦`\nfmt.Println(len(s),len([]rune(s)),string(129446))','4 1 🦦');});
test('octal byte escapes, string copy and append byte spreads remain byte accurate',()=>{output('s:="\\377A";b:=make([]byte,2);copy(b,s);b=append(b,"Go"...);fmt.Printf("%x %q",b,string(b))','ff41476f "\\\\xffAGo"'.replace('\\\\x','\\x'));});
