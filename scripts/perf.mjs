// Performance probe on a mobile viewport with Chrome DevTools: gzip transfer size, request count, layout shift and First Contentful Paint.
//   usage: node scripts/perf.mjs [baseUrl] [--throttle]    (serve the production build first: npm run preview)
// --throttle adds a 4x CPU slowdown and a 3G-like network: use it on a quiet machine, timings are meaningless on a busy one.
import { launch } from './browser.mjs';
const base = process.argv.find(a => /^https?:/.test(a)) || 'http://localhost:4173'; const throttle = process.argv.includes('--throttle');
const PAGES = ['/', '/blog', '/blog/helm-2-chart', '/privacy'];
const BUDGET = { kb: 160, postKb: 230, cls: 0.1, fcp: throttle ? 3000 : 1800 }; // KB over the wire (HTML+JS+CSS, first load; a long post carries its own text twice: prerendered HTML and the hydration data), CLS, FCP ms
const b = await launch(); let bad = 0;
for (const path of PAGES) {
  const p = await b.newPage({ width: 390, height: 844, mobile: true, scheme: 'light', dpr: 2 });
  if (throttle) { await p.send('Emulation.setCPUThrottlingRate', { rate: 4 }); await p.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 }); }
  await p.send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)__cls+=e.value}).observe({type:'layout-shift',buffered:true});` });
  await p.send('Network.setCacheDisabled', { cacheDisabled: true });
  await p.goto(base + path, { wait: 3500 });
  const fcp = await p.eval("Math.round((performance.getEntriesByName('first-contentful-paint')[0]||{startTime:0}).startTime)"); const cls = +(await p.eval('window.__cls')).toFixed(3); const kb = Math.round((p.bytes || 0) / 1024);
  const row = { path, kb, requests: p.requests.length, fcp, cls, errors: p.errors.length }; const fails = [];
  if (kb > (path.startsWith('/blog/') ? BUDGET.postKb : BUDGET.kb)) fails.push('transfer'); if (fcp > BUDGET.fcp) fails.push('FCP'); if (cls > BUDGET.cls) fails.push('CLS'); if (p.errors.length) fails.push('errors');
  console.log(fails.length ? 'FAIL' : 'ok  ', JSON.stringify(row), fails.join(',')); if (fails.length) bad++; await p.close();
}
await b.close(); console.log(bad ? `${bad} page(s) over budget` : 'performance budget met'); process.exit(bad ? 1 : 0);
