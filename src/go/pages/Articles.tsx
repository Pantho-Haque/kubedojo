import { Link } from '../lib/router';
import { View } from '../components/View';
import { ArticleGrid } from '../components/learn/ArticleGrid';
import { href } from '../lib/routes';

export default function AcademyPage() {
  return (
    <View>
      <div className="page"><ArticleGrid><p className="mono faint"><Link href={href.learn}>learn</Link> / articles</p><h1 className="mono">read it, then run it.</h1><p>One article per lesson, each with a live example you can edit, the claims it rests on, and the original sources to read offline.</p></ArticleGrid></div>
    </View>
  );
}
