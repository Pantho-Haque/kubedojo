import { n as Logo, r as require_dist } from "../entry-server.js";
import { a as store, c as selText, i as SYSTEM_NS, l as PG, n as TerminalPane, o as useStore, r as Icon, s as useStoreSel, t as VizPane } from "./viz-DrS-GmLQ.js";
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/playground/Header.jsx
var import_dist = require_dist();
var pad = (n) => String(n).padStart(2, "0");
var MOD = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "") ? "⌘" : "Ctrl+";
function Header() {
	useStore();
	const sim = store.sim;
	const cur = sim.kubeconfig.current;
	const cl = sim.currentCluster();
	const prod = cl && cl.tool === "gke";
	const t = Math.floor(sim.clock);
	return /* @__PURE__ */ jsxs("header", { children: [
		/* @__PURE__ */ jsx("button", {
			id: "sidebtn",
			className: "ibtn",
			title: "Show or hide the guide",
			"aria-label": "Show or hide the guide",
			"aria-pressed": !store.noside,
			onClick: () => store.toggleSide(),
			children: /* @__PURE__ */ jsx(Icon, { name: "sidebar" })
		}),
		/* @__PURE__ */ jsxs(import_dist.Link, {
			to: "/",
			className: "brand",
			title: "Back to the KubeDojo home page",
			children: [/* @__PURE__ */ jsx(Logo, { size: 20 }), /* @__PURE__ */ jsx("b", { children: "KubeDojo" })]
		}),
		/* @__PURE__ */ jsx("span", {
			id: "ctxbadge",
			className: "ctx " + (!cur ? "none" : prod ? "prod" : "local"),
			role: "status",
			title: "The kubectl context every command goes to",
			children: cur ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
				prod ? /* @__PURE__ */ jsx("span", {
					className: "ctx-warn",
					children: "PRODUCTION"
				}) : null,
				/* @__PURE__ */ jsx("span", {
					className: "ctx-k",
					children: "context"
				}),
				/* @__PURE__ */ jsx("b", { children: cur })
			] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
				className: "ctx-k",
				children: "context"
			}), /* @__PURE__ */ jsx("b", { children: "none" })] })
		}),
		/* @__PURE__ */ jsx("span", { className: "sp" }),
		/* @__PURE__ */ jsxs("span", {
			id: "timebox",
			title: "Simulated time: pods take simulated seconds to start",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "live-dot",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ jsx("span", {
					id: "clock",
					children: `sim ${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`
				}),
				/* @__PURE__ */ jsx("span", {
					id: "speed",
					className: "seg",
					role: "radiogroup",
					"aria-label": "Simulation speed",
					children: [
						1,
						2,
						4,
						8
					].map((v) => /* @__PURE__ */ jsxs("button", {
						type: "button",
						role: "radio",
						"aria-checked": store.speed === v,
						className: store.speed === v ? "on" : "",
						onClick: () => store.setSpeed(v),
						children: [v, "×"]
					}, v))
				})
			]
		}),
		/* @__PURE__ */ jsxs("button", {
			id: "palbtn",
			className: "pal",
			onClick: () => store.openPalette(),
			title: `Search commands and actions (${MOD}⇧P)`,
			children: [
				/* @__PURE__ */ jsx(Icon, {
					name: "search",
					size: 15
				}),
				/* @__PURE__ */ jsx("span", { children: "Commands" }),
				/* @__PURE__ */ jsxs("kbd", { children: [MOD, "⇧P"] })
			]
		}),
		/* @__PURE__ */ jsxs("span", {
			id: "helpbox",
			children: [
				/* @__PURE__ */ jsx("button", {
					id: "tourbtn",
					className: "ibtn",
					title: "A 2-minute walkthrough of every part of the page",
					"aria-label": "Start the tour",
					onClick: () => store.startTour(0),
					children: /* @__PURE__ */ jsx(Icon, { name: "play" })
				}),
				/* @__PURE__ */ jsx("button", {
					id: "exportbtn",
					className: "ibtn",
					title: "Build a bash script that recreates this environment on a real machine",
					"aria-label": "Export a setup script",
					onClick: () => {
						store.exportOpen = true;
						store.bump();
					},
					children: /* @__PURE__ */ jsx(Icon, { name: "download" })
				}),
				/* @__PURE__ */ jsx("button", {
					id: "helpbtn",
					className: "ibtn",
					title: "Print the list of supported commands",
					"aria-label": "Help: list commands",
					onClick: () => store.runInTerm("help", true),
					children: /* @__PURE__ */ jsx(Icon, { name: "help" })
				}),
				/* @__PURE__ */ jsx("button", {
					id: "resetbtn",
					className: "ibtn",
					title: "Throw away the simulated world and start over (your files are kept)",
					"aria-label": "Reset the simulated world",
					onClick: () => {
						if (window.confirm("Throw away the simulated clusters and start over?\n\nYour files are kept (they live in this browser).")) store.reset();
					},
					children: /* @__PURE__ */ jsx(Icon, { name: "reset" })
				})
			]
		})
	] });
}
//#endregion
//#region src/playground/Sidebar.jsx
function Sidebar() {
	const [q, setQ] = useState("");
	const words = q.toLowerCase().split(/\s+/).filter(Boolean);
	const sections = useMemo(() => PG.GUIDE.map((sec) => ({
		sec,
		items: words.length ? sec.items.filter(([label, cmd]) => words.every((w) => (label + " " + cmd + " " + sec.t).toLowerCase().includes(w))) : sec.items
	})).filter((x) => x.items.length), [q]);
	return /* @__PURE__ */ jsxs("aside", {
		id: "side",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "hd",
				children: [
					"Click a command to put it on the prompt (multi-line ones run). ",
					/* @__PURE__ */ jsx("b", { children: "▶" }),
					" runs it. Any order: each command stands on its own."
				]
			}),
			/* @__PURE__ */ jsx("input", {
				className: "gfilter",
				type: "search",
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Filter the guide…",
				"aria-label": "Filter the guide",
				spellCheck: false,
				autoComplete: "off"
			}),
			/* @__PURE__ */ jsxs("div", {
				id: "guide",
				children: [sections.map(({ sec, items }) => /* @__PURE__ */ jsxs("details", {
					open: words.length ? true : sec.open || void 0,
					children: [/* @__PURE__ */ jsx("summary", { children: sec.t }), items.map(([label, cmd]) => {
						const multi = cmd.includes("\n");
						const n = cmd.split("\n").length;
						return /* @__PURE__ */ jsxs("div", {
							className: "gi",
							children: [/* @__PURE__ */ jsx("div", {
								className: "gl",
								children: label
							}), /* @__PURE__ */ jsxs("div", {
								className: "gc",
								children: [/* @__PURE__ */ jsx("code", {
									onClick: (e) => {
										if (selText()) return;
										store.setPane("term");
										store.runInTerm(cmd, e.shiftKey);
									},
									children: multi ? cmd.split("\n")[0] + (n > 1 ? "  … (" + n + " lines)" : "") : cmd
								}), /* @__PURE__ */ jsx("button", {
									className: "run",
									title: "run",
									"aria-label": `Run: ${label}`,
									onClick: () => {
										store.setPane("term");
										store.runInTerm(cmd, true);
									},
									children: "▶"
								})]
							})]
						}, label + cmd);
					})]
				}, sec.t + (words.length ? "*" : ""))), !sections.length && /* @__PURE__ */ jsxs("p", {
					className: "gnone",
					children: [
						"No command matches “",
						q,
						"”."
					]
				})]
			})
		]
	});
}
var Sidebar_default = memo(Sidebar);
//#endregion
//#region src/playground/Gutter.jsx
var LIMITS = {
	side: [200, 520],
	viz: [340, 1100]
};
function Gutter({ which }) {
	const ref = useRef(null);
	const [min, max] = LIMITS[which];
	const current = () => {
		const el = ref.current.closest("main").querySelector(which === "side" ? "#side" : "#vizpane");
		return Math.round(el.getBoundingClientRect().width);
	};
	const set = (w) => store.setLayout({ [which]: Math.max(min, Math.min(max, Math.round(w))) });
	const onPointerDown = (e) => {
		if (e.button !== 0) return;
		e.preventDefault();
		const g = ref.current;
		g.setPointerCapture(e.pointerId);
		const rect = g.closest("main").getBoundingClientRect();
		document.body.style.userSelect = "none";
		const move = (ev) => set(which === "side" ? ev.clientX - rect.left : rect.right - ev.clientX);
		const up = () => {
			g.removeEventListener("pointermove", move);
			g.removeEventListener("pointerup", up);
			document.body.style.userSelect = "";
		};
		g.addEventListener("pointermove", move);
		g.addEventListener("pointerup", up);
	};
	const onKeyDown = (e) => {
		const step = e.shiftKey ? 64 : 16;
		const sign = which === "side" ? 1 : -1;
		const w = store.layout[which] || current();
		if (e.key === "ArrowRight") {
			e.preventDefault();
			set(w + sign * step);
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			set(w - sign * step);
		} else if (e.key === "Home") {
			e.preventDefault();
			set(min);
		} else if (e.key === "End") {
			e.preventDefault();
			set(max);
		} else if ((e.key === "Enter" || e.key === " ") && which === "side") {
			e.preventDefault();
			store.toggleSide();
		}
	};
	return /* @__PURE__ */ jsx("div", {
		ref,
		className: "gutter " + which,
		role: "separator",
		"aria-orientation": "vertical",
		"aria-label": which === "side" ? "Resize the guide" : "Resize the cluster view",
		"aria-valuemin": min,
		"aria-valuemax": max,
		"aria-valuenow": store.layout[which] || void 0,
		tabIndex: 0,
		title: "Drag to resize, double-click to reset",
		onPointerDown,
		onKeyDown,
		onDoubleClick: () => store.setLayout({ [which]: LAYOUT_RESET[which] })
	});
}
var LAYOUT_RESET = {
	side: 310,
	viz: 0
};
//#endregion
//#region src/playground/StatusBar.jsx
function StatusBar() {
	useStore();
	const sim = store.sim;
	const cl = store.viewCluster();
	const cur = sim.currentCluster();
	let run = 0, pend = 0, fail = 0, done = 0;
	if (cl) for (const p of cl.res.pods) {
		if (SYSTEM_NS.includes(p.metadata.namespace) || p.metadata.deletionTimestamp) continue;
		const st = cl.podStatus(p);
		if (st === "Running") run++;
		else if (st === "Completed") done++;
		else if (/Err|Crash|Error|BackOff|OOM|Unknown|Evicted/.test(st)) fail++;
		else pend++;
	}
	const nodes = cl ? cl.nodes : [];
	const down = nodes.filter((n) => !n.ready).length;
	return /* @__PURE__ */ jsxs("footer", {
		id: "statusbar",
		role: "contentinfo",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "sb-ctx " + (cur && cur.tool === "gke" ? "prod" : ""),
				title: "The cluster you are looking at",
				children: cl ? `${cl.tool} · ${cl.id.length > 26 ? cl.id.slice(0, 24) + "…" : cl.id}` : "no cluster"
			}),
			cl && /* @__PURE__ */ jsx("span", {
				className: "sb-sep",
				"aria-hidden": "true"
			}),
			cl && /* @__PURE__ */ jsxs("span", {
				className: "sb-n " + (down ? "bad" : ""),
				title: "Nodes ready",
				children: [
					/* @__PURE__ */ jsx("i", { className: "sb-dot ok" }),
					nodes.length - down,
					"/",
					nodes.length,
					" nodes"
				]
			}),
			cl && /* @__PURE__ */ jsxs("span", {
				className: "sb-n ok",
				title: "Pods running",
				children: [
					/* @__PURE__ */ jsx("i", { className: "sb-dot ok" }),
					run,
					" running"
				]
			}),
			cl && /* @__PURE__ */ jsxs("span", {
				className: "sb-n " + (pend ? "warn" : "dim"),
				title: "Pods starting or pending",
				children: [
					/* @__PURE__ */ jsx("i", { className: "sb-dot warn" }),
					pend,
					" pending"
				]
			}),
			cl && /* @__PURE__ */ jsxs("span", {
				className: "sb-n " + (fail ? "bad" : "dim"),
				title: "Pods failing (ImagePullBackOff, CrashLoopBackOff, OOMKilled…)",
				children: [
					/* @__PURE__ */ jsx("i", { className: "sb-dot bad" }),
					fail,
					" failing"
				]
			}),
			cl && done > 0 && /* @__PURE__ */ jsxs("span", {
				className: "sb-n dim",
				title: "Pods completed",
				children: [
					/* @__PURE__ */ jsx("i", { className: "sb-dot done" }),
					done,
					" done"
				]
			}),
			/* @__PURE__ */ jsx("span", { className: "sp" }),
			/* @__PURE__ */ jsxs("span", {
				className: "sb-keys",
				children: [
					/* @__PURE__ */ jsx("kbd", { children: "Tab" }),
					" accept suggestion ",
					/* @__PURE__ */ jsx("kbd", { children: "Ctrl-C" }),
					" stop ",
					/* @__PURE__ */ jsxs("kbd", { children: [MOD, "⇧P"] }),
					" commands"
				]
			}),
			/* @__PURE__ */ jsx("span", {
				className: "sr-only",
				"aria-live": "polite",
				children: fail ? `${fail} pods failing` : ""
			})
		]
	});
}
//#endregion
//#region src/playground/MobileNav.jsx
function MobileNav() {
	useStore();
	return /* @__PURE__ */ jsx("nav", {
		id: "mobilenav",
		"aria-label": "Panes",
		children: [
			[
				"guide",
				"Guide",
				"book"
			],
			[
				"term",
				"Terminal",
				"terminal"
			],
			[
				"viz",
				"Cluster",
				"cluster"
			]
		].map(([id, label, icon]) => /* @__PURE__ */ jsxs("button", {
			type: "button",
			className: store.mobilePane === id ? "on" : "",
			"aria-current": store.mobilePane === id ? "page" : void 0,
			onClick: () => store.setPane(id),
			children: [/* @__PURE__ */ jsx(Icon, {
				name: icon,
				size: 20
			}), /* @__PURE__ */ jsx("span", { children: label })]
		}, id))
	});
}
//#endregion
//#region src/playground/Palette.jsx
var VIEWS = [
	["cluster", "Cluster"],
	["docker", "Docker"],
	["config", "Config & access"],
	["helm", "Helm"],
	["files", "Files"],
	["log", "Events"]
];
function items(navigate) {
	const a = [];
	const act = (label, hint, run, icon) => a.push({
		kind: "action",
		group: "Action",
		label,
		hint,
		run,
		icon
	});
	act("Start the guided tour", "", () => store.startTour(0), "play");
	act("Export this cluster as a setup script", "", () => {
		store.exportOpen = true;
		store.bump();
	}, "download");
	act("New terminal tab", "", () => store.addTerm(), "plus");
	act("Clear the terminal", "⌘K", () => {
		if (store.active) store.active.clear();
	}, "clear");
	act("Show or hide the guide", "", () => store.toggleSide(), "sidebar");
	act("Reset the simulated world", "", () => {
		if (window.confirm("Throw away the simulated clusters and start over?\n\nYour files are kept (they live in this browser).")) store.reset();
	}, "reset");
	act("Reset the pane sizes", "", () => store.resetLayout(), "sidebar");
	act("List supported commands (help)", "", () => store.runInTerm("help", true), "help");
	act("Go to the KubeDojo home page", "", () => navigate("/"), "home");
	act("Read the guides (blog)", "", () => navigate("/blog"), "book");
	for (const [id, label] of VIEWS) a.push({
		kind: "action",
		group: "View",
		label: "Show " + label,
		hint: "",
		icon: id === "files" ? "file" : "cluster",
		run: () => {
			store.setViz(id);
			store.setPane("viz");
		}
	});
	for (const sec of PG.GUIDE) for (const [label, cmd] of sec.items) a.push({
		kind: "command",
		group: sec.t.replace(/^\w+ · /, ""),
		label,
		cmd,
		icon: "terminal"
	});
	return a;
}
var rank = (q, it) => {
	const hay = (it.label + " " + (it.cmd || "") + " " + it.group).toLowerCase();
	let s = 0;
	for (const w of q) {
		const i = hay.indexOf(w);
		if (i < 0) return -1;
		s += i + (it.label.toLowerCase().includes(w) ? 0 : 40);
	}
	return s;
};
function Palette() {
	const navigate = (0, import_dist.useNavigate)();
	const all = useMemo(() => items(navigate), [navigate]);
	const [q, setQ] = useState("");
	const [sel, setSel] = useState(0);
	const list = useRef(null);
	const words = q.toLowerCase().split(/\s+/).filter(Boolean);
	const shown = useMemo(() => {
		if (!words.length) return all.filter((x) => x.kind === "action").concat(all.filter((x) => x.kind === "command").slice(0, 14));
		return all.map((x) => [rank(words, x), x]).filter(([r]) => r >= 0).sort((x, y) => x[0] - y[0]).slice(0, 40).map(([, x]) => x);
	}, [q, all]);
	useEffect(() => {
		setSel(0);
	}, [q]);
	useEffect(() => {
		const el = list.current && list.current.children[sel];
		if (el) el.scrollIntoView({ block: "nearest" });
	}, [sel]);
	const choose = (it, run) => {
		store.closePalette();
		if (it.kind === "action") {
			it.run();
			return;
		}
		store.setPane("term");
		store.runInTerm(it.cmd, run || it.cmd.includes("\n"));
	};
	const onKey = (e) => {
		if (e.key === "Escape") {
			e.preventDefault();
			store.closePalette();
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			setSel((s) => Math.min(shown.length - 1, s + 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSel((s) => Math.max(0, s - 1));
		} else if (e.key === "Enter" && shown[sel]) {
			e.preventDefault();
			choose(shown[sel], e.shiftKey);
		}
	};
	return /* @__PURE__ */ jsx("div", {
		id: "palette",
		onMouseDown: (e) => {
			if (e.target === e.currentTarget) store.closePalette();
		},
		children: /* @__PURE__ */ jsxs("div", {
			className: "pal-card",
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Command palette",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "pal-in",
					children: [/* @__PURE__ */ jsx(Icon, {
						name: "search",
						size: 16
					}), /* @__PURE__ */ jsx("input", {
						autoFocus: true,
						value: q,
						onChange: (e) => setQ(e.target.value),
						onKeyDown: onKey,
						placeholder: "Search guide commands and actions…",
						spellCheck: false,
						autoComplete: "off",
						role: "combobox",
						"aria-expanded": "true",
						"aria-controls": "pal-list",
						"aria-activedescendant": shown[sel] ? "pal-" + sel : void 0
					})]
				}),
				/* @__PURE__ */ jsxs("ul", {
					id: "pal-list",
					ref: list,
					role: "listbox",
					children: [shown.map((it, i) => /* @__PURE__ */ jsxs("li", {
						id: "pal-" + i,
						role: "option",
						"aria-selected": i === sel,
						className: i === sel ? "on" : "",
						onMouseMove: () => setSel(i),
						onClick: () => choose(it),
						children: [
							/* @__PURE__ */ jsx(Icon, {
								name: it.icon,
								size: 15
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "pl-main",
								children: [/* @__PURE__ */ jsx("span", {
									className: "pl-label",
									children: it.label
								}), it.cmd && /* @__PURE__ */ jsxs("code", { children: [it.cmd.split("\n")[0], it.cmd.includes("\n") ? " …" : ""] })]
							}),
							/* @__PURE__ */ jsx("span", {
								className: "pl-group",
								children: it.hint || it.group
							})
						]
					}, it.kind + it.label + (it.cmd || ""))), !shown.length && /* @__PURE__ */ jsxs("li", {
						className: "pal-empty",
						role: "presentation",
						children: [
							"Nothing matches “",
							q,
							"”. Try a tool name: kind, helm, rbac, probe…"
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "pal-foot",
					children: [
						/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx("kbd", { children: "↑" }),
							/* @__PURE__ */ jsx("kbd", { children: "↓" }),
							" move"
						] }),
						/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("kbd", { children: "Enter" }), " put on the prompt"] }),
						/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx("kbd", { children: "Shift" }),
							"+",
							/* @__PURE__ */ jsx("kbd", { children: "Enter" }),
							" run it"
						] }),
						/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("kbd", { children: "Esc" }), " close"] })
					]
				})
			]
		})
	});
}
//#endregion
//#region src/playground/tourSteps.js
var TOUR = [
	{
		title: "Welcome to KubeDojo 👋",
		center: true,
		html: `A <b>safe simulator</b> of <code>kind</code>, <code>k3d</code>, <code>docker</code>, <code>kubectl</code> and <code>helm 2</code>. Nothing you type touches your computer or any real cluster: it all lives in this page.<br><br>You type commands on the <b>left</b>; the <b>right</b> redraws after every one. This tour (about 2 minutes) shows what is where. Use <b>←</b> <b>→</b> or the buttons; <b>Esc</b> leaves.`
	},
	{
		sel: "#ctxbadge",
		title: "Which cluster am I talking to?",
		html: `<code>kubectl</code> sends every command to the <b>current context</b>. It is always shown here.<ul><li><b style="color:#ff9aa4">Red PRODUCTION</b>: a fake cloud cluster you start in, on purpose. Practise looking before you type.</li><li><b style="color:#3ddc97">Green</b>: a local lab cluster (kind / k3d).</li></ul>Switch with <code>kubectl config use-context NAME</code>. You will create your first lab cluster in a moment.`
	},
	{
		sel: "#timebox",
		title: "Simulated time",
		html: `Pods take a few seconds to start, nodes take a moment to be declared down, and so on. This is the <b>simulated clock</b>. The speed box makes it run <b>1×, 2×, 4× or 8×</b> faster. Some commands wait for it, like <code>kubectl rollout status</code>.`
	},
	{
		sel: "#side",
		open: "side",
		title: "The guide: ~240 ready-made commands",
		html: `Grouped like the knowledge-base guides: kind &amp; k3d, namespaces, deploying, probes, ingress, images &amp; Dockerfiles, docker, Helm, RBAC, shell tools…<ul><li><b>Click</b> a command to put it on the prompt (then press Enter).</li><li><b>▶</b> runs it right away. Multi-line ones (YAML) always run.</li><li>Any order: every command stands on its own. Later ones assume earlier ones, e.g. create a cluster first.</li></ul>`
	},
	{
		sel: "#termpane",
		title: "The terminal",
		html: `Type real commands: <code>kind</code>, <code>k3d</code>, <code>docker</code>, <code>kubectl</code> (also <code>kc</code>, <code>k</code>), <code>helm2</code>, plus <code>ls cat grep awk jq watch curl</code>… Pipes, <code>$(…)</code>, loops and <code>cat &gt; f &lt;&lt;'EOF'</code> heredocs work; you can <b>paste multi-line YAML</b> straight in.<ul><li><b>↑ ↓</b> history · <b>Ctrl-C</b> stops a command (or copies a selection) · <b>Ctrl-L</b> / <code>clear</code> clears · scroll up to read old output</li><li>Grey text is a <b>suggestion</b> from your history (and the guide): <b>Tab</b> or <b>→</b> accepts it all, <b>Option/Ctrl + →</b> one word at a time. With no suggestion, <b>Tab</b> completes names</li><li><code>vi FILE</code> opens a full-screen editor: <b>i</b> to type, <b>Esc</b>, then <b>:wq</b> to save and quit (<b>:q!</b> to leave without saving)</li><li><code>help</code> lists everything; <code>sim help</code> has fake load, crashing a pod, speed</li></ul>`
	},
	{
		sel: "#tabs",
		title: "Several terminals, one world",
		html: `Open up to <b>4 tabs</b> with <b>＋</b>. They share the same clusters. Typical use: leave <code>kubectl port-forward</code> running in tab 1 and <code>curl localhost:8081</code> from tab 2.<br><br>Run <code>kubectl exec -it deploy/web -n web -- sh</code> and the prompt becomes <code>root@pod:/#</code> (you are <i>inside</i> the pod). <code>exit</code> brings you back.`
	},
	{
		sel: "#vizbody",
		tab: "cluster",
		title: "The Cluster view: what is running",
		html: `Redraws after every command. From the top:<ul><li><b>Your machine</b>: published ports and the path of your last <code>curl</code></li><li><b>Nodes</b> (docker containers): labels, taints, red when down</li><li><b>Pod chips</b>: <span style="color:#3ddc97">green</span> running · <span style="color:#f4b740">amber</span> starting · <span style="color:#ff5c6c">red</span> failing · grey done. The coloured left edge = namespace</li><li><b>Workloads</b>, <b>Services</b> (hover one to light its pods), <b>Ingress</b></li></ul><b>Click anything</b> to see <code>describe</code> or YAML. The chips filter namespaces.`
	},
	{
		sel: "#viztabs",
		title: "Five more views",
		html: `<ul><li><b>Docker</b>: containers (kind/k3d nodes are containers!), images, networks, registry contents</li><li><b>Config &amp; access</b>: your kubeconfig contexts, and an <b>RBAC matrix</b> of who may do what, per namespace</li><li><b>Helm</b>: Tiller's health and each release's revisions</li><li><b>Files</b>: your folders and files</li><li><b>Events</b>: what the cluster reports, newest first</li></ul>`
	},
	{
		sel: "#vizbody",
		tab: "files",
		title: "Files: your own virtual disk",
		html: `<code>~</code> is your home. <code>~/myapp</code> is the Helm chart from the guide. Everything you create with <code>mkdir</code>, <code>cat &gt; file</code> or the <b>＋</b> box appears here; click a file to edit it, then <b>Save</b>.<ul><li>Used by <code>kubectl apply -f</code>, <code>kind create cluster --config</code>, <code>docker build</code>, <code>helm2 install ./myapp</code></li><li><b>Saved in this browser</b> and still here after a reload. <b>Restore example chart</b> / <b>Wipe all my files</b> are at the bottom.</li><li><code>kubectl edit</code> opens its YAML here, with <b>Apply / Cancel</b> in a banner above the terminal.</li></ul>`
	},
	{
		sel: "#helpbox",
		tab: "cluster",
		title: "help and Reset",
		html: `<b>Commands</b> (<kbd>Ctrl/⌘ Shift P</kbd>) searches all ~240 guide commands and every action at once. The icons: <b>▶</b> this tour, <b>⇩</b> export a script, <b>?</b> print the command list, <b>↻</b> Reset, which throws away the simulated clusters, containers and releases and starts a fresh world (<b>your files are kept</b>). Drag the dividers between panes to resize them. <br><br>The <b>⇩ export</b> icon reads the cluster of your current context (nodes, namespaces, Deployments, Services, Secrets…) and writes a bash script (<code>setup.sh</code>) that builds the same cluster for real on your computer with kind or k3d. Test here first, then export. Press the <b>▶</b> icon (top right) to see this tour again, or type <code>tour</code>.`
	},
	{
		center: true,
		title: "Try it now ✨",
		html: `Want to see it move? The button below runs a 6-command demo in the terminal: it <b>creates a kind cluster</b>, a namespace, a 2-pod nginx Deployment and a Service, then lists the pods. Watch the Cluster view fill in.<br><br>After that, open the guide (left), pick a section and start playing. Go wrong on purpose; that is what it is for. Everything is one <b>Reset</b> away.`,
		demo: true
	}
];
var DEMO = [
	"kubectl config current-context",
	"kind create cluster --name local-cluster-1",
	"kubectl create namespace web",
	"kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web",
	"kubectl expose deployment web --port=80 -n web",
	"kubectl get pods -n web -o wide"
];
//#endregion
//#region src/playground/Tour.jsx
function Tour() {
	useStore();
	const i = store.tourIndex;
	const active = i >= 0;
	const st = active ? TOUR[Math.min(i, TOUR.length - 1)] : null;
	const card = useRef(null);
	const [layout, setLayout] = useState(null);
	const place = () => {
		const c = card.current;
		if (!c || !st) return;
		const vw = window.innerWidth, vh = window.innerHeight, cw = c.offsetWidth, ch = c.offsetHeight;
		const tgt = st.sel ? document.querySelector(st.sel) : null;
		if (!tgt || st.center || !tgt.offsetParent) {
			setLayout({
				spot: { display: "none" },
				left: Math.max(12, (vw - cw) / 2),
				top: Math.max(12, (vh - ch) / 2.4)
			});
			return;
		}
		const r = tgt.getBoundingClientRect();
		const pad = 5;
		const gap = 16;
		let x, y;
		if (r.right + gap + cw < vw) {
			x = r.right + gap;
			y = r.top;
		} else if (r.left - gap - cw > 0) {
			x = r.left - gap - cw;
			y = r.top;
		} else if (r.bottom + gap + ch < vh) {
			x = r.left;
			y = r.bottom + gap;
		} else if (r.top - gap - ch > 0) {
			x = r.left;
			y = r.top - gap - ch;
		} else {
			x = Math.max(12, r.left + 20);
			y = Math.max(12, r.bottom - ch - 20);
		}
		if (r.width > vw * .35 && r.height > vh * .5 && r.right + gap + cw >= vw) {
			x = Math.max(12, r.right - cw - 24);
			y = Math.max(12, r.bottom - ch - 24);
		}
		setLayout({
			spot: {
				display: "block",
				left: r.left - pad,
				top: r.top - pad,
				width: r.width + 10,
				height: r.height + 10
			},
			left: Math.min(Math.max(12, x), vw - cw - 12),
			top: Math.min(Math.max(12, y), vh - ch - 12)
		});
	};
	useLayoutEffect(() => {
		if (!active) {
			setLayout(null);
			return;
		}
		if (st.open === "side" && store.noside) {
			store.noside = false;
			store.bump();
		}
		if (st.tab && store.vizTab !== st.tab) {
			store.vizTab = st.tab;
			store.bump();
		}
		let r2;
		const r1 = requestAnimationFrame(() => {
			place();
			r2 = requestAnimationFrame(place);
		});
		const onResize = () => place();
		window.addEventListener("resize", onResize);
		return () => {
			cancelAnimationFrame(r1);
			cancelAnimationFrame(r2);
			window.removeEventListener("resize", onResize);
		};
	}, [i]);
	useEffect(() => {
		if (!active) return;
		const onKey = (e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				store.endTour();
			} else if (e.key === "ArrowRight" || e.key === "Enter") {
				e.preventDefault();
				next();
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				go(i - 1);
			}
		};
		document.addEventListener("keydown", onKey, true);
		return () => document.removeEventListener("keydown", onKey, true);
	});
	const go = (n) => {
		if (n >= TOUR.length) store.endTour();
		else store.startTour(Math.max(0, n));
	};
	const next = () => go(i + 1);
	return /* @__PURE__ */ jsx("div", {
		id: "tour",
		hidden: !active,
		children: active && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
			className: "tour-spot",
			style: layout ? layout.spot : { display: "none" }
		}), /* @__PURE__ */ jsxs("div", {
			className: "tour-card",
			ref: card,
			style: layout ? {
				left: layout.left,
				top: layout.top
			} : { visibility: "hidden" },
			children: [
				/* @__PURE__ */ jsx("h3", { dangerouslySetInnerHTML: { __html: st.title } }),
				/* @__PURE__ */ jsx("div", {
					className: "tb",
					dangerouslySetInnerHTML: { __html: st.html }
				}),
				/* @__PURE__ */ jsx("div", {
					className: "tour-dots",
					children: TOUR.map((_, k) => /* @__PURE__ */ jsx("i", { className: k <= i ? "on" : "" }, k))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "tour-foot",
					children: [
						/* @__PURE__ */ jsxs("span", {
							className: "n",
							children: [
								i + 1,
								" of ",
								TOUR.length
							]
						}),
						/* @__PURE__ */ jsx("button", {
							id: "tour-skip",
							onClick: () => store.endTour(),
							children: "Skip"
						}),
						/* @__PURE__ */ jsx("button", {
							id: "tour-back",
							style: { visibility: i === 0 ? "hidden" : "visible" },
							onClick: () => go(i - 1),
							children: "← Back"
						}),
						st.demo && /* @__PURE__ */ jsx("button", {
							id: "tour-demo",
							className: "demo",
							onClick: () => {
								store.endTour();
								store.vizTab = "cluster";
								store.bump();
								store.runInTerm(DEMO.join("\n"), true);
							},
							children: "▶ Run the demo"
						}),
						/* @__PURE__ */ jsx("button", {
							id: "tour-next",
							className: "go",
							onClick: next,
							children: i === TOUR.length - 1 ? "Finish" : "Next →"
						})
					]
				})
			]
		})] })
	});
}
//#endregion
//#region src/playground/ExportModal.jsx
function ExportModal() {
	const sim = store.sim;
	const cl = sim.currentCluster();
	const defaults = useMemo(() => PG.buildScript(sim, {}).stats.defaults || {
		tool: "kind",
		name: ""
	}, [sim]);
	const [tool, setTool] = useState(defaults.tool);
	const [name, setName] = useState(defaults.name);
	const [waits, setWaits] = useState(true);
	const [strict, setStrict] = useState(true);
	const [secrets, setSecrets] = useState(true);
	const built = useMemo(() => PG.buildScript(sim, {
		tool,
		name: name.trim() || void 0,
		waits,
		strict,
		secrets
	}), [
		sim,
		tool,
		name,
		waits,
		strict,
		secrets
	]);
	const [text, setText] = useState(built.script);
	const [msg, setMsg] = useState("");
	const ta = useRef(null);
	useEffect(() => {
		setText(built.script);
		setMsg("");
	}, [built]);
	const close = () => {
		store.exportOpen = false;
		store.bump();
		if (store.active) store.active.focus();
	};
	useEffect(() => {
		const k = (e) => {
			if (e.key === "Escape") close();
		};
		document.addEventListener("keydown", k, true);
		return () => document.removeEventListener("keydown", k, true);
	}, []);
	const st = built.stats;
	const copy = () => {
		ta.current.select();
		let ok = false;
		try {
			ok = document.execCommand("copy");
		} catch (er) {}
		if (!ok && navigator.clipboard) navigator.clipboard.writeText(ta.current.value).then(() => {}, () => {});
		setMsg(" copied ✓");
	};
	const download = () => {
		const a = document.createElement("a");
		a.href = URL.createObjectURL(new Blob([text], { type: "text/x-shellscript" }));
		a.download = "setup.sh";
		document.body.appendChild(a);
		a.click();
		a.remove();
		setTimeout(() => URL.revokeObjectURL(a.href), 2e3);
		setMsg(" saved as setup.sh (run: bash setup.sh)");
	};
	return /* @__PURE__ */ jsx("div", {
		id: "export",
		onClick: (e) => {
			if (e.target === e.currentTarget) close();
		},
		children: /* @__PURE__ */ jsxs("div", {
			className: "ex-card",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "ex-h",
					children: [/* @__PURE__ */ jsx("b", { children: "⇩ Script for a real machine" }), /* @__PURE__ */ jsx("button", {
						id: "ex-x",
						onClick: close,
						children: "Close ✕"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "ex-note",
					id: "ex-src",
					children: cl ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
						"Built from the cluster in your ",
						/* @__PURE__ */ jsx("b", { children: "current context" }),
						", ",
						/* @__PURE__ */ jsx("code", { children: cl.entry }),
						" (",
						cl.tool,
						"), exactly as it is now: its ",
						st.nodes,
						" node",
						st.nodes === 1 ? "" : "s",
						" (with labels and taints) and every object you or Helm created, as YAML. Switch context (",
						/* @__PURE__ */ jsx("code", { children: "kubectl config use-context …" }),
						") and reopen this to export another cluster. The script creates a real ",
						/* @__PURE__ */ jsx("b", { children: tool }),
						" cluster and applies everything into it, and refuses to run unless kubectl points at that new cluster. ",
						/* @__PURE__ */ jsx("b", { children: "Read it, edit it below if you like, then run it on your computer" }),
						" (",
						/* @__PURE__ */ jsx("code", { children: "bash setup.sh" }),
						", Docker running)."
					] }) : "There is no cluster in the current context. Create one, or switch context, then reopen this."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ex-opts",
					children: [
						/* @__PURE__ */ jsxs("label", { children: ["build with ", /* @__PURE__ */ jsxs("select", {
							id: "ex-tool",
							value: tool,
							onChange: (e) => setTool(e.target.value),
							children: [/* @__PURE__ */ jsx("option", {
								value: "kind",
								children: "kind"
							}), /* @__PURE__ */ jsx("option", {
								value: "k3d",
								children: "k3d"
							})]
						})] }),
						/* @__PURE__ */ jsxs("label", { children: ["cluster name ", /* @__PURE__ */ jsx("input", {
							id: "ex-name",
							size: 22,
							spellCheck: false,
							value: name,
							onChange: (e) => setName(e.target.value)
						})] }),
						/* @__PURE__ */ jsxs("label", { children: [/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							id: "ex-waits",
							checked: waits,
							onChange: (e) => setWaits(e.target.checked)
						}), " wait for deployments to be ready"] }),
						/* @__PURE__ */ jsxs("label", { children: [/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							id: "ex-strict",
							checked: strict,
							onChange: (e) => setStrict(e.target.checked)
						}), " stop at the first error"] }),
						/* @__PURE__ */ jsxs("label", { children: [/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							id: "ex-secrets",
							checked: secrets,
							onChange: (e) => setSecrets(e.target.checked)
						}), " include Secrets (values are written into the script)"] })
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "ex-stat",
					id: "ex-stat",
					children: st.empty ? null : /* @__PURE__ */ jsxs(Fragment$1, { children: [Object.entries(st.counts).map(([k, v]) => v + " " + k).join(" · ") || /* @__PURE__ */ jsx("b", {
						style: { color: "#f4b740" },
						children: "no user-made objects yet"
					}), st.left.length > 0 && /* @__PURE__ */ jsxs("details", { children: [/* @__PURE__ */ jsx("summary", { children: "left out" }), st.left.map((l, n) => /* @__PURE__ */ jsx("div", { children: l }, n))] })] })
				}),
				/* @__PURE__ */ jsx("textarea", {
					id: "ex-ta",
					ref: ta,
					spellCheck: false,
					value: text,
					onChange: (e) => setText(e.target.value)
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ex-f",
					children: [
						/* @__PURE__ */ jsx("button", {
							id: "ex-copy",
							onClick: copy,
							children: "Copy"
						}),
						/* @__PURE__ */ jsx("button", {
							id: "ex-dl",
							className: "go",
							onClick: download,
							children: "Download setup.sh"
						}),
						/* @__PURE__ */ jsx("span", {
							id: "ex-msg",
							className: "dim",
							children: msg
						})
					]
				})
			]
		})
	});
}
//#endregion
//#region src/playground/Playground.jsx
store.mount();
function Playground() {
	const noside = useStoreSel((s) => s.noside), exportOpen = useStoreSel((s) => s.exportOpen), paletteOpen = useStoreSel((s) => s.paletteOpen), pane = useStoreSel((s) => s.mobilePane), side = useStoreSel((s) => s.layout.side), viz = useStoreSel((s) => s.layout.viz);
	const [params] = (0, import_dist.useSearchParams)();
	useEffect(() => {
		store.mount();
		if (store.active) store.active.focus();
		const onSel = () => {
			if (store.renderHeld && !selText()) {
				store.renderHeld = false;
				store.bump();
			}
		};
		const onErr = (e) => {
			const t = store.active;
			if (t) t.print("JS error: " + e.message, "err");
		};
		const save = () => store.saveFsNow();
		const onKey = (e) => {
			if (e.key === "Escape" && store.inspect && !store.paletteOpen && !store.exportOpen && store.tourIndex < 0 && !(e.target.closest && e.target.closest(".vi"))) {
				store.inspect = null;
				store.bump();
				return;
			}
			if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "p") {
				e.preventDefault();
				store.openPalette();
			}
		};
		document.addEventListener("keydown", onKey, true);
		document.addEventListener("selectionchange", onSel);
		window.addEventListener("error", onErr);
		window.addEventListener("pagehide", save);
		window.addEventListener("beforeunload", save);
		store.applyParams(params);
		return () => {
			document.removeEventListener("keydown", onKey, true);
			document.removeEventListener("selectionchange", onSel);
			window.removeEventListener("error", onErr);
			window.removeEventListener("pagehide", save);
			window.removeEventListener("beforeunload", save);
			store.unmount();
		};
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "pg-root" + (noside ? " noside" : ""),
		"data-pane": pane,
		style: {
			"--side-w": side + "px",
			"--viz-w": viz ? viz + "px" : "minmax(420px, 1.15fr)"
		},
		children: [
			/* @__PURE__ */ jsx(Header, {}),
			/* @__PURE__ */ jsxs("main", { children: [
				/* @__PURE__ */ jsx(Sidebar_default, {}),
				/* @__PURE__ */ jsx(Gutter, { which: "side" }),
				/* @__PURE__ */ jsx(TerminalPane, {}),
				/* @__PURE__ */ jsx(Gutter, { which: "viz" }),
				/* @__PURE__ */ jsx(VizPane, {})
			] }),
			/* @__PURE__ */ jsx(StatusBar, {}),
			/* @__PURE__ */ jsx(MobileNav, {}),
			/* @__PURE__ */ jsx(Tour, {}),
			exportOpen && /* @__PURE__ */ jsx(ExportModal, {}),
			paletteOpen && /* @__PURE__ */ jsx(Palette, {})
		]
	});
}
//#endregion
export { Playground as default };
