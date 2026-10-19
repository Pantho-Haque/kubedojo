// Simulate: the one-window explorer (guided steps, free-play terminal, real files), ported from the tutorial prototype.
// Framework-free: it owns `el`. The page passes `host`: {name, practiceTitle, onLesson(), storageKey}.
import { DockerSim, HelmSim, PipelineSim, TerraformSim, esc } from './sims.js';
import { CI_FILES, DOCKER_FILES, HELM_FILES, TF_FILES } from './files.js';
import '../product.css';
/* Reuse the lesson simulators; the explorer supplies a map and a paced route. */
export function Explorer(el,subject,host){
  const helm2=subject==='helm2',helm=subject==='helm'||helm2,tf=subject==='terraform',ci=subject==='gitops',P=helm?'h':tf?'t':ci?'c':'d',NAME=host.name;
  const action=(key,label,settings={})=>({key,label,settings});
  const chapter=(title,why,...actions)=>({title,why,actions});
  const handoffs=()=>[action('step','Send resources to Kubernetes'),action('step','Let Kubernetes start the Pods'),action('step','Check whether the Pods are ready')];
  const routes=helm2?[
    {id:'tiller',title:'Follow a Helm 2 release',hint:'helm2 init → install → recover',intro:'Helm 2 needs Tiller, its server, inside the cluster.',finish:'You installed Tiller, sent a release through it, broke an upgrade, rolled back, and purged the release: the whole Helm 2 lifecycle.',chapters:[
      chapter('Install Tiller','Helm 2 has a server part, Tiller, that runs in the cluster. Nothing can be installed until it is there.',action('init','Run helm2 init')),
      chapter('Install one copy','helm2 install --name pizza sends the chart to Tiller, which renders it and creates the release. Follow each handoff to a ready Pod.',action('install','Install the pizza release'),...handoffs()),
      chapter('Grow to three copies','We will request three copies of version 1.28. Settings are only a plan until you upgrade the release.',action('upgrade','Upgrade to three copies',{tag:'1.28',override:'3'}),...handoffs()),
      chapter('Try a broken image','This image tag does not exist. Watch the new copy fail while the old copies keep serving.',action('upgrade','Try the missing image',{tag:'does-not-exist'}),...handoffs()),
      chapter('Recover with rollback','Revision 2 worked. Rollback reuses its settings and creates a new revision.',action('rollback','Roll back to revision 2',{revision:'2'}),...handoffs()),
      chapter('Delete and purge','helm2 delete --purge removes the app and its history from Tiller, so the name pizza can be used again.',action('uninstall','Delete and purge the release'))
    ]}
  ]:helm?[
    {id:'release',title:'Follow a release',hint:'Preview → install → change → recover',intro:'See where Helm stops and Kubernetes takes over.',finish:'You can now explain how a chart becomes a release, why a failed upgrade can leave the old app running, and how rollback recovers it.',chapters:[
      chapter('Preview the recipe','A chart is a recipe. Helm fills it with values to produce Kubernetes YAML. Previewing does not send anything to the cluster.',action('preview','Preview the chart')),
      chapter('Install one copy','Install creates a named release. Follow each handoff to see Kubernetes turn its Deployment into a ready Pod.',action('install','Install the pizza release'),...handoffs()),
      chapter('Grow to three copies','We will request three copies of version 1.28. Settings are only a plan until you upgrade the release.',action('upgrade','Upgrade to three copies',{tag:'1.28',override:'3'}),...handoffs()),
      chapter('Try a broken image','This image tag does not exist. Watch the new copy fail while the three old copies stay available in this example.',action('upgrade','Try the missing image',{tag:'does-not-exist'}),...handoffs()),
      chapter('Recover with rollback','Revision 2 worked. Rollback reuses its settings and creates a new revision; it does not erase history.',action('rollback','Roll back to revision 2',{revision:'2'}),...handoffs()),
      chapter('Remove the release','For this chart, uninstall removes the Deployment and Service. You have followed the full release lifecycle.',action('uninstall','Uninstall the pizza release'))
    ]}
  ]:ci?[
    {id:'ship',title:'Ship your first change',hint:'commit → pipeline → sync',finish:'Your commit passed every job, its image went to the registry, CI wrote the new tag to git, and Argo CD deployed it. You never touched the cluster.',chapters:[
      chapter('Push a commit','Your change goes to the main branch. That starts a pipeline run.',action('commit','Push a commit')),
      chapter('Run the pipeline','CI tests the code, builds an image, scans it, pushes it, and commits the new tag to deploy/.',action('ci','Run the pipeline')),
      chapter('Let Argo CD deploy it','Argo CD notices that deploy/ changed in git and makes the cluster match.',action('sync','Let Argo CD check git'))
    ]},
    {id:'blocked',title:'A failing test blocks the deploy',hint:'Red pipelines ship nothing',finish:'The broken commit stopped at the test job. Nothing was built or written to git, so the working version kept running until the fix went through.',chapters:[
      chapter('Start from a running app','Ship one good commit first: push, run the pipeline, and let Argo CD deploy it.',action('commit','Push a commit'),action('ci','Run the pipeline'),action('sync','Let Argo CD check git')),
      chapter('Push a broken change','This commit breaks a test. The mistake is on purpose.',action('commit','Push the broken commit',{tests:'fail'})),
      chapter('Watch the pipeline stop','The test job fails, so build, scan, push, and promote never run.',action('ci','Run the pipeline')),
      chapter('Check the cluster','Argo CD only deploys what is in git. Nothing new was committed there.',action('sync','Let Argo CD check git')),
      chapter('Fix it and ship','Fix the test, push again, and let the change go all the way.',action('commit','Push the fix',{tests:'pass'}),action('ci','Run the pipeline'),action('sync','Let Argo CD check git'))
    ]},
    {id:'heal',title:'Sync from git and self-heal',hint:'Git wins over kubectl',finish:'A hand-made change made the cluster differ from git. Argo CD noticed and put it back. To keep a change, make it in git.',chapters:[
      chapter('Start from a running app','Ship one good commit first: push, run the pipeline, and let Argo CD deploy it.',action('commit','Push a commit'),action('ci','Run the pipeline'),action('sync','Let Argo CD check git')),
      chapter('Someone changes the cluster by hand','A teammate scales the app to 5 copies with kubectl. Git still says 2.',action('edit','Run kubectl scale by hand')),
      chapter('Argo CD puts it back','With selfHeal on, Argo CD sees the cluster differs from git and undoes the change.',action('sync','Let Argo CD check git'))
    ]},
    {id:'rollback',title:'Roll back with git revert',hint:'Undo a release in one commit',finish:'Reverting the deploy commit pointed git at the previous image. Argo CD rolled back to it without any rebuild, and git history shows exactly what happened.',chapters:[
      chapter('Ship version one','Push, run the pipeline, and deploy.',action('commit','Push version one'),action('ci','Run the pipeline'),action('sync','Let Argo CD check git')),
      chapter('Ship version two','Ship a second change the same way.',action('commit','Push version two'),action('ci','Run the pipeline'),action('sync','Let Argo CD check git')),
      chapter('Revert the release','Customers report a bug in version two. Revert its deploy commit; the old image is still in the registry.',action('revert','git revert the deploy commit'),action('sync','Let Argo CD check git'))
    ]}
  ]:tf?[
    {id:'first',title:'Create your first infrastructure',hint:'init → plan → apply',finish:'You saw why init comes first, read a plan before approving it, and watched apply create resources in dependency order and record them in state.',chapters:[
      chapter('Try plan too early','Terraform needs its provider plugins before it can plan. Watch what happens without them.',action('plan','Run terraform plan')),
      chapter('Install the provider','init downloads the provider: the plugin that knows how to talk to this cloud.',action('init','Run terraform init')),
      chapter('Preview the changes','plan compares your code with the state file and the real cloud. Nothing is created yet.',action('plan','Run terraform plan')),
      chapter('Make it real','apply carries out the plan you reviewed, in dependency order, and records each result in the state file.',action('apply','Apply the plan'))
    ]},
    {id:'change',title:'Change something safely',hint:'Update in place versus replace',finish:'A size change updated the same server (~). A region change needed a new server (-/+), which also changed the DNS record. Always look for -/+ before approving.',chapters:[
      chapter('Build the starting point','Start from a working setup: init, plan, and apply.',action('init','Run terraform init'),action('plan','Run terraform plan'),action('apply','Apply the plan')),
      chapter('Make the server bigger','A size change can happen on the running server. Look for ~ in the plan.',action('plan','Plan a bigger server',{size:'large'}),action('apply','Apply the update')),
      chapter('Move it to another region','A server cannot move regions, so Terraform must destroy it and make a new one. The DNS record needs the new address too.',action('plan','Plan the region move',{region:'us-east'}),action('apply','Apply the replacement'))
    ]},
    {id:'drift',title:'Fix a hand-made change',hint:'The code is the source of truth',finish:'A manual change made the real server differ from state. plan found it and apply put it back. To keep a manual change instead, update the code until plan says No changes.',chapters:[
      chapter('Build the starting point','Start from a working setup: init, plan, and apply.',action('init','Run terraform init'),action('plan','Run terraform plan'),action('apply','Apply the plan')),
      chapter('Someone clicks in the console','A teammate resizes the server in the cloud website. The state file does not know yet.',action('console','Let a teammate change the server')),
      chapter('Find the drift','plan reads the real cloud first, then compares it with your code.',action('plan','Run terraform plan')),
      chapter('Put it back','apply returns the server to what the code says.',action('apply','Apply the plan'))
    ]},
    {id:'cleanup',title:'Remove and clean up',hint:'Delete one thing, then everything',finish:'Removing a block from the code destroyed only that resource. destroy removed everything in state, in reverse dependency order.',chapters:[
      chapter('Build the starting point','Start from a working setup: init, plan, and apply.',action('init','Run terraform init'),action('plan','Run terraform plan'),action('apply','Apply the plan')),
      chapter('Remove one resource from the code','Delete the DNS block from main.tf. Terraform plans to destroy what is no longer in the code.',action('plan','Plan without the DNS record',{dns:'no'}),action('apply','Apply the removal')),
      chapter('Destroy everything','A destroy plan deletes everything in the state file. It is still a plan: read it first.',action('destroy','Plan the destroy'),action('apply','Apply the destroy'))
    ]}
  ]:[
    {id:'life',title:'1. Image → container',hint:'Run, stop, restart, replace',intro:'An image is the recipe. A container is one running copy.',finish:'Stopping kept the container’s file. Removing the container erased it. The image stayed available throughout.',chapters:[
      chapter('Make a running copy','The image already exists in this model. Run creates a new container from it.',action('run','Run a container')),
      chapter('Give it a file','Write a note into this container’s writable layer. The image itself stays unchanged.',action('write','Write a note')),
      chapter('Stop and start','Stop ends the process, but keeps the container. Start runs that same container again.',action('stop','Stop the container'),action('start','Start the same container')),
      chapter('Remove and replace','This time remove the stopped container. Its writable layer goes with it. Compare the new copy’s files.',action('stop','Stop before removing'),action('remove','Remove the container'),action('run','Run a fresh container'))
    ]},
    {id:'build',title:'2. Build an image',hint:'See what Docker reuses',intro:'Build steps reuse cached results when their inputs have not changed.',finish:'Source edits reused dependency installation. A dependency edit rebuilt that step and the steps after it.',chapters:[
      chapter('Build the first version','First build: every step needs a result. Watch the layers appear.',action('build','Build the image')),
      chapter('Change only the code','Keep dependencies before application source in the Dockerfile. Predict what can be reused.',action('source','Edit the app source'),action('build','Rebuild after the source edit')),
      chapter('Change a dependency','Changing dependency inputs invalidates their cache and the following steps.',action('deps','Edit dependencies'),action('build','Rebuild after the dependency edit'))
    ]},
    {id:'network',title:'3. Follow a request',hint:'Host ports versus service names',intro:'An address only makes sense when you know where the request starts.',finish:'The host used a published port. Another container used the service name and internal port on a shared network.',chapters:[
      chapter('Find the closed door','The API listens on port 8000 inside its container. The host has no port forwarded to it yet.',action('request','Try from the host browser')),
      chapter('Open a host port','Map host port 8080 to API port 8000. The host browser uses localhost:8080.',action('request','Publish port 8080 and retry',{publish:'8080'})),
      chapter('Move inside a container','Now the request starts inside web. localhost points back to web itself, not the API.',action('request','Try localhost from web',{from:'peer'})),
      chapter('Use the service address','On their shared network, web can find api by name. Use the internal port, not the host port.',action('request','Send to api:8000',{address:'api:8000'}))
    ]},
    {id:'storage',title:'4. Keep your data',hint:'Writable layer versus volume',intro:'Containers can be replaced. Your important data needs a separate home.',finish:'Data in the removed container was lost. The named volume survived, and the replacement reattached to the same saved order.',chapters:[
      chapter('Store inside a container','Without a volume, the app’s order lives in its container’s writable layer.',action('run','Create without a volume'),action('write','Save an order')),
      chapter('Remove that container','Removing a container also removes its writable layer. Watch the order disappear.',action('remove','Remove and inspect the data')),
      chapter('Attach a separate volume','This time /data points to pizza-data, a named volume outside the container’s writable layer.',action('run','Create with a named volume',{mount:'volume'}),action('write','Save an order to the volume')),
      chapter('Replace and reconnect','Remove this container, then create a new one with the same volume. The saved order is still there.',action('remove','Remove the container again'),action('run','Reattach the same volume'))
    ]},
    {id:'compose',title:'5. Docker Compose',hint:'Connect, start, break, recover',intro:'One Compose project connects web, an API, a network, and persistent storage.',finish:'You saw a startup race, fixed readiness, recovered from a later outage, and kept data across compose down/up. Compose manages this app on one host.',chapters:[
      chapter('Start two services','Short-form depends_on starts API first, but does not wait for it to be ready. web starts too soon.',action('up','Start the Compose project'),action('request','Try opening the app')),
      chapter('Wait for a healthy API','Take the stack down, then add condition: service_healthy. Watch web wait for the API’s health check.',action('down','Take the project down'),action('up','Start with the health gate',{wait:'healthy'}),action('step','Let the API become ready'),action('request','Open the ready app')),
      chapter('Handle a later outage','The startup gate is not continuous repair. web stays running when API becomes unhealthy.',action('fail','Make the API unhealthy'),action('request','Try the app during the outage'),action('step','Recover the API'),action('request','Try the app again')),
      chapter('Recreate without losing data','A normal compose down removes containers and the network, but keeps named volumes. Bring the project back and compare its stored visits.',action('down','Take the project down again'),action('up','Recreate the project'),action('step','Wait for API readiness'),action('request','Check the app and its data'))
    ]}
  ];
  const titles={tiller:'Install an app with Helm 2',ship:'Ship your first change',blocked:'A failing test blocks the deploy',heal:'Sync from git and self-heal',rollback:'Roll back with git revert',first:'Create your first infrastructure',change:'Change something safely',drift:'Fix a hand-made change',cleanup:'Remove and clean up',release:'Install an app with Helm',life:'Run your first container',build:'Build an app you can run',network:'Help two containers talk',storage:'Keep data when a container disappears',compose:'Run the whole app with Compose'};
  const outcomes={
    tiller:'Install Tiller, then install, break, and roll back a release the Helm 2 way.',
    ship:'Take one commit from git push to running pods without touching the cluster.',
    blocked:'See a failing test stop a release while the working version keeps running.',
    heal:'Change the cluster by hand and watch Argo CD put it back.',
    rollback:'Undo a bad release with one git revert, no rebuild.',
    first:'Install a provider, preview a plan, and create your first resources.',
    change:'See which changes keep a resource and which ones replace it.',
    drift:'Find a change someone made by hand and put things back.',
    cleanup:'Remove one resource, then everything, without surprises.',
    release:'Install an app, try a broken update, then bring the working app back.',
    life:'Find out what stays when you stop a container — and what disappears when you remove it.',
    build:'See why changing one file does not always mean rebuilding everything.',
    network:'Learn which address to use to reach an app.',
    storage:'Keep an order safe when its container is replaced.',
    compose:'Start two connected parts of an app, fix a failure, and keep their data.'
  };
  function help(ctx,a,s){
    const key=a.key,kind=ctx.route.id,v={...s.settings,...a.settings};
    if(helm){
      if(key==='init')return ['Install Tiller, Helm 2’s server, into the cluster. This is a one-time step per cluster.','Tiller shows Running in kube-system. No app is installed yet.'];
      if(key==='preview')return ['Turn the app’s recipe (a chart) into instructions. This is a preview; it will not start the app.','The instructions become available. Running copies stay at zero.'];
      if(key==='install')return ['Ask Helm to install this app with the name pizza. We will follow the work one small step at a time.','The installation starts, but the app is not running yet.'];
      if(key==='upgrade')return v.tag==='does-not-exist'?['Try an app version that does not exist. This is an intentional mistake so you can practise recovery.','The new version will fail later. The working copies can stay running.']:['Ask for three copies of the updated app. This is a change to the existing installation.','The new plan asks for three copies. The old app keeps running for now.'];
      if(key==='rollback')return ['Ask Helm to use the last working version again. This is called a rollback.','A recovery starts. The working copies stay available.'];
      if(key==='uninstall')return ['Remove this practice app from the cluster. You can always restart this experiment.','The running app copies disappear.'];
      if(s.phase===1)return ['Send the instructions to Kubernetes, the system that runs the app.','The plan for the running app changes. The copies have not caught up yet.'];
      if(s.phase===2)return ['Let Kubernetes try to start the app copies. Each copy runs in a Pod.','The new copies are starting, or the missing image prevents them from starting.'];
      return ['Check whether the new copies are ready to answer requests.','A working version becomes ready. A missing version shows a failed update.'];
    }
    if(ci){
      if(key==='commit')return a.settings.tests==='fail'?['Push a commit that breaks a test. This mistake is on purpose.','A new commit appears. Its pipeline has not run yet.']:['Push your change to the main branch.','A new commit appears and a pipeline run is queued.'];
      if(key==='ci')return s.run?.commit.tests==='fail'?['Run the pipeline for the broken commit.','The test job turns red. Build, scan, push, and promote are skipped.']:['Run the pipeline: test, build, scan, push, promote.','Every job turns green, a new image appears, and deploy/ gets the new tag.'];
      if(key==='edit')return ['Pretend a teammate runs kubectl scale --replicas=5 straight on the cluster.','The pods jump to 5 and Argo CD shows OutOfSync.'];
      if(key==='revert')return ['Revert the deploy commit for version two and push it.','deploy/ points at version one again. Nothing is rebuilt.'];
      if(s.drift)return ['Let Argo CD compare the cluster with git.','The extra pods disappear: the cluster matches git again.'];
      if(s.tag&&s.live?.tag!==s.tag)return ['Let Argo CD compare git with the cluster.','The pods move to the image tag written in git.'];
      return ['Let Argo CD compare git with the cluster.','Nothing changes: git did not change, so the working version keeps running.'];
    }
    if(tf){
      const set=a.settings;
      if(key==='init')return ['Download the provider plugin for this pretend cloud.','The provider shows Installed. The cloud is still empty.'];
      if(key==='plan'&&!s.init)return ['Ask for a plan before running init. This mistake is on purpose.','An error: the provider is not installed yet.'];
      if(key==='plan'&&set.size)return ['Change the server size to large in main.tf, then ask for a plan.','The server shows ~ update in place. Nothing in the cloud changes yet.'];
      if(key==='plan'&&set.region)return ['Change the region to us-east in main.tf, then plan.','The server shows -/+ replace, and DNS shows ~ update for the new address.'];
      if(key==='plan'&&set.dns)return ['Delete the DNS block from main.tf, then plan.','DNS shows - destroy. The bucket and server stay.'];
      if(key==='plan'&&s.drift)return ['Run plan. It reads the real cloud first.','Terraform spots the hand-made change and plans to undo it.'];
      if(key==='plan')return ['Ask Terraform what it would do. This is only a preview.','The plan lists 3 resources to add. The cloud stays empty.'];
      if(key==='console')return ['Pretend a teammate makes the server bigger in the cloud website, not in the code.','The real server turns red: it no longer matches the state file.'];
      if(key==='destroy')return ['Ask for a destroy plan. This is still only a preview.','Every resource shows - destroy.'];
      return ['Approve the plan you just read.','Real resources change, and the state file records them.'];
    }
    if(kind==='life')return ({run:['Use the saved recipe (the image) to create a new running copy.','A running container appears. Its own files start empty.'],write:['Put one note inside this running container.','The file count goes from zero to one.'],stop:['Turn off the container’s process, but keep the container.','It says Stopped. The note is still there.'],start:['Turn on that same stopped container again.','It says Running again, with the same note.'],remove:['Throw away this stopped container and its own files.','The container and its note disappear. The recipe stays.']})[key];
    if(kind==='build')return key==='source'?['Edit only the app code. Do not build it yet.','The source version changes. The previous build stays the same.']:key==='deps'?['Edit the list of libraries the app needs. These are its dependencies.','The dependency version changes. The previous build stays the same.']:['Build an image from the current files. Docker can reuse unchanged steps.','The build results say Built or Reused for each step.'];
    if(kind==='network')return v.from==='host'?(v.publish==='8080'?['Open a door from port 8080 on your computer to port 8000 in the API container, then retry.','The request succeeds using localhost:8080.']:['Try to reach the API from your computer before opening a port to it.','The request fails. The app has no published door yet.']):(v.address==='api:8000'?['From web, call the other container by its name: api, on port 8000.','The request succeeds across their shared network.']:['Try localhost from inside web. Here localhost means web itself.','The request fails because it is looking in the wrong container.']);
    if(kind==='storage')return key==='run'?(v.mount==='volume'?['Attach a separate storage box (a volume) to the new container.','The container can use any orders already in that storage box.']:['Create a container without separate storage.','Its own storage starts with no orders.']):key==='write'?['Let the app save one order. Watch which storage box receives it.','One order appears either inside the container or in the separate volume.']:['Remove the container. Compare its own files with the separate storage box.','Container files disappear. A separate volume keeps its orders.'];
    if(key==='up')return v.wait==='healthy'?['Start the app with a rule: wait until the API is ready before starting web.','API starts first. web waits instead of starting too soon.']:['Start web (the front door) and API (the worker that handles requests).','Both start, but the API still needs time to become ready.'];
    if(key==='request')return ['Open the app like a visitor would. web must ask the API for a response.','If API is ready, the visit is saved. Otherwise you see a failed request.'];
    if(key==='step')return ['Let the API finish starting or recovering.','API becomes ready. web can now use it.'];
    if(key==='fail')return ['Make the API stop answering correctly. This is a practice failure.','API becomes unhealthy. web stays running but cannot get an answer.'];
    return ['Remove the app’s containers. Keep its separate data volume.','Both services disappear, but the saved visits remain.'];
  }
  /* Free play: a practice terminal and clickable boxes. Every command presses the same hidden
     simulator buttons the guided steps use, so the picture, the guide, and the terminal always agree. */
  const kind=helm2?'helm2':helm?'helm':tf?'terraform':ci?'gitops':'docker';
  const CMDS={ // [boxes that offer it, command]. Docker lists one set per experiment; the others share one sandbox.
    helm2:[['tiller','helm2 init'],['tiller','helm2 version'],['tiller','kubectl get pods -n kube-system'],['chart yaml','helm2 template ./pizza-chart --name pizza --set replicaCount=2'],['release chart','helm2 install ./pizza-chart --name pizza'],['release chart','helm2 upgrade pizza ./pizza-chart --set replicaCount=3 --set image.tag=1.28'],['release pods','helm2 upgrade pizza ./pizza-chart --set replicaCount=3 --set image.tag=does-not-exist'],['release','helm2 history pizza'],['release','helm2 rollback pizza 2'],['pods service','kubectl get pods -n helm-practice'],['release tiller','helm2 ls'],['release tiller','helm2 delete --purge pizza']],
    docker:{
      life:[['image','docker run -d --name pizza-demo pizza:v1'],['container layer','docker exec pizza-demo sh -c "echo hello > /tmp/note"'],['layer','docker exec pizza-demo ls /tmp'],['container','docker stop pizza-demo'],['container','docker start pizza-demo'],['container','docker rm pizza-demo'],['container image','docker ps -a']],
      build:[['source','edit app.py'],['source','edit requirements.txt'],['source layer0 layer1 layer2','edit Dockerfile'],['image layer0 layer1 layer2','docker build -t pizza:dev .'],['image','docker images']],
      network:[['browser','curl localhost:8080'],['web','docker exec web curl localhost:8000'],['web api','docker exec web curl api:8000'],['port','docker rm -f api && docker run -d --name api --network pizza-net -p 127.0.0.1:8080:8000 pizza-api'],['port','docker rm -f api && docker run -d --name api --network pizza-net pizza-api'],['api','edit app.py'],['web','docker network disconnect pizza-net web'],['web','docker network connect pizza-net web'],['api port','docker ps']],
      storage:[['image container','docker run -d --name pizza-demo -p 8080:8000 pizza:v1'],['volume image','docker run -d --name pizza-demo -p 8080:8000 -v pizza-data:/data pizza:v1'],['container layer volume','curl -X POST localhost:8080/orders'],['container layer volume','curl localhost:8080/orders'],['container','docker rm -f pizza-demo'],['volume','docker volume rm pizza-data'],['volume','docker volume ls']],
      compose:[['project','edit compose.yaml'],['project','docker compose up -d'],['browser web','curl localhost:8080'],['api','break api'],['api','docker compose restart api'],['project web api','docker compose ps'],['project','docker compose down'],['volume','docker compose down --volumes']]
    },
    helm:[['chart yaml','helm template pizza ./pizza-chart -f values-prod.yaml --set replicaCount=2'],['release chart','helm install pizza ./pizza-chart'],['release chart','helm upgrade pizza ./pizza-chart --set replicaCount=3 --set image.tag=1.28'],['release pods','helm upgrade pizza ./pizza-chart --set replicaCount=3 --set image.tag=does-not-exist'],['release','helm history pizza'],['release','helm rollback pizza 2'],['pods service','kubectl get pods -n helm-practice'],['deployment','kubectl get deploy pizza -n helm-practice'],['release','helm list -n helm-practice'],['release','helm uninstall pizza -n helm-practice']],
    terraform:[['provider','terraform init'],['plan code','terraform plan -out=tfplan'],['plan bucket server dns state','terraform apply tfplan'],['code server','terraform plan -var size=large -out=tfplan'],['code server dns','terraform plan -var region=us-east -out=tfplan'],['code dns','edit main.tf'],['server','simulate console-edit'],['state','terraform state list'],['state server','terraform state show server.web'],['plan bucket server dns','terraform destroy']],
    gitops:[['commit','git commit -am "Update menu" && git push'],['commit','edit app.py'],['commit ci','edit Dockerfile'],['ci registry','gh run list'],['argo config','argocd app sync pizza'],['argo','argocd app get pizza'],['pods','kubectl -n pizza get pods'],['pods argo','kubectl -n pizza scale deploy/pizza --replicas=5'],['config registry','git revert --no-edit HEAD && git push']]
  };
  const GOALS={ // [simulator flag, what the learner does]
    helm2:[['init','Install Tiller with helm2 init'],['install','Install the release and wait for ready Pods'],['upgrade','Upgrade the release successfully'],['failed','Break an upgrade with an image that does not exist'],['recovered','Roll back and get the app healthy again']],
    docker:{life:[['stopKept','Stop, then start the same container: the note is still there'],['recreatedEmpty','Remove it and run a new one: the note is gone']],build:[['sourceCache','Edit only app.py and rebuild: dependency install stays CACHED']],network:[['failed','Make a request fail and read why'],['host','Reach the API from your browser on the host'],['peer','Reach the API from inside the web container']],storage:[['layerLost','Lose an order by removing a container that has no volume'],['volumeKept','Keep an order through a replacement by using a volume']],compose:[['earlyFailure','Hit the startup race: a 503 before api is ready'],['gatedSuccess','Add a health gate and get a 200']]},
    helm:[['preview','Preview the chart without installing it'],['install','Install the release and wait for ready Pods'],['upgrade','Upgrade the release successfully'],['failed','Break an upgrade with an image that does not exist'],['recovered','Roll back and get the app healthy again']],
    terraform:[['early','Run plan before init and read the error'],['applied','Create the resources with plan → apply'],['updated','Change something in place (~)'],['replaced','Force a replacement (-/+)'],['driftFixed','Find a hand-made change and put it back'],['destroyed','Destroy everything']],
    gitops:[['green','Push a commit through a green pipeline'],['synced','Let Argo CD deploy it'],['blocked','Break a test and watch the pipeline stop'],['healed','Scale by hand and watch Argo CD undo it'],['reverted','Roll back with git revert']]
  };
  const GUIDE={
    helm2:{lede:'A pretend cluster with Helm 2 and Tiller, the Helm the playground runs.',learn:['Install Tiller, Helm 2’s server, with helm2 init','Install a release with --name and watch its Pods become ready','Upgrade it, break it on purpose, and roll back','Delete a release and purge its history'],first:'helm2 init',route:'tiller'},
    docker:{lede:'A pretend Docker host in your browser. Run containers, build images, and connect services.',learn:['Run, stop, and remove containers and see what survives','Rebuild an image and see which steps Docker reuses','Follow a request from your computer into a container','Keep data safe in a volume','Start a two-service app with Compose and fix its startup race'],first:'docker run -d --name pizza-demo pizza:v1',route:'life'},
    helm:{lede:'A pretend cluster with Helm. See where Helm stops and Kubernetes takes over.',learn:['Preview the YAML a chart produces, without installing it','Install a release and watch its Pods become ready','Upgrade it, break an upgrade on purpose, and roll back','Read the release history'],first:'helm install pizza ./pizza-chart',route:'release'},
    terraform:{lede:'A pretend cloud. Your code, Terraform’s state file, and the real resources side by side.',learn:['Run init → plan → apply and read every plan','Tell an in-place update (~) from a replacement (-/+)','Catch a change someone made by hand (drift)','Remove one resource, then everything'],first:'terraform init',route:'first'},
    gitops:{lede:'A pretend repository, pipeline, registry, and cluster. You only push to git; automation does the rest.',learn:['Push a commit and watch test → build → scan → push → promote','See a failing test stop a release','Let Argo CD deploy what git says, and undo hand-made changes','Roll back with one git revert'],first:'git commit -am "Update menu" && git push',route:'ship'}
  };
  const cmdsFor=route=>Array.isArray(CMDS[kind])?CMDS[kind]:CMDS[kind][route.id];
  const goalsFor=route=>Array.isArray(GOALS[kind])?GOALS[kind]:GOALS[kind][route.id];
  const attr=c=>esc(c).replace(/"/g,'&quot;');
  const fakeId=n=>((n+7)*2654435761>>>0).toString(16).padStart(8,'0')+'c0de';
  const states=ctx=>Object.fromEntries(Object.entries(ctx.nodes).map(([k,n])=>[k,String(n.state)]));
  function print(ctx,text,tone=''){
    const log=ctx.page.querySelector('.lab-log');
    for(const line of String(text).split('\n')){const d=document.createElement('div');d.className=tone;d.textContent=line;log.append(d)}
    while(log.childElementCount>400)log.firstChild.remove();
    log.scrollTop=log.scrollHeight;
  }
  // Print the simulator's explanation once, after the command output.
  function note(ctx){const m=ctx.sim.snapshot().message.replace(/\s*(Use|Choose) Next step[^.]*\./g,'');if(m&&m!==ctx.lastMsg){ctx.lastMsg=m;print(ctx,'→ '+m,'note')}}
  // Set engine inputs, then press one engine button. False means the model says that action is not possible now.
  function press(ctx,key,settings={}){
    for(const [name,value] of Object.entries(settings)){const input=ctx.engine.querySelector(`[name=${name}]`);if(input.value!==value){input.value=value;input.dispatchEvent(new Event('change',{bubbles:true}))}}
    const b=key&&ctx.engine.querySelector(`[data-${P}=${key}]`);if(!b||b.disabled)return false;b.click();return true;
  }
  // Animation requests for the next render: packets along rows, glowing boxes, a box being worked on, staggered build steps.
  const freshFx=()=>({rows:{},hits:{},work:null,build:false});
  const flow=(ctx,row,ok,d=0)=>{ctx.fx.rows[row]={ok,d}};
  const hit=(ctx,id,ok,d=0)=>{ctx.fx.hits[id]={ok,d}};
  // One visible change: remember the old picture, let fn press buttons and request animations, then draw.
  function change(ctx,fn){ctx.beforeNodes=states(ctx);ctx.glow=true;ctx.fx=freshFx();fn();render(ctx)}
  // Steps that take time in real life. The terminal waits until the last one; [ms, fn] pairs run one after another.
  function seq(ctx,steps){
    ctx.busy=true;ctx.page.querySelector('.lab-prompt').classList.add('busy');let i=0;
    const next=()=>{
      if(i===steps.length||!ctx.busy){const done=ctx.busy;ctx.busy=false;ctx.page.querySelector('.lab-prompt').classList.remove('busy');const rest=ctx.rest;ctx.rest=null;if(rest)runParts(ctx,rest);else if(done)goalsView(ctx);return}
      const [ms,fn]=steps[i++];ctx.timer=setTimeout(()=>{if(!ctx.busy)return;try{fn()}finally{next()}},ms);
    };
    next();
  }
  // A background timer that does not block the terminal (a health check passing while you keep typing).
  function later(ctx,ms,fn){clearTimeout(ctx.bg);ctx.bg=setTimeout(fn,ms)}
  function stopTimers(ctx){clearTimeout(ctx.timer);clearTimeout(ctx.bg);ctx.busy=false;ctx.rest=null;ctx.page.querySelector('.lab-prompt')?.classList.remove('busy')}
  function runCommand(ctx,line){
    line=line.trim();if(!line)return;
    if(ctx.busy){print(ctx,'⏳ Still working on the last command. Watch the picture, then try again.','note');return}
    ctx.touched=true;print(ctx,'$ '+line,'cmd');ctx.history.push(line);ctx.hpos=ctx.history.length;
    if(line==='clear'){ctx.page.querySelector('.lab-log').textContent='';persist(ctx);return} // clearing also clears the saved history
    runParts(ctx,line.split('&&').map(x=>x.trim().replace(/\s+/g,' ')).filter(Boolean));
  }
  function runParts(ctx,parts){
    ctx.beforeNodes=states(ctx);ctx.glow=true;ctx.fx=freshFx();ctx.running=true;
    try{
      while(parts.length){
        const part=parts.shift(),r=EXEC[kind](ctx,part,ctx.sim.snapshot());
        if(r===false)break;
        if(ctx.busy){if(parts.length)ctx.rest=parts;break}
        note(ctx);
      }
    }finally{ctx.running=false;render(ctx)}
  }
  function common(ctx,cmd,say){
    if(cmd==='help'){say('Commands this experiment understands. Click a box in the picture to see the ones for it.\n'+[...new Set(cmdsFor(ctx.route).map(c=>c[1]))].map(c=>'  '+c).join('\n')+'\n  help · clear · ↑ for history\nedit <file> stands in for opening the file in your editor. simulate … and break … stand in for events you do not control.','note');return true}
    return false;
  }
  function unknown(cmd,fail){return fail(/^(docker|curl|edit|helm|kubectl|terraform|git|gh|argocd|simulate|break)\b/.test(cmd)?'This practice terminal models only a few commands here. Type help to see them.':`command not found: ${cmd.split(' ')[0]}. Type help.`)}
  const EXEC={
    helm2(ctx,cmd,s){
      const say=(t,tone)=>print(ctx,t,tone),fail=t=>{say(t,'bad');return false};
      if(common(ctx,cmd,say,fail))return;
      cmd=cmd.replace(/^helm2\b/,'helm'); // Helm 2 is usually installed as helm2 next to Helm 3; accept both
      if(/^helm init\b/.test(cmd)){
        if(s.tiller)return say('Warning: Tiller is already installed in the cluster.\n(Use --client-only to suppress this message, or --upgrade to upgrade Tiller to the current version.)','note');
        press(ctx,'init');hit(ctx,'tiller',true);return say('$HELM_HOME has been configured at /home/learner/.helm.\nTiller (the Helm server-side component) has been installed into your Kubernetes Cluster.','ok');
      }
      if(cmd==='helm version')return say('Client: &version.Version{SemVer:"v2.17.0", GitCommit:"a690bad98af45b015bd3da1a41f6218b1a451dbe", GitTreeState:"clean"}\n'+(s.tiller?'Server: &version.Version{SemVer:"v2.17.0", GitCommit:"a690bad98af45b015bd3da1a41f6218b1a451dbe", GitTreeState:"clean"}':'Error: could not find tiller'),s.tiller?'':'bad');
      if(/^kubectl get (pods?|po)\b.*-n kube-system/.test(cmd))return say('NAME                             READY  STATUS\ncoredns-5d78c9869d-6wq2t         1/1    Running\n'+(s.tiller?'tiller-deploy-6f8d4f6c9c-x2k8p   1/1    Running':''));
      if(/^helm\b/.test(cmd)&&!/^helm (template|help|version)\b/.test(cmd)&&!s.tiller)return fail('Error: could not find tiller. Run helm2 init first.');
      if(/^helm install\b/.test(cmd)){const m=cmd.match(/--name[ =](\S+)/);if(!m)return fail('This practice names the release: helm2 install ./pizza-chart --name pizza (without --name Helm 2 invents a name like wandering-otter).');cmd=cmd.replace(/\s*--name[ =]\S+/,'').replace(/^helm install/,'helm install '+m[1])}
      if(/^helm template\b/.test(cmd))cmd=cmd.replace(/\s*--name[ =]\S+/,'').replace(/^helm template/,'helm template pizza');
      if(/^helm delete\b/.test(cmd)){if(!/--purge\b/.test(cmd))return fail('In this practice, use helm2 delete --purge pizza. Without --purge Helm 2 keeps the release history and the name pizza stays taken.');cmd='helm uninstall pizza'}
      if(cmd==='helm ls'||cmd==='helm list')cmd='helm list';
      return EXEC.helm(ctx,cmd,s);
    },
    docker(ctx,cmd,s){
      const k=ctx.route.id,v=s.settings,say=(t,tone)=>print(ctx,t,tone),fail=t=>{say(t,'bad');return false};
      if(common(ctx,cmd,say,fail))return;
      const act=(key,set)=>press(ctx,key,set)||fail('The model cannot do that right now. Type help to see what fits.');
      const ps=all=>{
        const rows=k==='compose'?(s.api==='absent'?[]:[['pizza-learning-api-1','api',s.api==='healthy'?'Up (healthy)':s.api==='unhealthy'?'Up (unhealthy)':'Up (health: starting)',''],['pizza-learning-web-1','web',s.web==='running'?'Up':'Created (waiting for api)',s.web==='running'?'127.0.0.1:8080->8000/tcp':'']]):
          k==='network'?[['api','pizza-api','Up',v.publish==='8080'?'127.0.0.1:8080->8000/tcp':'8000/tcp'],['web','pizza-web','Up','8000/tcp']]:
          s.container&&(all||s.container!=='stopped')?[['pizza-demo','pizza:v1',s.container==='stopped'?'Exited (0) 3 seconds ago':'Up 5 seconds',k==='storage'?'0.0.0.0:8080->8000/tcp':'']]:[];
        say(['NAME                  IMAGE / SERVICE   STATUS                       PORTS',...rows.map(r=>r[0].padEnd(22)+r[1].padEnd(18)+r[2].padEnd(29)+r[3])].join('\n'));
      };
      if(/^docker (ps|container ls)\b/.test(cmd)||cmd==='docker compose ps')return ps(/ -a\b|--all|compose/.test(cmd));
      if(/^docker (images|image ls)\b/.test(cmd))return say('REPOSITORY   TAG   IMAGE ID\npizza        v1    '+fakeId(1)+(s.built?'\npizza        dev   '+fakeId(s.source*31+s.deps):''));
      if(cmd==='docker volume ls')return say('DRIVER   VOLUME NAME\n'+(k==='storage'||k==='compose'?'local    '+(k==='compose'?'pizza-learning_':'')+'pizza-data      # holds '+s.volume+(k==='compose'?' visits':' orders'):''));
      if(k==='life'||k==='storage'){
        const running=k==='life'?s.container==='running':!!s.container;
        if(/^docker (container )?run\b/.test(cmd)){
          if(s.container)return fail('docker: Error response from daemon: Conflict. The container name "/pizza-demo" is already in use. Remove it first: docker rm -f pizza-demo');
          const r=act('run',k==='storage'?{mount:/(-v|--volume|--mount)[ =].*pizza-data/.test(cmd)?'volume':'layer'}:{});if(r){say(fakeId(s.serial+1));hit(ctx,'container',true)}return r;
        }
        if(/^docker (stop|start|rm|exec)\b/.test(cmd)&&(!cmd.includes('pizza-demo')||!s.container))return fail('Error response from daemon: No such container: '+cmd.split(' ').slice(2).find(x=>!x.startsWith('-')));
        if(/^docker stop\b/.test(cmd)){say('pizza-demo');if(k==='storage')return say('This experiment keeps its container running. Use docker rm -f pizza-demo.','note');return running?act('stop'):undefined}
        if(/^docker start\b/.test(cmd)){say('pizza-demo');return running?undefined:act('start')}
        if(/^docker rm\b/.test(cmd)){
          if(running&&!/ -f\b|--force/.test(cmd))return fail('Error response from daemon: cannot remove container "/pizza-demo": container is running: stop the container before removing or force remove');
          if(k==='life'&&running)press(ctx,'stop');say('pizza-demo');return act('remove');
        }
        if(/^docker exec\b/.test(cmd)){
          if(!running)return fail('Error response from daemon: container '+fakeId(s.serial)+' is not running');
          if(/ ls\b/.test(cmd))return say(s.layer?'note':'');
          if(/ cat\b/.test(cmd))return s.layer?say('hello'):fail('cat: can\'t open \'/tmp/note\': No such file or directory');
          if(/>|touch/.test(cmd)){hit(ctx,s.container==='volume'?'volume':'layer',true);return act('write')}
        }
        if(k==='storage'&&/^curl\b.*localhost:8080\/orders/.test(cmd)){
          if(!s.container)return fail('curl: (7) Failed to connect to localhost port 8080: Connection refused');
          if(/-X POST|-d /.test(cmd)){const r=act('write');hit(ctx,s.container==='volume'?'volume':'layer',true);say('{"saved": true}','ok');return r}
          return say('{"orders": '+(s.container==='volume'?s.volume:s.layer)+'}','ok');
        }
        if(k==='storage'&&cmd==='docker volume rm pizza-data'){if(s.container==='volume')return fail('Error response from daemon: remove pizza-data: volume is in use - ['+fakeId(s.serial)+']');say('pizza-data');return act('erase')}
      }
      if(k==='build'){
        if(cmd==='edit app.py'){say('✎ saved app.py','ok');return act('source')}
        if(cmd==='edit requirements.txt'){say('✎ saved requirements.txt','ok');return act('deps')}
        if(cmd==='edit Dockerfile'){const order=v.order==='good'?'bad':'good';press(ctx,null,{order});return say('✎ saved Dockerfile:\n'+DOCKERFILE[order],'ok')}
        if(/^docker (image )?build\b/.test(cmd)){ctx.fx.build=true;const r=act('build');const t=ctx.sim.snapshot().trace;say(t.map((x,i)=>{const [n,st]=x.split(': ');return `#${i+2} [${i+1}/${t.length}] ${n.padEnd(26)}${st==='CACHED'?'CACHED':'DONE 4.2s'}`}).join('\n')+'\n#'+(t.length+2)+' naming to docker.io/library/pizza:dev done');return r}
      }
      if(k==='network'){
        const curl=cmd.match(/^(docker exec web )?curl (?:-\S+ )*(?:https?:\/\/)?([\w.]+):(\d+)/);
        if(curl){
          const from=curl[1]?'peer':'host',address=curl[2]+':'+curl[3];
          if(!['localhost:8080','localhost:8000','api:8000','api:8080'].includes(address))return fail(`curl: (6) Could not resolve host: ${curl[2]}`);
          act('request',{from,address});
          const a=ctx.sim.snapshot(),r=a.reason,ok=!/^Request failed/.test(a.message);
          flow(ctx,from==='host'?'host':'net',ok);hit(ctx,ok?'api':({nopublish:'port',hostaddr:'port',nonet:'web',peeraddr:'web',loopback:'api'})[r],ok,ok?.9:.7);
          if(ok)say('{"pizzas": ["margherita", "funghi"]}','ok');
          else say(r==='loopback'&&from==='host'?'curl: (56) Recv failure: Connection reset by peer':curl[2]==='api'&&(from==='host'||r==='nonet')?`curl: (6) Could not resolve host: api`:`curl: (7) Failed to connect to ${curl[2]} port ${curl[3]}: Connection refused`,'bad');
          return;
        }
        if(cmd==='docker rm -f api')return say('api');
        if(/^docker run\b.*--name api\b/.test(cmd)){press(ctx,null,{publish:/-p (127\.0\.0\.1:)?8080:8000\b/.test(cmd)?'8080':'none'});hit(ctx,'port',true);return say(fakeId(Date.now()%997))}
        if(cmd==='edit app.py'){const listen=v.listen==='all'?'loopback':'all';press(ctx,null,{listen});return say('✎ saved api/app.py:\n    HTTPServer(("'+(listen==='all'?'0.0.0.0':'127.0.0.1')+'", PORT), Handler)'+(listen==='all'?'   # any interface: other containers and published ports reach it':'   # only api itself can connect'),'ok')}
        const net=cmd.match(/^docker network (connect|disconnect) pizza-net web$/);
        if(net){const network=net[1]==='connect'?'yes':'no';if(v.network===network)return fail(`Error response from daemon: endpoint web ${network==='yes'?'already exists in':'is not connected to'} network pizza-net`);press(ctx,null,{network});return}
      }
      if(k==='compose'){
        const up=s.api!=='absent';
        if(cmd==='edit compose.yaml'){const wait=v.wait==='short'?'healthy':'short';press(ctx,null,{wait});return say('✎ saved compose.yaml:\n  web:\n    depends_on:\n'+(wait==='healthy'?'      api:\n        condition: service_healthy   # wait for the health check':'      - api                          # start order only, does not wait')+(up?'\nTakes effect on the next docker compose up.':''),'ok')}
        const healthy=gated=>later(ctx,4500,()=>{if(ctx.sim.snapshot().api!=='starting')return;change(ctx,()=>{press(ctx,'step');hit(ctx,'api',true);if(gated)hit(ctx,'web',true,.4)});print(ctx,' ✔ Container pizza-learning-api-1   Healthy'+(gated?'\n ✔ Container pizza-learning-web-1   Started':''),'ok');note(ctx)});
        if(/^docker compose up\b/.test(cmd)){
          if(up)return say(' ✔ Container pizza-learning-api-1  Running\n ✔ Container pizza-learning-web-1  Running');
          const r=act('up'),gated=ctx.sim.snapshot().web!=='running';
          say(' ✔ Network pizza-learning_default     Created\n ✔ Volume pizza-learning_pizza-data  Created\n ✔ Container pizza-learning-api-1   Started\n'+(gated?' ⠿ Container pizza-learning-api-1   Waiting  (health check every 3s)':' ✔ Container pizza-learning-web-1   Started'));
          healthy(gated);return r;
        }
        if(cmd==='curl localhost:8080'||cmd==='curl http://localhost:8080'){
          if(s.web!=='running')return fail('curl: (7) Failed to connect to localhost port 8080: Connection refused');
          const r=act('request'),ok=ctx.sim.snapshot().api==='healthy';flow(ctx,'net',ok);hit(ctx,'api',ok,ok?.9:.7);if(ok)hit(ctx,'volume',true,1.4);
          say(ok?'Hello from pizza! Visits: '+ctx.sim.snapshot().volume:'HTTP/1.1 503 Service Unavailable',ok?'ok':'bad');return r;
        }
        if(cmd==='break api'){if(s.api!=='healthy')return fail('api is not healthy right now, so there is nothing to break.');say('# simulated: api loses its database; health checks start failing','note');hit(ctx,'api',false);return act('fail')}
        if(cmd==='docker compose restart api'){
          if(!up)return fail('no container found for project "pizza-learning": service "api"');
          say(' ✔ Container pizza-learning-api-1  Started');later(ctx,3000,()=>{if(!['starting','unhealthy'].includes(ctx.sim.snapshot().api))return;change(ctx,()=>{press(ctx,'step');hit(ctx,'api',true)});print(ctx,' ✔ Container pizza-learning-api-1  Healthy','ok');note(ctx)});return;
        }
        if(/^docker compose down\b/.test(cmd)){
          const vols=/ -v\b|--volumes/.test(cmd);clearTimeout(ctx.bg);
          if(up){act('down');say(' ✔ Container pizza-learning-web-1  Removed\n ✔ Container pizza-learning-api-1  Removed\n ✔ Network pizza-learning_default  Removed')}
          if(vols&&ctx.sim.snapshot().volume){act('erase');say(' ✔ Volume pizza-learning_pizza-data  Removed')}
          return;
        }
      }
      return unknown(cmd,fail);
    },
    helm(ctx,cmd,s){
      const say=(t,tone)=>print(ctx,t,tone),fail=t=>{say(t,'bad');return false};
      if(common(ctx,cmd,say,fail))return;
      const installed=s.history.length>0,last=s.history.at(-1);
      // Like real Helm without --reuse-values: anything you do not pass falls back to the chart defaults.
      function args(){
        const settings={profile:(cmd.match(/(?:-f|--values)[ =]values-(dev|prod)\.yaml/)||[])[1]||'default',override:'',tag:'1.27'};
        for(const kv of [...cmd.matchAll(/--set[ =](\S+)/g)].flatMap(m=>m[1].split(','))){
          const [key,value]=kv.split('=');
          if(key==='replicaCount'&&/^[1-5]$/.test(value))settings.override=value;
          else if(key==='image.tag'&&['1.27','1.28','does-not-exist'].includes(value))settings.tag=value;
          else return fail(`Error: this practice chart accepts replicaCount=1…5 and image.tag=1.27, 1.28 or does-not-exist (got ${kv})`)&&null;
        }
        return settings;
      }
      // helm --wait, paced: Kubernetes accepts the objects, starts Pods, then Helm checks readiness.
      function wait(){
        seq(ctx,[
          [700,()=>{change(ctx,()=>{press(ctx,'step');flow(ctx,'render',true);hit(ctx,'deployment',true,.9);hit(ctx,'service',true,.9)});note(ctx)}],
          [1200,()=>{let bad;change(ctx,()=>{press(ctx,'step');bad=ctx.sim.snapshot().desired?.tag==='does-not-exist';flow(ctx,'k8s',!bad);hit(ctx,'pods',!bad,bad?.7:.9)});note(ctx)}],
          [1400,()=>{let r;change(ctx,()=>{press(ctx,'step');r=ctx.sim.snapshot().history.at(-1);hit(ctx,'release',r.status==='deployed')});
            if(r.status==='failed')print(ctx,`Error: ${r.op==='install'?'INSTALLATION':'UPGRADE'} FAILED: context deadline exceeded (resource Deployment/helm-practice/pizza not ready)`,'bad');
            else print(ctx,`NAME: pizza\nNAMESPACE: helm-practice\nSTATUS: deployed\nREVISION: ${r.rev}\nNOTES: ${r.replicas} cop${r.replicas===1?'y':'ies'} of nginx:${r.tag} ready.`,'ok');
            note(ctx)}]
        ]);
      }
      if(/^helm (template|install --dry-run)\b/.test(cmd)){
        const set=args();if(!set)return false;press(ctx,'preview',set);flow(ctx,'render',true);hit(ctx,'yaml',true,.9);
        const lines=ctx.sim.snapshot().preview.split('\n');return say(lines.slice(0,34).join('\n')+(lines.length>34?'\n… ('+(lines.length-34)+' more lines in Real files)':''));
      }
      if(/^helm (install|upgrade)\b/.test(cmd)){
        const op=/^helm upgrade --install\b/.test(cmd)?(installed?'upgrade':'install'):cmd.split(' ')[1];
        if(op==='install'&&installed)return fail('Error: INSTALLATION FAILED: cannot re-use a name that is still in use');
        if(op==='upgrade'&&!installed)return fail('Error: UPGRADE FAILED: "pizza" has no deployed releases');
        const set=args();if(!set)return false;
        if(!press(ctx,op,set))return fail('Helm is still busy with the last operation.');
        hit(ctx,'release',true);hit(ctx,'yaml',true);say(`helm: rendered the chart and recorded revision ${ctx.sim.snapshot().history.at(-1).rev} (pending-${op}). Waiting for Kubernetes…`,'note');note(ctx);wait();return;
      }
      if(/^helm rollback\b/.test(cmd)){
        if(!installed)return fail('Error: release: not found');
        const ok=s.history.filter(r=>r.status==='deployed'||r.status==='superseded'),n=+(cmd.match(/^helm rollback pizza (\d+)/)||[])[1]||ok.filter(r=>r!==last).at(-1)?.rev;
        const r=s.history.find(x=>x.rev===n);
        if(!r)return fail(`Error: release has no ${n||'earlier'} version`);
        if(!ok.includes(r))return fail(`Revision ${n} ${r.status==='failed'?'failed':'is not finished'}. Pick one that worked: helm history pizza`);
        press(ctx,'rollback',{revision:String(n)});hit(ctx,'release',true);say(`helm: rolling back. Revision ${s.history.length+1} reuses revision ${n}’s settings. Waiting for Kubernetes…`,'note');note(ctx);wait();return;
      }
      if(/^helm history\b/.test(cmd)){
        if(!installed)return fail('Error: release: not found');
        return say('REVISION  STATUS            CHART              APP VERSION  DESCRIPTION\n'+s.history.map(r=>String(r.rev).padEnd(10)+r.status.padEnd(18)+'pizza-chart-0.1.0  '+r.tag.padEnd(13)+({install:'Install complete',upgrade:r.status==='failed'?'Upgrade failed: context deadline exceeded':'Upgrade complete',rollback:'Rollback to '+r.rev}[r.op]||r.op)).join('\n'));
      }
      if(/^helm (list|ls)\b/.test(cmd))return say('NAME   NAMESPACE      REVISION  STATUS     CHART\n'+(installed?`pizza  helm-practice  ${String(last.rev).padEnd(10)}${last.status.padEnd(11)}pizza-chart-0.1.0`:''));
      if(/^helm uninstall\b/.test(cmd)){if(!installed)return fail('Error: uninstall: Release not loaded: pizza: release: not found');press(ctx,'uninstall');hit(ctx,'release',false);return say('release "pizza" uninstalled')}
      if(/^kubectl get (pods?|po)\b/.test(cmd)){
        const bad=s.desired?.tag==='does-not-exist'&&s.phase!==1&&s.phase!==2;
        const rows=[...Array.from({length:s.ready},(_,i)=>[`pizza-7d9f5-${'abcdefgh'[i]}x2k`,'1/1','Running']),...(bad?[['pizza-5c4b8-zq7m','0/1','ImagePullBackOff']]:[])];
        return rows.length?say('NAME                READY  STATUS\n'+rows.map(r=>r[0].padEnd(20)+r[1].padEnd(7)+r[2]).join('\n')):say('No resources found in helm-practice namespace.');
      }
      if(/^kubectl get (deploy|deployment|deployments)\b/.test(cmd))return s.desired?say(`NAME   READY  UP-TO-DATE  AVAILABLE\npizza  ${s.ready}/${s.desired.replicas}    ${s.desired.tag==='does-not-exist'?0:s.ready}           ${s.ready}`):fail('Error from server (NotFound): deployments.apps "pizza" not found');
      return unknown(cmd,fail);
    },
    terraform(ctx,cmd,s){
      const say=(t,tone)=>print(ctx,t,tone),fail=t=>{say(t,'bad');return false};
      if(common(ctx,cmd,say,fail))return;
      const BOX={'bucket.menu':'bucket','server.web':'server','dns.pizza':'dns'};
      // -var values; anything not passed falls back to the defaults in variables.tf.
      function vars(){
        const v={size:'small',region:'eu-west'};for(const m of cmd.matchAll(/-var[ =]['"]?(size|region)=([\w-]+)/g))v[m[1]]=m[2];
        if(!['small','large'].includes(v.size))return fail('│ Error: Invalid value for variable\n│ The size must be "small" or "large".')&&null;
        if(!['eu-west','us-east'].includes(v.region))return fail('│ Error: this practice cloud has two regions: eu-west and us-east.')&&null;
        return v;
      }
      function showPlan(){
        const a=ctx.sim.snapshot();
        if(/^Error/.test(a.message)){flow(ctx,'plan',false);hit(ctx,'plan',false,.7);hit(ctx,'provider',false,1);fail('│ Error: Inconsistent dependency lock file\n│ The provider pretend/cloud is not installed. Run "terraform init".');return false}
        flow(ctx,'plan',true);hit(ctx,'plan',true,.9);
        if(!a.plan.length){say('No changes. Your infrastructure matches the configuration.','ok');return true}
        a.planLines.forEach(l=>say(l,/^\s*\+/.test(l)?'ok':/^\s*~/.test(l)?'warn':'bad'));say(a.planSummary);return true;
      }
      // Apply the saved plan one resource at a time, the way Terraform reports it.
      function apply(){
        const a=ctx.sim.snapshot();
        if(!a.plan||!a.plan.length){press(ctx,'apply');const m=ctx.sim.snapshot().message;return /^Error/.test(m)?fail('│ '+m):say('No changes to apply.','ok')}
        const ops=[...a.plan.filter(x=>x.op!=='delete'),...a.plan.filter(x=>x.op==='delete').reverse()];
        const doing={create:'Creating...',update:'Modifying...',replace:'Destroying and recreating...',delete:'Destroying...'},done={create:'Creation complete after 1s',update:'Modifications complete after 1s',replace:'Replacement complete after 2s',delete:'Destruction complete after 0s'};
        seq(ctx,[...ops.map(x=>[650,()=>{change(ctx,()=>{ctx.fx.work=BOX[x.a]});print(ctx,`${x.a}: ${doing[x.op]}`)}]),
          [700,()=>{change(ctx,()=>{press(ctx,'apply');ops.forEach((x,i)=>hit(ctx,BOX[x.a],x.op!=='delete',i*.3));hit(ctx,'state',true,ops.length*.3)});print(ctx,ops.map(x=>`${x.a}: ${done[x.op]}`).join('\n'),'ok');note(ctx)}]]);
      }
      if(cmd==='terraform init'){
        if(s.init)return say('Terraform has been successfully initialized! (The provider was already installed.)','ok');
        say('Initializing the backend...\nInitializing provider plugins...\n- Finding pretend/cloud versions matching "~> 1.4"...');
        seq(ctx,[[600,()=>print(ctx,'- Installing pretend/cloud v1.4.0...')],[700,()=>{change(ctx,()=>{press(ctx,'init');hit(ctx,'provider',true)});print(ctx,'- Installed pretend/cloud v1.4.0 (signed)\nTerraform has created a lock file .terraform.lock.hcl\n\nTerraform has been successfully initialized!','ok');note(ctx)}]]);
        return;
      }
      if(/^terraform plan\b/.test(cmd)){
        if(/-destroy\b/.test(cmd)){press(ctx,'destroy');return showPlan()||false}
        const v=vars();if(!v)return false;press(ctx,'plan',v);return showPlan()||false;
      }
      if(/^terraform apply\b/.test(cmd)){
        if(!/\btfplan\b/.test(cmd)){
          const v=vars();if(!v)return false;press(ctx,'plan',v);if(!showPlan())return false;
          if(!ctx.sim.snapshot().plan.length)return;
          say('Do you want to perform these actions? Only "yes" will be accepted.\n  Enter a value: yes   (typed for you in this practice)','note');
        }
        return apply();
      }
      if(cmd==='terraform destroy'){
        press(ctx,'destroy');if(!showPlan())return false;
        if(!ctx.sim.snapshot().plan.length)return;
        say('Do you really want to destroy all resources?\n  Enter a value: yes   (typed for you in this practice)','note');return apply();
      }
      if(cmd==='edit main.tf'){const dns=s.settings.dns==='yes'?'no':'yes';press(ctx,null,{dns});hit(ctx,'code',true);return say(dns==='no'?'✎ saved main.tf:\n- resource "pretend_dns" "pizza" {\n-   name   = "pizza.example.com"\n-   target = pretend_server.web.ip\n- }':'✎ saved main.tf:\n+ resource "pretend_dns" "pizza" {\n+   name   = "pizza.example.com"\n+   target = pretend_server.web.ip\n+ }','ok')}
      if(cmd==='simulate console-edit'){if(!s.real['server.web'])return fail('There is no real server yet for a teammate to change. Apply first.');say('# simulated: a teammate resizes server.web in the cloud website','note');hit(ctx,'server',false);return press(ctx,'console')}
      if(cmd==='terraform state list'){const k=Object.keys(s.state);return k.length?say(k.join('\n')):say('No state. Nothing has been applied yet.','note')}
      const show=cmd.match(/^terraform state show (\S+)/);
      if(show){const o=s.state[show[1]];return o?say(`# ${show[1]}:\nresource "${show[1].split('.')[0]}" "${show[1].split('.')[1]}" {\n`+Object.entries(o).map(([k,v])=>`    ${k.padEnd(7)}= "${v}"`).join('\n')+'\n}'):fail(`No instance found for the given address: ${show[1]}`)}
      return unknown(cmd,fail);
    },
    gitops(ctx,cmd,s){
      const say=(t,tone)=>print(ctx,t,tone),fail=t=>{say(t,'bad');return false};
      if(common(ctx,cmd,say,fail))return;
      const JOBS=['test','build','scan','push','promote'];
      // The pipeline starts by itself after a push. Its jobs light up one after another.
      function pipeline(sha){
        seq(ctx,[[900,()=>{change(ctx,()=>{press(ctx,'ci');const jobs=ctx.sim.snapshot().run.jobs;flow(ctx,'ci',true);if(!Object.values(jobs).includes('failed')){flow(ctx,'artifact',true,1.9);hit(ctx,'registry',true,1.9);hit(ctx,'config',true,2.8)}});print(ctx,`GitHub Actions · run for ${sha}`,'note')}],
          ...JOBS.map(j=>[450,()=>{const st=ctx.sim.snapshot().run.jobs[j];print(ctx,`${{passed:'✓',failed:'✗',skipped:'–'}[st]} ${j.padEnd(8)}${st==='failed'?(j==='test'?'FAIL: test_menu_lists_every_pizza':'2 HIGH vulnerabilities with fixes available'):st==='skipped'?'skipped':st==='passed'&&j==='push'?'ghcr.io/you/pizza:'+sha:st==='passed'&&j==='promote'?'deploy/kustomization.yaml → newTag: '+sha:''}`,st==='passed'?'ok':st==='failed'?'bad':'note')}]),
          [300,()=>note(ctx)]]);
      }
      if(cmd==='edit app.py'||cmd==='edit app/app.py'){const tests=s.settings.tests==='pass'?'fail':'pass';press(ctx,null,{tests});hit(ctx,'commit',tests==='pass');return say(tests==='fail'?'✎ saved app/app.py:\n-    return {"menu": MENU, "version": VERSION}\n+    return {"menu": MENU[:1], "version": VERSION}   # oops: drops two pizzas. A test will catch it.':'✎ saved app/app.py: the menu bug is fixed\n+    return {"menu": MENU, "version": VERSION}','ok')}
      if(cmd==='edit Dockerfile'||cmd==='edit app/Dockerfile'){const base=s.settings.base==='clean'?'vulnerable':'clean';press(ctx,null,{base});hit(ctx,'commit',base==='clean');return say(base==='vulnerable'?'✎ saved app/Dockerfile:\n- FROM python:3.13-slim\n+ FROM python:3.13.0-slim   # an old patch release with a fixable HIGH vulnerability':'✎ saved app/Dockerfile:\n+ FROM python:3.13-slim   # back on the current base image','ok')}
      if(/^git commit\b/.test(cmd)){ctx.staged=true;return say(`[main] ${(cmd.match(/-a?m ?["']([^"']+)/)||[])[1]||'Update'}\n 1 file changed`)}
      if(/^git revert\b/.test(cmd)){
        if(s.config.length<2)return fail('Nothing to roll back to yet. Ship two versions first, so the previous image exists.');
        const gone=s.config.at(-1);press(ctx,'revert');ctx.reverted=true;hit(ctx,'config',true);return say(`[main] Revert "deploy: pizza ${gone}"\n deploy/kustomization.yaml: newTag back to ${ctx.sim.snapshot().tag}`);
      }
      if(/^git push\b/.test(cmd)){
        if(ctx.reverted){ctx.reverted=false;return say('To github.com:you/pizza.git\n   main -> main\n# CI ignores commits that only change deploy/, so nothing is rebuilt. Argo CD will pick up the old tag.','note')}
        if(!ctx.staged)return say('Everything up-to-date');
        const prev=s.commit?.sha||'9f0e1d2';ctx.staged=false;press(ctx,'commit');hit(ctx,'commit',true);const sha=ctx.sim.snapshot().commit.sha;
        say(`To github.com:you/pizza.git\n   ${prev}..${sha}  main -> main`);note(ctx);pipeline(sha);return;
      }
      if(/^gh run (list|view)\b/.test(cmd)){
        if(!s.run)return say('No runs yet. Push a commit to start one.','note');
        const failed=Object.entries(s.run.jobs).find(([,v])=>v==='failed');
        return say(`STATUS     COMMIT   JOBS\n${!s.run.done?'queued   ':failed?'✗ failed ':'✓ success'}  ${s.run.commit.sha}  `+JOBS.map(j=>`${j}:${s.run.jobs[j]}`).join(' '),failed?'bad':'');
      }
      if(/^argocd app sync\b/.test(cmd)){
        const before=JSON.stringify(s.live);press(ctx,'sync');const a=ctx.sim.snapshot(),moved=before!==JSON.stringify(a.live);
        hit(ctx,'argo',!!a.tag);if(moved){flow(ctx,'cluster',true,.3);hit(ctx,'pods',true,1.2)}
        return say(moved?`Name:          pizza\nSync Status:   Synced to main (${a.tag})\nHealth Status: Healthy\napps  Deployment  pizza  Synced  deployment.apps/pizza ${a.live.replicas===2?'configured':'scaled'}`:a.tag?'Sync Status: Synced. The cluster already matches git.':'Sync Status: Unknown. deploy/ has no image tag yet: ship a commit first.',moved?'ok':'note');
      }
      if(/^argocd app get\b/.test(cmd)){const sync=!s.tag?'Unknown':s.live&&s.live.tag===s.tag&&!s.drift?'Synced':'OutOfSync';return say(`Name:          pizza\nSync Status:   ${sync}${s.tag?' (git says '+s.tag+')':''}\nHealth Status: ${s.live?'Healthy':'Missing'}${s.drift?'\nDiff:          replicas: 2 in git, '+s.live.replicas+' in the cluster':''}`,sync==='Synced'?'ok':sync==='OutOfSync'?'warn':'')}
      if(/^kubectl (-n pizza )?get (pods?|po)\b/.test(cmd))return s.live?say('NAME                 READY  STATUS   IMAGE\n'+Array.from({length:s.live.replicas},(_,i)=>`pizza-${s.live.tag.slice(0,5)}-${'abcdefgh'[i]}k2`.padEnd(21)+'1/1    Running  ghcr.io/you/pizza:'+s.live.tag).join('\n')):say('No resources found in pizza namespace.');
      const scale=cmd.match(/^kubectl (?:-n pizza )?scale (?:deploy|deployment)\/pizza --replicas=(\d+)/);
      if(scale){
        if(!s.live)return fail('Error from server (NotFound): deployments.apps "pizza" not found');
        if(scale[1]!=='5')return fail('This practice cluster models one hand-made change: --replicas=5.');
        press(ctx,'edit');hit(ctx,'pods',false);hit(ctx,'argo',false,.4);return say('deployment.apps/pizza scaled');
      }
      return unknown(cmd,fail);
    }
  };
  const DOCKERFILE={good:'FROM python:3.13-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt   # cached until requirements.txt changes\nCOPY . .',bad:'FROM python:3.13-slim\nWORKDIR /app\nCOPY . .                              # any source edit lands here…\nRUN pip install -r requirements.txt   # …so this reruns every time'};
  /* ---- saved state: one key per experiment, plus which experiment and tab were open. Storage can refuse; then nothing is saved. ---- */
  const SAVE_V=1;
  const load=key=>{try{const d=JSON.parse(localStorage.getItem(key)||'null');return d&&d.v===SAVE_V?d:null}catch{return null}};
  const store=(key,d)=>{try{localStorage.setItem(key,JSON.stringify({v:SAVE_V,...d}))}catch{/* full or blocked: keep working unsaved */}};
  const expKey=ctx=>host.storageKey+'.'+ctx.route.id;
  function saveWhere(){store(host.storageKey,{route:current,view})}
  function forget(ctx){clearTimeout(ctx.saveT);ctx.skipSave=true;try{localStorage.removeItem(expKey(ctx))}catch{/* ignore */}}
  function persist(ctx){clearTimeout(ctx.saveT);if(ctx.skipSave){ctx.skipSave=false;return}if(!ctx.touched)return; // only experiments someone actually used are saved
    ctx.saveT=setTimeout(()=>{if(ctx.busy)return persist(ctx);
    const log=[...ctx.page.querySelectorAll('.lab-log > div')].slice(-200).map(d=>[d.textContent,d.className]);
    store(expKey(ctx),{at:Date.now(),sim:ctx.sim.save(),index:ctx.index,sub:ctx.sub,review:ctx.review,last:ctx.last,diverged:ctx.diverged,selected:ctx.selected,history:ctx.history.slice(-100),log,goals:[...ctx.goalsDone],staged:ctx.staged,reverted:ctx.reverted,lastMsg:ctx.lastMsg,lastCmd:ctx.lastCmd})},400)}
  function restore(ctx){
    const d=load(expKey(ctx));if(!d)return false;
    try{ctx.sim.load(d.sim)}catch{forget(ctx);return false}
    Object.assign(ctx,{touched:true,index:d.index,sub:d.sub,review:d.review,last:d.last,diverged:d.diverged,selected:d.selected,history:d.history||[],hpos:(d.history||[]).length,goalsDone:new Set(d.goals||[]),staged:d.staged,reverted:d.reverted,lastMsg:d.lastMsg,lastCmd:d.lastCmd||''});
    for(const [text,tone] of d.log||[])print(ctx,text,tone);
    print(ctx,`— restored your session from ${new Date(d.at).toLocaleString([],{dateStyle:'medium',timeStyle:'short'})} · ↺ Start over clears it —`,'note');
    return true;
  }
  const find=q=>el.querySelector(q),pages=new Map();let current=routes[0].id,view='walkthrough';
  el.innerHTML=`<div class="explorer"><aside class="ex-sidebar"><div class="ex-side-head"><div class="ex-side-title"><div class="ex-label">${NAME} lab</div><button type="button" class="ex-tour-btn">▶ Take the tour</button></div><div class="ex-picker"><button type="button" data-step-route="-1" aria-label="Previous experiment">‹</button><select class="ex-route-select" aria-label="Experiment">${routes.map((r,i)=>`<option value="${r.id}">${i+1}. ${titles[r.id]}</option>`).join('')}</select><button type="button" data-step-route="1" aria-label="Next experiment">›</button></div><nav class="ex-tabs" aria-label="Explorer mode"><button type="button" data-view="walkthrough" aria-pressed="true">Guided steps</button><button type="button" data-view="playground" aria-pressed="false">Free play</button><button type="button" data-view="files" aria-pressed="false">Real files</button></nav></div><div class="ex-panels"></div></aside><div class="ex-main"><header class="ex-top"><div><div class="ex-label ex-course-label"></div><h1 class="ex-title" tabindex="-1"></h1><p class="ex-intro"></p></div></header><div class="ex-pages"></div></div></div>`;
  function mount(route){
    const page=document.createElement('section');page.className='ex-page';page.dataset.page=route.id;
    const panel=document.createElement('div');panel.className='ex-panel';panel.dataset.page=route.id;
    panel.innerHTML=`<section class="ex-guide" aria-label="Your next step"><div class="ex-guide-head"><span class="ex-count"></span><button type="button" class="ex-ghost" data-ex="restart">↺ Start over</button></div><progress class="ex-progress" max="1" value="0" aria-label="Experiment progress"></progress><h2 class="ex-task-title"></h2><p class="ex-instruction"></p><p class="ex-look"></p><div class="ex-actions"><button type="button" class="ex-primary" data-ex="next"></button><button type="button" class="ex-primary" data-ex="continue" hidden></button><button type="button" class="ex-primary ex-graduate" data-ex="lesson" hidden>Next: try the real exercise</button></div><div class="ex-event" role="status" aria-atomic="true"><b>What happened</b><span></span><pre class="ex-command" tabindex="0" aria-label="The real command"></pre></div><div class="ex-label">Steps in this experiment</div><ol class="ex-path"></ol></section><section class="ex-play" hidden><div class="ex-guide-head"><h2>Free play</h2><button type="button" class="ex-ghost" data-ex="restart">↺ Start over</button></div><p class="ex-play-intro">Click any box in the picture to see what you can do with it, or type in the terminal under it. Nothing runs on your computer.</p><div class="lab-goals" role="region" aria-label="Challenges"><div class="ex-label">Challenges <span class="lab-goal-count"></span></div><ul></ul><p>They tick themselves off as you discover each idea.</p></div><div class="ex-label">Commands to try</div><div class="lab-chips" aria-label="Commands to try">${[...new Set(cmdsFor(route).map(c=>c[1]))].map(c=>`<button type="button" data-cmd="${attr(c)}">${esc(c)}</button>`).join('')}</div></section><section class="ex-files" hidden></section><div class="ex-engine" hidden></div>`;
    page.innerHTML=`<section class="ex-stage" aria-label="Live picture"><div class="ex-stage-head"><div><h2>Watch here</h2><p></p></div><ul class="ex-legend" aria-label="Colour key"><li class="good">working</li><li class="wait">in progress</li><li class="bad">problem</li><li class="absent">not there yet</li></ul></div><div class="ex-map-layout"><div class="ex-diagram"></div><div class="ex-inspector" aria-live="polite"></div></div></section><div class="lab-term" role="region" aria-label="${NAME} terminal"><div class="lab-term-bar"><span aria-hidden="true"></span>${NAME} terminal · practice only</div><div class="lab-log" role="log" aria-live="polite" tabindex="0" aria-label="Terminal output"></div><form class="lab-prompt"><span aria-hidden="true">$</span><input name="lab-cmd" aria-label="${NAME} command" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type a command, or help"><button type="submit">Run</button></form></div>`;
    find('.ex-pages').append(page);find('.ex-panels').append(panel);
    const ctx={route,page,panel,engine:panel.querySelector('.ex-engine'),index:0,sub:0,review:false,last:null,beforeNodes:null,diverged:false,driving:false,selected:helm?'chart':tf?'code':ci?'commit':route.id==='compose'?'project':'image',nodes:{},sim:null,history:[],hpos:0,timer:0,bg:0,busy:false,rest:null,glow:false,fx:freshFx(),lastMsg:'',staged:false,reverted:false,goalsDone:new Set()};
    pages.set(route.id,ctx);
    ctx.engine.addEventListener('simulationchange',()=>{if(!ctx.sim)return;if(!ctx.driving&&view==='playground')ctx.diverged=true;render(ctx)});
    ctx.sim=helm?HelmSim(ctx.engine,'sandbox',()=>{},{v2:helm2}):ci?PipelineSim(ctx.engine,'sandbox'):tf?TerraformSim(ctx.engine,'sandbox'):DockerSim(ctx.engine,route.id);
    ctx.lastMsg=ctx.sim.snapshot().message;
    if(!restore(ctx))print(ctx,`${NAME} practice terminal. Type help, or click a command below. Try: ${GUIDE[kind].first}`,'note');
    page.querySelector('.lab-prompt').addEventListener('submit',e=>{e.preventDefault();const input=e.target.elements['lab-cmd'];runCommand(ctx,input.value);input.value=''});
    page.querySelector('.lab-prompt input').addEventListener('keydown',e=>{
      if(e.key!=='ArrowUp'&&e.key!=='ArrowDown')return;e.preventDefault();
      ctx.hpos=Math.max(0,Math.min(ctx.history.length,ctx.hpos+(e.key==='ArrowUp'?-1:1)));e.target.value=ctx.history[ctx.hpos]||'';
    });
    const onClick=e=>{
      const inspect=e.target.closest('[data-inspect]');if(inspect){ctx.selected=inspect.dataset.inspect;ctx.fx=freshFx();render(ctx);return}
      const run=e.target.closest('[data-cmd]');if(run){
        const c=run.dataset.cmd,fromBox=!!run.closest('.ex-inspector');runCommand(ctx,c);
        // The inspector re-renders; keep keyboard focus on the same command.
        if(fromBox)(ctx.page.querySelector(`.ex-inspector [data-cmd="${CSS.escape(c)}"]`)||ctx.page.querySelector('.lab-prompt input')).focus({preventScroll:true});
        return}
      const command=e.target.closest('[data-ex]')?.dataset.ex;if(!command)return;
      if(command==='lesson'){host.onLesson();return}
      if(command==='continue'){selectRoute(routes[routes.indexOf(route)+1].id,true);return}
      ctx.driving=true;
      try{
        if(command==='restart'||ctx.diverged){stopTimers(ctx);forget(ctx);ctx.index=ctx.sub=0;ctx.review=false;ctx.last=null;ctx.diverged=false;ctx.glow=false;ctx.fx=freshFx();ctx.staged=ctx.reverted=false;ctx.lastCmd='';ctx.goalsDone.clear();ctx.engine.querySelector(`[data-${P}=reset]`).click();ctx.lastMsg=ctx.sim.snapshot().message;print(ctx,'— started over —','note')}
        else if(command==='next'&&ctx.review){ctx.review=false}
        else if(command==='next'&&ctx.index<route.chapters.length){
          ctx.touched=true;
          const a=route.chapters[ctx.index].actions[ctx.sub];
          ctx.beforeNodes=Object.fromEntries(Object.entries(ctx.nodes).map(([k,n])=>[k,String(n.state)]));ctx.last={action:a,index:ctx.index,sub:ctx.sub};
          for(const [name,value] of Object.entries(a.settings)){const input=ctx.engine.querySelector(`[name=${name}]`);input.value=value;input.dispatchEvent(new Event('change',{bubbles:true}))}
          const control=ctx.engine.querySelector(`[data-${P}=${a.key}]`);
          if(control.disabled){ctx.diverged=true;return}
          ctx.selected=ci?({commit:'commit',ci:'ci',revert:'config'})[a.key]||'pods':tf?({init:'provider',plan:'plan',destroy:'plan'})[a.key]||'server':helm?(a.key==='preview'?'yaml':a.key==='step'?(ctx.sim.snapshot().phase===1?'deployment':'pods'):'release'):route.id==='compose'?(a.key==='up'?'web':a.key==='down'?'project':a.key==='request'&&ctx.sim.snapshot().api==='healthy'?'volume':'api'):route.id==='network'?'api':route.id==='build'?(a.key==='build'?'image':'source'):a.key==='write'?(ctx.sim.snapshot().container==='volume'?'volume':'layer'):'container';
          control.click();ctx.review=true;ctx.sub++;
          const done=ctx.sim.snapshot().command;if(done&&done!==ctx.lastCmd){ctx.lastCmd=done;print(ctx,done.startsWith('#')?done:'$ '+done,done.startsWith('#')?'note':'cmd')}note(ctx);
          if(ctx.sub===route.chapters[ctx.index].actions.length){ctx.index++;ctx.sub=0}
        }
      }finally{ctx.driving=false;render(ctx)}
      // Keep keyboard users on an available control after the last action.
      if(panel.contains(document.activeElement)&&(document.activeElement.hidden||document.activeElement.closest('[hidden]')))panel.querySelector('.ex-guide .ex-primary:not([hidden])')?.focus();
    };
    page.addEventListener('click',onClick);panel.addEventListener('click',onClick);
    return ctx;
  }
  function diagram(ctx,s){
    ctx.nodes={};
    const icons={tiller:'🛞',commit:'💬',ci:'🤖',registry:'📦',config:'🗂️',argo:'🐙',code:'✍️',plan:'🧾',provider:'🔌',state:'🗂️',bucket:'🪣',server:'🖥️',dns:'🧭',image:'📦',container:'🍕',layer:'📝',volume:'💾',source:'📄',browser:'🌐',port:'🚪',web:'🖥️',api:'⚙️',project:'🧩',chart:'🗺️',yaml:'📜',release:'🏷️',deployment:'📋',pods:'🫛',service:'📞'};
    const node=(id,title,state,detail,tone='',extra='')=>{const icon=icons[id]||'🧱',changed=(ctx.review&&!ctx.diverged||view==='playground'&&ctx.glow)&&ctx.beforeNodes&&ctx.beforeNodes[id]!==String(state),h=ctx.fx.hits[id],hit=(h?(h.ok?' fx-hit-ok':' fx-hit-bad'):'')+(ctx.fx.work===id?' fx-work':'');ctx.nodes[id]={title,state,detail,icon};return `<button type="button" class="ex-node ${tone}${hit}${ctx.selected===id?' selected':''}${changed?' changed':''}"${h?` style="--hd:${h.d}s"`:''} data-inspect="${id}" aria-pressed="${ctx.selected===id}">${changed?'<em class="ex-badge">Just changed</em>':''}<strong><span class="ex-icon" aria-hidden="true">${icon}</span> ${title}</strong><span class="ex-state">${esc(String(state))}</span>${id==='pods'?'<span class="ex-pod-row" aria-hidden="true">'+Array.from({length:s.ready},(_,i)=>'<span class="ex-pod">Pod '+(i+1)+'</span>').join('')+(s.desired?.tag==='does-not-exist'&&s.phase>=3?'<span class="ex-pod failed">Image missing</span>':'')+'</span>':''}${id==='ci'&&s.run?'<span class="ex-pod-row">'+Object.entries(s.run.jobs).map(([j,v])=>'<span class="ex-pod'+(v==='passed'?'':v==='failed'?' failed':' idle')+'">'+j+'</span>').join('')+'</span>':''}${id==='plan'&&s.planLines?.length?'<span class="ex-plan">'+s.planLines.map(l=>'<code>'+esc(l)+'</code>').join('')+'</span>':''}${extra}</button>`};
    const link=t=>`<span class="ex-link"><span>${t}</span><b aria-hidden="true">→</b></span>`;
    const row=(...parts)=>`<div class="ex-row">${parts.join('')}</div>`;
    // A row a request travels along in Docker free play; the packet stops at the failing box.
    const frow=(name,...parts)=>{const f=ctx.fx.rows[name];return f?`<div class="ex-row fx-flow ${f.ok?'ok':'bad'}">${parts.join('')}<span class="fx-packet" style="animation-delay:${f.d}s" aria-hidden="true"></span></div>`:row(...parts)};
    const items=(icon,n)=>n?`<span class="fx-items" aria-hidden="true">${icon.repeat(Math.min(n,12))}${n>12?' +'+(n-12):''}</span>`:'';
    const boundary=(title,body)=>`<div class="ex-boundary"><p>${title}</p>${body}</div>`;
    const image=()=>node('image','Image · pizza:v1','Reusable recipe','An image packages application files and defaults. Running it creates a container; stopping or removing that container does not remove the image.','good');
    const volume=()=>node('volume','Volume · pizza-data',`${s.volume} saved ${ctx.route.id==='compose'?'visits':'orders'}`,'A named volume lives separately from container writable layers. Containers can attach to it at /data. Removing the containers alone does not erase it.','good',items(ctx.route.id==='compose'?'👣':'🧾',s.volume));
    if(helm){
      const applied=s.desired,waiting=s.pending&&s.phase<4,failed=applied?.tag==='does-not-exist'&&s.phase>=3;
      return frow('render',node('chart','Chart + values',`${s.settings.replicas} requested · nginx:${s.settings.tag}`,'The chart is a reusable recipe. Values fill its placeholders. These are settings for your next preview or operation; they do not change the running app by themselves.'),link('renders'),node('yaml','Kubernetes YAML',s.preview?'Preview available':'Not rendered yet','Helm turns templates and values into ordinary Kubernetes objects. Preview alone creates no release and no Pods.',s.preview?'good':'absent'))+
        boundary(helm2?'HELM 2 · Tiller keeps the release':'HELM · tracks the release',row(...(helm2?[node('tiller','Tiller · tiller-deploy',s.tiller?'Running in kube-system':'Not installed','Tiller is Helm 2’s server. helm2 init installs it into kube-system. The helm client sends every install, upgrade, and rollback to Tiller, which applies the YAML and keeps each revision as a ConfigMap. Helm 3 removed Tiller.',s.tiller?'good fx-on':'absent'),link('records')]:[]),node('release','Release · pizza',s.history.length?`Revision ${s.history.at(-1).rev} · ${s.history.at(-1).status}`:'Not installed','A release is one named installation of a chart. Helm records revisions for install, upgrade, and rollback. The release history is available in Playground.',s.history.at(-1)?.status==='failed'?'bad':waiting?'wait':s.history.length?'good':'absent')))+
        boundary('KUBERNETES · runs the application',frow('k8s',node('deployment','Deployment',applied?`Wants ${applied.replicas} · nginx:${applied.tag}`:'Not installed','The Deployment describes the desired number of Pods and image. Kubernetes controllers reconcile that desired state after Helm sends the YAML.',applied?'':'absent'),link('creates'),node('pods','Pods',`${s.ready} ready${s.runningTag?' · nginx:'+s.runningTag:''}${failed?' · new image cannot be pulled':waiting?' · update in progress':''}`,'Pods run the containers. Helm waits for readiness; it does not start containers itself. This chart allows old ready Pods to remain during a failed update when capacity is available.',failed?'bad':waiting?'wait fx-boot':s.ready?'good fx-on':'absent'))+row(node('service','Service · pizza',applied?`${s.ready} ready destinations`:'Not installed','A Service gives this app a stable address inside the cluster and routes to ready matching Pods. It does not publish this example to the internet.',applied?'good':'absent')));
    }
    if(ci){
      const t=s.tag,live=s.live,run=s.run,failed=run&&Object.values(run.jobs).includes('failed'),argo=!t?'Waiting for deploy/':live&&live.tag===t&&!s.drift?'Synced':'OutOfSync';
      return frow('ci',node('commit','Your commit',s.commit?`${s.commit.sha} · tests ${s.commit.tests==='pass'?'pass':'broken'}`:'Nothing pushed yet','A push to main starts the pipeline. On a pull request, the pipeline only runs the tests.',s.commit?'good':'absent'),link('starts'),node('ci','CI pipeline · GitHub Actions',!run?'No run yet':!run.done?'Queued':failed?'Failed: later jobs skipped':'Passed','Jobs run in order: test, build, scan, push, promote. If one fails, every job after it is skipped, so nothing new can reach the cluster.',!run?'absent':!run.done?'wait':failed?'bad':'good'))+
        boundary('ARTIFACTS · what CI produces',frow('artifact',node('registry','Registry · ghcr.io',s.registry.length?`${s.registry.length} image${s.registry.length===1?'':'s'} · newest ${s.registry.at(-1)}`:'No images yet','The registry keeps every image, tagged with the commit SHA that built it. Old images stay, which is what makes fast rollbacks possible.',s.registry.length?'good':'absent'),link('tag written to'),node('config','Git · deploy/',t?`newTag: ${t}`:'newTag not set','The folder Argo CD watches. CI changes one line here, and a rollback is a git revert of that line.',t?'good':'absent')))+
        boundary('CLUSTER · kept matching git by Argo CD',frow('cluster',node('argo','Argo CD',argo,'Argo CD runs inside the cluster. It compares git with the cluster and applies the difference. With selfHeal it also undoes changes made by hand.',argo==='Synced'?'good fx-on':t?'wait':'absent'),link('applies'),node('pods','Pizza pods',live?`${live.replicas} running · ${live.tag}`:'Nothing deployed','The running app. It only changes when Argo CD applies what git says.',s.drift?'bad':live?'good fx-on':'absent')));
    }
    if(tf){
      const v=s.settings,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
      const fmt=(k,o)=>k==='server.web'?`${o.size} · ${o.region} · ${o.ip}`:k==='dns.pizza'?`→ ${o.target}`:'Created';
      const cloud=(id,k,title,detail)=>{const o=s.real[k],drift=o&&s.state[k]&&!same(o,s.state[k]),op=s.plan?.find(x=>x.a===k)?.op;return node(id,title,!o?(op?'Not created · plan: '+op:'Not created'):drift?`${fmt(k,o)} · state says ${s.state[k].size}`:fmt(k,o)+(op?' · plan: '+op:''),detail,drift?'bad':op?'wait':o?'good':'absent')};
      return frow('plan',node('code','Your code · main.tf',`${v.size} server · ${v.region} · ${v.dns==='yes'?'with DNS':'no DNS'}`,'The .tf files describe what you want to exist. Editing them changes nothing until you plan and apply.'),link('plan compares'),node('plan','Plan',/^Error/.test(s.message)?'Error: run init first':s.planSummary||'No plan yet','A plan is a preview. It compares your code with the state file and the real cloud, then lists what it would add (+), change (~), replace (-/+), or destroy (-).',/^Error/.test(s.message)?'bad':s.plan?.length?'wait':s.plan?'good':'absent'))+
        boundary('TERRAFORM · on your computer',frow('tf',node('provider','Provider plugin',s.init?'Installed by init':'Not installed','terraform init downloads providers: plugins that know how to talk to one platform. Without them Terraform cannot plan.',s.init?'good':'absent'),link('records in'),node('state','State file · terraform.tfstate',`${Object.keys(s.state).length} resources recorded`,'State maps each resource in your code to the real object it created. Never edit it by hand, and keep it private: it can contain secrets.',Object.keys(s.state).length?'good':'absent')))+
        boundary('PRETEND CLOUD · real resources',row(cloud('bucket','bucket.menu','Bucket · pizza-menu','Stores menu files. It depends on nothing else, so Terraform can create it first.'),cloud('server','server.web','Server · web','Runs the app. Its size can change in place; a new region needs a new server, so Terraform replaces it.'),cloud('dns','dns.pizza','DNS · pizza.example.com','Points the name at the server address. It depends on the server, so it is created after it and updated when the address changes.')));
    }
    if(ctx.route.id==='life')return row(image(),link('run creates'),node('container','Container · pizza-demo',s.container?`${s.container} · copy ${s.serial}`:'Not created','A container is one instance of the image with its own process and writable layer. Start restarts a stopped instance; run creates a new instance.',s.container==='running'?'good fx-on':s.container?'wait':'absent'))+boundary('INSIDE THIS CONTAINER',row(node('layer','Writable layer',`${s.layer} saved files`,s.container?'This is where /tmp/note lives. Stopping preserves it. Removing this container removes this layer.':'No container means no writable layer. The original image is still available.',s.layer?'good':'absent',items('📄',s.layer))));
    if(ctx.route.id==='build')return row(node('source','Build inputs',`Source v${s.source} · dependencies v${s.deps}`,'Docker builds from the files in its build context. A change to inputs can invalidate a cached step. .dockerignore excludes files from that context.'))+boundary('BUILD · most recent build results',row(...(s.trace.length?s.trace.map(t=>t.split(': ')[0]):['Base image','Dependency installation','Application copy']).map((t,i)=>node('layer'+i,t,s.trace[i]?.split(': ')[1]||'Not built',t==='Base image'?'The base image provides the starting filesystem.':t==='Dependency installation'?'Installing dependencies after copying only dependency inputs lets source-only edits reuse this result.':t==='Copy all files'?'Copying every source file before installing dependencies means a source edit also invalidates the later dependency step.':'This step copies app source. Changing source should not force a dependency install when dependencies were copied first.',(s.trace[i]?.includes('CACHED')?'good':s.trace[i]?'wait':'absent')+(ctx.fx.build?' fx-build fx-i'+i:'')))))+row(node('image','Built image · pizza:dev',s.built?'Available locally':'Not built','A build produces an image. Run it separately to start a container. This practice compares with the previous build; real Docker can also reuse older cached layers.',s.built?'good':'absent'));
    if(ctx.route.id==='network')return boundary('HOST · your computer',frow('host',node('browser','Host browser','Uses localhost:8080','Here localhost means your computer. A published port forwards host traffic into a container.'),link('host port'),node('port','Port forwarding',s.settings.publish==='8080'?'8080 → API 8000':'No published port','Publishing 127.0.0.1:8080:8000 maps a loopback port on your computer to port 8000 inside API. EXPOSE alone does not publish it.',s.settings.publish==='8080'?'good':'absent')))+boundary(s.settings.network==='yes'?'DOCKER NETWORK · shared DNS':'DOCKER NETWORKS · separate',frow('net',node('web','web container','Request starts here in peer mode','Inside web, localhost is web itself. To reach API on the same Docker network use api:8000.'),link(s.settings.network==='yes'?'api:8000':'no route'),node('api','api container',s.settings.listen==='all'?'Listening on 0.0.0.0:8000':'Only its own loopback:8000','Binding the app to 0.0.0.0 inside API lets its container network interface receive traffic. Binding only 127.0.0.1 inside API keeps it local to API.',s.settings.listen==='all'?'good':'bad')));
    if(ctx.route.id==='storage')return row(image(),link('creates'),node('container','App container',s.container?`Running · ${s.container==='volume'?'volume at /data':'no volume'}`:'Removed / not created','The mount is chosen when the container is created. In Playground, remove the container before choosing a different storage type.',s.container?'good fx-on':'absent'))+boundary('WHERE THE ORDER LIVES',row(node('layer','Writable layer',`${s.layer} saved orders`,'With no volume at /data, saving an order writes into the container layer. Removing that container deletes this data.',s.layer?'wait':'absent',items('🧾',s.layer)),link(s.container==='volume'?'/data mounts':'separate storage'),volume()));
    return row(node('project','Compose project',s.api==='absent'?'Containers not running':'Running on one host','Compose reads services, networks, and volumes from compose.yaml. It manages this group on a Docker host. It is not a Kubernetes cluster.'),link('defines'),node('browser','Host browser','localhost:8080','The browser reaches the published web port. web calls API using api:8000 inside the project network.'))+
      boundary(s.api==='absent'?'PROJECT NETWORK · not created':'PROJECT NETWORK · service-name DNS',frow('net',node('web','web',s.web,'web forwards requests to API. With service_healthy it waits for API readiness at startup. A later API outage does not automatically restart web.',s.web==='running'?'good fx-on':s.web==='absent'?'absent':'wait'),link('api:8000'),node('api','api',s.api,'API stores a visit count in a database on the volume. A running process may still be starting or unhealthy. A health check tells Compose when it is ready.',s.api==='healthy'?'good fx-on':s.api==='unhealthy'?'bad':s.api==='absent'?'absent':'wait fx-boot')))+row(volume());
  }
  // Challenges read the simulator's own progress flags; a newly finished one is announced in the terminal.
  function goalsView(ctx,s=ctx.sim.snapshot(),free=view==='playground'){
    const q=sel=>ctx.page.querySelector(sel)||ctx.panel.querySelector(sel),goals=goalsFor(ctx.route),f=s.flags||{};let n=0;
    q('.lab-goals ul').innerHTML=goals.map(([k,label])=>{const ok=!!f[k]&&(!ctx.busy&&!ctx.running||ctx.goalsDone.has(k)),fresh=ok&&!ctx.goalsDone.has(k);if(ok){n++;ctx.goalsDone.add(k);if(fresh&&free)print(ctx,'🏆 Challenge done: '+label,'ok')}return `<li class="${ok?'done':''}${fresh?' fresh':''}"><span aria-hidden="true">${ok?'✓':''}</span>${label}${ok?'<span class="sr-only"> (done)</span>':''}</li>`}).join('');
      q('.lab-goal-count').textContent=n+' of '+goals.length;
  }
  function render(ctx){
    persist(ctx);
    const s=ctx.sim.snapshot(),q=sel=>ctx.page.querySelector(sel)||ctx.panel.querySelector(sel),route=ctx.route,c=route.chapters[ctx.index],finished=!c;
    const focusId=document.activeElement?.closest('[data-inspect]')?.dataset.inspect;
    q('.ex-diagram').innerHTML=diagram(ctx,s);
    if(!ctx.nodes[ctx.selected]){ctx.selected=Object.keys(ctx.nodes)[0];q('.ex-diagram').innerHTML=diagram(ctx,s)}
    const n=ctx.nodes[ctx.selected],free=view==='playground',acts=free?cmdsFor(route).filter(c=>c[0].split(' ').includes(ctx.selected)):[];
    q('.ex-inspector').innerHTML=`<div class="ex-label">About this box</div><h3><span aria-hidden="true">${n.icon}</span> ${n.title}</h3><strong>${esc(String(n.state))}</strong><p>${n.detail}</p>${acts.length?`<div class="ex-label">Try it on this box</div><div class="lab-acts">${acts.map(c=>`<button type="button" data-cmd="${attr(c[1])}"><code>${esc(c[1])}</code></button>`).join('')}</div>`:''}`;
    goalsView(ctx,s,free);q('.ex-stage-head p').textContent=free?'Click any box to act on it.':'Click any box to learn what it is.';
    // Keep the box that is changing in view when the picture is taller than its space.
    {const hits=Object.keys(ctx.fx.hits),target=ctx.fx.work||hits[hits.length-1]||(ctx.review&&ctx.selected);if(target)q(`[data-inspect="${target}"]`)?.scrollIntoView({block:'nearest',inline:'nearest'})}
    if(focusId&&ctx.page.contains(document.activeElement)===false)q(`[data-inspect="${focusId}"]`)?.focus();
    q('.ex-event').classList.toggle('failure',ci?/^Pipeline failed/.test(s.message)||s.drift:tf?/^Error/.test(s.message)||s.drift:helm?s.history.at(-1)?.status==='failed':s.api==='unhealthy'||/^(Request failed|503:)/.test(s.message));
    const message=q('.ex-event span');if(message.textContent!==s.message)message.textContent=s.message;
    q('.ex-command').textContent=s.command||'';
    const total=route.chapters.reduce((n,c)=>n+c.actions.length,0),done=route.chapters.slice(0,ctx.index).reduce((n,c)=>n+c.actions.length,0)+ctx.sub;
    const reviewing=ctx.review&&!ctx.diverged,complete=finished&&!reviewing&&!ctx.diverged;
    const a=reviewing?ctx.last.action:c?.actions[ctx.sub],instructions=a?help(ctx,a,s):null;
    q('.ex-count').textContent=ctx.diverged?'Return to the guided route':complete?'Experiment complete':reviewing?`Step ${done} of ${total} · see what happened`:`Step ${done+1} of ${total} · your turn`;
    q('.ex-progress').max=total;q('.ex-progress').value=done;
    q('.ex-task-title').textContent=ctx.diverged?'Ready for a fresh walkthrough?':complete?'You reached the finish line':reviewing?'You tried: '+a.label:a.label;
    q('.ex-instruction').textContent=ctx.diverged?'Your free-play changes are still in the picture. Restart to follow the guided steps from the beginning.':complete?route.finish:reviewing?'Read “What happened” below and find the glowing boxes in the picture. Nothing else changes until you continue.':instructions[0];
    q('.ex-look').hidden=reviewing||complete||ctx.diverged;q('.ex-look').textContent=instructions?'Look for: '+instructions[1]:'';
    q('.ex-event').hidden=view==='files'||view==='playground'||view==='walkthrough'&&!reviewing&&!ctx.diverged&&!complete;
    const next=q('[data-ex=next]');next.hidden=complete;next.dataset.phase=reviewing?'review':'action';next.textContent=ctx.diverged?'Restart the guided steps':reviewing?(finished?'Finish this experiment →':'I see it — continue →'):a?.label||'Complete';
    const follow=routes[routes.indexOf(route)+1],cont=q('[data-ex=continue]');cont.hidden=!complete||!follow;if(follow)cont.textContent='Next experiment: '+follow.title;
    q('.ex-graduate').hidden=!complete||!!follow;
    q('.ex-path').innerHTML=route.chapters.map((c,i)=>`<li ${i===(reviewing?ctx.last.index:ctx.index)?'aria-current="step"':''} class="${i<ctx.index?'done':''}">${i<ctx.index?'<span class="sr-only">Done: </span>':''}${c.title}</li>`).join('');
    const files=q('.ex-files');if(!files.children.length){
      const entries=helm?HELM_FILES:tf?TF_FILES:ci?CI_FILES:DOCKER_FILES,practice=host.practiceTitle;
      files.innerHTML=`<h3>${helm?'The recipe behind this release':tf?'The real configuration':ci?'The real pipeline':'The real two-service example'}</h3><p>${ci?'These are the real workflow, deployment, and Argo CD files from Guided learning. The pretend pipeline here runs instantly; the real one runs on GitHub.':tf?'These four files are the runnable project from Guided learning. The pretend cloud here is simpler; the files manage a real file on your computer.':helm?'Preview or install to see the rendered resources below. Editing settings alone does not change that output.':'These are the runnable files from Guided learning. The diagrams simplify their behavior; these controls do not edit or execute the files.'}</p>${helm?'<details open><summary>Last rendered Kubernetes YAML</summary><pre class="ex-rendered" tabindex="0"></pre></details>':''}${Object.entries(entries).map(([name,body])=>`<details><summary>${esc(name)}</summary><pre tabindex="0">${esc(body)}</pre></details>`).join('')}<p class="ex-note">To run this yourself, return to Guided learning → ${practice}. Complete setup there first.</p><button type="button" data-ex="lesson">Open the real exercise</button>`;
    }
    if(helm)q('.ex-rendered').textContent=s.preview||'No preview yet. Run helm template in Free play, or Preview the chart in Guided steps.';
    q('.ex-guide').hidden=view!=='walkthrough';q('.ex-play').hidden=view!=='playground';files.hidden=view!=='files';
  }
  function selectRoute(id,focus=false){
    const route=routes.find(r=>r.id===id);if(!route)return;
    current=id;const ctx=pages.get(id)||mount(route);
    pages.forEach(p=>{p.page.hidden=p.panel.hidden=p!==ctx});
    const i=routes.indexOf(route);
    find('.ex-title').textContent=titles[route.id];find('.ex-course-label').textContent=NAME+' · experiment '+(i+1)+' of '+routes.length;find('.ex-intro').textContent='Your goal: '+outcomes[route.id];
    saveWhere();find('.ex-route-select').value=id;find('[data-step-route="-1"]').disabled=i===0;find('[data-step-route="1"]').disabled=i===routes.length-1;
    render(ctx);if(focus)find('.ex-title').focus();
  }
  find('.ex-route-select').onchange=e=>selectRoute(e.target.value,true);
  el.querySelectorAll('[data-step-route]').forEach(b=>b.onclick=()=>{const r=routes[routes.findIndex(r=>r.id===current)+Number(b.dataset.stepRoute)];if(r)selectRoute(r.id,true)});
  // The tour: one spotlighted part of the screen at a time, moved with Next and Back.
  const seenKey=host.storageKey.replace('.sim.','.tour.'),cur=()=>pages.get(current);
  const TOUR=[
    [null,`Welcome to the ${NAME} lab`,`${GUIDE[kind].lede} Nothing runs on your computer.<br><br><b>Here you will</b><ul>${GUIDE[kind].learn.map(x=>`<li>${x}</li>`).join('')}</ul>`],
    [()=>find('.ex-picker'),'Pick an experiment','Each experiment is one idea, told as a short story. Use ‹ and › or the list to move between them. Each one keeps its own progress.'],
    [()=>find('.ex-tabs'),'Three ways to learn','<b>Guided steps</b> walks you through. <b>Free play</b> lets you try anything. <b>Real files</b> shows the runnable files behind the picture.',()=>setView('walkthrough')],
    [()=>cur().panel.querySelector('.ex-guide'),'Guided steps','Read the step, then press the blue button. After each step, read “What happened”, find the glowing boxes, and press it again to continue.'],
    [()=>cur().page.querySelector('.ex-diagram'),'The live picture','It stays on screen the whole time. Boxes glow when they change, dots travel along the arrows, and the colours show working, in progress, problem, and not there yet.'],
    [()=>cur().page.querySelector('.ex-inspector'),'About this box','Click any box in the picture to learn what it is. In Free play you also get the commands you can run on it.'],
    [()=>cur().page.querySelector('.lab-term'),'The terminal','Every step prints its real command here. You can type your own too: ↑ brings back earlier commands, and <code>help</code> lists what this experiment understands.'],
    [()=>cur().panel.querySelector('.ex-play'),'Free play and challenges','Try anything you like. Challenges tick themselves off as you discover each idea, and suggested commands sit right under them.',()=>setView('playground')],
    [null,'You are ready',`Follow the guided steps one at a time, or jump straight in with <code>${esc(GUIDE[kind].first)}</code>.`]
  ];
  const tourEl=document.createElement('div');tourEl.className='ex-tour';tourEl.hidden=true;
  tourEl.innerHTML=`<div class="ex-tour-hole"></div><div class="ex-tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-${P}"><div class="ex-tour-count"></div><h3 id="tour-${P}"></h3><div class="ex-tour-text"></div><div class="ex-tour-nav"><button type="button" class="ex-ghost" data-tour="skip">Skip tour</button><button type="button" class="ex-ghost" data-tour="back">Back</button><button type="button" class="ex-tour-next" data-tour="next">Next</button></div><button type="button" class="ex-tour-try" data-tour="try" hidden>Run it in Free play →</button></div>`;
  el.append(tourEl);
  let tourAt=-1;
  function tourShow(i){
    tourAt=i;const [,title,text,before]=TOUR[i],last=i===TOUR.length-1;before?.();
    tourEl.hidden=false;
    tourEl.querySelector('.ex-tour-count').textContent=`${i+1} of ${TOUR.length}`;
    tourEl.querySelector('h3').textContent=title;tourEl.querySelector('.ex-tour-text').innerHTML=text;
    tourEl.querySelector('[data-tour=back]').hidden=i===0;tourEl.querySelector('[data-tour=try]').hidden=!last;
    tourEl.querySelector('[data-tour=next]').textContent=last?'Start guided steps':'Next';
    tourPlace();tourEl.querySelector('[data-tour=next]').focus();
  }
  function tourPlace(){
    if(tourAt<0)return;
    const target=TOUR[tourAt][0]?.(),hole=tourEl.querySelector('.ex-tour-hole'),card=tourEl.querySelector('.ex-tour-card'),W=innerWidth,H=innerHeight,pad=6;
    if(!target){hole.style.cssText=`left:${W/2}px;top:${H/2}px;width:0;height:0`;card.style.cssText=`left:${Math.max(16,(W-card.offsetWidth)/2)}px;top:${Math.max(16,(H-card.offsetHeight)/2)}px`;return}
    target.scrollIntoView({block:'nearest'});
    const r=target.getBoundingClientRect(),cw=card.offsetWidth,ch=card.offsetHeight;
    hole.style.cssText=`left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px`;
    // Beside the target when there is room, otherwise below or above it; always inside the window.
    let x=r.right+18,y=r.top;
    if(x+cw>W-16)x=r.left-cw-18;
    if(x<16){x=Math.min(Math.max(16,r.left),W-cw-16);y=r.bottom+18;if(y+ch>H-16)y=r.top-ch-18}
    card.style.cssText=`left:${x}px;top:${Math.min(Math.max(16,y),H-ch-16)}px`;
  }
  function tourEnd(){tourEl.hidden=true;tourAt=-1;try{localStorage.setItem(seenKey,'1')}catch{}}
  tourEl.addEventListener('click',e=>{
    const a=e.target.closest('[data-tour]')?.dataset.tour;if(!a)return;
    if(a==='next'&&tourAt<TOUR.length-1)return tourShow(tourAt+1);
    if(a==='back')return tourShow(tourAt-1);
    tourEnd();
    if(a==='try'){selectRoute(GUIDE[kind].route);setView('playground');runCommand(cur(),GUIDE[kind].first);cur().page.querySelector('.lab-prompt input').focus()}
    else if(a==='next')setView('walkthrough');
    else find('.ex-tour-btn').focus();
  });
  tourEl.addEventListener('keydown',e=>{
    if(e.key==='Escape'){tourEnd();find('.ex-tour-btn').focus()}
    else if(e.key==='ArrowRight'&&tourAt<TOUR.length-1)tourShow(tourAt+1);
    else if(e.key==='ArrowLeft'&&tourAt>0)tourShow(tourAt-1);
    else if(e.key==='Tab'){const b=[...tourEl.querySelectorAll('button:not([hidden])')],i=b.indexOf(document.activeElement);e.preventDefault();b[(i+(e.shiftKey?-1:1)+b.length)%b.length].focus()}
  });
  addEventListener('resize',tourPlace);
  find('.ex-tour-btn').onclick=()=>tourShow(0);
  function selectView(e){const b=e.target.closest('[data-view]');if(b)setView(b.dataset.view)}
  function setView(v){view=v;saveWhere();find('.explorer').classList.toggle('ex-files-open',v==='files');el.querySelectorAll('.ex-tabs [data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.view===view)));render(pages.get(current));if(view==='walkthrough')pages.get(current).panel.querySelector('.ex-guide .ex-primary:not([hidden])')?.focus()}
  find('.ex-tabs').onclick=selectView;
  {const w=load(host.storageKey);if(w&&routes.some(r=>r.id===w.route))current=w.route;if(w&&['walkthrough','playground','files'].includes(w.view))view=w.view}
  selectRoute(current);setView(view);
  {let seen=false;try{seen=!!localStorage.getItem(seenKey)}catch{}if(!seen)setTimeout(()=>tourShow(0),300)}
  return {stop(){removeEventListener('resize',tourPlace);pages.forEach(p=>{clearTimeout(p.saveT);stopTimers(p);p.sim.stop()})},pause(){}};
}

