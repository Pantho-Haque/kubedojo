// The lesson simulators, ported from the tutorial prototype. Framework-free: each one owns a DOM element and returns
// {stop, pause, snapshot, save, load}. save() returns plain JSON for localStorage; load() puts it back.
import { HELM_FILES } from './files.js';
import '../product.css';
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// The Kubernetes practice games' mission checks, by lesson id (the lesson content only names them).
const CHECKS = {
  deploy: s => s.st.killed >= 3 && s.want === 6 && s.running === 6 && s.settled,
  nodedies: s => s.st.healed && s.st.repaired >= 1,
  service: s => s.ok >= 40 && s.st.killed >= 2 && s.fail === 0,
  health: s => s.st.pendingSeen && s.settled && !s.unsched,
  rollout: s => s.st.goodFinished && s.st.badSeen && s.st.rolledBack >= 1 && s.fail === 0 && s.settled,
};
/* ───────────── mini cluster simulator ───────────── */
export function Sim(el,cfg,onWin){
  const fresh=()=>({nodes:Array.from({length:cfg.nodes},(_,i)=>({n:'node-'+(i+1),up:true})),pods:[],want:cfg.replicas,ver:1,top:1,hist:[1],bad:{},serial:0,rr:0,ok:0,fail:0,paused:false,auto:false,st:{killed:0,nodeKilled:0,repaired:0,healed:0,pendingSeen:0,goodFinished:0,badSeen:0,rolledBack:0},log:[],won:false,last:'Your cluster is ready. Follow the first mission below.'});
  const s=fresh(),cap=cfg.cap||4,has=a=>cfg.actions.includes(a);
  let stopped=false;
  const node=n=>s.nodes.find(x=>x.n===n);
  const live=()=>s.pods.filter(p=>p.ph!=='Terminating');
  const ready=()=>s.pods.filter(p=>p.ph==='Running'&&node(p.node)?.up);
  const ev=t=>{s.log.unshift(t);s.log.length=Math.min(s.log.length,6)};
  function schedule(p){
    const n=s.nodes.filter(x=>x.up).map(x=>[x,s.pods.filter(q=>q.node===x.n).length]).filter(x=>x[1]<cap).sort((a,b)=>a[1]-b[1])[0];
    if(n){p.node=n[0].n;ev(`Scheduler: ${p.id} gets a place on ${p.node}.`)}
    else if(!p.warned){p.warned=1;ev(`${p.id} is waiting: no working machine has a free place.`)}
  }
  function add(){
    const p={id:'pizza-'+(++s.serial),ver:s.ver,ph:'Pending',node:null,age:0,hits:0,rs:0};
    ev(`Controller: create ${p.id} to reach the requested number of copies.`);s.pods.push(p);schedule(p);return p;
  }
  function term(p,why){p.ph='Terminating';ev(`${p.id} is stopping: ${why}.`)}
  function reconcile(){
    const lv=live(),old=lv.filter(p=>p.ver!==s.ver),newPods=lv.filter(p=>p.ver===s.ver);
    if(old.length){
      // This lesson models maxSurge: 1 and maxUnavailable: 0.
      if(lv.length<=s.want)add();
      else if(newPods.length&&newPods.every(p=>p.ph==='Running'))term(old.sort((a,b)=>(b.ph!=='Running')-(a.ph!=='Running'))[0],'replaced by version '+s.ver);
    }else{
      for(let k=lv.length;k<s.want;k++)add();
      lv.slice(s.want).forEach(p=>term(p,'fewer copies requested'));
    }
  }
  function stats(){
    const lv=live();s.running=ready().length;s.unsched=s.pods.some(p=>!p.node);
    s.settled=lv.length===s.want&&lv.every(p=>p.ver===s.ver&&p.ph==='Running'&&node(p.node)?.up);
    if(s.st.nodeKilled&&s.nodes.some(n=>!n.up)&&s.running>=s.want)s.st.healed=1;
    if(s.unsched)s.st.pendingSeen=1;
    if(s.pods.some(p=>p.ph==='CrashLoopBackOff'))s.st.badSeen=1;
    if(s.settled&&s.ver>1&&!s.bad[s.ver])s.st.goodFinished=1;
  }
  const missions={
    deploy:[['Delete one green pod. Watch a new name appear.',()=>s.st.killed>=1&&s.settled],['Delete two more pods, one at a time.',()=>s.st.killed>=3],['Choose Add a copy until you want 6. Wait for 6 ready copies.',()=>s.want===6&&s.running===6&&s.settled]],
    nodedies:[['Turn off one machine.',()=>s.st.nodeKilled>=1],['Wait: the other machines must have 4 ready copies between them.',()=>s.st.healed],['Repair the machine you turned off. Notice that pods stay where they are.',()=>s.st.healed&&s.st.repaired>=1&&s.nodes.every(n=>n.up)]],
    service:[['Send 10 requests. Watch the “served” count on each pod.',()=>s.ok>=10],['Delete two pods, one at a time. Wait for a replacement each time.',()=>s.st.killed>=2&&s.settled],['Send more requests until 40 succeed with no failures.',()=>s.ok>=40&&s.fail===0]],
    health:[['Choose Add a copy until you want 7. Only 6 places exist.',()=>s.st.pendingSeen],['Find the waiting pod below the machines. It has no free place.',()=>s.st.pendingSeen],['Choose Remove a copy until you want 6. Wait for every remaining pod to be ready.',()=>s.st.pendingSeen&&s.want===6&&s.settled&&!s.unsched]],
    rollout:[['Release a good version. Wait until all 3 copies use it.',()=>s.st.goodFinished],['Release a broken version. Wait for a red pod; the old copies still serve requests.',()=>s.st.badSeen],['Choose Undo release. Wait until all copies are ready again.',()=>s.st.rolledBack&&s.settled&&s.fail===0]]
  }[cfg.id]||[];
  function feedback(){
    stats();
    el.querySelector('.s-top').textContent=`Copies you want: ${s.want} · Ready to help: ${s.running}`;
    const requests=el.querySelector('.s-requests');if(requests)requests.textContent=`Requests served: ${s.ok} · Failed: ${s.fail}`;
    let message=s.last;
    if(!s.nodes.some(n=>n.up))message='Every machine is off. Repair a machine so Kubernetes has somewhere to run your app.';
    else if(s.unsched)message='A pod is waiting (Pending): the working machines have no free places. Remove a copy or repair a machine.';
    else if(s.pods.some(p=>p.ph==='CrashLoopBackOff'))message='The new version keeps crashing. Old copies are still ready. Choose Undo release to recover.';
    else if(!s.settled)message='Kubernetes is catching up with your request. Watch it create, start, or replace pods. You can use Next step to go slowly.';
    else if(has('update')&&s.ver>1)message=`All ${s.running} copies now use version ${s.ver}. Requests can use these ready copies.`;
    if(cfg.service&&s.fail>0&&!s.won)message+=' A request failed while no copy was ready. That is useful to see! Choose Start again to retry the no-failures mission.';
    const status=el.querySelector('.s-feedback');if(status.textContent!==message)status.textContent=message;
    const checks=missions.map(x=>!!x[1]());let next=checks.findIndex(x=>!x);if(next<0)next=checks.length;
    el.querySelector('.s-missions').innerHTML=missions.map((x,i)=>`<li class="${checks[i]?'done':i===next?'current':''}">${checks[i]?'✓':i+1+'.'} ${x[0]}</li>`).join('');
    if(!s.won&&cfg.challenge&&CHECKS[cfg.challenge.check]?.(s)&&checks.every(Boolean)){s.won=true;onWin()}
    const c=el.querySelector('.s-chal');c.classList.toggle('won',s.won);
    c.textContent=s.won?'Mission complete. Explain what happened in your own words, then try the questions below.':`Mission: ${cfg.challenge.text}`;
    const pause=el.querySelector('[data-a=pause]');pause.textContent=s.paused?'Resume':'Pause';pause.setAttribute('aria-pressed',String(s.paused));
    for(const a of ['good','bad']){const b=el.querySelector(`[data-a=${a}]`);if(b)b.disabled=!s.settled}
    const undo=el.querySelector('[data-a=undo]');if(undo)undo.disabled=s.hist.length<2;
    const up=el.querySelector('[data-a=up]'),dn=el.querySelector('[data-a=dn]');if(up)up.disabled=s.want>=12;if(dn)dn.disabled=s.want<=0;
    const auto=el.querySelector('[data-a=auto]');if(auto){auto.textContent=s.auto?'Stop automatic requests':'Start automatic requests';auto.setAttribute('aria-pressed',String(s.auto))}
  }
  function req(count=1){
    for(let i=0;i<count;i++){
      const eps=ready();
      if(!eps.length){s.fail++;ev('Request failed: there is no ready copy to answer it.');}
      else{const p=eps[s.rr++%eps.length];p.hits++;s.ok++}
    }
  }
  function tick(){
    if(stopped)return;
    s.pods=s.pods.filter(p=>p.ph!=='Terminating').filter(p=>{if(p.node&&!node(p.node).up){ev(`${p.id} was lost with its machine; a replacement needs a new name.`);return false}return true});
    for(const p of s.pods){
      if(!p.node){schedule(p);continue}
      if(p.ph==='Pending'&&p.age++>=1){p.ph=s.bad[p.ver]?'CrashLoopBackOff':'Running';ev(p.ph==='Running'?`Kubelet: ${p.id} is now ready to serve.`:`${p.id} keeps crashing with the new version.`)}
      else if(p.ph==='CrashLoopBackOff')p.rs++;
    }
    reconcile();if(s.auto)req();draw();
  }
  function pod(p){
    const state=p.node&&!node(p.node).up?'Machine offline':p.ph==='Running'?'Running · ready':p.ph==='Pending'?(p.node?'Starting…':'Pending · waiting for room'):p.ph==='Terminating'?'Stopping…':'CrashLoopBackOff · keeps crashing';
    const tag=has('killPod')?'button':'div';
    return `<${tag} ${tag==='button'?'type="button"':''} class="pod ${p.ph}" data-id="${p.id}" ${tag==='button'?`aria-label="Delete pod ${p.id}"`:''}><b>${p.id}</b>${has('update')?' · v'+p.ver:''}<small>${state}</small>${cfg.service?`<small>${p.hits} requests served</small>`:''}</${tag}>`;
  }
  function draw(){
    const active=document.activeElement;
    const focus=el.contains(active)?{id:active.dataset.id,node:active.dataset.n}:null;
    el.querySelector('.s-nodes').innerHTML=s.nodes.map(n=>`<div class="node ${n.up?'':'down'}"><div class="nh">${n.n}${has('killNode')?`<button type="button" data-a="node" data-n="${n.n}">${n.up?'Turn off':'Repair'} ${n.n}</button>`:''}</div><p class="s-capacity">${n.up?`${s.pods.filter(p=>p.node===n.n).length} / ${cap} places used`:'Offline — cannot run pods'}</p><div class="pods">${s.pods.filter(p=>p.node===n.n).map(pod).join('')||'<span class="s-empty">No pods here yet</span>'}</div></div>`).join('');
    const u=s.pods.filter(p=>!p.node);el.querySelector('.s-tray').innerHTML=u.length?`<b>Waiting for a free place</b><div class="pods">${u.map(pod).join('')}</div>`:'';
    el.querySelector('.s-log').textContent=s.log.join('\n');feedback();
    if(focus?.id||focus?.node){const target=el.querySelector(focus.id?`[data-id="${focus.id}"]`:`[data-n="${focus.node}"]`);(target||el.querySelector('[data-a=pause]')).focus({preventScroll:true})}
  }
  el.innerHTML=`<div class="sim"><p class="s-caption"><b>Practice safely:</b> this is a pretend cluster in your browser. Nothing is installed or changed on your computer.</p>
<div class="s-ctl"><button type="button" data-a="pause" aria-pressed="false">Pause</button><button type="button" data-a="step">Next step</button><button type="button" data-a="reset">Start again</button></div>
<p class="s-caption">Next step pauses the clock and advances it once. Resume lets it run again. Start again resets only this practice.</p>
<ol class="s-missions"></ol><div class="s-top"></div>${cfg.service?'<p class="s-requests"></p><div class="s-svc">Service <b>pizza</b> → chooses a ready copy for each request</div>':''}
<div class="s-nodes"></div><div class="s-tray"></div><div class="s-ctl">
${has('scale')?'<button type="button" data-a="dn">Remove a copy −</button><button type="button" data-a="up">Add a copy +</button>':''}
${has('traffic')?'<button type="button" data-a="send">Send 10 requests</button><button type="button" data-a="auto" aria-pressed="false">Start automatic requests</button>':''}
${has('update')?'<button type="button" data-a="good">Release a good version</button><button type="button" data-a="bad">Release a broken version</button><button type="button" data-a="undo">Undo release</button>':''}
</div>${has('killPod')?'<p class="s-caption">Each small green card is a pod: one running copy of the app. Click it, or press Enter while focused on it, to delete it.</p>':''}
<p class="s-feedback" role="status" aria-live="polite"></p><details><summary>What happened behind the scenes?</summary><pre class="s-log" tabindex="0"></pre></details>
<p class="s-caption">Model: a green pod is both Running and Ready here; real pods can be Running but not Ready. Each app copy uses one place; real scheduling uses resource requests. Recovery is sped up.${cfg.service?' Requests are distributed evenly here; real traffic distribution can vary.':''}${has('update')?' Updates keep all desired copies available and allow one extra copy (maxUnavailable: 0, maxSurge: 1).':''}</p><div class="s-chal"></div></div>`;
  function reset(){Object.assign(s,fresh());for(let i=0;i<s.want;i++)add().ph='Running';s.log=[`${s.want} app copies are ready. The simulation starts here.`];draw()}
  el.onclick=e=>{
    const b=e.target.closest('[data-a]'),pd=e.target.closest('[data-id]');
    if(pd&&has('killPod')){const p=s.pods.find(x=>x.id===pd.dataset.id);if(p&&p.ph!=='Terminating'){term(p,'you deleted it');s.st.killed++;s.last='You removed a pod, but the number you want stayed the same. Kubernetes will create a new one.';draw()}return}
    if(!b||b.disabled)return;
    const a=b.dataset.a;
    if(a==='reset'){reset();return}
    if(a==='pause')s.paused=!s.paused;
    if(a==='step'){s.paused=true;tick();return}
    if(a==='up'&&s.want<12){s.want++;s.last='You asked for one more copy. Kubernetes now needs to find it a place.'}
    if(a==='dn'&&s.want>0){s.want--;s.last='You asked for fewer copies. Kubernetes will remove the extras.'}
    if(a==='node'){const n=node(b.dataset.n);n.up=!n.up;if(n.up){s.st.repaired++;s.last='The machine is back. Existing pods stay put; future pods may use its free places.'}else{s.st.nodeKilled++;s.last='This machine is off. Its pods cannot answer requests. Watch new pods appear on the other machines.'}ev(s.last)}
    if(a==='send'){req(10);s.last='Ten requests were sent. Compare the served counts on each ready pod.'}
    if(a==='auto')s.auto=!s.auto;
    if(a==='good'||a==='bad'){s.ver=++s.top;s.hist.push(s.ver);if(a==='bad')s.bad[s.ver]=1;s.auto=true;ev(`You requested version ${s.ver}${a==='bad'?' (broken)':''}.`)}
    if(a==='undo'&&s.hist.length>1){if(s.bad[s.ver]&&s.st.badSeen)s.st.rolledBack++;s.hist.pop();s.ver=s.hist.at(-1);ev(`Undo: return to version ${s.ver}.`)}
    draw();
  };
  reset();
  const timer=setInterval(()=>{if(!s.paused&&!stopped)tick()},1500);
  return {stop(){stopped=true;clearInterval(timer)},pause(){s.paused=true;feedback()}};
}

