// Dialog bodies the workbench opens: share, escape check, presenter note, QR code, one answer, AI tutor.
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { HighlightedCode } from '../HighlightedCode';
import { Modal } from '../shell/Dialogs';
import { closeDialog, openTool, toast } from '../../lib/shell';
import { copyText } from '../../lib/share';
import { loadLabs } from '../../lib/run';
import { store } from '../../lib/store';
import { esc } from '../../lib/data';
import { notes, saveNotes, srcHash, TUTOR_KEY, VIDEO_MAX, videoType, type Bench, type Escape } from './bench';
import { compareEscapes, parseGcflags, type Verdict } from './escapes';

let seq = 0; // a fresh key per opening, so a reopened tool starts clean

/* ---------- share ---------- */
export function ShareDialog({ b, links, onClose }: { b: Bench; links: { link: string; embed: string } | null; onClose: () => void }) {
  const linkRef = useRef<HTMLInputElement>(null), embedRef = useRef<HTMLTextAreaElement>(null);
  const p = b.player, can = !!p?.trace;
  const frame = links ? '<iframe src="' + esc(links.embed) + '" width="720" height="420" style="border:0;border-radius:8px" title="A Go program running in gothik" loading="lazy"></iframe>' : '';
  const video = links ? videoType() : undefined;
  return (
    <Modal open={!!links} labelledBy="share-title" width={560} onClose={onClose}>
      <div className="dialog-head"><h2 id="share-title">Share this program</h2><button className="icon-btn" type="button" data-close aria-label="Close"><Icon name="x" /></button></div>
      {links && <div className="dialog-body share-body">
        <div className="field"><span>Link. The code is inside the link; nothing is uploaded.</span>
          <div className="share-row"><input className="input" id="share-link" ref={linkRef} readOnly value={links.link} aria-label="Share link" /><button className="btn sm primary" type="button" onClick={() => copyText(links.link, linkRef.current)}>Copy</button></div>
        </div>
        <div className="field"><span>Embed in a blog post or doc</span>
          <textarea className="input" id="share-embed" ref={embedRef} rows={3} readOnly aria-label="Embed code" value={frame} />
          <div><button className="btn sm" type="button" onClick={() => copyText(frame, embedRef.current)}>Copy embed code</button></div>
        </div>
        <div className="field"><span>{can ? 'Picture of step ' + (p!.idx + 1) + ' with its caption' : 'Run the program to export a picture'}</span>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className="btn sm" type="button" disabled={!can} onClick={() => b.exportImage('png')}>Download PNG</button>
            <button className="btn sm" type="button" disabled={!can} onClick={() => b.exportImage('svg')}>Download SVG</button>
            {video && <button className="btn sm" type="button" disabled={!can} title={'Steps 1 to ' + Math.min(p?.len ?? 0, VIDEO_MAX) + ', one per beat, with captions'} onClick={() => { onClose(); b.recordVideo(); }}>Record video</button>}
          </div>
        </div>
      </div>}
    </Modal>
  );
}

/* ---------- escape check: the model vs go build -gcflags=-m ---------- */
const TONE: Record<Verdict, string> = { agree: 'var(--ok)', disagree: 'var(--bad)', 'compiler only': 'var(--signal)', 'model only': 'var(--signal)' };
function EscapeCheck({ model, source }: { model: Escape[]; source: string }) {
  const [text, setText] = useState('');
  const compiler = parseGcflags(text), rows = compareEscapes(compiler, model);
  const count = (v: Verdict) => rows.filter((r) => r.verdict === v).length;
  return (
    <>
      <p className="dim" style={{ fontSize: 13 }}>gothik decides heap or stack with a few labelled rules. The real compiler decides with escape analysis. Save this program as <code>main.go</code>, run <code>go build -gcflags=-m main.go</code>, and paste the output here.</p>
      <div className="row"><button className="btn sm" type="button" onClick={() => copyText(source)}>Copy program</button><button className="btn sm" type="button" onClick={() => copyText('go build -gcflags=-m main.go')}>Copy command</button></div>
      <textarea className="input mono" id="gcflags-in" rows={7} style={{ height: 'auto', padding: '8px 10px', fontSize: 12 }} placeholder="./main.go:8:2: moved to heap: p" aria-label="Compiler output" value={text} onChange={(e) => setText(e.target.value)} />
      <div id="gcflags-out" aria-live="polite">
        {!text ? null : !compiler.length ? <p className="faint" style={{ fontSize: 12 }}>No escape lines found yet. Lines look like <code>./main.go:8:2: moved to heap: p</code>.</p> : <>
          <p style={{ fontSize: 13 }}><b>{count('agree')}</b> agree · <b>{count('disagree')}</b> disagree · <b>{count('compiler only')}</b> only the compiler reports · <b>{count('model only')}</b> only the model reports</p>
          <div className="table-view" style={{ position: 'static', maxHeight: 340, overflow: 'auto' }}><table className="feat"><thead><tr><th>Line</th><th>Compiler</th><th>gothik model</th><th>Verdict</th></tr></thead><tbody>
            {rows.map((r, k) => <tr key={k}><td className="mono">{r.line}</td><td className="mono">{r.compiler}</td><td className="mono">{r.model}</td><td><b style={{ color: TONE[r.verdict] }}>{r.verdict}</b><br /><span className="faint" style={{ fontSize: 11 }}>{r.why || ''}</span></td></tr>)}
          </tbody></table></div>
        </>}
      </div>
    </>
  );
}
export function escapeTool(b: Bench) {
  if (!b.player?.trace) { toast('Run a program first.'); return; }
  openTool('Check the model against the Go compiler', <EscapeCheck key={++seq} model={b.player.trace.at(-1)?.escape || []} source={b.editor.value} />);
}

