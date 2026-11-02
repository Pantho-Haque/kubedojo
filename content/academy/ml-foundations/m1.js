// ML Foundations, Module 1: The engine room. Every number here was checked with node/numpy/torch.
const M1_GLOSS = {
  'reshape': 'Rearranging a tensor into a new shape without changing its numbers, e.g. [2, 4, 3] → [8, 3]. The total count must stay the same.',
  'bias': 'A learned number added after the weights in a layer: y = xW + b. It shifts the output, like the starting point of a line.',
  'mini-batch': 'A small slice of the training data (say 32 examples) used for one gradient-descent step. Much cheaper than using all the data each step.',
  'cosine similarity': 'How closely two vectors point the same way, from −1 to 1. It is the dot product of the two vectors after scaling each to length 1.',
  'forward pass': 'Running an input through the network layer by layer to get a prediction and a loss. Backpropagation then runs the other way.'
};

const M1_try = f => { try { return f(); } catch (e) { return undefined; } };
const M1_near = (a, b, tol) => typeof a === 'number' && Math.abs(a - b) < (tol || 1e-6);
const M1_fmt = (n, d) => (typeof n !== 'number' || !isFinite(n)) ? String(n) : String(+n.toFixed(d == null ? 3 : d));

// ---------- Lesson 1: tensors ----------
const M1_OPS = ['+ bias [384]', 'reshape [B·S, D]', '@ W [384, 10]'];
function M1_shapeOp(v) {
  const B = v.b, S = v.s, D = +v.d;
  if (v.op === M1_OPS[1]) return { ok: true, shape: [B * S, D] };
  if (D === 384) return { ok: true, shape: v.op === M1_OPS[0] ? [B, S, 384] : [B, S, 10] };
  return v.op === M1_OPS[0]
    ? { ok: false, why: 'dim 2: ' + D + ' ≠ 384', msg: 'size of tensor a (' + D + ') must match … b (384)' }
    : { ok: false, why: 'inner ' + D + ' ≠ 384', msg: 'mat1 and mat2 shapes cannot be multiplied (' + (B * S) + 'x' + D + ' and 384x10)' };
}
const M1_count = a => a.reduce((p, x) => p * x, 1).toLocaleString('en-US');

