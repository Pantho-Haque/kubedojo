import { a as store, n as TerminalPane, o as useStore, t as VizPane } from "./viz-DrS-GmLQ.js";
import { useEffect } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/playground/Embed.jsx
function Embed() {
	useStore();
	useEffect(() => {
		store.mount();
		if (store.active && !store.active.value) store.active.setValue("kind create cluster --name dojo");
		return () => store.unmount();
	}, []);
	if (!store.sim) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "pg-root pg-embed",
		children: /* @__PURE__ */ jsxs("main", { children: [/* @__PURE__ */ jsx(TerminalPane, { compact: true }), /* @__PURE__ */ jsx(VizPane, { only: "cluster" })] })
	});
}
//#endregion
export { Embed as default };
