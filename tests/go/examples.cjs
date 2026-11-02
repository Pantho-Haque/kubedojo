'use strict';
const {test}=require('node:test'),{execFileSync}=require('node:child_process'),path=require('node:path');
test('all sixty examples retain their engine-computed output and trace facts',()=>{execFileSync(process.execPath,[path.join(__dirname,'check-examples.cjs')],{stdio:'pipe'});});
