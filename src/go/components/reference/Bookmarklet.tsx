// A bookmarklet that finds the Go program on any page (or the selection) and opens it in
// this app's playground. It needs this site's origin, so it is built on the client.
import { useEffect, useRef } from 'react';
import { useHydrated } from '../../lib/store';
import { openKeys, toast } from '../../lib/shell';
import { BASE } from '../../lib/routes';

const CODE = String.raw`function (BASE) {
  var t = String(getSelection());
  if (!/package\s+main/.test(t)) {
    var gbe = [].map.call(document.querySelectorAll('td.code'), function (e) { return e.innerText; }).join('\n');
    var all = [gbe].concat([].map.call(document.querySelectorAll('textarea, pre, .cm-content, .CodeMirror-code'), function (e) { return e.value || e.innerText || ''; }));
    t = all.filter(function (x) { return /package\s+main/.test(x); }).sort(function (a, b) { return b.length - a.length; })[0] || t;
  }
  if (!t.trim()) { alert('gothik: select a Go program first.'); return; }
  new Response(new Blob([t]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer().then(function (buf) {
    var b = '', u = new Uint8Array(buf); for (var i = 0; i < u.length; i++) b += String.fromCharCode(u[i]);
    open(BASE + '/playground#src=' + btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), '_blank');
  });
}`;
export const bookmarklet = (base: string) => 'javascript:(' + encodeURIComponent(CODE) + ')(' + encodeURIComponent(JSON.stringify(base)) + ')';

export function Bookmarklet() {
  const base = useHydrated() ? location.origin + BASE : '', link = useRef<HTMLAnchorElement>(null);
  // React refuses javascript: hrefs, so the bookmarklet is set on the element directly
  useEffect(() => { link.current?.setAttribute('href', bookmarklet(location.origin + BASE)); }, []);
  return (
    <>
      <p className="row" style={{ flexWrap: 'wrap' }}>
        <a className="btn primary sm" id="bookmarklet" href="#" ref={link} onClick={(e) => { e.preventDefault(); toast('Drag the button to your bookmarks bar, then use it on a Go page.'); }}>Open in gothik</a>
        <span className="faint" style={{ fontSize: 12 }}>{base && 'Opens ' + base + '/playground'}</span>
      </p>
      <h2>Keyboard</h2><p><button className="btn sm" type="button" id="about-keys" onClick={openKeys}>Show all shortcuts</button></p>
    </>
  );
}
