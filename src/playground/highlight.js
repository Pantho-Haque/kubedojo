// Syntax colours for the Files editor: YAML + Go templates ({{ … }}) + Dockerfile. Returns HTML (all text escaped).
export const esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const HC_CTRL = new Set(['if', 'else', 'end', 'range', 'with', 'define', 'template', 'block', 'include', 'break', 'continue', 'nil', 'true', 'false']);
const HC_FUNC = new Set(['toYaml', 'toJson', 'indent', 'nindent', 'quote', 'squote', 'default', 'required', 'not', 'and', 'or', 'eq', 'ne', 'lt', 'gt', 'le', 'ge', 'print', 'printf', 'println', 'sha256sum', 'tpl', 'lower', 'upper', 'title', 'trunc', 'trimSuffix', 'trimPrefix', 'trim', 'replace', 'contains', 'hasPrefix', 'hasSuffix', 'b64enc', 'b64dec', 'len', 'list', 'dict', 'set', 'get', 'has', 'empty', 'coalesce', 'ternary', 'join', 'split', 'lookup', 'fail', 'kindIs', 'typeOf', 'index', 'regexMatch', 'now', 'date', 'int', 'int64', 'toString', 'fromYaml', 'merge', 'keys', 'sortAlpha', 'semver', 'randAlphaNum', 'genCA', 'genSignedCert', 'sha1sum', 'nospace', 'cat', 'repeat', 'toStrings', 'uniq', 'first', 'last', 'rest', 'append']);
const sp = (c, t) => `<span class="${c}">${esc(t)}</span>`;
function hlAction(a) { // one {{ … }}
  const m = /^(\{\{-?\s*)([\s\S]*?)(\s*-?\}\}|)$/.exec(a); let out = sp('hd', m[1]); const body = m[2];
  if (/^\/\*/.test(body)) out += sp('hm', body); else out += body.replace(/("(?:[^"\\]|\\.)*"|`[^`]*`|\$?\.[\w.]*|\$\w*|\d+(?:\.\d+)?|[A-Za-z_]\w*|[|():=]|\s+|[\s\S])/g, (t) => /^["`]/.test(t) ? sp('hs', t) : /^\$?\./.test(t) || /^\$/.test(t) ? sp('hv', t) : /^\d/.test(t) ? sp('hn', t) : HC_CTRL.has(t) ? sp('hc', t) : HC_FUNC.has(t) ? sp('hf', t) : /^[|():=]$/.test(t) ? sp('hp', t) : esc(t));
  return `<span class="ha">${out}${m[3] ? sp('hd', m[3]) : ''}</span>`;
}
function hlLine(line, docker) {
  if (docker) { const dm = /^(\s*)(FROM|RUN|CMD|COPY|ADD|ENV|EXPOSE|WORKDIR|ENTRYPOINT|ARG|USER|LABEL|VOLUME|HEALTHCHECK|AS)\b(.*)$/i.exec(line); if (dm) return esc(dm[1]) + sp('hc', dm[2]) + esc(dm[3]).replace(/(--[\w-]+)/g, '<span class="hf">$1</span>'); if (/^\s*#/.test(line)) return sp('hm', line); }
  let out = '', i = 0; const km = /^(\s*(?:- )*)([A-Za-z_][\w./-]*|"[^"]*"|'[^']*')(:)(?=\s|$)/.exec(line);
  if (km) { out += esc(km[1]).replace(/-/g, '<span class="hp">-</span>') + sp('hk', km[2]) + sp('hp', ':'); i = km[0].length; }
  else { const dm = /^(\s*)(- )/.exec(line); if (dm) { out += esc(dm[1]) + sp('hp', '-') + ' '; i = dm[0].length; } }
  let word = ''; const flushW = () => { if (!word) return; out += /^-?\d+(\.\d+)?$/.test(word) ? sp('hn', word) : /^(true|false|null|~|yes|no)$/i.test(word) ? sp('hc', word) : esc(word); word = ''; };
  while (i < line.length) {
    const c = line[i];
    if (line.startsWith('{{', i)) { flushW(); const e = line.indexOf('}}', i); const end = e < 0 ? line.length : e + 2; out += hlAction(line.slice(i, end)); i = end; continue; }
    if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) { flushW(); out += sp('hm', line.slice(i)); i = line.length; break; }
    if (c === '"' || c === "'") { flushW(); let j = i + 1, buf = c; while (j < line.length && line[j] !== c) { if (line.startsWith('{{', j)) { out += sp('hs', buf); buf = ''; const e = line.indexOf('}}', j); const end = e < 0 ? line.length : e + 2; out += hlAction(line.slice(j, end)); j = end; continue; } if (line[j] === '\\') buf += line[j++]; buf += line[j++] || ''; } buf += line[j] || ''; out += sp('hs', buf); i = j + 1; continue; }
    if (/[\s,:[\]{}]/.test(c)) { flushW(); out += (c === ':' || c === '[' || c === ']' || c === '{' || c === '}' || c === ',') ? sp('hp', c) : esc(c); i++; continue; }
    if ((c === '|' || c === '>') && /^[|>][-+]?\s*$/.test(line.slice(i))) { flushW(); out += sp('hc', line.slice(i)); i = line.length; break; }
    word += c; i++;
  }
  flushW(); return out;
}
const hlText = (text, name) => { const docker = /(^|\/)Dockerfile/i.test(name || ''); return text.split('\n').map(l => hlLine(l, docker)).join('\n'); };
export { hlText };
