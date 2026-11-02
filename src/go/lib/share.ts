// Share links: the program itself rides in the URL fragment, deflated. Nothing is uploaded.
// Links are untrusted input: the decoded size is capped and the text only goes to the editor and the interpreter.
import { toast } from './shell';

export const SHARE_MAX_BYTES = 64 * 1024;
const b64u = {
  enc(u8: Uint8Array) { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec(s: string) { const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/')); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return u8; },
};
export async function pack(text: string) {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  return b64u.enc(new Uint8Array(await new Response(stream).arrayBuffer()));
}
export async function unpack(code: string) {
  if (!/^[\w-]{1,100000}$/.test(String(code || ''))) throw Error('bad link');
  const reader = new Blob([b64u.dec(code) as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  const parts: Uint8Array[] = []; let n = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    n += value.length;
    if (n > SHARE_MAX_BYTES) { reader.cancel(); throw Error('too big'); }
    parts.push(value);
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(await new Blob(parts as BlobPart[]).arrayBuffer());
}
/** Params in the fragment, e.g. #src=…&at=3 → { src, at }. */
export const hashParams = () => new URLSearchParams(location.hash.replace(/^#/, ''));
export const origin = () => location.origin; // href paths already carry the /go prefix

export function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
/** SVG text → PNG blob (a data: URL keeps the canvas untainted). */
export async function svgToPNG(svg: string, w: number, h: number, k = 2): Promise<Blob | null> {
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await img.decode();
  const c = document.createElement('canvas');
  c.width = w * k; c.height = h * k;
  const ctx = c.getContext('2d')!; ctx.scale(k, k); ctx.drawImage(img, 0, 0, w, h);
  return new Promise((done) => c.toBlob(done, 'image/png'));
}
export async function copyText(text: string, input?: HTMLInputElement | HTMLTextAreaElement | null) {
  try { await navigator.clipboard.writeText(text); toast('Copied.'); return true; }
  catch { if (input) { input.focus(); input.select(); } toast('Press ⌘C / Ctrl+C to copy.'); return false; }
}
