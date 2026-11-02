// Module 1, lessons 1–3: first call, tokens, sampling. Every top-level name starts with A_.
const A_GLOSS = {
  'BPE': 'Byte-pair encoding. The tokenizer starts from single bytes and keeps merging the most common pairs, so frequent words become one token and rare words become several.',
  'softmax': 'A formula that turns a list of raw scores (logits) into probabilities that are all positive and add up to 1.'
};

/* ---------- Lesson 1: first call ---------- */
const A_ANSWERS = {
  'say hi': 'Hi! How can I help you today?',
  default: 'Sure. Here is a short, plain answer. A model call is a normal HTTP request. You send JSON, you get JSON back, and you pay for the tokens on both sides of the call.'
};
const A_words = t => t.trim().split(/\s+/).filter(Boolean);
const A_toks = t => Math.max(1, Math.round(A_words(t).length * 1.3));

function A_call(s, prompt, max) {
  if (!s.key) { s.last = { code: 401 }; return { err: 'HTTP/1.1 401 Unauthorized\n{"error": {"type": "authentication_error", "message": "missing API key"}}' }; }
  if (!/^sk-\w/.test(s.key)) { s.last = { code: 401 }; return { err: 'HTTP/1.1 401 Unauthorized\n{"error": {"type": "authentication_error", "message": "invalid API key"}}' }; }
  const recent = s.accepted.filter(t => t > s.t - 10);
  if (recent.length >= 3) {
    s.saw429 = true; s.last = { code: 429 };
    return { err: 'HTTP/1.1 429 Too Many Requests\nretry-after: ' + Math.ceil(recent[0] + 10 - s.t) + '\n{"error": {"type": "rate_limit_error", "message": "limit is 3 requests per 10 s"}}', code: 429 };
  }
  s.accepted.push(s.t);
  const full = A_ANSWERS[prompt.toLowerCase().replace(/[^\w ]/g, '').trim()] || A_ANSWERS.default;
  const need = A_toks(full), cut = max < need;
  const text = cut ? A_words(full).slice(0, Math.max(1, Math.floor(max / 1.3))).join(' ') : full;
  const usage = { in: A_toks(prompt) + 8, out: cut ? max : need }, stop = cut ? 'max_tokens' : 'end_turn';
  s.ok200++; s.last = { code: 200, usage, stop };
  if (cut) s.maxStop = true;
  return 'HTTP/1.1 200 OK\n{\n  "content": [{"type": "text", "text": "' + text  + '"}],\n  "usage": {"input_tokens": ' + usage.in + ', "output_tokens": ' + usage.out + '},\n  "stop_reason": "' + stop + '"\n}';
}

