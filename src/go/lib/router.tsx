// gothik was written for Next.js (next/link, next/navigation). These are the same calls on react-router, so the
// components kept their code. Paths in `href` (lib/routes.ts) already carry the /go prefix, or point elsewhere in the
// site (an Academy lesson); usePathname() drops the prefix again, as Next's basePath did.
import { useMemo } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useSearchParams as useRouterSearchParams } from 'react-router-dom';
import { BASE } from './routes';

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string; prefetch?: boolean; scroll?: boolean; replace?: boolean };

export function Link({ href, prefetch: _prefetch, scroll, replace, ...rest }: LinkProps) {
  if (/^(https?:|mailto:|#)/.test(href)) return <a href={href} {...rest} />;
  return <RouterLink to={href} replace={replace} preventScrollReset={scroll === false} {...rest} />;
}

export function useRouter() {
  const navigate = useNavigate();
  return useMemo(() => ({
    push: (to: string, _o?: { scroll?: boolean }) => navigate(to),
    replace: (to: string, o?: { scroll?: boolean }) => navigate(to, { replace: true, preventScrollReset: o?.scroll === false }),
    back: () => navigate(-1),
  }), [navigate]);
}

export function usePathname() {
  const { pathname } = useLocation();
  return pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : pathname;
}

export const useSearchParams = () => useRouterSearchParams()[0];
