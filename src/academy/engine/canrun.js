// Which lesson commands the Academy's Kubernetes lab can run, so "Set up and try" only appears where it works.
// Mirrors the lab's own parser (run() in k8slab-core.js). Used by the build (scripts/lib/academy.mjs), so no DOM here.
const KINDS = new Set(['po', 'pod', 'pods', 'deploy', 'deployment', 'deployments', 'svc', 'service', 'services', 'ing', 'ingress', 'ingresses', 'no', 'node', 'nodes', 'all', 'rs', 'replicaset', 'replicasets', 'events', 'ev']);
const DEPLOY = new Set(['deploy', 'deployment', 'deployments']);

export function labCanRun(line) {
  const l = line.replace(/\s+#.*$/, '').trim();
  if (!l || /[|<>;&$`\\]/.test(l)) return false; // pipes, redirects, and variables need a real shell
  const toks = l.match(/"[^"]*"|'[^']*'|\S+/g) || []; const a = [], f = {};
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.startsWith('--')) { const [k, v] = t.slice(2).split(/=(.*)/s); if (v === undefined && toks[i + 1] && !toks[i + 1].startsWith('-')) i++; f[k] = true; }
    else if (t === '-n' || t === '-o') i++;
    else if (t === '-w') continue;
    else if (t.startsWith('-')) return false; // -l, -A, -f …: not modelled by the lab
    else a.push(t);
  }
  const [tool, sub, x, y, z] = a; const [k, slashName] = (x || '').split('/');
  if (tool !== 'kubectl') return false;
  const named = slashName ? a.length === 3 : a.length === 4; // kind/name or kind name
  switch (sub) {
    case 'get': return KINDS.has(k) && a.length <= 4;
    case 'create': return DEPLOY.has(x) ? !!y && !!f.image : (x === 'ingress' || x === 'ing') ? !!y && !!f.rule : (x === 'namespace' || x === 'ns') && !!y;
    case 'expose': return DEPLOY.has(k) && named;
    case 'scale': return DEPLOY.has(k) && named && !!f.replicas;
    case 'set': return x === 'image' && DEPLOY.has((y || '').split('/')[0]) && /=/.test(z || '');
    case 'rollout': return ['undo', 'status', 'history'].includes(x) && DEPLOY.has((y || '').split('/')[0]);
    case 'delete': return KINDS.has(k) && k !== 'all' && named;
    case 'describe': return (k === 'pod' || k === 'po') && named;
    case 'logs': return a.length === 3;
    case 'drain': case 'cordon': case 'uncordon': return /^node-[123]$/.test(x || '');
    case 'config': return x === 'current-context';
    case 'version': return true;
    default: return false;
  }
}
