// The studio engine and each AI course are their own chunks, loaded on the client only (the prerendered page shows the lesson text).
import { useEffect, useState } from 'react';
const courses = import.meta.glob('../generated/studio/*.js');

export function useStudio(slug) {
  const [api, setApi] = useState(null);
  useEffect(() => {
    let alive = true; const load = courses[`../generated/studio/${slug}.js`]; if (!load) return;
    Promise.all([load(), import('./engine.js')]).then(([c, e]) => { if (alive) setApi(e.studio(c.default, slug)); });
    return () => { alive = false; };
  }, [slug]);
  return api;
}

// The studio's own pages for a course, linked from its lessons and course page.
export const TOOLS = [['glossary', 'Glossary'], ['review', 'Review'], ['cheatsheet', 'Cheat sheet'], ['certificate', 'Certificate']];
