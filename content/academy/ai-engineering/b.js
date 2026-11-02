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
