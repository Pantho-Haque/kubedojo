import { h as require_dist, l as usePageMeta, r as courses, t as academyMeta } from "../entry-server.js";
import { a as resetCourse, i as resetAcademy, u as useProgress } from "./Academy-B5kG814l.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/academy/Progress.jsx
var import_dist = require_dist();
function ResetButton({ label, onReset }) {
	const [armed, setArmed] = useState(false);
	return armed ? /* @__PURE__ */ jsxs("span", {
		className: "ac-confirm",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			className: "btn btn-sm ac-danger",
			onClick: () => {
				onReset();
				setArmed(false);
			},
			children: "Yes, reset"
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			className: "btn btn-sm",
			onClick: () => setArmed(false),
			children: "Keep it"
		})]
	}) : /* @__PURE__ */ jsx("button", {
		type: "button",
		className: "btn btn-sm",
		onClick: () => setArmed(true),
		children: label
	});
}
function Progress() {
	usePageMeta(academyMeta("/academy/progress"));
	const p = useProgress();
	return /* @__PURE__ */ jsxs("div", {
		className: "wrap ac-progress-page",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "ac-hero",
				children: [/* @__PURE__ */ jsx("h1", { children: "My progress" }), /* @__PURE__ */ jsx("p", {
					className: "lede",
					children: "Everything here lives only in this browser: finished lessons, quiz answers, checklist ticks, and the simulators’ saved sessions. Nothing is sent anywhere."
				})]
			}),
			/* @__PURE__ */ jsx("ul", {
				className: "ac-prog-list",
				children: courses.map((c) => {
					const done = c.lessons.filter((l) => p.done[l.id]).length, ch = c.lessons.filter((l) => p.ch[l.id]).length, prac = c.lessons.filter((l) => l.practice).length;
					return /* @__PURE__ */ jsxs("li", { children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(import_dist.Link, {
							to: `/academy/${c.slug}`,
							children: /* @__PURE__ */ jsx("b", { children: c.title })
						}), /* @__PURE__ */ jsxs("span", {
							className: "ac-meta",
							children: [
								done,
								" of ",
								c.lessons.length,
								" lessons",
								prac ? ` · ${ch} of ${prac} practice challenges` : ""
							]
						})] }),
						/* @__PURE__ */ jsx("span", {
							className: "ac-bar",
							"aria-hidden": "true",
							children: /* @__PURE__ */ jsx("i", { style: { width: `${100 * done / c.lessons.length}%` } })
						}),
						/* @__PURE__ */ jsx(ResetButton, {
							label: "Reset this course",
							onReset: () => resetCourse(c)
						})
					] }, c.slug);
				})
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "ac-storage",
				"aria-labelledby": "storage-h",
				children: [
					/* @__PURE__ */ jsx("h2", {
						id: "storage-h",
						children: "What is saved, and how to remove it"
					}),
					/* @__PURE__ */ jsxs("ul", { children: [
						/* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("code", { children: "kd.academy.v1" }), ": lessons finished, quiz answers, checklist ticks, and where you stopped."] }),
						/* @__PURE__ */ jsxs("li", { children: [
							/* @__PURE__ */ jsx("code", { children: "kd.academy.sim.v1.…" }),
							": each Simulate experiment’s picture, step, challenges, and terminal. ",
							/* @__PURE__ */ jsx("b", { children: "↺ Start over" }),
							" in Simulate clears one; ",
							/* @__PURE__ */ jsx("code", { children: "clear" }),
							" in its terminal clears that terminal’s history."
						] }),
						/* @__PURE__ */ jsxs("li", { children: [
							/* @__PURE__ */ jsx("code", { children: "kd.academy.try.v1.…" }),
							": each lesson’s “Set up and try” cluster. ",
							/* @__PURE__ */ jsx("b", { children: "↺ Start over" }),
							" in the drawer sets it up again."
						] }),
						/* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("code", { children: "kd.academy.tour.v1.…" }), ": that you have seen a Simulate tour."] })
					] }),
					/* @__PURE__ */ jsx("p", { children: "Resetting a course removes its keys; resetting the Academy removes all of them. The playground keeps its own state and is not affected." }),
					/* @__PURE__ */ jsx(ResetButton, {
						label: "Reset the whole Academy",
						onReset: resetAcademy
					})
				]
			})
		]
	});
}
//#endregion
export { Progress as default };