const M1_tensors = {
  id: 'ml-tensors', title: 'Tensors and shapes', mins: 8,
  goal: 'read a tensor\'s shape like a type, and predict when reshape, broadcasting or a layer will crash.',
  cards: [
    { t: 'read', h: 'Your first ML bug will be a shape error.',
      body: 'You feed 4 sentence embeddings into a classifier, and PyTorch crashes:\n\n`RuntimeError: mat1 and mat2 shapes cannot be multiplied (4x384 and 768x10)`\n\nThe data is fine. The **shapes** disagree. Your [[embedding]] model gives 384 numbers per sentence, but the layer expects 768. Reading [[shape|shapes]] fixes most bugs before they happen.',
      analogy: 'A shape is a type for numbers. `number[4][384]` will not fit where `number[n][768]` is expected. It is like passing a `User` where an `Order` belongs.' },
    { t: 'viz', h: 'From one number to a batch',
      body: 'Watch the shape grow, change, and finally crash.',
      nodes: { sc: { x: 90, y: 190, shape: 'circle', w: 80, label: '0.7', sub: 'shape [ ]', kind: 'a' } },
      steps: [
        { cap: 'A [[scalar]] is one number, like a temperature of 0.7. It has no axes, so its [[shape]] is `[]`.', do: [['var', 'numbers', 1]] },
        { cap: 'A [[vector]] is a list: one token as 3 numbers. Shape `[3]`. Real models use 384 or more.', do: [['add', 'vec', { x: 250, y: 190, w: 150, label: '[0.2, −1, 0.5]', sub: 'shape [3]', kind: 'a' }], ['var', 'numbers', 3]] },
        { cap: 'A [[matrix]] stacks vectors: one sentence of 4 tokens, 3 numbers each. Shape `[4, 3]`.', do: [['add', 'mat', { x: 440, y: 190, w: 110, h: 120, label: '4 × 3', sub: 'shape [4, 3]', kind: 'b' }], ['var', 'numbers', 12]] },
        { cap: 'Stack 2 sentences: a 3-D [[tensor]], shape `[2, 4, 3]`. Read it as B × S × D: batch, sequence, dims. 24 numbers.', do: [['add', 'ten', { x: 665, y: 190, w: 170, h: 200, label: '2 × 4 × 3', sub: '[B, S, D]', kind: 'c' }], ['var', 'numbers', 24]] },
        { cap: '[[reshape]] to `[8, 3]`: all 8 token rows in one list. Same 24 numbers, same order, new shape.', do: [['set', 'ten', { label: '8 × 3', sub: 'shape [8, 3]', h: 260 }], ['focus', 'ten'], ['var', 'numbers', 24]] },
        { cap: '[[broadcasting]]: add a [[bias]] of shape `[3]`. PyTorch copies it to all 8 rows. No loop, no error.', do: [['rm', 'sc'], ['rm', 'vec'], ['rm', 'mat'], ['add', 'bias', { x: 250, y: 190, label: '+ bias', sub: 'shape [3]', kind: 'd' }], ['link', 'bias', 'ten', 'copied to 8 rows']] },
        { cap: 'Multiply by W of shape `[4, 3]`: crash. The inner sizes, 3 and 4, differ. That is the hook\'s error.', do: [['set', 'bias', { label: '@ W', sub: 'shape [4, 3]', state: 'bad' }], ['set', 'ten', { state: 'bad' }], ['unlink', 'bias', 'ten'], ['link', 'bias', 'ten', { label: '3 ≠ 4', tone: 'bad' }], ['note', 'ten', 'mat1 and mat2 shapes (8x3 and 4x3)']] },
        { cap: 'Use W of shape `[3, 10]`. Inner sizes match, so `[8, 3] @ [3, 10]` gives `[8, 10]`. Rule: `[a, n] @ [n, b] → [a, b]`.', do: [['set', 'bias', { sub: 'shape [3, 10]', state: 'ok' }], ['set', 'ten', { label: '8 × 10', sub: 'shape [8, 10]', state: 'ok' }], ['unlink', 'bias', 'ten'], ['link', 'bias', 'ten', { label: '3 = 3', tone: 'ok' }], ['var', 'numbers', 80]] }
      ],
      predict: { at: 4, q: 'You reshape the `[2, 4, 3]` tensor into `[8, 3]`. How many numbers does it hold now?', options: ['24', '8', '11', '96'], answer: 0,
        why: 'A reshape never adds or drops numbers: 8 × 3 = 2 × 4 × 3 = 24. That is why `[8, 4]` would fail: it needs 32.' } },
    { t: 'quiz', q: 'You embed **16 sentences**, each padded to **128 tokens**, with `all-MiniLM-L6-v2` (384 dims). What shape are the token [[hidden state|hidden states]]?',
      options: ['`[16, 128, 384]`', '`[384, 128, 16]`', '`[16, 384]`', '`[2048]`'], answer: 0,
      why: 'Batch first, then sequence, then dims: B × S × D. One 384-number vector per token, per sentence.',
      whyNot: { 1: 'Reversed. By convention the batch axis comes first and the feature dims come last.', 2: 'That is the shape after mean pooling squeezes out the token axis. The raw hidden states still have one vector per token.', 3: '16 × 128 = 2,048 counts the tokens, but drops the 384 numbers each token carries.' } },
    { t: 'play', kind: 'controls', h: 'Shape a batch, then push it through a layer',
      body: 'Pick B, S and D, then an operation. Watch the output shape, or the crash.',
      init: () => ({}),
      controls: [
        { id: 'b', type: 'range', label: 'B (sentences)', min: 1, max: 32, value: 2 },
        { id: 's', type: 'range', label: 'S (tokens)', min: 1, max: 16, value: 4 },
        { id: 'd', type: 'select', label: 'D (dims)', options: ['384', '768', '3'], value: '384' },
        { id: 'op', type: 'select', label: 'Operation', options: M1_OPS, value: M1_OPS[0] }
      ],
      view: s => {
        const v = s.v, r = M1_shapeOp(v), inShape = [v.b, v.s, +v.d];
        return {
          nodes: {
            inp: { x: 120, y: 190, w: 170, label: '[' + inShape.join(', ') + ']', sub: M1_count(inShape) + ' numbers', kind: 'a' },
            op: { x: 400, y: 190, w: 160, shape: 'pill', label: v.op, kind: 'd' },
            out: { x: 670, y: 190, w: 180, label: r.ok ? '[' + r.shape.join(', ') + ']' : 'shape error', sub: r.ok ? M1_count(r.shape) + ' numbers' : r.why, kind: 'c', state: r.ok ? 'ok' : 'bad' }
          },
          edges: [['inp', 'op'], ['op', 'out', { tone: r.ok ? 'ok' : 'bad' }]],
          vars: { B: v.b, S: v.s, D: +v.d }
        };
      },
      readout: s => { const r = M1_shapeOp(s.v); return [['Input', '[' + [s.v.b, s.v.s, s.v.d].join(', ') + ']'], ['Output', r.ok ? '[' + r.shape.join(', ') + ']' : 'RuntimeError'], ['Message', r.ok ? 'none' : r.msg]]; },
      goals: [
        { text: 'Make a batch of **4 sentences × 8 tokens** of MiniLM vectors (D = 384)', check: s => s.v.b === 4 && s.v.s === 8 && +s.v.d === 384, solve: [{ b: 4, s: 8, d: '384' }] },
        { text: 'Push it through the layer `@ W [384, 10]` and get `[4, 8, 10]`', check: s => s.v.b === 4 && s.v.s === 8 && +s.v.d === 384 && s.v.op === M1_OPS[2], solve: [{ op: M1_OPS[2] }] },
        { text: 'Break it: change D so the layer crashes, then read the message', check: s => s.v.op === M1_OPS[2] && +s.v.d !== 384, solve: [{ d: '768' }] }
      ],
      hints: ['B and S are sliders. D is the drop-down.', 'The layer W is `[384, 10]`, so the input\'s last axis must be 384.', 'Pick `@ W [384, 10]`, then D = 768: the inner sizes 768 and 384 differ.'],
      done: 'This is real debugging: print `.shape` before and after every step, and check the inner sizes.' },
    { t: 'read', h: 'Common mistake: guessing shapes. Best practice: print them.',
      body: 'Shape bugs only show up at runtime, often deep inside a library. So print `.shape` after every step while you build.\n\nReshape only when the counts match. Pass `-1` for one axis and PyTorch works out that size for you.',
      code: 'import torch\nx = torch.randn(2, 4, 3)          # B, S, D\nprint(x.shape)                    # torch.Size([2, 4, 3])\nprint(x.reshape(-1, 3).shape)     # torch.Size([8, 3])\nprint((x + torch.zeros(3)).shape) # torch.Size([2, 4, 3]), broadcast\nx @ torch.randn(4, 3)\n# RuntimeError: mm: mat1 and mat2 shapes cannot be multiplied (8x3 and 4x3)', lang: 'Python' },
    { t: 'quiz', kind: 'fill', q: 'A batch of **32** sentences × **128** tokens × **384** dims. How many numbers is that?',
      answer: ['1572864', '1,572,864'], post: 'numbers', placeholder: 'e.g. 1000',
      why: '32 × 128 = 4,096 token vectors. Times 384 = 1,572,864 numbers. At 4 bytes each (float32) that is about 6.3 MB.' },
    { t: 'recap', points: ['A [[tensor]] is a nested array with a [[shape]]: scalar `[]`, vector `[3]`, matrix `[4, 3]`, batch `[B, S, D]`.', 'Text batches are B × S × D: sentences, tokens, numbers per token.', '[[reshape]] keeps the count. [[broadcasting]] stretches missing or size-1 axes.', 'Matrix multiply needs equal inner sizes: `[a, n] @ [n, b] → [a, b]`.'],
      cheat: [['x.shape', 'Print the shape (PyTorch and NumPy)'], ['x.reshape(-1, D)', 'Flatten batch and tokens into rows'], ['x + b   # b: [D]', 'Broadcast a bias to every row'], ['[a, n] @ [n, b] → [a, b]', 'The matmul shape rule']] }
  ]
};

// ---------- Lesson 2: dot products ----------
const M1_W = [[1, 0, -1], [2, 1, 0]], M1_B = [0, 1, 1];
const M1_DOT_SOLVE = 'function dot(a, b) {\n  let sum = 0;\n  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];\n  return sum;\n}\n\nfunction layer(x, W, b) {\n  return [];\n}';
const M1_LAYER_SOLVE = 'function dot(a, b) {\n  let sum = 0;\n  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];\n  return sum;\n}\n\nfunction layer(x, W, b) {\n  // column j of W is W.map(row => row[j])\n  return b.map((bj, j) => dot(x, W.map(row => row[j])) + bj);\n}\n\nconsole.log(layer([1, 2], [[1, 0, -1], [2, 1, 0]], [0, 1, 1]));';
const M1_cell = (x, y, v) => ({ x, y, w: 64, h: 48, label: v, kind: 'b' });

