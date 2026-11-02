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