/* ---------- presentation: a note per step, QR code ---------- */
function NoteEditor({ hash, i }: { hash: string; i: number }) {
  const [v, setV] = useState(() => notes()[hash]?.[i] || '');
  const save = (text: string) => { const all = notes(); all[hash] = { ...(all[hash] || {}) }; if (text) all[hash][i] = text; else delete all[hash][i]; saveNotes(all); closeDialog(); };
  return (
    <>
      <p className="dim" style={{ fontSize: 13 }}>Shown under the stage whenever this program reaches this step in presentation mode. Saved on this device.</p>
      <textarea className="input" id="note-in" rows={3} style={{ height: 'auto', padding: '8px 10px' }} maxLength={300} autoFocus value={v} onChange={(e) => setV(e.target.value)} />
      <div className="row"><button className="btn primary sm" type="button" onClick={() => save(v.trim())}>Save note</button><button className="btn sm ghost" type="button" onClick={() => save('')}>Remove</button></div>
    </>
  );
}
export function noteTool(b: Bench) {
  const p = b.player; if (!p?.trace) return;
  openTool('Note for step ' + (p.idx + 1), <NoteEditor key={++seq} hash={srcHash(b.editor.value)} i={p.idx} />);
}
export async function qrTool(b: Bench) {
  const [{ link }, { GothikQR }] = await Promise.all([b.shareLinks(), loadLabs()]);
  if (!GothikQR) { toast('QR codes are not available in this build.'); return; }
  let svg: string;
  try { svg = GothikQR.svg(link, { ecc: 'L', border: 4 }); } catch { toast('This program is too long for a QR code. Share the link instead.'); return; }
  openTool('Scan to open this program', <><div className="qr-box" dangerouslySetInnerHTML={{ __html: svg }} /><p className="dim" style={{ fontSize: 12, textAlign: 'center' }}>The code holds the whole program; nothing is uploaded.</p></>);
}

export function solutionTool(source: string) {
  openTool('One way to solve it', <><p className="dim" style={{ fontSize: 13 }}>Other answers can be right too. Copy what helps.</p><HighlightedCode key={++seq} source={source} className="code-block" /></>);
}

/* ---------- AI tutor (hosted builds; the learner's own API key) ---------- */
const answerHTML = (a: string) => esc(a).replace(/```(?:go)?\n?([\s\S]*?)```/g, '<pre class="code-block">$1</pre>').replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
function Tutor({ b }: { b: Bench }) {
  const [saved] = useState(() => store.get(TUTOR_KEY, ''));
  const [key, setKey] = useState(b.tutorKey || saved), [remember, setRemember] = useState(!!saved), [keyOpen, setKeyOpen] = useState(!(saved || b.tutorKey));
  const [log, setLog] = useState(b.tutorLog), [busy, setBusy] = useState(false), [q, setQ] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = 1e9; }, [log, busy]);
  const add = (who: string, html: string) => setLog(b.tutorAdd(who, html));
  const keyNow = (k = key, keep = remember) => b.saveTutorKey(k, keep);
  async function ask(question: string) {
    if (!question.trim() || busy) return;
    keyNow(); setBusy(true);
    add('me', esc(question));
    try { add('bot', answerHTML(await b.askTutor(question))); }
    catch (e) { add('err', esc((e as Error).message)); if ((e as { kind?: string }).kind === 'key') setKeyOpen(true); }
    finally { setBusy(false); }
  }
  return (
    <>
      <p className="dim" style={{ fontSize: 12 }}>Your question, this program and the current step are sent to Anthropic with your own API key. Answers come from Claude and can be wrong; the stage is the ground truth for what gothik models.</p>
      <details className="tutor-key" open={keyOpen} onToggle={(e) => setKeyOpen(e.currentTarget.open)}><summary>API key</summary>
        <div className="row" style={{ marginTop: 6 }}>
          <input className="input mono" id="tutor-key" type="password" autoComplete="off" placeholder="sk-ant-…" aria-label="Anthropic API key" value={key} onChange={(e) => setKey(e.target.value)} style={{ flex: 1 }} />
          <label className="switch"><input type="checkbox" id="tutor-remember" checked={remember} onChange={(e) => { setRemember(e.target.checked); keyNow(key, e.target.checked); }} />Remember on this device</label>
        </div>
      </details>
      <div className="tutor-log" id="tutor-log" aria-live="polite" ref={logRef}>
        {log.map((m, k) => <div key={k} className={'tutor-msg ' + m.who} dangerouslySetInnerHTML={{ __html: m.html }} />)}
        {busy && <div className="tutor-msg bot faint">Thinking…</div>}
      </div>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn sm" type="button" onClick={() => ask('Explain what is happening at this step.')}>Explain this step</button>
        <button className="btn sm" type="button" onClick={() => ask('Give me a hint for what to look at next, without the answer.')}>Give me a hint</button>
        <button className="btn sm" type="button" onClick={() => ask('Why does my program print what it prints?')}>Why this output?</button>
      </div>
      <form className="row" id="tutor-form" onSubmit={(e) => { e.preventDefault(); const x = q; setQ(''); ask(x); }}>
        <input className="input" id="tutor-q" placeholder="Ask about this program…" aria-label="Your question" style={{ flex: 1 }} maxLength={1000} autoFocus value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn sm primary" type="submit">Ask</button>
      </form>
    </>
  );
}
export function tutorTool(b: Bench) {
  if (b.tutorSrc !== b.editor.value) { b.tutorChat = []; b.tutorLog = []; b.tutorSrc = b.editor.value; } // a new program starts a new conversation
  openTool('Ask the tutor', <Tutor key={++seq} b={b} />);
}
