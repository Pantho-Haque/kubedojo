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
