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
