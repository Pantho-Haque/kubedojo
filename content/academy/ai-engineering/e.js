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
