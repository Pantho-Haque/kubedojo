const VERBS = ['get', 'describe', 'create', 'apply', 'delete', 'run', 'expose', 'scale', 'autoscale', 'set', 'label', 'annotate', 'taint', 'patch', 'rollout', 'logs', 'exec', 'port-forward', 'top', 'cordon', 'uncordon', 'drain', 'auth', 'config', 'cluster-info', 'version', 'api-resources', 'certificate', 'events', 'edit', 'wait', 'cp', 'debug', 'explain', 'replace'];
PG.complete = (sh, buf) => {
  const sim2 = sh.sim; const words = buf.split(/\s+/); const last = words[words.length - 1]; const first = words[0]; const idx = words.length - 1; const cands = [];
  const fsNames = () => { const base = last.includes('/') ? last.slice(0, last.lastIndexOf('/') + 1) : ''; const dir = sh.fs.norm(base || '.', sh.cwd); return sh.fs.isDir(dir) ? sh.fs.list(dir).map(n => base + n + (sh.fs.isDir((dir === '/' ? '' : dir) + '/' + n) ? '/' : '')) : []; };
  const cl = sim2.currentCluster();
  if (idx === 0) cands.push(...Object.keys(PG.commands), 'kc', 'k');
  else if (['kubectl', 'kc', 'k'].includes(first)) {
    const prev = words[idx - 1]; const verb = words.slice(1).find(w => !w.startsWith('-') && VERBS.includes(w));
    if (prev === '-n' || prev === '--namespace') cands.push(...(cl ? cl.res.namespaces.map(n => n.metadata.name) : []));
    else if (prev === '--context') cands.push(...sim2.kubeconfig.contexts.map(c => c.name));
    else if (prev === '-o') cands.push('wide', 'yaml', 'json', 'name', 'jsonpath=');
    else if (words.length === 2) cands.push(...VERBS);
    else if (verb === 'config' && words.length === 3) cands.push('view', 'current-context', 'get-contexts', 'use-context', 'set-context', 'set-credentials', 'rename-context', 'delete-context', 'delete-cluster', 'delete-user', 'get-clusters', 'get-users', 'unset');
    else if (verb === 'config' && ['use-context', 'delete-context', 'rename-context'].includes(words[2])) cands.push(...sim2.kubeconfig.contexts.map(c => c.name));
    else if (['get', 'describe', 'delete', 'label', 'annotate', 'patch', 'scale', 'autoscale', 'expose', 'set', 'top', 'rollout', 'port-forward', 'logs', 'exec'].includes(verb) && cl) {
      const argi = words.slice(1).filter(w => !w.startsWith('-')).length; // 1 = after verb
      if (verb === 'rollout' && argi === 2) cands.push('status', 'restart', 'history', 'undo');
      else if (argi <= 2 || (verb === 'rollout' && argi === 3)) { if (['logs', 'exec'].includes(verb)) cands.push(...cl.res.pods.filter(p => p.metadata.namespace === ((words[words.indexOf('-n') + 1]) || 'default')).map(p => p.metadata.name)); else cands.push(...Object.values(PG.KINDS).filter(k => !k.virtual || ['nodes', 'endpoints', 'events'].includes(k.names[1])).flatMap(k => [k.names[1], k.names[2]].filter(Boolean)), 'all'); }
      else { const t = PG.resolveKind(words.slice(1).filter(w => !w.startsWith('-'))[1]); if (t) { const nsv = words.includes('-n') ? words[words.indexOf('-n') + 1] : (sim2.ctxByName(sim2.kubeconfig.current) || {}).namespace || 'default'; cands.push(...(t === 'nodes' ? cl.nodes.map(n => n.name) : cl.res[t].filter(o => !PG.KINDS[t].ns || o.metadata.namespace === nsv || words.includes('-A')).map(o => o.metadata.name))); } }
    } else cands.push(...fsNames());
  }
  else if (first === 'docker') { if (words.length === 2) cands.push('ps', 'images', 'pull', 'build', 'tag', 'push', 'run', 'rm', 'stop', 'start', 'restart', 'exec', 'network', 'logs', 'info', 'system', 'rmi', 'inspect', 'cp', 'volume', 'compose', 'login', 'logout', 'search', 'stats', 'top', 'container', 'image'); else if (['stop', 'start', 'rm', 'exec', 'logs', 'restart', 'inspect', 'top', 'cp'].includes(words[1])) cands.push(...sim2.containers.map(c => c.name)); else cands.push(...fsNames()); }
  else if (first === 'kind') { if (words.length === 2) cands.push('create', 'delete', 'get', 'load', 'export', 'version'); else if (words.length === 3) cands.push(...({ create: ['cluster'], delete: ['cluster'], get: ['clusters', 'nodes', 'kubeconfig'], load: ['docker-image'], export: ['kubeconfig'] }[words[1]] || [])); else cands.push('--name', '--config', ...fsNames()); }
  else if (first === 'k3d') { if (words.length === 2) cands.push('cluster', 'node', 'image', 'registry', 'kubeconfig', 'version'); else if (words.length === 3) cands.push(...({ cluster: ['create', 'list', 'start', 'stop', 'delete'], node: ['create', 'list', 'delete'], image: ['import'], registry: ['list', 'delete'] }[words[1]] || [])); else cands.push('--servers', '--agents', '--port', '--registry-create', '--cluster', '--role'); }
  else if (first === 'helm2') { if (words.length === 2) cands.push('init', 'version', 'ls', 'install', 'upgrade', 'delete', 'status', 'history', 'rollback', 'get', 'lint', 'template', 'test', 'dependency', 'search', 'repo', 'create', 'package', 'fetch', 'inspect'); else if (['delete', 'status', 'history', 'rollback', 'test', 'get'].includes(words[1])) cands.push(...(cl ? Object.keys(cl.helm.releases) : []), 'values', 'manifest'); else cands.push('--name', '--namespace', '--set', '-f', '--wait', '--timeout', '--dry-run', '--debug', '--reuse-values', '--purge', ...fsNames()); }
  else if (first === 'sim') cands.push('help', 'load', 'crash', 'speed', 'images', 'time', 'reset');
  else cands.push(...fsNames());
  return { word: last, matches: [...new Set(cands)].filter(c => c.startsWith(last)).sort() };
};
