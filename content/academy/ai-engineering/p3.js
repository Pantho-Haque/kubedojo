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
