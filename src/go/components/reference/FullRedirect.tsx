// Old links ask for the whole document with ?full=1; the whole document lives at /reading/[id]/full.
import { useRouter } from '../../lib/router';
import { useEffect } from 'react';

export function FullRedirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => { if (new URLSearchParams(location.search).get('full') === '1') router.replace(to); }, [router, to]);
  return null;
}
