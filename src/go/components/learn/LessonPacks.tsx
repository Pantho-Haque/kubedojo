// Lesson packs: a teacher's own lessons as a JSON file, validated field by field and run once at import
// (so predict-output questions grade against the real output). They stay on this device.
import { useState } from 'react';
import { D, type Lesson, type Program } from '../../lib/data';
import { packs, type Pack } from '../../lib/packs';
import { execute, traceOf } from '../../lib/run';
import { download } from '../../lib/share';
import { openTool, toast } from '../../lib/shell';
import { useHydrated, useStoreVersion } from '../../lib/store';

export const PACK_TEMPLATE = {
  gothikPack: 1, title: 'My first pack', author: 'Your name',
  programs: [{ id: 'my-shadow', title: 'Shadowing', source: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tx := 1\n\tif true {\n\t\tx := 2\n\t\t_ = x\n\t}\n\tfmt.Println(x)\n}\n' }],
  lessons: [{
    id: 'MY01', title: 'Shadowing with :=', level: 'Core', estimatedMinutes: 5,
    hook: 'A new variable with the same name hides the old one inside a block.',
    goals: ['Spot when := declares a new variable'],
    steps: [{ type: 'explain', text: 'Inside the if block, x := 2 declares a second x. The outer x is untouched.' }, { type: 'predict', text: 'What does the program print?' }, { type: 'try', text: 'Change := to = and run it again.' }],
    pitfalls: [{ claim: 'x := 2 changes x.', explanation: 'It declares a new x that only lives in the block.' }],
    examples: ['my-shadow'],
    quiz: [
      { id: 'q1', type: 'multiple-choice', question: 'What does x := 2 do inside the block?', choices: ['Assigns to the outer x', 'Declares a new x'], answer: 'Declares a new x', explanation: 'A short variable declaration in a new block always declares.' },
      { id: 'q2', type: 'predict-output', question: 'What does the example print?', example: 'my-shadow', explanation: 'The outer x is still 1.' },
    ],
  }],
};

/* eslint-disable @typescript-eslint/no-explicit-any -- the input is untrusted JSON, checked field by field */
export function validatePack(p: any): { errors: string[]; pack?: Pack } {
  const errors: string[] = [], str = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim() !== '' && v.length <= max, arr = (v: unknown): any[] => (Array.isArray(v) ? v : []);
  if (!p || typeof p !== 'object' || p.gothikPack !== 1) return { errors: ['This is not a gothik lesson pack: it needs "gothikPack": 1.'] };
  if (!str(p.title, 120)) errors.push('The pack needs a "title" (up to 120 characters).');
  const others = packs.list().filter((x) => x.title !== p.title);
  const takenL = new Set([...D.lessons.map((l) => l.id), ...others.flatMap((x) => x.lessons.map((l) => l.id))]);
  const takenP = new Set([...D.programs.map((g) => g.id), ...others.flatMap((x) => x.programs.map((g) => g.id))]);
  const programs: (Program & { pack: string })[] = [], progIds = new Set<string>();
  arr(p.programs).forEach((g, i) => {
    const at = 'programs[' + i + ']';
    if (!str(g?.id, 40) || !/^[\w-]+$/.test(g.id)) return errors.push(at + ' needs an "id" made of letters, digits, - or _.');
    if (takenP.has(g.id) || progIds.has(g.id)) return errors.push(at + ': the id "' + g.id + '" is already used.');
    if (!str(g.source, 65536)) return errors.push(at + ' needs "source" (a Go program, up to 64 KB).');
    progIds.add(g.id); programs.push({ id: g.id, title: str(g.title, 120) ? g.title : g.id, source: g.source, lesson: '', pack: p.title });
  });
  const lessons: Lesson[] = [], seen = new Set<string>(), LEVELS = ['Core', 'Extended', 'Advanced'];
  arr(p.lessons).forEach((l, i) => {
    const at = 'lessons[' + i + ']' + (l?.id ? ' (' + l.id + ')' : ''), errs: string[] = [];
    if (!str(l?.id, 24) || !/^[A-Za-z][\w-]+$/.test(l.id)) errs.push(at + ' needs an "id" such as MY01.');
    else if (takenL.has(l.id) || seen.has(l.id)) errs.push(at + ': the id is already used.');
    if (!str(l?.title, 120)) errs.push(at + ' needs a "title".');
    if (!str(l?.hook, 400)) errs.push(at + ' needs a one-sentence "hook".');
    const steps = arr(l?.steps).filter((x) => ['explain', 'predict', 'try'].includes(x?.type) && str(x.text, 2000)).map((x, k) => ({ id: 's' + k, type: x.type, text: x.text }));
    if (!steps.some((x) => x.type === 'explain')) errs.push(at + ' needs a step of type "explain".');
    const examples = arr(l?.examples).filter((x): x is string => typeof x === 'string');
    examples.filter((x) => !progIds.has(x)).forEach((x) => errs.push(at + ': example "' + x + '" is not in this pack\'s programs.'));
    const quiz: Lesson['quiz'] = [], qids = new Set<string>();
    arr(l?.quiz).forEach((q, k) => {
      const qa = at + ' quiz[' + k + ']';
      if (!str(q?.id, 40) || qids.has(q.id)) return errs.push(qa + ' needs a unique "id".');
      if (!str(q.question, 500)) return errs.push(qa + ' needs a "question".');
      qids.add(q.id);
      const base = { id: q.id, type: q.type, question: q.question, explanation: str(q.explanation, 1000) ? q.explanation : '' };
      if (q.type === 'multiple-choice') { const ch = arr(q.choices).filter((c) => str(c, 300)); if (ch.length < 2 || !ch.includes(q.answer)) return errs.push(qa + ': multiple-choice needs 2+ "choices" and an "answer" that is one of them.'); quiz.push({ ...base, choices: ch, answer: q.answer }); }
      else if (q.type === 'fill-blank') { if (!str(q.answer, 200)) return errs.push(qa + ': fill-blank needs an "answer".'); quiz.push({ ...base, answer: q.answer }); }
      else if (q.type === 'predict-output') { if (!progIds.has(q.example)) return errs.push(qa + ': predict-output needs "example" set to one of this pack\'s programs.'); quiz.push({ ...base, example: q.example }); }
      else errs.push(qa + ': "type" must be multiple-choice, fill-blank or predict-output.');
    });
    if (!quiz.length) errs.push(at + ' needs at least one quiz question.');
    errors.push(...errs);
    if (errs.length) return;
    seen.add(l.id);
    lessons.push({
      id: l.id, title: l.title, track: 'X', level: LEVELS.includes(l.level) ? l.level : 'Core', hook: l.hook,
      estimatedMinutes: Number.isFinite(l.estimatedMinutes) ? Math.max(1, Math.min(120, l.estimatedMinutes)) : 5,
      goals: arr(l.goals).filter((g) => str(g, 300)), steps, examples, quiz, sources: [], claims: [],
      pitfalls: arr(l.pitfalls).filter((x) => str(x?.claim, 500) && str(x?.explanation, 1000)).map((x) => ({ title: str(x.title, 120) ? x.title : '', claim: x.claim, explanation: x.explanation })),
      deeper: [], pack: p.title,
    } as Lesson);
  });
  if (!lessons.length && !errors.length) errors.push('The pack has no lessons.');
  for (const g of programs) g.lesson = lessons.find((l) => l.examples?.includes(g.id))?.id || '';
  return { errors, pack: { title: p.title, author: str(p.author, 120) ? p.author : '', lessons, programs, installed: Date.now() } };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function showErrors(list: string[]) {
  openTool('This lesson pack has problems', <>
    <p className="dim" style={{ fontSize: 13 }}>Nothing was installed. Fix these and import it again:</p>
    <ul className="pack-errors">{list.slice(0, 40).map((e, i) => <li key={i}>{e}</li>)}</ul>
  </>);
}

export async function installPack(raw: unknown) {
  const { errors, pack } = validatePack(raw);
  if (errors.length || !pack) return showErrors(errors);
  const runErrors: string[] = [];
  for (const g of pack.programs) { // record each program's real output for predict-output questions
    const r = await execute(g.source, { owner: 'pack' }), t = traceOf(r);
    if (!t) runErrors.push('programs: "' + g.id + '" did not run: ' + String(r.error || 'unknown error').replace(/^main\.go:/, 'line '));
    else g.expected = { stdout: t.at(-1).output ?? '' };
  }
  if (runErrors.length) return showErrors(runErrors);
  const ok = packs.save([...packs.list().filter((x) => x.title !== pack.title), pack]);
  toast(ok ? 'Installed “' + pack.title + '”: ' + pack.lessons.length + ' lesson' + (pack.lessons.length === 1 ? '' : 's') + '.' : 'Storage is blocked, so the pack could not be saved.');
}

export function LessonPacks() {
  useStoreVersion();
  const list = useHydrated() ? packs.list() : [];
  const [armed, setArmed] = useState<string | null>(null);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (file.size > 2e6) { toast('That file is too big for a lesson pack (2 MB max).'); return; }
    let raw; try { raw = JSON.parse(await file.text()); } catch { toast('That file is not valid JSON.'); return; }
    await installPack(raw);
  }
  return (
    <section className="achievements">
      <h2 className="mono">lesson packs</h2>
      <p className="dim" style={{ fontSize: 13 }}>Teachers and teams can write their own lessons as a JSON file. Imported lessons appear in an <b>Imported lessons</b> track and work like any other lesson. They stay on this device.</p>
      <div className="row" style={{ flexWrap: 'wrap', marginTop: 10 }}>
        <label className="btn sm primary" style={{ cursor: 'pointer' }}>Import a pack…<input type="file" id="pack-file" accept="application/json,.json" hidden onChange={onFile} /></label>
        <button className="btn sm" type="button" onClick={() => download(new Blob([JSON.stringify(PACK_TEMPLATE, null, 2)], { type: 'application/json' }), 'gothik-lesson-pack-template.json')}>Download a template</button>
      </div>
      {list.length > 0 && <ul className="pack-list">{list.map((x) => (
        <li key={x.title}>
          <strong>{x.title}</strong>
          <span className="dim">{x.lessons.length} lesson{x.lessons.length === 1 ? '' : 's'}{x.author ? ' · ' + String(x.author) : ''}</span>
          <button className="btn sm ghost" type="button" onClick={() => {
            if (armed !== x.title) { setArmed(x.title); return; }
            packs.save(packs.list().filter((p) => p.title !== x.title)); setArmed(null); toast('Pack removed.');
          }}>{armed === x.title ? 'Click again to remove' : 'Remove'}</button>
        </li>
      ))}</ul>}
    </section>
  );
}
