# KubeDojo QA report

Date: 2026-10-16. Scope: the whole app (simulator engine, playground UI, landing, blog), functionality and UI.

## Result

| Suite | What it covers | Result |
| --- | --- | --- |
| `npm run lint` | ESLint, app and scripts | clean |
| `tests/tq1.js` (new) | 55 assertion checks: shell, pipes, redirects, heredocs, quoting, kubectl lifecycle (create, scale, rollout, undo, expose, config, namespaces, apply), scheduling, docker, helm, and a 400-line token-soup fuzz | 55/55 |
| `tests/tq2.js` (new) | 12 scenarios: 3 seeds x 100 random valid operations with cluster invariants after every step, Helm lifecycle, probes, RBAC, quota, PDB drain, HPA, k3d, export, init containers, Ingress, rolling update surge | 12/12 |
| `tests/tq3.js` (new) | grammar fuzz of kubectl / docker / kind / helm2 / k3d / gcloud with real verbs, resources and flags (5 seeds x 900 commands) | clean |
| existing engine suites | 30 Node suites, blog and demo pipeline unit tests | pass |
| `scripts/qa.mjs` (new, `npm run qa`) | 159 browser checks: terminal, terminal tabs, cluster view and its animations, all six tabs, files and persistence, vi, palette, layout, reset, deep links, a layout / accessibility / contrast audit at 6 widths x light and dark x 6 routes, populated-playground audit, phone layout, site interactions, tour, export, speed, guide, keyboard tabs, animation cleanup, selection freeze regression, resize and gutter drag, stress | 159/159 |
| `scripts/ui-test.mjs`, `scripts/e2e.mjs`, `scripts/perf.mjs` | existing browser suites and the mobile performance budget | pass (home 150 KB of 160 KB) |

## Bugs found and fixed

| # | Area | Bug | Fix |
| --- | --- | --- | --- |
| 1 | Playground | **Clicking a tab changed the highlight but not the content** when text was selected in the previous view (the pane froze its content to protect selections). Regression test confirmed it fails without the fix. | Switching tabs always renders the new tab and clears the selection (`VizPane.jsx`, `store.js`) |
| 2 | Playground | `?tab=nope` in the URL crashed the whole page (React error 130, undefined view) | Tab names are validated in `applyParams` and `setViz` |
| 3 | Engine | The scheduler ignored resource requests and node capacity, so "Insufficient cpu / memory" Pending pods (a core learning scenario) could never happen | Nodes now hold 4 CPU / 16 GiB; requests are summed; `FailedScheduling` events say `Insufficient cpu` / `Insufficient memory` |
| 4 | Engine | `tr a-z A-Z` produced `Abc`; classes such as `[:upper:]` and options `-s`, `-c` were missing | `tr` rewritten with ranges, classes, `-d`, `-s`, `-c` |
| 5 | Engine | `echo x >`, `cat <` and similar crashed with an internal TypeError | Shell prints `syntax error near unexpected token` |
| 6 | Engine | `kubectl create` with no type, `create quota` with no name, `set image/env/resources` with no target, `cordon/uncordon/drain/taint` with no node printed `"undefined"` or crashed | Usage errors in the style of real kubectl |
| 7 | Engine | `kubectl expose events web` and `kubectl edit events web` crashed; `edit node` claimed the node did not exist | Clear "cannot expose / editing not supported" errors |
| 8 | Accessibility | Escape did not close the inspector | Esc closes it (not while the palette, tour, export or vi has focus) |
| 9 | Accessibility | Tab lists did not respond to arrow keys; every tab was in the Tab order | WAI-ARIA behaviour for the view tabs and terminal tabs: arrows, Home, End, roving tabindex |
| 10 | Accessibility | The terminal input had no accessible name | `aria-label="Terminal input"` |
| 11 | Accessibility | Muted text and the accent colour on the light theme were slightly under WCAG AA (4.2:1 and 4.21:1); the "Try in playground" link on code blocks was 3.2:1 after the accent change | Darker `--ink-3` and `--accent` (now 5+:1); code-block links pinned to a light colour |
| 12 | Accessibility | Scrollable tables in posts were not keyboard reachable | `tabindex=0`, `role=region` and a label on the table wrapper |
| 13 | Mobile | Header buttons below 32 px tap size (palette button shrank to 16 px, brand 20 px high) | 36 px minimum, no shrink |

## Findings not fixed

- **Slow start in headless Chrome on this machine.** Time until the terminal accepts input was about 9.7 s for the React app against 7.6 s for the original single-file prototype (both are slow here, a busy CPU without GPU; a real browser is far faster). The extra cost is in the first render and in layout of the playground. I did not find a single hot spot and made no change. Worth re-measuring on a real device; `scripts/perf.mjs --throttle` does it on a quiet machine.
- `window.confirm` is used for Reset. It works but blocks automation and looks dated; a built-in dialog would be nicer.
- Not tested: Safari and Firefox, real touch devices, screen readers, very large pod counts (stress used about 75 pods).

## Notes on the tests

- Findings 1 to 7 were found by the new tests (frozen-tab and deep-link crash by the browser suite, the rest by the fuzzers) and each has a regression check.
- The browser suite is slow (about 14 minutes) because the audit loads 54 page states; `node scripts/qa.mjs <section name>` runs one section.
- Fuzz seeds are fixed, so failures reproduce: `node tests/tq3.js 900 <seed>`.
