import { memo, useLayoutEffect, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import { store, useStore } from './store.js';
import { selText, suggestFor } from './term.js';
import Icon, { tabKeys } from './Icon.jsx';

/* One terminal tab: scrollback, prompt + input with the grey suggestion, and the vi overlay while an editor is open. */
const TermView = memo(function TermView({ model, active }) {
  useSyncExternalStore(model.subscribe, model.getSnapshot);
  const elRef = useRef(null), outRef = useRef(null), inputRef = useRef(null), stick = useRef(true);
  const [atEnd, setAtEnd] = useState(true);
  const syncCaret = el => setAtEnd(el.selectionStart === el.value.length && el.selectionEnd === el.value.length);

  useLayoutEffect(() => {
    model.inputEl = inputRef.current;
    model.getCols = () => { const out = outRef.current; const pr = document.createElement('span'); pr.style.cssText = 'position:absolute;visibility:hidden;white-space:pre'; pr.textContent = 'M'.repeat(20); out.appendChild(pr); const cw = pr.getBoundingClientRect().width / 20 || 7.6; pr.remove(); return Math.max(30, Math.floor(out.clientWidth / cw) - 1); };
    return () => { model.inputEl = null; model.getCols = null; };
  }, [model]);
  // keep following new output, but do not yank the view down while you are reading older output
  useLayoutEffect(() => { const el = elRef.current; if (model.forceScroll || stick.current) el.scrollTop = el.scrollHeight; model.forceScroll = false; });

  const v = model.value; const sg = !model.running && atEnd && v ? suggestFor(v) : '';
  return (
    <div className="term" ref={elRef} style={{ display: active ? 'block' : 'none' }}
      onScroll={e => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150; }}
      onMouseUp={e => { if (!selText() && e.target !== inputRef.current) inputRef.current.focus(); }}>
      <div className="tout" ref={outRef}>
        {model.lines.map(l => l.cmd
          ? <div className="ln" key={l.id}><span className="prompt">{l.prompt}</span><span className="cmdtxt">{l.text}</span></div>
          : <div className={'ln' + (l.cls ? ' ' + l.cls : '')} style={l.pre ? { whiteSpace: 'pre' } : undefined} key={l.id}>{l.text}</div>)}
      </div>
      <div className={'tline' + (model.running ? ' busy' : '')}>
        <span className="prompt">{model.prompt()}</span>
        <span className="inw">
          <div className="ghost">{sg && sg.length < 200 ? <><i>{v}</i>{sg.slice(v.length)}</> : null}</div>
          <input className="tin" aria-label="Terminal input" ref={inputRef} value={v} spellCheck={false} autoCapitalize="off" autoComplete="off"
            onChange={e => { model.setValue(e.target.value); syncCaret(e.target); }}
            onKeyDown={e => model.key(e)}
            onKeyUp={e => syncCaret(e.currentTarget)} onClick={e => syncCaret(e.currentTarget)} onFocus={e => syncCaret(e.currentTarget)} onSelect={e => syncCaret(e.currentTarget)}
            onPaste={e => { const t = (e.clipboardData || window.clipboardData).getData('text'); if (t.includes('\n')) { e.preventDefault(); model.pasteLines(t); } }} />
        </span>
      </div>
    </div>
  );
});

