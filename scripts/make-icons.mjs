// Renders the PNG icons and the social card in public/ from inline SVG/HTML with headless Chrome. Run once: node scripts/make-icons.mjs
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './browser.mjs';
const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const mark = (size, bg, fg) => `<svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="7" fill="${bg}"/><g transform="translate(4 4) scale(.75)"><path d="M16 2.5 27.7 9.25v13.5L16 29.5 4.3 22.75V9.25z" fill="none" stroke="${fg}" stroke-width="2.4" stroke-linejoin="round"/><path d="M4.3 13.4h23.4v5.2H4.3z" fill="#c8391a"/></g></svg>`;
const b = await launch();
async function png(file, w, h, html) { const p = await b.newPage({ width: w, height: h, dpr: 1 }); await p.goto('data:text/html;charset=utf-8,' + encodeURIComponent(`<style>*{margin:0;box-sizing:border-box}body{width:${w}px;height:${h}px;overflow:hidden}</style>${html}`), { wait: 400 }); await p.screenshot(join(pub, file)); await p.close(); }
await png('apple-touch-icon.png', 180, 180, mark(180, '#f6f3ec', '#1b1c1e'));
await png('icon-192.png', 192, 192, mark(192, '#f6f3ec', '#1b1c1e'));
await png('icon-512.png', 512, 512, mark(512, '#f6f3ec', '#1b1c1e'));
const card = `<div style="width:1200px;height:630px;background:#f6f3ec;color:#1b1c1e;font-family:'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif;padding:72px 80px;position:relative">
  <div style="display:flex;align-items:center;gap:16px;font-size:34px;font-weight:600">${mark(48, 'transparent', '#1b1c1e').replace('<rect width="32" height="32" rx="7" fill="transparent"/>', '')}KubeDojo</div>
  <div style="margin-top:70px;font-size:84px;line-height:1.04;letter-spacing:-2px;font-weight:600;max-width:900px">Practice Kubernetes on a cluster you can't break.</div>
  <div style="position:absolute;left:80px;bottom:64px;font:500 26px ui-monospace,Menlo,monospace;color:#c8391a">$ kind create cluster --name dojo</div>
  <div style="position:absolute;right:80px;bottom:64px;font:500 24px -apple-system,Helvetica,sans-serif;color:#6b6e74">kind · k3d · docker · kubectl · helm 2</div></div>`;
await png('og.png', 1200, 630, card);
await b.close(); console.log('icons written to public/');
