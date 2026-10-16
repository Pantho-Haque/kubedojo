import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// npm run build         -> dist/ (prerendered static site; hydrated in the browser)
// npm run build:single  -> dist-single/index.html (whole app in one offline file, hash routing)
// VITE_SITE_URL=https://example.com adds canonical URLs, a sitemap and an RSS feed; VITE_BASE=/sub/ serves from a sub-path.
// the one-file build is opened from file://, where the manifest and icon links cannot load
const singleFileHead = { name: 'single-file-head', transformIndexHtml: html => html.replace(/<link rel="(?:manifest|apple-touch-icon|icon)"[^>]*>\s*/g, '') };

export default defineConfig({
  base: process.env.SINGLE_FILE ? './' : (process.env.VITE_BASE || '/'),
  plugins: [react(), ...(process.env.SINGLE_FILE ? [singleFileHead, viteSingleFile()] : [])],
  build: { chunkSizeWarningLimit: 1500, target: 'es2020', rollupOptions: { onwarn(w, warn) { if (w.code !== 'INEFFECTIVE_DYNAMIC_IMPORT') warn(w); } } }, // the server bundle imports posts statically on purpose
  ssr: { noExternal: ['react-router', 'react-router-dom'] },
});
