import { PracticeGrid } from '../components/practice/Practice';
import { D } from '../lib/data';
import { href } from '../lib/routes';

export default function Gotchas() {
  return (
    <PracticeGrid tab="gotchas" title="looks right, runs wrong."
      intro={D.gotchas.length + ' Go surprises that catch beginners and experienced developers alike. Each one runs on the stage, so you can watch why. Every output was checked against real Go.'}
      cards={D.gotchas.map((g) => ({ href: href.gotcha(g.id), lesson: g.lesson, meta: g.lesson + (g.panics ? ' · crashes' : ''), title: g.title, text: '“' + g.claim + '”' }))} />
  );
}
