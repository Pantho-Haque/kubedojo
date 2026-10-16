const { PG, sim, run, stop, sh } = require('./harness.js');
(async () => {
  await run('kind create cluster --name lab', false); await run('kubectl create namespace web', false); await run('kubectl create deployment web --image=nginx:1.27 -n web', false);
  const p = run('kubectl edit deployment web -n web');           // blocks, like the real thing
  await sim.wait(2, { aborted: false });
  const pe = sim.pendingEdit; console.log('banner would show:', pe && pe.title, '|', pe && pe.path);
  const txt = sim.fs.read(pe.path).replace('replicas: 1', 'replicas: 3'); sim.fs.write(pe.path, txt);   // user edits + Save in the Files tab
  pe.result = 'apply'; sim.wake();                               // user presses Apply
  console.log(await p);
  await run('kubectl get deploy web -n web');
  const p2 = run('kubectl edit deployment web -n web', false); await sim.wait(1, { aborted: false }); sim.pendingEdit.result = 'cancel'; sim.wake(); console.log(await p2);
  const p3 = run('kubectl edit deployment web -n web', false); await sim.wait(1, { aborted: false }); sh.abort(); console.log(await p3);   // Ctrl-C
  console.log('pendingEdit cleared:', sim.pendingEdit === null || sim.pendingEdit === undefined);
  stop();
})();