const A_first_call = {
  id: 'first-call', title: 'Your first model call: it\'s just an API', mins: 8,
  goal: 'call a model from your backend, read the `usage` field, and survive a `429`.',
  cards: [
    { t: 'read', h: 'You have done this before',
      body: 'You have called Stripe to charge a card. You have called Twilio to send a text. Both were an HTTP `POST` with a secret key, and both sent JSON back.\n\nAn [[LLM]] is the same thing. You `POST` some text, and it returns JSON with more text. No math, no GPUs, no training.\n\nIt is just slower and metered. One call can take 5 to 30 seconds, and you pay for every word in and out.',
      analogy: 'Think of the model as a slow third-party microservice that bills per word. Your job is the same as with any paid API: keep the key secret, watch the bill, and retry politely.',
      points: ['Request: JSON with your text and a few settings', 'Response: JSON with the answer and a usage count', 'Errors: the usual HTTP codes, like `401` and `429`'] },
    { t: 'viz', h: 'One request, end to end',
      body: 'Step through a chat message as it travels from the browser to the model and back.',
      nodes: {
        br: { x: 100, y: 190, label: 'Browser', sub: 'React app', kind: 'a' },
        be: { x: 330, y: 190, label: 'Your backend', w: 140, sub: 'POST /api/chat', kind: 'b' },
        pr: { x: 640, y: 190, label: 'Model provider', w: 150, sub: 'api.llm.dev', kind: 'c' }
      },
      edges: [['br', 'be'], ['be', 'pr']],
      steps: [
        { cap: 'The browser sends the user\'s question to **your** backend, not to the model provider.', do: [['send', 'br', 'be', '{question}'], ['focus', 'br', 'be']] },
        { cap: 'Your backend builds the request body: `model`, `system`, `messages` and `max_tokens`.', do: [['var', 'model', '"<model-name>"'], ['var', 'system', '"You are a support bot"'], ['var', 'messages', '[{role:"user", …}]'], ['var', 'max_tokens', 400], ['note', 'be', 'Builds the JSON body']] },
        { cap: 'The backend reads the [[API key]] from an environment variable. The browser never sees it.', do: [['add', 'env', { x: 330, y: 320, shape: 'db', w: 130, label: 'env var', sub: 'LLM_API_KEY', kind: 'd', state: 'ok' }], ['link', 'env', 'be', 'process.env'], ['focus', 'env', 'be']] },
        { cap: 'The provider replies `200` with `content`, `usage` (token counts) and `stop_reason`.', do: [['send', 'be', 'pr', 'POST /v1/messages'], ['send', 'pr', 'be', '200 OK', 'ok'], ['var', 'usage', '{input_tokens: 42, output_tokens: 118}'], ['var', 'stop_reason', '"end_turn"'], ['set', 'pr', { state: 'ok' }]] },
        { cap: 'Your backend sends only the answer text back. It also logs `usage`, because that is your bill.', do: [['send', 'be', 'br', 'answer text', 'ok'], ['note', 'be', 'Log usage for cost']] },
        { cap: 'Launch day: too many calls at once. The provider answers `429` with a `retry-after` header. That is a [[rate limit]].', do: [['set', 'pr', { state: 'warn', sub: '429 Too Many Requests' }], ['send', 'be', 'pr', 'POST'], ['send', 'pr', 'be', '429', 'bad'], ['var', 'retry-after', '2']] },
        { cap: 'The backend waits 1 s, then 2 s, then retries. That is [[exponential backoff]]. The next try gets `200`.', do: [['set', 'pr', { state: 'ok', sub: 'api.llm.dev' }], ['send', 'be', 'pr', 'retry after 2 s'], ['send', 'pr', 'be', '200 OK', 'ok'], ['var', 'retry-after', null], ['note', 'be', 'wait 1 s → 2 s → 4 s']] }
      ],
      predict: { at: 2, q: 'The backend needs the API key to call the provider. Where should the key live?',
        options: ['In an environment variable on your server', 'In the React bundle, so the browser can call the provider directly', 'In localStorage after the user logs in'], answer: 0,
        why: 'Only your server should hold the key. Anything sent to the browser can be copied from DevTools in seconds.' } },
    { t: 'quiz', q: 'A teammate puts the model key in `NEXT_PUBLIC_LLM_KEY` so the React app can call the provider directly. What is the real problem?',
      options: ['Every visitor can copy the key from the JS bundle and spend your money', 'The call will be slower than going through the backend', 'Environment variables cannot hold strings that start with `sk-`', 'The provider blocks requests that come from browsers on weekends'], answer: 0,
      why: '`NEXT_PUBLIC_` values are baked into the bundle. Anyone can read them in DevTools. Keep the key on the server and proxy the call.',
      whyNot: { 1: 'Speed is not the issue. The issue is that the secret is now public.', 2: 'Env vars hold any string. The problem is where this one ends up: in the browser.', 3: 'There is no such rule. The risk is a leaked key, not a blocked request.' } },
    { t: 'play', kind: 'terminal', h: 'Try it: call the model from your server',
      body: 'This terminal is your server. The sandbox `http` command sends your `LLM_API_KEY` env var as a header, the way an SDK does. The limit is **3 requests per 10 seconds**. Each command takes about 1 second.',
      size: [800, 300],
      init: () => ({ t: 0, key: null, accepted: [], last: null, ok200: 0, saw429: false, recovered: false, maxStop: false }),
      cmds: [
        { re: /^export\s+LLM_API_KEY=["']?([^"'\s]*)["']?$/i, help: 'export LLM_API_KEY=sk-...', desc: 'store your API key in an env var', run(m, s) { s.t++; s.key = m[1]; return ''; } },
        { re: /^echo\s+\$LLM_API_KEY$/i, help: 'echo $LLM_API_KEY', desc: 'check the key is set', run: (m, s) => s.key ? s.key.slice(0, 6) + '…' + ' (hidden)' : '(empty)' },
        { re: /^sleep\s+(\d+)$/i, help: 'sleep <seconds>', desc: 'wait before the next call', run(m, s) { s.t += Math.min(+m[1], 60); return ''; } },
        { re: /^http\s+(?:POST\s+)?(?:https?:\/\/)?api\.llm\.dev\/v1\/messages\b(.*)$/i, help: 'http POST api.llm.dev/v1/messages prompt="Say hi" max_tokens=50', desc: 'call the model (add --retry 3 to back off on 429)', run(m, s, io) {
          const a = m[1], pm = a.match(/prompt=(?:"([^"]*)"|'([^']*)'|(\S+))/i), mm = a.match(/max_tokens:?=(\d+)/i), rm = a.match(/--retry(?:[ =](\d+))?/i);
          if (!pm) return { err: 'error: add a prompt, e.g. prompt="Say hi"' };
          const prompt = pm[1] || pm[2] || pm[3], max = mm ? +mm[1] : 1024, tries = rm ? Math.min(+(rm[1] || 3), 5) : 0;
          s.t++; io.send('srv', 'prov', 'POST');
          let r = A_call(s, prompt, max), log = '', wait = 1, hit = false;
          for (let i = 0; i < tries && r.code === 429; i++) {
            hit = true; log += '429 → backing off ' + wait + ' s (try ' + (i + 2) + ')\n';
            s.t += wait; wait *= 2; io.send('srv', 'prov', 'retry');
            r = A_call(s, prompt, max);
          }
          const ok = typeof r === 'string';
          if (hit && ok) s.recovered = true;
          io.send('prov', 'srv', ok ? '200' : String(s.last.code), ok ? 'ok' : 'bad');
          if (tries && !ok && r.code === 429) return { err: log + r.err + '\ngave up after ' + tries + ' retries' };
          return ok ? log + r : { err: log + r.err };
        } },
        { re: /^(http|curl)\b.*$/i, help: 'http POST <url> prompt=…', desc: 'only api.llm.dev/v1/messages works here', run: () => ({ err: 'HTTP/1.1 404 Not Found\nTry: http POST api.llm.dev/v1/messages prompt="Say hi" max_tokens=50' }) }
      ],
      view: s => {
        const recent = s.accepted.filter(t => t > s.t - 10).length, c = s.last && s.last.code;
        return {
          nodes: {
            srv: { x: 130, y: 90, label: 'Your server', w: 140, sub: 'clock t = ' + s.t + ' s', kind: 'b', state: c === 200 ? 'ok' : undefined },
            env: { x: 130, y: 230, shape: 'db', w: 140, label: 'env', sub: s.key ? 'LLM_API_KEY set' : 'no key yet', kind: 'd', state: s.key ? 'ok' : 'off' },
            prov: { x: 620, y: 90, label: 'Model provider', w: 160, sub: c ? 'last: ' + c : 'api.llm.dev', kind: 'c', state: c === 200 ? 'ok' : c === 429 ? 'warn' : c ? 'bad' : undefined },
            lim: { x: 620, y: 230, label: 'Rate limit', w: 160, sub: recent + ' of 3 used (10 s)', kind: 'n', state: recent >= 3 ? 'warn' : undefined }
          },
          edges: [['env', 'srv', 'reads key'], ['srv', 'prov', 'POST /v1/messages'], ['prov', 'lim', { dash: true, arrow: false }]],
          vars: s.last && s.last.usage ? { input_tokens: s.last.usage.in, output_tokens: s.last.usage.out, stop_reason: s.last.stop } : { status: c || '—' }
        };
      },
      goals: [
        { text: 'Get a `200` and read the `usage` token counts', check: s => s.ok200 > 0, solve: ['export LLM_API_KEY=sk-demo-123', 'http POST api.llm.dev/v1/messages prompt="Say hi" max_tokens=50'] },
        { text: 'Call fast enough to hit a `429 Too Many Requests`', check: s => s.saw429, solve: ['http POST api.llm.dev/v1/messages prompt="Say hi" max_tokens=50', 'http POST api.llm.dev/v1/messages prompt="Say hi" max_tokens=50', 'http POST api.llm.dev/v1/messages prompt="Say hi" max_tokens=50'] },
        { text: 'Recover from the `429` with `--retry 3` (exponential backoff)', check: s => s.recovered, solve: ['http POST api.llm.dev/v1/messages prompt="Say hi" max_tokens=50 --retry 3'] }
      ],
      hints: ['Your first call fails with `401`. The server needs a key first: `export LLM_API_KEY=sk-...`.', 'Run the same `http POST` line 3 or 4 times in a row. The 4th call inside 10 seconds is over the limit.', 'Add `--retry 3` to the end of the `http` line. It waits 1 s, 2 s, 4 s between tries.'],
      try: ['http POST api.llm.dev/v1/messages prompt="Say hi" max_tokens=50', 'export LLM_API_KEY=sk-demo-123', 'http POST api.llm.dev/v1/messages prompt="Explain HTTP" max_tokens=10'],
      welcome: 'Your server, with no key set yet. Type help to see commands.',
      done: 'That is the whole contract: key on the server, JSON in, JSON out, `usage` for the bill, backoff for `429`. Try `max_tokens=10` to see `stop_reason: "max_tokens"`.' },
    { t: 'read', h: 'Common mistake → best practice',
      body: '**Mistake:** calling the provider from the browser with the key in the bundle. Also: retrying a `429` in a tight loop, which only makes the limit worse.\n\n**Best practice:** a small backend route holds the key, calls the provider, and backs off on `429`. Check `stop_reason` too. `"max_tokens"` means the answer was cut off.',
      lang: 'ts',
      code: '// app/api/chat/route.ts (server only)\nexport async function POST(req: Request) {\n  const { question } = await req.json();\n  for (let attempt = 0; attempt < 4; attempt++) {\n    const res = await fetch("https://api.llm.dev/v1/messages", {\n      method: "POST",\n      headers: { "x-api-key": process.env.LLM_API_KEY!, "content-type": "application/json" },\n      body: JSON.stringify({ model: MODEL, max_tokens: 400,\n        messages: [{ role: "user", content: question }] }),\n    });\n    if (res.status !== 429) return Response.json(await res.json());\n    const wait = 2 ** attempt * 1000 + Math.random() * 250; // backoff + jitter\n    await new Promise(r => setTimeout(r, wait));\n  }\n  return new Response("busy, try again", { status: 503 });\n}' },
    { t: 'quiz', kind: 'fill', q: 'You want to log how many tokens a call used. Which response field holds the counts?',
      pre: 'const n = data.', post: '.input_tokens + …', placeholder: 'field name', answer: ['usage'],
      why: '`usage` holds `input_tokens` and `output_tokens`. Multiply them by your price to get the cost of the call.',
      hints: ['It is the field you would read to work out the bill.', 'Five letters, starts with "u".'] },
    { t: 'recap', points: ['An [[LLM]] call is an HTTP `POST` that returns JSON, like Stripe or Twilio.', 'The [[API key]] lives in a server env var, never in the browser.', '`usage` gives token counts for your bill; `stop_reason: "max_tokens"` means the answer was cut.', 'On `429`, retry with [[exponential backoff]] and jitter, not in a tight loop.'],
      cheat: [['export LLM_API_KEY=sk-...', 'Keep the key in a server env var'], ['http POST api.llm.dev/v1/messages prompt="Say hi" max_tokens=50', 'Send one model request'], ['{model, system, messages, max_tokens}', 'The request body fields'], ['data.usage.input_tokens + data.usage.output_tokens', 'Tokens you pay for'], ['wait = 2 ** attempt * 1000 + jitter', 'Backoff delay in ms after a 429']] }
  ]
};

