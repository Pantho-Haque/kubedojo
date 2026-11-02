// Programs and small helpers shared by the live parts of the home page.
import { useEffect, useRef } from 'react';
import { esc } from '../../lib/data';
import { execute, traceOf } from '../../lib/run';

export { STARTER } from '../../lib/starter';
import { STARTER } from '../../lib/starter';

// hero scenarios: real programs the visitor can switch between and edit
export const SCENARIOS = [
  { id: 'escape', label: 'escape', file: 'escape.go', src: STARTER },
  { id: 'slices', label: 'slices', file: 'slices.go', src: 'package main\n\nimport "fmt"\n\nfunc main() {\n\ta := []int{10, 20, 30}\n\tb := a[:2]\n\tb[0] = 99        // a sees this too\n\tb = append(b, 7) // still room: writes into a\'s array\n\tb = append(b, 8) // full: b moves to a new array\n\tb[0] = -1        // a no longer sees this\n\tfmt.Println(a, b)\n}\n' },
  { id: 'goroutines', label: 'goroutines', file: 'workers.go', src: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tjobs := make(chan int, 2)\n\tdone := make(chan bool)\n\tgo func() {\n\t\tfor j := range jobs {\n\t\t\tfmt.Println("worker got", j)\n\t\t}\n\t\tdone <- true\n\t}()\n\tfor i := 1; i <= 3; i++ {\n\t\tjobs <- i\n\t}\n\tclose(jobs)\n\t<-done\n}\n' },
  { id: 'gc', label: 'garbage collector', file: 'list.go', src: 'package main\n\nimport (\n\t"fmt"\n\t"runtime"\n)\n\ntype Node struct {\n\tVal  int\n\tNext *Node\n}\n\nfunc main() {\n\thead := &Node{1, &Node{2, &Node{3, nil}}}\n\thead.Next = nil // 2 and 3 are now unreachable\n\truntime.GC()\n\tfmt.Println(head.Val)\n}\n' },
];
export const PANIC_SRC = 'package main\n\nimport "fmt"\n\nfunc last(s []int) int {\n\treturn s[len(s)]\n}\n\nfunc main() {\n\tnums := []int{4, 8, 15}\n\tfmt.Println(last(nums))\n}\n';

// many demos start together on this page; if one hits the watchdog while others run, try it once more
export async function traceFor(src: string, owner: string) {
  let r = await execute(src, { owner });
  if (!traceOf(r) && r.code === 'STOPPED') r = await execute(src, { owner });
  return { r, t: traceOf(r) };
}

type Narration = { color: string; label?: string; kind: string; html: string };
export const capHTML = (n: Narration) => '<div class="frag-cap"><span class="chip kind" style="color:' + n.color + '"><span class="dot"></span>' + esc(n.label || n.kind) + '</span><span class="text">' + n.html + '</span></div>';

/** Source lines from..to with line numbers, syntax colours, optional inline values and an error line. */
export function codeHTML(highlight: (l: string) => string, src: string, from: number, to: number, ghosts = new Map<number, string>(), errLine = 0) {
  return '<pre class="frag-code">' + src.split('\n').slice(from - 1, to).map((l, k) => {
    const n = from + k;
    return '<span class="fl' + (n === errLine ? ' err' : '') + '"><span class="fn">' + n + '</span>' + highlight(l) + (ghosts.get(n) ? '<span class="ghost">  // ' + ghosts.get(n) + '</span>' : '') + '</span>';
  }).join('\n') + '</pre>';
}

/** Run `fn` once, when the element is about to scroll into view. */
export function useLazy<T extends Element>(fn: () => void) {
  const ref = useRef<T>(null), cb = useRef(fn);
  useEffect(() => { cb.current = fn; });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); cb.current(); } }, { rootMargin: '300px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