const M1_dot = {
  id: 'ml-dot', title: 'Dot products and matrix multiplication', mins: 8, needs: 'ml-tensors',
  goal: 'compute a dot product and a layer `y = xW + b` by hand, and say why GPUs love matrix multiplication.',
  cards: [
    { t: 'read', h: 'Every AI model is mostly one tiny move.',
      body: 'In RAG you ranked chunks by [[cosine similarity]]. That score is a [[dot product]]: multiply pairs of numbers, then add them up.\n\nEvery [[neuron]] does the same thing with its [[weights]]. A model with 500 million weights does roughly 500 million multiply-adds per [[token]]. Learn this one move and the rest is bookkeeping.',
      analogy: 'A dot product is a weighted score, like a ranking formula: `score = 0.5 × relevance + 2 × recency`. The weights say how much each feature counts.' },
    { t: 'viz', h: 'One layer, one dot product at a time',
      body: 'Each output is a dot product of x with one column of W.',
      nodes: {
        x1: { x: 90, y: 130, w: 100, label: 'x₁ = 1', kind: 'a' }, x2: { x: 90, y: 250, w: 100, label: 'x₂ = 2', kind: 'a' },
        gw: { x: 350, y: 190, w: 320, h: 260, shape: 'group', label: 'W, shape [2, 3]' },
        c11: M1_cell(250, 130, '1'), c12: M1_cell(350, 130, '0'), c13: M1_cell(450, 130, '−1'),
        c21: M1_cell(250, 250, '2'), c22: M1_cell(350, 250, '1'), c23: M1_cell(450, 250, '0'),
        y1: { x: 670, y: 65, w: 130, label: 'y₁ = ?', kind: 'c' }, y2: { x: 670, y: 190, w: 130, label: 'y₂ = ?', kind: 'c' }, y3: { x: 670, y: 315, w: 130, label: 'y₃ = ?', kind: 'c' }
      },
      steps: [
        { cap: 'One input row x = [1, 2]: 2 features. A layer will turn it into 3 outputs.', do: [['focus', 'x1', 'x2'], ['var', 'x', '[1, 2]']] },
        { cap: 'The [[weights]] W have shape [2, 3]. Each **column** is the recipe for one output.', do: [['focus', 'c11', 'c12', 'c13', 'c21', 'c22', 'c23'], ['var', 'W', '[2, 3]']] },
        { cap: 'Output 1 = x · column 1 = 1×1 + 2×2 = 5. A [[dot product]]: multiply pairs, then add.', do: [['send', 'x1', 'c11', '1×1'], ['send', 'x2', 'c21', '2×2'], ['send', 'c21', 'y1', '5'], ['set', 'y1', { label: 'y₁ = 5', state: 'active' }], ['focus', 'x1', 'x2', 'c11', 'c21', 'y1']] },
        { cap: 'Output 2 = 1×0 + 2×1 = 2. The 0 weight means column 2 ignores x₁.', do: [['send', 'x1', 'c12', '1×0'], ['send', 'x2', 'c22', '2×1'], ['send', 'c22', 'y2', '2'], ['set', 'y2', { label: 'y₂ = 2', state: 'active' }], ['focus', 'x1', 'x2', 'c12', 'c22', 'y2']] },
        { cap: 'Output 3 = 1×(−1) + 2×0 = −1. A negative score means x points away from that column.', do: [['send', 'x1', 'c13', '1×(−1)'], ['send', 'x2', 'c23', '2×0'], ['send', 'c23', 'y3', '−1'], ['set', 'y3', { label: 'y₃ = −1', state: 'active' }], ['focus', 'x1', 'x2', 'c13', 'c23', 'y3']] },
        { cap: 'Add the [[bias]] b = [0, 1, 1]. Now y = [5, 3, 0]. That is a whole layer: y = xW + b.', do: [['set', 'y1', { sub: '5 + 0', state: 'ok' }], ['set', 'y2', { label: 'y₂ = 3', sub: '2 + 1', state: 'ok' }], ['set', 'y3', { label: 'y₃ = 0', sub: '−1 + 1', state: 'ok' }], ['var', 'y', '[5, 3, 0]']] },
        { cap: 'Dot products are big when vectors point the same way. Column 1 is [1, 2], same as x, so it wins. [[cosine similarity]] is this at length 1.', do: [['focus', 'x1', 'x2', 'c11', 'c21', 'y1'], ['note', 'y1', 'most aligned']] },
        { cap: 'A [[batch]] of 32 rows: [32, 2] @ [2, 3] → [32, 3]. That is 96 separate dot products, so a GPU runs them all at once.', do: [['var', 'x', '[32, 2]'], ['var', 'y', '[32, 3]']] }
      ],
      predict: { at: 3, q: 'Column 2 of W is [0, 1]. What is output 2, before the bias?', options: ['2', '1', '3', '0'], answer: 0,
        why: '1×0 + 2×1 = 2. Multiply each pair, then add. The 0 weight switches x₁ off.' } },
    { t: 'quiz', q: 'A batch `x` has shape `[32, 384]`. A layer has `W` of shape `[384, 10]`. What shape is `x @ W`?',
      options: ['`[32, 10]`', '`[384, 384]`', '`[32, 384]`', 'A shape error'], answer: 0,
      why: 'The inner sizes match (384 = 384) and cancel out. You keep the outer sizes: 32 rows, 10 outputs each.',
      whyNot: { 1: 'That would need outer sizes of 384. The outer sizes here are 32 and 10.', 2: 'The layer changes the width from 384 to 10. Only the batch size 32 survives.', 3: 'Both inner sizes are 384, so they match. Errors happen when the inner sizes differ.' } },
    { t: 'play', kind: 'code', h: 'Write dot() and a layer',
      body: 'Fill in `dot`, then build `layer` from it. The diagram runs your code on x = [1, 2].',
      starter: '// Multiply matching pairs, then add them up.\nfunction dot(a, b) {\n  let sum = 0;\n  // your loop here\n  return sum;\n}\n\n// x: one input row. W: rows of numbers, shape [n, m]. b: m biases.\nfunction layer(x, W, b) {\n  // output j = dot(x, column j of W) + b[j]\n  return [];\n}\n\nconsole.log(dot([1, 2, 3], [4, -5, 6]));  // want 12\nconsole.log(layer([1, 2], [[1, 0, -1], [2, 1, 0]], [0, 1, 1]));  // want [5, 3, 0]',
      expose: ['dot', 'layer'],
      size: [800, 260],
      view: s => {
        const d = M1_try(() => s.api.dot([1, 2, 3], [4, -5, 6]));
        const y = M1_try(() => s.api.layer([1, 2], M1_W, M1_B)), want = [5, 3, 0];
        const nodes = {
          d: { x: 160, y: 60, w: 260, label: 'dot → ' + (d === undefined ? '?' : M1_fmt(d)), sub: 'a = [1, 2, 3], b = [4, −5, 6]', kind: 'b', state: d === 12 ? 'ok' : 'warn' },
          x: { x: 160, y: 190, w: 200, label: 'layer([1, 2])', sub: 'W [2, 3], b [0, 1, 1]', kind: 'a' }
        }, edges = [];
        want.forEach((t, j) => {
          const v = Array.isArray(y) ? y[j] : undefined;
          nodes['o' + j] = { x: 600, y: 50 + j * 80, w: 140, h: 48, label: 'y' + '₁₂₃'[j] + ' = ' + (v === undefined ? '?' : M1_fmt(v)), sub: 'want ' + t, kind: 'c', state: v === t ? 'ok' : 'off' };
          edges.push(['x', 'o' + j]);
        });
        return { nodes, edges };
      },
      goals: [
        { text: '`dot([1, 2, 3], [4, -5, 6])` returns `12`', check: s => M1_try(() => s.api.dot([1, 2, 3], [4, -5, 6])) === 12, solve: [M1_DOT_SOLVE] },
        { text: '`layer([1, 2], W, b)` returns `[5, 3, 0]`', check: s => JSON.stringify(M1_try(() => s.api.layer([1, 2], M1_W, M1_B))) === '[5,3,0]', solve: [M1_LAYER_SOLVE] },
        { text: 'It works for any size: `layer([1, 0, 2], [[1, 2], [3, 4], [5, 6]], [0, 0])` gives `[11, 14]`', check: s => JSON.stringify(M1_try(() => s.api.layer([1, 0, 2], [[1, 2], [3, 4], [5, 6]], [0, 0]))) === '[11,14]', solve: [M1_LAYER_SOLVE] }
      ],
      hints: ['Loop over the indexes: add `a[i] * b[i]` to `sum` each time.', 'Column j of W is `W.map(row => row[j])`. Dot it with x, then add `b[j]`.', '`return b.map((bj, j) => dot(x, W.map(row => row[j])) + bj);`'],
      done: '`numpy` and `torch` do exactly this, in parallel, as `x @ W + b`.' },
    { t: 'quiz', kind: 'fill', q: 'Work it out by hand: `[2, 0, 1] · [3, 5, 4]` = ?', answer: ['10'], placeholder: 'a number',
      why: '2×3 + 0×5 + 1×4 = 6 + 0 + 4 = 10.' },
    { t: 'recap', points: ['A [[dot product]] multiplies pairs and adds: `[1, 2, 3] · [4, −5, 6] = 12`.', 'It is big when vectors point the same way. That is how similarity search scores.', 'A layer is `y = xW + b`: one dot product per column of W, plus a [[bias]].', '[[matrix multiplication]] is many dot products at once: `[a, n] @ [n, b] → [a, b]`. GPUs run them in parallel.'],
      cheat: [['a @ b   or   np.dot(a, b)', 'Dot product of two vectors'], ['x @ W + b', 'One linear layer'], ['nn.Linear(384, 10)', 'A layer from 384 to 10 numbers (stores W as [10, 384])'], ['a @ b / (norm(a) * norm(b))', 'Cosine similarity']] }
  ]
};

