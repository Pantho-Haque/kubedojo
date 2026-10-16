// Tiny Chrome DevTools Protocol client (no dependencies, uses Node's built-in WebSocket) for screenshots and end-to-end checks:
// device emulation (mobile widths, light/dark), console/CSP error capture, request counting, in-page evaluation.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function launch() {
  const port = 9300 + Math.floor(Math.random() * 500); const dir = mkdtempSync(join(tmpdir(), 'kd-chrome-'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let info; for (let i = 0; i < 100; i++) { try { info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch (e) { await sleep(150); } }
  if (!info) { proc.kill(); throw new Error('Chrome did not start'); }
  const browser = { port, async newPage(opts = {}) { return openPage(port, opts); }, async close() { proc.kill(); await sleep(200); rmSync(dir, { recursive: true, force: true }); } };
  return browser;
}

async function openPage(port, { width = 1440, height = 900, mobile = false, scheme = 'light', dpr = 1 } = {}) {
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const handlers = {};
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { const { res, rej } = pending.get(d.id); pending.delete(d.id); d.error ? rej(new Error(d.error.message)) : res(d.result); } else if (d.method && handlers[d.method]) for (const h of handlers[d.method]) h(d.params); };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const on = (ev, cb) => { (handlers[ev] ||= []).push(cb); };
  const page = { errors: [], requests: [], send, on };
  on('Runtime.exceptionThrown', p => page.errors.push('exception: ' + (p.exceptionDetails.exception?.description || p.exceptionDetails.text)));
  on('Runtime.consoleAPICalled', p => { if (p.type === 'error') page.errors.push('console.error: ' + p.args.map(a => a.value ?? a.description).join(' ')); });
  on('Log.entryAdded', p => { if (p.entry.level === 'error') page.errors.push('log: ' + p.entry.text + ' ' + (p.entry.url || '')); });
  on('Network.requestWillBeSent', p => page.requests.push(p.request.url));
  on('Network.loadingFailed', p => page.errors.push('request failed: ' + (p.blockedReason || p.errorText) + ' ' + (p.type || '')));
  on('Network.loadingFinished', p => { page.bytes = (page.bytes || 0) + p.encodedDataLength; });
  for (const d of ['Page', 'Runtime', 'Log', 'Network']) await send(d + '.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
  if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await send('Emulation.setFocusEmulationEnabled', { enabled: true }); await send('Page.bringToFront'); // a background tab reports no paint metrics
  page.goto = async (url, { wait = 1200 } = {}) => { page.errors.length = 0; page.requests.length = 0; page.bytes = 0; const loaded = new Promise(r => on('Page.loadEventFired', r)); await send('Page.navigate', { url }); await Promise.race([loaded, sleep(15000)]); await sleep(wait); };
  page.eval = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  page.waitFor = async (expr, timeout = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < timeout) { if (await page.eval(expr).catch(() => false)) return true; await sleep(100); } return false; };
  page.screenshot = async (file, { full = false } = {}) => { // full: grow the viewport to the page height first, so content-visibility sections are really rendered
    if (full) { const h = await page.eval('document.documentElement.scrollHeight'); await send('Emulation.setDeviceMetricsOverride', { width, height: Math.min(h, 16000), deviceScaleFactor: dpr, mobile }); await sleep(500); }
    const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(file, Buffer.from(r.data, 'base64'));
    if (full) await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
  };
  page.close = async () => { ws.close(); await fetch(`http://127.0.0.1:${port}/json/close/${t.id}`).catch(() => { }); };
  page.sleep = sleep;
  return page;
}
