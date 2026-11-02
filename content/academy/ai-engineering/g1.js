// Glossary deep dives, batch 1: tokens, sampling, retries, cost, model size. Top-level names start with DEEP_1 / G1_.
const G1_n = x => Math.round(x).toLocaleString('en-US');
// A bar node: x = centre, y = baseline, h = height in px.
const G1_bar = (x, h, label, sub, more) => Object.assign({ x, y: 280, h: Math.max(1, Math.round(h)), w: 70, shape: 'bar', label, sub, kind: 'a' }, more || {});
// Numerically safe softmax with temperature. T = 0 means greedy: all mass on the top logit.
function G1_softmax(z, T) {
  if (T === 0) { const m = z.indexOf(Math.max(...z)); return z.map((_, i) => (i === m ? 1 : 0)); }
  const m = Math.max(...z), e = z.map(v => Math.exp((v - m) / T)), s = e.reduce((a, b) => a + b, 0);
  return e.map(v => v / s);
}
const G1_TOK = ['mat', 'sofa', 'floor', 'moon'], G1_Z = [3, 2, 1, 0];
// Fixed "random" draws so the jitter lab is repeatable.
const G1_R = [0.62, 0.17, 0.85, 0.4, 0.93, 0.08, 0.55];

const DEEP_1 = {
  'token': {
    intuition: 'A model never sees letters or words. It sees [[token|tokens]]: chunks of text such as `the`, `ing` or ` hello`. Common words are one token. Rare words, code and names split into several.\n\nYou cannot count tokens by eye, but you can estimate them. In English, one token is about **4 characters**, or about **0.75 words**. Use the estimate to plan, then count exactly with a [[tokenizer]] before you send.\n\nEvery part of a request shares one [[context window]]: system prompt, documents, chat history **and** the answer the model writes.',
    formula: ['\\text{tokens} \\approx \\frac{\\text{characters}}{4} \\approx \\frac{\\text{words}}{0.75}', 'T_{\\text{sys}} + T_{\\text{docs}} + T_{\\text{history}} + T_{\\text{out}} \\le W'],
    symbols: [['\\text{characters}', 'length of the text, spaces included (`text.length` in JS)'], ['\\text{words}', 'number of words. Dividing by 0.75 is the same as multiplying by about 1.33'], ['T_{\\text{out}}', 'tokens you reserve for the answer (`max_tokens`)'], ['W', 'the context window size in tokens, for example 8,000 or 128,000']],
    figure: { h: 'Filling an 8,000-token window', size: [800, 330],
      nodes: { win: G1_bar(690, 240, 'Window', '8,000 tok', { kind: 'n', y: 290 }) },
      vars: { used: 0 },
      steps: [
        { cap: 'System prompt: 300 words ÷ 0.75 ≈ 400 tokens.', do: [['add', 'sys', G1_bar(90, 12, 'System', '400 tok', { y: 290, kind: 'b' })], ['var', 'used', '400']] },
        { cap: 'Documents: 12,000 characters ÷ 4 ≈ 3,000 tokens.', do: [['add', 'docs', G1_bar(200, 90, 'Docs', '3,000 tok', { y: 290, kind: 'c' })], ['var', 'used', '3,400']] },
        { cap: 'Chat history: 1,500 words ÷ 0.75 ≈ 2,000 tokens.', do: [['add', 'hist', G1_bar(310, 60, 'History', '2,000 tok', { y: 290, kind: 'd' })], ['var', 'used', '5,400']] },
        { cap: 'Reserve 1,000 tokens for the answer. The output shares the same window.', do: [['add', 'out', G1_bar(420, 30, 'Output', '1,000 tok', { y: 290, kind: 'e' })], ['var', 'used', '6,400']] },
        { cap: 'Total: 6,400 ≤ 8,000. It fits, with 1,600 tokens to spare.', do: [['add', 'used', G1_bar(560, 192, 'Used', '6,400 tok', { y: 290, state: 'ok' })], ['focus', 'used', 'win']] },
        { cap: 'Paste 10,000 more characters (+2,500 tokens): 8,900 > 8,000. The call fails or the answer gets cut off.', do: [['set', 'docs', { h: 165, sub: '5,500 tok' }], ['set', 'used', { h: 267, sub: '8,900 tok', state: 'bad' }], ['var', 'used', '8,900']] }
      ] },
    example: { given: 'A support bot sends a 600-word system prompt, 3 documents of 2,000 characters each, 900 words of chat history and a 30-word question. It reserves 500 tokens for the answer. Input costs $3 per 1M tokens.',
      steps: ['System prompt: \\(600 / 0.75 = 800\\) tokens.', 'Documents: \\(3 \\times 2000 = 6000\\) characters, and \\(6000 / 4 = 1500\\) tokens.', 'History: \\(900 / 0.75 = 1200\\) tokens. Question: \\(30 / 0.75 = 40\\) tokens.', 'Input: \\(800 + 1500 + 1200 + 40 = 3540\\) tokens. Add the 500 reserved for output: 4,040 tokens in the window.', 'Input cost: \\(3540 \\times 3 / 1000000 = 0.01062\\), about one cent per call.'],
      result: 'About 4,040 of the window is used, and each call costs about $0.011 for input. Count exactly with the tokenizer before you rely on it.' },
    lab: { h: 'Will it fit?', body: 'Set how many words you send and how much room you keep for the answer. Pick a window size.', size: [800, 320],
      controls: [{ id: 'words', type: 'range', label: 'Words of input', min: 0, max: 100000, step: 500, value: 20000 }, { id: 'out', type: 'range', label: 'Reserved for output (tokens)', min: 0, max: 8000, step: 500, value: 2000 }, { id: 'win', type: 'select', label: 'Context window', options: ['8,000', '32,000', '128,000'], value: '32,000' }],
      view: s => { const W = +s.v.win.replace(/,/g, ''), inp = Math.round(s.v.words / 0.75), tot = inp + s.v.out, k = 240 / Math.max(W, tot);
        return { nodes: { in: G1_bar(150, inp * k, 'Input', G1_n(inp), { y: 290, w: 90, kind: 'c' }), out: G1_bar(300, s.v.out * k, 'Output', G1_n(s.v.out), { y: 290, w: 90, kind: 'e' }), tot: G1_bar(470, tot * k, 'Total', G1_n(tot), { y: 290, w: 90, state: tot <= W ? 'ok' : 'bad' }), win: G1_bar(640, W * k, 'Window', G1_n(W), { y: 290, w: 90, kind: 'n' }) },
          vars: { 'input ≈ words ÷ 0.75': G1_n(inp), left: G1_n(W - tot) } }; },
      readout: s => { const W = +s.v.win.replace(/,/g, ''), tot = Math.round(s.v.words / 0.75) + s.v.out; return [['Fits', tot <= W ? 'yes' : 'no, over by ' + G1_n(tot - W)]]; } },
    pitfalls: ['The 4-characters rule is for English. Code, JSON, numbers and languages like Bangla, Hindi or Chinese use more tokens per character. Count with the tokenizer.', 'Forgetting the output. If input fills the window, the answer has no room and gets cut off.', 'Each model family has its own tokenizer. The same text can be a different number of tokens on another provider.'],
    code: 'import tiktoken\n\ndef estimate(text: str) -> int:\n    return round(len(text) / 4)          # quick plan\n\nenc = tiktoken.get_encoding("o200k_base")\ndef count(text: str) -> int:\n    return len(enc.encode(text))         # exact for this tokenizer',
    lang: 'Python'
  },

  'BPE': {
    intuition: 'Byte-pair encoding builds a [[tokenizer]] vocabulary from data. Start with single characters (really, single bytes). Count every pair of neighbours in the training text. Glue the most common pair into one new token. Repeat until you have as many tokens as you want.\n\nFrequent words end up as one token because their pairs keep winning. Rare words stay split into smaller pieces. Nothing is ever "unknown": in the worst case a word is spelled out byte by byte.\n\nTo tokenize new text, the tokenizer replays the learned merges in the same order.',
    formula: ['(a, b)^{*} = \\argmax_{(a, b)} \\text{count}(a, b)', 'a \\, b \\to ab \\quad \\text{(merge everywhere, then recount)}'],
    symbols: [['(a, b)', 'two tokens that sit next to each other, like `l` then `o`'], ['\\text{count}(a, b)', 'how often that pair appears, counting each word as many times as it occurs'], ['ab', 'the new token made by gluing the pair together'], ['(a, b)^{*}', 'the winning pair for this round']],
    figure: { h: 'Three merges on a tiny corpus', size: [800, 330],
      nodes: {
        w1: { x: 150, y: 70, label: 'l o w', sub: '×5 · 3 tokens', w: 240, kind: 'a' },
        w2: { x: 150, y: 165, label: 'l o w e r', sub: '×2 · 5 tokens', w: 240, kind: 'a' },
        w3: { x: 150, y: 260, label: 'l o w e s t', sub: '×3 · 6 tokens', w: 240, kind: 'a' },
        pc: { x: 560, y: 110, label: 'Pair counts', sub: 'not counted yet', w: 380, kind: 'd' }
      },
      vars: { 'new tokens': 'none' },
      steps: [
        { cap: 'Corpus: low ×5, lower ×2, lowest ×3. Count each pair of neighbours, times how often its word appears.', do: [['set', 'pc', { sub: 'l o: 10 · o w: 10 · w e: 5 · e s: 3 · s t: 3 · e r: 2' }]] },
        { cap: 'Top pair: l o = 10 (tied with o w; take the first). Merge it everywhere into one token, **lo**.', do: [['set', 'w1', { label: 'lo w', sub: '×5 · 2 tokens' }], ['set', 'w2', { label: 'lo w e r', sub: '×2 · 4 tokens' }], ['set', 'w3', { label: 'lo w e s t', sub: '×3 · 5 tokens' }], ['var', 'new tokens', 'lo']] },
        { cap: 'Recount. lo w = 10 wins. Merge into **low**.', do: [['set', 'pc', { sub: 'lo w: 10 · w e: 5 · e s: 3 · s t: 3 · e r: 2' }], ['set', 'w1', { label: 'low', sub: '×5 · 1 token', state: 'ok' }], ['set', 'w2', { label: 'low e r', sub: '×2 · 3 tokens' }], ['set', 'w3', { label: 'low e s t', sub: '×3 · 4 tokens' }], ['var', 'new tokens', 'lo, low']] },
        { cap: 'Recount. low e = 5 wins. Merge into **lowe**.', do: [['set', 'pc', { sub: 'low e: 5 · e s: 3 · s t: 3 · e r: 2' }], ['set', 'w2', { label: 'lowe r', sub: '×2 · 2 tokens' }], ['set', 'w3', { label: 'lowe s t', sub: '×3 · 3 tokens' }], ['var', 'new tokens', 'lo, low, lowe']] },
        { cap: 'Stop: the vocabulary budget is 3 merges. The frequent word "low" is 1 token; rarer "lowest" is still 3.', do: [['set', 'pc', { label: 'Done: 3 merges', sub: 'learned in order: lo → low → lowe' }], ['focus', 'w1', 'w3']] },
        { cap: 'New text replays the merges in order. "slow": s l o w → s lo w → s low. Two tokens.', do: [['add', 'nw', { x: 560, y: 245, label: 's low', sub: '"slow" · 2 tokens', w: 220, kind: 'c', state: 'active' }]] }
      ] },
    example: { given: 'Corpus: "low" 5 times, "lower" 2 times, "lowest" 3 times. Start from single letters. Do 3 merges.',
      steps: ['Count pairs. "l o" appears once in each word: \\(5 + 2 + 3 = 10\\). Same for "o w": 10. "w e": \\(2 + 3 = 5\\). "e s" and "s t": 3. "e r": 2.', 'Merge 1: "l o" (10, first of the tie) → **lo**. Now "lo w" appears 10 times.', 'Merge 2: "lo w" (10) → **low**. Now "low e" appears \\(2 + 3 = 5\\) times; "e s" and "s t" stay at 3.', 'Merge 3: "low e" (5) → **lowe**. Words are now: low, lowe r, lowe s t.', 'Count tokens in the corpus: \\(5 \\times 1 + 2 \\times 2 + 3 \\times 3 = 18\\), down from \\(5 \\times 3 + 2 \\times 5 + 3 \\times 6 = 43\\) letters.'],
      result: 'Three merges cut the corpus from 43 tokens to 18. Real tokenizers do this until they have 50,000 to 200,000 tokens.' },
    pitfalls: ['Real BPE works on bytes, not letters, and spaces are part of tokens (` low` with a leading space is a different token from `low`).', 'Merges are learned once, at training time. Your app never trains BPE; it only uses the tokenizer that ships with the model.', 'Because words split by frequency, typos, rare names and non-English text cost more tokens.'],
    code: 'from collections import Counter\n\nwords = {("l","o","w"): 5, ("l","o","w","e","r"): 2, ("l","o","w","e","s","t"): 3}\n\nfor _ in range(3):\n    pairs = Counter()\n    for w, n in words.items():\n        for a, b in zip(w, w[1:]):\n            pairs[a, b] += n\n    (a, b), _ = pairs.most_common(1)[0]   # ties: first seen wins\n    merged = {}\n    for w, n in words.items():\n        out, i = [], 0\n        while i < len(w):\n            if i + 1 < len(w) and (w[i], w[i+1]) == (a, b):\n                out.append(a + b); i += 2\n            else:\n                out.append(w[i]); i += 1\n        merged[tuple(out)] = n\n    words = merged\n    print(a + b, list(words))',
    lang: 'Python'
  },

  'logits': {
    intuition: 'At every step the model gives each token in its vocabulary (often 100,000 or more) a raw score. These scores are the [[logits]]. Bigger means "more likely next".\n\nLogits are **not** probabilities. They can be negative, and they do not add up to 1. [[softmax|Softmax]] turns them into probabilities.\n\nOnly the **gaps** between logits matter. If one token\'s logit is 1 higher than another, it is \\(e^1 \\approx 2.72\\) times as likely. Add 10 to every logit and nothing changes.',
    formula: ['z = (z_1, z_2, \\ldots, z_V)', '\\frac{p_i}{p_j} = e^{z_i − z_j}', '\\log p_i = z_i − \\log \\sum_j e^{z_j}'],
    symbols: [['z_i', 'the logit (raw score) for token i'], ['V', 'vocabulary size: how many tokens the model knows'], ['p_i', 'the probability of token i after softmax'], ['e', 'the number 2.718…, the base of natural logs'], ['\\log p_i', 'the log-probability, what APIs return as `logprobs`']],
    figure: { h: 'From raw scores to probabilities', size: [800, 320],
      nodes: { m: { x: 100, y: 160, label: 'Model', sub: '"…sat on the"', w: 130, kind: 'b' } },
      steps: [
        { cap: 'The model reads "The cat sat on the" and scores every token. These raw scores are the logits.', do: [['add', 'l1', { x: 330, y: 45, label: 'mat: 3.0', shape: 'pill', w: 140, kind: 'a' }], ['add', 'l2', { x: 330, y: 120, label: 'sofa: 2.0', shape: 'pill', w: 140, kind: 'a' }], ['add', 'l3', { x: 330, y: 195, label: 'floor: 1.0', shape: 'pill', w: 140, kind: 'a' }], ['add', 'l4', { x: 330, y: 270, label: 'moon: 0.0', shape: 'pill', w: 140, kind: 'a' }]] },
        { cap: 'Only gaps matter. mat beats sofa by 1.0, so mat is \\(e^{1} \\approx 2.72\\) times as likely.', do: [['focus', 'l1', 'l2']] },
        { cap: 'Softmax turns the scores into probabilities that add up to 1.', do: [['add', 'b1', G1_bar(510, 161, 'mat', '0.644', { w: 60, y: 290, kind: 'c' })], ['add', 'b2', G1_bar(590, 59, 'sofa', '0.237', { w: 60, y: 290, kind: 'c' })], ['add', 'b3', G1_bar(670, 22, 'floor', '0.087', { w: 60, y: 290, kind: 'c' })], ['add', 'b4', G1_bar(750, 8, 'moon', '0.032', { w: 60, y: 290, kind: 'c' })]] },
        { cap: 'Add 10 to every logit: 13, 12, 11, 10. The gaps are the same, so the probabilities do not move at all.', do: [['set', 'l1', { label: 'mat: 13.0' }], ['set', 'l2', { label: 'sofa: 12.0' }], ['set', 'l3', { label: 'floor: 11.0' }], ['set', 'l4', { label: 'moon: 10.0' }]] },
        { cap: 'APIs can return logprobs: \\(\\log(0.644) \\approx {−0.44}\\) for mat. Closer to 0 means more confident.', do: [['focus', 'b1']] }
      ] },
    example: { given: 'Logits: mat 3.0, sofa 2.0, floor 1.0, moon 0.0.',
      steps: ['Gap between mat and sofa: \\(3.0 − 2.0 = 1.0\\).', 'So mat is \\(e^{1.0} \\approx 2.718\\) times as likely as sofa.', 'Check with the softmax results: \\(0.644 / 0.237 \\approx 2.72\\). It matches.', 'Log-probability of mat: \\(3.0 − \\log(e^3 + e^2 + e^1 + e^0)\\). That is \\(3.0 − \\log(31.19)\\), and \\(3.0 − 3.44 = {−0.44}\\).', 'Undo the log: \\(e^{−0.44} \\approx 0.644\\). Same number as softmax gives.'],
      result: 'A gap of 1 in logits means about 2.7× in probability. Logprobs near 0 mean the model was confident.' },
    pitfalls: ['A logit on its own means nothing. "mat scored 3.0" tells you nothing until you compare it with the other scores.', 'Logprobs show confidence, not truth. A model can be very sure and still wrong.'],
    code: 'import math\n\nlogits = {"mat": 3.0, "sofa": 2.0, "floor": 1.0, "moon": 0.0}\nlog_z = math.log(sum(math.exp(z) for z in logits.values()))\nlogprobs = {t: z - log_z for t, z in logits.items()}\nprint(round(logprobs["mat"], 2))   # -0.44',
    lang: 'Python'
  },

  'softmax': {
    intuition: '[[softmax|Softmax]] turns any list of scores into probabilities. Two moves: make every score positive with \\(e^{z}\\), then divide each by the total so they add up to 1.\n\nThe \\(e^{z}\\) part also stretches the gaps. A score that is a bit higher gets a lot more of the probability. That is why one token usually dominates.',
    formula: ['p_i = \\softmax(z)_i = \\frac{e^{z_i}}{\\sum_{j=1}^{V} e^{z_j}}', '\\sum_{i=1}^{V} p_i = 1'],
    symbols: [['z_i', 'the logit (raw score) of token i'], ['e^{z_i}', 'e (≈ 2.718) to the power z_i. Always positive'], ['\\sum_j e^{z_j}', 'the total of all those powers, used to scale them down'], ['p_i', 'the probability of token i, between 0 and 1'], ['V', 'how many tokens there are']],
    figure: { h: 'Softmax, one move at a time', size: [800, 320],
      nodes: {
        b1: G1_bar(130, 120, 'mat', 'z = 3', { y: 290 }), b2: G1_bar(270, 80, 'sofa', 'z = 2', { y: 290 }),
        b3: G1_bar(410, 40, 'floor', 'z = 1', { y: 290 }), b4: G1_bar(550, 1, 'moon', 'z = 0', { y: 290 })
      },
      vars: { stage: 'logits' },
      steps: [
        { cap: 'Start with the logits 3, 2, 1, 0. Bar height = logit.', do: [['focus', 'b1', 'b2', 'b3', 'b4']] },
        { cap: 'Raise e to each logit: \\(e^3 \\approx 20.09\\), \\(e^2 \\approx 7.39\\), \\(e^1 \\approx 2.72\\), \\(e^0 = 1\\). All positive now.', do: [['set', 'b1', { h: 161, sub: '20.09' }], ['set', 'b2', { h: 59, sub: '7.39' }], ['set', 'b3', { h: 22, sub: '2.72' }], ['set', 'b4', { h: 8, sub: '1.00' }], ['var', 'stage', 'e to the z']] },
        { cap: 'Add them up: \\(20.09 + 7.39 + 2.72 + 1.00 = 31.19\\).', do: [['add', 'sum', G1_bar(700, 250, 'Sum', '31.19', { y: 290, kind: 'n' })], ['var', 'stage', 'sum']] },
        { cap: 'Divide each by 31.19. The shape stays; the scale changes, so the sum bar now means 1.0.', do: [['set', 'b1', { sub: '0.644' }], ['set', 'b2', { sub: '0.237' }], ['set', 'b3', { sub: '0.087' }], ['set', 'b4', { sub: '0.032' }], ['set', 'sum', { sub: '1.000' }]] },
        { cap: 'Check: \\(0.644 + 0.237 + 0.087 + 0.032 = 1.000\\). The model samples the next token from these.', do: [['set', 'b1', { state: 'active' }], ['var', 'stage', 'probabilities']] }
      ] },
    example: { given: 'Logits: mat 3, sofa 2, floor 1, moon 0.',
      steps: ['Powers: \\(e^3 \\approx 20.09\\), \\(e^2 \\approx 7.39\\), \\(e^1 \\approx 2.72\\), \\(e^0 = 1.00\\).', 'Sum: \\(20.09 + 7.39 + 2.72 + 1.00 = 31.19\\).', 'mat: \\(20.09 / 31.19 \\approx 0.644\\). sofa: \\(7.39 / 31.19 \\approx 0.237\\).', 'floor: \\(2.72 / 31.19 \\approx 0.087\\). moon: \\(1.00 / 31.19 \\approx 0.032\\).', 'Check: \\(0.644 + 0.237 + 0.087 + 0.032 = 1.000\\).'],
      result: 'mat gets 64.4%. Its logit was only 1 higher than sofa, but it gets 2.7× the probability.' },
    lab: { h: 'Move the scores', body: 'Drag the three logits. The bars are the real softmax probabilities.', size: [800, 300],
      controls: [{ id: 'a', type: 'range', label: 'Logit for mat', min: -3, max: 5, step: 0.5, value: 3 }, { id: 'b', type: 'range', label: 'Logit for sofa', min: -3, max: 5, step: 0.5, value: 2 }, { id: 'c', type: 'range', label: 'Logit for floor', min: -3, max: 5, step: 0.5, value: 1 }],
      view: s => { const z = [s.v.a, s.v.b, s.v.c], p = G1_softmax(z, 1), sum = z.reduce((t, v) => t + Math.exp(v), 0), nodes = {};
        ['mat', 'sofa', 'floor'].forEach((t, i) => { nodes['p' + i] = G1_bar(200 + i * 200, p[i] * 240, t, p[i].toFixed(3), { w: 90, kind: 'c' }); });
        return { nodes, vars: { 'sum of e^z': sum.toFixed(2), 'total p': p.reduce((a, b) => a + b, 0).toFixed(3) } }; },
      readout: s => [['Biggest gap', Math.max(s.v.a, s.v.b, s.v.c) - Math.min(s.v.a, s.v.b, s.v.c)]] },
    pitfalls: ['Big logits overflow: \\(e^{1000}\\) is infinity in a float. Real code subtracts the largest logit first. It gives the same answer, because only gaps matter.', 'Softmax probabilities are not calibrated truth. A 0.9 does not mean "right 90% of the time".'],
    code: 'import math\n\ndef softmax(z):\n    m = max(z)                        # subtract max: no overflow\n    e = [math.exp(v - m) for v in z]\n    s = sum(e)\n    return [v / s for v in e]\n\nprint(softmax([3, 2, 1, 0]))   # [0.644, 0.237, 0.087, 0.032]',
    lang: 'Python'
  },

  'temperature': {
    intuition: '[[temperature|Temperature]] divides every logit by a number \\(T\\) before [[softmax]].\n\nA small \\(T\\) (below 1) makes the gaps bigger, so the top token wins even more. As \\(T\\) goes to 0, the top token gets everything: that is [[greedy decoding]]. A big \\(T\\) (above 1) shrinks the gaps, so the bars flatten and unlikely tokens get a real chance.\n\nUse low \\(T\\) for facts, code and JSON. Use higher \\(T\\) for brainstorming.',
    formula: ['p_i = \\frac{e^{z_i / T}}{\\sum_j e^{z_j / T}}', 'T \\to 0 \\quad \\Rightarrow \\quad \\text{all probability on } \\argmax_i z_i'],
    symbols: [['z_i', 'the logit of token i'], ['T', 'temperature, usually 0 to 2. \\(T = 1\\) leaves the logits as they are'], ['z_i / T', 'the scaled logit. Dividing by 0.5 doubles every gap; dividing by 2 halves it'], ['p_i', 'the probability of token i after scaling']],
    figure: { h: 'One set of logits, three temperatures', size: [800, 320],
      nodes: {
        b1: G1_bar(160, 161, 'mat', '0.644', { y: 290, kind: 'c' }), b2: G1_bar(300, 59, 'sofa', '0.237', { y: 290, kind: 'c' }),
        b3: G1_bar(440, 22, 'floor', '0.087', { y: 290, kind: 'c' }), b4: G1_bar(580, 8, 'moon', '0.032', { y: 290, kind: 'c' })
      },
      vars: { T: '1', 'z / T': '3, 2, 1, 0' },
      steps: [
        { cap: 'At \\(T = 1\\), the logits 3, 2, 1, 0 give 0.644, 0.237, 0.087, 0.032.', do: [['focus', 'b1', 'b2', 'b3', 'b4']] },
        { cap: '\\(T = 0.5\\): logits become 6, 4, 2, 0. The gaps double, and mat jumps to 0.865.', do: [['set', 'b1', { h: 216, sub: '0.865' }], ['set', 'b2', { h: 29, sub: '0.117' }], ['set', 'b3', { h: 4, sub: '0.016' }], ['set', 'b4', { h: 1, sub: '0.002' }], ['var', 'T', '0.5'], ['var', 'z / T', '6, 4, 2, 0']] },
        { cap: '\\(T \\to 0\\): the gaps grow without limit. mat gets everything. This is greedy decoding.', do: [['set', 'b1', { h: 250, sub: '1.000', state: 'active' }], ['set', 'b2', { h: 1, sub: '0' }], ['set', 'b3', { h: 1, sub: '0' }], ['set', 'b4', { h: 1, sub: '0' }], ['var', 'T', '→ 0'], ['var', 'z / T', 'huge gaps']] },
        { cap: '\\(T = 2\\): logits become 1.5, 1, 0.5, 0. The gaps halve, and the bars flatten.', do: [['set', 'b1', { h: 114, sub: '0.455', state: null }], ['set', 'b2', { h: 69, sub: '0.276' }], ['set', 'b3', { h: 42, sub: '0.167' }], ['set', 'b4', { h: 25, sub: '0.102' }], ['var', 'T', '2'], ['var', 'z / T', '1.5, 1, 0.5, 0']] },
        { cap: 'At \\(T = 2\\), moon rises from 3% to 10%. Fine for a poem, risky for JSON.', do: [['focus', 'b4'], ['note', 'b4', '0.032 → 0.102']] }
      ] },
    example: { given: 'Logits: mat 3, sofa 2, floor 1, moon 0. Temperature \\(T = 2\\).',
      steps: ['Divide by T: \\(3/2 = 1.5\\), \\(2/2 = 1\\), \\(1/2 = 0.5\\), \\(0/2 = 0\\).', 'Powers: \\(e^{1.5} \\approx 4.482\\), \\(e^{1} \\approx 2.718\\), \\(e^{0.5} \\approx 1.649\\), \\(e^{0} = 1\\).', 'Sum: \\(4.482 + 2.718 + 1.649 + 1 = 9.849\\).', 'Probabilities: \\(4.482 / 9.849 \\approx 0.455\\), \\(2.718 / 9.849 \\approx 0.276\\), \\(1.649 / 9.849 \\approx 0.167\\), \\(1 / 9.849 \\approx 0.102\\).', 'Compare with \\(T = 1\\): mat fell from 0.644 to 0.455, moon rose from 0.032 to 0.102.'],
      result: 'Doubling the temperature halved every gap. The top token lost about 19 points; the long shot tripled.' },
    lab: { h: 'Turn the dial', body: 'Same logits (3, 2, 1, 0). Slide the temperature and watch the real probabilities.', size: [800, 300],
      controls: [{ id: 'T', type: 'range', label: 'Temperature T', min: 0, max: 2, step: 0.05, value: 1 }],
      view: s => { const T = Math.round(s.v.T * 100) / 100, p = G1_softmax(G1_Z, T), nodes = {};
        G1_TOK.forEach((t, i) => { nodes['p' + i] = G1_bar(160 + i * 160, p[i] * 240, t, p[i].toFixed(3), { w: 80, kind: 'c', state: T === 0 && i === 0 ? 'active' : undefined }); });
        return { nodes, vars: { T: T === 0 ? '0 (greedy)' : String(T), 'z / T': T === 0 ? 'top token only' : G1_Z.map(z => +(z / T).toFixed(2)).join(', ') } }; },
      readout: s => { const p = G1_softmax(G1_Z, Math.round(s.v.T * 100) / 100); return [['Chance of moon', (p[3] * 100).toFixed(1) + '%']]; } },
    pitfalls: ['\\(T = 0\\) is a special case: you cannot divide by zero. APIs treat it as "pick the top token".', 'Low temperature does not make answers true. It only makes them repeatable.', 'Some newer reasoning models ignore or reject temperature. Check the provider docs.'],
    code: 'import math\n\ndef probs(logits, T):\n    if T == 0:                                    # greedy\n        top = max(range(len(logits)), key=logits.__getitem__)\n        return [1.0 if i == top else 0.0 for i in range(len(logits))]\n    m = max(logits)\n    e = [math.exp((z - m) / T) for z in logits]\n    return [v / sum(e) for v in e]\n\nprint(probs([3, 2, 1, 0], 2))   # [0.455, 0.276, 0.167, 0.102]',
    lang: 'Python'
  },

  'top-p': {
    intuition: '[[top-p|Top-p]] (nucleus sampling) cuts off the long tail of unlikely tokens before the draw.\n\nSort tokens from most to least likely. Add their probabilities one by one. Stop as soon as the running total reaches \\(p\\). Keep only those tokens, scale them so they add up to 1 again, and draw from them.\n\nWhen the model is sure, the nucleus is tiny (maybe one token). When it is unsure, more tokens stay in. The cut adapts by itself.',
    formula: ['p_{(1)} \\ge p_{(2)} \\ge \\ldots \\ge p_{(V)}', 'k = \\text{smallest number with } \\sum_{i=1}^{k} p_{(i)} \\ge p', 'p\'_{(i)} = \\frac{p_{(i)}}{\\sum_{j=1}^{k} p_{(j)}} \\quad \\text{for } i \\le k'],
    symbols: [['p_{(i)}', 'the i-th biggest probability after sorting'], ['p', 'the top-p setting, for example 0.9'], ['k', 'how many tokens stay in the nucleus'], ['p\'_{(i)}', 'the new probability after rescaling. Tokens outside the nucleus get 0']],
    figure: { h: 'Top-p = 0.9 on five tokens', size: [800, 320],
      nodes: {
        b1: G1_bar(130, 200, 'mat', '0.50', { y: 290, kind: 'c' }), b2: G1_bar(250, 100, 'sofa', '0.25', { y: 290, kind: 'c' }),
        b3: G1_bar(370, 48, 'floor', '0.12', { y: 290, kind: 'c' }), b4: G1_bar(490, 32, 'rug', '0.08', { y: 290, kind: 'c' }),
        b5: G1_bar(610, 20, 'moon', '0.05', { y: 290, kind: 'c' })
      },
      vars: { p: '0.9', 'running total': '0' },
      steps: [
        { cap: 'Sort from most to least likely. All five add up to 1.00.', do: [['focus', 'b1', 'b2', 'b3', 'b4', 'b5']] },
        { cap: 'Running total: mat 0.50, plus sofa = 0.75. Still below 0.9, so keep going.', do: [['set', 'b1', { state: 'active' }], ['set', 'b2', { state: 'active' }], ['var', 'running total', '0.75']] },
        { cap: 'Plus floor = 0.87. Still below 0.9.', do: [['set', 'b3', { state: 'active' }], ['var', 'running total', '0.87']] },
        { cap: 'Plus rug = 0.95, which is ≥ 0.9. Stop. The nucleus is mat, sofa, floor, rug.', do: [['set', 'b4', { state: 'active' }], ['var', 'running total', '0.95']] },
        { cap: 'Cut the tail. moon (0.05) can never be picked now.', do: [['set', 'b5', { state: 'off', sub: 'cut' }]] },
        { cap: 'Rescale: divide each kept value by 0.95. Now they add up to 1 again.', do: [['set', 'b1', { h: 211, sub: '0.53', state: 'ok' }], ['set', 'b2', { h: 105, sub: '0.26', state: 'ok' }], ['set', 'b3', { h: 51, sub: '0.13', state: 'ok' }], ['set', 'b4', { h: 34, sub: '0.08', state: 'ok' }], ['var', 'running total', '1.00']] }
      ] },
    example: { given: 'Probabilities: mat 0.50, sofa 0.25, floor 0.12, rug 0.08, moon 0.05. Top-p \\(p = 0.9\\).',
      steps: ['Already sorted. Running totals: 0.50, then \\(0.50 + 0.25 = 0.75\\), then \\(0.75 + 0.12 = 0.87\\), then \\(0.87 + 0.08 = 0.95\\).', 'The first total that is \\(\\ge 0.9\\) is 0.95, after 4 tokens. So \\(k = 4\\) and moon is cut.', 'Rescale by 0.95: mat \\(0.50 / 0.95 \\approx 0.5263\\), sofa \\(0.25 / 0.95 \\approx 0.2632\\).', 'floor \\(0.12 / 0.95 \\approx 0.1263\\), rug \\(0.08 / 0.95 \\approx 0.0842\\).', 'Check: \\(0.5263 + 0.2632 + 0.1263 + 0.0842 = 1.0000\\).'],
      result: 'Four tokens stay in the draw. moon\'s 5% chance is now 0%.' },
    lab: { h: 'Set p', body: 'Same five tokens. Slide p and see which tokens survive, and their rescaled chances.', size: [800, 300],
      controls: [{ id: 'p', type: 'range', label: 'Top-p', min: 0.1, max: 1, step: 0.05, value: 0.9 }],
      view: s => { const P = [50, 25, 12, 8, 5], T = ['mat', 'sofa', 'floor', 'rug', 'moon'], need = Math.round(s.v.p * 100); let cum = 0, k = 0;
        while (k < P.length && cum < need) cum += P[k++];
        const nodes = {};
        T.forEach((t, i) => { const keep = i < k, q = keep ? P[i] / cum : 0; nodes['p' + i] = G1_bar(130 + i * 135, keep ? q * 240 : P[i] * 2.4, t, keep ? q.toFixed(2) : 'cut', { w: 80, kind: 'c', state: keep ? 'ok' : 'off' }); });
        return { nodes, vars: { p: s.v.p.toFixed(2), kept: k + ' of 5', 'kept total': (cum / 100).toFixed(2) } }; } },
    pitfalls: ['The test is "≥ p", and you include the token that crosses the line. Forgetting it can leave an empty nucleus.', 'Tune top-p **or** temperature, not both at once. Changing both makes results hard to reason about.', 'Top-p = 1.0 cuts nothing. Very low top-p acts almost like greedy decoding.'],
    code: 'def top_p(probs: dict, p: float) -> dict:\n    items = sorted(probs.items(), key=lambda kv: kv[1], reverse=True)\n    kept, total = [], 0.0\n    for tok, pr in items:\n        kept.append((tok, pr))\n        total += pr\n        if total >= p:\n            break\n    return {tok: pr / total for tok, pr in kept}',
    lang: 'Python'
  },

  'greedy decoding': {
    intuition: '[[greedy decoding|Greedy decoding]] always takes the single most likely next token. No dice.\n\nThat makes it **repeatable**: same input, same scores, same pick, same text. Great for tests, extraction and JSON.\n\nIt is not the same as "best answer". Greedy never looks ahead, so a slightly worse first word that leads to a much better second word gets skipped. And if the text reaches a state it has seen before, it picks the same tokens again and can loop: "It is good. It is good. It is good."',
    formula: ['y_t = \\argmax_i \\, p(i \\mid y_1, \\ldots, y_{t−1})', 'P(y_1, \\ldots, y_n) = \\prod_{t=1}^{n} p(y_t \\mid y_1, \\ldots, y_{t−1})'],
    symbols: [['y_t', 'the token chosen at step t'], ['p(i \\mid \\ldots)', 'the probability of token i, given everything written so far'], ['\\argmax_i', '"the i that gives the biggest value": pick the top token'], ['\\prod', 'multiply all the terms together. The chance of a whole sequence is the product of each step']],
    figure: { h: 'Greedy picks the best step, not the best path', size: [800, 330],
      nodes: { st: { x: 100, y: 165, label: 'Prompt', sub: '"Once upon…"', w: 130, kind: 'b' } },
      vars: {},
      steps: [
        { cap: 'Step 1: the top choices are The (0.5) and A (0.4). Greedy takes the top one: The.', do: [['add', 'the', { x: 340, y: 85, label: 'The', sub: 'p = 0.5', kind: 'a', state: 'active' }], ['add', 'a', { x: 340, y: 245, label: 'A', sub: 'p = 0.4', kind: 'a' }], ['link', 'st', 'the', '0.5'], ['link', 'st', 'a', '0.4']] },
        { cap: 'Step 2: after The, the best next token is dog at 0.4. Greedy takes it.', do: [['add', 'dog', { x: 620, y: 60, label: 'dog', sub: 'p = 0.4', kind: 'a', state: 'active' }], ['link', 'the', 'dog', '0.4']] },
        { cap: 'Chance of the whole path: \\(0.5 \\times 0.4 = 0.20\\).', do: [['var', 'The dog', '0.20'], ['focus', 'st', 'the', 'dog']] },
        { cap: 'The skipped path: A, then cat at 0.9. \\(0.4 \\times 0.9 = 0.36\\). Better overall.', do: [['add', 'cat', { x: 620, y: 270, label: 'cat', sub: 'p = 0.9', kind: 'c', state: 'ok' }], ['link', 'a', 'cat', '0.9'], ['set', 'a', { state: 'ok' }], ['var', 'A cat', '0.36']] },
        { cap: 'Greedy is repeatable, not optimal. Run it again and you get "The dog" every time.', do: [['set', 'dog', { state: 'warn' }], ['focus', 'dog', 'cat']] }
      ] },
    example: { given: 'Step 1 offers The (0.5) or A (0.4). After The, the best is dog (0.4). After A, the best is cat (0.9).',
      steps: ['Greedy step 1: \\(\\max(0.5, 0.4) = 0.5\\), so it writes The.', 'Greedy step 2: the best after The is dog, 0.4.', 'Chance of "The dog": \\(0.5 \\times 0.4 = 0.20\\).', 'Chance of "A cat": \\(0.4 \\times 0.9 = 0.36\\), which is higher.', 'Greedy never saw it, because it never looks past the current step.'],
      result: 'Greedy output: "The dog" (0.20), every single run. The likelier "A cat" (0.36) was missed.' },
    pitfalls: ['Repetition loops. If "It is good." makes "It" the top next token again, greedy writes the same sentence until `max_tokens`. A small temperature or a repetition penalty breaks the loop.', '"Temperature 0" on a hosted API is nearly, not perfectly, repeatable. Ties and GPU math can still flip a token now and then. Do not rely on byte-identical output in tests.'],
    code: 'def greedy(model, prompt, max_tokens=50):\n    tokens = prompt\n    for _ in range(max_tokens):\n        probs = model(tokens)                  # dict: token -> probability\n        nxt = max(probs, key=probs.get)        # argmax: no randomness\n        if nxt == "<end>":\n            break\n        tokens = tokens + [nxt]\n    return tokens',
    lang: 'Python'
  },

  'exponential backoff': {
    intuition: 'When a call fails with `429` or `503`, retrying at once usually fails again: the server is still busy. So wait, and **double** the wait after each failure: 1 s, 2 s, 4 s, 8 s… A cap stops it from growing forever.\n\nIf 1,000 clients fail at the same moment and all wait exactly 4 s, they all hit the server again together. **Jitter** fixes that: each client waits a random time between 0 and the backoff value, so the retries spread out.',
    formula: ['\\text{delay}_n = \\min(\\text{cap}, \\, \\text{base} \\cdot 2^{n})', '\\text{sleep}_n = \\text{random}(0, \\, \\text{delay}_n) \\quad \\text{(full jitter)}'],
    symbols: [['n', 'the retry number, starting at 0'], ['\\text{base}', 'the first wait, for example 1 second'], ['\\text{cap}', 'the longest wait you allow, for example 30 seconds'], ['2^{n}', 'doubles each time: 1, 2, 4, 8, 16, 32…'], ['\\text{random}(0, x)', 'a random number between 0 and x, new for every retry']],
    figure: { h: 'Waits with base 1 s and cap 30 s', size: [800, 330], nodes: {}, vars: { 'total wait': '0 s' },
      steps: [
        { cap: 'Retry 0 fails with 429. Wait \\(1 \\cdot 2^0 = 1\\) s.', do: [['add', 'd0', G1_bar(100, 8, '#0', '1 s', { y: 290, w: 64 })], ['var', 'total wait', '1 s']] },
        { cap: 'It fails again. Wait \\(2^1 = 2\\) s, then \\(2^2 = 4\\) s. Each wait doubles.', do: [['add', 'd1', G1_bar(200, 16, '#1', '2 s', { y: 290, w: 64 })], ['add', 'd2', G1_bar(300, 32, '#2', '4 s', { y: 290, w: 64 })], ['var', 'total wait', '7 s']] },
        { cap: 'Then 8 s and 16 s. Five retries have waited \\(1 + 2 + 4 + 8 + 16 = 31\\) s.', do: [['add', 'd3', G1_bar(400, 64, '#3', '8 s', { y: 290, w: 64 })], ['add', 'd4', G1_bar(500, 128, '#4', '16 s', { y: 290, w: 64 })], ['var', 'total wait', '31 s']] },
        { cap: 'Next would be \\(2^5 = 32\\) s, but the cap wins: \\(\\min(30, 32) = 30\\) s.', do: [['add', 'd5', G1_bar(600, 240, '#5', '30 s', { y: 290, w: 64, state: 'warn' })], ['var', 'total wait', '61 s']] },
        { cap: 'Full jitter: retry 5 waits a random time up to 30 s. With a draw of 0.4: \\(0.4 \\times 30 = 12\\) s.', do: [['set', 'd5', { h: 96, sub: '12 s', state: 'active' }], ['note', 'd5', 'random(0, 30)']] },
        { cap: 'Every client draws its own number, so 1,000 clients spread over 30 s instead of one spike.', do: [['set', 'd3', { h: 30, sub: '3.8 s' }], ['set', 'd4', { h: 107, sub: '13.4 s' }], ['focus', 'd3', 'd4', 'd5']] }
      ] },
    example: { given: 'Base 1 s, cap 30 s. Full jitter with random draws 0.25 (retry 4) and 0.4 (retry 6).',
      steps: ['Retry 4: \\(1 \\cdot 2^4 = 16\\). \\(\\min(30, 16) = 16\\) s.', 'With full jitter and a draw of 0.25: \\(0.25 \\times 16 = 4\\) s.', 'Retry 6: \\(1 \\cdot 2^6 = 64\\). \\(\\min(30, 64) = 30\\) s. With a draw of 0.4: \\(0.4 \\times 30 = 12\\) s.', 'Without jitter, retries 0 to 5 wait \\(1 + 2 + 4 + 8 + 16 + 30 = 61\\) s in total.', 'With full jitter each wait is on average half its ceiling, so about \\(61 / 2 = 30.5\\) s.'],
      result: 'Six retries take about a minute without jitter, about half that with it, and the retries no longer arrive in lockstep.' },
    lab: { h: 'Tune the backoff', body: 'Change the base and the cap. Turn on full jitter to see one set of random draws (fixed here so you can compare).', size: [800, 320],
      controls: [{ id: 'base', type: 'range', label: 'Base (s)', min: 0.5, max: 4, step: 0.5, value: 1, unit: 's' }, { id: 'cap', type: 'range', label: 'Cap (s)', min: 5, max: 60, step: 5, value: 30, unit: 's' }, { id: 'jit', type: 'toggle', label: 'Full jitter' }],
      view: s => { const nodes = {}, k = 240 / s.v.cap; let tot = 0;
        for (let n = 0; n < 7; n++) { const d = Math.min(s.v.cap, s.v.base * 2 ** n), w = s.v.jit ? G1_R[n] * d : d; tot += w;
          nodes['d' + n] = G1_bar(100 + n * 100, w * k, '#' + n, (+w.toFixed(1)) + ' s', { y: 290, w: 64, state: d === s.v.cap ? 'warn' : undefined }); }
        return { nodes, vars: { 'total wait': (+tot.toFixed(1)) + ' s' } }; },
      readout: s => [['Retry 6 ceiling', 'min(' + s.v.cap + ', ' + s.v.base + ' × 64) = ' + Math.min(s.v.cap, s.v.base * 64) + ' s']] },
    pitfalls: ['If the response has a `Retry-After` header, wait that long instead. The server knows better.', 'Only retry errors that can pass: `429`, `500`, `503`, timeouts. Never retry a `400` or `401`; it will fail every time.', 'Limit the number of retries (for example 5), and make the call [[idempotent]] so a retry does not repeat a side effect.'],
    code: 'import random, time\n\ndef call_with_retry(fn, base=1.0, cap=30.0, tries=6):\n    for n in range(tries):\n        try:\n            return fn()\n        except RateLimitError:\n            if n == tries - 1:\n                raise\n            delay = min(cap, base * 2 ** n)\n            time.sleep(random.uniform(0, delay))   # full jitter',
    lang: 'Python'
  },

  'prompt caching': {
    intuition: 'Most requests start with the same big block: system prompt, tool schemas, reference docs. Only the end changes. With [[prompt caching]], the provider keeps the processed start of the prompt. The next request with the exact same prefix reads it from cache: a [[cache hit]].\n\nCached input tokens cost much less, often about 10% of the normal price. The new tokens at the end still pay full price.\n\nSo the bill depends on two numbers: how big the shared prefix is, and how often you hit the cache.',
    formula: ['C = \\frac{N_c \\cdot P_c + N_u \\cdot P}{10^6}', 'P_{\\text{avg}} = h \\cdot P_c + (1 − h) \\cdot P'],
    symbols: [['C', 'input cost of one request, in dollars'], ['N_c', 'tokens read from the cache (the shared prefix)'], ['N_u', 'tokens not cached: the new part, or the whole prompt on a miss'], ['P, \\, P_c', 'normal and cached price, in dollars per 1M tokens (here $3 and $0.30)'], ['h', 'hit rate: the share of requests that find the prefix in cache, from 0 to 1'], ['P_{\\text{avg}}', 'the average price you pay for a prefix token']],
    figure: { h: 'Input cost per day at different hit rates', size: [800, 330], nodes: {}, vars: { requests: '10,000/day' },
      steps: [
        { cap: 'No cache: 8,300 tokens × $3/M = $0.0249 a request. Times 10,000 = $249 a day.', do: [['add', 'h0', G1_bar(150, 249 * 0.96, '0%', '$249', { y: 290, kind: 'e' })]] },
        { cap: '50% hits: the 8,000-token prefix averages \\(0.5 \\times 0.30 + 0.5 \\times 3 = 1.65\\) $/M. That is $141 a day.', do: [['add', 'h50', G1_bar(310, 141 * 0.96, '50%', '$141', { y: 290, kind: 'd' })]] },
        { cap: '90% hits: \\(0.9 \\times 0.30 + 0.1 \\times 3 = 0.57\\) $/M for the prefix. $54.60 a day.', do: [['add', 'h90', G1_bar(470, 54.6 * 0.96, '90%', '$54.60', { y: 290, kind: 'c' })]] },
        { cap: 'Every request hits: $33 a day. The 300 new tokens always pay full price: $9 of that.', do: [['add', 'h100', G1_bar(630, 33 * 0.96, '100%', '$33', { y: 290, kind: 'c', state: 'ok' })]] },
        { cap: 'Hit rate is the lever. Change one byte near the start of the prompt and every request misses.', do: [['set', 'h90', { state: 'active' }], ['focus', 'h0', 'h90'], ['var', 'saved at 90%', '$194.40/day']] }
      ] },
    example: { given: '10,000 requests a day. Each has an 8,000-token shared prefix and 300 new tokens. Prices: $3 per 1M input tokens, $0.30 per 1M cached. Hit rate 90%.',
      steps: ['No cache: \\(8300 \\times 3 / 10^6 = 0.0249\\) dollars a request, so \\(0.0249 \\times 10000 = 249\\) dollars a day.', 'Average prefix price: \\(0.9 \\times 0.30 + 0.1 \\times 3 = 0.27 + 0.30 = 0.57\\) dollars per 1M.', 'Per request: \\((8000 \\times 0.57 + 300 \\times 3) / 10^6 = (4560 + 900) / 10^6 = 0.00546\\) dollars.', 'Per day: \\(0.00546 \\times 10000 = 54.60\\) dollars.', 'Saved: \\(249 − 54.60 = 194.40\\) dollars a day, about 78%.'],
      result: 'Input drops from $249 to $54.60 a day. Output tokens are not cached, so their cost stays the same.' },
    lab: { h: 'Your bill', body: 'Prices: $3 per 1M input tokens, $0.30 cached. Each request also has 300 new tokens.', size: [800, 320],
      controls: [{ id: 'h', type: 'range', label: 'Hit rate', min: 0, max: 100, step: 5, value: 90, unit: '%' }, { id: 'pre', type: 'range', label: 'Shared prefix (tokens)', min: 1000, max: 20000, step: 1000, value: 8000 }, { id: 'req', type: 'range', label: 'Requests per day', min: 1000, max: 100000, step: 1000, value: 10000 }],
      view: s => { const h = s.v.h / 100, none = (s.v.pre + 300) * 3 * s.v.req / 1e6, cached = (s.v.pre * (h * 0.3 + (1 - h) * 3) + 300 * 3) * s.v.req / 1e6, k = 240 / none;
        return { nodes: { a: G1_bar(250, none * k, 'No cache', '$' + none.toFixed(2), { y: 290, w: 110, kind: 'e' }), b: G1_bar(520, cached * k, 'Cached', '$' + cached.toFixed(2), { y: 290, w: 110, kind: 'c', state: 'ok' }) },
          vars: { 'saved per day': '$' + (none - cached).toFixed(2), 'saved %': Math.round((1 - cached / none) * 100) + '%' } }; },
      readout: s => [['Prefix price per 1M', '$' + ((s.v.h / 100) * 0.3 + (1 - s.v.h / 100) * 3).toFixed(3)]] },
    pitfalls: ['The prefix must match exactly, byte for byte. A timestamp or user name at the top of the system prompt makes every request a miss. Put static content first, dynamic content last.', 'Some providers charge extra (about 1.25×) to **write** the cache on a miss, and the cache expires after a few minutes without use. Low traffic means low hit rates.', 'Small prompts may not qualify: providers have a minimum prefix size, often around 1,024 tokens.'],
    code: 'def daily_input_cost(req, prefix, new, hit, price=3.0, cached=0.30):\n    avg = hit * cached + (1 - hit) * price      # $ per 1M prefix tokens\n    per_req = (prefix * avg + new * price) / 1e6\n    return per_req * req\n\nprint(daily_input_cost(10_000, 8_000, 300, 0.9))   # 54.6',
    lang: 'Python'
  },

  'quantization': {
    intuition: 'A model is mostly a huge list of numbers: its weights. A 7B model has 7 billion of them. Memory is just **how many numbers × how many bytes each**.\n\nIn fp16, each weight takes 16 bits (2 bytes). [[quantization|Quantization]] stores each weight with fewer bits, like 8 or 4. Fewer bits means fewer possible values, so each weight is rounded to the nearest allowed level. The model gets smaller and faster, and a little less precise.\n\nThink of a photo saved as a smaller JPEG. Most of the picture survives; fine detail gets a bit blurry.',
    formula: ['\\text{memory (bytes)} \\approx N \\times \\frac{b}{8}', 's = \\frac{\\max |w|}{2^{b−1} − 1}', '\\hat{w} = s \\cdot \\mathrm{round}(w / s), \\quad |w − \\hat{w}| \\le \\frac{s}{2}'],
    symbols: [['N', 'number of weights (parameters), for example \\(7 \\times 10^9\\)'], ['b', 'bits per weight: 32, 16, 8 or 4'], ['s', 'the scale: the gap between two allowed levels'], ['w', 'the original weight'], ['\\hat{w}', 'the weight after rounding to the nearest level'], ['|w − \\hat{w}|', 'the rounding error. It is never more than half a step']],
    figure: { h: 'A 7B model at four precisions', size: [800, 330], nodes: {}, vars: { params: '7 billion' },
      steps: [
        { cap: 'fp32: 32 bits = 4 bytes per weight. \\(7 \\times 10^9 \\times 4\\) bytes = 28 GB.', do: [['add', 'f32', G1_bar(120, 224, 'fp32', '28 GB', { y: 290, kind: 'e' })]] },
        { cap: 'fp16: 2 bytes per weight, so 14 GB. Most open models ship like this.', do: [['add', 'f16', G1_bar(250, 112, 'fp16', '14 GB', { y: 290, kind: 'd' })]] },
        { cap: 'int8: 1 byte per weight, so 7 GB.', do: [['add', 'i8', G1_bar(380, 56, 'int8', '7 GB', { y: 290, kind: 'c' })]] },
        { cap: '4-bit: half a byte per weight, so 3.5 GB. Now it fits on an 8 GB laptop GPU, with room to spare.', do: [['add', 'i4', G1_bar(510, 28, '4-bit', '3.5 GB', { y: 290, kind: 'c', state: 'ok' })], ['add', 'gpu', G1_bar(680, 64, 'GPU', '8 GB', { y: 290, kind: 'n' })]] },
        { cap: 'The cost: 4 bits allow only 16 levels, so each weight is rounded a little. Quality usually drops slightly.', do: [['focus', 'i4', 'gpu'], ['note', 'i4', '16 levels only']] }
      ] },
    example: { given: 'A 7B model. Then four weights \\(0.12, {−0.50}, 0.31, 0.05\\), quantized to signed 4-bit (levels −7 to 7).',
      steps: ['Memory: \\(7 \\times 10^9 \\times 16 / 8 = 14 \\times 10^9\\) bytes = 14 GB in fp16. In 4-bit: \\(7 \\times 10^9 \\times 4 / 8 = 3.5\\) GB.', 'Scale: the biggest weight is 0.50, so \\(s = 0.50 / 7 \\approx 0.0714\\).', 'Divide and round: \\(0.12 / 0.0714 \\approx 1.68 \\to 2\\); \\({−0.50} \\to {−7}\\); \\(0.31 / 0.0714 \\approx 4.34 \\to 4\\); \\(0.05 / 0.0714 = 0.70 \\to 1\\).', 'Back to numbers: \\(2s \\approx 0.143\\), \\({−7s} = {−0.500}\\), \\(4s \\approx 0.286\\), \\(1s \\approx 0.071\\).', 'Errors: 0.023, 0, 0.024, 0.021. All are below \\(s / 2 \\approx 0.036\\).'],
      result: '4× less memory than fp16, and every weight moved by less than 0.036.' },
    lab: { h: 'Will it fit on your GPU?', body: 'Pick a model size and a GPU. Green means the weights use at most 80% of GPU memory (a rough rule; the rest is for the KV cache).', size: [800, 320],
      controls: [{ id: 'p', type: 'range', label: 'Parameters (billions)', min: 1, max: 70, step: 1, value: 7 }, { id: 'gpu', type: 'select', label: 'GPU memory', options: ['8 GB', '16 GB', '24 GB', '80 GB'], value: '8 GB' }],
      view: s => { const G = parseInt(s.v.gpu, 10), nodes = {}, k = 240 / Math.max(s.v.p * 4, G);
        [32, 16, 8, 4].forEach((b, i) => { const gb = s.v.p * b / 8; nodes['q' + b] = G1_bar(110 + i * 140, gb * k, b === 4 ? '4-bit' : (b === 8 ? 'int8' : 'fp' + b), +gb.toFixed(1) + ' GB', { y: 290, w: 80, kind: 'c', state: gb <= 0.8 * G ? 'ok' : 'bad' }); });
        nodes.gpu = G1_bar(690, G * k, 'GPU', G + ' GB', { y: 290, w: 80, kind: 'n' });
        return { nodes, vars: { 'bytes per weight': '4 / 2 / 1 / 0.5' } }; },
      readout: s => [['fp16 size', s.v.p * 2 + ' GB']] },
    pitfalls: ['Weights are not the whole bill. The KV cache for long contexts and the runtime also need memory, so leave about 20% headroom.', 'Small models and math or code tasks lose more quality at 4-bit. Run your evals on the quantized model, not the original.', '1 GB here means \\(10^9\\) bytes. Tools that report GiB (\\(2^{30}\\)) show about 7% less: 14 GB ≈ 13.0 GiB.'],
    code: 'def weights_gb(params_billion: float, bits: int) -> float:\n    return params_billion * bits / 8      # 1e9 params * bits/8 bytes = GB\n\nfor bits in (32, 16, 8, 4):\n    print(bits, weights_gb(7, bits))       # 28.0, 14.0, 7.0, 3.5',
    lang: 'Python'
  },

  'LoRA': {
    intuition: 'Fine-tuning normally changes every weight in the model. A single 4096 × 4096 weight matrix has 16.8 million numbers, and a model has hundreds of them.\n\n[[LoRA]] freezes the original matrix \\(W\\). Instead, it learns a small **update** built from two thin matrices, \\(B\\) and \\(A\\). Their product \\(BA\\) has the same shape as \\(W\\), but it is made from far fewer numbers. The rank \\(r\\) (often 8 or 16) sets how thin they are.\n\nThe bet: the change you need for one task (a format, a tone) is simple, so a low-rank update is enough.',
    formula: ['W\' = W + BA', 'B \\in ℝ^{d \\times r}, \\quad A \\in ℝ^{r \\times k}', '\\text{trainable} = d \\cdot r + r \\cdot k \\quad \\text{instead of} \\quad d \\cdot k'],
    symbols: [['W', 'the original weight matrix, d rows by k columns. Frozen: it never changes'], ['B, \\, A', 'the two small matrices LoRA trains. B starts at all zeros, so at first \\(W\' = W\\)'], ['r', 'the rank: the inner size of B and A. Much smaller than d and k'], ['d, \\, k', 'the matrix size, for example 4096 × 4096'], ['W\'', 'the weights used after fine-tuning'], ['ℝ^{d \\times r}', '"a grid of real numbers with d rows and r columns"']],
    figure: { h: 'Swap 16.8M trainable numbers for 65K', size: [800, 330],
      nodes: { W: { x: 120, y: 165, label: 'W', sub: '4096 × 4096', w: 160, h: 160, kind: 'a' } },
      vars: { trainable: '16,777,216' },
      steps: [
        { cap: 'Full fine-tuning trains every number in W: \\(4096 \\times 4096 = 16\\,777\\,216\\).', do: [['set', 'W', { state: 'active' }]] },
        { cap: 'LoRA freezes W. It does not change during training.', do: [['set', 'W', { state: 'off', sub: 'frozen' }], ['var', 'trainable', '0 so far']] },
        { cap: 'It trains two thin matrices instead: B is 4096 × 8, A is 8 × 4096.', do: [['add', 'B', { x: 290, y: 165, label: 'B', w: 36, h: 160, kind: 'b' }], ['add', 'A', { x: 440, y: 165, label: 'A', w: 160, h: 36, kind: 'b' }], ['add', 'tB', { x: 290, y: 290, label: '4096 × 8', shape: 'text', w: 100 }], ['add', 'tA', { x: 440, y: 290, label: '8 × 4096', shape: 'text', w: 100 }], ['var', 'trainable', '65,536']] },
        { cap: 'Their product BA is 4096 × 4096, the same shape as W, but built from only 65,536 numbers.', do: [['add', 'BA', { x: 660, y: 165, label: 'BA', sub: '4096 × 4096', w: 160, h: 160, kind: 'b' }], ['link', 'A', 'BA', 'B × A']] },
        { cap: 'At the end, add the update: \\(W\' = W + BA\\). LoRA trained \\(65\\,536 / 16\\,777\\,216 = 1/256\\) of the numbers.', do: [['set', 'BA', { state: 'ok' }], ['var', 'share', '0.39%']] }
      ] },
    example: { given: 'One weight matrix with \\(d = k = 4096\\). LoRA rank \\(r = 8\\).',
      steps: ['Full matrix: \\(d \\cdot k = 4096 \\times 4096 = 16\\,777\\,216\\) numbers.', 'B: \\(d \\cdot r = 4096 \\times 8 = 32\\,768\\). A: \\(r \\cdot k = 8 \\times 4096 = 32\\,768\\).', 'LoRA total: \\(32\\,768 + 32\\,768 = 65\\,536\\).', 'Share: \\(65\\,536 / 16\\,777\\,216 = 1/256 \\approx 0.39\\) percent.', 'A model with 32 layers and 4 such matrices per layer: \\(128 \\times 65\\,536 = 8\\,388\\,608\\) trainable numbers, about 8.4M instead of 2.1 billion.'],
      result: '256× fewer trainable numbers per matrix. The adapter file is megabytes, not gigabytes.' },
    lab: { h: 'Pick a rank', body: 'Square matrix (d = k). The bar for LoRA is drawn to the same scale as the full matrix.', size: [800, 320],
      controls: [{ id: 'd', type: 'range', label: 'Matrix size d = k', min: 512, max: 8192, step: 512, value: 4096 }, { id: 'r', type: 'range', label: 'Rank r', min: 1, max: 64, step: 1, value: 8 }],
      view: s => { const full = s.v.d * s.v.d, lora = 2 * s.v.d * s.v.r;
        return { nodes: { f: G1_bar(250, 240, 'Full', G1_n(full), { y: 290, w: 120, kind: 'a' }), l: G1_bar(520, 240 * lora / full, 'LoRA', G1_n(lora), { y: 290, w: 120, kind: 'b', state: 'ok' }) },
          vars: { 'd · r + r · k': G1_n(s.v.d) + ' × ' + s.v.r + ' × 2', share: (100 * lora / full).toFixed(2) + '%' } }; },
      readout: s => [['Fewer by', (s.v.d / (2 * s.v.r)).toFixed(1) + '×']] },
    pitfalls: ['LoRA still loads the full model for training and use. It cuts trainable numbers and optimizer memory, not the size of W. QLoRA adds 4-bit quantization of W for that.', 'Real LoRA scales the update by \\(\\alpha / r\\): \\(W\' = W + \\frac{\\alpha}{r} BA\\). If you change r, revisit α.', 'Too small an r can underfit a hard task; too big wastes memory. 8 to 16 is a common start.'],
    code: 'def lora_params(d: int, k: int, r: int) -> tuple[int, int]:\n    return d * r + r * k, d * k        # (LoRA, full)\n\nlora, full = lora_params(4096, 4096, 8)\nprint(lora, full, full // lora)       # 65536 16777216 256',
    lang: 'Python'
  }
};
