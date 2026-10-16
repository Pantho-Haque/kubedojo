// End-to-end checks of the production build in headless Chrome: routes, SEO tags, errors, overflow on phones, navigation, blog search,
// code-block buttons, theme, the live demo, deep links into the playground, accessibility basics and the no-network promise.
//   usage: npm run build && node scripts/e2e.mjs        (starts its own static server on :4180)
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './browser.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..'); const PORT = 4180; const base = `http://localhost:${PORT}`;
const server = spawn('node', [join(root, 'scripts/serve.mjs'), String(PORT)], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 800));
const b = await launch(); let failed = 0; const t0 = Date.now();
const check = (name, ok, extra = '') => { console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : '  ' + extra)); if (!ok) failed++; };
const open = (opts = {}) => b.newPage({ width: 1280, height: 900, scheme: 'light', ...opts });
const posts = [...new Set((await (await fetch(`${base}/blog`)).text()).match(/href="\/blog\/([\w-]+)"/g)?.map(x => x.slice(12, -1)) || [])];
const ROUTES = ['/', '/blog', ...[...new Set(posts)].map(s => '/blog/' + s), '/privacy', '/app'];

// ---- every route: status, head tags, one h1, no errors, no overflow on phones, only same-origin requests
for (const route of ROUTES) {
  const res = await fetch(base + route); const html = await res.text();
  check(`${route} serves 200`, res.status === 200, String(res.status));
  check(`${route} has a title and description`, /<title>[^<]{8,}<\/title>/.test(html) && /<meta name="description" content="[^"]{30,}"/.test(html));
  check(`${route} has Open Graph tags`, /property="og:title"/.test(html) && /property="og:image"/.test(html));
  if (route !== '/app') check(`${route} is prerendered`, html.includes('data-prerendered') && /<h1/.test(html));
}
const missing = await fetch(base + '/no-such-page'); check('unknown path returns 404 with the 404 page', missing.status === 404 && /not here/.test(await missing.text()));
const csp = (await fetch(base + '/')).headers.get('content-security-policy') || ''; check('CSP forbids network requests (connect-src none)', /connect-src 'none'/.test(csp) && /frame-ancestors 'none'/.test(csp));
for (const [file, re] of [['/robots.txt', /User-agent/], ['/manifest.webmanifest', /KubeDojo/], ['/og.png', null], ['/favicon.svg', /<svg/]]) { const r = await fetch(base + file); check(`${file} exists`, r.status === 200 && (!re || re.test(await r.text()))); }

for (const w of [360, 390, 768, 1280]) for (const route of ['/', '/blog', '/blog/' + posts[3], '/privacy']) {
  const p = await open({ width: w, height: 800, mobile: w < 700 });
  await p.goto(base + route, { wait: 900 });
  const over = await p.eval('document.documentElement.scrollWidth - innerWidth'); const h1 = await p.eval('document.querySelectorAll("h1").length');
  const external = p.requests.filter(u => !u.startsWith(base) && !u.startsWith('data:'));
  check(`${route} @${w}px: no horizontal overflow, one h1, no errors, no external requests`, over <= 0 && h1 === 1 && !p.errors.length && !external.length, `overflow ${over}, h1 ${h1}, errors ${JSON.stringify(p.errors).slice(0, 200)}, external ${external.join(',')}`);
  await p.close();
}

// ---- header: only the necessary links
{ const p = await open(); await p.goto(base + '/', { wait: 800 });
  const links = await p.eval('JSON.stringify([...document.querySelectorAll(".site-header a")].map(a => a.getAttribute("href") + "|" + a.textContent.trim().replace(/\\s+/g," ")))');
  check('header has the brand, Blog and the playground button only', JSON.parse(links).length === 3 && /\/blog\|Blog/.test(links) && /\/app\|/.test(links), links);
  await p.close(); }

// ---- home: scenarios, theme, FAQ, live demo, course list
{ const p = await open(); await p.goto(base + '/', { wait: 1500 });
  const first = await p.eval('document.querySelector(".scn-term").textContent');
  await p.eval('[...document.querySelectorAll("[role=tab]")][1].click()'); await p.sleep(300);
  const second = await p.eval('document.querySelector(".scn-term").textContent');
  check('scenario tabs switch the transcript', first !== second && /crash/.test(second), second.slice(0, 80));
  check('scenario link opens the playground with the commands', /\/app\?run=/.test(await p.eval('document.querySelector(".scn-text a").getAttribute("href")')));
  check('course list shows every post', (await p.eval('document.querySelectorAll(".course li").length')) === posts.length);
  await p.eval('document.querySelector(".faq summary").click()'); await p.sleep(100); check('FAQ opens', await p.eval('document.querySelector(".faq details").open'));
  const before = await p.eval('document.documentElement.dataset.theme || "none"'); await p.eval('document.querySelector(".theme-toggle").click()'); await p.sleep(100);
  const after = await p.eval('document.documentElement.dataset.theme'); check('theme toggle flips and is remembered', after && after !== before && (await p.eval('localStorage.getItem("kubedojo:theme")')) === after);
  await p.eval('[...document.querySelectorAll(".demo .link-btn")][0].click()');
  check('"Type your own commands" loads the real simulator', await p.waitFor('!!document.querySelector(".demo #termpane .tin")', 20000));
  await p.eval(`(() => { const i = document.querySelector('.demo .tin'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i, 'echo live-ok'); i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true})); })()`);
  check('the live terminal runs a command', await p.waitFor('document.querySelector(".demo .tout").textContent.includes("live-ok")', 8000));
  await p.close(); }

