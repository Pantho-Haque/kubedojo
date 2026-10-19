---
id: ci-real
title: Run the whole loop yourself
emoji: "\U0001F4BB"
stage: 3
format: html
---
<p class="lead">Now the real thing: your own public GitHub repository, a real pipeline, and Argo CD in a local kind cluster. It is free for public repositories. Keep Docker running.</p>
<label class="task"><input type="checkbox" data-task="ci-tools"><span>Install the tools and log in to GitHub</span></label><div class="cmd"><pre tabindex="0">brew install kind kubectl gh
gh auth login
docker info --format "Docker {{.ServerVersion}} is running"</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="ci-cluster"><span>Create a local cluster, check you are using it, and install Argo CD</span></label><div class="cmd"><pre tabindex="0">kind create cluster --name gitops
kubectl config current-context   # must print kind-gitops
kubectl create namespace argocd
kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl -n argocd rollout status deploy/argocd-server --timeout=5m</pre><button class="copy">Copy</button></div>
<p><b>Stop</b> if the context is anything other than <code>kind-gitops</code>, such as a work or production cluster. Switch with <code>kubectl config use-context kind-gitops</code> first.</p>
<p>Open <b>Example files</b> at the top of this page and choose <b>Download all files (.zip)</b>. The next step expects <code>gitops-examples.zip</code> in your Downloads folder.</p>
<label class="task"><input type="checkbox" data-task="ci-repo"><span>Create your repository and push it</span></label><div class="cmd"><pre tabindex="0">cd ~/Downloads &amp;&amp; unzip -o gitops-examples.zip &amp;&amp; mv gitops ~/pizza-gitops &amp;&amp; cd ~/pizza-gitops
sed -i.bak "s|OWNER/REPO|$(gh api user -q .login)/pizza-gitops|" argocd/application.yaml &amp;&amp; rm argocd/application.yaml.bak
git init -b main &amp;&amp; git add -A &amp;&amp; git commit -m "Pizza Express"
gh repo create pizza-gitops --public --source=. --push</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="ci-watch"><span>Watch the first pipeline: test, build, promote</span></label><div class="cmd"><pre tabindex="0">gh run watch
git pull
cat deploy/kustomization.yaml</pre><button class="copy">Copy</button></div>
<p>After it turns green, <code>deploy/kustomization.yaml</code> has your image name and a commit SHA. On GitHub, open your profile → <b>Packages</b> → <b>pizza-gitops</b>. If it says <b>Private</b>, use <b>Package settings → Change visibility → Public</b> so the cluster can download it.</p>
<label class="task"><input type="checkbox" data-task="ci-deploy"><span>Hand the folder to Argo CD and check the app</span></label><div class="cmd"><pre tabindex="0">kubectl apply -f argocd/application.yaml
kubectl -n argocd get application pizza
kubectl -n pizza rollout status deploy/pizza --timeout=5m
kubectl -n pizza run curl --rm -i --restart=Never --image=curlimages/curl:8.11.1 -- curl -s pizza/</pre><button class="copy">Copy</button></div>
<p>The answer shows the menu and <code>version</code>: the commit SHA that built the running image.</p>
<label class="task"><input type="checkbox" data-task="ci-change"><span>Ship a change: add a pizza and push</span></label><div class="cmd"><pre tabindex="0">git pull --rebase
sed -i.bak 's/"Funghi"]/"Funghi", "Hawaiian"]/' app/app.py &amp;&amp; rm app/app.py.bak
git commit -am "Add Hawaiian" &amp;&amp; git push
gh run watch
kubectl -n argocd annotate application pizza argocd.argoproj.io/refresh=normal --overwrite
kubectl -n pizza rollout status deploy/pizza --timeout=5m
kubectl -n pizza run curl --rm -i --restart=Never --image=curlimages/curl:8.11.1 -- curl -s pizza/</pre><button class="copy">Copy</button></div>
<p>The annotate command asks Argo CD to check git now instead of within the next 3 minutes.</p>
<label class="task"><input type="checkbox" data-task="ci-break"><span>Push a change that breaks a test; check that nothing ships</span></label><div class="cmd"><pre tabindex="0">git pull --rebase
sed -i.bak 's/"Margherita", //' app/app.py &amp;&amp; rm app/app.py.bak
git commit -am "Remove Margherita" &amp;&amp; git push
gh run watch
git revert --no-edit HEAD &amp;&amp; git push</pre><button class="copy">Copy</button></div>
<p>The test job fails and build, scan, push, and promote are skipped; the cluster keeps running. The revert puts the test back to green.</p>
<label class="task"><input type="checkbox" data-task="ci-drift"><span>Change the cluster by hand and watch Argo CD undo it</span></label><div class="cmd"><pre tabindex="0">kubectl -n pizza scale deploy/pizza --replicas=5
kubectl -n pizza get deploy pizza
sleep 20 &amp;&amp; kubectl -n pizza get deploy pizza</pre><button class="copy">Copy</button></div>
<label class="task"><input type="checkbox" data-task="ci-rollback"><span>Roll back the latest release with git revert</span></label><div class="cmd"><pre tabindex="0">gh run watch   # let the pipeline from the last step finish first
git pull --rebase
git log --oneline -3 -- deploy/
git revert --no-edit $(git log -1 --format=%H -- deploy/kustomization.yaml) &amp;&amp; git push
kubectl -n argocd annotate application pizza argocd.argoproj.io/refresh=normal --overwrite
kubectl -n pizza rollout status deploy/pizza --timeout=5m</pre><button class="copy">Copy</button></div>
<p>The revert only changes <code>deploy/</code>, so no new build runs: Argo CD deploys the previous image.</p>
<label class="task"><input type="checkbox" data-task="ci-clean"><span>Clean up</span></label><div class="cmd"><pre tabindex="0">kind delete cluster --name gitops</pre><button class="copy">Copy</button></div>
<p>Keep the repository as a portfolio project, or delete it on GitHub under <b>Settings → Delete this repository</b>.</p>
