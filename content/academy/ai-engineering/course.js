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
