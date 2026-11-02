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