// ---------- Lesson 3: loss ----------
const M1_LOSS_MSE = 'function mse(pred, target) {\n  let sum = 0;\n  for (let i = 0; i < pred.length; i++) sum += (pred[i] - target[i]) ** 2;\n  return sum / pred.length;\n}\n\nfunction crossEntropy(probs, label) {\n  return null;\n}';
const M1_LOSS_CE = M1_LOSS_MSE.replace('return null;', 'return -Math.log(probs[label]);');
const M1_LOSS_FIX = M1_LOSS_MSE.replace('return null;', 'const p = Math.max(probs[label], 1e-7);  // never log(0)\n  return -Math.log(p);');
const M1_ce = (s, p, l) => M1_try(() => s.api.crossEntropy(p, l));
const M1_box = (x, y, label, kind) => ({ x, y, w: 80, h: 48, label, kind });

const M1_loss = {
  id: 'ml-loss', title: 'Loss functions', mins: 8, needs: 'ml-dot',
  goal: 'compute MSE and cross-entropy by hand, and pick the right one for numbers, classes and next tokens.',
  cards: [
    { t: 'read', h: 'Your model guessed $400k. The house sold for $300k.',
      body: 'How wrong is that, as **one number**? And how do you add it up over 10,000 houses?\n\nA [[loss function]] answers that. It turns every miss into one score. Lower is better, and 0 is perfect. Training is nothing more than pushing that number down.',
      analogy: 'Loss is a failing-test count that can move by tiny amounts. "3.2 → 3.1" tells you a change helped, even when no test flips to green.' },
    { t: 'viz', h: 'Two losses, worked by hand',
      body: 'Left: numbers. Right: classes. The values strip keeps the score.',
      nodes: {
        gl: { x: 190, y: 200, w: 340, h: 320, shape: 'group', label: 'Numbers: MSE' },
        gr: { x: 590, y: 200, w: 350, h: 320, shape: 'group', label: 'Classes: cross-entropy' },
        t0: M1_box(80, 100, 'true 3', 'a'), t1: M1_box(190, 100, 'true 5', 'a'), t2: M1_box(300, 100, 'true 2', 'a'),
        g0: M1_box(80, 190, 'guess 4', 'b'), g1: M1_box(190, 190, 'guess 4', 'b'), g2: M1_box(300, 190, 'guess 4', 'b'),
        k0: M1_box(480, 100, 'cat ✓', 'a'), k1: M1_box(590, 100, 'dog', 'a'), k2: M1_box(700, 100, 'bird', 'a'),
        p0: M1_box(480, 190, 'p 0.7', 'b'), p1: M1_box(590, 190, 'p 0.2', 'b'), p2: M1_box(700, 190, 'p 0.1', 'b')
      },
      steps: [
        { cap: '3 houses, in $100k. True prices: 3, 5, 2. The model guessed 4, 4, 4. How wrong is it, as one number?', do: [['focus', 't0', 't1', 't2', 'g0', 'g1', 'g2']] },
        { cap: 'Error = guess − true: +1, −1, +2. A plain average would let +1 and −1 cancel. So we square.', do: [['add', 'e0', M1_box(80, 280, 'err +1', 'd')], ['add', 'e1', M1_box(190, 280, 'err −1', 'd')], ['add', 'e2', M1_box(300, 280, 'err +2', 'd')], ['focus', 'e0', 'e1', 'e2']] },
        { cap: 'Square each: 1, 1, 4. A miss of 2 costs 4, not 2. Big misses hurt most.', do: [['set', 'e0', { label: '(+1)²=1' }], ['set', 'e1', { label: '(−1)²=1' }], ['set', 'e2', { label: '(+2)²=4', state: 'warn' }], ['focus', 'e0', 'e1', 'e2']] },
        { cap: 'Average them: \\( \\frac{1 + 1 + 4}{3} = 2 \\). That is the [[MSE]], mean squared error. 0 would mean every guess was exact.', do: [['var', 'MSE', 2], ['focus', 'e0', 'e1', 'e2']] },
        { cap: 'Now classes. Cat, dog or bird? After [[softmax]] the model says 0.7, 0.2, 0.1. The true answer is cat.', do: [['focus', 'k0', 'k1', 'k2', 'p0', 'p1', 'p2']] },
        { cap: '[[cross-entropy]] looks only at the true class: \\( -\\log 0.7 = 0.36 \\) (natural log). Sure and right means a small loss.', do: [['add', 'l0', { x: 480, y: 280, w: 80, h: 48, label: '0.36', sub: '−log 0.7', kind: 'd', state: 'ok' }], ['var', 'CE', 0.36]] },
        { cap: 'If the photo was a bird: \\( -\\log 0.1 = 2.30 \\). Sure and wrong costs over 6× more.', do: [['set', 'k0', { label: 'cat' }], ['set', 'k2', { label: 'bird ✓' }], ['set', 'l0', { state: 'off' }], ['add', 'l2', { x: 700, y: 280, w: 80, h: 48, label: '2.30', sub: '−log 0.1', kind: 'd', state: 'bad' }], ['var', 'CE', 2.3]] },
        { cap: 'An LLM does this for every next [[token]]. "The cat sat on the" → p(mat) = 0.5 → loss 0.69. Training averages it over billions of tokens.', do: [['var', 'next token', '−log 0.5 = 0.69']] }
      ],
      predict: { at: 6, q: 'Same model output (cat 0.7, dog 0.2, bird 0.1), but the true answer is **bird**. The loss will be…', options: ['About 6× bigger: 2.30', 'The same: 0.36', 'Smaller: 0.10', 'Zero, since only cat counts'], answer: 0,
        why: 'Cross-entropy is −log of the true class\'s probability. −log 0.1 = 2.30, versus 0.36 for cat. Confident mistakes are punished hard.' } },
    { t: 'quiz', q: 'You predict **delivery time in minutes**. Which loss fits?',
      options: ['MSE', 'Cross-entropy', 'Softmax', 'Accuracy'], answer: 0,
      why: 'The target is a number, so you measure how far off each guess is and square it: [[MSE]].',
      whyNot: { 1: 'Cross-entropy needs classes with probabilities. "37 minutes" is a number, not a class.', 2: '[[softmax]] turns scores into probabilities. It is not a loss by itself.', 3: 'Accuracy is pass/fail. It cannot say "close", so it gives no smooth signal to train on.' } },
    { t: 'play', kind: 'code', h: 'Write mse() and crossEntropy()',
      body: 'Fill in both losses. The diagram runs your code on the lesson\'s numbers.',
      starter: '// pred and target are arrays of numbers.\nfunction mse(pred, target) {\n  // average of (pred[i] - target[i]) squared\n  return null;\n}\n\n// probs: the model\'s probabilities. label: index of the right class.\nfunction crossEntropy(probs, label) {\n  // minus the natural log (Math.log) of the right class\'s probability\n  return null;\n}\n\nconsole.log(mse([4, 4, 4], [3, 5, 2]));        // want 2\nconsole.log(crossEntropy([0.7, 0.2, 0.1], 0));  // want 0.357',
      expose: ['mse', 'crossEntropy'],
      size: [500, 300],
      view: s => {
        const m = M1_try(() => s.api.mse([4, 4, 4], [3, 5, 2])), c = M1_ce(s, [0.7, 0.2, 0.1], 0), z = M1_ce(s, [0, 1], 0);
        const show = v => (v === undefined || v === null) ? '?' : M1_fmt(v);
        return { nodes: {
          m: { x: 250, y: 60, w: 300, label: 'mse → ' + show(m), sub: 'want 2', kind: 'a', state: M1_near(m, 2) ? 'ok' : 'off' },
          c: { x: 250, y: 150, w: 300, label: 'CE(cat) → ' + show(c), sub: 'want 0.357', kind: 'b', state: M1_near(c, 0.35667, 1e-3) ? 'ok' : 'off' },
          z: { x: 250, y: 240, w: 300, label: 'CE(p=0) → ' + show(z), sub: 'want a finite number', kind: 'd', state: Number.isFinite(z) && z > 10 ? 'ok' : z === Infinity ? 'bad' : 'off' }
        } };
      },
      goals: [
        { text: 'Make `mse([4, 4, 4], [3, 5, 2])` return `2`', check: s => M1_near(M1_try(() => s.api.mse([4, 4, 4], [3, 5, 2])), 2), solve: [M1_LOSS_MSE] },
        { text: '`crossEntropy([0.7, 0.2, 0.1], 0)` returns about `0.357`', check: s => M1_near(M1_ce(s, [0.7, 0.2, 0.1], 0), 0.35667, 1e-3), solve: [M1_LOSS_CE] },
        { text: 'Fix the crash case: `crossEntropy([0, 1], 0)` gives `Infinity`. Clip p to at least `1e-7` so it stays finite', check: s => { const z = M1_ce(s, [0, 1], 0); return Number.isFinite(z) && z > 10 && M1_near(M1_ce(s, [0.7, 0.2, 0.1], 0), 0.35667, 1e-3); }, solve: [M1_LOSS_FIX] }
      ],
      hints: ['MSE: loop, add `(pred[i] - target[i]) ** 2`, then divide by the length.', 'Cross-entropy: `-Math.log(probs[label])`.', 'Use `Math.max(probs[label], 1e-7)` before the log, so log(0) can never happen.'],
      done: 'PyTorch avoids log(0) its own way: `nn.CrossEntropyLoss` takes raw [[logit|logits]] and works in log space.' },
    { t: 'quiz', kind: 'fill', q: 'The model gives the right next token a probability of **0.25**. What is the cross-entropy, −log(0.25)? Round to 2 decimals.',
      answer: ['1.39', /^1\.386\d*$/], placeholder: 'e.g. 0.69',
      why: 'Natural log: ln(0.25) = −1.386, so the loss is 1.39. That is exactly double the loss at p = 0.5 (0.69), because 0.25 = 0.5².' },
    { t: 'recap', points: ['A [[loss function]] turns all the model\'s misses into one number to push down.', '[[MSE]] for numbers: the average squared error. Guesses 4, 4, 4 vs truth 3, 5, 2 give 2.', '[[cross-entropy]] for classes and next tokens: −log of the right answer\'s probability.', 'Sure and wrong is punished hard: −log 0.1 = 2.30 vs −log 0.7 = 0.36.'],
      cheat: [['((pred - y) ** 2).mean()', 'MSE in NumPy or PyTorch'], ['-np.log(p[label])', 'Cross-entropy for one example'], ['nn.CrossEntropyLoss()(logits, labels)', 'PyTorch: takes raw logits and applies softmax for you'], ['nn.MSELoss()(pred, y)', 'PyTorch MSE']] }
  ]
};

