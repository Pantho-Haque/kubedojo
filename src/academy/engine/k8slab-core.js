// GENERATED ONCE from the tutorial prototype's Kubernetes lab, then owned here. The Academy's own Kubernetes engine:
// separate from the playground's (src/engine). `root` is a shadow root holding k8slab.html; `T` tracks timers so the
// lab can be stopped; opts.hash ('#play' | '#yaml' | '') picks the starting tab.
/* eslint-disable */
export function labCore(root, opts, T) {

const NS='http://www.w3.org/2000/svg';
const $=id=>root.getElementById(id);
const NODE_X=[200,460,720];
const AT={client:[100,210],api:[300,88],etcd:[490,88],sched:[680,88],ctrl:[865,88],svc:[580,210],ing:[580,159],inet:[100,402],node:i=>[NODE_X[i-1]+120,262]};
const ING_DEFAULT=['Ingress · myapp.local','/ → Service web    /api → Service api    (needs an ingress controller running as pods)'];
let gen=0,labSvcPos={};
const HL_IDS=['client','api','etcd','sched','ctrl','svc','ing','node1','node2','node3','a-kubectl','a-svc','a-ing'];
const SVC_SUB={
  default:'one stable name + IP · kube-proxy sends each request to a Running & Ready pod on ANY node',
  ClusterIP:'type: ClusterIP · 10.96.0.12:80 · reachable only from INSIDE the cluster',
  NodePort:'type: NodePort · every node opens port 30080 and forwards to the pods (Docker Desktop: localhost:30080)',
  LoadBalancer:'type: LoadBalancer · cloud hands you an external IP 203.0.113.9 (Docker Desktop fakes one on localhost)'};
let state,current=0,timers=[],autoplay=null;
const podEls=new Map();

function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
function text(p,x,y,s,cls){const t=el('text',{x,y,class:cls||''},p);t.textContent=s;return t;}
function chip(p,x,y,w,s){el('rect',{class:'chip',x,y,width:w,height:18},p);text(p,x+8,y+13,s,'chiptext');}
function at(ms,fn){timers.push(T.setTimeout(fn,ms));}

function drawNodes(){
  NODE_X.forEach((x,i)=>{
    const g=el('g',{id:'node'+(i+1),class:'node'},$('nodes'));
    g.onclick=()=>{if(mode==='play')run(lab.dead.includes(i+1)?`kubectl uncordon node-${i+1}`:`kubectl drain node-${i+1}`);};
    el('rect',{class:'box',x,y:250,width:240,height:335},g);
    text(g,x+14,275,'node-'+(i+1),'label');
    text(g,x+14,291,'','sub').id='nsub'+(i+1);
    const st=text(g,x+226,275,'Ready','ok');st.setAttribute('text-anchor','end');st.id='nstat'+(i+1);
    const np=text(g,x+226,291,'','warn');np.setAttribute('text-anchor','end');np.id='np'+(i+1);
    chip(g,x+14,302,62,'kubelet');chip(g,x+84,302,78,'kube-proxy');chip(g,x+170,302,56,'runtime');
  });
}

function shoot(from,to,color,delay,dur){
  const g=gen;
  at(delay||0,()=>{
    if(g!==gen||!from||!to)return;
    const c=el('circle',{r:6,fill:color,class:'packet'},$('packets'));c.style.color=color;
    const m=el('animateMotion',{path:`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`,dur:(dur||800)+'ms',begin:'indefinite',fill:'freeze'},c);
    m.beginElement();
    at((dur||800)+80,()=>c.remove());
  });
}
const pod=id=>state.pods.find(p=>p.id===id);
const podCenter=p=>{const [x,y]=podPos(p);return [x+50,y+20];};
function podPos(p){
  if(p.node==null){const idx=state.pods.filter(q=>q.node==null).indexOf(p);if(state.services)return [30,[250,296,342,440,486,532][Math.min(idx,5)]];return [430+idx*110,138];}
  const idx=state.pods.filter(q=>q.node===p.node).indexOf(p);
  return [NODE_X[p.node-1]+15+(idx%2)*110,335+Math.floor(idx/2)*54];
}
const ST={pending:'Pending',running:'Running',unready:'Running · Ready 0/1',crash:'CrashLoopBackOff',dead:'Lost',done:'Completed',term:'Terminating'};

function render(){
  for(let i=1;i<=3;i++){
    const dead=state.dead.includes(i),dim=(state.only1&&i>1)||state.hidden.includes(i),full=state.full.includes(i);
    $('node'+i).classList.toggle('dead',dead);$('node'+i).style.opacity=dim?.15:1;
    const s=$('nstat'+i);s.textContent=dead?'NotReady':'Ready';s.setAttribute('class',dead?'bad':'ok');
    $('nsub'+i).textContent=full?'CPU 7.9 / 8 requested · no room left':state.nodeport?'8 CPU · 16 GB':'8 CPU · 16 GB · room for many pods';
    $('np'+i).textContent=state.nodeport?':30080 open':'';
  }
  $('etcdsub').textContent=state.deploy?`deploy/web · replicas=${state.deploy}`:'';
  $('svc').classList.toggle('off',!state.svc);$('svc').style.display=state.services?'none':'';$('svcsub').textContent=SVC_SUB[state.svcType]||state.svcType||SVC_SUB.default;
  $('ing').style.display=state.ingress?'':'none';$('a-ing').style.display=state.ingress?'':'none';
  $('ingtitle').textContent=(state.ingText||ING_DEFAULT)[0];$('ingsub').textContent=(state.ingText||ING_DEFAULT)[1];
  $('inet').style.display=state.inet?'':'none';
  $('traylabel').style.opacity=(!state.ingress&&!state.services&&state.pods.some(p=>p.node==null))?1:0;
  const seen=new Set();
  state.pods.forEach(p=>{
    seen.add(p.id);
    let g=podEls.get(p.id);
    const [x,y]=podPos(p);
    if(!g){
      g=el('g',{class:'pod'},$('pods'));el('rect',{class:'body',width:100,height:40},g);text(g,8,17,p.id.length>15?p.id.slice(0,14)+'…':p.id);text(g,8,31,'','st');text(g,95,17,'','tag');
      g.style.opacity=0;g.style.transform=`translate(${x}px,${y}px)`;podEls.set(p.id,g);
      const id=p.id;g.onclick=()=>{if(mode==='play')run('kubectl delete pod '+id);};
      T.raf(()=>T.raf(()=>g.style.opacity=1));
    }
    g.setAttribute('class','pod '+p.status+(mode==='play'?' play':''));g.style.transform=`translate(${x}px,${y}px)`;
    const st=p.note||(ST[p.status]+(p.node?' · node-'+p.node:''));g.querySelector('.st').textContent=state.services&&st.length>24?st.slice(0,23)+'…':st;
    g.querySelector('.tag').textContent=p.tag||'';
    g.querySelectorAll('.ctr,.vol').forEach(e=>e.remove());
    if(p.containers>1)for(let i=0;i<p.containers;i++)el('rect',{class:'ctr',x:52+i*22,y:22,width:18,height:14},g);
    if(p.vol){el('rect',{class:'vol',x:82,y:22,width:14,height:13,rx:2},g);el('rect',{class:'vol',x:82,y:22,width:14,height:4,rx:2},g);}
  });
  podEls.forEach((g,id)=>{if(!seen.has(id)){g.remove();podEls.delete(id);}});
  $('links').innerHTML='';$('svcs').innerHTML='';labSvcPos={};
  if(state.links&&!state.services)state.pods.filter(p=>p.link&&p.status==='running').forEach(p=>{const [x,y]=podPos(p);el('line',{class:'link',x1:580,y1:232,x2:x+50,y2:y},$('links'));});
  if(state.services&&state.services.length){
    const n=state.services.length,w=(760-8*(n-1))/n;
    state.services.forEach((s,i)=>{
      const x=200+i*(w+8),g=el('g',{},$('svcs'));
      el('rect',{class:'box',x,y:188,width:w,height:44},g);text(g,x+10,207,`svc/${s.name}`,'label');
      text(g,x+10,223,n>2?`${s.type} :${s.port} · ${s.ready} ep`:`${s.type} :${s.port} → app=${s.app} · ${s.ready} endpoint${s.ready===1?'':'s'}`,s.ready?'sub':'bad');
      labSvcPos[s.name]=[x+w/2,210];
      state.pods.filter(p=>s.podIds?s.podIds.includes(p.id):p.app===s.app&&p.status==='running').forEach(p=>{const [px,py]=podPos(p);el('line',{class:'link',x1:x+w/2,y1:232,x2:px+50,y2:py},$('links'));});
    });
  }
  HL_IDS.forEach(id=>$(id).classList.toggle('hl',state.hl.includes(id)));
}

const P=(id,node,status,extra)=>Object.assign({id,node,status},extra);
const base=o=>Object.assign({pods:[],dead:[],full:[],hidden:[],svc:false,svcType:null,nodeport:false,ingress:false,links:false,deploy:null,only1:false,hl:[]},o);
const three=(s,placed,extra)=>[P('web-a1',placed?1:null,s,extra),P('web-b2',placed?2:null,s,extra),P('web-c3',placed?3:null,s,extra)];
const six=()=>[...three('running',true),P('web-d4',1,'running'),P('web-e5',2,'running'),P('web-f6',3,'running')];
const setStatus=(ids,st)=>state.pods.forEach(p=>{if(ids.includes(p.id))p.status=st;});
const yaml=s=>'<pre>'+s.replace(/#.*$/gm,m=>`<span class="c">${m}</span>`).replace(/^(\s*[\w.-]+):/gm,'<span class="k">$1</span>:')+'</pre>';
const table=rows=>'<table>'+rows.map(r=>'<tr>'+r.map(c=>`<td>${c}</td>`).join('')+'</tr>').join('')+'</table>';

const steps=[
/* ───────── 1. WHAT IS THIS THING ───────── */
{ch:'1 · What is this thing?',title:'Do I even need Kubernetes?',
 state:()=>base({}),
 explain:`<code>docker run</code> starts one container on one machine. <code>docker compose</code> starts a handful, still on one machine, and you restart them by hand. Kubernetes runs many containers across <b>many machines</b>, and its whole job is to keep them running: restart crashes, move work off dead machines, scale up and down, roll out new versions. If one laptop and a compose file are enough, you don't need it yet. You learn it because production is many machines.`,
 detail:table([['docker run','1 container · 1 machine · you babysit it'],['docker compose','a few containers · 1 machine · you restart them'],['Kubernetes','many containers · many machines · it restarts, reschedules, scales and updates them for you']]),
 cmd:`docker compose up          # one machine
kubectl apply -f app.yaml   # a cluster; k8s decides where things run`},

{title:'What is a node? (machine vs container)',
 state:()=>base({hl:['node1','node2','node3']}),
 explain:`A <b>node</b> is a machine: a VM, a bare-metal server, or on Docker Desktop a container pretending to be one. It has CPU and RAM and runs <b>many pods at once</b>. Containers live inside pods; pods live on nodes. You do <b>not</b> need one node per container. You add nodes when you run out of CPU/RAM, or when you want to survive a machine dying. Your local cluster has 1 node; this demo uses 3 so scheduling and failure are visible.`,
 detail:table([['node','a machine that runs pods; has a kubelet'],['pod','the thing k8s places on a node; wraps 1+ containers'],['container','your actual process, inside a pod'],['cluster','control plane + all nodes']]),
 cmd:`kubectl get nodes
kubectl describe node node-1   # capacity, what's running on it`},

{title:'What is in the control plane?',
 state:()=>base({hl:['api','etcd','sched','ctrl']}),
 fx(){['api','etcd','sched','ctrl'].forEach((id,i)=>at(i*600,()=>{state.hl=[id];render();}));at(2600,()=>{state.hl=['api','etcd','sched','ctrl'];render();});},
 explain:`<b>API server</b>: the only door in. kubectl and every other component talk through it. <b>etcd</b>: the database holding the <i>desired</i> state ("I want 3 web pods"). <b>Scheduler</b>: decides which node each new pod goes on. <b>Controller Manager</b>: loops forever comparing desired vs actual and closing the gap. Each worker node runs a <b>kubelet</b> (starts/stops containers it's told to) and <b>kube-proxy</b> (wires Service networking). On GKE, Google runs the control plane for you and you only see nodes.`,
 detail:table([['API server','REST API + auth + validation; everything goes through it'],['etcd','key-value store; the single source of truth'],['Scheduler','assigns <code>nodeName</code> to unscheduled pods'],['Controller Manager','Deployment, ReplicaSet, Node, Job… controllers'],['kubelet','per-node agent; runs pods via the container runtime'],['kube-proxy','per-node; makes Service IPs work']]),
 cmd:`kubectl get pods -n kube-system     # the control plane runs as pods too
kubectl cluster-info`},

{title:'Why does my kubectl talk to a cluster I never set up? (kubeconfig & contexts)',
 state:()=>base({hl:['client','a-kubectl','api']}),
 fx(){shoot(AT.client,AT.api,'#ff5c5c',300,900);at(1400,()=>{$('etcdsub').textContent='← this could be PROD';});},
 explain:`kubectl is just an HTTP client. It reads <code>~/.kube/config</code>, which lists <b>clusters</b> (API server URLs), <b>users</b> (your credentials) and <b>contexts</b> (cluster + user + default namespace). <code>current-context</code> decides where <i>every</i> command goes. Your file already holds GKE production contexts because <code>gcloud container clusters get-credentials</code> wrote them there; Docker Desktop adds <code>docker-desktop</code>. Nothing warns you which one is active, so <b>check before you type <code>delete</code></b>, or keep prod in a separate kubeconfig file.`,
 detail:yaml(`# ~/.kube/config (trimmed)
clusters:
- name: docker-desktop
  cluster: {server: https://127.0.0.1:6443}
- name: gke_prod-1
  cluster: {server: https://34.x.x.x}
users:
- name: docker-desktop           # client certificate
- name: gke_prod-1               # gcloud auth plugin
contexts:
- name: docker-desktop
  context: {cluster: docker-desktop, user: docker-desktop}
- name: gke_prod-1
  context: {cluster: gke_prod-1, user: gke_prod-1, namespace: default}
current-context: docker-desktop  # ← every command goes here`),
 cmd:`kubectl config get-contexts               # * marks the active one
kubectl config use-context docker-desktop
kubectl config current-context
kubectl --context docker-desktop get pods  # one-off override
export KUBECONFIG=~/.kube/local            # separate file → cannot hit prod by accident`},

{title:'Why a Pod and not just a container?',
 state:()=>base({pods:[P('web-a1',1,'running',{containers:2,tag:'2 containers'})],hl:['node1']}),
 explain:`A <b>Pod</b> is one or more containers that must live together: same node, same IP, they share <code>localhost</code> and can share volumes. Kubernetes schedules, scales, restarts and kills <b>pods</b>, never bare containers. About 95% of pods are a single container; the rest add a "sidecar" (log shipper, proxy, TLS helper). Pods are disposable: their IP and name change every time one is replaced, so nothing should depend on a specific pod.`,
 detail:table([['1 pod = 1 IP','all containers in it share network + localhost'],['sidecar','2nd container in the same pod, e.g. log-shipper'],['disposable','a pod is never "repaired", it is replaced'],['init containers','run to completion before the main ones start']]),
 cmd:`kubectl get pods
kubectl logs web-a1 -c nginx        # -c picks the container inside the pod
kubectl exec -it web-a1 -- sh`},

{title:'What does the YAML actually mean?',
 state:()=>base({hl:['client','a-kubectl','api']}),
 explain:`Every Kubernetes object has the same four parts: <b>apiVersion</b> (which API defines it), <b>kind</b> (what it is), <b>metadata</b> (name, namespace, labels), <b>spec</b> (what you want). Kubernetes adds a fifth, <b>status</b>, that you never write. A Deployment's spec contains a pod <b>template</b>: the recipe it stamps out <code>replicas</code> times. Indentation is the structure; when in doubt, <code>kubectl explain</code> tells you what any field means.`,
 detail:yaml(`apiVersion: apps/v1        # API group/version that defines Deployment
kind: Deployment           # what you are creating
metadata:
  name: web                # unique per namespace
spec:                      # what you WANT
  replicas: 3
  selector:                # "my pods are the ones labelled app=web"
    matchLabels: {app: web}
  template:                # pod recipe, stamped 3 times
    metadata:
      labels: {app: web}   # must match the selector
    spec:
      containers:
      - name: nginx
        image: nginx:1.27
        ports: [{containerPort: 80}]`),
 cmd:`kubectl explain deployment.spec.template.spec.containers
kubectl get deploy web -o yaml     # see status: filled in by k8s
kubectl apply -f deploy.yaml --dry-run=client   # validate without applying`},

{title:'What is a namespace?',
 state:()=>base({pods:[P('web-a1',1,'running',{tag:'ns: default'}),P('web-b2',2,'running',{tag:'ns: default'}),P('coredns-7x',1,'running',{tag:'ns: kube-system'}),P('metrics-q2',3,'running',{tag:'ns: kube-system'})]}),
 explain:`A <b>namespace</b> is a folder for objects. Names only need to be unique inside their namespace, so <code>dev</code> and <code>prod</code> can both have a Deployment called <code>web</code>. <code>default</code> is where things go when you don't say; <code>kube-system</code> holds the cluster's own pods (DNS, kube-proxy). A namespace is <b>not a wall</b>: pods in different namespaces still share the flat network and the same nodes unless you add NetworkPolicy and quotas.`,
 detail:table([['default','yours, when you give no <code>-n</code>'],['kube-system','the cluster&#39;s own pods; leave them alone'],['kube-public','rarely used; readable by everyone'],['your own','<code>kubectl create ns dev</code>; quotas + RBAC per ns']]),
 cmd:`kubectl get ns
kubectl get pods -A                 # every namespace
kubectl create ns dev
kubectl -n dev apply -f deploy.yaml
kubectl config set-context --current --namespace=dev   # make dev the default`},

/* ───────── 2. WHAT HAPPENS WHEN I DEPLOY ───────── */
{ch:'2 · What happens when I deploy?',title:'What does kubectl apply actually do?',
 state:()=>base({hl:['client','a-kubectl','api','etcd']}),
 fx(){shoot(AT.client,AT.api,'#4f8cff',200,900);shoot(AT.api,AT.etcd,'#4f8cff',1200,600);at(1900,()=>{state.deploy=3;render();});},
 explain:`You send a YAML file describing what you <b>want</b>: a Deployment named <code>web</code>, 3 replicas, image nginx. The API server authenticates you, validates it, and writes it to etcd. That's all. <b>Nothing is running yet.</b> Kubernetes is declarative: you record intent; the control plane works toward it on its own, and keeps working toward it forever, even after you close your laptop.`,
 detail:table([['imperative','<code>kubectl create/run/scale</code>: do this now'],['declarative','<code>kubectl apply -f</code>: make it look like this file; safe to repeat'],['apply twice','no-op; apply is idempotent'],['delete','<code>kubectl delete -f</code> removes what the file created']]),
 cmd:`kubectl apply -f deploy.yaml
# deploy.yaml → kind: Deployment  name: web  replicas: 3  image: nginx`},

{title:'Who creates the pods? (Deployment → ReplicaSet → Pod)',
 state:()=>base({deploy:3,hl:['etcd','ctrl']}),
 fx(){shoot(AT.etcd,AT.ctrl,'#4f8cff',200,700);shoot(AT.ctrl,AT.api,'#f5b83d',1100,900);shoot(AT.api,AT.etcd,'#f5b83d',2100,500);at(2700,()=>{state.pods=three('pending',false);render();});},
 explain:`The Controller Manager watches etcd (via the API server). The Deployment controller sees "web wants 3, ReplicaSet has 0" and makes a ReplicaSet; the ReplicaSet controller creates 3 <b>Pod objects</b>. They exist only as records: status <b>Pending</b>, no node, no container. The chain Deployment → ReplicaSet → Pod is what makes rolling updates and rollbacks possible: each version gets its own ReplicaSet.`,
 detail:table([['Deployment','"run this template, N times, roll out changes safely"'],['ReplicaSet','"keep exactly N copies of this template alive"'],['Pod','one running copy'],['you edit','only the Deployment; never the RS or pods directly']]),
 cmd:`kubectl get deploy,rs,pods
# NAME     READY  STATUS    NODE
# web-a1   0/1    Pending   <none>`},

{title:'Who decides which node a pod lands on?',
 state:()=>base({deploy:3,pods:three('pending',false),hl:['sched']}),
 fx(){[1,2,3].forEach((n,i)=>{shoot(AT.sched,AT.node(n),'#4f8cff',400+i*900,700);at(1100+i*900,()=>{state.pods[i].node=n;state.hl=['sched','node'+n];render();});});},
 explain:`The Scheduler watches for pods with no node. For each one it <b>filters</b> nodes (enough CPU/RAM? taints? required labels?), <b>scores</b> the survivors (spread out, prefer less-loaded), and writes <code>nodeName</code> onto the pod. <b>The Deployment never chooses a node; the Scheduler does, one pod at a time.</b> With one node there's only one possible answer, but the same decision still happens.`,
 detail:table([['nodeSelector','"only nodes labelled disk=ssd"'],['affinity / anti-affinity','"near these pods" / "never two on one node"'],['taints & tolerations','node says "keep off unless you tolerate me"'],['topologySpread','"spread evenly across zones/nodes"']]),
 cmd:`kubectl get pods -o wide      # NODE column is now filled in
kubectl describe pod web-a1   # Events: Scheduled … to node-1`},

{title:'How does the container actually start?',
 state:()=>base({deploy:3,pods:three('pending',true),hl:['api']}),
 fx(){[1,2,3].forEach((n,i)=>{shoot(AT.node(n),AT.api,'#8b94a7',300+i*500,600);shoot(AT.api,AT.node(n),'#3ddc84',900+i*500,600);at(1600+i*500,()=>{state.pods[i].status='running';state.hl=['api','node'+n];render();});});},
 explain:`Each node's <b>kubelet</b> watches the API server: "any pods assigned to <i>me</i>?" It pulls the image, asks the container runtime (containerd) to start the container, and reports status back. The pod becomes <b>Running</b>. Notice the direction: the control plane never pushed anything to the node; the kubelet <b>pulled its own work</b>. That's why nodes can join and leave freely. Image pull failures (<code>ImagePullBackOff</code>) show up here.`,
 detail:table([['ContainerCreating','pulling image / setting up network & volumes'],['ImagePullBackOff','wrong image name/tag, or private registry without credentials'],['Running','container process started'],['imagePullPolicy','<code>IfNotPresent</code> lets local images work on Docker Desktop']]),
 cmd:`kubectl describe pod web-a1
# Events: Scheduled → Pulling image → Pulled → Created → Started`},

{title:'Where do images come from? (registries, tags, private images)',
 state:()=>base({deploy:3,pods:three('pending',true,{note:'ContainerCreating · pulling'}),hl:['node1','node2','node3']}),
 fx(){at(1500,()=>{[0,2].forEach(i=>{state.pods[i].status='running';state.pods[i].note=null;});state.pods[1].status='crash';state.pods[1].note='ImagePullBackOff';state.hl=['node2'];render();});},
 explain:`Kubernetes never builds images; it only <b>pulls</b> them. <code>image: nginx</code> means <code>docker.io/library/nginx:latest</code>. Each node's kubelet pulls on its own, so a private registry needs credentials on every pull: an <b>imagePullSecret</b> referenced by the pod. <code>:latest</code> is a trap: the tag moves, two nodes can end up running different code, and a rollout may change nothing because the tag "didn't change". Pin a tag or a digest. On Docker Desktop, images you build locally are already on the node: set <code>imagePullPolicy: IfNotPresent</code> and skip the registry.`,
 detail:table([['image name','<code>registry/repo:tag</code> · default registry docker.io'],['imagePullPolicy','<code>Always</code> (default for :latest) · <code>IfNotPresent</code> · <code>Never</code>'],['private registry','<code>kubectl create secret docker-registry regcred …</code> then <code>imagePullSecrets: [{name: regcred}]</code> in the pod'],['ImagePullBackOff','typo in name/tag, or missing credentials → describe pod'],['digest','<code>nginx@sha256:…</code> = immutable, what CI should deploy']]),
 cmd:`docker build -t myapp:dev .                 # Docker Desktop: the node sees it directly
kubectl create deployment myapp --image=myapp:dev
kubectl create secret docker-registry regcred --docker-server=… --docker-username=… --docker-password=…
kubectl describe pod web-b2                 # Failed to pull image "nginx:1.99": not found`},

{title:'How does a Service know which pods are "its" pods?',
 state:()=>base({deploy:3,svc:true,links:true,pods:[...three('running',true,{tag:'app=web',link:true}),P('db-x1',2,'running',{tag:'app=db'})],hl:['svc']}),
 explain:`Nothing in Kubernetes is "attached" to anything. Objects find each other with <b>labels</b> (key=value tags) and <b>selectors</b> (queries). The Service says <code>selector: app=web</code>, so its endpoint list is "the IPs of all Running & Ready pods labelled app=web", recomputed live. The <code>db</code> pod is on the same node and network but not selected, so it never gets web traffic. ReplicaSets own pods the same way. Remove the label from a pod and it silently drops out of the Service.`,
 detail:yaml(`apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web            # ← the query
  ports:
  - port: 80            # Service port
    targetPort: 80      # container port`),
 cmd:`kubectl get pods -l app=web --show-labels
kubectl get endpoints web           # the resolved pod IPs
kubectl label pod web-a1 app-       # remove the label → out of the Service instantly`},

{title:'What happens when I scale?',
 state:()=>base({deploy:3,svc:true,pods:three('running',true),hl:['client','a-kubectl']}),
 fx(){shoot(AT.client,AT.api,'#4f8cff',200,800);at(1000,()=>{state.deploy=6;state.hl=['etcd','ctrl'];render();});
      at(1800,()=>{state.pods.push(P('web-d4',null,'pending'),P('web-e5',null,'pending'),P('web-f6',null,'pending'));render();});
      [1,2,3].forEach((n,i)=>{at(3000+i*700,()=>{state.pods[3+i].node=n;state.hl=['sched','node'+n];render();});at(4200+i*700,()=>{state.pods[3+i].status='running';render();});});},
 explain:`You change one number. The Controller Manager sees 3 &lt; 6 and creates 3 more Pending pods; the Scheduler drops them wherever there is room. Here each node ends up with 2, but if one node were full the others would simply take more. <b>Node count did not change; pods per node did.</b> Nodes are capacity, pods are the work. Scaling down deletes pods the same way. A <b>HorizontalPodAutoscaler</b> does this for you based on CPU.`,
 detail:table([['scale up','new Pending pods → scheduled → running'],['scale down','extra pods deleted; Service stops routing to them first'],['HPA','<code>kubectl autoscale deploy web --min 2 --max 10 --cpu-percent 70</code>'],['limit','you can never run more than the nodes can hold']]),
 cmd:`kubectl scale deployment web --replicas=6
kubectl get pods -o wide   # 6 pods spread over 3 nodes`},

{title:'How do I make api wait for db? (there is no depends_on)',
 state:()=>base({pods:[P('api-m1',1,'pending',{note:'Init:0/1 · waiting for db'}),P('db-0',2,'pending',{tag:'StatefulSet',vol:true})],hl:['node1','node2']}),
 fx(){for(let r=0;r<3;r++)shoot(podCenter(state.pods[0]),podCenter(state.pods[1]),'#ff5c5c',400+r*900,700);
      at(3200,()=>{state.pods[1].status='running';render();});
      at(4200,()=>shoot(podCenter(state.pods[0]),podCenter(state.pods[1]),'#3ddc84',0,700));
      at(5000,()=>{state.pods[0].status='running';state.pods[0].note=null;render();});},
 explain:`Compose has <code>depends_on</code>; Kubernetes deliberately does not. Pods start in any order and any of them can be restarted at any moment, so the app must <b>tolerate the db not being there yet</b>: retry the connection, and fail readiness until it works. If you need a hard gate, an <b>init container</b> runs first and blocks the main container until it exits 0 (loop until <code>db:5432</code> answers). The same trick covers "run migrations before the app starts". Design for "eventually", not "in order".`,
 detail:yaml(`spec:
  initContainers:
  - name: wait-for-db
    image: busybox
    command: ['sh','-c','until nc -z db 5432; do sleep 2; done']
  - name: migrate
    image: myapp:dev
    command: ['./migrate']
  containers:
  - name: api
    image: myapp:dev
    readinessProbe: {httpGet: {path: /ready, port: 8080}}`),
 cmd:`kubectl get pods              # STATUS Init:0/2 while waiting
kubectl logs api-m1 -c wait-for-db
kubectl describe pod api-m1    # Init Containers section`},

/* ───────── 3. HOW DOES TRAFFIC REACH MY APP ───────── */
{ch:'3 · How does traffic reach my app?',title:'How does a Service load-balance across nodes?',
 state:()=>base({deploy:3,svc:true,pods:three('running',true),hl:['client','a-svc','svc']}),
 fx(){for(let r=0;r<4;r++){shoot(AT.client,AT.svc,'#3ddc84',r*1500,500);shoot(AT.svc,podCenter(state.pods[r%3]),'#3ddc84',r*1500+550,600);}},
 explain:`Pods have their own IPs and get replaced all the time, so you never talk to them directly. A <b>Service</b> gives you one stable name (<code>web</code>) and IP. kube-proxy on <i>every</i> node rewrites traffic to that IP so it lands on a healthy pod, <b>on whichever node it happens to be</b>. Kubernetes guarantees a flat network: any pod can reach any pod by IP, across nodes. Nodes are not network-isolated from each other.`,
 detail:table([['Service IP','virtual; exists only as kube-proxy rules on every node'],['pod IP','real, but temporary'],['flat network','pod A on node-1 can reach pod B on node-3 directly'],['NetworkPolicy','the optional firewall if you want isolation']]),
 cmd:`kubectl expose deployment web --port 80
kubectl get svc web        # one CLUSTER-IP fronting all 3 pods`},

{title:'Which port is which? (containerPort, port, targetPort, nodePort)',
 state:()=>base({deploy:3,svc:true,nodeport:true,svcType:'port: 80 = what clients inside use (http://web)   →   targetPort: 8080 = what the container listens on   ·   nodePort: 30080 = outside',pods:three('running',true,{note:'Running · listens :8080'}),hl:['svc']}),
 fx(){for(let r=0;r<3;r++){shoot(AT.client,AT.svc,'#3ddc84',r*1500,500);shoot(AT.svc,podCenter(state.pods[r]),'#3ddc84',r*1500+550,600);}},
 explain:`Four names, three ports. <b>containerPort</b> on the pod is documentation: what the process listens on (8080). The Service's <b>targetPort</b> must equal that. The Service's <b>port</b> is what clients inside the cluster use (<code>http://web:80</code>) and may differ. <b>nodePort</b> exists only for NodePort/LoadBalancer types: the high port opened on every node. Most bugs here are targetPort ≠ the real listening port, which shows up as "Service exists but connection refused".`,
 detail:yaml(`# Deployment
containers:
- name: web
  ports: [{containerPort: 8080}]   # app listens here
---
# Service
spec:
  type: NodePort
  ports:
  - port: 80          # clients: http://web
    targetPort: 8080  # must match the app
    nodePort: 30080   # outside: <node>:30080`),
 cmd:`kubectl get svc web -o wide
kubectl get endpoints web                    # IP:8080 pairs = targetPort resolved
kubectl port-forward pod/web-a1 9000:8080    # bypass the Service to test the app itself`},

{title:'How do pods find each other? (DNS)',
 state:()=>base({deploy:3,svc:true,pods:three('running',true),hl:['svc']}),
 fx(){for(let r=0;r<3;r++){shoot(podCenter(state.pods[2]),AT.svc,'#3ddc84',r*1800,700);shoot(AT.svc,podCenter(state.pods[r%2]),'#3ddc84',r*1800+750,600);}},
 explain:`A pod on node-3 wants to call the web app. It just uses the name <code>web</code>. <b>CoreDNS</b> (pods in kube-system) turns every Service into a DNS name: <code>web.default.svc.cluster.local</code>, shortened to <code>web</code> inside the same namespace and <code>web.default</code> from another. The name resolves to the Service IP, and kube-proxy takes it from there. This is how your api pod finds your db pod without configuration: the Service name <i>is</i> the config.`,
 detail:table([['same namespace','<code>http://web</code>'],['other namespace','<code>http://web.default</code>'],['fully qualified','<code>web.default.svc.cluster.local</code>'],['outside the cluster','these names do not exist; see next step']]),
 cmd:`kubectl exec web-c3 -- curl -s http://web        # works from any pod
kubectl exec web-c3 -- nslookup web
kubectl get svc -n kube-system kube-dns`},

{title:'How do I reach it from my browser?',
 state:()=>base({deploy:3,svc:true,svcType:'ClusterIP',pods:three('running',true),hl:['svc']}),
 fx(){at(2500,()=>{state.svcType='NodePort';state.nodeport=true;state.hl=['node1','node2','node3'];render();shoot(AT.client,AT.node(2),'#3ddc84',300,900);shoot(AT.node(2),podCenter(state.pods[0]),'#3ddc84',1300,600);});
      at(6000,()=>{state.svcType='LoadBalancer';state.nodeport=false;state.hl=['client','a-svc','svc'];render();shoot(AT.client,AT.svc,'#3ddc84',300,600);shoot(AT.svc,podCenter(state.pods[2]),'#3ddc84',950,600);});},
 explain:`A plain Service is <b>ClusterIP</b>: only reachable from inside. To get in from outside you change its <code>type</code>. <b>NodePort</b> opens the same high port (30000–32767) on <i>every</i> node; hit any node's IP on that port. <b>LoadBalancer</b> asks the cloud for a real external IP that fronts all nodes (on GKE this is a Google load balancer; Docker Desktop fakes one, that's the <code>cloud-provider-kind</code> image it pulled). For quick local testing, skip all that: <code>kubectl port-forward</code>.`,
 detail:table([['ClusterIP','inside only · dev trick: <code>kubectl port-forward svc/web 8080:80</code> → localhost:8080'],['NodePort','<code>&lt;node-ip&gt;:30080</code> · Docker Desktop: <code>localhost:30080</code>'],['LoadBalancer','external IP from the cloud · Docker Desktop: <code>localhost</code>'],['Ingress','one HTTP entry point routing to many Services → next step']]),
 cmd:`kubectl port-forward svc/web 8080:80          # then open http://localhost:8080
kubectl expose deploy web --type=NodePort --port 80
kubectl expose deploy web --type=LoadBalancer --port 80
kubectl get svc web -w                        # watch EXTERNAL-IP appear`},

{title:'What is an Ingress?',
 state:()=>base({deploy:3,svc:true,ingress:true,pods:[...three('running',true),P('api-k1',3,'running',{tag:'app=api'})],hl:['client','a-ing','ing']}),
 fx(){for(let r=0;r<3;r++){shoot(AT.client,AT.ing,'#3ddc84',r*1600,600);shoot(AT.ing,AT.svc,'#3ddc84',r*1600+650,300);shoot(AT.svc,podCenter(state.pods[r%2===0?0:3]),'#3ddc84',r*1600+1000,600);}},
 explain:`One LoadBalancer per Service gets expensive and messy. An <b>Ingress</b> is a single HTTP(S) entry point with routing rules: <code>myapp.local/</code> → Service web, <code>myapp.local/api</code> → Service api, plus TLS termination. The Ingress object is only <i>rules</i>; an <b>Ingress controller</b> (nginx, traefik…) must be running as pods to actually accept traffic. That's the one thing a fresh cluster doesn't ship with. GKE has one built in.`,
 detail:yaml(`apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp
spec:
  rules:
  - host: myapp.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend: {service: {name: web, port: {number: 80}}}
      - path: /api
        pathType: Prefix
        backend: {service: {name: api, port: {number: 80}}}`),
 cmd:`# 1) install an ingress controller once (e.g. ingress-nginx)  2) then:
kubectl apply -f ingress.yaml
kubectl get ingress
echo "127.0.0.1 myapp.local" | sudo tee -a /etc/hosts   # local DNS trick`},

{title:'Can I stop pods from talking to each other? (NetworkPolicy)',
 state:()=>base({pods:[P('web-a1',1,'running',{tag:'app=web'}),P('db-0',2,'running',{tag:'app=db',vol:true}),P('shady-x9',3,'running',{tag:'ns: dev'})],hl:['node2']}),
 fx(){shoot(podCenter(state.pods[0]),podCenter(state.pods[1]),'#3ddc84',300,800);shoot(podCenter(state.pods[2]),podCenter(state.pods[1]),'#3ddc84',1300,800);
      at(2400,()=>{state.pods[1].note='Running · policy: only from app=web';render();});
      shoot(podCenter(state.pods[0]),podCenter(state.pods[1]),'#3ddc84',3200,800);shoot(podCenter(state.pods[2]),podCenter(state.pods[1]),'#ff5c5c',4200,800);},
 explain:`By default the network is flat: <i>every</i> pod can reach <i>every</i> pod, across namespaces. A <b>NetworkPolicy</b> is a firewall rule attached to pods by label: "db accepts ingress only from pods labelled app=web". Once a pod is selected by any policy, everything not explicitly allowed is denied. It is enforced by the network plugin (CNI), so it only works if yours supports it: GKE yes; Docker Desktop's default kind network no, the object is accepted and silently ignored.`,
 detail:yaml(`kind: NetworkPolicy
metadata: {name: db-only-from-web}
spec:
  podSelector: {matchLabels: {app: db}}   # who this protects
  policyTypes: [Ingress]
  ingress:
  - from:
    - podSelector: {matchLabels: {app: web}}
    ports: [{port: 5432}]`),
 cmd:`kubectl apply -f netpol.yaml
kubectl get networkpolicy
kubectl exec shady-x9 -- nc -zv db 5432    # times out where enforced`},

/* ───────── 4. CONFIG & STORAGE ───────── */
{ch:'4 · Config, secrets, storage',title:'Where does my config go? (ConfigMap & Secret)',
 state:()=>base({deploy:3,pods:three('running',true),hl:['etcd']}),
 fx(){[0,1,2].forEach(i=>{shoot(AT.etcd,podCenter(state.pods[i]),'#f5b83d',300+i*500,900);});at(1800,()=>{state.pods.forEach(p=>p.note='Running · env from configmap');state.hl=['node1','node2','node3'];render();});},
 explain:`Never bake environment-specific config into the image. Put it in a <b>ConfigMap</b> (plain settings) or a <b>Secret</b> (passwords, tokens) and inject it into pods as environment variables or as files. The same image then runs in dev and prod with different maps. A Secret is only <b>base64-encoded, not encrypted</b> by default: anyone who can read Secrets in the namespace can read the password, so RBAC matters. Changing a ConfigMap does not restart pods; you trigger that.`,
 detail:yaml(`# in the pod template:
env:
- name: DB_HOST
  valueFrom:
    configMapKeyRef: {name: app-config, key: db_host}
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef: {name: app-secret, key: password}
volumes:                       # or mount as files
- name: cfg
  configMap: {name: app-config}`),
 cmd:`kubectl create configmap app-config --from-literal=db_host=db
kubectl create secret generic app-secret --from-literal=password=hunter2
kubectl get secret app-secret -o yaml       # base64, not encrypted
kubectl rollout restart deploy web          # pick up the new values`},

{title:'Where does my data live when a pod dies?',
 state:()=>base({pods:[P('web-a1',1,'running'),P('db-0',2,'running',{vol:true,tag:'StatefulSet'})],hl:['node2']}),
 fx(){at(1200,()=>{pod('db-0').status='dead';pod('db-0').note='container died';render();});
      at(2600,()=>{state.pods=state.pods.filter(p=>p.id!=='db-0');state.pods.push(P('db-0',2,'pending',{vol:true,tag:'StatefulSet',note:'Pending · re-attaching PVC'}));render();});
      at(4000,()=>{const p=pod('db-0');p.status='running';p.note='Running · same data';render();});},
 explain:`A container's filesystem is <b>thrown away</b> when the container dies. <code>emptyDir</code> lives as long as the pod (scratch space, shared between sidecars). For data that must survive, the pod claims storage with a <b>PersistentVolumeClaim</b>; the cluster binds it to a <b>PersistentVolume</b> (a real disk) that outlives any pod. When the pod is replaced, the new one re-attaches the same volume. Databases use a <b>StatefulSet</b>: stable names (<code>db-0</code>), one PVC per pod, ordered startup. Docker Desktop ships a default StorageClass, so PVCs just work locally.`,
 detail:yaml(`kind: PersistentVolumeClaim
metadata: {name: db-data}
spec:
  accessModes: [ReadWriteOnce]
  resources: {requests: {storage: 5Gi}}
---
# in the pod template:
volumes:
- name: data
  persistentVolumeClaim: {claimName: db-data}
containers:
- name: postgres
  volumeMounts: [{name: data, mountPath: /var/lib/postgresql/data}]`),
 cmd:`kubectl get storageclass          # Docker Desktop: hostpath (default)
kubectl get pvc,pv
kubectl delete pod db-0           # comes back with the same data`},

/* ───────── 5. KEEPING IT RUNNING ───────── */
{ch:'5 · Keeping it running',title:'What happens when my app crashes?',
 state:()=>base({deploy:3,pods:three('running',true),hl:['node2']}),
 fx(){const p=()=>pod('web-b2');
      at(800,()=>{p().status='crash';p().note='exit code 1';render();});
      at(1800,()=>{shoot([NODE_X[1]+45,311],podCenter(p()),'#f5b83d',0,500);});at(2300,()=>{p().status='running';p().note='Running · restarts: 1';render();});
      at(3600,()=>{p().status='crash';p().note='exit code 1 · backoff 10s';render();});
      at(5000,()=>{shoot([NODE_X[1]+45,311],podCenter(p()),'#f5b83d',0,500);});at(5500,()=>{p().status='running';p().note='Running · restarts: 2';render();});
      at(6800,()=>{p().status='crash';p().note='CrashLoopBackOff · restarts: 3';render();});},
 explain:`Your process exits. The <b>kubelet</b> on that node restarts the container in place (<code>restartPolicy: Always</code>), on the same node, same pod. If it keeps dying, the kubelet waits longer each time (10s, 20s, 40s… up to 5 min): that's <b>CrashLoopBackOff</b>. It is not a scheduling problem and not a node problem; it's your app or its config. The Scheduler is never involved. Read the logs of the <i>previous</i> run to see why it died.`,
 detail:table([['CrashLoopBackOff','app starts, exits, repeatedly → <code>logs --previous</code>'],['Error','container exited non-zero once'],['OOMKilled','exceeded its memory limit → requests & limits step'],['Completed','exited 0; normal for Jobs, a bug for servers']]),
 cmd:`kubectl get pods                    # RESTARTS column climbing
kubectl logs web-b2 --previous      # output of the run that died
kubectl describe pod web-b2         # Last State: Terminated, Reason, Exit Code`},

{title:'What do all the STATUS words mean?',
 state:()=>base({pods:[P('a',1,'pending',{note:'Pending'}),P('b',1,'pending',{note:'ContainerCreating'}),P('c',2,'running',{note:'Running · 1/1'}),P('d',2,'unready',{note:'Running · 0/1 Ready'}),P('e',3,'crash',{note:'CrashLoopBackOff'}),P('f',3,'crash',{note:'ImagePullBackOff'}),P('g',1,'term',{note:'Terminating'}),P('h',2,'done',{note:'Completed'}),P('i',3,'dead',{note:'Evicted'})],hl:[]}),
 explain:`<code>kubectl get pods</code> shows a <b>phase</b> plus, when useful, the reason of the container that is stuck. Read it as a story: <b>Pending</b> (no node yet, or waiting on a volume) → <b>ContainerCreating</b> (pulling, mounting) → <b>Running</b>. READY <code>0/1</code> means running but failing readiness. Anything ending in <b>BackOff</b> means something keeps failing and the kubelet is waiting longer between tries. <b>Terminating</b> is graceful shutdown in progress; <b>Completed</b> is a Job that finished; <b>Evicted</b> means the node ran out of memory or disk and threw the pod off.`,
 detail:table([['Pending','not scheduled, or PVC/volume not ready → describe'],['ContainerCreating','image pull / volume mount in progress'],['ImagePullBackOff / ErrImagePull','wrong image or no credentials'],['Running, READY 0/1','readiness probe failing → gets no traffic'],['CrashLoopBackOff','process keeps exiting → logs --previous'],['OOMKilled','memory limit exceeded'],['Terminating','SIGTERM sent, waiting up to grace period'],['Completed / Error','Job finished (exit 0) / failed (non-zero)'],['Evicted','node pressure; pod discarded, recreated elsewhere'],['Unknown','node stopped reporting']]),
 cmd:`kubectl get pods -A
kubectl get pods --field-selector=status.phase!=Running
kubectl describe pod <name>     # Conditions + Events explain every status above`},

{title:'How does Kubernetes know my app is healthy? (probes)',
 state:()=>base({deploy:3,svc:true,links:true,pods:three('running',true,{link:true}),hl:['svc']}),
 fx(){at(1000,()=>{const p=pod('web-b2');p.status='unready';p.link=false;p.note='Running · readiness FAILED';render();});
      for(let r=0;r<4;r++){shoot(AT.client,AT.svc,'#3ddc84',1500+r*1200,500);shoot(AT.svc,podCenter(state.pods[r%2===0?0:2]),'#3ddc84',2050+r*1200,600);}
      at(6500,()=>{const p=pod('web-b2');p.status='running';p.link=true;p.note='Running · Ready 1/1';render();});},
 explain:`"Running" only means the process started. A <b>readiness probe</b> (HTTP/TCP/command) tells the Service whether this pod should receive traffic <i>right now</i>; fail it and the pod is removed from the endpoints, no restart, no traffic, until it passes again. A <b>liveness probe</b> tells the kubelet the process is wedged and should be killed and restarted. Without probes, Kubernetes happily sends users to a pod that is still loading or stuck.`,
 detail:yaml(`containers:
- name: web
  readinessProbe:           # "can I take traffic?"
    httpGet: {path: /healthz, port: 80}
    periodSeconds: 5
  livenessProbe:            # "am I stuck? restart me"
    httpGet: {path: /healthz, port: 80}
    initialDelaySeconds: 15
    failureThreshold: 3
  startupProbe:             # for slow-starting apps
    httpGet: {path: /healthz, port: 80}
    failureThreshold: 30`),
 cmd:`kubectl get pods            # READY 0/1 = running but failing readiness
kubectl get endpoints web   # the unready pod's IP is missing
kubectl describe pod web-b2 # Readiness probe failed: HTTP 503`},

{title:'Why is my pod Pending / OOMKilled? (requests & limits)',
 state:()=>base({deploy:4,full:[1,2,3],pods:[...three('running',true,{note:'Running · req 2.6 CPU'}),P('web-d4',null,'pending',{note:'Pending · Insufficient cpu'})],hl:['sched']}),
 fx(){shoot(AT.sched,AT.node(1),'#ff5c5c',500,600);shoot(AT.sched,AT.node(2),'#ff5c5c',1300,600);shoot(AT.sched,AT.node(3),'#ff5c5c',2100,600);
      at(4000,()=>{pod('web-a1').status='crash';pod('web-a1').note='OOMKilled · over 256Mi limit';state.hl=['node1'];render();});},
 explain:`Every container should declare <b>requests</b> (what the Scheduler reserves for it) and <b>limits</b> (the hard cap the kernel enforces). The Scheduler does simple arithmetic: node capacity minus the sum of requests. When nothing fits, the pod stays <b>Pending</b> with "Insufficient cpu/memory": add nodes or shrink requests. Exceed the memory <b>limit</b> at runtime and the kernel kills the container: <b>OOMKilled</b>. Exceed the CPU limit and it is only throttled. With no requests set, the Scheduler assumes 0 and will happily overpack a node.`,
 detail:yaml(`containers:
- name: web
  resources:
    requests:          # scheduler's math; guaranteed
      cpu: 250m        # 0.25 core
      memory: 128Mi
    limits:            # kernel-enforced cap
      cpu: 500m
      memory: 256Mi    # exceed → OOMKilled`),
 cmd:`kubectl describe pod web-d4      # 0/3 nodes available: Insufficient cpu
kubectl top nodes                # needs metrics-server
kubectl top pods
kubectl describe node node-1     # Allocated resources table`},

{title:'How do I ship a new version with zero downtime?',
 state:()=>base({deploy:3,svc:true,pods:three('running',true,{tag:'v1'}),hl:['client','a-kubectl']}),
 fx(){shoot(AT.client,AT.api,'#4f8cff',200,800);at(1000,()=>{state.hl=['ctrl'];render();});
      const old=['web-a1','web-b2','web-c3'];
      [1,2,3].forEach((n,i)=>{const t=1600+i*2200,id='web-v2-'+'xyz'[i];
        at(t,()=>{state.pods.push(P(id,null,'pending',{tag:'v2'}));render();});
        at(t+700,()=>{pod(id).node=n;render();});
        at(t+1400,()=>{pod(id).status='running';state.pods=state.pods.filter(p=>p.id!==old[i]);state.hl=['node'+n];render();});});
      at(8400,()=>{state.hl=['svc'];render();});},
 explain:`Change the image tag and apply. The Deployment creates a <b>second ReplicaSet</b> for v2 and moves pods over one at a time: start a v2 pod, wait until it is <b>Ready</b> (readiness probe!), then delete a v1 pod. The Service only ever points at Ready pods, so users never hit a half-started one. The old ReplicaSet is kept at 0 replicas, which is why <b>rollback is instant</b>: scale it back up. If v2 never becomes Ready, the rollout stalls and v1 keeps serving.`,
 detail:yaml(`spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # may run 1 extra pod during the roll
      maxUnavailable: 0    # never drop below desired count
  template:
    spec:
      containers:
      - name: web
        image: nginx:1.28  # ← the only change`),
 cmd:`kubectl set image deploy/web nginx=nginx:1.28     # or edit the yaml + apply
kubectl rollout status deploy/web
kubectl rollout history deploy/web
kubectl rollout undo deploy/web                   # back to v1 in seconds`},

{title:'Rolling, Recreate, blue/green, canary: which one when?',
 state:()=>base({deploy:4,svc:true,links:true,pods:[...three('running',true,{tag:'v1',link:true}),P('web-canary',3,'running',{tag:'v2',link:true})],hl:['svc']}),
 fx(){for(let r=0;r<6;r++){shoot(AT.client,AT.svc,'#3ddc84',r*900,400);shoot(AT.svc,podCenter(state.pods[r%4]),'#3ddc84',r*900+450,500);}},
 explain:`<b>RollingUpdate</b> (default): replace pods gradually, no downtime, but v1 and v2 run side by side for a while, so both must accept the same db schema. <b>Recreate</b>: kill all v1, then start v2; brief outage, never two versions at once (some stateful apps need this). <b>Blue/green</b>: run a full v2 next to v1, flip the Service selector in one move, flip back to roll back. <b>Canary</b>: one v2 pod behind the same Service quietly takes ~25% of traffic; watch errors, then roll the rest. Blue/green and canary are patterns you build from Deployments + labels, not built-in types.`,
 detail:table([['RollingUpdate','<code>strategy.type: RollingUpdate</code> · tune maxSurge / maxUnavailable'],['Recreate','<code>strategy.type: Recreate</code> · downtime, single version'],['Blue/green','2 Deployments; Service selector <code>version: green</code> → flip'],['Canary','2nd Deployment, 1 replica, same <code>app=web</code> label'],['exact % / headers','needs an Ingress controller or service mesh (nginx canary annotations, Istio)']]),
 cmd:`kubectl patch deploy web -p '{"spec":{"strategy":{"type":"Recreate"}}}'
kubectl create deploy web-canary --image=nginx:1.28 --replicas=1      # then label it app=web
kubectl patch svc web -p '{"spec":{"selector":{"version":"green"}}}' # blue/green flip`},

{title:'What happens when a pod is deleted? (graceful shutdown)',
 state:()=>base({deploy:3,svc:true,links:true,pods:three('running',true,{link:true}),hl:['svc']}),
 fx(){const p=()=>pod('web-b2');
      at(800,()=>{p().status='term';p().link=false;p().note='Terminating · out of endpoints';render();});
      at(1600,()=>shoot([NODE_X[1]+45,311],podCenter(p()),'#f5b83d',0,500));at(2200,()=>{p().note='SIGTERM · finishing requests';render();});
      at(4200,()=>{state.pods=state.pods.filter(q=>q.id!=='web-b2');state.pods.push(P('web-k9',null,'pending'));render();});
      at(5000,()=>{pod('web-k9').node=2;render();});at(5800,()=>{const q=pod('web-k9');q.status='running';q.link=true;render();});},
 explain:`<code>kubectl delete pod</code>, a scale-down, a rollout, a node drain: all end the same way. The pod is marked <b>Terminating</b> and removed from Service endpoints, so no new requests arrive. The kubelet runs an optional <b>preStop</b> hook, then sends <b>SIGTERM</b> to your process. You get <code>terminationGracePeriodSeconds</code> (default 30s) to finish in-flight work and exit; then <b>SIGKILL</b>. If your app ignores SIGTERM, every deploy drops requests. Meanwhile the ReplicaSet already makes a replacement, since desired is still 3.`,
 detail:yaml(`spec:
  terminationGracePeriodSeconds: 30
  containers:
  - name: web
    lifecycle:
      preStop:
        exec: {command: ['sh','-c','sleep 5']}   # let the LB drain first
# your app: on SIGTERM → stop accepting, finish, exit 0`),
 cmd:`kubectl delete pod web-b2      # goes Terminating, then a new pod appears
kubectl get pods -w
kubectl delete pod web-b2 --grace-period=0 --force   # last resort, not routine`},

{title:'What if a whole node dies?',
 state:()=>base({deploy:6,svc:true,pods:six(),hl:[]}),
 fx(){at(600,()=>{state.dead=[2];setStatus(['web-b2','web-e5'],'dead');state.hl=['node2'];render();});
      at(2000,()=>{state.hl=['ctrl'];render();});shoot(AT.ctrl,AT.api,'#f5b83d',2100,700);
      at(2900,()=>{state.pods.push(P('web-g7',null,'pending'),P('web-h8',null,'pending'));render();});
      at(4000,()=>{pod('web-g7').node=1;pod('web-h8').node=3;state.hl=['sched','node1','node3'];render();});
      at(5200,()=>{setStatus(['web-g7','web-h8'],'running');state.hl=['svc'];render();});
      for(let r=0;r<3;r++)at(5600+r*1200,()=>{shoot(AT.client,AT.svc,'#3ddc84',0,500);shoot(AT.svc,podCenter(state.pods[[0,2,6][r]]),'#3ddc84',550,600);});},
 explain:`node-2's kubelet stops reporting. After ~40s the control plane marks it <b>NotReady</b>; after ~5 min it treats the pods as gone. The Controller Manager sees 4 &lt; 6 and creates 2 new pods; the Scheduler puts them on the nodes still alive; the Service stops sending traffic to node-2. Users don't notice. <b>This is the reason to run more than one node</b>: with a single node there is nowhere to reschedule to, and you are down until it comes back. Compare with the crash step: a crash restarts in place; a dead node reschedules elsewhere.`,
 detail:table([['pod crashes','kubelet restarts it, same node'],['node dies','controller makes new pods, scheduler picks other nodes'],['1 node cluster','node dies → everything is down'],['PodDisruptionBudget','"never take more than 1 web pod down at once" during maintenance']]),
 cmd:`kubectl get nodes            # node-2   NotReady
kubectl get pods -o wide     # web-g7 → node-1, web-h8 → node-3
kubectl drain node-2         # do this on purpose before maintenance`},

{title:'Can the cluster add nodes by itself? (HPA vs Cluster Autoscaler)',
 state:()=>base({deploy:5,full:[1,2],hidden:[3],pods:[P('web-a1',1,'running'),P('web-b2',2,'running'),P('web-d4',1,'running'),P('web-e5',2,'running'),P('web-f6',null,'pending',{note:'Pending · Insufficient cpu'})],hl:['sched']}),
 fx(){at(1500,()=>{state.hl=['ctrl'];render();});at(2800,()=>{state.hidden=[];state.hl=['node3'];render();});at(4000,()=>{const p=pod('web-f6');p.node=3;p.note=null;render();});at(4800,()=>{pod('web-f6').status='running';render();});},
 explain:`Two different loops, often confused. The <b>HorizontalPodAutoscaler</b> changes <i>replicas</i> on a Deployment from CPU/memory/custom metrics: more pods. The <b>Cluster Autoscaler</b> (GKE: built in; Docker Desktop: no) watches for pods stuck <b>Pending</b> for lack of room and asks the cloud for another <i>node</i>; it also removes nodes that sit empty. They chain: load ↑ → HPA adds pods → pods Pending → CA adds a node → Scheduler places them. Both depend on honest resource <b>requests</b>; with none set, neither can do the math.`,
 detail:table([['HPA','more/fewer pods · <code>kubectl autoscale deploy web --min 2 --max 10 --cpu-percent 70</code> · needs metrics-server'],['Cluster Autoscaler','more/fewer nodes · cloud feature, configured on the node pool'],['VPA','adjusts a pod&#39;s requests instead of the count'],['GKE Autopilot','you never see nodes; you pay per pod request']]),
 cmd:`kubectl autoscale deployment web --min=2 --max=10 --cpu-percent=70
kubectl get hpa
kubectl get pods --field-selector=status.phase=Pending   # what the Cluster Autoscaler reacts to`},

{title:'Deployment is not the only kind: DaemonSet, StatefulSet, Job',
 state:()=>base({pods:three('running',true,{tag:'Deployment'}),hl:[]}),
 fx(){[1,2,3].forEach((n,i)=>at(600+i*500,()=>{state.pods.push(P('log-agent-'+n,n,'running',{tag:'DaemonSet'}));state.hl=['node'+n];render();}));
      at(2600,()=>{state.pods.push(P('db-0',2,'running',{tag:'StatefulSet',vol:true}));render();});
      at(3600,()=>{state.pods.push(P('backup-7hq',3,'running',{tag:'Job'}));render();});
      at(5400,()=>{const p=pod('backup-7hq');p.status='done';p.note='Completed · exit 0';state.hl=[];render();});},
 explain:`All of these produce pods; they differ in <i>how many</i> and <i>how they are named</i>. <b>Deployment</b>: N interchangeable copies (web servers, APIs). <b>DaemonSet</b>: exactly one per node, automatically added when a node joins (log shippers, monitoring agents, kube-proxy itself). <b>StatefulSet</b>: numbered pods with stable names and their own disks, started in order (databases, queues). <b>Job</b>: run to completion, retry on failure (migrations, batch). <b>CronJob</b>: a Job on a schedule. Pick by asking "how many, and do they have identity?"`,
 detail:table([['Deployment','stateless, any count, interchangeable'],['DaemonSet','one per node, follows the nodes'],['StatefulSet','<code>db-0, db-1</code>; stable DNS + own PVC each'],['Job / CronJob','runs until exit 0; <code>backoffLimit</code> retries'],['bare Pod','never in prod: nothing recreates it']]),
 cmd:`kubectl get deploy,ds,sts,jobs,cronjobs -A
kubectl create job backup --image=busybox -- sh -c 'echo done'
kubectl create cronjob nightly --schedule="0 2 * * *" --image=busybox -- date`},

/* ───────── 6. WORKING WITH IT ───────── */
{ch:'6 · Working with it',title:'Something is wrong. How do I debug it?',
 state:()=>base({deploy:3,pods:[P('web-a1',1,'running'),P('web-b2',2,'crash',{note:'CrashLoopBackOff'}),P('web-c3',null,'pending',{note:'Pending · Insufficient cpu'})],hl:['api']}),
 explain:`Every problem is one of four shapes, and each has one first command. <b>Pending</b>: it was never scheduled → <code>describe pod</code>, read Events (no room, bad nodeSelector, PVC not bound). <b>ImagePullBackOff</b>: wrong tag or private registry → Events again. <b>CrashLoopBackOff</b>: your app dies → <code>logs --previous</code>. <b>Running but unreachable</b>: labels don't match the Service, or readiness fails → <code>get endpoints</code>. The API server has already recorded the answer; <code>describe</code> is how you read it.`,
 detail:table([['<code>kubectl get pods -o wide</code>','what exists, where, how many restarts'],['<code>kubectl describe pod X</code>','Events at the bottom: the "why"'],['<code>kubectl logs X [-c ctr] [--previous]</code>','your app&#39;s own output'],['<code>kubectl exec -it X -- sh</code>','poke around inside the container'],['<code>kubectl port-forward pod/X 8080:80</code>','talk to one pod directly, bypassing Service'],['<code>kubectl get events --sort-by=.lastTimestamp</code>','everything that happened, cluster-wide'],['<code>kubectl get endpoints svc</code>','empty = selector/readiness problem']]),
 cmd:`kubectl get pods -o wide
kubectl describe pod web-c3        # Pending → Events: 0/3 nodes available…
kubectl logs web-b2 --previous     # CrashLoop → why it exited
kubectl get endpoints web          # Running but no traffic → no IPs listed?`},

{title:'Why is it stuck Terminating? How do I clean up?',
 state:()=>base({pods:[P('web-a1',1,'term',{note:'Terminating · 12m'}),P('db-0',2,'running',{vol:true,tag:'StatefulSet'})],hl:['api']}),
 explain:`Deleting a Deployment deletes its ReplicaSet and pods because of <b>ownerReferences</b>: children are garbage-collected with their parent (<code>--cascade=orphan</code> keeps them). A PVC is <i>not</i> a child, so data survives deleting the app; delete it explicitly when you mean it. Objects stuck in <b>Terminating</b> have a <b>finalizer</b>: some controller must acknowledge the deletion first (detach a disk, release a cloud LB). If that controller is gone, the object waits forever; removing the finalizer by hand is the escape hatch, used knowingly. A namespace stuck Terminating is the same story for something inside it.`,
 detail:table([['delete the app','<code>kubectl delete -f app.yaml</code> or <code>delete deploy web</code> → RS + pods go too'],['keep the data','PVCs are separate; <code>delete pvc db-data</code> only on purpose'],['everything in a ns','<code>kubectl delete ns dev</code>'],['stuck pod','<code>describe</code> → finalizers; node gone? <code>delete --force --grace-period=0</code>'],['stuck namespace','find the resource inside still holding a finalizer'],['who owns what','<code>kubectl get pod X -o yaml | grep -A3 ownerReferences</code>']]),
 cmd:`kubectl delete deploy web            # RS + pods vanish with it
kubectl get pvc                        # still there, on purpose
kubectl get pod web-a1 -o jsonpath='{.metadata.finalizers}'
kubectl patch pod web-a1 -p '{"metadata":{"finalizers":null}}'   # escape hatch: understand why first`},

{title:'Who am I, and who is the pod? (RBAC & ServiceAccounts)',
 state:()=>base({pods:[P('web-a1',1,'running',{note:'Running · sa: default'}),P('ci-runner',3,'running',{note:'Running · sa: deployer'})],hl:['api']}),
 fx(){shoot(AT.client,AT.api,'#ff5c5c',300,800);at(1200,()=>{$('etcdsub').textContent='403 Forbidden: list nodes';});shoot(podCenter(state.pods[1]),AT.api,'#3ddc84',2200,900);at(3200,()=>{$('etcdsub').textContent='200 OK: deployer → get pods';});},
 explain:`Every request to the API server is <b>authenticated</b> (who are you: a cert, a token, the gcloud plugin) and then <b>authorized</b> by RBAC. A <b>Role</b> lists verbs on resources (<code>list pods</code>); a <b>RoleBinding</b> grants it to a user, group or ServiceAccount inside one namespace; the Cluster* versions span the cluster. That <code>nodes is forbidden</code> error on your GKE context was authorization: your Google account has a role covering pods but not nodes. Pods call the API too, as their <b>ServiceAccount</b> (<code>default</code> has almost no rights); give a CI pod its own SA with exactly what it needs.`,
 detail:yaml(`kind: Role
metadata: {name: pod-reader, namespace: dev}
rules:
- apiGroups: [""]
  resources: [pods, pods/log]
  verbs: [get, list, watch]
---
kind: RoleBinding
metadata: {name: ci-reads-pods, namespace: dev}
subjects:
- kind: ServiceAccount
  name: deployer
roleRef: {kind: Role, name: pod-reader, apiGroup: rbac.authorization.k8s.io}`),
 cmd:`kubectl auth can-i list nodes                      # no (on your GKE context)
kubectl auth can-i --list
kubectl auth can-i get pods --as=system:serviceaccount:dev:deployer
kubectl create serviceaccount deployer -n dev`},

{title:'Is it secure by default? (No.) The five basics',
 state:()=>base({pods:[P('web-a1',1,'running',{note:'non-root · read-only fs · limits'}),P('shady-x9',3,'crash',{note:'root · hostPath · no limits'})],hl:['node3']}),
 explain:`A default pod runs as <b>root</b> inside the container, may mount the node's disk with <code>hostPath</code>, and can reach every other pod. Five habits fix most of it. 1) <b>securityContext</b>: non-root, read-only root filesystem, drop capabilities. 2) Keep <b>Secrets</b> out of images and git; encrypt etcd at rest or use an external secret store. 3) Least-privilege <b>RBAC</b>, and <code>automountServiceAccountToken: false</code> for apps that never call the API. 4) <b>NetworkPolicy</b> default-deny per namespace. 5) <b>Resource limits</b>, so one pod cannot starve the node. Pod Security Admission can enforce (1) for a whole namespace.`,
 detail:yaml(`spec:
  automountServiceAccountToken: false
  securityContext:
    runAsNonRoot: true
    runAsUser: 10001
    seccompProfile: {type: RuntimeDefault}
  containers:
  - name: web
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities: {drop: [ALL]}
    resources: {limits: {memory: 256Mi, cpu: 500m}}`),
 cmd:`kubectl label ns dev pod-security.kubernetes.io/enforce=restricted   # reject unsafe pods
kubectl auth can-i --list --as=system:serviceaccount:default:default    # what a default pod may do
kubectl get pods -o yaml | grep -c privileged`},

{title:'How do I stop copy-pasting YAML? (Helm & Kustomize)',
 state:()=>base({deploy:3,pods:three('running',true,{tag:'release: web'}),hl:['client','a-kubectl']}),
 fx(){for(let r=0;r<3;r++)shoot(AT.client,AT.api,'#4f8cff',300+r*500,800);},
 explain:`Real apps are 5–20 YAML files, and dev/staging/prod differ only in replicas, image tag and a few values. <b>Kustomize</b> (built into kubectl) keeps a base plus per-environment <i>overlays</i> that patch it: no templates, just YAML on YAML. <b>Helm</b> is a package manager: a <i>chart</i> is templated YAML plus <code>values.yaml</code>; <code>helm install</code> renders and applies it as a versioned <i>release</i> you can upgrade and roll back. You install third-party things (ingress-nginx, Postgres, Prometheus) from charts and package your own app as a chart or a Kustomize base. Both end the same way: plain objects sent to the API server.`,
 detail:table([['Kustomize','<code>base/</code> + <code>overlays/prod/kustomization.yaml</code> → <code>kubectl apply -k overlays/prod</code>'],['Helm chart','<code>templates/*.yaml</code> + <code>values.yaml</code> → <code>helm install web ./chart -f prod-values.yaml</code>'],['Helm release','<code>helm upgrade</code> · <code>helm rollback</code> · <code>helm uninstall</code>'],['third-party','<code>helm repo add …</code> then <code>helm install</code>'],['GitOps','ArgoCD / Flux apply whatever is in git, continuously']]),
 cmd:`kubectl apply -k overlays/dev
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace
helm list -A`},

{title:'What are CRDs and Operators?',
 state:()=>base({pods:[P('pg-operator',1,'running',{tag:'controller'}),P('db-0',2,'running',{vol:true,tag:'made by it'}),P('db-1',3,'running',{vol:true,tag:'made by it'})],hl:['api','etcd','ctrl']}),
 fx(){shoot(AT.client,AT.api,'#4f8cff',200,800);at(1000,()=>{$('etcdsub').textContent='kind: PostgresCluster · instances=2';});shoot(AT.etcd,podCenter(state.pods[0]),'#4f8cff',1400,900);shoot(podCenter(state.pods[0]),AT.api,'#f5b83d',2400,900);},
 explain:`Deployment, Service, Pod are just <i>kinds</i> the API server knows about. A <b>CustomResourceDefinition</b> teaches it a new kind (<code>PostgresCluster</code>, <code>Certificate</code>, <code>Application</code>…), stored in etcd like everything else. An <b>Operator</b> is a controller you install as a pod that watches that kind and does the work: creates StatefulSets, takes backups, fails over. It is the same reconcile loop the built-in controllers run, written by someone for their domain. Half of what you install with Helm is CRDs plus an operator: cert-manager, Prometheus Operator, ArgoCD, database operators.`,
 detail:table([['CRD','the schema for a new kind · <code>kubectl get crd</code>'],['custom resource','an instance of it · <code>kubectl get postgresclusters</code>'],['operator','the controller pod that acts on it'],['same loop','watch → compare desired vs actual → act'],['examples','cert-manager, Prometheus Operator, ArgoCD, Strimzi (Kafka), CloudNativePG']]),
 cmd:`kubectl get crd
kubectl api-resources --api-group=cert-manager.io
kubectl explain postgrescluster.spec        # docs come with the CRD`},

{title:'How does all this map to my Docker Desktop cluster?',
 state:()=>base({deploy:3,svc:true,only1:true,pods:three('running',true).map(p=>({...p,node:1})),hl:['node1']}),
 explain:`Docker Desktop (kind, 1 node) is exactly this picture with one node. <b>Every step above still happens</b>: apply → etcd → controller → scheduler → kubelet → Service; the Scheduler simply has one option. Deployments, Services, probes, ConfigMaps, PVCs, rolling updates all behave the same, so it's a real place to learn. The only thing you can't practice is surviving a node failure. Two Docker Desktop specifics: images you <code>docker build</code> locally are usable directly (containerd image store) with <code>imagePullPolicy: IfNotPresent</code>, and turning Kubernetes off <b>deletes the cluster</b>.`,
 detail:table([['context','<code>docker-desktop</code>; your kubectl also has prod GKE contexts, check before every command'],['LoadBalancer','works; <code>cloud-provider-kind</code> maps it to localhost'],['NodePort','<code>localhost:3xxxx</code>'],['storage','default <code>hostpath</code> StorageClass'],['Ingress','install ingress-nginx yourself'],['local images','<code>docker build -t myapp:dev .</code> then use <code>image: myapp:dev</code>'],['pause?','no; toggle off = delete. Use <code>kind</code>/<code>minikube</code> CLI if you need stop/start']]),
 cmd:`kubectl config use-context docker-desktop   # switch away from the GKE contexts
kubectl config current-context
kubectl get nodes
kubectl create deployment web --image=nginx --replicas=3
kubectl get pods -o wide                     # all on the one node
kubectl expose deployment web --port 80 --type=LoadBalancer
open http://localhost                        # via cloud-provider-kind
kubectl scale deployment web --replicas=6
kubectl describe pod <name>                  # read the Events section`},

{title:'What should I learn next?',
 state:()=>base({deploy:3,svc:true,pods:three('running',true),hl:['api']}),
 explain:`You now have the model: <b>desired state in etcd, controllers closing the gap, scheduler placing pods, kubelet running them, Services and DNS wiring them up</b>; everything else is a kind plus a controller. Next, move it to a <b>managed cluster</b>: on GKE the control plane is Google's, nodes are VMs in node pools, and LoadBalancer / Ingress / PVC map to Google's load balancer, disks, etc. Everything in this tutorial applies unchanged. Then add <b>observability</b> (metrics-server → Prometheus + Grafana, central logs) and <b>GitOps</b> so git, not a laptop, is the desired state. A practical path: deploy one real app of yours here end to end, then on GKE staging.`,
 detail:table([['practice','deploy your compose stack here: Deployment + Service per container, PVC for the db'],['GKE specifics','node pools, Workload Identity, GKE Ingress, Autopilot'],['observability','metrics-server → Prometheus + Grafana; <code>kubectl logs</code> → Loki / Cloud Logging'],['GitOps','ArgoCD / Flux: git is the desired state'],['service mesh','Istio / Linkerd: mTLS, retries, traffic splitting, when you need it'],['reference','<code>kubectl explain</code> and the official docs beat any blog post']]),
 cmd:`kubectl auth can-i list nodes              # RBAC check (no on your GKE context)
kubectl auth can-i --list
kubectl api-resources                      # every kind the cluster knows
kubectl explain <kind> --recursive | less  # built-in docs for any field`},
];

function go(n){
  if(n<0||n>=steps.length)return;
  timers.forEach(clearTimeout);timers=[];gen++;$('packets').innerHTML='';
  current=n;state=steps[n].state();render();
  if(steps[n].fx)steps[n].fx();
  $('title').textContent=steps[n].title;$('count').textContent=`${n+1} / ${steps.length}`;
  $('explain').innerHTML=steps[n].explain;$('cmd').textContent=steps[n].cmd;$('detail').innerHTML=steps[n].detail||'';
  [...$('steps').querySelectorAll('li[data-i]')].forEach(li=>{const i=+li.dataset.i;li.classList.toggle('active',i===n);li.classList.toggle('done',i<n);});
  // Keep lesson changes inside the lab; fragment navigation reloads the parent file in srcdoc.
  if(autoplay&&n===steps.length-1)stopPlay();
}
function stopPlay(){clearInterval(autoplay);autoplay=null;$('play').textContent='▶ Autoplay';}
function togglePlay(){if(autoplay)return stopPlay();autoplay=T.setInterval(()=>go(current+1),11000);$('play').textContent='⏸ Stop';if(current===steps.length-1)go(0);}

drawNodes();
steps.forEach((s,i)=>{
  if(s.ch){const h=document.createElement('li');h.className='ch';h.textContent=s.ch;$('steps').appendChild(h);}
  const li=document.createElement('li');li.dataset.i=i;li.innerHTML=`<span>${i+1}</span><span>${s.title}</span>`;li.onclick=()=>go(i);$('steps').appendChild(li);
});
$('prev').onclick=()=>go(current-1);$('next').onclick=()=>go(current+1);$('play').onclick=togglePlay;
root.addEventListener('keydown',e=>{if(mode!=='tut'||e.target.tagName==='INPUT')return;if(e.key==='ArrowRight')go(current+1);else if(e.key==='ArrowLeft')go(current-1);else if(e.key===' '){e.preventDefault();togglePlay();}});

/* ═══════════════════ PLAYGROUND ═══════════════════ */
const CHARTS={
 'lab/nginx':{desc:'nginx web server + ClusterIP Service',values:{replicas:2,'image.tag':'1.27'},
   objects:(v,nm)=>[{kind:'deploy',name:nm('web'),image:'nginx:'+v['image.tag'],replicas:+v.replicas,port:80},{kind:'svc',name:nm('web'),app:nm('web'),port:80,type:'ClusterIP'}]},
 'lab/shop':{desc:'frontend → api → db microservices, Services, Ingress (api also calls the internet)',values:{replicas:2,'image.tag':'v1',host:'shop.local'},
   objects:(v,nm)=>[
     {kind:'deploy',name:nm('frontend'),image:'shop/frontend:'+v['image.tag'],replicas:+v.replicas,port:80,calls:[nm('api')]},
     {kind:'deploy',name:nm('api'),image:'shop/api:'+v['image.tag'],replicas:+v.replicas,port:8080,calls:[nm('db'),'internet']},
     {kind:'deploy',name:nm('db'),image:'postgres:16',replicas:1,port:5432,vol:true},
     {kind:'svc',name:nm('frontend'),app:nm('frontend'),port:80,type:'ClusterIP'},
     {kind:'svc',name:nm('api'),app:nm('api'),port:80,type:'ClusterIP'},
     {kind:'svc',name:nm('db'),app:nm('db'),port:5432,type:'ClusterIP'},
     {kind:'ingress',name:nm('shop'),host:v.host,rules:[{path:'/',svc:nm('frontend')},{path:'/api',svc:nm('api')}]}]},
 'lab/postgres':{desc:'single Postgres with a persistent volume + Service',values:{},
   objects:(v,nm)=>[{kind:'deploy',name:nm('postgres'),image:'postgres:16',replicas:1,port:5432,vol:true},{kind:'svc',name:nm('postgres'),app:nm('postgres'),port:5432,type:'ClusterIP'}]},
 'lab/redis':{desc:'Redis cache + Service',values:{replicas:1},
   objects:(v,nm)=>[{kind:'deploy',name:nm('redis'),image:'redis:7',replicas:+v.replicas,port:6379},{kind:'svc',name:nm('redis'),app:nm('redis'),port:6379,type:'ClusterIP'}]},
 'lab/ingress-nginx':{desc:'Ingress controller: REQUIRED for any Ingress rule to carry traffic',values:{replicas:1},
   objects:(v,nm)=>[{kind:'deploy',name:nm('ingress-nginx'),image:'ingress-nginx:1.11',replicas:+v.replicas,port:80,controller:true},{kind:'svc',name:nm('ingress-nginx'),app:nm('ingress-nginx'),port:80,type:'LoadBalancer'}]},
};
let lab=null,mode='tut',tick=null,traffic=null,hist=[],hi=0;
let practiceStep=-1,practiceDeleted=null,learningPaused=false;
const out=(s,cls)=>{const o=$('termout'),d=document.createElement('div');if(cls)d.className=cls;d.textContent=s;o.appendChild(d);while(o.children.length>300)o.firstChild.remove();o.scrollTop=o.scrollHeight;};
const EV=[];
const ev=s=>{EV.push(s);if(EV.length>60)EV.shift();out('  · '+s,'ev');};
const rid=()=>Math.random().toString(36).slice(2,5);
const hash=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h.toString(16).slice(-2);};
const tagOf=img=>img.includes(':')?img.split(':')[1]:'latest';
const alivePods=name=>lab.pods.filter(p=>p.app===name&&!['dead','term'].includes(p.status));
const readyPods=name=>lab.pods.filter(p=>p.app===name&&p.status==='running');
const pick=a=>a[Math.floor(Math.random()*a.length)];
const freshLab=()=>({deploys:{},services:{},ingresses:{},releases:{},configs:{},pvcs:{},pods:[],dead:[],paused:false});
const labs={};
function labReset(){if(mode==='play'){practiceStep=-1;practiceDeleted=null;}lab=labs[mode]=freshLab();if(mode==='play'){$('termout').innerHTML='';out('lab cluster ready · 3 nodes · empty. Type help, or press a button on the left.','ok');}}
const sigOf=d=>JSON.stringify(d.labels||{app:d.name});
function newPod(d){const p={id:`${d.name}-${hash(d.image)}${rid()}`,app:d.name,image:d.image,labels:d.labels||{app:d.name},sig:sigOf(d),node:null,status:'pending',vol:d.vol,restarts:0,since:0,note:null};lab.pods.push(p);ev(`replicaset/${d.name}-${hash(d.image)}: created pod ${p.id}`);return p;}
const matches=(labels,sel)=>Object.entries(sel||{}).every(([k,v])=>String((labels||{})[k])===String(v));
const svcReady=s=>s.selector?lab.pods.filter(p=>p.status==='running'&&matches(p.labels,s.selector)):readyPods(s.app);
const wantOf=d=>d.perNode?3-lab.dead.length:d.replicas;
const ctrlUp=()=>Object.values(lab.deploys).some(d=>d.controller&&readyPods(d.name).length);

function reconcile(){
  if(timers.length>400)timers=[];
  lab.pods.forEach(p=>{if(p.node&&lab.dead.includes(p.node)&&p.status!=='dead'){p.status='dead';p.since=0;ev(`node-${p.node} NotReady → pod ${p.id} lost`);}});
  lab.pods=lab.pods.filter(p=>{if(p.status==='dead'||p.status==='term'){p.since++;return p.since<=(p.status==='dead'?5:2);}return true;});
  lab.pods.forEach(p=>{if(!lab.deploys[p.app]&&!['dead','term'].includes(p.status)){p.status='term';p.since=0;ev(`garbage collector: ${p.id} has no owner → terminating`);}});
  for(const d of Object.values(lab.deploys)){
    const want=wantOf(d),sig=sigOf(d);
    const mine=alivePods(d.name),cur=mine.filter(p=>p.image===d.image&&p.sig===sig),old=mine.filter(p=>!(p.image===d.image&&p.sig===sig));
    if(d.job&&cur.length>=want)continue;
    if(old.length&&mine.length<=want)newPod(d);
    else if(old.length&&cur.some(p=>p.status==='running')&&mine.length>want){const o=old[0];o.status='term';o.since=0;ev(`rollout ${d.name}: terminating old pod ${o.id}`);if(old.length===1)ev(`deployment/${d.name}: rollout complete → ${d.image}`);}
    else if(!old.length&&mine.length<want)newPod(d);
    else if(!old.length&&mine.length>want){const x=mine[mine.length-1];x.status='term';x.since=0;ev(`replicaset/${d.name}: scaling down → terminating ${x.id}`);}
  }
  lab.pods.filter(p=>p.status==='pending'&&p.node==null).forEach(p=>{
    const d=lab.deploys[p.app];
    if(d&&d.pvcMissing){const n=`Pending · PVC not found`;if(p.note!==n){p.note=n;ev(`scheduler: ${p.id} Pending, persistentvolumeclaim "${d.pvcMissing}" not found`);}return;}
    let cand=[1,2,3].filter(n=>!lab.dead.includes(n));
    if(d&&d.perNode)cand=cand.filter(n=>!lab.pods.some(q=>q!==p&&q.app===p.app&&q.node===n&&!['dead','term'].includes(q.status)));
    const nodes=cand.map(n=>({n,c:lab.pods.filter(q=>q.node===n&&q.status!=='dead').length})).filter(x=>x.c<8).sort((a,b)=>a.c-b.c);
    if(!nodes.length){if(p.note!=='Pending · 0/3 nodes available'){p.note='Pending · 0/3 nodes available';ev(`scheduler: ${p.id} Pending, no node has room`);}return;}
    p.node=nodes[0].n;p.note='ContainerCreating';ev(`scheduler: ${p.id} → node-${p.node}`);
  });
  lab.pods.filter(p=>p.status==='pending'&&p.node&&p.note==='ContainerCreating').forEach(p=>{const d=lab.deploys[p.app];
    if(d&&d.missing&&d.missing.length){p.status='crash';p.note='CreateContainerConfigError';p.since=0;ev(`kubelet node-${p.node}: ${p.id} CreateContainerConfigError: ${d.missing[0]} not found`);return;}
    if(Math.random()<0.6){p.status='running';p.note=null;p.since=0;ev(`kubelet node-${p.node}: pulled ${p.image}, started ${p.id}`);}});
  lab.pods.filter(p=>p.status==='running'&&lab.deploys[p.app]&&lab.deploys[p.app].job).forEach(p=>{if(++p.since>4){p.status='done';p.note='Completed';ev(`job/${p.app}: ${p.id} completed`);}});
  lab.pods.filter(p=>p.status==='crash').forEach(p=>{const d=lab.deploys[p.app];
    if(p.note==='CreateContainerConfigError'){if(d&&!(d.missing&&d.missing.length)){p.status='running';p.note=null;ev(`kubelet node-${p.node}: config found, started ${p.id}`);}return;}
    if(++p.since>2){p.status='running';p.restarts++;p.note=`Running · restarts: ${p.restarts}`;ev(`kubelet node-${p.node}: restarted ${p.id} (backoff ${10*p.restarts}s)`);}});
  drawLab();
}

function drawLab(){
  const ings=Object.values(lab.ingresses),up=ctrlUp();
  state=base({
    pods:lab.pods.map(p=>({id:p.id,node:p.node,status:p.status,tag:'',note:`${p.note||ST[p.status]} · ${tagOf(p.image)}`,vol:p.vol,app:p.app})),
    dead:lab.dead,links:true,inet:true,ingress:ings.length>0,
    services:Object.values(lab.services).map(s=>{const r=svcReady(s);return {...s,ready:r.length,podIds:r.map(p=>p.id)};}),
    ingText:ings.length?[`Ingress · ${ings.map(i=>i.host).join(', ')}`,ings.flatMap(i=>i.rules.map(r=>`${i.host}${r.path} → svc/${r.svc}`)).join('   ')+(up?'   ·   controller ✓':'   ·   NO INGRESS CONTROLLER → traffic dropped'+(mode==='play'?' · helm install ingress-nginx lab/ingress-nginx':' · add a Deployment named ingress-nginx'))]:null,
    hl:[]});
  render();
  $('etcdsub').textContent=`${Object.keys(lab.deploys).length} deploy · ${lab.pods.length} pod · ${Object.keys(lab.services).length} svc · ${ings.length} ing`;
  $('res').textContent=resources();
  updatePractice();
  if(mode==='yaml'){$('yres').textContent=resources()+'\n\nEVENTS\n'+EV.slice(-8).map(e=>'· '+e).join('\n');if(view==='topo')drawTopo();}
}

function trafficTick(){
  if(lab.paused||learningPaused)return;
  const ings=Object.values(lab.ingresses),svcs=Object.values(lab.services),up=ctrlUp();
  const ext=svcs.filter(s=>s.type!=='ClusterIP');
  if(ings.length&&up){const i=pick(ings),r=pick(i.rules);shoot(AT.client,AT.ing,'#3ddc84',0,600);hop(AT.ing,r.svc,650);}
  else if(ext.length){const s=pick(ext);shoot(AT.client,labSvcPos[s.name],'#3ddc84',0,500);toPod(s,550,'#3ddc84');if(ings.length)shoot(AT.client,AT.ing,'#ff5c5c',400,600);}
  else if(ings.length)shoot(AT.client,AT.ing,'#ff5c5c',0,600);
  const callers=Object.values(lab.deploys).filter(d=>d.calls&&readyPods(d.name).length);
  if(callers.length){const d=pick(callers),sid=pick(readyPods(d.name)).id,src=state.pods.find(p=>p.id===sid),tgt=pick(d.calls);if(!src)return;const from=podCenter(src);
    if(tgt==='internet')shoot(from,AT.inet,'#f5b83d',300,900);
    else if(lab.services[tgt]){const ok=svcReady(lab.services[tgt]).length>0;shoot(from,labSvcPos[tgt],ok?'#4f8cff':'#ff5c5c',300,700);if(ok)toPod(lab.services[tgt],1000,'#4f8cff');}
    else shoot(from,[from[0],from[1]-40],'#ff5c5c',300,400);}
}
function hop(from,svcName,delay){const s=lab.services[svcName];if(!s||!labSvcPos[svcName])return;shoot(from,labSvcPos[svcName],'#3ddc84',delay,400);toPod(s,delay+450,'#3ddc84');}
function toPod(s,delay,color){const ps=svcReady(s);if(!ps.length||!labSvcPos[s.name])return;const sp=state.pods.find(q=>q.id===pick(ps).id);if(sp)shoot(labSvcPos[s.name],podCenter(sp),color,delay,600);}

function resources(){
  const L=[],D=Object.values(lab.deploys),S=Object.values(lab.services),I=Object.values(lab.ingresses),R=Object.entries(lab.releases);
  L.push('NODES   '+[1,2,3].map(n=>`node-${n} ${lab.dead.includes(n)?'NotReady':'Ready'} (${lab.pods.filter(p=>p.node===n&&p.status==='running').length} running)`).join('   '));
  L.push('','DEPLOYMENT'.padEnd(20)+'READY  IMAGE');D.forEach(d=>L.push(d.name.padEnd(20)+`${readyPods(d.name).filter(p=>p.image===d.image).length}/${d.replicas}`.padEnd(7)+d.image));if(!D.length)L.push('  (none)  →  kubectl create deployment web --image=nginx');
  L.push('','SERVICE'.padEnd(20)+'TYPE          ENDPOINTS');S.forEach(s=>L.push(s.name.padEnd(20)+s.type.padEnd(14)+svcReady(s).length));if(!S.length&&D.length&&mode==='play')L.push('  (none)  →  kubectl expose deploy '+D[0].name+' --port=80');
  const C=Object.values(lab.configs||{}),V=Object.values(lab.pvcs||{});if(C.length||V.length){L.push('','CONFIG'.padEnd(20)+'KIND');C.forEach(c=>L.push(c.name.padEnd(20)+c.ckind+' · '+c.keys+' keys'));V.forEach(v=>L.push(v.name.padEnd(20)+'PersistentVolumeClaim · '+v.size));}
  L.push('','INGRESS'.padEnd(20)+'RULES'+(I.length&&!ctrlUp()?'   (no controller!)':''));I.forEach(i=>L.push(i.name.padEnd(20)+i.rules.map(r=>`${i.host}${r.path}→${r.svc}`).join(', ')));
  L.push('','HELM RELEASE'.padEnd(20)+'CHART              REV');R.forEach(([n,r])=>L.push(n.padEnd(20)+r.chart.padEnd(19)+r.rev));
  return L.join('\n');
}

const KIND=k=>({po:'pod',pod:'pod',pods:'pod',deploy:'deploy',deployment:'deploy',deployments:'deploy',svc:'svc',service:'svc',services:'svc',ing:'ingress',ingress:'ingress',ingresses:'ingress',no:'node',node:'node',nodes:'node',all:'all',rs:'rs',replicaset:'rs',replicasets:'rs',events:'events',ev:'events'})[k];
const ref=a=>{let k=a[0],n=a[1];if(k&&k.includes('/'))[k,n]=k.split('/');return [KIND(k),n];};
const need=(x,msg)=>{if(!x)throw Error(msg);return x;};
const row=(...c)=>c.map((x,i)=>String(x).padEnd([26,9,20,10][i]||10)).join('');
const podStatus=p=>({pending:p.note==='ContainerCreating'?'ContainerCreating':'Pending',running:'Running',crash:p.note==='CreateContainerConfigError'?p.note:'CrashLoopBackOff',term:'Terminating',dead:'Unknown',done:'Completed'})[p.status];
function applyObjects(objs,rel){
  const names=[];
  objs.forEach(o=>{names.push(o.kind+'/'+o.name);
    if(o.kind==='deploy'){const d=lab.deploys[o.name],{kind,...rest}=o;if(d){if(d.image!==o.image){d.history.push(d.image);ev(`deployment/${d.name}: image ${d.image} → ${o.image} (rolling update)`);}else if(d.replicas!==o.replicas)ev(`deployment/${d.name}: replicas ${d.replicas} → ${o.replicas}`);Object.assign(d,rest);}
      else{lab.deploys[o.name]={...rest,history:[]};ev(`${(o.wkind||'deployment').toLowerCase()}/${o.name} created (replicas=${o.replicas}, image=${o.image})`);}}
    if(o.kind==='svc'){const {kind,...rest}=o;if(!lab.services[o.name])ev(`service/${o.name} created (${o.type})`);lab.services[o.name]=rest;}
    if(o.kind==='ingress'){if(!lab.ingresses[o.name])ev(`ingress/${o.name} created`);lab.ingresses[o.name]={name:o.name,host:o.host,rules:o.rules};}});
  return names;
}
function del(kind,name){
  if(kind==='pod'){const p=need(lab.pods.find(q=>q.id===name),`pod "${name}" not found`);p.status='term';p.since=0;out(`pod "${name}" deleted`);}
  else if(kind==='deploy'){need(lab.deploys[name],`deployment "${name}" not found`);delete lab.deploys[name];out(`deployment.apps "${name}" deleted`);}
  else if(kind==='svc'){need(lab.services[name],`service "${name}" not found`);delete lab.services[name];out(`service "${name}" deleted`);}
  else if(kind==='ingress'){need(lab.ingresses[name],`ingress "${name}" not found`);delete lab.ingresses[name];out(`ingress "${name}" deleted`);}
  else throw Error(`cannot delete kind "${kind}"`);
}
const CMDS={
 help(){out(`kubectl get pods|deploy|svc|ingress|nodes|all [-o wide]
kubectl create deployment NAME --image=IMG [--replicas=N] [--port=P]
kubectl scale deploy NAME --replicas=N
kubectl set image deploy/NAME CONTAINER=IMG          (rolling update)
kubectl rollout undo|status|history deploy/NAME
kubectl expose deploy NAME --port=P [--type=ClusterIP|NodePort|LoadBalancer]
kubectl create ingress NAME --rule="host/path=svc:port" [--rule=...]
kubectl delete pod|deploy|svc|ingress NAME
kubectl drain node-N   ·   kubectl uncordon node-N
kubectl describe pod NAME   ·   kubectl logs NAME
helm search repo lab · helm show values CHART · helm install REL CHART [--set k=v,...]
helm upgrade REL CHART --set k=v · helm rollback REL · helm uninstall REL · helm list
crash [POD]   (simulate an app crash)   ·   clear   ·   reset`);},
 clear(){$('termout').innerHTML='';},
 reset(){labReset();},
 crash(a){const p=a[0]?need(lab.pods.find(q=>q.id===a[0]),`pod "${a[0]}" not found`):need(pick(lab.pods.filter(q=>q.status==='running')),'no running pod to crash');p.status='crash';p.since=0;p.note='CrashLoopBackOff';out(`${p.id}: process exited with code 1`,'e');},
 kubectl(a,f){
  const sub=a[0],r=ref(a.slice(1));
  switch(sub){
   case 'get':{const [k,n]=r;need(k,`the server doesn't have a resource type "${a[1]}"`);const all=k==='all';
     if(all||k==='deploy'){out(row('NAME','READY','IMAGE','AGE'));Object.values(lab.deploys).filter(d=>!n||d.name===n).forEach(d=>out(row('deployment.apps/'+d.name,`${readyPods(d.name).filter(p=>p.image===d.image).length}/${d.replicas}`,d.image,'')));}
     if(all||k==='rs'){Object.values(lab.deploys).forEach(d=>[d.image,...d.history].forEach((img,i)=>out(row(`replicaset.apps/${d.name}-${hash(img)}`,`${lab.pods.filter(p=>p.app===d.name&&p.image===img&&p.status==='running').length}/${i?0:d.replicas}`,img,''))));}
     if(all||k==='pod'){out(row('NAME','READY','STATUS','RESTARTS','NODE'));lab.pods.filter(p=>!n||p.id===n).forEach(p=>out(row('pod/'+p.id,p.status==='running'?'1/1':'0/1',podStatus(p),p.restarts,p.node?'node-'+p.node:'<none>')));}
     if(all||k==='svc'){out(row('NAME','TYPE','CLUSTER-IP','PORT','ENDPOINTS'));Object.values(lab.services).filter(s=>!n||s.name===n).forEach(s=>out(row('service/'+s.name,s.type,'10.96.'+hash(s.name).charCodeAt(0)+'.'+hash(s.name).charCodeAt(1),s.port+(s.type==='ClusterIP'?'':':30080'),svcReady(s).length)));}
     if(all||k==='ingress'){out(row('NAME','CLASS','HOSTS','RULES'));Object.values(lab.ingresses).forEach(i=>out(row('ingress/'+i.name,ctrlUp()?'nginx':'<none>',i.host,i.rules.map(x=>x.path+'→'+x.svc).join(','))));}
     if(k==='node'){out(row('NAME','STATUS','ROLES','PODS'));[1,2,3].forEach(i=>out(row('node-'+i,lab.dead.includes(i)?'NotReady,SchedulingDisabled':'Ready','worker',lab.pods.filter(p=>p.node===i&&p.status==='running').length)));}
     if(k==='events')out('(events stream inline in this terminal as grey lines)');break;}
   case 'create':{const what=a[1],name=need(a[2],'name required');
     if(what==='deployment'||what==='deploy'){need(f.image,'--image is required');need(!lab.deploys[name],`deployment "${name}" already exists`);applyObjects([{kind:'deploy',name,image:f.image,replicas:+(f.replicas||1),port:+(f.port||80)}]);out(`deployment.apps/${name} created`);}
     else if(what==='ingress'||what==='ing'){const rules=[].concat(need(f.rule,'--rule="host/path=svc:port" is required')).map(s=>{const m=need(s.match(/^([^/]*)(\/[^=]*)=([^:]+)(?::(\d+))?$/),`bad --rule "${s}" (want host/path=svc:port)`);return {host:m[1]||'*',path:m[2],svc:m[3]};});
       rules.forEach(x=>need(lab.services[x.svc],`service "${x.svc}" not found (expose the deployment first)`));applyObjects([{kind:'ingress',name,host:rules[0].host,rules}]);out(`ingress.networking.k8s.io/${name} created`);if(!ctrlUp())out('note: no ingress controller running, rules will not carry traffic → helm install ingress-nginx lab/ingress-nginx','e');}
     else if(what==='namespace'||what==='ns')out(`namespace/${name} created (namespaces are not visualised here)`);
     else throw Error(`create ${what}: not supported in the lab`);break;}
   case 'expose':{const [k,n]=r;need(k==='deploy',`expose ${a[1]}: only deployments here`);const d=need(lab.deploys[n],`deployment "${n}" not found`);const nm=f.name||n;
     applyObjects([{kind:'svc',name:nm,app:d.name,port:+(f.port||d.port),type:f.type||'ClusterIP'}]);out(`service/${nm} exposed (${f.type||'ClusterIP'})`);break;}
   case 'scale':{const [k,n]=r;const d=need(lab.deploys[n],`deployment "${n}" not found`);d.replicas=+need(f.replicas,'--replicas required');out(`deployment.apps/${n} scaled to ${d.replicas}`);break;}
   case 'set':{need(a[1]==='image','only "set image" is supported');const [k,n]=ref([a[2]]);const d=need(lab.deploys[n],`deployment "${n}" not found`);const img=need((a[3]||'').split('=')[1],'want CONTAINER=IMAGE');
     if(img===d.image){out('unchanged');break;}d.history.push(d.image);d.image=img;out(`deployment.apps/${n} image updated → ${img}`);ev(`deployment/${n}: new ReplicaSet ${n}-${hash(img)}, rolling update starts`);break;}
   case 'rollout':{const [k,n]=ref([a[2]]);const d=need(lab.deploys[n],`deployment "${n}" not found`);
     if(a[1]==='undo'){const prev=need(d.history.pop(),'no previous revision');ev(`deployment/${n}: rolling back ${d.image} → ${prev}`);d.image=prev;out(`deployment.apps/${n} rolled back`);}
     else if(a[1]==='status'){const cur=readyPods(n).filter(p=>p.image===d.image).length;out(cur>=d.replicas?`deployment "${n}" successfully rolled out`:`Waiting for rollout: ${cur} of ${d.replicas} updated replicas are available...`);}
     else if(a[1]==='history'){[...d.history,d.image].forEach((img,i)=>out(`${i+1}\t${img}${i===d.history.length?'  (current)':''}`));}
     else throw Error('rollout undo|status|history');break;}
   case 'delete':{const [k,n]=r;need(k&&n,'usage: kubectl delete KIND NAME');del(k,n);break;}
   case 'drain':case 'cordon':{const i=+need((a[1]||'').match(/node-([123])/)?.[1],'usage: kubectl drain node-N');if(!lab.dead.includes(i))lab.dead.push(i);out(`node/node-${i} cordoned; evicting pods`);break;}
   case 'uncordon':{const i=+need((a[1]||'').match(/node-([123])/)?.[1],'usage: kubectl uncordon node-N');lab.dead=lab.dead.filter(x=>x!==i);out(`node/node-${i} uncordoned`);break;}
   case 'describe':{const [k,n]=r;if(k==='pod'){const p=need(lab.pods.find(q=>q.id===n),`pod "${n}" not found`);out(`Name: ${p.id}\nNode: ${p.node?'node-'+p.node:'<none>'}\nStatus: ${podStatus(p)}\nImage: ${p.image}\nRestarts: ${p.restarts}\nLabels: app=${p.app}\nControlled By: ReplicaSet/${p.app}-${hash(p.image)}\nEvents: see the grey lines above`);}else out('describe: only pods in the lab');break;}
   case 'logs':{const p=need(lab.pods.find(q=>q.id===a[1]),`pod "${a[1]}" not found`);for(let i=0;i<4;i++)out(`${new Date(Date.now()-i*3000).toISOString()} ${p.status==='crash'?'FATAL: connection refused, exiting':'GET / 200 '+(5+Math.floor(Math.random()*40))+'ms'}`);break;}
   case 'apply':out('no filesystem in the lab; use kubectl create / helm install (same API calls underneath)','e');break;
   case 'config':out(a[1]==='current-context'?'lab':'current-context: lab');break;
   case 'version':out('Client v1.34.1  Server v1.34.3 (simulated)');break;
   default:throw Error(`kubectl ${sub||''}: unknown or unsupported here. Type help`);
  }},
 helm(a,f){
  const sub=a[0];
  if(sub==='repo')out('NAME\tURL\nlab\tbuilt into this page');
  else if(sub==='search'){out(row('NAME','VERSION','DESCRIPTION'));Object.entries(CHARTS).forEach(([n,c])=>out(row(n,'0.1.0',c.desc)));}
  else if(sub==='show'){const c=need(CHARTS[a[2]],`chart "${a[2]}" not found`);out(Object.entries(c.values).map(([k,v])=>`${k}: ${v}`).join('\n')||'# no configurable values');}
  else if(sub==='list'||sub==='ls'){out(row('NAME','REV','CHART','STATUS'));Object.entries(lab.releases).forEach(([n,r])=>out(row(n,r.rev,r.chart,'deployed')));}
  else if(sub==='install'||sub==='upgrade'){
    const rel=need(a[1],'usage: helm install RELEASE CHART'),chart=need(a[2],'chart required'),c=need(CHARTS[chart],`chart "${chart}" not found (helm search repo lab)`),prev=lab.releases[rel];
    if(sub==='install'&&prev)throw Error(`cannot re-use a name that is still in use ("${rel}")`);if(sub==='upgrade'&&!prev)throw Error(`"${rel}" has no deployed releases`);
    const values={...c.values,...(prev?prev.values:{})};[].concat(f.set||[]).forEach(s=>s.split(',').forEach(kv=>{const [k,v]=kv.split('=');values[k]=v;}));
    const nm=n=>n===rel?n:`${rel}-${n}`;const names=applyObjects(c.objects(values,nm),rel);
    lab.releases[rel]={chart,values,rev:(prev?prev.rev:0)+1,prev:prev?prev.values:null,names};
    out(`Release "${rel}" ${sub==='install'?'has been installed':'has been upgraded'}. Happy Helming!  (revision ${lab.releases[rel].rev})`,'ok');
    if(names.some(n=>n.startsWith('ingress/'))&&!ctrlUp())out('note: this chart has an Ingress but no ingress controller is running → helm install ingress-nginx lab/ingress-nginx','e');}
  else if(sub==='rollback'){const r=need(lab.releases[a[1]],`release "${a[1]}" not found`);need(r.prev,'no previous revision');const nm=n=>n===a[1]?n:`${a[1]}-${n}`;applyObjects(CHARTS[r.chart].objects(r.prev,nm),a[1]);r.values=r.prev;r.prev=null;r.rev++;out(`Rollback was a success! Happy Helming!`,'ok');}
  else if(sub==='uninstall'||sub==='delete'){const r=need(lab.releases[a[1]],`release "${a[1]}" not found`);r.names.forEach(n=>{const [k,name]=n.split('/');try{del(k,name);}catch(e){}});delete lab.releases[a[1]];out(`release "${a[1]}" uninstalled`);}
  else if(sub==='template'){const c=need(CHARTS[a[2]],`chart "${a[2]}" not found`);out(JSON.stringify(c.objects(c.values,n=>n),null,1));}
  else throw Error('helm search|show values|install|upgrade|rollback|uninstall|list|template');
 },
};
function run(line){
  line=line.trim();if(!line)return;out('$ '+line,'c');hist.push(line);hi=hist.length;
  const toks=(line.match(/"[^"]*"|'[^']*'|\S+/g)||[]).map(t=>t.replace(/^["']|["']$/g,''));const f={},a=[];
  for(let i=0;i<toks.length;i++){const t=toks[i];
    if(t.startsWith('--')){let [k,v]=t.slice(2).split(/=(.*)/s);if(v===undefined){if(toks[i+1]&&!toks[i+1].startsWith('-'))v=toks[++i];else v=true;}f[k]=f[k]===undefined?v:[].concat(f[k],v);}
    else if(t==='-f'||t==='-n'||t==='-o'){i++;}else if(t==='-w')continue;else a.push(t);}
  try{(CMDS[a[0]]||(()=>{throw Error(`${a[0]}: command not found (try: help)`);}))(a.slice(1),f);}catch(e){out('error: '+e.message,'e');}
  drawLab();opts.onRun?.(line);
}
let view='cluster';
function setMode(m){
  mode=m;gen++;timers.forEach(clearTimeout);timers=[];$('packets').innerHTML='';stopPlay();clearInterval(tick);clearInterval(traffic);tick=traffic=null;
  ['tut','play','yaml'].forEach(k=>$('tab-'+k).classList.toggle('on',m===k));
  $('steps').style.display=m==='tut'?'':'none';$('tuthint').style.display=m==='tut'?'':'none';$('lab').style.display=m==='play'?'block':'none';$('ydoc').style.display=m==='yaml'?'block':'none';
  $('tutfoot').style.display=m==='tut'?'grid':'none';$('playfoot').style.display=m==='play'?'grid':'none';$('yamlfoot').style.display=m==='yaml'?'grid':'none';
  const live=m!=='tut';root.querySelectorAll('.node').forEach(n=>n.classList.toggle('play',live));
  podEls.forEach(g=>g.remove());podEls.clear();
  setView(m==='yaml'?view:'cluster');
  if(live){lab=labs[m]||(labs[m]=freshLab());if(m==='play'&&!$('termout').children.length)out('lab cluster ready · 3 nodes · empty. Type help, or press a button on the left.','ok');drawLab();tick=T.setInterval(()=>{if(!learningPaused)reconcile()},700);traffic=T.setInterval(trafficTick,1100);(m==='play'?$('termin'):$('yaml')).focus();}
  else go(current);
  updatePractice();
}
function setView(v){if(mode==='yaml')view=v;$('stage').style.display=v==='topo'?'none':'';$('topo').style.display=v==='topo'?'block':'none';$('v-cluster').classList.toggle('on',v!=='topo');$('v-topo').classList.toggle('on',v==='topo');if(v==='topo'&&lab)drawTopo();}
const QA=[
 ['Deploy nginx ×2',()=>'kubectl create deployment web --image=nginx:1.27 --replicas=2'],
 ['Scale web +1',()=>`kubectl scale deploy web --replicas=${(lab.deploys.web?lab.deploys.web.replicas:0)+1}`],
 ['Scale web −1',()=>`kubectl scale deploy web --replicas=${Math.max(0,(lab.deploys.web?lab.deploys.web.replicas:1)-1)}`],
 ['Expose web (LoadBalancer)',()=>'kubectl expose deploy web --port=80 --type=LoadBalancer'],
 ['Ingress for web',()=>'kubectl create ingress web --rule=web.local/=web:80'],
 ['Roll out nginx:1.28',()=>'kubectl set image deploy/web web=nginx:1.28'],
 ['Undo rollout',()=>'kubectl rollout undo deploy/web'],
 ['Crash a pod',()=>'crash'],
 ['Drain node-2',()=>'kubectl drain node-2'],
 ['Uncordon node-2',()=>'kubectl uncordon node-2'],
 ['kubectl get all',()=>'kubectl get all'],
];
QA.forEach(([l,c])=>{const b=document.createElement('button');b.textContent=l;b.onclick=()=>run(c());$('qa').appendChild(b);});
Object.entries(CHARTS).forEach(([n,c])=>{const b=document.createElement('button');b.textContent='helm install '+n.split('/')[1];b.title=c.desc;b.onclick=()=>run(`helm install ${n.split('/')[1]} ${n}`);$('charts').appendChild(b);});
$('tab-tut').onclick=()=>setMode('tut');$('tab-play').onclick=()=>setMode('play');$('tab-yaml').onclick=()=>setMode('yaml');
$('resetbtn').onclick=()=>{labReset();drawLab();};
$('pausebtn').onclick=()=>{lab.paused=!lab.paused;$('pausebtn').textContent=lab.paused?'▶ Traffic':'⏸ Traffic';};
$('termin').addEventListener('keydown',e=>{const i=e.target;
  if(e.key==='Enter'){run(i.value);i.value='';}
  else if(e.key==='ArrowUp'){e.preventDefault();if(hi>0)i.value=hist[--hi];}
  else if(e.key==='ArrowDown'){e.preventDefault();hi=Math.min(hist.length,hi+1);i.value=hist[hi]||'';}});

