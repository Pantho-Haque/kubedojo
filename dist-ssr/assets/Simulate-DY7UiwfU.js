import { c as NotFound, h as require_dist, l as usePageMeta, n as courseBySlug, o as lessonHref, t as academyMeta } from "../entry-server.js";
import { c as simKey } from "./Academy-B5kG814l.js";
import { useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/academy/Simulate.jsx
var import_dist = require_dist();
function ExplorerSimulate({ course }) {
	const host = useRef(null);
	const navigate = (0, import_dist.useNavigate)();
	useEffect(() => {
		let api = null, alive = true;
		const el = host.current;
		import("./explorer-Ch_YqPjC.js").then(({ Explorer }) => {
			if (!alive) return;
			const practice = course.lessons.find((l) => l.slug === course.practice);
			api = Explorer(el, course.simulate, {
				name: course.title,
				practiceTitle: practice.title,
				storageKey: simKey(course.slug),
				onLesson: () => navigate(lessonHref(course.slug, practice.slug))
			});
		});
		return () => {
			alive = false;
			api?.stop();
			el.innerHTML = "";
		};
	}, [course.slug]);
	return /* @__PURE__ */ jsx("div", {
		className: "ac-product ac-sim-root",
		ref: host
	});
}
function K8sSimulate() {
	const host = useRef(null);
	const api = useRef(null);
	const [restored, setRestored] = useState(null);
	useEffect(() => {
		let alive = true;
		import("./k8slab-mQmz3L4v.js").then(({ mountK8sLab }) => {
			if (!alive) return;
			api.current = mountK8sLab(host.current, { storageKey: simKey("kubernetes") + ".lab" });
			if (api.current.restored) setRestored(api.current.savedAt);
		});
		return () => {
			alive = false;
			api.current?.stop();
			api.current = null;
		};
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "ac-product ac-k8s",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "ac-k8s-bar",
			children: [
				/* @__PURE__ */ jsx("b", { children: "Kubernetes Simulate" }),
				/* @__PURE__ */ jsx("span", {
					role: "status",
					children: restored ? `Restored your session from ${new Date(restored).toLocaleString([], {
						dateStyle: "medium",
						timeStyle: "short"
					})}.` : "Its own cluster: separate from the lessons and from the playground."
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => {
						api.current?.reset();
						setRestored(null);
					},
					children: "↺ Start over"
				}),
				/* @__PURE__ */ jsx(import_dist.Link, {
					to: "/academy/kubernetes",
					children: "Kubernetes lessons"
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "ac-k8s-lab",
			ref: host
		})]
	});
}
function Simulate() {
	const { course: slug } = (0, import_dist.useParams)();
	const course = courseBySlug(slug);
	usePageMeta(academyMeta(`/academy/${slug}/simulate`));
	if (!course) return /* @__PURE__ */ jsx(NotFound, {});
	return course.simulate === "k8s" ? /* @__PURE__ */ jsx(K8sSimulate, {}) : /* @__PURE__ */ jsx(ExplorerSimulate, { course }, course.slug);
}
//#endregion
export { Simulate as default };