// ---------- Lesson 4: gradient descent on L(w) = (w − 8)² ----------
const M1_bx = w => 70 + w * 41;
function M1_bowl() {
  const nodes = {};
  for (let w = 0; w <= 16; w++) nodes['b' + w] = { x: M1_bx(w), y: 345, shape: 'bar', w: 26, h: 4 + 4 * (w - 8) ** 2, label: String(w), kind: 'n' };
  return nodes;
}
const M1_gdLoss = w => (w - 8) ** 2;
function M1_gdSync(s) { if (s.lr !== s.v.lr) { s.lr = s.v.lr; s.w = 0; s.n = 0; } }
function M1_gdStep(s, k) {
  M1_gdSync(s);
  for (let i = 0; i < k && Math.abs(s.w) < 1e6; i++) { s.w -= s.v.lr * 2 * (s.w - 8); s.n++; }
}

const M1_gd = {
  id: 'ml-gd', title: 'Gradient descent and learning rate', mins: 8, needs: 'ml-loss',
  goal: 'run the update rule by hand, and tell from a loss curve whether the learning rate is too high or too low.',
  cards: [
    { t: 'read', h: 'You have a loss. Which way do you turn a million knobs?',
      body: 'A model has millions of [[weights]]. Trying random changes would take forever.\n\nThe trick: for each weight, measure the **slope** of the loss. The slope says which way is downhill and how steep it is. Step a little downhill, measure again, repeat. That loop is [[gradient descent]]. All the slopes together form the [[gradient]].',
      analogy: 'Walking down a hill in fog. You cannot see the valley, but your feet feel the slope. Step downhill, feel again. Your stride is the [[learning rate]].' },
    { t: 'viz', h: 'Roll down the loss bowl',
      body: 'Each bar is the loss for one value of the weight w. The bright bar is where we are.',
      nodes: M1_bowl(),
      steps: [
        { cap: 'A toy [[loss function]]: \\( L = (w - 8)^2 \\). The best w is 8, with loss 0. We start at w = 0: loss 64.', do: [['set', 'b0', { state: 'active' }], ['var', 'w', 0], ['var', 'loss', 64]] },
        { cap: 'Slope at w = 0: \\( 2(w - 8) = -16 \\). Negative means the loss falls as w grows. Downhill is to the right.', do: [['note', 'b0', 'slope −16'], ['var', 'slope', -16]] },
        { cap: 'Update: \\( w - \\eta \\times \\text{slope} = 0 - 0.25 \\times (-16) = 4 \\). η is the [[learning rate]]. Loss: 64 → 16.', do: [['set', 'b0', { state: 'off' }], ['set', 'b4', { state: 'active' }], ['var', 'w', 4], ['var', 'loss', 16], ['var', 'slope', -8]] },
        { cap: 'At w = 4 the slope is −8. Step: 4 − 0.25 × (−8) = 6. Loss 4.', do: [['set', 'b4', { state: 'off' }], ['set', 'b6', { state: 'active' }], ['var', 'w', 6], ['var', 'loss', 4], ['var', 'slope', -4]] },
        { cap: 'Next: slope −4, so w = 7, loss 1. The steps shrink (4, 2, 1) as the bowl flattens. Nobody told it to slow down.', do: [['set', 'b6', { state: 'off' }], ['set', 'b7', { state: 'active' }], ['var', 'w', 7], ['var', 'loss', 1], ['var', 'slope', -2]] },
        { cap: 'Too high: η = 1.0 from w = 0 jumps +16 to w = 16. Loss 64 again. It bounces forever, and above 1.0 it climbs out.', do: [['set', 'b7', { state: 'off' }], ['set', 'b0', { state: 'active' }], ['set', 'b16', { state: 'bad' }], ['note', 'b16', 'overshoot'], ['var', 'w', 16], ['var', 'loss', 64], ['var', 'slope', 16]] },
        { cap: 'Too low: η = 0.01 moves w just 0.16 on step 1 (loss 61.5). It needs 103 steps to reach loss 1. η = 0.25 took 3.', do: [['set', 'b16', { state: 'off' }], ['note', 'b0', 'crawling'], ['var', 'w', 0.16], ['var', 'loss', 61.5], ['var', 'slope', -15.7]] },
        { cap: 'Real loss averages over all examples. Each step estimates the slope from a [[mini-batch]] (say 32). One pass over all data is an [[epoch]].', do: [['var', 'batch', 32]] }
      ],
      predict: { at: 3, q: 'At w = 4 the slope is −8 and η = 0.25. Where does w land?', options: ['6', '12', '8', '4.25'], answer: 0,
        why: 'w − η × slope = 4 − 0.25 × (−8) = 4 + 2 = 6. Each step halves the distance to 8.' } },
    { t: 'quiz', q: 'Your training loss goes 2.1 → 5.8 → 31 → NaN. What is the most likely fix?',
      options: ['Lower the learning rate', 'Raise the learning rate', 'Train for more epochs', 'Use a bigger batch'], answer: 0,
      why: 'Loss that grows fast is the overshoot you saw at η = 1: each step jumps past the bottom and lands higher. Smaller steps fix it.',
      whyNot: { 1: 'Bigger steps make each overshoot bigger. The loss would explode even faster.', 2: 'More epochs repeat the same exploding steps. Fix the step size first.', 3: 'A bigger batch smooths the slope estimate, but the steps are still too big. Lower the learning rate first.' } },
    { t: 'play', kind: 'controls', h: 'Tune the learning rate',
      body: 'Set η, then step. Changing η restarts at w = 0.',
      init: () => ({ w: 0, n: 0, lr: 0.05 }),
      controls: [
        { id: 'lr', type: 'range', label: 'Learning rate η', min: 0.01, max: 1.2, step: 0.01, value: 0.05 },
        { id: 'step', type: 'button', label: 'Step', run: s => M1_gdStep(s, 1) },
        { id: 'run', type: 'button', label: 'Run 10 steps', run: s => M1_gdStep(s, 10) },
        { id: 'reset', type: 'button', label: 'Reset', run: s => { s.w = 0; s.n = 0; } }
      ],
      update: s => M1_gdSync(s),
      view: s => {
        const nodes = M1_bowl(), w = s.w, k = Math.max(0, Math.min(16, Math.round(w))), off = w < -0.5 || w > 16.5, notes = [];
        nodes['b' + k].state = off ? 'bad' : 'active';
        if (off) notes.push(['b' + k, (w < 0 ? '← w = ' : 'w = ') + M1_fmt(w, 1) + (w < 0 ? '' : ' →')]);
        return { nodes, notes, vars: { step: s.n, w: M1_fmt(w, 3), loss: M1_fmt(M1_gdLoss(w), 3) } };
      },
      readout: s => [['Steps', s.n], ['w', M1_fmt(s.w, 3)], ['Slope', M1_fmt(2 * (s.w - 8), 3)], ['Loss', M1_fmt(M1_gdLoss(s.w), 4)]],
      goals: [
        { text: 'Reach the bottom: loss under **0.01** within 10 steps', check: s => s.n > 0 && s.n <= 10 && M1_gdLoss(s.w) < 0.01, solve: [{ lr: 0.25 }, 'run'] },
        { text: 'Too high: make the loss explode past **1,000**', check: s => M1_gdLoss(s.w) > 1000, solve: [{ lr: 1.2 }, 'run'] },
        { text: 'Too low: at η = 0.01, run 10 steps and see the loss still above 40', check: s => s.v.lr <= 0.011 && s.n >= 10 && M1_gdLoss(s.w) > 40, solve: [{ lr: 0.01 }, 'run'] }
      ],
      hints: ['Each step moves w by −η × slope. The slope at w = 0 is −16.', 'Try η = 0.25: every step halves the distance to w = 8.', 'Above η = 1 every step overshoots further. At 0.01 each step is tiny.'],
      done: 'Real training is this same loop over millions of weights. The learning rate is still the first knob people tune.' },
    { t: 'quiz', kind: 'fill', q: 'You have **50,000** training examples and a mini-batch size of **100**. How many update steps are in **3 epochs**?',
      answer: ['1500', '1,500'], post: 'steps', placeholder: 'a number',
      why: '50,000 ÷ 100 = 500 steps per epoch. 3 epochs × 500 = 1,500 steps.' },
    { t: 'recap', points: ['The slope ([[gradient]]) says which way is downhill for each weight.', 'Update rule: `w = w − η × slope`. Repeat.', 'η too high overshoots and explodes. Too low crawls. η = 0.25 reached the bottom of our bowl in 3 steps.', 'Each step uses a [[mini-batch]]. One pass over all the data is an [[epoch]].'],
      cheat: [['w = w - lr * grad', 'The update rule'], ['torch.optim.SGD(model.parameters(), lr=0.01)', 'Plain gradient descent in PyTorch'], ['loss.backward(); opt.step(); opt.zero_grad()', 'One training step'], ['steps = examples ÷ batch × epochs', 'How long a run is']] }
  ]
};

