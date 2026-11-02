'use strict';
require('./_html.cjs'); // serves the old src/ paths from gothik.html
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('src/go-interpreter.js','utf8'),c);
test('stdout and stderr remain separate and preserve newlines',()=>{const result=c.GoInterpreter.run('package main\nimport "fmt"\nfunc main(){fmt.Println("out");println("err")}');assert.equal(result.stdout,'out\n');assert.equal(result.stderr,'err\n');assert.equal(result.exitStatus,0);});
test('runtime panic has Go-style wording, goroutine block and exit status',()=>{const result=c.GoInterpreter.run('package main\nfunc main(){a:=[]int{1};_=a[5]}');assert.match(result.stderr,/panic: runtime error: index out of range \[5\] with length 1\n\ngoroutine 1 \[running\]:/);assert.match(result.stderr,/main.main\(\)[\s\S]*exit status 2/);assert.equal(result.exitStatus,2);});
