import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../site/site.js';
import { appIntent } from '../playground/loader.js';
import Drawing from './Drawing.jsx';

const KIND2 = ["cat > kind.yaml <<'EOF'", 'kind: Cluster', 'apiVersion: kind.x-k8s.io/v1alpha4', 'nodes:', '- role: control-plane', '- role: worker', '- role: worker', 'EOF'];
const CREATE = [...KIND2, 'kind create cluster --name dojo --config kind.yaml'];
const run = cmds => `/app?run=${encodeURIComponent(JSON.stringify(cmds))}&notour=1`;
const STEPS = [
  { name: 'cluster', title: 'One command, three nodes.', text: 'kind builds a cluster whose nodes are Docker containers. This drawing is what the simulator builds for you: a control-plane node and two workers, ready and empty.', code: ['kind create cluster --name dojo --config kind.yaml'], run: CREATE },
  { name: 'deploy', title: 'Deploy, and watch it fill.', text: 'A Deployment asks for four copies of the app. The scheduler places the pods on the workers, and a Service gives them a single address.', code: ['kubectl create deployment web --image=nginx:1.27 --replicas=4', 'kubectl expose deployment web --port=80'], run: [...CREATE, 'kubectl create deployment web --image=nginx:1.27 --replicas=4', 'kubectl expose deployment web --port=80', 8, 'kubectl get pods -o wide'] },
  { name: 'break', title: 'Break it on purpose.', text: 'One typo in an image name and two pods never start. The Events say exactly why. Fix the name and the Deployment replaces them by itself.', code: ['kubectl create deployment api --image=ngnix:1.27 --replicas=2', 'kubectl describe pod -l app=api'], run: [...CREATE, 'kubectl create deployment api --image=ngnix:1.27 --replicas=2', 8, 'kubectl get pods'] },
  { name: 'lose a node', title: 'Lose a machine.', text: 'Stop a node and Kubernetes starts its pods again on the nodes that are left. In kind a node is a Docker container, so this is a real failure, not a mock.', code: ['docker stop dojo-worker'], run: [...CREATE, 'kubectl create deployment web --image=nginx:1.27 --replicas=4', 10, 'docker stop dojo-worker', 40, 'kubectl get pods -o wide'] },
  { name: 'take it home', title: 'Take it home.', text: 'When it works, export it. A script rebuilds this cluster with kind or k3d on your computer, and refuses to run against any other cluster of yours.', code: [], run: null },
];

/* The home page's opening: the headline, then five "sheets" scrolling past while one drawing on the right changes to match. On a phone each
   sheet carries its own copy of the drawing instead. */
export default function Story() {
  const [active, setActive] = useState(0); const refs = useRef([]);
  useEffect(() => {
    if (!matchMedia('(min-width: 981px)').matches) return;
    const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) setActive(Number(e.target.dataset.step)); }, { rootMargin: '-42% 0px -42% 0px' }); // a thin band across the middle of the screen
    refs.current.forEach(el => el && io.observe(el)); return () => io.disconnect();
  }, []);
  return (
    <section className="story" aria-label="How KubeDojo works, in five sheets">
      <div className="wrap story-grid">
        <div className="story-text">
          <div className="hero" ref={el => { refs.current[0] = el; }} data-step="0">
            <p className="kicker">a simulator for kind, k3d, docker, kubectl and helm 2</p>
            <h1>practice kubernetes on a cluster you can&apos;t break.</h1>
            <p className="hero-sub">Type real commands, watch the cluster react, then export what you built as a setup script for your own machine. Everything runs in this page: no account, no install, no network calls.</p>
            <div className="hero-cta"><Link to="/app" className="btn btn-primary" {...appIntent}>{SITE.app.label}</Link><Link to="/blog" className="btn">Read the guides</Link></div>
            <p className="hero-note">scroll: the drawing on the right is the simulator&apos;s own cluster, one sheet at a time.</p>
          </div>
          <div className="step-fig mobile-only"><Drawing step={0} /></div>
          {STEPS.map((s, i) => (
            <article className="step" key={s.name} data-step={i} ref={el => { if (i > 0) refs.current[i] = el; }}>
              <p className="step-no">sheet {String(i + 1).padStart(2, '0')} / {s.name}</p>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
              {s.code.length > 0 && <pre className="step-code" tabIndex={0}><code>{s.code.map(c => '$ ' + c).join('\n')}</code></pre>}
              {s.run ? <Link className="arrow-link" to={run(s.run)} {...appIntent}>run this in the playground <span aria-hidden="true">→</span></Link> : <Link className="arrow-link" to="/app" {...appIntent}>open the playground and press the export icon <span aria-hidden="true">→</span></Link>}
              {i > 0 && <div className="step-fig mobile-only"><Drawing step={i} /></div>}
            </article>
          ))}
        </div>
        <div className="story-fig" aria-hidden="false"><div className="sticky"><Drawing step={active} crosshair /></div></div>
      </div>
    </section>
  );
}
