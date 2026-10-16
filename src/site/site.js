// Site-wide constants. SITE_URL (env VITE_SITE_URL at build time) is only needed for canonical URLs, the sitemap and the RSS feed.
export const SITE = {
  name: 'KubeDojo',
  tagline: "Practice Kubernetes on a cluster you can't break.",
  description: 'KubeDojo simulates kind, k3d, docker, kubectl and Helm 2 in your browser. Type real commands, watch the cluster react, then export what you built as a setup script for your own machine.',
  url: (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, ''),
  // The header only carries what a visitor needs: the guides and the app. Everything else lives in the footer.
  nav: [{ to: '/blog', label: 'Blog' }],
  app: { to: '/app', label: 'Open the playground' },
};
export const absolute = path => (SITE.url ? SITE.url + path : path);
