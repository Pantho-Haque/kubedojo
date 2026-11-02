/* eslint-disable */
// Generated from content/academy/ai-engineering/ (glossary.js, capstone.js, a.js, b.js, c.js, d.js, e.js, p1.js, p2.js, p3.js, g1.js, g2.js, course.js) by scripts/build-academy.mjs. Do not edit.
// Shared glossary for every lesson file. Link terms in text with [[term]] or [[term|shown text]].
const GLOSSARY = {
  'LLM': 'Large language model. A program that predicts the next piece of text, one [[token]] at a time. To your code it is just an HTTP API that takes JSON and returns JSON.',
  'API key': 'A secret string that identifies your account to the model provider. It lives on your server (an environment variable), never in the browser.',
  'system prompt': 'Instructions sent with every request that set the model\'s role and rules, like a config file for its behaviour.',
  'rate limit': 'A cap on how many requests or tokens you can send per minute. Going over returns HTTP `429 Too Many Requests`.',
  'exponential backoff': 'Retrying a failed request after waiting longer each time (1 s, 2 s, 4 s…), usually with a little random jitter.',
  'token': 'The unit a model reads and writes: a word, part of a word, or a symbol. About 1,000 tokens ≈ 750 English words. You pay per token.',
  'tokenizer': 'The library that turns text into token ids and back, for example `tiktoken`. Use it to count tokens before you send a request.',
  'context window': 'The maximum number of tokens a model can handle in one request: input (system prompt, history, documents) plus the output it writes.',
  'logits': 'The raw score the model gives every possible next token. Softmax turns these scores into probabilities.',
  'temperature': 'A dial (0–2) that sharpens or flattens the next-token probabilities. 0 = always the top token (repeatable). Higher = more random.',
  'top-p': 'Nucleus sampling. Only the most likely tokens whose probabilities add up to `p` stay in the draw; the long tail of odd tokens is cut off.',
  'greedy decoding': 'Always picking the single most likely next token. This is what temperature 0 does, so the output is repeatable.',
  'SSE': 'Server-Sent Events. A plain HTTP response that stays open and sends `data: …` lines as they are ready. Model APIs use it to stream tokens.',
  'TTFT': 'Time to first token: how long the user waits before the first word appears. Streaming makes it small even when the full answer takes 20 s.',
  'structured output': 'Asking the model for data that matches a JSON schema (an API contract), instead of free text.',
  'constrained decoding': 'The provider masks every token that would break your JSON schema, so the model can only produce valid output.',
  'Pydantic': 'A Python library for defining data models and validating data against them. FastAPI uses it for request and response bodies.',
  'Zod': 'A TypeScript library for declaring schemas and validating data at runtime, with types inferred for you.',
  'hallucination': 'When the model states something confidently that is not true or not in the data you gave it.',
  'embedding': 'A list of numbers (for example 1,536 floats) that represents the meaning of a text. Similar meanings get nearby vectors.',
  'cosine similarity': 'A score from −1 to 1 for how closely two vectors point the same way. Near 1 means similar meaning.',
  'vector database': 'A database that stores embeddings and finds the nearest ones to a query vector quickly.',
  'chunk': 'A small piece of a document (a paragraph or section) that is embedded and retrieved on its own.',
  'chunk overlap': 'Repeating a few tokens from the end of one chunk at the start of the next, so a fact on the border is not cut in half.',
  'metadata': 'Extra fields stored with each chunk, such as source URL, title and section, used for filtering and citations.',
  'pgvector': 'A PostgreSQL extension that adds a `vector` column type, distance operators like `<=>`, and vector indexes.',
  'HNSW': 'Hierarchical Navigable Small World. A layered graph index that finds near neighbours fast with high recall. The usual default in pgvector.',
  'IVFFlat': 'A vector index that groups vectors into clusters and searches only the nearest clusters. Fast to build, but recall drops if data changes a lot.',
  'recall': 'The share of the truly relevant results that a search actually returns. 100% recall = nothing relevant was missed.',
  'RAG': 'Retrieval-augmented generation: find relevant chunks of your data, put them in the prompt, and ask the model to answer only from them.',
  'BM25': 'The classic keyword ranking formula behind full-text search. Great at exact words like IDs, error codes and product SKUs.',
  'hybrid search': 'Running keyword search (BM25) and vector search together and merging the results.',
  'RRF': 'Reciprocal Rank Fusion. Merges ranked lists by adding `1 / (60 + rank)` for each list a result appears in.',
  'reranker': 'A small model that reads the query and each candidate chunk together and re-scores them, so the best few go into the prompt.',
  'tool calling': 'Giving the model a list of functions (name + JSON schema). It replies with which one to call and the arguments. Your code runs it.',
  'agent': 'A loop where the model decides the next step (call a tool or answer), your code runs it, and the result goes back to the model.',
  'ReAct loop': 'Reason + Act. The agent loop: think, call a tool, read the result, repeat until it can answer or hits a step limit.',
  'MCP': 'Model Context Protocol. A standard way to plug tools and data into AI apps: an MCP server exposes tools, any MCP client can use them.',
  'trace': 'The full record of one request through your AI system: every model call and tool call, with timing, tokens and cost.',
  'span': 'One timed step inside a trace, such as "embed query" or "call order API".',
  'idempotent': 'Safe to run twice: the second run does not repeat the side effect (for example, an email is not sent twice).',
  'eval': 'An automated test for AI behaviour: run a set of inputs through your system and score the outputs.',
  'golden dataset': 'A hand-checked list of questions with known good answers, used as the fixed test set for evals.',
  'LLM-as-a-judge': 'Using a model with a strict rubric to grade another model\'s output, for qualities code cannot check, like faithfulness.',
  'faithfulness': 'How much of an answer is supported by the retrieved context. Low faithfulness = the model made things up.',
  'regression': 'A change (new prompt, new model, new code) that makes previously good results worse.',
  'prompt caching': 'The provider stores the processed start of a prompt. Requests that start with the same prefix are cheaper and faster.',
  'fine-tuning': 'Training a model further on your own examples to change its style or format. Not the right tool for teaching it fresh facts.',
  'LoRA': 'Low-Rank Adaptation. A cheap fine-tuning method that trains a small add-on instead of the whole model.',
  'open-weight model': 'A model whose weights you can download and run yourself, such as Llama, Mistral or Qwen.',
  'Ollama': 'A tool that downloads and runs open-weight models on your own machine with one command, and serves them over a local HTTP API.'
};

;
// Capstone project board: DocsBot's architecture after each build step.
// Canvas 800x300. Columns x = 80 / 240 / 400 / 560 / 720, rows y = 50 / 150 / 250. Positions never move between steps.
const CAP_PROJECT = {
  name: 'DocsBot',
  desc: 'A "chat with your docs" app: Next.js UI, FastAPI backend, Postgres + pgvector, hybrid RAG with citations, one guarded tool, tracing and evals in CI. You build it on your own machine, one step per lesson.',
  size: [800, 300],
  start: 'An empty `docsbot/` folder and a plan.',
  nodes: {},
  vars: { endpoints: 0, status: 'not started' },
  steps: {
    'cap-scaffold': { cap: 'The Next.js page calls FastAPI `GET /health` and shows "API: ok". Secrets live in `.env`, ignored by git.',
      do: [['add', 'ui', { x: 80, y: 150, label: 'Next.js UI', sub: 'web/', kind: 'a', state: 'ok' }], ['add', 'api', { x: 240, y: 150, label: 'FastAPI', sub: 'GET /health', kind: 'b', state: 'ok' }],
        ['link', 'ui', 'api', 'fetch'], ['var', 'endpoints', 1], ['var', 'status', 'runs locally']] },
    'cap-chat': { cap: '`POST /chat` streams model tokens to the page over SSE. The first word shows in under a second.',
      do: [['add', 'llm', { x: 400, y: 50, label: 'LLM provider', sub: 'streaming', kind: 'c', state: 'ok' }], ['link', 'api', 'llm', 'stream'], ['link', 'ui', 'api', 'SSE'], ['set', 'api', { sub: 'POST /chat' }],
        ['var', 'endpoints', 2], ['var', 'status', 'chat streams']] },
    'cap-schema': { cap: 'Every answer ends with a typed `Answer` event, checked by Pydantic on the server and Zod in the browser.',
      do: [['add', 'schema', { x: 240, y: 50, label: 'Schema', sub: 'Pydantic + Zod', kind: 'd', shape: 'pill', state: 'ok' }], ['link', 'api', 'schema', 'validate'], ['var', 'status', 'typed answers']] },
    'cap-ingest': { cap: '`ingest.py` chunks your Markdown docs, embeds them and stores them in Postgres with an HNSW index.',
      do: [['add', 'docs', { x: 80, y: 250, label: 'docs/*.md', kind: 'n' }], ['add', 'ingest', { x: 240, y: 250, label: 'ingest.py', sub: 'chunk + embed', kind: 'b', state: 'ok' }],
        ['add', 'emb', { x: 400, y: 250, label: 'Embeddings', sub: '1,536 dims', kind: 'c' }], ['add', 'pg', { x: 560, y: 250, label: 'Postgres', sub: 'pgvector + HNSW', kind: 'c', shape: 'db', w: 130, state: 'ok' }],
        ['link', 'docs', 'ingest'], ['link', 'ingest', 'emb'], ['link', 'emb', 'pg'], ['var', 'status', 'docs indexed']] },
    'cap-rag': { cap: 'Questions are answered from your docs: hybrid search with RRF picks 5 chunks, and every claim cites its source.',
      do: [['add', 'retr', { x: 400, y: 150, label: 'Retriever', sub: 'hybrid + RRF', kind: 'b', state: 'ok' }], ['link', 'api', 'retr', 'query'], ['link', 'retr', 'pg', 'top 5'], ['set', 'emb', { state: 'ok' }],
        ['set', 'schema', { sub: 'with citations' }], ['var', 'status', 'grounded answers']] },
    'cap-agent': { cap: 'DocsBot can open a support ticket: a guarded tool loop with a step limit, a confirm step and an idempotency key.',
      do: [['add', 'tools', { x: 720, y: 150, label: 'Tool loop', sub: 'open_ticket', kind: 'e', state: 'ok' }], ['link', 'api', 'tools', { label: 'tool calls', bend: -95 }], ['link', 'tools', 'pg', 'tickets'],
        ['var', 'endpoints', 3], ['var', 'status', 'can act safely']] },
    'cap-ship': { cap: 'Every request is traced in Langfuse, CI blocks a merge if faithfulness drops below 0.90, and the prompt prefix is cached.',
      do: [['add', 'obs', { x: 560, y: 50, label: 'Langfuse', sub: 'traces', kind: 'd', state: 'ok' }], ['add', 'ci', { x: 720, y: 50, label: 'CI evals', sub: 'faith ≥ 0.90', kind: 'd', state: 'ok' }],
        ['link', 'api', 'obs', { label: 'spans', dash: true }], ['link', 'ci', 'obs'], ['set', 'llm', { sub: 'prompt cache on' }], ['var', 'status', 'ready to ship']] }
  }
};

// For per-file checks: the board starting from the state after earlier steps, limited to the given step ids.
function CAP_partial(ids) {
  const order = Object.keys(CAP_PROJECT.steps), first = order.indexOf(ids[0]);
  const nodes = JSON.parse(JSON.stringify(CAP_PROJECT.nodes)), edges = {}, vars = Object.assign({}, CAP_PROJECT.vars);
  for (const id of order.slice(0, first)) for (const [o, a, b, c] of CAP_PROJECT.steps[id].do) {
    if (o === 'add') nodes[a] = Object.assign({}, b); else if (o === 'set') Object.assign(nodes[a], b); else if (o === 'move') Object.assign(nodes[a], { x: b, y: c });
    else if (o === 'link') edges[a + '>' + b] = typeof c === 'string' ? { label: c } : Object.assign({}, c || {}); else if (o === 'unlink') delete edges[a + '>' + b];
    else if (o === 'var') vars[a] = b; else if (o === 'rm') delete nodes[a];
  }
  const steps = {}; for (const id of ids) steps[id] = CAP_PROJECT.steps[id];
  return Object.assign({}, CAP_PROJECT, { nodes, vars, steps, edges: Object.entries(edges).map(([k, v]) => [...k.split('>'), v]) });
}

;
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

;
// Lessons B: streaming, structured outputs, embeddings. Every top-level name starts with B_.
const B_GLOSS = {
  'async generator': 'A Python function written with `async def` that uses `yield`. It hands out values one at a time, waiting (`await`) between them.',
  'proxy buffering': 'A reverse proxy such as nginx collecting the upstream response in memory before passing it on. Great for normal pages, fatal for streams.',
  'top-k': 'In search, keep only the k best-scoring results. `k = 3` means "give me the three nearest documents".'
};

// ---------- Streaming ----------
const B_streamStats = s => {
  const v = s.v, timeout = parseInt(v.timeout, 10), total = +(0.4 + v.tokens / v.speed).toFixed(1);
  if (!v.stream && total > timeout) return { ttft: null, total, outcome: '504 Gateway Timeout' };
  const held = !v.stream || v.buffering; // user sees nothing until the end
  return { ttft: held ? total : 0.5, total, outcome: v.stream && v.buffering ? 'ok, but looks frozen' : 'ok' };
};

const B_streaming = {
  id: 'streaming', title: 'Streaming answers with SSE', mins: 8,
  goal: 'stream model tokens from FastAPI to the browser, and keep proxies from breaking it.',
  cards: [
    { t: 'read', h: 'Your chat endpoint takes 20 seconds. Users leave after 3.',
      body: 'A model writes its answer one [[token]] at a time. A long answer takes 5 to 30 s. If your API waits for the whole thing, the user stares at a spinner. Then a wall of text lands at once.\n\nWorse, proxies and load balancers often give up after 30 to 60 s. Long answers turn into `504 Gateway Timeout`.\n\nThe fix is old web tech: stream the answer as it is written, over [[SSE]].',
      analogy: 'A video site does not make you download the whole film first. It plays the first seconds while the rest is still arriving. Streaming tokens is the same trick for text.',
      points: ['Buffered: one big response at the end.', 'Streamed: many small `data:` events, starting in under a second.'] },
    { t: 'viz', h: 'Buffered vs streamed, packet by packet',
      body: 'Same question, same model, same 600 tokens. Watch when the first word reaches the browser.',
      nodes: {
        br: { x: 90, y: 190, label: 'Browser', sub: 'chat UI', kind: 'a' },
        px: { x: 300, y: 190, label: 'nginx', sub: 'reverse proxy', kind: 'n' },
        api: { x: 510, y: 190, label: 'FastAPI', sub: 'POST /chat', kind: 'c', w: 130 },
        pv: { x: 710, y: 190, label: 'Provider', sub: 'LLM API', kind: 'b' }
      },
      edges: [['br', 'px'], ['px', 'api'], ['api', 'pv']],
      vars: { mode: 'buffered' },
      steps: [
        { cap: 'The browser POSTs `/chat`. nginx forwards it to FastAPI, and FastAPI calls the model provider.',
          do: [['send', 'br', 'px', 'POST /chat'], ['send', 'px', 'api', 'POST /chat'], ['send', 'api', 'pv', 'messages']] },
        { cap: 'Buffered: FastAPI awaits the whole answer. 600 tokens at 40 tokens/s is 15 s. The browser shows a spinner.',
          do: [['set', 'br', { sub: 'spinner…', state: 'warn' }], ['set', 'pv', { sub: 'writing… 15 s', state: 'active' }], ['var', 'waiting', '15 s']] },
        { cap: 'The whole answer lands at once. [[TTFT]] equals the total time: 15.4 s. Past a 30 s proxy timeout it would be a 504.',
          do: [['send', 'pv', 'api', 'all 600 tokens'], ['send', 'api', 'px', 'full JSON'], ['send', 'px', 'br', 'full JSON'], ['set', 'br', { sub: 'wall of text', state: undefined }], ['set', 'pv', { sub: 'LLM API', state: undefined }], ['var', 'TTFT', '15.4 s']] },
        { cap: 'Now stream. FastAPI returns a `StreamingResponse`. The provider sends its first delta after about 0.4 s.',
          do: [['var', 'mode', 'streamed'], ['var', 'waiting', null], ['var', 'TTFT', null], ['set', 'api', { sub: 'streaming', state: 'active' }], ['set', 'br', { sub: 'waiting' }], ['send', 'pv', 'api', '"Sure"']] },
        { cap: 'FastAPI yields `data: {"delta":"Sure"}` right away. nginx passes it on. The first word shows at 0.5 s.',
          do: [['send', 'api', 'px', 'data: Sure'], ['send', 'px', 'br', 'data: Sure', 'ok'], ['set', 'br', { sub: 'Sure…', state: 'ok' }], ['var', 'TTFT', '0.5 s']] },
        { cap: 'More deltas follow, a few tokens each. The total is still 15.4 s, but the user reads along the whole time.',
          do: [['send', 'pv', 'api', '", here"'], ['send', 'api', 'px', 'data: …'], ['send', 'px', 'br', 'data: …', 'ok'], ['set', 'br', { sub: 'Sure, here is…' }], ['var', 'total', '15.4 s']] },
        { cap: 'The last event is `data: [DONE]`. The browser reader gets `done: true` and stops reading.',
          do: [['send', 'api', 'px', 'data: [DONE]'], ['send', 'px', 'br', 'data: [DONE]', 'ok'], ['set', 'br', { sub: 'done' }], ['set', 'api', { state: 'ok' }]] },
        { cap: 'Trap: nginx buffers responses by default. It holds every delta until the end, so TTFT is 15.4 s again.',
          do: [['set', 'px', { sub: 'buffering on', state: 'bad' }], ['note', 'px', 'Fix: X-Accel-Buffering: no'], ['set', 'br', { sub: 'spinner…', state: 'warn' }], ['var', 'TTFT', '15.4 s (broken)'], ['focus', 'px', 'br']] }
      ],
      predict: { at: 4, q: 'Streaming is on. Same 600 tokens at 40 tokens/s. When does the user see the first word?',
        options: ['After about 0.5 s', 'After about 7.7 s, halfway through', 'After about 15.4 s, same as before'], answer: 0,
        why: 'The first delta leaves the provider after about 0.4 s, and FastAPI forwards it at once. Streaming does not make the model faster. It makes the wait visible from the start.' } },
    { t: 'quiz', q: 'Long answers come back as `504 Gateway Timeout` from nginx after 60 s. The route returns one JSON body at the end. What is the best fix?',
      options: ['Stream the answer as SSE events, so bytes start flowing in under a second', 'Raise the nginx timeout to 10 minutes', 'Retry the request when you see a 504', 'Show a nicer spinner'], answer: 0,
      why: 'nginx\'s read timeout counts the time between bytes. A stream sends bytes every few hundred milliseconds, so it never trips, and the user reads along.',
      whyNot: { 1: 'That hides the 504, but the user still waits a minute staring at a spinner, and each open request holds a connection.', 2: 'A retry runs the whole generation again. You pay twice and hit the same timeout.', 3: 'The spinner is not the problem. Nothing reaches the browser until the end, and the proxy still times out.' } },
    { t: 'play', kind: 'controls', h: 'Tune a chat endpoint',
      body: 'This simulates Browser → nginx → FastAPI → Provider. The provider needs about 0.4 s before its first token. Change the dials and watch [[TTFT]], total time and the outcome.',
      size: [800, 220],
      init: () => ({ saw504: false, brokeStream: false }),
      controls: [
        { id: 'stream', type: 'toggle', label: 'Stream with SSE' },
        { id: 'tokens', type: 'range', label: 'Answer length', min: 100, max: 3000, step: 100, value: 600, unit: 'tokens' },
        { id: 'speed', type: 'range', label: 'Model speed', min: 20, max: 100, step: 10, value: 40, unit: 'tokens/s' },
        { id: 'timeout', type: 'select', label: 'Proxy read timeout', options: ['30 s', '60 s', '120 s'] },
        { id: 'buffering', type: 'toggle', label: 'nginx proxy buffering' }
      ],
      update: (s, io) => {
        const r = B_streamStats(s);
        if (r.outcome.startsWith('504')) { s.saw504 = true; if (io) io.send('px', 'br', '504', 'bad'); }
        else if (s.v.stream && !s.v.buffering) { if (io) { io.send('pv', 'api', 'delta'); io.send('api', 'px', 'data:'); io.send('px', 'br', 'data:', 'ok'); } }
        else if (io) { io.send('api', 'px', 'all at once'); io.send('px', 'br', 'all at once', 'warn'); }
        if (s.v.stream && s.v.buffering) s.brokeStream = true;
      },
      view: s => {
        const r = B_streamStats(s), v = s.v, bad = r.outcome.startsWith('504'), live = v.stream && !v.buffering;
        return {
          nodes: {
            br: { x: 90, y: 110, label: 'Browser', sub: bad ? '504 error' : live ? 'text flows' : 'spinner…', kind: 'a', state: bad ? 'bad' : live ? 'ok' : 'warn' },
            px: { x: 300, y: 110, label: 'nginx', sub: v.buffering ? 'buffering on' : 'buffering off', kind: 'n', state: bad ? 'bad' : v.stream && v.buffering ? 'warn' : undefined },
            api: { x: 510, y: 110, label: 'FastAPI', sub: v.stream ? 'StreamingResp.' : 'JSONResponse', kind: 'c', w: 130 },
            pv: { x: 710, y: 110, label: 'Provider', sub: v.speed + ' tok/s', kind: 'b' }
          },
          edges: [['br', 'px', { tone: bad ? 'bad' : live ? 'ok' : undefined }], ['px', 'api', { tone: v.stream ? 'ok' : undefined }], ['api', 'pv']],
          vars: { TTFT: r.ttft == null ? '—' : r.ttft + ' s', total: r.total + ' s', outcome: r.outcome }
        };
      },
      readout: s => { const r = B_streamStats(s); return [['TTFT', r.ttft == null ? '— (never)' : r.ttft + ' s'], ['Total time', r.total + ' s'], ['Outcome', r.outcome]]; },
      goals: [
        { text: 'Leave streaming off and make the answer long enough to get a **504**', check: s => s.saw504, solve: [{ tokens: 2000 }] },
        { text: 'Get **TTFT under 1 s** for that same long answer', check: s => s.v.tokens >= 1000 && B_streamStats(s).ttft !== null && B_streamStats(s).ttft < 1, solve: [{ stream: true }] },
        { text: 'Turn proxy buffering on and watch streaming break, then fix it', check: s => s.brokeStream && s.v.stream && !s.v.buffering, solve: [{ buffering: true }, { buffering: false }] }
      ],
      hints: ['Total time is about tokens ÷ speed. Compare it with the proxy timeout.', '2,000 tokens at 40 tokens/s is 50 s, which is past 30 s. Then try the streaming toggle.', 'Switch "nginx proxy buffering" on: TTFT jumps back up. Switch it off again, as `X-Accel-Buffering: no` would.'],
      done: 'You just did what real teams debug in production: a 504 from a buffered reply, fixed by streaming, then a "streaming does not work" bug fixed in the proxy.' },
    { t: 'read', h: 'Common mistake → best practice',
      body: '**Mistake:** `await` the full completion, then `return` it. Users wait, and proxies time out.\n\n**Best practice:** an [[async generator]] that yields one SSE event per delta. Add `X-Accel-Buffering: no` so nginx skips [[proxy buffering]] for this route.',
      code: 'import json\nfrom fastapi import FastAPI\nfrom fastapi.responses import StreamingResponse\n\napp = FastAPI()\n\n@app.post("/chat")\nasync def chat(req: ChatRequest):\n    async def events():\n        async for delta in llm.stream(req.messages):  # your provider SDK\n            yield f"data: {json.dumps({\'delta\': delta})}\\n\\n"\n        yield "data: [DONE]\\n\\n"\n\n    return StreamingResponse(\n        events(),\n        media_type="text/event-stream",\n        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},\n    )', lang: 'Python' },
    { t: 'quiz', kind: 'order', q: 'Put one streamed reply in order, from request to closed stream.',
      code: 'const res = await fetch("/chat", { method: "POST", body });\nconst reader = res.body.getReader();\nconst dec = new TextDecoder();\nwhile (true) {\n  const { value, done } = await reader.read();\n  if (done) break;\n  appendDeltas(dec.decode(value, { stream: true }));\n}',
      items: ['The browser calls `fetch("/chat")`', 'FastAPI returns a `StreamingResponse` with `text/event-stream`', 'The provider sends one token delta to the async generator', 'The generator yields `data: {"delta":"Hi"}` and a blank line', '`reader.read()` resolves and the UI appends "Hi"', 'The generator yields `data: [DONE]` and the stream closes'],
      why: 'Headers go out first, then each delta becomes one SSE event. The reader wakes once per chunk until `done` is true.' },
    { t: 'recap', points: ['Generation takes seconds. Buffered replies mean a spinner, then a wall of text, then sometimes a 504.', 'Stream token deltas as [[SSE]] events: `data: {...}` plus a blank line. [[TTFT]] drops under a second.', 'FastAPI: `StreamingResponse` around an [[async generator]]. Browser: `fetch` plus `res.body.getReader()`, or `EventSource` for GET.', 'If streaming "does nothing", check the proxy: turn off [[proxy buffering]].'],
      cheat: [['StreamingResponse(events())', 'FastAPI: stream an async generator'], ['text/event-stream', 'The media_type for SSE responses'], ['yield f"data: {payload}\\n\\n"', 'One SSE event (payload = JSON string)'], ['res.body.getReader()', 'Read a streamed fetch body in the browser'], ['new EventSource("/chat?id=42")', 'GET-only SSE client with auto-reconnect'], ['X-Accel-Buffering: no', 'Response header: nginx stops buffering it'], ['proxy_buffering off;', 'nginx config: same fix, per location']] }
  ]
};

// ---------- Structured outputs ----------
const B_SAMPLES = [
  { id: 's1', label: 'Clean JSON', raw: '{"vendor":"Acme","total":42.5}' },
  { id: 's2', label: 'Wrapped in a json fence', raw: '```json\n{"vendor":"Globex","total":19.99}\n```' },
  { id: 's3', label: 'Missing total', raw: '{"vendor":"Initech"}' },
  { id: 's4', label: 'total is the string "12,00"', raw: '{"vendor":"Umbrella","total":"12,00"}' },
  { id: 's5', label: 'Trailing comma', raw: '{"vendor":"Hooli","total":7,}' }
];
const B_try = (s, raw) => { try { return { r: s.api.safeParse(raw) }; } catch (e) { return { threw: e }; } };
const B_okWith = (s, i, vendor, total) => { const { r } = B_try(s, B_SAMPLES[i].raw); return !!r && r.ok === true && !!r.data && r.data.vendor === vendor && r.data.total === total; };
const B_rejects = (s, i) => { const { r } = B_try(s, B_SAMPLES[i].raw); return !!r && r.ok === false && typeof r.error === 'string' && r.error.length > 0; };
const B_SOLVE1 = 'function safeParse(raw) {\n  const data = JSON.parse(raw);\n  return { ok: true, data };\n}';
const B_SOLVE2 = 'function safeParse(raw) {\n  const text = raw.trim().replace(/^```(?:json)?\\s*/, "").replace(/\\s*```$/, "");\n  const data = JSON.parse(text);\n  return { ok: true, data };\n}';
const B_SOLVE3 = 'function safeParse(raw) {\n  const text = raw.trim().replace(/^```(?:json)?\\s*/, "").replace(/\\s*```$/, "");\n  let data;\n  try { data = JSON.parse(text); }\n  catch (e) { return { ok: false, error: "not JSON: " + e.message }; }\n  if (typeof data?.vendor !== "string") return { ok: false, error: "vendor must be a string" };\n  if (typeof data.total !== "number" || !Number.isFinite(data.total)) return { ok: false, error: "total must be a number" };\n  return { ok: true, data };\n}';

const B_structured = {
  id: 'structured', title: 'Structured outputs you can trust', mins: 8,
  goal: 'get JSON from a model that never crashes your API, and validate it at the boundary.',
  cards: [
    { t: 'read', h: '"Return valid JSON" works 199 times. Then it doesn\'t.',
      body: 'You ask a model to pull `vendor` and `total` from invoices. The prompt ends with "Return valid JSON". It passes every test.\n\nIn production, one reply in a few hundred arrives wrapped in a Markdown code fence. Another has a trailing comma. Another forgets `total`. `JSON.parse` throws, and your route returns a 500.\n\nThe fix has two layers: [[structured output]] from the provider, and a schema check in your code.',
      analogy: 'You would never trust a third-party webhook body without validating it. Model output is the same: an untrusted request body that happens to be written by a model.',
      points: ['A prompt is a polite request, not a contract.', 'A schema enforced by the provider plus a validator in your code is a contract.'] },
    { t: 'viz', h: 'Two paths from model to database',
      body: 'Top: prompt-only. Bottom: [[constrained decoding]] plus validation.',
      nodes: {
        llm: { x: 100, y: 190, label: 'Model', sub: 'next token?', kind: 'b' },
        raw: { x: 330, y: 65, label: 'Raw text', sub: 'prompt-only', kind: 'n' },
        parse: { x: 560, y: 65, label: 'JSON.parse', sub: 'your route', kind: 'c', w: 130 }
      },
      edges: [['llm', 'raw'], ['raw', 'parse']],
      vars: { path: 'prompt-only' },
      steps: [
        { cap: 'The route asks for `{vendor, total}`. The prompt says "Return valid JSON". The model picks one token at a time.',
          do: [['focus', 'llm', 'raw'], ['send', 'llm', 'raw', 'tokens…']] },
        { cap: 'This time it opens with a Markdown fence and a "json" tag. Nothing stops it: any token is allowed.',
          do: [['set', 'raw', { sub: 'fence + json', state: 'warn' }], ['note', 'raw', 'Starts with three backticks']] },
        { cap: 'It also ends with a trailing comma: `"total": 42,}`. Looks fine to a human. Not valid JSON.',
          do: [['set', 'raw', { sub: '"total": 42,}' }], ['send', 'raw', 'parse', 'raw text']] },
        { cap: '`JSON.parse` throws `SyntaxError`. The route crashes with a 500. The invoice is lost.',
          do: [['set', 'parse', { state: 'bad', sub: 'SyntaxError' }], ['var', 'result', '500 error']] },
        { cap: 'Bottom path: the provider gets your JSON schema. Before each token, it masks every choice that would break it.',
          do: [['var', 'path', 'constrained'], ['var', 'result', null], ['add', 'tk1', { x: 290, y: 190, label: 'fence', shape: 'pill', w: 90, state: 'off', kind: 'n' }], ['add', 'tk2', { x: 410, y: 190, label: '{', shape: 'pill', w: 70, state: 'active', kind: 'b' }], ['add', 'tk3', { x: 530, y: 190, label: 'Sure!', shape: 'pill', w: 90, state: 'off', kind: 'n' }]] },
        { cap: 'Only `{` was allowed. Token by token, the output can only be valid JSON in your shape.',
          do: [['add', 'out', { x: 330, y: 315, label: 'Valid JSON', sub: 'matches schema', kind: 'c', state: 'ok' }], ['link', 'llm', 'out'], ['send', 'llm', 'out', '{"vendor":…}']] },
        { cap: 'Still validate at the boundary with [[Zod]] or [[Pydantic]]. Valid shape is not valid data: `total` must be ≥ 0.',
          do: [['add', 'val', { x: 560, y: 315, label: 'Zod / Pydantic', sub: 'safeParse', kind: 'd', w: 140, state: 'ok' }], ['link', 'out', 'val'], ['send', 'out', 'val', 'object']] },
        { cap: 'Only a typed, checked record reaches the database. Parse errors: zero.',
          do: [['add', 'db', { x: 730, y: 315, label: 'invoices', kind: 'a', shape: 'db', state: 'ok' }], ['link', 'val', 'db'], ['send', 'val', 'db', 'Invoice', 'ok'], ['var', 'result', 'saved']] }
      ],
      predict: { at: 3, q: 'The raw text has a code fence and a trailing comma. What does `JSON.parse(raw)` do?',
        options: ['Throws a SyntaxError, so the route returns a 500', 'Ignores the fence and returns the object', 'Returns null and moves on'], answer: 0,
        why: '`JSON.parse` is strict. One stray backtick or comma throws. Unguarded, that exception becomes a 500 for your user.' } },
    { t: 'quiz', q: 'What does [[constrained decoding]] actually do?',
      options: ['Before each token, it blocks every choice that would break your JSON schema', 'It retries the request until `JSON.parse` succeeds', 'It repairs broken JSON after the model finishes', 'It makes the values in the JSON true'], answer: 0,
      why: 'The provider filters the next-token choices against your schema. Invalid tokens get a probability of zero, so they can never be picked.',
      whyNot: { 1: 'No retries happen. Invalid output is prevented, not detected and redone.', 2: 'That is a JSON repair library. Constrained decoding works during generation, not after.', 3: 'It controls the shape, not the facts. A well-formed `total` can still be a [[hallucination]].' } },
    { t: 'play', kind: 'code', h: 'Write a safeParse guard',
      body: 'Here are 5 real-looking model replies. Write `safeParse(raw)` so it never throws. Return `{ ok: true, data }` or `{ ok: false, error }`. Strip a code fence, catch parse errors, and require `vendor` (a string) and `total` (a number). Press Run, then read the diagram.',
      starter: [
        '// Five replies from a prompt-only model:',
        'const samples = [',
        '  \'{"vendor":"Acme","total":42.5}\',',
        '  \'```json\\n{"vendor":"Globex","total":19.99}\\n```\',',
        '  \'{"vendor":"Initech"}\',',
        '  \'{"vendor":"Umbrella","total":"12,00"}\',',
        '  \'{"vendor":"Hooli","total":7,}\'',
        '];',
        '',
        '// Naive version: trusts the model completely.',
        'function safeParse(raw) {',
        '  return JSON.parse(raw);',
        '}',
        '',
        'for (const raw of samples) {',
        '  try { console.log(JSON.stringify(safeParse(raw))); }',
        '  catch (e) { console.log("THREW: " + e.message); }',
        '}'
      ].join('\n'),
      expose: ['safeParse'],
      view: s => {
        const nodes = { fn: { x: 130, y: 190, label: 'safeParse()', shape: 'pill', kind: 'b', w: 140 } }, edges = [];
        B_SAMPLES.forEach((smp, i) => {
          let sub = 'press Run', state = 'off';
          if (s.api && s.api.safeParse) {
            const { r, threw } = B_try(s, smp.raw);
            if (threw) { sub = 'threw ' + (threw.name || 'Error'); state = 'bad'; }
            else if (r && r.ok === true) { sub = 'accepted · ' + (r.data && r.data.vendor) + ' ' + (r.data && r.data.total); state = 'ok'; }
            else if (r && r.ok === false) { sub = 'rejected: ' + String(r.error).slice(0, 34); state = 'warn'; }
            else { sub = 'no {ok} field'; state = 'bad'; }
          }
          nodes[smp.id] = { x: 560, y: 40 + i * 75, h: 44, w: 320, label: smp.label, sub: sub.slice(0, 44), kind: 'n', state };
          edges.push(['fn', smp.id, { tone: state === 'ok' ? 'ok' : state === 'bad' ? 'bad' : state === 'warn' ? 'warn' : undefined }]);
        });
        return { nodes, edges };
      },
      goals: [
        { text: 'The clean reply returns `{ ok: true, data }` with Acme and 42.5', check: s => !!s.api && !!s.api.safeParse && B_okWith(s, 0, 'Acme', 42.5), solve: [B_SOLVE1] },
        { text: 'The fenced reply is accepted too (Globex, 19.99)', check: s => !!s.api && !!s.api.safeParse && B_okWith(s, 1, 'Globex', 19.99), solve: [B_SOLVE2] },
        { text: 'Missing total, string total and trailing comma are rejected, without throwing', check: s => !!s.api && !!s.api.safeParse && B_okWith(s, 0, 'Acme', 42.5) && B_okWith(s, 1, 'Globex', 19.99) && B_rejects(s, 2) && B_rejects(s, 3) && B_rejects(s, 4), solve: [B_SOLVE3] }
      ],
      hints: ['Start with the return shape: wrap the parsed object as `{ ok: true, data }`.', 'Remove the fence before parsing: `raw.trim().replace(/^```(?:json)?\\s*/, "").replace(/\\s*```$/, "")`.', 'Put `JSON.parse` in `try/catch` and return `{ ok: false, error }`. Then check `typeof data.vendor === "string"` and `typeof data.total === "number"`.'],
      done: 'That is a boundary guard. Zod\'s `safeParse` and Pydantic\'s `model_validate_json` do the same job with less code.' },
    { t: 'read', h: 'Common mistake → best practice',
      body: '**Mistake:** `JSON.parse(completion.text)` straight into your database. One odd reply becomes a 500 or, worse, bad data.\n\n**Best practice:** one schema, used twice. Send it to the provider as the [[structured output]] format. Validate the reply with the same schema in your code.',
      code: 'import { z } from "zod";\n\nconst Invoice = z.object({\n  vendor: z.string().min(1),\n  total: z.number().nonnegative(),\n  currency: z.enum(["USD", "EUR", "GBP"]),\n});\n\n// 1. Send z.toJSONSchema(Invoice) as the response format.\n// 2. Validate the reply anyway:\nexport function parseInvoice(text: string) {\n  let json: unknown;\n  try { json = JSON.parse(text); }\n  catch { return { ok: false as const, error: "not JSON" }; }\n  const r = Invoice.safeParse(json);\n  return r.success\n    ? { ok: true as const, data: r.data }\n    : { ok: false as const, error: r.error.message };\n}', lang: 'TypeScript' },
    { t: 'quiz', kind: 'multi', q: 'Your invoice extractor already uses structured outputs with a schema. Which checks still belong in your Zod or Pydantic layer?',
      options: ['`total` is a number and not negative', 'Handle a reply cut off by the max-tokens limit', '`currency` is one of the codes you support', 'Ask the model "are you sure?" for each field', 'None: the provider promised valid JSON'], answer: [0, 1, 2],
      why: 'The schema fixes the shape. Your validator still guards business rules, cut-off replies and refusals. It is your API contract.',
      whyNot: { 3: 'Asking again costs tokens and proves nothing. Validate with code, then measure accuracy with tests.', 4: 'A reply can still be cut off, refused, or shaped right but wrong. Never skip the boundary check.' } },
    { t: 'recap', points: ['"Return valid JSON" in a prompt is a wish. At scale you get fences, trailing commas and missing fields.', '[[structured output]] with [[constrained decoding]] masks invalid tokens, so the shape is guaranteed.', 'Still validate at the boundary with [[Pydantic]] or [[Zod]]: types, ranges, enums.', 'Never `JSON.parse` raw model text without a `try/catch` and a schema.'],
      cheat: [['Invoice.model_json_schema()', 'Pydantic: JSON Schema to send to the provider'], ['Invoice.model_validate_json(text)', 'Pydantic: parse + validate, raises ValidationError'], ['z.toJSONSchema(Invoice)', 'Zod: JSON Schema to send to the provider'], ['Invoice.safeParse(json)', 'Zod: { success, data | error }, never throws'], ['raw.replace(/^```\\w*|```\\s*$/g, "")', 'Strip a code fence (prompt-only fallback)']] }
  ]
};

// ---------- Embeddings ----------
// Tiny 3-D "embeddings". Axes roughly: money, account, product. Real ones have ~1,536 axes.
const B_DOCS = {
  refund: { label: 'Refunds', sub: 'policy', v: [0.95, 0.10, 0.15] },
  returns: { label: 'Returns', sub: 'damaged', v: [0.70, 0.05, 0.60] },
  reset: { label: 'Password', sub: 'reset', v: [0.05, 0.95, 0.10] },
  login: { label: 'Login', sub: '2FA help', v: [0.15, 0.90, 0.30] },
  ship: { label: 'Shipping', sub: 'times', v: [0.10, 0.05, 0.99] },
  sku4471: { label: 'SKU-4471', sub: 'warranty', v: [0.30, 0.20, 0.93] },
  sku4417: { label: 'SKU-4417', sub: 'warranty', v: [0.40, 0.15, 0.90] }
};
const B_QUERIES = {
  'forgot my login': { short: 'forgot login', v: [0.05, 0.98, 0.12] },
  'how do I get my money back': { short: 'money back', v: [0.92, 0.08, 0.25] },
  'SKU-4471 warranty': { short: 'SKU-4471', v: [0.42, 0.16, 0.89] }
};
const B_POS = { refund: [110, 60], returns: [290, 60], reset: [510, 60], login: [690, 60], ship: [110, 320], sku4471: [450, 320], sku4417: [650, 320] };
const B_cos = (u, v) => { let d = 0, a = 0, b = 0; for (let i = 0; i < u.length; i++) { d += u[i] * v[i]; a += u[i] * u[i]; b += v[i] * v[i]; } return d / Math.sqrt(a * b); };
const B_rank = s => {
  const q = B_QUERIES[s.v.query].v, qv = s.v.mismatch ? [q[2], q[0], q[1]] : q; // "other model": same text, different space
  return Object.keys(B_DOCS).map(id => ({ id, score: B_cos(qv, B_DOCS[id].v) })).sort((a, b) => b.score - a.score);
};

const B_embeddings = {
  id: 'embeddings', title: 'Embeddings: meaning as coordinates', mins: 8,
  goal: 'explain what an embedding is, rank documents by cosine similarity, and avoid the two classic traps.',
  cards: [
    { t: 'read', h: 'The user typed "money back". Your doc says "Refunds".',
      body: 'Your help center has a page called "Refund policy". A user searches "how do I get my money back". `WHERE title ILIKE \'%money%\'` finds nothing. No words match.\n\nAn [[embedding]] fixes this. A model turns each text into a fixed-length list of floats, for example 1,536 of them. Texts with similar meaning get nearby lists, even with zero shared words.\n\nYou search by "nearby", not by "equal".',
      analogy: 'A normal database index is a phone book: it finds exact keys. An embedding index is a city map: similar topics live on the same street. You ask "what is near this point?"',
      points: ['Same length every time, whatever the text size.', 'Distance means "similar meaning", not "same characters".'] },
    { t: 'viz', h: 'A map of meaning',
      body: 'Real embeddings have about 1,536 dimensions. Here they are squashed to 2-D so you can see them.',
      nodes: {
        refund: { x: 100, y: 75, label: 'Refunds', sub: 'policy', shape: 'circle', w: 88, kind: 'd' },
        returns: { x: 240, y: 75, label: 'Returns', sub: 'damaged', shape: 'circle', w: 88, kind: 'd' },
        reset: { x: 560, y: 75, label: 'Password', sub: 'reset', shape: 'circle', w: 88, kind: 'a' },
        login: { x: 700, y: 75, label: 'Login', sub: '2FA help', shape: 'circle', w: 88, kind: 'a' },
        ship: { x: 100, y: 310, label: 'Shipping', sub: 'times', shape: 'circle', w: 88, kind: 'c' },
        sku4471: { x: 560, y: 310, label: 'SKU-4471', sub: 'warranty', shape: 'circle', w: 88, kind: 'c' },
        sku4417: { x: 700, y: 310, label: 'SKU-4417', sub: 'warranty', shape: 'circle', w: 88, kind: 'c' }
      },
      vars: { dims: '1,536 → 2 shown', model: 'embed-A' },
      steps: [
        { cap: 'Each doc was embedded once, at write time, and stored with its vector. Position is meaning.',
          do: [['focus', 'refund', 'returns', 'reset', 'login', 'ship', 'sku4471', 'sku4417']] },
        { cap: 'Money docs sit together top-left. Account docs sit top-right. Nobody wrote those rules; the model learned them.',
          do: [['link', 'refund', 'returns', { dash: true, arrow: false, label: 'close' }], ['link', 'reset', 'login', { dash: true, arrow: false, label: 'close' }]] },
        { cap: 'A user asks "how do I get my money back". We embed the query with the same model, embed-A.',
          do: [['add', 'q1', { x: 230, y: 190, label: 'Query', sub: 'money back', shape: 'circle', w: 80, kind: 'e', state: 'active' }], ['var', 'query', 'how do I get my money back']] },
        { cap: 'Nearest neighbour: Refunds, [[cosine similarity]] 0.99. Zero shared words, and it still wins.',
          do: [['link', 'q1', 'refund', { label: 'cos 0.99', tone: 'ok' }], ['set', 'refund', { state: 'ok' }], ['var', '#1', 'Refunds 0.99']] },
        { cap: 'With [[top-k]] = 2 we also take Returns at 0.90. Account docs score far lower, around 0.2 to 0.3.',
          do: [['link', 'q1', 'returns', { label: 'cos 0.90', tone: 'ok' }], ['set', 'returns', { state: 'ok' }], ['var', '#2', 'Returns 0.90']] },
        { cap: 'Cosine = (u·v) / (|u|·|v|). It compares direction, not length. 1 means same direction, 0 means unrelated.',
          do: [['var', 'formula', '(u·v)/(|u||v|)'], ['focus', 'q1', 'refund', 'returns']] },
        { cap: 'Trap 1: "SKU-4471 warranty". Both SKU docs mean almost the same thing, so the wrong one wins by a hair.',
          do: [['add', 'q2', { x: 630, y: 190, label: 'Query', sub: 'SKU-4471', shape: 'circle', w: 80, kind: 'e', state: 'active' }], ['link', 'q2', 'sku4417', { label: '#1 1.00', tone: 'bad' }], ['link', 'q2', 'sku4471', { label: '#2 0.99' }], ['set', 'sku4417', { state: 'bad' }], ['var', 'query', 'SKU-4471 warranty'], ['var', '#1', 'SKU-4417 1.000 ✕'], ['var', '#2', 'SKU-4471 0.991'], ['var', 'formula', null]] },
        { cap: 'Trap 2: a query embedded with another model lives on a different map. Its scores are noise. Never mix models.',
          do: [['add', 'q3', { x: 420, y: 190, label: 'Query', sub: 'embed-B', shape: 'circle', w: 80, kind: 'e', state: 'bad' }], ['note', 'q3', 'Different model = different map'], ['var', 'model', 'embed-A vs embed-B ✕']] }
      ],
      predict: { at: 3, q: 'The query "how do I get my money back" shares no words with any doc title. Which doc is nearest?',
        options: ['Refunds', 'SKU-4471 warranty', 'Password reset'], answer: 0,
        why: 'The embedding captures meaning, not spelling. "Money back" and "refund" mean the same thing, so their vectors point the same way.' } },
    { t: 'quiz', q: 'A query and a document have a cosine similarity of 0.97. What does that tell you?',
      options: ['Their vectors point almost the same way, so the texts mean nearly the same thing', 'They share almost all of their words', 'The two texts are about the same length', 'The document is a correct answer to the query'], answer: 0,
      why: 'Cosine measures the angle between two vectors. Near 1 means "same direction", which the model learned to mean "similar meaning".',
      whyNot: { 1: '"Money back" and "Refunds" share no words and still score 0.99. Embeddings are about meaning, not spelling.', 2: 'Cosine ignores vector length, and every embedding has the same number of dimensions anyway.', 3: 'Similar is not correct. A doc can be on-topic and still out of date or wrong.' } },
    { t: 'play', kind: 'controls', h: 'Run a vector search',
      body: 'Seven help docs, each with a tiny 3-number embedding. Pick a query and **k**. The app computes real cosine scores and lights up the top k.',
      init: () => ({}),
      controls: [
        { id: 'query', type: 'select', label: 'Query', options: Object.keys(B_QUERIES) },
        { id: 'k', type: 'range', label: 'Top-k', min: 1, max: 4, value: 2 },
        { id: 'mismatch', type: 'toggle', label: 'Query embedded with a different model' }
      ],
      view: s => {
        const ranked = B_rank(s), top = ranked.slice(0, s.v.k).map(r => r.id), nodes = {}, edges = [], vars = {};
        Object.keys(B_DOCS).forEach(id => {
          const d = B_DOCS[id], hit = top.includes(id);
          nodes[id] = { x: B_POS[id][0], y: B_POS[id][1], label: d.label, sub: d.sub, shape: 'circle', w: 88, kind: 'n', state: hit ? 'ok' : 'off' };
        });
        nodes.q = { x: 400, y: 190, label: 'Query', sub: B_QUERIES[s.v.query].short, shape: 'circle', w: 96, kind: 'e', state: s.v.mismatch ? 'bad' : 'active' };
        ranked.slice(0, s.v.k).forEach((r, i) => {
          edges.push(['q', r.id, { label: r.score.toFixed(3), tone: s.v.mismatch ? 'bad' : i === 0 ? 'ok' : undefined }]);
          vars['#' + (i + 1)] = B_DOCS[r.id].label + ' ' + B_DOCS[r.id].sub + ' · ' + r.score.toFixed(3);
        });
        return { nodes, edges, vars };
      },
      readout: s => { const r = B_rank(s)[0]; return [['Top hit', B_DOCS[r.id].label + ' ' + B_DOCS[r.id].sub], ['Cosine', r.score.toFixed(3)], ['Query model', s.v.mismatch ? 'embed-B ✕ (docs use embed-A)' : 'embed-A ✓']]; },
      goals: [
        { text: 'Get **Refunds** as the top hit for "how do I get my money back"', check: s => !s.v.mismatch && s.v.query === 'how do I get my money back' && B_rank(s)[0].id === 'refund', solve: [{ query: 'how do I get my money back' }] },
        { text: 'Search "SKU-4471 warranty" and see the **wrong SKU** ranked first', check: s => !s.v.mismatch && s.v.query === 'SKU-4471 warranty' && B_rank(s)[0].id === 'sku4417', solve: [{ query: 'SKU-4471 warranty' }] },
        { text: 'Embed the query with a different model and watch the results turn to nonsense', check: s => s.v.mismatch && B_rank(s)[0].id !== { 'forgot my login': 'reset', 'how do I get my money back': 'refund', 'SKU-4471 warranty': 'sku4471' }[s.v.query], solve: [{ mismatch: true }] }
      ],
      hints: ['Change the Query dropdown. Watch which circle the top line points to.', 'For "SKU-4471 warranty", compare the scores of the two SKU docs. They differ only in the third decimal.', 'Flip "Query embedded with a different model". A warranty question now lands on Refunds.'],
      done: 'Exact IDs are a job for keyword search ([[BM25]]); you will combine both in [[hybrid search]]. And one model per index, always.' },
    { t: 'read', h: 'Common mistake → best practice',
      body: '**Mistake:** store only the vector. Months later you switch embedding models. Old and new vectors mix in one table, and search quietly returns junk.\n\n**Best practice:** store the model name with every vector, filter on it, and re-embed everything when you switch. Here it is with [[pgvector]] in FastAPI.',
      code: 'EMBED_MODEL = "embed-A"  # example name\n\nasync def index_doc(doc_id: str, text: str):\n    vec = (await client.embeddings.create(model=EMBED_MODEL, input=text)).data[0].embedding\n    await db.execute(\n        "INSERT INTO doc_vectors (doc_id, model, embedding) VALUES ($1, $2, $3)",\n        doc_id, EMBED_MODEL, vec)\n\nasync def search(query: str, k: int = 5):\n    q = (await client.embeddings.create(model=EMBED_MODEL, input=query)).data[0].embedding\n    return await db.fetch(\n        "SELECT doc_id, 1 - (embedding <=> $1) AS cosine FROM doc_vectors"\n        " WHERE model = $2 ORDER BY embedding <=> $1 LIMIT $3",\n        q, EMBED_MODEL, k)', lang: 'Python' },
    { t: 'quiz', kind: 'fill', q: 'You switch your app to a new embedding model. You have 2 million stored document vectors. What must you do with them?',
      pre: 'You must', post: 'all 2 million documents with the new model.', placeholder: 'one word',
      answer: ['re-embed', 'reembed', 're embed', /^re-?\s?embed(ding)?$/i],
      why: 'Vectors from two models live in different spaces. Comparing them is meaningless, so every stored document needs a fresh vector from the new model.' },
    { t: 'recap', points: ['An [[embedding]] is a fixed-length float array, e.g. 1,536 numbers. Nearby means similar meaning.', '[[cosine similarity]] = (u·v)/(|u||v|). Near 1 means same direction, so same meaning.', 'Pure vector search blurs exact strings like SKUs and IDs. Add keyword search later ([[hybrid search]]).', 'Store the model name with each vector. Switch models? Re-embed everything.'],
      cheat: [['cos = dot(u, v) / (norm(u) * norm(v))', 'Cosine similarity'], ['embeddings.create(model=M, input=t)', 'Get one embedding vector'], ['embedding <=> $1', 'pgvector cosine distance (1 − similarity)'], ['ORDER BY embedding <=> $1 LIMIT 5', 'Top-k nearest documents'], ['WHERE model = \'embed-A\'', 'Never mix vectors from two models']] }
  ]
};

;
// Module 2 lessons: chunking, pgvector, RAG. Every top-level name starts with C_.
const C_GLOSS = {
  'top-k': 'The k best-scoring results a search returns, for example the 5 nearest chunks. Like `LIMIT 5` after an `ORDER BY score`.',
  'nearest neighbour': 'The stored vector closest to your query vector. Vector search returns the k nearest neighbours.'
};

// ---------- Lesson 1: chunking ----------
const C_DOC = '## Returns\nReturn items within 30 days, unused.\n\n## Refunds\nWe check each return first. Refunds take 5–7 business days. The money goes to your card.\n\n## Shipping\nStandard shipping takes 3–5 days.';
const C_FACT = 'Refunds take 5–7 business days.';
const C_FACT_AT = C_DOC.indexOf(C_FACT);

// Splits C_DOC like a real splitter would. Returns the chunks and where the fact landed.
function C_chunk(v) {
  const n = C_DOC.length, list = [];
  if (v.strategy === 'markdown headers') {
    const starts = [...C_DOC.matchAll(/^## (\w+)/gm)].map(m => [m.index, m[1]]);
    starts.forEach(([a, sec], i) => list.push({ a, b: i + 1 < starts.length ? starts[i + 1][0] : n, sec }));
  } else {
    const step = v.size - v.overlap;
    for (let a = 0; a < n; a += step) { list.push({ a, b: Math.min(a + v.size, n) }); if (a + v.size >= n) break; }
  }
  const f = C_FACT_AT, g = f + C_FACT.length;
  list.forEach(c => { c.whole = c.a <= f && c.b >= g; c.part = c.a < g && c.b > f; });
  const whole = list.findIndex(c => c.whole);
  return { list, whole, parts: list.map((c, i) => c.part ? i : -1).filter(i => i >= 0) };
}

const C_chunking = {
  id: 'chunking', title: 'Chunking: cutting documents the right way', mins: 8,
  goal: 'split a document into chunks that keep each fact whole, and store the metadata you need for citations.',
  cards: [
    { t: 'read', h: 'The bot cannot find a fact that is right there',
      body: 'Your help page says "Refunds take 5–7 business days." A user asks the support bot how long refunds take. It says "I don\'t know."\n\nThe page was indexed. So what went wrong? The page was cut into [[chunk|chunks]] before it was turned into [[embedding|embeddings]]. The cut landed in the middle of that sentence.\n\nChunking is the first step of every search-over-your-docs feature. Get it wrong and nothing later can fix it.',
      analogy: 'Pagination with a fixed page size. If page 1 ends halfway through a table row, nobody can read that row on either page. Good chunks are like normalized rows: each one makes sense on its own.' },
    { t: 'viz', h: 'Naive cuts vs cuts along headings', body: 'One help page, three sections. Watch two ways to split it.',
      nodes: {
        doc: { x: 200, y: 195, shape: 'group', w: 340, h: 330, label: 'help/refunds.md' },
        ret: { x: 200, y: 95, w: 280, label: '## Returns', sub: 'Return items within 30 days', kind: 'n' },
        ref: { x: 200, y: 195, w: 280, label: '## Refunds', sub: 'Refunds take 5–7 business days.', kind: 'a' },
        shp: { x: 200, y: 295, w: 280, label: '## Shipping', sub: 'Standard shipping: 3–5 days', kind: 'n' }
      },
      steps: [
        { cap: 'A help page with three sections. The fact users ask about lives in the Refunds section.', do: [['focus', 'ref'], ['note', 'ref', 'starts at character 88']] },
        { cap: 'A naive splitter cuts every 100 characters, wherever that lands. Chunk 1 gets Returns and the start of Refunds.', do: [['add', 'c1', { x: 620, y: 120, w: 200, label: 'Chunk 1', sub: 'characters 0–99', kind: 'c' }], ['link', 'ret', 'c1'], ['link', 'ref', 'c1'], ['add', 'c2', { x: 620, y: 270, w: 200, label: 'Chunk 2', sub: 'characters 100–194', kind: 'c' }], ['link', 'ref', 'c2']] },
        { cap: 'The cut at character 100 slices the sentence: "Refunds take" | "5–7 business days." Neither chunk holds the fact.', do: [['link', 'shp', 'c2'], ['set', 'ref', { state: 'bad' }], ['set', 'c1', { state: 'bad', sub: '…Refunds take' }], ['set', 'c2', { state: 'bad', sub: '5–7 business days.…' }]] },
        { cap: 'The user asks "How long do refunds take?" Both halves score low. The best match is only 0.61, so the bot gives up.', do: [['var', 'best match', '0.61 (too weak)'], ['focus', 'c1', 'c2']] },
        { cap: 'Try again. A header-aware splitter cuts only at `##` headings, so each section becomes one chunk.', do: [['rm', 'c1'], ['rm', 'c2'], ['add', 'h1', { x: 620, y: 95, w: 200, label: 'Chunk: Returns', kind: 'c' }], ['add', 'h2', { x: 620, y: 195, w: 200, label: 'Chunk: Refunds', kind: 'c' }], ['add', 'h3', { x: 620, y: 295, w: 200, label: 'Chunk: Shipping', kind: 'c' }]] },
        { cap: 'The Refunds chunk holds the whole sentence. The same question now matches at 0.89.', do: [['link', 'ret', 'h1'], ['link', 'ref', 'h2', { tone: 'ok' }], ['link', 'shp', 'h3'], ['set', 'ref', { state: 'ok' }], ['set', 'h2', { state: 'ok', sub: 'fact is whole' }], ['var', 'best match', '0.89 (strong)']] },
        { cap: 'Each chunk is stored with [[metadata]]: source URL, title and section. The bot can now cite where its answer came from.', do: [['set', 'h2', { sub: 'section: Refunds' }], ['var', 'source', '/help/refunds'], ['var', 'title', 'Refund policy'], ['note', 'h2', 'stored with source + section'], ['focus', 'h2']] }
      ],
      predict: { at: 2, q: 'Chunk 1 ends at character 100. The refund sentence starts at character 88. What happens to it?', options: ['It is cut in half across two chunks', 'The splitter moves the cut to the end of the sentence', 'It goes whole into chunk 1'], answer: 0,
        why: 'A fixed-size splitter counts characters and nothing else. It cuts at 100 even mid-word, so each half gets part of the fact.' } },
    { t: 'quiz', q: 'Your docs site has 300 Markdown pages. Which chunking plan should you start with?',
      options: ['Split on headings, aim for about 200–800 [[token|tokens]], add a small overlap, store source and section', 'Embed each whole page as one chunk', 'Cut every 500 characters with no overlap', 'Make every sentence its own chunk'], answer: 0,
      why: 'Headings mark where one idea ends. A few hundred tokens is big enough for context and small enough to match one question well.',
      whyNot: { 1: 'One vector for a whole page blurs many topics together. It matches everything a little and nothing well.', 2: 'Blind character cuts slice sentences and tables in half, which is exactly the bug we just saw.', 3: 'A single sentence often lacks context. "It takes 5–7 days" means nothing without the heading above it.' } },
    { t: 'play', kind: 'controls', h: 'Try it: split the refund page',
      body: 'Each box is one chunk of the refund page. The fact users ask about is **"Refunds take 5–7 business days."** (31 characters). Sizes here are in characters to keep the page tiny. Real apps use 200–800 tokens.',
      init: () => ({}),
      controls: [
        { id: 'size', type: 'range', label: 'Chunk size', min: 60, max: 200, step: 20, value: 160, unit: 'chars' },
        { id: 'overlap', type: 'range', label: 'Overlap', min: 0, max: 40, step: 10, value: 0, unit: 'chars' },
        { id: 'strategy', type: 'select', label: 'Strategy', options: ['fixed characters', 'markdown headers'] }
      ],
      view: s => {
        const r = C_chunk(s.v), hdr = s.v.strategy === 'markdown headers', split = r.whole < 0;
        const nodes = { fact: { x: 400, y: 45, shape: 'text', w: 760, label: 'Fact to find: "Refunds take 5–7 business days."' } }, edges = [];
        r.list.forEach((c, i) => {
          const id = 'k' + i, f = C_FACT_AT, g = f + C_FACT.length;
          let sub = hdr ? 'section: ' + c.sec : (c.a ? '…' : '') + C_DOC.slice(c.a, c.b).replace(/\s+/g, ' ').trim().slice(0, 21);
          if (c.whole) sub = 'has the whole fact';
          else if (c.part) sub = (c.a > f ? '' : '…') + C_DOC.slice(Math.max(c.a, f), Math.min(c.b, g)).trim() + (c.b < g ? '…' : '');
          nodes[id] = { x: 110 + (i % 4) * 193, y: 150 + Math.floor(i / 4) * 100, w: 160, label: 'Chunk ' + (i + 1) + ' · ' + (c.b - c.a) + ' ch', sub: sub.slice(0, 23), kind: 'c',
            state: c.whole ? 'ok' : c.part ? 'bad' : undefined };
          if (c.part) edges.push(['fact', id, { tone: c.whole ? 'ok' : 'bad', dash: !c.whole }]);
        });
        nodes.msg = { x: 400, y: 345, shape: 'text', w: 760, label: split ? 'Split! Each half holds part of the fact, so neither matches well.' : 'Whole: chunk ' + (r.whole + 1) + ' holds the full fact, so search can match it.' };
        return { nodes, edges, vars: { chunks: r.list.length, fact: split ? 'split' : 'whole' } };
      },
      readout: s => { const r = C_chunk(s.v); return [['Chunks', r.list.length], ['Fact', r.whole < 0 ? 'split across chunks ' + r.parts.map(i => i + 1).join(' + ') : 'whole in chunk ' + (r.whole + 1)], ['Step between starts', s.v.strategy === 'markdown headers' ? 'at each ##' : (s.v.size - s.v.overlap) + ' chars']]; },
      goals: [
        { text: 'Shrink the chunks until the fact is **split** across two chunks', check: s => s.v.strategy === 'fixed characters' && C_chunk(s.v).whole < 0, solve: [{ size: 100 }] },
        { text: 'Keep the size at 100 or less and add **overlap** so one chunk holds the whole fact', check: s => s.v.strategy === 'fixed characters' && s.v.size <= 100 && s.v.overlap > 0 && C_chunk(s.v).whole >= 0, solve: [{ size: 100, overlap: 40 }] },
        { text: 'Switch to **markdown headers** so every section stays whole', check: s => s.v.strategy === 'markdown headers', solve: [{ strategy: 'markdown headers' }] }
      ],
      hints: ['Drag chunk size down. Try 100 characters.', 'Overlap repeats the end of one chunk at the start of the next. The fact is 31 characters long.', 'Set overlap to 40, then pick "markdown headers" in Strategy.'],
      done: 'Overlap is a safety net. Splitting on structure is the real fix: no fact sits on a border.' },
    { t: 'read', h: 'Common mistake → best practice',
      body: '**Mistake:** store only the chunk text and its vector. Later the bot answers, but cannot say where the answer came from. You also cannot filter by product or delete one page\'s chunks when it changes.\n\n**Best practice:** split on headings, then store [[metadata]] next to every chunk. It is just more columns in the same row.',
      code: "CREATE TABLE chunks (\n  id         bigserial PRIMARY KEY,\n  content    text NOT NULL,          -- the chunk itself\n  source_url text NOT NULL,          -- for citations\n  title      text,                   -- page title\n  section    text,                   -- '## Refunds'\n  updated_at timestamptz DEFAULT now()\n);\n-- page changed? re-chunk just that page:\nDELETE FROM chunks WHERE source_url = '/help/refunds';", lang: 'sql' },
    { t: 'quiz', kind: 'multi', q: 'Which fields are worth storing as metadata with each chunk?',
      options: ['Source URL', 'Section heading', 'Page title', 'Last updated date', 'The user\'s API key', 'The model\'s temperature setting'], answer: [0, 1, 2, 3],
      why: 'Source, section and title power citations and filters. The date lets you re-index changed pages and prefer fresh content.',
      whyNot: { 4: 'Secrets never go in your search index. Metadata describes the document, not the person asking.', 5: 'Temperature is a setting on the model call. It has nothing to do with the document you stored.' } },
    { t: 'recap', points: ['Fixed-size cuts slice sentences and tables, so a fact ends up in two weak [[chunk|chunks]].', '[[chunk overlap|Overlap]] repeats a little text across borders. Make it at least as long as a sentence.', 'Best: split on structure (headings, code blocks), about 200–800 tokens per chunk.', 'Store [[metadata]] (source URL, title, section) in the same row for citations and filters.'],
      cheat: [
        ["text.split(/\\n(?=#{1,3} )/)", 'split Markdown before each heading'],
        ['{ chunkSize: 800, chunkOverlap: 100 }', 'LangChain.js RecursiveCharacterTextSplitter options (characters)'],
        ['enc.encode(chunk).length <= 800', 'check a chunk\'s token count with tiktoken'],
        ['INSERT INTO chunks (content, source_url, title, section) VALUES ($1, $2, $3, $4)', 'store each chunk with its metadata']
      ] }
  ]
};

// ---------- Lesson 2: pgvector ----------
const C_OPS = { '<=>': 'vector_cosine_ops', '<->': 'vector_l2_ops', '<#>': 'vector_ip_ops' };
const C_IDS = [48213, 1207, 90311, 77452, 3318, 61027, 15590, 84402, 2731, 39968];
const C_fmt = n => n.toLocaleString('en-US');

const C_pgvector = {
  id: 'pgvector', title: 'Storing vectors in Postgres with pgvector', mins: 8, needs: 'chunking',
  goal: 'store embeddings in Postgres, query the nearest ones with `<=>`, and pick the right index for production.',
  cards: [
    { t: 'read', h: 'You do not need a new database',
      body: 'You have 100,000 chunks, each with a 1,536-number [[embedding]]. You need the 5 closest to a question, in a few milliseconds.\n\nYou might think you need a special [[vector database]]. You probably already run one: Postgres. The [[pgvector]] extension adds a `vector` column type and a distance operator.\n\nThe search is plain SQL: `ORDER BY embedding <=> $1 LIMIT 5`. The hard part is the same as always: picking the right index.',
      analogy: 'Choosing B-tree vs hash for a normal column. Without an index, Postgres reads every row. A vector index is a different shape of index, built for "closest to" instead of "equal to".' },
    { t: 'viz', h: 'How an HNSW index finds neighbours', body: 'An [[HNSW]] index is a graph in layers. Upper layers are sparse express routes; layer 0 has every vector.',
      nodes: {
        g2: { x: 330, y: 65, shape: 'group', w: 620, h: 100, label: 'Layer 2 · few vectors' },
        g1: { x: 330, y: 190, shape: 'group', w: 620, h: 100, label: 'Layer 1' },
        g0: { x: 330, y: 315, shape: 'group', w: 620, h: 100, label: 'Layer 0 · every vector' },
        t_A: { x: 70, y: 75, shape: 'circle', w: 38, label: 'A', kind: 'b' }, t_D: { x: 290, y: 75, shape: 'circle', w: 38, label: 'D', kind: 'b' },
        m_A: { x: 70, y: 200, shape: 'circle', w: 38, label: 'A', kind: 'b' }, m_D: { x: 290, y: 200, shape: 'circle', w: 38, label: 'D', kind: 'b' }, m_F: { x: 450, y: 200, shape: 'circle', w: 38, label: 'F', kind: 'b' },
        b_A: { x: 70, y: 325, shape: 'circle', w: 38, label: 'A', kind: 'b' }, b_B: { x: 145, y: 325, shape: 'circle', w: 38, label: 'B', kind: 'b' }, b_C: { x: 215, y: 325, shape: 'circle', w: 38, label: 'C', kind: 'b' }, b_D: { x: 290, y: 325, shape: 'circle', w: 38, label: 'D', kind: 'b' },
        b_E: { x: 370, y: 325, shape: 'circle', w: 38, label: 'E', kind: 'b' }, b_F: { x: 450, y: 325, shape: 'circle', w: 38, label: 'F', kind: 'b' }, b_G: { x: 530, y: 325, shape: 'circle', w: 38, label: 'G', kind: 'b' }, b_H: { x: 605, y: 325, shape: 'circle', w: 38, label: 'H', kind: 'b' },
        q: { x: 725, y: 250, shape: 'pill', w: 110, label: 'Query', kind: 'd' }
      },
      edges: [['t_A', 't_D', { arrow: false }], ['m_A', 'm_D', { arrow: false }], ['m_D', 'm_F', { arrow: false }],
        ['b_A', 'b_B', { arrow: false }], ['b_B', 'b_C', { arrow: false }], ['b_C', 'b_D', { arrow: false }], ['b_D', 'b_E', { arrow: false }], ['b_E', 'b_F', { arrow: false }], ['b_F', 'b_G', { arrow: false }], ['b_G', 'b_H', { arrow: false }]],
      steps: [
        { cap: 'Layer 0 holds all 100,000 vectors (8 shown). Higher layers keep fewer, like express stops on a train line.', do: [['focus', 'g0', 'g1', 'g2']] },
        { cap: 'The search starts at a fixed entry point: vector A on the top layer.', do: [['set', 't_A', { state: 'active' }], ['note', 't_A', 'entry point'], ['var', 'distance checks', 1]] },
        { cap: 'Greedy hop: A\'s neighbour D is closer to the query, so the search moves to D.', do: [['send', 't_A', 't_D', 'closer'], ['set', 't_A', { state: 'off' }], ['set', 't_D', { state: 'active' }], ['var', 'distance checks', 2]] },
        { cap: 'D has no closer neighbour up here. The search drops to layer 1, still at D.', do: [['send', 't_D', 'm_D', 'drop'], ['set', 't_D', { state: 'off' }], ['set', 'm_D', { state: 'active' }], ['var', 'distance checks', 3]] },
        { cap: 'On layer 1, D links to F, which is closer. Hop to F.', do: [['send', 'm_D', 'm_F', 'closer'], ['set', 'm_D', { state: 'off' }], ['set', 'm_F', { state: 'active' }], ['var', 'distance checks', 5]] },
        { cap: 'Drop to layer 0 at F. Check its close neighbours: G and H are nearest to the query.', do: [['send', 'm_F', 'b_F', 'drop'], ['send', 'b_F', 'b_G'], ['send', 'b_G', 'b_H'], ['set', 'm_F', { state: 'off' }], ['set', 'b_G', { state: 'ok' }], ['set', 'b_H', { state: 'ok' }], ['var', 'distance checks', 9]] },
        { cap: 'Done: 9 distance checks instead of 100,000. That is why the query takes about 3 ms, not 400 ms.', do: [['link', 'b_H', 'q', { tone: 'ok', label: 'nearest' }], ['focus', 'b_G', 'b_H', 'q'], ['note', 'q', 'top-2 found']] }
      ],
      predict: { at: 3, q: 'On the top layer, no neighbour of D is closer to the query. What does the search do next?', options: ['Drop to the layer below and keep hopping from D', 'Restart from a random vector', 'Scan every vector in layer 0'], answer: 0,
        why: 'Each layer gets you close fast. Dropping a layer adds more links nearby, so the search keeps hopping from where it is.' } },
    { t: 'quiz', q: 'You are launching to production with 2 million chunks that grow every day. Which index do you add?',
      options: ['HNSW with `vector_cosine_ops`', 'IVFFlat built right after `CREATE TABLE`', 'No index: an exact scan is always best', 'A B-tree on the `embedding` column'], answer: 0,
      why: '[[HNSW]] is fast, keeps high [[recall]] as rows are added, and needs no training data. It costs more memory and a slower build, which is usually fine.',
      whyNot: { 1: '[[IVFFlat]] learns its clusters from the rows that exist when you build it. Built on an empty table, its clusters are useless and recall is poor.', 2: 'An exact scan reads all 2 million vectors on every query. That is hundreds of milliseconds and grows with the table.', 3: 'A B-tree sorts values for equals and ranges. It cannot answer "closest to" for 1,536 numbers.' } },
    { t: 'play', kind: 'terminal', h: 'Try it: pgvector in psql',
      body: 'A pretend `psql` session. Enable the extension, make a table, load 100,000 chunks and time a nearest-neighbour query before and after an index.',
      prompt: 'app=#', welcome: 'psql (16.4) · connected to database "app"\nTiming is on. Type help to see the commands.',
      init: () => ({ ext: false, table: false, dims: 1536, rows: 0, idx: null, ef: 40, last: null, sawSeq: false, sawIdx: false }),
      cmds: [
        { re: /^create\s+extension\s+(if\s+not\s+exists\s+)?"?(\w+)"?\s*;?$/i, help: 'CREATE EXTENSION vector;', desc: 'turn on pgvector in this database', run(m, s) {
          if (m[2].toLowerCase() !== 'vector') return { err: 'ERROR:  extension "' + m[2] + '" is not available\nHINT:  pgvector installs as the extension named "vector".' };
          if (s.ext) return m[1] ? 'NOTICE:  extension "vector" already exists, skipping\nCREATE EXTENSION' : { err: 'ERROR:  extension "vector" already exists' };
          s.ext = true; return 'CREATE EXTENSION';
        } },
        { re: /^create\s+table\s+(if\s+not\s+exists\s+)?chunks\s*\(([\s\S]*)\)\s*;?$/i, help: 'CREATE TABLE chunks (id bigserial primary key, content text, embedding vector(1536));', desc: 'make a table with a vector column', run(m, s) {
          const d = /vector\s*\(\s*(\d+)\s*\)/i.exec(m[2]);
          if (!d) return { err: 'This table has no vector column. Add one, for example: embedding vector(1536)' };
          if (!s.ext) return { err: 'ERROR:  type "vector" does not exist\nHINT:  run CREATE EXTENSION vector; first.' };
          if (s.table) return m[1] ? 'NOTICE:  relation "chunks" already exists, skipping\nCREATE TABLE' : { err: 'ERROR:  relation "chunks" already exists' };
          s.table = true; s.dims = +d[1]; return 'CREATE TABLE';
        } },
        { re: /^\\d\+?\s+chunks\s*;?$/i, help: '\\d chunks', desc: 'describe the table and its indexes', run(m, s) {
          if (!s.table) return { err: 'Did not find any relation named "chunks".' };
          const t = 'vector(' + s.dims + ')';
          return '              Table "public.chunks"\n  Column   |     Type      | Nullable\n-----------+---------------+---------\n id        | bigint        | not null\n content   | text          |\n embedding | ' + t.padEnd(13) + ' |\nIndexes:\n    "chunks_pkey" PRIMARY KEY, btree (id)' + (s.idx ? '\n    "chunks_embedding_idx" ' + s.idx.type + ' (embedding ' + s.idx.ops + ')' : '');
        } },
        { re: /^\\copy\s+chunks\b[\s\S]*\bfrom\s+'?[\w./-]+'?[\s\S]*$/i, help: "\\copy chunks (content, embedding) FROM 'chunks.csv' CSV", desc: 'bulk-load 100,000 embedded chunks', run(m, s, io) {
          if (!s.table) return { err: 'ERROR:  relation "chunks" does not exist' };
          s.rows += 100000; io.send('psql', 'pg', '100k rows'); io.send('pg', 'tbl');
          return 'COPY 100000' + (s.idx && s.idx.type === 'ivfflat' && s.idx.empty ? '\n(warning for you: the IVFFlat index was built on an empty table, so its clusters are stale)' : '');
        } },
        { re: /^insert\s+into\s+chunks\b[\s\S]*$/i, help: 'INSERT INTO chunks (content, embedding) VALUES (...);', desc: 'add rows one by one', run(m, s) {
          if (!s.table) return { err: 'ERROR:  relation "chunks" does not exist' };
          const g = /generate_series\s*\(\s*1\s*,\s*(\d+)\s*\)/i.exec(m[0]), n = g ? Math.min(+g[1], 1000000) : Math.max(1, (m[0].match(/\)\s*,\s*\(/g) || []).length + 1);
          s.rows += n; return 'INSERT 0 ' + n;
        } },
        { re: /^create\s+index\b[\s\S]*\bon\s+chunks\s+using\s+(hnsw|ivfflat)\s*\(\s*embedding\s*(\w+)?\s*\)[\s\S]*$/i, help: 'CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);', desc: 'build a vector index', run(m, s, io) {
          if (!s.table) return { err: 'ERROR:  relation "chunks" does not exist' };
          if (s.idx) return { err: 'ERROR:  relation "chunks_embedding_idx" already exists\nHINT:  DROP INDEX chunks_embedding_idx; to rebuild it.' };
          const type = m[1].toLowerCase(), ops = (m[2] || 'vector_l2_ops').toLowerCase();
          if (!Object.values(C_OPS).includes(ops)) return { err: 'ERROR:  operator class "' + ops + '" does not exist for access method "' + type + '"' };
          s.idx = { type, ops, empty: s.rows === 0 }; io.send('pg', 'idx', 'build');
          const msg = type === 'ivfflat' && s.rows === 0 ? 'NOTICE:  ivfflat index created with little data\nDETAIL:  This will cause low recall.\nHINT:  Drop the index until the table has more data.\n' : '';
          return msg + 'CREATE INDEX' + (s.rows ? '\nTime: ' + (s.rows / 100000 * (type === 'hnsw' ? 38211.4 : 6120.8)).toFixed(1) + ' ms' : '');
        } },
        { re: /^drop\s+index\s+(if\s+exists\s+)?\w+\s*;?$/i, help: 'DROP INDEX chunks_embedding_idx;', desc: 'remove the vector index', run(m, s) {
          if (!s.idx) return m[1] ? 'NOTICE:  index does not exist, skipping\nDROP INDEX' : { err: 'ERROR:  index "chunks_embedding_idx" does not exist' };
          s.idx = null; return 'DROP INDEX';
        } },
        { re: /^set\s+hnsw\.ef_search\s*(=|to)\s*(\d+)\s*;?$/i, help: 'SET hnsw.ef_search = 100;', desc: 'search wider for higher recall (default 40)', run(m, s) { s.ef = Math.max(1, Math.min(1000, +m[2])); return 'SET'; } },
        { re: /^select\s+count\s*\(\s*\*\s*\)\s+from\s+chunks\s*;?$/i, help: 'SELECT count(*) FROM chunks;', desc: 'count the rows', run(m, s) {
          if (!s.table) return { err: 'ERROR:  relation "chunks" does not exist' };
          return ' count\n--------\n ' + s.rows + '\n(1 row)';
        } },
        { re: /^(explain\s+(?:\(\s*)?analyze\s*\)?\s+)?select\b[\s\S]*\bfrom\s+chunks\b[\s\S]*order\s+by\s+embedding\s*(<=>|<->|<#>)[\s\S]*?limit\s+(\d+)\s*;?$/i, help: "EXPLAIN ANALYZE SELECT id FROM chunks ORDER BY embedding <=> '[0.12, -0.03, ...]' LIMIT 5;", desc: 'time a nearest-neighbour query', run(m, s, io) {
          if (!s.table) return { err: 'ERROR:  relation "chunks" does not exist' };
          const op = m[2], k = Math.min(+m[3], 10), rows = Math.min(k, s.rows), useIdx = !!s.idx && s.idx.ops === C_OPS[op] && s.rows > 0;
          const ms = useIdx ? +(2.9 * Math.max(1, s.ef / 40)).toFixed(3) : +Math.max(0.05, s.rows / 100000 * 411.9).toFixed(3);
          s.last = { plan: useIdx ? 'Index Scan' : 'Seq Scan', ms };
          if (s.rows >= 100000) { if (useIdx && s.idx.type === 'hnsw') s.sawIdx = true; if (!useIdx) s.sawSeq = true; }
          io.send('psql', 'pg', 'query');
          if (useIdx) { io.send('pg', 'idx', 'graph walk'); io.send('idx', 'tbl', k + ' ids', 'ok'); } else io.send('pg', 'tbl', 'read all', s.rows >= 100000 ? 'bad' : undefined);
          const mis = s.idx && !useIdx && s.rows ? '\n-- index skipped: it was built with ' + s.idx.ops + ', but ' + op + ' needs ' + C_OPS[op] : '';
          if (!m[1]) return '  id\n-------\n' + C_IDS.slice(0, rows).map(i => ' ' + i).join('\n') + (rows ? '\n' : '') + '(' + rows + ' rows)\n\nTime: ' + ms + ' ms' + mis;
          return useIdx
            ? ' Limit (actual time=' + (ms - 0.2).toFixed(2) + '..' + ms.toFixed(2) + ' rows=' + rows + ' loops=1)\n   ->  Index Scan using chunks_embedding_idx on chunks\n         Order By: (embedding ' + op + " '[...]'::vector)\n Execution Time: " + ms.toFixed(3) + ' ms'
            : ' Limit (actual time=' + ms.toFixed(1) + '..' + ms.toFixed(1) + ' rows=' + rows + ' loops=1)\n   ->  Sort (Sort Key: embedding ' + op + " '[...]'::vector)\n         ->  Seq Scan on chunks (rows=" + s.rows + ' loops=1)\n Execution Time: ' + ms.toFixed(3) + ' ms' + mis;
        } }
      ],
      view: s => ({
        nodes: {
          psql: { x: 100, y: 190, label: 'psql', sub: 'you', kind: 'a' },
          pg: { x: 330, y: 190, shape: 'db', label: 'Postgres', sub: s.ext ? 'vector ✓' : 'no vector', kind: 'b', state: s.ext ? 'ok' : undefined },
          tbl: { x: 620, y: 90, w: 160, label: 'chunks', sub: s.table ? C_fmt(s.rows) + ' rows' : 'not created', kind: 'c', state: s.table ? undefined : 'off' },
          idx: { x: 620, y: 290, w: 160, label: s.idx ? s.idx.type.toUpperCase() + ' index' : 'No vector index', sub: s.idx ? s.idx.ops.replace('vector_', '') : 'full scan only', kind: 'd',
            state: !s.idx ? 'off' : s.idx.type === 'ivfflat' && s.idx.empty ? 'warn' : 'ok' }
        },
        edges: [['psql', 'pg'], ['pg', 'tbl'], ['pg', 'idx', { dash: true }], ['idx', 'tbl', { dash: true }]],
        vars: s.last ? { plan: s.last.plan, 'query time': s.last.ms + ' ms', rows: C_fmt(s.rows) } : { rows: C_fmt(s.rows) }
      }),
      goals: [
        { text: 'Enable the extension and create the `chunks` table with a `vector(1536)` column', check: s => s.table, solve: ['CREATE EXTENSION vector;', 'CREATE TABLE chunks (id bigserial primary key, content text, embedding vector(1536));'] },
        { text: 'Load 100,000 rows and see a slow **Seq Scan** with `EXPLAIN ANALYZE`', check: s => s.sawSeq, solve: ["\\copy chunks (content, embedding) FROM 'chunks.csv' CSV", "EXPLAIN ANALYZE SELECT id FROM chunks ORDER BY embedding <=> '[0.12, -0.03, ...]' LIMIT 5;"] },
        { text: 'Create an **HNSW** index with `vector_cosine_ops` and see an **Index Scan**', check: s => s.sawIdx, solve: ['CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);', "EXPLAIN ANALYZE SELECT id FROM chunks ORDER BY embedding <=> '[0.12, -0.03, ...]' LIMIT 5;"] }
      ],
      hints: ['Start with `CREATE EXTENSION vector;` then the `CREATE TABLE` from `help`.', "Load data with `\\copy chunks (content, embedding) FROM 'chunks.csv' CSV`, then run the `EXPLAIN ANALYZE` query.", 'Run `CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);` and the same EXPLAIN again.'],
      try: ['CREATE EXTENSION vector;', '\\d chunks', "EXPLAIN ANALYZE SELECT id FROM chunks ORDER BY embedding <=> '[0.12, -0.03, ...]' LIMIT 5;", 'help'],
      done: 'From about 400 ms to about 3 ms. Same SQL, same rows: only the index changed.' },
    { t: 'read', h: 'Common mistake → best practice',
      body: '**Mistake:** build the index with one distance and query with another. The index below is for cosine (`<=>`), but the query uses `<->` (L2). Postgres silently skips the index and scans every row.\n\n**Best practice:** pick one distance and use it everywhere. For most text [[embedding|embeddings]] that is cosine: `vector_cosine_ops` in the index, `<=>` in the query. Build [[IVFFlat]] only after loading data; prefer [[HNSW]].',
      code: "CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops)\n  WITH (m = 16, ef_construction = 64);   -- the defaults\n\n-- ✕ Seq Scan: wrong operator for this index\nSELECT id FROM chunks ORDER BY embedding <-> $1 LIMIT 5;\n-- ✓ Index Scan\nSELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 5;\n\nSET hnsw.ef_search = 100;  -- wider search, higher recall (default 40)", lang: 'sql' },
    { t: 'quiz', kind: 'fill', q: 'Complete the query so it returns the 5 [[nearest neighbour|nearest neighbours]] by cosine distance:', pre: 'SELECT id FROM chunks ORDER BY embedding', post: '$1 LIMIT 5;', answer: ['<=>'], placeholder: 'operator',
      why: '`<=>` is cosine distance in pgvector. `<->` is L2 (straight-line) distance and `<#>` is negative inner product.', hints: ['It is a three-character operator made of angle brackets and one symbol.', 'Cosine distance looks like a spaceship: `<` `=` `>`.'] },
    { t: 'recap', points: ['[[pgvector]] turns Postgres into a [[vector database]]: a `vector(1536)` column and plain SQL.', '`ORDER BY embedding <=> $1 LIMIT 5` returns the 5 nearest chunks by cosine distance.', 'With no index, every query scans every row: fine at 1,000 rows, slow at 100,000.', 'Use [[HNSW]] with `vector_cosine_ops` in production. [[IVFFlat]] needs data first and drifts as you insert.', 'Query with the same operator the index was built for, or the index is skipped.'],
      cheat: [
        ['CREATE EXTENSION vector;', 'enable pgvector'],
        ['embedding vector(1536)', 'column for a 1,536-number embedding'],
        ['ORDER BY embedding <=> $1 LIMIT 5', '5 nearest by cosine distance'],
        ['CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);', 'production vector index'],
        ['SET hnsw.ef_search = 100;', 'trade a little speed for higher recall'],
        ['EXPLAIN ANALYZE SELECT …', 'check for Index Scan vs Seq Scan']
      ] }
  ]
};

// ---------- Lesson 3: RAG ----------
const C_KB = {
  R: ['refunds.md', 'Refunds: 5–7 business days'], RT: ['returns.md', 'Return items within 30 days'], G: ['gift-cards.md', 'Gift cards: no cash back'],
  SH: ['shipping.md', 'Shipping takes 3–5 days'], W1: ['warranty.md', 'Default warranty: 1 year'], W2: ['warranty-plans.md', 'Extended plans: +2 years'],
  S70: ['sku-4470.md', 'SKU-4470 Kettle Mini: 1 yr'], S71: ['sku-4471.md', 'SKU-4471 Kettle Pro: 3 yrs']
};
const C_Q_MONEY = 'How do I get my money back?', C_Q_SKU = 'What is the warranty on SKU-4471?';
// Precomputed top-6 lists per retriever and reranker scores, so the sim is deterministic.
const C_QS = {
  [C_Q_MONEY]: { short: 'money back?', vec: ['R', 'RT', 'G', 'SH', 'W2', 'W1'], kw: ['G'], rr: { R: .95, RT: .71, G: .12, SH: .05, W2: .03, W1: .02 }, need: 'R',
    good: n => 'Refunds reach your card in 5–7 business days [' + n + '].', wrong: 'Gift cards cannot be refunded [1].', none: 'Refunds usually take 30 days.' },
  [C_Q_SKU]: { short: 'SKU-4471?', vec: ['W1', 'W2', 'S70', 'RT', 'SH', 'G'], kw: ['S71', 'S70', 'W1', 'W2'], rr: { S71: .97, S70: .52, W1: .44, W2: .31, RT: .04, SH: .03, G: .02 }, need: 'S71',
    good: n => 'SKU-4471 has a 3-year warranty [' + n + '].', wrong: 'SKU-4471 has a 1-year warranty [1].', none: 'Most kettles have a 2-year warranty.' }
};
function C_ragRun(v) {
  const q = C_QS[v.query], sc = {};
  [v.vector && q.vec, v.bm25 && q.kw].filter(Boolean).forEach(l => l.forEach((id, i) => { sc[id] = (sc[id] || 0) + 1 / (60 + i + 1); }));
  const ranked = Object.keys(sc).sort((a, b) => v.rerank ? q.rr[b] - q.rr[a] : sc[b] - sc[a]);
  const top = ranked.slice(0, v.topk), at = top.indexOf(q.need), grounded = at >= 0;
  return { q, top, grounded, answer: grounded ? q.good(at + 1) : top.length ? q.wrong : q.none };
}

const C_rag = {
  id: 'rag', title: 'RAG: answering from your own data', mins: 9, needs: 'pgvector',
  goal: 'build a RAG pipeline that finds the right chunks with hybrid search and answers with citations instead of guesses.',
  cards: [
    { t: 'read', h: 'The model has never read your docs',
      body: 'A customer asks your bot: "What is the warranty on SKU-4471?" The model was trained on the public web. It has never seen your product pages. So it guesses: "2 years." That confident guess is a [[hallucination]].\n\n[[RAG]] fixes this with a step you already know: a database query. Find the chunks that answer the question, paste them into the prompt, and tell the model to answer only from them.',
      analogy: 'Server-side rendering. You do not ask the template to invent data. You query the database first, then pass the rows into the template. In RAG the "template" is the prompt.' },
    { t: 'viz', h: 'A RAG request, step by step', body: 'Follow one question through the pipeline, then a harder one.',
      nodes: {
        q: { x: 80, y: 190, shape: 'pill', w: 120, label: 'Query', sub: 'money back?', kind: 'a' },
        emb: { x: 240, y: 100, label: 'Embed', sub: 'text → vector', kind: 'b' },
        vec: { x: 410, y: 100, shape: 'db', label: 'pgvector', sub: 'top-5', kind: 'c' },
        ctx: { x: 570, y: 190, w: 130, label: 'Context', sub: 'top-k chunks', kind: 'c' },
        llm: { x: 720, y: 100, w: 120, label: 'LLM', sub: 'prompt + rules', kind: 'b' },
        ans: { x: 720, y: 290, w: 120, label: 'Answer', kind: 'a' }
      },
      edges: [['q', 'emb'], ['emb', 'vec'], ['vec', 'ctx'], ['ctx', 'llm'], ['llm', 'ans']],
      steps: [
        { cap: 'The question is turned into an [[embedding]] and sent to [[pgvector]] for the nearest chunks.', do: [['send', 'q', 'emb', 'text'], ['send', 'emb', 'vec', 'vector'], ['focus', 'q', 'emb', 'vec']] },
        { cap: 'pgvector returns the [[top-k]] chunks. Best match: refunds.md, score 0.89.', do: [['send', 'vec', 'ctx', 'refunds.md'], ['set', 'ctx', { sub: 'refunds.md 0.89' }], ['focus', 'vec', 'ctx']] },
        { cap: 'The chunks go into the prompt with rules: answer only from them, cite sources. The answer is grounded.', do: [['send', 'ctx', 'llm', 'chunks'], ['send', 'llm', 'ans', '5–7 days [1]', 'ok'], ['set', 'ans', { state: 'ok', sub: '5–7 days [1]' }]] },
        { cap: 'Now a harder one: "What is the warranty on SKU-4471?" The exact code matters here.', do: [['set', 'q', { sub: 'SKU-4471?' }], ['set', 'ans', { state: undefined, sub: '' }], ['set', 'ctx', { sub: 'top-k chunks' }], ['send', 'q', 'emb'], ['send', 'emb', 'vec']] },
        { cap: 'Vector search returns general warranty pages and SKU-4470. To an embedding, 4470 and 4471 look the same. The answer is wrong.', do: [['set', 'vec', { state: 'bad' }], ['set', 'ctx', { state: 'bad', sub: 'sku-4470.md…' }], ['send', 'ctx', 'llm'], ['send', 'llm', 'ans', '1 year ✕', 'bad'], ['set', 'ans', { state: 'bad', sub: '1 year ✕' }]] },
        { cap: 'Fix: run [[BM25]] keyword search too. It matches the exact token "SKU-4471" and ranks that page first.', do: [['add', 'kw', { x: 410, y: 300, shape: 'db', label: 'BM25', sub: 'keywords', kind: 'd' }], ['link', 'emb', 'kw', { dash: true }], ['link', 'kw', 'ctx'], ['send', 'emb', 'kw', 'SKU-4471'], ['send', 'kw', 'ctx', 'sku-4471.md', 'ok']] },
        { cap: '[[RRF]] merges both ranked lists. A [[reranker]] re-scores them, so sku-4471.md lands at #1.', do: [['set', 'vec', { state: undefined }], ['set', 'ctx', { state: 'ok', label: 'RRF + rerank', sub: '#1 sku-4471.md' }], ['focus', 'vec', 'kw', 'ctx']] },
        { cap: 'The model answers from the right chunk and cites it: "3-year warranty [1]".', do: [['send', 'ctx', 'llm', 'top 3'], ['send', 'llm', 'ans', '3 years [1]', 'ok'], ['set', 'ans', { state: 'ok', sub: '3 years [1]' }]] }
      ],
      predict: { at: 4, q: 'The query contains an exact product code, SKU-4471. Where does this pipeline go wrong?', options: ['Vector search: embeddings blur exact codes, so the wrong SKU ranks high', 'The embed step crashes on the dash in "SKU-4471"', 'The model refuses to answer product questions'], answer: 0,
        why: 'Embeddings capture meaning, not exact strings. "SKU-4470 warranty" means almost the same as "SKU-4471 warranty".' } },
    { t: 'quiz', kind: 'order', q: 'Put the steps of a RAG request in order.',
      items: ['Embed the user\'s question', 'Retrieve top-k chunks with vector and keyword search', 'Merge the lists with RRF and rerank them', 'Put the best chunks in the prompt with rules', 'The model answers and cites its sources'],
      why: 'Search first, then generate. The model only sees what retrieval hands it, so most RAG bugs are search bugs.' },
    { t: 'play', kind: 'controls', h: 'Try it: tune the retriever',
      body: 'Pick a question and switch retrievers on and off. The list shows the chunks that go into the prompt. This prompt has no "say I don\'t know" rule, so a miss becomes a confident wrong answer.',
      init: () => ({}),
      controls: [
        { id: 'query', type: 'select', label: 'Question', options: [C_Q_MONEY, C_Q_SKU] },
        { id: 'vector', type: 'toggle', label: 'Vector search', value: true },
        { id: 'bm25', type: 'toggle', label: 'Keyword (BM25)' },
        { id: 'rerank', type: 'toggle', label: 'Reranker' },
        { id: 'topk', type: 'range', label: 'Top-k', min: 1, max: 5, value: 3, unit: 'chunks' }
      ],
      update: (s, io) => { if (s.v.vector) io.send('q', 'vec'); if (s.v.bm25) io.send('q', 'kw'); const r = C_ragRun(s.v); io.send('llm', 'ans', r.grounded ? 'grounded' : 'guess', r.grounded ? 'ok' : 'bad'); },
      view: s => {
        const r = C_ragRun(s.v), nodes = {
          q: { x: 80, y: 190, shape: 'pill', w: 120, label: 'Query', sub: r.q.short, kind: 'a' },
          vec: { x: 250, y: 80, w: 140, label: 'Vector search', sub: 'by meaning', kind: 'c', state: s.v.vector ? undefined : 'off' },
          kw: { x: 250, y: 190, w: 140, label: 'BM25 keyword', sub: 'by exact words', kind: 'd', state: s.v.bm25 ? undefined : 'off' },
          rr: { x: 250, y: 300, w: 140, label: 'Reranker', sub: s.v.rerank ? 'reorders' : 'off', kind: 'b', state: s.v.rerank ? undefined : 'off' },
          llm: { x: 720, y: 110, w: 120, label: 'LLM', sub: r.top.length + ' chunks', kind: 'b' },
          ans: { x: 720, y: 280, w: 120, label: r.grounded ? 'Grounded' : 'Hallucinated', sub: r.grounded ? 'cites source' : 'wrong answer', kind: 'a', state: r.grounded ? 'ok' : 'bad' }
        }, edges = [['q', 'vec', { dash: !s.v.vector }], ['q', 'kw', { dash: !s.v.bm25 }], ['llm', 'ans', { tone: r.grounded ? 'ok' : 'bad' }]];
        if (!r.top.length) nodes.none = { x: 490, y: 190, w: 200, label: 'No chunks found', sub: 'model guesses', kind: 'n', state: 'bad' };
        r.top.forEach((id, i) => {
          nodes['r' + i] = { x: 490, y: 50 + i * 70, w: 200, h: 40, label: '#' + (i + 1) + ' ' + C_KB[id][0], sub: C_KB[id][1], kind: 'c', state: id === r.q.need ? 'ok' : undefined };
          edges.push(['r' + i, 'llm', { dash: true, arrow: false }]);
        });
        if (s.v.rerank && r.top.length) edges.push(['rr', 'r0', { dash: true, label: 'reorders' }]);
        return { nodes, edges, vars: { answer: r.answer } };
      },
      readout: s => { const r = C_ragRun(s.v); return [['Answer', r.answer], ['Grounded', r.grounded ? 'yes' : 'no'], ['Chunks in prompt', r.top.length]]; },
      goals: [
        { text: 'Get a **grounded** answer to the SKU-4471 question', check: s => s.v.query === C_Q_SKU && C_ragRun(s.v).grounded, solve: [{ query: C_Q_SKU, bm25: true, topk: 5 }] },
        { text: 'Turn keyword search off and watch the model **hallucinate**', check: s => !C_ragRun(s.v).grounded, solve: [{ bm25: false }] },
        { text: 'Turn on the **reranker** and get the SKU answer right with top-k = 3', check: s => s.v.query === C_Q_SKU && s.v.rerank && s.v.topk <= 3 && C_ragRun(s.v).grounded, solve: [{ bm25: true, rerank: true, topk: 3 }] }
      ],
      hints: ['Pick the SKU-4471 question. Which retriever matches exact codes?', 'Turn on Keyword (BM25). After merging, the SKU page is #4, so raise top-k to 4 or more.', 'With BM25 on, turn on the reranker and set top-k to 3. A reranker cannot rescue a chunk that no retriever found.'],
      done: 'Hybrid search finds the chunk. The reranker puts it on top. Then a small top-k is enough.' },
    { t: 'read', h: 'Common mistake → best practice',
      body: '**Mistake:** paste the chunks under the question and hope. When retrieval misses, the model fills the gap from memory and sounds just as sure.\n\n**Best practice:** number each chunk with its source. Tell the model to answer only from them, cite them, and say "I don\'t know" otherwise. Now a retrieval miss is an honest "I don\'t know", not a [[hallucination]].',
      code: "const context = chunks\n  .map((c, i) => `[${i + 1}] (${c.source_url})\\n${c.content}`)\n  .join('\\n\\n');\n\nconst system = `Answer ONLY from the context below.\nCite sources like [1]. If the answer is not in the context,\nsay \"I don't know\".\n\n${context}`;", lang: 'ts' },
    { t: 'quiz', kind: 'multi', q: 'Which questions need keyword (BM25) search, not just vector search?',
      options: ['What is the warranty on SKU-4471?', 'What does error E1043 mean?', 'Is order #88213 shipped yet?', 'How do I get my money back?'], answer: [0, 1, 2],
      why: 'Codes, IDs and SKUs are exact strings. [[BM25]] matches them; embeddings blur them into "something similar".',
      whyNot: { 3: 'This is a meaning question with no exact code. Vector search handles it well: "money back" matches a refunds page.' } },
    { t: 'recap', points: ['[[RAG]] = search your data, put the best chunks in the prompt, answer only from them.', 'Vector search misses exact strings like SKUs and error codes. Add [[BM25]] for [[hybrid search]].', 'Merge the lists with [[RRF]], then let a [[reranker]] pick the best few.', 'Prompt rules: answer only from context, cite sources, say "I don\'t know" otherwise.'],
      cheat: [
        ['ORDER BY embedding <=> $1 LIMIT 20', 'vector candidates'],
        ['WHERE tsv @@ plainto_tsquery($1)', 'keyword candidates (Postgres full-text)'],
        ['score = Σ 1 / (60 + rank)', 'RRF: merge ranked lists'],
        ['rerank(query, candidates).slice(0, 3)', 'keep the best 3 for the prompt'],
        ['"Answer ONLY from the context. Cite [n]. Else say I don\'t know."', 'grounding rule in the system prompt']
      ] }
  ]
};

;
// Module 3: Tools and agents. Every top-level name starts with D_.
const D_GLOSS = {
  'JSON Schema': 'A standard JSON format for describing the shape of data: field names, types and which fields are required. Tools use it to describe their arguments.',
  'idempotency key': 'A unique ID you attach to a request with side effects. If the same key arrives twice, the server does the work only once.',
  'JSON-RPC': 'A tiny protocol for calling functions over a connection: send `{"method": "...", "params": {...}, "id": 1}`, get back `{"result": ...}` with the same id.',
  'OpenTelemetry': 'The open standard for traces, metrics and logs. You create spans in code and send them to any compatible backend.'
};

// ---------- Lesson 1: tool calling ----------
const D_SAMPLE_TOOLS = () => ({
  fetch_order_status: a => ({ order_id: a.order_id, status: a.order_id === '4417' ? 'shipped' : 'processing', eta: '2026-11-02' })
});
const D_CALLS = [
  { id: 'call_1', name: 'fetch_order_status', arguments: '{"order_id":"4417"}' },
  { id: 'call_2', name: 'delete_user', arguments: '{"user_id":"42"}' },
  { id: 'call_3', name: 'fetch_order_status', arguments: '{"order_id": 4417' }
];
const D_runCase = (s, i) => {
  if (!s || !s.api || typeof s.api.runToolCall !== 'function') return null;
  try { return { msg: s.api.runToolCall(D_CALLS[i], D_SAMPLE_TOOLS()) }; } catch (e) { return { threw: String(e && e.message || e) }; }
};
const D_isToolMsg = r => !!r && !!r.msg && r.msg.role === 'tool' && typeof r.msg.content === 'string';
const D_okValid = s => { const r = D_runCase(s, 0); if (!D_isToolMsg(r) || r.msg.name !== 'fetch_order_status') return false; try { return JSON.parse(r.msg.content).status === 'shipped'; } catch (e) { return false; } };
const D_okErr = (s, i, re) => { const r = D_runCase(s, i); return D_isToolMsg(r) && re.test(r.msg.content); };
const D_TOOLS_V1 = 'function runToolCall(call, tools) {\n  const args = JSON.parse(call.arguments);\n  const result = tools[call.name](args);\n  return { role: "tool", tool_call_id: call.id, name: call.name, content: JSON.stringify(result) };\n}';
const D_TOOLS_V2 = 'function runToolCall(call, tools) {\n  const msg = content => ({ role: "tool", tool_call_id: call.id, name: call.name, content });\n  const fn = tools[call.name];\n  if (!fn) return msg(`Error: unknown tool "${call.name}". Available tools: ${Object.keys(tools).join(", ")}`);\n  const args = JSON.parse(call.arguments);\n  return msg(JSON.stringify(fn(args)));\n}';
const D_TOOLS_V3 = 'function runToolCall(call, tools) {\n  const msg = content => ({ role: "tool", tool_call_id: call.id, name: call.name, content });\n  const fn = tools[call.name];\n  if (!fn) return msg(`Error: unknown tool "${call.name}". Available tools: ${Object.keys(tools).join(", ")}`);\n  let args;\n  try { args = JSON.parse(call.arguments); }\n  catch (e) { return msg(`Error: arguments are not valid JSON (${e.message}). Send an object like {"order_id":"4417"}.`); }\n  return msg(JSON.stringify(fn(args)));\n}';

const D_tools = {
  id: 'tools', title: 'Tool calling: the model asks, your code acts', mins: 8,
  goal: 'register a tool, run the model\'s tool call safely in your backend, and send the result back.',
  cards: [
    { t: 'read', h: 'Your chatbot cannot see your database.',
      body: 'A customer asks: "Where is order 4417?" The [[LLM]] has never seen your orders table. On its own it can only guess, or [[hallucination|make something up]].\n\n[[tool calling|Tool calling]] fixes this. You describe functions the model may ask for. The model replies with a request, not an answer. **Your** code runs the real query and hands back the result.',
      analogy: 'A dynamic RPC endpoint. You publish the routes and their body schemas, like an OpenAPI spec. The client picks the route and fills in the payload. Your server still validates it and does the work.',
      code: '// You register this. It is just JSON Schema.\n{\n  "name": "fetch_order_status",\n  "description": "Get the shipping status of one order",\n  "parameters": {\n    "type": "object",\n    "properties": { "order_id": { "type": "string" } },\n    "required": ["order_id"]\n  }\n}', lang: 'json' },
    { t: 'viz', h: 'Follow one tool call', body: 'Step through it. Watch who talks to the database.',
      nodes: {
        user: { x: 90, y: 190, label: 'User', shape: 'circle', w: 74, kind: 'a' },
        app: { x: 330, y: 190, label: 'Your backend', sub: 'Node or Python', kind: 'd' },
        model: { x: 640, y: 70, label: 'Model API', sub: 'LLM', kind: 'b' },
        db: { x: 640, y: 310, label: 'Orders DB', shape: 'db', kind: 'c' }
      },
      steps: [
        { cap: 'The user asks: "Where is order 4417?" The request hits your backend, like any API call.', do: [['link', 'user', 'app'], ['send', 'user', 'app', 'order 4417?'], ['focus', 'user', 'app']] },
        { cap: 'Your backend sends the chat plus the tool list (name, description, [[JSON Schema]]) to the model.', do: [['link', 'app', 'model'], ['send', 'app', 'model', 'messages + tools'], ['var', 'tools', 'fetch_order_status']] },
        { cap: 'The model does not answer. It replies with a tool call: a name plus arguments as a JSON **string**.', do: [['send', 'model', 'app', 'tool_call'], ['set', 'model', { state: 'active' }], ['var', 'arguments', '\'{"order_id":"4417"}\' (a string)']] },
        { cap: 'Your backend parses and validates the args, checks this user owns the order, then runs the real query.', do: [['link', 'app', 'db'], ['send', 'app', 'db', 'SELECT status'], ['set', 'app', { state: 'active' }], ['note', 'app', 'validate + authorize'], ['set', 'db', { state: 'active' }]] },
        { cap: 'The database answers. The model still has not touched it.', do: [['send', 'db', 'app', 'shipped', 'ok'], ['set', 'db', { state: 'ok' }]] },
        { cap: 'Your backend sends the result back as a message with `role: "tool"`.', do: [['send', 'app', 'model', 'role: tool', 'ok'], ['var', 'last message', 'role: "tool"']] },
        { cap: 'Now the model has facts. It writes the final answer, and your backend returns it.', do: [['send', 'model', 'app', 'answer', 'ok'], ['send', 'app', 'user', 'Shipped, ETA Nov 2', 'ok'], ['set', 'user', { state: 'ok' }], ['set', 'model', { state: 'ok' }]] }
      ],
      predict: { at: 3, q: 'The model asked for `fetch_order_status`. Who actually runs it?', options: ['The model, on the provider\'s servers', 'Your backend code', 'The user\'s browser'], answer: 1,
        why: 'The model only writes a request. It never runs code or opens a database connection. Your backend decides whether to run it, and how.' } },
    { t: 'quiz', q: 'The model returns `{"name":"refund_order","arguments":"{\\"order_id\\":\\"9001\\",\\"amount\\":5000}"}`. What should your backend do first?',
      options: ['Run the refund right away. The model chose it.', 'Parse and validate the args, and check this user owns order 9001', 'Ask the model if it is sure', 'Forward the call to the payment provider unchanged'], answer: 1,
      why: 'Treat tool arguments like any request body from an untrusted client. Validate the shape, check limits, and authorize per user.',
      whyNot: { 0: 'The model can be tricked by the user\'s text, or just be wrong. Choosing a tool is not permission to run it.', 2: 'Asking again gives you another guess, not a check. Validation is code, not a vibe.', 3: 'That skips your validation and auth. Your backend is the trust boundary.' } },
    { t: 'read', h: 'Common mistake → best practice',
      body: '**Mistake:** `JSON.parse` the args and pass them straight to the database. A prompt like "refund order 9001 for $5,000" can steer the model into a call you never meant to allow.\n\n**Best practice:** validate with a schema ([[Zod]] or Pydantic), check permissions for **this** user, and return an error string instead of throwing. The model can read the error and try again.',
      code: 'const Args = z.object({ order_id: z.string(), amount: z.number().positive().max(500) });\n\nconst parsed = Args.safeParse(safeJson(call.arguments));\nif (!parsed.success) return toolMsg(call, `Invalid args: ${parsed.error.message}`);\n\nconst order = await db.orders.find(parsed.data.order_id);\nif (order?.userId !== session.userId) return toolMsg(call, "Not your order");\n\nreturn toolMsg(call, JSON.stringify(await refunds.create(parsed.data)));', lang: 'ts' },
    { t: 'play', kind: 'code', h: 'Write the tool runner',
      body: 'Write `runToolCall(call, tools)`. It must always return `{ role: "tool", name, content }`, where `content` is a **string**. The diagram runs three real-looking calls through your function after each run.',
      starter: '// call  = { id, name, arguments }   arguments is a JSON *string*\n// tools = { fetch_order_status: (args) => ({ ... }) }\nfunction runToolCall(call, tools) {\n  // TODO: parse call.arguments, run the tool, return its result\n  return { role: "tool", tool_call_id: call.id, name: call.name, content: "" };\n}\n\nconst tools = { fetch_order_status: ({ order_id }) => ({ order_id, status: "shipped" }) };\nconsole.log(runToolCall({ id: "call_1", name: "fetch_order_status", arguments: \'{"order_id":"4417"}\' }, tools));',
      expose: ['runToolCall'],
      size: [800, 260],
      view: s => {
        const nodes = { fn: { x: 400, y: 130, label: 'runToolCall', shape: 'pill', w: 150, kind: 'd' } }, edges = [];
        const meta = [['fetch_order_status', 'valid args'], ['delete_user', 'unknown tool'], ['fetch_order_status', 'broken JSON args']];
        const good = [D_okValid(s), D_okErr(s, 1, /\S/), D_okErr(s, 2, /\S/)];
        meta.forEach(([label, sub], i) => {
          const y = 45 + i * 85, r = D_runCase(s, i);
          nodes['c' + i] = { x: 125, y, label, sub, w: 190, kind: 'b' };
          let rl = 'not run yet', rs = 'run your code', st = 'off';
          if (r && r.threw) { rl = 'crashed'; rs = r.threw.slice(0, 28); st = 'bad'; }
          else if (r && D_isToolMsg(r)) { rl = 'role: tool'; rs = (r.msg.content || '(empty content)').slice(0, 28); st = good[i] ? 'ok' : 'warn'; }
          else if (r) { rl = 'not a tool msg'; rs = 'need role + content'; st = 'bad'; }
          nodes['r' + i] = { x: 670, y, label: rl, sub: rs, w: 220, kind: 'c', state: st };
          edges.push(['c' + i, 'fn'], ['fn', 'r' + i, { tone: st === 'ok' ? 'ok' : st === 'bad' ? 'bad' : undefined }]);
        });
        return { nodes, edges };
      },
      goals: [
        { text: 'A valid `fetch_order_status` call returns a tool message whose content has `"status":"shipped"`', check: s => D_okValid(s), solve: [D_TOOLS_V1] },
        { text: 'An unknown tool (`delete_user`) returns an error string the model can read, instead of crashing', check: s => D_okErr(s, 1, /error|unknown|not found|no such/i), solve: [D_TOOLS_V2] },
        { text: 'Broken JSON in `arguments` returns an error string too, not a crash', check: s => D_okErr(s, 2, /error|invalid|json/i), solve: [D_TOOLS_V3] }
      ],
      hints: ['Step one is `JSON.parse(call.arguments)`. Then call `tools[call.name](args)` and `JSON.stringify` the result.', 'Before calling, check `if (!tools[call.name])` and return a tool message whose content starts with `Error:` and lists the tools that do exist.', 'Wrap `JSON.parse` in `try { … } catch (e) { return { role: "tool", name: call.name, content: "Error: invalid JSON args: " + e.message }; }`.'],
      done: 'That is the heart of every tool-calling backend. The model asks; your code checks, runs and reports back.' },
    { t: 'quiz', kind: 'fill', q: 'Your backend ran the tool. What role does the result message get?',
      pre: '{ role: "', post: '", tool_call_id: "call_1", content: "{\\"status\\":\\"shipped\\"}" }', answer: ['tool'], placeholder: 'role',
      why: 'Tool results go back as `role: "tool"` messages, linked to the request by `tool_call_id`. Then the model writes its answer.' },
    { t: 'recap', points: ['You register tools as `name` + `description` + [[JSON Schema]] `parameters`.', 'The model replies with a tool call: a name plus arguments as a JSON string. It never runs anything.', 'Your backend validates and authorizes the args, like any request body, then runs the real code.', 'The result goes back as a `role: "tool"` message. Errors go back as readable strings, not crashes.'],
      cheat: [
        ['{ name, parameters }', 'Register a tool: name, description, JSON Schema'],
        ['JSON.parse(rawArgs)', 'Arguments arrive as a JSON string'],
        ['Args.safeParse(args)', 'Validate with Zod, like a request body'],
        ['{ role: "tool" }', 'Result message, with tool_call_id + content'],
        ['"Error: unknown tool"', 'Return errors as text the model can read']
      ] }
  ]
};

// ---------- Lesson 2: the agent loop ----------
const D_NO_LIMIT = 11;
const D_FAULTS = ['none', 'email API down', 'email API flaky'];
// Deterministic simulation of a support agent: lookup_order → send_email → answer.
const D_runAgent = v => {
  const cap = v.maxIter >= D_NO_LIMIT ? 40 : v.maxIter, fault = v.fault, steps = [];
  let haveOrder = false, emailDone = false, stopEmail = false, relookup = false, attempts = 0, emails = 0, tokens = 0, done = false, iters = 0;
  for (let i = 1; i <= cap; i++) {
    iters = i; tokens += 900 + 350 * (i - 1);
    if (!haveOrder || relookup) { haveOrder = true; relookup = false; steps.push({ label: 'lookup_order', sub: 'ok', st: 'ok' }); continue; }
    if (emailDone || stopEmail) { done = true; steps.push({ label: 'answer', sub: stopEmail ? 'sorry + ticket' : 'label sent', st: stopEmail ? 'warn' : 'ok' }); break; }
    attempts++;
    if (fault === 'email API down') {
      if (v.desc) { stopEmail = true; steps.push({ label: 'send_email', sub: '503, do not retry', st: 'bad' }); }
      else steps.push({ label: 'send_email', sub: '"Error"', st: 'bad' });
    } else if (fault === 'email API flaky' && attempts === 1) {
      emails++;
      if (v.desc) steps.push({ label: 'send_email', sub: 'timeout, may be sent', st: 'warn' });
      else { relookup = true; steps.push({ label: 'send_email', sub: '"Error"', st: 'bad' }); }
    } else {
      if (fault === 'email API flaky' && v.key) steps.push({ label: 'send_email', sub: 'dup key, skipped', st: 'ok' });
      else { emails++; steps.push({ label: 'send_email', sub: 'sent', st: 'ok' }); }
      emailDone = true;
    }
  }
  return { fault, desc: !!v.desc, key: !!v.key, steps, iters, tokens, emails, done, hitCap: !done };
};
const D_STEP_XY = k => { const row = Math.floor(k / 4), col = k % 4; return [row % 2 ? 640 - col * 180 : 100 + col * 180, 55 + row * 95]; };

const D_agent_loop = {
  id: 'agent-loop', title: 'The agent loop (ReAct) and its guardrails', mins: 9, needs: 'tools',
  goal: 'explain the agent loop and add the guardrails that stop runaway loops and double side effects.',
  cards: [
    { t: 'read', h: 'One tool call is not enough.',
      body: 'A customer writes: "Order 4417 arrived broken. Email me a return label." The model must look up the order, then send an email, then reply. That is three model calls, and it decides the order.\n\nAn [[agent]] is just a loop around tool calling. Call the model. If it asks for tools, run them, append the results, and call it again. If it does not, you are done. This is the [[ReAct loop]]: reason, act, repeat.',
      analogy: 'A `while` loop with an exit condition, or a job worker polling a state machine until the state is `done`. And like any worker, it needs a max-retries guard.',
      code: 'for (let i = 0; i < MAX_ITERATIONS; i++) {\n  const res = await model.chat({ messages, tools });\n  if (!res.toolCalls.length) return res.text;      // done\n  messages.push(res.message);\n  for (const call of res.toolCalls)\n    messages.push(await runToolCall(call, tools));  // role: "tool"\n}\nthrow new Error("Agent hit MAX_ITERATIONS");', lang: 'ts' },
    { t: 'viz', h: 'Watch a support agent run', body: 'The `iteration` chip counts model calls. Watch it in the second run.',
      nodes: {
        user: { x: 90, y: 190, label: 'User', shape: 'circle', w: 74, kind: 'a' },
        loop: { x: 330, y: 190, label: 'Agent loop', sub: 'your code', kind: 'd' },
        model: { x: 330, y: 60, label: 'Model', sub: 'picks next step', kind: 'b' },
        lookup: { x: 640, y: 120, label: 'lookup_order', kind: 'c' },
        email: { x: 640, y: 270, label: 'send_email', kind: 'c' }
      },
      vars: { iteration: 0, tokens: 0, 'emails sent': 0 },
      steps: [
        { cap: 'The user asks for a return label. The loop starts.', do: [['link', 'user', 'loop'], ['send', 'user', 'loop', 'order 4417 broken'], ['focus', 'user', 'loop']] },
        { cap: 'Iteration 1: the model thinks "I need the order first" and asks for `lookup_order`.', do: [['link', 'loop', 'model'], ['send', 'loop', 'model', 'messages + tools'], ['send', 'model', 'loop', 'lookup_order'], ['var', 'iteration', 1], ['var', 'tokens', '900']] },
        { cap: 'Your code runs `lookup_order` and appends the result as a `tool` message.', do: [['link', 'loop', 'lookup'], ['send', 'loop', 'lookup', 'order_id 4417'], ['send', 'lookup', 'loop', 'delivered', 'ok'], ['set', 'lookup', { state: 'ok' }]] },
        { cap: 'Iteration 2: the model reads the order and asks for `send_email`. Your code sends it.', do: [['link', 'loop', 'email'], ['send', 'loop', 'model'], ['send', 'model', 'loop', 'send_email'], ['send', 'loop', 'email', 'label'], ['set', 'email', { state: 'ok' }], ['var', 'iteration', 2], ['var', 'tokens', '2,150'], ['var', 'emails sent', 1]] },
        { cap: 'Iteration 3: no tool calls in the reply. The loop returns the answer and stops.', do: [['send', 'loop', 'model'], ['send', 'model', 'loop', 'final text', 'ok'], ['send', 'loop', 'user', 'Label sent!', 'ok'], ['set', 'user', { state: 'ok' }], ['var', 'iteration', 3], ['var', 'tokens', '3,750']] },
        { cap: 'Now replay with the email API down. It answers with one word: `"Error"`.', do: [['set', 'email', { state: 'bad', sub: 'returns "Error"' }], ['set', 'user', { state: 'warn' }], ['var', 'iteration', 2], ['var', 'emails sent', 0], ['send', 'email', 'loop', 'Error', 'bad']] },
        { cap: 'The model sees "Error" again. It has no clue what broke, so it tries the same call.', do: [['send', 'loop', 'model'], ['send', 'model', 'loop', 'send_email'], ['send', 'loop', 'email'], ['send', 'email', 'loop', 'Error', 'bad'], ['var', 'iteration', 3], ['note', 'model', 'Let me try again']] },
        { cap: 'It repeats until `max_iterations` (5) stops it: 8,000 tokens spent, no answer. With no cap, it never stops.', do: [['send', 'loop', 'email'], ['send', 'email', 'loop', 'Error', 'bad'], ['set', 'loop', { state: 'warn', sub: 'cap hit: 5/5' }], ['var', 'iteration', '5 (cap)'], ['var', 'tokens', '8,000'], ['note', 'loop', 'max_iterations hit']] }
      ],
      predict: { at: 6, q: '`send_email` returned just "Error". What does the model most likely do next?', options: ['Work out the cause and fix it', 'Ask for the same call again', 'Throw an exception in your app'], answer: 1,
        why: 'A bare "Error" gives the model nothing to reason about. It retries the same thing. Only your loop\'s cap can stop it.' } },
    { t: 'quiz', kind: 'order', q: 'Put one agent loop iteration in order.',
      items: ['Send the messages and tool list to the model', 'If the reply has no tool calls, return its text', 'Run each requested tool in your code', 'Append each result as a `role: "tool"` message', 'Go back to the top (until `max_iterations`)'],
      why: 'Call the model, check the exit condition, run tools, append results, repeat. The exit check comes before running tools, so a plain answer ends the loop.' },
    { t: 'read', h: 'Common mistake → best practice',
      body: '**Mistake 1:** returning `"Error"`. The model cannot fix what it cannot read, so it loops.\n\n**Mistake 2:** retrying a side effect. If the email went out but the reply timed out, a retry sends a second email.\n\n**Best practice:** say what failed and what to do next. Give side effects an [[idempotency key]], so a retry is [[idempotent]]. Ask the user before risky actions like refunds.',
      code: 'try {\n  await mailer.send(msg, { idempotencyKey: `return-label:${orderId}` });\n  return toolMsg(call, "Email sent");\n} catch (e) {\n  return toolMsg(call, e.status === 503\n    ? "send_email failed: email service is down (503). Do not retry. Tell the user and open a ticket."\n    : `send_email timed out after 10s. It may have been sent. Retrying with the same key is safe.`);\n}', lang: 'ts' },
    { t: 'play', kind: 'controls', h: 'Run a support agent',
      body: 'The task: look up order 4417, email a return label, reply to the user. Each step is one model call. Set the guardrails, pick a fault, then press **Run agent**.',
      size: [800, 330],
      init: () => ({ last: null }),
      controls: [
        { id: 'maxIter', type: 'range', label: 'max_iterations (11 = no limit)', min: 1, max: D_NO_LIMIT, value: 5 },
        { id: 'fault', type: 'select', label: 'Fault', options: D_FAULTS, value: 'none' },
        { id: 'desc', type: 'toggle', label: 'Descriptive errors' },
        { id: 'key', type: 'toggle', label: 'Idempotency key on send_email' },
        { id: 'run', type: 'button', label: 'Run agent', run: s => { s.last = D_runAgent(s.v); } }
      ],
      update: s => { s.last = null; },
      view: s => {
        const r = s.last;
        if (!r) return { nodes: { idle: { x: 400, y: 160, label: 'Press Run agent', shape: 'text', w: 200 } } };
        let items = r.steps.map((st, i) => Object.assign({ n: i + 1 }, st));
        if (r.hitCap) items.push({ n: 0, label: 'STOPPED', sub: 'max_iterations hit', st: 'warn' });
        if (items.length > 12) items = items.slice(0, 10).concat([{ n: 0, label: '…', sub: (items.length - 11) + ' more steps', st: 'off' }], items.slice(-1));
        const nodes = {}, edges = [];
        items.forEach((it, k) => {
          const [x, y] = D_STEP_XY(k);
          nodes['s' + k] = { x, y, w: 150, label: it.n ? '#' + it.n + ' ' + it.label : it.label, sub: it.sub, kind: it.label === 'answer' ? 'a' : it.n ? 'c' : 'n', state: it.st };
          if (k) edges.push(['s' + (k - 1), 's' + k]);
        });
        return { nodes, edges, vars: { steps: r.iters, tokens: r.tokens.toLocaleString('en-US'), 'emails sent': r.emails, result: r.done ? 'answered' : 'cut off' } };
      },
      readout: s => {
        const r = s.last;
        return [['max_iterations', s.v.maxIter >= D_NO_LIMIT ? 'no limit (runs to 40)' : s.v.maxIter], ['Steps taken', r ? r.iters : '-'], ['Tokens used', r ? r.tokens.toLocaleString('en-US') : '-'], ['Emails sent', r ? r.emails : '-']];
      },
      goals: [
        { text: 'With no fault, finish the task in **4 steps or fewer**', check: s => !!s.last && s.last.fault === 'none' && s.last.done && s.last.iters <= 4, solve: [{ fault: 'none' }, 'run'] },
        { text: 'Take the email API down with vague errors and watch the loop hit its cap', check: s => !!s.last && s.last.fault === 'email API down' && !s.last.desc && s.last.hitCap, solve: [{ fault: 'email API down', desc: false }, 'run'] },
        { text: 'Survive the **flaky** email API: finish in 4 steps or fewer with exactly **1 email** sent', check: s => !!s.last && s.last.fault === 'email API flaky' && s.last.done && s.last.iters <= 4 && s.last.emails === 1, solve: [{ fault: 'email API flaky', desc: true, key: true, maxIter: 5 }, 'run'] }
      ],
      hints: ['Leave the fault on `none` and press Run agent. Count the step boxes.', 'Pick `email API down`, keep descriptive errors off, and run. Then try the no-limit setting (11) and watch the tokens.', 'For the flaky API, turn on both descriptive errors (so the model retries straight away) and the idempotency key (so the retry does not send a second email).'],
      done: 'Cap the loop, write errors the model can act on, and make side effects safe to retry. That is most of agent reliability.' },
    { t: 'quiz', kind: 'multi', q: 'Your agent can refund orders and send emails. Which guardrails belong in production?',
      options: ['A `max_iterations` cap on the loop', 'Error messages that say what failed and what to do', 'Idempotency keys on refunds and emails', 'Ask the user to confirm refunds before running them', 'No cap, so the model never gives up', 'Hide error details so the model stays on track'], answer: [0, 1, 2, 3],
      why: 'Cap the loop, explain errors, make side effects safe to retry, and confirm risky actions.',
      whyNot: { 4: 'With no cap, a tool that keeps failing burns tokens forever. Every loop needs an exit.', 5: 'Hidden errors are exactly what make the model retry blindly. Clear errors let it self-correct or stop.' } },
    { t: 'recap', points: ['An [[agent]] is a loop: call the model, run the tools it asks for, append results, repeat.', 'The loop ends when a reply has no tool calls, or when it hits `max_iterations`.', 'Vague errors cause blind retries. Say what failed and what to do next.', 'Side effects need an [[idempotency key]], and risky actions need a human "yes".'],
      cheat: [
        ['i < MAX_ITERATIONS', 'Hard cap on the loop, e.g. 5'],
        ['if (!calls.length)', 'No tool calls? Return the answer'],
        ['"503. Do not retry."', 'An error the model can act on'],
        ['Idempotency-Key', 'Header so a retry does not send twice'],
        ['confirmWithUser(args)', 'Ask before risky actions like refunds']
      ] }
  ]
};

// ---------- Lesson 3: MCP + tracing ----------
const D_SERVERS = {
  github: { via: 'HTTP', tools: [['search_issues', 'Search issues by text and state'], ['get_pull_request', 'Read one pull request'], ['create_issue', 'Open a new issue']] },
  postgres: { via: 'stdio', tools: [['query', 'Run a read-only SQL query'], ['list_tables', 'List tables and columns']] },
  slack: { via: 'HTTP', tools: [['post_message', 'Post a message to a channel'], ['search_messages', 'Search messages']] }
};
const D_TRACES = {
  tr_7f2a: { name: 'Where is order 4417?', spans: [
    ['llm.plan', 820, 2300, 'model picked postgres.query'],
    ['postgres.query', 3400, 0, 'SELECT * FROM orders WHERE email = $1\nSeq Scan on orders (2.1M rows). Add an index on orders(email).'],
    ['llm.answer', 690, 3800, 'final reply, 140 output tokens']] },
  tr_9c41: { name: 'Summarise open bugs', spans: [
    ['llm.plan', 900, 1900, 'model picked github.search_issues'],
    ['github.search_issues', 2600, 0, 'returned 400 issues with full bodies'],
    ['llm.answer', 2100, 48200, 'input 47,600 tokens: all 400 issues pasted in full\nFix: filter to open + top 20, or summarise each first.']] },
  tr_1b3e: { name: 'Refund order 4417', spans: [
    ['llm.plan', 760, 2100, 'model picked refund_order'],
    ['tool.refund_order', 410, 0, 'idempotency key refund:4417'],
    ['llm.answer', 650, 2600, 'final reply']] }
};
const D_cost = tok => '$' + (tok * 3 / 1e6).toFixed(3);
const D_total = t => t.spans.reduce((a, sp) => [a[0] + sp[1], a[1] + sp[2]], [0, 0]);
const D_pad = (x, n) => String(x).padEnd(n);

const D_mcp_obs = {
  id: 'mcp-obs', title: 'MCP and tracing: plug in tools, see every step', mins: 8, needs: 'agent-loop',
  goal: 'connect tools through MCP servers and read a trace to find the slowest and the most expensive step.',
  cards: [
    { t: 'read', h: 'Three services, three piles of glue code.',
      body: 'Your agent works. Now the team wants it to read GitHub, query Postgres and post to Slack. By hand, that is three sets of schemas, auth and wrappers. Then the next AI app needs them all again.\n\n[[MCP]] (Model Context Protocol) is a standard plug. An MCP **server** exposes tools. Any MCP **client** connects over stdio (a local process) or HTTP. It asks `tools/list`, then `tools/call`. It speaks [[JSON-RPC]].',
      analogy: 'The Language Server Protocol (LSP). One TypeScript language server works in VS Code, Vim and every other editor. One Postgres MCP server works in every AI app.',
      code: '→ {"jsonrpc":"2.0","id":1,"method":"tools/list"}\n← {"jsonrpc":"2.0","id":1,"result":{"tools":[{\n     "name":"query",\n     "description":"Run a read-only SQL query",\n     "inputSchema":{"type":"object","properties":{"sql":{"type":"string"}}}\n   }]}}', lang: 'json' },
    { t: 'viz', h: 'Plug in servers, then trace the run', body: 'First the MCP plumbing. Then the [[trace]] of one run, drawn as a waterfall.',
      nodes: {
        client: { x: 90, y: 190, label: 'Your agent', sub: 'MCP client', kind: 'a' },
        gh: { x: 300, y: 65, label: 'GitHub', sub: 'MCP server', kind: 'c' },
        pg: { x: 300, y: 190, label: 'Postgres', sub: 'MCP server', kind: 'c' },
        sl: { x: 300, y: 315, label: 'Slack', sub: 'MCP server', kind: 'c' }
      },
      steps: [
        { cap: 'Your agent is an [[MCP]] client. It connects to three ready-made servers: two over HTTP, one over stdio.', do: [['link', 'client', 'gh', 'HTTP'], ['link', 'client', 'pg', 'stdio'], ['link', 'client', 'sl', 'HTTP'], ['set', 'client', { state: 'active' }]] },
        { cap: 'The client asks each server `tools/list`. Same call for every server. No custom glue.', do: [['send', 'client', 'gh', 'tools/list'], ['send', 'client', 'pg', 'tools/list'], ['send', 'client', 'sl', 'tools/list']] },
        { cap: 'Each server answers with tool names and [[JSON Schema]] inputs. The agent now has 7 tools.', do: [['send', 'gh', 'client', '3 tools', 'ok'], ['send', 'pg', 'client', '2 tools', 'ok'], ['send', 'sl', 'client', '2 tools', 'ok'], ['set', 'gh', { sub: 'search_issues +2' }], ['set', 'pg', { sub: 'query +1' }], ['set', 'sl', { sub: 'post_message +1' }], ['var', 'tools', 7]] },
        { cap: 'The model asks for `query`. The client sends `tools/call` to Postgres, which runs the SQL.', do: [['send', 'client', 'pg', 'tools/call query'], ['set', 'pg', { state: 'active' }], ['focus', 'client', 'pg']] },
        { cap: 'Rows come back. To the model, this is just another `role: "tool"` result.', do: [['send', 'pg', 'client', 'rows', 'ok'], ['set', 'pg', { state: 'ok' }]] },
        { cap: 'The whole run is one [[trace]]. Its root [[span]], `agent.run`, took 2.4 s.', do: [['add', 'title', { x: 620, y: 22, label: 'trace tr_7f2a', shape: 'text', w: 150 }], ['add', 'root', { x: 620, y: 75, w: 320, h: 40, label: 'agent.run 2.4s', kind: 'n' }]] },
        { cap: 'Each model call and tool call is a child span with its own time, tokens and cost.', do: [['add', 'llm1', { x: 507, y: 145, w: 93, h: 40, label: 'llm 0.7s', kind: 'b' }], ['add', 'sql', { x: 627, y: 215, w: 147, h: 40, label: 'query 1.1s', kind: 'c' }], ['add', 'llm2', { x: 740, y: 285, w: 80, h: 40, label: 'llm 0.6s', kind: 'b' }], ['var', 'tokens', '6,100'], ['var', 'cost', '$0.018']] },
        { cap: 'The `query` span is almost half the run: a full table scan. Add an index there first.', do: [['set', 'sql', { state: 'bad' }], ['note', 'sql', 'Seq Scan on orders'], ['focus', 'root', 'sql']] }
      ],
      predict: { at: 7, q: 'Users say replies feel slow. Which span do you fix first?', options: ['llm 0.7s', 'query 1.1s', 'llm 0.6s'], answer: 1,
        why: 'The widest bar is where the time goes. Here it is the SQL query, not the model. Without a trace you would probably blame the model.' } },
    { t: 'quiz', q: 'Your agent\'s bill jumped 10× overnight. Latency looks normal. Where in the trace do you look first?',
      options: ['The span with the most tokens', 'The slowest span', 'The list of connected MCP servers', 'The root span\'s start time'], answer: 0,
      why: 'You pay per [[token]]. Sort spans by tokens or cost. A huge one usually means too much text was pasted into the [[context window]].',
      whyNot: { 1: 'Slow is not the same as expensive. A slow SQL query costs no tokens at all.', 2: 'Connecting servers is free. The cost comes from model calls.', 3: 'Start time tells you when, not what cost money.' } },
    { t: 'read', h: 'Common mistake → best practice',
      body: '**Mistake:** flying blind. Your logs say "agent answered in 14 s" and nothing else. You cannot tell which step was slow or why the bill tripled.\n\n**Best practice:** wrap every model call and tool call in a [[span]] with [[OpenTelemetry]]. Record tokens and cost as attributes. Send spans to Langfuse, Arize Phoenix or LangSmith, just like an APM. Also: only connect MCP servers you trust, with least-privilege credentials.',
      code: 'import { trace } from "@opentelemetry/api";\nconst tracer = trace.getTracer("support-agent");\n\nawait tracer.startActiveSpan("tool.postgres.query", async span => {\n  span.setAttribute("db.statement", sql);\n  try { return await mcp.callTool({ name: "query", arguments: { sql } }); }\n  finally { span.end(); }\n});', lang: 'ts' },
    { t: 'play', kind: 'terminal', h: 'Plug in a server, then read the traces',
      body: 'A pretend MCP client with three servers and a trace store. Connect Postgres, then use the traces to find the slow step and the costly step.',
      size: [800, 330],
      init: () => ({ connected: {}, listed: {}, calls: 0, shown: null, inspected: null }),
      prompt: 'agent $',
      cmds: [
        { re: /^mcp\s+(list|ls|servers)$/i, help: 'mcp list', desc: 'show available MCP servers', run: (m, s) => 'SERVER     TRANSPORT  STATUS\n' + Object.keys(D_SERVERS).map(k => D_pad(k, 11) + D_pad(D_SERVERS[k].via, 11) + (s.connected[k] ? 'connected' : 'available')).join('\n') },
        { re: /^mcp\s+connect\s+(\w+)$/i, help: 'mcp connect <server>', desc: 'start and connect to a server', run(m, s, io) {
          const k = m[1].toLowerCase(), sv = D_SERVERS[k];
          if (!sv) return { err: 'unknown server "' + k + '". Try: ' + Object.keys(D_SERVERS).join(', ') };
          s.connected[k] = true; io.send('client', k, 'initialize');
          io.send(k, 'client', 'ok', 'ok');
          return 'connected to ' + k + ' over ' + sv.via + ' · protocol handshake ok\nnext: mcp tools ' + k;
        } },
        { re: /^mcp\s+tools\s+(\w+)$/i, help: 'mcp tools <server>', desc: 'list a server\'s tools (tools/list)', run(m, s, io) {
          const k = m[1].toLowerCase(), sv = D_SERVERS[k];
          if (!sv) return { err: 'unknown server "' + k + '"' };
          if (!s.connected[k]) return { err: 'not connected. Run: mcp connect ' + k };
          s.listed[k] = true; io.send('client', k, 'tools/list'); io.send(k, 'client', sv.tools.length + ' tools', 'ok');
          return sv.tools.map(t => D_pad(t[0], 18) + t[1]).join('\n');
        } },
        { re: /^mcp\s+call\s+(\w+)\s+(\w+)(?:\s+(.*))?$/i, help: 'mcp call <server> <tool> key="value"', desc: 'call a tool (tools/call)', run(m, s, io) {
          const k = m[1].toLowerCase(), sv = D_SERVERS[k], tool = m[2], arg = m[3] || '';
          if (!sv) return { err: 'unknown server "' + k + '"' };
          if (!s.connected[k]) return { err: 'not connected. Run: mcp connect ' + k };
          if (!sv.tools.some(t => t[0] === tool)) return { err: 'error: unknown tool "' + tool + '". Available: ' + sv.tools.map(t => t[0]).join(', ') };
          io.send('client', k, 'tools/call');
          if (k === 'postgres' && /\b(delete|drop|update|insert|alter|truncate)\b/i.test(arg)) { io.send(k, 'client', 'denied', 'bad'); return { err: 'ERROR: permission denied. This server uses a read-only role.' }; }
          s.calls++; io.send(k, 'client', 'result', 'ok');
          if (k === 'postgres' && tool === 'query') return /4417/.test(arg) ? ' id   | status  | eta\n 4417 | shipped | 2026-11-02\n(1 row) · 41 ms' : '(0 rows) · 12 ms';
          if (k === 'postgres') return 'orders(id, email, status, eta)\ncustomers(id, email, name)';
          return '{"ok": true, "tool": "' + tool + '"} · 230 ms';
        } },
        { re: /^trace\s+(ls|list)$/i, help: 'trace ls', desc: 'list recent traces', run: () => 'ID        REQUEST                   MS     TOKENS  COST\n' + Object.keys(D_TRACES).map(id => { const t = D_TRACES[id], [ms, tok] = D_total(t); return D_pad(id, 10) + D_pad(t.name, 26) + D_pad(ms, 7) + D_pad(tok.toLocaleString('en-US'), 8) + D_cost(tok); }).join('\n') },
        { re: /^trace\s+show\s+(\w+)$/i, help: 'trace show <id>', desc: 'show a trace as a span table', run(m, s) {
          const id = m[1].toLowerCase(), t = D_TRACES[id];
          if (!t) return { err: 'no trace "' + id + '". Run: trace ls' };
          s.shown = id;
          const [ms, tok] = D_total(t);
          return id + ' · "' + t.name + '"\nSPAN                   MS     TOKENS  COST\n' + t.spans.map(sp => D_pad(sp[0], 23) + D_pad(sp[1], 7) + D_pad(sp[2].toLocaleString('en-US'), 8) + D_cost(sp[2])).join('\n') + '\n' + D_pad('total', 23) + D_pad(ms, 7) + D_pad(tok.toLocaleString('en-US'), 8) + D_cost(tok) + '\nnext: span inspect <span>';
        } },
        { re: /^span\s+inspect\s+([\w.]+)$/i, help: 'span inspect <span>', desc: 'details of one span in the open trace', run(m, s) {
          if (!s.shown) return { err: 'open a trace first: trace show <id>' };
          const t = D_TRACES[s.shown], sp = t.spans.find(x => x[0].toLowerCase() === m[1].toLowerCase());
          if (!sp) return { err: 'no span "' + m[1] + '" in ' + s.shown + '. Spans: ' + t.spans.map(x => x[0]).join(', ') };
          s.inspected = { trace: s.shown, span: sp[0] };
          return sp[0] + ' (' + s.shown + ')\nduration  ' + sp[1] + ' ms\ntokens    ' + sp[2].toLocaleString('en-US') + '\ncost      ' + D_cost(sp[2]) + '\n' + sp[3];
        } }
      ],
      try: ['mcp list', 'mcp connect postgres', 'trace ls'],
      view: s => {
        const nodes = { client: { x: 90, y: 165, label: 'Agent', sub: 'MCP client', kind: 'a', state: Object.keys(s.connected).length ? 'active' : undefined } }, edges = [];
        Object.keys(D_SERVERS).forEach((k, i) => {
          const c = !!s.connected[k];
          nodes[k] = { x: 330, y: 55 + i * 110, label: k, sub: s.listed[k] ? D_SERVERS[k].tools.length + ' tools listed' : c ? 'connected' : 'not connected', kind: 'c', w: 140, state: c ? 'ok' : 'off' };
          if (c) edges.push(['client', k, D_SERVERS[k].via]);
        });
        const sp = s.inspected && s.inspected.trace === s.shown ? s.inspected.span : null;
        nodes.traces = { x: 640, y: 165, shape: 'db', w: 150, label: 'Trace store', sub: s.shown ? 'open: ' + s.shown : 'no trace open', kind: 'b', state: s.shown ? 'active' : undefined };
        edges.push(['client', 'traces', { dash: true, label: 'spans' }]);
        const out = { nodes, edges, vars: { servers: Object.keys(s.connected).length, 'tool calls': s.calls, inspected: sp || '-' } };
        if (sp) out.notes = [['traces', sp]];
        return out;
      },
      goals: [
        { text: 'Connect the **postgres** server and list its tools', check: s => !!s.listed.postgres, solve: ['mcp connect postgres', 'mcp tools postgres'] },
        { text: 'Users say "Where is order 4417?" is slow. Open trace `tr_7f2a` and `span inspect` its **slowest** span', check: s => !!s.inspected && s.inspected.trace === 'tr_7f2a' && s.inspected.span === 'postgres.query', solve: ['trace show tr_7f2a', 'span inspect postgres.query'] },
        { text: 'Trace `tr_9c41` costs far more than the others. `span inspect` its **most expensive** span', check: s => !!s.inspected && s.inspected.trace === 'tr_9c41' && s.inspected.span === 'llm.answer', solve: ['trace show tr_9c41', 'span inspect llm.answer'] }
      ],
      hints: ['Start with `mcp list`, then `mcp connect postgres`, then `mcp tools postgres`.', 'Run `trace show tr_7f2a` and compare the MS column. Then `span inspect` the biggest one.', 'Run `trace show tr_9c41` and compare the COST column. The winner is a model call with a huge input: `span inspect llm.answer`.'],
      done: 'Slow and expensive are different questions, and a trace answers both in seconds.' },
    { t: 'quiz', kind: 'multi', q: 'Which statements about MCP are true?',
      options: ['One Postgres MCP server works with any MCP client', 'Servers can run locally over stdio or remotely over HTTP', 'The model connects to the server and runs SQL by itself', 'Clients discover tools at runtime with `tools/list`', 'Any MCP server is safe to connect without review'], answer: [0, 1, 3],
      why: 'MCP is a shared protocol: servers expose tools, clients discover them with `tools/list` and call them with `tools/call`, over stdio or HTTP.',
      whyNot: { 2: 'Same rule as before: the model only asks. Your MCP client sends the `tools/call`.', 4: 'A server runs code with your credentials. Review it, and give it least-privilege access, like a read-only database role.' } },
    { t: 'recap', points: ['[[MCP]] servers expose tools. Any MCP client can list and call them, so you skip custom glue per service.', 'Transport is stdio for local servers and HTTP for remote ones. The messages are [[JSON-RPC]].', 'A [[trace]] has one [[span]] per model call and tool call, with time, tokens and cost.', 'Sort spans by duration to fix slowness. Sort by tokens to fix the bill.'],
      cheat: [
        ['"method":"tools/list"', 'Ask an MCP server which tools it has'],
        ['"method":"tools/call"', 'Call one tool (params: name, arguments)'],
        ['{ name, inputSchema }', 'What tools/list returns'],
        ['startActiveSpan(name)', 'One OpenTelemetry span per call'],
        ['setAttribute(k, v)', 'Record tokens, cost or SQL on a span']
      ] }
  ]
};

;
// Module 4: Production: tests, cost and choices. Every top-level name starts with E_.
const E_GLOSS = {
  'context recall': 'An eval score: did retrieval fetch every chunk needed to answer? 1.0 means nothing important was missing.',
  'answer relevance': 'An eval score: does the answer actually address the question that was asked, instead of drifting off topic?',
  'CI gate': 'A required check on a pull request. If it fails, the change cannot merge or deploy.',
  'cache hit': 'The thing you asked for was already stored, so it is served cheaply and fast instead of being computed again.',
  'quantization': 'Storing model weights with fewer bits (for example 4-bit) so the model needs less memory, with a small quality cost.'
};

/* ---------- Lesson 1: evals ---------- */
const E_PROMPTS = ['v1 baseline', 'v2 be more concise', 'v3 be creative (temp 1.0)'];
// Scores in hundredths so comparisons are exact. Deterministic: same config, same scores.
function E_evalScores(v) {
  const i = E_PROMPTS.indexOf(v.prompt), rr = v.reranker ? 1 : 0;
  const faith = [88, 86, 78][i] + rr * 5, rel = [90, 87, 84][i] + rr * 3;
  const recall = rr ? 91 : 82, fmt = [50, 49, 46][i], thr = Math.round(v.threshold * 100);
  return { faith, rel, recall, fmt, thr, pass: faith >= thr, prompt: v.prompt };
}
const E_f2 = n => (n / 100).toFixed(2);

const E_evals = {
  id: 'evals', title: 'Evals: unit tests for AI', mins: 8,
  goal: 'score an AI feature on a golden dataset and block a bad prompt change in CI.',
  cards: [
    { t: 'read', h: 'You changed one line. Is it better?',
      body: 'You edit the [[system prompt]] to fix one bad answer. It looks great in your three manual tries. You ship it.\n\nA week later, support says refund answers are making things up. Your one-line change broke 40 other questions. Nobody noticed, because nothing checked.\n\nIn normal code, tests catch this. AI features need tests too. They are called [[eval|evals]].',
      analogy: 'Evals are your test suite. The [[golden dataset]] is the fixtures. Graders are assertions that return a score. The [[CI gate]] is the required check on the pull request.',
      points: ['Outputs change wording run to run, so you **score** them instead of `assertEqual`.', 'Run the suite on every prompt, model or code change.'] },
    { t: 'viz', h: 'Watch an eval suite guard a deploy', body: 'Step through one CI run. Then a teammate changes the prompt.',
      nodes: {
        gold: { x: 80, y: 190, label: 'Golden set', sub: '50 Q&A', shape: 'db', w: 110, kind: 'd' },
        app: { x: 270, y: 190, label: 'Your RAG app', sub: 'prompt v1', w: 150, kind: 'a' },
        code: { x: 500, y: 90, label: 'Code checks', sub: 'JSON · cites · length', w: 160, kind: 'c' },
        judge: { x: 500, y: 290, label: 'LLM judge', sub: 'strict rubric', w: 160, kind: 'b' },
        ci: { x: 700, y: 190, label: 'CI gate', sub: 'faith ≥ 0.90', w: 140, kind: 'n' }
      },
      steps: [
        { cap: 'A [[golden dataset]] holds 50 real questions with checked answers. It is your test fixture.', do: [['focus', 'gold'], ['set', 'gold', { state: 'active' }]] },
        { cap: 'Each question runs through your real app: retrieval, prompt and model. Same code as production.', do: [['link', 'gold', 'app'], ['send', 'gold', 'app', '50 questions'], ['set', 'app', { state: 'active' }]] },
        { cap: 'Code checks score what code can verify: valid JSON, a cited source, under 300 words.', do: [['link', 'app', 'code'], ['send', 'app', 'code', 'answers'], ['set', 'code', { state: 'ok' }], ['var', 'format', '50/50']] },
        { cap: 'An [[LLM-as-a-judge]] grades meaning with a strict rubric: is every claim backed by the context?', do: [['link', 'app', 'judge'], ['send', 'app', 'judge', 'answers'], ['set', 'judge', { state: 'ok', sub: 'faithfulness 0.94' }], ['var', 'faithfulness', '0.94']] },
        { cap: 'Scores reach the CI gate. Rule: fail if [[faithfulness]] is below 0.90. 0.94 passes, so the PR can merge.', do: [['link', 'code', 'ci'], ['link', 'judge', 'ci'], ['send', 'judge', 'ci', '0.94', 'ok'], ['set', 'ci', { state: 'ok', sub: 'PASS 0.94' }]] },
        { cap: 'A teammate opens a PR: prompt v3, "be creative", temperature 1.0. CI re-runs all 50 questions.', do: [['set', 'app', { sub: 'prompt v3', state: 'warn' }], ['set', 'ci', { state: 'off', sub: 'running…' }], ['send', 'gold', 'app', '50 questions']] },
        { cap: 'JSON is still valid, but the judge finds invented claims. Faithfulness 0.81 < 0.90: build fails. [[regression|Regression]] caught.', do: [['send', 'app', 'judge', 'answers'], ['set', 'judge', { state: 'bad', sub: 'faithfulness 0.81' }], ['var', 'faithfulness', '0.81'], ['set', 'ci', { state: 'bad', sub: 'FAIL 0.81' }], ['send', 'judge', 'ci', '0.81', 'bad']] },
        { cap: 'The teammate reverts the temperature and keeps the useful wording. Green again, before any user saw the bad version.', do: [['set', 'app', { sub: 'prompt v3.1', state: 'ok' }], ['set', 'judge', { state: 'ok', sub: 'faithfulness 0.93' }], ['set', 'ci', { state: 'ok', sub: 'PASS 0.93' }], ['var', 'faithfulness', '0.93']] }
      ],
      predict: { at: 6, q: 'Prompt v3 still returns valid JSON with citations. Will CI pass?', options: ['No: the judge catches invented claims and faithfulness drops below 0.90', 'Yes: every code check still passes', 'Yes: creative answers always score higher'], answer: 0, why: 'Code checks only see the shape. The judge reads meaning. High temperature makes the model add claims the context does not support.' } },
    { t: 'quiz', kind: 'multi', q: 'Which of these can a plain code check verify, with no judge model?',
      options: ['The output is valid JSON that matches the schema', 'The answer cites at least one source id', 'The answer is under 300 words', 'Every claim is supported by the retrieved context', 'The answer actually addresses the user\'s question'],
      answer: [0, 1, 2],
      why: 'Shape, citations and length are deterministic: `JSON.parse`, a regex, a word count. Meaning needs a judge.',
      whyNot: { 3: 'That is [[faithfulness]]. Checking it means reading and comparing meaning, so it needs an [[LLM-as-a-judge]].', 4: 'That is [[answer relevance]]. "Does this answer the question?" is a judgement about meaning, not a string check.' } },
    { t: 'play', kind: 'controls', h: 'Run the eval suite in CI',
      body: 'Pick a prompt version, toggle the [[reranker]] and set the gate threshold. Then run 50 golden questions. Changing a setting clears the old result, like a new commit.',
      init: () => ({ result: null, runs: 0 }),
      controls: [
        { id: 'prompt', type: 'select', label: 'Prompt version', options: E_PROMPTS },
        { id: 'reranker', type: 'toggle', label: 'Reranker on' },
        { id: 'threshold', type: 'range', label: 'Fail if faithfulness <', min: 0.8, max: 0.95, step: 0.01, value: 0.85 },
        { id: 'run', type: 'button', label: 'Run eval suite (50 golden questions)', run: (s, io) => {
          s.result = E_evalScores(s.v); s.runs++;
          io.send('gold', 'app', '50 Qs'); io.send('app', 'code', 'answers'); io.send('app', 'judge', 'answers');
          io.send('judge', 'ci', E_f2(s.result.faith), s.result.pass ? 'ok' : 'bad');
          io.note('ci', s.result.pass ? 'PASS: merge allowed' : 'FAIL: ' + E_f2(s.result.faith) + ' < ' + E_f2(s.result.thr));
        } }
      ],
      update: s => { s.result = null; },
      view: s => {
        const r = s.result, v = s.v;
        const nodes = {
          gold: { x: 80, y: 190, label: 'Golden set', sub: '50 Q&A', shape: 'db', w: 110, kind: 'd' },
          app: { x: 270, y: 190, label: 'Your RAG app', sub: v.prompt.slice(0, 2) + ' · reranker ' + (v.reranker ? 'on' : 'off'), w: 150, kind: 'a', state: r ? 'ok' : undefined },
          code: { x: 500, y: 90, label: 'Code checks', sub: r ? 'valid JSON ' + r.fmt + '/50' : 'JSON · cites · length', w: 160, kind: 'c', state: r ? (r.fmt === 50 ? 'ok' : 'warn') : 'off' },
          judge: { x: 500, y: 290, label: 'LLM judge', sub: r ? 'faithfulness ' + E_f2(r.faith) : 'strict rubric', w: 160, kind: 'b', state: r ? (r.pass ? 'ok' : 'bad') : 'off' },
          ci: { x: 700, y: 190, label: 'CI gate', sub: r ? (r.pass ? 'PASS ' : 'FAIL ') + E_f2(r.faith) : 'not run', w: 140, kind: 'n', state: r ? (r.pass ? 'ok' : 'bad') : 'off' }
        };
        const edges = [['gold', 'app'], ['app', 'code'], ['app', 'judge'], ['code', 'ci'], ['judge', 'ci', { tone: r ? (r.pass ? 'ok' : 'bad') : undefined }]];
        return { nodes, edges, vars: r ? { faithfulness: E_f2(r.faith), 'context recall': E_f2(r.recall), relevance: E_f2(r.rel), gate: '≥ ' + E_f2(r.thr) } : { gate: '≥ ' + v.threshold.toFixed(2) } };
      },
      readout: s => {
        const r = s.result;
        if (!r) return [['CI result', 'not run yet'], ['Gate', 'faithfulness ≥ ' + s.v.threshold.toFixed(2)]];
        return [['Faithfulness', E_f2(r.faith)], ['Context recall', E_f2(r.recall)], ['Answer relevance', E_f2(r.rel)], ['Code checks', r.fmt + '/50 valid JSON'], ['CI result', r.pass ? 'PASS' : 'FAIL (build blocked)']];
      },
      goals: [
        { text: 'Run the suite on the defaults and get a **passing** baseline', check: s => !!s.result && s.result.pass, solve: ['run'] },
        { text: 'Run prompt **v3** and watch CI **block** the regression', check: s => !!s.result && s.result.prompt === E_PROMPTS[2] && !s.result.pass, solve: [{ prompt: E_PROMPTS[2] }, 'run'] },
        { text: 'Find a config that **passes** with the gate at **0.90** or stricter', check: s => !!s.result && s.result.pass && s.result.thr >= 90, solve: [{ prompt: E_PROMPTS[0], reranker: true, threshold: 0.9 }, 'run'] }
      ],
      hints: ['Press Run first with the defaults. v1 at a 0.85 gate should pass.', 'Choose v3, then Run. High temperature makes the model invent details.', 'Better context means fewer invented claims. Turn the reranker on, use v1 or v2, set 0.90, then Run.'],
      done: 'That is a real eval loop: fixed dataset, scored graders, a hard gate. Bad prompts now fail in CI, not in production.' },
    { t: 'quiz', q: 'Why do evals use scores and thresholds instead of `expect(answer).toBe("...")`?',
      options: ['The same question gets different valid wordings each run, so you grade meaning, not exact text', 'Scores are faster to compute than a string compare', 'Test runners cannot call a model API', 'Thresholds let you skip the questions that fail'],
      answer: 0,
      why: 'Model output is non-deterministic. Two answers can both be right with different words, so you score them and gate on an average.',
      whyNot: { 1: 'Speed is not the reason. A judge call is much slower than a string compare.', 2: 'Test runners can call any HTTP API. Jest or pytest can run an eval fine.', 3: 'Nothing is skipped. Every question is scored, and the average must clear the bar.' } },
    { t: 'read', h: 'Common mistake: the "vibe check"',
      body: '**Mistake:** you try three questions in a playground, they look fine, you ship. Then a model upgrade quietly breaks 20% of answers.\n\n**Best practice:** a script that scores the golden set and exits non-zero below the bar. CI runs it on every pull request. Libraries like Ragas or DeepEval give you ready-made graders. A 30-line script works too.',
      code: 'scores = [judge(q, app(q["question"])) for q in golden]  # 50 questions\nfaith = sum(s["faithfulness"] for s in scores) / len(scores)\nprint(f"faithfulness={faith:.2f}")\nsys.exit(0 if faith >= 0.90 else 1)  # exit 1 fails the CI job',
      lang: 'python' },
    { t: 'recap', points: ['Evals are unit tests for AI: a [[golden dataset]], graders that score, and a CI gate.', 'Code checks verify shape: JSON, citations, length. An [[LLM-as-a-judge]] grades meaning.', 'Track [[faithfulness]], [[context recall]] and [[answer relevance]].', 'Run on every prompt, model or code change, and fail the build below the bar.'],
      cheat: [['python evals/run.py --min-faithfulness 0.90', 'Score the golden set; exit 1 fails CI'], ['on: pull_request', 'GitHub Actions trigger: evals run before merge'], ['json.loads(out); "[source:" in out', 'Code checks: valid JSON, cites a source'], ['"Score 0-1: is every claim supported by CONTEXT?"', 'Judge rubric for faithfulness'], ['pip install ragas deepeval', 'Ready-made eval libraries']] }
  ]
};

/* ---------- Lesson 2: cost, latency and caching ---------- */
// Example prices in $ per 1M tokens, plus a simple TTFT model (ms per uncached input token).
const E_PRICE = { large: { in: 3, cached: 0.3, out: 15, base: 0.25, ms: 0.12 }, small: { in: 0.25, cached: 0.025, out: 1.25, base: 0.15, ms: 0.05 } };
const E_REQ = 10000, E_DYN = 300, E_BUDGET = 20;
function E_cost(v) {
  const p = E_PRICE[v.model], hit = !!v.cache && v.order === 'static first';
  const cachedTok = hit ? v.stat : 0, freshTok = v.stat + E_DYN - cachedTok;
  const inCost = (freshTok * p.in + cachedTok * p.cached) * E_REQ / 1e6;
  const outCost = v.out * p.out * E_REQ / 1e6;
  const ttft = p.base + (freshTok * p.ms + cachedTok * p.ms / 10) / 1000;
  return { hit, cachedTok, freshTok, inCost, outCost, total: inCost + outCost, ttft };
}
const E_usd = n => '$' + (n < 100 ? n.toFixed(2) : Math.round(n).toLocaleString('en-US'));

const E_cost_cache = {
  id: 'cost-cache', title: 'Cost, latency and prompt caching', mins: 8, needs: 'evals',
  goal: 'estimate an AI feature\'s daily cost and cut it with prompt caching, prompt order and model routing.',
  cards: [
    { t: 'read', h: 'The demo cost $3. Production costs $324 a day.',
      body: 'Your demo ran 100 times. Then 10,000 requests a day arrive and the bill jumps. Before you panic, look at what you send.\n\nEach request repeats the same 8,000 [[token|tokens]]: system prompt, docs, tool schemas. Only 300 tokens change. You pay full price for the same bytes, 10,000 times a day.\n\nCost = input tokens × input price + output tokens × output price. Output tokens usually cost about 5× more.',
      analogy: '[[prompt caching|Prompt caching]] is like a CDN for the start of your prompt. Same bytes, same cache key, fast and cheap. Change one byte at the top and it is a new key: a miss.',
      points: ['Example prices: $3 per 1M input tokens, $15 per 1M output, cached input $0.30.', 'Caching also cuts [[TTFT]]: the model skips re-reading the prefix.'] },
    { t: 'viz', h: 'Three requests, one cache', body: 'Example prices on a large model. Watch the input cost and [[TTFT]] per request.',
      nodes: {
        req: { x: 90, y: 190, label: 'Request 1', kind: 'a' },
        pre: { x: 330, y: 130, label: 'Static prefix', sub: '8,000 tok · same', w: 160, kind: 'c' },
        q: { x: 330, y: 250, label: 'User question', sub: '300 tok · new', w: 160, kind: 'e' },
        model: { x: 640, y: 300, label: 'Large model', w: 150, kind: 'b' },
        cache: { x: 640, y: 80, label: 'Prefix cache', sub: 'empty', shape: 'db', w: 130, kind: 'd', state: 'off' }
      },
      edges: [['req', 'pre'], ['pre', 'q', 'then'], ['q', 'model']],
      steps: [
        { cap: 'Request 1: an 8,000-token static prefix (system prompt, docs, tools), then a 300-token question.', do: [['focus', 'req', 'pre', 'q'], ['set', 'req', { state: 'active' }]] },
        { cap: 'The provider looks up this exact prefix in its cache. Nothing stored yet: cache miss.', do: [['link', 'pre', 'cache', { dash: true }], ['send', 'pre', 'cache', 'lookup'], ['set', 'cache', { state: 'bad', sub: 'MISS' }]] },
        { cap: 'The model reads all 8,300 tokens at full price. Input $0.025, TTFT 1.25 s. The prefix is now cached.', do: [['send', 'q', 'model', '8,300 tok'], ['set', 'model', { sub: 'TTFT 1.25 s' }], ['set', 'cache', { state: 'ok', sub: 'stored 8,000' }], ['var', 'input cost', '$0.025']] },
        { cap: 'Request 2 arrives: a different question, but the same 8,000-token prefix, byte for byte.', do: [['set', 'req', { label: 'Request 2' }], ['set', 'q', { sub: '300 tok · new' }], ['send', 'pre', 'cache', 'lookup']] },
        { cap: '[[cache hit|Cache hit]]! Only the 300 new tokens pay full price. Input drops to $0.003 and TTFT to 0.38 s.', do: [['link', 'cache', 'model', { tone: 'ok' }], ['send', 'cache', 'model', 'HIT', 'ok'], ['set', 'model', { sub: 'TTFT 0.38 s', state: 'ok' }], ['var', 'input cost', '$0.003']] },
        { cap: 'Request 3: someone adds `Time: 10:42:07` at the very top of the prompt.', do: [['set', 'req', { label: 'Request 3' }], ['move', 'pre', 330, 190], ['move', 'q', 330, 300], ['add', 'ts', { x: 330, y: 80, label: 'Timestamp', sub: 'changes every call', w: 160, kind: 'e' }], ['link', 'req', 'ts']] },
        { cap: 'The first bytes now change every second, so no prefix matches. Miss, full price, every single request.', do: [['send', 'ts', 'cache', 'lookup'], ['set', 'cache', { state: 'bad', sub: 'MISS' }], ['set', 'model', { sub: 'TTFT 1.25 s', state: 'bad' }], ['var', 'input cost', '$0.025']] },
        { cap: 'Fix: static first, dynamic last. Move the timestamp next to the question and the hits come back.', do: [['rm', 'ts'], ['set', 'q', { sub: 'question + time' }], ['set', 'cache', { state: 'ok', sub: 'HIT' }], ['set', 'model', { sub: 'TTFT 0.38 s', state: 'ok' }], ['var', 'input cost', '$0.003']] }
      ],
      predict: { at: 4, q: 'Request 2 has the same 8,000-token prefix but a new question. What happens?', options: ['Cache hit: only the 300 new tokens pay full price', 'Cache miss: the question changed, so nothing matches', 'The whole answer comes straight from the cache'], answer: 0, why: 'Prompt caching matches the longest identical prefix, not the whole prompt. The answer itself is still generated fresh.' } },
    { t: 'quiz', q: 'Your prompt starts with `Hi ${user.name}, today is ${date}.` then 6,000 tokens of docs. The cache hit rate is 0%. Why?',
      options: ['The changing greeting comes first, so every prefix is unique', 'The docs are too long to be cached', 'Caching only applies to output tokens', 'You need a vector database to enable caching'],
      answer: 0,
      why: 'A cache key is the prefix. If the first tokens differ per user, nothing after them can match. Move the greeting to the end.',
      whyNot: { 1: 'Long static prefixes are exactly what caching is for. Short ones (under about 1,000 tokens) are the ones often skipped.', 2: 'Prompt caching works on the input prefix. Output is generated fresh every time.', 3: 'A vector database is for retrieval. Prompt caching is done by the model provider.' } },
    { t: 'play', kind: 'controls', h: 'Bring the bill down',
      body: 'A support bot gets **10,000 requests a day**. Each has **300 dynamic tokens** (user, time, question). Prices are examples. Assume the task is easy enough for a small model: your evals proved it.',
      init: () => ({}),
      controls: [
        { id: 'stat', type: 'range', label: 'Static prefix', min: 1000, max: 20000, step: 1000, value: 8000, unit: 'tok' },
        { id: 'out', type: 'range', label: 'Output cap (max_tokens)', min: 100, max: 1000, step: 100, value: 500, unit: 'tok' },
        { id: 'cache', type: 'toggle', label: 'Prompt caching' },
        { id: 'order', type: 'select', label: 'Prompt order', options: ['static first', 'dynamic first'] },
        { id: 'model', type: 'select', label: 'Model size', options: ['large', 'small'] }
      ],
      presets: [{ label: 'Day one (no tricks)', v: { stat: 8000, out: 500, cache: false, order: 'static first', model: 'large' } }],
      view: s => {
        const v = s.v, c = E_cost(v), sf = v.order === 'static first';
        const stat = { label: 'Static prefix', sub: v.stat.toLocaleString('en-US') + ' tok · same', kind: 'c' };
        const dyn = { label: 'Dynamic part', sub: '300 tok · changes', kind: 'e' };
        const first = sf ? stat : dyn, second = sf ? dyn : stat;
        const cs = !v.cache ? 'off' : c.hit ? 'ok' : 'bad';
        const nodes = {
          app: { x: 90, y: 190, label: 'Your API', sub: '10k req/day', kind: 'a' },
          p1: Object.assign({ x: 320, y: 110, w: 170 }, first),
          p2: Object.assign({ x: 320, y: 270, w: 170 }, second),
          model: { x: 640, y: 270, label: v.model === 'large' ? 'Large model' : 'Small model', sub: 'TTFT ' + c.ttft.toFixed(2) + ' s', w: 160, kind: 'b', state: c.ttft < 1 ? 'ok' : 'warn' },
          cache: { x: 640, y: 110, label: 'Prefix cache', sub: !v.cache ? 'off' : c.hit ? 'HIT ' + c.cachedTok.toLocaleString('en-US') + ' tok' : 'MISS every call', shape: 'db', w: 130, kind: 'd', state: cs }
        };
        const edges = [['app', 'p1', 'first'], ['p1', 'p2', 'then'], ['p2', 'model']];
        if (v.cache) edges.push(['cache', 'model', { tone: c.hit ? 'ok' : 'bad', dash: !c.hit }]);
        return { nodes, edges, vars: { 'cost/day': E_usd(c.total), TTFT: c.ttft.toFixed(2) + ' s', budget: E_usd(E_BUDGET) } };
      },
      readout: s => { const c = E_cost(s.v); return [['Cost per day', E_usd(c.total)], ['Input / output', E_usd(c.inCost) + ' / ' + E_usd(c.outCost)], ['Cached tokens per call', c.cachedTok.toLocaleString('en-US')], ['TTFT', c.ttft.toFixed(2) + ' s']]; },
      goals: [
        { text: 'Turn on caching and cut the daily cost **by at least half**', check: s => !!s.v.cache && E_cost(s.v).total <= 0.5 * E_cost(Object.assign({}, s.v, { cache: false })).total, solve: [{ cache: true }] },
        { text: 'Keep caching on, put **dynamic first**, and watch the cache bust', check: s => !!s.v.cache && s.v.order === 'dynamic first', solve: [{ cache: true, order: 'dynamic first' }] },
        { text: 'Get under the **$20/day** budget with TTFT **under 1 s**', check: s => { const c = E_cost(s.v); return c.total <= E_BUDGET && c.ttft < 1; }, solve: [{ cache: true, order: 'static first', model: 'small' }] }
      ],
      hints: ['Flip on Prompt caching with the order on "static first". Watch the input cost.', 'Caching only helps if the first bytes never change. Try dynamic first and read the cache node.', 'Caching alone leaves about $108. Route this easy task to the small model, with caching on and static first.'],
      done: 'From $324 to about $9 a day: same answers, static-first caching plus a smaller model for an easy task.' },
    { t: 'quiz', kind: 'order', q: 'Order the parts of a cache-friendly prompt, first to last.',
      items: ['Fixed system prompt and tool schemas', 'Shared reference docs', 'Earlier turns of this chat', 'New user message, name and timestamp'],
      why: 'Put what never changes first and what changes every call last. The cache reuses everything up to the first difference.' },
    { t: 'read', h: 'Common mistake: dynamic data at the top',
      body: '**Mistake:** a template string puts the time and user name first. Every request is unique, so the cache never hits.\n\n**Best practice:** static first, dynamic last. Cap `max_tokens`, since output is the expensive part. Route easy tasks to a small model. Cache whole answers for repeated questions, keyed by a hash of the normalised question.',
      code: '// ❌ first bytes change every call: 0% cache hits\nconst system = `Now: ${now}. User: ${user.name}.\\n${RULES}\\n${DOCS}`;\n\n// ✅ static first (cacheable), dynamic last\nconst messages = [\n  { role: "system", content: RULES + DOCS },  // identical every call\n  { role: "user", content: `Now: ${now}. User: ${user.name}.\\n${question}` },\n];\nconst res = await llm.chat({ model: "small", messages, max_tokens: 400 });\nconsole.log(res.usage); // check the cached-token count',
      lang: 'js' },
    { t: 'recap', points: ['Cost = input tokens × input price + output tokens × output price. Output costs more per token.', '[[prompt caching|Prompt caching]] reuses an identical prefix: cheaper input and lower [[TTFT]].', 'Static first, dynamic last. A timestamp at the top busts the cache.', 'Cap `max_tokens`, route easy tasks to a small model, cache repeated answers.'],
      cheat: [['cost = in_tok × in_price + out_tok × out_price', 'Per request; multiply by requests per day'], ['[system + docs + tools] → [history] → [user msg + time]', 'Cache-friendly prompt order'], ['max_tokens: 400', 'Cap the most expensive tokens: output'], ['redis.get(hash(question))', 'Cache whole answers for repeated questions'], ['console.log(res.usage)', 'Log input, cached and output tokens per call']] }
  ]
};

/* ---------- Lesson 3: choosing an approach ---------- */
const E_SCEN = ['Support bot over company docs', 'Tag 1M tickets/day in fixed JSON', 'Hospital notes that cannot leave', 'Marketing slogans'];
const E_APPR = ['Prompt + structured output', 'RAG + strict prompt', 'Fine-tune (LoRA)', 'Local model (Ollama/vLLM)'];
const E_SC = [
  { key: 'support', label: 'Support bot', sub: 'company docs', best: 1 },
  { key: 'tickets', label: 'Ticket tagger', sub: '1M/day, fixed JSON', best: 2 },
  { key: 'hospital', label: 'Hospital notes', sub: 'must stay inside', best: 3 },
  { key: 'slogans', label: 'Slogan writer', sub: 'creative, public', best: 0 }
];
// [cost, quality, privacy] as [text, state], then a one-line verdict. Row = scenario, column = approach.
const E_OUT = [
  [[['~$30/day', 'ok'], ['invents policies', 'bad'], ['hosted API: fine', 'ok'], 'The model never saw your docs, so it guesses refund rules.'],
   [['~$45/day', 'ok'], ['cites your docs', 'ok'], ['hosted API: fine', 'ok'], 'Right call. Fresh, private facts come from retrieval.'],
   [['$$$ + retrain per edit', 'bad'], ['still guesses facts', 'warn'], ['hosted API: fine', 'ok'], 'Fine-tuning teaches style, not facts. Docs change weekly.'],
   [['GPU server + ops', 'warn'], ['no docs: guesses', 'bad'], ['stays inside', 'ok'], 'Local fixes privacy, not missing knowledge.']],
  [[['~$600/day long prompt', 'bad'], ['format drifts 3%', 'warn'], ['hosted API: fine', 'ok'], 'Works, but a long prompt a million times a day is pricey.'],
   [['$$$ extra tokens', 'bad'], ['nothing to retrieve', 'warn'], ['hosted API: fine', 'ok'], 'No facts are missing here. RAG only adds tokens.'],
   [['~$60/day small model', 'ok'], ['99.5% valid format', 'ok'], ['hosted API: fine', 'ok'], 'Right call. A narrow task at huge volume suits a LoRA.'],
   [['GPU fleet + ops', 'warn'], ['base model drifts', 'warn'], ['stays inside', 'ok'], 'Close, but the format still needs teaching. Fine-tune first.']],
  [[['~$20/day', 'ok'], ['ok summaries', 'warn'], ['notes leave building', 'bad'], 'Patient notes go to an outside API. Legal says no.'],
   [['~$35/day', 'ok'], ['good summaries', 'ok'], ['notes leave building', 'bad'], 'Great quality, but a hosted API still sees the notes.'],
   [['$$$ training run', 'bad'], ['ok summaries', 'warn'], ['training data uploaded', 'bad'], 'Uploading notes to train is the same privacy problem.'],
   [['one GPU server', 'warn'], ['good with local RAG', 'ok'], ['never leaves', 'ok'], 'Right call. An open-weight model on your own hardware.']],
  [[['~$2/day', 'ok'], ['fresh ideas, temp 0.9', 'ok'], ['public copy: fine', 'ok'], 'Right call. A good prompt is all this needs.'],
   [['~$5/day', 'ok'], ['nothing to retrieve', 'warn'], ['public copy: fine', 'ok'], 'There are no private facts to fetch. Extra moving parts.'],
   [['$$$ training run', 'bad'], ['locks one style', 'warn'], ['public copy: fine', 'ok'], 'Overkill. You want variety, not one fixed style.'],
   [['GPU server + ops', 'warn'], ['flatter copy', 'warn'], ['public copy: fine', 'ok'], 'Nothing private here. Hosting a model is extra work.']]
];

const E_choose = {
  id: 'choose-approach', title: 'Prompt, RAG, fine-tune or local? Choosing well', mins: 9, needs: 'cost-cache',
  goal: 'pick prompt, RAG, fine-tuning or a local model for a real feature, and run a model locally with Ollama.',
  cards: [
    { t: 'read', h: '"Should we train our own model?"',
      body: 'Your manager read an article and asks: "Should we fine-tune our own model?" It sounds impressive. It is usually the wrong first move.\n\nMost features need the model to **know your facts** and **answer in a fixed shape**. A strict [[system prompt]] plus [[RAG]] and [[structured output]] does both. About 90% of real use cases stop there.\n\nThe other tools are real, but for narrow jobs. You pick them by asking three questions.',
      analogy: 'It is like scaling a web app. You start with a monolith and a database. You add sharding or your own data centre only when the numbers force you.' },
    { t: 'viz', h: 'Three questions, four answers', body: 'Ask the questions in order. Each "yes" adds one tool.',
      nodes: {
        s: { x: 90, y: 190, label: 'Good prompt', sub: '+ structured output', w: 150, kind: 'a' },
        q1: { x: 340, y: 65, label: 'Private or fresh data?', w: 200, kind: 'n' },
        q2: { x: 340, y: 190, label: 'Fixed format, huge volume?', w: 230, kind: 'n' },
        q3: { x: 340, y: 315, label: 'Data must stay inside?', w: 200, kind: 'n' },
        rag: { x: 650, y: 65, label: 'Add RAG', sub: 'retrieve at request time', w: 170, kind: 'c', state: 'off' },
        ft: { x: 650, y: 190, label: 'Fine-tune (LoRA)', sub: 'teach style + format', w: 170, kind: 'b', state: 'off' },
        local: { x: 650, y: 315, label: 'Local model', sub: 'Ollama / vLLM', w: 170, kind: 'd', state: 'off' }
      },
      steps: [
        { cap: 'Always start here: a strong [[system prompt]] plus [[structured output]]. Many features ship with only this.', do: [['focus', 's'], ['set', 's', { state: 'active' }], ['var', 'stack', 'prompt']] },
        { cap: 'Question 1: does the answer need facts the model never saw? Your docs, today\'s prices, a user\'s orders.', do: [['link', 's', 'q1'], ['focus', 's', 'q1']] },
        { cap: 'Yes → add [[RAG]]. Retrieval puts the facts in the prompt at request time. Edit a doc and answers update.', do: [['link', 'q1', 'rag', 'yes'], ['set', 'rag', { state: 'ok' }], ['var', 'stack', 'prompt + RAG']] },
        { cap: 'Question 2: is it one narrow task, in one fixed format, at huge volume? Like tagging a million tickets a day.', do: [['link', 's', 'q2'], ['focus', 's', 'q2']] },
        { cap: 'Yes → [[fine-tuning]], often with [[LoRA]] on a small model. It teaches behaviour (format, tone), not facts.', do: [['link', 'q2', 'ft', 'yes'], ['set', 'ft', { state: 'ok' }], ['var', 'stack', 'prompt + LoRA']] },
        { cap: 'Question 3: can the data never leave your servers? Or is volume so high that API bills hurt?', do: [['link', 's', 'q3'], ['focus', 's', 'q3']] },
        { cap: 'Yes → run an [[open-weight model]] yourself: [[Ollama]] on a laptop, vLLM on a production GPU server.', do: [['link', 'q3', 'local', 'yes'], ['set', 'local', { state: 'ok' }], ['var', 'stack', 'local model']] },
        { cap: 'Most real apps stop after question 1: RAG plus a strict system prompt covers about 90% of use cases.', do: [['focus', 's', 'q1', 'rag'], ['var', 'stack', 'prompt + RAG (most apps)']] }
      ],
      predict: { at: 4, q: 'You must tag 1M tickets a day into the exact same JSON. The prompt works but is long and costly. What fits?', options: ['Fine-tune a small model on the format', 'Add RAG over old tickets', 'Use a bigger model with a longer prompt'], answer: 0, why: 'Nothing is missing, so RAG adds nothing. A LoRA bakes the format into a small, cheap model, so the long prompt can go.' } },
    { t: 'quiz', q: 'Your bot quotes last month\'s prices. Prices change every week. What is the best fix?',
      options: ['RAG or a tool call over the price table, so each answer reads current data', 'Fine-tune the model on the new prices every week', 'Raise the temperature so it explores more answers', 'Switch to a local open-weight model'],
      answer: 0,
      why: 'Fresh facts belong in the context at request time. Update the table and the very next answer is right.',
      whyNot: { 1: '[[fine-tuning|Fine-tuning]] teaches style, not reliable facts. It is slow, costly, and stale the day after training.', 2: 'Temperature changes randomness, not knowledge. More randomness means more invented prices.', 3: 'A local model has the same problem: it never saw your new prices.' } },
    { t: 'play', kind: 'controls', h: 'Ship the right approach',
      body: 'Pick a scenario, pick an approach, and press **Ship it**. Read the cost, quality and privacy that come back. Numbers are examples.',
      init: () => ({ last: null, solved: {} }),
      controls: [
        { id: 'scenario', type: 'select', label: 'Scenario', options: E_SCEN },
        { id: 'approach', type: 'select', label: 'Approach', options: E_APPR },
        { id: 'ship', type: 'button', label: 'Ship it', run: (s, io) => {
          const si = E_SCEN.indexOf(s.v.scenario), ai = E_APPR.indexOf(s.v.approach), sc = E_SC[si];
          s.last = { si, ai };
          if (ai === sc.best) s.solved[sc.key] = true;
          io.send('scen', 'appr', 'ship'); io.send('appr', 'quality');
          io.note('appr', E_OUT[si][ai][3]);
        } }
      ],
      update: s => { s.last = null; },
      view: s => {
        const si = E_SCEN.indexOf(s.v.scenario), ai = E_APPR.indexOf(s.v.approach), sc = E_SC[si], o = s.last ? E_OUT[si][ai] : null;
        const shortA = ['Prompt only', 'RAG + prompt', 'Fine-tune', 'Local model'][ai];
        const nodes = {
          scen: { x: 100, y: 190, label: sc.label, sub: sc.sub, w: 150, kind: 'a', state: s.solved[sc.key] ? 'ok' : undefined },
          appr: { x: 340, y: 190, label: shortA, sub: o ? (ai === sc.best ? 'good fit' : 'poor fit') : 'not shipped', w: 160, kind: 'b', state: o ? (ai === sc.best ? 'ok' : 'bad') : 'off' }
        };
        ['cost', 'quality', 'privacy'].forEach((k, i) => {
          nodes[k] = { x: 630, y: 65 + i * 125, label: k[0].toUpperCase() + k.slice(1), sub: o ? o[i][0] : '?', w: 190, kind: 'n', state: o ? o[i][1] : 'off' };
        });
        const edges = [['scen', 'appr'], ['appr', 'cost'], ['appr', 'quality'], ['appr', 'privacy']];
        return { nodes, edges, vars: { solved: Object.keys(s.solved).length + ' / 4' } };
      },
      readout: s => {
        const si = E_SCEN.indexOf(s.v.scenario), ai = E_APPR.indexOf(s.v.approach), o = s.last ? E_OUT[si][ai] : null;
        return [['Verdict', o ? o[3] : 'press Ship it'], ['Solved', E_SC.filter(x => s.solved[x.key]).map(x => x.label).join(', ') || 'none yet']];
      },
      goals: [
        { text: 'Ship the right approach for the **support bot**', check: s => !!s.solved.support, solve: [{ scenario: E_SCEN[0], approach: E_APPR[1] }, 'ship'] },
        { text: 'Ship the right approach for **1M tickets a day**', check: s => !!s.solved.tickets, solve: [{ scenario: E_SCEN[1], approach: E_APPR[2] }, 'ship'] },
        { text: 'Ship the right approach for **hospital notes**', check: s => !!s.solved.hospital, solve: [{ scenario: E_SCEN[2], approach: E_APPR[3] }, 'ship'] }
      ],
      hints: ['Ask what is missing. Facts → RAG. One format at scale → fine-tune. Privacy → local.', 'The support bot never saw your docs. The tickets need nothing new, just one format, cheaply.', 'Support → RAG + strict prompt. Tickets → Fine-tune (LoRA). Hospital → Local model.'],
      done: 'You chose by need, not by hype: facts → RAG, format at scale → LoRA, privacy → local, and a plain prompt when that is enough.' },
    { t: 'quiz', kind: 'multi', q: 'Which are good reasons to run an open-weight model on your own servers?',
      options: ['Patient data legally cannot leave your network', 'It must work offline, like on a factory floor', 'Steady huge volume where your own GPUs beat per-token bills', 'You want the model to learn your company facts', 'It will be smarter than the top hosted models'],
      answer: [0, 1, 2],
      why: 'Local models win on privacy, offline use and cost at high, steady volume. They are not a way to add knowledge.',
      whyNot: { 3: 'Running a model locally does not teach it anything. Your facts still come from RAG.', 4: 'Small open-weight models you can run locally usually trail the top hosted models in quality.' } },
    { t: 'read', h: 'Common mistake: fine-tuning to teach facts',
      body: '**Mistake:** fine-tuning on your docs so the model "knows" them. It still mixes facts up, and every doc edit means retraining.\n\n**Best practice:** RAG for facts, a strict prompt for rules, and evals to prove it. When data must stay inside, run an [[open-weight model]] with [[Ollama]]. A 7B model at 4-bit [[quantization]] needs about 5–8 GB of memory. A 70B one needs 40 GB or more.',
      code: 'ollama pull qwen2.5:7b              # ~4.7 GB download\nollama run qwen2.5:7b "Summarise this note: ..."\n\n# Local HTTP API on port 11434\ncurl http://localhost:11434/api/chat -d \'{\n  "model": "qwen2.5:7b",\n  "messages": [{"role": "user", "content": "Hi"}],\n  "stream": false\n}\'',
      lang: 'bash' },
    { t: 'recap', h: 'Your job-ready checklist',
      points: ['Start with a strict prompt and [[structured output]]. Add [[RAG]] for private or fresh facts.', '[[fine-tuning|Fine-tune]] with [[LoRA]] only for a fixed style or format at scale, never for facts.', 'Go local with [[Ollama]] or vLLM for privacy, offline use, or cost at huge volume.', 'You now have the full path: call, ground, act, test, cache, choose. The rows below are the minimal stack.'],
      cheat: [['Python: FastAPI + Pydantic', 'AI backend next to your JS/TS app (Zod on the front)'], ['Postgres + pgvector', 'Rows and embeddings in one database'], ['BM25 + vectors → RRF → reranker', 'Hybrid RAG that finds the right chunk'], ['Content-Type: text/event-stream', 'Stream tokens to the UI with SSE'], ['response_format: JSON schema', 'Structured outputs you validate'], ['provider SDK first → LangGraph / LlamaIndex', 'Add frameworks only for complex orchestration'], ['Langfuse traces + evals in CI + prompt caching', 'Observe it, test it, keep it cheap'], ['ollama pull qwen2.5:7b', 'Local model when data must stay inside']] }
  ]
};

;
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

;
// Capstone steps 4–5: index the docs in pgvector, then answer from them with citations.
const P2_GLOSS = {
  'top-k': 'How many of the best-ranked search results you keep. With top-k = 5, the 5 highest-scoring chunks go into the prompt.',
  'tsvector': 'Postgres\'s ready-to-search form of a text: a sorted list of word stems. Full-text search matches queries against it.',
  'migration': 'A versioned SQL file that changes the database schema, for example creating a table. You apply it once per database.'
};

// ---------- Step 4: ingest ----------
const P2_DOCS = [['api-keys.md', 4], ['billing.md', 5], ['errors.md', 6], ['refunds.md', 4], ['shipping.md', 4]];
const P2_DIMS = { 'text-embedding-3-small': 1536, 'text-embedding-3-large': 3072, 'text-embedding-ada-002': 1536 };
const P2_PKGS = { numpy: 'numpy==2.1.3', tiktoken: 'tiktoken==0.8.0', psycopg: 'psycopg==3.2.3', pgvector: 'pgvector==0.3.6' };
const P2_COUNT_SQL = 'docker compose exec db psql -U docsbot -c "SELECT count(*) FROM chunks"';
const P2_INGEST = 'uv run python ingest.py ../docs';

function P2_ingestRun(m, s, io) {
  const model = m[1] || 'text-embedding-3-small', folder = m[2] || '../docs';
  const missing = ['numpy', 'tiktoken', 'psycopg', 'pgvector'].find(p => !s.pkgs[p]);
  if (missing) return { err: 'Traceback (most recent call last):\n  File "ingest.py", line ' + (missing === 'numpy' || missing === 'tiktoken' ? 2 : 3) + ', in <module>\nModuleNotFoundError: No module named \'' + missing + '\'' };
  if (!/^\.\.\/docs\/?$/.test(folder)) return { err: 'no .md files in ' + folder + '\n(hint: you are in api/, and the docs live one level up)' };
  io.send('docs', 'ing', 'read');
  if (!s.db) { io.send('ing', 'db', 'connect', 'bad'); return { err: 'psycopg.OperationalError: connection failed: connection to server at "127.0.0.1", port 5432 failed: Connection refused\n\tIs the server running on that host and accepting TCP/IP connections?' }; }
  if (!s.migrated) { io.send('ing', 'db', 'connect', 'bad'); return { err: 'psycopg.ProgrammingError: vector type not found in the database' }; }
  if (!(model in P2_DIMS)) return { err: 'openai.NotFoundError: Error code: 404 - The model `' + model + '` does not exist or you do not have access to it.' };
  s.model = model; io.send('ing', 'emb', 'batch');
  if (P2_DIMS[model] !== 1536) { s.sawDim = true; s.countAfterDim = false; io.send('emb', 'ing', P2_DIMS[model] + ' dims', 'bad'); return { err: model + ' returns ' + P2_DIMS[model] + ' dims, but EMBED_DIM=1536' }; }
  io.send('emb', 'ing', '1,536 dims', 'ok'); io.send('ing', 'db', 'replace rows', 'ok');
  s.rows = 23; s.okRuns++;
  return P2_DOCS.map(([f, n]) => f + ': ' + n + ' chunks').join('\n');
}

function P2_psql(m, s) {
  if (!s.db) return { err: 'service "db" is not running' };
  if (!/-U\s+docsbot\b/.test(m[0])) return { err: 'psql: error: connection to server on socket "/var/run/postgresql/.s.PGSQL.5432" failed: FATAL:  role "root" does not exist\n(hint: add -U docsbot)' };
  const sql = m[2].trim().replace(/;$/, '');
  if (/^\\d\+?\s+chunks$/i.test(sql)) {
    if (!s.migrated) return { err: 'Did not find any relation named "chunks".' };
    return '  Column   |     Type     \n-----------+--------------\n id        | bigint\n source    | text\n title     | text\n section   | text\n content   | text\n tokens    | integer\n embedding | vector(1536)\n tsv       | tsvector (generated)\nIndexes:\n    "chunks_pkey" PRIMARY KEY, btree (id)\n    "chunks_embedding_hnsw" hnsw (embedding vector_cosine_ops)\n    "chunks_source_idx" btree (source)\n    "chunks_tsv_gin" gin (tsv)';
  }
  if (!/\bfrom\s+chunks\b/i.test(sql)) return { err: 'This simulator knows SELECT count(*) FROM chunks, ... GROUP BY source, and \\d chunks.' };
  if (!s.migrated) return { err: 'ERROR:  relation "chunks" does not exist\nLINE 1: SELECT count(*) FROM chunks' };
  if (s.okRuns >= 2) s.idem = true;
  if (s.sawDim) s.countAfterDim = true;
  if (/group\s+by\s+source/i.test(sql)) {
    if (!s.rows) return '   source    | count\n-------------+-------\n(0 rows)';
    return '   source    | count\n-------------+-------\n' + P2_DOCS.map(([f, n]) => ' ' + f.padEnd(11) + ' |     ' + n).join('\n') + '\n(5 rows)';
  }
  if (/count\s*\(\s*\*\s*\)/i.test(sql)) return ' count\n-------\n    ' + s.rows + '\n(1 row)';
  return { err: 'This simulator knows SELECT count(*) FROM chunks, ... GROUP BY source, and \\d chunks.' };
}

const P2_ingest = {
  id: 'cap-ingest', title: 'Step 4: Index your docs', mins: 12,
  goal: 'run Postgres with pgvector in Docker, and index your Markdown docs with one safe, re-runnable command.',
  cards: [
    { t: 'read', h: 'DocsBot has never read your docs',
      body: 'Right now DocsBot answers from the model\'s memory. It has never seen your docs, so it guesses.\n\nIn this step you load them into Postgres. You split each Markdown file into [[chunk|chunks]], turn each chunk into an [[embedding]], and store it with [[pgvector]]. When you\'re done, one command indexes `docs/`, and running it twice is safe.' },
    { t: 'viz', h: 'One file\'s trip into Postgres',
      nodes: {
        f: { x: 90, y: 190, w: 130, label: 'refunds.md', sub: '2,100 tokens', kind: 'n' },
        split: { x: 280, y: 190, w: 150, label: 'Splitter', sub: '500 tok · 50 overlap', kind: 'b' },
        emb: { x: 470, y: 190, w: 130, label: 'Embeddings', sub: 'batch of 64', kind: 'c' },
        pg: { x: 670, y: 190, w: 140, shape: 'db', label: 'chunks', sub: '0 rows', kind: 'c' },
        idx: { x: 670, y: 325, w: 140, label: 'HNSW + GIN', sub: 'indexes', kind: 'd', state: 'off' }
      },
      edges: [['f', 'split'], ['split', 'emb'], ['emb', 'pg'], ['pg', 'idx', { dash: true }]],
      vars: { chunks: 0, rows: 0 },
      steps: [
        { cap: '`ingest.py` reads `docs/refunds.md`: 2,100 tokens of Markdown under four `##` headers.', do: [['set', 'f', { state: 'active' }], ['focus', 'f']] },
        { cap: 'The splitter cuts at each header first, so a chunk never mixes topics. Title and section ride along as [[metadata]].', do: [['send', 'f', 'split', 'Markdown'], ['set', 'split', { sub: '4 sections' }], ['var', 'chunks', 4]] },
        { cap: 'One section has 1,100 tokens. It becomes 3 windows of up to 500 tokens, each sharing 50 with the last.', do: [['set', 'split', { sub: '6 chunks' }], ['note', 'split', '500 + 500 + 200'], ['var', 'chunks', 6]] },
        { cap: 'All 6 chunks go to the embeddings API in one batched call. Back come 6 vectors of 1,536 numbers.', do: [['send', 'split', 'emb', '6 texts'], ['set', 'emb', { sub: '6 × 1,536', state: 'ok' }]] },
        { cap: 'One transaction: delete old rows where source = refunds.md, then insert 6. Postgres fills `tsv` itself.', do: [['send', 'emb', 'pg', '6 rows', 'ok'], ['set', 'pg', { sub: '6 rows', state: 'ok' }], ['var', 'rows', 6]] },
        { cap: 'A second run deletes 6 and inserts 6 in one transaction. Still 6 rows, never 12. Ingest is [[idempotent]].', do: [['send', 'emb', 'pg', 'replace', 'ok'], ['note', 'pg', 'still 6'], ['var', 'rows', 6]] },
        { cap: 'Each insert also updates the [[HNSW]] index (meaning) and the GIN index (keywords). Ready to search.', do: [['send', 'pg', 'idx', 'index'], ['set', 'idx', { state: 'ok' }], ['focus', 'pg', 'idx']] }
      ],
      predict: { at: 5, q: 'You run `ingest.py` again on the same file. How many rows does refunds.md have now?',
        options: ['6: the old rows are deleted in the same transaction', '12: every run appends new rows', '0: the DELETE wipes the file for good'], answer: 0,
        why: 'Delete-by-source plus insert, inside one transaction, replaces a file\'s rows. Readers never see 0 or 12.' } },
    { t: 'read', h: 'Write the code: the database',
      body: 'Run Postgres in Docker, then create the table once with a [[migration]]. The `tsv` column is a generated [[tsvector]], so keyword search needs no Python code.',
      code: String.raw`-- api/migrations/001_init.sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS chunks (
  id        bigserial PRIMARY KEY,
  source    text NOT NULL,          -- file name, e.g. refunds.md
  title     text NOT NULL,          -- the file's # heading
  section   text NOT NULL,          -- the heading this chunk sits under
  content   text NOT NULL,
  tokens    int  NOT NULL,
  embedding vector(1536) NOT NULL,  -- must equal EMBED_DIM
  tsv       tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);

CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw ON chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS chunks_tsv_gin ON chunks USING gin (tsv);
CREATE INDEX IF NOT EXISTS chunks_source_idx ON chunks (source);`, lang: 'sql',
      points: [
        '`docker-compose.yml` (repo root): one service `db` with `image: pgvector/pgvector:pg16`; `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB` all set to `docsbot`; `ports: ["5432:5432"]`; a named volume `pgdata:/var/lib/postgresql/data`; and a `healthcheck` that runs `pg_isready -U docsbot -d docsbot` every 5 s.',
        '`.env` and `.env.example`: add `DATABASE_URL=postgresql://docsbot:docsbot@localhost:5432/docsbot`. In `app/settings.py`, add `database_url: str = "postgresql://docsbot:docsbot@localhost:5432/docsbot"`.',
        '`app/db.py`: `connect()` returns `psycopg.connect(settings.database_url)` after `register_vector(conn)`, so numpy arrays go in and out as `vector`.',
        'Apply it once, from `api/`: `docker compose exec -T db psql -U docsbot -d docsbot < migrations/001_init.sql`.'
      ] },
    { t: 'read', h: 'Write the code: ingest.py',
      body: 'Split on headers, cut long sections into overlapping windows, embed in batches, and replace each file\'s rows in one transaction.',
      code: String.raw`import asyncio, pathlib, re, sys
import numpy as np, tiktoken
from app.db import connect
from app.llm import client
from app.settings import settings

ENC = tiktoken.get_encoding("cl100k_base")
SIZE, OVERLAP, BATCH = 500, 50, 64
INSERT = "INSERT INTO chunks (source, title, section, content, tokens, embedding) VALUES (%s, %s, %s, %s, %s, %s)"

def split(text):
    """Cut at Markdown headers, then into ~500-token windows that overlap by 50."""
    for part in filter(str.strip, re.split(r"(?m)^(?=#{1,3} )", text)):
        section, toks = part.split("\n", 1)[0].lstrip("# ").strip(), ENC.encode(part)
        for i in range(0, len(toks), SIZE - OVERLAP):
            yield section, ENC.decode(toks[i:i + SIZE]), len(toks[i:i + SIZE])
            if i + SIZE >= len(toks): break  # last window reached

async def embed(texts):
    batches = [texts[i:i + BATCH] for i in range(0, len(texts), BATCH)]  # 64 chunks per API call
    vecs = [np.array(d.embedding) for b in batches for d in (await client.embeddings.create(model=settings.embed_model, input=b)).data]
    if vecs and len(vecs[0]) != settings.embed_dim:
        sys.exit(f"{settings.embed_model} returns {len(vecs[0])} dims, but EMBED_DIM={settings.embed_dim}")
    return vecs

async def main(folder):
    paths = sorted(pathlib.Path(folder).glob("*.md")) or sys.exit(f"no .md files in {folder}")
    with connect() as conn:
        for path in paths:
            text = path.read_text(encoding="utf-8")
            title = next((l[2:].strip() for l in text.splitlines() if l.startswith("# ")), path.stem)
            chunks = list(split(text))
            rows = [(path.name, title, s, c, n, v) for (s, c, n), v in zip(chunks, await embed([c for _, c, _ in chunks]))]
            with conn.transaction():  # delete + insert together, so re-runs never duplicate
                conn.execute("DELETE FROM chunks WHERE source = %s", (path.name,))
                conn.cursor().executemany(INSERT, rows)
            print(f"{path.name}: {len(rows)} chunks")

if __name__ == "__main__":
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else "../docs"))`, lang: 'python',
      points: [
        'From `api/`: `uv add "psycopg[binary]" pgvector numpy tiktoken`.',
        'Put 3–5 Markdown files in `docs/` at the repo root: your real docs, or short ones like `refunds.md` and `errors.md`.',
        'Run `uv run python ingest.py ../docs`. It reuses the async `client` from `app/llm.py` via `asyncio.run`. Embeddings are made before the transaction, so a failed run changes nothing.',
        '`tests/test_ingest.py`: assert every chunk from `split()` has `n <= 500` and a non-empty section. No database needed.'
      ] },
    { t: 'play', kind: 'terminal', h: 'Rehearse: index the docs',
      body: 'A pretend shell in `docsbot/api`. Start the database, then index `../docs`.',
      prompt: 'docsbot/api $', welcome: 'You are in docsbot/api. The repo-root .env uses OpenAI with EMBED_MODEL=text-embedding-3-small.\nType help to see the commands.',
      init: () => ({ pkgs: {}, db: false, migrated: false, rows: 0, okRuns: 0, model: 'text-embedding-3-small', idem: false, sawDim: false, countAfterDim: false }),
      cmds: [
        { re: /^uv\s+add\s+(.+)$/i, help: 'uv add "psycopg[binary]" pgvector numpy tiktoken', desc: 'install the database and token libraries', run(m, s) {
          const names = m[1].split(/\s+/).map(p => p.replace(/["']/g, '').replace(/[\[=<>].*$/, '').toLowerCase()).filter(Boolean);
          const fresh = names.filter(n => !s.pkgs[n]); fresh.forEach(n => { s.pkgs[n] = true; });
          if (!fresh.length) return 'Resolved 34 packages in 9ms\nAudited 30 packages in 0.3ms';
          return 'Resolved 34 packages in 388ms\nInstalled ' + fresh.length + ' packages in 41ms\n' + fresh.map(n => ' + ' + (P2_PKGS[n] || n)).join('\n');
        } },
        { re: /^docker\s+compose\s+up(\s+-d)?(\s+db)?\s*$/i, help: 'docker compose up -d db', desc: 'start Postgres + pgvector in the background', run(m, s) {
          if (s.db) return '[+] Running 1/1\n ✔ Container docsbot-db-1  Running';
          s.db = true; return '[+] Running 3/3\n ✔ Network docsbot_default    Created\n ✔ Volume "docsbot_pgdata"    Created\n ✔ Container docsbot-db-1     Started';
        } },
        { re: /^docker\s+compose\s+ps\s*$/i, help: 'docker compose ps', desc: 'check the db is healthy', run(m, s) {
          return 'NAME           IMAGE                    SERVICE   STATUS' + (s.db ? '\ndocsbot-db-1   pgvector/pgvector:pg16   db        Up 14 seconds (healthy)' : '');
        } },
        { re: /^docker\s+compose\s+exec\s+(?:-T\s+)?db\s+psql\b[^<]*<\s*(\S+)\s*$/i, help: 'docker compose exec -T db psql -U docsbot -d docsbot < migrations/001_init.sql', desc: 'apply the migration', run(m, s, io) {
          if (!/^(\.\/)?migrations\/001_init\.sql$/.test(m[1])) return { err: 'zsh: no such file or directory: ' + m[1] + '\n(hint: from api/ the file is migrations/001_init.sql)' };
          if (!s.db) return { err: 'service "db" is not running' };
          if (!/-U\s+docsbot\b/.test(m[0])) return { err: 'psql: error: FATAL:  role "root" does not exist\n(hint: add -U docsbot)' };
          io.send('ing', 'db', 'DDL');
          if (s.migrated) return 'NOTICE:  extension "vector" already exists, skipping\nCREATE EXTENSION\nNOTICE:  relation "chunks" already exists, skipping\nCREATE TABLE\n(3 more "already exists" notices: safe to re-run)';
          s.migrated = true; return 'CREATE EXTENSION\nCREATE TABLE\nCREATE INDEX\nCREATE INDEX\nCREATE INDEX';
        } },
        { re: /^docker\s+compose\s+exec\s+(?:-T\s+)?db\s+psql\b.*?-c\s+(["'])(.+)\1\s*$/i, help: P2_COUNT_SQL, desc: 'run one SQL statement (count, GROUP BY source, \\d chunks)', run: P2_psql },
        { re: /^(?:EMBED_MODEL=(\S+)\s+)?uv\s+run\s+(?:python\s+)?ingest\.py(?:\s+(\S+))?\s*$/i, help: P2_INGEST, desc: 'chunk, embed and store every .md file', run: P2_ingestRun },
        { re: /^cat\s+\.\.\/\.env\s*$/i, help: 'cat ../.env', desc: 'show your settings', run: () => 'LLM_BASE_URL=https://api.openai.com/v1\nLLM_API_KEY=sk-…(hidden)\nLLM_MODEL=gpt-4o-mini\nEMBED_MODEL=text-embedding-3-small\nEMBED_DIM=1536\nDATABASE_URL=postgresql://docsbot:docsbot@localhost:5432/docsbot' },
        { re: /^ls\s+\.\.\/docs\/?\s*$/i, help: 'ls ../docs', desc: 'list the docs to index', run: () => P2_DOCS.map(d => d[0]).join('  ') }
      ],
      view: s => ({
        nodes: {
          docs: { x: 90, y: 190, w: 120, label: 'docs/*.md', sub: '5 files', kind: 'n' },
          ing: { x: 290, y: 190, w: 130, label: 'ingest.py', sub: s.okRuns ? 'runs: ' + s.okRuns : 'not run', kind: 'b', state: s.okRuns ? 'ok' : undefined },
          emb: { x: 290, y: 65, w: 130, label: 'Embed API', sub: (P2_DIMS[s.model] || 0).toLocaleString('en-US') + ' dims', kind: 'c', state: P2_DIMS[s.model] === 1536 ? undefined : 'bad' },
          db: { x: 520, y: 190, w: 140, shape: 'db', label: 'Postgres', sub: s.db ? 'healthy' : 'stopped', kind: 'c', state: s.db ? 'ok' : 'off' },
          tbl: { x: 720, y: 190, w: 110, label: 'chunks', sub: s.migrated ? s.rows + ' rows' : 'no table', kind: 'c', state: s.migrated ? undefined : 'off' },
          idx: { x: 720, y: 320, w: 110, label: 'HNSW + GIN', sub: 'indexes', kind: 'd', state: s.migrated ? 'ok' : 'off' }
        },
        edges: [['docs', 'ing'], ['ing', 'emb', { bi: true }], ['ing', 'db'], ['db', 'tbl'], ['tbl', 'idx', { dash: true }]],
        vars: { rows: s.rows, 'ingest runs': s.okRuns }
      }),
      goals: [
        { text: 'Install the deps, start Postgres and apply `001_init.sql`', check: s => s.migrated && ['numpy', 'tiktoken', 'psycopg', 'pgvector'].every(p => s.pkgs[p]),
          solve: ['uv add "psycopg[binary]" pgvector numpy tiktoken', 'docker compose up -d db', 'docker compose exec -T db psql -U docsbot -d docsbot < migrations/001_init.sql'] },
        { text: 'Run ingest **twice**, then count rows: still 23, not 46', check: s => s.idem, solve: [P2_INGEST, P2_INGEST, P2_COUNT_SQL] },
        { text: 'Break it: run with `EMBED_MODEL=text-embedding-3-large`, then check the count is unchanged', check: s => s.sawDim && s.countAfterDim,
          solve: ['EMBED_MODEL=text-embedding-3-large ' + P2_INGEST, P2_COUNT_SQL] }
      ],
      hints: ['Start with the `uv add` line from `help`, then `docker compose up -d db`.', 'Apply the migration with `docker compose exec -T db psql -U docsbot -d docsbot < migrations/001_init.sql`, then run `' + P2_INGEST + '` two times.', 'Put `EMBED_MODEL=text-embedding-3-large` in front of the ingest command, then run the count query again.'],
      try: ['uv add "psycopg[binary]" pgvector numpy tiktoken', 'docker compose up -d db', 'docker compose ps', 'help'],
      done: 'The 3,072-dim model was stopped before any write, so your 23 rows stayed safe.' },
    { t: 'check', h: 'Make it real: index your own docs',
      body: 'Run these from `docsbot/api` on your machine.',
      code: 'docker compose up -d db && docker compose ps\ndocker compose exec -T db psql -U docsbot -d docsbot < migrations/001_init.sql\nuv run python ingest.py ../docs\nuv run python ingest.py ../docs   # again: same count\ndocker compose exec db psql -U docsbot -c "SELECT source, count(*) FROM chunks GROUP BY source"', lang: 'Shell',
      items: ['I ran `docker compose ps` and the `db` service shows `(healthy)`.', 'I ran `\\d chunks` in psql and saw the `hnsw` and `gin` indexes.', 'I ran `ingest.py` and saw one line per file in `docs/`.', 'I ran `ingest.py` twice and `SELECT count(*) FROM chunks` gave the same number both times.', 'I ran `uv run pytest` and the `split()` test passes.'] },
    { t: 'quiz', q: 'You switch `EMBED_MODEL` to a local `nomic-embed-text` (768 dims) but keep `vector(1536)`. What happens when you ingest?',
      options: ['It fails fast: the dims check (or pgvector itself) rejects 768 vs 1536', 'pgvector pads each vector with zeros up to 1,536', 'It works, but search quality drops a little', 'Postgres resizes the column to fit the first row'], answer: 0,
      why: 'A vector column has one fixed size. To switch models, change `EMBED_DIM` and the migration together, then re-embed every chunk. Vectors from two models never mix.',
      whyNot: { 1: 'pgvector never pads. It raises `expected 1536 dimensions, not 768`.', 2: 'There is no partial success: a wrong-size vector cannot be stored at all.', 3: 'Column types only change with an explicit `ALTER TABLE`. Postgres never guesses.' } },
    { t: 'recap', points: ['Postgres + [[pgvector]] runs in Docker. One [[migration]] adds the table, an [[HNSW]] index and a GIN index on the generated `tsv`.', 'Split on headers, then into ~500-token windows with 50 overlap. Keep source, title and section as [[metadata]].', 'Embed in batches and check the size: the model\'s vectors must match `vector(1536)`.', 'Delete-then-insert per file in one transaction makes ingest [[idempotent]].'],
      cheat: [['docker compose up -d db', 'start Postgres + pgvector'], ['docker compose ps', 'wait for (healthy)'], ['uv run python ingest.py ../docs', 'chunk, embed, store (safe to re-run)'], ['SELECT count(*) FROM chunks;', 'how many chunks are indexed'], ['\\d chunks', 'columns plus HNSW and GIN indexes']] }
  ]
};

// ---------- Step 5: hybrid RAG with citations ----------
const P2_Q_MONEY = 'How do I get my money back?', P2_Q_CODE = 'What does error E1043 mean?', P2_Q_CRYPTO = 'Can I pay with crypto?';
const P2_M_OFF = 'Off', P2_M_VEC = 'Vector', P2_M_KW = 'Keyword', P2_M_HYB = 'Hybrid (RRF)';
const P2_CH = {
  ref_how: ['refunds.md', 'How to request'], ref_win: ['refunds.md', 'Refund window'], bill_pay: ['billing.md', 'Payment methods'],
  bill_inv: ['billing.md', 'Invoices'], e1042: ['errors.md', 'E1042 bad request'], e1043: ['errors.md', 'E1043 quota'],
  lim: ['limits.md', 'Rate limits'], keys: ['api-keys.md', 'Rotate a key']
};
// Ranked lists as Postgres would return them. Keyword search ANDs every word, so paraphrases miss.
const P2_QS = {
  [P2_Q_MONEY]: { short: 'money back?', need: 'ref_how', vec: ['ref_how', 'ref_win', 'bill_inv', 'bill_pay', 'lim', 'keys'], kw: [],
    good: 'Email support within 14 days of purchase [n].', bad: 'Open Settings › Billing and click Refund. It takes 24 hours.' },
  [P2_Q_CODE]: { short: 'E1043?', need: 'e1043', vec: ['e1042', 'lim', 'keys', 'bill_inv', 'ref_win', 'e1043'], kw: ['e1043'],
    good: 'E1043 means you used up this month\'s quota [n].', bad: 'E1043 means your API key is invalid.' },
  [P2_Q_CRYPTO]: { short: 'crypto?', need: null, vec: ['bill_pay', 'bill_inv', 'ref_how', 'ref_win', 'keys'], kw: [],
    good: '', bad: 'Yes! We accept Bitcoin and USDC at checkout.' }
};

function P2_rank(v) {
  const Q = P2_QS[v.q];
  if (v.mode === P2_M_OFF) return [];
  const lists = v.mode === P2_M_VEC ? [Q.vec] : v.mode === P2_M_KW ? [Q.kw] : [Q.vec, Q.kw], score = {};
  lists.forEach(l => l.forEach((id, i) => { score[id] = (score[id] || 0) + 1 / (60 + i + 1); }));
  return Object.keys(score).sort((a, b) => score[b] - score[a]).map(id => ({ id, score: score[id] }));
}

function P2_answer(v) {
  const Q = P2_QS[v.q], top = P2_rank(v).slice(0, v.k), pos = top.findIndex(r => r.id === Q.need) + 1;
  if (pos) return { kind: 'ok', text: Q.good.replace('[n]', '[' + pos + ']'), cite: '[' + pos + '] ' + P2_CH[Q.need][0], top };
  if (v.rule) return { kind: 'idk', text: 'I don\'t know. The sources don\'t cover that.', cite: 'none', top };
  return { kind: 'bad', text: Q.bad, cite: 'none', top };
}

const P2_rag = {
  id: 'cap-rag', title: 'Step 5: Cited answers', mins: 12, needs: 'cap-ingest',
  goal: 'answer questions from your own docs with hybrid search, numbered sources and citation chips that link to the source.',
  cards: [
    { t: 'read', h: 'Make the chat read before it answers',
      body: 'Your docs are in Postgres, but `/chat` ignores them. Ask about error E1043 and the model guesses.\n\nIn this step `/chat` searches first. [[hybrid search]] picks the best 5 chunks, the prompt numbers them, and the model must cite them. Answers get chips that link to the source. A question your docs can\'t answer gets an honest "I don\'t know".' },
    { t: 'viz', h: 'One question through hybrid search',
      nodes: {
        api: { x: 85, y: 190, w: 120, label: 'FastAPI', sub: 'POST /chat', kind: 'b' },
        emb: { x: 85, y: 65, w: 120, label: 'Embed query', sub: '1,536 dims', kind: 'c' },
        vec: { x: 280, y: 100, w: 140, label: 'Vector CTE', sub: '<=> · top 20', kind: 'c' },
        kw: { x: 280, y: 280, w: 140, label: 'Keyword CTE', sub: 'ts_rank · top 20', kind: 'd' },
        rrf: { x: 480, y: 190, w: 120, label: 'RRF merge', sub: '1/(60 + rank)', kind: 'b' },
        llm: { x: 690, y: 100, w: 130, label: 'LLM', sub: '[1]..[5] + rules', kind: 'c' },
        ans: { x: 690, y: 290, w: 150, label: 'Answer event', sub: 'citations', kind: 'a' }
      },
      edges: [['api', 'emb', { bi: true }], ['api', 'vec'], ['api', 'kw'], ['vec', 'rrf'], ['kw', 'rrf'], ['rrf', 'llm', 'top 5'], ['llm', 'ans', 'stream']],
      steps: [
        { cap: 'A question reaches `POST /chat`: "What does error E1043 mean?"', do: [['set', 'api', { state: 'active' }], ['note', 'api', 'E1043?']] },
        { cap: 'The API embeds the question with the same model used at ingest: 1,536 numbers.', do: [['send', 'api', 'emb', 'text'], ['send', 'emb', 'api', 'vector'], ['var', 'query', 'embedded']] },
        { cap: 'One SQL query runs two CTEs: the 20 nearest vectors by cosine distance, and the 20 best full-text matches.', do: [['send', 'api', 'vec', 'vector'], ['send', 'api', 'kw', 'words'], ['focus', 'vec', 'kw']] },
        { cap: 'Vector search ranks E1042 first and E1043 only #6. Keyword search ranks E1043 #1: the exact code matches.', do: [['set', 'vec', { state: 'warn', sub: 'E1043 at #6' }], ['set', 'kw', { state: 'ok', sub: 'E1043 at #1' }]] },
        { cap: '[[RRF]] adds 1/(60 + rank) from each list: 1/66 + 1/61 = 0.032. E1042 gets only 0.016. E1043 is #1.', do: [['send', 'vec', 'rrf'], ['send', 'kw', 'rrf'], ['set', 'rrf', { state: 'ok', sub: 'E1043 at #1' }], ['var', 'E1043 score', '0.032']] },
        { cap: 'The top 5 enter the prompt as [1]..[5], with the rule: answer only from sources, cite, or say you don\'t know.', do: [['send', 'rrf', 'llm', 'top 5'], ['set', 'llm', { state: 'active' }]] },
        { cap: 'The model streams "quota used up [1]". It also wrote [7], but only 5 were sent, so the server drops it.', do: [['send', 'llm', 'ans', 'deltas', 'ok'], ['set', 'ans', { state: 'ok', sub: 'cites [1] only' }], ['set', 'llm', { state: 'ok' }]] }
      ],
      predict: { at: 4, q: 'Vector search ranks the E1043 chunk #6. Keyword search ranks it #1. Where does it land after RRF?',
        options: ['#1: it scores in both lists', '#6: vector search wins ties', 'Nowhere: the lists disagree, so it is dropped'], answer: 0,
        why: 'RRF sums 1/(60 + rank) over the lists. Showing up in both (0.032) beats a single #1 in one list (0.016).' } },
    { t: 'read', h: 'Write the code: app/retrieve.py',
      body: 'One SQL query does both searches and the [[RRF]] merge. Then number the sources, and keep only citations you really sent.',
      code: String.raw`import asyncio, re
import numpy as np
from psycopg.rows import dict_row
from app.db import connect
from app.llm import client
from app.schemas import Citation
from app.settings import settings

SQL = """WITH vec AS (
  SELECT id, rank() OVER (ORDER BY embedding <=> %(emb)s) AS r
  FROM chunks ORDER BY embedding <=> %(emb)s LIMIT 20
), kw AS (
  SELECT id, rank() OVER (ORDER BY ts_rank(tsv, q) DESC) AS r
  FROM chunks, websearch_to_tsquery('english', %(text)s) q
  WHERE tsv @@ q ORDER BY ts_rank(tsv, q) DESC LIMIT 20
)
SELECT c.source, c.title, c.section, c.content,
       coalesce(1.0 / (60 + vec.r), 0) + coalesce(1.0 / (60 + kw.r), 0) AS score
FROM vec FULL JOIN kw USING (id) JOIN chunks c USING (id)
ORDER BY score DESC LIMIT %(k)s"""
SYSTEM = "You answer questions about our docs. Answer only from the sources. Cite like [2]. If unsure, say you don't know."

def _search(emb, text: str, k: int) -> list[dict]:
    with connect() as conn, conn.cursor(row_factory=dict_row) as cur:
        return cur.execute(SQL, {"emb": emb, "text": text, "k": k}).fetchall()

async def hybrid_search(query: str, k: int = 5) -> list[dict]:
    """Vector + keyword search in one SQL query, merged with RRF (k = 60)."""
    res = await client.embeddings.create(model=settings.embed_model, input=[query])
    return await asyncio.to_thread(_search, np.array(res.data[0].embedding), query, k)  # sync DB off the event loop

def build_messages(question: str, chunks: list[dict]) -> list[dict]:
    sources = "\n\n".join(f"[{i}] {c['title']} > {c['section']}\n{c['content']}" for i, c in enumerate(chunks, 1))
    return [{"role": "system", "content": SYSTEM},  # static prefix first: cacheable in step 7
            {"role": "user", "content": f"Sources:\n{sources}\n\nQuestion: {question}"}]

def cite(text: str, chunks: list[dict]) -> list[Citation]:
    """Keep only [n] markers that point at a source we really sent."""
    used = sorted({int(n) for n in re.findall(r"\[(\d+)\]", text)})
    return [Citation(n=n, source=chunks[n - 1]["source"], title=chunks[n - 1]["title"]) for n in used if 1 <= n <= len(chunks)]`, lang: 'python',
      points: [
        '`app/llm.py`: change `stream_chat(message: str)` to `stream_chat(messages: list[dict])` and pass `messages` straight to `create()`. The RAG prompt now owns the system prompt.',
        '`app/main.py`, in `chat()`: `chunks = await hybrid_search(body.message)`, then stream `stream_chat(build_messages(body.message, chunks))`. At the end: `Answer(text=full, citations=cite(full, chunks), followups=…)`.',
        '`app/main.py`: `app.mount("/files", StaticFiles(directory="../docs"), name="files")` so each source has a URL.',
        '`web/app/page.tsx`: render each citation as a link chip with text `[{c.n}] {c.title}` and `href={API + "/files/" + c.source}`.',
        '`tests/test_rag.py`: with 5 fake chunks, `cite("Quota [1], see [7].", chunks)` returns only `n=1`.'
      ] },
    { t: 'play', kind: 'controls', h: 'Rehearse: tune retrieval',
      body: 'Pick a question and a retriever. The list is what the prompt gets as numbered sources.',
      init: () => ({ hits: {} }),
      controls: [
        { id: 'q', type: 'select', label: 'Question', options: [P2_Q_MONEY, P2_Q_CODE, P2_Q_CRYPTO] },
        { id: 'mode', type: 'select', label: 'Retrieval', options: [P2_M_VEC, P2_M_KW, P2_M_HYB, P2_M_OFF] },
        { id: 'k', type: 'range', label: 'Top-k', min: 1, max: 5, value: 3, unit: 'sources' },
        { id: 'rule', type: 'toggle', label: 'Grounding rule', value: true }
      ],
      update: (s, io) => {
        const a = P2_answer(s.v);
        if (a.kind === 'ok') s.hits[s.v.mode + '|' + s.v.q] = true;
        if (s.v.mode === P2_M_VEC || s.v.mode === P2_M_HYB) io.send('q', 'vec');
        if (s.v.mode === P2_M_KW || s.v.mode === P2_M_HYB) io.send('q', 'kw');
        io.send('llm', 'ans', a.kind === 'ok' ? 'cited' : a.kind === 'idk' ? 'honest' : 'made up', a.kind === 'ok' ? 'ok' : a.kind === 'idk' ? undefined : 'bad');
      },
      view: s => {
        const a = P2_answer(s.v), Q = P2_QS[s.v.q], useV = s.v.mode === P2_M_VEC || s.v.mode === P2_M_HYB, useK = s.v.mode === P2_M_KW || s.v.mode === P2_M_HYB;
        const nodes = {
          q: { x: 75, y: 190, shape: 'pill', w: 120, label: 'Question', sub: Q.short, kind: 'a' },
          vec: { x: 235, y: 110, w: 120, label: 'Vector', sub: '<=> top 20', kind: 'c', state: useV ? undefined : 'off' },
          kw: { x: 235, y: 270, w: 120, label: 'Keyword', sub: 'ts_rank top 20', kind: 'd', state: useK ? undefined : 'off' },
          llm: { x: 700, y: 100, w: 120, label: 'LLM', sub: s.v.rule ? 'rule on' : 'no rule', kind: 'b' },
          ans: { x: 700, y: 290, w: 150, label: a.kind === 'ok' ? 'Cited ' + a.cite.split(' ')[0] : a.kind === 'idk' ? 'I don\'t know' : 'Hallucinated',
            sub: a.kind === 'ok' ? P2_CH[Q.need][0] : a.kind === 'idk' ? 'honest miss' : 'made up', kind: 'a', state: a.kind === 'ok' ? 'ok' : a.kind === 'idk' ? 'warn' : 'bad' }
        }, edges = [['q', 'vec', { dash: !useV }], ['q', 'kw', { dash: !useK }], ['llm', 'ans', { tone: a.kind === 'ok' ? 'ok' : a.kind === 'bad' ? 'bad' : undefined }]];
        if (!a.top.length) nodes.none = { x: 455, y: 190, w: 190, label: 'No sources', sub: 'prompt has 0 chunks', kind: 'n', state: 'off' };
        a.top.forEach((r, i) => {
          nodes['r' + i] = { x: 455, y: 50 + i * 70, w: 190, h: 40, label: '[' + (i + 1) + '] ' + P2_CH[r.id][0], sub: P2_CH[r.id][1] + ' · ' + r.score.toFixed(4).slice(1), kind: 'c', state: r.id === Q.need ? 'ok' : undefined };
          edges.push(['r' + i, 'llm', { dash: true, arrow: false }]);
        });
        return { nodes, edges, vars: { answer: a.text } };
      },
      readout: s => { const a = P2_answer(s.v); return [['Answer', a.text], ['Citations', a.cite], ['Sources sent', a.top.length]]; },
      goals: [
        { text: 'Get a **cited** answer to the E1043 question', check: s => s.v.q === P2_Q_CODE && P2_answer(s.v).kind === 'ok', solve: [{ q: P2_Q_CODE, mode: P2_M_KW }] },
        { text: 'Find the one retrieval mode that cites **both** the money and the E1043 questions', check: s => [P2_M_VEC, P2_M_KW, P2_M_HYB].some(m => s.hits[m + '|' + P2_Q_MONEY] && s.hits[m + '|' + P2_Q_CODE]),
          solve: [{ mode: P2_M_HYB, q: P2_Q_MONEY }, { q: P2_Q_CODE }] },
        { text: 'Break it: turn the grounding rule **off**, ask about crypto, and catch the hallucination', check: s => !s.v.rule && P2_answer(s.v).kind === 'bad', solve: [{ rule: false, q: P2_Q_CRYPTO }] }
      ],
      hints: ['Vector search ranks the E1043 chunk #6, past top-k. Which retriever matches exact codes?', 'Keyword search ANDs every word, so "money back" finds nothing. Try the mode that merges both lists.', 'Set Hybrid (RRF), check both questions, then switch Grounding rule off and pick the crypto question.'],
      done: 'Hybrid finds codes and paraphrases. The rule turns a miss into "I don\'t know", not a made-up answer.' },
    { t: 'check', h: 'Make it real: ask your own docs',
      body: 'Start the API from `docsbot/api` (`uv run uvicorn app.main:app --reload`) and the web app, then try these.',
      code: 'uv run python -c "import asyncio; from app.retrieve import hybrid_search as h; print([(r[\'source\'], r[\'section\']) for r in asyncio.run(h(\'What does error E1043 mean?\'))])"\ncurl -N -X POST localhost:8000/chat -H "Content-Type: application/json" -d \'{"message":"What does error E1043 mean?"}\'\nuv run pytest', lang: 'Shell',
      items: ['I printed `hybrid_search(...)` for a question with an exact code from my docs, and the right chunk was in the top 5.', 'I ran the `curl` and saw `delta` events, then an `answer` event with `citations`, then `[DONE]`.', 'I asked something my docs don\'t cover and DocsBot said it doesn\'t know.', 'The page shows citation chips, and clicking one opens the source file.', 'I ran `uv run pytest` and the test that drops `[7]` passes.'] },
    { t: 'quiz', q: 'You sent 5 numbered sources. The model streams "Refunds take 14 days [2][6]." What goes in `citations`?',
      options: ['Only [2]: [6] points at nothing you sent', 'Both [2] and [6]: the model wrote them', 'Nothing: one bad marker means the whole answer is untrusted', '[6] mapped to the 6th search result from the database'], answer: 0,
      why: 'The server checks every `[n]` against the sources it really sent. Valid ones become chips; the rest are dropped.',
      whyNot: { 1: 'The model can invent markers. Trusting them makes chips that link to nothing.', 2: 'Dropping the whole answer is too harsh. Keep the valid citation and drop the invalid one.', 3: 'The model never saw result #6, so it cannot have used it. That citation would be a lie.' } },
    { t: 'recap', points: ['`hybrid_search` runs a vector CTE and a keyword CTE in one query and merges them with [[RRF]] (k = 60).', 'Vector search catches paraphrases; keyword search catches exact codes. You need both.', 'Number the sources [1]..[5]. The rules say: answer only from them, cite, or say you don\'t know.', 'The server keeps only citations whose `n` was sent. The UI turns them into chips.'],
      cheat: [['embedding <=> %(emb)s LIMIT 20', 'vector candidates (cosine)'], ["websearch_to_tsquery('english', q)", 'keyword query from user text'], ['1.0 / (60 + rank)', 'RRF score per list, then sum'], ['curl -N -X POST localhost:8000/chat', 'watch the SSE stream (add -d body)'], ['uv run pytest', 'citation filter test passes']] }
  ]
};

;
// Capstone steps 6–7: the guarded ticket tool, then traces + evals + caching + ship.
const P3_GLOSS = {
  'idempotency key': 'A unique ID you attach to a request with side effects. If the same key arrives twice, the server does the work only once.',
  'CI gate': 'A required check on a pull request. If it fails, the change cannot merge or deploy.'
};

// ---------- Step 6: the guarded ticket tool ----------
const P3_MSGS = ['How do I reset my password?', 'My invoice is wrong, open a ticket', 'Invoice wrong, ticket please: sam@example.com'];
const P3_KEYS = ['7f3c', 'a91e', '52bd', 'c04f', 'e6a2', '3d18'];

const P3_TOOLS_PY = `# api/app/tools.py (part 1): the tool and its arguments
import logging, uuid
from pydantic import BaseModel, EmailStr, Field
from app.db import connect
from app.llm import client
from app.settings import settings

log = logging.getLogger("docsbot.tools")
MAX_STEPS = 4

class TicketRequest(BaseModel):  # what the model may fill in
    subject: str = Field(min_length=5, max_length=200, description="One-line summary")
    email: EmailStr = Field(description="The user's email, exactly as they wrote it")

class TicketArgs(TicketRequest):  # + a key made by the server, never by the model
    idempotency_key: str = Field(min_length=16)

TOOLS = [{"type": "function", "function": {
    "name": "open_ticket",
    "description": "Open a support ticket when the docs can't solve the problem.",
    "parameters": TicketRequest.model_json_schema()}}]

def open_ticket(subject: str, email: str, idempotency_key: str) -> dict:
    sql = ("INSERT INTO tickets (subject, email, idempotency_key) VALUES (%s, %s, %s) "
           "ON CONFLICT (idempotency_key) DO NOTHING RETURNING id, status")
    with connect() as conn:
        row = conn.execute(sql, (subject, email, idempotency_key)).fetchone()
        if row is None:  # key seen before: return that ticket, never a second one
            row = conn.execute("SELECT id, status FROM tickets WHERE idempotency_key = %s",
                               (idempotency_key,)).fetchone()
    log.info("open_ticket key=%s ticket=T-%s", idempotency_key, row[0])
    return {"ticket_id": f"T-{row[0]}", "status": row[1]}`;

const P3_LOOP_PY = `# api/app/tools.py (part 2): the guarded loop
async def run_agent(messages: list) -> dict:
    for step in range(1, MAX_STEPS + 1):
        res = await client.chat.completions.create(
            model=settings.llm_model, messages=messages, tools=TOOLS)
        msg = res.choices[0].message
        if not msg.tool_calls:
            return {"type": "text", "text": msg.content or ""}
        messages.append(msg)
        for call in msg.tool_calls:
            try:  # Pydantic's ValidationError is a ValueError
                if call.function.name != "open_ticket":
                    raise ValueError(f"unknown tool {call.function.name!r}; use open_ticket")
                req = TicketRequest.model_validate_json(call.function.arguments)
            except ValueError as e:  # a readable error goes back to the model
                log.warning("step %d bad tool call: %s", step, e)
                messages.append({"role": "tool", "tool_call_id": call.id,
                                 "content": f"Error: {e}. Fix the arguments or ask the user."})
                continue
            args = {**req.model_dump(), "idempotency_key": str(uuid.uuid4())}
            log.info("step %d waiting for confirm, key=%s", step, args["idempotency_key"])
            return {"type": "confirm", "tool": "open_ticket", "args": args}  # nothing ran yet
    return {"type": "text", "text": "Sorry, I couldn't finish that. Please try again."}

# api/app/main.py, inside /chat: replace the step 5 events() with the agent
    chunks = await asyncio.to_thread(hybrid_search, body.message)
    async def events():
        result = await run_agent(build_messages(body.message, chunks))
        if result["type"] == "confirm":
            yield sse(result)  # the UI asks "Open a ticket?"
        else:
            yield sse({"type": "delta", "text": result["text"]})
            answer = Answer(text=result["text"], citations=cite(result["text"], chunks))
            yield sse({"type": "answer", "answer": answer.model_dump()})
        yield "data: [DONE]\\n\\n"
class ConfirmRequest(BaseModel):
    args: TicketArgs  # validated again: never trust what the browser sends back
@app.post("/chat/confirm")
def confirm(req: ConfirmRequest) -> dict:  # plain def: FastAPI runs it in a thread
    return open_ticket(**req.args.model_dump())`;

const P3_agentView = s => {
  const nodes = {
    ui: { x: 100, y: 190, label: 'Chat UI', sub: (s.pending ? 'confirm ' : '') + '×' + (+s.v.clicks || 1), kind: 'a', state: s.pending ? 'warn' : undefined },
    api: { x: 300, y: 190, label: 'FastAPI', sub: '/chat', kind: 'b' },
    agent: { x: 510, y: 190, label: 'run_agent', sub: 'step ' + s.steps + ' / 4', kind: 'e', state: s.event === 'asked for email' ? 'warn' : undefined },
    key: { x: 300, y: 65, label: s.v.key ? 'ON CONFLICT on' : 'plain INSERT', kind: 'n', shape: 'pill', w: 150, state: s.v.key ? 'ok' : 'off' },
    llm: { x: 510, y: 65, label: 'LLM', sub: 'sees TOOLS', kind: 'c' },
    pg: { x: 700, y: 190, label: 'Postgres', sub: s.tickets.length + ' tickets', kind: 'c', shape: 'db' }
  };
  const edges = [['ui', 'api'], ['api', 'agent'], ['agent', 'llm'], ['agent', 'pg', 'INSERT']];
  s.tickets.slice(-3).forEach((t, i) => { nodes['t' + i] = { x: 400 + i * 150, y: 320, label: t.id, shape: 'pill', kind: 'n', state: t.dup ? 'bad' : 'ok' }; });
  return { nodes, edges, vars: { 'loop step': s.steps + ' / 4', tickets: s.tickets.length, key: s.v.key ? 'on' : 'off', clicks: +s.v.clicks || 1, event: s.event } };
};

const P3_agent = {
  id: 'cap-agent', title: 'Step 6: Let DocsBot act: a guarded ticket tool', mins: 12,
  goal: 'let DocsBot open a support ticket through a tool loop with a step cap, a confirm step and an idempotency key.',
  cards: [
    { t: 'read', h: 'From answering to doing',
      body: 'Sam writes: "My invoice is wrong. Can someone look?" DocsBot can quote the billing docs, but it can\'t help Sam yet.\n\nIn this step it learns one action: `open_ticket`. Three guards keep it safe: a step limit, a "yes" from the user before anything runs, and an [[idempotency key]] so a double-click never makes two tickets.' },
    { t: 'viz', h: 'One ticket, even on a double-click', body: 'Follow Sam\'s request through the [[agent]] loop and [[tool calling]].',
      nodes: {
        ui: { x: 100, y: 190, label: 'Chat UI', sub: 'web/', kind: 'a' },
        api: { x: 300, y: 190, label: 'FastAPI', sub: '/chat', kind: 'b' },
        agent: { x: 510, y: 190, label: 'run_agent', sub: 'MAX_STEPS = 4', kind: 'e' },
        llm: { x: 510, y: 65, label: 'LLM', sub: 'sees TOOLS', kind: 'c' },
        pg: { x: 700, y: 190, label: 'Postgres', sub: 'tickets', kind: 'c', shape: 'db' }
      },
      edges: [['ui', 'api'], ['api', 'agent'], ['agent', 'llm'], ['agent', 'pg']],
      vars: { 'loop step': '0 / 4', tickets: 0 },
      steps: [
        { cap: 'Sam types "Invoice wrong, ticket please: sam@example.com". The UI POSTs it to `/chat`.',
          do: [['send', 'ui', 'api', 'POST /chat'], ['send', 'api', 'agent', 'messages']] },
        { cap: '`run_agent` sends the messages plus `TOOLS`. The model replies with a tool call, not text.',
          do: [['send', 'agent', 'llm', '+ TOOLS'], ['send', 'llm', 'agent', 'open_ticket'], ['var', 'loop step', '1 / 4'], ['note', 'llm', 'tool_call: open_ticket(subject, email)']] },
        { cap: 'Pydantic checks the args. They pass, so the server adds an idempotency key. Nothing has run yet.',
          do: [['set', 'agent', { sub: 'key k-7f3c', state: 'ok' }], ['focus', 'agent']] },
        { cap: 'The server sends a `confirm` event. The UI shows "Open a ticket?" with Confirm and Cancel.',
          do: [['send', 'api', 'ui', 'confirm', 'warn'], ['set', 'ui', { sub: 'Confirm / Cancel', state: 'warn' }]] },
        { cap: 'Sam double-clicks Confirm. Two POSTs reach `/chat/confirm`, both with key `k-7f3c`.',
          do: [['send', 'ui', 'api', 'click 1'], ['send', 'ui', 'api', 'click 2'], ['set', 'ui', { state: 'active' }]] },
        { cap: 'Insert 1 creates T-1042. Insert 2 hits `ON CONFLICT DO NOTHING`, so the server returns T-1042 again.',
          do: [['send', 'agent', 'pg', 'INSERT'], ['send', 'pg', 'agent', 'T-1042', 'ok'], ['send', 'agent', 'pg', 'same key'], ['send', 'pg', 'agent', 'T-1042', 'ok'], ['set', 'pg', { sub: '1 row', state: 'ok' }], ['var', 'tickets', 1]] },
        { cap: 'Both clicks get T-1042. The UI says "Ticket T-1042 opened". The log records the key and the ID.',
          do: [['send', 'api', 'ui', 'T-1042', 'ok'], ['set', 'ui', { sub: 'T-1042 opened', state: 'ok' }]] }
      ],
      predict: { at: 5, q: 'Two requests, same key. How many rows end up in `tickets`?', options: ['One: T-1042', 'Two: T-1042 and T-1043', 'Zero: the requests cancel out'], answer: 0,
        why: 'The `UNIQUE` key turns the second INSERT into a no-op. The server reads the existing row and returns T-1042 again.' } },
    { t: 'read', h: 'Write the code: the table and the tool',
      body: 'First the side effect itself. The database, not the UI, enforces "one ticket per key". The model only sees `subject` and `email`. The server makes the key.',
      code: P3_TOOLS_PY, lang: 'Python',
      points: [
        'Run `uv add "pydantic[email]"` so `EmailStr` can check emails.',
        '`migrations/002_tickets.sql` creates `tickets`: `id` (identity, `START WITH 1001`), `subject`, `email`, `status` (default `\'open\'`) and `idempotency_key text NOT NULL UNIQUE`.',
        'Apply it from `api/` like step 4: `docker compose exec -T db psql -U docsbot -d docsbot < migrations/002_tickets.sql`.',
        '`tests/test_tools.py`: call `open_ticket("Invoice is wrong", "sam@example.com", "test-key-0001-abcd")` twice and assert both results are equal.'
      ] },
    { t: 'read', h: 'Write the code: the loop and the confirm step',
      body: 'The loop asks the model, validates any tool call, and stops at `MAX_STEPS`. A valid call does **not** run. It becomes a `confirm` event, and only `/chat/confirm` runs the tool.',
      code: P3_LOOP_PY, lang: 'Python',
      points: [
        '`main.py` imports: `asyncio`, plus `TicketArgs, open_ticket, run_agent` from `app.tools`. Turn on logs once: `logging.basicConfig(level=logging.INFO)`.',
        '`web/lib/answer.ts`: add a Zod `ConfirmEvent` with `type: z.literal("confirm")` and `args: { subject, email, idempotency_key }`.',
        '`web/app/page.tsx`: in the `onEvent` callback you pass to `streamChat`, handle `type === "confirm"`. Show "Open a ticket?" with **Confirm** and **Cancel**. Confirm disables itself, then POSTs `{ args }` to `/chat/confirm`.',
        'Trade-off: answers now arrive as one delta. Later, stream the first call and watch for tool-call deltas.'
      ] },
    { t: 'play', kind: 'controls', h: 'Rehearse: ask, confirm, retry',
      body: 'Pick a message and press **Send**. Then send 2–3 Confirm requests, key off and on.',
      init: () => ({ pending: null, tickets: [], next: 1042, steps: 0, event: 'idle', reply: '–', askedEmail: false, sawDup: false, last: null, keyN: 0 }),
      controls: [
        { id: 'msg', type: 'select', label: 'Message', options: P3_MSGS },
        { id: 'clicks', type: 'range', label: 'Confirm requests', min: 1, max: 3, value: 1, unit: 'sent' },
        { id: 'key', type: 'toggle', label: 'Idempotency key + ON CONFLICT' },
        { id: 'send', type: 'button', label: 'Send', run(s, io) {
          const m = s.v.msg || P3_MSGS[0];
          s.pending = null; s.steps = 1;
          io.send('ui', 'api', 'POST /chat'); io.send('api', 'agent', 'messages'); io.send('agent', 'llm', '+ TOOLS');
          if (m === P3_MSGS[0]) {
            io.send('llm', 'agent', 'text'); io.send('api', 'ui', 'answer [1]', 'ok');
            s.event = 'answer'; s.reply = 'Settings → Security → Reset password [1]'; return;
          }
          if (m === P3_MSGS[1]) {
            io.send('llm', 'agent', 'email=""'); io.send('agent', 'llm', 'Error: email', 'bad'); io.send('llm', 'agent', 'text'); io.send('api', 'ui', 'question', 'ok');
            io.note('agent', 'ValidationError → tool error');
            s.steps = 2; s.askedEmail = true; s.event = 'asked for email'; s.reply = 'Sure! Which email should the ticket use?'; return;
          }
          io.send('llm', 'agent', 'open_ticket'); io.send('api', 'ui', 'confirm', 'warn');
          s.pending = { key: 'k-' + P3_KEYS[s.keyN++ % P3_KEYS.length] };
          io.note('ui', 'Open a ticket? [Confirm] [Cancel]');
          s.event = 'confirm (' + s.pending.key + ')'; s.reply = 'Open a ticket? [Confirm] [Cancel]';
        } },
        { id: 'confirm', type: 'button', label: 'Confirm', run(s, io) {
          if (!s.pending) { s.event = 'nothing to confirm'; io.note('ui', 'Send a ticket request with an email first'); return; }
          const key = s.pending.key, tries = +s.v.clicks || 1;
          let created = 0, id = null;
          for (let i = 0; i < tries; i++) {
            io.send('ui', 'api', ['Confirm', 'click 2', 'retry'][i]); io.send('api', 'agent', 'open_ticket'); io.send('agent', 'pg', 'INSERT');
            const hit = s.v.key && s.tickets.find(t => t.key === key);
            if (hit) { id = hit.id; io.send('pg', 'agent', 'conflict: ' + hit.id, 'ok'); continue; }
            id = 'T-' + s.next++; created++;
            s.tickets.push({ id, key, dup: created > 1 });
            io.send('pg', 'agent', id, created > 1 ? 'bad' : 'ok');
          }
          io.send('api', 'ui', id, created > 1 ? 'bad' : 'ok');
          if (created > 1) { s.sawDup = true; io.note('pg', 'Duplicate! Same request, ' + created + ' tickets'); }
          s.last = { key: !!s.v.key, attempts: tries, created };
          s.pending = null; s.steps = 0;
          s.event = created > 1 ? 'DUPLICATE tickets' : 'ticket ' + id; s.reply = created > 1 ? 'Sam got 2 tickets for 1 problem' : 'Ticket ' + id + ' opened';
        } }
      ],
      presets: [{ label: 'Double-click, no key', v: { msg: P3_MSGS[2], clicks: 2, key: false } }, { label: 'Retry, with key', v: { msg: P3_MSGS[2], clicks: 3, key: true } }],
      view: P3_agentView,
      readout: s => [['Message', (s.v.msg || P3_MSGS[0])], ['DocsBot says', s.reply], ['Tickets in table', s.tickets.length]],
      goals: [
        { text: 'Ask for a ticket **without** an email: the bad args go back as a tool error, and DocsBot asks for your email', check: s => s.askedEmail, solve: [{ msg: P3_MSGS[1] }, 'send'] },
        { text: 'Include your email, press **Confirm**, and get exactly one ticket', check: s => !!s.last && s.last.attempts === 1 && s.last.created === 1, solve: [{ msg: P3_MSGS[2], clicks: 1 }, 'send', 'confirm'] },
        { text: 'Break it: a double-click or retry makes a duplicate. Then fix it so a retry still makes **one** ticket', check: s => s.sawDup && !!s.last && s.last.attempts >= 2 && s.last.created === 1, solve: [{ msg: P3_MSGS[2], clicks: 2, key: false }, 'send', 'confirm', { key: true }, 'send', 'confirm'] }
      ],
      hints: ['Pick "My invoice is wrong, open a ticket" and press Send. Watch what comes back from `run_agent`.', 'The confirm step needs a message that includes an email. Send it, then press Confirm.', 'Set Confirm requests to 2 (a double-click) with the key off. Then switch the key on, Send again and Confirm.'],
      done: 'Validate, confirm, then dedupe in the database. That is how real agents touch real data.' },
    { t: 'check', h: 'Make it real: open a ticket on your machine',
      body: 'Restart the API, then try it from the UI and from the terminal.',
      code: 'docker compose exec -T db psql -U docsbot -d docsbot < migrations/002_tickets.sql\nuv run uvicorn app.main:app --reload\ncurl -N --json \'{"message":"My invoice is wrong, open a ticket"}\' localhost:8000/chat\nuv run pytest tests/test_tools.py', lang: 'Shell',
      items: [
        'I applied `002_tickets.sql`, and `\\d tickets` shows a unique index on `idempotency_key`.',
        'I asked for a ticket with no email, and DocsBot asked me for my email.',
        'With my email, the UI showed "Open a ticket?", and no row existed until I clicked Confirm.',
        'I double-clicked Confirm, and `SELECT count(*) FROM tickets` went up by one, not two.',
        'I ran `uv run pytest tests/test_tools.py` and the same-key test passed.'
      ] },
    { t: 'quiz', q: 'Sam double-clicks **Confirm**. Both requests carry key `k-7f3c`. What guarantees only one ticket?',
      options: ['The `UNIQUE` index on `idempotency_key` plus `ON CONFLICT DO NOTHING`', 'Disabling the button after the first click', '`MAX_STEPS = 4` in the agent loop', 'Asking the model to check for duplicates first'], answer: 0,
      why: 'Only the database sees every request. A unique key makes the second insert a no-op, so the call is [[idempotent]].',
      whyNot: { 1: 'Good UX, so keep it. But a network retry or a second tab still sends twice.', 2: 'The step cap stops a runaway loop. `/chat/confirm` never goes through the loop.', 3: 'The model cannot see the table, and it is not a lock. Two requests can both "check" before either inserts.' } },
    { t: 'recap', points: [
      'Tools are a JSON-schema list (`TOOLS`). The model only asks; your code validates with [[Pydantic]] and decides.',
      'The loop stops at `MAX_STEPS = 4`. Bad args go back as readable errors, so the model fixes them or asks the user.',
      'Nothing with side effects runs until the user clicks Confirm on the `confirm` event.',
      'An [[idempotency key]] with `UNIQUE` and `ON CONFLICT DO NOTHING` makes double-clicks and retries safe.'
    ],
      cheat: [
        ['uv add "pydantic[email]"', 'Add EmailStr for tool args'],
        ['ON CONFLICT (idempotency_key) DO NOTHING', 'Insert once per key'],
        ['uv run pytest tests/test_tools.py', 'Same key twice → one ticket'],
        ['SELECT count(*) FROM tickets;', 'Count rows after a double-click']
      ] }
  ]
};

// ---------- Step 7: traces, evals, caching, ship ----------
const P3_RUN_PY = `import json, os, sys
from pathlib import Path
import httpx
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
load_dotenv(find_dotenv(usecwd=True))
ROOT = Path(__file__).resolve().parent.parent
judge = OpenAI(base_url=os.getenv("LLM_BASE_URL") or None, api_key=os.environ["LLM_API_KEY"])
RUBRIC = """You are a strict grader. Reply with JSON only: {"faithful": bool, "has_facts": bool}.
faithful: every claim in ANSWER is stated in SOURCES; one unsupported claim means false, "I don't know" is faithful.
has_facts: ANSWER states every item in FACTS."""

def ask(question: str) -> dict:
    with httpx.stream("POST", os.getenv("API_URL", "http://localhost:8000") + "/chat", json={"message": question}, timeout=60) as r:
        for line in r.iter_lines():
            event = json.loads(line[6:]) if line.startswith("data: {") else {}
            if event.get("type") == "answer":
                return event["answer"]
    raise RuntimeError(f"no answer event for {question!r}")

def grade(row: dict) -> dict:
    ans = ask(row["question"])
    cited = {Path(c["source"]).name for c in ans["citations"]}
    sources = "\\n\\n".join(p.read_text() for n in sorted(cited) if (p := ROOT / "docs" / n).exists()) or "(none)"
    out = judge.chat.completions.create(
        model=os.getenv("JUDGE_MODEL") or os.environ["LLM_MODEL"], temperature=0,
        response_format={"type": "json_object"}, messages=[
            {"role": "system", "content": RUBRIC},
            {"role": "user", "content": f"SOURCES:\\n{sources}\\n\\nFACTS: {row['expected_facts']}\\n\\nANSWER:\\n{ans['text']}"}])
    v, must = json.loads(out.choices[0].message.content), row["must_cite"]
    return {"cited": must in cited if must else not cited,
            "faithful": v.get("faithful") is True, "facts": v.get("has_facts") is True}
rows = [json.loads(line) for line in (ROOT / "evals/golden.jsonl").read_text().splitlines() if line.strip()]
res = [grade(row) for row in rows]
rate = lambda key: sum(r[key] for r in res) / len(res)
print(f"faithfulness   {rate('faithful'):.2f}  (gate 0.90)\\ncitation_rate  {rate('cited'):.2f}\\n"
      f"pass_rate      {sum(all(r.values()) for r in res) / len(res):.2f}")
for row, r in zip(rows, res):
    if not all(r.values()): print("FAIL", row["question"], r)
sys.exit(0 if rate("faithful") >= 0.90 else 1)`;

const P3_CI_YML = `# .github/workflows/evals.yml
name: evals
on: pull_request
jobs:
  evals:
    runs-on: ubuntu-latest
    services:
      db:
        image: pgvector/pgvector:pg16
        env: { POSTGRES_USER: docsbot, POSTGRES_PASSWORD: docsbot, POSTGRES_DB: docsbot }
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 5s --health-retries 10
    env:
      DATABASE_URL: postgresql://docsbot:docsbot@localhost:5432/docsbot
      LLM_API_KEY: \${{ secrets.LLM_API_KEY }}
      LLM_MODEL: \${{ vars.LLM_MODEL }}
      EMBED_MODEL: \${{ vars.EMBED_MODEL }}
      LANGFUSE_PUBLIC_KEY: \${{ secrets.LANGFUSE_PUBLIC_KEY }}
      LANGFUSE_SECRET_KEY: \${{ secrets.LANGFUSE_SECRET_KEY }}
      LANGFUSE_HOST: https://cloud.langfuse.com
    defaults:
      run: { working-directory: api }
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v6
      - run: uv sync --locked
      - run: psql "$DATABASE_URL" -f migrations/001_init.sql -f migrations/002_tickets.sql
      - run: uv run python ingest.py ../docs
      - run: uv run uvicorn app.main:app --port 8000 &
      - run: curl --retry 10 --retry-connrefused --retry-delay 2 localhost:8000/health
      - run: uv run python ../evals/run.py`;

const P3_RUNS = {
  good: { faith: 0.95, cite: 1.00, pass: 0.95, fails: ['FAIL Can I pay by bank transfer? {\'cited\': True, \'faithful\': False, \'facts\': True}'] },
  bad: { faith: 0.80, cite: 0.85, pass: 0.75, fails: [
    'FAIL Do you ship to Canada? {\'cited\': False, \'faithful\': False, \'facts\': True}',
    'FAIL What is the refund window? {\'cited\': True, \'faithful\': False, \'facts\': True}',
    'FAIL Is there a student discount? {\'cited\': False, \'faithful\': False, \'facts\': False}',
    '… 2 more FAIL lines'] }
};
const P3_isBad = s => s.branch === 'friendly-tone' && !s.fixed;

const P3_shipView = s => {
  const r = s.lastRun, bad = r && r.code === 1;
  return {
    nodes: {
      stack: { x: 110, y: 120, label: 'API + Postgres', sub: s.up ? 'docker compose' : 'not running', kind: 'b', w: 150, state: s.up ? 'ok' : 'off' },
      evals: { x: 360, y: 120, label: 'evals/run.py', sub: '20 golden rows', kind: 'd', w: 140, state: r ? (bad ? 'bad' : 'ok') : undefined },
      judge: { x: 620, y: 65, label: 'Judge LLM', sub: 'temperature 0', kind: 'c' },
      gate: { x: 620, y: 190, label: 'Gate', sub: r ? 'exit ' + r.code : 'faith ≥ 0.90', kind: 'n', state: r ? (bad ? 'bad' : 'ok') : undefined },
      branch: { x: 110, y: 270, label: s.branch, sub: P3_isBad(s) ? 'prompt changed' : s.fixed && s.branch !== 'main' ? 'reverted' : 'clean', kind: 'a', w: 150 },
      pr: { x: 360, y: 270, label: 'PR check', sub: s.branch === 'main' ? 'no PR' : r && r.branch === s.branch ? (bad ? 'evals ✕' : 'evals ✓') : 'pending', kind: 'n', w: 140, state: s.branch !== 'main' && r && r.branch === s.branch ? (bad ? 'bad' : 'ok') : undefined }
    },
    edges: [['evals', 'stack', '/chat'], ['evals', 'judge', 'grade'], ['evals', 'gate', 'score'], ['branch', 'pr']],
    vars: { branch: s.branch, faithfulness: r ? r.faith.toFixed(2) : '–', exit: r ? r.code : '–' }
  };
};

const P3_ship = {
  id: 'cap-ship', title: 'Step 7: Ship with confidence: traces, evals, caching', mins: 12, needs: 'cap-agent',
  goal: 'trace every request, block bad prompt changes in CI with evals, cache the prompt prefix, and run DocsBot with one `docker compose up`.',
  cards: [
    { t: 'read', h: 'Will it still work next week?',
      body: 'DocsBot works on your laptop today. But next week someone tweaks the prompt "to sound friendlier". Does it still stick to your docs, or is that a silent [[regression]]?\n\nIn this last step you add the safety net real teams use: a [[trace]] for every request, an [[eval]] suite that blocks bad pull requests, [[prompt caching]] to cut cost, and one `docker compose up` to run it all.' },
    { t: 'viz', h: 'A pull request meets the eval gate', body: 'Follow one prompt change from PR to merge.',
      nodes: {
        pr: { x: 100, y: 65, label: 'Pull request', sub: 'edits prompt', kind: 'a' },
        ci: { x: 330, y: 65, label: 'evals.yml', sub: 'GitHub Actions', kind: 'd' },
        judge: { x: 600, y: 65, label: 'Judge LLM', sub: 'temperature 0', kind: 'c' },
        gate: { x: 100, y: 190, label: 'Merge', sub: 'waiting', kind: 'n' },
        api: { x: 330, y: 190, label: 'DocsBot API', sub: '@observe()', kind: 'b' },
        llm: { x: 600, y: 190, label: 'LLM', sub: 'static prefix', kind: 'c' },
        lf: { x: 330, y: 315, label: 'Langfuse', sub: 'traces', kind: 'd' }
      },
      edges: [['pr', 'ci'], ['ci', 'api', '20 questions'], ['api', 'llm'], ['api', 'lf', { label: 'spans', dash: true }], ['ci', 'judge'], ['ci', 'gate']],
      vars: { faithfulness: '–' },
      steps: [
        { cap: 'You open a PR that edits the system prompt. GitHub Actions starts `evals.yml`.',
          do: [['send', 'pr', 'ci', 'pull_request'], ['set', 'ci', { state: 'active' }]] },
        { cap: '`run.py` POSTs each of the 20 golden questions to `/chat`, like a real user.',
          do: [['send', 'ci', 'api', 'q01 … q20']] },
        { cap: 'Each request becomes a trace: one span for retrieval, the model and tools, with latency and cost.',
          do: [['send', 'api', 'llm', 'prompt'], ['send', 'llm', 'api', 'answer'], ['send', 'api', 'lf', 'spans'], ['note', 'lf', '/chat · 1.9 s · $0.0021']] },
        { cap: 'The system prompt comes first and never changes. So most input tokens are a cache hit.',
          do: [['set', 'llm', { sub: 'prefix cached', state: 'ok' }], ['note', 'llm', '1,280 of 1,610 tokens cached'], ['var', 'cached', '79%']] },
        { cap: 'The judge grades each answer against its cited docs, with a strict rubric at [[temperature]] 0.',
          do: [['send', 'ci', 'judge', 'answer + docs'], ['send', 'judge', 'ci', 'faithful?'], ['set', 'judge', { state: 'ok' }]] },
        { cap: 'Faithfulness 0.80 is under 0.90, so `run.py` exits 1. The required check fails: merge blocked.',
          do: [['send', 'ci', 'gate', 'exit 1', 'bad'], ['set', 'gate', { sub: 'blocked', state: 'bad' }], ['set', 'ci', { state: 'bad' }], ['var', 'faithfulness', '0.80']] },
        { cap: 'You fix the prompt and push. Faithfulness 0.95, exit 0. The check turns green and you merge.',
          do: [['send', 'ci', 'gate', 'exit 0', 'ok'], ['set', 'gate', { sub: 'merged', state: 'ok' }], ['set', 'ci', { state: 'ok' }], ['var', 'faithfulness', '0.95']] }
      ],
      predict: { at: 5, q: 'The judge scores faithfulness at 0.80. What happens to the PR?', options: ['Merge is blocked: `run.py` exits 1 and the check fails', 'It merges, with a warning in the log', 'CI reruns the evals until they pass'], answer: 0,
        why: 'The script exits 1 under 0.90. A required check with a non-zero exit is a [[CI gate]]: the PR cannot merge.' } },
    { t: 'read', h: 'Write the code: traces and evals',
      body: 'Traces show what happened in one request. Evals show if quality held across 20. `evals/run.py` talks to the API over HTTP, the same contract the UI uses, and exits 1 under 0.90.',
      code: P3_RUN_PY, lang: 'Python',
      points: [
        'Run `uv add langfuse`. Put `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` and `LANGFUSE_HOST` in `.env`, and placeholders in `.env.example`.',
        'Add `langfuse_public_key`, `langfuse_secret_key` and `langfuse_host` to `Settings`. In `main.py`, create `Langfuse(public_key=…, secret_key=…, host=…)` once at startup.',
        '`from langfuse import observe`. Put `@observe()` on `hybrid_search`, `run_agent` and `open_ticket`, and `@observe(name="chat")` on the `events()` generator in `/chat`.',
        'In `app/llm.py`, import `AsyncOpenAI` from `langfuse.openai`. Model calls then log tokens and cost.',
        '`evals/golden.jsonl` is your [[golden dataset]]: 20 lines like `{"question": "How long do refunds take?", "must_cite": "refunds.md", "expected_facts": ["5–7 business days"]}`. Write 18 from your docs and 2 they can\'t answer (`"must_cite": null`).'
      ] },
    { t: 'read', h: 'Write the code: CI, caching and ship',
      body: 'CI runs the same evals on every pull request. Then two small changes make DocsBot cheaper and easy to run anywhere.',
      code: P3_CI_YML, lang: 'YAML',
      points: [
        'On GitHub, add the secrets and variables named in the file. Then make `evals` a required check in branch protection.',
        'Prompt caching: keep `messages` in a fixed order. System prompt and rules first, then sources `[1]..[5]`, then the question. No dates or names in the system prompt.',
        'OpenAI caches a prefix of 1,024+ tokens by itself. Check `usage.prompt_tokens_details.cached_tokens` in the trace.',
        '`api/Dockerfile`: `FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim`, `WORKDIR /app`, copy the code, `RUN uv sync --locked --no-dev`, then `CMD` runs uvicorn on `--host 0.0.0.0`.',
        '`docker-compose.yml`: add an `api` service: `build: ./api`, `env_file: .env`, `ports: ["8000:8000"]`, `depends_on: [db]`, and `volumes: ["./docs:/docs:ro"]` for `/files`. Its `DATABASE_URL` uses host `db`, not `localhost`.'
      ] },
    { t: 'play', kind: 'terminal', h: 'Rehearse: the eval gate',
      body: 'You are in `docsbot/api`. Run the evals, break the prompt on a branch, then fix it.',
      size: [800, 340],
      prompt: 'docsbot/api $',
      init: () => ({ up: false, branch: 'main', fixed: false, runs: [], lastRun: null, code: 0 }),
      cmds: [
        { re: /^docker\s+compose\s+up(\s+-d)?(\s+--build)?(\s+-d)?$/i, help: 'docker compose up -d --build', desc: 'start the API and Postgres', run(m, s, io) {
          s.up = true; s.code = 0;
          return '[+] Running 2/2\n ✔ Container docsbot-db-1   Healthy\n ✔ Container docsbot-api-1  Started';
        } },
        { re: /^curl\s+(-s\s+)?(http:\/\/)?localhost:8000\/health$/i, help: 'curl localhost:8000/health', desc: 'is the API up?', run(m, s) {
          if (!s.up) { s.code = 7; return { err: 'curl: (7) Failed to connect to localhost port 8000: Connection refused' }; }
          s.code = 0; return '{"status":"ok"}';
        } },
        { re: /^uv\s+run\s+(python\s+)?(\.\.\/)?evals\/run\.py$/i, help: 'uv run python ../evals/run.py', desc: 'grade the golden set', run(m, s, io) {
          if (!s.up) { s.code = 1; return { err: 'httpx.ConnectError: [Errno 61] Connection refused\nIs the API running? Try: docker compose up -d --build' }; }
          const bad = P3_isBad(s), d = bad ? P3_RUNS.bad : P3_RUNS.good, code = bad ? 1 : 0;
          s.code = code; s.lastRun = { branch: s.branch, fixed: s.fixed, code, faith: d.faith }; s.runs.push(s.lastRun);
          io.send('evals', 'stack', '20 × /chat'); io.send('evals', 'judge', 'grade'); io.send('evals', 'gate', 'exit ' + code, bad ? 'bad' : 'ok');
          const out = 'faithfulness   ' + d.faith.toFixed(2) + '  (gate 0.90)\ncitation_rate  ' + d.cite.toFixed(2) + '\npass_rate      ' + d.pass.toFixed(2) + '\n' + d.fails.join('\n');
          return bad ? { out, err: 'faithfulness < 0.90 → exit 1' } : out;
        } },
        { re: /^echo\s+\$\?$/, help: 'echo $?', desc: 'exit code of the last command', run: (m, s) => String(s.code) },
        { re: /^git\s+(switch|checkout)\s+([\w-]+)$/i, help: 'git switch <branch>', desc: 'change branch (main, friendly-tone)', run(m, s) {
          const b = m[2];
          if (b !== 'main' && b !== 'friendly-tone') return { err: 'fatal: invalid reference: ' + b + '. Branches: main, friendly-tone' };
          s.branch = b; s.code = 0;
          return "Switched to branch '" + b + "'" + (b === 'friendly-tone' && !s.fixed ? '\nlast commit: prompt: friendlier tone, fill gaps from general knowledge' : '');
        } },
        { re: /^git\s+diff(\s+main)?$/i, help: 'git diff main', desc: 'what this branch changed', run(m, s) {
          s.code = 0;
          if (!P3_isBad(s)) return '(no changes)';
          return 'diff --git a/api/app/retrieve.py b/api/app/retrieve.py\n-SYSTEM = ("You answer questions about our product docs. Answer only from the sources. "\n+SYSTEM = ("You are DocsBot, a friendly helper! If the sources are thin, use what you know. "';
        } },
        { re: /^git\s+revert(\s+--no-edit)?\s+HEAD$/i, help: 'git revert --no-edit HEAD', desc: 'undo the last commit with a new commit', run(m, s) {
          if (!P3_isBad(s)) return { err: 'nothing to revert here. Switch to friendly-tone first.' };
          s.fixed = true; s.code = 0;
          return '[friendly-tone 9c1e2d4] Revert "prompt: friendlier tone, fill gaps from general knowledge"\n 1 file changed, 1 insertion(+), 1 deletion(-)';
        } },
        { re: /^gh\s+pr\s+checks$/i, help: 'gh pr checks', desc: 'CI status of this branch\'s PR', run(m, s) {
          if (s.branch === 'main') return { err: 'no pull requests found for branch "main"' };
          const r = s.lastRun && s.lastRun.branch === s.branch && s.lastRun.fixed === s.fixed ? s.lastRun : null;
          if (!r) return 'evals  pending  0s  .github/workflows/evals.yml';
          return r.code ? 'evals  fail  2m14s  faithfulness 0.80 < 0.90' : 'evals  pass  2m09s  faithfulness 0.95';
        } }
      ],
      try: ['docker compose up -d --build', 'uv run python ../evals/run.py', 'git switch friendly-tone', 'git diff main'],
      view: P3_shipView,
      goals: [
        { text: 'Start the stack and run the evals on `main`: faithfulness ≥ 0.90 and exit 0', check: s => s.runs.some(r => r.branch === 'main' && r.code === 0), solve: ['docker compose up -d --build', 'uv run python ../evals/run.py'] },
        { text: 'Switch to `friendly-tone`, run the evals, and watch the gate fail with exit 1', check: s => s.runs.some(r => r.branch === 'friendly-tone' && r.code === 1), solve: ['git switch friendly-tone', 'uv run python ../evals/run.py'] },
        { text: 'Find the bad line with `git diff main`, fix the branch, and get exit 0 again', check: s => s.runs.some(r => r.branch === 'friendly-tone' && r.fixed && r.code === 0), solve: ['git diff main', 'git revert --no-edit HEAD', 'uv run python ../evals/run.py'] }
      ],
      hints: ['The evals call the live API. Start it with `docker compose up -d --build` first.', 'Run `git switch friendly-tone`, then the same eval command. Check `echo $?`.', 'Run `git diff main`. The new line drops "answer only from the sources". Undo it with `git revert --no-edit HEAD`, then rerun.'],
      done: 'In real life you would keep the friendly tone and restore the sources-only rule. The gate tells you; you decide.' },
    { t: 'check', h: 'Make it real: ship DocsBot',
      body: 'Run these from `docsbot/api`. Open a pull request to see the gate.',
      code: 'docker compose up -d --build\ncurl localhost:8000/health\nuv run python ../evals/run.py; echo $?\ngh pr checks', lang: 'Shell',
      items: [
        'I found a `/chat` trace in Langfuse with retrieval, model and tool spans, plus latency and cost.',
        'I wrote 20 rows in `evals/golden.jsonl`, and `run.py` printed faithfulness ≥ 0.90 and exited 0.',
        'I opened a PR with a worse prompt, and the `evals` check went red. Then I fixed it.',
        'My `messages` start with the unchanged system prompt. Sources and the question come last.',
        'After `docker compose up -d --build`, `curl localhost:8000/health` returned `{"status":"ok"}`.'
      ] },
    { t: 'quiz', q: 'Which `messages` order gets the most [[prompt caching]] hits across users?',
      options: ['System prompt and rules, then sources [1]..[5], then the question', 'The question first, then sources, then the system prompt', 'A system prompt that starts with today\'s date and the user\'s name, then sources and question', 'Sources first, then the system prompt, then the question'], answer: 0,
      why: 'A cache matches the prompt from its first token. Put the parts that never change first, and the parts that change every time last.',
      whyNot: { 1: 'The question changes every time. Putting it first breaks the match at token one.', 2: 'A date or a name makes the prefix different for every user and every day. No cache hits.', 3: 'Sources differ per question, so the prefix differs. The static system prompt never gets reused.' } },
    { t: 'recap', h: 'You shipped DocsBot!', points: [
      'You built a real AI product: streaming chat, typed answers, hybrid RAG with citations, a guarded tool, traces and an eval gate.',
      '`@observe()` turns each request into a [[trace]]: one [[span]] per step, with latency, tokens and cost.',
      '`run.py` grades 20 golden questions with code checks and a strict [[LLM-as-a-judge]] at temperature 0. CI blocks merges under 0.90 [[faithfulness]].',
      'Static prefix first, changing parts last: that order makes [[prompt caching]] work.',
      'For your portfolio README: a 30-second demo GIF, the architecture board, `docker compose up` steps, your eval scores with the CI badge, a trace screenshot, and what you would build next.'
    ],
      cheat: [
        ['uv run python ../evals/run.py', 'Grade the golden set; exit 1 < 0.90'],
        ['gh pr checks', 'See the evals check on your PR'],
        ['docker compose up -d --build', 'Run the API and Postgres together'],
        ['@observe()', 'Trace a function as a Langfuse span'],
        ['git revert --no-edit HEAD', 'Undo the last commit safely']
      ] }
  ]
};

;
// Glossary deep dives, batch 1: tokens, sampling, retries, cost, model size. Top-level names start with DEEP_1 / G1_.
const G1_n = x => Math.round(x).toLocaleString('en-US');
// A bar node: x = centre, y = baseline, h = height in px.
const G1_bar = (x, h, label, sub, more) => Object.assign({ x, y: 280, h: Math.max(1, Math.round(h)), w: 70, shape: 'bar', label, sub, kind: 'a' }, more || {});
// Numerically safe softmax with temperature. T = 0 means greedy: all mass on the top logit.
function G1_softmax(z, T) {
  if (T === 0) { const m = z.indexOf(Math.max(...z)); return z.map((_, i) => (i === m ? 1 : 0)); }
  const m = Math.max(...z), e = z.map(v => Math.exp((v - m) / T)), s = e.reduce((a, b) => a + b, 0);
  return e.map(v => v / s);
}
const G1_TOK = ['mat', 'sofa', 'floor', 'moon'], G1_Z = [3, 2, 1, 0];
// Fixed "random" draws so the jitter lab is repeatable.
const G1_R = [0.62, 0.17, 0.85, 0.4, 0.93, 0.08, 0.55];

const DEEP_1 = {
  'token': {
    intuition: 'A model never sees letters or words. It sees [[token|tokens]]: chunks of text such as `the`, `ing` or ` hello`. Common words are one token. Rare words, code and names split into several.\n\nYou cannot count tokens by eye, but you can estimate them. In English, one token is about **4 characters**, or about **0.75 words**. Use the estimate to plan, then count exactly with a [[tokenizer]] before you send.\n\nEvery part of a request shares one [[context window]]: system prompt, documents, chat history **and** the answer the model writes.',
    formula: ['\\text{tokens} \\approx \\frac{\\text{characters}}{4} \\approx \\frac{\\text{words}}{0.75}', 'T_{\\text{sys}} + T_{\\text{docs}} + T_{\\text{history}} + T_{\\text{out}} \\le W'],
    symbols: [['\\text{characters}', 'length of the text, spaces included (`text.length` in JS)'], ['\\text{words}', 'number of words. Dividing by 0.75 is the same as multiplying by about 1.33'], ['T_{\\text{out}}', 'tokens you reserve for the answer (`max_tokens`)'], ['W', 'the context window size in tokens, for example 8,000 or 128,000']],
    figure: { h: 'Filling an 8,000-token window', size: [800, 330],
      nodes: { win: G1_bar(690, 240, 'Window', '8,000 tok', { kind: 'n', y: 290 }) },
      vars: { used: 0 },
      steps: [
        { cap: 'System prompt: 300 words ÷ 0.75 ≈ 400 tokens.', do: [['add', 'sys', G1_bar(90, 12, 'System', '400 tok', { y: 290, kind: 'b' })], ['var', 'used', '400']] },
        { cap: 'Documents: 12,000 characters ÷ 4 ≈ 3,000 tokens.', do: [['add', 'docs', G1_bar(200, 90, 'Docs', '3,000 tok', { y: 290, kind: 'c' })], ['var', 'used', '3,400']] },
        { cap: 'Chat history: 1,500 words ÷ 0.75 ≈ 2,000 tokens.', do: [['add', 'hist', G1_bar(310, 60, 'History', '2,000 tok', { y: 290, kind: 'd' })], ['var', 'used', '5,400']] },
        { cap: 'Reserve 1,000 tokens for the answer. The output shares the same window.', do: [['add', 'out', G1_bar(420, 30, 'Output', '1,000 tok', { y: 290, kind: 'e' })], ['var', 'used', '6,400']] },
        { cap: 'Total: 6,400 ≤ 8,000. It fits, with 1,600 tokens to spare.', do: [['add', 'used', G1_bar(560, 192, 'Used', '6,400 tok', { y: 290, state: 'ok' })], ['focus', 'used', 'win']] },
        { cap: 'Paste 10,000 more characters (+2,500 tokens): 8,900 > 8,000. The call fails or the answer gets cut off.', do: [['set', 'docs', { h: 165, sub: '5,500 tok' }], ['set', 'used', { h: 267, sub: '8,900 tok', state: 'bad' }], ['var', 'used', '8,900']] }
      ] },
    example: { given: 'A support bot sends a 600-word system prompt, 3 documents of 2,000 characters each, 900 words of chat history and a 30-word question. It reserves 500 tokens for the answer. Input costs $3 per 1M tokens.',
      steps: ['System prompt: \\(600 / 0.75 = 800\\) tokens.', 'Documents: \\(3 \\times 2000 = 6000\\) characters, and \\(6000 / 4 = 1500\\) tokens.', 'History: \\(900 / 0.75 = 1200\\) tokens. Question: \\(30 / 0.75 = 40\\) tokens.', 'Input: \\(800 + 1500 + 1200 + 40 = 3540\\) tokens. Add the 500 reserved for output: 4,040 tokens in the window.', 'Input cost: \\(3540 \\times 3 / 1000000 = 0.01062\\), about one cent per call.'],
      result: 'About 4,040 of the window is used, and each call costs about $0.011 for input. Count exactly with the tokenizer before you rely on it.' },
    lab: { h: 'Will it fit?', body: 'Set how many words you send and how much room you keep for the answer. Pick a window size.', size: [800, 320],
      controls: [{ id: 'words', type: 'range', label: 'Words of input', min: 0, max: 100000, step: 500, value: 20000 }, { id: 'out', type: 'range', label: 'Reserved for output (tokens)', min: 0, max: 8000, step: 500, value: 2000 }, { id: 'win', type: 'select', label: 'Context window', options: ['8,000', '32,000', '128,000'], value: '32,000' }],
      view: s => { const W = +s.v.win.replace(/,/g, ''), inp = Math.round(s.v.words / 0.75), tot = inp + s.v.out, k = 240 / Math.max(W, tot);
        return { nodes: { in: G1_bar(150, inp * k, 'Input', G1_n(inp), { y: 290, w: 90, kind: 'c' }), out: G1_bar(300, s.v.out * k, 'Output', G1_n(s.v.out), { y: 290, w: 90, kind: 'e' }), tot: G1_bar(470, tot * k, 'Total', G1_n(tot), { y: 290, w: 90, state: tot <= W ? 'ok' : 'bad' }), win: G1_bar(640, W * k, 'Window', G1_n(W), { y: 290, w: 90, kind: 'n' }) },
          vars: { 'input ≈ words ÷ 0.75': G1_n(inp), left: G1_n(W - tot) } }; },
      readout: s => { const W = +s.v.win.replace(/,/g, ''), tot = Math.round(s.v.words / 0.75) + s.v.out; return [['Fits', tot <= W ? 'yes' : 'no, over by ' + G1_n(tot - W)]]; } },
    pitfalls: ['The 4-characters rule is for English. Code, JSON, numbers and languages like Bangla, Hindi or Chinese use more tokens per character. Count with the tokenizer.', 'Forgetting the output. If input fills the window, the answer has no room and gets cut off.', 'Each model family has its own tokenizer. The same text can be a different number of tokens on another provider.'],
    code: 'import tiktoken\n\ndef estimate(text: str) -> int:\n    return round(len(text) / 4)          # quick plan\n\nenc = tiktoken.get_encoding("o200k_base")\ndef count(text: str) -> int:\n    return len(enc.encode(text))         # exact for this tokenizer',
    lang: 'Python'
  },

  'BPE': {
    intuition: 'Byte-pair encoding builds a [[tokenizer]] vocabulary from data. Start with single characters (really, single bytes). Count every pair of neighbours in the training text. Glue the most common pair into one new token. Repeat until you have as many tokens as you want.\n\nFrequent words end up as one token because their pairs keep winning. Rare words stay split into smaller pieces. Nothing is ever "unknown": in the worst case a word is spelled out byte by byte.\n\nTo tokenize new text, the tokenizer replays the learned merges in the same order.',
    formula: ['(a, b)^{*} = \\argmax_{(a, b)} \\text{count}(a, b)', 'a \\, b \\to ab \\quad \\text{(merge everywhere, then recount)}'],
    symbols: [['(a, b)', 'two tokens that sit next to each other, like `l` then `o`'], ['\\text{count}(a, b)', 'how often that pair appears, counting each word as many times as it occurs'], ['ab', 'the new token made by gluing the pair together'], ['(a, b)^{*}', 'the winning pair for this round']],
    figure: { h: 'Three merges on a tiny corpus', size: [800, 330],
      nodes: {
        w1: { x: 150, y: 70, label: 'l o w', sub: '×5 · 3 tokens', w: 240, kind: 'a' },
        w2: { x: 150, y: 165, label: 'l o w e r', sub: '×2 · 5 tokens', w: 240, kind: 'a' },
        w3: { x: 150, y: 260, label: 'l o w e s t', sub: '×3 · 6 tokens', w: 240, kind: 'a' },
        pc: { x: 560, y: 110, label: 'Pair counts', sub: 'not counted yet', w: 380, kind: 'd' }
      },
      vars: { 'new tokens': 'none' },
      steps: [
        { cap: 'Corpus: low ×5, lower ×2, lowest ×3. Count each pair of neighbours, times how often its word appears.', do: [['set', 'pc', { sub: 'l o: 10 · o w: 10 · w e: 5 · e s: 3 · s t: 3 · e r: 2' }]] },
        { cap: 'Top pair: l o = 10 (tied with o w; take the first). Merge it everywhere into one token, **lo**.', do: [['set', 'w1', { label: 'lo w', sub: '×5 · 2 tokens' }], ['set', 'w2', { label: 'lo w e r', sub: '×2 · 4 tokens' }], ['set', 'w3', { label: 'lo w e s t', sub: '×3 · 5 tokens' }], ['var', 'new tokens', 'lo']] },
        { cap: 'Recount. lo w = 10 wins. Merge into **low**.', do: [['set', 'pc', { sub: 'lo w: 10 · w e: 5 · e s: 3 · s t: 3 · e r: 2' }], ['set', 'w1', { label: 'low', sub: '×5 · 1 token', state: 'ok' }], ['set', 'w2', { label: 'low e r', sub: '×2 · 3 tokens' }], ['set', 'w3', { label: 'low e s t', sub: '×3 · 4 tokens' }], ['var', 'new tokens', 'lo, low']] },
        { cap: 'Recount. low e = 5 wins. Merge into **lowe**.', do: [['set', 'pc', { sub: 'low e: 5 · e s: 3 · s t: 3 · e r: 2' }], ['set', 'w2', { label: 'lowe r', sub: '×2 · 2 tokens' }], ['set', 'w3', { label: 'lowe s t', sub: '×3 · 3 tokens' }], ['var', 'new tokens', 'lo, low, lowe']] },
        { cap: 'Stop: the vocabulary budget is 3 merges. The frequent word "low" is 1 token; rarer "lowest" is still 3.', do: [['set', 'pc', { label: 'Done: 3 merges', sub: 'learned in order: lo → low → lowe' }], ['focus', 'w1', 'w3']] },
        { cap: 'New text replays the merges in order. "slow": s l o w → s lo w → s low. Two tokens.', do: [['add', 'nw', { x: 560, y: 245, label: 's low', sub: '"slow" · 2 tokens', w: 220, kind: 'c', state: 'active' }]] }
      ] },
    example: { given: 'Corpus: "low" 5 times, "lower" 2 times, "lowest" 3 times. Start from single letters. Do 3 merges.',
      steps: ['Count pairs. "l o" appears once in each word: \\(5 + 2 + 3 = 10\\). Same for "o w": 10. "w e": \\(2 + 3 = 5\\). "e s" and "s t": 3. "e r": 2.', 'Merge 1: "l o" (10, first of the tie) → **lo**. Now "lo w" appears 10 times.', 'Merge 2: "lo w" (10) → **low**. Now "low e" appears \\(2 + 3 = 5\\) times; "e s" and "s t" stay at 3.', 'Merge 3: "low e" (5) → **lowe**. Words are now: low, lowe r, lowe s t.', 'Count tokens in the corpus: \\(5 \\times 1 + 2 \\times 2 + 3 \\times 3 = 18\\), down from \\(5 \\times 3 + 2 \\times 5 + 3 \\times 6 = 43\\) letters.'],
      result: 'Three merges cut the corpus from 43 tokens to 18. Real tokenizers do this until they have 50,000 to 200,000 tokens.' },
    pitfalls: ['Real BPE works on bytes, not letters, and spaces are part of tokens (` low` with a leading space is a different token from `low`).', 'Merges are learned once, at training time. Your app never trains BPE; it only uses the tokenizer that ships with the model.', 'Because words split by frequency, typos, rare names and non-English text cost more tokens.'],
    code: 'from collections import Counter\n\nwords = {("l","o","w"): 5, ("l","o","w","e","r"): 2, ("l","o","w","e","s","t"): 3}\n\nfor _ in range(3):\n    pairs = Counter()\n    for w, n in words.items():\n        for a, b in zip(w, w[1:]):\n            pairs[a, b] += n\n    (a, b), _ = pairs.most_common(1)[0]   # ties: first seen wins\n    merged = {}\n    for w, n in words.items():\n        out, i = [], 0\n        while i < len(w):\n            if i + 1 < len(w) and (w[i], w[i+1]) == (a, b):\n                out.append(a + b); i += 2\n            else:\n                out.append(w[i]); i += 1\n        merged[tuple(out)] = n\n    words = merged\n    print(a + b, list(words))',
    lang: 'Python'
  },

  'logits': {
    intuition: 'At every step the model gives each token in its vocabulary (often 100,000 or more) a raw score. These scores are the [[logits]]. Bigger means "more likely next".\n\nLogits are **not** probabilities. They can be negative, and they do not add up to 1. [[softmax|Softmax]] turns them into probabilities.\n\nOnly the **gaps** between logits matter. If one token\'s logit is 1 higher than another, it is \\(e^1 \\approx 2.72\\) times as likely. Add 10 to every logit and nothing changes.',
    formula: ['z = (z_1, z_2, \\ldots, z_V)', '\\frac{p_i}{p_j} = e^{z_i − z_j}', '\\log p_i = z_i − \\log \\sum_j e^{z_j}'],
    symbols: [['z_i', 'the logit (raw score) for token i'], ['V', 'vocabulary size: how many tokens the model knows'], ['p_i', 'the probability of token i after softmax'], ['e', 'the number 2.718…, the base of natural logs'], ['\\log p_i', 'the log-probability, what APIs return as `logprobs`']],
    figure: { h: 'From raw scores to probabilities', size: [800, 320],
      nodes: { m: { x: 100, y: 160, label: 'Model', sub: '"…sat on the"', w: 130, kind: 'b' } },
      steps: [
        { cap: 'The model reads "The cat sat on the" and scores every token. These raw scores are the logits.', do: [['add', 'l1', { x: 330, y: 45, label: 'mat: 3.0', shape: 'pill', w: 140, kind: 'a' }], ['add', 'l2', { x: 330, y: 120, label: 'sofa: 2.0', shape: 'pill', w: 140, kind: 'a' }], ['add', 'l3', { x: 330, y: 195, label: 'floor: 1.0', shape: 'pill', w: 140, kind: 'a' }], ['add', 'l4', { x: 330, y: 270, label: 'moon: 0.0', shape: 'pill', w: 140, kind: 'a' }]] },
        { cap: 'Only gaps matter. mat beats sofa by 1.0, so mat is \\(e^{1} \\approx 2.72\\) times as likely.', do: [['focus', 'l1', 'l2']] },
        { cap: 'Softmax turns the scores into probabilities that add up to 1.', do: [['add', 'b1', G1_bar(510, 161, 'mat', '0.644', { w: 60, y: 290, kind: 'c' })], ['add', 'b2', G1_bar(590, 59, 'sofa', '0.237', { w: 60, y: 290, kind: 'c' })], ['add', 'b3', G1_bar(670, 22, 'floor', '0.087', { w: 60, y: 290, kind: 'c' })], ['add', 'b4', G1_bar(750, 8, 'moon', '0.032', { w: 60, y: 290, kind: 'c' })]] },
        { cap: 'Add 10 to every logit: 13, 12, 11, 10. The gaps are the same, so the probabilities do not move at all.', do: [['set', 'l1', { label: 'mat: 13.0' }], ['set', 'l2', { label: 'sofa: 12.0' }], ['set', 'l3', { label: 'floor: 11.0' }], ['set', 'l4', { label: 'moon: 10.0' }]] },
        { cap: 'APIs can return logprobs: \\(\\log(0.644) \\approx {−0.44}\\) for mat. Closer to 0 means more confident.', do: [['focus', 'b1']] }
      ] },
    example: { given: 'Logits: mat 3.0, sofa 2.0, floor 1.0, moon 0.0.',
      steps: ['Gap between mat and sofa: \\(3.0 − 2.0 = 1.0\\).', 'So mat is \\(e^{1.0} \\approx 2.718\\) times as likely as sofa.', 'Check with the softmax results: \\(0.644 / 0.237 \\approx 2.72\\). It matches.', 'Log-probability of mat: \\(3.0 − \\log(e^3 + e^2 + e^1 + e^0)\\). That is \\(3.0 − \\log(31.19)\\), and \\(3.0 − 3.44 = {−0.44}\\).', 'Undo the log: \\(e^{−0.44} \\approx 0.644\\). Same number as softmax gives.'],
      result: 'A gap of 1 in logits means about 2.7× in probability. Logprobs near 0 mean the model was confident.' },
    pitfalls: ['A logit on its own means nothing. "mat scored 3.0" tells you nothing until you compare it with the other scores.', 'Logprobs show confidence, not truth. A model can be very sure and still wrong.'],
    code: 'import math\n\nlogits = {"mat": 3.0, "sofa": 2.0, "floor": 1.0, "moon": 0.0}\nlog_z = math.log(sum(math.exp(z) for z in logits.values()))\nlogprobs = {t: z - log_z for t, z in logits.items()}\nprint(round(logprobs["mat"], 2))   # -0.44',
    lang: 'Python'
  },

  'softmax': {
    intuition: '[[softmax|Softmax]] turns any list of scores into probabilities. Two moves: make every score positive with \\(e^{z}\\), then divide each by the total so they add up to 1.\n\nThe \\(e^{z}\\) part also stretches the gaps. A score that is a bit higher gets a lot more of the probability. That is why one token usually dominates.',
    formula: ['p_i = \\softmax(z)_i = \\frac{e^{z_i}}{\\sum_{j=1}^{V} e^{z_j}}', '\\sum_{i=1}^{V} p_i = 1'],
    symbols: [['z_i', 'the logit (raw score) of token i'], ['e^{z_i}', 'e (≈ 2.718) to the power z_i. Always positive'], ['\\sum_j e^{z_j}', 'the total of all those powers, used to scale them down'], ['p_i', 'the probability of token i, between 0 and 1'], ['V', 'how many tokens there are']],
    figure: { h: 'Softmax, one move at a time', size: [800, 320],
      nodes: {
        b1: G1_bar(130, 120, 'mat', 'z = 3', { y: 290 }), b2: G1_bar(270, 80, 'sofa', 'z = 2', { y: 290 }),
        b3: G1_bar(410, 40, 'floor', 'z = 1', { y: 290 }), b4: G1_bar(550, 1, 'moon', 'z = 0', { y: 290 })
      },
      vars: { stage: 'logits' },
      steps: [
        { cap: 'Start with the logits 3, 2, 1, 0. Bar height = logit.', do: [['focus', 'b1', 'b2', 'b3', 'b4']] },
        { cap: 'Raise e to each logit: \\(e^3 \\approx 20.09\\), \\(e^2 \\approx 7.39\\), \\(e^1 \\approx 2.72\\), \\(e^0 = 1\\). All positive now.', do: [['set', 'b1', { h: 161, sub: '20.09' }], ['set', 'b2', { h: 59, sub: '7.39' }], ['set', 'b3', { h: 22, sub: '2.72' }], ['set', 'b4', { h: 8, sub: '1.00' }], ['var', 'stage', 'e to the z']] },
        { cap: 'Add them up: \\(20.09 + 7.39 + 2.72 + 1.00 = 31.19\\).', do: [['add', 'sum', G1_bar(700, 250, 'Sum', '31.19', { y: 290, kind: 'n' })], ['var', 'stage', 'sum']] },
        { cap: 'Divide each by 31.19. The shape stays; the scale changes, so the sum bar now means 1.0.', do: [['set', 'b1', { sub: '0.644' }], ['set', 'b2', { sub: '0.237' }], ['set', 'b3', { sub: '0.087' }], ['set', 'b4', { sub: '0.032' }], ['set', 'sum', { sub: '1.000' }]] },
        { cap: 'Check: \\(0.644 + 0.237 + 0.087 + 0.032 = 1.000\\). The model samples the next token from these.', do: [['set', 'b1', { state: 'active' }], ['var', 'stage', 'probabilities']] }
      ] },
    example: { given: 'Logits: mat 3, sofa 2, floor 1, moon 0.',
      steps: ['Powers: \\(e^3 \\approx 20.09\\), \\(e^2 \\approx 7.39\\), \\(e^1 \\approx 2.72\\), \\(e^0 = 1.00\\).', 'Sum: \\(20.09 + 7.39 + 2.72 + 1.00 = 31.19\\).', 'mat: \\(20.09 / 31.19 \\approx 0.644\\). sofa: \\(7.39 / 31.19 \\approx 0.237\\).', 'floor: \\(2.72 / 31.19 \\approx 0.087\\). moon: \\(1.00 / 31.19 \\approx 0.032\\).', 'Check: \\(0.644 + 0.237 + 0.087 + 0.032 = 1.000\\).'],
      result: 'mat gets 64.4%. Its logit was only 1 higher than sofa, but it gets 2.7× the probability.' },
    lab: { h: 'Move the scores', body: 'Drag the three logits. The bars are the real softmax probabilities.', size: [800, 300],
      controls: [{ id: 'a', type: 'range', label: 'Logit for mat', min: -3, max: 5, step: 0.5, value: 3 }, { id: 'b', type: 'range', label: 'Logit for sofa', min: -3, max: 5, step: 0.5, value: 2 }, { id: 'c', type: 'range', label: 'Logit for floor', min: -3, max: 5, step: 0.5, value: 1 }],
      view: s => { const z = [s.v.a, s.v.b, s.v.c], p = G1_softmax(z, 1), sum = z.reduce((t, v) => t + Math.exp(v), 0), nodes = {};
        ['mat', 'sofa', 'floor'].forEach((t, i) => { nodes['p' + i] = G1_bar(200 + i * 200, p[i] * 240, t, p[i].toFixed(3), { w: 90, kind: 'c' }); });
        return { nodes, vars: { 'sum of e^z': sum.toFixed(2), 'total p': p.reduce((a, b) => a + b, 0).toFixed(3) } }; },
      readout: s => [['Biggest gap', Math.max(s.v.a, s.v.b, s.v.c) - Math.min(s.v.a, s.v.b, s.v.c)]] },
    pitfalls: ['Big logits overflow: \\(e^{1000}\\) is infinity in a float. Real code subtracts the largest logit first. It gives the same answer, because only gaps matter.', 'Softmax probabilities are not calibrated truth. A 0.9 does not mean "right 90% of the time".'],
    code: 'import math\n\ndef softmax(z):\n    m = max(z)                        # subtract max: no overflow\n    e = [math.exp(v - m) for v in z]\n    s = sum(e)\n    return [v / s for v in e]\n\nprint(softmax([3, 2, 1, 0]))   # [0.644, 0.237, 0.087, 0.032]',
    lang: 'Python'
  },

  'temperature': {
    intuition: '[[temperature|Temperature]] divides every logit by a number \\(T\\) before [[softmax]].\n\nA small \\(T\\) (below 1) makes the gaps bigger, so the top token wins even more. As \\(T\\) goes to 0, the top token gets everything: that is [[greedy decoding]]. A big \\(T\\) (above 1) shrinks the gaps, so the bars flatten and unlikely tokens get a real chance.\n\nUse low \\(T\\) for facts, code and JSON. Use higher \\(T\\) for brainstorming.',
    formula: ['p_i = \\frac{e^{z_i / T}}{\\sum_j e^{z_j / T}}', 'T \\to 0 \\quad \\Rightarrow \\quad \\text{all probability on } \\argmax_i z_i'],
    symbols: [['z_i', 'the logit of token i'], ['T', 'temperature, usually 0 to 2. \\(T = 1\\) leaves the logits as they are'], ['z_i / T', 'the scaled logit. Dividing by 0.5 doubles every gap; dividing by 2 halves it'], ['p_i', 'the probability of token i after scaling']],
    figure: { h: 'One set of logits, three temperatures', size: [800, 320],
      nodes: {
        b1: G1_bar(160, 161, 'mat', '0.644', { y: 290, kind: 'c' }), b2: G1_bar(300, 59, 'sofa', '0.237', { y: 290, kind: 'c' }),
        b3: G1_bar(440, 22, 'floor', '0.087', { y: 290, kind: 'c' }), b4: G1_bar(580, 8, 'moon', '0.032', { y: 290, kind: 'c' })
      },
      vars: { T: '1', 'z / T': '3, 2, 1, 0' },
      steps: [
        { cap: 'At \\(T = 1\\), the logits 3, 2, 1, 0 give 0.644, 0.237, 0.087, 0.032.', do: [['focus', 'b1', 'b2', 'b3', 'b4']] },
        { cap: '\\(T = 0.5\\): logits become 6, 4, 2, 0. The gaps double, and mat jumps to 0.865.', do: [['set', 'b1', { h: 216, sub: '0.865' }], ['set', 'b2', { h: 29, sub: '0.117' }], ['set', 'b3', { h: 4, sub: '0.016' }], ['set', 'b4', { h: 1, sub: '0.002' }], ['var', 'T', '0.5'], ['var', 'z / T', '6, 4, 2, 0']] },
        { cap: '\\(T \\to 0\\): the gaps grow without limit. mat gets everything. This is greedy decoding.', do: [['set', 'b1', { h: 250, sub: '1.000', state: 'active' }], ['set', 'b2', { h: 1, sub: '0' }], ['set', 'b3', { h: 1, sub: '0' }], ['set', 'b4', { h: 1, sub: '0' }], ['var', 'T', '→ 0'], ['var', 'z / T', 'huge gaps']] },
        { cap: '\\(T = 2\\): logits become 1.5, 1, 0.5, 0. The gaps halve, and the bars flatten.', do: [['set', 'b1', { h: 114, sub: '0.455', state: null }], ['set', 'b2', { h: 69, sub: '0.276' }], ['set', 'b3', { h: 42, sub: '0.167' }], ['set', 'b4', { h: 25, sub: '0.102' }], ['var', 'T', '2'], ['var', 'z / T', '1.5, 1, 0.5, 0']] },
        { cap: 'At \\(T = 2\\), moon rises from 3% to 10%. Fine for a poem, risky for JSON.', do: [['focus', 'b4'], ['note', 'b4', '0.032 → 0.102']] }
      ] },
    example: { given: 'Logits: mat 3, sofa 2, floor 1, moon 0. Temperature \\(T = 2\\).',
      steps: ['Divide by T: \\(3/2 = 1.5\\), \\(2/2 = 1\\), \\(1/2 = 0.5\\), \\(0/2 = 0\\).', 'Powers: \\(e^{1.5} \\approx 4.482\\), \\(e^{1} \\approx 2.718\\), \\(e^{0.5} \\approx 1.649\\), \\(e^{0} = 1\\).', 'Sum: \\(4.482 + 2.718 + 1.649 + 1 = 9.849\\).', 'Probabilities: \\(4.482 / 9.849 \\approx 0.455\\), \\(2.718 / 9.849 \\approx 0.276\\), \\(1.649 / 9.849 \\approx 0.167\\), \\(1 / 9.849 \\approx 0.102\\).', 'Compare with \\(T = 1\\): mat fell from 0.644 to 0.455, moon rose from 0.032 to 0.102.'],
      result: 'Doubling the temperature halved every gap. The top token lost about 19 points; the long shot tripled.' },
    lab: { h: 'Turn the dial', body: 'Same logits (3, 2, 1, 0). Slide the temperature and watch the real probabilities.', size: [800, 300],
      controls: [{ id: 'T', type: 'range', label: 'Temperature T', min: 0, max: 2, step: 0.05, value: 1 }],
      view: s => { const T = Math.round(s.v.T * 100) / 100, p = G1_softmax(G1_Z, T), nodes = {};
        G1_TOK.forEach((t, i) => { nodes['p' + i] = G1_bar(160 + i * 160, p[i] * 240, t, p[i].toFixed(3), { w: 80, kind: 'c', state: T === 0 && i === 0 ? 'active' : undefined }); });
        return { nodes, vars: { T: T === 0 ? '0 (greedy)' : String(T), 'z / T': T === 0 ? 'top token only' : G1_Z.map(z => +(z / T).toFixed(2)).join(', ') } }; },
      readout: s => { const p = G1_softmax(G1_Z, Math.round(s.v.T * 100) / 100); return [['Chance of moon', (p[3] * 100).toFixed(1) + '%']]; } },
    pitfalls: ['\\(T = 0\\) is a special case: you cannot divide by zero. APIs treat it as "pick the top token".', 'Low temperature does not make answers true. It only makes them repeatable.', 'Some newer reasoning models ignore or reject temperature. Check the provider docs.'],
    code: 'import math\n\ndef probs(logits, T):\n    if T == 0:                                    # greedy\n        top = max(range(len(logits)), key=logits.__getitem__)\n        return [1.0 if i == top else 0.0 for i in range(len(logits))]\n    m = max(logits)\n    e = [math.exp((z - m) / T) for z in logits]\n    return [v / sum(e) for v in e]\n\nprint(probs([3, 2, 1, 0], 2))   # [0.455, 0.276, 0.167, 0.102]',
    lang: 'Python'
  },

  'top-p': {
    intuition: '[[top-p|Top-p]] (nucleus sampling) cuts off the long tail of unlikely tokens before the draw.\n\nSort tokens from most to least likely. Add their probabilities one by one. Stop as soon as the running total reaches \\(p\\). Keep only those tokens, scale them so they add up to 1 again, and draw from them.\n\nWhen the model is sure, the nucleus is tiny (maybe one token). When it is unsure, more tokens stay in. The cut adapts by itself.',
    formula: ['p_{(1)} \\ge p_{(2)} \\ge \\ldots \\ge p_{(V)}', 'k = \\text{smallest number with } \\sum_{i=1}^{k} p_{(i)} \\ge p', 'p\'_{(i)} = \\frac{p_{(i)}}{\\sum_{j=1}^{k} p_{(j)}} \\quad \\text{for } i \\le k'],
    symbols: [['p_{(i)}', 'the i-th biggest probability after sorting'], ['p', 'the top-p setting, for example 0.9'], ['k', 'how many tokens stay in the nucleus'], ['p\'_{(i)}', 'the new probability after rescaling. Tokens outside the nucleus get 0']],
    figure: { h: 'Top-p = 0.9 on five tokens', size: [800, 320],
      nodes: {
        b1: G1_bar(130, 200, 'mat', '0.50', { y: 290, kind: 'c' }), b2: G1_bar(250, 100, 'sofa', '0.25', { y: 290, kind: 'c' }),
        b3: G1_bar(370, 48, 'floor', '0.12', { y: 290, kind: 'c' }), b4: G1_bar(490, 32, 'rug', '0.08', { y: 290, kind: 'c' }),
        b5: G1_bar(610, 20, 'moon', '0.05', { y: 290, kind: 'c' })
      },
      vars: { p: '0.9', 'running total': '0' },
      steps: [
        { cap: 'Sort from most to least likely. All five add up to 1.00.', do: [['focus', 'b1', 'b2', 'b3', 'b4', 'b5']] },
        { cap: 'Running total: mat 0.50, plus sofa = 0.75. Still below 0.9, so keep going.', do: [['set', 'b1', { state: 'active' }], ['set', 'b2', { state: 'active' }], ['var', 'running total', '0.75']] },
        { cap: 'Plus floor = 0.87. Still below 0.9.', do: [['set', 'b3', { state: 'active' }], ['var', 'running total', '0.87']] },
        { cap: 'Plus rug = 0.95, which is ≥ 0.9. Stop. The nucleus is mat, sofa, floor, rug.', do: [['set', 'b4', { state: 'active' }], ['var', 'running total', '0.95']] },
        { cap: 'Cut the tail. moon (0.05) can never be picked now.', do: [['set', 'b5', { state: 'off', sub: 'cut' }]] },
        { cap: 'Rescale: divide each kept value by 0.95. Now they add up to 1 again.', do: [['set', 'b1', { h: 211, sub: '0.53', state: 'ok' }], ['set', 'b2', { h: 105, sub: '0.26', state: 'ok' }], ['set', 'b3', { h: 51, sub: '0.13', state: 'ok' }], ['set', 'b4', { h: 34, sub: '0.08', state: 'ok' }], ['var', 'running total', '1.00']] }
      ] },
    example: { given: 'Probabilities: mat 0.50, sofa 0.25, floor 0.12, rug 0.08, moon 0.05. Top-p \\(p = 0.9\\).',
      steps: ['Already sorted. Running totals: 0.50, then \\(0.50 + 0.25 = 0.75\\), then \\(0.75 + 0.12 = 0.87\\), then \\(0.87 + 0.08 = 0.95\\).', 'The first total that is \\(\\ge 0.9\\) is 0.95, after 4 tokens. So \\(k = 4\\) and moon is cut.', 'Rescale by 0.95: mat \\(0.50 / 0.95 \\approx 0.5263\\), sofa \\(0.25 / 0.95 \\approx 0.2632\\).', 'floor \\(0.12 / 0.95 \\approx 0.1263\\), rug \\(0.08 / 0.95 \\approx 0.0842\\).', 'Check: \\(0.5263 + 0.2632 + 0.1263 + 0.0842 = 1.0000\\).'],
      result: 'Four tokens stay in the draw. moon\'s 5% chance is now 0%.' },
    lab: { h: 'Set p', body: 'Same five tokens. Slide p and see which tokens survive, and their rescaled chances.', size: [800, 300],
      controls: [{ id: 'p', type: 'range', label: 'Top-p', min: 0.1, max: 1, step: 0.05, value: 0.9 }],
      view: s => { const P = [50, 25, 12, 8, 5], T = ['mat', 'sofa', 'floor', 'rug', 'moon'], need = Math.round(s.v.p * 100); let cum = 0, k = 0;
        while (k < P.length && cum < need) cum += P[k++];
        const nodes = {};
        T.forEach((t, i) => { const keep = i < k, q = keep ? P[i] / cum : 0; nodes['p' + i] = G1_bar(130 + i * 135, keep ? q * 240 : P[i] * 2.4, t, keep ? q.toFixed(2) : 'cut', { w: 80, kind: 'c', state: keep ? 'ok' : 'off' }); });
        return { nodes, vars: { p: s.v.p.toFixed(2), kept: k + ' of 5', 'kept total': (cum / 100).toFixed(2) } }; } },
    pitfalls: ['The test is "≥ p", and you include the token that crosses the line. Forgetting it can leave an empty nucleus.', 'Tune top-p **or** temperature, not both at once. Changing both makes results hard to reason about.', 'Top-p = 1.0 cuts nothing. Very low top-p acts almost like greedy decoding.'],
    code: 'def top_p(probs: dict, p: float) -> dict:\n    items = sorted(probs.items(), key=lambda kv: kv[1], reverse=True)\n    kept, total = [], 0.0\n    for tok, pr in items:\n        kept.append((tok, pr))\n        total += pr\n        if total >= p:\n            break\n    return {tok: pr / total for tok, pr in kept}',
    lang: 'Python'
  },

  'greedy decoding': {
    intuition: '[[greedy decoding|Greedy decoding]] always takes the single most likely next token. No dice.\n\nThat makes it **repeatable**: same input, same scores, same pick, same text. Great for tests, extraction and JSON.\n\nIt is not the same as "best answer". Greedy never looks ahead, so a slightly worse first word that leads to a much better second word gets skipped. And if the text reaches a state it has seen before, it picks the same tokens again and can loop: "It is good. It is good. It is good."',
    formula: ['y_t = \\argmax_i \\, p(i \\mid y_1, \\ldots, y_{t−1})', 'P(y_1, \\ldots, y_n) = \\prod_{t=1}^{n} p(y_t \\mid y_1, \\ldots, y_{t−1})'],
    symbols: [['y_t', 'the token chosen at step t'], ['p(i \\mid \\ldots)', 'the probability of token i, given everything written so far'], ['\\argmax_i', '"the i that gives the biggest value": pick the top token'], ['\\prod', 'multiply all the terms together. The chance of a whole sequence is the product of each step']],
    figure: { h: 'Greedy picks the best step, not the best path', size: [800, 330],
      nodes: { st: { x: 100, y: 165, label: 'Prompt', sub: '"Once upon…"', w: 130, kind: 'b' } },
      vars: {},
      steps: [
        { cap: 'Step 1: the top choices are The (0.5) and A (0.4). Greedy takes the top one: The.', do: [['add', 'the', { x: 340, y: 85, label: 'The', sub: 'p = 0.5', kind: 'a', state: 'active' }], ['add', 'a', { x: 340, y: 245, label: 'A', sub: 'p = 0.4', kind: 'a' }], ['link', 'st', 'the', '0.5'], ['link', 'st', 'a', '0.4']] },
        { cap: 'Step 2: after The, the best next token is dog at 0.4. Greedy takes it.', do: [['add', 'dog', { x: 620, y: 60, label: 'dog', sub: 'p = 0.4', kind: 'a', state: 'active' }], ['link', 'the', 'dog', '0.4']] },
        { cap: 'Chance of the whole path: \\(0.5 \\times 0.4 = 0.20\\).', do: [['var', 'The dog', '0.20'], ['focus', 'st', 'the', 'dog']] },
        { cap: 'The skipped path: A, then cat at 0.9. \\(0.4 \\times 0.9 = 0.36\\). Better overall.', do: [['add', 'cat', { x: 620, y: 270, label: 'cat', sub: 'p = 0.9', kind: 'c', state: 'ok' }], ['link', 'a', 'cat', '0.9'], ['set', 'a', { state: 'ok' }], ['var', 'A cat', '0.36']] },
        { cap: 'Greedy is repeatable, not optimal. Run it again and you get "The dog" every time.', do: [['set', 'dog', { state: 'warn' }], ['focus', 'dog', 'cat']] }
      ] },
    example: { given: 'Step 1 offers The (0.5) or A (0.4). After The, the best is dog (0.4). After A, the best is cat (0.9).',
      steps: ['Greedy step 1: \\(\\max(0.5, 0.4) = 0.5\\), so it writes The.', 'Greedy step 2: the best after The is dog, 0.4.', 'Chance of "The dog": \\(0.5 \\times 0.4 = 0.20\\).', 'Chance of "A cat": \\(0.4 \\times 0.9 = 0.36\\), which is higher.', 'Greedy never saw it, because it never looks past the current step.'],
      result: 'Greedy output: "The dog" (0.20), every single run. The likelier "A cat" (0.36) was missed.' },
    pitfalls: ['Repetition loops. If "It is good." makes "It" the top next token again, greedy writes the same sentence until `max_tokens`. A small temperature or a repetition penalty breaks the loop.', '"Temperature 0" on a hosted API is nearly, not perfectly, repeatable. Ties and GPU math can still flip a token now and then. Do not rely on byte-identical output in tests.'],
    code: 'def greedy(model, prompt, max_tokens=50):\n    tokens = prompt\n    for _ in range(max_tokens):\n        probs = model(tokens)                  # dict: token -> probability\n        nxt = max(probs, key=probs.get)        # argmax: no randomness\n        if nxt == "<end>":\n            break\n        tokens = tokens + [nxt]\n    return tokens',
    lang: 'Python'
  },

  'exponential backoff': {
    intuition: 'When a call fails with `429` or `503`, retrying at once usually fails again: the server is still busy. So wait, and **double** the wait after each failure: 1 s, 2 s, 4 s, 8 s… A cap stops it from growing forever.\n\nIf 1,000 clients fail at the same moment and all wait exactly 4 s, they all hit the server again together. **Jitter** fixes that: each client waits a random time between 0 and the backoff value, so the retries spread out.',
    formula: ['\\text{delay}_n = \\min(\\text{cap}, \\, \\text{base} \\cdot 2^{n})', '\\text{sleep}_n = \\text{random}(0, \\, \\text{delay}_n) \\quad \\text{(full jitter)}'],
    symbols: [['n', 'the retry number, starting at 0'], ['\\text{base}', 'the first wait, for example 1 second'], ['\\text{cap}', 'the longest wait you allow, for example 30 seconds'], ['2^{n}', 'doubles each time: 1, 2, 4, 8, 16, 32…'], ['\\text{random}(0, x)', 'a random number between 0 and x, new for every retry']],
    figure: { h: 'Waits with base 1 s and cap 30 s', size: [800, 330], nodes: {}, vars: { 'total wait': '0 s' },
      steps: [
        { cap: 'Retry 0 fails with 429. Wait \\(1 \\cdot 2^0 = 1\\) s.', do: [['add', 'd0', G1_bar(100, 8, '#0', '1 s', { y: 290, w: 64 })], ['var', 'total wait', '1 s']] },
        { cap: 'It fails again. Wait \\(2^1 = 2\\) s, then \\(2^2 = 4\\) s. Each wait doubles.', do: [['add', 'd1', G1_bar(200, 16, '#1', '2 s', { y: 290, w: 64 })], ['add', 'd2', G1_bar(300, 32, '#2', '4 s', { y: 290, w: 64 })], ['var', 'total wait', '7 s']] },
        { cap: 'Then 8 s and 16 s. Five retries have waited \\(1 + 2 + 4 + 8 + 16 = 31\\) s.', do: [['add', 'd3', G1_bar(400, 64, '#3', '8 s', { y: 290, w: 64 })], ['add', 'd4', G1_bar(500, 128, '#4', '16 s', { y: 290, w: 64 })], ['var', 'total wait', '31 s']] },
        { cap: 'Next would be \\(2^5 = 32\\) s, but the cap wins: \\(\\min(30, 32) = 30\\) s.', do: [['add', 'd5', G1_bar(600, 240, '#5', '30 s', { y: 290, w: 64, state: 'warn' })], ['var', 'total wait', '61 s']] },
        { cap: 'Full jitter: retry 5 waits a random time up to 30 s. With a draw of 0.4: \\(0.4 \\times 30 = 12\\) s.', do: [['set', 'd5', { h: 96, sub: '12 s', state: 'active' }], ['note', 'd5', 'random(0, 30)']] },
        { cap: 'Every client draws its own number, so 1,000 clients spread over 30 s instead of one spike.', do: [['set', 'd3', { h: 30, sub: '3.8 s' }], ['set', 'd4', { h: 107, sub: '13.4 s' }], ['focus', 'd3', 'd4', 'd5']] }
      ] },
    example: { given: 'Base 1 s, cap 30 s. Full jitter with random draws 0.25 (retry 4) and 0.4 (retry 6).',
      steps: ['Retry 4: \\(1 \\cdot 2^4 = 16\\). \\(\\min(30, 16) = 16\\) s.', 'With full jitter and a draw of 0.25: \\(0.25 \\times 16 = 4\\) s.', 'Retry 6: \\(1 \\cdot 2^6 = 64\\). \\(\\min(30, 64) = 30\\) s. With a draw of 0.4: \\(0.4 \\times 30 = 12\\) s.', 'Without jitter, retries 0 to 5 wait \\(1 + 2 + 4 + 8 + 16 + 30 = 61\\) s in total.', 'With full jitter each wait is on average half its ceiling, so about \\(61 / 2 = 30.5\\) s.'],
      result: 'Six retries take about a minute without jitter, about half that with it, and the retries no longer arrive in lockstep.' },
    lab: { h: 'Tune the backoff', body: 'Change the base and the cap. Turn on full jitter to see one set of random draws (fixed here so you can compare).', size: [800, 320],
      controls: [{ id: 'base', type: 'range', label: 'Base (s)', min: 0.5, max: 4, step: 0.5, value: 1, unit: 's' }, { id: 'cap', type: 'range', label: 'Cap (s)', min: 5, max: 60, step: 5, value: 30, unit: 's' }, { id: 'jit', type: 'toggle', label: 'Full jitter' }],
      view: s => { const nodes = {}, k = 240 / s.v.cap; let tot = 0;
        for (let n = 0; n < 7; n++) { const d = Math.min(s.v.cap, s.v.base * 2 ** n), w = s.v.jit ? G1_R[n] * d : d; tot += w;
          nodes['d' + n] = G1_bar(100 + n * 100, w * k, '#' + n, (+w.toFixed(1)) + ' s', { y: 290, w: 64, state: d === s.v.cap ? 'warn' : undefined }); }
        return { nodes, vars: { 'total wait': (+tot.toFixed(1)) + ' s' } }; },
      readout: s => [['Retry 6 ceiling', 'min(' + s.v.cap + ', ' + s.v.base + ' × 64) = ' + Math.min(s.v.cap, s.v.base * 64) + ' s']] },
    pitfalls: ['If the response has a `Retry-After` header, wait that long instead. The server knows better.', 'Only retry errors that can pass: `429`, `500`, `503`, timeouts. Never retry a `400` or `401`; it will fail every time.', 'Limit the number of retries (for example 5), and make the call [[idempotent]] so a retry does not repeat a side effect.'],
    code: 'import random, time\n\ndef call_with_retry(fn, base=1.0, cap=30.0, tries=6):\n    for n in range(tries):\n        try:\n            return fn()\n        except RateLimitError:\n            if n == tries - 1:\n                raise\n            delay = min(cap, base * 2 ** n)\n            time.sleep(random.uniform(0, delay))   # full jitter',
    lang: 'Python'
  },

  'prompt caching': {
    intuition: 'Most requests start with the same big block: system prompt, tool schemas, reference docs. Only the end changes. With [[prompt caching]], the provider keeps the processed start of the prompt. The next request with the exact same prefix reads it from cache: a [[cache hit]].\n\nCached input tokens cost much less, often about 10% of the normal price. The new tokens at the end still pay full price.\n\nSo the bill depends on two numbers: how big the shared prefix is, and how often you hit the cache.',
    formula: ['C = \\frac{N_c \\cdot P_c + N_u \\cdot P}{10^6}', 'P_{\\text{avg}} = h \\cdot P_c + (1 − h) \\cdot P'],
    symbols: [['C', 'input cost of one request, in dollars'], ['N_c', 'tokens read from the cache (the shared prefix)'], ['N_u', 'tokens not cached: the new part, or the whole prompt on a miss'], ['P, \\, P_c', 'normal and cached price, in dollars per 1M tokens (here $3 and $0.30)'], ['h', 'hit rate: the share of requests that find the prefix in cache, from 0 to 1'], ['P_{\\text{avg}}', 'the average price you pay for a prefix token']],
    figure: { h: 'Input cost per day at different hit rates', size: [800, 330], nodes: {}, vars: { requests: '10,000/day' },
      steps: [
        { cap: 'No cache: 8,300 tokens × $3/M = $0.0249 a request. Times 10,000 = $249 a day.', do: [['add', 'h0', G1_bar(150, 249 * 0.96, '0%', '$249', { y: 290, kind: 'e' })]] },
        { cap: '50% hits: the 8,000-token prefix averages \\(0.5 \\times 0.30 + 0.5 \\times 3 = 1.65\\) $/M. That is $141 a day.', do: [['add', 'h50', G1_bar(310, 141 * 0.96, '50%', '$141', { y: 290, kind: 'd' })]] },
        { cap: '90% hits: \\(0.9 \\times 0.30 + 0.1 \\times 3 = 0.57\\) $/M for the prefix. $54.60 a day.', do: [['add', 'h90', G1_bar(470, 54.6 * 0.96, '90%', '$54.60', { y: 290, kind: 'c' })]] },
        { cap: 'Every request hits: $33 a day. The 300 new tokens always pay full price: $9 of that.', do: [['add', 'h100', G1_bar(630, 33 * 0.96, '100%', '$33', { y: 290, kind: 'c', state: 'ok' })]] },
        { cap: 'Hit rate is the lever. Change one byte near the start of the prompt and every request misses.', do: [['set', 'h90', { state: 'active' }], ['focus', 'h0', 'h90'], ['var', 'saved at 90%', '$194.40/day']] }
      ] },
    example: { given: '10,000 requests a day. Each has an 8,000-token shared prefix and 300 new tokens. Prices: $3 per 1M input tokens, $0.30 per 1M cached. Hit rate 90%.',
      steps: ['No cache: \\(8300 \\times 3 / 10^6 = 0.0249\\) dollars a request, so \\(0.0249 \\times 10000 = 249\\) dollars a day.', 'Average prefix price: \\(0.9 \\times 0.30 + 0.1 \\times 3 = 0.27 + 0.30 = 0.57\\) dollars per 1M.', 'Per request: \\((8000 \\times 0.57 + 300 \\times 3) / 10^6 = (4560 + 900) / 10^6 = 0.00546\\) dollars.', 'Per day: \\(0.00546 \\times 10000 = 54.60\\) dollars.', 'Saved: \\(249 − 54.60 = 194.40\\) dollars a day, about 78%.'],
      result: 'Input drops from $249 to $54.60 a day. Output tokens are not cached, so their cost stays the same.' },
    lab: { h: 'Your bill', body: 'Prices: $3 per 1M input tokens, $0.30 cached. Each request also has 300 new tokens.', size: [800, 320],
      controls: [{ id: 'h', type: 'range', label: 'Hit rate', min: 0, max: 100, step: 5, value: 90, unit: '%' }, { id: 'pre', type: 'range', label: 'Shared prefix (tokens)', min: 1000, max: 20000, step: 1000, value: 8000 }, { id: 'req', type: 'range', label: 'Requests per day', min: 1000, max: 100000, step: 1000, value: 10000 }],
      view: s => { const h = s.v.h / 100, none = (s.v.pre + 300) * 3 * s.v.req / 1e6, cached = (s.v.pre * (h * 0.3 + (1 - h) * 3) + 300 * 3) * s.v.req / 1e6, k = 240 / none;
        return { nodes: { a: G1_bar(250, none * k, 'No cache', '$' + none.toFixed(2), { y: 290, w: 110, kind: 'e' }), b: G1_bar(520, cached * k, 'Cached', '$' + cached.toFixed(2), { y: 290, w: 110, kind: 'c', state: 'ok' }) },
          vars: { 'saved per day': '$' + (none - cached).toFixed(2), 'saved %': Math.round((1 - cached / none) * 100) + '%' } }; },
      readout: s => [['Prefix price per 1M', '$' + ((s.v.h / 100) * 0.3 + (1 - s.v.h / 100) * 3).toFixed(3)]] },
    pitfalls: ['The prefix must match exactly, byte for byte. A timestamp or user name at the top of the system prompt makes every request a miss. Put static content first, dynamic content last.', 'Some providers charge extra (about 1.25×) to **write** the cache on a miss, and the cache expires after a few minutes without use. Low traffic means low hit rates.', 'Small prompts may not qualify: providers have a minimum prefix size, often around 1,024 tokens.'],
    code: 'def daily_input_cost(req, prefix, new, hit, price=3.0, cached=0.30):\n    avg = hit * cached + (1 - hit) * price      # $ per 1M prefix tokens\n    per_req = (prefix * avg + new * price) / 1e6\n    return per_req * req\n\nprint(daily_input_cost(10_000, 8_000, 300, 0.9))   # 54.6',
    lang: 'Python'
  },

  'quantization': {
    intuition: 'A model is mostly a huge list of numbers: its weights. A 7B model has 7 billion of them. Memory is just **how many numbers × how many bytes each**.\n\nIn fp16, each weight takes 16 bits (2 bytes). [[quantization|Quantization]] stores each weight with fewer bits, like 8 or 4. Fewer bits means fewer possible values, so each weight is rounded to the nearest allowed level. The model gets smaller and faster, and a little less precise.\n\nThink of a photo saved as a smaller JPEG. Most of the picture survives; fine detail gets a bit blurry.',
    formula: ['\\text{memory (bytes)} \\approx N \\times \\frac{b}{8}', 's = \\frac{\\max |w|}{2^{b−1} − 1}', '\\hat{w} = s \\cdot \\mathrm{round}(w / s), \\quad |w − \\hat{w}| \\le \\frac{s}{2}'],
    symbols: [['N', 'number of weights (parameters), for example \\(7 \\times 10^9\\)'], ['b', 'bits per weight: 32, 16, 8 or 4'], ['s', 'the scale: the gap between two allowed levels'], ['w', 'the original weight'], ['\\hat{w}', 'the weight after rounding to the nearest level'], ['|w − \\hat{w}|', 'the rounding error. It is never more than half a step']],
    figure: { h: 'A 7B model at four precisions', size: [800, 330], nodes: {}, vars: { params: '7 billion' },
      steps: [
        { cap: 'fp32: 32 bits = 4 bytes per weight. \\(7 \\times 10^9 \\times 4\\) bytes = 28 GB.', do: [['add', 'f32', G1_bar(120, 224, 'fp32', '28 GB', { y: 290, kind: 'e' })]] },
        { cap: 'fp16: 2 bytes per weight, so 14 GB. Most open models ship like this.', do: [['add', 'f16', G1_bar(250, 112, 'fp16', '14 GB', { y: 290, kind: 'd' })]] },
        { cap: 'int8: 1 byte per weight, so 7 GB.', do: [['add', 'i8', G1_bar(380, 56, 'int8', '7 GB', { y: 290, kind: 'c' })]] },
        { cap: '4-bit: half a byte per weight, so 3.5 GB. Now it fits on an 8 GB laptop GPU, with room to spare.', do: [['add', 'i4', G1_bar(510, 28, '4-bit', '3.5 GB', { y: 290, kind: 'c', state: 'ok' })], ['add', 'gpu', G1_bar(680, 64, 'GPU', '8 GB', { y: 290, kind: 'n' })]] },
        { cap: 'The cost: 4 bits allow only 16 levels, so each weight is rounded a little. Quality usually drops slightly.', do: [['focus', 'i4', 'gpu'], ['note', 'i4', '16 levels only']] }
      ] },
    example: { given: 'A 7B model. Then four weights \\(0.12, {−0.50}, 0.31, 0.05\\), quantized to signed 4-bit (levels −7 to 7).',
      steps: ['Memory: \\(7 \\times 10^9 \\times 16 / 8 = 14 \\times 10^9\\) bytes = 14 GB in fp16. In 4-bit: \\(7 \\times 10^9 \\times 4 / 8 = 3.5\\) GB.', 'Scale: the biggest weight is 0.50, so \\(s = 0.50 / 7 \\approx 0.0714\\).', 'Divide and round: \\(0.12 / 0.0714 \\approx 1.68 \\to 2\\); \\({−0.50} \\to {−7}\\); \\(0.31 / 0.0714 \\approx 4.34 \\to 4\\); \\(0.05 / 0.0714 = 0.70 \\to 1\\).', 'Back to numbers: \\(2s \\approx 0.143\\), \\({−7s} = {−0.500}\\), \\(4s \\approx 0.286\\), \\(1s \\approx 0.071\\).', 'Errors: 0.023, 0, 0.024, 0.021. All are below \\(s / 2 \\approx 0.036\\).'],
      result: '4× less memory than fp16, and every weight moved by less than 0.036.' },
    lab: { h: 'Will it fit on your GPU?', body: 'Pick a model size and a GPU. Green means the weights use at most 80% of GPU memory (a rough rule; the rest is for the KV cache).', size: [800, 320],
      controls: [{ id: 'p', type: 'range', label: 'Parameters (billions)', min: 1, max: 70, step: 1, value: 7 }, { id: 'gpu', type: 'select', label: 'GPU memory', options: ['8 GB', '16 GB', '24 GB', '80 GB'], value: '8 GB' }],
      view: s => { const G = parseInt(s.v.gpu, 10), nodes = {}, k = 240 / Math.max(s.v.p * 4, G);
        [32, 16, 8, 4].forEach((b, i) => { const gb = s.v.p * b / 8; nodes['q' + b] = G1_bar(110 + i * 140, gb * k, b === 4 ? '4-bit' : (b === 8 ? 'int8' : 'fp' + b), +gb.toFixed(1) + ' GB', { y: 290, w: 80, kind: 'c', state: gb <= 0.8 * G ? 'ok' : 'bad' }); });
        nodes.gpu = G1_bar(690, G * k, 'GPU', G + ' GB', { y: 290, w: 80, kind: 'n' });
        return { nodes, vars: { 'bytes per weight': '4 / 2 / 1 / 0.5' } }; },
      readout: s => [['fp16 size', s.v.p * 2 + ' GB']] },
    pitfalls: ['Weights are not the whole bill. The KV cache for long contexts and the runtime also need memory, so leave about 20% headroom.', 'Small models and math or code tasks lose more quality at 4-bit. Run your evals on the quantized model, not the original.', '1 GB here means \\(10^9\\) bytes. Tools that report GiB (\\(2^{30}\\)) show about 7% less: 14 GB ≈ 13.0 GiB.'],
    code: 'def weights_gb(params_billion: float, bits: int) -> float:\n    return params_billion * bits / 8      # 1e9 params * bits/8 bytes = GB\n\nfor bits in (32, 16, 8, 4):\n    print(bits, weights_gb(7, bits))       # 28.0, 14.0, 7.0, 3.5',
    lang: 'Python'
  },

  'LoRA': {
    intuition: 'Fine-tuning normally changes every weight in the model. A single 4096 × 4096 weight matrix has 16.8 million numbers, and a model has hundreds of them.\n\n[[LoRA]] freezes the original matrix \\(W\\). Instead, it learns a small **update** built from two thin matrices, \\(B\\) and \\(A\\). Their product \\(BA\\) has the same shape as \\(W\\), but it is made from far fewer numbers. The rank \\(r\\) (often 8 or 16) sets how thin they are.\n\nThe bet: the change you need for one task (a format, a tone) is simple, so a low-rank update is enough.',
    formula: ['W\' = W + BA', 'B \\in ℝ^{d \\times r}, \\quad A \\in ℝ^{r \\times k}', '\\text{trainable} = d \\cdot r + r \\cdot k \\quad \\text{instead of} \\quad d \\cdot k'],
    symbols: [['W', 'the original weight matrix, d rows by k columns. Frozen: it never changes'], ['B, \\, A', 'the two small matrices LoRA trains. B starts at all zeros, so at first \\(W\' = W\\)'], ['r', 'the rank: the inner size of B and A. Much smaller than d and k'], ['d, \\, k', 'the matrix size, for example 4096 × 4096'], ['W\'', 'the weights used after fine-tuning'], ['ℝ^{d \\times r}', '"a grid of real numbers with d rows and r columns"']],
    figure: { h: 'Swap 16.8M trainable numbers for 65K', size: [800, 330],
      nodes: { W: { x: 120, y: 165, label: 'W', sub: '4096 × 4096', w: 160, h: 160, kind: 'a' } },
      vars: { trainable: '16,777,216' },
      steps: [
        { cap: 'Full fine-tuning trains every number in W: \\(4096 \\times 4096 = 16\\,777\\,216\\).', do: [['set', 'W', { state: 'active' }]] },
        { cap: 'LoRA freezes W. It does not change during training.', do: [['set', 'W', { state: 'off', sub: 'frozen' }], ['var', 'trainable', '0 so far']] },
        { cap: 'It trains two thin matrices instead: B is 4096 × 8, A is 8 × 4096.', do: [['add', 'B', { x: 290, y: 165, label: 'B', w: 36, h: 160, kind: 'b' }], ['add', 'A', { x: 440, y: 165, label: 'A', w: 160, h: 36, kind: 'b' }], ['add', 'tB', { x: 290, y: 290, label: '4096 × 8', shape: 'text', w: 100 }], ['add', 'tA', { x: 440, y: 290, label: '8 × 4096', shape: 'text', w: 100 }], ['var', 'trainable', '65,536']] },
        { cap: 'Their product BA is 4096 × 4096, the same shape as W, but built from only 65,536 numbers.', do: [['add', 'BA', { x: 660, y: 165, label: 'BA', sub: '4096 × 4096', w: 160, h: 160, kind: 'b' }], ['link', 'A', 'BA', 'B × A']] },
        { cap: 'At the end, add the update: \\(W\' = W + BA\\). LoRA trained \\(65\\,536 / 16\\,777\\,216 = 1/256\\) of the numbers.', do: [['set', 'BA', { state: 'ok' }], ['var', 'share', '0.39%']] }
      ] },
    example: { given: 'One weight matrix with \\(d = k = 4096\\). LoRA rank \\(r = 8\\).',
      steps: ['Full matrix: \\(d \\cdot k = 4096 \\times 4096 = 16\\,777\\,216\\) numbers.', 'B: \\(d \\cdot r = 4096 \\times 8 = 32\\,768\\). A: \\(r \\cdot k = 8 \\times 4096 = 32\\,768\\).', 'LoRA total: \\(32\\,768 + 32\\,768 = 65\\,536\\).', 'Share: \\(65\\,536 / 16\\,777\\,216 = 1/256 \\approx 0.39\\) percent.', 'A model with 32 layers and 4 such matrices per layer: \\(128 \\times 65\\,536 = 8\\,388\\,608\\) trainable numbers, about 8.4M instead of 2.1 billion.'],
      result: '256× fewer trainable numbers per matrix. The adapter file is megabytes, not gigabytes.' },
    lab: { h: 'Pick a rank', body: 'Square matrix (d = k). The bar for LoRA is drawn to the same scale as the full matrix.', size: [800, 320],
      controls: [{ id: 'd', type: 'range', label: 'Matrix size d = k', min: 512, max: 8192, step: 512, value: 4096 }, { id: 'r', type: 'range', label: 'Rank r', min: 1, max: 64, step: 1, value: 8 }],
      view: s => { const full = s.v.d * s.v.d, lora = 2 * s.v.d * s.v.r;
        return { nodes: { f: G1_bar(250, 240, 'Full', G1_n(full), { y: 290, w: 120, kind: 'a' }), l: G1_bar(520, 240 * lora / full, 'LoRA', G1_n(lora), { y: 290, w: 120, kind: 'b', state: 'ok' }) },
          vars: { 'd · r + r · k': G1_n(s.v.d) + ' × ' + s.v.r + ' × 2', share: (100 * lora / full).toFixed(2) + '%' } }; },
      readout: s => [['Fewer by', (s.v.d / (2 * s.v.r)).toFixed(1) + '×']] },
    pitfalls: ['LoRA still loads the full model for training and use. It cuts trainable numbers and optimizer memory, not the size of W. QLoRA adds 4-bit quantization of W for that.', 'Real LoRA scales the update by \\(\\alpha / r\\): \\(W\' = W + \\frac{\\alpha}{r} BA\\). If you change r, revisit α.', 'Too small an r can underfit a hard task; too big wastes memory. 8 to 16 is a common start.'],
    code: 'def lora_params(d: int, k: int, r: int) -> tuple[int, int]:\n    return d * r + r * k, d * k        # (LoRA, full)\n\nlora, full = lora_params(4096, 4096, 8)\nprint(lora, full, full // lora)       # 65536 16777216 256',
    lang: 'Python'
  }
};

;
// Glossary deep dives, part 2: retrieval math (embeddings, similarity, vector indexes, ranking, RAG evals).
// Every number in the examples and labs was checked by hand and by script.
const G2_fmt = n => n >= 1e9 ? +(n / 1e9).toFixed(1) + 'B' : n >= 1e6 ? +(n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? +(n / 1e3).toFixed(1) + 'k' : String(Math.round(n));
const G2_num = n => Math.round(n).toLocaleString('en-US');

const DEEP_2 = {
  'embedding': {
    intuition: 'An embedding model reads a text and returns a list of numbers. Treat that list as **coordinates**: the text becomes a point on a map of meaning. Texts that mean similar things land close together, even when they share no words ("puppy" lands near "dog").\n\nA toy model could use 2 numbers: "how much is this about animals?" and "how much is it about money?". Real models use hundreds or thousands of numbers (for example 1,536), and no single number has a human name. The idea stays the same: **close points = close meaning**.\n\nEach model draws its own map. A vector from model A and a vector from model B are coordinates on two different maps, so comparing them is meaningless.',
    formula: ['\\vec{v} = \\text{embed}(\\text{text}) = (v_1, v_2, \\ldots, v_d)', '\\text{similar meaning} \\Rightarrow \\text{small distance between } \\vec{v} \\text{ and } \\vec{w}'],
    symbols: [['\\vec{v}', 'the embedding: one point (vector) for one text'], ['v_i', 'the i-th number (coordinate) in the list'], ['d', 'the number of dimensions, fixed by the model (e.g. 1,536)'], ['\\text{embed}', 'the embedding model, called through an API']],
    figure: { h: 'A toy 2-D meaning map', size: [800, 380],
      nodes: {
        xa: { x: 390, y: 365, label: 'x → more about animals', shape: 'text', w: 200 },
        ya: { x: 420, y: 30, label: 'y ↑ more about money', shape: 'text', w: 200 }
      },
      steps: [
        { cap: 'Each text becomes a point. Here x = "about animals", y = "about money". cat = (9, 1), dog = (7, 2).', do: [['add', 'cat', { x: 630, y: 315, label: 'cat', sub: '(9, 1)', shape: 'pill', w: 90, kind: 'c' }], ['add', 'dog', { x: 510, y: 285, label: 'dog', sub: '(7, 2)', shape: 'pill', w: 90, kind: 'c' }]] },
        { cap: 'Money words land top-left: invoice = (1, 9), refund = (3, 7). Far from the animals.', do: [['add', 'inv', { x: 150, y: 75, label: 'invoice', sub: '(1, 9)', shape: 'pill', w: 90, kind: 'd' }], ['add', 'ref', { x: 270, y: 135, label: 'refund', sub: '(3, 7)', shape: 'pill', w: 90, kind: 'd' }]] },
        { cap: 'A query is embedded by the same model: "my puppy is sick" = (8, 5).', do: [['add', 'q', { x: 570, y: 195, label: 'puppy is sick', sub: 'query (8, 5)', shape: 'pill', w: 120, kind: 'a', state: 'active' }]] },
        { cap: 'Search = find the closest points. dog is 3.16 away, cat 4.12. invoice is 8.06 away.', do: [['link', 'q', 'dog', { label: '3.16', tone: 'ok' }], ['link', 'q', 'cat', { label: '4.12', dash: true }], ['set', 'dog', { state: 'ok' }], ['focus', 'q', 'dog', 'cat']] },
        { cap: 'Real models use about 1,536 numbers, not 2. You cannot draw it, but "close = similar" still holds.', do: [['var', 'dimensions', '2 here, 1,536 in real models']] },
        { cap: 'Embed the query with a different model and its numbers mean something else. On this map it lands near refund: nonsense.', do: [['unlink', 'q', 'dog'], ['unlink', 'q', 'cat'], ['move', 'q', 270, 225], ['set', 'q', { state: 'bad', sub: 'model B (3, 4)' }], ['link', 'q', 'ref', { label: '3.00', tone: 'bad' }]] }
      ] },
    example: { given: 'Toy 2-D vectors: query \\(q = (8, 5)\\), dog \\(= (7, 2)\\), cat \\(= (9, 1)\\), refund \\(= (3, 7)\\), invoice \\(= (1, 9)\\). Distance is \\(\\sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}\\).',
      steps: [
        'dog: \\(\\sqrt{(8 - 7)^2 + (5 - 2)^2}\\) \\(= \\sqrt{1 + 9}\\) \\(= \\sqrt{10}\\) \\(\\approx 3.16\\)',
        'cat: \\(\\sqrt{(8 - 9)^2 + (5 - 1)^2}\\) \\(= \\sqrt{1 + 16}\\) \\(= \\sqrt{17}\\) \\(\\approx 4.12\\)',
        'refund: \\(\\sqrt{(8 - 3)^2 + (5 - 7)^2}\\) \\(= \\sqrt{25 + 4}\\) \\(= \\sqrt{29}\\) \\(\\approx 5.39\\)',
        'invoice: \\(\\sqrt{(8 - 1)^2 + (5 - 9)^2}\\) \\(= \\sqrt{49 + 16}\\) \\(= \\sqrt{65}\\) \\(\\approx 8.06\\)'],
      result: 'Ranked by distance: dog, cat, refund, invoice. The two animal texts come first, which is what "search by meaning" means. A real 1,536-D vector works the same way, just with 1,536 terms under the square root.' },
    pitfalls: [
      'Never mix models. Store the model name next to each vector, and re-embed everything when you change models.',
      'The dimension is fixed by the model. A `vector(1536)` column rejects a 3,072-number vector with an error.',
      'Embed the query with the same model (and the same settings, such as a query/document input type) as the stored chunks.',
      'Close in meaning is not the same as true or relevant. "Refunds are allowed" and "Refunds are not allowed" land very close together.'],
    code: 'from openai import OpenAI\nclient = OpenAI()\nr = client.embeddings.create(model="text-embedding-3-small", input=["my puppy is sick"])\nvec = r.data[0].embedding\nprint(len(vec))   # 1536 numbers = one point in 1,536-D space', lang: 'Python'
  },

  'cosine similarity': {
    intuition: 'Draw two [[embedding|embeddings]] as arrows from the same starting point. Cosine similarity only asks: **do they point the same way?** It ignores how long the arrows are.\n\nSame direction gives 1. At right angles (nothing in common) gives 0. Opposite directions give −1. Text embeddings mostly land between about 0 and 1.\n\nWhy ignore length? Length often tracks things like text length, not meaning. Direction is the meaning. Many embedding APIs return vectors already scaled to length 1. Then cosine similarity is just the dot product, the cheapest possible calculation.',
    formula: ['\\cos\\theta = \\frac{\\vec{u} \\cdot \\vec{v}}{\\lVert \\vec{u} \\rVert \\, \\lVert \\vec{v} \\rVert}', '\\vec{u} \\cdot \\vec{v} = \\sum_{i=1}^{d} u_i v_i', '\\lVert \\vec{u} \\rVert = \\sqrt{\\sum_{i=1}^{d} u_i^2}', '\\text{cosine distance} = 1 - \\cos\\theta'],
    symbols: [['\\vec{u}, \\vec{v}', 'the two vectors (e.g. a query and a chunk)'], ['\\theta', 'the angle between the two arrows'], ['\\vec{u} \\cdot \\vec{v}', 'the dot product: multiply matching numbers, then add them all up'], ['\\lVert \\vec{u} \\rVert', 'the length of u: square every number, add, take the square root'], ['d', 'the number of dimensions'], ['1 - \\cos\\theta', 'cosine distance; this is what pgvector\'s `<=>` returns (0 = same direction)']],
    figure: { h: 'Angle, not length', size: [800, 380],
      nodes: { o: { x: 360, y: 260, label: '0', shape: 'circle', w: 30, kind: 'n' } },
      steps: [
        { cap: 'Vector u = (4, 3). Its length is \\(\\sqrt{4^2 + 3^2} = \\sqrt{25} = 5\\).', do: [['add', 'u', { x: 540, y: 125, label: 'u = (4, 3)', shape: 'pill', w: 100, kind: 'a' }], ['link', 'o', 'u', { label: 'length 5' }]] },
        { cap: 'Vector v = (0, 4). Its length is 4.', do: [['add', 'v', { x: 360, y: 80, label: 'v = (0, 4)', shape: 'pill', w: 100, kind: 'b' }], ['link', 'o', 'v', { label: 'length 4' }]] },
        { cap: 'Dot product: multiply matching numbers and add. \\(4 \\cdot 0 + 3 \\cdot 4 = 12\\).', do: [['var', 'u·v', '12'], ['focus', 'o', 'u', 'v']] },
        { cap: 'Divide by both lengths: \\(\\cos\\theta = \\frac{12}{5 \\cdot 4} = 0.6\\). The angle is about 53°.', do: [['var', 'cos(u, v)', '0.6'], ['set', 'v', { state: 'ok' }]] },
        { cap: 'p = (−3, 4) is at a right angle to u: \\(4 \\cdot (-3) + 3 \\cdot 4 = 0\\), so cos = 0. Nothing in common.', do: [['add', 'p', { x: 225, y: 80, label: 'p = (−3, 4)', shape: 'pill', w: 100, kind: 'n' }], ['link', 'o', 'p', { dash: true }], ['var', 'cos(u, p)', '0'], ['focus', 'o', 'u', 'p']] },
        { cap: 'z = (−2, −1.5) points exactly backwards: \\(\\frac{-8 - 4.5}{5 \\cdot 2.5} = -1\\). Half as long, still exactly −1.', do: [['add', 'z', { x: 270, y: 328, label: 'z = (−2, −1.5)', shape: 'pill', w: 125, kind: 'e' }], ['link', 'o', 'z', { tone: 'bad' }], ['var', 'cos(u, z)', '−1'], ['focus', 'o', 'u', 'z']] }
      ] },
    example: { given: 'Three 3-D vectors: \\(u = (1, 2, 2)\\), \\(v = (2, 1, 2)\\) and \\(w = (2, 4, 4)\\). Note that w is just u doubled.',
      steps: [
        'Dot product: \\(u \\cdot v\\) \\(= 1 \\cdot 2 + 2 \\cdot 1 + 2 \\cdot 2\\) \\(= 2 + 2 + 4\\) \\(= 8\\).',
        'Lengths: \\(\\lVert u \\rVert = \\sqrt{1 + 4 + 4} = \\sqrt{9} = 3\\) and \\(\\lVert v \\rVert = \\sqrt{4 + 1 + 4} = 3\\).',
        'Cosine: \\(\\cos\\theta = \\frac{8}{3 \\cdot 3} = \\frac{8}{9} \\approx 0.889\\). Very similar (about 27°).',
        'u and w: \\(u \\cdot w = 2 + 8 + 8 = 18\\), \\(\\lVert w \\rVert = 6\\), so \\(\\cos = \\frac{18}{3 \\cdot 6} = 1\\). Same direction.',
        'Plain dot product would say w (18) beats v (8) only because w is longer. Euclidean distance says the opposite: \\(u\\) to \\(v\\) is \\(\\sqrt{1 + 1 + 0} \\approx 1.41\\), but \\(u\\) to \\(w\\) is \\(\\sqrt{1 + 4 + 4} = 3\\).',
        'Normalise first (divide each vector by its length): \\(\\hat{u} = (\\frac{1}{3}, \\frac{2}{3}, \\frac{2}{3})\\), \\(\\hat{v} = (\\frac{2}{3}, \\frac{1}{3}, \\frac{2}{3})\\). Their dot product is \\(\\frac{2 + 2 + 4}{9} = \\frac{8}{9}\\): the same cosine.'],
      result: 'cos(u, v) ≈ 0.889 and cos(u, w) = 1. Cosine ignores length; dot product and Euclidean distance do not. For vectors of length 1, all three give the same ranking.' },
    lab: { h: 'Turn the arrows', body: 'u has length 3 and v has length 2. Turn them and watch the cosine. The dot product is always \\(6 \\cos\\theta\\) here, because \\(3 \\times 2 = 6\\).', size: [800, 380],
      controls: [{ id: 'a', type: 'range', label: 'Angle of u', min: 0, max: 345, step: 15, value: 30, unit: '°' }, { id: 'b', type: 'range', label: 'Angle of v', min: 0, max: 345, step: 15, value: 75, unit: '°' }],
      view: s => {
        const r = Math.PI / 180, a = s.v.a * r, b = s.v.b * r;
        let th = Math.abs(s.v.a - s.v.b) % 360; if (th > 180) th = 360 - th;
        const c = Math.cos(th * r), ok = c > 0.7 ? 'ok' : c < 0 ? 'bad' : undefined;
        return { nodes: {
            o: { x: 400, y: 190, label: '0', shape: 'circle', w: 28, kind: 'n' },
            u: { x: 400 + 150 * Math.cos(a), y: 190 - 150 * Math.sin(a), label: 'u', shape: 'circle', w: 30, kind: 'a' },
            v: { x: 400 + 90 * Math.cos(b), y: 190 - 90 * Math.sin(b), label: 'v', shape: 'circle', w: 30, kind: 'b', state: ok } },
          edges: [['o', 'u'], ['o', 'v']],
          vars: { 'angle θ': th + '°', 'cos θ': c.toFixed(3), 'u · v': (6 * c).toFixed(2) } };
      },
      readout: s => { const r = Math.PI / 180, a = s.v.a * r, b = s.v.b * r, c = Math.cos(a - b);
        return [['u', '(' + (3 * Math.cos(a)).toFixed(2) + ', ' + (3 * Math.sin(a)).toFixed(2) + ')'], ['v', '(' + (2 * Math.cos(b)).toFixed(2) + ', ' + (2 * Math.sin(b)).toFixed(2) + ')'], ['cosine similarity', c.toFixed(3)], ['cosine distance (<=>)', (1 - c).toFixed(3)], ['Euclidean distance', Math.sqrt(Math.max(0, 13 - 12 * c)).toFixed(2)]]; } },
    pitfalls: [
      'pgvector\'s `<=>` returns cosine **distance** (1 − similarity). Sort ascending for "most similar first".',
      'A score of 0.8 is not "80% relevant". Each model has its own typical range, so set thresholds by testing on your own data.',
      'If your vectors are already length 1, use the dot product (`<#>` in pgvector, which returns the negative dot product). It gives the same order and is cheaper.',
      'A zero vector has length 0, and dividing by 0 gives nonsense. Filter out empty texts before embedding.'],
    code: 'import numpy as np\n\ndef cosine(u, v):\n    return np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))\n\ncosine([1, 2, 2], [2, 1, 2])   # 0.888...\ncosine([1, 2, 2], [2, 4, 4])   # 1.0  (same direction, twice as long)', lang: 'Python'
  },

  'nearest neighbour': {
    intuition: 'The simplest vector search is exact: measure the distance from the query to **every** stored vector, sort, and keep the k smallest. This is called exact k-nearest-neighbour (kNN) search. It never misses, so its [[recall]] is 100%.\n\nThe catch is the cost. Each distance on a d-dimensional vector needs d multiply-and-add steps. With N vectors, one query costs N × d of them, plus reading every vector from memory. That grows in a straight line with your data.\n\nThis is why vector indexes such as [[HNSW]] and [[IVFFlat]] exist. They check only a small part of the data and accept a small chance of missing the true nearest one.',
    formula: ['\\text{nearest} = \\argmin_{i} \\, \\text{dist}(\\vec{q}, \\vec{x}_i)', '\\text{work per query} = N \\times d \\text{ multiply-adds}', '\\text{memory read} = N \\times d \\times 4 \\text{ bytes}'],
    symbols: [['\\vec{q}', 'the query vector'], ['\\vec{x}_i', 'stored vector number i'], ['\\argmin_{i}', '"the i that gives the smallest value"'], ['N', 'how many vectors are stored'], ['d', 'dimensions per vector (e.g. 1,536)'], ['4', 'bytes per number (a 32-bit float)']],
    figure: { h: 'Exact search checks everything', size: [800, 380],
      nodes: {
        q: { x: 400, y: 190, label: 'q', shape: 'circle', w: 44, kind: 'a', state: 'active' },
        A: { x: 480, y: 30, label: 'A', shape: 'circle', w: 44, kind: 'n' }, B: { x: 640, y: 110, label: 'B', shape: 'circle', w: 44, kind: 'n' },
        C: { x: 320, y: 110, label: 'C', shape: 'circle', w: 44, kind: 'n' }, D: { x: 160, y: 350, label: 'D', shape: 'circle', w: 44, kind: 'n' },
        E: { x: 560, y: 350, label: 'E', shape: 'circle', w: 44, kind: 'n' }, F: { x: 240, y: 190, label: 'F', shape: 'circle', w: 44, kind: 'n' }
      },
      steps: [
        { cap: 'A query q arrives. Exact search has no shortcut: it must measure the distance to every stored vector.', do: [['focus', 'q'], ['var', 'distances computed', 0]] },
        { cap: 'Measure A, B and C. Each number is a real distance on this grid, e.g. C: \\(\\sqrt{1 + 1} \\approx 1.41\\).', do: [['send', 'q', 'A'], ['send', 'q', 'B'], ['send', 'q', 'C'], ['set', 'A', { sub: '2.24' }], ['set', 'B', { sub: '3.16' }], ['set', 'C', { sub: '1.41' }], ['var', 'distances computed', 3]] },
        { cap: 'Then D, E and F. That is N = 6 distances for one query.', do: [['send', 'q', 'D'], ['send', 'q', 'E'], ['send', 'q', 'F'], ['set', 'D', { sub: '3.61' }], ['set', 'E', { sub: '2.83' }], ['set', 'F', { sub: '2.00' }], ['var', 'distances computed', 6]] },
        { cap: 'Sort and keep the k = 2 smallest: C (1.41) and F (2.00). Guaranteed correct.', do: [['set', 'C', { state: 'ok' }], ['set', 'F', { state: 'ok' }], ['link', 'q', 'C', { tone: 'ok' }], ['link', 'q', 'F', { tone: 'ok' }], ['focus', 'q', 'C', 'F']] },
        { cap: 'Each real distance costs d = 1,536 multiply-adds. Work per query = N × d, and it grows with every row you add.', do: [['var', 'work', '6 × 1,536 = 9,216']] }
      ] },
    example: { given: 'A knowledge base with \\(N = \\text{1,000,000}\\) chunks, each a \\(d = 1536\\) vector of 4-byte floats.',
      steps: [
        'Work per query: \\(N \\times d\\) \\(= \\text{1,000,000} \\times 1536\\) \\(= \\text{1,536,000,000}\\) multiply-adds (about 1.5 billion).',
        'Memory to read: \\(\\text{1,000,000} \\times 1536 \\times 4\\) \\(= \\text{6,144,000,000}\\) bytes, about 6.1 GB, for every single query.',
        'If memory streams at about 20 GB per second, just reading the data takes \\(6.1 / 20 \\approx 0.3\\) seconds per query, on a machine doing nothing else.',
        'An HNSW index might compute only about 2,000 distances: \\(\\text{2,000} \\times 1536\\) \\(= \\text{3,072,000}\\) multiply-adds.',
        'Ratio: \\(\\text{1,536,000,000} / \\text{3,072,000}\\) \\(= 500\\). The index does about 500 times less work.'],
      result: 'Exact kNN is perfect but costs N × d per query. At 1 million chunks that is 1.5 billion multiply-adds and 6.1 GB read per query, so an approximate index is the practical choice.' },
    pitfalls: [
      'Exact search is fine for small data. Under roughly 10,000–100,000 vectors, a plain scan is often fast enough and has perfect recall.',
      'In pgvector, a query with no usable vector index silently becomes an exact scan. Check with `EXPLAIN` that the index is used.',
      'A `WHERE` filter plus an approximate index can return fewer than k rows, because the index finds neighbours first and the filter removes some.',
      '"Nearest" depends on the distance you pick (cosine, dot product, Euclidean). Use the one your embedding model recommends.'],
    code: 'import numpy as np\n\ndef knn(X, q, k=5):\n    d = np.linalg.norm(X - q, axis=1)   # N distances, each costs d multiply-adds\n    return np.argsort(d)[:k]            # indexes of the k closest rows\n\n# SQL with no vector index = the same exact scan:\n# SELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 5;', lang: 'Python'
  },

  'HNSW': {
    intuition: 'Think of travelling to a street address. You take a motorway to the right city, then main roads to the right area, then side streets to the house. You never look at every street in the country.\n\nHNSW builds the same idea from your vectors. **Layer 0** holds every vector, each linked to its closest neighbours. Each layer above holds only about 1 in M of the vectors below it, with longer links. A search starts at a fixed **entry point** on the top layer and hops **greedily**: move to whichever neighbour is closer to the query, and stop when none is. Then it drops one layer and repeats.\n\nEach layer is about M times smaller, so there are only about \\(\\log_M N\\) layers, with a few hops on each. That is why search cost grows like \\(\\log N\\), not N. On layer 0 the search keeps a list of the best `ef_search` candidates (pgvector default: 40) instead of just one, which raises [[recall]].',
    formula: ['P(\\text{a vector reaches layer } \\ge L) = M^{-L}', '\\text{vectors on layer } L \\approx \\frac{N}{M^{L}}', '\\text{number of layers} \\approx \\log_M N', '\\text{search cost} \\approx O(\\log N) \\text{ distance checks}'],
    symbols: [['N', 'how many vectors are stored'], ['M', 'max links per vector per layer (pgvector `m`, default 16; layer 0 allows 2M)'], ['L', 'a layer number; 0 is the bottom layer, which holds everything'], ['\\text{ef}_{\\text{search}}', 'how many candidates layer 0 keeps while searching (pgvector `hnsw.ef_search`, default 40)'], ['\\text{ef}_{\\text{construction}}', 'the same idea while building the graph (default 64); higher = better graph, slower build']],
    figure: { h: 'One search, top layer to bottom', size: [800, 380],
      nodes: {
        g2: { x: 335, y: 70, label: 'Layer 2', shape: 'group', w: 600, h: 100 }, g1: { x: 335, y: 190, label: 'Layer 1', shape: 'group', w: 600, h: 100 }, g0: { x: 335, y: 310, label: 'Layer 0 (all)', shape: 'group', w: 600, h: 100 },
        a2: { x: 70, y: 80, label: 'A', shape: 'circle', w: 44, kind: 'b' }, e2: { x: 370, y: 80, label: 'E', shape: 'circle', w: 44, kind: 'b' },
        a1: { x: 70, y: 200, label: 'A', shape: 'circle', w: 44, kind: 'b' }, c1: { x: 220, y: 200, label: 'C', shape: 'circle', w: 44, kind: 'b' }, e1: { x: 370, y: 200, label: 'E', shape: 'circle', w: 44, kind: 'b' }, h1: { x: 595, y: 200, label: 'H', shape: 'circle', w: 44, kind: 'b' },
        a0: { x: 70, y: 320, label: 'A', shape: 'circle', w: 44, kind: 'b' }, b0: { x: 145, y: 320, label: 'B', shape: 'circle', w: 44, kind: 'b' }, c0: { x: 220, y: 320, label: 'C', shape: 'circle', w: 44, kind: 'b' }, d0: { x: 295, y: 320, label: 'D', shape: 'circle', w: 44, kind: 'b' },
        e0: { x: 370, y: 320, label: 'E', shape: 'circle', w: 44, kind: 'b' }, f0: { x: 445, y: 320, label: 'F', shape: 'circle', w: 44, kind: 'b' }, g0n: { x: 520, y: 320, label: 'G', shape: 'circle', w: 44, kind: 'b' }, h0: { x: 595, y: 320, label: 'H', shape: 'circle', w: 44, kind: 'b' },
        q: { x: 720, y: 190, label: 'query', sub: 'at position 7.2', shape: 'pill', w: 120, kind: 'a', state: 'active' }
      },
      edges: [['a2', 'e2', { arrow: false }], ['a1', 'c1', { arrow: false }], ['c1', 'e1', { arrow: false }], ['e1', 'h1', { arrow: false }],
        ['a0', 'b0', { arrow: false }], ['b0', 'c0', { arrow: false }], ['c0', 'd0', { arrow: false }], ['d0', 'e0', { arrow: false }], ['e0', 'f0', { arrow: false }], ['f0', 'g0n', { arrow: false }], ['g0n', 'h0', { arrow: false }],
        ['e2', 'e1', { arrow: false, dash: true }], ['h1', 'h0', { arrow: false, dash: true }]],
      steps: [
        { cap: 'Vectors A–H sit at positions 1–8 on a line; the query is at 7.2. Start at the entry point A on the top layer: distance 6.2.', do: [['set', 'a2', { state: 'active', sub: '6.2' }], ['var', 'distances checked', 1]] },
        { cap: 'A\'s only neighbour up here is E, distance 2.2. Closer, so hop to E. One long link skipped B, C and D.', do: [['send', 'a2', 'e2'], ['set', 'a2', { state: 'off' }], ['set', 'e2', { state: 'active', sub: '2.2' }], ['var', 'distances checked', 2]] },
        { cap: 'E has no closer neighbour on layer 2. Drop down to E on layer 1 and keep going from there.', do: [['send', 'e2', 'e1'], ['set', 'e1', { state: 'active', sub: '2.2' }]] },
        { cap: 'On layer 1, E\'s neighbours are C (4.2) and H (0.8). H is closer: hop to H.', do: [['set', 'c1', { sub: '4.2' }], ['send', 'e1', 'h1'], ['set', 'h1', { state: 'active', sub: '0.8' }], ['var', 'distances checked', 4]] },
        { cap: 'Drop to layer 0 at H. Its neighbour G is only 0.2 away: hop to G.', do: [['send', 'h1', 'h0'], ['send', 'h0', 'g0n'], ['set', 'g0n', { state: 'active', sub: '0.2' }], ['var', 'distances checked', 5]] },
        { cap: 'G\'s other neighbour F is 1.2 away, farther. Stop: G is the nearest. 5 checks here; 1 million vectors need only a few thousand.', do: [['set', 'f0', { sub: '1.2' }], ['set', 'g0n', { state: 'ok' }], ['var', 'distances checked', 6], ['focus', 'g0n', 'q']] }
      ] },
    example: { given: '\\(N = \\text{1,000,000}\\) vectors and \\(M = 16\\). Each layer keeps about 1 in 16 of the vectors below it.',
      steps: [
        'Layer 0: all \\(\\text{1,000,000}\\) vectors.',
        'Layer 1: \\(\\text{1,000,000} / 16\\) \\(= \\text{62,500}\\). Layer 2: \\(\\text{62,500} / 16 \\approx \\text{3,906}\\).',
        'Layer 3: \\(\\text{3,906} / 16 \\approx 244\\). Layer 4: \\(244 / 16 \\approx 15\\). Layer 5: about 1, the entry point.',
        'Check with the formula: \\(\\log_{16} \\text{1,000,000}\\) \\(= \\frac{\\log \\, \\text{1,000,000}}{\\log \\, 16}\\) \\(= \\frac{6}{1.204}\\) \\(\\approx 4.98\\), so about 5 layers above layer 0.',
        'A search makes a few hops per layer, checking up to 16 neighbours per hop (32 on layer 0), with ef_search = 40 candidates at the bottom. That is roughly a few thousand distance checks, not 1,000,000.'],
      result: 'About 6 layers in total. A query touches a few thousand vectors instead of a million, which is why HNSW stays fast as data grows.' },
    lab: { h: 'How tall is the graph?', body: 'Each bar is one layer; its label is about how many vectors it holds, \\(N / M^{L}\\). Bar height uses a log scale. More data adds only a layer or so.', size: [800, 380],
      controls: [{ id: 'e', type: 'range', label: 'Vectors N = 10^', min: 3, max: 9, value: 6 }, { id: 'm', type: 'range', label: 'Links per vector M', min: 8, max: 48, step: 8, value: 16 }],
      view: s => { const N = Math.pow(10, s.v.e), M = s.v.m, nodes = {};
        for (let L = 0; N / Math.pow(M, L) >= 1; L++) { const c = N / Math.pow(M, L); nodes['l' + L] = { x: 75 + 70 * L, y: 340, label: G2_fmt(c), sub: 'L' + L, shape: 'bar', w: 60, h: 12 + 30 * Math.log10(c), kind: L ? 'b' : 'a' }; }
        return { nodes, vars: { layers: Object.keys(nodes).length, 'log_M N': (Math.log(N) / Math.log(M)).toFixed(1) } }; },
      readout: s => { const N = Math.pow(10, s.v.e), M = s.v.m; return [['N', G2_num(N)], ['layers above layer 0 ≈ log_M N', (Math.log(N) / Math.log(M)).toFixed(2)], ['index links (about N × 2M on layer 0)', G2_fmt(N * 2 * M)]]; } },
    pitfalls: [
      'HNSW is approximate. Raise `hnsw.ef_search` (e.g. 40 → 100) when recall is too low; queries get a little slower.',
      'The graph lives best in RAM. If the index does not fit in memory, search slows down sharply.',
      'Building is slow and memory-hungry for large tables. Raise `maintenance_work_mem` before `CREATE INDEX`.',
      'With a `WHERE` filter, the index may return fewer than k rows. Newer pgvector versions have iterative scans to help.'],
    code: '-- pgvector: build an HNSW index for cosine distance\nCREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops)\n  WITH (m = 16, ef_construction = 64);\n\nSET hnsw.ef_search = 100;   -- more candidates = higher recall, slower\nSELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 5;', lang: 'SQL'
  },

  'IVFFlat': {
    intuition: 'Picture a library that sorts its books into shelves by topic. To find a book, you first pick the shelf whose label best matches, then look at every book on that shelf only.\n\nIVFFlat does this with vectors. At build time it runs **k-means**: it finds `lists` centre points (centroids) and puts each vector in the list of its closest centroid. At query time it compares the query with every centroid, picks the `probes` closest lists, and scans those lists exactly ("flat").\n\nThe risk: the true nearest vector can sit just over the border, in a list you did not probe. More probes means higher [[recall]] but more work. The centroids are frozen at build time, so after many inserts the lists become lopsided and you should rebuild.',
    formula: ['\\text{rows per list} \\approx \\frac{N}{\\text{lists}}', '\\text{distances per query} \\approx \\text{lists} + \\text{probes} \\times \\frac{N}{\\text{lists}}', '\\text{lists} \\approx \\sqrt{N}, \\quad \\text{probes} \\approx \\sqrt{\\text{lists}} \\quad \\text{(starting points)}'],
    symbols: [['N', 'how many vectors are stored'], ['\\text{lists}', 'how many clusters k-means makes (set when you create the index)'], ['\\text{probes}', 'how many of the closest lists a query scans (pgvector `ivfflat.probes`, default 1)'], ['\\text{centroid}', 'the average point of one list; the query is compared with every centroid first']],
    figure: { h: 'Probe the closest list, or two', size: [800, 380],
      nodes: {
        L1: { x: 140, y: 225, label: 'List 1', shape: 'group', w: 220, h: 270 }, L2: { x: 400, y: 225, label: 'List 2', shape: 'group', w: 220, h: 270 }, L3: { x: 660, y: 225, label: 'List 3', shape: 'group', w: 220, h: 270 },
        c1: { x: 140, y: 150, label: 'c1', shape: 'circle', w: 44, kind: 'd' }, c2: { x: 400, y: 150, label: 'c2', shape: 'circle', w: 44, kind: 'd' }, c3: { x: 660, y: 150, label: 'c3', shape: 'circle', w: 44, kind: 'd' },
        A: { x: 90, y: 240, label: 'A', shape: 'circle', w: 40, kind: 'n' }, B: { x: 190, y: 310, label: 'B', shape: 'circle', w: 40, kind: 'n' },
        C: { x: 340, y: 250, label: 'C', shape: 'circle', w: 40, kind: 'n' }, D: { x: 450, y: 310, label: 'D', shape: 'circle', w: 40, kind: 'n' },
        E: { x: 590, y: 240, label: 'E', shape: 'circle', w: 40, kind: 'n' }, F: { x: 710, y: 310, label: 'F', shape: 'circle', w: 40, kind: 'n' },
        q: { x: 520, y: 40, label: 'query', shape: 'pill', w: 100, kind: 'a', state: 'active' }
      },
      steps: [
        { cap: 'Build time: k-means split the vectors into 3 lists. Each list has a centroid (c1, c2, c3): the average of its points.', do: [['focus', 'c1', 'c2', 'c3']] },
        { cap: 'A query arrives. First compare it with the centroids only: 3 distance checks.', do: [['send', 'q', 'c1'], ['send', 'q', 'c2'], ['send', 'q', 'c3'], ['set', 'c2', { state: 'active' }], ['var', 'distances', 3]] },
        { cap: 'c2 is the closest centroid. With probes = 1, scan only List 2: C and D. Best found: D.', do: [['send', 'q', 'C'], ['send', 'q', 'D'], ['set', 'D', { state: 'ok', sub: 'best' }], ['var', 'distances', 5], ['var', 'probes', 1]] },
        { cap: 'But the true nearest vector is E, just over the border in List 3. probes = 1 missed it.', do: [['set', 'E', { state: 'warn', sub: 'missed' }], ['note', 'E', 'true nearest']] },
        { cap: 'Set probes = 2: also scan List 3, the next-closest centroid. E is found. 2 more checks bought the right answer.', do: [['send', 'q', 'E'], ['send', 'q', 'F'], ['set', 'E', { state: 'ok', sub: 'best' }], ['set', 'D', { state: undefined, sub: '' }], ['var', 'distances', 7], ['var', 'probes', 2]] },
        { cap: 'probes = lists would scan everything: exact again, and slow. Pick probes by measuring recall on real queries.', do: [['focus', 'q', 'E', 'c2', 'c3']] }
      ] },
    example: { given: '\\(N = \\text{1,000,000}\\) vectors. Use \\(\\text{lists} \\approx \\sqrt{N}\\) and \\(\\text{probes} \\approx \\sqrt{\\text{lists}}\\).',
      steps: [
        'Lists: \\(\\sqrt{\\text{1,000,000}} = \\text{1,000}\\). (pgvector\'s rule of thumb, rows ÷ 1,000 for up to 1 million rows, gives the same 1,000.)',
        'Rows per list: \\(\\text{1,000,000} / \\text{1,000}\\) \\(= \\text{1,000}\\).',
        'Probes: \\(\\sqrt{\\text{1,000}} \\approx 31.6\\), so about 32.',
        'Distances per query: \\(\\text{1,000} + 32 \\times \\text{1,000}\\) \\(= \\text{33,000}\\).',
        'Share of the table touched: \\(\\text{33,000} / \\text{1,000,000}\\) \\(= 0.033\\), or 3.3%, about 30 times less work than exact search.',
        'Why \\(\\sqrt{N}\\)? With probes = 1 the cost is \\(\\text{lists} + \\frac{N}{\\text{lists}}\\). That sum is smallest when both parts are equal: \\(\\text{lists} = \\sqrt{N}\\), giving \\(\\text{1,000} + \\text{1,000} = \\text{2,000}\\).'],
      result: '1,000 lists and 32 probes scan about 33,000 vectors (3.3%) per query. Raise probes if recall is too low; lower it if queries are too slow.' },
    lab: { h: 'Lists vs probes', body: '1,000,000 vectors. Change lists and probes and see how many distances one query computes.', size: [800, 380],
      controls: [{ id: 'lists', type: 'range', label: 'lists', min: 100, max: 5000, step: 100, value: 1000 }, { id: 'probes', type: 'range', label: 'probes', min: 1, max: 100, value: 10 }],
      view: s => { const N = 1e6, L = s.v.lists, P = s.v.probes, scan = L + P * N / L, share = scan / N;
        return { nodes: {
            ex: { x: 200, y: 340, label: '1M', sub: 'exact', shape: 'bar', w: 80, h: 280, kind: 'n' },
            iv: { x: 360, y: 340, label: G2_fmt(scan), sub: 'IVFFlat', shape: 'bar', w: 80, h: Math.max(6, Math.min(290, 280 * share)), kind: 'a' },
            p1: { x: 620, y: 90, label: 'centroid checks: ' + G2_num(L), shape: 'pill', w: 240, kind: 'd' },
            p2: { x: 620, y: 190, label: 'rows scanned: ' + G2_num(P * N / L), shape: 'pill', w: 240, kind: 'b' },
            p3: { x: 620, y: 290, label: 'share of table: ' + (100 * share).toFixed(1) + '%', shape: 'pill', w: 240, kind: share > 0.2 ? 'e' : 'c' } },
          vars: { 'rows per list': G2_num(N / L), 'distances': G2_num(scan) } }; },
      readout: s => { const N = 1e6, L = s.v.lists, P = s.v.probes, scan = L + P * N / L; return [['distances per query', G2_num(scan)], ['vs exact', (N / scan).toFixed(1) + '× less work'], ['probes / lists', (100 * P / L).toFixed(1) + '% of lists scanned']]; } },
    pitfalls: [
      'Build the index **after** loading data. k-means on an empty or tiny table gives useless centroids.',
      'After big inserts or deletes, the old centroids no longer fit the data. Lists get uneven and recall drops. Run `REINDEX` after large changes.',
      'The default `ivfflat.probes` is 1, which often gives poor recall. Set it per session or query.',
      'Compared with HNSW, IVFFlat builds faster and uses less memory, but usually has lower recall at the same speed.'],
    code: '-- pgvector: build after the table is loaded\nCREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops)\n  WITH (lists = 1000);\n\nSET ivfflat.probes = 32;\nSELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 5;\n\nREINDEX INDEX chunks_embedding_idx;   -- after large inserts', lang: 'SQL'
  },

  'recall': {
    intuition: 'Recall answers: **of everything that should have been found, how much was found?** If 4 chunks in your knowledge base answer the question and your search returns 2 of them, recall is 2 out of 4 = 0.5.\n\nPrecision is its partner: **of what was returned, how much was useful?** The "@k" means you only look at the top k results, for example the 5 chunks you put in the prompt.\n\nThe word is also used for vector indexes. There, "relevant" means "the true nearest neighbours that an exact search would return". An HNSW index with 0.95 recall@10 finds, on average, 9.5 of the true top 10.',
    formula: ['\\text{recall@}k = \\frac{\\text{relevant results in the top } k}{\\text{all relevant results}}', '\\text{precision@}k = \\frac{\\text{relevant results in the top } k}{k}'],
    symbols: [['k', 'how many top results you look at (e.g. the 5 chunks sent to the model)'], ['\\text{relevant}', 'results a human (or a [[golden dataset]]) marked as truly useful for this question'], ['\\text{recall@}k', '0 to 1; 1 means nothing relevant was missed'], ['\\text{precision@}k', '0 to 1; 1 means every returned result was useful']],
    figure: { h: 'Grading one search', size: [800, 380],
      nodes: {
        t1: { x: 400, y: 40, label: 'Top 5 returned by the search', shape: 'text', w: 300 },
        r1: { x: 100, y: 110, label: 'c2', sub: 'rank 1', w: 110, kind: 'a' }, r2: { x: 250, y: 110, label: 'c3', sub: 'rank 2', w: 110, kind: 'a' }, r3: { x: 400, y: 110, label: 'c5', sub: 'rank 3', w: 110, kind: 'a' }, r4: { x: 550, y: 110, label: 'c8', sub: 'rank 4', w: 110, kind: 'a' }, r5: { x: 700, y: 110, label: 'c1', sub: 'rank 5', w: 110, kind: 'a' },
        g2: { x: 175, y: 290, label: 'c2', shape: 'pill', w: 110, kind: 'c' }, g5: { x: 325, y: 290, label: 'c5', shape: 'pill', w: 110, kind: 'c' }, g7: { x: 475, y: 290, label: 'c7', shape: 'pill', w: 110, kind: 'c' }, g9: { x: 625, y: 290, label: 'c9', shape: 'pill', w: 110, kind: 'c' },
        t2: { x: 400, y: 360, label: 'Truly relevant (from the golden dataset)', shape: 'text', w: 360 }
      },
      steps: [
        { cap: 'The search returned 5 chunks (top row). The golden dataset says 4 chunks truly answer this question (bottom row).', do: [['var', 'k', 5], ['var', 'relevant', 4]] },
        { cap: 'Rank 1, c2, is relevant: a hit.', do: [['set', 'r1', { state: 'ok' }], ['set', 'g2', { state: 'ok' }], ['link', 'r1', 'g2', { tone: 'ok' }], ['var', 'hits', 1]] },
        { cap: 'Rank 3, c5, is also relevant: a second hit.', do: [['set', 'r3', { state: 'ok' }], ['set', 'g5', { state: 'ok' }], ['link', 'r3', 'g5', { tone: 'ok' }], ['var', 'hits', 2]] },
        { cap: 'c3, c8 and c1 are not relevant. They take up prompt space for nothing.', do: [['set', 'r2', { state: 'bad' }], ['set', 'r4', { state: 'bad' }], ['set', 'r5', { state: 'bad' }]] },
        { cap: 'c7 and c9 were never returned: missed. recall@5 = 2 found ÷ 4 relevant = 0.5.', do: [['set', 'g7', { state: 'warn' }], ['set', 'g9', { state: 'warn' }], ['var', 'recall@5', '2/4 = 0.5']] },
        { cap: 'precision@5 = 2 hits ÷ 5 slots = 0.4. Two of the five chunks were useful.', do: [['var', 'precision@5', '2/5 = 0.4'], ['focus', 'r1', 'r3', 'g2', 'g5']] }
      ] },
    example: { given: 'Relevant chunks for a question: {c2, c5, c7, c9} (4 in total). The search returns, in order: c2, c3, c5, c8, c1, c7, c4, c9, c6, c10.',
      steps: [
        'Top 5 = c2, c3, c5, c8, c1. Relevant among them: c2 and c5, so 2 hits.',
        '\\(\\text{recall@5} = \\frac{2}{4} = 0.5\\) and \\(\\text{precision@5}\\) \\(= \\frac{2}{5}\\) \\(= 0.4\\).',
        'Top 10 adds c7 and c9, so 4 hits. \\(\\text{recall@10} = \\frac{4}{4} = 1.0\\) and \\(\\text{precision@10}\\) \\(= \\frac{4}{10}\\) \\(= 0.4\\).',
        'Index recall: an exact search\'s true top 10 and the HNSW top 10 share 9 ids, so the index recall@10 is \\(\\frac{9}{10} = 0.9\\).'],
      result: 'A bigger k raises recall (more is found) but usually lowers precision (more junk). A [[reranker]] helps you get both: retrieve many, keep the best few.' },
    pitfalls: [
      'Recall needs labelled answers. Without a golden dataset you cannot measure it, only guess.',
      'Low recall in RAG means the model never sees the fact. No prompt change can fix that; fix retrieval (chunking, k, hybrid search).',
      'Do not confuse index recall (ANN vs exact search) with retrieval recall (vs human labels). A perfect index can still retrieve the wrong chunks.',
      'Average recall over many questions. One query tells you very little.'],
    code: 'def recall_at_k(retrieved, relevant, k):\n    hits = len(set(retrieved[:k]) & set(relevant))\n    return hits / len(relevant)\n\ndef precision_at_k(retrieved, relevant, k):\n    return len(set(retrieved[:k]) & set(relevant)) / k\n\nrecall_at_k(["c2","c3","c5","c8","c1"], ["c2","c5","c7","c9"], 5)   # 0.5', lang: 'Python'
  },

  'BM25': {
    intuition: 'BM25 scores how well a document matches the words of a query. It follows three common-sense rules.\n\n**1. Rare words matter more.** A match on "E42" (in 3 documents) means more than a match on "the" (in all of them). This weight is the IDF (inverse document frequency).\n**2. Repeats help, but less and less.** Saying "timeout" twice is better than once, but not twice as good. The parameter \\(k_1\\) controls how fast the bonus levels off.\n**3. Long documents get a small penalty.** A 5,000-word page mentions everything once by chance. The parameter b controls how strongly length counts.\n\nThe score for a document is the sum over the query words. Words not in the document add 0.',
    formula: ['\\text{score}(q, D) = \\sum_{t \\in q} \\mathrm{IDF}(t) \\cdot \\frac{f(t, D) \\cdot (k_1 + 1)}{f(t, D) + k_1 \\cdot (1 - b + b \\cdot \\frac{|D|}{\\text{avgdl}})}', '\\mathrm{IDF}(t) = \\ln(\\frac{N - n(t) + 0.5}{n(t) + 0.5} + 1)'],
    symbols: [['t', 'one word (term) of the query q'], ['f(t, D)', 'how many times t appears in document D (term frequency)'], ['|D|', 'the length of D in words'], ['\\text{avgdl}', 'the average document length in the collection'], ['N', 'the number of documents'], ['n(t)', 'how many documents contain t at least once'], ['k_1', 'repeat saturation, usually 1.2; the score for one word can never pass \\(\\mathrm{IDF} \\cdot (k_1 + 1)\\)'], ['b', 'length normalisation from 0 (ignore length) to 1 (full effect), usually 0.75'], ['\\ln', 'the natural logarithm']],
    figure: { h: 'Scoring 3 documents for "timeout refund"', size: [800, 380],
      nodes: {
        q: { x: 100, y: 190, label: 'timeout refund', sub: 'query', shape: 'pill', w: 140, kind: 'a', state: 'active' },
        d1: { x: 390, y: 65, label: 'D1 · 4 words', sub: 'refund ×1', w: 180, kind: 'c' },
        d2: { x: 390, y: 190, label: 'D2 · 4 words', sub: 'refund ×1, timeout ×1', w: 180, kind: 'c' },
        d3: { x: 390, y: 315, label: 'D3 · 10 words', sub: 'refund ×1, timeout ×2', w: 180, kind: 'c' }
      },
      steps: [
        { cap: 'IDF: refund is in all 3 docs, timeout in 2. \\(\\ln(\\frac{0.5}{3.5} + 1) = 0.134\\) and \\(\\ln(\\frac{1.5}{2.5} + 1) = 0.470\\).', do: [['var', 'IDF(refund)', '0.134'], ['var', 'IDF(timeout)', '0.470']] },
        { cap: 'Length: avgdl = 18 ÷ 3 = 6. A 4-word doc gets \\(1.2 \\cdot (0.25 + 0.75 \\cdot \\frac{4}{6})\\) \\(= 0.9\\); the 10-word D3 gets 1.8.', do: [['set', 'd1', { sub: 'refund ×1 · K = 0.9' }], ['set', 'd2', { sub: 'K = 0.9' }], ['set', 'd3', { sub: 'K = 1.8' }], ['var', 'avgdl', 6]] },
        { cap: 'D1 has only refund: \\(0.134 \\cdot \\frac{1 \\cdot 2.2}{1 + 0.9}\\) \\(= 0.134 \\cdot 1.158\\) \\(= 0.155\\).', do: [['add', 's1', { x: 680, y: 65, label: '0.155', shape: 'pill', w: 110, kind: 'n' }], ['link', 'd1', 's1'], ['send', 'q', 'd1']] },
        { cap: 'D2 has both words once: \\((0.134 + 0.470) \\cdot 1.158\\) \\(= 0.699\\).', do: [['add', 's2', { x: 680, y: 190, label: '0.699', shape: 'pill', w: 110, kind: 'n' }], ['link', 'd2', 's2'], ['send', 'q', 'd2']] },
        { cap: 'D3 says timeout twice but is long: \\(\\frac{2 \\cdot 2.2}{2 + 1.8} = 1.158\\), no more than one mention in a short doc. Total 0.649.', do: [['add', 's3', { x: 680, y: 315, label: '0.649', shape: 'pill', w: 110, kind: 'n' }], ['link', 'd3', 's3'], ['send', 'q', 'd3']] },
        { cap: 'Ranking: D2 (0.699) > D3 (0.649) > D1 (0.155). Matching the rare word timeout is what lifted D2 and D3.', do: [['set', 's2', { state: 'ok', label: '#1 0.699' }], ['set', 's3', { label: '#2 0.649' }], ['set', 's1', { state: 'off', label: '#3 0.155' }]] }
      ] },
    example: { given: 'Query "timeout refund". D1 = "refund within thirty days" (4 words). D2 = "refund after payment timeout" (4 words). D3 = "gateway timeout causes a second timeout and a refund request" (10 words). \\(k_1 = 1.2\\), \\(b = 0.75\\), \\(N = 3\\).',
      steps: [
        'Average length: \\(\\text{avgdl} = \\frac{4 + 4 + 10}{3} = 6\\).',
        'refund is in 3 docs: \\(\\mathrm{IDF}\\) \\(= \\ln(\\frac{3 - 3 + 0.5}{3 + 0.5} + 1)\\) \\(= \\ln(1.1429)\\) \\(= 0.1335\\).',
        'timeout is in 2 docs: \\(\\mathrm{IDF}\\) \\(= \\ln(\\frac{3 - 2 + 0.5}{2 + 0.5} + 1)\\) \\(= \\ln(1.6)\\) \\(= 0.4700\\).',
        'Length factor for 4 words: \\(k_1 (1 - b + b \\frac{4}{6})\\) \\(= 1.2 \\cdot (0.25 + 0.5)\\) \\(= 0.9\\). For 10 words: \\(1.2 \\cdot (0.25 + 1.25)\\) \\(= 1.8\\).',
        'Repeat part, f = 1 in a 4-word doc: \\(\\frac{1 \\cdot 2.2}{1 + 0.9} = 1.1579\\). f = 1 in D3: \\(\\frac{2.2}{2.8} = 0.7857\\). f = 2 in D3: \\(\\frac{4.4}{3.8} = 1.1579\\).',
        'D1 \\(= 0.1335 \\times 1.1579\\) \\(= 0.1546\\).',
        'D2 \\(= 0.1335 \\times 1.1579 + 0.4700 \\times 1.1579\\) \\(= 0.1546 + 0.5442\\) \\(= 0.6988\\).',
        'D3 \\(= 0.1335 \\times 0.7857 + 0.4700 \\times 1.1579\\) \\(= 0.1049 + 0.5442\\) \\(= 0.6491\\).'],
      result: 'D2 (0.699) > D3 (0.649) > D1 (0.155). D3 said "timeout" twice, but its length cancelled the bonus exactly: 2 mentions in 10 words scored the same as 1 mention in 4 words.' },
    lab: { h: 'Saturation and length', body: 'Each bar is the repeat part of the formula for a word that appears tf times. The bars can never pass \\(k_1 + 1\\). Try k1 = 0, b = 0, and a long document.', size: [800, 380],
      controls: [{ id: 'k1', type: 'range', label: 'k1', min: 0, max: 3, step: 0.1, value: 1.2 }, { id: 'b', type: 'range', label: 'b', min: 0, max: 1, step: 0.05, value: 0.75 }, { id: 'r', type: 'range', label: 'doc length ÷ avgdl', min: 0.5, max: 3, step: 0.25, value: 1 }],
      view: s => { const k1 = s.v.k1, K = k1 * (1 - s.v.b + s.v.b * s.v.r), nodes = { cap: { x: 400, y: 28, label: 'ceiling k1 + 1 = ' + (k1 + 1).toFixed(1), shape: 'text', w: 260 } };
        for (let f = 1; f <= 8; f++) { const val = f * (k1 + 1) / (f + K); nodes['t' + f] = { x: 110 + 82 * (f - 1), y: 345, label: val.toFixed(2), sub: 'tf=' + f, shape: 'bar', w: 56, h: Math.max(6, 70 * val), kind: 'b' }; }
        return { nodes, vars: { 'K = k1(1 − b + b·len)': K.toFixed(2) } }; },
      readout: s => { const k1 = s.v.k1, K = k1 * (1 - s.v.b + s.v.b * s.v.r), v = f => f * (k1 + 1) / (f + K);
        return [['tf = 1', v(1).toFixed(3)], ['tf = 2', v(2).toFixed(3)], ['2nd mention adds', (100 * (v(2) / v(1) - 1)).toFixed(0) + '%'], ['tf = 8 vs tf = 1', (v(8) / v(1)).toFixed(2) + '×']]; } },
    pitfalls: [
      'BM25 matches exact words only. "cancel" does not match "unsubscribe"; that is what vector search adds. Combine both with [[hybrid search]].',
      'PostgreSQL\'s built-in `ts_rank` is not BM25: it has no IDF. Use an extension (for example ParadeDB\'s pg_search) or a search engine for real BM25.',
      'IDF depends on the whole collection, so scores change as documents are added. Compare scores only within one query.',
      'Some engines (Lucene 8+) drop the \\((k_1 + 1)\\) factor. Scores differ, but the ranking is the same.'],
    code: 'import math\n\ndef bm25(query, doc, docs, k1=1.2, b=0.75):\n    N = len(docs); avgdl = sum(len(d) for d in docs) / N\n    score = 0.0\n    for t in query:\n        n = sum(t in d for d in docs)\n        idf = math.log((N - n + 0.5) / (n + 0.5) + 1)\n        f = doc.count(t)\n        score += idf * f * (k1 + 1) / (f + k1 * (1 - b + b * len(doc) / avgdl))\n    return score\n\ndocs = [s.split() for s in ["refund within thirty days", "refund after payment timeout",\n        "gateway timeout causes a second timeout and a refund request"]]\n[round(bm25(["timeout", "refund"], d, docs), 4) for d in docs]   # [0.1546, 0.6988, 0.6491]', lang: 'Python'
  },

  'RRF': {
    intuition: '[[hybrid search]] gives you two ranked lists: one from [[BM25]] (scores like 12.4) and one from vector search (scores like 0.83). The scores are on different scales, so you cannot just add them.\n\nReciprocal Rank Fusion ignores the scores and uses only the **positions**. A result at rank r in a list earns \\(\\frac{1}{60 + r}\\). Add up what each result earns across the lists, then sort.\n\nThe 60 flattens the curve. Rank 1 earns only a little more than rank 5, so a result that is fairly high in **both** lists beats one that is first in only one list.',
    formula: ['\\text{RRF}(d) = \\sum_{r \\in R} \\frac{1}{k + \\text{rank}_r(d)}', 'k = 60'],
    symbols: [['d', 'one result (a chunk or document)'], ['R', 'the set of ranked lists being merged (e.g. BM25 and vector)'], ['\\text{rank}_r(d)', 'the position of d in list r, starting at 1; if d is not in list r, that list adds nothing'], ['k', 'a smoothing constant; 60 is the standard choice from the original paper']],
    figure: { h: 'Merging two ranked lists', size: [800, 420],
      nodes: {
        hb: { x: 110, y: 25, label: 'BM25 list', shape: 'text', w: 120 }, hv: { x: 330, y: 25, label: 'Vector list', shape: 'text', w: 120 }, hm: { x: 640, y: 25, label: 'RRF merged', shape: 'text', w: 120 },
        b1: { x: 110, y: 80, label: '1. A', sub: 'score 12.4', shape: 'pill', w: 120, kind: 'd' }, b2: { x: 110, y: 160, label: '2. B', sub: 'score 9.8', shape: 'pill', w: 120, kind: 'd' }, b3: { x: 110, y: 240, label: '3. C', sub: 'score 7.1', shape: 'pill', w: 120, kind: 'd' }, b4: { x: 110, y: 320, label: '4. D', sub: 'score 3.0', shape: 'pill', w: 120, kind: 'd' },
        v1: { x: 330, y: 80, label: '1. C', sub: 'cos 0.91', shape: 'pill', w: 120, kind: 'b' }, v2: { x: 330, y: 160, label: '2. A', sub: 'cos 0.88', shape: 'pill', w: 120, kind: 'b' }, v3: { x: 330, y: 240, label: '3. E', sub: 'cos 0.85', shape: 'pill', w: 120, kind: 'b' }, v4: { x: 330, y: 320, label: '4. B', sub: 'cos 0.80', shape: 'pill', w: 120, kind: 'b' }
      },
      steps: [
        { cap: 'Two searches, two ranked lists. 12.4 and 0.91 are on different scales, so RRF uses only the ranks.', do: [['focus', 'b1', 'b2', 'b3', 'b4', 'v1', 'v2', 'v3', 'v4']] },
        { cap: 'A is rank 1 in BM25 and rank 2 in vector: \\(\\frac{1}{61} + \\frac{1}{62} = 0.03252\\).', do: [['add', 'mA', { x: 640, y: 80, label: 'A 0.03252', shape: 'pill', w: 130, kind: 'c' }], ['send', 'b1', 'mA'], ['send', 'v2', 'mA']] },
        { cap: 'C is rank 3 in BM25 and rank 1 in vector: \\(\\frac{1}{63} + \\frac{1}{61} = 0.03227\\).', do: [['add', 'mC', { x: 640, y: 155, label: 'C 0.03227', shape: 'pill', w: 130, kind: 'c' }], ['send', 'b3', 'mC'], ['send', 'v1', 'mC']] },
        { cap: 'B is rank 2 and rank 4: \\(\\frac{1}{62} + \\frac{1}{64} = 0.03175\\).', do: [['add', 'mB', { x: 640, y: 230, label: 'B 0.03175', shape: 'pill', w: 130, kind: 'c' }], ['send', 'b2', 'mB'], ['send', 'v4', 'mB']] },
        { cap: 'E and D appear in one list only: E gets \\(\\frac{1}{63} = 0.01587\\), D gets \\(\\frac{1}{64} = 0.01563\\).', do: [['add', 'mE', { x: 640, y: 305, label: 'E 0.01587', shape: 'pill', w: 130, kind: 'n' }], ['add', 'mD', { x: 640, y: 380, label: 'D 0.01563', shape: 'pill', w: 130, kind: 'n' }], ['send', 'v3', 'mE'], ['send', 'b4', 'mD']] },
        { cap: 'Final order A, C, B, E, D. Being in both lists roughly doubles a score, so agreement wins.', do: [['set', 'mA', { state: 'ok' }], ['set', 'mC', { state: 'ok' }], ['set', 'mB', { state: 'ok' }], ['focus', 'mA', 'mC', 'mB', 'mE', 'mD']] }
      ] },
    example: { given: 'BM25 returns A, B, C, D. Vector search returns C, A, E, B. Use \\(k = 60\\).',
      steps: [
        'A: \\(\\frac{1}{60 + 1} + \\frac{1}{60 + 2}\\) \\(= 0.016393 + 0.016129\\) \\(= 0.032522\\).',
        'B: \\(\\frac{1}{62} + \\frac{1}{64}\\) \\(= 0.016129 + 0.015625\\) \\(= 0.031754\\).',
        'C: \\(\\frac{1}{63} + \\frac{1}{61}\\) \\(= 0.015873 + 0.016393\\) \\(= 0.032266\\).',
        'D (BM25 only): \\(\\frac{1}{64} = 0.015625\\). E (vector only): \\(\\frac{1}{63} = 0.015873\\).',
        'Sort high to low: A 0.03252, C 0.03227, B 0.03175, E 0.01587, D 0.01563.',
        'With k = 0 instead, rank 1 earns \\(\\frac{1}{1} = 1\\) and rank 2 only \\(\\frac{1}{2}\\): the top spot would dominate. k = 60 keeps the steps gentle.'],
      result: 'Merged order: A, C, B, E, D. Results found by both searches rise to the top.' },
    pitfalls: [
      'RRF throws away score size. A near-perfect BM25 match (an exact error code) counts the same as a weak rank 1. Give that list a weight if it matters.',
      'Fetch enough from each list (e.g. top 20–50) before fusing. A result missing from a short list gets nothing from it.',
      'The final RRF score is only good for sorting. Do not use it as a relevance threshold.',
      'Ranks start at 1, not 0. With 0-based ranks, every term is slightly off.'],
    code: 'def rrf(*lists, k=60):\n    scores = {}\n    for ranked in lists:\n        for rank, doc in enumerate(ranked, start=1):\n            scores[doc] = scores.get(doc, 0) + 1 / (k + rank)\n    return sorted(scores, key=scores.get, reverse=True)\n\nrrf(["A", "B", "C", "D"], ["C", "A", "E", "B"])   # [\'A\', \'C\', \'B\', \'E\', \'D\']', lang: 'Python'
  },

  'reranker': {
    intuition: 'Vector search uses a **bi-encoder**: the query and each chunk are turned into vectors **separately**, and then compared with [[cosine similarity]]. Chunk vectors are computed once, ahead of time, so search is fast. But the query and the chunk never "read" each other. "How do I cancel my plan?" can score high against "Plans and pricing overview" just because both are about plans.\n\nA reranker is usually a **cross-encoder**. It reads the query and one chunk **together**, as one input, and outputs a relevance score. It can notice that the chunk never mentions cancelling. That makes it much more accurate, but it must run once per (query, chunk) pair at query time, and nothing can be precomputed.\n\nSo you combine them: a fast first search picks about 20–50 candidates, the reranker scores only those, and the best 3–5 go into the prompt.',
    formula: ['s_{\\text{bi}}(q, d) = \\cos(E(q), E(d))', 's_{\\text{cross}}(q, d) = f(q, d)', '\\text{rerank cost} = n \\times t_{\\text{pair}}'],
    symbols: [['E(\\cdot)', 'the embedding model; E(d) is computed once, when the chunk is stored'], ['f(q, d)', 'the cross-encoder, which reads query and chunk together at query time'], ['n', 'how many candidates you rerank (e.g. 20)'], ['t_{\\text{pair}}', 'the cost of scoring one pair (time or tokens)']],
    figure: { h: 'Retrieve wide, rerank, keep few', size: [800, 380],
      nodes: {
        q: { x: 100, y: 185, label: 'cancel my plan?', sub: 'query', shape: 'pill', w: 150, kind: 'a', state: 'active' },
        c1: { x: 360, y: 50, label: 'Pricing overview', sub: 'cos 0.82', w: 170, kind: 'n' },
        c2: { x: 360, y: 140, label: 'How to cancel', sub: 'cos 0.80', w: 170, kind: 'n' },
        c3: { x: 360, y: 230, label: 'Plan comparison', sub: 'cos 0.79', w: 170, kind: 'n' },
        c4: { x: 360, y: 320, label: 'Refund on cancel', sub: 'cos 0.77', w: 170, kind: 'n' },
        ce: { x: 650, y: 185, label: 'Cross-encoder', sub: 'reads pairs', w: 150, kind: 'b' }
      },
      steps: [
        { cap: 'Stage 1: vector search ranks candidates by cosine. The top hit, "Pricing overview", is about plans, not cancelling.', do: [['send', 'q', 'c1'], ['send', 'q', 'c2'], ['send', 'q', 'c3'], ['send', 'q', 'c4'], ['var', 'candidates', '20 (top 4 shown)']] },
        { cap: 'Stage 2: the cross-encoder reads the query and each chunk together, one pair at a time.', do: [['send', 'c1', 'ce', 'pair'], ['send', 'c2', 'ce', 'pair'], ['send', 'c3', 'ce', 'pair'], ['send', 'c4', 'ce', 'pair'], ['set', 'ce', { state: 'active' }]] },
        { cap: 'New scores: chunks that actually explain cancelling score high; chunks that only share the topic score low.', do: [['set', 'c1', { sub: 'cos 0.82 → 0.12' }], ['set', 'c2', { sub: 'cos 0.80 → 0.91' }], ['set', 'c3', { sub: 'cos 0.79 → 0.08' }], ['set', 'c4', { sub: 'cos 0.77 → 0.75' }]] },
        { cap: 'Sort by the reranker score. The two useful chunks move to the top.', do: [['move', 'c2', 360, 50], ['move', 'c4', 360, 140], ['move', 'c1', 360, 230], ['move', 'c3', 360, 320]] },
        { cap: 'Keep the top 2 for the prompt. Precision of what the model reads goes from 2/4 to 2/2.', do: [['set', 'c2', { state: 'ok' }], ['set', 'c4', { state: 'ok' }], ['set', 'c1', { state: 'off' }], ['set', 'c3', { state: 'off' }], ['var', 'sent to model', 2]] }
      ] },
    example: { given: 'Vector search returns the top 20 candidates. Each (query, chunk) pair is about 300 tokens (a 20-token question plus a 280-token chunk). Among the 20, 4 chunks are relevant. Before reranking, 2 of them are in the top 5.',
      steps: [
        'Rerank work: \\(20 \\times 300 = \\text{6,000}\\) tokens through the cross-encoder per question.',
        'Doing it without stage 1, on a 1,000,000-chunk knowledge base: \\(\\text{1,000,000} \\times 300\\) \\(= \\text{300,000,000}\\) tokens per question. Impossible, which is why stage 1 exists.',
        'Before reranking: \\(\\text{precision@5}\\) \\(= \\frac{2}{5}\\) \\(= 0.4\\).',
        'After reranking, all 4 relevant chunks move into the top 5: \\(\\text{precision@5}\\) \\(= \\frac{4}{5}\\) \\(= 0.8\\).',
        'Recall cannot rise above what stage 1 found. If a relevant chunk was not among the 20, the reranker never sees it.'],
      result: 'Reranking 20 candidates costs about 6,000 tokens per question and, here, doubles precision@5 from 0.4 to 0.8.' },
    pitfalls: [
      'Reranking adds latency (often tens to hundreds of milliseconds). Batch all pairs into one call.',
      'Retrieve enough candidates. Reranking the top 5 into a new top 5 changes little; rerank 20–50.',
      'Cross-encoders have an input limit (often 512 tokens). Long chunks get cut off, and the cut part is ignored.',
      'Reranker scores are not comparable across queries. Use them to sort, and test any cutoff on your own data.'],
    code: 'from sentence_transformers import CrossEncoder\n\nce = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")\nscores = ce.predict([(query, c) for c in candidates])   # one score per pair\nranked = [c for _, c in sorted(zip(scores, candidates), key=lambda p: p[0], reverse=True)]\ntop = ranked[:5]', lang: 'Python'
  },

  'chunk overlap': {
    intuition: 'You cut a long document into [[chunk|chunks]] of s tokens. If you cut cleanly, a sentence on a border is split in two, and neither half makes sense on its own.\n\nWith overlap, each new chunk starts o tokens **before** the previous one ended. So each step forward is only \\(s - o\\) tokens (the stride). A sentence shorter than o that sits on a border is complete in at least one chunk.\n\nThe cost: overlapping text is stored, embedded and possibly sent to the model more than once. A typical overlap is 10–20% of the chunk size.',
    formula: ['n = \\lceil \\frac{L - o}{s - o} \\rceil \\quad (\\text{when } L > s; \\text{ otherwise } n = 1)', '\\text{stride} = s - o', '\\text{tokens stored} = L + (n - 1) \\cdot o'],
    symbols: [['L', 'the document length in tokens'], ['s', 'the chunk size in tokens'], ['o', 'the overlap in tokens (must be smaller than s)'], ['n', 'how many chunks you get'], ['\\lceil x \\rceil', 'round up to the next whole number (ceiling)']],
    figure: { h: 'A 1,300-token document, s = 500, o = 100', size: [800, 380],
      nodes: { doc: { x: 400, y: 60, label: 'Document: tokens 0 – 1,300', shape: 'pill', w: 650, kind: 'n' } },
      steps: [
        { cap: 'A 1,300-token document. We want chunks of s = 500 tokens with o = 100 tokens of overlap.', do: [['var', 's', 500], ['var', 'o', 100], ['var', 'L', '1,300']] },
        { cap: 'Chunk 1 covers tokens 0–500.', do: [['add', 'k1', { x: 200, y: 170, label: 'Chunk 1: 0–500', w: 250, kind: 'a' }], ['link', 'doc', 'k1']] },
        { cap: 'Step forward by the stride \\(s - o = 400\\). Chunk 2 covers 400–900, so tokens 400–500 appear twice.', do: [['add', 'k2', { x: 400, y: 270, label: 'Chunk 2: 400–900', w: 250, kind: 'b' }], ['link', 'doc', 'k2'], ['add', 'ov1', { x: 300, y: 350, label: '100', shape: 'pill', w: 50, kind: 'd' }]] },
        { cap: 'Chunk 3 covers 800–1,300 and reaches the end. Tokens 800–900 are shared with chunk 2.', do: [['add', 'k3', { x: 600, y: 170, label: 'Chunk 3: 800–1,300', w: 250, kind: 'a' }], ['link', 'doc', 'k3'], ['add', 'ov2', { x: 500, y: 350, label: '100', shape: 'pill', w: 50, kind: 'd' }]] },
        { cap: 'Check: \\(\\lceil \\frac{1300 - 100}{500 - 100} \\rceil\\) \\(= \\lceil 3 \\rceil\\) \\(= 3\\) chunks. Stored: 1,300 + 2 × 100 = 1,500 tokens.', do: [['var', 'n', 3], ['var', 'stored', '1,500 tokens']] },
        { cap: 'A sentence at tokens 430–490 would be cut at token 500 without overlap. Now it is whole in chunk 2.', do: [['note', 'ov1', 'sentence kept whole'], ['set', 'k2', { state: 'ok' }], ['focus', 'k1', 'k2', 'ov1']] }
      ] },
    example: { given: 'A document of \\(L = \\text{10,000}\\) tokens, chunk size \\(s = 500\\), overlap \\(o = 100\\). Each chunk becomes one 1,536-number vector (4 bytes per number).',
      steps: [
        'Stride: \\(s - o = 500 - 100 = 400\\) tokens.',
        'Chunks: \\(n\\) \\(= \\lceil \\frac{\\text{10,000} - 100}{400} \\rceil\\) \\(= \\lceil 24.75 \\rceil\\) \\(= 25\\).',
        'Check the last one: chunk 25 starts at \\(24 \\times 400 = \\text{9,600}\\) and covers 9,600–10,000 (only 400 tokens, which is fine).',
        'Without overlap: \\(\\lceil \\frac{\\text{10,000}}{500} \\rceil = 20\\) chunks.',
        'Tokens embedded: \\(\\text{10,000} + (25 - 1) \\times 100\\) \\(= \\text{12,400}\\), which is 24% more than the 10,000 without overlap.',
        'Vector storage: \\(25 \\times 1536 \\times 4 = \\text{153,600}\\) bytes vs \\(20 \\times 1536 \\times 4 = \\text{122,880}\\) bytes. Also 25% more.'],
      result: '25 chunks instead of 20, and about 24% more tokens to embed and store. The extra cost is roughly \\(\\frac{s}{s - o}\\), here \\(\\frac{500}{400} = 1.25\\).' },
    lab: { h: 'Size vs overlap', body: 'Change the document length, chunk size and overlap. The bars compare the original text with the tokens you will actually embed and store.', size: [800, 380],
      controls: [{ id: 'L', type: 'range', label: 'Document length L', min: 1000, max: 20000, step: 500, value: 10000 }, { id: 's', type: 'range', label: 'Chunk size s', min: 200, max: 1000, step: 50, value: 500 }, { id: 'o', type: 'range', label: 'Overlap o', min: 0, max: 150, step: 10, value: 100 }],
      view: s => { const L = s.v.L, S = s.v.s, o = s.v.o, n = L <= S ? 1 : Math.ceil((L - o) / (S - o)), stored = L + (n - 1) * o, n0 = Math.ceil(L / S);
        return { nodes: {
            t: { x: 180, y: 340, label: G2_fmt(L), sub: 'document', shape: 'bar', w: 90, h: 260 * L / stored, kind: 'n' },
            st: { x: 330, y: 340, label: G2_fmt(stored), sub: 'stored', shape: 'bar', w: 90, h: 260, kind: 'a' },
            p1: { x: 620, y: 90, label: 'chunks n = ' + n + ' (no overlap: ' + n0 + ')', shape: 'pill', w: 290, kind: 'b' },
            p2: { x: 620, y: 190, label: 'stride s − o = ' + (S - o), shape: 'pill', w: 290, kind: 'c' },
            p3: { x: 620, y: 290, label: 'extra tokens: +' + (100 * (stored - L) / L).toFixed(1) + '%', shape: 'pill', w: 290, kind: 'd' } },
          vars: { n: n, 'tokens stored': G2_num(stored) } }; },
      readout: s => { const L = s.v.L, S = s.v.s, o = s.v.o, n = L <= S ? 1 : Math.ceil((L - o) / (S - o)); return [['chunks', n], ['tokens stored', G2_num(L + (n - 1) * o)], ['overlap share of each chunk', (100 * o / S).toFixed(0) + '%']]; } },
    pitfalls: [
      'Overlap does not fix bad boundaries. Splitting on headings and paragraphs usually helps more than adding overlap.',
      'Overlapping chunks are near-duplicates. Retrieval can return two of them, wasting prompt space. Remove duplicates before building the prompt.',
      'Count tokens with the embedding model\'s [[tokenizer]], not characters. 500 characters is only about 125 tokens of English.',
      'Overlap must be smaller than the chunk size, or the stride is zero or negative and the loop never ends.'],
    code: 'def chunk(tokens, size=500, overlap=100):\n    step = size - overlap            # the stride\n    out = []\n    for start in range(0, len(tokens), step):\n        out.append(tokens[start:start + size])\n        if start + size >= len(tokens):\n            break\n    return out\n\nlen(chunk(list(range(10_000))))   # 25', lang: 'Python'
  },

  'faithfulness': {
    intuition: 'Faithfulness asks: **is everything the answer says backed up by the context we gave the model?** It does not ask whether the answer is true in the real world. It asks whether the model stuck to its sources.\n\nAn [[LLM-as-a-judge]] measures it in three steps. First, it splits the answer into small **claims**, each one checkable fact. Second, for each claim it asks: "Can this be inferred from the context? yes or no". Third, it divides the yes count by the number of claims.\n\nA claim that contradicts the context and a claim the context never mentions both count as unsupported. Either way, the model went beyond its sources. That is a [[hallucination]] risk.',
    formula: ['\\text{faithfulness} = \\frac{\\text{claims supported by the context}}{\\text{total claims in the answer}}'],
    symbols: [['\\text{claim}', 'one short, standalone fact taken from the answer'], ['\\text{supported}', 'the judge can infer the claim from the retrieved context alone'], ['\\text{faithfulness}', '0 to 1; 1.0 means every claim is backed by the context']],
    figure: { h: 'Judging one answer', size: [800, 380],
      nodes: {
        ans: { x: 110, y: 190, label: 'Answer', sub: '2 sentences', w: 150, kind: 'a' },
        ctx: { x: 690, y: 190, label: 'Context', sub: '3 chunks', shape: 'db', w: 150, kind: 'c' }
      },
      steps: [
        { cap: 'The judge splits the answer into small claims, one fact each. This answer has 4.', do: [['add', 'k1', { x: 400, y: 60, label: 'Pro costs $20/month', shape: 'pill', w: 230, kind: 'n' }], ['add', 'k2', { x: 400, y: 140, label: 'Yearly: 2 months free', shape: 'pill', w: 230, kind: 'n' }], ['add', 'k3', { x: 400, y: 220, label: 'Refund within 30 days', shape: 'pill', w: 230, kind: 'n' }], ['add', 'k4', { x: 400, y: 300, label: 'Includes priority support', shape: 'pill', w: 230, kind: 'n' }], ['send', 'ans', 'k1']] },
        { cap: 'Claim 1: the context says "Pro plan: $20 per month". Supported.', do: [['send', 'k1', 'ctx', 'check'], ['set', 'k1', { state: 'ok' }], ['var', 'supported', 1]] },
        { cap: 'Claim 2: the context says "annual billing: 2 months free". Supported.', do: [['send', 'k2', 'ctx', 'check'], ['set', 'k2', { state: 'ok' }], ['var', 'supported', 2]] },
        { cap: 'Claim 3: the context says refunds within **14** days. The answer contradicts it. Not supported.', do: [['send', 'k3', 'ctx', 'check'], ['set', 'k3', { state: 'bad' }], ['note', 'k3', 'context: 14 days']] },
        { cap: 'Claim 4: the context never mentions support. Maybe true, but not backed by the sources. Not supported.', do: [['send', 'k4', 'ctx', 'check'], ['set', 'k4', { state: 'bad' }]] },
        { cap: 'Faithfulness = 2 supported ÷ 4 claims = 0.5. Half of this answer went beyond its sources.', do: [['var', 'faithfulness', '2/4 = 0.5'], ['focus', 'k1', 'k2', 'k3', 'k4']] }
      ] },
    example: { given: 'Context: "Pro plan: $20 per month. Annual billing: 2 months free. Refunds within 14 days of purchase." Answer: "The Pro plan costs $20 a month, and paying yearly gets you two months free. You can get a refund within 30 days, and it includes priority support."',
      steps: [
        'Split into claims: (1) Pro costs $20/month. (2) Yearly billing gives 2 months free. (3) Refunds within 30 days. (4) Pro includes priority support.',
        'Claim 1: matches the context. Yes.',
        'Claim 2: matches the context. Yes.',
        'Claim 3: the context says 14 days, not 30. No.',
        'Claim 4: the context says nothing about support. No.',
        '\\(\\text{faithfulness}\\) \\(= \\frac{2}{4}\\) \\(= 0.5\\).'],
      result: 'Faithfulness 0.5. The fix is in the prompt or model ("answer only from the context"), not in retrieval: the right facts were there.' },
    pitfalls: [
      'Faithful is not the same as correct. If the context itself is wrong or out of date, a perfectly faithful answer is still wrong.',
      'An answer of "I don\'t know" has no claims, so the score is 0 ÷ 0. Decide up front how to score it (often 1.0, or skip it).',
      'The judge can be wrong too. Spot-check its verdicts by hand, and keep its rubric strict and short.',
      'Long, vague claims hide errors. Ask the judge for short, standalone claims.'],
    code: '# Two judge calls per answer (this is how RAGAS does it)\nclaims = judge_json("Split this answer into short standalone claims, one fact each. "\n                    "Return a JSON list of strings.", answer)\nverdicts = [judge(f"Context:\\n{context}\\n\\nCan this claim be inferred from the context alone? "\n                  f"Reply yes or no.\\nClaim: {c}") for c in claims]\nfaithfulness = sum(v == "yes" for v in verdicts) / max(len(claims), 1)', lang: 'Python'
  },

  'context recall': {
    intuition: '[[faithfulness]] checks the answer against the context. Context recall checks the **context** against the truth: did retrieval bring back every fact needed to answer?\n\nIt needs a [[golden dataset]]: a question plus a reference answer written by a person. A judge splits the reference answer into facts. Then, for each fact, it asks: "Is this fact present in the retrieved chunks? yes or no". The score is the share of facts that were found.\n\nLow context recall means the model never saw part of the answer. No prompt can fix that. Fix retrieval instead: chunking, k, [[hybrid search]], or a [[reranker]].',
    formula: ['\\text{context recall} = \\frac{\\text{ground-truth facts found in the retrieved context}}{\\text{total facts in the ground-truth answer}}'],
    symbols: [['\\text{ground-truth answer}', 'the hand-written reference answer from the golden dataset'], ['\\text{fact}', 'one short statement split out of the reference answer'], ['\\text{found}', 'the judge can attribute the fact to at least one retrieved chunk'], ['\\text{context recall}', '0 to 1; 1.0 means nothing needed was missing']],
    figure: { h: 'Did retrieval fetch every fact?', size: [800, 380],
      nodes: {
        f1: { x: 170, y: 80, label: 'Refunds within 14 days', shape: 'pill', w: 260, kind: 'd' },
        f2: { x: 170, y: 190, label: 'Annual: pro-rata refund', shape: 'pill', w: 260, kind: 'd' },
        f3: { x: 170, y: 300, label: 'Cancel in Billing tab', shape: 'pill', w: 260, kind: 'd' },
        k1: { x: 600, y: 80, label: 'Chunk 1: how to cancel', w: 230, kind: 'c' },
        k2: { x: 600, y: 190, label: 'Chunk 2: refund window', w: 230, kind: 'c' },
        k3: { x: 600, y: 300, label: 'Chunk 3: monthly prices', w: 230, kind: 'c' }
      },
      steps: [
        { cap: 'Left: the reference answer split into 3 facts. Right: the 3 chunks retrieval returned for this question.', do: [['var', 'facts', 3]] },
        { cap: 'Fact 1 (14-day window) is stated in chunk 2. Found.', do: [['link', 'f1', 'k2', { tone: 'ok' }], ['set', 'f1', { state: 'ok' }], ['var', 'found', 1]] },
        { cap: 'Fact 2 (annual plans get a pro-rata refund): no chunk mentions it. Missing.', do: [['set', 'f2', { state: 'bad' }], ['note', 'f2', 'not in any chunk']] },
        { cap: 'Fact 3 (cancel in the Billing tab) is in chunk 1. Found.', do: [['link', 'f3', 'k1', { tone: 'ok' }], ['set', 'f3', { state: 'ok' }], ['var', 'found', 2]] },
        { cap: 'Context recall = 2 ÷ 3 ≈ 0.67. Chunk 3 was not needed at all, but that hurts precision, not recall.', do: [['var', 'context recall', '2/3 ≈ 0.67'], ['set', 'k3', { state: 'off' }], ['focus', 'f1', 'f2', 'f3']] }
      ] },
    example: { given: 'Question: "How do I get a refund on my annual plan?" Reference answer: "You can get a refund within 14 days. Annual plans are refunded pro-rata. Cancel from the Billing tab first." Retrieved: chunk 1 (cancelling), chunk 2 (refund window), chunk 3 (monthly prices).',
      steps: [
        'Split the reference into facts: (1) refunds within 14 days, (2) annual plans refunded pro-rata, (3) cancel from the Billing tab.',
        'Fact 1: in chunk 2. Found.',
        'Fact 2: in no chunk. Missing.',
        'Fact 3: in chunk 1. Found.',
        '\\(\\text{context recall}\\) \\(= \\frac{2}{3}\\) \\(\\approx 0.67\\).',
        'Read it with faithfulness: if faithfulness is high but context recall is 0.67, the model behaved well, yet the answer is incomplete because retrieval missed a fact.'],
      result: 'Context recall 0.67: one of three needed facts never reached the model. Look at why the pro-rata chunk was not retrieved.' },
    pitfalls: [
      'It needs reference answers. Without a golden dataset you can only measure context precision, not recall.',
      'A vague reference answer gives vague facts. Write references as short, specific statements.',
      'Recall can be raised cheaply by retrieving more chunks, but that costs tokens and adds noise. Track precision alongside it.',
      'Average over many questions. One question with 3 facts can only score 0, 0.33, 0.67 or 1.'],
    code: '# One judge call per question (RAGAS-style)\nfacts = judge_json("Split this reference answer into short standalone facts. "\n                   "Return a JSON list of strings.", reference)\nfound = [judge(f"Context:\\n{context}\\n\\nIs this fact stated in or clearly implied by the context? "\n               f"Reply yes or no.\\nFact: {f}") for f in facts]\ncontext_recall = sum(v == "yes" for v in found) / len(facts)', lang: 'Python'
  }
};

;
// Assembles the course. Build: node ~/.claude/skills/learn-studio/scripts/build.mjs glossary.js capstone.js a.js b.js c.js d.js e.js p1.js p2.js p3.js g1.js g2.js course.js ../full-stack-ai.html
// Cross-file prerequisites (each lesson file only links needs inside itself).
B_streaming.needs = 'sampling'; B_structured.needs = 'streaming'; B_embeddings.needs = 'structured';
C_chunking.needs = 'embeddings'; D_tools.needs = 'rag'; E_evals.needs = 'mcp-obs';
P1_scaffold.needs = 'choose-approach'; P2_ingest.needs = 'cap-schema'; P3_agent.needs = 'cap-rag';

// Glossary: shared terms + per-file terms, then attach the math deep dives (g1.js, g2.js) to their terms.
const ALL_GLOSS = Object.assign({}, GLOSSARY, typeof A_GLOSS !== 'undefined' ? A_GLOSS : {}, typeof B_GLOSS !== 'undefined' ? B_GLOSS : {}, typeof C_GLOSS !== 'undefined' ? C_GLOSS : {}, typeof D_GLOSS !== 'undefined' ? D_GLOSS : {}, typeof E_GLOSS !== 'undefined' ? E_GLOSS : {}, typeof P1_GLOSS !== 'undefined' ? P1_GLOSS : {}, typeof P2_GLOSS !== 'undefined' ? P2_GLOSS : {}, typeof P3_GLOSS !== 'undefined' ? P3_GLOSS : {});
for (const [k, d] of Object.entries(Object.assign({}, typeof DEEP_1 !== 'undefined' ? DEEP_1 : {}, typeof DEEP_2 !== 'undefined' ? DEEP_2 : {}))) {
  const key = Object.keys(ALL_GLOSS).find(x => x.toLowerCase() === k.toLowerCase());
  if (key) ALL_GLOSS[key] = { def: typeof ALL_GLOSS[key] === 'string' ? ALL_GLOSS[key] : ALL_GLOSS[key].def, deep: d };
}

const COURSE = {
  id: 'ai-engineer-path',
  title: 'AI Engineering',
  subtitle: 'For full-stack web developers',
  tagline: 'You already know most of it. Treat the model as an API, then add context, tools and tests, one small safe step at a time. No math proofs required.',
  level: 'For frontend + backend devs · no ML math',
  // Brand mark: code brackets (your web stack) around an AI sparkle.
  icon: 'M6.5 7L2 12l4.5 5 M17.5 7l4.5 5-4.5 5 M12 7.2l1.35 3.45 3.45 1.35-3.45 1.35L12 16.8l-1.35-3.45L7.2 12l3.45-1.35z',
  outcomes: [
    'Call any LLM API from your backend safely: keys, tokens, retries and streaming',
    'Get typed, validated JSON out of a model with structured outputs',
    'Build RAG over your own docs with pgvector, hybrid search and reranking',
    'Let a model call your tools inside a guarded agent loop, and trace every step',
    'Prove quality with evals in CI and cut cost with prompt caching',
    'Choose between prompting, RAG, fine-tuning and local models with confidence',
    'Build and ship DocsBot, a portfolio-ready RAG app, step by step on your own machine'
  ],
  glossary: ALL_GLOSS,
  modules: [
    { title: 'The model is just an API', desc: 'Stage 1. Call a model like any slow, metered HTTP service: tokens, sampling dials, streaming and typed JSON.',
      lessons: [A_first_call, A_tokens, A_sampling, B_streaming, B_structured] },
    { title: 'Context and RAG', desc: 'Stage 2. Ground the model in your own data with embeddings, chunks, pgvector and hybrid retrieval.',
      lessons: [B_embeddings, C_chunking, C_pgvector, C_rag] },
    { title: 'Tools and agents', desc: 'Stage 3. Let the model ask your backend to do things, safely, in a loop you control and can trace.',
      lessons: [D_tools, D_agent_loop, D_mcp_obs] },
    { title: 'Production: tests, cost and choices', desc: 'Stage 4. Prove it works with evals, make it cheap with caching, and pick prompt vs RAG vs fine-tune vs local.',
      lessons: [E_evals, E_cost_cache, E_choose] },
    { title: 'Capstone: build DocsBot', desc: 'Stage 5. Build a real "chat with your docs" app on your own machine, one step per lesson. The project board shows your app growing after every step.',
      project: CAP_PROJECT, lessons: [P1_scaffold, P1_chat, P1_schema, P2_ingest, P2_rag, P3_agent, P3_ship] }
  ]
};

export default COURSE;
