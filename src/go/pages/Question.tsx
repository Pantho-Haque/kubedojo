import { useParams } from 'react-router-dom';
import { PracticeDetail } from '../components/practice/Practice';
import { D } from '../lib/data';
import { href } from '../lib/routes';
import NotFound from './NotFound';

export default function Question() {
  const { id } = useParams(), Q = D.interview, i = Q.findIndex((q) => q.id === id), q = Q[i];
  if (!q) return <NotFound />;
  const prev = Q[i - 1], next = Q[i + 1];
  return (
    <PracticeDetail key={q.id} crumb="interview" crumbHref={href.interview} item={{ ...q, panics: !!q.panics }}
      lead={q.question} intro={'Say your answer out loud first. Then run the program: ' + q.watch.charAt(0).toLowerCase() + q.watch.slice(1)}
      summary="A strong answer" answer={q.answer} prints="The program prints:" crash="…and then it crashes, on purpose."
      prev={prev && { href: href.question(prev.id), title: prev.title }} next={next && { href: href.question(next.id), title: next.title }} />
  );
}
