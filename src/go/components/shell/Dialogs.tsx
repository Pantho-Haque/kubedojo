import { useRouter } from '../../lib/router';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../Icon';
import { D, LAB_TABS } from '../../lib/data';
import { BASE, href } from '../../lib/routes';
import { closeDialog, fuzzy, openKeys, openPalette, toast, useCommands, useDialog, type Command } from '../../lib/shell';
import { LANGS, getSettings, setSetting, useSettings, useT } from '../../lib/settings';
import { P, useProgress } from '../../lib/progress';
import { useCatalog } from '../../lib/packs';
import { download } from '../../lib/share';

/** A native modal <dialog> driven by `open`. Clicking the backdrop or a [data-close] element closes it. */
export function Modal({ open, id, label, labelledBy, width, className, children, onClose = closeDialog }: { open: boolean; id?: string; label?: string; labelledBy?: string; width?: number; className?: string; children: ReactNode; onClose?: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  return (
    <dialog ref={ref} id={id} className={className} aria-label={label} aria-labelledby={labelledBy} style={width ? { width: `min(${width}px, calc(100vw - 32px))` } : undefined}
      onClose={onClose} onClick={(e) => { if (e.target === ref.current || (e.target as HTMLElement).closest('[data-close]')) ref.current?.close(); }}>
      {open ? children : null}
    </dialog>
  );
}
function Head({ id, title }: { id: string; title: string }) {
  return <div className="dialog-head"><h2 id={id}>{title}</h2><button className="icon-btn" type="button" data-close aria-label="Close"><Icon name="x" /></button></div>;
}

/* ---------- command palette ---------- */
type Item = { kind: string; title: string; hint?: string; keys?: string; run: () => void };
function Palette({ initial }: { initial: string }) {
  const router = useRouter(), commands = useCommands(), { lessons, programs, tracks } = useCatalog();
  const [q, setQ] = useState(initial), [sel, setSel] = useState(0);
  const go = (to: string) => () => router.push(to);
  const items: Item[] = useMemo(() => [
    ...commands.map((c: Command) => ({ ...c })),
    ...lessons.map((l) => ({ kind: 'lesson', title: l.id + '  ' + l.title, hint: tracks.find((t) => t.id === l.track)?.title, run: go(href.lesson(l.id)) })),
    ...programs.map((p) => ({ kind: 'example', title: p.title, hint: p.id, run: go(href.program(p.id)) })),
    ...D.glossary.map((g) => ({ kind: 'term', title: g.term, hint: (g.beginner || '').slice(0, 60), run: go(href.glossary + '#' + encodeURIComponent(g.term)) })),
    ...([['Learn', href.learn], ['Playground', href.playground], ['Articles', href.articles], ['Reading shelf', href.reading], ['Glossary', href.glossary], ['Go gotchas', href.gotchas], ['Go interview questions', href.interview], ['Daily puzzle', href.puzzle], ['Compare two programs', href.compare()], ['Internals lab', href.internals(LAB_TABS[0])], ['Import a real Go trace', href.internals('trace')], ['About gothik', href.about], ['Home', href.home]] as const).map(([title, to]) => ({ kind: 'go to', title, run: go(to) })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [commands, lessons, programs, tracks]);
  const list = useMemo(() => {
    const scored = [];
    for (const it of items) { const m = fuzzy(q.trim(), it.title); if (m) scored.push({ it, m, s: m.score + (it.kind === 'command' ? 8 : 0) }); }
    return scored.sort((a, b) => b.s - a.s).slice(0, 60);
  }, [items, q]);
  // close the native dialog first, so a command can move focus (e.g. into the editor)
  const run = (i: number) => { const x = list[i]; if (!x) return; (document.getElementById('palette') as HTMLDialogElement | null)?.close(); closeDialog(); x.it.run(); };
  useEffect(() => { document.getElementById('pal-' + sel)?.scrollIntoView({ block: 'nearest' }); }, [sel]);
  return (
    <>
      <div className="palette-input"><Icon name="search" />
        <input autoFocus value={q} placeholder="Type a lesson, example, term or command…" autoComplete="off" spellCheck={false} role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list" aria-activedescendant={list.length ? 'pal-' + sel : ''}
          onChange={(e) => { setQ(e.target.value); setSel(0); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => (s + 1) % Math.max(1, list.length)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => (s - 1 + list.length) % Math.max(1, list.length)); }
            if (e.key === 'Enter') { e.preventDefault(); run(sel); }
          }} />
      </div>
      <ul className="palette-list scroll" id="palette-list" role="listbox" aria-label="Results">
        {list.length ? list.map((x, i) => (
          <li key={x.it.kind + x.it.title + i} role="option" id={'pal-' + i} aria-selected={i === sel} onClick={() => run(i)} onMouseMove={() => setSel(i)}>
            <span className="kind">{x.it.kind}</span>
            <span>{x.m.parts.map(([txt, hit], k) => (hit ? <mark key={k}>{txt}</mark> : txt))}</span>
            {x.it.keys ? <span className="hint"><kbd>{x.it.keys}</kbd></span> : x.it.hint ? <span className="hint">{x.it.hint}</span> : null}
          </li>
        )) : <li className="dim" style={{ cursor: 'default' }}>No matches</li>}
      </ul>
      <div className="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>
    </>
  );
}

/* ---------- settings ---------- */
function Seg<K extends 'lang' | 'theme' | 'motion' | 'depth'>({ k, opts }: { k: K; opts: [string, string][] }) {
  const s = useSettings(), t = useT();
  return <div className="seg">{opts.map(([v, label]) => <button key={v} type="button" aria-pressed={String(s[k]) === v} onClick={() => setSetting(k, v)}>{t(label)}</button>)}</div>;
}
function SettingsBody() {
  const s = useSettings(), t = useT(), Pr = useProgress(), { lessons } = useCatalog();
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const id = setTimeout(() => setArmed(false), 3000); return () => clearTimeout(id); }, [armed]);
  return (
    <div className="dialog-body">
      <div className="field"><span>{t('Language')}</span><Seg k="lang" opts={LANGS} />{s.lang !== 'en' && <span className="faint" style={{ fontSize: 12 }}>{t('The interface is translated. Lessons, narration and readings are in English for now.')}</span>}</div>
      <div className="field"><span>{t('Theme')}</span><Seg k="theme" opts={[['system', 'System'], ['dark', 'Dark'], ['light', 'Light']]} /></div>
      <div className="field"><span>{t('Motion')}</span><Seg k="motion" opts={[['system', 'System'], ['full', 'Full'], ['reduce', 'Reduced']]} /></div>
      <div className="field"><span>{t('Narration')}</span><Seg k="depth" opts={[['simple', 'Simple words'], ['hood', 'Under the hood']]} /></div>
      <div className="field"><span>{t('Editor')}</span><div className="row">
        <label className="switch"><input type="checkbox" checked={s.live} onChange={(e) => setSetting('live', e.target.checked)} />{t('Run as I type')}</label>
        <label className="switch"><input type="checkbox" checked={s.tabs} onChange={(e) => setSetting('tabs', e.target.checked)} />{t('Indent with tabs')}</label>
      </div></div>
      <label className="field"><span>{t('Editor font size')} · <b>{s.editorSize}px</b></span><input type="range" min={12} max={18} step={0.5} value={s.editorSize} onChange={(e) => setSetting('editorSize', Number(e.target.value))} /></label>
      <div className="field"><span>{t('Progress')} ({Pr.count()}/{lessons.length})</span>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="btn sm" type="button" onClick={() => download(new Blob([P.export()], { type: 'application/json' }), 'gothik-progress.json')}>{t('Export…')}</button>
          <label className="btn sm" style={{ cursor: 'pointer' }}>{t('Import…')}<input type="file" accept="application/json,.json" hidden onChange={async (e) => {
            const f = e.target.files?.[0]; e.target.value = ''; if (!f) return;
            try { P.import(await f.text()); toast('Progress imported.'); } catch (err) { toast((err as Error).message); }
          }} /></label>
          <button className="btn sm ghost" type="button" style={{ color: 'var(--bad)' }} onClick={() => { if (armed) { P.reset(); toast('Progress reset.'); closeDialog(); } else setArmed(true); }}>{t(armed ? 'Click again to reset' : 'Reset progress')}</button>
        </div>
        <p className="faint" style={{ fontSize: 12 }}>{t('Everything stays in this browser. Nothing is sent anywhere.')}</p>
      </div>
    </div>
  );
}

