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
