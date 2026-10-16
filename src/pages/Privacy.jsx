import { metaFor } from '../site/meta.js';
import { usePageMeta } from '../components/usePageMeta.js';

export default function Privacy() {
  usePageMeta(metaFor('/privacy'));
  return (
    <div className="wrap text-page">
      <header className="page-head"><h1>Privacy</h1><p className="lede">There are no accounts, no analytics and no cookies. Once a page has loaded, the playground makes no network requests.</p></header>
      <div className="body">
        <h2>What is stored in your browser</h2>
        <p>Four small entries in local storage, all created by you using the site, none sent anywhere:</p>
        <ul>
          <li><code>k8s-playground:fs:v1</code>: the virtual files you create in the playground (for example the Helm chart in <code>~/myapp</code>).</li>
          <li><code>k8s-playground:tour:v1</code>: a flag saying you have seen the guided tour.</li>
          <li><code>kubedojo:theme</code>: your light or dark choice, if you made one.</li>
          <li><code>kubedojo:read</code> and <code>kubedojo:last</code>: which guides you finished and which one you were on, to show your progress.</li>
        </ul>
        <p>Clear them with your browser&apos;s “clear site data”, or press “Wipe all my files” in the playground&apos;s Files tab.</p>
        <h2>What the playground does not do</h2>
        <p>The simulated clusters, containers and commands exist only in the page&apos;s memory. Nothing you type is uploaded, and the playground cannot reach your computer, your Docker or any real cluster. The setup script it can generate is built locally, in the page, and downloaded by your browser.</p>
        <h2>Hosting</h2>
        <p>Whoever hosts this site may keep ordinary server logs (IP address, requested page, time). KubeDojo itself adds no third-party scripts, fonts or trackers.</p>
      </div>
    </div>
  );
}
