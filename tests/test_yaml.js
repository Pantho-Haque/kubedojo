const PG = require('./.engine.cjs');
const assert = require('assert');
const t1 = `
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: local-cluster-1
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 8080
        listenAddress: "127.0.0.1"
  - role: worker
  - role: worker
`;
const o = PG.yaml.parse(t1);
assert.equal(o.name, 'local-cluster-1'); assert.equal(o.nodes.length, 3);
assert.equal(o.nodes[0].extraPortMappings[0].hostPort, 8080); assert.equal(o.nodes[0].extraPortMappings[0].listenAddress, '127.0.0.1');
const t2 = `apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: web-developers-edit, namespace: web }
roleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: edit }
subjects: [{ apiGroup: rbac.authorization.k8s.io, kind: Group, name: web-developers }]
---
apiVersion: v1
kind: Service
metadata:
  name: web-public
  namespace: web
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
---
apiVersion: v1
kind: ConfigMap
metadata: {name: x}
data:
  app.conf: |
    # c
    greeting = hello
  k: "v: 1"   # comment
rules:
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list"]
`;
const d = PG.yaml.parseDocs(t2);
assert.equal(d.length, 3);
assert.equal(d[0].subjects[0].name, 'web-developers'); assert.equal(d[0].metadata.namespace, 'web');
assert.equal(d[1].spec.ports[0].nodePort, 30080); assert.equal(d[1].spec.selector.app, 'web');
assert.equal(d[2].data['app.conf'], '# c\ngreeting = hello\n'); assert.equal(d[2].data.k, 'v: 1'); assert.deepEqual(d[2].rules[0].verbs, ['get', 'list']);
const dump = PG.yaml.dump({ a: 1, b: { c: ['x', { y: 2, z: [1] }], d: 'nginx:1.27', e: '1.27', f: '' }, g: [] });
console.log(dump);
const back = PG.yaml.parse(dump); assert.deepEqual(back, { a: 1, b: { c: ['x', { y: 2, z: [1] }], d: 'nginx:1.27', e: '1.27', f: '' }, g: [] });
const t3 = `image: nginx:1.27\nlabels:\n  app.kubernetes.io/name: myapp\n"helm.sh/hook": pre-install,pre-upgrade\nenv:\n  - name: X\n    value: "1"\n  - name: Y\n    valueFrom:\n      fieldRef:\n        fieldPath: metadata.name\n`;
const o3 = PG.yaml.parse(t3); assert.equal(o3.image, 'nginx:1.27'); assert.equal(o3['helm.sh/hook'], 'pre-install,pre-upgrade'); assert.equal(o3.env[1].valueFrom.fieldRef.fieldPath, 'metadata.name');
console.log('yaml ok');