export function helmRender(values){
  // This teaching model fills only the four placeholders used by our starter chart.
  const replacements={'.Release.Name':'pizza','.Values.replicaCount':String(values.replicas),'.Values.image.repository':'nginx','.Values.image.tag':values.tag};
  return ['templates/deployment.yaml','templates/service.yaml'].map(name=>HELM_FILES[name].replace(/{{\s*(.*?)\s*}}/g,(_,key)=>replacements[key])).join('---\n');
}
// opts.v2: Helm 2. Tiller must be installed with helm init first; commands use --name and delete --purge.
export function HelmSim(el,mission,onWin=()=>{},opts={}){
  const v2=!!opts.v2;
  const initial=()=>({tiller:false,history:[],desired:null,ready:0,runningTag:null,pending:null,phase:0,preview:'',won:false,flags:{init:false,preview:false,overrides:false,install:false,upgrade:false,failed:false,recovered:false},message:v2?'Helm 2 needs Tiller in the cluster first: press helm2 init. Then choose settings and preview.':'Choose settings, then preview. Previewing does not install anything.'});
  let s=initial(),stopped=false;
  const find=q=>el.querySelector(q);
  function values(){
    const profile=find('[name=profile]').value,override=find('[name=override]').value,tag=find('[name=tag]').value;
    if(!['default','dev','prod'].includes(profile)||!['','1','2','3','4','5'].includes(override)||!['1.27','1.28','does-not-exist'].includes(tag))throw Error('Choose one of the provided settings.');
    return {replicas:override?Number(override):profile==='prod'?3:1,tag};
  }
  const valueArgs=()=>{const profile=find('[name=profile]').value,override=find('[name=override]').value;return (profile==='default'?'':'-f values-'+profile+'.yaml ')+(override?'--set replicaCount='+override+' ':'')+'--set image.tag='+find('[name=tag]').value};
  const goals={tiller:'Install Tiller with helm2 init, then install the release and use Next step until its Pods are ready.',values:'Select the production file (3 copies), override it with 2, and preview. Confirm that the cluster still has no Pods.',install:'Preview, install, and use Next step until Kubernetes makes the Pods ready.',release:'Install a working version, upgrade successfully, try the missing image, then roll back to a successful revision.',sandbox:'Try the full flow: preview → install → upgrade → inspect a failure → roll back → uninstall.'};
  el.innerHTML=`<div class="sim helm-sim"><p><b>Browser practice:</b> this changes only the model below. It does not run Helm or contact a cluster.</p><p class="h-goal">${goals[mission]}</p>
<form class="h-inputs"><label>Values file<select name="profile"><option value="default">Chart defaults · 1 copy</option><option value="dev">Development file · 1 copy</option><option value="prod">Production file · 3 copies</option></select></label><label>Command-line override<select name="override"><option value="">No --set replicaCount</option>${[1,2,3,4,5].map(n=>`<option value="${n}">--set replicaCount=${n}</option>`).join('')}</select></label><label>Image tag<select name="tag"><option>1.27</option><option>1.28</option><option value="does-not-exist">does-not-exist · broken</option></select></label></form>
<p class="h-values"></p><div class="s-ctl">${v2?'<button type="button" data-h="init">helm2 init</button>':''}<button type="button" data-h="preview">Preview YAML</button><button type="button" data-h="install">Install release</button><button type="button" data-h="upgrade">Upgrade release</button><button type="button" data-h="step">Next step</button></div>
<ol class="h-pipeline"><li>Helm renders</li><li>Kubernetes accepts resources</li><li>Controllers start Pods</li><li>Helm observes readiness</li></ol>
<p class="h-status" role="status" aria-live="polite"></p><pre class="h-command" tabindex="0"></pre>
<div class="h-cluster"></div><details class="h-output"><summary>Rendered Deployment and Service YAML</summary><pre class="h-yaml" tabindex="0">Choose Preview YAML to see the output.</pre></details>
<h3>Release history · pizza · namespace helm-practice</h3><div class="h-history"></div><div class="s-ctl"><label>Successful revision <select name="revision" aria-label="Revision to roll back to"></select></label><button type="button" data-h="rollback">Roll back</button><button type="button" data-h="uninstall">Uninstall release</button><button type="button" data-h="reset">Start again</button></div>
<p class="s-caption">This model shows one release and our fixed starter chart. Real Helm supports many charts, values types, hooks, and validation rules. Each Next step compresses real work and wait times. Old Pods stay available during our failed upgrade because the chart requests maxUnavailable: 0 with spare capacity.</p><p class="h-achievement"></p></div>`;
  find('form').onsubmit=e=>e.preventDefault();
  function draw(){
    if(stopped)return;
    const v=values(),busy=!!s.pending,installed=s.history.length>0;
    find('.h-values').textContent=`Next operation will request ${v.replicas} copies of nginx:${v.tag}. Editing these settings has not changed Kubernetes.`;
    find('.h-status').textContent=s.message;
    [...el.querySelectorAll('.h-pipeline li')].forEach((li,i)=>{li.classList.toggle('current',s.phase===i+1);li.classList.toggle('done',s.phase>i+1)});
    if(v2)find('[data-h=init]').disabled=s.tiller;
    for(const [action,disabled] of Object.entries({install:installed||busy||(v2&&!s.tiller),upgrade:!installed||busy,step:!busy,uninstall:!installed||busy}))find(`[data-h=${action}]`).disabled=disabled;
    find('.h-cluster').innerHTML=`<div class="box"><b>Kubernetes objects</b><p>${s.desired?`Deployment pizza: wants ${s.desired.replicas} copies of nginx:${esc(s.desired.tag)}<br>Service pizza: selects app.kubernetes.io/instance=pizza`:'No Deployment or Service installed.'}</p><div class="pods">${Array.from({length:s.ready},(_,i)=>`<div class="pod Running">pizza-${i+1}<small>Ready · nginx:${esc(s.runningTag||'')}</small></div>`).join('')}${s.desired?.tag==='does-not-exist'?'<div class="pod CrashLoopBackOff">New copy<small>ImagePullBackOff · image missing</small></div>':''}</div><p class="h-count">${s.ready} ready Pods</p></div>`;
    find('.h-history').innerHTML=s.history.length?`<table><thead><tr><th>Revision</th><th>Operation</th><th>Image</th><th>Copies</th><th>Status</th></tr></thead><tbody>${s.history.map(r=>`<tr><td>${r.rev}</td><td>${r.op}</td><td>${esc(r.tag)}</td><td>${r.replicas}</td><td>${r.status}</td></tr>`).join('')}</tbody></table>`:'No release yet. Preview alone does not create one.';
    const select=find('[name=revision]'),old=select.value,success=s.history.filter(r=>r.status==='deployed'||r.status==='superseded');
    select.innerHTML=success.map(r=>`<option value="${r.rev}">Revision ${r.rev} · ${r.tag} · ${r.replicas} copies</option>`).join('');
    if(success.some(r=>String(r.rev)===old))select.value=old;
    else if(success.length)select.value=String(success.at(-1).rev);
    find('[data-h=rollback]').disabled=busy||!success.length;select.disabled=busy||!success.length;
    const won=mission==='values'?s.flags.overrides&&!s.history.length:mission==='tiller'?s.flags.init&&s.flags.install:mission==='install'?s.flags.preview&&s.flags.install:mission==='release'?s.flags.upgrade&&s.flags.failed&&s.flags.recovered:false;
    if(won&&!s.won){s.won=true;onWin()}
    find('.h-achievement').textContent=s.won?'✓ Practice complete. Explain which work Helm did and which work Kubernetes did.':'';
    el.dispatchEvent(new Event('simulationchange'));
  }
  function begin(op,v,revision){
    const previousFailed=s.history.at(-1)?.status==='failed';
    const r={rev:s.history.length+1,op,replicas:v.replicas,tag:v.tag,status:'pending'};
    s.history.push(r);s.pending={r,recovery:op==='rollback'&&previousFailed};s.phase=1;s.preview=helmRender(v);
    find('.h-yaml').textContent=s.preview;
    find('.h-command').textContent=v2?(op==='rollback'?`helm2 rollback pizza ${revision} --wait --timeout 120`:op==='install'?`helm2 install ./pizza-chart --name pizza --namespace helm-practice ${valueArgs()} --wait --timeout 120`:`helm2 upgrade pizza ./pizza-chart ${valueArgs()} --wait --timeout 120`):op==='rollback'?`helm rollback pizza ${revision} -n helm-practice --wait --timeout 2m`:`helm ${op} pizza ./pizza-chart -n helm-practice ${op==='install'?'--create-namespace ':''}${valueArgs()} --wait --timeout 2m`;
    s.message=v2?'Step 1: the helm client sent the chart to Tiller, which rendered it and recorded a pending revision. Use Next step to send resources to Kubernetes.':'Step 1: Helm rendered the chart and recorded a pending revision. Use Next step to send resources to Kubernetes.';
  }
  el.onchange=e=>{if(e.target.matches('[name=profile],[name=override],[name=tag]')){if(s.preview)s.message='Settings changed. The previous preview and installed release are unchanged. Preview again or start an upgrade.';draw()}};
  el.onclick=e=>{
    const b=e.target.closest('[data-h]');if(!b||b.disabled||stopped)return;
    const a=b.dataset.h;
    if(a==='preview'){
      const v=values();s.preview=helmRender(v);s.flags.preview=true;
      if(find('[name=profile]').value==='prod'&&find('[name=override]').value==='2')s.flags.overrides=true;
      find('.h-yaml').textContent=s.preview;find('.h-output').open=true;
      find('.h-command').textContent=v2?`helm2 template ./pizza-chart --name pizza ${valueArgs()}`:`helm template pizza ./pizza-chart ${valueArgs()}`;
      s.message=`Preview contains replicas: ${v.replicas}. Kubernetes has not changed. Install is a separate action.`;
    }
    if(a==='init'){s.tiller=true;s.flags.init=true;find('.h-command').textContent='helm2 init --service-account tiller --wait';s.message='Tiller is running in kube-system as the tiller-deploy Deployment. From now on the helm client sends every install, upgrade, and rollback to Tiller, which keeps release history as ConfigMaps in kube-system.'}
    if(a==='install'||a==='upgrade')begin(a,values());
    if(a==='rollback'){
      const r=s.history.find(r=>String(r.rev)===find('[name=revision]').value&&(r.status==='deployed'||r.status==='superseded'));
      if(r)begin('rollback',r,r.rev);
    }
    if(a==='step'&&s.pending){
      const {r,recovery}=s.pending;s.phase++;
      if(s.phase===2){s.desired={replicas:r.replicas,tag:r.tag};s.message='Step 2: the API accepted the Deployment and Service. Desired state has changed; Pods have not caught up yet.'}
      if(s.phase===3)s.message=r.tag==='does-not-exist'?'Step 3: new Pods cannot pull the missing image. Any previous ready Pods remain available.':'Step 3: Kubernetes controllers create or update Pods; kubelets start containers. Helm waits for readiness.';
      if(s.phase===4){
        if(r.tag==='does-not-exist'){r.status='failed';s.flags.failed=true;s.message='Step 4: the readiness wait timed out (sped up here). The release failed. Inspect history and roll back to a successful revision.'}
        else{
          s.history.filter(x=>x!==r&&x.status==='deployed').forEach(x=>x.status='superseded');r.status='deployed';s.ready=r.replicas;s.runningTag=r.tag;
          if(r.op==='install')s.flags.install=true;if(r.op==='upgrade')s.flags.upgrade=true;if(recovery)s.flags.recovered=true;
          s.message=`Step 4: ${s.ready} Pods are ready. Helm marks revision ${r.rev} deployed. Kubernetes keeps the app running after Helm exits.`;
        }
        s.pending=null;
      }
    }
    if(a==='uninstall'){
      s.history=[];s.desired=null;s.ready=0;s.runningTag=null;s.phase=0;
      find('.h-command').textContent=v2?'helm2 delete --purge pizza':'helm uninstall pizza -n helm-practice';s.message=v2?'Release deleted and purged: Tiller removed the Deployment, the Service, and the release history, so the name pizza is free again. Without --purge, Helm 2 keeps the history and the name stays taken.':'Release uninstalled. This chart’s Deployment and Service are removed. The namespace remains. Other charts may retain storage or other resources.';
    }
    if(a==='reset'){s=initial();find('form').reset();find('.h-yaml').textContent='Choose Preview YAML to see the output.';find('.h-command').textContent='';find('.h-output').open=false}
    draw();
  };
  draw();
  return {
    save(){return {s:JSON.parse(JSON.stringify(s)),settings:{profile:find('[name=profile]').value,override:find('[name=override]').value,tag:find('[name=tag]').value},command:find('.h-command').textContent}},
    // JSON loses shared references: the pending operation must point at its own history entry again
    load(d){s=d.s;if(s.pending)s.pending.r=s.history.find(x=>x.rev===s.pending.r.rev)||s.pending.r;for(const [k,v] of Object.entries(d.settings||{}))find(`[name=${k}]`).value=v;find('.h-yaml').textContent=s.preview||'Choose Preview YAML to see the output.';find('.h-command').textContent=d.command||'';draw()},
    stop(){stopped=true},pause(){},snapshot(){return {...s,v2,settings:values(),command:find('.h-command').textContent}}};
}

