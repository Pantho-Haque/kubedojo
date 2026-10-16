const { PG, sim, run, stop, sh } = require('./harness.js');
(async () => {
  await run(`kind create cluster --name lab`, false);
  await run('kubectl create namespace web', false); await run('kubectl create namespace db', false);
  await run('kubectl create deployment web --image=nginx:1.27 -n web', false);
  await run('kubectl create serviceaccount dev-alice -n web');
  await run('kubectl create role web-developer --verb=get,list,watch,create,update,patch,delete --resource=pods,services,deployments.apps -n web');
  await run('kubectl create rolebinding dev-alice-web --role=web-developer --serviceaccount=web:dev-alice -n web');
  await run('kubectl auth can-i create deployments -n web --as=system:serviceaccount:web:dev-alice');
  await run('kubectl auth can-i create deployments -n db --as=system:serviceaccount:web:dev-alice');
  await run('kubectl auth can-i get secrets -n web --as=system:serviceaccount:web:dev-alice');
  await run('kubectl auth can-i --list -n web --as=system:serviceaccount:web:dev-alice');
  await run('TOKEN=$(kubectl create token dev-alice -n web)', false);
  await run('kubectl config set-credentials dev-alice --token="$TOKEN"');
  await run('kubectl config set-context dev-alice-web --cluster=kind-lab --user=dev-alice --namespace=web');
  await run('kubectl --context dev-alice-web get pods');
  await run('kubectl --context dev-alice-web get pods -n db');
  await run('kubectl config get-contexts');
  await run('openssl genrsa -out alice.key 2048', false);
  await run('openssl req -new -key alice.key -out alice.csr -subj "/CN=alice/O=web-developers"');
  await run(`kubectl apply -f - <<EOF
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: alice
spec:
  request: $(base64 < alice.csr | tr -d '\\n')
  signerName: kubernetes.io/kube-apiserver-client
  expirationSeconds: 86400
  usages:
    - client auth
EOF`);
  await run('kubectl certificate approve alice');
  await run("kubectl get csr alice -o jsonpath='{.status.certificate}' | base64 -d > alice.crt");
  await run('cat alice.crt');
  await run('kubectl config set-credentials alice --client-certificate=alice.crt --client-key=alice.key --embed-certs=true');
  await run('kubectl config set-context alice-web --cluster=kind-lab --user=alice --namespace=web');
  await run('kubectl --context alice-web get pods');
  await run('kubectl create rolebinding web-developers-edit --clusterrole=edit --group=web-developers -n web');
  await run('kubectl --context alice-web get pods');
  await run('kubectl --context alice-web get pods -n db');
  await run('kubectl --context alice-web get secrets');
  await run('kubectl label namespace web pod-security.kubernetes.io/enforce=restricted');
  await run('kubectl create deployment web2 --image=nginx:1.27 -n web');
  await sim.wait(5, { aborted: false });
  await run('kubectl describe rs -n web -l app=web2 | tail -5');
  stop();
})().catch(e => { console.error(e); process.exit(1); });