// ---- blog: search, tags, post page, code buttons, deep link into the playground
{ const p = await open(); await p.goto(base + '/blog', { wait: 1500 });
  const setQ = v => p.eval(`(() => { const i = document.querySelector('.search input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i, ${JSON.stringify(v)}); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await setQ('helm'); await p.sleep(200); const n = await p.eval('document.querySelectorAll(".post-list li").length'); check('search narrows the list', n >= 1 && n < posts.length, String(n));
  await setQ('zzzznothing'); await p.sleep(200); check('search shows an empty state', await p.eval('!!document.querySelector(".empty")'));
  await setQ(''); await p.sleep(100); await p.eval('[...document.querySelectorAll(".chips button")].find(b => b.textContent === "kind").click()'); await p.sleep(200);
  check('tag filter works and is in the URL', (await p.eval('document.querySelectorAll(".post-list li").length')) >= 1 && /tag=kind/.test(await p.eval('location.search')));
  await p.eval('document.querySelector(".post-list a").click()'); check('clicking a post navigates without a reload', await p.waitFor('location.pathname.startsWith("/blog/") && !!document.querySelector(".prose")'));
  check('post has a table of contents and prose', (await p.eval('document.querySelectorAll(".post-side .toc li").length')) > 2 && (await p.eval('document.querySelector(".prose").textContent.length')) > 2000);
  check('code blocks have copy and try buttons', (await p.eval('document.querySelectorAll(".code-copy").length')) > 3 && (await p.eval('document.querySelectorAll(".code-try").length')) > 0);
  check('relative .md links were rewritten', !(await p.eval('document.querySelector(".prose").innerHTML.includes(".md\\"")')));
  const tryHref = await p.eval('document.querySelector(".code-try").getAttribute("href")'); check('"Try in playground" carries the commands', /^\/app\?run=/.test(tryHref), tryHref);
  await p.eval('document.querySelector(".code-try").click()'); check('"Try in playground" opens the playground and runs them', await p.waitFor('!!document.querySelector(".tout") && document.querySelector(".tout").textContent.includes("docker info")', 40000), (await p.eval('document.body.innerText')).slice(0, 120));
  await p.close(); }

// ---- post progress: finishing a post marks it read and the home page shows it
{ const p = await open({ height: 700 }); await p.goto(base + '/blog/' + posts[8], { wait: 1000 });
  await p.eval('window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })');
  check('reading to the end marks the post as read', await p.waitFor(`(localStorage.getItem("kubedojo:read") || "").includes("${posts[8]}")`, 4000));
  await p.goto(base + '/', { wait: 800 }); check('the home page shows reading progress', await p.waitFor('!!document.querySelector(".resume")', 3000));
  await p.close(); }

// ---- accessibility basics on every page type
for (const route of ['/', '/blog', '/blog/' + posts[1], '/privacy']) {
  const p = await open(); await p.goto(base + route, { wait: 900 });
  const r = JSON.parse(await p.eval(`JSON.stringify({
    landmarks: ['header','main','footer','nav'].every(t => !!document.querySelector(t)),
    skip: !!document.querySelector('.skip-link'),
    unnamedButtons: [...document.querySelectorAll('button')].filter(b => !(b.textContent.trim() || b.getAttribute('aria-label') || b.title)).length,
    unnamedLinks: [...document.querySelectorAll('a')].filter(a => !(a.textContent.trim() || a.getAttribute('aria-label'))).length,
    headingJump: (() => { let last = 0, bad = 0; for (const h of document.querySelectorAll('h1,h2,h3,h4')) { const n = +h.tagName[1]; if (last && n > last + 1) bad++; last = n; } return bad; })(),
    lang: document.documentElement.lang === 'en'
  })`));
  check(`${route} accessibility basics`, r.landmarks && r.skip && !r.unnamedButtons && !r.unnamedLinks && !r.headingJump && r.lang, JSON.stringify(r));
  await p.close();
}

// ---- the playground on a phone: one pane at a time, switched from a bottom bar, no horizontal scroll
{ const p = await open({ width: 390, height: 800, mobile: true, scheme: 'dark' }); await p.goto(base + '/app?notour=1', { wait: 1500 });
  check('playground loads on a phone', await p.waitFor('!!document.querySelector("#mobilenav") && getComputedStyle(document.querySelector("#mobilenav")).display !== "none"', 40000));
  const vis = id => p.eval(`getComputedStyle(document.querySelector('${id}')).display !== 'none'`);
  check('phone starts on the terminal pane', (await vis('#termpane')) && !(await vis('#vizpane')) && !(await vis('#side')));
  await p.eval('[...document.querySelectorAll("#mobilenav button")].find(b => b.textContent === "Cluster").click()'); await p.sleep(200);
  check('the Cluster button shows the cluster pane only', (await vis('#vizpane')) && !(await vis('#termpane')));
  await p.eval('[...document.querySelectorAll("#mobilenav button")].find(b => b.textContent === "Guide").click()'); await p.sleep(200);
  check('the Guide button shows the guide only', (await vis('#side')) && !(await vis('#vizpane')));
  check('no horizontal scroll in the playground on a phone', (await p.eval('document.documentElement.scrollWidth - innerWidth')) <= 0);
  await p.close(); }

// ---- dark theme renders and keeps contrast variables
{ const p = await open({ scheme: 'dark' }); await p.goto(base + '/', { wait: 800 }); const bg = await p.eval('getComputedStyle(document.querySelector(".site")).backgroundColor'); check('dark scheme gives a dark background', (bg.match(/\d+/g) || []).slice(0, 3).reduce((a, b) => a + Number(b), 0) < 150, bg); await p.close(); }

await b.close(); server.kill(); console.log(failed ? `\n${failed} check(s) failed` : `\nall e2e checks pass (${Math.round((Date.now() - t0) / 1000)}s)`); process.exit(failed ? 1 : 0);
