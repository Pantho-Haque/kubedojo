// Read-only Go source with the editor's syntax colours. The highlighter loads with the editor module.
import { useEffect, useState } from 'react';
import { loadEditor } from '../lib/run';
import { esc } from '../lib/data';

export function HighlightedCode({ source, className = 'mono', style }: { source: string; className?: string; style?: React.CSSProperties }) {
  const [html, setHtml] = useState(() => esc(source));
  useEffect(() => { let on = true; loadEditor().then(({ GothikEditor }) => { if (on) setHtml(GothikEditor.highlightLine(source)); }); return () => { on = false; }; }, [source]);
  return <pre tabIndex={0} className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}
