import { Link } from 'react-router-dom';
import demos from './generated/demos.json';
import Section from './Section.jsx';
import { appIntent } from '../playground/loader.js';

const FACTS = [
  ['It reads the cluster, not your history.', 'The script is built from what exists in your current kubectl context: nodes with their labels and taints, namespaces, Deployments, Services, ConfigMaps, RBAC. A typo you made along the way is not in it.'],
  ['It will not touch another cluster.', 'Every step runs behind a guard that stops unless kubectl points at the new local kind or k3d cluster.'],
  ['It waits and it can be run twice.', 'Each Deployment is rolled out before the next step, and an existing cluster with the same name is reused.'],
  ['Secrets are your call.', 'They are included on request, with their values, and the header of the script says so.'],
];

export default function TakeItHome() {
  return (
    <Section id="real" no={8} label="export" title="test it here, then run it for real.">
      <div className="home-grid">
        <ul className="facts">{FACTS.map(([h, p]) => <li key={h}><strong>{h}</strong> {p}</li>)}</ul>
        <figure className="code-window">
          <figcaption><span>setup.sh</span><em>excerpt of a generated script</em></figcaption>
          <pre tabIndex={0}><code>{demos.script.excerpt}</code></pre>
        </figure>
      </div>
      <p className="after">The script above came from this session in the simulator: <code>kubectl create namespace shop</code>, a two-replica nginx Deployment and its Service, on a three-node kind cluster. <Link className="arrow-link" to="/app" {...appIntent}>open the playground and press the export icon</Link></p>
    </Section>
  );
}
