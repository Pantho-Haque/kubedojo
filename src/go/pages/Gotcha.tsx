import { useParams } from 'react-router-dom';
import { PracticeDetail } from '../components/practice/Practice';
import { D } from '../lib/data';
import { href } from '../lib/routes';
import NotFound from './NotFound';

export default function Gotcha() {
  const { id } = useParams(), G = D.gotchas, i = G.findIndex((g) => g.id === id), g = G[i];
  if (!g) return <NotFound />;
  const prev = G[i - 1], next = G[i + 1];
  return (
    <PracticeDetail key={g.id} crumb="gotchas" crumbHref={href.gotchas} item={g} seen
      lead={'You might think: “' + g.claim + '”'} intro="Guess what it prints, then press play and step through it."
      summary="Why it happens" answer={g.why} prints="Go prints:" crash="…and then the program crashes."
      prev={prev && { href: href.gotcha(prev.id), title: prev.title }} next={next && { href: href.gotcha(next.id), title: next.title }} />
  );
}
