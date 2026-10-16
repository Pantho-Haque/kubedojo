/* ============================================================ export a real script === */
/* Reads the cluster of the CURRENT kubectl context as it is right now (not the commands you typed) and writes a bash script that
   builds the same thing for real: a kind / k3d cluster with the same nodes, node labels and taints, then every user-made
   object applied from YAML. System objects, anything owned by a controller (pods of a Deployment, ReplicaSets, ...) and
   runtime state are left out: the controllers make them again. */
{
  const SYSTEM_NS = new Set(['kube-system', 'kube-public', 'kube-node-lease', 'local-path-storage', 'ingress-nginx']);
  const ORDER = ['namespaces', 'resourcequotas', 'serviceaccounts', 'secrets', 'configmaps', 'persistentvolumeclaims', 'clusterroles', 'clusterrolebindings', 'roles', 'rolebindings', 'networkpolicies', 'services', 'deployments', 'daemonsets', 'jobs', 'cronjobs', 'pods', 'ingresses', 'horizontalpodautoscalers', 'poddisruptionbudgets'];
  const SYS_SA = /^(default|coredns|kube-proxy|metrics-server|kindnet|local-path-provisioner-service-account|traefik|helm-traefik|ingress-nginx|ingress-nginx-admission|kube-dns|gke-.*|fluentbit-gke|.*-gke|svclb-.*)$/;
  const SYS_CR = /^(system:|kubeadm:|cluster-admin$|admin$|edit$|view$|kindnet|local-path|traefik|helm-|metrics-server|ingress-nginx|coredns|kube-|gke-|cloud-)/;
  const SYS_NS_KEEP = { serviceaccounts: n => !SYS_SA.test(n) }; // in kube-system only a few kinds can be yours (Tiller's account)
  const quote = s => /^[\w@%+=:,./-]+$/.test(s) ? s : "'" + String(s).replace(/'/g, "'\\''") + "'";
  const hostOf = img => { const first = String(img).split('/')[0]; return String(img).includes('/') && /[.:]|^localhost$/.test(first) ? first : null; };

  /* a kubectl-apply-able document for one object, without the fields the server fills in */
  const manifest = (cl, plural, o) => {
    const c = PG.cleanForOutput(cl, plural, o); delete c.status; const m = c.metadata || (c.metadata = {});
    for (const k of ['uid', 'resourceVersion', 'creationTimestamp', 'generation', 'selfLink', 'managedFields', 'ownerReferences']) delete m[k];
    if (m.annotations) { delete m.annotations['deployment.kubernetes.io/revision']; if (!Object.keys(m.annotations).length) delete m.annotations; }
    if (plural === 'namespaces') { if (m.labels) { delete m.labels['kubernetes.io/metadata.name']; if (!Object.keys(m.labels).length) delete m.labels; } if (c.spec && !Object.keys(c.spec).length) delete c.spec; }
    if (plural === 'services' && c.spec) { delete c.spec.clusterIP; delete c.spec.clusterIPs; if (!['NodePort', 'LoadBalancer'].includes(c.spec.type)) for (const p of c.spec.ports || []) delete p.nodePort; }
    if (plural === 'pods' && c.spec) delete c.spec.nodeName;
    if (plural === 'persistentvolumeclaims' && c.spec) delete c.spec.volumeName;
    if (c.spec && c.spec.template && c.spec.template.metadata) delete c.spec.template.metadata.creationTimestamp;
    if (plural === 'jobs' && c.spec) { delete c.spec.selector; const l = c.spec.template && c.spec.template.metadata && c.spec.template.metadata.labels; if (l) { delete l['controller-uid']; delete l['job-name']; if (!Object.keys(l).length) delete c.spec.template.metadata.labels; } }
    return PG.yaml.dump(c).replace(/\n$/, '');
  };

  /* o: {tool:'kind'|'k3d', name, waits, strict, secrets} -> {script, stats} */
  PG.buildScript = (sim, o = {}) => {
    const cl = sim.currentCluster(); const stats = { cluster: null, counts: {}, left: [], images: [], nodes: 0 };
    if (!cl) return { script: '# No cluster in the current kubectl context.\n# Create one (kind create cluster …, k3d cluster create …) or switch with: kubectl config use-context NAME\n', stats: { ...stats, empty: true } };
    const g = PG.gkeParts ? PG.gkeParts(cl.id) : null;
    const tool = o.tool || (cl.tool === 'k3d' ? 'k3d' : 'kind');
    const defName = cl.tool === 'gke' ? 'local-' + (g ? g.name : cl.id) : cl.id.replace(/^(kind|k3d)-/, '');
    const name = String(o.name || defName).replace(/[^\w.-]/g, '-');
    const opt = { tool, name, waits: o.waits !== false, strict: o.strict !== false, secrets: o.secrets !== false };
    stats.cluster = `${cl.tool} ${cl.id} → ${tool} ${name}`; stats.defaults = { tool: cl.tool === 'k3d' ? 'k3d' : 'kind', name: defName };
    const ctxName = (tool === 'kind' ? 'kind-' : 'k3d-') + name;

    /* ---- nodes: same count, roles, labels, taints ---- */
    const cps = cl.nodes.filter(n => n.role === 'control-plane'), ws = cl.nodes.filter(n => n.role !== 'control-plane'); stats.nodes = cl.nodes.length;
    const newName = (role, idx) => tool === 'kind' ? `${name}-${role === 'control-plane' ? 'control-plane' : 'worker'}${idx ? idx + 1 : ''}` : `k3d-${name}-${role === 'control-plane' ? 'server' : 'agent'}-${idx}`;
    const nodeMap = new Map(); cps.forEach((n, i) => nodeMap.set(n.name, newName('control-plane', i))); ws.forEach((n, i) => nodeMap.set(n.name, newName('worker', i)));
    const ports = []; for (const c of sim.containers.filter(x => x.clusterId === cl.entry)) for (const p of c.ports || []) if (p.container !== 6443 && (c.kind === 'node' || /-serverlb$/.test(c.name))) ports.push({ host: p.host, container: p.container, role: /worker|agent/.test(c.name) ? 'worker' : 'control-plane' });
    const keepLabel = k => !k.includes('/') || !/(^|\.)(kubernetes\.io|k8s\.io|k3s\.io|google\.com|gke\.io)$/.test(k.split('/')[0]);
    const keepTaint = k => !/^(node-role\.kubernetes\.io\/|node\.kubernetes\.io\/|node\.cloudprovider\.kubernetes\.io\/|cloud\.google\.com\/)/.test(k);

    const body = []; const sec = t => body.push('', `# ---- ${t} ----`);
    /* 1. the cluster */
    sec('the cluster');
    if (tool === 'kind') {
      const lines = ['kind: Cluster', 'apiVersion: kind.x-k8s.io/v1alpha4', 'nodes:'];
      const roles = [...cps.map(() => 'control-plane'), ...ws.map(() => 'worker')]; if (!cps.length) roles.unshift('control-plane'); const seen = new Set(); // a managed (GKE-like) source has no control-plane node of its own
      roles.forEach(r => { lines.push(`- role: ${r}`); if (!seen.has(r)) { seen.add(r); const mine = ports.filter(p => p.role === r); if (mine.length) { lines.push('  extraPortMappings:'); for (const p of mine) lines.push(`  - containerPort: ${p.container}`, `    hostPort: ${p.host}`, '    protocol: TCP'); } } });
      body.push(`cat > "\${LAB}/kind-config.yaml" <<'PG_EOF'\n${lines.join('\n')}\nPG_EOF`);
      body.push(`if kind get clusters 2>/dev/null | grep -qx ${quote(name)}; then echo "kind cluster ${name} already exists, reusing it"; else kind create cluster --name ${quote(name)} --config "\${LAB}/kind-config.yaml"; fi`);
    } else {
      const flags = [`--servers ${Math.max(1, cps.length)}`, `--agents ${ws.length}`, ...ports.map(p => `--port "${p.host}:${p.container}@loadbalancer"`)];
      body.push(`if k3d cluster list ${quote(name)} >/dev/null 2>&1; then echo "k3d cluster ${name} already exists, reusing it"; else k3d cluster create ${quote(name)} ${flags.join(' ')}; fi`);
    }
    body.push(`kubectl config use-context ${ctxName}`, 'guard', 'kubectl wait --for=condition=Ready nodes --all --timeout=300s');
    /* 2. node labels / taints */
    const nodeCmds = [];
    for (const n of cl.nodes) {
      const nn = nodeMap.get(n.name); const labs = Object.entries(n.labels || {}).filter(([k]) => keepLabel(k));
      if (labs.length) nodeCmds.push(`kubectl label node ${nn} ${labs.map(([k, v]) => quote(`${k}=${v}`)).join(' ')} --overwrite`);
      for (const t of n.taints || []) if (keepTaint(t.key)) nodeCmds.push(`kubectl taint nodes ${nn} ${quote(`${t.key}=${t.value || ''}:${t.effect}`)} --overwrite`);
    }
    if (nodeCmds.length) { sec('node labels and taints'); body.push(...nodeCmds); }
    /* 3. add-ons that came from a URL (the playground knows these two) */
    const hasDep = (ns, n) => !!cl.find('deployments', n, ns);
    if (tool === 'kind' && cl.tool !== 'gke' && (cl.res.namespaces || []).some(n => n.metadata.name === 'ingress-nginx')) { sec('ingress-nginx'); body.push('kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml', 'kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=180s || echo "WARNING: ingress-nginx was not ready in time, continuing"'); }
    if (tool === 'kind' && cl.tool === 'kind' && hasDep('kube-system', 'metrics-server')) { sec('metrics-server'); body.push('kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml', `kubectl patch -n kube-system deployment metrics-server --type=json -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'`); }

    /* 4. the objects */
    const docs = {}; const images = new Set(); let left = 0;
    const take = (plural, ob) => {
      const m = ob.metadata; const ns = m.namespace; const nm = m.name;
      if (m._owner) return false;
      if (ns && SYSTEM_NS.has(ns)) { const keep = SYS_NS_KEEP[plural]; if (!keep || !keep(nm)) return false; }
      if (plural === 'namespaces' && (SYSTEM_NS.has(nm) || nm === 'default')) return false;
      if (plural === 'serviceaccounts' && nm === 'default' && !(ob.imagePullSecrets || []).length) return false;
      if ((plural === 'clusterroles' || plural === 'clusterrolebindings') && SYS_CR.test(nm)) return false;
      if (plural === 'secrets' && (/service-account-token|helm\.sh\/release/.test(ob.type || '') || !opt.secrets)) return false;
      if (plural === 'configmaps' && (nm === 'kube-root-ca.crt' || (m.labels && m.labels.OWNER === 'TILLER'))) return false;
      if (plural === 'services' && ns === 'default' && nm === 'kubernetes') return false;
      return true;
    };
    for (const plural of ORDER) for (const ob of cl.res[plural] || []) {
      if (!take(plural, ob)) { left++; continue; }
      (docs[plural] = docs[plural] || []).push({ o: ob, y: manifest(cl, plural, ob) }); const k = PG.KINDS[plural].kind; stats.counts[k] = (stats.counts[k] || 0) + 1;
      const ps = ob.spec && (ob.spec.template ? ob.spec.template.spec : plural === 'pods' ? ob.spec : ob.spec.jobTemplate ? ob.spec.jobTemplate.spec.template.spec : null); if (ps) for (const c of [...(ps.containers || []), ...(ps.initContainers || [])]) images.add(c.image);
    }
    const csr = (cl.res.certificatesigningrequests || []).length; if (csr) stats.left.push(`${csr} certificate signing request(s): users and certificates are not recreated`);
    const tiller = cl.find('deployments', 'tiller-deploy', 'kube-system'); let tillerSa = null; if (tiller) { const sa = tiller.spec.template.spec.serviceAccountName; tillerSa = sa && sa !== 'default' ? sa : ''; stats.helm = true; }
    sec('your objects (applied in dependency order)');
    for (const plural of ORDER) {
      if (!docs[plural]) continue; const k = PG.KINDS[plural].kind;
      body.push(`# ${k}${docs[plural].length > 1 ? 's' : ''}`, 'guard', `kubectl apply -f - <<'PG_EOF'\n${docs[plural].map(d => d.y).join('\n---\n')}\nPG_EOF`);
      if (tiller && plural === (docs.clusterrolebindings ? 'clusterrolebindings' : docs.rolebindings ? 'rolebindings' : 'serviceaccounts') && !stats.tillerDone) { body.push(`helm2 init ${tillerSa ? '--service-account ' + tillerSa + ' ' : ''}--wait`); stats.tillerDone = true; }
    }
    if (tiller && !stats.tillerDone) body.push('guard', `helm2 init ${tillerSa ? '--service-account ' + tillerSa + ' ' : ''}--wait`);
    /* 5. waits */
    if (opt.waits) { const w = []; for (const plural of ['deployments', 'daemonsets']) for (const d of docs[plural] || []) { const m = d.o.metadata; if (plural === 'deployments' && d.o.spec.replicas === 0) continue; w.push(`kubectl rollout status ${plural === 'deployments' ? 'deployment' : 'daemonset'}/${m.name} -n ${m.namespace || 'default'} --timeout=300s || echo "WARNING: ${m.name} was not ready in time, continuing"`); } if (w.length) { sec('wait until they are ready'); body.push(...w); } }
    sec('look at the result'); body.push('kubectl get nodes -o wide', 'kubectl get pods -A');

    stats.left.unshift(`${left} system or controller-made object(s): the cluster makes those itself`);
    stats.images = [...images].filter(Boolean); const foreign = stats.images.filter(i => hostOf(i)); const local = foreign.filter(i => /^(localhost|k3d-|kind-registry)/.test(hostOf(i)));
    const notes = [];
    if (cl.tool === 'gke') notes.push('Source was the simulated PRODUCTION cluster: this builds a local copy of its workloads, not a real GKE cluster.');
    if (local.length) notes.push(`These images come from a registry that only existed in the simulator: push them there first, or change the image names: ${local.join(', ')}`);
    else if (foreign.length) notes.push(`Images from outside Docker Hub (the machine must be able to pull them): ${foreign.join(', ')}`);
    if (opt.secrets && (docs.secrets || []).length) notes.push('Secrets are included with their values.');
    if (stats.helm) notes.push('Helm releases are applied as plain objects (release history is not recreated). Tiller needs the helm2 binary.');

    const head = [
      '#!/usr/bin/env bash',
      `# Generated by the KubeDojo from the cluster in context ${cl.entry} (${cl.tool}): ${Object.entries(stats.counts).map(([k, v]) => v + ' ' + k).join(', ') || 'no user objects'}.`,
      '# READ IT BEFORE RUNNING: it creates a real Docker-based cluster, deploys into it, and writes under $LAB (default ~/k8s-lab).',
      ...notes.map(n => '# NOTE: ' + n),
      opt.strict ? 'set -euo pipefail' : 'set -uo pipefail',
      'LAB="${LAB:-$HOME/k8s-lab}"',
      'need() { command -v "$1" >/dev/null 2>&1 || { echo "missing tool: $1  ($2)"; exit 1; }; }',
      'need docker "install Docker Desktop and start it"', `need ${tool} "brew install ${tool}"`, 'need kubectl "brew install kubectl"', ...(stats.helm ? ['need helm2 "Helm v2 binary, installed under the name helm2"'] : []),
      'docker info >/dev/null 2>&1 || { echo "Docker is not running"; exit 1; }',
      '# never apply anything unless kubectl points at the new local cluster',
      `guard() { local c; c="$(kubectl config current-context 2>/dev/null || true)"; [ "$c" = "${ctxName}" ] || { echo "refusing to run: current kubectl context is '$c', expected ${ctxName}"; exit 1; }; }`,
      'mkdir -p "$LAB"',
    ];
    const foot = ['', 'echo "done."', '', '# To remove it again:', tool === 'kind' ? `#   kind delete cluster --name ${name}` : `#   k3d cluster delete ${name}`, ''];
    return { script: [...head, ...body, ...foot].join('\n'), stats };
  };
  PG.commands['export-script'] = async ctx => { if (PG.openExport) PG.openExport(); else ctx.println(PG.buildScript(ctx.sim).script); };
}