export function DockerSim(el,kind,onWin=()=>{}){
  let stopped=false,s;
  const find=q=>el.querySelector(q);
  const option=(name,title,items)=>`<label>${title}<select name="${name}">${items.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`;
  const button=(action,title)=>`<button type="button" data-d="${action}">${title}</button>`;
  const descriptions={
    life:['Container lifecycle','Run → write a file → stop → start and check the file → stop → remove → run again. Notice what survives.'],
    build:['Build cache','Build once. Change only source and build again. Keep dependency installation cached by copying dependencies before source.'],
    network:['Container networking','Make a request fail, then fix host access and peer-to-peer access. Ask which computer each address belongs to.'],
    storage:['Persistent storage','Write data without a volume and replace the container. Then repeat with a named volume and compare.'],
    compose:['Compose readiness','Observe a startup failure with short-form depends_on. Take the stack down, enable a health gate, and try again.']
  };
  function reset(){
    s={container:null,serial:0,layer:0,volume:0,source:1,deps:1,cache:[],built:false,trace:[],api:'absent',web:'absent',appliedWait:false,flags:{},won:false,message:descriptions[kind][1],command:''};
    const fields=kind==='build'?option('order','Dockerfile order',[['good','Dependencies first, source last'],['bad','Copy all source before installing dependencies']]):kind==='network'?
      option('from','Where is the request coming from?',[['host','Browser on the host'],['peer','Another container: web']])+option('address','Destination',[['localhost:8080','localhost:8080'],['localhost:8000','localhost:8000'],['api:8000','api:8000'],['api:8080','api:8080']])+option('publish','Host port mapping',[['none','No published port'],['8080','127.0.0.1:8080 → api:8000']])+option('listen','App listens inside api on',[['all','0.0.0.0:8000'],['loopback','127.0.0.1:8000']])+option('network','web and api share a Docker network?',[['yes','Yes'],['no','No']]):kind==='storage'?option('mount','Storage for the next container',[['layer','Container writable layer'],['volume','Named volume: pizza-data']]):kind==='compose'?option('wait','Dependency rule for next up',[['short','depends_on: [api] — started only'],['healthy','condition: service_healthy']]):'';
    const actions={life:button('run','Run a new container')+button('write','Write one file')+button('stop','Stop')+button('start','Start existing')+button('remove','Remove stopped container'),build:button('build','Build image')+button('source','Change source')+button('deps','Change dependency file'),network:button('request','Send a request'),storage:button('run','Create container')+button('write','Save one order')+button('remove','Remove container')+button('erase','Erase simulated volume'),compose:button('up','Compose up')+button('request','Send a request')+button('step','Next step: API ready')+button('fail','API fails later')+button('down','Compose down')+button('erase','Erase simulated Compose volume')};
    el.innerHTML=`<div class="sim docker-sim"><h3>${descriptions[kind][0]}</h3><p><b>Browser model:</b> these buttons do not run Docker or change files on your computer. Each action is one teaching snapshot.</p><p>${descriptions[kind][1]}</p><form class="h-inputs">${fields}</form><div class="s-ctl">${actions[kind]}${button('reset','Start again')}</div><p class="d-status" role="status" aria-live="polite"></p><pre class="d-command" tabindex="0"></pre><div class="d-scene"></div><p class="d-win"></p><p class="s-caption">Simplified model: one host, fixed ports, and accelerated steps. Real engines add permissions, timing, network, storage, and platform details described in the lesson.</p></div>`;
    find('form').onsubmit=e=>e.preventDefault();draw();
  }
  function val(name){return find(`[name=${name}]`).value}
  function disabled(a,flag){const b=find(`[data-d=${a}]`);if(b)b.disabled=flag}
  function draw(){
    if(stopped)return;
    find('.d-status').textContent=s.message;find('.d-command').textContent=s.command;
    let scene='',won=false;
    if(kind==='life'){
      scene=`<div class="box"><b>Image: pizza:v1</b><p>${s.container?`Container pizza-${s.serial}: ${s.container} · ${s.layer} saved file(s)`:'No container. The image still exists.'}</p></div>`;
      disabled('run',!!s.container);disabled('write',s.container!=='running');disabled('stop',s.container!=='running');disabled('start',s.container!=='stopped');disabled('remove',s.container!=='stopped');won=!!s.flags.stopKept&&!!s.flags.recreatedEmpty;
    }
    if(kind==='build'){
      scene='<div class="box"><b>Source revision '+s.source+' · Dependencies revision '+s.deps+'</b><ol>'+s.trace.map(x=>'<li>'+x+'</li>').join('')+'</ol></div>';won=!!s.flags.sourceCache;
    }
    if(kind==='network'){
      scene='<div class="flow"><span>Host browser</span>→<span>'+ (val('publish')==='8080'?'127.0.0.1:8080 published':'No host port')+'</span>→<span>api:8000</span></div><div class="flow"><span>web container</span>→<span>'+(val('network')==='yes'?'Shared network + DNS':'Separate networks')+'</span>→<span>api:8000</span></div>';
      won=!!s.flags.failed&&!!s.flags.host&&!!s.flags.peer;
    }
    if(kind==='storage'){
      scene=`<div class="box"><p>Container: ${s.container?'running with '+s.container:'removed'} · Writable layer: ${s.layer} orders</p><p>Named volume pizza-data: ${s.volume} orders (separate from the container)</p></div>`;
      find('[name=mount]').disabled=!!s.container;disabled('run',!!s.container);disabled('write',!s.container);disabled('remove',!s.container);disabled('erase',s.container==='volume');won=!!s.flags.layerLost&&!!s.flags.volumeKept;
    }
    if(kind==='compose'){
      scene=`<div class="s-nodes"><div class="box"><b>api</b><p>${s.api}</p></div><div class="box"><b>web</b><p>${s.web}</p></div></div><p>Named volume pizza-data: ${s.volume} saved visits.</p><p>The dependency rule is checked at startup. It does not keep restarting web when api changes health.</p>`;
      disabled('erase',s.api!=='absent'||!s.volume);disabled('up',s.api!=='absent');disabled('down',s.api==='absent');disabled('step',s.api!=='starting'&&s.api!=='unhealthy');disabled('fail',s.api!=='healthy');disabled('request',s.web!=='running');find('[name=wait]').disabled=s.api!=='absent';won=!!s.flags.earlyFailure&&!!s.flags.gatedSuccess;
    }
    find('.d-scene').innerHTML=scene;
    if(won&&!s.won){s.won=true;onWin()}
    find('.d-win').textContent=s.won?'✓ Practice complete. Explain the result before moving on.':'';
    el.dispatchEvent(new Event('simulationchange'));
  }
  el.onchange=()=>{s.message='Settings changed in this model. Send a request or build again to see their effect.';draw()};
  el.onclick=e=>{
    const b=e.target.closest('[data-d]');if(!b||b.disabled||stopped)return;const a=b.dataset.d;
    if(a==='reset'){reset();find('[data-d=reset]').focus();return}
    if(kind==='life'){
      if(a==='run'){s.container='running';s.serial++;s.layer=0;if(s.flags.removed)s.flags.recreatedEmpty=true;s.command='docker run --name pizza-demo pizza:v1';s.message='A new container uses the image. Its writable layer starts fresh.'}
      if(a==='write'){s.layer=1;s.command='docker exec pizza-demo sh -c "echo hello > /tmp/note"';s.message='The file lives in this container’s writable layer.'}
      if(a==='stop'){s.container='stopped';s.command='docker stop pizza-demo';s.message='The process stopped; the container and its files still exist.'}
      if(a==='start'){s.container='running';if(s.layer)s.flags.stopKept=true;s.command='docker start pizza-demo';s.message=`Same container, same ${s.layer} file(s).`}
      if(a==='remove'){s.container=null;s.layer=0;s.flags.removed=true;s.command='docker rm pizza-demo';s.message='The stopped container and writable layer are removed. The image remains.'}
    }
    if(kind==='build'){
      if(a==='source'){s.source++;s.message='Only app source changed. Predict whether dependency installation will be reused.'}
      if(a==='deps'){s.deps++;s.message='Dependency inputs changed; installation needs to run again.'}
      if(a==='build'){
        // ponytail: only the previous build is cached; use keyed entries to model branching build histories.
        const good=val('order')==='good';const keys=good?['base',`deps-${s.deps}`,`source-${s.source}`]:['base',`all-${s.source}-${s.deps}`,`install-${s.deps}`];let prefix=true;
        const hits=keys.map((key,i)=>{prefix=prefix&&s.cache[i]===key;return prefix});
        s.trace=(good?['Base image','Dependency installation','Application copy']:['Base image','Copy all files','Dependency installation']).map((name,i)=>name+': '+(hits[i]?'CACHED':'BUILT'));
        if(s.built&&s.source>1&&good&&hits[1]&&!hits[2])s.flags.sourceCache=true;
        s.cache=keys;s.built=true;s.command='docker build -t pizza:dev .';s.message='Read which steps were reused. Cache reuse depends on this step and its inputs, including prior steps.';
      }
    }
    if(kind==='network'&&a==='request'){
      const host=val('from')==='host';let failure='';s.reason='';
      // Routing problems come first: a request that never reaches api cannot be refused by api's bind address.
      if(host&&val('publish')==='none'){s.reason='nopublish';failure='The host has no published port. EXPOSE would not create one; add a host-port mapping.'}
      else if(host&&val('address')!=='localhost:8080'){s.reason='hostaddr';failure='The browser is on the host. Use localhost:8080 for this mapping, not the internal service address.'}
      else if(!host&&val('network')==='no'){s.reason='nonet';failure='These containers do not share the modeled network. Connect them before using service-name DNS.'}
      else if(!host&&val('address')!=='api:8000'){s.reason='peeraddr';failure='From web, use api:8000. localhost means web itself, and 8080 is the host port.'}
      else if(val('listen')==='loopback'){s.reason='loopback';failure='The app accepts only its own container’s loopback traffic. Bind it to 0.0.0.0 inside the container.'}
      if(failure){s.flags.failed=true;s.message='Request failed. '+failure}else{s.flags[host?'host':'peer']=true;s.message='Request succeeded. '+(host?'Host port 8080 forwarded to the app’s port 8000.':'web reached api by its service name and internal port.')}
      s.command=(host?'curl http://':'# From web: GET http://')+val('address');
    }
    if(kind==='storage'){
      if(a==='run'){s.container=val('mount');s.layer=0;if(s.container==='volume'&&s.volume>0&&s.flags.volumeRemoved)s.flags.volumeKept=true;s.command='docker run --name pizza-demo '+(s.container==='volume'?'--mount type=volume,src=pizza-data,dst=/data ':'')+'pizza:v1';s.message=s.container==='volume'?`Reattached pizza-data: ${s.volume} orders are still there.`:'New writable layer: no saved orders.'}
      if(a==='write'){if(s.container==='volume')s.volume++;else s.layer++;s.command='# app writes an order to /data';s.message='Saved one order. Look at which storage location changed.'}
      if(a==='remove'){if(s.container==='layer'&&s.layer)s.flags.layerLost=true;if(s.container==='volume')s.flags.volumeRemoved=true;s.container=null;s.layer=0;s.command='docker rm -f pizza-demo';s.message='The container and writable layer are gone. The named volume is untouched.'}
      if(a==='erase'){s.volume=0;s.flags.volumeRemoved=false;s.command='docker volume rm pizza-data';s.message='The simulated volume data is now erased. Container recreation cannot recover it; a backup would be needed.'}
    }
    if(kind==='compose'){
      if(a==='up'){s.appliedWait=val('wait')==='healthy';s.api='starting';s.web=s.appliedWait?'waiting for healthy api':'running';s.command='docker compose up -d';s.message=s.appliedWait?'API is starting. web waits for the health check. Choose Next step.':'Both processes started, but api is not ready. Send a request to see the race.'}
      if(a==='step'){s.api='healthy';if(s.web==='waiting for healthy api')s.web='running';s.command='# API health check passes';s.message='API is now healthy. web can make a request.'}
      if(a==='request'){s.command='curl http://localhost:8080';if(s.api!=='healthy'){if(s.api==='starting')s.flags.earlyFailure=true;s.message='503: web is running but api cannot answer yet. Started did not mean ready.'}else{if(s.appliedWait)s.flags.gatedSuccess=true;s.volume++;s.message=`200: web reached the ready API. Visit ${s.volume} saved on pizza-data. A later dependency outage can still happen.`}}
      if(a==='fail'){s.api='unhealthy';s.command='# API becomes unhealthy after startup';s.message='API is unhealthy; web stays running. The app needs to handle failed requests and recover connections.'}
      if(a==='erase'){s.volume=0;s.command='docker compose down --volumes';s.message='The simulated named volume was deleted. Its saved visits are gone; a backup would be needed to recover them.'}
      if(a==='down'){s.api=s.web='absent';s.command='docker compose down';s.message=`Services and network removed. The named volume still holds ${s.volume} visits. Change the dependency rule and start again.`}
    }
    draw();
  };
  reset();return {save(){return {s:JSON.parse(JSON.stringify(s)),settings:Object.fromEntries([...el.querySelectorAll('select')].map(x=>[x.name,x.value]))}},load(d){reset();s=d.s;for(const [k,v] of Object.entries(d.settings||{})){const i=el.querySelector(`[name=${k}]`);if(i)i.value=v}draw()},stop(){stopped=true},pause(){},snapshot(){return {...s,settings:Object.fromEntries([...el.querySelectorAll('select')].map(x=>[x.name,x.value]))}}};
}

