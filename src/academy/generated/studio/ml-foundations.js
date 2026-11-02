/* eslint-disable */
// Generated from content/academy/ml-foundations/ (glossary.js, capboard.js, m1.js, m2.js, m3.js, m4.js, m5.js, deep1.js, deep2.js, course.js) by scripts/build-academy.mjs. Do not edit.
// Shared glossary for the ML Foundations course. Link with [[term]] or [[term|shown text]].
// Deep dives (formula, figure, worked example, lab) are added by deep1.js / deep2.js and merged in course.js.
const ML_GLOSSARY = {
  'scalar': 'A single number, like `3.5`. A tensor with zero dimensions.',
  'vector': 'An ordered list of numbers, like `[0.2, -1.0, 3.1]`. A 1-D array. Its length is its dimension.',
  'matrix': 'A 2-D grid of numbers with rows and columns, like a spreadsheet table. Shape `(rows, cols)`.',
  'tensor': 'An N-dimensional array of numbers. Scalars, vectors and matrices are tensors with 0, 1 and 2 dimensions.',
  'shape': 'The size of each dimension of a tensor, like `(32, 128, 768)`. Most ML bugs are shape bugs.',
  'batch': 'A group of examples processed together in one pass, for speed. The first dimension `B` of most tensors.',
  'dot product': 'Multiply two equal-length vectors element by element and add the results. Big when they point the same way.',
  'matrix multiplication': 'Every row of the first matrix dotted with every column of the second. The core operation of every neural layer.',
  'broadcasting': 'NumPy/PyTorch rules that stretch a smaller array to match a bigger one, so `matrix + vector` adds the vector to every row.',
  'weights': 'The numbers a model learns. A layer multiplies its input by a weight matrix and adds a bias.',
  'neuron': 'One unit in a layer: a weighted sum of its inputs plus a bias, passed through an activation function.',
  'activation function': 'A non-linear function (like ReLU or sigmoid) applied after a layer. Without it, stacked layers collapse into one linear layer.',
  'ReLU': 'Rectified Linear Unit: `max(0, x)`. Keeps positives, zeroes negatives. The default activation in hidden layers.',
  'sigmoid': 'Squashes any number into 0–1: `1 / (1 + e^-x)`. Used for yes/no probabilities.',
  'softmax': 'Turns a list of scores into probabilities that are all positive and sum to 1.',
  'logit': 'A raw, unnormalised score that a model outputs before sigmoid or softmax turns it into a probability.',
  'loss function': 'A single number measuring how wrong the model is on a batch. Training tries to make it small.',
  'MSE': 'Mean squared error: the average of (prediction − truth)². The standard loss for predicting numbers.',
  'cross-entropy': 'The loss for classification: minus the log of the probability the model gave the correct answer.',
  'gradient': 'The slope of the loss with respect to each weight: which way, and how steeply, the loss goes up.',
  'gradient descent': 'Training by repeatedly nudging every weight a small step against its gradient, so the loss goes down.',
  'learning rate': 'The step size in gradient descent. Too big and the loss explodes; too small and training crawls.',
  'backpropagation': 'The algorithm that computes every weight\'s gradient by applying the chain rule backwards from the loss.',
  'chain rule': 'Calculus rule for nested functions: the slope of f(g(x)) is f′(g(x)) · g′(x). Backprop is this rule, applied layer by layer.',
  'epoch': 'One full pass over the training data.',
  'training set': 'The examples the model learns from.',
  'validation set': 'Held-out examples used to tune choices (learning rate, threshold, when to stop). Never trained on.',
  'test set': 'Held-out examples used once, at the end, to report honest performance.',
  'data leakage': 'When information from the test answers sneaks into training, making scores look great and then fail in production.',
  'overfitting': 'The model memorises the training data, noise included, and does worse on new data.',
  'underfitting': 'The model is too simple to capture the pattern, so it does badly even on training data.',
  'regularization': 'Techniques that discourage over-complex models, like adding a penalty for large weights (L2) or dropout.',
  'bias-variance trade-off': 'Simple models miss patterns (high bias); complex models chase noise (high variance). Good models balance both.',
  'logistic regression': 'A linear model plus a sigmoid that outputs a probability for a yes/no question. The classic first classifier.',
  'confusion matrix': 'A 2×2 table of true positives, false positives, true negatives and false negatives.',
  'precision': 'Of everything the model flagged as positive, the fraction that really was: TP / (TP + FP).',
  'recall': 'Of all the real positives, the fraction the model caught: TP / (TP + FN).',
  'F1 score': 'The harmonic mean of precision and recall. High only when both are high.',
  'threshold': 'The probability cut-off that turns a score into a yes/no decision. Moving it trades precision for recall.',
  'PR curve': 'Precision plotted against recall as the threshold moves. Shows every trade-off at once.',
  'Recall@K': 'For search: did the right item appear anywhere in the top K results?',
  'MRR': 'Mean Reciprocal Rank: average of 1 / (rank of the first correct result). Rewards putting it at the top.',
  'nDCG': 'Normalised Discounted Cumulative Gain: a ranking score that rewards relevant results near the top, with graded relevance.',
  'token': 'The unit of text a language model reads: a word, word-piece or symbol, mapped to an integer id.',
  'embedding': 'A learned vector that represents a token (or a whole text). Similar meanings get nearby vectors.',
  'positional encoding': 'A vector added to each token embedding that tells the model where the token sits in the sequence.',
  'self-attention': 'The Transformer step where every token looks at every other token and mixes in what is relevant.',
  'query, key, value': 'Three projections of each token in attention: the query asks, keys are matched against it, values are what gets mixed in.',
  'multi-head attention': 'Several attention computations in parallel, each free to focus on a different kind of relationship.',
  'causal mask': 'In decoders, a mask that blocks each token from attending to tokens after it, so the model cannot peek at the future.',
  'encoder': 'A Transformer that reads the whole input in both directions (like BERT). Great for embeddings, classification and reranking.',
  'decoder': 'A Transformer that generates text one token at a time, left to right (like GPT or Llama).',
  'hidden state': 'The vector a Transformer layer produces for each token. The last layer\'s hidden states are what embeddings are made from.',
  'KV cache': 'During generation, the stored keys and values of earlier tokens, so each new token does not recompute them.',
  'perplexity': 'How surprised a language model is by text: e to the average cross-entropy. Lower is better.',
  'pre-training': 'Training a model from scratch to predict the next token on a huge text corpus. Builds general knowledge.',
  'SFT': 'Supervised fine-tuning: training on input → ideal-output pairs, so the model learns to follow instructions or a format.',
  'RLHF': 'Reinforcement learning from human feedback: a reward model trained on human preferences steers the model.',
  'DPO': 'Direct Preference Optimization: learns from pairs of preferred vs rejected answers directly, without a separate reward model.',
  'fine-tuning': 'Continuing to train a pre-trained model on your own data to adapt its behaviour.',
  'PEFT': 'Parameter-efficient fine-tuning: train a small number of extra parameters instead of the whole model.',
  'LoRA': 'Low-Rank Adaptation: freeze the model and learn a small low-rank update ΔW = B·A for chosen weight matrices.',
  'QLoRA': 'LoRA on top of a 4-bit quantized base model, so a large model fits on one consumer GPU while you train.',
  'adapter': 'The small set of trained LoRA weights, saved separately (megabytes) and loaded on top of the base model.',
  'quantization': 'Storing weights with fewer bits (8 or 4 instead of 16), cutting memory and speeding inference with a small accuracy cost.',
  'GGUF': 'A file format for quantized models used by llama.cpp and Ollama to run on CPUs and laptops.',
  'AWQ': 'Activation-aware Weight Quantization: a 4-bit method that protects the most important weights, popular for GPU serving.',
  'Hugging Face': 'The hub and libraries (`transformers`, `datasets`, `peft`) where most open models and datasets live.',
  'vLLM': 'A fast open-source inference server for LLMs on GPUs, with paged KV cache and batching.',
  'Ollama': 'A tool that downloads and runs quantized models locally with one command and a local HTTP API.'
};

;
// ML Foundations capstone board: "Your ML lab" after each hands-on milestone.
// Canvas 800x300. Columns x = 80 / 240 / 400 / 560 / 720, rows y = 50 / 150 / 250. Positions never move.
const ML_CAP = {
  name: 'Your ML lab',
  desc: 'Five hands-on milestones on your own machine (and a free Colab GPU). Each one adds a working piece: a network you wrote by hand, a classifier you tuned, embeddings from a real Transformer, a LoRA adapter you trained, and a quantized model you serve locally.',
  size: [800, 300],
  start: 'A Python environment and curiosity.',
  nodes: {},
  vars: { models: 0, status: 'empty lab' },
  steps: {
    'mlcap-xor': { cap: 'A 2-layer network written in pure NumPy learns XOR. You watched the loss fall over 1,000 steps.',
      do: [['add', 'data', { x: 80, y: 150, label: 'XOR data', sub: '4 rows', kind: 'n' }], ['add', 'net', { x: 240, y: 150, label: 'NumPy net', sub: '2 → 4 → 1', kind: 'b', state: 'ok' }],
        ['add', 'loss', { x: 240, y: 50, label: 'Loss curve', sub: '0.69 → 0.01', kind: 'd', shape: 'pill' }], ['link', 'data', 'net'], ['link', 'net', 'loss'], ['var', 'models', 1], ['var', 'status', 'backprop works']] },
    'mlcap-spam': { cap: 'A scikit-learn logistic regression flags spam. You measured precision, recall and F1, and moved the threshold on purpose.',
      do: [['add', 'csv', { x: 80, y: 250, label: 'spam.csv', sub: '5,572 SMS', kind: 'n' }], ['add', 'lr', { x: 240, y: 250, label: 'LogReg', sub: 'scikit-learn', kind: 'b', state: 'ok' }],
        ['add', 'cm', { x: 400, y: 250, label: 'Metrics', sub: 'P / R / F1', kind: 'd', state: 'ok' }], ['link', 'csv', 'lr'], ['link', 'lr', 'cm'], ['var', 'models', 2], ['var', 'status', 'measured, not guessed']] },
    'mlcap-embed': { cap: 'A Hugging Face encoder turns sentences into embeddings. You read the tokenizer output and compared sentences by cosine similarity.',
      do: [['add', 'tok', { x: 400, y: 50, label: 'Tokenizer', sub: 'ids + mask', kind: 'c' }], ['add', 'hf', { x: 400, y: 150, label: 'HF encoder', sub: 'MiniLM', kind: 'c', state: 'ok' }],
        ['add', 'emb', { x: 560, y: 150, label: 'Embeddings', sub: '384 dims', kind: 'c', state: 'ok' }], ['link', 'tok', 'hf'], ['link', 'hf', 'emb'], ['var', 'models', 3], ['var', 'status', 'Transformers opened']] },
    'mlcap-lora': { cap: 'On a free Colab GPU you trained a LoRA adapter that turns support tickets into strict JSON payloads.',
      do: [['add', 'ds', { x: 560, y: 50, label: 'tickets.jsonl', sub: '500 pairs', kind: 'n', w: 130 }], ['add', 'adapter', { x: 720, y: 50, label: 'LoRA adapter', sub: 'r = 16', kind: 'e', state: 'ok' }],
        ['link', 'ds', 'adapter', 'SFT'], ['var', 'models', 4], ['var', 'status', 'fine-tuned']] },
    'mlcap-serve': { cap: 'You merged the adapter, quantized it to 4-bit GGUF, served it with Ollama, and an eval script proves the JSON is valid.',
      do: [['add', 'gguf', { x: 720, y: 150, label: 'GGUF Q4_K_M', sub: '~1 GB', kind: 'e', state: 'ok' }], ['add', 'ollama', { x: 720, y: 250, label: 'Ollama', sub: 'localhost:11434', kind: 'a', state: 'ok' }],
        ['add', 'evalj', { x: 560, y: 250, label: 'JSON eval', sub: 'valid rate', kind: 'd', state: 'ok' }], ['link', 'adapter', 'gguf', 'merge + quantize'], ['link', 'gguf', 'ollama'], ['link', 'ollama', 'evalj'],
        ['var', 'models', 5], ['var', 'status', 'served locally']] }
  }
};

// For per-file checks: the board as it stands just before the given steps, limited to those steps.
function ML_partial(ids) {
  const order = Object.keys(ML_CAP.steps), first = order.indexOf(ids[0]);
  const nodes = {}, edges = {}, vars = Object.assign({}, ML_CAP.vars);
  for (const id of order.slice(0, first)) for (const [o, a, b, c] of ML_CAP.steps[id].do) {
    if (o === 'add') nodes[a] = Object.assign({}, b); else if (o === 'set') Object.assign(nodes[a], b);
    else if (o === 'link') edges[a + '>' + b] = typeof c === 'string' ? { label: c } : Object.assign({}, c || {}); else if (o === 'unlink') delete edges[a + '>' + b];
    else if (o === 'var') vars[a] = b; else if (o === 'rm') delete nodes[a];
  }
  const steps = {}; for (const id of ids) steps[id] = ML_CAP.steps[id];
  return Object.assign({}, ML_CAP, { nodes, vars, steps, edges: Object.entries(edges).map(([k, v]) => [...k.split('>'), v]) });
}

;
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

;
// ML Foundations, Module 2: Data and evaluation. Every number below was checked with node.
const M2_GLOSS = {
  'accuracy': 'Share of all predictions that were right: (TP + TN) / everything. Misleading when one class is rare.',
  'stratified split': 'A split that keeps the class mix the same in every part, so 20% fraud overall means 20% fraud in train and in validation.',
  'time-based split': 'Train on older rows, validate on newer ones. The honest split for anything that changes over time.',
  'early stopping': 'Stop training when validation loss has not improved for a few checks, and keep the best checkpoint.',
  'dropout': 'During training, randomly switch off a share of neurons (say 10%) on each step, so no single neuron can memorise.',
  'L2 penalty': 'Add \\( \\alpha \\sum w^2 \\) to the loss, so big weights cost extra. Also called weight decay or ridge.',
  'learning curve': 'Training and validation loss plotted per epoch. The gap between them shows overfitting.',
  'true positive': 'A real positive the model flagged (TP). Example: a fraud payment the model caught.',
  'false positive': 'A negative the model wrongly flagged (FP). A false alarm, like a real email sent to spam.',
  'false negative': 'A real positive the model missed (FN). Example: fraud that slipped through.',
  'true negative': 'A negative the model correctly left alone (TN).',
  'golden set': 'A small set of test queries with human-marked correct answers, used to score a retriever or model.'
};

/* ---------- Lesson 1: splits and leakage ---------- */
// 20 payments, 4 fraud (20%). chargeback is filed only for fraud, weeks later: the leaky column.
const M2_PAY = [[1, 120, 0], [2, 45, 0], [3, 820, 1], [4, 230, 0], [5, 60, 0], [6, 720, 0], [7, 310, 0], [8, 640, 1], [9, 95, 0], [10, 150, 0],
  [11, 410, 0], [12, 75, 0], [13, 260, 0], [14, 910, 1], [15, 180, 0], [16, 560, 0], [17, 35, 0], [18, 380, 1], [19, 140, 0], [20, 290, 0]]
  .map(([day, amt, fraud]) => ({ day, amt, fraud: !!fraud }));
const M2_VAL = { 'random': [2, 5, 11, 13, 19], 'stratified': [4, 9, 14, 16, 20], 'time-based': [16, 17, 18, 19, 20] };
function M2_splitStats(s) {
  const val = M2_VAL[s.v.split] || M2_VAL.random, inVal = r => val.includes(r.day);
  const tr = M2_PAY.filter(r => !inVal(r)), va = M2_PAY.filter(inVal);
  const cut = s.v.cut || 500, ruleAmt = r => r.amt > cut, ruleLeak = r => r.fraud; // chargeback filed <=> fraud
  const acc = (rule, rows) => rows.filter(r => rule(r) === r.fraud).length;
  // the one-rule model keeps whichever rule fits the training rows best
  const leak = s.v.leak && acc(ruleLeak, tr) > acc(ruleAmt, tr), rule = leak ? ruleLeak : ruleAmt;
  return { va, leak, rule, ruleName: leak ? 'chargeback = yes' : 'amount > $' + cut, valRight: acc(rule, va), valFraud: va.filter(r => r.fraud).length,
    valCaught: va.filter(r => r.fraud && rule(r)).length,
    live: M2_PAY.filter(r => r.fraud && (leak ? false : ruleAmt(r))).length }; // live: chargeback is always blank
}

const M2_splits = {
  id: 'ml-splits', title: 'Splits and data leakage', mins: 8,
  goal: 'split data into train, validation and test sets, and spot a column that leaks the answer.',
  cards: [
    { t: 'read', h: '99.8% in the notebook. 0% in production.',
      body: 'Your fraud model catches every fraud case in validation. You ship it. In week one it catches **none**. Nothing crashed. The score lied.\n\nScores lie in two ways. You test on data the model has already seen. Or a column secretly contains the answer. Both are fixed before training even starts.',
      analogy: 'A student who saw the exam paper the night before. Perfect score, zero understanding. The fix is a fresh exam they have never seen.',
      points: ['The [[training set]] is for learning.', 'The [[validation set]] is for choosing.', 'The [[test set]] is for one final, honest score.'] },
    { t: 'viz', h: 'Split first, then watch a leak',
      body: '1,000 labelled card payments, split three ways.',
      nodes: { data: { x: 100, y: 190, label: 'payments.csv', sub: '1,000 rows', shape: 'db', w: 120, kind: 'n' } },
      steps: [
        { cap: '70% of rows go to the [[training set]]. The model learns its weights from these 700 rows only.', do: [['add', 'train', { x: 330, y: 65, label: 'Train', sub: '700 rows', kind: 'a' }], ['link', 'data', 'train']] },
        { cap: '15% go to the [[validation set]]. You use these 150 rows to compare settings and pick the best.', do: [['add', 'val', { x: 330, y: 190, label: 'Validation', sub: '150 rows', kind: 'c' }], ['link', 'data', 'val']] },
        { cap: 'The last 15% go to the [[test set]]. Lock it away. Score on it once, at the very end.', do: [['add', 'test', { x: 330, y: 315, label: 'Test', sub: '150 rows', kind: 'b', state: 'off' }], ['link', 'data', 'test']] },
        { cap: 'Train on 700 rows, then score on validation. The model catches 70% of the fraud there.', do: [['add', 'model', { x: 560, y: 128, label: 'Model', kind: 'b' }], ['link', 'train', 'model', 'learn'], ['link', 'model', 'val', { label: 'score', dash: true }], ['var', 'validation: fraud caught', '70%']] },
        { cap: 'A teammate adds a `chargeback` column. Retrain. Validation now says 100% of fraud caught.', do: [['set', 'data', { sub: '+ chargeback', state: 'warn' }], ['var', 'validation: fraud caught', '100%'], ['note', 'model', 'Leans on chargeback']] },
        { cap: 'Live, a chargeback is filed weeks after the payment. At decision time the column is empty. Fraud caught: 0%.', do: [['add', 'prod', { x: 690, y: 260, label: 'Production', w: 130, kind: 'd', state: 'bad' }], ['link', 'model', 'prod', { tone: 'bad' }], ['var', 'live: fraud caught', '0%']] },
        { cap: 'That is [[data leakage]]: the column held the answer. Only use what you will know at prediction time.', do: [['set', 'data', { state: 'bad' }], ['focus', 'data', 'model', 'prod']] }
      ],
      predict: { at: 5, q: 'Validation says 100% of fraud caught. What happens live?', options: ['About 100%: validation is honest', 'About 70%, like before the new column', 'Close to 0%'], answer: 2,
        why: 'The model learned "chargeback = yes means fraud". Live, nobody has filed a chargeback yet, so the column is always empty and the model never fires.' } },
    { t: 'quiz', q: 'You predict which customers will cancel next month. Which column leaks the answer?',
      options: ['`logins_last_30_days`', '`plan_price`', '`cancellation_reason`', '`signup_country`'], answer: 2,
      why: '`cancellation_reason` is only filled in after someone cancels. In training it gives the answer away; at prediction time it is always empty.',
      whyNot: { 0: 'Login counts exist before the customer cancels, so you have them at prediction time. That is a fair, useful feature.', 1: 'The price is known in advance for every customer. No leak.', 3: 'Country is set at signup, long before anyone cancels. No leak.' },
      hints: ['Ask of each column: would I know this value **before** the customer cancels?', 'One column only gets a value after the event you are predicting.'] },
    { t: 'read', h: 'Common mistake → best practice: the random split',
      body: 'With 4 fraud rows in 20, a random split can put **zero** fraud in validation. Every score is then meaningless. A [[stratified split]] keeps the 20% fraud rate in every part.\n\nFraud, prices and users change over time. A random split lets the model peek at the future. A [[time-based split]] trains on the past and validates on the newest rows, exactly like production.',
      code: 'from sklearn.model_selection import train_test_split\n\n# Stratified: same fraud rate in both parts\nX_tr, X_val, y_tr, y_val = train_test_split(\n    X, y, test_size=0.25, stratify=y, random_state=0)\n\n# Time-based: past for training, newest 25% for validation\ndf = df.sort_values("date")\ncut = int(len(df) * 0.75)\ntrain, val = df[:cut], df[cut:]', lang: 'Python' },
    { t: 'play', kind: 'controls', h: 'Split 20 payments, then leak one column',
      body: 'Pink = fraud. In validation, ✓ = the model got it right. The model keeps whichever rule fits the training rows best.',
      size: [800, 330],
      init: () => ({ sawLeak: false }),
      controls: [
        { id: 'split', type: 'select', label: 'Split', options: ['random', 'stratified', 'time-based'] },
        { id: 'leak', type: 'toggle', label: 'Add the `chargeback` column' },
        { id: 'cut', type: 'range', label: 'Amount rule: flag above', min: 100, max: 900, step: 100, value: 500, unit: '$' }
      ],
      update: s => { if (s.v.leak) s.sawLeak = true; },
      view: s => {
        const r = M2_splitStats(s), val = M2_VAL[s.v.split] || M2_VAL.random;
        const nodes = { tr: { x: 270, y: 170, w: 500, h: 250, shape: 'group', label: 'Train · 15 rows' }, va: { x: 667, y: 170, w: 190, h: 250, shape: 'group', label: 'Validation · 5 rows' } };
        let ti = 0, vi = 0;
        for (const p of M2_PAY) {
          const n = { label: '$' + p.amt, sub: 'day ' + p.day, w: 56, h: 40, kind: p.fraud ? 'e' : 'n' };
          if (val.includes(p.day)) { n.x = 620 + (vi % 2) * 95; n.y = 100 + Math.floor(vi / 2) * 70; n.state = r.rule(p) === p.fraud ? 'ok' : 'bad'; vi++; }
          else { n.x = 75 + (ti % 5) * 95; n.y = 100 + Math.floor(ti / 5) * 70; ti++; }
          nodes['p' + p.day] = n;
        }
        return { nodes, vars: { rule: r.ruleName, 'validation right': r.valRight + ' of 5', 'fraud in validation': r.valFraud, 'caught live': r.live + ' of 4' } };
      },
      readout: s => { const r = M2_splitStats(s); return [['Model picked', r.ruleName], ['Fraud rows in validation', r.valFraud + ' of 5'], ['Validation score', r.valRight + ' of 5 right'], ['Fraud caught live', r.live + ' of 4']]; },
      goals: [
        { text: 'Get at least one fraud row into validation', check: s => M2_splitStats(s).valFraud > 0, solve: [{ split: 'stratified' }] },
        { text: 'Add `chargeback` and get a perfect validation score, with fraud in validation', check: s => { const r = M2_splitStats(s); return r.leak && r.valFraud > 0 && r.valRight === 5; }, solve: [{ leak: true }] },
        { text: 'Be honest: drop `chargeback` and validate on the newest days', check: s => s.sawLeak && !s.v.leak && s.v.split === 'time-based', solve: [{ leak: false, split: 'time-based' }] }
      ],
      hints: ['The random split put all 4 fraud rows in training. Try another split.', 'A perfect score needs the `chargeback` toggle on. Then check "Fraud caught live".', 'Turn the toggle off and pick the time-based split. At a $500 cut-off that is 3 of 5 right: lower, but true.'],
      done: 'No leak plus a time-based split gives the score production will match. Lower than 100%, but true.' },
    { t: 'quiz', kind: 'order', q: 'Put a clean evaluation in order.',
      items: ['Split the data into train, validation and test', 'Fit the model on the training set', 'Compare settings on the validation set', 'Score the chosen model on the test set, once'],
      why: 'Split before anything else, so no choice ever sees the test rows. Validation is for choosing; test is for one final, honest number.' },
    { t: 'recap', points: ['Train to learn, validation to choose, test once at the end.', 'A typical split is 70 / 15 / 15.', '[[data leakage|Leakage]]: a column you will not have at prediction time. It gives perfect scores and useless models.', 'Rare classes need a [[stratified split]]; data that changes over time needs a [[time-based split]].'],
      cheat: [['train_test_split(X, y, test_size=0.25, stratify=y)', 'Stratified random split'], ['df.sort_values("date"); df[:cut], df[cut:]', 'Time-based split'], ['"Will I know this column at prediction time?"', 'The leakage test for every feature']] }
  ]
};

/* ---------- Lesson 2: overfitting ---------- */
// 8 training and 7 validation points around a smooth hill. Ridge fit like scikit-learn Ridge(alpha):
// minimise sum of squared errors + alpha * sum(w^2), intercept not penalised, x scaled to [-1, 1].
const M2_TX = [0, 1, 2, 3, 4, 5, 6, 7], M2_TY = [-0.4, 0.9, 1.4, 0.6, 0.6, -0.8, -0.7, -0.8];
const M2_VX = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5], M2_VY = [0.3, 0.9, 1.4, 0.9, 0.3, -0.7, -1.1];
function M2_fit(deg, alpha) {
  const sc = x => (x - 3.5) / 3.5, row = x => Array.from({ length: deg + 1 }, (_, j) => sc(x) ** j);
  const X = M2_TX.map(row), n = deg + 1, A = [];
  for (let i = 0; i < n; i++) { A.push([]); for (let j = 0; j < n; j++) A[i].push(X.reduce((t, r) => t + r[i] * r[j], 0) + (i === j && i > 0 ? alpha : 0)); A[i].push(X.reduce((t, r, k) => t + r[i] * M2_TY[k], 0)); }
  for (let i = 0; i < n; i++) { // Gauss-Jordan with partial pivoting
    let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]];
    for (let r = 0; r < n; r++) if (r !== i) { const m = A[r][i] / A[i][i]; for (let c = i; c <= n; c++) A[r][c] -= m * A[i][c]; }
  }
  const w = A.map((r, i) => r[n] / r[i]), pred = x => row(x).reduce((t, v, j) => t + v * w[j], 0);
  const mse = (xs, ys) => xs.reduce((t, x, i) => t + (pred(x) - ys[i]) ** 2, 0) / xs.length;
  return { train: mse(M2_TX, M2_TY), val: mse(M2_VX, M2_VY) };
}
const M2_verdict = e => e.train > 0.1 ? 'underfitting: too simple' : e.val - e.train > 0.05 ? 'overfitting: memorising' : 'good fit';
const M2_f3 = v => v.toFixed(3);

const M2_overfit = {
  id: 'ml-overfit', title: 'Overfitting and regularization', mins: 8, needs: 'ml-splits',
  goal: 'read a learning curve, spot overfitting, and fix it with L2, dropout or early stopping.',
  cards: [
    { t: 'read', h: 'Training loss 0.00. Validation: your worst model yet.',
      body: 'You give a model more layers and more epochs. Training loss falls to zero. You celebrate, then run validation. It is the worst score you have seen.\n\nThe model did not learn the pattern. It memorised the training rows, noise included. That is [[overfitting]]. The opposite, a model too simple to fit even the training data, is [[underfitting]].',
      analogy: 'A student memorises the answer key to the practice test: "Q3 is B". Same test, 100%. New questions, they fail. Learning the method would have scored lower on practice and higher on the real exam.' },
    { t: 'viz', h: 'Watch a training run start to memorise',
      body: 'Blue = training loss, pink = validation loss, checked every 2 epochs.',
      nodes: { ax: { x: 400, y: 350, label: 'epochs →', shape: 'text' } },
      steps: [
        { cap: 'Epoch 2: training loss 0.62, validation loss 0.66. Both fall as the model learns real patterns.', do: [['add', 't2', { x: 107, y: 320, shape: 'bar', w: 42, h: 186, label: '.62', kind: 'a' }], ['add', 'v2', { x: 153, y: 320, shape: 'bar', w: 42, h: 198, label: '.66', kind: 'e' }], ['var', 'epoch', 2]] },
        { cap: 'Epoch 4: training 0.41, validation 0.50. Still both falling. All good.', do: [['add', 't4', { x: 247, y: 320, shape: 'bar', w: 42, h: 123, label: '.41', kind: 'a' }], ['add', 'v4', { x: 293, y: 320, shape: 'bar', w: 42, h: 150, label: '.50', kind: 'e' }], ['var', 'epoch', 4]] },
        { cap: 'Epoch 6: training 0.29, validation 0.46, the lowest so far. Save a checkpoint of these weights.', do: [['add', 't6', { x: 387, y: 320, shape: 'bar', w: 42, h: 87, label: '.29', kind: 'a' }], ['add', 'v6', { x: 433, y: 320, shape: 'bar', w: 42, h: 138, label: '.46', kind: 'e', state: 'ok' }], ['add', 'ck', { x: 680, y: 60, label: 'Checkpoint', sub: 'epoch 6 · 0.46', w: 140, kind: 'c' }], ['var', 'epoch', 6]] },
        { cap: 'Epoch 8: training loss keeps falling to 0.20. Validation rises to 0.49. The model starts memorising.', do: [['add', 't8', { x: 527, y: 320, shape: 'bar', w: 42, h: 60, label: '.20', kind: 'a' }], ['add', 'v8', { x: 573, y: 320, shape: 'bar', w: 42, h: 147, label: '.49', kind: 'e', state: 'warn' }], ['var', 'epoch', 8]] },
        { cap: 'Epoch 10: training 0.13, validation 0.57. The gap between the two is [[overfitting]].', do: [['add', 't10', { x: 667, y: 320, shape: 'bar', w: 42, h: 39, label: '.13', kind: 'a' }], ['add', 'v10', { x: 713, y: 320, shape: 'bar', w: 42, h: 171, label: '.57', kind: 'e', state: 'bad' }], ['var', 'epoch', 10]] },
        { cap: '[[early stopping|Early stopping]]: no improvement for 2 checks, so stop and restore the epoch-6 checkpoint.', do: [['set', 'v8', { state: 'off' }], ['set', 'v10', { state: 'off' }], ['set', 'ck', { state: 'active' }], ['focus', 'v6', 'ck']] },
        { cap: 'This picture is a [[learning curve]]. Read the gap: small gap = fine, growing gap = memorising.', do: [['note', 'v10', 'gap 0.44']] }
      ],
      predict: { at: 3, q: 'Training loss drops from 0.29 to 0.20. What does validation loss do?', options: ['Falls too, to about 0.40', 'Goes up', 'Stays exactly 0.46'], answer: 1,
        why: 'Past epoch 6 the model fits noise in the training rows. That noise does not exist in validation, so validation loss rises (0.46 → 0.49 → 0.57).' } },
    { t: 'quiz', q: 'Training error 0.01, validation error 0.90. What is going on?',
      options: ['Overfitting', 'Underfitting', 'The learning rate is too low', 'Nothing: low training error is the goal'], answer: 0,
      why: 'A tiny training error with a big validation error is the signature of memorising: [[overfitting]].',
      whyNot: { 1: 'Underfitting means both errors are high. Here training error is almost zero.', 2: 'A learning rate that is too low leaves training error high. Training error is 0.01, so the model fit the training set fine.', 3: 'The goal is low error on new data. Training error alone cannot tell you that.' },
      hints: ['Compare the two numbers, not just one.', 'Which problem makes training look great and new data look bad?'] },
    { t: 'read', h: 'Four ways to stop memorising',
      body: '**[[L2 penalty]]**: add a cost for big weights, \\( \\text{loss} = \\text{error} + \\alpha \\sum w^2 \\). Weights \\( [3, -4] \\) cost \\( 9 + 16 = 25 \\). With \\( \\alpha = 0.01 \\) that adds 0.25.\n\n**[[dropout|Dropout]]** switches off random neurons each step. **[[early stopping|Early stopping]]** keeps the best epoch. **More data** makes noise harder to memorise.\n\nThe balance is the [[bias-variance trade-off]]: too simple misses the pattern; too flexible chases noise.',
      code: 'from sklearn.linear_model import Ridge\nmodel = Ridge(alpha=0.01).fit(X_train, y_train)   # L2\n\nimport torch.nn as nn\nnet = nn.Sequential(nn.Linear(384, 128), nn.ReLU(),\n                    nn.Dropout(p=0.1),              # dropout\n                    nn.Linear(128, 2))', lang: 'Python' },
    { t: 'play', kind: 'controls', h: 'Fit a curve: too simple, too wiggly, just right',
      body: 'A polynomial is fit to 8 training points; 7 validation points judge it. Blue bar = training error, pink = validation error (MSE).',
      size: [800, 340],
      init: () => ({}),
      controls: [
        { id: 'deg', type: 'range', label: 'Polynomial degree', min: 1, max: 7, step: 1, value: 1 },
        { id: 'alpha', type: 'select', label: 'L2 strength α', options: ['0', '0.001', '0.01', '0.1', '1'] }
      ],
      presets: [{ label: 'Too simple', v: { deg: 1, alpha: '0' } }, { label: 'Memorise', v: { deg: 7, alpha: '0' } }],
      view: s => {
        const a = +s.v.alpha, nodes = {}, H = e => Math.round(8 + Math.min(e, 0.5) / 0.5 * 220);
        for (let d = 1; d <= 7; d++) {
          const e = M2_fit(d, a), x = 110 + (d - 1) * 100, on = d === s.v.deg;
          nodes['t' + d] = { x: x - 18, y: 290, shape: 'bar', w: 32, h: H(e.train), kind: 'a', state: on ? 'active' : undefined };
          nodes['v' + d] = { x: x + 18, y: 290, shape: 'bar', w: 32, h: H(e.val), kind: 'e', state: on ? 'active' : e.val > 0.5 ? 'bad' : undefined };
          nodes['l' + d] = { x, y: 315, shape: 'text', label: 'degree ' + d };
          if (e.val > 0.5) nodes['o' + d] = { x: x + 18, y: 40, shape: 'text', label: e.val.toFixed(2) + ' ↑' };
        }
        const e = M2_fit(s.v.deg, a);
        return { nodes, vars: { degree: s.v.deg, 'α': s.v.alpha, 'train error': M2_f3(e.train), 'validation error': M2_f3(e.val) } };
      },
      readout: s => { const e = M2_fit(s.v.deg, +s.v.alpha); return [['Training error', M2_f3(e.train)], ['Validation error', M2_f3(e.val)], ['Verdict', M2_verdict(e)]]; },
      goals: [
        { text: 'Make the training error hit **0.000**, then look at validation', check: s => M2_fit(s.v.deg, +s.v.alpha).train < 0.0005, solve: [{ deg: 7, alpha: '0' }] },
        { text: 'With α = 0, find the degree with the **lowest validation error**', check: s => s.v.alpha === '0' && s.v.deg === 3, solve: [{ deg: 3, alpha: '0' }] },
        { text: 'Keep degree 7, but tame it with L2: validation error **under 0.090**', check: s => s.v.deg === 7 && M2_fit(7, +s.v.alpha).val < 0.09, solve: [{ deg: 7, alpha: '0.01' }] }
      ],
      hints: ['8 training points can be hit exactly by a degree-7 curve.', 'Watch the pink bars: they dip, then shoot up. Pick the lowest pink bar.', 'At degree 7, try each α. Too small does little; 1 squashes everything. 0.01 is the sweet spot.'],
      done: 'Degree 7 with α = 0.01 scores 0.081, close to the best simple model (0.067 at degree 3). L2 lets a flexible model behave.' },
    { t: 'quiz', kind: 'multi', q: 'Which of these reduce overfitting?',
      options: ['Add an L2 penalty', 'Add dropout', 'Keep training long after validation loss starts rising', 'Collect more training data', 'Raise the polynomial degree'], answer: [0, 1, 3],
      why: 'L2 and dropout limit how much the model can memorise. More data makes the noise harder to memorise.',
      whyNot: { 2: 'Training past the validation minimum is exactly how overfitting grows. Early stopping does the opposite.', 4: 'A higher degree is more flexible, so it can memorise more noise. That increases overfitting.' } },
    { t: 'recap', points: ['[[overfitting|Overfitting]]: low training error, high validation error. [[underfitting|Underfitting]]: both high.', 'A [[learning curve]] shows it: watch the gap between the two lines.', 'Fixes: [[L2 penalty]], [[dropout]], [[early stopping]], more data.', 'Choose model size by validation error, never by training error.'],
      cheat: [['loss = error + α·Σw²', 'L2 penalty (Ridge, weight decay)'], ['Ridge(alpha=0.01)', 'L2 in scikit-learn'], ['nn.Dropout(p=0.1)', 'Dropout in PyTorch'], ['stop when val loss has not improved for N checks', 'Early stopping (patience N)']] }
  ]
};

/* ---------- Lesson 3: confusion matrix ---------- */
const M2_num = (f, ...a) => { try { const v = f ? f(...a) : NaN; return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; } };
const M2_near = (v, want) => Math.abs(v - want) < 1e-3;

const M2_confusion = {
  id: 'ml-confusion', title: 'Precision, recall and F1', mins: 8, needs: 'ml-overfit',
  goal: 'build a confusion matrix and compute precision, recall and F1 by hand.',
  cards: [
    { t: 'read', h: 'A 99% accurate model that catches nothing',
      body: 'Fraud is 1% of card payments. Here is a model: `return "legit"`. One line, no training.\n\nIt is right on 990 of 1,000 payments: 99% [[accuracy]]. It also catches **zero** fraud. When one class is rare, accuracy hides the only thing you care about.\n\nThe fix is to count each kind of right and wrong answer separately, in a [[confusion matrix]].',
      analogy: 'A smoke alarm with no battery is "right" 364 days a year. You only learn it is useless on the day of the fire.' },
    { t: 'viz', h: 'Fill in a confusion matrix',
      body: '1,000 payments. 10 are fraud (1%).',
      nodes: {
        hc1: { x: 330, y: 50, label: 'Flagged as fraud', shape: 'text' }, hc2: { x: 550, y: 50, label: 'Let through', shape: 'text' },
        hr1: { x: 120, y: 130, label: 'Really fraud', shape: 'text' }, hr2: { x: 120, y: 250, label: 'Really legit', shape: 'text' },
        tp: { x: 330, y: 130, label: 'TP ?', sub: 'fraud caught', w: 170, h: 64, kind: 'c' }, fn: { x: 550, y: 130, label: 'FN ?', sub: 'fraud missed', w: 170, h: 64, kind: 'e' },
        fp: { x: 330, y: 250, label: 'FP ?', sub: 'false alarm', w: 170, h: 64, kind: 'd' }, tn: { x: 550, y: 250, label: 'TN ?', sub: 'legit, let through', w: 170, h: 64, kind: 'n' }
      },
      steps: [
        { cap: 'The lazy model says "legit" every time. 990 legit payments pass: TN 990. All 10 fraud pass too: FN 10.', do: [['set', 'tn', { label: 'TN 990' }], ['set', 'fn', { label: 'FN 10', state: 'bad' }], ['set', 'tp', { label: 'TP 0' }], ['set', 'fp', { label: 'FP 0' }]] },
        { cap: '[[accuracy|Accuracy]] = (TP + TN) / all = (0 + 990) / 1,000 = 99%. Fraud caught: 0 of 10.', do: [['var', 'accuracy', '99%'], ['var', 'fraud caught', '0 of 10'], ['focus', 'tn', 'fn']] },
        { cap: 'Model B flags 48 payments. 8 really are fraud: 8 [[true positive|true positives]]. 40 are [[false positive|false alarms]].', do: [['set', 'tp', { label: 'TP 8', state: 'ok' }], ['set', 'fp', { label: 'FP 40', state: 'warn' }], ['set', 'fn', { label: 'FN ?', state: undefined }], ['set', 'tn', { label: 'TN ?' }]] },
        { cap: 'It misses 2 fraud ([[false negative|FN]] 2). 950 legit payments pass ([[true negative|TN]] 950). Accuracy = (8 + 950) / 1,000 = 95.8%.', do: [['set', 'fn', { label: 'FN 2', state: 'bad' }], ['set', 'tn', { label: 'TN 950' }], ['var', 'accuracy', '95.8%'], ['var', 'fraud caught', '?']] },
        { cap: '[[recall|Recall]] = TP / (TP + FN) = 8 / 10 = 80%. Model B catches 8 of every 10 fraud cases.', do: [['var', 'recall', '80%'], ['var', 'fraud caught', '8 of 10'], ['focus', 'tp', 'fn']] },
        { cap: '[[precision|Precision]] = TP / (TP + FP) = 8 / 48 = 16.7%. Most flags are false alarms, so a human must review them.', do: [['var', 'precision', '16.7%'], ['focus', 'tp', 'fp']] },
        { cap: '[[F1 score|F1]] = 2·TP / (2·TP + FP + FN) = 16 / 58 = 0.28. One number, high only when both are high.', do: [['var', 'F1', '0.28']] }
      ],
      predict: { at: 4, q: 'Model B has 95.8% accuracy, lower than the lazy model\'s 99%. Which would you ship?', options: ['The lazy model: higher accuracy', 'Model B: it catches fraud', 'Neither: they are the same'], answer: 1,
        why: 'Model B catches 8 of 10 fraud cases (80% recall). The lazy model catches 0. Accuracy rewarded doing nothing.' } },
    { t: 'quiz', q: 'A cancer screen on 1,000 people: TP 45, FP 5, FN 15, TN 935. What is the recall?',
      options: ['90%', '75%', '98%', '25%'], answer: 1,
      why: 'Recall = TP / (TP + FN) = 45 / (45 + 15) = 45 / 60 = 75%. It found 3 of every 4 real cases.',
      whyNot: { 0: '90% is precision: 45 / (45 + 5). That divides by everyone flagged, not by everyone sick.', 2: '98% is accuracy: (45 + 935) / 1,000. The healthy majority inflates it.', 3: '25% is the miss rate: 15 / 60. Recall is the share caught, not missed.' },
      hints: ['Recall asks: of everyone really sick, how many did we flag?', 'Really sick = TP + FN = 45 + 15.'] },
    { t: 'read', h: 'Common mistake → best practice: one accuracy number',
      body: 'Never report [[accuracy]] alone when one class is rare. Print the full [[confusion matrix]] and the per-class precision and recall.\n\nThen ask which mistake costs more. A missed fraud loses money: chase recall. A false alarm blocks a real customer: chase precision.',
      code: 'from sklearn.metrics import confusion_matrix, classification_report\n\nprint(confusion_matrix(y_true, y_pred))\n# [[TN FP]\n#  [FN TP]]   rows = truth, columns = prediction\nprint(classification_report(y_true, y_pred))', lang: 'Python' },
    { t: 'play', kind: 'code', h: 'Write precision, recall and F1',
      body: 'Fill in the three functions. The boxes on the right run them on Model B (TP 8, FP 40, FN 2).',
      size: [800, 290],
      starter: 'function precision(tp, fp, fn) {\n  // Of everything we flagged, how much was really fraud?\n  return 0;\n}\n\nfunction recall(tp, fp, fn) {\n  // Of all the real fraud, how much did we catch?\n  return 0;\n}\n\nfunction f1(tp, fp, fn) {\n  // High only when precision and recall are both high\n  return 0;\n}\n\nconsole.log(precision(8, 40, 2), recall(8, 40, 2), f1(8, 40, 2));',
      expose: ['precision', 'recall', 'f1'],
      view: s => {
        const api = s.api || {}, P = M2_num(api.precision, 8, 40, 2), R = M2_num(api.recall, 8, 40, 2), F = M2_num(api.f1, 8, 40, 2);
        const box = (y, name, v, want) => ({ x: 620, y, w: 230, h: 52, label: name + ' = ' + (isNaN(v) ? '?' : v.toFixed(3)), sub: 'want ' + want.toFixed(3), kind: 'b', state: M2_near(v, want) ? 'ok' : 'off' });
        return { nodes: {
          tp: { x: 150, y: 90, label: 'TP 8', sub: 'fraud caught', w: 160, h: 56, kind: 'c' }, fn: { x: 350, y: 90, label: 'FN 2', sub: 'fraud missed', w: 160, h: 56, kind: 'e' },
          fp: { x: 150, y: 200, label: 'FP 40', sub: 'false alarm', w: 160, h: 56, kind: 'd' }, tn: { x: 350, y: 200, label: 'TN 950', sub: 'legit, let through', w: 160, h: 56, kind: 'n' },
          P: box(55, 'precision', P, 8 / 48), R: box(145, 'recall', R, 0.8), F: box(235, 'F1', F, 16 / 58) } };
      },
      goals: [
        { text: '`precision(8, 40, 2)` returns **0.167** (8 / 48)', check: s => !!s.api && M2_near(M2_num(s.api.precision, 8, 40, 2), 8 / 48) && M2_near(M2_num(s.api.precision, 45, 5, 15), 0.9),
          solve: ['function precision(tp, fp, fn) {\n  return tp / (tp + fp);\n}\n\nfunction recall(tp, fp, fn) {\n  return 0;\n}\n\nfunction f1(tp, fp, fn) {\n  return 0;\n}'] },
        { text: '`recall(8, 40, 2)` returns **0.8** (8 / 10)', check: s => !!s.api && M2_near(M2_num(s.api.recall, 8, 40, 2), 0.8) && M2_near(M2_num(s.api.recall, 45, 5, 15), 0.75),
          solve: ['function precision(tp, fp, fn) {\n  return tp / (tp + fp);\n}\n\nfunction recall(tp, fp, fn) {\n  return tp / (tp + fn);\n}\n\nfunction f1(tp, fp, fn) {\n  return 0;\n}'] },
        { text: '`f1(8, 40, 2)` returns **0.276**, and `f1(0, 0, 10)` returns 0, not `NaN`', check: s => !!s.api && M2_near(M2_num(s.api.f1, 8, 40, 2), 16 / 58) && M2_num(s.api.f1, 0, 0, 10) === 0,
          solve: ['function precision(tp, fp, fn) {\n  return tp / (tp + fp);\n}\n\nfunction recall(tp, fp, fn) {\n  return tp / (tp + fn);\n}\n\nfunction f1(tp, fp, fn) {\n  if (tp === 0) return 0;   // the lazy model: no flags at all\n  return 2 * tp / (2 * tp + fp + fn);\n}'] }
      ],
      hints: ['Precision divides by everything flagged: `tp + fp`. Recall divides by all real fraud: `tp + fn`.', 'F1 is `2 * p * r / (p + r)`, which simplifies to `2 * tp / (2 * tp + fp + fn)`.', 'With zero flags, `tp` is 0 and you divide 0 by 0. Return 0 early when `tp === 0`.'],
      done: 'You just wrote what `sklearn.metrics.precision_score`, `recall_score` and `f1_score` do, including the zero-division guard.' },
    { t: 'quiz', kind: 'fill', q: 'A model has TP 30 and FN 10. What is its recall, as a decimal?', pre: 'recall =', placeholder: '0.?', answer: ['0.75', '.75', '3/4', '75%'],
      why: 'Recall = TP / (TP + FN) = 30 / (30 + 10) = 30 / 40 = 0.75. False positives do not affect recall.' },
    { t: 'recap', points: ['When one class is rare, [[accuracy]] lies: "always no" scores 99% on 1% fraud.', 'A [[confusion matrix]] counts TP, FP, FN and TN separately.', '[[precision|Precision]] = TP / (TP + FP): how trustworthy a flag is. [[recall|Recall]] = TP / (TP + FN): how much you catch.', '[[F1 score|F1]] is high only when both are high.'],
      cheat: [['precision = TP / (TP + FP)', 'Of the flags, how many were right'], ['recall = TP / (TP + FN)', 'Of the real positives, how many were caught'], ['F1 = 2·TP / (2·TP + FP + FN)', 'Harmonic mean of precision and recall'], ['classification_report(y_true, y_pred)', 'All three, per class, in scikit-learn']] }
  ]
};

/* ---------- Lesson 4: thresholds ---------- */
// 20 emails with spam scores; 8 spam, 12 real. Flag as spam when score >= threshold.
const M2_MAIL = [[0.97, 1], [0.93, 1], [0.88, 1], [0.86, 1], [0.81, 1], [0.78, 0], [0.74, 1], [0.66, 0], [0.62, 1], [0.56, 0],
  [0.46, 0], [0.41, 1], [0.38, 0], [0.31, 0], [0.24, 0], [0.18, 0], [0.12, 0], [0.08, 0], [0.04, 0], [0.03, 0]].map(([p, spam]) => ({ p, spam: !!spam }));
function M2_thr(t) {
  t = Math.round(t * 100) / 100;
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (const m of M2_MAIL) { const flag = m.p >= t; if (flag && m.spam) tp++; else if (flag) fp++; else if (m.spam) fn++; else tn++; }
  return { t, tp, fp, fn, tn, P: tp + fp ? tp / (tp + fp) : 0, R: tp / (tp + fn), F: 2 * tp / (2 * tp + fp + fn), cost: 5 * fp + fn };
}
const M2_pct = v => (Math.round(v * 1000) / 10) + '%';

const M2_threshold = {
  id: 'ml-threshold', title: 'Thresholds and the PR trade-off', mins: 9, needs: 'ml-confusion',
  goal: 'move a decision threshold, predict how precision and recall change, and pick the threshold with the lowest business cost.',
  cards: [
    { t: 'read', h: 'Your spam filter ate the CEO\'s email',
      body: 'Your classifier does not say "spam". It says `0.78`: a score from 0 to 1. Something turns that into a decision: the [[threshold]]. The default is 0.5, so `0.78` goes to the spam folder.\n\nThat 0.78 was a real email from your CEO. Should you raise the threshold to 0.8? You will lose some spam catches. This lesson shows exactly how many.',
      analogy: 'A nightclub bouncer with a strictness dial. Strict: no troublemakers get in, but some good guests are turned away. Relaxed: everyone fun gets in, and so do a few troublemakers.',
      code: 'scores = model.predict_proba(X_val)[:, 1]   # spam probability\npred = scores >= 0.5                        # the threshold', lang: 'Python' },
    { t: 'viz', h: 'Move the threshold from 0.50 to 0.80',
      body: '20 emails: 8 spam, 12 real. Score ≥ threshold → spam folder.',
      nodes: {
        cut: { x: 440, y: 45, label: 'threshold 0.50', w: 170, shape: 'pill', kind: 'b' },
        hc1: { x: 330, y: 105, label: 'Flagged as spam', shape: 'text' }, hc2: { x: 550, y: 105, label: 'Left in inbox', shape: 'text' },
        hr1: { x: 120, y: 165, label: 'Really spam', shape: 'text' }, hr2: { x: 120, y: 285, label: 'Really real', shape: 'text' },
        tp: { x: 330, y: 165, label: 'TP ?', sub: 'spam caught', w: 170, h: 64, kind: 'c' }, fn: { x: 550, y: 165, label: 'FN ?', sub: 'spam in inbox', w: 170, h: 64, kind: 'e' },
        fp: { x: 330, y: 285, label: 'FP ?', sub: 'real email lost', w: 170, h: 64, kind: 'd' }, tn: { x: 550, y: 285, label: 'TN ?', sub: 'real email kept', w: 170, h: 64, kind: 'n' }
      },
      steps: [
        { cap: 'At 0.50, 7 spam score high enough to be caught (TP 7). 3 real emails also score ≥ 0.50 (FP 3).', do: [['set', 'tp', { label: 'TP 7' }], ['set', 'fp', { label: 'FP 3', state: 'warn' }]] },
        { cap: 'One spam scores 0.41 and lands in the inbox (FN 1). The other 9 real emails stay put (TN 9).', do: [['set', 'fn', { label: 'FN 1' }], ['set', 'tn', { label: 'TN 9' }]] },
        { cap: '[[precision|Precision]] = 7 / (7 + 3) = 70%. [[recall|Recall]] = 7 / (7 + 1) = 87.5%.', do: [['var', 'precision', '70%'], ['var', 'recall', '87.5%']] },
        { cap: 'Now raise the threshold to 0.80. Every email keeps its score; only the cut-off moves.', do: [['set', 'cut', { label: 'threshold 0.80', state: 'active' }], ['note', 'cut', 'Stricter']] },
        { cap: 'The 3 lost real emails (0.78, 0.66, 0.56) return: FP 0. But spam at 0.74 and 0.62 slips through: FN 3.', do: [['set', 'fp', { label: 'FP 0', state: 'ok' }], ['set', 'tn', { label: 'TN 12' }], ['set', 'tp', { label: 'TP 5' }], ['set', 'fn', { label: 'FN 3', state: 'warn' }]] },
        { cap: 'Precision = 5 / 5 = 100%. Recall = 5 / 8 = 62.5%. Fewer false alarms, more misses.', do: [['var', 'precision', '100%'], ['var', 'recall', '62.5%']] },
        { cap: 'No free lunch: a higher threshold buys precision with recall. A lower one buys recall with precision.', do: [['focus', 'cut', 'fp', 'fn']] }
      ],
      predict: { at: 4, q: 'You raise the threshold from 0.50 to 0.80. What happens?', options: ['Precision up, recall down', 'Both go up', 'Precision down, recall up', 'Nothing: the model did not change'], answer: 0,
        why: 'Fewer emails clear 0.80, so the flags you make are surer (precision up), but borderline spam now slips through (recall down).' } },
    { t: 'quiz', kind: 'multi', q: 'Which of these call for a LOW threshold, favouring recall over precision?',
      options: ['A cancer screen followed by a doctor\'s check', 'A fraud alert that a human reviews', 'Auto-deleting emails with no undo', 'Auto-banning user accounts'], answer: [0, 1],
      why: 'When a human checks every flag, false alarms are cheap and misses are expensive. Flag generously: low threshold, high recall.',
      whyNot: { 2: 'A deleted real email is gone for good. False positives are very costly, so you want high precision: a high threshold.', 3: 'Banning an innocent user is a costly false positive. Use a high threshold, or send flags to a human.' },
      hints: ['For each one, ask: which mistake hurts more, a miss or a false alarm?', 'If a human double-checks every flag, false alarms cost only a little time.'] },
    { t: 'play', kind: 'controls', h: 'Slide the threshold over 20 emails',
      body: 'Pink = spam, blue = real. ✕ = a mistake. A lost real email costs $5; a spam in the inbox costs $1.',
      size: [800, 340],
      init: () => ({}),
      controls: [{ id: 't', type: 'range', label: 'Threshold', min: 0.05, max: 0.95, step: 0.05, value: 0.5 }],
      presets: [{ label: 'Default 0.5', v: { t: 0.5 } }, { label: 'Strict 0.9', v: { t: 0.9 } }],
      view: s => {
        const r = M2_thr(s.v.t), nodes = {
          gs: { x: 400, y: 70, w: 780, h: 80, shape: 'group', label: 'Spam folder (score ≥ ' + r.t.toFixed(2) + ')' },
          gi: { x: 400, y: 180, w: 780, h: 80, shape: 'group', label: 'Inbox' } };
        M2_MAIL.forEach((m, i) => {
          const flag = m.p >= r.t;
          nodes['m' + i] = { x: 40 + i * 38, y: flag ? 82 : 192, w: 34, h: 36, label: String(m.p).slice(1), kind: m.spam ? 'e' : 'a', state: flag !== m.spam ? 'bad' : undefined };
        });
        const cell = (x, lab, n, sub, bad) => ({ x, y: 290, w: 160, h: 56, label: lab + ' ' + n, sub, kind: bad ? 'd' : 'n', state: bad && n ? 'bad' : undefined });
        Object.assign(nodes, { tp: cell(100, 'TP', r.tp, 'spam caught'), fp: cell(300, 'FP', r.fp, 'real email lost', 1), fn: cell(500, 'FN', r.fn, 'spam in inbox', 1), tn: cell(700, 'TN', r.tn, 'real email kept') });
        return { nodes, vars: { precision: M2_pct(r.P), recall: M2_pct(r.R), F1: r.F.toFixed(3), cost: '$' + r.cost } };
      },
      readout: s => { const r = M2_thr(s.v.t); return [['Precision', r.tp + ' / ' + (r.tp + r.fp) + ' = ' + M2_pct(r.P)], ['Recall', r.tp + ' / 8 = ' + M2_pct(r.R)], ['F1', r.F.toFixed(3)], ['Cost', '5 × ' + r.fp + ' + 1 × ' + r.fn + ' = $' + r.cost]]; },
      goals: [
        { text: 'Catch **every** spam (recall 100%). How many real emails do you lose?', check: s => M2_thr(s.v.t).R === 1, solve: [{ t: 0.4 }] },
        { text: 'Find the threshold with the **highest F1**', check: s => M2_thr(s.v.t).t === 0.6, solve: [{ t: 0.6 }] },
        { text: 'Find the **cheapest** threshold: $5 per lost real email, $1 per spam in the inbox', check: s => M2_thr(s.v.t).cost === 3, solve: [{ t: 0.8 }] }
      ],
      hints: ['Lower the threshold until the 0.41 spam joins the spam folder.', 'Watch the F1 chip as you move between 0.5 and 0.8. It peaks once.', 'Lost real emails cost 5 times more, so get FP to 0 while missing as little spam as possible.'],
      done: 'Best F1 was 0.60 (F1 0.824), but the cheapest was 0.80 ($3). F1 treats both mistakes as equal; your business rarely does.' },
    { t: 'viz', h: 'The PR curve: every threshold at once',
      body: 'Each dot is one threshold, placed by its recall (→) and precision (↑).',
      nodes: { xa: { x: 420, y: 355, label: 'recall → (100% at right)', shape: 'text' }, ya: { x: 210, y: 30, label: 'precision ↑ (50% at bottom, 100% at top)', shape: 'text' } },
      steps: [
        { cap: 'Threshold 0.3: recall 100%, precision 57%. Every spam caught, but 6 real emails lost.', do: [['add', 'p3', { x: 680, y: 267, shape: 'circle', w: 40, label: '0.3', kind: 'b' }]] },
        { cap: 'Threshold 0.5: recall 87.5%, precision 70%.', do: [['add', 'p5', { x: 610, y: 208, shape: 'circle', w: 40, label: '0.5', kind: 'b' }], ['link', 'p3', 'p5', { arrow: false }]] },
        { cap: 'Threshold 0.7: recall 75%, precision 85.7%.', do: [['add', 'p7', { x: 540, y: 136, shape: 'circle', w: 40, label: '0.7', kind: 'b' }], ['link', 'p5', 'p7', { arrow: false }]] },
        { cap: 'Threshold 0.8: recall 62.5%, precision 100%. No real email lost.', do: [['add', 'p8', { x: 470, y: 70, shape: 'circle', w: 40, label: '0.8', kind: 'b' }], ['link', 'p7', 'p8', { arrow: false }]] },
        { cap: 'Threshold 0.9: recall drops to 25%, precision stays 100%. Past 0.8 you only lose spam catches.', do: [['add', 'p9', { x: 260, y: 70, shape: 'circle', w: 40, label: '0.9', kind: 'b', state: 'warn' }], ['link', 'p8', 'p9', { arrow: false }]] },
        { cap: 'That line is the [[PR curve]]. Price each mistake ($5 per lost email, $1 per spam): 0.8 costs $3, 0.5 costs $16.', do: [['set', 'p8', { state: 'ok' }], ['note', 'p8', 'cheapest: $3'], ['focus', 'p8', 'p5']] }
      ] },
    { t: 'quiz', kind: 'fill', q: 'At threshold 0.5 you lose 3 real emails (FP) and let 1 spam into the inbox (FN). A lost real email costs $5, a spam costs $1. Total cost in dollars?', pre: '$', placeholder: 'number', answer: ['16', '$16'],
      why: 'Cost = 5 × FP + 1 × FN = 5 × 3 + 1 × 1 = 15 + 1 = $16. At 0.8 it is 5 × 0 + 1 × 3 = $3.' },
    { t: 'recap', points: ['A classifier outputs a score; the [[threshold]] turns it into a decision.', 'Raising the threshold: precision up, recall down. Lowering it: the reverse.', 'The [[PR curve]] shows every trade-off at once.', 'Choose the threshold on the validation set by business cost, not by habit (0.5) or by F1 alone.'],
      cheat: [['pred = scores >= t', 'Apply a threshold'], ['precision_recall_curve(y_true, scores)', 'Precision and recall at every threshold (scikit-learn)'], ['cost = c_fp·FP + c_fn·FN', 'Pick the t with the lowest cost']] }
  ]
};

/* ---------- Lesson 5: ranking metrics ---------- */
const M2_RANKED = ['billing', 'reset-pw', 'login-faq', 'account', 'pricing', 'refunds', 'sso-reset'];
const M2_REL = ['reset-pw', 'account', 'sso-reset'];

const M2_ranking = {
  id: 'ml-ranking', title: 'Ranking metrics: Recall@K, MRR, nDCG', mins: 9, needs: 'ml-threshold',
  goal: 'score a retriever\'s ranked list with Recall@K, MRR and nDCG, by hand and in code.',
  cards: [
    { t: 'read', h: 'Is the LLM wrong, or did retrieval miss?',
      body: 'Your RAG bot answers "How do I reset my password?" badly. Maybe the LLM is weak. Maybe the right chunk never reached the prompt. You cannot tell by reading answers.\n\nSo you build a [[golden set]]: 50 real queries, each with the chunk ids a human marked as relevant. Then you score the retriever\'s ranked list, before any LLM runs. Precision and recall still apply, but now **position** matters too.',
      points: ['[[Recall@K]]: did the relevant chunks make the top K?', '[[MRR]]: how high is the first relevant one?', '[[nDCG]]: are relevant ones near the top, with a discount for each step down?'] },
    { t: 'viz', h: 'Score one ranked list three ways',
      body: 'Query: "reset my password". 3 chunks are relevant: `reset-pw`, `account` and `sso-reset`.',
      nodes: {
        q: { x: 400, y: 45, label: 'query: reset my password', w: 240, shape: 'pill', kind: 'b' },
        d1: { x: 90, y: 150, label: 'billing.md', sub: 'rank 1', kind: 'n' }, d2: { x: 240, y: 150, label: 'reset-pw.md', sub: 'rank 2', kind: 'n' },
        d3: { x: 390, y: 150, label: 'login-faq.md', sub: 'rank 3', kind: 'n' }, d4: { x: 540, y: 150, label: 'account.md', sub: 'rank 4', kind: 'n' },
        d5: { x: 690, y: 150, label: 'pricing.md', sub: 'rank 5', kind: 'n' }
      },
      steps: [
        { cap: 'The retriever returns its top 5. Two are relevant: rank 2 and rank 4. The third, `sso-reset`, is down at rank 7.', do: [['set', 'd2', { kind: 'c', state: 'ok' }], ['set', 'd4', { kind: 'c', state: 'ok' }], ['var', 'rank 7', 'sso-reset.md ✓']] },
        { cap: '[[Recall@K|Recall@5]] = relevant found in top 5 ÷ all relevant = 2 / 3 = 0.67.', do: [['var', 'Recall@5', '2/3 = 0.67'], ['focus', 'd1', 'd2', 'd3', 'd4', 'd5']] },
        { cap: 'Reciprocal rank = 1 / (rank of the first relevant hit) = 1 / 2 = 0.5. [[MRR]] is its average over all queries.', do: [['var', 'RR', '1/2 = 0.5'], ['focus', 'd2']] },
        { cap: 'nDCG step 1, DCG: each hit is worth 1 / log2(rank + 1). Rank 2 → 0.63, rank 4 → 0.43. DCG = 1.06.', do: [['add', 'g2', { x: 240, y: 250, label: '+0.63', w: 100, shape: 'pill', kind: 'c' }], ['add', 'g4', { x: 540, y: 250, label: '+0.43', w: 100, shape: 'pill', kind: 'c' }], ['var', 'DCG', '1.06']] },
        { cap: 'Ideal: all 3 hits at ranks 1-3 → 1 + 0.63 + 0.5 = 2.13. [[nDCG]]@5 = 1.06 / 2.13 = 0.50.', do: [['var', 'ideal DCG', '2.13'], ['var', 'nDCG@5', '0.50']] },
        { cap: 'A reranker swaps ranks 1 and 2. `reset-pw.md` is now first.', do: [['set', 'd2', { x: 90, sub: 'rank 1', state: 'active' }], ['set', 'd1', { x: 240, sub: 'rank 2' }], ['set', 'g2', { x: 90, label: '+1.00' }]] },
        { cap: 'Recall@5 stays 0.67: same docs in the top 5. RR doubles to 1.0. nDCG@5 rises to 1.43 / 2.13 = 0.67.', do: [['var', 'Recall@5', '0.67 (same)'], ['var', 'RR', '1.0'], ['var', 'DCG', '1.43'], ['var', 'nDCG@5', '0.67']] }
      ],
      predict: { at: 6, q: 'After the swap, what happens to Recall@5?', options: ['It stays 0.67', 'It rises to 1.0', 'It drops'], answer: 0,
        why: 'Recall@K only asks which docs are in the top K, not in what order. The same 2 of 3 relevant docs are still there. MRR and nDCG do reward the better order.' } },
    { t: 'quiz', q: 'Your RAG app pastes the top 5 chunks into the prompt. Their order inside the prompt barely matters. Which metric best matches what you care about?',
      options: ['Recall@5', 'MRR', 'Accuracy', 'nDCG@100'], answer: 0,
      why: 'The LLM sees all 5 chunks, so what matters is whether the relevant ones made the cut: [[Recall@K|Recall@5]].',
      whyNot: { 1: 'MRR only looks at the first relevant hit and rewards rank 1. Here rank 1 and rank 5 are treated the same.', 2: 'Accuracy is for yes/no classifiers, not ranked lists.', 3: 'Only the top 5 reach the prompt. Scoring 100 positions measures results the LLM never sees.' },
      hints: ['How many chunks does the LLM actually read?', 'Does it matter if the right chunk is 1st or 4th of those 5?'] },
    { t: 'play', kind: 'code', h: 'Write the three ranking metrics',
      body: 'Fill in the functions. The boxes run them on the list from the visual (relevant: `reset-pw`, `account`, `sso-reset`).',
      size: [800, 270],
      starter: 'const ranked = ["billing", "reset-pw", "login-faq", "account", "pricing", "refunds", "sso-reset"];\nconst relevant = ["reset-pw", "account", "sso-reset"];\n\nfunction recallAtK(ranked, relevant, k) {\n  // share of relevant docs that appear in the top k\n  return 0;\n}\n\nfunction reciprocalRank(ranked, relevant) {\n  // 1 / (rank of the first relevant doc); 0 if none. Ranks start at 1.\n  return 0;\n}\n\nfunction ndcgAtK(ranked, relevant, k) {\n  // DCG: sum of 1 / Math.log2(rank + 1) for each relevant doc in the top k\n  // ideal DCG: the same sum if every relevant doc sat at the top\n  return 0;\n}\n\nconsole.log(recallAtK(ranked, relevant, 5));',
      expose: ['recallAtK', 'reciprocalRank', 'ndcgAtK'],
      view: s => {
        const api = s.api || {}, nodes = {};
        M2_RANKED.slice(0, 5).forEach((d, i) => { nodes['d' + i] = { x: 90 + i * 155, y: 55, w: 120, h: 50, label: d, sub: 'rank ' + (i + 1), kind: M2_REL.includes(d) ? 'c' : 'n' }; });
        const box = (x, name, v, want) => ({ x, y: 185, w: 220, h: 60, label: name + ' = ' + (isNaN(v) ? '?' : v.toFixed(3)), sub: 'want ' + want.toFixed(3), kind: 'b', state: M2_near(v, want) ? 'ok' : 'off' });
        nodes.r = box(140, 'Recall@5', M2_num(api.recallAtK, M2_RANKED, M2_REL, 5), 2 / 3);
        nodes.m = box(400, 'RR', M2_num(api.reciprocalRank, M2_RANKED, M2_REL), 0.5);
        nodes.n = box(660, 'nDCG@5', M2_num(api.ndcgAtK, M2_RANKED, M2_REL, 5), 0.4982);
        return { nodes };
      },
      goals: [
        { text: '`recallAtK(ranked, relevant, 5)` returns **0.667** (and 0.333 for k = 3)', check: s => !!s.api && M2_near(M2_num(s.api.recallAtK, M2_RANKED, M2_REL, 5), 2 / 3) && M2_near(M2_num(s.api.recallAtK, M2_RANKED, M2_REL, 3), 1 / 3),
          solve: ['function recallAtK(ranked, relevant, k) {\n  const hits = ranked.slice(0, k).filter(d => relevant.includes(d)).length;\n  return hits / relevant.length;\n}\n\nfunction reciprocalRank(ranked, relevant) {\n  return 0;\n}\n\nfunction ndcgAtK(ranked, relevant, k) {\n  return 0;\n}'] },
        { text: '`reciprocalRank` returns **0.5** here, and 0 when nothing is relevant', check: s => !!s.api && M2_near(M2_num(s.api.reciprocalRank, M2_RANKED, M2_REL), 0.5) && M2_num(s.api.reciprocalRank, ['a', 'b'], ['z']) === 0 && M2_near(M2_num(s.api.reciprocalRank, ['a', 'b', 'c'], ['c']), 1 / 3),
          solve: ['function recallAtK(ranked, relevant, k) {\n  const hits = ranked.slice(0, k).filter(d => relevant.includes(d)).length;\n  return hits / relevant.length;\n}\n\nfunction reciprocalRank(ranked, relevant) {\n  const i = ranked.findIndex(d => relevant.includes(d));\n  return i === -1 ? 0 : 1 / (i + 1);\n}\n\nfunction ndcgAtK(ranked, relevant, k) {\n  return 0;\n}'] },
        { text: '`ndcgAtK(ranked, relevant, 5)` returns **0.498**, and 1 for a perfect list', check: s => !!s.api && M2_near(M2_num(s.api.ndcgAtK, M2_RANKED, M2_REL, 5), 0.49818) && M2_near(M2_num(s.api.ndcgAtK, ['reset-pw', 'account', 'sso-reset', 'billing'], M2_REL, 5), 1),
          solve: ['function recallAtK(ranked, relevant, k) {\n  const hits = ranked.slice(0, k).filter(d => relevant.includes(d)).length;\n  return hits / relevant.length;\n}\n\nfunction reciprocalRank(ranked, relevant) {\n  const i = ranked.findIndex(d => relevant.includes(d));\n  return i === -1 ? 0 : 1 / (i + 1);\n}\n\nfunction ndcgAtK(ranked, relevant, k) {\n  let dcg = 0, ideal = 0;\n  ranked.slice(0, k).forEach((d, i) => { if (relevant.includes(d)) dcg += 1 / Math.log2(i + 2); });\n  for (let i = 0; i < Math.min(k, relevant.length); i++) ideal += 1 / Math.log2(i + 2);\n  return dcg / ideal;\n}'] }
      ],
      hints: ['`ranked.slice(0, k)` is the top k. Count how many are in `relevant`, then divide by `relevant.length`.', '`findIndex` gives a 0-based index. Rank = index + 1. It returns -1 when nothing matches.', 'Index `i` is rank `i + 1`, so the discount is `1 / Math.log2(i + 2)`. The ideal list has min(k, relevant.length) hits at the top.'],
      done: 'MRR is just `reciprocalRank` averaged over your golden set. Three queries with RR 0.5, 1 and 0.25 give MRR = 1.75 / 3 = 0.583.' },
    { t: 'quiz', kind: 'fill', q: 'For one query, the first relevant chunk is at rank 4. What is its reciprocal rank, as a decimal?', pre: 'RR =', placeholder: '0.?', answer: ['0.25', '.25', '1/4'],
      why: 'Reciprocal rank = 1 / rank = 1 / 4 = 0.25. Rank 1 would score 1.0, rank 2 scores 0.5.' },
    { t: 'recap', points: ['Build a [[golden set]] of queries with human-marked relevant chunks first.', '[[Recall@K]] = relevant in top K ÷ all relevant. Order inside the top K does not matter.', '[[MRR]] = average of 1 / (rank of the first hit). It rewards rank 1.', '[[nDCG]] = DCG ÷ ideal DCG, where each hit is worth \\( 1/\\log_2(\\text{rank}+1) \\).'],
      cheat: [['Recall@K = hits in top K / total relevant', 'Did the right chunks make the cut?'], ['RR = 1 / rank of first hit; MRR = mean RR', 'How high is the first right answer?'], ['DCG = Σ rel / log2(rank + 1); nDCG = DCG / IDCG', 'Position-weighted score from 0 to 1']] }
  ]
};

;
// ML Foundations · Module 3: Transformer mechanics. Every number below is checked by hand and by node.
const M3_GLOSS = {
  'RoPE': 'Rotary position embedding: instead of adding a position vector, it rotates each query and key by an angle that grows with position. Used by Llama and Qwen.',
  'prefill': 'The first phase of generation: the whole prompt runs through the model in parallel, filling the KV cache. It sets the time to first token.',
  'grouped-query attention': 'GQA: many query heads share a few key/value heads (Llama 3 8B: 32 query heads, 8 KV heads), so the KV cache shrinks 4×.'
};

// ---- shared helpers (real math, deterministic) ----
const M3_dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const M3_softmax = xs => { const m = Math.max(...xs), e = xs.map(x => Math.exp(x - m)), t = e.reduce((a, b) => a + b, 0); return e.map(x => x / t); };
const M3_attn = (Q, K, V) => { const d = Q[0].length; return Q.map(q => { const w = M3_softmax(K.map(k => M3_dot(q, k) / Math.sqrt(d))); return V[0].map((_, j) => w.reduce((s, wi, i) => s + wi * V[i][j], 0)); }); };
const M3_close = (a, b, tol) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => Array.isArray(x) ? M3_close(x, b[i], tol) : typeof x === 'number' && Math.abs(x - b[i]) <= tol);
const M3_fmt = v => '[' + v.map(x => (x < 0 ? '−' : '') + Math.abs(x).toFixed(2)).join(', ') + ']';

// ---------------------------------------------------------------- Lesson 1
const M3_EMB = { man: [1.0, 0.2], dog: [0.8, 0.4], bites: [0.1, 0.9] };
const M3_POS2 = [[0, 1], [0.84, 0.54], [0.91, -0.42]]; // [sin p, cos p] rounded to 2 decimals
const M3_inputs = s => { const words = s.v.order.split(' '); return words.map((w, i) => ({ w, i, vec: M3_EMB[w].map((x, j) => +(x + (s.v.pos ? M3_POS2[i][j] : 0)).toFixed(2)) })); };
const M3_pe4 = p => [Math.sin(p), Math.cos(p), Math.sin(p / 100), Math.cos(p / 100)];

const M3_embed_pos = {
  id: 'ml-embed-pos', title: 'Embeddings and positions', mins: 8,
  goal: 'turn token ids into vectors and explain why a Transformer needs position information.',
  cards: [
    { t: 'read', h: 'Dog bites man. Man bites dog.',
      body: 'Same three words, very different news. A [[token|tokenizer]] turns each one into an id, and the model looks each id up in a table of vectors.\n\nHere is the catch: [[self-attention]] compares every token with every other token. It has no built-in idea of "first" or "last". Swap the words and it sees the same set of vectors.\n\nSo something must stamp each vector with its slot number. That stamp is the [[positional encoding]].',
      analogy: 'A bag of fridge-magnet words. Without slot numbers on the magnets, you cannot tell which sentence was on the fridge.' },
    { t: 'viz', h: 'From ids to vectors, then add positions',
      body: 'Tiny 2-number [[embedding|embeddings]], so you can add them in your head.',
      nodes: {
        tbl: { x: 100, y: 190, w: 150, label: 'Embedding table', sub: '3 rows × 2 numbers', kind: 'b' },
        a0: { x: 330, y: 65, label: 'dog', sub: 'id 1', kind: 'a' }, a1: { x: 500, y: 65, label: 'bites', sub: 'id 2', kind: 'a' }, a2: { x: 670, y: 65, label: 'man', sub: 'id 0', kind: 'a' }
      },
      steps: [
        { cap: 'The tokenizer turns "dog bites man" into ids: dog = 1, bites = 2, man = 0.', do: [['focus', 'a0', 'a1', 'a2']] },
        { cap: 'Each id picks one row of the embedding table. Row 1 is dog\'s vector: [0.80, 0.40].', do: [['send', 'tbl', 'a0', 'row 1'], ['send', 'tbl', 'a1', 'row 2'], ['send', 'tbl', 'a2', 'row 0'], ['set', 'a0', { sub: '[0.80, 0.40]' }], ['set', 'a1', { sub: '[0.10, 0.90]' }], ['set', 'a2', { sub: '[1.00, 0.20]' }]] },
        { cap: 'Now "man bites dog". Same three ids, so the same three vectors, only in a different order.', do: [['add', 'b0', { x: 330, y: 315, label: 'man', sub: '[1.00, 0.20]', kind: 'c' }], ['add', 'b1', { x: 500, y: 315, label: 'bites', sub: '[0.10, 0.90]', kind: 'c' }], ['add', 'b2', { x: 670, y: 315, label: 'dog', sub: '[0.80, 0.40]', kind: 'c' }]] },
        { cap: 'Attention sees a set, not a line. Dog gets the exact same result in both sentences. The meaning flip is invisible.', do: [['set', 'a0', { state: 'warn' }], ['set', 'b2', { state: 'warn' }], ['note', 'b2', 'Same vector as top-left dog'], ['focus', 'a0', 'b2']] },
        { cap: 'Fix: give each slot a position vector. Here p = [sin(pos), cos(pos)]: p0 = [0, 1], p1 = [0.84, 0.54].', do: [['add', 'p0', { x: 330, y: 190, label: 'pos 0', sub: '[0.00, 1.00]', shape: 'pill', kind: 'd' }], ['add', 'p1', { x: 500, y: 190, label: 'pos 1', sub: '[0.84, 0.54]', shape: 'pill', kind: 'd' }], ['add', 'p2', { x: 670, y: 190, label: 'pos 2', sub: '[0.91, −0.42]', shape: 'pill', kind: 'd' }]] },
        { cap: 'Add it to each token. Dog at slot 0: [0.80, 0.40] + [0, 1] = [0.80, 1.40].', do: [['send', 'p0', 'a0', '+'], ['set', 'a0', { sub: '[0.80, 1.40]', state: null }], ['set', 'a1', { sub: '[0.94, 1.44]' }], ['set', 'a2', { sub: '[1.91, −0.22]' }]] },
        { cap: 'In "man bites dog", dog sits at slot 2: [0.80, 0.40] + [0.91, −0.42] = [1.71, −0.02]. Now the order is visible.', do: [['send', 'p2', 'b2', '+'], ['set', 'b0', { sub: '[1.00, 1.20]' }], ['set', 'b1', { sub: '[0.94, 1.44]' }], ['set', 'b2', { sub: '[1.71, −0.02]', state: 'ok' }]] },
        { cap: 'Real models use 768+ numbers per vector. BERT learns its position table. Llama uses [[RoPE]], which rotates q and k instead.', do: [['focus', 'tbl', 'p0', 'p1', 'p2']] }
      ],
      predict: { at: 3, q: 'Attention compares every token with every other. Can it tell these two sentences apart?', options: ['No: it gets the same set of vectors', 'Yes: dog comes first in one of them', 'Only for long sentences'], answer: 0, why: 'Without positions, each token sees the same neighbours with the same vectors. The order of the list never enters the math.' } },
    { t: 'quiz', q: 'Why does a Transformer need [[positional encoding]]?',
      options: ['Attention treats tokens as a set, so word order is otherwise invisible', 'Embeddings are too short to hold meaning', 'It makes the vocabulary bigger', 'The tokenizer forgets the word order'], answer: 0,
      why: 'Attention mixes tokens by comparing pairs. Nothing in that math says which slot a token sits in, so you add it to the vector.',
      whyNot: { 1: 'Length is not the problem. Even a 4,096-number vector has no slot number unless you add one.', 2: 'The vocabulary stays the same. Positions are added to vectors, not new tokens.', 3: 'The tokenizer keeps the ids in order. It is the attention math that ignores that order.' } },
    { t: 'play', kind: 'controls', h: 'What the model actually sees',
      body: 'Flip the sentence with positions off, then on. Then slide the probe through a 4-number sinusoid.',
      size: [800, 360],
      init: () => ({ last: 'dog bites man', flipOff: false }),
      controls: [
        { id: 'order', type: 'select', label: 'Sentence', options: ['dog bites man', 'man bites dog'], value: 'dog bites man' },
        { id: 'pos', type: 'toggle', label: 'Add positions' },
        { id: 'probe', type: 'range', label: 'Probe position p', min: 0, max: 60, value: 1 }
      ],
      update: s => { if (s.v.order !== s.last && !s.v.pos) s.flipOff = true; s.last = s.v.order; },
      view: s => {
        const nodes = {}, p = s.v.probe, a = M3_pe4(0), b = M3_pe4(p);
        const near = p > 0 && Math.abs(b[0] - a[0]) < 0.05 && Math.abs(b[1] - a[1]) < 0.05;
        M3_inputs(s).forEach(t => { nodes['t' + t.i] = { x: 200 + 200 * t.i, y: 70, w: 150, label: t.w + ' @ slot ' + t.i, sub: M3_fmt(t.vec), kind: t.w === 'dog' ? 'e' : 'a', state: t.w === 'dog' ? 'active' : undefined }; });
        nodes.f0 = { x: 280, y: 200, w: 160, label: 'fast @ 0', sub: M3_fmt(a.slice(0, 2)), kind: 'd' };
        nodes.fp = { x: 540, y: 200, w: 160, label: 'fast @ ' + p, sub: M3_fmt(b.slice(0, 2)), kind: 'd', state: near ? 'warn' : undefined };
        nodes.s0 = { x: 280, y: 300, w: 160, label: 'slow @ 0', sub: M3_fmt(a.slice(2)), kind: 'c' };
        nodes.sp = { x: 540, y: 300, w: 160, label: 'slow @ ' + p, sub: M3_fmt(b.slice(2)), kind: 'c', state: near ? 'ok' : undefined };
        return { nodes, edges: [['f0', 'fp', { dash: true, arrow: false }], ['s0', 'sp', { dash: true, arrow: false }]], vars: { positions: s.v.pos ? 'on' : 'off' } };
      },
      readout: s => {
        const dog = o => M3_inputs({ v: { order: o, pos: s.v.pos } }).find(t => t.w === 'dog').vec;
        const x = dog('dog bites man'), y = dog('man bites dog');
        return [['dog in "dog bites man"', M3_fmt(x)], ['dog in "man bites dog"', M3_fmt(y)], ['Model can tell them apart?', M3_close(x, y, 1e-9) ? 'no' : 'yes']];
      },
      goals: [
        { text: 'With positions **off**, flip the sentence: dog keeps the same vector', check: s => s.flipOff, solve: [{ order: 'man bites dog' }] },
        { text: 'Turn positions **on**: now dog differs between the two sentences', check: s => s.v.pos === true, solve: [{ pos: true }] },
        { text: 'Find a probe position after 0 where the fast pair almost repeats position 0 (within 0.05)', check: s => s.v.probe === 44, solve: [{ probe: 44 }] }
      ],
      hints: ['The fast pair is [sin p, cos p]. It goes round a circle once every 2π ≈ 6.28 positions.', 'You need a whole number close to a multiple of 6.28. Try 6, 13, 19… and watch the error.', '7 × 6.28 ≈ 43.98, so try p = 44. The slow pair still says "far apart".'],
      done: 'That is why the original Transformer mixes fast and slow waves: the fast ones tell neighbours apart, the slow ones tell far positions apart.' },
    { t: 'read', h: 'Three ways to stamp a position',
      body: 'Every modern model does it, but in different ways. The goal is the same: two tokens should "know" how far apart they are.',
      points: ['**Sinusoidal** (original 2017 Transformer): fixed sin and cos waves at many speeds, added to the embedding. Nothing to learn.', '**Learned** (BERT, GPT-2): a second lookup table, one row per slot. BERT has 512 rows, so it cannot read past 512 tokens.', '**[[RoPE]]** (Llama, Qwen): rotate each query and key by an angle that grows with position. Their dot product then depends on the distance between the two tokens.'] },
    { t: 'quiz', kind: 'fill', q: '`distilbert-base-uncased` has a vocabulary of 30,522 tokens and 768 numbers per embedding. How many numbers are in its embedding table?',
      answer: ['23440896', /^23[,.\s]?440[,.\s]?896$/, /^(about\s*)?23\.4\s*(m|million)$/i], placeholder: 'a number',
      hints: ['One row per token, one column per number.', 'Multiply rows by columns.', '30,522 × 768.'],
      why: '30,522 × 768 = 23,440,896 numbers. That is about 35% of DistilBERT\'s 66 million parameters, just for the lookup table.' },
    { t: 'recap', points: ['A token id picks one row of the [[embedding]] table. That row is the token\'s vector.', 'Self-attention treats tokens as a set, so "dog bites man" and "man bites dog" look the same without positions.', 'A [[positional encoding]] is added to each vector so the slot number becomes part of the data.', 'Sinusoidal waves, a learned table (BERT) and [[RoPE]] (Llama) are three ways to do it.'],
      cheat: [['x = E[token_id] + P[position]', 'Input vector of one token'], ['PE(p, 2i) = sin(p / 10000^(2i/d))', 'Original sinusoid; cos for odd dims'], ['vocab × d', 'Embedding table size'], ['model.get_input_embeddings()', 'The table in Hugging Face transformers']] }
  ]
};

// ---------------------------------------------------------------- Lesson 2
const M3_Q = [[1, 0], [1, 1], [0, 1]], M3_K = [[2, 1], [1, 0], [1, -1]], M3_V = [[1, 0], [0, 1], [1, 1]];
const M3_Q4 = [[1, 0, 2], [0, 1, 1], [2, 1, 0], [1, 1, 1]], M3_K4 = [[1, 2, 0], [0, 1, 1], [1, 0, 1], [2, 0, 0]], M3_V4 = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 1]];
const M3_ATT_SOL = 'function dot(a, b) { return a.reduce((s, x, i) => s + x * b[i], 0); }\nfunction softmax(xs) {\n  const m = Math.max(...xs);\n  const e = xs.map(x => Math.exp(x - m));\n  const sum = e.reduce((a, b) => a + b, 0);\n  return e.map(x => x / sum);\n}\n\nfunction attention(Q, K, V) {\n  const d = Q[0].length;\n  return Q.map(q => {\n    const w = softmax(K.map(k => dot(q, k) / Math.sqrt(d)));\n    return V[0].map((_, j) => w.reduce((s, wi, i) => s + wi * V[i][j], 0));\n  });\n}\n\nconsole.log(attention([[1, 0], [1, 1], [0, 1]], [[2, 1], [1, 0], [1, -1]], [[1, 0], [0, 1], [1, 1]]));';
const M3_tryAtt = (s, Q, K, V) => { try { return s.api && s.api.attention ? s.api.attention(Q, K, V) : null; } catch (e) { return null; } };

const M3_attention = {
  id: 'ml-attention', title: 'Self-attention, by hand', mins: 9, needs: 'ml-embed-pos',
  goal: 'compute softmax(QKᵀ/√d)·V for 3 tokens by hand and explain multi-head attention.',
  cards: [
    { t: 'read', h: 'Who is "it"?',
      body: '"The dog chased the cat because it was hungry." You know "it" is the dog. To guess the next word well, the model must pull the dog\'s meaning into the vector for "it".\n\n[[self-attention|Self-attention]] does that pull. Each token asks a question, every token offers a label, and each token mixes in the content of the best matches.\n\nThat is three vectors per token: a [[query, key, value|query, a key and a value]]. Each one is the token\'s vector times a learned matrix.',
      analogy: 'A search box inside the model. The query is what you type, keys are page titles, values are page contents. You get a blend of contents, weighted by how well each title matched.' },
    { t: 'viz', h: 'One query, three keys, real numbers',
      body: 'Token "bites" asks with q = [1, 1]. Each row shows k (key) and v (value). Here d = 2.',
      nodes: {
        td: { x: 100, y: 65, w: 150, label: 'dog', sub: 'k [2, 1] · v [1, 0]', kind: 'a' },
        tb: { x: 100, y: 190, w: 150, label: 'bites', sub: 'k [1, 0] · v [0, 1]', kind: 'a' },
        tm: { x: 100, y: 315, w: 150, label: 'man', sub: 'k [1, −1] · v [1, 1]', kind: 'a' }
      },
      vars: { 'q (bites)': '[1, 1]', d: 2 },
      steps: [
        { cap: 'Every token has a query, a key and a value. "bites" asks with q = [1, 1]. Keys and values sit on the left.', do: [['focus', 'tb']] },
        { cap: 'Score = q · k. For dog: 1×2 + 1×1 = 3. A big [[dot product]] means "this key matches my question".', do: [['add', 'sd', { x: 330, y: 65, w: 140, label: 'dog: 3', sub: 'q · k', kind: 'b' }], ['link', 'td', 'sd']] },
        { cap: 'bites: 1×1 + 1×0 = 1. man: 1×1 + 1×(−1) = 0. Dog matches best.', do: [['add', 'sb', { x: 330, y: 190, w: 140, label: 'bites: 1', sub: 'q · k', kind: 'b' }], ['add', 'sm', { x: 330, y: 315, w: 140, label: 'man: 0', sub: 'q · k', kind: 'b' }], ['link', 'tb', 'sb'], ['link', 'tm', 'sm']] },
        { cap: 'Divide by √d = √2 ≈ 1.41. Scores become 2.12, 0.71 and 0. This keeps scores tame when d is large.', do: [['set', 'sd', { sub: '÷ 1.41 = 2.12' }], ['set', 'sb', { sub: '÷ 1.41 = 0.71' }], ['set', 'sm', { sub: '÷ 1.41 = 0.00' }]] },
        { cap: '[[softmax|Softmax]]: e^2.12 = 8.33, e^0.71 = 2.03, e^0 = 1. Sum 11.36. Weights: 0.73, 0.18, 0.09.', do: [['add', 'wd', { x: 530, y: 65, label: '0.73', sub: '8.33 ÷ 11.36', kind: 'c' }], ['add', 'wb', { x: 530, y: 190, label: '0.18', sub: '2.03 ÷ 11.36', kind: 'c' }], ['add', 'wm', { x: 530, y: 315, label: '0.09', sub: '1 ÷ 11.36', kind: 'c' }], ['link', 'sd', 'wd'], ['link', 'sb', 'wb']] },
        { cap: 'Mix the values: 0.73·[1, 0] + 0.18·[0, 1] + 0.09·[1, 1] = [0.82, 0.27]. The new "bites" is mostly dog.', do: [['link', 'sm', 'wm'], ['add', 'out', { x: 700, y: 190, w: 130, label: 'new bites', sub: '[0.82, 0.27]', kind: 'e', state: 'ok' }], ['link', 'wd', 'out', '× v'], ['link', 'wb', 'out'], ['link', 'wm', 'out']] },
        { cap: 'That was one row. All tokens do it at once as matrix math: softmax(QKᵀ / √d) · V.', do: [['var', 'formula', 'softmax(QKᵀ/√d)·V'], ['focus', 'out']] },
        { cap: '[[multi-head attention|Multi-head]]: run this many times in parallel with different weights. BERT-base runs 12 heads of 64 numbers each.', do: [['var', 'heads', '12 × 64 = 768']] }
      ],
      predict: { at: 4, q: 'Softmax turns the scores 2.12, 0.71 and 0 into weights. How much goes to dog?', options: ['About 0.73', 'Exactly 0.33', 'About 0.45', 'All of it: 1.00'], answer: 0, why: 'Softmax exaggerates gaps: e^2.12 ≈ 8.33 dwarfs 2.03 and 1. But it never gives all the weight to one token.' } },
    { t: 'quiz', kind: 'order', q: 'Put one attention step for a single token in order.',
      items: ['Make q, k and v by multiplying each token vector by learned matrices', 'Score every key: q · k', 'Divide each score by √d', 'Softmax the scores into weights that sum to 1', 'Add up the values, each times its weight'],
      why: 'Project, score, scale, softmax, mix. The output replaces the token\'s vector for the next layer.' },
    { t: 'play', kind: 'code', h: 'Write attention() in plain JS',
      body: 'Finish `attention(Q, K, V)`. `dot` and `softmax` are done for you. Each row of the output is one token.',
      size: [800, 220],
      starter: '// Q, K, V: one row per token. Row 1 is "bites".\nfunction dot(a, b) { return a.reduce((s, x, i) => s + x * b[i], 0); }\nfunction softmax(xs) {\n  const m = Math.max(...xs);\n  const e = xs.map(x => Math.exp(x - m));\n  const sum = e.reduce((a, b) => a + b, 0);\n  return e.map(x => x / sum);\n}\n\nfunction attention(Q, K, V) {\n  return Q.map(q => {\n    // 1. scores: q · k for every row of K, divided by √d\n    // 2. weights = softmax(scores)\n    // 3. return the sum of V rows, each times its weight\n    return V[0];\n  });\n}\n\nconsole.log(attention([[1, 0], [1, 1], [0, 1]], [[2, 1], [1, 0], [1, -1]], [[1, 0], [0, 1], [1, 1]]));',
      expose: ['attention'],
      view: s => {
        const got = M3_tryAtt(s, M3_Q, M3_K, M3_V), want = M3_attn(M3_Q, M3_K, M3_V), nodes = {}, edges = [];
        nodes.fn = { x: 110, y: 110, label: 'attention()', shape: 'pill', kind: 'b' };
        ['dog', 'bites', 'man'].forEach((w, i) => {
          const g = got && got[i], ok = M3_close(g, want[i], 0.01);
          nodes['o' + i] = { x: 320 + 170 * i, y: 110, w: 140, label: w, sub: Array.isArray(g) && g.every(x => typeof x === 'number') ? M3_fmt(g) : 'no output', kind: 'c', state: g ? (ok ? 'ok' : 'bad') : 'off' };
          edges.push(['fn', 'o' + i]);
        });
        return { nodes, edges };
      },
      goals: [
        { text: '"bites" (row 1) comes out as about **[0.82, 0.27]**', check: s => M3_close((M3_tryAtt(s, M3_Q, M3_K, M3_V) || [])[1], [0.82, 0.27], 0.01), solve: [M3_ATT_SOL] },
        { text: 'All three rows match: dog ≈ [0.75, 0.50], man ≈ [0.72, 0.42]', check: s => M3_close(M3_tryAtt(s, M3_Q, M3_K, M3_V), M3_attn(M3_Q, M3_K, M3_V), 0.01), solve: [M3_ATT_SOL] },
        { text: 'It still works for 4 tokens with d = 3 (no hard-coded √2)', check: s => M3_close(M3_tryAtt(s, M3_Q4, M3_K4, M3_V4), M3_attn(M3_Q4, M3_K4, M3_V4), 0.001), solve: [M3_ATT_SOL] }
      ],
      hints: ['Inside the map: `const scores = K.map(k => dot(q, k) / Math.sqrt(d))`, with `d = Q[0].length`.', 'Then `const w = softmax(scores)`. For "bites" that is about [0.73, 0.18, 0.09].', 'Return `V[0].map((_, j) => w.reduce((s, wi, i) => s + wi * V[i][j], 0))`.'],
      done: 'That is the heart of every Transformer. PyTorch writes it as `F.scaled_dot_product_attention(q, k, v)`.' },
    { t: 'quiz', q: 'Why divide the scores by √d before the softmax?',
      options: ['With many dims, dot products get big and softmax turns almost one-hot; scaling keeps weights soft', 'So the weights add up to 1', 'To turn scores into probabilities', 'To save GPU memory'], answer: 0,
      why: 'A dot product adds up d terms, so it grows with d. Huge gaps push softmax to 0 or 1, and training stalls. Dividing by √d keeps the scores in a sane range.',
      whyNot: { 1: 'Softmax already makes the weights sum to 1, whatever the scale.', 2: 'Softmax does that job. The √d only changes how sharp the weights are.', 3: 'It is one division per score. It saves no memory.' } },
    { t: 'read', h: 'Many heads at once',
      body: 'One attention pass mixes tokens in one way. [[multi-head attention|Multi-head attention]] cuts each vector into slices and runs attention on every slice, each with its own weight matrices.\n\nBERT-base has 768 numbers per token and 12 heads, so each head works on 768 ÷ 12 = 64. Llama 2 7B: 4,096 ÷ 32 heads = 128. The head outputs are glued back together and mixed by one more matrix.',
      points: ['Heads run in parallel, so more heads cost little extra time.', 'Different heads often learn different patterns, such as "previous word" or "matching bracket".', 'Each head has its own keys and values. Remember that for the KV cache lesson.'] },
    { t: 'quiz', kind: 'fill', q: '`Qwen2.5-0.5B` has 896 numbers per token and 14 attention heads. How many numbers does each head work on?',
      answer: ['64'], placeholder: 'head dimension',
      hints: ['The heads split the vector evenly.', 'Divide the vector size by the number of heads.', '896 ÷ 14.'],
      why: '896 ÷ 14 = 64. That is the head dimension `d` you divide by √d with: √64 = 8.' },
    { t: 'recap', points: ['Each token makes a query, a key and a value with three learned matrices.', 'Scores are q · k, divided by √d so softmax stays soft.', 'Softmax turns scores into weights; the output is the weighted sum of values.', 'For "bites": weights 0.73 / 0.18 / 0.09 gave [0.82, 0.27].', 'Multi-head attention runs many small attentions in parallel: 768 = 12 heads × 64.'],
      cheat: [['softmax(QKᵀ / √d) · V', 'Self-attention'], ['d_head = d_model ÷ heads', 'Head dimension'], ['F.scaled_dot_product_attention(q, k, v)', 'PyTorch, one call'], ['w.reduce((s, wi, i) => s + wi * V[i][j], 0)', 'Weighted sum, column j']] }
  ]
};

// ---------------------------------------------------------------- Lesson 3
const M3_WORDS = ['the', 'cat', 'sat', 'on', 'the', 'mat'];
const M3_SCORES = [1.2, 0.4, 2.0, -0.5, 0.8, 1.5]; // raw scores of the chosen query row against each key
const M3_rowWeights = s => { const n = s.v.n, r = s.v.row - 1, open = M3_SCORES.slice(0, n).map((_, c) => s.v.mode === 'Encoder' || c <= r); const ex = M3_softmax(M3_SCORES.slice(0, n).map((x, c) => open[c] ? x : -Infinity)); return ex; };

const M3_enc_dec = {
  id: 'ml-enc-dec', title: 'Encoders vs decoders', mins: 8, needs: 'ml-attention',
  goal: 'explain the causal mask and pick an encoder or a decoder for a task.',
  cards: [
    { t: 'read', h: 'Two Transformers in one RAG app',
      body: 'Your RAG app embeds documents with `all-MiniLM-L6-v2` and answers with a chat model like Llama. Both are Transformers, with the same attention you just computed.\n\nSo why can\'t one model do both jobs well? The main difference is a single mask on the attention scores.\n\nAn [[encoder]] lets every token see every other token. A [[decoder]] lets each token see only the past. That one choice decides what each model is good at.',
      points: ['Encoder: BERT, ModernBERT, all-MiniLM. Reads the whole input at once.', 'Decoder: GPT, Llama, Qwen. Writes one token at a time, left to right.', 'Encoder-decoder: T5 and the original 2017 Transformer, built for translation.'] },
    { t: 'viz', h: 'The attention grid, with and without a mask',
      body: 'Row = the token asking. Column = the token it looks at.',
      nodes: Object.assign(
        { enc: { x: 690, y: 100, w: 170, label: 'Encoder', sub: 'BERT: both directions', kind: 'b' } },
        ...[0, 1, 2, 3].map(r => ({ ['r' + r]: { x: 90, y: 100 + 70 * r, label: ['the', 'cat', 'sat', 'down'][r], shape: 'text' }, ['k' + r]: { x: 200 + 110 * r, y: 35, label: ['the', 'cat', 'sat', 'down'][r], shape: 'text' } })),
        ...[0, 1, 2, 3].flatMap(r => [0, 1, 2, 3].map(c => ({ ['c' + r + c]: { x: 200 + 110 * c, y: 100 + 70 * r, w: 76, h: 36, label: 'sees', kind: 'c', state: 'ok' } })))
      ),
      steps: [
        { cap: 'An [[encoder]] like BERT: all 16 cells are open. Every token may attend to every token, before or after it.', do: [['focus', 'enc']] },
        { cap: 'Row "cat" sees "sat" and "down", the words after it. That helps fill a blank: "the [MASK] sat down".', do: [['focus', 'r1', 'c10', 'c11', 'c12', 'c13']] },
        { cap: 'A [[decoder]] learns by guessing the next token. If "cat" could see "sat", it would just copy the answer.', do: [['set', 'c12', { state: 'warn' }], ['note', 'c12', 'Peeking at the answer'], ['add', 'dec', { x: 690, y: 280, w: 170, label: 'Decoder', sub: 'GPT: past only', kind: 'e' }]] },
        { cap: 'So the decoder blocks every cell to the right of the diagonal. Row "the" now sees only itself.', do: [['set', 'c01', { label: 'blocked', state: 'bad' }], ['set', 'c02', { label: 'blocked', state: 'bad' }], ['set', 'c03', { label: 'blocked', state: 'bad' }], ['focus', 'r0', 'c00', 'c01', 'c02', 'c03']] },
        { cap: 'The [[causal mask]] is done: 10 of 16 cells stay open, 1 + 2 + 3 + 4. Each token sees itself and the past.', do: [['set', 'c12', { label: 'blocked', state: 'bad' }], ['set', 'c13', { label: 'blocked', state: 'bad' }], ['set', 'c23', { label: 'blocked', state: 'bad' }]] },
        { cap: 'Blocked scores become −∞ before [[softmax]], so their weight is 0. Row "cat": [1.2, 0.4, −∞, −∞] → [0.69, 0.31, 0, 0].', do: [['set', 'c10', { label: '0.69' }], ['set', 'c11', { label: '0.31' }], ['set', 'c12', { label: '0' }], ['set', 'c13', { label: '0' }], ['focus', 'r1', 'c10', 'c11', 'c12', 'c13']] },
        { cap: 'Same blocks, one mask apart. Encoders: embeddings, classification, reranking. Decoders: chat, code, any generation.', do: [['focus', 'enc', 'dec']] }
      ],
      predict: { at: 4, q: 'Finish the causal mask on this 4 × 4 grid. How many cells stay open?', options: ['10', '8', '6', '16'], answer: 0, why: 'Row 1 sees 1 token, row 2 sees 2, row 3 sees 3, row 4 sees 4. 1 + 2 + 3 + 4 = 10.' } },
    { t: 'quiz', q: 'You need vectors for RAG search over your docs. Which kind of model is the classic choice?',
      options: ['An encoder like all-MiniLM-L6-v2', 'A decoder like Llama 3', 'Whichever model is biggest', 'An encoder-decoder like T5, for translation'], answer: 0,
      why: 'An encoder sees the whole text in both directions, so every [[hidden state]] knows the full context. Mean-pool them and you get one strong vector.',
      whyNot: { 1: 'A decoder\'s early tokens never see later ones, so its vectors are lopsided. Some new embedders are tuned decoders, but they need extra training for it.', 2: 'Size is not the point. A 22M-parameter encoder often beats a raw 7B decoder at embeddings.', 3: 'T5 is built to turn one text into another. For search vectors, a plain encoder is simpler and the standard pick.' } },
    { t: 'play', kind: 'controls', h: 'Mask the grid yourself',
      body: 'Each cell shows the softmax weight for the chosen query row. Raw scores: 1.2, 0.4, 2.0, −0.5, 0.8, 1.5.',
      size: [800, 400],
      init: () => ({ seen: {} }),
      controls: [
        { id: 'n', type: 'range', label: 'Tokens', min: 2, max: 6, value: 4 },
        { id: 'mode', type: 'select', label: 'Model', options: ['Encoder', 'Decoder'], value: 'Encoder' },
        { id: 'row', type: 'range', label: 'Query row', min: 1, max: 6, value: 2 }
      ],
      update: s => { if (s.v.row > s.v.n) s.v.row = s.v.n; if (s.v.row === s.v.n) s.seen[s.v.mode] = true; else s.seen = {}; },
      view: s => {
        const n = s.v.n, r = s.v.row - 1, w = M3_rowWeights(s), nodes = {};
        for (let i = 0; i < n; i++) {
          nodes['k' + i] = { x: 220 + 90 * i, y: 30, label: M3_WORDS[i], shape: 'text' };
          nodes['r' + i] = { x: 120, y: 80 + 56 * i, label: M3_WORDS[i], shape: 'text', kind: i === r ? 'a' : undefined };
          for (let c = 0; c < n; c++) {
            const blocked = s.v.mode === 'Decoder' && c > i;
            nodes['c' + i + c] = { x: 220 + 90 * c, y: 80 + 56 * i, w: 56, h: 28, label: blocked ? '−∞' : i === r ? w[c].toFixed(2) : 'open', kind: i === r ? 'a' : 'n', state: blocked ? 'bad' : i === r ? 'active' : undefined };
          }
        }
        return { nodes, vars: { mode: s.v.mode, query: '"' + M3_WORDS[r] + '"' } };
      },
      readout: s => { const n = s.v.n, open = s.v.mode === 'Encoder' ? n * n : n * (n + 1) / 2; return [['Open pairs', open + ' of ' + n * n], ['Blocked pairs', String(n * n - open)], ['Tokens the query sees', String(s.v.mode === 'Encoder' ? n : s.v.row)]]; },
      goals: [
        { text: 'Switch to the **Decoder**: "cat" (row 2) now sees only "the" and itself', check: s => s.v.mode === 'Decoder' && s.v.row === 2, solve: [{ mode: 'Decoder' }] },
        { text: 'Grow to 6 tokens: the decoder blocks **15** of the 36 pairs', check: s => s.v.mode === 'Decoder' && s.v.n === 6, solve: [{ n: 6 }] },
        { text: 'Find the query row whose weights are the same in both modes (flip the mode to compare)', check: s => !!(s.seen.Encoder && s.seen.Decoder), solve: [{ row: 6 }, { mode: 'Encoder' }] }
      ],
      hints: ['In the decoder, row i sees tokens 1 to i.', 'Which row already sees every token, even with the mask?', 'Set the query row to the last token, then flip between Encoder and Decoder.'],
      done: 'The last token sees everything either way. That is why a decoder\'s last hidden state is the one used to predict the next token.' },
    { t: 'quiz', kind: 'multi', q: 'Which of these models are decoders?',
      options: ['GPT-2', 'BERT', 'Llama 3', 'ModernBERT', 'Qwen2.5', 'all-MiniLM-L6-v2'], answer: [0, 2, 4],
      why: 'GPT-2, Llama 3 and Qwen2.5 generate text left to right with a causal mask. The other three are encoders.',
      whyNot: { 1: 'BERT is the classic encoder: it reads both directions to fill in masked words.', 3: 'ModernBERT is a 2024 refresh of BERT. Still an encoder, with a longer context.', 5: 'all-MiniLM-L6-v2 is a small BERT-style encoder tuned for sentence embeddings.' } },
    { t: 'recap', points: ['Encoders and decoders use the same blocks; the [[causal mask]] is the key difference.', 'The mask sets future scores to −∞, so softmax gives them weight 0.', 'With n tokens, a decoder keeps n(n+1)/2 of the n² pairs open.', 'Encoders (BERT, ModernBERT) for embeddings and classification; decoders (GPT, Llama, Qwen) for generation.'],
      cheat: [['mask[i][j] = j > i ? −∞ : 0', 'Causal mask, added to the scores'], ['n(n + 1) / 2', 'Open pairs in a decoder'], ['AutoModel + mean pooling', 'Encoder → sentence embedding'], ['AutoModelForCausalLM', 'Hugging Face class for decoders'], ['AutoModelForSequenceClassification', 'Encoder + classifier head']] }
  ]
};

// ---------------------------------------------------------------- Lesson 4
const M3_BYTES = { 'fp16 (2 bytes)': 2, 'int8 (1 byte)': 1, 'fp32 (4 bytes)': 4 };
const M3_WEIGHTS_GB = 13.48; // 6.74B params × 2 bytes (Llama 2 7B in fp16)
const M3_kv = s => { const b = M3_BYTES[s.v.bytes], per = 2 * s.v.layers * s.v.heads * s.v.dim * b, gb = per * s.v.ctx / 1e9; return { per, gb, total: gb + M3_WEIGHTS_GB }; };
const M3_is7b = s => s.v.layers === 32 && s.v.dim === 128;

const M3_kvcache = {
  id: 'ml-kvcache', title: 'The KV cache and inference memory', mins: 8, needs: 'ml-enc-dec',
  goal: 'compute KV cache memory with 2 × layers × heads × head_dim × tokens × bytes, and explain prefill vs decode.',
  cards: [
    { t: 'read', h: 'Where did the other 10 GB go?',
      body: 'A 7B model needs about 13.5 GB for its weights in fp16. Your GPU has 24 GB. A short chat runs fine.\n\nThen a user pastes a long document, and the server dies with `CUDA out of memory`. The weights did not grow. Something else did.\n\nThat something is the [[KV cache]]. It makes generation fast, and it grows with every token in the context.' },
    { t: 'viz', h: 'Generating with a cache',
      body: 'A decoder writes one token at a time. Watch what it computes and what it keeps.',
      nodes: {
        t0: { x: 80, y: 65, w: 90, label: 'The', kind: 'a' }, t1: { x: 200, y: 65, w: 90, label: 'cat', kind: 'a' },
        t2: { x: 320, y: 65, w: 90, label: 'sat', kind: 'a' }, t3: { x: 440, y: 65, w: 90, label: 'on', kind: 'a' },
        m: { x: 260, y: 220, w: 160, label: 'Transformer', sub: '32 layers', shape: 'pill', kind: 'b' }
      },
      steps: [
        { cap: 'The prompt has 4 tokens. [[prefill|Prefill]] runs them through the model all at once, in parallel. Big matrix math keeps the GPU busy.', do: [['send', 't0', 'm'], ['send', 't3', 'm'], ['var', 'phase', 'prefill']] },
        { cap: 'Prefill keeps each token\'s key and value, in every layer, in the [[KV cache]]. Cache: 4 tokens.', do: [['add', 'kv', { x: 620, y: 220, label: 'KV cache', sub: '4 tokens', shape: 'db', kind: 'd' }], ['link', 'm', 'kv', 'k, v']] },
        { cap: 'Decode step 1: only the newest token goes in. Its query reads the 4 cached keys and values. Out comes "the".', do: [['add', 't4', { x: 560, y: 65, w: 90, label: 'the', kind: 'e' }], ['send', 'kv', 'm', 'read'], ['send', 'm', 't4'], ['var', 'phase', 'decode']] },
        { cap: 'Next step: "the" goes in. Only its own k and v are new. Append them. Cache: 5 tokens. Out comes "mat".', do: [['send', 't4', 'm'], ['send', 'm', 'kv', 'append'], ['set', 'kv', { sub: '5 tokens' }], ['add', 't5', { x: 680, y: 65, w: 90, label: 'mat', kind: 'e' }]] },
        { cap: 'Without a cache, each step reruns every token so far. Growing 1 token to 101: 1 + 2 + … + 100 = 5,050 passes, not 100.', do: [['var', 'no cache', '5,050 passes'], ['var', 'with cache', '100 passes']] },
        { cap: 'The price is memory. Per token, each layer stores a key and a value for every head: 2 × layers × heads × head_dim × bytes.', do: [['set', 'kv', { sub: 'grows per token' }], ['focus', 'kv']] },
        { cap: 'Llama 2 7B: 2 × 32 × 32 × 128 × 2 bytes = 524,288 bytes ≈ 0.52 MB per token. 4,096 tokens: 2.15 GB.', do: [['set', 'kv', { sub: '2.15 GB @ 4k' }], ['var', 'per token', '524,288 B']] },
        { cap: 'Eight users at 4,096 tokens: 8 × 2.15 = 17.2 GB of cache, plus 13.5 GB of weights. A 24 GB GPU runs out.', do: [['set', 'kv', { sub: '17.2 GB', state: 'bad' }], ['note', 'kv', 'CUDA out of memory']] }
      ],
      predict: { at: 3, q: 'The model now generates token 6. How many tokens need their k and v computed fresh?', options: ['1: just the newest one', '5: all of them again', '4: only the prompt'], answer: 0, why: 'Earlier keys and values never change in a decoder, thanks to the causal mask. So only the newest token is new work.' } },
    { t: 'quiz', q: 'With a KV cache, what does one decode step compute from scratch?',
      options: ['q, k and v for the newest token only, then attention over the cache', 'k and v for every token in the context', 'Nothing: the cache stores finished answers', 'The whole prompt again, but faster'], answer: 0,
      why: 'Old tokens\' keys and values are reused. The new token adds one k and v per head and layer, and its query attends over everything cached.',
      whyNot: { 1: 'That is generation without a cache. It repeats work that never changes.', 2: 'It stores keys and values, not text. The model still runs every layer for the new token.', 3: 'The prompt is processed once, during prefill, and then lives in the cache.' } },
    { t: 'play', kind: 'controls', h: 'Size the cache for a 7B model',
      body: 'A 24 GB GPU holds 13.5 GB of fp16 weights. Size the [[KV cache]] to fit the rest.',
      size: [800, 380],
      init: () => ({}),
      controls: [
        { id: 'layers', type: 'range', label: 'Layers', min: 8, max: 80, step: 8, value: 32 },
        { id: 'heads', type: 'range', label: 'KV heads', min: 1, max: 32, value: 32 },
        { id: 'dim', type: 'range', label: 'Head dim', min: 64, max: 256, step: 64, value: 128 },
        { id: 'ctx', type: 'range', label: 'Context', min: 1024, max: 32768, step: 1024, value: 1024, unit: 'tokens' },
        { id: 'bytes', type: 'select', label: 'Cache type', options: ['fp16 (2 bytes)', 'int8 (1 byte)', 'fp32 (4 bytes)'], value: 'fp16 (2 bytes)' }
      ],
      presets: [{ label: 'Llama 2 7B, 4k', v: { layers: 32, heads: 32, dim: 128, ctx: 4096, bytes: 'fp16 (2 bytes)' } }],
      view: s => {
        const r = M3_kv(s), over = r.total > 24, kvw = Math.round(Math.min(280, Math.max(110, r.gb * 28)));
        const parts = [['2', 'K and V'], [s.v.layers, 'layers'], [s.v.heads, 'KV heads'], [s.v.dim, 'head dim'], [s.v.ctx.toLocaleString('en-US'), 'tokens'], [M3_BYTES[s.v.bytes], 'bytes']];
        const nodes = {};
        parts.forEach(([v, u], i) => { nodes['f' + i] = { x: 70 + 130 * i, y: 60, w: 100, label: (i ? '× ' : '') + v, sub: u, kind: 'a' }; });
        nodes.per = { x: 200, y: 165, w: 190, label: Math.round(r.per / 1000) + ' KB / token', sub: r.per.toLocaleString('en-US') + ' bytes', kind: 'b' };
        nodes.tot = { x: 560, y: 165, w: 190, label: 'Cache ' + r.gb.toFixed(2) + ' GB', sub: '× ' + s.v.ctx.toLocaleString('en-US') + ' tokens', kind: 'd', state: over ? 'bad' : 'ok' };
        nodes.gpu = { x: 400, y: 300, w: 760, h: 100, label: 'GPU · 24 GB', shape: 'group' };
        nodes.wt = { x: 225, y: 310, w: 330, label: 'Weights 13.48 GB', sub: '7B × 2 bytes', kind: 'n' };
        nodes.kv = { x: 420 + kvw / 2, y: 310, w: kvw, label: 'KV ' + r.gb.toFixed(2) + ' GB', sub: over ? 'out of memory' : 'fits', kind: 'd', state: over ? 'bad' : 'ok' };
        return { nodes, edges: [['f5', 'tot', { dash: true }], ['per', 'tot'], ['tot', 'kv']], vars: { total: r.total.toFixed(2) + ' GB of 24' } };
      },
      readout: s => { const r = M3_kv(s); return [['Per token', r.per.toLocaleString('en-US') + ' bytes'], ['KV cache', r.gb.toFixed(2) + ' GB'], ['Weights + cache', r.total.toFixed(2) + ' GB of 24']]; },
      goals: [
        { text: 'Make the 7B cache (32 layers, 32 heads, 128 dims, fp16) hit **2.15 GB**', check: s => M3_is7b(s) && s.v.heads === 32 && s.v.bytes === 'fp16 (2 bytes)' && s.v.ctx === 4096, solve: [{ ctx: 4096 }] },
        { text: 'Push the context to **32,768** tokens and run the GPU out of memory', check: s => s.v.ctx === 32768 && M3_kv(s).total > 24, solve: [{ ctx: 32768 }] },
        { text: 'Fix it: keep 32 layers, 128 dims and 32,768 tokens, but fit in 24 GB', check: s => M3_is7b(s) && s.v.ctx === 32768 && M3_kv(s).total <= 24, solve: [{ heads: 8 }] }
      ],
      hints: ['4,096 tokens × 524,288 bytes = 2.15 GB.', 'At 32k tokens the cache is 17.18 GB. You need it under 10.52 GB. Which two dials are not locked?', 'Use [[grouped-query attention]]: 8 KV heads gives 4.29 GB. Or an int8 cache: 8.59 GB.'],
      done: 'That is exactly what Llama 3 does: 32 query heads share 8 KV heads. Servers like [[vLLM]] can also store the cache in 8-bit.' },
    { t: 'read', h: 'Prefill vs decode: two different speed limits',
      body: 'Take a round-number GPU: 100 trillion math operations per second and 1 TB/s of memory bandwidth. A 7B model costs about 2 × 6.74 billion ≈ 13.5 billion operations per token.\n\n**Prefill** of a 1,000-token prompt: 1,000 × 13.5 billion = 13.5 trillion operations, about 0.13 s. All tokens go in parallel, so the GPU\'s math units stay busy.\n\n**Decode**: every new token must read all 13.5 GB of weights, plus the cache. 13.5 GB ÷ 1 TB/s = 13.5 ms, so at best about 74 tokens/s. Writing 1,000 tokens takes 13.5 s.',
      points: ['Prefill is limited by compute. It sets the time to first token.', 'Decode is limited by memory bandwidth. It sets tokens per second.', 'Batching helps decode: one read of the weights serves many users at once.', 'These are best-case numbers. Real servers reach maybe half of them.'] },
    { t: 'quiz', kind: 'fill', q: 'Llama 3 8B has 32 layers, 8 KV heads and a head dim of 128, stored in fp16 (2 bytes). How many bytes of KV cache per token?',
      answer: ['131072', /^131[,.\s]?072$/, /^128\s*ki?b$/i], placeholder: 'bytes per token',
      hints: ['Use 2 × layers × KV heads × head_dim × bytes.', '2 × 32 × 8 × 128 × 2.', 'That is a quarter of Llama 2 7B\'s 524,288.'],
      why: '2 × 32 × 8 × 128 × 2 = 131,072 bytes (128 KiB). That is 4× smaller than Llama 2 7B, thanks to [[grouped-query attention]].' },
    { t: 'recap', points: ['The [[KV cache]] stores every past token\'s keys and values, so each decode step only computes the newest token.', 'Memory = 2 × layers × KV heads × head_dim × tokens × bytes. Llama 2 7B: 0.52 MB per token, 2.15 GB at 4k.', 'The cache grows with context length and with users. That is what runs a GPU out of memory.', 'Shrink it with fewer KV heads (GQA), an 8-bit cache, or a shorter max context.', 'Prefill is compute-bound (time to first token); decode is bandwidth-bound (tokens per second).'],
      cheat: [['2 × layers × kv_heads × head_dim × tokens × bytes', 'KV cache size'], ['2 × 32 × 32 × 128 × 2 = 524,288 B', 'Llama 2 7B, per token'], ['≈ 2 × params', 'Math operations per token'], ['weight bytes ÷ bandwidth', 'Best-case time per decode step'], ['vllm serve <model> --max-model-len 8192 --kv-cache-dtype fp8', 'Cap context and shrink the cache in vLLM']] }
  ]
};

;
// Module 4: Adapting models. Every number below was checked in node against
// real configs (Hugging Face config.json + safetensors counts, Ollama tag sizes,
// llama.cpp's quantize table). Memory for activations is a rough estimate and says so.

const M4_GLOSS = {
  'base model': 'A model straight out of pre-training. It continues documents; it does not follow instructions yet.',
  'reference model': 'A frozen copy of the model from before DPO. DPO measures every change against it, so the model cannot drift too far.',
  'log-ratio': 'How much more likely the trained model makes a reply than the reference model does: log(π ÷ π_ref). +2 means e² ≈ 7.4× as likely.',
  'DPO loss': { def: 'The number DPO minimises: small when the chosen reply gained more probability than the rejected one, compared with the reference model.',
    deep: {
      intuition: 'DPO never looks at a reply on its own. It looks at the **gap**: how much the chosen reply gained versus how much the rejected one gained, each measured against the frozen [[reference model]].\n\nA wide gap in the right direction gives a small loss. If both replies gain the same amount, the gap is zero and the loss stays at \\( \\log 2 \\approx 0.693 \\), the same as doing nothing.',
      formula: ['L = -\\log \\sigma(\\beta (\\Delta_c - \\Delta_r))', '\\Delta = \\log \\pi(y) - \\log \\pi_{\\text{ref}}(y)'],
      symbols: [['\\Delta_c', 'log-ratio of the chosen reply'], ['\\Delta_r', 'log-ratio of the rejected reply'], ['\\beta', 'how strongly the gap counts (often 0.1)'], ['\\sigma', 'the sigmoid, squashes any number into 0…1']],
      example: { given: 'β = 0.1. The chosen reply has log-ratio +2, the rejected one −1.',
        steps: ['Margin: \\( 2 - (-1) = 3 \\)', 'Scale it: \\( 0.1 \\times 3 = 0.3 \\)', 'Sigmoid: \\( \\sigma(0.3) = \\frac{1}{1 + e^{-0.3}} = \\frac{1}{1.7408} = 0.5744 \\)', 'Loss: \\( -\\log 0.5744 = 0.554 \\)'],
        result: 'Loss 0.554, down from 0.693 at the start.' },
      pitfalls: ['Raising both replies by the same amount does nothing. Only the gap matters.', 'With β too large the model chases tiny gaps and can drift into odd text.'],
      code: 'import torch.nn.functional as F\nmargin = (pc - pc_ref) - (pr - pr_ref)\nloss = -F.logsigmoid(beta * margin).mean()', lang: 'Python' } },
  'rank': { def: 'In LoRA, r: the thin middle size of B (d_out × r) and A (r × d_in). Bigger r means more trainable numbers.',
    deep: {
      intuition: 'A full update to a 1536 × 1536 matrix has 2.4 million numbers. LoRA bets that the useful change is simple, so it builds it from two thin matrices that meet in only r numbers.\n\nThe trainable count grows with r, but only linearly: you **add** the two sides, you never multiply them.',
      formula: ['\\Delta W = B A', 'n = r (d_{\\text{in}} + d_{\\text{out}})'],
      symbols: [['r', 'the rank, e.g. 8, 16 or 32'], ['d_{\\text{in}}, d_{\\text{out}}', 'inputs and outputs of the layer']],
      example: { given: 'Qwen2.5-1.5B, r = 16, all seven linear layers in each of its 28 blocks.',
        steps: ['q and o (1536 → 1536): 16 × 3,072 = 49,152 each', 'k and v (1536 → 256): 16 × 1,792 = 28,672 each', 'gate, up, down (1536 ↔ 8960): 16 × 10,496 = 167,936 each', 'One block: 2 × 49,152 + 2 × 28,672 + 3 × 167,936 = 659,456', '28 blocks: 28 × 659,456 = 18,464,768'],
        result: '18,464,768 trainable numbers, 1.2% of the 1,543,714,304 in the model.' },
      pitfalls: ['Doubling r with α fixed halves the scale α ÷ r. Change them together.', 'r = 8 to 32 covers most tasks. Huge ranks waste memory and can overfit.'] } },
  'alpha': 'LoRA alpha (α): a fixed number that scales the update. The layer adds (α ÷ r) × BA to its output.',
  'target modules': 'The layers that get LoRA adapters, named like q_proj, v_proj or down_proj. More targets means more trainable numbers.',
  'optimizer state': 'Extra numbers the optimizer keeps for each trainable weight. Adam keeps two running averages, usually in fp32.',
  'NF4': '4-bit NormalFloat: QLoRA\'s 4-bit format. Its 16 levels are spaced to fit bell-shaped weight values.',
  'bits per weight': { def: 'The average storage per weight, including the block scales. Q8_0 is 8.5, Q4_K_M about 4.9.',
    deep: {
      intuition: 'Quantized formats cut weights into small blocks. Each block stores small integer codes plus one scale in fp16. The scale is shared, so it adds a little to every weight.\n\nMultiply bits per weight by the number of weights and divide by 8 to get bytes.',
      formula: ['\\text{bpw} = \\frac{n \\times b + 16}{n}', '\\text{GB} = N \\times \\text{bpw} \\div 8 \\div 10^9'],
      symbols: [['n', 'weights per block (32 for Q8_0)'], ['b', 'bits per code'], ['N', 'weights in the model']],
      example: { given: 'Q8_0 stores blocks of 32 one-byte codes plus a 2-byte fp16 scale. Qwen2.5-7B has 7,615,616,512 weights.',
        steps: ['Block: \\( 32 \\times 8 + 16 = 272 \\) bits', 'Per weight: \\( 272 \\div 32 = 8.5 \\) bits', 'Model: \\( 7.6156 \\times 10^9 \\times 8.5 \\div 8 = 8.09 \\times 10^9 \\) bytes'],
        result: 'About 8.1 GB, the size of Ollama\'s qwen2.5:7b-instruct-q8_0.' },
      pitfalls: ['Bits, not bytes: forget the ÷ 8 and you get an answer 8× too big.', 'The file is not the whole bill. The KV cache and runtime need memory too.'] } }
};

// ---------- Lesson 1: training stages ----------
const M4_dpoLoss = (b, dc, dr) => Math.log1p(Math.exp(-b * (dc - dr)));  // = −log σ(β·margin)
const M4_sig = x => 1 / (1 + Math.exp(-x));
const M4_f = (x, d = 2) => (x > 0 ? '+' : '') + x.toFixed(d);

const M4_training_stages = { id: 'ml-training-stages', title: 'Pre-training, SFT and DPO', mins: 8,
  goal: 'tell pre-training, SFT and DPO apart by their data, their cost and the problem each one fixes.',
  cards: [
    { t: 'read', h: 'Same model, two personalities',
      body: 'Load `Qwen/Qwen2.5-1.5B` and type "What is the capital of France?". It may reply "What is the capital of Germany?" It is continuing a list of quiz questions, not answering you.\n\nNow try `Qwen/Qwen2.5-1.5B-Instruct`. It says "Paris." Same architecture, same 1,543,714,304 [[weights]]. The difference is the training that came after [[pre-training]].',
      points: ['**Pre-training** reads trillions of [[token|tokens]] and learns to predict the next one. Result: a [[base model]].', '**[[SFT]]** shows it example chats with ideal replies. Result: a model that answers.', '**Preference tuning** ([[RLHF]] or [[DPO]]) shows it good-vs-bad reply pairs. Result: replies people prefer.'],
      analogy: 'Pre-training is a new hire reading every repo on GitHub. SFT is onboarding with example tickets and model answers. DPO is code review: "ship this version, not that one."' },
    { t: 'viz', h: 'Three stages, three kinds of data', body: 'Each stage starts from the model the last one produced.',
      nodes: {
        s_pre: { x: 130, y: 190, label: 'Pre-training', kind: 'a', state: 'off' },
        s_sft: { x: 400, y: 190, label: 'SFT', kind: 'b', state: 'off' },
        s_dpo: { x: 670, y: 190, label: 'DPO', kind: 'e', state: 'off' }
      },
      steps: [
        { cap: 'Three training stages run in order. Each one needs a different kind of data.', do: [['focus', 's_pre', 's_sft', 's_dpo']] },
        { cap: 'Pre-training data is raw text: web pages, books, code. Qwen2.5 used 18 trillion tokens.', do: [['add', 'd_pre', { x: 130, y: 65, label: 'Web text', sub: '18T tokens', shape: 'db', kind: 'n' }], ['link', 'd_pre', 's_pre'], ['set', 's_pre', { state: 'active' }], ['note', 'd_pre', '"The capital of France is Paris…"'], ['var', 'pre-train data', '18T tokens']] },
        { cap: 'The job: predict every next token, scored by [[cross-entropy]]. Llama 3.1 8B took 1.46M H100 GPU-hours.', do: [['add', 'm_base', { x: 130, y: 315, label: 'Base model', kind: 'a' }], ['link', 's_pre', 'm_base'], ['set', 's_pre', { state: 'ok' }], ['var', 'cost', '1.46M GPU-hours']] },
        { cap: 'The [[base model]] continues documents. Online, a question is often followed by more questions.', do: [['set', 'm_base', { state: 'warn' }], ['note', 'm_base', '"…What is the capital of Germany?"']] },
        { cap: '[[SFT]] data is chat rows: a user turn plus the ideal assistant reply. Qwen2.5 used over 1 million.', do: [['add', 'd_sft', { x: 400, y: 65, label: 'Chat rows', sub: '1M+ examples', shape: 'db', kind: 'n' }], ['link', 'd_sft', 's_sft'], ['link', 'm_base', 's_sft'], ['set', 's_sft', { state: 'active' }], ['note', 'd_sft', '{"role":"assistant","content":"Paris."}'], ['var', 'SFT data', '1M+ chats']] },
        { cap: 'Same next-token loss, but counted only on the reply tokens. The model learns what an answer looks like.', do: [['add', 'm_inst', { x: 400, y: 315, label: 'Instruct model', kind: 'b', w: 140 }], ['link', 's_sft', 'm_inst'], ['set', 's_sft', { state: 'ok' }], ['note', 'm_inst', '"Paris."']] },
        { cap: 'Preference data: a prompt, a chosen reply and a rejected one. People or a judge model pick the winner.', do: [['add', 'd_dpo', { x: 670, y: 65, label: 'Pairs', sub: 'chosen / rejected', shape: 'db', kind: 'n', w: 130 }], ['link', 'd_dpo', 's_dpo'], ['link', 'm_inst', 's_dpo'], ['set', 's_dpo', { state: 'active' }], ['note', 'd_dpo', 'chosen "Paris." · rejected "So, France…"'], ['var', 'DPO data', '~62k pairs']] },
        { cap: '[[DPO]] raises the chosen reply\'s probability and lowers the rejected one. No separate reward model.', do: [['add', 'm_chat', { x: 670, y: 315, label: 'Aligned model', kind: 'e', w: 140 }], ['link', 's_dpo', 'm_chat'], ['set', 's_dpo', { state: 'ok' }], ['set', 'm_chat', { state: 'ok' }]] },
        { cap: 'Data shrinks at every stage: trillions of tokens, then about a million chats, then tens of thousands of pairs.', do: [['focus', 'd_pre', 'd_sft', 'd_dpo']] }
      ],
      predict: { at: 3, q: 'You ask the base model "What is the capital of France?" What happens?', options: ['It answers "Paris."', 'It keeps writing the document, maybe more questions', 'It refuses to reply'], answer: 1,
        why: 'Pre-training only teaches "continue this text". A question on a quiz page is usually followed by another question, not an answer.' } },
    { t: 'quiz', q: 'Your support bot gives correct answers, but it rambles. You have 5,000 rated pairs: a short reply people liked and a long one they did not. Which stage fits?',
      options: ['DPO on the pairs', 'More pre-training on support docs', 'SFT on the long replies', 'Raise the sampling temperature'], answer: 0,
      why: 'Pairs of "this one, not that one" are exactly what DPO learns from. It pushes short replies up and long ones down.',
      whyNot: { 1: 'Pre-training learns from raw text. It has no signal for "this reply is better than that one".', 2: 'SFT copies the replies you give it. Training on rambling replies teaches rambling.', 3: 'Temperature only changes randomness when sampling. It does not change what the model prefers.' } },
    { t: 'read', h: 'Common mistake: fine-tuning to teach facts',
      body: 'A team fine-tunes on 300 pages of product docs so the bot will "know" them. It picks up the tone. Ask about a price and it often makes one up, confidently.\n\nA few passes over 300 pages is a drop next to trillions of pre-training tokens. **Best practice:** match the problem to the tool.',
      points: ['New or changing facts → retrieval (RAG)', 'Output format, tone, one narrow task → [[SFT]]', '"This answer beats that one" → [[DPO]]'] },
    { t: 'play', kind: 'controls', h: 'Feel the DPO loss', body: 'Slide each reply\'s [[log-ratio]] against the frozen [[reference model]] and watch the [[DPO loss]].',
      init: () => ({}),
      controls: [
        { id: 'dc', type: 'range', label: 'Chosen log-ratio', min: -4, max: 4, step: 0.5, value: 0 },
        { id: 'dr', type: 'range', label: 'Rejected log-ratio', min: -4, max: 4, step: 0.5, value: 0 },
        { id: 'beta', type: 'range', label: 'β (beta)', min: 0.1, max: 1, step: 0.1, value: 0.1 },
        { id: 'flip', type: 'button', label: 'Learn it backwards', tone: 'bad', run: s => { s.v.dc = -2; s.v.dr = 2; } }
      ],
      presets: [{ label: 'Good pair', v: { dc: 2, dr: -1, beta: 0.1 } }, { label: 'Backwards pair', v: { dc: -1, dr: 1, beta: 0.1 } }],
      view: s => {
        const { dc, dr, beta } = s.v, m = dc - dr, L = M4_dpoLoss(beta, dc, dr);
        return { nodes: {
          c: { x: 120, y: 100, label: 'Chosen reply', sub: 'log-ratio ' + M4_f(dc, 1), kind: 'c', state: dc > 0 ? 'ok' : undefined },
          r: { x: 120, y: 280, label: 'Rejected reply', sub: 'log-ratio ' + M4_f(dr, 1), kind: 'e', w: 140, state: dr < 0 ? 'ok' : undefined },
          m: { x: 390, y: 190, label: 'Margin ' + M4_f(m, 1), sub: beta.toFixed(1) + ' × ' + m.toFixed(1) + ' = ' + (beta * m).toFixed(2), w: 170, kind: 'b' },
          l: { x: 660, y: 190, label: 'Loss ' + L.toFixed(3), sub: '−log σ(' + (beta * m).toFixed(2) + ')', w: 150, kind: 'a', state: L < 0.1 ? 'ok' : L < 0.6931 ? 'active' : 'warn' }
        }, edges: [['c', 'm', '+'], ['r', 'm', '−'], ['m', 'l']],
        vars: { 'chosen vs ref': '×' + Math.exp(dc).toFixed(2), 'rejected vs ref': '×' + Math.exp(dr).toFixed(2) } };
      },
      readout: s => { const { dc, dr, beta } = s.v, x = beta * (dc - dr); return [['Margin Δc − Δr', (dc - dr).toFixed(1)], ['β × margin', x.toFixed(2)], ['σ(β × margin)', M4_sig(x).toFixed(4)], ['Loss', M4_dpoLoss(beta, dc, dr).toFixed(3)]]; },
      goals: [
        { text: 'Get the loss below **0.6**', check: s => M4_dpoLoss(s.v.beta, s.v.dc, s.v.dr) < 0.6, solve: [{ dc: 2, dr: -1 }] },
        { text: 'Make both replies **equally** more likely (same non-zero log-ratio). Watch the loss.', check: s => s.v.dc === s.v.dr && s.v.dc !== 0, solve: [{ dc: 2, dr: 2 }] },
        { text: 'Set β to **0.5** and get the loss under **0.1**', check: s => Math.abs(s.v.beta - 0.5) < 1e-6 && M4_dpoLoss(s.v.beta, s.v.dc, s.v.dr) < 0.1, solve: [{ beta: 0.5, dc: 3, dr: -2 }] }
      ],
      hints: ['The loss falls when the chosen log-ratio is bigger than the rejected one.', 'Only the gap Δc − Δr counts. Equal moves cancel out, so the loss returns to 0.693.', 'You need β × margin above 2.25. With β = 0.5, try chosen +3 and rejected −2.'],
      done: 'DPO only sees the gap between chosen and rejected. β decides how much each unit of gap counts.' },
    { t: 'quiz', kind: 'multi', q: 'Which jobs is SFT on your own data good at?',
      options: ['Always reply in your API\'s JSON shape', 'Know this week\'s product prices', 'Write in your company\'s support tone', 'Learn a brand-new language from 2,000 rows'], answer: [0, 2],
      why: 'SFT teaches behaviour: a format, a tone, one narrow task. Facts that change belong in retrieval.',
      whyNot: { 1: 'Prices change weekly. Fine-tuned facts go stale and the model may still guess. Use RAG.', 3: 'A new language needs pre-training scale: billions of tokens, not 2,000 rows.' } },
    { t: 'recap', points: [
      'Pre-training: raw text, next-token [[cross-entropy]] on every token. Trillions of tokens and millions of GPU-hours.',
      'SFT: chat rows with ideal replies. Same loss, counted only on reply tokens. Teaches format and behaviour.',
      'DPO: prompt, chosen, rejected. It widens the gap between them, measured against a frozen reference.',
      'Changing facts → RAG. Behaviour → SFT. Taste → DPO.'],
      cheat: [['{"text": "…"}', 'a pre-training row'], ['{"messages": [{"role": …, "content": …}]}', 'an SFT row'], ['{"prompt": …, "chosen": …, "rejected": …}', 'a DPO row'],
        ['\\( L = -\\log \\sigma(\\beta(\\Delta_c - \\Delta_r)) \\)', 'DPO loss'], ['trl sft --model_name_or_path Qwen/Qwen2.5-0.5B --dataset_name stanfordnlp/imdb', 'SFT from the command line'], ['trl dpo --model_name_or_path Qwen/Qwen2.5-0.5B --dataset_name anthropic/hh-rlhf', 'DPO from the command line']] }
  ] };

// ---------- Lesson 2: LoRA / QLoRA ----------
// Real Qwen2.5 configs (hidden, MLP, layers, k/v width = kv_heads × 128, total params).
const M4_CFG = {
  'Qwen2.5-1.5B': { d: 1536, ff: 8960, L: 28, kv: 256, P: 1543714304, act: 1.5 },
  'Qwen2.5-7B': { d: 3584, ff: 18944, L: 28, kv: 512, P: 7615616512, act: 3 }
};
const M4_TM = { 'q, v': ['q', 'v'], 'q, k, v, o': ['q', 'k', 'v', 'o'], 'all linear': ['q', 'k', 'v', 'o', 'gate', 'up', 'down'] };
const M4_GPU = 15;  // a Colab T4 is a 16 GB card; nvidia-smi shows 15,360 MiB
function M4_loraCalc(v) {
  const c = M4_CFG[v.model], io = { q: [c.d, c.d], k: [c.d, c.kv], v: [c.d, c.kv], o: [c.d, c.d], gate: [c.d, c.ff], up: [c.d, c.ff], down: [c.ff, c.d] };
  const lin = Object.values(io).reduce((a, [i, o]) => a + i * o, 0) * c.L;
  const full = v.method === 'Full fine-tune', q = v.method === 'QLoRA (4-bit base)';
  const T = full ? c.P : M4_TM[v.tm].reduce((a, k) => a + v.r * (io[k][0] + io[k][1]), 0) * c.L;
  // base: fp16 = 2 B/weight; NF4 + double quant ≈ 4.127 bits on linear layers, embeddings stay 16-bit
  const base = full ? 0 : q ? (lin * 4.127 / 8 + (c.P - lin) * 2) / 1e9 : c.P * 2 / 1e9;
  const state = T * 16 / 1e9;  // full: fp16 w+grad, fp32 master + 2 Adam = 16 B; LoRA: fp32 w+grad+2 Adam = 16 B
  const need = base + state + c.act;
  return { T, P: c.P, base, state, act: c.act, need, fits: need <= M4_GPU, full, q };
}
const M4_n = x => Math.round(x).toLocaleString('en-US');

const M4_lora = { id: 'ml-lora', title: 'LoRA and QLoRA', mins: 9, needs: 'ml-training-stages',
  goal: 'compute LoRA\'s trainable parameters and adapter size, and choose LoRA or QLoRA to fit a 16 GB GPU.',
  cards: [
    { t: 'read', h: 'A 25 GB job on a 16 GB GPU',
      body: 'Full [[fine-tuning]] of Qwen2.5-1.5B updates all 1,543,714,304 [[weights]]. With the Adam optimizer each one costs about 16 bytes: the weight, its [[gradient]] and three fp32 copies ([[optimizer state]]). That is 24.7 GB. A free Colab T4 has 16 GB.\n\n[[LoRA]] freezes every original weight and trains 18,464,768 new ones: 1.2% of the model. The run fits in about 5 GB. The result is a 74 MB [[adapter]] file.',
      analogy: 'Like `patch-package` for `node_modules`. You never fork the library. You ship a tiny patch that is applied on top when it loads.' },
    { t: 'viz', h: 'ΔW = B·A on one layer', body: 'One attention layer of Qwen2.5-1.5B: `q_proj`, 1,536 inputs and 1,536 outputs.',
      nodes: {
        x: { x: 90, y: 190, label: 'Input x', sub: '1,536 numbers', kind: 'a' },
        W: { x: 330, y: 75, label: 'W', sub: '1536 × 1536', kind: 'n', w: 160 },
        sum: { x: 600, y: 190, label: '+', shape: 'circle', w: 56, kind: 'n' },
        out: { x: 725, y: 190, label: 'Output y', shape: 'pill', w: 110, kind: 'a' }
      },
      edges: [['x', 'W'], ['W', 'sum'], ['sum', 'out']],
      steps: [
        { cap: 'The matrix W holds 1536 × 1536 = 2,359,296 weights. Full fine-tuning would update all of them.', do: [['focus', 'W'], ['var', 'W', '2,359,296']] },
        { cap: 'LoRA freezes W. No gradient and no optimizer state for those 2.4 million numbers.', do: [['set', 'W', { state: 'off', sub: '1536 × 1536 · frozen' }]] },
        { cap: 'Add a thin matrix A. It squeezes 1,536 inputs down to r numbers. With [[rank]] r = 16, A is 16 × 1536.', do: [['add', 'A', { x: 270, y: 300, label: 'A', sub: '16 × 1536', kind: 'c' }], ['link', 'x', 'A'], ['var', 'A', '24,576']] },
        { cap: 'B expands r back to 1,536 outputs. A and B together: 16 × (1536 + 1536) = 49,152 numbers, 2% of W.', do: [['add', 'B', { x: 450, y: 300, label: 'B', sub: '1536 × 16', kind: 'c' }], ['link', 'A', 'B'], ['link', 'B', 'sum'], ['var', 'B', '24,576']] },
        { cap: 'By hand with 4 × 4 and r = 1: B = [1, 0, 2, −1], A = [0.5, 1, 0, 0]. Row 3 of BA = 2 × A = [1, 2, 0, 0].', do: [['note', 'B', '8 numbers make a 4 × 4 grid of 16']] },
        { cap: 'B starts at all zeros, so BA = 0. At step 0 the layer outputs exactly what the frozen model did.', do: [['set', 'B', { sub: 'starts at 0' }], ['note', 'sum', 'Wx + 0'], ['send', 'x', 'W'], ['send', 'W', 'sum']] },
        { cap: 'Training updates only A and B. Output: y = Wx + (α ÷ r)·BAx. With [[alpha]] 32 and r 16 the scale is 2.', do: [['set', 'A', { state: 'active' }], ['set', 'B', { state: 'active', sub: '1536 × 16' }], ['send', 'x', 'A'], ['send', 'A', 'B'], ['send', 'B', 'sum']] },
        { cap: 'Repeat for 7 [[target modules]] in all 28 layers: 18,464,768 trainable numbers, 1.2% of the model.', do: [['var', 'trainable', '18,464,768'], ['var', 'share', '1.2%']] },
        { cap: 'Save only A and B: a 74 MB [[adapter]]. Later you can merge it: new W = W + (α ÷ r)·BA.', do: [['add', 'ad', { x: 660, y: 315, label: 'Adapter', sub: '73.9 MB (fp32)', kind: 'd' }], ['link', 'B', 'ad', { dash: true }], ['set', 'ad', { state: 'ok' }]] }
      ],
      predict: { at: 5, q: 'Training is about to start. B begins as all zeros. What does the layer output at step 0?', options: ['Exactly what the frozen model outputs', 'Random noise, because A is random', 'All zeros'], answer: 0,
        why: 'B = 0 makes BA = 0, so the update adds nothing. Training starts from the original model and moves away gently.' } },
    { t: 'quiz', q: 'You add LoRA with r = 8 to one `q_proj` of Qwen2.5-1.5B (1,536 inputs, 1,536 outputs). How many trainable numbers is that?',
      options: ['24,576', '2,359,296', '12,288', '18,874,368'], answer: 0,
      why: 'r × (d_in + d_out) = 8 × (1536 + 1536) = 24,576. That is about 1% of the 2,359,296 in W.',
      whyNot: { 1: 'That is all of W. LoRA leaves W frozen and adds A and B.', 2: 'That counts only A (8 × 1536). B adds another 1536 × 8.', 3: 'That multiplies 8 × 1536 × 1536. A and B are thin: you add the two sides, not multiply them.' },
      hints: ['A is r × d_in. B is d_out × r. Add them up.'] },
    { t: 'read', h: 'QLoRA: a 4-bit base under the adapter',
      body: 'LoRA still keeps the frozen base in 16-bit: 2 bytes per weight. For Qwen2.5-7B that is 15.2 GB before training even starts.\n\n[[QLoRA]] stores the frozen base in 4-bit [[NF4]], about half a byte per weight. Each layer is unpacked to 16-bit on the fly for its matmul. Gradients still flow through it into A and B.\n\nThe 7B base drops to about 5.5 GB, so it trains on a T4. The price: slower steps and a little rounding noise in the base.',
      points: ['QLoRA = 4-bit frozen base + LoRA adapters', 'Unsloth: `FastLanguageModel.from_pretrained(..., load_in_4bit=True)`', 'Transformers: `BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4")`'] },
    { t: 'play', kind: 'controls', h: 'Fit a fine-tune on a Colab T4', body: 'Pick a model, method, [[rank]] and [[target modules]]. The T4 gives you 15 GB.',
      init: () => ({}),
      controls: [
        { id: 'model', type: 'select', label: 'Model', options: ['Qwen2.5-1.5B', 'Qwen2.5-7B'], value: 'Qwen2.5-1.5B' },
        { id: 'method', type: 'select', label: 'Method', options: ['Full fine-tune', 'LoRA (16-bit base)', 'QLoRA (4-bit base)'], value: 'LoRA (16-bit base)' },
        { id: 'r', type: 'range', label: 'Rank r', min: 4, max: 64, step: 4, value: 8 },
        { id: 'tm', type: 'select', label: 'Target modules', options: Object.keys(M4_TM), value: 'q, v' }
      ],
      view: s => {
        const z = M4_loraCalc(s.v), top = Math.max(z.need, M4_GPU);
        const h = g => Math.max(6, g / top * 250);
        return { nodes: {
          base: { x: 120, y: 75, label: 'Frozen base', sub: z.full ? 'none, all trainable' : z.base.toFixed(2) + ' GB · ' + (z.q ? '4-bit' : '16-bit'), w: 150, kind: 'n', state: z.full ? 'off' : undefined },
          tr: { x: 120, y: 190, label: z.full ? 'All weights' : 'LoRA A + B', sub: M4_n(z.T) + ' params', w: 150, kind: 'c' },
          st: { x: 120, y: 305, label: 'Training state', sub: z.state.toFixed(2) + ' GB · 16 B/param', w: 160, kind: 'd', state: z.state > M4_GPU ? 'bad' : undefined },
          need: { x: 470, y: 340, shape: 'bar', w: 70, h: h(z.need), label: 'Needs', sub: z.need.toFixed(1) + ' GB', kind: 'a', state: z.fits ? 'ok' : 'bad' },
          gpu: { x: 640, y: 340, shape: 'bar', w: 70, h: h(M4_GPU), label: 'T4', sub: '15 GB', kind: 'n' }
        }, edges: [['base', 'need', { tone: z.fits ? undefined : 'bad' }], ['tr', 'st'], ['st', 'need', { tone: z.fits ? undefined : 'bad' }]],
        vars: { trainable: M4_n(z.T), share: (100 * z.T / z.P).toFixed(2) + '%', activations: '~' + z.act + ' GB (rough)' } };
      },
      readout: s => { const z = M4_loraCalc(s.v); return [['Trainable params', M4_n(z.T)], ['Share of model', (100 * z.T / z.P).toFixed(2) + '%'], ['Adapter file (fp32)', z.full ? 'whole model' : (z.T * 4 / 1e6).toFixed(1) + ' MB'], ['GPU memory (estimate)', z.need.toFixed(1) + ' GB of 15 → ' + (z.fits ? 'fits' : 'out of memory')]]; },
      goals: [
        { text: 'Set the capstone recipe: 1.5B, r = **16** on **all linear** layers. Read the trainable count.', check: s => s.v.model === 'Qwen2.5-1.5B' && s.v.method !== 'Full fine-tune' && s.v.r === 16 && s.v.tm === 'all linear', solve: [{ r: 16, tm: 'all linear' }] },
        { text: 'Switch to a **full fine-tune** and watch the T4 run out of memory', check: s => s.v.method === 'Full fine-tune' && !M4_loraCalc(s.v).fits, solve: [{ method: 'Full fine-tune' }] },
        { text: 'Fit **Qwen2.5-7B** on the T4', check: s => s.v.model === 'Qwen2.5-7B' && s.v.method !== 'Full fine-tune' && M4_loraCalc(s.v).fits, solve: [{ model: 'Qwen2.5-7B', method: 'QLoRA (4-bit base)' }] }
      ],
      hints: ['Per module: r × (inputs + outputs). Sum the target modules, then multiply by 28 layers.', 'Full fine-tuning costs about 16 bytes per weight: 1.54B × 16 ≈ 24.7 GB.', 'The 7B base alone is 15.2 GB in 16-bit. Store it in 4-bit instead.'],
      done: 'Rank and targets move the bill by megabytes. The frozen base decides whether you fit, which is why QLoRA exists.' },
    { t: 'quiz', kind: 'fill', q: 'Your `LoraConfig` has `r=16` and `lora_alpha=32`. By what number is BA multiplied before it joins W?', pre: 'α ÷ r =', answer: ['2', '2.0', /^[x×]\s*2$/],
      why: 'Scale = α ÷ r = 32 ÷ 16 = 2. Double r while keeping α fixed and the scale halves to 1.', hints: ['Divide alpha by the rank.'] },
    { t: 'recap', points: [
      'LoRA freezes W and learns \\( \\Delta W = BA \\): B is d_out × r, A is r × d_in.',
      'Trainable per module = r × (d_in + d_out). Qwen2.5-1.5B with r = 16 on all linear layers: 18,464,768 (1.2%).',
      'B starts at zero, so training begins exactly at the base model. The update is scaled by α ÷ r.',
      'QLoRA keeps the frozen base in 4-bit NF4, so a 7B model trains on a 16 GB T4.'],
      cheat: [['\\( y = Wx + \\frac{\\alpha}{r} BAx \\)', 'LoRA forward pass'], ['\\( r \\times (d_{\\text{in}} + d_{\\text{out}}) \\)', 'trainable numbers per module'],
        ['LoraConfig(r=16, lora_alpha=32, target_modules="all-linear")', 'PEFT config: LoRA on every linear layer'],
        ['model.save_pretrained("adapter")', 'writes adapter_model.safetensors'], ['model.merge_and_unload()', 'bakes ΔW into W for serving']] }
  ] };

// ---------- Lesson 3: quantization ----------
// Real downloads: Ollama qwen2.5:<size>-instruct-<quant> tags (GB) and Qwen/Qwen2.5-<size>-Instruct-AWQ safetensors.
const M4_Q = {
  '1.5B': { P: 1543714304, fp16: 3.1, Q8_0: 1.6, Q6_K: 1.3, Q5_K_M: 1.1, Q4_K_M: 0.986, Q3_K_M: 0.824, Q2_K: 0.676, AWQ: 1.61 },
  '7B': { P: 7615616512, fp16: 15, Q8_0: 8.1, Q6_K: 6.3, Q5_K_M: 5.4, Q4_K_M: 4.7, Q3_K_M: 3.8, Q2_K: 3.0, AWQ: 5.57 },
  '14B': { P: 14770033664, fp16: 30, Q8_0: 16, Q6_K: 12, Q5_K_M: 11, Q4_K_M: 9.0, Q3_K_M: 7.3, Q2_K: 5.8, AWQ: 9.98 },
  '32B': { P: 32763876352, fp16: 66, Q8_0: 35, Q6_K: 27, Q5_K_M: 23, Q4_K_M: 20, Q3_K_M: 16, Q2_K: 12, AWQ: 19.33 },
  '72B': { P: 72706203648, fp16: 145, Q8_0: 77, Q6_K: 64, Q5_K_M: 54, Q4_K_M: 47, Q3_K_M: 38, Q2_K: 30, AWQ: 41.6 }
};
// bits per weight from llama.cpp's own table (file size ÷ Llama-3-8B's 8,030,261,248 weights); ppl = perplexity added on Llama-3-8B
const M4_FMT = {
  'fp16': { bpw: 16, ppl: 'none (reference)', eng: 'vLLM / Transformers' },
  'Q8_0': { bpw: 8.5, ppl: '+0.003', eng: 'Ollama / llama.cpp' },
  'Q6_K': { bpw: 6.57, ppl: '+0.022', eng: 'Ollama / llama.cpp' },
  'Q5_K_M': { bpw: 5.70, ppl: '+0.057', eng: 'Ollama / llama.cpp' },
  'Q4_K_M': { bpw: 4.90, ppl: '+0.175', eng: 'Ollama / llama.cpp' },
  'Q3_K_M': { bpw: 4.00, ppl: '+0.657', eng: 'Ollama / llama.cpp' },
  'Q2_K': { bpw: 3.17, ppl: '+3.520', eng: 'Ollama / llama.cpp' },
  'AWQ 4-bit': { bpw: 4.16, ppl: 'small (not in this table)', eng: 'vLLM' }
};
const M4_DEV = { 'RTX 4060 · 8 GB': 8, 'Colab T4 · 15 GB': 15, 'RTX 4090 · 24 GB': 24, 'H100 · 80 GB': 80 };
function M4_quantFit(v) {
  const m = M4_Q[v.model], f = M4_FMT[v.fmt], file = m[v.fmt === 'AWQ 4-bit' ? 'AWQ' : v.fmt], cap = M4_DEV[v.dev];
  const need = file + 1;  // + ~1 GB for KV cache (a few thousand tokens) and runtime, rough
  return { P: m.P, file, f, cap, need, fits: need <= cap, formula: m.P * f.bpw / 8 / 1e9 };
}
const M4_gb = x => x < 10 ? x.toFixed(x < 2 ? 2 : 1) : Math.round(x) + '';

const M4_quant = { id: 'ml-quant', title: 'Quantization and local serving', mins: 9, needs: 'ml-lora',
  goal: 'estimate a model\'s memory from its size and bits, and pick GGUF, AWQ or fp16 for where it will run.',
  cards: [
    { t: 'read', h: 'Where did 10 GB go?',
      body: 'Qwen2.5-7B has 7,615,616,512 [[weights]]. At 16 bits that is 2 bytes each: 15.2 GB. Yet `ollama run qwen2.5:7b` downloads a 4.7 GB file and runs on a laptop.\n\nThe trick is [[quantization]]: store each weight in about 4.9 bits instead of 16. The file gets 3× smaller and a little less accurate. The math is one line: \\( \\text{GB} = \\text{params} \\times \\text{bits} \\div 8 \\div 10^9 \\).',
      analogy: 'Like exporting a PNG as a JPEG. Most pixels barely change, the file shrinks a lot, and only a careful eye spots the loss.' },
    { t: 'viz', h: 'Quantize four weights by hand', body: 'One tiny block of weights, rounded to 8 bits and then to 4.',
      nodes: {
        w0: { x: 160, y: 75, label: '0.12', sub: 'fp16', kind: 'a' },
        w1: { x: 320, y: 75, label: '−0.50', sub: 'fp16', kind: 'a' },
        w2: { x: 480, y: 75, label: '0.33', sub: 'fp16', kind: 'a' },
        w3: { x: 640, y: 75, label: '0.05', sub: 'fp16', kind: 'a' }
      },
      vars: { block: '8 bytes' },
      steps: [
        { cap: 'Four weights from one layer, stored in fp16: 2 bytes each, 8 bytes in total.', do: [['focus', 'w0', 'w1', 'w2', 'w3']] },
        { cap: 'Find the biggest size in the block: |−0.50| = 0.50. It sets the scale for all four.', do: [['set', 'w1', { state: 'active' }], ['add', 'sc', { x: 400, y: 190, label: 'absmax = 0.50', w: 200, kind: 'd' }]] },
        { cap: 'int8 has 127 steps each side of zero. Scale = 0.50 ÷ 127 = 0.003937. Divide each weight by it and round.', do: [['set', 'sc', { label: 'scale = 0.003937', sub: '0.50 ÷ 127' }]] },
        { cap: 'The codes are [30, −127, 84, 13]: one byte each. Half the memory.', do: [['add', 'q0', { x: 160, y: 305, label: '30', kind: 'c' }], ['add', 'q1', { x: 320, y: 305, label: '−127', kind: 'c' }], ['add', 'q2', { x: 480, y: 305, label: '84', kind: 'c' }], ['add', 'q3', { x: 640, y: 305, label: '13', kind: 'c' }], ['var', 'block', '4 bytes + scale']] },
        { cap: 'Read back: 30 × 0.003937 = 0.118. Every weight lands within 0.002 of where it started.', do: [['set', 'q0', { sub: '→ 0.118', state: 'ok' }], ['set', 'q1', { sub: '→ −0.500', state: 'ok' }], ['set', 'q2', { sub: '→ 0.331', state: 'ok' }], ['set', 'q3', { sub: '→ 0.051', state: 'ok' }], ['var', 'max error', '0.0019']] },
        { cap: '4-bit: scale = 0.50 ÷ 7 = 0.0714. Codes [2, −7, 5, 1] read back as [0.143, −0.500, 0.357, 0.071].', do: [['set', 'q0', { label: '2', sub: '→ 0.143', state: 'warn' }], ['set', 'q1', { label: '−7', sub: '→ −0.500' }], ['set', 'q2', { label: '5', sub: '→ 0.357', state: 'warn' }], ['set', 'q3', { label: '1', sub: '→ 0.071', state: 'warn' }], ['set', 'sc', { label: 'scale = 0.0714', sub: '0.50 ÷ 7' }], ['var', 'max error', '0.0271']] },
        { cap: 'Real formats keep one scale per block of 32. Q8_0: 32 bytes + a 2-byte scale = 8.5 bits per weight.', do: [['var', 'Q8_0', '34 bytes / 32 weights'], ['note', 'sc', 'one fp16 scale per block']] },
        { cap: 'Scale it up: 7.6 billion weights × 4.9 bits ÷ 8 = 4.7 GB. That is the Q4_K_M file Ollama downloads.', do: [['var', 'qwen2.5:7b', '4.7 GB'], ['focus', 'q0', 'q1', 'q2', 'q3']] },
        { cap: '[[AWQ]] adds one idea: about 1% of weights matter most. It scales them up before rounding, so they lose less.', do: [['set', 'w1', { state: 'active' }], ['note', 'w1', 'protect the important ones']] }
      ],
      predict: { at: 5, q: '4-bit has only 7 steps each side of zero instead of 127. What happens to the error?', options: ['It grows more than 10×', 'It stays about the same', 'It becomes exactly zero'], answer: 0,
        why: 'The steps are 18× wider, so rounding lands further away. The worst error grows from 0.0019 to 0.0271, about 14×.' } },
    { t: 'quiz', q: 'Qwen2.5-1.5B has 1.54 billion weights. About how much memory do they need in 8-bit?',
      options: ['1.5 GB', '3.1 GB', '0.8 GB', '12.3 GB'], answer: 0,
      why: '1.54B × 8 bits ÷ 8 = 1.54 GB. Ollama\'s q8_0 file is 1.6 GB because each block of 32 also stores a scale.',
      whyNot: { 1: 'That is 16-bit: 2 bytes per weight.', 2: 'That is 4-bit: half a byte per weight.', 3: 'That is bits, not bytes. Divide by 8.' } },
    { t: 'play', kind: 'controls', h: 'Will it fit?', body: 'Pick a Qwen2.5 size, a format and a device. File sizes are the real downloads.',
      init: () => ({}),
      controls: [
        { id: 'model', type: 'select', label: 'Qwen2.5 size', options: Object.keys(M4_Q), value: '7B' },
        { id: 'fmt', type: 'select', label: 'Format', options: Object.keys(M4_FMT), value: 'fp16' },
        { id: 'dev', type: 'select', label: 'Device', options: Object.keys(M4_DEV), value: 'RTX 4060 · 8 GB' }
      ],
      view: s => {
        const z = M4_quantFit(s.v), top = Math.max(z.need, z.cap), h = g => Math.max(6, g / top * 250);
        return { nodes: {
          m: { x: 110, y: 100, label: 'Qwen2.5-' + s.v.model, sub: (z.P / 1e9).toFixed(2) + 'B weights', w: 130, kind: 'a' },
          f: { x: 330, y: 100, label: s.v.fmt + ' · ' + M4_gb(z.file) + ' GB', sub: z.f.bpw + ' bits/weight', w: 180, kind: 'b' },
          e: { x: 330, y: 290, label: z.f.eng, w: 180, kind: 'c' },
          need: { x: 560, y: 340, shape: 'bar', w: 70, h: h(z.need), label: 'Needs', sub: M4_gb(z.need) + ' GB', kind: 'a', state: z.fits ? 'ok' : 'bad' },
          have: { x: 690, y: 340, shape: 'bar', w: 70, h: h(z.cap), label: 'Has', sub: z.cap + ' GB', kind: 'n' }
        }, edges: [['m', 'f', 'quantize'], ['f', 'e', 'load'], ['e', 'need', { tone: z.fits ? 'ok' : 'bad' }]],
        vars: { 'quality cost': z.f.ppl, fits: z.fits ? 'yes' : 'no' } };
      },
      readout: s => { const z = M4_quantFit(s.v); return [['Real file', M4_gb(z.file) + ' GB'], ['Formula: params × bits ÷ 8', M4_gb(z.formula) + ' GB'], ['Needs (file + ~1 GB cache)', M4_gb(z.need) + ' GB of ' + z.cap], ['Perplexity cost (Llama-3-8B, llama.cpp)', z.f.ppl]]; },
      goals: [
        { text: 'Run **Qwen2.5-7B** on the 8 GB RTX 4060', check: s => s.v.model === '7B' && s.v.dev === 'RTX 4060 · 8 GB' && M4_quantFit(s.v).fits, solve: [{ fmt: 'Q4_K_M' }] },
        { text: 'Serve **Qwen2.5-72B** on one H100 with vLLM', check: s => s.v.model === '72B' && s.v.dev === 'H100 · 80 GB' && s.v.fmt === 'AWQ 4-bit' && M4_quantFit(s.v).fits, solve: [{ model: '72B', fmt: 'AWQ 4-bit', dev: 'H100 · 80 GB' }] },
        { text: 'Break it: pick **Q2_K** and compare its quality cost with Q4_K_M', check: s => s.v.fmt === 'Q2_K', solve: [{ fmt: 'Q2_K' }] }
      ],
      hints: ['15 GB of fp16 cannot fit in 8 GB. Fewer bits per weight shrink the file.', 'vLLM serves AWQ. 72B in fp16 is 145 GB, more than one H100.', 'Compare the perplexity cost: +0.175 for Q4_K_M versus +3.52 for Q2_K.'],
      done: 'Below 4 bits, quality falls off a cliff. Q4_K_M is the usual laptop pick; AWQ is the usual vLLM pick.' },
    { t: 'read', h: 'Pick the format for where it runs',
      body: 'The same weights ship in different formats. The right one depends on the engine that will load them.',
      points: ['**fp16 / bf16** ([[Hugging Face]] safetensors): full quality, 2 bytes per weight. For training, merging and big GPU servers.',
        '**[[GGUF]]** (llama.cpp, [[Ollama]]): one file with weights, tokenizer and chat template. Levels from Q2_K to Q8_0. Runs on CPUs, Macs and GPUs.',
        '**[[AWQ]]** ([[vLLM]]): 4-bit weights with fast GPU kernels, built for serving many users at once.',
        'Rule of thumb: laptop or one user → GGUF Q4_K_M. GPU server → AWQ on vLLM. Still training → fp16.'] },
    { t: 'play', kind: 'terminal', h: 'Run it locally, then serve it', size: [740, 330], body: 'A pretend machine with one T4 GPU, Ollama and vLLM. Run, inspect, then serve.',
      init: () => ({ pulled: false, showed: false, served: false, oom: false, used: 0 }),
      welcome: 'Pretend machine: one NVIDIA T4 (15 GB), Ollama and vLLM installed. Type help.',
      cmds: [
        { re: /^ollama\s+(?:run|pull)\s+(qwen2\.5:(?:1\.5b|7b))(?:\s+(.+))?$/i, help: 'ollama run qwen2.5:7b "<prompt>"', desc: 'download a GGUF model and chat', run(m, s, io) {
          const tag = m[1].toLowerCase(), size = tag.endsWith('7b') ? '4.7 GB' : '986 MB', first = !s.pulled;
          s.pulled = s.pulled || tag; io.send('sh', 'ol', tag); s.used = tag.endsWith('7b') ? 5.4 : 1.6;
          const pull = first ? 'pulling manifest\npulling model  100% ▕████████████▏ ' + size + '\nverifying sha256 digest\nsuccess\n' : '';
          const p = (m[2] || '').replace(/^["']|["']$/g, '');
          io.send('ol', 'gpu', 'Q4_K_M', 'ok');
          return pull + (p ? (/france/i.test(p) ? 'The capital of France is Paris.' : '(the model answers here; try asking for the capital of France)') : '>>> Send a message (/? for help)');
        } },
        { re: /^ollama\s+(?:list|ls)$/i, help: 'ollama list', desc: 'list downloaded models', run: (m, s) => 'NAME          ID              SIZE      MODIFIED\n' + (s.pulled === 'qwen2.5:7b' ? 'qwen2.5:7b    845dbda0ea48    4.7 GB    1 minute ago' : s.pulled ? 'qwen2.5:1.5b  65ec06548149    986 MB    1 minute ago' : '') },
        { re: /^ollama\s+show\s+(qwen2\.5:(?:1\.5b|7b))$/i, help: 'ollama show qwen2.5:7b', desc: 'show size and quantization', run(m, s) {
          const big = m[1].toLowerCase().endsWith('7b');
          if (!s.pulled) return { err: 'Error: model \'' + m[1] + '\' not found. Run it first.' };
          s.showed = true;
          return '  Model\n    architecture        qwen2\n    parameters          ' + (big ? '7.6B' : '1.5B') + '\n    context length      32768\n    embedding length    ' + (big ? '3584' : '1536') + '\n    quantization        Q4_K_M';
        } },
        { re: /^vllm\s+serve\s+(\S+)/i, help: 'vllm serve Qwen/Qwen2.5-7B-Instruct-AWQ', desc: 'start an OpenAI-compatible server', run(m, s, io) {
          const id = m[1];
          io.send('sh', 'vl', id.split('/').pop());
          if (/^Qwen\/Qwen2\.5-7B-Instruct-AWQ$/i.test(id)) { s.served = true; s.used = 13.8; io.send('vl', 'gpu', '5.19 GiB', 'ok'); return 'INFO  quantization: awq\nINFO  model weights: 5.19 GiB\nINFO  rest of the GPU memory goes to the KV cache\nINFO  serving on http://0.0.0.0:8000'; }
          if (/^Qwen\/Qwen2\.5-7B-Instruct$/i.test(id)) { s.oom = true; io.send('vl', 'gpu', '14.18 GiB', 'bad'); return { err: 'INFO  model weights: 14.18 GiB\nValueError: No available memory for the cache blocks.\nThe fp16 weights fill the 15 GB T4. Try the AWQ build.' }; }
          return { err: 'This pretend machine knows Qwen/Qwen2.5-7B-Instruct and Qwen/Qwen2.5-7B-Instruct-AWQ.' };
        } },
        { re: /^nvidia-smi$/i, help: 'nvidia-smi', desc: 'show GPU memory', run: (m, s) => { const u = Math.round(s.used * 1e9 / 2 ** 20); return '| GPU  Name        |   Memory-Usage       |\n|   0  Tesla T4    | ' + String(u).padStart(5) + 'MiB / 15360MiB |'; } },
        { re: /^curl\s+.*localhost:8000.*$/i, help: 'curl localhost:8000/v1/models', desc: 'call the vLLM server', run: (m, s) => s.served ? '{"object":"list","data":[{"id":"Qwen/Qwen2.5-7B-Instruct-AWQ","object":"model"}]}' : { err: 'curl: (7) Failed to connect to localhost port 8000' } }
      ],
      view: s => ({ nodes: {
        sh: { x: 90, y: 165, label: 'Your shell', kind: 'a' },
        ol: { x: 360, y: 60, label: 'Ollama', sub: 'GGUF Q4_K_M', kind: 'b', state: s.pulled ? 'ok' : undefined },
        vl: { x: 360, y: 270, label: 'vLLM', sub: s.served ? 'AWQ · :8000' : s.oom ? 'out of memory' : 'idle', kind: 'c', state: s.served ? 'ok' : s.oom ? 'bad' : undefined },
        gpu: { x: 640, y: 165, label: 'T4 · 15 GB', sub: 'Ollama or vLLM', w: 130, kind: 'n', state: s.served || s.pulled ? 'active' : undefined }
      }, edges: [['sh', 'ol'], ['sh', 'vl'], ['ol', 'gpu', { dash: !s.pulled }], ['vl', 'gpu', { dash: !s.served, tone: s.oom && !s.served ? 'bad' : undefined }]],
      vars: { model: s.pulled || 'none', quantization: s.showed ? 'Q4_K_M' : '?', server: s.served ? 'up' : 'down' } }),
      goals: [
        { text: 'Run `qwen2.5:7b` with Ollama and ask it a question', check: s => s.pulled === 'qwen2.5:7b', solve: ['ollama run qwen2.5:7b "What is the capital of France?"'] },
        { text: 'Check which quantization it uses with `ollama show`', check: s => s.showed, solve: ['ollama show qwen2.5:7b'] },
        { text: 'Serve the **AWQ** build of Qwen2.5-7B with vLLM', check: s => s.served, solve: ['vllm serve Qwen/Qwen2.5-7B-Instruct-AWQ'] }
      ],
      hints: ['Type `ollama run qwen2.5:7b "What is the capital of France?"`.', 'Run `ollama show qwen2.5:7b` and read the quantization line.', 'The fp16 repo does not leave room on a T4. Add `-AWQ` to the model name.'],
      try: ['ollama run qwen2.5:7b "Capital of France?"', 'ollama show qwen2.5:7b', 'vllm serve Qwen/Qwen2.5-7B-Instruct-AWQ'],
      done: 'Ollama pulls a 4.7 GB GGUF for one user on one machine. vLLM loads 5.19 GiB of AWQ and serves an OpenAI-style API.' },
    { t: 'quiz', kind: 'order', q: 'Order these Qwen2.5-7B files from largest to smallest.',
      items: ['fp16', 'Q8_0', 'Q6_K', 'Q4_K_M', 'Q2_K'],
      why: 'On Ollama: 15 GB → 8.1 → 6.3 → 4.7 → 3.0 GB. The digit after Q is roughly the bits per weight.' },
    { t: 'recap', points: [
      'Memory ≈ params × bits ÷ 8. Qwen2.5-7B: 15.2 GB in fp16, 8.1 GB in Q8_0, 4.7 GB in Q4_K_M.',
      'Quantizing stores small integer codes plus one scale per block. Fewer bits mean bigger rounding error.',
      'On Llama-3-8B, Q4_K_M adds 0.18 to perplexity and Q2_K adds 3.5. Below 4 bits quality drops fast.',
      'GGUF → llama.cpp and Ollama on laptops. AWQ → vLLM on GPU servers. fp16 → training and merging.'],
      cheat: [['\\( \\text{GB} = N \\times b \\div 8 \\div 10^9 \\)', 'memory for N weights at b bits'], ['ollama run qwen2.5:7b', 'download the Q4_K_M GGUF and chat'], ['ollama show qwen2.5:7b', 'see parameters and quantization'],
        ['python convert_hf_to_gguf.py ./merged --outfile model-f16.gguf --outtype f16', 'Hugging Face folder → GGUF'], ['llama-quantize model-f16.gguf model-Q4_K_M.gguf Q4_K_M', 'fp16 GGUF → 4-bit'], ['vllm serve Qwen/Qwen2.5-7B-Instruct-AWQ', 'OpenAI-compatible server on port 8000']] }
  ] };

;
// ML Foundations, Module 5: Capstone "Your ML lab". Every number below came from a real run (or is marked as a sample).
const M5_GLOSS = {
  'XOR': 'Exclusive or: the output is 1 when exactly one of the two inputs is 1. No single straight line splits its 1s from its 0s, so a network needs a hidden layer to learn it.',
  'binary cross-entropy': 'Cross-entropy for yes/no labels, often written BCE: \\( -[y \\log p + (1-y) \\log(1-p)] \\). Guessing 0.5 costs \\( \\log 2 \\approx 0.693 \\).',
  'uv': 'A fast Python package and project manager. `uv add numpy` installs a package into the project, and `uv run python x.py` runs a script inside its environment.',
  'TF-IDF': 'Term frequency × inverse document frequency. It turns text into a vector where a word scores high if it is common in this message but rare across all messages.',
  'stratified split': 'A train/test split that keeps the class ratio the same in both parts, so a 13.4% spam dataset gives a 13.4% spam test set.',
  'attention mask': 'A list of 1s and 0s next to the token ids: 1 for a real token, 0 for padding. The model and the pooling step ignore the 0s.',
  'mean pooling': 'Averaging the per-token vectors (only the real tokens, not padding) to get one fixed-size vector for the whole sentence.',
  'cosine similarity': 'How closely two vectors point the same way: \\( \\cos = \\frac{a \\cdot b}{\\lVert a \\rVert \\lVert b \\rVert} \\). 1 means same direction, 0 means unrelated. For length-1 vectors it is just the dot product.',
  'chat template': 'The exact text format a chat model was trained on, with role markers such as `<|im_start|>user`. Train and serve with the same template, or answers degrade.',
  'Colab': 'Google Colaboratory: a free hosted Jupyter notebook. The free tier can attach an NVIDIA T4 GPU with about 15 GB of memory.',
  'Q4_K_M': 'A llama.cpp quantization type: mostly 4-bit blocks, with some sensitive tensors kept at 6 bits. It averages about 5 bits per weight.',
  'Modelfile': 'Ollama\'s recipe file: `FROM` the weights, plus the prompt `TEMPLATE`, a default `SYSTEM` prompt and `PARAMETER` settings.'
};

// ---------- Step 1 helpers: the real XOR training, same math and same start weights as numpy's default_rng(11) ----------
const M5_W1 = [[0.03419276725318417, 1.3597475403099617, 1.2247210785859324, -0.5103070767876675], [-0.2979695111064471, -0.5273841930334252, 0.5697263575719601, -0.056064439045617594]];
const M5_W2 = [0.7468856162565439, -1.8473247989741095, 1.5665487746995206, -0.09643216015562055];
function M5_train(lr) {
  const X = [[0, 0], [0, 1], [1, 0], [1, 1]], Y = [0, 1, 1, 0], sg = z => 1 / (1 + Math.exp(-z));
  let W1 = M5_W1.map(r => r.slice()), b1 = [0, 0, 0, 0], W2 = M5_W2.slice(), b2 = 0, P = [];
  const L = [];
  for (let s = 0; s < 1000; s++) {
    const H = X.map(x => b1.map((b, j) => sg(x[0] * W1[0][j] + x[1] * W1[1][j] + b)));
    P = H.map(h => sg(h.reduce((a, v, j) => a + v * W2[j], b2)));
    let loss = 0; P.forEach((p, i) => { loss -= (Y[i] * Math.log(p) + (1 - Y[i]) * Math.log(1 - p)) / 4; }); L.push(loss);
    const d2 = P.map((p, i) => (p - Y[i]) / 4);
    const dW2 = [0, 1, 2, 3].map(j => H.reduce((a, h, i) => a + h[j] * d2[i], 0)), db2 = d2.reduce((a, b) => a + b, 0);
    const d1 = H.map((h, i) => h.map((v, j) => d2[i] * W2[j] * v * (1 - v)));
    const dW1 = [0, 1].map(k => [0, 1, 2, 3].map(j => X.reduce((a, x, i) => a + x[k] * d1[i][j], 0))), db1 = [0, 1, 2, 3].map(j => d1.reduce((a, r) => a + r[j], 0));
    for (let k = 0; k < 2; k++) for (let j = 0; j < 4; j++) W1[k][j] -= lr * dW1[k][j];
    b1 = b1.map((b, j) => b - lr * db1[j]); W2 = W2.map((w, j) => w - lr * dW2[j]); b2 -= lr * db2;
  }
  return { L, P };
}
const M5_f4 = v => isFinite(v) ? v.toFixed(4) : 'nan';
const M5_np = a => '[' + a.map(v => isFinite(v) ? (Math.round(v * 1000) / 1000 === 0 ? '0.' : String(Math.round(v * 1000) / 1000)) : 'nan').map((t, i, all) => t.padEnd(Math.max(...all.map(x => x.length)))).join(' ').trimEnd() + ']';
function M5_runXor(m, s) {
  if (!s.pk.numpy) return { err: 'Traceback (most recent call last):\n  File "xor.py", line 2, in <module>\n    import numpy as np\nModuleNotFoundError: No module named \'numpy\'' };
  if (!s.pk.matplotlib) return { err: 'Traceback (most recent call last):\n  File "xor.py", line 3, in <module>\n    import matplotlib.pyplot as plt\nModuleNotFoundError: No module named \'matplotlib\'' };
  const lr = m[1] ? Number(m[1]) : 1.0;
  if (!(lr > 0)) return { err: 'ValueError: could not convert string to float: \'' + m[1] + '\'' };
  const { L, P } = M5_train(lr), first = L[0], final = L[999];
  const lines = [0, 200, 400, 600, 800, 999].map(i => 'step ' + String(i).padStart(4) + '  loss ' + M5_f4(L[i]));
  const warn = L.some(v => !isFinite(v)) ? ['xor.py:16: RuntimeWarning: overflow encountered in exp'] : [];
  s.runs.push({ lr, first, final }); s.last = { lr, first, final }; s.png = true;
  return [...warn, ...lines, 'predictions: ' + M5_np(P), 'saved loss.png'].join('\n');
}

// ---------- Step 2 helpers: real test-set counts for the SMS spam model (1,115 test messages, 149 spam) ----------
// [threshold, TP, FP, FN] from predict_proba on the held-out 20%.
const M5_SPAM = [[0.05, 149, 775, 0], [0.1, 148, 446, 1], [0.15, 147, 236, 2], [0.2, 145, 124, 4], [0.25, 144, 79, 5], [0.3, 143, 49, 6], [0.35, 143, 26, 6], [0.4, 143, 22, 6], [0.45, 139, 16, 10], [0.5, 138, 7, 11], [0.55, 136, 5, 13], [0.6, 134, 4, 15], [0.65, 132, 2, 17], [0.7, 130, 1, 19], [0.75, 126, 1, 23], [0.8, 121, 0, 28], [0.85, 112, 0, 37], [0.9, 93, 0, 56], [0.95, 56, 0, 93]];
function M5_spamAt(t) {
  const r = M5_SPAM[Math.min(18, Math.max(0, Math.round(t * 20) - 1))], [th, tp, fp, fn] = r, tn = 966 - fp;
  const P = tp / (tp + fp), R = tp / (tp + fn), F = 2 * P * R / (P + R);
  return { th, tp, fp, fn, tn, P, R, F, acc: (tp + tn) / 1115 };
}

// ---------- Step 3 helpers: real all-MiniLM-L6-v2 outputs, one padded batch of 5 sentences ----------
const M5_SENT = ['How do I reset my password?', 'I forgot my login password', 'The cat sat on the mat', 'My card was charged twice', 'I was billed two times this month'];
const M5_TOKS = [9, 8, 8, 7, 9];
const M5_POOL = ['mean (masked)', 'mean (with padding)', '[CLS] only'];
const M5_COS = {
  'mean (masked)': [[1, 0.784, 0.086, 0.278, 0.203], [0.784, 1, 0.034, 0.251, 0.196], [0.086, 0.034, 1, 0.074, -0.004], [0.278, 0.251, 0.074, 1, 0.638], [0.203, 0.196, -0.004, 0.638, 1]],
  'mean (with padding)': [[1, 0.785, 0.097, 0.312, 0.203], [0.785, 1, 0.049, 0.305, 0.198], [0.097, 0.049, 1, 0.075, -0.005], [0.312, 0.305, 0.075, 1, 0.631], [0.203, 0.198, -0.005, 0.631, 1]],
  '[CLS] only': [[1, 0.907, 0.65, 0.708, 0.723], [0.907, 1, 0.607, 0.669, 0.693], [0.65, 0.607, 1, 0.551, 0.567], [0.708, 0.669, 0.551, 1, 0.771], [0.723, 0.693, 0.567, 0.771, 1]]
};
const M5_cos = v => M5_COS[v.pool][M5_SENT.indexOf(v.a)][M5_SENT.indexOf(v.b)];

// ---------- Lesson 1: XOR ----------
const M5_xor = {
  id: 'mlcap-xor', title: 'Step 1: A NumPy network learns XOR', mins: 9,
  goal: 'write a 2-layer network in pure NumPy, train it with your own backprop, and watch the loss fall from 0.69 to 0.01.',
  cards: [
    { t: 'read', h: 'Four rows that break a straight line',
      body: '[[XOR]] has only four rows: `00→0`, `01→1`, `10→1`, `11→0`. Yet no single straight line can split the 1s from the 0s. A model with no hidden layer gets stuck guessing 0.5 for everything.\n\nIn this step you build a tiny network with a hidden layer in pure NumPy. No PyTorch, no autograd. You write the [[backpropagation|backprop]] yourself, about 30 lines.\n\nThen you watch the [[loss function|loss]] fall, like watching a CI job go green.',
      analogy: 'One straight cut cannot separate the four corners of a square checkerboard. Two cuts can. The hidden layer gives the network those extra cuts.' },
    { t: 'viz', h: 'One training step, with real numbers', body: 'Seed 11, input (1, 0), target 1. These are the exact numbers your script computes.',
      nodes: {
        inp: { x: 100, y: 190, label: 'Input x', sub: '(1, 0)', kind: 'n' },
        hid: { x: 330, y: 190, label: 'Hidden h', sub: '4 sigmoid units', kind: 'b', w: 150 },
        out: { x: 560, y: 190, label: 'Output p', sub: 'P(y = 1)', kind: 'b' },
        tgt: { x: 560, y: 315, label: 'Target y', sub: '1', kind: 'n' },
        loss: { x: 560, y: 65, label: 'BCE loss', shape: 'pill', kind: 'd' }
      },
      steps: [
        { cap: '[[XOR]] data: four rows, 2 inputs each. The net is 2 → 4 → 1, with random starting [[weights]].', do: [['link', 'inp', 'hid', 'W1'], ['link', 'hid', 'out', 'W2'], ['var', 'rows', 4]] },
        { cap: 'Layer 1: \\( h = \\sigma(xW_1 + b_1) \\). For (1, 0) that gives h = (0.509, 0.796, 0.773, 0.375).', do: [['send', 'inp', 'hid', 'x'], ['set', 'hid', { sub: '0.509 .796 .773 .375', state: 'active' }]] },
        { cap: 'Layer 2: \\( p = \\sigma(h \\cdot W_2 + b_2) = \\sigma(0.084) = 0.521 \\). The untrained net is basically guessing.', do: [['send', 'hid', 'out', 'h'], ['set', 'out', { sub: 'p = 0.521', state: 'active' }]] },
        { cap: '[[binary cross-entropy|BCE]] for target 1 is \\( -\\log(0.521) = 0.652 \\). Over all 4 rows the mean loss is 0.691.', do: [['link', 'tgt', 'out', { dash: true }], ['link', 'out', 'loss'], ['set', 'loss', { sub: '0.652' }], ['var', 'loss', 0.691]] },
        { cap: 'The error signal at the output is \\( p - y = 0.521 - 1 = -0.479 \\). Negative means "push p up".', do: [['send', 'loss', 'out', '-0.479', 'warn'], ['note', 'out', 'p − y = −0.479']] },
        { cap: '[[chain rule|Chain rule]]: unit 2 gets \\( -0.479 \\times -1.847 \\times 0.796 \\times (1 - 0.796) \\approx 0.144 \\).', do: [['send', 'out', 'hid', 'grad', 'warn'], ['note', 'hid', 'error × W2 × h(1 − h)']] },
        { cap: '[[gradient descent|Update]] every weight: \\( W \\leftarrow W - \\eta \\frac{\\partial L}{\\partial W} \\), with learning rate \\( \\eta = 1.0 \\).', do: [['set', 'hid', { state: 'ok' }], ['var', 'lr', 1.0]] },
        { cap: 'Repeat 1,000 times on all 4 rows. Loss 0.691 → 0.011. Predictions: 0.003, 0.988, 0.990, 0.017.', do: [['set', 'out', { sub: 'learned XOR', state: 'ok' }], ['set', 'loss', { sub: '0.691 → 0.011', state: 'ok' }], ['var', 'loss', 0.011]] }
      ],
      predict: { at: 4, q: 'The net says p = 0.521 and the target is 1. What error signal \\( p - y \\) flows back from the output?', options: ['−0.479: push p up', '+0.479: push p down', '0.652: the loss itself'], answer: 0,
        why: 'For a sigmoid output with [[binary cross-entropy|BCE]], the gradient at the output is simply \\( p - y = 0.521 - 1 = -0.479 \\). Gradient descent subtracts it, so p rises.' } },
    { t: 'read', h: 'Write the code: xor.py',
      body: 'Make a project with [[uv]]: `uv init xor-lab`, then `cd xor-lab` and `uv add numpy matplotlib`. Save this as `xor.py`.\n\nForward pass, [[binary cross-entropy|BCE]] loss, backward pass, update. The `LR` environment variable lets you change the [[learning rate]] without editing code.',
      code: 'import os\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nX = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)  # 4 x 2\ny = np.array([[0], [1], [1], [0]], dtype=float)              # 4 x 1\n\nrng = np.random.default_rng(11)\nW1, b1 = rng.normal(0, 1, (2, 4)), np.zeros((1, 4))  # layer 1: 2 -> 4\nW2, b2 = rng.normal(0, 1, (4, 1)), np.zeros((1, 1))  # layer 2: 4 -> 1\nsigmoid = lambda z: 1 / (1 + np.exp(-z))\nlr, losses = float(os.environ.get("LR", 1.0)), []\n\nfor step in range(1000):\n    h = sigmoid(X @ W1 + b1)                  # forward: 4 x 4 hidden\n    p = sigmoid(h @ W2 + b2)                  # forward: 4 x 1 P(output = 1)\n    loss = -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))  # BCE\n    losses.append(loss)\n    dz2 = (p - y) / len(X)                    # backward: BCE + sigmoid\n    dW2, db2 = h.T @ dz2, dz2.sum(0, keepdims=True)\n    dz1 = (dz2 @ W2.T) * h * (1 - h)          # chain rule through sigmoid\n    dW1, db1 = X.T @ dz1, dz1.sum(0, keepdims=True)\n    W1 -= lr * dW1; b1 -= lr * db1            # gradient descent step\n    W2 -= lr * dW2; b2 -= lr * db2\n    if step % 200 == 0 or step == 999:\n        print(f"step {step:4d}  loss {loss:.4f}")\n\nprint("predictions:", p.round(3).ravel())\nplt.plot(losses); plt.xlabel("step"); plt.ylabel("BCE loss")\nplt.savefig("loss.png"); print("saved loss.png")', lang: 'Python' },
    { t: 'play', kind: 'terminal', h: 'Rehearse it: train the net',
      body: 'You are in `xor-lab` with `xor.py` saved. The training math here is real: same seed, same numbers.',
      init: () => ({ pk: {}, runs: [], last: null, png: false }),
      size: [800, 250],
      welcome: 'xor-lab/ created with `uv init`. xor.py is saved.',
      cmds: [
        { re: /^uv\s+add\s+(.+)$/i, help: 'uv add <packages>', desc: 'install packages into the project', run(m, s) {
          const want = m[1].toLowerCase().split(/\s+/), ok = want.filter(p => p === 'numpy' || p === 'matplotlib');
          if (!ok.length) return { err: 'error: no package named `' + want[0] + '` in this lab (try numpy matplotlib)' };
          ok.forEach(p => { s.pk[p] = true; });
          return 'Resolved ' + (ok.length * 6) + ' packages in 0.9s\nInstalled ' + (ok.length * 5 + 1) + ' packages in 146ms\n' + ok.map(p => ' + ' + p).join('\n');
        } },
        { re: /^(?:LR=(\S+)\s+)?uv\s+run\s+(?:python3?\s+)?xor\.py$/i, help: 'uv run python xor.py', desc: 'train for 1,000 steps (prefix LR=0.1 to change the learning rate)', run: (m, s) => M5_runXor(m, s) },
        { re: /^ls$/i, help: 'ls', desc: 'list files', run: (m, s) => 'README.md  main.py  pyproject.toml  xor.py' + (s.png ? '  loss.png' : '') },
        { re: /^open\s+loss\.png$/i, help: 'open loss.png', desc: 'look at the loss curve', run: (m, s) => s.png ? '(loss.png) The curve starts at ' + M5_f4(s.last.first) + ' and ends at ' + M5_f4(s.last.final) + ' after 1,000 steps.' : { err: 'The file loss.png does not exist. Run xor.py first.' } }
      ],
      view: s => {
        const l = s.last, good = l && l.final < 0.05, bad = l && !(l.final < l.first);
        return {
          nodes: {
            env: { x: 330, y: 55, label: 'uv env', sub: s.pk.numpy && s.pk.matplotlib ? 'numpy, matplotlib' : 'missing packages', kind: 'n', w: 150, state: s.pk.numpy && s.pk.matplotlib ? 'ok' : 'warn' },
            data: { x: 100, y: 180, label: 'XOR data', sub: '4 rows', kind: 'n' },
            net: { x: 330, y: 180, label: 'NumPy net', sub: '2 → 4 → 1', kind: 'b', w: 150, state: good ? 'ok' : bad ? 'bad' : l ? 'warn' : undefined },
            loss: { x: 590, y: 180, label: 'Loss curve', shape: 'pill', kind: 'd', w: 170, sub: l ? M5_f4(l.first) + ' → ' + M5_f4(l.final) : 'not run yet', state: good ? 'ok' : bad ? 'bad' : l ? 'warn' : undefined }
          },
          edges: [['env', 'net', { dash: true }], ['data', 'net'], ['net', 'loss', { tone: good ? 'ok' : bad ? 'bad' : undefined }]],
          vars: { LR: l ? l.lr : '-', 'final loss': l ? M5_f4(l.final) : '-', runs: s.runs.length }
        };
      },
      goals: [
        { text: 'Install `numpy` and `matplotlib` with `uv add`', check: s => !!(s.pk.numpy && s.pk.matplotlib), solve: ['uv add numpy matplotlib'] },
        { text: 'Run `xor.py` and get the final loss under 0.05', check: s => s.runs.some(r => r.final < 0.05), solve: ['uv run python xor.py'] },
        { text: 'Break it: pick a learning rate so big the loss ends higher than it started', check: s => s.runs.some(r => !(r.final < r.first)), solve: ['LR=30 uv run python xor.py'] }
      ],
      hints: ['Packages first: `uv add numpy matplotlib`.', 'Run `uv run python xor.py`. Try `LR=0.1 uv run python xor.py` too: it crawls.', 'Big steps overshoot. Try `LR=30 uv run python xor.py`.'],
      try: ['uv add numpy matplotlib', 'uv run python xor.py', 'LR=0.1 uv run python xor.py'],
      done: 'LR 1.0 reaches 0.011. LR 0.1 is still at 0.48 after 1,000 steps. LR 30 jumps to 3.7 and gets stuck: every prediction near 0.' },
    { t: 'check', h: 'Make it real: train it on your machine',
      body: 'Run the real script. Your numbers should match the lesson to 4 decimals.', code: 'uv init xor-lab && cd xor-lab\nuv add numpy matplotlib\n# save xor.py from the "Write the code" card\nuv run python xor.py\nLR=0.1 uv run python xor.py', lang: 'Shell',
      items: ['`uv run python xor.py` printed `step    0  loss 0.6912` and ended near `0.0106`.', 'The predictions were close to `[0 1 1 0]`.', '`loss.png` shows a curve that drops fast, then flattens.', 'With `LR=0.1` the final loss was still about 0.48.'] },
    { t: 'quiz', q: 'You delete the hidden layer, so the inputs feed one sigmoid directly. You train for a long time on [[XOR]]. What happens?',
      options: ['The loss stalls near 0.693 and every prediction drifts to about 0.5', 'It learns XOR, just more slowly', 'It learns XOR faster, because there are fewer weights', 'The code crashes with a shape error'], answer: 0,
      why: 'One sigmoid draws one straight line. No line splits XOR, so the best it can do is 0.5 everywhere. That costs \\( \\log 2 \\approx 0.693 \\) per row.',
      whyNot: { 1: 'More steps cannot fix a model that is too simple. This is [[underfitting]], not slowness.', 2: 'Fewer weights means less power. Speed does not matter when no solution exists.', 3: 'A 4 × 2 input times a 2 × 1 weight is valid. The shapes are fine; the model is the problem.' } },
    { t: 'recap', points: ['A hidden layer plus a nonlinear [[activation function]] lets a net bend its decision boundary. That is how it solves [[XOR]].', 'Forward: \\( h = \\sigma(xW_1 + b_1) \\), \\( p = \\sigma(hW_2 + b_2) \\). Loss: [[binary cross-entropy|BCE]].', 'Backward: the output error is \\( p - y \\). The [[chain rule]] multiplies by \\( W_2 \\) and \\( h(1-h) \\) on the way back.', 'Learning rate 1.0 works; 0.1 crawls; 30 overshoots and gets stuck.'],
      cheat: [['uv add numpy matplotlib', 'Install packages into the project'], ['uv run python xor.py', 'Train for 1,000 steps'], ['dz2 = (p - y) / len(X)', 'Output gradient for sigmoid + BCE'], ['dz1 = (dz2 @ W2.T) * h * (1 - h)', 'Chain rule through a sigmoid layer']] }
  ]
};

// ---------- Lesson 2: spam ----------
const M5_spam = {
  id: 'mlcap-spam', title: 'Step 2: A scikit-learn spam classifier', mins: 8, needs: 'mlcap-xor',
  goal: 'train a TF-IDF + logistic regression spam filter on 5,572 real texts, read its confusion matrix, and move the threshold on purpose.',
  cards: [
    { t: 'read', h: 'A spam filter that is 86.6% accurate and useless',
      body: 'The SMS Spam Collection has 5,572 real text messages. 747 are spam (13.4%). A "model" that always says "not spam" is right 86.6% of the time. It also catches zero spam.\n\nSo in this step you measure with a [[confusion matrix]], [[precision]] and [[recall]]. Then you move the [[threshold]] and watch the trade-off happen.\n\nThe model is classic: [[TF-IDF]] word weights feeding [[logistic regression]]. It trains in under a second.',
      analogy: 'Accuracy is like a smoke alarm that never beeps. It is right on most days, and useless on the one day that matters.' },
    { t: 'viz', h: 'From raw texts to a tuned threshold', body: 'All numbers come from one real run with `random_state=42`.',
      nodes: {
        csv: { x: 100, y: 190, label: 'SMS data', sub: '5,572 texts', kind: 'n' },
        tfidf: { x: 330, y: 65, label: 'TF-IDF', sub: 'words → weights', kind: 'c' },
        lr: { x: 330, y: 190, label: 'LogReg', sub: 'P(spam)', kind: 'b' },
        cm: { x: 600, y: 190, label: 'Metrics', sub: 'P / R / F1', kind: 'd', w: 150 },
        base: { x: 600, y: 315, label: 'Always "ham"', sub: 'baseline', kind: 'n', w: 150 }
      },
      steps: [
        { cap: '5,572 messages: 4,825 ham and 747 spam. Only 13.4% are spam, so the classes are imbalanced.', do: [['var', 'spam', '13.4%']] },
        { cap: 'A [[stratified split]] keeps 13.4% spam on both sides: 4,457 to train, 1,115 to test (149 spam).', do: [['set', 'csv', { sub: '4,457 / 1,115' }], ['var', 'test', 1115]] },
        { cap: '[[TF-IDF]] turns each text into a sparse vector. Words like "claim" and "prize" score high: common here, rare overall.', do: [['link', 'csv', 'tfidf'], ['send', 'csv', 'tfidf', 'text'], ['set', 'tfidf', { state: 'active' }]] },
        { cap: '[[logistic regression]] learns one weight per word. `class_weight="balanced"` counts each spam about 6.5× more.', do: [['link', 'tfidf', 'lr'], ['send', 'tfidf', 'lr', 'vector'], ['set', 'lr', { state: 'ok' }]] },
        { cap: 'Baseline: always say "ham". It gets 966 of 1,115 right: 86.6% accuracy, and catches 0 of 149 spam.', do: [['link', 'base', 'cm', { dash: true }], ['set', 'base', { sub: '86.6%, recall 0', state: 'bad' }]] },
        { cap: 'Threshold 0.5: TP 138, FP 7, FN 11. Precision 138/145 = 0.952, recall 138/149 = 0.926, F1 0.939.', do: [['link', 'lr', 'cm', '≥ 0.5'], ['send', 'lr', 'cm', 'P(spam)'], ['set', 'cm', { sub: 'P .952  R .926', state: 'warn' }], ['var', 'false alarms', 7]] },
        { cap: 'Threshold 0.8: TP 121, FP 0, FN 28. Precision 1.000, recall 0.812. No real text lost; 28 spams slip by.', do: [['unlink', 'lr', 'cm'], ['link', 'lr', 'cm', '≥ 0.8'], ['set', 'cm', { sub: 'P 1.0  R .812', state: 'ok' }], ['var', 'false alarms', 0]] }
      ],
      predict: { at: 4, q: 'A lazy "model" always answers "ham" on the 1,115 test texts (149 spam). What accuracy does it get?', options: ['86.6%', '50%', '13.4%', '0%'], answer: 0,
        why: 'It is right on all 966 ham texts: 966 ÷ 1,115 = 86.6%. High accuracy, zero spam caught. That is why we measure recall.' } },
    { t: 'read', h: 'Write the code: spam.py',
      body: 'Download the data: `curl -LO https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip`, then `unzip` it. You get a tab-separated file named `SMSSpamCollection`.\n\nAdd the packages with `uv add pandas scikit-learn`. Note: the file has 5,574 lines, but pandas merges a few quoted lines, giving 5,572 rows.',
      code: 'import pandas as pd\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score\n\ndf = pd.read_csv("SMSSpamCollection", sep="\\t", names=["label", "text"])\nprint(len(df), "messages,", f"{(df.label == \'spam\').mean():.1%} spam")\ny = (df.label == "spam").astype(int)              # 1 = spam, 0 = ham\n\nX_train, X_test, y_train, y_test = train_test_split(\n    df.text, y, test_size=0.2, stratify=y, random_state=42)\n\nmodel = make_pipeline(TfidfVectorizer(), LogisticRegression(class_weight="balanced"))\nmodel.fit(X_train, y_train)                       # learn from 4,457 messages\n\np_spam = model.predict_proba(X_test)[:, 1]        # P(spam) for each message\nfor t in (0.5, 0.8):\n    pred = (p_spam >= t).astype(int)\n    tn, fp, fn, tp = confusion_matrix(y_test, pred).ravel()\n    print(f"threshold {t}: TP={tp} FP={fp} FN={fn} TN={tn}  "\n          f"P={precision_score(y_test, pred):.3f} R={recall_score(y_test, pred):.3f} "\n          f"F1={f1_score(y_test, pred):.3f}")\n\nprint(model.predict_proba(["WINNER! Claim your free prize now, call 0800"])[:, 1])', lang: 'Python' },
    { t: 'play', kind: 'controls', h: 'Rehearse it: tune the threshold',
      body: 'Real test-set counts from `predict_proba`. Slide the [[threshold]] and watch the confusion matrix.',
      controls: [{ id: 't', type: 'range', label: 'Threshold', min: 0.05, max: 0.95, step: 0.05, value: 0.5 }],
      presets: [{ label: 'Strict 0.9', v: { t: 0.9 } }, { label: 'Default 0.5', v: { t: 0.5 } }],
      view: s => {
        const r = M5_spamAt(s.v.t);
        return {
          nodes: {
            colA: { x: 330, y: 50, label: 'Flagged spam', shape: 'text', w: 150 },
            colB: { x: 560, y: 50, label: 'Passed as ham', shape: 'text', w: 150 },
            rowA: { x: 115, y: 140, label: 'Real spam (149)', shape: 'text', w: 150 },
            rowB: { x: 115, y: 280, label: 'Real ham (966)', shape: 'text', w: 150 },
            tp: { x: 330, y: 140, label: 'TP = ' + r.tp, sub: 'spam caught', kind: 'c', w: 160, state: 'ok' },
            fn: { x: 560, y: 140, label: 'FN = ' + r.fn, sub: 'spam missed', kind: 'd', w: 160, state: r.fn > 20 ? 'warn' : undefined },
            fp: { x: 330, y: 280, label: 'FP = ' + r.fp, sub: 'real texts lost', kind: 'e', w: 160, state: r.fp ? 'bad' : 'ok' },
            tn: { x: 560, y: 280, label: 'TN = ' + r.tn, sub: 'real texts passed', kind: 'c', w: 160 }
          },
          vars: { threshold: r.th, precision: r.P.toFixed(3), recall: r.R.toFixed(3), F1: r.F.toFixed(3) }
        };
      },
      readout: s => { const r = M5_spamAt(s.v.t); return [['Precision', r.P.toFixed(3)], ['Recall', r.R.toFixed(3)], ['F1', r.F.toFixed(3)], ['Accuracy', (r.acc * 100).toFixed(1) + '%']]; },
      goals: [
        { text: 'Lose zero real texts (FP = 0) with recall ≥ 0.8', check: s => { const r = M5_spamAt(s.v.t); return r.fp === 0 && r.R >= 0.8; }, solve: [{ t: 0.8 }] },
        { text: 'Reach recall ≥ 0.95 and count the false alarms', check: s => M5_spamAt(s.v.t).R >= 0.95, solve: [{ t: 0.4 }] },
        { text: 'Push recall to 1.0 and see the cost', check: s => M5_spamAt(s.v.t).R === 1, solve: [{ t: 0.05 }] }
      ],
      hints: ['Raising the threshold makes the model pickier, so FP falls.', 'FP first hits 0 at 0.80. For recall ≥ 0.95, go lower.', 'At 0.40 recall is 0.960 with 22 false alarms. Only 0.05 catches all 149.'],
      done: 'Recall 100% costs 775 false alarms. Choose the threshold from the cost of each mistake, not from the default 0.5.' },
    { t: 'check', h: 'Make it real: train the filter yourself',
      body: 'The split is seeded, so your numbers should match these exactly.', code: 'uv add pandas scikit-learn\ncurl -LO https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip\nunzip sms+spam+collection.zip\nuv run python spam.py', lang: 'Shell',
      items: ['The script printed `5572 messages, 13.4% spam`.', 'At threshold 0.5 I saw `TP=138 FP=7 FN=11 TN=959`.', 'At threshold 0.8 the false positives dropped to 0 and recall fell to 0.812.', 'The "WINNER! Claim your free prize" text scored about 0.99.'] },
    { t: 'quiz', kind: 'fill', q: 'At threshold 0.5 the filter has TP = 138 and FP = 7. What is its [[precision]]? Give 3 decimals.', pre: 'precision =', answer: ['0.952', '.952', '95.2%'], placeholder: '0.???',
      why: 'Precision = TP ÷ (TP + FP) = 138 ÷ 145 = 0.952. Of everything flagged as spam, 95.2% really was spam.', hints: ['Precision asks: of the texts I flagged, how many were really spam?', 'Divide 138 by (138 + 7).'] },
    { t: 'recap', points: ['On imbalanced data, accuracy lies: "always ham" scores 86.6% and catches nothing.', '[[TF-IDF]] + [[logistic regression]] is a strong, fast text baseline: F1 0.939 at threshold 0.5.', '`predict_proba` gives scores; the [[threshold]] is your product decision.', 'Raising 0.5 → 0.8 took false alarms from 7 to 0 and recall from 0.926 to 0.812.'],
      cheat: [['train_test_split(..., stratify=y, random_state=42)', 'Same class ratio in train and test, repeatable'], ['make_pipeline(TfidfVectorizer(), LogisticRegression())', 'Text → vector → probability'], ['model.predict_proba(X)[:, 1] >= t', 'Apply your own threshold'], ['P = TP/(TP+FP), R = TP/(TP+FN)', 'Precision and recall']] }
  ]
};

// ---------- Lesson 3: embeddings ----------
const M5_embed = {
  id: 'mlcap-embed', title: 'Step 3: Inside a Transformer with Hugging Face', mins: 9, needs: 'mlcap-spam',
  goal: 'tokenize text, run an encoder forward pass, mean-pool the hidden states into an embedding, and check it against sentence-transformers.',
  cards: [
    { t: 'read', h: 'You have called embed() a hundred times. What is inside?',
      body: 'In RAG you call an [[embedding]] API and get back numbers. In this step you make those numbers yourself, one stage at a time.\n\nYou load `sentence-transformers/all-MiniLM-L6-v2` with plain `transformers`. You read the [[token]] ids, run the model, and average its [[hidden state|hidden states]]. Then you prove your vectors match the library exactly.\n\nNo magic left: text → ids → vectors per token → one vector per sentence.',
      analogy: 'Like reading the source of a library you only used through its API. Same result, but now you know which line does what.' },
    { t: 'viz', h: 'Text to embedding, stage by stage', body: 'Real output for a batch of three sentences.',
      nodes: {
        txt: { x: 110, y: 65, label: 'Sentences', sub: '3 in a batch', kind: 'n', w: 150 },
        tok: { x: 360, y: 65, label: 'Tokenizer', sub: 'ids + mask', kind: 'c', w: 150 },
        hf: { x: 610, y: 65, label: 'HF encoder', sub: 'MiniLM, 6 layers', kind: 'c', w: 160 },
        hid: { x: 610, y: 210, label: 'Hidden states', sub: '3 × 9 × 384', kind: 'b', w: 160 },
        pool: { x: 360, y: 210, label: 'Mean pool', sub: 'skip [PAD]', kind: 'b', w: 150 },
        emb: { x: 110, y: 210, label: 'Embeddings', sub: '3 × 384', kind: 'c', w: 150 },
        cos: { x: 110, y: 330, label: 'Cosine', sub: 'emb @ emb.T', kind: 'd', shape: 'pill', w: 150 }
      },
      steps: [
        { cap: 'Three sentences: "How do I reset my password?", "I forgot my login password", "The cat sat on the mat".', do: [['set', 'txt', { state: 'active' }]] },
        { cap: 'The tokenizer gives ids `[101, 2129, 2079, 1045, 25141, 2026, 20786, 1029, 102]`. 101 is [CLS], 102 is [SEP].', do: [['link', 'txt', 'tok'], ['send', 'txt', 'tok', 'text'], ['set', 'tok', { sub: '9 ids', state: 'active' }]] },
        { cap: '"login" splits into `log` + `##in`. Shorter rows get a [PAD] (id 0), and the [[attention mask]] marks it 0.', do: [['note', 'tok', 'mask: 1 1 1 1 1 1 1 1 0'], ['set', 'tok', { sub: 'ids + mask' }]] },
        { cap: 'The forward pass runs 6 [[self-attention]] layers. Output: one 384-number vector per token, shape 3 × 9 × 384.', do: [['link', 'tok', 'hf'], ['send', 'tok', 'hf', 'ids'], ['link', 'hf', 'hid'], ['set', 'hid', { state: 'active' }]] },
        { cap: '[[mean pooling|Mean pool]]: sum the token vectors where mask = 1, then divide by 8. The [PAD] vector is left out.', do: [['link', 'hid', 'pool'], ['send', 'hid', 'pool', '9 vectors'], ['set', 'pool', { state: 'ok' }]] },
        { cap: 'Normalize each vector to length 1. Now a plain dot product equals [[cosine similarity]].', do: [['link', 'pool', 'emb'], ['send', 'pool', 'emb', 'mean'], ['set', 'emb', { sub: 'length 1', state: 'ok' }]] },
        { cap: 'Cosine: reset vs forgot login = 0.784. Reset vs cat = 0.086. Same meaning, different words, still close.', do: [['link', 'emb', 'cos'], ['set', 'cos', { sub: '0.784 vs 0.086', state: 'ok' }], ['var', 'similar', 0.784], ['var', 'unrelated', 0.086]] },
        { cap: '`SentenceTransformer(name).encode(..., normalize_embeddings=True)` gives the same vectors: `allclose` prints True.', do: [['note', 'emb', 'matches sentence-transformers: True'], ['var', 'match', 'True']] }
      ],
      predict: { at: 4, q: '"I forgot my login password" has 8 real tokens plus 1 [PAD]. To mean-pool its 9 token vectors, you divide the masked sum by…', options: ['8', '9', '384'], answer: 0,
        why: 'Only real tokens count. `mask.sum(1)` is 8 for this row, so the [PAD] vector never dilutes the average.' } },
    { t: 'read', h: 'Write the code: embed.py',
      body: 'Install with `uv add torch transformers sentence-transformers`. The first run downloads the 90 MB model.\n\nThe key lines are the three after the forward pass: expand the mask, sum, divide.',
      code: 'import torch\nimport torch.nn.functional as F\nfrom transformers import AutoTokenizer, AutoModel\nfrom sentence_transformers import SentenceTransformer\n\nname = "sentence-transformers/all-MiniLM-L6-v2"\ntok = AutoTokenizer.from_pretrained(name)\nmodel = AutoModel.from_pretrained(name).eval()\n\nsentences = ["How do I reset my password?",\n             "I forgot my login password",\n             "The cat sat on the mat"]\nbatch = tok(sentences, padding=True, return_tensors="pt")\nprint(batch["input_ids"][0].tolist())\nprint(tok.convert_ids_to_tokens(batch["input_ids"][1]))\n\nwith torch.no_grad():\n    hidden = model(**batch).last_hidden_state     # B x S x 384\nprint(hidden.shape)\n\nmask = batch["attention_mask"].unsqueeze(-1).float()  # B x S x 1\nemb = (hidden * mask).sum(1) / mask.sum(1)            # mean pool, skip padding\nemb = F.normalize(emb, dim=1)                         # length 1\nprint((emb @ emb.T).round(decimals=3))                # cosine matrix\n\nref = SentenceTransformer(name).encode(sentences, normalize_embeddings=True)\nprint("matches sentence-transformers:",\n      torch.allclose(emb, torch.from_numpy(ref), atol=1e-5))', lang: 'Python' },
    { t: 'play', kind: 'controls', h: 'Rehearse it: compare sentences',
      body: 'Real cosine scores from MiniLM. Pick two sentences and a pooling method.',
      controls: [
        { id: 'a', type: 'select', label: 'Sentence A', options: M5_SENT },
        { id: 'b', type: 'select', label: 'Sentence B', options: M5_SENT },
        { id: 'pool', type: 'select', label: 'Pooling', options: M5_POOL }
      ],
      view: s => {
        const c = M5_cos(s.v), same = s.v.a === s.v.b;
        return {
          nodes: {
            A: { x: 165, y: 90, label: s.v.a, sub: M5_TOKS[M5_SENT.indexOf(s.v.a)] + ' tokens', kind: 'n', w: 290 },
            B: { x: 165, y: 290, label: s.v.b, sub: M5_TOKS[M5_SENT.indexOf(s.v.b)] + ' tokens', kind: 'n', w: 290 },
            pool: { x: 450, y: 190, label: 'Pooling', sub: s.v.pool, kind: 'b', w: 160, state: s.v.pool === '[CLS] only' ? 'warn' : undefined },
            cos: { x: 680, y: 190, label: c.toFixed(3), sub: 'cosine', shape: 'circle', w: 100, kind: 'd', state: same ? undefined : c > 0.6 ? 'ok' : c < 0.1 ? 'off' : undefined }
          },
          edges: [['A', 'pool'], ['B', 'pool'], ['pool', 'cos']],
          vars: { cosine: c.toFixed(3), pooling: s.v.pool }
        };
      },
      readout: s => [['Cosine', M5_cos(s.v).toFixed(3)], ['Tokens A', M5_TOKS[M5_SENT.indexOf(s.v.a)]], ['Tokens B', M5_TOKS[M5_SENT.indexOf(s.v.b)]]],
      goals: [
        { text: 'Find two different sentences with cosine above 0.6', check: s => s.v.a !== s.v.b && M5_cos(s.v) > 0.6 && s.v.pool === 'mean (masked)', solve: [{ a: M5_SENT[0], b: M5_SENT[1] }] },
        { text: 'Find a pair below 0.1 with masked mean pooling', check: s => s.v.a !== s.v.b && s.v.pool === 'mean (masked)' && M5_cos(s.v) < 0.1, solve: [{ a: M5_SENT[0], b: M5_SENT[2] }] },
        { text: 'Break it: switch to `[CLS] only` and watch the cat sentence look similar to a password question', check: s => s.v.pool === '[CLS] only' && [s.v.a, s.v.b].includes(M5_SENT[2]) && s.v.a !== s.v.b && M5_cos(s.v) > 0.5, solve: [{ a: M5_SENT[0], b: M5_SENT[2], pool: '[CLS] only' }] }
      ],
      hints: ['Paraphrases score high. Try the two password sentences.', 'Pair a password sentence with the cat sentence.', 'Keep the cat pair and change Pooling to `[CLS] only`: 0.086 becomes 0.650.'],
      done: 'This model was trained with mean pooling. Use its [CLS] vector instead, and every pair looks alike (0.55 to 0.91). Match the pooling to the model.' },
    { t: 'check', h: 'Make it real: run the encoder yourself',
      body: 'CPU is fine. The model is small.', code: 'uv add torch transformers sentence-transformers\nuv run python embed.py', lang: 'Shell',
      items: ['The first ids printed were `[101, 2129, 2079, 1045, 25141, 2026, 20786, 1029, 102]`.', 'The tokens for sentence 2 include `log` and `##in`, and end with `[PAD]`.', '`hidden.shape` printed `torch.Size([3, 9, 384])`.', 'The cosine matrix shows about 0.784 for the two password sentences, and it says `matches sentence-transformers: True`.'] },
    { t: 'quiz', kind: 'multi', q: 'Which of these change the [[embedding]] you get for "I forgot my login password" in a padded batch?',
      options: ['Dividing by 9 (all positions) instead of 8 (real tokens)', 'Using the [CLS] vector instead of the mean', 'Putting it in a batch with longer sentences, when the mean uses the mask', 'Skipping `F.normalize` (for the cosine score)'], answer: [0, 1],
      why: 'Averaging in [PAD] vectors or switching to [CLS] changes the vector itself. With the mask, padding has no effect. Cosine divides by both lengths anyway, so normalizing first does not change the score.',
      whyNot: { 2: 'The [[attention mask]] stops real tokens from attending to padding, and the masked mean ignores it. So batch-mates do not change this sentence.', 3: 'Cosine already divides by the lengths. Normalizing first just lets a plain dot product give the same number.' } },
    { t: 'recap', points: ['A tokenizer turns text into ids plus an [[attention mask]]; words can split into pieces like `log` + `##in`.', 'The encoder returns one [[hidden state]] per token: shape batch × tokens × 384.', '[[mean pooling|Mean pooling]] with the mask gives one 384-number vector per sentence.', 'After normalizing, a dot product is the [[cosine similarity]]: 0.784 for paraphrases, 0.086 for unrelated text.'],
      cheat: [['tok(texts, padding=True, return_tensors="pt")', 'Ids and attention mask as tensors'], ['model(**batch).last_hidden_state', 'Per-token vectors, B × S × 384'], ['(h * m).sum(1) / m.sum(1)', 'Masked mean pooling'], ['F.normalize(emb, dim=1) @ ... .T', 'Cosine similarity matrix']] }
  ]
};

// ---------- Lesson 4: LoRA ----------
const M5_lora = {
  id: 'mlcap-lora', title: 'Step 4: A LoRA fine-tune on Colab', mins: 9, needs: 'mlcap-embed',
  goal: 'build a 500-row ticket dataset, apply the chat template, train a rank-16 LoRA adapter on Qwen2.5-1.5B-Instruct, and run it.',
  cards: [
    { t: 'read', h: 'Your prompt works 9 times in 10. Your API needs 10 in 10.',
      body: 'Your app turns support tickets into a JSON payload for an internal API. A prompted model mostly works, but it adds chatter, renames keys, or invents categories.\n\nIn this step you teach a small model the exact format with [[LoRA]]. You need 500 example pairs and a free [[Colab]] GPU. You train about 1% of the weights in roughly ten minutes.\n\nWrite 500 rows to `tickets.jsonl` (an LLM can draft them; you review them). Keep 50 more aside in `eval.jsonl` for step 5.',
      code: '{"ticket": "I was charged twice for March, please refund", "json": {"category": "billing", "priority": "high", "summary": "Double charge on March invoice"}}', lang: 'JSON' },
    { t: 'viz', h: 'What LoRA training actually touches', body: 'Qwen2.5-1.5B: 28 blocks, hidden size 1,536, MLP size 8,960.',
      nodes: {
        ds: { x: 110, y: 65, label: 'tickets.jsonl', sub: '500 pairs', kind: 'n', w: 140 },
        tpl: { x: 360, y: 65, label: 'Chat template', sub: 'ChatML', kind: 'c', w: 150 },
        base: { x: 360, y: 210, label: 'Qwen2.5-1.5B', sub: 'frozen, 4-bit', kind: 'n', w: 160 },
        lora: { x: 620, y: 210, label: 'LoRA A, B', sub: 'r = 16', kind: 'e', w: 150 },
        loss: { x: 110, y: 210, label: 'Loss', sub: 'next token', kind: 'd', shape: 'pill', w: 140 },
        adapter: { x: 620, y: 330, label: 'ticket-lora/', sub: 'adapter only', kind: 'e', w: 150 }
      },
      steps: [
        { cap: 'One row: a ticket and the exact JSON you want back.', do: [['set', 'ds', { state: 'active' }]] },
        { cap: 'The [[chat template]] wraps it in ChatML role markers: system, then user (the ticket), then assistant (the JSON).', do: [['link', 'ds', 'tpl'], ['send', 'ds', 'tpl', 'row'], ['set', 'tpl', { state: 'ok' }]] },
        { cap: 'The base loads in 4-bit and is frozen: its 1.54 billion weights never change. 4-bit base + LoRA is [[QLoRA]].', do: [['link', 'tpl', 'base'], ['set', 'base', { state: 'off' }]] },
        { cap: 'LoRA adds \\( \\Delta W = BA \\) beside 7 linear layers per block. For `q_proj`: \\( 16 \\times (1536 + 1536) = 49{,}152 \\).', do: [['link', 'base', 'lora', { dash: true, label: '+ BA' }], ['set', 'lora', { state: 'active' }]] },
        { cap: 'All 7 layers: 659,456 per block × 28 blocks = 18,464,768 trainable numbers. That is 1.18% of the model.', do: [['set', 'lora', { sub: '18.5M params', state: 'ok' }], ['var', 'trainable', '1.18%']] },
        { cap: 'Training: [[cross-entropy]] on next tokens. Gradients flow through the frozen base but update only A and B.', do: [['link', 'lora', 'loss', { bend: 60 }], ['send', 'base', 'loss', 'logits'], ['send', 'loss', 'lora', 'grad', 'warn']] },
        { cap: '`save_pretrained` writes only the [[adapter]]: 18.5M numbers, tens of MB, not the 3 GB base.', do: [['link', 'lora', 'adapter'], ['set', 'adapter', { state: 'ok' }], ['var', 'saved', 'adapter']] }
      ],
      predict: { at: 4, q: 'Rank 16 on 7 linear layers in each of 28 blocks. Roughly how many weights does LoRA train?', options: ['About 18.5 million (1.2%)', 'All 1.54 billion (100%)', 'About 150 million (10%)'], answer: 0,
        why: 'Per block: q, o add 49,152 each; k, v add 28,672 each; gate, up, down add 167,936 each. Sum 659,456 × 28 = 18,464,768.' } },
    { t: 'read', h: 'Write the code: train.py on Colab',
      body: 'In Colab pick **Runtime → Change runtime type → T4 GPU**. Upload `tickets.jsonl` and `train.py`, then run `!pip install unsloth` and `!python train.py`.\n\nUnsloth wraps [[PEFT]] and TRL to fit the T4. The `to_text` function applies Qwen\'s [[chat template]].',
      code: 'import json\nfrom unsloth import FastLanguageModel\nfrom datasets import load_dataset\nfrom trl import SFTTrainer, SFTConfig\n\nSYSTEM = "Convert the support ticket to JSON with keys category, priority, summary."\nmodel, tokenizer = FastLanguageModel.from_pretrained(\n    "unsloth/Qwen2.5-1.5B-Instruct", max_seq_length=1024, load_in_4bit=True)\nmodel = FastLanguageModel.get_peft_model(\n    model, r=16, lora_alpha=16, lora_dropout=0,\n    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",\n                    "gate_proj", "up_proj", "down_proj"])\n\ndef to_text(row):  # one row -> one chat, rendered with Qwen\'s template\n    msgs = [{"role": "system", "content": SYSTEM},\n            {"role": "user", "content": row["ticket"]},\n            {"role": "assistant", "content": json.dumps(row["json"])}]\n    return {"text": tokenizer.apply_chat_template(msgs, tokenize=False)}\n\nds = load_dataset("json", data_files="tickets.jsonl")["train"].map(to_text)\ntrainer = SFTTrainer(model=model, tokenizer=tokenizer, train_dataset=ds,\n    args=SFTConfig(dataset_text_field="text", per_device_train_batch_size=8,\n                   num_train_epochs=2, learning_rate=2e-4, logging_steps=10,\n                   optim="adamw_8bit", output_dir="out", report_to="none"))\ntrainer.train()\nmodel.save_pretrained("ticket-lora"); tokenizer.save_pretrained("ticket-lora")\n\nFastLanguageModel.for_inference(model)\nmsgs = [{"role": "system", "content": SYSTEM},\n        {"role": "user", "content": "App crashes every time I upload a photo"}]\ninputs = tokenizer.apply_chat_template(msgs, add_generation_prompt=True,\n    return_tensors="pt", return_dict=True).to("cuda")\nout = model.generate(**inputs, max_new_tokens=100, do_sample=False)\nprint(tokenizer.decode(out[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True))', lang: 'Python' },
    { t: 'play', kind: 'terminal', h: 'Rehearse it: a Colab session',
      body: 'Cells start with `!`, as in Colab. The parameter counts are real; the loss values are a sample run.',
      prompt: 'colab>',
      welcome: 'Runtime: T4 GPU. Files uploaded: tickets.jsonl, train.py',
      init: () => ({ gpu: false, pip: false, trained: false, listed: false }),
      cmds: [
        { re: /^!?nvidia-smi$/i, help: '!nvidia-smi', desc: 'show the GPU', run: (m, s) => { s.gpu = true; return '| NVIDIA-SMI 550.54     Driver Version: 550.54     CUDA Version: 12.4 |\n|   0  Tesla T4      Off |  0MiB / 15360MiB |  0%  Default |'; } },
        { re: /^!?pip\s+install\s+(?:-q\s+)?unsloth$/i, help: '!pip install unsloth', desc: 'install Unsloth (brings peft, trl, bitsandbytes)', run: (m, s) => { s.pip = true; return 'Successfully installed bitsandbytes peft trl unsloth unsloth_zoo xformers'; } },
        { re: /^!?wc\s+-l\s+tickets\.jsonl$/i, help: '!wc -l tickets.jsonl', desc: 'count the rows', run: () => '500 tickets.jsonl' },
        { re: /^!?head\s+(?:-n\s*)?1?\s*tickets\.jsonl$/i, help: '!head -n 1 tickets.jsonl', desc: 'show the first row', run: () => '{"ticket": "I was charged twice for March, please refund", "json": {"category": "billing", "priority": "high", "summary": "Double charge on March invoice"}}' },
        { re: /^!?python3?\s+train\.py$/i, help: '!python train.py', desc: 'train the adapter and test it', run(m, s, io) {
          if (!s.pip) return { err: 'Traceback (most recent call last):\n  File "train.py", line 2, in <module>\n    from unsloth import FastLanguageModel\nModuleNotFoundError: No module named \'unsloth\'' };
          s.trained = true; io.send('ds', 'base', 'rows'); io.send('base', 'lora', 'grads', 'warn');
          return 'Unsloth: Tesla T4, 14.7 GB. Loading Qwen2.5-1.5B-Instruct in 4-bit.\nTrainable parameters = 18,464,768 of 1,562,179,072 (1.18% trained)\nMap: 100% 500/500\nStep  Training Loss\n  10  1.8421\n  30  0.3127\n  60  0.1194\n  90  0.0816\n 120  0.0703\n{\'train_runtime\': 412.6, \'epoch\': 2.0}\n{"category": "bug", "priority": "high", "summary": "App crashes on photo upload"}';
        } },
        { re: /^!?ls\s+ticket-lora\/?$/i, help: '!ls ticket-lora', desc: 'see what was saved', run: (m, s) => {
          if (!s.trained) return { err: "ls: cannot access 'ticket-lora': No such file or directory" };
          s.listed = true; return 'README.md  adapter_config.json  adapter_model.safetensors  chat_template.jinja\nmerges.txt  special_tokens_map.json  tokenizer.json  tokenizer_config.json  vocab.json';
        } }
      ],
      view: s => ({
        nodes: {
          gpu: { x: 110, y: 65, label: 'Tesla T4', sub: s.gpu ? '15 GB VRAM' : 'not checked', kind: 'n', w: 140, state: s.gpu ? 'ok' : undefined },
          ds: { x: 110, y: 210, label: 'tickets.jsonl', sub: '500 pairs', kind: 'n', w: 140 },
          base: { x: 360, y: 210, label: 'Qwen2.5-1.5B', sub: s.pip ? 'frozen, 4-bit' : 'needs unsloth', kind: 'n', w: 160, state: s.pip ? 'off' : 'warn' },
          lora: { x: 620, y: 210, label: 'LoRA adapter', sub: s.trained ? 'r = 16, 1.18%' : 'untrained', kind: 'e', w: 160, state: s.trained ? 'ok' : undefined },
          out: { x: 620, y: 330, label: 'ticket-lora/', sub: s.listed ? 'adapter files' : s.trained ? 'saved' : '—', kind: 'e', w: 160, state: s.listed ? 'ok' : undefined }
        },
        edges: [['gpu', 'base', { dash: true }], ['ds', 'base', 'SFT'], ['base', 'lora'], ['lora', 'out']],
        vars: { trainable: s.trained ? '18,464,768' : '-', 'final loss': s.trained ? '0.0703' : '-' }
      }),
      goals: [
        { text: 'Confirm Colab gave you a GPU with `!nvidia-smi`', check: s => s.gpu, solve: ['!nvidia-smi'] },
        { text: 'Install Unsloth and train: read the trainable-parameter line', check: s => s.trained, solve: ['!pip install unsloth', '!python train.py'] },
        { text: 'List `ticket-lora` and find the adapter weights file', check: s => s.listed, solve: ['!ls ticket-lora'] }
      ],
      hints: ['`!nvidia-smi` shows the GPU. No GPU? Change the runtime type.', 'Install first with `!pip install unsloth`, then `!python train.py`.', 'Run `!ls ticket-lora`. The weights live in `adapter_model.safetensors`.'],
      try: ['!nvidia-smi', '!pip install unsloth', '!head -n 1 tickets.jsonl', '!python train.py', '!ls ticket-lora'],
      done: 'The adapter holds 18.5M numbers. The 1.54B base is untouched, so you can keep many adapters for one base.' },
    { t: 'check', h: 'Make it real: train on a free GPU',
      body: 'Download `ticket-lora/` as a zip before the Colab session ends.', code: '# Colab cells\n!nvidia-smi\n!pip install unsloth\n!python train.py\n!zip -r ticket-lora.zip ticket-lora', lang: 'Shell',
      items: ['`tickets.jsonl` has 500 reviewed rows, and `eval.jsonl` has 50 different ones.', 'Training printed `Trainable parameters = 18,464,768` and the loss fell.', 'The test ticket came back as JSON with keys category, priority and summary.', 'I downloaded `ticket-lora/` to my machine.'] },
    { t: 'quiz', q: 'You trained with the system prompt and [[chat template]]. In production you send the raw ticket text with no template. What is most likely?',
      options: ['Output gets worse: the model never saw that format in training', 'Nothing changes: the adapter learned the task, not the format', 'It errors: LoRA models reject untemplated input', 'Output improves: fewer tokens means less confusion'], answer: 0,
      why: '[[fine-tuning|Fine-tuning]] teaches a pattern that includes the exact wrapper. Serve with the same template and system prompt you trained on.',
      whyNot: { 1: 'The model learned "after this exact prefix, write this JSON". Remove the prefix and the cue is gone.', 2: 'Any text is valid input. Nothing crashes; quality just drops quietly.', 3: 'The missing template removes the cue that triggers the trained behaviour.' } },
    { t: 'recap', points: ['500 clean example pairs are enough to teach a strict output format.', 'The [[chat template]] is part of the training data. Use the same one at inference.', '[[LoRA]] r = 16 on 7 layers × 28 blocks trains 18,464,768 numbers: 1.18%.', 'A 4-bit frozen base plus LoRA ([[QLoRA]]) fits a free T4. You save only the [[adapter]].'],
      cheat: [['FastLanguageModel.get_peft_model(model, r=16, ...)', 'Attach LoRA adapters'], ['tokenizer.apply_chat_template(msgs, tokenize=False)', 'Render a chat as training text'], ['r × (d_in + d_out)', 'LoRA parameters per linear layer'], ['model.save_pretrained("ticket-lora")', 'Save the adapter only']] }
  ]
};

// ---------- Lesson 5: quantize and serve ----------
const M5_serve = {
  id: 'mlcap-serve', title: 'Step 5: Quantize and serve with Ollama', mins: 9, needs: 'mlcap-lora',
  goal: 'merge your adapter, convert it to GGUF, quantize to Q4_K_M, serve it with Ollama, and measure its valid-JSON rate.',
  cards: [
    { t: 'read', h: 'From a Colab folder to an API on localhost',
      body: 'Your adapter works on a cloud GPU. Your laptop needs one file it can run fast on a CPU or Apple chip.\n\nSo you merge the [[adapter]] into the base, convert to [[GGUF]], and [[quantization|quantize]] 16-bit weights to about 5 bits. 2.9 GB becomes about 0.9 GB. Then [[Ollama]] serves it at `localhost:11434`.\n\nLast, you prove it works with numbers. An eval script sends 50 held-out tickets and counts valid JSON.',
      analogy: 'Like a production build: merge the patches, minify the bundle, deploy it, and run the smoke tests.' },
    { t: 'viz', h: 'The serving pipeline', body: 'Sizes are for Qwen2.5-1.5B: 1.54 billion weights.',
      nodes: {
        adapter: { x: 110, y: 65, label: 'LoRA adapter', sub: 'r = 16', kind: 'e', w: 150 },
        base: { x: 110, y: 190, label: 'Base model', sub: 'fp16', kind: 'n', w: 150 },
        merged: { x: 360, y: 130, label: 'Merged', sub: 'W + BA', kind: 'b', w: 150 },
        f16: { x: 620, y: 130, label: 'GGUF f16', sub: 'one file', kind: 'e', w: 150 },
        q4: { x: 620, y: 300, label: 'GGUF Q4_K_M', sub: '4-bit blocks', kind: 'e', w: 160 },
        ollama: { x: 360, y: 300, label: 'Ollama', sub: 'localhost:11434', kind: 'a', w: 150 },
        evalj: { x: 110, y: 320, label: 'JSON eval', sub: 'valid rate', kind: 'd', w: 150 }
      },
      steps: [
        { cap: 'Start: the frozen base and your small adapter, still separate files.', do: [['set', 'adapter', { state: 'active' }]] },
        { cap: 'Merge: \\( W\' = W + \\frac{\\alpha}{r} BA \\). With \\( \\alpha = r = 16 \\) the scale is 1. The adapter disappears into W.', do: [['link', 'adapter', 'merged'], ['link', 'base', 'merged'], ['set', 'merged', { state: 'ok' }]] },
        { cap: '`convert_hf_to_gguf.py` writes one [[GGUF]] file: 1.54B weights × 2 bytes ≈ 3.1 GB (2.9 GiB).', do: [['link', 'merged', 'f16'], ['send', 'merged', 'f16', 'tensors'], ['set', 'f16', { sub: '2.9 GiB', state: 'ok' }], ['var', 'size', '2.9 GiB']] },
        { cap: '`llama-quantize … Q4_K_M` stores blocks of weights in 4 bits plus a scale, and keeps a few tensors at 6 bits.', do: [['link', 'f16', 'q4'], ['send', 'f16', 'q4', 'quantize']] },
        { cap: 'Result: 940 MiB (about 0.99 GB). That is about 5.1 bits per weight on average, a 3.1× cut.', do: [['set', 'q4', { sub: '940 MiB', state: 'ok' }], ['var', 'size', '940 MiB']] },
        { cap: 'A [[Modelfile]] adds the same ChatML template and system prompt you trained with. `ollama create` registers it.', do: [['link', 'q4', 'ollama'], ['set', 'ollama', { state: 'ok' }]] },
        { cap: '`eval.py` posts 50 held-out tickets to `/api/chat` and counts how many answers pass `json.loads`.', do: [['link', 'ollama', 'evalj', 'answers'], ['send', 'ollama', 'evalj', 'JSON'], ['set', 'evalj', { state: 'ok' }]] }
      ],
      predict: { at: 4, q: 'The f16 file is 2.9 GiB. Roughly how big is the Q4_K_M file?', options: ['About 0.9 GiB', 'Exactly 0.72 GiB (a pure 4 bits)', 'About 2.9 GiB (same size, just faster)'], answer: 0,
        why: 'Each 4-bit block also stores scales, and some tensors stay at 6 bits. The average is about 5 bits, so 940 MiB, not a pure 4-bit 0.72 GiB.' } },
    { t: 'read', h: 'Write the code: merge, convert, quantize, serve',
      body: 'Three files and a few commands. Get `llama-quantize` from `brew install llama.cpp` or a source build.\n\nThe `TEMPLATE` and `SYSTEM` must match training exactly. `temperature 0` makes answers repeatable.',
      code: '# ---- merge.py ----\nimport torch\nfrom peft import PeftModel\nfrom transformers import AutoModelForCausalLM, AutoTokenizer\n\nBASE = "Qwen/Qwen2.5-1.5B-Instruct"\nbase = AutoModelForCausalLM.from_pretrained(BASE, dtype=torch.float16)\nmodel = PeftModel.from_pretrained(base, "ticket-lora").merge_and_unload()  # W + BA\nmodel.save_pretrained("merged")\nAutoTokenizer.from_pretrained(BASE).save_pretrained("merged")\n\n# ---- Modelfile ----\nFROM ./ticket-q4_k_m.gguf\nTEMPLATE """{{ if .System }}<|im_start|>system\n{{ .System }}<|im_end|>\n{{ end }}<|im_start|>user\n{{ .Prompt }}<|im_end|>\n<|im_start|>assistant\n"""\nSYSTEM "Convert the support ticket to JSON with keys category, priority, summary."\nPARAMETER temperature 0\nPARAMETER stop "<|im_end|>"\n\n# ---- shell ----\ngit clone --depth 1 https://github.com/ggml-org/llama.cpp\nuv venv && uv pip install torch transformers peft -r llama.cpp/requirements.txt\nuv run python merge.py\nuv run python llama.cpp/convert_hf_to_gguf.py merged --outfile ticket-f16.gguf --outtype f16\nllama-quantize ticket-f16.gguf ticket-q4_k_m.gguf Q4_K_M\nollama create ticketbot -f Modelfile\nollama run ticketbot "My card was charged twice this month"', lang: 'Shell' },
    { t: 'play', kind: 'terminal', h: 'Rehearse it: ship the model',
      body: 'Run the pipeline in order. Sizes are real; answers and scores are a sample run.',
      init: () => ({ merged: false, f16: false, q4: false, created: false, ran: false, evaled: false }),
      size: [800, 290],
      welcome: 'ticket-lab/: ticket-lora/, llama.cpp/, Modelfile, eval.py, eval.jsonl (50 rows)',
      cmds: [
        { re: /^(?:uv\s+run\s+)?python3?\s+merge\.py$/i, help: 'uv run python merge.py', desc: 'merge the adapter into the base', run: (m, s, io) => { s.merged = true; io.send('adapter', 'merged', 'BA'); return 'Loading Qwen/Qwen2.5-1.5B-Instruct (fp16)\nMerged ticket-lora into the base weights\nSaved merged/ (model.safetensors, 3.09 GB)'; } },
        { re: /^(?:uv\s+run\s+)?python3?\s+(?:llama\.cpp\/)?convert_hf_to_gguf\.py\s+merged\/?(?:\s+--outfile\s+(\S+))?(?:\s+--outtype\s+(\S+))?$/i, help: 'uv run python llama.cpp/convert_hf_to_gguf.py merged --outfile ticket-f16.gguf --outtype f16', desc: 'convert to one GGUF file', run(m, s, io) {
          if (!s.merged) return { err: 'FileNotFoundError: merged/config.json not found. Run merge.py first.' };
          s.f16 = true; io.send('merged', 'f16', 'tensors');
          return 'INFO:hf-to-gguf:Loading model: merged\nINFO:hf-to-gguf:Model architecture: Qwen2ForCausalLM\nINFO:hf-to-gguf:Model successfully exported to ' + (m[1] || 'merged/Merged-1.5B-F16.gguf');
        } },
        { re: /^llama-quantize\s+(\S+)\s+(\S+)\s+(\S+)$/i, help: 'llama-quantize ticket-f16.gguf ticket-q4_k_m.gguf Q4_K_M', desc: 'quantize the weights', run(m, s, io) {
          if (!s.f16 || m[1] !== 'ticket-f16.gguf') return { err: 'llama_model_quantize: failed to open \'' + m[1] + '\': No such file or directory' };
          const t = m[3].toUpperCase(), size = { Q4_K_M: '940.37', Q8_0: '1576.15' }[t];
          if (!size) return { err: 'This lab knows Q4_K_M and Q8_0. Try Q4_K_M.' };
          if (t === 'Q4_K_M') s.q4 = true; s.qname = m[2]; io.send('f16', 'q4', t);
          return 'main: quantizing \'ticket-f16.gguf\' to \'' + m[2] + '\' as ' + t + '\nllama_model_quantize_impl: model size  =  2944.68 MB\nllama_model_quantize_impl: quant size  =  ' + size.padStart(8) + ' MB\nmain: quantize time = 21482.18 ms';
        } },
        { re: /^ls(?:\s+-\w+)*(?:\s+\*\.gguf)?$/i, help: 'ls -lh *.gguf', desc: 'compare file sizes', run: (m, s) => (s.f16 ? '-rw-r--r--  1 you  staff   2.9G ticket-f16.gguf' : '') + (s.qname ? '\n-rw-r--r--  1 you  staff   ' + (s.q4 ? '940M ' : '1.5G ') + s.qname : '') || 'ls: *.gguf: No such file or directory' },
        { re: /^ollama\s+create\s+(\S+)\s+-f\s+Modelfile$/i, help: 'ollama create ticketbot -f Modelfile', desc: 'register the model with Ollama', run(m, s, io) {
          if (!s.q4) return { err: 'Error: invalid model reference: ./ticket-q4_k_m.gguf (file not found)' };
          s.created = m[1]; io.send('q4', 'ollama', 'GGUF');
          return 'gathering model components\ncopying file sha256:4b1c… 100%\nparsing GGUF\nwriting manifest\nsuccess';
        } },
        { re: /^ollama\s+run\s+(\S+)(?:\s+(.+))?$/i, help: 'ollama run ticketbot "<ticket>"', desc: 'ask the served model', run(m, s, io) {
          if (!s.created || m[1] !== s.created) return { err: 'Error: pull model manifest: file does not exist' };
          s.ran = true; io.send('ollama', 'evalj', 'JSON', 'ok');
          return '{"category": "billing", "priority": "high", "summary": "Card charged twice this month"}';
        } },
        { re: /^(?:uv\s+run\s+)?python3?\s+eval\.py$/i, help: 'uv run python eval.py', desc: 'score 50 held-out tickets', run(m, s, io) {
          if (!s.created) return { err: 'urllib.error.HTTPError: HTTP Error 404: Not Found  (model "ticketbot" not found)' };
          s.evaled = true; io.send('ollama', 'evalj', '50 answers', 'ok');
          return 'INVALID: {"category": "account", "priority": "low", "summary": "User can\nvalid JSON  49/50 = 98%\nright keys  49/50   right category  46/50';
        } }
      ],
      view: s => ({
        nodes: {
          adapter: { x: 110, y: 65, label: 'ticket-lora', sub: 'adapter', kind: 'e', w: 150, state: s.merged ? 'ok' : undefined },
          merged: { x: 360, y: 65, label: 'merged/', sub: s.merged ? '3.09 GB fp16' : '—', kind: 'b', w: 150, state: s.merged ? 'ok' : undefined },
          f16: { x: 620, y: 65, label: 'GGUF f16', sub: s.f16 ? '2.9 GiB' : '—', kind: 'e', w: 150, state: s.f16 ? 'ok' : undefined },
          q4: { x: 620, y: 220, label: 'GGUF Q4_K_M', sub: s.q4 ? '940 MiB' : '—', kind: 'e', w: 160, state: s.q4 ? 'ok' : undefined },
          ollama: { x: 360, y: 220, label: 'Ollama', sub: s.created ? s.created : 'no model', kind: 'a', w: 150, state: s.created ? 'ok' : undefined },
          evalj: { x: 110, y: 220, label: 'JSON eval', sub: s.evaled ? '49/50 valid' : 'not run', kind: 'd', w: 150, state: s.evaled ? 'ok' : undefined }
        },
        edges: [['adapter', 'merged'], ['merged', 'f16'], ['f16', 'q4'], ['q4', 'ollama'], ['ollama', 'evalj', 'answers']],
        vars: { 'model file': s.q4 ? '940 MiB' : s.f16 ? '2.9 GiB' : '-', 'valid JSON': s.evaled ? '98%' : '-' }
      }),
      goals: [
        { text: 'Merge, convert and quantize to `Q4_K_M`', check: s => s.q4, solve: ['uv run python merge.py', 'uv run python llama.cpp/convert_hf_to_gguf.py merged --outfile ticket-f16.gguf --outtype f16', 'llama-quantize ticket-f16.gguf ticket-q4_k_m.gguf Q4_K_M'] },
        { text: 'Create `ticketbot` in Ollama and ask it about a ticket', check: s => s.ran, solve: ['ollama create ticketbot -f Modelfile', 'ollama run ticketbot "My card was charged twice this month"'] },
        { text: 'Run `eval.py` and read the valid-JSON rate', check: s => s.evaled, solve: ['uv run python eval.py'] }
      ],
      hints: ['Order matters: merge.py, then convert_hf_to_gguf.py, then llama-quantize.', 'Next: `ollama create ticketbot -f Modelfile`, then `ollama run ticketbot "…"`.', 'Finally `uv run python eval.py`.'],
      try: ['uv run python merge.py', 'ls -lh *.gguf', 'uv run python eval.py'],
      done: 'A number beats a vibe. Rerun eval.py after every change: new data, new rank, new quant type.' },
    { t: 'check', h: 'Make it real: serve it and score it',
      body: 'Save this as `eval.py`. It uses only the standard library. Do not set Ollama\'s `format: "json"`: you are testing the model, not the guard rail.',
      code: 'import json, urllib.request\n\ndef ask(ticket):  # one chat call to the local Ollama server\n    body = json.dumps({"model": "ticketbot", "stream": False,\n                       "messages": [{"role": "user", "content": ticket}]}).encode()\n    req = urllib.request.Request("http://localhost:11434/api/chat", body,\n                                 {"Content-Type": "application/json"})\n    with urllib.request.urlopen(req) as r:\n        return json.load(r)["message"]["content"]\n\nrows = [json.loads(line) for line in open("eval.jsonl")]  # 50 held-out tickets\nvalid = keys_ok = right = 0\nfor row in rows:\n    answer = ask(row["ticket"])\n    try:\n        data = json.loads(answer)\n    except json.JSONDecodeError:\n        print("INVALID:", answer[:60]); continue\n    valid += 1\n    if isinstance(data, dict) and set(data) == {"category", "priority", "summary"}:\n        keys_ok += 1\n        right += data["category"] == row["json"]["category"]\n\nn = len(rows)\nprint(f"valid JSON  {valid}/{n} = {valid / n:.0%}")\nprint(f"right keys  {keys_ok}/{n}   right category  {right}/{n}")', lang: 'Python',
      items: ['`ls -lh` shows the Q4_K_M file at about 940M, roughly a third of the f16 file.', '`ollama run ticketbot "…"` answers with bare JSON and no chatter.', '`uv run python eval.py` printed a valid-JSON rate for my 50 held-out tickets.', 'I wrote down the rate, so the next change can be compared against it.'] },
    { t: 'quiz', kind: 'order', q: 'Put the serving pipeline in order.',
      items: ['Merge the LoRA adapter into the base weights', 'Convert the merged model to a GGUF f16 file', 'Quantize it with `llama-quantize … Q4_K_M`', 'Write a Modelfile and run `ollama create`', 'Run `eval.py` against `localhost:11434`'],
      why: 'Merge first, so one set of weights exists. Convert it to GGUF, then quantize that file. Ollama serves the result, and the eval measures what users would get.' },
    { t: 'recap', points: ['Merging bakes \\( \\frac{\\alpha}{r}BA \\) into W, so serving needs no adapter code.', '[[GGUF]] f16 is 2 bytes per weight: 2.9 GiB. [[Q4_K_M]] averages about 5 bits: 940 MiB.', 'The [[Modelfile]] must reuse the training [[chat template]] and system prompt.', 'An eval script turns "seems fine" into a number like 49/50 valid JSON.'],
      cheat: [['convert_hf_to_gguf.py merged --outfile m.gguf --outtype f16', 'Hugging Face folder → GGUF'], ['llama-quantize in.gguf out.gguf Q4_K_M', '16-bit → ~5-bit weights'], ['ollama create ticketbot -f Modelfile', 'Register a local model'], ['POST localhost:11434/api/chat', 'Ollama chat endpoint']] }
  ]
};

;
// Glossary deep dives, part 1: tensors, the core maths of training, and the first classifier.
// Merged into ML_GLOSSARY by course.js. Every number here was checked with python.

const MLD1_r = (x, d = 3) => String(+(+x).toFixed(d));
const MLD1_sig = z => 1 / (1 + Math.exp(-z));
// a row of bars: vals → { id0: bar, id1: bar … }
const MLD1_bars = (p, vals, x0, dx, base, scale, w, kind, active) => Object.fromEntries(vals.map((v, i) =>
  [p + i, { x: x0 + i * dx, y: base, shape: 'bar', w, h: Math.max(2, Math.round(v * scale)), kind: kind || 'n', state: i === active ? 'active' : undefined }]));
// the bowl L(w) = (w-3)^2 used by gradient descent, learning rate and the regularization lab
const MLD1_bowl = w => (w - 3) * (w - 3);
// gradient descent figure: w 0..6 → x 100..700, bars 22 px per unit of loss, floor at y=270
const MLD1_gx = w => Math.round(100 + 100 * w), MLD1_gy = L => Math.round(270 - 22 * L - 18);
// learning-rate scenes: w -2..8 → x 100..700, 8 px per unit of loss
const MLD1_lx = w => Math.round(400 + 60 * (w - 3)), MLD1_ly = L => Math.max(14, Math.round(270 - 8 * L - 16));
const MLD1_lrBars = () => MLD1_bars('c', [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map(MLD1_bowl), 100, 60, 270, 8, 36);
const MLD1_lrDot = (i, w, st) => ({ x: Math.min(770, Math.max(30, MLD1_lx(w))), y: MLD1_ly(MLD1_bowl(w)), shape: 'circle', w: 24, label: String(i), kind: 'a', state: st });
const MLD1_axis = (pairs, y) => Object.fromEntries(pairs.map(([id, x, t]) => [id, { x, y, shape: 'text', label: t }]));
// backprop graph for L = (w x + b - y)^2 with x = 2, y = 5
const MLD1_bp = (w, b, grads) => { const z1 = w * 2, z = z1 + b, e = z - 5, L = e * e, g = 2 * e;
  return {
    x: { x: 80, y: 70, label: 'x = 2', w: 100, kind: 'a' },
    w: { x: 80, y: 200, label: 'w = ' + MLD1_r(w), w: 100, kind: 'b', sub: grads ? '∂L/∂w = ' + MLD1_r(g * 2) : 'weight' },
    mul: { x: 260, y: 135, label: grads ? 'wx = ' + MLD1_r(z1) : '×', w: 110, kind: 'n', sub: grads ? '∂L/∂(wx) = ' + MLD1_r(g) : 'multiply' },
    b: { x: 260, y: 300, label: 'b = ' + MLD1_r(b), w: 100, kind: 'b', sub: grads ? '∂L/∂b = ' + MLD1_r(g) : 'bias' },
    add: { x: 440, y: 200, label: grads ? 'z = ' + MLD1_r(z) : '+', w: 110, kind: 'n', sub: grads ? '∂L/∂z = ' + MLD1_r(g) : 'add' },
    y: { x: 610, y: 320, label: 'y = 5', w: 100, kind: 'a', sub: 'target' },
    sub: { x: 610, y: 200, label: grads ? 'e = ' + MLD1_r(e) : '−', w: 110, kind: 'n', sub: grads ? '∂L/∂e = ' + MLD1_r(g) : 'error' },
    sq: { x: 730, y: 80, label: grads ? 'L = ' + MLD1_r(L) : '( )²', w: 100, kind: 'd', sub: 'loss' } };
};
const MLD1_bpEdges = [['x', 'mul'], ['w', 'mul'], ['mul', 'add'], ['b', 'add'], ['add', 'sub'], ['y', 'sub'], ['sub', 'sq']];

const ML_DEEP_1 = {
  'tensor': {
    intuition: 'A [[tensor]] is just a nested array of numbers, like `[[1, 2], [3, 4]]` in JavaScript. The only new idea is that every level of nesting must be the same length, so the whole thing is a neat box.\n\nThe number of nesting levels is the number of dimensions. A [[scalar]] has 0, a [[vector]] 1, a [[matrix]] 2. A [[batch]] of sentences, each a list of token [[embedding|embeddings]], has 3: `(batch, tokens, features)`.\n\nThe [[shape]] lists the length of each level. Multiply those lengths and you get how many numbers the tensor holds, which tells you how much memory it needs.',
    formula: ['X \\in \\mathbb{R}^{B \\times T \\times d}', '\\text{numbers} = B \\cdot T \\cdot d', '\\text{bytes} = \\text{numbers} \\times \\text{bytes per number}'],
    symbols: [['X', 'the tensor itself'], ['\\mathbb{R}', 'the real numbers: each entry is a decimal number'], ['B', 'batch size: how many examples are processed together'], ['T', 'sequence length: how many tokens per example'], ['d', 'features per token, for example embedding size 768'], ['\\times', 'in the shape, "by": B by T by d']],
    figure: { h: 'From one number to a 3-D tensor', size: [800, 260],
      nodes: { s: { x: 80, y: 130, label: '5', sub: 'shape ()', shape: 'circle', w: 70, kind: 'a', state: 'off' },
        v: { x: 240, y: 130, label: '[1, 2, 3]', sub: 'shape (3,)', kind: 'b', state: 'off' },
        m: { x: 440, y: 130, label: '[[1,2,3],[4,5,6]]', sub: 'shape (2, 3)', w: 160, kind: 'c', state: 'off' },
        t: { x: 680, y: 130, label: '2 such grids', sub: 'shape (2, 2, 3)', w: 150, kind: 'd', state: 'off' } },
      steps: [
        { cap: 'A scalar: one number, zero dimensions. Its shape is empty: `()`.', do: [['set', 's', { state: 'active' }]] },
        { cap: 'Wrap numbers in a list: a vector. One dimension, length 3, so shape `(3,)`.', do: [['set', 's', { state: undefined }], ['set', 'v', { state: 'active' }], ['link', 's', 'v', 'list of']] },
        { cap: 'A list of equal-length lists: a matrix. 2 rows of 3, shape `(2, 3)`.', do: [['set', 'v', { state: undefined }], ['set', 'm', { state: 'active' }], ['link', 'v', 'm', 'list of']] },
        { cap: 'Stack 2 matrices: a 3-D tensor, shape `(2, 2, 3)`. It holds \\(2 \\cdot 2 \\cdot 3 = 12\\) numbers.', do: [['set', 'm', { state: undefined }], ['set', 't', { state: 'active' }], ['link', 'm', 't', 'list of'], ['var', 'numbers', 12]] },
        { cap: 'Read one entry with one index per dimension: `t[1, 0, 2]` is grid 1, row 0, column 2.', do: [['note', 't', 't[1,0,2] = 9'], ['focus', 't']] }
      ] },
    example: { given: 'A [[batch]] of 32 sentences, 128 tokens each, 768 features per token, stored as float32 (4 bytes per number).',
      steps: ['Shape: `(32, 128, 768)`, so \\(B = 32, T = 128, d = 768\\).', 'Count the numbers: \\(32 \\times 128 = 4096\\) tokens, then \\(4096 \\times 768 = 3{,}145{,}728\\) numbers.', 'Bytes: \\(3{,}145{,}728 \\times 4 = 12{,}582{,}912\\), about 12.6 MB.', 'Smaller check: shape `(2, 3, 4)` holds \\(2 \\cdot 3 \\cdot 4 = 24\\) numbers, which is 96 bytes.'],
      result: 'One activation tensor of this layer is about 12.6 MB. A model keeps many of them in memory during training.' },
    lab: { h: 'How big is this tensor?', body: 'Change the batch size, sequence length and feature size. Watch the memory grow.', size: [800, 200],
      controls: [{ id: 'B', type: 'range', label: 'Batch B', min: 1, max: 64, value: 32 }, { id: 'T', type: 'range', label: 'Tokens T', min: 16, max: 512, step: 16, value: 128 }, { id: 'd', type: 'range', label: 'Features d', min: 64, max: 1024, step: 64, value: 768 }],
      view: s => { const n = s.v.B * s.v.T * s.v.d;
        return { nodes: { b: { x: 100, y: 100, label: 'B = ' + s.v.B, kind: 'a' }, t: { x: 260, y: 100, label: 'T = ' + s.v.T, kind: 'b' }, d: { x: 420, y: 100, label: 'd = ' + s.v.d, kind: 'c' },
          n: { x: 650, y: 100, label: n.toLocaleString('en-US') + ' numbers', sub: MLD1_r(n * 4 / 1e6, 1) + ' MB as float32', w: 230, kind: 'd', state: n * 4 > 50e6 ? 'warn' : 'ok' } },
          edges: [['b', 't', '×'], ['t', 'd', '×'], ['d', 'n', '=']] }; },
      readout: s => { const n = s.v.B * s.v.T * s.v.d; return [['shape', '(' + s.v.B + ', ' + s.v.T + ', ' + s.v.d + ')'], ['numbers', n.toLocaleString('en-US')], ['float32', MLD1_r(n * 4 / 1e6, 2) + ' MB'], ['float16', MLD1_r(n * 2 / 1e6, 2) + ' MB']]; } },
    pitfalls: ['Shape `(3,)` and shape `(3, 1)` are different. One is a flat list, the other a column. Mixing them triggers surprise [[broadcasting]].', 'The order of dimensions matters. PyTorch images are `(B, C, H, W)`, but many libraries load `(H, W, C)`.', 'Memory is shape × bytes per number. Halving precision (float16) halves memory; doubling the batch doubles it.'],
    code: 'import numpy as np\n\nx = np.zeros((32, 128, 768), dtype=np.float32)\nprint(x.shape)    # (32, 128, 768)\nprint(x.size)     # 3145728 numbers\nprint(x.nbytes)   # 12582912 bytes\n\nt = np.arange(1, 13).reshape(2, 2, 3)\nprint(t[1, 0, 2]) # 9',
    lang: 'Python'
  },

  'dot product': {
    intuition: 'Take two lists of the same length. Multiply them pair by pair, then add everything up. That single number is the [[dot product]].\n\nIt measures agreement. When big entries line up with big entries of the same sign, the sum is large and positive. When they disagree in sign, terms cancel or go negative.\n\nEvery [[neuron]] computes one: its inputs dotted with its [[weights]]. Search uses it too, to score how close two [[embedding|embeddings]] are.',
    formula: ['\\mathbf{a} \\cdot \\mathbf{b} = \\sum_{i=1}^{n} a_i b_i = a_1 b_1 + a_2 b_2 + \\cdots + a_n b_n', '\\mathbf{a} \\cdot \\mathbf{b} = \\lVert \\mathbf{a} \\rVert \\, \\lVert \\mathbf{b} \\rVert \\cos \\theta'],
    symbols: [['\\mathbf{a}, \\mathbf{b}', 'two vectors with the same length n'], ['a_i', 'the i-th entry of a'], ['\\sum_{i=1}^{n}', 'add up the terms for i = 1, 2, …, n'], ['\\lVert \\mathbf{a} \\rVert', 'the length of a: the square root of the sum of its squared entries'], ['\\theta', 'the angle between the two arrows'], ['\\cos \\theta', '1 when they point the same way, 0 at a right angle, −1 when opposite']],
    figure: { h: 'Multiply pairs, then add', size: [800, 300],
      nodes: { a1: { x: 90, y: 60, label: '1', w: 60, kind: 'a' }, a2: { x: 90, y: 150, label: '2', w: 60, kind: 'a' }, a3: { x: 90, y: 240, label: '3', w: 60, kind: 'a' },
        b1: { x: 220, y: 60, label: '4', w: 60, kind: 'b' }, b2: { x: 220, y: 150, label: '−5', w: 60, kind: 'b' }, b3: { x: 220, y: 240, label: '6', w: 60, kind: 'b' },
        p1: { x: 430, y: 60, label: '?', w: 130, kind: 'n', state: 'off' }, p2: { x: 430, y: 150, label: '?', w: 130, kind: 'n', state: 'off' }, p3: { x: 430, y: 240, label: '?', w: 130, kind: 'n', state: 'off' },
        sum: { x: 670, y: 150, label: 'a · b = ?', w: 140, kind: 'd', state: 'off' } },
      steps: [
        { cap: 'Two vectors: \\(\\mathbf{a} = [1, 2, 3]\\) (blue) and \\(\\mathbf{b} = [4, -5, 6]\\) (violet). Same length, so they can be dotted.', do: [['focus', 'a1', 'a2', 'a3', 'b1', 'b2', 'b3']] },
        { cap: 'First pair: \\(1 \\times 4 = 4\\).', do: [['send', 'b1', 'p1', '×'], ['set', 'p1', { label: '1 × 4 = 4', state: 'ok' }]] },
        { cap: 'Second pair: \\(2 \\times (-5) = -10\\). They disagree in sign, so this term pulls the total down.', do: [['send', 'b2', 'p2', '×'], ['set', 'p2', { label: '2 × −5 = −10', state: 'warn' }]] },
        { cap: 'Third pair: \\(3 \\times 6 = 18\\).', do: [['send', 'b3', 'p3', '×'], ['set', 'p3', { label: '3 × 6 = 18', state: 'ok' }]] },
        { cap: 'Add the products: \\(4 - 10 + 18 = 12\\). Positive, so overall the two vectors lean the same way.', do: [['link', 'p1', 'sum'], ['link', 'p2', 'sum'], ['link', 'p3', 'sum'], ['set', 'sum', { label: 'a · b = 12', state: 'active' }]] }
      ] },
    example: { given: '\\(\\mathbf{a} = [1, 2, 3]\\) and \\(\\mathbf{b} = [4, -5, 6]\\).',
      steps: ['Multiply pairs: \\(1 \\cdot 4 = 4\\), \\(2 \\cdot (-5) = -10\\), \\(3 \\cdot 6 = 18\\).', 'Add: \\(4 + (-10) + 18 = 12\\).', 'Lengths: \\(\\lVert \\mathbf{a} \\rVert = \\sqrt{1 + 4 + 9} = \\sqrt{14} \\approx 3.742\\) and \\(\\lVert \\mathbf{b} \\rVert = \\sqrt{16 + 25 + 36} = \\sqrt{77} \\approx 8.775\\).', 'So \\(\\cos \\theta = \\frac{12}{3.742 \\times 8.775} \\approx 0.365\\): a loose agreement, about 69° apart.'],
      result: '\\(\\mathbf{a} \\cdot \\mathbf{b} = 12\\). Dividing by both lengths gives the cosine similarity, 0.365.' },
    lab: { h: 'Turn the angle', body: 'Arrow a lies flat. Rotate arrow b and change the lengths. The dot product follows \\(\\lVert a \\rVert \\lVert b \\rVert \\cos \\theta\\).', size: [800, 290],
      controls: [{ id: 'th', type: 'range', label: 'Angle θ', min: 0, max: 180, step: 15, value: 45, unit: '°' }, { id: 'la', type: 'range', label: 'Length of a', min: 1, max: 3, step: 0.5, value: 2 }, { id: 'lb', type: 'range', label: 'Length of b', min: 1, max: 3, step: 0.5, value: 2 }],
      view: s => { const t = s.v.th * Math.PI / 180, dp = s.v.la * s.v.lb * Math.cos(t);
        return { nodes: { o: { x: 400, y: 250, shape: 'circle', w: 14, kind: 'n' }, a: { x: 400 + s.v.la * 70, y: 250, label: 'a', shape: 'circle', w: 26, kind: 'a' },
          b: { x: Math.round(400 + s.v.lb * 70 * Math.cos(t)), y: Math.round(250 - s.v.lb * 70 * Math.sin(t)), label: 'b', shape: 'circle', w: 26, kind: 'b', state: dp > 0.01 ? 'ok' : dp < -0.01 ? 'bad' : 'warn' } },
          edges: [['o', 'a'], ['o', 'b']], vars: { 'a · b': MLD1_r(dp, 2) } }; },
      readout: s => { const c = Math.cos(s.v.th * Math.PI / 180); return [['cos θ', MLD1_r(c, 3)], ['a · b', MLD1_r(s.v.la * s.v.lb * c, 2)], ['meaning', c > 0.01 ? 'same direction' : c < -0.01 ? 'opposite' : 'unrelated (90°)']]; } },
    pitfalls: ['The vectors must have the same length. A mismatch is a [[shape]] error, not a zero.', 'A big dot product can just mean long vectors. To compare direction only, divide by both lengths (cosine similarity).', 'In NumPy, `a * b` multiplies pairs but does not add them. The dot product is `a @ b` or `np.dot(a, b)`.'],
    code: 'import numpy as np\n\na = np.array([1, 2, 3])\nb = np.array([4, -5, 6])\nprint(a * b)        # [  4 -10  18]  pairs only\nprint(a @ b)        # 12             the dot product\ncos = (a @ b) / (np.linalg.norm(a) * np.linalg.norm(b))\nprint(round(cos, 3)) # 0.365',
    lang: 'Python'
  },

  'matrix multiplication': {
    intuition: 'To multiply matrix A by matrix B, take each row of A and [[dot product|dot]] it with each column of B. Each result fills one cell of the answer.\n\nSo the row length of A must equal the column length of B. That is the "inner sizes must match" rule behind most [[shape]] errors.\n\nA neural layer is exactly this. Your [[batch]] of inputs is A (one row per example), the [[weights]] are B (one column per [[neuron]]), and every cell of the result is one neuron\'s output for one example.',
    formula: ['C = AB, \\quad C_{ij} = \\sum_{k=1}^{n} A_{ik} B_{kj}', '(m \\times n) \\cdot (n \\times p) \\to (m \\times p)'],
    symbols: [['A', 'the left matrix, m rows by n columns'], ['B', 'the right matrix, n rows by p columns'], ['C_{ij}', 'the answer cell in row i, column j'], ['k', 'walks along row i of A and down column j of B at the same time'], ['n', 'the shared inner size; it disappears from the result'], ['m \\cdot n \\cdot p', 'how many multiply-adds the whole product costs']],
    figure: { h: 'Row times column, four times', size: [800, 280],
      nodes: { ha: { x: 110, y: 90, shape: 'text', label: 'A' }, hb: { x: 350, y: 90, shape: 'text', label: 'B' }, hc: { x: 600, y: 90, shape: 'text', label: 'C = AB' },
        a11: { x: 70, y: 150, label: '1', w: 50, h: 40, kind: 'a' }, a12: { x: 150, y: 150, label: '2', w: 50, h: 40, kind: 'a' }, a21: { x: 70, y: 225, label: '3', w: 50, h: 40, kind: 'a' }, a22: { x: 150, y: 225, label: '4', w: 50, h: 40, kind: 'a' },
        b11: { x: 310, y: 150, label: '5', w: 50, h: 40, kind: 'b' }, b12: { x: 390, y: 150, label: '6', w: 50, h: 40, kind: 'b' }, b21: { x: 310, y: 225, label: '7', w: 50, h: 40, kind: 'b' }, b22: { x: 390, y: 225, label: '8', w: 50, h: 40, kind: 'b' },
        c11: { x: 560, y: 150, label: '?', w: 50, h: 40, kind: 'd', state: 'off' }, c12: { x: 640, y: 150, label: '?', w: 50, h: 40, kind: 'd', state: 'off' }, c21: { x: 560, y: 225, label: '?', w: 50, h: 40, kind: 'd', state: 'off' }, c22: { x: 640, y: 225, label: '?', w: 50, h: 40, kind: 'd', state: 'off' } },
      steps: [
        { cap: 'A is 2×2 and B is 2×2. Inner sizes match (2 and 2), so C will be 2×2.', do: [['var', 'shapes', '(2×2)(2×2) → 2×2']] },
        { cap: 'Row 1 of A with column 1 of B: \\(1 \\cdot 5 + 2 \\cdot 7 = 19\\).', do: [['focus', 'a11', 'a12', 'b11', 'b21', 'c11'], ['set', 'c11', { label: '19', state: 'ok' }]] },
        { cap: 'Row 1 with column 2: \\(1 \\cdot 6 + 2 \\cdot 8 = 22\\).', do: [['focus', 'a11', 'a12', 'b12', 'b22', 'c12'], ['set', 'c12', { label: '22', state: 'ok' }]] },
        { cap: 'Row 2 with column 1: \\(3 \\cdot 5 + 4 \\cdot 7 = 43\\).', do: [['focus', 'a21', 'a22', 'b11', 'b21', 'c21'], ['set', 'c21', { label: '43', state: 'ok' }]] },
        { cap: 'Row 2 with column 2: \\(3 \\cdot 6 + 4 \\cdot 8 = 50\\). Four cells, four dot products.', do: [['focus', 'a21', 'a22', 'b12', 'b22', 'c22'], ['set', 'c22', { label: '50', state: 'ok' }]] },
        { cap: 'Cost: \\(m \\cdot n \\cdot p = 2 \\cdot 2 \\cdot 2 = 8\\) multiply-adds. GPUs exist to do billions of these at once.', do: [['var', 'multiply-adds', 8]] }
      ] },
    example: { given: '\\(A = [[1, 2], [3, 4]]\\) and \\(B = [[5, 6], [7, 8]]\\). Find \\(C = AB\\).',
      steps: ['\\(C_{11} = 1 \\cdot 5 + 2 \\cdot 7 = 5 + 14 = 19\\).', '\\(C_{12} = 1 \\cdot 6 + 2 \\cdot 8 = 6 + 16 = 22\\).', '\\(C_{21} = 3 \\cdot 5 + 4 \\cdot 7 = 15 + 28 = 43\\).', '\\(C_{22} = 3 \\cdot 6 + 4 \\cdot 8 = 18 + 32 = 50\\).', 'Order matters: \\(BA = [[23, 34], [31, 46]]\\), which is different.'],
      result: '\\(C = [[19, 22], [43, 50]]\\).' },
    pitfalls: ['\\(AB \\ne BA\\) in general. Swapping the order changes the answer, or breaks the shapes.', '`A * B` in NumPy multiplies cell by cell. Matrix multiplication is `A @ B`.', 'A shape error like `(32, 768) @ (512, 10)` means the inner sizes (768 and 512) differ. Check the layer that produced each side.'],
    code: 'import numpy as np\n\nA = np.array([[1, 2], [3, 4]])\nB = np.array([[5, 6], [7, 8]])\nprint(A @ B)   # [[19 22]\n               #  [43 50]]\nprint(B @ A)   # [[23 34]\n               #  [31 46]]\n\n# a layer: 32 examples x 768 features, times 768 x 10 weights\nX = np.ones((32, 768)); W = np.ones((768, 10))\nprint((X @ W).shape)  # (32, 10)',
    lang: 'Python'
  },

  'MSE': {
    intuition: 'You predicted some numbers, and you know the true ones. For each, take the error (prediction minus truth), square it, then average all the squares. That is [[MSE]].\n\nSquaring does two jobs. It makes every error positive, so misses in both directions count. It also punishes big misses much more than small ones: an error of 2 costs 4, an error of 10 costs 100.\n\nIt is the default [[loss function]] when the model predicts a number, like a price or a temperature.',
    formula: ['\\text{MSE} = \\frac{1}{n} \\sum_{i=1}^{n} (\\hat{y}_i - y_i)^2', '\\frac{\\partial \\, \\text{MSE}}{\\partial \\hat{y}_i} = \\frac{2}{n} (\\hat{y}_i - y_i)'],
    symbols: [['n', 'how many examples'], ['\\hat{y}_i', 'the model\'s prediction for example i ("y hat")'], ['y_i', 'the true value for example i'], ['\\hat{y}_i - y_i', 'the error: positive if the prediction is too high'], ['\\frac{1}{n} \\sum', 'the average over all examples'], ['\\partial', 'the partial derivative: how fast MSE changes when one prediction moves']],
    figure: { h: 'Errors, squared, averaged', size: [800, 320],
      nodes: { s1: { x: 150, y: 50, label: 'y=3, ŷ=2.5', w: 120, kind: 'a' }, s2: { x: 330, y: 50, label: 'y=5, ŷ=5', w: 120, kind: 'a' }, s3: { x: 510, y: 50, label: 'y=2, ŷ=4', w: 120, kind: 'a' },
        q1: { x: 150, y: 300, shape: 'bar', w: 60, h: 2, kind: 'b' }, q2: { x: 330, y: 300, shape: 'bar', w: 60, h: 2, kind: 'b' }, q3: { x: 510, y: 300, shape: 'bar', w: 60, h: 2, kind: 'b' },
        m: { x: 690, y: 180, label: 'MSE = ?', w: 130, kind: 'd', state: 'off' } },
      steps: [
        { cap: 'Three examples, each with a truth \\(y\\) and a prediction \\(\\hat{y}\\).', do: [['focus', 's1', 's2', 's3']] },
        { cap: 'Errors \\(\\hat{y} - y\\): \\(-0.5\\), \\(0\\) and \\(2\\). The first is too low, the third too high.', do: [['note', 's1', 'error −0.5'], ['note', 's2', 'error 0'], ['note', 's3', 'error +2']] },
        { cap: 'Square each error: 0.25, 0 and 4. The bars show them. Both signs now count as cost.', do: [['set', 'q1', { h: 10 }], ['set', 'q3', { h: 160 }], ['var', 'squares', '0.25, 0, 4']] },
        { cap: 'Average: \\((0.25 + 0 + 4) / 3 \\approx 1.417\\).', do: [['set', 'm', { label: 'MSE = 1.417', state: 'active' }], ['link', 'q3', 'm']] },
        { cap: 'The one big miss gives 4 of the 4.25 total: 94% of the loss. Squaring makes MSE chase large errors.', do: [['focus', 'q3', 's3', 'm'], ['set', 'q3', { state: 'warn' }]] }
      ] },
    example: { given: 'Truths \\(y = [3, 5, 2]\\), predictions \\(\\hat{y} = [2.5, 5, 4]\\).',
      steps: ['Errors: \\(2.5 - 3 = -0.5\\), \\(5 - 5 = 0\\), \\(4 - 2 = 2\\).', 'Squares: \\(0.25\\), \\(0\\), \\(4\\).', 'Sum: \\(4.25\\). Divide by \\(n = 3\\): \\(\\text{MSE} \\approx 1.417\\).', 'Gradient for the third prediction: \\(\\frac{2}{3} \\times 2 \\approx 1.333\\). Positive, so lowering that prediction lowers the loss.'],
      result: '\\(\\text{MSE} \\approx 1.417\\). Its square root, RMSE ≈ 1.19, is back in the original units.' },
    lab: { h: 'Move two predictions', body: 'Truths are 3, 5 and 2. Move predictions 1 and 3. The second stays perfect. Watch how one bad miss dominates the average.', size: [800, 280],
      controls: [{ id: 'p1', type: 'range', label: 'Prediction ŷ₁ (truth 3)', min: 0, max: 6, step: 0.5, value: 2.5 }, { id: 'p3', type: 'range', label: 'Prediction ŷ₃ (truth 2)', min: 0, max: 8, step: 0.5, value: 4 }],
      view: s => { const sq = [(s.v.p1 - 3) ** 2, 0, (s.v.p3 - 2) ** 2], m = (sq[0] + sq[1] + sq[2]) / 3;
        const nodes = MLD1_bars('q', sq, 200, 200, 250, 6, 60, 'b');
        nodes.q0.state = sq[0] > 4 ? 'warn' : undefined; nodes.q2.state = sq[2] > 4 ? 'warn' : undefined;
        Object.assign(nodes, MLD1_axis([['t0', 200, 'example 1'], ['t1', 400, 'example 2'], ['t2', 600, 'example 3']], 266));
        return { nodes, vars: { MSE: MLD1_r(m) } }; },
      readout: s => { const e = [s.v.p1 - 3, 0, s.v.p3 - 2]; return [['squared errors', e.map(x => MLD1_r(x * x, 2)).join(', ')], ['MSE', MLD1_r((e[0] ** 2 + e[2] ** 2) / 3)], ['mean |error| (MAE)', MLD1_r((Math.abs(e[0]) + Math.abs(e[2])) / 3)]]; } },
    pitfalls: ['One outlier can dominate the loss. If your data has wild values, consider MAE or Huber loss.', 'MSE is in squared units (dollars²). Take the square root (RMSE) to talk about it in dollars.', 'Do not use MSE on probabilities for classification. [[cross-entropy|Cross-entropy]] gives much stronger [[gradient|gradients]] when the model is confidently wrong.'],
    code: 'import numpy as np\n\ny    = np.array([3, 5, 2])\nyhat = np.array([2.5, 5, 4])\nmse = np.mean((yhat - y) ** 2)\nprint(round(mse, 3))   # 1.417\n\n# PyTorch: torch.nn.functional.mse_loss(yhat_t, y_t)',
    lang: 'Python'
  },

  'cross-entropy': {
    intuition: 'A classifier outputs a probability for each class. [[cross-entropy|Cross-entropy]] looks only at the probability it gave the **correct** class, and takes minus the log of it.\n\nIf the model gave the right answer 100%, the loss is \\(-\\ln \\, 1 = 0\\). At 50% it is 0.69. At 1% it is 4.6. The log turns "confidently wrong" into a huge penalty, which gives a strong push to fix it.\n\nIt is the standard [[loss function]] for every classifier, and for language models, where the "class" is the next [[token]].',
    formula: ['L = -\\sum_{k=1}^{K} y_k \\ln \\, p_k = -\\ln \\, p_{c}', '\\text{batch loss} = \\frac{1}{N} \\sum_{i=1}^{N} -\\ln \\, p_{i, c_i}'],
    symbols: [['K', 'how many classes'], ['p_k', 'the model\'s probability for class k (they sum to 1, usually from softmax)'], ['y_k', 'the one-hot truth: 1 for the correct class, 0 for every other'], ['c', 'the index of the correct class'], ['\\ln', 'the natural log (base e). ln 1 = 0, and ln of a small number is very negative'], ['N', 'examples in the batch; the batch loss is the average']],
    figure: { h: 'Only the correct class counts', size: [800, 300],
      nodes: { cat: { x: 150, y: 240, shape: 'bar', w: 50, h: 140, label: 'cat', kind: 'a' }, dog: { x: 250, y: 240, shape: 'bar', w: 50, h: 40, label: 'dog', kind: 'a' }, bird: { x: 350, y: 240, shape: 'bar', w: 50, h: 20, label: 'brd', kind: 'a' },
        loss: { x: 620, y: 240, shape: 'bar', w: 60, h: 2, label: 'L', kind: 'd' } },
      steps: [
        { cap: 'The model says cat 0.7, dog 0.2, bird 0.1. The probabilities sum to 1.', do: [['var', 'p', '[0.7, 0.2, 0.1]']] },
        { cap: 'The true label is cat. Cross-entropy ignores the other two bars.', do: [['focus', 'cat', 'loss'], ['set', 'cat', { state: 'ok' }]] },
        { cap: 'Loss \\(= -\\ln \\, 0.7 \\approx 0.357\\). Fairly confident and right: a small loss.', do: [['set', 'loss', { h: 21, state: 'ok' }], ['var', 'loss', 0.357]] },
        { cap: 'Same output, but the truth is bird: \\(-\\ln \\, 0.1 \\approx 2.303\\). Over six times bigger.', do: [['set', 'cat', { state: undefined }], ['set', 'bird', { state: 'bad' }], ['set', 'loss', { h: 138, state: 'warn' }], ['var', 'loss', 2.303], ['focus', 'bird', 'loss']] },
        { cap: 'If the model had put only 0.01 on the truth: \\(-\\ln \\, 0.01 \\approx 4.605\\). Confidently wrong is punished hardest.', do: [['set', 'bird', { h: 2 }], ['set', 'loss', { h: 276, state: 'bad' }], ['var', 'loss', 4.605]] }
      ] },
    example: { given: 'Three classes. The model outputs \\(p = [0.7, 0.2, 0.1]\\) for (cat, dog, bird).',
      steps: ['Truth is cat: \\(L = -\\ln \\, 0.7 \\approx 0.357\\).', 'Truth is dog: \\(L = -\\ln \\, 0.2 \\approx 1.609\\).', 'Truth is bird: \\(L = -\\ln \\, 0.1 \\approx 2.303\\).', 'A batch of those three examples averages \\((0.357 + 1.609 + 2.303) / 3 \\approx 1.423\\).', 'Baseline: a model that guesses 1/3 for everything scores \\(-\\ln \\, \\frac{1}{3} \\approx 1.099\\) on every example.'],
      result: 'The loss is small when the correct class gets a high probability, and grows without limit as that probability nears 0.' },
    lab: { h: 'Slide the correct-class probability', body: 'The bars trace \\(-\\ln \\, p\\) from p = 0.05 to 1. Move p and watch the loss climb steeply near 0.', size: [800, 300],
      controls: [{ id: 'p', type: 'range', label: 'p(correct class)', min: 0.05, max: 1, step: 0.05, value: 0.7 }],
      view: s => { const ps = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.05), at = Math.round(s.v.p / 0.05) - 1;
        const nodes = MLD1_bars('c', ps.map(p => -Math.log(p)), 110, 30, 260, 70, 20, 'd', at);
        Object.assign(nodes, MLD1_axis([['lo', 110, 'p = 0.05'], ['hi', 680, 'p = 1']], 278));
        return { nodes, vars: { loss: MLD1_r(-Math.log(s.v.p)) } }; },
      readout: s => [['p(correct)', MLD1_r(s.v.p, 2)], ['loss = −ln p', MLD1_r(-Math.log(s.v.p))], ['verdict', s.v.p >= 0.9 ? 'confident and right' : s.v.p >= 0.5 ? 'leaning right' : s.v.p > 0.2 ? 'unsure' : 'confidently wrong']] },
    pitfalls: ['PyTorch `F.cross_entropy` expects raw [[logit|logits]], not probabilities. It applies [[softmax]] itself. Passing probabilities applies it twice.', 'Never compute `log(0)`. Libraries clip or use log-softmax internally; do the same if you write it by hand.', 'Loss values depend on the log base. PyTorch uses natural log (nats), so random guessing over K classes scores \\(\\ln \\, K\\).'],
    code: 'import math\nprint(round(-math.log(0.7), 3))   # 0.357\n\nimport torch, torch.nn.functional as F\nlogits = torch.tensor([2.0, 1.0, 0.1]).unsqueeze(0)  # raw scores, not probabilities\ntarget = torch.tensor([0])                # correct class: index 0\nprint(F.cross_entropy(logits, target))    # tensor(0.4170)  = -ln(0.659)',
    lang: 'Python'
  },

  'gradient descent': {
    intuition: 'Picture the [[loss function]] as a valley, and the model\'s [[weights]] as your position on the hillside. You are blindfolded, but you can feel the slope under your feet.\n\nThe [[gradient]] is that slope: it points uphill. So take a small step the opposite way. Feel the slope again, step again. Repeat thousands of times and you walk down into the valley.\n\nThe step is the slope times the [[learning rate]]. Steep ground gives big steps; near the bottom the slope flattens and the steps shrink by themselves.',
    formula: ['w \\leftarrow w - \\eta \\, \\frac{\\partial L}{\\partial w}', '\\mathbf{w} \\leftarrow \\mathbf{w} - \\eta \\, \\nabla L(\\mathbf{w})'],
    symbols: [['w', 'one weight (bold \\(\\mathbf{w}\\): all of them as a vector)'], ['\\leftarrow', '"becomes": replace the old value with the new one'], ['\\eta', 'eta, the learning rate: the step size, for example 0.1'], ['L', 'the loss: how wrong the model is'], ['\\frac{\\partial L}{\\partial w}', 'the slope of the loss along w; positive means increasing w increases the loss'], ['\\nabla L', 'nabla L, the gradient: all the slopes together, one per weight']],
    figure: { h: 'Four steps down the bowl L = (w − 3)²', size: [800, 300],
      nodes: Object.assign(MLD1_bars('c', [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6].map(MLD1_bowl), 100, 50, 270, 22, 30),
        MLD1_axis([['x0', 100, 'w = 0'], ['x3', 400, 'w = 3'], ['x6', 700, 'w = 6']], 286),
        { m: { x: MLD1_gx(0), y: MLD1_gy(9), shape: 'circle', w: 26, label: 'w', kind: 'a', state: 'active' } }),
      steps: [
        { cap: 'Start at \\(w = 0\\): loss \\((0 - 3)^2 = 9\\). Slope \\(2(w - 3) = -6\\): negative, so downhill is to the right.', do: [['var', 'w', 0], ['var', 'L', 9], ['var', 'slope', -6]] },
        { cap: 'Step with \\(\\eta = 0.1\\): \\(w = 0 - 0.1 \\times (-6) = 0.6\\). Loss drops to 5.76.', do: [['move', 'm', MLD1_gx(0.6), MLD1_gy(5.76)], ['var', 'w', 0.6], ['var', 'L', 5.76], ['var', 'slope', -4.8]] },
        { cap: 'Slope is now −4.8, gentler, so the step is smaller: \\(w = 0.6 + 0.48 = 1.08\\). Loss 3.69.', do: [['move', 'm', MLD1_gx(1.08), MLD1_gy(3.6864)], ['var', 'w', 1.08], ['var', 'L', 3.686], ['var', 'slope', -3.84]] },
        { cap: 'Again: \\(w = 1.08 + 0.384 = 1.464\\). Loss 2.36. Each step shrinks as the ground flattens.', do: [['move', 'm', MLD1_gx(1.464), MLD1_gy(2.3593)], ['var', 'w', 1.464], ['var', 'L', 2.359], ['var', 'slope', -3.072]] },
        { cap: 'After 20 steps: \\(w \\approx 2.965\\), loss 0.0012. The slope is almost 0, so it settles at the bottom.', do: [['move', 'm', MLD1_gx(2.965), MLD1_gy(0.0012)], ['set', 'm', { state: 'ok' }], ['set', 'c6', { state: 'active' }], ['var', 'w', 2.965], ['var', 'L', 0.0012], ['var', 'slope', -0.069]] }
      ] },
    example: { given: 'Loss \\(L(w) = (w - 3)^2\\), so the slope is \\(\\frac{\\partial L}{\\partial w} = 2(w - 3)\\). Start at \\(w = 0\\) with \\(\\eta = 0.1\\).',
      steps: ['Step 1: slope \\(2(0 - 3) = -6\\). New \\(w = 0 - 0.1 \\times (-6) = 0.6\\). Loss \\((0.6 - 3)^2 = 5.76\\).', 'Step 2: slope \\(2(0.6 - 3) = -4.8\\). New \\(w = 0.6 + 0.48 = 1.08\\). Loss \\(3.6864\\).', 'Step 3: slope \\(-3.84\\). New \\(w = 1.08 + 0.384 = 1.464\\). Loss \\(2.3593\\).', 'Pattern: each step multiplies the distance to 3 by \\(1 - 2\\eta = 0.8\\). After 20 steps the distance is \\(3 \\times 0.8^{20} \\approx 0.035\\).'],
      result: 'After 20 steps \\(w \\approx 2.965\\) and the loss is about 0.0012. The true minimum is \\(w = 3\\).' },
    pitfalls: ['Real loss surfaces are not one bowl. Gradient descent can stall on flat plateaus or settle in a poor dip.', 'In practice each step uses a mini-[[batch]], not all the data. That is stochastic gradient descent (SGD); its noisy steps are normal.', 'Forgetting `optimizer.zero_grad()` in PyTorch adds this step\'s [[gradient|gradients]] to the last ones. The steps get wrong and huge.'],
    code: 'w, eta = 0.0, 0.1\nfor step in range(20):\n    grad = 2 * (w - 3)      # slope of (w - 3)**2\n    w = w - eta * grad      # the whole algorithm\nprint(round(w, 3))          # 2.965',
    lang: 'Python'
  },

  'learning rate': {
    intuition: 'The [[learning rate]] \\(\\eta\\) is how far you move each time you follow the [[gradient]]. It is the most important knob in training.\n\nToo small and you creep: thousands of steps for little progress. Too big and you leap over the valley floor and land higher on the other side. Then the slope there is steeper, so the next leap is even bigger, and the loss explodes to `NaN`.\n\nThe right size sits just below the edge where it starts to bounce. That is why people try 1e-2, 1e-3, 1e-4 and watch the loss curve.',
    formula: ['w_{t+1} = w_t - \\eta \\, \\nabla L(w_t)', '\\text{for } L = (w - 3)^2: \\quad w_{t+1} - 3 = (1 - 2\\eta)(w_t - 3)'],
    symbols: [['\\eta', 'the learning rate, a positive number such as 0.001'], ['w_t', 'the weight after t steps'], ['\\nabla L(w_t)', 'the gradient at the current weight'], ['1 - 2\\eta', 'for this bowl, how much the distance to the minimum is multiplied by each step'], ['|1 - 2\\eta| < 1', 'the condition to converge here, which means \\(0 < \\eta < 1\\)']],
    figure: { h: 'Same bowl, four step sizes', size: [800, 300],
      nodes: Object.assign(MLD1_lrBars(), MLD1_axis([['x0', 100, 'w = −2'], ['x3', 400, 'w = 3'], ['x8', 700, 'w = 8']], 286), { m: MLD1_lrDot(0, 0, 'active') }),
      steps: [
        { cap: 'The bowl \\(L = (w - 3)^2\\). Every run starts at \\(w = 0\\); only the learning rate changes.', do: [['var', 'η', '—']] },
        { cap: '\\(\\eta = 0.1\\): small safe steps, 0 → 0.6 → 1.08. Steady, but slow.', do: [['add', 'p1', MLD1_lrDot(1, 0.6)], ['add', 'p2', MLD1_lrDot(2, 1.08)], ['link', 'm', 'p1'], ['link', 'p1', 'p2'], ['var', 'η', 0.1]] },
        { cap: '\\(\\eta = 0.5\\): one jump lands exactly on \\(w = 3\\). For this bowl, the ideal size.', do: [['rm', 'p1'], ['rm', 'p2'], ['add', 'p1', MLD1_lrDot(1, 3, 'ok')], ['link', 'm', 'p1', { bend: -40 }], ['var', 'η', 0.5]] },
        { cap: '\\(\\eta = 0.9\\): overshoots to 5.4, then back to 1.08. It zig-zags but still closes in.', do: [['rm', 'p1'], ['add', 'p1', MLD1_lrDot(1, 5.4, 'warn')], ['add', 'p2', MLD1_lrDot(2, 1.08, 'warn')], ['link', 'm', 'p1', { bend: -40 }], ['link', 'p1', 'p2', { bend: -40 }], ['var', 'η', 0.9]] },
        { cap: '\\(\\eta = 1.1\\): 0 → 6.6 → −1.32. Each landing is further from 3 than the last.', do: [['rm', 'p1'], ['rm', 'p2'], ['add', 'p1', MLD1_lrDot(1, 6.6, 'bad')], ['add', 'p2', MLD1_lrDot(2, -1.32, 'bad')], ['link', 'm', 'p1', { bend: -40 }], ['var', 'η', 1.1]] },
        { cap: 'Next 8.18, then −3.22 … the distance grows ×1.2 per step. This is divergence: the loss heads to infinity.', do: [['add', 'p3', MLD1_lrDot(3, 8.184, 'bad')], ['link', 'p1', 'p2', { bend: -40, tone: 'bad' }], ['link', 'p2', 'p3', { bend: -40, tone: 'bad' }], ['var', 'loss', 26.87]] }
      ] },
    example: { given: 'Loss \\(L = (w - 3)^2\\), slope \\(2(w - 3)\\), start \\(w_0 = 0\\). Compare \\(\\eta = 0.1\\) with \\(\\eta = 1.1\\).',
      steps: ['\\(\\eta = 0.1\\): factor \\(1 - 2(0.1) = 0.8\\). Distance to 3 goes \\(3 \\to 2.4 \\to 1.92\\), so \\(w = 0 \\to 0.6 \\to 1.08\\). Converging.', '\\(\\eta = 1.1\\): factor \\(1 - 2(1.1) = -1.2\\). Distance goes \\(-3 \\to 3.6 \\to -4.32 \\to 5.184\\).', 'So \\(w = 0 \\to 6.6 \\to -1.32 \\to 8.184\\). The sign flips (it bounces) and the size grows by 1.2 each time.', 'Loss at \\(w = 8.184\\): \\(5.184^2 \\approx 26.87\\), up from 9 at the start.'],
      result: 'Below \\(\\eta = 1\\) this bowl converges; above it the loss grows every step. Real networks have the same edge, just at a value you must find by trying.' },
    lab: { h: 'Find the edge', body: 'Drag the learning rate. The dots are the first 5 steps from \\(w = 0\\). Find where it starts to bounce, and where it blows up.', size: [800, 300],
      controls: [{ id: 'eta', type: 'range', label: 'Learning rate η', min: 0.05, max: 1.2, step: 0.05, value: 0.1 }],
      view: s => { const eta = s.v.eta, nodes = Object.assign(MLD1_lrBars(), MLD1_axis([['x0', 100, 'w = −2'], ['x3', 400, 'w = 3'], ['x8', 700, 'w = 8']], 286)), edges = [];
        let w = 0; const f = Math.abs(1 - 2 * eta), st = f < 0.999 ? undefined : f > 1.001 ? 'bad' : 'warn';
        for (let i = 0; i <= 5; i++) { nodes['d' + i] = MLD1_lrDot(i, w, i ? st : 'active'); if (i) edges.push(['d' + (i - 1), 'd' + i, { bend: -30, tone: st }]); w -= eta * 2 * (w - 3); }
        return { nodes, edges, vars: { η: MLD1_r(eta, 2) } }; },
      readout: s => { let w = 0; for (let i = 0; i < 10; i++) w -= s.v.eta * 2 * (w - 3); const f = Math.abs(1 - 2 * s.v.eta);
        return [['w after 10 steps', MLD1_r(w, 3)], ['loss after 10 steps', MLD1_r(MLD1_bowl(w), 4)], ['|1 − 2η|', MLD1_r(f, 2)], ['verdict', f > 1.001 ? 'diverges' : f > 0.999 ? 'bounces forever' : s.v.eta > 0.5 ? 'zig-zags in' : 'slides in']]; } },
    pitfalls: ['Loss suddenly becomes `NaN` or `inf`? The learning rate is the first suspect. Try 10× smaller.', 'A good rate for one optimizer is wrong for another. Adam usually wants about 1e-3 to 1e-4; plain SGD often more.', 'Changing the [[batch]] size changes the best learning rate. Re-tune after changing it.'],
    code: 'def run(eta, steps=10):\n    w = 0.0\n    for _ in range(steps):\n        w -= eta * 2 * (w - 3)\n    return round(w, 3)\n\nfor eta in [0.1, 0.5, 0.9, 1.1]:\n    print(eta, run(eta))\n# 0.1 2.678   0.5 3.0   0.9 2.678   1.1 -15.575',
    lang: 'Python'
  },

  'backpropagation': {
    intuition: 'A network is a long chain of small steps: multiply, add, square. To train it we need the slope of the loss with respect to every [[weights|weight]]. Backpropagation gets all of them in one backward sweep.\n\nFirst run the chain forward and remember each step\'s value. Then walk backwards from the loss. At each step, multiply the slope arriving from above by that step\'s own local slope. That multiplication is the [[chain rule]].\n\nEach local slope is trivial (the slope of \\(e^2\\) is \\(2e\\); the slope of \\(wx\\) along \\(w\\) is \\(x\\)). Backprop just multiplies them in the right order.',
    formula: ['L = (wx + b - y)^2', '\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial e} \\cdot \\frac{\\partial e}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w} = 2e \\cdot 1 \\cdot x', '\\frac{\\partial L}{\\partial b} = 2e \\cdot 1 \\cdot 1'],
    symbols: [['x, y', 'one input and its true answer'], ['w, b', 'the weight and bias we are training'], ['z = wx + b', 'the prediction'], ['e = z - y', 'the error'], ['L = e^2', 'the loss for this one example'], ['\\frac{\\partial L}{\\partial e}', 'the local slope of the square: \\(2e\\)'], ['\\frac{\\partial z}{\\partial w}', 'the local slope of \\(wx + b\\) along w: just \\(x\\)']],
    figure: { h: 'Forward for values, backward for slopes', size: [800, 380], nodes: MLD1_bp(3, 1, false), edges: MLD1_bpEdges,
      steps: [
        { cap: 'Forward: multiply \\(w x = 3 \\times 2 = 6\\).', do: [['send', 'x', 'mul', '2'], ['send', 'w', 'mul', '3'], ['set', 'mul', { label: 'wx = 6' }]] },
        { cap: 'Add the bias: \\(z = 6 + 1 = 7\\). That is the prediction.', do: [['send', 'b', 'add', '1'], ['set', 'add', { label: 'z = 7' }]] },
        { cap: 'Subtract the target: \\(e = 7 - 5 = 2\\). Too high by 2.', do: [['send', 'y', 'sub', '5'], ['set', 'sub', { label: 'e = 2' }]] },
        { cap: 'Square it: \\(L = 2^2 = 4\\). The forward pass is done; every value is remembered.', do: [['send', 'sub', 'sq', '2'], ['set', 'sq', { label: 'L = 4', state: 'active' }]] },
        { cap: 'Backward. Slope of the square: \\(\\frac{\\partial L}{\\partial e} = 2e = 4\\).', do: [['send', 'sq', 'sub', '4', 'acc'], ['set', 'sub', { sub: '∂L/∂e = 4', state: 'active' }]] },
        { cap: 'Subtraction passes slopes through unchanged (local slope 1): \\(\\frac{\\partial L}{\\partial z} = 4\\).', do: [['send', 'sub', 'add', '4', 'acc'], ['set', 'add', { sub: '∂L/∂z = 4', state: 'active' }]] },
        { cap: 'Addition passes it to both inputs. So \\(\\frac{\\partial L}{\\partial b} = 4\\).', do: [['send', 'add', 'b', '4', 'acc'], ['send', 'add', 'mul', '4', 'acc'], ['set', 'b', { sub: '∂L/∂b = 4', state: 'ok' }], ['set', 'mul', { sub: '∂L/∂(wx) = 4' }]] },
        { cap: 'Multiplication scales by the other input: \\(\\frac{\\partial L}{\\partial w} = 4 \\times x = 4 \\times 2 = 8\\).', do: [['send', 'mul', 'w', '8', 'acc'], ['set', 'w', { sub: '∂L/∂w = 8', state: 'ok' }]] }
      ] },
    example: { given: '\\(L = (wx + b - y)^2\\) with \\(x = 2\\), \\(y = 5\\), \\(w = 3\\), \\(b = 1\\).',
      steps: ['Forward: \\(z = 3 \\times 2 + 1 = 7\\), \\(e = 7 - 5 = 2\\), \\(L = 2^2 = 4\\).', 'Backward: \\(\\frac{\\partial L}{\\partial e} = 2e = 4\\). Then \\(\\frac{\\partial L}{\\partial z} = 4 \\times 1 = 4\\).', '\\(\\frac{\\partial L}{\\partial w} = 4 \\times x = 8\\) and \\(\\frac{\\partial L}{\\partial b} = 4 \\times 1 = 4\\).', 'Check by nudging: \\(w = 3.001\\) gives \\(z = 7.002\\), \\(L = 2.002^2 = 4.008004\\). Change \\(0.008004 / 0.001 \\approx 8.004\\). ✓', 'One [[gradient descent]] step with \\(\\eta = 0.05\\): \\(w = 3 - 0.4 = 2.6\\), \\(b = 1 - 0.2 = 0.8\\). New \\(z = 6\\), \\(L = 1\\).'],
      result: '\\(\\frac{\\partial L}{\\partial w} = 8\\) and \\(\\frac{\\partial L}{\\partial b} = 4\\). One step cut the loss from 4 to 1.' },
    lab: { h: 'Change w and b, read the slopes', body: 'Same graph, \\(x = 2\\) and \\(y = 5\\). The subs show each slope. Find a w and b where both slopes are 0.', size: [800, 380],
      controls: [{ id: 'w', type: 'range', label: 'Weight w', min: 0, max: 4, step: 0.5, value: 3 }, { id: 'b', type: 'range', label: 'Bias b', min: -2, max: 3, step: 0.5, value: 1 }],
      view: s => { const nodes = MLD1_bp(s.v.w, s.v.b, true), e = s.v.w * 2 + s.v.b - 5; nodes.sq.state = Math.abs(e) < 1e-9 ? 'ok' : 'active'; return { nodes, edges: MLD1_bpEdges }; },
      readout: s => { const e = s.v.w * 2 + s.v.b - 5; return [['loss L', MLD1_r(e * e)], ['∂L/∂w = 2e·x', MLD1_r(4 * e)], ['∂L/∂b = 2e', MLD1_r(2 * e)], ['descent says', Math.abs(e) < 1e-9 ? 'stay: at the minimum' : e > 0 ? 'lower w and b' : 'raise w and b']]; } },
    pitfalls: ['Backprop needs the forward values, so training stores them all. That is why training needs far more memory than inference.', 'Gradients add up across paths and across calls. In PyTorch, call `optimizer.zero_grad()` before each `backward()`.', 'Many tiny local slopes multiplied together can shrink to almost 0 (vanishing [[gradient|gradients]]). Saturated [[sigmoid]] layers are a classic cause.'],
    code: 'import torch\n\nx, y = torch.tensor(2.0), torch.tensor(5.0)\nw = torch.tensor(3.0, requires_grad=True)\nb = torch.tensor(1.0, requires_grad=True)\n\nL = (w * x + b - y) ** 2   # forward: L = 4\nL.backward()               # backward: fills .grad\nprint(w.grad, b.grad)      # tensor(8.) tensor(4.)',
    lang: 'Python'
  },

  'sigmoid': {
    intuition: 'The [[sigmoid]] takes any number, from −1000 to +1000, and squashes it into the range 0 to 1. Big positive inputs come out near 1, big negative ones near 0, and 0 maps to exactly 0.5.\n\nThat makes it a natural way to turn a raw score (a [[logit]]) into a probability for a yes/no question: "is this spam?"\n\nIts weakness is the flat ends. Far from 0 the curve barely changes, so its slope (and the [[gradient]] that flows through it) is nearly 0. That is why hidden layers use [[ReLU]] instead.',
    formula: ['\\sigma(z) = \\frac{1}{1 + e^{-z}}', '\\sigma\'(z) = \\sigma(z) \\, (1 - \\sigma(z))', '\\sigma(-z) = 1 - \\sigma(z)'],
    symbols: [['z', 'the input score (a logit), any real number'], ['e', 'Euler\'s number, about 2.718'], ['e^{-z}', 'huge when z is very negative, near 0 when z is very positive'], ['\\sigma(z)', 'the output, always strictly between 0 and 1'], ['\\sigma\'(z)', 'the slope of the curve at z; at most 0.25, at z = 0']],
    figure: { h: 'The S-curve, bar by bar', size: [800, 300],
      nodes: Object.assign(MLD1_bars('c', [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map(MLD1_sig), 100, 50, 260, 200, 32, 'c'),
        MLD1_axis([['x0', 100, 'z = −6'], ['x6', 400, 'z = 0'], ['x12', 700, 'z = 6']], 278)),
      steps: [
        { cap: 'Each bar is \\(\\sigma(z)\\) for z from −6 to 6. Together they trace an S.', do: [['var', 'z', '—']] },
        { cap: '\\(z = 0\\): \\(e^{0} = 1\\), so \\(\\sigma = \\frac{1}{1 + 1} = 0.5\\). Exactly undecided.', do: [['set', 'c6', { state: 'active' }], ['var', 'z', 0], ['var', 'σ(z)', 0.5]] },
        { cap: '\\(z = 2\\): \\(e^{-2} \\approx 0.135\\), so \\(\\sigma = \\frac{1}{1.135} \\approx 0.881\\).', do: [['set', 'c6', { state: undefined }], ['set', 'c8', { state: 'active' }], ['var', 'z', 2], ['var', 'σ(z)', 0.881]] },
        { cap: '\\(z = -2\\): mirror image, \\(1 - 0.881 = 0.119\\).', do: [['set', 'c8', { state: undefined }], ['set', 'c4', { state: 'active' }], ['var', 'z', -2], ['var', 'σ(z)', 0.119]] },
        { cap: 'At \\(z = 5\\) and \\(z = 6\\) the bars are 0.993 and 0.998: almost flat. The slope there is under 0.007.', do: [['set', 'c4', { state: undefined }], ['set', 'c11', { state: 'warn' }], ['set', 'c12', { state: 'warn' }], ['var', 'z', '5, 6'], ['var', 'σ(z)', '0.993, 0.998']] }
      ] },
    example: { given: 'Compute \\(\\sigma(2)\\) and its slope.',
      steps: ['\\(e^{-2} \\approx 0.1353\\).', '\\(1 + 0.1353 = 1.1353\\), and \\(\\frac{1}{1.1353} \\approx 0.8808\\).', 'Slope: \\(\\sigma\'(2) = 0.8808 \\times (1 - 0.8808) \\approx 0.105\\).', 'Compare \\(z = 0\\): \\(\\sigma = 0.5\\), slope \\(0.5 \\times 0.5 = 0.25\\), the steepest point.'],
      result: '\\(\\sigma(2) \\approx 0.881\\), read as "88% yes". Its slope 0.105 is under half the slope at 0.' },
    lab: { h: 'Slide z along the curve', body: 'Move the score z. Watch the output and the slope. Where does the slope almost vanish?', size: [800, 300],
      controls: [{ id: 'z', type: 'range', label: 'Score z', min: -6, max: 6, step: 1, value: 2 }],
      view: s => { const nodes = Object.assign(MLD1_bars('c', [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map(MLD1_sig), 100, 50, 260, 200, 32, 'c', s.v.z + 6),
          MLD1_axis([['x0', 100, 'z = −6'], ['x6', 400, 'z = 0'], ['x12', 700, 'z = 6']], 278));
        return { nodes, vars: { 'σ(z)': MLD1_r(MLD1_sig(s.v.z)) } }; },
      readout: s => { const p = MLD1_sig(s.v.z); return [['σ(z)', MLD1_r(p, 4)], ['slope σ(1 − σ)', MLD1_r(p * (1 - p), 4)], ['as a decision (0.5 cut)', p >= 0.5 ? 'yes' : 'no']]; } },
    pitfalls: ['Saturation: for |z| above about 5 the slope is under 0.007, so learning through that unit nearly stops.', 'Sigmoid outputs do not sum to 1 across several classes. For "pick one of K", use [[softmax]].', 'Computing `1 / (1 + exp(-z))` for z = −1000 overflows `exp`. Use `torch.sigmoid` or `scipy.special.expit`, which are stable.'],
    code: 'import math\n\ndef sigmoid(z):\n    return 1 / (1 + math.exp(-z))\n\nprint(round(sigmoid(2), 4))    # 0.8808\nprint(round(sigmoid(-2), 4))   # 0.1192\ns = sigmoid(2); print(round(s * (1 - s), 4))  # 0.105  (slope)\n\n# PyTorch: torch.sigmoid(z)',
    lang: 'Python'
  },

  'softmax': {
    intuition: 'A classifier ends with one raw score per class, its [[logit|logits]], like `[2, 1, 0.1]`. They can be negative and do not add up to anything in particular. [[softmax|Softmax]] turns them into probabilities.\n\nTwo moves. First, raise \\(e\\) to each score, so everything becomes positive and bigger scores pull further ahead. Then divide each by the total, so they add up to exactly 1.\n\nDividing the scores by a temperature first controls how sharp the result is. Low temperature makes the top class dominate; high temperature flattens everything. LLM sampling uses this knob.',
    formula: ['p_i = \\softmax(\\mathbf{z})_i = \\frac{e^{z_i}}{\\sum_{j=1}^{K} e^{z_j}}', 'p_i = \\frac{e^{z_i / T}}{\\sum_{j} e^{z_j / T}}'],
    symbols: [['\\mathbf{z}', 'the vector of logits, one per class'], ['z_i', 'the score for class i'], ['e^{z_i}', 'e to that score: always positive'], ['\\sum_{j=1}^{K} e^{z_j}', 'the total over all K classes, used to normalise'], ['p_i', 'the probability of class i; all of them are positive and sum to 1'], ['T', 'temperature: T < 1 sharpens, T > 1 flattens, T = 1 is plain softmax']],
    figure: { h: 'Scores → exponentials → probabilities', size: [800, 300],
      nodes: Object.assign(MLD1_bars('c', [2, 1, 0.1], 250, 150, 250, 50, 60, 'a'), MLD1_axis([['t0', 250, 'class A'], ['t1', 400, 'class B'], ['t2', 550, 'class C']], 268)),
      steps: [
        { cap: 'Logits \\(\\mathbf{z} = [2, 1, 0.1]\\). Useful for ranking, but not probabilities.', do: [['var', 'z', '[2, 1, 0.1]']] },
        { cap: 'Exponentiate: \\(e^2 \\approx 7.389\\), \\(e^1 \\approx 2.718\\), \\(e^{0.1} \\approx 1.105\\). The gap between A and the rest widens.', do: [['set', 'c0', { h: 148, kind: 'b' }], ['set', 'c1', { h: 54, kind: 'b' }], ['set', 'c2', { h: 22, kind: 'b' }], ['var', 'e^z', '[7.389, 2.718, 1.105]']] },
        { cap: 'Add them: \\(7.389 + 2.718 + 1.105 = 11.212\\).', do: [['var', 'sum', 11.212]] },
        { cap: 'Divide each by 11.212: \\([0.659, 0.242, 0.099]\\). They now sum to 1.', do: [['set', 'c0', { h: 132, kind: 'c', state: 'active' }], ['set', 'c1', { h: 48, kind: 'c' }], ['set', 'c2', { h: 20, kind: 'c' }], ['var', 'p', '[0.659, 0.242, 0.099]']] },
        { cap: 'Temperature \\(T = 0.5\\) (scores doubled): \\([0.864, 0.117, 0.019]\\). Sharper; A now dominates.', do: [['set', 'c0', { h: 173 }], ['set', 'c1', { h: 23 }], ['set', 'c2', { h: 4 }], ['var', 'p', '[0.864, 0.117, 0.019]']] }
      ] },
    example: { given: 'Logits \\(\\mathbf{z} = [2, 1, 0.1]\\).',
      steps: ['\\(e^{2} \\approx 7.389\\), \\(e^{1} \\approx 2.718\\), \\(e^{0.1} \\approx 1.105\\).', 'Sum: \\(7.389 + 2.718 + 1.105 = 11.212\\).', '\\(p = [\\frac{7.389}{11.212}, \\frac{2.718}{11.212}, \\frac{1.105}{11.212}] \\approx [0.659, 0.242, 0.099]\\).', 'Check: \\(0.659 + 0.242 + 0.099 = 1.000\\). ✓', 'With \\(T = 2\\) the scores halve to \\([1, 0.5, 0.05]\\), giving \\([0.502, 0.304, 0.194]\\): flatter.'],
      result: '\\(p \\approx [0.659, 0.242, 0.099]\\). If class A is correct, the [[cross-entropy]] loss is \\(-\\ln \\, 0.659 \\approx 0.417\\).' },
    lab: { h: 'Logits and temperature', body: 'Set three logits and a temperature. The bars are the probabilities.', size: [800, 280],
      controls: [{ id: 'z1', type: 'range', label: 'Logit A', min: -3, max: 3, step: 0.5, value: 2 }, { id: 'z2', type: 'range', label: 'Logit B', min: -3, max: 3, step: 0.5, value: 1 }, { id: 'z3', type: 'range', label: 'Logit C', min: -3, max: 3, step: 0.5, value: 0 }, { id: 'T', type: 'range', label: 'Temperature T', min: 0.25, max: 4, step: 0.25, value: 1 }],
      view: s => { const z = [s.v.z1, s.v.z2, s.v.z3], m = Math.max(...z), ex = z.map(v => Math.exp((v - m) / s.v.T)), S = ex[0] + ex[1] + ex[2], p = ex.map(v => v / S);
        const nodes = Object.assign(MLD1_bars('c', p, 250, 150, 245, 210, 60, 'c', p.indexOf(Math.max(...p))), MLD1_axis([['t0', 250, 'A'], ['t1', 400, 'B'], ['t2', 550, 'C']], 263));
        return { nodes, vars: { p: '[' + p.map(v => MLD1_r(v, 3)).join(', ') + ']' } }; },
      readout: s => { const z = [s.v.z1, s.v.z2, s.v.z3], m = Math.max(...z), ex = z.map(v => Math.exp((v - m) / s.v.T)), S = ex[0] + ex[1] + ex[2];
        return [['p(A)', MLD1_r(ex[0] / S)], ['p(B)', MLD1_r(ex[1] / S)], ['p(C)', MLD1_r(ex[2] / S)], ['sum', MLD1_r((ex[0] + ex[1] + ex[2]) / S)]]; } },
    pitfalls: ['`exp(1000)` overflows. Real code subtracts the largest logit first; the answer is identical because the shift cancels in the division.', 'Adding the same number to every logit changes nothing. Only the differences between them matter.', 'Softmax picks one class out of K. For several independent yes/no labels, use a [[sigmoid]] per label instead.'],
    code: 'import math\n\ndef softmax(z, T=1.0):\n    m = max(z)                                  # for stability\n    e = [math.exp((v - m) / T) for v in z]\n    s = sum(e)\n    return [round(v / s, 3) for v in e]\n\nprint(softmax([2, 1, 0.1]))         # [0.659, 0.242, 0.099]\nprint(softmax([2, 1, 0.1], T=0.5))  # [0.864, 0.117, 0.019]\n\n# PyTorch: torch.softmax(logits, dim=-1)',
    lang: 'Python'
  },

  'logistic regression': {
    intuition: '[[logistic regression|Logistic regression]] answers a yes/no question with a probability. It has two parts you already know.\n\nFirst, a [[dot product]]: weigh each input feature and add a bias, giving a score \\(z\\). Then a [[sigmoid]] squashes \\(z\\) into a probability between 0 and 1. Above your [[threshold]] (often 0.5), say yes.\n\nIt trains with [[cross-entropy]] loss and [[gradient descent]]. It is also exactly one [[neuron]]: a neural network is many of these stacked, with other activations in between.',
    formula: ['p = \\sigma(\\mathbf{w} \\cdot \\mathbf{x} + b) = \\frac{1}{1 + e^{-(\\mathbf{w} \\cdot \\mathbf{x} + b)}}', 'L = -\\left[ y \\ln \\, p + (1 - y) \\ln \\, (1 - p) \\right]', '\\frac{\\partial L}{\\partial w_j} = (p - y) \\, x_j, \\quad \\frac{\\partial L}{\\partial b} = p - y'],
    symbols: [['\\mathbf{x}', 'the input features of one example'], ['\\mathbf{w}', 'one weight per feature'], ['b', 'the bias: shifts where the yes/no boundary sits'], ['p', 'the predicted probability of "yes"'], ['y', 'the true label: 1 for yes, 0 for no'], ['L', 'binary cross-entropy for one example'], ['p - y', 'the error; the gradient is simply error times input']],
    figure: { h: 'One prediction, end to end', size: [800, 260],
      nodes: { x: { x: 90, y: 130, label: 'x = 3 hours', w: 130, kind: 'a' }, z: { x: 290, y: 130, label: 'z = wx + b', w: 130, kind: 'b' }, s: { x: 480, y: 130, label: 'σ(z)', w: 110, kind: 'c' }, d: { x: 680, y: 130, label: 'p ≥ 0.5 ?', w: 130, kind: 'd' } },
      edges: [['x', 'z'], ['z', 's'], ['s', 'd']],
      steps: [
        { cap: 'Will a student pass? One feature: \\(x = 3\\) hours studied. Learned \\(w = 1.5\\), \\(b = -4\\).', do: [['var', 'w', 1.5], ['var', 'b', -4]] },
        { cap: 'Score: \\(z = 1.5 \\times 3 - 4 = 0.5\\). Positive leans yes, but it is not a probability yet.', do: [['send', 'x', 'z', '3'], ['set', 'z', { label: 'z = 0.5', state: 'active' }]] },
        { cap: 'Squash: \\(\\sigma(0.5) = \\frac{1}{1 + e^{-0.5}} \\approx 0.622\\).', do: [['send', 'z', 's', '0.5'], ['set', 's', { label: 'p = 0.622', state: 'active' }]] },
        { cap: 'Threshold 0.5: \\(0.622 \\ge 0.5\\), so predict "pass".', do: [['send', 's', 'd', '0.622'], ['set', 'd', { label: 'pass', state: 'ok' }]] },
        { cap: 'The student did pass (\\(y = 1\\)). Loss \\(-\\ln \\, 0.622 \\approx 0.474\\). Gradient \\((p - y)x \\approx -1.133\\) says: raise w.', do: [['note', 'd', 'loss 0.474'], ['var', '∂L/∂w', -1.133]] }
      ] },
    example: { given: 'One feature, hours studied \\(x = 3\\). Weights \\(w = 1.5\\), \\(b = -4\\). True label \\(y = 1\\) (passed).',
      steps: ['Score: \\(z = 1.5 \\times 3 + (-4) = 0.5\\).', 'Probability: \\(e^{-0.5} \\approx 0.6065\\), so \\(p = \\frac{1}{1.6065} \\approx 0.6225\\).', 'Loss (y = 1): \\(L = -\\ln \\, 0.6225 \\approx 0.474\\).', 'Gradients: \\(p - y = -0.3775\\), so \\(\\frac{\\partial L}{\\partial w} = -0.3775 \\times 3 \\approx -1.133\\) and \\(\\frac{\\partial L}{\\partial b} \\approx -0.378\\).', 'The boundary where \\(p = 0.5\\) is where \\(z = 0\\): \\(x = -b / w = 4 / 1.5 \\approx 2.67\\) hours.'],
      result: '\\(p \\approx 0.62\\), so it predicts pass. Both gradients are negative, so gradient descent raises w and b, pushing p toward 1.' },
    lab: { h: 'Fit the boundary', body: 'Seven students, 1 to 7 hours. Teal bars passed, pink bars failed. Each bar\'s height is the model\'s p(pass). Lower the average loss.', size: [800, 300],
      controls: [{ id: 'w', type: 'range', label: 'Weight w', min: -1, max: 4, step: 0.25, value: 1.5 }, { id: 'b', type: 'range', label: 'Bias b', min: -14, max: 2, step: 0.5, value: -4 }],
      view: s => { const ys = [0, 0, 1, 0, 1, 1, 1], nodes = {};
        ys.forEach((y, i) => { const p = MLD1_sig(s.v.w * (i + 1) + s.v.b); nodes['c' + i] = { x: 130 + i * 90, y: 250, shape: 'bar', w: 40, h: Math.max(2, Math.round(p * 200)), kind: y ? 'c' : 'e', state: (p >= 0.5) === !!y ? undefined : 'bad' }; nodes['t' + i] = { x: 130 + i * 90, y: 268, shape: 'text', label: (i + 1) + 'h' }; });
        return { nodes, vars: { boundary: s.v.w ? MLD1_r(-s.v.b / s.v.w, 2) + ' h' : 'none' } }; },
      readout: s => { const ys = [0, 0, 1, 0, 1, 1, 1]; let L = 0, ok = 0; ys.forEach((y, i) => { const p = MLD1_sig(s.v.w * (i + 1) + s.v.b); L += -Math.log(y ? p : 1 - p); ok += (p >= 0.5) === !!y; });
        return [['average loss', MLD1_r(L / 7)], ['correct at 0.5', ok + ' / 7'], ['boundary −b/w', s.v.w ? MLD1_r(-s.v.b / s.v.w, 2) + ' hours' : 'none']]; } },
    pitfalls: ['It draws a straight boundary. If yes/no depends on a curve or a combination, add features or use a network.', 'Scale your features. One feature in millions and one in fractions makes [[gradient descent]] crawl.', 'Despite the name, it is a classifier, not regression. "Regression" refers to fitting the score z.'],
    code: 'import math\n\nw, b = 1.5, -4.0\nx, y = 3.0, 1\nz = w * x + b                    # 0.5\np = 1 / (1 + math.exp(-z))       # 0.6225\nloss = -math.log(p) if y else -math.log(1 - p)\nprint(round(p, 4), round(loss, 3))        # 0.6225 0.474\nprint(round((p - y) * x, 3), round(p - y, 3))  # -1.133 -0.378\n\n# scikit-learn: LogisticRegression().fit(X, y).predict_proba(X)',
    lang: 'Python'
  },

  'regularization': {
    intuition: 'A model with lots of freedom can bend itself to fit every quirk of the training data, noise included. That is [[overfitting]]. [[regularization|Regularization]] makes complexity cost something.\n\nThe most common kind, L2, adds a penalty for large [[weights]] to the loss: \\(\\lambda\\) times the sum of squared weights. Now the model must trade fitting the data against keeping weights small. Smaller weights mean a smoother, simpler function that copes better with new data.\n\nIn the update step, L2 shows up as "shrink every weight a little, every step". That is why it is also called weight decay.',
    formula: ['L_{\\text{total}} = L_{\\text{data}} + \\lambda \\sum_{j} w_j^2', 'w \\leftarrow w - \\eta \\left( \\frac{\\partial L_{\\text{data}}}{\\partial w} + 2 \\lambda w \\right)'],
    symbols: [['L_{\\text{data}}', 'the usual loss, such as MSE or cross-entropy'], ['\\lambda', 'lambda, the regularization strength; 0 means none'], ['\\sum_j w_j^2', 'the sum of every squared weight (the squared L2 norm)'], ['2 \\lambda w', 'the penalty\'s slope: always pulls the weight toward 0'], ['\\eta', 'the learning rate']],
    figure: { h: 'Turning up λ shrinks the weights', size: [800, 300],
      nodes: Object.assign(MLD1_bars('c', [3, 1.5, 0.6], 250, 150, 250, 60, 60, 'b'), MLD1_axis([['t0', 250, 'w₁'], ['t1', 400, 'w₂'], ['t2', 550, 'w₃']], 268)),
      steps: [
        { cap: 'With no penalty (\\(\\lambda = 0\\)) each weight fits the data best at 3, 1.5 and 0.6.', do: [['var', 'λ', 0], ['var', 'w', '[3, 1.5, 0.6]']] },
        { cap: 'For a loss like \\((w - t)^2\\), adding \\(\\lambda w^2\\) moves the best weight to \\(t / (1 + \\lambda)\\).', do: [['note', 'c0', 'best w = 3 / (1 + λ)']] },
        { cap: '\\(\\lambda = 0.5\\): every weight is divided by 1.5, giving 2, 1 and 0.4.', do: [['set', 'c0', { h: 120 }], ['set', 'c1', { h: 60 }], ['set', 'c2', { h: 24 }], ['var', 'λ', 0.5], ['var', 'w', '[2, 1, 0.4]']] },
        { cap: '\\(\\lambda = 2\\): divided by 3, giving 1, 0.5 and 0.2. A simpler, smoother model.', do: [['set', 'c0', { h: 60 }], ['set', 'c1', { h: 30 }], ['set', 'c2', { h: 12 }], ['var', 'λ', 2], ['var', 'w', '[1, 0.5, 0.2]']] },
        { cap: 'L2 shrinks weights but never makes them exactly 0. Too much λ and the model underfits.', do: [['set', 'c2', { state: 'warn' }], ['focus', 'c2']] }
      ] },
    example: { given: 'Data loss \\((w - 3)^2\\), plus an L2 penalty with \\(\\lambda = 0.5\\).',
      steps: ['Total: \\(L = (w - 3)^2 + 0.5 w^2\\).', 'Slope: \\(2(w - 3) + 2(0.5)w = 3w - 6\\). Set it to 0: \\(w = 2\\).', 'At \\(w = 2\\): \\(L = (2 - 3)^2 + 0.5 \\times 4 = 1 + 2 = 3\\).', 'At the unregularized best \\(w = 3\\): \\(L = 0 + 0.5 \\times 9 = 4.5\\). Worse, so the penalty really does move the answer.', 'With several weights \\([3, -1, 0.5]\\) and \\(\\lambda = 0.01\\): penalty \\(= 0.01 \\times (9 + 1 + 0.25) = 0.1025\\).'],
      result: 'The best weight drops from 3 to \\(3 / (1 + 0.5) = 2\\). The model gives up a little training fit for smaller weights.' },
    lab: { h: 'Pull of the penalty', body: 'Bars show the total loss \\((w - 3)^2 + \\lambda w^2\\) for w from 0 to 4. The dot marks the best w. Raise λ and watch it slide toward 0.', size: [800, 300],
      controls: [{ id: 'lam', type: 'range', label: 'Strength λ', min: 0, max: 4, step: 0.25, value: 0.5 }],
      view: s => { const lam = s.v.lam, ws = Array.from({ length: 17 }, (_, i) => i * 0.25), tot = ws.map(w => MLD1_bowl(w) + lam * w * w), mx = Math.max(...tot), sc = 200 / mx, best = 3 / (1 + lam), bl = MLD1_bowl(best) + lam * best * best;
        const nodes = Object.assign(MLD1_bars('c', tot, 100, 37.5, 260, sc, 24, 'b'), MLD1_axis([['x0', 100, 'w = 0'], ['x3', 550, 'w = 3'], ['x4', 700, 'w = 4']], 278));
        nodes.m = { x: Math.round(100 + best * 150), y: Math.round(260 - bl * sc - 18), shape: 'circle', w: 24, label: 'w', kind: 'a', state: 'active' };
        return { nodes, vars: { 'best w': MLD1_r(best) } }; },
      readout: s => { const best = 3 / (1 + s.v.lam); return [['best w = 3 / (1 + λ)', MLD1_r(best)], ['data loss', MLD1_r(MLD1_bowl(best))], ['penalty λw²', MLD1_r(s.v.lam * best * best)]]; } },
    pitfalls: ['λ is tuned on the [[validation set]], never the [[test set]].', 'Too much λ causes [[underfitting]]: weights squashed so small that the model cannot fit even the training data.', 'In PyTorch, `weight_decay` in the optimizer is L2-style shrinkage. With Adam, prefer `AdamW`, which applies the decay correctly.', 'L1 (sum of \\(|w|\\)) drives some weights to exactly 0. Dropout, early stopping and more data are other kinds of regularization.'],
    code: 'import torch\n\nmodel = torch.nn.Linear(10, 1)\n# option 1: add the penalty to the loss yourself\nlam = 0.01\nl2 = sum((p ** 2).sum() for p in model.parameters())\n# loss = data_loss + lam * l2\n\n# option 2: let the optimizer decay weights each step\nopt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)',
    lang: 'Python'
  }
};

;
// Glossary deep dives, part 2: evaluation, ranking, Transformer mechanics, LoRA and quantization.
// Merged into ML_GLOSSARY by course.js. Every number below was checked with node.

// Ten emails with a model's spam score and the truth (1 = really spam). Shared by the precision and recall labs.
const MLD2_PR_DATA = [[0.95, 1], [0.90, 1], [0.85, 0], [0.80, 1], [0.70, 0], [0.60, 1], [0.50, 0], [0.40, 1], [0.30, 0], [0.20, 0]];
const MLD2_prCounts = t => {
  const c = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const [s, y] of MLD2_PR_DATA) { const f = s >= t - 1e-9; if (f && y) c.tp++; else if (f) c.fp++; else if (y) c.fn++; else c.tn++; }
  return c;
};
const MLD2_ratio = (n, d) => d ? (n / d).toFixed(3) + '  (' + n + '/' + d + ')' : 'undefined (0/0)';
const MLD2_prLab = first => ({
  h: 'Move the threshold', body: 'Ten emails, sorted by spam score. Teal = really spam. Emails at or above the threshold get flagged. ✓ TP · ✕ FP · ! FN · faded = TN.',
  size: [800, 200],
  controls: [{ id: 't', type: 'range', label: 'Threshold', min: 0.05, max: 1, step: 0.05, value: 0.5 }],
  view: s => {
    const nodes = {};
    MLD2_PR_DATA.forEach(([sc, y], i) => {
      const f = sc >= s.v.t - 1e-9;
      nodes['e' + i] = { x: 50 + i * 78, y: 80, shape: 'circle', w: 50, label: sc.toFixed(2).slice(1), sub: y ? 'spam' : 'safe', kind: y ? 'c' : 'n', state: f ? (y ? 'ok' : 'bad') : (y ? 'warn' : 'off') };
    });
    const c = MLD2_prCounts(s.v.t);
    nodes.leg = { x: 400, y: 165, shape: 'text', label: 'flag if score ≥ ' + s.v.t.toFixed(2) + ':  TP ' + c.tp + ' · FP ' + c.fp + ' · FN ' + c.fn + ' · TN ' + c.tn };
    return { nodes };
  },
  readout: s => {
    const c = MLD2_prCounts(s.v.t), p = ['Precision TP/(TP+FP)', MLD2_ratio(c.tp, c.tp + c.fp)], r = ['Recall TP/(TP+FN)', MLD2_ratio(c.tp, c.tp + c.fn)];
    return first === 'recall' ? [r, p] : [p, r];
  }
});
const MLD2_bar = (x, v, label, extra) => Object.assign({ x, y: 200, shape: 'bar', w: 60, h: Math.max(2, Math.round(v * 150)), label, sub: v.toFixed(3) }, extra || {});
const MLD2_DOCS_REL = [2, 5, 9];
const MLD2_dcg = rels => rels.reduce((a, r, i) => a + r / Math.log2(i + 2), 0);
const MLD2_softmax = a => { const m = Math.max(...a), e = a.map(x => Math.exp(x - m)), z = e.reduce((p, q) => p + q, 0); return e.map(x => x / z); };
const MLD2_ATT = { Q: [[1, 0], [0, 1], [1, 1]], K: [[1, 0], [1, 1], [0, 1]], V: [[1, 0], [0, 1], [2, 2]] };
const MLD2_KV_MODELS = { 'Llama-2-7B (32 layers, 32 KV heads)': [32, 32], 'Llama-3-8B (32 layers, 8 KV heads)': [32, 8], 'Llama-3-70B (80 layers, 8 KV heads)': [80, 8], 'Qwen2.5-1.5B (28 layers, 2 KV heads)': [28, 2] };
const MLD2_kvBytes = v => { const [L, H] = MLD2_KV_MODELS[v.m]; return 2 * L * H * 128 * v.tok * v.batch * (String(v.prec).startsWith('fp16') ? 2 : 1); };
const MLD2_W = [0.37, -1.52, 0.04, 0.88, -0.61];

const ML_DEEP_2 = {
  'precision': {
    intuition: 'Precision answers: **when the model says "yes", how often is it right?** It only looks at the items the model flagged. Missed positives do not affect it at all.\n\nThink of a spam filter. High precision means the spam folder holds almost no real mail. You care about it when a false alarm is expensive: blocking a customer, or paging an engineer at 3 a.m.',
    formula: ['\\text{Precision} = \\frac{TP}{TP + FP}'],
    symbols: [['TP', 'true positives: flagged, and really positive'], ['FP', 'false positives: flagged, but really negative (false alarms)'], ['TP + FP', 'everything the model flagged']],
    figure: { h: 'Precision of a spam filter at threshold 0.5', size: [800, 240],
      nodes: { m: { x: 100, y: 120, label: 'Spam model', sub: '10 emails scored', kind: 'a' } },
      steps: [
        { cap: 'Ten emails get a spam score. Five really are spam. Flag anything scoring 0.5 or more.', do: [['var', 'threshold', '0.5']] },
        { cap: 'Seven emails score 0.5 or more, so the model flags 7.', do: [['add', 'fl', { x: 360, y: 120, label: 'Flagged: 7', sub: 'score ≥ 0.5', kind: 'b' }], ['link', 'm', 'fl'], ['send', 'm', 'fl', '7']] },
        { cap: 'Check the flagged pile: 4 really are spam. These are true positives (TP).', do: [['add', 'tp', { x: 640, y: 55, label: 'TP = 4', sub: 'right alarms', kind: 'c', state: 'ok' }], ['link', 'fl', 'tp'], ['send', 'fl', 'tp', '4']] },
        { cap: 'The other 3 flagged emails were safe. These are false positives (FP).', do: [['add', 'fp', { x: 640, y: 185, label: 'FP = 3', sub: 'false alarms', kind: 'e', state: 'bad' }], ['link', 'fl', 'fp'], ['send', 'fl', 'fp', '3']] },
        { cap: 'Precision = \\(4 / (4 + 3) = 4/7 \\approx 0.571\\). Only 57% of the flags are right.', do: [['var', 'precision', '0.571'], ['focus', 'tp', 'fp', 'fl']] }
      ] },
    example: { given: 'A fraud model flags 50 transactions. Investigators find that 40 of them really are fraud.',
      steps: ['True positives: \\(TP = 40\\). False positives: \\(FP = 50 - 40 = 10\\).', 'Precision \\(= \\frac{40}{40 + 10} = \\frac{40}{50}\\).', '\\(\\frac{40}{50} = 0.8\\).'],
      result: 'Precision is 0.8: 4 out of 5 alarms are real. It says nothing about fraud the model missed.' },
    lab: MLD2_prLab('precision'),
    pitfalls: ['If the model flags nothing, TP + FP = 0 and precision is undefined. Libraries return 0 and print a warning.', 'You can get perfect precision by flagging only the single most obvious case. Always report recall next to it.', 'Precision changes with the [[threshold]]. A precision number without its threshold is half a fact.'],
    code: 'from sklearn.metrics import precision_score\n\ny_true = [1, 1, 0, 1, 0, 1, 0, 1, 0, 0]\nscores = [.95, .90, .85, .80, .70, .60, .50, .40, .30, .20]\ny_pred = [int(s >= 0.5) for s in scores]\n\nprint(precision_score(y_true, y_pred))  # 0.5714... = 4/7', lang: 'Python'
  },

  'recall': {
    intuition: 'Recall answers: **of all the real positives, how many did the model catch?** It only looks at the items that really are positive. False alarms do not affect it.\n\nThink of a cancer screen. High recall means almost no sick patient goes home undetected. You care about it when a miss is expensive: fraud that slips through, or a relevant document a RAG system never retrieves.',
    formula: ['\\text{Recall} = \\frac{TP}{TP + FN}'],
    symbols: [['TP', 'true positives: real positives the model caught'], ['FN', 'false negatives: real positives the model missed'], ['TP + FN', 'every real positive in the data']],
    figure: { h: 'Recall of the same spam filter', size: [800, 240],
      nodes: { all: { x: 110, y: 120, label: 'Real spam', sub: '5 emails', kind: 'c' } },
      steps: [
        { cap: 'Start from the truth: 5 emails really are spam. Recall only looks at these 5.', do: [['focus', 'all'], ['var', 'threshold', '0.5']] },
        { cap: 'At threshold 0.5 the model flags 4 of them. These are true positives (TP).', do: [['add', 'tp', { x: 420, y: 55, label: 'Caught: 4', sub: 'TP', kind: 'c', state: 'ok' }], ['link', 'all', 'tp'], ['send', 'all', 'tp', '4']] },
        { cap: 'One spam email scored 0.40 and slipped through. That is a false negative (FN).', do: [['add', 'fn', { x: 420, y: 185, label: 'Missed: 1', sub: 'FN (score 0.40)', kind: 'd', state: 'warn' }], ['link', 'all', 'fn'], ['send', 'all', 'fn', '1']] },
        { cap: 'Recall = \\(4 / (4 + 1) = 0.8\\). The filter catches 80% of spam.', do: [['add', 'r', { x: 680, y: 120, label: 'Recall 0.8', kind: 'a', state: 'ok' }], ['link', 'tp', 'r'], ['link', 'fn', 'r']] },
        { cap: 'Raise the threshold to 0.75: TP drops to 3, FN rises to 2. Recall falls to \\(3/5 = 0.6\\).', do: [['set', 'tp', { label: 'Caught: 3' }], ['set', 'fn', { label: 'Missed: 2', sub: 'FN (0.60, 0.40)' }], ['set', 'r', { label: 'Recall 0.6', state: 'warn' }], ['var', 'threshold', '0.75']] }
      ] },
    example: { given: 'There were 80 fraudulent transactions last month. The model flagged 50 transactions, and 40 of those were fraud.',
      steps: ['Caught fraud: \\(TP = 40\\). Missed fraud: \\(FN = 80 - 40 = 40\\).', 'Recall \\(= \\frac{40}{40 + 40} = \\frac{40}{80}\\).', '\\(\\frac{40}{80} = 0.5\\).'],
      result: 'Recall is 0.5: half the fraud got through, even though precision was a healthy 0.8.' },
    lab: MLD2_prLab('recall'),
    pitfalls: ['Flagging everything gives recall 1.0 and useless precision. Never report recall alone.', 'Lowering the [[threshold]] can only keep or raise recall. It usually lowers precision. That is the trade-off a [[PR curve]] shows.', 'On rare classes (1% fraud), accuracy can be 99% while recall is 0. Check recall on the class you care about.'],
    code: 'from sklearn.metrics import recall_score\n\ny_true = [1, 1, 0, 1, 0, 1, 0, 1, 0, 0]\nscores = [.95, .90, .85, .80, .70, .60, .50, .40, .30, .20]\n\nfor t in (0.5, 0.75):\n    y_pred = [int(s >= t) for s in scores]\n    print(t, recall_score(y_true, y_pred))  # 0.5 -> 0.8, 0.75 -> 0.6', lang: 'Python'
  },

  'F1 score': {
    intuition: 'F1 squeezes [[precision]] and [[recall]] into one number. It uses the **harmonic mean**, not the plain average. The harmonic mean is pulled hard toward the smaller value.\n\nSo a model cannot hide a terrible recall behind a great precision. F1 is high only when both are high. It is a good default when you need one number to compare models on an imbalanced class.',
    formula: ['F_1 = \\frac{2 \\cdot P \\cdot R}{P + R}', 'F_1 = \\frac{2}{\\frac{1}{P} + \\frac{1}{R}} = \\frac{2\\,TP}{2\\,TP + FP + FN}'],
    symbols: [['P', 'precision, between 0 and 1'], ['R', 'recall, between 0 and 1'], ['F_1', 'the harmonic mean of P and R, between 0 and 1']],
    figure: { h: 'Why F1 uses the harmonic mean', size: [800, 240],
      nodes: { p: MLD2_bar(150, 0.9, 'P', { kind: 'a' }), r: MLD2_bar(300, 0.1, 'R', { kind: 'b' }) },
      steps: [
        { cap: 'Precision 0.9, recall 0.1: the model is careful but misses 90% of positives.', do: [['focus', 'p', 'r']] },
        { cap: 'The plain average is \\((0.9 + 0.1)/2 = 0.5\\). That hides how bad recall is.', do: [['add', 'avg', MLD2_bar(480, 0.5, 'avg', { kind: 'd', state: 'warn' })]] },
        { cap: 'F1 = \\(2 \\cdot 0.9 \\cdot 0.1 / (0.9 + 0.1) = 0.18 / 1.0 = 0.18\\). The weak score drags it down.', do: [['add', 'f1', MLD2_bar(660, 0.18, 'F1', { kind: 'e', state: 'bad' })]] },
        { cap: 'Balance them at P = R = 0.5: average and F1 are both 0.5. F1 rewards balance.', do: [['set', 'p', MLD2_bar(150, 0.5, 'P', { kind: 'a' })], ['set', 'r', MLD2_bar(300, 0.5, 'R', { kind: 'b' })], ['set', 'avg', MLD2_bar(480, 0.5, 'avg', { kind: 'd' })], ['set', 'f1', MLD2_bar(660, 0.5, 'F1', { kind: 'e', state: 'ok' })]] }
      ] },
    example: { given: 'Case 1: P = 0.9, R = 0.1. Case 2: the spam filter at threshold 0.5, with TP = 4, FP = 3, FN = 1.',
      steps: ['Case 1 numerator: \\(2 \\cdot 0.9 \\cdot 0.1 = 0.18\\).', 'Case 1 denominator: \\(0.9 + 0.1 = 1.0\\), so \\(F_1 = 0.18\\). The plain average would say 0.5.', 'Case 2 with counts: \\(F_1 = \\frac{2 \\cdot 4}{2 \\cdot 4 + 3 + 1} = \\frac{8}{12} \\approx 0.667\\).', 'Check with P and R: \\(P = 4/7 \\approx 0.571\\), \\(R = 0.8\\), so \\(\\frac{2 \\cdot 0.571 \\cdot 0.8}{0.571 + 0.8} = \\frac{0.914}{1.371} \\approx 0.667\\).'],
      result: 'F1 of 0.18 flags the lopsided model. F1 of 0.667 is a fair one-number summary of the spam filter.' },
    lab: { h: 'Harmonic vs plain average', body: 'Drag precision and recall. Watch F1 hug the smaller one.', size: [800, 240],
      controls: [{ id: 'p', type: 'range', label: 'Precision P', min: 0, max: 1, step: 0.05, value: 0.9 }, { id: 'r', type: 'range', label: 'Recall R', min: 0, max: 1, step: 0.05, value: 0.1 }],
      view: s => { const p = s.v.p, r = s.v.r, f = p + r ? 2 * p * r / (p + r) : 0;
        return { nodes: { p: MLD2_bar(150, p, 'P', { kind: 'a' }), r: MLD2_bar(300, r, 'R', { kind: 'b' }), avg: MLD2_bar(480, (p + r) / 2, 'avg', { kind: 'd' }), f1: MLD2_bar(660, f, 'F1', { kind: 'e', state: f >= 0.7 ? 'ok' : f < 0.3 ? 'bad' : undefined }) } }; },
      readout: s => { const p = s.v.p, r = s.v.r; return [['Plain average', ((p + r) / 2).toFixed(3)], ['F1 = 2PR/(P+R)', p + r ? (2 * p * r / (p + r)).toFixed(3) : '0 (both are 0)']]; } },
    pitfalls: ['F1 ignores true negatives. That is a feature for rare classes, but it cannot tell you how many good emails you leave alone.', 'F1 weights precision and recall equally. If a miss costs 10× a false alarm, pick the threshold by cost, or use F-beta with beta > 1.', 'Multi-class "macro" F1 averages per-class F1; "micro" F1 pools all counts first. They can differ a lot. Say which one you report.'],
    code: 'from sklearn.metrics import f1_score\n\ny_true = [1, 1, 0, 1, 0, 1, 0, 1, 0, 0]\ny_pred = [1, 1, 1, 1, 1, 1, 1, 0, 0, 0]  # threshold 0.5\nprint(f1_score(y_true, y_pred))  # 0.6667 = 8/12\n\nP, R = 0.9, 0.1\nprint((P + R) / 2, 2 * P * R / (P + R))  # 0.5 vs 0.18', lang: 'Python'
  },

  'Recall@K': {
    intuition: 'A search engine or RAG retriever returns a ranked list. The user (or the LLM) only reads the top K. **Recall@K asks: of the relevant items, how many made it into those top K?**\n\nWith one right answer per query, it is a simple hit or miss: 1 if the answer is in the top K, else 0. Averaged over many queries, it becomes the "hit rate". For RAG, it tells you if the right chunk even reached the prompt.',
    formula: ['\\text{Recall@}K = \\frac{|\\text{relevant} \\cap \\text{top } K|}{|\\text{relevant}|}'],
    symbols: [['K', 'how many top results you look at'], ['\\text{relevant}', 'the set of items that really answer the query'], ['\\cap', 'items in both sets: relevant AND in the top K'], ['|\\cdot|', 'how many items are in a set']],
    figure: { h: 'Ten results, three relevant (ranks 2, 5, 9)', size: [800, 180],
      nodes: Object.fromEntries(Array.from({ length: 10 }, (_, i) => ['d' + (i + 1), { x: 50 + i * 78, y: 80, w: 48, label: '#' + (i + 1), sub: MLD2_DOCS_REL.includes(i + 1) ? 'rel' : '', kind: MLD2_DOCS_REL.includes(i + 1) ? 'c' : 'n' }])),
      steps: [
        { cap: 'A query returns 10 results. Three are relevant (teal): ranks 2, 5 and 9.', do: [['var', 'relevant', '3']] },
        { cap: 'K = 3: only ranks 1-3 count. One relevant result is there. Recall@3 = \\(1/3 \\approx 0.33\\).', do: [['focus', 'd1', 'd2', 'd3'], ['set', 'd2', { state: 'ok' }], ['var', 'Recall@3', '0.33']] },
        { cap: 'K = 5: two of the three are found. Recall@5 = \\(2/3 \\approx 0.67\\).', do: [['focus', 'd1', 'd2', 'd3', 'd4', 'd5'], ['set', 'd5', { state: 'ok' }], ['var', 'Recall@5', '0.67']] },
        { cap: 'K = 10: all three are found. Recall@10 = 1. A bigger K can never lower recall.', do: [['set', 'd9', { state: 'ok' }], ['var', 'Recall@10', '1.00']] }
      ] },
    example: { given: 'Three test queries, K = 5. Query A has relevant docs at ranks 2, 5, 9. Query B has one relevant doc at rank 7. Query C has two relevant docs, at ranks 1 and 4.',
      steps: ['Query A: ranks 2 and 5 are in the top 5, rank 9 is not. \\(2/3 \\approx 0.667\\).', 'Query B: rank 7 is outside the top 5. \\(0/1 = 0\\).', 'Query C: both ranks 1 and 4 are inside. \\(2/2 = 1\\).', 'Average over queries: \\((0.667 + 0 + 1)/3 = 1.667/3 \\approx 0.556\\).'],
      result: 'Recall@5 ≈ 0.556 for this test set. Query B is the one to debug.' },
    lab: { h: 'Slide K', body: 'Relevant docs sit at ranks 2, 5 and 9. Grow K and watch recall climb in steps.', size: [800, 180],
      controls: [{ id: 'k', type: 'range', label: 'K', min: 1, max: 10, value: 3 }],
      view: s => ({ nodes: Object.fromEntries(Array.from({ length: 10 }, (_, i) => { const rel = MLD2_DOCS_REL.includes(i + 1), inK = i < s.v.k;
        return ['d' + (i + 1), { x: 50 + i * 78, y: 80, w: 48, label: '#' + (i + 1), sub: rel ? 'rel' : '', kind: rel ? 'c' : 'n', state: inK ? (rel ? 'ok' : undefined) : 'off' }]; })) }),
      readout: s => { const f = MLD2_DOCS_REL.filter(r => r <= s.v.k).length; return [['Relevant in top K', f + ' of 3'], ['Recall@' + s.v.k, (f / 3).toFixed(3)], ['Hit@' + s.v.k + ' (any found?)', f ? '1' : '0']]; } },
    pitfalls: ['Recall@K ignores order inside the top K. Rank 1 and rank K score the same. Use [[MRR]] or [[nDCG]] when position matters.', 'Some tools call the hit-or-miss version "Recall@K" and others "Hit@K". Check the definition before comparing numbers.', 'Compare systems at the same K. Recall@20 always looks better than Recall@5.'],
    code: 'def recall_at_k(ranked_ids, relevant_ids, k):\n    top = set(ranked_ids[:k])\n    return len(top & set(relevant_ids)) / len(relevant_ids)\n\nranked = [f"d{i}" for i in range(1, 11)]\nprint(recall_at_k(ranked, ["d2", "d5", "d9"], 5))  # 0.666...', lang: 'Python'
  },

  'MRR': {
    intuition: 'Users click the first good result and stop. **MRR scores how high that first good result sits.** Rank 1 earns 1 point, rank 2 earns 1/2, rank 3 earns 1/3, and a miss earns 0.\n\nAverage those points over many queries and you get the Mean Reciprocal Rank. It suits question answering and RAG, where one good chunk at the top is what counts.',
    formula: ['\\text{MRR} = \\frac{1}{|Q|} \\sum_{q=1}^{|Q|} \\frac{1}{\\text{rank}_q}'],
    symbols: [['|Q|', 'the number of test queries'], ['\\text{rank}_q', 'the position of the first correct result for query q (1 = top)'], ['\\frac{1}{\\text{rank}_q}', 'the reciprocal rank; counted as 0 if nothing correct was returned']],
    figure: { h: 'MRR over four queries', size: [800, 330],
      nodes: { q1: { x: 130, y: 40, label: 'Query 1', sub: 'first hit: rank 1', kind: 'a', w: 130 }, q2: { x: 130, y: 122, label: 'Query 2', sub: 'first hit: rank 3', kind: 'a', w: 130 }, q3: { x: 130, y: 204, label: 'Query 3', sub: 'first hit: rank 2', kind: 'a', w: 130 }, q4: { x: 130, y: 286, label: 'Query 4', sub: 'no hit in list', kind: 'a', w: 130 } },
      steps: [
        { cap: 'Query 1: the first correct result is at rank 1. Reciprocal rank = \\(1/1 = 1\\).', do: [['add', 'r1', { x: 450, y: 40, label: '1/1 = 1.000', kind: 'c', w: 130, state: 'ok' }], ['link', 'q1', 'r1']] },
        { cap: 'Query 2: first hit at rank 3. Reciprocal rank = \\(1/3 \\approx 0.333\\).', do: [['add', 'r2', { x: 450, y: 122, label: '1/3 = 0.333', kind: 'c', w: 130 }], ['link', 'q2', 'r2']] },
        { cap: 'Query 3: first hit at rank 2. Reciprocal rank = \\(1/2 = 0.5\\).', do: [['add', 'r3', { x: 450, y: 204, label: '1/2 = 0.500', kind: 'c', w: 130 }], ['link', 'q3', 'r3']] },
        { cap: 'Query 4: no correct result anywhere in the list. It scores 0.', do: [['add', 'r4', { x: 450, y: 286, label: '0', kind: 'n', w: 130, state: 'bad' }], ['link', 'q4', 'r4']] },
        { cap: 'MRR = \\((1 + 0.333 + 0.5 + 0)/4 = 1.833/4 \\approx 0.458\\).', do: [['add', 'm', { x: 690, y: 163, label: 'MRR 0.458', kind: 'b', w: 130 }], ['link', 'r1', 'm'], ['link', 'r2', 'm'], ['link', 'r3', 'm'], ['link', 'r4', 'm']] }
      ] },
    example: { given: 'Four queries. The first correct result is at rank 1, rank 3, rank 2, and not found.',
      steps: ['Reciprocal ranks: \\(1/1 = 1\\), \\(1/3 \\approx 0.333\\), \\(1/2 = 0.5\\), and 0.', 'Sum: \\(1 + 0.333 + 0.5 + 0 = 1.833\\).', 'Mean over 4 queries: \\(1.833 / 4 \\approx 0.458\\).'],
      result: 'MRR ≈ 0.458. Moving query 2\'s hit from rank 3 to rank 1 would raise it to \\(2.5/4 = 0.625\\).' },
    lab: { h: 'Move the first hit', body: 'Set where each query\'s first correct result lands. 0 = not found.', size: [800, 240],
      controls: [1, 2, 3].map(i => ({ id: 'r' + i, type: 'range', label: 'Query ' + i + ' first hit rank', min: 0, max: 10, value: [1, 3, 2][i - 1] })),
      view: s => ({ nodes: Object.fromEntries([1, 2, 3].map(i => { const r = s.v['r' + i], rr = r ? 1 / r : 0; return ['b' + i, MLD2_bar(150 + (i - 1) * 200, rr, 'Q' + i, { kind: 'c', state: r ? undefined : 'bad' })]; })) }),
      readout: s => { const rr = [1, 2, 3].map(i => s.v['r' + i] ? 1 / s.v['r' + i] : 0); return [['Reciprocal ranks', rr.map(x => x.toFixed(3)).join(', ')], ['MRR', (rr.reduce((a, b) => a + b, 0) / 3).toFixed(3)]]; } },
    pitfalls: ['MRR only counts the first correct result. Five more good results below it change nothing. Use [[nDCG]] when the whole list matters.', 'Falling from rank 1 to 2 costs 0.5 points; from rank 9 to 10 costs about 0.01. MRR mostly cares about the very top.', 'Usually MRR is computed on the top 10 only (MRR@10). A hit at rank 50 then counts as 0.'],
    code: 'def mrr(first_hit_ranks):\n    # rank is 1-based; None means no correct result\n    return sum(1 / r if r else 0 for r in first_hit_ranks) / len(first_hit_ranks)\n\nprint(mrr([1, 3, 2, None]))  # 0.4583...', lang: 'Python'
  },

  'nDCG': {
    intuition: 'Some results are perfect, some are just okay. nDCG handles that with **graded relevance** (say 0-3). Each result earns its grade as "gain".\n\nGain lower in the list is discounted: rank i is divided by \\(\\log_2(i + 1)\\), so rank 1 keeps it all and rank 3 keeps half. Add it up to get DCG. Divide by the DCG of the perfect order (IDCG) and you get a score from 0 to 1.',
    formula: ['\\text{DCG@}K = \\sum_{i=1}^{K} \\frac{rel_i}{\\log_2(i + 1)}', '\\text{nDCG@}K = \\frac{\\text{DCG@}K}{\\text{IDCG@}K}'],
    symbols: [['rel_i', 'the relevance grade of the result at rank i (here 0 = useless … 3 = perfect)'], ['\\log_2(i + 1)', 'the position discount: 1 at rank 1, 1.585 at rank 2, 2 at rank 3'], ['\\text{IDCG@}K', 'the DCG of the ideal ranking: the same results sorted best-first'], ['K', 'how many top results are scored']],
    figure: { h: 'nDCG@5 for one ranked list', size: [800, 250],
      nodes: { a1: { x: 90, y: 65, label: 'rel 2', sub: 'rank 1', kind: 'a' }, a2: { x: 240, y: 65, label: 'rel 3', sub: 'rank 2', kind: 'a' }, a3: { x: 390, y: 65, label: 'rel 0', sub: 'rank 3', kind: 'a' }, a4: { x: 540, y: 65, label: 'rel 1', sub: 'rank 4', kind: 'a' }, a5: { x: 690, y: 65, label: 'rel 2', sub: 'rank 5', kind: 'a' } },
      steps: [
        { cap: 'The system returned 5 results with grades 2, 3, 0, 1, 2. The best one (3) sits at rank 2.', do: [['focus', 'a1', 'a2', 'a3', 'a4', 'a5']] },
        { cap: 'Divide each grade by \\(\\log_2(i+1)\\). Ranks 1-2: \\(2/1 = 2\\), \\(3/1.585 = 1.893\\).', do: [['set', 'a1', { sub: '2/1 = 2.000' }], ['set', 'a2', { sub: '3/1.585 = 1.893' }]] },
        { cap: 'Ranks 3-5: \\(0/2 = 0\\), \\(1/2.322 = 0.431\\), \\(2/2.585 = 0.774\\). DCG = 5.097.', do: [['set', 'a3', { sub: '0/2 = 0' }], ['set', 'a4', { sub: '1/2.322 = 0.431' }], ['set', 'a5', { sub: '2/2.585 = 0.774' }], ['var', 'DCG', '5.097']] },
        { cap: 'The ideal order is 3, 2, 2, 1, 0. Its DCG is \\(3 + 1.262 + 1 + 0.431 + 0 = 5.693\\).', do: [['add', 'b1', { x: 90, y: 180, label: 'rel 3', sub: '3/1 = 3.000', kind: 'c' }], ['add', 'b2', { x: 240, y: 180, label: 'rel 2', sub: '2/1.585 = 1.262', kind: 'c' }], ['add', 'b3', { x: 390, y: 180, label: 'rel 2', sub: '2/2 = 1.000', kind: 'c' }], ['add', 'b4', { x: 540, y: 180, label: 'rel 1', sub: '1/2.322 = 0.431', kind: 'c' }], ['add', 'b5', { x: 690, y: 180, label: 'rel 0', sub: '0/2.585 = 0', kind: 'c' }], ['var', 'IDCG', '5.693']] },
        { cap: 'nDCG@5 = \\(5.097 / 5.693 \\approx 0.895\\). Close to perfect; swapping ranks 1 and 2 would help.', do: [['var', 'nDCG@5', '0.895'], ['note', 'a2', 'best result belongs at rank 1']] }
      ] },
    example: { given: 'Grades of the top 5 results, in the order returned: 2, 3, 0, 1, 2.',
      steps: ['Discounts \\(\\log_2(i+1)\\) for ranks 1-5: 1, 1.585, 2, 2.322, 2.585.', 'DCG \\(= 2/1 + 3/1.585 + 0/2 + 1/2.322 + 2/2.585 = 2 + 1.893 + 0 + 0.431 + 0.774 = 5.097\\).', 'Ideal order 3, 2, 2, 1, 0: IDCG \\(= 3 + 1.262 + 1 + 0.431 + 0 = 5.693\\).', 'nDCG@5 \\(= 5.097 / 5.693 \\approx 0.895\\).'],
      result: 'nDCG@5 ≈ 0.895. A perfect ranking scores exactly 1.' },
    lab: { h: 'Re-grade the list', body: 'Set the grade (0-3) at each rank. Put the best result first and watch nDCG reach 1.', size: [800, 240],
      controls: [0, 1, 2, 3, 4].map(i => ({ id: 'g' + i, type: 'range', label: 'Rank ' + (i + 1) + ' grade', min: 0, max: 3, value: [2, 3, 0, 1, 2][i] })),
      view: s => ({ nodes: Object.fromEntries([0, 1, 2, 3, 4].map(i => { const g = s.v['g' + i]; return ['b' + i, Object.assign(MLD2_bar(100 + i * 150, g / 3, '#' + (i + 1), { kind: 'c' }), { sub: (g / Math.log2(i + 2)).toFixed(3) })]; })) }),
      readout: s => { const g = [0, 1, 2, 3, 4].map(i => s.v['g' + i]), d = MLD2_dcg(g), id = MLD2_dcg([...g].sort((a, b) => b - a));
        return [['DCG (bar sub = discounted gain)', d.toFixed(3)], ['IDCG (best order)', id.toFixed(3)], ['nDCG@5', id ? (d / id).toFixed(3) : 'undefined (all grades 0)']]; } },
    pitfalls: ['There are two gain formulas: \\(rel_i\\) (used here and by scikit-learn) and \\(2^{rel_i} - 1\\) (common in web search). They give different numbers. Say which one you use.', 'IDCG must sort ALL known relevant docs for the query, not just the ones you returned. Otherwise a system that misses good docs still scores 1.', 'If every grade is 0, IDCG is 0 and nDCG is undefined. Skip or report those queries separately.'],
    code: 'import numpy as np\nfrom sklearn.metrics import ndcg_score\n\ndef dcg(rels):\n    rels = np.asarray(rels, float)\n    return (rels / np.log2(np.arange(2, len(rels) + 2))).sum()\n\nrels = [2, 3, 0, 1, 2]                     # grades in returned order\nprint(dcg(rels) / dcg(sorted(rels, reverse=True)))  # 0.8954\n\n# same with scikit-learn: true grades + the scores that produced the order\ny_true = np.asarray(rels)[None, :]\ny_score = np.arange(5, 0, -1)[None, :]   # 5, 4, 3, 2, 1\nprint(ndcg_score(y_true, y_score))         # 0.8954', lang: 'Python'
  },

  'positional encoding': {
    intuition: 'Attention treats its input as a bag of tokens. Without help, "dog bites man" and "man bites dog" look identical. A positional encoding **adds a unique vector for each position** to every token embedding.\n\nThe original Transformer used sine and cosine waves. Each pair of dimensions is a clock hand turning at its own speed. Fast hands tell neighbours apart; slow hands tell far-apart positions apart, like the second, minute and hour hands of a watch.',
    formula: ['PE_{(pos,\\,2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d}}\\right)', 'PE_{(pos,\\,2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d}}\\right)', 'x_{pos} = \\text{embedding}(token) + PE_{pos}'],
    symbols: [['pos', 'the token\'s position in the sequence: 0, 1, 2, …'], ['i', 'the index of a sin/cos pair: dims 2i and 2i+1'], ['d', 'the embedding size (the model dimension)'], ['10000^{2i/d}', 'how much slower pair i turns: 1 for i = 0, larger for later pairs'], ['PE_{pos}', 'the d-number position vector added to the embedding']],
    figure: { h: 'Sinusoidal encoding with d = 4', size: [800, 250],
      nodes: { r1: { x: 100, y: 65, label: 'pos = 1', sub: 'd = 4', kind: 'a' } },
      steps: [
        { cap: 'Each position gets a 4-number vector. Dims come in sin/cos pairs; each pair turns at its own speed.', do: [['focus', 'r1']] },
        { cap: 'Pair 0 uses angle = pos. At pos 1: \\(\\sin(1) = 0.841\\), \\(\\cos(1) = 0.540\\).', do: [['add', 'p1a', { x: 270, y: 65, w: 110, label: '0.841', sub: 'sin(1)', kind: 'c' }], ['add', 'p1b', { x: 410, y: 65, w: 110, label: '0.540', sub: 'cos(1)', kind: 'c' }]] },
        { cap: 'Pair 1 divides by \\(10000^{2/4} = 100\\): angle 0.01. \\(\\sin(0.01) = 0.010\\), \\(\\cos(0.01) \\approx 1.000\\).', do: [['add', 'p1c', { x: 550, y: 65, w: 110, label: '0.010', sub: 'sin(0.01)', kind: 'b' }], ['add', 'p1d', { x: 690, y: 65, w: 110, label: '1.000', sub: 'cos(0.01)', kind: 'b' }]] },
        { cap: 'At pos 2 the fast pair jumps to 0.909, −0.416. The slow pair barely moves: 0.020, 1.000.', do: [['add', 'r2', { x: 100, y: 180, label: 'pos = 2', sub: 'd = 4', kind: 'a' }], ['add', 'p2a', { x: 270, y: 180, w: 110, label: '0.909', sub: 'sin(2)', kind: 'c', state: 'active' }], ['add', 'p2b', { x: 410, y: 180, w: 110, label: '−0.416', sub: 'cos(2)', kind: 'c', state: 'active' }], ['add', 'p2c', { x: 550, y: 180, w: 110, label: '0.020', sub: 'sin(0.02)', kind: 'b' }], ['add', 'p2d', { x: 690, y: 180, w: 110, label: '1.000', sub: 'cos(0.02)', kind: 'b' }]] },
        { cap: 'These vectors are added to the token embeddings, so the same word at pos 1 and pos 2 enters the model differently.', do: [['note', 'r2', 'embedding + PE']] }
      ] },
    example: { given: 'Model size \\(d = 4\\), so there are two pairs: \\(i = 0\\) and \\(i = 1\\). Encode position \\(pos = 2\\).',
      steps: ['Pair 0: divisor \\(10000^{0/4} = 1\\), so the angle is \\(2/1 = 2\\) radians.', 'Dims 0, 1: \\(\\sin(2) \\approx 0.909\\), \\(\\cos(2) \\approx -0.416\\).', 'Pair 1: divisor \\(10000^{2/4} = \\sqrt{10000} = 100\\), so the angle is \\(2/100 = 0.02\\).', 'Dims 2, 3: \\(\\sin(0.02) \\approx 0.020\\), \\(\\cos(0.02) \\approx 1.000\\) (0.9998).'],
      result: '\\(PE_2 \\approx [0.909, -0.416, 0.020, 1.000]\\). It is added element by element to the 4-number embedding of the token at position 2.' },
    lab: { h: 'Turn the clock hands', body: 'd = 8: four sin/cos pairs. Dots sit higher for bigger values (−1 … 1). Slide the position.', size: [800, 260],
      controls: [{ id: 'pos', type: 'range', label: 'Position (pos)', min: 0, max: 50, value: 1 }],
      view: s => { const nodes = {}; for (let j = 0; j < 8; j++) { const i = Math.floor(j / 2), a = s.v.pos / Math.pow(10000, 2 * i / 8), v = j % 2 ? Math.cos(a) : Math.sin(a);
        nodes['d' + j] = { x: 85 + j * 90, y: Math.round(120 - v * 70), shape: 'circle', w: 52, label: v.toFixed(2), kind: ['c', 'a', 'b', 'd'][i] };
        nodes['t' + j] = { x: 85 + j * 90, y: 238, shape: 'text', label: (j % 2 ? 'cos' : 'sin') + ' d' + j }; } return { nodes }; },
      readout: s => [0, 1, 2, 3].map(i => ['Pair ' + i + ' angle = pos / ' + Math.pow(10000, 2 * i / 8).toFixed(0), (s.v.pos / Math.pow(10000, 2 * i / 8)).toFixed(4) + ' rad']) },
    pitfalls: ['Positions start at 0. At pos 0 every sin dim is 0 and every cos dim is 1.', 'Most modern LLMs (Llama, Qwen) use rotary embeddings (RoPE) instead: they rotate the query and key vectors rather than adding a vector. Same clock idea, different place.', 'Learned position embeddings (GPT-2, BERT) are a lookup table with a fixed max length. Positions past that length simply do not exist.'],
    code: 'import numpy as np\n\ndef sinusoidal_pe(num_pos, d):\n    pos = np.arange(num_pos)[:, None]          # (num_pos, 1)\n    i = np.arange(d // 2)[None, :]             # (1, d/2)\n    angle = pos / 10000 ** (2 * i / d)          # (num_pos, d/2)\n    pe = np.zeros((num_pos, d))\n    pe[:, 0::2] = np.sin(angle)\n    pe[:, 1::2] = np.cos(angle)\n    return pe\n\nprint(sinusoidal_pe(3, 4).round(3))\n# [[ 0.     1.     0.     1.   ]\n#  [ 0.841  0.54   0.01   1.   ]\n#  [ 0.909 -0.416  0.02   1.   ]]', lang: 'Python'
  },

  'self-attention': {
    intuition: 'Each token builds three vectors. Its **query** says "what am I looking for?". Its **key** says "what do I contain?". Its **value** is "what I hand over if you pick me".\n\nA token scores every key against its query with a [[dot product]], turns the scores into weights with [[softmax]], and takes the weighted mix of values. Dividing by \\(\\sqrt{d_k}\\) first keeps scores from growing with vector size, so softmax does not saturate into a hard 0/1 choice.',
    formula: ['\\text{Attention}(Q, K, V) = \\softmax\\left(\\frac{Q K^{\\top}}{\\sqrt{d_k}}\\right) V'],
    symbols: [['Q', 'queries: one row per token, shape (tokens × d_k)'], ['K', 'keys: one row per token, shape (tokens × d_k)'], ['V', 'values: one row per token, shape (tokens × d_v)'], ['Q K^{\\top}', 'every query dotted with every key: a (tokens × tokens) score table'], ['\\sqrt{d_k}', 'square root of the key size; scales scores down'], ['\\softmax', 'applied to each row, so each token\'s weights sum to 1']],
    figure: { h: 'Token 3 attends over 3 tokens (d = 2)', size: [800, 300],
      nodes: { q: { x: 100, y: 150, label: 'q3 = [1, 1]', sub: 'token 3 asks', kind: 'a' }, k1: { x: 380, y: 55, label: 'k1 = [1, 0]', sub: 'v1 = [1, 0]', kind: 'c' }, k2: { x: 380, y: 150, label: 'k2 = [1, 1]', sub: 'v2 = [0, 1]', kind: 'c' }, k3: { x: 380, y: 245, label: 'k3 = [0, 1]', sub: 'v3 = [2, 2]', kind: 'c' } },
      steps: [
        { cap: 'Token 3 brings its query \\(q_3 = [1, 1]\\). Every token (itself too) offers a key and a value.', do: [['focus', 'q', 'k1', 'k2', 'k3']] },
        { cap: 'Dot the query with each key: \\(1\\cdot1 + 1\\cdot0 = 1\\), then 2, then 1. Key 2 matches best.', do: [['link', 'q', 'k1', '1'], ['link', 'q', 'k2', '2'], ['link', 'q', 'k3', '1'], ['set', 'k2', { state: 'active' }]] },
        { cap: 'Divide by \\(\\sqrt{d_k} = \\sqrt{2} \\approx 1.414\\): scores become 0.707, 1.414, 0.707.', do: [['set', 'k1', { sub: 'scaled 0.707' }], ['set', 'k2', { sub: 'scaled 1.414' }], ['set', 'k3', { sub: 'scaled 0.707' }]] },
        { cap: 'Softmax turns them into weights 0.248, 0.503, 0.248. They sum to 1.', do: [['set', 'k1', { sub: 'weight 0.248' }], ['set', 'k2', { sub: 'weight 0.503' }], ['set', 'k3', { sub: 'weight 0.248' }]] },
        { cap: 'Output = \\(0.248 \\cdot [1,0] + 0.503 \\cdot [0,1] + 0.248 \\cdot [2,2] \\approx [0.745, 1.0]\\).', do: [['add', 'o', { x: 660, y: 150, label: '[0.745, 1.0]', sub: 'new token 3', kind: 'b', state: 'ok' }], ['link', 'k1', 'o'], ['link', 'k2', 'o'], ['link', 'k3', 'o']] }
      ] },
    example: { given: 'Three tokens, \\(d_k = 2\\). Queries \\(Q = [[1,0],[0,1],[1,1]]\\), keys \\(K = [[1,0],[1,1],[0,1]]\\), values \\(V = [[1,0],[0,1],[2,2]]\\). Compute the output for token 3.',
      steps: ['Scores \\(q_3 \\cdot k_j\\): \\([1,1]\\cdot[1,0] = 1\\), \\([1,1]\\cdot[1,1] = 2\\), \\([1,1]\\cdot[0,1] = 1\\).', 'Scale by \\(1/\\sqrt{2}\\): \\(0.7071, 1.4142, 0.7071\\).', 'Exponentiate: \\(e^{0.7071} = 2.0281\\), \\(e^{1.4142} = 4.1133\\), \\(e^{0.7071} = 2.0281\\). Sum = 8.1695.', 'Weights: \\(2.0281/8.1695 = 0.2483\\), \\(4.1133/8.1695 = 0.5035\\), \\(0.2483\\).', 'Output dim 1: \\(0.2483\\cdot1 + 0.5035\\cdot0 + 0.2483\\cdot2 \\approx 0.745\\). Dim 2: \\(0 + 0.5035 + 0.2483\\cdot2 \\approx 1.000\\).'],
      result: 'Token 3 becomes \\([0.745, 1.000]\\). Doing the same for tokens 1 and 2 gives \\([0.797, 0.797]\\) and \\([1.000, 1.203]\\).' },
    lab: { h: 'Scale or saturate', body: 'Pick the asking token. Grow the vectors (like a bigger d) and toggle the √d scaling.', size: [800, 240],
      controls: [{ id: 'q', type: 'select', label: 'Query token', options: ['token 1', 'token 2', 'token 3'], value: 'token 3' }, { id: 'c', type: 'range', label: 'Vector size ×', min: 1, max: 6, step: 0.5, value: 1 }, { id: 'sc', type: 'toggle', label: 'Divide by √d', value: true }],
      view: s => { const qi = +String(s.v.q).slice(-1) - 1, q = MLD2_ATT.Q[qi].map(x => x * s.v.c), sc = MLD2_ATT.K.map(k => (q[0] * k[0] * s.v.c + q[1] * k[1] * s.v.c) / (s.v.sc ? Math.SQRT2 : 1)), w = MLD2_softmax(sc);
        return { nodes: Object.fromEntries(w.map((x, j) => ['w' + j, MLD2_bar(200 + j * 200, x, 'tok ' + (j + 1), { kind: 'c', state: x > 0.95 ? 'warn' : undefined })])) }; },
      readout: s => { const qi = +String(s.v.q).slice(-1) - 1, q = MLD2_ATT.Q[qi].map(x => x * s.v.c), sc = MLD2_ATT.K.map(k => (q[0] * k[0] * s.v.c + q[1] * k[1] * s.v.c) / (s.v.sc ? Math.SQRT2 : 1)), w = MLD2_softmax(sc), o = [0, 1].map(d => w.reduce((a, x, j) => a + x * MLD2_ATT.V[j][d], 0));
        return [['Scores', sc.map(x => x.toFixed(3)).join(', ')], ['Weights (bars)', w.map(x => x.toFixed(3)).join(', ')], ['Output', '[' + o.map(x => x.toFixed(3)).join(', ') + ']']]; } },
    pitfalls: ['Forgetting the \\(\\sqrt{d_k}\\) scale: with 128-dim heads, raw scores get large, softmax becomes almost one-hot, and gradients vanish.', 'Softmax runs over each row (the keys), not each column. In PyTorch that is `dim=-1`.', 'Self-attention costs grow with tokens²: the score table for 8,000 tokens has 64 million entries per head.'],
    code: 'import torch\nimport torch.nn.functional as F\n\nQ = torch.tensor([[1., 0], [0, 1], [1, 1]])\nK = torch.tensor([[1., 0], [1, 1], [0, 1]])\nV = torch.tensor([[1., 0], [0, 1], [2, 2]])\n\nscores = Q @ K.T / K.shape[-1] ** 0.5   # (3, 3)\nweights = scores.softmax(dim=-1)\nprint(weights @ V)  # last row: [0.7448, 1.0000]\n\n# built-in (same math, fused kernel)\nprint(F.scaled_dot_product_attention(Q, K, V))', lang: 'Python'
  },

  'causal mask': {
    intuition: 'A decoder learns by predicting the next token. If token 2 could look at token 3 during training, it would just copy the answer. The **causal mask hides every future position**.\n\nIt adds \\(-\\infty\\) to the scores above the diagonal before softmax. Since \\(e^{-\\infty} = 0\\), those tokens get exactly zero weight. Each token sees only itself and what came before, just like at generation time.',
    formula: ['M_{ij} = 0 \\text{ if } j \\le i, \\quad M_{ij} = -\\infty \\text{ if } j > i', '\\text{Attention} = \\softmax\\left(\\frac{Q K^{\\top}}{\\sqrt{d_k}} + M\\right) V'],
    symbols: [['i', 'the row: the token doing the looking'], ['j', 'the column: the token being looked at'], ['M', 'the mask matrix, added to the scores'], ['-\\infty', 'minus infinity; softmax turns it into a weight of exactly 0']],
    figure: { h: 'Masking a 3-token score table', size: [800, 310],
      nodes: { h1: { x: 330, y: 30, shape: 'text', label: 'sees "The"' }, h2: { x: 470, y: 30, shape: 'text', label: 'sees "cat"' }, h3: { x: 610, y: 30, shape: 'text', label: 'sees "sat"' },
        l1: { x: 130, y: 90, shape: 'text', label: '"The" asks' }, l2: { x: 130, y: 175, shape: 'text', label: '"cat" asks' }, l3: { x: 130, y: 260, shape: 'text', label: '"sat" asks' },
        c11: { x: 330, y: 90, w: 110, h: 46, label: '2', kind: 'a' }, c12: { x: 470, y: 90, w: 110, h: 46, label: '0', kind: 'a' }, c13: { x: 610, y: 90, w: 110, h: 46, label: '1', kind: 'a' },
        c21: { x: 330, y: 175, w: 110, h: 46, label: '1', kind: 'a' }, c22: { x: 470, y: 175, w: 110, h: 46, label: '2', kind: 'a' }, c23: { x: 610, y: 175, w: 110, h: 46, label: '3', kind: 'a' },
        c31: { x: 330, y: 260, w: 110, h: 46, label: '0', kind: 'a' }, c32: { x: 470, y: 260, w: 110, h: 46, label: '1', kind: 'a' }, c33: { x: 610, y: 260, w: 110, h: 46, label: '2', kind: 'a' } },
      steps: [
        { cap: 'Raw attention scores. Each row is a token asking; each column is a token it might look at.', do: [] },
        { cap: 'Cells above the diagonal are the future. "The" must not see "cat" or "sat" yet.', do: [['focus', 'c12', 'c13', 'c23']] },
        { cap: 'The mask adds \\(-\\infty\\) to every future cell.', do: [['set', 'c12', { label: '−∞', state: 'bad' }], ['set', 'c13', { label: '−∞', state: 'bad' }], ['set', 'c23', { label: '−∞', state: 'bad' }]] },
        { cap: 'Softmax row "cat": scores [1, 2, \\(-\\infty\\)] give weights 0.269, 0.731 and exactly 0.', do: [['set', 'c21', { sub: 'w = 0.269' }], ['set', 'c22', { sub: 'w = 0.731' }], ['set', 'c23', { sub: 'w = 0' }], ['focus', 'c21', 'c22', 'c23']] },
        { cap: 'Row "sat" sees all three: weights 0.090, 0.245, 0.665. Row "The" sees only itself: weight 1.', do: [['set', 'c31', { sub: 'w = 0.090' }], ['set', 'c32', { sub: 'w = 0.245' }], ['set', 'c33', { sub: 'w = 0.665' }], ['set', 'c11', { sub: 'w = 1' }]] }
      ] },
    example: { given: 'Row "cat" (token 2 of 3) has scaled scores \\([1, 2, 3]\\). Apply the causal mask, then softmax.',
      steps: ['Mask: column 3 is in the future, so the row becomes \\([1, 2, -\\infty]\\).', 'Exponentiate: \\(e^1 = 2.718\\), \\(e^2 = 7.389\\), \\(e^{-\\infty} = 0\\). Sum = 10.107.', 'Weights: \\(2.718/10.107 = 0.269\\), \\(7.389/10.107 = 0.731\\), and 0.', 'Without the mask, \\(e^3 = 20.09\\) would have taken 67% of the weight from a token "cat" should never see.'],
      result: 'Weights \\([0.269, 0.731, 0]\\): "cat" mixes only "The" and itself.' },
    lab: { h: 'Walk the sentence', body: 'Pick which token is asking. Turn the mask off to see the leak.', size: [800, 200],
      controls: [{ id: 'i', type: 'range', label: 'Asking token', min: 1, max: 5, value: 3 }, { id: 'm', type: 'toggle', label: 'Causal mask on', value: true }],
      view: s => ({ nodes: Object.fromEntries(['The', 'cat', 'sat', 'on', 'a'].map((t, j) => { const fut = j + 1 > s.v.i, me = j + 1 === s.v.i;
        return ['t' + j, { x: 100 + j * 150, y: 90, label: t, sub: me ? 'asking' : fut ? (s.v.m ? 'masked' : 'peeking!') : 'visible', kind: 'a', state: me ? 'active' : fut ? (s.v.m ? 'off' : 'bad') : 'ok' }]; })) }),
      readout: s => { const n = s.v.m ? s.v.i : 5; return [['Tokens it can see', n + ' of 5'], ['Weight each (equal scores)', (1 / n).toFixed(3)]]; } },
    pitfalls: ['Encoders such as BERT do not use a causal mask. They read both directions, which is why they are good at embeddings but cannot generate text left to right.', 'Use a large negative number or `-inf` before softmax. Multiplying weights by 0 after softmax leaves rows that no longer sum to 1.', 'A padding mask is a different thing: it hides padding tokens. Batched decoders need both masks combined.'],
    code: 'import torch\n\nscores = torch.tensor([[2., 0, 1], [1, 2, 3], [0, 1, 2]])\nT = scores.shape[0]\nfuture = torch.triu(torch.ones(T, T, dtype=torch.bool), diagonal=1)\nweights = scores.masked_fill(future, float("-inf")).softmax(dim=-1)\nprint(weights.round(decimals=3))\n# [[1.000, 0.000, 0.000],\n#  [0.269, 0.731, 0.000],\n#  [0.090, 0.245, 0.665]]', lang: 'Python'
  },

  'KV cache': {
    intuition: 'A decoder writes one token at a time. Each new token must attend to every earlier token\'s key and value. Those never change, so the model **stores them instead of recomputing them**. That store is the KV cache.\n\nIt makes each new token cheap, but it eats GPU memory. It grows with layers, heads, context length and the number of users served at once. On long chats it can outweigh the model itself.',
    formula: ['\\text{bytes} = 2 \\times L \\times H_{kv} \\times d_{head} \\times T \\times B \\times b'],
    symbols: [['2', 'one key plus one value'], ['L', 'number of layers'], ['H_{kv}', 'number of key/value heads (fewer than query heads with grouped-query attention)'], ['d_{head}', 'size of each head, usually 128'], ['T', 'tokens in the context (prompt + generated so far)'], ['B', 'batch: sequences served at once'], ['b', 'bytes per number: 2 for fp16, 1 for int8/fp8']],
    figure: { h: 'Prefill, then decode with a cache', size: [800, 300],
      nodes: { t1: { x: 100, y: 45, shape: 'pill', label: 'The', kind: 'a' }, t2: { x: 100, y: 115, shape: 'pill', label: 'cat', kind: 'a' }, t3: { x: 100, y: 185, shape: 'pill', label: 'sat', kind: 'a' }, kv: { x: 400, y: 150, shape: 'db', label: 'KV cache', sub: 'empty', kind: 'b', w: 120 } },
      steps: [
        { cap: 'Prefill: the prompt "The cat sat" runs once. Every layer computes a key and a value for each token.', do: [['link', 't1', 'kv'], ['link', 't2', 'kv'], ['link', 't3', 'kv'], ['send', 't1', 'kv', 'K,V'], ['send', 't3', 'kv', 'K,V'], ['set', 'kv', { sub: '3 tokens' }]] },
        { cap: 'Decode: the model writes "on". Only this new token needs a fresh query, key and value.', do: [['add', 't4', { x: 100, y: 255, shape: 'pill', label: 'on', kind: 'c', state: 'active' }], ['link', 't4', 'kv'], ['send', 't4', 'kv', 'K,V'], ['set', 'kv', { sub: '4 tokens' }]] },
        { cap: 'Its query reads all 4 cached keys and values. Nothing old is recomputed.', do: [['send', 'kv', 't4', 'all K,V', 'ok']] },
        { cap: 'Cost per token: 2 × 32 layers × 32 heads × 128 × 2 bytes = 524,288 bytes (0.5 MiB) for Llama-2-7B.', do: [['add', 'mem', { x: 670, y: 150, label: '0.5 MiB/token', sub: 'Llama-2-7B, fp16', kind: 'd', w: 140 }], ['link', 'kv', 'mem']] },
        { cap: 'A 4,096-token chat uses 2 GiB. Eight users at once: 16 GiB, on top of ~13.5 GB of weights.', do: [['set', 'mem', { label: '2 GiB/chat', sub: '4,096 tokens', state: 'warn' }]] }
      ] },
    example: { given: 'Llama-2-7B: 32 layers, 32 KV heads, head size 128, fp16 (2 bytes). Context 4,096 tokens, batch 1. Then Llama-3-8B, which has only 8 KV heads, at 8,192 tokens.',
      steps: ['Per token: \\(2 \\times 32 \\times 32 \\times 128 \\times 2 = 524{,}288\\) bytes = 0.5 MiB.', 'Whole context: \\(524{,}288 \\times 4{,}096 = 2{,}147{,}483{,}648\\) bytes = 2 GiB.', 'Llama-3-8B per token: \\(2 \\times 32 \\times 8 \\times 128 \\times 2 = 131{,}072\\) bytes = 128 KiB.', 'At 8,192 tokens: \\(131{,}072 \\times 8{,}192 = 1{,}073{,}741{,}824\\) bytes = 1 GiB.'],
      result: 'Grouped-query attention (8 KV heads instead of 32) cuts the cache 4×. Llama-3-8B holds twice the context in half the memory.' },
    lab: { h: 'Size the cache', body: 'Head size is 128 for all four models. Watch the bar against an 80 GB GPU.', size: [800, 230],
      controls: [{ id: 'm', type: 'select', label: 'Model', options: Object.keys(MLD2_KV_MODELS), value: 'Llama-2-7B (32 layers, 32 KV heads)' }, { id: 'tok', type: 'range', label: 'Context tokens (T)', min: 512, max: 131072, step: 512, value: 4096 }, { id: 'batch', type: 'range', label: 'Batch (B)', min: 1, max: 32, value: 1 }, { id: 'prec', type: 'select', label: 'Cache precision', options: ['fp16 (2 bytes)', 'fp8 / int8 (1 byte)'] }],
      view: s => { const gib = MLD2_kvBytes(s.v) / 2 ** 30, f = Math.min(gib / 74.5, 1);
        return { nodes: { kv: { x: 200, y: 200, shape: 'bar', w: 80, h: Math.max(2, Math.round(f * 160)), label: 'cache', sub: gib.toFixed(1) + ' GiB', kind: 'b', state: gib > 74.5 ? 'bad' : gib > 40 ? 'warn' : undefined },
          gpu: { x: 400, y: 200, shape: 'bar', w: 80, h: 160, label: 'GPU', sub: '80 GB', kind: 'n' },
          msg: { x: 640, y: 110, shape: 'text', label: gib > 74.5 ? 'Does not fit on one 80 GB GPU' : 'Fits (before counting weights)' } } }; },
      readout: s => { const per = MLD2_kvBytes(Object.assign({}, s.v, { tok: 1, batch: 1 })), tot = MLD2_kvBytes(s.v);
        return [['Per token', (per / 1024).toFixed(0) + ' KiB'], ['Total = per token × T × B', tot.toLocaleString('en-US') + ' bytes = ' + (tot / 2 ** 30).toFixed(2) + ' GiB']]; } },
    pitfalls: ['Use the KV head count, not the query head count. Llama-3-8B has 32 query heads but only 8 KV heads; using 32 overestimates the cache 4×.', 'Batch and context multiply. Serving 32 users at 8K tokens needs 32× the cache of one user.', 'Servers such as [[vLLM]] page the cache in small blocks, so memory is reserved as tokens arrive rather than for the maximum length up front.'],
    code: 'def kv_cache_bytes(layers, kv_heads, head_dim, tokens, batch=1, bytes_per=2):\n    return 2 * layers * kv_heads * head_dim * tokens * batch * bytes_per\n\nGiB = 2 ** 30\nprint(kv_cache_bytes(32, 32, 128, 4096) / GiB)  # Llama-2-7B: 2.0\nprint(kv_cache_bytes(32, 8, 128, 8192) / GiB)   # Llama-3-8B: 1.0\n\n# Hugging Face uses the cache by default when generating:\n# model.generate(**inputs, max_new_tokens=50, use_cache=True)', lang: 'Python'
  },

  'perplexity': {
    intuition: 'Perplexity turns a language model\'s [[cross-entropy]] into a friendlier number: **how many equally likely choices the model is torn between, on average**, at each token.\n\nA perplexity of 1 means the model was certain and right every time. A perplexity of 50 means it was as unsure as picking from 50 words at random. Lower is better. It is just \\(e\\) raised to the average cross-entropy.',
    formula: ['\\text{PPL} = \\exp\\left(-\\frac{1}{N} \\sum_{i=1}^{N} \\ln p(x_i \\mid x_{<i})\\right)', '\\text{PPL} = e^{\\text{average cross-entropy}}'],
    symbols: [['N', 'the number of tokens being scored'], ['x_i', 'the real token at position i'], ['p(x_i \\mid x_{<i})', 'the probability the model gave the real token, given all tokens before it'], ['-\\ln p', 'the cross-entropy (surprise) for that token, in nats'], ['\\exp', 'e raised to the power: undoes the natural log']],
    figure: { h: 'Perplexity of 4 predicted tokens', size: [800, 260],
      nodes: { b1: MLD2_bar(110, 0.5, 'cat', { kind: 'a', y: 220, w: 90 }), b2: MLD2_bar(240, 0.25, 'sat', { kind: 'a', y: 220, w: 90 }), b3: MLD2_bar(370, 0.8, 'on', { kind: 'a', y: 220, w: 90 }), b4: MLD2_bar(500, 0.1, 'mat', { kind: 'a', y: 220, w: 90 }) },
      steps: [
        { cap: 'The model predicts 4 tokens. Bar height = probability it gave the real token: 0.5, 0.25, 0.8, 0.1.', do: [['focus', 'b1', 'b2', 'b3', 'b4']] },
        { cap: 'Surprise of each is \\(-\\ln p\\): 0.693, 1.386, 0.223, 2.303. The 0.1 token hurts most.', do: [['set', 'b1', { sub: '−ln = 0.693' }], ['set', 'b2', { sub: '−ln = 1.386' }], ['set', 'b3', { sub: '−ln = 0.223' }], ['set', 'b4', { sub: '−ln = 2.303', state: 'bad' }]] },
        { cap: 'Average surprise (the cross-entropy loss) = \\(4.605 / 4 = 1.151\\) nats.', do: [['var', 'avg CE', '1.151']] },
        { cap: 'Perplexity = \\(e^{1.151} \\approx 3.16\\): as unsure as choosing among about 3 equal options.', do: [['add', 'ppl', { x: 670, y: 130, label: 'PPL ≈ 3.16', kind: 'b', state: 'ok', w: 130 }], ['var', 'PPL', '3.16']] }
      ] },
    example: { given: 'For the 4 real tokens, the model gave probabilities 0.5, 0.25, 0.8 and 0.1.',
      steps: ['Surprises: \\(-\\ln(0.5) = 0.6931\\), \\(-\\ln(0.25) = 1.3863\\), \\(-\\ln(0.8) = 0.2231\\), \\(-\\ln(0.1) = 2.3026\\).', 'Sum = 4.6052. Average = \\(4.6052 / 4 = 1.1513\\).', 'Perplexity = \\(e^{1.1513} \\approx 3.162\\).', 'Shortcut check: it is also 1 over the geometric mean of the probabilities: \\((0.5 \\cdot 0.25 \\cdot 0.8 \\cdot 0.1)^{-1/4} = 0.01^{-1/4} = 100^{1/4} \\approx 3.162\\).'],
      result: 'Perplexity ≈ 3.16. If the model had given every token probability 0.5, it would be exactly 2.' },
    lab: { h: 'Set the probabilities', body: 'The probability the model gave each real token. One bad guess can dominate.', size: [800, 240],
      controls: [0, 1, 2, 3].map(i => ({ id: 'p' + i, type: 'range', label: 'p(' + ['cat', 'sat', 'on', 'mat'][i] + ')', min: 0.01, max: 1, step: 0.01, value: [0.5, 0.25, 0.8, 0.1][i] })),
      view: s => ({ nodes: Object.fromEntries([0, 1, 2, 3].map(i => { const p = s.v['p' + i]; return ['b' + i, Object.assign(MLD2_bar(130 + i * 180, p, ['cat', 'sat', 'on', 'mat'][i], { kind: 'a', w: 90, state: p < 0.1 ? 'bad' : undefined }), { sub: '−ln = ' + (-Math.log(p)).toFixed(3) })]; })) }),
      readout: s => { const ce = [0, 1, 2, 3].reduce((a, i) => a - Math.log(s.v['p' + i]), 0) / 4; return [['Average cross-entropy', ce.toFixed(4) + ' nats'], ['Perplexity = e^CE', Math.exp(ce).toFixed(3)]]; } },
    pitfalls: ['Perplexities are only comparable with the same tokenizer and the same text. A model with bigger tokens sees fewer tokens, which changes the number.', 'Use the same log base for loss and exponent: \\(e\\) with natural-log loss (PyTorch), 2 with bits.', 'Low perplexity means good next-token prediction, not helpful or truthful answers. Chat models after RLHF often score worse perplexity yet answer better.'],
    code: 'import math, torch\nfrom transformers import AutoModelForCausalLM, AutoTokenizer\n\nname = "Qwen/Qwen2.5-0.5B-Instruct"\ntok = AutoTokenizer.from_pretrained(name)\nmodel = AutoModelForCausalLM.from_pretrained(name)\n\nids = tok("The cat sat on the mat.", return_tensors="pt").input_ids\nwith torch.no_grad():\n    loss = model(ids, labels=ids).loss   # average cross-entropy (nats)\nprint(math.exp(loss.item()))           # perplexity\n\nprint(math.exp(-sum(map(math.log, [0.5, 0.25, 0.8, 0.1])) / 4))  # 3.1623', lang: 'Python'
  },

  'LoRA': {
    intuition: 'Fine-tuning a full weight matrix means training millions of numbers per layer. LoRA bets that the **change** you need is simple. So it freezes \\(W\\) and learns the update as a product of two thin matrices, \\(B\\) and \\(A\\).\n\nWith rank \\(r = 8\\), a 4096 × 4096 update needs 65,536 numbers instead of 16.8 million. You train and save only those: an [[adapter]] of a few megabytes. Later you can merge \\(BA\\) into \\(W\\) and pay no extra cost at inference.',
    formula: ['h = W x + \\frac{\\alpha}{r} B A x', 'B \\in \\mathbb{R}^{d \\times r}, \\quad A \\in \\mathbb{R}^{r \\times k}', '\\text{trainable} = r(d + k) \\quad \\text{vs} \\quad d \\times k'],
    symbols: [['W', 'the frozen pretrained weight matrix, shape d × k'], ['A', 'the trainable "down" matrix, r × k, initialised randomly'], ['B', 'the trainable "up" matrix, d × r, initialised to zeros'], ['r', 'the rank: the width of the bottleneck (4-64 is typical)'], ['\\alpha', 'a scale hyperparameter; the update is multiplied by \\(\\alpha / r\\)'], ['\\mathbb{R}^{d \\times r}', 'a matrix of real numbers with d rows and r columns']],
    figure: { h: 'LoRA on one 4096 × 4096 matrix, r = 8', size: [800, 280],
      nodes: { W: { x: 130, y: 140, label: 'W (frozen)', sub: '4096 × 4096', kind: 'n', w: 130 } },
      steps: [
        { cap: 'W has \\(4096 \\times 4096 = 16{,}777{,}216\\) numbers. LoRA freezes all of them.', do: [['set', 'W', { state: 'off' }], ['var', 'full update', '16,777,216']] },
        { cap: 'Add A, shape 8 × 4096: \\(8 \\times 4096 = 32{,}768\\) trainable numbers.', do: [['add', 'A', { x: 420, y: 60, label: 'A', sub: '8 × 4096', kind: 'c', state: 'active' }]] },
        { cap: 'Add B, shape 4096 × 8: another 32,768. B starts at zero, so training begins from the exact original model.', do: [['add', 'B', { x: 420, y: 220, label: 'B = 0 at start', sub: '4096 × 8', kind: 'c', state: 'active', w: 140 }]] },
        { cap: '\\(B A\\) is a full 4096 × 4096 update built from \\(8 \\times (4096 + 4096) = 65{,}536\\) numbers: 0.39%.', do: [['add', 'dW', { x: 670, y: 140, label: 'ΔW = B·A', sub: '4096 × 4096', kind: 'b' }], ['link', 'A', 'dW'], ['link', 'B', 'dW'], ['var', 'LoRA trainable', '65,536']] },
        { cap: 'Output \\(= Wx + \\frac{\\alpha}{r} BAx\\). After training, add ΔW into W once: no extra latency.', do: [['link', 'dW', 'W', { label: 'merge', tone: 'ok', bend: 60 }], ['set', 'dW', { state: 'ok' }]] }
      ] },
    example: { given: 'One attention projection with \\(d = k = 4096\\), LoRA rank \\(r = 8\\). The model has 32 layers, and we target the q and v projections.',
      steps: ['Full update: \\(4096 \\times 4096 = 16{,}777{,}216\\) parameters.', 'LoRA: \\(r(d + k) = 8 \\times (4096 + 4096) = 8 \\times 8192 = 65{,}536\\) parameters.', 'Fraction: \\(65{,}536 / 16{,}777{,}216 = 0.0039 = 0.39\\%\\) (exactly 1/256).', 'Whole model: 32 layers × 2 matrices × 65,536 = 4,194,304 trainable parameters, about 8 MB in fp16.'],
      result: 'About 4.2 million trainable parameters instead of 16.8 million per matrix, for a 7B-class model.' },
    lab: { h: 'Pick a rank', body: 'Count trainable parameters. Square d × d matrices, as in attention projections.', size: [800, 220],
      controls: [{ id: 'd', type: 'select', label: 'Matrix size d', options: ['768', '2048', '4096', '8192'], value: '4096' }, { id: 'r', type: 'range', label: 'Rank r', min: 1, max: 128, value: 8 }, { id: 'mats', type: 'range', label: 'Target matrices per layer', min: 1, max: 7, value: 2 }, { id: 'layers', type: 'range', label: 'Layers', min: 1, max: 80, value: 32 }],
      view: s => { const d = +s.v.d, r = s.v.r, wr = Math.max(14, Math.min(120, Math.round(r / 128 * 120)));
        return { nodes: { W: { x: 130, y: 110, label: 'W frozen', sub: d + ' × ' + d, kind: 'n', state: 'off', w: 130 }, A: { x: 380, y: 110, kind: 'c', w: wr, h: 120 }, B: { x: 560, y: 110, kind: 'c', w: 120, h: wr }, t: { x: 470, y: 200, shape: 'text', label: 'A: ' + r + ' × ' + d + '   ·   B: ' + d + ' × ' + r } } }; },
      readout: s => { const d = +s.v.d, r = s.v.r, lo = r * 2 * d, tot = lo * s.v.mats * s.v.layers;
        return [['Full update per matrix', (d * d).toLocaleString('en-US')], ['LoRA per matrix r(d+k)', lo.toLocaleString('en-US') + ' (' + (100 * lo / (d * d)).toFixed(2) + '%)'], ['Trainable in whole model', tot.toLocaleString('en-US')]]; } },
    pitfalls: ['Changing r without changing \\(\\alpha\\) changes the update\'s size too, because it is scaled by \\(\\alpha/r\\). Many recipes set \\(\\alpha = 2r\\).', 'A higher rank is not always better. Small datasets overfit at r = 64; r = 8-16 is a sensible start.', 'Targeting only q and v is cheap; adding the MLP layers (gate, up, down) often helps more on new tasks, but costs roughly 4× the trainable parameters in Llama-style models.'],
    code: 'from peft import LoraConfig, get_peft_model\nfrom transformers import AutoModelForCausalLM\n\nbase = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-1.5B-Instruct")\ncfg = LoraConfig(r=8, lora_alpha=16, lora_dropout=0.05,\n                 target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")\nmodel = get_peft_model(base, cfg)\nmodel.print_trainable_parameters()  # well under 1% trainable\n\nd = k = 4096; r = 8\nprint(d * k, r * (d + k))  # 16777216 65536', lang: 'Python'
  },

  'quantization': {
    intuition: 'A weight stored in fp16 takes 2 bytes; in fp32, 4. Quantization **maps each weight onto a small grid of integers** so it takes 1 byte (int8) or half a byte (4-bit).\n\nThe simplest version is symmetric int8. Find the biggest weight magnitude. Map it to 127. Every other weight becomes the nearest integer step. To use a weight, multiply back by the scale. The rounding error is at most half a step.',
    formula: ['s = \\frac{\\max |w|}{127}', 'q = \\text{round}\\left(\\frac{w}{s}\\right), \\quad -127 \\le q \\le 127', '\\hat{w} = q \\cdot s, \\quad |w - \\hat{w}| \\le \\frac{s}{2}'],
    symbols: [['w', 'an original weight (fp32 or fp16)'], ['s', 'the scale: how much one integer step is worth'], ['q', 'the stored int8 value'], ['\\hat{w}', 'the dequantized weight used at inference'], ['127', 'the largest int8 value used; for b bits it is \\(2^{b-1} - 1\\)']],
    figure: { h: 'Symmetric int8 on four weights', size: [800, 290],
      nodes: { w1: { x: 130, y: 55, label: '0.37', sub: 'fp32', kind: 'a' }, w2: { x: 300, y: 55, label: '−1.52', sub: 'fp32 (max |w|)', kind: 'a' }, w3: { x: 470, y: 55, label: '0.04', sub: 'fp32', kind: 'a' }, w4: { x: 640, y: 55, label: '0.88', sub: 'fp32', kind: 'a' } },
      steps: [
        { cap: 'Four fp32 weights, 4 bytes each. The biggest magnitude is 1.52.', do: [['focus', 'w2'], ['var', 'max |w|', '1.52']] },
        { cap: 'Scale \\(s = 1.52 / 127 \\approx 0.011969\\). One integer step is worth 0.011969.', do: [['var', 'scale s', '0.011969']] },
        { cap: 'Divide by s and round: 30.91 → 31, −127, 3.34 → 3, 73.53 → 74. Each now takes 1 byte.', do: [['add', 'q1', { x: 130, y: 150, label: '31', sub: 'int8', kind: 'c' }], ['add', 'q2', { x: 300, y: 150, label: '−127', sub: 'int8', kind: 'c' }], ['add', 'q3', { x: 470, y: 150, label: '3', sub: 'int8', kind: 'c' }], ['add', 'q4', { x: 640, y: 150, label: '74', sub: 'int8', kind: 'c' }]] },
        { cap: 'Dequantize: multiply back by s. \\(31 \\times 0.011969 = 0.3710\\), error 0.0010.', do: [['add', 'd1', { x: 130, y: 245, label: '0.3710', sub: 'err 0.0010', kind: 'b' }], ['add', 'd2', { x: 300, y: 245, label: '−1.5200', sub: 'err 0', kind: 'b' }], ['add', 'd3', { x: 470, y: 245, label: '0.0359', sub: 'err 0.0041', kind: 'b' }], ['add', 'd4', { x: 640, y: 245, label: '0.8857', sub: 'err 0.0057', kind: 'b' }]] },
        { cap: 'Worst error 0.0057 stays under half a step, \\(s/2 \\approx 0.0060\\). Memory drops 4× versus fp32.', do: [['set', 'd4', { state: 'warn' }], ['note', 'd4', 'largest error'], ['var', 'max error', '0.0057']] }
      ] },
    example: { given: 'Weights \\(w = [0.37, -1.52, 0.04, 0.88]\\). Quantize to symmetric int8.',
      steps: ['Scale: \\(s = 1.52 / 127 \\approx 0.011969\\).', 'Divide: \\(0.37/s = 30.91\\), \\(-1.52/s = -127\\), \\(0.04/s = 3.34\\), \\(0.88/s = 73.53\\).', 'Round: \\(q = [31, -127, 3, 74]\\).', 'Dequantize: \\(\\hat{w} = q \\cdot s = [0.3710, -1.5200, 0.0359, 0.8857]\\).', 'Errors: \\(0.0010, 0, 0.0041, 0.0057\\). All are \\(\\le s/2 \\approx 0.0060\\).'],
      result: 'The weights now take 1 byte each instead of 4, with errors below 0.006. A 7B model drops from about 14 GB (fp16) to about 7 GB.' },
    lab: { h: 'Fewer bits, bigger steps', body: 'Five weights. Lower the bits, or add one outlier weight and watch every step grow.', size: [800, 250],
      controls: [{ id: 'bits', type: 'range', label: 'Bits', min: 2, max: 16, value: 8 }, { id: 'out', type: 'toggle', label: 'Add an outlier weight (6.0)' }],
      view: s => { const w = s.v.out ? MLD2_W.concat(6) : MLD2_W, qm = 2 ** (s.v.bits - 1) - 1, sc = Math.max(...w.map(Math.abs)) / qm, nodes = {};
        w.forEach((x, i) => { const q = Math.round(x / sc), e = Math.abs(q * sc - x);
          nodes['w' + i] = { x: 75 + i * 130, y: 65, w: 100, label: x.toFixed(2), sub: 'q = ' + q, kind: i === 5 ? 'e' : 'a' };
          nodes['d' + i] = { x: 75 + i * 130, y: 180, w: 100, label: (q * sc).toFixed(3), sub: 'err ' + e.toFixed(3), kind: 'b', state: e > 0.1 ? 'bad' : e > 0.02 ? 'warn' : 'ok' }; });
        return { nodes, edges: w.map((_, i) => ['w' + i, 'd' + i]) }; },
      readout: s => { const w = s.v.out ? MLD2_W.concat(6) : MLD2_W, qm = 2 ** (s.v.bits - 1) - 1, sc = Math.max(...w.map(Math.abs)) / qm, e = w.map(x => Math.abs(Math.round(x / sc) * sc - x));
        return [['Integer range', '−' + qm + ' … ' + qm], ['Scale s = max|w| / ' + qm, sc.toFixed(5)], ['Worst error (≤ s/2)', Math.max(...e).toFixed(4)]]; } },
    pitfalls: ['One outlier weight sets the scale for everyone, so all the small weights lose precision. Real methods quantize in small groups (e.g. 32-128 weights each) with their own scale.', 'Symmetric int8 never uses −128. Asymmetric schemes add a zero-point to use the full range when weights are not centred on 0.', '4-bit formats like GGUF Q4_K_M and [[AWQ]] add tricks (groups, protected weights) so 4-bit models stay close to fp16 quality. Always re-run your eval after quantizing.'],
    code: 'import numpy as np\n\nw = np.array([0.37, -1.52, 0.04, 0.88], dtype=np.float32)\ns = np.abs(w).max() / 127              # 0.011969\nq = np.clip(np.round(w / s), -127, 127).astype(np.int8)\nw_hat = q.astype(np.float32) * s\n\nprint(q)                         # [  31 -127    3   74]\nprint(w_hat.round(4))            # [ 0.371  -1.52   0.0359  0.8857]\nprint(np.abs(w - w_hat).max())   # 0.0057 <= s/2', lang: 'Python'
  }
};

;
// ML Foundations. Built through ../academy.config.js (hub.mjs).
const ML_ALL_GLOSS = Object.assign({}, ML_GLOSSARY, typeof M1_GLOSS !== 'undefined' ? M1_GLOSS : {}, typeof M2_GLOSS !== 'undefined' ? M2_GLOSS : {}, typeof M3_GLOSS !== 'undefined' ? M3_GLOSS : {}, typeof M4_GLOSS !== 'undefined' ? M4_GLOSS : {}, typeof M5_GLOSS !== 'undefined' ? M5_GLOSS : {});
for (const [k, d] of Object.entries(Object.assign({}, typeof ML_DEEP_1 !== 'undefined' ? ML_DEEP_1 : {}, typeof ML_DEEP_2 !== 'undefined' ? ML_DEEP_2 : {}))) {
  const key = Object.keys(ML_ALL_GLOSS).find(x => x.toLowerCase() === k.toLowerCase());
  if (key) ML_ALL_GLOSS[key] = { def: typeof ML_ALL_GLOSS[key] === 'string' ? ML_ALL_GLOSS[key] : ML_ALL_GLOSS[key].def, deep: d };
}
// Cross-file prerequisites.
M2_splits.needs = 'ml-backprop'; M3_embed_pos.needs = 'ml-ranking'; M4_training_stages.needs = 'ml-kvcache'; M5_xor.needs = 'ml-quant';

const COURSE = {
  id: 'ml-foundations',
  title: 'ML Foundations',
  subtitle: 'The math and mechanics inside modern AI',
  // A tiny neural network: two inputs, one hidden unit, two outputs.
  icon: 'M6.8 7.9L10.3 11 M6.8 16.1L10.3 13 M13.7 11L17.2 7.9 M13.7 13L17.2 16.1 M7 7a2 2 0 1 1-4 0a2 2 0 1 1 4 0 M7 17a2 2 0 1 1-4 0a2 2 0 1 1 4 0 M14 12a2 2 0 1 1-4 0a2 2 0 1 1 4 0 M21 7a2 2 0 1 1-4 0a2 2 0 1 1 4 0 M21 17a2 2 0 1 1-4 0a2 2 0 1 1 4 0',
  tagline: 'Open the black box: tensors, gradients, evaluation, Transformers and fine-tuning, each shown with real numbers you could check by hand.',
  level: 'After AI Engineering · high-school math is enough',
  outcomes: [
    'Read tensor shapes and matrix math the way you read API types',
    'Explain how gradient descent and backpropagation actually train a network',
    'Evaluate models honestly with splits, precision, recall, F1 and ranking metrics',
    'Walk through self-attention, encoders, decoders and the KV cache with real numbers',
    'Choose between pre-training, SFT, DPO and LoRA, and do the memory math for quantization',
    'Train, fine-tune, quantize and serve your own models in a 5-step hands-on lab'
  ],
  glossary: ML_ALL_GLOSS,
  modules: [
    { title: 'The engine room', desc: 'Tensors, matrix math, loss and gradient descent: how numbers flow and how a network learns.', lessons: [M1_tensors, M1_dot, M1_loss, M1_gd, M1_backprop] },
    { title: 'Data and evaluation', desc: 'Tests in ML are statistics. Split data honestly, spot overfitting, and measure with the right metric.', lessons: [M2_splits, M2_overfit, M2_confusion, M2_threshold, M2_ranking] },
    { title: 'Transformer mechanics', desc: 'Embeddings, positions, self-attention, encoders vs decoders, and why the KV cache eats memory.', lessons: [M3_embed_pos, M3_attention, M3_enc_dec, M3_kvcache] },
    { title: 'Adapting models', desc: 'Pre-training, SFT and DPO; LoRA and QLoRA; quantization and serving models locally.', lessons: [M4_training_stages, M4_lora, M4_quant] },
    { title: 'Capstone: your ML lab', desc: 'Five hands-on milestones on your own machine and a free Colab GPU. The board shows your lab growing.', project: ML_CAP, lessons: [M5_xor, M5_spam, M5_embed, M5_lora, M5_serve] }
  ]
};

export default COURSE;
