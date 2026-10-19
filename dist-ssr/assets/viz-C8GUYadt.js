import { u as _defineProperty } from "../entry-server.js";
import { Fragment, memo, useEffect, useLayoutEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/engine/engine.js
var PG = {};
PG.clone = (o) => o === void 0 ? void 0 : JSON.parse(JSON.stringify(o));
PG.rnd = (n, chars = "bcdfghjklmnpqrstvwxz2456789") => {
	let s = "";
	for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
	return s;
};
PG.hex = (n) => PG.rnd(n, "0123456789abcdef");
PG.isObj = (x) => x && typeof x === "object" && !Array.isArray(x);
PG.deepMerge = (a, b) => {
	if (Array.isArray(a) && Array.isArray(b)) {
		if (b.length && b.every((x) => PG.isObj(x) && x.name !== void 0) && a.every((x) => PG.isObj(x) && x.name !== void 0)) {
			const out = PG.clone(a);
			for (const item of b) {
				const i = out.findIndex((x) => x.name === item.name);
				if (i >= 0) out[i] = PG.deepMerge(out[i], item);
				else out.push(PG.clone(item));
			}
			return out;
		}
		return PG.clone(b);
	}
	if (PG.isObj(a) && PG.isObj(b)) {
		const out = { ...a };
		for (const k of Object.keys(b)) if (b[k] === null) delete out[k];
		else out[k] = k in a ? PG.deepMerge(a[k], b[k]) : PG.clone(b[k]);
		return out;
	}
	return PG.clone(b);
};
PG.fmtAge = (s) => {
	s = Math.max(0, Math.floor(s));
	if (s < 120) return s + "s";
	if (s < 600) return Math.floor(s / 60) + "m" + s % 60 + "s";
	if (s < 10800) return Math.floor(s / 60) + "m";
	if (s < 172800) return Math.floor(s / 3600) + "h";
	return Math.floor(s / 86400) + "d";
};
PG.pad = (s, n) => String(s) + " ".repeat(Math.max(0, n - String(s).length));
PG.table = (rows, header) => {
	const all = [header, ...rows];
	const w = header.map((_, i) => Math.max(...all.map((r) => String(r[i] ?? "").length)));
	return all.map((r) => r.map((c, i) => i === r.length - 1 ? String(c ?? "") : PG.pad(c ?? "", w[i] + 3)).join("")).join("\n");
};
PG.b64 = (s) => {
	try {
		return btoa(unescape(encodeURIComponent(s)));
	} catch (e) {
		return Buffer.from(s, "utf8").toString("base64");
	}
};
PG.unb64 = (s) => {
	try {
		return decodeURIComponent(escape(atob(s)));
	} catch (e) {
		try {
			return Buffer.from(s, "base64").toString("utf8");
		} catch (e2) {
			return "";
		}
	}
};
PG.hash = (str, len = 64) => {
	let h1 = 3735928559, h2 = 1103547991, out = "";
	for (let r = 0; out.length < len; r++) {
		for (let i = 0; i < str.length; i++) {
			const ch = str.charCodeAt(i);
			h1 = Math.imul(h1 ^ ch, 2654435761);
			h2 = Math.imul(h2 ^ ch, 1597334677);
		}
		h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
		h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
		out += (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
		str += r;
	}
	return out.slice(0, len);
};
PG.yaml = (() => {
	function parseScalar(s) {
		s = s.trim();
		if (s === "" || s === "~" || s === "null") return null;
		if (s === "true") return true;
		if (s === "false") return false;
		if (/^-?\d+$/.test(s)) return Number(s);
		if (/^-?\d+\.\d+$/.test(s)) return Number(s);
		if (s[0] === "\"" && s[s.length - 1] === "\"" && s.length >= 2) try {
			return JSON.parse(s);
		} catch (e) {
			return s.slice(1, -1);
		}
		if (s[0] === "'" && s[s.length - 1] === "'" && s.length >= 2) return s.slice(1, -1).replace(/''/g, "'");
		return s;
	}
	function parseFlow(str) {
		let i = 0;
		const ws = () => {
			while (i < str.length && /\s/.test(str[i])) i++;
		};
		function val(stop) {
			ws();
			if (str[i] === "{") {
				i++;
				const o = {};
				ws();
				while (str[i] !== "}" && i < str.length) {
					ws();
					const k = key();
					ws();
					if (str[i] === ":") {
						i++;
						o[k] = val(",}");
					} else o[k] = null;
					ws();
					if (str[i] === ",") i++;
					ws();
				}
				i++;
				return o;
			}
			if (str[i] === "[") {
				i++;
				const a = [];
				ws();
				while (str[i] !== "]" && i < str.length) {
					a.push(val(",]"));
					ws();
					if (str[i] === ",") i++;
					ws();
				}
				i++;
				return a;
			}
			if (str[i] === "\"" || str[i] === "'") {
				const q = str[i];
				let j = i + 1;
				while (j < str.length && !(str[j] === q && str[j - 1] !== "\\")) j++;
				const raw = str.slice(i, j + 1);
				i = j + 1;
				return parseScalar(raw);
			}
			let j = i;
			while (j < str.length && !stop.includes(str[j])) j++;
			const raw = str.slice(i, j);
			i = j;
			return parseScalar(raw);
		}
		function key() {
			ws();
			if (str[i] === "\"" || str[i] === "'") {
				const v = val(":");
				return String(v);
			}
			let j = i;
			while (j < str.length && !":,}".includes(str[j])) j++;
			const k = str.slice(i, j).trim();
			i = j;
			return k;
		}
		return val("");
	}
	function parseInline(s) {
		s = s.trim();
		if (s[0] === "{" || s[0] === "[") return parseFlow(s);
		return parseScalar(s);
	}
	function stripComment(s) {
		let q = null;
		for (let i = 0; i < s.length; i++) {
			const c = s[i];
			if (q) {
				if (c === "\\" && q === "\"") i++;
				else if (c === q) q = null;
			} else if (c === "\"" || c === "'") {
				if (i === 0 || /[\s:\[{,-]/.test(s[i - 1])) q = c;
			} else if (c === "#" && (i === 0 || /\s/.test(s[i - 1]))) return s.slice(0, i).trimEnd();
		}
		return s;
	}
	const KEY = /^((?:"[^"]*")|(?:'[^']*')|(?:[^\s"'\[\]{},#&*!|>%@`-][^:]*?|-[^\s:][^:]*?))\s*:(?:\s+|$)/;
	function parse(text) {
		const L = text.split("\n").map((s) => s.replace(/\t/g, "  ").replace(/\r$/, ""));
		let p = 0;
		const indentOf = (s) => s.match(/^ */)[0].length;
		const isSkip = (s) => /^\s*(#.*)?$/.test(s);
		const skip = () => {
			while (p < L.length && isSkip(L[p])) p++;
		};
		function blockScalar(style, parentIndent) {
			const lines = [];
			let bi = null;
			while (p < L.length) {
				const l = L[p];
				if (l.trim() === "") {
					lines.push("");
					p++;
					continue;
				}
				const ind = indentOf(l);
				if (ind <= parentIndent) break;
				if (bi === null) bi = ind;
				lines.push(l.slice(Math.min(bi, ind)));
				p++;
			}
			while (lines.length && lines[lines.length - 1] === "") lines.pop();
			const keep = !style.includes("-");
			let out = style[0] === ">" ? lines.join(" ").replace(/ +/g, " ") : lines.join("\n");
			return keep ? out + "\n" : out;
		}
		function parseNode(minIndent) {
			skip();
			if (p >= L.length) return null;
			const ind = indentOf(L[p]);
			if (ind < minIndent) return null;
			const line = stripComment(L[p]).trim();
			if (line === "-" || line.startsWith("- ")) return parseSeq(ind);
			if (KEY.test(line) && line[0] !== "{" && line[0] !== "[") return parseMap(ind);
			p++;
			return parseInline(line);
		}
		function parseSeq(ind) {
			const arr = [];
			while (true) {
				skip();
				if (p >= L.length) break;
				if (indentOf(L[p]) !== ind) break;
				const line = stripComment(L[p]);
				const t = line.trim();
				if (!(t === "-" || t.startsWith("- "))) break;
				const off = line.indexOf("-") + 1;
				const rest = line.slice(off);
				if (rest.trim() === "") {
					p++;
					arr.push(parseNode(ind + 1));
					continue;
				}
				const lead = rest.match(/^ */)[0].length;
				L[p] = " ".repeat(off + lead) + rest.trim();
				arr.push(parseNode(off + lead));
			}
			return arr;
		}
		function parseMap(ind) {
			const obj = {};
			while (true) {
				skip();
				if (p >= L.length) break;
				if (indentOf(L[p]) !== ind) break;
				const line = stripComment(L[p]).trim();
				const m = KEY.exec(line);
				if (!m || line.startsWith("- ")) break;
				let key = m[1];
				if (key[0] === "\"" || key[0] === "'") key = parseScalar(key);
				let rest = line.slice(m[0].length).trim();
				p++;
				if (rest === "") {
					skip();
					if (p < L.length) {
						const ni = indentOf(L[p]);
						const nl = stripComment(L[p]).trim();
						if (ni > ind) obj[key] = parseNode(ind + 1);
						else if (ni === ind && (nl === "-" || nl.startsWith("- "))) obj[key] = parseSeq(ind);
						else obj[key] = null;
					} else obj[key] = null;
				} else if (/^[|>][+-]?$/.test(rest)) obj[key] = blockScalar(rest, ind);
				else obj[key] = parseInline(rest);
			}
			return obj;
		}
		return parseNode(0);
	}
	function parseDocs(text) {
		const docs = [];
		let cur = [];
		for (const line of text.split("\n")) if (/^---\s*$/.test(line)) {
			docs.push(cur.join("\n"));
			cur = [];
		} else cur.push(line);
		docs.push(cur.join("\n"));
		return docs.map((d) => /^\s*(#.*)?$/.test(d.split("\n").filter((l) => l.trim() && !/^\s*#/.test(l)).join("\n")) ? void 0 : parse(d)).filter((d) => d !== void 0 && d !== null);
	}
	function needsQuote(s) {
		if (s === "") return true;
		if (/^(true|false|null|~|yes|no|on|off)$/i.test(s)) return true;
		if (/^-?\d+(\.\d+)?$/.test(s)) return true;
		if (/^\d{4}-\d\d-\d\d(T|\s|$)/.test(s)) return true;
		if (/^[\s]|[\s]$/.test(s)) return true;
		if (/^[-?:,\[\]{}#&*!|>'"%@`]/.test(s) && !/^-[^\s]/.test(s)) return true;
		if (/: |\s#/.test(s) || /:$/.test(s)) return true;
		return false;
	}
	function scalar(v) {
		if (v === null || v === void 0) return "null";
		if (typeof v === "string") {
			if (needsQuote(v)) return JSON.stringify(v);
			return v;
		}
		return String(v);
	}
	function dump(v, ind = 0) {
		const pad = " ".repeat(ind);
		if (Array.isArray(v)) {
			if (!v.length) return pad + "[]";
			return v.map((it) => {
				if (PG.isObj(it) && Object.keys(it).length) {
					const d = dump(it, ind + 2).split("\n");
					d[0] = pad + "- " + d[0].slice(ind + 2);
					return d.join("\n");
				}
				if (Array.isArray(it) && it.length) {
					const d = dump(it, ind + 2).split("\n");
					d[0] = pad + "- " + d[0].slice(ind + 2);
					return d.join("\n");
				}
				return pad + "- " + (PG.isObj(it) ? "{}" : Array.isArray(it) ? "[]" : scalar(it));
			}).join("\n");
		}
		if (PG.isObj(v)) {
			const keys = Object.keys(v).filter((k) => v[k] !== void 0 && !k.startsWith("_"));
			if (!keys.length) return pad + "{}";
			return keys.map((k) => {
				const x = v[k];
				const ks = needsQuote(k) && !/^[\w./-]+$/.test(k) ? JSON.stringify(k) : k;
				if (Array.isArray(x)) return x.length ? pad + ks + ":\n" + dump(x, ind) : pad + ks + ": []";
				if (PG.isObj(x)) return Object.keys(x).filter((kk) => !kk.startsWith("_")).length ? pad + ks + ":\n" + dump(x, ind + 2) : pad + ks + ": {}";
				if (typeof x === "string" && x.includes("\n")) return pad + ks + ": |" + (x.endsWith("\n") ? "" : "-") + "\n" + x.replace(/\n$/, "").split("\n").map((l) => pad + "  " + l).join("\n");
				return pad + ks + ": " + scalar(x);
			}).join("\n");
		}
		return pad + scalar(v);
	}
	return {
		parse,
		parseDocs,
		dump: (v) => dump(v, 0) + "\n",
		scalar: parseScalar
	};
})();
PG.CHART_FILES = {
	"myapp/Chart.yaml": "apiVersion: v1\nname: myapp\nversion: 0.1.0\nappVersion: \"1.0\"\ndescription: A sample web app\n",
	"myapp/values.yaml": "nameOverride: \"\"\nfullnameOverride: \"\"\n\nreplicaCount: 2\n\nimage:\n  repository: nginx\n  tag: \"1.27\"\n  pullPolicy: IfNotPresent\n\n# The registry login. Prefer to create it with kubectl (section 8) and only give the name here.\nimagePullSecret:\n  name: \"\"                  # e.g. regsecret\n  create: false             # true = build it from the values below (see warning in section 8)\n  registry: \"\"\n  username: \"\"\n  password: \"\"\n  email: \"\"\n\nserviceAccount:\n  create: true\n  name: \"\"\n  automountToken: false     # most apps never call the Kubernetes API\n\npodAnnotations: {}\npodSecurityContext: {}\nsecurityContext: {}\n\nenv:                        # plain environment variables\n  APP_MODE: production\n\nconfig:                     # becomes a ConfigMap, loaded as environment variables\n  LOG_LEVEL: info\n  FEATURE_X: \"true\"\n\nsecret:\n  existingSecret: \"\"        # name of a Secret you created yourself (recommended)\n  create: false             # true = the chart makes one from `data` below\n  data: {}                  # DB_PASSWORD: \"\"\n\nservice:\n  type: ClusterIP\n  port: 80\n  targetPort: 80\n\ningress:\n  enabled: false\n  className: \"\"\n  annotations: {}\n  hosts:\n    - host: myapp.local\n      paths:\n        - /\n  tls: []\n\nresources:\n  requests:\n    cpu: 50m\n    memory: 64Mi\n  limits:\n    cpu: 200m\n    memory: 128Mi\n\nlivenessProbe:\n  httpGet:\n    path: /\n    port: http\n  initialDelaySeconds: 10\n  periodSeconds: 10\n\nreadinessProbe:\n  httpGet:\n    path: /\n    port: http\n  periodSeconds: 5\n\nautoscaling:\n  enabled: false\n  minReplicas: 2\n  maxReplicas: 6\n  targetCPUUtilizationPercentage: 70\n\npdb:\n  enabled: true\n  minAvailable: 1\n\nnetworkPolicy:\n  enabled: false\n\npersistence:\n  enabled: false\n  size: 1Gi\n  storageClass: \"\"\n  mountPath: /data\n\nmigration:\n  enabled: false\n  command: [\"sh\", \"-c\", \"echo migrating\"]\n\ncronjob:\n  enabled: false\n  schedule: \"0 * * * *\"\n  command: [\"sh\", \"-c\", \"echo hourly\"]\n\nnodeSelector: {}\ntolerations: []\naffinity: {}\n",
	"myapp/templates/_helpers.tpl": "{{- define \"myapp.name\" -}}\n{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix \"-\" -}}\n{{- end -}}\n\n{{- define \"myapp.fullname\" -}}\n{{- if .Values.fullnameOverride -}}\n{{- .Values.fullnameOverride | trunc 63 | trimSuffix \"-\" -}}\n{{- else -}}\n{{- $name := default .Chart.Name .Values.nameOverride -}}\n{{- if contains $name .Release.Name -}}\n{{- .Release.Name | trunc 63 | trimSuffix \"-\" -}}\n{{- else -}}\n{{- printf \"%s-%s\" .Release.Name $name | trunc 63 | trimSuffix \"-\" -}}\n{{- end -}}\n{{- end -}}\n{{- end -}}\n\n{{- define \"myapp.chart\" -}}\n{{- printf \"%s-%s\" .Chart.Name .Chart.Version | replace \"+\" \"_\" | trunc 63 | trimSuffix \"-\" -}}\n{{- end -}}\n\n{{- define \"myapp.selectorLabels\" -}}\napp.kubernetes.io/name: {{ include \"myapp.name\" . }}\napp.kubernetes.io/instance: {{ .Release.Name }}\n{{- end -}}\n\n{{- define \"myapp.labels\" -}}\nhelm.sh/chart: {{ include \"myapp.chart\" . }}\n{{ include \"myapp.selectorLabels\" . }}\napp.kubernetes.io/version: {{ .Chart.AppVersion | quote }}\napp.kubernetes.io/managed-by: {{ .Release.Service }}\n{{- end -}}\n\n{{- define \"myapp.serviceAccountName\" -}}\n{{- if .Values.serviceAccount.create -}}\n{{- default (include \"myapp.fullname\" .) .Values.serviceAccount.name -}}\n{{- else -}}\n{{- default \"default\" .Values.serviceAccount.name -}}\n{{- end -}}\n{{- end -}}\n\n{{- define \"myapp.secretName\" -}}\n{{- default (include \"myapp.fullname\" .) .Values.secret.existingSecret -}}\n{{- end -}}\n\n{{- define \"myapp.dockerconfigjson\" -}}\n{{- $auth := printf \"%s:%s\" .Values.imagePullSecret.username .Values.imagePullSecret.password | b64enc -}}\n{{- printf \"{\\\"auths\\\":{\\\"%s\\\":{\\\"username\\\":\\\"%s\\\",\\\"password\\\":\\\"%s\\\",\\\"email\\\":\\\"%s\\\",\\\"auth\\\":\\\"%s\\\"}}}\" .Values.imagePullSecret.registry .Values.imagePullSecret.username .Values.imagePullSecret.password .Values.imagePullSecret.email $auth -}}\n{{- end -}}\n",
	"myapp/templates/serviceaccount.yaml": "{{- if .Values.serviceAccount.create }}\napiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: {{ include \"myapp.serviceAccountName\" . }}\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\nautomountServiceAccountToken: {{ .Values.serviceAccount.automountToken }}\n{{- end }}\n",
	"myapp/templates/imagepullsecret.yaml": "{{- if .Values.imagePullSecret.create }}\napiVersion: v1\nkind: Secret\nmetadata:\n  name: {{ required \"imagePullSecret.name is required\" .Values.imagePullSecret.name }}\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\ntype: kubernetes.io/dockerconfigjson\ndata:\n  .dockerconfigjson: {{ include \"myapp.dockerconfigjson\" . | b64enc }}\n{{- end }}\n",
	"myapp/templates/configmap.yaml": "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: {{ include \"myapp.fullname\" . }}\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\ndata:\n{{- range $key, $value := .Values.config }}\n  {{ $key }}: {{ $value | quote }}\n{{- end }}\n---\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: {{ include \"myapp.fullname\" . }}-files\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\ndata:\n  app.conf: |\n{{ .Files.Get \"files/app.conf\" | indent 4 }}\n",
	"myapp/files/app.conf": "# example config file, shipped inside the chart\ngreeting = hello\n",
	"myapp/templates/secret.yaml": "{{- if and .Values.secret.create (not .Values.secret.existingSecret) }}\napiVersion: v1\nkind: Secret\nmetadata:\n  name: {{ include \"myapp.fullname\" . }}\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\ntype: Opaque\nstringData:\n{{- range $key, $value := .Values.secret.data }}\n  {{ $key }}: {{ $value | quote }}\n{{- end }}\n{{- end }}\n",
	"myapp/templates/deployment.yaml": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: {{ include \"myapp.fullname\" . }}\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\nspec:\n{{- if not .Values.autoscaling.enabled }}\n  replicas: {{ .Values.replicaCount }}\n{{- end }}\n  selector:\n    matchLabels:\n{{ include \"myapp.selectorLabels\" . | indent 6 }}\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxUnavailable: 0\n      maxSurge: 1\n  template:\n    metadata:\n      annotations:\n        checksum/config: {{ include (print $.Template.BasePath \"/configmap.yaml\") . | sha256sum }}\n        checksum/secret: {{ include (print $.Template.BasePath \"/secret.yaml\") . | sha256sum }}\n      {{- with .Values.podAnnotations }}\n{{ toYaml . | indent 8 }}\n      {{- end }}\n      labels:\n{{ include \"myapp.selectorLabels\" . | indent 8 }}\n    spec:\n      serviceAccountName: {{ include \"myapp.serviceAccountName\" . }}\n      {{- if .Values.imagePullSecret.name }}\n      imagePullSecrets:\n        - name: {{ .Values.imagePullSecret.name }}\n      {{- end }}\n      {{- with .Values.podSecurityContext }}\n      securityContext:\n{{ toYaml . | indent 8 }}\n      {{- end }}\n      terminationGracePeriodSeconds: 30\n      containers:\n        - name: {{ .Chart.Name }}\n          image: \"{{ .Values.image.repository }}:{{ required \"image.tag is required\" .Values.image.tag }}\"\n          imagePullPolicy: {{ .Values.image.pullPolicy }}\n          {{- with .Values.securityContext }}\n          securityContext:\n{{ toYaml . | indent 12 }}\n          {{- end }}\n          ports:\n            - name: http\n              containerPort: {{ .Values.service.targetPort }}\n              protocol: TCP\n          env:\n            - name: POD_NAME\n              valueFrom:\n                fieldRef:\n                  fieldPath: metadata.name\n          {{- range $key, $value := .Values.env }}\n            - name: {{ $key }}\n              value: {{ $value | quote }}\n          {{- end }}\n          envFrom:\n            - configMapRef:\n                name: {{ include \"myapp.fullname\" . }}\n            - secretRef:\n                name: {{ include \"myapp.secretName\" . }}\n                optional: true\n          livenessProbe:\n{{ toYaml .Values.livenessProbe | indent 12 }}\n          readinessProbe:\n{{ toYaml .Values.readinessProbe | indent 12 }}\n          resources:\n{{ toYaml .Values.resources | indent 12 }}\n          volumeMounts:\n            - name: files\n              mountPath: /etc/myapp\n              readOnly: true\n          {{- if .Values.persistence.enabled }}\n            - name: data\n              mountPath: {{ .Values.persistence.mountPath }}\n          {{- end }}\n      volumes:\n        - name: files\n          configMap:\n            name: {{ include \"myapp.fullname\" . }}-files\n      {{- if .Values.persistence.enabled }}\n        - name: data\n          persistentVolumeClaim:\n            claimName: {{ include \"myapp.fullname\" . }}\n      {{- end }}\n      {{- with .Values.nodeSelector }}\n      nodeSelector:\n{{ toYaml . | indent 8 }}\n      {{- end }}\n      {{- with .Values.affinity }}\n      affinity:\n{{ toYaml . | indent 8 }}\n      {{- end }}\n      {{- with .Values.tolerations }}\n      tolerations:\n{{ toYaml . | indent 8 }}\n      {{- end }}\n",
	"myapp/templates/service.yaml": "apiVersion: v1\nkind: Service\nmetadata:\n  name: {{ include \"myapp.fullname\" . }}\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\nspec:\n  type: {{ .Values.service.type }}\n  ports:\n    - name: http\n      port: {{ .Values.service.port }}\n      targetPort: http\n      protocol: TCP\n  selector:\n{{ include \"myapp.selectorLabels\" . | indent 4 }}\n",
	"myapp/templates/ingress.yaml": "{{- if .Values.ingress.enabled }}\n{{- $fullName := include \"myapp.fullname\" . -}}\n{{- $svcPort := .Values.service.port -}}\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: {{ $fullName }}\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\n  {{- with .Values.ingress.annotations }}\n  annotations:\n{{ toYaml . | indent 4 }}\n  {{- end }}\nspec:\n  {{- if .Values.ingress.className }}\n  ingressClassName: {{ .Values.ingress.className }}\n  {{- end }}\n  {{- if .Values.ingress.tls }}\n  tls:\n  {{- range .Values.ingress.tls }}\n    - hosts:\n      {{- range .hosts }}\n        - {{ . | quote }}\n      {{- end }}\n      secretName: {{ .secretName }}\n  {{- end }}\n  {{- end }}\n  rules:\n  {{- range .Values.ingress.hosts }}\n    - host: {{ .host | quote }}\n      http:\n        paths:\n        {{- range .paths }}\n          - path: {{ . }}\n            pathType: Prefix\n            backend:\n              service:\n                name: {{ $fullName }}\n                port:\n                  number: {{ $svcPort }}\n        {{- end }}\n  {{- end }}\n{{- end }}\n",
	"myapp/templates/hpa.yaml": "{{- if .Values.autoscaling.enabled }}\napiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: {{ include \"myapp.fullname\" . }}\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: {{ include \"myapp.fullname\" . }}\n  minReplicas: {{ .Values.autoscaling.minReplicas }}\n  maxReplicas: {{ .Values.autoscaling.maxReplicas }}\n  metrics:\n    - type: Resource\n      resource:\n        name: cpu\n        target:\n          type: Utilization\n          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}\n{{- end }}\n",
	"myapp/templates/pdb.yaml": "{{- if .Values.pdb.enabled }}\napiVersion: policy/v1\nkind: PodDisruptionBudget\nmetadata:\n  name: {{ include \"myapp.fullname\" . }}\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\nspec:\n  minAvailable: {{ .Values.pdb.minAvailable }}\n  selector:\n    matchLabels:\n{{ include \"myapp.selectorLabels\" . | indent 6 }}\n{{- end }}\n",
	"myapp/templates/pvc.yaml": "{{- if .Values.persistence.enabled }}\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: {{ include \"myapp.fullname\" . }}\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\nspec:\n  accessModes:\n    - ReadWriteOnce\n  {{- if .Values.persistence.storageClass }}\n  storageClassName: {{ .Values.persistence.storageClass }}\n  {{- end }}\n  resources:\n    requests:\n      storage: {{ .Values.persistence.size }}\n{{- end }}\n",
	"myapp/templates/networkpolicy.yaml": "{{- if .Values.networkPolicy.enabled }}\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: {{ include \"myapp.fullname\" . }}\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\nspec:\n  podSelector:\n    matchLabels:\n{{ include \"myapp.selectorLabels\" . | indent 6 }}\n  policyTypes:\n    - Ingress\n  ingress:\n    - from:\n        - podSelector: {}\n      ports:\n        - port: {{ .Values.service.targetPort }}\n{{- end }}\n",
	"myapp/templates/job-migrate.yaml": "{{- if .Values.migration.enabled }}\napiVersion: batch/v1\nkind: Job\nmetadata:\n  name: {{ include \"myapp.fullname\" . }}-migrate-{{ .Release.Revision }}\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\n  annotations:\n    \"helm.sh/hook\": pre-install,pre-upgrade\n    \"helm.sh/hook-weight\": \"-5\"\n    \"helm.sh/hook-delete-policy\": hook-succeeded,before-hook-creation\nspec:\n  backoffLimit: 1\n  template:\n    spec:\n      restartPolicy: Never\n      containers:\n        - name: migrate\n          image: \"{{ .Values.image.repository }}:{{ .Values.image.tag }}\"\n          command:\n{{ toYaml .Values.migration.command | indent 12 }}\n{{- end }}\n",
	"myapp/templates/cronjob.yaml": "{{- if .Values.cronjob.enabled }}\napiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: {{ include \"myapp.fullname\" . }}-cron\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\nspec:\n  schedule: {{ .Values.cronjob.schedule | quote }}\n  concurrencyPolicy: Forbid\n  successfulJobsHistoryLimit: 1\n  failedJobsHistoryLimit: 3\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          restartPolicy: OnFailure\n          containers:\n            - name: cron\n              image: \"{{ .Values.image.repository }}:{{ .Values.image.tag }}\"\n              command:\n{{ toYaml .Values.cronjob.command | indent 16 }}\n{{- end }}\n",
	"myapp/templates/NOTES.txt": "{{ .Chart.Name }} {{ .Chart.AppVersion }} is installed as release \"{{ .Release.Name }}\" in namespace \"{{ .Release.Namespace }}\".\n\n{{- if .Values.ingress.enabled }}\nOpen:\n{{- range .Values.ingress.hosts }}\n  http://{{ .host }}\n{{- end }}\n{{- else }}\nReach it from your local machine:\n  kubectl port-forward svc/{{ include \"myapp.fullname\" . }} 8080:{{ .Values.service.port }} --namespace {{ .Release.Namespace }}\n  curl http://localhost:8080\n{{- end }}\n",
	"myapp/templates/tests/test-connection.yaml": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: \"{{ include \"myapp.fullname\" . }}-test\"\n  labels:\n{{ include \"myapp.labels\" . | indent 4 }}\n  annotations:\n    \"helm.sh/hook\": test-success\nspec:\n  restartPolicy: Never\n  containers:\n    - name: wget\n      image: busybox:1.36\n      command: [\"wget\"]\n      args: [\"-qO-\", \"{{ include \"myapp.fullname\" . }}:{{ .Values.service.port }}\"]\n",
	"myapp/.helmignore": ".git/\n*.swp\n*.bak\n*.tmp\n",
	"values-dev.yaml": "replicaCount: 1\nimage:\n  tag: \"1.27\"\ningress:\n  enabled: true\n  hosts:\n    - host: myapp.dev.local\n      paths: [\"/\"]\npdb:\n  enabled: false\n",
	"values-prod.yaml": "replicaCount: 3\nautoscaling:\n  enabled: true\n  minReplicas: 3\n  maxReplicas: 10\nresources:\n  requests: {cpu: 250m, memory: 256Mi}\n  limits: {cpu: \"1\", memory: 512Mi}\nnetworkPolicy:\n  enabled: true\n"
};
PG.FS = class {
	constructor() {
		this.files = {};
		this.dirs = /* @__PURE__ */ new Set([
			"/",
			"/home",
			"/home/user",
			"/tmp",
			"/etc"
		]);
		this.onChange = null;
		this.mt = {};
		this.stamp = null;
	}
	changed() {
		if (this.onChange) this.onChange();
	}
	snapshot() {
		return {
			v: 1,
			files: this.files,
			dirs: [...this.dirs],
			mt: this.mt
		};
	}
	restore(snap) {
		this.files = { ...snap.files || {} };
		this.mt = { ...snap.mt || {} };
		this.dirs = /* @__PURE__ */ new Set([
			"/",
			"/home",
			"/home/user",
			"/tmp",
			"/etc",
			...snap.dirs || []
		]);
	}
	norm(path, cwd) {
		if (!path.startsWith("/")) path = (cwd || "/") + "/" + path;
		const out = [];
		for (const p of path.split("/")) {
			if (!p || p === ".") continue;
			if (p === "..") out.pop();
			else out.push(p);
		}
		return "/" + out.join("/");
	}
	exists(p) {
		return p in this.files || this.dirs.has(p);
	}
	isDir(p) {
		return this.dirs.has(p);
	}
	read(p) {
		return this.files[p];
	}
	write(p, content) {
		const d = p.slice(0, p.lastIndexOf("/")) || "/";
		this.mkdirp(d, true);
		this.files[p] = content;
		if (this.stamp) this.mt[p] = this.stamp();
		this.changed();
	}
	mkdirp(p, quiet) {
		let cur = "";
		for (const part of p.split("/").filter(Boolean)) {
			cur += "/" + part;
			this.dirs.add(cur);
		}
		this.dirs.add("/");
		if (!quiet) this.changed();
	}
	list(p) {
		const pre = p === "/" ? "/" : p + "/";
		const names = /* @__PURE__ */ new Set();
		for (const f of Object.keys(this.files)) if (f.startsWith(pre)) names.add(f.slice(pre.length).split("/")[0]);
		for (const d of this.dirs) if (d.startsWith(pre) && d !== p) names.add(d.slice(pre.length).split("/")[0]);
		return [...names].sort();
	}
	remove(p, recursive) {
		let n = 0;
		if (p in this.files) {
			delete this.files[p];
			n++;
		}
		if (this.dirs.has(p)) {
			if (!recursive && this.list(p).length) return -1;
			for (const f of Object.keys(this.files)) if (f.startsWith(p + "/")) {
				delete this.files[f];
				n++;
			}
			for (const d of [...this.dirs]) if (d === p || d.startsWith(p + "/")) {
				this.dirs.delete(d);
				n++;
			}
		}
		this.changed();
		return n;
	}
};
PG.Shell = class {
	constructor(sim, term) {
		this.sim = sim;
		this.term = term;
		this.env = {
			HOME: "/home/user",
			USER: "user",
			PWD: "/home/user",
			KUBECONFIG: ""
		};
		this.cwd = "/home/user";
		this.history = [];
		this.aborted = false;
		this.busy = false;
		this.buf = null;
		this.hd = null;
		this.vars = {};
		this.aliases = {
			kc: "kubectl",
			k: "kubectl"
		};
	}
	get fs() {
		return this.fsOverride || this.sim.fs;
	}
	prompt() {
		if (this.session) return this.session.prompt();
		if (this.promptFn) return this.buf !== null ? "> " : this.promptFn();
		const d = this.cwd === "/home/user" ? "~" : this.cwd.startsWith("/home/user/") ? "~" + this.cwd.slice(9) : this.cwd;
		return this.buf !== null ? "> " : `user@playground:${d}$ `;
	}
	abort() {
		this.aborted = true;
		if (this.session) this.session.aborted = true;
		this.sim.wake();
	}
	async submit(line) {
		if (this.session) {
			const r = await this.session.submit(line);
			if (this.session.pod) PG.syncVols(this.session.pod.cl, this.session.pod.pod, this.session.pod.container);
			if (this.session && this.session.exitRequested) {
				const done = this.session.onExit;
				this.session = null;
				if (done) done();
				this.term.print("exit", "dim");
			}
			return r;
		}
		if (this.buf === null) this.buf = line;
		else this.buf += "\n" + line;
		if (this.needsMore(this.buf)) return false;
		const text = this.buf;
		this.buf = null;
		if (text.trim() === "") return true;
		this.history.push(text.split("\n")[0] + (text.includes("\n") ? " …" : ""));
		this.busy = true;
		this.aborted = false;
		try {
			await this.runScript(text, null);
		} catch (e) {
			if (!(e && e.abort)) this.term.print("playground: internal error: " + (e && e.stack || e), "err");
		}
		this.busy = false;
		this.aborted = false;
		this.sim.notify();
		return true;
	}
	needsMore(text) {
		const lines = text.split("\n");
		let hd = null;
		let inFunc = false;
		let q = null;
		const plain = [];
		for (let i = 0; i < lines.length; i++) {
			const l = lines[i];
			if (hd) {
				if (l.trim() === hd) hd = null;
				continue;
			}
			const m = /<<-?\s*(['"]?)([A-Za-z_]\w*)\1/.exec(l);
			if (m && !/^\s*#/.test(l)) hd = m[2];
			if (/^\s*[\w-]+\(\)\s*\{\s*$/.test(l)) inFunc = true;
			if (inFunc && /^\}\s*$/.test(l)) inFunc = false;
			plain.push(l);
			for (let k = 0; k < l.length; k++) {
				const c = l[k];
				if (q) {
					if (c === "\\" && q === "\"") k++;
					else if (c === q) q = null;
				} else if (c === "'" || c === "\"") q = c;
				else if (c === "#" && (k === 0 || /\s/.test(l[k - 1]))) break;
				else if (c === "\\") k++;
			}
			if (i === lines.length - 1 && /\\$/.test(l) && !hd) return true;
		}
		return !!(hd || !q && this.compoundDepth(plain.join("\n")) > 0 || inFunc || q);
	}
	splitStatements(text) {
		const lines = text.split("\n");
		const out = [];
		let i = 0;
		while (i < lines.length) {
			let stmt = lines[i++];
			while (/\\$/.test(stmt) && i < lines.length) stmt = stmt.slice(0, -1) + " " + lines[i++].trim();
			if (/^\s*[\w-]+\(\)\s*\{\s*$/.test(stmt)) {
				const name = stmt.trim().split("(")[0];
				const body = [];
				while (i < lines.length && !/^\}\s*$/.test(lines[i])) body.push(lines[i++]);
				i++;
				out.push({
					func: name,
					body: body.join("\n")
				});
				continue;
			}
			if (this.splitTop(stmt).some((x) => /^(if|while)\b/.test(x) || /^for\s+\w+\s+in\b/.test(x))) {
				const all = [stmt];
				while (this.compoundDepth(all.join("\n")) > 0 && i < lines.length) {
					let l = lines[i++];
					while (/\\$/.test(l) && i < lines.length) l = l.slice(0, -1) + " " + lines[i++].trim();
					all.push(l);
				}
				out.push({ compound: all.join("\n") });
				continue;
			}
			const m = /<<-?\s*(['"]?)([A-Za-z_]\w*)\1/.exec(stmt);
			if (m) {
				const body = [];
				while (i < lines.length && lines[i].trim() !== m[2]) body.push(lines[i++]);
				i++;
				out.push({
					text: stmt.replace(m[0], " <<HEREDOC "),
					heredoc: {
						quoted: m[1] !== "",
						body: body.join("\n") + (body.length ? "\n" : "")
					}
				});
				continue;
			}
			out.push({ text: stmt });
		}
		return out;
	}
	async runScript(text, sink) {
		let last = 0;
		for (const st of this.splitStatements(text)) {
			if (this.aborted) throw { abort: true };
			if (this.exitRequested) break;
			if (st.func) {
				this.defineFunc(st);
				last = 0;
				continue;
			}
			if (st.compound) {
				last = await this.runCompound(st.compound, sink);
				continue;
			}
			last = await this.runLine(st.text, st.heredoc, sink);
		}
		return last;
	}
	defineFunc(st) {
		if (st.func === "helm2") this.term.print("(helm2 is already built into the playground — no need to define it)", "dim");
		else {
			this.funcs = this.funcs || {};
			this.funcs[st.func] = st.body;
			this.term.print(`function ${st.func} defined`, "dim");
		}
	}
	splitTop(text) {
		const out = [];
		let cur = "", q = null, depth = 0;
		for (let i = 0; i < text.length; i++) {
			const c = text[i];
			if (q) {
				cur += c;
				if (c === "\\" && q === "\"") cur += text[++i] || "";
				else if (c === q) q = null;
				continue;
			}
			if (c === "\"" || c === "'") {
				q = c;
				cur += c;
				continue;
			}
			if (c === "\\") {
				cur += c + (text[++i] || "");
				continue;
			}
			if (c === "#" && depth === 0 && (cur === "" || /\s$/.test(cur))) {
				while (i < text.length && text[i] !== "\n") i++;
				i--;
				continue;
			}
			if (c === "(") depth++;
			else if (c === ")") depth = Math.max(0, depth - 1);
			if (depth === 0 && (c === ";" || c === "\n")) {
				out.push(cur);
				cur = "";
				continue;
			}
			cur += c;
		}
		out.push(cur);
		return out.map((x) => x.trim()).filter(Boolean);
	}
	compoundDepth(text) {
		let d = 0;
		for (const st of this.splitTop(text)) {
			const w = /^(\w+)/.exec(st);
			if (!w) continue;
			const k = w[1];
			if (k === "if" || k === "while" || k === "for" && /^for\s+\w+\s+in\b/.test(st)) d++;
			else if (k === "fi" || k === "done") d--;
		}
		return d;
	}
	parseCompound(stmts, i, stops) {
		const nodes = [];
		const kwOf = (x) => {
			const m = /^(\w+)/.exec(x.trim());
			return m ? m[1] : "";
		};
		const drop = (idx, kw) => {
			stmts[idx] = stmts[idx].trim().slice(kw.length).trim();
		};
		while (i < stmts.length) {
			const st = stmts[i].trim();
			if (!st) {
				i++;
				continue;
			}
			const kw = kwOf(st);
			if (stops.includes(kw)) return {
				nodes,
				i
			};
			if (kw === "if") {
				drop(i, "if");
				const clauses = [];
				let els = null;
				let r = this.parseCompound(stmts, i, ["then"]);
				let cond = r.nodes;
				i = r.i;
				if (i >= stmts.length) throw new Error("expected 'then'");
				drop(i, "then");
				r = this.parseCompound(stmts, i, [
					"elif",
					"else",
					"fi"
				]);
				clauses.push({
					cond,
					body: r.nodes
				});
				i = r.i;
				while (true) {
					if (i >= stmts.length) throw new Error("expected 'fi'");
					const k = kwOf(stmts[i]);
					if (k === "elif") {
						drop(i, "elif");
						r = this.parseCompound(stmts, i, ["then"]);
						cond = r.nodes;
						i = r.i;
						if (i >= stmts.length) throw new Error("expected 'then'");
						drop(i, "then");
						r = this.parseCompound(stmts, i, [
							"elif",
							"else",
							"fi"
						]);
						clauses.push({
							cond,
							body: r.nodes
						});
						i = r.i;
					} else if (k === "else") {
						drop(i, "else");
						r = this.parseCompound(stmts, i, ["fi"]);
						els = r.nodes;
						i = r.i;
					} else if (k === "fi") {
						drop(i, "fi");
						break;
					} else throw new Error("unexpected " + k);
				}
				nodes.push({
					t: "if",
					clauses,
					els
				});
				continue;
			}
			if (kw === "while") {
				drop(i, "while");
				let r = this.parseCompound(stmts, i, ["do"]);
				const cond = r.nodes;
				i = r.i;
				if (i >= stmts.length) throw new Error("expected 'do'");
				drop(i, "do");
				r = this.parseCompound(stmts, i, ["done"]);
				i = r.i;
				if (i >= stmts.length) throw new Error("expected 'done'");
				drop(i, "done");
				nodes.push({
					t: "while",
					cond,
					body: r.nodes
				});
				continue;
			}
			if (kw === "for" && /^for\s+\w+\s+in\b/.test(st)) {
				const m = /^for\s+(\w+)\s+in\b\s*(.*)$/.exec(st);
				i++;
				while (i < stmts.length && !stmts[i].trim()) i++;
				if (i >= stmts.length || kwOf(stmts[i]) !== "do") throw new Error("expected 'do'");
				drop(i, "do");
				const r = this.parseCompound(stmts, i, ["done"]);
				i = r.i;
				if (i >= stmts.length) throw new Error("expected 'done'");
				drop(i, "done");
				nodes.push({
					t: "for",
					name: m[1],
					list: m[2],
					body: r.nodes
				});
				continue;
			}
			nodes.push({
				t: "cmd",
				text: st
			});
			i++;
		}
		return {
			nodes,
			i
		};
	}
	async runCompound(text, sink) {
		let r;
		try {
			r = this.parseCompound(this.splitTop(text), 0, []);
		} catch (e) {
			this.term.print("playground: syntax error: " + e.message, "err");
			return 2;
		}
		return this.execNodes(r.nodes, sink);
	}
	async execNodes(nodes, sink) {
		let last = 0;
		for (const n of nodes) {
			if (this.aborted) throw { abort: true };
			if (n.t === "cmd") last = await this.runLine(n.text, null, sink);
			else if (n.t === "if") {
				let ran = false;
				for (const c of n.clauses) if (await this.execNodes(c.cond, sink) === 0) {
					last = await this.execNodes(c.body, sink);
					ran = true;
					break;
				}
				if (!ran && n.els) last = await this.execNodes(n.els, sink);
				else if (!ran) last = 0;
			} else if (n.t === "while") {
				let g = 0;
				while (g++ < 2e5) {
					if (this.aborted) throw { abort: true };
					if (await this.execNodes(n.cond, sink) !== 0) break;
					last = await this.execNodes(n.body, sink);
					if (g % 100 === 0) await new Promise((r) => setTimeout(r, 0));
				}
			} else if (n.t === "for") {
				const words = [];
				for (const t of lex(n.list)) if (t.t === "word") words.push(...await this.expandWord(t));
				for (const w of words) {
					this.vars[n.name] = w;
					last = await this.execNodes(n.body, sink);
				}
			}
		}
		return last;
	}
	async runLine(text, heredoc, sink) {
		const toks = lex(text);
		if (!toks.length) return 0;
		const items = [];
		let cur = [];
		let conn = null;
		for (const t of toks) if (t.t === "op" && (t.v === ";" || t.v === "&&" || t.v === "||")) {
			items.push({
				toks: cur,
				conn
			});
			conn = t.v;
			cur = [];
		} else cur.push(t);
		items.push({
			toks: cur,
			conn
		});
		const lastI = items[items.length - 1];
		const lt = lastI.toks[lastI.toks.length - 1];
		if (lt && lt.t === "op" && lt.v === "&") {
			this.term.print("(background jobs with & are not supported — open a second terminal tab with the + button and run the next command there)", "dim");
			return 1;
		}
		let status = 0;
		for (const it of items) {
			if (it.conn === "&&" && status !== 0) continue;
			if (it.conn === "||" && status === 0) continue;
			if (!it.toks.length) continue;
			status = await this.runPipeline(it.toks, heredoc, sink);
			this.env["?"] = String(status);
		}
		return status;
	}
	async runPipeline(toks, heredoc, sink) {
		const cmds = [];
		let cur = [];
		for (const t of toks) if (t.t === "op" && t.v === "|") {
			cmds.push(cur);
			cur = [];
		} else cur.push(t);
		cmds.push(cur);
		let stdin = null, status = 0;
		for (let i = 0; i < cmds.length; i++) {
			const last = i === cmds.length - 1;
			let buf = "";
			const target = last ? sink : { write: (s) => {
				buf += s;
			} };
			status = await this.runCommand(cmds[i], stdin, target, heredoc);
			stdin = buf;
		}
		return status;
	}
	async runCommand(toks, stdin, sink, heredoc) {
		const words = [];
		const redirs = [];
		for (let i = 0; i < toks.length; i++) {
			const t = toks[i];
			if (t.t === "op") {
				if (t.v === "<<HEREDOC") redirs.push({ op: "hd" });
				else if ([
					">",
					">>",
					"<",
					"2>",
					"2>>",
					"&>"
				].includes(t.v)) {
					const tg = toks[++i];
					redirs.push({
						op: t.v,
						target: tg
					});
				} else if (t.v === "2>&1") redirs.push({ op: "2>&1" });
				continue;
			}
			words.push(t);
		}
		let ai = 0;
		const assigns = [];
		while (ai < words.length) {
			const w = words[ai];
			const p0 = w.parts[0];
			if (p0 && p0.k === "lit" && !p0.q && /^[A-Za-z_]\w*=/.test(p0.v)) {
				assigns.push(w);
				ai++;
			} else break;
		}
		const rest = words.slice(ai);
		if (!rest.length) {
			for (const a of assigns) {
				const [k, ...r] = a.parts[0].v.split("=");
				const first = {
					...a.parts[0],
					v: r.join("=")
				};
				const val = (await this.expandWord({
					t: "word",
					parts: [first, ...a.parts.slice(1)]
				}, true)).join("");
				this.vars[k] = val;
				this.env[k] = val;
			}
			return 0;
		}
		let args = [];
		for (const w of rest) args.push(...await this.expandWord(w));
		while (args[0] === "sudo") args.shift();
		if (!args.length) return 0;
		let outFile = null, append = false, errNull = false, errToOut = false, inText = stdin;
		for (const r of redirs) {
			if (r.op !== "hd" && r.op !== "2>&1" && r.op !== "&>" && !(r.target && r.target.t === "word")) {
				this.term.print("playground: syntax error near unexpected token `" + (r.target && r.target.v ? r.target.v : "newline") + "'", "err");
				return 2;
			}
			if (r.op === "hd") inText = heredoc ? heredoc.quoted ? heredoc.body : await this.expandText(heredoc.body) : "";
			else if (r.op === ">" || r.op === ">>") {
				outFile = this.fs.norm((await this.expandWord(r.target)).join(""), this.cwd);
				append = r.op === ">>";
			} else if (r.op === "&>") {
				outFile = "/dev/null";
				errNull = true;
			} else if (r.op === "2>" || r.op === "2>>") {
				if ((await this.expandWord(r.target)).join("") === "/dev/null") errNull = true;
			} else if (r.op === "2>&1") errToOut = true;
			else if (r.op === "<") {
				const f = this.fs.norm((await this.expandWord(r.target)).join(""), this.cwd);
				const c = this.fs.read(f);
				if (c === void 0) {
					this.term.print(`playground: ${(await this.expandWord(r.target)).join("")}: No such file or directory`, "err");
					return 1;
				}
				inText = c;
			}
		}
		let outBuf = "";
		const write = (s) => {
			if (s === "") return;
			if (outFile) outBuf += s;
			else if (sink) sink.write(s);
			else this.term.print(s.replace(/\n$/, ""), void 0, true);
		};
		const ctx = this.makeCtx(inText, write, errNull, errToOut);
		ctx.tty = !outFile && !sink;
		if (this.aliases[args[0]]) {
			const rep = this.aliases[args[0]].split(/\s+/).filter(Boolean);
			args.splice(0, 1, ...rep);
		}
		let name = args[0];
		const fn = this.cmdOverride ? Object.prototype.hasOwnProperty.call(this.cmdOverride, name) ? this.cmdOverride[name] : void 0 : PG.commands[name];
		let code;
		if (this.funcs && this.funcs[name]) code = await this.runScript(this.funcs[name].replace(/"\$@"|\$@/g, args.slice(1).join(" ")), sink);
		else if (!fn) {
			if (this.lenient) code = 0;
			else {
				ctx.eprintln(this.notFoundMsg ? this.notFoundMsg(args[0]) : `playground: command not found: ${args[0]}` + PG.suggest(args[0]));
				code = 127;
			}
		} else try {
			code = await fn(ctx, args.slice(1));
			if (code === void 0) code = 0;
		} catch (e) {
			if (e && e.abort) throw e;
			ctx.eprintln("playground: " + name + ": internal error: " + (e && e.stack || e));
			code = 1;
		}
		if (outFile && outFile !== "/dev/null") {
			const old = append ? this.fs.read(outFile) || "" : "";
			this.fs.write(outFile, old + outBuf);
		}
		return code;
	}
	makeCtx(stdin, write, errNull, errToOut) {
		const sh = this;
		const sim = this.sim;
		return {
			sim,
			sh,
			stdin,
			env: this.env,
			cwd: this.cwd,
			fs: this.fs,
			out: (s) => write(s),
			println: (s) => write(s + "\n"),
			err: (s) => {
				if (errNull) return;
				if (errToOut) write(s);
				else sh.term.print(s.replace(/\n$/, ""), "err");
			},
			eprintln: (s) => {
				if (errNull) return;
				if (errToOut) write(s + "\n");
				else sh.term.print(s, "err");
			},
			info: (s, cls) => sh.term.print(s, cls || "dim"),
			clear: () => sh.term.clear(),
			aborted: () => sh.aborted,
			sleep: async (secs) => {
				await sim.wait(secs, sh);
				if (sh.aborted) throw { abort: true };
			},
			delay: async (ms) => {
				if (PG.fast) return;
				await new Promise((r) => setTimeout(r, ms));
				if (sh.aborted) throw { abort: true };
			},
			resolve: (p) => sh.fs.norm(p.replace(/^~(?=\/|$)/, sh.env.HOME), sh.cwd)
		};
	}
	async expandText(text) {
		let out = "";
		let i = 0;
		while (i < text.length) {
			if (text[i] === "\\" && "$`\\".includes(text[i + 1] || "")) {
				out += text[i + 1];
				i += 2;
				continue;
			}
			if (text[i] === "$") {
				const r = readDollar(text, i);
				if (r) {
					out += await this.partValue(r.part);
					i = r.end;
					continue;
				}
			}
			out += text[i++];
		}
		return out;
	}
	async partValue(p) {
		if (p.k === "lit") return p.v.replace(/\u0000HOME/g, this.env.HOME);
		if (p.k === "var") {
			if (p.v === "@" || p.v === "*") return "";
			return this.vars[p.v] ?? this.env[p.v] ?? "";
		}
		if (p.k === "arith") return String(PG.arith(p.v, (name) => Number(this.vars[name] ?? this.env[name] ?? 0)));
		if (p.k === "sub") {
			let buf = "";
			this.aborted;
			await this.runScript(p.v, { write: (s) => {
				buf += s;
			} });
			return buf.replace(/\n+$/, "");
		}
		return "";
	}
	async expandWord(word, noSplit) {
		const fields = [];
		let cur = "";
		let has = false;
		for (const p of word.parts) {
			const v = await this.partValue(p);
			if (p.k === "lit" || p.q || noSplit) {
				cur += v;
				has = true;
				if (p.k !== "lit" && !v && !p.q) {}
			} else {
				const pieces = v.split(/\s+/).filter((x) => x !== "");
				if (v.trim() === "") continue;
				pieces.forEach((pc, idx) => {
					if (idx === 0 && !/^\s/.test(v)) {
						cur += pc;
						has = true;
					} else {
						if (has) fields.push(cur);
						cur = pc;
						has = true;
					}
				});
				if (/\s$/.test(v)) {
					fields.push(cur);
					cur = "";
					has = false;
				}
			}
		}
		if (has) fields.push(cur);
		if (!noSplit && word.parts.some((p) => p.k === "lit" && !p.q && /[*?]/.test(p.v))) {
			const out = [];
			for (const f of fields) {
				const g = /[*?]/.test(f) ? this.glob(f) : null;
				if (g && g.length) out.push(...g);
				else out.push(f);
			}
			return out;
		}
		return fields;
	}
	glob(pattern) {
		const slash = pattern.lastIndexOf("/");
		const dirPart = slash >= 0 ? pattern.slice(0, slash + 1) : "";
		const base = pattern.slice(slash + 1);
		const dir = this.fs.norm((dirPart || ".").replace(/^\u0000HOME/, this.env.HOME).replace(/^~/, this.env.HOME), this.cwd);
		if (!this.fs.isDir(dir)) return [];
		const re = new RegExp("^" + base.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
		return this.fs.list(dir).filter((n) => re.test(n) && (n[0] !== "." || base[0] === ".")).map((n) => dirPart + n);
	}
};
function readDollar(s, i) {
	const n = s[i + 1];
	if (n === "(" && s[i + 2] === "(") {
		let d = 0, j = i + 1;
		for (; j < s.length; j++) if (s[j] === "(") d++;
		else if (s[j] === ")") {
			d--;
			if (d === 0) break;
		}
		if (s[j - 1] === ")") return {
			part: {
				k: "arith",
				v: s.slice(i + 3, j - 1)
			},
			end: j + 1
		};
		return null;
	}
	if (n === "(") {
		let d = 1, j = i + 2, q = null;
		for (; j < s.length && d > 0; j++) {
			const c = s[j];
			if (q) {
				if (c === q) q = null;
			} else if (c === "'" || c === "\"") q = c;
			else if (c === "(") d++;
			else if (c === ")") d--;
		}
		return {
			part: {
				k: "sub",
				v: s.slice(i + 2, j - 1)
			},
			end: j
		};
	}
	if (n === "{") {
		const j = s.indexOf("}", i);
		if (j < 0) return null;
		return {
			part: {
				k: "var",
				v: s.slice(i + 2, j)
			},
			end: j + 1
		};
	}
	if (n === "?" || n === "@" || n === "*") return {
		part: {
			k: "var",
			v: n
		},
		end: i + 2
	};
	const m = /^[A-Za-z_]\w*/.exec(s.slice(i + 1));
	if (m) return {
		part: {
			k: "var",
			v: m[0]
		},
		end: i + 1 + m[0].length
	};
	if (/\d/.test(n || "")) return {
		part: {
			k: "var",
			v: n
		},
		end: i + 2
	};
	return null;
}
var OPS = [
	"2>&1",
	"2>>",
	"2>",
	"&>",
	"<<HEREDOC",
	">>",
	">",
	"<",
	"||",
	"&&",
	"|",
	";",
	"&"
];
function lex(s) {
	const toks = [];
	let parts = [];
	let lit = "";
	let has = false;
	const flush = (q) => {
		if (lit !== "") {
			parts.push({
				k: "lit",
				v: lit,
				q
			});
			lit = "";
		}
	};
	const end = () => {
		flush(false);
		if (has) toks.push({
			t: "word",
			parts
		});
		parts = [];
		has = false;
	};
	let i = 0;
	while (i < s.length) {
		const c = s[i];
		if (c === " " || c === "	" || c === "\n") {
			end();
			i++;
			continue;
		}
		if (c === "#" && !has) break;
		if (c === "'") {
			let j = s.indexOf("'", i + 1);
			if (j < 0) j = s.length;
			flush(false);
			parts.push({
				k: "lit",
				v: s.slice(i + 1, j),
				q: true
			});
			has = true;
			i = j + 1;
			continue;
		}
		if (c === "\"") {
			flush(false);
			has = true;
			i++;
			let buf = "";
			while (i < s.length && s[i] !== "\"") {
				if (s[i] === "\\" && i + 1 < s.length && "\"\\$`".includes(s[i + 1])) {
					buf += s[i + 1];
					i += 2;
					continue;
				}
				if (s[i] === "$") {
					const r = readDollar(s, i);
					if (r) {
						if (buf) {
							parts.push({
								k: "lit",
								v: buf,
								q: true
							});
							buf = "";
						}
						parts.push({
							...r.part,
							q: true
						});
						i = r.end;
						continue;
					}
				}
				buf += s[i++];
			}
			if (buf) parts.push({
				k: "lit",
				v: buf,
				q: true
			});
			i++;
			continue;
		}
		if (c === "\\" && i + 1 < s.length) {
			lit += s[i + 1];
			has = true;
			i += 2;
			continue;
		}
		if (c === "$") {
			const r = readDollar(s, i);
			if (r) {
				flush(false);
				parts.push({
					...r.part,
					q: false
				});
				has = true;
				i = r.end;
				continue;
			}
		}
		if (c === "~" && !has && (i + 1 >= s.length || s[i + 1] === "/" || s[i + 1] === " ")) {
			lit += "\0HOME";
			has = true;
			i++;
			continue;
		}
		let matched = null;
		for (const op of OPS) if (s.startsWith(op, i)) {
			if (op[0] === "2" && has) continue;
			matched = op;
			break;
		}
		if (matched) {
			end();
			toks.push({
				t: "op",
				v: matched
			});
			i += matched.length;
			continue;
		}
		lit += c;
		has = true;
		i++;
	}
	end();
	return toks;
}
PG.lex = lex;
PG.commands = {};
PG.arith = (expr, getVar) => {
	const toks = expr.match(/\d+|[A-Za-z_]\w*|<=|>=|==|!=|&&|\|\||[-+*\/%()<>!]/g) || [];
	let p = 0;
	const prim = () => {
		const t = toks[p++];
		if (t === "(") {
			const v = or();
			p++;
			return v;
		}
		if (t === "-") return -prim();
		if (t === "+") return prim();
		if (t === "!") return prim() ? 0 : 1;
		if (/^\d/.test(t || "")) return Number(t);
		return getVar(t);
	};
	const mul = () => {
		let v = prim();
		while ([
			"*",
			"/",
			"%"
		].includes(toks[p])) {
			const o = toks[p++];
			const r = prim();
			v = o === "*" ? v * r : o === "/" ? r ? Math.trunc(v / r) : 0 : r ? v % r : 0;
		}
		return v;
	};
	const add = () => {
		let v = mul();
		while (["+", "-"].includes(toks[p])) {
			const o = toks[p++];
			const r = mul();
			v = o === "+" ? v + r : v - r;
		}
		return v;
	};
	const cmp = () => {
		let v = add();
		while ([
			"<",
			">",
			"<=",
			">=",
			"==",
			"!="
		].includes(toks[p])) {
			const o = toks[p++];
			const r = add();
			v = {
				"<": v < r,
				">": v > r,
				"<=": v <= r,
				">=": v >= r,
				"==": v === r,
				"!=": v !== r
			}[o] ? 1 : 0;
		}
		return v;
	};
	const and = () => {
		let v = cmp();
		while (toks[p] === "&&") {
			p++;
			const r = cmp();
			v = v && r ? 1 : 0;
		}
		return v;
	};
	const or = () => {
		let v = and();
		while (toks[p] === "||") {
			p++;
			const r = and();
			v = v || r ? 1 : 0;
		}
		return v;
	};
	try {
		return or();
	} catch (e) {
		return 0;
	}
};
PG.suggest = (name) => {
	const hit = Object.keys(PG.commands).filter((n) => n.startsWith(name.slice(0, 2)) || name.startsWith(n.slice(0, 3)))[0];
	return hit ? ` (did you mean "${hit}"? type "help" to list commands)` : " (type \"help\" to list commands)";
};
PG.parseImage = (ref) => {
	let r = ref, tag = "", host = "";
	const at = r.indexOf("@");
	if (at > 0) r = r.slice(0, at);
	const lastSlash = r.lastIndexOf("/");
	const colon = r.lastIndexOf(":");
	if (colon > lastSlash) {
		tag = r.slice(colon + 1);
		r = r.slice(0, colon);
	}
	const parts = r.split("/");
	if (parts.length > 1 && (parts[0].includes(".") || parts[0].includes(":") || parts[0] === "localhost")) host = parts.shift();
	let repo = parts.join("/");
	if (!host && !repo.includes("/")) repo = repo;
	return {
		host,
		repo,
		tag: tag || "latest",
		hadTag: !!tag,
		full: ref
	};
};
PG.normImage = (ref) => {
	const p = PG.parseImage(ref);
	const host = p.host || "docker.io";
	return `${host}/${host === "docker.io" && !p.repo.includes("/") ? "library/" + p.repo : p.repo}:${p.tag}`;
};
PG.CATALOG = {
	nginx: {
		type: "web",
		port: 80,
		page: "<!DOCTYPE html>\n<html>\n<head>\n<title>Welcome to nginx!</title>\n<style>\nhtml { color-scheme: light dark; }\nbody { width: 35em; margin: 0 auto;\nfont-family: Tahoma, Verdana, Arial, sans-serif; }\n</style>\n</head>\n<body>\n<h1>Welcome to nginx!</h1>\n<p>If you see this page, the nginx web server is successfully installed and\nworking. Further configuration is required.</p>\n</body>\n</html>",
		size: 192
	},
	httpd: {
		type: "web",
		port: 80,
		page: "<html><body><h1>It works!</h1></body></html>",
		size: 148
	},
	caddy: {
		type: "web",
		port: 80,
		page: "<!DOCTYPE html><title>Caddy works!</title>",
		size: 50
	},
	redis: {
		type: "tcp",
		port: 6379,
		size: 61
	},
	memcached: {
		type: "tcp",
		port: 11211,
		size: 85
	},
	postgres: {
		type: "tcp",
		port: 5432,
		size: 275,
		requireEnv: ["POSTGRES_PASSWORD", "POSTGRES_HOST_AUTH_METHOD"],
		crashMsg: "Error: Database is uninitialized and superuser password is not specified.\n       You must specify POSTGRES_PASSWORD to a non-empty value for the superuser."
	},
	mysql: {
		type: "tcp",
		port: 3306,
		size: 590,
		requireEnv: [
			"MYSQL_ROOT_PASSWORD",
			"MYSQL_ALLOW_EMPTY_PASSWORD",
			"MYSQL_RANDOM_ROOT_PASSWORD"
		],
		crashMsg: "[ERROR] [Entrypoint]: Database is uninitialized and password option is not specified\n    You need to specify one of MYSQL_ROOT_PASSWORD, MYSQL_ALLOW_EMPTY_PASSWORD and MYSQL_RANDOM_ROOT_PASSWORD"
	},
	mongo: {
		type: "tcp",
		port: 27017,
		size: 880
	},
	rabbitmq: {
		type: "tcp",
		port: 5672,
		size: 230
	},
	busybox: {
		type: "tool",
		size: 4
	},
	alpine: {
		type: "tool",
		size: 8
	},
	ubuntu: {
		type: "tool",
		size: 78
	},
	"curlimages/curl": {
		type: "tool",
		size: 22
	},
	registry: {
		type: "registry",
		port: 5e3,
		size: 25
	},
	"hashicorp/consul": {
		type: "tcp",
		port: 8500,
		size: 180
	},
	traefik: {
		type: "web",
		port: 80,
		page: "404 page not found",
		size: 150
	},
	node: {
		type: "tool",
		size: 1100
	},
	python: {
		type: "tool",
		size: 1e3
	},
	"grafana/grafana": {
		type: "web",
		port: 3e3,
		page: "<a href=\"/login\">Found</a>.",
		size: 400
	},
	"prom/prometheus": {
		type: "web",
		port: 9090,
		page: "<a href=\"/graph\">Found</a>.",
		size: 280
	},
	"kindest/node": {
		type: "system",
		size: 1e3
	},
	"lachlanevenson/k8s-helm": {
		type: "tool",
		size: 60
	},
	"alpine/helm": {
		type: "tool",
		size: 60
	},
	"helm/tiller": {
		type: "system",
		size: 80,
		host: "ghcr.io"
	},
	"kennethreitz/httpbin": {
		type: "web",
		port: 80,
		page: "<!DOCTYPE html><title>httpbin.org</title>",
		size: 120
	}
};
PG.SYSTEM_HOSTS = [
	"registry.k8s.io",
	"k8s.gcr.io",
	"gke.gcr.io",
	"gcr.io",
	"docker.io/kindest",
	"ghcr.io/helm",
	"rancher"
];
PG.PUBLIC_HOSTS = [
	"",
	"docker.io",
	"ghcr.io",
	"quay.io",
	"registry.k8s.io",
	"gcr.io",
	"k8s.gcr.io",
	"gke.gcr.io",
	"mcr.microsoft.com"
];
PG.builtInfo = (meta) => {
	const base = PG.CATALOG[meta.base] || { type: "tool" };
	const info = {
		...base,
		built: true,
		baseName: meta.base,
		env: meta.env || {},
		fs: meta.fs || {},
		workdir: meta.workdir,
		user: meta.user
	};
	const cmdArgv = meta.entrypoint || meta.cmd ? [...meta.entrypoint || [], ...meta.cmd || []] : null;
	info.cmdArgv = cmdArgv;
	if (meta.port) info.port = meta.port;
	const root = PG.WEBROOT[meta.base];
	if (root && meta.fs && meta.fs[root] !== void 0) info.page = meta.fs[root];
	else if (root && meta.fs && meta.fs[root] === void 0 && base.type === "web") info.page = void 0;
	const cls = PG.classifyArgv(cmdArgv);
	if (base.type === "tool" && cls && cls.long && meta.port) {
		info.type = "web";
		info.page = `<h1>simulated app</h1>\n<p>This image's CMD is <code>${(cmdArgv || []).join(" ")}</code>. The playground does not execute application code, so this is a placeholder response on port ${meta.port}.</p>\n`;
	}
	return info;
};
PG.imageInfo = (sim, ref) => {
	const p = PG.parseImage(ref);
	const fullName = (p.host ? p.host + "/" : "docker.io/") + p.repo;
	if (PG.SYSTEM_HOSTS.some((h) => fullName.startsWith(h)) || /^(kindest|rancher)\//.test(p.repo)) return {
		type: "system",
		long: true
	};
	const built = sim.images[p.repo + ":" + p.tag] && !p.host ? sim.images[p.repo + ":" + p.tag] : sim.images[ref] || null;
	if (built && built.meta) return PG.builtInfo(built.meta);
	const fullHost = p.host;
	(fullHost && PG.PUBLIC_HOSTS.includes(fullHost) && fullHost !== "docker.io" ? "" : "") + p.repo;
	if (PG.CATALOG[p.repo]) return {
		...PG.CATALOG[p.repo],
		baseName: p.repo
	};
	const short = p.repo.split("/").slice(-1)[0];
	if (p.host && PG.CATALOG[short] && ["localhost:5001", "k3d-local-registry:5000"].includes(p.host)) return PG.CATALOG[short];
	if (sim.registryHas(p)) {
		const r = sim.registryGet(p);
		if (r && r.meta) return PG.builtInfo(r.meta);
	}
	return null;
};
PG.BASE_TIME = Date.parse("2026-10-14T09:00:00Z");
PG.iso = (t) => new Date(PG.BASE_TIME + t * 1e3).toISOString().replace(/\.\d+Z$/, "Z");
PG.Sim = class {
	constructor(fsSnap) {
		this.clock = 0;
		this.fs = new PG.FS();
		this.fs.stamp = () => PG.BASE_TIME + this.clock * 1e3;
		this.fsRestored = false;
		if (fsSnap && fsSnap.files) {
			this.fs.restore(fsSnap);
			this.fsRestored = true;
		}
		this.listeners = [];
		this.waiters = [];
		this.timer = null;
		this.notifyT = null;
		this.speed = 1;
		this.containers = [];
		this.images = {};
		this.networks = [
			"bridge",
			"host",
			"none"
		];
		this.registries = {};
		this.kubeconfig = {
			contexts: [],
			clusters: [],
			users: [],
			current: ""
		};
		this.clusters = {};
		this.forwards = [];
		this.tokens = {};
		this.trace = [];
		this.log = [];
		this.apiPorts = 0;
		this.shells = [];
		this.seed();
	}
	start(realMs = 250, simDt = .5) {
		this.stop();
		this.timer = setInterval(() => this.advance(simDt * this.speed), realMs);
	}
	stop() {
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
	}
	advance(dt) {
		this.clock += dt;
		for (const c of Object.values(this.clusters)) c.tick(dt);
		const w = this.waiters;
		this.waiters = [];
		for (const x of w) if (this.clock >= x.until || x.shell.aborted) x.resolve();
		else this.waiters.push(x);
		this.notify();
	}
	wait(secs, shell) {
		return new Promise((resolve) => this.waiters.push({
			until: this.clock + secs,
			resolve,
			shell: shell || { aborted: false }
		}));
	}
	waitFor(pred, shell, maxSecs = 600) {
		return new Promise((resolve) => {
			const t0 = this.clock;
			const check = () => {
				if (shell.aborted) return resolve(false);
				if (pred()) return resolve(true);
				if (this.clock - t0 > maxSecs) return resolve(false);
				this.waiters.push({
					until: this.clock + .5,
					resolve: check,
					shell
				});
			};
			check();
		});
	}
	wake() {
		const w = this.waiters;
		this.waiters = [];
		w.forEach((x) => x.resolve());
	}
	onChange(fn) {
		this.listeners.push(fn);
	}
	notify() {
		if (this.notifyT) return;
		this.notifyT = setTimeout(() => {
			this.notifyT = null;
			this.listeners.forEach((f) => {
				try {
					f();
				} catch (e) {
					console.error(e);
				}
			});
		}, 30);
	}
	note(msg) {
		this.log.push({
			t: this.clock,
			msg
		});
		if (this.log.length > 200) this.log.shift();
	}
	traceReq(steps, ok = true) {
		this.trace.push({
			t: this.clock,
			steps,
			ok
		});
		if (this.trace.length > 50) this.trace.shift();
		this.lastTrace = this.trace[this.trace.length - 1];
	}
	container(name) {
		return this.containers.find((c) => c.name === name);
	}
	addContainer(c) {
		c.id = PG.hex(12);
		c.created = this.clock;
		c.status = c.status || "running";
		c.startedAt = this.clock;
		c.ports = c.ports || [];
		c.networks = c.networks || ["bridge"];
		this.containers.push(c);
		return c;
	}
	registryFor(p) {
		const h = p.host || "";
		let c = null;
		if (h.startsWith("k3d-")) c = this.container(h.split(":")[0]);
		else {
			const m = /:(\d+)$/.exec(h);
			if (m) c = this.containers.find((x) => x.kind === "registry" && x.ports.some((q) => q.host === Number(m[1])));
		}
		return c && c.status === "running" ? c : null;
	}
	registryContainer(h) {
		return h ? this.registryFor({ host: h }) : this.containers.find((c) => c.kind === "registry" && c.status === "running");
	}
	registryHas(p) {
		const r = this.registryFor(p);
		if (!r) return false;
		return !!(this.registries[r.name] || {})[p.repo + ":" + p.tag];
	}
	registryGet(p) {
		const r = this.registryFor(p);
		return r ? (this.registries[r.name] || {})[p.repo + ":" + p.tag] : null;
	}
	ensureNetwork(n) {
		if (!this.networks.includes(n)) this.networks.push(n);
	}
	nextApiPort() {
		return 4e4 + Math.floor(Math.random() * 9e3) + this.apiPorts++;
	}
	ctxByName(n) {
		return this.kubeconfig.contexts.find((c) => c.name === n);
	}
	clusterEntry(n) {
		return this.kubeconfig.clusters.find((c) => c.name === n);
	}
	userEntry(n) {
		return this.kubeconfig.users.find((c) => c.name === n);
	}
	addKubeEntries(name, server, userSpec, namespace) {
		const kc = this.kubeconfig;
		kc.clusters = kc.clusters.filter((x) => x.name !== name);
		kc.users = kc.users.filter((x) => x.name !== name);
		kc.contexts = kc.contexts.filter((x) => x.name !== name);
		kc.clusters.push({
			name,
			server
		});
		kc.users.push({
			name,
			auth: userSpec || { kind: "admin" }
		});
		kc.contexts.push({
			name,
			cluster: name,
			user: name,
			namespace: namespace || ""
		});
	}
	removeKubeEntries(name) {
		const kc = this.kubeconfig;
		kc.clusters = kc.clusters.filter((x) => x.name !== name);
		kc.users = kc.users.filter((x) => x.name !== name);
		kc.contexts = kc.contexts.filter((x) => x.name !== name);
		if (kc.current === name) kc.current = "";
	}
	currentCluster(ctxName) {
		const c = this.ctxByName(ctxName || this.kubeconfig.current);
		if (!c) return null;
		return this.clusters[c.cluster] || null;
	}
	seed() {
		this.fs.mkdirp("/home/user");
		this.fs.mkdirp("/home/user/.kube");
		PG.seedGke(this);
		if (!this.fsRestored) PG.seedChart(this);
	}
};
PG.STATE_V = 1;
PG.STATE_SKIP = /* @__PURE__ */ new Set([
	"fs",
	"fsRestored",
	"listeners",
	"waiters",
	"timer",
	"shells",
	"notifyT",
	"speed",
	"lastTrace"
]);
PG.Sim.prototype.snapshotState = function() {
	const sim = {};
	for (const [k, v] of Object.entries(this)) if (!PG.STATE_SKIP.has(k) && k !== "clusters") sim[k] = v;
	const clusters = {};
	for (const [k, c] of Object.entries(this.clusters)) {
		const o = {};
		for (const [ck, cv] of Object.entries(c)) if (ck !== "sim") o[ck] = cv;
		clusters[k] = o;
	}
	return JSON.parse(JSON.stringify({
		v: PG.STATE_V,
		sim,
		clusters
	}));
};
PG.Sim.prototype.restoreState = function(snap) {
	if (!snap || snap.v !== PG.STATE_V || !snap.sim || !snap.clusters) return false;
	for (const [k, v] of Object.entries(snap.sim)) this[k] = v;
	this.clusters = {};
	for (const [k, o] of Object.entries(snap.clusters)) {
		const c = new PG.Cluster(this, o);
		Object.assign(c, o);
		this.clusters[k] = c;
	}
	this.lastTrace = this.trace[this.trace.length - 1];
	return true;
};
PG.KINDS = {
	pods: {
		kind: "Pod",
		api: "v1",
		group: "",
		ns: true,
		names: [
			"pod",
			"pods",
			"po"
		]
	},
	services: {
		kind: "Service",
		api: "v1",
		group: "",
		ns: true,
		names: [
			"service",
			"services",
			"svc"
		]
	},
	endpoints: {
		kind: "Endpoints",
		api: "v1",
		group: "",
		ns: true,
		names: [
			"endpoints",
			"endpoint",
			"ep"
		],
		virtual: true
	},
	namespaces: {
		kind: "Namespace",
		api: "v1",
		group: "",
		ns: false,
		names: [
			"namespace",
			"namespaces",
			"ns"
		]
	},
	nodes: {
		kind: "Node",
		api: "v1",
		group: "",
		ns: false,
		names: [
			"node",
			"nodes",
			"no"
		],
		virtual: true
	},
	configmaps: {
		kind: "ConfigMap",
		api: "v1",
		group: "",
		ns: true,
		names: [
			"configmap",
			"configmaps",
			"cm"
		]
	},
	secrets: {
		kind: "Secret",
		api: "v1",
		group: "",
		ns: true,
		names: ["secret", "secrets"]
	},
	serviceaccounts: {
		kind: "ServiceAccount",
		api: "v1",
		group: "",
		ns: true,
		names: [
			"serviceaccount",
			"serviceaccounts",
			"sa"
		]
	},
	persistentvolumeclaims: {
		kind: "PersistentVolumeClaim",
		api: "v1",
		group: "",
		ns: true,
		names: [
			"persistentvolumeclaim",
			"persistentvolumeclaims",
			"pvc"
		]
	},
	resourcequotas: {
		kind: "ResourceQuota",
		api: "v1",
		group: "",
		ns: true,
		names: [
			"resourcequota",
			"resourcequotas",
			"quota"
		]
	},
	events: {
		kind: "Event",
		api: "v1",
		group: "",
		ns: true,
		names: [
			"event",
			"events",
			"ev"
		],
		virtual: true
	},
	deployments: {
		kind: "Deployment",
		api: "apps/v1",
		group: "apps",
		ns: true,
		names: [
			"deployment",
			"deployments",
			"deploy"
		]
	},
	replicasets: {
		kind: "ReplicaSet",
		api: "apps/v1",
		group: "apps",
		ns: true,
		names: [
			"replicaset",
			"replicasets",
			"rs"
		]
	},
	daemonsets: {
		kind: "DaemonSet",
		api: "apps/v1",
		group: "apps",
		ns: true,
		names: [
			"daemonset",
			"daemonsets",
			"ds"
		]
	},
	ingresses: {
		kind: "Ingress",
		api: "networking.k8s.io/v1",
		group: "networking.k8s.io",
		ns: true,
		names: [
			"ingress",
			"ingresses",
			"ing"
		]
	},
	networkpolicies: {
		kind: "NetworkPolicy",
		api: "networking.k8s.io/v1",
		group: "networking.k8s.io",
		ns: true,
		names: [
			"networkpolicy",
			"networkpolicies",
			"netpol"
		]
	},
	horizontalpodautoscalers: {
		kind: "HorizontalPodAutoscaler",
		api: "autoscaling/v2",
		group: "autoscaling",
		ns: true,
		names: [
			"horizontalpodautoscaler",
			"horizontalpodautoscalers",
			"hpa"
		]
	},
	poddisruptionbudgets: {
		kind: "PodDisruptionBudget",
		api: "policy/v1",
		group: "policy",
		ns: true,
		names: [
			"poddisruptionbudget",
			"poddisruptionbudgets",
			"pdb"
		]
	},
	jobs: {
		kind: "Job",
		api: "batch/v1",
		group: "batch",
		ns: true,
		names: ["job", "jobs"]
	},
	cronjobs: {
		kind: "CronJob",
		api: "batch/v1",
		group: "batch",
		ns: true,
		names: [
			"cronjob",
			"cronjobs",
			"cj"
		]
	},
	roles: {
		kind: "Role",
		api: "rbac.authorization.k8s.io/v1",
		group: "rbac.authorization.k8s.io",
		ns: true,
		names: ["role", "roles"]
	},
	rolebindings: {
		kind: "RoleBinding",
		api: "rbac.authorization.k8s.io/v1",
		group: "rbac.authorization.k8s.io",
		ns: true,
		names: ["rolebinding", "rolebindings"]
	},
	clusterroles: {
		kind: "ClusterRole",
		api: "rbac.authorization.k8s.io/v1",
		group: "rbac.authorization.k8s.io",
		ns: false,
		names: ["clusterrole", "clusterroles"]
	},
	clusterrolebindings: {
		kind: "ClusterRoleBinding",
		api: "rbac.authorization.k8s.io/v1",
		group: "rbac.authorization.k8s.io",
		ns: false,
		names: ["clusterrolebinding", "clusterrolebindings"]
	},
	certificatesigningrequests: {
		kind: "CertificateSigningRequest",
		api: "certificates.k8s.io/v1",
		group: "certificates.k8s.io",
		ns: false,
		names: [
			"certificatesigningrequest",
			"certificatesigningrequests",
			"csr"
		]
	},
	leases: {
		kind: "Lease",
		api: "coordination.k8s.io/v1",
		group: "coordination.k8s.io",
		ns: true,
		names: ["lease", "leases"],
		virtual: true
	}
};
PG.KIND_BY_NAME = {};
for (const [plural, k] of Object.entries(PG.KINDS)) for (const n of k.names) PG.KIND_BY_NAME[n] = plural;
PG.resolveKind = (w) => {
	if (!w) return null;
	w = w.toLowerCase();
	const base = w.split(".")[0];
	return PG.KIND_BY_NAME[w] || PG.KIND_BY_NAME[base] || null;
};
PG.KIND_OF = {};
for (const [p, k] of Object.entries(PG.KINDS)) PG.KIND_OF[k.kind] = p;
PG.tolerates = (taint, tols) => (tols || []).some((t) => {
	if (t.operator === "Exists" && !t.key) return true;
	if (t.key !== taint.key) return false;
	if (t.effect && t.effect !== taint.effect) return false;
	if ((t.operator || "Equal") === "Exists") return true;
	return (t.value || "") === (taint.value || "");
});
PG.selMatch = (sel, labels) => {
	if (!sel) return false;
	const ml = sel.matchLabels || sel;
	return Object.keys(ml).length > 0 && Object.entries(ml).every(([k, v]) => (labels || {})[k] === String(v));
};
PG.Cluster = class {
	constructor(sim, o) {
		this.sim = sim;
		Object.assign(this, {
			id: o.id,
			tool: o.tool,
			entry: o.entry,
			api: o.api,
			k8sVersion: o.k8sVersion || "v1.35.0"
		});
		this.nodes = [];
		this.res = {};
		for (const p of Object.keys(PG.KINDS)) this.res[p] = [];
		this.portMaps = [];
		this.ipN = 1;
		this.svcN = 2;
		this.helm = {
			tiller: false,
			releases: {}
		};
		this.lastHpa = 0;
		this.cronNext = {};
		this.podIpN = {};
	}
	get clock() {
		return this.sim.clock;
	}
	apiUp() {
		if (this.tool === "gke") return true;
		const cp = this.nodes.find((n) => n.role === "control-plane");
		if (!cp) return false;
		const c = this.sim.container(cp.containerName);
		return !!(c && c.status === "running") || this.tool === "gke";
	}
	nodeByName(n) {
		return this.nodes.find((x) => x.name === n);
	}
	list(plural, ns) {
		return this.res[plural].filter((o) => !ns || o.metadata.namespace === ns);
	}
	find(plural, name, ns) {
		return this.res[plural].find((o) => o.metadata.name === name && (!PG.KINDS[plural].ns || o.metadata.namespace === ns));
	}
	mk(plural, name, ns, body = {}) {
		const k = PG.KINDS[plural];
		const t = this.clock;
		const obj = {
			apiVersion: k.api,
			kind: k.kind,
			metadata: {
				name,
				...k.ns ? { namespace: ns } : {},
				uid: PG.hex(8) + "-" + PG.hex(4) + "-" + PG.hex(4) + "-" + PG.hex(12),
				creationTimestamp: PG.iso(t),
				labels: {},
				annotations: {},
				_t: t,
				...body.metadata || {}
			},
			...Object.fromEntries(Object.entries(body).filter(([k2]) => k2 !== "metadata"))
		};
		obj.metadata.name = name;
		if (k.ns) obj.metadata.namespace = ns;
		if (!Object.keys(obj.metadata.labels || {}).length) delete obj.metadata.labels;
		if (!Object.keys(obj.metadata.annotations || {}).length) delete obj.metadata.annotations;
		this.res[plural].push(obj);
		return obj;
	}
	del(plural, obj) {
		const i = this.res[plural].indexOf(obj);
		if (i >= 0) this.res[plural].splice(i, 1);
	}
	emit(obj, type, reason, message) {
		const k = obj.kind || "Pod";
		const last = this.res.events[this.res.events.length - 1];
		if (last && last.kind === k && last.name === obj.metadata.name && last.reason === reason && last.message === message && last.ns === (obj.metadata.namespace || "default")) {
			last.count = (last.count || 1) + 1;
			last.lastT = this.clock;
			return;
		}
		this.res.events.push({
			ns: obj.metadata.namespace || "default",
			kind: k,
			name: obj.metadata.name,
			type,
			reason,
			message,
			t: this.clock,
			lastT: this.clock,
			count: 1
		});
		if (this.res.events.length > 400) this.res.events.shift();
	}
	ensureNs(name) {
		if (!this.find("namespaces", name)) this.mk("namespaces", name, null, {
			spec: {},
			status: { phase: "Active" }
		});
	}
	addNode(o) {
		const n = {
			name: o.name,
			role: o.role,
			containerName: o.containerName || o.name,
			ip: o.ip,
			labels: {
				"kubernetes.io/hostname": o.name,
				"kubernetes.io/os": "linux",
				"kubernetes.io/arch": "arm64",
				...o.role === "control-plane" ? { "node-role.kubernetes.io/control-plane": "" } : {},
				...o.labels || {}
			},
			taints: o.taints || [],
			unschedulable: false,
			ready: true,
			images: {},
			mirror: {},
			createdAt: this.clock,
			version: o.version || this.k8sVersion,
			osImage: o.osImage || "Debian GNU/Linux 12 (bookworm)",
			runtime: o.runtime || "containerd://2.1.3",
			fs: {},
			roleLabel: o.roleLabel
		};
		n.podCidr = "10.244." + this.nodes.length + ".";
		this.nodes.push(n);
		this.mk("leases", n.name, "kube-node-lease", { spec: {
			holderIdentity: n.name,
			renewTime: this.clock
		} });
		return n;
	}
	podOwnerKind(p) {
		return p.metadata._owner ? p.metadata._owner.kind : "";
	}
	newPod(ns, name, labels, spec, owner, extra = {}) {
		const pod = this.mk("pods", name, ns, {
			metadata: {
				labels: { ...labels },
				annotations: extra.annotations || {},
				_owner: owner
			},
			spec: PG.clone(spec),
			status: { phase: "Pending" }
		});
		pod.spec.restartPolicy = pod.spec.restartPolicy || "Always";
		pod.spec.serviceAccountName = pod.spec.serviceAccountName || "default";
		pod.spec.nodeName = pod.spec.nodeName || "";
		pod._sim = {
			stage: "new",
			t0: this.clock,
			logs: [],
			status: "Pending",
			restarts: 0,
			ready: false,
			reqCount: 0
		};
		return pod;
	}
	podStatus(p) {
		if (p.metadata.deletionTimestamp) return "Terminating";
		const sm = p._sim;
		const node = p.spec.nodeName && this.nodeByName(p.spec.nodeName);
		if (node && !node.ready && this.clock - node._downSince > 3) return "Unknown";
		return sm.status;
	}
	podReady(p) {
		return !p.metadata.deletionTimestamp && p._sim.ready;
	}
	matchPods(ns, sel) {
		return this.res.pods.filter((p) => p.metadata.namespace === ns && PG.selMatch(sel, p.metadata.labels) && !p.metadata.deletionTimestamp);
	}
	killPod(p, grace = 2) {
		if (p.metadata.deletionTimestamp) return;
		p.metadata.deletionTimestamp = PG.iso(this.clock);
		p._sim.deleteAt = this.clock + grace;
		this.emit(p, "Normal", "Killing", "Stopping container " + (p.spec.containers[0] || {}).name);
	}
	nodeFree(n) {
		let cpu = 4e3, mem = 16384;
		for (const x of this.res.pods) {
			if (x.spec.nodeName !== n.name || x._sim && x._sim.done) continue;
			const r = PG.podRequests(x.spec);
			cpu -= r.cpu;
			mem -= r.mem;
		}
		return {
			cpu,
			mem
		};
	}
	schedule(p) {
		const spec = p.spec;
		const need = PG.podRequests(spec);
		const short = (n) => {
			const f = this.nodeFree(n);
			return need.cpu > f.cpu ? "cpu" : need.mem > f.mem ? "memory" : null;
		};
		const cands = this.nodes.filter((n) => {
			if (!n.ready || n.unschedulable) return false;
			if (short(n)) return false;
			if (spec.nodeSelector && !Object.entries(spec.nodeSelector).every(([k, v]) => n.labels[k] === v)) return false;
			if (!(n.taints || []).filter((t) => t.effect !== "PreferNoSchedule").every((t) => PG.tolerates(t, spec.tolerations))) return false;
			return true;
		});
		if (!cands.length) {
			const why = [];
			const total = this.nodes.length;
			const sel = this.nodes.filter((n) => spec.nodeSelector && !Object.entries(spec.nodeSelector).every(([k, v]) => n.labels[k] === v)).length;
			const taint = this.nodes.filter((n) => (n.taints || []).some((t) => t.effect !== "PreferNoSchedule" && !PG.tolerates(t, spec.tolerations))).length;
			const unsched = this.nodes.filter((n) => n.unschedulable).length;
			if (sel) why.push(`${sel} node(s) didn't match Pod's node affinity/selector`);
			if (taint) why.push(`${taint} node(s) had untolerated taint`);
			if (unsched) why.push(`${unsched} node(s) were unschedulable`);
			for (const r of ["cpu", "memory"]) {
				const k = this.nodes.filter((n) => n.ready && !n.unschedulable && short(n) === r).length;
				if (k) why.push(`${k} Insufficient ${r}`);
			}
			return { fail: `0/${total} nodes are available: ${why.join(", ") || "no ready nodes"}.` };
		}
		const spread = (n) => this.res.pods.filter((x) => x.spec.nodeName === n.name && !x.metadata.deletionTimestamp).length;
		const same = (n) => this.res.pods.filter((x) => x.spec.nodeName === n.name && x.metadata._owner && p.metadata._owner && x.metadata._owner.name === p.metadata._owner.name).length;
		cands.sort((a, b) => same(a) - same(b) || spread(a) - spread(b) || a.name.localeCompare(b.name));
		return { node: cands[0] };
	}
	imagePlan(pod, node) {
		let delay = .6;
		const secrets = [...pod.spec.imagePullSecrets || []];
		const sa = this.find("serviceaccounts", pod.spec.serviceAccountName || "default", pod.metadata.namespace);
		if (sa) secrets.push(...sa.imagePullSecrets || []);
		for (const c of [...pod.spec.initContainers || [], ...pod.spec.containers]) {
			const p = PG.parseImage(c.image);
			const norm = PG.normImage(c.image);
			if ((c.imagePullPolicy || (p.tag === "latest" ? "Always" : "IfNotPresent")) !== "Always" && node.images[norm]) continue;
			const full = norm.replace(/^docker\.io\//, "docker.io/");
			const isInit = (pod.spec.initContainers || []).includes(c);
			const fail = (reason, msg) => ({
				ok: false,
				init: isInit,
				image: c.image,
				reason: reason || "ErrImagePull",
				msg: `Failed to pull image "${c.image}": ${msg}`
			});
			const hostKey = p.host;
			if (PG.SYSTEM_HOSTS.some((h) => (hostKey ? hostKey + "/" + p.repo : "docker.io/" + p.repo).startsWith(h)) || p.repo.startsWith("kindest/") || p.repo.startsWith("rancher/")) {
				delay = Math.max(delay, 1);
				continue;
			}
			if (hostKey && hostKey.startsWith("localhost")) {
				if (this.tool !== "kind" || !node.mirror[hostKey]) return fail("ErrImagePull", `failed to resolve reference "${hostKey}/${p.repo}:${p.tag}": failed to do request: Head "https://${hostKey}/v2/${p.repo}/manifests/${p.tag}": dial tcp [::1]:${hostKey.split(":")[1]}: connect: connection refused`);
				const reg = this.sim.registryContainer(hostKey);
				if (!reg || !reg.networks.includes("kind")) return fail("ErrImagePull", `failed to do request: Head "http://kind-registry:5000/v2/${p.repo}/manifests/${p.tag}": dial tcp: lookup kind-registry: no such host`);
				if (!this.sim.registryHas(p)) return fail("ErrImagePull", `${hostKey}/${p.repo}:${p.tag}: not found`);
				delay = Math.max(delay, 2);
				continue;
			}
			if (hostKey && hostKey.startsWith("k3d-")) {
				const reg = this.sim.container(hostKey.split(":")[0]);
				if (this.tool !== "k3d" || !reg || reg.status !== "running") return fail("ErrImagePull", `failed to do request: dial tcp: lookup ${hostKey.split(":")[0]}: no such host`);
				if (!this.sim.registryHas(p)) return fail("ErrImagePull", `${hostKey}/${p.repo}:${p.tag}: not found`);
				delay = Math.max(delay, 2);
				continue;
			}
			if (hostKey && !PG.PUBLIC_HOSTS.includes(hostKey)) {
				if (!secrets.some((s) => {
					const sec = this.find("secrets", s.name, pod.metadata.namespace);
					if (!sec || sec.type !== "kubernetes.io/dockerconfigjson") return false;
					return (sec.data && sec.data[".dockerconfigjson"] ? PG.unb64(sec.data[".dockerconfigjson"]) : sec.stringData && sec.stringData[".dockerconfigjson"] || "").includes(hostKey);
				})) return fail("ErrImagePull", `rpc error: code = Unknown desc = failed to pull and unpack image "${hostKey}/${p.repo}:${p.tag}": failed to resolve reference: pull access denied, repository does not exist or may require authorization: authorization failed: no basic auth credentials`);
				delay = Math.max(delay, 3);
				continue;
			}
			if (!(PG.CATALOG[p.repo] && (!PG.CATALOG[p.repo].host || PG.CATALOG[p.repo].host === (hostKey || "docker.io")))) return fail("ErrImagePull", `rpc error: code = Unknown desc = failed to pull and unpack image "${full}": failed to resolve reference "${full}": pull access denied, repository does not exist or may require authorization: server message: insufficient_scope: authorization failed`);
			delay = Math.max(delay, 1 + Math.min(5, (PG.CATALOG[p.repo].size || 50) / 150));
		}
		return {
			ok: true,
			delay
		};
	}
	podEnvNames(pod) {
		const c = pod.spec.containers[0] || {};
		const names = (c.env || []).map((e) => e.name);
		const missing = [];
		for (const e of c.envFrom || []) {
			if (e.configMapRef) {
				const cm = this.find("configmaps", e.configMapRef.name, pod.metadata.namespace);
				if (cm) names.push(...Object.keys(cm.data || {}));
				else if (!e.configMapRef.optional) missing.push(`configmap "${e.configMapRef.name}" not found`);
			}
			if (e.secretRef) {
				const s = this.find("secrets", e.secretRef.name, pod.metadata.namespace);
				if (s) names.push(...Object.keys(s.data || {}), ...Object.keys(s.stringData || {}));
				else if (!e.secretRef.optional) missing.push(`secret "${e.secretRef.name}" not found`);
			}
		}
		for (const e of c.env || []) {
			const k = e.valueFrom && e.valueFrom.secretKeyRef;
			if (k && !k.optional) {
				const s = this.find("secrets", k.name, pod.metadata.namespace);
				if (!s) missing.push(`secret "${k.name}" not found`);
				else if (!((s.data || {})[k.key] !== void 0 || (s.stringData || {})[k.key] !== void 0)) missing.push(`couldn't find key ${k.key} in Secret ${pod.metadata.namespace}/${k.name}`);
			}
		}
		return {
			names,
			missing
		};
	}
	volumeProblem(pod) {
		for (const v of pod.spec.volumes || []) {
			if (v.configMap && !v.configMap.optional && !this.find("configmaps", v.configMap.name, pod.metadata.namespace)) return `MountVolume.SetUp failed for volume "${v.name}" : configmap "${v.configMap.name}" not found`;
			if (v.secret && !v.secret.optional && !this.find("secrets", v.secret.secretName, pod.metadata.namespace)) return `MountVolume.SetUp failed for volume "${v.name}" : secret "${v.secret.secretName}" not found`;
			if (v.persistentVolumeClaim && !this.find("persistentvolumeclaims", v.persistentVolumeClaim.claimName, pod.metadata.namespace)) return `persistentvolumeclaim "${v.persistentVolumeClaim.claimName}" not found`;
		}
		return null;
	}
	runsCommand(c, info) {
		let argv = [...c.command || [], ...c.args || []];
		if (!argv.length && info && info.cmdArgv) argv = info.cmdArgv;
		else if (!c.command && c.args && c.args.length && info && info.cmdArgv && info.cmdArgv.length) argv = [...info.cmdArgv.slice(0, info.cmdArgv.length), ...c.args];
		if (!argv.length) return null;
		if (info && info.built) return PG.classifyArgv(argv);
		const joined = argv.join(" ");
		if (/(^|\s)sleep\s+\d{3,}/.test(joined) || /\bsleep\s+infinity\b/.test(joined) || /tail -f/.test(joined)) return { long: true };
		const m = /echo\s+(.*?)(?:\s*$|;|\|)/.exec(joined.replace(/^sh -c\s+/, ""));
		return {
			long: false,
			out: m ? m[1].replace(/^["']|["']$/g, "") : ""
		};
	}
	stepPod(p, dt) {
		const sm = p._sim;
		const clock = this.clock;
		if (p.metadata.deletionTimestamp) {
			if (clock >= sm.deleteAt) this.del("pods", p);
			return;
		}
		if (!p.spec.nodeName) {
			const r = this.schedule(p);
			if (r.fail) {
				sm.status = "Pending";
				if (!sm.failedSched || clock - sm.failedSched > 20) {
					this.emit(p, "Warning", "FailedScheduling", r.fail);
					sm.failedSched = clock;
				}
				return;
			}
			p.spec.nodeName = r.node.name;
			sm.stage = "scheduled";
			sm.t0 = clock;
			sm.status = "ContainerCreating";
			this.emit(p, "Normal", "Scheduled", `Successfully assigned ${p.metadata.namespace}/${p.metadata.name} to ${r.node.name}`);
			return;
		}
		const node = this.nodeByName(p.spec.nodeName);
		if (!node) {
			this.del("pods", p);
			return;
		}
		if (!node.ready) {
			sm.ready = false;
			if (clock - node._downSince > 9 && !["Node", "DaemonSet"].includes(this.podOwnerKind(p))) this.del("pods", p);
			return;
		}
		if (sm.stage === "scheduled" || sm.stage === "pulling") {
			sm.stage = "pulling";
			const vp = this.volumeProblem(p);
			if (vp) {
				sm.status = "ContainerCreating";
				if (!sm.volWarn || clock - sm.volWarn > 15) {
					this.emit(p, "Warning", "FailedMount", vp);
					sm.volWarn = clock;
				}
				return;
			}
			if (!sm.plan || !sm.plan.ok && clock >= (sm.nextCheck || 0)) {
				const wasFail = sm.plan && !sm.plan.ok;
				sm.plan = this.imagePlan(p, node);
				sm.planAt = clock;
				if (sm.plan.ok && !wasFail) this.emit(p, "Normal", "Pulling", `Pulling image "${p.spec.containers[0].image}"`);
				if (!sm.plan.ok) {
					sm.failCount = (sm.failCount || 0) + 1;
					this.emit(p, "Warning", "Failed", sm.plan.msg);
					this.emit(p, "Warning", "Failed", "Error: ErrImagePull");
					this.emit(p, "Normal", "BackOff", `Back-off pulling image "${sm.plan.image}"`);
					sm.nextCheck = clock + 10;
					sm.failAt = clock;
				} else sm.planAt = clock;
			}
			if (!sm.plan.ok) {
				sm.status = (sm.plan.init ? "Init:" : "") + (clock - sm.failAt < 4 ? "ErrImagePull" : "ImagePullBackOff");
				return;
			}
			if (clock - sm.planAt < sm.plan.delay) {
				sm.status = "ContainerCreating";
				return;
			}
			for (const x of this.podContainerSet(p)) node.images[PG.normImage(x.c.image)] = true;
			const env = this.podEnvNames(p);
			if (env.missing.length) {
				sm.status = "CreateContainerConfigError";
				if (!sm.cfgWarn || clock - sm.cfgWarn > 10) {
					this.emit(p, "Warning", "Failed", "Error: " + env.missing[0]);
					sm.cfgWarn = clock;
				}
				return;
			}
			for (const x of this.podContainerSet(p)) {
				this.emit(p, "Normal", "Pulled", `Successfully pulled image "${x.c.image}"`);
				this.emit(p, "Normal", "Created", "Created container " + x.c.name);
				if (!x.init) this.emit(p, "Normal", "Started", "Started container " + x.c.name);
			}
			p.status.hostIP = node.ip;
			p.status.podIP = this.allocPodIp(node);
			p.status.startTime = PG.iso(clock);
			const inits = p.spec.initContainers || [];
			if (inits.length) {
				sm.stage = "init";
				sm.initIdx = 0;
				sm.initAt = clock;
				sm.status = `Init:0/${inits.length}`;
				return;
			}
			this.startContainers(p);
			return;
		}
		if (sm.stage === "init") {
			this.stepInit(p);
			return;
		}
		if (sm.stage === "running") {
			this.stepRunning(p);
			return;
		}
	}
	allocPodIp(node) {
		this.podIpN[node.name] = (this.podIpN[node.name] || 1) + 1;
		return (this.tool === "k3d" ? "10.42." : this.tool === "gke" ? "10.20." : "10.244.") + this.nodes.indexOf(node) + "." + this.podIpN[node.name];
	}
	startLogs(p, c) {
		const info = PG.imageInfo(this.sim, (c || p.spec.containers[0]).image) || {};
		const t = PG.iso(this.clock).replace("T", " ").replace("Z", "");
		if (info.type === "web" && info.port === 80) return [
			"/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration",
			"/docker-entrypoint.sh: Configuration complete; ready for start up",
			`${t.replace(/-/g, "/")} [notice] 1#1: nginx/1.27.5`,
			`${t.replace(/-/g, "/")} [notice] 1#1: start worker processes`
		];
		if (info.port === 6379) return ["Ready to accept connections tcp"];
		if (info.port === 5432) return ["PostgreSQL init process complete; ready for start up.", "database system is ready to accept connections"];
		return [];
	}
	tick(dt) {
		for (const n of this.nodes) {
			const c = this.sim.container(n.containerName);
			const up = this.tool === "gke" ? n.ready : !!(c && c.status === "running");
			if (up && !n.ready) {
				n.ready = true;
				n.taints = n.taints.filter((t) => t.key !== "node.kubernetes.io/unreachable");
				this.sim.note(`node ${n.name} is Ready again`);
			}
			if (!up && n.ready) {
				n.ready = false;
				n._downSince = this.clock;
				n.taints.push({
					key: "node.kubernetes.io/unreachable",
					effect: "NoExecute"
				});
				this.sim.note(`node ${n.name} went NotReady`);
			}
			if (n.ready) {
				const l = this.find("leases", n.name, "kube-node-lease");
				if (l) l.spec.renewTime = this.clock;
			}
		}
		if (!this.apiUp()) return;
		for (const ns of [...this.res.namespaces]) if (ns._deleteAt && this.clock >= ns._deleteAt) {
			for (const p of Object.keys(PG.KINDS)) if (PG.KINDS[p].ns && !PG.KINDS[p].virtual) this.res[p] = this.res[p].filter((o) => o.metadata.namespace !== ns.metadata.name);
			this.del("namespaces", ns);
		}
		for (const s of this.statics || []) if (!this.res.pods.find((p) => p.metadata.name === s.name && p.metadata.namespace === s.ns)) {
			const pod = this.newPod(s.ns, s.name, {
				component: s.component,
				tier: "control-plane"
			}, {
				containers: [{
					name: s.component,
					image: s.image
				}],
				tolerations: [{ operator: "Exists" }],
				nodeName: s.node,
				priorityClassName: "system-node-critical"
			}, {
				kind: "Node",
				name: s.node
			});
			pod._sim.stage = "scheduled";
			pod._sim.t0 = this.clock;
			pod._sim.status = "ContainerCreating";
		}
		this.tickDaemonSets();
		this.tickDeployments();
		this.tickJobs();
		this.tickHpa();
		for (const p of [...this.res.pods]) this.stepPod(p, dt);
		for (const c of this.res.persistentvolumeclaims) if (!c.status || c.status.phase !== "Bound") c.status = { phase: "Bound" };
	}
	eligible(spec, n) {
		if (!n.ready) return false;
		if (spec.nodeSelector && !Object.entries(spec.nodeSelector).every(([k, v]) => n.labels[k] === v)) return false;
		return (n.taints || []).filter((t) => t.effect !== "PreferNoSchedule" && t.key !== "node.kubernetes.io/unreachable").every((t) => PG.tolerates(t, spec.tolerations));
	}
	tickDaemonSets() {
		for (const ds of this.res.daemonsets) {
			ds.spec.selector;
			const mine = this.res.pods.filter((p) => p.metadata._owner && p.metadata._owner.kind === "DaemonSet" && p.metadata._owner.name === ds.metadata.name && p.metadata.namespace === ds.metadata.namespace && !p.metadata.deletionTimestamp);
			let desired = 0;
			for (const n of this.nodes) {
				if (!this.eligible(ds.spec.template.spec, n)) continue;
				desired++;
				if (!mine.find((p) => p.spec.nodeName === n.name)) {
					const pod = this.newPod(ds.metadata.namespace, ds.metadata.name + "-" + PG.rnd(5), ds.spec.template.metadata.labels, {
						...ds.spec.template.spec,
						nodeName: n.name
					}, {
						kind: "DaemonSet",
						name: ds.metadata.name
					});
					pod._sim.stage = "scheduled";
					pod._sim.t0 = this.clock;
					pod._sim.status = "ContainerCreating";
				}
			}
			for (const p of mine) if (!this.nodeByName(p.spec.nodeName)) this.del("pods", p);
			const ready = mine.filter((p) => p._sim.ready).length;
			ds.status = {
				desiredNumberScheduled: desired,
				currentNumberScheduled: mine.length,
				numberReady: ready,
				numberAvailable: ready,
				updatedNumberScheduled: mine.length
			};
		}
	}
	depHash(dep) {
		return PG.hash(JSON.stringify(dep.spec.template), 12).replace(/[a-f]/g, (c) => "bcdfgh"["abcdef".indexOf(c)]).slice(0, 9);
	}
	tickDeployments() {
		for (const dep of [...this.res.deployments]) {
			const ns = dep.metadata.namespace;
			const name = dep.metadata.name;
			const desired = dep.spec.replicas === void 0 ? 1 : dep.spec.replicas;
			if (dep.spec.paused && this.res.replicasets.some((r) => r.metadata._owner && r.metadata._owner.name === name && r.metadata.namespace === ns)) {
				const live = this.res.pods.filter((p) => p.metadata._owner && p.metadata._owner.kind === "ReplicaSet" && p.metadata.namespace === ns && p.metadata._owner.name.startsWith(name + "-") && !p.metadata.deletionTimestamp);
				dep.status = {
					...dep.status || {},
					replicas: live.length,
					readyReplicas: live.filter((p) => p._sim.ready).length,
					availableReplicas: live.filter((p) => p._sim.ready).length
				};
				continue;
			}
			const hash = this.depHash(dep);
			let rss = this.res.replicasets.filter((r) => r.metadata._owner && r.metadata._owner.name === name && r.metadata.namespace === ns);
			let cur = rss.find((r) => r._hash === hash);
			if (!cur) {
				const rev = Math.max(0, ...rss.map((r) => +r.metadata.annotations["deployment.kubernetes.io/revision"])) + 1;
				const tl = {
					...dep.spec.template.metadata.labels || {},
					"pod-template-hash": hash
				};
				cur = this.mk("replicasets", name + "-" + hash, ns, {
					metadata: {
						labels: tl,
						annotations: {
							"deployment.kubernetes.io/revision": String(rev),
							"deployment.kubernetes.io/desired-replicas": String(desired)
						},
						_owner: {
							kind: "Deployment",
							name
						}
					},
					spec: {
						replicas: rss.length ? 0 : desired,
						selector: { matchLabels: {
							...dep.spec.selector.matchLabels || {},
							"pod-template-hash": hash
						} },
						template: {
							metadata: { labels: tl },
							spec: dep.spec.template.spec
						}
					},
					status: {}
				});
				cur._hash = hash;
				cur._template = PG.clone(dep.spec.template);
				cur._deployed = this.clock;
				rss.push(cur);
				this.emit(dep, "Normal", "ScalingReplicaSet", `Scaled up replica set ${cur.metadata.name} from 0 to ${cur.spec.replicas}`);
			}
			const old = rss.filter((r) => r !== cur);
			const strat = dep.spec.strategy || {};
			const ru = strat.rollingUpdate || {};
			const parse = (v, def, up) => {
				if (v === void 0 || v === null) v = def;
				if (typeof v === "string" && v.endsWith("%")) {
					const f = parseFloat(v) / 100 * desired;
					return up ? Math.ceil(f) : Math.floor(f);
				}
				return Number(v);
			};
			const maxSurge = parse(ru.maxSurge, "25%", true), maxUnavail = parse(ru.maxUnavailable, "25%", false);
			const podsOf = (r) => this.res.pods.filter((p) => p.metadata._owner && p.metadata._owner.kind === "ReplicaSet" && p.metadata._owner.name === r.metadata.name && p.metadata.namespace === ns && !p.metadata.deletionTimestamp);
			const oldActive = old.filter((r) => r.spec.replicas > 0);
			if (!oldActive.length || strat.type === "Recreate") {
				if (strat.type === "Recreate" && oldActive.length) {
					oldActive.forEach((r) => r.spec.replicas = 0);
					if (old.some((r) => podsOf(r).length)) {} else cur.spec.replicas = desired;
				} else cur.spec.replicas = desired;
			} else {
				const total = rss.reduce((a, r) => a + r.spec.replicas, 0);
				const canUp = desired + maxSurge - total;
				if (canUp > 0 && cur.spec.replicas < desired) cur.spec.replicas += Math.min(canUp, desired - cur.spec.replicas);
				let canDown = rss.reduce((a, r) => a + podsOf(r).filter((p) => p._sim.ready).length, 0) - (desired - maxUnavail);
				for (const r of oldActive) {
					const unready = podsOf(r).filter((p) => !p._sim.ready).length;
					const n = Math.min(r.spec.replicas, unready);
					if (n > 0) r.spec.replicas -= n;
				}
				for (const r of old) {
					if (canDown <= 0) break;
					const n = Math.min(r.spec.replicas, canDown);
					r.spec.replicas -= n;
					canDown -= n;
				}
			}
			for (const r of rss) {
				const mine = podsOf(r);
				if (mine.length < r.spec.replicas) for (let i = mine.length; i < r.spec.replicas; i++) {
					const pn = r.metadata.name + "-" + PG.rnd(5);
					const adm = this.admitPod(ns, r._template.spec, pn);
					if (adm) {
						if (!r._admWarn || this.clock - r._admWarn > 10) {
							this.emit(r, "Warning", "FailedCreate", "Error creating: " + adm);
							r._admWarn = this.clock;
						}
						break;
					}
					this.newPod(ns, pn, r.spec.template.metadata.labels, r._template.spec, {
						kind: "ReplicaSet",
						name: r.metadata.name
					}, { annotations: r._template.metadata.annotations });
				}
				else if (mine.length > r.spec.replicas) {
					const sorted = [...mine].sort((a, b) => a._sim.ready - b._sim.ready || b.metadata._t - a.metadata._t);
					for (const p of sorted.slice(0, mine.length - r.spec.replicas)) this.killPod(p);
				}
				const rp = podsOf(r);
				r.status = {
					replicas: r.spec.replicas,
					readyReplicas: rp.filter((p) => p._sim.ready).length,
					availableReplicas: rp.filter((p) => p._sim.ready).length
				};
			}
			const allPods = rss.flatMap(podsOf);
			dep.status = {
				_updatedReady: podsOf(cur).filter((p) => p._sim.ready).length,
				replicas: allPods.length,
				updatedReplicas: podsOf(cur).length,
				readyReplicas: allPods.filter((p) => p._sim.ready).length,
				availableReplicas: allPods.filter((p) => p._sim.ready).length,
				observedGeneration: 1
			};
			const dead = old.filter((r) => r.spec.replicas === 0 && !podsOf(r).length).sort((a, b) => a._deployed - b._deployed);
			while (dead.length > 10) this.del("replicasets", dead.shift());
		}
		for (const r of [...this.res.replicasets]) if (!this.find("deployments", r.metadata._owner.name, r.metadata.namespace)) {
			r.spec.replicas = 0;
			for (const p of this.res.pods.filter((p) => p.metadata._owner && p.metadata._owner.name === r.metadata.name && p.metadata.namespace === r.metadata.namespace)) this.killPod(p);
			if (!this.res.pods.some((p) => p.metadata._owner && p.metadata._owner.name === r.metadata.name)) this.del("replicasets", r);
		}
	}
	tickJobs() {
		for (const cj of this.res.cronjobs) {
			const every = /^\*\/(\d+) /.exec(cj.spec.schedule) ? +RegExp.$1 * 60 : /^\* \* \* \* \*/.test(cj.spec.schedule) ? 60 : 3600;
			const key = cj.metadata.namespace + "/" + cj.metadata.name;
			if (this.cronNext[key] === void 0) this.cronNext[key] = this.clock + every;
			if (this.clock >= this.cronNext[key] && !cj.spec.suspend) {
				this.cronNext[key] += every;
				const n = cj._n = (cj._n || 0) + 1;
				this.mk("jobs", `${cj.metadata.name}-${29e6 + n}`, cj.metadata.namespace, {
					metadata: { _owner: {
						kind: "CronJob",
						name: cj.metadata.name
					} },
					spec: PG.clone(cj.spec.jobTemplate.spec),
					status: {}
				});
				cj.status = { lastScheduleTime: PG.iso(this.clock) };
			}
		}
		for (const j of this.res.jobs) {
			const ns = j.metadata.namespace;
			const mine = this.res.pods.filter((p) => p.metadata._owner && p.metadata._owner.kind === "Job" && p.metadata._owner.name === j.metadata.name && p.metadata.namespace === ns);
			if (j.status.succeeded) continue;
			if (!mine.length) {
				const lab = {
					"job-name": j.metadata.name,
					"controller-uid": j.metadata.uid.slice(0, 8),
					...j.spec.template.metadata && j.spec.template.metadata.labels || {}
				};
				this.newPod(ns, j.metadata.name + "-" + PG.rnd(5), lab, {
					...j.spec.template.spec,
					restartPolicy: j.spec.template.spec.restartPolicy || "Never"
				}, {
					kind: "Job",
					name: j.metadata.name
				});
				j.status.active = 1;
				j._started = this.clock;
			} else if (mine.some((p) => p._sim.status === "Completed" && p.status.phase === "Succeeded")) {
				j.status = {
					succeeded: 1,
					completionTime: PG.iso(this.clock)
				};
				j._dur = this.clock - (j._started || j.metadata._t);
			}
		}
	}
	metricsServer() {
		return this.res.deployments.some((d) => d.metadata.name === "metrics-server");
	}
	depLoad(dep) {
		const total = dep._load;
		const reps = Math.max(1, dep.status ? dep.status.readyReplicas || 1 : 1);
		return total === void 0 ? 5 : total / reps;
	}
	tickHpa() {
		if (this.clock - this.lastHpa < 5) return;
		this.lastHpa = this.clock;
		for (const h of this.res.horizontalpodautoscalers) {
			const ref = h.spec.scaleTargetRef;
			const dep = this.find("deployments", ref.name, h.metadata.namespace);
			if (!dep) {
				h.status = {
					currentReplicas: 0,
					desiredReplicas: 0
				};
				continue;
			}
			const req = (((dep.spec.template.spec.containers[0] || {}).resources || {}).requests || {}).cpu;
			const target = ((h.spec.metrics || [])[0] || { resource: { target: { averageUtilization: 80 } } }).resource.target.averageUtilization;
			const cur = dep.spec.replicas === void 0 ? 1 : dep.spec.replicas;
			if (!req || !this.metricsServer()) {
				h.status = {
					currentReplicas: cur,
					desiredReplicas: cur,
					_util: null,
					_why: !this.metricsServer() ? "FailedGetResourceMetric: unable to get metrics (metrics-server not installed)" : "FailedGetResourceMetric: missing request for cpu in container"
				};
				continue;
			}
			const util = Math.round(dep._load === void 0 ? 5 : dep._load / Math.max(1, cur));
			let want = Math.ceil(cur * util / target);
			want = Math.max(h.spec.minReplicas || 1, Math.min(h.spec.maxReplicas, want));
			if (want > cur) {
				dep.spec.replicas = want;
				h._lastScale = this.clock;
				this.emit(h, "Normal", "SuccessfulRescale", `New size: ${want}; reason: cpu resource utilization (percentage of request) above target`);
			} else if (want < cur && this.clock - (h._lastScale || 0) > 30) {
				dep.spec.replicas = Math.max(want, cur - Math.max(1, Math.floor(cur / 2)));
				h._lastScale = this.clock;
				this.emit(h, "Normal", "SuccessfulRescale", `New size: ${dep.spec.replicas}; reason: All metrics below target`);
			}
			h.status = {
				currentReplicas: cur,
				desiredReplicas: dep.spec.replicas === void 0 ? 1 : dep.spec.replicas,
				_util: util
			};
		}
	}
	allocClusterIP() {
		this.svcN++;
		return `10.96.${Math.floor(this.svcN / 250)}.${this.svcN % 250 + 2}`;
	}
	endpointsOf(svc) {
		const sel = svc.spec.selector;
		if (!sel || !Object.keys(sel).length) return [];
		const out = [];
		for (const p of this.res.pods.filter((p) => p.metadata.namespace === svc.metadata.namespace && PG.selMatch(sel, p.metadata.labels))) {
			if (!this.podReady(p) || !p.status.podIP) continue;
			for (const sp of svc.spec.ports || []) {
				let tp = sp.targetPort === void 0 ? sp.port : sp.targetPort;
				if (typeof tp === "string") {
					const cp = (p.spec.containers[0].ports || []).find((x) => x.name === tp);
					tp = cp ? cp.containerPort : (PG.imageInfo(this.sim, p.spec.containers[0].image) || {}).port || sp.port;
				}
				out.push({
					ip: p.status.podIP,
					port: tp,
					pod: p,
					svcPort: sp.port
				});
			}
		}
		return out;
	}
	allocNodePort() {
		let p;
		do
			p = 3e4 + Math.floor(Math.random() * 2700);
		while (this.res.services.some((s) => (s.spec.ports || []).some((x) => x.nodePort === p)));
		return p;
	}
	normalizeService(svc) {
		const s = svc.spec;
		s.type = s.type || "ClusterIP";
		s.clusterIP = s.clusterIP || this.allocClusterIP();
		s.ports = (s.ports || []).map((p) => ({
			protocol: "TCP",
			...p
		}));
		s.sessionAffinity = "None";
		if (s.type === "NodePort" || s.type === "LoadBalancer") {
			for (const p of s.ports) if (!p.nodePort) p.nodePort = this.allocNodePort();
		}
		if (s.type === "LoadBalancer") {
			const internal = (svc.metadata.annotations || {})["networking.gke.io/load-balancer-type"] === "Internal";
			svc.status = { loadBalancer: this.tool === "k3d" ? { ingress: this.nodes.map((n) => ({ ip: n.ip })) } : this.tool === "gke" ? { ingress: [{
				ip: internal ? "10.140.2." + (10 + this.svcN % 200) : "34.89." + this.svcN % 250 + "." + this.svcN * 7 % 250,
				ipMode: "VIP"
			}] } : { pending: true } };
		}
		return svc;
	}
	findServiceByHost(host, fromNs) {
		const parts = host.replace(/\.svc\.cluster\.local\.?$/, "").replace(/\.svc$/, "").split(".");
		const name = parts[0];
		const ns = parts[1] || fromNs;
		return this.find("services", name, ns) || null;
	}
	identityOf(user) {
		return user;
	}
	authorize(id, verb, resource, ns, sub) {
		if (!id) return true;
		if ((id.groups || []).includes("system:masters")) return true;
		const group = (PG.KINDS[resource] || {}).group || "";
		const matches = (rule) => {
			const okV = (rule.verbs || []).some((v) => v === "*" || v === verb);
			const rs = rule.resources || [];
			const full = sub ? resource + "/" + sub : resource;
			const okR = rs.some((r) => r === "*" || r === full || !sub && r === resource);
			const okG = (rule.apiGroups || [""]).some((g) => g === "*" || g === group);
			return okV && okR && okG;
		};
		const subjMatch = (s) => s.kind === "User" && s.name === id.user || s.kind === "Group" && (id.groups || []).includes(s.name) || s.kind === "ServiceAccount" && id.user === `system:serviceaccount:${s.namespace}:${s.name}`;
		const rulesOf = (ref) => {
			const r = ref.kind === "ClusterRole" ? this.find("clusterroles", ref.name) : this.find("roles", ref.name, ref._ns);
			return r ? r.rules || [] : [];
		};
		for (const b of this.res.clusterrolebindings) if ((b.subjects || []).some(subjMatch) && rulesOf(b.roleRef).some(matches)) return true;
		if (ns) {
			for (const b of this.res.rolebindings.filter((b) => b.metadata.namespace === ns)) if ((b.subjects || []).some(subjMatch) && rulesOf({
				...b.roleRef,
				_ns: ns
			}).some(matches)) return true;
		}
		return false;
	}
};
PG.BUILTIN_ROLES = () => {
	const ro = [
		"get",
		"list",
		"watch"
	], rw = [
		...ro,
		"create",
		"update",
		"patch",
		"delete",
		"deletecollection"
	];
	const core = [
		"pods",
		"pods/log",
		"services",
		"endpoints",
		"configmaps",
		"persistentvolumeclaims",
		"serviceaccounts",
		"events",
		"resourcequotas",
		"namespaces"
	];
	const apps = {
		apiGroups: ["apps"],
		resources: [
			"deployments",
			"replicasets",
			"daemonsets"
		]
	}, batch = {
		apiGroups: ["batch"],
		resources: ["jobs", "cronjobs"]
	}, net = {
		apiGroups: ["networking.k8s.io"],
		resources: ["ingresses", "networkpolicies"]
	}, asc = {
		apiGroups: ["autoscaling"],
		resources: ["horizontalpodautoscalers"]
	}, pol = {
		apiGroups: ["policy"],
		resources: ["poddisruptionbudgets"]
	};
	const rbac = {
		apiGroups: ["rbac.authorization.k8s.io"],
		resources: ["roles", "rolebindings"]
	};
	const viewRules = [
		{
			apiGroups: [""],
			resources: core,
			verbs: ro
		},
		{
			...apps,
			verbs: ro
		},
		{
			...batch,
			verbs: ro
		},
		{
			...net,
			verbs: ro
		},
		{
			...asc,
			verbs: ro
		},
		{
			...pol,
			verbs: ro
		}
	];
	const editRules = [
		{
			apiGroups: [""],
			resources: [
				...core.filter((x) => x !== "namespaces" && x !== "events"),
				"secrets",
				"pods/exec",
				"pods/portforward",
				"serviceaccounts/token"
			],
			verbs: rw
		},
		{
			apiGroups: [""],
			resources: ["events", "namespaces"],
			verbs: ro
		},
		{
			...apps,
			verbs: rw
		},
		{
			...batch,
			verbs: rw
		},
		{
			...net,
			verbs: rw
		},
		{
			...asc,
			verbs: rw
		},
		{
			...pol,
			verbs: rw
		}
	];
	return {
		view: viewRules,
		edit: editRules,
		admin: [...editRules, {
			...rbac,
			verbs: rw
		}],
		"cluster-admin": [{
			apiGroups: ["*"],
			resources: ["*"],
			verbs: ["*"]
		}]
	};
};
PG.seedRoles = (cl) => {
	for (const [n, rules] of Object.entries(PG.BUILTIN_ROLES())) cl.mk("clusterroles", n, null, { rules });
	cl.mk("clusterrolebindings", "cluster-admin", null, {
		roleRef: {
			kind: "ClusterRole",
			name: "cluster-admin"
		},
		subjects: [{
			kind: "Group",
			name: "system:masters"
		}]
	});
};
PG.memMi = (q) => {
	if (q === void 0 || q === null) return null;
	const m = /^([\d.]+)\s*(Ki|Mi|Gi|K|M|G|k)?$/.exec(String(q));
	if (!m) return null;
	const n = parseFloat(m[1]);
	const u = m[2] || "";
	return u === "Ki" || u === "K" || u === "k" ? n / 1024 : u === "Gi" || u === "G" ? n * 1024 : u === "Mi" || u === "M" ? n : n / 1048576;
};
PG.BASE_MEM = {
	nginx: 8,
	httpd: 12,
	caddy: 20,
	redis: 10,
	memcached: 6,
	postgres: 90,
	mysql: 380,
	mongo: 220,
	rabbitmq: 120,
	node: 60,
	python: 30,
	registry: 20,
	"grafana/grafana": 110,
	"prom/prometheus": 150,
	traefik: 40,
	busybox: 1,
	alpine: 1,
	ubuntu: 2
};
PG.baseMemOf = (image, info) => {
	const repo = info.baseName || PG.parseImage(image).repo;
	return PG.BASE_MEM[repo] !== void 0 ? PG.BASE_MEM[repo] : info.type === "tool" ? 2 : 25;
};
PG.webRootDir = (info) => {
	const f = PG.WEBROOT[info.baseName];
	return f ? f.slice(0, f.lastIndexOf("/")) : null;
};
PG.cpuM = (q) => {
	if (q === void 0 || q === null) return 0;
	const m = /^([\d.]+)(m)?$/.exec(String(q));
	return m ? parseFloat(m[1]) * (m[2] ? 1 : 1e3) : 0;
};
PG.podRequests = (spec) => {
	let cpu = 0, mem = 0;
	for (const c of spec.containers || []) {
		const r = (c.resources || {}).requests || {};
		cpu += PG.cpuM(r.cpu);
		mem += PG.memMi(r.memory) || 0;
	}
	return {
		cpu,
		mem
	};
};
PG.STATUS_RANK = {
	CrashLoopBackOff: 6,
	OOMKilled: 5,
	Error: 4,
	CreateContainerConfigError: 4,
	ContainerCreating: 2,
	Completed: 1,
	Running: 0
};
Object.assign(PG.Cluster.prototype, {
	podContainerSet(p) {
		return [...(p.spec.initContainers || []).map((c) => ({
			c,
			init: true
		})), ...p.spec.containers.map((c) => ({
			c,
			init: false
		}))];
	},
	webStatus(p, c, info, path) {
		const root = PG.webRootDir(info);
		if (root) {
			const fs = PG.podFS(this, p, c.name);
			const file = root + (path === "/" || path === "" ? "/index.html" : path);
			return fs.read(file) !== void 0 ? 200 : 404;
		}
		if (info.type === "registry") return path.startsWith("/v2") ? 200 : 404;
		if (info.built && info.type === "web") return path === "/" || /^\/(healthz?|ready|live|readyz|livez|status|ping)$/.test(path) ? 200 : 404;
		return path === "/" ? 200 : /^\/(healthz?|ready|live|ping)$/.test(path) && info.type === "web" ? 200 : 404;
	},
	probeCheck(p, c, kind, probe, cs) {
		const info = PG.imageInfo(this.sim, c.image) || {};
		const ip = p.status.podIP || "10.244.0.2";
		const resolvePort = (port) => {
			if (typeof port === "string") {
				const cp = (c.ports || []).find((x) => x.name === port);
				return cp ? cp.containerPort : null;
			}
			return Number(port);
		};
		if (probe.httpGet) {
			const port = resolvePort(probe.httpGet.port);
			const path = probe.httpGet.path || "/";
			if (!((info.type === "web" || info.type === "registry") && port === (info.port || 80))) return {
				ok: false,
				msg: `Get "http://${ip}:${port}${path}": dial tcp ${ip}:${port}: connect: connection refused`
			};
			const st = this.webStatus(p, c, info, path);
			return st < 400 ? { ok: true } : {
				ok: false,
				msg: `HTTP probe failed with statuscode: ${st}`
			};
		}
		if (probe.tcpSocket) {
			const port = resolvePort(probe.tcpSocket.port);
			return port === info.port ? { ok: true } : {
				ok: false,
				msg: `dial tcp ${ip}:${port}: connect: connection refused`
			};
		}
		if (probe.exec) {
			if (!cs.exec) cs.exec = {
				pending: false,
				ok: void 0
			};
			if (!cs.exec.pending) {
				cs.exec.pending = true;
				PG.execInPod({
					sim: this.sim,
					sh: { aborted: false }
				}, this, p, probe.exec.command || [], c.name).then((r) => {
					cs.exec.ok = r.code === 0;
					cs.exec.code = r.code;
					cs.exec.pending = false;
				}).catch(() => {
					cs.exec.pending = false;
					cs.exec.ok = false;
				});
			}
			if (cs.exec.ok === void 0) return {
				ok: false,
				wait: true,
				msg: ""
			};
			return cs.exec.ok ? { ok: true } : {
				ok: false,
				msg: `command "${(probe.exec.command || []).join(" ")}" exited with ${cs.exec.code}`
			};
		}
		return { ok: true };
	},
	initCheck(p, c, info) {
		const argv = [...c.command || [], ...c.args || []].length ? [...c.command || [], ...c.args || []] : info.cmdArgv || [];
		if (info.requireEnv) {
			const env = this.podEnvNames(p);
			if (!info.requireEnv.some((k) => env.names.includes(k) || info.env && k in info.env)) return {
				state: "fail",
				msg: info.crashMsg
			};
		}
		const joined = argv.join(" ");
		if (/\b(until|while)\b/.test(joined)) {
			let m;
			const ns = p.metadata.namespace;
			if ((m = /(?:nslookup|getent hosts|ping(?: -c\s*\d+)?|dig(?: \+short)?)\s+([\w.-]+)/.exec(joined)) || (m = /nc\s+-\w*z\w*\s+([\w.-]+)\s+(\d+)/.exec(joined)) || (m = /(?:wget|curl)\b[^;|]*?(?:https?:\/\/)?([\w-]+(?:\.[\w-]+)*)(?::\d+)?/.exec(joined))) {
				const svc = this.findServiceByHost(m[1], ns);
				return svc && (/nslookup|getent|dig|ping/.test(joined) ? true : this.endpointsOf(svc).length > 0) ? { state: "done" } : { state: "run" };
			}
			return { state: "run" };
		}
		const cls = argv.length ? PG.classifyArgv(argv) : info.type === "tool" ? {
			long: false,
			out: ""
		} : { long: true };
		if (!cls) return { state: "done" };
		return cls.long ? { state: "run" } : {
			state: "done",
			out: cls.out
		};
	},
	stepInit(p) {
		const sm = p._sim, clock = this.clock, inits = p.spec.initContainers || [];
		const i = sm.initIdx;
		if (i >= inits.length) {
			sm.status = "PodInitializing";
			if (clock - sm.initDoneAt > 1) this.startContainers(p);
			return;
		}
		const c = inits[i];
		const info = PG.imageInfo(this.sim, c.image) || { type: "tool" };
		const r = this.initCheck(p, c, info);
		if (r.state === "done") {
			if (clock - sm.initAt < 2) {
				sm.status = `Init:${i}/${inits.length}`;
				return;
			}
			sm.initIdx++;
			sm.initAt = clock;
			sm.initCrash = false;
			this.emit(p, "Normal", "Started", `Started container ${c.name}`);
			sm.initLogs = sm.initLogs || {};
			sm.initLogs[c.name] = r.out ? [r.out] : [];
			const argv = [...c.command || [], ...c.args || []];
			if (argv.length) PG.execInPod({
				sim: this.sim,
				sh: { aborted: false }
			}, this, p, argv, c.name).then((res) => {
				if (res.out) sm.initLogs[c.name] = res.out.split("\n");
			}).catch(() => {});
			if (sm.initIdx >= inits.length) {
				sm.initDoneAt = clock;
				sm.status = "PodInitializing";
			} else sm.status = `Init:${sm.initIdx}/${inits.length}`;
			return;
		}
		if (r.state === "fail") {
			if (!sm.initCrash) {
				sm.initCrash = true;
				sm.initRestarts = (sm.initRestarts || 0) + 1;
				sm.restarts = (sm.restarts || 0) + 1;
				sm.initFailAt = clock;
				sm.status = "Init:Error";
				sm.initLogs = sm.initLogs || {};
				sm.initLogs[c.name] = (r.msg || "init failed").split("\n");
				this.emit(p, "Warning", "BackOff", `Back-off restarting failed container ${c.name} in pod ${p.metadata.name}`);
			} else {
				if (clock - sm.initFailAt > 3) sm.status = "Init:CrashLoopBackOff";
				if (clock - sm.initFailAt > Math.min(300, 10 * Math.pow(2, Math.min(5, sm.initRestarts - 1)))) {
					sm.initCrash = false;
					sm.initAt = clock;
				}
			}
			return;
		}
		sm.status = `Init:${i}/${inits.length}`;
	},
	startContainers(p) {
		const sm = p._sim, clock = this.clock;
		sm.stage = "running";
		sm.startedAt = clock;
		sm.status = "Running";
		sm.ready = false;
		p.status.phase = "Running";
		sm.cs = p.spec.containers.map((c, i) => ({
			startedAt: clock,
			ready: false,
			restarts: 0,
			status: "Running",
			logs: i === 0 ? sm.logs : [],
			done: false,
			probes: {},
			last: null
		}));
		p.spec.containers.forEach((c, i) => {
			const lines = this.startLogs(p, c);
			sm.cs[i].logs.push(...lines);
		});
	},
	stepContainer(p, i, c) {
		const sm = p._sim, st = sm.cs[i], clock = this.clock;
		if (st.done) return;
		if (st.waitUntil) {
			if (clock < st.waitUntil) {
				st.ready = false;
				st.status = "CrashLoopBackOff";
				return;
			}
			st.waitUntil = 0;
			st.startedAt = clock;
			st.status = "Running";
			st.probes = {};
		}
		const info = PG.imageInfo(this.sim, c.image) || { type: "tool" };
		const cmd = this.runsCommand(c, info);
		let crashMsg = null, exits = false, oom = false;
		if (info.requireEnv) {
			const env = this.podEnvNames(p);
			if (!info.requireEnv.some((k) => env.names.includes(k) || info.env && k in info.env)) crashMsg = info.crashMsg;
		}
		if (i === 0 && sm.forceCrash) crashMsg = "panic: simulated crash (sim crash)";
		const lim = PG.memMi(((c.resources || {}).limits || {}).memory);
		if (!crashMsg && lim !== null && lim < PG.baseMemOf(c.image, info) && clock - st.startedAt >= 3) oom = true;
		if (!crashMsg && !oom) {
			if (cmd && !cmd.long) exits = true;
			else if (!cmd && info.type === "tool") exits = true;
		}
		if (crashMsg || exits || oom) {
			if (exits && p.spec.restartPolicy === "Never") {
				if (!st.done && cmd && cmd.out) st.logs.push(cmd.out);
				st.done = true;
				st.ok = true;
				st.status = "Completed";
				st.ready = false;
				return;
			}
			if ((crashMsg || oom) && p.spec.restartPolicy === "Never") {
				st.done = true;
				st.ok = false;
				st.status = oom ? "OOMKilled" : "Error";
				st.ready = false;
				if (crashMsg) st.logs.push(...crashMsg.split("\n"));
				st.last = oom ? {
					reason: "OOMKilled",
					exitCode: 137
				} : {
					reason: "Error",
					exitCode: 1
				};
				return;
			}
			if (clock - st.startedAt >= (oom ? 3 : 1.5) && !st.crashNow) {
				st.crashNow = true;
				st.restarts++;
				st.status = oom ? "OOMKilled" : exits ? "Completed" : "Error";
				st.ready = false;
				st.last = oom ? {
					reason: "OOMKilled",
					exitCode: 137
				} : exits ? {
					reason: "Completed",
					exitCode: 0
				} : {
					reason: "Error",
					exitCode: 1
				};
				if (crashMsg) st.logs.push(...crashMsg.split("\n"));
				else if (cmd && cmd.out) st.logs.push(cmd.out);
				st.backoff = Math.min(300, 10 * Math.pow(2, Math.min(5, st.restarts - 1)));
				st.restartAt = clock + 1.5;
				this.emit(p, "Warning", "BackOff", `Back-off restarting failed container ${c.name} in pod ${p.metadata.name}`);
			} else if (st.crashNow) {
				st.status = clock - (st.restartAt - 1.5) > 1.2 ? "CrashLoopBackOff" : st.status;
				if (clock >= st.restartAt + st.backoff) {
					st.crashNow = false;
					st.startedAt = clock;
					st.status = "Running";
					st.probes = {};
					if (i === 0 && sm.forceCrash) sm.forceCrash = false;
				}
			}
			return;
		}
		st.crashNow = false;
		const age = clock - st.startedAt;
		const pr = st.probes;
		let startupOk = true;
		if (c.startupProbe) {
			startupOk = !!pr.startupDone;
			if (!startupOk && age >= (c.startupProbe.initialDelaySeconds || 0) && clock >= (pr.nextS || 0)) {
				const r = this.probeCheck(p, c, "startup", c.startupProbe, st);
				pr.nextS = clock + (c.startupProbe.periodSeconds || 10);
				if (r.ok) pr.startupDone = true;
				else if (!r.wait) {
					pr.sFails = (pr.sFails || 0) + 1;
					this.emit(p, "Warning", "Unhealthy", "Startup probe failed: " + r.msg);
					if (pr.sFails >= (c.startupProbe.failureThreshold || 3)) {
						this.killContainer(p, i, c, "startup");
						return;
					}
				}
			}
		}
		if (startupOk && c.livenessProbe && age >= (c.livenessProbe.initialDelaySeconds || 0) && clock >= (pr.nextL || 0)) {
			const r = this.probeCheck(p, c, "liveness", c.livenessProbe, st);
			pr.nextL = clock + (c.livenessProbe.periodSeconds || 10);
			if (r.ok) pr.lFails = 0;
			else if (!r.wait) {
				pr.lFails = (pr.lFails || 0) + 1;
				this.emit(p, "Warning", "Unhealthy", "Liveness probe failed: " + r.msg);
				if (pr.lFails >= (c.livenessProbe.failureThreshold || 3)) {
					this.killContainer(p, i, c, "liveness");
					return;
				}
			}
		}
		if (c.readinessProbe) {
			if (startupOk && age >= (c.readinessProbe.initialDelaySeconds || 0) && clock >= (pr.nextR || 0)) {
				const r = this.probeCheck(p, c, "readiness", c.readinessProbe, st);
				pr.nextR = clock + (c.readinessProbe.periodSeconds || 10);
				if (r.ok) {
					pr.rFails = 0;
					pr.rOk = true;
				} else if (!r.wait) {
					pr.rFails = (pr.rFails || 0) + 1;
					this.emit(p, "Warning", "Unhealthy", "Readiness probe failed: " + r.msg);
					if (pr.rFails >= (c.readinessProbe.failureThreshold || 3)) pr.rOk = false;
				}
			}
			st.ready = startupOk && !!pr.rOk;
		} else if (!st.ready && age >= 2 && startupOk) st.ready = true;
		st.status = "Running";
	},
	killContainer(p, i, c, why) {
		const st = p._sim.cs[i], clock = this.clock;
		st.restarts++;
		st.lkills = (st.lkills || 0) + 1;
		st.ready = false;
		st.probes = {};
		st.last = {
			reason: "Error",
			exitCode: 137
		};
		this.emit(p, "Normal", "Killing", `Container ${c.name} failed ${why} probe, will be restarted`);
		if (st.lkills >= 3) {
			st.status = "CrashLoopBackOff";
			st.waitUntil = clock + Math.min(300, 10 * Math.pow(2, Math.min(5, st.lkills - 3)));
			this.emit(p, "Warning", "BackOff", `Back-off restarting failed container ${c.name} in pod ${p.metadata.name}`);
		} else {
			st.startedAt = clock;
			st.status = "Running";
		}
	},
	stepRunning(p) {
		const sm = p._sim;
		const cs = sm.cs;
		p.spec.containers.forEach((c, i) => this.stepContainer(p, i, c));
		sm.restarts = cs.reduce((a, x) => a + x.restarts, 0);
		if (!cs.filter((x) => !x.done).length) {
			const ok = cs.every((x) => x.ok);
			sm.status = ok ? "Completed" : cs.find((x) => !x.ok).status;
			sm.ready = false;
			p.status.phase = ok ? "Succeeded" : "Failed";
			sm.stage = "done";
			sm.readyCount = 0;
			return;
		}
		sm.ready = cs.every((x) => x.ready);
		sm.readyCount = cs.filter((x) => x.ready).length;
		let worst = "Running";
		for (const x of cs) if ((PG.STATUS_RANK[x.status] || 0) > (PG.STATUS_RANK[worst] || 0)) worst = x.status;
		sm.status = worst;
	}
});
PG.Cluster.prototype.addNamespace = function(name) {
	if (this.find("namespaces", name)) return this.find("namespaces", name);
	const ns = this.mk("namespaces", name, null, {
		spec: {},
		status: { phase: "Active" }
	});
	ns.metadata.labels = { "kubernetes.io/metadata.name": name };
	this.mk("serviceaccounts", "default", name, {});
	this.mk("configmaps", "kube-root-ca.crt", name, { data: { "ca.crt": "-----BEGIN CERTIFICATE-----\nSIMULATED\n-----END CERTIFICATE-----\n" } });
	return ns;
};
PG.Cluster.prototype.deployment = function(ns, name, image, replicas, o = {}) {
	const labels = o.labels || { app: name };
	const spec = {
		containers: [{
			name: o.containerName || name,
			image,
			...o.container || {}
		}],
		...o.podSpec || {}
	};
	return this.mk("deployments", name, ns, {
		metadata: {
			labels: { ...labels },
			annotations: o.annotations || {}
		},
		spec: {
			replicas,
			selector: { matchLabels: o.selector || { ...labels } },
			template: {
				metadata: { labels: { ...labels } },
				spec
			},
			...o.strategy ? { strategy: o.strategy } : {}
		},
		status: {}
	});
};
PG.Cluster.prototype.service = function(ns, name, selector, ports, o = {}) {
	const svc = this.mk("services", name, ns, {
		metadata: {
			labels: o.labels || { app: name },
			annotations: o.annotations || {}
		},
		spec: {
			type: o.type || "ClusterIP",
			selector,
			ports,
			...o.clusterIP ? { clusterIP: o.clusterIP } : {}
		},
		status: { loadBalancer: {} }
	});
	return this.normalizeService(svc);
};
PG.TOL_ALL = [{ operator: "Exists" }];
PG.Cluster.prototype.systemBase = function(cpName) {
	for (const n of [
		"default",
		"kube-system",
		"kube-public",
		"kube-node-lease"
	]) this.addNamespace(n);
	PG.seedRoles(this);
	this.mk("services", "kubernetes", "default", {
		spec: {
			type: "ClusterIP",
			clusterIP: "10.96.0.1",
			ports: [{
				name: "https",
				port: 443,
				targetPort: 6443,
				protocol: "TCP"
			}]
		},
		status: { loadBalancer: {} }
	});
	this.mk("configmaps", "cluster-info", "kube-public", { data: { kubeconfig: `apiVersion: v1\nclusters:\n- cluster:\n    certificate-authority-data: SIMULATED\n    server: ${this.api}\n  name: ""\n` } });
	this.statics = cpName ? [
		"etcd",
		"kube-apiserver",
		"kube-controller-manager",
		"kube-scheduler"
	].map((c) => ({
		name: `${c}-${cpName}`,
		ns: "kube-system",
		component: c,
		node: cpName,
		image: c === "etcd" ? "registry.k8s.io/etcd:3.6.4-0" : `registry.k8s.io/${c}:${this.k8sVersion}`
	})) : [];
};
PG.Cluster.prototype.dnsSvc = function() {
	this.mk("services", "kube-dns", "kube-system", {
		metadata: { labels: { "k8s-app": "kube-dns" } },
		spec: {
			type: "ClusterIP",
			clusterIP: "10.96.0.10",
			selector: { "k8s-app": "kube-dns" },
			ports: [{
				name: "dns",
				port: 53,
				protocol: "UDP",
				targetPort: 53
			}, {
				name: "dns-tcp",
				port: 53,
				protocol: "TCP",
				targetPort: 53
			}]
		},
		status: { loadBalancer: {} }
	});
};
PG.Cluster.prototype.daemonset = function(ns, name, image, o = {}) {
	return this.mk("daemonsets", name, ns, {
		spec: {
			selector: { matchLabels: { "k8s-app": name } },
			template: {
				metadata: { labels: { "k8s-app": name } },
				spec: {
					containers: [{
						name,
						image
					}],
					tolerations: PG.TOL_ALL
				}
			}
		},
		status: {}
	});
};
PG.Cluster.prototype.systemDeployment = function(ns, name, image, replicas, labels) {
	return this.deployment(ns, name, image, replicas, {
		labels: labels || { "k8s-app": name },
		podSpec: { tolerations: PG.TOL_ALL }
	});
};
PG.fastForward = (sim, secs) => {
	for (let t = 0; t < secs; t += 1) sim.advance(1);
};
PG.makeKindCluster = (sim, cfg) => {
	const name = cfg.name || "kind";
	const entry = "kind-" + name;
	const port = sim.nextApiPort();
	const cl = new PG.Cluster(sim, {
		id: name,
		tool: "kind",
		entry,
		api: `https://127.0.0.1:${port}`,
		k8sVersion: "v1.35.0"
	});
	sim.ensureNetwork("kind");
	if (!sim.images["kindest/node:v1.35.0"]) sim.images["kindest/node:v1.35.0"] = {
		id: PG.hex(12),
		size: 1010,
		created: sim.clock
	};
	const roles = cfg.nodes && cfg.nodes.length ? cfg.nodes : [{ role: "control-plane" }];
	let w = 0;
	let cpN = 0;
	const names = [];
	roles.forEach((r, idx) => {
		const role = r.role || "worker";
		let nm;
		if (role === "control-plane") {
			cpN++;
			nm = cpN === 1 ? `${name}-control-plane` : `${name}-control-plane${cpN}`;
		} else {
			w++;
			nm = w === 1 ? `${name}-worker` : `${name}-worker${w}`;
		}
		const ip = "172.18.0." + (idx + 2);
		const ports = [];
		if (role === "control-plane" && cpN === 1) ports.push({
			hostIp: "127.0.0.1",
			host: port,
			container: 6443
		});
		for (const m of r.extraPortMappings || []) ports.push({
			hostIp: m.listenAddress || "0.0.0.0",
			host: m.hostPort,
			container: m.containerPort,
			proto: m.protocol || "tcp"
		});
		sim.addContainer({
			name: nm,
			image: "kindest/node:v1.35.0",
			kind: "node",
			clusterId: entry,
			networks: ["kind"],
			ports,
			restart: "on-failure",
			ip
		});
		names.push({
			nm,
			role,
			ip
		});
		for (const m of r.extraPortMappings || []) cl.portMaps.push({
			host: m.hostPort,
			container: m.containerPort,
			node: nm,
			ip: m.listenAddress || "0.0.0.0"
		});
	});
	const hasWorkers = names.some((n) => n.role === "worker");
	for (const n of names) cl.addNode({
		name: n.nm,
		role: n.role,
		containerName: n.nm,
		ip: n.ip,
		taints: n.role === "control-plane" && hasWorkers ? [{
			key: "node-role.kubernetes.io/control-plane",
			effect: "NoSchedule"
		}] : []
	});
	const cp = names.find((n) => n.role === "control-plane");
	cl.systemBase(cp && cp.nm);
	cl.addNamespace("local-path-storage");
	cl.dnsSvc();
	cl.daemonset("kube-system", "kube-proxy", "registry.k8s.io/kube-proxy:v1.35.0");
	cl.daemonset("kube-system", "kindnet", "docker.io/kindest/kindnetd:v20250512-df8de77b");
	cl.systemDeployment("kube-system", "coredns", "registry.k8s.io/coredns/coredns:v1.12.0", 2, { "k8s-app": "kube-dns" });
	cl.systemDeployment("local-path-storage", "local-path-provisioner", "docker.io/kindest/local-path-provisioner:v20250214-acbabc1a", 1, { app: "local-path-provisioner" });
	sim.clusters[entry] = cl;
	sim.addKubeEntries(entry, cl.api, { kind: "admin" });
	sim.kubeconfig.current = entry;
	return cl;
};
PG.makeK3dCluster = (sim, o) => {
	const name = o.name;
	const entry = "k3d-" + name;
	const port = sim.nextApiPort();
	const cl = new PG.Cluster(sim, {
		id: name,
		tool: "k3d",
		entry,
		api: `https://0.0.0.0:${port}`,
		k8sVersion: "v1.33.4+k3s1"
	});
	sim.ensureNetwork("k3d-" + name);
	if (!sim.images["rancher/k3s:v1.33.4-k3s1"]) sim.images["rancher/k3s:v1.33.4-k3s1"] = {
		id: PG.hex(12),
		size: 240,
		created: sim.clock
	};
	const net = "k3d-" + name;
	const names = [];
	for (let i = 0; i < (o.servers || 1); i++) names.push({
		nm: `k3d-${name}-server-${i}`,
		role: "control-plane"
	});
	for (let i = 0; i < (o.agents || 0); i++) names.push({
		nm: `k3d-${name}-agent-${i}`,
		role: "worker"
	});
	names.forEach((n, idx) => {
		n.ip = "172.19.0." + (idx + 3);
		sim.addContainer({
			name: n.nm,
			image: "rancher/k3s:v1.33.4-k3s1",
			kind: "node",
			clusterId: entry,
			networks: [net],
			ip: n.ip,
			ports: []
		});
		cl.addNode({
			name: n.nm,
			role: n.role,
			containerName: n.nm,
			ip: n.ip,
			version: "v1.33.4+k3s1",
			osImage: "K3s v1.33.4+k3s1",
			runtime: "containerd://2.0.5-k3s2",
			labels: n.role === "control-plane" ? { "node-role.kubernetes.io/master": "true" } : {}
		});
	});
	const lbPorts = [{
		hostIp: "0.0.0.0",
		host: port,
		container: 6443
	}, ...(o.ports || []).map((p) => ({
		hostIp: "0.0.0.0",
		host: p.host,
		container: p.container
	}))];
	sim.addContainer({
		name: `k3d-${name}-serverlb`,
		image: "ghcr.io/k3d-io/k3d-proxy:5.8.3",
		kind: "lb",
		clusterId: entry,
		networks: [net],
		ports: lbPorts,
		ip: "172.19.0.2"
	});
	cl.lbMaps = (o.ports || []).map((p) => ({
		host: p.host,
		target: p.container
	}));
	if (o.registry) {
		sim.addContainer({
			name: "k3d-" + o.registry.name,
			image: "registry:2",
			kind: "registry",
			networks: [net, "bridge"],
			ports: [{
				hostIp: o.registry.host || "0.0.0.0",
				host: o.registry.port,
				container: 5e3
			}],
			restart: "always"
		});
		sim.registries["k3d-" + o.registry.name] = {};
		cl.registryName = "k3d-" + o.registry.name;
	}
	cl.systemBase(null);
	cl.dnsSvc();
	const sys = (n, img, rep, lab) => cl.systemDeployment("kube-system", n, img, rep, lab);
	sys("coredns", "rancher/mirrored-coredns-coredns:1.12.0", 1, { "k8s-app": "kube-dns" });
	sys("local-path-provisioner", "rancher/local-path-provisioner:v0.0.31", 1, { app: "local-path-provisioner" });
	sys("metrics-server", "rancher/mirrored-metrics-server:v0.7.2", 1, { "k8s-app": "metrics-server" });
	sys("traefik", "rancher/mirrored-library-traefik:3.3.6", 1, { "app.kubernetes.io/name": "traefik" });
	cl.mk("services", "metrics-server", "kube-system", {
		spec: {
			type: "ClusterIP",
			clusterIP: "10.43.0.20",
			selector: { "k8s-app": "metrics-server" },
			ports: [{
				port: 443,
				targetPort: 10250
			}]
		},
		status: { loadBalancer: {} }
	});
	cl.service("kube-system", "traefik", { "app.kubernetes.io/name": "traefik" }, [{
		name: "web",
		port: 80,
		targetPort: 80
	}, {
		name: "websecure",
		port: 443,
		targetPort: 443
	}], {
		type: "LoadBalancer",
		labels: { "app.kubernetes.io/name": "traefik" }
	});
	cl.daemonset("kube-system", "svclb-traefik", "rancher/klipper-lb:v0.4.13");
	sim.clusters[entry] = cl;
	sim.addKubeEntries(entry, cl.api, { kind: "admin" });
	sim.kubeconfig.current = entry;
	return cl;
};
PG.seedGke = (sim) => {
	const id = "gke_prod-project_asia-east1-a_prod-1";
	const cl = new PG.Cluster(sim, {
		id,
		tool: "gke",
		entry: id,
		api: "https://34.80.10.20",
		k8sVersion: "v1.33.5-gke.1080000"
	});
	[
		"a1b2",
		"c3d4",
		"e5f6"
	].forEach((s, i) => cl.addNode({
		name: `gke-prod-1-default-pool-7f3a-${s}`,
		role: "worker",
		containerName: "none",
		ip: "10.140.0." + (10 + i),
		version: "v1.33.5-gke.1080000",
		osImage: "Container-Optimized OS from Google",
		runtime: "containerd://1.7.28",
		labels: {
			"cloud.google.com/gke-nodepool": "default-pool",
			"node.kubernetes.io/instance-type": "e2-standard-4"
		}
	}));
	cl.systemBase(null);
	cl.addNamespace("shop-frontend");
	cl.dnsSvc();
	cl.systemDeployment("kube-system", "kube-dns", "gke.gcr.io/k8s-dns-kube-dns:1.23.1", 2, { "k8s-app": "kube-dns" });
	cl.systemDeployment("kube-system", "metrics-server", "gke.gcr.io/metrics-server:v0.7.2", 1, { "k8s-app": "metrics-server" });
	cl.daemonset("kube-system", "fluentbit-gke", "gke.gcr.io/fluent-bit:v1.9.7");
	cl.daemonset("kube-system", "gke-metrics-agent", "gke.gcr.io/gke-metrics-agent:1.15");
	cl.deployment("shop-frontend", "shop-web", "nginx:1.27", 2, {
		labels: { app: "shop-web" },
		container: {
			ports: [{ containerPort: 80 }],
			resources: { requests: {
				cpu: "100m",
				memory: "128Mi"
			} }
		}
	});
	cl.service("shop-frontend", "shop-web", { app: "shop-web" }, [{
		port: 80,
		targetPort: 80
	}]);
	cl.service("shop-frontend", "shop-web-internal", { app: "shop-web" }, [{
		port: 80,
		targetPort: 80
	}], {
		type: "LoadBalancer",
		annotations: { "networking.gke.io/load-balancer-type": "Internal" }
	});
	cl.deployment("shop-frontend", "redis", "redis:7-alpine", 1, {
		labels: { app: "redis" },
		container: { ports: [{ containerPort: 6379 }] }
	});
	cl.service("shop-frontend", "redis", { app: "redis" }, [{
		port: 6379,
		targetPort: 6379
	}]);
	sim.clusters[id] = cl;
	sim.addKubeEntries(id, cl.api, { kind: "admin" });
	sim.kubeconfig.current = id;
	for (let i = 0; i < 80; i++) {
		sim.clock += 1;
		cl.tick(1);
	}
	const back = 3456e3;
	for (const p of Object.keys(cl.res)) for (const o of cl.res[p]) if (o.metadata && o.metadata._t !== void 0) {
		o.metadata._t -= back;
		o.metadata.creationTimestamp = PG.iso(o.metadata._t);
	}
	for (const n of cl.nodes) n.createdAt -= back;
	sim.clock = 0;
	for (const p of cl.res.pods) {
		p._sim.startedAt = (p._sim.startedAt || 0) - sim.clock;
		p._sim.t0 = -3456e3;
	}
	const web = cl.find("services", "shop-web-internal", "shop-frontend");
	web.metadata._t = -39600;
};
PG.GoTpl = (() => {
	class TplError extends Error {
		constructor(msg) {
			super(msg);
			this.isTpl = true;
		}
	}
	const truthy = (v) => !(v === void 0 || v === null || v === false || v === 0 || v === "" || Array.isArray(v) && !v.length || PG.isObj(v) && !Object.keys(v).length);
	function lexAll(src) {
		const out = [];
		let i = 0, line = 1;
		while (i < src.length) {
			const s = src.indexOf("{{", i);
			if (s < 0) {
				out.push({
					t: "text",
					v: src.slice(i),
					line
				});
				break;
			}
			if (s > i) out.push({
				t: "text",
				v: src.slice(i, s),
				line
			});
			line += (src.slice(i, s).match(/\n/g) || []).length;
			let j = s + 2, q = null;
			for (; j < src.length; j++) {
				const c = src[j];
				if (q) {
					if (c === "\\" && q === "\"") j++;
					else if (c === q) q = null;
				} else if (c === "\"" || c === "`") q = c;
				else if (c === "}" && src[j + 1] === "}") break;
			}
			let body = src.slice(s + 2, j);
			const act = {
				t: "act",
				line,
				ltrim: false,
				rtrim: false
			};
			if (/^-\s/.test(body)) {
				act.ltrim = true;
				body = body.slice(1);
			}
			if (/\s-$/.test(body)) {
				act.rtrim = true;
				body = body.slice(0, -1);
			}
			act.v = body.trim();
			out.push(act);
			line += (src.slice(s, j + 2).match(/\n/g) || []).length;
			i = j + 2;
		}
		for (let k = 0; k < out.length; k++) {
			if (out[k].t === "act" && out[k].ltrim && out[k - 1] && out[k - 1].t === "text") out[k - 1].v = out[k - 1].v.replace(/\s+$/, "");
			if (out[k].t === "act" && out[k].rtrim && out[k + 1] && out[k + 1].t === "text") out[k + 1].v = out[k + 1].v.replace(/^\s+/, "");
		}
		return out;
	}
	function tokExpr(s, line) {
		const toks = [];
		let i = 0;
		while (i < s.length) {
			const c = s[i];
			if (/\s/.test(c)) {
				i++;
				continue;
			}
			if ("()|,".includes(c)) {
				toks.push({ k: c });
				i++;
				continue;
			}
			if (s.startsWith(":=", i)) {
				toks.push({ k: ":=" });
				i += 2;
				continue;
			}
			if (c === "=") {
				toks.push({ k: "=" });
				i++;
				continue;
			}
			if (c === "\"") {
				let j = i + 1, str = "";
				while (j < s.length && s[j] !== "\"") if (s[j] === "\\") {
					const n = s[j + 1];
					str += n === "n" ? "\n" : n === "t" ? "	" : n;
					j += 2;
				} else str += s[j++];
				toks.push({
					k: "str",
					v: str
				});
				i = j + 1;
				continue;
			}
			if (c === "`") {
				const j = s.indexOf("`", i + 1);
				toks.push({
					k: "str",
					v: s.slice(i + 1, j)
				});
				i = j + 1;
				continue;
			}
			let j = i;
			while (j < s.length && !/[\s()|,]/.test(s[j]) && !(s[j] === "=" && j > i)) j++;
			const w = s.slice(i, j);
			i = j;
			if (/^-?\d+(\.\d+)?$/.test(w)) toks.push({
				k: "num",
				v: Number(w)
			});
			else if (w === "true" || w === "false") toks.push({
				k: "bool",
				v: w === "true"
			});
			else if (w === "nil") toks.push({ k: "nil" });
			else if (w[0] === "$") toks.push({
				k: "var",
				v: w
			});
			else if (w[0] === ".") toks.push({
				k: "field",
				v: w
			});
			else toks.push({
				k: "id",
				v: w
			});
		}
		return toks;
	}
	function parsePipe(toks, p) {
		const node = {
			decl: null,
			assign: false,
			cmds: []
		};
		if (toks[p] && toks[p].k === "var") {
			let q = p;
			const names = [toks[q].v];
			q++;
			if (toks[q] && toks[q].k === "," && toks[q + 1] && toks[q + 1].k === "var") {
				names.push(toks[q + 1].v);
				q += 2;
			}
			if (toks[q] && (toks[q].k === ":=" || toks[q].k === "=")) {
				node.decl = names;
				node.assign = toks[q].k === "=";
				p = q + 1;
			}
		}
		let cmd = [];
		const term = () => {
			const t = toks[p];
			if (t.k === "(") {
				p++;
				const r = parsePipe(toks, p);
				p = r.p;
				if (!toks[p] || toks[p].k !== ")") throw new TplError("unclosed paren");
				p++;
				return {
					k: "pipe",
					v: r.node
				};
			}
			p++;
			return t;
		};
		while (p < toks.length && toks[p].k !== ")") {
			if (toks[p].k === "|") {
				node.cmds.push(cmd);
				cmd = [];
				p++;
				continue;
			}
			cmd.push(term());
		}
		node.cmds.push(cmd);
		return {
			node,
			p
		};
	}
	function parse(src, name) {
		const items = lexAll(src);
		const defs = {};
		const root = { body: [] };
		const stack = [{
			node: root,
			field: "body"
		}];
		const top = () => stack[stack.length - 1];
		const cur = () => top().node[top().field];
		for (const it of items) {
			if (it.t === "text") {
				if (it.v) cur().push({
					k: "text",
					v: it.v
				});
				continue;
			}
			let a = it.v;
			if (a.startsWith("/*")) continue;
			const kw = /^(if|else if|else|end|range|with|define|template|block)\b/.exec(a);
			const expr = (s) => {
				return parsePipe(tokExpr(s, it.line), 0).node;
			};
			if (!kw) {
				cur().push({
					k: "act",
					pipe: expr(a),
					line: it.line,
					src: a
				});
				continue;
			}
			const rest = a.slice(kw[0].length).trim();
			if (kw[1] === "if" || kw[1] === "with" || kw[1] === "range") {
				const n = {
					k: kw[1],
					pipe: expr(rest),
					body: [],
					else: [],
					line: it.line,
					src: a
				};
				cur().push(n);
				stack.push({
					node: n,
					field: "body"
				});
			} else if (kw[1] === "else if") {
				const parent = top().node;
				const n = {
					k: "if",
					pipe: expr(rest),
					body: [],
					else: [],
					line: it.line,
					src: a
				};
				parent.else.push(n);
				stack.pop();
				stack.push({
					node: parent,
					field: "else",
					chain: true
				});
				stack.push({
					node: n,
					field: "body"
				});
			} else if (kw[1] === "else") {
				const t = top();
				if (t.field === "body") t.field = "else";
			} else if (kw[1] === "end") {
				stack.pop();
				while (stack.length > 1 && top().chain) stack.pop();
				if (!stack.length) throw new TplError(`template: ${name}:${it.line}: unexpected {{end}}`);
			} else if (kw[1] === "define") {
				const nm = tokExpr(rest, it.line)[0].v;
				const n = {
					k: "define",
					name: nm,
					body: []
				};
				stack.push({
					node: n,
					field: "body"
				});
				defs[nm] = n;
			} else if (kw[1] === "template" || kw[1] === "block") {
				const toks = tokExpr(rest, it.line);
				const nm = toks[0].v;
				const arg = toks.length > 1 ? parsePipe(toks, 1).node : { cmds: [[{
					k: "field",
					v: "."
				}]] };
				cur().push({
					k: "tmpl",
					name: nm,
					arg,
					line: it.line
				});
			}
		}
		if (stack.length > 1) throw new TplError(`template: ${name}: unexpected EOF (missing {{end}})`);
		return {
			root,
			defs
		};
	}
	const FUNCS = {};
	const str = (v) => v === void 0 || v === null ? "" : typeof v === "string" ? v : PG.isObj(v) || Array.isArray(v) ? JSON.stringify(v) : String(v);
	Object.assign(FUNCS, {
		print: (...a) => a.map(str).join(""),
		println: (...a) => a.map(str).join(" ") + "\n",
		printf: (f, ...a) => {
			let i = 0;
			return f.replace(/%([-+# 0]*\d*)([sdvqtf%])/g, (m, fl, ch) => {
				if (ch === "%") return "%";
				const v = a[i++];
				if (ch === "q") return JSON.stringify(str(v));
				if (ch === "d") return String(Math.trunc(Number(v)));
				return str(v);
			});
		},
		quote: (...a) => a.filter((x) => x !== void 0 && x !== null).map((x) => JSON.stringify(str(x))).join(" "),
		squote: (...a) => a.map((x) => "'" + str(x) + "'").join(" "),
		default: (d, v) => truthy(v) ? v : d,
		required: (m, v) => {
			if (v === void 0 || v === null || v === "") throw new TplError(m);
			return v;
		},
		trunc: (n, s) => n >= 0 ? str(s).slice(0, n) : str(s).slice(n),
		trimSuffix: (x, s) => str(s).endsWith(x) ? str(s).slice(0, -x.length || void 0) : str(s),
		trimPrefix: (x, s) => str(s).startsWith(x) ? str(s).slice(x.length) : str(s),
		trim: (s) => str(s).trim(),
		upper: (s) => str(s).toUpperCase(),
		lower: (s) => str(s).toLowerCase(),
		title: (s) => str(s).replace(/\b\w/g, (c) => c.toUpperCase()),
		replace: (o, n, s) => str(s).split(o).join(n),
		contains: (sub, s) => str(s).includes(sub),
		hasPrefix: (p, s) => str(s).startsWith(p),
		hasSuffix: (p, s) => str(s).endsWith(p),
		indent: (n, s) => str(s).split("\n").map((l) => " ".repeat(n) + l).join("\n"),
		nindent: (n, s) => "\n" + str(s).split("\n").map((l) => " ".repeat(n) + l).join("\n"),
		toYaml: (v) => v === void 0 || v === null ? "" : PG.yaml.dump(v).replace(/\n$/, ""),
		toJson: (v) => JSON.stringify(v),
		b64enc: (s) => PG.b64(str(s)),
		b64dec: (s) => PG.unb64(str(s)),
		sha256sum: (s) => PG.hash(str(s), 64),
		not: (v) => !truthy(v),
		and: (...a) => {
			for (const x of a) if (!truthy(x)) return x;
			return a[a.length - 1];
		},
		or: (...a) => {
			for (const x of a) if (truthy(x)) return x;
			return a[a.length - 1];
		},
		eq: (a, ...b) => b.some((x) => x === a || typeof x === "number" && typeof a === "string" && false),
		ne: (a, b) => a !== b,
		lt: (a, b) => a < b,
		gt: (a, b) => a > b,
		le: (a, b) => a <= b,
		ge: (a, b) => a >= b,
		len: (v) => v === void 0 || v === null ? 0 : typeof v === "string" || Array.isArray(v) ? v.length : Object.keys(v).length,
		list: (...a) => a,
		dict: (...a) => {
			const o = {};
			for (let i = 0; i < a.length; i += 2) o[a[i]] = a[i + 1];
			return o;
		},
		hasKey: (m, k) => PG.isObj(m) && k in m,
		empty: (v) => !truthy(v),
		coalesce: (...a) => a.find(truthy),
		ternary: (a, b, c) => c ? a : b,
		join: (sep, l) => (l || []).join(sep),
		first: (l) => l && l[0],
		last: (l) => l && l[l.length - 1],
		toString: (v) => str(v),
		int: (v) => Math.trunc(Number(v)),
		int64: (v) => Math.trunc(Number(v)),
		kindIs: (k, v) => ({
			string: typeof v === "string",
			map: PG.isObj(v),
			slice: Array.isArray(v),
			bool: typeof v === "boolean",
			int: Number.isInteger(v),
			float64: typeof v === "number",
			invalid: v === null || v === void 0
		})[k] || false,
		typeOf: (v) => typeof v === "string" ? "string" : Array.isArray(v) ? "[]interface {}" : PG.isObj(v) ? "map[string]interface {}" : typeof v === "boolean" ? "bool" : "float64",
		randAlphaNum: (n) => PG.rnd(n, "abcdefghijklmnopqrstuvwxyz0123456789"),
		now: () => new Date(PG.BASE_TIME).toISOString(),
		regexMatch: (re, s) => new RegExp(re).test(str(s)),
		snakecase: (s) => str(s).replace(/([A-Z])/g, "_$1").toLowerCase(),
		kebabcase: (s) => str(s).replace(/([A-Z])/g, "-$1").toLowerCase(),
		index: (m, ...k) => k.reduce((a, x) => a && a[x], m)
	});
	FUNCS.toYAML = FUNCS.toYaml;
	function render(tpl, data, ctx) {
		const scopes = [{ $: data }];
		let out = "";
		const lookupVar = (n) => {
			for (let i = scopes.length - 1; i >= 0; i--) if (n in scopes[i]) return scopes[i][n];
			throw new TplError(`undefined variable "${n}"`);
		};
		const setVar = (n, v, assign) => {
			if (assign) {
				for (let i = scopes.length - 1; i >= 0; i--) if (n in scopes[i]) {
					scopes[i][n] = v;
					return;
				}
			}
			scopes[scopes.length - 1][n] = v;
		};
		const access = (base, path, src) => {
			let v = base;
			for (const seg of path) {
				if (v === void 0 || v === null) throw new TplError(`nil pointer evaluating interface {}.${seg}`);
				if (typeof v === "object" && seg in v) v = v[seg];
				else if (typeof v === "function") v = void 0;
				else v = void 0;
			}
			return v;
		};
		const evalTerm = (t, dot, node) => {
			switch (t.k) {
				case "str":
				case "num":
				case "bool": return t.v;
				case "nil": return null;
				case "pipe": return evalPipe(t.v, dot);
				case "var": {
					const parts = t.v.split(".");
					const v = lookupVar(parts[0]);
					return parts.length > 1 ? access(v, parts.slice(1)) : v;
				}
				case "field":
					if (t.v === ".") return dot;
					return access(dot, t.v.slice(1).split("."));
				case "id":
					if (FUNCS[t.v] || ctx.funcs[t.v]) return { fn: ctx.funcs[t.v] || FUNCS[t.v] };
					if (t.v === "lookup") throw new TplError("function \"lookup\" not defined");
					throw new TplError(`function "${t.v}" not defined`);
			}
		};
		const callable = (t, dot) => {
			if (t.k === "id") return evalTerm(t, dot).fn;
			if (t.k === "field" || t.k === "var") {
				const parts = (t.k === "field" ? t.v.slice(1) : t.v).split(".");
				const last = parts[parts.length - 1];
				const baseVal = t.k === "field" ? access(dot, parts.slice(0, -1)) : access(lookupVar(parts[0]), parts.slice(1, -1));
				if (baseVal && typeof baseVal[last] === "function") return (...a) => baseVal[last](...a);
			}
			return null;
		};
		const evalPipe = (pipe, dot) => {
			let val;
			let first = true;
			for (const cmd of pipe.cmds) {
				if (!cmd.length) continue;
				const head = cmd[0];
				const fn = callable(head, dot);
				const args = cmd.slice(fn ? 1 : 0).map((t) => {
					const v = evalTerm(t, dot);
					return v && v.fn && t.k === "id" ? v.fn : v;
				});
				if (fn) {
					const a = first ? args : [...args, val];
					try {
						val = fn(...a);
					} catch (e) {
						if (e.isTpl) throw new TplError(`error calling ${head.v ? head.v.replace(/^\./, "") : "function"}: ${e.message}`);
						throw e;
					}
				} else {
					if (args.length && !first) throw new TplError("can't give argument to non-function");
					val = evalTerm(head, dot);
					if (!first) {}
				}
				first = false;
			}
			if (pipe.decl) {
				const vals = pipe.decl;
				if (vals.length === 1) setVar(vals[0], val, pipe.assign);
				else setVar(vals[0], val, pipe.assign);
			}
			return val;
		};
		const execNodes = (nodes, dot) => {
			for (const n of nodes) if (n.k === "text") out += n.v;
			else if (n.k === "act") try {
				const v = evalPipe(n.pipe, dot);
				if (!n.pipe.decl) out += v === void 0 ? "<no value>" : v === null ? "<nil>" : str(v);
			} catch (e) {
				if (e.isTpl) e.message = `template: ${ctx.name}:${n.line}:1: executing "${ctx.name}" at <${n.src}>: ${e.message}`;
				throw e;
			}
			else if (n.k === "if") {
				const v = evalPipe(n.pipe, dot);
				scopes.push({});
				if (truthy(v)) execNodes(n.body, dot);
				else execNodes(n.else, dot);
				scopes.pop();
			} else if (n.k === "with") {
				const v = evalPipe(n.pipe, dot);
				scopes.push({});
				if (truthy(v)) execNodes(n.body, v);
				else execNodes(n.else, dot);
				scopes.pop();
			} else if (n.k === "range") {
				const decl = n.pipe.decl;
				const savePipe = {
					...n.pipe,
					decl: null
				};
				const coll = evalPipe(savePipe, dot);
				const entries = Array.isArray(coll) ? coll.map((v, i) => [i, v]) : PG.isObj(coll) ? Object.keys(coll).sort().map((k) => [k, coll[k]]) : [];
				if (!entries.length) {
					scopes.push({});
					execNodes(n.else, dot);
					scopes.pop();
				}
				for (const [k, v] of entries) {
					scopes.push({});
					if (decl) {
						if (decl.length === 2) {
							scopes[scopes.length - 1][decl[0]] = k;
							scopes[scopes.length - 1][decl[1]] = v;
						} else scopes[scopes.length - 1][decl[0]] = v;
					}
					execNodes(n.body, v);
					scopes.pop();
				}
			} else if (n.k === "tmpl") {
				const arg = evalPipe(n.arg, dot);
				out += ctx.include(n.name, arg);
			}
		};
		execNodes(tpl.root.body, data);
		return out;
	}
	return {
		parse,
		render,
		FUNCS,
		truthy,
		TplError
	};
})();
var C = PG.commands;
var readIn = async (ctx, files, cmd) => {
	if (files.length) {
		let out = "";
		for (const f of files) {
			const p = ctx.resolve(f);
			const c = ctx.fs.read(p);
			if (c === void 0) {
				ctx.eprintln(`${cmd}: ${f}: ${ctx.fs.isDir(p) ? "Is a directory" : "No such file or directory"}`);
				return null;
			}
			out += c;
		}
		return out;
	}
	return ctx.stdin === null || ctx.stdin === void 0 ? "" : ctx.stdin;
};
var opts = (args) => {
	const flags = /* @__PURE__ */ new Set();
	const rest = [];
	const kv = {};
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--") {
			rest.push(...args.slice(i + 1));
			break;
		}
		if (a.startsWith("--") && a.length > 2) {
			const [k, v] = a.slice(2).split("=");
			if (v !== void 0) kv[k] = v;
			flags.add(k);
		} else if (a.startsWith("-") && a.length > 1 && !/^-\d/.test(a)) for (const ch of a.slice(1)) flags.add(ch);
		else rest.push(a);
	}
	return {
		flags,
		rest,
		kv
	};
};
PG.opts = opts;
C.echo = async (ctx, args) => {
	let nl = true;
	if (args[0] === "-n") {
		nl = false;
		args = args.slice(1);
	}
	let s = args.join(" ");
	if (args[0] === "-e") s = args.slice(1).join(" ").replace(/\\n/g, "\n").replace(/\\t/g, "	");
	ctx.out(s + (nl ? "\n" : ""));
};
C.printf = async (ctx, args) => {
	if (!args.length) return;
	const fmt = args[0].replace(/\\n/g, "\n").replace(/\\t/g, "	").replace(/\\"/g, "\"");
	const rest = args.slice(1);
	let i = 0;
	let out = fmt.replace(/%([sd%])/g, (m, c) => c === "%" ? "%" : String(rest[i++] ?? ""));
	ctx.out(out);
};
C.cat = async (ctx, args) => {
	const t = await readIn(ctx, opts(args).rest.filter((a) => a !== "-"), "cat");
	if (t === null) return 1;
	ctx.out(t);
};
C.mkdir = async (ctx, args) => {
	const o = opts(args);
	for (const d of o.rest) {
		const p = ctx.resolve(d);
		if (ctx.fs.exists(p) && !o.flags.has("p")) {
			ctx.eprintln(`mkdir: ${d}: File exists`);
			return 1;
		}
		ctx.fs.mkdirp(p);
	}
};
C.rm = async (ctx, args) => {
	const o = opts(args);
	for (const f of o.rest) {
		const p = ctx.resolve(f);
		if (p === "/") {
			ctx.eprintln("rm: \"/\" may not be removed");
			return 1;
		}
		const n = ctx.fs.remove(p, o.flags.has("r") || o.flags.has("R"));
		if (p === ctx.env.HOME || p === "/home") ctx.fs.mkdirp(p, true);
		if (n === 0 && !o.flags.has("f")) {
			ctx.eprintln(`rm: ${f}: No such file or directory`);
			return 1;
		}
		if (n === -1) {
			ctx.eprintln(`rm: ${f}: is a directory`);
			return 1;
		}
	}
};
C.rmdir = async (ctx, args) => {
	for (const f of args) {
		const p = ctx.resolve(f);
		if (!ctx.fs.isDir(p)) {
			ctx.eprintln(`rmdir: ${f}: No such file or directory`);
			return 1;
		}
		ctx.fs.remove(p, false);
	}
};
C.touch = async (ctx, args) => {
	for (const f of args) {
		const p = ctx.resolve(f);
		if (!ctx.fs.exists(p)) ctx.fs.write(p, "");
	}
};
C.cp = async (ctx, args) => {
	const [a, b] = opts(args).rest;
	const pa = ctx.resolve(a);
	let pb = ctx.resolve(b);
	if (ctx.fs.isDir(pb)) pb += "/" + pa.split("/").pop();
	if (ctx.fs.read(pa) === void 0) {
		ctx.eprintln(`cp: ${a}: No such file or directory`);
		return 1;
	}
	ctx.fs.write(pb, ctx.fs.read(pa));
};
C.mv = async (ctx, args) => {
	const [a, b] = opts(args).rest;
	const pa = ctx.resolve(a);
	let pb = ctx.resolve(b);
	if (ctx.fs.isDir(pb)) pb += "/" + pa.split("/").pop();
	if (ctx.fs.read(pa) === void 0 && !ctx.fs.isDir(pa)) {
		ctx.eprintln(`mv: ${a}: No such file or directory`);
		return 1;
	}
	if (ctx.fs.isDir(pa)) {
		ctx.eprintln("mv: moving directories is not supported in the playground (move files individually)");
		return 1;
	}
	ctx.fs.write(pb, ctx.fs.read(pa));
	ctx.fs.remove(pa);
};
C.cd = async (ctx, args) => {
	const p = ctx.resolve(args[0] || "~");
	if (!ctx.fs.isDir(p)) {
		ctx.eprintln(`cd: no such file or directory: ${args[0]}`);
		return 1;
	}
	ctx.sh.cwd = p;
	ctx.sh.env.PWD = p;
};
C.pwd = async (ctx) => {
	ctx.println(ctx.cwd);
};
C.clear = async (ctx) => {
	ctx.clear();
};
C.whoami = async (ctx) => {
	ctx.println("user");
};
C.date = async (ctx) => {
	ctx.println(new Date(PG.BASE_TIME + ctx.sim.clock * 1e3).toString().replace(/GMT.*/, "UTC 2026"));
};
C.uname = async (ctx) => {
	ctx.println("Darwin");
};
C.true = async () => 0;
C.false = async () => 1;
C.sleep = async (ctx, args) => {
	await ctx.sleep(Number(args[0]) || 1);
};
C.history = async (ctx) => {
	ctx.sh.history.forEach((h, i) => ctx.println(String(i + 1).padStart(4) + "  " + h));
};
C.export = async (ctx, args) => {
	for (const a of args) {
		const [k, ...v] = a.split("=");
		ctx.sh.env[k] = v.join("=");
		ctx.sh.vars[k] = v.join("=");
	}
};
C.unset = async (ctx, args) => {
	for (const a of args) {
		delete ctx.sh.env[a];
		delete ctx.sh.vars[a];
	}
};
C.env = async (ctx) => {
	for (const [k, v] of Object.entries(ctx.env)) ctx.println(`${k}=${v}`);
};
C.which = async (ctx, args) => {
	for (const a of args) if (C[a]) ctx.println("/usr/local/bin/" + a);
	else {
		ctx.eprintln(`${a} not found`);
		return 1;
	}
};
C.base64 = async (ctx, args) => {
	const o = opts(args);
	const t = await readIn(ctx, o.rest, "base64");
	if (t === null) return 1;
	if (o.flags.has("d") || o.flags.has("D") || o.flags.has("decode")) ctx.out(PG.unb64(t.replace(/\s+/g, "")));
	else ctx.println(PG.b64(t));
};
C.tr = async (ctx, args) => {
	const o = opts(args);
	const t = ctx.stdin || "";
	const CLS = {
		lower: "abcdefghijklmnopqrstuvwxyz",
		upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		digit: "0123456789",
		space: " 	\n\r\f\v",
		alpha: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
		alnum: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
		punct: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
	};
	const expand = (raw) => {
		const s = raw.replace(/\\n/g, "\n").replace(/\\t/g, "	").replace(/\[:(\w+):\]/g, (m, c) => CLS[c] || m);
		let r = "";
		for (let k = 0; k < s.length; k++) if (s[k + 1] === "-" && k + 2 < s.length && s.charCodeAt(k + 2) >= s.charCodeAt(k)) {
			for (let c = s.charCodeAt(k); c <= s.charCodeAt(k + 2); c++) r += String.fromCharCode(c);
			k += 2;
		} else r += s[k];
		return r;
	};
	const a = expand(o.rest[0] || ""), comp = o.flags.has("c");
	const inA = (c) => comp ? !a.includes(c) : a.includes(c);
	let out;
	if (o.flags.has("d")) out = t.split("").filter((c) => !inA(c)).join("");
	else {
		const b = expand(o.rest[1] || "");
		out = t.split("").map((c) => {
			if (!inA(c)) return c;
			if (!b) return c;
			return comp ? b[b.length - 1] : b[Math.min(a.indexOf(c), b.length - 1)] || c;
		}).join("");
	}
	if (o.flags.has("s")) {
		const set = expand(o.flags.has("d") ? o.rest[1] || "" : o.rest[1] || o.rest[0] || "");
		out = out.replace(/(.)\1+/gs, (m, c) => set.includes(c) ? c : m);
	}
	ctx.out(out);
};
C.grep = async (ctx, args) => {
	const o = opts(args);
	let A = 0, B = 0;
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		let m;
		if (m = /^-([ABC])(\d*)$/.exec(a)) {
			const n = m[2] !== "" ? Number(m[2]) : Number(args[++i]);
			if (m[1] === "A" || m[1] === "C") A = n;
			if (m[1] === "B" || m[1] === "C") B = n;
		} else if (m = /^-(\d+)$/.exec(a)) A = B = Number(m[1]);
	}
	const pats = [];
	const files = [];
	let rest = o.rest.filter((x) => !/^\d+$/.test(x) || !args.some((a, k) => /^-[ABC]$/.test(a) && args[k + 1] === x));
	if (!rest.length) return 2;
	pats.push(rest.shift());
	files.push(...rest);
	const t = await readIn(ctx, files, "grep");
	if (t === null) return 2;
	const flag = o.flags.has("i") ? "i" : "";
	let res;
	try {
		res = new RegExp(pats[0].replace(/\\\|/g, "|").replace(/\\\(/g, "(").replace(/\\\)/g, ")"), flag);
	} catch (e) {
		res = new RegExp(pats[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flag);
	}
	const lines = t.split("\n");
	if (lines[lines.length - 1] === "") lines.pop();
	const hit = lines.map((l) => res.test(l) !== o.flags.has("v"));
	if (o.flags.has("c")) ctx.println(String(hit.filter(Boolean).length));
	else if (o.flags.has("q")) {} else {
		const show = /* @__PURE__ */ new Set();
		hit.forEach((h, i) => {
			if (h) for (let k = Math.max(0, i - B); k <= Math.min(lines.length - 1, i + A); k++) show.add(k);
		});
		let prev = -2;
		for (const i of [...show].sort((a, b) => a - b)) {
			if ((A || B) && prev >= 0 && i > prev + 1) ctx.println("--");
			ctx.println(o.flags.has("o") && hit[i] ? (lines[i].match(res) || [lines[i]])[0] : (o.flags.has("n") ? i + 1 + (hit[i] ? ":" : "-") : "") + lines[i]);
			prev = i;
		}
	}
	return hit.some(Boolean) ? 0 : 1;
};
var nOpt = (args, def) => {
	let n = def;
	const rest = [];
	for (let i = 0; i < args.length; i++) if (args[i] === "-n") n = Number(args[++i]);
	else if (/^-\d+$/.test(args[i])) n = Number(args[i].slice(1));
	else rest.push(args[i]);
	return {
		n,
		rest
	};
};
C.head = async (ctx, args) => {
	const { n, rest } = nOpt(args, 10);
	const t = await readIn(ctx, rest, "head");
	if (t === null) return 1;
	const l = t.split("\n");
	if (l[l.length - 1] === "") l.pop();
	ctx.out(l.slice(0, n).join("\n") + (l.length ? "\n" : ""));
};
C.tail = async (ctx, args) => {
	const { n, rest } = nOpt(args, 10);
	const t = await readIn(ctx, rest, "tail");
	if (t === null) return 1;
	const l = t.split("\n");
	if (l[l.length - 1] === "") l.pop();
	ctx.out(l.slice(-n).join("\n") + (l.length ? "\n" : ""));
};
C.wc = async (ctx, args) => {
	const o = opts(args);
	const t = await readIn(ctx, o.rest, "wc");
	if (t === null) return 1;
	if (o.flags.has("l")) ctx.println(String((t.match(/\n/g) || []).length).padStart(8));
	else ctx.println(`${(t.match(/\n/g) || []).length} ${t.split(/\s+/).filter(Boolean).length} ${t.length}`);
};
C.sort = async (ctx, args) => {
	const o = opts(args);
	const t = await readIn(ctx, o.rest, "sort");
	if (t === null) return 1;
	const l = t.split("\n");
	if (l[l.length - 1] === "") l.pop();
	l.sort();
	if (o.flags.has("r")) l.reverse();
	ctx.out(l.join("\n") + "\n");
};
C.uniq = async (ctx, args) => {
	const l = (ctx.stdin || "").split("\n");
	const out = l.filter((x, i) => i === 0 || x !== l[i - 1]);
	ctx.out(out.join("\n"));
};
C.openssl = async (ctx, args) => {
	const sub = args[0];
	const g = (f) => {
		const i = args.indexOf(f);
		return i >= 0 ? args[i + 1] : null;
	};
	if (sub === "genrsa") {
		const out = g("-out");
		const txt = "-----BEGIN RSA PRIVATE KEY-----\nSIMULATED-KEY-" + PG.hex(24) + "\n-----END RSA PRIVATE KEY-----\n";
		if (out) ctx.fs.write(ctx.resolve(out), txt);
		else ctx.out(txt);
		ctx.eprintln("Generating RSA private key, 2048 bit long modulus (simulated)");
		return 0;
	}
	if (sub === "req") {
		const key = g("-key"), out = g("-out"), subj = g("-subj");
		if (!key || !ctx.fs.read(ctx.resolve(key))) {
			ctx.eprintln("openssl: unable to load private key (use: openssl genrsa -out file 2048)");
			return 1;
		}
		const cn = /CN=([^/]+)/.exec(subj || ""), org = [...(subj || "").matchAll(/O=([^/]+)/g)].map((x) => x[1]);
		const txt = `-----BEGIN CERTIFICATE REQUEST-----\nCN=${cn ? cn[1] : ""};O=${org.join(",")};KEY=${ctx.fs.read(ctx.resolve(key)).split("\n")[1]}\n-----END CERTIFICATE REQUEST-----\n`;
		if (out) ctx.fs.write(ctx.resolve(out), txt);
		else ctx.out(txt);
		return 0;
	}
	ctx.eprintln("openssl: only \"genrsa\" and \"req -new\" are simulated");
	return 1;
};
C.tar = async (ctx, args) => {
	if ((ctx.stdin || "").startsWith("SIMULATED-DOWNLOAD")) {
		ctx.fs.write(ctx.resolve("darwin-amd64/helm"), "SIMULATED-HELM-BINARY");
		ctx.fs.write(ctx.resolve("darwin-amd64/LICENSE"), "Apache-2.0");
		return 0;
	}
	ctx.eprintln("tar: nothing to extract in the playground");
	return 1;
};
C.brew = async (ctx, args) => {
	const [sub, ...pk] = args;
	if (sub === "install" || sub === "upgrade") {
		for (const p of pk.filter((x) => !x.startsWith("-"))) {
			ctx.println(`==> Downloading https://ghcr.io/v2/homebrew/core/${p}`);
			await ctx.delay(150);
			ctx.println(`==> Pouring ${p}--bottle.arm64.tar.gz`);
			ctx.println(`🍺  /opt/homebrew/Cellar/${p}: installed (simulated)`);
		}
		return 0;
	}
	if (sub === "uninstall") {
		ctx.println("Uninstalling (simulated)");
		return 0;
	}
	ctx.println("brew: simulated. Try: brew install kind kubectl k3d");
};
C.lsof = async (ctx, args) => {
	const m = /:(\d+)/.exec(args.join(" "));
	const port = m && Number(m[1]);
	if (port && ctx.sim.containers.find((c) => c.status === "running" && c.ports.some((p) => p.host === port))) ctx.println(`COMMAND   PID USER   FD   TYPE NODE NAME\ncom.docke 1234 user   99u  IPv4  TCP *:${port} (LISTEN)`);
	else return 1;
};
C.open = async (ctx) => {
	ctx.println("(open: not available in the playground)");
};
C.help = async (ctx, args) => {
	ctx.println(`KubeDojo — a simulator. Nothing here is real: no Docker, no cluster. Type commands in ANY order.

  Cluster tools    kind · k3d · docker · kubectl (alias: kc, k) · helm2 · gcloud (clusters list/delete)
  Editor           vi FILE (also vim/view): i = type, Esc, :wq = save & quit, :q! = quit, :help
  Shell            echo cat ls tree mkdir rm cd pwd find grep awk sed cut head tail wc sort uniq tee xargs jq watch curl openssl
                   pipes |   redirects > >>   VAR=x  $(...)  $((1+2))   heredocs <<'EOF'   if/while/for   alias
  Playground       tour           (a 2-minute walkthrough of the whole page)
                   export-script  (build a bash script that recreates this setup on a real machine)
                   sim help       (load generator, crash a pod, speed, reset)

  Start here
    kind create cluster --name local-cluster-1       # or: k3d cluster create local-cluster-1 --agents 2
    kubectl config current-context                   # you start inside a fake PRODUCTION cluster!
    kubectl get nodes
    kubectl create namespace web
    kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web
    kubectl get pods -n web -o wide
    helm2 ls                                         # after: helm2 init  (chart is in ~/myapp)
    kubectl exec -it deploy/web -n web -- sh         # a real(ish) shell inside a pod: ps, cat, curl, exit
    docker run -it --rm alpine sh                    # …and inside a plain container

  Each tool has its own help:  kind --help · k3d --help · docker --help · kubectl --help · helm2 --help
  Keys:  ↑/↓ history · Tab complete · Ctrl-C stop a running command · Ctrl-L clear
  Click any command in the left panel to put it on the prompt (Shift+click runs it).`);
};
C.sim = async (ctx, args) => {
	const sub = args[0];
	const sim = ctx.sim;
	if (!sub || sub === "help") {
		ctx.println(`sim — playground controls
  sim load <deployment> <percent> [-n ns]   fake CPU demand, as % of ONE pod's request in total (e.g. 300). HPA reacts to it.
  sim crash <pod> [-n ns]                    make a container crash (watch CrashLoopBackOff)
  sim speed <1|2|4|8>                        how fast simulated time runs
  sim images                                 public images the playground can "pull"
  sim time                                   simulated clock
  sim reset                                  throw everything away and start over`);
		return 0;
	}
	if (sub === "speed") {
		sim.speed = Math.max(1, Math.min(16, Number(args[1]) || 1));
		ctx.println("simulated time now runs " + sim.speed + "x");
		return 0;
	}
	if (sub === "time") {
		ctx.println(`simulated time: ${PG.fmtAge(sim.clock)} since start`);
		return 0;
	}
	if (sub === "images") {
		ctx.println("nginx httpd caddy redis memcached postgres mysql mongo rabbitmq busybox alpine ubuntu curlimages/curl registry hashicorp/consul traefik node python grafana/grafana prom/prometheus kennethreitz/httpbin\n(plus anything you build with docker build, or push to your local registry)");
		return 0;
	}
	if (sub === "reset") {
		await PG.resetHook();
		return 0;
	}
	const o = opts(args.slice(1));
	const nsI = args.indexOf("-n");
	const ns = nsI >= 0 ? args[nsI + 1] : "default";
	const cl = sim.currentCluster();
	if (!cl) {
		ctx.eprintln("no current cluster (create one first)");
		return 1;
	}
	if (sub === "load") {
		const name = o.rest[0].replace(/^deploy(ment)?s?\//, "");
		const dep = cl.find("deployments", name, ns);
		if (!dep) {
			ctx.eprintln(`deployment "${name}" not found in ${ns}`);
			return 1;
		}
		dep._load = Number(o.rest[1]);
		ctx.println(`simulated demand on ${name}: ${o.rest[1]}% of one pod's CPU request in total`);
		return 0;
	}
	if (sub === "crash") {
		const p = cl.find("pods", o.rest[0].replace(/^pods?\//, ""), ns);
		if (!p) {
			ctx.eprintln("pod not found");
			return 1;
		}
		p._sim.forceCrash = true;
		ctx.println("pod " + p.metadata.name + " will crash");
		return 0;
	}
	ctx.eprintln("sim: unknown subcommand; try: sim help");
	return 1;
};
PG.testExpr = (ctx, a) => {
	a = [...a];
	const neg = a[0] === "!";
	if (neg) a.shift();
	let r = false;
	if (a.length === 1) r = a[0] !== "";
	else if (a.length === 2) {
		const [op, v] = a;
		r = op === "-z" ? v === "" : op === "-n" ? v !== "" : op === "-f" ? ctx.fs.read(ctx.resolve(v)) !== void 0 : op === "-d" ? ctx.fs.isDir(ctx.resolve(v)) : op === "-e" ? ctx.fs.exists(ctx.resolve(v)) : false;
	} else if (a.length === 3) {
		const [x, op, y] = a;
		const nx = Number(x), ny = Number(y);
		r = op === "=" || op === "==" ? x === y : op === "!=" ? x !== y : op === "-eq" ? nx === ny : op === "-ne" ? nx !== ny : op === "-lt" ? nx < ny : op === "-le" ? nx <= ny : op === "-gt" ? nx > ny : op === "-ge" ? nx >= ny : false;
	}
	return neg ? !r : r;
};
C.test = async (ctx, args) => PG.testExpr(ctx, args) ? 0 : 1;
C["["] = async (ctx, args) => {
	if (args[args.length - 1] !== "]") {
		ctx.eprintln("[: missing `]'");
		return 2;
	}
	return PG.testExpr(ctx, args.slice(0, -1)) ? 0 : 1;
};
C["[["] = async (ctx, args) => {
	if (args[args.length - 1] !== "]]") {
		ctx.eprintln("[[: missing `]]'");
		return 2;
	}
	return PG.testExpr(ctx, args.slice(0, -1)) ? 0 : 1;
};
C.tour = async (ctx) => {
	if (PG.startTour) PG.startTour(0);
	else ctx.println("(the tour runs in the browser page: press the ▶ Tour button)");
};
C.less = C.more = async (ctx, args) => C.cat(ctx, args);
C.seq = async (ctx, args) => {
	const n = args.map(Number);
	const [a, st, b] = n.length === 1 ? [
		1,
		1,
		n[0]
	] : n.length === 2 ? [
		n[0],
		1,
		n[1]
	] : n;
	const out = [];
	for (let i = a; st > 0 ? i <= b : i >= b; i += st) out.push(i);
	ctx.println(out.join("\n"));
};
C.read = async (ctx, args) => {
	const names = args.filter((a) => !a.startsWith("-"));
	const line = (ctx.stdin || "").split("\n")[0];
	const parts = line.split(/\s+/);
	names.forEach((n, i) => {
		const v = i === names.length - 1 ? parts.slice(i).join(" ") : parts[i] || "";
		ctx.sh.vars[n] = v;
		ctx.sh.env[n] = v;
	});
	return line === "" && !ctx.stdin ? 1 : 0;
};
C.alias = async (ctx, args) => {
	if (!args.length) {
		for (const [k, v] of Object.entries(ctx.sh.aliases)) ctx.println(`alias ${k}='${v}'`);
		return 0;
	}
	for (const a of args) {
		const i = a.indexOf("=");
		if (i < 0) {
			const v = ctx.sh.aliases[a];
			if (v) ctx.println(`alias ${a}='${v}'`);
			else {
				ctx.eprintln(`alias: ${a}: not found`);
				return 1;
			}
		} else ctx.sh.aliases[a.slice(0, i)] = a.slice(i + 1);
	}
	return 0;
};
C.unalias = async (ctx, args) => {
	for (const a of args) delete ctx.sh.aliases[a];
};
C.tee = async (ctx, args) => {
	const o = PG.opts(args);
	const t = ctx.stdin || "";
	for (const f of o.rest) {
		const p = ctx.resolve(f);
		ctx.fs.write(p, (o.flags.has("a") ? ctx.fs.read(p) || "" : "") + t);
	}
	ctx.out(t);
};
C.cut = async (ctx, args) => {
	let d = "	", f = null, c = null;
	const files = [];
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "-d") d = args[++i];
		else if (a.startsWith("-d")) d = a.slice(2);
		else if (a === "-f") f = args[++i];
		else if (a.startsWith("-f")) f = a.slice(2);
		else if (a === "-c") c = args[++i];
		else if (a.startsWith("-c")) c = a.slice(2);
		else files.push(a);
	}
	const t = await readIn(ctx, files, "cut");
	if (t === null) return 1;
	const ranges = (spec) => spec.split(",").map((r) => {
		const m = /^(\d*)-?(\d*)$/.exec(r);
		const hasDash = r.includes("-");
		const a = m[1] ? Number(m[1]) : 1;
		return [a, hasDash ? m[2] ? Number(m[2]) : Infinity : a];
	});
	const pick = (arr, rs) => arr.filter((_, i) => rs.some(([a, b]) => i + 1 >= a && i + 1 <= b));
	const lines = t.split("\n");
	if (lines[lines.length - 1] === "") lines.pop();
	ctx.println(lines.map((l) => c ? pick(l.split(""), ranges(c)).join("") : pick(l.split(d), ranges(f || "1")).join(d)).join("\n"));
};
C.find = async (ctx, args) => {
	let start = ".";
	let name = null, type = null;
	for (let i = 0; i < args.length; i++) if (args[i] === "-name" || args[i] === "-iname") name = args[++i];
	else if (args[i] === "-type") type = args[++i];
	else if (!args[i].startsWith("-") && i === 0) start = args[i];
	const base = ctx.resolve(start);
	const re = name ? new RegExp("^" + name.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$") : null;
	const rel = (p) => start.startsWith("/") || start.startsWith("~") ? p : start === "." ? "." + p.slice(base.length) : start + p.slice(base.length);
	const all = [...ctx.fs.dirs].filter((d) => d === base || d.startsWith(base + "/")).map((p) => ({
		p,
		d: true
	})).concat(Object.keys(ctx.fs.files).filter((f) => f.startsWith(base + "/") || f === base).map((p) => ({
		p,
		d: false
	})));
	all.sort((a, b) => a.p.localeCompare(b.p));
	const res = all.filter((x) => (!type || type === "d" === x.d) && (!re || re.test(x.p.split("/").pop()))).map((x) => rel(x.p));
	if (res.length) ctx.println(res.join("\n"));
};
C.xargs = async (ctx, args) => {
	let n = 0, repl = null;
	const cmd = [];
	for (let i = 0; i < args.length; i++) if (args[i] === "-n") n = Number(args[++i]);
	else if (/^-n\d+$/.test(args[i])) n = Number(args[i].slice(2));
	else if (args[i] === "-I") repl = args[++i];
	else if (args[i].startsWith("-I")) repl = args[i].slice(2);
	else cmd.push(args[i]);
	if (!cmd.length) cmd.push("echo");
	const items = (ctx.stdin || "").split(repl ? "\n" : /\s+/).filter(Boolean);
	const q = (x) => "'" + String(x).replace(/'/g, "'\\''") + "'";
	const sink = { write: (s) => ctx.out(s) };
	const runs = [];
	if (repl) for (const it of items) runs.push(cmd.map((c) => c.split(repl).join(it)).join(" "));
	else if (n) for (let i = 0; i < items.length; i += n) runs.push(cmd.join(" ") + " " + items.slice(i, i + n).map(q).join(" "));
	else runs.push(cmd.join(" ") + " " + items.map(q).join(" "));
	for (const r of runs) await ctx.sh.runScript(r, sink);
};
C.watch = async (ctx, args) => {
	let secs = 2;
	const rest = [...args];
	while (rest[0] && rest[0].startsWith("-")) if (rest[0] === "-n") {
		secs = Number(rest[1]) || 2;
		rest.splice(0, 2);
	} else rest.shift();
	const cmd = rest.join(" ");
	if (!cmd) {
		ctx.eprintln("watch: no command");
		return 1;
	}
	while (true) {
		let buf = "";
		await ctx.sh.runScript(cmd, { write: (s) => {
			buf += s;
		} });
		ctx.clear();
		ctx.println(`Every ${secs.toFixed(1)}s: ${cmd}    ${new Date(PG.BASE_TIME + ctx.sim.clock * 1e3).toUTCString().slice(17, 25)}\n`);
		ctx.out(buf);
		await ctx.sleep(secs);
	}
};
var fmtDate = (fmt, t) => {
	const d = new Date(PG.BASE_TIME + t * 1e3);
	const p = (n, w = 2) => String(n).padStart(w, "0");
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	], mons = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	];
	return fmt.replace(/%([YmdHMSsFTZaAbBejy%])/g, (m, c) => ({
		Y: d.getUTCFullYear(),
		m: p(d.getUTCMonth() + 1),
		d: p(d.getUTCDate()),
		e: String(d.getUTCDate()).padStart(2),
		H: p(d.getUTCHours()),
		M: p(d.getUTCMinutes()),
		S: p(d.getUTCSeconds()),
		s: Math.floor(d.getTime() / 1e3),
		F: `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`,
		T: `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`,
		Z: "UTC",
		a: days[d.getUTCDay()].slice(0, 3),
		A: days[d.getUTCDay()],
		b: mons[d.getUTCMonth()].slice(0, 3),
		B: mons[d.getUTCMonth()],
		y: p(d.getUTCFullYear() % 100),
		j: p(Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5), 3),
		"%": "%"
	})[c]);
};
C.date = async (ctx, args) => {
	const f = args.find((a) => a.startsWith("+"));
	ctx.println(f ? fmtDate(f.slice(1), ctx.sim.clock) : fmtDate("%a %b %e %T UTC %Y", ctx.sim.clock));
};
C.sort = async (ctx, args) => {
	const o = PG.opts(args);
	const t = await readIn(ctx, o.rest, "sort");
	if (t === null) return 1;
	let l = t.split("\n");
	if (l[l.length - 1] === "") l.pop();
	if (o.flags.has("n")) l.sort((a, b) => parseFloat(a) - parseFloat(b));
	else l.sort();
	if (o.flags.has("u")) l = l.filter((x, i) => i === 0 || x !== l[i - 1]);
	if (o.flags.has("r")) l.reverse();
	ctx.println(l.join("\n"));
};
C.uniq = async (ctx, args) => {
	const o = PG.opts(args);
	const l = (ctx.stdin || "").split("\n");
	if (l[l.length - 1] === "") l.pop();
	const out = [];
	for (const x of l) if (out.length && out[out.length - 1][0] === x) out[out.length - 1][1]++;
	else out.push([x, 1]);
	ctx.println(out.map(([x, n]) => o.flags.has("c") ? String(n).padStart(4) + " " + x : x).join("\n"));
};
C.wc = async (ctx, args) => {
	const o = PG.opts(args);
	const t = await readIn(ctx, o.rest, "wc");
	if (t === null) return 1;
	const lines = (t.match(/\n/g) || []).length, words = t.split(/\s+/).filter(Boolean).length;
	if (o.flags.has("l")) ctx.println(String(lines).padStart(8));
	else if (o.flags.has("w")) ctx.println(String(words).padStart(8));
	else if (o.flags.has("c")) ctx.println(String(t.length).padStart(8));
	else ctx.println(`${String(lines).padStart(8)}${String(words).padStart(8)}${String(t.length).padStart(8)}`);
};
C.sed = async (ctx, args) => {
	let inplace = false, quiet = false;
	const scripts = [];
	const files = [];
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "-i") {
			inplace = true;
			if (args[i + 1] === "") i++;
		} else if (a === "-n") quiet = true;
		else if (a === "-e") scripts.push(args[++i]);
		else if (a === "-E" || a === "-r") {} else if (!scripts.length) scripts.push(a);
		else files.push(a);
	}
	const progs = [];
	for (const sc of scripts) for (const part of sc.split(/;|\n/).map((x) => x.trim()).filter(Boolean)) {
		let rest = part, addr = null;
		const rx = /^\/((?:[^\/\\]|\\.)*)\//;
		const num = /^(\d+|\$)/;
		const parseA = () => {
			let m;
			if (m = rx.exec(rest)) {
				rest = rest.slice(m[0].length);
				return { re: new RegExp(m[1]) };
			}
			if (m = num.exec(rest)) {
				rest = rest.slice(m[0].length);
				return { n: m[1] === "$" ? Infinity : Number(m[1]) };
			}
			return null;
		};
		const a1 = parseA();
		if (a1) {
			if (rest[0] === ",") {
				rest = rest.slice(1);
				addr = {
					a1,
					a2: parseA()
				};
			} else addr = { a1 };
		}
		const m2 = /^s(.)(.*?)\1(.*?)\1([gI]*)$/.exec(rest);
		if (m2) progs.push({
			addr,
			cmd: "s",
			re: new RegExp(m2[2], (m2[4].includes("g") ? "g" : "") + (m2[4].includes("I") ? "i" : "")),
			rep: m2[3].replace(/\\n/g, "\n")
		});
		else if (rest === "p" || rest === "d") progs.push({
			addr,
			cmd: rest
		});
		else {
			ctx.eprintln("sed: unsupported command: " + part + " (supported: s///, p, d, with line/regex addresses)");
			return 1;
		}
	}
	const apply = (t) => {
		const lines = t.split("\n");
		if (lines[lines.length - 1] === "") lines.pop();
		const out = [];
		const active = progs.map(() => false);
		lines.forEach((line, idx) => {
			const n = idx + 1;
			let cur = line, deleted = false;
			progs.forEach((pr, k) => {
				if (deleted) return;
				let on = true;
				if (pr.addr) {
					const { a1, a2 } = pr.addr;
					const hit1 = a1.re ? a1.re.test(cur) : a1.n === Infinity ? n === lines.length : n === a1.n;
					if (!a2) on = hit1;
					else {
						if (!active[k] && hit1) active[k] = true, on = true;
						else on = active[k];
						if (active[k]) {
							if ((a2.re ? a2.re.test(cur) && !(a1.re && hit1 && a2.re.source === a1.re.source && !active[k]) : a2.n === Infinity ? n === lines.length : n >= a2.n) && !(hit1 && n === idx + 1 && a2.re && false)) active[k] = false;
						}
					}
				}
				if (!on) return;
				if (pr.cmd === "d") deleted = true;
				else if (pr.cmd === "p") out.push(cur);
				else if (pr.cmd === "s") cur = cur.replace(pr.re, pr.rep);
			});
			if (!deleted && !quiet) out.push(cur);
		});
		return out.join("\n") + (out.length ? "\n" : "");
	};
	if (inplace || files.length) for (const f of files) {
		const p = ctx.resolve(f);
		const c = ctx.fs.read(p);
		if (c === void 0) {
			ctx.eprintln(`sed: ${f}: No such file or directory`);
			return 1;
		}
		if (inplace) ctx.fs.write(p, apply(c));
		else ctx.out(apply(c));
	}
	else ctx.out(apply(ctx.stdin || ""));
};
PG.awk = (prog, input, FS) => {
	const rules = [];
	let i = 0;
	const P = prog;
	const skipWs = () => {
		while (i < P.length && /[\s;]/.test(P[i])) i++;
	};
	const readBlock = () => {
		let d = 0, q = null, st = i;
		for (; i < P.length; i++) {
			const c = P[i];
			if (q) {
				if (c === "\\") i++;
				else if (c === q) q = null;
				continue;
			}
			if (c === "\"") q = c;
			else if (c === "{") d++;
			else if (c === "}") {
				d--;
				if (d === 0) {
					i++;
					return P.slice(st + 1, i - 1);
				}
			}
		}
		return P.slice(st + 1);
	};
	while (skipWs(), i < P.length) {
		let pat = "";
		while (i < P.length && P[i] !== "{") if (P[i] === "/") {
			const j = P.indexOf("/", i + 1);
			pat += P.slice(i, j + 1);
			i = j + 1;
		} else pat += P[i++];
		pat = pat.trim();
		let body = null;
		if (P[i] === "{") body = readBlock();
		rules.push({
			pat,
			body
		});
	}
	const vars = {};
	let NR = 0, F = [""];
	const tokenize = (s) => s.match(/"(?:[^"\\]|\\.)*"|\/(?:[^\/\\]|\\.)+\/|\$|\d+\.?\d*|[A-Za-z_]\w*|==|!=|<=|>=|&&|\|\||!~|\+\+|--|\+=|-=|\*=|\/=|[-+*\/%()<>=!~,?:]/g) || [];
	const num = (v) => {
		const n = Number(v);
		return v === "" || v === void 0 || isNaN(n) ? 0 : n;
	};
	const isNum = (v) => typeof v === "number" || v !== "" && !isNaN(Number(v));
	const evalExpr = (src) => {
		const t = tokenize(src);
		let p = 0;
		const prim = () => {
			const x = t[p++];
			if (x === void 0) return "";
			if (x === "(") {
				const v = ternary();
				p++;
				return v;
			}
			if (x === "$") {
				const idx = prim();
				const n = typeof idx === "number" ? idx : num(idx);
				return n === 0 ? F[0] : F[n] === void 0 ? "" : F[n];
			}
			if (x === "-") return -num(prim());
			if (x === "!") return prim() ? 0 : 1;
			if (x[0] === "\"") return x.slice(1, -1).replace(/\\n/g, "\n").replace(/\\t/g, "	").replace(/\\"/g, "\"");
			if (x[0] === "/") return new RegExp(x.slice(1, -1)).test(F[0]) ? 1 : 0;
			if (/^\d/.test(x)) return Number(x);
			if (x === "NR") return NR;
			if (x === "NF") return F.length - 1;
			if (t[p] === "(") {
				p++;
				const args = [];
				if (t[p] !== ")") do
					args.push(ternary());
				while (t[p] === "," && ++p);
				p++;
				return ({
					length: (a) => String(a === void 0 ? F[0] : a).length,
					toupper: (a) => String(a).toUpperCase(),
					tolower: (a) => String(a).toLowerCase(),
					substr: (a, b, c) => String(a).substr(num(b) - 1, c === void 0 ? void 0 : num(c)),
					int: (a) => Math.trunc(num(a)),
					sqrt: (a) => Math.sqrt(num(a))
				}[x] || (() => ""))(...args);
			}
			if (t[p] === "++" || t[p] === "--") {
				const v = num(vars[x]);
				vars[x] = v + (t[p++] === "++" ? 1 : -1);
				return v;
			}
			return vars[x] === void 0 ? "" : vars[x];
		};
		const mul = () => {
			let v = prim();
			while ([
				"*",
				"/",
				"%"
			].includes(t[p])) {
				const o = t[p++];
				const r = num(prim());
				v = o === "*" ? num(v) * r : o === "/" ? num(v) / r : num(v) % r;
			}
			return v;
		};
		const add = () => {
			let v = mul();
			while (["+", "-"].includes(t[p])) {
				const o = t[p++];
				const r = num(mul());
				v = o === "+" ? num(v) + r : num(v) - r;
			}
			return v;
		};
		const concat = () => {
			let v = add();
			while (p < t.length && ![
				"==",
				"!=",
				"<=",
				">=",
				"<",
				">",
				"&&",
				"||",
				")",
				",",
				"~",
				"!~",
				"?",
				":",
				"="
			].includes(t[p]) && ![
				"+=",
				"-=",
				"*=",
				"/="
			].includes(t[p])) v = String(v) + String(add());
			return v;
		};
		const cmp = () => {
			let v = concat();
			while ([
				"==",
				"!=",
				"<=",
				">=",
				"<",
				">",
				"~",
				"!~"
			].includes(t[p])) {
				const o = t[p++];
				const r = concat();
				if (o === "~" || o === "!~") {
					const hit = new RegExp(String(r)).test(String(v));
					v = o === "~" === hit ? 1 : 0;
				} else {
					const both = isNum(v) && isNum(r);
					const a = both ? num(v) : String(v), b = both ? num(r) : String(r);
					v = {
						"==": a === b,
						"!=": a !== b,
						"<=": a <= b,
						">=": a >= b,
						"<": a < b,
						">": a > b
					}[o] ? 1 : 0;
				}
			}
			return v;
		};
		const and = () => {
			let v = cmp();
			while (t[p] === "&&") {
				p++;
				const r = cmp();
				v = v && r ? 1 : 0;
			}
			return v;
		};
		const or = () => {
			let v = and();
			while (t[p] === "||") {
				p++;
				const r = and();
				v = v || r ? 1 : 0;
			}
			return v;
		};
		const ternary = () => {
			const c = or();
			if (t[p] === "?") {
				p++;
				const a = ternary();
				p++;
				const b = ternary();
				return c ? a : b;
			}
			return c;
		};
		return ternary();
	};
	const splitCommas = (s) => {
		const out = [];
		let d = 0, q = null, cur = "";
		for (let k = 0; k < s.length; k++) {
			const c = s[k];
			if (q) {
				cur += c;
				if (c === "\\") cur += s[++k];
				else if (c === q) q = null;
				continue;
			}
			if (c === "\"") {
				q = c;
				cur += c;
				continue;
			}
			if (c === "(") d++;
			if (c === ")") d--;
			if (c === "," && d === 0) {
				out.push(cur);
				cur = "";
				continue;
			}
			cur += c;
		}
		out.push(cur);
		return out;
	};
	const stmts = (body) => {
		const out = [];
		let cur = "", q = null, d = 0;
		for (let k = 0; k < body.length; k++) {
			const c = body[k];
			if (q) {
				cur += c;
				if (c === "\\") cur += body[++k];
				else if (c === q) q = null;
				continue;
			}
			if (c === "\"") {
				q = c;
				cur += c;
				continue;
			}
			if (c === "{") d++;
			if (c === "}") d--;
			if ((c === ";" || c === "\n") && d === 0) {
				out.push(cur);
				cur = "";
				continue;
			}
			cur += c;
		}
		out.push(cur);
		return out.map((x) => x.trim()).filter(Boolean);
	};
	let out = "";
	const run = (body) => {
		for (const st of stmts(body)) {
			let m;
			if (m = /^print(?:\s+(.*))?$/.exec(st)) out += (m[1] ? splitCommas(m[1]).map((x) => String(evalExpr(x))).join(" ") : F[0]) + "\n";
			else if (m = /^printf\s+(.*)$/.exec(st)) {
				const a = splitCommas(m[1]);
				const f = String(evalExpr(a[0]));
				let k = 1;
				out += f.replace(/%(-?\d*)(s|d|f)/g, (mm, w, c) => {
					const v = a[k] !== void 0 ? evalExpr(a[k++]) : "";
					return String(c === "d" ? Math.trunc(num(v)) : v).padStart(Math.abs(Number(w)) || 0);
				});
			} else if (m = /^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|=)\s*(.*)$/.exec(st)) {
				const v = evalExpr(m[3]);
				vars[m[1]] = m[2] === "=" ? v : m[2] === "+=" ? num(vars[m[1]]) + num(v) : m[2] === "-=" ? num(vars[m[1]]) - num(v) : m[2] === "*=" ? num(vars[m[1]]) * num(v) : num(vars[m[1]]) / num(v);
			} else if (m = /^([A-Za-z_]\w*)(\+\+|--)$/.exec(st)) vars[m[1]] = num(vars[m[1]]) + (m[2] === "++" ? 1 : -1);
		}
	};
	const sep = FS === void 0 ? null : FS;
	const lines = input.split("\n");
	if (lines[lines.length - 1] === "") lines.pop();
	for (const r of rules) if (r.pat === "BEGIN") run(r.body || "");
	for (const l of lines) {
		NR++;
		F = [l, ...sep === null || sep === " " ? l.trim().split(/\s+/).filter(Boolean) : l.split(sep.length === 1 ? sep : new RegExp(sep))];
		for (const r of rules) {
			if (r.pat === "BEGIN" || r.pat === "END") continue;
			let ok = true;
			if (r.pat) ok = /^\/.*\/$/.test(r.pat) ? new RegExp(r.pat.slice(1, -1)).test(l) : !!evalExpr(r.pat);
			if (ok) {
				if (r.body === null) out += l + "\n";
				else run(r.body);
			}
		}
	}
	for (const r of rules) if (r.pat === "END") run(r.body || "");
	return out;
};
C.awk = async (ctx, args) => {
	let FS;
	const rest = [];
	for (let i = 0; i < args.length; i++) if (args[i] === "-F") FS = args[++i];
	else if (args[i].startsWith("-F")) FS = args[i].slice(2);
	else rest.push(args[i]);
	const prog = rest.shift();
	if (!prog) {
		ctx.eprintln("usage: awk [-F fs] program [file ...]");
		return 2;
	}
	const t = await readIn(ctx, rest, "awk");
	if (t === null) return 2;
	try {
		ctx.out(PG.awk(prog, t, FS));
	} catch (e) {
		ctx.eprintln("awk: syntax error: " + e.message);
		return 2;
	}
};
PG.jq = (filter, data) => {
	const splitTopJ = (s, sep) => {
		const out = [];
		let cur = "", d = 0, q = null;
		for (let i = 0; i < s.length; i++) {
			const c = s[i];
			if (q) {
				cur += c;
				if (c === "\\") cur += s[++i];
				else if (c === q) q = null;
				continue;
			}
			if (c === "\"") {
				q = c;
				cur += c;
				continue;
			}
			if ("([{".includes(c)) d++;
			if (")]}".includes(c)) d--;
			if (d === 0 && s.startsWith(sep, i)) {
				out.push(cur);
				cur = "";
				i += sep.length - 1;
				continue;
			}
			cur += c;
		}
		out.push(cur);
		return out;
	};
	const truthy = (v) => v !== null && v !== false && v !== void 0;
	const ev = (src, v) => {
		src = src.trim();
		if (src === "") return [v];
		const pipes = splitTopJ(src, "|");
		if (pipes.length > 1) return pipes.reduce((vals, st) => vals.flatMap((x) => ev(st, x)), [v]);
		const ors = splitTopJ(src, " or ");
		if (ors.length > 1) return [ors.some((o) => ev(o, v).some(truthy))];
		const ands = splitTopJ(src, " and ");
		if (ands.length > 1) return [ands.every((o) => ev(o, v).some(truthy))];
		for (const op of [
			"==",
			"!=",
			">=",
			"<=",
			">",
			"<"
		]) {
			const parts = splitTopJ(src, " " + op + " ");
			if (parts.length === 2) {
				const a = ev(parts[0], v)[0], b = ev(parts[1], v)[0];
				return [{
					"==": JSON.stringify(a) === JSON.stringify(b),
					"!=": JSON.stringify(a) !== JSON.stringify(b),
					">": a > b,
					"<": a < b,
					">=": a >= b,
					"<=": a <= b
				}[op]];
			}
		}
		let m;
		if (src === ".") return [v];
		if (/^-?\d+(\.\d+)?$/.test(src)) return [Number(src)];
		if (src[0] === "\"" && src[src.length - 1] === "\"") return [JSON.parse(src)];
		if (src === "null") return [null];
		if (src === "true") return [true];
		if (src === "false") return [false];
		if (src[0] === "[" && src[src.length - 1] === "]" && !/^\[\d*\]$/.test(src)) return [ev(src.slice(1, -1), v).flat ? ev(src.slice(1, -1), v) : []];
		if (src[0] === "{" && src[src.length - 1] === "}") {
			const o = {};
			for (const pair of splitTopJ(src.slice(1, -1), ",")) {
				const kv = splitTopJ(pair, ":");
				if (kv.length === 1) {
					const k = kv[0].trim().replace(/^\./, "");
					o[k] = (v || {})[k];
				} else {
					const k = kv[0].trim().replace(/^"|"$/g, "");
					o[k] = ev(kv.slice(1).join(":"), v)[0];
				}
			}
			return [o];
		}
		if (m = /^select\((.*)\)$/.exec(src)) return ev(m[1], v).some(truthy) ? [v] : [];
		if (m = /^map\((.*)\)$/.exec(src)) return [(Array.isArray(v) ? v : Object.values(v)).flatMap((x) => ev(m[1], x))];
		if (m = /^test\("(.*)"\)$/.exec(src)) return [new RegExp(m[1]).test(String(v))];
		if (m = /^join\("(.*)"\)$/.exec(src)) return [(v || []).join(m[1])];
		if (m = /^has\("(.*)"\)$/.exec(src)) return [v !== null && typeof v === "object" && m[1] in v];
		if (src === "length") return [v === null ? 0 : typeof v === "string" || Array.isArray(v) ? v.length : typeof v === "object" ? Object.keys(v).length : Math.abs(v)];
		if (src === "keys") return [Array.isArray(v) ? v.map((_, i) => i) : Object.keys(v).sort()];
		if (src === "not") return [!truthy(v)];
		if (src === "first") return [v[0]];
		if (src === "last") return [v[v.length - 1]];
		if (src === "add") return [v.reduce((a, b) => a === null ? b : typeof a === "number" ? a + b : Array.isArray(a) ? a.concat(b) : typeof a === "string" ? a + b : {
			...a,
			...b
		}, null)];
		if (src === "sort") return [[...v].sort()];
		if (src === "unique") return [[...new Set(v.map((x) => JSON.stringify(x)))].map((x) => JSON.parse(x))];
		if (src === "tostring") return [typeof v === "string" ? v : JSON.stringify(v)];
		if (src === "type") return [v === null ? "null" : Array.isArray(v) ? "array" : typeof v === "object" ? "object" : typeof v];
		if (src === "to_entries") return [Object.entries(v).map(([key, value]) => ({
			key,
			value
		}))];
		if (src[0] === ".") {
			let cur = [v];
			const re = /\.\.?([A-Za-z_][\w-]*|"[^"]*")|\[("[^"]*"|-?\d+)?\]|\.\[("[^"]*"|-?\d+)?\]/y;
			let pos = 0, mm;
			while (pos < src.length && (re.lastIndex = pos, mm = re.exec(src))) {
				pos = re.lastIndex;
				if (src[pos] === "?") pos++;
				const name = mm[1], idx = mm[2] !== void 0 ? mm[2] : mm[3];
				const isBracket = mm[0].includes("[");
				cur = cur.flatMap((x) => {
					if (name !== void 0) return [x === null || x === void 0 ? null : x[name.replace(/^"|"$/g, "")] === void 0 ? null : x[name.replace(/^"|"$/g, "")]];
					if (isBracket && idx === void 0) return Array.isArray(x) ? x : x && typeof x === "object" ? Object.values(x) : [];
					const k = idx[0] === "\"" ? JSON.parse(idx) : Number(idx);
					return [x === null ? null : x[k < 0 && Array.isArray(x) ? x.length + k : k] ?? null];
				});
			}
			if (pos < src.length) throw new Error("unsupported expression: " + src.slice(pos));
			return cur;
		}
		throw new Error("unsupported filter: " + src);
	};
	return ev(filter, data);
};
C.jq = async (ctx, args) => {
	const raw = args.includes("-r") || args.includes("--raw-output"), compact = args.includes("-c");
	const rest = args.filter((a) => !a.startsWith("-") || a === "-");
	const filter = rest.shift() || ".";
	const t = await readIn(ctx, rest, "jq");
	if (t === null) return 2;
	let data;
	try {
		data = JSON.parse(t);
	} catch (e) {
		ctx.eprintln("jq: error: input is not valid JSON (try: kubectl … -o json | jq …)");
		return 2;
	}
	let res;
	try {
		res = PG.jq(filter, data);
	} catch (e) {
		ctx.eprintln("jq: error: " + e.message + " (the playground supports a practical subset of jq)");
		return 3;
	}
	for (const r of res) ctx.println(raw && typeof r === "string" ? r : compact ? JSON.stringify(r) : JSON.stringify(r, null, 2));
};
delete C.xargs.stub;
PG.Vi = class {
	constructor(o) {
		this.name = o.name || "";
		this.readOnly = !!o.readOnly;
		this.writeFn = o.write;
		this.rows = o.rows || 20;
		this.cols = o.cols || 80;
		const t = o.text || "";
		this.lines = t === "" ? [""] : t.replace(/\n$/, "").split("\n");
		this.y = 0;
		this.x = 0;
		this.top = 0;
		this.left = 0;
		this.mode = "n";
		this.count = "";
		this.op = null;
		this.opCount = "";
		this.pre = "";
		this.cl = null;
		this.reg = {
			text: "",
			line: false
		};
		this.undo = [];
		this.redo = [];
		this.dirty = false;
		this.number = false;
		this.last = null;
		this.done = false;
		this.want = 0;
		this.msg = !this.name ? "" : o.exists === false ? `"${this.name}" [New]` : `"${this.name}" ${t ? this.lines.length : 0}L, ${t.length}B`;
	}
	get line() {
		return this.lines[this.y];
	}
	text() {
		return this.lines.length === 1 && this.lines[0] === "" ? "" : this.lines.join("\n") + "\n";
	}
	snap() {
		this.undo.push({
			l: this.lines.slice(),
			y: this.y,
			x: this.x
		});
		if (this.undo.length > 200) this.undo.shift();
		this.redo = [];
		this.dirty = true;
	}
	clamp() {
		this.y = Math.max(0, Math.min(this.y, this.lines.length - 1));
		const max = this.mode === "i" ? this.line.length : Math.max(0, this.line.length - 1);
		this.x = Math.max(0, Math.min(this.x, max));
	}
	firstNb(y) {
		const m = /\S/.exec(this.lines[y]);
		return m ? m.index : Math.max(0, this.lines[y].length - 1);
	}
	cls(c) {
		return c === void 0 || /\s/.test(c) ? 0 : /\w/.test(c) ? 1 : 2;
	}
	reset() {
		this.count = "";
		this.op = null;
		this.opCount = "";
		this.pre = "";
	}
	nextW(y, x) {
		const L = this.lines;
		const c = this.cls(L[y][x]);
		if (c) while (x < L[y].length && this.cls(L[y][x]) === c) x++;
		for (;;) {
			if (x >= L[y].length) {
				if (y === L.length - 1) return {
					y,
					x: L[y].length
				};
				y++;
				x = 0;
				if (L[y].length === 0) return {
					y,
					x: 0
				};
				continue;
			}
			if (this.cls(L[y][x]) === 0) {
				x++;
				continue;
			}
			return {
				y,
				x
			};
		}
	}
	prevW(y, x) {
		const L = this.lines;
		for (;;) {
			if (x === 0) {
				if (y === 0) return {
					y: 0,
					x: 0
				};
				y--;
				x = L[y].length;
				if (x === 0) return {
					y,
					x: 0
				};
			}
			x--;
			if (this.cls(L[y][x]) !== 0) break;
		}
		const c = this.cls(L[y][x]);
		while (x > 0 && this.cls(L[y][x - 1]) === c) x--;
		return {
			y,
			x
		};
	}
	endW(y, x) {
		const L = this.lines;
		for (;;) {
			x++;
			if (x >= L[y].length) {
				if (y === L.length - 1) return {
					y,
					x: Math.max(0, L[y].length - 1)
				};
				y++;
				x = -1;
				continue;
			}
			if (this.cls(L[y][x]) !== 0) break;
		}
		const c = this.cls(L[y][x]);
		while (x + 1 < L[y].length && this.cls(L[y][x + 1]) === c) x++;
		return {
			y,
			x
		};
	}
	motion(k, n) {
		const has = n !== null;
		const c = n || 1;
		const L = this.lines;
		let p = {
			y: this.y,
			x: this.x
		};
		switch (k) {
			case "h":
			case "Left":
			case "Backspace":
				if (this.x === 0) return null;
				return {
					y: this.y,
					x: Math.max(0, this.x - c)
				};
			case "l":
			case "Right":
			case " ": return {
				y: this.y,
				x: Math.min(this.line.length, this.x + c)
			};
			case "j":
			case "Down":
			case "Enter":
				if (this.y + c > L.length - 1 && this.y === L.length - 1) return null;
				return {
					y: Math.min(L.length - 1, this.y + c),
					x: this.want,
					line: true,
					keep: true
				};
			case "k":
			case "Up":
				if (this.y === 0) return null;
				return {
					y: Math.max(0, this.y - c),
					x: this.want,
					line: true,
					keep: true
				};
			case "0":
			case "Home": return {
				y: this.y,
				x: 0
			};
			case "^": return {
				y: this.y,
				x: this.firstNb(this.y)
			};
			case "$":
			case "End": {
				const y = Math.min(L.length - 1, this.y + c - 1);
				return {
					y,
					x: Math.max(0, L[y].length - 1),
					incl: true,
					eol: true
				};
			}
			case "G": {
				const y = has ? Math.min(L.length, c) - 1 : L.length - 1;
				return {
					y,
					x: this.firstNb(y),
					line: true
				};
			}
			case "gg": {
				const y = has ? Math.min(L.length, c) - 1 : 0;
				return {
					y,
					x: this.firstNb(y),
					line: true
				};
			}
			case "w":
				for (let i = 0; i < c; i++) p = this.nextW(p.y, p.x);
				return p;
			case "b":
				for (let i = 0; i < c; i++) p = this.prevW(p.y, p.x);
				return p;
			case "e":
				for (let i = 0; i < c; i++) p = this.endW(p.y, p.x);
				return {
					...p,
					incl: true
				};
			case "n":
			case "N": {
				if (!this.last) {
					this.msg = "E35: No previous regular expression";
					return null;
				}
				const fwd = k === "n" === (this.last.dir === 1);
				return this.find(this.last.pat, fwd ? 1 : -1);
			}
		}
		return null;
	}
	find(pat, dir) {
		let rx;
		try {
			rx = new RegExp(pat, "g");
		} catch (e) {
			rx = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
		}
		const L = this.lines, N = L.length;
		for (let i = 0; i <= N; i++) {
			const y = ((dir === 1 ? this.y + i : this.y - i) % N + N) % N;
			let ms = [...L[y].matchAll(rx)].filter((m) => m[0] !== "");
			if (i === 0) ms = ms.filter((m) => dir === 1 ? m.index > this.x : m.index < this.x);
			if (ms.length) {
				const m = dir === 1 ? ms[0] : ms[ms.length - 1];
				if (i > 0 && (dir === 1 ? y <= this.y : y >= this.y)) this.msg = dir === 1 ? "search hit BOTTOM, continuing at TOP" : "search hit TOP, continuing at BOTTOM";
				return {
					y,
					x: m.index
				};
			}
		}
		this.msg = `E486: Pattern not found: ${pat}`;
		return null;
	}
	getRange(a, b) {
		if (a.y === b.y) return this.lines[a.y].slice(a.x, b.x);
		let s = this.lines[a.y].slice(a.x) + "\n";
		for (let y = a.y + 1; y < b.y; y++) s += this.lines[y] + "\n";
		return s + this.lines[b.y].slice(0, b.x);
	}
	delRange(a, b) {
		const t = this.lines[a.y].slice(0, a.x) + this.lines[b.y].slice(b.x);
		this.lines.splice(a.y, b.y - a.y + 1, t);
		this.y = a.y;
		this.x = a.x;
	}
	applyOp(op, m, n) {
		let a = {
			y: this.y,
			x: this.x
		}, b = {
			y: m.y,
			x: m.x
		};
		const L = this.lines;
		if (b.y < a.y || b.y === a.y && b.x < a.x) [a, b] = [b, a];
		if (m.line) {
			const text = L.slice(a.y, b.y + 1).join("\n");
			this.reg = {
				text,
				line: true
			};
			if (op === "y") {
				this.y = a.y;
				this.msg = b.y > a.y ? `${b.y - a.y + 1} lines yanked` : "";
				return;
			}
			this.snap();
			L.splice(a.y, b.y - a.y + 1);
			if (op === "c") {
				L.splice(a.y, 0, "");
				this.y = a.y;
				this.x = 0;
				this.mode = "i";
				this.clamp();
				return;
			}
			if (!L.length) L.push("");
			this.y = Math.min(a.y, L.length - 1);
			this.x = this.firstNb(this.y);
			if (b.y > a.y) this.msg = `${b.y - a.y + 1} fewer lines`;
			return;
		}
		if (m.incl) b = {
			y: b.y,
			x: b.x + 1
		};
		const text = this.getRange(a, b);
		if (!text && op !== "c") return;
		this.reg = {
			text,
			line: false
		};
		if (op === "y") {
			this.y = a.y;
			this.x = a.x;
			return;
		}
		this.snap();
		this.delRange(a, b);
		if (op === "c") {
			this.mode = "i";
			this.clamp();
		} else this.clamp();
	}
	put(before) {
		const r = this.reg;
		if (!r.text && !r.line) {
			this.msg = "E353: Nothing in register \"";
			return;
		}
		this.snap();
		if (r.line) {
			const at = before ? this.y : this.y + 1;
			this.lines.splice(at, 0, ...r.text.split("\n"));
			this.y = at;
			this.x = this.firstNb(at);
			return;
		}
		const at = before ? this.x : Math.min(this.line.length, this.x + 1);
		const ln = this.line;
		const parts = r.text.split("\n");
		if (parts.length === 1) {
			this.lines[this.y] = ln.slice(0, at) + r.text + ln.slice(at);
			this.x = at + r.text.length - 1;
			return;
		}
		const tail = ln.slice(at);
		this.lines[this.y] = ln.slice(0, at) + parts[0];
		this.lines.splice(this.y + 1, 0, ...parts.slice(1, -1), parts[parts.length - 1] + tail);
		this.x = at;
	}
	key(k) {
		if (this.done) return;
		if (this.mode === "i") {
			this.msg = "";
			this.insertKey(k);
		} else if (this.mode === "c") this.cmdKey(k);
		else {
			this.msg = "";
			this.normalKey(k);
		}
		this.clamp();
		if (this.mode !== "i" && !this.keepWant) this.want = this.x;
		this.keepWant = false;
		this.scroll();
	}
	scroll() {
		const r = this.rows;
		if (this.y < this.top) this.top = this.y;
		if (this.y >= this.top + r) this.top = this.y - r + 1;
		const nw = this.number ? String(this.lines.length).length + 1 : 0;
		const w = Math.max(10, this.cols - nw);
		const dx = this.disp(this.y, this.x);
		if (dx < this.left) this.left = dx;
		if (dx >= this.left + w) this.left = dx - w + 1;
	}
	disp(y, x) {
		let c = 0;
		const s = this.lines[y];
		for (let i = 0; i < x && i < s.length; i++) c += s[i] === "	" ? 8 - c % 8 : 1;
		return c;
	}
	expand(s) {
		let o = "";
		for (const ch of s) o += ch === "	" ? " ".repeat(8 - o.length % 8) : ch;
		return o;
	}
	insertKey(k) {
		if (k === "Escape" || k === "C-c") {
			this.mode = "n";
			this.x = Math.max(0, this.x - 1);
			return;
		}
		const ln = this.line;
		if (k === "Enter") {
			this.lines[this.y] = ln.slice(0, this.x);
			this.lines.splice(this.y + 1, 0, ln.slice(this.x));
			this.y++;
			this.x = 0;
		} else if (k === "Backspace") {
			if (this.x > 0) {
				this.lines[this.y] = ln.slice(0, this.x - 1) + ln.slice(this.x);
				this.x--;
			} else if (this.y > 0) {
				const p = this.lines[this.y - 1];
				this.lines.splice(this.y - 1, 2, p + ln);
				this.y--;
				this.x = p.length;
			}
		} else if (k === "Delete") {
			if (this.x < ln.length) this.lines[this.y] = ln.slice(0, this.x) + ln.slice(this.x + 1);
			else if (this.y < this.lines.length - 1) this.lines.splice(this.y, 2, ln + this.lines[this.y + 1]);
		} else if (k === "Left") this.x = Math.max(0, this.x - 1);
		else if (k === "Right") this.x = Math.min(ln.length, this.x + 1);
		else if (k === "Up" || k === "Down") {
			this.y = Math.max(0, Math.min(this.lines.length - 1, this.y + (k === "Up" ? -1 : 1)));
			this.x = Math.min(this.x, this.line.length);
		} else if (k === "Home") this.x = 0;
		else if (k === "End") this.x = ln.length;
		else if (k === "Tab") {
			this.lines[this.y] = ln.slice(0, this.x) + "	" + ln.slice(this.x);
			this.x++;
		} else if (k.length === 1) {
			this.lines[this.y] = ln.slice(0, this.x) + k + ln.slice(this.x);
			this.x++;
		}
	}
	normalKey(k) {
		if (k === "Escape" || k === "C-c") {
			this.reset();
			return;
		}
		if (this.pre === "r") {
			const n = Number(this.count) || 1;
			this.reset();
			if (k.length === 1 && this.x + n <= this.line.length) {
				this.snap();
				this.lines[this.y] = this.line.slice(0, this.x) + k.repeat(n) + this.line.slice(this.x + n);
				this.x += n - 1;
			}
			return;
		}
		if (this.pre === "Z") {
			this.reset();
			if (k === "Z") this.ex("x");
			else if (k === "Q") this.ex("q!");
			return;
		}
		let key = k;
		if (this.pre === "g") {
			this.pre = "";
			if (k !== "g") {
				this.reset();
				return;
			}
			key = "gg";
		} else if (k === "g") {
			this.pre = "g";
			return;
		}
		if (/^[1-9]$/.test(k) || k === "0" && (this.op ? this.opCount : this.count)) {
			if (this.op) this.opCount += k;
			else this.count += k;
			return;
		}
		const n1 = this.count ? Number(this.count) : null, n2 = this.opCount ? Number(this.opCount) : null;
		const n = n1 === null && n2 === null ? null : (n1 || 1) * (n2 || 1);
		if (this.op) {
			const op = this.op;
			this.reset();
			if (key === op) {
				const y2 = Math.min(this.lines.length - 1, this.y + (n || 1) - 1);
				this.applyOp(op, {
					y: y2,
					x: 0,
					line: true
				});
				if (op === "c") this.mode = "i";
				return;
			}
			let mk = key;
			if (op === "c" && key === "w" && this.cls(this.line[this.x]) !== 0) mk = "e";
			const m = mk === "e" && key === "w" && this.cls(this.line[this.x + 1]) !== this.cls(this.line[this.x]) && !(n > 1) ? {
				y: this.y,
				x: this.x
			} : this.motion(mk, n);
			if (!m) return;
			if (key === "w" && m.y > this.y && op !== "c") {
				m.y = this.y;
				m.x = this.line.length;
			}
			if (mk === "e" && key === "w") m.incl = true;
			this.applyOp(op, m, n);
			return;
		}
		if ("dcy".includes(key) && key.length === 1) {
			this.op = key;
			return;
		}
		if (key === ".") {
			this.reset();
			this.msg = "repeat (.) is not supported in this vi";
			return;
		}
		const cnt = n || 1;
		this.reset();
		switch (key) {
			case "i":
				this.snap();
				this.mode = "i";
				return;
			case "a":
				this.snap();
				this.mode = "i";
				if (this.line.length) this.x++;
				return;
			case "I":
				this.snap();
				this.mode = "i";
				this.x = this.firstNb(this.y);
				if (!/\S/.test(this.line)) this.x = this.line.length;
				return;
			case "A":
				this.snap();
				this.mode = "i";
				this.x = this.line.length;
				return;
			case "o":
				this.snap();
				this.lines.splice(this.y + 1, 0, "");
				this.y++;
				this.x = 0;
				this.mode = "i";
				return;
			case "O":
				this.snap();
				this.lines.splice(this.y, 0, "");
				this.x = 0;
				this.mode = "i";
				return;
			case "x":
			case "Delete":
				if (this.line.length) this.applyOp("d", {
					y: this.y,
					x: Math.min(this.line.length, this.x + cnt),
					line: false
				});
				return;
			case "X":
				if (this.x > 0) this.applyOp("d", {
					y: this.y,
					x: Math.max(0, this.x - cnt)
				});
				return;
			case "s":
				this.applyOp("c", {
					y: this.y,
					x: Math.min(this.line.length, this.x + cnt)
				});
				this.mode = "i";
				return;
			case "S":
				this.applyOp("c", {
					y: Math.min(this.lines.length - 1, this.y + cnt - 1),
					x: 0,
					line: true
				});
				return;
			case "D":
				this.applyOp("d", this.motion("$", cnt));
				return;
			case "C":
				this.applyOp("c", this.motion("$", cnt));
				this.mode = "i";
				return;
			case "Y":
				this.applyOp("y", {
					y: Math.min(this.lines.length - 1, this.y + cnt - 1),
					x: 0,
					line: true
				});
				return;
			case "p":
				for (let i = 0; i < cnt; i++) this.put(false);
				return;
			case "P":
				for (let i = 0; i < cnt; i++) this.put(true);
				return;
			case "r":
				this.pre = "r";
				this.count = String(cnt);
				return;
			case "Z":
				this.pre = "Z";
				return;
			case "J": {
				if (this.y >= this.lines.length - 1) return;
				this.snap();
				const a = this.line.replace(/\s+$/, ""), b = this.lines[this.y + 1].replace(/^\s+/, "");
				this.lines.splice(this.y, 2, a + (a && b ? " " : "") + b);
				this.x = Math.max(0, a.length);
				return;
			}
			case "~": {
				if (!this.line.length) return;
				this.snap();
				const ch = this.line[this.x];
				this.lines[this.y] = this.line.slice(0, this.x) + (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()) + this.line.slice(this.x + 1);
				this.x++;
				return;
			}
			case "u": {
				const s = this.undo.pop();
				if (!s) {
					this.msg = "Already at oldest change";
					return;
				}
				this.redo.push({
					l: this.lines,
					y: this.y,
					x: this.x
				});
				this.lines = s.l;
				this.y = s.y;
				this.x = s.x;
				return;
			}
			case "C-r": {
				const s = this.redo.pop();
				if (!s) {
					this.msg = "Already at newest change";
					return;
				}
				this.undo.push({
					l: this.lines,
					y: this.y,
					x: this.x
				});
				this.lines = s.l;
				this.y = s.y;
				this.x = s.x;
				return;
			}
			case ":":
				this.mode = "c";
				this.cl = {
					p: ":",
					t: ""
				};
				return;
			case "/":
			case "?":
				this.mode = "c";
				this.cl = {
					p: key,
					t: ""
				};
				return;
			case "C-f":
			case "PageDown":
				this.y = Math.min(this.lines.length - 1, this.y + this.rows - 2);
				this.top = Math.min(this.y, this.top + this.rows - 2);
				return;
			case "C-b":
			case "PageUp":
				this.y = Math.max(0, this.y - this.rows + 2);
				return;
			case "C-d":
				this.y = Math.min(this.lines.length - 1, this.y + (this.rows >> 1));
				return;
			case "C-u":
				this.y = Math.max(0, this.y - (this.rows >> 1));
				return;
			case "v":
			case "V":
				this.msg = "visual mode is not supported in this vi: use d/y/c with a motion (dw, y$, 3dd …)";
				return;
		}
		const m = this.motion(key, n);
		if (m) {
			this.y = m.y;
			this.x = m.x;
			if (m.keep) this.keepWant = true;
			if (key === "G" || key === "gg") {}
		}
	}
	cmdKey(k) {
		const c = this.cl;
		if (k === "Escape" || k === "C-c") {
			this.mode = "n";
			this.cl = null;
			return;
		}
		if (k === "Backspace") {
			if (!c.t) {
				this.mode = "n";
				this.cl = null;
			} else c.t = c.t.slice(0, -1);
			return;
		}
		if (k === "Enter") {
			this.mode = "n";
			this.cl = null;
			if (c.p === ":") this.ex(c.t);
			else if (c.t) {
				this.last = {
					pat: c.t,
					dir: c.p === "/" ? 1 : -1
				};
				const m = this.find(c.t, this.last.dir);
				if (m) {
					this.y = m.y;
					this.x = m.x;
				}
			} else if (this.last) {
				const m = this.find(this.last.pat, this.last.dir);
				if (m) {
					this.y = m.y;
					this.x = m.x;
				}
			}
			return;
		}
		if (k.length === 1) c.t += k;
		else if (k === "Tab") c.t += "	";
	}
	save(name) {
		name = name || this.name;
		if (!name) {
			this.msg = "E32: No file name";
			return false;
		}
		if (this.readOnly && name === this.name) {
			this.msg = "E45: 'readonly' option is set (add ! to override)";
			return false;
		}
		const t = this.text();
		const err = this.writeFn ? this.writeFn(name, t) : null;
		if (err) {
			this.msg = err;
			return false;
		}
		if (!this.name) this.name = name;
		if (name === this.name) this.dirty = false;
		this.msg = `"${name}" ${t ? this.lines.length : 0}L, ${t.length}B written`;
		return true;
	}
	ex(cmd) {
		cmd = cmd.trim().replace(/^:+/, "");
		if (!cmd) return;
		if (/^\d+$/.test(cmd)) {
			this.y = Math.max(0, Math.min(this.lines.length - 1, Number(cmd) - 1));
			this.x = this.firstNb(this.y);
			return;
		}
		if (cmd === "$") {
			this.y = this.lines.length - 1;
			this.x = this.firstNb(this.y);
			return;
		}
		let m;
		if (m = /^(?:(%)|(\d+|\.|\$)(?:,(\d+|\.|\$))?)?s([^\w\s])(.*)$/.exec(cmd)) return this.sub(m);
		if (m = /^(?:(%)|(\d+|\.|\$)(?:,(\d+|\.|\$))?)?d$/.exec(cmd)) {
			const [a, b] = this.range(m);
			this.y = a;
			this.x = 0;
			this.applyOp("d", {
				y: b,
				x: 0,
				line: true
			});
			return;
		}
		const [, name, bang, arg] = /^(\w+)(!?)\s*(.*)$/.exec(cmd) || [];
		switch (name) {
			case "w":
			case "write":
				this.save(arg);
				return;
			case "wq":
			case "x":
			case "xit":
			case "exit":
				if (name !== "wq" && !this.dirty && this.name && !arg) {
					this.done = true;
					return;
				}
				if (this.save(arg)) this.done = true;
				return;
			case "q":
			case "quit":
			case "qa":
			case "qall":
			case "cq":
				if (this.dirty && !bang) {
					this.msg = "E37: No write since last change (add ! to override)";
					return;
				}
				this.done = true;
				return;
			case "set":
			case "se":
				for (const o of arg.split(/\s+/)) if (/^(nu|number)$/.test(o)) this.number = true;
				else if (/^(nonu|nonumber)$/.test(o)) this.number = false;
				else if (o && !/^(ts|sw|tabstop|shiftwidth|expandtab|et|autoindent|ai|noai|hlsearch|hls|nohls|ic|ignorecase|list|nolist|paste|nopaste)/.test(o)) this.msg = `E518: Unknown option: ${o}`;
				else if (o) this.msg = `(":set ${o}" is accepted but has no effect here)`;
				return;
			case "noh":
			case "nohlsearch": return;
			case "h":
			case "help":
				this.msg = "i a o insert · Esc normal · h j k l move · w b e 0 $ gg G · x dd dw yy p u · /text n · :w :q :wq :q! · :%s/a/b/g · ZZ save+quit";
				return;
			case "e":
			case "edit":
				if (!bang && this.dirty) {
					this.msg = "E37: No write since last change (add ! to override)";
					return;
				}
				this.msg = "opening another file is not supported: quit and run vi again";
				return;
		}
		if (cmd[0] === "!") {
			this.msg = "shell escapes are not supported: quit with :q and run the command in the terminal";
			return;
		}
		this.msg = `E492: Not an editor command: ${cmd}`;
	}
	range(m) {
		const L = this.lines.length;
		const p = (s) => s === "." ? this.y : s === "$" ? L - 1 : Number(s) - 1;
		if (m[1]) return [0, L - 1];
		const a = m[2] ? p(m[2]) : this.y;
		const b = m[3] ? p(m[3]) : a;
		return [Math.max(0, Math.min(a, b)), Math.min(L - 1, Math.max(a, b))];
	}
	sub(m) {
		const d = m[4];
		const rest = m[5];
		const parts = [];
		let cur = "", esc = false;
		for (const ch of rest) if (esc) {
			cur += ch === d ? ch : "\\" + ch;
			esc = false;
		} else if (ch === "\\") esc = true;
		else if (ch === d && parts.length < 2) {
			parts.push(cur);
			cur = "";
		} else cur += ch;
		parts.push(cur);
		const [pat, rep = "", flags = ""] = parts;
		if (!pat) {
			this.msg = "E35: No previous regular expression";
			return;
		}
		let rx;
		try {
			rx = new RegExp(pat, flags.includes("g") ? flags.includes("i") ? "gi" : "g" : flags.includes("i") ? "i" : "");
		} catch (e) {
			this.msg = "E486: Pattern not found: " + pat;
			return;
		}
		const [a, b] = this.range(m);
		this.last = {
			pat,
			dir: 1
		};
		let cnt = 0;
		const snapL = this.lines.slice(), sy = this.y, sx = this.x;
		for (let y = a; y <= b; y++) {
			const nl = this.lines[y].replace(rx, (...g) => {
				cnt++;
				return rep.replace(/\\(\d)|\\&|&/g, (s, dg) => dg !== void 0 ? g[Number(dg)] ?? "" : s === "\\&" ? "&" : g[0]);
			});
			this.lines[y] = nl;
		}
		if (!cnt) {
			this.msg = `E486: Pattern not found: ${pat}`;
			return;
		}
		this.undo.push({
			l: snapL,
			y: sy,
			x: sx
		});
		this.redo = [];
		this.dirty = true;
		this.y = b;
		this.x = this.firstNb(b);
		if (cnt > 1) this.msg = `${cnt} substitutions`;
	}
	screen() {
		const nw = this.number ? String(this.lines.length).length + 1 : 0;
		const rows = [];
		for (let i = 0; i < this.rows; i++) {
			const y = this.top + i;
			if (y >= this.lines.length) {
				rows.push("~");
				continue;
			}
			const t = this.expand(this.lines[y]).slice(this.left, this.left + this.cols - nw);
			rows.push((this.number ? String(y + 1).padStart(nw - 1) + " " : "") + t);
		}
		const crow = this.y - this.top, ccol = this.disp(this.y, this.x) - this.left + nw;
		const pct = this.lines.length <= this.rows ? "All" : this.top === 0 ? "Top" : this.top + this.rows >= this.lines.length ? "Bot" : Math.floor(100 * this.top / (this.lines.length - this.rows)) + "%";
		const left = this.mode === "c" ? this.cl.p + this.cl.t : this.mode === "i" ? "-- INSERT --" : this.msg;
		return {
			rows,
			cursor: this.mode === "c" ? {
				row: this.rows,
				col: 1 + this.cl.t.length
			} : {
				row: crow,
				col: ccol
			},
			bottom: left,
			ruler: this.mode === "c" ? "" : `${this.y + 1},${this.x + 1}  ${pct}`,
			mode: this.mode
		};
	}
};
{
	const viCmd = async (ctx, args, ro) => {
		const name = args.filter((a) => !a.startsWith("-"))[0];
		let text = "", exists = false, path = null;
		if (name) {
			path = ctx.resolve(name);
			if (ctx.fs.isDir(path)) {
				ctx.eprintln(`"${name}" is a directory`);
				return 1;
			}
			const t = ctx.fs.read(path);
			if (t !== void 0) {
				text = t;
				exists = true;
			}
		}
		const term = ctx.sh.term;
		if (!term || !term.edit) {
			ctx.println("(vi draws a full-screen editor in the browser page; it cannot run here)");
			return 1;
		}
		const vi = new PG.Vi({
			text,
			name: name || "",
			exists: name ? exists : void 0,
			readOnly: ro,
			write: (n, t) => {
				const p = ctx.resolve(n);
				if (ctx.fs.isDir(p)) return `"${n}" is a directory`;
				ctx.fs.write(p, t);
				return null;
			}
		});
		await term.edit(vi);
		return 0;
	};
	PG.commands.vi = PG.commands.vim = PG.commands.nvim = async (ctx, args) => viCmd(ctx, args, false);
	PG.commands.view = async (ctx, args) => viCmd(ctx, args, true);
	PG.commands.nano = async (ctx) => {
		ctx.eprintln("nano is not installed here: use vi (try: vi notes.txt, then i to type, Esc, :wq to save)");
		return 1;
	};
}
{
	const MON = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	const fmtT = (ms) => {
		const d = new Date(ms);
		return `${MON[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2)} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
	};
	const human = (n) => n < 1024 ? String(n) : n < 10240 ? (n / 1024).toFixed(1) + "K" : n < 1048576 ? Math.ceil(n / 1024) + "K" : n < 10485760 ? (n / 1048576).toFixed(1) + "M" : Math.ceil(n / 1048576) + "M";
	const join = (d, n) => d === "/" ? "/" + n : d + "/" + n;
	const key = (n) => n.replace(/^\./, "").toLowerCase();
	const byName = (a, b) => key(a.name) < key(b.name) ? -1 : key(a.name) > key(b.name) ? 1 : a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
	const meta = (ctx, p, name) => {
		const fs = ctx.fs;
		const dir = fs.isDir(p);
		const c = dir ? "" : fs.read(p) || "";
		const exec = !dir && /^#!/.test(c);
		return {
			name,
			p,
			dir,
			size: dir ? 4096 : c.length,
			mt: fs.mt && fs.mt[p] || PG.BASE_TIME,
			mode: dir ? "drwxr-xr-x" : exec ? "-rwxr-xr-x" : "-rw-r--r--",
			exec,
			nlink: dir ? 2 + fs.list(p).filter((n) => fs.isDir(join(p, n))).length : 1
		};
	};
	const columns = (names, width = 80) => {
		if (!names.length) return "";
		for (let nc = Math.min(names.length, Math.floor(width / 3) || 1); nc >= 1; nc--) {
			const nr = Math.ceil(names.length / nc);
			if (Math.ceil(names.length / nr) < nc) continue;
			const w = [];
			for (let c = 0; c < nc; c++) w.push(Math.max(...names.slice(c * nr, c * nr + nr).map((s) => s.length)));
			if (nc === 1 || w.reduce((a, b) => a + b, 0) + 2 * (nc - 1) <= width) {
				const rows = [];
				for (let r = 0; r < nr; r++) {
					let line = "";
					for (let c = 0; c < nc; c++) {
						const s = names[c * nr + r];
						if (s === void 0) continue;
						line += c < nc - 1 && names[(c + 1) * nr + r] !== void 0 ? s.padEnd(w[c] + 2) : s;
					}
					rows.push(line.replace(/\s+$/, ""));
				}
				return rows.join("\n");
			}
		}
	};
	const lsCmd = async (ctx, args) => {
		const fl = /* @__PURE__ */ new Set();
		const targets = [];
		for (let i = 0; i < args.length; i++) {
			const a = args[i];
			if (a === "--") {
				targets.push(...args.slice(i + 1));
				break;
			}
			if (a.startsWith("--") && a.length > 2) {
				const k = a.slice(2);
				fl.add({
					all: "a",
					"almost-all": "A",
					"human-readable": "h",
					recursive: "R",
					directory: "d",
					reverse: "r",
					classify: "F"
				}[k] || k);
			} else if (a.startsWith("-") && a.length > 1) for (const ch of a.slice(1)) fl.add(ch);
			else targets.push(a);
		}
		const L = fl.has("l"), H = fl.has("h"), owner = ctx.sh.isPodShell ? "root" : ctx.env.USER || "user";
		const fmtSize = (n) => H ? human(n) : String(n);
		const decorate = (m) => m.name + (fl.has("F") ? m.dir ? "/" : m.exec ? "*" : "" : fl.has("p") && m.dir ? "/" : "");
		const sortList = (list) => {
			list.sort(fl.has("S") ? (a, b) => b.size - a.size || byName(a, b) : fl.has("t") ? (a, b) => b.mt - a.mt || byName(a, b) : byName);
			if (fl.has("r")) list.reverse();
			return list;
		};
		const render = (list, withTotal) => {
			if (!list.length) return withTotal && L ? "total 0" : "";
			if (L) {
				const rows = list.map((m) => [
					m.mode,
					String(m.nlink),
					owner,
					owner,
					fmtSize(m.size),
					fmtT(m.mt),
					decorate(m)
				]);
				const w = [1, 4].map((c) => Math.max(...rows.map((r) => r[c].length)));
				const body = rows.map((r) => `${r[0]} ${r[1].padStart(w[0])} ${r[2].padEnd(owner.length)} ${r[3].padEnd(owner.length)} ${r[4].padStart(w[1])} ${r[5]} ${r[6]}`).join("\n");
				if (!withTotal) return body;
				const blocks = list.reduce((s, m) => s + (m.size ? Math.ceil(m.size / 4096) * 4 : m.dir ? 4 : 0), 0);
				return `total ${H ? human(blocks * 1024) : blocks}\n` + body;
			}
			const names = list.map(decorate);
			return ctx.tty && !fl.has("1") ? columns(names, ctx.sh.term && ctx.sh.term.cols || 80) : names.join("\n");
		};
		const entries = (p) => {
			let names = ctx.fs.list(p);
			if (!fl.has("a") && !fl.has("A")) names = names.filter((n) => !n.startsWith("."));
			const list = names.map((n) => meta(ctx, join(p, n), n));
			if (fl.has("a")) list.push(meta(ctx, p, "."), meta(ctx, p === "/" ? "/" : p.slice(0, p.lastIndexOf("/")) || "/", ".."));
			return sortList(list);
		};
		let code = 0;
		const blocks = [];
		const files = [];
		const dirs = [];
		for (const t of targets.length ? targets : ["."]) {
			const p = ctx.resolve(t);
			if (!ctx.fs.exists(p)) {
				ctx.eprintln(`ls: cannot access '${t}': No such file or directory`);
				code = 2;
				continue;
			}
			if (ctx.fs.isDir(p) && !fl.has("d")) dirs.push({
				t,
				p
			});
			else files.push(meta(ctx, p, t));
		}
		if (files.length) blocks.push(render(sortList(files), false));
		const header = targets.length > 1 || fl.has("R");
		const walk = (t, p) => {
			const list = entries(p);
			let s = (header ? t + ":\n" : "") + render(list, true);
			blocks.push(s.replace(/\n$/, ""));
			if (fl.has("R")) {
				for (const m of list) if (m.dir && m.name !== "." && m.name !== "..") walk(t === "/" ? "/" + m.name : t + "/" + m.name, m.p);
			}
		};
		for (const d of dirs.sort((a, b) => 0)) walk(d.t, d.p);
		const out = blocks.filter((b) => b !== "").join("\n\n");
		if (out) ctx.println(out);
		return code;
	};
	PG.commands.ls = lsCmd;
	PG.commands.dir = lsCmd;
	PG.commands.ll = async (ctx, a) => lsCmd(ctx, ["-l", ...a]);
	PG.commands.tree = async (ctx, args) => {
		if (ctx.sh.isPodShell) {
			ctx.eprintln("sh: tree: not found");
			return 127;
		}
		let all = false, dirsOnly = false, full = false, noReport = false, max = Infinity, ignore = null, dirsFirst = false;
		const targets = [];
		for (let i = 0; i < args.length; i++) {
			const a = args[i];
			if (a === "--noreport") noReport = true;
			else if (a === "--dirsfirst") dirsFirst = true;
			else if (a === "--") {
				targets.push(...args.slice(i + 1));
				break;
			} else if (/^-L\d+$/.test(a)) max = Number(a.slice(2));
			else if (a.startsWith("-") && a.length > 1 && !a.startsWith("--")) {
				for (const ch of a.slice(1)) if (ch === "a") all = true;
				else if (ch === "d") dirsOnly = true;
				else if (ch === "f") full = true;
				else if (ch === "L") {
					max = Number(args[++i]);
					if (!(max >= 1)) {
						ctx.eprintln("tree: Invalid level, must be greater than 0.");
						return 1;
					}
				} else if (ch === "I") ignore = new RegExp("^(" + String(args[++i] || "").split("|").map((g) => g.replace(/[.+^${}()[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")).join("|") + ")$");
			} else if (a.startsWith("--")) {} else targets.push(a);
		}
		let nd = 0, nf = 0;
		const lines = [];
		const walk = (p, shown, prefix, depth) => {
			const list = ctx.fs.list(p).filter((n) => (all || !n.startsWith(".")) && !(ignore && ignore.test(n))).map((n) => ({
				name: n,
				dir: ctx.fs.isDir(join(p, n))
			})).filter((m) => !dirsOnly || m.dir).sort((a, b) => (dirsFirst ? b.dir - a.dir : 0) || byName(a, b));
			list.forEach((m, i) => {
				const last = i === list.length - 1;
				const fp = join(p, m.name);
				lines.push(prefix + (last ? "└── " : "├── ") + (full ? (shown === "/" ? "" : shown) + "/" + m.name : m.name));
				if (m.dir) {
					nd++;
					if (depth < max) walk(fp, join(shown, m.name), prefix + (last ? "    " : "│   "), depth + 1);
				} else nf++;
			});
		};
		let code = 0;
		for (const t of targets.length ? targets : ["."]) {
			const p = ctx.resolve(t);
			lines.push(t);
			if (!ctx.fs.isDir(p)) {
				if (ctx.fs.exists(p)) nf++;
				else {
					lines[lines.length - 1] = t + " [error opening dir]";
					code = 2;
				}
				continue;
			}
			walk(p, t.replace(/\/$/, "") || "/", "", 1);
		}
		if (!noReport) lines.push("", `${nd} ${nd === 1 ? "directory" : "directories"}` + (dirsOnly ? "" : `, ${nf} ${nf === 1 ? "file" : "files"}`));
		ctx.println(lines.join("\n"));
		return code;
	};
}
PG.NGINX_404 = "<html>\n<head><title>404 Not Found</title></head>\n<body>\n<center><h1>404 Not Found</h1></center>\n<hr><center>nginx/1.27.5</center>\n</body>\n</html>";
PG.netpolBlocks = (cl, srcNs, srcLabels, pod) => {
	const ns = pod.metadata.namespace;
	const pols = cl.res.networkpolicies.filter((p) => p.metadata.namespace === ns && (p.spec.policyTypes || ["Ingress"]).includes("Ingress") && (!p.spec.podSelector || !Object.keys(p.spec.podSelector.matchLabels || {}).length || PG.selMatch(p.spec.podSelector, pod.metadata.labels)));
	if (!pols.length) return null;
	for (const p of pols) for (const r of p.spec.ingress || []) {
		if (!r.from) return null;
		for (const f of r.from) {
			if (f.podSelector !== void 0 && !f.namespaceSelector && srcNs === ns && (!Object.keys(f.podSelector.matchLabels || {}).length || PG.selMatch(f.podSelector, srcLabels || {}))) return null;
			if (f.namespaceSelector) {
				const nso = cl.find("namespaces", srcNs);
				if (nso && (!Object.keys(f.namespaceSelector.matchLabels || {}).length || PG.selMatch(f.namespaceSelector, nso.metadata.labels))) return null;
			}
		}
	}
	return pols[0].metadata.name;
};
PG.podRespond = (cl, pod, req, steps, src) => {
	const info = PG.imageInfo(cl.sim, pod.spec.containers[0].image) || { type: "tool" };
	const path = req.path || "/";
	steps.push({
		label: `Pod ${pod.metadata.name} (${pod.status.podIP})`,
		kind: "pod",
		cluster: cl.entry,
		ns: pod.metadata.namespace,
		name: pod.metadata.name
	});
	if (info.type === "web" && PG.webRootDir(info)) {
		const fsx = PG.podFS(cl, pod);
		const root = PG.webRootDir(info);
		const content = fsx.read(root + (path === "/" ? "/index.html" : path));
		const status = content !== void 0 ? 200 : 404;
		const body = content !== void 0 ? content : PG.NGINX_404;
		pod._sim.logs.push(`${src || "10.244.0.1"} - - [${new Date(PG.BASE_TIME + cl.sim.clock * 1e3).toUTCString().slice(5, 25).replace(/ /g, "/")}] "${req.method || "GET"} ${path} HTTP/1.1" ${status} ${body.length} "-" "curl/8.7.1" "-"`);
		return {
			status,
			body
		};
	}
	if (info.type === "web") {
		let status = 200, body = info.page || "";
		if (info.built) {
			if (path !== "/" && path !== "/index.html") {
				status = 404;
				body = PG.NGINX_404;
			}
		} else if (path !== "/" && info.page && info.page.includes("nginx")) {
			status = 404;
			body = PG.NGINX_404;
		}
		pod._sim.logs.push(`${src || "10.244.0.1"} - - [${new Date(PG.BASE_TIME + cl.sim.clock * 1e3).toUTCString().slice(5, 25).replace(/ /g, "/").replace("/", "/")}] "${req.method || "GET"} ${path} HTTP/1.1" ${status} ${body.length} "-" "curl/8.7.1" "-"`);
		return {
			status,
			body
		};
	}
	if (info.type === "registry") return {
		status: 200,
		body: "{}"
	};
	if (info.type === "tcp") return { error: {
		code: 52,
		msg: "Empty reply from server"
	} };
	return { error: {
		code: 7,
		msg: "Failed to connect: connection refused"
	} };
};
PG.viaService = (cl, svc, port, req, steps, src) => {
	const sp = (svc.spec.ports || []).find((p) => p.port === port || p.nodePort === port) || (svc.spec.ports || [])[0];
	steps.push({
		label: `Service ${svc.metadata.name} (${svc.spec.type}) ${svc.spec.clusterIP}:${sp ? sp.port : "?"}`,
		kind: "svc",
		cluster: cl.entry,
		ns: svc.metadata.namespace,
		name: svc.metadata.name
	});
	const eps = cl.endpointsOf(svc).filter((e) => !sp || e.svcPort === sp.port);
	if (!eps.length) return { error: {
		code: 56,
		msg: `no endpoints available for service "${svc.metadata.name}" (selector matches no Ready pod)`,
		status: 503
	} };
	const ep = eps[Math.floor(Math.random() * eps.length)];
	return PG.podRespond(cl, ep.pod, req, steps, src);
};
PG.localRequest = (sim, req) => {
	const port = req.port;
	const steps = [{
		label: `your machine → localhost:${port}`,
		kind: "host"
	}];
	const fw = sim.forwards.find((f) => f.local === port && f.active);
	if (fw) {
		const cl = fw.cluster;
		steps.push({
			label: `kubectl port-forward (${fw.target})`,
			kind: "forward"
		});
		if (fw.onConn) fw.onConn();
		let res;
		if (fw.svc) res = PG.viaService(cl, fw.svc, fw.remote, req, steps);
		else {
			const pod = fw.pod;
			res = pod && PG.podReady(pod) ? PG.podRespond(cl, pod, req, steps) : { error: {
				code: 56,
				msg: "Recv failure: Connection reset by peer"
			} };
		}
		return {
			...res,
			steps
		};
	}
	for (const c of sim.containers) {
		if (c.status !== "running") continue;
		const m = c.ports.find((p) => p.host === port);
		if (!m) continue;
		if (c.kind === "other" && !sim.clusters[c.clusterId]) return {
			...PG.containerRespond(sim, c, m, req, steps),
			steps
		};
		if (c.kind === "registry") {
			steps.push({
				label: `docker port ${port} → ${c.name}:5000`,
				kind: "container",
				name: c.name
			});
			return {
				...PG.registryResponse(sim, c, req),
				steps
			};
		}
		const cl = sim.clusters[c.clusterId];
		if (c.kind === "node" && cl) {
			steps.push({
				label: `docker port ${m.hostIp}:${port} → ${c.name}:${m.container}`,
				kind: "node",
				cluster: cl.entry,
				name: c.name
			});
			const svc = cl.res.services.find((s) => (s.spec.ports || []).some((p) => p.nodePort === m.container));
			const ig = PG.ingressNginx(cl);
			const igPort = ig && ig.svc ? (ig.svc.spec.ports || []).find((p) => p.nodePort === m.container) : null;
			if ((m.container === 80 || m.container === 443 || igPort) && ig) {
				if (!ig.ready) return {
					error: {
						code: 52,
						msg: "Empty reply from server"
					},
					steps
				};
				steps.push({
					label: "ingress-nginx controller",
					kind: "svc",
					cluster: cl.entry,
					ns: "ingress-nginx",
					name: "ingress-nginx-controller"
				});
				return {
					...PG.routeIngress(cl, req, steps, "nginx"),
					steps
				};
			}
			if (!svc) return {
				error: {
					code: 52,
					msg: "Empty reply from server"
				},
				steps
			};
			return {
				...PG.viaService(cl, svc, m.container, req, steps),
				steps
			};
		}
		if (c.kind === "lb" && cl) {
			const map = (cl.lbMaps || []).find((x) => x.host === port);
			if (!map) continue;
			steps.push({
				label: `k3d load balancer :${port} → :${map.target} on the nodes`,
				kind: "lb",
				cluster: cl.entry,
				name: c.name
			});
			const lb = cl.res.services.find((s) => s.spec.type === "LoadBalancer" && s.metadata.name !== "traefik" && (s.spec.ports || []).some((p) => p.port === map.target));
			if (lb) return {
				...PG.viaService(cl, lb, map.target, req, steps),
				steps
			};
			steps.push({
				label: "Traefik (ingress controller)",
				kind: "svc",
				cluster: cl.entry,
				ns: "kube-system",
				name: "traefik"
			});
			return {
				...PG.routeIngress(cl, req, steps, "traefik"),
				steps
			};
		}
	}
	return {
		error: {
			code: 7,
			msg: `Failed to connect to localhost port ${port} after 0 ms: Couldn't connect to server`
		},
		steps
	};
};
PG.containerRespond = (sim, c, m, req, steps) => {
	const info = PG.imageInfo(sim, c.image) || {};
	if (info.type === "web" && PG.containerAsPod) {
		const pod = PG.containerAsPod(sim, c);
		const root = PG.webRootDir(info);
		if (root) {
			const content = PG.podFS(null, pod).read(root + (req.path === "/" ? "/index.html" : req.path));
			steps.push({
				label: `docker port ${m.hostIp}:${m.host} → ${c.name}:${m.container}`,
				kind: "container",
				name: c.name
			});
			const status = content !== void 0 ? 200 : 404;
			const body = content !== void 0 ? content : PG.NGINX_404;
			pod._sim.logs.push(`172.17.0.1 - - [${new Date(PG.BASE_TIME + sim.clock * 1e3).toUTCString().slice(5, 25).replace(/ /g, "/")}] "${req.method || "GET"} ${req.path} HTTP/1.1" ${status} ${body.length} "-" "curl/8.7.1" "-"`);
			return m.container === (info.port || 80) ? {
				status,
				body
			} : { error: {
				code: 52,
				msg: "Empty reply from server"
			} };
		}
	}
	steps.push({
		label: `docker port ${m.hostIp}:${m.host} → ${c.name}:${m.container}`,
		kind: "container",
		name: c.name
	});
	if (info.type === "web" && m.container === (info.port || 80)) {
		const root = PG.webRootDir(info);
		let body = info.page || "";
		let status = 200;
		if (root && info.fs) {
			const f = info.fs[root + (req.path === "/" ? "/index.html" : req.path)];
			if (f !== void 0) body = f;
			else if (req.path !== "/") {
				status = 404;
				body = PG.NGINX_404;
			}
		} else if (root && req.path !== "/") {
			status = 404;
			body = PG.NGINX_404;
		}
		return {
			status,
			body
		};
	}
	if (info.type === "tcp") return { error: {
		code: 52,
		msg: "Empty reply from server"
	} };
	return { error: {
		code: 52,
		msg: "Empty reply from server"
	} };
};
PG.routeIngress = (cl, req, steps, controller) => {
	const host = (req.headers.host || "").split(":")[0];
	const notFound = controller === "nginx" ? {
		status: 404,
		body: PG.NGINX_404
	} : {
		status: 404,
		body: "404 page not found"
	};
	for (const ing of cl.res.ingresses) for (const rule of ing.spec.rules || []) {
		if (rule.host && rule.host !== host) continue;
		for (const p of (rule.http || { paths: [] }).paths) {
			const pre = p.path || "/";
			if (p.pathType === "Exact" ? req.path === pre : req.path.startsWith(pre)) {
				steps.push({
					label: `Ingress ${ing.metadata.name}`,
					kind: "ing",
					cluster: cl.entry,
					ns: ing.metadata.namespace,
					name: ing.metadata.name
				});
				const svc = cl.find("services", p.backend.service.name, ing.metadata.namespace);
				if (!svc) return {
					status: 503,
					body: controller === "nginx" ? "<html><body><h1>503 Service Temporarily Unavailable</h1></body></html>" : "Service Unavailable"
				};
				const pn = p.backend.service.port.number !== void 0 ? p.backend.service.port.number : ((svc.spec.ports || []).find((x) => x.name === p.backend.service.port.name) || {}).port;
				return PG.viaService(cl, svc, pn, req, steps);
			}
		}
	}
	return notFound;
};
PG.ingressNginx = (cl) => {
	const d = cl.find("deployments", "ingress-nginx-controller", "ingress-nginx");
	if (!d) return null;
	return {
		dep: d,
		svc: cl.find("services", "ingress-nginx-controller", "ingress-nginx"),
		ready: (d.status || {}).readyReplicas > 0
	};
};
PG.registryResponse = (sim, c, req) => {
	const data = sim.registries[c.name] || {};
	const p = req.path;
	if (p === "/v2/" || p === "/v2") return {
		status: 200,
		body: "{}"
	};
	if (p === "/v2/_catalog") return {
		status: 200,
		body: JSON.stringify({ repositories: [...new Set(Object.keys(data).map((k) => k.split(":")[0]))] })
	};
	const m = /^\/v2\/(.+)\/tags\/list$/.exec(p);
	if (m) {
		const tags = Object.keys(data).filter((k) => k.split(":")[0] === m[1]).map((k) => k.split(":")[1]);
		if (!tags.length) return {
			status: 404,
			body: JSON.stringify({ errors: [{
				code: "NAME_UNKNOWN",
				message: "repository name not known to registry"
			}] })
		};
		return {
			status: 200,
			body: JSON.stringify({
				name: m[1],
				tags
			})
		};
	}
	return {
		status: 404,
		body: "404 page not found"
	};
};
PG.podRequest = (sim, cl, fromPod, req) => {
	const steps = [{
		label: `pod ${fromPod.name} (${fromPod.ns})`,
		kind: "pod",
		cluster: cl.entry,
		ns: fromPod.ns,
		name: fromPod.name
	}];
	const host = req.host;
	if (host === "localhost" || host === "127.0.0.1") return {
		error: {
			code: 7,
			msg: "connection refused (nothing listens inside this pod)"
		},
		steps
	};
	const svc = cl.findServiceByHost(host, fromPod.ns);
	if (!svc) {
		const pod = cl.res.pods.find((p) => p.status.podIP === host);
		if (pod) return {
			...PG.podRespond(cl, pod, req, steps),
			steps
		};
		return {
			error: {
				code: 6,
				msg: `Could not resolve host: ${host} (bad address '${host}')`
			},
			steps
		};
	}
	steps.push({
		label: `cluster DNS: ${host} → ${svc.spec.clusterIP}`,
		kind: "dns"
	});
	const targets = cl.matchPods(svc.metadata.namespace, svc.spec.selector);
	if (targets.length) {
		const blocked = PG.netpolBlocks(cl, fromPod.ns, fromPod.labels, targets[0]);
		if (blocked) return {
			error: {
				code: 28,
				msg: `download timed out (NetworkPolicy "${blocked}" in namespace ${svc.metadata.namespace} drops this traffic)`,
				blocked: true
			},
			steps
		};
	}
	return {
		...PG.viaService(cl, svc, req.port || 80, req, steps, fromPod.ip || "10.244.1.9"),
		steps
	};
};
C.curl = async (ctx, args) => {
	let url = null;
	const hdrs = {};
	let method = "GET";
	let outFile = null, write = null, silent = false, head = false, include = false;
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "-s" || a === "-fsSL" || a === "-sS" || a === "-S" || a === "-f" || a === "-L" || a === "-fsS") silent = silent || a.includes("s");
		else if (a === "-o") outFile = args[++i];
		else if (a === "-w") write = args[++i];
		else if (a === "-H") {
			const [k, ...v] = args[++i].split(":");
			hdrs[k.trim().toLowerCase()] = v.join(":").trim();
		} else if (a === "-X") method = args[++i];
		else if (a === "-d" || a === "--data") {
			args[++i];
			method = method === "GET" ? "POST" : method;
		} else if (a === "-I") {
			head = true;
			include = true;
		} else if (a === "-i") include = true;
		else if (!a.startsWith("-")) url = a;
	}
	if (!url) {
		ctx.eprintln("curl: try 'curl --help' for more information");
		return 2;
	}
	const m = /^(?:(https?):\/\/)?(\[[^\]]+\]|[^\/:]+)(?::(\d+))?(\/[^?#]*)?(\?.*)?$/.exec(url);
	if (!m) {
		ctx.eprintln(`curl: (3) URL rejected: Malformed input to a URL function`);
		return 3;
	}
	const host = m[2];
	const port = m[3] ? Number(m[3]) : m[1] === "https" ? 443 : 80;
	const req = {
		host,
		port,
		path: m[4] || "/",
		method,
		headers: {
			host: host + (m[3] ? ":" + m[3] : ""),
			...hdrs
		}
	};
	let resolvedHost = host;
	const hostsTxt = ctx.fs.read("/etc/hosts") || "";
	const resolveI = args.indexOf("--resolve");
	const resolveSpec = resolveI >= 0 ? args[resolveI + 1] : null;
	const inHosts = (h) => hostsTxt.split("\n").some((l) => {
		const t = l.replace(/#.*/, "").trim().split(/\s+/);
		return /^(127\.0\.0\.1|::1|0\.0\.0\.0)$/.test(t[0]) && t.slice(1).includes(h);
	});
	if (![
		"localhost",
		"127.0.0.1",
		"[::1]",
		"0.0.0.0"
	].includes(host) && (inHosts(host) || host.endsWith(".localhost") || resolveSpec && resolveSpec.startsWith(host + ":"))) resolvedHost = "localhost";
	else if (![
		"localhost",
		"127.0.0.1",
		"[::1]",
		"0.0.0.0"
	].includes(host) && /\./.test(host) && !/get\.helm\.sh|github\.com|charts\.helm\.sh/.test(host)) {
		ctx.eprintln(`curl: (6) Could not resolve host: ${host}` + (host.endsWith(".local") || !host.includes(".") ? "" : "") + `\n(the playground has no internet. To reach a local name, add it to /etc/hosts:  echo '127.0.0.1 ${host}' | sudo tee -a /etc/hosts   — or use  curl -H 'Host: ${host}' http://localhost/ )`);
		return 6;
	}
	let res = PG.localRequest(ctx.sim, {
		...req,
		port,
		host: resolvedHost
	});
	ctx.sim.traceReq(res.steps, !res.error && (res.status || 200) < 400);
	if (res.error) {
		if (res.error.status === 503 && !silent) {}
		ctx.eprintln(`curl: (${res.error.code}) ${res.error.msg}`);
		return res.error.code;
	}
	const status = res.status || 200;
	if (include) ctx.println(`HTTP/1.1 ${status} ${status === 200 ? "OK" : status === 404 ? "Not Found" : ""}\nServer: nginx\nContent-Type: text/html\n`);
	if (outFile === "/dev/null" || head) {} else if (outFile) ctx.fs.write(ctx.resolve(outFile), res.body);
	else ctx.println(res.body);
	if (write) ctx.out(write.replace(/%\{http_code\}/g, String(status)).replace(/\\n/g, "\n"));
	return 0;
};
{
	const SYSTEM_NS = /* @__PURE__ */ new Set([
		"kube-system",
		"kube-public",
		"kube-node-lease",
		"local-path-storage",
		"ingress-nginx"
	]);
	const ORDER = [
		"namespaces",
		"resourcequotas",
		"serviceaccounts",
		"secrets",
		"configmaps",
		"persistentvolumeclaims",
		"clusterroles",
		"clusterrolebindings",
		"roles",
		"rolebindings",
		"networkpolicies",
		"services",
		"deployments",
		"daemonsets",
		"jobs",
		"cronjobs",
		"pods",
		"ingresses",
		"horizontalpodautoscalers",
		"poddisruptionbudgets"
	];
	const SYS_SA = /^(default|coredns|kube-proxy|metrics-server|kindnet|local-path-provisioner-service-account|traefik|helm-traefik|ingress-nginx|ingress-nginx-admission|kube-dns|gke-.*|fluentbit-gke|.*-gke|svclb-.*)$/;
	const SYS_CR = /^(system:|kubeadm:|cluster-admin$|admin$|edit$|view$|kindnet|local-path|traefik|helm-|metrics-server|ingress-nginx|coredns|kube-|gke-|cloud-)/;
	const SYS_NS_KEEP = { serviceaccounts: (n) => !SYS_SA.test(n) };
	const quote = (s) => /^[\w@%+=:,./-]+$/.test(s) ? s : "'" + String(s).replace(/'/g, "'\\''") + "'";
	const hostOf = (img) => {
		const first = String(img).split("/")[0];
		return String(img).includes("/") && /[.:]|^localhost$/.test(first) ? first : null;
	};
	const manifest = (cl, plural, o) => {
		const c = PG.cleanForOutput(cl, plural, o);
		delete c.status;
		const m = c.metadata || (c.metadata = {});
		for (const k of [
			"uid",
			"resourceVersion",
			"creationTimestamp",
			"generation",
			"selfLink",
			"managedFields",
			"ownerReferences"
		]) delete m[k];
		if (m.annotations) {
			delete m.annotations["deployment.kubernetes.io/revision"];
			if (!Object.keys(m.annotations).length) delete m.annotations;
		}
		if (plural === "namespaces") {
			if (m.labels) {
				delete m.labels["kubernetes.io/metadata.name"];
				if (!Object.keys(m.labels).length) delete m.labels;
			}
			if (c.spec && !Object.keys(c.spec).length) delete c.spec;
		}
		if (plural === "services" && c.spec) {
			delete c.spec.clusterIP;
			delete c.spec.clusterIPs;
			if (!["NodePort", "LoadBalancer"].includes(c.spec.type)) for (const p of c.spec.ports || []) delete p.nodePort;
		}
		if (plural === "pods" && c.spec) delete c.spec.nodeName;
		if (plural === "persistentvolumeclaims" && c.spec) delete c.spec.volumeName;
		if (c.spec && c.spec.template && c.spec.template.metadata) delete c.spec.template.metadata.creationTimestamp;
		if (plural === "jobs" && c.spec) {
			delete c.spec.selector;
			const l = c.spec.template && c.spec.template.metadata && c.spec.template.metadata.labels;
			if (l) {
				delete l["controller-uid"];
				delete l["job-name"];
				if (!Object.keys(l).length) delete c.spec.template.metadata.labels;
			}
		}
		return PG.yaml.dump(c).replace(/\n$/, "");
	};
	PG.buildScript = (sim, o = {}) => {
		const cl = sim.currentCluster();
		const stats = {
			cluster: null,
			counts: {},
			left: [],
			images: [],
			nodes: 0
		};
		if (!cl) return {
			script: "# No cluster in the current kubectl context.\n# Create one (kind create cluster …, k3d cluster create …) or switch with: kubectl config use-context NAME\n",
			stats: {
				...stats,
				empty: true
			}
		};
		const g = PG.gkeParts ? PG.gkeParts(cl.id) : null;
		const tool = o.tool || (cl.tool === "k3d" ? "k3d" : "kind");
		const defName = cl.tool === "gke" ? "local-" + (g ? g.name : cl.id) : cl.id.replace(/^(kind|k3d)-/, "");
		const name = String(o.name || defName).replace(/[^\w.-]/g, "-");
		const opt = {
			tool,
			name,
			waits: o.waits !== false,
			strict: o.strict !== false,
			secrets: o.secrets !== false
		};
		stats.cluster = `${cl.tool} ${cl.id} → ${tool} ${name}`;
		stats.defaults = {
			tool: cl.tool === "k3d" ? "k3d" : "kind",
			name: defName
		};
		const ctxName = (tool === "kind" ? "kind-" : "k3d-") + name;
		const cps = cl.nodes.filter((n) => n.role === "control-plane"), ws = cl.nodes.filter((n) => n.role !== "control-plane");
		stats.nodes = cl.nodes.length;
		const newName = (role, idx) => tool === "kind" ? `${name}-${role === "control-plane" ? "control-plane" : "worker"}${idx ? idx + 1 : ""}` : `k3d-${name}-${role === "control-plane" ? "server" : "agent"}-${idx}`;
		const nodeMap = /* @__PURE__ */ new Map();
		cps.forEach((n, i) => nodeMap.set(n.name, newName("control-plane", i)));
		ws.forEach((n, i) => nodeMap.set(n.name, newName("worker", i)));
		const ports = [];
		for (const c of sim.containers.filter((x) => x.clusterId === cl.entry)) for (const p of c.ports || []) if (p.container !== 6443 && (c.kind === "node" || /-serverlb$/.test(c.name))) ports.push({
			host: p.host,
			container: p.container,
			role: /worker|agent/.test(c.name) ? "worker" : "control-plane"
		});
		const keepLabel = (k) => !k.includes("/") || !/(^|\.)(kubernetes\.io|k8s\.io|k3s\.io|google\.com|gke\.io)$/.test(k.split("/")[0]);
		const keepTaint = (k) => !/^(node-role\.kubernetes\.io\/|node\.kubernetes\.io\/|node\.cloudprovider\.kubernetes\.io\/|cloud\.google\.com\/)/.test(k);
		const body = [];
		const sec = (t) => body.push("", `# ---- ${t} ----`);
		sec("the cluster");
		if (tool === "kind") {
			const lines = [
				"kind: Cluster",
				"apiVersion: kind.x-k8s.io/v1alpha4",
				"nodes:"
			];
			const roles = [...cps.map(() => "control-plane"), ...ws.map(() => "worker")];
			if (!cps.length) roles.unshift("control-plane");
			const seen = /* @__PURE__ */ new Set();
			roles.forEach((r) => {
				lines.push(`- role: ${r}`);
				if (!seen.has(r)) {
					seen.add(r);
					const mine = ports.filter((p) => p.role === r);
					if (mine.length) {
						lines.push("  extraPortMappings:");
						for (const p of mine) lines.push(`  - containerPort: ${p.container}`, `    hostPort: ${p.host}`, "    protocol: TCP");
					}
				}
			});
			body.push(`cat > "\${LAB}/kind-config.yaml" <<'PG_EOF'\n${lines.join("\n")}\nPG_EOF`);
			body.push(`if kind get clusters 2>/dev/null | grep -qx ${quote(name)}; then echo "kind cluster ${name} already exists, reusing it"; else kind create cluster --name ${quote(name)} --config "\${LAB}/kind-config.yaml"; fi`);
		} else {
			const flags = [
				`--servers ${Math.max(1, cps.length)}`,
				`--agents ${ws.length}`,
				...ports.map((p) => `--port "${p.host}:${p.container}@loadbalancer"`)
			];
			body.push(`if k3d cluster list ${quote(name)} >/dev/null 2>&1; then echo "k3d cluster ${name} already exists, reusing it"; else k3d cluster create ${quote(name)} ${flags.join(" ")}; fi`);
		}
		body.push(`kubectl config use-context ${ctxName}`, "guard", "kubectl wait --for=condition=Ready nodes --all --timeout=300s");
		const nodeCmds = [];
		for (const n of cl.nodes) {
			const nn = nodeMap.get(n.name);
			const labs = Object.entries(n.labels || {}).filter(([k]) => keepLabel(k));
			if (labs.length) nodeCmds.push(`kubectl label node ${nn} ${labs.map(([k, v]) => quote(`${k}=${v}`)).join(" ")} --overwrite`);
			for (const t of n.taints || []) if (keepTaint(t.key)) nodeCmds.push(`kubectl taint nodes ${nn} ${quote(`${t.key}=${t.value || ""}:${t.effect}`)} --overwrite`);
		}
		if (nodeCmds.length) {
			sec("node labels and taints");
			body.push(...nodeCmds);
		}
		const hasDep = (ns, n) => !!cl.find("deployments", n, ns);
		if (tool === "kind" && cl.tool !== "gke" && (cl.res.namespaces || []).some((n) => n.metadata.name === "ingress-nginx")) {
			sec("ingress-nginx");
			body.push("kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml", "kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=180s || echo \"WARNING: ingress-nginx was not ready in time, continuing\"");
		}
		if (tool === "kind" && cl.tool === "kind" && hasDep("kube-system", "metrics-server")) {
			sec("metrics-server");
			body.push("kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml", `kubectl patch -n kube-system deployment metrics-server --type=json -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'`);
		}
		const docs = {};
		const images = /* @__PURE__ */ new Set();
		let left = 0;
		const take = (plural, ob) => {
			const m = ob.metadata;
			const ns = m.namespace;
			const nm = m.name;
			if (m._owner) return false;
			if (ns && SYSTEM_NS.has(ns)) {
				const keep = SYS_NS_KEEP[plural];
				if (!keep || !keep(nm)) return false;
			}
			if (plural === "namespaces" && (SYSTEM_NS.has(nm) || nm === "default")) return false;
			if (plural === "serviceaccounts" && nm === "default" && !(ob.imagePullSecrets || []).length) return false;
			if ((plural === "clusterroles" || plural === "clusterrolebindings") && SYS_CR.test(nm)) return false;
			if (plural === "secrets" && (/service-account-token|helm\.sh\/release/.test(ob.type || "") || !opt.secrets)) return false;
			if (plural === "configmaps" && (nm === "kube-root-ca.crt" || m.labels && m.labels.OWNER === "TILLER")) return false;
			if (plural === "services" && ns === "default" && nm === "kubernetes") return false;
			return true;
		};
		for (const plural of ORDER) for (const ob of cl.res[plural] || []) {
			if (!take(plural, ob)) {
				left++;
				continue;
			}
			(docs[plural] = docs[plural] || []).push({
				o: ob,
				y: manifest(cl, plural, ob)
			});
			const k = PG.KINDS[plural].kind;
			stats.counts[k] = (stats.counts[k] || 0) + 1;
			const ps = ob.spec && (ob.spec.template ? ob.spec.template.spec : plural === "pods" ? ob.spec : ob.spec.jobTemplate ? ob.spec.jobTemplate.spec.template.spec : null);
			if (ps) for (const c of [...ps.containers || [], ...ps.initContainers || []]) images.add(c.image);
		}
		const csr = (cl.res.certificatesigningrequests || []).length;
		if (csr) stats.left.push(`${csr} certificate signing request(s): users and certificates are not recreated`);
		const tiller = cl.find("deployments", "tiller-deploy", "kube-system");
		let tillerSa = null;
		if (tiller) {
			const sa = tiller.spec.template.spec.serviceAccountName;
			tillerSa = sa && sa !== "default" ? sa : "";
			stats.helm = true;
		}
		sec("your objects (applied in dependency order)");
		for (const plural of ORDER) {
			if (!docs[plural]) continue;
			const k = PG.KINDS[plural].kind;
			body.push(`# ${k}${docs[plural].length > 1 ? "s" : ""}`, "guard", `kubectl apply -f - <<'PG_EOF'\n${docs[plural].map((d) => d.y).join("\n---\n")}\nPG_EOF`);
			if (tiller && plural === (docs.clusterrolebindings ? "clusterrolebindings" : docs.rolebindings ? "rolebindings" : "serviceaccounts") && !stats.tillerDone) {
				body.push(`helm2 init ${tillerSa ? "--service-account " + tillerSa + " " : ""}--wait`);
				stats.tillerDone = true;
			}
		}
		if (tiller && !stats.tillerDone) body.push("guard", `helm2 init ${tillerSa ? "--service-account " + tillerSa + " " : ""}--wait`);
		if (opt.waits) {
			const w = [];
			for (const plural of ["deployments", "daemonsets"]) for (const d of docs[plural] || []) {
				const m = d.o.metadata;
				if (plural === "deployments" && d.o.spec.replicas === 0) continue;
				w.push(`kubectl rollout status ${plural === "deployments" ? "deployment" : "daemonset"}/${m.name} -n ${m.namespace || "default"} --timeout=300s || echo "WARNING: ${m.name} was not ready in time, continuing"`);
			}
			if (w.length) {
				sec("wait until they are ready");
				body.push(...w);
			}
		}
		sec("look at the result");
		body.push("kubectl get nodes -o wide", "kubectl get pods -A");
		stats.left.unshift(`${left} system or controller-made object(s): the cluster makes those itself`);
		stats.images = [...images].filter(Boolean);
		const foreign = stats.images.filter((i) => hostOf(i));
		const local = foreign.filter((i) => /^(localhost|k3d-|kind-registry)/.test(hostOf(i)));
		const notes = [];
		if (cl.tool === "gke") notes.push("Source was the simulated PRODUCTION cluster: this builds a local copy of its workloads, not a real GKE cluster.");
		if (local.length) notes.push(`These images come from a registry that only existed in the simulator: push them there first, or change the image names: ${local.join(", ")}`);
		else if (foreign.length) notes.push(`Images from outside Docker Hub (the machine must be able to pull them): ${foreign.join(", ")}`);
		if (opt.secrets && (docs.secrets || []).length) notes.push("Secrets are included with their values.");
		if (stats.helm) notes.push("Helm releases are applied as plain objects (release history is not recreated). Tiller needs the helm2 binary.");
		const head = [
			"#!/usr/bin/env bash",
			`# Generated by the KubeDojo from the cluster in context ${cl.entry} (${cl.tool}): ${Object.entries(stats.counts).map(([k, v]) => v + " " + k).join(", ") || "no user objects"}.`,
			"# READ IT BEFORE RUNNING: it creates a real Docker-based cluster, deploys into it, and writes under $LAB (default ~/k8s-lab).",
			...notes.map((n) => "# NOTE: " + n),
			opt.strict ? "set -euo pipefail" : "set -uo pipefail",
			"LAB=\"${LAB:-$HOME/k8s-lab}\"",
			"need() { command -v \"$1\" >/dev/null 2>&1 || { echo \"missing tool: $1  ($2)\"; exit 1; }; }",
			"need docker \"install Docker Desktop and start it\"",
			`need ${tool} "brew install ${tool}"`,
			"need kubectl \"brew install kubectl\"",
			...stats.helm ? ["need helm2 \"Helm v2 binary, installed under the name helm2\""] : [],
			"docker info >/dev/null 2>&1 || { echo \"Docker is not running\"; exit 1; }",
			"# never apply anything unless kubectl points at the new local cluster",
			`guard() { local c; c="$(kubectl config current-context 2>/dev/null || true)"; [ "$c" = "${ctxName}" ] || { echo "refusing to run: current kubectl context is '$c', expected ${ctxName}"; exit 1; }; }`,
			"mkdir -p \"$LAB\""
		];
		const foot = [
			"",
			"echo \"done.\"",
			"",
			"# To remove it again:",
			tool === "kind" ? `#   kind delete cluster --name ${name}` : `#   k3d cluster delete ${name}`,
			""
		];
		return {
			script: [
				...head,
				...body,
				...foot
			].join("\n"),
			stats
		};
	};
	PG.commands["export-script"] = async (ctx) => {
		if (PG.openExport) PG.openExport();
		else ctx.println(PG.buildScript(ctx.sim).script);
	};
}
PG.gkeParts = (id) => {
	const m = /^gke_([^_]+)_([^_]+)_(.+)$/.exec(id);
	return m ? {
		project: m[1],
		zone: m[2],
		name: m[3]
	} : null;
};
PG.deleteCommandFor = (cl) => {
	if (cl.tool === "kind") return `kind delete cluster --name ${cl.id.replace(/^kind-/, "")}`;
	if (cl.tool === "k3d") return `k3d cluster delete ${cl.id.replace(/^k3d-/, "")}`;
	const g = PG.gkeParts(cl.id);
	return g ? `gcloud container clusters delete ${g.name} --zone ${g.zone} --quiet` : `# no delete command known for ${cl.id}`;
};
PG.commands.gcloud = async (ctx, args) => {
	const sim = ctx.sim;
	const a = args.filter((x) => !x.startsWith("-"));
	const flag = (n, d) => {
		const i = args.findIndex((x) => x === n || x.startsWith(n + "="));
		if (i < 0) return d;
		return args[i].includes("=") ? args[i].split("=")[1] : args[i + 1];
	};
	if (args[0] === "--version" || a[0] === "version") {
		ctx.println("Google Cloud SDK 498.0.0\nkubectl 1.33.5\ngke-gcloud-auth-plugin 0.5.9");
		return 0;
	}
	if (a[0] !== "container" || a[1] !== "clusters") {
		ctx.eprintln("ERROR: (gcloud) this playground only knows: gcloud container clusters list | delete NAME [--zone Z] --quiet");
		return 1;
	}
	const gkes = Object.values(sim.clusters).filter((c) => c.tool === "gke");
	if (a[2] === "list") {
		if (!gkes.length) {
			ctx.eprintln("Listed 0 items.");
			return 0;
		}
		ctx.println(PG.table(gkes.map((c) => {
			const g = PG.gkeParts(c.id) || {
				name: c.id,
				zone: "-"
			};
			return [
				g.name,
				g.zone,
				c.k8sVersion.replace(/^v/, ""),
				c.api.replace("https://", ""),
				"e2-standard-4",
				c.k8sVersion.replace(/^v/, ""),
				String(c.nodes.length),
				"RUNNING"
			];
		}), [
			"NAME",
			"LOCATION",
			"MASTER_VERSION",
			"MASTER_IP",
			"MACHINE_TYPE",
			"NODE_VERSION",
			"NUM_NODES",
			"STATUS"
		]));
		return 0;
	}
	if (a[2] === "delete") {
		const name = a[3];
		if (!name) {
			ctx.eprintln("ERROR: (gcloud.container.clusters.delete) argument NAME [NAME ...]: Must be specified.");
			return 1;
		}
		const cl = gkes.find((c) => {
			const g = PG.gkeParts(c.id);
			return c.id === name || g && g.name === name;
		});
		if (!cl) {
			ctx.eprintln(`ERROR: (gcloud.container.clusters.delete) ResponseError: code=404, message=Not found: projects/prod-project/zones/${flag("--zone", "asia-east1-a")}/clusters/${name}.`);
			return 1;
		}
		const g = PG.gkeParts(cl.id);
		const zone = flag("--zone") || flag("--location");
		if (!zone) {
			ctx.eprintln("ERROR: (gcloud.container.clusters.delete) One of [--location, --region, --zone] must be supplied: Please specify location.");
			return 1;
		}
		if (!args.includes("--quiet") && !args.includes("-q")) {
			ctx.println(`The following clusters will be deleted.\n - [${g.name}] in [${g.zone}]\n\nDo you want to continue (Y/n)?  `);
			ctx.eprintln("(the playground cannot answer prompts: add --quiet to say yes)");
			return 1;
		}
		if (zone !== g.zone) {
			ctx.eprintln(`ERROR: (gcloud.container.clusters.delete) ResponseError: code=404, message=Not found: projects/${g.project}/zones/${zone}/clusters/${g.name}.`);
			return 1;
		}
		await ctx.delay(500);
		ctx.println(`Deleting cluster ${g.name}...done.`);
		sim.containers = sim.containers.filter((c) => c.clusterId !== cl.entry);
		delete sim.clusters[cl.entry];
		sim.removeKubeEntries(cl.entry);
		sim.forwards = sim.forwards.filter((f) => f.cluster !== cl);
		ctx.println(`Deleted [https://container.googleapis.com/v1/projects/${g.project}/zones/${g.zone}/clusters/${g.name}].`);
		ctx.info("(playground: the kubeconfig entries for it were removed too; real gcloud leaves them behind, so you would clean them with kubectl config delete-context / delete-cluster / unset users.…)");
		return 0;
	}
	ctx.eprintln("ERROR: (gcloud.container.clusters) supported here: list, delete");
	return 1;
};
PG.upText = (sim, c) => {
	const age = Math.max(0, Math.floor(sim.clock - c.startedAt));
	const t = age < 60 ? age + " seconds" : age < 3600 ? Math.floor(age / 60) + " minutes" : Math.floor(age / 3600) + " hours";
	return c.status === "running" ? "Up " + (age < 2 ? "Less than a second" : t) : `Exited (${c.exitCode || 0}) ${t} ago`;
};
PG.portsText = (c) => c.ports.map((p) => `${p.hostIp}:${p.host}->${p.container}/${p.proto || "tcp"}`).join(", ");
PG.goFormat = (fmt, rows, fieldNames) => {
	const isTable = /^table\s/.test(fmt);
	let f = fmt.replace(/^table\s+/, "");
	const cols = [...f.matchAll(/\{\{\.(\w+)\}\}/g)].map((m) => m[1]);
	const render = (o) => f.replace(/\{\{\.(\w+)\}\}/g, (m, k) => o[k] ?? "").replace(/\\t/g, "	").replace(/\\n/g, "\n");
	if (!isTable) return rows.map(render).join("\n");
	const lines = [cols.map((c) => c.toUpperCase()).join("	"), ...rows.map(render)].map((l) => l.split("	"));
	const w = [];
	lines.forEach((l) => l.forEach((c, i) => w[i] = Math.max(w[i] || 0, c.length)));
	return lines.map((l) => l.map((c, i) => i === l.length - 1 ? c : PG.pad(c, w[i] + 3)).join("")).join("\n");
};
var imgRow = (sim, key) => {
	const i = sim.images[key];
	const lc = key.lastIndexOf(":");
	const slash = key.lastIndexOf("/");
	return {
		Repository: lc > slash ? key.slice(0, lc) : key,
		Tag: lc > slash ? key.slice(lc + 1) : "latest",
		ID: i.id,
		Size: i.size >= 1e3 ? (i.size / 1e3).toFixed(2) + "GB" : i.size + "MB",
		CreatedSince: i.created === void 0 ? "2 weeks ago" : "Less than a second ago"
	};
};
PG.dockerAvailable = (ref) => {
	const p = PG.parseImage(ref);
	if (p.host && !PG.PUBLIC_HOSTS.includes(p.host)) return false;
	return !!PG.CATALOG[p.repo] || /^(kindest|rancher|k3d)/.test(p.repo);
};
PG.commands.docker = async (ctx, args) => {
	const sim = ctx.sim;
	const sub = args[0];
	const rest = args.slice(1);
	const o = PG.opts(rest);
	const find = (n) => sim.container(n.replace(/^\//, ""));
	if (!sub || sub === "--help" || sub === "help") {
		ctx.println(`Usage:  docker COMMAND
Supported in the playground:
  ps [-a] [--format]    images    pull    build -t name:tag DIR    tag    push    rmi
  run -d --name N -p H:C --restart=always --network N IMAGE        rm [-f]    stop    start    restart
  exec [-i] CONTAINER cmd      (kind/k3d nodes: crictl images|rmi|ps, mkdir, cp /dev/stdin FILE, ls, cat)
  network ls|connect NET CONTAINER      info [--format]     system df     logs CONTAINER`);
		return 0;
	}
	if (sub === "info") {
		const f = rest.indexOf("--format");
		const fmt = f >= 0 ? rest[f + 1] : null;
		const info = {
			ServerVersion: "29.8.2",
			MemTotal: "12262920192",
			NCPU: "6",
			Name: "docker-desktop"
		};
		if (fmt) ctx.println(fmt.replace(/\{\{\.(\w+)\}\}/g, (m, k) => info[k] ?? ""));
		else ctx.println(`Server:\n Server Version: 29.8.2\n Total Memory: 11.42GiB\n CPUs: 6\n Name: docker-desktop`);
		return 0;
	}
	if (sub === "ps") {
		const fi = rest.indexOf("--format");
		const fmt = fi >= 0 ? rest[fi + 1] : null;
		const rows = sim.containers.filter((c) => o.flags.has("a") || c.status === "running").map((c) => ({
			ID: c.id,
			Names: c.name,
			Image: c.image,
			Status: PG.upText(sim, c),
			Ports: PG.portsText(c),
			Command: "\"/usr/local/bin/entry…\"",
			CreatedAt: PG.iso(c.created),
			RunningFor: PG.fmtAge(sim.clock - c.created) + " ago",
			Networks: c.networks.join(",")
		}));
		if (fmt) {
			if (rows.length || /^table/.test(fmt)) ctx.println(PG.goFormat(fmt, rows));
			return 0;
		}
		ctx.println(PG.table(rows.map((r) => [
			r.ID,
			r.Image,
			r.Command,
			r.RunningFor,
			r.Status,
			r.Ports,
			r.Names
		]), [
			"CONTAINER ID",
			"IMAGE",
			"COMMAND",
			"CREATED",
			"STATUS",
			"PORTS",
			"NAMES"
		]));
		return 0;
	}
	if (sub === "images" || sub === "image") {
		const fi = rest.indexOf("--format");
		const fmt = fi >= 0 ? rest[fi + 1] : null;
		const rows = Object.keys(sim.images).map((k) => imgRow(sim, k));
		if (fmt) ctx.println(PG.goFormat(fmt, rows));
		else ctx.println(PG.table(rows.map((r) => [
			r.Repository,
			r.Tag,
			r.ID,
			r.CreatedSince,
			r.Size
		]), [
			"REPOSITORY",
			"TAG",
			"IMAGE ID",
			"CREATED",
			"SIZE"
		]));
		return 0;
	}
	if (sub === "pull") {
		const ref = o.rest[0];
		if (!ref) {
			ctx.eprintln("\"docker pull\" requires 1 argument");
			return 1;
		}
		const p = PG.parseImage(ref);
		const key = p.host ? ref : p.repo + ":" + p.tag;
		if (!PG.dockerAvailable(ref)) {
			ctx.eprintln(`Error response from daemon: pull access denied for ${p.repo}, repository does not exist or may require 'docker login': denied: requested access to the resource is denied`);
			return 1;
		}
		ctx.println(`${p.tag}: Pulling from ${p.repo.includes("/") ? p.repo : "library/" + p.repo}`);
		await ctx.delay(300);
		ctx.println(`Digest: sha256:${PG.hex(64)}`);
		ctx.println(`Status: Downloaded newer image for ${ref.includes(":") ? ref : ref + ":latest"}`);
		const info = PG.CATALOG[p.repo] || { size: 50 };
		sim.images[key] = sim.images[key] || {
			id: PG.hex(12),
			size: info.size,
			meta: null
		};
		return 0;
	}
	if (sub === "tag") {
		const [src, dst] = o.rest;
		const sk = sim.images[src] ? src : sim.images[PG.parseImage(src).repo + ":" + PG.parseImage(src).tag] ? PG.parseImage(src).repo + ":" + PG.parseImage(src).tag : null;
		if (!sk) {
			ctx.eprintln(`Error response from daemon: No such image: ${src}`);
			return 1;
		}
		sim.images[dst.includes(":") && dst.lastIndexOf(":") > dst.lastIndexOf("/") ? dst : dst + ":latest"] = sim.images[sk];
		return 0;
	}
	if (sub === "rmi") {
		for (const r of o.rest) {
			const k = sim.images[r] ? r : r + ":latest";
			if (!sim.images[k]) {
				ctx.eprintln(`Error response from daemon: No such image: ${r}`);
				return 1;
			}
			delete sim.images[k];
			ctx.println("Untagged: " + r);
		}
		return 0;
	}
	if (sub === "build") {
		const tags = [];
		let file = null;
		const bargs = {};
		const pos = [];
		for (let k = 0; k < rest.length; k++) {
			const a = rest[k];
			if (a === "-t" || a === "--tag") tags.push(rest[++k]);
			else if (a === "-f" || a === "--file") file = rest[++k];
			else if (a === "--build-arg") {
				const kv = rest[++k];
				const e = kv.indexOf("=");
				bargs[kv.slice(0, e)] = kv.slice(e + 1);
			} else if (a === "--platform" || a === "--target" || a === "--progress") k++;
			else if (!a.startsWith("-")) pos.push(a);
		}
		const dir = ctx.resolve(pos[pos.length - 1] || ".");
		const dfPath = file ? ctx.resolve(file) : dir + "/Dockerfile";
		const df = ctx.fs.read(dfPath);
		if (df === void 0) {
			ctx.eprintln(`ERROR: failed to solve: failed to read dockerfile: open ${file || "Dockerfile"}: no such file or directory`);
			return 1;
		}
		ctx.println(`[+] Building ...`);
		await ctx.delay(300);
		const res = await PG.buildImage(ctx, df, dir, bargs);
		if (res.err) {
			ctx.eprintln(res.err);
			return 1;
		}
		ctx.println(` => [internal] load build definition from ${file || "Dockerfile"}`.padEnd(78) + "0.0s");
		for (const l of res.log) ctx.println(l);
		ctx.println(" => exporting to image".padEnd(78) + "0.1s");
		for (const t of tags.length ? tags : []) {
			const key = t.includes(":") && t.lastIndexOf(":") > t.lastIndexOf("/") ? t : t + ":latest";
			sim.images[key] = res.image;
			ctx.println(` => => naming to docker.io/library/${key}`.padEnd(78) + "0.0s");
		}
		if (!tags.length) ctx.println(` => => writing image sha256:${res.image.id}${PG.hex(52)}`);
		return 0;
	}
	if (sub === "push") {
		const ref = o.rest[0];
		const p = PG.parseImage(ref);
		const key = ref.lastIndexOf(":") > ref.lastIndexOf("/") ? ref : ref + ":latest";
		const img = sim.images[key];
		if (!img) {
			ctx.eprintln(`The push refers to repository [${p.host ? p.host + "/" : "docker.io/"}${p.repo}]\nAn image does not exist locally with the tag: ${p.host ? p.host + "/" : ""}${p.repo}`);
			return 1;
		}
		if (!p.host) {
			ctx.eprintln(`denied: requested access to the resource is denied`);
			return 1;
		}
		const reg = sim.containers.find((c) => c.kind === "registry" && c.status === "running" && c.ports.some((x) => p.host.endsWith(":" + x.host)));
		ctx.println(`The push refers to repository [${p.host}/${p.repo}]`);
		if (!reg) {
			await ctx.delay(200);
			ctx.eprintln(`Get "http://${p.host}/v2/": dial tcp [::1]:${p.host.split(":")[1] || 443}: connect: connection refused`);
			return 1;
		}
		await ctx.delay(300);
		ctx.println(`${PG.hex(12)}: Pushed`);
		ctx.println(`${p.tag}: digest: sha256:${PG.hex(64)} size: 1570`);
		sim.registries[reg.name][p.repo + ":" + p.tag] = {
			meta: img.meta,
			size: img.size
		};
		sim.note(`registry ${reg.name} received ${p.repo}:${p.tag}`);
		return 0;
	}
	if (sub === "run") {
		let name = null, ports = [], net = "bridge", restart = "", detach = false, image = null, i = 0, cmdv = [], rm = false;
		for (; i < rest.length; i++) {
			const a = rest[i];
			if (a === "-d") detach = true;
			else if (a === "--rm") rm = true;
			else if (a === "-i" || a === "-t" || a === "-it") {} else if (a === "--name") name = rest[++i];
			else if (a === "-p") ports.push(rest[++i]);
			else if (a === "--network") net = rest[++i];
			else if (a.startsWith("--restart")) restart = a.includes("=") ? a.split("=")[1] : rest[++i];
			else if (a === "--platform" || a === "-v" || a === "-w" || a === "-e" || a === "--entrypoint") i++;
			else if (!a.startsWith("-")) {
				image = a;
				cmdv = rest.slice(i + 1);
				break;
			}
		}
		if (!image) {
			ctx.eprintln("\"docker run\" requires at least 1 argument");
			return 125;
		}
		if (name && find(name)) {
			ctx.eprintln(`docker: Error response from daemon: Conflict. The container name "/${name}" is already in use by container "${find(name).id}${PG.hex(52)}". You have to remove (or rename) that container to be able to reuse that name.`);
			return 125;
		}
		const p = PG.parseImage(image);
		const key = p.host ? image : p.repo + ":" + p.tag;
		if (!(sim.images[key] || sim.images[image])) {
			if (!PG.dockerAvailable(image)) {
				ctx.eprintln(`Unable to find image '${image}' locally\ndocker: Error response from daemon: pull access denied for ${p.repo}, repository does not exist or may require 'docker login'.`);
				return 125;
			}
			ctx.println(`Unable to find image '${image}' locally`);
			ctx.println(`${p.tag}: Pulling from ${p.repo.includes("/") ? p.repo : "library/" + p.repo}`);
			await ctx.delay(400);
			ctx.println(`Status: Downloaded newer image for ${image}`);
			sim.images[key] = {
				id: PG.hex(12),
				size: (PG.CATALOG[p.repo] || {}).size || 50
			};
		}
		const mapped = ports.map((s) => {
			const parts = s.split(":");
			let hostIp = "0.0.0.0", host, cont;
			if (parts.length === 3) [hostIp, host, cont] = parts;
			else if (parts.length === 2) [host, cont] = parts;
			else {
				cont = parts[0];
				host = cont;
			}
			return {
				hostIp,
				host: Number(host),
				container: Number(cont.split("/")[0])
			};
		});
		for (const m of mapped) if (sim.containers.find((c) => c.status === "running" && c.ports.some((x) => x.host === m.host && (x.hostIp === m.hostIp || x.hostIp === "0.0.0.0" || m.hostIp === "0.0.0.0")))) {
			ctx.eprintln(`docker: Error response from daemon: driver failed programming external connectivity on endpoint ${name || "container"}: Bind for ${m.hostIp}:${m.host} failed: port is already allocated.`);
			return 125;
		}
		if (net !== "bridge" && !sim.networks.includes(net)) {
			ctx.eprintln(`docker: Error response from daemon: network ${net} not found.`);
			return 125;
		}
		const isReg = p.repo === "registry";
		const c = sim.addContainer({
			name: name || [
				"brave",
				"calm",
				"eager"
			][Math.floor(Math.random() * 3)] + "_" + PG.rnd(5),
			image,
			kind: isReg ? "registry" : "other",
			networks: [net],
			ports: mapped,
			restart
		});
		if (isReg) sim.registries[c.name] = {};
		const info = PG.CATALOG[p.repo] || {};
		if (!detach) {
			if (info.type === "tool" && cmdv.length) {
				const e = /echo\s+(.*)/.exec(cmdv.join(" "));
				if (e) ctx.println(e[1].replace(/^["']|["']$/g, ""));
			}
			c.status = "exited";
			if (rm) sim.containers.splice(sim.containers.indexOf(c), 1);
			return 0;
		}
		ctx.println(c.id + PG.hex(52));
		return 0;
	}
	if (sub === "rm") {
		for (const n of o.rest) {
			const c = find(n);
			if (!c) {
				ctx.eprintln(`Error response from daemon: No such container: ${n}`);
				return 1;
			}
			if (c.status === "running" && !o.flags.has("f")) {
				ctx.eprintln(`Error response from daemon: cannot remove container "/${c.name}": container is running: stop the container before removing or force remove`);
				return 1;
			}
			sim.containers.splice(sim.containers.indexOf(c), 1);
			delete sim.registries[c.name];
			ctx.println(n);
			sim.note("container " + n + " removed");
		}
		return 0;
	}
	if (sub === "stop" || sub === "kill") {
		for (const n of o.rest) {
			const c = find(n);
			if (!c) {
				ctx.eprintln(`Error response from daemon: No such container: ${n}`);
				return 1;
			}
			c.status = "exited";
			c.startedAt = sim.clock;
			ctx.println(n);
		}
		return 0;
	}
	if (sub === "start") {
		for (const n of o.rest) {
			const c = find(n);
			if (!c) {
				ctx.eprintln(`Error response from daemon: No such container: ${n}`);
				return 1;
			}
			const clash = c.ports.find((p) => sim.containers.some((x) => x !== c && x.status === "running" && x.ports.some((y) => y.host === p.host)));
			if (clash) {
				ctx.eprintln(`Error response from daemon: driver failed programming external connectivity: Bind for ${clash.hostIp}:${clash.host} failed: port is already allocated`);
				return 1;
			}
			c.status = "running";
			c.startedAt = sim.clock;
			ctx.println(n);
		}
		return 0;
	}
	if (sub === "restart") {
		for (const n of o.rest) {
			const c = find(n);
			if (!c) {
				ctx.eprintln(`Error response from daemon: No such container: ${n}`);
				return 1;
			}
			c.status = "running";
			c.startedAt = sim.clock;
			ctx.println(n);
		}
		return 0;
	}
	if (sub === "logs") {
		const c = find(o.rest[0] || "");
		if (!c) {
			ctx.eprintln("Error response from daemon: No such container");
			return 1;
		}
		ctx.println(c.kind === "registry" ? "time=\"2026-10-14T09:00:00Z\" level=info msg=\"listening on [::]:5000\"" : "(no logs in the simulation)");
		return 0;
	}
	if (sub === "network") {
		const [s2, ...r2] = rest;
		if (s2 === "ls") {
			ctx.println(PG.table(sim.networks.map((n) => [
				PG.hex(12),
				n,
				n === "host" ? "host" : n === "none" ? "null" : "bridge",
				"local"
			]), [
				"NETWORK ID",
				"NAME",
				"DRIVER",
				"SCOPE"
			]));
			return 0;
		}
		if (s2 === "create") {
			sim.ensureNetwork(r2[r2.length - 1]);
			ctx.println(PG.hex(64));
			return 0;
		}
		if (s2 === "connect") {
			const [net, cn] = r2.filter((a) => !a.startsWith("-"));
			if (!sim.networks.includes(net)) {
				ctx.eprintln(`Error response from daemon: network ${net} not found`);
				return 1;
			}
			const c = find(cn);
			if (!c) {
				ctx.eprintln(`Error response from daemon: No such container: ${cn}`);
				return 1;
			}
			if (c.networks.includes(net)) {
				ctx.eprintln(`Error response from daemon: endpoint with name ${c.name} already exists in network ${net}`);
				return 1;
			}
			c.networks.push(net);
			return 0;
		}
		ctx.eprintln("docker network: only ls, create, connect are simulated");
		return 1;
	}
	if (sub === "system") {
		if (rest[0] === "df") {
			const imgs = Object.keys(sim.images);
			const tot = imgs.reduce((a, k) => a + sim.images[k].size, 0);
			ctx.println(`TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE\nImages          ${imgs.length}         ${imgs.length}         ${tot}MB     0B (0%)\nContainers      ${sim.containers.length}         ${sim.containers.filter((c) => c.status === "running").length}         1.2GB     0B (0%)\nLocal Volumes   2         0         120MB     120MB (100%)`);
			return 0;
		}
		if (rest[0] === "prune") {
			ctx.println("Total reclaimed space: 0B");
			return 0;
		}
	}
	if (sub === "exec") {
		const cn = o.rest[0];
		const c = find(cn || "");
		const cmdv = rest.slice(rest.indexOf(cn) + 1);
		if (!c) {
			ctx.eprintln(`Error response from daemon: No such container: ${cn}`);
			return 1;
		}
		if (c.status !== "running") {
			ctx.eprintln(`Error response from daemon: container ${c.id}${PG.hex(52)} is not running`);
			return 1;
		}
		const cl = sim.clusters[c.clusterId];
		const node = cl && cl.nodes.find((n) => n.containerName === c.name);
		if (!node) {
			ctx.eprintln(`(exec in "${c.name}" is only simulated for kind/k3d node containers)`);
			return 1;
		}
		return PG.nodeExec(ctx, cl, node, cmdv);
	}
	ctx.eprintln(`docker: '${sub}' is not simulated in the playground (try: docker --help)`);
	return 1;
};
PG.nodeExec = (ctx, cl, node, argv) => {
	const [cmd, ...a] = argv;
	const fs = node.fs;
	if (cmd === "mkdir") {
		for (const p of a.filter((x) => !x.startsWith("-"))) fs[p + "/"] = true;
		return 0;
	}
	if (cmd === "cp" && a[0] === "/dev/stdin") {
		const dest = a[1];
		fs[dest] = ctx.stdin || "";
		const m = /\/etc\/containerd\/certs\.d\/([^/]+)\/hosts\.toml$/.exec(dest);
		if (m) {
			const h = /\[host\."([^"]+)"\]/.exec(ctx.stdin || "");
			if (h) node.mirror[m[1]] = h[1];
		}
		return 0;
	}
	if (cmd === "crictl") {
		if (a[0] === "images") {
			const rows = Object.keys(node.images).map((k) => {
				const m = /^(.*):([^:/]+)$/.exec(k);
				return [
					m[1],
					m[2],
					PG.hex(13),
					"40MB"
				];
			});
			ctx.println(PG.table(rows, [
				"IMAGE",
				"TAG",
				"IMAGE ID",
				"SIZE"
			]));
			return 0;
		}
		if (a[0] === "rmi") {
			if (a[1] === "--prune") {
				ctx.println("Deleted unused images (simulated)");
				return 0;
			}
			for (const img of a.slice(1)) {
				const key = Object.keys(node.images).find((k) => k === img || k === PG.normImage(img));
				if (!key) {
					ctx.eprintln(`E1014 rpc error: code = NotFound desc = failed to get image: ${img}`);
					return 1;
				}
				if (cl.res.pods.some((p) => p.spec.nodeName === node.name && !p.metadata.deletionTimestamp && p.spec.containers.some((c) => PG.normImage(c.image) === key))) {
					ctx.eprintln(`E1014 rpc error: code = Unknown desc = failed to delete image: image is in use by a running container`);
					return 1;
				}
				delete node.images[key];
				ctx.println("Deleted: " + key);
			}
			return 0;
		}
		if (a[0] === "ps") {
			const pods = cl.res.pods.filter((p) => p.spec.nodeName === node.name);
			ctx.println(PG.table(pods.map((p) => [
				PG.hex(13),
				p.spec.containers[0].image,
				"2 minutes ago",
				"Running",
				p.spec.containers[0].name,
				PG.hex(13),
				p.metadata.name
			]), [
				"CONTAINER",
				"IMAGE",
				"CREATED",
				"STATE",
				"NAME",
				"POD ID",
				"POD"
			]));
			return 0;
		}
	}
	if (cmd === "ls") {
		const p = (a.filter((x) => !x.startsWith("-"))[0] || "/").replace(/\/$/, "");
		if (p === "/etc/kubernetes/manifests" && node.role === "control-plane" && cl.tool === "kind") {
			ctx.println("etcd.yaml\nkube-apiserver.yaml\nkube-controller-manager.yaml\nkube-scheduler.yaml");
			return 0;
		}
		const kids = Object.keys(fs).filter((k) => k.startsWith(p + "/")).map((k) => k.slice(p.length + 1).split("/")[0]).filter(Boolean);
		if (kids.length || fs[p + "/"]) {
			ctx.println([...new Set(kids)].join("\n"));
			return 0;
		}
		ctx.eprintln(`ls: cannot access '${p}': No such file or directory`);
		return 2;
	}
	if (cmd === "cat") {
		const c = fs[a[0]];
		if (c === void 0) {
			ctx.eprintln(`cat: ${a[0]}: No such file or directory`);
			return 1;
		}
		ctx.out(c);
		return 0;
	}
	ctx.eprintln(`(node shell: only mkdir, cp /dev/stdin, ls, cat, crictl images|ps|rmi are simulated; got "${cmd}")`);
	return 1;
};
PG.commands.kind = async (ctx, args) => {
	const sim = ctx.sim;
	const sub = args[0];
	const sub2 = args[1];
	args.slice(1);
	const flag = (n, def) => {
		const i = args.indexOf(n);
		if (i >= 0) return args[i + 1];
		const e = args.find((a) => a.startsWith(n + "="));
		return e ? e.split("=")[1] : def;
	};
	const kinds = () => Object.values(sim.clusters).filter((c) => c.tool === "kind");
	if (!sub || sub === "--help" || sub === "help") {
		ctx.println(`kind creates and manages local Kubernetes clusters using Docker container 'nodes'
Usage:  kind [command]
  create cluster [--name N] [--config FILE]     delete cluster [--name N]
  get clusters | nodes [--name N] | kubeconfig [--name N] [--internal]
  load docker-image IMAGE [--name N] [--nodes a,b]      export kubeconfig [--name N]      version`);
		return 0;
	}
	if (sub === "version") {
		ctx.println("kind v0.33.0 go1.27.0 darwin/arm64");
		return 0;
	}
	if (sub === "get" && sub2 === "clusters") {
		const k = kinds();
		if (!k.length) {
			ctx.eprintln("No kind clusters found.");
			return 0;
		}
		ctx.println(k.map((c) => c.id).join("\n"));
		return 0;
	}
	if (sub === "get" && sub2 === "nodes") {
		const name = flag("--name", "kind");
		const cl = sim.clusters["kind-" + name];
		if (!cl) {
			ctx.eprintln(`No kind nodes found for cluster "${name}".`);
			return 0;
		}
		ctx.println(cl.nodes.map((n) => n.name).join("\n"));
		return 0;
	}
	if (sub === "get" && sub2 === "kubeconfig") {
		const name = flag("--name", "kind");
		const cl = sim.clusters["kind-" + name];
		if (!cl) {
			ctx.eprintln(`ERROR: unknown cluster "${name}"`);
			return 1;
		}
		const internal = args.includes("--internal");
		ctx.out(PG.yaml.dump({
			apiVersion: "v1",
			kind: "Config",
			clusters: [{
				name: "kind-" + name,
				cluster: {
					server: internal ? `https://${name}-control-plane:6443` : cl.api,
					"certificate-authority-data": "SIMULATED"
				}
			}],
			contexts: [{
				name: "kind-" + name,
				context: {
					cluster: "kind-" + name,
					user: "kind-" + name
				}
			}],
			"current-context": "kind-" + name,
			users: [{
				name: "kind-" + name,
				user: {
					"client-certificate-data": "SIMULATED",
					"client-key-data": "SIMULATED"
				}
			}]
		}));
		return 0;
	}
	if (sub === "export" && sub2 === "kubeconfig") {
		const name = flag("--name", "kind");
		const cl = sim.clusters["kind-" + name];
		if (!cl) {
			ctx.eprintln(`ERROR: unknown cluster "${name}"`);
			return 1;
		}
		sim.addKubeEntries(cl.entry, cl.api, { kind: "admin" });
		sim.kubeconfig.current = cl.entry;
		ctx.println(`Set kubectl context to "kind-${name}"`);
		return 0;
	}
	if (sub === "create" && sub2 === "cluster") {
		let cfg = { nodes: [{ role: "control-plane" }] };
		const cf = flag("--config");
		let name = flag("--name");
		if (cf) {
			const txt = ctx.fs.read(ctx.resolve(cf));
			if (txt === void 0) {
				ctx.eprintln(`ERROR: failed to create cluster: failed to read configuration: open ${cf}: no such file or directory`);
				return 1;
			}
			let y;
			try {
				y = PG.yaml.parse(txt);
			} catch (e) {
				y = null;
			}
			if (!y || y.kind !== "Cluster") {
				ctx.eprintln(`ERROR: failed to create cluster: unable to decode config from "${cf}": kind must be "Cluster"`);
				return 1;
			}
			cfg = {
				...y,
				nodes: y.nodes && y.nodes.length ? y.nodes : [{ role: "control-plane" }]
			};
			if (!name && y.name) name = y.name;
		}
		name = name || "kind";
		if (sim.clusters["kind-" + name]) {
			ctx.eprintln(`ERROR: failed to create cluster: node(s) already exist for a cluster with the name "${name}"`);
			return 1;
		}
		ctx.println(`Creating cluster "${name}" ...`);
		const nn = cfg.nodes.length;
		const steps = [
			` ✓ Ensuring node image (kindest/node:v1.35.0) 🖼`,
			` ✓ Preparing nodes ${Array.from("📦".repeat(nn)).join(" ")}`,
			` ✓ Writing configuration 📜`,
			` ✓ Starting control-plane 🕹️`,
			` ✓ Installing CNI 🔌`,
			` ✓ Installing StorageClass 💾`
		];
		if (cfg.nodes.some((n) => n.role === "worker")) steps.push(` ✓ Joining worker nodes 🚜`);
		for (const s of steps) {
			await ctx.delay(450);
			ctx.println(s);
		}
		PG.makeKindCluster(sim, {
			...cfg,
			name
		});
		PG.fastForward(sim, 45);
		ctx.println(`Set kubectl context to "kind-${name}"\nYou can now use your cluster with:\n\nkubectl cluster-info --context kind-${name}\n\nHave a nice day! 👋`);
		return 0;
	}
	if (sub === "delete" && sub2 === "cluster") {
		const name = flag("--name", "kind");
		ctx.println(`Deleting cluster "${name}" ...`);
		const cl = sim.clusters["kind-" + name];
		if (!cl) {
			const o = Object.values(sim.clusters).find((c) => c.entry === name || c.id === name);
			if (o) ctx.info(`("${name}" is not a kind cluster, it is ${o.tool.toUpperCase()}. Delete it with: ${PG.deleteCommandFor(o)})`);
			return 0;
		}
		const names = sim.containers.filter((c) => c.clusterId === cl.entry).map((c) => c.name);
		sim.containers = sim.containers.filter((c) => c.clusterId !== cl.entry);
		delete sim.clusters[cl.entry];
		sim.removeKubeEntries(cl.entry);
		sim.forwards = sim.forwards.filter((f) => f.cluster !== cl);
		ctx.println(`Deleted nodes: [${names.map((n) => "\"" + n + "\"").join(" ")}]`);
		return 0;
	}
	if (sub === "load" && sub2 === "docker-image") {
		const name = flag("--name", "kind");
		const cl = sim.clusters["kind-" + name];
		if (!cl) {
			ctx.eprintln(`ERROR: no nodes found for cluster "${name}"`);
			return 1;
		}
		const imgs = args.slice(2).filter((a, i, arr) => !a.startsWith("--") && arr[i - 1] !== "--name" && arr[i - 1] !== "--nodes");
		const only = flag("--nodes");
		for (const im of imgs) {
			const p = PG.parseImage(im);
			const key = sim.images[im] ? im : p.repo + ":" + p.tag;
			if (!sim.images[key]) {
				ctx.eprintln(`ERROR: image: "${im}" not present locally`);
				return 1;
			}
			for (const n of cl.nodes) {
				if (only && !only.split(",").includes(n.name)) continue;
				ctx.println(`Image: "${im}" with ID "sha256:${sim.images[key].id}${PG.hex(52)}" not yet present on node "${n.name}", loading...`);
				await ctx.delay(150);
				n.images[PG.normImage(im)] = true;
			}
		}
		return 0;
	}
	ctx.eprintln(`kind: "${args.join(" ")}" is not simulated. Try: kind --help`);
	return 1;
};
PG.commands.k3d = async (ctx, args) => {
	const sim = ctx.sim;
	const [a, b] = args;
	const rest = args.slice(2);
	const k3ds = () => Object.values(sim.clusters).filter((c) => c.tool === "k3d");
	const getCl = (n) => sim.clusters["k3d-" + n];
	if (!a || a === "--help" || a === "help") {
		ctx.println(`k3d is a wrapper around k3s: Kubernetes in Docker with batteries.
  cluster create NAME [--servers N] [--agents N] [--port "8080:80@loadbalancer"] [--registry-create NAME:HOST:PORT]
  cluster list | stop NAME | start NAME | delete NAME
  node create NAME --cluster C [--role agent] | node list | node delete NAME
  image import IMAGE -c CLUSTER      registry list      kubeconfig get NAME      version`);
		return 0;
	}
	if (a === "version") {
		ctx.println("k3d version v5.8.3\nk3s version v1.33.4-k3s1 (default)");
		return 0;
	}
	if (a === "cluster" && b === "create") {
		PG.opts(rest);
		const name = rest.find((x) => !x.startsWith("-") && rest[rest.indexOf(x) - 1] !== "--servers" && rest[rest.indexOf(x) - 1] !== "--agents" && rest[rest.indexOf(x) - 1] !== "--port" && rest[rest.indexOf(x) - 1] !== "-p" && rest[rest.indexOf(x) - 1] !== "--registry-create" && rest[rest.indexOf(x) - 1] !== "--k3s-arg") || "k3s-default";
		const f = (n) => {
			const i = rest.indexOf(n);
			return i >= 0 ? rest[i + 1] : (rest.find((x) => x.startsWith(n + "=")) || "").split("=")[1];
		};
		if (getCl(name)) {
			ctx.eprintln(`FATA[0000] Failed to create cluster '${name}' because a cluster with that name already exists`);
			return 1;
		}
		const ports = [];
		rest.forEach((x, i) => {
			if ((x === "--port" || x === "-p") && rest[i + 1]) {
				const m = /^(?:[\d.]+:)?(\d+):(\d+)@(.+)$/.exec(rest[i + 1]);
				if (m) ports.push({
					host: Number(m[1]),
					container: Number(m[2]),
					target: m[3]
				});
			}
		});
		let registry = null;
		const rc = f("--registry-create");
		if (rc) {
			const p = rc.split(":");
			registry = {
				name: p[0],
				host: p.length > 2 ? p[1] : "0.0.0.0",
				port: Number(p[p.length - 1]) || 5e3
			};
			if (sim.container("k3d-" + registry.name)) {
				ctx.eprintln(`FATA[0000] Failed to create registry: container 'k3d-${registry.name}' already exists`);
				return 1;
			}
		}
		const clash = ports.find((p) => sim.containers.some((c) => c.status === "running" && c.ports.some((x) => x.host === p.host)));
		if (clash) {
			ctx.eprintln(`FATA[0000] Failed to create cluster: port ${clash.host} is already allocated`);
			return 1;
		}
		const lines = [
			`INFO[0000] Prep: Network`,
			`INFO[0000] Created network 'k3d-${name}'`,
			`INFO[0000] Created image volume k3d-${name}-images`
		];
		if (registry) lines.push(`INFO[0000] Creating node 'k3d-${registry.name}'`, `INFO[0001] Successfully created registry 'k3d-${registry.name}'`);
		lines.push(`INFO[0001] Creating node 'k3d-${name}-server-0'`);
		for (let i = 0; i < (Number(f("--agents")) || 0); i++) lines.push(`INFO[0002] Creating node 'k3d-${name}-agent-${i}'`);
		lines.push(`INFO[0003] Creating LoadBalancer 'k3d-${name}-serverlb'`, `INFO[0008] Starting new tools node...`, `INFO[0012] Cluster '${name}' created successfully!`);
		for (const l of lines) {
			await ctx.delay(220);
			ctx.println(l);
		}
		PG.makeK3dCluster(sim, {
			name,
			servers: Number(f("--servers")) || 1,
			agents: Number(f("--agents")) || 0,
			ports,
			registry
		});
		PG.fastForward(sim, 30);
		ctx.println(`INFO[0013] You can now use it like this:\nkubectl cluster-info`);
		ctx.println(`INFO[0013] Updated kubeconfig; current context: k3d-${name}`);
		return 0;
	}
	if (a === "cluster" && b === "list") {
		const l = k3ds();
		ctx.println(PG.table(l.map((c) => {
			const run = sim.containers.filter((x) => x.clusterId === c.entry).filter((x) => x.status === "running" && x.kind === "node");
			const s = c.nodes.filter((n) => n.role === "control-plane").length, ag = c.nodes.length - s;
			return [
				c.id,
				`${run.filter((x) => /server/.test(x.name)).length}/${s}`,
				`${run.filter((x) => /agent|k3d-.*-0$/.test(x.name) && !/server/.test(x.name)).length}/${ag}`,
				"true"
			];
		}), [
			"NAME",
			"SERVERS",
			"AGENTS",
			"LOADBALANCER"
		]));
		return 0;
	}
	if (a === "cluster" && (b === "stop" || b === "start")) {
		const cl = getCl(rest[0]);
		if (!cl) {
			ctx.eprintln(`FATA[0000] No nodes found for given cluster`);
			return 1;
		}
		for (const c of sim.containers.filter((x) => x.clusterId === cl.entry)) {
			c.status = b === "stop" ? "exited" : "running";
			c.startedAt = sim.clock;
		}
		ctx.println(`INFO[0000] ${b === "stop" ? "Stopping" : "Starting"} cluster '${rest[0]}'`);
		if (b === "start") PG.fastForward(sim, 15);
		return 0;
	}
	if (a === "cluster" && b === "delete") {
		const cl = getCl(rest[0]);
		if (!cl) {
			ctx.eprintln(`FATA[0000] No nodes found for given cluster`);
			return 1;
		}
		sim.containers = sim.containers.filter((c) => c.clusterId !== cl.entry);
		delete sim.clusters[cl.entry];
		sim.removeKubeEntries(cl.entry);
		sim.forwards = sim.forwards.filter((f) => f.cluster !== cl);
		ctx.println(`INFO[0000] Deleting cluster '${rest[0]}'\nINFO[0002] Deleted k3d-${rest[0]}-serverlb\nINFO[0003] Removing cluster details from default kubeconfig...\nINFO[0003] Successfully deleted cluster ${rest[0]}!`);
		return 0;
	}
	if (a === "node" && b === "list") {
		const rows = [];
		for (const c of k3ds()) for (const x of sim.containers.filter((y) => y.clusterId === c.entry)) rows.push([
			x.name,
			x.kind === "lb" ? "loadbalancer" : /server/.test(x.name) ? "server" : "agent",
			c.id,
			x.status === "running" ? "running" : "exited"
		]);
		for (const x of sim.containers.filter((y) => y.kind === "registry" && y.name.startsWith("k3d-"))) rows.push([
			x.name,
			"registry",
			"",
			x.status === "running" ? "running" : "exited"
		]);
		ctx.println(PG.table(rows, [
			"NAME",
			"ROLE",
			"CLUSTER",
			"STATUS"
		]));
		return 0;
	}
	if (a === "node" && b === "create") {
		PG.opts(rest);
		const cn = rest[rest.indexOf("--cluster") + 1] || rest[rest.indexOf("-c") + 1];
		const cl = getCl(cn);
		if (!cl) {
			ctx.eprintln(`FATA[0000] Failed to create node: cluster '${cn}' not found`);
			return 1;
		}
		const nm = rest.find((x) => !x.startsWith("-") && x !== cn && !["agent", "server"].includes(x));
		const role = rest[rest.indexOf("--role") + 1] || "agent";
		let i = 0;
		while (sim.container(`k3d-${nm}-${i}`)) i++;
		const full = `k3d-${nm}-${i}`;
		ctx.println(`INFO[0000] Adding 1 node(s) to the runtime local cluster '${cn}'...\nINFO[0000] Using the k3d-tools node to gather environment information\nINFO[0001] Starting new tools node...\nINFO[0003] Starting node '${full}'`);
		const ip = "172.19.0." + (cl.nodes.length + 10);
		sim.addContainer({
			name: full,
			image: "rancher/k3s:v1.33.4-k3s1",
			kind: "node",
			clusterId: cl.entry,
			networks: ["k3d-" + cn],
			ip
		});
		cl.addNode({
			name: full,
			role: role === "server" ? "control-plane" : "worker",
			containerName: full,
			ip,
			version: "v1.33.4+k3s1",
			osImage: "K3s v1.33.4+k3s1",
			runtime: "containerd://2.0.5-k3s2"
		});
		PG.fastForward(sim, 8);
		ctx.println(`INFO[0006] Successfully created 1 node(s)!`);
		return 0;
	}
	if (a === "node" && b === "delete") {
		for (const nm of rest.filter((x) => !x.startsWith("-"))) {
			const c = sim.container(nm);
			if (!c) {
				ctx.eprintln(`FATA[0000] No node '${nm}' found`);
				return 1;
			}
			const cl = sim.clusters[c.clusterId];
			sim.containers.splice(sim.containers.indexOf(c), 1);
			if (cl) {
				const n = cl.nodes.find((x) => x.containerName === nm);
				if (n) cl.nodes.splice(cl.nodes.indexOf(n), 1);
			}
			ctx.println(`INFO[0000] Deleted node '${nm}'`);
		}
		return 0;
	}
	if (a === "image" && b === "import") {
		const cn = rest[rest.indexOf("-c") + 1] || rest[rest.indexOf("--cluster") + 1];
		const cl = getCl(cn);
		if (!cl) {
			ctx.eprintln(`FATA[0000] No clusters found (use -c <cluster>)`);
			return 1;
		}
		const im = rest.find((x) => !x.startsWith("-") && x !== cn);
		const p = PG.parseImage(im);
		const key = sim.images[im] ? im : p.repo + ":" + p.tag;
		if (!sim.images[key]) {
			ctx.eprintln(`FATA[0000] Image '${im}' not found locally`);
			return 1;
		}
		ctx.println(`INFO[0000] Importing image(s) into cluster '${cn}'`);
		for (const n of cl.nodes) n.images[PG.normImage(im)] = true;
		ctx.println(`INFO[0002] Successfully imported 1 image(s) into 1 cluster(s)`);
		return 0;
	}
	if (a === "registry" && b === "list") {
		ctx.println(PG.table(sim.containers.filter((c) => c.kind === "registry" && c.name.startsWith("k3d-")).map((c) => [
			c.name,
			"registry",
			c.status === "running" ? "running" : "exited"
		]), [
			"NAME",
			"ROLE",
			"CLUSTER"
		]));
		return 0;
	}
	if (a === "registry" && b === "delete") {
		for (const n of rest.filter((x) => !x.startsWith("-"))) {
			const c = sim.container(n);
			if (c) sim.containers.splice(sim.containers.indexOf(c), 1);
			ctx.println(`INFO[0000] Deleted registry ${n}`);
		}
		return 0;
	}
	if (a === "kubeconfig") {
		ctx.println(`INFO[0000] Updated kubeconfig (simulated)`);
		return 0;
	}
	ctx.eprintln(`k3d: "${args.join(" ")}" is not simulated. Try: k3d --help`);
	return 1;
};
PG.BASE_FS = {
	nginx: {
		"/usr/share/nginx/html/index.html": "NGINX_PAGE",
		"/usr/share/nginx/html/50x.html": "<html><body><h1>An error occurred.</h1></body></html>\n",
		"/etc/nginx/nginx.conf": "user  nginx;\nworker_processes  auto;\nevents { worker_connections  1024; }\nhttp { include /etc/nginx/mime.types; include /etc/nginx/conf.d/*.conf; }\n",
		"/etc/nginx/conf.d/default.conf": "server {\n    listen       80;\n    server_name  localhost;\n    location / {\n        root   /usr/share/nginx/html;\n        index  index.html index.htm;\n    }\n}\n"
	},
	httpd: {
		"/usr/local/apache2/htdocs/index.html": "<html><body><h1>It works!</h1></body></html>\n",
		"/usr/local/apache2/conf/httpd.conf": "ServerRoot \"/usr/local/apache2\"\nListen 80\n"
	},
	caddy: {
		"/usr/share/caddy/index.html": "<!DOCTYPE html><title>Caddy works!</title>\n",
		"/etc/caddy/Caddyfile": ":80 {\n	root * /usr/share/caddy\n	file_server\n}\n"
	},
	redis: {
		"/data/": "",
		"/usr/local/bin/redis-server": "#!/bin/sh\n"
	},
	postgres: { "/var/lib/postgresql/data/": "" }
};
PG.WEBROOT = {
	nginx: "/usr/share/nginx/html/index.html",
	httpd: "/usr/local/apache2/htdocs/index.html",
	caddy: "/usr/share/caddy/index.html"
};
PG.parseDockerfile = (text) => {
	const lines = text.replace(/\r/g, "").split("\n");
	const out = [];
	let i = 0;
	while (i < lines.length) {
		let l = lines[i++];
		if (/^\s*(#|$)/.test(l)) continue;
		while (/\\\s*$/.test(l) && i < lines.length) l = l.replace(/\\\s*$/, " ") + lines[i++].replace(/^\s*#.*$/, "");
		const m = /^\s*([A-Za-z]+)\s*(.*)$/.exec(l);
		if (m) out.push({
			cmd: m[1].toUpperCase(),
			args: m[2].trim(),
			line: i
		});
	}
	return out;
};
PG.argvOf = (a) => {
	a = a.trim();
	if (a[0] === "[") try {
		return JSON.parse(a);
	} catch (e) {}
	return [
		"/bin/sh",
		"-c",
		a
	];
};
PG.classifyArgv = (argv) => {
	if (!argv || !argv.length) return null;
	let a = [...argv];
	if ((a[0] === "/bin/sh" || a[0] === "sh" || a[0] === "bash") && a[1] === "-c") a = PG.lex(a[2] || "").filter((t) => t.t === "word").map((t) => t.parts.map((p) => p.v).join(""));
	const j = a.join(" ");
	if (/\bsleep\s+(infinity|\d{3,})/.test(j) || /\btail\s+-f\b/.test(j) || /\bnginx\b/.test(j) || /\bhttpd\b|\bapache2/.test(j) || /\bredis-server\b|\bpostgres\b|\bmysqld\b|\bmongod\b|\bcaddy\b/.test(j) || /\b(python3?|node|java|ruby|php|go|dotnet|uvicorn|gunicorn|flask|npm|yarn|deno|bun)\b/.test(j) || /^\.?\/\S+/.test(a[0])) return {
		long: true,
		out: ""
	};
	const m = /^echo\s+(.*)$/.exec(j);
	if (/^(echo|true|false|exit|ls|cat|printf|date|hostname|env|pwd|whoami|id|uname)\b/.test(j) || /^sleep\s+\d{1,2}$/.test(j)) return {
		long: false,
		out: m ? m[1].replace(/^["']|["']$/g, "") : ""
	};
	return {
		long: true,
		out: ""
	};
};
PG.buildImage = async (ctx, dfText, contextDir, buildArgs) => {
	const sim = ctx.sim;
	const ins = PG.parseDockerfile(dfText);
	const log = [];
	const stages = [];
	let cur = null;
	const total = ins.filter((x) => [
		"FROM",
		"COPY",
		"ADD",
		"RUN",
		"WORKDIR"
	].includes(x.cmd)).length;
	if (!ins.some((x) => x.cmd === "FROM")) return { err: "ERROR: failed to solve: dockerfile parse error: file with no instructions" };
	let step = 0;
	const args = { ...buildArgs };
	const subst = (s) => s.replace(/\$\{(\w+)\}|\$(\w+)/g, (m, a, b) => {
		const k = a || b;
		return cur && cur.meta.env[k] !== void 0 ? cur.meta.env[k] : args[k] !== void 0 ? args[k] : "";
	});
	const note = (label, ms) => log.push(` => ${label.length > 70 ? label.slice(0, 67) + "..." : label}`.padEnd(78) + (ms === void 0 ? "0.0" : ms.toFixed(1)) + "s");
	const mkFs = (meta) => {
		const fs = new PG.FS();
		fs.files = { ...meta.fs };
		fs.dirs = /* @__PURE__ */ new Set(["/", ...meta.dirs || []]);
		for (const f of Object.keys(meta.fs)) {
			let d = f.slice(0, f.lastIndexOf("/"));
			while (d) {
				fs.dirs.add(d);
				d = d.slice(0, d.lastIndexOf("/"));
			}
		}
		return fs;
	};
	const save = (meta, fs) => {
		meta.fs = fs.files;
		meta.dirs = [...fs.dirs];
	};
	for (const x of ins) {
		const a = subst(x.args);
		if (x.cmd === "ARG") {
			const m = /^(\w+)(?:=(.*))?$/.exec(a.trim());
			if (m && args[m[1]] === void 0 && m[2] !== void 0) args[m[1]] = m[2].replace(/^["']|["']$/g, "");
			continue;
		}
		if (x.cmd === "FROM") {
			const m = /^(\S+)(?:\s+AS\s+(\S+))?$/i.exec(a.trim());
			if (!m) return { err: `ERROR: failed to solve: dockerfile parse error on line ${x.line}: FROM requires either one or three arguments` };
			step++;
			const prev = stages.find((s) => s.name === m[1]);
			let meta;
			if (prev) meta = JSON.parse(JSON.stringify(prev.meta));
			else if (m[1] === "scratch") meta = {
				base: null,
				env: {},
				fs: {},
				dirs: []
			};
			else {
				const p = PG.parseImage(m[1]);
				const key = p.host ? m[1] : p.repo + ":" + p.tag;
				const local = sim.images[key];
				if (local && local.meta) meta = JSON.parse(JSON.stringify(local.meta));
				else if (PG.CATALOG[p.repo] && !p.host) {
					const bf = {};
					for (const [f, c] of Object.entries(PG.BASE_FS[p.repo] || {})) bf[f] = c === "NGINX_PAGE" ? PG.CATALOG.nginx.page : c;
					meta = {
						base: p.repo,
						env: {},
						fs: bf,
						dirs: []
					};
				} else if (local) meta = {
					base: null,
					env: {},
					fs: {},
					dirs: []
				};
				else return { err: `ERROR: failed to solve: ${m[1]}: failed to resolve source metadata for docker.io/${p.repo.includes("/") ? p.repo : "library/" + p.repo}:${p.tag}: pull access denied, repository does not exist or may require authorization` };
			}
			cur = {
				name: m[2] || null,
				meta,
				ref: m[1]
			};
			stages.push(cur);
			note(`[internal] load metadata for docker.io/library/${m[1]}`, .6);
			note(`[${step}/${total}] FROM docker.io/library/${m[1]}`, .1);
			continue;
		}
		if (!cur) return { err: `ERROR: failed to solve: dockerfile parse error on line ${x.line}: no build stage in current context` };
		const meta = cur.meta;
		if (x.cmd === "ENV") {
			const kv = a.match(/(\w+)=("[^"]*"|'[^']*'|\S+)/g);
			if (kv) for (const p of kv) {
				const i = p.indexOf("=");
				meta.env[p.slice(0, i)] = p.slice(i + 1).replace(/^["']|["']$/g, "");
			}
			else {
				const m = /^(\w+)\s+(.*)$/.exec(a);
				if (m) meta.env[m[1]] = m[2];
			}
		} else if (x.cmd === "EXPOSE") {
			const m = /(\d+)/.exec(a);
			if (m && !meta.port) meta.port = Number(m[1]);
			else if (m) meta.port = meta.port || Number(m[1]);
		} else if (x.cmd === "WORKDIR") {
			step++;
			meta.workdir = a.startsWith("/") ? a : (meta.workdir || "/").replace(/\/$/, "") + "/" + a;
			const fs = mkFs(meta);
			fs.mkdirp(meta.workdir, true);
			save(meta, fs);
			note(`[${step}/${total}] WORKDIR ${meta.workdir}`);
		} else if (x.cmd === "CMD") meta.cmd = PG.argvOf(a);
		else if (x.cmd === "ENTRYPOINT") meta.entrypoint = PG.argvOf(a);
		else if (x.cmd === "USER") meta.user = a;
		else if (x.cmd === "LABEL") meta.labels = {
			...meta.labels || {},
			...Object.fromEntries((a.match(/(\S+)=("[^"]*"|\S+)/g) || []).map((p) => {
				const i = p.indexOf("=");
				return [p.slice(0, i), p.slice(i + 1).replace(/^"|"$/g, "")];
			}))
		};
		else if (x.cmd === "COPY" || x.cmd === "ADD") {
			step++;
			let from = null;
			let rest = a;
			const fm = /^--from=(\S+)\s+/.exec(rest);
			if (fm) {
				from = fm[1];
				rest = rest.slice(fm[0].length);
			}
			rest = rest.replace(/^--\w+=\S+\s+/g, "");
			const parts = rest.startsWith("[") ? JSON.parse(rest) : rest.split(/\s+/).filter(Boolean);
			const dest = parts.pop();
			const srcs = parts;
			if (!srcs.length) return { err: `ERROR: failed to solve: dockerfile parse error on line ${x.line}: COPY requires at least two arguments` };
			const destAbs = ctx.fs.norm(dest.startsWith("/") ? dest : (meta.workdir || "/").replace(/\/$/, "") + "/" + dest, "/") + (dest.endsWith("/") ? "/" : "");
			const fs = mkFs(meta);
			const destIsDir = dest.endsWith("/") || srcs.length > 1 || dest === ".";
			let srcFiles;
			if (from) {
				const sg = stages.find((s) => s.name === from || String(stages.indexOf(s)) === from);
				if (!sg) return { err: `ERROR: failed to solve: failed to resolve source "${from}"` };
				srcFiles = sg.meta.fs;
			}
			for (const s of srcs) {
				let copied = 0;
				if (from) {
					const sp = s.startsWith("/") ? s : "/" + s;
					for (const [f, c] of Object.entries(srcFiles)) if (f === sp || f.startsWith(sp.replace(/\/$/, "") + "/")) {
						const t = f === sp && !destIsDir ? destAbs : destAbs.replace(/\/$/, "") + "/" + (f === sp ? f.split("/").pop() : f.slice(sp.replace(/\/$/, "").length + 1));
						fs.write(t, c);
						copied++;
					}
				} else {
					const p = ctx.fs.norm(s === "." ? "." : s, contextDir);
					if (ctx.fs.isDir(p)) for (const f of Object.keys(ctx.fs.files).filter((f) => f.startsWith(p.replace(/\/$/, "") + "/"))) {
						fs.write(destAbs.replace(/\/$/, "") + "/" + f.slice(p.replace(/\/$/, "").length + 1), ctx.fs.read(f));
						copied++;
					}
					else if (ctx.fs.read(p) !== void 0) {
						fs.write(destIsDir ? destAbs.replace(/\/$/, "") + "/" + p.split("/").pop() : destAbs, ctx.fs.read(p));
						copied++;
					}
				}
				if (!copied) return { err: `ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref: "/${s.replace(/^\//, "")}": not found` };
			}
			save(meta, fs);
			note(`[${step}/${total}] ${x.cmd} ${rest.slice(0, 60)}`);
		} else if (x.cmd === "RUN") {
			step++;
			const fs = mkFs(meta);
			const sh2 = new PG.Shell(sim, {
				print() {},
				clear() {}
			});
			sh2.fsOverride = fs;
			sh2.lenient = true;
			sh2.cwd = meta.workdir || "/";
			sh2.env.HOME = "/root";
			fs.mkdirp(sh2.cwd, true);
			const cmdline = a.startsWith("[") ? PG.argvOf(a).join(" ") : a;
			try {
				await sh2.runScript(cmdline, { write() {} });
			} catch (e) {
				if (e && e.abort) throw e;
			}
			save(meta, fs);
			note(`[${step}/${total}] RUN ${cmdline}`, .3);
		}
	}
	const meta = stages[stages.length - 1].meta;
	let size = ((PG.CATALOG[meta.base] || { size: 5 }).size || 5) + Object.values(meta.fs).reduce((n, c) => n + (c ? c.length : 0), 0) / 1e6;
	size = Math.max(1, Math.round(size));
	return {
		log,
		image: {
			id: PG.hex(12),
			size,
			created: sim.clock,
			meta
		}
	};
};
PG.podImageInfo = (cl, pod, cname) => {
	const c = cname ? pod.spec.containers.find((x) => x.name === cname) || pod.spec.containers[0] : pod.spec.containers[0];
	return PG.imageInfo(cl ? cl.sim : PG.simRef, c.image) || {};
};
PG.containerOf = (pod, cname) => cname && [
	...pod.spec.initContainers || [],
	...pod.spec.containers,
	...pod.spec.ephemeralContainers || []
].find((c) => c.name === cname) || pod.spec.containers[0];
PG.podFS = (cl, pod, cname) => {
	const sm = pod._sim;
	const c0 = PG.containerOf(pod, cname);
	sm.fsObjs = sm.fsObjs || {};
	const key = c0.name;
	sm.fsObj = sm.fsObjs[key];
	const info = PG.imageInfo(cl ? cl.sim : PG.simRef, c0.image) || {};
	const isAlpine = /alpine|busybox/.test(c0.image);
	if (!sm.fsObj) {
		const fs = sm.fsObj = sm.fsObjs[key] = new PG.FS();
		fs.dirs = /* @__PURE__ */ new Set(["/"]);
		for (const d of [
			"/bin",
			"/usr/bin",
			"/usr/local/bin",
			"/usr/share",
			"/etc",
			"/var/log",
			"/var/run",
			"/tmp",
			"/root",
			"/home",
			"/proc",
			"/sys",
			"/dev",
			"/lib",
			"/opt",
			"/var/lib"
		]) fs.dirs.add(d);
		const base = PG.BASE_FS[PG.parseImage(c0.image).repo || ""] || {};
		for (const [f, c] of Object.entries(base)) fs.write(f, c === "NGINX_PAGE" ? PG.CATALOG.nginx.page : c);
		if (info.fs) for (const [f, c] of Object.entries(info.fs)) fs.write(f, c);
		fs.write("/etc/os-release", isAlpine ? "NAME=\"Alpine Linux\"\nID=alpine\nVERSION_ID=3.20.3\nPRETTY_NAME=\"Alpine Linux v3.20\"\n" : "PRETTY_NAME=\"Debian GNU/Linux 12 (bookworm)\"\nNAME=\"Debian GNU/Linux\"\nVERSION_ID=\"12\"\nID=debian\n");
		fs.write("/etc/passwd", "root:x:0:0:root:/root:/bin/sh\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n");
		fs.write("/etc/group", "root:x:0:\n");
		fs.write("/proc/version", "Linux version 6.12.13-linuxkit (root@buildkitsandbox) #1 SMP\n");
		fs.write("/proc/cpuinfo", "processor	: 0\nmodel name	: ARMv8 Processor rev 0 (v8l)\n");
		fs.write("/proc/meminfo", "MemTotal:       11975508 kB\nMemFree:         6012340 kB\nMemAvailable:    8723412 kB\n");
	}
	const fs = sm.fsObj;
	const ns = pod.metadata.namespace;
	if (pod._registry && PG.simRef) {
		const data = PG.simRef.registries[pod._registry] || {};
		for (const k of Object.keys(data)) {
			const [repo, tag] = k.split(":");
			fs.write(`/var/lib/registry/docker/registry/v2/repositories/${repo}/_manifests/tags/${tag}/current/link`, "sha256:" + PG.hash(k, 64));
		}
	}
	fs.write("/etc/hostname", pod.metadata.name + "\n");
	fs.write("/etc/hosts", `# Kubernetes-managed hosts file.\n127.0.0.1\tlocalhost\n::1\tlocalhost ip6-localhost ip6-loopback\n${pod.status.podIP || "10.244.0.2"}\t${pod.metadata.name}\n`);
	fs.write("/etc/resolv.conf", `search ${ns}.svc.cluster.local svc.cluster.local cluster.local\nnameserver 10.96.0.10\noptions ndots:5\n`);
	const argv = [...c0.command || [], ...c0.args || []];
	fs.write("/proc/1/cmdline", (argv.length ? argv : info.cmdArgv || [PG.parseImage(c0.image).repo.split("/").pop()]).join(" ") + "\n");
	if (pod.spec.automountServiceAccountToken !== false) {
		const d = "/var/run/secrets/kubernetes.io/serviceaccount";
		fs.write(d + "/namespace", ns);
		fs.write(d + "/token", "eyJhbGciOiJSUzI1NiIsImtpZCI6Ii" + PG.hash(pod.metadata.uid, 40) + "." + PG.hash(ns, 30));
		fs.write(d + "/ca.crt", "-----BEGIN CERTIFICATE-----\nSIMULATED\n-----END CERTIFICATE-----\n");
	}
	if (info.type === "web" && info.port === 80 && /nginx/.test(c0.image + (info.built ? "nginx" : ""))) {
		fs.write("/var/log/nginx/access.log", sm.logs.filter((l) => /"(GET|POST|HEAD)/.test(l)).join("\n") + "\n");
		fs.write("/var/log/nginx/error.log", sm.logs.filter((l) => /\[(notice|error)\]/.test(l)).join("\n") + "\n");
	}
	sm.vols = sm.vols || {};
	if (cl || pod._docker) for (const m of c0.volumeMounts || []) {
		const v = (pod.spec.volumes || []).find((x) => x.name === m.name);
		if (!v) continue;
		const mp = m.mountPath.replace(/\/$/, "");
		if (pod._docker && sm.vols[m.name] && sm.vols[m.name].__bind) {
			const bd = sm.vols[m.name].__bind.replace(/\/$/, "");
			const vfs = PG.simRef.fs;
			fs.mkdirp(mp, true);
			for (const f of Object.keys(vfs.files)) if (f.startsWith(bd + "/")) fs.write(mp + "/" + f.slice(bd.length + 1), vfs.files[f]);
			continue;
		}
		if (v.configMap) {
			const cm = cl.find("configmaps", v.configMap.name, ns);
			if (cm) {
				if (m.subPath) fs.write(mp, (cm.data || {})[m.subPath] || "");
				else {
					fs.mkdirp(mp, true);
					for (const [k, val] of Object.entries(cm.data || {})) fs.write(mp + "/" + k, val);
				}
			}
		} else if (v.secret) {
			const s = cl.find("secrets", v.secret.secretName, ns);
			if (s) {
				fs.mkdirp(mp, true);
				for (const [k, val] of Object.entries(s.data || {})) fs.write(mp + "/" + k, PG.unb64(val));
				for (const [k, val] of Object.entries(s.stringData || {})) fs.write(mp + "/" + k, String(val));
			}
		} else {
			fs.mkdirp(mp, true);
			const store = sm.vols[m.name];
			if (store) {
				for (const [rel, val] of Object.entries(store)) if (rel !== "__bind") fs.write(mp + "/" + rel, val);
			}
		}
	}
	return fs;
};
PG.syncVols = (cl, pod, cname) => {
	const sm = pod._sim;
	const c = PG.containerOf(pod, cname);
	const fs = sm.fsObjs && sm.fsObjs[c.name];
	if (!fs) return;
	sm.vols = sm.vols || {};
	for (const m of c.volumeMounts || []) {
		const v = (pod.spec.volumes || []).find((x) => x.name === m.name);
		if (!v || v.configMap || v.secret) continue;
		const mp = m.mountPath.replace(/\/$/, "");
		const store = {};
		for (const [f, val] of Object.entries(fs.files)) if (f.startsWith(mp + "/")) store[f.slice(mp.length + 1)] = val;
		sm.vols[m.name] = store;
	}
};
PG.podProcs = (cl, pod, withShell, cname) => {
	let c0 = PG.containerOf(pod, cname);
	if (c0.targetContainerName) c0 = PG.containerOf(pod, c0.targetContainerName);
	const info = PG.imageInfo(cl ? cl.sim : PG.simRef, c0.image) || {};
	const repo = PG.parseImage(c0.image).repo;
	const argv = [...c0.command || [], ...c0.args || []];
	const P = [];
	const add = (user, cmd, ppid = 0, mem = 6e3) => P.push({
		pid: P.length ? P[P.length - 1].pid + (cmd.startsWith("nginx: worker") ? 1 : 7 + P.length) : 1,
		user,
		cmd,
		ppid,
		rss: mem
	});
	const base = info.built ? PG.parseImage(c0.image).repo : repo;
	if (argv.length && !info.requireEnv) add("root", argv.join(" "), 0, 1200);
	else if (/nginx/.test(base) || info.type === "web" && info.port === 80 && !info.cmdArgv) {
		add("root", "nginx: master process nginx -g daemon off;", 0, 9e3);
		add("nginx", "nginx: worker process", 1, 3500);
		add("nginx", "nginx: worker process", 1, 3500);
	} else if (/httpd|apache/.test(base)) {
		add("root", "httpd -DFOREGROUND", 0, 6e3);
		add("daemon", "httpd -DFOREGROUND", 1, 4e3);
	} else if (/redis/.test(base)) add("redis", "redis-server *:6379", 0, 9500);
	else if (/postgres/.test(base)) {
		add("postgres", "postgres", 0, 24e3);
		for (const n of [
			"postgres: checkpointer",
			"postgres: background writer",
			"postgres: walwriter",
			"postgres: autovacuum launcher",
			"postgres: logical replication launcher"
		]) add("postgres", n, 1, 9e3);
	} else if (/mysql/.test(base)) add("mysql", "mysqld", 0, 38e4);
	else if (/mongo/.test(base)) add("mongodb", "mongod --bind_ip_all", 0, 9e4);
	else if (/registry/.test(base)) add("root", "registry serve /etc/docker/registry/config.yml", 0, 2e4);
	else if (info.cmdArgv) add("root", info.cmdArgv.join(" "), 0, 2e3);
	else add("root", "sleep 3600", 0, 800);
	if (withShell) add("root", "sh", 0, 1e3);
	return P;
};
var POD_ALLOWED = [
	"echo",
	"printf",
	"cat",
	"ls",
	"mkdir",
	"rm",
	"rmdir",
	"touch",
	"cp",
	"mv",
	"cd",
	"pwd",
	"clear",
	"grep",
	"head",
	"tail",
	"wc",
	"sort",
	"uniq",
	"sed",
	"awk",
	"cut",
	"find",
	"tee",
	"tr",
	"base64",
	"date",
	"sleep",
	"seq",
	"test",
	"[",
	"[[",
	"true",
	"false",
	"less",
	"more",
	"xargs",
	"read",
	"export",
	"unset",
	"env",
	"history"
];
PG.podCommands = () => {
	const T = {};
	for (const n of POD_ALLOWED) if (PG.commands[n]) T[n] = PG.commands[n];
	const P = (ctx) => ctx.sh.pod;
	const info = (ctx) => PG.imageInfo(ctx.sim, PG.containerOf(P(ctx).pod, P(ctx).container).image) || {};
	T.exit = async (ctx, a) => {
		ctx.sh.exitRequested = true;
		ctx.sh.exitCode = Number(a[0]) || 0;
		return Number(a[0]) || 0;
	};
	T.logout = T.exit;
	T.hostname = async (ctx) => {
		ctx.println(P(ctx).pod.metadata.name);
	};
	T.whoami = async (ctx) => {
		ctx.println("root");
	};
	T.id = async (ctx) => {
		ctx.println("uid=0(root) gid=0(root) groups=0(root)");
	};
	T.uname = async (ctx, a) => {
		const all = a.includes("-a");
		ctx.println(a.includes("-r") ? "6.12.13-linuxkit" : a.includes("-m") ? "aarch64" : all ? `Linux ${P(ctx).pod.metadata.name} 6.12.13-linuxkit #1 SMP aarch64 GNU/Linux` : "Linux");
	};
	T.uptime = async (ctx) => {
		const s = Math.max(1, Math.floor(ctx.sim.clock - (P(ctx).pod._sim.startedAt || 0)));
		ctx.println(` ${new Date(PG.BASE_TIME + ctx.sim.clock * 1e3).toUTCString().slice(17, 25)} up ${s < 60 ? s + " sec" : Math.floor(s / 60) + " min"},  0 users,  load average: 0.05, 0.03, 0.01`);
	};
	T.ps = async (ctx, a) => {
		const pr = PG.podProcs(P(ctx).cl, P(ctx).pod, ctx.sh.interactive, P(ctx).container);
		const j = a.join(" ");
		if (/aux/.test(j)) ctx.println(PG.table(pr.map((x) => [
			x.user,
			String(x.pid),
			"0.0",
			(x.rss / 119755 * 100).toFixed(1),
			String(x.rss * 3),
			String(x.rss),
			"?",
			"Ss",
			"09:00",
			"0:00",
			x.cmd
		]), [
			"USER",
			"PID",
			"%CPU",
			"%MEM",
			"VSZ",
			"RSS",
			"TTY",
			"STAT",
			"START",
			"TIME",
			"COMMAND"
		]));
		else if (/-ef|-e|-A/.test(j)) ctx.println(PG.table(pr.map((x) => [
			x.user,
			String(x.pid),
			String(x.ppid),
			"0",
			"09:00",
			"?",
			"00:00:00",
			x.cmd
		]), [
			"UID",
			"PID",
			"PPID",
			"C",
			"STIME",
			"TTY",
			"TIME",
			"CMD"
		]));
		else ctx.println(PG.table([...pr, {
			pid: pr[pr.length - 1].pid + 9,
			user: "root",
			cmd: "ps"
		}].map((x) => [
			String(x.pid),
			x.user,
			"0:00",
			x.cmd
		]), [
			"PID",
			"USER",
			"TIME",
			"COMMAND"
		]));
	};
	T.top = async (ctx) => {
		const pr = PG.podProcs(P(ctx).cl, P(ctx).pod, ctx.sh.interactive, P(ctx).container);
		ctx.println(`top - ${new Date(PG.BASE_TIME + ctx.sim.clock * 1e3).toUTCString().slice(17, 25)} up 2 min,  0 users,  load average: 0.05, 0.03, 0.01\nTasks: ${pr.length} total,   1 running, ${pr.length - 1} sleeping\n%Cpu(s):  0.3 us,  0.2 sy,  0.0 ni, 99.4 id\nMiB Mem :  11695.4 total,   5871.2 free,   2411.6 used\n`);
		ctx.println(PG.table(pr.map((x) => [
			String(x.pid),
			x.user,
			"20",
			"0",
			String(x.rss * 3),
			String(x.rss),
			"S",
			"0.0",
			(x.rss / 119755 * 100).toFixed(1),
			"0:00.01",
			x.cmd
		]), [
			"PID",
			"USER",
			"PR",
			"NI",
			"VIRT",
			"RES",
			"S",
			"%CPU",
			"%MEM",
			"TIME+",
			"COMMAND"
		]));
	};
	T.free = async (ctx, a) => {
		a.includes("-m") || a.includes("-h");
		const f = (v) => a.includes("-h") ? (v / 1024 / 1024).toFixed(1) + "Gi" : a.includes("-m") ? Math.round(v / 1024) : v;
		ctx.println(`               total        used        free      shared  buff/cache   available\nMem:     ${[
			11975508,
			2411620,
			6012340,
			4120,
			3551548,
			8723412
		].map((v) => String(f(v)).padStart(11)).join(" ")}\nSwap:    ${[
			0,
			0,
			0
		].map((v) => String(f(v)).padStart(11)).join(" ")}`);
	};
	T.df = async (ctx, a) => {
		ctx.println(PG.table([
			[
				"overlay",
				"61202244",
				"11264312",
				"46796608",
				"20%",
				"/"
			],
			[
				"tmpfs",
				"65536",
				"0",
				"65536",
				"0%",
				"/dev"
			],
			[
				"tmpfs",
				"5987752",
				"12",
				"5987740",
				"1%",
				"/run/secrets/kubernetes.io/serviceaccount"
			],
			[
				"/dev/vda1",
				"61202244",
				"11264312",
				"46796608",
				"20%",
				"/etc/hosts"
			]
		], [
			"Filesystem",
			"1K-blocks",
			"Used",
			"Available",
			"Use%",
			"Mounted on"
		]));
	};
	T.mount = async (ctx) => {
		ctx.println("overlay on / type overlay (rw,relatime)\nproc on /proc type proc (rw,nosuid,nodev,noexec,relatime)\ntmpfs on /dev type tmpfs (rw,nosuid,size=65536k,mode=755)\n/dev/vda1 on /etc/hosts type ext4 (rw,relatime)");
	};
	T.netstat = T.ss = async (ctx) => {
		const port = info(ctx).port;
		ctx.println("Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name");
		if (port) ctx.println(`tcp        0      0 0.0.0.0:${port}            0.0.0.0:*               LISTEN      1/${PG.podProcs(P(ctx).cl, P(ctx).pod, false, P(ctx).container)[0].cmd.split(" ")[0]}`);
	};
	T.vi = async (ctx, a) => {
		if (!/busybox|alpine|netshoot|curlimages/.test(PG.containerOf(P(ctx).pod, P(ctx).container).image)) {
			ctx.eprintln("sh: vi: not found");
			return 127;
		}
		return PG.commands.vi(ctx, a);
	};
	T.kill = T.pkill = async () => 0;
	T.chmod = T.chown = T.ln = async () => 0;
	T.printenv = async (ctx, a) => {
		if (a[0]) {
			const v = ctx.env[a[0]];
			if (v === void 0) return 1;
			ctx.println(v);
		} else for (const [k, v] of Object.entries(ctx.env)) if (!/^[?]$/.test(k)) ctx.println(`${k}=${v}`);
	};
	T.which = T.type = async (ctx, a) => {
		for (const x of a) if (T[x]) ctx.println("/usr/bin/" + x);
		else {
			ctx.eprintln(`sh: ${x}: not found`);
			return 1;
		}
	};
	T.sh = T.bash = T.ash = async (ctx, a) => {
		if (a[0] === "-c") {
			await ctx.sh.runScript(a.slice(1).join(" "), { write: (s) => ctx.out(s) });
			return Number(ctx.sh.env["?"]) || 0;
		}
		return 0;
	};
	T.nginx = async (ctx, a) => {
		if (a.includes("-v")) ctx.eprintln("nginx version: nginx/1.27.5");
		else if (a.includes("-t")) ctx.eprintln("nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful");
		else if (a.includes("-s")) {} else ctx.println("(nginx is already running as PID 1)");
	};
	const resolve = (ctx, host) => {
		const pd = P(ctx);
		if (host === "localhost" || host === "127.0.0.1") return { ip: "127.0.0.1" };
		if (!pd.cl) {
			const peer = PG.dockerPeer(ctx.sim, pd.pod, host);
			return peer ? { ip: PG.containerAsPod(ctx.sim, peer).status.podIP } : null;
		}
		const s = pd.cl.findServiceByHost(host, pd.pod.metadata.namespace);
		if (s) return {
			ip: s.spec.clusterIP,
			svc: s
		};
		const p = pd.cl.res.pods.find((x) => x.status.podIP === host);
		if (p) return {
			ip: host,
			pod: p
		};
		if (pd.cl.nodes.find((x) => x.ip === host)) return { ip: host };
		return null;
	};
	T.nslookup = async (ctx, a) => {
		const r = resolve(ctx, a[0] || "");
		if (!r) {
			ctx.eprintln(`** server can't find ${a[0]}: NXDOMAIN`);
			return 1;
		}
		ctx.println(`Server:\t\t10.96.0.10\nAddress:\t10.96.0.10:53\n\nName:\t${a[0]}\nAddress: ${r.ip}`);
	};
	T.dig = async (ctx, a) => {
		const h = a.find((x) => !x.startsWith("+") && !x.startsWith("-"));
		const r = resolve(ctx, h || "");
		if (a.includes("+short")) {
			if (r) ctx.println(r.ip);
			return 0;
		}
		ctx.println(`;; ANSWER SECTION:\n${h}.\t30\tIN\tA\t${r ? r.ip : "(NXDOMAIN)"}`);
	};
	T.ping = async (ctx, a) => {
		const ci = a.indexOf("-c");
		const count = ci >= 0 ? Number(a[ci + 1]) : Infinity;
		const host = a.filter((x) => !x.startsWith("-") && x !== a[ci + 1] || x === a[a.length - 1]).pop();
		const r = resolve(ctx, host);
		if (!r) {
			ctx.eprintln(`ping: bad address '${host}'`);
			return 1;
		}
		ctx.println(`PING ${host} (${r.ip}): 56 data bytes`);
		let ok = 0;
		for (let i = 0; i < count; i++) {
			ctx.println(`64 bytes from ${r.ip}: seq=${i} ttl=64 time=${(.08 + Math.random() * .2).toFixed(3)} ms`);
			ok++;
			if (i < count - 1) await ctx.sleep(1);
		}
		ctx.println(`\n--- ${host} ping statistics ---\n${ok} packets transmitted, ${ok} packets received, 0% packet loss`);
	};
	T.nc = async (ctx, a) => {
		const [host, port] = a.filter((x) => !x.startsWith("-"));
		const r = resolve(ctx, host);
		if (!r) {
			ctx.eprintln(`nc: bad address '${host}'`);
			return 1;
		}
		let open = false;
		if (r.svc) open = (r.svc.spec.ports || []).some((p) => String(p.port) === String(port)) && P(ctx).cl.endpointsOf(r.svc).length > 0;
		else if (r.pod) open = String((PG.imageInfo(ctx.sim, r.pod.spec.containers[0].image) || {}).port) === String(port);
		else open = host === "localhost" && String(info(ctx).port) === String(port);
		if (a.some((x) => /^-[a-z]*[vz]/.test(x))) {
			if (open) ctx.println(`${host} (${r.ip}:${port}) open`);
		}
		return open ? 0 : 1;
	};
	const http = (name) => async (ctx, a) => {
		const pd = P(ctx);
		const url = a.find((x) => /^https?:\/\//.test(x) || /^[\w.-]+(:\d+)?(\/|$)/.test(x) && !x.startsWith("-"));
		const m = url && /^(?:https?:\/\/)?([^\/:]+)(?::(\d+))?(\/.*)?$/.exec(url);
		if (!m) {
			ctx.eprintln(`${name}: no URL specified`);
			return 1;
		}
		const rq = {
			host: m[1],
			port: m[2] ? Number(m[2]) : 80,
			path: m[3] || "/",
			method: "GET",
			headers: {}
		};
		if (!pd.cl) {
			if (rq.host === "localhost" || rq.host === "127.0.0.1") {
				const i = info(ctx);
				ctx.println(i.page || "");
				return 0;
			}
			const peer = PG.dockerPeer(ctx.sim, pd.pod, rq.host);
			if (peer) {
				const pi = PG.imageInfo(ctx.sim, peer.image) || {};
				const pp = PG.containerAsPod(ctx.sim, peer);
				const root = PG.webRootDir(pi);
				const body = pi.type === "web" ? root ? PG.podFS(null, pp).read(root + (rq.path === "/" ? "/index.html" : rq.path)) ?? PG.NGINX_404 : pi.page || "" : null;
				if (body === null || rq.port !== (pi.port || 80)) {
					ctx.eprintln(name === "wget" ? "wget: can't connect to remote host: Connection refused" : "curl: (7) Failed to connect: connection refused");
					return 1;
				}
				ctx.println(body);
				return 0;
			}
			ctx.eprintln(`${name}: bad address '${rq.host}'`);
			return 1;
		}
		const src = {
			name: pd.pod.metadata.name,
			ns: pd.pod.metadata.namespace,
			labels: pd.pod.metadata.labels,
			cluster: pd.cl,
			ip: pd.pod.status.podIP
		};
		let r;
		if (rq.host === "localhost" || rq.host === "127.0.0.1") {
			const i = info(ctx);
			r = i.type === "web" && String(rq.port) === String(i.port || 80) ? {
				status: 200,
				body: i.page || ""
			} : { error: {
				code: 7,
				msg: "Failed to connect: connection refused"
			} };
		} else r = PG.podRequest(ctx.sim, pd.cl, src, rq);
		ctx.sim.traceReq(r.steps || [], !r.error);
		if (r.error) {
			ctx.eprintln(name === "wget" ? r.error.code === 6 ? `wget: bad address '${rq.host}'` : r.error.blocked ? "wget: download timed out" : "wget: can't connect to remote host: Connection refused" : `curl: (${r.error.code}) ${r.error.msg}`);
			return 1;
		}
		if ((r.status || 200) >= 400) {
			ctx.eprintln(name === "wget" ? `wget: server returned error: HTTP/1.1 ${r.status} Not Found` : "");
			if (name === "wget") return 1;
		}
		const oi = a.indexOf("-o") >= 0 ? a.indexOf("-o") : a.indexOf("-O");
		const out = oi >= 0 ? a[oi + 1] : null;
		if (out && out !== "-" && out !== "/dev/null") ctx.fs.write(ctx.resolve(out), r.body);
		else if (out !== "/dev/null") ctx.println(r.body);
		const wi = a.indexOf("-w");
		if (wi >= 0) ctx.out(a[wi + 1].replace(/%\{http_code\}/g, String(r.status || 200)).replace(/\\n/g, "\n"));
		return 0;
	};
	T.wget = http("wget");
	T.curl = http("curl");
	T["redis-cli"] = async (ctx, a) => {
		if (info(ctx).port !== 6379) {
			ctx.eprintln("sh: redis-cli: not found");
			return 127;
		}
		const kv = P(ctx).pod._sim.kv = P(ctx).pod._sim.kv || {};
		const args = a.filter((x, k) => !(x === "-n") && a[k - 1] !== "-n" && !x.startsWith("-"));
		const cmd = (args[0] || "").toLowerCase();
		if (!cmd) {
			ctx.println("(interactive redis-cli is not simulated: pass a command, e.g. redis-cli ping)");
			return 0;
		}
		if (cmd === "ping") ctx.println("PONG");
		else if (cmd === "set") {
			kv[args[1]] = args[2];
			ctx.println("OK");
		} else if (cmd === "get") ctx.println(kv[args[1]] === void 0 ? "(nil)" : "\"" + kv[args[1]] + "\"");
		else if (cmd === "del") {
			const n = args.slice(1).filter((k) => k in kv).length;
			args.slice(1).forEach((k) => delete kv[k]);
			ctx.println(`(integer) ${n}`);
		} else if (cmd === "incr") {
			kv[args[1]] = String((Number(kv[args[1]]) || 0) + 1);
			ctx.println(`(integer) ${kv[args[1]]}`);
		} else if (cmd === "dbsize") ctx.println(`(integer) ${Object.keys(kv).length}`);
		else if (cmd === "keys") {
			const ks = Object.keys(kv);
			ctx.println(ks.length ? ks.map((k, n) => `${n + 1}) "${k}"`).join("\n") : "(empty array)");
		} else if (cmd === "flushall" || cmd === "flushdb") {
			for (const k of Object.keys(kv)) delete kv[k];
			ctx.println("OK");
		} else if (cmd === "info") ctx.println("# Server\nredis_version:7.4.1\nuptime_in_seconds:" + Math.floor(ctx.sim.clock) + "\n# Keyspace\n");
		else if (cmd === "echo") ctx.println(args.slice(1).join(" "));
		else ctx.println("OK");
	};
	T.psql = async (ctx, a) => {
		if (info(ctx).port !== 5432) {
			ctx.eprintln("sh: psql: not found");
			return 127;
		}
		const ci = a.indexOf("-c");
		const q = ci >= 0 ? a[ci + 1] : "";
		if (/version/i.test(q)) ctx.println(" version\n-----------------------------------------------------------------------\n PostgreSQL 16.4 on aarch64-unknown-linux-musl, compiled by gcc (Alpine)\n(1 row)");
		else if (/select\s+1\b/i.test(q)) ctx.println(" ?column?\n----------\n        1\n(1 row)");
		else if (/\\l/.test(q)) ctx.println("   Name    |  Owner   | Encoding\n-----------+----------+----------\n postgres  | postgres | UTF8\n template0 | postgres | UTF8\n template1 | postgres | UTF8\n(3 rows)");
		else if (/\\dt/.test(q)) ctx.println("Did not find any relations.");
		else ctx.println("(simulated psql understands: select 1, select version(), \\l, \\dt)");
	};
	T.pg_isready = async (ctx) => {
		ctx.println("/var/run/postgresql:5432 - accepting connections");
	};
	for (const n of [
		"apt-get",
		"apt",
		"apk",
		"pip",
		"pip3",
		"npm",
		"yum",
		"dnf"
	]) T[n] = async (ctx, a) => {
		ctx.println(`(simulated) ${n} ${a.join(" ")}: done — the playground cannot download packages, but the command succeeds so tutorials keep working`);
	};
	return T;
};
PG.makePodShell = (sim, o) => {
	PG.simRef = sim;
	const pod = o.pod;
	const sh = new PG.Shell(sim, o.term);
	sh.isPodShell = true;
	sh.pod = o;
	sh.interactive = !!o.interactive;
	sh.fsOverride = PG.podFS(o.cl, pod, o.container);
	sh.cmdOverride = PG.podCommands();
	sh.notFoundMsg = (n) => `sh: ${n}: not found`;
	const info = PG.imageInfo(sim, PG.containerOf(pod, o.container).image) || {};
	sh.cwd = info.workdir || "/";
	sh.env = {
		...o.cl ? PG.podEnv(o.cl, pod) : { HOSTNAME: pod.metadata.name },
		HOME: "/root",
		USER: "root",
		PWD: sh.cwd,
		TERM: "xterm",
		HOSTNAME: pod.metadata.name,
		...info.env || {},
		"?": "0"
	};
	sh.aliases = {};
	sh.promptFn = () => `root@${pod.metadata.name}:${sh.cwd === "/root" ? "~" : sh.cwd}# `;
	return sh;
};
PG.execInPod = async (ctx, cl, pod, argv, cname) => {
	const sim = ctx.sim;
	let out = "", err = "";
	const sh = PG.makePodShell(sim, {
		cl,
		pod,
		term: {
			print: (t, cls) => {
				if (cls === "err") err += t + "\n";
				else out += t + "\n";
			},
			clear() {}
		},
		container: cname
	});
	sh.aborted = ctx.sh ? ctx.sh.aborted : false;
	const q = (x) => /^[\w@%+=:,./-]+$/.test(x) ? x : "'" + String(x).replace(/'/g, "'\\''") + "'";
	const text = (argv[0] === "sh" || argv[0] === "bash" || argv[0] === "/bin/sh") && argv[1] === "-c" ? argv.slice(2).join(" ") : argv.map(q).join(" ");
	try {
		await sh.runScript(text, { write: (s) => {
			out += s;
		} });
	} catch (e) {
		if (e && e.abort) throw e;
	}
	PG.syncVols(cl, pod, cname);
	const code = sh.exitRequested ? sh.exitCode : Number(sh.env["?"]) || 0;
	return {
		out: out.replace(/\n$/, ""),
		err: err.replace(/\n$/, ""),
		code
	};
};
PG.containerAsPod = (sim, c) => {
	PG.simRef = sim;
	if (c._pod) return c._pod;
	const info = PG.imageInfo(sim, c.image) || {};
	const env = (c.env || []).map((e) => {
		const i = e.indexOf("=");
		return {
			name: e.slice(0, i),
			value: e.slice(i + 1)
		};
	});
	const pod = {
		kind: "Pod",
		_docker: true,
		metadata: {
			name: c.name,
			namespace: "docker",
			uid: PG.hex(24),
			labels: {},
			_t: sim.clock
		},
		spec: {
			containers: [{
				name: c.name,
				image: c.image,
				env,
				...c.cmd && c.cmd.length ? { command: c.cmd } : {},
				volumeMounts: (c.mounts || []).map((m) => ({
					name: m.vol,
					mountPath: m.path
				}))
			}],
			volumes: (c.mounts || []).map((m) => ({
				name: m.vol,
				emptyDir: {}
			})),
			nodeName: "docker",
			automountServiceAccountToken: false
		},
		status: { podIP: c.ip || "172.17.0." + (2 + sim.containers.indexOf(c)) },
		_sim: {
			logs: [],
			stage: "running",
			startedAt: c.startedAt,
			vols: sim.volumes,
			status: "Running",
			ready: true
		}
	};
	pod._sim.logs.push(...PG.Cluster.prototype.startLogs.call({
		clock: sim.clock,
		sim
	}, pod, pod.spec.containers[0]));
	if (/registry/.test(c.image)) pod._sim.logs.push("time=\"2026-10-14T09:00:00Z\" level=info msg=\"listening on [::]:5000\"");
	if (info.type === "registry") pod._registry = c.name;
	c._pod = pod;
	return pod;
};
PG.dockerPeer = (sim, pod, host) => {
	const me = sim.containers.find((x) => x._pod === pod);
	if (!me) return null;
	return sim.containers.find((x) => x.status === "running" && x !== me && (x.name === host || x.composeService === host) && x.networks.some((n) => me.networks.includes(n)));
};
PG.parseRunFlags = (rest) => {
	const o = {
		env: [],
		ports: [],
		vols: [],
		labels: []
	};
	let i = 0;
	for (; i < rest.length; i++) {
		const a = rest[i];
		const val = () => rest[++i];
		if (a === "-d" || a === "--detach") o.detach = true;
		else if (a === "--rm") o.rm = true;
		else if (a === "-i" || a === "--interactive") o.i = true;
		else if (a === "-t" || a === "--tty") o.t = true;
		else if (a === "-it" || a === "-ti") o.i = o.t = true;
		else if (a === "--name") o.name = val();
		else if (a === "-p" || a === "--publish") o.ports.push(val());
		else if (a === "--network" || a === "--net") o.net = val();
		else if (a.startsWith("--restart")) o.restart = a.includes("=") ? a.split("=")[1] : val();
		else if (a === "-e" || a === "--env") o.env.push(val());
		else if (a === "-v" || a === "--volume") o.vols.push(val());
		else if (a === "-w" || a === "--workdir") o.workdir = val();
		else if (a === "--entrypoint") o.entrypoint = val();
		else if (a === "-u" || a === "--user") o.user = val();
		else if (a === "-h" || a === "--hostname") o.hostname = val();
		else if (a === "--label" || a === "-l") o.labels.push(val());
		else if (a === "--platform" || a === "--env-file" || a === "--memory" || a === "-m" || a === "--cpus") i++;
		else if (a.startsWith("-") && a.length > 1) for (const ch of a.slice(1)) {
			if (ch === "d") o.detach = true;
			if (ch === "i") o.i = true;
			if (ch === "t") o.t = true;
		}
		else {
			o.image = a;
			o.cmd = rest.slice(i + 1);
			break;
		}
	}
	return o;
};
var dockerBase = PG.commands.docker;
PG.commands.docker = async (ctx, args) => {
	const sim = ctx.sim;
	const sub = args[0];
	const rest = args.slice(1);
	sim.volumes = sim.volumes || {};
	sim.dockerAuth = sim.dockerAuth || {};
	const find = (n) => sim.container((n || "").replace(/^\//, ""));
	const hostPorts = (o) => o.ports.map((s) => {
		const parts = s.split(":");
		let hostIp = "0.0.0.0", host, cont;
		if (parts.length === 3) [hostIp, host, cont] = parts;
		else if (parts.length === 2) [host, cont] = parts;
		else {
			cont = parts[0];
			host = cont;
		}
		return {
			hostIp,
			host: Number(host),
			container: Number(String(cont).split("/")[0])
		};
	});
	if (sub === "compose" || sub === "compose-v1") return PG.commands["docker-compose"](ctx, rest);
	if (sub === "run") {
		const o = PG.parseRunFlags(rest);
		if (!o.image) {
			ctx.eprintln("\"docker run\" requires at least 1 argument");
			return 125;
		}
		if (o.name && find(o.name)) {
			ctx.eprintln(`docker: Error response from daemon: Conflict. The container name "/${o.name}" is already in use by container "${find(o.name).id}${PG.hex(52)}". You have to remove (or rename) that container to be able to reuse that name.`);
			return 125;
		}
		const p = PG.parseImage(o.image);
		const key = p.host ? o.image : p.repo + ":" + p.tag;
		if (!(sim.images[key] || sim.images[o.image])) {
			if (!PG.dockerAvailable(o.image)) {
				ctx.eprintln(`Unable to find image '${o.image}' locally\ndocker: Error response from daemon: pull access denied for ${p.repo}, repository does not exist or may require 'docker login'.`);
				return 125;
			}
			ctx.println(`Unable to find image '${o.image}' locally`);
			ctx.println(`${p.tag}: Pulling from ${p.repo.includes("/") ? p.repo : "library/" + p.repo}`);
			await ctx.delay(400);
			ctx.println(`Status: Downloaded newer image for ${o.image}`);
			sim.images[key] = {
				id: PG.hex(12),
				size: (PG.CATALOG[p.repo] || {}).size || 50
			};
		}
		const mapped = hostPorts(o);
		for (const m of mapped) if (sim.containers.find((c) => c.status === "running" && c.ports.some((x) => x.host === m.host && (x.hostIp === m.hostIp || x.hostIp === "0.0.0.0" || m.hostIp === "0.0.0.0")))) {
			ctx.eprintln(`docker: Error response from daemon: driver failed programming external connectivity on endpoint ${o.name || "container"}: Bind for ${m.hostIp}:${m.host} failed: port is already allocated.`);
			return 125;
		}
		const net = o.net || "bridge";
		if (net !== "bridge" && !sim.networks.includes(net)) {
			ctx.eprintln(`docker: Error response from daemon: network ${net} not found.`);
			return 125;
		}
		const mounts = [];
		for (const v of o.vols) {
			const [src, path] = v.split(":");
			if (!path) continue;
			if (src.startsWith("/") || src.startsWith(".") || src.startsWith("~")) {
				const abs = ctx.resolve(src);
				sim.volumes["bind:" + abs] = sim.volumes["bind:" + abs] || { __bind: abs };
				mounts.push({
					vol: "bind:" + abs,
					path,
					bind: abs
				});
			} else {
				sim.volumes[src] = sim.volumes[src] || {};
				mounts.push({
					vol: src,
					path
				});
			}
		}
		const isReg = p.repo === "registry";
		const cmdv = [...o.entrypoint ? [o.entrypoint] : [], ...o.cmd || []];
		const c = sim.addContainer({
			name: o.name || [
				"brave",
				"calm",
				"eager",
				"quirky",
				"witty"
			][Math.floor(Math.random() * 5)] + "_" + PG.rnd(5),
			image: o.image,
			kind: isReg ? "registry" : "other",
			networks: [net],
			ports: mapped,
			restart: o.restart,
			env: o.env,
			mounts,
			cmd: cmdv
		});
		if (isReg) sim.registries[c.name] = {};
		const pod = PG.containerAsPod(sim, c);
		if (o.workdir) pod._workdir = o.workdir;
		const info = PG.imageInfo(sim, o.image) || {};
		const cls = cmdv.length ? PG.classifyArgv(cmdv) : null;
		const long = cmdv.length ? !!(cls && cls.long) : info.type !== "tool" || info.cmdArgv && PG.classifyArgv(info.cmdArgv) && PG.classifyArgv(info.cmdArgv).long;
		if (o.detach) {
			if (!long) {
				c.status = "exited";
				c.exitCode = 0;
				c.startedAt = sim.clock;
			}
			ctx.println(c.id + PG.hex(52));
			return 0;
		}
		const finish = () => {
			c.status = "exited";
			c.startedAt = sim.clock;
			if (o.rm) {
				const i = sim.containers.indexOf(c);
				if (i >= 0) sim.containers.splice(i, 1);
				delete sim.registries[c.name];
			}
		};
		if (o.t && o.i && (!cmdv.length || /^(\/bin\/)?(ba|a|z)?sh$/.test(cmdv[0]))) {
			const sh2 = PG.makePodShell(sim, {
				cl: null,
				pod,
				term: ctx.sh.term,
				interactive: true
			});
			sh2.onExit = finish;
			ctx.sh.session = sh2;
			return 0;
		}
		if (long && !cmdv.length || long && cls && cls.long) {
			for (const l of pod._sim.logs) ctx.println(l);
			try {
				await sim.waitFor(() => false, ctx.sh, 1e9);
			} finally {
				finish();
			}
			return 0;
		}
		const r = cmdv.length ? await PG.execInPod(ctx, null, pod, cmdv) : {
			out: "",
			err: "",
			code: 0
		};
		if (r.out) ctx.println(r.out);
		if (r.err) ctx.eprintln(r.err);
		c.exitCode = r.code || 0;
		finish();
		return r.code || 0;
	}
	if (sub === "exec") {
		PG.opts(rest.filter((a) => a !== "-it" && a !== "-ti"));
		let i = 0;
		const tty = rest.some((a) => /^-(it|ti|t|i)$/.test(a) && a) && rest.some((a) => /^(-it|-ti|-t)$/.test(a));
		const argsOnly = [];
		for (; i < rest.length; i++) {
			if ([
				"-u",
				"-w",
				"-e",
				"--user",
				"--workdir",
				"--env"
			].includes(rest[i])) {
				i++;
				continue;
			}
			if (rest[i].startsWith("-")) continue;
			argsOnly.push(...rest.slice(i));
			break;
		}
		const [cn, ...cmdv] = argsOnly;
		const c = find(cn);
		if (!c) {
			ctx.eprintln(`Error response from daemon: No such container: ${cn}`);
			return 1;
		}
		if (c.status !== "running") {
			ctx.eprintln(`Error response from daemon: container ${c.id}${PG.hex(52)} is not running`);
			return 1;
		}
		const cl = sim.clusters[c.clusterId];
		if (c.kind === "node" && cl) return dockerBase(ctx, args);
		const pod = PG.containerAsPod(sim, c);
		if (!cmdv.length) {
			ctx.eprintln("\"docker exec\" requires at least 2 arguments");
			return 1;
		}
		if (tty && cmdv.length === 1 && /^(\/bin\/)?(ba|a|z)?sh$/.test(cmdv[0])) {
			ctx.sh.session = PG.makePodShell(sim, {
				cl: null,
				pod,
				term: ctx.sh.term,
				interactive: true
			});
			return 0;
		}
		const r = await PG.execInPod(ctx, null, pod, cmdv);
		if (r.out) ctx.println(r.out);
		if (r.err) ctx.eprintln(r.err);
		return r.code || 0;
	}
	if (sub === "logs") {
		const o = PG.opts(rest);
		const c = find(o.rest[0]);
		if (!c) {
			ctx.eprintln(`Error response from daemon: No such container: ${o.rest[0]}`);
			return 1;
		}
		if (sim.clusters[c.clusterId]) {
			ctx.println("(node logs are not simulated; use: kubectl logs …)");
			return 0;
		}
		const pod = PG.containerAsPod(sim, c);
		const ti = rest.indexOf("--tail");
		let lines = pod._sim.logs.slice();
		if (ti >= 0) lines = lines.slice(-Number(rest[ti + 1]));
		if (lines.length) ctx.println(lines.join("\n"));
		if (o.flags.has("f")) {
			let n = pod._sim.logs.length;
			while (true) {
				await ctx.sleep(1);
				if (pod._sim.logs.length > n) {
					ctx.println(pod._sim.logs.slice(n).join("\n"));
					n = pod._sim.logs.length;
				}
			}
		}
		return 0;
	}
	if (sub === "inspect") {
		const o = PG.opts(rest);
		const fi = rest.indexOf("--format") >= 0 ? rest.indexOf("--format") : rest.indexOf("-f");
		const fmt = fi >= 0 ? rest[fi + 1] : null;
		const names = o.rest.filter((x) => x !== fmt);
		const out = [];
		for (const n of names) {
			const c = find(n);
			const key = sim.images[n] ? n : n + ":latest";
			let obj;
			if (c) {
				const pod = PG.containerAsPod(sim, c);
				obj = {
					Id: c.id + PG.hex(52),
					Created: PG.iso(c.created),
					Name: "/" + c.name,
					State: {
						Status: c.status === "running" ? "running" : "exited",
						Running: c.status === "running",
						ExitCode: c.exitCode || 0,
						StartedAt: PG.iso(c.startedAt)
					},
					Image: "sha256:" + (sim.images[c.image] || sim.images[c.image + ":latest"] || { id: PG.hex(12) }).id + PG.hex(52),
					Config: {
						Image: c.image,
						Env: [...c.env || [], "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"],
						Cmd: c.cmd || null,
						Hostname: c.id
					},
					HostConfig: {
						RestartPolicy: { Name: c.restart || "no" },
						PortBindings: Object.fromEntries(c.ports.map((p) => [p.container + "/tcp", [{
							HostIp: p.hostIp,
							HostPort: String(p.host)
						}]])),
						Binds: (c.mounts || []).map((m) => (m.bind || m.vol) + ":" + m.path)
					},
					NetworkSettings: {
						IPAddress: pod.status.podIP,
						Ports: Object.fromEntries(c.ports.map((p) => [p.container + "/tcp", [{
							HostIp: p.hostIp,
							HostPort: String(p.host)
						}]])),
						Networks: Object.fromEntries(c.networks.map((nn) => [nn, {
							IPAddress: pod.status.podIP,
							Gateway: "172.17.0.1"
						}]))
					}
				};
			} else if (sim.images[key] || sim.images[n]) {
				const im = sim.images[n] || sim.images[key];
				const m = im.meta || {};
				obj = {
					Id: "sha256:" + im.id + PG.hex(52),
					RepoTags: [n.includes(":") ? n : n + ":latest"],
					Size: im.size * 1e6,
					Config: {
						Env: Object.entries(m.env || {}).map(([k, v]) => `${k}=${v}`),
						Cmd: m.cmd || null,
						Entrypoint: m.entrypoint || null,
						WorkingDir: m.workdir || "",
						ExposedPorts: m.port ? { [m.port + "/tcp"]: {} } : null,
						Labels: m.labels || null
					}
				};
			} else {
				ctx.eprintln(`Error: No such object: ${n}`);
				return 1;
			}
			out.push(obj);
		}
		if (fmt) for (const obj of out) ctx.println(fmt.replace(/\{\{\s*(json\s+)?\.([\w.]+)\s*\}\}/g, (mm, j, path) => {
			const v = path.split(".").reduce((a, k) => a == null ? void 0 : a[k], obj);
			return v === void 0 ? "<no value>" : j || typeof v === "object" ? JSON.stringify(v) : String(v);
		}));
		else ctx.println(JSON.stringify(out, null, 4));
		return 0;
	}
	if (sub === "cp") {
		const [src, dst] = rest.filter((a) => !a.startsWith("-"));
		const parse = (x) => {
			const m = /^([^:\/][^:]*):(.*)$/.exec(x);
			return m ? {
				c: m[1],
				path: m[2]
			} : { path: x };
		};
		const a = parse(src), b = parse(dst);
		if (a.c && !b.c) {
			const c = find(a.c);
			if (!c) {
				ctx.eprintln(`Error response from daemon: No such container: ${a.c}`);
				return 1;
			}
			const content = PG.podFS(null, PG.containerAsPod(sim, c)).read(a.path);
			if (content === void 0) {
				ctx.eprintln(`Error response from daemon: Could not find the file ${a.path} in container ${a.c}`);
				return 1;
			}
			let d = ctx.resolve(b.path);
			if (ctx.fs.isDir(d)) d += "/" + a.path.split("/").pop();
			ctx.fs.write(d, content);
			return 0;
		}
		if (!a.c && b.c) {
			const c = find(b.c);
			if (!c) {
				ctx.eprintln(`Error response from daemon: No such container: ${b.c}`);
				return 1;
			}
			const content = ctx.fs.read(ctx.resolve(a.path));
			if (content === void 0) {
				ctx.eprintln(`lstat ${a.path}: no such file or directory`);
				return 1;
			}
			const pod = PG.containerAsPod(sim, c);
			const fs = PG.podFS(null, pod);
			let d = b.path;
			if (fs.isDir(d.replace(/\/$/, "")) || d.endsWith("/")) d = d.replace(/\/$/, "") + "/" + a.path.split("/").pop();
			fs.write(d, content);
			PG.syncVols(null, pod);
			return 0;
		}
		ctx.eprintln("usage: docker cp CONTAINER:SRC_PATH DEST_PATH  |  docker cp SRC_PATH CONTAINER:DEST_PATH");
		return 1;
	}
	if (sub === "volume") {
		const [s2, ...r2] = rest;
		const names = r2.filter((a) => !a.startsWith("-"));
		const named = Object.keys(sim.volumes).filter((k) => !k.startsWith("bind:"));
		if (s2 === "ls") {
			ctx.println(PG.table(named.map((n) => ["local", n]), ["DRIVER", "VOLUME NAME"]));
			return 0;
		}
		if (s2 === "create") {
			const n = names[0] || PG.hex(64);
			sim.volumes[n] = sim.volumes[n] || {};
			ctx.println(n);
			return 0;
		}
		if (s2 === "rm") {
			for (const n of names) {
				if (!sim.volumes[n]) {
					ctx.eprintln(`Error response from daemon: get ${n}: no such volume`);
					return 1;
				}
				if (sim.containers.some((c) => (c.mounts || []).some((m) => m.vol === n))) {
					ctx.eprintln(`Error response from daemon: remove ${n}: volume is in use`);
					return 1;
				}
				delete sim.volumes[n];
				ctx.println(n);
			}
			return 0;
		}
		if (s2 === "inspect") {
			const n = names[0];
			if (!sim.volumes[n]) {
				ctx.eprintln(`Error response from daemon: get ${n}: no such volume`);
				return 1;
			}
			ctx.println(JSON.stringify([{
				CreatedAt: PG.iso(0),
				Driver: "local",
				Mountpoint: "/var/lib/docker/volumes/" + n + "/_data",
				Name: n,
				Scope: "local"
			}], null, 4));
			return 0;
		}
		if (s2 === "prune") {
			let n = 0;
			for (const k of named) if (!sim.containers.some((c) => (c.mounts || []).some((m) => m.vol === k))) {
				delete sim.volumes[k];
				n++;
			}
			ctx.println(`Deleted Volumes: ${n}\nTotal reclaimed space: 0B`);
			return 0;
		}
		ctx.eprintln("usage: docker volume ls|create|rm|inspect|prune");
		return 1;
	}
	if (sub === "login") {
		const o = PG.opts(rest);
		const ui = rest.indexOf("-u");
		const server = o.rest.find((a) => a !== rest[ui + 1] && a !== rest[rest.indexOf("-p") + 1]) || "docker.io";
		sim.dockerAuth[server] = true;
		ctx.eprintln("WARNING! Using --password via the CLI is insecure. Use --password-stdin.");
		ctx.println("Login Succeeded");
		return 0;
	}
	if (sub === "logout") {
		delete sim.dockerAuth[rest[0] || "docker.io"];
		ctx.println(`Removing login credentials for ${rest[0] || "https://index.docker.io/v1/"}`);
		return 0;
	}
	if (sub === "search") {
		const t = (rest.find((a) => !a.startsWith("-")) || "").toLowerCase();
		const hits = Object.keys(PG.CATALOG).filter((k) => k.includes(t) && !/kindest|helm|tiller/.test(k));
		ctx.println(PG.table(hits.map((k) => [
			k,
			`${k} image (simulated search result)`,
			String(500 + k.length * 111),
			k.includes("/") ? "" : "[OK]"
		]), [
			"NAME",
			"DESCRIPTION",
			"STARS",
			"OFFICIAL"
		]));
		return 0;
	}
	if (sub === "stats") {
		const list = sim.containers.filter((c) => c.status === "running");
		ctx.println(PG.table(list.map((c) => [
			c.id,
			c.name,
			"0.05%",
			`${(PG.baseMemOf(c.image, PG.imageInfo(sim, c.image) || {}) || 5).toFixed(1)}MiB / 11.42GiB`,
			"0.08%",
			"1.2kB / 0B",
			"0B / 0B",
			String(c.kind === "node" ? 120 : 6)
		]), [
			"CONTAINER ID",
			"NAME",
			"CPU %",
			"MEM USAGE / LIMIT",
			"MEM %",
			"NET I/O",
			"BLOCK I/O",
			"PIDS"
		]));
		return 0;
	}
	if (sub === "top") {
		const c = find(rest[0]);
		if (!c) {
			ctx.eprintln(`Error response from daemon: No such container: ${rest[0]}`);
			return 1;
		}
		const pr = PG.podProcs(null, PG.containerAsPod(sim, c));
		ctx.println(PG.table(pr.map((x) => [
			x.user,
			String(x.pid + 3e3),
			String(x.ppid + 2999),
			"0",
			"09:00",
			"?",
			"00:00:00",
			x.cmd
		]), [
			"UID",
			"PID",
			"PPID",
			"C",
			"STIME",
			"TTY",
			"TIME",
			"CMD"
		]));
		return 0;
	}
	if (sub === "container" && rest[0] === "prune" || sub === "system" && rest[0] === "prune" || sub === "image" && rest[0] === "prune" || sub === "builder") {
		const all = rest.includes("-a") || rest.includes("--all");
		let removedC = [], removedI = [];
		if (sub !== "image") {
			for (const c of [...sim.containers]) if (c.status !== "running" && c.kind !== "node") {
				removedC.push(c.id);
				sim.containers.splice(sim.containers.indexOf(c), 1);
				delete sim.registries[c.name];
			}
		}
		if (sub !== "container" && all) {
			for (const k of Object.keys(sim.images)) if (!/kindest|rancher/.test(k) && !sim.containers.some((c) => PG.normImage(c.image) === PG.normImage(k))) {
				removedI.push(k);
				delete sim.images[k];
			}
		}
		if (sub !== "image") ctx.println(`Deleted Containers:\n${removedC.join("\n")}\n`);
		if (removedI.length) ctx.println(`Deleted Images:\n${removedI.map((k) => "untagged: " + k).join("\n")}\n`);
		ctx.println(`Total reclaimed space: ${removedC.length * 12 + removedI.length * 60}MB`);
		return 0;
	}
	if (sub === "ps" && (rest.includes("-q") || rest.includes("--filter") || rest.includes("-aq") || rest.includes("-qa") || rest.includes("--quiet"))) {
		const fi = rest.indexOf("--filter");
		const flt = fi >= 0 ? rest[fi + 1] : "";
		const all = rest.some((a) => /^-[a-z]*a/.test(a)) || rest.includes("--all");
		let list = sim.containers.filter((c) => all || c.status === "running");
		const m = /^(name|status|ancestor)=(.*)$/.exec(flt);
		if (m) list = list.filter((c) => m[1] === "name" ? c.name.includes(m[2]) : m[1] === "status" ? m[2] === "running" ? c.status === "running" : c.status !== "running" : c.image.startsWith(m[2]));
		ctx.println(list.map((c) => c.id).join("\n"));
		return 0;
	}
	return dockerBase(ctx, args);
};
PG.commands["docker-compose"] = async (ctx, args) => {
	const sim = ctx.sim;
	sim.volumes = sim.volumes || {};
	const rest = [...args];
	let file = null, project = null;
	const sub = [];
	for (let i = 0; i < rest.length; i++) if (rest[i] === "-f") file = rest[++i];
	else if (rest[i] === "-p") project = rest[++i];
	else sub.push(rest[i]);
	const cmd = sub[0];
	const flags = sub.filter((a) => a.startsWith("-"));
	const names = sub.slice(1).filter((a) => !a.startsWith("-"));
	const f = (file ? [file] : [
		"compose.yaml",
		"compose.yml",
		"docker-compose.yml",
		"docker-compose.yaml"
	]).find((x) => ctx.fs.read(ctx.resolve(x)) !== void 0);
	if (!f) {
		ctx.eprintln("no configuration file provided: not found\n(create compose.yaml in this folder, or pass -f FILE)");
		return 1;
	}
	let y;
	try {
		y = PG.yaml.parse(ctx.fs.read(ctx.resolve(f)));
	} catch (e) {
		y = null;
	}
	if (!y || !y.services) {
		ctx.eprintln(`validating ${f}: services must be a mapping`);
		return 1;
	}
	const proj = (project || ctx.cwd.split("/").pop() || "project").toLowerCase().replace(/[^a-z0-9_-]/g, "");
	const net = proj + "_default";
	const svcNames = Object.keys(y.services);
	const order = [];
	const visit = (n) => {
		if (order.includes(n)) return;
		const d = y.services[n].depends_on;
		for (const dep of Array.isArray(d) ? d : d ? Object.keys(d) : []) visit(dep);
		order.push(n);
	};
	svcNames.forEach(visit);
	const cname = (s, i = 1) => y.services[s].container_name || `${proj}-${s}-${i}`;
	const mine = () => sim.containers.filter((c) => c.composeProject === proj);
	const envOf = (s) => {
		const e = y.services[s].environment;
		if (!e) return [];
		return Array.isArray(e) ? e.map(String) : Object.entries(e).map(([k, v]) => `${k}=${v}`);
	};
	if (cmd === "config") {
		ctx.out(PG.yaml.dump(y));
		return 0;
	}
	if (cmd === "ps") {
		ctx.println(PG.table(mine().map((c) => [
			c.name,
			c.image,
			c.composeService,
			PG.upText(sim, c),
			PG.portsText(c)
		]), [
			"NAME",
			"IMAGE",
			"SERVICE",
			"STATUS",
			"PORTS"
		]));
		return 0;
	}
	if (cmd === "up") {
		sim.ensureNetwork(net);
		ctx.println(` ✔ Network ${net}   Created`);
		for (const s of order) {
			if (names.length && !names.includes(s)) continue;
			const sv = y.services[s];
			const nm = cname(s);
			const existing = sim.container(nm);
			if (existing && existing.status === "running") {
				ctx.println(` ✔ Container ${nm}   Running`);
				continue;
			}
			if (existing) sim.containers.splice(sim.containers.indexOf(existing), 1);
			let image = sv.image;
			if (sv.build) {
				const dir = typeof sv.build === "string" ? sv.build : sv.build.context || ".";
				image = sv.image || `${proj}-${s}`;
				await ctx.sh.runScript(`docker build -t ${image} ${dir}`, { write() {} });
				ctx.println(` ✔ Image ${image}   Built`);
			}
			if (!image) {
				ctx.eprintln(`service "${s}" has neither an image nor a build context specified`);
				return 1;
			}
			const p = PG.parseImage(image);
			const key = p.host ? image : p.repo + ":" + p.tag;
			if (!sim.images[key] && !sim.images[image]) {
				if (!PG.dockerAvailable(image)) {
					ctx.eprintln(` ✘ Image ${image}   Error: pull access denied for ${p.repo}, repository does not exist or may require 'docker login'`);
					return 1;
				}
				sim.images[key] = {
					id: PG.hex(12),
					size: (PG.CATALOG[p.repo] || {}).size || 50
				};
				ctx.println(` ✔ Image ${image}   Pulled`);
			}
			const ports = (sv.ports || []).map((x) => {
				const parts = String(x).split(":");
				const cont = Number(String(parts[parts.length - 1]).split("/")[0]);
				return {
					hostIp: "0.0.0.0",
					host: parts.length >= 2 ? Number(parts[parts.length - 2]) : cont,
					container: cont
				};
			});
			const clash = ports.find((pt) => sim.containers.some((c) => c.status === "running" && c.ports.some((q) => q.host === pt.host)));
			if (clash) {
				ctx.eprintln(` ✘ Container ${nm}   Error: Bind for 0.0.0.0:${clash.host} failed: port is already allocated`);
				return 1;
			}
			const mounts = [];
			for (const v of sv.volumes || []) {
				const [src, path] = String(v).split(":");
				if (!path) continue;
				if (/^[./~]/.test(src)) {
					const abs = ctx.resolve(src);
					sim.volumes["bind:" + abs] = sim.volumes["bind:" + abs] || { __bind: abs };
					mounts.push({
						vol: "bind:" + abs,
						path,
						bind: abs
					});
				} else {
					const vn = `${proj}_${src}`;
					sim.volumes[vn] = sim.volumes[vn] || {};
					mounts.push({
						vol: vn,
						path
					});
				}
			}
			const cmdv = sv.command ? Array.isArray(sv.command) ? sv.command : String(sv.command).split(/\s+/) : [];
			const isReg = p.repo === "registry";
			const c = sim.addContainer({
				name: nm,
				image,
				kind: isReg ? "registry" : "other",
				networks: [net],
				ports,
				restart: sv.restart,
				env: envOf(s),
				mounts,
				cmd: cmdv,
				composeProject: proj,
				composeService: s
			});
			if (isReg) sim.registries[c.name] = {};
			PG.containerAsPod(sim, c);
			const info = PG.imageInfo(sim, image) || {};
			const cls = cmdv.length ? PG.classifyArgv(cmdv) : null;
			if (cmdv.length ? !(cls && cls.long) : info.type === "tool" && !(info.cmdArgv && PG.classifyArgv(info.cmdArgv) && PG.classifyArgv(info.cmdArgv).long)) {
				c.status = "exited";
				c.exitCode = 0;
			}
			if (info.requireEnv && !info.requireEnv.some((k) => envOf(s).some((e) => e.startsWith(k + "="))) && !(info.env && info.requireEnv.some((k) => k in info.env))) {
				c.status = "exited";
				c.exitCode = 1;
				c._pod._sim.logs.push(...(info.crashMsg || "exited").split("\n"));
			}
			ctx.println(` ✔ Container ${nm}   ${c.status === "running" ? "Started" : "Exited"}`);
		}
		return 0;
	}
	if (cmd === "down") {
		for (const c of [...mine()]) {
			sim.containers.splice(sim.containers.indexOf(c), 1);
			delete sim.registries[c.name];
			ctx.println(` ✔ Container ${c.name}   Removed`);
		}
		ctx.println(` ✔ Network ${net}   Removed`);
		if (flags.includes("-v") || flags.includes("--volumes")) {
			for (const k of Object.keys(sim.volumes)) if (k.startsWith(proj + "_")) {
				delete sim.volumes[k];
				ctx.println(` ✔ Volume ${k}   Removed`);
			}
		}
		return 0;
	}
	if (cmd === "stop" || cmd === "start" || cmd === "restart") {
		for (const c of mine()) {
			if (names.length && !names.includes(c.composeService)) continue;
			c.status = cmd === "stop" ? "exited" : "running";
			c.startedAt = sim.clock;
			ctx.println(` ✔ Container ${c.name}   ${cmd === "stop" ? "Stopped" : "Started"}`);
		}
		return 0;
	}
	if (cmd === "logs") {
		for (const c of mine()) {
			if (names.length && !names.includes(c.composeService)) continue;
			for (const l of PG.containerAsPod(sim, c)._sim.logs) ctx.println(`${c.name}  | ${l}`);
		}
		return 0;
	}
	if (cmd === "exec") {
		const [svc, ...cv] = names.length ? sub.slice(1).filter((a) => !a.startsWith("-")) : [];
		const c = mine().find((x) => x.composeService === svc);
		if (!c) {
			ctx.eprintln(`service "${svc}" is not running`);
			return 1;
		}
		return PG.commands.docker(ctx, [
			"exec",
			...flags,
			c.name,
			...cv
		]);
	}
	ctx.eprintln(`docker compose: "${cmd}" is not simulated (supported: up, down, ps, logs, exec, stop, start, restart, config)`);
	return 1;
};
PG.commands["compose"] = PG.commands["docker-compose"];
PG.KC_VALUE_FLAGS = /* @__PURE__ */ new Set([
	"n",
	"namespace",
	"o",
	"output",
	"l",
	"selector",
	"field-selector",
	"context",
	"as",
	"as-group",
	"f",
	"filename",
	"image",
	"replicas",
	"port",
	"type",
	"name",
	"verb",
	"resource",
	"resource-name",
	"from-literal",
	"from-file",
	"docker-server",
	"docker-username",
	"docker-password",
	"docker-email",
	"serviceaccount",
	"user",
	"group",
	"role",
	"clusterrole",
	"cpu-percent",
	"cpu",
	"min",
	"max",
	"requests",
	"limits",
	"tail",
	"container",
	"c",
	"p",
	"patch",
	"target-port",
	"cluster",
	"token",
	"client-certificate",
	"client-key",
	"kubeconfig",
	"sort-by",
	"hard",
	"L",
	"for",
	"rule",
	"class",
	"min-available",
	"max-unavailable",
	"raw",
	"target",
	"schedule",
	"env",
	"labels",
	"restart",
	"timeout",
	"to-revision",
	"duration",
	"dry-run",
	"grace-period",
	"request-timeout",
	"since",
	"cert",
	"key",
	"overrides",
	"command-name",
	"selector-label",
	"namespace-selector"
]);
PG.kcParse = (args, extraValue = [], noValue = []) => {
	const f = {};
	const pos = [];
	const bools = /* @__PURE__ */ new Set();
	let dashdash = null;
	const isVal = (k) => !noValue.includes(k) && (PG.KC_VALUE_FLAGS.has(k) || extraValue.includes(k));
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--") {
			dashdash = args.slice(i + 1);
			break;
		}
		if (a.startsWith("--")) {
			const eq = a.indexOf("=");
			if (eq > 0) {
				const k = a.slice(2, eq);
				const v = a.slice(eq + 1);
				if (f[k] !== void 0 && k !== "n") f[k] = [].concat(f[k], v);
				else f[k] = v;
			} else {
				const k = a.slice(2);
				if (isVal(k) && i + 1 < args.length) {
					const v = args[++i];
					f[k] = f[k] !== void 0 ? [].concat(f[k], v) : v;
				} else bools.add(k);
			}
			continue;
		}
		if (a.startsWith("-") && a.length > 1 && !/^-\d/.test(a)) {
			if (a.length === 2 || /^-[a-zA-Z]$/.test(a)) {
				const k = a.slice(1);
				if (isVal(k) && i + 1 < args.length) f[k] = args[++i];
				else bools.add(k);
			} else if (/^-n./.test(a)) f.n = a.slice(2);
			else if (/^-o./.test(a)) f.o = a.slice(2);
			else if (/^-(it|ti)$/.test(a)) {
				bools.add("i");
				bools.add("t");
			} else for (const ch of a.slice(1)) bools.add(ch);
			continue;
		}
		pos.push(a);
	}
	if (f.namespace) f.n = f.namespace;
	if (f.output) f.o = f.output;
	if (f.selector) f.l = f.selector;
	if (f.filename) f.f = f.filename;
	return {
		f,
		pos,
		bools,
		dd: dashdash,
		has: (k) => bools.has(k) || f[k] !== void 0
	};
};
PG.sel = (str, labels) => {
	if (!str) return true;
	labels = labels || {};
	return str.split(",").every((t) => {
		t = t.trim();
		let m;
		if (m = /^([^!=\s]+)\s*!=\s*(.+)$/.exec(t)) return labels[m[1]] !== m[2];
		if (m = /^([^=\s]+)\s*==?\s*(.+)$/.exec(t)) return labels[m[1]] === m[2];
		if (t[0] === "!") return !(t.slice(1) in labels);
		return t in labels;
	});
};
PG.getPath = (o, path) => path.split(".").filter(Boolean).reduce((a, k) => a == null ? void 0 : a[k], o);
PG.clean = (o) => JSON.parse(JSON.stringify(o, (k, v) => k.startsWith("_") ? void 0 : v));
PG.fqName = (plural, name) => {
	const k = PG.KINDS[plural];
	return `${k.kind.toLowerCase()}${k.group ? "." + k.group : ""}/${name}`;
};
PG.kcConnect = (ctx, P) => {
	const sim = ctx.sim;
	const kc = sim.kubeconfig;
	const name = P.f.context || kc.current;
	if (!name) {
		ctx.eprintln("error: current-context is not set");
		return null;
	}
	const c = sim.ctxByName(name);
	if (!c) {
		ctx.eprintln(`error: context "${name}" does not exist`);
		return null;
	}
	const ce = sim.clusterEntry(c.cluster);
	const ue = sim.userEntry(c.user);
	if (!ce) {
		ctx.eprintln(`error: cluster "${c.cluster}" does not exist`);
		return null;
	}
	const cl = sim.clusters[c.cluster];
	if (!cl || !cl.apiUp()) {
		const m = /:\/\/([^/]+)/.exec(ce.server);
		ctx.eprintln(`The connection to the server ${m ? m[1] : "localhost:8080"} was refused - did you specify the right host or port?`);
		return null;
	}
	let id = null;
	const a = ue ? ue.auth : { kind: "admin" };
	if (a.kind === "admin") id = {
		user: "kubernetes-admin",
		groups: ["system:masters", "system:authenticated"]
	};
	else if (a.kind === "token") {
		const t = sim.tokens[a.token];
		if (!t) {
			ctx.eprintln("error: You must be logged in to the server (Unauthorized)");
			return null;
		}
		if (sim.clock > t.exp) {
			ctx.eprintln("error: You must be logged in to the server (Unauthorized)");
			return null;
		}
		id = t.identity;
	} else if (a.kind === "cert") id = {
		user: a.cn,
		groups: [...a.groups || [], "system:authenticated"]
	};
	else id = {
		user: "anonymous",
		groups: ["system:unauthenticated"]
	};
	if (P.f.as) {
		if (!(id.groups || []).includes("system:masters") && !cl.authorize(id, "impersonate", "users", null)) {
			ctx.eprintln(`Error from server (Forbidden): users "${P.f.as}" is forbidden: User "${id.user}" cannot impersonate resource "users" in API group "" at the cluster scope`);
			return null;
		}
		const m = /^system:serviceaccount:([^:]+):(.+)$/.exec(P.f.as);
		id = {
			user: P.f.as,
			groups: [
				...[].concat(P.f["as-group"] || []),
				"system:authenticated",
				...m ? ["system:serviceaccounts", "system:serviceaccounts:" + m[1]] : []
			]
		};
	}
	const ns = P.f.n || c.namespace || "default";
	return {
		cl,
		id,
		ns,
		ctxName: name,
		ctxEntry: c
	};
};
PG.kcForbid = (ctx, K, plural, verb, name, ns, sub) => {
	const k = PG.KINDS[plural];
	const res = plural + (sub ? "/" + sub : "");
	const scope = k && k.ns ? `in the namespace "${ns}"` : "at the cluster scope";
	ctx.eprintln(`Error from server (Forbidden): ${res} ${name ? "\"" + name + "\" " : ""}is forbidden: User "${K.id.user}" cannot ${verb} resource "${res}" in API group "${k ? k.group : ""}" ${scope}`);
	return 1;
};
PG.kcCan = (K, verb, plural, ns, sub) => K.cl.authorize(K.id, verb, plural, PG.KINDS[plural] && !PG.KINDS[plural].ns ? null : ns, sub);
PG.nodeObj = (cl, n) => ({
	apiVersion: "v1",
	kind: "Node",
	metadata: {
		name: n.name,
		labels: n.labels,
		creationTimestamp: PG.iso(n.createdAt),
		uid: PG.hash(n.name, 24),
		_t: n.createdAt
	},
	spec: {
		...n.unschedulable ? { unschedulable: true } : {},
		...n.taints.length ? { taints: n.taints } : {},
		podCIDR: n.podCidr + "0/24"
	},
	status: {
		conditions: [{
			type: "Ready",
			status: n.ready ? "True" : "Unknown"
		}],
		addresses: [{
			type: "InternalIP",
			address: n.ip
		}, {
			type: "Hostname",
			address: n.name
		}],
		nodeInfo: {
			osImage: n.osImage,
			kubeletVersion: n.version,
			containerRuntimeVersion: n.runtime,
			architecture: "arm64",
			kernelVersion: "6.12.13-linuxkit"
		},
		capacity: {
			cpu: "6",
			memory: "11975508Ki",
			pods: "110"
		},
		allocatable: {
			cpu: "6",
			memory: "11975508Ki",
			pods: "110"
		}
	},
	_node: n
});
PG.listObjs = (cl, plural, ns, all) => {
	if (plural === "nodes") return cl.nodes.map((n) => PG.nodeObj(cl, n));
	if (plural === "endpoints") return cl.res.services.filter((s) => all || s.metadata.namespace === ns).map((s) => {
		const eps = cl.endpointsOf(s);
		return {
			apiVersion: "v1",
			kind: "Endpoints",
			metadata: {
				name: s.metadata.name,
				namespace: s.metadata.namespace,
				creationTimestamp: s.metadata.creationTimestamp,
				_t: s.metadata._t,
				labels: s.metadata.labels
			},
			subsets: eps.length ? [{
				addresses: [...new Set(eps.map((e) => e.ip))].map((ip) => ({ ip })),
				ports: [...new Set(eps.map((e) => e.port))].map((p) => ({
					port: p,
					protocol: "TCP"
				}))
			}] : [],
			_eps: eps
		};
	});
	if (plural === "events") return cl.res.events.filter((e) => all || e.ns === ns).map((e) => ({
		apiVersion: "v1",
		kind: "Event",
		metadata: {
			name: e.name + "." + PG.hex(8),
			namespace: e.ns,
			creationTimestamp: PG.iso(e.t),
			_t: e.t
		},
		type: e.type,
		reason: e.reason,
		message: e.message,
		involvedObject: {
			kind: e.kind,
			name: e.name
		},
		_e: e
	}));
	return cl.res[plural].filter((o) => all || !PG.KINDS[plural].ns || o.metadata.namespace === ns);
};
PG.ageOf = (cl, o) => PG.fmtAge(cl.clock - (o.metadata._t === void 0 ? cl.clock : o.metadata._t));
PG.podRow = (cl, p) => {
	const sm = p._sim;
	const n = p.spec.containers.length;
	const ready = p.metadata.deletionTimestamp ? 0 : sm.readyCount !== void 0 ? sm.readyCount : cl.podReady(p) ? n : 0;
	const st = cl.podStatus(p);
	return {
		ready: `${ready}/${n}`,
		status: st,
		restarts: String(sm.restarts || 0),
		age: PG.ageOf(cl, p)
	};
};
PG.portsStr = (s) => (s.spec.ports || []).map((p) => `${p.port}${p.nodePort ? ":" + p.nodePort : ""}/${p.protocol || "TCP"}`).join(",") || "<none>";
PG.extIp = (s) => {
	if (s.spec.type !== "LoadBalancer") return s.spec.type === "ExternalName" ? s.spec.externalName : "<none>";
	const l = s.status && s.status.loadBalancer;
	if (!l || !l.ingress) return "<pending>";
	return l.ingress.map((i) => i.ip).join(",");
};
PG.selStr = (sel) => sel && Object.keys(sel).length ? Object.entries(sel).map(([k, v]) => `${k}=${v}`).join(",") : "<none>";
PG.PRINT = {
	pods: {
		cols: [
			"NAME",
			"READY",
			"STATUS",
			"RESTARTS",
			"AGE"
		],
		wide: [
			"IP",
			"NODE",
			"NOMINATED NODE",
			"READINESS GATES"
		],
		row: (o, cl, w) => {
			const r = PG.podRow(cl, o);
			return [
				o.metadata.name,
				r.ready,
				r.status,
				r.restarts,
				r.age,
				...w ? [
					o.status.podIP || "<none>",
					o.spec.nodeName || "<none>",
					"<none>",
					"<none>"
				] : []
			];
		}
	},
	services: {
		cols: [
			"NAME",
			"TYPE",
			"CLUSTER-IP",
			"EXTERNAL-IP",
			"PORT(S)",
			"AGE"
		],
		wide: ["SELECTOR"],
		row: (o, cl, w) => [
			o.metadata.name,
			o.spec.type,
			o.spec.clusterIP || "<none>",
			PG.extIp(o),
			PG.portsStr(o),
			PG.ageOf(cl, o),
			...w ? [PG.selStr(o.spec.selector)] : []
		]
	},
	endpoints: {
		cols: [
			"NAME",
			"ENDPOINTS",
			"AGE"
		],
		row: (o, cl) => [
			o.metadata.name,
			o._eps.length ? [...new Set(o._eps.map((e) => e.ip + ":" + e.port))].slice(0, 3).join(",") + (new Set(o._eps.map((e) => e.ip + ":" + e.port)).size > 3 ? " + " + (new Set(o._eps.map((e) => e.ip + ":" + e.port)).size - 3) + " more..." : "") : "<none>",
			PG.ageOf(cl, o)
		]
	},
	namespaces: {
		cols: [
			"NAME",
			"STATUS",
			"AGE"
		],
		row: (o, cl) => [
			o.metadata.name,
			o._deleteAt ? "Terminating" : "Active",
			PG.ageOf(cl, o)
		]
	},
	nodes: {
		cols: [
			"NAME",
			"STATUS",
			"ROLES",
			"AGE",
			"VERSION"
		],
		wide: [
			"INTERNAL-IP",
			"EXTERNAL-IP",
			"OS-IMAGE",
			"KERNEL-VERSION",
			"CONTAINER-RUNTIME"
		],
		row: (o, cl, w) => {
			const n = o._node;
			const roles = Object.keys(n.labels).filter((k) => k.startsWith("node-role.kubernetes.io/")).map((k) => k.split("/")[1]).join(",") || "<none>";
			return [
				n.name,
				(n.ready ? "Ready" : "NotReady") + (n.unschedulable ? ",SchedulingDisabled" : ""),
				roles,
				PG.fmtAge(cl.clock - n.createdAt),
				n.version,
				...w ? [
					n.ip,
					"<none>",
					n.osImage,
					"6.12.13-linuxkit",
					n.runtime
				] : []
			];
		}
	},
	configmaps: {
		cols: [
			"NAME",
			"DATA",
			"AGE"
		],
		row: (o, cl) => [
			o.metadata.name,
			String(Object.keys(o.data || {}).length),
			PG.ageOf(cl, o)
		]
	},
	secrets: {
		cols: [
			"NAME",
			"TYPE",
			"DATA",
			"AGE"
		],
		row: (o, cl) => [
			o.metadata.name,
			o.type || "Opaque",
			String(Object.keys(o.data || {}).length + Object.keys(o.stringData || {}).length),
			PG.ageOf(cl, o)
		]
	},
	serviceaccounts: {
		cols: [
			"NAME",
			"SECRETS",
			"AGE"
		],
		row: (o, cl) => [
			o.metadata.name,
			"0",
			PG.ageOf(cl, o)
		]
	},
	persistentvolumeclaims: {
		cols: [
			"NAME",
			"STATUS",
			"VOLUME",
			"CAPACITY",
			"ACCESS MODES",
			"STORAGECLASS",
			"AGE"
		],
		row: (o, cl) => [
			o.metadata.name,
			(o.status || {}).phase || "Pending",
			"pvc-" + o.metadata.uid.slice(0, 8),
			(o.spec.resources || { requests: {} }).requests.storage || "1Gi",
			(o.spec.accessModes || ["RWO"]).map((m) => m.replace("ReadWriteOnce", "RWO")).join(","),
			o.spec.storageClassName || "standard",
			PG.ageOf(cl, o)
		]
	},
	resourcequotas: {
		cols: [
			"NAME",
			"AGE",
			"REQUEST",
			"LIMIT"
		],
		row: (o, cl) => [
			o.metadata.name,
			PG.ageOf(cl, o),
			Object.entries(o.spec.hard || {}).filter(([k]) => !k.startsWith("limits")).map(([k, v]) => `${k}: ${PG.quotaUsed(cl, o, k)}/${v}`).join(", "),
			Object.entries(o.spec.hard || {}).filter(([k]) => k.startsWith("limits")).map(([k, v]) => `${k}: 0/${v}`).join(", ")
		]
	},
	events: {
		cols: [
			"LAST SEEN",
			"TYPE",
			"REASON",
			"OBJECT",
			"MESSAGE"
		],
		row: (o, cl) => [
			PG.fmtAge(cl.clock - o._e.t),
			o.type,
			o.reason,
			o._e.kind.toLowerCase() + "/" + o._e.name,
			o.message
		]
	},
	deployments: {
		cols: [
			"NAME",
			"READY",
			"UP-TO-DATE",
			"AVAILABLE",
			"AGE"
		],
		wide: [
			"CONTAINERS",
			"IMAGES",
			"SELECTOR"
		],
		row: (o, cl, w) => {
			const s = o.status || {};
			return [
				o.metadata.name,
				`${s.readyReplicas || 0}/${o.spec.replicas === void 0 ? 1 : o.spec.replicas}`,
				String(s.updatedReplicas || 0),
				String(s.availableReplicas || 0),
				PG.ageOf(cl, o),
				...w ? [
					o.spec.template.spec.containers.map((c) => c.name).join(","),
					o.spec.template.spec.containers.map((c) => c.image).join(","),
					PG.selStr(o.spec.selector.matchLabels)
				] : []
			];
		}
	},
	replicasets: {
		cols: [
			"NAME",
			"DESIRED",
			"CURRENT",
			"READY",
			"AGE"
		],
		wide: [
			"CONTAINERS",
			"IMAGES",
			"SELECTOR"
		],
		row: (o, cl, w) => [
			o.metadata.name,
			String(o.spec.replicas),
			String(o.status.replicas || 0),
			String(o.status.readyReplicas || 0),
			PG.ageOf(cl, o),
			...w ? [
				o.spec.template.spec.containers.map((c) => c.name).join(","),
				o.spec.template.spec.containers.map((c) => c.image).join(","),
				PG.selStr(o.spec.selector.matchLabels)
			] : []
		]
	},
	daemonsets: {
		cols: [
			"NAME",
			"DESIRED",
			"CURRENT",
			"READY",
			"UP-TO-DATE",
			"AVAILABLE",
			"NODE SELECTOR",
			"AGE"
		],
		row: (o, cl) => {
			const s = o.status || {};
			return [
				o.metadata.name,
				String(s.desiredNumberScheduled || 0),
				String(s.currentNumberScheduled || 0),
				String(s.numberReady || 0),
				String(s.updatedNumberScheduled || 0),
				String(s.numberAvailable || 0),
				PG.selStr(o.spec.template.spec.nodeSelector).replace("<none>", "kubernetes.io/os=linux"),
				PG.ageOf(cl, o)
			];
		}
	},
	ingresses: {
		cols: [
			"NAME",
			"CLASS",
			"HOSTS",
			"ADDRESS",
			"PORTS",
			"AGE"
		],
		row: (o, cl) => [
			o.metadata.name,
			o.spec.ingressClassName || "<none>",
			(o.spec.rules || []).map((r) => r.host || "*").join(",") || "*",
			cl.tool === "k3d" ? cl.nodes.map((n) => n.ip).join(",") : PG.ingressNginx && PG.ingressNginx(cl) ? "localhost" : "",
			(o.spec.tls || []).length ? "80, 443" : "80",
			PG.ageOf(cl, o)
		]
	},
	networkpolicies: {
		cols: [
			"NAME",
			"POD-SELECTOR",
			"AGE"
		],
		row: (o, cl) => [
			o.metadata.name,
			PG.selStr((o.spec.podSelector || {}).matchLabels).replace("<none>", "<none>"),
			PG.ageOf(cl, o)
		]
	},
	horizontalpodautoscalers: {
		cols: [
			"NAME",
			"REFERENCE",
			"TARGETS",
			"MINPODS",
			"MAXPODS",
			"REPLICAS",
			"AGE"
		],
		row: (o, cl) => {
			const t = ((o.spec.metrics || [])[0] || { resource: { target: { averageUtilization: 80 } } }).resource.target.averageUtilization;
			const s = o.status || {};
			return [
				o.metadata.name,
				`${o.spec.scaleTargetRef.kind}/${o.spec.scaleTargetRef.name}`,
				s._util === null || s._util === void 0 ? `<unknown>/${t}%` : `${s._util}%/${t}%`,
				String(o.spec.minReplicas || 1),
				String(o.spec.maxReplicas),
				String(s.currentReplicas || 0),
				PG.ageOf(cl, o)
			];
		}
	},
	poddisruptionbudgets: {
		cols: [
			"NAME",
			"MIN AVAILABLE",
			"MAX UNAVAILABLE",
			"ALLOWED DISRUPTIONS",
			"AGE"
		],
		row: (o, cl) => {
			const pods = cl.matchPods(o.metadata.namespace, o.spec.selector).filter((p) => cl.podReady(p)).length;
			const allowed = o.spec.minAvailable !== void 0 ? Math.max(0, pods - o.spec.minAvailable) : Math.max(0, o.spec.maxUnavailable || 1);
			return [
				o.metadata.name,
				o.spec.minAvailable === void 0 ? "N/A" : String(o.spec.minAvailable),
				o.spec.maxUnavailable === void 0 ? "N/A" : String(o.spec.maxUnavailable),
				String(allowed),
				PG.ageOf(cl, o)
			];
		}
	},
	jobs: {
		cols: [
			"NAME",
			"STATUS",
			"COMPLETIONS",
			"DURATION",
			"AGE"
		],
		row: (o, cl) => [
			o.metadata.name,
			o.status.succeeded ? "Complete" : "Running",
			`${o.status.succeeded || 0}/1`,
			o.status.succeeded ? PG.fmtAge(o._dur || 1) : PG.fmtAge(cl.clock - (o._started || o.metadata._t)),
			PG.ageOf(cl, o)
		]
	},
	cronjobs: {
		cols: [
			"NAME",
			"SCHEDULE",
			"TIMEZONE",
			"SUSPEND",
			"ACTIVE",
			"LAST SCHEDULE",
			"AGE"
		],
		row: (o, cl) => [
			o.metadata.name,
			o.spec.schedule,
			"<none>",
			String(!!o.spec.suspend),
			"0",
			o.status && o.status.lastScheduleTime ? "1m" : "<none>",
			PG.ageOf(cl, o)
		]
	},
	roles: {
		cols: ["NAME", "CREATED AT"],
		row: (o) => [o.metadata.name, o.metadata.creationTimestamp]
	},
	clusterroles: {
		cols: ["NAME", "CREATED AT"],
		row: (o) => [o.metadata.name, o.metadata.creationTimestamp]
	},
	rolebindings: {
		cols: [
			"NAME",
			"ROLE",
			"AGE"
		],
		wide: [
			"USERS",
			"GROUPS",
			"SERVICEACCOUNTS"
		],
		row: (o, cl, w) => [
			o.metadata.name,
			`${o.roleRef.kind}/${o.roleRef.name}`,
			PG.ageOf(cl, o),
			...w ? [
				(o.subjects || []).filter((s) => s.kind === "User").map((s) => s.name).join(","),
				(o.subjects || []).filter((s) => s.kind === "Group").map((s) => s.name).join(","),
				(o.subjects || []).filter((s) => s.kind === "ServiceAccount").map((s) => (s.namespace || "") + "/" + s.name).join(",")
			] : []
		]
	},
	clusterrolebindings: {
		cols: [
			"NAME",
			"ROLE",
			"AGE"
		],
		wide: [
			"USERS",
			"GROUPS",
			"SERVICEACCOUNTS"
		],
		row: (o, cl, w) => [
			o.metadata.name,
			`${o.roleRef.kind}/${o.roleRef.name}`,
			PG.ageOf(cl, o),
			...w ? [
				(o.subjects || []).filter((s) => s.kind === "User").map((s) => s.name).join(","),
				(o.subjects || []).filter((s) => s.kind === "Group").map((s) => s.name).join(","),
				(o.subjects || []).filter((s) => s.kind === "ServiceAccount").map((s) => (s.namespace || "") + "/" + s.name).join(",")
			] : []
		]
	},
	certificatesigningrequests: {
		cols: [
			"NAME",
			"AGE",
			"SIGNERNAME",
			"REQUESTOR",
			"REQUESTEDDURATION",
			"CONDITION"
		],
		row: (o, cl) => [
			o.metadata.name,
			PG.ageOf(cl, o),
			o.spec.signerName,
			"kubernetes-admin",
			o.spec.expirationSeconds ? PG.fmtAge(o.spec.expirationSeconds) : "<none>",
			o.status && o.status.conditions && o.status.conditions[0] ? "Approved,Issued" : "Pending"
		]
	},
	leases: {
		cols: [
			"NAME",
			"HOLDER",
			"AGE"
		],
		row: (o, cl) => [
			o.metadata.name,
			o.spec.holderIdentity,
			PG.ageOf(cl, o)
		]
	}
};
PG.quotaUsed = (cl, q, k) => k === "pods" ? cl.res.pods.filter((p) => p.metadata.namespace === q.metadata.namespace && p.status.phase !== "Succeeded" && !p.metadata.deletionTimestamp).length : 0;
PG.renderTable = (cl, plural, objs, o) => {
	const P = PG.PRINT[plural];
	const wide = o.wide;
	const all = o.all;
	const showLabels = o.showLabels;
	const header = [
		...all && PG.KINDS[plural].ns ? ["NAMESPACE"] : [],
		...P.cols,
		...wide && P.wide ? P.wide : [],
		...showLabels ? ["LABELS"] : []
	];
	const rows = objs.map((x) => [
		...all && PG.KINDS[plural].ns ? [x.metadata.namespace] : [],
		...P.row(x, cl, wide),
		...showLabels ? [Object.entries(x.metadata.labels || {}).map(([k, v]) => `${k}=${v}`).join(",") || "<none>"] : []
	]);
	return {
		header,
		rows,
		text: (o.noHeaders ? "" : "") + (o.noHeaders ? rows.map((r) => r.join("   ")).join("\n") : PG.table(rows, header))
	};
};
PG.jsonPath = (tmpl, root) => {
	const evalPath = (obj, path) => {
		let cur = [obj];
		const tokens = path.replace(/^\./, ".").match(/\.[^.\[\]]+|\[[^\]]+\]/g) || [];
		for (const t of tokens) cur = cur.flatMap((c) => {
			if (c == null) return [];
			if (t[0] === ".") return [c[t.slice(1)]];
			const inner = t.slice(1, -1);
			if (inner === "*") return Array.isArray(c) ? c : Object.values(c);
			if (/^\d+$/.test(inner)) return [c[Number(inner)]];
			return [c[inner.replace(/^'|'$/g, "")]];
		});
		return cur;
	};
	const str = (v) => v === void 0 || v === null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
	const parts = [];
	const re = /\{([^}]*)\}/g;
	let last = 0;
	let m;
	while (m = re.exec(tmpl)) {
		if (m.index > last) parts.push({
			t: "lit",
			v: tmpl.slice(last, m.index)
		});
		parts.push({
			t: "x",
			v: m[1].trim()
		});
		last = re.lastIndex;
	}
	if (last < tmpl.length) parts.push({
		t: "lit",
		v: tmpl.slice(last)
	});
	const run = (ps, obj) => {
		let s = "";
		for (let k = 0; k < ps.length; k++) {
			const p = ps[k];
			if (p.t === "lit") s += p.v.replace(/\\n/g, "\n").replace(/\\t/g, "	");
			else if (p.v.startsWith("range ")) {
				let depth = 1, j = k + 1;
				while (j < ps.length) {
					if (ps[j].t === "x" && ps[j].v.startsWith("range ")) depth++;
					if (ps[j].t === "x" && ps[j].v === "end") depth--;
					if (!depth) break;
					j++;
				}
				const items = evalPath(obj, p.v.slice(6).trim());
				for (const it of items) s += run(ps.slice(k + 1, j), it);
				k = j;
			} else if (/^"[^"]*"$/.test(p.v)) s += JSON.parse(p.v);
			else s += evalPath(obj, p.v).map(str).join(" ");
		}
		return s;
	};
	return run(parts, root);
};
PG.outputObjs = (ctx, cl, plural, objs, o, single) => {
	const fmt = o.out;
	const cleaned = objs.map((x) => PG.cleanForOutput(cl, plural, x));
	if (fmt === "yaml") {
		if (single) ctx.out(PG.yaml.dump(cleaned[0]));
		else ctx.out(PG.yaml.dump({
			apiVersion: "v1",
			kind: "List",
			items: cleaned,
			metadata: { resourceVersion: "" }
		}));
		return true;
	}
	if (fmt === "json") {
		ctx.println(JSON.stringify(single ? cleaned[0] : {
			apiVersion: "v1",
			kind: "List",
			items: cleaned,
			metadata: { resourceVersion: "" }
		}, null, 2));
		return true;
	}
	if (fmt === "name") {
		ctx.println(cleaned.map((x) => PG.fqName(plural, x.metadata.name)).join("\n"));
		return true;
	}
	if (/^jsonpath=/.test(fmt)) {
		const t = fmt.replace(/^jsonpath=/, "").replace(/^['"]|['"]$/g, "");
		ctx.out(PG.jsonPath(t, single ? cleaned[0] : { items: cleaned }));
		return true;
	}
	return false;
};
PG.cleanForOutput = (cl, plural, x) => {
	const c = PG.clean(x);
	if (plural === "pods") {
		const p = x;
		const ready = cl.podReady(p);
		const cst = p._sim.cs || [];
		c.status = {
			...c.status || {},
			phase: p.status.phase,
			conditions: [{
				type: "Initialized",
				status: !(p.spec.initContainers || []).length || ["running", "done"].includes(p._sim.stage) ? "True" : "False"
			}, {
				type: "Ready",
				status: ready ? "True" : "False"
			}],
			containerStatuses: p.spec.containers.map((co, i) => ({
				name: co.name,
				image: co.image,
				ready: cst[i] ? !!cst[i].ready : ready,
				restartCount: cst[i] ? cst[i].restarts : p._sim.restarts || 0,
				state: (cst[i] ? cst[i].status === "Running" : ready) ? { running: { startedAt: p.status.startTime } } : { waiting: { reason: cst[i] ? cst[i].status : cl.podStatus(p) } }
			})),
			qosClass: "BestEffort"
		};
	}
	if (plural === "secrets" && c.stringData) {
		c.data = {
			...c.data || {},
			...Object.fromEntries(Object.entries(c.stringData).map(([k, v]) => [k, PG.b64(String(v))]))
		};
		delete c.stringData;
	}
	delete c.metadata._t;
	return c;
};
PG.KV = {};
var KV = PG.KV;
PG.parseTargets = (tokens) => {
	const out = [];
	if (!tokens.length) return out;
	if (tokens[0].includes("/")) {
		for (const t of tokens) {
			const [ty, nm] = t.split("/");
			out.push({
				plural: PG.resolveKind(ty),
				type: ty,
				name: nm
			});
		}
		return out;
	}
	const types = tokens[0].split(",");
	const names = tokens.slice(1);
	if (types.length === 1 && names.length) {
		for (const n of names) out.push({
			plural: PG.resolveKind(types[0]),
			type: types[0],
			name: n
		});
		return out;
	}
	for (const t of types) out.push({
		plural: PG.resolveKind(t),
		type: t,
		name: null
	});
	return out;
};
PG.fieldSel = (sel, plural, o) => {
	if (!sel) return true;
	return sel.split(",").every((t) => {
		const m = /^([\w.]+)\s*(!=|==?)\s*(.*)$/.exec(t);
		if (!m) return true;
		let v;
		if (m[1] === "status.phase") v = o.status && o.status.phase || "Pending";
		else v = PG.getPath(o, m[1]);
		const eq = String(v === void 0 ? "" : v) === m[3];
		return m[2] === "!=" ? !eq : eq;
	});
};
PG.needNs = (ctx, K, ns) => {
	if (!K.cl.find("namespaces", ns)) {
		ctx.eprintln(`Error from server (NotFound): namespaces "${ns}" not found`);
		return false;
	}
	return true;
};
PG.psa = (cl, ns, spec) => {
	const nso = cl.find("namespaces", ns);
	const lab = nso && nso.metadata.labels || {};
	const out = {
		enforce: null,
		warn: null
	};
	const chk = (level) => {
		const v = [];
		const cs = spec.containers || [];
		for (const c of cs) if ((c.securityContext || {}).privileged) v.push(`privileged (container "${c.name}" must not set securityContext.privileged=true)`);
		if (spec.hostNetwork || spec.hostPID || spec.hostIPC) v.push(`host namespaces (${spec.hostNetwork ? "hostNetwork=true" : spec.hostPID ? "hostPID=true" : "hostIPC=true"})`);
		if ((spec.volumes || []).some((x) => x.hostPath)) v.push("hostPath volumes (volume \"" + spec.volumes.find((x) => x.hostPath).name + "\")");
		if (level === "restricted") {
			const nm = cs.map((c) => `"${c.name}"`).join(", ");
			if (cs.some((c) => !(c.securityContext || {}).allowPrivilegeEscalation === false || (c.securityContext || {}).allowPrivilegeEscalation !== false)) v.push(`allowPrivilegeEscalation != false (container${cs.length > 1 ? "s" : ""} ${nm} must set securityContext.allowPrivilegeEscalation=false)`);
			if (cs.some((c) => !((c.securityContext || {}).capabilities || {}).drop)) v.push(`unrestricted capabilities (container${cs.length > 1 ? "s" : ""} ${nm} must set securityContext.capabilities.drop=["ALL"])`);
			if (cs.some((c) => !(c.securityContext || {}).runAsNonRoot && !(spec.securityContext || {}).runAsNonRoot)) v.push(`runAsNonRoot != true (pod or container${cs.length > 1 ? "s" : ""} ${nm} must set securityContext.runAsNonRoot=true)`);
			if (cs.some((c) => !(c.securityContext || {}).seccompProfile && !(spec.securityContext || {}).seccompProfile)) v.push(`seccompProfile (pod or container${cs.length > 1 ? "s" : ""} ${nm} must set securityContext.seccompProfile.type to "RuntimeDefault" or "Localhost")`);
		}
		return v;
	};
	const e = lab["pod-security.kubernetes.io/enforce"];
	const w = lab["pod-security.kubernetes.io/warn"];
	if (e && e !== "privileged") {
		const v = chk(e);
		if (v.length) out.enforce = `violates PodSecurity "${e}:latest": ${v.join(", ")}`;
	}
	if (w && w !== "privileged") {
		const v = chk(w);
		if (v.length) out.warn = `would violate PodSecurity "${w}:latest": ${v.join(", ")}`;
	}
	return out;
};
PG.Cluster.prototype.admitPod = function(ns, spec, podName) {
	const sa = spec.serviceAccountName || "default";
	if (!this.find("serviceaccounts", sa, ns)) return `pods "${podName}" is forbidden: error looking up service account ${ns}/${sa}: serviceaccount "${sa}" not found`;
	const p = PG.psa(this, ns, spec);
	if (p.enforce) return `pods "${podName}" is forbidden: ${p.enforce}`;
	for (const q of this.res.resourcequotas.filter((q) => q.metadata.namespace === ns)) {
		const h = (q.spec.hard || {}).pods;
		if (h !== void 0) {
			const used = PG.quotaUsed(this, q, "pods");
			if (used >= Number(h)) return `pods "${podName}" is forbidden: exceeded quota: ${q.metadata.name}, requested: pods=1, used: pods=${used}, limited: pods=${h}`;
		}
	}
	return null;
};
PG.mkObject = (ctx, K, doc, ns, mode) => {
	const cl = K.cl;
	const plural = PG.KIND_OF[doc.kind];
	const src = ctx.src || "STDIN";
	if (!plural || PG.KINDS[plural].virtual) return { err: `error: resource mapping not found for name: "${(doc.metadata || {}).name || ""}" namespace: "" from "${src}": no matches for kind "${doc.kind}" in version "${doc.apiVersion}"\nensure CRDs are installed first` };
	const kd = PG.KINDS[plural];
	const meta = doc.metadata || {};
	const name = meta.name;
	if (!name) return { err: `error: error validating "${src}": error validating data: [metadata.name: Required value]; if you choose to ignore these errors, turn validation off with --validate=false` };
	const nsx = kd.ns ? meta.namespace || ns : null;
	if (kd.ns && !cl.find("namespaces", nsx)) return { err: `Error from server (NotFound): error when creating "${src}": namespaces "${nsx}" not found` };
	const existing = cl.find(plural, name, nsx);
	if (existing && mode === "create") return { err: `Error from server (AlreadyExists): error when creating "${src}": ${plural} "${name}" already exists` };
	const body = {};
	for (const [k, v] of Object.entries(doc)) if (![
		"apiVersion",
		"kind",
		"metadata",
		"status"
	].includes(k)) body[k] = PG.clone(v);
	const labels = PG.clone(meta.labels || {});
	const annotations = PG.clone(meta.annotations || {});
	if (plural === "deployments") {
		if (!doc.spec || !doc.spec.selector || !doc.spec.selector.matchLabels) return { err: `The Deployment "${name}" is invalid: spec.selector: Required value` };
		if (!doc.spec.template || !PG.selMatch(doc.spec.selector, (doc.spec.template.metadata || {}).labels)) return { err: `The Deployment "${name}" is invalid: spec.template.metadata.labels: Invalid value: map[string]string{...}: \`selector\` does not match template \`labels\`` };
		body.spec.template.metadata = body.spec.template.metadata || {};
		if (body.spec.replicas === void 0) body.spec.replicas = 1;
		if (existing && JSON.stringify(existing.spec.selector) !== JSON.stringify(body.spec.selector)) return { err: `The Deployment "${name}" is invalid: spec.selector: Invalid value: v1.LabelSelector{MatchLabels:map[string]string{...}}: field is immutable` };
	}
	if (plural === "rolebindings" || plural === "clusterrolebindings") {
		if (existing && JSON.stringify(existing.roleRef) !== JSON.stringify(body.roleRef)) return { err: `The ${kd.kind} "${name}" is invalid: roleRef: Invalid value: rbac.RoleRef{...}: cannot change roleRef` };
		if (!body.roleRef) return { err: `The ${kd.kind} "${name}" is invalid: roleRef.kind: Unsupported value` };
	}
	if (plural === "pods") {
		const a = cl.admitPod(nsx, body.spec || {}, name);
		if (a) return { err: `Error from server (Forbidden): error when creating "${src}": ${a}` };
	}
	if (existing) {
		const before = JSON.stringify({
			l: existing.metadata.labels,
			a: existing.metadata.annotations,
			b: Object.fromEntries(Object.entries(existing).filter(([k]) => ![
				"apiVersion",
				"kind",
				"metadata",
				"status"
			].includes(k) && !k.startsWith("_")))
		});
		if (plural === "services") {
			const old = existing.spec;
			for (const p of body.spec.ports || []) {
				const op = (old.ports || []).find((x) => x.port === p.port);
				if (op && !p.nodePort) p.nodePort = op.nodePort;
			}
			body.spec.clusterIP = body.spec.clusterIP || old.clusterIP;
		}
		if (plural === "pods") return { err: `The Pod "${name}" is invalid: spec: Forbidden: pod updates may not change fields other than \`spec.containers[*].image\`, \`spec.initContainers[*].image\`, \`spec.activeDeadlineSeconds\`, \`spec.tolerations\` (only additions to existing tolerations) or \`spec.terminationGracePeriodSeconds\` (allow it to be set to 1 if it was previously negative)` };
		existing.metadata.labels = Object.keys(labels).length ? labels : void 0;
		existing.metadata.annotations = Object.keys(annotations).length ? { ...annotations } : void 0;
		for (const [k, v] of Object.entries(body)) existing[k] = v;
		if (plural === "services") cl.normalizeService(existing);
		return {
			ok: true,
			plural,
			name,
			verb: before === JSON.stringify({
				l: existing.metadata.labels,
				a: existing.metadata.annotations,
				b: Object.fromEntries(Object.entries(existing).filter(([k]) => ![
					"apiVersion",
					"kind",
					"metadata",
					"status"
				].includes(k) && !k.startsWith("_")))
			}) ? "unchanged" : "configured",
			obj: existing
		};
	}
	let obj;
	if (plural === "namespaces") {
		obj = cl.addNamespace(name);
		obj.metadata.labels = {
			"kubernetes.io/metadata.name": name,
			...labels
		};
		if (Object.keys(annotations).length) obj.metadata.annotations = annotations;
	} else if (plural === "pods") obj = cl.newPod(nsx, name, labels, body.spec, null, { annotations });
	else {
		obj = cl.mk(plural, name, nsx, {
			metadata: {
				labels,
				annotations
			},
			...body
		});
		if (plural === "services") cl.normalizeService(obj);
		if (plural === "secrets") obj.type = obj.type || "Opaque";
		if (plural === "horizontalpodautoscalers") obj.status = {};
		if (plural === "jobs") obj.status = {};
		if (plural === "certificatesigningrequests") obj.status = {};
		if (plural === "persistentvolumeclaims") obj.status = { phase: "Pending" };
		if (plural === "deployments" || plural === "daemonsets") obj.status = {};
	}
	const warn = plural === "pods" || plural === "deployments" ? PG.psa(cl, nsx, plural === "pods" ? body.spec : body.spec.template.spec).warn : null;
	return {
		ok: true,
		plural,
		name,
		verb: "created",
		obj,
		warn
	};
};
PG.readManifest = (ctx, P) => {
	const f = P.f.f;
	if (!f) return { err: "error: must specify one of -f and -k" };
	let text;
	if (f === "-") text = ctx.stdin;
	else {
		text = ctx.fs.read(ctx.resolve(f));
		if (text === void 0) return { err: `error: the path "${f}" does not exist` };
	}
	if (text === null || text === void 0 || !text.trim()) return { err: "error: no objects passed to apply" };
	let docs;
	try {
		docs = PG.yaml.parseDocs(text);
	} catch (e) {
		return { err: `error: error parsing ${f === "-" ? "STDIN" : f}: ${e.message}` };
	}
	const flat = [];
	for (const d of docs) if (d && d.kind === "List") flat.push(...d.items || []);
	else if (d && PG.isObj(d)) flat.push(d);
	else if (d !== void 0) return { err: `error: error parsing ${f === "-" ? "STDIN" : f}: error converting YAML to JSON: yaml: line 1: did not find expected key` };
	return {
		docs: flat,
		src: f === "-" ? "STDIN" : f
	};
};
KV.apply = async (ctx, K, P, mode = "apply") => {
	if (/^https?:\/\//.test(P.f.f || "")) {
		const url = P.f.f;
		const cl = K.cl;
		if (/metrics-server/.test(url)) {
			if (cl.find("deployments", "metrics-server", "kube-system")) {
				ctx.println("serviceaccount/metrics-server unchanged\ndeployment.apps/metrics-server unchanged");
				return 0;
			}
			for (const l of [
				"serviceaccount/metrics-server",
				"clusterrole.rbac.authorization.k8s.io/system:metrics-server",
				"service/metrics-server"
			]) ctx.println(l + " created");
			cl.systemDeployment("kube-system", "metrics-server", "registry.k8s.io/metrics-server/metrics-server:v0.7.2", 1, { "k8s-app": "metrics-server" });
			ctx.println("deployment.apps/metrics-server created");
			return 0;
		}
		if (/ingress-nginx/.test(url)) {
			if (cl.find("deployments", "ingress-nginx-controller", "ingress-nginx")) {
				ctx.println("deployment.apps/ingress-nginx-controller unchanged");
				return 0;
			}
			cl.addNamespace("ingress-nginx");
			cl.systemDeployment("ingress-nginx", "ingress-nginx-controller", "registry.k8s.io/ingress-nginx/controller:v1.12.0", 1, { "app.kubernetes.io/name": "ingress-nginx" });
			const sv = cl.mk("services", "ingress-nginx-controller", "ingress-nginx", {
				metadata: { labels: { "app.kubernetes.io/name": "ingress-nginx" } },
				spec: {
					type: "NodePort",
					selector: { "app.kubernetes.io/name": "ingress-nginx" },
					ports: [{
						name: "http",
						port: 80,
						targetPort: 80
					}, {
						name: "https",
						port: 443,
						targetPort: 443
					}]
				},
				status: {}
			});
			cl.normalizeService(sv);
			ctx.println("namespace/ingress-nginx created\nserviceaccount/ingress-nginx created\nservice/ingress-nginx-controller created\ndeployment.apps/ingress-nginx-controller created\ningressclass.networking.k8s.io/nginx created");
			return 0;
		}
		if (/gateway-api/.test(url)) {
			ctx.println("customresourcedefinition.apiextensions.k8s.io/gateways.gateway.networking.k8s.io created\ncustomresourcedefinition.apiextensions.k8s.io/httproutes.gateway.networking.k8s.io created (simulated: CRDs are not modelled)");
			return 0;
		}
		ctx.eprintln(`error: unable to read URL "${url}", server reported 404 Not Found, status code=404 (the playground has no internet; known URLs: metrics-server components.yaml, ingress-nginx deploy.yaml)`);
		return 1;
	}
	const m = PG.readManifest(ctx, P);
	if (m.err) {
		ctx.eprintln(m.err);
		return 1;
	}
	ctx.src = m.src;
	let code = 0;
	if (P.f["dry-run"] || P.has("dry-run")) {
		if (P.f.o === "yaml") {
			ctx.out(m.docs.map((d) => PG.yaml.dump(d)).join("---\n"));
			return 0;
		}
		for (const d of m.docs) ctx.println(`${PG.fqName(PG.KIND_OF[d.kind] || "pods", (d.metadata || {}).name)} created (dry run)`);
		return 0;
	}
	for (const d of m.docs) {
		const plural = PG.KIND_OF[d.kind];
		const ns = (d.metadata || {}).namespace || K.ns;
		if (plural) {
			const verb = K.cl.find(plural, (d.metadata || {}).name, ns) ? mode === "create" ? "create" : "patch" : "create";
			if (!PG.kcCan(K, verb, plural, ns)) {
				PG.kcForbid(ctx, K, plural, verb, (d.metadata || {}).name, ns);
				code = 1;
				continue;
			}
		}
		const r = PG.mkObject(ctx, K, d, K.ns, mode);
		if (r.err) {
			ctx.eprintln(r.err);
			code = 1;
			continue;
		}
		if (r.warn) ctx.eprintln(`Warning: ${r.warn}`);
		ctx.println(`${PG.fqName(r.plural, r.name)} ${r.verb}`);
	}
	return code;
};
KV.get = async (ctx, K, P) => {
	const tokens = P.pos.slice(1);
	if (!tokens.length) {
		ctx.eprintln("You must specify the type of resource to get. Use \"kubectl api-resources\" for a complete list of supported resources.");
		return 1;
	}
	const cl = K.cl;
	const all = P.has("A") || P.has("all-namespaces");
	const out = P.f.o;
	const o = {
		wide: out === "wide",
		all,
		showLabels: P.has("show-labels"),
		noHeaders: P.has("no-headers"),
		out
	};
	let targets;
	if (tokens[0] === "all") targets = [
		"pods",
		"services",
		"daemonsets",
		"deployments",
		"replicasets",
		"horizontalpodautoscalers",
		"jobs",
		"cronjobs"
	].map((p) => ({
		plural: p,
		name: null,
		prefix: true
	}));
	else targets = PG.parseTargets(tokens);
	for (const t of targets) if (!t.plural) {
		ctx.eprintln(`error: the server doesn't have a resource type "${t.type}"`);
		if (/^clusters?$/.test(t.type)) ctx.info("(a cluster is not a Kubernetes object, so kubectl cannot delete it. Use: kind delete cluster --name NAME · k3d cluster delete NAME · gcloud container clusters delete NAME --zone ZONE --quiet)");
		return 1;
	}
	const multi = targets.length > 1 || tokens[0] === "all";
	const collected = [];
	let code = 0;
	for (const t of targets) {
		const verb = t.name ? "get" : "list";
		if (!PG.kcCan(K, verb, t.plural, K.ns)) {
			PG.kcForbid(ctx, K, t.plural, verb, t.name, K.ns);
			return 1;
		}
		let objs = PG.listObjs(cl, t.plural, K.ns, all && PG.KINDS[t.plural].ns);
		if (t.name) {
			objs = objs.filter((x) => x.metadata.name === t.name);
			if (!objs.length) {
				ctx.eprintln(`Error from server (NotFound): ${t.plural} "${t.name}" not found`);
				code = 1;
				continue;
			}
		}
		if (P.f.l) objs = objs.filter((x) => PG.sel(P.f.l, x.metadata.labels));
		if (P.f["field-selector"]) objs = objs.filter((x) => PG.fieldSel(P.f["field-selector"], t.plural, x));
		if (t.plural === "events" && P.f["sort-by"]) objs.sort((a, b) => a._e.t - b._e.t);
		collected.push({
			t,
			objs
		});
	}
	if (out && out !== "wide" && !/^custom/.test(out)) {
		const flat = collected.flatMap((c) => c.objs.map((x) => ({
			p: c.t.plural,
			x
		})));
		if (collected.length === 1) {
			if (!flat.length && !collected[0].t.name) {
				ctx.eprintln(`No resources found${PG.KINDS[collected[0].t.plural].ns && !all ? " in " + K.ns + " namespace" : ""}.`);
				return code;
			}
			PG.outputObjs(ctx, cl, collected[0].t.plural, collected[0].objs, o, !!collected[0].t.name);
		} else for (const f of flat) PG.outputObjs(ctx, cl, f.p, [f.x], o, true);
		return code;
	}
	let printed = false;
	for (const { t, objs } of collected) {
		if (!objs.length) {
			if (!multi) ctx.eprintln(`No resources found${PG.KINDS[t.plural].ns && !all ? " in " + K.ns + " namespace" : ""}.`);
			continue;
		}
		const tb = PG.renderTable(cl, t.plural, objs, o);
		let text = tb.text;
		if (multi) {
			text.split("\n");
			const kn = PG.KINDS[t.plural].kind.toLowerCase() + (PG.KINDS[t.plural].group ? "." + PG.KINDS[t.plural].group : "");
			const ni = all && PG.KINDS[t.plural].ns ? 1 : 0;
			const rows = tb.rows.map((r) => {
				const c = [...r];
				c[ni] = kn + "/" + c[ni];
				return c;
			});
			text = PG.table(rows, tb.header);
		}
		if (printed) ctx.println("");
		ctx.println(text);
		printed = true;
	}
	if (P.has("w") || P.has("watch")) {
		const t = collected[0].t;
		const seen = /* @__PURE__ */ new Map();
		const rowOf = (x) => PG.renderTable(cl, t.plural, [x], { ...o }).rows[0];
		for (const x of collected[0].objs) seen.set(x.metadata.namespace + "/" + x.metadata.name, rowOf(x).join("|"));
		const tb0 = PG.renderTable(cl, t.plural, collected[0].objs, o);
		const w = tb0.header.map((h, i) => Math.max(h.length, ...tb0.rows.map((r) => String(r[i]).length)) + 3);
		while (true) {
			await ctx.sleep(1);
			let objs = PG.listObjs(cl, t.plural, K.ns, all);
			if (t.name) objs = objs.filter((x) => x.metadata.name === t.name);
			if (P.f.l) objs = objs.filter((x) => PG.sel(P.f.l, x.metadata.labels));
			for (const x of objs) {
				const key = x.metadata.namespace + "/" + x.metadata.name;
				const r = rowOf(x);
				const s = r.join("|");
				const prev = seen.get(key);
				r.map((c, i) => i === 4 && t.plural === "pods" ? "" : c).join("|");
				if (prev === void 0 || prev.split("|").slice(0, -1).join("|") !== s.split("|").slice(0, -1).join("|")) {
					seen.set(key, s);
					ctx.println(r.map((c, i) => {
						if (i === r.length - 1) return c;
						w[i] = Math.max(w[i] || 0, String(c).length + 3);
						return PG.pad(c, w[i]);
					}).join(""));
				}
			}
			for (const k of [...seen.keys()]) if (!objs.find((x) => x.metadata.namespace + "/" + x.metadata.name === k)) seen.delete(k);
		}
	}
	return code;
};
PG.evFrom = (e) => /^(Scheduled|FailedScheduling)$/.test(e.reason) ? "default-scheduler" : e.reason === "ScalingReplicaSet" ? "deployment-controller" : e.reason === "SuccessfulRescale" ? "horizontal-pod-autoscaler" : e.reason === "FailedCreate" ? "replicaset-controller" : "kubelet";
PG.evTable = (cl, kind, name, ns) => {
	const ev = cl.res.events.filter((e) => e.kind === kind && e.name === name && (!ns || e.ns === ns)).slice(-12);
	if (!ev.length) return "Events:                <none>";
	return "Events:\n" + PG.table(ev.map((e) => [
		e.type,
		e.reason,
		e.count > 1 ? `${PG.fmtAge(cl.clock - e.lastT)} (x${e.count} over ${PG.fmtAge(cl.clock - e.t)})` : PG.fmtAge(cl.clock - e.t),
		PG.evFrom(e),
		e.message
	]).map((r) => [
		"  " + r[0],
		r[1],
		r[2],
		r[3],
		r[4]
	]), [
		"  Type",
		"Reason",
		"Age",
		"From",
		"Message"
	]);
};
PG.kvLines = (m, indent) => {
	const e = Object.entries(m || {});
	if (!e.length) return "<none>";
	return e.map(([k, v], i) => (i ? indent : "") + k + "=" + v).join("\n");
};
PG.probeStr = (kind, pr) => {
	const t = pr.httpGet ? `http-get http://:${pr.httpGet.port}${pr.httpGet.path || "/"}` : pr.tcpSocket ? `tcp-socket :${pr.tcpSocket.port}` : `exec [${(pr.exec.command || []).join(" ")}]`;
	return `    ${kind}:`.padEnd(18) + `${t} delay=${pr.initialDelaySeconds || 0}s timeout=${pr.timeoutSeconds || 1}s period=${pr.periodSeconds || 10}s #success=${pr.successThreshold || 1} #failure=${pr.failureThreshold || 3}`;
};
PG.DESC = {
	pods: (cl, p) => {
		const sm = p._sim;
		const node = cl.nodeByName(p.spec.nodeName);
		const st = cl.podStatus(p);
		const own = p.metadata._owner;
		const inits = p.spec.initContainers || [];
		const block = (c, idx, isInit) => {
			const cs = isInit ? null : sm.cs && sm.cs[idx];
			let state, ready, last = "", restarts = isInit ? sm.initRestarts || 0 : cs ? cs.restarts : idx === 0 ? sm.restarts || 0 : 0;
			if (isInit) {
				const done = sm.initIdx !== void 0 ? idx < sm.initIdx : ["running", "done"].includes(sm.stage);
				const cur = sm.stage === "init" && idx === sm.initIdx;
				state = done ? "Terminated\n      Reason:       Completed\n      Exit Code:    0" : cur ? /Err|CrashLoop/.test(st) ? `Waiting\n      Reason:       ${st.replace("Init:", "")}` : `Running\n      Started:      ${p.status.startTime}` : `Waiting\n      Reason:       ${sm.stage === "pulling" || sm.stage === "scheduled" ? st.replace("Init:", "") : "PodInitializing"}`;
				ready = done;
			} else if (!cs) {
				state = `Waiting\n      Reason:       ${st === "Pending" ? "PodInitializing" : st}`;
				ready = false;
			} else {
				state = cs.status === "Running" ? `Running\n      Started:      ${p.status.startTime}` : cs.done && cs.ok ? "Terminated\n      Reason:       Completed\n      Exit Code:    0" : `Waiting\n      Reason:       ${cs.status === "OOMKilled" ? "CrashLoopBackOff" : cs.status}`;
				ready = cs.ready;
				if (cs.last && cs.restarts) last = `    Last State:     Terminated\n      Reason:       ${cs.last.reason}\n      Exit Code:    ${cs.last.exitCode}\n`;
			}
			const res = c.resources || {};
			const resTxt = res.limits || res.requests ? [res.limits ? "    Limits:\n      " + Object.entries(res.limits).map(([k, v]) => k + ": " + v).join("\n      ") : "", res.requests ? "    Requests:\n      " + Object.entries(res.requests).map(([k, v]) => k + ": " + v).join("\n      ") : ""].filter(Boolean).join("\n") + "\n" : "";
			const probes = [
				c.livenessProbe && PG.probeStr("Liveness", c.livenessProbe),
				c.readinessProbe && PG.probeStr("Readiness", c.readinessProbe),
				c.startupProbe && PG.probeStr("Startup", c.startupProbe)
			].filter(Boolean).join("\n");
			const argv = [...c.command || [], ...c.args || []];
			return `  ${c.name}:\n    Container ID:   containerd://${PG.hash(p.metadata.name + c.name, 40)}\n    Image:          ${c.image}\n    Image ID:       docker.io/library/${c.image.split(":")[0]}@sha256:${PG.hash(c.image, 40)}\n    Port:           ${(c.ports || []).map((x) => x.containerPort + "/TCP").join(", ") || "<none>"}\n${argv.length ? "    Command:\n      " + argv.join("\n      ") + "\n" : ""}    State:          ${state}\n${last}    Ready:          ${ready ? "True" : "False"}\n    Restart Count:  ${restarts}\n${resTxt}${probes ? probes + "\n" : ""}    Environment:    ${(c.env || []).length || (c.envFrom || []).length ? "\n" + [...(c.envFrom || []).map((e) => "      " + (e.configMapRef ? e.configMapRef.name + " ConfigMap" : e.secretRef.name + " Secret") + " Optional: " + !!(e.configMapRef || e.secretRef).optional), ...(c.env || []).map((e) => "      " + e.name + ": " + (e.value !== void 0 ? e.value : "(from source)"))].join("\n") : "<none>"}\n    Mounts:\n${(c.volumeMounts || []).map((m) => `      ${m.mountPath} from ${m.name} (rw)`).join("\n")}${(c.volumeMounts || []).length ? "\n" : ""}      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access (ro)\n`;
		};
		const initDone = !inits.length || sm.stage === "running" || sm.stage === "done";
		return `Name:             ${p.metadata.name}\nNamespace:        ${p.metadata.namespace}\nPriority:         0\nService Account:  ${p.spec.serviceAccountName}\nNode:             ${node ? node.name + "/" + node.ip : "<none>"}\nStart Time:       ${p.status.startTime || "<none>"}\nLabels:           ${PG.kvLines(p.metadata.labels, "                  ")}\nAnnotations:      ${PG.kvLines(p.metadata.annotations, "                  ")}\nStatus:           ${p.status.phase === "Running" && !cl.podReady(p) ? "Running" : p.status.phase}\nIP:               ${p.status.podIP || ""}\nIPs:\n  IP:           ${p.status.podIP || ""}\nControlled By:  ${own ? own.kind + "/" + own.name : "<none>"}\n${inits.length ? "Init Containers:\n" + inits.map((c, i) => block(c, i, true)).join("") : ""}Containers:\n${p.spec.containers.map((c, i) => block(c, i, false)).join("")}Conditions:\n  Type                        Status\n  PodReadyToStartContainers   ${p.status.podIP ? "True" : "False"}\n  Initialized                 ${initDone ? "True" : "False"}\n  Ready                       ${cl.podReady(p) ? "True" : "False"}\n  ContainersReady             ${cl.podReady(p) ? "True" : "False"}\n  PodScheduled                ${p.spec.nodeName ? "True" : "False"}\nVolumes:\n${(p.spec.volumes || []).map((v) => `  ${v.name}:\n    Type:  ${v.configMap ? "ConfigMap (a volume populated by a ConfigMap)\n    Name:  " + v.configMap.name : v.secret ? "Secret\n    SecretName:  " + v.secret.secretName : v.emptyDir ? "EmptyDir (a temporary directory that shares a pod's lifetime)" : v.persistentVolumeClaim ? "PersistentVolumeClaim\n    ClaimName:  " + v.persistentVolumeClaim.claimName : "Other"}`).join("\n") || "  <none>"}\nQoS Class:        BestEffort\nNode-Selectors:   ${PG.kvLines(p.spec.nodeSelector, "                  ")}\nTolerations:      node.kubernetes.io/not-ready:NoExecute op=Exists for 300s\n                  node.kubernetes.io/unreachable:NoExecute op=Exists for 300s\n${PG.evTable(cl, "Pod", p.metadata.name, p.metadata.namespace)}`;
	},
	nodes: (cl, n) => {
		const nd = n._node;
		const pods = cl.res.pods.filter((p) => p.spec.nodeName === nd.name);
		return `Name:               ${nd.name}\nRoles:              ${Object.keys(nd.labels).filter((k) => k.startsWith("node-role.kubernetes.io/")).map((k) => k.split("/")[1]).join(",") || "<none>"}\nLabels:             ${PG.kvLines(nd.labels, "                    ")}\nAnnotations:        node.alpha.kubernetes.io/ttl: 0\nCreationTimestamp:  ${PG.iso(nd.createdAt)}\nTaints:             ${nd.taints.length ? nd.taints.map((t) => `${t.key}${t.value ? "=" + t.value : ""}:${t.effect}`).join("\n                    ") : "<none>"}\nUnschedulable:      ${nd.unschedulable}\nConditions:\n  Type             Status  Reason\n  Ready            ${nd.ready ? "True" : "Unknown"}    ${nd.ready ? "KubeletReady" : "NodeStatusUnknown"}\nAddresses:\n  InternalIP:  ${nd.ip}\n  Hostname:    ${nd.name}\nCapacity:\n  cpu:     6\n  memory:  11975508Ki\n  pods:    110\nSystem Info:\n  Kernel Version:             6.12.13-linuxkit\n  OS Image:                   ${nd.osImage}\n  Operating System:           linux\n  Architecture:               arm64\n  Container Runtime Version:  ${nd.runtime}\n  Kubelet Version:            ${nd.version}\nNon-terminated Pods:          (${pods.length} in total)\n${PG.table(pods.map((p) => [
			"  " + p.metadata.namespace,
			p.metadata.name,
			"0 (0%)",
			"0 (0%)",
			"0 (0%)",
			"0 (0%)",
			PG.fmtAge(cl.clock - p.metadata._t)
		]), [
			"  Namespace",
			"Name",
			"CPU Requests",
			"CPU Limits",
			"Memory Requests",
			"Memory Limits",
			"Age"
		])}\n${PG.evTable(cl, "Node", nd.name)}`;
	},
	services: (cl, s) => {
		const eps = cl.endpointsOf(s);
		return `Name:                     ${s.metadata.name}\nNamespace:                ${s.metadata.namespace}\nLabels:                   ${PG.kvLines(s.metadata.labels, "                          ")}\nAnnotations:              ${PG.kvLines(s.metadata.annotations, "                          ")}\nSelector:                 ${PG.selStr(s.spec.selector)}\nType:                     ${s.spec.type}\nIP Family Policy:         SingleStack\nIP Families:              IPv4\nIP:                       ${s.spec.clusterIP}\nIPs:                      ${s.spec.clusterIP}\n${s.spec.type === "LoadBalancer" ? "LoadBalancer Ingress:     " + PG.extIp(s) + "\n" : ""}${(s.spec.ports || []).map((p) => `Port:                     ${p.name || "<unset>"}  ${p.port}/${p.protocol}\nTargetPort:               ${p.targetPort === void 0 ? p.port : p.targetPort}/${p.protocol}\n${p.nodePort ? "NodePort:                 " + (p.name || "<unset>") + "  " + p.nodePort + "/" + p.protocol + "\n" : ""}`).join("")}Endpoints:                ${eps.length ? [...new Set(eps.map((e) => e.ip + ":" + e.port))].join(",") : "<none>"}\nSession Affinity:         None\n${PG.evTable(cl, "Service", s.metadata.name, s.metadata.namespace)}`;
	},
	deployments: (cl, d) => {
		const s = d.status || {};
		const rss = cl.res.replicasets.filter((r) => r.metadata._owner && r.metadata._owner.name === d.metadata.name && r.metadata.namespace === d.metadata.namespace);
		const cur = rss.find((r) => r._hash === cl.depHash(d));
		const c = d.spec.template.spec.containers[0];
		const ru = (d.spec.strategy || {}).rollingUpdate || {};
		return `Name:                   ${d.metadata.name}\nNamespace:              ${d.metadata.namespace}\nCreationTimestamp:      ${d.metadata.creationTimestamp}\nLabels:                 ${PG.kvLines(d.metadata.labels, "                        ")}\nAnnotations:            deployment.kubernetes.io/revision: ${cur ? cur.metadata.annotations["deployment.kubernetes.io/revision"] : 1}\nSelector:               ${PG.selStr(d.spec.selector.matchLabels)}\nReplicas:               ${d.spec.replicas} desired | ${s.updatedReplicas || 0} updated | ${s.replicas || 0} total | ${s.availableReplicas || 0} available | ${(s.replicas || 0) - (s.availableReplicas || 0)} unavailable\nStrategyType:           ${(d.spec.strategy || {}).type || "RollingUpdate"}\nRollingUpdateStrategy:  ${ru.maxUnavailable === void 0 ? "25%" : ru.maxUnavailable} max unavailable, ${ru.maxSurge === void 0 ? "25%" : ru.maxSurge} max surge\nPod Template:\n  Labels:  ${PG.kvLines(d.spec.template.metadata.labels, "           ")}\n  Containers:\n   ${c.name}:\n    Image:      ${c.image}\n    Port:       ${(c.ports || []).map((x) => x.containerPort + "/TCP").join(", ") || "<none>"}\n    Host Port:  0/TCP\n    Environment:  ${(c.env || []).length ? "" : "<none>"}\n    Mounts:       <none>\n  Volumes:        <none>\nConditions:\n  Type           Status  Reason\n  Available      ${(s.availableReplicas || 0) >= (d.spec.replicas || 0) - 1 ? "True" : "False"}    MinimumReplicasAvailable\n  Progressing    True    NewReplicaSetAvailable\nOldReplicaSets:  ${rss.filter((r) => r !== cur && r.spec.replicas > 0).map((r) => r.metadata.name + " (" + (r.status.replicas || 0) + "/" + r.spec.replicas + " replicas created)").join(", ") || "<none>"}\nNewReplicaSet:   ${cur ? cur.metadata.name + " (" + (cur.status.replicas || 0) + "/" + cur.spec.replicas + " replicas created)" : "<none>"}\n${PG.evTable(cl, "Deployment", d.metadata.name, d.metadata.namespace)}`;
	},
	namespaces: (cl, n) => `Name:         ${n.metadata.name}\nLabels:       ${PG.kvLines(n.metadata.labels, "              ")}\nAnnotations:  <none>\nStatus:       ${n._deleteAt ? "Terminating" : "Active"}\n\nNo resource quota.\n\nNo LimitRange resource.`
};
KV.describe = async (ctx, K, P) => {
	const tokens = P.pos.slice(1);
	const targets = PG.parseTargets(tokens);
	if (!targets.length) {
		ctx.eprintln("error: You must specify the type of resource to describe. Use \"kubectl api-resources\" for a complete list of supported resources.");
		return 1;
	}
	let first = true;
	const cl = K.cl;
	for (const t of targets) {
		if (!t.plural) {
			ctx.eprintln(`error: the server doesn't have a resource type "${t.type}"`);
			if (/^clusters?$/.test(t.type)) ctx.info("(a cluster is not a Kubernetes object, so kubectl cannot delete it. Use: kind delete cluster --name NAME · k3d cluster delete NAME · gcloud container clusters delete NAME --zone ZONE --quiet)");
			return 1;
		}
		let objs = PG.listObjs(cl, t.plural, K.ns, false);
		if (t.name) objs = objs.filter((x) => x.metadata.name === t.name);
		else if (P.f.l) objs = objs.filter((x) => PG.sel(P.f.l, x.metadata.labels));
		if (!objs.length) {
			ctx.eprintln(t.name ? `Error from server (NotFound): ${t.plural} "${t.name}" not found` : `No resources found in ${K.ns} namespace.`);
			return 1;
		}
		for (const o of objs) {
			if (!PG.kcCan(K, "get", t.plural, K.ns)) return PG.kcForbid(ctx, K, t.plural, "get", o.metadata.name, K.ns);
			if (!first) ctx.println("\n");
			first = false;
			ctx.println(PG.DESC[t.plural] ? PG.DESC[t.plural](cl, o) : PG.yaml.dump(PG.cleanForOutput(cl, t.plural, o)).trimEnd() + "\n" + PG.evTable(cl, PG.KINDS[t.plural].kind, o.metadata.name, o.metadata.namespace));
		}
	}
	return 0;
};
var secretDocker = (server, user, pass, email) => PG.b64(JSON.stringify({ auths: { [server]: {
	username: user,
	password: pass,
	email: email || "",
	auth: PG.b64(user + ":" + pass)
} } }));
KV.create = async (ctx, K, P) => {
	if (P.f.f) return KV.apply(ctx, K, P, "create");
	const cl = K.cl;
	const what = P.pos[1];
	const ns = K.ns;
	const name = P.pos[2];
	if (!what) {
		ctx.eprintln("error: must specify one of -f and -k\n\nusage: kubectl create TYPE NAME [flags]   (e.g. kubectl create deployment web --image=nginx)");
		return 1;
	}
	if (!name) {
		ctx.eprintln(`error: exactly one NAME is required, got 0\nusage: kubectl create ${what} NAME [flags]`);
		return 1;
	}
	const done = (plural, nm) => {
		ctx.println(`${PG.fqName(plural, nm)} created`);
		return 0;
	};
	const can = (plural, n2) => PG.kcCan(K, "create", plural, ns) || (PG.kcForbid(ctx, K, plural, "create", n2, ns), false);
	const exists = (plural, n2, nsx) => {
		if (cl.find(plural, n2, nsx)) {
			ctx.eprintln(`Error from server (AlreadyExists): ${plural} "${n2}" already exists`);
			return true;
		}
		return false;
	};
	const lit = [].concat(P.f["from-literal"] || []);
	switch (what) {
		case "namespace":
		case "ns":
			if (!name) {
				ctx.eprintln("error: exactly one NAME is required, got 0");
				return 1;
			}
			if (!can("namespaces", name)) return 1;
			if (exists("namespaces", name)) return 1;
			cl.addNamespace(name);
			return done("namespaces", name);
		case "deployment":
		case "deploy": {
			if (!name) {
				ctx.eprintln("error: exactly one NAME is required, got 0");
				return 1;
			}
			if (!P.f.image) {
				ctx.eprintln("error: required flag(s) \"image\" not set");
				return 1;
			}
			if (!PG.needNs(ctx, K, ns)) return 1;
			if (!can("deployments", name)) return 1;
			if (exists("deployments", name, ns)) return 1;
			const spec = { containers: [{
				name: PG.parseImage(P.f.image).repo.split("/").pop(),
				image: P.f.image,
				...P.f.port ? { ports: [{ containerPort: Number(P.f.port) }] } : {}
			}] };
			cl.admitPod(ns, spec, name);
			const w = PG.psa(cl, ns, spec).warn;
			if (w) ctx.eprintln("Warning: " + w);
			cl.deployment(ns, name, P.f.image, P.f.replicas === void 0 ? 1 : Number(P.f.replicas), { container: P.f.port ? { ports: [{ containerPort: Number(P.f.port) }] } : {} }).spec.template.spec.containers[0].name = spec.containers[0].name;
			return done("deployments", name);
		}
		case "serviceaccount":
		case "sa":
			if (!PG.needNs(ctx, K, ns)) return 1;
			if (!can("serviceaccounts", name)) return 1;
			if (exists("serviceaccounts", name, ns)) return 1;
			cl.mk("serviceaccounts", name, ns, {});
			return done("serviceaccounts", name);
		case "role":
		case "clusterrole": {
			const plural = what === "role" ? "roles" : "clusterroles";
			if (what === "role" && !PG.needNs(ctx, K, ns)) return 1;
			if (!can(plural, name)) return 1;
			if (exists(plural, name, ns)) return 1;
			const verbs = [].concat(P.f.verb || []).join(",").split(",").filter(Boolean);
			const res = [].concat(P.f.resource || []).join(",").split(",").filter(Boolean);
			if (!verbs.length || !res.length) {
				ctx.eprintln("error: at least one verb and one resource are required");
				return 1;
			}
			const rules = [];
			const byGroup = {};
			for (const r of res) {
				const [rs, grp] = r.split(".");
				const pl = PG.resolveKind(rs.split("/")[0]);
				const g = grp !== void 0 ? r.slice(rs.length + 1) : pl ? PG.KINDS[pl].group : "";
				const nm = pl ? rs.includes("/") ? pl + "/" + rs.split("/")[1] : pl : rs;
				(byGroup[g] = byGroup[g] || []).push(nm);
			}
			for (const [g, rs] of Object.entries(byGroup)) rules.push({
				apiGroups: [g],
				resources: rs,
				verbs
			});
			cl.mk(plural, name, ns, { rules });
			return done(plural, name);
		}
		case "rolebinding":
		case "clusterrolebinding": {
			const plural = what === "rolebinding" ? "rolebindings" : "clusterrolebindings";
			if (what === "rolebinding" && !PG.needNs(ctx, K, ns)) return 1;
			if (!can(plural, name)) return 1;
			if (exists(plural, name, ns)) return 1;
			const ref = P.f.clusterrole ? {
				kind: "ClusterRole",
				name: P.f.clusterrole
			} : P.f.role ? {
				kind: "Role",
				name: P.f.role
			} : null;
			if (!ref) {
				ctx.eprintln("error: exactly one of clusterrole or role must be specified");
				return 1;
			}
			const subjects = [];
			for (const u of [].concat(P.f.user || [])) subjects.push({
				apiGroup: "rbac.authorization.k8s.io",
				kind: "User",
				name: u
			});
			for (const g of [].concat(P.f.group || [])) subjects.push({
				apiGroup: "rbac.authorization.k8s.io",
				kind: "Group",
				name: g
			});
			for (const s of [].concat(P.f.serviceaccount || [])) {
				const [sn, sa] = s.split(":");
				subjects.push({
					kind: "ServiceAccount",
					name: sa,
					namespace: sn
				});
			}
			cl.mk(plural, name, ns, {
				roleRef: {
					apiGroup: "rbac.authorization.k8s.io",
					...ref
				},
				subjects
			});
			return done(plural, name);
		}
		case "secret": {
			const kind = P.pos[2];
			const sn = P.pos[3];
			if (!PG.needNs(ctx, K, ns)) return 1;
			if (!can("secrets", sn)) return 1;
			if (exists("secrets", sn, ns)) return 1;
			if (kind === "generic") {
				const data = {};
				for (const l of lit) {
					const i = l.indexOf("=");
					data[l.slice(0, i)] = PG.b64(l.slice(i + 1));
				}
				cl.mk("secrets", sn, ns, {
					type: "Opaque",
					data
				});
				ctx.println(`secret/${sn} created`);
				return 0;
			}
			if (kind === "docker-registry") {
				if (!P.f["docker-server"] || !P.f["docker-username"] || !P.f["docker-password"]) {
					ctx.eprintln("error: required flag(s) \"docker-password\", \"docker-server\", \"docker-username\" not set");
					return 1;
				}
				cl.mk("secrets", sn, ns, {
					type: "kubernetes.io/dockerconfigjson",
					data: { ".dockerconfigjson": secretDocker(P.f["docker-server"], P.f["docker-username"], P.f["docker-password"], P.f["docker-email"]) }
				});
				ctx.println(`secret/${sn} created`);
				return 0;
			}
			ctx.eprintln("error: only \"generic\" and \"docker-registry\" secrets are simulated");
			return 1;
		}
		case "configmap":
		case "cm": {
			if (!PG.needNs(ctx, K, ns)) return 1;
			if (!can("configmaps", name)) return 1;
			if (exists("configmaps", name, ns)) return 1;
			const data = {};
			for (const l of lit) {
				const i = l.indexOf("=");
				data[l.slice(0, i)] = l.slice(i + 1);
			}
			for (const ff of [].concat(P.f["from-file"] || [])) {
				const p = ctx.resolve(ff.includes("=") ? ff.split("=")[1] : ff);
				const c = ctx.fs.read(p);
				if (c === void 0) {
					ctx.eprintln(`error: error reading ${ff}: no such file or directory`);
					return 1;
				}
				data[ff.includes("=") ? ff.split("=")[0] : p.split("/").pop()] = c;
			}
			cl.mk("configmaps", name, ns, { data });
			ctx.println(`configmap/${name} created`);
			return 0;
		}
		case "quota":
		case "resourcequota": {
			if (!PG.needNs(ctx, K, ns)) return 1;
			if (!can("resourcequotas", name)) return 1;
			const hard = {};
			for (const kv of (P.f.hard || "").split(",").filter(Boolean)) {
				const [k, v] = kv.split("=");
				hard[k] = v;
			}
			cl.mk("resourcequotas", name, ns, { spec: { hard } });
			ctx.println(`resourcequota/${name} created`);
			return 0;
		}
		case "token": {
			if (!PG.needNs(ctx, K, ns)) return 1;
			if (!cl.find("serviceaccounts", name, ns)) {
				ctx.eprintln(`error: failed to create token: serviceaccounts "${name}" not found`);
				return 1;
			}
			if (!PG.kcCan(K, "create", "serviceaccounts", ns, "token")) return PG.kcForbid(ctx, K, "serviceaccounts", "create", name, ns, "token");
			const dur = P.f.duration ? 3600 : 3600;
			const tok = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ii" + PG.rnd(40, "abcdefghijklmnopqrstuvwxyz0123456789") + "." + PG.rnd(60, "abcdefghijklmnopqrstuvwxyz0123456789") + "." + PG.rnd(30, "abcdefghijklmnopqrstuvwxyz0123456789");
			ctx.sim.tokens[tok] = {
				identity: {
					user: `system:serviceaccount:${ns}:${name}`,
					groups: [
						"system:serviceaccounts",
						"system:serviceaccounts:" + ns,
						"system:authenticated"
					]
				},
				exp: ctx.sim.clock + dur
			};
			ctx.println(tok);
			return 0;
		}
		case "job":
			if (!P.f.image) {
				ctx.eprintln("error: required flag(s) \"image\" not set");
				return 1;
			}
			if (!PG.needNs(ctx, K, ns)) return 1;
			cl.mk("jobs", name, ns, {
				spec: { template: { spec: {
					containers: [{
						name,
						image: P.f.image,
						...P.dd ? { command: P.dd } : {}
					}],
					restartPolicy: "Never"
				} } },
				status: {}
			});
			return done("jobs", name);
		default:
			ctx.eprintln(`error: unknown or unsupported resource to create: "${what}"\nSupported: namespace deployment serviceaccount role clusterrole rolebinding clusterrolebinding secret configmap quota token job (or use: kubectl create -f FILE / apply -f -)`);
			return 1;
	}
};
PG.makeRunSpec = (P, name) => {
	const c = {
		name,
		image: P.f.image
	};
	if (P.dd && P.dd.length) {
		if (P.has("command")) c.command = P.dd;
		else c.args = P.dd;
	}
	if (P.f.port) c.ports = [{ containerPort: Number(P.f.port) }];
	for (const e of [].concat(P.f.env || [])) {
		const i = e.indexOf("=");
		(c.env = c.env || []).push({
			name: e.slice(0, i),
			value: e.slice(i + 1)
		});
	}
	return {
		containers: [c],
		restartPolicy: P.f.restart || "Always"
	};
};
KV.run = async (ctx, K, P) => {
	const cl = K.cl;
	const name = P.pos[1];
	const ns = K.ns;
	if (!name) {
		ctx.eprintln("error: NAME is required for run");
		return 1;
	}
	if (!P.f.image) {
		ctx.eprintln("error: required flag(s) \"image\" not set");
		return 1;
	}
	if (!PG.needNs(ctx, K, ns)) return 1;
	if (!PG.kcCan(K, "create", "pods", ns)) return PG.kcForbid(ctx, K, "pods", "create", name, ns);
	if (cl.find("pods", name, ns)) {
		ctx.eprintln(`Error from server (AlreadyExists): pods "${name}" already exists`);
		return 1;
	}
	const spec = PG.makeRunSpec(P, name);
	const a = cl.admitPod(ns, spec, name);
	if (a) {
		ctx.eprintln(`Error from server (Forbidden): ${a}`);
		return 1;
	}
	const w = PG.psa(cl, ns, spec).warn;
	if (w) ctx.eprintln("Warning: " + w);
	const labels = { run: name };
	const pod = cl.newPod(ns, name, labels, spec, null);
	if (!(P.has("rm") && P.has("i"))) {
		ctx.println(`pod/${name} created`);
		return 0;
	}
	const ok = await ctx.sim.waitFor(() => {
		const s = cl.podStatus(pod);
		return [
			"Running",
			"Completed",
			"Error",
			"CrashLoopBackOff",
			"CreateContainerConfigError"
		].includes(s) || ["ErrImagePull", "ImagePullBackOff"].includes(s) && ctx.sim.clock - pod._sim.t0 > 14;
	}, ctx.sh, 40);
	const st = cl.podStatus(pod);
	if (!ok || !["Running", "Completed"].includes(st)) {
		ctx.eprintln(`error: timed out waiting for the condition (pod is ${st}: ${pod._sim.plan && pod._sim.plan.msg || "see kubectl describe pod " + name})`);
		cl.killPod(pod, .1);
		return 1;
	}
	const argv = P.dd || [];
	if (argv.length) {
		const r = await PG.execInPod(ctx, cl, pod, argv);
		if (r.out) ctx.out(r.out.endsWith("\n") ? r.out : r.out + "\n");
		if (r.err) ctx.eprintln(r.err);
	} else if (st === "Running") ctx.eprintln("If you don't see a command prompt, try pressing enter.");
	cl.killPod(pod, .5);
	await ctx.sim.waitFor(() => !cl.res.pods.includes(pod), ctx.sh, 10);
	ctx.println(`pod "${name}" deleted`);
	return 0;
};
PG.podFile = (cl, pod, path) => {
	for (const m of pod.spec.containers[0].volumeMounts || []) if (path.startsWith(m.mountPath.replace(/\/$/, "") + "/") || path === m.mountPath) {
		const v = (pod.spec.volumes || []).find((x) => x.name === m.name);
		const rel = path.slice(m.mountPath.length).replace(/^\//, "");
		if (v && v.configMap) {
			const cm = cl.find("configmaps", v.configMap.name, pod.metadata.namespace);
			if (cm) return rel ? (cm.data || {})[rel] : { dir: Object.keys(cm.data || {}) };
		}
		if (v && v.secret) {
			const s = cl.find("secrets", v.secret.secretName, pod.metadata.namespace);
			if (s) return rel ? (s.stringData || {})[rel] !== void 0 ? s.stringData[rel] : s.data && s.data[rel] !== void 0 ? PG.unb64(s.data[rel]) : void 0 : { dir: Object.keys(s.data || {}).concat(Object.keys(s.stringData || {})) };
		}
	}
};
PG.podEnv = (cl, pod) => {
	const c = pod.spec.containers[0];
	const env = {
		HOSTNAME: pod.metadata.name,
		PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
		KUBERNETES_SERVICE_HOST: "10.96.0.1",
		KUBERNETES_SERVICE_PORT: "443"
	};
	for (const s of cl.res.services.filter((s) => s.metadata.namespace === pod.metadata.namespace)) {
		const n = s.metadata.name.toUpperCase().replace(/-/g, "_");
		env[n + "_SERVICE_HOST"] = s.spec.clusterIP;
		if ((s.spec.ports || [])[0]) env[n + "_SERVICE_PORT"] = String(s.spec.ports[0].port);
	}
	for (const e of c.envFrom || []) {
		if (e.configMapRef) {
			const cm = cl.find("configmaps", e.configMapRef.name, pod.metadata.namespace);
			if (cm) Object.assign(env, cm.data || {});
		}
		if (e.secretRef) {
			const s = cl.find("secrets", e.secretRef.name, pod.metadata.namespace);
			if (s) {
				Object.assign(env, s.stringData || {});
				for (const [k, v] of Object.entries(s.data || {})) env[k] = PG.unb64(v);
			}
		}
	}
	for (const e of c.env || []) if (e.value !== void 0) env[e.name] = e.value;
	else if (e.valueFrom && e.valueFrom.fieldRef) env[e.name] = e.valueFrom.fieldRef.fieldPath === "metadata.name" ? pod.metadata.name : e.valueFrom.fieldRef.fieldPath === "metadata.namespace" ? pod.metadata.namespace : "";
	else if (e.valueFrom && e.valueFrom.secretKeyRef) {
		const s = cl.find("secrets", e.valueFrom.secretKeyRef.name, pod.metadata.namespace);
		if (s) env[e.name] = (s.stringData || {})[e.valueFrom.secretKeyRef.key] || PG.unb64((s.data || {})[e.valueFrom.secretKeyRef.key] || "");
	}
	return env;
};
KV.exec = async (ctx, K, P) => {
	const cl = K.cl;
	const t = P.pos[1];
	const ns = K.ns;
	if (!t) {
		ctx.eprintln("error: expected 'exec (POD | TYPE/NAME) COMMAND [ARG1] [ARG2] ... [ARGN]'");
		return 1;
	}
	let pod;
	if (/^(deploy|deployment)\//.test(t)) {
		const d = cl.find("deployments", t.split("/")[1], ns);
		if (!d) {
			ctx.eprintln(`Error from server (NotFound): deployments.apps "${t.split("/")[1]}" not found`);
			return 1;
		}
		pod = cl.res.pods.find((p) => p.metadata.namespace === ns && p.metadata._owner && p.metadata._owner.kind === "ReplicaSet" && p.metadata._owner.name.startsWith(d.metadata.name + "-") && !p.metadata.deletionTimestamp && cl.podStatus(p) === "Running");
		if (!pod) {
			ctx.eprintln("error: unable to upgrade connection: container not found");
			return 1;
		}
	} else {
		pod = cl.find("pods", t.replace(/^pods?\//, ""), ns);
		if (!pod) {
			ctx.eprintln(`Error from server (NotFound): pods "${t}" not found`);
			return 1;
		}
	}
	if (!PG.kcCan(K, "create", "pods", ns, "exec")) return PG.kcForbid(ctx, K, "pods", "create", pod.metadata.name, ns, "exec");
	if (!cl.podReady(pod) && cl.podStatus(pod) !== "Running") {
		ctx.eprintln(`error: unable to upgrade connection: container not found ("${pod.spec.containers[0].name}")`);
		return 1;
	}
	const wantC = P.f.c || P.f.container;
	const allC = [...pod.spec.initContainers || [], ...pod.spec.containers];
	if (wantC && !allC.find((x) => x.name === wantC)) {
		ctx.eprintln(`Error from server (BadRequest): container ${wantC} is not valid for pod ${pod.metadata.name}`);
		return 1;
	}
	const cname = wantC || pod.spec.containers[0].name;
	if (!wantC && pod.spec.containers.length > 1) ctx.eprintln(`Defaulted container "${cname}" out of: ${allC.map((x) => x.name).join(", ")}`);
	const argv = P.dd || [];
	const tty = P.has("t") && P.has("i");
	if (!argv.length) {
		ctx.eprintln("error: you must specify at least one command for the container");
		return 1;
	}
	if (tty && argv.length === 1 && /^(\/bin\/)?(ba|a|z)?sh$/.test(argv[0])) {
		if (ctx.sh.isPodShell) {
			ctx.eprintln("(already inside a pod shell — type \"exit\" first)");
			return 1;
		}
		ctx.sh.session = PG.makePodShell(ctx.sim, {
			cl,
			pod,
			term: ctx.sh.term,
			interactive: true,
			container: cname
		});
		ctx.eprintln("If you don't see a command prompt, try pressing enter.");
		return 0;
	}
	const r = await PG.execInPod(ctx, cl, pod, argv, cname);
	if (r.out) ctx.out(r.out.endsWith("\n") ? r.out : r.out + "\n");
	if (r.err) ctx.eprintln(r.err);
	if (r.code) {
		ctx.eprintln(`command terminated with exit code ${r.code}`);
		return r.code;
	}
	return 0;
};
KV.expose = async (ctx, K, P) => {
	const cl = K.cl;
	const ns = K.ns;
	const ty = P.pos[1];
	const rn = P.pos[2];
	if (!ty || !rn) {
		ctx.eprintln("error: you must provide one or more resources by argument or filename");
		return 1;
	}
	const plural = PG.resolveKind(ty.split("/")[0]);
	const nm = ty.includes("/") ? ty.split("/")[1] : rn;
	if (!plural) {
		ctx.eprintln(`error: the server doesn't have a resource type "${ty}"`);
		return 1;
	}
	if (![
		"deployments",
		"pods",
		"services",
		"replicasets",
		"replicationcontrollers"
	].includes(plural)) {
		ctx.eprintln(`error: cannot expose a ${PG.KINDS[plural] ? PG.KINDS[plural].kind : plural}`);
		return 1;
	}
	const obj = cl.find(plural, nm, ns);
	if (!obj) {
		ctx.eprintln(`Error from server (NotFound): ${plural} "${nm}" not found`);
		return 1;
	}
	const sel = plural === "deployments" || plural === "replicasets" ? obj.spec.selector.matchLabels : plural === "pods" ? obj.metadata.labels : plural === "services" ? obj.spec.selector : null;
	if (!sel) {
		ctx.eprintln(`error: cannot expose a ${PG.KINDS[plural].kind}`);
		return 1;
	}
	const tmpl = plural === "deployments" ? obj.spec.template.spec : plural === "pods" ? obj.spec : null;
	const cport = tmpl && (tmpl.containers[0].ports || [])[0];
	const port = P.f.port ? Number(P.f.port) : cport ? cport.containerPort : null;
	if (!port) {
		ctx.eprintln("error: couldn't find port via --port flag or introspection");
		return 1;
	}
	const sname = P.f.name || nm;
	if (!PG.kcCan(K, "create", "services", ns)) return PG.kcForbid(ctx, K, "services", "create", sname, ns);
	if (cl.find("services", sname, ns)) {
		ctx.eprintln(`Error from server (AlreadyExists): services "${sname}" already exists`);
		return 1;
	}
	const tp = P.f["target-port"] !== void 0 ? isNaN(Number(P.f["target-port"])) ? P.f["target-port"] : Number(P.f["target-port"]) : port;
	cl.service(ns, sname, { ...sel }, [{
		port,
		targetPort: tp,
		protocol: "TCP"
	}], {
		type: P.f.type || "ClusterIP",
		labels: { ...obj.metadata.labels || {} }
	});
	ctx.println(`service/${sname} exposed`);
	return 0;
};
KV.scale = async (ctx, K, P) => {
	const cl = K.cl;
	const ns = K.ns;
	const tg = PG.parseTargets(P.pos.slice(1));
	if (!tg.length || P.f.replicas === void 0) {
		ctx.eprintln("error: --replicas is required");
		return 1;
	}
	for (const t of tg) {
		if (!["deployments", "replicasets"].includes(t.plural)) {
			ctx.eprintln(`error: cannot scale ${t.type}`);
			return 1;
		}
		const d = cl.find(t.plural, t.name, ns);
		if (!d) {
			ctx.eprintln(`Error from server (NotFound): ${t.plural} "${t.name}" not found`);
			return 1;
		}
		if (!PG.kcCan(K, "patch", t.plural, ns, "scale")) return PG.kcForbid(ctx, K, t.plural, "patch", t.name, ns, "scale");
		d.spec.replicas = Number(P.f.replicas);
		ctx.println(`${PG.fqName(t.plural, t.name)} scaled`);
	}
	return 0;
};
KV.autoscale = async (ctx, K, P) => {
	const cl = K.cl;
	const ns = K.ns;
	const t = PG.parseTargets(P.pos.slice(1))[0];
	if (!t || t.plural !== "deployments") {
		ctx.eprintln("error: autoscale supports deployments in the playground");
		return 1;
	}
	if (!cl.find("deployments", t.name, ns)) {
		ctx.eprintln(`Error from server (NotFound): deployments.apps "${t.name}" not found`);
		return 1;
	}
	if (cl.find("horizontalpodautoscalers", t.name, ns)) {
		ctx.eprintln(`Error from server (AlreadyExists): horizontalpodautoscalers.autoscaling "${t.name}" already exists`);
		return 1;
	}
	const cpu = Number(String(P.f["cpu-percent"] || P.f.cpu || "80").replace("%", ""));
	if (P.f.max === void 0) {
		ctx.eprintln("error: --max=MAXPODS is required");
		return 1;
	}
	cl.mk("horizontalpodautoscalers", t.name, ns, {
		spec: {
			scaleTargetRef: {
				apiVersion: "apps/v1",
				kind: "Deployment",
				name: t.name
			},
			minReplicas: Number(P.f.min || 1),
			maxReplicas: Number(P.f.max),
			metrics: [{
				type: "Resource",
				resource: {
					name: "cpu",
					target: {
						type: "Utilization",
						averageUtilization: cpu
					}
				}
			}]
		},
		status: {}
	});
	ctx.println(`horizontalpodautoscaler.autoscaling/${t.name} autoscaled`);
	return 0;
};
KV.set = async (ctx, K, P) => {
	if (!P.pos[2]) {
		ctx.eprintln("error: Required resource not specified.\nusage: kubectl set image|env|resources deployment/NAME ...");
		return 1;
	}
	if (!P.pos[2].includes("/") && !P.pos[3]) {
		ctx.eprintln("error: resource(s) were provided, but no name was specified");
		return 1;
	}
	const cl = K.cl;
	const ns = K.ns;
	const what = P.pos[1];
	const slash = (P.pos[2] || "").includes("/");
	const t = PG.parseTargets(slash ? [P.pos[2]] : [P.pos[2], P.pos[3]])[0];
	P.pos = slash ? P.pos : [
		...P.pos.slice(0, 2),
		P.pos[2] + "/" + P.pos[3],
		...P.pos.slice(4)
	];
	if (!t || t.plural !== "deployments") {
		ctx.eprintln("error: kubectl set supports deployments in the playground");
		return 1;
	}
	const d = cl.find("deployments", t.name, ns);
	if (!d) {
		ctx.eprintln(`Error from server (NotFound): deployments.apps "${t.name}" not found`);
		return 1;
	}
	if (!PG.kcCan(K, "patch", "deployments", ns)) return PG.kcForbid(ctx, K, "deployments", "patch", t.name, ns);
	const cs = d.spec.template.spec.containers;
	if (what === "image") {
		for (const kv of P.pos.slice(3)) {
			const [cn, im] = kv.split("=");
			const c = cs.find((x) => cn === "*" || x.name === cn);
			if (!c) {
				ctx.eprintln(`error: unable to find container named "${cn}"`);
				return 1;
			}
			c.image = im;
		}
		ctx.println(`deployment.apps/${t.name} image updated`);
		return 0;
	}
	if (what === "resources") {
		for (const c of cs) for (const [fl, key] of [["requests", "requests"], ["limits", "limits"]]) if (P.f[fl]) {
			c.resources = c.resources || {};
			c.resources[key] = c.resources[key] || {};
			for (const kv of P.f[fl].split(",")) {
				const [k, v] = kv.split("=");
				c.resources[key][k] = v;
			}
		}
		ctx.println(`deployment.apps/${t.name} resource requirements updated`);
		return 0;
	}
	if (what === "env") {
		for (const kv of P.pos.slice(3)) {
			const i = kv.indexOf("=");
			const c = cs[0];
			c.env = (c.env || []).filter((e) => e.name !== kv.slice(0, i));
			c.env.push({
				name: kv.slice(0, i),
				value: kv.slice(i + 1)
			});
		}
		ctx.println(`deployment.apps/${t.name} env updated`);
		return 0;
	}
	ctx.eprintln("error: supported: set image | resources | env");
	return 1;
};
KV.label = async (ctx, K, P) => {
	const cl = K.cl;
	const ann = P.pos[0] === "annotate";
	const field = ann ? "annotations" : "labels";
	const t = PG.parseTargets(P.pos.slice(1, 3))[0];
	const pairs = P.pos.slice(3);
	if (!t || !t.plural || !t.name || !pairs.length) {
		ctx.eprintln(`error: ${P.pos[0]} requires a resource and at least one key=value`);
		return 1;
	}
	if (!PG.kcCan(K, "patch", t.plural, K.ns)) return PG.kcForbid(ctx, K, t.plural, "patch", t.name, K.ns);
	let target;
	if (t.plural === "nodes") {
		const n = cl.nodeByName(t.name);
		if (!n) {
			ctx.eprintln(`Error from server (NotFound): nodes "${t.name}" not found`);
			return 1;
		}
		target = ann ? n.annotations = n.annotations || {} : n.labels;
	} else {
		const o = cl.find(t.plural, t.name, K.ns);
		if (!o) {
			ctx.eprintln(`Error from server (NotFound): ${t.plural} "${t.name}" not found`);
			return 1;
		}
		o.metadata[field] = o.metadata[field] || {};
		target = o.metadata[field];
	}
	for (const p of pairs) {
		if (p.endsWith("-") && !p.includes("=")) {
			delete target[p.slice(0, -1)];
			continue;
		}
		const i = p.indexOf("=");
		if (i < 0) {
			ctx.eprintln(`error: invalid ${field.slice(0, -1)} format '${p}'`);
			return 1;
		}
		const k = p.slice(0, i), v = p.slice(i + 1);
		if (k in target && target[k] !== v && !P.has("overwrite")) {
			ctx.eprintln(`error: '${k}' already has a value (${target[k]}), and --overwrite is false`);
			return 1;
		}
		target[k] = v;
	}
	const o2 = t.plural !== "nodes" ? cl.find(t.plural, t.name, K.ns) : null;
	if (o2 && !Object.keys(o2.metadata[field]).length) delete o2.metadata[field];
	ctx.println(`${PG.KINDS[t.plural].kind.toLowerCase()}/${t.name} ${ann ? "annotated" : "labeled"}`);
	return 0;
};
KV.annotate = KV.label;
KV.taint = async (ctx, K, P) => {
	const cl = K.cl;
	if (!P.pos[2]) {
		ctx.eprintln("error: at least one node name and one taint are required: kubectl taint node NAME key=value:Effect");
		return 1;
	}
	if (P.pos[1] !== "node" && P.pos[1] !== "nodes") {
		ctx.eprintln("error: taint requires a node: kubectl taint node NAME key=value:Effect");
		return 1;
	}
	const n = cl.nodeByName(P.pos[2]);
	if (!n) {
		ctx.eprintln(`Error from server (NotFound): nodes "${P.pos[2]}" not found`);
		return 1;
	}
	if (!PG.kcCan(K, "patch", "nodes", null)) return PG.kcForbid(ctx, K, "nodes", "patch", P.pos[2], null);
	let res = "tainted";
	for (const spec of P.pos.slice(3)) {
		if (spec.endsWith("-")) {
			const body = spec.slice(0, -1);
			const [kv, eff] = body.split(":");
			const k = kv.split("=")[0];
			const before = n.taints.length;
			n.taints = n.taints.filter((t) => !(t.key === k && (!eff || t.effect === eff)));
			if (n.taints.length === before) {
				ctx.eprintln(`error: taint "${body}" not found`);
				return 1;
			}
			res = "untainted";
			continue;
		}
		const m = /^([^=:]+)(?:=([^:]*))?:(NoSchedule|PreferNoSchedule|NoExecute)$/.exec(spec);
		if (!m) {
			ctx.eprintln(`error: invalid taint spec: ${spec}. Expected key=value:effect, e.g. dedicated=data:NoSchedule`);
			return 1;
		}
		if (n.taints.some((t) => t.key === m[1] && t.effect === m[3])) {
			ctx.eprintln(`error: Node ${n.name} already has ${m[1]} taint(s) with same effect(s) and --overwrite is false`);
			return 1;
		}
		n.taints.push({
			key: m[1],
			...m[2] ? { value: m[2] } : {},
			effect: m[3]
		});
	}
	ctx.println(`node/${n.name} ${res}`);
	return 0;
};
KV.delete = async (ctx, K, P) => {
	const cl = K.cl;
	const ns = K.ns;
	let list = [];
	if (P.f.f) {
		const m = PG.readManifest(ctx, P);
		if (m.err) {
			ctx.eprintln(m.err);
			return 1;
		}
		for (const d of m.docs) {
			const pl = PG.KIND_OF[d.kind];
			if (pl) list.push({
				plural: pl,
				name: d.metadata.name,
				ns: d.metadata.namespace || ns
			});
		}
	} else {
		const tg = PG.parseTargets(P.pos.slice(1));
		if (!tg.length) {
			ctx.eprintln("error: You must provide one or more resources by argument or filename.");
			return 1;
		}
		for (const t of tg) {
			if (!t.plural) {
				ctx.eprintln(`error: the server doesn't have a resource type "${t.type}"`);
				if (/^clusters?$/.test(t.type)) ctx.info("(a cluster is not a Kubernetes object, so kubectl cannot delete it. Use: kind delete cluster --name NAME · k3d cluster delete NAME · gcloud container clusters delete NAME --zone ZONE --quiet)");
				return 1;
			}
			if (t.name) list.push({
				plural: t.plural,
				name: t.name,
				ns
			});
			else if (P.has("all") || P.f.l) for (const o of PG.listObjs(cl, t.plural, ns, P.has("A")).filter((x) => !P.f.l || PG.sel(P.f.l, x.metadata.labels))) list.push({
				plural: t.plural,
				name: o.metadata.name,
				ns: o.metadata.namespace
			});
			else {
				ctx.eprintln("error: resource(s) were provided, but no name was specified");
				return 1;
			}
		}
	}
	if (!list.length) {
		ctx.eprintln(`No resources found`);
		return 0;
	}
	let code = 0;
	for (const it of list) {
		const k = PG.KINDS[it.plural];
		if (!PG.kcCan(K, "delete", it.plural, it.ns)) {
			PG.kcForbid(ctx, K, it.plural, "delete", it.name, it.ns);
			code = 1;
			continue;
		}
		k.kind === "Pod" || k.kind;
		const nm = PG.fqName(it.plural, it.name).split("/")[0];
		nm.replace(/^(pod|service|namespace|node|configmap|secret|serviceaccount|persistentvolumeclaim|resourcequota)$/, "$1");
		if (it.plural === "nodes") {
			const n = cl.nodeByName(it.name);
			if (!n) {
				ctx.eprintln(`Error from server (NotFound): nodes "${it.name}" not found`);
				code = 1;
				continue;
			}
			cl.nodes.splice(cl.nodes.indexOf(n), 1);
			ctx.println(`node "${it.name}" deleted`);
			continue;
		}
		const o = cl.find(it.plural, it.name, it.ns);
		if (!o) {
			ctx.eprintln(`Error from server (NotFound): ${it.plural === "deployments" ? "deployments.apps" : it.plural} "${it.name}" not found`);
			code = 1;
			continue;
		}
		if (it.plural === "namespaces") {
			if ([
				"default",
				"kube-system",
				"kube-public",
				"kube-node-lease"
			].includes(it.name) && false);
			o._deleteAt = cl.clock + 3;
			ctx.println(`namespace "${it.name}" deleted`);
			await ctx.sim.waitFor(() => !cl.res.namespaces.includes(o), ctx.sh, 30);
			continue;
		}
		if (it.plural === "pods") {
			cl.killPod(o);
			ctx.println(`pod "${it.name}" deleted`);
			if (!P.has("wait") || P.f.wait !== "false") await ctx.sim.waitFor(() => !cl.res.pods.includes(o), ctx.sh, 40);
			continue;
		}
		cl.del(it.plural, o);
		ctx.println(`${nm} "${it.name}" deleted`);
	}
	return code;
};
KV.rollout = async (ctx, K, P) => {
	const cl = K.cl;
	const ns = K.ns;
	const sub = P.pos[1];
	const t = PG.parseTargets(P.pos.slice(2))[0];
	if (!t || t.plural !== "deployments") {
		ctx.eprintln("error: rollout supports deployments: kubectl rollout status deployment/NAME");
		return 1;
	}
	const d = cl.find("deployments", t.name, ns);
	if (!d) {
		ctx.eprintln(`Error from server (NotFound): deployments.apps "${t.name}" not found`);
		return 1;
	}
	const rss = () => cl.res.replicasets.filter((r) => r.metadata._owner.name === d.metadata.name && r.metadata.namespace === ns);
	if (sub === "status") {
		const tmo = P.f.timeout ? parseInt(P.f.timeout) : 0;
		const t0 = ctx.sim.clock;
		let last = "";
		while (true) {
			const s = d.status || {};
			const want = d.spec.replicas === void 0 ? 1 : d.spec.replicas;
			let msg;
			if ((s.updatedReplicas || 0) < want) msg = `Waiting for deployment "${t.name}" rollout to finish: ${s.updatedReplicas || 0} out of ${want} new replicas have been updated...`;
			else if ((s.replicas || 0) > (s.updatedReplicas || 0)) msg = `Waiting for deployment "${t.name}" rollout to finish: ${(s.replicas || 0) - (s.updatedReplicas || 0)} old replicas are pending termination...`;
			else if ((s.availableReplicas || 0) < (s.updatedReplicas || 0)) msg = `Waiting for deployment "${t.name}" rollout to finish: ${s.availableReplicas || 0} of ${s.updatedReplicas || 0} updated replicas are available...`;
			else {
				ctx.println(`deployment "${t.name}" successfully rolled out`);
				return 0;
			}
			if (msg !== last) {
				ctx.println(msg);
				last = msg;
			}
			if (tmo && ctx.sim.clock - t0 > tmo) {
				ctx.eprintln("error: timed out waiting for the condition");
				return 1;
			}
			await ctx.sleep(1);
		}
	}
	if (!PG.kcCan(K, "patch", "deployments", ns)) return PG.kcForbid(ctx, K, "deployments", "patch", t.name, ns);
	if (sub === "restart") {
		d.spec.template.metadata.annotations = {
			...d.spec.template.metadata.annotations || {},
			"kubectl.kubernetes.io/restartedAt": PG.iso(ctx.sim.clock)
		};
		ctx.println(`deployment.apps/${t.name} restarted`);
		return 0;
	}
	if (sub === "history") {
		const rows = rss().sort((a, b) => a.metadata.annotations["deployment.kubernetes.io/revision"] - b.metadata.annotations["deployment.kubernetes.io/revision"]).map((r) => [r.metadata.annotations["deployment.kubernetes.io/revision"], "<none>"]);
		ctx.println(`deployment.apps/${t.name}\n` + PG.table(rows, ["REVISION", "CHANGE-CAUSE"]));
		return 0;
	}
	if (sub === "undo") {
		const sorted = rss().sort((a, b) => b.metadata.annotations["deployment.kubernetes.io/revision"] - a.metadata.annotations["deployment.kubernetes.io/revision"]);
		const cur = sorted.find((r) => r._hash === cl.depHash(d));
		let prev;
		if (P.f["to-revision"]) prev = sorted.find((r) => r.metadata.annotations["deployment.kubernetes.io/revision"] === String(P.f["to-revision"]));
		else prev = sorted.find((r) => r !== cur);
		if (!prev) {
			ctx.eprintln(`error: no rollout history found for deployment "${t.name}"`);
			return 1;
		}
		d.spec.template = PG.clone(prev._template);
		prev.metadata.annotations["deployment.kubernetes.io/revision"] = String(Math.max(...sorted.map((r) => +r.metadata.annotations["deployment.kubernetes.io/revision"])) + 1);
		ctx.println(`deployment.apps/${t.name} rolled back`);
		return 0;
	}
	ctx.eprintln("error: supported: rollout status | restart | history | undo");
	return 1;
};
KV.logs = async (ctx, K, P) => {
	const cl = K.cl;
	const ns = K.ns;
	const t = P.pos[1];
	let pods = [];
	if (P.f.l) pods = cl.res.pods.filter((p) => p.metadata.namespace === ns && PG.sel(P.f.l, p.metadata.labels));
	else if (!t) {
		ctx.eprintln("error: expected 'logs [-f] [-p] (POD | TYPE/NAME) [-c CONTAINER]'.\nPOD or TYPE/NAME is a required argument for the logs command");
		return 1;
	} else if (/^(deploy|deployment)s?\//.test(t)) {
		const d = cl.find("deployments", t.split("/")[1], ns);
		if (!d) {
			ctx.eprintln(`Error from server (NotFound): deployments.apps "${t.split("/")[1]}" not found`);
			return 1;
		}
		pods = cl.res.pods.filter((p) => p.metadata.namespace === ns && p.metadata._owner && p.metadata._owner.kind === "ReplicaSet" && p.metadata._owner.name.startsWith(d.metadata.name + "-"));
	} else {
		const p = cl.find("pods", t.replace(/^pods?\//, ""), ns);
		if (!p) {
			ctx.eprintln(`Error from server (NotFound): pods "${t}" not found`);
			return 1;
		}
		pods = [p];
	}
	if (!pods.length) {
		ctx.eprintln(`No resources found in ${ns} namespace.`);
		return 1;
	}
	const p = pods[0];
	if (!PG.kcCan(K, "get", "pods", ns, "log")) return PG.kcForbid(ctx, K, "pods", "get", p.metadata.name, ns, "log");
	const wantC = P.f.c || P.f.container;
	const allC = [...p.spec.initContainers || [], ...p.spec.containers];
	if (wantC && !allC.find((x) => x.name === wantC)) {
		ctx.eprintln(`Error from server (BadRequest): container ${wantC} is not valid for pod ${p.metadata.name}`);
		return 1;
	}
	if (!wantC && p.spec.containers.length > 1) ctx.eprintln(`Defaulted container "${p.spec.containers[0].name}" out of: ${allC.map((x) => x.name).join(", ")}`);
	const st = cl.podStatus(p);
	const cn = wantC || p.spec.containers[0].name;
	const ci = p.spec.containers.findIndex((x) => x.name === cn);
	if (ci >= 0 && (![
		"Running",
		"Completed",
		"Error",
		"CrashLoopBackOff",
		"OOMKilled"
	].includes(st) || p._sim.stage === "scheduled" || p._sim.stage === "pulling" || p._sim.stage === "new" || p._sim.stage === "init")) {
		ctx.eprintln(`Error from server (BadRequest): container "${cn}" in pod "${p.metadata.name}" is ${["ErrImagePull", "ImagePullBackOff"].includes(st) ? "waiting to start: trying and failing to pull image" : "waiting to start: " + (st === "Pending" ? "ContainerCreating" : st)}`);
		return 1;
	}
	let lines = ci >= 0 ? (p._sim.cs && p._sim.cs[ci] ? p._sim.cs[ci].logs : p._sim.logs).slice() : ((p._sim.initLogs || {})[cn] || []).slice();
	if (P.has("previous") || P.has("p")) lines = lines.slice();
	const tail = P.f.tail !== void 0 ? Number(P.f.tail) : null;
	if (tail !== null) lines = lines.slice(-tail);
	if (lines.length) ctx.println(lines.join("\n"));
	if (P.has("f") || P.has("follow")) {
		let n = p._sim.logs.length;
		while (true) {
			await ctx.sleep(1);
			const cur = p._sim.logs;
			if (cur.length > n) {
				ctx.println(cur.slice(n).join("\n"));
				n = cur.length;
			}
		}
	}
	return 0;
};
KV["port-forward"] = async (ctx, K, P) => {
	const cl = K.cl;
	const ns = K.ns;
	const t = P.pos[1];
	const ports = P.pos.slice(2);
	if (!t || !ports.length) {
		ctx.eprintln("error: TYPE/NAME and list of ports are required for port-forward");
		return 1;
	}
	const m = /^(?:([a-z]+)\/)?(.+)$/.exec(t);
	const plural = m[1] ? PG.resolveKind(m[1]) : "pods";
	const name = m[2];
	const obj = cl.find(plural, name, ns);
	if (!obj) {
		ctx.eprintln(`Error from server (NotFound): ${plural === "pods" ? "pods" : plural} "${name}" not found`);
		return 1;
	}
	if (!PG.kcCan(K, "create", "pods", ns, "portforward")) return PG.kcForbid(ctx, K, "pods", "create", name, ns, "portforward");
	const [lp, rp] = ports[0].includes(":") ? ports[0].split(":").map(Number) : [Number(ports[0]), Number(ports[0])];
	let fw = {
		local: lp,
		remote: rp,
		cluster: cl,
		active: true,
		target: `${m[1] || "pod"}/${name}`,
		onConn: () => ctx.println(`Handling connection for ${lp}`)
	};
	if (plural === "services") {
		if (!cl.endpointsOf(obj).length) {
			ctx.eprintln(`error: unable to forward port because pod is not running. Current status=Pending`);
			return 1;
		}
		fw.svc = obj;
	} else if (plural === "deployments") {
		const pod = cl.res.pods.find((p) => p.metadata.namespace === ns && p.metadata._owner && p.metadata._owner.name.startsWith(name + "-") && cl.podReady(p));
		if (!pod) {
			ctx.eprintln("error: unable to forward port because pod is not running. Current status=Pending");
			return 1;
		}
		fw.pod = pod;
	} else if (plural === "pods") {
		if (!cl.podReady(obj)) {
			ctx.eprintln(`error: unable to forward port because pod is not running. Current status=${cl.podStatus(obj)}`);
			return 1;
		}
		fw.pod = obj;
	} else {
		ctx.eprintln(`error: cannot port-forward to ${plural}`);
		return 1;
	}
	if (ctx.sim.forwards.some((f) => f.local === lp && f.active) || ctx.sim.containers.some((c) => c.status === "running" && c.ports.some((p) => p.host === lp))) {
		ctx.eprintln(`Unable to listen on port ${lp}: Listeners failed to create with the following errors: [unable to create listener: Error listen tcp4 127.0.0.1:${lp}: bind: address already in use]\nerror: unable to listen on any of the requested ports: [{${lp} ${rp}}]`);
		return 1;
	}
	ctx.sim.forwards.push(fw);
	ctx.println(`Forwarding from 127.0.0.1:${lp} -> ${rp}\nForwarding from [::1]:${lp} -> ${rp}`);
	try {
		await ctx.sim.waitFor(() => false, ctx.sh, 1e9);
	} finally {
		fw.active = false;
		ctx.sim.forwards = ctx.sim.forwards.filter((f) => f !== fw);
	}
	return 0;
};
KV.top = async (ctx, K, P) => {
	const cl = K.cl;
	const what = P.pos[1];
	if (!cl.metricsServer()) {
		ctx.eprintln("error: Metrics API not available");
		return 1;
	}
	if (what === "nodes" || what === "node") {
		ctx.println(PG.table(cl.nodes.map((n, i) => [
			n.name,
			120 + i * 40 + "m",
			2 + i + "%",
			700 + i * 90 + "Mi",
			6 + i + "%"
		]), [
			"NAME",
			"CPU(cores)",
			"CPU(%)",
			"MEMORY(bytes)",
			"MEMORY(%)"
		]));
		return 0;
	}
	if (what === "pods" || what === "pod") {
		const all = P.has("A");
		const rows = cl.res.pods.filter((p) => (all || p.metadata.namespace === K.ns) && cl.podReady(p)).map((p) => {
			const dep = p.metadata._owner && cl.find("deployments", p.metadata._owner.name.replace(/-[a-z0-9]{6,10}$/, ""), p.metadata.namespace);
			const req = ((p.spec.containers[0].resources || {}).requests || {}).cpu;
			const reqM = req ? String(req).endsWith("m") ? parseInt(req) : parseFloat(req) * 1e3 : 100;
			const util = dep ? Math.round(dep._load === void 0 ? 5 : dep._load / Math.max(1, dep.status.readyReplicas || 1)) : 3;
			return [
				...all ? [p.metadata.namespace] : [],
				p.metadata.name,
				Math.max(1, Math.round(reqM * util / 100)) + "m",
				8 + parseInt(PG.hash(p.metadata.name, 4), 16) % 40 + "Mi"
			];
		});
		ctx.println(PG.table(rows, [
			...all ? ["NAMESPACE"] : [],
			"NAME",
			"CPU(cores)",
			"MEMORY(bytes)"
		]));
		return 0;
	}
	ctx.eprintln("error: top nodes | pods");
	return 1;
};
PG.pdbBlocks = (cl, pod) => {
	for (const b of cl.res.poddisruptionbudgets.filter((b) => b.metadata.namespace === pod.metadata.namespace && PG.selMatch(b.spec.selector, pod.metadata.labels))) {
		const mine = cl.matchPods(pod.metadata.namespace, b.spec.selector);
		const healthy = mine.filter((p) => cl.podReady(p)).length;
		if ((b.spec.minAvailable !== void 0 ? healthy - b.spec.minAvailable : (b.spec.maxUnavailable === void 0 ? 1 : b.spec.maxUnavailable) - (mine.length - healthy)) <= 0 && cl.podReady(pod)) return b;
	}
	return null;
};
KV.cordon = KV.uncordon = async (ctx, K, P) => {
	const cl = K.cl;
	if (!P.pos[1]) {
		ctx.eprintln(`error: USAGE: ${P.pos[0] || "cordon"} NODE [flags]`);
		return 1;
	}
	const n = cl.nodeByName(P.pos[1]);
	if (!n) {
		ctx.eprintln(`Error from server (NotFound): nodes "${P.pos[1]}" not found`);
		return 1;
	}
	if (!PG.kcCan(K, "patch", "nodes", null)) return PG.kcForbid(ctx, K, "nodes", "patch", P.pos[1], null);
	const c = P.pos[0] === "cordon";
	if (n.unschedulable === c) {
		ctx.println(`node/${n.name} already ${c ? "cordoned" : "uncordoned"}`);
		return 0;
	}
	n.unschedulable = c;
	ctx.println(`node/${n.name} ${c ? "cordoned" : "uncordoned"}`);
	return 0;
};
KV.drain = async (ctx, K, P) => {
	if (!P.pos[1]) {
		ctx.eprintln("error: USAGE: drain NODE [flags]");
		return 1;
	}
	const cl = K.cl;
	const n = cl.nodeByName(P.pos[1]);
	if (!n) {
		ctx.eprintln(`Error from server (NotFound): nodes "${P.pos[1]}" not found`);
		return 1;
	}
	if (!PG.kcCan(K, "patch", "nodes", null)) return PG.kcForbid(ctx, K, "nodes", "patch", P.pos[1], null);
	if (!n.unschedulable) {
		n.unschedulable = true;
		ctx.println(`node/${n.name} cordoned`);
	} else ctx.println(`node/${n.name} already cordoned`);
	const pods = cl.res.pods.filter((p) => p.spec.nodeName === n.name && !p.metadata.deletionTimestamp);
	const ds = pods.filter((p) => ["DaemonSet", "Node"].includes(cl.podOwnerKind(p)));
	const bare = pods.filter((p) => !p.metadata._owner);
	const evict = pods.filter((p) => !ds.includes(p) && p.metadata._owner);
	if (ds.length && !P.has("ignore-daemonsets")) {
		ctx.eprintln(`error: cannot delete DaemonSet-managed Pods (use --ignore-daemonsets to ignore): ${ds.filter((p) => cl.podOwnerKind(p) === "DaemonSet").map((p) => p.metadata.namespace + "/" + p.metadata.name).join(", ")}`);
		return 1;
	}
	if (bare.length && !P.has("force")) {
		ctx.eprintln(`error: cannot delete Pods declare no controller (use --force to override): ${bare.map((p) => p.metadata.namespace + "/" + p.metadata.name).join(", ")}`);
		return 1;
	}
	const eds = pods.filter((p) => (p.spec.volumes || []).some((v) => v.emptyDir));
	if (eds.length && !P.has("delete-emptydir-data")) {
		ctx.eprintln(`error: cannot delete Pods with local storage (use --delete-emptydir-data to override): ${eds.map((p) => p.metadata.namespace + "/" + p.metadata.name).join(", ")}`);
		return 1;
	}
	if (ds.length) ctx.eprintln(`Warning: ignoring DaemonSet-managed Pods: ${ds.map((p) => p.metadata.namespace + "/" + p.metadata.name).join(", ")}`);
	const todo = [...evict, ...bare];
	if (todo.length) ctx.println(`evicting ${todo.length} pod(s)`);
	const t0 = ctx.sim.clock;
	const tmo = P.f.timeout ? parseInt(P.f.timeout) : 0;
	for (const p of todo) {
		ctx.println(`evicting pod ${p.metadata.namespace}/${p.metadata.name}`);
		while (true) {
			if (!cl.res.pods.includes(p)) break;
			if (!PG.pdbBlocks(cl, p)) break;
			ctx.eprintln(`error when evicting pods/"${p.metadata.name}" -n "${p.metadata.namespace}" (will retry after 5s): Cannot evict pod as it would violate the pod's disruption budget.`);
			if (tmo && ctx.sim.clock - t0 > tmo) {
				ctx.eprintln("error: global timeout reached: " + P.f.timeout);
				return 1;
			}
			await ctx.sleep(5);
		}
		if (cl.res.pods.includes(p)) {
			cl.killPod(p);
			await ctx.sim.waitFor(() => !cl.res.pods.includes(p), ctx.sh, 60);
		}
		ctx.println(`pod/${p.metadata.name} evicted`);
	}
	ctx.println(`node/${n.name} drained`);
	return 0;
};
KV.auth = async (ctx, K, P) => {
	const cl = K.cl;
	const sub = P.pos[1];
	if (sub === "whoami") {
		ctx.println(PG.table([["Username", K.id.user], ["Groups", "[" + K.id.groups.join(" ") + "]"]], ["ATTRIBUTE", "VALUE"]));
		return 0;
	}
	if (sub !== "can-i") {
		ctx.eprintln("error: supported: kubectl auth can-i VERB RESOURCE | --list | whoami");
		return 1;
	}
	const ns = K.ns;
	if (P.has("list")) {
		const rows = [];
		const id = K.id;
		const subjMatch = (s) => s.kind === "User" && s.name === id.user || s.kind === "Group" && id.groups.includes(s.name) || s.kind === "ServiceAccount" && id.user === `system:serviceaccount:${s.namespace}:${s.name}`;
		const rulesOf = (ref, nsx) => {
			const r = ref.kind === "ClusterRole" ? cl.find("clusterroles", ref.name) : cl.find("roles", ref.name, nsx);
			return r ? r.rules : [];
		};
		const rules = [];
		for (const b of cl.res.clusterrolebindings) if ((b.subjects || []).some(subjMatch)) rules.push(...rulesOf(b.roleRef));
		for (const b of cl.res.rolebindings.filter((b) => b.metadata.namespace === ns)) if ((b.subjects || []).some(subjMatch)) rules.push(...rulesOf(b.roleRef, ns));
		for (const r of rules) for (const res of r.resources) {
			const g = (r.apiGroups || [""])[0];
			rows.push([
				res + (g && g !== "*" && g !== "" ? "." + g : ""),
				"[]",
				"[]",
				"[" + r.verbs.join(" ") + "]"
			]);
		}
		rows.push([
			"selfsubjectreviews.authentication.k8s.io",
			"[]",
			"[]",
			"[create]"
		]);
		ctx.println(PG.table(rows, [
			"Resources",
			"Non-Resource URLs",
			"Resource Names",
			"Verbs"
		]));
		return 0;
	}
	const verb = P.pos[2];
	let res = P.pos[3];
	if (!verb || !res) {
		ctx.eprintln("error: you must specify two or three arguments: verb, resource, and optional resourceName");
		return 1;
	}
	let sub2 = P.f.subresource || null;
	if (res.includes("/")) [res, sub2] = res.split("/");
	const plural = PG.resolveKind(res) || res;
	const ok = cl.authorize(K.id, verb, plural, PG.KINDS[plural] && !PG.KINDS[plural].ns ? null : ns, sub2);
	ctx.println(ok ? "yes" : "no");
	return ok ? 0 : 1;
};
PG.kubeconfigYaml = (sim, minify, ctxName) => {
	const kc = sim.kubeconfig;
	let ctxs = kc.contexts, cls = kc.clusters, us = kc.users;
	if (minify) {
		const c = sim.ctxByName(ctxName || kc.current);
		ctxs = c ? [c] : [];
		cls = cls.filter((x) => c && x.name === c.cluster);
		us = us.filter((x) => c && x.name === c.user);
	}
	return PG.yaml.dump({
		apiVersion: "v1",
		kind: "Config",
		clusters: cls.map((c) => ({
			cluster: {
				"certificate-authority-data": "DATA+OMITTED",
				server: c.server
			},
			name: c.name
		})),
		contexts: ctxs.map((c) => ({
			context: {
				cluster: c.cluster,
				...c.namespace ? { namespace: c.namespace } : {},
				user: c.user
			},
			name: c.name
		})),
		"current-context": kc.current,
		preferences: {},
		users: us.map((u) => ({
			name: u.name,
			user: u.auth.kind === "token" ? { token: "REDACTED" } : {
				"client-certificate-data": "DATA+OMITTED",
				"client-key-data": "DATA+OMITTED"
			}
		}))
	});
};
KV.config = async (ctx, K0, P) => {
	const sim = ctx.sim;
	const kc = sim.kubeconfig;
	const sub = P.pos[1];
	const path = "/Users/user/.kube/config";
	if (sub === "view") {
		ctx.out(PG.kubeconfigYaml(sim, P.has("minify"), P.f.context));
		return 0;
	}
	if (sub === "current-context") {
		if (!kc.current) {
			ctx.eprintln("error: current-context is not set");
			return 1;
		}
		ctx.println(kc.current);
		return 0;
	}
	if (sub === "get-contexts") {
		if (P.f.o === "name") {
			ctx.println(kc.contexts.map((c) => c.name).join("\n"));
			return 0;
		}
		const rows = kc.contexts.filter((c) => !P.pos[2] || c.name === P.pos[2]).map((c) => [
			c.name === kc.current ? "*" : "",
			c.name,
			c.cluster,
			c.user,
			c.namespace || ""
		]);
		ctx.println(PG.table(rows, [
			"CURRENT",
			"NAME",
			"CLUSTER",
			"AUTHINFO",
			"NAMESPACE"
		]));
		return 0;
	}
	if (sub === "get-clusters") {
		ctx.println("NAME\n" + kc.clusters.map((c) => c.name).join("\n"));
		return 0;
	}
	if (sub === "get-users") {
		ctx.println("NAME\n" + kc.users.map((c) => c.name).join("\n"));
		return 0;
	}
	if (sub === "use-context") {
		if (!sim.ctxByName(P.pos[2])) {
			ctx.eprintln(`error: no context exists with the name: "${P.pos[2]}"`);
			return 1;
		}
		kc.current = P.pos[2];
		ctx.println(`Switched to context "${P.pos[2]}".`);
		return 0;
	}
	if (sub === "rename-context") {
		const c = sim.ctxByName(P.pos[2]);
		if (!c) {
			ctx.eprintln(`error: cannot rename the context "${P.pos[2]}", it's not in ${path}`);
			return 1;
		}
		if (sim.ctxByName(P.pos[3])) {
			ctx.eprintln(`error: cannot rename the context "${P.pos[2]}", the context "${P.pos[3]}" already exists in ${path}`);
			return 1;
		}
		c.name = P.pos[3];
		if (kc.current === P.pos[2]) kc.current = P.pos[3];
		ctx.println(`Context "${P.pos[2]}" renamed to "${P.pos[3]}".`);
		return 0;
	}
	if (sub === "delete-context") {
		const c = sim.ctxByName(P.pos[2]);
		if (!c) {
			ctx.eprintln(`error: cannot delete context ${P.pos[2]}, not in ${path}`);
			return 1;
		}
		kc.contexts = kc.contexts.filter((x) => x !== c);
		if (kc.current === c.name) {
			kc.current = "";
			ctx.eprintln("warning: this removed your active context, use \"kubectl config use-context\" to select a different one");
		}
		ctx.println(`deleted context ${P.pos[2]} from ${path}`);
		return 0;
	}
	if (sub === "delete-cluster") {
		if (!sim.clusterEntry(P.pos[2])) {
			ctx.eprintln(`error: cannot delete cluster ${P.pos[2]}, not in ${path}`);
			return 1;
		}
		kc.clusters = kc.clusters.filter((x) => x.name !== P.pos[2]);
		ctx.println(`deleted cluster ${P.pos[2]} from ${path}`);
		return 0;
	}
	if (sub === "delete-user") {
		if (!sim.userEntry(P.pos[2])) {
			ctx.eprintln(`error: cannot delete user ${P.pos[2]}, not in ${path}`);
			return 1;
		}
		kc.users = kc.users.filter((x) => x.name !== P.pos[2]);
		ctx.println(`deleted user ${P.pos[2]} from ${path}`);
		return 0;
	}
	if (sub === "unset") {
		if (P.pos[2] === "current-context") {
			kc.current = "";
			ctx.println("Property \"current-context\" unset.");
			return 0;
		}
		ctx.eprintln("error: only \"unset current-context\" is simulated");
		return 1;
	}
	if (sub === "set-context") {
		const name = P.has("current") ? kc.current : P.pos[2];
		if (!name) {
			ctx.eprintln("error: you cannot specify a context name with --current when there is no current context");
			return 1;
		}
		let c = sim.ctxByName(name);
		let verb = "modified";
		if (!c) {
			c = {
				name,
				cluster: "",
				user: "",
				namespace: ""
			};
			kc.contexts.push(c);
			verb = "created";
		}
		if (P.f.cluster) c.cluster = P.f.cluster;
		if (P.f.user) c.user = P.f.user;
		if (P.f.namespace !== void 0 || P.f.n !== void 0) c.namespace = P.f.namespace !== void 0 ? P.f.namespace : P.f.n;
		ctx.println(`Context "${name}" ${verb}.`);
		return 0;
	}
	if (sub === "set-credentials") {
		const name = P.pos[2];
		let auth = null;
		if (P.f.token) auth = {
			kind: "token",
			token: P.f.token
		};
		else if (P.f["client-certificate"]) {
			const cert = ctx.fs.read(ctx.resolve(P.f["client-certificate"]));
			if (cert === void 0) {
				ctx.eprintln(`error: unable to read client-cert ${P.f["client-certificate"]} for ${name} due to open ${P.f["client-certificate"]}: no such file or directory`);
				return 1;
			}
			const m = /CN=([^;\n]+);O=([^;\n]*)/.exec(cert);
			if (!m) {
				ctx.eprintln("error: the certificate file is not a valid (simulated) certificate");
				return 1;
			}
			auth = {
				kind: "cert",
				cn: m[1],
				groups: m[2].split(",").filter(Boolean)
			};
		} else {
			ctx.eprintln("error: supported: set-credentials NAME --token=… | --client-certificate=… --client-key=…");
			return 1;
		}
		const ex = sim.userEntry(name);
		if (ex) ex.auth = auth;
		else kc.users.push({
			name,
			auth
		});
		ctx.println(`User "${name}" set.`);
		return 0;
	}
	if (sub === "set-cluster") {
		const ex = sim.clusterEntry(P.pos[2]);
		if (ex) {
			if (P.f.server) ex.server = P.f.server;
		} else kc.clusters.push({
			name: P.pos[2],
			server: P.f.server || "https://localhost:6443"
		});
		ctx.println(`Cluster "${P.pos[2]}" set.`);
		return 0;
	}
	ctx.eprintln("error: supported: view, current-context, get-contexts|clusters|users, use-context, rename-context, delete-context|cluster|user, set-context, set-credentials, set-cluster, unset current-context");
	return 1;
};
KV["cluster-info"] = async (ctx, K) => {
	ctx.println(`Kubernetes control plane is running at ${K.cl.api}\n${K.cl.tool === "gke" ? "GLBCDefaultBackend" : "CoreDNS"} is running at ${K.cl.api}/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy\n\nTo further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.`);
	return 0;
};
KV.version = async (ctx, K, P) => {
	ctx.println("Client Version: v1.36.1\nKustomize Version: v5.8.1");
	if (!P.has("client")) {
		ctx.sim.kubeconfig.current;
		const c = ctx.sim.currentCluster();
		if (c && c.apiUp()) ctx.println("Server Version: " + c.k8sVersion);
		else ctx.eprintln("The connection to the server localhost:8080 was refused - did you specify the right host or port?");
	}
	return 0;
};
KV["api-resources"] = async (ctx) => {
	ctx.println(PG.table(Object.entries(PG.KINDS).map(([p, k]) => [
		p,
		k.names.filter((n) => n !== p && n !== k.kind.toLowerCase()).join(","),
		k.api,
		String(k.ns),
		k.kind
	]), [
		"NAME",
		"SHORTNAMES",
		"APIVERSION",
		"NAMESPACED",
		"KIND"
	]));
	return 0;
};
KV.certificate = async (ctx, K, P) => {
	const cl = K.cl;
	if (P.pos[1] !== "approve" && P.pos[1] !== "deny") {
		ctx.eprintln("error: supported: certificate approve NAME");
		return 1;
	}
	const c = cl.find("certificatesigningrequests", P.pos[2]);
	if (!c) {
		ctx.eprintln(`Error from server (NotFound): certificatesigningrequests.certificates.k8s.io "${P.pos[2]}" not found`);
		return 1;
	}
	if (!PG.kcCan(K, "update", "certificatesigningrequests", null, "approval")) return PG.kcForbid(ctx, K, "certificatesigningrequests", "update", P.pos[2], null, "approval");
	const req = PG.unb64(c.spec.request || "");
	const m = /CN=([^;\n]+);O=([^;\n]*)/.exec(req);
	if (!m) {
		ctx.eprintln("error: the request is not a valid (simulated) CSR");
		return 1;
	}
	c.status = {
		conditions: [{
			type: P.pos[1] === "approve" ? "Approved" : "Denied",
			status: "True",
			reason: "KubectlApprove"
		}],
		certificate: PG.b64(`-----BEGIN CERTIFICATE-----\nCN=${m[1]};O=${m[2]};SIGNED-BY=kubernetes-ca\n-----END CERTIFICATE-----\n`)
	};
	ctx.println(`certificatesigningrequest.certificates.k8s.io/${P.pos[2]} ${P.pos[1] === "approve" ? "approved" : "denied"}`);
	return 0;
};
KV.patch = async (ctx, K, P) => {
	const cl = K.cl;
	const t = PG.parseTargets(P.pos.slice(1))[0];
	if (!t || !t.plural || !t.name || !P.f.p) {
		ctx.eprintln("error: patch needs TYPE NAME -p PATCH");
		return 1;
	}
	if (P.f.type && P.f.type !== "merge" && P.f.type !== "strategic") {
		ctx.eprintln("error: only --type=merge / strategic are simulated");
		return 1;
	}
	let patch;
	try {
		patch = JSON.parse(P.f.p);
	} catch (e) {
		ctx.eprintln(`error: unable to parse "${P.f.p}": ${e.message}`);
		return 1;
	}
	const o = cl.find(t.plural, t.name, K.ns);
	if (!o) {
		ctx.eprintln(`Error from server (NotFound): ${t.plural} "${t.name}" not found`);
		return 1;
	}
	if (!PG.kcCan(K, "patch", t.plural, K.ns)) return PG.kcForbid(ctx, K, t.plural, "patch", t.name, K.ns);
	const before = JSON.stringify(o);
	const merged = PG.deepMerge(PG.clone({
		...o,
		status: void 0
	}), patch);
	for (const k of Object.keys(merged)) if (!k.startsWith("_")) o[k] = merged[k];
	ctx.println(`${PG.fqName(t.plural, t.name)} ${JSON.stringify(o) === before ? "patched (no change)" : "patched"}`);
	return 0;
};
KV.events = async (ctx, K, P) => KV.get(ctx, K, {
	...P,
	pos: ["get", "events"],
	f: {
		...P.f,
		"sort-by": ".lastTimestamp"
	}
});
PG.KC_HELP = `kubectl controls the Kubernetes cluster manager (simulated).

Basic:     get describe create apply delete run expose scale autoscale set label annotate taint patch
Rollout:   rollout status|restart|history|undo
Debug:     logs exec port-forward top events cordon uncordon drain
Access:    auth can-i | auth whoami | certificate approve | create token | create role|rolebinding|serviceaccount
Config:    config view|current-context|get-contexts|use-context|set-context|set-credentials|rename-context|delete-context
Other:     cluster-info version api-resources

Flags:  -n NAMESPACE  -A  -o wide|yaml|json|name|jsonpath=…  -l SELECTOR  --context CTX  --as USER  -f FILE|-  -w`;
PG.commands.kubectl = async (ctx, args) => {
	let P = PG.kcParse(args);
	if (P.pos[0] === "logs") P = PG.kcParse(args, [], [
		"f",
		"follow",
		"p",
		"previous"
	]);
	const verb = P.pos[0];
	if (!verb || verb === "help" || P.has("help") && !verb) {
		ctx.println(PG.KC_HELP);
		return 0;
	}
	if (P.has("help") || P.has("h")) {
		ctx.println(`Usage: kubectl ${verb} … (see "kubectl" for the list of simulated commands)`);
		return 0;
	}
	if (verb === "config") return KV.config(ctx, null, P);
	if (verb === "version" && P.has("client")) return KV.version(ctx, null, P);
	const fn = KV[verb];
	if (!fn) {
		ctx.eprintln(`error: unknown command "${verb}" for "kubectl" (the playground simulates: get describe create apply delete run expose scale autoscale set label taint rollout logs exec port-forward top drain auth config …)`);
		return 1;
	}
	const K = PG.kcConnect(ctx, P);
	if (!K) return 1;
	K.ctxP = P;
	const ctx2 = Object.create(ctx);
	ctx2.K = K;
	const rc = await fn(ctx, K, P);
	if (![
		"get",
		"describe",
		"logs",
		"top",
		"auth",
		"version",
		"cluster-info",
		"api-resources",
		"events"
	].includes(verb) && K.cl.apiUp()) K.cl.tick(0);
	return rc;
};
PG.commands.kubectl.verbs = Object.keys(KV);
PG.parseDuration = (s) => {
	if (s === void 0 || s === null) return 30;
	const m = /^(\d+)(s|m|h)?$/.exec(String(s));
	if (!m) return 30;
	return Number(m[1]) * {
		s: 1,
		m: 60,
		h: 3600
	}[m[2] || "s"];
};
PG.condMet = (cl, plural, o, cond) => {
	const c = cond.toLowerCase();
	const want = /=false$/.test(c) ? false : true;
	const name = c.replace(/^condition=/, "").replace(/=(true|false)$/, "");
	let v = null;
	if (plural === "pods") v = name === "ready" || name === "containersready" ? cl.podReady(o) : name === "initialized" ? !(o.spec.initContainers || []).length || ["running", "done"].includes(o._sim.stage) : name === "podscheduled" ? !!o.spec.nodeName : null;
	else if (plural === "deployments") v = name === "available" ? ((o.status || {}).availableReplicas || 0) >= (o.spec.replicas === void 0 ? 1 : o.spec.replicas) : name === "progressing" ? true : null;
	else if (plural === "jobs") v = name === "complete" ? !!(o.status || {}).succeeded : name === "failed" ? false : null;
	else if (plural === "nodes") v = name === "ready" ? o._node.ready : null;
	else if (plural === "certificatesigningrequests") v = name === "approved" ? !!(o.status && o.status.conditions && o.status.conditions[0]) : null;
	else if (plural === "namespaces") v = name === "active" ? !o._deleteAt : null;
	return v === null ? null : v === want;
};
var KV2 = PG.KV;
KV2.wait = async (ctx, K, P) => {
	const cl = K.cl;
	const forv = P.f.for;
	if (!forv) {
		ctx.eprintln("error: You must specify at least one of: --for=delete, --for=condition=…, --for=jsonpath=…");
		return 1;
	}
	let targets = PG.parseTargets(P.pos.slice(1));
	if (!targets.length || targets.some((t) => !t.plural)) {
		ctx.eprintln("error: the server doesn't have that resource type");
		return 1;
	}
	let list = [];
	for (const t of targets) {
		let objs = PG.listObjs(cl, t.plural, K.ns, P.has("A"));
		if (t.name) objs = objs.filter((x) => x.metadata.name === t.name);
		else if (P.f.l) objs = objs.filter((x) => PG.sel(P.f.l, x.metadata.labels));
		else if (!P.has("all")) objs = [];
		if (t.name && !objs.length && forv !== "delete") {
			ctx.eprintln(`Error from server (NotFound): ${t.plural} "${t.name}" not found`);
			return 1;
		}
		for (const o of objs) list.push({
			plural: t.plural,
			name: o.metadata.name,
			ns: o.metadata.namespace
		});
	}
	if (!list.length) {
		ctx.eprintln(`error: no matching resources found`);
		return 1;
	}
	const tmo = PG.parseDuration(P.f.timeout);
	const t0 = ctx.sim.clock;
	const met = /* @__PURE__ */ new Set();
	const check = (it) => {
		const o = it.plural === "nodes" ? cl.nodeByName(it.name) && PG.nodeObj(cl, cl.nodeByName(it.name)) : cl.find(it.plural, it.name, it.ns);
		if (forv === "delete") return !o;
		if (!o) return false;
		if (/^condition=/i.test(forv)) {
			const r = PG.condMet(cl, it.plural, o, forv);
			if (r === null) {
				ctx.eprintln(`error: condition "${forv.replace(/^condition=/i, "")}" is not supported for ${it.plural} in the playground`);
				throw { abort: true };
			}
			return r;
		}
		const m = /^jsonpath=(.*?)=(.*)$/.exec(forv);
		if (m) return PG.jsonPath(m[1], PG.cleanForOutput(cl, it.plural, o)) === m[2];
		return false;
	};
	try {
		while (true) {
			for (const it of list) if (!met.has(it) && check(it)) {
				met.add(it);
				ctx.println(`${PG.fqName(it.plural, it.name)} ${forv === "delete" ? "deleted" : "condition met"}`);
			}
			if (met.size === list.length) return 0;
			if (ctx.sim.clock - t0 >= tmo) {
				const miss = list.find((it) => !met.has(it));
				ctx.eprintln(`error: timed out waiting for the condition on ${miss.plural}/${miss.name}`);
				return 1;
			}
			await ctx.sleep(1);
		}
	} catch (e) {
		if (e && e.abort && !ctx.aborted()) return 1;
		throw e;
	}
};
KV2.cp = async (ctx, K, P) => {
	const cl = K.cl;
	const [src, dst] = P.pos.slice(1);
	if (!src || !dst) {
		ctx.eprintln("error: two arguments are required: kubectl cp SRC DEST (POD:path or local path)");
		return 1;
	}
	const parse = (x) => {
		const m = /^(?:([\w-]+)\/)?([\w.-]+):(\/.*|[^/].*)$/.exec(x);
		return m && !x.startsWith("/") && !x.startsWith(".") ? {
			ns: m[1],
			pod: m[2],
			path: m[3]
		} : { path: x };
	};
	const a = parse(src), b = parse(dst);
	const side = a.pod ? a : b;
	if (!side.pod) {
		ctx.eprintln("error: one of src or dest must be a remote file specification");
		return 1;
	}
	const pod = cl.find("pods", side.pod, side.ns || K.ns);
	if (!pod) {
		ctx.eprintln(`Error from server (NotFound): pods "${side.pod}" not found`);
		return 1;
	}
	if (!cl.podReady(pod) && cl.podStatus(pod) !== "Running") {
		ctx.eprintln(`error: unable to upgrade connection: container not found ("${pod.spec.containers[0].name}")`);
		return 1;
	}
	if (!PG.kcCan(K, "create", "pods", pod.metadata.namespace, "exec")) return PG.kcForbid(ctx, K, "pods", "create", pod.metadata.name, pod.metadata.namespace, "exec");
	const cname = P.f.c || P.f.container || pod.spec.containers[0].name;
	const fs = PG.podFS(cl, pod, cname);
	if (a.pod) {
		const content = fs.read(a.path);
		if (content === void 0) {
			ctx.eprintln(`tar: ${a.path}: Cannot stat: No such file or directory\nerror: ${a.path} no such file or directory`);
			return 1;
		}
		if (a.path.startsWith("/")) ctx.eprintln("tar: removing leading '/' from member names");
		let d = ctx.resolve(b.path);
		if (ctx.fs.isDir(d)) d += "/" + a.path.split("/").pop();
		ctx.fs.write(d, content);
		return 0;
	}
	const content = ctx.fs.read(ctx.resolve(a.path));
	if (content === void 0) {
		ctx.eprintln(`error: ${a.path}: no such file or directory`);
		return 1;
	}
	let d = b.path;
	if (fs.isDir(d.replace(/\/$/, "")) || d.endsWith("/")) d = d.replace(/\/$/, "") + "/" + a.path.split("/").pop();
	fs.write(d, content);
	PG.syncVols(cl, pod, cname);
	return 0;
};
KV2.debug = async (ctx, K, P) => {
	const cl = K.cl;
	const t = P.pos[1];
	if (!t) {
		ctx.eprintln("error: debug requires a pod name");
		return 1;
	}
	const pod = cl.find("pods", t.replace(/^pods?\//, ""), K.ns);
	if (!pod) {
		ctx.eprintln(`Error from server (NotFound): pods "${t}" not found`);
		return 1;
	}
	if (!P.f.image) {
		ctx.eprintln("error: --image is required to debug a pod");
		return 1;
	}
	if (!PG.kcCan(K, "patch", "pods", K.ns, "ephemeralcontainers")) return PG.kcForbid(ctx, K, "pods", "patch", pod.metadata.name, K.ns, "ephemeralcontainers");
	const nm = P.f.c || P.f.container || "debugger-" + PG.rnd(5);
	ctx.eprintln(`Defaulting debug container name to ${nm}.`);
	pod.spec.ephemeralContainers = [...pod.spec.ephemeralContainers || [], {
		name: nm,
		image: P.f.image,
		...P.f.target ? { targetContainerName: P.f.target } : {}
	}];
	const tty = P.has("t") && P.has("i");
	const argv = P.dd || [];
	if (tty && (!argv.length || /^(\/bin\/)?(ba|a|z)?sh$/.test(argv[0]))) {
		ctx.sh.session = PG.makePodShell(ctx.sim, {
			cl,
			pod,
			term: ctx.sh.term,
			interactive: true,
			container: nm
		});
		ctx.eprintln("If you don't see a command prompt, try pressing enter.");
		return 0;
	}
	if (argv.length) {
		const r = await PG.execInPod(ctx, cl, pod, argv, nm);
		if (r.out) ctx.println(r.out);
		if (r.err) ctx.eprintln(r.err);
		return r.code || 0;
	}
	return 0;
};
KV2.replace = async (ctx, K, P) => {
	const m = PG.readManifest(ctx, P);
	if (m.err) {
		ctx.eprintln(m.err);
		return 1;
	}
	ctx.src = m.src;
	let code = 0;
	for (const d of m.docs) {
		const plural = PG.KIND_OF[d.kind];
		const ns = (d.metadata || {}).namespace || K.ns;
		if (plural && !K.cl.find(plural, (d.metadata || {}).name, ns) && !P.has("force")) {
			ctx.eprintln(`Error from server (NotFound): error when replacing "${m.src}": ${plural} "${(d.metadata || {}).name}" not found`);
			code = 1;
			continue;
		}
		if (plural && !PG.kcCan(K, "update", plural, ns)) {
			PG.kcForbid(ctx, K, plural, "update", d.metadata.name, ns);
			code = 1;
			continue;
		}
		const r = PG.mkObject(ctx, K, d, K.ns, "apply");
		if (r.err) {
			ctx.eprintln(r.err);
			code = 1;
			continue;
		}
		ctx.println(`${PG.fqName(r.plural, r.name)} replaced`);
	}
	return code;
};
var rolloutBase = KV2.rollout;
KV2.rollout = async (ctx, K, P) => {
	const sub = P.pos[1];
	if (sub === "pause" || sub === "resume") {
		const t = PG.parseTargets(P.pos.slice(2))[0];
		const d = t && K.cl.find("deployments", t.name, K.ns);
		if (!d) {
			ctx.eprintln(`Error from server (NotFound): deployments.apps "${t ? t.name : ""}" not found`);
			return 1;
		}
		if (!PG.kcCan(K, "patch", "deployments", K.ns)) return PG.kcForbid(ctx, K, "deployments", "patch", t.name, K.ns);
		if (sub === "pause") {
			if (d.spec.paused) {
				ctx.eprintln(`error: deployments.apps "${t.name}" is already paused`);
				return 1;
			}
			d.spec.paused = true;
			ctx.println(`deployment.apps/${t.name} paused`);
		} else {
			if (!d.spec.paused) {
				ctx.eprintln(`error: deployments.apps "${t.name}" is not paused`);
				return 1;
			}
			delete d.spec.paused;
			ctx.println(`deployment.apps/${t.name} resumed`);
		}
		return 0;
	}
	return rolloutBase(ctx, K, P);
};
KV2.edit = async (ctx, K, P) => {
	const cl = K.cl;
	const t = PG.parseTargets(P.pos.slice(1))[0];
	if (!t || !t.plural || !t.name) {
		ctx.eprintln("error: kubectl edit TYPE NAME  (e.g. kubectl edit deployment web -n web)");
		return 1;
	}
	if (t.plural === "nodes" || t.plural === "events") {
		ctx.eprintln(`error: editing ${t.plural} is not supported in the playground (try deployments, services, configmaps…)`);
		return 1;
	}
	const o = cl.find(t.plural, t.name, K.ns);
	if (!o) {
		ctx.eprintln(`Error from server (NotFound): ${t.plural} "${t.name}" not found`);
		return 1;
	}
	if (!PG.kcCan(K, "update", t.plural, K.ns)) return PG.kcForbid(ctx, K, t.plural, "update", t.name, K.ns);
	const path = `/tmp/kubectl-edit-${PG.hex(8)}.yaml`;
	const header = "# Please edit the object below. Lines beginning with a '#' will be ignored,\n# and an empty file will abort the edit. If an error occurs while saving this file will be\n# reopened with the relevant failures.\n#\n";
	const orig = PG.yaml.dump(PG.cleanForOutput(cl, t.plural, o));
	ctx.fs.write(path, header + orig);
	if (ctx.sim.autoEdit) ctx.fs.write(path, ctx.sim.autoEdit(header + orig));
	else {
		ctx.eprintln(`Editing ${path} …  Open the Files tab (the banner above the terminal has an "Open" button), change the YAML, press Save, then press Apply — or Cancel.`);
		const pe = ctx.sim.pendingEdit = {
			path,
			title: `${PG.KINDS[t.plural].kind.toLowerCase()}/${t.name}`,
			result: void 0
		};
		const ok = await ctx.sim.waitFor(() => pe.result !== void 0, ctx.sh, 1e9);
		ctx.sim.pendingEdit = null;
		ctx.sim.notify();
		if (!ok || pe.result !== "apply") {
			ctx.eprintln("Edit cancelled, no changes made.");
			return 0;
		}
	}
	const text = (ctx.fs.read(path) || "").split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
	if (!text.trim()) {
		ctx.eprintln("Edit cancelled, saved file was empty.");
		return 0;
	}
	if (text.trim() === orig.trim()) {
		ctx.eprintln("Edit cancelled, no changes made.");
		return 0;
	}
	let docs;
	try {
		docs = PG.yaml.parseDocs(text);
	} catch (e) {
		ctx.eprintln(`error: ${e.message}\nA copy of your changes has been stored to "${path}"`);
		return 1;
	}
	ctx.src = path;
	const r = PG.mkObject(ctx, K, docs[0], K.ns, "apply");
	if (r.err) {
		ctx.eprintln(r.err + `\nA copy of your changes has been stored to "${path}"`);
		return 1;
	}
	ctx.println(`${PG.fqName(r.plural, r.name)} edited`);
	ctx.fs.remove(path);
	return 0;
};
var createBase = KV2.create;
KV2.create = async (ctx, K, P) => {
	const what = P.pos[1];
	const name = P.pos[2];
	const cl = K.cl;
	const ns = K.ns;
	if (P.f.f) return createBase(ctx, K, P);
	const can = (pl, n) => PG.kcCan(K, "create", pl, ns) || (PG.kcForbid(ctx, K, pl, "create", n, ns), false);
	if (what === "cronjob" || what === "cj") {
		if (!name || !P.f.image || !P.f.schedule) {
			ctx.eprintln("error: usage: kubectl create cronjob NAME --image=IMAGE --schedule=\"*/1 * * * *\" [-- COMMAND]");
			return 1;
		}
		if (!PG.needNs(ctx, K, ns) || !can("cronjobs", name)) return 1;
		if (cl.find("cronjobs", name, ns)) {
			ctx.eprintln(`Error from server (AlreadyExists): cronjobs.batch "${name}" already exists`);
			return 1;
		}
		cl.mk("cronjobs", name, ns, {
			spec: {
				schedule: P.f.schedule,
				jobTemplate: { spec: { template: { spec: {
					containers: [{
						name,
						image: P.f.image,
						...P.dd ? { command: P.dd } : {}
					}],
					restartPolicy: P.f.restart || "OnFailure"
				} } } }
			},
			status: {}
		});
		ctx.println(`cronjob.batch/${name} created`);
		return 0;
	}
	if (what === "ingress" || what === "ing") {
		const rules = [].concat(P.f.rule || []);
		if (!name || !rules.length) {
			ctx.eprintln("error: usage: kubectl create ingress NAME --rule=\"host/path=service:port\"  (e.g. --rule=\"web.local/*=web:80\")");
			return 1;
		}
		if (!PG.needNs(ctx, K, ns) || !can("ingresses", name)) return 1;
		if (cl.find("ingresses", name, ns)) {
			ctx.eprintln(`Error from server (AlreadyExists): ingresses.networking.k8s.io "${name}" already exists`);
			return 1;
		}
		const byHost = {};
		for (const r of rules) {
			const m = /^([^/=]*)(\/[^=]*)?=([\w.-]+):(\w+)(?:,(.*))?$/.exec(r);
			if (!m) {
				ctx.eprintln(`error: invalid ingress rule: "${r}" (expected host/path=service:port)`);
				return 1;
			}
			const path = (m[2] || "/").replace(/\*$/, "") || "/";
			(byHost[m[1]] = byHost[m[1]] || []).push({
				path,
				pathType: /\*$/.test(m[2] || "") ? "Prefix" : m[2] ? "Exact" : "Prefix",
				backend: { service: {
					name: m[3],
					port: /^\d+$/.test(m[4]) ? { number: Number(m[4]) } : { name: m[4] }
				} }
			});
		}
		cl.mk("ingresses", name, ns, {
			spec: {
				...P.f.class ? { ingressClassName: P.f.class } : {},
				rules: Object.entries(byHost).map(([host, paths]) => ({
					...host ? { host } : {},
					http: { paths }
				}))
			},
			status: {}
		});
		ctx.println(`ingress.networking.k8s.io/${name} created`);
		return 0;
	}
	if ((what === "pdb" || what === "poddisruptionbudget") && name) {
		if (!P.f.selector) {
			ctx.eprintln("error: --selector is required");
			return 1;
		}
		if (!PG.needNs(ctx, K, ns) || !can("poddisruptionbudgets", name)) return 1;
		const ml = {};
		for (const kv of P.f.selector.split(",")) {
			const [k, v] = kv.split("=");
			ml[k] = v;
		}
		cl.mk("poddisruptionbudgets", name, ns, { spec: {
			selector: { matchLabels: ml },
			...P.f["min-available"] !== void 0 ? { minAvailable: isNaN(Number(P.f["min-available"])) ? P.f["min-available"] : Number(P.f["min-available"]) } : {},
			...P.f["max-unavailable"] !== void 0 ? { maxUnavailable: Number(P.f["max-unavailable"]) } : {}
		} });
		ctx.println(`poddisruptionbudget.policy/${name} created`);
		return 0;
	}
	if (what === "secret" && P.pos[2] === "tls") {
		const sn = P.pos[3];
		const c = ctx.fs.read(ctx.resolve(P.f.cert || "")), k = ctx.fs.read(ctx.resolve(P.f.key || ""));
		if (!sn || c === void 0 || k === void 0) {
			ctx.eprintln("error: usage: kubectl create secret tls NAME --cert=FILE --key=FILE");
			return 1;
		}
		if (!PG.needNs(ctx, K, ns) || !can("secrets", sn)) return 1;
		cl.mk("secrets", sn, ns, {
			type: "kubernetes.io/tls",
			data: {
				"tls.crt": PG.b64(c),
				"tls.key": PG.b64(k)
			}
		});
		ctx.println(`secret/${sn} created`);
		return 0;
	}
	return createBase(ctx, K, P);
};
PG.EXPLAIN = {
	pod: {
		kind: "Pod",
		version: "v1",
		desc: "Pod is a collection of containers that can run on a host. This resource is created by clients and scheduled onto hosts.",
		top: [
			["apiVersion", "string"],
			["kind", "string"],
			["metadata", "ObjectMeta"],
			["spec", "PodSpec"],
			["status", "PodStatus"]
		],
		spec: [
			[
				"containers",
				"[]Container",
				"List of containers belonging to the pod. Cannot be updated. (required)"
			],
			[
				"initContainers",
				"[]Container",
				"Containers that run to completion, in order, before the app containers start."
			],
			[
				"nodeSelector",
				"map[string]string",
				"Only schedule onto nodes whose labels match ALL of these."
			],
			[
				"tolerations",
				"[]Toleration",
				"Lets the pod be scheduled onto tainted nodes."
			],
			[
				"serviceAccountName",
				"string",
				"The ServiceAccount the pod runs as."
			],
			[
				"imagePullSecrets",
				"[]LocalObjectReference",
				"Secrets holding registry credentials (e.g. regsecret)."
			],
			[
				"volumes",
				"[]Volume",
				"Volumes that containers can mount."
			],
			[
				"restartPolicy",
				"string",
				"Always (default), OnFailure or Never."
			],
			[
				"affinity",
				"Affinity",
				"Scheduling constraints (node/pod affinity and anti-affinity)."
			],
			[
				"securityContext",
				"PodSecurityContext",
				"Pod-level security attributes."
			]
		]
	},
	deployment: {
		kind: "Deployment",
		group: "apps",
		version: "v1",
		desc: "Deployment enables declarative updates for Pods and ReplicaSets.",
		top: [
			["apiVersion", "string"],
			["kind", "string"],
			["metadata", "ObjectMeta"],
			["spec", "DeploymentSpec"],
			["status", "DeploymentStatus"]
		],
		spec: [
			[
				"replicas",
				"integer",
				"Number of desired pods. Defaults to 1."
			],
			[
				"selector",
				"LabelSelector",
				"Which pods this Deployment manages. Must match template labels. Immutable. (required)"
			],
			[
				"template",
				"PodTemplateSpec",
				"The pod template. Changing it triggers a rollout. (required)"
			],
			[
				"strategy",
				"DeploymentStrategy",
				"RollingUpdate (default) or Recreate; maxSurge / maxUnavailable."
			],
			[
				"revisionHistoryLimit",
				"integer",
				"Old ReplicaSets to keep for rollback (default 10)."
			]
		]
	},
	service: {
		kind: "Service",
		version: "v1",
		desc: "Service is a named abstraction of software service consisting of local port that the proxy listens on, and the selector that determines which pods will answer requests.",
		top: [
			["apiVersion", "string"],
			["kind", "string"],
			["metadata", "ObjectMeta"],
			["spec", "ServiceSpec"],
			["status", "ServiceStatus"]
		],
		spec: [
			[
				"type",
				"string",
				"ClusterIP (default), NodePort, LoadBalancer or ExternalName."
			],
			[
				"selector",
				"map[string]string",
				"Route traffic to pods with these labels."
			],
			[
				"ports",
				"[]ServicePort",
				"port, targetPort, nodePort, protocol, name."
			],
			[
				"clusterIP",
				"string",
				"Stable virtual IP, allocated automatically."
			]
		]
	},
	ingress: {
		kind: "Ingress",
		group: "networking.k8s.io",
		version: "v1",
		desc: "Ingress is a collection of rules that allow inbound connections to reach the endpoints defined by a backend.",
		top: [
			["apiVersion", "string"],
			["kind", "string"],
			["metadata", "ObjectMeta"],
			["spec", "IngressSpec"]
		],
		spec: [
			[
				"ingressClassName",
				"string",
				"Which controller handles this Ingress (e.g. nginx, traefik)."
			],
			[
				"rules",
				"[]IngressRule",
				"host + http.paths[] → backend.service{name, port}."
			],
			[
				"tls",
				"[]IngressTLS",
				"hosts and the Secret holding the certificate."
			]
		]
	},
	configmap: {
		kind: "ConfigMap",
		version: "v1",
		desc: "ConfigMap holds configuration data for pods to consume.",
		top: [
			["apiVersion", "string"],
			["kind", "string"],
			["metadata", "ObjectMeta"],
			["data", "map[string]string"],
			["binaryData", "map[string][]byte"]
		],
		spec: []
	},
	secret: {
		kind: "Secret",
		version: "v1",
		desc: "Secret holds secret data of a certain type. Values are base64-encoded, not encrypted.",
		top: [
			["apiVersion", "string"],
			["kind", "string"],
			["metadata", "ObjectMeta"],
			["type", "string"],
			["data", "map[string][]byte"],
			["stringData", "map[string]string"]
		],
		spec: []
	},
	namespace: {
		kind: "Namespace",
		version: "v1",
		desc: "Namespace provides a scope for Names. Use of multiple namespaces is optional.",
		top: [
			["apiVersion", "string"],
			["kind", "string"],
			["metadata", "ObjectMeta"],
			["spec", "NamespaceSpec"],
			["status", "NamespaceStatus"]
		],
		spec: []
	},
	job: {
		kind: "Job",
		group: "batch",
		version: "v1",
		desc: "Job represents the configuration of a single job.",
		top: [
			["apiVersion", "string"],
			["kind", "string"],
			["metadata", "ObjectMeta"],
			["spec", "JobSpec"]
		],
		spec: [
			[
				"template",
				"PodTemplateSpec",
				"Pod template; restartPolicy must be Never or OnFailure. (required)"
			],
			[
				"backoffLimit",
				"integer",
				"Retries before marking the Job failed (default 6)."
			],
			[
				"completions",
				"integer",
				"Pods that must finish successfully."
			]
		]
	}
};
KV2.explain = async (ctx, K, P) => {
	const [base, ...path] = (P.pos[1] || "").split(".");
	const key = PG.resolveKind(base) ? PG.KINDS[PG.resolveKind(base)].kind.toLowerCase() : base.toLowerCase();
	const e = PG.EXPLAIN[key];
	if (!e) {
		ctx.eprintln(`error: the server doesn't have a resource type "${base}" (the playground documents: ${Object.keys(PG.EXPLAIN).join(", ")})`);
		return 1;
	}
	const row = ([n, t, d]) => `  ${n}\t<${t}>${d ? "\n    " + d : ""}`;
	if (!path.length) {
		ctx.println(`${e.group ? "GROUP:      " + e.group + "\n" : ""}KIND:       ${e.kind}\nVERSION:    ${e.version}\n\nDESCRIPTION:\n    ${e.desc}\n\nFIELDS:\n${e.top.map(row).join("\n")}`);
		return 0;
	}
	if (path[0] === "spec" && e.spec.length) {
		ctx.println(`KIND:       ${e.kind}\nVERSION:    ${e.version}\n\nFIELD: spec <${(e.top.find((x) => x[0] === "spec") || [])[1]}>\n\nFIELDS:\n${e.spec.map(row).join("\n")}`);
		return 0;
	}
	ctx.eprintln(`error: field "${path.join(".")}" does not exist in the playground's short docs (try: kubectl explain ${key}.spec)`);
	return 1;
};
PG.pathTokens = (path) => {
	const toks = [];
	let i = 0;
	while (i < path.length) {
		const c = path[i];
		if (c === ".") {
			if (path[i + 1] === "[") {
				i++;
				continue;
			}
			let j = i + 1, name = "";
			while (j < path.length && !(".[".includes(path[j]) && path[j - 1] !== "\\")) {
				name += path[j] === "\\" ? "" : path[j];
				j++;
			}
			toks.push({ f: name });
			i = j;
		} else if (c === "[") {
			let d = 0, j = i;
			for (; j < path.length; j++) if (path[j] === "[") d++;
			else if (path[j] === "]") {
				d--;
				if (d === 0) break;
			}
			toks.push({ b: path.slice(i + 1, j) });
			i = j + 1;
		} else i++;
	}
	return toks;
};
PG.evalPath = (obj, path) => {
	let cur = [obj];
	for (const tk of PG.pathTokens(path.replace(/^\./, "."))) cur = cur.flatMap((c) => {
		if (c === null || c === void 0) return [];
		if (tk.f !== void 0) return [c[tk.f]];
		const b = tk.b;
		if (b === "*") return Array.isArray(c) ? c : Object.values(c);
		if (/^-?\d+$/.test(b)) return [c[Number(b) < 0 ? c.length + Number(b) : Number(b)]];
		if (/^'.*'$|^".*"$/.test(b)) return [c[b.slice(1, -1)]];
		const fm = /^\?\(@(.*?)\s*(==|!=|>=|<=|>|<)\s*(.*)\)$/.exec(b);
		if (fm && Array.isArray(c)) {
			const lit = fm[3].trim().replace(/^["']|["']$/g, "");
			return c.filter((el) => {
				const v = PG.evalPath(el, "." + fm[1].replace(/^\./, ""))[0];
				const a = String(v), bb = lit;
				const num = !isNaN(Number(a)) && !isNaN(Number(bb));
				return {
					"==": a === bb,
					"!=": a !== bb,
					">": num ? Number(a) > Number(bb) : a > bb,
					"<": num ? Number(a) < Number(bb) : a < bb,
					">=": Number(a) >= Number(bb),
					"<=": Number(a) <= Number(bb)
				}[fm[2]];
			});
		}
		const fe = /^\?\(@(\S+)\)$/.exec(b);
		if (fe && Array.isArray(c)) return c.filter((el) => PG.evalPath(el, "." + fe[1].replace(/^\./, ""))[0] !== void 0);
		return [];
	});
	return cur;
};
PG.jsonPath;
PG.jsonPath = (tmpl, root) => {
	const str = (v) => v === void 0 || v === null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
	const parts = [];
	const re = /\{([^}]*(?:\[\?\([^)]*\)\][^}]*)*)\}/g;
	let last = 0, m;
	while (m = re.exec(tmpl)) {
		if (m.index > last) parts.push({
			t: "lit",
			v: tmpl.slice(last, m.index)
		});
		parts.push({
			t: "x",
			v: m[1].trim()
		});
		last = re.lastIndex;
	}
	if (last < tmpl.length) parts.push({
		t: "lit",
		v: tmpl.slice(last)
	});
	const run = (ps, obj) => {
		let s = "";
		for (let k = 0; k < ps.length; k++) {
			const p = ps[k];
			if (p.t === "lit") s += p.v.replace(/\\n/g, "\n").replace(/\\t/g, "	");
			else if (p.v.startsWith("range ")) {
				let depth = 1, j = k + 1;
				while (j < ps.length) {
					if (ps[j].t === "x" && ps[j].v.startsWith("range ")) depth++;
					if (ps[j].t === "x" && ps[j].v === "end") depth--;
					if (!depth) break;
					j++;
				}
				for (const it of PG.evalPath(obj, p.v.slice(6).trim())) s += run(ps.slice(k + 1, j), it);
				k = j;
			} else if (/^"[^"]*"$/.test(p.v)) s += JSON.parse(p.v);
			else if (p.v === "@") s += str(obj);
			else s += PG.evalPath(obj, p.v.startsWith(".") ? p.v : "." + p.v).map(str).join(" ");
		}
		return s;
	};
	return run(parts, root);
};
var getBase = KV2.get;
KV2.get = async (ctx, K, P) => {
	if (P.f.raw !== void 0 || P.has("raw")) {
		const r = P.f.raw || P.pos[1];
		if (r === "/healthz" || r === "/livez" || r === "/readyz") {
			ctx.out("ok");
			return 0;
		}
		if (r === "/version") {
			ctx.println(JSON.stringify({
				major: "1",
				minor: "35",
				gitVersion: K.cl.k8sVersion,
				platform: "linux/arm64"
			}, null, 2));
			return 0;
		}
		ctx.eprintln("error: --raw supports /healthz, /livez, /readyz, /version in the playground");
		return 1;
	}
	const out = P.f.o;
	const cc = out && /^custom-columns=/.exec(out);
	const sortBy = P.f["sort-by"];
	const labelCols = P.f.L ? String(P.f.L).split(",") : null;
	if (!cc && !sortBy && !labelCols) return getBase(ctx, K, P);
	const tokens = P.pos.slice(1);
	const targets = PG.parseTargets(tokens);
	if (!targets.length || targets.some((t) => !t.plural)) return getBase(ctx, K, P);
	const cl = K.cl;
	const all = P.has("A") || P.has("all-namespaces");
	let code = 0;
	let printed = false;
	for (const t of targets) {
		const verb = t.name ? "get" : "list";
		if (!PG.kcCan(K, verb, t.plural, K.ns)) return PG.kcForbid(ctx, K, t.plural, verb, t.name, K.ns);
		let objs = PG.listObjs(cl, t.plural, K.ns, all && PG.KINDS[t.plural].ns);
		if (t.name) objs = objs.filter((x) => x.metadata.name === t.name);
		if (P.f.l) objs = objs.filter((x) => PG.sel(P.f.l, x.metadata.labels));
		if (P.f["field-selector"]) objs = objs.filter((x) => PG.fieldSel(P.f["field-selector"], t.plural, x));
		if (sortBy) {
			const key = (o) => PG.evalPath(PG.cleanForOutput(cl, t.plural, o), sortBy)[0];
			objs.sort((a, b) => {
				const x = key(a), y = key(b);
				const nx = Number(x), ny = Number(y);
				return !isNaN(nx) && !isNaN(ny) ? nx - ny : String(x ?? "").localeCompare(String(y ?? ""));
			});
		}
		if (!objs.length) {
			ctx.eprintln(`No resources found${PG.KINDS[t.plural].ns && !all ? " in " + K.ns + " namespace" : ""}.`);
			continue;
		}
		if (printed) ctx.println("");
		printed = true;
		if (cc) {
			const cols = out.replace(/^custom-columns=/, "").split(",").map((c) => {
				const i = c.indexOf(":");
				return [c.slice(0, i), c.slice(i + 1)];
			});
			const rows = objs.map((o) => {
				const c = PG.cleanForOutput(cl, t.plural, o);
				return cols.map(([, p]) => {
					const v = PG.evalPath(c, p.startsWith(".") ? p : "." + p);
					return v.length ? v.map((x) => x === void 0 || x === null ? "<none>" : typeof x === "object" ? JSON.stringify(x) : String(x)).join(",") : "<none>";
				});
			});
			ctx.println(PG.table(rows, cols.map((c) => c[0])));
		} else {
			const tb = PG.renderTable(cl, t.plural, objs, {
				wide: out === "wide",
				all,
				showLabels: P.has("show-labels")
			});
			if (labelCols) {
				const hdr = [...tb.header, ...labelCols.map((l) => l.toUpperCase())];
				const rows = tb.rows.map((r, i) => [...r, ...labelCols.map((l) => (objs[i].metadata.labels || {})[l] || "<none>")]);
				ctx.println(PG.table(rows, hdr));
			} else ctx.println(tb.text);
		}
	}
	return code;
};
PG.seedChart = (sim, onlyMissing) => {
	const f = PG.CHART_FILES || {};
	let n = 0;
	for (const [p, c] of Object.entries(f)) {
		if (onlyMissing && "/home/user/" + p in sim.fs.files) continue;
		sim.fs.write("/home/user/" + p, c);
		n++;
	}
	sim.fs.mkdirp("/home/user/myapp/charts");
	return n;
};
PG.HELM_VER = "v2.17.0";
PG.helmDate = (t) => {
	const d = new Date(PG.BASE_TIME + t * 1e3);
	const pad = (n) => String(n).padStart(2, "0");
	return `${[
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	][d.getUTCDay()]} ${[
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	][d.getUTCMonth()]} ${d.getUTCDate()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} ${d.getUTCFullYear()}`;
};
PG.tillerInfo = (cl) => {
	const dep = cl.find("deployments", "tiller-deploy", "kube-system");
	if (!dep) return { err: "Error: could not find tiller" };
	const img = dep.spec.template.spec.containers[0].image;
	const ver = (/:(v[\d.]+)/.exec(img) || [])[1] || PG.HELM_VER;
	if (!cl.matchPods("kube-system", dep.spec.selector).some((p) => cl.podReady(p))) return { err: "Error: could not find a ready tiller pod" };
	if (ver !== PG.HELM_VER) return { err: `Error: incompatible versions client[${PG.HELM_VER}] server[${ver}]` };
	return {
		dep,
		ver,
		id: {
			user: `system:serviceaccount:kube-system:${dep.spec.template.spec.serviceAccountName || "default"}`,
			groups: [
				"system:serviceaccounts",
				"system:serviceaccounts:kube-system",
				"system:authenticated"
			]
		}
	};
};
PG.parseSet = (sets, base) => {
	let out = PG.clone(base);
	for (const s of sets) {
		const parts = s.replace(/\\,/g, "").split(",");
		for (const part of parts) {
			const i = part.indexOf("=");
			if (i < 0) continue;
			const key = part.slice(0, i);
			let raw = part.slice(i + 1).replace(/\u0001/g, ",");
			let v;
			if (/^\{.*\}$/.test(raw)) v = raw.slice(1, -1).split(",").filter(Boolean);
			else v = raw === "true" ? true : raw === "false" ? false : raw === "null" ? null : /^-?\d+$/.test(raw) && raw.length < 16 ? Number(raw) : raw;
			const path = key.split(".");
			let cur = out;
			path.forEach((seg, idx) => {
				const m = /^([^\[]+)\[(\d+)\]$/.exec(seg);
				const last = idx === path.length - 1;
				if (m) {
					cur[m[1]] = cur[m[1]] || [];
					if (last) cur[m[1]][Number(m[2])] = v;
					else {
						cur[m[1]][Number(m[2])] = cur[m[1]][Number(m[2])] || {};
						cur = cur[m[1]][Number(m[2])];
					}
				} else if (last) cur[seg] = v;
				else {
					if (!PG.isObj(cur[seg])) cur[seg] = {};
					cur = cur[seg];
				}
			});
		}
	}
	return out;
};
PG.renderChart = (chart, rel) => {
	const T = PG.GoTpl;
	const defs = {};
	const parsedFiles = {};
	const out = [];
	let notes = "";
	try {
		for (const [name, src] of Object.entries(chart.templates)) {
			const full = `${chart.meta.name}/templates/${name}`;
			const parsed = T.parse(src, full);
			parsedFiles[name] = {
				parsed,
				full
			};
			Object.assign(defs, parsed.defs);
		}
	} catch (e) {
		return { err: `Error: parse error in "${chart.meta.name}/templates/": ${e.message}` };
	}
	const kv = chart.meta;
	const data = {
		Values: rel.values,
		Release: {
			Name: rel.name,
			Namespace: rel.namespace,
			Service: "Tiller",
			IsInstall: rel.isInstall,
			IsUpgrade: !rel.isInstall,
			Revision: rel.revision,
			Time: PG.iso(0)
		},
		Chart: {
			Name: kv.name,
			Version: kv.version,
			AppVersion: kv.appVersion,
			Description: kv.description,
			...kv
		},
		Template: {
			BasePath: `${kv.name}/templates`,
			Name: ""
		},
		Files: {
			Get: (p) => chart.fsRead(p) === void 0 ? "" : chart.fsRead(p),
			Glob: () => ({})
		},
		Capabilities: {
			APIVersions: { Has: (v) => /^(v1|apps\/v1|batch\/v1|networking\.k8s\.io\/v1|policy\/v1|autoscaling\/v2|rbac\.authorization\.k8s\.io\/v1)$/.test(v) },
			KubeVersion: {
				Major: "1",
				Minor: "35",
				GitVersion: "v1.35.0"
			}
		}
	};
	const renderFile = (fileName, d) => {
		const pf = parsedFiles[fileName];
		const ctx2 = {
			name: pf.full,
			funcs: {},
			include: null
		};
		const inc = (n, dd) => {
			if (defs[n]) return T.render({ root: { body: defs[n].body } }, dd, {
				...ctx2,
				name: n,
				funcs: { include: inc },
				include: inc
			});
			const m = Object.entries(parsedFiles).find(([, v]) => v.full === n);
			if (m) return T.render(m[1].parsed, dd, {
				name: n,
				funcs: { include: inc },
				include: inc
			});
			throw new T.TplError(`template "${n}" not defined`);
		};
		ctx2.funcs.include = inc;
		ctx2.include = inc;
		ctx2.funcs.tpl = (txt, dd) => T.render(T.parse(txt, "tpl"), dd, ctx2);
		return T.render(pf.parsed, {
			...d,
			Template: {
				...d.Template,
				Name: pf.full
			}
		}, ctx2);
	};
	for (const name of Object.keys(chart.templates).sort()) {
		const base = name.split("/").pop();
		if (base.startsWith("_")) continue;
		try {
			const text = renderFile(name, data);
			if (base === "NOTES.txt") {
				notes = text;
				continue;
			}
			if (text.trim()) out.push({
				file: `${kv.name}/templates/${name}`,
				name,
				text
			});
		} catch (e) {
			if (e.isTpl) return { err: `Error: render error in "${kv.name}/templates/${name}": ${e.message}` };
			throw e;
		}
	}
	return {
		files: out,
		notes: notes.trim() ? notes.replace(/^\n+/, "") : "",
		data
	};
};
PG.HELM_ORDER = [
	"Namespace",
	"ResourceQuota",
	"ServiceAccount",
	"Secret",
	"ConfigMap",
	"PersistentVolumeClaim",
	"Role",
	"ClusterRole",
	"RoleBinding",
	"ClusterRoleBinding",
	"Service",
	"DaemonSet",
	"Pod",
	"Deployment",
	"Job",
	"CronJob",
	"Ingress",
	"NetworkPolicy",
	"HorizontalPodAutoscaler",
	"PodDisruptionBudget"
];
PG.splitDocs = (files, err) => {
	const docs = [];
	for (const f of files) {
		let ds;
		try {
			ds = PG.yaml.parseDocs(f.text);
		} catch (e) {
			return { err: `Error: YAML parse error on ${f.file}: error converting YAML to JSON: ${e.message}` };
		}
		for (const d of ds) {
			if (!PG.isObj(d)) return { err: `Error: YAML parse error on ${f.file}: error converting YAML to JSON: yaml: did not find expected key` };
			if (!d.kind) return { err: `Error: YAML parse error on ${f.file}: error validating data: kind not set` };
			const hk = ((d.metadata || {}).annotations || {})["helm.sh/hook"];
			docs.push({
				doc: d,
				file: f.file,
				hooks: hk ? String(hk).split(",").map((x) => x.trim()) : [],
				w: Number(((d.metadata || {}).annotations || {})["helm.sh/hook-weight"] || 0),
				del: ((d.metadata || {}).annotations || {})["helm.sh/hook-delete-policy"] || ""
			});
		}
	}
	docs.sort((a, b) => (PG.HELM_ORDER.indexOf(a.doc.kind) + 100) % 100 - (PG.HELM_ORDER.indexOf(b.doc.kind) + 100) % 100);
	return { docs };
};
PG.manifestText = (docs) => docs.map((d) => `---\n# Source: ${d.file}\n${PG.yaml.dump(d.doc).trimEnd()}`).join("\n");
PG.releaseTable = (cl, objs) => {
	const groups = {};
	for (const o of objs) {
		const k = PG.KINDS[o.plural];
		const key = `${k.api}/${k.kind}`;
		(groups[key] = groups[key] || []).push(o);
	}
	return Object.entries(groups).map(([k, list]) => {
		const plural = list[0].plural;
		const real = list.map((o) => cl.find(plural, o.name, o.ns)).filter(Boolean);
		if (!real.length) return "";
		return `==> ${k}\n${PG.renderTable(cl, plural, real, {}).text}`;
	}).filter(Boolean).join("\n\n");
};
PG.helmRecord = (cl, rel, rev) => {
	const nm = `${rel.name}.v${rev.rev}`;
	const old = cl.find("configmaps", nm, "kube-system");
	if (old) cl.del("configmaps", old);
	cl.mk("configmaps", nm, "kube-system", {
		metadata: { labels: {
			NAME: rel.name,
			OWNER: "TILLER",
			STATUS: rev.status,
			VERSION: String(rev.rev)
		} },
		data: { release: PG.b64(JSON.stringify({
			name: rel.name,
			namespace: rel.namespace,
			manifest: rev.manifest,
			config: rev.userValues
		})) }
	});
};
PG.helmSetStatus = (cl, rel, rev, status) => {
	rev.status = status;
	const cm = cl.find("configmaps", `${rel.name}.v${rev.rev}`, "kube-system");
	if (cm) cm.metadata.labels.STATUS = status;
};
PG.helmApply = async (ctx, cl, rel, docs, tid, verbWord) => {
	const K = {
		cl,
		id: tid.id,
		ns: rel.namespace
	};
	const created = [];
	const c2 = Object.create(ctx);
	c2.src = "helm";
	for (const d of docs) {
		const plural = PG.KIND_OF[d.doc.kind];
		const ns = (d.doc.metadata || {}).namespace || rel.namespace;
		if (plural) {
			const verb = cl.find(plural, d.doc.metadata.name, ns) ? "patch" : "create";
			if (!PG.kcCan(K, verb, plural, ns)) {
				const k = PG.KINDS[plural];
				return {
					err: `Error: ${verbWord} failed: ${plural}${k.group ? "." + k.group : ""} is forbidden: User "${tid.id.user}" cannot ${verb} resource "${plural}" in API group "${k.group}" ${k.ns ? "in the namespace \"" + ns + "\"" : "at the cluster scope"}`,
					created
				};
			}
		}
		const r = PG.mkObject(c2, K, d.doc, rel.namespace, "apply");
		if (r.err) return {
			err: `Error: ${verbWord} failed: ${r.err.replace(/^Error from server \([A-Za-z]+\): error when creating "helm": /, "").replace(/^error: /, "")}`,
			created
		};
		if (r.obj && r.obj.metadata) {
			r.obj.metadata.annotations = { ...r.obj.metadata.annotations || {} };
			if (!Object.keys(r.obj.metadata.annotations).length) delete r.obj.metadata.annotations;
		}
		created.push({
			plural: r.plural,
			name: r.name,
			ns: PG.KINDS[r.plural].ns ? ns : null
		});
	}
	return { created };
};
PG.runHooks = async (ctx, cl, rel, hooks, event, tid) => {
	const these = hooks.filter((h) => h.hooks.includes(event)).sort((a, b) => a.w - b.w);
	for (const h of these) {
		const K = {
			cl,
			id: tid.id,
			ns: rel.namespace
		};
		const c2 = Object.create(ctx);
		c2.src = "hook";
		const d = PG.clone(h.doc);
		const pre = h.del.includes("before-hook-creation");
		const plural = PG.KIND_OF[d.kind];
		const ex = plural && cl.find(plural, d.metadata.name, rel.namespace);
		if (ex && pre) {
			cl.del(plural, ex);
			for (const p of cl.res.pods.filter((p) => p.metadata._owner && p.metadata._owner.name === d.metadata.name)) cl.del("pods", p);
		}
		const r = PG.mkObject(c2, K, d, rel.namespace, "apply");
		if (r.err) return { err: `Error: ${event} hook failed: ${r.err}` };
		if (d.kind === "Job") {
			if (!await ctx.sim.waitFor(() => (r.obj.status || {}).succeeded, ctx.sh, 90)) return { err: `Error: ${event === "pre-install" ? "release " + rel.name + " failed: " : "UPGRADE FAILED: "}timed out waiting for the condition (hook Job ${d.metadata.name} did not complete)` };
		}
		if (h.del.includes("hook-succeeded") && plural) {
			cl.del(plural, r.obj);
			for (const p of cl.res.pods.filter((p) => p.metadata._owner && p.metadata._owner.name === d.metadata.name)) cl.del("pods", p);
		}
	}
	return {};
};
PG.helmPrintStatus = (ctx, cl, rel, rev, header) => {
	ctx.println(`${header}\nLAST DEPLOYED: ${PG.helmDate(rev.t)}\nNAMESPACE: ${rel.namespace}\nSTATUS: ${rev.status}\n`);
	const tbl = PG.releaseTable(cl, rev.objs);
	if (tbl) ctx.println("RESOURCES:\n" + tbl + "\n");
	if (rev.notes) ctx.println("NOTES:\n" + rev.notes + "\n");
};
PG.helmValuesFrom = (ctx, P, chart, base) => {
	let vals = PG.clone(base === void 0 ? chart.values : base);
	const fl = [].concat(P.f.f || P.f.values || []);
	for (const f of fl) {
		const txt = ctx.fs.read(ctx.resolve(f));
		if (txt === void 0) return { err: `Error: open ${f}: no such file or directory` };
		let y;
		try {
			y = PG.yaml.parse(txt) || {};
		} catch (e) {
			return { err: `Error: failed to parse ${f}: ${e.message}` };
		}
		vals = PG.deepMerge(vals, y);
	}
	vals = PG.parseSet([].concat(P.f.set || [], P.f["set-string"] || []), vals);
	let uv = {};
	for (const f of fl) {
		const txt = ctx.fs.read(ctx.resolve(f));
		if (txt) uv = PG.deepMerge(uv, PG.yaml.parse(txt) || {});
	}
	uv = PG.parseSet([].concat(P.f.set || [], P.f["set-string"] || []), uv);
	return {
		vals,
		user: uv
	};
};
var HELM_VALUE_FLAGS = [
	"name",
	"namespace",
	"set",
	"set-string",
	"values",
	"f",
	"timeout",
	"service-account",
	"tiller-image",
	"stable-repo-url",
	"output",
	"o",
	"x",
	"execute",
	"tiller-namespace",
	"revision",
	"kube-context",
	"version",
	"repo",
	"description"
];
PG.commands.helm2 = async (ctx, args) => {
	ctx.sim;
	const P = PG.kcParse(args, HELM_VALUE_FLAGS);
	if (P.f.values) P.f.f = [].concat(P.f.f || [], P.f.values);
	const sub = P.pos[0];
	if (!sub || P.has("help") || sub === "help") {
		ctx.println(`The Kubernetes package manager, version 2 (simulated, ${PG.HELM_VER})
Commands:  init  version  ls  install  upgrade [--install]  delete [--purge]  status  history  rollback  get values|manifest|notes
           lint  template  test  dependency update  search  repo  
Flags:  --name NAME  --namespace NS  -f FILE  --set k=v  --wait  --timeout SECONDS  --dry-run --debug  --reuse-values  --atomic
The chart used in the guide is already in ~/myapp.  Start with:  kubectl -n kube-system create serviceaccount tiller ... then  helm2 init --service-account tiller`);
		return 0;
	}
	if (sub === "version") {
		if (P.has("client") || !P.has("server")) ctx.println(P.has("short") ? `Client: ${PG.HELM_VER}+ga690bad` : `Client: &version.Version{SemVer:"${PG.HELM_VER}", GitCommit:"a690bad98af45b015bd3da1a41f6218b1a451dbe", GitTreeState:"clean"}`);
		if (!P.has("client")) {
			const K = PG.kcConnect(ctx, { f: {} });
			if (!K) return 1;
			const t = (() => {
				const dep = K.cl.find("deployments", "tiller-deploy", "kube-system");
				if (!dep) return { err: "Error: could not find tiller" };
				if (!K.cl.matchPods("kube-system", dep.spec.selector).some((p) => K.cl.podReady(p))) return { err: "Error: could not find a ready tiller pod" };
				return { ver: (/:(v[\d.]+)/.exec(dep.spec.template.spec.containers[0].image) || [])[1] || PG.HELM_VER };
			})();
			if (t.err) {
				ctx.eprintln(t.err);
				return 1;
			}
			ctx.println(P.has("short") ? `Server: ${t.ver}+ga690bad` : `Server: &version.Version{SemVer:"${t.ver}", GitCommit:"a690bad98af45b015bd3da1a41f6218b1a451dbe", GitTreeState:"clean"}`);
		}
		return 0;
	}
	if (sub === "init") {
		if (P.has("client-only")) {
			ctx.println("$HELM_HOME has been configured at /root/.helm.\nNot installing Tiller due to 'client-only' flag having been set\nHappy Helming!");
			return 0;
		}
		const K = PG.kcConnect(ctx, { f: {} });
		if (!K) return 1;
		const cl = K.cl;
		const img = P.f["tiller-image"] || `gcr.io/kubernetes-helm/tiller:${PG.HELM_VER}`;
		const sa = P.f["service-account"] || null;
		const ver = (/:(v[\d.]+)/.exec(img) || [])[1] || PG.HELM_VER;
		const old = ver && parseInt(ver.split(".")[1]) < 16;
		const manifest = {
			apiVersion: old ? "extensions/v1beta1" : "apps/v1",
			kind: "Deployment",
			metadata: {
				creationTimestamp: null,
				labels: {
					app: "helm",
					name: "tiller"
				},
				name: "tiller-deploy",
				namespace: "kube-system"
			},
			spec: {
				replicas: 1,
				strategy: {},
				template: {
					metadata: {
						creationTimestamp: null,
						labels: {
							app: "helm",
							name: "tiller"
						}
					},
					spec: {
						automountServiceAccountToken: true,
						containers: [{
							env: [{
								name: "TILLER_NAMESPACE",
								value: "kube-system"
							}],
							image: img,
							name: "tiller",
							ports: [{
								containerPort: 44134,
								name: "tiller"
							}],
							resources: {}
						}],
						...sa ? { serviceAccountName: sa } : {}
					}
				}
			},
			status: {}
		};
		if (P.f.output || P.f.o) {
			ctx.out(PG.yaml.dump(manifest) + "---\n" + PG.yaml.dump({
				apiVersion: "v1",
				kind: "Service",
				metadata: {
					labels: {
						app: "helm",
						name: "tiller"
					},
					name: "tiller-deploy",
					namespace: "kube-system"
				},
				spec: {
					ports: [{
						name: "tiller",
						port: 44134,
						targetPort: "tiller"
					}],
					selector: {
						app: "helm",
						name: "tiller"
					},
					type: "ClusterIP"
				}
			}));
			return 0;
		}
		if (cl.find("deployments", "tiller-deploy", "kube-system")) {
			ctx.println("$HELM_HOME has been configured at /root/.helm.\nWarning: Tiller is already installed in the cluster.\n(Use --client-only to suppress this message, or --upgrade to upgrade Tiller to the current version.)\nHappy Helming!");
			return 0;
		}
		if (old) {
			ctx.eprintln(`Error: error installing: the server could not find the requested resource (${manifest.apiVersion} Deployment is no longer served by this Kubernetes version).\nUse:  helm2 init ... --output yaml | perl -pe 's#^apiVersion: extensions/v1beta1#apiVersion: apps/v1#; …' | kubectl apply -f -`);
			return 1;
		}
		if (!PG.kcCan(K, "create", "deployments", "kube-system")) return PG.kcForbid(ctx, K, "deployments", "create", "tiller-deploy", "kube-system");
		cl.deployment("kube-system", "tiller-deploy", img, 1, {
			labels: {
				app: "helm",
				name: "tiller"
			},
			selector: {
				app: "helm",
				name: "tiller"
			},
			containerName: "tiller",
			podSpec: sa ? { serviceAccountName: sa } : {}
		});
		cl.mk("services", "tiller-deploy", "kube-system", {
			metadata: { labels: {
				app: "helm",
				name: "tiller"
			} },
			spec: {
				type: "ClusterIP",
				clusterIP: cl.allocClusterIP(),
				selector: {
					app: "helm",
					name: "tiller"
				},
				ports: [{
					name: "tiller",
					port: 44134,
					targetPort: "tiller"
				}]
			},
			status: {}
		});
		ctx.println(`$HELM_HOME has been configured at /root/.helm.\n\nTiller (the Helm server-side component) has been installed into your Kubernetes Cluster.\n\nPlease note: by default, Tiller is deployed with an insecure 'allow unauthenticated users' policy.\nTo prevent this, run \`helm init\` with the --tiller-tls-verify flag.\nFor more information on securing your installation see: https://v2.helm.sh/docs/securing_installation/\nHappy Helming!`);
		return 0;
	}
	if (sub === "repo" || sub === "search") {
		if (sub === "repo") {
			ctx.println(P.pos[1] === "list" ? "NAME  	URL\nstable	https://charts.helm.sh/stable" : "\"stable\" has been added to your repositories");
			return 0;
		}
		ctx.println(PG.table([
			[
				"stable/redis",
				"10.5.7",
				"5.0.7",
				"DEPRECATED Open source, advanced key-value store."
			],
			[
				"stable/postgresql",
				"8.6.4",
				"11.7.0",
				"DEPRECATED Chart for PostgreSQL"
			],
			[
				"stable/mysql",
				"1.6.9",
				"5.7.30",
				"DEPRECATED Fast, reliable, scalable, and easy to use open-source rel..."
			]
		].filter((r) => !P.pos[1] || r[0].includes(P.pos[1].replace("stable/", ""))), [
			"NAME",
			"CHART VERSION",
			"APP VERSION",
			"DESCRIPTION"
		]));
		return 0;
	}
	if (sub === "lint") {
		const chart = PG.loadChart(ctx, P.pos[1] || ".");
		if (chart.err) {
			ctx.eprintln(chart.err);
			return 1;
		}
		const v = PG.helmValuesFrom(ctx, P, chart);
		if (v.err) {
			ctx.eprintln(v.err);
			return 1;
		}
		const r = PG.renderChart(chart, {
			name: "release-name",
			namespace: "default",
			values: v.vals,
			isInstall: true,
			revision: 1
		});
		ctx.println("==> Linting " + (P.pos[1] || "."));
		if (!chart.meta.icon) ctx.println("[INFO] Chart.yaml: icon is recommended");
		if (r.err) {
			ctx.println(`[ERROR] templates/: ${r.err.replace(/^Error: /, "")}`);
			ctx.eprintln("\nError: 1 chart(s) linted, 1 chart(s) failed");
			return 1;
		}
		const sp = PG.splitDocs(r.files);
		if (sp.err) {
			ctx.println("[ERROR] templates/: " + sp.err.replace(/^Error: /, ""));
			ctx.eprintln("\nError: 1 chart(s) linted, 1 chart(s) failed");
			return 1;
		}
		ctx.println("\n1 chart(s) linted, no failures");
		return 0;
	}
	if (sub === "template") {
		const chart = PG.loadChart(ctx, P.pos[1] || ".");
		if (chart.err) {
			ctx.eprintln(chart.err);
			return 1;
		}
		const v = PG.helmValuesFrom(ctx, P, chart);
		if (v.err) {
			ctx.eprintln(v.err);
			return 1;
		}
		const r = PG.renderChart(chart, {
			name: P.f.name || "RELEASE-NAME",
			namespace: P.f.namespace || "default",
			values: v.vals,
			isInstall: true,
			revision: 1
		});
		if (r.err) {
			ctx.eprintln(r.err);
			return 1;
		}
		const only = [].concat(P.f.x || P.f.execute || []);
		const sel = r.files.filter((f) => !only.length || only.some((o) => f.file.endsWith(o.replace(/^templates\//, "templates/")) || f.name === o.replace(/^templates\//, "")));
		if (only.length && !sel.length) {
			ctx.eprintln(`Error: could not find template ${only[0]} in chart`);
			return 1;
		}
		ctx.out(sel.map((f) => `---\n# Source: ${f.file}\n${f.text.replace(/^\n+/, "").trimEnd()}\n`).join(""));
		return 0;
	}
	if (sub === "dependency" || sub === "dep") {
		const dir = ctx.resolve(P.pos[2] || ".");
		const req = ctx.fs.read(dir + "/requirements.yaml");
		ctx.println("Hang tight while we grab the latest from your chart repositories...\n...Successfully got an update from the \"stable\" chart repository\nUpdate Complete.");
		if (req === void 0) {
			ctx.println("(no requirements.yaml found — nothing to download)");
			return 0;
		}
		ctx.fs.mkdirp(dir + "/charts");
		ctx.println("Saving 1 charts\nDeleting outdated charts\n(simulated: dependency subcharts are not rendered by this playground)");
		return 0;
	}
	const K = PG.kcConnect(ctx, { f: {} });
	if (!K) return 1;
	const cl = K.cl;
	const tid = PG.tillerInfo(cl);
	if (tid.err) {
		ctx.eprintln(tid.err);
		return 1;
	}
	const rels = cl.helm.releases;
	const live = (name) => rels[name];
	if (sub === "ls" || sub === "list") {
		const all = P.has("all");
		const rows = Object.values(rels).filter((r) => (all || r.revs[r.revs.length - 1].status === "DEPLOYED") && (!P.f.namespace || r.namespace === P.f.namespace) && (!P.pos[1] || r.name.includes(P.pos[1]))).map((r) => {
			const v = r.revs[r.revs.length - 1];
			return [
				r.name,
				String(v.rev),
				PG.helmDate(v.t),
				v.status,
				`${v.chart}-${v.version}`,
				v.appVersion || "",
				r.namespace
			];
		});
		if (rows.length) ctx.println(PG.table(rows, [
			"NAME",
			"REVISION",
			"UPDATED",
			"STATUS",
			"CHART",
			"APP VERSION",
			"NAMESPACE"
		]));
		return 0;
	}
	if (sub === "install" || sub === "upgrade") {
		const up = sub === "upgrade";
		let name, chartPath;
		if (up) {
			name = P.pos[1];
			chartPath = P.pos[2];
		} else {
			chartPath = P.pos[1];
			name = P.f.name;
		}
		if (!chartPath) {
			ctx.eprintln(`Error: This command needs ${up ? 2 : 1} argument${up ? "s: release name, chart path" : ": chart name"}`);
			return 1;
		}
		const chart = PG.loadChart(ctx, chartPath);
		if (chart.err) {
			ctx.eprintln(chart.err);
			return 1;
		}
		if (!name) name = [
			"wise-ferret",
			"cold-lynx",
			"quiet-otter"
		][Math.floor(Math.random() * 3)];
		const ns = P.f.namespace || "default";
		const existing = live(name);
		if (!up && existing) {
			ctx.eprintln(`Error: a release named ${name} already exists.\nRun: helm ls --all ${name}; to check the status of the release\nOr run: helm del --purge ${name}; to delete it`);
			return 1;
		}
		if (up && !existing && !P.has("install")) {
			ctx.eprintln(`Error: "${name}" has no deployed releases`);
			return 1;
		}
		if (up && existing && existing.revs[existing.revs.length - 1].status === "FAILED" && existing.revs.length === 1 && !P.has("install")) {
			ctx.eprintln(`Error: "${name}" has no deployed releases`);
			return 1;
		}
		const isInstall = !existing;
		const prev = existing ? existing.revs[existing.revs.length - 1] : null;
		const baseVals = up && P.has("reuse-values") && prev ? prev.values : void 0;
		const v = PG.helmValuesFrom(ctx, P, chart, baseVals);
		if (v.err) {
			ctx.eprintln(v.err);
			return 1;
		}
		const userVals = up && P.has("reuse-values") && prev ? PG.deepMerge(prev.userValues, v.user) : v.user;
		const rev = existing ? prev.rev + 1 : 1;
		const rendered = PG.renderChart(chart, {
			name,
			namespace: ns,
			values: v.vals,
			isInstall,
			revision: rev
		});
		if (rendered.err) {
			ctx.eprintln(rendered.err);
			return 1;
		}
		const sp = PG.splitDocs(rendered.files);
		if (sp.err) {
			ctx.eprintln(sp.err);
			return 1;
		}
		const hooks = sp.docs.filter((d) => d.hooks.length);
		const body = sp.docs.filter((d) => !d.hooks.length);
		if (P.has("dry-run")) {
			ctx.println(`${P.has("debug") ? "[debug] Created tunnel using local port: '" + (4e4 + Math.floor(Math.random() * 999)) + "'\n" : ""}NAME:   ${name}\nREVISION: ${rev}\nRELEASED: ${PG.helmDate(ctx.sim.clock)}\nCHART: ${chart.meta.name}-${chart.meta.version}\nUSER-SUPPLIED VALUES:\n${PG.yaml.dump(userVals).trim()}\n\nCOMPUTED VALUES:\n${PG.yaml.dump(v.vals).trim()}\n\nHOOKS:\n${PG.manifestText(hooks)}\nMANIFEST:\n${PG.manifestText(body)}`);
			return 0;
		}
		if (!cl.find("namespaces", ns)) {
			ctx.eprintln(`Error: ${up ? "UPGRADE FAILED" : "release " + name + " failed"}: namespaces "${ns}" not found`);
			return 1;
		}
		const verbWord = up ? "UPGRADE FAILED" : `release ${name}`;
		const record = existing || {
			name,
			namespace: ns,
			revs: []
		};
		if (!existing) rels[name] = record;
		const newRev = {
			rev,
			status: "PENDING_INSTALL",
			t: ctx.sim.clock,
			chart: chart.meta.name,
			version: chart.meta.version,
			appVersion: chart.meta.appVersion,
			userValues: v.user === void 0 ? {} : userVals,
			values: v.vals,
			manifest: PG.manifestText(body),
			docs: body,
			hooks,
			notes: rendered.notes,
			objs: [],
			description: isInstall ? "Install complete" : "Upgrade complete"
		};
		const h1 = await PG.runHooks(ctx, cl, record, hooks, isInstall ? "pre-install" : "pre-upgrade", tid);
		if (h1.err) {
			if (isInstall) delete rels[name];
			ctx.eprintln(h1.err);
			return 1;
		}
		const res = await PG.helmApply(ctx, cl, record, body, tid, verbWord);
		newRev.objs = res.created;
		if (res.err) {
			newRev.status = "FAILED";
			newRev.description = res.err.replace(/^Error: /, "");
			record.revs.push(newRev);
			PG.helmRecord(cl, record, newRev);
			ctx.eprintln(res.err);
			return 1;
		}
		if (prev) {
			for (const o of prev.objs) if (!newRev.objs.some((n) => n.plural === o.plural && n.name === o.name && n.ns === o.ns)) {
				const ob = cl.find(o.plural, o.name, o.ns);
				if (ob) cl.del(o.plural, ob);
			}
			PG.helmSetStatus(cl, record, prev, "SUPERSEDED");
		}
		newRev.status = "DEPLOYED";
		record.revs.push(newRev);
		PG.helmRecord(cl, record, newRev);
		cl.tick(0);
		await PG.runHooks(ctx, cl, record, hooks, isInstall ? "post-install" : "post-upgrade", tid);
		if (P.has("wait") || P.has("atomic")) {
			const tmo = Number(P.f.timeout || 300);
			if (!await ctx.sim.waitFor(() => newRev.objs.filter((o) => o.plural === "deployments").every((o) => {
				const d = cl.find("deployments", o.name, o.ns);
				return d && (d.status._updatedReady || 0) >= (d.spec.replicas === void 0 ? 1 : d.spec.replicas) && (d.status.replicas || 0) <= (d.spec.replicas === void 0 ? 1 : d.spec.replicas);
			}), ctx.sh, tmo)) {
				if (P.has("atomic") && prev) {
					for (const o of newRev.objs);
					newRev.status = "FAILED";
					PG.helmSetStatus(cl, record, newRev, "FAILED");
					ctx.eprintln(`Error: ${up ? "UPGRADE FAILED" : "release " + name + " failed"}: timed out waiting for the condition\n(--atomic: rolling back is simulated by: helm2 rollback ${name} ${prev.rev})`);
					return 1;
				}
				newRev.status = "FAILED";
				PG.helmSetStatus(cl, record, newRev, "FAILED");
				ctx.eprintln(`Error: ${up ? "UPGRADE FAILED" : "release " + name + " failed"}: timed out waiting for the condition`);
				return 1;
			}
		}
		PG.helmPrintStatus(ctx, cl, record, newRev, up ? `Release "${name}" has been upgraded. Happy Helming!` : `NAME:   ${name}`);
		return 0;
	}
	const rel = (name) => {
		const r = rels[name];
		if (!r) ctx.eprintln(`Error: release: "${name}" not found`);
		return r;
	};
	if (sub === "status") {
		const r = rel(P.pos[1]);
		if (!r) return 1;
		PG.helmPrintStatus(ctx, cl, r, r.revs[r.revs.length - 1], "");
		return 0;
	}
	if (sub === "history") {
		const r = rel(P.pos[1]);
		if (!r) return 1;
		ctx.println(PG.table(r.revs.map((v) => [
			String(v.rev),
			PG.helmDate(v.t),
			v.status,
			`${v.chart}-${v.version}`,
			v.description
		]), [
			"REVISION",
			"UPDATED",
			"STATUS",
			"CHART",
			"DESCRIPTION"
		]));
		return 0;
	}
	if (sub === "get") {
		const kind = [
			"values",
			"manifest",
			"notes",
			"hooks"
		].includes(P.pos[1]) ? P.pos[1] : null;
		const nm = kind ? P.pos[2] : P.pos[1];
		const r = rel(nm);
		if (!r) return 1;
		const v = P.f.revision ? r.revs.find((x) => x.rev === Number(P.f.revision)) : r.revs[r.revs.length - 1];
		if (!v) {
			ctx.eprintln(`Error: release: "${nm}" not found`);
			return 1;
		}
		if (kind === "values") {
			ctx.out(PG.yaml.dump(P.has("all") ? v.values : v.userValues));
			return 0;
		}
		if (kind === "manifest") {
			ctx.println(v.manifest);
			return 0;
		}
		if (kind === "notes") {
			ctx.println(v.notes || "");
			return 0;
		}
		if (kind === "hooks") {
			ctx.println(PG.manifestText(v.hooks));
			return 0;
		}
		ctx.println(`REVISION: ${v.rev}\nRELEASED: ${PG.helmDate(v.t)}\nCHART: ${v.chart}-${v.version}\nUSER-SUPPLIED VALUES:\n${PG.yaml.dump(v.userValues).trim()}\n\nCOMPUTED VALUES:\n${PG.yaml.dump(v.values).trim()}\n\nHOOKS:\nMANIFEST:\n${v.manifest}`);
		return 0;
	}
	if (sub === "delete" || sub === "del" || sub === "uninstall") {
		const r = rel(P.pos[1]);
		if (!r) return 1;
		const cur = r.revs[r.revs.length - 1];
		if (cur.status === "DELETED" && !P.has("purge")) {
			ctx.eprintln(`Error: release: "${r.name}" not found`);
			return 1;
		}
		for (const rv of r.revs) for (const o of rv.objs) {
			const ob = cl.find(o.plural, o.name, o.ns);
			if (ob) {
				if (o.plural === "pods") cl.killPod(ob);
				else cl.del(o.plural, ob);
			}
		}
		if (P.has("purge")) {
			delete rels[r.name];
			for (const cm of cl.res.configmaps.filter((c) => c.metadata.namespace === "kube-system" && c.metadata.labels && c.metadata.labels.NAME === r.name && c.metadata.labels.OWNER === "TILLER")) cl.del("configmaps", cm);
		} else PG.helmSetStatus(cl, r, cur, "DELETED");
		cl.tick(0);
		ctx.println(`release "${r.name}" deleted`);
		return 0;
	}
	if (sub === "rollback") {
		const r = rel(P.pos[1]);
		if (!r) return 1;
		const target = r.revs.find((v) => v.rev === Number(P.pos[2]));
		if (!target) {
			ctx.eprintln(`Error: release has no ${P.pos[2]} version`);
			return 1;
		}
		const cur = r.revs[r.revs.length - 1];
		const res = await PG.helmApply(ctx, cl, r, target.docs, tid, "ROLLBACK");
		if (res.err) {
			ctx.eprintln(res.err.replace("ROLLBACK failed", "ROLLBACK FAILED"));
			return 1;
		}
		for (const o of cur.objs) if (!res.created.some((n) => n.plural === o.plural && n.name === o.name && n.ns === o.ns)) {
			const ob = cl.find(o.plural, o.name, o.ns);
			if (ob) cl.del(o.plural, ob);
		}
		PG.helmSetStatus(cl, r, cur, "SUPERSEDED");
		const nv = {
			...target,
			rev: cur.rev + 1,
			t: ctx.sim.clock,
			status: "DEPLOYED",
			objs: res.created,
			description: `Rollback to ${target.rev}`
		};
		r.revs.push(nv);
		PG.helmRecord(cl, r, nv);
		ctx.println("Rollback was a success! Happy Helming!");
		return 0;
	}
	if (sub === "test") {
		const r = rel(P.pos[1]);
		if (!r) return 1;
		const tests = r.revs[r.revs.length - 1].hooks.filter((h) => h.hooks.includes("test-success") || h.hooks.includes("test-failure"));
		if (!tests.length) {
			ctx.eprintln(`Error: no tests found in release ${r.name}`);
			return 1;
		}
		let bad = false;
		for (const h of tests) {
			const K2 = {
				cl,
				id: tid.id,
				ns: r.namespace
			};
			const c2 = Object.create(ctx);
			c2.src = "test";
			const name = h.doc.metadata.name;
			const ex = cl.find("pods", name, r.namespace);
			if (ex) cl.del("pods", ex);
			const mk = PG.mkObject(c2, K2, h.doc, r.namespace, "apply");
			if (mk.err) {
				ctx.eprintln(mk.err);
				return 1;
			}
			ctx.println(`RUNNING: ${name}`);
			const pod = mk.obj;
			const ok = await ctx.sim.waitFor(() => [
				"Running",
				"Completed",
				"Error"
			].includes(cl.podStatus(pod)) || ["ErrImagePull", "ImagePullBackOff"].includes(cl.podStatus(pod)) && ctx.sim.clock - pod._sim.t0 > 14, ctx.sh, 60);
			let passed = false;
			if (ok && ["Running", "Completed"].includes(cl.podStatus(pod))) {
				const c = pod.spec.containers[0];
				const argv = [...c.command || [], ...c.args || []];
				const res2 = await PG.execInPod(ctx, cl, pod, argv);
				passed = !res2.err && !res2.code;
			}
			if (!passed) bad = true;
			ctx.println(`${passed ? "PASSED" : "FAILED"}: ${name}`);
			cl.del("pods", pod);
		}
		return bad ? 1 : 0;
	}
	ctx.eprintln(`Error: unknown command "${sub}" for "helm" (simulated: init version ls install upgrade delete status history rollback get lint template test dependency)`);
	return 1;
};
PG.commands.helm = async (ctx, args) => {
	ctx.eprintln("helm: this machine has Helm 4 (no Tiller). The guide uses Helm 2 — run:  helm2 …");
	return 1;
};
PG.commands.perl = async (ctx, args) => {
	const i = args.indexOf("-pe");
	const script = i >= 0 ? args[i + 1] : null;
	if (!script) {
		ctx.eprintln("perl: only \"perl -pe 's#a#b#; …'\" is simulated");
		return 1;
	}
	const subs = [];
	const re = /s(.)(.*?)\1(.*?)\1([gi]*)(?:;|$)/g;
	let m;
	while (m = re.exec(script.trim())) subs.push({
		pat: m[2],
		rep: m[3],
		fl: m[4]
	});
	const out = (ctx.stdin || "").split("\n").map((l) => {
		for (const s of subs) {
			const r = new RegExp(s.pat, s.fl.replace(/[^gi]/g, ""));
			l = l.replace(r, s.rep.replace(/\\n/g, "\n").replace(/\$(\d)/g, "$$$1"));
		}
		return l;
	});
	ctx.out(out.join("\n"));
};
var HELPERS = (name) => `{{- define "${name}.fullname" -}}
{{- printf "%s-%s" .Release.Name "${name}" | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- define "${name}.labels" -}}
app: ${name}
release: {{ .Release.Name }}
chart: {{ .Chart.Name }}-{{ .Chart.Version }}
heritage: {{ .Release.Service }}
{{- end -}}
`;
PG.REPO = {
	redis: {
		version: "10.5.7",
		appVersion: "5.0.7",
		description: "DEPRECATED Open source, advanced key-value store.",
		files: (name) => ({
			"Chart.yaml": `apiVersion: v1\nname: redis\nversion: 10.5.7\nappVersion: "5.0.7"\ndescription: Open source, advanced key-value store.\n`,
			"values.yaml": `image:\n  repository: redis\n  tag: 7-alpine\n  pullPolicy: IfNotPresent\nusePassword: false\npassword: ""\nmaster:\n  port: 6379\npersistence:\n  enabled: false\n  size: 8Gi\nresources: {}\n`,
			"templates/_helpers.tpl": HELPERS("redis"),
			"templates/secret.yaml": `{{- if .Values.usePassword }}\napiVersion: v1\nkind: Secret\nmetadata:\n  name: {{ include "redis.fullname" . }}\n  labels:\n{{ include "redis.labels" . | indent 4 }}\ntype: Opaque\nstringData:\n  redis-password: {{ default "changeme" .Values.password | quote }}\n{{- end }}\n`,
			"templates/deployment.yaml": `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: {{ include "redis.fullname" . }}-master\n  labels:\n{{ include "redis.labels" . | indent 4 }}\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: redis\n      release: {{ .Release.Name }}\n  template:\n    metadata:\n      labels:\n        app: redis\n        release: {{ .Release.Name }}\n    spec:\n      containers:\n        - name: redis\n          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"\n          imagePullPolicy: {{ .Values.image.pullPolicy }}\n          {{- if .Values.usePassword }}\n          env:\n            - name: REDIS_PASSWORD\n              valueFrom:\n                secretKeyRef:\n                  name: {{ include "redis.fullname" . }}\n                  key: redis-password\n          {{- end }}\n          ports:\n            - name: redis\n              containerPort: {{ .Values.master.port }}\n          readinessProbe:\n            tcpSocket:\n              port: redis\n            periodSeconds: 5\n          resources:\n{{ toYaml .Values.resources | indent 12 }}\n`,
			"templates/service.yaml": `apiVersion: v1\nkind: Service\nmetadata:\n  name: {{ include "redis.fullname" . }}-master\n  labels:\n{{ include "redis.labels" . | indent 4 }}\nspec:\n  type: ClusterIP\n  ports:\n    - name: redis\n      port: {{ .Values.master.port }}\n      targetPort: redis\n  selector:\n    app: redis\n    release: {{ .Release.Name }}\n`,
			"templates/NOTES.txt": `Redis can be accessed via port {{ .Values.master.port }} on the following DNS name from within your cluster:\n\n{{ include "redis.fullname" . }}-master.{{ .Release.Namespace }}.svc.cluster.local\n`
		})
	},
	postgresql: {
		version: "8.6.4",
		appVersion: "11.7.0",
		description: "DEPRECATED Chart for PostgreSQL, an object-relational database management system.",
		files: () => ({
			"Chart.yaml": `apiVersion: v1\nname: postgresql\nversion: 8.6.4\nappVersion: "11.7.0"\ndescription: Chart for PostgreSQL\n`,
			"values.yaml": `image:\n  repository: postgres\n  tag: 16-alpine\npostgresqlPassword: ""\npostgresqlDatabase: postgres\nservice:\n  port: 5432\nresources: {}\n`,
			"templates/_helpers.tpl": HELPERS("postgresql"),
			"templates/secret.yaml": `apiVersion: v1\nkind: Secret\nmetadata:\n  name: {{ include "postgresql.fullname" . }}\n  labels:\n{{ include "postgresql.labels" . | indent 4 }}\ntype: Opaque\nstringData:\n  postgresql-password: {{ default "changeme" .Values.postgresqlPassword | quote }}\n`,
			"templates/deployment.yaml": `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: {{ include "postgresql.fullname" . }}\n  labels:\n{{ include "postgresql.labels" . | indent 4 }}\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: postgresql\n      release: {{ .Release.Name }}\n  template:\n    metadata:\n      labels:\n        app: postgresql\n        release: {{ .Release.Name }}\n    spec:\n      containers:\n        - name: postgresql\n          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"\n          env:\n            - name: POSTGRES_DB\n              value: {{ .Values.postgresqlDatabase | quote }}\n            - name: POSTGRES_PASSWORD\n              valueFrom:\n                secretKeyRef:\n                  name: {{ include "postgresql.fullname" . }}\n                  key: postgresql-password\n          ports:\n            - name: postgresql\n              containerPort: 5432\n          readinessProbe:\n            exec:\n              command: ["pg_isready", "-U", "postgres"]\n            periodSeconds: 5\n`,
			"templates/service.yaml": `apiVersion: v1\nkind: Service\nmetadata:\n  name: {{ include "postgresql.fullname" . }}\n  labels:\n{{ include "postgresql.labels" . | indent 4 }}\nspec:\n  type: ClusterIP\n  ports:\n    - name: postgresql\n      port: {{ .Values.service.port }}\n      targetPort: postgresql\n  selector:\n    app: postgresql\n    release: {{ .Release.Name }}\n`,
			"templates/NOTES.txt": `PostgreSQL can be accessed via port {{ .Values.service.port }} on:\n\n{{ include "postgresql.fullname" . }}.{{ .Release.Namespace }}.svc.cluster.local\n\nPassword: kubectl get secret {{ include "postgresql.fullname" . }} -n {{ .Release.Namespace }} -o jsonpath='{.data.postgresql-password}' | base64 -d\n`
		})
	},
	mysql: {
		version: "1.6.9",
		appVersion: "5.7.30",
		description: "DEPRECATED Fast, reliable, scalable, and easy to use open-source relational database system.",
		files: () => ({
			"Chart.yaml": `apiVersion: v1\nname: mysql\nversion: 1.6.9\nappVersion: "5.7.30"\ndescription: MySQL\n`,
			"values.yaml": `image:\n  repository: mysql\n  tag: "8"\nmysqlRootPassword: ""\nservice:\n  port: 3306\n`,
			"templates/_helpers.tpl": HELPERS("mysql"),
			"templates/secret.yaml": `apiVersion: v1\nkind: Secret\nmetadata:\n  name: {{ include "mysql.fullname" . }}\ntype: Opaque\nstringData:\n  mysql-root-password: {{ default "changeme" .Values.mysqlRootPassword | quote }}\n`,
			"templates/deployment.yaml": `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: {{ include "mysql.fullname" . }}\n  labels:\n{{ include "mysql.labels" . | indent 4 }}\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: mysql\n      release: {{ .Release.Name }}\n  template:\n    metadata:\n      labels:\n        app: mysql\n        release: {{ .Release.Name }}\n    spec:\n      containers:\n        - name: mysql\n          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"\n          env:\n            - name: MYSQL_ROOT_PASSWORD\n              valueFrom:\n                secretKeyRef:\n                  name: {{ include "mysql.fullname" . }}\n                  key: mysql-root-password\n          ports:\n            - name: mysql\n              containerPort: 3306\n          readinessProbe:\n            tcpSocket:\n              port: mysql\n            periodSeconds: 5\n`,
			"templates/service.yaml": `apiVersion: v1\nkind: Service\nmetadata:\n  name: {{ include "mysql.fullname" . }}\nspec:\n  ports:\n    - name: mysql\n      port: {{ .Values.service.port }}\n      targetPort: mysql\n  selector:\n    app: mysql\n    release: {{ .Release.Name }}\n`
		})
	},
	nginx: {
		version: "5.1.1",
		appVersion: "1.27",
		description: "Web server (a copy of the guide chart, renamed).",
		files: () => {
			const out = {};
			for (const [p, c] of Object.entries(PG.CHART_FILES || {})) {
				if (!p.startsWith("myapp/")) continue;
				out[p.slice(6)] = c.replace(/myapp/g, "nginx");
			}
			return out;
		}
	}
};
PG.repoChart = (name, version) => {
	const r = PG.REPO[name.replace(/^stable\//, "")];
	if (!r) return null;
	const files = r.files(name);
	if (files["Chart.yaml"] && version) files["Chart.yaml"] = files["Chart.yaml"].replace(/^version: .*/m, "version: " + version);
	return {
		files,
		version: version || r.version
	};
};
PG.chartFromFiles = (files) => {
	const fs = new PG.FS();
	for (const [rel, c] of Object.entries(files)) fs.write("/c/" + rel, c);
	return {
		fs,
		dir: "/c"
	};
};
PG.loadChartFromFs = (fs, dir, label) => {
	const cy = fs.read(dir + "/Chart.yaml");
	if (cy === void 0) return { err: `Error: no Chart.yaml exists in directory "${label || dir}"` };
	let meta;
	try {
		meta = PG.yaml.parse(cy);
	} catch (e) {
		return { err: "Error: Chart.yaml: " + e.message };
	}
	if (!meta || !meta.name) return { err: "Error: validation: chart.metadata.name is required" };
	if (!meta.version) return { err: "Error: validation: chart.metadata.version is required" };
	if (meta.apiVersion === "v2") return { err: "Error: apiVersion \"v2\" is not valid. The value must be \"v1\"" };
	let values = {};
	const vy = fs.read(dir + "/values.yaml");
	if (vy !== void 0) try {
		values = PG.yaml.parse(vy) || {};
	} catch (e) {
		return { err: "Error: values.yaml: " + e.message };
	}
	const tdir = dir + "/templates";
	const templates = {};
	if (fs.isDir(tdir)) {
		const walk = (d, rel) => {
			for (const n of fs.list(d)) {
				const p = d + "/" + n;
				if (fs.isDir(p)) walk(p, rel + n + "/");
				else templates[rel + n] = fs.read(p);
			}
		};
		walk(tdir, "");
	}
	const subcharts = [];
	const reqTxt = fs.read(dir + "/requirements.yaml");
	let reqs = [];
	if (reqTxt) try {
		reqs = (PG.yaml.parse(reqTxt) || {}).dependencies || [];
	} catch (e) {}
	if (fs.isDir(dir + "/charts")) for (const n of fs.list(dir + "/charts")) {
		const p = dir + "/charts/" + n;
		let sub = null;
		if (fs.isDir(p)) sub = PG.loadChartFromFs(fs, p, p);
		else if (n.endsWith(".tgz")) try {
			const pk = JSON.parse((fs.read(p) || "").replace(/^PG-HELM-TGZ\n/, ""));
			const t = PG.chartFromFiles(pk.files);
			sub = PG.loadChartFromFs(t.fs, t.dir);
		} catch (e) {
			sub = null;
		}
		if (sub && !sub.err) {
			const rq = reqs.find((r) => r.name === sub.meta.name) || {};
			sub.condition = rq.condition;
			sub.alias = rq.alias;
			subcharts.push(sub);
		}
	}
	return {
		dir,
		meta,
		values,
		templates,
		subcharts,
		reqs,
		fsRead: (p) => fs.read(dir + "/" + p)
	};
};
PG.loadChart = (ctx, path) => {
	if (/^stable\//.test(path) && !ctx.fs.isDir(ctx.resolve(path))) {
		const [nm, ver] = [path.replace(/^stable\//, ""), ctx.chartVersion];
		const rc = PG.repoChart(nm, ver);
		if (!rc) return { err: `Error: chart "${nm}" matching ${ver || ""} not found in stable index. (try 'helm repo update'). no chart name found` };
		const t = PG.chartFromFiles(rc.files);
		return PG.loadChartFromFs(t.fs, t.dir, path);
	}
	const dir = ctx.resolve(path);
	if (path.endsWith(".tgz") && ctx.fs.read(dir) !== void 0) try {
		const pk = JSON.parse(ctx.fs.read(dir).replace(/^PG-HELM-TGZ\n/, ""));
		const t = PG.chartFromFiles(pk.files);
		return PG.loadChartFromFs(t.fs, t.dir, path);
	} catch (e) {
		return { err: `Error: file "${path}" does not appear to be a gzipped archive; got 'application/octet-stream'` };
	}
	if (!ctx.fs.isDir(dir)) return { err: `Error: path "${path}" not found` };
	return PG.loadChartFromFs(ctx.fs, dir, dir);
};
var renderOwn = PG.renderChart;
PG.renderChart = (chart, rel) => {
	const own = renderOwn(chart, rel);
	if (own.err || !(chart.subcharts || []).length) return own;
	const files = [...own.files];
	for (const sub of chart.subcharts) {
		const key = sub.alias || sub.meta.name;
		if (sub.condition) {
			const v = String(sub.condition).split(",")[0].trim().split(".").reduce((a, k) => a === void 0 || a === null ? void 0 : a[k], rel.values);
			if (v === false || v === "false") continue;
		}
		const subVals = PG.deepMerge(sub.values, rel.values && rel.values[key] || {});
		if (rel.values && rel.values.global) subVals.global = rel.values.global;
		const r = renderOwn(sub, {
			...rel,
			values: subVals
		});
		if (r.err) return r;
		for (const f of r.files) files.push({
			...f,
			file: `${chart.meta.name}/charts/${f.file}`,
			name: `charts/${sub.meta.name}/templates/${f.name}`
		});
	}
	return {
		...own,
		files
	};
};
var helmBase = PG.commands.helm2;
PG.commands.helm2 = async (ctx, args) => {
	const P = PG.kcParse(args, [
		"name",
		"namespace",
		"set",
		"set-string",
		"values",
		"f",
		"timeout",
		"service-account",
		"tiller-image",
		"stable-repo-url",
		"output",
		"o",
		"x",
		"execute",
		"tiller-namespace",
		"revision",
		"kube-context",
		"version",
		"repo",
		"description",
		"destination",
		"d",
		"untardir"
	]);
	const sub = P.pos[0];
	const sim = ctx.sim;
	sim.helmRepos = sim.helmRepos || [{
		name: "stable",
		url: "https://charts.helm.sh/stable"
	}];
	if (sub === "install" || sub === "upgrade" || sub === "template" || sub === "lint") ctx.chartVersion = P.f.version;
	if (sub === "create") {
		const name = P.pos[1];
		if (!name) {
			ctx.eprintln("Error: the name of the new chart is required");
			return 1;
		}
		const dir = ctx.resolve(name);
		if (ctx.fs.exists(dir)) {
			ctx.eprintln(`Error: file ${dir} already exists and is not a directory`);
			return 1;
		}
		for (const [p, c] of Object.entries(PG.CHART_FILES || {})) if (p.startsWith("myapp/")) ctx.fs.write(dir + "/" + p.slice(6), c.replace(/myapp/g, name));
		ctx.fs.mkdirp(dir + "/charts");
		ctx.println(`Creating ${name}`);
		return 0;
	}
	if (sub === "package") {
		const chart = PG.loadChart(ctx, P.pos[1] || ".");
		if (chart.err) {
			ctx.eprintln(chart.err);
			return 1;
		}
		const files = {};
		const dir = chart.dir;
		for (const f of Object.keys(ctx.fs.files)) if (f.startsWith(dir + "/")) files[f.slice(dir.length + 1)] = ctx.fs.files[f];
		const out = `${P.f.destination || P.f.d ? ctx.resolve(P.f.destination || P.f.d) : ctx.cwd}/${chart.meta.name}-${chart.meta.version}.tgz`;
		ctx.fs.write(out, "PG-HELM-TGZ\n" + JSON.stringify({ files }));
		ctx.println(`Successfully packaged chart and saved it to: ${out}`);
		return 0;
	}
	if (sub === "fetch" || sub === "pull") {
		const nm = (P.pos[1] || "").replace(/^stable\//, "");
		const rc = PG.repoChart(nm, P.f.version);
		if (!rc) {
			ctx.eprintln(`Error: chart "${nm}" matching ${P.f.version || ""} not found in stable index. (try 'helm repo update'). no chart name found`);
			return 1;
		}
		const base = ctx.cwd;
		if (P.has("untar")) for (const [p, c] of Object.entries(rc.files)) ctx.fs.write(`${P.f.untardir ? ctx.resolve(P.f.untardir) : base}/${nm}/${p}`, c);
		else ctx.fs.write(`${base}/${nm}-${rc.version}.tgz`, "PG-HELM-TGZ\n" + JSON.stringify({ files: rc.files }));
		return 0;
	}
	if (sub === "inspect") {
		const what = P.pos[1];
		const target = P.pos[2] || P.pos[1];
		const nm = (what === "values" || what === "chart" || what === "readme" ? target : P.pos[1]) || "";
		const chart = PG.loadChart(ctx, nm);
		if (chart.err) {
			ctx.eprintln(chart.err);
			return 1;
		}
		if (what === "chart") ctx.out(PG.yaml.dump(chart.meta));
		else ctx.out(chart.fsRead("values.yaml") || "");
		return 0;
	}
	if (sub === "search") {
		const term = (P.pos[1] || "").replace(/^stable\//, "");
		const rows = [];
		for (const [n, r] of Object.entries(PG.REPO)) {
			if (term && !n.includes(term)) continue;
			const vers = P.has("l") || P.has("versions") ? [r.version, ...["-1", "-2"].map((d, i) => r.version.replace(/\d+$/, (x) => String(Math.max(0, Number(x) + Number(d)))))] : [r.version];
			for (const v of vers) rows.push([
				`stable/${n}`,
				v,
				r.appVersion,
				r.description
			]);
		}
		ctx.println(PG.table(rows, [
			"NAME",
			"CHART VERSION",
			"APP VERSION",
			"DESCRIPTION"
		]));
		return 0;
	}
	if (sub === "repo") {
		const s2 = P.pos[1];
		if (s2 === "list") {
			ctx.println(PG.table(sim.helmRepos.map((r) => [r.name, r.url]), ["NAME", "URL"]));
			return 0;
		}
		if (s2 === "add") {
			sim.helmRepos = sim.helmRepos.filter((r) => r.name !== P.pos[2]);
			sim.helmRepos.push({
				name: P.pos[2],
				url: P.pos[3]
			});
			ctx.println(`"${P.pos[2]}" has been added to your repositories`);
			return 0;
		}
		if (s2 === "update") {
			ctx.println("Hang tight while we grab the latest from your chart repositories...\n...Skip local chart repository\n...Successfully got an update from the \"stable\" chart repository\nUpdate Complete.");
			return 0;
		}
		if (s2 === "remove") {
			sim.helmRepos = sim.helmRepos.filter((r) => r.name !== P.pos[2]);
			ctx.println(`"${P.pos[2]}" has been removed from your repositories`);
			return 0;
		}
		ctx.eprintln("Error: helm repo: list | add NAME URL | update | remove NAME");
		return 1;
	}
	if (sub === "dependency" || sub === "dep") {
		const s2 = P.pos[1];
		const dir = ctx.resolve(P.pos[2] || ".");
		const req = ctx.fs.read(dir + "/requirements.yaml");
		if (s2 === "list") {
			if (req === void 0) {
				ctx.eprintln(`WARNING: no requirements at ${dir}/charts`);
				return 0;
			}
			const deps = (PG.yaml.parse(req) || {}).dependencies || [];
			ctx.println(PG.table(deps.map((d) => [
				d.name,
				d.version,
				d.repository,
				ctx.fs.isDir(dir + "/charts/" + d.name) ? "ok" : "missing"
			]), [
				"NAME",
				"VERSION",
				"REPOSITORY",
				"STATUS"
			]));
			return 0;
		}
		if (s2 !== "update" && s2 !== "build") {
			ctx.eprintln("Error: helm dependency: update | build | list CHART");
			return 1;
		}
		ctx.println("Hang tight while we grab the latest from your chart repositories...\n...Successfully got an update from the \"stable\" chart repository\nUpdate Complete.");
		if (req === void 0) {
			ctx.eprintln(`Error: no requirements.yaml file exists in ${dir}`);
			return 1;
		}
		const deps = (PG.yaml.parse(req) || {}).dependencies || [];
		ctx.println(`Saving ${deps.length} charts`);
		const lock = [];
		for (const d of deps) {
			const rc = PG.repoChart(d.name);
			if (!rc) {
				ctx.eprintln(`Error: can't get a valid version for repositories ${d.name}. Try changing the version constraint in requirements.yaml`);
				return 1;
			}
			ctx.println(`Downloading ${d.name} from repo ${d.repository}`);
			for (const [p, c] of Object.entries(rc.files)) ctx.fs.write(`${dir}/charts/${d.name}/${p}`, c);
			lock.push({
				name: d.name,
				repository: d.repository,
				version: rc.version
			});
		}
		ctx.fs.write(dir + "/requirements.lock", PG.yaml.dump({
			dependencies: lock,
			digest: "sha256:" + PG.hash("deps", 64),
			generated: PG.iso(ctx.sim.clock)
		}));
		ctx.println("Deleting outdated charts");
		return 0;
	}
	return helmBase(ctx, args);
};
var VERBS = [
	"get",
	"describe",
	"create",
	"apply",
	"delete",
	"run",
	"expose",
	"scale",
	"autoscale",
	"set",
	"label",
	"annotate",
	"taint",
	"patch",
	"rollout",
	"logs",
	"exec",
	"port-forward",
	"top",
	"cordon",
	"uncordon",
	"drain",
	"auth",
	"config",
	"cluster-info",
	"version",
	"api-resources",
	"certificate",
	"events",
	"edit",
	"wait",
	"cp",
	"debug",
	"explain",
	"replace"
];
PG.complete = (sh, buf) => {
	const sim2 = sh.sim;
	const words = buf.split(/\s+/);
	const last = words[words.length - 1];
	const first = words[0];
	const idx = words.length - 1;
	const cands = [];
	const fsNames = () => {
		const base = last.includes("/") ? last.slice(0, last.lastIndexOf("/") + 1) : "";
		const dir = sh.fs.norm(base || ".", sh.cwd);
		return sh.fs.isDir(dir) ? sh.fs.list(dir).map((n) => base + n + (sh.fs.isDir((dir === "/" ? "" : dir) + "/" + n) ? "/" : "")) : [];
	};
	const cl = sim2.currentCluster();
	if (idx === 0) cands.push(...Object.keys(PG.commands), "kc", "k");
	else if ([
		"kubectl",
		"kc",
		"k"
	].includes(first)) {
		const prev = words[idx - 1];
		const verb = words.slice(1).find((w) => !w.startsWith("-") && VERBS.includes(w));
		if (prev === "-n" || prev === "--namespace") cands.push(...cl ? cl.res.namespaces.map((n) => n.metadata.name) : []);
		else if (prev === "--context") cands.push(...sim2.kubeconfig.contexts.map((c) => c.name));
		else if (prev === "-o") cands.push("wide", "yaml", "json", "name", "jsonpath=");
		else if (words.length === 2) cands.push(...VERBS);
		else if (verb === "config" && words.length === 3) cands.push("view", "current-context", "get-contexts", "use-context", "set-context", "set-credentials", "rename-context", "delete-context", "delete-cluster", "delete-user", "get-clusters", "get-users", "unset");
		else if (verb === "config" && [
			"use-context",
			"delete-context",
			"rename-context"
		].includes(words[2])) cands.push(...sim2.kubeconfig.contexts.map((c) => c.name));
		else if ([
			"get",
			"describe",
			"delete",
			"label",
			"annotate",
			"patch",
			"scale",
			"autoscale",
			"expose",
			"set",
			"top",
			"rollout",
			"port-forward",
			"logs",
			"exec"
		].includes(verb) && cl) {
			const argi = words.slice(1).filter((w) => !w.startsWith("-")).length;
			if (verb === "rollout" && argi === 2) cands.push("status", "restart", "history", "undo");
			else if (argi <= 2 || verb === "rollout" && argi === 3) {
				if (["logs", "exec"].includes(verb)) cands.push(...cl.res.pods.filter((p) => p.metadata.namespace === (words[words.indexOf("-n") + 1] || "default")).map((p) => p.metadata.name));
				else cands.push(...Object.values(PG.KINDS).filter((k) => !k.virtual || [
					"nodes",
					"endpoints",
					"events"
				].includes(k.names[1])).flatMap((k) => [k.names[1], k.names[2]].filter(Boolean)), "all");
			} else {
				const t = PG.resolveKind(words.slice(1).filter((w) => !w.startsWith("-"))[1]);
				if (t) {
					const nsv = words.includes("-n") ? words[words.indexOf("-n") + 1] : (sim2.ctxByName(sim2.kubeconfig.current) || {}).namespace || "default";
					cands.push(...t === "nodes" ? cl.nodes.map((n) => n.name) : cl.res[t].filter((o) => !PG.KINDS[t].ns || o.metadata.namespace === nsv || words.includes("-A")).map((o) => o.metadata.name));
				}
			}
		} else cands.push(...fsNames());
	} else if (first === "docker") {
		if (words.length === 2) cands.push("ps", "images", "pull", "build", "tag", "push", "run", "rm", "stop", "start", "restart", "exec", "network", "logs", "info", "system", "rmi", "inspect", "cp", "volume", "compose", "login", "logout", "search", "stats", "top", "container", "image");
		else if ([
			"stop",
			"start",
			"rm",
			"exec",
			"logs",
			"restart",
			"inspect",
			"top",
			"cp"
		].includes(words[1])) cands.push(...sim2.containers.map((c) => c.name));
		else cands.push(...fsNames());
	} else if (first === "kind") {
		if (words.length === 2) cands.push("create", "delete", "get", "load", "export", "version");
		else if (words.length === 3) cands.push(...{
			create: ["cluster"],
			delete: ["cluster"],
			get: [
				"clusters",
				"nodes",
				"kubeconfig"
			],
			load: ["docker-image"],
			export: ["kubeconfig"]
		}[words[1]] || []);
		else cands.push("--name", "--config", ...fsNames());
	} else if (first === "k3d") {
		if (words.length === 2) cands.push("cluster", "node", "image", "registry", "kubeconfig", "version");
		else if (words.length === 3) cands.push(...{
			cluster: [
				"create",
				"list",
				"start",
				"stop",
				"delete"
			],
			node: [
				"create",
				"list",
				"delete"
			],
			image: ["import"],
			registry: ["list", "delete"]
		}[words[1]] || []);
		else cands.push("--servers", "--agents", "--port", "--registry-create", "--cluster", "--role");
	} else if (first === "helm2") {
		if (words.length === 2) cands.push("init", "version", "ls", "install", "upgrade", "delete", "status", "history", "rollback", "get", "lint", "template", "test", "dependency", "search", "repo", "create", "package", "fetch", "inspect");
		else if ([
			"delete",
			"status",
			"history",
			"rollback",
			"test",
			"get"
		].includes(words[1])) cands.push(...cl ? Object.keys(cl.helm.releases) : [], "values", "manifest");
		else cands.push("--name", "--namespace", "--set", "-f", "--wait", "--timeout", "--dry-run", "--debug", "--reuse-values", "--purge", ...fsNames());
	} else if (first === "sim") cands.push("help", "load", "crash", "speed", "images", "time", "reset");
	else cands.push(...fsNames());
	return {
		word: last,
		matches: [...new Set(cands)].filter((c) => c.startsWith(last)).sort()
	};
};
PG.GUIDE = [
	{
		t: "0 · Where am I?",
		open: true,
		items: [
			["New here? Take the 2-minute tour", "tour"],
			["Which cluster is kubectl talking to?", "kubectl config current-context"],
			["All contexts (note the cloud one)", "kubectl config get-contexts"],
			["Peek at the fake PRODUCTION cluster", "kubectl get pods -A"],
			["Its services", "kubectl get svc -n shop-frontend"],
			["What can this playground do?", "help"]
		]
	},
	{
		t: "1 · kind: a 3-node cluster",
		open: true,
		items: [
			["Write the cluster description", "cat > kind-config.yaml <<'EOF'\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nname: local-cluster-1\nnodes:\n  - role: control-plane\n    extraPortMappings:\n      - containerPort: 30080\n        hostPort: 8080\n        listenAddress: \"127.0.0.1\"\n  - role: worker\n  - role: worker\nEOF"],
			["Create it", "kind create cluster --config kind-config.yaml"],
			["Nodes are Docker containers", "docker ps --format 'table {{.Names}}\\t{{.Status}}'"],
			["kind's view", "kind get clusters"],
			["Switch context (explicit)", "kubectl config use-context kind-local-cluster-1"],
			["Check it answers", "kubectl cluster-info --context kind-local-cluster-1"],
			["The nodes", "kubectl get nodes -o wide"],
			["Label the workers", "kubectl label node local-cluster-1-worker role=app\nkubectl label node local-cluster-1-worker2 role=data"],
			["See the labels", "kubectl get nodes --show-labels"],
			["Why no pods on the control-plane? (taint)", "kubectl describe node local-cluster-1-control-plane | grep Taints"],
			["What lives in kube-system?", "kubectl get pods -n kube-system -o wide"],
			["Node heartbeats (kube-node-lease)", "kubectl get lease -n kube-node-lease"],
			["kube-public", "kubectl get configmap -n kube-public"]
		]
	},
	{
		t: "1b · …or k3d (live node add/remove)",
		items: [
			["Create a k3d cluster (ports 8090/5002 so it can live next to the kind one)", "k3d cluster create local-cluster-1 --servers 1 --agents 2 --port \"8090:80@loadbalancer\" --registry-create local-registry:0.0.0.0:5002"],
			["List", "k3d cluster list"],
			["Add a node while running", "k3d node create extra --cluster local-cluster-1 --role agent"],
			["Remove it again", "kubectl drain k3d-extra-0 --ignore-daemonsets --delete-emptydir-data\nkubectl delete node k3d-extra-0\nk3d node delete k3d-extra-0"],
			["Metrics come bundled (switch to the k3d context first)", "kubectl config use-context k3d-local-cluster-1\nkubectl top nodes"],
			["Stop / start the cluster", "k3d cluster stop local-cluster-1"],
			["…and bring it back", "k3d cluster start local-cluster-1"],
			["Delete it", "k3d cluster delete local-cluster-1"],
			["Back to the kind cluster (the context is unset after a delete)", "kubectl config use-context kind-local-cluster-1"]
		]
	},
	{
		t: "2 · Namespaces",
		items: [
			["Pick your cluster (after k3d delete the context is unset)", "kubectl config use-context kind-local-cluster-1"],
			["Create three", "kubectl create namespace web\nkubectl create namespace cache\nkubectl create namespace db"],
			["List them", "kubectl get namespaces"],
			["Make \"web\" the default for this context", "kubectl config set-context --current --namespace=web"],
			["…and back to default", "kubectl config set-context --current --namespace=default"]
		]
	},
	{
		t: "3 · Deploy, one app at a time",
		items: [
			["nginx ×2 in web", "kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web"],
			["Watch it start", "kubectl get pods -n web -o wide"],
			["Wait for the rollout", "kubectl rollout status deployment/web -n web"],
			["A Service for it", "kubectl expose deployment web --port=80 -n web"],
			["Redis in cache", "kubectl create deployment cache --image=redis:7-alpine -n cache"],
			["Talk to Redis", "kubectl exec -n cache deploy/cache -- redis-cli ping"],
			["Postgres pinned to the data node (YAML)", "kubectl apply -f - <<'EOF'\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: db\n  namespace: db\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: db\n  template:\n    metadata:\n      labels:\n        app: db\n    spec:\n      nodeSelector:\n        role: data\n      containers:\n        - name: postgres\n          image: postgres:16-alpine\n          env:\n            - name: POSTGRES_PASSWORD\n              value: local-only\n          ports:\n            - containerPort: 5432\nEOF"],
			["Postgres without a password crashes!", "kubectl create deployment db2 --image=postgres:16-alpine -n db"],
			["…read why", "kubectl logs deploy/db2 -n db"],
			["A bare pod", "kubectl run toolbox --image=busybox:1.36 -n web --restart=Never --command -- sleep 3600"],
			["Everything, everywhere", "kubectl get pods -A -o wide"],
			["Who runs on which node?", "kubectl get pods -A -o wide --field-selector spec.nodeName=local-cluster-1-worker"],
			["Scale up / down", "kubectl scale deployment web --replicas=4 -n web"],
			["Describe a service", "kubectl describe svc web -n web"],
			["Which pods back it? (endpoints)", "kubectl get endpoints -n web"],
			["Events", "kubectl get events -n web"]
		]
	},
	{
		t: "4 · Reach your apps",
		items: [
			["DNS across namespaces", "kubectl run dns-test -n cache --rm -i --restart=Never --image=busybox:1.36 -- wget -qO- http://web.web"],
			["port-forward (leave running; use tab 2 to curl)", "kubectl port-forward svc/web 8081:80 -n web"],
			["…then in another tab", "curl -s http://localhost:8081 | head -5"],
			["NodePort + the kind port mapping", "kubectl apply -f - <<'EOF'\napiVersion: v1\nkind: Service\nmetadata:\n  name: web-public\n  namespace: web\nspec:\n  type: NodePort\n  selector:\n    app: web\n  ports:\n    - port: 80\n      targetPort: 80\n      nodePort: 30080\nEOF"],
			["curl it — no tunnel!", "curl -s http://localhost:8080 | head -5"],
			["Logs & access log lines", "kubectl logs deploy/web -n web --tail=5"],
			["Self-healing: delete a pod", "kubectl delete pod -n web -l app=web --wait=false"],
			["Watch the replacement", "kubectl get pods -n web -w"]
		]
	},
	{
		t: "5 · Update, roll back, break things",
		items: [
			["Roll out a bad image", "kubectl set image deployment/web nginx=nginx:99.99-nope.example.com -n web"],
			["It sticks (old pods stay up)", "kubectl rollout status deployment/web -n web --timeout=20s"],
			["History", "kubectl rollout history deployment/web -n web"],
			["Undo", "kubectl rollout undo deployment/web -n web"],
			["Restart", "kubectl rollout restart deployment/web -n web"],
			["Crash a pod", "kubectl get pods -n web\nsim crash <pod-name> -n web"],
			["Stop a worker node (like a real failure)", "docker stop local-cluster-1-worker2"],
			["…watch pods move", "kubectl get pods -A -o wide"],
			["Bring it back", "docker start local-cluster-1-worker2"],
			["PDB blocks a drain", "kubectl apply -f - <<'EOF'\napiVersion: policy/v1\nkind: PodDisruptionBudget\nmetadata:\n  name: web\n  namespace: web\nspec:\n  minAvailable: 2\n  selector:\n    matchLabels:\n      app: web\nEOF"],
			["Drain a node (Ctrl-C to stop)", "kubectl drain local-cluster-1-worker --ignore-daemonsets --delete-emptydir-data"],
			["Uncordon", "kubectl uncordon local-cluster-1-worker"],
			["Taint a node", "kubectl taint node local-cluster-1-worker2 dedicated=data:NoSchedule"],
			["Remove the taint", "kubectl taint node local-cluster-1-worker2 dedicated=data:NoSchedule-"]
		]
	},
	{
		t: "6 · Autoscaling",
		items: [
			["Metrics server (kind has none)", "kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml"],
			["Give pods a CPU request", "kubectl set resources deployment web --requests=cpu=50m -n web"],
			["Autoscale 2–6", "kubectl autoscale deployment web --cpu-percent=70 --min=2 --max=6 -n web"],
			["Generate demand (300% of one pod)", "sim load web 300 -n web"],
			["Watch it react", "kubectl get hpa -n web -w"],
			["Demand gone", "sim load web 0 -n web"]
		]
	},
	{
		t: "7 · Your own images",
		items: [
			["Make an app folder", "mkdir my-app\ncat > my-app/Dockerfile <<'EOF'\nFROM nginx:1.27\nRUN echo '<h1>hello from my-app v1</h1>' > /usr/share/nginx/html/index.html\nEOF"],
			["Build it", "docker build -t my-app:v1 my-app"],
			["Run it — fails: not on the nodes", "kubectl create deployment my-app --image=my-app:v1 -n web"],
			["Why?", "kubectl describe pod -n web -l app=my-app"],
			["Copy the image into the nodes (kind)", "kind load docker-image my-app:v1 --name local-cluster-1"],
			["Check a node has it", "docker exec local-cluster-1-worker crictl images | grep my-app"],
			["(k3d instead)", "k3d image import my-app:v1 -c local-cluster-1"],
			["See the page", "kubectl port-forward deploy/my-app 8082:80 -n web"],
			["…v2: build, load, update", "sed -i '' 's/v1/v2/' my-app/Dockerfile\ndocker build -t my-app:v2 my-app\nkind load docker-image my-app:v2 --name local-cluster-1\nkubectl set image deployment/my-app my-app=my-app:v2 -n web"],
			["Clean old tags from a node", "docker exec local-cluster-1-worker crictl rmi docker.io/library/my-app:v1"]
		]
	},
	{
		t: "8 · A local registry",
		items: [
			["Start the registry", "docker run -d --restart=always -p 127.0.0.1:5001:5000 --network bridge --name kind-registry registry:2"],
			["Put it on the kind network", "docker network connect kind kind-registry"],
			["Tell every node about localhost:5001", "for node in $(kind get nodes --name local-cluster-1); do\n  docker exec \"$node\" mkdir -p /etc/containerd/certs.d/localhost:5001\n  printf '[host.\"http://kind-registry:5000\"]\\n' | docker exec -i \"$node\" cp /dev/stdin /etc/containerd/certs.d/localhost:5001/hosts.toml\ndone"],
			["Push an image", "docker pull busybox:1.36\ndocker tag busybox:1.36 localhost:5001/busybox:1.36\ndocker push localhost:5001/busybox:1.36"],
			["Pull it from the cluster", "kubectl run regcheck -n web --rm -i --restart=Never --image=localhost:5001/busybox:1.36 -- echo it-works"],
			["What's in the registry?", "curl -s localhost:5001/v2/_catalog"],
			["A private registry needs a pull secret", "kubectl create deployment private --image=registry.example.com/team/app:1 -n web"],
			["Create \"regsecret\"", "kubectl create secret docker-registry regsecret --docker-server=registry.example.com --docker-username=me --docker-password=pw -n web"],
			["Give it to the pods", "kubectl patch deployment private -n web -p '{\"spec\":{\"template\":{\"spec\":{\"imagePullSecrets\":[{\"name\":\"regsecret\"}]}}}}'"]
		]
	},
	{
		t: "9 · Helm 2 + Tiller",
		items: [
			["Is Tiller there?", "helm2 ls"],
			["Client only", "helm2 init --client-only"],
			["Tiller's account + permission", "kubectl -n kube-system create serviceaccount tiller\nkubectl create clusterrolebinding tiller --clusterrole=cluster-admin --serviceaccount=kube-system:tiller"],
			["Install Tiller", "helm2 init --service-account tiller --tiller-image ghcr.io/helm/tiller:v2.17.0 --stable-repo-url https://charts.helm.sh/stable"],
			["Wait for it", "kubectl -n kube-system rollout status deploy/tiller-deploy"],
			["Both halves match?", "helm2 version --short"],
			["The chart is in ~/myapp", "ls myapp myapp/templates"],
			["Lint it", "helm2 lint myapp"],
			["Render it (no cluster needed)", "helm2 template myapp --name demo --namespace web"],
			["…one file", "helm2 template myapp --name demo --namespace web -x templates/deployment.yaml"],
			["Dry run", "helm2 install myapp --name demo --namespace web --dry-run --debug"],
			["Install for real", "helm2 install myapp --name demo --namespace web --wait --timeout 120"],
			["Releases", "helm2 ls"],
			["Its objects (found by label)", "kubectl get all -n web -l app.kubernetes.io/instance=demo"],
			["Test it", "helm2 test demo"],
			["Upgrade (replicas + tag)", "helm2 upgrade demo myapp --namespace web --set replicaCount=3 --set image.tag=1.27.1 --wait --timeout 300"],
			["Turn on more: ingress, autoscaling", "helm2 upgrade demo myapp --namespace web --set ingress.enabled=true,autoscaling.enabled=true,networkPolicy.enabled=true"],
			["A migration hook", "helm2 upgrade demo myapp --namespace web --set migration.enabled=true,cronjob.enabled=true"],
			["History", "helm2 history demo"],
			["Roll back", "helm2 rollback demo 1"],
			["What values were used?", "helm2 get values demo"],
			["The manifest Helm applied", "helm2 get manifest demo"],
			["Release records live IN the cluster", "kubectl get cm -n kube-system -l OWNER=TILLER"],
			["A secret in values is stored there too!", "helm2 upgrade demo myapp --namespace web --set secret.create=true,secret.data.DB_PASSWORD=hunter2\nkubectl get cm demo.v6 -n kube-system -o jsonpath='{.data.release}' | base64 -d"],
			["Remove it", "helm2 delete demo --purge"],
			["Edit values.yaml in the Files tab, then re-run helm2 template!", "cat myapp/values.yaml"]
		]
	},
	{
		t: "10 · Who may do what (RBAC)",
		items: [
			["A program identity", "kubectl create serviceaccount dev-alice -n web"],
			["A Role: what", "kubectl create role web-developer --verb=get,list,watch,create,update,patch,delete --resource=pods,services,deployments.apps -n web"],
			["A RoleBinding: who + where", "kubectl create rolebinding dev-alice-web --role=web-developer --serviceaccount=web:dev-alice -n web"],
			["Test (impersonation)", "kubectl auth can-i create deployments -n web --as=system:serviceaccount:web:dev-alice\nkubectl auth can-i create deployments -n db --as=system:serviceaccount:web:dev-alice\nkubectl auth can-i get secrets -n web --as=system:serviceaccount:web:dev-alice"],
			["Everything it may do", "kubectl auth can-i --list -n web --as=system:serviceaccount:web:dev-alice"],
			["Become alice for real", "TOKEN=$(kubectl create token dev-alice -n web)\nkubectl config set-credentials dev-alice --token=\"$TOKEN\"\nkubectl config set-context dev-alice-web --cluster=kind-local-cluster-1 --user=dev-alice --namespace=web"],
			["Allowed here…", "kubectl --context dev-alice-web get pods"],
			["…forbidden there", "kubectl --context dev-alice-web get pods -n db"],
			["A person with a certificate: key + CSR", "openssl genrsa -out alice.key 2048\nopenssl req -new -key alice.key -out alice.csr -subj \"/CN=alice/O=web-developers\""],
			["Ask the cluster to sign it", "kubectl apply -f - <<EOF\napiVersion: certificates.k8s.io/v1\nkind: CertificateSigningRequest\nmetadata:\n  name: alice\nspec:\n  request: $(base64 < alice.csr | tr -d '\\n')\n  signerName: kubernetes.io/kube-apiserver-client\n  expirationSeconds: 86400\n  usages:\n    - client auth\nEOF"],
			["Approve + fetch the certificate", "kubectl certificate approve alice\nkubectl get csr alice -o jsonpath='{.status.certificate}' | base64 -d > alice.crt"],
			["Add alice to kubeconfig", "kubectl config set-credentials alice --client-certificate=alice.crt --client-key=alice.key --embed-certs=true\nkubectl config set-context alice-web --cluster=kind-local-cluster-1 --user=alice --namespace=web"],
			["She has no permissions yet", "kubectl --context alice-web get pods"],
			["Bind the GROUP (built-in \"edit\" role)", "kubectl create rolebinding web-developers-edit --clusterrole=edit --group=web-developers -n web"],
			["Now it works — only in web", "kubectl --context alice-web get pods\nkubectl --context alice-web get pods -n db"],
			["Pod Security on a namespace", "kubectl label namespace web pod-security.kubernetes.io/enforce=restricted"],
			["…a new deployment is refused", "kubectl create deployment strict --image=nginx:1.27 -n web\nkubectl describe rs -n web -l app=strict"],
			["Default-deny network policy", "kubectl apply -f - <<'EOF'\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny-ingress\n  namespace: db\nspec:\n  podSelector: {}\n  policyTypes: [\"Ingress\"]\nEOF"],
			["Quota", "kubectl create quota web-quota --hard=pods=5 -n web"]
		]
	},
	{
		t: "11 · Stop & clean up",
		items: [
			["Delete the namespaces", "kubectl delete namespace web cache db"],
			["Stop kind (it is just containers)", "docker stop $(kind get nodes --name local-cluster-1)"],
			["Start it again", "docker start $(kind get nodes --name local-cluster-1)"],
			["Delete the cluster", "kind delete cluster --name local-cluster-1"],
			["Stale kubeconfig entries?", "kubectl config get-contexts"],
			["Remove a context", "kubectl config delete-context kind-local-cluster-1"],
			["Remove the registry", "docker rm -f kind-registry"],
			["Nothing left?", "docker ps -a"]
		]
	}
];
(() => {
	const G = PG.GUIDE;
	const at = (prefix) => G.findIndex((s) => s.t.startsWith(prefix));
	const insertAfter = (prefix, sec) => {
		const i = at(prefix);
		G.splice(i < 0 ? G.length : i + 1, 0, sec);
	};
	const add = (prefix, ...items) => {
		const s = G[at(prefix)];
		if (s) s.items.push(...items);
	};
	insertAfter("0 ·", {
		t: "0c · Look around the files",
		items: [
			["Make a few folders and files to look at", "mkdir -p ~/lab/a/b ~/lab/.hidden\necho hello > ~/lab/a/f.txt\nprintf '#!/bin/sh\\necho hi\\n' > ~/lab/run.sh"],
			["Long listing with hidden files: permissions, owner, size, time", "ls -la ~/lab"],
			["Human-readable sizes, newest first", "ls -lht ~"],
			["Everything below a folder", "ls -R ~/lab"],
			["The folder tree (the Helm chart)", "tree ~/myapp"],
			["Only two levels, with hidden files", "tree -a -L 2 ~"],
			["Folders only / skip some names", "tree -d ~/myapp\ntree -I \"charts|files\" ~/myapp"]
		]
	});
	insertAfter("0 ·", {
		t: "0b · Edit files with vi",
		items: [
			["Open (or create) a file: i = start typing, Esc = stop, :wq = save and quit", "vi ~/notes.txt"],
			["Edit the Helm chart values in place (:q! leaves without saving)", "vi ~/myapp/values.yaml"],
			["Look without touching", "view ~/myapp/Chart.yaml"],
			["Check what you saved", "cat ~/notes.txt"]
		]
	});
	insertAfter("3 · Deploy", {
		t: "3b · Inside a pod",
		items: [
			["Open a shell in a pod (deploy/NAME works)", "kubectl exec -it deploy/web -n web -- sh"],
			["…then, at the root@… prompt: what is running?", "ps\nwhoami\nhostname\nenv | head -5"],
			["…what files does it have?", "ls /\ncat /etc/os-release\nls /usr/share/nginx/html\ncat /etc/nginx/conf.d/default.conf"],
			["…the network, from the inside", "curl -s localhost | head -3\nnslookup web\nping -c 2 web\nnetstat -tln"],
			["…write a file, read it back", "echo \"hello from inside\" > /tmp/note.txt\ncat /tmp/note.txt"],
			["…leave the pod", "exit"],
			["One command, no shell", "kubectl exec deploy/web -n web -- ps aux"],
			["Copy a file in and out", "echo \"from my laptop\" > note.txt\nPOD=$(kubectl get pod -n web -l app=web -o jsonpath='{.items[0].metadata.name}')\nkubectl cp note.txt web/$POD:/tmp/note.txt\nkubectl exec -n web $POD -- cat /tmp/note.txt"],
			["Debug a pod that has no tools: attach a busybox shell (press Enter yourself)", "kubectl debug -it -n web $(kubectl get pod -n web -l app=web -o jsonpath='{.items[0].metadata.name}') --image=busybox:1.36 --target=nginx -- sh"],
			["…inside the debug shell (you see the target container's processes), then leave", "ps\nwhoami\nexit"],
			["Redis: really use it", "kubectl exec -n cache deploy/cache -- redis-cli set greeting hello\nkubectl exec -n cache deploy/cache -- redis-cli get greeting\nkubectl exec -n cache deploy/cache -- redis-cli keys \"*\""],
			["Postgres: ask it something", "kubectl exec -n db deploy/db -- psql -U postgres -c \"select version()\""]
		]
	});
	insertAfter("3b · Inside", {
		t: "3c · Probes, init containers, sidecars, OOM",
		items: [
			["A readiness probe on a path that does not exist", "kubectl apply -f - <<'EOF'\napiVersion: apps/v1\nkind: Deployment\nmetadata: { name: probe, namespace: web }\nspec:\n  replicas: 1\n  selector: { matchLabels: { app: probe } }\n  template:\n    metadata: { labels: { app: probe } }\n    spec:\n      containers:\n        - name: nginx\n          image: nginx:1.27\n          readinessProbe: { httpGet: { path: /healthz, port: 80 }, periodSeconds: 5 }\nEOF\nkubectl expose deploy probe --port=80 -n web"],
			["It runs, but is NOT Ready — and has no endpoints", "kubectl get pods -n web -l app=probe\nkubectl get endpoints probe -n web\nkubectl describe pod -n web -l app=probe | tail -6"],
			["Fix it from inside the pod, watch it become Ready", "kubectl exec -n web deploy/probe -- sh -c \"echo ok > /usr/share/nginx/html/healthz\"\nkubectl get pods -n web -l app=probe -w"],
			["A liveness probe that always fails: restarts", "kubectl apply -f - <<'EOF'\napiVersion: v1\nkind: Pod\nmetadata: { name: live, namespace: web }\nspec:\n  containers:\n    - name: nginx\n      image: nginx:1.27\n      livenessProbe: { httpGet: { path: /nope, port: 80 }, periodSeconds: 5, failureThreshold: 2 }\nEOF"],
			["…watch RESTARTS climb, then read the events", "kubectl get pod live -n web -w\nkubectl get events -n web --field-selector involvedObject.name=live"],
			["OOMKilled: a memory limit that is too small", "kubectl apply -f - <<'EOF'\napiVersion: v1\nkind: Pod\nmetadata: { name: hungry, namespace: web }\nspec:\n  containers:\n    - name: pg\n      image: postgres:16-alpine\n      env: [{ name: POSTGRES_PASSWORD, value: x }]\n      resources: { limits: { memory: 20Mi } }\nEOF\nkubectl get pod hungry -n web -w"],
			["…see why", "kubectl describe pod hungry -n web | grep -A4 \"Last State\""],
			["Init container fills a shared folder; nginx serves it (+ a sidecar)", "kubectl apply -f - <<'EOF'\napiVersion: apps/v1\nkind: Deployment\nmetadata: { name: site, namespace: web }\nspec:\n  replicas: 1\n  selector: { matchLabels: { app: site } }\n  template:\n    metadata: { labels: { app: site } }\n    spec:\n      initContainers:\n        - name: prepare\n          image: busybox:1.36\n          command: [\"sh\", \"-c\", \"echo '<h1>written by the init container</h1>' > /work/index.html\"]\n          volumeMounts: [{ name: html, mountPath: /work }]\n      containers:\n        - name: nginx\n          image: nginx:1.27\n          volumeMounts: [{ name: html, mountPath: /usr/share/nginx/html }]\n        - name: sidecar\n          image: busybox:1.36\n          command: [\"sleep\", \"3600\"]\n      volumes:\n        - { name: html, emptyDir: {} }\nEOF\nkubectl expose deploy site --port=80 -n web"],
			["Watch it start: Init:0/1 → PodInitializing → 2/2", "kubectl get pods -n web -l app=site -w"],
			["Its page came from the init container", "kubectl run c1 --rm -i --restart=Never --image=busybox:1.36 -n web -- wget -qO- http://site"],
			["Pick a container with -c", "kubectl logs deploy/site -n web -c nginx\nkubectl exec deploy/site -n web -c sidecar -- ps\nkubectl describe pod -n web -l app=site | sed -n \"/Init Containers/,/Conditions/p\""],
			["An init container that waits for a Service", "kubectl apply -f - <<'EOF'\napiVersion: v1\nkind: Pod\nmetadata: { name: waiter, namespace: web }\nspec:\n  initContainers:\n    - name: wait-db\n      image: busybox:1.36\n      command: [\"sh\", \"-c\", \"until nslookup mydb; do echo waiting; sleep 2; done\"]\n  containers:\n    - name: app\n      image: nginx:1.27\nEOF"],
			["…it waits (Init:0/1). Create the Service it needs:", "kubectl create deployment mydb --image=redis:7-alpine -n web\nkubectl expose deploy mydb --port=6379 -n web\nkubectl get pod waiter -n web -w"]
		]
	});
	insertAfter("3c · Probes", {
		t: "4c · Ingress (kind needs ingress-nginx)",
		items: [
			["A kind cluster with ports 80/443 mapped (new cluster, name: ing)", "cat > ingress-kind.yaml <<'EOF'\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nname: ing\nnodes:\n  - role: control-plane\n    extraPortMappings:\n      - containerPort: 80\n        hostPort: 80\n      - containerPort: 443\n        hostPort: 443\n  - role: worker\nEOF\nkind create cluster --config ingress-kind.yaml"],
			["Two apps behind two Services", "kubectl create namespace web\nkubectl create deployment web --image=nginx:1.27 -n web\nkubectl expose deploy web --port=80 -n web\nkubectl create deployment api --image=httpd:2.4 -n web\nkubectl expose deploy api --port=80 -n web"],
			["The Ingress rules (host-based)", "kubectl apply -f - <<'EOF'\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata: { name: site, namespace: web }\nspec:\n  ingressClassName: nginx\n  rules:\n    - host: web.local\n      http:\n        paths:\n          - { path: /, pathType: Prefix, backend: { service: { name: web, port: { number: 80 } } } }\n    - host: api.local\n      http:\n        paths:\n          - { path: /, pathType: Prefix, backend: { service: { name: api, port: { number: 80 } } } }\nEOF"],
			["Nothing answers yet: there is no controller", "curl -s http://localhost/ | head -2"],
			["Install the controller", "kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml\nkubectl get pods -n ingress-nginx\nkubectl get ingress -n web"],
			["Choose the app with a Host header", "curl -s -H \"Host: web.local\" http://localhost/ | head -3\ncurl -s -H \"Host: api.local\" http://localhost/ | head -3\ncurl -s -H \"Host: nope.local\" http://localhost/ | head -3"],
			["…or make the names resolve, like a real laptop", "echo '127.0.0.1 web.local api.local' | sudo tee -a /etc/hosts\ncurl -s http://api.local/ | head -3\ncurl -s -o /dev/null -w '%{http_code}\\n' http://web.local/"],
			["Finished? Go back to your first cluster (and remove this one)", "kubectl config use-context kind-local-cluster-1\nkind delete cluster --name ing\nkubectl config use-context kind-local-cluster-1"]
		]
	});
	add("7 · Your own images", ["Dockerfile: COPY your own page, ENV, EXPOSE, WORKDIR, RUN", "mkdir -p site\necho '<h1>My custom page</h1>' > site/index.html\ncat > site/Dockerfile <<'EOF'\nFROM nginx:1.27\nLABEL team=web\nENV APP_ENV=prod\nWORKDIR /usr/share/nginx/html\nCOPY index.html .\nRUN echo 'built at build time' > build.txt\nEXPOSE 80\nEOF\ndocker build -t site:v1 site"], ["Look inside the image's config", "docker inspect site:v1 | head -20"], ["Run it: your COPY'd page is what answers", "kind load docker-image site:v1 --name local-cluster-1\nkubectl create deployment site1 --image=site:v1 -n web --port=80\nkubectl expose deploy site1 --port=80 -n web\nkubectl rollout status deploy/site1 -n web\nkubectl run c1 --rm -i --restart=Never --image=busybox:1.36 -n web -- wget -qO- http://site1"], ["…and inside the container, the files are there", "kubectl exec deploy/site1 -n web -- cat /usr/share/nginx/html/build.txt"], ["Multi-stage build (COPY --from)", "cat > site/Dockerfile.ms <<'EOF'\nFROM alpine:3.20 AS builder\nRUN mkdir -p /out && echo 'compiled artifact' > /out/app.txt\nFROM nginx:1.27\nCOPY --from=builder /out/app.txt /usr/share/nginx/html/index.html\nEOF\ndocker build -f site/Dockerfile.ms -t ms:1 site"], ["ENV can satisfy a base image (postgres needs a password)", "printf 'FROM postgres:16-alpine\\nENV POSTGRES_PASSWORD=secret\\n' > site/Dockerfile.pg\ndocker build -f site/Dockerfile.pg -t mypg:1 site\nkind load docker-image mypg:1 --name local-cluster-1\nkubectl create deployment mypg --image=mypg:1 -n db\nkubectl get pods -n db"], ["CMD decides what runs: sleep infinity stays up, echo exits", "printf 'FROM alpine:3.20\\nCMD [\"sleep\",\"infinity\"]\\n' > site/Dockerfile.sl\ndocker build -f site/Dockerfile.sl -t sl:1 site\nprintf 'FROM alpine:3.20\\nCMD [\"echo\",\"hi\"]\\n' > site/Dockerfile.ec\ndocker build -f site/Dockerfile.ec -t ec:1 site\nkind load docker-image sl:1 ec:1 --name local-cluster-1\nkubectl create deployment sl --image=sl:1 -n web\nkubectl create deployment ec --image=ec:1 -n web\nkubectl get pods -n web"], ["A missing COPY source fails like the real thing", "printf \"FROM nginx:1.27\\nCOPY nope.html /x/\\n\" > site/Dockerfile.bad\ndocker build -f site/Dockerfile.bad -t bad:1 site"]);
	insertAfter("7 · Your own", {
		t: "7b · docker on its own (no cluster)",
		items: [
			["Run a container, throw it away", "docker run --rm alpine echo hello from alpine"],
			["A web server on a host port", "docker run -d --name web1 -p 8085:80 nginx:1.27\ncurl -s localhost:8085 | head -3"],
			["Look around inside it", "docker exec web1 ps\ndocker exec web1 cat /etc/nginx/conf.d/default.conf\ndocker logs web1"],
			["An interactive shell in a fresh container", "docker run -it --rm alpine sh"],
			["…type: whoami / cat /etc/os-release / exit", "whoami\ncat /etc/os-release | head -2\nexit"],
			["Bind mount: your folder is the web root (edit it live)", "mkdir -p mysite && echo '<h1>v1</h1>' > mysite/index.html\ndocker run -d --name bm -p 8086:80 -v ./mysite:/usr/share/nginx/html nginx:1.27\ncurl -s localhost:8086\necho '<h1>v2 edited</h1>' > mysite/index.html\ncurl -s localhost:8086"],
			["A named volume outlives the container", "docker run --rm -v mydata:/data alpine sh -c \"echo persisted > /data/note.txt\"\ndocker volume ls\ndocker run --rm -v mydata:/data alpine cat /data/note.txt"],
			["Copy files in and out; inspect", "echo hello > local.txt\ndocker cp local.txt web1:/tmp/local.txt\ndocker exec web1 cat /tmp/local.txt\ndocker inspect --format '{{.State.Status}} {{.NetworkSettings.IPAddress}}' web1"],
			["Resource use and processes", "docker stats --no-stream\ndocker top web1"],
			["docker compose: three services from one file", "mkdir -p stack/html && echo '<h1>compose site</h1>' > stack/html/index.html\ncat > stack/compose.yaml <<'EOF'\nservices:\n  web:\n    image: nginx:1.27\n    ports: [\"9000:80\"]\n    volumes: [\"./html:/usr/share/nginx/html\"]\n    depends_on: [cache]\n  cache:\n    image: redis:7-alpine\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD: secret\nEOF\ncd stack && docker compose up -d"],
			["…use it, then take it down", "docker compose ps\ncurl -s localhost:9000\ndocker compose exec cache redis-cli ping\ndocker compose down\ncd ~"],
			["Search, login, clean up", "docker search nginx\ndocker login -u me -p pw registry.example.com\ndocker system prune -f"]
		]
	});
	add("9 · Helm", ["Scaffold a brand-new chart", "helm2 create shop\nls shop shop/templates\nhelm2 lint shop"], ["Install it twice under different names", "helm2 install shop --name s1 --namespace web --wait --timeout 120\nhelm2 install shop --name s2 --namespace web\nhelm2 ls"], ["Package it, install from the .tgz", "helm2 package shop\nls *.tgz\nhelm2 install shop-0.1.0.tgz --name s3 --namespace web"], ["Charts from the stable repo", "helm2 search stable/\nhelm2 inspect values stable/redis\nhelm2 install stable/redis --name r1 --namespace web --set usePassword=true,password=s3cret"], ["…use what it installed", "kubectl rollout status deploy/r1-redis-master -n web\nkubectl get pods,svc,secret -n web -l release=r1\nkubectl exec -n web deploy/r1-redis-master -- redis-cli ping"], ["A database from a chart", "helm2 install stable/postgresql --name pg --namespace web --set postgresqlPassword=hunter2\nkubectl rollout status deploy/pg-postgresql -n web\nkubectl get pods -n web -l release=pg"], ["A parent chart with a subchart (dependency)", "helm2 create app\nprintf 'dependencies:\\n  - name: redis\\n    version: 10.x.x\\n    repository: https://charts.helm.sh/stable\\n    condition: redis.enabled\\n' > app/requirements.yaml\nprintf 'redis:\\n  enabled: true\\n  usePassword: true\\n' >> app/values.yaml\nhelm2 dependency update app\nhelm2 dependency list app"], ["…the subchart is rendered with the parent", "helm2 template app --name d1 --namespace web | grep \"^# Source\"\nhelm2 template app --name d1 --namespace web --set redis.enabled=false | grep -c \"charts/redis\""]);
	insertAfter("9 · Helm", {
		t: "9b · kubectl power tools",
		items: [
			["Wait until things are ready (scripts love this)", "kubectl wait --for=condition=available deployment/web -n web --timeout=60s\nkubectl wait --for=condition=ready pod -l app=web -n web --timeout=60s"],
			["Wait on any field", "kubectl wait --for=jsonpath='{.status.phase}'=Running pod -l app=web -n web"],
			["Edit a live object (opens the Files tab; Apply or Cancel in the banner)", "kubectl edit deployment web -n web"],
			["Pick your own columns", "kubectl get pods -A -o custom-columns=NS:.metadata.namespace,NAME:.metadata.name,NODE:.spec.nodeName,STATUS:.status.phase"],
			["Sort, and show a label as a column", "kubectl get pods -A --sort-by=.metadata.name -L app"],
			["JSONPath filters", "kubectl get deploy web -n web -o jsonpath='{.spec.template.spec.containers[?(@.name==\"nginx\")].image}'\nkubectl get pod -n web -l app=web -o jsonpath='{.items[0].status.conditions[?(@.type==\"Ready\")].status}'"],
			["Pause a rollout, change things, resume", "kubectl rollout pause deployment/web -n web\nkubectl set image deployment/web nginx=nginx:1.26 -n web\nkubectl get deploy web -n web\nkubectl rollout resume deployment/web -n web"],
			["Replace from a file", "kubectl get deploy web -n web -o yaml > web.yaml\nsed -i \"\" \"s/replicas: 2/replicas: 3/\" web.yaml\nkubectl replace -f web.yaml"],
			["More create commands", "kubectl create cronjob hello --image=busybox:1.36 --schedule=\"*/1 * * * *\" -n web -- echo hi\nkubectl create ingress site --rule=\"web.local/*=web:80\" --class=nginx -n web\nkubectl create pdb webpdb --selector=app=web --min-available=1 -n web"],
			["Built-in docs", "kubectl explain deployment.spec\nkubectl explain pod"],
			["API health", "kubectl get --raw /healthz"]
		]
	});
	insertAfter("10 · Who may", {
		t: "10b · Shell tools (pipes, loops, jq, awk)",
		items: [
			["Refresh a command every 2 seconds (Ctrl-C to stop)", "watch -n 2 kubectl get pods -A"],
			["Count pods per namespace", "kubectl get pods -A --no-headers | awk '{print $1}' | sort | uniq -c"],
			["kubectl + jq", "kubectl get pods -n web -o json | jq -r '.items[].metadata.name'"],
			["jq: pick fields into new objects", "kubectl get pods -n web -o json | jq -c '.items[] | {name: .metadata.name, node: .spec.nodeName}'"],
			["for loop", "for ns in web cache db; do echo \"== $ns\"; kubectl get pods -n $ns --no-headers | wc -l; done"],
			["if / while / arithmetic", "i=0\nwhile [ $i -lt 3 ]; do echo \"round $i\"; i=$((i+1)); done\nif [ -f note.txt ]; then echo \"note.txt exists\"; else echo \"no note\"; fi"],
			["cut, sed, grep -A, tee, xargs", "echo 'a,b,c' | cut -d, -f2\nkubectl describe pod -n web -l app=web | sed -n '/Events/,$p' | head\nkubectl get pods -A | grep -A1 coredns\nkubectl get ns --no-headers | tee namespaces.txt | wc -l\ncat namespaces.txt | awk '{print $1}' | xargs -n1 echo ns:"],
			["find, alias, date", "find ~ -name '*.yaml'\nalias kgp='kubectl get pods'\nkgp -A\ndate +%Y-%m-%d"]
		]
	});
})();
//#endregion
//#region src/playground/term.js
var selText = () => {
	const g = window.getSelection();
	return g ? g.toString() : "";
};
var HIST = [];
var guideCmds = null;
function suggestFor(v) {
	if (!v || /^\s+$/.test(v)) return "";
	for (let i = HIST.length - 1; i >= 0; i--) if (HIST[i].length > v.length && HIST[i].startsWith(v)) return HIST[i];
	if (!guideCmds) {
		guideCmds = [];
		for (const sec of PG.GUIDE) for (const it of sec.items) if (!it[1].includes("\n")) guideCmds.push(it[1]);
	}
	return guideCmds.find((c) => c.length > v.length && c.startsWith(v)) || "";
}
var BANNER = "KubeDojo — everything here is simulated: no Docker, no real cluster.\nType \"help\", click commands in the left panel, search them all with Ctrl/⌘ Shift P, or press ▶ (top right) for a walkthrough. You start inside a fake PRODUCTION cluster: look before you type!\n";
var UID = 0;
var TermModel = class {
	constructor(store, id, label) {
		_defineProperty(this, "subscribe", (l) => {
			this.listeners.add(l);
			return () => this.listeners.delete(l);
		});
		_defineProperty(this, "getSnapshot", () => this.version);
		this.store = store;
		this.id = id;
		this.label = label;
		this.uid = ++UID;
		this.shell = new PG.Shell(store.sim, this);
		store.sim.shells.push(this.shell);
		this.hist = [];
		this.hi = 0;
		this.running = false;
		this.value = "";
		this.lines = [];
		this.seq = 0;
		this.vi = null;
		this.inputEl = null;
		this.viEl = null;
		this.getCols = null;
		this.forceScroll = false;
		this.version = 0;
		this.listeners = /* @__PURE__ */ new Set();
		this.queued = false;
		this.saveT = null;
		if (id === 1) this.print(BANNER, "dim");
	}
	emit() {
		this.version++;
		for (const l of [...this.listeners]) l();
	}
	notify() {
		if (this.queued) return;
		this.queued = true;
		queueMicrotask(() => {
			this.queued = false;
			this.emit();
		});
		this.scheduleSave();
	}
	scheduleSave() {
		if (this.saveT) return;
		this.saveT = setTimeout(() => {
			this.saveT = null;
			this.store.saveTerm(this);
		}, 800);
	}
	setValue(v) {
		this.value = v;
		this.emit();
	}
	print(text, cls) {
		this.lines.push({
			id: ++this.seq,
			text,
			cls,
			pre: /\S {3,}\S/.test(text)
		});
		if (this.lines.length > 2500) this.lines.splice(0, this.lines.length - 2500);
		this.notify();
	}
	printCmd(prompt, text) {
		this.lines.push({
			id: ++this.seq,
			cmd: true,
			prompt,
			text
		});
		this.notify();
	}
	clear() {
		this.lines = [];
		clearTimeout(this.saveT);
		this.saveT = null;
		this.store.forgetTerm(this);
		this.notify();
	}
	get cols() {
		return this.getCols ? this.getCols() : 80;
	}
	edit(vi) {
		return new Promise((resolve) => {
			this.vi = {
				vi,
				resolve,
				seq: ++this.seq
			};
			this.store.bump();
		});
	}
	finishVi() {
		const v = this.vi;
		if (!v) return;
		this.vi = null;
		this.store.bump();
		v.resolve();
		setTimeout(() => {
			if (this.store.active === this) this.focus();
		}, 0);
	}
	focus() {
		(this.vi ? this.viEl : this.inputEl)?.focus();
	}
	prompt() {
		return this.shell.prompt();
	}
	suggestionFor(el) {
		const v = this.value;
		return el && el.selectionStart === v.length && el.selectionEnd === v.length && !this.running ? suggestFor(v) : "";
	}
	async enter(text) {
		if (this.running) return;
		const p = this.shell.prompt();
		this.printCmd(p, text);
		if (text.trim() && this.hist[this.hist.length - 1] !== text) this.hist.push(text);
		if (text.trim() && HIST[HIST.length - 1] !== text) HIST.push(text);
		this.hi = this.hist.length;
		this.forceScroll = true;
		this.running = true;
		this.emit();
		try {
			await this.shell.submit(text);
		} catch (e) {
			this.print("internal error: " + e, "err");
		}
		this.running = false;
		this.forceScroll = true;
		this.emit();
		if (this.store.active === this) this.focus();
		this.store.bump();
	}
	async pasteLines(text) {
		const lines = text.replace(/\r/g, "").split("\n");
		if (lines[lines.length - 1] === "") lines.pop();
		const first = this.value + lines[0];
		this.setValue("");
		await this.enter(first);
		for (const l of lines.slice(1)) await this.enter(l);
	}
	async runText(text) {
		for (const l of text.split("\n")) await this.enter(l);
	}
	key(e) {
		const el = e.currentTarget;
		this.forceScroll = true;
		this.notify();
		const sg = this.suggestionFor(el), v = this.value;
		if (sg) {
			if ((e.key === "ArrowRight" && (e.altKey || e.ctrlKey) || e.altKey && e.code === "KeyF") && !e.metaKey) {
				e.preventDefault();
				const m = /^\s*\S+/.exec(sg.slice(v.length));
				this.setValue(v + (m ? m[0] : sg.slice(v.length)));
				return;
			}
			if (!e.shiftKey && !e.metaKey && !e.altKey && (e.key === "ArrowRight" && !e.ctrlKey || e.key === "End" || e.key === "Tab" || e.ctrlKey && e.key === "f")) {
				e.preventDefault();
				this.setValue(sg);
				return;
			}
		}
		if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "k" && !this.running) {
			e.preventDefault();
			this.clear();
			return;
		}
		if (e.key === "Enter") {
			e.preventDefault();
			const t = this.value;
			this.setValue("");
			this.enter(t);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			if (this.hi > 0) {
				this.hi--;
				this.setValue(this.hist[this.hi]);
			}
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			if (this.hi < this.hist.length - 1) {
				this.hi++;
				this.setValue(this.hist[this.hi]);
			} else {
				this.hi = this.hist.length;
				this.setValue("");
			}
		} else if (e.ctrlKey && (e.key === "c" || e.key === "C") && (selText() || el.selectionStart !== el.selectionEnd)) {} else if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
			e.preventDefault();
			if (this.running) {
				this.shell.abort();
				this.print("^C", "dim");
			} else {
				this.printCmd(this.shell.prompt(), this.value + "^C");
				this.setValue("");
				this.shell.buf = null;
			}
		} else if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
			e.preventDefault();
			this.clear();
		} else if (e.key === "Tab") {
			e.preventDefault();
			const t = this.value;
			const r = PG.complete(this.shell, t);
			if (!r.matches.length) return;
			const common = r.matches.reduce((a, b) => {
				let i = 0;
				while (i < a.length && i < b.length && a[i] === b[i]) i++;
				return a.slice(0, i);
			});
			const head = t.slice(0, t.length - r.word.length);
			if (r.matches.length === 1) this.setValue(head + r.matches[0] + (r.matches[0].endsWith("/") || r.matches[0].endsWith("=") ? "" : " "));
			else {
				this.setValue(head + common);
				if (common === r.word) this.print(this.shell.prompt() + t + "\n" + r.matches.join("   "), "dim");
			}
		}
	}
	dispose() {
		clearTimeout(this.saveT);
		const sim = this.store.sim;
		const i = sim.shells.indexOf(this.shell);
		if (i >= 0) sim.shells.splice(i, 1);
		this.shell.abort();
	}
};
//#endregion
//#region src/playground/store.js
var FS_KEY = "k8s-playground:fs:v1";
var TOUR_KEY = "k8s-playground:tour:v1";
var STATE_KEY = "kd.dojo.state.v1";
var TERM_PREFIX = "kd.dojo.term.v1.";
var TERM_V = 1;
var lsGet = (k) => {
	try {
		return JSON.parse(localStorage.getItem(k) || "null");
	} catch (e) {
		return null;
	}
};
var lsSet = (k, v) => {
	try {
		localStorage.setItem(k, JSON.stringify(v));
	} catch (e) {}
};
var lsDel = (k) => {
	try {
		localStorage.removeItem(k);
	} catch (e) {}
};
var savedTermKeys = () => {
	try {
		return Object.keys(localStorage).filter((k) => k.startsWith(TERM_PREFIX)).sort((a, b) => Number(a.slice(16)) - Number(b.slice(16)));
	} catch (e) {
		return [];
	}
};
var SYSTEM_NS = [
	"kube-system",
	"kube-public",
	"kube-node-lease",
	"local-path-storage",
	"ingress-nginx",
	"default-system"
];
var PALETTE = [
	"#4f9dff",
	"#ff8c42",
	"#b57cff",
	"#32d6a0",
	"#ff5c8a",
	"#e6c229",
	"#5ad1e6",
	"#9bd14f",
	"#ff7ae0",
	"#a0a8ff"
];
var nsColor = (n) => {
	if (SYSTEM_NS.includes(n)) return "#6b7280";
	if (n === "default") return "#8b95a5";
	let h = 0;
	for (const c of n) h = h * 31 + c.charCodeAt(0) >>> 0;
	return PALETTE[h % PALETTE.length];
};
var loadFs = () => {
	try {
		const t = localStorage.getItem(FS_KEY);
		return t ? JSON.parse(t) : null;
	} catch (e) {
		return null;
	}
};
var storageWorks = () => {
	try {
		localStorage.setItem(FS_KEY + ":probe", "1");
		localStorage.removeItem(FS_KEY + ":probe");
		return true;
	} catch (e) {
		return false;
	}
};
var VIZ_TABS = [
	"cluster",
	"docker",
	"config",
	"helm",
	"files",
	"log"
];
var LAYOUT_KEY = "kubedojo:layout";
var LAYOUT_DEFAULT = {
	side: 310,
	viz: 0
};
var loadLayout = () => {
	try {
		return {
			...LAYOUT_DEFAULT,
			...JSON.parse(localStorage.getItem(LAYOUT_KEY) || "{}")
		};
	} catch (e) {
		return { ...LAYOUT_DEFAULT };
	}
};
var Store = class {
	constructor() {
		_defineProperty(this, "layout", loadLayout());
		_defineProperty(this, "paletteOpen", false);
		_defineProperty(this, "mobilePane", "term");
		_defineProperty(this, "version", 0);
		_defineProperty(this, "listeners", /* @__PURE__ */ new Set());
		_defineProperty(this, "sim", null);
		_defineProperty(this, "terms", []);
		_defineProperty(this, "active", null);
		_defineProperty(this, "termSeq", 0);
		_defineProperty(this, "vizTab", "cluster");
		_defineProperty(this, "selCluster", null);
		_defineProperty(this, "inspect", null);
		_defineProperty(this, "showSystem", false);
		_defineProperty(this, "hiddenNs", /* @__PURE__ */ new Set());
		_defineProperty(this, "hoverSvc", null);
		_defineProperty(this, "openFile", null);
		_defineProperty(this, "noside", false);
		_defineProperty(this, "speed", 2);
		_defineProperty(this, "tourIndex", -1);
		_defineProperty(this, "exportOpen", false);
		_defineProperty(this, "renderHeld", false);
		_defineProperty(this, "fsStatus", "unknown");
		_defineProperty(this, "fsBytes", 0);
		_defineProperty(this, "saveT", null);
		_defineProperty(this, "seen", {});
		_defineProperty(this, "_animV", -1);
		_defineProperty(this, "_anim", {});
		_defineProperty(this, "stateT", null);
		_defineProperty(this, "ephemeral", false);
		_defineProperty(this, "restored", false);
		_defineProperty(this, "subscribe", (l) => {
			this.listeners.add(l);
			return () => this.listeners.delete(l);
		});
		_defineProperty(this, "getSnapshot", () => this.version);
		_defineProperty(this, "saveFsNow", () => {
			if (!this.sim) return;
			try {
				const j = JSON.stringify(this.sim.fs.snapshot());
				this.fsBytes = j.length;
				if (j.length > 45e5) {
					this.fsStatus = "toobig";
					return;
				}
				localStorage.setItem(FS_KEY, j);
				this.fsStatus = "ok";
			} catch (e) {
				this.fsStatus = "unavailable";
			}
		});
		_defineProperty(this, "saveStateNow", () => {
			if (!this.sim || this.ephemeral) return;
			lsSet(STATE_KEY, this.sim.snapshotState());
		});
	}
	bump() {
		this.version++;
		for (const l of [...this.listeners]) l();
	}
	scheduleSave() {
		clearTimeout(this.saveT);
		this.saveT = setTimeout(() => {
			this.saveFsNow();
			if (this.vizTab === "files") this.bump();
		}, 300);
	}
	scheduleState() {
		if (this.stateT || this.ephemeral) return;
		this.stateT = setTimeout(() => {
			this.stateT = null;
			this.saveStateNow();
		}, 1500);
	}
	saveTerm(t) {
		if (this.ephemeral) return;
		lsSet(TERM_PREFIX + t.id, {
			v: TERM_V,
			label: t.label,
			hist: t.hist.slice(-200),
			lines: t.lines.slice(-500)
		});
	}
	forgetTerm(t) {
		lsDel(TERM_PREFIX + t.id);
	}
	forgetSession() {
		clearTimeout(this.stateT);
		this.stateT = null;
		lsDel(STATE_KEY);
		for (const k of savedTermKeys()) lsDel(k);
	}
	boot(fresh = false) {
		for (const t of this.terms) t.dispose();
		this.fsStatus = storageWorks() ? "ok" : "unavailable";
		this.ephemeral = !fresh && typeof location !== "undefined" && new URLSearchParams(location.search).has("run");
		const sim = this.sim = new PG.Sim(loadFs());
		sim.fs.onChange = () => this.scheduleSave();
		sim.speed = this.speed;
		this.restored = !fresh && !this.ephemeral && sim.restoreState(lsGet("kd.dojo.state.v1"));
		sim.start(250, .25);
		sim.onChange(() => {
			this.scheduleState();
			this.bump();
		});
		PG.resetHook = async () => {
			this.reset();
		};
		PG.startTour = (at) => this.startTour(at);
		PG.openExport = () => {
			this.exportOpen = true;
			this.bump();
		};
		this.terms = [];
		this.active = null;
		this.selCluster = null;
		this.inspect = null;
		this.hiddenNs = /* @__PURE__ */ new Set();
		this.seen = {};
		this.openFile = null;
		this.termSeq = 0;
		const saved = fresh || this.ephemeral ? [] : savedTermKeys().map((k) => [Number(k.slice(16)), lsGet(k)]).filter(([id, d]) => id > 0 && d && d.v === TERM_V);
		for (const [id, d] of saved.slice(0, 4)) {
			const t = new TermModel(this, id, d.label || "Terminal " + id);
			t.lines = d.lines || [];
			t.seq = t.lines.reduce((m, l) => Math.max(m, l.id || 0), 0);
			t.hist = d.hist || [];
			t.hi = t.hist.length;
			t.print("— restored from your last visit · Reset (↻) starts over —", "dim");
			this.terms.push(t);
			this.termSeq = Math.max(this.termSeq, id);
		}
		if (this.terms.length) this.showTerm(this.terms[0]);
		else this.addTerm();
		if (this.ephemeral) this.active.print("— this example runs in a fresh world and is not saved: your own session comes back next time you open the playground —", "dim");
		this.bump();
	}
	reset() {
		this.sim.stop();
		this.forgetSession();
		this.boot(true);
	}
	mount() {
		if (!this.sim) this.boot();
		else this.sim.start(250, .25);
	}
	unmount() {
		if (this.sim) this.sim.stop();
		this.saveFsNow();
		clearTimeout(this.stateT);
		this.stateT = null;
		this.saveStateNow();
		for (const t of this.terms) this.saveTerm(t);
	}
	addTerm() {
		if (this.terms.length >= 4) return null;
		const t = new TermModel(this, ++this.termSeq, "Terminal " + (this.terms.length + 1));
		this.terms.push(t);
		this.showTerm(t);
		return t;
	}
	showTerm(t) {
		this.active = t;
		this.bump();
		setTimeout(() => t.focus(), 0);
	}
	closeTerm(t) {
		if (this.terms.length === 1) return;
		t.dispose();
		this.forgetTerm(t);
		this.terms = this.terms.filter((x) => x !== t);
		this.showTerm(this.terms[this.terms.length - 1]);
	}
	async runInTerm(text, run) {
		const t = this.active;
		if (!t) return;
		if (t.running) {
			t.print("(a command is still running in this tab — press Ctrl-C, or use another tab)", "dim");
			return;
		}
		if (run || text.includes("\n")) await t.runText(text);
		else {
			t.setValue(text);
			t.focus();
		}
	}
	setLayout(patch, persist = true) {
		this.layout = {
			...this.layout,
			...patch
		};
		if (persist) try {
			localStorage.setItem(LAYOUT_KEY, JSON.stringify(this.layout));
		} catch (e) {}
		this.bump();
	}
	resetLayout() {
		this.layout = { ...LAYOUT_DEFAULT };
		try {
			localStorage.removeItem(LAYOUT_KEY);
		} catch (e) {}
		this.bump();
	}
	openPalette() {
		this.paletteOpen = true;
		this.bump();
	}
	closePalette() {
		this.paletteOpen = false;
		this.bump();
		setTimeout(() => this.active && this.active.focus(), 0);
	}
	setPane(p) {
		this.mobilePane = p;
		this.bump();
		if (p === "term") setTimeout(() => this.active && this.active.focus(), 0);
	}
	setViz(tab) {
		if (!VIZ_TABS.includes(tab)) return;
		if (tab !== this.vizTab) window.getSelection()?.removeAllRanges();
		this.vizTab = tab;
		this.bump();
	}
	toggleSide() {
		this.noside = !this.noside;
		this.bump();
	}
	setSpeed(v) {
		this.speed = v;
		if (this.sim) this.sim.speed = v;
		this.bump();
	}
	clusterList() {
		return Object.values(this.sim.clusters);
	}
	viewCluster() {
		const cur = this.sim.currentCluster();
		const all = this.clusterList();
		if (this.selCluster && this.sim.clusters[this.selCluster]) return this.sim.clusters[this.selCluster];
		return cur || all[0] || null;
	}
	podAnim(uid, st) {
		if (this._animV !== this.version) {
			this._animV = this.version;
			this._anim = {};
		}
		if (uid in this._anim) return this._anim[uid];
		const prev = this.seen[uid];
		this.seen[uid] = st;
		return this._anim[uid] = prev === void 0 ? "pop" : prev !== st ? "flash" : "";
	}
	inspectItem(k, ns, n) {
		const cl = this.viewCluster();
		this.inspect = {
			cl: cl.entry,
			k,
			ns,
			n,
			mode: "describe"
		};
		this.bump();
	}
	startTour(at) {
		this.tourIndex = Math.max(0, at || 0);
		this.bump();
	}
	endTour(markSeen = true) {
		this.tourIndex = -1;
		if (markSeen) try {
			localStorage.setItem(TOUR_KEY, "1");
		} catch (e) {}
		this.bump();
		setTimeout(() => this.active && this.active.focus(), 0);
	}
	tourSeen() {
		try {
			return !!localStorage.getItem(TOUR_KEY);
		} catch (e) {
			return false;
		}
	}
	async applyParams(p) {
		if (this._applied) return;
		this._applied = true;
		const run = p.get("run");
		const tab = p.get("tab");
		const tour = p.get("tour");
		if (tab && VIZ_TABS.includes(tab)) {
			this.vizTab = tab;
			this.bump();
		}
		if (run) try {
			for (const c of JSON.parse(run)) {
				if (typeof c === "number") {
					await this.sim.wait(c, { aborted: false });
					continue;
				}
				await this.active.runText(c);
			}
		} catch (e) {
			console.error(e);
		}
		if (tour != null && tour !== "") setTimeout(() => this.startTour(Number(tour)), 200);
		else if (!run && !p.has("notour") && !this.tourSeen()) setTimeout(() => this.startTour(0), 600);
	}
};
var store = new Store();
var useStore = () => useSyncExternalStore(store.subscribe, store.getSnapshot);
var useStoreSel = (fn) => useSyncExternalStore(store.subscribe, () => fn(store));
//#endregion
//#region src/playground/Icon.jsx
var P = {
	sidebar: "M3 4h18v16H3zM9 4v16",
	search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
	play: "M7 4.5l12 7.5-12 7.5z",
	download: "M12 3v12M7 10l5 5 5-5M4 20h16",
	help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.5 9.2a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1.9-1.1 1.8M12 17h.01",
	reset: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
	terminal: "M3 5h18v14H3zM7 10l3 2-3 2M12 15h5",
	cluster: "M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10",
	book: "M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h12",
	plus: "M12 5v14M5 12h14",
	x: "M6 6l12 12M18 6L6 18",
	home: "M3 11.5 12 4l9 7.5M5.5 10v10h13V10",
	file: "M7 3h7l5 5v13H7zM14 3v5h5",
	clear: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
	check: "M5 12.5l4.5 4.5L19 7.5",
	chevron: "M9 6l6 6-6 6"
};
function Icon({ name, size = 18 }) {
	return /* @__PURE__ */ jsx("svg", {
		className: "ico",
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": "true",
		focusable: "false",
		children: /* @__PURE__ */ jsx("path", { d: P[name] })
	});
}
function tabKeys(e) {
	if (![
		"ArrowLeft",
		"ArrowRight",
		"Home",
		"End"
	].includes(e.key)) return;
	const tabs = [...e.currentTarget.querySelectorAll("[role=tab]")];
	const i = tabs.indexOf(document.activeElement);
	if (i < 0) return;
	e.preventDefault();
	const n = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
	tabs[n].focus();
	tabs[n].click();
}
//#endregion
//#region src/playground/TerminalPane.jsx
var TermView = memo(function TermView({ model, active }) {
	useSyncExternalStore(model.subscribe, model.getSnapshot);
	const elRef = useRef(null), outRef = useRef(null), inputRef = useRef(null), stick = useRef(true);
	const [atEnd, setAtEnd] = useState(true);
	const syncCaret = (el) => setAtEnd(el.selectionStart === el.value.length && el.selectionEnd === el.value.length);
	useLayoutEffect(() => {
		model.inputEl = inputRef.current;
		model.getCols = () => {
			const out = outRef.current;
			const pr = document.createElement("span");
			pr.style.cssText = "position:absolute;visibility:hidden;white-space:pre";
			pr.textContent = "M".repeat(20);
			out.appendChild(pr);
			const cw = pr.getBoundingClientRect().width / 20 || 7.6;
			pr.remove();
			return Math.max(30, Math.floor(out.clientWidth / cw) - 1);
		};
		return () => {
			model.inputEl = null;
			model.getCols = null;
		};
	}, [model]);
	useLayoutEffect(() => {
		const el = elRef.current;
		if (model.forceScroll || stick.current) el.scrollTop = el.scrollHeight;
		model.forceScroll = false;
	});
	const v = model.value;
	const sg = !model.running && atEnd && v ? suggestFor(v) : "";
	return /* @__PURE__ */ jsxs("div", {
		className: "term",
		ref: elRef,
		style: { display: active ? "block" : "none" },
		onScroll: (e) => {
			const el = e.currentTarget;
			stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
		},
		onMouseUp: (e) => {
			if (!selText() && e.target !== inputRef.current) inputRef.current.focus();
		},
		children: [/* @__PURE__ */ jsx("div", {
			className: "tout",
			ref: outRef,
			children: model.lines.map((l) => l.cmd ? /* @__PURE__ */ jsxs("div", {
				className: "ln",
				children: [/* @__PURE__ */ jsx("span", {
					className: "prompt",
					children: l.prompt
				}), /* @__PURE__ */ jsx("span", {
					className: "cmdtxt",
					children: l.text
				})]
			}, l.id) : /* @__PURE__ */ jsx("div", {
				className: "ln" + (l.cls ? " " + l.cls : ""),
				style: l.pre ? { whiteSpace: "pre" } : void 0,
				children: l.text
			}, l.id))
		}), /* @__PURE__ */ jsxs("div", {
			className: "tline" + (model.running ? " busy" : ""),
			children: [/* @__PURE__ */ jsx("span", {
				className: "prompt",
				children: model.prompt()
			}), /* @__PURE__ */ jsxs("span", {
				className: "inw",
				children: [/* @__PURE__ */ jsx("div", {
					className: "ghost",
					children: sg && sg.length < 200 ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("i", { children: v }), sg.slice(v.length)] }) : null
				}), /* @__PURE__ */ jsx("input", {
					className: "tin",
					"aria-label": "Terminal input",
					ref: inputRef,
					value: v,
					spellCheck: false,
					autoCapitalize: "off",
					autoComplete: "off",
					onChange: (e) => {
						model.setValue(e.target.value);
						syncCaret(e.target);
					},
					onKeyDown: (e) => model.key(e),
					onKeyUp: (e) => syncCaret(e.currentTarget),
					onClick: (e) => syncCaret(e.currentTarget),
					onFocus: (e) => syncCaret(e.currentTarget),
					onSelect: (e) => syncCaret(e.currentTarget),
					onPaste: (e) => {
						const t = (e.clipboardData || window.clipboardData).getData("text");
						if (t.includes("\n")) {
							e.preventDefault();
							model.pasteLines(t);
						}
					}
				})]
			})]
		})]
	});
});
var VI_MAP = {
	ArrowLeft: "Left",
	ArrowRight: "Right",
	ArrowUp: "Up",
	ArrowDown: "Down"
};
function ViOverlay({ model, active }) {
	const { vi } = model.vi;
	const ref = useRef(null), probe = useRef(null);
	const [, redraw] = useReducer((x) => x + 1, 0);
	const measure = () => {
		const ov = ref.current;
		if (!ov) return;
		const cw = probe.current.getBoundingClientRect().width / 10 || 7.5;
		vi.cols = Math.max(20, Math.floor((ov.clientWidth - 20) / cw));
		vi.rows = Math.max(5, Math.floor((ov.clientHeight - 12) / 18) - 1);
		vi.scroll();
	};
	useLayoutEffect(() => {
		model.viEl = ref.current;
		const onResize = () => {
			measure();
			redraw();
		};
		window.addEventListener("resize", onResize);
		ref.current.focus();
		measure();
		redraw();
		const raf = requestAnimationFrame(onResize);
		return () => {
			window.removeEventListener("resize", onResize);
			cancelAnimationFrame(raf);
			model.viEl = null;
		};
	}, []);
	measure();
	const sc = vi.screen();
	const onKeyDown = (e) => {
		if (e.metaKey || e.altKey || e.ctrlKey && e.shiftKey) return;
		let k = null;
		if (e.ctrlKey && selText() && e.key.toLowerCase() === "c") return;
		if (e.ctrlKey) {
			const c = e.key.toLowerCase();
			if ("rfbdu".includes(c) && c.length === 1) k = "C-" + c;
			else if (c === "c" || c === "[") k = c === "c" ? "C-c" : "Escape";
			else return;
		} else if (e.key.length === 1) k = e.key;
		else if ([
			"Escape",
			"Enter",
			"Backspace",
			"Delete",
			"Tab",
			"Home",
			"End",
			"PageUp",
			"PageDown"
		].includes(e.key)) k = e.key;
		else if (VI_MAP[e.key]) k = VI_MAP[e.key];
		else return;
		e.preventDefault();
		e.stopPropagation();
		vi.key(k);
		if (vi.done) model.finishVi();
		else redraw();
	};
	const onPaste = (e) => {
		e.preventDefault();
		if (vi.mode === "n") return;
		for (const ch of (e.clipboardData.getData("text") || "").replace(/\r/g, "")) vi.key(ch === "\n" ? "Enter" : ch === "	" ? "Tab" : ch);
		redraw();
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "vi",
		tabIndex: 0,
		ref,
		style: { display: active ? "block" : "none" },
		onKeyDown,
		onPaste,
		onMouseUp: () => {
			if (!selText()) ref.current.focus();
		},
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "vi-t",
				style: { height: vi.rows * 18 },
				children: sc.rows.map((r, i) => {
					if (sc.mode === "c" || i !== sc.cursor.row) return /* @__PURE__ */ jsx("div", {
						className: r === "~" ? "vi-tl" : void 0,
						children: r || " "
					}, i);
					const c = Math.min(sc.cursor.col, r.length);
					const ch = r[c] || " ";
					return /* @__PURE__ */ jsxs("div", { children: [
						r.slice(0, c),
						/* @__PURE__ */ jsx("span", {
							className: "vi-cur",
							children: ch
						}),
						r.slice(c + 1)
					] }, i);
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "vi-s",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "vi-m",
					children: [sc.bottom, sc.mode === "c" ? /* @__PURE__ */ jsx("span", {
						className: "vi-cur",
						children: " "
					}) : null]
				}), /* @__PURE__ */ jsx("span", {
					className: "vi-r",
					children: sc.ruler
				})]
			}),
			/* @__PURE__ */ jsx("span", {
				className: "vi-probe",
				ref: probe,
				children: "MMMMMMMMMM"
			})
		]
	});
}
function EditBar() {
	const pe = store.sim && store.sim.pendingEdit;
	return /* @__PURE__ */ jsx("div", {
		id: "editbar",
		hidden: !pe,
		children: pe && /* @__PURE__ */ jsxs(Fragment$1, { children: [
			"✏️ ",
			/* @__PURE__ */ jsxs("b", { children: ["kubectl edit ", pe.title] }),
			" — the YAML is in ",
			/* @__PURE__ */ jsx("code", { children: pe.path }),
			" \xA0",
			" ",
			/* @__PURE__ */ jsx("button", {
				id: "ed-open",
				onClick: () => {
					store.vizTab = "files";
					store.openFile = pe.path;
					store.bump();
				},
				children: "Open in Files tab"
			}),
			" ",
			/* @__PURE__ */ jsx("button", {
				id: "ed-apply",
				className: "go",
				onClick: () => {
					pe.result = "apply";
					store.sim.wake();
				},
				children: "Apply"
			}),
			" ",
			/* @__PURE__ */ jsx("button", {
				id: "ed-cancel",
				onClick: () => {
					pe.result = "cancel";
					store.sim.wake();
				},
				children: "Cancel"
			})
		] })
	});
}
function TerminalPane({ compact = false }) {
	useStore();
	const { terms, active } = store;
	return /* @__PURE__ */ jsxs("section", {
		id: "termpane",
		children: [
			/* @__PURE__ */ jsx(EditBar, {}),
			/* @__PURE__ */ jsxs("div", {
				id: "tabs",
				role: "tablist",
				"aria-label": "Terminals",
				hidden: compact,
				onKeyDown: tabKeys,
				children: [terms.map((t) => /* @__PURE__ */ jsxs("button", {
					role: "tab",
					"aria-selected": t === active,
					tabIndex: t === active ? 0 : -1,
					className: "tab" + (t === active ? " on" : ""),
					onClick: (e) => {
						if (e.target.classList.contains("x")) store.closeTerm(t);
						else store.showTerm(t);
					},
					children: [t.label, t.label !== "Terminal 1" && /* @__PURE__ */ jsxs(Fragment$1, { children: [" ", /* @__PURE__ */ jsx("span", {
						className: "x",
						title: "close",
						children: "×"
					})] })]
				}, t.uid)), /* @__PURE__ */ jsx("button", {
					id: "newtab",
					title: "New terminal tab (up to 4)",
					"aria-label": "New terminal tab",
					onClick: () => store.addTerm(),
					children: /* @__PURE__ */ jsx(Icon, {
						name: "plus",
						size: 16
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				id: "termhost",
				children: [terms.map((t) => /* @__PURE__ */ jsx(TermView, {
					model: t,
					active: t === active
				}, t.uid)), terms.map((t) => t.vi && /* @__PURE__ */ jsx(ViOverlay, {
					model: t,
					active: t === active
				}, "vi" + t.uid + ":" + t.vi.seq))]
			})
		]
	});
}
//#endregion
//#region src/playground/viz/kinds.jsx
var KINDS = {
	Node: {
		icon: "M4 5h16v6H4zM4 13h16v6H4zM8 8h.01M8 16h.01",
		tone: "compute"
	},
	Pod: {
		icon: "M12 3 4 7.5v9L12 21l8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9",
		tone: "compute"
	},
	Deployment: {
		icon: "M12 3 3 8l9 5 9-5zM3 12.5l9 5 9-5M3 17l9 5 9-5",
		tone: "compute"
	},
	ReplicaSet: {
		icon: "M8 8h12v12H8zM4 16V4h12",
		tone: "compute"
	},
	DaemonSet: {
		icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
		tone: "compute"
	},
	StatefulSet: {
		icon: "M5 4h14v5H5zM5 11h14v5H5zM8 19h8",
		tone: "compute"
	},
	Job: {
		icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12.5l3 3 5-6",
		tone: "compute"
	},
	CronJob: {
		icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3.5 2",
		tone: "compute"
	},
	Service: {
		icon: "M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM12 3v4M12 17v4M3 12h4M17 12h4",
		tone: "network"
	},
	Ingress: {
		icon: "M3 12h13M12 7l5 5-5 5M21 4v16",
		tone: "network"
	},
	ConfigMap: {
		icon: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
		tone: "config"
	},
	Secret: {
		icon: "M15 7.5a4 4 0 1 1-3.3 6.2L4 21v-3h3v-3h3l1.6-1.6A4 4 0 0 1 15 7.5z",
		tone: "config"
	},
	PersistentVolumeClaim: {
		icon: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
		tone: "config"
	},
	ServiceAccount: {
		icon: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6",
		tone: "config"
	},
	Namespace: {
		icon: "M4 7h6l2 2h8v10H4z",
		tone: "neutral"
	},
	HorizontalPodAutoscaler: {
		icon: "M4 16l5-5 4 4 7-8M15 7h5v5",
		tone: "compute"
	},
	PodDisruptionBudget: {
		icon: "M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z",
		tone: "compute"
	},
	Container: {
		icon: "M3 8l9-5 9 5v8l-9 5-9-5zM12 3v18M3 8l9 5 9-5",
		tone: "compute"
	},
	Image: {
		icon: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M9 9.5h.01",
		tone: "config"
	},
	Network: {
		icon: "M12 5a2 2 0 1 0 0 .01M5 19a2 2 0 1 0 0 .01M19 19a2 2 0 1 0 0 .01M12 7v5M12 12l-6 5M12 12l6 5",
		tone: "network"
	},
	Registry: {
		icon: "M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01",
		tone: "config"
	},
	Context: {
		icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z",
		tone: "neutral"
	},
	Release: {
		icon: "M12 3l2.4 5 5.6.8-4 3.9.9 5.6-4.9-2.6L7.1 18l.9-5.6-4-3.9 5.6-.8z",
		tone: "compute"
	},
	Tiller: {
		icon: "M12 3v4M5.6 5.6l2.8 2.8M3 12h4M5.6 18.4l2.8-2.8M12 17v4M15.6 15.6l2.8 2.8M17 12h4M15.6 8.4l2.8-2.8M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
		tone: "compute"
	},
	File: {
		icon: "M7 3h7l5 5v13H7zM14 3v5h5",
		tone: "neutral"
	},
	Folder: {
		icon: "M4 7h6l2 2h8v10H4z",
		tone: "neutral"
	},
	Event: {
		icon: "M6 4h12v16l-6-3-6 3z",
		tone: "neutral"
	}
};
function KindIcon({ kind, size = 14 }) {
	const k = KINDS[kind] || KINDS.Pod;
	return /* @__PURE__ */ jsx("svg", {
		className: "kico",
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": "true",
		focusable: "false",
		children: /* @__PURE__ */ jsx("path", { d: k.icon })
	});
}
function KindTag({ kind, label, size = 13 }) {
	const k = KINDS[kind] || KINDS.Pod;
	return /* @__PURE__ */ jsxs("span", {
		className: "ktag t-" + k.tone,
		title: kind,
		children: [/* @__PURE__ */ jsx(KindIcon, {
			kind,
			size
		}), /* @__PURE__ */ jsx("span", { children: label || kind })]
	});
}
//#endregion
//#region src/playground/viz/ui.jsx
function VSection({ kind, title, count, hint, children, id }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "vsec",
		id,
		children: [/* @__PURE__ */ jsxs("header", {
			className: "vsec-h",
			children: [
				/* @__PURE__ */ jsx(KindIcon, {
					kind,
					size: 15
				}),
				/* @__PURE__ */ jsx("h4", { children: title }),
				count !== void 0 && /* @__PURE__ */ jsx("span", {
					className: "vsec-n",
					children: count
				}, count),
				hint && /* @__PURE__ */ jsx("span", {
					className: "vsec-hint",
					children: hint
				})
			]
		}), children]
	});
}
var Led = ({ tone = "ok", pulse = false }) => /* @__PURE__ */ jsx("i", {
	className: "led " + tone + (pulse ? " pulse" : ""),
	"aria-hidden": "true"
});
var Meter = ({ value, max, tone = "ok", label }) => /* @__PURE__ */ jsx("span", {
	className: "meter",
	role: "img",
	"aria-label": label,
	children: /* @__PURE__ */ jsx("i", {
		className: "fill " + tone,
		style: { width: Math.max(0, Math.min(100, value / (max || 1) * 100)) + "%" }
	})
});
//#endregion
//#region src/playground/viz/hooks.js
function useGhosts(items, keyOf, ms = 420) {
	const known = useRef(null);
	const prev = useRef(/* @__PURE__ */ new Map());
	const ghosts = useRef(/* @__PURE__ */ new Map());
	const born = useRef(/* @__PURE__ */ new Map());
	const [, bump] = useState(0);
	const cur = new Map(items.map((it) => [keyOf(it), it]));
	const gone = new Map(ghosts.current);
	for (const [k, it] of prev.current) if (!cur.has(k) && !gone.has(k)) gone.set(k, it);
	for (const k of cur.keys()) gone.delete(k);
	const firstRender = known.current === null;
	const out = items.map((it) => {
		const k = keyOf(it);
		return {
			item: it,
			key: k,
			leaving: false,
			fresh: !firstRender && (!known.current.has(k) || Date.now() - (born.current.get(k) || 0) < 700)
		};
	});
	for (const [k, it] of gone) out.push({
		item: it,
		key: k,
		leaving: true,
		fresh: false
	});
	useEffect(() => {
		if (!known.current) known.current = /* @__PURE__ */ new Set();
		for (const k of cur.keys()) {
			if (!known.current.has(k) && !firstRender) born.current.set(k, Date.now());
			known.current.add(k);
			ghosts.current.delete(k);
		}
		for (const [k, it] of gone) if (!ghosts.current.has(k)) {
			ghosts.current.set(k, it);
			setTimeout(() => {
				ghosts.current.delete(k);
				bump((n) => n + 1);
			}, ms);
		}
		prev.current = cur;
	});
	return out;
}
function useFlash(value, ms = 900) {
	const [on, setOn] = useState(false);
	const last = useRef(value);
	const first = useRef(true);
	useEffect(() => {
		if (first.current) {
			first.current = false;
			return;
		}
		if (last.current !== value) {
			last.current = value;
			setOn(true);
			const t = setTimeout(() => setOn(false), ms);
			return () => clearTimeout(t);
		}
	}, [value, ms]);
	return on;
}
//#endregion
//#region src/playground/views/ClusterView.jsx
var statusClass = (st) => ({
	Running: "ok",
	Completed: "done",
	Pending: "warn",
	ContainerCreating: "warn",
	Terminating: "dying",
	Unknown: "bad"
})[st] || (/Err|Crash|Error|BackOff|OOM/.test(st) ? "bad" : "warn");
var shortPod = (p) => {
	const o = p.metadata._owner;
	if (o && o.kind === "ReplicaSet") return o.name.replace(/-[a-z0-9]{6,10}$/, "") + "·" + p.metadata.name.slice(-5);
	if (o && o.kind === "DaemonSet") return o.name + "·" + p.metadata.name.slice(-5);
	if (o && o.kind === "Job") return o.name.slice(-14) + "·" + p.metadata.name.slice(-4);
	return p.metadata.name.length > 22 ? p.metadata.name.slice(0, 20) + "…" : p.metadata.name;
};
var ownerOf = (p) => {
	const o = p.metadata._owner;
	const ns = p.metadata.namespace;
	if (!o) return {
		kind: "Pod",
		name: "bare pods",
		ns,
		key: "Pod/" + ns
	};
	if (o.kind === "ReplicaSet") {
		const n = o.name.replace(/-[a-z0-9]{6,10}$/, "");
		return {
			kind: "Deployment",
			name: n,
			ns,
			key: "Deployment/" + ns + "/" + n
		};
	}
	return {
		kind: o.kind,
		name: o.name,
		ns,
		key: o.kind + "/" + ns + "/" + o.name
	};
};
var inspectOnClick = (k, ns, n) => (e) => {
	if (selText()) return;
	e.stopPropagation();
	store.inspectItem(k, ns, n);
};
var setHover = (nv) => {
	const h = store.hoverSvc;
	if (nv && !h || !nv && h || nv && h && nv.ns + JSON.stringify(nv.sel) !== h.ns + JSON.stringify(h.sel)) {
		store.hoverSvc = nv;
		store.bump();
	}
};
function PodTile({ cl, p, leaving, fresh }) {
	const sim = store.sim;
	const st = cl.podStatus(p);
	const ns = p.metadata.namespace;
	const flash = useFlash(st) || store.podAnim(p.metadata.uid, st) === "flash";
	const h = store.hoverSvc;
	const hl = h && h.sel && PG.selMatch(h.sel, p.metadata.labels) && h.ns === ns ? " hl" : "";
	const tr = sim.lastTrace && sim.clock - sim.lastTrace.t < 6 && sim.lastTrace.steps.some((s) => s.kind === "pod" && s.name === p.metadata.name) ? " traffic" : "";
	const title = ns + "/" + p.metadata.name + "\n" + st + (p._sim.restarts ? " (restarts: " + p._sim.restarts + ")" : "") + (p.status.podIP ? "\n" + p.status.podIP : "") + "\nimage: " + p.spec.containers[0].image;
	return /* @__PURE__ */ jsxs("div", {
		className: `pod ${statusClass(st)}${fresh ? " enter" : ""}${leaving ? " leaving" : ""}${flash ? " flash" : ""}${hl}${tr}`,
		style: { borderLeftColor: nsColor(ns) },
		title,
		onClick: leaving ? void 0 : inspectOnClick("pods", ns, p.metadata.name),
		children: [/* @__PURE__ */ jsx("span", {
			className: "pico",
			children: /* @__PURE__ */ jsx(KindIcon, {
				kind: "Pod",
				size: 15
			})
		}), /* @__PURE__ */ jsxs("span", {
			className: "ptxt",
			children: [/* @__PURE__ */ jsx("b", { children: shortPod(p) }), /* @__PURE__ */ jsx("i", { children: st })]
		})]
	});
}
function PodGroups({ cl, pods, empty }) {
	const rows = useGhosts(pods, (p) => p.metadata.uid, 440);
	const groups = /* @__PURE__ */ new Map();
	for (const r of rows) {
		const o = ownerOf(r.item);
		if (!groups.has(o.key)) groups.set(o.key, {
			o,
			rows: []
		});
		groups.get(o.key).rows.push(r);
	}
	if (!groups.size) return /* @__PURE__ */ jsx("div", {
		className: "pods-empty",
		children: empty
	});
	return /* @__PURE__ */ jsx(Fragment$1, { children: [...groups.values()].map(({ o, rows: rs }) => /* @__PURE__ */ jsxs("div", {
		className: "grp",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "grp-h",
			children: [
				/* @__PURE__ */ jsx(KindTag, { kind: o.kind }),
				/* @__PURE__ */ jsx("b", { children: o.name }),
				/* @__PURE__ */ jsx("span", {
					className: "nspill",
					style: { "--c": nsColor(o.ns) },
					children: o.ns
				}),
				/* @__PURE__ */ jsx("span", {
					className: "grp-n",
					children: rs.filter((r) => !r.leaving).length
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "pods",
			children: rs.map((r) => /* @__PURE__ */ jsx(PodTile, {
				cl,
				p: r.item,
				leaving: r.leaving,
				fresh: r.fresh
			}, r.key))
		})]
	}, o.key)) });
}
function NodeCard({ cl, n, visible, fresh, leaving }) {
	const pods = cl.res.pods.filter((p) => p.spec.nodeName === n.name && visible(p.metadata.namespace));
	const total = cl.res.pods.filter((p) => p.spec.nodeName === n.name).length;
	const custom = Object.entries(n.labels).filter(([k]) => !/^(kubernetes\.io|node-role|beta\.|node\.kubernetes|cloud\.google|topology)/.test(k));
	const short = n.name.replace(cl.id + "-", "").replace("k3d-" + cl.id + "-", "").replace(/^gke-prod-1-default-pool-/, "");
	const ready = n.ready;
	return /* @__PURE__ */ jsxs("div", {
		className: "node " + (ready ? "" : "down") + (fresh ? " enter" : "") + (leaving ? " leaving" : ""),
		onClick: leaving ? void 0 : inspectOnClick("nodes", void 0, n.name),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "nh",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "nico",
						children: /* @__PURE__ */ jsx(KindIcon, {
							kind: "Node",
							size: 18
						})
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "nname",
						children: [/* @__PURE__ */ jsx("b", { children: short }), /* @__PURE__ */ jsx(KindTag, { kind: "Node" })]
					}),
					/* @__PURE__ */ jsx(Led, {
						tone: ready ? "ok" : "bad",
						pulse: ready
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "nsub",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "tag",
						children: n.role
					}),
					/* @__PURE__ */ jsx("span", {
						className: "dim ip",
						children: n.ip
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "dim cnt",
						children: [
							total,
							" pod",
							total === 1 ? "" : "s"
						]
					}),
					/* @__PURE__ */ jsx(Meter, {
						value: total,
						max: 110,
						tone: total > 88 ? "bad" : total > 60 ? "warn" : "ok",
						label: `${total} of 110 pods`
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "nmeta",
				children: [
					custom.map(([k, v]) => /* @__PURE__ */ jsxs("span", {
						className: "lab",
						children: [
							/* @__PURE__ */ jsx("em", { children: "label" }),
							k.split("/").pop(),
							"=",
							v
						]
					}, k)),
					n.taints.map((t, i) => /* @__PURE__ */ jsxs("span", {
						className: "taint",
						children: [
							/* @__PURE__ */ jsx("em", { children: "taint" }),
							t.key.split("/").pop(),
							t.value ? "=" + t.value : "",
							":",
							t.effect
						]
					}, i)),
					n.unschedulable ? /* @__PURE__ */ jsx("span", {
						className: "taint",
						children: "cordoned"
					}) : null,
					!ready ? /* @__PURE__ */ jsx("span", {
						className: "taint",
						children: "NotReady"
					}) : null,
					/* @__PURE__ */ jsxs("span", {
						className: "dim",
						children: [Object.keys(n.images).length, " images"]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "npods",
				children: /* @__PURE__ */ jsx(PodGroups, {
					cl,
					pods,
					empty: "no visible pods"
				})
			})
		]
	});
}
function HealthRing({ run, pend, fail, done }) {
	const total = run + pend + fail + done;
	const R = 30, C = 2 * Math.PI * R;
	const seg = (v, off) => ({
		strokeDasharray: `${total ? v / total * C : 0} ${C}`,
		strokeDashoffset: -off
	});
	const a = total ? run / total * C : 0, b = total ? (run + pend) / total * C : 0, c = total ? (run + pend + fail) / total * C : 0;
	return /* @__PURE__ */ jsxs("svg", {
		className: "ring",
		width: "76",
		height: "76",
		viewBox: "0 0 76 76",
		role: "img",
		"aria-label": `${run} running, ${pend} pending, ${fail} failing, ${done} done`,
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "38",
				cy: "38",
				r: R,
				className: "ring-bg"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "38",
				cy: "38",
				r: R,
				className: "ring-seg done",
				style: seg(done, c)
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "38",
				cy: "38",
				r: R,
				className: "ring-seg bad",
				style: seg(fail, b)
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "38",
				cy: "38",
				r: R,
				className: "ring-seg warn",
				style: seg(pend, a)
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "38",
				cy: "38",
				r: R,
				className: "ring-seg ok",
				style: seg(run, 0)
			}),
			/* @__PURE__ */ jsx("text", {
				x: "38",
				y: "43",
				className: "ring-n",
				children: total
			})
		]
	});
}
function Kpi({ label, value, sub, tone = "" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "kpi " + tone,
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "kpi-v",
				children: value
			}, value),
			/* @__PURE__ */ jsx("span", {
				className: "kpi-l",
				children: label
			}),
			sub && /* @__PURE__ */ jsx("span", {
				className: "kpi-s",
				children: sub
			})
		]
	});
}
function ClusterView() {
	const sim = store.sim;
	const cl = store.viewCluster();
	const nodeRows = useGhosts(cl ? cl.nodes : [], (n) => n.name, 500);
	const depRows = useGhosts(cl ? cl.res.deployments.filter((d) => !SYSTEM_NS.includes(d.metadata.namespace) || store.showSystem) : [], (d) => d.metadata.uid, 440);
	if (!cl) return /* @__PURE__ */ jsxs("div", {
		className: "empty empty-cluster",
		children: [
			/* @__PURE__ */ jsxs("svg", {
				className: "empty-art",
				viewBox: "0 0 120 80",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ jsx("rect", {
						x: "8",
						y: "14",
						width: "30",
						height: "52",
						rx: "3"
					}),
					/* @__PURE__ */ jsx("rect", {
						x: "45",
						y: "14",
						width: "30",
						height: "52",
						rx: "3"
					}),
					/* @__PURE__ */ jsx("rect", {
						x: "82",
						y: "14",
						width: "30",
						height: "52",
						rx: "3"
					}),
					/* @__PURE__ */ jsx("path", { d: "M16 26h14M53 26h14M90 26h14" })
				]
			}),
			/* @__PURE__ */ jsx("h3", { children: "No cluster yet" }),
			/* @__PURE__ */ jsx("p", { children: "Nodes, pods and Services show up here as soon as you create a cluster. Pick one, and watch it appear." }),
			/* @__PURE__ */ jsxs("div", {
				className: "empty-actions",
				children: [
					/* @__PURE__ */ jsx("button", {
						className: "go",
						onClick: () => {
							store.setPane("term");
							store.runInTerm("kind create cluster --name local-cluster-1", true);
						},
						children: "Create a kind cluster"
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => {
							store.setPane("term");
							store.runInTerm("k3d cluster create local-cluster-1 --agents 2", true);
						},
						children: "Create a k3d cluster"
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => store.startTour(0),
						children: "Take the tour"
					})
				]
			}),
			/* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("code", { children: "kind create cluster --name local-cluster-1" }) })
		]
	});
	const { showSystem, hiddenNs } = store;
	const cur = sim.currentCluster();
	const isCur = cur === cl;
	const allNs = cl.res.namespaces.map((n) => n.metadata.name);
	const visible = (n) => (showSystem || !SYSTEM_NS.includes(n)) && !hiddenNs.has(n);
	let run = 0, pend = 0, fail = 0, done = 0;
	for (const p of cl.res.pods) {
		if (!visible(p.metadata.namespace) || p.metadata.deletionTimestamp) continue;
		const st = cl.podStatus(p);
		if (st === "Running") run++;
		else if (st === "Completed") done++;
		else if (/Err|Crash|Error|BackOff|OOM|Unknown/.test(st)) fail++;
		else pend++;
	}
	const up = cl.nodes.filter((n) => n.ready).length;
	const routes = [];
	for (const c of sim.containers) if (c.status === "running") {
		for (const p of c.ports) if (c.kind !== "node" || p.container !== 6443) routes.push(/* @__PURE__ */ jsxs("span", {
			className: "route",
			children: [
				"127.0.0.1:",
				p.host,
				" → ",
				/* @__PURE__ */ jsx("b", { children: c.name.length > 26 ? "…" + c.name.slice(-24) : c.name }),
				":",
				p.container
			]
		}, c.name + p.host));
	}
	sim.forwards.forEach((f, i) => {
		if (f.active) routes.push(/* @__PURE__ */ jsxs("span", {
			className: "route fw",
			children: [
				":",
				f.local,
				" ⇢ ",
				/* @__PURE__ */ jsx("b", { children: f.target }),
				":",
				f.remote,
				" ",
				/* @__PURE__ */ jsx("i", { children: "(port-forward)" })
			]
		}, "fw" + i));
	});
	const orphans = cl.res.pods.filter((p) => !p.spec.nodeName && visible(p.metadata.namespace));
	const dss = cl.res.daemonsets.filter((d) => visible(d.metadata.namespace));
	const cjs = cl.res.cronjobs.filter((d) => visible(d.metadata.namespace));
	const jobs = cl.res.jobs.filter((d) => visible(d.metadata.namespace) && !d.metadata._owner);
	const svcs = cl.res.services.filter((s) => visible(s.metadata.namespace) && !(s.metadata.namespace === "default" && s.metadata.name === "kubernetes"));
	const ings = cl.res.ingresses.filter((i) => visible(i.metadata.namespace));
	const cms = cl.res.configmaps.filter((x) => visible(x.metadata.namespace) && x.metadata.name !== "kube-root-ca.crt");
	const secs = cl.res.secrets.filter((x) => visible(x.metadata.namespace) && !/service-account-token/.test(x.type || ""));
	const pvcs = cl.res.persistentvolumeclaims.filter((x) => visible(x.metadata.namespace));
	const sas = cl.res.serviceaccounts.filter((x) => visible(x.metadata.namespace) && x.metadata.name !== "default");
	const tr = sim.lastTrace && sim.clock - sim.lastTrace.t < 60 ? sim.lastTrace : null;
	const deps = depRows.filter((r) => r.leaving || visible(r.item.metadata.namespace));
	return /* @__PURE__ */ jsxs("div", {
		className: "cv",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "cltabs",
				children: store.clusterList().map((c) => /* @__PURE__ */ jsxs("button", {
					className: "pill " + (c === cl ? "on" : ""),
					onClick: () => {
						if (selText()) return;
						store.selCluster = c.entry;
						store.bump();
					},
					children: [
						c.tool.toUpperCase(),
						" · ",
						c.id.length > 22 ? c.id.slice(0, 20) + "…" : c.id,
						c === cur ? " ★" : ""
					]
				}, c.entry))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "clhead " + (cl.tool === "gke" ? "prod" : ""),
				children: [/* @__PURE__ */ jsxs("div", {
					className: "clid",
					children: [/* @__PURE__ */ jsx("span", {
						className: "clico",
						children: /* @__PURE__ */ jsx(KindIcon, {
							kind: "Context",
							size: 22
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "clname",
						children: [
							/* @__PURE__ */ jsx("b", { children: cl.id }),
							/* @__PURE__ */ jsxs("div", {
								className: "cltags",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "tag",
										children: cl.tool
									}),
									/* @__PURE__ */ jsx("span", {
										className: "tag",
										children: cl.k8sVersion
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "tag",
										children: [
											"context: ",
											cl.entry,
											isCur ? " (current)" : ""
										]
									}),
									/* @__PURE__ */ jsx("button", {
										className: "cldel",
										title: "puts the delete command for this cluster on the terminal prompt (you press Enter)",
										onClick: () => {
											if (selText()) return;
											if (store.active) {
												store.active.setValue(PG.deleteCommandFor(cl));
												store.active.focus();
											}
										},
										children: "🗑 delete…"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "dim clapi",
								children: [
									"API ",
									cl.api,
									" ",
									cl.apiUp() ? /* @__PURE__ */ jsx("span", {
										className: "okc",
										children: "● reachable"
									}) : /* @__PURE__ */ jsx("span", {
										className: "badc",
										children: "● UNREACHABLE (control-plane container stopped)"
									})
								]
							})
						]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "kpis",
					children: [
						/* @__PURE__ */ jsx(HealthRing, {
							run,
							pend,
							fail,
							done
						}),
						/* @__PURE__ */ jsx(Kpi, {
							label: "nodes ready",
							value: `${up}/${cl.nodes.length}`,
							tone: up < cl.nodes.length ? "bad" : ""
						}),
						/* @__PURE__ */ jsx(Kpi, {
							label: "running",
							value: run,
							tone: "ok"
						}),
						/* @__PURE__ */ jsx(Kpi, {
							label: "pending",
							value: pend,
							tone: pend ? "warn" : "dim"
						}),
						/* @__PURE__ */ jsx(Kpi, {
							label: "failing",
							value: fail,
							tone: fail ? "bad" : "dim"
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "nschips",
				children: [
					/* @__PURE__ */ jsxs("span", {
						className: "vlab",
						children: [/* @__PURE__ */ jsx(KindIcon, {
							kind: "Namespace",
							size: 13
						}), "Namespaces"]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "chk",
						children: [/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							id: "showsys",
							checked: showSystem,
							onChange: (e) => {
								store.showSystem = e.target.checked;
								store.bump();
							}
						}), " system"]
					}),
					allNs.filter((n) => showSystem || !SYSTEM_NS.includes(n)).map((n) => /* @__PURE__ */ jsx("button", {
						className: "nschip " + (hiddenNs.has(n) ? "off" : ""),
						style: { "--c": nsColor(n) },
						onClick: () => {
							if (selText()) return;
							if (hiddenNs.has(n)) hiddenNs.delete(n);
							else hiddenNs.add(n);
							store.bump();
						},
						children: n
					}, n))
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "net",
				children: [/* @__PURE__ */ jsx("span", {
					className: "me",
					children: "💻 your machine"
				}), routes.length ? routes : /* @__PURE__ */ jsx("span", {
					className: "dim",
					children: " no published ports yet"
				})]
			}),
			tr && /* @__PURE__ */ jsxs("div", {
				className: "trace " + (tr.ok ? "ok" : "bad"),
				children: [
					/* @__PURE__ */ jsxs("span", {
						className: "dim",
						children: [
							"last request ",
							PG.fmtAge(sim.clock - tr.t),
							" ago:"
						]
					}),
					" ",
					tr.steps.map((s, i) => /* @__PURE__ */ jsxs(Fragment, { children: [i > 0 && /* @__PURE__ */ jsx("span", {
						className: "arr",
						children: "→"
					}), /* @__PURE__ */ jsx("span", {
						className: "step",
						children: s.label
					})] }, i))
				]
			}),
			/* @__PURE__ */ jsxs(VSection, {
				kind: "Node",
				title: "Nodes",
				count: cl.nodes.length,
				hint: "the machines pods run on",
				children: [/* @__PURE__ */ jsx("div", {
					className: "nodes",
					children: nodeRows.map((r) => /* @__PURE__ */ jsx(NodeCard, {
						cl,
						n: r.item,
						visible,
						fresh: r.fresh,
						leaving: r.leaving
					}, r.key))
				}), orphans.length > 0 && /* @__PURE__ */ jsxs("div", {
					className: "pendingbox",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "grp-h",
						children: [/* @__PURE__ */ jsx(KindTag, {
							kind: "Pod",
							label: "Unscheduled"
						}), /* @__PURE__ */ jsx("b", { children: "waiting for a node" })]
					}), /* @__PURE__ */ jsx("div", {
						className: "pods",
						children: /* @__PURE__ */ jsx(PodGroups, {
							cl,
							pods: orphans,
							empty: ""
						})
					})]
				})]
			}),
			(deps.length > 0 || dss.length > 0 || cjs.length > 0 || jobs.length > 0) && /* @__PURE__ */ jsx(VSection, {
				kind: "Deployment",
				title: "Workloads",
				count: deps.length + dss.length + cjs.length + jobs.length,
				hint: "what keeps pods running",
				children: /* @__PURE__ */ jsxs("div", {
					className: "wl",
					children: [
						deps.map((r) => {
							const d = r.item;
							const want = d.spec.replicas === void 0 ? 1 : d.spec.replicas;
							const ps = cl.res.pods.filter((p) => p.metadata.namespace === d.metadata.namespace && p.metadata._owner && p.metadata._owner.kind === "ReplicaSet" && p.metadata._owner.name.startsWith(d.metadata.name + "-") && !p.metadata.deletionTimestamp);
							const hpa = cl.res.horizontalpodautoscalers.find((x) => x.spec.scaleTargetRef.name === d.metadata.name && x.metadata.namespace === d.metadata.namespace);
							const pdb = cl.res.poddisruptionbudgets.find((x) => PG.selMatch(x.spec.selector, d.spec.template.metadata.labels) && x.metadata.namespace === d.metadata.namespace);
							const ready = (d.status || {}).readyReplicas || 0;
							return /* @__PURE__ */ jsxs("div", {
								className: "dep" + (r.fresh ? " enter" : "") + (r.leaving ? " leaving" : ""),
								onClick: r.leaving ? void 0 : inspectOnClick("deployments", d.metadata.namespace, d.metadata.name),
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "nsd",
										style: { background: nsColor(d.metadata.namespace) }
									}),
									/* @__PURE__ */ jsx(KindTag, { kind: "Deployment" }),
									/* @__PURE__ */ jsx("b", { children: d.metadata.name }),
									" ",
									/* @__PURE__ */ jsx("span", {
										className: "dim",
										children: d.metadata.namespace
									}),
									/* @__PURE__ */ jsx("span", {
										className: "reps",
										children: ps.map((p) => /* @__PURE__ */ jsx("i", { className: "sq " + statusClass(cl.podStatus(p)) }, p.metadata.uid))
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "cnt " + (ready === want ? "ok" : "warn"),
										children: [
											ready,
											"/",
											want
										]
									}, ready + "/" + want),
									/* @__PURE__ */ jsx("span", {
										className: "dim img",
										children: d.spec.template.spec.containers[0].image
									}),
									hpa && /* @__PURE__ */ jsxs("span", {
										className: "tag",
										children: [
											/* @__PURE__ */ jsx(KindIcon, {
												kind: "HorizontalPodAutoscaler",
												size: 11
											}),
											" HPA ",
											hpa.spec.minReplicas || 1,
											"–",
											hpa.spec.maxReplicas,
											hpa.status && hpa.status._util != null ? " @" + hpa.status._util + "%" : ""
										]
									}),
									pdb && /* @__PURE__ */ jsxs("span", {
										className: "tag",
										children: [
											/* @__PURE__ */ jsx(KindIcon, {
												kind: "PodDisruptionBudget",
												size: 11
											}),
											" PDB min ",
											pdb.spec.minAvailable === void 0 ? "-" : pdb.spec.minAvailable
										]
									})
								]
							}, r.key);
						}),
						dss.map((d) => /* @__PURE__ */ jsxs("div", {
							className: "dep",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "nsd",
									style: { background: nsColor(d.metadata.namespace) }
								}),
								/* @__PURE__ */ jsx(KindTag, { kind: "DaemonSet" }),
								/* @__PURE__ */ jsx("b", { children: d.metadata.name }),
								" ",
								/* @__PURE__ */ jsx("span", {
									className: "dim",
									children: d.metadata.namespace
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "cnt",
									children: [
										(d.status || {}).numberReady || 0,
										"/",
										(d.status || {}).desiredNumberScheduled || 0
									]
								})
							]
						}, d.metadata.uid)),
						cjs.map((d) => /* @__PURE__ */ jsxs("div", {
							className: "dep",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "nsd",
									style: { background: nsColor(d.metadata.namespace) }
								}),
								/* @__PURE__ */ jsx(KindTag, { kind: "CronJob" }),
								/* @__PURE__ */ jsx("b", { children: d.metadata.name }),
								" ",
								/* @__PURE__ */ jsx("span", {
									className: "dim",
									children: d.metadata.namespace
								}),
								/* @__PURE__ */ jsx("span", {
									className: "dim img",
									children: d.spec.schedule
								})
							]
						}, d.metadata.uid)),
						jobs.map((d) => /* @__PURE__ */ jsxs("div", {
							className: "dep",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "nsd",
									style: { background: nsColor(d.metadata.namespace) }
								}),
								/* @__PURE__ */ jsx(KindTag, { kind: "Job" }),
								/* @__PURE__ */ jsx("b", { children: d.metadata.name }),
								" ",
								/* @__PURE__ */ jsx("span", {
									className: "dim",
									children: d.metadata.namespace
								})
							]
						}, d.metadata.uid))
					]
				})
			}),
			(svcs.length > 0 || ings.length > 0) && /* @__PURE__ */ jsx(VSection, {
				kind: "Service",
				title: "Network",
				count: svcs.length + ings.length,
				hint: "how traffic reaches pods",
				children: /* @__PURE__ */ jsxs("div", {
					className: "svcs",
					children: [svcs.map((s) => {
						const eps = cl.endpointsOf(s);
						const lbl = s.spec.type === "LoadBalancer" ? PG.extIp(s) : "";
						const sel = s.spec.selector || {};
						const n = new Set(eps.map((e) => e.ip)).size;
						return /* @__PURE__ */ jsxs("div", {
							className: "svc",
							style: { borderTopColor: nsColor(s.metadata.namespace) },
							onClick: inspectOnClick("services", s.metadata.namespace, s.metadata.name),
							onMouseEnter: () => setHover({
								sel,
								ns: s.metadata.namespace
							}),
							onMouseLeave: () => setHover(null),
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "svc-h",
									children: [
										/* @__PURE__ */ jsx(KindTag, { kind: "Service" }),
										/* @__PURE__ */ jsx("b", { children: s.metadata.name }),
										" ",
										/* @__PURE__ */ jsx("span", {
											className: "tag",
											children: s.spec.type
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "dim",
									children: [
										s.metadata.namespace,
										" · ",
										s.spec.clusterIP || ""
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "svc-p",
									children: [PG.portsStr(s), lbl ? " · " + lbl : ""]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "svc-ep " + (n ? "okc" : "badc"),
									children: [n ? "→ " + n + " pod(s)" : "→ no endpoints", /* @__PURE__ */ jsx("span", {
										className: "dots",
										children: Array.from({ length: Math.min(n, 12) }, (_, i) => /* @__PURE__ */ jsx("i", {}, i))
									})]
								})
							]
						}, s.metadata.uid);
					}), ings.map((i) => /* @__PURE__ */ jsxs("div", {
						className: "svc ing",
						onClick: inspectOnClick("ingresses", i.metadata.namespace, i.metadata.name),
						onMouseEnter: () => setHover(null),
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "svc-h",
								children: [/* @__PURE__ */ jsx(KindTag, { kind: "Ingress" }), /* @__PURE__ */ jsx("b", { children: i.metadata.name })]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "dim",
								children: i.metadata.namespace
							}),
							(i.spec.rules || []).map((r, ri) => (r.http ? r.http.paths : []).map((p, pi) => /* @__PURE__ */ jsxs("div", {
								className: "svc-p",
								children: [
									r.host || "*",
									p.path,
									" → ",
									p.backend.service.name,
									":",
									p.backend.service.port.number
								]
							}, ri + "-" + pi)))
						]
					}, i.metadata.uid))]
				})
			}),
			cms.length + secs.length + pvcs.length + sas.length > 0 && /* @__PURE__ */ jsx(VSection, {
				kind: "ConfigMap",
				title: "Config & storage",
				count: cms.length + secs.length + pvcs.length + sas.length,
				hint: "settings and identities pods use",
				children: /* @__PURE__ */ jsx("div", {
					className: "cfg",
					children: [
						[
							"ConfigMap",
							"configmaps",
							cms
						],
						[
							"Secret",
							"secrets",
							secs
						],
						[
							"PersistentVolumeClaim",
							"persistentvolumeclaims",
							pvcs
						],
						[
							"ServiceAccount",
							"serviceaccounts",
							sas
						]
					].filter(([, , l]) => l.length).map(([kind, plural, list]) => /* @__PURE__ */ jsxs("div", {
						className: "cfg-g",
						children: [/* @__PURE__ */ jsx(KindTag, { kind }), /* @__PURE__ */ jsx("div", {
							className: "cfg-items",
							children: list.map((x) => /* @__PURE__ */ jsx("button", {
								className: "cfg-i",
								style: { "--c": nsColor(x.metadata.namespace) },
								onClick: inspectOnClick(plural, x.metadata.namespace, x.metadata.name),
								title: x.metadata.namespace + "/" + x.metadata.name,
								children: x.metadata.name
							}, x.metadata.uid))
						})]
					}, kind))
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "legend",
				children: [
					/* @__PURE__ */ jsx("span", { className: "sw ok" }),
					"Running ",
					/* @__PURE__ */ jsx("span", { className: "sw warn" }),
					"Starting/Pending ",
					/* @__PURE__ */ jsx("span", { className: "sw bad" }),
					"Failing ",
					/* @__PURE__ */ jsx("span", { className: "sw done" }),
					"Completed ",
					/* @__PURE__ */ jsx("span", { className: "sw dying" }),
					"Terminating \xA0·\xA0 left edge = namespace \xA0·\xA0 click anything to inspect \xA0·\xA0 hover a Service to light its pods"
				]
			})
		]
	});
}
//#endregion
//#region src/playground/views/DockerView.jsx
var portPills = (c) => (c.ports || []).map((p, i) => /* @__PURE__ */ jsxs("span", {
	className: "pport",
	children: [
		p.hostIp || "127.0.0.1",
		":",
		p.host,
		/* @__PURE__ */ jsx("em", { children: "→" }),
		p.container
	]
}, i));
function ContainerCard({ c, fresh, leaving }) {
	const sim = store.sim;
	const up = c.status === "running";
	return /* @__PURE__ */ jsxs("div", {
		className: "ccard" + (up ? "" : " stopped") + (fresh ? " enter" : "") + (leaving ? " leaving" : ""),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "cc-h",
				children: [
					/* @__PURE__ */ jsx(Led, {
						tone: up ? "ok" : "done",
						pulse: up
					}),
					/* @__PURE__ */ jsx("b", { children: c.name }),
					/* @__PURE__ */ jsx(KindTag, {
						kind: c.kind === "registry" ? "Registry" : c.kind === "node" ? "Node" : "Container",
						label: c.kind || "container"
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "cc-img",
				children: c.image
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "cc-meta",
				children: [/* @__PURE__ */ jsx("span", { children: PG.upText(sim, c) }), c.networks.map((n) => /* @__PURE__ */ jsx("span", {
					className: "chip",
					children: n
				}, n))]
			}),
			(c.ports || []).length > 0 && /* @__PURE__ */ jsx("div", {
				className: "cc-ports",
				children: portPills(c)
			})
		]
	});
}
function DockerView() {
	const sim = store.sim;
	const imgs = Object.entries(sim.images);
	const regs = sim.containers.filter((c) => c.kind === "registry");
	const rows = useGhosts(sim.containers, (c) => c.name, 460);
	const maxSize = Math.max(1, ...imgs.map(([, v]) => v.size));
	const groups = [
		["node", "Cluster nodes (kind and k3d nodes are containers)"],
		["registry", "Registries"],
		["other", "Your containers"]
	];
	const kindOf = (c) => c.kind === "node" || c.kind === "registry" ? c.kind : /serverlb|loadbalancer/.test(c.name) ? "node" : "other";
	return /* @__PURE__ */ jsxs("div", {
		className: "cv",
		children: [
			/* @__PURE__ */ jsx(VSection, {
				kind: "Container",
				title: "Containers",
				count: sim.containers.length,
				hint: "what docker ps shows",
				children: sim.containers.length ? groups.map(([g, label]) => {
					const rs = rows.filter((r) => kindOf(r.item) === g);
					return rs.length ? /* @__PURE__ */ jsxs("div", {
						className: "cgroup",
						children: [/* @__PURE__ */ jsx("div", {
							className: "vlab",
							children: label
						}), /* @__PURE__ */ jsx("div", {
							className: "cgrid",
							children: rs.map((r) => /* @__PURE__ */ jsx(ContainerCard, {
								c: r.item,
								fresh: r.fresh,
								leaving: r.leaving
							}, r.key))
						})]
					}, g) : null;
				}) : /* @__PURE__ */ jsxs("div", {
					className: "empty",
					children: [/* @__PURE__ */ jsx("p", {
						className: "dim",
						children: "No containers yet. A kind or k3d cluster is a set of containers."
					}), /* @__PURE__ */ jsxs("div", {
						className: "empty-actions",
						children: [/* @__PURE__ */ jsx("button", {
							className: "go",
							onClick: () => {
								store.setPane("term");
								store.runInTerm("kind create cluster --name local-cluster-1", true);
							},
							children: "kind create cluster"
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => {
								store.setPane("term");
								store.runInTerm("docker run -d --name x -p 8080:80 nginx:1.27", true);
							},
							children: "docker run nginx"
						})]
					})]
				})
			}),
			/* @__PURE__ */ jsx(VSection, {
				kind: "Image",
				title: "Images",
				count: imgs.length,
				hint: "stored by docker on your machine",
				children: imgs.length ? /* @__PURE__ */ jsx("div", {
					className: "igrid",
					children: imgs.map(([k, v]) => /* @__PURE__ */ jsxs("div", {
						className: "icard",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "ic-h",
								children: [/* @__PURE__ */ jsx("b", { children: k }), v.meta ? /* @__PURE__ */ jsx("span", {
									className: "tag",
									children: "built here"
								}) : null]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "ic-id",
								children: v.id
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "ic-s",
								children: [/* @__PURE__ */ jsx(Meter, {
									value: v.size,
									max: maxSize,
									tone: "ok",
									label: `size ${v.size} MB`
								}), /* @__PURE__ */ jsx("span", { children: v.size >= 1e3 ? (v.size / 1e3).toFixed(2) + " GB" : v.size + " MB" })]
							})
						]
					}, k))
				}) : /* @__PURE__ */ jsxs("p", {
					className: "dim",
					children: ["No local images. Try ", /* @__PURE__ */ jsx("code", { children: "docker pull nginx:1.27" })]
				})
			}),
			/* @__PURE__ */ jsx(VSection, {
				kind: "Network",
				title: "Networks",
				count: sim.networks.length,
				hint: "containers on the same network can reach each other",
				children: /* @__PURE__ */ jsx("div", {
					className: "nets",
					children: sim.networks.map((n) => {
						const members = sim.containers.filter((c) => c.networks.includes(n));
						return /* @__PURE__ */ jsxs("div", {
							className: "netc",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "net-h",
								children: [/* @__PURE__ */ jsx(KindTag, {
									kind: "Network",
									label: n
								}), /* @__PURE__ */ jsxs("span", {
									className: "dim",
									children: [
										members.length,
										" container",
										members.length === 1 ? "" : "s"
									]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "net-bus",
								children: [/* @__PURE__ */ jsx("i", { className: "bus-line" }), members.slice(0, 14).map((m) => /* @__PURE__ */ jsx("span", {
									className: "bus-dot " + (m.status === "running" ? "ok" : "done"),
									title: m.name
								}, m.name))]
							})]
						}, n);
					})
				})
			}),
			regs.map((r) => {
				const d = sim.registries[r.name] || {};
				const keys = Object.keys(d);
				return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(VSection, {
					kind: "Registry",
					title: `Registry ${r.name}${r.status === "running" ? "" : " (stopped)"}`,
					count: keys.length,
					hint: "images you pushed",
					children: keys.length ? /* @__PURE__ */ jsx("div", {
						className: "chips-row",
						children: keys.map((k) => /* @__PURE__ */ jsx("span", {
							className: "chip",
							children: k
						}, k))
					}) : /* @__PURE__ */ jsxs("p", {
						className: "dim",
						children: ["empty — ", /* @__PURE__ */ jsx("code", { children: "docker push localhost:5001/…" })]
					})
				}) }, r.name);
			})
		]
	});
}
//#endregion
//#region src/playground/views/ConfigView.jsx
function ConfigView() {
	const sim = store.sim;
	const kc = sim.kubeconfig;
	const cl = sim.currentCluster();
	const ctxRows = useGhosts(kc.contexts, (c) => c.name, 440);
	let access = null;
	if (cl) {
		const subs = [];
		const add = (kind, name, ns) => {
			const k = kind + "|" + name + "|" + (ns || "");
			if (!subs.find((s) => s.k === k)) subs.push({
				k,
				kind,
				name,
				ns
			});
		};
		for (const b of [...cl.res.rolebindings, ...cl.res.clusterrolebindings]) for (const s of b.subjects || []) add(s.kind, s.name, s.namespace);
		const nss = cl.res.namespaces.map((n) => n.metadata.name).filter((n) => !SYSTEM_NS.includes(n));
		const checks = [
			[
				"get",
				"pods",
				"r"
			],
			[
				"create",
				"deployments",
				"w"
			],
			[
				"get",
				"secrets",
				"s"
			],
			[
				"delete",
				"pods",
				"d"
			]
		];
		const idOf = (s) => s.kind === "User" ? {
			user: s.name,
			groups: []
		} : s.kind === "Group" ? {
			user: "",
			groups: [s.name]
		} : {
			user: `system:serviceaccount:${s.ns}:${s.name}`,
			groups: []
		};
		access = /* @__PURE__ */ jsxs(VSection, {
			kind: "ServiceAccount",
			title: `Access matrix · ${cl.id}`,
			count: subs.length,
			hint: "who may do what, per namespace",
			children: [/* @__PURE__ */ jsxs("p", {
				className: "dim",
				children: [
					"Computed from Roles and bindings by the same rules ",
					/* @__PURE__ */ jsx("code", { children: "kubectl auth can-i" }),
					" uses."
				]
			}), !subs.length ? /* @__PURE__ */ jsx("p", {
				className: "dim",
				children: "No bindings yet. Try the RBAC section in the guide."
			}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
				className: "mx-wrap",
				children: /* @__PURE__ */ jsx("table", {
					className: "tb mx",
					children: /* @__PURE__ */ jsxs("tbody", { children: [/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Subject" }), nss.map((n) => /* @__PURE__ */ jsx("th", { children: n }, n))] }), subs.map((s, si) => /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsxs("td", { children: [
						/* @__PURE__ */ jsx(KindTag, {
							kind: s.kind === "ServiceAccount" ? "ServiceAccount" : "Context",
							label: s.kind
						}),
						" ",
						/* @__PURE__ */ jsx("b", { children: s.name }),
						s.ns ? /* @__PURE__ */ jsxs("span", {
							className: "dim",
							children: [
								" (",
								s.ns,
								")"
							]
						}) : null
					] }), nss.map((n, ni) => /* @__PURE__ */ jsx("td", { children: checks.map(([v, r, l], ci) => /* @__PURE__ */ jsx("span", {
						className: "ck " + (cl.authorize(idOf(s), v, r, n) ? "y" : "n"),
						style: { animationDelay: si * 40 + ni * 30 + ci * 25 + "ms" },
						title: v + " " + r,
						children: l
					}, l)) }, n))] }, s.k))] })
				})
			}), /* @__PURE__ */ jsx("p", {
				className: "dim",
				children: "r = get pods · w = create deployments · s = get secrets · d = delete pods \xA0 green = allowed"
			})] })]
		});
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "cv",
		children: [/* @__PURE__ */ jsxs(VSection, {
			kind: "Context",
			title: "kubeconfig · contexts",
			count: kc.contexts.length,
			hint: "which cluster, as which user, in which namespace",
			children: [/* @__PURE__ */ jsx("div", {
				className: "ctxgrid",
				children: ctxRows.map((r) => {
					const c = r.item;
					const u = sim.userEntry(c.user);
					const k = sim.clusters[c.cluster];
					const a = u ? u.auth : { kind: "?" };
					const cur = c.name === kc.current;
					return /* @__PURE__ */ jsxs("div", {
						className: "ctxc" + (cur ? " cur" : "") + (r.fresh ? " enter" : "") + (r.leaving ? " leaving" : ""),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "cx-h",
							children: [
								/* @__PURE__ */ jsx(Led, {
									tone: k ? k.apiUp() ? "ok" : "bad" : "done",
									pulse: cur && !!k
								}),
								/* @__PURE__ */ jsx("b", { children: c.name }),
								cur && /* @__PURE__ */ jsx("span", {
									className: "star",
									title: "current context",
									children: "★ current"
								}),
								k && k.tool === "gke" && /* @__PURE__ */ jsx("span", {
									className: "tag prodtag",
									children: "PRODUCTION"
								})
							]
						}), /* @__PURE__ */ jsxs("dl", { children: [
							/* @__PURE__ */ jsx("dt", { children: "cluster" }),
							/* @__PURE__ */ jsxs("dd", { children: [c.cluster, sim.clusterEntry(c.cluster) ? "" : /* @__PURE__ */ jsxs(Fragment$1, { children: [" ", /* @__PURE__ */ jsx("span", {
								className: "badc",
								children: "missing"
							})] })] }),
							/* @__PURE__ */ jsx("dt", { children: "user" }),
							/* @__PURE__ */ jsxs("dd", { children: [c.user, u ? "" : /* @__PURE__ */ jsxs(Fragment$1, { children: [" ", /* @__PURE__ */ jsx("span", {
								className: "badc",
								children: "missing"
							})] })] }),
							/* @__PURE__ */ jsx("dt", { children: "namespace" }),
							/* @__PURE__ */ jsx("dd", { children: c.namespace || "default" }),
							/* @__PURE__ */ jsx("dt", { children: "auth" }),
							/* @__PURE__ */ jsx("dd", { children: a.kind === "cert" ? "cert CN=" + a.cn + (a.groups.length ? " O=" + a.groups.join(",") : "") : a.kind === "token" ? "token" : a.kind }),
							/* @__PURE__ */ jsx("dt", { children: "status" }),
							/* @__PURE__ */ jsx("dd", { children: k ? k.apiUp() ? /* @__PURE__ */ jsx("span", {
								className: "okc",
								children: "API up"
							}) : /* @__PURE__ */ jsx("span", {
								className: "badc",
								children: "API down"
							}) : /* @__PURE__ */ jsx("span", {
								className: "badc",
								children: "cluster gone"
							}) })
						] })]
					}, r.key);
				})
			}), /* @__PURE__ */ jsxs("p", {
				className: "dim",
				children: ["current-context: ", /* @__PURE__ */ jsx("b", { children: kc.current || "(not set)" })]
			})]
		}), access]
	});
}
//#endregion
//#region src/playground/views/HelmView.jsx
function HelmView() {
	const cl = store.sim.currentCluster();
	const rels = cl ? Object.values(cl.helm.releases) : [];
	const rows = useGhosts(rels, (r) => r.name, 460);
	if (!cl) return /* @__PURE__ */ jsx("div", {
		className: "empty",
		children: /* @__PURE__ */ jsx("p", {
			className: "dim",
			children: "No cluster selected."
		})
	});
	const tid = (() => {
		const dep = cl.find("deployments", "tiller-deploy", "kube-system");
		if (!dep) return null;
		return {
			dep,
			ready: cl.matchPods("kube-system", dep.spec.selector).some((p) => cl.podReady(p)),
			img: dep.spec.template.spec.containers[0].image,
			sa: dep.spec.template.spec.serviceAccountName || "default"
		};
	})();
	return /* @__PURE__ */ jsxs("div", {
		className: "cv",
		children: [
			/* @__PURE__ */ jsx(VSection, {
				kind: "Tiller",
				title: "Tiller",
				hint: "Helm 2's server, running in the cluster",
				children: tid ? /* @__PURE__ */ jsxs("div", {
					className: "tiller " + (tid.ready ? "ok" : "bad"),
					children: [/* @__PURE__ */ jsx(Led, {
						tone: tid.ready ? "ok" : "bad",
						pulse: tid.ready
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("b", { children: tid.ready ? "ready" : "not ready" }), /* @__PURE__ */ jsxs("div", {
						className: "dim",
						children: [
							"image ",
							/* @__PURE__ */ jsx("code", { children: tid.img }),
							" · runs as ServiceAccount ",
							/* @__PURE__ */ jsx("b", { children: tid.sa })
						]
					})] })]
				}) : /* @__PURE__ */ jsxs("div", {
					className: "empty",
					children: [/* @__PURE__ */ jsx("p", {
						className: "dim",
						children: "Not installed in this cluster."
					}), /* @__PURE__ */ jsx("div", {
						className: "empty-actions",
						children: /* @__PURE__ */ jsx("button", {
							className: "go",
							onClick: () => {
								store.setPane("term");
								store.runInTerm("helm2 init --service-account tiller", false);
							},
							children: "Put “helm2 init” on the prompt"
						})
					})]
				})
			}),
			/* @__PURE__ */ jsxs(VSection, {
				kind: "Release",
				title: "Releases",
				count: rels.length,
				hint: "installed charts and their revisions",
				children: [!rows.length && /* @__PURE__ */ jsxs("p", {
					className: "dim",
					children: ["None yet. ", /* @__PURE__ */ jsx("code", { children: "helm2 install myapp --name demo --namespace web" })]
				}), /* @__PURE__ */ jsx("div", {
					className: "rels",
					children: rows.map((rw) => {
						const r = rw.item;
						const cur = r.revs[r.revs.length - 1];
						return /* @__PURE__ */ jsxs("div", {
							className: "rel" + (rw.fresh ? " enter" : "") + (rw.leaving ? " leaving" : ""),
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "rel-h",
									children: [
										/* @__PURE__ */ jsx(KindTag, { kind: "Release" }),
										/* @__PURE__ */ jsx("b", { children: r.name }),
										/* @__PURE__ */ jsxs("span", {
											className: "tag",
											children: ["ns ", r.namespace]
										}),
										/* @__PURE__ */ jsx("span", {
											className: "tag " + (cur.status === "DEPLOYED" ? "g" : "r"),
											children: cur.status
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "dim",
											children: [
												cur.chart,
												"-",
												cur.version
											]
										})
									]
								}),
								/* @__PURE__ */ jsx("ol", {
									className: "timeline",
									children: r.revs.map((v) => /* @__PURE__ */ jsxs("li", {
										className: (v.status === "DEPLOYED" ? "on" : "") + " " + (v.status === "FAILED" ? "fail" : ""),
										title: v.description,
										children: [
											/* @__PURE__ */ jsx("i", {}),
											/* @__PURE__ */ jsxs("span", { children: ["v", v.rev] }),
											/* @__PURE__ */ jsx("em", { children: v.status.toLowerCase() })
										]
									}, v.rev))
								}),
								/* @__PURE__ */ jsx("div", {
									className: "rel-objs",
									children: cur.objs.map((o) => /* @__PURE__ */ jsx(KindTag, {
										kind: PG.KINDS[o.plural].kind,
										label: PG.KINDS[o.plural].kind + "/" + o.name,
										size: 12
									}, o.plural + o.name))
								})
							]
						}, rw.key);
					})
				})]
			}),
			/* @__PURE__ */ jsx(VSection, {
				kind: "File",
				title: "Chart in ~/myapp",
				hint: "edit, then helm2 template",
				children: /* @__PURE__ */ jsxs("p", {
					className: "dim",
					children: [
						"Edit ",
						/* @__PURE__ */ jsx("code", { children: "values.yaml" }),
						" or any template in the ",
						/* @__PURE__ */ jsx("b", { children: "Files" }),
						" tab, then run ",
						/* @__PURE__ */ jsx("code", { children: "helm2 template myapp --name demo" }),
						" to see the change."
					]
				})
			})
		]
	});
}
//#endregion
//#region src/playground/highlight.js
var esc = (s) => String(s === void 0 || s === null ? "" : s).replace(/[&<>"']/g, (c) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[c]);
var HC_CTRL = /* @__PURE__ */ new Set([
	"if",
	"else",
	"end",
	"range",
	"with",
	"define",
	"template",
	"block",
	"include",
	"break",
	"continue",
	"nil",
	"true",
	"false"
]);
var HC_FUNC = /* @__PURE__ */ new Set([
	"toYaml",
	"toJson",
	"indent",
	"nindent",
	"quote",
	"squote",
	"default",
	"required",
	"not",
	"and",
	"or",
	"eq",
	"ne",
	"lt",
	"gt",
	"le",
	"ge",
	"print",
	"printf",
	"println",
	"sha256sum",
	"tpl",
	"lower",
	"upper",
	"title",
	"trunc",
	"trimSuffix",
	"trimPrefix",
	"trim",
	"replace",
	"contains",
	"hasPrefix",
	"hasSuffix",
	"b64enc",
	"b64dec",
	"len",
	"list",
	"dict",
	"set",
	"get",
	"has",
	"empty",
	"coalesce",
	"ternary",
	"join",
	"split",
	"lookup",
	"fail",
	"kindIs",
	"typeOf",
	"index",
	"regexMatch",
	"now",
	"date",
	"int",
	"int64",
	"toString",
	"fromYaml",
	"merge",
	"keys",
	"sortAlpha",
	"semver",
	"randAlphaNum",
	"genCA",
	"genSignedCert",
	"sha1sum",
	"nospace",
	"cat",
	"repeat",
	"toStrings",
	"uniq",
	"first",
	"last",
	"rest",
	"append"
]);
var sp = (c, t) => `<span class="${c}">${esc(t)}</span>`;
function hlAction(a) {
	const m = /^(\{\{-?\s*)([\s\S]*?)(\s*-?\}\}|)$/.exec(a);
	let out = sp("hd", m[1]);
	const body = m[2];
	if (/^\/\*/.test(body)) out += sp("hm", body);
	else out += body.replace(/("(?:[^"\\]|\\.)*"|`[^`]*`|\$?\.[\w.]*|\$\w*|\d+(?:\.\d+)?|[A-Za-z_]\w*|[|():=]|\s+|[\s\S])/g, (t) => /^["`]/.test(t) ? sp("hs", t) : /^\$?\./.test(t) || /^\$/.test(t) ? sp("hv", t) : /^\d/.test(t) ? sp("hn", t) : HC_CTRL.has(t) ? sp("hc", t) : HC_FUNC.has(t) ? sp("hf", t) : /^[|():=]$/.test(t) ? sp("hp", t) : esc(t));
	return `<span class="ha">${out}${m[3] ? sp("hd", m[3]) : ""}</span>`;
}
function hlLine(line, docker) {
	if (docker) {
		const dm = /^(\s*)(FROM|RUN|CMD|COPY|ADD|ENV|EXPOSE|WORKDIR|ENTRYPOINT|ARG|USER|LABEL|VOLUME|HEALTHCHECK|AS)\b(.*)$/i.exec(line);
		if (dm) return esc(dm[1]) + sp("hc", dm[2]) + esc(dm[3]).replace(/(--[\w-]+)/g, "<span class=\"hf\">$1</span>");
		if (/^\s*#/.test(line)) return sp("hm", line);
	}
	let out = "", i = 0;
	const km = /^(\s*(?:- )*)([A-Za-z_][\w./-]*|"[^"]*"|'[^']*')(:)(?=\s|$)/.exec(line);
	if (km) {
		out += esc(km[1]).replace(/-/g, "<span class=\"hp\">-</span>") + sp("hk", km[2]) + sp("hp", ":");
		i = km[0].length;
	} else {
		const dm = /^(\s*)(- )/.exec(line);
		if (dm) {
			out += esc(dm[1]) + sp("hp", "-") + " ";
			i = dm[0].length;
		}
	}
	let word = "";
	const flushW = () => {
		if (!word) return;
		out += /^-?\d+(\.\d+)?$/.test(word) ? sp("hn", word) : /^(true|false|null|~|yes|no)$/i.test(word) ? sp("hc", word) : esc(word);
		word = "";
	};
	while (i < line.length) {
		const c = line[i];
		if (line.startsWith("{{", i)) {
			flushW();
			const e = line.indexOf("}}", i);
			const end = e < 0 ? line.length : e + 2;
			out += hlAction(line.slice(i, end));
			i = end;
			continue;
		}
		if (c === "#" && (i === 0 || /\s/.test(line[i - 1]))) {
			flushW();
			out += sp("hm", line.slice(i));
			i = line.length;
			break;
		}
		if (c === "\"" || c === "'") {
			flushW();
			let j = i + 1, buf = c;
			while (j < line.length && line[j] !== c) {
				if (line.startsWith("{{", j)) {
					out += sp("hs", buf);
					buf = "";
					const e = line.indexOf("}}", j);
					const end = e < 0 ? line.length : e + 2;
					out += hlAction(line.slice(j, end));
					j = end;
					continue;
				}
				if (line[j] === "\\") buf += line[j++];
				buf += line[j++] || "";
			}
			buf += line[j] || "";
			out += sp("hs", buf);
			i = j + 1;
			continue;
		}
		if (/[\s,:[\]{}]/.test(c)) {
			flushW();
			out += c === ":" || c === "[" || c === "]" || c === "{" || c === "}" || c === "," ? sp("hp", c) : esc(c);
			i++;
			continue;
		}
		if ((c === "|" || c === ">") && /^[|>][-+]?\s*$/.test(line.slice(i))) {
			flushW();
			out += sp("hc", line.slice(i));
			i = line.length;
			break;
		}
		word += c;
		i++;
	}
	flushW();
	return out;
}
var hlText = (text, name) => {
	const docker = /(^|\/)Dockerfile/i.test(name || "");
	return text.split("\n").map((l) => hlLine(l, docker)).join("\n");
};
//#endregion
//#region src/playground/views/FilesView.jsx
var shown = (p) => p.replace("/home/user/", "~/");
function buildTree(paths) {
	const root = {
		dirs: /* @__PURE__ */ new Map(),
		files: []
	};
	for (const p of paths) {
		const home = p.startsWith("/home/user/");
		const segs = (home ? p.slice(11) : p).split("/").filter(Boolean);
		let n = home ? root.dirs.get("~") || root.dirs.set("~", {
			dirs: /* @__PURE__ */ new Map(),
			files: [],
			path: "~"
		}).get("~") : root.dirs.get("/") || root.dirs.set("/", {
			dirs: /* @__PURE__ */ new Map(),
			files: [],
			path: "/"
		}).get("/");
		for (const s of segs.slice(0, -1)) {
			if (!n.dirs.has(s)) n.dirs.set(s, {
				dirs: /* @__PURE__ */ new Map(),
				files: [],
				path: n.path + "/" + s
			});
			n = n.dirs.get(s);
		}
		n.files.push({
			name: segs[segs.length - 1],
			full: p
		});
	}
	return root;
}
var count = (n) => n.files.length + [...n.dirs.values()].reduce((a, d) => a + count(d), 0);
function TreeNode({ name, node, depth, closed, toggle, openFile }) {
	const shut = closed.has(node.path);
	return /* @__PURE__ */ jsxs("div", {
		className: "tdir",
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			className: "trow dir" + (shut ? " shut" : ""),
			style: { paddingLeft: 6 + depth * 14 },
			"aria-expanded": !shut,
			onClick: () => toggle(node.path),
			children: [
				/* @__PURE__ */ jsx("svg", {
					className: "chev",
					width: "10",
					height: "10",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "3",
					"aria-hidden": "true",
					children: /* @__PURE__ */ jsx("path", { d: "M9 6l6 6-6 6" })
				}),
				/* @__PURE__ */ jsx(KindIcon, {
					kind: "Folder",
					size: 14
				}),
				/* @__PURE__ */ jsx("span", { children: name }),
				/* @__PURE__ */ jsx("em", { children: count(node) })
			]
		}), !shut && /* @__PURE__ */ jsxs("div", {
			className: "tkids",
			children: [[...node.dirs.entries()].sort().map(([n, d]) => /* @__PURE__ */ jsx(TreeNode, {
				name: n,
				node: d,
				depth: depth + 1,
				closed,
				toggle,
				openFile
			}, d.path)), node.files.sort((a, b) => a.name.localeCompare(b.name)).map((f) => /* @__PURE__ */ jsxs("div", {
				className: "f trow file " + (f.full === openFile ? "on" : ""),
				style: { paddingLeft: 26 + depth * 14 },
				title: f.full,
				onClick: () => {
					if (selText()) return;
					store.openFile = f.full;
					store.bump();
				},
				children: [/* @__PURE__ */ jsx(KindIcon, {
					kind: "File",
					size: 13
				}), /* @__PURE__ */ jsx("span", { children: f.name })]
			}, f.full))]
		})]
	});
}
function FileEditor({ path }) {
	const sim = store.sim;
	const fsText = sim.fs.read(path) || "";
	const [text, setText] = useState(fsText);
	const [msg, setMsg] = useState("");
	const synced = useRef(fsText);
	const hl = useRef(null), gut = useRef(null), ta = useRef(null);
	useEffect(() => {
		if (fsText !== synced.current) {
			if (text === synced.current) setText(fsText);
			synced.current = fsText;
		}
	});
	const sync = () => {
		const t = ta.current;
		if (!t) return;
		hl.current.scrollTop = t.scrollTop;
		hl.current.scrollLeft = t.scrollLeft;
		gut.current.scrollTop = t.scrollTop;
	};
	useLayoutEffect(sync, [text]);
	const save = (value) => {
		sim.fs.write(path, value);
		synced.current = value;
		setMsg(" saved ✓");
	};
	const onKeyDown = (e) => {
		const t = e.currentTarget;
		if (e.key === "Tab" && !e.shiftKey) {
			e.preventDefault();
			document.execCommand("insertText", false, "  ");
		} else if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
			const v = t.value, p = t.selectionStart;
			const ls = v.lastIndexOf("\n", p - 1) + 1;
			const ind = /^[ \t]*/.exec(v.slice(ls, p))[0];
			e.preventDefault();
			document.execCommand("insertText", false, "\n" + ind);
		} else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
			e.preventDefault();
			save(t.value);
		}
	};
	const n = text.split("\n").length;
	let nums = "";
	for (let i = 1; i <= n; i++) nums += i + "\n";
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
		className: "fh",
		children: [
			/* @__PURE__ */ jsx("b", { children: shown(path) }),
			/* @__PURE__ */ jsx("button", {
				id: "savefile",
				onClick: () => {
					if (selText()) return;
					save(text);
				},
				children: "Save"
			}),
			/* @__PURE__ */ jsx("button", {
				id: "rmfile",
				onClick: () => {
					sim.fs.remove(path);
					store.openFile = null;
					store.bump();
				},
				children: "Delete"
			}),
			/* @__PURE__ */ jsx("span", {
				id: "savemsg",
				className: "dim",
				children: msg
			})
		]
	}), /* @__PURE__ */ jsxs("div", {
		className: "ed",
		children: [/* @__PURE__ */ jsx("div", {
			className: "gut",
			id: "fgut",
			ref: gut,
			children: nums
		}), /* @__PURE__ */ jsxs("div", {
			className: "edin",
			children: [/* @__PURE__ */ jsx("pre", {
				className: "hl",
				id: "fhl",
				"aria-hidden": "true",
				ref: hl,
				dangerouslySetInnerHTML: { __html: hlText(text, path) + "\n" }
			}), /* @__PURE__ */ jsx("textarea", {
				id: "fta",
				ref: ta,
				wrap: "off",
				spellCheck: false,
				value: text,
				onChange: (e) => setText(e.target.value),
				onScroll: sync,
				onKeyDown
			})]
		})]
	})] });
}
function FilesView() {
	const sim = store.sim;
	const { fsStatus, fsBytes, openFile } = store;
	const files = Object.keys(sim.fs.files).sort();
	const newfile = useRef(null);
	const [closed, setClosed] = useState(() => /* @__PURE__ */ new Set());
	const toggle = (p) => setClosed((s) => {
		const n = new Set(s);
		if (n.has(p)) n.delete(p);
		else n.add(p);
		return n;
	});
	const tree = buildTree(files);
	const mk = () => {
		let p = newfile.current.value.trim();
		if (!p) return;
		p = sim.fs.norm(p.replace(/^~/, "/home/user"), "/home/user");
		sim.fs.write(p, "");
		store.openFile = p;
		store.bump();
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "files",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flist",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "fsstat " + fsStatus,
					children: fsStatus === "ok" ? "💾 saved in this browser (" + Math.max(1, Math.round(fsBytes / 1024)) + " KB)" : fsStatus === "toobig" ? "⚠ too big to save (limit ≈ 4 MB)" : fsStatus === "unavailable" ? "⚠ browser storage is unavailable here — files are lost on reload" : "…"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "dim",
					children: "click a file to edit"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "ftree",
					role: "tree",
					children: [...tree.dirs.entries()].sort((a, b) => a[0] === "~" ? -1 : b[0] === "~" ? 1 : 0).map(([n, d]) => /* @__PURE__ */ jsx(TreeNode, {
						name: n === "~" ? "~ (home)" : n,
						node: d,
						depth: 0,
						closed,
						toggle,
						openFile
					}, d.path))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "newf",
					children: [/* @__PURE__ */ jsx("input", {
						id: "newfile",
						ref: newfile,
						placeholder: "~/new-file.yaml",
						spellCheck: false,
						onKeyDown: (e) => {
							if (e.key === "Enter") mk();
						}
					}), /* @__PURE__ */ jsx("button", {
						id: "mkfile",
						onClick: mk,
						children: "+"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "fbtns",
					children: [/* @__PURE__ */ jsx("button", {
						id: "restorefiles",
						title: "re-create the example chart files that are missing (never overwrites yours)",
						onClick: () => {
							const n = PG.seedChart(sim, true);
							if (store.active) store.active.print(n ? `(restored ${n} missing example file(s) in ~/myapp)` : "(no example files were missing)", "dim");
							store.bump();
						},
						children: "Restore example chart"
					}), /* @__PURE__ */ jsx("button", {
						id: "wipefiles",
						title: "delete ALL your files and start from the examples",
						onClick: () => {
							if (window.confirm("Delete ALL files you created or edited (and restore the examples)? The simulated cluster world restarts too.")) {
								try {
									localStorage.removeItem(FS_KEY);
								} catch (er) {}
								store.reset();
							}
						},
						children: "Wipe all my files"
					})]
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "fedit",
			children: openFile ? /* @__PURE__ */ jsx(FileEditor, { path: openFile }, openFile) : /* @__PURE__ */ jsxs("p", {
				className: "dim",
				children: [
					"Open a file. Everything you create with ",
					/* @__PURE__ */ jsx("code", { children: "cat > file <<'EOF'" }),
					" shows up here too."
				]
			})
		})]
	});
}
//#endregion
//#region src/playground/views/EventsView.jsx
var KIND_OF = {
	Pod: "Pod",
	Deployment: "Deployment",
	ReplicaSet: "ReplicaSet",
	Node: "Node",
	Service: "Service",
	Job: "Job",
	DaemonSet: "DaemonSet",
	HorizontalPodAutoscaler: "HorizontalPodAutoscaler",
	Ingress: "Ingress"
};
var bucket = (age) => age < 15 ? "just now" : age < 120 ? "last couple of minutes" : age < 900 ? "last quarter hour" : "earlier";
var ORDER = [
	"just now",
	"last couple of minutes",
	"last quarter hour",
	"earlier"
];
function EventsView() {
	const sim = store.sim;
	const cl = sim.currentCluster();
	const [only, setOnly] = useState("all");
	const items = [];
	for (const l of sim.log) items.push({
		id: "s" + l.t + l.msg,
		t: l.t,
		type: "sim",
		kind: "Event",
		name: "simulator",
		ns: "",
		reason: "Note",
		text: l.msg
	});
	if (cl) for (const e of cl.res.events.slice(-80)) items.push({
		id: e.name + e.reason + (e.t || "") + (e.message || "").slice(0, 20),
		t: e.lastT || e.t,
		type: e.type,
		kind: KIND_OF[e.kind] || "Event",
		name: e.name,
		ns: e.ns,
		reason: e.reason,
		text: e.message + (e.count > 1 ? " (x" + e.count + ")" : "")
	});
	const dup = /* @__PURE__ */ new Map();
	for (const i of items) {
		const n = dup.get(i.id) || 0;
		dup.set(i.id, n + 1);
		if (n) i.id += "#" + n;
	}
	items.sort((a, b) => b.t - a.t);
	const warn = items.filter((i) => i.type === "Warning").length;
	const rows = useGhosts(items.filter((i) => only === "all" || (only === "warn" ? i.type === "Warning" : i.type !== "Warning")).slice(0, 120), (i) => i.id, 300);
	const groups = ORDER.map((b) => [b, rows.filter((r) => bucket(sim.clock - r.item.t) === b)]).filter(([, r]) => r.length);
	return /* @__PURE__ */ jsx("div", {
		className: "cv",
		children: /* @__PURE__ */ jsxs(VSection, {
			kind: "Event",
			title: "Events & notes",
			count: items.length,
			hint: "what the cluster reports, newest first",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "evbar",
					role: "group",
					"aria-label": "Filter events",
					children: [
						["all", `All ${items.length}`],
						["warn", `Warnings ${warn}`],
						["normal", "Normal"]
					].map(([k, l]) => /* @__PURE__ */ jsx("button", {
						type: "button",
						className: only === k ? "on" : "",
						"aria-pressed": only === k,
						onClick: () => setOnly(k),
						children: l
					}, k))
				}),
				!rows.length && /* @__PURE__ */ jsx("p", {
					className: "dim",
					children: "Nothing yet. Events appear as pods are scheduled, pulled, started and killed."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "log",
					children: groups.map(([b, rs]) => /* @__PURE__ */ jsxs("div", {
						className: "evgrp",
						children: [/* @__PURE__ */ jsx("div", {
							className: "evgrp-h",
							children: b
						}), rs.map((r) => {
							const i = r.item;
							return /* @__PURE__ */ jsxs("div", {
								className: "lg " + i.type + (r.fresh ? " enter" : "") + (r.leaving ? " leaving" : ""),
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "ev-t",
										children: PG.fmtAge(sim.clock - i.t)
									}),
									/* @__PURE__ */ jsx("i", {
										className: "ev-dot " + (i.type === "Warning" ? "warn" : i.type === "sim" ? "sim" : "ok"),
										"aria-hidden": "true"
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "ev-b",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "ev-h",
											children: [
												/* @__PURE__ */ jsx(KindTag, {
													kind: i.kind,
													label: i.kind + (i.name ? "/" + i.name : ""),
													size: 12
												}),
												i.ns && /* @__PURE__ */ jsx("span", {
													className: "nspill",
													children: i.ns
												}),
												/* @__PURE__ */ jsx("b", { children: i.reason })
											]
										}), /* @__PURE__ */ jsx("div", {
											className: "ev-m",
											children: i.text
										})]
									})
								]
							}, r.key);
						})]
					}, b))
				})
			]
		})
	});
}
//#endregion
//#region src/playground/views/Inspector.jsx
function Inspector() {
	const { inspect, sim } = store;
	if (!inspect) return null;
	const cl = sim.clusters[inspect.cl];
	if (!cl) return null;
	let o = null;
	if (inspect.k === "nodes") {
		const n = cl.nodeByName(inspect.n);
		o = n && PG.nodeObj(cl, n);
	} else o = cl.find(inspect.k, inspect.n, inspect.ns);
	const close = () => {
		store.inspect = null;
		store.bump();
	};
	if (!o) return /* @__PURE__ */ jsxs("div", {
		className: "insp",
		children: [/* @__PURE__ */ jsx("button", {
			className: "close",
			onClick: close,
			children: "×"
		}), /* @__PURE__ */ jsxs("div", {
			className: "dim",
			children: [inspect.n, " no longer exists"]
		})]
	});
	const txt = inspect.mode === "yaml" ? PG.yaml.dump(PG.cleanForOutput(cl, inspect.k, o)) : PG.DESC[inspect.k] ? PG.DESC[inspect.k](cl, o) : PG.yaml.dump(PG.cleanForOutput(cl, inspect.k, o));
	const mode = (m) => () => {
		inspect.mode = m;
		store.bump();
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "insp",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "ih",
			children: [
				/* @__PURE__ */ jsxs("b", { children: [
					PG.KINDS[inspect.k].kind,
					" ",
					inspect.n
				] }),
				/* @__PURE__ */ jsx("button", {
					className: inspect.mode !== "yaml" ? "on" : "",
					onClick: mode("describe"),
					children: "describe"
				}),
				/* @__PURE__ */ jsx("button", {
					className: inspect.mode === "yaml" ? "on" : "",
					onClick: mode("yaml"),
					children: "yaml"
				}),
				/* @__PURE__ */ jsx("button", {
					className: "close",
					onClick: close,
					children: "×"
				})
			]
		}), /* @__PURE__ */ jsx("pre", { children: txt })]
	});
}
//#endregion
//#region src/playground/VizPane.jsx
var TABS = [
	["cluster", "Cluster"],
	["docker", "Docker"],
	["config", "Config & access"],
	["helm", "Helm"],
	["files", "Files"],
	["log", "Events"]
];
var VIEWS = {
	cluster: ClusterView,
	docker: DockerView,
	config: ConfigView,
	helm: HelmView,
	files: FilesView,
	log: EventsView
};
function useFrozenWhileSelecting(id, element, view) {
	const last = useRef(element);
	const lastView = useRef(view);
	if (lastView.current !== view) {
		lastView.current = view;
		last.current = element;
		return element;
	}
	const g = window.getSelection();
	const host = document.getElementById(id);
	if (!!(g && !g.isCollapsed && g.anchorNode && host && host.contains(g.anchorNode))) {
		store.renderHeld = true;
		return last.current;
	}
	last.current = element;
	return element;
}
function VizPane({ only = null }) {
	useStore();
	const View = VIEWS[only || store.vizTab];
	const body = useFrozenWhileSelecting("vizbody", /* @__PURE__ */ jsx(View, {}), only || store.vizTab);
	const insp = useFrozenWhileSelecting("insp", /* @__PURE__ */ jsx(Inspector, {}), "insp");
	return /* @__PURE__ */ jsxs("section", {
		id: "vizpane",
		children: [
			/* @__PURE__ */ jsx("div", {
				id: "viztabs",
				role: "tablist",
				"aria-label": "Views",
				hidden: !!only,
				onKeyDown: tabKeys,
				children: TABS.map(([t, label]) => /* @__PURE__ */ jsx("button", {
					role: "tab",
					"aria-selected": store.vizTab === t,
					tabIndex: store.vizTab === t ? 0 : -1,
					className: "vtab" + (store.vizTab === t ? " on" : ""),
					onClick: () => store.setViz(t),
					children: label
				}, t))
			}),
			/* @__PURE__ */ jsx("div", {
				id: "vizbody",
				children: body
			}),
			/* @__PURE__ */ jsx("div", {
				id: "insp",
				children: insp
			})
		]
	});
}
//#endregion
export { store as a, selText as c, SYSTEM_NS as i, PG as l, TerminalPane as n, useStore as o, Icon as r, useStoreSel as s, VizPane as t };
