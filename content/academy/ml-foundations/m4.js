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
