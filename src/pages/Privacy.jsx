import { metaFor } from '../site/meta.js';
import { usePageMeta } from '../components/usePageMeta.js';

export default function Privacy() {
  usePageMeta(metaFor('/privacy'));
  return (
    <div className="wrap text-page">
      <header className="page-head"><h1>Privacy</h1><p className="lede">There are no accounts and no cookies. The only data sent anywhere is cookie-free page-view analytics; nothing you type in the playground is uploaded.</p></header>
      <div className="body">
        <h2>What is stored in your browser</h2>
        <p>Small entries in local storage, created as you use the site:</p>
        <ul>
          <li><code>k8s-playground:fs:v1</code>: the virtual files you create in the playground (for example the Helm chart in <code>~/myapp</code>).</li>
          <li><code>k8s-playground:tour:v1</code>: a flag saying you have seen the guided tour.</li>
          <li><code>kd.dojo.state.v1</code> and <code>kd.dojo.term.v1.…</code>: the playground&apos;s simulated clusters and each terminal&apos;s history, so a reload brings you back where you were. Reset (↻) deletes them; <code>clear</code> deletes that terminal&apos;s history.</li>
          <li><code>kd.academy.…</code>: your Academy progress, quiz answers, and the Academy simulators&apos; saved sessions. The Academy&apos;s <a href="/academy/progress">My progress</a> page lists them and resets them.</li>
          <li><code>kubedojo:theme</code>: your light or dark choice, if you made one.</li>
          <li><code>trackima:v</code>, <code>trackima:s</code> and <code>trackima:x</code>: a random visitor id, the current visit, and page views waiting to be sent by the analytics described below.</li>
          <li><code>kubedojo:read</code> and <code>kubedojo:last</code>: which guides you finished and which one you were on, to show your progress.</li>
        </ul>
        <p>Clear them with your browser&apos;s “clear site data”, or press “Wipe all my files” in the playground&apos;s Files tab.</p>
        <h2>What the playground does not do</h2>
        <p>The simulated clusters, containers and commands exist only in this browser: in the page&apos;s memory and in the local storage entries above. Nothing you type is uploaded, and the playground cannot reach your computer, your Docker or any real cluster. The setup script it can generate is built locally, in the page, and downloaded by your browser.</p>
        <h2>Analytics</h2>
        <p>The site uses <a href="https://trackima.vercel.app">Trackima</a>, a cookie-free tracker, to count page views and see which parts of the site are used. It sends the page address, referrer and the random visitor id above to the site owner&apos;s own Trackima server, in batches, along with a few named events:</p>
        <ul>
          <li>Playground: which tools you used (kubectl, helm, docker, kind or k3d: the name only, never the command), the tour, resets, and opening, copying or downloading the setup script.</li>
          <li>Academy: lessons finished, quiz answers (right or wrong), challenges won, &quot;Set up and try&quot; and progress resets.</li>
          <li>Blog: posts read to the end, tags picked, and blog search words with the number of results.</li>
          <li>Elsewhere: buttons clicked on the home page, copy buttons, theme switches, missing pages and error messages if the simulator crashes.</li>
        </ul>
        <p>Nothing you type in a terminal or a file is sent. Clearing site data resets the visitor id.</p>
        <h2>Hosting</h2>
        <p>Whoever hosts this site may keep ordinary server logs (IP address, requested page, time). Apart from the analytics above, KubeDojo adds no third-party scripts, fonts or trackers.</p>
      </div>
    </div>
  );
}
