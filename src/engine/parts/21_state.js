/* ================================================== saving the simulated world === */
// The playground saves its world in the browser so a reload brings it back. State is plain data: the Sim's fields and each
// Cluster's fields (the only class instances in it). Files are saved on their own (fs.snapshot, FS_KEY); shells are not saved.
PG.STATE_V = 1;
PG.STATE_SKIP = new Set(['fs', 'fsRestored', 'listeners', 'waiters', 'timer', 'shells', 'notifyT', 'speed', 'lastTrace']);
PG.Sim.prototype.snapshotState = function () {
  const sim = {}; for (const [k, v] of Object.entries(this)) if (!PG.STATE_SKIP.has(k) && k !== 'clusters') sim[k] = v;
  const clusters = {}; for (const [k, c] of Object.entries(this.clusters)) { const o = {}; for (const [ck, cv] of Object.entries(c)) if (ck !== 'sim') o[ck] = cv; clusters[k] = o; }
  return JSON.parse(JSON.stringify({ v: PG.STATE_V, sim, clusters }));
};
// Returns false (and changes nothing) when the snapshot is from another version.
PG.Sim.prototype.restoreState = function (snap) {
  if (!snap || snap.v !== PG.STATE_V || !snap.sim || !snap.clusters) return false;
  for (const [k, v] of Object.entries(snap.sim)) this[k] = v;
  this.clusters = {};
  for (const [k, o] of Object.entries(snap.clusters)) { const c = new PG.Cluster(this, o); Object.assign(c, o); this.clusters[k] = c; }
  this.lastTrace = this.trace[this.trace.length - 1];
  return true;
};
if (typeof module !== 'undefined') module.exports = PG;
