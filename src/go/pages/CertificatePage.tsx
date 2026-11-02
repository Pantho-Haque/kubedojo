import { useParams } from 'react-router-dom';
import { View } from '../components/View';
import { Certificate } from '../components/learn/Certificate';
import { D } from '../lib/data';
import NotFound from './NotFound';

export default function CertificatePage() {
  const { track = '' } = useParams();
  if (!D.track(track)) return <NotFound />;
  return <View><Certificate track={track} /></View>;
}
