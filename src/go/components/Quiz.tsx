// A lesson's three questions (predict the output, multiple choice, fill the blank), graded
// locally and saved with progress. Shared by the lesson Check phase and the article page.
import { useState } from 'react';
import { md, type Lesson } from '../lib/data';
import { program } from '../lib/packs';
import { P, useProgress } from '../lib/progress';
import { useHydrated } from '../lib/store';
import { HighlightedCode } from './HighlightedCode';

const norm = (s: unknown) => String(s ?? '').replace(/\r/g, '').split('\n').map((l) => l.trim()).join('\n').trim();
// a stable order per question, so the right answer is not always the first button
function hash(t: string) { let h = 2166136261; for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619); return (h >>> 0).toString(36); }

export function Quiz({ lesson, onComplete }: { lesson: Lesson; onComplete?: () => void }) {
  useProgress();
  const hydrated = useHydrated();
  const saved = hydrated ? P.answers(lesson.id) : {};
  const [flash, setFlash] = useState<Record<string, 'right' | 'wrong'>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const total = lesson.quiz.length;
  const right = lesson.quiz.filter((q) => saved[q.id]?.correct).length;

  function answer(qi: number, value: string) {
    const q = lesson.quiz[qi];
    const expected = q.type === 'predict-output' ? program(q.example)?.expected?.stdout : q.answer;
    const said = String(value).trim().toLowerCase(), want = String(expected ?? '').trim().toLowerCase();
    const ok = q.type === 'predict-output' ? norm(value) === norm(expected) : said === want || (q.type === 'fill-blank' && want.includes('.') && said === want.split('.').pop());
    P.answer(lesson.id, q.id, value, ok);
    setFlash((f) => ({ ...f, [q.id]: ok ? 'right' : 'wrong' }));
    if (ok && lesson.quiz.every((x) => x.id === q.id || P.answers(lesson.id)[x.id]?.correct)) onComplete?.();
  }

  return (
    <div className="quiz">
      {lesson.quiz.map((q, qi) => {
        const rec = saved[q.id], state = flash[q.id] || (rec?.correct ? 'right' : '');
        const val = values[q.id] ?? rec?.value ?? '';
        const setVal = (v: string) => setValues((x) => ({ ...x, [q.id]: v }));
        let input;
        if (q.type === 'multiple-choice') {
          const choices = [...(q.choices || [])].sort((a, b) => hash(q.id + a).localeCompare(hash(q.id + b)));
          input = <div className="choices">{choices.map((c) => <button key={c} type="button" onClick={() => answer(qi, c)}>{c}</button>)}</div>;
        } else if (q.type === 'fill-blank') {
          input = <div className="row"><input className="input mono" style={{ flex: 1 }} placeholder="your answer" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') answer(qi, val); }} /><button className="btn sm" type="button" onClick={() => answer(qi, val)}>Check</button></div>;
        } else {
          input = <>
            <HighlightedCode source={program(q.example)?.source || ''} style={{ margin: 0, padding: '8px 10px', borderRadius: 6, background: 'var(--code-bg)', border: '1px solid var(--line)', fontSize: 12, maxHeight: 180, overflow: 'auto' }} />
            <textarea className="input mono" rows={2} style={{ height: 'auto', padding: '8px 10px' }} placeholder="exact output" value={val} onChange={(e) => setVal(e.target.value)} />
            <button className="btn sm" type="button" onClick={() => answer(qi, val)}>Check</button>
          </>;
        }
        return (
          <div key={q.id + (flash[q.id] || '')} className={'quiz-q ' + state}>
            <span className="eyebrow">Question {qi + 1} of {total}</span>
            <p style={{ color: 'var(--text)', fontWeight: 560 }}>{q.question}</p>
            {input}
            <p className="feedback" aria-live="polite">
              {state === 'right' ? <><span style={{ color: 'var(--ok)' }}>Correct.</span> <span dangerouslySetInnerHTML={{ __html: md(q.explanation || '') }} /></>
                : state === 'wrong' ? <><span style={{ color: 'var(--bad)' }}>Not quite.</span> {q.type === 'predict-output' ? 'Run it and step through the prints.' : 'Look at the lesson idea again.'}</> : null}
            </p>
          </div>
        );
      })}
      {right > 0 && <p className="dim" style={{ fontSize: 12 }}>{right} of {total} correct{right === total ? ' — lesson complete.' : ''}</p>}
    </div>
  );
}
