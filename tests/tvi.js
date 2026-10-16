const { PG, sim, sh, run, stop } = require('./harness.js');
const TOK = { Esc: 'Escape', CR: 'Enter', BS: 'Backspace', Tab: 'Tab', 'C-r': 'C-r', Del: 'Delete', Up: 'Up', Down: 'Down', Left: 'Left', Right: 'Right' };
const keys = s => { const o = []; for (let i = 0; i < s.length;) { const m = /^<([\w-]+)>/.exec(s.slice(i)); if (m && TOK[m[1]]) { o.push(TOK[m[1]]); i += m[0].length; } else o.push(s[i++]); } return o; };
const mk = (text, name = 'f.txt') => new PG.Vi({ text, name, write: (n, t) => { saved[n] = t; return null; }, rows: 10, cols: 40 });
let saved = {}, bad = 0;
const T = (label, text, ks, want, extra) => { const v = mk(text); for (const k of keys(ks)) v.key(k); const got = v.text(); if (got !== want || (extra && !extra(v))) { bad++; console.log('FAIL', label, '\n want', JSON.stringify(want), '\n got ', JSON.stringify(got), v.msg); } };
T('insert', '', 'ihello<Esc>', 'hello\n');
T('append+newline', 'a\n', 'Ab<CR>c<Esc>', 'ab\nc\n');
T('o/O', 'b\n', 'Oa<Esc>job2<Esc>', 'a\nb\nb2\n');
T('x', 'abc\n', 'lx', 'ac\n'); T('3x', 'abcdef\n', '3x', 'def\n'); T('X', 'abc\n', '$X', 'ac\n');
T('dd', 'a\nb\nc\n', 'jdd', 'a\nc\n'); T('2dd', 'a\nb\nc\n', '2dd', 'c\n'); T('dd last-only', 'a\n', 'dd', '');
T('dw', 'foo bar baz\n', 'dw', 'bar baz\n'); T('dw last word', 'foo bar\nnext\n', 'wdw', 'foo \nnext\n'); T('d2w', 'a b c d\n', 'd2w', 'c d\n');
T('cw', 'foo bar\n', 'cwxy<Esc>', 'xy bar\n'); T('cc', 'a\nb\n', 'ccz<Esc>', 'z\nb\n'); T('C', 'abcd\n', 'llCZ<Esc>', 'abZ\n'); T('D', 'abcd\n', 'lD', 'a\n');
T('yy p', 'a\nb\n', 'yyjp', 'a\nb\na\n'); T('yy P', 'a\nb\n', 'jyyP', 'a\nb\nb\n'); T('dd p', 'a\nb\nc\n', 'ddp', 'b\na\nc\n'); T('yw p', 'ab cd\n', 'ywwP', 'ab ab cd\n');
T('u', 'a\nb\n', 'ddu', 'a\nb\n'); T('undo insert', 'a\n', 'ixx<Esc>u', 'a\n'); T('redo', 'a\nb\n', 'dduu<C-r>', 'b\n'.replace('b', 'b'), v => true);
T('r', 'abc\n', 'rz', 'zbc\n'); T('3r', 'abcd\n', '3rz', 'zzzd\n'); T('J', 'a\n  b\n', 'J', 'a b\n'); T('~', 'ab\n', '~', 'Ab\n');
T('gg G', 'a\nb\nc\n', 'Gddggdd', 'b\n'); T('3G', 'a\nb\nc\n', '3Gx', 'a\nb\n\n'); T('0 $', 'abc\n', '$x0x', 'b\n'); T('w b e', 'ab cd ef\n', 'wwbex', 'ab c ef\n');
T('/ n', 'a\nfoo\nb\nfoo\n', '/foo<CR>nx', 'a\nfoo\nb\noo\n'); T('N', 'foo\nx\nfoo\n', 'G?foo<CR>x', 'oo\nx\nfoo\n');
T(':s', 'foo foo\nfoo\n', ':%s/foo/bar/g<CR>', 'bar bar\nbar\n'); T(':s once', 'foo foo\n', ':s/foo/bar/<CR>', 'bar foo\n'); T(':s group', 'ab\n', ':s/(a)(b)/\\2\\1/<CR>', 'ba\n');
T(':N', 'a\nb\nc\n', ':2<CR>x', 'a\n\nc\n'); T(':d', 'a\nb\nc\n', ':2d<CR>', 'a\nc\n'); T('backspace join', 'a\nb\n', 'ji<BS><Esc>', 'ab\n'); T('tab', '', 'i<Tab>x<Esc>', '\tx\n');
T('empty buffer text', 'a\n', 'dd', '');
let v = mk('x\n'); for (const k of keys('ia<Esc>:q<CR>')) v.key(k); if (v.done || !/E37/.test(v.msg)) { bad++; console.log('FAIL :q should refuse', v.msg); }
for (const k of keys(':q!<CR>')) v.key(k); if (!v.done) { bad++; console.log('FAIL :q!'); }
v = mk('x\n'); for (const k of keys('Ahi<Esc>:wq<CR>')) v.key(k); if (!v.done || saved['f.txt'] !== 'xhi\n') { bad++; console.log('FAIL :wq', saved); }
v = mk('x\n'); for (const k of keys('AZ<Esc>ZZ')) v.key(k); if (!v.done || saved['f.txt'] !== 'xZ\n') { bad++; console.log('FAIL ZZ'); }
v = mk('x\n'); for (const k of keys(':w g.txt<CR>')) v.key(k); if (saved['g.txt'] !== 'x\n' || !/written/.test(v.msg)) { bad++; console.log('FAIL :w name', v.msg); }
v = mk('x\n'); for (const k of keys(':bogus<CR>')) v.key(k); if (!/E492/.test(v.msg)) { bad++; console.log('FAIL E492'); }
v = new PG.Vi({ text: 'a\n', name: 'r.txt', readOnly: true, write: () => null }); for (const k of keys(':w<CR>')) v.key(k); if (!/readonly/.test(v.msg)) { bad++; console.log('FAIL readonly'); }
// scrolling + screen
v = mk(Array.from({ length: 30 }, (_, i) => 'line' + (i + 1)).join('\n') + '\n'); for (const k of keys('25G')) v.key(k); let sc = v.screen();
if (v.top !== 15 || sc.rows[sc.cursor.row] !== 'line25' || !/25,1/.test(sc.ruler)) { bad++; console.log('FAIL scroll', v.top, sc.cursor, sc.ruler); }
v = mk('a\tb\n'); sc = v.screen(); if (sc.rows[0] !== 'a       b') { bad++; console.log('FAIL tab expand', JSON.stringify(sc.rows[0])); }
v = mk(''); for (const k of keys('ia<Esc>')) v.key(k); sc = v.screen(); if (sc.rows[1] !== '~') { bad++; console.log('FAIL tilde'); }
// integration through the shell: vi file, with a fake terminal that scripts the keystrokes
(async () => {
  const term = sh.term; term.edit = async vi => { for (const k of keys(term.script)) vi.key(k); };
  term.script = 'ikey: value<CR>n: 1<Esc>:wq<CR>'; await run('mkdir -p /tmp/v; cd /tmp/v; vi new.yaml', false);
  let g = (await run('cat /tmp/v/new.yaml', false)).trim(); if (g !== 'key: value\nn: 1') { bad++; console.log('FAIL vi new file', JSON.stringify(g)); }
  term.script = ':%s/1/2/<CR>:x<CR>'; await run('vi new.yaml', false); g = (await run('cat new.yaml', false)).trim(); if (g !== 'key: value\nn: 2') { bad++; console.log('FAIL vi edit', JSON.stringify(g)); }
  term.script = 'x:q!<CR>'; await run('vi new.yaml', false); g = (await run('cat new.yaml', false)).trim(); if (g !== 'key: value\nn: 2') { bad++; console.log('FAIL :q! discards'); }
  g = await run('vi /tmp/v', false); if (!/is a directory/.test(g)) { bad++; console.log('FAIL dir', g); }
  term.script = ''; g = await run('nano x', false); if (!/not installed/.test(g)) { bad++; console.log('FAIL nano'); }
  console.log(bad ? bad + ' failing' : 'all vi checks pass'); stop();
})();
