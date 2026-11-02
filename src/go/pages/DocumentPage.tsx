import { useParams } from 'react-router-dom';
import { DocPage } from '../components/reference/DocPage';
import { D } from '../lib/data';
import NotFound from './NotFound';

// /reading/:id shows a sectioned document's section; /reading/:id/full the whole document
export default function DocumentPage({ full = false }: { full?: boolean }) {
  const doc = D.doc(useParams().id || '');
  if (!doc || (full && !doc.section)) return <NotFound />;
  return <DocPage doc={doc} full={full} />;
}
