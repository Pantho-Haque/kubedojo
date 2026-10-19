import { c as NotFound, h as require_dist, i as lessonById, l as usePageMeta, n as courseBySlug, o as lessonHref, s as useCourseLessons, t as academyMeta } from "../entry-server.js";
import { d as winChallenge, l as tryKey, n as answer, o as setLast, r as markDone, s as setTask, u as useProgress } from "./Academy-B5kG814l.js";
import { Suspense, useEffect, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/academy/Lesson.jsx
var import_dist = require_dist();
var SLOT = "[data-sim],[data-helm-sim],[data-docker-sim],[data-tf-sim],[data-ci-sim]";
async function mountPractice(slot, lesson, onWin) {
	const S = await import("./sims-D993v61q.js");
	const p = lesson.practice;
	if (p.kind === "k8s") return S.Sim(slot, {
		...p.config,
		id: lesson.id
	}, onWin);
	if (p.kind === "docker") return S.DockerSim(slot, p.mission, onWin);
	if (p.kind === "helm" || p.kind === "helm2") return S.HelmSim(slot, p.mission, onWin, { v2: p.kind === "helm2" });
	if (p.kind === "terraform") return S.TerraformSim(slot, p.mission, onWin);
	return S.PipelineSim(slot, p.mission, onWin);
}
function Quiz({ lesson, picked }) {
	if (!lesson.quiz.length) return null;
	return /* @__PURE__ */ jsxs("section", {
		className: "ac-quiz",
		id: "quiz",
		"aria-labelledby": "quiz-h",
		children: [/* @__PURE__ */ jsx("h2", {
			id: "quiz-h",
			children: "Check yourself"
		}), lesson.quiz.map((q, qi) => {
			const got = picked?.[qi];
			const right = got === q.answer;
			return /* @__PURE__ */ jsxs("div", {
				className: "ac-q" + (right ? " ok" : ""),
				children: [
					/* @__PURE__ */ jsx("p", { dangerouslySetInnerHTML: { __html: q.q } }),
					/* @__PURE__ */ jsx("div", {
						className: "ac-opts",
						role: "group",
						"aria-label": `Question ${qi + 1}`,
						children: q.options.map((o, oi) => /* @__PURE__ */ jsx("button", {
							type: "button",
							className: got === oi ? oi === q.answer ? "right" : "wrong" : "",
							"aria-pressed": got === oi,
							onClick: () => answer(lesson.id, qi, oi),
							dangerouslySetInnerHTML: { __html: o }
						}, oi))
					}),
					/* @__PURE__ */ jsx("p", {
						className: "ac-why",
						"aria-live": "polite",
						children: got == null ? "" : right ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
							/* @__PURE__ */ jsx("b", { children: "Right." }),
							" ",
							/* @__PURE__ */ jsx("span", { dangerouslySetInnerHTML: { __html: q.why } })
						] }) : "Not quite. Try another answer."
					})
				]
			}, qi);
		})]
	});
}
function TryDrawer({ course, lesson, request, onClose }) {
	const host = useRef(null);
	const api = useRef(null);
	const [info, setInfo] = useState("");
	const key = tryKey(course.slug, lesson.slug);
	const blockKey = key + ".block";
	const setUp = (i) => {
		const t = lesson.tries[i];
		api.current.setUp(t.setup, t.cmds);
		try {
			localStorage.setItem(blockKey, String(i));
		} catch {}
		setInfo(t.skipped ? `Ready. The lab runs the first ${t.cmds.length} line${t.cmds.length === 1 ? "" : "s"} of this block; the other ${t.skipped} need a real cluster.` : "Ready. Press Enter to run the command on the prompt.");
	};
	useEffect(() => {
		let alive = true;
		import("./k8slab-mQmz3L4v.js").then(({ mountK8sLab }) => {
			if (alive) api.current = mountK8sLab(host.current, {
				storageKey: key,
				hash: "#play",
				compact: true
			});
		});
		return () => {
			alive = false;
			api.current?.stop();
			api.current = null;
		};
	}, [key]);
	useEffect(() => {
		const go = () => {
			if (!api.current) return setTimeout(go, 50);
			let last = null;
			try {
				last = localStorage.getItem(blockKey);
			} catch {}
			if (request.n === 1 && api.current.restored && last === String(request.i)) {
				setInfo(`Restored your cluster from ${new Date(api.current.savedAt).toLocaleString([], {
					dateStyle: "medium",
					timeStyle: "short"
				})}. Start over sets this block up again.`);
				return;
			}
			setUp(request.i);
		};
		go();
	}, [request.n]);
	return /* @__PURE__ */ jsxs("section", {
		className: "ac-try ac-product",
		"aria-label": "Try it: this lesson’s own practice cluster",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "ac-try-bar",
			children: [
				/* @__PURE__ */ jsx("b", { children: "Try it · this lesson’s own cluster" }),
				/* @__PURE__ */ jsx("span", {
					className: "ac-try-info",
					role: "status",
					children: info
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => api.current && setUp(request.i),
					children: "↺ Start over"
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onClose,
					"aria-label": "Close the practice terminal",
					children: "✕"
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "ac-try-lab",
			ref: host
		})]
	});
}
function LessonBody({ course, slug }) {
	const lesson = useCourseLessons(course.slug)?.lessons[slug];
	const meta = course.lessons.find((l) => l.slug === slug);
	const i = course.lessons.indexOf(meta);
	const p = useProgress();
	const body = useRef(null);
	const navigate = (0, import_dist.useNavigate)();
	const { hash } = (0, import_dist.useLocation)();
	const [tryReq, setTryReq] = useState(null);
	usePageMeta(academyMeta(`/academy/${course.slug}/${slug}`));
	const hasTasks = !!lesson && /data-task=/.test(lesson.html);
	useEffect(() => {
		if (!lesson) return;
		setLast({
			course: course.slug,
			slug,
			href: lessonHref(course.slug, slug),
			title: lesson.title,
			courseTitle: course.title,
			n: i + 1,
			total: course.lessons.length
		});
		if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
		else window.scrollTo(0, 0);
	}, [
		course,
		slug,
		lesson
	]);
	useEffect(() => {
		const el = body.current;
		if (!el || !lesson) return;
		let sim = null, alive = true;
		const slot = lesson.practice && el.querySelector(SLOT);
		if (slot) {
			slot.classList.add("ac-product", "ac-practice");
			slot.id = "practice";
			mountPractice(slot, lesson, () => winChallenge(lesson.id)).then((s) => {
				if (alive) sim = s;
				else s.stop();
			});
		}
		el.querySelectorAll(".cmd[data-try]").forEach((c) => {
			if (!c.querySelector(".try")) {
				const b = document.createElement("button");
				b.type = "button";
				b.className = "try";
				b.textContent = "▶ Set up and try";
				c.append(b);
			}
		});
		return () => {
			alive = false;
			sim?.stop();
			if (slot) slot.innerHTML = "";
		};
	}, [lesson]);
	useEffect(() => {
		body.current?.querySelectorAll("[data-task]").forEach((x) => {
			x.checked = !!p.tasks[lesson.id + ":" + x.dataset.task];
		});
	}, [p.tasks, lesson]);
	useEffect(() => {
		if (!lesson || p.done[lesson.id]) return;
		if (lesson.quiz.length && lesson.quiz.every((q, qi) => p.quiz[lesson.id]?.[qi] === q.answer)) markDone(lesson.id);
		else if (!lesson.quiz.length && hasTasks) {
			if ([...body.current.querySelectorAll("[data-task]")].map((x) => x.dataset.task).every((k) => p.tasks[lesson.id + ":" + k])) markDone(lesson.id);
		}
	}, [
		p,
		lesson,
		hasTasks
	]);
	if (!lesson) return /* @__PURE__ */ jsx(NotFound, {});
	const prev = course.lessons[i - 1], next = course.lessons[i + 1];
	const onClick = (e) => {
		const t = e.target;
		const copy = t.closest(".copy");
		if (copy) {
			const text = copy.parentElement.querySelector("pre").textContent;
			const done = () => {
				copy.textContent = "Copied";
				setTimeout(() => {
					copy.textContent = "Copy";
				}, 1500);
			};
			if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
			return;
		}
		const tryBtn = t.closest(".try");
		if (tryBtn) {
			setTryReq((r) => ({
				i: Number(tryBtn.parentElement.dataset.try),
				n: (r?.n || 0) + 1
			}));
			return;
		}
		const go = t.closest("[data-go]");
		if (go) {
			const hit = lessonById(go.dataset.go);
			if (hit) navigate(lessonHref(hit.course.slug, hit.lesson.slug));
			return;
		}
		if (t.closest(".open-lab")) {
			navigate("/academy/kubernetes/simulate");
			return;
		}
		const a = t.closest("a");
		if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
		const href = a.getAttribute("href") || "";
		if (href.startsWith("/") && !href.startsWith("//")) {
			e.preventDefault();
			navigate(href);
		}
	};
	const onChange = (e) => {
		const k = e.target.dataset?.task;
		if (k) setTask(lesson.id, k, e.target.checked);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "wrap post-layout ac-lesson" + (tryReq ? " has-try" : ""),
		children: [
			/* @__PURE__ */ jsxs("article", {
				className: "post",
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
							/* @__PURE__ */ jsx(import_dist.Link, {
								to: `/academy/${course.slug}`,
								children: course.title
							}),
							/* @__PURE__ */ jsx("span", {
								"aria-hidden": "true",
								children: "/"
							}),
							/* @__PURE__ */ jsxs("span", { children: [
								"Stage ",
								lesson.stage + 1,
								" · lesson ",
								i + 1,
								" of ",
								course.lessons.length
							] })
						]
					}),
					/* @__PURE__ */ jsxs("header", {
						className: "post-head",
						children: [/* @__PURE__ */ jsxs("h1", { children: [/* @__PURE__ */ jsxs("span", {
							"aria-hidden": "true",
							children: [lesson.emoji, " "]
						}), lesson.title] }), /* @__PURE__ */ jsxs("p", {
							className: "post-meta",
							children: [
								/* @__PURE__ */ jsx("span", { children: course.stages[lesson.stage] }),
								p.done[lesson.id] ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
									"aria-hidden": "true",
									children: "·"
								}), /* @__PURE__ */ jsx("span", {
									className: "ac-done",
									children: "✓ Done"
								})] }) : null,
								p.ch[lesson.id] ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
									"aria-hidden": "true",
									children: "·"
								}), /* @__PURE__ */ jsx("span", {
									className: "ac-done",
									children: "⭐ Challenge complete"
								})] }) : null
							]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "prose ac-prose",
						ref: body,
						onClick,
						onChange,
						dangerouslySetInnerHTML: { __html: lesson.html }
					}),
					/* @__PURE__ */ jsx(Quiz, {
						lesson,
						picked: p.quiz[lesson.id]
					}),
					/* @__PURE__ */ jsxs("nav", {
						className: "pager",
						"aria-label": "Previous and next lesson",
						children: [prev ? /* @__PURE__ */ jsxs(import_dist.Link, {
							className: "prev",
							to: lessonHref(course.slug, prev.slug),
							children: [/* @__PURE__ */ jsx("span", { children: "Previous" }), prev.title]
						}) : /* @__PURE__ */ jsx("span", {}), next ? /* @__PURE__ */ jsxs(import_dist.Link, {
							className: "next",
							to: lessonHref(course.slug, next.slug),
							onClick: () => {
								if (!lesson.quiz.length && !hasTasks) markDone(lesson.id);
							},
							children: [/* @__PURE__ */ jsx("span", { children: "Next" }), next.title]
						}) : /* @__PURE__ */ jsxs(import_dist.Link, {
							className: "next",
							to: `/academy/${course.slug}`,
							onClick: () => {
								if (!lesson.quiz.length && !hasTasks) markDone(lesson.id);
							},
							children: [
								/* @__PURE__ */ jsx("span", { children: "Finished" }),
								"Back to the ",
								course.title,
								" course"
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("aside", {
				className: "post-side",
				children: /* @__PURE__ */ jsxs("nav", {
					className: "course-nav",
					"aria-label": `The ${course.title} course`,
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "toc-title",
							children: course.title
						}),
						course.stages.map((st, si) => /* @__PURE__ */ jsxs("div", {
							className: "ac-side-stage",
							children: [/* @__PURE__ */ jsxs("p", {
								className: "ac-label",
								children: [
									"Stage ",
									si + 1,
									" · ",
									st
								]
							}), /* @__PURE__ */ jsx("ol", { children: course.lessons.filter((l) => l.stage === si).map((l) => /* @__PURE__ */ jsx("li", {
								className: p.done[l.id] ? "done" : "",
								children: /* @__PURE__ */ jsxs(import_dist.Link, {
									to: lessonHref(course.slug, l.slug),
									"aria-current": l.slug === slug ? "page" : void 0,
									children: [p.done[l.id] ? "✓ " : "", l.title]
								})
							}, l.slug)) })]
						}, st)),
						/* @__PURE__ */ jsx("p", {
							className: "ac-side-sim",
							children: /* @__PURE__ */ jsxs(import_dist.Link, {
								to: `/academy/${course.slug}/simulate`,
								children: [
									"Open ",
									course.title,
									" Simulate →"
								]
							})
						})
					]
				})
			}),
			tryReq && /* @__PURE__ */ jsx(TryDrawer, {
				course,
				lesson,
				request: tryReq,
				onClose: () => setTryReq(null)
			})
		]
	});
}
function Skeleton() {
	return /* @__PURE__ */ jsx("div", {
		className: "wrap post-layout",
		children: /* @__PURE__ */ jsxs("article", {
			className: "post",
			children: [
				/* @__PURE__ */ jsx("div", { className: "skeleton h1" }),
				/* @__PURE__ */ jsx("div", { className: "skeleton p" }),
				/* @__PURE__ */ jsx("div", { className: "skeleton p" })
			]
		})
	});
}
function Lesson() {
	const { course: slug, lesson } = (0, import_dist.useParams)();
	const course = courseBySlug(slug);
	if (!course || !course.lessons.some((l) => l.slug === lesson)) return /* @__PURE__ */ jsx(NotFound, {});
	return /* @__PURE__ */ jsx(Suspense, {
		fallback: /* @__PURE__ */ jsx(Skeleton, {}),
		children: /* @__PURE__ */ jsx(LessonBody, {
			course,
			slug: lesson
		}, slug + "/" + lesson)
	});
}
//#endregion
export { Lesson as default };
