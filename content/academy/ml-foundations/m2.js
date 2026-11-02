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
