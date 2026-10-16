const { PG, sim, sh, out, stop } = require('./harness.js');
const BLOCKING = /port-forward|\bwatch\b| -w( |$|\n)|logs .* -f|--timeout=20s|drain local-cluster-1-worker|kubectl edit|^vi |^view /m;
(async () => {
  let problems = 0; let n = 0;
  for (const sec of PG.GUIDE) {
    console.log('\n######## ' + sec.t);
    for (const [label, cmd] of sec.items) {
      n++;
      // placeholders from the guide
      let c = cmd.replace('<pod-name>', 'PODNAME');
      if (/PODNAME/.test(c)) { const pods = sim.currentCluster() ? sim.currentCluster().res.pods.filter(p => p.metadata.namespace === 'web') : []; if (pods[0]) c = c.replace('PODNAME', pods[0].metadata.name); }
      out.length = 0;
      const p = (async () => { for (const line of c.split('\n')) await sh.submit(line); })();
      let done = false; p.then(() => done = true);
      // let simulated time pass for blocking commands
      for (let i = 0; i < 400 && !done; i++) { await new Promise(r => setTimeout(r, 5)); if (BLOCKING.test(c) && i > 120) { sh.abort(); } }
      if (!done) { sh.abort(); await p; }
      const text = out.join('\n');
      if (/rror|Forbidden|not found|refused|denied|timed out|invalid|No resources|unable/i.test(text)) { console.log('~ [' + sec.t.slice(0, 12) + '] ' + c.split('\n')[0].slice(0, 110) + '\n     => ' + text.split('\n').filter(l => /rror|Forbidden|not found|refused|denied|timed out|invalid|No resources|unable/i.test(l)).slice(0, 2).join(' | ').slice(0, 240)); }
      const flag = /internal error|not simulated|command not found|is not simulated|undefined|NaN|\[object/.test(text);
      if (flag) { problems++; console.log('!! [' + label + ']\n$ ' + c.split('\n')[0] + '\n' + text.slice(0, 700)); }
    }
  }
  console.log('\nran', n, 'guide items; flagged:', problems);
  stop();
})().catch(e => { console.error(e); process.exit(1); });