/* Full-pane vi: every key goes to PG.Vi until :q. */
const VI_MAP = { ArrowLeft: 'Left', ArrowRight: 'Right', ArrowUp: 'Up', ArrowDown: 'Down' };
function ViOverlay({ model, active }) {
  const { vi } = model.vi; const ref = useRef(null), probe = useRef(null); const [, redraw] = useReducer(x => x + 1, 0);
  const measure = () => { const ov = ref.current; if (!ov) return; const cw = probe.current.getBoundingClientRect().width / 10 || 7.5; vi.cols = Math.max(20, Math.floor((ov.clientWidth - 20) / cw)); vi.rows = Math.max(5, Math.floor((ov.clientHeight - 12) / 18) - 1); vi.scroll(); };
  useLayoutEffect(() => {
    model.viEl = ref.current; const onResize = () => { measure(); redraw(); };
    window.addEventListener('resize', onResize); ref.current.focus(); measure(); redraw(); const raf = requestAnimationFrame(onResize);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(raf); model.viEl = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- set up once per editor
  measure(); const sc = vi.screen();
  const onKeyDown = e => {
    if (e.metaKey || e.altKey || (e.ctrlKey && e.shiftKey)) return; let k = null;
    if (e.ctrlKey && selText() && e.key.toLowerCase() === 'c') return;
    if (e.ctrlKey) { const c = e.key.toLowerCase(); if ('rfbdu'.includes(c) && c.length === 1) k = 'C-' + c; else if (c === 'c' || c === '[') k = c === 'c' ? 'C-c' : 'Escape'; else return; }
    else if (e.key.length === 1) k = e.key; else if (['Escape', 'Enter', 'Backspace', 'Delete', 'Tab', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) k = e.key; else if (VI_MAP[e.key]) k = VI_MAP[e.key]; else return;
    e.preventDefault(); e.stopPropagation(); vi.key(k); if (vi.done) model.finishVi(); else redraw();
  };
  const onPaste = e => { e.preventDefault(); if (vi.mode === 'n') return; for (const ch of (e.clipboardData.getData('text') || '').replace(/\r/g, '')) vi.key(ch === '\n' ? 'Enter' : ch === '\t' ? 'Tab' : ch); redraw(); };
  return (
    <div className="vi" tabIndex={0} ref={ref} style={{ display: active ? 'block' : 'none' }} onKeyDown={onKeyDown} onPaste={onPaste} onMouseUp={() => { if (!selText()) ref.current.focus(); }}>
      <div className="vi-t" style={{ height: vi.rows * 18 }}>
        {sc.rows.map((r, i) => {
          if (sc.mode === 'c' || i !== sc.cursor.row) return <div key={i} className={r === '~' ? 'vi-tl' : undefined}>{r || ' '}</div>;
          const c = Math.min(sc.cursor.col, r.length); const ch = r[c] || ' ';
          return <div key={i}>{r.slice(0, c)}<span className="vi-cur">{ch}</span>{r.slice(c + 1)}</div>;
        })}
      </div>
      <div className="vi-s"><span className="vi-m">{sc.bottom}{sc.mode === 'c' ? <span className="vi-cur"> </span> : null}</span><span className="vi-r">{sc.ruler}</span></div>
      <span className="vi-probe" ref={probe}>MMMMMMMMMM</span>
    </div>
  );
}

/* The banner above the terminal while `kubectl edit` waits for you */
function EditBar() {
  const pe = store.sim && store.sim.pendingEdit;
  return (
    <div id="editbar" hidden={!pe}>
      {pe && <>✏️ <b>kubectl edit {pe.title}</b> — the YAML is in <code>{pe.path}</code> &nbsp;{' '}
        <button id="ed-open" onClick={() => { store.vizTab = 'files'; store.openFile = pe.path; store.bump(); }}>Open in Files tab</button>{' '}
        <button id="ed-apply" className="go" onClick={() => { pe.result = 'apply'; store.sim.wake(); }}>Apply</button>{' '}
        <button id="ed-cancel" onClick={() => { pe.result = 'cancel'; store.sim.wake(); }}>Cancel</button></>}
    </div>
  );
}

export default function TerminalPane({ compact = false }) {
  useStore();
  const { terms, active } = store;
  return (
    <section id="termpane">
      <EditBar />
      <div id="tabs" role="tablist" aria-label="Terminals" hidden={compact} onKeyDown={tabKeys}>
        {terms.map(t => (
          <button key={t.uid} role="tab" aria-selected={t === active} tabIndex={t === active ? 0 : -1} className={'tab' + (t === active ? ' on' : '')} onClick={e => { if (e.target.classList.contains('x')) store.closeTerm(t); else store.showTerm(t); }}>
            {t.label}{t.label !== 'Terminal 1' && <> <span className="x" title="close">×</span></>}
          </button>
        ))}
        <button id="newtab" title="New terminal tab (up to 4)" aria-label="New terminal tab" onClick={() => store.addTerm()}><Icon name="plus" size={16} /></button>
      </div>
      <div id="termhost">
        {terms.map(t => <TermView key={t.uid} model={t} active={t === active} />)}
        {terms.map(t => t.vi && <ViOverlay key={'vi' + t.uid + ':' + t.vi.seq} model={t} active={t === active} />)}
      </div>
    </section>
  );
}
