import { Link } from '../lib/router';
import { View } from '../components/View';
import { href } from '../lib/routes';

export default function NotFound() {
  return (
    <View>
      <div className="page empty"><h3>That page doesn&apos;t exist.</h3><p>The link may be old or mistyped.</p><Link className="btn primary" href={href.learn}>Go to Learn</Link></div>
    </View>
  );
}
