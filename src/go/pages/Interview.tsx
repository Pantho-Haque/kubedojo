import { PracticeGrid } from '../components/practice/Practice';
import { D } from '../lib/data';
import { href } from '../lib/routes';

export default function Interview() {
  return (
    <PracticeGrid tab="interview" title="go interview questions, answered on the stage."
      intro={D.interview.length + ' questions that come up in Go interviews. Try to answer first, then run the program and watch the answer happen. Every output was checked against real Go.'}
      cards={D.interview.map((q) => ({ href: href.question(q.id), lesson: q.lesson, meta: q.lesson, title: q.title, text: q.question }))} />
  );
}
