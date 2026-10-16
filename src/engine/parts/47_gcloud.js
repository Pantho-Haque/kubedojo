/* ============================================== gcloud: just enough to manage the fake GKE cluster === */
/* A kind/k3d cluster is deleted with its own tool; the cloud cluster needs gcloud. */
PG.gkeParts = id => { const m = /^gke_([^_]+)_([^_]+)_(.+)$/.exec(id); return m ? { project: m[1], zone: m[2], name: m[3] } : null; };
PG.deleteCommandFor = cl => { if (cl.tool === 'kind') return `kind delete cluster --name ${cl.id.replace(/^kind-/, '')}`; if (cl.tool === 'k3d') return `k3d cluster delete ${cl.id.replace(/^k3d-/, '')}`; const g = PG.gkeParts(cl.id); return g ? `gcloud container clusters delete ${g.name} --zone ${g.zone} --quiet` : `# no delete command known for ${cl.id}`; };
PG.commands.gcloud = async (ctx, args) => {
  const sim = ctx.sim; const a = args.filter(x => !x.startsWith('-')); const flag = (n, d) => { const i = args.findIndex(x => x === n || x.startsWith(n + '=')); if (i < 0) return d; return args[i].includes('=') ? args[i].split('=')[1] : args[i + 1]; };
  if (args[0] === '--version' || a[0] === 'version') { ctx.println('Google Cloud SDK 498.0.0\nkubectl 1.33.5\ngke-gcloud-auth-plugin 0.5.9'); return 0; }
  if (a[0] !== 'container' || a[1] !== 'clusters') { ctx.eprintln('ERROR: (gcloud) this playground only knows: gcloud container clusters list | delete NAME [--zone Z] --quiet'); return 1; }
  const gkes = Object.values(sim.clusters).filter(c => c.tool === 'gke');
  if (a[2] === 'list') {
    if (!gkes.length) { ctx.eprintln('Listed 0 items.'); return 0; }
    ctx.println(PG.table(gkes.map(c => { const g = PG.gkeParts(c.id) || { name: c.id, zone: '-' }; return [g.name, g.zone, c.k8sVersion.replace(/^v/, ''), c.api.replace('https://', ''), 'e2-standard-4', c.k8sVersion.replace(/^v/, ''), String(c.nodes.length), 'RUNNING']; }), ['NAME', 'LOCATION', 'MASTER_VERSION', 'MASTER_IP', 'MACHINE_TYPE', 'NODE_VERSION', 'NUM_NODES', 'STATUS'])); return 0;
  }
  if (a[2] === 'delete') {
    const name = a[3]; if (!name) { ctx.eprintln('ERROR: (gcloud.container.clusters.delete) argument NAME [NAME ...]: Must be specified.'); return 1; }
    const cl = gkes.find(c => { const g = PG.gkeParts(c.id); return c.id === name || (g && g.name === name); });
    if (!cl) { ctx.eprintln(`ERROR: (gcloud.container.clusters.delete) ResponseError: code=404, message=Not found: projects/prod-project/zones/${flag('--zone', 'asia-east1-a')}/clusters/${name}.`); return 1; }
    const g = PG.gkeParts(cl.id); const zone = flag('--zone') || flag('--location');
    if (!zone) { ctx.eprintln('ERROR: (gcloud.container.clusters.delete) One of [--location, --region, --zone] must be supplied: Please specify location.'); return 1; }
    if (!args.includes('--quiet') && !args.includes('-q')) { ctx.println(`The following clusters will be deleted.\n - [${g.name}] in [${g.zone}]\n\nDo you want to continue (Y/n)?  `); ctx.eprintln('(the playground cannot answer prompts: add --quiet to say yes)'); return 1; }
    if (zone !== g.zone) { ctx.eprintln(`ERROR: (gcloud.container.clusters.delete) ResponseError: code=404, message=Not found: projects/${g.project}/zones/${zone}/clusters/${g.name}.`); return 1; }
    await ctx.delay(500); ctx.println(`Deleting cluster ${g.name}...done.`);
    sim.containers = sim.containers.filter(c => c.clusterId !== cl.entry); delete sim.clusters[cl.entry]; sim.removeKubeEntries(cl.entry); sim.forwards = sim.forwards.filter(f => f.cluster !== cl);
    ctx.println(`Deleted [https://container.googleapis.com/v1/projects/${g.project}/zones/${g.zone}/clusters/${g.name}].`); ctx.info('(playground: the kubeconfig entries for it were removed too; real gcloud leaves them behind, so you would clean them with kubectl config delete-context / delete-cluster / unset users.…)'); return 0;
  }
  ctx.eprintln('ERROR: (gcloud.container.clusters) supported here: list, delete'); return 1;
};
