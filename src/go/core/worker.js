// Runs one Go program off the main thread and posts back a packed trace.
import { GoInterpreter, GothikTrace } from './engine.js';
self.onmessage = (e) => {
  const result = GoInterpreter.run(e.data.source, e.data.options || { seed: e.data.seed });
  const packedTrace = GothikTrace.pack(result.states);
  delete result.states;
  self.postMessage({ ...result, packedTrace });
};
