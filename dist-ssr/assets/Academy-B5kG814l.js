import { a as lessonCount, c as NotFound, d as Footer, f as ThemeToggle, g as __exportAll, h as require_dist, l as usePageMeta, m as lazySync, n as courseBySlug, p as Logo, r as courses, t as academyMeta } from "../entry-server.js";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/academy/progress.js
var import_dist = require_dist();
var KEY = "kd.academy.v1";
var EMPTY = Object.freeze({
	done: {},
	quiz: {},
	tasks: {},
	ch: {},
	last: null
});
var state = null;
var subs = /* @__PURE__ */ new Set();
var read = () => {
	try {
		const d = JSON.parse(localStorage.getItem(KEY) || "null");
		return d && d.v === 1 ? {
			...EMPTY,
			...d
		} : { ...EMPTY };
	} catch {
		return { ...EMPTY };
	}
};
var write = () => {
	try {
		localStorage.setItem(KEY, JSON.stringify({
			v: 1,
			...state
		}));
	} catch {}
};
var get = () => state || (state = read());
function update(fn) {
	const next = structuredClone(get());
	fn(next);
	state = next;
	write();
	subs.forEach((f) => f());
}
var subscribe = (f) => {
	subs.add(f);
	return () => subs.delete(f);
};
var useProgress = () => useSyncExternalStore(subscribe, get, () => EMPTY);
var markDone = (id) => {
	if (!get().done[id]) update((s) => {
		s.done[id] = 1;
	});
};
var answer = (id, qi, opt) => update((s) => {
	var _s$quiz;
	((_s$quiz = s.quiz)[id] || (_s$quiz[id] = {}))[qi] = opt;
});
var setTask = (lessonId, key, on) => update((s) => {
	const k = lessonId + ":" + key;
	if (on) s.tasks[k] = 1;
	else delete s.tasks[k];
});
var winChallenge = (id) => {
	if (!get().ch[id]) update((s) => {
		s.ch[id] = 1;
	});
};
var setLast = (last) => update((s) => {
	s.last = {
		...last,
		at: Date.now()
	};
});
var simKey = (course) => `kd.academy.sim.v1.${course}`;
var tryKey = (course, lesson) => `kd.academy.try.v1.${course}.${lesson}`;
var tourKey = (course) => `kd.academy.tour.v1.${course}`;
function removeKeys(match) {
	try {
		for (const k of Object.keys(localStorage)) if (match(k)) localStorage.removeItem(k);
	} catch {}
}
function resetCourse(course) {
	update((s) => {
		const ids = new Set(course.lessons.map((l) => l.id));
		for (const id of ids) {
			delete s.done[id];
			delete s.quiz[id];
			delete s.ch[id];
		}
		for (const k of Object.keys(s.tasks)) if (ids.has(k.split(":")[0])) delete s.tasks[k];
		if (s.last?.course === course.slug) s.last = null;
	});
	removeKeys((k) => k === simKey(course.slug) || k.startsWith(simKey(course.slug) + ".") || k.startsWith(`kd.academy.try.v1.${course.slug}.`) || k === tourKey(course.slug));
}
function resetAcademy() {
	state = { ...EMPTY };
	removeKeys((k) => k.startsWith("kd.academy."));
	subs.forEach((f) => f());
}
//#endregion
//#region src/academy/Shelf.jsx
function useSavedSims() {
	const [saved, setSaved] = useState({});
	useEffect(() => {
		const out = {};
		try {
			for (const c of courses) for (const k of Object.keys(localStorage)) if (k.startsWith(simKey(c.slug) + ".")) {
				const at = JSON.parse(localStorage.getItem(k) || "{}").at;
				if (at && at > (out[c.slug] || 0)) out[c.slug] = at;
			}
		} catch {}
		setSaved(out);
	}, []);
	return saved;
}
var ago = (t) => {
	const d = Math.floor((Date.now() - t) / 864e5);
	return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
};
function Shelf() {
	usePageMeta(academyMeta("/academy"));
	const p = useProgress();
	const saved = useSavedSims();
	const { hash } = (0, import_dist.useLocation)();
	useEffect(() => {
		if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
		else window.scrollTo(0, 0);
	}, [hash]);
	return /* @__PURE__ */ jsxs("div", {
		className: "wrap ac-shelf",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "ac-hero",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "kicker",
						children: "KubeDojo Academy"
					}),
					/* @__PURE__ */ jsx("h1", { children: "Learn it step by step." }),
					/* @__PURE__ */ jsxs("p", {
						className: "lede",
						children: [
							courses.length,
							" courses and ",
							lessonCount(),
							" short lessons on Kubernetes and the tools around it. Each idea comes with a story, a quiz, and a simulator you can break. Nothing runs on your computer, and your progress stays in this browser."
						]
					})
				]
			}),
			p.last && /* @__PURE__ */ jsxs(import_dist.Link, {
				className: "ac-continue",
				to: p.last.href,
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "ac-label",
						children: "Continue where you left off"
					}),
					/* @__PURE__ */ jsxs("b", { children: [
						p.last.courseTitle,
						" · lesson ",
						p.last.n,
						" of ",
						p.last.total,
						" · ",
						p.last.title
					] }),
					/* @__PURE__ */ jsx("span", {
						className: "ac-go",
						"aria-hidden": "true",
						children: "→"
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				"aria-labelledby": "courses-h",
				children: [/* @__PURE__ */ jsx("h2", {
					id: "courses-h",
					className: "ac-section",
					children: "Courses"
				}), /* @__PURE__ */ jsx("ul", {
					className: "ac-courses",
					children: courses.map((c, i) => {
						const done = c.lessons.filter((l) => p.done[l.id]).length;
						return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(import_dist.Link, {
							to: `/academy/${c.slug}`,
							className: "ac-course",
							children: [
								/* @__PURE__ */ jsxs("span", {
									className: "ac-label",
									children: [
										"Course ",
										i + 1,
										c.slug === "helm-2" ? " · new" : ""
									]
								}),
								/* @__PURE__ */ jsx("b", { children: c.title }),
								/* @__PURE__ */ jsx("span", {
									className: "ac-sub",
									children: c.subtitle
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "ac-meta",
									children: [
										c.stages.length,
										" stages · ",
										c.lessons.length,
										" lessons"
									]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "ac-bar",
									"aria-hidden": "true",
									children: /* @__PURE__ */ jsx("i", { style: { width: `${100 * done / c.lessons.length}%` } })
								}),
								/* @__PURE__ */ jsx("span", {
									className: "ac-meta",
									children: done ? `${done} of ${c.lessons.length} done` : "Not started"
								})
							]
						}) }, c.slug);
					})
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				id: "simulate",
				"aria-labelledby": "sim-h",
				className: "ac-simulate",
				children: [
					/* @__PURE__ */ jsx("h2", {
						id: "sim-h",
						className: "ac-section",
						children: "Simulate"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "ac-section-note",
						children: "Click-through experiments, each with its own simulator: a live picture, guided steps, and a practice terminal. They are separate from the playground, and they remember where you stopped."
					}),
					/* @__PURE__ */ jsx("ul", {
						className: "ac-sims",
						children: courses.map((c) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(import_dist.Link, {
							to: `/academy/${c.slug}/simulate`,
							className: "ac-sim-card",
							children: [
								/* @__PURE__ */ jsx("b", { children: c.title }),
								/* @__PURE__ */ jsx("span", {
									className: "ac-sub",
									children: c.simulate === "k8s" ? "Cluster, controllers, traffic, and YAML" : c.subtitle
								}),
								/* @__PURE__ */ jsx("span", {
									className: "ac-state" + (saved[c.slug] ? " on" : ""),
									children: saved[c.slug] ? `Saved · ${ago(saved[c.slug])}` : "Not started"
								})
							]
						}) }, c.slug))
					})
				]
			})
		]
	});
}
//#endregion
//#region src/academy/Course.jsx
function Course() {
	const { course } = (0, import_dist.useParams)();
	const c = courseBySlug(course);
	const p = useProgress();
	usePageMeta(academyMeta("/academy/" + course));
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [course]);
	if (!c) return /* @__PURE__ */ jsx(NotFound, {});
	const done = c.lessons.filter((l) => p.done[l.id]).length;
	const next = c.lessons.find((l) => !p.done[l.id]) || c.lessons[0];
	return /* @__PURE__ */ jsxs("div", {
		className: "wrap ac-course-page",
		children: [
			/* @__PURE__ */ jsxs("nav", {
				className: "crumbs",
				"aria-label": "Breadcrumb",
				children: [
					/* @__PURE__ */ jsx(import_dist.Link, {
						to: "/academy",
						children: "Academy"
					}),
					/* @__PURE__ */ jsx("span", {
						"aria-hidden": "true",
						children: "/"
					}),
					/* @__PURE__ */ jsxs("span", { children: [
						"Course ",
						courses.indexOf(c) + 1,
						" of ",
						courses.length
					] })
				]
			}),
			/* @__PURE__ */ jsxs("header", {
				className: "ac-hero",
				children: [
					/* @__PURE__ */ jsx("h1", { children: c.title }),
					/* @__PURE__ */ jsxs("p", {
						className: "lede",
						children: [
							c.subtitle,
							". ",
							c.description
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "ac-progress-line",
						children: [/* @__PURE__ */ jsx("span", {
							className: "ac-bar",
							"aria-hidden": "true",
							children: /* @__PURE__ */ jsx("i", { style: { width: `${100 * done / c.lessons.length}%` } })
						}), /* @__PURE__ */ jsxs("span", { children: [
							done,
							" of ",
							c.lessons.length,
							" lessons done"
						] })]
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "ac-actions",
						children: [/* @__PURE__ */ jsxs(import_dist.Link, {
							className: "btn btn-academy",
							to: `/academy/${c.slug}/${next.slug}`,
							children: [
								done ? "Continue" : "Start",
								": ",
								next.title,
								" →"
							]
						}), /* @__PURE__ */ jsx(import_dist.Link, {
							className: "btn",
							to: `/academy/${c.slug}/simulate`,
							children: "Open Simulate"
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("ol", {
				className: "ac-stages",
				children: c.stages.map((st, si) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsxs("h2", { children: [/* @__PURE__ */ jsxs("span", {
					className: "ac-label",
					children: ["Stage ", si + 1]
				}), st] }), /* @__PURE__ */ jsx("ol", {
					className: "ac-lessons",
					children: c.lessons.filter((l) => l.stage === si).map((l) => /* @__PURE__ */ jsx("li", {
						className: p.done[l.id] ? "done" : "",
						children: /* @__PURE__ */ jsxs(import_dist.Link, {
							to: `/academy/${c.slug}/${l.slug}`,
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "ac-tick",
									"aria-hidden": "true",
									children: p.done[l.id] ? "✓" : ""
								}),
								/* @__PURE__ */ jsx("span", {
									className: "ac-emoji",
									"aria-hidden": "true",
									children: l.emoji
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "ac-ltitle",
									children: [l.title, p.done[l.id] ? /* @__PURE__ */ jsx("span", {
										className: "sr-only",
										children: " (done)"
									}) : null]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "ac-ltags",
									children: [
										l.practice ? /* @__PURE__ */ jsx("i", { children: "practice" }) : null,
										l.quiz ? /* @__PURE__ */ jsxs("i", { children: [l.quiz, " questions"] }) : null,
										l.tries ? /* @__PURE__ */ jsx("i", { children: "try it" }) : null
									]
								})
							]
						})
					}, l.slug))
				})] }, st))
			})
		]
	});
}
//#endregion
//#region src/academy/Academy.jsx
var Academy_exports = /* @__PURE__ */ __exportAll({
	default: () => Academy,
	preloadAll: () => preloadAll,
	preloadRoute: () => preloadRoute
});
var [Lesson, loadLesson] = lazySync(() => import("./Lesson-XgPVw75s.js"));
var [Simulate, loadSimulate] = lazySync(() => import("./Simulate-DY7UiwfU.js"));
var [Progress, loadProgress] = lazySync(() => import("./Progress-Vc-Q8xgF.js"));
function preloadRoute(path) {
	const m = /^\/academy(?:\/([\w-]+))?(?:\/([\w-]+))?\/?$/.exec(path) || [];
	return m[1] === "progress" ? loadProgress() : m[2] === "simulate" ? loadSimulate() : m[2] ? loadLesson() : Promise.resolve();
}
var preloadAll = () => Promise.all([
	loadLesson(),
	loadSimulate(),
	loadProgress()
]);
function Header() {
	const loc = (0, import_dist.useLocation)(), { pathname } = loc;
	const [hash, setHash] = useState("");
	useEffect(() => setHash(loc.hash), [loc.hash]);
	const sim = hash === "#simulate" || /\/simulate\/?$/.test(pathname);
	return /* @__PURE__ */ jsx("header", {
		className: "site-header ac-header",
		children: /* @__PURE__ */ jsxs("div", {
			className: "wrap bar",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "ac-brand",
					children: [/* @__PURE__ */ jsxs(import_dist.Link, {
						to: "/",
						className: "brand",
						"aria-label": "KubeDojo home",
						children: [/* @__PURE__ */ jsx(Logo, {}), /* @__PURE__ */ jsx("span", { children: "KubeDojo" })]
					}), /* @__PURE__ */ jsx(import_dist.Link, {
						to: "/academy",
						className: "ac-badge",
						children: "Academy"
					})]
				}),
				/* @__PURE__ */ jsxs("nav", {
					className: "main-nav",
					"aria-label": "Academy",
					children: [
						/* @__PURE__ */ jsx(import_dist.NavLink, {
							end: true,
							to: "/academy",
							className: ({ isActive }) => isActive && !sim ? "active" : void 0,
							children: "Courses"
						}),
						/* @__PURE__ */ jsx(import_dist.Link, {
							to: "/academy#simulate",
							className: sim ? "active" : void 0,
							"aria-current": sim ? "page" : void 0,
							children: "Simulate"
						}),
						/* @__PURE__ */ jsx(import_dist.NavLink, {
							to: "/academy/progress",
							children: "My progress"
						})
					]
				}),
				/* @__PURE__ */ jsx(ThemeToggle, {}),
				/* @__PURE__ */ jsxs(import_dist.Link, {
					className: "btn btn-sm ac-dojo-link",
					to: "/app",
					target: "_blank",
					rel: "noopener",
					children: [
						"Playground",
						/* @__PURE__ */ jsx("span", {
							"aria-hidden": "true",
							children: " ↗"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "sr-only",
							children: " (opens in a new tab)"
						})
					]
				})
			]
		})
	});
}
function AcademyLayout() {
	const full = (0, import_dist.useLocation)().pathname.replace(/\/+$/, "").endsWith("/simulate");
	return /* @__PURE__ */ jsxs("div", {
		className: "site academy" + (full ? " ac-full" : ""),
		children: [
			/* @__PURE__ */ jsx("a", {
				className: "skip-link",
				href: "#main",
				children: "Skip to content"
			}),
			/* @__PURE__ */ jsx(Header, {}),
			/* @__PURE__ */ jsx("main", {
				id: "main",
				tabIndex: -1,
				children: /* @__PURE__ */ jsx(Suspense, {
					fallback: /* @__PURE__ */ jsx("div", {
						className: "wrap boot",
						role: "status",
						children: "Loading…"
					}),
					children: /* @__PURE__ */ jsx(import_dist.Outlet, {})
				})
			}),
			!full && /* @__PURE__ */ jsx(Footer, {})
		]
	});
}
function Academy() {
	return /* @__PURE__ */ jsx(import_dist.Routes, { children: /* @__PURE__ */ jsxs(import_dist.Route, {
		element: /* @__PURE__ */ jsx(AcademyLayout, {}),
		children: [
			/* @__PURE__ */ jsx(import_dist.Route, {
				index: true,
				element: /* @__PURE__ */ jsx(Shelf, {})
			}),
			/* @__PURE__ */ jsx(import_dist.Route, {
				path: "progress",
				element: /* @__PURE__ */ jsx(Progress, {})
			}),
			/* @__PURE__ */ jsx(import_dist.Route, {
				path: ":course",
				element: /* @__PURE__ */ jsx(Course, {})
			}),
			/* @__PURE__ */ jsx(import_dist.Route, {
				path: ":course/simulate",
				element: /* @__PURE__ */ jsx(Simulate, {})
			}),
			/* @__PURE__ */ jsx(import_dist.Route, {
				path: ":course/:lesson",
				element: /* @__PURE__ */ jsx(Lesson, {})
			}),
			/* @__PURE__ */ jsx(import_dist.Route, {
				path: "*",
				element: /* @__PURE__ */ jsx(NotFound, {})
			})
		]
	}) });
}
//#endregion
export { resetCourse as a, simKey as c, winChallenge as d, Academy as default, resetAcademy as i, tryKey as l, answer as n, setLast as o, preloadAll, preloadRoute, markDone as r, setTask as s, Academy_exports as t, useProgress as u };
