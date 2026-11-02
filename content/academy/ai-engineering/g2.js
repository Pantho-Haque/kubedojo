// Glossary deep dives, part 2: retrieval math (embeddings, similarity, vector indexes, ranking, RAG evals).
// Every number in the examples and labs was checked by hand and by script.
const G2_fmt = n => n >= 1e9 ? +(n / 1e9).toFixed(1) + 'B' : n >= 1e6 ? +(n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? +(n / 1e3).toFixed(1) + 'k' : String(Math.round(n));
const G2_num = n => Math.round(n).toLocaleString('en-US');

const DEEP_2 = {
  'embedding': {
    intuition: 'An embedding model reads a text and returns a list of numbers. Treat that list as **coordinates**: the text becomes a point on a map of meaning. Texts that mean similar things land close together, even when they share no words ("puppy" lands near "dog").\n\nA toy model could use 2 numbers: "how much is this about animals?" and "how much is it about money?". Real models use hundreds or thousands of numbers (for example 1,536), and no single number has a human name. The idea stays the same: **close points = close meaning**.\n\nEach model draws its own map. A vector from model A and a vector from model B are coordinates on two different maps, so comparing them is meaningless.',
    formula: ['\\vec{v} = \\text{embed}(\\text{text}) = (v_1, v_2, \\ldots, v_d)', '\\text{similar meaning} \\Rightarrow \\text{small distance between } \\vec{v} \\text{ and } \\vec{w}'],
    symbols: [['\\vec{v}', 'the embedding: one point (vector) for one text'], ['v_i', 'the i-th number (coordinate) in the list'], ['d', 'the number of dimensions, fixed by the model (e.g. 1,536)'], ['\\text{embed}', 'the embedding model, called through an API']],
    figure: { h: 'A toy 2-D meaning map', size: [800, 380],
      nodes: {
        xa: { x: 390, y: 365, label: 'x → more about animals', shape: 'text', w: 200 },
        ya: { x: 420, y: 30, label: 'y ↑ more about money', shape: 'text', w: 200 }
      },
      steps: [
        { cap: 'Each text becomes a point. Here x = "about animals", y = "about money". cat = (9, 1), dog = (7, 2).', do: [['add', 'cat', { x: 630, y: 315, label: 'cat', sub: '(9, 1)', shape: 'pill', w: 90, kind: 'c' }], ['add', 'dog', { x: 510, y: 285, label: 'dog', sub: '(7, 2)', shape: 'pill', w: 90, kind: 'c' }]] },
        { cap: 'Money words land top-left: invoice = (1, 9), refund = (3, 7). Far from the animals.', do: [['add', 'inv', { x: 150, y: 75, label: 'invoice', sub: '(1, 9)', shape: 'pill', w: 90, kind: 'd' }], ['add', 'ref', { x: 270, y: 135, label: 'refund', sub: '(3, 7)', shape: 'pill', w: 90, kind: 'd' }]] },
        { cap: 'A query is embedded by the same model: "my puppy is sick" = (8, 5).', do: [['add', 'q', { x: 570, y: 195, label: 'puppy is sick', sub: 'query (8, 5)', shape: 'pill', w: 120, kind: 'a', state: 'active' }]] },
        { cap: 'Search = find the closest points. dog is 3.16 away, cat 4.12. invoice is 8.06 away.', do: [['link', 'q', 'dog', { label: '3.16', tone: 'ok' }], ['link', 'q', 'cat', { label: '4.12', dash: true }], ['set', 'dog', { state: 'ok' }], ['focus', 'q', 'dog', 'cat']] },
        { cap: 'Real models use about 1,536 numbers, not 2. You cannot draw it, but "close = similar" still holds.', do: [['var', 'dimensions', '2 here, 1,536 in real models']] },
        { cap: 'Embed the query with a different model and its numbers mean something else. On this map it lands near refund: nonsense.', do: [['unlink', 'q', 'dog'], ['unlink', 'q', 'cat'], ['move', 'q', 270, 225], ['set', 'q', { state: 'bad', sub: 'model B (3, 4)' }], ['link', 'q', 'ref', { label: '3.00', tone: 'bad' }]] }
      ] },
    example: { given: 'Toy 2-D vectors: query \\(q = (8, 5)\\), dog \\(= (7, 2)\\), cat \\(= (9, 1)\\), refund \\(= (3, 7)\\), invoice \\(= (1, 9)\\). Distance is \\(\\sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}\\).',
      steps: [
        'dog: \\(\\sqrt{(8 - 7)^2 + (5 - 2)^2}\\) \\(= \\sqrt{1 + 9}\\) \\(= \\sqrt{10}\\) \\(\\approx 3.16\\)',
        'cat: \\(\\sqrt{(8 - 9)^2 + (5 - 1)^2}\\) \\(= \\sqrt{1 + 16}\\) \\(= \\sqrt{17}\\) \\(\\approx 4.12\\)',
        'refund: \\(\\sqrt{(8 - 3)^2 + (5 - 7)^2}\\) \\(= \\sqrt{25 + 4}\\) \\(= \\sqrt{29}\\) \\(\\approx 5.39\\)',
        'invoice: \\(\\sqrt{(8 - 1)^2 + (5 - 9)^2}\\) \\(= \\sqrt{49 + 16}\\) \\(= \\sqrt{65}\\) \\(\\approx 8.06\\)'],
      result: 'Ranked by distance: dog, cat, refund, invoice. The two animal texts come first, which is what "search by meaning" means. A real 1,536-D vector works the same way, just with 1,536 terms under the square root.' },
    pitfalls: [
      'Never mix models. Store the model name next to each vector, and re-embed everything when you change models.',
      'The dimension is fixed by the model. A `vector(1536)` column rejects a 3,072-number vector with an error.',
      'Embed the query with the same model (and the same settings, such as a query/document input type) as the stored chunks.',
      'Close in meaning is not the same as true or relevant. "Refunds are allowed" and "Refunds are not allowed" land very close together.'],
    code: 'from openai import OpenAI\nclient = OpenAI()\nr = client.embeddings.create(model="text-embedding-3-small", input=["my puppy is sick"])\nvec = r.data[0].embedding\nprint(len(vec))   # 1536 numbers = one point in 1,536-D space', lang: 'Python'
  },

  'cosine similarity': {
    intuition: 'Draw two [[embedding|embeddings]] as arrows from the same starting point. Cosine similarity only asks: **do they point the same way?** It ignores how long the arrows are.\n\nSame direction gives 1. At right angles (nothing in common) gives 0. Opposite directions give −1. Text embeddings mostly land between about 0 and 1.\n\nWhy ignore length? Length often tracks things like text length, not meaning. Direction is the meaning. Many embedding APIs return vectors already scaled to length 1. Then cosine similarity is just the dot product, the cheapest possible calculation.',
    formula: ['\\cos\\theta = \\frac{\\vec{u} \\cdot \\vec{v}}{\\lVert \\vec{u} \\rVert \\, \\lVert \\vec{v} \\rVert}', '\\vec{u} \\cdot \\vec{v} = \\sum_{i=1}^{d} u_i v_i', '\\lVert \\vec{u} \\rVert = \\sqrt{\\sum_{i=1}^{d} u_i^2}', '\\text{cosine distance} = 1 - \\cos\\theta'],
    symbols: [['\\vec{u}, \\vec{v}', 'the two vectors (e.g. a query and a chunk)'], ['\\theta', 'the angle between the two arrows'], ['\\vec{u} \\cdot \\vec{v}', 'the dot product: multiply matching numbers, then add them all up'], ['\\lVert \\vec{u} \\rVert', 'the length of u: square every number, add, take the square root'], ['d', 'the number of dimensions'], ['1 - \\cos\\theta', 'cosine distance; this is what pgvector\'s `<=>` returns (0 = same direction)']],
    figure: { h: 'Angle, not length', size: [800, 380],
      nodes: { o: { x: 360, y: 260, label: '0', shape: 'circle', w: 30, kind: 'n' } },
      steps: [
        { cap: 'Vector u = (4, 3). Its length is \\(\\sqrt{4^2 + 3^2} = \\sqrt{25} = 5\\).', do: [['add', 'u', { x: 540, y: 125, label: 'u = (4, 3)', shape: 'pill', w: 100, kind: 'a' }], ['link', 'o', 'u', { label: 'length 5' }]] },
        { cap: 'Vector v = (0, 4). Its length is 4.', do: [['add', 'v', { x: 360, y: 80, label: 'v = (0, 4)', shape: 'pill', w: 100, kind: 'b' }], ['link', 'o', 'v', { label: 'length 4' }]] },
        { cap: 'Dot product: multiply matching numbers and add. \\(4 \\cdot 0 + 3 \\cdot 4 = 12\\).', do: [['var', 'u·v', '12'], ['focus', 'o', 'u', 'v']] },
        { cap: 'Divide by both lengths: \\(\\cos\\theta = \\frac{12}{5 \\cdot 4} = 0.6\\). The angle is about 53°.', do: [['var', 'cos(u, v)', '0.6'], ['set', 'v', { state: 'ok' }]] },
        { cap: 'p = (−3, 4) is at a right angle to u: \\(4 \\cdot (-3) + 3 \\cdot 4 = 0\\), so cos = 0. Nothing in common.', do: [['add', 'p', { x: 225, y: 80, label: 'p = (−3, 4)', shape: 'pill', w: 100, kind: 'n' }], ['link', 'o', 'p', { dash: true }], ['var', 'cos(u, p)', '0'], ['focus', 'o', 'u', 'p']] },
        { cap: 'z = (−2, −1.5) points exactly backwards: \\(\\frac{-8 - 4.5}{5 \\cdot 2.5} = -1\\). Half as long, still exactly −1.', do: [['add', 'z', { x: 270, y: 328, label: 'z = (−2, −1.5)', shape: 'pill', w: 125, kind: 'e' }], ['link', 'o', 'z', { tone: 'bad' }], ['var', 'cos(u, z)', '−1'], ['focus', 'o', 'u', 'z']] }
      ] },
    example: { given: 'Three 3-D vectors: \\(u = (1, 2, 2)\\), \\(v = (2, 1, 2)\\) and \\(w = (2, 4, 4)\\). Note that w is just u doubled.',
      steps: [
        'Dot product: \\(u \\cdot v\\) \\(= 1 \\cdot 2 + 2 \\cdot 1 + 2 \\cdot 2\\) \\(= 2 + 2 + 4\\) \\(= 8\\).',
        'Lengths: \\(\\lVert u \\rVert = \\sqrt{1 + 4 + 4} = \\sqrt{9} = 3\\) and \\(\\lVert v \\rVert = \\sqrt{4 + 1 + 4} = 3\\).',
        'Cosine: \\(\\cos\\theta = \\frac{8}{3 \\cdot 3} = \\frac{8}{9} \\approx 0.889\\). Very similar (about 27°).',
        'u and w: \\(u \\cdot w = 2 + 8 + 8 = 18\\), \\(\\lVert w \\rVert = 6\\), so \\(\\cos = \\frac{18}{3 \\cdot 6} = 1\\). Same direction.',
        'Plain dot product would say w (18) beats v (8) only because w is longer. Euclidean distance says the opposite: \\(u\\) to \\(v\\) is \\(\\sqrt{1 + 1 + 0} \\approx 1.41\\), but \\(u\\) to \\(w\\) is \\(\\sqrt{1 + 4 + 4} = 3\\).',
        'Normalise first (divide each vector by its length): \\(\\hat{u} = (\\frac{1}{3}, \\frac{2}{3}, \\frac{2}{3})\\), \\(\\hat{v} = (\\frac{2}{3}, \\frac{1}{3}, \\frac{2}{3})\\). Their dot product is \\(\\frac{2 + 2 + 4}{9} = \\frac{8}{9}\\): the same cosine.'],
      result: 'cos(u, v) ≈ 0.889 and cos(u, w) = 1. Cosine ignores length; dot product and Euclidean distance do not. For vectors of length 1, all three give the same ranking.' },
    lab: { h: 'Turn the arrows', body: 'u has length 3 and v has length 2. Turn them and watch the cosine. The dot product is always \\(6 \\cos\\theta\\) here, because \\(3 \\times 2 = 6\\).', size: [800, 380],
      controls: [{ id: 'a', type: 'range', label: 'Angle of u', min: 0, max: 345, step: 15, value: 30, unit: '°' }, { id: 'b', type: 'range', label: 'Angle of v', min: 0, max: 345, step: 15, value: 75, unit: '°' }],
      view: s => {
        const r = Math.PI / 180, a = s.v.a * r, b = s.v.b * r;
        let th = Math.abs(s.v.a - s.v.b) % 360; if (th > 180) th = 360 - th;
        const c = Math.cos(th * r), ok = c > 0.7 ? 'ok' : c < 0 ? 'bad' : undefined;
        return { nodes: {
            o: { x: 400, y: 190, label: '0', shape: 'circle', w: 28, kind: 'n' },
            u: { x: 400 + 150 * Math.cos(a), y: 190 - 150 * Math.sin(a), label: 'u', shape: 'circle', w: 30, kind: 'a' },
            v: { x: 400 + 90 * Math.cos(b), y: 190 - 90 * Math.sin(b), label: 'v', shape: 'circle', w: 30, kind: 'b', state: ok } },
          edges: [['o', 'u'], ['o', 'v']],
          vars: { 'angle θ': th + '°', 'cos θ': c.toFixed(3), 'u · v': (6 * c).toFixed(2) } };
      },
      readout: s => { const r = Math.PI / 180, a = s.v.a * r, b = s.v.b * r, c = Math.cos(a - b);
        return [['u', '(' + (3 * Math.cos(a)).toFixed(2) + ', ' + (3 * Math.sin(a)).toFixed(2) + ')'], ['v', '(' + (2 * Math.cos(b)).toFixed(2) + ', ' + (2 * Math.sin(b)).toFixed(2) + ')'], ['cosine similarity', c.toFixed(3)], ['cosine distance (<=>)', (1 - c).toFixed(3)], ['Euclidean distance', Math.sqrt(Math.max(0, 13 - 12 * c)).toFixed(2)]]; } },
    pitfalls: [
      'pgvector\'s `<=>` returns cosine **distance** (1 − similarity). Sort ascending for "most similar first".',
      'A score of 0.8 is not "80% relevant". Each model has its own typical range, so set thresholds by testing on your own data.',
      'If your vectors are already length 1, use the dot product (`<#>` in pgvector, which returns the negative dot product). It gives the same order and is cheaper.',
      'A zero vector has length 0, and dividing by 0 gives nonsense. Filter out empty texts before embedding.'],
    code: 'import numpy as np\n\ndef cosine(u, v):\n    return np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))\n\ncosine([1, 2, 2], [2, 1, 2])   # 0.888...\ncosine([1, 2, 2], [2, 4, 4])   # 1.0  (same direction, twice as long)', lang: 'Python'
  },

  'nearest neighbour': {
    intuition: 'The simplest vector search is exact: measure the distance from the query to **every** stored vector, sort, and keep the k smallest. This is called exact k-nearest-neighbour (kNN) search. It never misses, so its [[recall]] is 100%.\n\nThe catch is the cost. Each distance on a d-dimensional vector needs d multiply-and-add steps. With N vectors, one query costs N × d of them, plus reading every vector from memory. That grows in a straight line with your data.\n\nThis is why vector indexes such as [[HNSW]] and [[IVFFlat]] exist. They check only a small part of the data and accept a small chance of missing the true nearest one.',
    formula: ['\\text{nearest} = \\argmin_{i} \\, \\text{dist}(\\vec{q}, \\vec{x}_i)', '\\text{work per query} = N \\times d \\text{ multiply-adds}', '\\text{memory read} = N \\times d \\times 4 \\text{ bytes}'],
    symbols: [['\\vec{q}', 'the query vector'], ['\\vec{x}_i', 'stored vector number i'], ['\\argmin_{i}', '"the i that gives the smallest value"'], ['N', 'how many vectors are stored'], ['d', 'dimensions per vector (e.g. 1,536)'], ['4', 'bytes per number (a 32-bit float)']],
    figure: { h: 'Exact search checks everything', size: [800, 380],
      nodes: {
        q: { x: 400, y: 190, label: 'q', shape: 'circle', w: 44, kind: 'a', state: 'active' },
        A: { x: 480, y: 30, label: 'A', shape: 'circle', w: 44, kind: 'n' }, B: { x: 640, y: 110, label: 'B', shape: 'circle', w: 44, kind: 'n' },
        C: { x: 320, y: 110, label: 'C', shape: 'circle', w: 44, kind: 'n' }, D: { x: 160, y: 350, label: 'D', shape: 'circle', w: 44, kind: 'n' },
        E: { x: 560, y: 350, label: 'E', shape: 'circle', w: 44, kind: 'n' }, F: { x: 240, y: 190, label: 'F', shape: 'circle', w: 44, kind: 'n' }
      },
      steps: [
        { cap: 'A query q arrives. Exact search has no shortcut: it must measure the distance to every stored vector.', do: [['focus', 'q'], ['var', 'distances computed', 0]] },
        { cap: 'Measure A, B and C. Each number is a real distance on this grid, e.g. C: \\(\\sqrt{1 + 1} \\approx 1.41\\).', do: [['send', 'q', 'A'], ['send', 'q', 'B'], ['send', 'q', 'C'], ['set', 'A', { sub: '2.24' }], ['set', 'B', { sub: '3.16' }], ['set', 'C', { sub: '1.41' }], ['var', 'distances computed', 3]] },
        { cap: 'Then D, E and F. That is N = 6 distances for one query.', do: [['send', 'q', 'D'], ['send', 'q', 'E'], ['send', 'q', 'F'], ['set', 'D', { sub: '3.61' }], ['set', 'E', { sub: '2.83' }], ['set', 'F', { sub: '2.00' }], ['var', 'distances computed', 6]] },
        { cap: 'Sort and keep the k = 2 smallest: C (1.41) and F (2.00). Guaranteed correct.', do: [['set', 'C', { state: 'ok' }], ['set', 'F', { state: 'ok' }], ['link', 'q', 'C', { tone: 'ok' }], ['link', 'q', 'F', { tone: 'ok' }], ['focus', 'q', 'C', 'F']] },
        { cap: 'Each real distance costs d = 1,536 multiply-adds. Work per query = N × d, and it grows with every row you add.', do: [['var', 'work', '6 × 1,536 = 9,216']] }
      ] },
    example: { given: 'A knowledge base with \\(N = \\text{1,000,000}\\) chunks, each a \\(d = 1536\\) vector of 4-byte floats.',
      steps: [
        'Work per query: \\(N \\times d\\) \\(= \\text{1,000,000} \\times 1536\\) \\(= \\text{1,536,000,000}\\) multiply-adds (about 1.5 billion).',
        'Memory to read: \\(\\text{1,000,000} \\times 1536 \\times 4\\) \\(= \\text{6,144,000,000}\\) bytes, about 6.1 GB, for every single query.',
        'If memory streams at about 20 GB per second, just reading the data takes \\(6.1 / 20 \\approx 0.3\\) seconds per query, on a machine doing nothing else.',
        'An HNSW index might compute only about 2,000 distances: \\(\\text{2,000} \\times 1536\\) \\(= \\text{3,072,000}\\) multiply-adds.',
        'Ratio: \\(\\text{1,536,000,000} / \\text{3,072,000}\\) \\(= 500\\). The index does about 500 times less work.'],
      result: 'Exact kNN is perfect but costs N × d per query. At 1 million chunks that is 1.5 billion multiply-adds and 6.1 GB read per query, so an approximate index is the practical choice.' },
    pitfalls: [
      'Exact search is fine for small data. Under roughly 10,000–100,000 vectors, a plain scan is often fast enough and has perfect recall.',
      'In pgvector, a query with no usable vector index silently becomes an exact scan. Check with `EXPLAIN` that the index is used.',
      'A `WHERE` filter plus an approximate index can return fewer than k rows, because the index finds neighbours first and the filter removes some.',
      '"Nearest" depends on the distance you pick (cosine, dot product, Euclidean). Use the one your embedding model recommends.'],
    code: 'import numpy as np\n\ndef knn(X, q, k=5):\n    d = np.linalg.norm(X - q, axis=1)   # N distances, each costs d multiply-adds\n    return np.argsort(d)[:k]            # indexes of the k closest rows\n\n# SQL with no vector index = the same exact scan:\n# SELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 5;', lang: 'Python'
  },

  'HNSW': {
    intuition: 'Think of travelling to a street address. You take a motorway to the right city, then main roads to the right area, then side streets to the house. You never look at every street in the country.\n\nHNSW builds the same idea from your vectors. **Layer 0** holds every vector, each linked to its closest neighbours. Each layer above holds only about 1 in M of the vectors below it, with longer links. A search starts at a fixed **entry point** on the top layer and hops **greedily**: move to whichever neighbour is closer to the query, and stop when none is. Then it drops one layer and repeats.\n\nEach layer is about M times smaller, so there are only about \\(\\log_M N\\) layers, with a few hops on each. That is why search cost grows like \\(\\log N\\), not N. On layer 0 the search keeps a list of the best `ef_search` candidates (pgvector default: 40) instead of just one, which raises [[recall]].',
    formula: ['P(\\text{a vector reaches layer } \\ge L) = M^{-L}', '\\text{vectors on layer } L \\approx \\frac{N}{M^{L}}', '\\text{number of layers} \\approx \\log_M N', '\\text{search cost} \\approx O(\\log N) \\text{ distance checks}'],
    symbols: [['N', 'how many vectors are stored'], ['M', 'max links per vector per layer (pgvector `m`, default 16; layer 0 allows 2M)'], ['L', 'a layer number; 0 is the bottom layer, which holds everything'], ['\\text{ef}_{\\text{search}}', 'how many candidates layer 0 keeps while searching (pgvector `hnsw.ef_search`, default 40)'], ['\\text{ef}_{\\text{construction}}', 'the same idea while building the graph (default 64); higher = better graph, slower build']],
    figure: { h: 'One search, top layer to bottom', size: [800, 380],
      nodes: {
        g2: { x: 335, y: 70, label: 'Layer 2', shape: 'group', w: 600, h: 100 }, g1: { x: 335, y: 190, label: 'Layer 1', shape: 'group', w: 600, h: 100 }, g0: { x: 335, y: 310, label: 'Layer 0 (all)', shape: 'group', w: 600, h: 100 },
        a2: { x: 70, y: 80, label: 'A', shape: 'circle', w: 44, kind: 'b' }, e2: { x: 370, y: 80, label: 'E', shape: 'circle', w: 44, kind: 'b' },
        a1: { x: 70, y: 200, label: 'A', shape: 'circle', w: 44, kind: 'b' }, c1: { x: 220, y: 200, label: 'C', shape: 'circle', w: 44, kind: 'b' }, e1: { x: 370, y: 200, label: 'E', shape: 'circle', w: 44, kind: 'b' }, h1: { x: 595, y: 200, label: 'H', shape: 'circle', w: 44, kind: 'b' },
        a0: { x: 70, y: 320, label: 'A', shape: 'circle', w: 44, kind: 'b' }, b0: { x: 145, y: 320, label: 'B', shape: 'circle', w: 44, kind: 'b' }, c0: { x: 220, y: 320, label: 'C', shape: 'circle', w: 44, kind: 'b' }, d0: { x: 295, y: 320, label: 'D', shape: 'circle', w: 44, kind: 'b' },
        e0: { x: 370, y: 320, label: 'E', shape: 'circle', w: 44, kind: 'b' }, f0: { x: 445, y: 320, label: 'F', shape: 'circle', w: 44, kind: 'b' }, g0n: { x: 520, y: 320, label: 'G', shape: 'circle', w: 44, kind: 'b' }, h0: { x: 595, y: 320, label: 'H', shape: 'circle', w: 44, kind: 'b' },
        q: { x: 720, y: 190, label: 'query', sub: 'at position 7.2', shape: 'pill', w: 120, kind: 'a', state: 'active' }
      },
      edges: [['a2', 'e2', { arrow: false }], ['a1', 'c1', { arrow: false }], ['c1', 'e1', { arrow: false }], ['e1', 'h1', { arrow: false }],
        ['a0', 'b0', { arrow: false }], ['b0', 'c0', { arrow: false }], ['c0', 'd0', { arrow: false }], ['d0', 'e0', { arrow: false }], ['e0', 'f0', { arrow: false }], ['f0', 'g0n', { arrow: false }], ['g0n', 'h0', { arrow: false }],
        ['e2', 'e1', { arrow: false, dash: true }], ['h1', 'h0', { arrow: false, dash: true }]],
      steps: [
        { cap: 'Vectors A–H sit at positions 1–8 on a line; the query is at 7.2. Start at the entry point A on the top layer: distance 6.2.', do: [['set', 'a2', { state: 'active', sub: '6.2' }], ['var', 'distances checked', 1]] },
        { cap: 'A\'s only neighbour up here is E, distance 2.2. Closer, so hop to E. One long link skipped B, C and D.', do: [['send', 'a2', 'e2'], ['set', 'a2', { state: 'off' }], ['set', 'e2', { state: 'active', sub: '2.2' }], ['var', 'distances checked', 2]] },
        { cap: 'E has no closer neighbour on layer 2. Drop down to E on layer 1 and keep going from there.', do: [['send', 'e2', 'e1'], ['set', 'e1', { state: 'active', sub: '2.2' }]] },
        { cap: 'On layer 1, E\'s neighbours are C (4.2) and H (0.8). H is closer: hop to H.', do: [['set', 'c1', { sub: '4.2' }], ['send', 'e1', 'h1'], ['set', 'h1', { state: 'active', sub: '0.8' }], ['var', 'distances checked', 4]] },
        { cap: 'Drop to layer 0 at H. Its neighbour G is only 0.2 away: hop to G.', do: [['send', 'h1', 'h0'], ['send', 'h0', 'g0n'], ['set', 'g0n', { state: 'active', sub: '0.2' }], ['var', 'distances checked', 5]] },
        { cap: 'G\'s other neighbour F is 1.2 away, farther. Stop: G is the nearest. 5 checks here; 1 million vectors need only a few thousand.', do: [['set', 'f0', { sub: '1.2' }], ['set', 'g0n', { state: 'ok' }], ['var', 'distances checked', 6], ['focus', 'g0n', 'q']] }
      ] },
    example: { given: '\\(N = \\text{1,000,000}\\) vectors and \\(M = 16\\). Each layer keeps about 1 in 16 of the vectors below it.',
      steps: [
        'Layer 0: all \\(\\text{1,000,000}\\) vectors.',
        'Layer 1: \\(\\text{1,000,000} / 16\\) \\(= \\text{62,500}\\). Layer 2: \\(\\text{62,500} / 16 \\approx \\text{3,906}\\).',
        'Layer 3: \\(\\text{3,906} / 16 \\approx 244\\). Layer 4: \\(244 / 16 \\approx 15\\). Layer 5: about 1, the entry point.',
        'Check with the formula: \\(\\log_{16} \\text{1,000,000}\\) \\(= \\frac{\\log \\, \\text{1,000,000}}{\\log \\, 16}\\) \\(= \\frac{6}{1.204}\\) \\(\\approx 4.98\\), so about 5 layers above layer 0.',
        'A search makes a few hops per layer, checking up to 16 neighbours per hop (32 on layer 0), with ef_search = 40 candidates at the bottom. That is roughly a few thousand distance checks, not 1,000,000.'],
      result: 'About 6 layers in total. A query touches a few thousand vectors instead of a million, which is why HNSW stays fast as data grows.' },
    lab: { h: 'How tall is the graph?', body: 'Each bar is one layer; its label is about how many vectors it holds, \\(N / M^{L}\\). Bar height uses a log scale. More data adds only a layer or so.', size: [800, 380],
      controls: [{ id: 'e', type: 'range', label: 'Vectors N = 10^', min: 3, max: 9, value: 6 }, { id: 'm', type: 'range', label: 'Links per vector M', min: 8, max: 48, step: 8, value: 16 }],
      view: s => { const N = Math.pow(10, s.v.e), M = s.v.m, nodes = {};
        for (let L = 0; N / Math.pow(M, L) >= 1; L++) { const c = N / Math.pow(M, L); nodes['l' + L] = { x: 75 + 70 * L, y: 340, label: G2_fmt(c), sub: 'L' + L, shape: 'bar', w: 60, h: 12 + 30 * Math.log10(c), kind: L ? 'b' : 'a' }; }
        return { nodes, vars: { layers: Object.keys(nodes).length, 'log_M N': (Math.log(N) / Math.log(M)).toFixed(1) } }; },
      readout: s => { const N = Math.pow(10, s.v.e), M = s.v.m; return [['N', G2_num(N)], ['layers above layer 0 ≈ log_M N', (Math.log(N) / Math.log(M)).toFixed(2)], ['index links (about N × 2M on layer 0)', G2_fmt(N * 2 * M)]]; } },
    pitfalls: [
      'HNSW is approximate. Raise `hnsw.ef_search` (e.g. 40 → 100) when recall is too low; queries get a little slower.',
      'The graph lives best in RAM. If the index does not fit in memory, search slows down sharply.',
      'Building is slow and memory-hungry for large tables. Raise `maintenance_work_mem` before `CREATE INDEX`.',
      'With a `WHERE` filter, the index may return fewer than k rows. Newer pgvector versions have iterative scans to help.'],
    code: '-- pgvector: build an HNSW index for cosine distance\nCREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops)\n  WITH (m = 16, ef_construction = 64);\n\nSET hnsw.ef_search = 100;   -- more candidates = higher recall, slower\nSELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 5;', lang: 'SQL'
  },

  'IVFFlat': {
    intuition: 'Picture a library that sorts its books into shelves by topic. To find a book, you first pick the shelf whose label best matches, then look at every book on that shelf only.\n\nIVFFlat does this with vectors. At build time it runs **k-means**: it finds `lists` centre points (centroids) and puts each vector in the list of its closest centroid. At query time it compares the query with every centroid, picks the `probes` closest lists, and scans those lists exactly ("flat").\n\nThe risk: the true nearest vector can sit just over the border, in a list you did not probe. More probes means higher [[recall]] but more work. The centroids are frozen at build time, so after many inserts the lists become lopsided and you should rebuild.',
    formula: ['\\text{rows per list} \\approx \\frac{N}{\\text{lists}}', '\\text{distances per query} \\approx \\text{lists} + \\text{probes} \\times \\frac{N}{\\text{lists}}', '\\text{lists} \\approx \\sqrt{N}, \\quad \\text{probes} \\approx \\sqrt{\\text{lists}} \\quad \\text{(starting points)}'],
    symbols: [['N', 'how many vectors are stored'], ['\\text{lists}', 'how many clusters k-means makes (set when you create the index)'], ['\\text{probes}', 'how many of the closest lists a query scans (pgvector `ivfflat.probes`, default 1)'], ['\\text{centroid}', 'the average point of one list; the query is compared with every centroid first']],
    figure: { h: 'Probe the closest list, or two', size: [800, 380],
      nodes: {
        L1: { x: 140, y: 225, label: 'List 1', shape: 'group', w: 220, h: 270 }, L2: { x: 400, y: 225, label: 'List 2', shape: 'group', w: 220, h: 270 }, L3: { x: 660, y: 225, label: 'List 3', shape: 'group', w: 220, h: 270 },
        c1: { x: 140, y: 150, label: 'c1', shape: 'circle', w: 44, kind: 'd' }, c2: { x: 400, y: 150, label: 'c2', shape: 'circle', w: 44, kind: 'd' }, c3: { x: 660, y: 150, label: 'c3', shape: 'circle', w: 44, kind: 'd' },
        A: { x: 90, y: 240, label: 'A', shape: 'circle', w: 40, kind: 'n' }, B: { x: 190, y: 310, label: 'B', shape: 'circle', w: 40, kind: 'n' },
        C: { x: 340, y: 250, label: 'C', shape: 'circle', w: 40, kind: 'n' }, D: { x: 450, y: 310, label: 'D', shape: 'circle', w: 40, kind: 'n' },
        E: { x: 590, y: 240, label: 'E', shape: 'circle', w: 40, kind: 'n' }, F: { x: 710, y: 310, label: 'F', shape: 'circle', w: 40, kind: 'n' },
        q: { x: 520, y: 40, label: 'query', shape: 'pill', w: 100, kind: 'a', state: 'active' }
      },
      steps: [
        { cap: 'Build time: k-means split the vectors into 3 lists. Each list has a centroid (c1, c2, c3): the average of its points.', do: [['focus', 'c1', 'c2', 'c3']] },
        { cap: 'A query arrives. First compare it with the centroids only: 3 distance checks.', do: [['send', 'q', 'c1'], ['send', 'q', 'c2'], ['send', 'q', 'c3'], ['set', 'c2', { state: 'active' }], ['var', 'distances', 3]] },
        { cap: 'c2 is the closest centroid. With probes = 1, scan only List 2: C and D. Best found: D.', do: [['send', 'q', 'C'], ['send', 'q', 'D'], ['set', 'D', { state: 'ok', sub: 'best' }], ['var', 'distances', 5], ['var', 'probes', 1]] },
        { cap: 'But the true nearest vector is E, just over the border in List 3. probes = 1 missed it.', do: [['set', 'E', { state: 'warn', sub: 'missed' }], ['note', 'E', 'true nearest']] },
        { cap: 'Set probes = 2: also scan List 3, the next-closest centroid. E is found. 2 more checks bought the right answer.', do: [['send', 'q', 'E'], ['send', 'q', 'F'], ['set', 'E', { state: 'ok', sub: 'best' }], ['set', 'D', { state: undefined, sub: '' }], ['var', 'distances', 7], ['var', 'probes', 2]] },
        { cap: 'probes = lists would scan everything: exact again, and slow. Pick probes by measuring recall on real queries.', do: [['focus', 'q', 'E', 'c2', 'c3']] }
      ] },
    example: { given: '\\(N = \\text{1,000,000}\\) vectors. Use \\(\\text{lists} \\approx \\sqrt{N}\\) and \\(\\text{probes} \\approx \\sqrt{\\text{lists}}\\).',
      steps: [
        'Lists: \\(\\sqrt{\\text{1,000,000}} = \\text{1,000}\\). (pgvector\'s rule of thumb, rows ÷ 1,000 for up to 1 million rows, gives the same 1,000.)',
        'Rows per list: \\(\\text{1,000,000} / \\text{1,000}\\) \\(= \\text{1,000}\\).',
        'Probes: \\(\\sqrt{\\text{1,000}} \\approx 31.6\\), so about 32.',
        'Distances per query: \\(\\text{1,000} + 32 \\times \\text{1,000}\\) \\(= \\text{33,000}\\).',
        'Share of the table touched: \\(\\text{33,000} / \\text{1,000,000}\\) \\(= 0.033\\), or 3.3%, about 30 times less work than exact search.',
        'Why \\(\\sqrt{N}\\)? With probes = 1 the cost is \\(\\text{lists} + \\frac{N}{\\text{lists}}\\). That sum is smallest when both parts are equal: \\(\\text{lists} = \\sqrt{N}\\), giving \\(\\text{1,000} + \\text{1,000} = \\text{2,000}\\).'],
      result: '1,000 lists and 32 probes scan about 33,000 vectors (3.3%) per query. Raise probes if recall is too low; lower it if queries are too slow.' },
    lab: { h: 'Lists vs probes', body: '1,000,000 vectors. Change lists and probes and see how many distances one query computes.', size: [800, 380],
      controls: [{ id: 'lists', type: 'range', label: 'lists', min: 100, max: 5000, step: 100, value: 1000 }, { id: 'probes', type: 'range', label: 'probes', min: 1, max: 100, value: 10 }],
      view: s => { const N = 1e6, L = s.v.lists, P = s.v.probes, scan = L + P * N / L, share = scan / N;
        return { nodes: {
            ex: { x: 200, y: 340, label: '1M', sub: 'exact', shape: 'bar', w: 80, h: 280, kind: 'n' },
            iv: { x: 360, y: 340, label: G2_fmt(scan), sub: 'IVFFlat', shape: 'bar', w: 80, h: Math.max(6, Math.min(290, 280 * share)), kind: 'a' },
            p1: { x: 620, y: 90, label: 'centroid checks: ' + G2_num(L), shape: 'pill', w: 240, kind: 'd' },
            p2: { x: 620, y: 190, label: 'rows scanned: ' + G2_num(P * N / L), shape: 'pill', w: 240, kind: 'b' },
            p3: { x: 620, y: 290, label: 'share of table: ' + (100 * share).toFixed(1) + '%', shape: 'pill', w: 240, kind: share > 0.2 ? 'e' : 'c' } },
          vars: { 'rows per list': G2_num(N / L), 'distances': G2_num(scan) } }; },
      readout: s => { const N = 1e6, L = s.v.lists, P = s.v.probes, scan = L + P * N / L; return [['distances per query', G2_num(scan)], ['vs exact', (N / scan).toFixed(1) + '× less work'], ['probes / lists', (100 * P / L).toFixed(1) + '% of lists scanned']]; } },
    pitfalls: [
      'Build the index **after** loading data. k-means on an empty or tiny table gives useless centroids.',
      'After big inserts or deletes, the old centroids no longer fit the data. Lists get uneven and recall drops. Run `REINDEX` after large changes.',
      'The default `ivfflat.probes` is 1, which often gives poor recall. Set it per session or query.',
      'Compared with HNSW, IVFFlat builds faster and uses less memory, but usually has lower recall at the same speed.'],
    code: '-- pgvector: build after the table is loaded\nCREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops)\n  WITH (lists = 1000);\n\nSET ivfflat.probes = 32;\nSELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 5;\n\nREINDEX INDEX chunks_embedding_idx;   -- after large inserts', lang: 'SQL'
  },

  'recall': {
    intuition: 'Recall answers: **of everything that should have been found, how much was found?** If 4 chunks in your knowledge base answer the question and your search returns 2 of them, recall is 2 out of 4 = 0.5.\n\nPrecision is its partner: **of what was returned, how much was useful?** The "@k" means you only look at the top k results, for example the 5 chunks you put in the prompt.\n\nThe word is also used for vector indexes. There, "relevant" means "the true nearest neighbours that an exact search would return". An HNSW index with 0.95 recall@10 finds, on average, 9.5 of the true top 10.',
    formula: ['\\text{recall@}k = \\frac{\\text{relevant results in the top } k}{\\text{all relevant results}}', '\\text{precision@}k = \\frac{\\text{relevant results in the top } k}{k}'],
    symbols: [['k', 'how many top results you look at (e.g. the 5 chunks sent to the model)'], ['\\text{relevant}', 'results a human (or a [[golden dataset]]) marked as truly useful for this question'], ['\\text{recall@}k', '0 to 1; 1 means nothing relevant was missed'], ['\\text{precision@}k', '0 to 1; 1 means every returned result was useful']],
    figure: { h: 'Grading one search', size: [800, 380],
      nodes: {
        t1: { x: 400, y: 40, label: 'Top 5 returned by the search', shape: 'text', w: 300 },
        r1: { x: 100, y: 110, label: 'c2', sub: 'rank 1', w: 110, kind: 'a' }, r2: { x: 250, y: 110, label: 'c3', sub: 'rank 2', w: 110, kind: 'a' }, r3: { x: 400, y: 110, label: 'c5', sub: 'rank 3', w: 110, kind: 'a' }, r4: { x: 550, y: 110, label: 'c8', sub: 'rank 4', w: 110, kind: 'a' }, r5: { x: 700, y: 110, label: 'c1', sub: 'rank 5', w: 110, kind: 'a' },
        g2: { x: 175, y: 290, label: 'c2', shape: 'pill', w: 110, kind: 'c' }, g5: { x: 325, y: 290, label: 'c5', shape: 'pill', w: 110, kind: 'c' }, g7: { x: 475, y: 290, label: 'c7', shape: 'pill', w: 110, kind: 'c' }, g9: { x: 625, y: 290, label: 'c9', shape: 'pill', w: 110, kind: 'c' },
        t2: { x: 400, y: 360, label: 'Truly relevant (from the golden dataset)', shape: 'text', w: 360 }
      },
      steps: [
        { cap: 'The search returned 5 chunks (top row). The golden dataset says 4 chunks truly answer this question (bottom row).', do: [['var', 'k', 5], ['var', 'relevant', 4]] },
        { cap: 'Rank 1, c2, is relevant: a hit.', do: [['set', 'r1', { state: 'ok' }], ['set', 'g2', { state: 'ok' }], ['link', 'r1', 'g2', { tone: 'ok' }], ['var', 'hits', 1]] },
        { cap: 'Rank 3, c5, is also relevant: a second hit.', do: [['set', 'r3', { state: 'ok' }], ['set', 'g5', { state: 'ok' }], ['link', 'r3', 'g5', { tone: 'ok' }], ['var', 'hits', 2]] },
        { cap: 'c3, c8 and c1 are not relevant. They take up prompt space for nothing.', do: [['set', 'r2', { state: 'bad' }], ['set', 'r4', { state: 'bad' }], ['set', 'r5', { state: 'bad' }]] },
        { cap: 'c7 and c9 were never returned: missed. recall@5 = 2 found ÷ 4 relevant = 0.5.', do: [['set', 'g7', { state: 'warn' }], ['set', 'g9', { state: 'warn' }], ['var', 'recall@5', '2/4 = 0.5']] },
        { cap: 'precision@5 = 2 hits ÷ 5 slots = 0.4. Two of the five chunks were useful.', do: [['var', 'precision@5', '2/5 = 0.4'], ['focus', 'r1', 'r3', 'g2', 'g5']] }
      ] },
    example: { given: 'Relevant chunks for a question: {c2, c5, c7, c9} (4 in total). The search returns, in order: c2, c3, c5, c8, c1, c7, c4, c9, c6, c10.',
      steps: [
        'Top 5 = c2, c3, c5, c8, c1. Relevant among them: c2 and c5, so 2 hits.',
        '\\(\\text{recall@5} = \\frac{2}{4} = 0.5\\) and \\(\\text{precision@5}\\) \\(= \\frac{2}{5}\\) \\(= 0.4\\).',
        'Top 10 adds c7 and c9, so 4 hits. \\(\\text{recall@10} = \\frac{4}{4} = 1.0\\) and \\(\\text{precision@10}\\) \\(= \\frac{4}{10}\\) \\(= 0.4\\).',
        'Index recall: an exact search\'s true top 10 and the HNSW top 10 share 9 ids, so the index recall@10 is \\(\\frac{9}{10} = 0.9\\).'],
      result: 'A bigger k raises recall (more is found) but usually lowers precision (more junk). A [[reranker]] helps you get both: retrieve many, keep the best few.' },
    pitfalls: [
      'Recall needs labelled answers. Without a golden dataset you cannot measure it, only guess.',
      'Low recall in RAG means the model never sees the fact. No prompt change can fix that; fix retrieval (chunking, k, hybrid search).',
      'Do not confuse index recall (ANN vs exact search) with retrieval recall (vs human labels). A perfect index can still retrieve the wrong chunks.',
      'Average recall over many questions. One query tells you very little.'],
    code: 'def recall_at_k(retrieved, relevant, k):\n    hits = len(set(retrieved[:k]) & set(relevant))\n    return hits / len(relevant)\n\ndef precision_at_k(retrieved, relevant, k):\n    return len(set(retrieved[:k]) & set(relevant)) / k\n\nrecall_at_k(["c2","c3","c5","c8","c1"], ["c2","c5","c7","c9"], 5)   # 0.5', lang: 'Python'
  },

  'BM25': {
    intuition: 'BM25 scores how well a document matches the words of a query. It follows three common-sense rules.\n\n**1. Rare words matter more.** A match on "E42" (in 3 documents) means more than a match on "the" (in all of them). This weight is the IDF (inverse document frequency).\n**2. Repeats help, but less and less.** Saying "timeout" twice is better than once, but not twice as good. The parameter \\(k_1\\) controls how fast the bonus levels off.\n**3. Long documents get a small penalty.** A 5,000-word page mentions everything once by chance. The parameter b controls how strongly length counts.\n\nThe score for a document is the sum over the query words. Words not in the document add 0.',
    formula: ['\\text{score}(q, D) = \\sum_{t \\in q} \\mathrm{IDF}(t) \\cdot \\frac{f(t, D) \\cdot (k_1 + 1)}{f(t, D) + k_1 \\cdot (1 - b + b \\cdot \\frac{|D|}{\\text{avgdl}})}', '\\mathrm{IDF}(t) = \\ln(\\frac{N - n(t) + 0.5}{n(t) + 0.5} + 1)'],
    symbols: [['t', 'one word (term) of the query q'], ['f(t, D)', 'how many times t appears in document D (term frequency)'], ['|D|', 'the length of D in words'], ['\\text{avgdl}', 'the average document length in the collection'], ['N', 'the number of documents'], ['n(t)', 'how many documents contain t at least once'], ['k_1', 'repeat saturation, usually 1.2; the score for one word can never pass \\(\\mathrm{IDF} \\cdot (k_1 + 1)\\)'], ['b', 'length normalisation from 0 (ignore length) to 1 (full effect), usually 0.75'], ['\\ln', 'the natural logarithm']],
    figure: { h: 'Scoring 3 documents for "timeout refund"', size: [800, 380],
      nodes: {
        q: { x: 100, y: 190, label: 'timeout refund', sub: 'query', shape: 'pill', w: 140, kind: 'a', state: 'active' },
        d1: { x: 390, y: 65, label: 'D1 · 4 words', sub: 'refund ×1', w: 180, kind: 'c' },
        d2: { x: 390, y: 190, label: 'D2 · 4 words', sub: 'refund ×1, timeout ×1', w: 180, kind: 'c' },
        d3: { x: 390, y: 315, label: 'D3 · 10 words', sub: 'refund ×1, timeout ×2', w: 180, kind: 'c' }
      },
      steps: [
        { cap: 'IDF: refund is in all 3 docs, timeout in 2. \\(\\ln(\\frac{0.5}{3.5} + 1) = 0.134\\) and \\(\\ln(\\frac{1.5}{2.5} + 1) = 0.470\\).', do: [['var', 'IDF(refund)', '0.134'], ['var', 'IDF(timeout)', '0.470']] },
        { cap: 'Length: avgdl = 18 ÷ 3 = 6. A 4-word doc gets \\(1.2 \\cdot (0.25 + 0.75 \\cdot \\frac{4}{6})\\) \\(= 0.9\\); the 10-word D3 gets 1.8.', do: [['set', 'd1', { sub: 'refund ×1 · K = 0.9' }], ['set', 'd2', { sub: 'K = 0.9' }], ['set', 'd3', { sub: 'K = 1.8' }], ['var', 'avgdl', 6]] },
        { cap: 'D1 has only refund: \\(0.134 \\cdot \\frac{1 \\cdot 2.2}{1 + 0.9}\\) \\(= 0.134 \\cdot 1.158\\) \\(= 0.155\\).', do: [['add', 's1', { x: 680, y: 65, label: '0.155', shape: 'pill', w: 110, kind: 'n' }], ['link', 'd1', 's1'], ['send', 'q', 'd1']] },
        { cap: 'D2 has both words once: \\((0.134 + 0.470) \\cdot 1.158\\) \\(= 0.699\\).', do: [['add', 's2', { x: 680, y: 190, label: '0.699', shape: 'pill', w: 110, kind: 'n' }], ['link', 'd2', 's2'], ['send', 'q', 'd2']] },
        { cap: 'D3 says timeout twice but is long: \\(\\frac{2 \\cdot 2.2}{2 + 1.8} = 1.158\\), no more than one mention in a short doc. Total 0.649.', do: [['add', 's3', { x: 680, y: 315, label: '0.649', shape: 'pill', w: 110, kind: 'n' }], ['link', 'd3', 's3'], ['send', 'q', 'd3']] },
        { cap: 'Ranking: D2 (0.699) > D3 (0.649) > D1 (0.155). Matching the rare word timeout is what lifted D2 and D3.', do: [['set', 's2', { state: 'ok', label: '#1 0.699' }], ['set', 's3', { label: '#2 0.649' }], ['set', 's1', { state: 'off', label: '#3 0.155' }]] }
      ] },
    example: { given: 'Query "timeout refund". D1 = "refund within thirty days" (4 words). D2 = "refund after payment timeout" (4 words). D3 = "gateway timeout causes a second timeout and a refund request" (10 words). \\(k_1 = 1.2\\), \\(b = 0.75\\), \\(N = 3\\).',
      steps: [
        'Average length: \\(\\text{avgdl} = \\frac{4 + 4 + 10}{3} = 6\\).',
        'refund is in 3 docs: \\(\\mathrm{IDF}\\) \\(= \\ln(\\frac{3 - 3 + 0.5}{3 + 0.5} + 1)\\) \\(= \\ln(1.1429)\\) \\(= 0.1335\\).',
        'timeout is in 2 docs: \\(\\mathrm{IDF}\\) \\(= \\ln(\\frac{3 - 2 + 0.5}{2 + 0.5} + 1)\\) \\(= \\ln(1.6)\\) \\(= 0.4700\\).',
        'Length factor for 4 words: \\(k_1 (1 - b + b \\frac{4}{6})\\) \\(= 1.2 \\cdot (0.25 + 0.5)\\) \\(= 0.9\\). For 10 words: \\(1.2 \\cdot (0.25 + 1.25)\\) \\(= 1.8\\).',
        'Repeat part, f = 1 in a 4-word doc: \\(\\frac{1 \\cdot 2.2}{1 + 0.9} = 1.1579\\). f = 1 in D3: \\(\\frac{2.2}{2.8} = 0.7857\\). f = 2 in D3: \\(\\frac{4.4}{3.8} = 1.1579\\).',
        'D1 \\(= 0.1335 \\times 1.1579\\) \\(= 0.1546\\).',
        'D2 \\(= 0.1335 \\times 1.1579 + 0.4700 \\times 1.1579\\) \\(= 0.1546 + 0.5442\\) \\(= 0.6988\\).',
        'D3 \\(= 0.1335 \\times 0.7857 + 0.4700 \\times 1.1579\\) \\(= 0.1049 + 0.5442\\) \\(= 0.6491\\).'],
      result: 'D2 (0.699) > D3 (0.649) > D1 (0.155). D3 said "timeout" twice, but its length cancelled the bonus exactly: 2 mentions in 10 words scored the same as 1 mention in 4 words.' },
    lab: { h: 'Saturation and length', body: 'Each bar is the repeat part of the formula for a word that appears tf times. The bars can never pass \\(k_1 + 1\\). Try k1 = 0, b = 0, and a long document.', size: [800, 380],
      controls: [{ id: 'k1', type: 'range', label: 'k1', min: 0, max: 3, step: 0.1, value: 1.2 }, { id: 'b', type: 'range', label: 'b', min: 0, max: 1, step: 0.05, value: 0.75 }, { id: 'r', type: 'range', label: 'doc length ÷ avgdl', min: 0.5, max: 3, step: 0.25, value: 1 }],
      view: s => { const k1 = s.v.k1, K = k1 * (1 - s.v.b + s.v.b * s.v.r), nodes = { cap: { x: 400, y: 28, label: 'ceiling k1 + 1 = ' + (k1 + 1).toFixed(1), shape: 'text', w: 260 } };
        for (let f = 1; f <= 8; f++) { const val = f * (k1 + 1) / (f + K); nodes['t' + f] = { x: 110 + 82 * (f - 1), y: 345, label: val.toFixed(2), sub: 'tf=' + f, shape: 'bar', w: 56, h: Math.max(6, 70 * val), kind: 'b' }; }
        return { nodes, vars: { 'K = k1(1 − b + b·len)': K.toFixed(2) } }; },
      readout: s => { const k1 = s.v.k1, K = k1 * (1 - s.v.b + s.v.b * s.v.r), v = f => f * (k1 + 1) / (f + K);
        return [['tf = 1', v(1).toFixed(3)], ['tf = 2', v(2).toFixed(3)], ['2nd mention adds', (100 * (v(2) / v(1) - 1)).toFixed(0) + '%'], ['tf = 8 vs tf = 1', (v(8) / v(1)).toFixed(2) + '×']]; } },
    pitfalls: [
      'BM25 matches exact words only. "cancel" does not match "unsubscribe"; that is what vector search adds. Combine both with [[hybrid search]].',
      'PostgreSQL\'s built-in `ts_rank` is not BM25: it has no IDF. Use an extension (for example ParadeDB\'s pg_search) or a search engine for real BM25.',
      'IDF depends on the whole collection, so scores change as documents are added. Compare scores only within one query.',
      'Some engines (Lucene 8+) drop the \\((k_1 + 1)\\) factor. Scores differ, but the ranking is the same.'],
    code: 'import math\n\ndef bm25(query, doc, docs, k1=1.2, b=0.75):\n    N = len(docs); avgdl = sum(len(d) for d in docs) / N\n    score = 0.0\n    for t in query:\n        n = sum(t in d for d in docs)\n        idf = math.log((N - n + 0.5) / (n + 0.5) + 1)\n        f = doc.count(t)\n        score += idf * f * (k1 + 1) / (f + k1 * (1 - b + b * len(doc) / avgdl))\n    return score\n\ndocs = [s.split() for s in ["refund within thirty days", "refund after payment timeout",\n        "gateway timeout causes a second timeout and a refund request"]]\n[round(bm25(["timeout", "refund"], d, docs), 4) for d in docs]   # [0.1546, 0.6988, 0.6491]', lang: 'Python'
  },

  'RRF': {
    intuition: '[[hybrid search]] gives you two ranked lists: one from [[BM25]] (scores like 12.4) and one from vector search (scores like 0.83). The scores are on different scales, so you cannot just add them.\n\nReciprocal Rank Fusion ignores the scores and uses only the **positions**. A result at rank r in a list earns \\(\\frac{1}{60 + r}\\). Add up what each result earns across the lists, then sort.\n\nThe 60 flattens the curve. Rank 1 earns only a little more than rank 5, so a result that is fairly high in **both** lists beats one that is first in only one list.',
    formula: ['\\text{RRF}(d) = \\sum_{r \\in R} \\frac{1}{k + \\text{rank}_r(d)}', 'k = 60'],
    symbols: [['d', 'one result (a chunk or document)'], ['R', 'the set of ranked lists being merged (e.g. BM25 and vector)'], ['\\text{rank}_r(d)', 'the position of d in list r, starting at 1; if d is not in list r, that list adds nothing'], ['k', 'a smoothing constant; 60 is the standard choice from the original paper']],
    figure: { h: 'Merging two ranked lists', size: [800, 420],
      nodes: {
        hb: { x: 110, y: 25, label: 'BM25 list', shape: 'text', w: 120 }, hv: { x: 330, y: 25, label: 'Vector list', shape: 'text', w: 120 }, hm: { x: 640, y: 25, label: 'RRF merged', shape: 'text', w: 120 },
        b1: { x: 110, y: 80, label: '1. A', sub: 'score 12.4', shape: 'pill', w: 120, kind: 'd' }, b2: { x: 110, y: 160, label: '2. B', sub: 'score 9.8', shape: 'pill', w: 120, kind: 'd' }, b3: { x: 110, y: 240, label: '3. C', sub: 'score 7.1', shape: 'pill', w: 120, kind: 'd' }, b4: { x: 110, y: 320, label: '4. D', sub: 'score 3.0', shape: 'pill', w: 120, kind: 'd' },
        v1: { x: 330, y: 80, label: '1. C', sub: 'cos 0.91', shape: 'pill', w: 120, kind: 'b' }, v2: { x: 330, y: 160, label: '2. A', sub: 'cos 0.88', shape: 'pill', w: 120, kind: 'b' }, v3: { x: 330, y: 240, label: '3. E', sub: 'cos 0.85', shape: 'pill', w: 120, kind: 'b' }, v4: { x: 330, y: 320, label: '4. B', sub: 'cos 0.80', shape: 'pill', w: 120, kind: 'b' }
      },
      steps: [
        { cap: 'Two searches, two ranked lists. 12.4 and 0.91 are on different scales, so RRF uses only the ranks.', do: [['focus', 'b1', 'b2', 'b3', 'b4', 'v1', 'v2', 'v3', 'v4']] },
        { cap: 'A is rank 1 in BM25 and rank 2 in vector: \\(\\frac{1}{61} + \\frac{1}{62} = 0.03252\\).', do: [['add', 'mA', { x: 640, y: 80, label: 'A 0.03252', shape: 'pill', w: 130, kind: 'c' }], ['send', 'b1', 'mA'], ['send', 'v2', 'mA']] },
        { cap: 'C is rank 3 in BM25 and rank 1 in vector: \\(\\frac{1}{63} + \\frac{1}{61} = 0.03227\\).', do: [['add', 'mC', { x: 640, y: 155, label: 'C 0.03227', shape: 'pill', w: 130, kind: 'c' }], ['send', 'b3', 'mC'], ['send', 'v1', 'mC']] },
        { cap: 'B is rank 2 and rank 4: \\(\\frac{1}{62} + \\frac{1}{64} = 0.03175\\).', do: [['add', 'mB', { x: 640, y: 230, label: 'B 0.03175', shape: 'pill', w: 130, kind: 'c' }], ['send', 'b2', 'mB'], ['send', 'v4', 'mB']] },
        { cap: 'E and D appear in one list only: E gets \\(\\frac{1}{63} = 0.01587\\), D gets \\(\\frac{1}{64} = 0.01563\\).', do: [['add', 'mE', { x: 640, y: 305, label: 'E 0.01587', shape: 'pill', w: 130, kind: 'n' }], ['add', 'mD', { x: 640, y: 380, label: 'D 0.01563', shape: 'pill', w: 130, kind: 'n' }], ['send', 'v3', 'mE'], ['send', 'b4', 'mD']] },
        { cap: 'Final order A, C, B, E, D. Being in both lists roughly doubles a score, so agreement wins.', do: [['set', 'mA', { state: 'ok' }], ['set', 'mC', { state: 'ok' }], ['set', 'mB', { state: 'ok' }], ['focus', 'mA', 'mC', 'mB', 'mE', 'mD']] }
      ] },
    example: { given: 'BM25 returns A, B, C, D. Vector search returns C, A, E, B. Use \\(k = 60\\).',
      steps: [
        'A: \\(\\frac{1}{60 + 1} + \\frac{1}{60 + 2}\\) \\(= 0.016393 + 0.016129\\) \\(= 0.032522\\).',
        'B: \\(\\frac{1}{62} + \\frac{1}{64}\\) \\(= 0.016129 + 0.015625\\) \\(= 0.031754\\).',
        'C: \\(\\frac{1}{63} + \\frac{1}{61}\\) \\(= 0.015873 + 0.016393\\) \\(= 0.032266\\).',
        'D (BM25 only): \\(\\frac{1}{64} = 0.015625\\). E (vector only): \\(\\frac{1}{63} = 0.015873\\).',
        'Sort high to low: A 0.03252, C 0.03227, B 0.03175, E 0.01587, D 0.01563.',
        'With k = 0 instead, rank 1 earns \\(\\frac{1}{1} = 1\\) and rank 2 only \\(\\frac{1}{2}\\): the top spot would dominate. k = 60 keeps the steps gentle.'],
      result: 'Merged order: A, C, B, E, D. Results found by both searches rise to the top.' },
    pitfalls: [
      'RRF throws away score size. A near-perfect BM25 match (an exact error code) counts the same as a weak rank 1. Give that list a weight if it matters.',
      'Fetch enough from each list (e.g. top 20–50) before fusing. A result missing from a short list gets nothing from it.',
      'The final RRF score is only good for sorting. Do not use it as a relevance threshold.',
      'Ranks start at 1, not 0. With 0-based ranks, every term is slightly off.'],
    code: 'def rrf(*lists, k=60):\n    scores = {}\n    for ranked in lists:\n        for rank, doc in enumerate(ranked, start=1):\n            scores[doc] = scores.get(doc, 0) + 1 / (k + rank)\n    return sorted(scores, key=scores.get, reverse=True)\n\nrrf(["A", "B", "C", "D"], ["C", "A", "E", "B"])   # [\'A\', \'C\', \'B\', \'E\', \'D\']', lang: 'Python'
  },

  'reranker': {
    intuition: 'Vector search uses a **bi-encoder**: the query and each chunk are turned into vectors **separately**, and then compared with [[cosine similarity]]. Chunk vectors are computed once, ahead of time, so search is fast. But the query and the chunk never "read" each other. "How do I cancel my plan?" can score high against "Plans and pricing overview" just because both are about plans.\n\nA reranker is usually a **cross-encoder**. It reads the query and one chunk **together**, as one input, and outputs a relevance score. It can notice that the chunk never mentions cancelling. That makes it much more accurate, but it must run once per (query, chunk) pair at query time, and nothing can be precomputed.\n\nSo you combine them: a fast first search picks about 20–50 candidates, the reranker scores only those, and the best 3–5 go into the prompt.',
    formula: ['s_{\\text{bi}}(q, d) = \\cos(E(q), E(d))', 's_{\\text{cross}}(q, d) = f(q, d)', '\\text{rerank cost} = n \\times t_{\\text{pair}}'],
    symbols: [['E(\\cdot)', 'the embedding model; E(d) is computed once, when the chunk is stored'], ['f(q, d)', 'the cross-encoder, which reads query and chunk together at query time'], ['n', 'how many candidates you rerank (e.g. 20)'], ['t_{\\text{pair}}', 'the cost of scoring one pair (time or tokens)']],
    figure: { h: 'Retrieve wide, rerank, keep few', size: [800, 380],
      nodes: {
        q: { x: 100, y: 185, label: 'cancel my plan?', sub: 'query', shape: 'pill', w: 150, kind: 'a', state: 'active' },
        c1: { x: 360, y: 50, label: 'Pricing overview', sub: 'cos 0.82', w: 170, kind: 'n' },
        c2: { x: 360, y: 140, label: 'How to cancel', sub: 'cos 0.80', w: 170, kind: 'n' },
        c3: { x: 360, y: 230, label: 'Plan comparison', sub: 'cos 0.79', w: 170, kind: 'n' },
        c4: { x: 360, y: 320, label: 'Refund on cancel', sub: 'cos 0.77', w: 170, kind: 'n' },
        ce: { x: 650, y: 185, label: 'Cross-encoder', sub: 'reads pairs', w: 150, kind: 'b' }
      },
      steps: [
        { cap: 'Stage 1: vector search ranks candidates by cosine. The top hit, "Pricing overview", is about plans, not cancelling.', do: [['send', 'q', 'c1'], ['send', 'q', 'c2'], ['send', 'q', 'c3'], ['send', 'q', 'c4'], ['var', 'candidates', '20 (top 4 shown)']] },
        { cap: 'Stage 2: the cross-encoder reads the query and each chunk together, one pair at a time.', do: [['send', 'c1', 'ce', 'pair'], ['send', 'c2', 'ce', 'pair'], ['send', 'c3', 'ce', 'pair'], ['send', 'c4', 'ce', 'pair'], ['set', 'ce', { state: 'active' }]] },
        { cap: 'New scores: chunks that actually explain cancelling score high; chunks that only share the topic score low.', do: [['set', 'c1', { sub: 'cos 0.82 → 0.12' }], ['set', 'c2', { sub: 'cos 0.80 → 0.91' }], ['set', 'c3', { sub: 'cos 0.79 → 0.08' }], ['set', 'c4', { sub: 'cos 0.77 → 0.75' }]] },
        { cap: 'Sort by the reranker score. The two useful chunks move to the top.', do: [['move', 'c2', 360, 50], ['move', 'c4', 360, 140], ['move', 'c1', 360, 230], ['move', 'c3', 360, 320]] },
        { cap: 'Keep the top 2 for the prompt. Precision of what the model reads goes from 2/4 to 2/2.', do: [['set', 'c2', { state: 'ok' }], ['set', 'c4', { state: 'ok' }], ['set', 'c1', { state: 'off' }], ['set', 'c3', { state: 'off' }], ['var', 'sent to model', 2]] }
      ] },
    example: { given: 'Vector search returns the top 20 candidates. Each (query, chunk) pair is about 300 tokens (a 20-token question plus a 280-token chunk). Among the 20, 4 chunks are relevant. Before reranking, 2 of them are in the top 5.',
      steps: [
        'Rerank work: \\(20 \\times 300 = \\text{6,000}\\) tokens through the cross-encoder per question.',
        'Doing it without stage 1, on a 1,000,000-chunk knowledge base: \\(\\text{1,000,000} \\times 300\\) \\(= \\text{300,000,000}\\) tokens per question. Impossible, which is why stage 1 exists.',
        'Before reranking: \\(\\text{precision@5}\\) \\(= \\frac{2}{5}\\) \\(= 0.4\\).',
        'After reranking, all 4 relevant chunks move into the top 5: \\(\\text{precision@5}\\) \\(= \\frac{4}{5}\\) \\(= 0.8\\).',
        'Recall cannot rise above what stage 1 found. If a relevant chunk was not among the 20, the reranker never sees it.'],
      result: 'Reranking 20 candidates costs about 6,000 tokens per question and, here, doubles precision@5 from 0.4 to 0.8.' },
    pitfalls: [
      'Reranking adds latency (often tens to hundreds of milliseconds). Batch all pairs into one call.',
      'Retrieve enough candidates. Reranking the top 5 into a new top 5 changes little; rerank 20–50.',
      'Cross-encoders have an input limit (often 512 tokens). Long chunks get cut off, and the cut part is ignored.',
      'Reranker scores are not comparable across queries. Use them to sort, and test any cutoff on your own data.'],
    code: 'from sentence_transformers import CrossEncoder\n\nce = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")\nscores = ce.predict([(query, c) for c in candidates])   # one score per pair\nranked = [c for _, c in sorted(zip(scores, candidates), key=lambda p: p[0], reverse=True)]\ntop = ranked[:5]', lang: 'Python'
  },

  'chunk overlap': {
    intuition: 'You cut a long document into [[chunk|chunks]] of s tokens. If you cut cleanly, a sentence on a border is split in two, and neither half makes sense on its own.\n\nWith overlap, each new chunk starts o tokens **before** the previous one ended. So each step forward is only \\(s - o\\) tokens (the stride). A sentence shorter than o that sits on a border is complete in at least one chunk.\n\nThe cost: overlapping text is stored, embedded and possibly sent to the model more than once. A typical overlap is 10–20% of the chunk size.',
    formula: ['n = \\lceil \\frac{L - o}{s - o} \\rceil \\quad (\\text{when } L > s; \\text{ otherwise } n = 1)', '\\text{stride} = s - o', '\\text{tokens stored} = L + (n - 1) \\cdot o'],
    symbols: [['L', 'the document length in tokens'], ['s', 'the chunk size in tokens'], ['o', 'the overlap in tokens (must be smaller than s)'], ['n', 'how many chunks you get'], ['\\lceil x \\rceil', 'round up to the next whole number (ceiling)']],
    figure: { h: 'A 1,300-token document, s = 500, o = 100', size: [800, 380],
      nodes: { doc: { x: 400, y: 60, label: 'Document: tokens 0 – 1,300', shape: 'pill', w: 650, kind: 'n' } },
      steps: [
        { cap: 'A 1,300-token document. We want chunks of s = 500 tokens with o = 100 tokens of overlap.', do: [['var', 's', 500], ['var', 'o', 100], ['var', 'L', '1,300']] },
        { cap: 'Chunk 1 covers tokens 0–500.', do: [['add', 'k1', { x: 200, y: 170, label: 'Chunk 1: 0–500', w: 250, kind: 'a' }], ['link', 'doc', 'k1']] },
        { cap: 'Step forward by the stride \\(s - o = 400\\). Chunk 2 covers 400–900, so tokens 400–500 appear twice.', do: [['add', 'k2', { x: 400, y: 270, label: 'Chunk 2: 400–900', w: 250, kind: 'b' }], ['link', 'doc', 'k2'], ['add', 'ov1', { x: 300, y: 350, label: '100', shape: 'pill', w: 50, kind: 'd' }]] },
        { cap: 'Chunk 3 covers 800–1,300 and reaches the end. Tokens 800–900 are shared with chunk 2.', do: [['add', 'k3', { x: 600, y: 170, label: 'Chunk 3: 800–1,300', w: 250, kind: 'a' }], ['link', 'doc', 'k3'], ['add', 'ov2', { x: 500, y: 350, label: '100', shape: 'pill', w: 50, kind: 'd' }]] },
        { cap: 'Check: \\(\\lceil \\frac{1300 - 100}{500 - 100} \\rceil\\) \\(= \\lceil 3 \\rceil\\) \\(= 3\\) chunks. Stored: 1,300 + 2 × 100 = 1,500 tokens.', do: [['var', 'n', 3], ['var', 'stored', '1,500 tokens']] },
        { cap: 'A sentence at tokens 430–490 would be cut at token 500 without overlap. Now it is whole in chunk 2.', do: [['note', 'ov1', 'sentence kept whole'], ['set', 'k2', { state: 'ok' }], ['focus', 'k1', 'k2', 'ov1']] }
      ] },
    example: { given: 'A document of \\(L = \\text{10,000}\\) tokens, chunk size \\(s = 500\\), overlap \\(o = 100\\). Each chunk becomes one 1,536-number vector (4 bytes per number).',
      steps: [
        'Stride: \\(s - o = 500 - 100 = 400\\) tokens.',
        'Chunks: \\(n\\) \\(= \\lceil \\frac{\\text{10,000} - 100}{400} \\rceil\\) \\(= \\lceil 24.75 \\rceil\\) \\(= 25\\).',
        'Check the last one: chunk 25 starts at \\(24 \\times 400 = \\text{9,600}\\) and covers 9,600–10,000 (only 400 tokens, which is fine).',
        'Without overlap: \\(\\lceil \\frac{\\text{10,000}}{500} \\rceil = 20\\) chunks.',
        'Tokens embedded: \\(\\text{10,000} + (25 - 1) \\times 100\\) \\(= \\text{12,400}\\), which is 24% more than the 10,000 without overlap.',
        'Vector storage: \\(25 \\times 1536 \\times 4 = \\text{153,600}\\) bytes vs \\(20 \\times 1536 \\times 4 = \\text{122,880}\\) bytes. Also 25% more.'],
      result: '25 chunks instead of 20, and about 24% more tokens to embed and store. The extra cost is roughly \\(\\frac{s}{s - o}\\), here \\(\\frac{500}{400} = 1.25\\).' },
    lab: { h: 'Size vs overlap', body: 'Change the document length, chunk size and overlap. The bars compare the original text with the tokens you will actually embed and store.', size: [800, 380],
      controls: [{ id: 'L', type: 'range', label: 'Document length L', min: 1000, max: 20000, step: 500, value: 10000 }, { id: 's', type: 'range', label: 'Chunk size s', min: 200, max: 1000, step: 50, value: 500 }, { id: 'o', type: 'range', label: 'Overlap o', min: 0, max: 150, step: 10, value: 100 }],
      view: s => { const L = s.v.L, S = s.v.s, o = s.v.o, n = L <= S ? 1 : Math.ceil((L - o) / (S - o)), stored = L + (n - 1) * o, n0 = Math.ceil(L / S);
        return { nodes: {
            t: { x: 180, y: 340, label: G2_fmt(L), sub: 'document', shape: 'bar', w: 90, h: 260 * L / stored, kind: 'n' },
            st: { x: 330, y: 340, label: G2_fmt(stored), sub: 'stored', shape: 'bar', w: 90, h: 260, kind: 'a' },
            p1: { x: 620, y: 90, label: 'chunks n = ' + n + ' (no overlap: ' + n0 + ')', shape: 'pill', w: 290, kind: 'b' },
            p2: { x: 620, y: 190, label: 'stride s − o = ' + (S - o), shape: 'pill', w: 290, kind: 'c' },
            p3: { x: 620, y: 290, label: 'extra tokens: +' + (100 * (stored - L) / L).toFixed(1) + '%', shape: 'pill', w: 290, kind: 'd' } },
          vars: { n: n, 'tokens stored': G2_num(stored) } }; },
      readout: s => { const L = s.v.L, S = s.v.s, o = s.v.o, n = L <= S ? 1 : Math.ceil((L - o) / (S - o)); return [['chunks', n], ['tokens stored', G2_num(L + (n - 1) * o)], ['overlap share of each chunk', (100 * o / S).toFixed(0) + '%']]; } },
    pitfalls: [
      'Overlap does not fix bad boundaries. Splitting on headings and paragraphs usually helps more than adding overlap.',
      'Overlapping chunks are near-duplicates. Retrieval can return two of them, wasting prompt space. Remove duplicates before building the prompt.',
      'Count tokens with the embedding model\'s [[tokenizer]], not characters. 500 characters is only about 125 tokens of English.',
      'Overlap must be smaller than the chunk size, or the stride is zero or negative and the loop never ends.'],
    code: 'def chunk(tokens, size=500, overlap=100):\n    step = size - overlap            # the stride\n    out = []\n    for start in range(0, len(tokens), step):\n        out.append(tokens[start:start + size])\n        if start + size >= len(tokens):\n            break\n    return out\n\nlen(chunk(list(range(10_000))))   # 25', lang: 'Python'
  },

  'faithfulness': {
    intuition: 'Faithfulness asks: **is everything the answer says backed up by the context we gave the model?** It does not ask whether the answer is true in the real world. It asks whether the model stuck to its sources.\n\nAn [[LLM-as-a-judge]] measures it in three steps. First, it splits the answer into small **claims**, each one checkable fact. Second, for each claim it asks: "Can this be inferred from the context? yes or no". Third, it divides the yes count by the number of claims.\n\nA claim that contradicts the context and a claim the context never mentions both count as unsupported. Either way, the model went beyond its sources. That is a [[hallucination]] risk.',
    formula: ['\\text{faithfulness} = \\frac{\\text{claims supported by the context}}{\\text{total claims in the answer}}'],
    symbols: [['\\text{claim}', 'one short, standalone fact taken from the answer'], ['\\text{supported}', 'the judge can infer the claim from the retrieved context alone'], ['\\text{faithfulness}', '0 to 1; 1.0 means every claim is backed by the context']],
    figure: { h: 'Judging one answer', size: [800, 380],
      nodes: {
        ans: { x: 110, y: 190, label: 'Answer', sub: '2 sentences', w: 150, kind: 'a' },
        ctx: { x: 690, y: 190, label: 'Context', sub: '3 chunks', shape: 'db', w: 150, kind: 'c' }
      },
      steps: [
        { cap: 'The judge splits the answer into small claims, one fact each. This answer has 4.', do: [['add', 'k1', { x: 400, y: 60, label: 'Pro costs $20/month', shape: 'pill', w: 230, kind: 'n' }], ['add', 'k2', { x: 400, y: 140, label: 'Yearly: 2 months free', shape: 'pill', w: 230, kind: 'n' }], ['add', 'k3', { x: 400, y: 220, label: 'Refund within 30 days', shape: 'pill', w: 230, kind: 'n' }], ['add', 'k4', { x: 400, y: 300, label: 'Includes priority support', shape: 'pill', w: 230, kind: 'n' }], ['send', 'ans', 'k1']] },
        { cap: 'Claim 1: the context says "Pro plan: $20 per month". Supported.', do: [['send', 'k1', 'ctx', 'check'], ['set', 'k1', { state: 'ok' }], ['var', 'supported', 1]] },
        { cap: 'Claim 2: the context says "annual billing: 2 months free". Supported.', do: [['send', 'k2', 'ctx', 'check'], ['set', 'k2', { state: 'ok' }], ['var', 'supported', 2]] },
        { cap: 'Claim 3: the context says refunds within **14** days. The answer contradicts it. Not supported.', do: [['send', 'k3', 'ctx', 'check'], ['set', 'k3', { state: 'bad' }], ['note', 'k3', 'context: 14 days']] },
        { cap: 'Claim 4: the context never mentions support. Maybe true, but not backed by the sources. Not supported.', do: [['send', 'k4', 'ctx', 'check'], ['set', 'k4', { state: 'bad' }]] },
        { cap: 'Faithfulness = 2 supported ÷ 4 claims = 0.5. Half of this answer went beyond its sources.', do: [['var', 'faithfulness', '2/4 = 0.5'], ['focus', 'k1', 'k2', 'k3', 'k4']] }
      ] },
    example: { given: 'Context: "Pro plan: $20 per month. Annual billing: 2 months free. Refunds within 14 days of purchase." Answer: "The Pro plan costs $20 a month, and paying yearly gets you two months free. You can get a refund within 30 days, and it includes priority support."',
      steps: [
        'Split into claims: (1) Pro costs $20/month. (2) Yearly billing gives 2 months free. (3) Refunds within 30 days. (4) Pro includes priority support.',
        'Claim 1: matches the context. Yes.',
        'Claim 2: matches the context. Yes.',
        'Claim 3: the context says 14 days, not 30. No.',
        'Claim 4: the context says nothing about support. No.',
        '\\(\\text{faithfulness}\\) \\(= \\frac{2}{4}\\) \\(= 0.5\\).'],
      result: 'Faithfulness 0.5. The fix is in the prompt or model ("answer only from the context"), not in retrieval: the right facts were there.' },
    pitfalls: [
      'Faithful is not the same as correct. If the context itself is wrong or out of date, a perfectly faithful answer is still wrong.',
      'An answer of "I don\'t know" has no claims, so the score is 0 ÷ 0. Decide up front how to score it (often 1.0, or skip it).',
      'The judge can be wrong too. Spot-check its verdicts by hand, and keep its rubric strict and short.',
      'Long, vague claims hide errors. Ask the judge for short, standalone claims.'],
    code: '# Two judge calls per answer (this is how RAGAS does it)\nclaims = judge_json("Split this answer into short standalone claims, one fact each. "\n                    "Return a JSON list of strings.", answer)\nverdicts = [judge(f"Context:\\n{context}\\n\\nCan this claim be inferred from the context alone? "\n                  f"Reply yes or no.\\nClaim: {c}") for c in claims]\nfaithfulness = sum(v == "yes" for v in verdicts) / max(len(claims), 1)', lang: 'Python'
  },

  'context recall': {
    intuition: '[[faithfulness]] checks the answer against the context. Context recall checks the **context** against the truth: did retrieval bring back every fact needed to answer?\n\nIt needs a [[golden dataset]]: a question plus a reference answer written by a person. A judge splits the reference answer into facts. Then, for each fact, it asks: "Is this fact present in the retrieved chunks? yes or no". The score is the share of facts that were found.\n\nLow context recall means the model never saw part of the answer. No prompt can fix that. Fix retrieval instead: chunking, k, [[hybrid search]], or a [[reranker]].',
    formula: ['\\text{context recall} = \\frac{\\text{ground-truth facts found in the retrieved context}}{\\text{total facts in the ground-truth answer}}'],
    symbols: [['\\text{ground-truth answer}', 'the hand-written reference answer from the golden dataset'], ['\\text{fact}', 'one short statement split out of the reference answer'], ['\\text{found}', 'the judge can attribute the fact to at least one retrieved chunk'], ['\\text{context recall}', '0 to 1; 1.0 means nothing needed was missing']],
    figure: { h: 'Did retrieval fetch every fact?', size: [800, 380],
      nodes: {
        f1: { x: 170, y: 80, label: 'Refunds within 14 days', shape: 'pill', w: 260, kind: 'd' },
        f2: { x: 170, y: 190, label: 'Annual: pro-rata refund', shape: 'pill', w: 260, kind: 'd' },
        f3: { x: 170, y: 300, label: 'Cancel in Billing tab', shape: 'pill', w: 260, kind: 'd' },
        k1: { x: 600, y: 80, label: 'Chunk 1: how to cancel', w: 230, kind: 'c' },
        k2: { x: 600, y: 190, label: 'Chunk 2: refund window', w: 230, kind: 'c' },
        k3: { x: 600, y: 300, label: 'Chunk 3: monthly prices', w: 230, kind: 'c' }
      },
      steps: [
        { cap: 'Left: the reference answer split into 3 facts. Right: the 3 chunks retrieval returned for this question.', do: [['var', 'facts', 3]] },
        { cap: 'Fact 1 (14-day window) is stated in chunk 2. Found.', do: [['link', 'f1', 'k2', { tone: 'ok' }], ['set', 'f1', { state: 'ok' }], ['var', 'found', 1]] },
        { cap: 'Fact 2 (annual plans get a pro-rata refund): no chunk mentions it. Missing.', do: [['set', 'f2', { state: 'bad' }], ['note', 'f2', 'not in any chunk']] },
        { cap: 'Fact 3 (cancel in the Billing tab) is in chunk 1. Found.', do: [['link', 'f3', 'k1', { tone: 'ok' }], ['set', 'f3', { state: 'ok' }], ['var', 'found', 2]] },
        { cap: 'Context recall = 2 ÷ 3 ≈ 0.67. Chunk 3 was not needed at all, but that hurts precision, not recall.', do: [['var', 'context recall', '2/3 ≈ 0.67'], ['set', 'k3', { state: 'off' }], ['focus', 'f1', 'f2', 'f3']] }
      ] },
    example: { given: 'Question: "How do I get a refund on my annual plan?" Reference answer: "You can get a refund within 14 days. Annual plans are refunded pro-rata. Cancel from the Billing tab first." Retrieved: chunk 1 (cancelling), chunk 2 (refund window), chunk 3 (monthly prices).',
      steps: [
        'Split the reference into facts: (1) refunds within 14 days, (2) annual plans refunded pro-rata, (3) cancel from the Billing tab.',
        'Fact 1: in chunk 2. Found.',
        'Fact 2: in no chunk. Missing.',
        'Fact 3: in chunk 1. Found.',
        '\\(\\text{context recall}\\) \\(= \\frac{2}{3}\\) \\(\\approx 0.67\\).',
        'Read it with faithfulness: if faithfulness is high but context recall is 0.67, the model behaved well, yet the answer is incomplete because retrieval missed a fact.'],
      result: 'Context recall 0.67: one of three needed facts never reached the model. Look at why the pro-rata chunk was not retrieved.' },
    pitfalls: [
      'It needs reference answers. Without a golden dataset you can only measure context precision, not recall.',
      'A vague reference answer gives vague facts. Write references as short, specific statements.',
      'Recall can be raised cheaply by retrieving more chunks, but that costs tokens and adds noise. Track precision alongside it.',
      'Average over many questions. One question with 3 facts can only score 0, 0.33, 0.67 or 1.'],
    code: '# One judge call per question (RAGAS-style)\nfacts = judge_json("Split this reference answer into short standalone facts. "\n                   "Return a JSON list of strings.", reference)\nfound = [judge(f"Context:\\n{context}\\n\\nIs this fact stated in or clearly implied by the context? "\n               f"Reply yes or no.\\nFact: {f}") for f in facts]\ncontext_recall = sum(v == "yes" for v in found) / len(facts)', lang: 'Python'
  }
};
