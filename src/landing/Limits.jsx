import Section from './Section.jsx';

const MODELLED = ['Multi-node kind and k3d clusters, node failure and rescheduling', 'Deployments, rolling updates and rollbacks', 'Probes, init containers, sidecars, OOMKilled', 'HPA, PodDisruptionBudgets, drains', 'RBAC, ServiceAccounts, quotas, Pod Security', 'Ingress with ingress-nginx and Traefik', 'Helm 2 with Tiller, hooks, tests and rollback', 'docker build, run, exec, volumes and compose', 'A shell with pipes, heredocs, loops, vi, ls and tree'];
const NOT = ['Your own application code. An image built from your Dockerfile answers on its EXPOSEd port and does nothing else.', 'Registries beyond about 25 well-known Docker Hub images.', 'StatefulSets and PersistentVolumes.', 'CRDs and operators.', 'Real networking, real TLS and the internet.'];

export default function Limits() {
  return (
    <Section id="limits" no={10} label="tolerances" title="close to the real tools, and honest about the gaps.">
      <div className="two-col">
        <div><h3>within tolerance</h3><ul>{MODELLED.map(x => <li key={x}>{x}</li>)}</ul></div>
        <div><h3>out of scope</h3><ul>{NOT.map(x => <li key={x}>{x}</li>)}</ul></div>
      </div>
      <p className="after">The first run of an exported script on a real machine is the real test. Where the simulator is more forgiving than the real tools, the guides say so.</p>
    </Section>
  );
}