const KEYS: [string, string][] = [['⌘K / Ctrl K', 'Command palette'], ['⌘↵ / Ctrl ↵', 'Run'], ['Space or K', 'Play / pause'], ['→ or L', 'Step forward'], ['← or J', 'Step back'], ['Home / End', 'First / last step'], ['[ and ]', 'Previous / next big event'], ['F', 'Fit the stage'], ['+ / −', 'Zoom'], ['⌘B / Ctrl B', 'Toggle guide'], ['⌘/ / Ctrl /', 'Comment line'], ['Esc then Tab', 'Leave the editor'], ['V', 'Read steps aloud'], ['P', 'Presentation mode'], ['?', 'This list']];

export function Dialogs() {
  const d = useDialog(), t = useT();
  return (
    <>
      <Modal open={d.open === 'palette'} id="palette" label="Command palette"><Palette initial={d.query || ''} /></Modal>
      <Modal open={d.open === 'settings'} labelledBy="settings-title" width={520}><Head id="settings-title" title={t('Settings')} /><SettingsBody /></Modal>
      <Modal open={d.open === 'keys'} labelledBy="keys-title" width={560}><Head id="keys-title" title={t('Keyboard shortcuts')} />
        <div className="dialog-body"><div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px', fontSize: 13 }}>
          {KEYS.map(([k, desc]) => [<span key={k}>{k.split(' or ').map((x, i) => <span key={x}>{i ? ' or ' : ''}<kbd>{x}</kbd></span>)}</span>, <span key={k + 'd'} className="dim">{desc}</span>])}
        </div></div>
      </Modal>
      <Modal open={d.open === 'tool'} labelledBy="tool-title" width={760}><Head id="tool-title" title={d.tool?.title || ''} /><div className="dialog-body">{d.tool?.body}</div></Modal>
    </>
  );
}

/** ⌘K palette, ? shortcuts, and first-visit bookkeeping. */
export function GlobalKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey, el = e.target as HTMLElement;
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); if (document.querySelector('dialog[open] .palette-input')) closeDialog(); else openPalette(); return; }
      if (e.key === '?' && !el.closest?.('input, textarea, select, dialog')) { e.preventDefault(); openKeys(); }
    };
    document.addEventListener('keydown', onKey);
    if (!getSettings().seen && location.pathname !== (BASE || '/')) setSetting('seen', true);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return null;
}
