// Every Kubernetes/Docker thing gets a kind: an icon, a colour family and a label, so a glance tells you what it is.
export const KINDS = {
  Node: { icon: 'M4 5h16v6H4zM4 13h16v6H4zM8 8h.01M8 16h.01', tone: 'compute' },
  Pod: { icon: 'M12 3 4 7.5v9L12 21l8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9', tone: 'compute' },
  Deployment: { icon: 'M12 3 3 8l9 5 9-5zM3 12.5l9 5 9-5M3 17l9 5 9-5', tone: 'compute' },
  ReplicaSet: { icon: 'M8 8h12v12H8zM4 16V4h12', tone: 'compute' },
  DaemonSet: { icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', tone: 'compute' },
  StatefulSet: { icon: 'M5 4h14v5H5zM5 11h14v5H5zM8 19h8', tone: 'compute' },
  Job: { icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12.5l3 3 5-6', tone: 'compute' },
  CronJob: { icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3.5 2', tone: 'compute' },
  Service: { icon: 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM12 3v4M12 17v4M3 12h4M17 12h4', tone: 'network' },
  Ingress: { icon: 'M3 12h13M12 7l5 5-5 5M21 4v16', tone: 'network' },
  ConfigMap: { icon: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6', tone: 'config' },
  Secret: { icon: 'M15 7.5a4 4 0 1 1-3.3 6.2L4 21v-3h3v-3h3l1.6-1.6A4 4 0 0 1 15 7.5z', tone: 'config' },
  PersistentVolumeClaim: { icon: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3', tone: 'config' },
  ServiceAccount: { icon: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6', tone: 'config' },
  Namespace: { icon: 'M4 7h6l2 2h8v10H4z', tone: 'neutral' },
  HorizontalPodAutoscaler: { icon: 'M4 16l5-5 4 4 7-8M15 7h5v5', tone: 'compute' },
  PodDisruptionBudget: { icon: 'M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z', tone: 'compute' },
  Container: { icon: 'M3 8l9-5 9 5v8l-9 5-9-5zM12 3v18M3 8l9 5 9-5', tone: 'compute' },
  Image: { icon: 'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M9 9.5h.01', tone: 'config' },
  Network: { icon: 'M12 5a2 2 0 1 0 0 .01M5 19a2 2 0 1 0 0 .01M19 19a2 2 0 1 0 0 .01M12 7v5M12 12l-6 5M12 12l6 5', tone: 'network' },
  Registry: { icon: 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01', tone: 'config' },
  Context: { icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z', tone: 'neutral' },
  Release: { icon: 'M12 3l2.4 5 5.6.8-4 3.9.9 5.6-4.9-2.6L7.1 18l.9-5.6-4-3.9 5.6-.8z', tone: 'compute' },
  Tiller: { icon: 'M12 3v4M5.6 5.6l2.8 2.8M3 12h4M5.6 18.4l2.8-2.8M12 17v4M15.6 15.6l2.8 2.8M17 12h4M15.6 8.4l2.8-2.8M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', tone: 'compute' },
  File: { icon: 'M7 3h7l5 5v13H7zM14 3v5h5', tone: 'neutral' },
  Folder: { icon: 'M4 7h6l2 2h8v10H4z', tone: 'neutral' },
  Event: { icon: 'M6 4h12v16l-6-3-6 3z', tone: 'neutral' },
};
export function KindIcon({ kind, size = 14 }) {
  const k = KINDS[kind] || KINDS.Pod;
  return <svg className="kico" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={k.icon} /></svg>;
}
// a small labelled badge: "▣ Deployment"
export function KindTag({ kind, label, size = 13 }) {
  const k = KINDS[kind] || KINDS.Pod;
  return <span className={'ktag t-' + k.tone} title={kind}><KindIcon kind={kind} size={size} /><span>{label || kind}</span></span>;
}
