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
