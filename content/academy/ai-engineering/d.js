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
