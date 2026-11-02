// Capstone steps 1–3: scaffold, stream, typed answers. Every top-level name starts with P1_.
const P1_GLOSS = {
  'CORS': 'Cross-Origin Resource Sharing. A browser rule: a page from one origin (scheme + host + port) may only read a response from another origin if that server says so in an `access-control-allow-origin` header.',
  '.env file': 'A local, uncommitted file of `NAME=value` lines that holds config and secrets for one machine. A committed `.env.example` lists the names with no real values.'
};

/* ---------- shared terminal helpers ---------- */
const P1_FAIL = port => ({ err: 'curl: (7) Failed to connect to localhost port ' + port + ' after 0 ms: Couldn\'t connect to server' });
const P1_UVI = port => 'INFO:     Will watch for changes in these directories: [\'/Users/you/docsbot/api\']\nINFO:     Uvicorn running on http://127.0.0.1:' + port + ' (Press CTRL+C to quit)\nINFO:     Application startup complete.';

/* ---------- Step 1: scaffold ---------- */
const P1_DIRS = { root: '~/docsbot', api: '~/docsbot/api', web: '~/docsbot/web' };

const P1_scaffold = {
  id: 'cap-scaffold', title: 'Step 1: Scaffold DocsBot', mins: 12,
  goal: 'set up the DocsBot repo with a FastAPI health check, a Next.js page that shows "API: ok", and secrets that git never sees.',
  cards: [
    { t: 'read', h: 'Start with a skeleton that runs',
      body: 'Every later step adds AI to DocsBot: streaming, RAG, tools, evals. Each one is easier to debug when the plumbing already works.\n\nSo step 1 has no AI at all. A Next.js page calls a FastAPI `GET /health` and shows **API: ok**. Your keys live in a [[.env file]] that git ignores from day one.',
      points: ['`api/`: Python 3.12, FastAPI, managed by `uv`', '`web/`: Next.js + TypeScript on port 3000', '`.env` for secrets, `.env.example` for the names'] },
    { t: 'viz', h: 'One health check, browser to API',
      body: 'Watch the page call the API across two ports.',
      nodes: {
        next: { x: 110, y: 65, label: 'Next.js dev', sub: ':3000 · page.tsx', kind: 'a' },
        br: { x: 110, y: 200, label: 'Browser', sub: 'localhost:3000', kind: 'a' },
        api: { x: 420, y: 200, label: 'FastAPI', sub: ':8000 · /health', kind: 'b' }
      },
      edges: [['next', 'br', 'page'], ['br', 'api', 'fetch']],
      steps: [
        { cap: 'You open `localhost:3000`. The Next.js dev server sends the page, and its code runs in the browser.', do: [['send', 'next', 'br', 'page.tsx'], ['focus', 'next', 'br']] },
        { cap: 'The page calls `fetch(".../health")` on port 8000. The browser adds `Origin: http://localhost:3000`.', do: [['send', 'br', 'api', 'GET /health'], ['var', 'Origin', 'http://localhost:3000']] },
        { cap: 'FastAPI answers `{"status":"ok"}`. But 3000 and 8000 are different ports, so this is a cross-origin call.', do: [['send', 'api', 'br', '{"status":"ok"}'], ['set', 'api', { state: 'ok' }]] },
        { cap: 'The [[CORS]] middleware added `access-control-allow-origin: http://localhost:3000`. It matches, so the page reads the JSON: **API: ok**.', do: [['set', 'br', { state: 'ok', sub: 'API: ok' }], ['var', 'allow-origin', 'http://localhost:3000'], ['note', 'br', 'Origin matches']] },
        { cap: 'Typo: `allow_origins` says `127.0.0.1:3000`. Origins must match exactly, so the browser blocks it. `curl` still works: CORS is a browser rule.', do: [['set', 'br', { state: 'bad', sub: 'API: down' }], ['var', 'allow-origin', 'http://127.0.0.1:3000'], ['send', 'api', 'br', 'blocked', 'bad']] },
        { cap: 'Fixed. At startup, FastAPI reads settings from `.env`: the allowed origin now, the model key in step 2.', do: [['set', 'br', { state: 'ok', sub: 'API: ok' }], ['var', 'allow-origin', 'http://localhost:3000'], ['add', 'env', { x: 420, y: 70, shape: 'db', w: 120, label: '.env', sub: 'LLM_API_KEY=…', kind: 'd' }], ['link', 'env', 'api', 'read at startup']] },
        { cap: '`.gitignore` lists `.env`, so git never commits it. `.env.example` is committed with names only.', do: [['add', 'git', { x: 680, y: 70, label: 'git repo', sub: '.env.example ✓', kind: 'n', state: 'ok' }], ['link', 'env', 'git', { label: 'ignored', dash: true, tone: 'bad' }], ['set', 'env', { state: 'ok' }]] }
      ],
      predict: { at: 3, q: 'FastAPI sent `{"status":"ok"}` to the browser. Does the page get to read it?',
        options: ['Only if the response says this origin is allowed', 'Yes, a 200 response always reaches the page', 'No, browsers never allow calls to another port'], answer: 0,
        why: 'The browser checks `access-control-allow-origin` against the page\'s origin. No match, no data, even with a 200.' } },
    { t: 'read', h: 'Write the code: the API',
      body: 'Settings come from env vars and `.env`, never from the code. The API has one route for now.',
      lang: 'python',
      code: `# api/app/settings.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Real env vars win, then api/.env, then the repo-root .env.
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")
    llm_base_url: str = "https://api.openai.com/v1"
    llm_api_key: str = ""
    llm_model: str = ""
    embed_model: str = ""
    embed_dim: int = 1536
    web_origin: str = "http://localhost:3000"

settings = Settings()

# api/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.settings import settings

app = FastAPI(title="DocsBot API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.web_origin],  # exact match: scheme, host, port
    allow_methods=["GET", "POST"],
    allow_headers=["content-type"],
)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}`,
      points: ['`mkdir docsbot && cd docsbot && git init`, then `uv init api --python 3.12`', 'In `api/`: `uv add fastapi "uvicorn[standard]" pydantic-settings` and `uv add --dev pytest httpx`', 'Delete uv\'s sample `main.py`. Run `mkdir app tests && touch app/__init__.py`', 'In `pyproject.toml`, add `[tool.pytest.ini_options]` with `pythonpath = ["."]` so tests can `import app`', '`tests/test_health.py`: `TestClient(app).get("/health")` returns `200` and `{"status": "ok"}`'] },
    { t: 'read', h: 'Write the code: the page and the secrets',
      body: 'The page is a client component: it fetches in the browser and shows a badge. `NEXT_PUBLIC_` values ship to every visitor, so put URLs there, never keys.',
      lang: 'tsx',
      code: `// web/app/page.tsx
"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Home() {
  const [api, setApi] = useState("checking…");
  useEffect(() => {
    fetch(\`\${API}/health\`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setApi(d.status))
      .catch(() => setApi("down"));
  }, []);
  return (
    <main style={{ padding: 32 }}>
      <h1>DocsBot</h1>
      <span>API: {api}</span>
    </main>
  );
}`,
      points: ['From the repo root: `npx create-next-app@latest web --yes` (TypeScript + App Router are the defaults)', '`.gitignore` at the root: `.env`, `.venv/`, `__pycache__/`, `node_modules/`, `.next/`', '`.env.example` (committed): `LLM_BASE_URL=https://api.openai.com/v1`, `LLM_API_KEY=`, `LLM_MODEL=your-chat-model`, `EMBED_MODEL=your-embedding-model`, `EMBED_DIM=1536`', 'Each dev runs `cp .env.example .env` and fills in real values. A key pushed to git is leaked for good, even if you delete it later.'] },
    { t: 'play', kind: 'terminal', h: 'Try it: boot both halves',
      body: 'Servers you start keep running in their own tab. `open` shows what the browser sees.',
      size: [800, 260],
      prompt: '$',
      init: () => ({ cwd: 'root', apiPort: null, webUp: false, webUrl: 'http://localhost:8080', badge: null, healthOk: false, envMade: false, proved: false }),
      cmds: [
        { re: /^cd\s+(\S+?)\/?$/i, help: 'cd <api|web|..>', desc: 'change folder', run(m, s) {
          const p = m[1].replace(/^~\/docsbot\/?/, s.cwd === 'root' ? '' : '../').replace(/^\.\.\/?$/, '..');
          const to = p === '..' || p === '' ? 'root' : /^(\.\.\/)?(api|web)$/.test(p) && (s.cwd === 'root') === !p.startsWith('..') ? p.replace('../', '') : null;
          if (!to) return { err: 'cd: no such file or directory: ' + m[1] };
          s.cwd = to; return '';
        } },
        { re: /^pwd$/i, help: 'pwd', desc: 'show the current folder', run: (m, s) => P1_DIRS[s.cwd] },
        { re: /^ls\b.*$/i, help: 'ls -a', desc: 'list files', run: (m, s) => ({ root: '.env.example  .gitignore  api/  web/' + (s.envMade ? '  .env' : ''), api: '.venv/  app/  pyproject.toml  tests/  uv.lock', web: '.env.local  app/  next.config.ts  node_modules/  package.json' })[s.cwd] },
        { re: /^cat\s+(\S+)$/i, help: 'cat <file>', desc: 'print a file', run(m, s) {
          const f = m[1].replace(/^\.\//, ''), here = { root: { '.env.example': 'LLM_BASE_URL=https://api.openai.com/v1\nLLM_API_KEY=\nLLM_MODEL=your-chat-model\nEMBED_MODEL=your-embedding-model\nEMBED_DIM=1536', '.gitignore': '.env\n.venv/\n__pycache__/\nnode_modules/\n.next/' }, web: { '.env.local': 'NEXT_PUBLIC_API_URL=' + s.webUrl } }[s.cwd] || {};
          if (s.cwd === 'root' && s.envMade) here['.env'] = here['.env.example'];
          return f in here ? here[f] : { err: 'cat: ' + m[1] + ': No such file or directory' };
        } },
        { re: /^uv\s+run\s+uvicorn\s+app\.main:app\b(.*)$/i, help: 'uv run uvicorn app.main:app --reload', desc: 'start the API (in api/)', run(m, s) {
          if (s.cwd !== 'api') return { err: 'error: Failed to spawn: `uvicorn`\n  Caused by: No such file or directory (os error 2)\nTip: run it inside api/ (cd api).' };
          const pm = m[1].match(/--port[ =](\d+)/); s.apiPort = pm ? +pm[1] : 8000;
          return P1_UVI(s.apiPort);
        } },
        { re: /^uv\s+run\s+pytest\b.*$/i, help: 'uv run pytest', desc: 'run the API tests', run: (m, s) => s.cwd === 'api' ? '============ test session starts ============\ntests/test_health.py .                 [100%]\n============= 1 passed in 0.21s =============' : { err: 'error: Failed to spawn: `pytest`\nTip: run it inside api/.' } },
        { re: /^curl\s+(?:-\S+\s+)*(?:https?:\/\/)?(?:localhost|127\.0\.0\.1):(\d+)(\/\S*)?$/i, help: 'curl localhost:8000/health', desc: 'call a local server', run(m, s, io) {
          const port = +m[1], path = m[2] || '/';
          if (port === 3000 && s.webUp) return '<!DOCTYPE html><html>…<h1>DocsBot</h1><span>API: checking…</span>…</html>\n# curl gets the HTML. The badge fills in later, in the browser: try open.';
          if (port !== s.apiPort) return P1_FAIL(port);
          io.send('br', 'api', 'GET ' + path);
          if (path !== '/health') return '{"detail":"Not Found"}';
          s.healthOk = true; io.send('api', 'br', '200', 'ok');
          return '{"status":"ok"}';
        } },
        { re: /^npm\s+run\s+dev$/i, help: 'npm run dev', desc: 'start Next.js (in web/)', run(m, s) {
          if (s.cwd !== 'web') return { err: 'npm error code ENOENT\nnpm error enoent Could not read package.json\nTip: run it inside web/.' };
          s.webUp = true;
          return '> web@0.1.0 dev\n> next dev\n\n   ▲ Next.js\n   - Local:        http://localhost:3000\n   - Environments: .env.local\n\n ✓ Ready in 1.2s';
        } },
        { re: /^open\s+(?:https?:\/\/)?(?:localhost|127\.0\.0\.1):3000\/?$/i, help: 'open http://localhost:3000', desc: 'open the page in a browser', run(m, s, io) {
          if (!s.webUp) { s.badge = null; return { err: '[browser] This site can\'t be reached. localhost refused to connect.' }; }
          const port = +(s.webUrl.match(/:(\d+)/) || [0, 80])[1];
          io.send('web', 'br', 'page'); io.send('br', 'api', 'GET /health', port === s.apiPort ? undefined : 'bad');
          if (port === s.apiPort) { s.badge = 'ok'; return '[browser] DocsBot    API: ok'; }
          s.badge = 'down';
          return { err: '[browser] DocsBot    API: down\n[console] GET ' + s.webUrl + '/health net::ERR_CONNECTION_REFUSED' };
        } },
        { re: /^echo\s+['"]?NEXT_PUBLIC_API_URL=(\S+?)['"]?\s*>\s*\.env\.local$/i, help: 'echo \'NEXT_PUBLIC_API_URL=http://localhost:8000\' > .env.local', desc: 'set the API URL for the page', run(m, s) {
          if (s.cwd !== 'web') return { err: 'Tip: .env.local lives in web/. cd there first.' };
          s.webUrl = m[1].replace(/\/$/, ''); return s.webUp ? '(next dev) Reload env: .env.local' : '';
        } },
        { re: /^cp\s+\.env\.example\s+\.env$/i, help: 'cp .env.example .env', desc: 'make your local secrets file', run(m, s) {
          if (s.cwd !== 'root') return { err: 'cp: .env.example: No such file or directory\nTip: it lives in the repo root (cd ..).' };
          s.envMade = true; return '';
        } },
        { re: /^git\s+check-ignore\s+(?:-v\s+)?(\S+)$/i, help: 'git check-ignore -v .env', desc: 'ask git why a file is ignored', run(m, s) {
          if (s.cwd !== 'root' || m[1].replace(/^\.\//, '') !== '.env') return { err: '(no output: not ignored)' };
          if (s.envMade) s.proved = true;
          return /-v/.test(m[0]) ? '.gitignore:1:.env\t.env' : '.env';
        } },
        { re: /^git\s+status\b(.*)$/i, help: 'git status --ignored', desc: 'see what git would commit', run(m, s) {
          if (s.envMade) s.proved = true;
          const up = s.cwd === 'root' ? '' : '../';
          let out = 'On branch main\n\nNo commits yet\n\nUntracked files:\n\t' + up + '.env.example\n\t' + up + '.gitignore\n\t' + (up ? up + 'api/\n\t' + up + 'web/' : 'api/\n\tweb/');
          if (/--ignored/.test(m[1])) out += '\n\nIgnored files:' + (s.envMade ? '\n\t' + up + '.env' : '') + '\n\t' + up + 'api/.venv/\n\t' + up + 'web/node_modules/';
          return out + (s.envMade && !/--ignored/.test(m[1]) ? '\n# .env is not listed: git ignores it.' : '');
        } },
        { re: /^(uv|npm|npx|git|curl|open|echo)\b.*$/i, help: 'uv | npm | git | curl …', desc: 'other forms are not simulated here', run: () => ({ err: 'Not simulated. Type help for the commands this sandbox knows.' }) }
      ],
      view: s => ({
        nodes: {
          envl: { x: 110, y: 60, label: 'web/.env.local', w: 140, sub: 'API_URL :' + ((s.webUrl.match(/:(\d+)/) || [])[1] || '?'), kind: 'd', state: s.apiPort && s.webUrl.endsWith(':' + s.apiPort) ? 'ok' : s.badge === 'down' ? 'bad' : undefined },
          web: { x: 110, y: 195, label: 'Next.js dev', sub: s.webUp ? ':3000 · running' : 'stopped', kind: 'a', state: s.webUp ? 'ok' : 'off' },
          br: { x: 400, y: 195, label: 'Browser', sub: s.badge ? 'API: ' + s.badge : 'not opened', kind: 'a', state: s.badge === 'ok' ? 'ok' : s.badge === 'down' ? 'bad' : 'off' },
          api: { x: 690, y: 195, label: 'FastAPI', sub: s.apiPort ? ':' + s.apiPort + ' · running' : 'stopped', kind: 'b', state: s.healthOk ? 'ok' : s.apiPort ? undefined : 'off' },
          env: { x: 690, y: 60, shape: 'db', w: 130, label: '.env', sub: s.proved ? 'ignored by git' : s.envMade ? 'created' : 'not created', kind: 'd', state: s.proved ? 'ok' : s.envMade ? 'warn' : 'off' }
        },
        edges: [['envl', 'web', 'API_URL'], ['web', 'br', 'page'], ['br', 'api', { label: 'GET /health', tone: s.badge === 'ok' ? 'ok' : s.badge === 'down' ? 'bad' : undefined }], ['env', 'api', 'settings']],
        vars: { cwd: P1_DIRS[s.cwd] }
      }),
      goals: [
        { text: 'Start the API and get `{"status":"ok"}` from `/health`', check: s => s.healthOk, solve: ['cd api', 'uv run uvicorn app.main:app --reload', 'curl localhost:8000/health'] },
        { text: 'Start the web app and see **API: ok** in the browser', check: s => s.badge === 'ok', solve: ['cd ../web', 'npm run dev', 'open http://localhost:3000', 'cat .env.local', 'echo \'NEXT_PUBLIC_API_URL=http://localhost:8000\' > .env.local', 'open http://localhost:3000'] },
        { text: 'Create `.env` and prove git ignores it', check: s => s.envMade && s.proved, solve: ['cd ..', 'cp .env.example .env', 'git check-ignore -v .env'] }
      ],
      hints: ['The API lives in `api/`: `cd api`, then `uv run uvicorn app.main:app --reload`, then `curl localhost:8000/health`.', 'The page says **API: down**. Read the console line: which port does it call? Check `cat .env.local` in `web/`.', 'In `web/`: `echo \'NEXT_PUBLIC_API_URL=http://localhost:8000\' > .env.local`. For the secrets goal: `cd ..`, `cp .env.example .env`, `git check-ignore -v .env`.'],
      try: ['cd api', 'uv run uvicorn app.main:app --reload', 'curl localhost:8000/health', 'npm run dev', 'open http://localhost:3000'],
      welcome: 'You are in ~/docsbot. The code from this step is already written. Type help for commands.',
      done: 'Both halves talk, and secrets stay local. A stale `.env.local` pointing at the wrong port is a classic: always read the browser console first.' },
    { t: 'check', h: 'Make it real: run it on your machine',
      body: 'Run both servers in two terminal tabs, then tick each line.',
      lang: 'Shell',
      code: '# tab 1\ncd docsbot/api && uv run uvicorn app.main:app --reload\ncurl localhost:8000/health\n# tab 2\ncd docsbot/web && npm run dev\n# repo root\ncp .env.example .env && git check-ignore -v .env',
      items: ['I ran `curl localhost:8000/health` and got `{"status":"ok"}`.', 'I opened http://localhost:3000 and saw **API: ok**.', 'I ran `git check-ignore -v .env` and it named `.gitignore`.', 'I ran `uv run pytest` in `api/` and the health test passed.'] },
    { t: 'quiz', q: 'You pushed `.env` with a real [[API key]] to GitHub. One minute later you delete it and push again. What now?',
      options: ['Revoke the key and make a new one: the old commit still has it', 'Nothing: the file is gone from the latest commit', 'Make the repo private and keep the key', 'Add `.env` to `.gitignore`, and the old commit is cleaned up'], answer: 0,
      why: 'Git keeps every commit, and bots scan GitHub for keys within minutes. Treat a pushed key as leaked: revoke it, then add `.env` to `.gitignore`.',
      whyNot: { 1: 'Deleting only changes the newest commit. The key is still in history, one `git log -p` away.', 2: 'Forks, clones and scanners may already have it. Private later does not undo public now.', 3: '`.gitignore` only stops future adds. It never rewrites old commits.' } },
    { t: 'recap', points: ['DocsBot is two apps: FastAPI in `api/` on :8000 and Next.js in `web/` on :3000.', 'Settings come from env vars and `.env` via `pydantic-settings`, never from code.', '[[CORS]] must allow the exact page origin, `http://localhost:3000`. `curl` ignores CORS; browsers do not.', '`.env` is git-ignored; `.env.example` is committed with names only.'],
      cheat: [['uv init api --python 3.12', 'Create the Python project'], ['uv add fastapi "uvicorn[standard]"', 'Add the web server deps'], ['uv run uvicorn app.main:app --reload', 'Run the API on :8000'], ['curl localhost:8000/health', 'Check the API is up'], ['npx create-next-app@latest web --yes', 'Create the Next.js app'], ['git check-ignore -v .env', 'Prove git ignores your secrets']] }
  ]
};

/* ---------- Step 2: stream the first answer ---------- */
const P1_DELTAS = ['DocsBot', ' answers', ' questions', ' about', ' your docs', '.'];
const P1_chatCurl = (m, s, io) => {
  const a = m[1];
  if (!/(localhost|127\.0\.0\.1):8000\/chat\b/.test(a)) return /:8000\/health/.test(a) && s.up ? '{"status":"ok"}' : !s.up ? P1_FAIL(8000) : { err: '{"detail":"Not Found"}' };
  if (!s.up) return P1_FAIL(8000);
  if (!/--json\b/.test(a) && !/-H\s+['"]?content-type:\s*application\/json/i.test(a)) return { err: '{"detail":[{"type":"model_attributes_type","loc":["body"],"msg":"Input should be a valid dictionary or object to extract fields from"}]}\n# 422: add -H \'content-type: application/json\'' };
  if (!/"message"\s*:\s*"[^"]+"/.test(a)) return { err: '{"detail":[{"type":"missing","loc":["body","message"],"msg":"Field required"}]}' };
  io.send('cli', 'api', 'POST /chat'); io.send('api', 'llm', 'stream=True');
  if (!s.loaded) {
    s.saw401 = true; s.last = 401; io.send('llm', 'api', '401', 'bad');
    return { err: '[uvicorn] INFO:     127.0.0.1:52144 - "POST /chat HTTP/1.1" 200 OK\n[uvicorn] ERROR:    Exception in ASGI application\n[uvicorn] openai.AuthenticationError: Error code: 401 - {\'error\': {\'message\': "You didn\'t provide an API key."}}\ncurl: (18) transfer closed with outstanding read data remaining' + (s.keySet ? '\n# .env has the key now, but uvicorn read settings at startup. --reload only watches .py files: restart it.' : '') };
  }
  s.last = 200; s.streamed = true; io.send('llm', 'api', 'tokens', 'ok'); io.send('api', 'cli', 'data: …', 'ok');
  const lines = P1_DELTAS.map(t => 'data: {"type":"delta","text":"' + t + '"}\n').join('\n') + '\ndata: [DONE]\n';
  if (/(^|\s)(-N|--no-buffer)\b/.test(a)) { s.ttft = 0.42; return lines + '\n⏱ first data line after 0.42 s · ' + P1_DELTAS.length + ' deltas in 1.3 s'; }
  return lines + '\n# Without -N, curl may hold output in a buffer. Add -N to watch lines arrive and time the first one.';
};

const P1_chat = {
  id: 'cap-chat', title: 'Step 2: Stream your first answer', mins: 12, needs: 'cap-scaffold',
  goal: 'stream model tokens from `POST /chat` to the page over SSE, measure TTFT, and survive a `429` or a missing key.',
  cards: [
    { t: 'read', h: 'Nobody waits 8 seconds for a blank box',
      body: 'A full answer can take 5 to 10 seconds. If the page shows nothing until the end, users think it broke.\n\nWith [[SSE]], the API forwards each [[token]] as the model writes it. The first word shows in under a second. That delay is [[TTFT]], and it is the number users feel.',
      points: ['`api/app/llm.py`: one SDK client and `stream_chat()`', '`POST /chat`: `delta` events, then `[DONE]`', '`web/app/page.tsx`: a stream reader that times TTFT'] },
    { t: 'viz', h: 'One question, token by token',
      body: 'Follow a message through FastAPI to the model and back.',
      nodes: {
        ui: { x: 110, y: 200, label: 'Next.js UI', sub: 'stream reader', kind: 'a' },
        api: { x: 400, y: 200, label: 'FastAPI', sub: 'POST /chat', kind: 'b' },
        llm: { x: 680, y: 200, label: 'LLM provider', w: 140, sub: 'OpenAI-compatible', kind: 'c' }
      },
      edges: [['ui', 'api', 'SSE'], ['api', 'llm', 'stream']],
      steps: [
        { cap: 'The page POSTs `{"message": "What is DocsBot?"}` to `/chat` and starts a [[TTFT]] timer.', do: [['send', 'ui', 'api', '{message}'], ['var', 'TTFT', 'timing…']] },
        { cap: 'FastAPI calls the model with `stream=True`. The provider is busy and answers `429`: a [[rate limit]].', do: [['send', 'api', 'llm', 'stream=True'], ['send', 'llm', 'api', '429', 'bad'], ['set', 'llm', { state: 'warn', sub: '429 Too Many' }]] },
        { cap: 'The SDK backs off and retries by itself (`max_retries=3`). This time the stream opens.', do: [['note', 'api', 'waits ~0.5 s, retries'], ['send', 'api', 'llm', 'retry'], ['set', 'llm', { state: 'ok', sub: '200 · streaming' }]] },
        { cap: 'FastAPI sends the token at once: `data: {"type":"delta","text":"DocsBot"}`. It is on screen. TTFT: 420 ms.', do: [['send', 'llm', 'api', '"DocsBot"', 'ok'], ['send', 'api', 'ui', 'delta', 'ok'], ['var', 'TTFT', '420 ms'], ['set', 'ui', { sub: 'DocsBot…' }]] },
        { cap: 'The reader splits on blank lines, parses each `data:` line, and appends `text`. Words keep flowing.', do: [['send', 'api', 'ui', 'delta'], ['send', 'api', 'ui', 'delta'], ['var', 'deltas', 38]] },
        { cap: 'The model finishes. FastAPI sends `data: [DONE]`, and the reader stops.', do: [['send', 'api', 'ui', '[DONE]', 'ok'], ['set', 'ui', { state: 'ok', sub: 'answer shown' }], ['set', 'api', { state: 'ok' }]] }
      ],
      predict: { at: 3, q: 'The first token, "DocsBot", reaches FastAPI. What should FastAPI do with it?',
        options: ['Send it to the browser right away as one `data:` line', 'Keep it until the whole answer is ready', 'Wait for 10 tokens, then send them together'], answer: 0,
        why: 'Each token goes out the moment it arrives. That is what makes the first word show in under a second.' } },
    { t: 'read', h: 'Write the code: the streaming API',
      body: 'One client, built from settings. `max_retries` and `timeout` handle a busy or stuck provider before the stream starts.',
      lang: 'python',
      code: `# api/app/llm.py
from collections.abc import AsyncIterator
from openai import AsyncOpenAI
from app.settings import settings

client = AsyncOpenAI(
    base_url=settings.llm_base_url,
    api_key=settings.llm_api_key,
    max_retries=3,  # backoff on 429, 5xx and dropped connections
    timeout=30.0,   # seconds: a stuck call fails instead of hanging
)
SYSTEM = "You are DocsBot. Answer briefly and plainly."

async def stream_chat(message: str) -> AsyncIterator[str]:
    stream = await client.chat.completions.create(
        model=settings.llm_model,
        messages=[{"role": "system", "content": SYSTEM},
                  {"role": "user", "content": message}],
        stream=True,
    )
    async for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content

# api/app/main.py (add below /health)
class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=4000)

def sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\\n\\n"

@app.post("/chat")
async def chat(body: ChatIn):
    async def events():
        async for text in stream_chat(body.message):
            yield sse({"type": "delta", "text": text})
        yield "data: [DONE]\\n\\n"
    return StreamingResponse(events(), media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})`,
      points: ['In `api/`: `uv add openai`', 'Imports for `main.py`: `json`, `StreamingResponse` from `fastapi.responses`, `BaseModel, Field` from `pydantic`, `stream_chat` from `app.llm`', '`X-Accel-Buffering: no` stops nginx-style proxies from holding the stream back', 'Fill `LLM_API_KEY` and `LLM_MODEL` in `.env`. For local [[Ollama]], use `LLM_BASE_URL=http://localhost:11434/v1` and any key'] },
    { t: 'read', h: 'Write the code: the stream reader',
      body: 'The browser reads the body chunk by chunk. A chunk can end mid-event, so keep the leftover and wait for the blank line.',
      lang: 'tsx',
      code: `// web/app/page.tsx (keep the step 1 imports, API and health badge)
type Ev = { type: string; text?: string; answer?: unknown };

async function streamChat(message: string, onEvent: (ev: Ev) => void) {
  const res = await fetch(\`\${API}/chat\`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok || !res.body) throw new Error(\`HTTP \${res.status}\`);
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buf += value;
    const events = buf.split("\\n\\n");
    buf = events.pop() ?? ""; // a half-received event waits for more
    for (const e of events) {
      const data = e.replace(/^data: /, "");
      if (data === "[DONE]") return;
      onEvent(JSON.parse(data));
    }
  }
}

// inside Home():
const [text, setText] = useState("");
const [ttft, setTtft] = useState<number | null>(null);
async function ask(q: string) {
  setText(""); setTtft(null);
  const t0 = performance.now();
  try {
    await streamChat(q, (ev) => {
      if (ev.type !== "delta") return;
      setTtft((t) => t ?? Math.round(performance.now() - t0));
      setText((t) => t + (ev.text ?? ""));
    });
  } catch { setText((t) => t + " [connection lost]"); }
}`,
      points: ['Render a form whose submit calls `ask(q)`, then `<p>{text}</p>` and `TTFT {ttft} ms`', 'Use `fetch`, not `EventSource`: `EventSource` can only send `GET`, and `/chat` is a `POST`', '`TextDecoderStream` keeps multi-byte characters intact across chunks'] },
    { t: 'play', kind: 'terminal', h: 'Try it: stream from your API',
      body: 'You are in `docsbot/api`. Your `.env` was copied from `.env.example`.',
      size: [800, 260],
      prompt: 'api $',
      init: () => ({ up: false, keySet: false, loaded: false, saw401: false, streamed: false, ttft: null, last: null }),
      cmds: [
        { re: /^cat\s+(?:\.\.\/)?\.env$/i, help: 'cat ../.env', desc: 'print your settings file', run: (m, s) => 'LLM_BASE_URL=https://api.openai.com/v1\nLLM_API_KEY=' + (s.keySet ? 'sk-…(hidden)' : '') + '\nLLM_MODEL=your-chat-model\nEMBED_MODEL=your-embedding-model\nEMBED_DIM=1536' },
        { re: /^export\s+LLM_API_KEY=["']?([^"'\s]+)["']?$/i, help: 'export LLM_API_KEY=sk-...', desc: 'set the key for this shell', run(m, s) { s.keySet = true; return ''; } },
        { re: /^echo\s+["']?LLM_API_KEY=([^"'\s]+)["']?\s*>>\s*(?:\.\.\/)?\.env$/i, help: 'echo \'LLM_API_KEY=sk-...\' >> ../.env', desc: 'add your key to .env', run(m, s) { s.keySet = true; return ''; } },
        { re: /^uv\s+run\s+uvicorn\s+app\.main:app\b.*$/i, help: 'uv run uvicorn app.main:app --reload', desc: 'start (or restart) the API', run(m, s) {
          const was = s.up; s.up = true; s.loaded = s.keySet;
          return (was ? '^C INFO:     Shutting down (old server stopped)\n' : '') + P1_UVI(8000);
        } },
        { re: /^curl\b(.*)$/i, help: 'curl -N -X POST localhost:8000/chat -H \'content-type: application/json\' -d \'{"message":"What is DocsBot?"}\'', desc: 'call the API', run: (m, s, io) => P1_chatCurl(m, s, io) }
      ],
      view: s => ({
        nodes: {
          cli: { x: 110, y: 190, label: 'curl', sub: s.streamed ? 'got the stream' : 'POST /chat', kind: 'a', state: s.streamed ? 'ok' : undefined },
          api: { x: 400, y: 190, label: 'FastAPI', sub: s.up ? ':8000 · running' : 'stopped', kind: 'b', state: s.up ? (s.last === 401 ? 'bad' : s.last === 200 ? 'ok' : undefined) : 'off' },
          llm: { x: 690, y: 190, label: 'LLM provider', w: 140, sub: s.last ? 'last: ' + s.last : 'waiting', kind: 'c', state: s.last === 200 ? 'ok' : s.last === 401 ? 'bad' : undefined },
          env: { x: 400, y: 60, shape: 'db', w: 150, label: '.env', sub: s.keySet ? 'LLM_API_KEY set' : 'LLM_API_KEY empty', kind: 'd', state: s.keySet ? (s.loaded ? 'ok' : 'warn') : 'bad' }
        },
        edges: [['cli', 'api', 'SSE'], ['api', 'llm', 'stream'], ['env', 'api', s.up && s.keySet && !s.loaded ? { label: 'restart to reload', tone: 'warn', dash: true } : 'settings']],
        vars: { TTFT: s.ttft ? Math.round(s.ttft * 1000) + ' ms' : '—', server_key: s.up ? (s.loaded ? 'loaded' : 'missing') : '—' }
      }),
      goals: [
        { text: 'Start the API, send a chat, and find the `401` in the server log', check: s => s.saw401, solve: ['uv run uvicorn app.main:app --reload', 'curl -X POST localhost:8000/chat -H \'content-type: application/json\' -d \'{"message":"What is DocsBot?"}\''] },
        { text: 'Fix it: set `LLM_API_KEY`, restart, and get the stream', check: s => s.streamed, solve: ['echo \'LLM_API_KEY=sk-demo-123\' >> ../.env', 'uv run uvicorn app.main:app --reload', 'curl -X POST localhost:8000/chat -H \'content-type: application/json\' -d \'{"message":"What is DocsBot?"}\''] },
        { text: 'Watch it arrive live with `-N`: TTFT under 1 s', check: s => s.ttft !== null && s.ttft < 1, solve: ['curl -N -X POST localhost:8000/chat -H \'content-type: application/json\' -d \'{"message":"What is DocsBot?"}\''] }
      ],
      hints: ['Start the server first, then run the `curl` suggestion. The `curl` line ends early: read the `[uvicorn]` lines.', 'The key is empty. Run `echo \'LLM_API_KEY=sk-demo-123\' >> ../.env`, then run the `uvicorn` command again to restart.', 'Settings load at startup, and `--reload` only watches `.py` files. Restart, then add `-N` to `curl`.'],
      try: ['uv run uvicorn app.main:app --reload', 'curl -N -X POST localhost:8000/chat -H \'content-type: application/json\' -d \'{"message":"What is DocsBot?"}\'', 'cat ../.env'],
      welcome: 'docsbot/api with the step 2 code. Type help for commands.',
      done: 'Notice the `401` came after a `200`: headers go out before the first token. With streams, always read the server log.' },
    { t: 'check', h: 'Make it real: stream on your machine',
      body: 'Restart uvicorn after any `.env` change.',
      lang: 'Shell',
      code: 'cd docsbot/api && uv add openai\nuv run uvicorn app.main:app --reload\ncurl -N -X POST localhost:8000/chat \\\n  -H \'content-type: application/json\' \\\n  -d \'{"message":"What is DocsBot?"}\'',
      items: ['I ran the `curl -N` command and saw `delta` lines, then `data: [DONE]`.', 'I asked a question on the page, and the words appeared one by one.', 'My page showed a TTFT of about 1 s or less.', 'I blanked `LLM_API_KEY`, restarted, saw the `401` in the uvicorn log, then put the key back.'] },
    { t: 'quiz', kind: 'multi', q: 'The client has `max_retries=3`. Which failures will the SDK retry for you, with backoff?',
      options: ['`429 Too Many Requests`', '`503 Service Unavailable`', '`401 Unauthorized`', 'A connection that times out', '`400 Bad Request`'], answer: [0, 1, 3],
      why: 'Rate limits, server errors and network failures can pass on a retry. A bad key or a bad request fails the same way every time.',
      whyNot: { 2: 'A missing or wrong key will be wrong on every try. Fix `.env`; retrying only wastes time.', 4: 'The request itself is invalid. Sending it again gives the same `400`.' } },
    { t: 'recap', points: ['`stream_chat()` yields each text delta from one `AsyncOpenAI` client built from settings.', '`POST /chat` sends `data: {"type":"delta",…}` lines, then `data: [DONE]`.', 'The page reads with `getReader()`, splits on blank lines, and times [[TTFT]].', '`max_retries` handles `429` and 5xx; `timeout` stops hangs; a `401` means fix the key and restart.'],
      cheat: [['uv add openai', 'Add the OpenAI-compatible SDK'], ['curl -N … localhost:8000/chat', 'Watch raw SSE lines; -N stops buffering'], ['data: {"type":"delta","text":"…"}', 'One streamed piece of text'], ['data: [DONE]', 'The stream is over'], ['res.body.getReader()', 'Read a fetch body chunk by chunk']] }
  ]
};

/* ---------- Step 3: typed answers ---------- */
const P1_CASES = {
  valid: '{"text":"Hi","citations":[{"n":1,"source":"docs/a.md","title":"A"}],"followups":["How?"]}',
  bare: '{"text":"Hi"}',
  bad: ['{"text":"Hi","followups":"How?"}', '{"text":"Hi","citations":[{"n":"1","source":"a.md","title":"A"}]}', '{"followups":[]}'],
  broken: '{"text":"Hi",'
};
const P1_try = (s, raw) => { try { const r = s.api && s.api.parseAnswer && s.api.parseAnswer(raw); return r && typeof r === 'object' ? r : { bad: true }; } catch (e) { return { threw: true }; } };
const P1_okValid = s => { const r = P1_try(s, P1_CASES.valid); return r.success === true && !!r.data && Array.isArray(r.data.followups) && r.data.followups[0] === 'How?' && Array.isArray(r.data.citations) && r.data.citations.length === 1; };
const P1_okBare = s => { const r = P1_try(s, P1_CASES.bare); return r.success === true && !!r.data && r.data.text === 'Hi' && Array.isArray(r.data.citations) && r.data.citations.length === 0 && Array.isArray(r.data.followups) && r.data.followups.length === 0; };
const P1_okBad = s => P1_CASES.bad.every(raw => P1_try(s, raw).success === false);
const P1_okBroken = s => P1_try(s, P1_CASES.broken).success === false;
const P1_SOLUTION = `function parseAnswer(raw) {
  let o;
  try { o = JSON.parse(raw); } catch (e) { return { success: false, error: "not JSON" }; }
  if (!o || typeof o.text !== "string") return { success: false, error: "text must be a string" };
  const citations = o.citations ?? [], followups = o.followups ?? [];
  if (!Array.isArray(followups) || !followups.every(f => typeof f === "string"))
    return { success: false, error: "followups must be string[]" };
  const okCite = c => c && Number.isInteger(c.n) && c.n >= 1
    && typeof c.source === "string" && typeof c.title === "string";
  if (!Array.isArray(citations) || !citations.every(okCite))
    return { success: false, error: "bad citation" };
  return { success: true, data: { text: o.text, citations, followups } };
}

console.log(parseAnswer('{"text":"Hi"}'));`;

const P1_schema = {
  id: 'cap-schema', title: 'Step 3: Typed answers end to end', mins: 12, needs: 'cap-chat',
  goal: 'end every stream with one typed `answer` event, checked by Pydantic on the server and Zod in the browser.',
  cards: [
    { t: 'read', h: 'Text is for people, types are for code',
      body: 'The page now shows streamed text. Soon it also needs data: follow-up questions now, citations in step 5.\n\nIf that data is a loose dict, one renamed field breaks the UI in silence. So every stream ends with one `answer` event that matches a schema. [[Pydantic]] checks it on the way out, and [[Zod]] checks it on the way in.',
      points: ['`api/app/schemas.py`: `Citation` and `Answer`', 'One `answer` event between the deltas and `[DONE]`', '`web/lib/answer.ts`: the Zod mirror, used with `safeParse`'] },
    { t: 'viz', h: 'From free text to a typed event',
      body: 'Follow the end of a stream, after the last delta.',
      nodes: {
        ui: { x: 110, y: 200, label: 'Next.js UI', sub: 'chat page', kind: 'a' },
        api: { x: 400, y: 200, label: 'FastAPI', sub: 'POST /chat', kind: 'b' },
        llm: { x: 680, y: 200, label: 'LLM provider', w: 140, sub: 'streaming', kind: 'c' }
      },
      edges: [['ui', 'api', 'SSE'], ['api', 'llm', 'stream']],
      steps: [
        { cap: 'Deltas stream as before. FastAPI also keeps each piece, so it has the full text at the end.', do: [['send', 'llm', 'api', 'tokens'], ['send', 'api', 'ui', 'delta ×38'], ['var', 'full_text', '"DocsBot answers…"']] },
        { cap: 'A second, small call asks for follow-ups with `response_format`: a JSON schema the model must match.', do: [['send', 'api', 'llm', 'Followups schema'], ['send', 'llm', 'api', '{"followups":[…]}', 'ok'], ['var', 'followups', '3 strings']] },
        { cap: '[[Pydantic]] builds `Answer(text, citations=[], followups)`. A wrong type fails here, on the server.', do: [['add', 'pyd', { x: 400, y: 70, label: 'Pydantic', sub: 'Answer model', kind: 'd', shape: 'pill', state: 'ok' }], ['link', 'api', 'pyd', 'validate']] },
        { cap: 'One `answer` event goes out, then `data: [DONE]`.', do: [['send', 'api', 'ui', 'answer', 'ok'], ['send', 'api', 'ui', '[DONE]']] },
        { cap: 'The browser runs `Answer.safeParse(ev.answer)` with [[Zod]]. It passes, so 3 follow-up chips appear.', do: [['add', 'zod', { x: 110, y: 70, label: 'Zod', sub: 'safeParse', kind: 'd', shape: 'pill', state: 'ok' }], ['link', 'ui', 'zod', 'check'], ['set', 'ui', { state: 'ok', sub: '3 chips' }]] },
        { cap: 'A new API build sends `followups` as one string. `safeParse` fails: chips hidden, warning logged, the answer text stays.', do: [['set', 'zod', { state: 'bad', sub: 'success: false' }], ['set', 'ui', { state: 'warn', sub: 'text, no chips' }], ['note', 'ui', 'console.warn(issues)']] }
      ],
      predict: { at: 5, q: 'A new API build sends `followups` as one string, not a list. The old web build is still live. What happens?',
        options: ['`safeParse` fails: the chips are hidden, the answer text still shows', 'The page crashes with a white screen', 'Zod turns the string into a list by itself'], answer: 0,
        why: '`safeParse` returns `success: false` instead of throwing. The UI skips the extras and keeps the streamed text.' } },
    { t: 'read', h: 'Write the code: the schema on the server',
      body: 'Stream plain text for speed, then make one small [[structured output]] call for follow-ups. The model\'s JSON must match the `Followups` schema.',
      lang: 'python',
      code: `# api/app/schemas.py
from pydantic import BaseModel, Field

class Citation(BaseModel):
    n: int = Field(ge=1)   # the [n] marker in the text
    source: str            # e.g. "docs/billing.md"
    title: str

class Answer(BaseModel):
    text: str
    citations: list[Citation] = []
    followups: list[str] = []

class Followups(BaseModel):  # only for the structured-output call
    followups: list[str]

# api/app/llm.py (add)
async def suggest_followups(question: str, text: str) -> list[str]:
    try:
        r = await client.chat.completions.parse(
            model=settings.llm_model,
            messages=[{"role": "system", "content": "Suggest 3 short follow-up questions."},
                      {"role": "user", "content": f"Q: {question}\\nA: {text}"}],
            response_format=Followups,
        )
        parsed = r.choices[0].message.parsed
        return parsed.followups[:3] if parsed else []
    except (OpenAIError, ValidationError):
        return []  # a nice-to-have must never break the answer

# api/app/main.py: the new events()
    async def events():
        parts = []
        async for text in stream_chat(body.message):
            parts.append(text)
            yield sse({"type": "delta", "text": text})
        full = "".join(parts)
        answer = Answer(text=full, followups=await suggest_followups(body.message, full))
        yield sse({"type": "answer", "answer": answer.model_dump()})
        yield "data: [DONE]\\n\\n"`,
      points: ['Imports: `OpenAIError` from `openai`, `ValidationError` from `pydantic`, `Followups` and `Answer` from `app.schemas`', '`parse()` turns the Pydantic model into a strict JSON schema and gives back a typed object', 'Trade-off: one extra small call (about 0.5 s) after the text, but TTFT stays fast and the JSON is always valid', '`tests/test_schemas.py` checks defaults, bad types and a JSON round trip (see the check card)'] },
    { t: 'read', h: 'Write the code: the Zod mirror',
      body: 'Same fields, same defaults. `safeParse` never throws, so bad data hides the extras instead of crashing the page.',
      lang: 'ts',
      code: `// web/lib/answer.ts   (npm i zod)
import { z } from "zod";

export const Citation = z.object({
  n: z.number().int().min(1),
  source: z.string(),
  title: z.string(),
});

export const Answer = z.object({
  text: z.string(),
  citations: z.array(Citation).default([]),
  followups: z.array(z.string()).default([]),
});
export type Answer = z.infer<typeof Answer>;

// web/app/page.tsx: import { Answer } from "@/lib/answer";
const [followups, setFollowups] = useState<string[]>([]);
// in ask(): setFollowups([]) first, then handle both event types
await streamChat(q, (ev) => {
  if (ev.type === "delta") { /* as in step 2 */ }
  if (ev.type === "answer") {
    const res = Answer.safeParse(ev.answer);
    if (res.success) setFollowups(res.data.followups);
    else console.warn("bad answer event", res.error.issues);
  }
});
// under the answer: one chip per follow-up
{followups.map((f) => <button key={f} onClick={() => ask(f)}>{f}</button>)}`,
      points: ['When you change a field, change it in `schemas.py` and `answer.ts` in the same commit', 'Keep the step 2 `delta` handling: the text streams in as before'] },
    { t: 'play', kind: 'code', h: 'Try it: write a tiny `safeParse`',
      body: 'Write `parseAnswer(raw)` like Zod\'s `safeParse`: never throw, return `{success, data}` or `{success: false, error}`.',
      size: [800, 240],
      starter: `// raw is the JSON text of an Answer, e.g. '{"text":"Hi"}'
function parseAnswer(raw) {
  const obj = JSON.parse(raw);
  return { success: true, data: obj };
}

console.log(parseAnswer('{"text":"Hi"}'));`,
      expose: ['parseAnswer'],
      view: s => {
        const st = (ok, ran) => !ran ? 'off' : ok ? 'ok' : 'bad', ran = !!(s.api && s.api.parseAnswer);
        const v = ran && P1_okValid(s), b = ran && P1_okBare(s), x = ran && P1_okBad(s), k = ran && P1_okBroken(s);
        return {
          nodes: {
            c1: { x: 100, y: 55, label: 'valid', sub: 'expect success', kind: 'n', state: st(v, ran) },
            c2: { x: 280, y: 55, label: 'only text', sub: 'lists default []', kind: 'n', state: st(b, ran) },
            c3: { x: 100, y: 180, label: 'wrong types', sub: 'expect false', kind: 'n', state: st(x, ran) },
            c4: { x: 280, y: 180, label: 'broken JSON', sub: 'false, no throw', kind: 'n', state: st(k, ran) },
            pa: { x: 500, y: 118, label: 'parseAnswer()', w: 140, shape: 'pill', kind: 'b', state: ran ? undefined : 'off' },
            ui: { x: 690, y: 118, label: 'Chips', sub: v && x ? 'shown safely' : 'not safe yet', kind: 'a', state: v && b && x && k ? 'ok' : ran ? 'warn' : 'off' }
          },
          edges: [['c1', 'c2', { arrow: false, dash: true }], ['c3', 'c4', { arrow: false, dash: true }], ['c2', 'pa'], ['c4', 'pa'], ['pa', 'ui', 'result']]
        };
      },
      goals: [
        { text: 'Valid answers pass, and missing lists default to `[]`', check: s => P1_okValid(s) && P1_okBare(s), solve: [P1_SOLUTION] },
        { text: 'Wrong types return `success: false`', check: P1_okBad, solve: [P1_SOLUTION] },
        { text: 'Broken JSON returns `success: false` instead of throwing', check: P1_okBroken, solve: [P1_SOLUTION] }
      ],
      hints: ['Start with the defaults: `const followups = obj.followups ?? []`, and the same for `citations`.', 'Check types before you return: `typeof o.text === "string"`, `Array.isArray(followups)`, and each citation\'s `n` with `Number.isInteger`.', 'Wrap `JSON.parse(raw)` in `try { … } catch { return { success: false, error: "not JSON" }; }`.'],
      done: 'That is what Zod does for you, from one declaration. In the real app, use `Answer.safeParse` instead of hand-written checks.' },
    { t: 'check', h: 'Make it real: typed answers on your machine',
      body: 'Add this test in `api/tests/test_schemas.py`, then run it.',
      lang: 'python',
      code: `import pytest
from pydantic import ValidationError
from app.schemas import Answer

def test_defaults():
    a = Answer(text="Hi")
    assert a.citations == [] and a.followups == []

def test_rejects_bad_citation():
    with pytest.raises(ValidationError):
        Answer(text="Hi", citations=[{"n": "two", "source": "a.md"}])

def test_round_trip():
    a = Answer(text="Hi", citations=[{"n": 1, "source": "docs/a.md", "title": "A"}])
    assert Answer.model_validate_json(a.model_dump_json()) == a

# run:  cd docsbot/api && uv run pytest`,
      items: ['I ran `uv run pytest` and all the schema tests passed.', 'My `curl -N` output ends with one `answer` event, then `data: [DONE]`.', 'The page shows follow-up chips, and clicking one asks that question.', 'I changed `followups` to `z.string()` in Zod, saw the chips vanish and a console warning, then undid it.'] },
    { t: 'quiz', q: 'Why get follow-ups from a second, structured-output call instead of asking the streamed answer to end with JSON?',
      options: ['The text streams fast and plain, and the schema call always returns valid JSON', 'Models cannot write JSON while streaming', 'One call would cost more tokens than two', 'Zod can only parse JSON from a separate request'], answer: 0,
      why: 'Mixing prose and JSON in one stream means half-written JSON on screen and fragile parsing. A small schema-bound call keeps both parts clean, for about half a second more.',
      whyNot: { 1: 'They can. The trouble is the user sees raw JSON mid-stream, and one bad brace breaks the parse.', 2: 'Two calls usually cost a little more, not less. We pay that for reliability.', 3: 'Zod parses any value. Where the JSON came from does not matter to it.' } },
    { t: 'recap', points: ['`Answer(text, citations, followups)` is one contract, in [[Pydantic]] and in [[Zod]].', 'The server streams deltas, then sends one validated `answer` event, then `[DONE]`.', 'Follow-ups come from a small [[structured output]] call; if it fails, they are just `[]`.', 'The browser uses `safeParse`: bad data hides extras, it never crashes the page.'],
      cheat: [['uv run pytest', 'Run the schema tests'], ['npm i zod', 'Add Zod to the web app'], ['Answer.model_dump()', 'Pydantic model → JSON-ready dict'], ['client.chat.completions.parse(...)', 'Model call bound to a schema'], ['Answer.safeParse(ev.answer)', 'Check data in the browser, no throw']] }
  ]
};