// ---------- Lesson 5: backprop on x → ×w1 → act → ×w2 → (ŷ − 1)² ----------
const M1_ACT = {
  ReLU: [z => Math.max(0, z), z => z > 0 ? 1 : 0],
  sigmoid: [z => 1 / (1 + Math.exp(-z)), z => { const a = 1 / (1 + Math.exp(-z)); return a * (1 - a); }],
  none: [z => z, () => 1]
};
function M1_bp(w1, w2, act) {
  const x = 2, y = 1, f = M1_ACT[act] || M1_ACT.ReLU;
  const z = w1 * x, h = f[0](z), yh = w2 * h, L = (yh - y) ** 2, dy = 2 * (yh - y), dw2 = dy * h, dh = dy * w2, dz = dh * f[1](z), dw1 = dz * x;
  return { z, h, yh, L, dy, dw2, dh, dz, dw1 };
}
function M1_bpSync(s) {
  const key = [s.v.w1, s.v.w2, s.v.act].join('|');
  if (s.key !== key) { s.key = key; s.w1 = s.v.w1; s.w2 = s.v.w2; s.n = 0; }
}
function M1_bpTrain(s, k) {
  M1_bpSync(s);
  for (let i = 0; i < k; i++) {
    const r = M1_bp(s.w1, s.w2, s.v.act);
    if (s.v.act === 'ReLU' && r.z <= 0) s.dead = true;
    s.w1 -= 0.025 * r.dw1; s.w2 -= 0.025 * r.dw2; s.n++;
  }
}
const M1_chain = (lbl) => ({
  x: { x: 60, y: 150, w: 100, label: 'x = 2', kind: 'a' },
  z: { x: 235, y: 150, w: 100, label: lbl.z, sub: lbl.zs, kind: 'b' },
  h: { x: 410, y: 150, w: 100, label: lbl.h, sub: lbl.hs, kind: 'b', state: lbl.hst },
  yh: { x: 585, y: 150, w: 100, label: lbl.yh, sub: lbl.ys, kind: 'c' },
  L: { x: 742, y: 150, w: 100, label: lbl.L, sub: 'target y = 1', kind: 'd', state: lbl.Lst }
});