/* A pretend cloud: code (settings) → plan → apply, with a state file that can drift from reality. */
export function TerraformSim(el,mission,onWin=()=>{}){
  let stopped=false,s;
  const find=q=>el.querySelector(q),val=n=>find(`[name=${n}]`).value,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const order=['bucket.menu','server.web','dns.pizza'];
  const sym={create:'+',update:'~',replace:'-/+',delete:'-'},verb={create:'will be created',update:'will be updated in-place',replace:'must be replaced',delete:'will be destroyed'};
  const goals={workflow:'Try plan before init, then run init → plan → apply. Read the plan before you approve it.',change:'Apply the first version. Then change the size (updated in place) and the region (replaced). Compare the plan symbols.',drift:'Apply, then let a teammate change the server by hand. Plan to find the drift, then apply to fix it.',sandbox:'Try the whole lifecycle: init → plan → apply → change → drift → destroy.'};
  const option=(name,title,items)=>`<label>${title}<select name="${name}">${items.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`;
  const button=(a,t)=>`<button type="button" data-t="${a}">${t}</button>`;
  function reset(){
    s={init:false,state:{},real:{},plan:null,planWant:null,planDestroy:false,serial:0,flags:{},won:false,command:'',message:goals[mission]};
    el.innerHTML=`<div class="sim docker-sim tf-sim"><p><b>Browser practice:</b> a pretend cloud. Nothing is created on your computer or in any account.</p><p>${goals[mission]}</p><form class="h-inputs">${option('size','Server size in main.tf',[['small','small'],['large','large']])}${option('region','Region in main.tf',[['eu-west','eu-west'],['us-east','us-east']])}${option('dns','DNS record block',[['yes','In the code'],['no','Deleted from the code']])}</form><div class="s-ctl">${button('init','terraform init')}${button('plan','terraform plan')}${button('apply','terraform apply')}${button('console','Teammate edits in the console')}${button('destroy','terraform plan -destroy')}${button('reset','Start again')}</div><p class="d-status" role="status" aria-live="polite"></p><pre class="d-command" tabindex="0"></pre><div class="d-scene"></div><p class="d-win"></p><p class="s-caption">Simplified model: one pretend provider, instant API calls, and a local state file.</p></div>`;
    find('form').onsubmit=e=>e.preventDefault();draw();
  }
  function want(){
    const d={'bucket.menu':{name:'pizza-menu'},'server.web':{size:val('size'),region:val('region')}};
    if(val('dns')==='yes')d['dns.pizza']={name:'pizza.example.com'};
    return d;
  }
  // Like terraform plan: compare the code with the refreshed (real) objects.
  function makePlan(destroy){
    const w=destroy?{}:want(),steps=[];
    for(const a of order){
      const have=s.real[a],need=w[a];
      if(need&&!have)steps.push({a,op:'create'});
      else if(!need&&have)steps.push({a,op:'delete'});
      else if(a==='server.web'&&need){if(need.region!==have.region)steps.push({a,op:'replace',why:`region ${have.region} → ${need.region}`});else if(need.size!==have.size)steps.push({a,op:'update',why:`size ${have.size} → ${need.size}`})}
      else if(a==='dns.pizza'&&need&&steps.some(x=>x.a==='server.web'&&x.op==='replace'))steps.push({a,op:'update',why:'new server address'});
    }
    return steps;
  }
  const count=p=>({add:p.filter(x=>x.op==='create'||x.op==='replace').length,change:p.filter(x=>x.op==='update').length,destroy:p.filter(x=>x.op==='delete'||x.op==='replace').length});
  const summary=p=>{const c=count(p);return `Plan: ${c.add} to add, ${c.change} to change, ${c.destroy} to destroy.`};
  const lines=p=>p.map(x=>`${sym[x.op].padStart(3)} ${x.a} ${verb[x.op]}${x.why?' ('+x.why+')':''}`);
  const drifted=()=>order.filter(a=>s.state[a]&&!same(s.state[a],s.real[a]));
  function applyPlan(){
    const w=s.planWant,ops=[...s.plan.filter(x=>x.op!=='delete'),...s.plan.filter(x=>x.op==='delete').reverse()];
    for(const {a,op} of ops){
      if(op==='delete'){delete s.real[a];continue}
      if(a==='server.web')s.real[a]={...w[a],ip:op==='update'?s.real[a].ip:`10.0.${++s.serial}.5`};
      else if(a==='dns.pizza')s.real[a]={...w[a],target:s.real['server.web'].ip};
      else s.real[a]={...w[a]};
    }
    s.state=structuredClone(s.real);
  }
  const fmt=(a,o)=>a==='server.web'?`${o.size} · ${o.region} · ${o.ip}`:a==='dns.pizza'?`${o.name} → ${o.target}`:o.name;
  function draw(){
    if(stopped)return;
    find('.d-status').textContent=s.message;find('.d-command').textContent=s.command;
    const list=(m,mark)=>{const k=order.filter(a=>m[a]);return k.length?'<ul>'+k.map(a=>`<li><code>${a}</code> ${esc(fmt(a,m[a]))}${mark?.(a)||''}</li>`).join('')+'</ul>':'<p class="s-empty">Nothing yet.</p>'};
    const w=want();
    find('.d-scene').innerHTML=`<div class="tf-cols"><div class="box"><b>✍️ Your code · main.tf</b><ul>${order.filter(a=>w[a]).map(a=>`<li><code>${a}</code> ${a==='server.web'?w[a].size+' · '+w[a].region:w[a].name}</li>`).join('')}</ul></div><div class="box"><b>🗂️ State file</b>${list(s.state)}</div><div class="box"><b>☁️ Pretend cloud</b>${list(s.real,a=>s.state[a]&&!same(s.state[a],s.real[a])?' <b class="tf-drift">drift</b>':'')}</div></div>${s.plan?`<pre class="tf-plan" tabindex="0">${s.plan.length?lines(s.plan).map(l=>`<span class="${/^\s*\+/.test(l)?'add':/^\s*~/.test(l)?'chg':'del'}">${esc(l)}</span>`).join('\n')+'\n\n'+summary(s.plan):'No changes. Your infrastructure matches the configuration.'}</pre>`:''}`;
    find('[data-t=console]').disabled=!s.real['server.web'];
    const f=s.flags,won={workflow:f.early&&f.applied,change:f.updated&&f.replaced,drift:f.driftFixed,sandbox:f.applied&&f.destroyed}[mission];
    if(won&&!s.won){s.won=true;onWin()}
    find('.d-win').textContent=s.won?'✓ Practice complete. Explain the result before moving on.':'';
    el.dispatchEvent(new Event('simulationchange'));
  }
  el.onchange=()=>{s.command='';s.message='You edited main.tf. Nothing in the cloud has changed. Run terraform plan to see what Terraform would do.';draw()};
  el.onclick=e=>{
    const b=e.target.closest('[data-t]');if(!b||b.disabled||stopped)return;const a=b.dataset.t;
    if(a==='reset'){reset();find('[data-t=reset]').focus();return}
    if(a==='init'){s.init=true;s.command='terraform init';s.message='Terraform downloaded the provider plugin and wrote .terraform.lock.hcl. Nothing exists in the cloud yet.'}
    if(a==='console'){const sv=s.real['server.web'];sv.size=sv.size==='small'?'large':'small';s.command='# A teammate changes server.web in the cloud website';s.message=`The real server is now ${sv.size}, but the state file still says ${s.state['server.web'].size}. Terraform will notice on the next plan.`}
    if(a==='plan'||a==='destroy'){
      s.command=a==='plan'?'terraform plan -out=tfplan':'terraform plan -destroy -out=tfplan';
      if(!s.init){s.flags.early=true;s.plan=null;s.message='Error: required provider is not installed. Run terraform init first.'}
      else{
        const d=drifted();if(d.length)s.flags.driftSeen=true;
        s.plan=makePlan(a==='destroy');s.planWant=want();s.planDestroy=a==='destroy';
        s.message=(d.length?`Terraform read the real cloud and found a change made outside Terraform on ${d.join(', ')}. `:'')+(s.plan.length?summary(s.plan)+' Nothing has changed yet: this is only a preview.':'No changes. Your code, the state file, and the cloud all match.');
      }
    }
    if(a==='apply'){
      s.command='terraform apply tfplan';
      if(!s.plan)s.message=s.init?'Error: there is no saved plan. Run terraform plan first and read it.':'Error: required provider is not installed. Run terraform init first.';
      else if(!s.plan.length){s.plan=null;s.message='No changes to apply.'}
      else{
        const c=count(s.plan),edited=!same(s.planWant,want());
        if(s.plan.some(x=>x.a==='server.web'&&x.op==='update'))s.flags.updated=true;
        if(s.plan.some(x=>x.op==='replace'))s.flags.replaced=true;
        if(s.flags.driftSeen)s.flags.driftFixed=true;
        if(s.planDestroy)s.flags.destroyed=true;
        applyPlan();s.flags.applied=true;s.plan=null;
        s.message=`Apply complete! Resources: ${c.add} added, ${c.change} changed, ${c.destroy} destroyed. The state file now records what exists.`+(edited?' Note: you edited the code after planning, so this applied the saved plan, not your newest edits. Plan again to include them.':'');
      }
    }
    draw();
  };
  reset();
  return {save(){return {s:JSON.parse(JSON.stringify(s)),settings:Object.fromEntries([...el.querySelectorAll('select')].map(x=>[x.name,x.value]))}},load(d){reset();s=d.s;for(const [k,v] of Object.entries(d.settings||{})){const i=el.querySelector(`[name=${k}]`);if(i)i.value=v}draw()},stop(){stopped=true},pause(){},snapshot(){const d=drifted();return {...s,drift:d.length>0,drifted:d,planLines:s.plan?lines(s.plan):null,planSummary:s.plan?(s.plan.length?summary(s.plan):'No changes'):'',settings:{size:val('size'),region:val('region'),dns:val('dns')}}}};
}

