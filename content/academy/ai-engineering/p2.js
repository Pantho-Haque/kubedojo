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
