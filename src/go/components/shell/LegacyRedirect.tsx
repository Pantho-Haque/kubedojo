// Prototype links used hash routes (#lesson=A07). On the home page, send them to the real URL.
import { useRouter } from '../../lib/router';
import { useEffect } from 'react';
import { BASE, fromLegacyHash } from '../../lib/routes';

export function LegacyRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (location.pathname !== (BASE || '/') || !location.hash) return;
    const to = fromLegacyHash(location.hash);
    if (to) router.replace(to);
  }, [router]);
  return null;
}
