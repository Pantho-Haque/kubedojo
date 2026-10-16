const { PG, sim, run, stop, sh, out } = require('./harness.js');
(async () => {
  const T = async (cmd) => (await run(cmd, false)).trimEnd();
  const checks = [
    ['echo a b c | awk \'{print $2}\'', 'b'],
    ['printf "x:1\\ny:2\\n" | awk -F: \'{print $1, $2}\'', 'x 1\ny 2'],
    ['printf "1\\n2\\n3\\n" | awk \'{s+=$1} END {print s}\'', '6'],
    ['printf "a 1\\nb 2\\nc 3\\n" | awk \'NR>1 {print $1}\'', 'b\nc'],
    ['printf "web 1\\ndb 2\\n" | awk \'/web/ {print $2}\'', '1'],
    ['echo "a,b,c" | cut -d, -f2', 'b'], ['echo "a,b,c" | cut -d, -f1,3', 'a,c'],
    ['echo hi | tee /tmp/tee.txt; cat /tmp/tee.txt', 'hi\nhi'],
    ['echo "a b c" | xargs -n1 echo item', 'item a\nitem b\nitem c'],
    ['i=3; echo $((i*2+1))', '7'], ['x=$((5>3)); echo $x', '1'],
    ['if [ 3 -gt 2 ]; then echo yes; else echo no; fi', 'yes'],
    ['if [ -f /nonexistent ]; then echo y; elif [ -d /tmp ]; then echo dir; else echo n; fi', 'dir'],
    ['n=0; while [ $n -lt 3 ]; do echo n=$n; n=$((n+1)); done', 'n=0\nn=1\nn=2'],
    ['for i in 1 2 3; do if [ $i -eq 2 ]; then echo two; else echo $i; fi; done', '1\ntwo\n3'],
    ['mkdir -p /tmp/ff/sub; echo x > /tmp/ff/a.yaml; echo y > /tmp/ff/sub/b.yaml; find /tmp/ff -name "*.yaml"', '/tmp/ff/a.yaml\n/tmp/ff/sub/b.yaml'],
    ['alias ll="ls -la"; alias ll', "alias ll='ls -la'"],
    ['echo \'{"a":{"b":[1,2,3]},"items":[{"n":"x","v":1},{"n":"y","v":2}]}\' | jq -r ".items[] | select(.v > 1) | .n"', 'y'],
    ['echo \'{"items":[{"n":"x"},{"n":"y"}]}\' | jq -c "[.items[] | .n]"', '["x","y"]'],
    ['echo \'{"items":[{"n":"x","v":1}]}\' | jq -c ".items[] | {name: .n, val: .v}"', '{"name":"x","val":1}'],
    ['printf "b\\na\\nb\\n" | sort | uniq -c', '   1 a\n   2 b'],
    ['date +%Y-%m-%d', '2026-10-14'],
  ];
  let bad = 0;
  for (const [cmd, want] of checks) { const got = await T(cmd); if (got !== want) { bad++; console.log('FAIL:', cmd, '\n  want:', JSON.stringify(want), '\n  got: ', JSON.stringify(got)); } }
  console.log(bad ? bad + ' failing' : 'all ' + checks.length + ' shell-tool checks pass');
  // watch + ctrl-c
  const p = run('watch -n 1 echo tick', false); await sim.wait(3.5, { aborted: false }); sh.abort(); await p; console.log('watch ok');
  // kubectl -o json | jq
  await run('kind create cluster --name lab', false); await run('kubectl create namespace web', false); await run('kubectl create deployment web --image=nginx:1.27 -n web', false);
  await run('kubectl get deploy -n web -o json | jq -r ".items[].metadata.name"');
  await run('kubectl get pods -A --no-headers | awk \'{print $1}\' | sort -u');
  stop();
})().catch(e => { console.error(e); process.exit(1); });
