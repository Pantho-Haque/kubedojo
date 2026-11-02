// The model's heap decisions vs the real compiler's `go build -gcflags=-m` output.
import type { Escape } from './bench';

export type CompilerLine = { line: number; kind: 'heap' | 'escapes' | 'stack'; name: string; msg: string };
export type Verdict = 'agree' | 'disagree' | 'compiler only' | 'model only';
export type Row = { line: number; compiler: string; model: string; verdict: Verdict; why: string };

export function parseGcflags(text: string): CompilerLine[] {
  const out: CompilerLine[] = [];
  for (const raw of String(text).split('\n')) {
    const m = /^\s*(?:\.\/)?[^\s:]*\.go:(\d+):(\d+):\s*(.+?)\s*$/.exec(raw); if (!m) continue;
    const msg = m[3]; let x;
    if ((x = /^moved to heap: (.+)$/.exec(msg))) out.push({ line: +m[1], kind: 'heap', name: x[1], msg });
    else if ((x = /^(.+) escapes to heap$/.exec(msg))) out.push({ line: +m[1], kind: 'escapes', name: x[1], msg });
    else if ((x = /^(.+) does not escape$/.exec(msg))) out.push({ line: +m[1], kind: 'stack', name: x[1], msg });
  }
  return out;
}

export function compareEscapes(compiler: CompilerLine[], model: Escape[]): Row[] {
  const rows: Row[] = [], used = new Set<number>();
  const modelAt = (line: number, name: string | null) => model.findIndex((m, k) => !used.has(k) && m.site === line && (!name || m.name === name));
  for (const c of compiler.filter((c) => c.kind !== 'stack')) {
    const k = modelAt(c.line, c.kind === 'heap' ? c.name : null);
    if (k >= 0) { used.add(k); rows.push({ line: c.line, compiler: c.msg, model: model[k].diagnostic, verdict: 'agree', why: model[k].reason }); }
    else rows.push({ line: c.line, compiler: c.msg, model: '—', verdict: 'compiler only', why: c.kind === 'escapes' ? 'The model does not track every escape, such as values converted to interfaces for fmt calls.' : 'The model kept this on the stack.' });
  }
  model.forEach((m, k) => {
    if (used.has(k)) return;
    const stack = compiler.find((c) => c.kind === 'stack' && c.line === m.site);
    rows.push({ line: m.site, compiler: stack ? stack.msg : '—', model: m.diagnostic, verdict: stack ? 'disagree' : 'model only', why: m.reason });
  });
  return rows.sort((a, b) => a.line - b.line);
}
