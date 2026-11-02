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