/* ═══════════════════ MANIFESTS: YAML → cluster ═══════════════════ */
function stripComment(t){let q=null;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c===q)q=null;}else if(c==='"'||c==="'")q=c;else if(c==='#'&&(i===0||/\s/.test(t[i-1])))return t.slice(0,i);}return t;}
const indentOf=t=>t.match(/^ */)[0].length;
function yerr(msg,n){const e=Error(`line ${n}: ${msg}`);e.line=n;return e;}
function scalar(s,n){s=s.trim();if(s==='')return null;if(s[0]==='"'||s[0]==="'")return s.slice(1,-1);if(s[0]==='{'||s[0]==='[')return flow(s,n);
  if(/^-?\d+(\.\d+)?$/.test(s))return +s;if(s==='true')return true;if(s==='false')return false;if(s==='null'||s==='~')return null;return s;}
function flow(s,n){let i=0;const peek=()=>s[i],skip=()=>{while(i<s.length&&/[\s,]/.test(s[i]))i++;};
  function key(){skip();const c=peek();if(c==='"'||c==="'"){i++;const st=i;while(i<s.length&&s[i]!==c)i++;const r=s.slice(st,i);i++;return r;}const st=i;while(i<s.length&&s[i]!==':')i++;return s.slice(st,i).trim();}
  function val(){skip();const c=peek();
    if(c==='{'){i++;const o={};skip();while(peek()!=='}'){if(i>=s.length)throw yerr('unclosed {',n);const k=key();skip();if(peek()!==':')throw yerr('expected ":" inside { }',n);i++;o[k]=val();skip();}i++;return o;}
    if(c==='['){i++;const a=[];skip();while(peek()!==']'){if(i>=s.length)throw yerr('unclosed [',n);a.push(val());skip();}i++;return a;}
    if(c==='"'||c==="'"){i++;const st=i;while(i<s.length&&s[i]!==c)i++;const r=s.slice(st,i);i++;return r;}
    const st=i;while(i<s.length&&!/[,}\]]/.test(s[i]))i++;return scalar(s.slice(st,i),n);}
  return val();}
