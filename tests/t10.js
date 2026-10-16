const { PG, sim, run, stop } = require('./harness.js');
(async () => {
  await run('rm -rf /');
  await run('rm -rf ~; ls -a ~; pwd');
  await run('mkdir -p ~/cfg; echo a > ~/cfg/a.yaml; echo b > ~/cfg/b.yaml; echo c > ~/cfg/c.txt; ls ~/cfg/*.yaml; echo ~/cfg/?.txt');
  await run('rm ~/cfg/*.yaml; ls ~/cfg; echo "no match stays literal: *.zzz"; echo \'quoted *\'');
  await run('cd ~/cfg && rm -rf *; ls; pwd');
  await run('kubectl get pods -o jsonpath=\'{.items[*].metadata.name}\' 2>&1 | head -1');
  stop();
})();
