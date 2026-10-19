// lazy() that stops suspending once its chunk is in memory. The prerenderer and the hydration load the chunk first, so
// neither suspends: a suspended boundary would be streamed behind an inline <script>, which the CSP blocks.
import { lazy } from 'react';

export function lazySync(load) {
  let mod = null;
  const preload = () => (mod ? { then: done => done(mod) } : load().then(m => (mod = m)));
  return [lazy(preload), preload];
}