function parseBlock(ls,i,ind){const line=ls[i];if(!line)return [null,i];if(indentOf(line.t)!==ind)throw yerr('bad indentation',line.n);
  if(/^\s*-( |$)/.test(line.t))return parseSeq(ls,i,ind);if(/^\s*("[^"]*"|'[^']*'|[^:]+?):( |$)/.test(line.t))return parseMap(ls,i,ind);return [scalar(line.t,line.n),i+1];}
function parseMap(ls,i,ind){const o={};
  while(i<ls.length){const line=ls[i],t=line.t,li=indentOf(t);if(li<ind)break;if(li>ind)throw yerr('unexpected indentation',line.n);
    if(/^\s*-( |$)/.test(t))break;
    const m=t.trim().match(/^("[^"]*"|'[^']*'|[^:]+?):(?:\s+(.*))?$/);if(!m)throw yerr(`expected "key: value", got "${t.trim()}"`,line.n);
    const k=m[1].replace(/^["']|["']$/g,''),rest=(m[2]||'').trim();
    if(rest===''){const nx=ls[i+1];
      if(nx&&indentOf(nx.t)>ind){const [v,j]=parseBlock(ls,i+1,indentOf(nx.t));o[k]=v;i=j;}
      else if(nx&&indentOf(nx.t)===ind&&/^\s*-( |$)/.test(nx.t)){const [v,j]=parseSeq(ls,i+1,ind);o[k]=v;i=j;}
      else{o[k]=null;i++;}}
    else if(/^[|>][-+]?$/.test(rest)){const buf=[];i++;const bi=ls[i]?indentOf(ls[i].t):ind+1;while(i<ls.length&&indentOf(ls[i].t)>ind){buf.push(ls[i].t.slice(bi));i++;}o[k]=buf.join(rest[0]==='|'?'\n':' ');}
    else{o[k]=scalar(rest,line.n);i++;}}
  return [o,i];}
function parseSeq(ls,i,ind){const a=[];
  while(i<ls.length){const line=ls[i],t=line.t,li=indentOf(t);if(li<ind)break;if(li>ind)throw yerr('unexpected indentation',line.n);if(!/^\s*-( |$)/.test(t))break;
    const rest=t.trim().slice(1).trim();
    if(rest===''){const nx=ls[i+1];if(nx&&indentOf(nx.t)>ind){const [v,j]=parseBlock(ls,i+1,indentOf(nx.t));a.push(v);i=j;}else{a.push(null);i++;}}
    else if(/^("[^"]*"|'[^']*'|[^:{\["']+?):(\s|$)/.test(rest)){const col=t.indexOf('-')+1+t.slice(t.indexOf('-')+1).match(/^ */)[0].length;ls[i].t=' '.repeat(col)+rest;const [v,j]=parseMap(ls,i,col);a.push(v);i=j;}
    else{a.push(scalar(rest,line.n));i++;}}
  return [a,i];}
function parseYAML(src){const docs=[];let cur=[];
  src.split('\n').forEach((l,i)=>{if(/^---\s*$/.test(l)){docs.push(cur);cur=[];}else cur.push({t:l.replace(/\t/g,'  ').replace(/\s+$/,''),n:i+1});});docs.push(cur);
  return docs.map(lines=>{const ls=lines.map(o=>({...o,t:stripComment(o.t).replace(/\s+$/,'')})).filter(o=>o.t.trim()!=='');if(!ls.length)return undefined;const first=ls[0];const [v,j]=parseBlock(ls,0,indentOf(first.t));if(j<ls.length)throw yerr(`unexpected content "${ls[j].t.trim()}"`,ls[j].n);return {v,line:first.n};}).filter(Boolean);}

function docsToObjects(docs){
  const P=[],objs=[],svcNames=new Set(),cfg={},pvcs=new Set(),hpas={},byLabel=[];
  const prob=(sev,msg,d,line)=>P.push({sev,msg:(d&&d.kind?`${d.kind}/${(d.metadata&&d.metadata.name)||'?'}: `:'')+msg,line});
  docs.forEach(({v:d})=>{if(!d||typeof d!=='object')return;const n=d.metadata&&d.metadata.name;if(d.kind==='Service')svcNames.add(n);if(d.kind==='ConfigMap'||d.kind==='Secret')cfg[n]=d.kind;if(d.kind==='PersistentVolumeClaim')pvcs.add(n);if(d.kind==='HorizontalPodAutoscaler'&&d.spec&&d.spec.scaleTargetRef)hpas[d.spec.scaleTargetRef.name]=`${d.spec.minReplicas||1}–${d.spec.maxReplicas||'?'}`;});
  docs.forEach(({v:d,line})=>{
    if(!d||typeof d!=='object'||Array.isArray(d)){prob('err','document is not a mapping (expected apiVersion/kind/metadata/spec)',null,line);return;}
    const kind=d.kind,name=d.metadata&&d.metadata.name;
    if(!kind||!name){prob('err','every object needs kind and metadata.name',d,line);return;}
    if(!d.apiVersion)prob('warn','missing apiVersion',d,line);
    if(objs.some(o=>o.name===name&&o.wkind===kind))prob('warn','duplicate object, the later one wins',d,line);
    switch(kind){
      case 'Deployment':case 'StatefulSet':case 'DaemonSet':case 'Job':{
        const spec=d.spec||{},tpl=spec.template||{},ps=tpl.spec||{},cs=ps.containers||[];
        if(!cs.length||!cs[0].image){prob('err','spec.template.spec.containers[0].image is required',d,line);return;}
        const labels=(tpl.metadata&&tpl.metadata.labels)||{};
        const sel=(spec.selector&&spec.selector.matchLabels)||(kind==='Job'?labels:null);
        if(!Object.keys(labels).length){prob('err','spec.template.metadata.labels is required (Services find pods by these)',d,line);return;}
        if(!sel||!Object.keys(sel).length){prob('err','spec.selector.matchLabels is required',d,line);return;}
        if(!matches(labels,sel)){prob('err',`selector ${JSON.stringify(sel)} does not match template labels ${JSON.stringify(labels)} → the API server rejects this`,d,line);return;}
        const feats=new Set(),missing=new Set(),calls=new Set();let pvcMissing=null,vol=false;
        const ref=(r)=>{if(!r)return;feats.add(r[0]==='Secret'?'secret':'configmap');if(!cfg[r[1]])missing.add(`${r[0]}/${r[1]}`);};
        cs.forEach(c=>{if(c.readinessProbe)feats.add('readiness');if(c.livenessProbe)feats.add('liveness');if(c.resources&&c.resources.limits)feats.add('limits');if(c.resources&&c.resources.requests)feats.add('requests');
          (c.env||[]).forEach(e=>{const r=e.valueFrom||{};ref(r.configMapKeyRef&&['ConfigMap',r.configMapKeyRef.name]);ref(r.secretKeyRef&&['Secret',r.secretKeyRef.name]);
            if(typeof e.value==='string'){const m=e.value.match(/^[a-z+]+:\/\/(?:[^@\/\s]+@)?([a-z0-9.-]+)/i);const host=m?m[1].split('.')[0]:e.value;if(svcNames.has(host)&&host!==name)calls.add(host);else if(m&&m[1].includes('.'))calls.add('internet');}});
          (c.envFrom||[]).forEach(e=>{ref(e.configMapRef&&['ConfigMap',e.configMapRef.name]);ref(e.secretRef&&['Secret',e.secretRef.name]);});});
        (ps.volumes||[]).forEach(v=>{if(v.persistentVolumeClaim){vol=true;feats.add('pvc');if(!pvcs.has(v.persistentVolumeClaim.claimName))pvcMissing=v.persistentVolumeClaim.claimName;}if(v.configMap)ref(['ConfigMap',v.configMap.name]);if(v.secret)ref(['Secret',v.secret.secretName]);});
        if(kind==='StatefulSet'&&(spec.volumeClaimTemplates||[]).length){vol=true;feats.add('pvc');}
        missing.forEach(m=>prob('err',`references ${m} which does not exist → pods will sit in CreateContainerConfigError`,d,line));
        if(pvcMissing)prob('err',`PVC "${pvcMissing}" does not exist → pods stay Pending`,d,line);
        const ports=cs.flatMap(c=>(c.ports||[]).map(p=>+p.containerPort));
        if(!ports.length&&(kind==='Deployment'||kind==='StatefulSet'))prob('info','no containerPort declared; Services still work, but the targetPort check cannot run',d,line);
        const rep=kind==='DaemonSet'?3:kind==='Job'?+(spec.completions||1):+(spec.replicas===undefined?1:spec.replicas);
        if(hpas[name])feats.add('hpa '+hpas[name]);
        byLabel.push({name,labels,ports});
        objs.push({kind:'deploy',name,image:cs[0].image,replicas:rep,port:ports[0]||80,labels,calls:[...calls],vol,controller:/ingress/i.test(name),perNode:kind==='DaemonSet',job:kind==='Job',missing:[...missing],pvcMissing,feats:[...feats],wkind:kind});break;}
      case 'Service':{const spec=d.spec||{};if(!spec.selector||!Object.keys(spec.selector).length){prob('err','spec.selector is required (headless / ExternalName services are not simulated)',d,line);return;}
        const p=(spec.ports||[])[0]||{};if(!p.port){prob('err','spec.ports[0].port is required',d,line);return;}
        objs.push({kind:'svc',name,selector:spec.selector,port:+p.port,targetPort:p.targetPort===undefined?+p.port:p.targetPort,type:spec.type||'ClusterIP',app:Object.entries(spec.selector).map(([k,v])=>`${k}=${v}`).join(','),wkind:kind});break;}
      case 'Ingress':{const rules=[];((d.spec&&d.spec.rules)||[]).forEach(r=>{((r.http&&r.http.paths)||[]).forEach(p=>{const s=p.backend&&p.backend.service&&p.backend.service.name;if(!s){prob('err','each path needs backend.service.name',d,line);return;}rules.push({host:r.host||'*',path:p.path||'/',svc:s});if(!svcNames.has(s))prob('warn',`backend Service "${s}" does not exist → 503 for ${r.host||'*'}${p.path||'/'}`,d,line);});});
        if(!rules.length){prob('err','no spec.rules[].http.paths found',d,line);return;}objs.push({kind:'ingress',name,host:rules[0].host,rules,wkind:kind});break;}
      case 'ConfigMap':case 'Secret':objs.push({kind:'cfg',name,ckind:kind,keys:Object.keys(d.data||d.stringData||{}).length,wkind:kind});break;
      case 'PersistentVolumeClaim':objs.push({kind:'pvc',name,size:(d.spec&&d.spec.resources&&d.spec.resources.requests&&d.spec.resources.requests.storage)||'?',wkind:kind});break;
      case 'HorizontalPodAutoscaler':case 'Namespace':case 'ServiceAccount':case 'Role':case 'RoleBinding':case 'ClusterRole':case 'ClusterRoleBinding':case 'NetworkPolicy':case 'CronJob':case 'PodDisruptionBudget':prob('info',`${kind} accepted (not simulated)`,d,line);break;
      default:prob('warn',`kind "${kind}" is unknown here (accepted, ignored)`,d,line);}
  });
  objs.filter(o=>o.kind==='svc').forEach(s=>{const m=byLabel.filter(x=>matches(x.labels,s.selector));
    if(!m.length)prob('warn',`Service/${s.name}: selector {${s.app}} matches no pod template → 0 endpoints, connections will hang`);
    else m.forEach(x=>{if(x.ports.length&&!x.ports.includes(+s.targetPort))prob('warn',`Service/${s.name}: targetPort ${s.targetPort} is not a containerPort of ${x.name} (${x.ports.join(', ')}) → connection refused`);});});
  if(objs.some(o=>o.kind==='ingress')&&!objs.some(o=>o.kind==='deploy'&&o.controller))prob('warn','Ingress exists but no ingress controller Deployment (name containing "ingress") → rules carry no traffic');
  return {objs,problems:P};
}
function syncLab(objs){
  const keep={deploy:new Set(),svc:new Set(),ingress:new Set()};objs.forEach(o=>keep[o.kind]&&keep[o.kind].add(o.name));
  Object.keys(lab.deploys).forEach(n=>{if(!keep.deploy.has(n)){delete lab.deploys[n];ev(`pruned deployment/${n}`);}});
  Object.keys(lab.services).forEach(n=>{if(!keep.svc.has(n)){delete lab.services[n];ev(`pruned service/${n}`);}});
  Object.keys(lab.ingresses).forEach(n=>{if(!keep.ingress.has(n)){delete lab.ingresses[n];ev(`pruned ingress/${n}`);}});
  lab.configs={};lab.pvcs={};objs.forEach(o=>{if(o.kind==='cfg')lab.configs[o.name]=o;if(o.kind==='pvc')lab.pvcs[o.name]=o;});
  applyObjects(objs.filter(o=>['deploy','svc','ingress'].includes(o.kind)));
}
let lastGood=null;
function yamlApply(){
  const src=$('yaml').value;let docs;
  try{docs=parseYAML(src);}catch(e){showProblems([{sev:'err',msg:e.message,line:e.line}],null);return;}
  const {objs,problems}=docsToObjects(docs);
  syncLab(objs);lastGood=objs;showProblems(problems,objs);drawLab();
}
function showProblems(P,objs){
  const box=$('problems');box.innerHTML='';
  const head=document.createElement('div');head.className='pb '+(P.some(p=>p.sev==='err')?'err':P.some(p=>p.sev==='warn')?'warn':'ok');
  head.textContent=objs?`synced ${objs.length} object${objs.length===1?'':'s'} · ${P.filter(p=>p.sev==='err').length} errors · ${P.filter(p=>p.sev==='warn').length} warnings`:'not applied: fix the YAML first';box.appendChild(head);
  P.forEach(p=>{const d=document.createElement('div');d.className='pb '+(p.sev==='err'?'err':p.sev==='warn'?'warn':'');d.textContent=(p.sev==='err'?'✖ ':p.sev==='warn'?'▲ ':'ℹ ')+(p.line?`L${p.line} · `:'')+p.msg;
    if(p.line)d.onclick=()=>{const ta=$('yaml');const lines=ta.value.split('\n');let off=0;for(let i=0;i<p.line-1;i++)off+=lines[i].length+1;ta.focus();ta.setSelectionRange(off,off+(lines[p.line-1]||'').length);const lh=18;ta.scrollTop=Math.max(0,(p.line-4)*lh);};box.appendChild(d);});
}
function drawTopo(){
  const svg=$('topo');svg.innerHTML='';
  const X={ing:40,svc:280,dep:520,rs:760,pod:1000},W=200,H=26,ROW=32;
  [['ing','INGRESS'],['svc','SERVICE'],['dep','WORKLOAD'],['rs','REPLICASET'],['pod','PODS']].forEach(([k,l])=>text(svg,X[k],16,l,'tcol'));
  let y=34;const pos={},box=(x,yy,w,cls,title,sub,dot)=>{const g=el('g',{class:'tn '+cls},svg);el('rect',{x,y:yy,width:w,height:H,rx:5},g);if(dot)el('circle',{cx:x+10,cy:yy+H/2,r:4,class:'dot '+dot},g);text(g,x+(dot?20:10),yy+17,title,'tt');if(sub){const t=text(g,x+w-8,yy+17,sub,'ts');t.setAttribute('text-anchor','end');}return [x+w,yy+H/2,x,yy+H/2];};
  const edge=(a,b,cls)=>{const mx=(a[0]+b[2])/2;el('path',{d:`M${a[0]} ${a[1]} C ${mx} ${a[1]}, ${mx} ${b[3]}, ${b[2]} ${b[3]}`,class:'edge '+(cls||'')},svg);};
  const D=Object.values(lab.deploys).sort((a,b)=>a.name.localeCompare(b.name));
  D.forEach(d=>{const y0=y,rsPos=[],imgs=[...new Set([d.image,...lab.pods.filter(p=>p.app===d.name).map(p=>p.image)])];
    imgs.forEach(img=>{const pods=lab.pods.filter(p=>p.app===d.name&&p.image===img),n=Math.max(1,pods.length),mid=y+((n-1)*ROW)/2;
      const r=box(X.rs,mid,W,'rs'+(img===d.image?'':' old'),`rs/${d.name}-${hash(img)}`,`${pods.filter(p=>p.status==='running').length}/${img===d.image?wantOf(d):0}`);rsPos.push(r);
      pods.forEach((p,i)=>{const pp=box(X.pod,y+i*ROW,W,'pod',p.id.length>21?p.id.slice(0,20)+'…':p.id,p.node?'node-'+p.node:'pending',p.status);edge(r,pp,p.status==='running'?'ok':p.status==='crash'?'bad':'');});
      y+=n*ROW;});
    const mid=(y0+y-ROW)/2,ready=readyPods(d.name).filter(p=>p.image===d.image).length,want=wantOf(d);
    const dp=box(X.dep,mid,W,'dep'+(ready<want&&!d.job?' bad':''),`${(d.wkind||'Deployment').toLowerCase()}/${d.name}`,`${ready}/${want}`);rsPos.forEach(r=>edge(dp,r));pos[d.name]=dp;
    if(d.feats&&d.feats.length){text(svg,X.dep,mid+H+11,d.feats.join(' · '),'tf');}
    y=Math.max(y,mid+H+18)+10;});
  const spos={};Object.values(lab.services).forEach(s=>{const m=D.filter(d=>matches(d.labels||{app:d.name},s.selector||{app:s.app}));let sy;if(m.length)sy=m.reduce((a,d)=>a+pos[d.name][1],0)/m.length-H/2;else{sy=y;y+=ROW+14;}
    const ready=svcReady(s).length,sp=box(X.svc,sy,W,'svc'+(ready?'':' bad'),`svc/${s.name}`,`${s.type} · ${ready} ep`);spos[s.name]=sp;
    m.forEach(d=>edge(sp,pos[d.name],ready?'ok flow':'bad'));if(!m.length)text(svg,X.svc,sy+H+11,`selector {${s.app}} matches nothing`,'te');});
  const up=ctrlUp();Object.values(lab.ingresses).forEach(i=>{const ss=i.rules.map(r=>spos[r.svc]).filter(Boolean);let iy;if(ss.length)iy=ss.reduce((a,p)=>a+p[1],0)/ss.length-H/2;else{iy=y;y+=ROW+14;}
    const ip=box(X.ing,iy,W,'ing'+(up?'':' bad'),`ingress/${i.name}`,i.host);
    i.rules.forEach(r=>{const sp=spos[r.svc];if(sp)edge(ip,sp,up?'ok flow':'bad');});
    const missing=i.rules.filter(r=>!spos[r.svc]).map(r=>r.svc);text(svg,X.ing,iy+H+11,!up?'no ingress controller → no traffic':missing.length?`missing service: ${missing.join(', ')}`:i.rules.map(r=>r.path).join('  '),!up||missing.length?'te':'tf');});
  const C=Object.values(lab.configs||{}),V=Object.values(lab.pvcs||{});let cy=Math.max(y,34);if(C.length||V.length){text(svg,X.ing,cy+8,'CONFIG & STORAGE','tcol');cy+=18;}
  C.forEach(c=>{box(X.ing,cy,W,'cfg',`${c.ckind.toLowerCase()}/${c.name}`,`${c.keys} keys`);cy+=ROW;});V.forEach(v=>{box(X.ing,cy,W,'cfg',`pvc/${v.name}`,v.size);cy+=ROW;});
  if(!D.length&&!Object.keys(lab.services).length)text(svg,40,70,'Nothing applied yet. Write manifests on the left, or load a template.','te');
  svg.setAttribute('viewBox',`0 0 1240 ${Math.max(600,cy+30)}`);
}
const TPL={
'web app':`# A minimal, production-shaped web app: Deployment + Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels: {app: web}
spec:
  replicas: 3
  selector:
    matchLabels: {app: web}
  template:
    metadata:
      labels: {app: web}
    spec:
      containers:
      - name: web
        image: nginx:1.27
        ports: [{containerPort: 80}]
        readinessProbe:
          httpGet: {path: /, port: 80}
        resources:
          requests: {cpu: 100m, memory: 64Mi}
          limits: {cpu: 250m, memory: 128Mi}
---
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: LoadBalancer
  selector: {app: web}
  ports:
  - port: 80
    targetPort: 80
`,
'full stack (shop)':`# frontend -> api -> db, with config, secret, storage, ingress, HPA
apiVersion: v1
kind: ConfigMap
metadata: {name: app-config}
data:
  LOG_LEVEL: info
  FEATURE_CART: "true"
---
apiVersion: v1
kind: Secret
metadata: {name: db-creds}
stringData:
  password: hunter2
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata: {name: db-data}
spec:
  accessModes: [ReadWriteOnce]
  resources: {requests: {storage: 5Gi}}
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: frontend}
spec:
  replicas: 2
  selector: {matchLabels: {app: frontend}}
  template:
    metadata: {labels: {app: frontend}}
    spec:
      containers:
      - name: frontend
        image: shop/frontend:v1
        ports: [{containerPort: 3000}]
        env:
        - {name: API_URL, value: http://api}
        readinessProbe: {httpGet: {path: /healthz, port: 3000}}
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: api}
spec:
  replicas: 2
  selector: {matchLabels: {app: api}}
  template:
    metadata: {labels: {app: api}}
    spec:
      containers:
      - name: api
        image: shop/api:v1
        ports: [{containerPort: 8080}]
        env:
        - {name: DATABASE_URL, value: postgres://db:5432/shop}
        - {name: PAYMENTS_URL, value: https://api.stripe.com}
        - name: DB_PASSWORD
          valueFrom: {secretKeyRef: {name: db-creds, key: password}}
        envFrom:
        - configMapRef: {name: app-config}
        readinessProbe: {httpGet: {path: /ready, port: 8080}}
        livenessProbe: {httpGet: {path: /live, port: 8080}}
        resources:
          requests: {cpu: 200m, memory: 128Mi}
          limits: {cpu: 500m, memory: 256Mi}
---
apiVersion: apps/v1
kind: StatefulSet
metadata: {name: db}
spec:
  replicas: 1
  selector: {matchLabels: {app: db}}
  template:
    metadata: {labels: {app: db}}
    spec:
      containers:
      - name: postgres
        image: postgres:16
        ports: [{containerPort: 5432}]
        volumeMounts: [{name: data, mountPath: /var/lib/postgresql/data}]
      volumes:
      - name: data
        persistentVolumeClaim: {claimName: db-data}
---
apiVersion: v1
kind: Service
metadata: {name: frontend}
spec:
  selector: {app: frontend}
  ports: [{port: 80, targetPort: 3000}]
---
apiVersion: v1
kind: Service
metadata: {name: api}
spec:
  selector: {app: api}
  ports: [{port: 80, targetPort: 8080}]
---
apiVersion: v1
kind: Service
metadata: {name: db}
spec:
  selector: {app: db}
  ports: [{port: 5432}]
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: {name: api}
spec:
  scaleTargetRef: {apiVersion: apps/v1, kind: Deployment, name: api}
  minReplicas: 2
  maxReplicas: 8
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: ingress-nginx}
spec:
  replicas: 1
  selector: {matchLabels: {app: ingress-nginx}}
  template:
    metadata: {labels: {app: ingress-nginx}}
    spec:
      containers:
      - name: controller
        image: registry.k8s.io/ingress-nginx/controller:v1.11.0
        ports: [{containerPort: 80}]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: {name: shop}
spec:
  ingressClassName: nginx
  rules:
  - host: shop.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend: {service: {name: frontend, port: {number: 80}}}
      - path: /api
        pathType: Prefix
        backend: {service: {name: api, port: {number: 80}}}
`,
'broken (find the bugs)':`# Five classic mistakes. Read the Problems panel, fix them one by one, watch the cluster heal.
apiVersion: apps/v1
kind: Deployment
metadata: {name: web}
spec:
  replicas: 2
  selector: {matchLabels: {app: web}}
  template:
    metadata: {labels: {app: web}}
    spec:
      containers:
      - name: web
        image: nginx:1.27
        ports: [{containerPort: 80}]
        env:
        - name: API_KEY
          valueFrom: {secretKeyRef: {name: api-key, key: token}}   # bug 1: Secret does not exist
---
apiVersion: v1
kind: Service
metadata: {name: web}
spec:
  selector: {app: wbe}          # bug 2: typo, matches nothing
  ports: [{port: 80, targetPort: 8080}]   # bug 3: container listens on 80
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: worker}
spec:
  replicas: 1
  selector: {matchLabels: {app: worker}}
  template:
    metadata: {labels: {app: worker}}
    spec:
      containers:
      - name: worker
        image: shop/worker:v1
        volumeMounts: [{name: data, mountPath: /data}]
      volumes:
      - name: data
        persistentVolumeClaim: {claimName: worker-data}   # bug 4: PVC does not exist
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: {name: web}
spec:
  rules:
  - host: web.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend: {service: {name: web, port: {number: 80}}}
# bug 5: no ingress controller anywhere
`,
'DaemonSet + Job':`# One log agent per node, and a one-off migration Job
apiVersion: apps/v1
kind: DaemonSet
metadata: {name: log-agent}
spec:
  selector: {matchLabels: {app: log-agent}}
  template:
    metadata: {labels: {app: log-agent}}
    spec:
      containers:
      - name: agent
        image: fluent/fluent-bit:3.1
---
apiVersion: batch/v1
kind: Job
metadata: {name: migrate}
spec:
  completions: 1
  template:
    metadata: {labels: {job: migrate}}
    spec:
      restartPolicy: Never
      containers:
      - name: migrate
        image: shop/api:v1
        command: ["./migrate", "up"]
`};
function loadTpl(name){$('yaml').value=TPL[name];syncGutter();yamlApply();}
function syncGutter(){const n=$('yaml').value.split('\n').length;$('gutter').textContent=Array.from({length:n},(_,i)=>i+1).join('\n');}
Object.keys(TPL).forEach(n=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>loadTpl(n);$('tpls').appendChild(b);});
let yto=null;
$('yaml').addEventListener('input',()=>{syncGutter();if($('autoapply').checked){clearTimeout(yto);yto=T.setTimeout(yamlApply,700);}});
$('yaml').addEventListener('scroll',()=>{$('gutter').scrollTop=$('yaml').scrollTop;});
$('yaml').addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const t=e.target,s=t.selectionStart;t.value=t.value.slice(0,s)+'  '+t.value.slice(t.selectionEnd);t.selectionStart=t.selectionEnd=s+2;syncGutter();}});
$('applybtn').onclick=yamlApply;$('yresetbtn').onclick=()=>{labReset();drawLab();};
$('v-cluster').onclick=()=>setView('cluster');$('v-topo').onclick=()=>setView('topo');


const practiceSteps=[
 {title:'Create two app copies',why:'A Deployment remembers how many copies you want. After this command, wait for two green pods.',command:()=> 'kubectl create deployment web --image=nginx:1.27 --replicas=2',ready:()=>!lab.deploys.web},
 {title:'Give them one address',why:'A Service finds ready pods by their labels. Green traffic now has a route from the browser to the app.',command:()=> 'kubectl expose deploy web --port=80 --type=LoadBalancer',ready:()=>readyPods('web').length===2},
 {title:'Ask for a third copy',why:'Watch a new pod appear. You changed the desired number; the controller does the work.',command:()=> 'kubectl scale deploy web --replicas=3',ready:()=>!!lab.services.web},
 {title:'Delete one copy',why:'The desired number stays at 3. Watch a replacement with a different name appear.',command:()=>{practiceDeleted=readyPods('web')[0].id;return 'kubectl delete pod '+practiceDeleted},ready:()=>readyPods('web').length===3},
 {title:'Release a new version',why:'Watch v1.28 replace v1.27 gradually. Read each pod’s version label while the update happens.',command:()=> 'kubectl set image deploy/web web=nginx:1.28',ready:()=>readyPods('web').length===3&&!lab.pods.some(p=>p.id===practiceDeleted)},
 {title:'Undo the release',why:'Return to v1.27. This is a deliberate rollback of a working release; the guided course has the broken-release exercise.',command:()=> 'kubectl rollout undo deploy/web',ready:()=>readyPods('web').filter(p=>p.image==='nginx:1.28').length===3}
];
function updatePractice(){
  const copy=$('practice-copy'),next=$('practice-next'),reset=$('practice-reset');
  next.hidden=reset.hidden=mode!=='play';
  $('practice-pause').hidden=$('practice-step').hidden=mode==='tut';
  $('practice-pause').textContent=learningPaused?'Resume simulation':'Pause simulation';
  $('practice-pause').setAttribute('aria-pressed',String(learningPaused));
  if(mode==='tut'){
    copy.innerHTML='<b>1 · Watch one idea</b><p>Start with the first question on the left. Read the explanation below the drawing, then choose Next. The command shown is an example; nothing runs on your computer.</p><p><b>Then:</b> use Playground to try the six-step practice. Manifests comes after that.</p>';
  }else if(mode==='yaml'){
    copy.innerHTML='<b>3 · Change the written instructions</b><p>Choose the <b>web app</b> template on the left. Find <code>replicas: 3</code>, change it to <code>replicas: 2</code>, then choose <b>Apply YAML</b>. Wait for two green pods. Use <b>Topology</b> to see how the Service connects to them.</p><p><b>Finish when:</b> you can change the count back to 3 and explain why the drawing changes. Templates replace this editor’s contents; save text you want to keep first. This editor prunes removed objects; ordinary kubectl apply does not do that by default.</p>';
  }else if(practiceStep<0){
    copy.innerHTML='<b>2 · Try six small experiments</b><p>Create → expose → scale → delete → update → undo. Start a fresh practice below, or use the existing buttons and terminal freely. Starting clears only this Playground simulation.</p>';
    next.textContent='Start fresh practice';next.disabled=false;reset.hidden=true;
  }else if(practiceStep<practiceSteps.length){
    const p=practiceSteps[practiceStep];
    copy.innerHTML='<b>Step '+(practiceStep+1)+' of 6 · '+p.title+'</b><p>'+p.why+'</p><p>'+(p.ready()?'Choose the button when you are ready.':'Wait for the last change to finish, or use One step to advance slowly.')+'</p>';
    next.textContent=p.title;next.disabled=!p.ready();
  }else{
    const finished=readyPods('web').filter(p=>p.image==='nginx:1.27').length===3&&!lab.pods.some(p=>p.image!=='nginx:1.27'&&!['dead','term'].includes(p.status));
    copy.innerHTML=finished?'<b>Playground practice complete</b><p>You created, reached, scaled, replaced, updated, and rolled back an app. Next, choose Manifests and try changing its written instructions.</p>':'<b>Watch the undo finish</b><p>Wait for three green v1.27 pods, or use One step. Then move to Manifests.</p>';
    next.hidden=true;
  }
}
$('practice-next').onclick=()=>{
  if(practiceStep<0){labReset();practiceStep=0;practiceDeleted=null;learningPaused=false;drawLab();return}
  const p=practiceSteps[practiceStep];if(!p||!p.ready())return;
  run(p.command());practiceStep++;updatePractice();
};
$('practice-reset').onclick=()=>{labReset();practiceStep=0;practiceDeleted=null;learningPaused=false;drawLab()};
$('practice-pause').onclick=()=>{learningPaused=!learningPaused;updatePractice()};
$('practice-step').onclick=()=>{learningPaused=true;reconcile();updatePractice()};

if(opts.hash==='#play'){setMode('play');new URLSearchParams(opts.search).getAll('run').forEach(run);}
else if(opts.hash==='#yaml'){setMode('yaml');const q=new URLSearchParams(opts.search);if(q.get('tpl')&&TPL[q.get('tpl')])loadTpl(q.get('tpl'));if(q.get('view')==='topo')setView('topo');}
else go(+opts.hash.slice(1)-1||0);
updatePractice();

/* ---- the Academy's handle on this lab: run commands, prefill the prompt, save and restore ---- */
return {
  run, setMode, labReset, drawLab,
  setInput(v){const i=$('termin');i.value=v;i.focus();},
  note(text){out(text,'muted');},
  save(){return {mode,current,play:labs.play||null,yamlLab:labs.yaml||null,hist:hist.slice(-100),term:[...$('termout').children].slice(-300).map(d=>[d.textContent,d.className]),yaml:$('yaml').value};},
  load(d){
    if(d.play)labs.play=d.play;if(d.yamlLab)labs.yaml=d.yamlLab;hist=d.hist||[];hi=hist.length;
    $('termout').innerHTML='';for(const [t,c] of d.term||[])out(t,c);
    if(typeof d.yaml==='string'){$('yaml').value=d.yaml;syncGutter();}
    if(d.mode==='play'||d.mode==='yaml')setMode(d.mode);else go(d.current||0);
  },
};
}
