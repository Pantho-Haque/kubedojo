const { PG, sim, run, stop } = require('./harness.js'); let bad = 0; const T = async (c, re) => { const o = await run(c, false); if (!re.test(o)) { bad++; console.log('FAIL', c, '\n', o); } };
(async () => {
  await T('gcloud container clusters list', /prod-1\s+asia-east1-a/);
  await T('kind delete cluster --name gke_prod-project_asia-east1-a_prod-1', /not a kind cluster, it is GKE/);
  await T('gcloud container clusters delete prod-1 --zone asia-east1-a', /add --quiet/);
  await T('gcloud container clusters delete prod-1 --quiet', /must be supplied/i);
  await T('gcloud container clusters delete nope --zone asia-east1-a --quiet', /404/);
  await T('kubectl delete cluster foo', /gcloud container clusters delete/);
  await T('gcloud container clusters delete prod-1 --zone asia-east1-a --quiet', /Deleted \[https/);
  await T('kubectl config get-contexts; gcloud container clusters list', /Listed 0 items|CURRENT/);
  console.log(Object.keys(sim.clusters).length === 0 ? 'cluster gone' : 'STILL THERE'); console.log(bad ? bad + ' failing' : 'gcloud checks pass'); stop(); process.exit(0);
})();
