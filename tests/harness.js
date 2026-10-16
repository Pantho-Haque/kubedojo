const PG = require('./.engine.cjs'); PG.fast = true; PG.resetHook = async () => {};
const sim = new PG.Sim(); sim.start(2, 1);
const out = []; const term = { print: (t, cls, raw) => out.push((cls === 'err' ? '' : '') + t), clear: () => { } };
const sh = new PG.Shell(sim, term); sim.shells.push(sh);
async function run(cmd, show = true) { out.length = 0; for (const line of cmd.split('\n')) { await sh.submit(line); } const text = out.join('\n'); if (show) console.log('$ ' + cmd.split('\n')[0] + (cmd.includes('\n') ? ' …' : '') + '\n' + text + '\n'); return text; }
module.exports = { PG, sim, sh, run, out, stop: () => sim.stop() };