const M1_backprop = {
  id: 'ml-backprop', title: 'Backpropagation', mins: 9, needs: 'ml-gd',
  goal: 'run one forward and backward pass by hand on a 2-layer net, and explain why activation functions are needed.',
  cards: [
    { t: 'read', h: 'Gradient descent needs a slope for every weight. Where do they come from?',
      body: 'Our toy bowl had one weight and a formula we could read. A real network has millions of weights stacked in layers.\n\n[[backpropagation]] gets every slope in one backward sweep. It uses the [[chain rule]]: when steps are connected in a chain, their slopes **multiply**. We will do it by hand on a 2-layer net with real numbers.',
      analogy: 'Currency conversion. If 1 USD buys 0.9 EUR and 1 EUR buys 160 JPY, then 1 USD buys 0.9 × 160 = 144 JPY. Rates along a chain multiply. So do slopes.' },
    { t: 'viz', h: 'Forward with numbers, backward with slopes',
      body: 'A 2-layer net on one example: x = 2, target 1. Forward first, then back.',
      nodes: Object.assign(M1_chain({ z: 'z = ?', h: 'h = ?', yh: 'ŷ = ?', L: 'L = ?' }), { tf: { x: 400, y: 50, shape: 'text', label: 'forward →   ← backward' } }),
      edges: [['x', 'z', 'w₁ = 0.5'], ['z', 'h', 'ReLU'], ['h', 'yh', 'w₂ = 2'], ['yh', 'L', '(ŷ−1)²']],
      steps: [
        { cap: '[[forward pass]]: x = 2 times w₁ = 0.5 gives z = 1.', do: [['send', 'x', 'z', '2 × 0.5'], ['set', 'z', { label: 'z = 1' }]] },
        { cap: '[[ReLU]] keeps positives and turns negatives into 0. ReLU(1) = 1, so h = 1.', do: [['send', 'z', 'h', '1'], ['set', 'h', { label: 'h = 1' }]] },
        { cap: 'ŷ = h × w₂ = 1 × 2 = 2. The target is 1, so the loss is \\( (2 - 1)^2 = 1 \\).', do: [['send', 'h', 'yh', '1 × 2'], ['set', 'yh', { label: 'ŷ = 2' }], ['send', 'yh', 'L', '2'], ['set', 'L', { label: 'L = 1', state: 'warn' }]] },
        { cap: 'Backward. Start at the loss: \\( \\frac{dL}{d\\hat{y}} = 2(\\hat{y} - y) = 2 \\). Nudge ŷ up by 0.01 and L grows by about 0.02.', do: [['send', 'L', 'yh', '2', 'warn'], ['set', 'yh', { sub: 'grad 2' }]] },
        { cap: 'w₂ multiplied h, so \\( \\frac{dL}{dw_2} = 2 \\times h = 2 \\). Passing back to h multiplies by w₂: 2 × 2 = 4.', do: [['add', 'gw2', { x: 497, y: 290, w: 150, label: 'dL/dw₂ = 2', kind: 'e' }], ['send', 'yh', 'h', '4', 'warn'], ['set', 'h', { sub: 'grad 4' }]] },
        { cap: 'ReLU\'s slope is 1 for positive z, so z also gets 4. Then \\( \\frac{dL}{dw_1} = 4 \\times x = 8 \\). Slopes multiplied: 2 × 2 × 1 × 2.', do: [['send', 'h', 'z', '4 × 1', 'warn'], ['set', 'z', { sub: 'grad 4' }], ['add', 'gw1', { x: 147, y: 290, w: 150, label: 'dL/dw₁ = 8', kind: 'e' }]] },
        { cap: 'Update with η = 0.025: w₁ = 0.5 − 0.025 × 8 = 0.3, and w₂ = 2 − 0.025 × 2 = 1.95.', do: [['unlink', 'x', 'z'], ['link', 'x', 'z', 'w₁ = 0.3'], ['unlink', 'h', 'yh'], ['link', 'h', 'yh', 'w₂ = 1.95']] },
        { cap: 'Forward again: z = 0.6, h = 0.6, ŷ = 0.6 × 1.95 = 1.17. The loss fell from 1 to 0.029.', do: [['set', 'z', { label: 'z = 0.6', sub: '' }], ['set', 'h', { label: 'h = 0.6', sub: '' }], ['set', 'yh', { label: 'ŷ = 1.17', sub: '' }], ['set', 'L', { label: 'L = 0.029', state: 'ok' }]] }
      ],
      predict: { at: 5, q: 'h got gradient 4. ReLU\'s slope is 1 here, and x = 2. What is dL/dw₁?', options: ['8', '4', '2', '16'], answer: 0,
        why: 'Chain rule: multiply the local slopes on the way back. 4 × 1 (ReLU) × 2 (x) = 8.' } },
    { t: 'quiz', q: 'Delete the ReLU. Now ŷ = w₂ × (w₁ × x). What have the two layers become?',
      options: ['One layer with weight w₁ × w₂', 'A more powerful network', 'A network that cannot learn', 'A sigmoid'], answer: 0,
      why: 'With no bend between them, two linear layers multiply out into one: ŷ = (w₁w₂) × x. Stack 100 and it is still one straight line. [[activation function|Activation functions]] like [[ReLU]] and [[sigmoid]] add the bends that let networks fit curves.',
      whyNot: { 1: 'Extra linear layers add no power. They collapse into one multiplication.', 2: 'It can still learn, but only straight lines. Gradients still flow.', 3: 'Sigmoid is a different activation function. Removing ReLU leaves no activation at all.' } },
    { t: 'play', kind: 'controls', h: 'Train the tiny net, then break it',
      body: 'Each step runs forward, backward, then an update with η = 0.025.',
      init: () => ({ key: '0.5|2|ReLU', w1: 0.5, w2: 2, n: 0, dead: false }),
      controls: [
        { id: 'w1', type: 'range', label: 'Start w₁', min: -1, max: 1, step: 0.1, value: 0.5 },
        { id: 'w2', type: 'range', label: 'Start w₂', min: 0, max: 3, step: 0.1, value: 2 },
        { id: 'act', type: 'select', label: 'Activation', options: ['ReLU', 'sigmoid', 'none'], value: 'ReLU' },
        { id: 'step', type: 'button', label: 'Train 1 step', run: s => M1_bpTrain(s, 1) },
        { id: 'ten', type: 'button', label: 'Train 10 steps', run: s => M1_bpTrain(s, 10) }
      ],
      update: s => M1_bpSync(s),
      view: s => {
        const r = M1_bp(s.w1, s.w2, s.v.act), f = v => M1_fmt(v, 3), dead = s.v.act === 'ReLU' && r.z <= 0;
        const nodes = M1_chain({ z: 'z = ' + f(r.z), h: 'h = ' + f(r.h), hst: dead ? 'bad' : undefined, yh: 'ŷ = ' + f(r.yh), L: 'L = ' + M1_fmt(r.L, 4), Lst: r.L < 0.05 ? 'ok' : 'warn', zs: 'grad ' + f(r.dz), hs: dead ? 'ReLU off' : 'grad ' + f(r.dh), ys: 'grad ' + f(r.dy) });
        nodes.gw1 = { x: 147, y: 290, w: 170, label: 'dL/dw₁ = ' + f(r.dw1), kind: 'e', state: r.dw1 === 0 ? 'bad' : undefined };
        nodes.gw2 = { x: 497, y: 290, w: 170, label: 'dL/dw₂ = ' + f(r.dw2), kind: 'e', state: r.dw2 === 0 ? 'bad' : undefined };
        return { nodes, edges: [['x', 'z', '× ' + M1_fmt(s.w1, 2)], ['z', 'h', s.v.act], ['h', 'yh', '× ' + M1_fmt(s.w2, 2)], ['yh', 'L']], vars: { step: s.n } };
      },
      readout: s => { const r = M1_bp(s.w1, s.w2, s.v.act); return [['Steps', s.n], ['w₁, w₂', M1_fmt(s.w1, 3) + ', ' + M1_fmt(s.w2, 3)], ['Loss', M1_fmt(r.L, 4)]]; },
      goals: [
        { text: 'Train 1 step with ReLU: loss drops below 0.05', check: s => s.n >= 1 && s.v.act === 'ReLU' && M1_bp(s.w1, s.w2, 'ReLU').L < 0.05, solve: ['step'] },
        { text: 'Break it: start w₁ below 0 and train. Gradients hit 0', check: s => !!s.dead, solve: [{ w1: -0.5 }, 'step'] },
        { text: 'Fix it: w₁ still below 0, use sigmoid, train loss under 0.05', check: s => s.v.act === 'sigmoid' && s.v.w1 < 0 && s.n > 0 && M1_bp(s.w1, s.w2, 'sigmoid').L < 0.05, solve: [{ act: 'sigmoid' }, 'ten', 'ten'] }
      ],
      hints: ['Press "Train 1 step" and watch the gradients under each box.', 'If z is negative, ReLU outputs 0 and its slope is 0. Anything times 0 is 0.', 'Sigmoid is never perfectly flat: σ(−1) = 0.27, with slope 0.20. Switch to it and train 10 steps at a time.'],
      done: 'That "dead ReLU" trap is real. Careful weight init, small learning rates and variants like Leaky ReLU exist because of it.' },
    { t: 'quiz', kind: 'order', q: 'Put one training step in order.',
      items: ['Forward pass: compute the prediction ŷ', 'Compute the loss', 'Gradient at the output: dL/dŷ', 'Chain rule backwards, layer by layer', 'Update every weight: w − η × gradient'],
      why: 'Forward to get a loss, backward to get every slope, then one gradient-descent update. In PyTorch: `loss.backward()` then `opt.step()`.' },
    { t: 'recap', points: ['[[backpropagation]] finds every weight\'s slope in one backward sweep.', 'The [[chain rule]]: slopes along a chain multiply. dL/dw₁ = 2 × 2 × 1 × 2 = 8.', 'One update on our net took the loss from 1 to 0.029 (η = 0.025).', 'Without [[activation function|activations]], layers collapse into one straight line. ReLU and sigmoid add the bends.', 'A ReLU stuck below 0 passes back a gradient of 0 and stops learning.'],
      cheat: [['loss.backward()', 'Backprop: fills .grad for every weight'], ['w.grad', 'dL/dw for that weight'], ['ReLU(z) = max(0, z)', 'Slope 1 if z > 0, else 0'], ['σ(z) = 1 / (1 + e^(−z))', 'Sigmoid. Slope σ(1 − σ), at most 0.25']] }
  ]
};
