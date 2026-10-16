const PG = require('./.engine.cjs');
const assert = require('assert');
function run(src, data, defsSrc) {
  const T = PG.GoTpl; const defs = {}; const named = {};
  const parsed = T.parse((defsSrc || '') + src, 't');
  Object.assign(defs, parsed.defs);
  const ctx = { name: 't', funcs: { include: (n, d) => { const tp = { root: { body: defs[n].body } }; return T.render(tp, d, ctx); } }, include: (n, d) => { const tp = { root: { body: defs[n].body } }; return T.render(tp, d, ctx); } };
  return T.render(parsed, data, ctx);
}
const data = { Values: { replicaCount: 2, image: { repository: 'nginx', tag: '1.27' }, env: { A: '1', B: 'x' }, enabled: true, empty: '', list: ['a', 'b'], res: { limits: { cpu: '200m' } } }, Release: { Name: 'demo', Service: 'Tiller' }, Chart: { Name: 'myapp', Version: '0.1.0' } };
assert.equal(run('{{ .Values.image.repository }}:{{ .Values.image.tag }}', data), 'nginx:1.27');
assert.equal(run('a {{- if .Values.enabled }} yes {{- else }} no {{- end }} b', data), 'a yes b');
assert.equal(run('{{ range $k, $v := .Values.env }}{{ $k }}={{ $v | quote }};{{ end }}', data), 'A="1";B="x";');
assert.equal(run('{{ default "z" .Values.empty }} {{ .Values.empty | default "q" }}', data), 'z q');
assert.equal(run('{{ printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}', data), 'demo-myapp');
assert.equal(run('{{ include "x.name" . }}', data, '{{- define "x.name" -}}{{ .Chart.Name }}-{{ .Release.Name }}{{- end -}}'), 'myapp-demo');
assert.equal(run('{{ toYaml .Values.res | indent 2 }}', data), '  limits:\n    cpu: 200m');
assert.equal(run('{{- $n := "k" -}}{{ range .Values.list }}{{ $n }}{{ . }}{{ end }}', data), 'kakb');
assert.equal(run('{{ with .Values.res }}{{ .limits.cpu }}{{ end }}', data), '200m');
assert.equal(run('{{ if and .Values.enabled (not .Values.empty) }}ok{{ end }}', data), 'ok');
assert.equal(run('{{ if eq .Values.replicaCount 2 }}two{{ else if eq .Values.replicaCount 3 }}three{{ else }}other{{ end }}', data), 'two');
assert.throws(() => run('{{ required "image.tag is required" .Values.empty }}', data), /image.tag is required/);
assert.throws(() => run('{{ lookup "v1" "Secret" "a" "b" }}', data), /lookup/);
assert.throws(() => run('{{ .Values.nope.deeper }}', data), /nil pointer/);
console.log('tpl ok');
