import { useParams } from 'react-router-dom';
import { View } from '../components/View';
import { Article } from '../components/learn/Article';
import { ImportedArticle } from '../components/learn/ImportedArticle';
import { D } from '../lib/data';

export default function ArticlePage() {
  const { id = '' } = useParams(), i = D.lessonIndex(id), l = D.lessons[i];
  // unknown ids may be lessons from a pack imported in this browser
  if (!l) return <View><ImportedArticle id={id} /></View>;
  return <View><Article lesson={l} prog={D.program(l.examples?.[0])} prev={D.lessons[i - 1]} next={D.lessons[i + 1]} /></View>;
}