/* A pretend delivery line: commit → CI jobs → registry → deploy/ in git → Argo CD → pods. */
export function PipelineSim(el,mission,onWin=()=>{}){
  let stopped=false,s;
  const find=q=>el.querySelector(q),val=n=>find(`[name=${n}]`).value;
  const SHAS=['a1f3c9e','b7e2041','c93d1a8','d4402fb','e8b7c60','f2c19d3','0a7e5b2','19d6c4f'];
  const JOBS=['test','build','scan','push','promote'],icon={passed:'✓',failed:'✗',skipped:'–',waiting:'·'};
  const goals={pipeline:'Push a good commit and run the pipeline. Then push one that breaks a test and see that nothing ships.',gitops:'Ship a commit all the way: pipeline, then let Argo CD deploy the new tag from git.',drift:'Deploy the app, change the cluster by hand, then let Argo CD put it back.',sandbox:'Try it all: ship, break a test, change the cluster by hand, and roll back with git revert.'};
  const option=(name,title,items)=>`<label>${title}<select name="${name}">${items.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`;
  const button=(a,t)=>`<button type="button" data-c="${a}">${t}</button>`;
  function reset(){
    s={n:0,commit:null,run:null,registry:[],config:[],live:null,flags:{},won:false,command:'',message:goals[mission]};
    el.innerHTML=`<div class="sim docker-sim ci-sim"><p><b>Browser practice:</b> a pretend pipeline and cluster. Nothing runs on GitHub or on your computer.</p><p>${goals[mission]}</p><form class="h-inputs">${option('tests','Your next commit',[['pass','Keeps every test passing'],['fail','Breaks a test']])}${option('base','Base image',[['clean','Up to date'],['vulnerable','Has a fixable HIGH vulnerability']])}</form><div class="s-ctl">${button('commit','git push')}${button('ci','Run the pipeline')}${button('sync','Argo CD checks git')}${button('edit','kubectl scale by hand')}${button('revert','git revert last deploy')}${button('reset','Start again')}</div><p class="d-status" role="status" aria-live="polite"></p><pre class="d-command" tabindex="0"></pre><div class="d-scene"></div><p class="d-win"></p><p class="s-caption">Simplified model: one repository, instant jobs, and Argo CD checking git only when you press the button.</p></div>`;
    find('form').onsubmit=e=>e.preventDefault();draw();
  }
  const tagOf=()=>s.config.at(-1)||null;
  const drift=()=>!!s.live&&s.live.replicas!==2;
  function runPipeline(){
    const r=s.run,c=r.commit;let broken=false;
    for(const j of JOBS){
      if(broken){r.jobs[j]='skipped';continue}
      const ok=!(j==='test'&&c.tests==='fail')&&!(j==='scan'&&c.base==='vulnerable');
      r.jobs[j]=ok?'passed':'failed';broken=!ok;
      if(ok&&j==='push')s.registry.push(c.sha);
      if(ok&&j==='promote')s.config.push(c.sha);
    }
    return Object.entries(r.jobs).find(([,v])=>v==='failed')?.[0];
  }
  function draw(){
    if(stopped)return;
    find('.d-status').textContent=s.message;find('.d-command').textContent=s.command;
    const jobs=s.run?JOBS.map(j=>`<li class="ci-${s.run.jobs[j]}">${icon[s.run.jobs[j]]} ${j}</li>`).join(''):'<li>No run yet</li>';
    find('.d-scene').innerHTML=`<div class="tf-cols ci-cols"><div class="box"><b>💬 Latest commit</b><p>${s.commit?`<code>${s.commit.sha}</code> · tests ${s.commit.tests==='pass'?'pass':'broken'} · base ${s.commit.base==='clean'?'up to date':'vulnerable'}`:'Nothing pushed yet.'}</p></div><div class="box"><b>🤖 Pipeline</b><ul class="ci-jobs">${jobs}</ul></div><div class="box"><b>📦 Registry · 🗂️ deploy/</b><p>${s.registry.length} image${s.registry.length===1?'':'s'}</p><p>newTag: <code>${tagOf()||'not set'}</code></p></div><div class="box"><b>☸️ Cluster</b><p>${s.live?`<code>${s.live.tag}</code> · ${s.live.replicas} pods`:'Nothing deployed.'}</p><p>Argo CD: ${!tagOf()?'waiting for deploy/':s.live&&s.live.tag===tagOf()&&!drift()?'Synced':'OutOfSync'}</p></div></div>`;
    find('[data-c=ci]').disabled=!s.run||s.run.done;find('[data-c=edit]').disabled=!s.live;find('[data-c=revert]').disabled=s.config.length<2;
    const f=s.flags,won={pipeline:f.green&&f.blocked,gitops:f.synced,drift:f.healed,sandbox:f.synced&&f.blocked&&f.healed&&f.reverted}[mission];
    if(won&&!s.won){s.won=true;onWin()}
    find('.d-win').textContent=s.won?'✓ Practice complete. Explain the result before moving on.':'';
    el.dispatchEvent(new Event('simulationchange'));
  }
  el.onchange=()=>{s.command='';s.message='Changed the next commit. Push it to start a pipeline run.';draw()};
  el.onclick=e=>{
    const b=e.target.closest('[data-c]');if(!b||b.disabled||stopped)return;const a=b.dataset.c;
    if(a==='reset'){reset();find('[data-c=reset]').focus();return}
    if(a==='commit'){
      s.commit={sha:SHAS[s.n++%SHAS.length],tests:val('tests'),base:val('base')};
      s.run={commit:s.commit,jobs:Object.fromEntries(JOBS.map(j=>[j,'waiting'])),done:false};
      s.command='git push origin main';s.message=`Pushed commit ${s.commit.sha}. GitHub Actions queued a pipeline run for it.`;
    }
    if(a==='ci'){
      const failed=runPipeline();s.run.done=true;s.command='# GitHub Actions: test → build → scan → push → promote';
      if(failed){s.flags.blocked=true;s.message=`Pipeline failed at ${failed}. ${failed==='test'?'A test broke':'The scan found a fixable HIGH vulnerability'}, so every later job was skipped. Nothing new reached git, so the cluster keeps the last good version.`}
      else{s.flags.green=true;s.message=`Pipeline passed. Image ${s.commit.sha} is in the registry and deploy/ now says newTag: ${s.commit.sha}. The cluster has not changed yet.`}
    }
    if(a==='sync'){
      s.command='# Argo CD compares git with the cluster';const t=tagOf();
      if(!t)s.message='deploy/ has no image tag yet. Ship a commit through the pipeline first.';
      else if(drift()){s.live.replicas=2;s.flags.healed=true;s.message='Self-heal: the cluster had pods git does not ask for. Argo CD scaled back to 2, as git says.'}
      else if(s.live?.tag===t)s.message='Synced: the cluster already matches git. Nothing to do.';
      else{const back=s.flags.revertPending;s.live={tag:t,replicas:2};s.flags.synced=true;if(back){s.flags.reverted=true;s.flags.revertPending=false}s.message=`Argo CD found newTag: ${t} in git and rolled the pods to it.${back?' That was the rollback: the old image was reused, nothing was rebuilt.':''}`}
    }
    if(a==='edit'){s.live.replicas=5;s.command='kubectl -n pizza scale deploy/pizza --replicas=5';s.message='The cluster now runs 5 pods, but git still says 2. Argo CD shows OutOfSync.'}
    if(a==='revert'){const gone=s.config.pop();s.flags.revertPending=true;s.command='git revert --no-edit <deploy commit> && git push';s.message=`Reverted the deploy of ${gone}. deploy/ points at ${tagOf()} again. Let Argo CD check git to roll back.`}
    draw();
  };
  reset();
  return {save(){return {s:JSON.parse(JSON.stringify(s)),settings:Object.fromEntries([...el.querySelectorAll('select')].map(x=>[x.name,x.value]))}},load(d){reset();s=d.s;for(const [k,v] of Object.entries(d.settings||{})){const i=el.querySelector(`[name=${k}]`);if(i)i.value=v}draw()},stop(){stopped=true},pause(){},snapshot(){return {...s,drift:drift(),tag:tagOf(),ready:s.live?.replicas||0,settings:{tests:val('tests'),base:val('base')}}}};
}

/* Reuse the lesson simulators; the explorer supplies a map and a paced route. */
