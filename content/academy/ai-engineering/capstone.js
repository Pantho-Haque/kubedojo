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