/* ---------- Lesson 2: tokens and the context window ---------- */
const A_WINDOWS = { '8k': 8192, '32k': 32768, '128k': 128000 };
const A_RATIO = { English: 1.3, Code: 2.2, Bangla: 4 };   // example tokens per word
const A_PRICE = { in: 3, out: 15 };                        // example price, $ per 1M tokens
function A_budget(s) {
  const r = A_RATIO[s.v.content] || 1.3, win = A_WINDOWS[s.v.window] || 8192;
  const sys = 400, hist = Math.round(s.v.history * 80 * r), docs = Math.round(s.v.pages * 500 * r), out = s.v.max_tokens;
  const used = sys + hist + docs + out, cost = ((sys + hist + docs) * A_PRICE.in + out * A_PRICE.out) / 1e6;
  return { sys, hist, docs, out, used, win, cost, over: used > win, pct: Math.round(used / win * 100) };
}
const A_n = n => n.toLocaleString('en-US');

const A_tokens = {
  id: 'tokens', title: 'Tokens and the context window', mins: 8, needs: 'first-call',
  goal: 'estimate tokens, budget the context window, and avoid the "prompt is too long" error.',
  cards: [
    { t: 'read', h: 'Why did a 40-page PDF break the chat?',
      body: 'A user uploads a 40-page contract and asks a question. Your backend sends it all. The provider answers `400 Bad Request: prompt is too long`.\n\nYou know body-size limits. Express has `limit: \'1mb\'` and nginx has `client_max_body_size`. Models have one too. It is counted in [[token|tokens]], not bytes.\n\nA token is a chunk of text. It can be a word, part of a word, or one symbol. About **1,000 tokens ≈ 750 English words**.',
      analogy: 'Tokens are the byte payload of the request, but each "byte" has a different size. Short common words are one token. Rare words, code and non-Latin scripts use more tokens for the same text.' },
    { t: 'viz', h: 'From text to tokens to a full window',
      body: 'First see how text is cut into tokens. Then watch one request fill the [[context window]].',
      nodes: {
        sent: { x: 400, y: 30, shape: 'text', w: 420, label: '"Tokenization isn\'t magic!"  (25 characters)' }
      },
      steps: [
        { cap: 'The [[tokenizer]] reads this sentence. It uses [[BPE]]: common pieces were merged into single tokens during training.', do: [['focus', 'sent']] },
        { cap: 'A rare word splits into pieces: `Token` + `ization`. Each piece has a token id, a plain integer.', do: [['add', 't1', { x: 75, y: 95, shape: 'pill', w: 100, label: 'Token', sub: 'id 3404', kind: 'a' }], ['add', 't2', { x: 205, y: 95, shape: 'pill', w: 100, label: 'ization', sub: 'id 2065', kind: 'a' }], ['var', 'tokens', 2]] },
        { cap: 'Common words and symbols are cheap. Note the space is part of the token. 25 characters became 6 tokens.', do: [['add', 't3', { x: 335, y: 95, shape: 'pill', w: 100, label: '␣isn', sub: 'id 4536', kind: 'b' }], ['add', 't4', { x: 465, y: 95, shape: 'pill', w: 100, label: '\'t', sub: 'id 956', kind: 'b' }], ['add', 't5', { x: 595, y: 95, shape: 'pill', w: 100, label: '␣magic', sub: 'id 11204', kind: 'b' }], ['add', 't6', { x: 725, y: 95, shape: 'pill', w: 100, label: '!', sub: 'id 0', kind: 'b' }], ['var', 'tokens', 6]] },
        { cap: 'Now one request. The context window is a single budget, here 8,192 tokens. The [[system prompt]] takes the first 400.', do: [['add', 'win', { x: 400, y: 265, shape: 'group', w: 760, h: 200, label: 'Context window · 8,192 tokens', kind: 'n' }], ['add', 'sys', { x: 115, y: 280, w: 160, label: 'System prompt', sub: '400 tokens', kind: 'b' }], ['var', 'used', '400 / 8,192']] },
        { cap: 'The chat history comes next. Every old message is sent again on every call, so it grows each turn.', do: [['add', 'hist', { x: 305, y: 280, w: 160, label: 'Chat history', sub: '2,600 tokens', kind: 'a' }], ['var', 'used', '3,000 / 8,192']] },
        { cap: 'A retrieved document adds 3,800. The output also needs room: `max_tokens` reserves 1,000. Total 7,800 fits.', do: [['add', 'docs', { x: 495, y: 280, w: 160, label: 'Documents', sub: '3,800 tokens', kind: 'c' }], ['add', 'out', { x: 685, y: 280, w: 160, label: 'Output reserve', sub: 'max_tokens 1,000', kind: 'd' }], ['var', 'used', '7,800 / 8,192'], ['set', 'win', { state: 'ok' }]] },
        { cap: 'The user uploads the 40-page contract: 26,000 tokens. The provider rejects the call with `400`.', do: [['set', 'docs', { sub: '26,000 tokens', state: 'bad' }], ['set', 'win', { state: 'bad' }], ['var', 'used', '30,000 / 8,192'], ['note', 'docs', '400: prompt is too long']] },
        { cap: 'Fix: count tokens on the server before you send. Then trim old history or send only the relevant document parts.', do: [['set', 'docs', { sub: '3,800 tokens', state: 'ok' }], ['set', 'hist', { sub: '1,200 tokens', state: 'ok' }], ['set', 'win', { state: 'ok' }], ['var', 'used', '6,400 / 8,192']] }
      ],
      predict: { at: 6, q: 'The document grows to 26,000 tokens in an 8,192-token window. What does the provider do?',
        options: ['Rejects the request with a 400 error', 'Quietly reads the first part and answers anyway', 'Shrinks max_tokens to make room'], answer: 0,
        why: 'Input plus `max_tokens` must fit the window. If it does not, most providers return `400` and you still waited for the round trip.' } },
    { t: 'quiz', q: 'Roughly how many English words fit in 1,000 tokens?',
      options: ['About 750 words', 'Exactly 1,000 words', 'About 4,000 words', 'About 100 words'], answer: 0,
      why: 'A token is often part of a word. In English, 1,000 tokens ≈ 750 words, or about 4 characters per token.',
      whyNot: { 1: 'Tokens are not words. Long or rare words split into several tokens.', 2: '4,000 is about the number of **characters**, not words.', 3: 'That is far too few. Most common words are a single token.' } },
    { t: 'play', kind: 'controls', h: 'Try it: budget one request',
      body: 'Plan one call for a document Q&A feature. Each history message is about 80 words. Each document page is about 500 words. Prices are an example: $3 per million input tokens, $15 per million output tokens.',
      init: () => ({ overflowSeen: false }),
      controls: [
        { id: 'history', type: 'range', label: 'History messages', min: 0, max: 60, value: 10 },
        { id: 'pages', type: 'range', label: 'Document pages', min: 0, max: 80, value: 2 },
        { id: 'max_tokens', type: 'range', label: 'max_tokens (output)', min: 250, max: 4000, step: 250, value: 1000 },
        { id: 'window', type: 'select', label: 'Context window', options: ['8k', '32k', '128k'], value: '8k' },
        { id: 'content', type: 'select', label: 'Content type', options: ['English', 'Code', 'Bangla'], value: 'English' },
        { id: 'trim', type: 'button', label: 'Trim to last 4 messages', run: s => { s.v.history = Math.min(s.v.history, 4); } }
      ],
      update: s => { if (A_budget(s).over) s.overflowSeen = true; },
      view: s => {
        const b = A_budget(s), H = 230, sc = v => Math.max(4, Math.min(H + 20, Math.round(v / b.win * H)));
        const bar = (x, v, label, kind) => ({ x, y: 330, shape: 'bar', w: 70, h: sc(v), label, sub: A_n(v), kind, state: b.over ? 'bad' : undefined });
        return {
          nodes: {
            sys: bar(90, b.sys, 'System', 'b'), hist: bar(200, b.hist, 'History', 'a'), docs: bar(310, b.docs, 'Docs', 'c'), out: bar(420, b.out, 'Output', 'd'),
            free: { x: 530, y: 330, shape: 'bar', w: 70, h: sc(Math.max(0, b.win - b.used)), label: 'Free', sub: A_n(Math.max(0, b.win - b.used)), kind: 'n', state: 'off' },
            prov: { x: 690, y: 160, label: 'Provider', w: 150, sub: b.over ? '400 too long' : '200 OK', kind: 'c', state: b.over ? 'bad' : 'ok' }
          },
          vars: { window: A_n(b.win), used: A_n(b.used) + ' (' + b.pct + '%)' }
        };
      },
      readout: s => { const b = A_budget(s); return [['Tokens used', A_n(b.used) + ' / ' + A_n(b.win)], ['Window used', b.pct + '%' + (b.over ? ' (overflow)' : '')], ['Example cost per call', '$' + b.cost.toFixed(4)]]; },
      goals: [
        { text: 'Overflow the window and see the provider reject the call', check: s => s.overflowSeen, solve: [{ pages: 20 }] },
        { text: 'Fit a document of **60+ pages** in the window', check: s => s.v.pages >= 60 && !A_budget(s).over, solve: [{ window: '128k', pages: 60 }] },
        { text: 'Keep **10+ pages** and get the example cost per call under **$0.03**', check: s => s.v.pages >= 10 && !A_budget(s).over && A_budget(s).cost < 0.03, solve: [{ pages: 10, max_tokens: 500 }, 'trim'] }
      ],
      hints: ['Drag the document pages up. Watch the "Free" bar shrink.', 'A bigger window holds more pages. Switch the context window to 128k.', 'Output tokens cost 5× more here. Lower `max_tokens` and trim the old history.'],
      done: 'You did capacity planning in tokens. Bigger windows fit more, but every token you send is billed on every call. Try Bangla to see the same text cost about 3× more.' },
    { t: 'read', h: 'Common mistake → best practice',
      body: '**Mistake:** trimming with `text[:32000]` or `text.slice(0, 32000)`. Characters are not tokens. You can cut a JSON object in half, and Bangla or code can still overflow.\n\n**Best practice:** count tokens with a [[tokenizer]] on the server before you send. Each model family has its own tokenizer, so use the right one, or the provider\'s token-count endpoint.',
      lang: 'python',
      code: 'import tiktoken\n\nenc = tiktoken.get_encoding("cl100k_base")\nWINDOW, MAX_OUT = 8192, 1000\n\ndef count(text: str) -> int:\n    return len(enc.encode(text))\n\ndef fit_history(system: str, history: list[str], doc: str) -> list[str]:\n    budget = WINDOW - MAX_OUT - count(system) - count(doc)\n    while history and sum(map(count, history)) > budget:\n        history = history[1:]          # drop the oldest message first\n    return history' },
    { t: 'quiz', kind: 'multi', q: 'Which of these count toward the context window of one request?',
      options: ['The system prompt', 'The earlier chat messages you resend', 'Document text you paste into the prompt', 'The `max_tokens` you reserve for the answer', 'The HTTP headers, like your API key', 'Other users\' requests running at the same time'], answer: [0, 1, 2, 3],
      why: 'Everything the model reads, plus the room for what it writes, shares one budget.',
      whyNot: { 4: 'Headers are for the HTTP layer. The model never reads them, so they use no tokens.', 5: 'Each request has its own window. Other users affect your rate limit, not your context.' } },
    { t: 'recap', points: ['A [[token]] is a chunk of text. 1,000 tokens ≈ 750 English words; code and Bangla use more.', 'The [[context window]] is one budget: system + history + documents + `max_tokens`.', 'Going over returns `400`. Count tokens on the server before you send.', 'You pay for every input token on every call, so trim history and send only what is needed.'],
      cheat: [['len(enc.encode(text))', 'Count tokens with tiktoken'], ['tokens ≈ words × 1.3', 'Quick English estimate'], ['system + history + docs + max_tokens ≤ window', 'The budget rule'], ['cost = in × in_price + out × out_price', 'Cost per call'], ['history = history[1:]', 'Drop the oldest message first']] }
  ]
};

