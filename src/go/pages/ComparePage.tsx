import { Suspense } from 'react';
import { Compare } from '../components/compare/Compare';

// the preset comes from ?preset= and custom programs from the fragment, both read on the client
export default function ComparePage() {
  return <Suspense fallback={null}><Compare /></Suspense>;
}
