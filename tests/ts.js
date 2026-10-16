const { PG, sim, run, stop } = require('./harness.js');
(async () => {
  const T = async c => (await run(c, false)).trimEnd(); let bad = 0;
  const checks = [
    ['printf "a\\nb\\nc\\nd\\n" | sed -n "2,3p"', 'b\nc'], ['printf "a\\nb\\nc\\nd\\n" | sed -n "/b/,/c/p"', 'b\nc'], ['printf "a\\nb\\nc\\n" | sed "2d"', 'a\nc'],
    ['printf "foo\\nbar\\n" | sed "s/o/0/g"', 'f00\nbar'], ['printf "x\\ny\\nz\\n" | sed -e "1d" -e "s/y/Y/"', 'Y\nz'],
    ['printf "1\\n2\\n3\\n4\\n5\\n" | grep -A1 3', '3\n4'], ['printf "1\\n2\\n3\\n4\\n5\\n" | grep -B1 3', '2\n3'], ['printf "1\\n2\\n3\\n4\\n5\\n" | grep -C1 3', '2\n3\n4'], ['printf "a\\nb\\n" | grep -c a', '1'], ['printf "a\\nb\\n" | grep -v a', 'b'],
    ['echo "x=1" > /tmp/s.txt; sed -i "" "s/1/2/" /tmp/s.txt; cat /tmp/s.txt', 'x=2'],
  ];
  for (const [c, w] of checks) { const g = await T(c); if (g !== w) { bad++; console.log('FAIL', c, '\n want', JSON.stringify(w), '\n got ', JSON.stringify(g)); } }
  console.log(bad ? bad + ' failing' : 'all ' + checks.length + ' sed/grep checks pass');
  stop();
})();
