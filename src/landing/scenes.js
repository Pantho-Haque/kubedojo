// The story drawn on the home page: five "sheets", each a state of the same little cluster. Pods are always present in the drawing and
// are shown or hidden per sheet, so scrolling in either direction animates them in, out and between nodes.
export const NODES = [
  { id: 'cp', name: 'control-plane', role: 'control-plane' },
  { id: 'w1', name: 'worker', role: 'worker' },
  { id: 'w2', name: 'worker2', role: 'worker' },
];
export const PODS = [
  { id: 'web-a', w: 'web' }, { id: 'web-b', w: 'web' }, { id: 'web-c', w: 'web' }, { id: 'web-d', w: 'web' },
  { id: 'api-a', w: 'api' }, { id: 'api-b', w: 'api' },
];
// per sheet: where each pod runs and in what state; nodes that are down; the annotations
export const SHEETS = [
  { n: 1, title: 'cluster', rev: 'A', note: '3 nodes, nothing running', pods: {}, svc: false, down: [], callouts: [{ at: 'node', text: 'NODE: one machine of the cluster' }, { at: 'frame', text: 'CLUSTER: the boundary of everything below' }] },
  { n: 2, title: 'deploy', rev: 'B', note: '4 web pods, one Service', pods: { 'web-a': ['w1', 'Running'], 'web-b': ['w1', 'Running'], 'web-c': ['w2', 'Running'], 'web-d': ['w2', 'Running'] }, svc: true, down: [], callouts: [{ at: 'pod', text: 'POD: one running copy of the app' }, { at: 'svc', text: 'SERVICE: a stable address for the pods' }] },
  { n: 3, title: 'break', rev: 'C', note: 'api cannot pull its image', pods: { 'web-a': ['w1', 'Running'], 'web-b': ['w1', 'Running'], 'web-c': ['w2', 'Running'], 'web-d': ['w2', 'Running'], 'api-a': ['w1', 'ImagePullBackOff'], 'api-b': ['w2', 'ImagePullBackOff'] }, svc: true, down: [], callouts: [{ at: 'fail', text: 'ImagePullBackOff: image ngnix:1.27 not found', tone: 'bad' }] },
  { n: 4, title: 'lose a node', rev: 'D', note: 'worker lost, pods move', pods: { 'web-a': ['w2', 'Running'], 'web-b': ['w2', 'Running'], 'web-c': ['w2', 'Running'], 'web-d': ['w2', 'Running'], 'api-a': ['w2', 'ImagePullBackOff'], 'api-b': ['w2', 'ImagePullBackOff'] }, svc: true, down: ['w1'], callouts: [{ at: 'down', text: 'NotReady: node worker stopped answering', tone: 'bad' }] },
  { n: 5, title: 'take it home', rev: 'E', note: 'exported as setup.sh', pods: { 'web-a': ['w2', 'Running'], 'web-b': ['w2', 'Running'], 'web-c': ['w2', 'Running'], 'web-d': ['w2', 'Running'], 'api-a': ['w2', 'ImagePullBackOff'], 'api-b': ['w2', 'ImagePullBackOff'] }, svc: true, down: ['w1'], stamp: true, callouts: [] },
];
export const SCRIPT_LINES = ['#!/usr/bin/env bash', 'set -euo pipefail', 'guard() { … }', 'kind create cluster --name dojo', 'kubectl apply -f - <<EOF', '  kind: Deployment  # web x4', 'EOF', 'kubectl rollout status …'];

// geometry (viewBox 720 x 560)
export const G = { nodeY: 128, nodeW: 200, nodeH: 262, nodeX: [40, 260, 480], slot: 34, gap: 8, padX: 14, padY: 54, cols: 4, svc: { x: 360, y: 52 } };
export const slotPos = (nodeIdx, k) => ({ x: G.nodeX[nodeIdx] + G.padX + (k % G.cols) * (G.slot + G.gap), y: G.nodeY + G.padY + Math.floor(k / G.cols) * (G.slot + G.gap) });
// resolve a sheet into positioned pods
export function layout(sheet) {
  const count = { cp: 0, w1: 0, w2: 0 }; const out = [];
  for (const p of PODS) { const st = sheet.pods[p.id]; if (!st) { out.push({ ...p, on: false }); continue; } const [node, status] = st; const ni = NODES.findIndex(n => n.id === node); out.push({ ...p, on: true, node, status, ...slotPos(ni, count[node]++) }); }
  return out;
}
