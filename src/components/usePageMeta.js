import { useEffect } from 'react';

// Keeps the tab title and description right after client-side navigation (the prerenderer writes them into the HTML for first loads).
export function usePageMeta({ title, description }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) { let m = document.querySelector('meta[name="description"]'); if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); } m.content = description; }
  }, [title, description]);
}