/* ---------- Lesson 3: temperature and top-p ---------- */
const A_CANDS = [['Paris', ' Paris', 8], ['a', ' a', 6], ['located', ' located', 5.5], ['Lyon', ' Lyon', 4.6], ['banana', ' banana', 3.8]];
function A_probs(T, topP) {
  let p;
  if (T <= 0) p = A_CANDS.map((c, i) => (i === 0 ? 1 : 0));
  else { const e = A_CANDS.map(c => Math.exp(c[2] / T)), sum = e.reduce((a, b) => a + b, 0); p = e.map(x => x / sum); }
  const keep = [], order = p.map((x, i) => i).sort((a, b) => p[b] - p[a]);
  let cum = 0;
  for (const i of order) { if (cum >= topP - 1e-9) break; keep.push(i); cum += p[i]; }
  const kept = p.map((x, i) => (keep.includes(i) ? x : 0)), ks = kept.reduce((a, b) => a + b, 0);
  return { raw: p, p: kept.map(x => x / ks), cut: p.map((x, i) => !keep.includes(i)) };
}
function A_rand(s) { // mulberry32, seed stored in state so runs are repeatable
  let t = (s.seed = (s.seed + 0x6D2B79F5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const A_pct = x => (x * 100 < 1 && x > 0 ? '<1' : Math.round(x * 100)) + '%';
const A_vizProbs = T => A_probs(T, 1).raw.map(x => Math.max(4, Math.round(x * 240)));
const A_VZ1 = A_vizProbs(1), A_VZ2 = A_vizProbs(2), A_P1 = A_probs(1, 1).raw, A_P2 = A_probs(2, 1).raw;

const A_sampling = {
  id: 'sampling', title: 'Temperature and top-p: the randomness dials', mins: 8, needs: 'tokens',
  goal: 'pick `temperature` and `top_p` for a task, and explain why extraction needs `temperature: 0`.',
  cards: [
    { t: 'read', h: 'Same input, different JSON',
      body: 'Your invoice parser sends the same PDF twice. The first reply has `"total"`. The second has `"amount_due"`. Your code crashes on the second one.\n\nNothing is broken. The model **samples** each token from a list of options. Two request settings control how random that draw is: [[temperature]] and [[top-p]].\n\nOnce you see the mechanism, choosing the values is easy.',
      analogy: 'It is like a load balancer with weighted random routing. Temperature changes the weights. Top-p removes the worst backends from the pool.' },
    { t: 'viz', h: 'How the next token is picked',
      body: 'The prompt is "The capital of France is". The model must choose the next token.',
      nodes: {
        q: { x: 400, y: 30, shape: 'text', w: 420, label: 'The capital of France is ___' },
        Paris: { x: 160, y: 340, shape: 'bar', w: 70, h: 200, label: 'Paris', sub: 'logit 8.0', kind: 'a' },
        a: { x: 280, y: 340, shape: 'bar', w: 70, h: 150, label: 'a', sub: 'logit 6.0', kind: 'a' },
        located: { x: 400, y: 340, shape: 'bar', w: 70, h: 138, label: 'located', sub: 'logit 5.5', kind: 'a' },
        Lyon: { x: 520, y: 340, shape: 'bar', w: 70, h: 115, label: 'Lyon', sub: 'logit 4.6', kind: 'a' },
        banana: { x: 640, y: 340, shape: 'bar', w: 70, h: 95, label: 'banana', sub: 'logit 3.8', kind: 'e' }
      },
      steps: [
        { cap: 'The model gives every possible next token a raw score, called [[logits]]. Here are the top five.', do: [['focus', 'Paris', 'a', 'located', 'Lyon', 'banana']] },
        { cap: '[[softmax]] turns scores into probabilities that add up to 100%. At temperature 1, Paris gets ' + A_pct(A_P1[0]) + '.', do: A_CANDS.map((c, i) => ['set', c[0], { h: A_VZ1[i], sub: A_pct(A_P1[i]) }]).concat([['var', 'temperature', 1]]) },
        { cap: 'Temperature 0 means [[greedy decoding]]: always take the top token. Same input, same output, every time.', do: [['set', 'Paris', { h: 240, sub: '100%', state: 'ok' }], ['set', 'a', { h: 4, sub: '0%', state: 'off' }], ['set', 'located', { h: 4, sub: '0%', state: 'off' }], ['set', 'Lyon', { h: 4, sub: '0%', state: 'off' }], ['set', 'banana', { h: 4, sub: '0%', state: 'off' }], ['var', 'temperature', 0]] },
        { cap: 'Temperature 2 divides every logit by 2 before softmax. The bars flatten. Paris drops to ' + A_pct(A_P2[0]) + '.', do: A_CANDS.map((c, i) => ['set', c[0], { h: A_VZ2[i], sub: A_pct(A_P2[i]), state: i === 4 ? 'warn' : undefined }]).concat([['var', 'temperature', 2]]) },
        { cap: 'Now sampling draws "banana" about 1 time in 16. A confident wrong token is how a [[hallucination]] starts.', do: [['note', 'banana', 'picked ~6% of the time'], ['focus', 'banana']] },
        { cap: '[[top-p]] 0.9 keeps the smallest set that reaches 90%: four tokens. The tail is cut, so banana can never be drawn.', do: [['set', 'banana', { state: 'bad', sub: 'cut' }], ['var', 'top_p', 0.9]] },
        { cap: 'Rule of thumb: temperature 0 for extraction, routing and classification. Use 0.7–1.0 for creative text.', do: [['var', 'extraction', 'temperature 0'], ['var', 'creative', 'temperature 0.7–1.0']] }
      ],
      predict: { at: 3, q: 'Temperature 2 divides each logit by 2 before softmax. What happens to the bars?',
        options: ['They flatten: unlikely tokens get more likely', 'Paris gets even taller', 'Nothing: temperature only changes the speed'], answer: 0,
        why: 'Dividing shrinks the gaps between scores. Smaller gaps mean more even probabilities, so odd tokens get picked more.' } },
    { t: 'quiz', q: 'You extract `vendor`, `total` and `due_date` from invoices into JSON. Which temperature should you use?',
      options: ['0', '0.7', '1.0', '1.5'], answer: 0,
      why: 'Extraction has one right answer. Temperature 0 picks the most likely token every time, so the same invoice gives the same JSON.',
      whyNot: { 1: '0.7 is for natural-sounding text. Here it adds random variation you then have to handle.', 2: '1.0 is the "normal" creative setting. It can rename keys between runs.', 3: '1.5 flattens the odds a lot. Expect made-up keys and values.' } },
    { t: 'play', kind: 'controls', h: 'Try it: sample the next token',
      body: 'The bars use the real [[softmax]] math on these five [[logits]]. **Sample 20 times** draws 20 tokens with a fixed random seed, so you can repeat a run.',
      init: () => ({ seed: 42, last: null }),
      controls: [
        { id: 'temp', type: 'range', label: 'temperature', min: 0, max: 2, step: 0.1, value: 1 },
        { id: 'top_p', type: 'range', label: 'top_p', min: 0.1, max: 1, step: 0.05, value: 1 },
        { id: 'sample', type: 'button', label: 'Sample 20 times', run: s => {
          const pr = A_probs(s.v.temp, s.v.top_p), counts = A_CANDS.map(() => 0);
          for (let k = 0; k < 20; k++) { let r = A_rand(s), i = 0; while (i < 4 && (r -= pr.p[i]) >= 0) i++; while (pr.p[i] === 0 && i > 0) i--; counts[i]++; }
          s.last = { counts, temp: s.v.temp, topP: s.v.top_p, distinct: counts.filter(Boolean).length, bananaCut: pr.cut[4] };
        } }
      ],
      update: s => { if (s.last && (s.last.temp !== s.v.temp || s.last.topP !== s.v.top_p)) s.last = Object.assign({}, s.last, { stale: true }); },
      view: s => {
        const pr = A_probs(s.v.temp, s.v.top_p), nodes = {}, fresh = s.last && !s.last.stale;
        A_CANDS.forEach((c, i) => {
          nodes[c[0]] = { x: 110 + i * 145, y: 330, shape: 'bar', w: 100, h: Math.max(4, Math.round(pr.p[i] * 240)), label: c[0], sub: pr.cut[i] ? 'cut' : A_pct(pr.p[i]) + (fresh ? ' · ' + s.last.counts[i] + '×' : ''),
            kind: i === 4 ? 'e' : 'a', state: pr.cut[i] ? 'off' : fresh && s.last.counts[i] ? 'ok' : undefined };
        });
        return { nodes, vars: { temperature: s.v.temp, top_p: s.v.top_p, 'last run': fresh ? s.last.distinct + ' different tokens' : '—' } };
      },
      readout: s => { const f = s.last && !s.last.stale; return [['Different tokens in last 20', f ? s.last.distinct : '—'], ['"banana" drawn', f ? s.last.counts[4] + ' times' : '—'], ['banana allowed?', A_probs(s.v.temp, s.v.top_p).cut[4] ? 'no (cut by top_p)' : 'yes']]; },
      goals: [
        { text: 'Get the **same token 20 out of 20** times', check: s => !!s.last && !s.last.stale && s.last.distinct === 1, solve: [{ temp: 0 }, 'sample'] },
        { text: 'Get **3 or more different tokens** in one run of 20', check: s => !!s.last && !s.last.stale && s.last.distinct >= 3, solve: [{ temp: 2 }, 'sample'] },
        { text: 'At temperature **1.5 or more**, sample with "banana" impossible but still 2+ different tokens', check: s => !!s.last && !s.last.stale && s.last.temp >= 1.5 && s.last.bananaCut && s.last.distinct >= 2, solve: [{ temp: 2, top_p: 0.9 }, 'sample'] }
      ],
      hints: ['Which temperature means "always take the top token"?', 'Turn temperature up to flatten the bars, then sample again.', 'Keep temperature at 2 and lower `top_p` to 0.9. Banana should turn grey.'],
      done: 'You saw both dials. Temperature reshapes the odds. Top-p cuts the long tail. Most teams tune one of them and leave the other at its default.' },
    { t: 'read', h: 'Common mistake → best practice',
      body: '**Mistake:** running extraction, routing or classification at temperature 0.7 or higher. You get different keys and labels on each run, and bugs you cannot reproduce.\n\n**Best practice:** use `temperature: 0` for anything your code parses. Keep 0.7–1.0 for chat replies and drafts. Temperature 0 is very stable, but not a promise. Still validate the JSON.',
      lang: 'python',
      code: '@app.post("/invoices/parse")\nasync def parse(inv: InvoiceIn):\n    resp = await client.messages.create(\n        model=MODEL,\n        temperature=0,          # extraction: be boring and repeatable\n        max_tokens=300,\n        system="Return JSON with keys vendor, total, due_date.",\n        messages=[{"role": "user", "content": inv.text}],\n    )\n    return Invoice.model_validate_json(resp.content[0].text)' },
    { t: 'quiz', kind: 'fill', q: 'Complete the request field for nucleus sampling, which cuts the long tail of unlikely tokens:',
      pre: '{ "temperature": 1, "', post: '": 0.9 }', placeholder: 'parameter name', answer: ['top_p', 'top-p', /^top[ _-]?p$/i],
      why: '`top_p: 0.9` keeps only the most likely tokens that add up to 90% and drops the rest.',
      hints: ['It is called "top-p" in docs.', 'In JSON it uses an underscore: `top_…`.'] },
    { t: 'recap', points: ['The model scores every next token ([[logits]]); [[softmax]] turns scores into probabilities.', '[[temperature]] divides the logits: 0 is greedy and repeatable, higher is flatter and more random.', '[[top-p]] keeps the smallest set of tokens that reaches `p` and cuts the odd tail.', 'Use 0 for extraction, routing and classification; 0.7–1.0 for creative text.'],
      cheat: [['p_i = exp(logit_i / T) / Σ exp(logit_j / T)', 'Softmax with temperature T'], ['"temperature": 0', 'Extraction, routing, classification'], ['"temperature": 0.8', 'Chat replies and drafts'], ['"top_p": 0.9', 'Cut the unlikely tail of tokens']] }
  ]
};
