// Output (types along with the playhead) / Problems / Heap, under the editor.
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { useBench, useStep, type Bench } from './bench';
import { escapeTool } from './tools';

type Tab = 'output' | 'problems' | 'allocs';
const plural = (n: number, word: string) => n + ' ' + word + (n === 1 ? '' : 's');

function Output({ b }: { b: Bench }) {
  useStep(b);
  const ref = useRef<HTMLPreElement>(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; });
  const cur = b.cur, p = b.player, r = b.result;
  let body;
  if (!cur || !p?.trace) body = <><span className="prompt">$</span> <span className="meta">ready — press Run</span></>;
  else {
    const out = cur.s.stdout ?? cur.s.output ?? '', finished = cur.i === p.len - 1, stderr = r?.stderr?.trimEnd();
    body = <>
      <span className="prompt">$</span> <span className="meta">go run main.go</span>{'\n'}{out}
      {!finished ? <span className="caret" /> : stderr && (r?.exitStatus || r?.code)
        ? <><span className="err">{stderr}</span>{/exit status \d+$/.test(stderr) ? null : <>{'\n'}<span className="meta">exit status {r?.exitStatus || 1}</span></>}</>
        : <span className="meta">program exited</span>}
    </>;
  }
  return <pre className="console-body scroll" id="console-body" role="tabpanel" aria-live="polite" ref={ref}>{body}</pre>;
}

export function Console({ b }: { b: Bench }) {
  useBench(b);
  const [tab, setTab] = useState<Tab>('output'), [collapsed, setCollapsed] = useState(false);
  const objects = b.allocs.reduce((n, x) => n + x.objects, 0), moved = b.allocs.reduce((n, x) => n + x.moved.length, 0);
  const focus = (line: number) => b.editor?.focusLine(line);
  const tabBtn = (id: Tab, label: string, count = 0, title?: string) => (
    <button className="tab" role="tab" id={'tab-' + id} type="button" aria-selected={tab === id} aria-controls="console-body" title={title} onClick={() => setTab(id)}>
      {label}{count ? <span className="count" id={id === 'allocs' ? 'alloc-count' : 'problem-count'}>{count}</span> : null}
    </button>
  );
  return (
    <div className={'console' + (collapsed ? ' collapsed' : '')} id="console">
      <div className="console-head">
        <div role="tablist" aria-label="Console" style={{ display: 'flex' }}>
          {tabBtn('output', 'Output')}
          {tabBtn('problems', 'Problems', b.problems.length)}
          {tabBtn('allocs', 'Heap', objects, 'What lands on the heap, line by line (teaching model)')}
        </div>
        <span className="spacer" />
        {b.exit && <span className={b.exit.cls} id="exit-chip">{b.exit.text}</span>}
        <button className="icon-btn" id="console-toggle" type="button" aria-label="Collapse console" aria-expanded={!collapsed} style={{ width: 26, height: 26 }} onClick={() => setCollapsed((c) => !c)}>
          <Icon name="chevron" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
        </button>
      </div>
      {tab === 'output' ? <Output b={b} /> : (
        <pre className="console-body scroll" id="console-body" role="tabpanel" aria-live="polite">
          {tab === 'problems' ? (b.problems.length
            ? b.problems.map((d, k) => <button key={k} className="problem" type="button" onClick={() => focus(d.line)}>● main.go:{d.line}:{d.column || 1}  {d.message}</button>)
            : <span className="meta">No problems. The checker found nothing to fix.</span>)
          : <>
            {b.allocs.length ? <>
              <span className="meta">{plural(objects, 'heap object')} drawn, {plural(moved, 'variable')} moved to the heap (simplified model). Busiest lines first:</span>{'\n'}
              {b.allocs.map((x) => <button key={x.line} className="problem heap-line" type="button" onClick={() => focus(x.line)}>
                main.go:{x.line}  {x.objects ? plural(x.objects, 'object') : ''}{x.moved.map((m) => (x.objects ? ' · ' : '') + m.diagnostic + ': ' + m.reason).join('')}
              </button>)}
            </> : <span className="meta">{b.player?.trace ? 'Nothing on the heap. Everything stayed on the stack.' : 'Run the program to see what lands on the heap.'}</span>}
            {b.player?.trace && <>{'\n'}<button className="btn sm" type="button" onClick={() => escapeTool(b)}>Compare with the real Go compiler…</button></>}
          </>}
        </pre>
      )}
    </div>
  );
}
