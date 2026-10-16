import { renderToString } from "react-dom/server";
import * as React from "react";
import React3, { Component, Suspense, lazy, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { parse, serialize } from "cookie";
import { splitCookiesString } from "set-cookie-parser";
import * as ReactDOM from "react-dom";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region \0rolldown/runtime.js
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$1 = Object.getOwnPropertyNames;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp$1(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp$1(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps$1 = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames$1(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp$1.call(to, key) && key !== except) __defProp$1(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc$1(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toCommonJS$1 = (mod) => __hasOwnProp$1.call(mod, "module.exports") ? mod["module.exports"] : __copyProps$1(__defProp$1({}, "__esModule", { value: true }), mod);
//#endregion
//#region node_modules/react-router/dist/development/chunk-OB3PAWPO.mjs
/**
* react-router v7.18.4
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
function normalizeProtocolRelativeUrl(url, protocol) {
	return protocol + url.replace(/\\/g, "/");
}
function isLocation(obj) {
	return typeof obj === "object" && obj != null && "pathname" in obj && "search" in obj && "hash" in obj && "state" in obj && "key" in obj;
}
function createMemoryHistory(options = {}) {
	let { initialEntries = ["/"], initialIndex, v5Compat = false } = options;
	let entries;
	entries = initialEntries.map((entry, index2) => createMemoryLocation(entry, typeof entry === "string" ? null : entry.state, index2 === 0 ? "default" : void 0, typeof entry === "string" ? void 0 : entry.mask));
	let index = clampIndex(initialIndex == null ? entries.length - 1 : initialIndex);
	let action = "POP";
	let listener = null;
	function clampIndex(n) {
		return Math.min(Math.max(n, 0), entries.length - 1);
	}
	function getCurrentLocation() {
		return entries[index];
	}
	function createMemoryLocation(to, state = null, key, mask) {
		let location = createLocation(entries ? getCurrentLocation().pathname : "/", to, state, key, mask);
		warning(location.pathname.charAt(0) === "/", `relative pathnames are not supported in memory history: ${JSON.stringify(to)}`);
		return location;
	}
	function createHref2(to) {
		return typeof to === "string" ? to : createPath(to);
	}
	return {
		get index() {
			return index;
		},
		get action() {
			return action;
		},
		get location() {
			return getCurrentLocation();
		},
		createHref: createHref2,
		createURL(to) {
			return new URL(createHref2(to), "http://localhost");
		},
		encodeLocation(to) {
			let path = typeof to === "string" ? parsePath(to) : to;
			return {
				pathname: path.pathname || "",
				search: path.search || "",
				hash: path.hash || ""
			};
		},
		push(to, state) {
			action = "PUSH";
			let nextLocation = isLocation(to) ? to : createMemoryLocation(to, state);
			index += 1;
			entries.splice(index, entries.length, nextLocation);
			if (v5Compat && listener) listener({
				action,
				location: nextLocation,
				delta: 1
			});
		},
		replace(to, state) {
			action = "REPLACE";
			let nextLocation = isLocation(to) ? to : createMemoryLocation(to, state);
			entries[index] = nextLocation;
			if (v5Compat && listener) listener({
				action,
				location: nextLocation,
				delta: 0
			});
		},
		go(delta) {
			action = "POP";
			let nextIndex = clampIndex(index + delta);
			let nextLocation = entries[nextIndex];
			index = nextIndex;
			if (listener) listener({
				action,
				location: nextLocation,
				delta
			});
		},
		listen(fn) {
			listener = fn;
			return () => {
				listener = null;
			};
		}
	};
}
function createBrowserHistory(options = {}) {
	function createBrowserLocation(window2, globalHistory) {
		let maskedLocation = globalHistory.state?.masked;
		let { pathname, search, hash } = maskedLocation || window2.location;
		return createLocation("", {
			pathname,
			search,
			hash
		}, globalHistory.state && globalHistory.state.usr || null, globalHistory.state && globalHistory.state.key || "default", maskedLocation ? {
			pathname: window2.location.pathname,
			search: window2.location.search,
			hash: window2.location.hash
		} : void 0);
	}
	function createBrowserHref(window2, to) {
		return typeof to === "string" ? to : createPath(to);
	}
	return getUrlBasedHistory(createBrowserLocation, createBrowserHref, null, options);
}
function createHashHistory(options = {}) {
	function createHashLocation(window2, globalHistory) {
		let { pathname = "/", search = "", hash = "" } = parsePath(window2.location.hash.substring(1));
		if (!pathname.startsWith("/") && !pathname.startsWith(".")) pathname = "/" + pathname;
		return createLocation("", {
			pathname,
			search,
			hash
		}, globalHistory.state && globalHistory.state.usr || null, globalHistory.state && globalHistory.state.key || "default");
	}
	function createHashHref(window2, to) {
		let base = window2.document.querySelector("base");
		let href = "";
		if (base && base.getAttribute("href")) {
			let url = window2.location.href;
			let hashIndex = url.indexOf("#");
			href = hashIndex === -1 ? url : url.slice(0, hashIndex);
		}
		return href + "#" + (typeof to === "string" ? to : createPath(to));
	}
	function validateHashLocation(location, to) {
		warning(location.pathname.charAt(0) === "/", `relative pathnames are not supported in hash history.push(${JSON.stringify(to)})`);
	}
	return getUrlBasedHistory(createHashLocation, createHashHref, validateHashLocation, options);
}
function invariant$1(value, message) {
	if (value === false || value === null || typeof value === "undefined") throw new Error(message);
}
function warning(cond, message) {
	if (!cond) {
		if (typeof console !== "undefined") console.warn(message);
		try {
			throw new Error(message);
		} catch (e) {}
	}
}
function createKey$1() {
	return Math.random().toString(36).substring(2, 10);
}
function getHistoryState(location, index) {
	return {
		usr: location.state,
		key: location.key,
		idx: index,
		masked: location.mask ? {
			pathname: location.pathname,
			search: location.search,
			hash: location.hash
		} : void 0
	};
}
function createLocation(current, to, state = null, key, mask) {
	return {
		pathname: typeof current === "string" ? current : current.pathname,
		search: "",
		hash: "",
		...typeof to === "string" ? parsePath(to) : to,
		state,
		key: to && to.key || key || createKey$1(),
		mask
	};
}
function createPath({ pathname = "/", search = "", hash = "" }) {
	if (search && search !== "?") pathname += search.charAt(0) === "?" ? search : "?" + search;
	if (hash && hash !== "#") pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
	return pathname;
}
function parsePath(path) {
	let parsedPath = {};
	if (path) {
		let hashIndex = path.indexOf("#");
		if (hashIndex >= 0) {
			parsedPath.hash = path.substring(hashIndex);
			path = path.substring(0, hashIndex);
		}
		let searchIndex = path.indexOf("?");
		if (searchIndex >= 0) {
			parsedPath.search = path.substring(searchIndex);
			path = path.substring(0, searchIndex);
		}
		if (path) parsedPath.pathname = path;
	}
	return parsedPath;
}
function getUrlBasedHistory(getLocation, createHref2, validateLocation, options = {}) {
	let { window: window2 = document.defaultView, v5Compat = false } = options;
	let globalHistory = window2.history;
	let action = "POP";
	let listener = null;
	let index = getIndex();
	if (index == null) {
		index = 0;
		globalHistory.replaceState({
			...globalHistory.state,
			idx: index
		}, "");
	}
	function getIndex() {
		return (globalHistory.state || { idx: null }).idx;
	}
	function handlePop() {
		action = "POP";
		let nextIndex = getIndex();
		let delta = nextIndex == null ? null : nextIndex - index;
		index = nextIndex;
		if (listener) listener({
			action,
			location: history.location,
			delta
		});
	}
	function push(to, state) {
		action = "PUSH";
		let location = isLocation(to) ? to : createLocation(history.location, to, state);
		if (validateLocation) validateLocation(location, to);
		index = getIndex() + 1;
		let historyState = getHistoryState(location, index);
		let url = history.createHref(location.mask || location);
		try {
			globalHistory.pushState(historyState, "", url);
		} catch (error) {
			if (error instanceof DOMException && error.name === "DataCloneError") throw error;
			window2.location.assign(url);
		}
		if (v5Compat && listener) listener({
			action,
			location: history.location,
			delta: 1
		});
	}
	function replace2(to, state) {
		action = "REPLACE";
		let location = isLocation(to) ? to : createLocation(history.location, to, state);
		if (validateLocation) validateLocation(location, to);
		index = getIndex();
		let historyState = getHistoryState(location, index);
		let url = history.createHref(location.mask || location);
		globalHistory.replaceState(historyState, "", url);
		if (v5Compat && listener) listener({
			action,
			location: history.location,
			delta: 0
		});
	}
	function createURL(to) {
		return createBrowserURLImpl(window2, to);
	}
	let history = {
		get action() {
			return action;
		},
		get location() {
			return getLocation(window2, globalHistory);
		},
		listen(fn) {
			if (listener) throw new Error("A history only accepts one active listener");
			window2.addEventListener(PopStateEventType, handlePop);
			listener = fn;
			return () => {
				window2.removeEventListener(PopStateEventType, handlePop);
				listener = null;
			};
		},
		createHref(to) {
			return createHref2(window2, to);
		},
		createURL,
		encodeLocation(to) {
			let url = createURL(to);
			return {
				pathname: url.pathname,
				search: url.search,
				hash: url.hash
			};
		},
		push,
		replace: replace2,
		go(n) {
			return globalHistory.go(n);
		}
	};
	return history;
}
function createBrowserURLImpl(windowImpl, to, isAbsolute = false) {
	let base = "http://localhost";
	if (windowImpl) base = windowImpl.location.origin !== "null" ? windowImpl.location.origin : windowImpl.location.href;
	invariant$1(base, "No window.location.(origin|href) available to create URL");
	let href = typeof to === "string" ? to : createPath(to);
	href = href.replace(/ $/, "%20");
	if (!isAbsolute && PROTOCOL_RELATIVE_URL_REGEX.test(href)) href = base + href;
	return new URL(href, base);
}
function createContext(defaultValue) {
	return { defaultValue };
}
function isUnsupportedLazyRouteObjectKey(key) {
	return unsupportedLazyRouteObjectKeys.has(key);
}
function isUnsupportedLazyRouteFunctionKey(key) {
	return unsupportedLazyRouteFunctionKeys.has(key);
}
function isIndexRoute(route) {
	return route.index === true;
}
function convertRoutesToDataRoutes(routes, mapRouteProperties2, parentPath = [], manifest = {}, allowInPlaceMutations = false) {
	return routes.map((route, index) => {
		let treePath = [...parentPath, String(index)];
		let id = typeof route.id === "string" ? route.id : treePath.join("-");
		invariant$1(route.index !== true || !route.children, `Cannot specify children on an index route`);
		invariant$1(allowInPlaceMutations || !manifest[id], `Found a route id collision on id "${id}".  Route id's must be globally unique within Data Router usages`);
		if (isIndexRoute(route)) {
			let indexRoute = {
				...route,
				id
			};
			manifest[id] = mergeRouteUpdates(indexRoute, mapRouteProperties2(indexRoute));
			return indexRoute;
		} else {
			let pathOrLayoutRoute = {
				...route,
				id,
				children: void 0
			};
			manifest[id] = mergeRouteUpdates(pathOrLayoutRoute, mapRouteProperties2(pathOrLayoutRoute));
			if (route.children) pathOrLayoutRoute.children = convertRoutesToDataRoutes(route.children, mapRouteProperties2, treePath, manifest, allowInPlaceMutations);
			return pathOrLayoutRoute;
		}
	});
}
function mergeRouteUpdates(route, updates) {
	return Object.assign(route, {
		...updates,
		...typeof updates.lazy === "object" && updates.lazy != null ? { lazy: {
			...route.lazy,
			...updates.lazy
		} } : {}
	});
}
function matchRoutes(routes, locationArg, basename = "/") {
	return matchRoutesImpl(routes, locationArg, basename, false);
}
function matchRoutesImpl(routes, locationArg, basename, allowPartial, precomputedBranches) {
	let pathname = stripBasename((typeof locationArg === "string" ? parsePath(locationArg) : locationArg).pathname || "/", basename);
	if (pathname == null) return null;
	let branches = precomputedBranches ?? flattenAndRankRoutes(routes);
	let matches = null;
	let decoded = decodePath(pathname);
	for (let i = 0; matches == null && i < branches.length; ++i) matches = matchRouteBranch(branches[i], decoded, allowPartial);
	return matches;
}
function convertRouteMatchToUiMatch(match, loaderData) {
	let { route, pathname, params } = match;
	return {
		id: route.id,
		pathname,
		params,
		data: loaderData[route.id],
		loaderData: loaderData[route.id],
		handle: route.handle
	};
}
function flattenAndRankRoutes(routes) {
	let branches = flattenRoutes(routes);
	rankRouteBranches(branches);
	return branches;
}
function flattenRoutes(routes, branches = [], parentsMeta = [], parentPath = "", _hasParentOptionalSegments = false) {
	let flattenRoute = (route, index, hasParentOptionalSegments = _hasParentOptionalSegments, relativePath) => {
		let meta = {
			relativePath: relativePath === void 0 ? route.path || "" : relativePath,
			caseSensitive: route.caseSensitive === true,
			childrenIndex: index,
			route
		};
		if (meta.relativePath.startsWith("/")) {
			if (!meta.relativePath.startsWith(parentPath) && hasParentOptionalSegments) return;
			invariant$1(meta.relativePath.startsWith(parentPath), `Absolute route path "${meta.relativePath}" nested under path "${parentPath}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`);
			meta.relativePath = meta.relativePath.slice(parentPath.length);
		}
		let path = joinPaths([parentPath, meta.relativePath]);
		let routesMeta = parentsMeta.concat(meta);
		if (route.children && route.children.length > 0) {
			invariant$1(route.index !== true, `Index routes must not have child routes. Please remove all child routes from route path "${path}".`);
			flattenRoutes(route.children, branches, routesMeta, path, hasParentOptionalSegments);
		}
		if (route.path == null && !route.index) return;
		branches.push({
			path,
			score: computeScore(path, route.index),
			routesMeta: routesMeta.map((meta2, i) => {
				let [matcher, params] = compilePath(meta2.relativePath, meta2.caseSensitive, i === routesMeta.length - 1);
				return {
					...meta2,
					matcher,
					compiledParams: params
				};
			})
		});
	};
	routes.forEach((route, index) => {
		if (route.path === "" || !route.path?.includes("?")) flattenRoute(route, index);
		else for (let exploded of explodeOptionalSegments(route.path)) flattenRoute(route, index, true, exploded);
	});
	return branches;
}
function explodeOptionalSegments(path) {
	let segments = path.split("/");
	if (segments.length === 0) return [];
	let [first, ...rest] = segments;
	let isOptional = first.endsWith("?");
	let required = first.replace(/\?$/, "");
	if (rest.length === 0) return isOptional ? [required, ""] : [required];
	let restExploded = explodeOptionalSegments(rest.join("/"));
	let result = [];
	result.push(...restExploded.map((subpath) => subpath === "" ? required : [required, subpath].join("/")));
	if (isOptional) result.push(...restExploded);
	return result.map((exploded) => path.startsWith("/") && exploded === "" ? "/" : exploded);
}
function rankRouteBranches(branches) {
	branches.sort((a, b) => a.score !== b.score ? b.score - a.score : compareIndexes(a.routesMeta.map((meta) => meta.childrenIndex), b.routesMeta.map((meta) => meta.childrenIndex)));
}
function computeScore(path, index) {
	let segments = path.split("/");
	let initialScore = segments.length;
	if (segments.some(isSplat)) initialScore += splatPenalty;
	if (index) initialScore += indexRouteValue;
	return segments.filter((s) => !isSplat(s)).reduce((score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue), initialScore);
}
function compareIndexes(a, b) {
	return a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]) ? a[a.length - 1] - b[b.length - 1] : 0;
}
function matchRouteBranch(branch, pathname, allowPartial = false) {
	let { routesMeta } = branch;
	let matchedParams = {};
	let matchedPathname = "/";
	let matches = [];
	for (let i = 0; i < routesMeta.length; ++i) {
		let meta = routesMeta[i];
		let end = i === routesMeta.length - 1;
		let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
		let pattern = {
			path: meta.relativePath,
			caseSensitive: meta.caseSensitive,
			end
		};
		let match = meta.matcher && meta.compiledParams ? matchPathImpl(pattern, remainingPathname, meta.matcher, meta.compiledParams) : matchPath(pattern, remainingPathname);
		let route = meta.route;
		if (!match && end && allowPartial && !routesMeta[routesMeta.length - 1].route.index) match = matchPath({
			path: meta.relativePath,
			caseSensitive: meta.caseSensitive,
			end: false
		}, remainingPathname);
		if (!match) return null;
		Object.assign(matchedParams, match.params);
		matches.push({
			params: matchedParams,
			pathname: joinPaths([matchedPathname, match.pathname]),
			pathnameBase: normalizePathname(joinPaths([matchedPathname, match.pathnameBase])),
			route
		});
		if (match.pathnameBase !== "/") matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
	}
	return matches;
}
function generatePath(originalPath, params = {}) {
	let path = originalPath;
	if (path.endsWith("*") && path !== "*" && !path.endsWith("/*")) {
		warning(false, `Route path "${path}" will be treated as if it were "${path.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${path.replace(/\*$/, "/*")}".`);
		path = path.replace(/\*$/, "/*");
	}
	const prefix = path.startsWith("/") ? "/" : "";
	const stringify2 = (p) => p == null ? "" : typeof p === "string" ? p : String(p);
	return prefix + path.split(/\/+/).map((segment, index, array) => {
		if (index === array.length - 1 && segment === "*") return stringify2(params["*"]);
		const keyMatch = segment.match(/^:([\w-]+)(\??)(.*)/);
		if (keyMatch) {
			const [, key, optional, suffix] = keyMatch;
			let param = params[key];
			invariant$1(optional === "?" || param != null, `Missing ":${key}" param`);
			return encodeURIComponent(stringify2(param)) + suffix;
		}
		return segment.replace(/\?$/g, "");
	}).filter((segment) => !!segment).join("/");
}
function matchPath(pattern, pathname) {
	if (typeof pattern === "string") pattern = {
		path: pattern,
		caseSensitive: false,
		end: true
	};
	let [matcher, compiledParams] = compilePath(pattern.path, pattern.caseSensitive, pattern.end);
	return matchPathImpl(pattern, pathname, matcher, compiledParams);
}
function matchPathImpl(pattern, pathname, matcher, compiledParams) {
	let match = pathname.match(matcher);
	if (!match) return null;
	let matchedPathname = match[0];
	let pathnameBase = removeTrailingSlash(matchedPathname, 1);
	let captureGroups = match.slice(1);
	return {
		params: compiledParams.reduce((memo2, { paramName, isOptional }, index) => {
			if (paramName === "*") {
				let splatValue = captureGroups[index] || "";
				pathnameBase = removeTrailingSlash(matchedPathname.slice(0, matchedPathname.length - splatValue.length), 1);
			}
			const value = captureGroups[index];
			if (isOptional && !value) memo2[paramName] = void 0;
			else memo2[paramName] = (value || "").replace(/%2F/g, "/");
			return memo2;
		}, {}),
		pathname: matchedPathname,
		pathnameBase,
		pattern
	};
}
function compilePath(path, caseSensitive = false, end = true) {
	warning(path === "*" || !path.endsWith("*") || path.endsWith("/*"), `Route path "${path}" will be treated as if it were "${path.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${path.replace(/\*$/, "/*")}".`);
	let params = [];
	let regexpSource = "^" + path.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (match, paramName, isOptional, index, str) => {
		params.push({
			paramName,
			isOptional: isOptional != null
		});
		if (isOptional) {
			let nextChar = str.charAt(index + match.length);
			if (nextChar && nextChar !== "/") return "/([^\\/]*)";
			return "(?:/([^\\/]*))?";
		}
		return "/([^\\/]+)";
	}).replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
	if (path.endsWith("*")) {
		params.push({ paramName: "*" });
		regexpSource += path === "*" || path === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$";
	} else if (end) regexpSource += "\\/*$";
	else if (path !== "" && path !== "/") regexpSource += "(?:(?=\\/|$))";
	return [new RegExp(regexpSource, caseSensitive ? void 0 : "i"), params];
}
function decodePath(value) {
	try {
		return value.split("/").map((v) => decodeURIComponent(v).replace(/\//g, "%2F")).join("/");
	} catch (error) {
		warning(false, `The URL path "${value}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${error}).`);
		return value;
	}
}
function stripBasename(pathname, basename) {
	if (basename === "/") return pathname;
	if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) return null;
	let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
	let nextChar = pathname.charAt(startIndex);
	if (nextChar && nextChar !== "/") return null;
	return pathname.slice(startIndex) || "/";
}
function prependBasename({ basename, pathname }) {
	return pathname === "/" ? basename : joinPaths([basename, pathname]);
}
function resolvePath(to, fromPathname = "/") {
	let { pathname: toPathname, search = "", hash = "" } = typeof to === "string" ? parsePath(to) : to;
	let pathname;
	if (toPathname) {
		toPathname = removeDoubleSlashes(toPathname);
		if (toPathname.startsWith("/") || toPathname.startsWith("\\")) pathname = resolvePathname(toPathname.substring(1), "/");
		else pathname = resolvePathname(toPathname, fromPathname);
	} else pathname = fromPathname;
	return {
		pathname,
		search: normalizeSearch(search),
		hash: normalizeHash(hash)
	};
}
function resolvePathname(relativePath, fromPathname) {
	let segments = removeTrailingSlash(fromPathname).split("/");
	relativePath.split("/").forEach((segment) => {
		if (segment === "..") {
			if (segments.length > 1) segments.pop();
		} else if (segment !== ".") segments.push(segment);
	});
	return segments.length > 1 ? segments.join("/") : "/";
}
function getInvalidPathError(char, field, dest, path) {
	return `Cannot include a '${char}' character in a manually specified \`to.${field}\` field [${JSON.stringify(path)}].  Please separate it out to the \`to.${dest}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`;
}
function getPathContributingMatches(matches) {
	return matches.filter((match, index) => index === 0 || match.route.path && match.route.path.length > 0);
}
function getResolveToMatches(matches) {
	let pathMatches = getPathContributingMatches(matches);
	return pathMatches.map((match, idx) => idx === pathMatches.length - 1 ? match.pathname : match.pathnameBase);
}
function resolveTo(toArg, routePathnames, locationPathname, isPathRelative = false) {
	let to;
	if (typeof toArg === "string") to = parsePath(toArg);
	else {
		to = { ...toArg };
		invariant$1(!to.pathname || !to.pathname.includes("?"), getInvalidPathError("?", "pathname", "search", to));
		invariant$1(!to.pathname || !to.pathname.includes("#"), getInvalidPathError("#", "pathname", "hash", to));
		invariant$1(!to.search || !to.search.includes("#"), getInvalidPathError("#", "search", "hash", to));
	}
	let isEmptyPath = toArg === "" || to.pathname === "";
	let toPathname = isEmptyPath ? "/" : to.pathname;
	let from;
	if (toPathname == null) from = locationPathname;
	else {
		let routePathnameIndex = routePathnames.length - 1;
		if (!isPathRelative && toPathname.startsWith("..")) {
			let toSegments = toPathname.split("/");
			while (toSegments[0] === "..") {
				toSegments.shift();
				routePathnameIndex -= 1;
			}
			to.pathname = toSegments.join("/");
		}
		from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
	}
	let path = resolvePath(to, from);
	let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");
	let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
	if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) path.pathname += "/";
	return path;
}
function removeTrailingSlash(path, minLength = 0) {
	let end = path.length;
	while (end > minLength && path.charCodeAt(end - 1) === 47) end--;
	return end === path.length ? path : path.slice(0, end);
}
function data(data2, init) {
	return new DataWithResponseInit(data2, typeof init === "number" ? { status: init } : init);
}
function isRouteErrorResponse(error) {
	return error != null && typeof error.status === "number" && typeof error.statusText === "string" && typeof error.internal === "boolean" && "data" in error;
}
function getRoutePattern(matches) {
	return joinPaths(matches.map((m) => m.route.path).filter(Boolean)) || "/";
}
function parseToInfo(_to, basename) {
	let to = _to;
	if (typeof to !== "string" || !ABSOLUTE_URL_REGEX.test(to)) return {
		absoluteURL: void 0,
		isExternal: false,
		to
	};
	let absoluteURL = to;
	let isExternal = false;
	if (isBrowser) try {
		let currentUrl = new URL(window.location.href);
		let targetUrl = PROTOCOL_RELATIVE_URL_REGEX.test(to) ? new URL(normalizeProtocolRelativeUrl(to, currentUrl.protocol)) : new URL(to);
		let path = stripBasename(targetUrl.pathname, basename);
		if (targetUrl.origin === currentUrl.origin && path != null) to = path + targetUrl.search + targetUrl.hash;
		else isExternal = true;
	} catch (e) {
		warning(false, `<Link to="${to}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`);
	}
	return {
		absoluteURL,
		isExternal,
		to
	};
}
function getRouteInstrumentationUpdates(fns, route) {
	let aggregated = {
		lazy: [],
		"lazy.loader": [],
		"lazy.action": [],
		"lazy.middleware": [],
		middleware: [],
		loader: [],
		action: []
	};
	fns.forEach((fn) => fn({
		id: route.id,
		index: route.index,
		path: route.path,
		instrument(i) {
			let keys = Object.keys(aggregated);
			for (let key of keys) if (i[key]) aggregated[key].push(i[key]);
		}
	}));
	let updates = {};
	if (typeof route.lazy === "function" && aggregated.lazy.length > 0) {
		let instrumented = wrapImpl(aggregated.lazy, route.lazy, () => void 0);
		if (instrumented) updates.lazy = instrumented;
	}
	if (typeof route.lazy === "object") {
		let lazyObject = route.lazy;
		[
			"middleware",
			"loader",
			"action"
		].forEach((key) => {
			let lazyFn = lazyObject[key];
			let instrumentations = aggregated[`lazy.${key}`];
			if (typeof lazyFn === "function" && instrumentations.length > 0) {
				let instrumented = wrapImpl(instrumentations, lazyFn, () => void 0);
				if (instrumented) updates.lazy = Object.assign(updates.lazy || {}, { [key]: instrumented });
			}
		});
	}
	["loader", "action"].forEach((key) => {
		let handler = route[key];
		if (typeof handler === "function" && aggregated[key].length > 0) {
			let original = handler[UninstrumentedSymbol] ?? handler;
			let instrumented = wrapImpl(aggregated[key], original, (...args) => getHandlerInfo(args[0]));
			if (instrumented) {
				if (key === "loader" && original.hydrate === true) instrumented.hydrate = true;
				instrumented[UninstrumentedSymbol] = original;
				updates[key] = instrumented;
			}
		}
	});
	if (route.middleware && route.middleware.length > 0 && aggregated.middleware.length > 0) updates.middleware = route.middleware.map((middleware) => {
		let original = middleware[UninstrumentedSymbol] ?? middleware;
		let instrumented = wrapImpl(aggregated.middleware, original, (...args) => getHandlerInfo(args[0]));
		if (instrumented) {
			instrumented[UninstrumentedSymbol] = original;
			return instrumented;
		}
		return middleware;
	});
	return updates;
}
function instrumentClientSideRouter(router, fns) {
	let aggregated = {
		navigate: [],
		fetch: []
	};
	fns.forEach((fn) => fn({ instrument(i) {
		let keys = Object.keys(i);
		for (let key of keys) if (i[key]) aggregated[key].push(i[key]);
	} }));
	if (aggregated.navigate.length > 0) {
		let navigate = router.navigate[UninstrumentedSymbol] ?? router.navigate;
		let instrumentedNavigate = wrapImpl(aggregated.navigate, navigate, (...args) => {
			let [to, opts] = args;
			return {
				to: typeof to === "number" || typeof to === "string" ? to : to ? createPath(to) : ".",
				...getRouterInfo(router, opts ?? {})
			};
		});
		if (instrumentedNavigate) {
			instrumentedNavigate[UninstrumentedSymbol] = navigate;
			router.navigate = instrumentedNavigate;
		}
	}
	if (aggregated.fetch.length > 0) {
		let fetch2 = router.fetch[UninstrumentedSymbol] ?? router.fetch;
		let instrumentedFetch = wrapImpl(aggregated.fetch, fetch2, (...args) => {
			let [key, , href, opts] = args;
			return {
				href: href ?? ".",
				fetcherKey: key,
				...getRouterInfo(router, opts ?? {})
			};
		});
		if (instrumentedFetch) {
			instrumentedFetch[UninstrumentedSymbol] = fetch2;
			router.fetch = instrumentedFetch;
		}
	}
	return router;
}
function instrumentHandler(handler, fns) {
	let aggregated = { request: [] };
	fns.forEach((fn) => fn({ instrument(i) {
		let keys = Object.keys(i);
		for (let key of keys) if (i[key]) aggregated[key].push(i[key]);
	} }));
	let instrumentedHandler = handler;
	if (aggregated.request.length > 0) instrumentedHandler = wrapImpl(aggregated.request, handler, (...args) => {
		let [request, context] = args;
		return {
			request: getReadonlyRequest(request),
			context: context != null ? getReadonlyContext(context) : context
		};
	});
	return instrumentedHandler;
}
function wrapImpl(impls, handler, getInfo) {
	if (impls.length === 0) return null;
	return async (...args) => {
		let result = await recurseRight(impls, getInfo(...args), () => handler(...args), impls.length - 1);
		if (result.type === "error") throw result.value;
		return result.value;
	};
}
async function recurseRight(impls, info, handler, index) {
	let impl = impls[index];
	let result;
	if (!impl) try {
		result = {
			type: "success",
			value: await handler()
		};
	} catch (e) {
		result = {
			type: "error",
			value: e
		};
	}
	else {
		let handlerPromise = void 0;
		let callHandler = async () => {
			if (handlerPromise) console.error("You cannot call instrumented handlers more than once");
			else handlerPromise = recurseRight(impls, info, handler, index - 1);
			result = await handlerPromise;
			invariant$1(result, "Expected a result");
			if (result.type === "error" && result.value instanceof Error) return {
				status: "error",
				error: result.value
			};
			return {
				status: "success",
				error: void 0
			};
		};
		try {
			await impl(callHandler, info);
		} catch (e) {
			console.error("An instrumentation function threw an error:", e);
		}
		if (!handlerPromise) await callHandler();
		await handlerPromise;
	}
	if (result) return result;
	return {
		type: "error",
		value: /* @__PURE__ */ new Error("No result assigned in instrumentation chain.")
	};
}
function getHandlerInfo(args) {
	let { request, context, params, pattern } = args;
	return {
		request: getReadonlyRequest(request),
		params: { ...params },
		pattern,
		context: getReadonlyContext(context)
	};
}
function getRouterInfo(router, opts) {
	return {
		currentUrl: createPath(router.state.location),
		..."formMethod" in opts ? { formMethod: opts.formMethod } : {},
		..."formEncType" in opts ? { formEncType: opts.formEncType } : {},
		..."formData" in opts ? { formData: opts.formData } : {},
		..."body" in opts ? { body: opts.body } : {}
	};
}
function getReadonlyRequest(request) {
	return {
		method: request.method,
		url: request.url,
		headers: { get: (...args) => request.headers.get(...args) }
	};
}
function getReadonlyContext(context) {
	if (isPlainObject(context)) {
		let frozen = { ...context };
		Object.freeze(frozen);
		return frozen;
	} else return { get: (ctx) => context.get(ctx) };
}
function isPlainObject(thing) {
	if (thing === null || typeof thing !== "object") return false;
	const proto = Object.getPrototypeOf(thing);
	return proto === Object.prototype || proto === null || Object.getOwnPropertyNames(proto).sort().join("\0") === objectProtoNames;
}
function getNavigatorCurrentUrl(navigator) {
	if (navigator.createURL) return navigator.createURL("/");
	try {
		return new URL(navigator.createHref("/"), DEFAULT_NAVIGATION_URL);
	} catch {
		return DEFAULT_NAVIGATION_URL;
	}
}
function isSameOrigin(a, b) {
	return a.origin === b.origin && (a.origin !== "null" || a.protocol === b.protocol && a.host === b.host);
}
function isExplicitUrl(destination, target) {
	if (destination.startsWith("//")) return true;
	let protocol = target.protocol.toLowerCase();
	if (!destination.toLowerCase().startsWith(protocol)) return false;
	return target.host === "" || destination.slice(protocol.length).startsWith("//");
}
function validateNavigationTarget(original, resolved, currentUrl, externalPolicy) {
	let originalUrl = null;
	try {
		originalUrl = original == null ? null : new URL(original, currentUrl);
	} catch {}
	let resolvedUrl = new URL(resolved, currentUrl);
	let originalIsExternal = originalUrl != null && !isSameOrigin(originalUrl, currentUrl);
	let resolvedIsExternal = !isSameOrigin(resolvedUrl, currentUrl);
	if (externalPolicy === "reject") {
		if (originalIsExternal || resolvedIsExternal) throw new Error("External navigation is not allowed");
	} else if (resolvedIsExternal) {
		if (originalUrl == null || !isExplicitUrl(original, originalUrl) || !isSameOrigin(originalUrl, resolvedUrl)) throw new Error("External navigation is not allowed");
	}
}
function createRouter(init) {
	const routerWindow = init.window ? init.window : typeof window !== "undefined" ? window : void 0;
	const isBrowser3 = typeof routerWindow !== "undefined" && typeof routerWindow.document !== "undefined" && typeof routerWindow.document.createElement !== "undefined";
	invariant$1(init.routes.length > 0, "You must provide a non-empty routes array to createRouter");
	let hydrationRouteProperties2 = init.hydrationRouteProperties || [];
	let _mapRouteProperties = init.mapRouteProperties || defaultMapRouteProperties;
	let mapRouteProperties2 = _mapRouteProperties;
	if (init.instrumentations) {
		let instrumentations = init.instrumentations;
		mapRouteProperties2 = (route) => {
			return {
				..._mapRouteProperties(route),
				...getRouteInstrumentationUpdates(instrumentations.map((i) => i.route).filter(Boolean), route)
			};
		};
	}
	let manifest = {};
	let dataRoutes = new DataRoutes(convertRoutesToDataRoutes(init.routes, mapRouteProperties2, void 0, manifest));
	let basename = init.basename || "/";
	if (!basename.startsWith("/")) basename = `/${basename}`;
	let dataStrategyImpl = init.dataStrategy || defaultDataStrategyWithMiddleware;
	let future = { ...init.future };
	let unlistenHistory = null;
	let subscribers = /* @__PURE__ */ new Set();
	let bufferedInitialStateUpdate = null;
	let savedScrollPositions2 = null;
	let getScrollRestorationKey2 = null;
	let getScrollPosition = null;
	let initialScrollRestored = init.hydrationData != null;
	let initialMatches = matchRoutesImpl(dataRoutes.activeRoutes, init.history.location, basename, false, dataRoutes.branches);
	let initialMatchesIsFOW = false;
	let initialErrors = null;
	let initialized;
	let renderFallback;
	if (initialMatches == null && !init.patchRoutesOnNavigation) {
		let error = getInternalRouterError(404, { pathname: init.history.location.pathname });
		let { matches, route } = getShortCircuitMatches(dataRoutes.activeRoutes);
		initialized = true;
		renderFallback = !initialized;
		initialMatches = matches;
		initialErrors = { [route.id]: error };
	} else {
		if (initialMatches && !init.hydrationData) {
			if (checkFogOfWar(initialMatches, dataRoutes.activeRoutes, init.history.location.pathname).active) initialMatches = null;
		}
		if (!initialMatches) {
			initialized = false;
			renderFallback = !initialized;
			initialMatches = [];
			let fogOfWar = checkFogOfWar(null, dataRoutes.activeRoutes, init.history.location.pathname);
			if (fogOfWar.active && fogOfWar.matches) {
				initialMatchesIsFOW = true;
				initialMatches = fogOfWar.matches;
			}
		} else if (initialMatches.some((m) => m.route.lazy)) {
			initialized = false;
			renderFallback = !initialized;
		} else if (!initialMatches.some((m) => routeHasLoaderOrMiddleware(m.route))) {
			initialized = true;
			renderFallback = !initialized;
		} else {
			let loaderData = init.hydrationData ? init.hydrationData.loaderData : null;
			let errors = init.hydrationData ? init.hydrationData.errors : null;
			let relevantMatches = initialMatches;
			if (errors) {
				let idx = initialMatches.findIndex((m) => errors[m.route.id] !== void 0);
				relevantMatches = relevantMatches.slice(0, idx + 1);
			}
			renderFallback = false;
			initialized = true;
			relevantMatches.forEach((m) => {
				let status = getRouteHydrationStatus(m.route, loaderData, errors);
				renderFallback = renderFallback || status.renderFallback;
				initialized = initialized && !status.shouldLoad;
			});
		}
	}
	let router;
	let state = {
		historyAction: init.history.action,
		location: init.history.location,
		matches: initialMatches,
		initialized,
		renderFallback,
		navigation: IDLE_NAVIGATION,
		restoreScrollPosition: init.hydrationData != null ? false : null,
		preventScrollReset: false,
		revalidation: "idle",
		loaderData: init.hydrationData && init.hydrationData.loaderData || {},
		actionData: init.hydrationData && init.hydrationData.actionData || null,
		errors: init.hydrationData && init.hydrationData.errors || initialErrors,
		fetchers: /* @__PURE__ */ new Map(),
		blockers: /* @__PURE__ */ new Map()
	};
	let pendingAction = "POP";
	let pendingPopstateNavigationDfd = null;
	let pendingPreventScrollReset = false;
	let pendingNavigationController;
	let pendingViewTransitionEnabled = false;
	let appliedViewTransitions = /* @__PURE__ */ new Map();
	let removePageHideEventListener = null;
	let isUninterruptedRevalidation = false;
	let isRevalidationRequired = false;
	let cancelledFetcherLoads = /* @__PURE__ */ new Set();
	let fetchControllers = /* @__PURE__ */ new Map();
	let incrementingLoadId = 0;
	let pendingNavigationLoadId = -1;
	let fetchReloadIds = /* @__PURE__ */ new Map();
	let fetchRedirectIds = /* @__PURE__ */ new Set();
	let fetchLoadMatches = /* @__PURE__ */ new Map();
	let activeFetchers = /* @__PURE__ */ new Map();
	let fetchersQueuedForDeletion = /* @__PURE__ */ new Set();
	let blockerFunctions = /* @__PURE__ */ new Map();
	let unblockBlockerHistoryUpdate = void 0;
	let pendingRevalidationDfd = null;
	function initialize() {
		unlistenHistory = init.history.listen(({ action: historyAction, location, delta }) => {
			if (unblockBlockerHistoryUpdate) {
				unblockBlockerHistoryUpdate();
				unblockBlockerHistoryUpdate = void 0;
				return;
			}
			warning(blockerFunctions.size === 0 || delta != null, "You are trying to use a blocker on a POP navigation to a location that was not created by @remix-run/router. This will fail silently in production. This can happen if you are navigating outside the router via `window.history.pushState`/`window.location.hash` instead of using router navigation APIs.  This can also happen if you are using createHashRouter and the user manually changes the URL.");
			let blockerKey = shouldBlockNavigation({
				currentLocation: state.location,
				nextLocation: location,
				historyAction
			});
			if (blockerKey && delta != null) {
				let nextHistoryUpdatePromise = new Promise((resolve) => {
					unblockBlockerHistoryUpdate = resolve;
				});
				init.history.go(delta * -1);
				updateBlocker(blockerKey, {
					state: "blocked",
					location,
					proceed() {
						updateBlocker(blockerKey, {
							state: "proceeding",
							proceed: void 0,
							reset: void 0,
							location
						});
						nextHistoryUpdatePromise.then(() => init.history.go(delta));
					},
					reset() {
						let blockers = new Map(state.blockers);
						blockers.set(blockerKey, IDLE_BLOCKER);
						updateState({ blockers });
					}
				});
				pendingPopstateNavigationDfd?.resolve();
				pendingPopstateNavigationDfd = null;
				return;
			}
			return startNavigation(historyAction, location);
		});
		if (isBrowser3) {
			restoreAppliedTransitions(routerWindow, appliedViewTransitions);
			let _saveAppliedTransitions = () => persistAppliedTransitions(routerWindow, appliedViewTransitions);
			routerWindow.addEventListener("pagehide", _saveAppliedTransitions);
			removePageHideEventListener = () => routerWindow.removeEventListener("pagehide", _saveAppliedTransitions);
		}
		if (!state.initialized) startNavigation("POP", state.location, { initialHydration: true });
		return router;
	}
	function dispose() {
		if (unlistenHistory) unlistenHistory();
		if (removePageHideEventListener) removePageHideEventListener();
		subscribers.clear();
		pendingNavigationController && pendingNavigationController.abort();
		state.fetchers.forEach((_, key) => deleteFetcher(state.fetchers, key));
		state.blockers.forEach((_, key) => deleteBlocker(key));
	}
	function subscribe(fn) {
		subscribers.add(fn);
		if (bufferedInitialStateUpdate) {
			let { newErrors } = bufferedInitialStateUpdate;
			bufferedInitialStateUpdate = null;
			fn(state, {
				deletedFetchers: [],
				newErrors,
				viewTransitionOpts: void 0,
				flushSync: false
			});
		}
		return () => subscribers.delete(fn);
	}
	function updateState(newState, opts = {}) {
		if (newState.matches) newState.matches = newState.matches.map((m) => {
			let route = manifest[m.route.id];
			let matchRoute = m.route;
			if (matchRoute.element !== route.element || matchRoute.errorElement !== route.errorElement || matchRoute.hydrateFallbackElement !== route.hydrateFallbackElement) return {
				...m,
				route
			};
			return m;
		});
		state = {
			...state,
			...newState
		};
		let unmountedFetchers = [];
		let mountedFetchers = [];
		state.fetchers.forEach((fetcher, key) => {
			if (fetcher.state === "idle") {
				if (fetchersQueuedForDeletion.has(key)) unmountedFetchers.push(key);
				else mountedFetchers.push(key);
			}
		});
		fetchersQueuedForDeletion.forEach((key) => {
			if (!state.fetchers.has(key) && !fetchControllers.has(key)) unmountedFetchers.push(key);
		});
		if (subscribers.size === 0) bufferedInitialStateUpdate = { newErrors: newState.errors ?? null };
		[...subscribers].forEach((subscriber) => subscriber(state, {
			deletedFetchers: unmountedFetchers,
			newErrors: newState.errors ?? null,
			viewTransitionOpts: opts.viewTransitionOpts,
			flushSync: opts.flushSync === true
		}));
		unmountedFetchers.forEach((key) => deleteFetcher(state.fetchers, key));
		mountedFetchers.forEach((key) => state.fetchers.delete(key));
	}
	function completeNavigation(location, newState, { flushSync } = {}) {
		let isActionReload = state.actionData != null && state.navigation.formMethod != null && isMutationMethod(state.navigation.formMethod) && state.navigation.state === "loading" && location.state?._isRedirect !== true;
		let actionData;
		if (newState.actionData) {
			if (Object.keys(newState.actionData).length > 0) actionData = newState.actionData;
			else actionData = null;
		} else if (isActionReload) actionData = state.actionData;
		else actionData = null;
		let loaderData = newState.loaderData ? mergeLoaderData(state.loaderData, newState.loaderData, newState.matches || [], newState.errors) : state.loaderData;
		let blockers = state.blockers;
		if (blockers.size > 0) {
			blockers = new Map(blockers);
			blockers.forEach((_, k) => blockers.set(k, IDLE_BLOCKER));
		}
		let restoreScrollPosition = isUninterruptedRevalidation ? false : getSavedScrollPosition(location, newState.matches || state.matches);
		let preventScrollReset = pendingPreventScrollReset === true || state.navigation.formMethod != null && isMutationMethod(state.navigation.formMethod) && location.state?._isRedirect !== true;
		dataRoutes.commitHmrRoutes();
		if (isUninterruptedRevalidation) {} else if (pendingAction === "POP") {} else if (pendingAction === "PUSH") init.history.push(location, location.state);
		else if (pendingAction === "REPLACE") init.history.replace(location, location.state);
		let viewTransitionOpts;
		if (pendingAction === "POP" && !isUninterruptedRevalidation && location !== state.location) {
			let priorPaths = appliedViewTransitions.get(state.location.pathname);
			if (priorPaths && priorPaths.has(location.pathname)) viewTransitionOpts = {
				currentLocation: state.location,
				nextLocation: location
			};
			else if (appliedViewTransitions.has(location.pathname)) viewTransitionOpts = {
				currentLocation: location,
				nextLocation: state.location
			};
		} else if (pendingViewTransitionEnabled) {
			let toPaths = appliedViewTransitions.get(state.location.pathname);
			if (toPaths) toPaths.add(location.pathname);
			else {
				toPaths = /* @__PURE__ */ new Set([location.pathname]);
				appliedViewTransitions.set(state.location.pathname, toPaths);
			}
			viewTransitionOpts = {
				currentLocation: state.location,
				nextLocation: location
			};
		}
		updateState({
			...newState,
			actionData,
			loaderData,
			historyAction: pendingAction,
			location,
			initialized: true,
			renderFallback: false,
			navigation: IDLE_NAVIGATION,
			revalidation: "idle",
			restoreScrollPosition,
			preventScrollReset,
			blockers
		}, {
			viewTransitionOpts,
			flushSync: flushSync === true
		});
		pendingAction = "POP";
		pendingPreventScrollReset = false;
		pendingViewTransitionEnabled = false;
		isUninterruptedRevalidation = false;
		isRevalidationRequired = false;
		pendingPopstateNavigationDfd?.resolve();
		pendingPopstateNavigationDfd = null;
		pendingRevalidationDfd?.resolve();
		pendingRevalidationDfd = null;
	}
	async function navigate(to, opts) {
		pendingPopstateNavigationDfd?.resolve();
		pendingPopstateNavigationDfd = null;
		if (typeof to === "number") {
			if (!pendingPopstateNavigationDfd) pendingPopstateNavigationDfd = createDeferred();
			let promise = pendingPopstateNavigationDfd.promise;
			init.history.go(to);
			return promise;
		}
		let { path, submission, error } = normalizeNavigateOptions(false, normalizeTo(state.location, state.matches, basename, to, opts?.fromRouteId, opts?.relative), opts);
		let maskPath;
		if (opts?.mask) {
			let partialPath = typeof opts.mask === "string" ? parsePath(opts.mask) : {
				...state.location.mask,
				...opts.mask
			};
			maskPath = {
				pathname: partialPath.pathname ?? "",
				search: partialPath.search ?? "",
				hash: partialPath.hash ?? ""
			};
			if (PROTOCOL_RELATIVE_URL_REGEX.test(maskPath.pathname)) throw new Error("External navigation is not allowed");
			else if (maskPath.pathname.startsWith("\\")) maskPath.pathname = maskPath.pathname.replace(/^\\+/, "/");
			validateNavigationTarget(typeof opts.mask === "string" ? opts.mask : createPath(opts.mask), createPath(maskPath), init.history.createURL("/"), "reject");
		}
		let currentLocation = state.location;
		let nextLocation = createLocation(currentLocation, path, opts && opts.state, void 0, maskPath);
		nextLocation = {
			...nextLocation,
			...init.history.encodeLocation(nextLocation)
		};
		validateNavigationTarget(to == null ? init.history.createHref(state.location) : typeof to === "string" ? to : createPath(to), init.history.createHref(nextLocation.mask || nextLocation), init.history.createURL("/"), "reject");
		let userReplace = opts && opts.replace != null ? opts.replace : void 0;
		let historyAction = "PUSH";
		if (userReplace === true) historyAction = "REPLACE";
		else if (userReplace === false) {} else if (submission != null && isMutationMethod(submission.formMethod) && submission.formAction === state.location.pathname + state.location.search) historyAction = "REPLACE";
		let preventScrollReset = opts && "preventScrollReset" in opts ? opts.preventScrollReset === true : void 0;
		let flushSync = (opts && opts.flushSync) === true;
		let blockerKey = shouldBlockNavigation({
			currentLocation,
			nextLocation,
			historyAction
		});
		if (blockerKey) {
			updateBlocker(blockerKey, {
				state: "blocked",
				location: nextLocation,
				proceed() {
					updateBlocker(blockerKey, {
						state: "proceeding",
						proceed: void 0,
						reset: void 0,
						location: nextLocation
					});
					navigate(to, opts);
				},
				reset() {
					let blockers = new Map(state.blockers);
					blockers.set(blockerKey, IDLE_BLOCKER);
					updateState({ blockers });
				}
			});
			return;
		}
		await startNavigation(historyAction, nextLocation, {
			submission,
			pendingError: error,
			preventScrollReset,
			replace: opts && opts.replace,
			enableViewTransition: opts && opts.viewTransition,
			flushSync,
			callSiteDefaultShouldRevalidate: opts && opts.defaultShouldRevalidate
		});
	}
	function revalidate() {
		if (!pendingRevalidationDfd) pendingRevalidationDfd = createDeferred();
		interruptActiveLoads();
		updateState({ revalidation: "loading" });
		let promise = pendingRevalidationDfd.promise;
		if (state.navigation.state === "submitting") return promise;
		if (state.navigation.state === "idle") {
			startNavigation(state.historyAction, state.location, { startUninterruptedRevalidation: true });
			return promise;
		}
		startNavigation(pendingAction || state.historyAction, state.navigation.location, {
			overrideNavigation: state.navigation,
			enableViewTransition: pendingViewTransitionEnabled === true
		});
		return promise;
	}
	async function startNavigation(historyAction, location, opts) {
		pendingNavigationController && pendingNavigationController.abort();
		pendingNavigationController = null;
		pendingAction = historyAction;
		isUninterruptedRevalidation = (opts && opts.startUninterruptedRevalidation) === true;
		saveScrollPosition(state.location, state.matches);
		pendingPreventScrollReset = (opts && opts.preventScrollReset) === true;
		pendingViewTransitionEnabled = (opts && opts.enableViewTransition) === true;
		let routesToUse = dataRoutes.activeRoutes;
		let matches = opts?.initialHydration && state.matches && state.matches.length > 0 && !initialMatchesIsFOW ? state.matches : matchRoutesImpl(routesToUse, location, basename, false, dataRoutes.branches);
		let flushSync = (opts && opts.flushSync) === true;
		if (matches && state.initialized && !isRevalidationRequired && isHashChangeOnly(state.location, location) && !(opts && opts.submission && isMutationMethod(opts.submission.formMethod))) {
			completeNavigation(location, { matches }, { flushSync });
			return;
		}
		let fogOfWar = checkFogOfWar(matches, routesToUse, location.pathname);
		if (fogOfWar.active && fogOfWar.matches) matches = fogOfWar.matches;
		if (!matches) {
			let { error, notFoundMatches, route } = handleNavigational404(location.pathname);
			completeNavigation(location, {
				matches: notFoundMatches,
				loaderData: {},
				errors: { [route.id]: error }
			}, { flushSync });
			return;
		}
		let loadingNavigation = opts && opts.overrideNavigation ? {
			...opts.overrideNavigation,
			matches,
			historyAction
		} : void 0;
		pendingNavigationController = new AbortController();
		let request = createClientSideRequest(init.history, location, pendingNavigationController.signal, opts && opts.submission);
		let scopedContext = init.getContext ? await init.getContext() : new RouterContextProvider();
		let pendingActionResult;
		if (opts && opts.pendingError) pendingActionResult = [findNearestBoundary(matches).route.id, {
			type: "error",
			error: opts.pendingError
		}];
		else if (opts && opts.submission && isMutationMethod(opts.submission.formMethod)) {
			let actionResult = await handleAction(request, location, opts.submission, matches, historyAction, scopedContext, fogOfWar.active, opts && opts.initialHydration === true, {
				replace: opts.replace,
				flushSync
			});
			if (actionResult.shortCircuited) return;
			if (actionResult.pendingActionResult) {
				let [routeId, result] = actionResult.pendingActionResult;
				if (isErrorResult(result) && isRouteErrorResponse(result.error) && result.error.status === 404) {
					pendingNavigationController = null;
					completeNavigation(location, {
						matches: actionResult.matches,
						loaderData: {},
						errors: { [routeId]: result.error }
					});
					return;
				}
			}
			matches = actionResult.matches || matches;
			pendingActionResult = actionResult.pendingActionResult;
			loadingNavigation = getLoadingNavigation(location, matches, historyAction, opts.submission);
			flushSync = false;
			fogOfWar.active = false;
			request = createClientSideRequest(init.history, request.url, request.signal);
		}
		let { shortCircuited, matches: updatedMatches, loaderData, errors, workingFetchers } = await handleLoaders(request, location, matches, historyAction, scopedContext, fogOfWar.active, loadingNavigation, opts && opts.submission, opts && opts.fetcherSubmission, opts && opts.replace, opts && opts.initialHydration === true, flushSync, pendingActionResult, opts && opts.callSiteDefaultShouldRevalidate);
		if (shortCircuited) return;
		pendingNavigationController = null;
		completeNavigation(location, {
			matches: updatedMatches || matches,
			...getActionDataForCommit(pendingActionResult),
			loaderData,
			errors,
			...workingFetchers ? { fetchers: workingFetchers } : {}
		});
	}
	async function handleAction(request, location, submission, matches, historyAction, scopedContext, isFogOfWar, initialHydration, opts = {}) {
		interruptActiveLoads();
		updateState({ navigation: getSubmittingNavigation(location, matches, historyAction, submission) }, { flushSync: opts.flushSync === true });
		if (isFogOfWar) {
			let discoverResult = await discoverRoutes(matches, location.pathname, request.signal);
			if (discoverResult.type === "aborted") return { shortCircuited: true };
			else if (discoverResult.type === "error") {
				if (discoverResult.partialMatches.length === 0) {
					let { matches: matches2, route } = getShortCircuitMatches(dataRoutes.activeRoutes);
					return {
						matches: matches2,
						pendingActionResult: [route.id, {
							type: "error",
							error: discoverResult.error
						}]
					};
				}
				let boundaryId = findNearestBoundary(discoverResult.partialMatches).route.id;
				return {
					matches: discoverResult.partialMatches,
					pendingActionResult: [boundaryId, {
						type: "error",
						error: discoverResult.error
					}]
				};
			} else if (!discoverResult.matches) {
				let { notFoundMatches, error, route } = handleNavigational404(location.pathname);
				return {
					matches: notFoundMatches,
					pendingActionResult: [route.id, {
						type: "error",
						error
					}]
				};
			} else matches = discoverResult.matches;
		}
		let result;
		let actionMatch = getTargetMatch(matches, location);
		if (!actionMatch.route.action && !actionMatch.route.lazy) result = {
			type: "error",
			error: getInternalRouterError(405, {
				method: request.method,
				pathname: location.pathname,
				routeId: actionMatch.route.id
			})
		};
		else {
			let results = await callDataStrategy(request, location, getTargetedDataStrategyMatches(mapRouteProperties2, manifest, request, location, matches, actionMatch, initialHydration ? [] : hydrationRouteProperties2, scopedContext), scopedContext, null);
			result = results[actionMatch.route.id];
			if (!result) {
				for (let match of matches) if (results[match.route.id]) {
					result = results[match.route.id];
					break;
				}
			}
			if (request.signal.aborted) return { shortCircuited: true };
		}
		if (isRedirectResult(result)) {
			let replace2;
			if (opts && opts.replace != null) replace2 = opts.replace;
			else replace2 = normalizeRedirectLocation$1(result.response.headers.get("Location"), new URL(request.url), basename, init.history) === state.location.pathname + state.location.search;
			await startRedirectNavigation(request, result, true, {
				submission,
				replace: replace2
			});
			return { shortCircuited: true };
		}
		if (isErrorResult(result)) {
			let boundaryMatch = findNearestBoundary(matches, actionMatch.route.id);
			if ((opts && opts.replace) !== true) pendingAction = "PUSH";
			return {
				matches,
				pendingActionResult: [
					boundaryMatch.route.id,
					result,
					actionMatch.route.id
				]
			};
		}
		return {
			matches,
			pendingActionResult: [actionMatch.route.id, result]
		};
	}
	async function handleLoaders(request, location, matches, historyAction, scopedContext, isFogOfWar, overrideNavigation, submission, fetcherSubmission, replace2, initialHydration, flushSync, pendingActionResult, callSiteDefaultShouldRevalidate) {
		let loadingNavigation = overrideNavigation || getLoadingNavigation(location, matches, historyAction, submission);
		let activeSubmission = submission || fetcherSubmission || getSubmissionFromNavigation(loadingNavigation);
		let shouldUpdateNavigationState = !isUninterruptedRevalidation && !initialHydration;
		if (isFogOfWar) {
			if (shouldUpdateNavigationState) {
				let actionData = getUpdatedActionData(pendingActionResult);
				updateState({
					navigation: loadingNavigation,
					...actionData !== void 0 ? { actionData } : {}
				}, { flushSync });
			}
			let discoverResult = await discoverRoutes(matches, location.pathname, request.signal);
			if (discoverResult.type === "aborted") return { shortCircuited: true };
			else if (discoverResult.type === "error") {
				if (discoverResult.partialMatches.length === 0) {
					let { matches: matches2, route } = getShortCircuitMatches(dataRoutes.activeRoutes);
					return {
						matches: matches2,
						loaderData: {},
						errors: { [route.id]: discoverResult.error }
					};
				}
				let boundaryId = findNearestBoundary(discoverResult.partialMatches).route.id;
				return {
					matches: discoverResult.partialMatches,
					loaderData: {},
					errors: { [boundaryId]: discoverResult.error }
				};
			} else if (!discoverResult.matches) {
				let { error, notFoundMatches, route } = handleNavigational404(location.pathname);
				return {
					matches: notFoundMatches,
					loaderData: {},
					errors: { [route.id]: error }
				};
			} else matches = discoverResult.matches;
		}
		let routesToUse = dataRoutes.activeRoutes;
		let { dsMatches, revalidatingFetchers } = getMatchesToLoad(request, scopedContext, mapRouteProperties2, manifest, init.history, state, matches, activeSubmission, location, initialHydration ? [] : hydrationRouteProperties2, initialHydration === true, isRevalidationRequired, cancelledFetcherLoads, fetchersQueuedForDeletion, fetchLoadMatches, fetchRedirectIds, routesToUse, basename, init.patchRoutesOnNavigation != null, dataRoutes.branches, pendingActionResult, callSiteDefaultShouldRevalidate);
		pendingNavigationLoadId = ++incrementingLoadId;
		if (!init.dataStrategy && !dsMatches.some((m) => m.shouldLoad) && !dsMatches.some((m) => m.route.middleware && m.route.middleware.length > 0) && revalidatingFetchers.length === 0) {
			let workingFetchers2 = new Map(state.fetchers);
			let didUpdateFetcherRedirects2 = markFetchRedirectsDone(workingFetchers2);
			completeNavigation(location, {
				matches,
				loaderData: {},
				errors: pendingActionResult && isErrorResult(pendingActionResult[1]) ? { [pendingActionResult[0]]: pendingActionResult[1].error } : null,
				...getActionDataForCommit(pendingActionResult),
				...didUpdateFetcherRedirects2 ? { fetchers: workingFetchers2 } : {}
			}, { flushSync });
			return { shortCircuited: true };
		}
		if (shouldUpdateNavigationState) {
			let updates = {};
			if (!isFogOfWar) {
				updates.navigation = loadingNavigation;
				let actionData = getUpdatedActionData(pendingActionResult);
				if (actionData !== void 0) updates.actionData = actionData;
			}
			if (revalidatingFetchers.length > 0) updates.fetchers = getUpdatedRevalidatingFetchers(revalidatingFetchers);
			updateState(updates, { flushSync });
		}
		revalidatingFetchers.forEach((rf) => {
			abortFetcher(rf.key);
			if (rf.controller) fetchControllers.set(rf.key, rf.controller);
		});
		let abortPendingFetchRevalidations = () => revalidatingFetchers.forEach((f) => abortFetcher(f.key));
		if (pendingNavigationController) pendingNavigationController.signal.addEventListener("abort", abortPendingFetchRevalidations);
		let { loaderResults, fetcherResults } = await callLoadersAndMaybeResolveData(dsMatches, revalidatingFetchers, request, location, scopedContext);
		if (request.signal.aborted) return { shortCircuited: true };
		if (pendingNavigationController) pendingNavigationController.signal.removeEventListener("abort", abortPendingFetchRevalidations);
		revalidatingFetchers.forEach((rf) => fetchControllers.delete(rf.key));
		let redirect2 = findRedirect(loaderResults);
		if (redirect2) {
			await startRedirectNavigation(request, redirect2.result, true, { replace: replace2 });
			return { shortCircuited: true };
		}
		redirect2 = findRedirect(fetcherResults);
		if (redirect2) {
			fetchRedirectIds.add(redirect2.key);
			await startRedirectNavigation(request, redirect2.result, true, { replace: replace2 });
			return { shortCircuited: true };
		}
		let workingFetchers = new Map(state.fetchers);
		let { loaderData, errors } = processLoaderData(state, matches, loaderResults, pendingActionResult, revalidatingFetchers, fetcherResults, workingFetchers);
		if (initialHydration && state.errors) errors = {
			...state.errors,
			...errors
		};
		let didUpdateFetcherRedirects = markFetchRedirectsDone(workingFetchers);
		let didAbortFetchLoads = abortStaleFetchLoads(pendingNavigationLoadId, workingFetchers);
		let shouldUpdateFetchers = didUpdateFetcherRedirects || didAbortFetchLoads || revalidatingFetchers.length > 0;
		return {
			matches,
			loaderData,
			errors,
			...shouldUpdateFetchers ? { workingFetchers } : {}
		};
	}
	function getUpdatedActionData(pendingActionResult) {
		if (pendingActionResult && !isErrorResult(pendingActionResult[1])) return { [pendingActionResult[0]]: pendingActionResult[1].data };
		else if (state.actionData) {
			if (Object.keys(state.actionData).length === 0) return null;
			else return state.actionData;
		}
	}
	function getUpdatedRevalidatingFetchers(revalidatingFetchers) {
		let workingFetchers = new Map(state.fetchers);
		revalidatingFetchers.forEach((rf) => {
			let fetcher = workingFetchers.get(rf.key);
			let revalidatingFetcher = getLoadingFetcher(void 0, fetcher ? fetcher.data : void 0);
			workingFetchers.set(rf.key, revalidatingFetcher);
		});
		return workingFetchers;
	}
	async function fetch2(key, routeId, href, opts) {
		abortFetcher(key);
		let flushSync = (opts && opts.flushSync) === true;
		let routesToUse = dataRoutes.activeRoutes;
		let normalizedPath = normalizeTo(state.location, state.matches, basename, href, routeId, opts?.relative);
		let matches = matchRoutesImpl(routesToUse, normalizedPath, basename, false, dataRoutes.branches);
		let fogOfWar = checkFogOfWar(matches, routesToUse, normalizedPath);
		if (fogOfWar.active && fogOfWar.matches) matches = fogOfWar.matches;
		if (!matches) {
			setFetcherError(key, routeId, getInternalRouterError(404, { pathname: normalizedPath }), { flushSync });
			return;
		}
		let { path, submission, error } = normalizeNavigateOptions(true, normalizedPath, opts);
		if (error) {
			setFetcherError(key, routeId, error, { flushSync });
			return;
		}
		let scopedContext = init.getContext ? await init.getContext() : new RouterContextProvider();
		let preventScrollReset = (opts && opts.preventScrollReset) === true;
		if (submission && isMutationMethod(submission.formMethod)) {
			await handleFetcherAction(key, routeId, path, matches, scopedContext, fogOfWar.active, flushSync, preventScrollReset, submission, opts && opts.defaultShouldRevalidate);
			return;
		}
		fetchLoadMatches.set(key, {
			routeId,
			path
		});
		await handleFetcherLoader(key, routeId, path, matches, scopedContext, fogOfWar.active, flushSync, preventScrollReset, submission);
	}
	async function handleFetcherAction(key, routeId, path, requestMatches, scopedContext, isFogOfWar, flushSync, preventScrollReset, submission, callSiteDefaultShouldRevalidate) {
		interruptActiveLoads();
		fetchLoadMatches.delete(key);
		updateFetcherState(key, getSubmittingFetcher(submission, state.fetchers.get(key)), { flushSync });
		let abortController = new AbortController();
		let fetchRequest = createClientSideRequest(init.history, path, abortController.signal, submission);
		if (isFogOfWar) {
			let discoverResult = await discoverRoutes(requestMatches, new URL(fetchRequest.url).pathname, fetchRequest.signal, key);
			if (discoverResult.type === "aborted") return;
			else if (discoverResult.type === "error") {
				setFetcherError(key, routeId, discoverResult.error, { flushSync });
				return;
			} else if (!discoverResult.matches) {
				setFetcherError(key, routeId, getInternalRouterError(404, { pathname: path }), { flushSync });
				return;
			} else requestMatches = discoverResult.matches;
		}
		let match = getTargetMatch(requestMatches, path);
		if (!match.route.action && !match.route.lazy) {
			setFetcherError(key, routeId, getInternalRouterError(405, {
				method: submission.formMethod,
				pathname: path,
				routeId
			}), { flushSync });
			return;
		}
		fetchControllers.set(key, abortController);
		let originatingLoadId = incrementingLoadId;
		let fetchMatches = getTargetedDataStrategyMatches(mapRouteProperties2, manifest, fetchRequest, path, requestMatches, match, hydrationRouteProperties2, scopedContext);
		let actionResults = await callDataStrategy(fetchRequest, path, fetchMatches, scopedContext, key);
		let actionResult = actionResults[match.route.id];
		if (!actionResult) {
			for (let match2 of fetchMatches) if (actionResults[match2.route.id]) {
				actionResult = actionResults[match2.route.id];
				break;
			}
		}
		if (fetchRequest.signal.aborted) {
			if (fetchControllers.get(key) === abortController) fetchControllers.delete(key);
			return;
		}
		if (fetchersQueuedForDeletion.has(key)) {
			if (isRedirectResult(actionResult) || isErrorResult(actionResult)) {
				updateFetcherState(key, getDoneFetcher(void 0));
				return;
			}
		} else {
			if (isRedirectResult(actionResult)) {
				fetchControllers.delete(key);
				if (pendingNavigationLoadId > originatingLoadId) {
					updateFetcherState(key, getDoneFetcher(void 0));
					return;
				} else {
					fetchRedirectIds.add(key);
					updateFetcherState(key, getLoadingFetcher(submission));
					return startRedirectNavigation(fetchRequest, actionResult, false, {
						fetcherSubmission: submission,
						preventScrollReset
					});
				}
			}
			if (isErrorResult(actionResult)) {
				setFetcherError(key, routeId, actionResult.error);
				return;
			}
		}
		let nextLocation = state.navigation.location || state.location;
		let revalidationRequest = createClientSideRequest(init.history, nextLocation, abortController.signal);
		let routesToUse = dataRoutes.activeRoutes;
		let matches = state.navigation.state !== "idle" ? matchRoutesImpl(routesToUse, state.navigation.location, basename, false, dataRoutes.branches) : state.matches;
		invariant$1(matches, "Didn't find any matches after fetcher action");
		let loadId = ++incrementingLoadId;
		fetchReloadIds.set(key, loadId);
		let { dsMatches, revalidatingFetchers } = getMatchesToLoad(revalidationRequest, scopedContext, mapRouteProperties2, manifest, init.history, state, matches, submission, nextLocation, hydrationRouteProperties2, false, isRevalidationRequired, cancelledFetcherLoads, fetchersQueuedForDeletion, fetchLoadMatches, fetchRedirectIds, routesToUse, basename, init.patchRoutesOnNavigation != null, dataRoutes.branches, [match.route.id, actionResult], callSiteDefaultShouldRevalidate);
		let loadFetcher = getLoadingFetcher(submission, actionResult.data);
		let workingFetchers = new Map(state.fetchers);
		workingFetchers.set(key, loadFetcher);
		revalidatingFetchers.filter((rf) => rf.key !== key).forEach((rf) => {
			let staleKey = rf.key;
			let existingFetcher2 = workingFetchers.get(staleKey);
			let revalidatingFetcher = getLoadingFetcher(void 0, existingFetcher2 ? existingFetcher2.data : void 0);
			workingFetchers.set(staleKey, revalidatingFetcher);
			abortFetcher(staleKey);
			if (rf.controller) fetchControllers.set(staleKey, rf.controller);
		});
		updateState({ fetchers: workingFetchers });
		let abortPendingFetchRevalidations = () => revalidatingFetchers.forEach((rf) => abortFetcher(rf.key));
		abortController.signal.addEventListener("abort", abortPendingFetchRevalidations);
		let { loaderResults, fetcherResults } = await callLoadersAndMaybeResolveData(dsMatches, revalidatingFetchers, revalidationRequest, nextLocation, scopedContext);
		if (abortController.signal.aborted) return;
		abortController.signal.removeEventListener("abort", abortPendingFetchRevalidations);
		fetchReloadIds.delete(key);
		fetchControllers.delete(key);
		revalidatingFetchers.forEach((r) => fetchControllers.delete(r.key));
		let fetcherIsMounted = state.fetchers.has(key);
		let getRedirectStateWithDoneFetcher = (s) => {
			if (!fetcherIsMounted) return s;
			let workingFetchers2 = new Map(s.fetchers);
			workingFetchers2.set(key, getDoneFetcher(actionResult.data));
			return {
				...s,
				fetchers: workingFetchers2
			};
		};
		let redirect2 = findRedirect(loaderResults);
		if (redirect2) {
			state = getRedirectStateWithDoneFetcher(state);
			return startRedirectNavigation(revalidationRequest, redirect2.result, false, { preventScrollReset });
		}
		redirect2 = findRedirect(fetcherResults);
		if (redirect2) {
			fetchRedirectIds.add(redirect2.key);
			state = getRedirectStateWithDoneFetcher(state);
			return startRedirectNavigation(revalidationRequest, redirect2.result, false, { preventScrollReset });
		}
		let finalFetchers = new Map(state.fetchers);
		if (fetcherIsMounted) finalFetchers.set(key, getDoneFetcher(actionResult.data));
		let { loaderData, errors } = processLoaderData(state, matches, loaderResults, void 0, revalidatingFetchers, fetcherResults, finalFetchers);
		abortStaleFetchLoads(loadId, finalFetchers);
		if (state.navigation.state === "loading" && loadId > pendingNavigationLoadId) {
			invariant$1(pendingAction, "Expected pending action");
			pendingNavigationController && pendingNavigationController.abort();
			completeNavigation(state.navigation.location, {
				matches,
				loaderData,
				errors,
				fetchers: finalFetchers
			});
		} else {
			updateState({
				errors,
				loaderData: mergeLoaderData(state.loaderData, loaderData, matches, errors),
				fetchers: finalFetchers
			});
			isRevalidationRequired = false;
		}
	}
	async function handleFetcherLoader(key, routeId, path, matches, scopedContext, isFogOfWar, flushSync, preventScrollReset, submission) {
		let existingFetcher = state.fetchers.get(key);
		updateFetcherState(key, getLoadingFetcher(submission, existingFetcher ? existingFetcher.data : void 0), { flushSync });
		let abortController = new AbortController();
		let fetchRequest = createClientSideRequest(init.history, path, abortController.signal);
		if (isFogOfWar) {
			let discoverResult = await discoverRoutes(matches, new URL(fetchRequest.url).pathname, fetchRequest.signal, key);
			if (discoverResult.type === "aborted") return;
			else if (discoverResult.type === "error") {
				setFetcherError(key, routeId, discoverResult.error, { flushSync });
				return;
			} else if (!discoverResult.matches) {
				setFetcherError(key, routeId, getInternalRouterError(404, { pathname: path }), { flushSync });
				return;
			} else matches = discoverResult.matches;
		}
		let match = getTargetMatch(matches, path);
		fetchControllers.set(key, abortController);
		let originatingLoadId = incrementingLoadId;
		let results = await callDataStrategy(fetchRequest, path, getTargetedDataStrategyMatches(mapRouteProperties2, manifest, fetchRequest, path, matches, match, hydrationRouteProperties2, scopedContext), scopedContext, key);
		let result = results[match.route.id];
		if (!result) {
			for (let match2 of matches) if (results[match2.route.id]) {
				result = results[match2.route.id];
				break;
			}
		}
		if (fetchControllers.get(key) === abortController) fetchControllers.delete(key);
		if (fetchRequest.signal.aborted) return;
		if (fetchersQueuedForDeletion.has(key)) {
			updateFetcherState(key, getDoneFetcher(void 0));
			return;
		}
		if (isRedirectResult(result)) {
			if (pendingNavigationLoadId > originatingLoadId) {
				updateFetcherState(key, getDoneFetcher(void 0));
				return;
			} else {
				fetchRedirectIds.add(key);
				await startRedirectNavigation(fetchRequest, result, false, { preventScrollReset });
				return;
			}
		}
		if (isErrorResult(result)) {
			setFetcherError(key, routeId, result.error);
			return;
		}
		updateFetcherState(key, getDoneFetcher(result.data));
	}
	async function startRedirectNavigation(request, redirect2, isNavigation, { submission, fetcherSubmission, preventScrollReset, replace: replace2 } = {}) {
		if (!isNavigation) {
			pendingPopstateNavigationDfd?.resolve();
			pendingPopstateNavigationDfd = null;
		}
		if (redirect2.response.headers.has("X-Remix-Revalidate")) isRevalidationRequired = true;
		let location = redirect2.response.headers.get("Location");
		invariant$1(location, "Expected a Location header on the redirect Response");
		let originalLocation = location;
		let currentUrl = new URL(request.url);
		location = normalizeRedirectLocation$1(location, currentUrl, basename, init.history);
		validateNavigationTarget(originalLocation, location, currentUrl, "allow-explicit");
		let redirectLocation = createLocation(state.location, location, { _isRedirect: true });
		if (isBrowser3) {
			let isDocumentReload = false;
			if (redirect2.response.headers.has("X-Remix-Reload-Document")) isDocumentReload = true;
			else if (isAbsoluteUrl(location)) {
				const url = createBrowserURLImpl(routerWindow, location, true);
				isDocumentReload = url.origin !== routerWindow.location.origin || stripBasename(url.pathname, basename) == null;
			}
			if (isDocumentReload) {
				if (replace2) routerWindow.location.replace(location);
				else routerWindow.location.assign(location);
				return;
			}
		}
		pendingNavigationController = null;
		let redirectNavigationType = replace2 === true || redirect2.response.headers.has("X-Remix-Replace") ? "REPLACE" : "PUSH";
		let { formMethod, formAction, formEncType } = state.navigation;
		if (!submission && !fetcherSubmission && formMethod && formAction && formEncType) submission = getSubmissionFromNavigation(state.navigation);
		let activeSubmission = submission || fetcherSubmission;
		if (redirectPreserveMethodStatusCodes.has(redirect2.response.status) && activeSubmission && isMutationMethod(activeSubmission.formMethod)) await startNavigation(redirectNavigationType, redirectLocation, {
			submission: {
				...activeSubmission,
				formAction: location
			},
			preventScrollReset: preventScrollReset || pendingPreventScrollReset,
			enableViewTransition: isNavigation ? pendingViewTransitionEnabled : void 0
		});
		else await startNavigation(redirectNavigationType, redirectLocation, {
			overrideNavigation: getLoadingNavigation(redirectLocation, [], redirectNavigationType, submission),
			fetcherSubmission,
			preventScrollReset: preventScrollReset || pendingPreventScrollReset,
			enableViewTransition: isNavigation ? pendingViewTransitionEnabled : void 0
		});
	}
	async function callDataStrategy(request, path, matches, scopedContext, fetcherKey) {
		let results;
		let dataResults = {};
		try {
			results = await callDataStrategyImpl(dataStrategyImpl, request, path, matches, fetcherKey, scopedContext, false);
		} catch (e) {
			matches.filter((m) => m.shouldLoad).forEach((m) => {
				dataResults[m.route.id] = {
					type: "error",
					error: e
				};
			});
			return dataResults;
		}
		if (request.signal.aborted) return dataResults;
		if (!isMutationMethod(request.method)) for (let match of matches) {
			if (results[match.route.id]?.type === "error") break;
			if (!results.hasOwnProperty(match.route.id) && !state.loaderData.hasOwnProperty(match.route.id) && (!state.errors || !state.errors.hasOwnProperty(match.route.id)) && match.shouldCallHandler()) results[match.route.id] = {
				type: "error",
				result: /* @__PURE__ */ new Error(`No result returned from dataStrategy for route ${match.route.id}`)
			};
		}
		for (let [routeId, result] of Object.entries(results)) if (isRedirectDataStrategyResult(result)) {
			let response = result.result;
			dataResults[routeId] = {
				type: "redirect",
				response: normalizeRelativeRoutingRedirectResponse(response, request, routeId, matches, basename)
			};
		} else dataResults[routeId] = await convertDataStrategyResultToDataResult(result);
		return dataResults;
	}
	async function callLoadersAndMaybeResolveData(matches, fetchersToLoad, request, location, scopedContext) {
		let loaderResultsPromise = callDataStrategy(request, location, matches, scopedContext, null);
		let fetcherResultsPromise = Promise.all(fetchersToLoad.map(async (f) => {
			if (f.matches && f.match && f.request && f.controller) {
				let result = (await callDataStrategy(f.request, f.path, f.matches, scopedContext, f.key))[f.match.route.id];
				return { [f.key]: result };
			} else return Promise.resolve({ [f.key]: {
				type: "error",
				error: getInternalRouterError(404, { pathname: f.path })
			} });
		}));
		return {
			loaderResults: await loaderResultsPromise,
			fetcherResults: (await fetcherResultsPromise).reduce((acc, r) => Object.assign(acc, r), {})
		};
	}
	function interruptActiveLoads() {
		isRevalidationRequired = true;
		fetchLoadMatches.forEach((_, key) => {
			if (fetchControllers.has(key)) cancelledFetcherLoads.add(key);
			abortFetcher(key);
		});
	}
	function updateFetcherState(key, fetcher, opts = {}) {
		let workingFetchers = new Map(state.fetchers);
		workingFetchers.set(key, fetcher);
		updateState({ fetchers: workingFetchers }, { flushSync: (opts && opts.flushSync) === true });
	}
	function setFetcherError(key, routeId, error, opts = {}) {
		let boundaryMatch = findNearestBoundary(state.matches, routeId);
		let workingFetchers = new Map(state.fetchers);
		deleteFetcher(workingFetchers, key);
		updateState({
			errors: { [boundaryMatch.route.id]: error },
			fetchers: workingFetchers
		}, { flushSync: (opts && opts.flushSync) === true });
	}
	function getFetcher(key) {
		activeFetchers.set(key, (activeFetchers.get(key) || 0) + 1);
		if (fetchersQueuedForDeletion.has(key)) fetchersQueuedForDeletion.delete(key);
		return state.fetchers.get(key) || IDLE_FETCHER;
	}
	function resetFetcher(key, opts) {
		abortFetcher(key, opts?.reason);
		updateFetcherState(key, getDoneFetcher(null));
	}
	function deleteFetcher(fetchers, key) {
		let fetcher = state.fetchers.get(key);
		if (fetchControllers.has(key) && !(fetcher && fetcher.state === "loading" && fetchReloadIds.has(key))) abortFetcher(key);
		fetchLoadMatches.delete(key);
		fetchReloadIds.delete(key);
		fetchRedirectIds.delete(key);
		fetchersQueuedForDeletion.delete(key);
		cancelledFetcherLoads.delete(key);
		fetchers.delete(key);
	}
	function queueFetcherForDeletion(key) {
		let count = (activeFetchers.get(key) || 0) - 1;
		if (count <= 0) {
			activeFetchers.delete(key);
			fetchersQueuedForDeletion.add(key);
		} else activeFetchers.set(key, count);
		updateState({ fetchers: new Map(state.fetchers) });
	}
	function abortFetcher(key, reason) {
		let controller = fetchControllers.get(key);
		if (controller) {
			controller.abort(reason);
			fetchControllers.delete(key);
		}
	}
	function markFetchersDone(keys, fetchers) {
		for (let key of keys) {
			let fetcher = fetchers.get(key);
			invariant$1(fetcher, `Expected fetcher: ${key}`);
			let doneFetcher = getDoneFetcher(fetcher.data);
			fetchers.set(key, doneFetcher);
		}
	}
	function markFetchRedirectsDone(fetchers) {
		let doneKeys = [];
		let didUpdateFetchers = false;
		for (let key of fetchRedirectIds) {
			let fetcher = fetchers.get(key);
			invariant$1(fetcher, `Expected fetcher: ${key}`);
			if (fetcher.state === "loading") {
				fetchRedirectIds.delete(key);
				doneKeys.push(key);
				didUpdateFetchers = true;
			}
		}
		markFetchersDone(doneKeys, fetchers);
		return didUpdateFetchers;
	}
	function abortStaleFetchLoads(landedId, fetchers) {
		let yeetedKeys = [];
		for (let [key, id] of fetchReloadIds) if (id < landedId) {
			let fetcher = fetchers.get(key);
			invariant$1(fetcher, `Expected fetcher: ${key}`);
			if (fetcher.state === "loading") {
				abortFetcher(key);
				fetchReloadIds.delete(key);
				yeetedKeys.push(key);
			}
		}
		markFetchersDone(yeetedKeys, fetchers);
		return yeetedKeys.length > 0;
	}
	function getBlocker(key, fn) {
		let blocker = state.blockers.get(key) || IDLE_BLOCKER;
		if (blockerFunctions.get(key) !== fn) blockerFunctions.set(key, fn);
		return blocker;
	}
	function deleteBlocker(key) {
		state.blockers.delete(key);
		blockerFunctions.delete(key);
	}
	function updateBlocker(key, newBlocker) {
		let blocker = state.blockers.get(key) || IDLE_BLOCKER;
		invariant$1(blocker.state === "unblocked" && newBlocker.state === "blocked" || blocker.state === "blocked" && newBlocker.state === "blocked" || blocker.state === "blocked" && newBlocker.state === "proceeding" || blocker.state === "blocked" && newBlocker.state === "unblocked" || blocker.state === "proceeding" && newBlocker.state === "unblocked", `Invalid blocker state transition: ${blocker.state} -> ${newBlocker.state}`);
		let blockers = new Map(state.blockers);
		blockers.set(key, newBlocker);
		updateState({ blockers });
	}
	function shouldBlockNavigation({ currentLocation, nextLocation, historyAction }) {
		if (blockerFunctions.size === 0) return;
		if (blockerFunctions.size > 1) warning(false, "A router only supports one blocker at a time");
		let entries = Array.from(blockerFunctions.entries());
		let [blockerKey, blockerFunction] = entries[entries.length - 1];
		let blocker = state.blockers.get(blockerKey);
		if (blocker && blocker.state === "proceeding") return;
		if (blockerFunction({
			currentLocation,
			nextLocation,
			historyAction
		})) return blockerKey;
	}
	function handleNavigational404(pathname) {
		let error = getInternalRouterError(404, { pathname });
		let routesToUse = dataRoutes.activeRoutes;
		let { matches, route } = getShortCircuitMatches(routesToUse);
		return {
			notFoundMatches: matches,
			route,
			error
		};
	}
	function enableScrollRestoration(positions, getPosition, getKey) {
		savedScrollPositions2 = positions;
		getScrollPosition = getPosition;
		getScrollRestorationKey2 = getKey || null;
		if (!initialScrollRestored && state.navigation === IDLE_NAVIGATION) {
			initialScrollRestored = true;
			let y = getSavedScrollPosition(state.location, state.matches);
			if (y != null) updateState({ restoreScrollPosition: y });
		}
		return () => {
			savedScrollPositions2 = null;
			getScrollPosition = null;
			getScrollRestorationKey2 = null;
		};
	}
	function getScrollKey(location, matches) {
		if (getScrollRestorationKey2) return getScrollRestorationKey2(location, matches.map((m) => convertRouteMatchToUiMatch(m, state.loaderData))) || location.key;
		return location.key;
	}
	function saveScrollPosition(location, matches) {
		if (savedScrollPositions2 && getScrollPosition) {
			let key = getScrollKey(location, matches);
			savedScrollPositions2[key] = getScrollPosition();
		}
	}
	function getSavedScrollPosition(location, matches) {
		if (savedScrollPositions2) {
			let key = getScrollKey(location, matches);
			let y = savedScrollPositions2[key];
			if (typeof y === "number") return y;
		}
		return null;
	}
	function checkFogOfWar(matches, routesToUse, pathname) {
		if (init.patchRoutesOnNavigation) {
			let activeBranches = dataRoutes.branches;
			if (!matches) return {
				active: true,
				matches: matchRoutesImpl(routesToUse, pathname, basename, true, activeBranches) || []
			};
			else if (Object.keys(matches[0].params).length > 0) return {
				active: true,
				matches: matchRoutesImpl(routesToUse, pathname, basename, true, activeBranches)
			};
		}
		return {
			active: false,
			matches: null
		};
	}
	async function discoverRoutes(matches, pathname, signal, fetcherKey) {
		if (!init.patchRoutesOnNavigation) return {
			type: "success",
			matches
		};
		let partialMatches = matches;
		while (true) {
			let localManifest = manifest;
			try {
				await init.patchRoutesOnNavigation({
					signal,
					path: pathname,
					matches: partialMatches,
					fetcherKey,
					patch: (routeId, children) => {
						if (signal.aborted) return;
						patchRoutesImpl(routeId, children, dataRoutes, localManifest, mapRouteProperties2, false);
					}
				});
			} catch (e) {
				return {
					type: "error",
					error: e,
					partialMatches
				};
			}
			if (signal.aborted) return { type: "aborted" };
			let activeBranches = dataRoutes.branches;
			let newMatches = matchRoutesImpl(dataRoutes.activeRoutes, pathname, basename, false, activeBranches);
			let newPartialMatches = null;
			if (newMatches) {
				if (Object.keys(newMatches[0].params).length === 0) return {
					type: "success",
					matches: newMatches
				};
				else {
					newPartialMatches = matchRoutesImpl(dataRoutes.activeRoutes, pathname, basename, true, activeBranches);
					if (!(newPartialMatches && partialMatches.length < newPartialMatches.length && compareMatches(partialMatches, newPartialMatches.slice(0, partialMatches.length)))) return {
						type: "success",
						matches: newMatches
					};
				}
			}
			if (!newPartialMatches) newPartialMatches = matchRoutesImpl(dataRoutes.activeRoutes, pathname, basename, true, activeBranches);
			if (!newPartialMatches || compareMatches(partialMatches, newPartialMatches)) return {
				type: "success",
				matches: null
			};
			partialMatches = newPartialMatches;
		}
	}
	function compareMatches(a, b) {
		return a.length === b.length && a.every((m, i) => m.route.id === b[i].route.id);
	}
	function _internalSetRoutes(newRoutes) {
		manifest = {};
		dataRoutes.setHmrRoutes(convertRoutesToDataRoutes(newRoutes, mapRouteProperties2, void 0, manifest));
	}
	function patchRoutes(routeId, children, unstable_allowElementMutations = false) {
		patchRoutesImpl(routeId, children, dataRoutes, manifest, mapRouteProperties2, unstable_allowElementMutations);
		if (!dataRoutes.hasHMRRoutes) updateState({});
	}
	router = {
		get basename() {
			return basename;
		},
		get future() {
			return future;
		},
		get state() {
			return state;
		},
		get routes() {
			return dataRoutes.stableRoutes;
		},
		get branches() {
			return dataRoutes.branches;
		},
		get manifest() {
			return manifest;
		},
		get window() {
			return routerWindow;
		},
		initialize,
		subscribe,
		enableScrollRestoration,
		navigate,
		fetch: fetch2,
		revalidate,
		createHref: (to) => init.history.createHref(to),
		createURL: (to) => init.history.createURL(to),
		encodeLocation: (to) => init.history.encodeLocation(to),
		getFetcher,
		resetFetcher,
		deleteFetcher: queueFetcherForDeletion,
		dispose,
		getBlocker,
		deleteBlocker,
		patchRoutes,
		_internalFetchControllers: fetchControllers,
		_internalSetRoutes,
		_internalSetStateDoNotUseOrYouWillBreakYourApp(newState) {
			updateState(newState);
		}
	};
	if (init.instrumentations) router = instrumentClientSideRouter(router, init.instrumentations.map((i) => i.router).filter(Boolean));
	return router;
}
function createStaticHandler(routes, opts) {
	invariant$1(routes.length > 0, "You must provide a non-empty routes array to createStaticHandler");
	let manifest = {};
	let basename = (opts ? opts.basename : null) || "/";
	let _mapRouteProperties = opts?.mapRouteProperties || defaultMapRouteProperties;
	let mapRouteProperties2 = _mapRouteProperties;
	({ ...opts?.future });
	if (opts?.instrumentations) {
		let instrumentations = opts.instrumentations;
		mapRouteProperties2 = (route) => {
			return {
				..._mapRouteProperties(route),
				...getRouteInstrumentationUpdates(instrumentations.map((i) => i.route).filter(Boolean), route)
			};
		};
	}
	let dataRoutes = convertRoutesToDataRoutes(routes, mapRouteProperties2, void 0, manifest);
	let routeBranches = flattenAndRankRoutes(dataRoutes);
	async function query(request, { requestContext, filterMatchesToLoad, skipLoaderErrorBubbling, skipRevalidation, dataStrategy, generateMiddlewareResponse, normalizePath } = {}) {
		let normalizePathImpl = normalizePath || defaultNormalizePath;
		let method = request.method;
		let location = createLocation("", normalizePathImpl(request), null, "default");
		let matches = matchRoutesImpl(dataRoutes, location, basename, false, routeBranches);
		requestContext = requestContext != null ? requestContext : new RouterContextProvider();
		if (!isValidMethod(method) && method !== "HEAD") {
			let error = getInternalRouterError(405, { method });
			let { matches: methodNotAllowedMatches, route } = getShortCircuitMatches(dataRoutes);
			let staticContext = {
				basename,
				location,
				matches: methodNotAllowedMatches,
				loaderData: {},
				actionData: null,
				errors: { [route.id]: error },
				statusCode: error.status,
				loaderHeaders: {},
				actionHeaders: {}
			};
			return generateMiddlewareResponse ? generateMiddlewareResponse(() => Promise.resolve(staticContext)) : staticContext;
		} else if (!matches) {
			let error = getInternalRouterError(404, { pathname: location.pathname });
			let { matches: notFoundMatches, route } = getShortCircuitMatches(dataRoutes);
			let staticContext = {
				basename,
				location,
				matches: notFoundMatches,
				loaderData: {},
				actionData: null,
				errors: { [route.id]: error },
				statusCode: error.status,
				loaderHeaders: {},
				actionHeaders: {}
			};
			return generateMiddlewareResponse ? generateMiddlewareResponse(() => Promise.resolve(staticContext)) : staticContext;
		}
		if (generateMiddlewareResponse) {
			invariant$1(requestContext instanceof RouterContextProvider, "When using middleware in `staticHandler.query()`, any provided `requestContext` must be an instance of `RouterContextProvider`");
			try {
				await loadLazyMiddlewareForMatches(matches, manifest, mapRouteProperties2);
				let renderedStaticContext;
				let response = await runServerMiddlewarePipeline({
					request,
					url: createDataFunctionUrl(request, location),
					pattern: getRoutePattern(matches),
					matches,
					params: matches[0].params,
					context: requestContext
				}, async () => {
					return await generateMiddlewareResponse(async (revalidationRequest, opts2 = {}) => {
						let result2 = await queryImpl(revalidationRequest, location, matches, requestContext, dataStrategy || null, skipLoaderErrorBubbling === true, null, "filterMatchesToLoad" in opts2 ? opts2.filterMatchesToLoad ?? null : filterMatchesToLoad ?? null, skipRevalidation === true);
						if (isResponse(result2)) return result2;
						renderedStaticContext = {
							location,
							basename,
							...result2
						};
						return renderedStaticContext;
					});
				}, async (error, routeId) => {
					if (isRedirectResponse(error)) return error;
					if (isResponse(error)) try {
						error = new ErrorResponseImpl(error.status, error.statusText, await parseResponseBody(error));
					} catch (e) {
						error = e;
					}
					if (isDataWithResponseInit(error)) error = dataWithResponseInitToErrorResponse(error);
					if (renderedStaticContext) {
						if (routeId in renderedStaticContext.loaderData) renderedStaticContext.loaderData[routeId] = void 0;
						let staticContext = getStaticContextFromError(dataRoutes, renderedStaticContext, error, skipLoaderErrorBubbling ? routeId : findNearestBoundary(matches, routeId).route.id);
						return generateMiddlewareResponse(() => Promise.resolve(staticContext));
					} else {
						let boundaryRouteId = skipLoaderErrorBubbling ? routeId : findNearestBoundary(matches, matches.find((m) => m.route.id === routeId || m.route.loader)?.route.id || routeId).route.id;
						let staticContext = {
							matches,
							location,
							basename,
							loaderData: {},
							actionData: null,
							errors: { [boundaryRouteId]: error },
							statusCode: isRouteErrorResponse(error) ? error.status : 500,
							actionHeaders: {},
							loaderHeaders: {}
						};
						return generateMiddlewareResponse(() => Promise.resolve(staticContext));
					}
				});
				invariant$1(isResponse(response), "Expected a response in query()");
				return response;
			} catch (e) {
				if (isResponse(e)) return e;
				throw e;
			}
		}
		let result = await queryImpl(request, location, matches, requestContext, dataStrategy || null, skipLoaderErrorBubbling === true, null, filterMatchesToLoad || null, skipRevalidation === true);
		if (isResponse(result)) return result;
		return {
			location,
			basename,
			...result
		};
	}
	async function queryRoute(request, { routeId, requestContext, dataStrategy, generateMiddlewareResponse, normalizePath } = {}) {
		let normalizePathImpl = normalizePath || defaultNormalizePath;
		let method = request.method;
		let location = createLocation("", normalizePathImpl(request), null, "default");
		let matches = matchRoutesImpl(dataRoutes, location, basename, false, routeBranches);
		requestContext = requestContext != null ? requestContext : new RouterContextProvider();
		if (!isValidMethod(method) && method !== "HEAD" && method !== "OPTIONS") throw getInternalRouterError(405, { method });
		else if (!matches) throw getInternalRouterError(404, { pathname: location.pathname });
		let match = routeId ? matches.find((m) => m.route.id === routeId) : getTargetMatch(matches, location);
		if (routeId && !match) throw getInternalRouterError(403, {
			pathname: location.pathname,
			routeId
		});
		else if (!match) throw getInternalRouterError(404, { pathname: location.pathname });
		if (generateMiddlewareResponse) {
			invariant$1(requestContext instanceof RouterContextProvider, "When using middleware in `staticHandler.queryRoute()`, any provided `requestContext` must be an instance of `RouterContextProvider`");
			await loadLazyMiddlewareForMatches(matches, manifest, mapRouteProperties2);
			return await runServerMiddlewarePipeline({
				request,
				url: createDataFunctionUrl(request, location),
				pattern: getRoutePattern(matches),
				matches,
				params: matches[0].params,
				context: requestContext
			}, async () => {
				return await generateMiddlewareResponse(async (innerRequest) => {
					let processed = handleQueryResult(await queryImpl(innerRequest, location, matches, requestContext, dataStrategy || null, false, match, null, false));
					return isResponse(processed) ? processed : typeof processed === "string" ? new Response(processed) : Response.json(processed);
				});
			}, (error) => {
				if (isDataWithResponseInit(error)) return Promise.resolve(dataWithResponseInitToResponse(error));
				if (isResponse(error)) return Promise.resolve(error);
				throw error;
			});
		}
		return handleQueryResult(await queryImpl(request, location, matches, requestContext, dataStrategy || null, false, match, null, false));
		function handleQueryResult(result2) {
			if (isResponse(result2)) return result2;
			let error = result2.errors ? Object.values(result2.errors)[0] : void 0;
			if (error !== void 0) throw error;
			if (result2.actionData) return Object.values(result2.actionData)[0];
			if (result2.loaderData) return Object.values(result2.loaderData)[0];
		}
	}
	async function queryImpl(request, location, matches, requestContext, dataStrategy, skipLoaderErrorBubbling, routeMatch, filterMatchesToLoad, skipRevalidation) {
		invariant$1(request.signal, "query()/queryRoute() requests must contain an AbortController signal");
		try {
			if (isMutationMethod(request.method)) return await submit(request, location, matches, routeMatch || getTargetMatch(matches, location), requestContext, dataStrategy, skipLoaderErrorBubbling, routeMatch != null, filterMatchesToLoad, skipRevalidation);
			let result = await loadRouteData(request, location, matches, requestContext, dataStrategy, skipLoaderErrorBubbling, routeMatch, filterMatchesToLoad);
			return isResponse(result) ? result : {
				...result,
				actionData: null,
				actionHeaders: {}
			};
		} catch (e) {
			if (isDataStrategyResult(e) && isResponse(e.result)) {
				if (e.type === "error") throw e.result;
				return e.result;
			}
			if (isRedirectResponse(e)) return e;
			throw e;
		}
	}
	async function submit(request, location, matches, actionMatch, requestContext, dataStrategy, skipLoaderErrorBubbling, isRouteRequest, filterMatchesToLoad, skipRevalidation) {
		let result;
		if (!actionMatch.route.action && !actionMatch.route.lazy) {
			let error = getInternalRouterError(405, {
				method: request.method,
				pathname: new URL(request.url).pathname,
				routeId: actionMatch.route.id
			});
			if (isRouteRequest) throw error;
			result = {
				type: "error",
				error
			};
		} else {
			result = (await callDataStrategy(request, location, getTargetedDataStrategyMatches(mapRouteProperties2, manifest, request, location, matches, actionMatch, [], requestContext), isRouteRequest, requestContext, dataStrategy))[actionMatch.route.id];
			if (request.signal.aborted) throwStaticHandlerAbortedError(request, isRouteRequest);
		}
		if (isRedirectResult(result)) throw new Response(null, {
			status: result.response.status,
			headers: { Location: result.response.headers.get("Location") }
		});
		if (isRouteRequest) {
			if (isErrorResult(result)) throw result.error;
			return {
				matches: [actionMatch],
				loaderData: {},
				actionData: { [actionMatch.route.id]: result.data },
				errors: null,
				statusCode: 200,
				loaderHeaders: {},
				actionHeaders: {}
			};
		}
		if (skipRevalidation) {
			if (isErrorResult(result)) {
				let boundaryMatch = skipLoaderErrorBubbling ? actionMatch : findNearestBoundary(matches, actionMatch.route.id);
				return {
					statusCode: isRouteErrorResponse(result.error) ? result.error.status : result.statusCode != null ? result.statusCode : 500,
					actionData: null,
					actionHeaders: { ...result.headers ? { [actionMatch.route.id]: result.headers } : {} },
					matches,
					loaderData: {},
					errors: { [boundaryMatch.route.id]: result.error },
					loaderHeaders: {}
				};
			} else return {
				actionData: { [actionMatch.route.id]: result.data },
				actionHeaders: result.headers ? { [actionMatch.route.id]: result.headers } : {},
				matches,
				loaderData: {},
				errors: null,
				statusCode: result.statusCode || 200,
				loaderHeaders: {}
			};
		}
		let loaderRequest = new Request(request.url, {
			headers: request.headers,
			redirect: request.redirect,
			signal: request.signal
		});
		if (isErrorResult(result)) return {
			...await loadRouteData(loaderRequest, location, matches, requestContext, dataStrategy, skipLoaderErrorBubbling, null, filterMatchesToLoad, [(skipLoaderErrorBubbling ? actionMatch : findNearestBoundary(matches, actionMatch.route.id)).route.id, result]),
			statusCode: isRouteErrorResponse(result.error) ? result.error.status : result.statusCode != null ? result.statusCode : 500,
			actionData: null,
			actionHeaders: { ...result.headers ? { [actionMatch.route.id]: result.headers } : {} }
		};
		return {
			...await loadRouteData(loaderRequest, location, matches, requestContext, dataStrategy, skipLoaderErrorBubbling, null, filterMatchesToLoad),
			actionData: { [actionMatch.route.id]: result.data },
			...result.statusCode ? { statusCode: result.statusCode } : {},
			actionHeaders: result.headers ? { [actionMatch.route.id]: result.headers } : {}
		};
	}
	async function loadRouteData(request, location, matches, requestContext, dataStrategy, skipLoaderErrorBubbling, routeMatch, filterMatchesToLoad, pendingActionResult) {
		let isRouteRequest = routeMatch != null;
		if (isRouteRequest && !routeMatch?.route.loader && !routeMatch?.route.lazy) throw getInternalRouterError(400, {
			method: request.method,
			pathname: new URL(request.url).pathname,
			routeId: routeMatch?.route.id
		});
		let dsMatches;
		if (routeMatch) dsMatches = getTargetedDataStrategyMatches(mapRouteProperties2, manifest, request, location, matches, routeMatch, [], requestContext);
		else {
			let maxIdx = pendingActionResult && isErrorResult(pendingActionResult[1]) ? matches.findIndex((m) => m.route.id === pendingActionResult[0]) - 1 : void 0;
			let pattern = getRoutePattern(matches);
			dsMatches = matches.map((match, index) => {
				if (maxIdx != null && index > maxIdx) return getDataStrategyMatch(mapRouteProperties2, manifest, request, location, pattern, match, [], requestContext, false);
				return getDataStrategyMatch(mapRouteProperties2, manifest, request, location, pattern, match, [], requestContext, (match.route.loader || match.route.lazy) != null && (!filterMatchesToLoad || filterMatchesToLoad(match)));
			});
		}
		if (!dataStrategy && !dsMatches.some((m) => m.shouldLoad)) return {
			matches,
			loaderData: {},
			errors: pendingActionResult && isErrorResult(pendingActionResult[1]) ? { [pendingActionResult[0]]: pendingActionResult[1].error } : null,
			statusCode: 200,
			loaderHeaders: {}
		};
		let results = await callDataStrategy(request, location, dsMatches, isRouteRequest, requestContext, dataStrategy);
		if (request.signal.aborted) throwStaticHandlerAbortedError(request, isRouteRequest);
		return {
			...processRouteLoaderData(matches, results, pendingActionResult, true, skipLoaderErrorBubbling),
			matches
		};
	}
	async function callDataStrategy(request, location, matches, isRouteRequest, requestContext, dataStrategy) {
		let results = await callDataStrategyImpl(dataStrategy || defaultDataStrategy, request, location, matches, null, requestContext, true);
		let dataResults = {};
		await Promise.all(matches.map(async (match) => {
			if (!(match.route.id in results)) return;
			let result = results[match.route.id];
			if (isRedirectDataStrategyResult(result)) {
				let response = result.result;
				throw normalizeRelativeRoutingRedirectResponse(response, request, match.route.id, matches, basename);
			}
			if (isRouteRequest) {
				if (isResponse(result.result)) throw result;
				else if (isDataWithResponseInit(result.result)) throw dataWithResponseInitToResponse(result.result);
			}
			dataResults[match.route.id] = await convertDataStrategyResultToDataResult(result);
		}));
		return dataResults;
	}
	return {
		dataRoutes,
		_internalRouteBranches: routeBranches,
		query,
		queryRoute
	};
}
function getStaticContextFromError(routes, handlerContext, error, boundaryId) {
	let errorBoundaryId = boundaryId || handlerContext._deepestRenderedBoundaryId || routes[0].id;
	return {
		...handlerContext,
		statusCode: isRouteErrorResponse(error) ? error.status : 500,
		errors: { [errorBoundaryId]: error }
	};
}
function throwStaticHandlerAbortedError(request, isRouteRequest) {
	if (request.signal.reason !== void 0) throw request.signal.reason;
	throw new Error(`${isRouteRequest ? "queryRoute" : "query"}() call aborted without an \`AbortSignal.reason\`: ${request.method} ${request.url}`);
}
function isSubmissionNavigation(opts) {
	return opts != null && ("formData" in opts && opts.formData != null || "body" in opts && opts.body !== void 0);
}
function defaultNormalizePath(request) {
	let url = new URL(request.url);
	return {
		pathname: url.pathname,
		search: url.search,
		hash: url.hash
	};
}
function normalizeTo(location, matches, basename, to, fromRouteId, relative) {
	let contextualMatches;
	let activeRouteMatch;
	if (fromRouteId) {
		contextualMatches = [];
		for (let match of matches) {
			contextualMatches.push(match);
			if (match.route.id === fromRouteId) {
				activeRouteMatch = match;
				break;
			}
		}
	} else {
		contextualMatches = matches;
		activeRouteMatch = matches[matches.length - 1];
	}
	let path = resolveTo(to ? to : ".", getResolveToMatches(contextualMatches), stripBasename(location.pathname, basename) || location.pathname, relative === "path");
	if (to == null) {
		path.search = location.search;
		path.hash = location.hash;
	}
	if ((to == null || to === "" || to === ".") && activeRouteMatch) {
		let nakedIndex = hasNakedIndexQuery(path.search);
		if (activeRouteMatch.route.index && !nakedIndex) path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
		else if (!activeRouteMatch.route.index && nakedIndex) {
			let params = new URLSearchParams(path.search);
			let indexValues = params.getAll("index");
			params.delete("index");
			indexValues.filter((v) => v).forEach((v) => params.append("index", v));
			let qs = params.toString();
			path.search = qs ? `?${qs}` : "";
		}
	}
	if (basename !== "/") path.pathname = prependBasename({
		basename,
		pathname: path.pathname
	});
	return createPath(path);
}
function normalizeNavigateOptions(isFetcher, path, opts) {
	if (!opts || !isSubmissionNavigation(opts)) return { path };
	if (opts.formMethod && !isValidMethod(opts.formMethod)) return {
		path,
		error: getInternalRouterError(405, { method: opts.formMethod })
	};
	let getInvalidBodyError = () => ({
		path,
		error: getInternalRouterError(400, { type: "invalid-body" })
	});
	let formMethod = (opts.formMethod || "get").toUpperCase();
	let formAction = stripHashFromPath(path);
	if (opts.body !== void 0) {
		if (opts.formEncType === "text/plain") {
			if (!isMutationMethod(formMethod)) return getInvalidBodyError();
			let text = typeof opts.body === "string" ? opts.body : opts.body instanceof FormData || opts.body instanceof URLSearchParams ? Array.from(opts.body.entries()).reduce((acc, [name, value]) => `${acc}${name}=${value}
`, "") : String(opts.body);
			return {
				path,
				submission: {
					formMethod,
					formAction,
					formEncType: opts.formEncType,
					formData: void 0,
					json: void 0,
					text
				}
			};
		} else if (opts.formEncType === "application/json") {
			if (!isMutationMethod(formMethod)) return getInvalidBodyError();
			try {
				let json = typeof opts.body === "string" ? JSON.parse(opts.body) : opts.body;
				return {
					path,
					submission: {
						formMethod,
						formAction,
						formEncType: opts.formEncType,
						formData: void 0,
						json,
						text: void 0
					}
				};
			} catch (e) {
				return getInvalidBodyError();
			}
		}
	}
	invariant$1(typeof FormData === "function", "FormData is not available in this environment");
	let searchParams;
	let formData;
	if (opts.formData) {
		searchParams = convertFormDataToSearchParams(opts.formData);
		formData = opts.formData;
	} else if (opts.body instanceof FormData) {
		searchParams = convertFormDataToSearchParams(opts.body);
		formData = opts.body;
	} else if (opts.body instanceof URLSearchParams) {
		searchParams = opts.body;
		formData = convertSearchParamsToFormData(searchParams);
	} else if (opts.body == null) {
		searchParams = new URLSearchParams();
		formData = new FormData();
	} else try {
		searchParams = new URLSearchParams(opts.body);
		formData = convertSearchParamsToFormData(searchParams);
	} catch (e) {
		return getInvalidBodyError();
	}
	let submission = {
		formMethod,
		formAction,
		formEncType: opts && opts.formEncType || "application/x-www-form-urlencoded",
		formData,
		json: void 0,
		text: void 0
	};
	if (isMutationMethod(submission.formMethod)) return {
		path,
		submission
	};
	let parsedPath = parsePath(path);
	if (isFetcher && parsedPath.search && hasNakedIndexQuery(parsedPath.search)) searchParams.append("index", "");
	parsedPath.search = `?${searchParams}`;
	return {
		path: createPath(parsedPath),
		submission
	};
}
function getMatchesToLoad(request, scopedContext, mapRouteProperties2, manifest, history, state, matches, submission, location, lazyRoutePropertiesToSkip, initialHydration, isRevalidationRequired, cancelledFetcherLoads, fetchersQueuedForDeletion, fetchLoadMatches, fetchRedirectIds, routesToUse, basename, hasPatchRoutesOnNavigation, branches, pendingActionResult, callSiteDefaultShouldRevalidate) {
	let actionResult = pendingActionResult ? isErrorResult(pendingActionResult[1]) ? pendingActionResult[1].error : pendingActionResult[1].data : void 0;
	let currentUrl = history.createURL(state.location);
	let nextUrl = history.createURL(location);
	let maxIdx;
	if (initialHydration && state.errors) {
		let boundaryId = Object.keys(state.errors)[0];
		maxIdx = matches.findIndex((m) => m.route.id === boundaryId);
	} else if (pendingActionResult && isErrorResult(pendingActionResult[1])) {
		let boundaryId = pendingActionResult[0];
		maxIdx = matches.findIndex((m) => m.route.id === boundaryId) - 1;
	}
	let actionStatus = pendingActionResult ? pendingActionResult[1].statusCode : void 0;
	let shouldSkipRevalidation = actionStatus && actionStatus >= 400;
	let baseShouldRevalidateArgs = {
		currentUrl,
		currentParams: state.matches[0]?.params || {},
		nextUrl,
		nextParams: matches[0].params,
		...submission,
		actionResult,
		actionStatus
	};
	let pattern = getRoutePattern(matches);
	let dsMatches = matches.map((match, index) => {
		let { route } = match;
		let forceShouldLoad = null;
		if (maxIdx != null && index > maxIdx) forceShouldLoad = false;
		else if (route.lazy) forceShouldLoad = true;
		else if (!routeHasLoaderOrMiddleware(route)) forceShouldLoad = false;
		else if (initialHydration) {
			let { shouldLoad: shouldLoad2 } = getRouteHydrationStatus(route, state.loaderData, state.errors);
			forceShouldLoad = shouldLoad2;
		} else if (isNewLoader(state.loaderData, state.matches[index], match)) forceShouldLoad = true;
		if (forceShouldLoad !== null) return getDataStrategyMatch(mapRouteProperties2, manifest, request, location, pattern, match, lazyRoutePropertiesToSkip, scopedContext, forceShouldLoad);
		let defaultShouldRevalidate = false;
		if (typeof callSiteDefaultShouldRevalidate === "boolean") defaultShouldRevalidate = callSiteDefaultShouldRevalidate;
		else if (shouldSkipRevalidation) defaultShouldRevalidate = false;
		else if (isRevalidationRequired) defaultShouldRevalidate = true;
		else if (currentUrl.pathname + currentUrl.search === nextUrl.pathname + nextUrl.search) defaultShouldRevalidate = true;
		else if (currentUrl.search !== nextUrl.search) defaultShouldRevalidate = true;
		else if (isNewRouteInstance(state.matches[index], match)) defaultShouldRevalidate = true;
		let shouldRevalidateArgs = {
			...baseShouldRevalidateArgs,
			defaultShouldRevalidate
		};
		let shouldLoad = shouldRevalidateLoader(match, shouldRevalidateArgs);
		return getDataStrategyMatch(mapRouteProperties2, manifest, request, location, pattern, match, lazyRoutePropertiesToSkip, scopedContext, shouldLoad, shouldRevalidateArgs, callSiteDefaultShouldRevalidate);
	});
	let revalidatingFetchers = [];
	fetchLoadMatches.forEach((f, key) => {
		if (initialHydration || !matches.some((m) => m.route.id === f.routeId) || fetchersQueuedForDeletion.has(key)) return;
		let fetcher = state.fetchers.get(key);
		let isMidInitialLoad = fetcher && fetcher.state !== "idle" && fetcher.data === void 0;
		let fetcherMatches = matchRoutesImpl(routesToUse, f.path, basename ?? "/", false, branches);
		if (!fetcherMatches) {
			if (hasPatchRoutesOnNavigation && isMidInitialLoad) return;
			revalidatingFetchers.push({
				key,
				routeId: f.routeId,
				path: f.path,
				matches: null,
				match: null,
				request: null,
				controller: null
			});
			return;
		}
		if (fetchRedirectIds.has(key)) return;
		let fetcherMatch = getTargetMatch(fetcherMatches, f.path);
		let fetchController = new AbortController();
		let fetchRequest = createClientSideRequest(history, f.path, fetchController.signal);
		let fetcherDsMatches = null;
		if (cancelledFetcherLoads.has(key)) {
			cancelledFetcherLoads.delete(key);
			fetcherDsMatches = getTargetedDataStrategyMatches(mapRouteProperties2, manifest, fetchRequest, f.path, fetcherMatches, fetcherMatch, lazyRoutePropertiesToSkip, scopedContext);
		} else if (isMidInitialLoad) {
			if (isRevalidationRequired) fetcherDsMatches = getTargetedDataStrategyMatches(mapRouteProperties2, manifest, fetchRequest, f.path, fetcherMatches, fetcherMatch, lazyRoutePropertiesToSkip, scopedContext);
		} else {
			let defaultShouldRevalidate;
			if (typeof callSiteDefaultShouldRevalidate === "boolean") defaultShouldRevalidate = callSiteDefaultShouldRevalidate;
			else if (shouldSkipRevalidation) defaultShouldRevalidate = false;
			else defaultShouldRevalidate = isRevalidationRequired;
			let shouldRevalidateArgs = {
				...baseShouldRevalidateArgs,
				defaultShouldRevalidate
			};
			if (shouldRevalidateLoader(fetcherMatch, shouldRevalidateArgs)) fetcherDsMatches = getTargetedDataStrategyMatches(mapRouteProperties2, manifest, fetchRequest, f.path, fetcherMatches, fetcherMatch, lazyRoutePropertiesToSkip, scopedContext, shouldRevalidateArgs);
		}
		if (fetcherDsMatches) revalidatingFetchers.push({
			key,
			routeId: f.routeId,
			path: f.path,
			matches: fetcherDsMatches,
			match: fetcherMatch,
			request: fetchRequest,
			controller: fetchController
		});
	});
	return {
		dsMatches,
		revalidatingFetchers
	};
}
function routeHasLoaderOrMiddleware(route) {
	return route.loader != null || route.middleware != null && route.middleware.length > 0;
}
function getRouteHydrationStatus(route, loaderData, errors) {
	if (route.lazy) return {
		shouldLoad: true,
		renderFallback: true
	};
	if (!routeHasLoaderOrMiddleware(route)) return {
		shouldLoad: false,
		renderFallback: false
	};
	let hasData = loaderData != null && route.id in loaderData;
	let hasError = errors != null && errors[route.id] !== void 0;
	if (!hasData && hasError) return {
		shouldLoad: false,
		renderFallback: false
	};
	if (typeof route.loader === "function" && route.loader.hydrate === true) return {
		shouldLoad: true,
		renderFallback: !hasData
	};
	let shouldLoad = !hasData && !hasError;
	return {
		shouldLoad,
		renderFallback: shouldLoad
	};
}
function isNewLoader(currentLoaderData, currentMatch, match) {
	let isNew = !currentMatch || match.route.id !== currentMatch.route.id;
	let isMissingData = !currentLoaderData.hasOwnProperty(match.route.id);
	return isNew || isMissingData;
}
function isNewRouteInstance(currentMatch, match) {
	let currentPath = currentMatch.route.path;
	return currentMatch.pathname !== match.pathname || currentPath != null && currentPath.endsWith("*") && currentMatch.params["*"] !== match.params["*"];
}
function shouldRevalidateLoader(loaderMatch, arg) {
	if (loaderMatch.route.shouldRevalidate) {
		let routeChoice = loaderMatch.route.shouldRevalidate(arg);
		if (typeof routeChoice === "boolean") return routeChoice;
	}
	return arg.defaultShouldRevalidate;
}
function patchRoutesImpl(routeId, children, dataRoutes, manifest, mapRouteProperties2, allowElementMutations) {
	let childrenToPatch;
	if (routeId) {
		let route = manifest[routeId];
		invariant$1(route, `No route found to patch children into: routeId = ${routeId}`);
		if (!route.children) route.children = [];
		childrenToPatch = route.children;
	} else childrenToPatch = dataRoutes.activeRoutes;
	let uniqueChildren = [];
	let existingChildren = [];
	children.forEach((newRoute) => {
		let existingRoute = childrenToPatch.find((existingRoute2) => isSameRoute(newRoute, existingRoute2));
		if (existingRoute) existingChildren.push({
			existingRoute,
			newRoute
		});
		else uniqueChildren.push(newRoute);
	});
	if (uniqueChildren.length > 0) {
		let newRoutes = convertRoutesToDataRoutes(uniqueChildren, mapRouteProperties2, [
			routeId || "_",
			"patch",
			String(childrenToPatch?.length || "0")
		], manifest);
		childrenToPatch.push(...newRoutes);
	}
	if (allowElementMutations && existingChildren.length > 0) for (let i = 0; i < existingChildren.length; i++) {
		let { existingRoute, newRoute } = existingChildren[i];
		let existingRouteTyped = existingRoute;
		let [newRouteTyped] = convertRoutesToDataRoutes([newRoute], mapRouteProperties2, [], {}, true);
		Object.assign(existingRouteTyped, {
			element: newRouteTyped.element ? newRouteTyped.element : existingRouteTyped.element,
			errorElement: newRouteTyped.errorElement ? newRouteTyped.errorElement : existingRouteTyped.errorElement,
			hydrateFallbackElement: newRouteTyped.hydrateFallbackElement ? newRouteTyped.hydrateFallbackElement : existingRouteTyped.hydrateFallbackElement
		});
	}
	if (!dataRoutes.hasHMRRoutes) dataRoutes.setRoutes([...dataRoutes.activeRoutes]);
}
function isSameRoute(newRoute, existingRoute) {
	if ("id" in newRoute && "id" in existingRoute && newRoute.id === existingRoute.id) return true;
	if (!(newRoute.index === existingRoute.index && newRoute.path === existingRoute.path && newRoute.caseSensitive === existingRoute.caseSensitive)) return false;
	if ((!newRoute.children || newRoute.children.length === 0) && (!existingRoute.children || existingRoute.children.length === 0)) return true;
	return newRoute.children?.every((aChild, i) => existingRoute.children?.some((bChild) => isSameRoute(aChild, bChild))) ?? false;
}
function loadLazyRoute(route, type, manifest, mapRouteProperties2, lazyRoutePropertiesToSkip) {
	let routeToUpdate = manifest[route.id];
	invariant$1(routeToUpdate, "No route found in manifest");
	if (!route.lazy) return {
		lazyRoutePromise: void 0,
		lazyHandlerPromise: void 0
	};
	if (typeof route.lazy === "function") {
		let cachedPromise = lazyRouteFunctionCache.get(routeToUpdate);
		if (cachedPromise) return {
			lazyRoutePromise: cachedPromise,
			lazyHandlerPromise: cachedPromise
		};
		let lazyRoutePromise2 = (async () => {
			invariant$1(typeof route.lazy === "function", "No lazy route function found");
			let lazyRoute = await route.lazy();
			let routeUpdates = {};
			for (let lazyRouteProperty in lazyRoute) {
				let lazyValue = lazyRoute[lazyRouteProperty];
				if (lazyValue === void 0) continue;
				let isUnsupported = isUnsupportedLazyRouteFunctionKey(lazyRouteProperty);
				let isStaticallyDefined = routeToUpdate[lazyRouteProperty] !== void 0 && lazyRouteProperty !== "hasErrorBoundary";
				if (isUnsupported) warning(!isUnsupported, "Route property " + lazyRouteProperty + " is not a supported property to be returned from a lazy route function. This property will be ignored.");
				else if (isStaticallyDefined) warning(!isStaticallyDefined, `Route "${routeToUpdate.id}" has a static property "${lazyRouteProperty}" defined but its lazy function is also returning a value for this property. The lazy route property "${lazyRouteProperty}" will be ignored.`);
				else routeUpdates[lazyRouteProperty] = lazyValue;
			}
			Object.assign(routeToUpdate, routeUpdates);
			Object.assign(routeToUpdate, {
				...mapRouteProperties2(routeToUpdate),
				lazy: void 0
			});
		})();
		lazyRouteFunctionCache.set(routeToUpdate, lazyRoutePromise2);
		lazyRoutePromise2.catch(() => {});
		return {
			lazyRoutePromise: lazyRoutePromise2,
			lazyHandlerPromise: lazyRoutePromise2
		};
	}
	let lazyKeys = Object.keys(route.lazy);
	let lazyPropertyPromises = [];
	let lazyHandlerPromise = void 0;
	for (let key of lazyKeys) {
		if (lazyRoutePropertiesToSkip && lazyRoutePropertiesToSkip.includes(key)) continue;
		let promise = loadLazyRouteProperty({
			key,
			route,
			manifest,
			mapRouteProperties: mapRouteProperties2
		});
		if (promise) {
			lazyPropertyPromises.push(promise);
			if (key === type) lazyHandlerPromise = promise;
		}
	}
	let lazyRoutePromise = lazyPropertyPromises.length > 0 ? Promise.all(lazyPropertyPromises).then(() => {}) : void 0;
	lazyRoutePromise?.catch(() => {});
	lazyHandlerPromise?.catch(() => {});
	return {
		lazyRoutePromise,
		lazyHandlerPromise
	};
}
function isNonNullable(value) {
	return value !== void 0;
}
function loadLazyMiddlewareForMatches(matches, manifest, mapRouteProperties2) {
	let promises = matches.map(({ route }) => {
		if (typeof route.lazy !== "object" || !route.lazy.middleware) return;
		return loadLazyRouteProperty({
			key: "middleware",
			route,
			manifest,
			mapRouteProperties: mapRouteProperties2
		});
	}).filter(isNonNullable);
	return promises.length > 0 ? Promise.all(promises) : void 0;
}
async function defaultDataStrategy(args) {
	let matchesToLoad = args.matches.filter((m) => m.shouldLoad);
	let keyedResults = {};
	(await Promise.all(matchesToLoad.map((m) => m.resolve()))).forEach((result, i) => {
		keyedResults[matchesToLoad[i].route.id] = result;
	});
	return keyedResults;
}
async function defaultDataStrategyWithMiddleware(args) {
	if (!args.matches.some((m) => m.route.middleware)) return defaultDataStrategy(args);
	return runClientMiddlewarePipeline(args, () => defaultDataStrategy(args));
}
function runServerMiddlewarePipeline(args, handler, errorHandler) {
	return runMiddlewarePipeline(args, handler, processResult, isResponse, errorHandler);
	function processResult(result) {
		return isDataWithResponseInit(result) ? dataWithResponseInitToResponse(result) : result;
	}
}
function runClientMiddlewarePipeline(args, handler) {
	return runMiddlewarePipeline(args, handler, (r) => {
		if (isRedirectResponse(r)) throw r;
		return r;
	}, isDataStrategyResults, errorHandler);
	function errorHandler(error, routeId, nextResult) {
		if (nextResult) return Promise.resolve(Object.assign(nextResult.value, { [routeId]: {
			type: "error",
			result: error
		} }));
		else {
			let { matches } = args;
			let boundaryRouteId = findNearestBoundary(matches, matches[Math.min(Math.max(matches.findIndex((m) => m.route.id === routeId), 0), Math.max(matches.findIndex((m) => m.shouldCallHandler()), 0))].route.id).route.id;
			return Promise.resolve({ [boundaryRouteId]: {
				type: "error",
				result: error
			} });
		}
	}
}
async function runMiddlewarePipeline(args, handler, processResult, isResult, errorHandler) {
	let { matches, ...dataFnArgs } = args;
	return await callRouteMiddleware(dataFnArgs, matches.flatMap((m) => m.route.middleware ? m.route.middleware.map((fn) => [m.route.id, fn]) : []), handler, processResult, isResult, errorHandler);
}
async function callRouteMiddleware(args, middlewares, handler, processResult, isResult, errorHandler, idx = 0) {
	let { request } = args;
	if (request.signal.aborted) throw request.signal.reason ?? /* @__PURE__ */ new Error(`Request aborted: ${request.method} ${request.url}`);
	let tuple = middlewares[idx];
	if (!tuple) return await handler();
	let [routeId, middleware] = tuple;
	let nextResult;
	let next = async () => {
		if (nextResult) throw new Error("You may only call `next()` once per middleware");
		try {
			nextResult = { value: await callRouteMiddleware(args, middlewares, handler, processResult, isResult, errorHandler, idx + 1) };
			return nextResult.value;
		} catch (error) {
			nextResult = { value: await errorHandler(error, routeId, nextResult) };
			return nextResult.value;
		}
	};
	try {
		let value = await middleware(args, next);
		let result = value != null ? processResult(value) : void 0;
		if (isResult(result)) return result;
		else if (nextResult) return result ?? nextResult.value;
		else {
			nextResult = { value: await next() };
			return nextResult.value;
		}
	} catch (error) {
		return await errorHandler(error, routeId, nextResult);
	}
}
function getDataStrategyMatchLazyPromises(mapRouteProperties2, manifest, request, match, lazyRoutePropertiesToSkip) {
	let lazyMiddlewarePromise = loadLazyRouteProperty({
		key: "middleware",
		route: match.route,
		manifest,
		mapRouteProperties: mapRouteProperties2
	});
	let lazyRoutePromises = loadLazyRoute(match.route, isMutationMethod(request.method) ? "action" : "loader", manifest, mapRouteProperties2, lazyRoutePropertiesToSkip);
	return {
		middleware: lazyMiddlewarePromise,
		route: lazyRoutePromises.lazyRoutePromise,
		handler: lazyRoutePromises.lazyHandlerPromise
	};
}
function getDataStrategyMatch(mapRouteProperties2, manifest, request, path, pattern, match, lazyRoutePropertiesToSkip, scopedContext, shouldLoad, shouldRevalidateArgs = null, callSiteDefaultShouldRevalidate) {
	let isUsingNewApi = false;
	let _lazyPromises = getDataStrategyMatchLazyPromises(mapRouteProperties2, manifest, request, match, lazyRoutePropertiesToSkip);
	return {
		...match,
		_lazyPromises,
		shouldLoad,
		shouldRevalidateArgs,
		shouldCallHandler(defaultShouldRevalidate) {
			isUsingNewApi = true;
			if (!shouldRevalidateArgs) return shouldLoad;
			if (typeof callSiteDefaultShouldRevalidate === "boolean") return shouldRevalidateLoader(match, {
				...shouldRevalidateArgs,
				defaultShouldRevalidate: callSiteDefaultShouldRevalidate
			});
			if (typeof defaultShouldRevalidate === "boolean") return shouldRevalidateLoader(match, {
				...shouldRevalidateArgs,
				defaultShouldRevalidate
			});
			return shouldRevalidateLoader(match, shouldRevalidateArgs);
		},
		resolve(handlerOverride) {
			let { lazy, loader, middleware } = match.route;
			let callHandler = isUsingNewApi || shouldLoad || handlerOverride && !isMutationMethod(request.method) && (lazy || loader);
			let isMiddlewareOnlyRoute = middleware && middleware.length > 0 && !loader && !lazy;
			if (callHandler && (isMutationMethod(request.method) || !isMiddlewareOnlyRoute)) return callLoaderOrAction({
				request,
				path,
				pattern,
				match,
				lazyHandlerPromise: _lazyPromises?.handler,
				lazyRoutePromise: _lazyPromises?.route,
				handlerOverride,
				scopedContext
			});
			return Promise.resolve({
				type: "data",
				result: void 0
			});
		}
	};
}
function getTargetedDataStrategyMatches(mapRouteProperties2, manifest, request, path, matches, targetMatch, lazyRoutePropertiesToSkip, scopedContext, shouldRevalidateArgs = null) {
	return matches.map((match) => {
		if (match.route.id !== targetMatch.route.id) return {
			...match,
			shouldLoad: false,
			shouldRevalidateArgs,
			shouldCallHandler: () => false,
			_lazyPromises: getDataStrategyMatchLazyPromises(mapRouteProperties2, manifest, request, match, lazyRoutePropertiesToSkip),
			resolve: () => Promise.resolve({
				type: "data",
				result: void 0
			})
		};
		return getDataStrategyMatch(mapRouteProperties2, manifest, request, path, getRoutePattern(matches), match, lazyRoutePropertiesToSkip, scopedContext, true, shouldRevalidateArgs);
	});
}
async function callDataStrategyImpl(dataStrategyImpl, request, path, matches, fetcherKey, scopedContext, isStaticHandler) {
	if (matches.some((m) => m._lazyPromises?.middleware)) await Promise.all(matches.map((m) => m._lazyPromises?.middleware));
	let dataStrategyArgs = {
		request,
		url: createDataFunctionUrl(request, path),
		pattern: getRoutePattern(matches),
		params: matches[0].params,
		context: scopedContext,
		matches
	};
	let runClientMiddleware = isStaticHandler ? () => {
		throw new Error("You cannot call `runClientMiddleware()` from a static handler `dataStrategy`. Middleware is run outside of `dataStrategy` during SSR in order to bubble up the Response.  You can enable middleware via the `respond` API in `query`/`queryRoute`");
	} : (cb) => {
		let typedDataStrategyArgs = dataStrategyArgs;
		return runClientMiddlewarePipeline(typedDataStrategyArgs, () => {
			return cb({
				...typedDataStrategyArgs,
				fetcherKey,
				runClientMiddleware: () => {
					throw new Error("Cannot call `runClientMiddleware()` from within an `runClientMiddleware` handler");
				}
			});
		});
	};
	let results = await dataStrategyImpl({
		...dataStrategyArgs,
		fetcherKey,
		runClientMiddleware
	});
	try {
		await Promise.all(matches.flatMap((m) => [m._lazyPromises?.handler, m._lazyPromises?.route]));
	} catch (e) {}
	return results;
}
async function callLoaderOrAction({ request, path, pattern, match, lazyHandlerPromise, lazyRoutePromise, handlerOverride, scopedContext }) {
	let result;
	let onReject;
	let isAction = isMutationMethod(request.method);
	let type = isAction ? "action" : "loader";
	let runHandler = (handler) => {
		let reject;
		let abortPromise = new Promise((_, r) => reject = r);
		onReject = () => reject();
		request.signal.addEventListener("abort", onReject);
		let actualHandler = (ctx) => {
			if (typeof handler !== "function") return Promise.reject(/* @__PURE__ */ new Error(`You cannot call the handler for a route which defines a boolean "${type}" [routeId: ${match.route.id}]`));
			return handler({
				request,
				url: createDataFunctionUrl(request, path),
				pattern,
				params: match.params,
				context: scopedContext
			}, ...ctx !== void 0 ? [ctx] : []);
		};
		let handlerPromise = (async () => {
			try {
				return {
					type: "data",
					result: await (handlerOverride ? handlerOverride((ctx) => actualHandler(ctx)) : actualHandler())
				};
			} catch (e) {
				return {
					type: "error",
					result: e
				};
			}
		})();
		return Promise.race([handlerPromise, abortPromise]);
	};
	try {
		let handler = isAction ? match.route.action : match.route.loader;
		if (lazyHandlerPromise || lazyRoutePromise) {
			if (handler) {
				let handlerError;
				let [value] = await Promise.all([
					runHandler(handler).catch((e) => {
						handlerError = e;
					}),
					lazyHandlerPromise,
					lazyRoutePromise
				]);
				if (handlerError !== void 0) throw handlerError;
				result = value;
			} else {
				await lazyHandlerPromise;
				let handler2 = isAction ? match.route.action : match.route.loader;
				if (handler2) [result] = await Promise.all([runHandler(handler2), lazyRoutePromise]);
				else if (type === "action") {
					let url = new URL(request.url);
					let pathname = url.pathname + url.search;
					throw getInternalRouterError(405, {
						method: request.method,
						pathname,
						routeId: match.route.id
					});
				} else return {
					type: "data",
					result: void 0
				};
			}
		} else if (!handler) {
			let url = new URL(request.url);
			throw getInternalRouterError(404, { pathname: url.pathname + url.search });
		} else result = await runHandler(handler);
	} catch (e) {
		return {
			type: "error",
			result: e
		};
	} finally {
		if (onReject) request.signal.removeEventListener("abort", onReject);
	}
	return result;
}
async function parseResponseBody(response) {
	let contentType = response.headers.get("Content-Type");
	if (contentType && /\bapplication\/json\b/.test(contentType)) return response.body == null ? null : response.json();
	return response.text();
}
async function convertDataStrategyResultToDataResult(dataStrategyResult) {
	let { result, type } = dataStrategyResult;
	if (isResponse(result)) {
		let data2;
		try {
			data2 = await parseResponseBody(result);
		} catch (e) {
			return {
				type: "error",
				error: e
			};
		}
		if (type === "error") return {
			type: "error",
			error: new ErrorResponseImpl(result.status, result.statusText, data2),
			statusCode: result.status,
			headers: result.headers
		};
		return {
			type: "data",
			data: data2,
			statusCode: result.status,
			headers: result.headers
		};
	}
	if (type === "error") {
		if (isDataWithResponseInit(result)) {
			if (result.data instanceof Error) return {
				type: "error",
				error: result.data,
				statusCode: result.init?.status,
				headers: result.init?.headers ? new Headers(result.init.headers) : void 0
			};
			return {
				type: "error",
				error: dataWithResponseInitToErrorResponse(result),
				statusCode: isRouteErrorResponse(result) ? result.status : void 0,
				headers: result.init?.headers ? new Headers(result.init.headers) : void 0
			};
		}
		return {
			type: "error",
			error: result,
			statusCode: isRouteErrorResponse(result) ? result.status : void 0
		};
	}
	if (isDataWithResponseInit(result)) return {
		type: "data",
		data: result.data,
		statusCode: result.init?.status,
		headers: result.init?.headers ? new Headers(result.init.headers) : void 0
	};
	return {
		type: "data",
		data: result
	};
}
function normalizeRelativeRoutingRedirectResponse(response, request, routeId, matches, basename) {
	let location = response.headers.get("Location");
	invariant$1(location, "Redirects returned/thrown from loaders/actions must have a Location header");
	if (!isAbsoluteUrl(location)) {
		let trimmedMatches = matches.slice(0, matches.findIndex((m) => m.route.id === routeId) + 1);
		location = normalizeTo(new URL(request.url), trimmedMatches, basename, location);
		response.headers.set("Location", location);
	}
	return response;
}
function hasInvalidProtocol(location) {
	try {
		return invalidProtocols.includes(new URL(location).protocol);
	} catch {
		return false;
	}
}
function normalizeRedirectLocation$1(location, currentUrl, basename, historyInstance) {
	if (isAbsoluteUrl(location)) {
		let normalizedLocation = location;
		let url = PROTOCOL_RELATIVE_URL_REGEX.test(normalizedLocation) ? new URL(normalizeProtocolRelativeUrl(normalizedLocation, currentUrl.protocol)) : new URL(normalizedLocation);
		if (hasInvalidProtocol(url.toString())) throw new Error("Invalid redirect location");
		let isSameBasename = stripBasename(url.pathname, basename) != null;
		if (url.origin === currentUrl.origin && isSameBasename) return removeDoubleSlashes(url.pathname) + url.search + url.hash;
	}
	try {
		if (hasInvalidProtocol(historyInstance.createURL(location).toString())) throw new Error("Invalid redirect location");
	} catch (e) {}
	return location;
}
function createClientSideRequest(history, location, signal, submission) {
	let url = history.createURL(stripHashFromPath(location)).toString();
	let init = { signal };
	if (submission && isMutationMethod(submission.formMethod)) {
		let { formMethod, formEncType } = submission;
		init.method = formMethod.toUpperCase();
		if (formEncType === "application/json") {
			init.headers = new Headers({ "Content-Type": formEncType });
			init.body = JSON.stringify(submission.json);
		} else if (formEncType === "text/plain") init.body = submission.text;
		else if (formEncType === "application/x-www-form-urlencoded" && submission.formData) init.body = convertFormDataToSearchParams(submission.formData);
		else init.body = submission.formData;
	}
	return new Request(url, init);
}
function createDataFunctionUrl(request, path) {
	let url = new URL(request.url);
	let parsed = typeof path === "string" ? parsePath(path) : path;
	url.pathname = parsed.pathname || "/";
	if (parsed.search) {
		let searchParams = new URLSearchParams(parsed.search);
		let indexValues = searchParams.getAll("index");
		searchParams.delete("index");
		for (let value of indexValues.filter(Boolean)) searchParams.append("index", value);
		url.search = searchParams.size ? `?${searchParams.toString()}` : "";
	} else url.search = "";
	url.hash = parsed.hash || "";
	return url;
}
function convertFormDataToSearchParams(formData) {
	let searchParams = new URLSearchParams();
	for (let [key, value] of formData.entries()) searchParams.append(key, typeof value === "string" ? value : value.name);
	return searchParams;
}
function convertSearchParamsToFormData(searchParams) {
	let formData = new FormData();
	for (let [key, value] of searchParams.entries()) formData.append(key, value);
	return formData;
}
function processRouteLoaderData(matches, results, pendingActionResult, isStaticHandler = false, skipLoaderErrorBubbling = false) {
	let loaderData = {};
	let errors = null;
	let statusCode;
	let foundError = false;
	let loaderHeaders = {};
	let pendingError = pendingActionResult && isErrorResult(pendingActionResult[1]) ? pendingActionResult[1].error : void 0;
	matches.forEach((match) => {
		if (!(match.route.id in results)) return;
		let id = match.route.id;
		let result = results[id];
		invariant$1(!isRedirectResult(result), "Cannot handle redirect results in processLoaderData");
		if (isErrorResult(result)) {
			let error = result.error;
			if (pendingError !== void 0) {
				error = pendingError;
				pendingError = void 0;
			}
			errors = errors || {};
			if (skipLoaderErrorBubbling) errors[id] = error;
			else {
				let boundaryMatch = findNearestBoundary(matches, id);
				if (errors[boundaryMatch.route.id] == null) errors[boundaryMatch.route.id] = error;
			}
			if (!isStaticHandler) loaderData[id] = ResetLoaderDataSymbol;
			if (!foundError) {
				foundError = true;
				statusCode = isRouteErrorResponse(result.error) ? result.error.status : 500;
			}
			if (result.headers) loaderHeaders[id] = result.headers;
		} else {
			loaderData[id] = result.data;
			if (result.statusCode && result.statusCode !== 200 && !foundError) statusCode = result.statusCode;
			if (result.headers) loaderHeaders[id] = result.headers;
		}
	});
	if (pendingError !== void 0 && pendingActionResult) {
		errors = { [pendingActionResult[0]]: pendingError };
		if (pendingActionResult[2]) loaderData[pendingActionResult[2]] = void 0;
	}
	return {
		loaderData,
		errors,
		statusCode: statusCode || 200,
		loaderHeaders
	};
}
function processLoaderData(state, matches, results, pendingActionResult, revalidatingFetchers, fetcherResults, workingFetchers) {
	let { loaderData, errors } = processRouteLoaderData(matches, results, pendingActionResult);
	revalidatingFetchers.filter((f) => !f.matches || f.matches.some((m) => m.shouldLoad)).forEach((rf) => {
		let { key, match, controller } = rf;
		if (controller && controller.signal.aborted) return;
		let result = fetcherResults[key];
		invariant$1(result, "Did not find corresponding fetcher result");
		if (isErrorResult(result)) {
			let boundaryMatch = findNearestBoundary(state.matches, match?.route.id);
			if (!(errors && errors[boundaryMatch.route.id])) errors = {
				...errors,
				[boundaryMatch.route.id]: result.error
			};
			workingFetchers.delete(key);
		} else if (isRedirectResult(result)) invariant$1(false, "Unhandled fetcher revalidation redirect");
		else {
			let doneFetcher = getDoneFetcher(result.data);
			workingFetchers.set(key, doneFetcher);
		}
	});
	return {
		loaderData,
		errors
	};
}
function mergeLoaderData(loaderData, newLoaderData, matches, errors) {
	let mergedLoaderData = Object.entries(newLoaderData).filter(([, v]) => v !== ResetLoaderDataSymbol).reduce((merged, [k, v]) => {
		merged[k] = v;
		return merged;
	}, {});
	for (let match of matches) {
		let id = match.route.id;
		if (!newLoaderData.hasOwnProperty(id) && loaderData.hasOwnProperty(id) && match.route.loader) mergedLoaderData[id] = loaderData[id];
		if (errors && errors.hasOwnProperty(id)) break;
	}
	return mergedLoaderData;
}
function getActionDataForCommit(pendingActionResult) {
	if (!pendingActionResult) return {};
	return isErrorResult(pendingActionResult[1]) ? { actionData: {} } : { actionData: { [pendingActionResult[0]]: pendingActionResult[1].data } };
}
function findNearestBoundary(matches, routeId) {
	return (routeId ? matches.slice(0, matches.findIndex((m) => m.route.id === routeId) + 1) : [...matches]).reverse().find((m) => m.route.hasErrorBoundary === true) || matches[0];
}
function getShortCircuitMatches(routes) {
	let route = routes.length === 1 ? routes[0] : routes.find((r) => r.index || !r.path || r.path === "/") || { id: `__shim-error-route__` };
	return {
		matches: [{
			params: {},
			pathname: "",
			pathnameBase: "",
			route
		}],
		route
	};
}
function getInternalRouterError(status, { pathname, routeId, method, type, message } = {}) {
	let statusText = "Unknown Server Error";
	let errorMessage = "Unknown @remix-run/router error";
	if (status === 400) {
		statusText = "Bad Request";
		if (method && pathname && routeId) errorMessage = `You made a ${method} request to "${pathname}" but did not provide a \`loader\` for route "${routeId}", so there is no way to handle the request.`;
		else if (type === "invalid-body") errorMessage = "Unable to encode submission body";
	} else if (status === 403) {
		statusText = "Forbidden";
		errorMessage = `Route "${routeId}" does not match URL "${pathname}"`;
	} else if (status === 404) {
		statusText = "Not Found";
		errorMessage = `No route matches URL "${pathname}"`;
	} else if (status === 405) {
		statusText = "Method Not Allowed";
		if (method && pathname && routeId) errorMessage = `You made a ${method.toUpperCase()} request to "${pathname}" but did not provide an \`action\` for route "${routeId}", so there is no way to handle the request.`;
		else if (method) errorMessage = `Invalid request method "${method.toUpperCase()}"`;
	}
	return new ErrorResponseImpl(status || 500, statusText, new Error(errorMessage), true);
}
function findRedirect(results) {
	let entries = Object.entries(results);
	for (let i = entries.length - 1; i >= 0; i--) {
		let [key, result] = entries[i];
		if (isRedirectResult(result)) return {
			key,
			result
		};
	}
}
function stripHashFromPath(path) {
	return createPath({
		...typeof path === "string" ? parsePath(path) : path,
		hash: ""
	});
}
function isHashChangeOnly(a, b) {
	if (a.pathname !== b.pathname || a.search !== b.search) return false;
	if (a.hash === "") return b.hash !== "";
	else if (a.hash === b.hash) return true;
	else if (b.hash !== "") return true;
	return false;
}
function dataWithResponseInitToResponse(data2) {
	return Response.json(data2.data, data2.init ?? void 0);
}
function dataWithResponseInitToErrorResponse(data2) {
	return new ErrorResponseImpl(data2.init?.status ?? 500, data2.init?.statusText ?? "Internal Server Error", data2.data);
}
function isDataStrategyResults(result) {
	return result != null && typeof result === "object" && Object.entries(result).every(([key, value]) => typeof key === "string" && isDataStrategyResult(value));
}
function isDataStrategyResult(result) {
	return result != null && typeof result === "object" && "type" in result && "result" in result && (result.type === "data" || result.type === "error");
}
function isRedirectDataStrategyResult(result) {
	return isResponse(result.result) && redirectStatusCodes.has(result.result.status);
}
function isErrorResult(result) {
	return result.type === "error";
}
function isRedirectResult(result) {
	return (result && result.type) === "redirect";
}
function isDataWithResponseInit(value) {
	return typeof value === "object" && value != null && "type" in value && "data" in value && "init" in value && value.type === "DataWithResponseInit";
}
function isResponse(value) {
	return value != null && typeof value.status === "number" && typeof value.statusText === "string" && typeof value.headers === "object" && typeof value.body !== "undefined";
}
function isRedirectStatusCode(statusCode) {
	return redirectStatusCodes.has(statusCode);
}
function isRedirectResponse(result) {
	return isResponse(result) && isRedirectStatusCode(result.status) && result.headers.has("Location");
}
function isValidMethod(method) {
	return validRequestMethods.has(method.toUpperCase());
}
function isMutationMethod(method) {
	return validMutationMethods.has(method.toUpperCase());
}
function hasNakedIndexQuery(search) {
	return new URLSearchParams(search).getAll("index").some((v) => v === "");
}
function getTargetMatch(matches, location) {
	let search = typeof location === "string" ? parsePath(location).search : location.search;
	if (matches[matches.length - 1].route.index && hasNakedIndexQuery(search || "")) return matches[matches.length - 1];
	let pathMatches = getPathContributingMatches(matches);
	return pathMatches[pathMatches.length - 1];
}
function getSubmissionFromNavigation(navigation) {
	let { formMethod, formAction, formEncType, text, formData, json } = navigation;
	if (!formMethod || !formAction || !formEncType) return;
	if (text != null) return {
		formMethod,
		formAction,
		formEncType,
		formData: void 0,
		json: void 0,
		text
	};
	else if (formData != null) return {
		formMethod,
		formAction,
		formEncType,
		formData,
		json: void 0,
		text: void 0
	};
	else if (json !== void 0) return {
		formMethod,
		formAction,
		formEncType,
		formData: void 0,
		json,
		text: void 0
	};
}
function getLoadingNavigation(location, matches, historyAction, submission) {
	if (submission) return {
		state: "loading",
		location,
		matches,
		historyAction,
		formMethod: submission.formMethod,
		formAction: submission.formAction,
		formEncType: submission.formEncType,
		formData: submission.formData,
		json: submission.json,
		text: submission.text
	};
	else return {
		state: "loading",
		location,
		matches,
		historyAction,
		formMethod: void 0,
		formAction: void 0,
		formEncType: void 0,
		formData: void 0,
		json: void 0,
		text: void 0
	};
}
function getSubmittingNavigation(location, matches, historyAction, submission) {
	return {
		state: "submitting",
		location,
		matches,
		historyAction,
		formMethod: submission.formMethod,
		formAction: submission.formAction,
		formEncType: submission.formEncType,
		formData: submission.formData,
		json: submission.json,
		text: submission.text
	};
}
function getLoadingFetcher(submission, data2) {
	if (submission) return {
		state: "loading",
		formMethod: submission.formMethod,
		formAction: submission.formAction,
		formEncType: submission.formEncType,
		formData: submission.formData,
		json: submission.json,
		text: submission.text,
		data: data2
	};
	else return {
		state: "loading",
		formMethod: void 0,
		formAction: void 0,
		formEncType: void 0,
		formData: void 0,
		json: void 0,
		text: void 0,
		data: data2
	};
}
function getSubmittingFetcher(submission, existingFetcher) {
	return {
		state: "submitting",
		formMethod: submission.formMethod,
		formAction: submission.formAction,
		formEncType: submission.formEncType,
		formData: submission.formData,
		json: submission.json,
		text: submission.text,
		data: existingFetcher ? existingFetcher.data : void 0
	};
}
function getDoneFetcher(data2) {
	return {
		state: "idle",
		formMethod: void 0,
		formAction: void 0,
		formEncType: void 0,
		formData: void 0,
		json: void 0,
		text: void 0,
		data: data2
	};
}
function restoreAppliedTransitions(_window, transitions) {
	try {
		let sessionPositions = _window.sessionStorage.getItem(TRANSITIONS_STORAGE_KEY);
		if (sessionPositions) {
			let json = JSON.parse(sessionPositions);
			for (let [k, v] of Object.entries(json || {})) if (v && Array.isArray(v)) transitions.set(k, new Set(v || []));
		}
	} catch (e) {}
}
function persistAppliedTransitions(_window, transitions) {
	if (transitions.size > 0) {
		let json = {};
		for (let [k, v] of transitions) json[k] = [...v];
		try {
			_window.sessionStorage.setItem(TRANSITIONS_STORAGE_KEY, JSON.stringify(json));
		} catch (error) {
			warning(false, `Failed to save applied view transitions in sessionStorage (${error}).`);
		}
	}
}
function createDeferred() {
	let resolve;
	let reject;
	let promise = new Promise((res, rej) => {
		resolve = async (val) => {
			res(val);
			try {
				await promise;
			} catch (e) {}
		};
		reject = async (error) => {
			rej(error);
			try {
				await promise;
			} catch (e) {}
		};
	});
	return {
		promise,
		resolve,
		reject
	};
}
function useIsRSCRouterContext() {
	return React.useContext(RSCRouterContext);
}
function decodeRedirectErrorDigest(digest) {
	if (digest.startsWith(`${ERROR_DIGEST_BASE}:${ERROR_DIGEST_REDIRECT}:{`)) try {
		let parsed = JSON.parse(digest.slice(28));
		if (typeof parsed === "object" && parsed && typeof parsed.status === "number" && typeof parsed.statusText === "string" && typeof parsed.location === "string" && typeof parsed.reloadDocument === "boolean" && typeof parsed.replace === "boolean") return parsed;
	} catch {}
}
function decodeRouteErrorResponseDigest(digest) {
	if (digest.startsWith(`${ERROR_DIGEST_BASE}:${ERROR_DIGEST_ROUTE_ERROR_RESPONSE}:{`)) try {
		let parsed = JSON.parse(digest.slice(40));
		if (typeof parsed === "object" && parsed && typeof parsed.status === "number" && typeof parsed.statusText === "string") return new ErrorResponseImpl(parsed.status, parsed.statusText, parsed.data);
	} catch {}
}
function useHref(to, { relative } = {}) {
	invariant$1(useInRouterContext(), `useHref() may be used only in the context of a <Router> component.`);
	let { basename, navigator } = React.useContext(NavigationContext);
	let { hash, pathname, search } = useResolvedPath(to, { relative });
	let joinedPathname = pathname;
	if (basename !== "/") joinedPathname = pathname === "/" ? basename : joinPaths([basename, pathname]);
	return navigator.createHref({
		pathname: joinedPathname,
		search,
		hash
	});
}
function useInRouterContext() {
	return React.useContext(LocationContext) != null;
}
function useLocation$1() {
	invariant$1(useInRouterContext(), `useLocation() may be used only in the context of a <Router> component.`);
	return React.useContext(LocationContext).location;
}
function useNavigationType() {
	return React.useContext(LocationContext).navigationType;
}
function useMatch(pattern) {
	invariant$1(useInRouterContext(), `useMatch() may be used only in the context of a <Router> component.`);
	let { pathname } = useLocation$1();
	return React.useMemo(() => matchPath(pattern, decodePath(pathname)), [pathname, pattern]);
}
function useIsomorphicLayoutEffect(cb) {
	if (!React.useContext(NavigationContext).static) React.useLayoutEffect(cb);
}
function useNavigate$1() {
	let { isDataRoute } = React.useContext(RouteContext);
	return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}
function useNavigateUnstable() {
	invariant$1(useInRouterContext(), `useNavigate() may be used only in the context of a <Router> component.`);
	let dataRouterContext = React.useContext(DataRouterContext);
	let { basename, navigator } = React.useContext(NavigationContext);
	let { matches } = React.useContext(RouteContext);
	let { pathname: locationPathname } = useLocation$1();
	let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));
	let activeRef = React.useRef(false);
	useIsomorphicLayoutEffect(() => {
		activeRef.current = true;
	});
	return React.useCallback((to, options = {}) => {
		warning(activeRef.current, navigateEffectWarning);
		if (!activeRef.current) return;
		if (typeof to === "number") {
			navigator.go(to);
			return;
		}
		let path = resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, options.relative === "path");
		if (dataRouterContext == null && basename !== "/") path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
		validateNavigationTarget(typeof to === "string" ? to : createPath(to), navigator.createHref(path), getNavigatorCurrentUrl(navigator), "reject");
		(!!options.replace ? navigator.replace : navigator.push)(path, options.state, options);
	}, [
		basename,
		navigator,
		routePathnamesJson,
		locationPathname,
		dataRouterContext
	]);
}
function useOutletContext() {
	return React.useContext(OutletContext);
}
function useOutlet(context) {
	let outlet = React.useContext(RouteContext).outlet;
	return React.useMemo(() => outlet && /* @__PURE__ */ React.createElement(OutletContext.Provider, { value: context }, outlet), [outlet, context]);
}
function useParams$1() {
	let { matches } = React.useContext(RouteContext);
	return matches[matches.length - 1]?.params ?? {};
}
function useResolvedPath(to, { relative } = {}) {
	let { matches } = React.useContext(RouteContext);
	let { pathname: locationPathname } = useLocation$1();
	let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));
	return React.useMemo(() => resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, relative === "path"), [
		to,
		routePathnamesJson,
		locationPathname,
		relative
	]);
}
function useRoutes(routes, locationArg) {
	return useRoutesImpl(routes, locationArg);
}
function useRoutesImpl(routes, locationArg, dataRouterOpts) {
	invariant$1(useInRouterContext(), `useRoutes() may be used only in the context of a <Router> component.`);
	let { navigator } = React.useContext(NavigationContext);
	let { matches: parentMatches } = React.useContext(RouteContext);
	let routeMatch = parentMatches[parentMatches.length - 1];
	let parentParams = routeMatch ? routeMatch.params : {};
	let parentPathname = routeMatch ? routeMatch.pathname : "/";
	let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
	let parentRoute = routeMatch && routeMatch.route;
	{
		let parentPath = parentRoute && parentRoute.path || "";
		warningOnce(parentPathname, !parentRoute || parentPath.endsWith("*") || parentPath.endsWith("*?"), `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${parentPathname}" (under <Route path="${parentPath}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${parentPath}"> to <Route path="${parentPath === "/" ? "*" : `${parentPath}/*`}">.`);
	}
	let locationFromContext = useLocation$1();
	let location;
	if (locationArg) {
		let parsedLocationArg = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
		invariant$1(parentPathnameBase === "/" || parsedLocationArg.pathname?.startsWith(parentPathnameBase), `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${parentPathnameBase}" but pathname "${parsedLocationArg.pathname}" was given in the \`location\` prop.`);
		location = parsedLocationArg;
	} else location = locationFromContext;
	let pathname = location.pathname || "/";
	let remainingPathname = pathname;
	if (parentPathnameBase !== "/") {
		let parentSegments = parentPathnameBase.replace(/^\//, "").split("/");
		remainingPathname = "/" + pathname.replace(/^\//, "").split("/").slice(parentSegments.length).join("/");
	}
	let matches = dataRouterOpts && dataRouterOpts.state.matches.length ? dataRouterOpts.state.matches.map((m) => Object.assign(m, { route: dataRouterOpts.manifest[m.route.id] || m.route })) : matchRoutes(routes, { pathname: remainingPathname });
	warning(parentRoute || matches != null, `No routes matched location "${location.pathname}${location.search}${location.hash}" `);
	warning(matches == null || matches[matches.length - 1].route.element !== void 0 || matches[matches.length - 1].route.Component !== void 0 || matches[matches.length - 1].route.lazy !== void 0, `Matched leaf route at location "${location.pathname}${location.search}${location.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`);
	let renderedMatches = _renderMatches(matches && matches.map((match) => Object.assign({}, match, {
		params: Object.assign({}, parentParams, match.params),
		pathname: joinPaths([parentPathnameBase, navigator.encodeLocation ? navigator.encodeLocation(match.pathname.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")).pathname : match.pathname]),
		pathnameBase: match.pathnameBase === "/" ? parentPathnameBase : joinPaths([parentPathnameBase, navigator.encodeLocation ? navigator.encodeLocation(match.pathnameBase.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")).pathname : match.pathnameBase])
	})), parentMatches, dataRouterOpts);
	if (locationArg && renderedMatches) return /* @__PURE__ */ React.createElement(LocationContext.Provider, { value: {
		location: {
			pathname: "/",
			search: "",
			hash: "",
			state: null,
			key: "default",
			mask: void 0,
			...location
		},
		navigationType: "POP"
	} }, renderedMatches);
	return renderedMatches;
}
function DefaultErrorComponent() {
	let error = useRouteError();
	let message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : JSON.stringify(error);
	let stack = error instanceof Error ? error.stack : null;
	let lightgrey = "rgba(200,200,200, 0.5)";
	let preStyles = {
		padding: "0.5rem",
		backgroundColor: lightgrey
	};
	let codeStyles = {
		padding: "2px 4px",
		backgroundColor: lightgrey
	};
	let devInfo = null;
	console.error("Error handled by React Router default ErrorBoundary:", error);
	devInfo = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", null, "💿 Hey developer 👋"), /* @__PURE__ */ React.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", /* @__PURE__ */ React.createElement("code", { style: codeStyles }, "ErrorBoundary"), " or", " ", /* @__PURE__ */ React.createElement("code", { style: codeStyles }, "errorElement"), " prop on your route."));
	return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", null, "Unexpected Application Error!"), /* @__PURE__ */ React.createElement("h3", { style: { fontStyle: "italic" } }, message), stack ? /* @__PURE__ */ React.createElement("pre", { style: preStyles }, stack) : null, devInfo);
}
function RSCErrorHandler({ children, error }) {
	let { basename, navigator } = React.useContext(NavigationContext);
	if (typeof error === "object" && error && "digest" in error && typeof error.digest === "string") {
		let redirect2 = decodeRedirectErrorDigest(error.digest);
		if (redirect2) {
			let existingRedirect = errorRedirectHandledMap.get(error);
			if (existingRedirect) throw existingRedirect;
			let parsed = parseToInfo(redirect2.location, basename);
			let target = parsed.absoluteURL || parsed.to;
			validateNavigationTarget(redirect2.location, target, getNavigatorCurrentUrl(navigator), "allow-explicit");
			if (hasInvalidProtocol(target)) throw new Error("Invalid redirect location");
			if (isBrowser && !errorRedirectHandledMap.get(error)) {
				if (parsed.isExternal || redirect2.reloadDocument) window.location.href = target;
				else {
					const redirectPromise = Promise.resolve().then(() => window.__reactRouterDataRouter.navigate(parsed.to, { replace: redirect2.replace }));
					errorRedirectHandledMap.set(error, redirectPromise);
					throw redirectPromise;
				}
			}
			return /* @__PURE__ */ React.createElement("meta", {
				httpEquiv: "refresh",
				content: `0;url=${target}`
			});
		}
	}
	return children;
}
function RenderedRoute({ routeContext, match, children }) {
	let dataRouterContext = React.useContext(DataRouterContext);
	if (dataRouterContext && dataRouterContext.static && dataRouterContext.staticContext && (match.route.errorElement || match.route.ErrorBoundary)) dataRouterContext.staticContext._deepestRenderedBoundaryId = match.route.id;
	return /* @__PURE__ */ React.createElement(RouteContext.Provider, { value: routeContext }, children);
}
function _renderMatches(matches, parentMatches = [], dataRouterOpts) {
	let dataRouterState = dataRouterOpts?.state;
	if (matches == null) {
		if (!dataRouterState) return null;
		if (dataRouterState.errors) matches = dataRouterState.matches;
		else if (parentMatches.length === 0 && !dataRouterState.initialized && dataRouterState.matches.length > 0) matches = dataRouterState.matches;
		else return null;
	}
	let renderedMatches = matches;
	let errors = dataRouterState?.errors;
	if (errors != null) {
		let errorIndex = renderedMatches.findIndex((m) => m.route.id && errors?.[m.route.id] !== void 0);
		invariant$1(errorIndex >= 0, `Could not find a matching route for errors on route IDs: ${Object.keys(errors).join(",")}`);
		renderedMatches = renderedMatches.slice(0, Math.min(renderedMatches.length, errorIndex + 1));
	}
	let renderFallback = false;
	let fallbackIndex = -1;
	if (dataRouterOpts && dataRouterState) {
		renderFallback = dataRouterState.renderFallback;
		for (let i = 0; i < renderedMatches.length; i++) {
			let match = renderedMatches[i];
			if (match.route.HydrateFallback || match.route.hydrateFallbackElement) fallbackIndex = i;
			if (match.route.id) {
				let { loaderData, errors: errors2 } = dataRouterState;
				let needsToRunLoader = match.route.loader && !loaderData.hasOwnProperty(match.route.id) && (!errors2 || errors2[match.route.id] === void 0);
				if (match.route.lazy || needsToRunLoader) {
					if (dataRouterOpts.isStatic) renderFallback = true;
					if (fallbackIndex >= 0) renderedMatches = renderedMatches.slice(0, fallbackIndex + 1);
					else renderedMatches = [renderedMatches[0]];
					break;
				}
			}
		}
	}
	let onErrorHandler = dataRouterOpts?.onError;
	let onError = dataRouterState && onErrorHandler ? (error, errorInfo) => {
		onErrorHandler(error, {
			location: dataRouterState.location,
			params: dataRouterState.matches?.[0]?.params ?? {},
			pattern: getRoutePattern(dataRouterState.matches),
			errorInfo
		});
	} : void 0;
	return renderedMatches.reduceRight((outlet, match, index) => {
		let error;
		let shouldRenderHydrateFallback = false;
		let errorElement = null;
		let hydrateFallbackElement = null;
		if (dataRouterState) {
			error = errors && match.route.id ? errors[match.route.id] : void 0;
			errorElement = match.route.errorElement || defaultErrorElement;
			if (renderFallback) {
				if (fallbackIndex < 0 && index === 0) {
					warningOnce("route-fallback", false, "No `HydrateFallback` element provided to render during initial hydration");
					shouldRenderHydrateFallback = true;
					hydrateFallbackElement = null;
				} else if (fallbackIndex === index) {
					shouldRenderHydrateFallback = true;
					hydrateFallbackElement = match.route.hydrateFallbackElement || null;
				}
			}
		}
		let matches2 = parentMatches.concat(renderedMatches.slice(0, index + 1));
		let getChildren = () => {
			let children;
			if (error) children = errorElement;
			else if (shouldRenderHydrateFallback) children = hydrateFallbackElement;
			else if (match.route.Component) children = /* @__PURE__ */ React.createElement(match.route.Component, null);
			else if (match.route.element) children = match.route.element;
			else children = outlet;
			return /* @__PURE__ */ React.createElement(RenderedRoute, {
				match,
				routeContext: {
					outlet,
					matches: matches2,
					isDataRoute: dataRouterState != null
				},
				children
			});
		};
		return dataRouterState && (match.route.ErrorBoundary || match.route.errorElement || index === 0) ? /* @__PURE__ */ React.createElement(RenderErrorBoundary, {
			location: dataRouterState.location,
			revalidation: dataRouterState.revalidation,
			component: errorElement,
			error,
			children: getChildren(),
			routeContext: {
				outlet: null,
				matches: matches2,
				isDataRoute: true
			},
			onError
		}) : getChildren();
	}, null);
}
function getDataRouterConsoleError(hookName) {
	return `${hookName} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function useDataRouterContext(hookName) {
	let ctx = React.useContext(DataRouterContext);
	invariant$1(ctx, getDataRouterConsoleError(hookName));
	return ctx;
}
function useDataRouterState(hookName) {
	let state = React.useContext(DataRouterStateContext);
	invariant$1(state, getDataRouterConsoleError(hookName));
	return state;
}
function useRouteContext(hookName) {
	let route = React.useContext(RouteContext);
	invariant$1(route, getDataRouterConsoleError(hookName));
	return route;
}
function useCurrentRouteId(hookName) {
	let route = useRouteContext(hookName);
	let thisRoute = route.matches[route.matches.length - 1];
	invariant$1(thisRoute.route.id, `${hookName} can only be used on routes that contain a unique "id"`);
	return thisRoute.route.id;
}
function useRouteId() {
	return useCurrentRouteId("useRouteId");
}
function useNavigation() {
	let state = useDataRouterState("useNavigation");
	return React.useMemo(() => {
		let { matches, historyAction, ...rest } = state.navigation;
		return rest;
	}, [state.navigation]);
}
function useRevalidator() {
	let dataRouterContext = useDataRouterContext("useRevalidator");
	let state = useDataRouterState("useRevalidator");
	let revalidate = React.useCallback(async () => {
		await dataRouterContext.router.revalidate();
	}, [dataRouterContext.router]);
	return React.useMemo(() => ({
		revalidate,
		state: state.revalidation
	}), [revalidate, state.revalidation]);
}
function useMatches() {
	let { matches, loaderData } = useDataRouterState("useMatches");
	return React.useMemo(() => matches.map((m) => convertRouteMatchToUiMatch(m, loaderData)), [matches, loaderData]);
}
function useLoaderData() {
	let state = useDataRouterState("useLoaderData");
	let routeId = useCurrentRouteId("useLoaderData");
	return state.loaderData[routeId];
}
function useRouteLoaderData(routeId) {
	return useDataRouterState("useRouteLoaderData").loaderData[routeId];
}
function useActionData() {
	let state = useDataRouterState("useActionData");
	let routeId = useCurrentRouteId("useLoaderData");
	return state.actionData ? state.actionData[routeId] : void 0;
}
function useRouteError() {
	let error = React.useContext(RouteErrorContext);
	let state = useDataRouterState("useRouteError");
	let routeId = useCurrentRouteId("useRouteError");
	if (error !== void 0) return error;
	return state.errors?.[routeId];
}
function useAsyncValue() {
	return React.useContext(AwaitContext)?._data;
}
function useAsyncError() {
	return React.useContext(AwaitContext)?._error;
}
function useBlocker(shouldBlock) {
	let { router, basename } = useDataRouterContext("useBlocker");
	let state = useDataRouterState("useBlocker");
	let [blockerKey, setBlockerKey] = React.useState("");
	let blockerFunction = React.useCallback((arg) => {
		if (typeof shouldBlock !== "function") return !!shouldBlock;
		if (basename === "/") return shouldBlock(arg);
		let { currentLocation, nextLocation, historyAction } = arg;
		return shouldBlock({
			currentLocation: {
				...currentLocation,
				pathname: stripBasename(currentLocation.pathname, basename) || currentLocation.pathname
			},
			nextLocation: {
				...nextLocation,
				pathname: stripBasename(nextLocation.pathname, basename) || nextLocation.pathname
			},
			historyAction
		});
	}, [basename, shouldBlock]);
	React.useEffect(() => {
		let key = String(++blockerId);
		setBlockerKey(key);
		return () => router.deleteBlocker(key);
	}, [router]);
	React.useEffect(() => {
		if (blockerKey !== "") router.getBlocker(blockerKey, blockerFunction);
	}, [
		router,
		blockerKey,
		blockerFunction
	]);
	return blockerKey && state.blockers.has(blockerKey) ? state.blockers.get(blockerKey) : IDLE_BLOCKER;
}
function useNavigateStable() {
	let { router } = useDataRouterContext("useNavigate");
	let id = useCurrentRouteId("useNavigate");
	let activeRef = React.useRef(false);
	useIsomorphicLayoutEffect(() => {
		activeRef.current = true;
	});
	return React.useCallback(async (to, options = {}) => {
		warning(activeRef.current, navigateEffectWarning);
		if (!activeRef.current) return;
		if (typeof to === "number") await router.navigate(to);
		else await router.navigate(to, {
			fromRouteId: id,
			...options
		});
	}, [router, id]);
}
function warningOnce(key, cond, message) {
	if (!cond && !alreadyWarned[key]) {
		alreadyWarned[key] = true;
		warning(false, message);
	}
}
function useRoute(...args) {
	const currentRouteId = useCurrentRouteId("useRoute");
	const id = args[0] ?? currentRouteId;
	const state = useDataRouterState("useRoute");
	const route = state.matches.find(({ route: route2 }) => route2.id === id);
	if (route === void 0) return void 0;
	return {
		handle: route.route.handle,
		loaderData: state.loaderData[id],
		actionData: state.actionData?.[id]
	};
}
function toRouterStateMatch(match) {
	return {
		id: match.route.id,
		pathname: match.pathname,
		params: match.params,
		handle: match.route.handle
	};
}
function useRouterState() {
	let { location, historyAction: type, matches, navigation } = useDataRouterState("unstable_useRouterState");
	let active = React.useMemo(() => ({
		type,
		location,
		searchParams: new URLSearchParams(location.search),
		params: matches[matches.length - 1]?.params ?? {},
		matches: matches.map((m) => toRouterStateMatch(m))
	}), [
		location,
		matches,
		type
	]);
	let pending = React.useMemo(() => {
		if (navigation.state === "idle") return null;
		let shared = {
			type: navigation.historyAction,
			location: navigation.location,
			searchParams: new URLSearchParams(navigation.location.search),
			params: navigation.matches[navigation.matches.length - 1]?.params ?? {},
			matches: navigation.matches.map((m) => toRouterStateMatch(m))
		};
		return navigation.state === "loading" ? {
			...shared,
			state: "loading",
			formMethod: navigation.formMethod,
			formAction: navigation.formAction,
			formEncType: navigation.formEncType,
			formData: navigation.formData,
			json: navigation.json,
			text: navigation.text
		} : {
			...shared,
			state: "submitting",
			formMethod: navigation.formMethod,
			formAction: navigation.formAction,
			formEncType: navigation.formEncType,
			formData: navigation.formData,
			json: navigation.json,
			text: navigation.text
		};
	}, [navigation]);
	return React.useMemo(() => ({
		active,
		pending
	}), [active, pending]);
}
function warnOnce(condition, message) {
	if (!condition && !alreadyWarned2[message]) {
		alreadyWarned2[message] = true;
		console.warn(message);
	}
}
function useOptimisticSafe(val) {
	if (useOptimisticImpl) return useOptimisticImpl(val);
	else return [val, stableUseOptimisticSetter];
}
function mapRouteProperties(route) {
	let updates = { hasErrorBoundary: route.hasErrorBoundary || route.ErrorBoundary != null || route.errorElement != null };
	if (route.Component) {
		if (route.element) warning(false, "You should not include both `Component` and `element` on your route - `Component` will be used.");
		Object.assign(updates, {
			element: React.createElement(route.Component),
			Component: void 0
		});
	}
	if (route.HydrateFallback) {
		if (route.hydrateFallbackElement) warning(false, "You should not include both `HydrateFallback` and `hydrateFallbackElement` on your route - `HydrateFallback` will be used.");
		Object.assign(updates, {
			hydrateFallbackElement: React.createElement(route.HydrateFallback),
			HydrateFallback: void 0
		});
	}
	if (route.ErrorBoundary) {
		if (route.errorElement) warning(false, "You should not include both `ErrorBoundary` and `errorElement` on your route - `ErrorBoundary` will be used.");
		Object.assign(updates, {
			errorElement: React.createElement(route.ErrorBoundary),
			ErrorBoundary: void 0
		});
	}
	return updates;
}
function createMemoryRouter(routes, opts) {
	return createRouter({
		basename: opts?.basename,
		getContext: opts?.getContext,
		future: opts?.future,
		history: createMemoryHistory({
			initialEntries: opts?.initialEntries,
			initialIndex: opts?.initialIndex
		}),
		hydrationData: opts?.hydrationData,
		routes,
		hydrationRouteProperties,
		mapRouteProperties,
		dataStrategy: opts?.dataStrategy,
		patchRoutesOnNavigation: opts?.patchRoutesOnNavigation,
		instrumentations: opts?.instrumentations
	}).initialize();
}
function RouterProvider$1({ router, flushSync: reactDomFlushSyncImpl, onError, useTransitions }) {
	useTransitions = useIsRSCRouterContext() || useTransitions;
	let [_state, setStateImpl] = React.useState(router.state);
	let [state, setOptimisticState] = useOptimisticSafe(_state);
	let [pendingState, setPendingState] = React.useState();
	let [vtContext, setVtContext] = React.useState({ isTransitioning: false });
	let [renderDfd, setRenderDfd] = React.useState();
	let [transition, setTransition] = React.useState();
	let [interruption, setInterruption] = React.useState();
	let fetcherData = React.useRef(/* @__PURE__ */ new Map());
	let setState = React.useCallback((newState, { deletedFetchers, newErrors, flushSync, viewTransitionOpts }) => {
		if (newErrors && onError) Object.values(newErrors).forEach((error) => onError(error, {
			location: newState.location,
			params: newState.matches[0]?.params ?? {},
			pattern: getRoutePattern(newState.matches)
		}));
		newState.fetchers.forEach((fetcher, key) => {
			if (fetcher.data !== void 0) fetcherData.current.set(key, fetcher.data);
		});
		deletedFetchers.forEach((key) => fetcherData.current.delete(key));
		warnOnce(flushSync === false || reactDomFlushSyncImpl != null, "You provided the `flushSync` option to a router update, but you are not using the `<RouterProvider>` from `react-router/dom` so `ReactDOM.flushSync()` is unavailable.  Please update your app to `import { RouterProvider } from \"react-router/dom\"` and ensure you have `react-dom` installed as a dependency to use the `flushSync` option.");
		let isViewTransitionAvailable = router.window != null && router.window.document != null && typeof router.window.document.startViewTransition === "function";
		warnOnce(viewTransitionOpts == null || isViewTransitionAvailable, "You provided the `viewTransition` option to a router update, but you do not appear to be running in a DOM environment as `window.startViewTransition` is not available.");
		if (!viewTransitionOpts || !isViewTransitionAvailable) {
			if (reactDomFlushSyncImpl && flushSync) reactDomFlushSyncImpl(() => setStateImpl(newState));
			else if (useTransitions === false) setStateImpl(newState);
			else React.startTransition(() => {
				if (useTransitions === true) setOptimisticState((s) => getOptimisticRouterState(s, newState));
				setStateImpl(newState);
			});
			return;
		}
		if (reactDomFlushSyncImpl && flushSync) {
			reactDomFlushSyncImpl(() => {
				if (transition) {
					renderDfd?.resolve();
					transition.skipTransition();
				}
				setVtContext({
					isTransitioning: true,
					flushSync: true,
					currentLocation: viewTransitionOpts.currentLocation,
					nextLocation: viewTransitionOpts.nextLocation
				});
			});
			let t = router.window.document.startViewTransition(() => {
				reactDomFlushSyncImpl(() => setStateImpl(newState));
			});
			t.finished.finally(() => {
				reactDomFlushSyncImpl(() => {
					setRenderDfd(void 0);
					setTransition(void 0);
					setPendingState(void 0);
					setVtContext({ isTransitioning: false });
				});
			});
			reactDomFlushSyncImpl(() => setTransition(t));
			return;
		}
		if (transition) {
			renderDfd?.resolve();
			transition.skipTransition();
			setInterruption({
				state: newState,
				currentLocation: viewTransitionOpts.currentLocation,
				nextLocation: viewTransitionOpts.nextLocation
			});
		} else {
			setPendingState(newState);
			setVtContext({
				isTransitioning: true,
				flushSync: false,
				currentLocation: viewTransitionOpts.currentLocation,
				nextLocation: viewTransitionOpts.nextLocation
			});
		}
	}, [
		router.window,
		reactDomFlushSyncImpl,
		transition,
		renderDfd,
		useTransitions,
		setOptimisticState,
		onError
	]);
	React.useLayoutEffect(() => router.subscribe(setState), [router, setState]);
	React.useEffect(() => {
		if (vtContext.isTransitioning && !vtContext.flushSync) setRenderDfd(new Deferred());
	}, [vtContext]);
	React.useEffect(() => {
		if (renderDfd && pendingState && router.window) {
			let newState = pendingState;
			let renderPromise = renderDfd.promise;
			let transition2 = router.window.document.startViewTransition(async () => {
				if (useTransitions === false) setStateImpl(newState);
				else React.startTransition(() => {
					if (useTransitions === true) setOptimisticState((s) => getOptimisticRouterState(s, newState));
					setStateImpl(newState);
				});
				await renderPromise;
			});
			transition2.finished.finally(() => {
				setRenderDfd(void 0);
				setTransition(void 0);
				setPendingState(void 0);
				setVtContext({ isTransitioning: false });
			});
			setTransition(transition2);
		}
	}, [
		pendingState,
		renderDfd,
		router.window,
		useTransitions,
		setOptimisticState
	]);
	React.useEffect(() => {
		if (renderDfd && pendingState && state.location.key === pendingState.location.key) renderDfd.resolve();
	}, [
		renderDfd,
		transition,
		state.location,
		pendingState
	]);
	React.useEffect(() => {
		if (!vtContext.isTransitioning && interruption) {
			setPendingState(interruption.state);
			setVtContext({
				isTransitioning: true,
				flushSync: false,
				currentLocation: interruption.currentLocation,
				nextLocation: interruption.nextLocation
			});
			setInterruption(void 0);
		}
	}, [vtContext.isTransitioning, interruption]);
	let navigator = React.useMemo(() => {
		return {
			createHref: router.createHref,
			createURL: router.createURL,
			encodeLocation: router.encodeLocation,
			go: (n) => router.navigate(n),
			push: (to, state2, opts) => router.navigate(to, {
				state: state2,
				preventScrollReset: opts?.preventScrollReset
			}),
			replace: (to, state2, opts) => router.navigate(to, {
				replace: true,
				state: state2,
				preventScrollReset: opts?.preventScrollReset
			})
		};
	}, [router]);
	let basename = router.basename || "/";
	let dataRouterContext = React.useMemo(() => ({
		router,
		navigator,
		static: false,
		basename,
		onError
	}), [
		router,
		navigator,
		basename,
		onError
	]);
	return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DataRouterContext.Provider, { value: dataRouterContext }, /* @__PURE__ */ React.createElement(DataRouterStateContext.Provider, { value: state }, /* @__PURE__ */ React.createElement(FetchersContext.Provider, { value: fetcherData.current }, /* @__PURE__ */ React.createElement(ViewTransitionContext.Provider, { value: vtContext }, /* @__PURE__ */ React.createElement(Router, {
		basename,
		location: state.location,
		navigationType: state.historyAction,
		navigator,
		useTransitions
	}, /* @__PURE__ */ React.createElement(MemoizedDataRoutes, {
		routes: router.routes,
		manifest: router.manifest,
		future: router.future,
		state,
		isStatic: false,
		onError
	})))))), null);
}
function getOptimisticRouterState(currentState, newState) {
	return {
		...currentState,
		navigation: newState.navigation.state !== "idle" ? newState.navigation : currentState.navigation,
		revalidation: newState.revalidation !== "idle" ? newState.revalidation : currentState.revalidation,
		actionData: newState.navigation.state !== "submitting" ? newState.actionData : currentState.actionData,
		fetchers: newState.fetchers
	};
}
function DataRoutes2({ routes, manifest, future, state, isStatic, onError }) {
	return useRoutesImpl(routes, void 0, {
		manifest,
		state,
		isStatic,
		onError,
		future
	});
}
function MemoryRouter({ basename, children, initialEntries, initialIndex, useTransitions }) {
	let historyRef = React.useRef();
	if (historyRef.current == null) historyRef.current = createMemoryHistory({
		initialEntries,
		initialIndex,
		v5Compat: true
	});
	let history = historyRef.current;
	let [state, setStateImpl] = React.useState({
		action: history.action,
		location: history.location
	});
	let setState = React.useCallback((newState) => {
		if (useTransitions === false) setStateImpl(newState);
		else React.startTransition(() => setStateImpl(newState));
	}, [useTransitions]);
	React.useLayoutEffect(() => history.listen(setState), [history, setState]);
	return /* @__PURE__ */ React.createElement(Router, {
		basename,
		children,
		location: state.location,
		navigationType: state.action,
		navigator: history,
		useTransitions
	});
}
function Navigate({ to, replace: replace2, state, relative }) {
	invariant$1(useInRouterContext(), `<Navigate> may be used only in the context of a <Router> component.`);
	let { static: isStatic, navigator } = React.useContext(NavigationContext);
	warning(!isStatic, `<Navigate> must not be used on the initial render in a <StaticRouter>. This is a no-op, but you should modify your code so the <Navigate> is only ever rendered in response to some user interaction or state change.`);
	let { matches } = React.useContext(RouteContext);
	let { pathname: locationPathname } = useLocation$1();
	let navigate = useNavigate$1();
	let path = resolveTo(to, getResolveToMatches(matches), locationPathname, relative === "path");
	validateNavigationTarget(typeof to === "string" ? to : createPath(to), navigator.createHref(path), getNavigatorCurrentUrl(navigator), "reject");
	let jsonPath = JSON.stringify(path);
	React.useEffect(() => {
		navigate(JSON.parse(jsonPath), {
			replace: replace2,
			state,
			relative
		});
	}, [
		navigate,
		jsonPath,
		relative,
		replace2,
		state
	]);
	return null;
}
function Outlet$1(props) {
	return useOutlet(props.context);
}
function Route$1(props) {
	invariant$1(false, `A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.`);
}
function Router({ basename: basenameProp = "/", children = null, location: locationProp, navigationType = "POP", navigator, static: staticProp = false, useTransitions }) {
	invariant$1(!useInRouterContext(), `You cannot render a <Router> inside another <Router>. You should never have more than one in your app.`);
	let basename = basenameProp.replace(/^\/*/, "/");
	let navigationContext = React.useMemo(() => ({
		basename,
		navigator,
		static: staticProp,
		useTransitions,
		future: {}
	}), [
		basename,
		navigator,
		staticProp,
		useTransitions
	]);
	if (typeof locationProp === "string") locationProp = parsePath(locationProp);
	let { pathname = "/", search = "", hash = "", state = null, key = "default", mask } = locationProp;
	let locationContext = React.useMemo(() => {
		let trailingPathname = stripBasename(pathname, basename);
		if (trailingPathname == null) return null;
		return {
			location: {
				pathname: trailingPathname,
				search,
				hash,
				state,
				key,
				mask
			},
			navigationType
		};
	}, [
		basename,
		pathname,
		search,
		hash,
		state,
		key,
		navigationType,
		mask
	]);
	warning(locationContext != null, `<Router basename="${basename}"> is not able to match the URL "${pathname}${search}${hash}" because it does not start with the basename, so the <Router> won't render anything.`);
	if (locationContext == null) return null;
	return /* @__PURE__ */ React.createElement(NavigationContext.Provider, { value: navigationContext }, /* @__PURE__ */ React.createElement(LocationContext.Provider, {
		children,
		value: locationContext
	}));
}
function Routes$1({ children, location }) {
	return useRoutes(createRoutesFromChildren(children), location);
}
function Await({ children, errorElement, resolve }) {
	let dataRouterContext = React.useContext(DataRouterContext);
	let dataRouterStateContext = React.useContext(DataRouterStateContext);
	let onError = React.useCallback((error, errorInfo) => {
		if (dataRouterContext && dataRouterContext.onError && dataRouterStateContext) dataRouterContext.onError(error, {
			location: dataRouterStateContext.location,
			params: dataRouterStateContext.matches[0]?.params || {},
			pattern: getRoutePattern(dataRouterStateContext.matches),
			errorInfo
		});
	}, [dataRouterContext, dataRouterStateContext]);
	return /* @__PURE__ */ React.createElement(AwaitErrorBoundary, {
		resolve,
		errorElement,
		onError
	}, /* @__PURE__ */ React.createElement(ResolveAwait, null, children));
}
function ResolveAwait({ children }) {
	let data2 = useAsyncValue();
	let toRender = typeof children === "function" ? children(data2) : children;
	return /* @__PURE__ */ React.createElement(React.Fragment, null, toRender);
}
function createRoutesFromChildren(children, parentPath = []) {
	let routes = [];
	React.Children.forEach(children, (element, index) => {
		if (!React.isValidElement(element)) return;
		let treePath = [...parentPath, index];
		if (element.type === React.Fragment) {
			routes.push.apply(routes, createRoutesFromChildren(element.props.children, treePath));
			return;
		}
		invariant$1(element.type === Route$1, `[${typeof element.type === "string" ? element.type : element.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`);
		invariant$1(!element.props.index || !element.props.children, "An index route cannot have child routes.");
		let route = {
			id: element.props.id || treePath.join("-"),
			caseSensitive: element.props.caseSensitive,
			element: element.props.element,
			Component: element.props.Component,
			index: element.props.index,
			path: element.props.path,
			middleware: element.props.middleware,
			loader: element.props.loader,
			action: element.props.action,
			hydrateFallbackElement: element.props.hydrateFallbackElement,
			HydrateFallback: element.props.HydrateFallback,
			errorElement: element.props.errorElement,
			ErrorBoundary: element.props.ErrorBoundary,
			hasErrorBoundary: element.props.hasErrorBoundary === true || element.props.ErrorBoundary != null || element.props.errorElement != null,
			shouldRevalidate: element.props.shouldRevalidate,
			handle: element.props.handle,
			lazy: element.props.lazy
		};
		if (element.props.children) route.children = createRoutesFromChildren(element.props.children, treePath);
		routes.push(route);
	});
	return routes;
}
function renderMatches(matches) {
	return _renderMatches(matches);
}
function useRouteComponentProps() {
	return {
		params: useParams$1(),
		loaderData: useLoaderData(),
		actionData: useActionData(),
		matches: useMatches()
	};
}
function WithComponentProps({ children }) {
	const props = useRouteComponentProps();
	return React.cloneElement(children, props);
}
function withComponentProps(Component4) {
	return function WithComponentProps2() {
		const props = useRouteComponentProps();
		return React.createElement(Component4, props);
	};
}
function useHydrateFallbackProps() {
	return {
		params: useParams$1(),
		loaderData: useLoaderData(),
		actionData: useActionData()
	};
}
function WithHydrateFallbackProps({ children }) {
	const props = useHydrateFallbackProps();
	return React.cloneElement(children, props);
}
function withHydrateFallbackProps(HydrateFallback) {
	return function WithHydrateFallbackProps2() {
		const props = useHydrateFallbackProps();
		return React.createElement(HydrateFallback, props);
	};
}
function useErrorBoundaryProps() {
	return {
		params: useParams$1(),
		loaderData: useLoaderData(),
		actionData: useActionData(),
		error: useRouteError()
	};
}
function WithErrorBoundaryProps({ children }) {
	const props = useErrorBoundaryProps();
	return React.cloneElement(children, props);
}
function withErrorBoundaryProps(ErrorBoundary) {
	return function WithErrorBoundaryProps2() {
		const props = useErrorBoundaryProps();
		return React.createElement(ErrorBoundary, props);
	};
}
function isHtmlElement(object) {
	return typeof HTMLElement !== "undefined" && object instanceof HTMLElement;
}
function isButtonElement(object) {
	return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
function isFormElement(object) {
	return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
function isInputElement(object) {
	return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}
function isModifiedEvent(event) {
	return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
	return event.button === 0 && (!target || target === "_self") && !isModifiedEvent(event);
}
function createSearchParams(init = "") {
	return new URLSearchParams(typeof init === "string" || Array.isArray(init) || init instanceof URLSearchParams ? init : Object.keys(init).reduce((memo2, key) => {
		let value = init[key];
		return memo2.concat(Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]);
	}, []));
}
function getSearchParamsForLocation(locationSearch, defaultSearchParams) {
	let searchParams = createSearchParams(locationSearch);
	if (defaultSearchParams) defaultSearchParams.forEach((_, key) => {
		if (!searchParams.has(key)) defaultSearchParams.getAll(key).forEach((value) => {
			searchParams.append(key, value);
		});
	});
	return searchParams;
}
function isFormDataSubmitterSupported() {
	if (_formDataSupportsSubmitter === null) try {
		new FormData(document.createElement("form"), 0);
		_formDataSupportsSubmitter = false;
	} catch (e) {
		_formDataSupportsSubmitter = true;
	}
	return _formDataSupportsSubmitter;
}
function getFormEncType(encType) {
	if (encType != null && !supportedFormEncTypes.has(encType)) {
		warning(false, `"${encType}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${defaultEncType}"`);
		return null;
	}
	return encType;
}
function getFormSubmissionInfo(target, basename) {
	let method;
	let action;
	let encType;
	let formData;
	let body;
	if (isFormElement(target)) {
		let attr = target.getAttribute("action");
		action = attr ? stripBasename(attr, basename) : null;
		method = target.getAttribute("method") || defaultMethod;
		encType = getFormEncType(target.getAttribute("enctype")) || defaultEncType;
		formData = new FormData(target);
	} else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
		let form = target.form;
		if (form == null) throw new Error(`Cannot submit a <button> or <input type="submit"> without a <form>`);
		let attr = target.getAttribute("formaction") || form.getAttribute("action");
		action = attr ? stripBasename(attr, basename) : null;
		method = target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
		encType = getFormEncType(target.getAttribute("formenctype")) || getFormEncType(form.getAttribute("enctype")) || defaultEncType;
		formData = new FormData(form, target);
		if (!isFormDataSubmitterSupported()) {
			let { name, type, value } = target;
			if (type === "image") {
				let prefix = name ? `${name}.` : "";
				formData.append(`${prefix}x`, "0");
				formData.append(`${prefix}y`, "0");
			} else if (name) formData.append(name, value);
		}
	} else if (isHtmlElement(target)) throw new Error(`Cannot submit element that is not <form>, <button>, or <input type="submit|image">`);
	else {
		method = defaultMethod;
		action = null;
		encType = defaultEncType;
		body = target;
	}
	if (formData && encType === "text/plain") {
		body = formData;
		formData = void 0;
	}
	return {
		action,
		method: method.toLowerCase(),
		encType,
		formData,
		body
	};
}
function createLineSplittingTransform() {
	const decoder = new TextDecoder();
	let leftover = "";
	return new TransformStream({
		transform(chunk, controller) {
			const str = decoder.decode(chunk, { stream: true });
			const parts = (leftover + str).split("\n");
			leftover = parts.pop() || "";
			for (const part of parts) controller.enqueue(part);
		},
		flush(controller) {
			if (leftover) controller.enqueue(leftover);
		}
	});
}
async function flatten$1(input) {
	const { indices } = this;
	const existing = indices.get(input);
	if (existing) return [existing];
	if (input === void 0) return UNDEFINED;
	if (input === null) return NULL;
	if (Number.isNaN(input)) return NAN;
	if (input === Number.POSITIVE_INFINITY) return POSITIVE_INFINITY;
	if (input === Number.NEGATIVE_INFINITY) return NEGATIVE_INFINITY;
	if (input === 0 && 1 / input < 0) return NEGATIVE_ZERO;
	const index = this.index++;
	indices.set(input, index);
	const stack = [[input, index]];
	await stringify.call(this, stack);
	return index;
}
async function stringify(stack) {
	const { deferred, indices, plugins, postPlugins } = this;
	const str = this.stringified;
	let lastYieldTime = getNow();
	const flattenValue = (value) => {
		const existing = indices.get(value);
		if (existing) return [existing];
		if (value === void 0) return UNDEFINED;
		if (value === null) return NULL;
		if (Number.isNaN(value)) return NAN;
		if (value === Number.POSITIVE_INFINITY) return POSITIVE_INFINITY;
		if (value === Number.NEGATIVE_INFINITY) return NEGATIVE_INFINITY;
		if (value === 0 && 1 / value < 0) return NEGATIVE_ZERO;
		const index = this.index++;
		indices.set(value, index);
		stack.push([value, index]);
		return index;
	};
	let i = 0;
	while (stack.length > 0) {
		const now = getNow();
		if (++i % 6e3 === 0 && now - lastYieldTime >= TIME_LIMIT_MS) {
			await yieldToMain();
			lastYieldTime = getNow();
		}
		const [input, index] = stack.pop();
		const partsForObj = (obj) => Object.keys(obj).map((k) => `"_${flattenValue(k)}":${flattenValue(obj[k])}`).join(",");
		let error = null;
		switch (typeof input) {
			case "boolean":
			case "number":
			case "string":
				str[index] = JSON.stringify(input);
				break;
			case "bigint":
				str[index] = `["${TYPE_BIGINT}","${input}"]`;
				break;
			case "symbol": {
				const keyFor = Symbol.keyFor(input);
				if (!keyFor) error = /* @__PURE__ */ new Error("Cannot encode symbol unless created with Symbol.for()");
				else str[index] = `["${TYPE_SYMBOL}",${JSON.stringify(keyFor)}]`;
				break;
			}
			case "object": {
				if (!input) {
					str[index] = `${NULL}`;
					break;
				}
				const isArray = Array.isArray(input);
				let pluginHandled = false;
				if (!isArray && plugins) for (const plugin of plugins) {
					const pluginResult = plugin(input);
					if (Array.isArray(pluginResult)) {
						pluginHandled = true;
						const [pluginIdentifier, ...rest] = pluginResult;
						str[index] = `[${JSON.stringify(pluginIdentifier)}`;
						if (rest.length > 0) str[index] += `,${rest.map((v) => flattenValue(v)).join(",")}`;
						str[index] += "]";
						break;
					}
				}
				if (!pluginHandled) {
					let result = isArray ? "[" : "{";
					if (isArray) {
						for (let i2 = 0; i2 < input.length; i2++) result += (i2 ? "," : "") + (i2 in input ? flattenValue(input[i2]) : HOLE);
						str[index] = `${result}]`;
					} else if (input instanceof Date) {
						const dateTime = input.getTime();
						str[index] = `["${TYPE_DATE}",${Number.isNaN(dateTime) ? JSON.stringify("invalid") : dateTime}]`;
					} else if (input instanceof URL) str[index] = `["${TYPE_URL}",${JSON.stringify(input.href)}]`;
					else if (input instanceof RegExp) str[index] = `["${TYPE_REGEXP}",${JSON.stringify(input.source)},${JSON.stringify(input.flags)}]`;
					else if (input instanceof Set) {
						if (input.size > 0) str[index] = `["${TYPE_SET}",${[...input].map((val) => flattenValue(val)).join(",")}]`;
						else str[index] = `["${TYPE_SET}"]`;
					} else if (input instanceof Map) {
						if (input.size > 0) str[index] = `["${TYPE_MAP}",${[...input].flatMap(([k, v]) => [flattenValue(k), flattenValue(v)]).join(",")}]`;
						else str[index] = `["${TYPE_MAP}"]`;
					} else if (input instanceof Promise) {
						str[index] = `["${TYPE_PROMISE}",${index}]`;
						deferred[index] = input;
					} else if (input instanceof Error) {
						str[index] = `["${TYPE_ERROR}",${JSON.stringify(input.message)}`;
						if (input.name !== "Error") str[index] += `,${JSON.stringify(input.name)}`;
						str[index] += "]";
					} else if (Object.getPrototypeOf(input) === null) str[index] = `["${TYPE_NULL_OBJECT}",{${partsForObj(input)}}]`;
					else if (isPlainObject2(input)) str[index] = `{${partsForObj(input)}}`;
					else error = /* @__PURE__ */ new Error("Cannot encode object with prototype");
				}
				break;
			}
			default: {
				const isArray = Array.isArray(input);
				let pluginHandled = false;
				if (!isArray && plugins) for (const plugin of plugins) {
					const pluginResult = plugin(input);
					if (Array.isArray(pluginResult)) {
						pluginHandled = true;
						const [pluginIdentifier, ...rest] = pluginResult;
						str[index] = `[${JSON.stringify(pluginIdentifier)}`;
						if (rest.length > 0) str[index] += `,${rest.map((v) => flattenValue(v)).join(",")}`;
						str[index] += "]";
						break;
					}
				}
				if (!pluginHandled) error = /* @__PURE__ */ new Error("Cannot encode function or unexpected type");
			}
		}
		if (error) {
			let pluginHandled = false;
			if (postPlugins) for (const plugin of postPlugins) {
				const pluginResult = plugin(input);
				if (Array.isArray(pluginResult)) {
					pluginHandled = true;
					const [pluginIdentifier, ...rest] = pluginResult;
					str[index] = `[${JSON.stringify(pluginIdentifier)}`;
					if (rest.length > 0) str[index] += `,${rest.map((v) => flattenValue(v)).join(",")}`;
					str[index] += "]";
					break;
				}
			}
			if (!pluginHandled) throw error;
		}
	}
}
function isPlainObject2(thing) {
	const proto = Object.getPrototypeOf(thing);
	return proto === Object.prototype || proto === null || Object.getOwnPropertyNames(proto).sort().join("\0") === objectProtoNames2;
}
function unflatten(parsed) {
	const { hydrated, values } = this;
	if (typeof parsed === "number") return hydrate.call(this, parsed);
	if (!Array.isArray(parsed) || !parsed.length) throw new SyntaxError();
	const startIndex = values.length;
	for (const value of parsed) values.push(value);
	hydrated.length = values.length;
	return hydrate.call(this, startIndex);
}
function hydrate(index) {
	const { hydrated, values, deferred, plugins } = this;
	let result;
	const stack = [[index, (v) => {
		result = v;
	}]];
	let postRun = [];
	while (stack.length > 0) {
		const [index2, set] = stack.pop();
		switch (index2) {
			case UNDEFINED:
				set(void 0);
				continue;
			case NULL:
				set(null);
				continue;
			case NAN:
				set(NaN);
				continue;
			case POSITIVE_INFINITY:
				set(Infinity);
				continue;
			case NEGATIVE_INFINITY:
				set(-Infinity);
				continue;
			case NEGATIVE_ZERO:
				set(-0);
				continue;
		}
		if (hydrated[index2]) {
			set(hydrated[index2]);
			continue;
		}
		const value = values[index2];
		if (!value || typeof value !== "object") {
			hydrated[index2] = value;
			set(value);
			continue;
		}
		if (Array.isArray(value)) {
			if (typeof value[0] === "string") {
				const [type, b, c] = value;
				switch (type) {
					case TYPE_DATE:
						set(hydrated[index2] = new Date(b));
						continue;
					case TYPE_URL:
						set(hydrated[index2] = new URL(b));
						continue;
					case TYPE_BIGINT:
						set(hydrated[index2] = BigInt(b));
						continue;
					case TYPE_REGEXP:
						set(hydrated[index2] = new RegExp(b, c));
						continue;
					case TYPE_SYMBOL:
						set(hydrated[index2] = Symbol.for(b));
						continue;
					case TYPE_SET:
						const newSet = /* @__PURE__ */ new Set();
						hydrated[index2] = newSet;
						for (let i = value.length - 1; i > 0; i--) stack.push([value[i], (v) => {
							newSet.add(v);
						}]);
						set(newSet);
						continue;
					case TYPE_MAP:
						const map = /* @__PURE__ */ new Map();
						hydrated[index2] = map;
						for (let i = value.length - 2; i > 0; i -= 2) {
							const r = [];
							stack.push([value[i + 1], (v) => {
								r[1] = v;
							}]);
							stack.push([value[i], (k) => {
								r[0] = k;
							}]);
							postRun.push(() => {
								map.set(r[0], r[1]);
							});
						}
						set(map);
						continue;
					case TYPE_NULL_OBJECT:
						const obj = /* @__PURE__ */ Object.create(null);
						hydrated[index2] = obj;
						for (const key of Object.keys(b).reverse()) {
							const r = [];
							stack.push([b[key], (v) => {
								r[1] = v;
							}]);
							stack.push([Number(key.slice(1)), (k) => {
								r[0] = k;
							}]);
							postRun.push(() => {
								obj[r[0]] = r[1];
							});
						}
						set(obj);
						continue;
					case TYPE_PROMISE:
						if (hydrated[b]) set(hydrated[index2] = hydrated[b]);
						else {
							const d = new Deferred2();
							deferred[b] = d;
							set(hydrated[index2] = d.promise);
						}
						continue;
					case TYPE_ERROR:
						const [, message, errorType] = value;
						let error = errorType && globalObj && SUPPORTED_ERROR_TYPES.includes(errorType) && errorType in globalObj && typeof globalObj[errorType] === "function" ? new globalObj[errorType](message) : new Error(message);
						hydrated[index2] = error;
						set(error);
						continue;
					case TYPE_PREVIOUS_RESOLVED:
						set(hydrated[index2] = hydrated[b]);
						continue;
					default:
						if (Array.isArray(plugins)) {
							const r = [];
							const vals = value.slice(1);
							for (let i = 0; i < vals.length; i++) {
								const v = vals[i];
								stack.push([v, (v2) => {
									r[i] = v2;
								}]);
							}
							postRun.push(() => {
								for (const plugin of plugins) {
									const result2 = plugin(value[0], ...r);
									if (result2) {
										set(hydrated[index2] = result2.value);
										return;
									}
								}
								throw new SyntaxError();
							});
							continue;
						}
						throw new SyntaxError();
				}
			} else {
				const array = [];
				hydrated[index2] = array;
				for (let i = 0; i < value.length; i++) {
					const n = value[i];
					if (n !== HOLE) stack.push([n, (v) => {
						array[i] = v;
					}]);
				}
				set(array);
				continue;
			}
		} else {
			const object = {};
			hydrated[index2] = object;
			for (const key of Object.keys(value).reverse()) {
				const r = [];
				stack.push([value[key], (v) => {
					r[1] = v;
				}]);
				stack.push([Number(key.slice(1)), (k) => {
					r[0] = k;
				}]);
				postRun.push(() => {
					object[r[0]] = r[1];
				});
			}
			set(object);
			continue;
		}
	}
	while (postRun.length > 0) postRun.pop()();
	return result;
}
async function decode(readable, options) {
	const { plugins } = options ?? {};
	const done = new Deferred2();
	const reader = readable.pipeThrough(createLineSplittingTransform()).getReader();
	const decoder = {
		values: [],
		hydrated: [],
		deferred: {},
		plugins
	};
	const decoded = await decodeInitial.call(decoder, reader);
	let donePromise = done.promise;
	if (decoded.done) done.resolve();
	else donePromise = decodeDeferred.call(decoder, reader).then(done.resolve).catch((reason) => {
		for (const deferred of Object.values(decoder.deferred)) deferred.reject(reason);
		done.reject(reason);
	});
	return {
		done: donePromise.then(() => reader.closed),
		value: decoded.value
	};
}
async function decodeInitial(reader) {
	const read = await reader.read();
	if (!read.value) throw new SyntaxError();
	let line;
	try {
		line = JSON.parse(read.value);
	} catch (reason) {
		throw new SyntaxError();
	}
	return {
		done: read.done,
		value: unflatten.call(this, line)
	};
}
async function decodeDeferred(reader) {
	let read = await reader.read();
	while (!read.done) {
		if (!read.value) continue;
		const line = read.value;
		switch (line[0]) {
			case TYPE_PROMISE: {
				const colonIndex = line.indexOf(":");
				const deferredId = Number(line.slice(1, colonIndex));
				const deferred = this.deferred[deferredId];
				if (!deferred) throw new Error(`Deferred ID ${deferredId} not found in stream`);
				const lineData = line.slice(colonIndex + 1);
				let jsonLine;
				try {
					jsonLine = JSON.parse(lineData);
				} catch (reason) {
					throw new SyntaxError();
				}
				const value = unflatten.call(this, jsonLine);
				deferred.resolve(value);
				break;
			}
			case TYPE_ERROR: {
				const colonIndex = line.indexOf(":");
				const deferredId = Number(line.slice(1, colonIndex));
				const deferred = this.deferred[deferredId];
				if (!deferred) throw new Error(`Deferred ID ${deferredId} not found in stream`);
				const lineData = line.slice(colonIndex + 1);
				let jsonLine;
				try {
					jsonLine = JSON.parse(lineData);
				} catch (reason) {
					throw new SyntaxError();
				}
				const value = unflatten.call(this, jsonLine);
				deferred.reject(value);
				break;
			}
			default: throw new SyntaxError();
		}
		read = await reader.read();
	}
}
function encode(input, options) {
	const { onComplete, plugins, postPlugins, signal } = options ?? {};
	const encoder = {
		deferred: {},
		index: 0,
		indices: /* @__PURE__ */ new Map(),
		stringified: [],
		plugins,
		postPlugins,
		signal
	};
	const textEncoder = new TextEncoder();
	let lastSentIndex = 0;
	return new ReadableStream({ async start(controller) {
		const id = await flatten$1.call(encoder, input);
		if (Array.isArray(id)) throw new Error("This should never happen");
		if (id < 0) controller.enqueue(textEncoder.encode(`${id}
`));
		else {
			controller.enqueue(textEncoder.encode(`[${encoder.stringified.join(",")}]
`));
			lastSentIndex = encoder.stringified.length - 1;
		}
		const seenPromises = /* @__PURE__ */ new WeakSet();
		let processingChain = Promise.resolve();
		if (Object.keys(encoder.deferred).length) {
			let raceDone;
			const racePromise = new Promise((resolve, reject) => {
				raceDone = resolve;
				if (signal) {
					const rejectPromise = () => reject(signal.reason || /* @__PURE__ */ new Error("Signal was aborted."));
					if (signal.aborted) rejectPromise();
					else signal.addEventListener("abort", (event) => {
						rejectPromise();
					});
				}
			});
			while (Object.keys(encoder.deferred).length > 0) {
				for (const [deferredId, deferred] of Object.entries(encoder.deferred)) {
					if (seenPromises.has(deferred)) continue;
					seenPromises.add(encoder.deferred[Number(deferredId)] = Promise.race([racePromise, deferred]).then((resolved) => {
						processingChain = processingChain.then(async () => {
							const id2 = await flatten$1.call(encoder, resolved);
							if (Array.isArray(id2)) {
								controller.enqueue(textEncoder.encode(`${TYPE_PROMISE}${deferredId}:[["${TYPE_PREVIOUS_RESOLVED}",${id2[0]}]]
`));
								encoder.index++;
								lastSentIndex++;
							} else if (id2 < 0) controller.enqueue(textEncoder.encode(`${TYPE_PROMISE}${deferredId}:${id2}
`));
							else {
								const values = encoder.stringified.slice(lastSentIndex + 1).join(",");
								controller.enqueue(textEncoder.encode(`${TYPE_PROMISE}${deferredId}:[${values}]
`));
								lastSentIndex = encoder.stringified.length - 1;
							}
						});
						return processingChain;
					}, (reason) => {
						processingChain = processingChain.then(async () => {
							if (!reason || typeof reason !== "object" || !(reason instanceof Error)) reason = /* @__PURE__ */ new Error("An unknown error occurred");
							const id2 = await flatten$1.call(encoder, reason);
							if (Array.isArray(id2)) {
								controller.enqueue(textEncoder.encode(`${TYPE_ERROR}${deferredId}:[["${TYPE_PREVIOUS_RESOLVED}",${id2[0]}]]
`));
								encoder.index++;
								lastSentIndex++;
							} else if (id2 < 0) controller.enqueue(textEncoder.encode(`${TYPE_ERROR}${deferredId}:${id2}
`));
							else {
								const values = encoder.stringified.slice(lastSentIndex + 1).join(",");
								controller.enqueue(textEncoder.encode(`${TYPE_ERROR}${deferredId}:[${values}]
`));
								lastSentIndex = encoder.stringified.length - 1;
							}
						});
						return processingChain;
					}).finally(() => {
						delete encoder.deferred[Number(deferredId)];
					}));
				}
				await Promise.race(Object.values(encoder.deferred));
			}
			raceDone();
		}
		await Promise.all(Object.values(encoder.deferred));
		await processingChain;
		controller.close();
		onComplete?.();
	} });
}
async function createRequestInit(request) {
	let init = { signal: request.signal };
	if (request.method !== "GET") {
		init.method = request.method;
		let contentType = request.headers.get("Content-Type");
		if (contentType && /\bapplication\/json\b/.test(contentType)) {
			init.headers = { "Content-Type": contentType };
			init.body = JSON.stringify(await request.json());
		} else if (contentType && /\btext\/plain\b/.test(contentType)) {
			init.headers = { "Content-Type": contentType };
			init.body = await request.text();
		} else if (contentType && /\bapplication\/x-www-form-urlencoded\b/.test(contentType)) init.body = new URLSearchParams(await request.text());
		else init.body = await request.formData();
	}
	return init;
}
function escapeHtml(html) {
	return html.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]);
}
function escapeAttribute(value) {
	return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function invariant2(value, message) {
	if (value === false || value === null || typeof value === "undefined") throw new Error(message);
}
function StreamTransfer({ context, identifier, reader, textDecoder, nonce }) {
	if (!context.renderMeta || !context.renderMeta.didRenderScripts) return null;
	if (!context.renderMeta.streamCache) context.renderMeta.streamCache = {};
	let { streamCache } = context.renderMeta;
	let promise = streamCache[identifier];
	if (!promise) promise = streamCache[identifier] = reader.read().then((result) => {
		streamCache[identifier].result = {
			done: result.done,
			value: textDecoder.decode(result.value, { stream: true })
		};
	}).catch((e) => {
		streamCache[identifier].error = e;
	});
	if (promise.error) throw promise.error;
	if (promise.result === void 0) throw promise;
	let { done, value } = promise.result;
	let scriptTag = value ? /* @__PURE__ */ React.createElement("script", {
		nonce,
		dangerouslySetInnerHTML: { __html: `window.__reactRouterContext.streamController.enqueue(${escapeHtml(JSON.stringify(value))});` }
	}) : null;
	if (done) return /* @__PURE__ */ React.createElement(React.Fragment, null, scriptTag, /* @__PURE__ */ React.createElement("script", {
		nonce,
		dangerouslySetInnerHTML: { __html: `window.__reactRouterContext.streamController.close();` }
	}));
	else return /* @__PURE__ */ React.createElement(React.Fragment, null, scriptTag, /* @__PURE__ */ React.createElement(React.Suspense, null, /* @__PURE__ */ React.createElement(StreamTransfer, {
		context,
		identifier: identifier + 1,
		reader,
		textDecoder,
		nonce
	})));
}
function getTurboStreamSingleFetchDataStrategy(getRouter, manifest, routeModules, ssr, basename, trailingSlashAware) {
	let dataStrategy = getSingleFetchDataStrategyImpl(getRouter, (match) => {
		let manifestRoute = manifest.routes[match.route.id];
		invariant2(manifestRoute, "Route not found in manifest");
		return {
			hasLoader: manifestRoute.hasLoader,
			hasClientLoader: manifestRoute.hasClientLoader
		};
	}, fetchAndDecodeViaTurboStream, ssr, basename, trailingSlashAware);
	return async (args) => args.runClientMiddleware(dataStrategy);
}
function getSingleFetchDataStrategyImpl(getRouter, getRouteInfo, fetchAndDecode, ssr, basename, trailingSlashAware, shouldAllowOptOut = () => true) {
	return async (args) => {
		let { request, matches, fetcherKey } = args;
		let router = getRouter();
		if (request.method !== "GET") return singleFetchActionStrategy(args, fetchAndDecode, basename, trailingSlashAware);
		let foundRevalidatingServerLoader = matches.some((m) => {
			let { hasLoader, hasClientLoader } = getRouteInfo(m);
			return m.shouldCallHandler() && hasLoader && !hasClientLoader;
		});
		if (!ssr && !foundRevalidatingServerLoader) return nonSsrStrategy(args, getRouteInfo, fetchAndDecode, basename, trailingSlashAware);
		if (fetcherKey) return singleFetchLoaderFetcherStrategy(args, fetchAndDecode, basename, trailingSlashAware);
		return singleFetchLoaderNavigationStrategy(args, router, getRouteInfo, fetchAndDecode, ssr, basename, trailingSlashAware, shouldAllowOptOut);
	};
}
async function singleFetchActionStrategy(args, fetchAndDecode, basename, trailingSlashAware) {
	let actionMatch = args.matches.find((m) => m.shouldCallHandler());
	invariant2(actionMatch, "No action match found");
	let actionStatus = void 0;
	let result = await actionMatch.resolve(async (handler) => {
		return await handler(async () => {
			let { data: data2, status } = await fetchAndDecode(args, basename, trailingSlashAware, [actionMatch.route.id]);
			actionStatus = status;
			return unwrapSingleFetchResult(data2, actionMatch.route.id);
		});
	});
	if (isResponse(result.result) || isRouteErrorResponse(result.result) || isDataWithResponseInit(result.result)) return { [actionMatch.route.id]: result };
	return { [actionMatch.route.id]: {
		type: result.type,
		result: data(result.result, actionStatus)
	} };
}
async function nonSsrStrategy(args, getRouteInfo, fetchAndDecode, basename, trailingSlashAware) {
	let matchesToLoad = args.matches.filter((m) => m.shouldCallHandler());
	let results = {};
	await Promise.all(matchesToLoad.map((m) => m.resolve(async (handler) => {
		try {
			let { hasClientLoader } = getRouteInfo(m);
			let routeId = m.route.id;
			let result = hasClientLoader ? await handler(async () => {
				let { data: data2 } = await fetchAndDecode(args, basename, trailingSlashAware, [routeId]);
				return unwrapSingleFetchResult(data2, routeId);
			}) : await handler();
			results[m.route.id] = {
				type: "data",
				result
			};
		} catch (e) {
			results[m.route.id] = {
				type: "error",
				result: e
			};
		}
	})));
	return results;
}
async function singleFetchLoaderNavigationStrategy(args, router, getRouteInfo, fetchAndDecode, ssr, basename, trailingSlashAware, shouldAllowOptOut = () => true) {
	let routesParams = /* @__PURE__ */ new Set();
	let foundOptOutRoute = false;
	let routeDfds = args.matches.map(() => createDeferred2());
	let singleFetchDfd = createDeferred2();
	let results = {};
	let resolvePromise = Promise.all(args.matches.map(async (m, i) => m.resolve(async (handler) => {
		routeDfds[i].resolve();
		let routeId = m.route.id;
		let { hasLoader, hasClientLoader } = getRouteInfo(m);
		let defaultShouldRevalidate = !m.shouldRevalidateArgs || m.shouldRevalidateArgs.actionStatus == null || m.shouldRevalidateArgs.actionStatus < 400;
		if (!m.shouldCallHandler(defaultShouldRevalidate)) {
			foundOptOutRoute || (foundOptOutRoute = m.shouldRevalidateArgs != null && hasLoader);
			return;
		}
		if (shouldAllowOptOut(m) && hasClientLoader) {
			if (hasLoader) foundOptOutRoute = true;
			try {
				let result = await handler(async () => {
					let { data: data2 } = await fetchAndDecode(args, basename, trailingSlashAware, [routeId]);
					return unwrapSingleFetchResult(data2, routeId);
				});
				results[routeId] = {
					type: "data",
					result
				};
			} catch (e) {
				results[routeId] = {
					type: "error",
					result: e
				};
			}
			return;
		}
		if (hasLoader) routesParams.add(routeId);
		try {
			let result = await handler(async () => {
				return unwrapSingleFetchResult(await singleFetchDfd.promise, routeId);
			});
			results[routeId] = {
				type: "data",
				result
			};
		} catch (e) {
			results[routeId] = {
				type: "error",
				result: e
			};
		}
	})));
	await Promise.all(routeDfds.map((d) => d.promise));
	if ((!router.state.initialized && router.state.navigation.state === "idle" || routesParams.size === 0) && !window.__reactRouterHdrActive) singleFetchDfd.resolve({ routes: {} });
	else {
		let targetRoutes = ssr && foundOptOutRoute && routesParams.size > 0 ? [...routesParams.keys()] : void 0;
		try {
			let data2 = await fetchAndDecode(args, basename, trailingSlashAware, targetRoutes);
			singleFetchDfd.resolve(data2.data);
		} catch (e) {
			singleFetchDfd.reject(e);
		}
	}
	await resolvePromise;
	await bubbleMiddlewareErrors(singleFetchDfd.promise, args.matches, routesParams, results);
	return results;
}
async function bubbleMiddlewareErrors(singleFetchPromise, matches, routesParams, results) {
	try {
		let middlewareError;
		let fetchedData = await singleFetchPromise;
		if ("routes" in fetchedData) {
			for (let match of matches) if (match.route.id in fetchedData.routes) {
				let routeResult = fetchedData.routes[match.route.id];
				if ("error" in routeResult) {
					middlewareError = routeResult.error;
					if (results[match.route.id]?.result == null) results[match.route.id] = {
						type: "error",
						result: middlewareError
					};
					break;
				}
			}
		}
		if (middlewareError !== void 0) Array.from(routesParams.values()).forEach((routeId) => {
			if (results[routeId].result instanceof SingleFetchNoResultError) results[routeId].result = middlewareError;
		});
	} catch (e) {}
}
async function singleFetchLoaderFetcherStrategy(args, fetchAndDecode, basename, trailingSlashAware) {
	let fetcherMatch = args.matches.find((m) => m.shouldCallHandler());
	invariant2(fetcherMatch, "No fetcher match found");
	let routeId = fetcherMatch.route.id;
	let result = await fetcherMatch.resolve(async (handler) => handler(async () => {
		let { data: data2 } = await fetchAndDecode(args, basename, trailingSlashAware, [routeId]);
		return unwrapSingleFetchResult(data2, routeId);
	}));
	return { [fetcherMatch.route.id]: result };
}
function stripIndexParam$1(url) {
	let indexValues = url.searchParams.getAll("index");
	url.searchParams.delete("index");
	let indexValuesToKeep = [];
	for (let indexValue of indexValues) if (indexValue) indexValuesToKeep.push(indexValue);
	for (let toKeep of indexValuesToKeep) url.searchParams.append("index", toKeep);
	return url;
}
function singleFetchUrl(reqUrl, basename, trailingSlashAware, extension) {
	let url = typeof reqUrl === "string" ? new URL(reqUrl, typeof window === "undefined" ? "server://singlefetch/" : window.location.origin) : reqUrl;
	if (trailingSlashAware) {
		if (url.pathname.endsWith("/")) url.pathname = `${url.pathname}_.${extension}`;
		else url.pathname = `${url.pathname}.${extension}`;
	} else if (url.pathname === "/") url.pathname = `_root.${extension}`;
	else if (basename && stripBasename(url.pathname, basename) === "/") url.pathname = `${removeTrailingSlash(basename)}/_root.${extension}`;
	else url.pathname = `${removeTrailingSlash(url.pathname)}.${extension}`;
	return url;
}
async function fetchAndDecodeViaTurboStream(args, basename, trailingSlashAware, targetRoutes) {
	let { request } = args;
	let url = singleFetchUrl(request.url, basename, trailingSlashAware, "data");
	if (request.method === "GET") {
		url = stripIndexParam$1(url);
		if (targetRoutes) url.searchParams.set("_routes", targetRoutes.join(","));
	}
	let res = await fetch(url, await createRequestInit(request));
	if (res.status >= 400 && !res.headers.has("X-Remix-Response")) throw new ErrorResponseImpl(res.status, res.statusText, await res.text());
	if (res.status === 204 && res.headers.has("X-Remix-Redirect")) return {
		status: 202,
		data: { redirect: {
			redirect: res.headers.get("X-Remix-Redirect"),
			status: Number(res.headers.get("X-Remix-Status") || "302"),
			revalidate: res.headers.get("X-Remix-Revalidate") === "true",
			reload: res.headers.get("X-Remix-Reload-Document") === "true",
			replace: res.headers.get("X-Remix-Replace") === "true"
		} }
	};
	if (NO_BODY_STATUS_CODES.has(res.status)) {
		let routes = {};
		if (targetRoutes && request.method !== "GET") routes[targetRoutes[0]] = { data: void 0 };
		return {
			status: res.status,
			data: { routes }
		};
	}
	invariant2(res.body, "No response body to decode");
	try {
		let decoded = await decodeViaTurboStream(res.body, window);
		let data2;
		if (request.method === "GET") {
			let typed = decoded.value;
			if (SingleFetchRedirectSymbol in typed) data2 = { redirect: typed[SingleFetchRedirectSymbol] };
			else data2 = { routes: typed };
		} else {
			let typed = decoded.value;
			let routeId = targetRoutes?.[0];
			invariant2(routeId, "No routeId found for single fetch call decoding");
			if ("redirect" in typed) data2 = { redirect: typed };
			else data2 = { routes: { [routeId]: typed } };
		}
		return {
			status: res.status,
			data: data2
		};
	} catch (e) {
		throw new Error("Unable to decode turbo-stream response");
	}
}
function decodeViaTurboStream(body, global) {
	return decode(body, { plugins: [(type, ...rest) => {
		if (type === "SanitizedError") {
			let [name, message, stack] = rest;
			let Constructor = Error;
			if (name && SUPPORTED_ERROR_TYPES.includes(name) && name in global && typeof global[name] === "function") Constructor = global[name];
			let error = new Constructor(message);
			error.stack = stack;
			return { value: error };
		}
		if (type === "ErrorResponse") {
			let [data2, status, statusText] = rest;
			return { value: new ErrorResponseImpl(status, statusText, data2) };
		}
		if (type === "SingleFetchRedirect") return { value: { [SingleFetchRedirectSymbol]: rest[0] } };
		if (type === "SingleFetchClassInstance") return { value: rest[0] };
		if (type === "SingleFetchFallback") return { value: void 0 };
	}] });
}
function unwrapSingleFetchResult(result, routeId) {
	if ("redirect" in result) {
		let { redirect: location, revalidate, reload, replace: replace2, status } = result.redirect;
		throw redirect(location, {
			status,
			headers: {
				...revalidate ? { "X-Remix-Revalidate": "yes" } : null,
				...reload ? { "X-Remix-Reload-Document": "yes" } : null,
				...replace2 ? { "X-Remix-Replace": "yes" } : null
			}
		});
	}
	let routeResult = result.routes[routeId];
	if (routeResult == null) throw new SingleFetchNoResultError(`No result found for routeId "${routeId}"`);
	else if ("error" in routeResult) throw routeResult.error;
	else if ("data" in routeResult) return routeResult.data;
	else throw new Error(`Invalid response found for routeId "${routeId}"`);
}
function createDeferred2() {
	let resolve;
	let reject;
	let promise = new Promise((res, rej) => {
		resolve = async (val) => {
			res(val);
			try {
				await promise;
			} catch (e) {}
		};
		reject = async (error) => {
			rej(error);
			try {
				await promise;
			} catch (e) {}
		};
	});
	return {
		promise,
		resolve,
		reject
	};
}
async function loadRouteModule(route, routeModulesCache) {
	if (route.id in routeModulesCache) return routeModulesCache[route.id];
	try {
		let routeModule = await import(
			/* @vite-ignore */
			/* webpackIgnore: true */
			route.module
);
		routeModulesCache[route.id] = routeModule;
		return routeModule;
	} catch (error) {
		console.error(`Error loading route module \`${route.module}\`, reloading page...`);
		console.error(error);
		if (window.__reactRouterContext && window.__reactRouterContext.isSpaMode && void 0);
		window.location.reload();
		return new Promise(() => {});
	}
}
function getKeyedLinksForMatches(matches, routeModules, manifest) {
	return dedupeLinkDescriptors(matches.map((match) => {
		let module = routeModules[match.route.id];
		let route = manifest.routes[match.route.id];
		return [route && route.css ? route.css.map((href) => ({
			rel: "stylesheet",
			href
		})) : [], module?.links?.() || []];
	}).flat(2), getModuleLinkHrefs(matches, manifest));
}
function getRouteCssDescriptors(route) {
	if (!route.css) return [];
	return route.css.map((href) => ({
		rel: "stylesheet",
		href
	}));
}
async function prefetchRouteCss(route) {
	if (!route.css) return;
	let descriptors = getRouteCssDescriptors(route);
	await Promise.all(descriptors.map(prefetchStyleLink));
}
async function prefetchStyleLinks(route, routeModule) {
	if (!route.css && !routeModule.links || !isPreloadSupported()) return;
	let descriptors = [];
	if (route.css) descriptors.push(...getRouteCssDescriptors(route));
	if (routeModule.links) descriptors.push(...routeModule.links());
	if (descriptors.length === 0) return;
	let styleLinks = [];
	for (let descriptor of descriptors) if (!isPageLinkDescriptor(descriptor) && descriptor.rel === "stylesheet") styleLinks.push({
		...descriptor,
		rel: "preload",
		as: "style"
	});
	await Promise.all(styleLinks.map(prefetchStyleLink));
}
async function prefetchStyleLink(descriptor) {
	return new Promise((resolve) => {
		if (descriptor.media && !window.matchMedia(descriptor.media).matches || document.querySelector(`link[rel="stylesheet"][href="${descriptor.href}"]`)) return resolve();
		let link = document.createElement("link");
		Object.assign(link, descriptor);
		function removeLink() {
			if (document.head.contains(link)) document.head.removeChild(link);
		}
		link.onload = () => {
			removeLink();
			resolve();
		};
		link.onerror = () => {
			removeLink();
			resolve();
		};
		document.head.appendChild(link);
	});
}
function isPageLinkDescriptor(object) {
	return object != null && typeof object.page === "string";
}
function isHtmlLinkDescriptor(object) {
	if (object == null) return false;
	if (object.href == null) return object.rel === "preload" && typeof object.imageSrcSet === "string" && typeof object.imageSizes === "string";
	return typeof object.rel === "string" && typeof object.href === "string";
}
async function getKeyedPrefetchLinks(matches, manifest, routeModules) {
	return dedupeLinkDescriptors((await Promise.all(matches.map(async (match) => {
		let route = manifest.routes[match.route.id];
		if (route) {
			let mod = await loadRouteModule(route, routeModules);
			return mod.links ? mod.links() : [];
		}
		return [];
	}))).flat(1).filter(isHtmlLinkDescriptor).filter((link) => link.rel === "stylesheet" || link.rel === "preload").map((link) => link.rel === "stylesheet" ? {
		...link,
		rel: "prefetch",
		as: "style"
	} : {
		...link,
		rel: "prefetch"
	}));
}
function getNewMatchesForLinks(page, nextMatches, currentMatches, manifest, location, mode) {
	let isNew = (match, index) => {
		if (!currentMatches[index]) return true;
		return match.route.id !== currentMatches[index].route.id;
	};
	let matchPathChanged = (match, index) => {
		return currentMatches[index].pathname !== match.pathname || currentMatches[index].route.path?.endsWith("*") && currentMatches[index].params["*"] !== match.params["*"];
	};
	if (mode === "assets") return nextMatches.filter((match, index) => isNew(match, index) || matchPathChanged(match, index));
	if (mode === "data") return nextMatches.filter((match, index) => {
		let manifestRoute = manifest.routes[match.route.id];
		if (!manifestRoute || !manifestRoute.hasLoader) return false;
		if (isNew(match, index) || matchPathChanged(match, index)) return true;
		if (match.route.shouldRevalidate) {
			let routeChoice = match.route.shouldRevalidate({
				currentUrl: new URL(location.pathname + location.search + location.hash, window.origin),
				currentParams: currentMatches[0]?.params || {},
				nextUrl: new URL(page, window.origin),
				nextParams: match.params,
				defaultShouldRevalidate: true
			});
			if (typeof routeChoice === "boolean") return routeChoice;
		}
		return true;
	});
	return [];
}
function getModuleLinkHrefs(matches, manifest, { includeHydrateFallback } = {}) {
	return dedupeHrefs(matches.map((match) => {
		let route = manifest.routes[match.route.id];
		if (!route) return [];
		let hrefs = [route.module];
		if (route.clientActionModule) hrefs = hrefs.concat(route.clientActionModule);
		if (route.clientLoaderModule) hrefs = hrefs.concat(route.clientLoaderModule);
		if (includeHydrateFallback && route.hydrateFallbackModule) hrefs = hrefs.concat(route.hydrateFallbackModule);
		if (route.imports) hrefs = hrefs.concat(route.imports);
		return hrefs;
	}).flat(1));
}
function dedupeHrefs(hrefs) {
	return [...new Set(hrefs)];
}
function sortKeys(obj) {
	let sorted = {};
	let keys = Object.keys(obj).sort();
	for (let key of keys) sorted[key] = obj[key];
	return sorted;
}
function dedupeLinkDescriptors(descriptors, preloads) {
	let set = /* @__PURE__ */ new Set();
	let preloadsSet = new Set(preloads);
	return descriptors.reduce((deduped, descriptor) => {
		if (preloads && !isPageLinkDescriptor(descriptor) && descriptor.as === "script" && descriptor.href && preloadsSet.has(descriptor.href)) return deduped;
		let key = JSON.stringify(sortKeys(descriptor));
		if (!set.has(key)) {
			set.add(key);
			deduped.push({
				key,
				link: descriptor
			});
		}
		return deduped;
	}, []);
}
function isPreloadSupported() {
	if (_isPreloadSupported !== void 0) return _isPreloadSupported;
	let el = document.createElement("link");
	_isPreloadSupported = el.relList.supports("preload");
	el = null;
	return _isPreloadSupported;
}
function RemixRootDefaultHydrateFallback() {
	let { nonce } = useFrameworkContext();
	return /* @__PURE__ */ React.createElement(BoundaryShell, {
		title: "Loading...",
		renderScripts: true
	}, /* @__PURE__ */ React.createElement("script", {
		nonce,
		dangerouslySetInnerHTML: { __html: `
              console.log(
                "\u{1F4BF} Hey developer \u{1F44B}. You can provide a way better UX than this " +
                "when your app is loading JS modules and/or running \`clientLoader\` " +
                "functions. Check out https://reactrouter.com/start/framework/route-module#hydratefallback " +
                "for more information."
              );
            ` }
	}));
}
function groupRoutesByParentId$1(manifest) {
	let routes = {};
	Object.values(manifest).forEach((route) => {
		if (route) {
			let parentId = route.parentId || "";
			if (!routes[parentId]) routes[parentId] = [];
			routes[parentId].push(route);
		}
	});
	return routes;
}
function getRouteComponents(route, routeModule, isSpaMode) {
	let Component4 = getRouteModuleComponent(routeModule);
	let HydrateFallback = routeModule.HydrateFallback && (!isSpaMode || route.id === "root") ? routeModule.HydrateFallback : route.id === "root" ? RemixRootDefaultHydrateFallback : void 0;
	let ErrorBoundary = routeModule.ErrorBoundary ? routeModule.ErrorBoundary : route.id === "root" ? () => /* @__PURE__ */ React.createElement(RemixRootDefaultErrorBoundary, { error: useRouteError() }) : void 0;
	if (route.id === "root" && routeModule.Layout) return {
		...Component4 ? { element: /* @__PURE__ */ React.createElement(routeModule.Layout, null, /* @__PURE__ */ React.createElement(Component4, null)) } : { Component: Component4 },
		...ErrorBoundary ? { errorElement: /* @__PURE__ */ React.createElement(routeModule.Layout, null, /* @__PURE__ */ React.createElement(ErrorBoundary, null)) } : { ErrorBoundary },
		...HydrateFallback ? { hydrateFallbackElement: /* @__PURE__ */ React.createElement(routeModule.Layout, null, /* @__PURE__ */ React.createElement(HydrateFallback, null)) } : { HydrateFallback }
	};
	return {
		Component: Component4,
		ErrorBoundary,
		HydrateFallback
	};
}
function createServerRoutes(manifest, routeModules, future, isSpaMode, parentId = "", routesByParentId = groupRoutesByParentId$1(manifest), spaModeLazyPromise = Promise.resolve({ Component: () => null })) {
	return (routesByParentId[parentId] || []).map((route) => {
		let routeModule = routeModules[route.id];
		invariant2(routeModule, "No `routeModule` available to create server routes");
		let dataRoute = {
			...getRouteComponents(route, routeModule, isSpaMode),
			caseSensitive: route.caseSensitive,
			id: route.id,
			index: route.index,
			path: route.path,
			handle: routeModule.handle,
			lazy: isSpaMode ? () => spaModeLazyPromise : void 0,
			loader: route.hasLoader || route.hasClientLoader ? () => null : void 0
		};
		let children = createServerRoutes(manifest, routeModules, future, isSpaMode, route.id, routesByParentId, spaModeLazyPromise);
		if (children.length > 0) dataRoute.children = children;
		return dataRoute;
	});
}
function createClientRoutesWithHMRRevalidationOptOut(needsRevalidation, manifest, routeModulesCache, initialState, ssr, isSpaMode) {
	return createClientRoutes(manifest, routeModulesCache, initialState, ssr, isSpaMode, "", groupRoutesByParentId$1(manifest), needsRevalidation);
}
function preventInvalidServerHandlerCall$1(type, route) {
	if (type === "loader" && !route.hasLoader || type === "action" && !route.hasAction) {
		let msg = `You are trying to call ${type === "action" ? "serverAction()" : "serverLoader()"} on a route that does not have a server ${type} (routeId: "${route.id}")`;
		console.error(msg);
		throw new ErrorResponseImpl(400, "Bad Request", new Error(msg), true);
	}
}
function noActionDefinedError(type, routeId) {
	let article = type === "clientAction" ? "a" : "an";
	let msg = `Route "${routeId}" does not have ${article} ${type}, but you are trying to submit to it. To fix this, please add ${article} \`${type}\` function to the route`;
	console.error(msg);
	throw new ErrorResponseImpl(405, "Method Not Allowed", new Error(msg), true);
}
function createClientRoutes(manifest, routeModulesCache, initialState, ssr, isSpaMode, parentId = "", routesByParentId = groupRoutesByParentId$1(manifest), needsRevalidation) {
	return (routesByParentId[parentId] || []).map((route) => {
		let routeModule = routeModulesCache[route.id];
		function fetchServerHandler(singleFetch) {
			invariant2(typeof singleFetch === "function", "No single fetch function available for route handler");
			return singleFetch();
		}
		function fetchServerLoader(singleFetch) {
			if (!route.hasLoader) return Promise.resolve(null);
			return fetchServerHandler(singleFetch);
		}
		function fetchServerAction(singleFetch) {
			if (!route.hasAction) throw noActionDefinedError("action", route.id);
			return fetchServerHandler(singleFetch);
		}
		function prefetchModule(modulePath) {
			import(
				/* @vite-ignore */
				/* webpackIgnore: true */
				modulePath
);
		}
		function prefetchRouteModuleChunks(route2) {
			if (route2.clientActionModule) prefetchModule(route2.clientActionModule);
			if (route2.clientLoaderModule) prefetchModule(route2.clientLoaderModule);
		}
		async function prefetchStylesAndCallHandler(handler) {
			let cachedModule = routeModulesCache[route.id];
			let linkPrefetchPromise = cachedModule ? prefetchStyleLinks(route, cachedModule) : Promise.resolve();
			try {
				return handler();
			} finally {
				await linkPrefetchPromise;
			}
		}
		let dataRoute = {
			id: route.id,
			index: route.index,
			path: route.path
		};
		if (routeModule) {
			Object.assign(dataRoute, {
				...dataRoute,
				...getRouteComponents(route, routeModule, isSpaMode),
				middleware: routeModule.clientMiddleware,
				handle: routeModule.handle,
				shouldRevalidate: getShouldRevalidateFunction(dataRoute.path, routeModule, route, ssr, needsRevalidation)
			});
			let hasInitialData = initialState && initialState.loaderData && route.id in initialState.loaderData;
			let initialData = hasInitialData ? initialState?.loaderData?.[route.id] : void 0;
			let hasInitialError = initialState && initialState.errors && route.id in initialState.errors;
			let initialError = hasInitialError ? initialState?.errors?.[route.id] : void 0;
			let isHydrationRequest = needsRevalidation == null && (routeModule.clientLoader?.hydrate === true || !route.hasLoader);
			dataRoute.loader = async ({ request, params, context, pattern, url }, singleFetch) => {
				let _isHydrationRequest = isHydrationRequest;
				isHydrationRequest = false;
				return await prefetchStylesAndCallHandler(async () => {
					invariant2(routeModule, "No `routeModule` available for critical-route loader");
					if (!routeModule.clientLoader) return fetchServerLoader(singleFetch);
					return routeModule.clientLoader({
						request,
						params,
						context,
						pattern,
						url,
						async serverLoader() {
							preventInvalidServerHandlerCall$1("loader", route);
							if (_isHydrationRequest) {
								if (hasInitialData) return initialData;
								if (hasInitialError) throw initialError;
							}
							return fetchServerLoader(singleFetch);
						}
					});
				});
			};
			dataRoute.loader.hydrate = shouldHydrateRouteLoader(route.id, routeModule.clientLoader, route.hasLoader, isSpaMode);
			dataRoute.action = ({ request, params, context, pattern, url }, singleFetch) => {
				return prefetchStylesAndCallHandler(async () => {
					invariant2(routeModule, "No `routeModule` available for critical-route action");
					if (!routeModule.clientAction) {
						if (isSpaMode) throw noActionDefinedError("clientAction", route.id);
						return fetchServerAction(singleFetch);
					}
					return routeModule.clientAction({
						request,
						params,
						context,
						pattern,
						url,
						async serverAction() {
							preventInvalidServerHandlerCall$1("action", route);
							return fetchServerAction(singleFetch);
						}
					});
				});
			};
		} else {
			if (!route.hasClientLoader) dataRoute.loader = (_, singleFetch) => prefetchStylesAndCallHandler(() => {
				return fetchServerLoader(singleFetch);
			});
			if (!route.hasClientAction) dataRoute.action = (_, singleFetch) => prefetchStylesAndCallHandler(() => {
				if (isSpaMode) throw noActionDefinedError("clientAction", route.id);
				return fetchServerAction(singleFetch);
			});
			let lazyRoutePromise;
			async function getLazyRoute() {
				if (lazyRoutePromise) return await lazyRoutePromise;
				lazyRoutePromise = (async () => {
					if (route.clientLoaderModule || route.clientActionModule) await new Promise((resolve) => setTimeout(resolve, 0));
					let routeModulePromise = loadRouteModuleWithBlockingLinks(route, routeModulesCache);
					prefetchRouteModuleChunks(route);
					return await routeModulePromise;
				})();
				return await lazyRoutePromise;
			}
			dataRoute.lazy = {
				loader: route.hasClientLoader ? async () => {
					let { clientLoader } = route.clientLoaderModule ? await import(
						/* @vite-ignore */
						/* webpackIgnore: true */
						route.clientLoaderModule
) : await getLazyRoute();
					invariant2(clientLoader, "No `clientLoader` export found");
					return (args, singleFetch) => clientLoader({
						...args,
						async serverLoader() {
							preventInvalidServerHandlerCall$1("loader", route);
							return fetchServerLoader(singleFetch);
						}
					});
				} : void 0,
				action: route.hasClientAction ? async () => {
					let clientActionPromise = route.clientActionModule ? import(
						/* @vite-ignore */
						/* webpackIgnore: true */
						route.clientActionModule
) : getLazyRoute();
					prefetchRouteModuleChunks(route);
					let { clientAction } = await clientActionPromise;
					invariant2(clientAction, "No `clientAction` export found");
					return (args, singleFetch) => clientAction({
						...args,
						async serverAction() {
							preventInvalidServerHandlerCall$1("action", route);
							return fetchServerAction(singleFetch);
						}
					});
				} : void 0,
				middleware: route.hasClientMiddleware ? async () => {
					let { clientMiddleware } = route.clientMiddlewareModule ? await import(
						/* @vite-ignore */
						/* webpackIgnore: true */
						route.clientMiddlewareModule
) : await getLazyRoute();
					invariant2(clientMiddleware, "No `clientMiddleware` export found");
					return clientMiddleware;
				} : void 0,
				shouldRevalidate: async () => {
					let lazyRoute = await getLazyRoute();
					return getShouldRevalidateFunction(dataRoute.path, lazyRoute, route, ssr, needsRevalidation);
				},
				handle: async () => (await getLazyRoute()).handle,
				Component: async () => (await getLazyRoute()).Component,
				ErrorBoundary: route.hasErrorBoundary ? async () => (await getLazyRoute()).ErrorBoundary : void 0
			};
		}
		let children = createClientRoutes(manifest, routeModulesCache, initialState, ssr, isSpaMode, route.id, routesByParentId, needsRevalidation);
		if (children.length > 0) dataRoute.children = children;
		return dataRoute;
	});
}
function getShouldRevalidateFunction(path, route, manifestRoute, ssr, needsRevalidation) {
	if (needsRevalidation) return wrapShouldRevalidateForHdr(manifestRoute.id, route.shouldRevalidate, needsRevalidation);
	if (!ssr && manifestRoute.hasLoader && !manifestRoute.hasClientLoader) {
		let myParams = path ? compilePath(path)[1].map((p) => p.paramName) : [];
		const didParamsChange = (opts) => myParams.some((p) => opts.currentParams[p] !== opts.nextParams[p]);
		if (route.shouldRevalidate) {
			let fn = route.shouldRevalidate;
			return (opts) => fn({
				...opts,
				defaultShouldRevalidate: didParamsChange(opts)
			});
		} else return (opts) => didParamsChange(opts);
	}
	return route.shouldRevalidate;
}
function wrapShouldRevalidateForHdr(routeId, routeShouldRevalidate, needsRevalidation) {
	let handledRevalidation = false;
	return (arg) => {
		if (!handledRevalidation) {
			handledRevalidation = true;
			return needsRevalidation.has(routeId);
		}
		return routeShouldRevalidate ? routeShouldRevalidate(arg) : arg.defaultShouldRevalidate;
	};
}
async function loadRouteModuleWithBlockingLinks(route, routeModules) {
	let routeModulePromise = loadRouteModule(route, routeModules);
	let prefetchRouteCssPromise = prefetchRouteCss(route);
	let routeModule = await routeModulePromise;
	await Promise.all([prefetchRouteCssPromise, prefetchStyleLinks(route, routeModule)]);
	return {
		Component: getRouteModuleComponent(routeModule),
		ErrorBoundary: routeModule.ErrorBoundary,
		clientMiddleware: routeModule.clientMiddleware,
		clientAction: routeModule.clientAction,
		clientLoader: routeModule.clientLoader,
		handle: routeModule.handle,
		links: routeModule.links,
		meta: routeModule.meta,
		shouldRevalidate: routeModule.shouldRevalidate
	};
}
function getRouteModuleComponent(routeModule) {
	if (routeModule.default == null) return void 0;
	if (!(typeof routeModule.default === "object" && Object.keys(routeModule.default).length === 0)) return routeModule.default;
}
function shouldHydrateRouteLoader(routeId, clientLoader, hasLoader, isSpaMode) {
	return isSpaMode && routeId !== "root" || clientLoader != null && (clientLoader.hydrate === true || hasLoader !== true);
}
function getPathsWithAncestors(paths) {
	let result = /* @__PURE__ */ new Set();
	paths.forEach((path) => {
		if (!path.startsWith("/")) path = `/${path}`;
		for (let i = 1; i < path.length; i++) if (path[i] === "/") result.add(path.slice(0, i));
		result.add(path);
	});
	return Array.from(result);
}
function isFogOfWarEnabled(routeDiscovery, ssr) {
	return routeDiscovery.mode === "lazy" && ssr === true;
}
function getPartialManifest({ sri, ...manifest }, router) {
	let routeIds = new Set(router.state.matches.map((m) => m.route.id));
	let segments = router.state.location.pathname.split("/").filter(Boolean);
	let paths = ["/"];
	segments.pop();
	while (segments.length > 0) {
		paths.push(`/${segments.join("/")}`);
		segments.pop();
	}
	paths.forEach((path) => {
		let matches = matchRoutesImpl(router.routes, path, router.basename || "/", false, router.branches);
		if (matches) matches.forEach((m) => routeIds.add(m.route.id));
	});
	let initialRoutes = [...routeIds].reduce((acc, id) => Object.assign(acc, { [id]: manifest.routes[id] }), {});
	return {
		...manifest,
		routes: initialRoutes,
		sri: sri ? true : void 0
	};
}
function getPatchRoutesOnNavigationFunction(getRouter, manifest, routeModules, ssr, routeDiscovery, isSpaMode, basename) {
	if (!isFogOfWarEnabled(routeDiscovery, ssr)) return;
	return async ({ path, patch, signal, fetcherKey }) => {
		if (discoveredPaths$1.has(path)) return;
		let { state } = getRouter();
		await fetchAndApplyManifestPatches$1([path], fetcherKey ? window.location.href : createPath(state.navigation.location || state.location), manifest, routeModules, ssr, isSpaMode, basename, routeDiscovery.manifestPath, patch, signal);
	};
}
function useFogOFWarDiscovery(router, manifest, routeModules, ssr, routeDiscovery, isSpaMode) {
	React.useEffect(() => {
		if (!isFogOfWarEnabled(routeDiscovery, ssr) || window.navigator?.connection?.saveData === true) return;
		function registerElement(el) {
			let path = el.tagName === "FORM" ? el.getAttribute("action") : el.getAttribute("href");
			if (!path) return;
			let pathname = el.tagName === "A" ? el.pathname : new URL(path, window.location.origin).pathname;
			if (!discoveredPaths$1.has(pathname)) nextPaths$1.add(pathname);
		}
		async function fetchPatches() {
			document.querySelectorAll("a[data-discover], form[data-discover]").forEach(registerElement);
			let lazyPaths = Array.from(nextPaths$1.keys()).filter((path) => {
				if (discoveredPaths$1.has(path)) {
					nextPaths$1.delete(path);
					return false;
				}
				return true;
			});
			if (lazyPaths.length === 0) return;
			try {
				await fetchAndApplyManifestPatches$1(lazyPaths, null, manifest, routeModules, ssr, isSpaMode, router.basename, routeDiscovery.manifestPath, router.patchRoutes);
			} catch (e) {
				console.error("Failed to fetch manifest patches", e);
			}
		}
		let debouncedFetchPatches = debounce$1(fetchPatches, 100);
		fetchPatches();
		let observer = new MutationObserver(() => debouncedFetchPatches());
		observer.observe(document.documentElement, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: [
				"data-discover",
				"href",
				"action"
			]
		});
		return () => observer.disconnect();
	}, [
		ssr,
		isSpaMode,
		manifest,
		routeModules,
		router,
		routeDiscovery
	]);
}
function getManifestPath(_manifestPath, basename) {
	let manifestPath = _manifestPath || "/__manifest";
	return basename == null ? manifestPath : joinPaths([basename, manifestPath]);
}
async function fetchAndApplyManifestPatches$1(paths, errorReloadPath, manifest, routeModules, ssr, isSpaMode, basename, manifestPath, patchRoutes, signal) {
	paths = getPathsWithAncestors(paths);
	const searchParams = new URLSearchParams();
	searchParams.set("paths", paths.sort().join(","));
	searchParams.set("version", manifest.version);
	let url = new URL(getManifestPath(manifestPath, basename), window.location.origin);
	url.search = searchParams.toString();
	if (url.toString().length > 7680) {
		nextPaths$1.clear();
		return;
	}
	let serverPatches;
	try {
		let res = await fetch(url, { signal });
		if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
		else if (res.status === 204 && res.headers.has("X-Remix-Reload-Document")) {
			if (!errorReloadPath) {
				console.warn("Detected a manifest version mismatch during eager route discovery. The next navigation/fetch to an undiscovered route will result in a new document navigation to sync up with the latest manifest.");
				return;
			}
			try {
				if (sessionStorage.getItem(MANIFEST_VERSION_STORAGE_KEY) === manifest.version) {
					console.error("Unable to discover routes due to manifest version mismatch.");
					return;
				}
				sessionStorage.setItem(MANIFEST_VERSION_STORAGE_KEY, manifest.version);
			} catch {}
			window.location.href = errorReloadPath;
			console.warn("Detected manifest version mismatch, reloading...");
			await new Promise(() => {});
		} else if (res.status >= 400) throw new Error(await res.text());
		try {
			sessionStorage.removeItem(MANIFEST_VERSION_STORAGE_KEY);
		} catch {}
		serverPatches = await res.json();
	} catch (e) {
		if (signal?.aborted) return;
		throw e;
	}
	let knownRoutes = new Set(Object.keys(manifest.routes));
	let patches = Object.values(serverPatches).reduce((acc, route) => {
		if (route && !knownRoutes.has(route.id)) acc[route.id] = route;
		return acc;
	}, {});
	Object.assign(manifest.routes, patches);
	paths.forEach((p) => addToFifoQueue$1(p, discoveredPaths$1));
	let parentIds = /* @__PURE__ */ new Set();
	Object.values(patches).forEach((patch) => {
		if (patch && (!patch.parentId || !patches[patch.parentId])) parentIds.add(patch.parentId);
	});
	parentIds.forEach((parentId) => patchRoutes(parentId || null, createClientRoutes(patches, routeModules, null, ssr, isSpaMode, parentId)));
}
function addToFifoQueue$1(path, queue) {
	if (queue.size >= discoveredPathsMaxSize$1) {
		let first = queue.values().next().value;
		queue.delete(first);
	}
	queue.add(path);
}
function debounce$1(callback, wait) {
	let timeoutId;
	return (...args) => {
		window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => callback(...args), wait);
	};
}
function useDataRouterContext2() {
	let context = React.useContext(DataRouterContext);
	invariant2(context, "You must render this element inside a <DataRouterContext.Provider> element");
	return context;
}
function useDataRouterStateContext() {
	let context = React.useContext(DataRouterStateContext);
	invariant2(context, "You must render this element inside a <DataRouterStateContext.Provider> element");
	return context;
}
function useFrameworkContext() {
	let context = React.useContext(FrameworkContext);
	invariant2(context, "You must render this element inside a <HydratedRouter> element");
	return context;
}
function usePrefetchBehavior(prefetch, theirElementProps) {
	let frameworkContext = React.useContext(FrameworkContext);
	let [maybePrefetch, setMaybePrefetch] = React.useState(false);
	let [shouldPrefetch, setShouldPrefetch] = React.useState(false);
	let { onFocus, onBlur, onMouseEnter, onMouseLeave, onTouchStart } = theirElementProps;
	let ref = React.useRef(null);
	React.useEffect(() => {
		if (prefetch === "render") setShouldPrefetch(true);
		if (prefetch === "viewport") {
			let callback = (entries) => {
				entries.forEach((entry) => {
					setShouldPrefetch(entry.isIntersecting);
				});
			};
			let observer = new IntersectionObserver(callback, { threshold: .5 });
			if (ref.current) observer.observe(ref.current);
			return () => {
				observer.disconnect();
			};
		}
	}, [prefetch]);
	React.useEffect(() => {
		if (maybePrefetch) {
			let id = setTimeout(() => {
				setShouldPrefetch(true);
			}, 100);
			return () => {
				clearTimeout(id);
			};
		}
	}, [maybePrefetch]);
	let setIntent = () => {
		setMaybePrefetch(true);
	};
	let cancelIntent = () => {
		setMaybePrefetch(false);
		setShouldPrefetch(false);
	};
	if (!frameworkContext) return [
		false,
		ref,
		{}
	];
	if (prefetch !== "intent") return [
		shouldPrefetch,
		ref,
		{}
	];
	return [
		shouldPrefetch,
		ref,
		{
			onFocus: composeEventHandlers(onFocus, setIntent),
			onBlur: composeEventHandlers(onBlur, cancelIntent),
			onMouseEnter: composeEventHandlers(onMouseEnter, setIntent),
			onMouseLeave: composeEventHandlers(onMouseLeave, cancelIntent),
			onTouchStart: composeEventHandlers(onTouchStart, setIntent)
		}
	];
}
function composeEventHandlers(theirHandler, ourHandler) {
	return (event) => {
		theirHandler && theirHandler(event);
		if (!event.defaultPrevented) ourHandler(event);
	};
}
function getActiveMatches(matches, errors, isSpaMode) {
	if (isSpaMode && !isHydrated) return [matches[0]];
	if (errors) {
		let errorIdx = matches.findIndex((m) => errors[m.route.id] !== void 0);
		return matches.slice(0, errorIdx + 1);
	}
	return matches;
}
function Links({ nonce, crossOrigin }) {
	let { isSpaMode, manifest, routeModules, criticalCss, nonce: contextNonce } = useFrameworkContext();
	let { errors, matches: routerMatches } = useDataRouterStateContext();
	let matches = getActiveMatches(routerMatches, errors, isSpaMode);
	let keyedLinks = React.useMemo(() => getKeyedLinksForMatches(matches, routeModules, manifest), [
		matches,
		routeModules,
		manifest
	]);
	if (nonce == null && contextNonce) nonce = contextNonce;
	return /* @__PURE__ */ React.createElement(React.Fragment, null, typeof criticalCss === "string" ? /* @__PURE__ */ React.createElement("style", {
		[CRITICAL_CSS_DATA_ATTRIBUTE]: "",
		nonce,
		dangerouslySetInnerHTML: { __html: criticalCss }
	}) : null, typeof criticalCss === "object" ? /* @__PURE__ */ React.createElement("link", {
		[CRITICAL_CSS_DATA_ATTRIBUTE]: "",
		rel: "stylesheet",
		href: criticalCss.href,
		nonce,
		crossOrigin
	}) : null, keyedLinks.map(({ key, link }) => isPageLinkDescriptor(link) ? /* @__PURE__ */ React.createElement(PrefetchPageLinks, {
		key,
		nonce,
		...link,
		crossOrigin: link.crossOrigin ?? crossOrigin
	}) : /* @__PURE__ */ React.createElement("link", {
		key,
		nonce,
		...link,
		crossOrigin: link.crossOrigin ?? crossOrigin
	})));
}
function PrefetchPageLinks({ page, ...linkProps }) {
	let rsc = useIsRSCRouterContext();
	let { nonce: contextNonce } = useFrameworkContext();
	let { router } = useDataRouterContext2();
	let matches = React.useMemo(() => matchRoutes(router.routes, page, router.basename), [
		router.routes,
		page,
		router.basename
	]);
	if (!matches) return null;
	if (linkProps.nonce == null && contextNonce) linkProps = {
		...linkProps,
		nonce: contextNonce
	};
	if (rsc) return /* @__PURE__ */ React.createElement(RSCPrefetchPageLinksImpl, {
		page,
		matches,
		...linkProps
	});
	return /* @__PURE__ */ React.createElement(PrefetchPageLinksImpl, {
		page,
		matches,
		...linkProps
	});
}
function useKeyedPrefetchLinks(matches) {
	let { manifest, routeModules } = useFrameworkContext();
	let [keyedPrefetchLinks, setKeyedPrefetchLinks] = React.useState([]);
	React.useEffect(() => {
		let interrupted = false;
		getKeyedPrefetchLinks(matches, manifest, routeModules).then((links) => {
			if (!interrupted) setKeyedPrefetchLinks(links);
		});
		return () => {
			interrupted = true;
		};
	}, [
		matches,
		manifest,
		routeModules
	]);
	return keyedPrefetchLinks;
}
function RSCPrefetchPageLinksImpl({ page, matches: nextMatches, ...linkProps }) {
	let location = useLocation$1();
	let { future } = useFrameworkContext();
	let { basename } = useDataRouterContext2();
	let dataHrefs = React.useMemo(() => {
		if (page === location.pathname + location.search + location.hash) return [];
		let url = singleFetchUrl(page, basename, future.v8_trailingSlashAwareDataRequests, "rsc");
		let hasSomeRoutesWithShouldRevalidate = false;
		let targetRoutes = [];
		for (let match of nextMatches) if (typeof match.route.shouldRevalidate === "function") hasSomeRoutesWithShouldRevalidate = true;
		else targetRoutes.push(match.route.id);
		if (hasSomeRoutesWithShouldRevalidate && targetRoutes.length > 0) url.searchParams.set("_routes", targetRoutes.join(","));
		return [url.pathname + url.search];
	}, [
		basename,
		future.v8_trailingSlashAwareDataRequests,
		page,
		location,
		nextMatches
	]);
	return /* @__PURE__ */ React.createElement(React.Fragment, null, dataHrefs.map((href) => /* @__PURE__ */ React.createElement("link", {
		key: href,
		rel: "prefetch",
		as: "fetch",
		href,
		...linkProps
	})));
}
function PrefetchPageLinksImpl({ page, matches: nextMatches, ...linkProps }) {
	let location = useLocation$1();
	let { future, manifest, routeModules } = useFrameworkContext();
	let { basename } = useDataRouterContext2();
	let { loaderData, matches } = useDataRouterStateContext();
	let newMatchesForData = React.useMemo(() => getNewMatchesForLinks(page, nextMatches, matches, manifest, location, "data"), [
		page,
		nextMatches,
		matches,
		manifest,
		location
	]);
	let newMatchesForAssets = React.useMemo(() => getNewMatchesForLinks(page, nextMatches, matches, manifest, location, "assets"), [
		page,
		nextMatches,
		matches,
		manifest,
		location
	]);
	let dataHrefs = React.useMemo(() => {
		if (page === location.pathname + location.search + location.hash) return [];
		let routesParams = /* @__PURE__ */ new Set();
		let foundOptOutRoute = false;
		nextMatches.forEach((m) => {
			let manifestRoute = manifest.routes[m.route.id];
			if (!manifestRoute || !manifestRoute.hasLoader) return;
			if (!newMatchesForData.some((m2) => m2.route.id === m.route.id) && m.route.id in loaderData && routeModules[m.route.id]?.shouldRevalidate) foundOptOutRoute = true;
			else if (manifestRoute.hasClientLoader) foundOptOutRoute = true;
			else routesParams.add(m.route.id);
		});
		if (routesParams.size === 0) return [];
		let url = singleFetchUrl(page, basename, future.v8_trailingSlashAwareDataRequests, "data");
		if (foundOptOutRoute && routesParams.size > 0) url.searchParams.set("_routes", nextMatches.filter((m) => routesParams.has(m.route.id)).map((m) => m.route.id).join(","));
		return [url.pathname + url.search];
	}, [
		basename,
		future.v8_trailingSlashAwareDataRequests,
		loaderData,
		location,
		manifest,
		newMatchesForData,
		nextMatches,
		page,
		routeModules
	]);
	let moduleHrefs = React.useMemo(() => getModuleLinkHrefs(newMatchesForAssets, manifest), [newMatchesForAssets, manifest]);
	let keyedPrefetchLinks = useKeyedPrefetchLinks(newMatchesForAssets);
	return /* @__PURE__ */ React.createElement(React.Fragment, null, dataHrefs.map((href) => /* @__PURE__ */ React.createElement("link", {
		key: href,
		rel: "prefetch",
		as: "fetch",
		href,
		...linkProps
	})), moduleHrefs.map((href) => /* @__PURE__ */ React.createElement("link", {
		key: href,
		rel: "modulepreload",
		href,
		...linkProps
	})), keyedPrefetchLinks.map(({ key, link }) => /* @__PURE__ */ React.createElement("link", {
		key,
		nonce: linkProps.nonce,
		...link,
		crossOrigin: link.crossOrigin ?? linkProps.crossOrigin
	})));
}
function Meta() {
	let { isSpaMode, routeModules } = useFrameworkContext();
	let { errors, matches: routerMatches, loaderData } = useDataRouterStateContext();
	let location = useLocation$1();
	let _matches = getActiveMatches(routerMatches, errors, isSpaMode);
	let error = null;
	if (errors) error = errors[_matches[_matches.length - 1].route.id];
	let meta = [];
	let leafMeta = null;
	let matches = [];
	for (let i = 0; i < _matches.length; i++) {
		let _match = _matches[i];
		let routeId = _match.route.id;
		let data2 = loaderData[routeId];
		let params = _match.params;
		let routeModule = routeModules[routeId];
		let routeMeta = [];
		let match = {
			id: routeId,
			data: data2,
			loaderData: data2,
			meta: [],
			params: _match.params,
			pathname: _match.pathname,
			handle: _match.route.handle,
			error
		};
		matches[i] = match;
		if (routeModule?.meta) routeMeta = typeof routeModule.meta === "function" ? routeModule.meta({
			data: data2,
			loaderData: data2,
			params,
			location,
			matches,
			error
		}) : Array.isArray(routeModule.meta) ? [...routeModule.meta] : routeModule.meta;
		else if (leafMeta) routeMeta = [...leafMeta];
		routeMeta = routeMeta || [];
		if (!Array.isArray(routeMeta)) throw new Error("The route at " + _match.route.path + " returns an invalid value. All route meta functions must return an array of meta objects.\n\nTo reference the meta function API, see https://reactrouter.com/start/framework/route-module#meta");
		match.meta = routeMeta;
		matches[i] = match;
		meta = [...routeMeta];
		leafMeta = meta;
	}
	return /* @__PURE__ */ React.createElement(React.Fragment, null, meta.flat().map((metaProps) => {
		if (!metaProps) return null;
		if ("tagName" in metaProps) {
			let { tagName, ...rest } = metaProps;
			if (!isValidMetaTag(tagName)) {
				console.warn(`A meta object uses an invalid tagName: ${tagName}. Expected either 'link' or 'meta'`);
				return null;
			}
			let Comp = tagName;
			return /* @__PURE__ */ React.createElement(Comp, {
				key: JSON.stringify(rest),
				...rest
			});
		}
		if ("title" in metaProps) return /* @__PURE__ */ React.createElement("title", { key: "title" }, String(metaProps.title));
		if ("charset" in metaProps) {
			metaProps.charSet ?? (metaProps.charSet = metaProps.charset);
			delete metaProps.charset;
		}
		if ("charSet" in metaProps && metaProps.charSet != null) return typeof metaProps.charSet === "string" ? /* @__PURE__ */ React.createElement("meta", {
			key: "charSet",
			charSet: metaProps.charSet
		}) : null;
		if ("script:ld+json" in metaProps) try {
			let json = JSON.stringify(metaProps["script:ld+json"]);
			return /* @__PURE__ */ React.createElement("script", {
				key: `script:ld+json:${json}`,
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: escapeHtml(json) }
			});
		} catch (e) {
			return null;
		}
		return /* @__PURE__ */ React.createElement("meta", {
			key: JSON.stringify(metaProps),
			...metaProps
		});
	}));
}
function isValidMetaTag(tagName) {
	return typeof tagName === "string" && /^(meta|link)$/.test(tagName);
}
function setIsHydrated() {
	isHydrated = true;
}
function Scripts(scriptProps) {
	let { manifest, serverHandoffString, isSpaMode, renderMeta, routeDiscovery, ssr, nonce: contextNonce } = useFrameworkContext();
	let { router, static: isStatic, staticContext } = useDataRouterContext2();
	let { matches: routerMatches } = useDataRouterStateContext();
	let isRSCRouterContext = useIsRSCRouterContext();
	let enableFogOfWar = isFogOfWarEnabled(routeDiscovery, ssr);
	if (scriptProps.nonce == null && contextNonce) scriptProps = {
		...scriptProps,
		nonce: contextNonce
	};
	if (renderMeta) renderMeta.didRenderScripts = true;
	let matches = getActiveMatches(routerMatches, null, isSpaMode);
	React.useEffect(() => {
		setIsHydrated();
	}, []);
	let initialScripts = React.useMemo(() => {
		if (isRSCRouterContext) return null;
		let contextScript = staticContext ? `window.__reactRouterContext = ${serverHandoffString};window.__reactRouterContext.stream = new ReadableStream({start(controller){window.__reactRouterContext.streamController = controller;}}).pipeThrough(new TextEncoderStream());` : " ";
		let routeModulesScript = !isStatic ? " " : `${manifest.hmr?.runtime ? `import ${JSON.stringify(manifest.hmr.runtime)};` : ""}${!enableFogOfWar ? `import ${JSON.stringify(manifest.url)}` : ""};
${matches.map((match, routeIndex) => {
			let routeVarName = `route${routeIndex}`;
			let manifestEntry = manifest.routes[match.route.id];
			invariant2(manifestEntry, `Route ${match.route.id} not found in manifest`);
			let { clientActionModule, clientLoaderModule, clientMiddlewareModule, hydrateFallbackModule, module } = manifestEntry;
			let chunks = [
				...clientActionModule ? [{
					module: clientActionModule,
					varName: `${routeVarName}_clientAction`
				}] : [],
				...clientLoaderModule ? [{
					module: clientLoaderModule,
					varName: `${routeVarName}_clientLoader`
				}] : [],
				...clientMiddlewareModule ? [{
					module: clientMiddlewareModule,
					varName: `${routeVarName}_clientMiddleware`
				}] : [],
				...hydrateFallbackModule ? [{
					module: hydrateFallbackModule,
					varName: `${routeVarName}_HydrateFallback`
				}] : [],
				{
					module,
					varName: `${routeVarName}_main`
				}
			];
			if (chunks.length === 1) return `import * as ${routeVarName} from ${JSON.stringify(module)};`;
			return [chunks.map((chunk) => `import * as ${chunk.varName} from "${chunk.module}";`).join("\n"), `const ${routeVarName} = {${chunks.map((chunk) => `...${chunk.varName}`).join(",")}};`].join("\n");
		}).join("\n")}
  ${enableFogOfWar ? `window.__reactRouterManifest = ${JSON.stringify(getPartialManifest(manifest, router), null, 2)};` : ""}
  window.__reactRouterRouteModules = {${matches.map((match, index) => `${JSON.stringify(match.route.id)}:route${index}`).join(",")}};

import(${JSON.stringify(manifest.entry.module)});`;
		return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("script", {
			...scriptProps,
			suppressHydrationWarning: true,
			dangerouslySetInnerHTML: { __html: contextScript },
			type: void 0
		}), /* @__PURE__ */ React.createElement("script", {
			...scriptProps,
			suppressHydrationWarning: true,
			dangerouslySetInnerHTML: { __html: routeModulesScript },
			type: "module",
			async: true
		}));
	}, []);
	let preloads = isHydrated || isRSCRouterContext ? [] : [...new Set(manifest.entry.imports.concat(getModuleLinkHrefs(matches, manifest, { includeHydrateFallback: true })))];
	let sri = typeof manifest.sri === "object" ? manifest.sri : {};
	warnOnce(!isRSCRouterContext, "The <Scripts /> element is a no-op when using RSC and can be safely removed.");
	return isHydrated || isRSCRouterContext ? null : /* @__PURE__ */ React.createElement(React.Fragment, null, typeof manifest.sri === "object" ? /* @__PURE__ */ React.createElement("script", {
		...scriptProps,
		"rr-importmap": "",
		type: "importmap",
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: JSON.stringify({ integrity: sri }) }
	}) : null, !enableFogOfWar ? /* @__PURE__ */ React.createElement("link", {
		rel: "modulepreload",
		href: manifest.url,
		crossOrigin: scriptProps.crossOrigin,
		integrity: sri[manifest.url],
		nonce: scriptProps.nonce,
		suppressHydrationWarning: true
	}) : null, /* @__PURE__ */ React.createElement("link", {
		rel: "modulepreload",
		href: manifest.entry.module,
		crossOrigin: scriptProps.crossOrigin,
		integrity: sri[manifest.entry.module],
		nonce: scriptProps.nonce,
		suppressHydrationWarning: true
	}), preloads.map((path) => /* @__PURE__ */ React.createElement("link", {
		key: path,
		rel: "modulepreload",
		href: path,
		crossOrigin: scriptProps.crossOrigin,
		integrity: sri[path],
		nonce: scriptProps.nonce,
		suppressHydrationWarning: true
	})), initialScripts);
}
function mergeRefs(...refs) {
	return (value) => {
		refs.forEach((ref) => {
			if (typeof ref === "function") ref(value);
			else if (ref != null) ref.current = value;
		});
	};
}
function RemixRootDefaultErrorBoundary({ error, isOutsideRemixApp }) {
	let { nonce } = useFrameworkContext();
	console.error(error);
	let heyDeveloper = /* @__PURE__ */ React.createElement("script", {
		nonce,
		dangerouslySetInnerHTML: { __html: `
        console.log(
          "\u{1F4BF} Hey developer \u{1F44B}. You can provide a way better UX than this when your app throws errors. Check out https://reactrouter.com/how-to/error-boundary for more information."
        );
      ` }
	});
	if (isRouteErrorResponse(error)) return /* @__PURE__ */ React.createElement(BoundaryShell, { title: "Unhandled Thrown Response!" }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "24px" } }, error.status, " ", error.statusText), heyDeveloper);
	let errorInstance;
	if (error instanceof Error) errorInstance = error;
	else {
		let errorString = error == null ? "Unknown Error" : typeof error === "object" && "toString" in error ? error.toString() : JSON.stringify(error);
		errorInstance = new Error(errorString);
	}
	return /* @__PURE__ */ React.createElement(BoundaryShell, {
		title: "Application Error!",
		isOutsideRemixApp
	}, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "24px" } }, "Application Error"), /* @__PURE__ */ React.createElement("pre", { style: {
		padding: "2rem",
		background: "hsla(10, 50%, 50%, 0.1)",
		color: "red",
		overflow: "auto"
	} }, errorInstance.stack), heyDeveloper);
}
function BoundaryShell({ title, renderScripts, isOutsideRemixApp, children }) {
	let { routeModules } = useFrameworkContext();
	if (routeModules.root?.Layout && !isOutsideRemixApp) return children;
	return /* @__PURE__ */ React.createElement("html", { lang: "en" }, /* @__PURE__ */ React.createElement("head", null, /* @__PURE__ */ React.createElement("meta", { charSet: "utf-8" }), /* @__PURE__ */ React.createElement("meta", {
		name: "viewport",
		content: "width=device-width,initial-scale=1,viewport-fit=cover"
	}), /* @__PURE__ */ React.createElement("title", null, title)), /* @__PURE__ */ React.createElement("body", null, /* @__PURE__ */ React.createElement("main", { style: {
		fontFamily: "system-ui, sans-serif",
		padding: "2rem"
	} }, children, renderScripts ? /* @__PURE__ */ React.createElement(Scripts, null) : null)));
}
function createBrowserRouter(routes, opts) {
	return createRouter({
		basename: opts?.basename,
		getContext: opts?.getContext,
		future: opts?.future,
		history: createBrowserHistory({ window: opts?.window }),
		hydrationData: opts?.hydrationData || parseHydrationData(),
		routes,
		mapRouteProperties,
		hydrationRouteProperties,
		dataStrategy: opts?.dataStrategy,
		patchRoutesOnNavigation: opts?.patchRoutesOnNavigation,
		window: opts?.window,
		instrumentations: opts?.instrumentations
	}).initialize();
}
function createHashRouter(routes, opts) {
	return createRouter({
		basename: opts?.basename,
		getContext: opts?.getContext,
		future: opts?.future,
		history: createHashHistory({ window: opts?.window }),
		hydrationData: opts?.hydrationData || parseHydrationData(),
		routes,
		mapRouteProperties,
		hydrationRouteProperties,
		dataStrategy: opts?.dataStrategy,
		patchRoutesOnNavigation: opts?.patchRoutesOnNavigation,
		window: opts?.window,
		instrumentations: opts?.instrumentations
	}).initialize();
}
function parseHydrationData() {
	let state = window?.__staticRouterHydrationData;
	if (state && state.errors) state = {
		...state,
		errors: deserializeErrors(state.errors)
	};
	return state;
}
function deserializeErrors(errors) {
	if (!errors) return null;
	let entries = Object.entries(errors);
	let serialized = {};
	for (let [key, val] of entries) if (val && val.__type === "RouteErrorResponse") serialized[key] = new ErrorResponseImpl(val.status, val.statusText, val.data, val.internal === true);
	else if (val && val.__type === "Error") {
		if (typeof val.__subType === "string" && SUPPORTED_ERROR_TYPES.includes(val.__subType)) {
			let ErrorConstructor = window[val.__subType];
			if (typeof ErrorConstructor === "function") try {
				let error = new ErrorConstructor(val.message);
				error.stack = "";
				serialized[key] = error;
			} catch (e) {}
		}
		if (serialized[key] == null) {
			let error = new Error(val.message);
			error.stack = "";
			serialized[key] = error;
		}
	} else serialized[key] = val;
	return serialized;
}
function BrowserRouter({ basename, children, useTransitions, window: window2 }) {
	let historyRef = React.useRef();
	if (historyRef.current == null) historyRef.current = createBrowserHistory({
		window: window2,
		v5Compat: true
	});
	let history = historyRef.current;
	let [state, setStateImpl] = React.useState({
		action: history.action,
		location: history.location
	});
	let setState = React.useCallback((newState) => {
		if (useTransitions === false) setStateImpl(newState);
		else React.startTransition(() => setStateImpl(newState));
	}, [useTransitions]);
	React.useLayoutEffect(() => history.listen(setState), [history, setState]);
	return /* @__PURE__ */ React.createElement(Router, {
		basename,
		children,
		location: state.location,
		navigationType: state.action,
		navigator: history,
		useTransitions
	});
}
function HashRouter({ basename, children, useTransitions, window: window2 }) {
	let historyRef = React.useRef();
	if (historyRef.current == null) historyRef.current = createHashHistory({
		window: window2,
		v5Compat: true
	});
	let history = historyRef.current;
	let [state, setStateImpl] = React.useState({
		action: history.action,
		location: history.location
	});
	let setState = React.useCallback((newState) => {
		if (useTransitions === false) setStateImpl(newState);
		else React.startTransition(() => setStateImpl(newState));
	}, [useTransitions]);
	React.useLayoutEffect(() => history.listen(setState), [history, setState]);
	return /* @__PURE__ */ React.createElement(Router, {
		basename,
		children,
		location: state.location,
		navigationType: state.action,
		navigator: history,
		useTransitions
	});
}
function HistoryRouter({ basename, children, history, useTransitions }) {
	let [state, setStateImpl] = React.useState({
		action: history.action,
		location: history.location
	});
	let setState = React.useCallback((newState) => {
		if (useTransitions === false) setStateImpl(newState);
		else React.startTransition(() => setStateImpl(newState));
	}, [useTransitions]);
	React.useLayoutEffect(() => history.listen(setState), [history, setState]);
	return /* @__PURE__ */ React.createElement(Router, {
		basename,
		children,
		location: state.location,
		navigationType: state.action,
		navigator: history,
		useTransitions
	});
}
function ScrollRestoration({ getKey, storageKey, ...props }) {
	let remixContext = React.useContext(FrameworkContext);
	let { basename } = React.useContext(NavigationContext);
	let location = useLocation$1();
	let matches = useMatches();
	useScrollRestoration({
		getKey,
		storageKey
	});
	let ssrKey = React.useMemo(() => {
		if (!remixContext || !getKey) return null;
		let userKey = getScrollRestorationKey(location, matches, basename, getKey);
		return userKey !== location.key ? userKey : null;
	}, []);
	if (!remixContext || remixContext.isSpaMode) return null;
	let restoreScroll = ((storageKey2, restoreKey) => {
		if (!window.history.state || !window.history.state.key) {
			let key = Math.random().toString(32).slice(2);
			window.history.replaceState({ key }, "");
		}
		try {
			let storedY = JSON.parse(sessionStorage.getItem(storageKey2) || "{}")[restoreKey || window.history.state.key];
			if (typeof storedY === "number") window.scrollTo(0, storedY);
		} catch (error) {
			console.error(error);
			sessionStorage.removeItem(storageKey2);
		}
	}).toString();
	if (props.nonce == null && remixContext?.nonce) props.nonce = remixContext.nonce;
	return /* @__PURE__ */ React.createElement("script", {
		...props,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: `(${restoreScroll})(${escapeHtml(JSON.stringify(storageKey || SCROLL_RESTORATION_STORAGE_KEY))}, ${escapeHtml(JSON.stringify(ssrKey))})` }
	});
}
function getDataRouterConsoleError2(hookName) {
	return `${hookName} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function useDataRouterContext3(hookName) {
	let ctx = React.useContext(DataRouterContext);
	invariant$1(ctx, getDataRouterConsoleError2(hookName));
	return ctx;
}
function useDataRouterState2(hookName) {
	let state = React.useContext(DataRouterStateContext);
	invariant$1(state, getDataRouterConsoleError2(hookName));
	return state;
}
function useLinkClickHandler(to, { target, replace: replaceProp, mask, state, preventScrollReset, relative, viewTransition, defaultShouldRevalidate, useTransitions } = {}) {
	let navigate = useNavigate$1();
	let location = useLocation$1();
	let path = useResolvedPath(to, { relative });
	return React.useCallback((event) => {
		if (shouldProcessLinkClick(event, target)) {
			event.preventDefault();
			let replace2 = replaceProp !== void 0 ? replaceProp : createPath(location) === createPath(path);
			let doNavigate = () => navigate(to, {
				replace: replace2,
				mask,
				state,
				preventScrollReset,
				relative,
				viewTransition,
				defaultShouldRevalidate
			});
			if (useTransitions) React.startTransition(() => doNavigate());
			else doNavigate();
		}
	}, [
		location,
		navigate,
		path,
		replaceProp,
		mask,
		state,
		target,
		to,
		preventScrollReset,
		relative,
		viewTransition,
		defaultShouldRevalidate,
		useTransitions
	]);
}
function useSearchParams(defaultInit) {
	warning(typeof URLSearchParams !== "undefined", `You cannot use the \`useSearchParams\` hook in a browser that does not support the URLSearchParams API. If you need to support Internet Explorer 11, we recommend you load a polyfill such as https://github.com/ungap/url-search-params.`);
	let defaultSearchParamsRef = React.useRef(createSearchParams(defaultInit));
	let hasSetSearchParamsRef = React.useRef(false);
	let location = useLocation$1();
	let searchParams = React.useMemo(() => getSearchParamsForLocation(location.search, hasSetSearchParamsRef.current ? null : defaultSearchParamsRef.current), [location.search]);
	let navigate = useNavigate$1();
	return [searchParams, React.useCallback((nextInit, navigateOptions) => {
		const newSearchParams = createSearchParams(typeof nextInit === "function" ? nextInit(new URLSearchParams(searchParams)) : nextInit);
		hasSetSearchParamsRef.current = true;
		navigate("?" + newSearchParams, navigateOptions);
	}, [navigate, searchParams])];
}
function useSubmit() {
	let { router } = useDataRouterContext3("useSubmit");
	let { basename } = React.useContext(NavigationContext);
	let currentRouteId = useRouteId();
	let routerFetch = router.fetch;
	let routerNavigate = router.navigate;
	return React.useCallback(async (target, options = {}) => {
		let { action, method, encType, formData, body } = getFormSubmissionInfo(target, basename);
		if (options.navigate === false) {
			let key = options.fetcherKey || getUniqueFetcherId();
			await routerFetch(key, currentRouteId, options.action || action, {
				defaultShouldRevalidate: options.defaultShouldRevalidate,
				preventScrollReset: options.preventScrollReset,
				formData,
				body,
				formMethod: options.method || method,
				formEncType: options.encType || encType,
				flushSync: options.flushSync
			});
		} else await routerNavigate(options.action || action, {
			defaultShouldRevalidate: options.defaultShouldRevalidate,
			preventScrollReset: options.preventScrollReset,
			formData,
			body,
			formMethod: options.method || method,
			formEncType: options.encType || encType,
			replace: options.replace,
			state: options.state,
			fromRouteId: currentRouteId,
			flushSync: options.flushSync,
			viewTransition: options.viewTransition
		});
	}, [
		routerFetch,
		routerNavigate,
		basename,
		currentRouteId
	]);
}
function useFormAction(action, { relative } = {}) {
	let { basename } = React.useContext(NavigationContext);
	let routeContext = React.useContext(RouteContext);
	invariant$1(routeContext, "useFormAction must be used inside a RouteContext");
	let [match] = routeContext.matches.slice(-1);
	let path = { ...useResolvedPath(action ? action : ".", { relative }) };
	let location = useLocation$1();
	if (action == null) {
		path.search = location.search;
		let params = new URLSearchParams(path.search);
		let indexValues = params.getAll("index");
		if (indexValues.some((v) => v === "")) {
			params.delete("index");
			indexValues.filter((v) => v).forEach((v) => params.append("index", v));
			let qs = params.toString();
			path.search = qs ? `?${qs}` : "";
		}
	}
	if ((!action || action === ".") && match.route.index) path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
	if (basename !== "/") path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
	return createPath(path);
}
function useFetcher({ key } = {}) {
	let { router } = useDataRouterContext3("useFetcher");
	let state = useDataRouterState2("useFetcher");
	let fetcherData = React.useContext(FetchersContext);
	let route = React.useContext(RouteContext);
	let routeId = route.matches[route.matches.length - 1]?.route.id;
	invariant$1(fetcherData, `useFetcher must be used inside a FetchersContext`);
	invariant$1(route, `useFetcher must be used inside a RouteContext`);
	invariant$1(routeId != null, `useFetcher can only be used on routes that contain a unique "id"`);
	let defaultKey = React.useId();
	let [fetcherKey, setFetcherKey] = React.useState(key || defaultKey);
	if (key && key !== fetcherKey) setFetcherKey(key);
	let { deleteFetcher, getFetcher, resetFetcher, fetch: routerFetch } = router;
	React.useEffect(() => {
		getFetcher(fetcherKey);
		return () => deleteFetcher(fetcherKey);
	}, [
		deleteFetcher,
		getFetcher,
		fetcherKey
	]);
	let load = React.useCallback(async (href, opts) => {
		invariant$1(routeId, "No routeId available for fetcher.load()");
		await routerFetch(fetcherKey, routeId, href, opts);
	}, [
		fetcherKey,
		routeId,
		routerFetch
	]);
	let submitImpl = useSubmit();
	let submit = React.useCallback(async (target, opts) => {
		await submitImpl(target, {
			...opts,
			navigate: false,
			fetcherKey
		});
	}, [fetcherKey, submitImpl]);
	let reset = React.useCallback((opts) => resetFetcher(fetcherKey, opts), [resetFetcher, fetcherKey]);
	let FetcherForm = React.useMemo(() => {
		let FetcherForm2 = React.forwardRef((props, ref) => {
			return /* @__PURE__ */ React.createElement(Form, {
				...props,
				navigate: false,
				fetcherKey,
				ref
			});
		});
		FetcherForm2.displayName = "fetcher.Form";
		return FetcherForm2;
	}, [fetcherKey]);
	let fetcher = state.fetchers.get(fetcherKey) || IDLE_FETCHER;
	let data2 = fetcherData.get(fetcherKey);
	return React.useMemo(() => ({
		Form: FetcherForm,
		submit,
		load,
		reset,
		...fetcher,
		data: data2
	}), [
		FetcherForm,
		submit,
		load,
		reset,
		fetcher,
		data2
	]);
}
function useFetchers() {
	let state = useDataRouterState2("useFetchers");
	return React.useMemo(() => Array.from(state.fetchers.entries()).map(([key, fetcher]) => ({
		...fetcher,
		key
	})), [state.fetchers]);
}
function getScrollRestorationKey(location, matches, basename, getKey) {
	let key = null;
	if (getKey) {
		if (basename !== "/") key = getKey({
			...location,
			pathname: stripBasename(location.pathname, basename) || location.pathname
		}, matches);
		else key = getKey(location, matches);
	}
	if (key == null) key = location.key;
	return key;
}
function useScrollRestoration({ getKey, storageKey } = {}) {
	let { router } = useDataRouterContext3("useScrollRestoration");
	let { restoreScrollPosition, preventScrollReset } = useDataRouterState2("useScrollRestoration");
	let { basename } = React.useContext(NavigationContext);
	let location = useLocation$1();
	let matches = useMatches();
	let navigation = useNavigation();
	React.useEffect(() => {
		window.history.scrollRestoration = "manual";
		return () => {
			window.history.scrollRestoration = "auto";
		};
	}, []);
	usePageHide(React.useCallback(() => {
		if (navigation.state === "idle") {
			let key = getScrollRestorationKey(location, matches, basename, getKey);
			savedScrollPositions[key] = window.scrollY;
		}
		try {
			sessionStorage.setItem(storageKey || SCROLL_RESTORATION_STORAGE_KEY, JSON.stringify(savedScrollPositions));
		} catch (error) {
			warning(false, `Failed to save scroll positions in sessionStorage, <ScrollRestoration /> will not work properly (${error}).`);
		}
		window.history.scrollRestoration = "auto";
	}, [
		navigation.state,
		getKey,
		basename,
		location,
		matches,
		storageKey
	]));
	if (typeof document !== "undefined") {
		React.useLayoutEffect(() => {
			try {
				let sessionPositions = sessionStorage.getItem(storageKey || SCROLL_RESTORATION_STORAGE_KEY);
				if (sessionPositions) savedScrollPositions = JSON.parse(sessionPositions);
			} catch (e) {}
		}, [storageKey]);
		React.useLayoutEffect(() => {
			let disableScrollRestoration = router?.enableScrollRestoration(savedScrollPositions, () => window.scrollY, getKey ? (location2, matches2) => getScrollRestorationKey(location2, matches2, basename, getKey) : void 0);
			return () => disableScrollRestoration && disableScrollRestoration();
		}, [
			router,
			basename,
			getKey
		]);
		React.useLayoutEffect(() => {
			if (restoreScrollPosition === false) return;
			if (typeof restoreScrollPosition === "number") {
				window.scrollTo(0, restoreScrollPosition);
				return;
			}
			try {
				if (location.hash) {
					let el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
					if (el) {
						el.scrollIntoView();
						return;
					}
				}
			} catch {
				warning(false, `"${location.hash.slice(1)}" is not a decodable element ID. The view will not scroll to it.`);
			}
			if (preventScrollReset === true) return;
			window.scrollTo(0, 0);
		}, [
			location,
			restoreScrollPosition,
			preventScrollReset
		]);
	}
}
function useBeforeUnload(callback, options) {
	let { capture } = options || {};
	React.useEffect(() => {
		let opts = capture != null ? { capture } : void 0;
		window.addEventListener("beforeunload", callback, opts);
		return () => {
			window.removeEventListener("beforeunload", callback, opts);
		};
	}, [callback, capture]);
}
function usePageHide(callback, options) {
	let { capture } = options || {};
	React.useEffect(() => {
		let opts = capture != null ? { capture } : void 0;
		window.addEventListener("pagehide", callback, opts);
		return () => {
			window.removeEventListener("pagehide", callback, opts);
		};
	}, [callback, capture]);
}
function usePrompt({ when, message }) {
	let blocker = useBlocker(when);
	React.useEffect(() => {
		if (blocker.state === "blocked") {
			if (window.confirm(message)) setTimeout(blocker.proceed, 0);
			else blocker.reset();
		}
	}, [blocker, message]);
	React.useEffect(() => {
		if (blocker.state === "blocked" && !when) blocker.reset();
	}, [blocker, when]);
}
function useViewTransitionState(to, { relative } = {}) {
	let vtContext = React.useContext(ViewTransitionContext);
	invariant$1(vtContext != null, "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?");
	let { basename } = useDataRouterContext3("useViewTransitionState");
	let path = useResolvedPath(to, { relative });
	if (!vtContext.isTransitioning) return false;
	let currentPath = stripBasename(vtContext.currentLocation.pathname, basename) || vtContext.currentLocation.pathname;
	let nextPath = stripBasename(vtContext.nextLocation.pathname, basename) || vtContext.nextLocation.pathname;
	return matchPath(path.pathname, nextPath) != null || matchPath(path.pathname, currentPath) != null;
}
function StaticRouter$1({ basename, children, location: locationProp = "/" }) {
	if (typeof locationProp === "string") locationProp = parsePath(locationProp);
	let action = "POP";
	let location = {
		pathname: locationProp.pathname || "/",
		search: locationProp.search || "",
		hash: locationProp.hash || "",
		state: locationProp.state != null ? locationProp.state : null,
		key: locationProp.key || "default",
		mask: void 0
	};
	let staticNavigator = getStatelessNavigator();
	return /* @__PURE__ */ React.createElement(Router, {
		basename,
		children,
		location,
		navigationType: action,
		navigator: staticNavigator,
		static: true,
		useTransitions: false
	});
}
function StaticRouterProvider({ context, router, hydrate: hydrate2 = true, nonce }) {
	invariant$1(router && context, "You must provide `router` and `context` to <StaticRouterProvider>");
	let dataRouterContext = {
		router,
		navigator: getStatelessNavigator(),
		static: true,
		staticContext: context,
		basename: context.basename || "/"
	};
	let fetchersContext = /* @__PURE__ */ new Map();
	let hydrateScript = "";
	if (hydrate2 !== false) {
		let data2 = {
			loaderData: context.loaderData,
			actionData: context.actionData,
			errors: serializeErrors(context.errors)
		};
		hydrateScript = `window.__staticRouterHydrationData = JSON.parse(${escapeHtml(JSON.stringify(JSON.stringify(data2)))});`;
	}
	let { state } = dataRouterContext.router;
	return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DataRouterContext.Provider, { value: dataRouterContext }, /* @__PURE__ */ React.createElement(DataRouterStateContext.Provider, { value: state }, /* @__PURE__ */ React.createElement(FetchersContext.Provider, { value: fetchersContext }, /* @__PURE__ */ React.createElement(ViewTransitionContext.Provider, { value: { isTransitioning: false } }, /* @__PURE__ */ React.createElement(Router, {
		basename: dataRouterContext.basename,
		location: state.location,
		navigationType: state.historyAction,
		navigator: dataRouterContext.navigator,
		static: dataRouterContext.static,
		useTransitions: false
	}, /* @__PURE__ */ React.createElement(DataRoutes2, {
		manifest: router.manifest,
		routes: router.routes,
		future: router.future,
		state,
		isStatic: true
	})))))), hydrateScript ? /* @__PURE__ */ React.createElement("script", {
		suppressHydrationWarning: true,
		nonce,
		dangerouslySetInnerHTML: { __html: hydrateScript }
	}) : null);
}
function serializeErrors(errors) {
	if (!errors) return null;
	let entries = Object.entries(errors);
	let serialized = {};
	for (let [key, val] of entries) if (isRouteErrorResponse(val)) serialized[key] = {
		...val,
		__type: "RouteErrorResponse"
	};
	else if (val instanceof Error) serialized[key] = {
		message: val.message,
		__type: "Error",
		...val.name !== "Error" ? { __subType: val.name } : {}
	};
	else serialized[key] = val;
	return serialized;
}
function getStatelessNavigator() {
	return {
		createHref,
		encodeLocation,
		push(to) {
			throw new Error(`You cannot use navigator.push() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${JSON.stringify(to)})\` somewhere in your app.`);
		},
		replace(to) {
			throw new Error(`You cannot use navigator.replace() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${JSON.stringify(to)}, { replace: true })\` somewhere in your app.`);
		},
		go(delta) {
			throw new Error(`You cannot use navigator.go() on the server because it is a stateless environment. This error was probably triggered when you did a \`navigate(${delta})\` somewhere in your app.`);
		},
		back() {
			throw new Error(`You cannot use navigator.back() on the server because it is a stateless environment.`);
		},
		forward() {
			throw new Error(`You cannot use navigator.forward() on the server because it is a stateless environment.`);
		}
	};
}
function createStaticHandler2(routes, opts) {
	return createStaticHandler(routes, {
		...opts,
		mapRouteProperties
	});
}
function createStaticRouter(routes, context, opts = {}) {
	let manifest = {};
	let dataRoutes = convertRoutesToDataRoutes(routes, mapRouteProperties, void 0, manifest);
	let matches = context.matches.map((match) => {
		let route = manifest[match.route.id] || match.route;
		return {
			...match,
			route
		};
	});
	let msg = (method) => `You cannot use router.${method}() on the server because it is a stateless environment`;
	return {
		get basename() {
			return context.basename;
		},
		get future() {
			return {
				v8_middleware: false,
				v8_passThroughRequests: false,
				v8_trailingSlashAwareDataRequests: false,
				...opts?.future
			};
		},
		get state() {
			return {
				historyAction: "POP",
				location: context.location,
				matches,
				loaderData: context.loaderData,
				actionData: context.actionData,
				errors: context.errors,
				initialized: true,
				renderFallback: false,
				navigation: IDLE_NAVIGATION,
				restoreScrollPosition: null,
				preventScrollReset: false,
				revalidation: "idle",
				fetchers: /* @__PURE__ */ new Map(),
				blockers: /* @__PURE__ */ new Map()
			};
		},
		get routes() {
			return dataRoutes;
		},
		get branches() {
			return opts.branches;
		},
		get manifest() {
			return manifest;
		},
		get window() {},
		initialize() {
			throw msg("initialize");
		},
		subscribe() {
			throw msg("subscribe");
		},
		enableScrollRestoration() {
			throw msg("enableScrollRestoration");
		},
		navigate() {
			throw msg("navigate");
		},
		fetch() {
			throw msg("fetch");
		},
		revalidate() {
			throw msg("revalidate");
		},
		createHref,
		encodeLocation,
		getFetcher() {
			return IDLE_FETCHER;
		},
		deleteFetcher() {
			throw msg("deleteFetcher");
		},
		resetFetcher() {
			throw msg("resetFetcher");
		},
		dispose() {
			throw msg("dispose");
		},
		getBlocker() {
			return IDLE_BLOCKER;
		},
		deleteBlocker() {
			throw msg("deleteBlocker");
		},
		patchRoutes() {
			throw msg("patchRoutes");
		},
		_internalFetchControllers: /* @__PURE__ */ new Map(),
		_internalSetRoutes() {
			throw msg("_internalSetRoutes");
		},
		_internalSetStateDoNotUseOrYouWillBreakYourApp() {
			throw msg("_internalSetStateDoNotUseOrYouWillBreakYourApp");
		}
	};
}
function createHref(to) {
	return typeof to === "string" ? to : createPath(to);
}
function encodeLocation(to) {
	let href = typeof to === "string" ? to : createPath(to);
	href = href.replace(/ $/, "%20");
	let encoded = ABSOLUTE_URL_REGEX.test(href) ? new URL(href) : new URL(href, "http://localhost");
	return {
		pathname: encoded.pathname,
		search: encoded.search,
		hash: encoded.hash
	};
}
var __typeError, __accessCheck, __privateGet, __privateAdd, __privateSet, ABSOLUTE_URL_REGEX, PROTOCOL_RELATIVE_URL_REGEX, Action, PopStateEventType, _map, RouterContextProvider, unsupportedLazyRouteObjectKeys, unsupportedLazyRouteFunctionKeys, paramRe, dynamicSegmentValue, indexRouteValue, emptySegmentValue, staticSegmentValue, splatPenalty, isSplat, isAbsoluteUrl, removeDoubleSlashes, joinPaths, normalizePathname, normalizeSearch, normalizeHash, DataWithResponseInit, redirect, redirectDocument, replace, SUPPORTED_ERROR_TYPES, ErrorResponseImpl, isBrowser, UninstrumentedSymbol, objectProtoNames, DEFAULT_NAVIGATION_URL, validMutationMethodsArr, validMutationMethods, validRequestMethodsArr, validRequestMethods, redirectStatusCodes, redirectPreserveMethodStatusCodes, IDLE_NAVIGATION, IDLE_FETCHER, IDLE_BLOCKER, defaultMapRouteProperties, TRANSITIONS_STORAGE_KEY, ResetLoaderDataSymbol, _routes, _branches, _hmrRoutes, _hmrBranches, DataRoutes, lazyRoutePropertyCache, loadLazyRouteProperty, lazyRouteFunctionCache, invalidProtocols, DataRouterContext, DataRouterStateContext, RSCRouterContext, ViewTransitionContext, FetchersContext, AwaitContext, AwaitContextProvider, NavigationContext, LocationContext, RouteContext, RouteErrorContext, ERROR_DIGEST_BASE, ERROR_DIGEST_REDIRECT, ERROR_DIGEST_ROUTE_ERROR_RESPONSE, navigateEffectWarning, OutletContext, defaultErrorElement, RenderErrorBoundary, errorRedirectHandledMap, blockerId, alreadyWarned, alreadyWarned2, useOptimisticImpl, stableUseOptimisticSetter, hydrationRouteProperties, Deferred, MemoizedDataRoutes, AwaitErrorBoundary, createRoutesFromElements, defaultMethod, defaultEncType, _formDataSupportsSubmitter, supportedFormEncTypes, HOLE, NAN, NEGATIVE_INFINITY, NEGATIVE_ZERO, NULL, POSITIVE_INFINITY, UNDEFINED, TYPE_BIGINT, TYPE_DATE, TYPE_ERROR, TYPE_MAP, TYPE_NULL_OBJECT, TYPE_PROMISE, TYPE_REGEXP, TYPE_SET, TYPE_SYMBOL, TYPE_URL, TYPE_PREVIOUS_RESOLVED, Deferred2, TIME_LIMIT_MS, getNow, yieldToMain, objectProtoNames2, globalObj, ESCAPE_LOOKUP, ESCAPE_REGEX, SingleFetchRedirectSymbol, SingleFetchNoResultError, NO_BODY_STATUS_CODES, _isPreloadSupported, nextPaths$1, discoveredPathsMaxSize$1, discoveredPaths$1, MANIFEST_VERSION_STORAGE_KEY, FrameworkContext, CRITICAL_CSS_DATA_ATTRIBUTE, isHydrated, RemixErrorBoundary, isBrowser2, Link$8, NavLink$1, Form, fetcherId, getUniqueFetcherId, SCROLL_RESTORATION_STORAGE_KEY, savedScrollPositions;
var init_chunk_OB3PAWPO = __esmMin((() => {
	__typeError = (msg) => {
		throw TypeError(msg);
	};
	__accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
	__privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
	__privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
	__privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
	ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|[\\/]{2})/i;
	PROTOCOL_RELATIVE_URL_REGEX = /^[\\/]{2}/;
	Action = /* @__PURE__ */ ((Action2) => {
		Action2["Pop"] = "POP";
		Action2["Push"] = "PUSH";
		Action2["Replace"] = "REPLACE";
		return Action2;
	})(Action || {});
	PopStateEventType = "popstate";
	RouterContextProvider = class {
		/**
		* Create a new `RouterContextProvider` instance
		* @param init An optional initial context map to populate the provider with
		*/
		constructor(init) {
			__privateAdd(this, _map, /* @__PURE__ */ new Map());
			if (init) for (let [context, value] of init) this.set(context, value);
		}
		/**
		* Access a value from the context. If no value has been set for the context,
		* it will return the context's `defaultValue` if provided, or throw an error
		* if no `defaultValue` was set.
		* @param context The context to get the value for
		* @returns The value for the context, or the context's `defaultValue` if no
		* value was set
		*/
		get(context) {
			if (__privateGet(this, _map).has(context)) return __privateGet(this, _map).get(context);
			if (context.defaultValue !== void 0) return context.defaultValue;
			throw new Error("No value found for context");
		}
		/**
		* Set a value for the context. If the context already has a value set, this
		* will overwrite it.
		*
		* @param context The context to set the value for
		* @param value The value to set for the context
		* @returns {void}
		*/
		set(context, value) {
			__privateGet(this, _map).set(context, value);
		}
	};
	_map = /* @__PURE__ */ new WeakMap();
	unsupportedLazyRouteObjectKeys = /* @__PURE__ */ new Set([
		"lazy",
		"caseSensitive",
		"path",
		"id",
		"index",
		"children"
	]);
	unsupportedLazyRouteFunctionKeys = /* @__PURE__ */ new Set([
		"lazy",
		"caseSensitive",
		"path",
		"id",
		"index",
		"middleware",
		"children"
	]);
	paramRe = /^:[\w-]+$/;
	dynamicSegmentValue = 3;
	indexRouteValue = 2;
	emptySegmentValue = 1;
	staticSegmentValue = 10;
	splatPenalty = -2;
	isSplat = (s) => s === "*";
	isAbsoluteUrl = (url) => ABSOLUTE_URL_REGEX.test(url);
	removeDoubleSlashes = (path) => path.replace(/[\\/]{2,}/g, "/");
	joinPaths = (paths) => removeDoubleSlashes(paths.join("/"));
	normalizePathname = (pathname) => removeTrailingSlash(pathname).replace(/^\/*/, "/");
	normalizeSearch = (search) => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search;
	normalizeHash = (hash) => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash;
	DataWithResponseInit = class {
		constructor(data2, init) {
			this.type = "DataWithResponseInit";
			this.data = data2;
			this.init = init || null;
		}
	};
	redirect = (url, init = 302) => {
		let responseInit = init;
		if (typeof responseInit === "number") responseInit = { status: responseInit };
		else if (typeof responseInit.status === "undefined") responseInit.status = 302;
		let headers = new Headers(responseInit.headers);
		headers.set("Location", url);
		return new Response(null, {
			...responseInit,
			headers
		});
	};
	redirectDocument = (url, init) => {
		let response = redirect(url, init);
		response.headers.set("X-Remix-Reload-Document", "true");
		return response;
	};
	replace = (url, init) => {
		let response = redirect(url, init);
		response.headers.set("X-Remix-Replace", "true");
		return response;
	};
	SUPPORTED_ERROR_TYPES = [
		"EvalError",
		"RangeError",
		"ReferenceError",
		"SyntaxError",
		"TypeError",
		"URIError"
	];
	ErrorResponseImpl = class {
		constructor(status, statusText, data2, internal = false) {
			this.status = status;
			this.statusText = statusText || "";
			this.internal = internal;
			if (data2 instanceof Error) {
				this.data = data2.toString();
				this.error = data2;
			} else this.data = data2;
		}
	};
	isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
	UninstrumentedSymbol = Symbol("Uninstrumented");
	objectProtoNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
	DEFAULT_NAVIGATION_URL = new URL("http://localhost");
	validMutationMethodsArr = [
		"POST",
		"PUT",
		"PATCH",
		"DELETE"
	];
	validMutationMethods = new Set(validMutationMethodsArr);
	validRequestMethodsArr = ["GET", ...validMutationMethodsArr];
	validRequestMethods = new Set(validRequestMethodsArr);
	redirectStatusCodes = /* @__PURE__ */ new Set([
		301,
		302,
		303,
		307,
		308
	]);
	redirectPreserveMethodStatusCodes = /* @__PURE__ */ new Set([307, 308]);
	IDLE_NAVIGATION = {
		state: "idle",
		location: void 0,
		matches: void 0,
		historyAction: void 0,
		formMethod: void 0,
		formAction: void 0,
		formEncType: void 0,
		formData: void 0,
		json: void 0,
		text: void 0
	};
	IDLE_FETCHER = {
		state: "idle",
		data: void 0,
		formMethod: void 0,
		formAction: void 0,
		formEncType: void 0,
		formData: void 0,
		json: void 0,
		text: void 0
	};
	IDLE_BLOCKER = {
		state: "unblocked",
		proceed: void 0,
		reset: void 0,
		location: void 0
	};
	defaultMapRouteProperties = (route) => ({ hasErrorBoundary: Boolean(route.hasErrorBoundary) });
	TRANSITIONS_STORAGE_KEY = "remix-router-transitions";
	ResetLoaderDataSymbol = Symbol("ResetLoaderData");
	DataRoutes = class {
		constructor(routes) {
			__privateAdd(this, _routes);
			__privateAdd(this, _branches);
			__privateAdd(this, _hmrRoutes);
			__privateAdd(this, _hmrBranches);
			__privateSet(this, _routes, routes);
			__privateSet(this, _branches, flattenAndRankRoutes(routes));
		}
		/** The stable route tree */
		get stableRoutes() {
			return __privateGet(this, _routes);
		}
		/** The in-flight route tree if one is active, otherwise the stable tree */
		get activeRoutes() {
			return __privateGet(this, _hmrRoutes) ?? __privateGet(this, _routes);
		}
		/** Pre-computed branches */
		get branches() {
			return __privateGet(this, _hmrBranches) ?? __privateGet(this, _branches);
		}
		get hasHMRRoutes() {
			return __privateGet(this, _hmrRoutes) != null;
		}
		/** Replace the stable route tree and recompute its branches */
		setRoutes(routes) {
			__privateSet(this, _routes, routes);
			__privateSet(this, _branches, flattenAndRankRoutes(routes));
		}
		/** Set a new in-flight route tree and recompute its branches */
		setHmrRoutes(routes) {
			__privateSet(this, _hmrRoutes, routes);
			__privateSet(this, _hmrBranches, flattenAndRankRoutes(routes));
		}
		/** Commit in-flight routes/branches to the stable slot and clear in-flight */
		commitHmrRoutes() {
			if (__privateGet(this, _hmrRoutes)) {
				__privateSet(this, _routes, __privateGet(this, _hmrRoutes));
				__privateSet(this, _branches, __privateGet(this, _hmrBranches));
				__privateSet(this, _hmrRoutes, void 0);
				__privateSet(this, _hmrBranches, void 0);
			}
		}
	};
	_routes = /* @__PURE__ */ new WeakMap();
	_branches = /* @__PURE__ */ new WeakMap();
	_hmrRoutes = /* @__PURE__ */ new WeakMap();
	_hmrBranches = /* @__PURE__ */ new WeakMap();
	lazyRoutePropertyCache = /* @__PURE__ */ new WeakMap();
	loadLazyRouteProperty = ({ key, route, manifest, mapRouteProperties: mapRouteProperties2 }) => {
		let routeToUpdate = manifest[route.id];
		invariant$1(routeToUpdate, "No route found in manifest");
		if (!routeToUpdate.lazy || typeof routeToUpdate.lazy !== "object") return;
		let lazyFn = routeToUpdate.lazy[key];
		if (!lazyFn) return;
		let cache = lazyRoutePropertyCache.get(routeToUpdate);
		if (!cache) {
			cache = {};
			lazyRoutePropertyCache.set(routeToUpdate, cache);
		}
		let cachedPromise = cache[key];
		if (cachedPromise) return cachedPromise;
		let propertyPromise = (async () => {
			let isUnsupported = isUnsupportedLazyRouteObjectKey(key);
			let isStaticallyDefined = routeToUpdate[key] !== void 0 && key !== "hasErrorBoundary";
			if (isUnsupported) {
				warning(!isUnsupported, "Route property " + key + " is not a supported lazy route property. This property will be ignored.");
				cache[key] = Promise.resolve();
			} else if (isStaticallyDefined) warning(false, `Route "${routeToUpdate.id}" has a static property "${key}" defined. The lazy property will be ignored.`);
			else {
				let value = await lazyFn();
				if (value != null) {
					Object.assign(routeToUpdate, { [key]: value });
					Object.assign(routeToUpdate, mapRouteProperties2(routeToUpdate));
				}
			}
			if (typeof routeToUpdate.lazy === "object") {
				routeToUpdate.lazy[key] = void 0;
				if (Object.values(routeToUpdate.lazy).every((value) => value === void 0)) routeToUpdate.lazy = void 0;
			}
		})();
		cache[key] = propertyPromise;
		return propertyPromise;
	};
	lazyRouteFunctionCache = /* @__PURE__ */ new WeakMap();
	invalidProtocols = [
		"about:",
		"blob:",
		"chrome:",
		"chrome-untrusted:",
		"content:",
		"data:",
		"devtools:",
		"file:",
		"filesystem:",
		"javascript:"
	];
	DataRouterContext = React.createContext(null);
	DataRouterContext.displayName = "DataRouter";
	DataRouterStateContext = React.createContext(null);
	DataRouterStateContext.displayName = "DataRouterState";
	RSCRouterContext = React.createContext(false);
	ViewTransitionContext = React.createContext({ isTransitioning: false });
	ViewTransitionContext.displayName = "ViewTransition";
	FetchersContext = React.createContext(/* @__PURE__ */ new Map());
	FetchersContext.displayName = "Fetchers";
	AwaitContext = React.createContext(null);
	AwaitContext.displayName = "Await";
	AwaitContextProvider = (props) => React.createElement(AwaitContext.Provider, props);
	NavigationContext = React.createContext(null);
	NavigationContext.displayName = "Navigation";
	LocationContext = React.createContext(null);
	LocationContext.displayName = "Location";
	RouteContext = React.createContext({
		outlet: null,
		matches: [],
		isDataRoute: false
	});
	RouteContext.displayName = "Route";
	RouteErrorContext = React.createContext(null);
	RouteErrorContext.displayName = "RouteError";
	ERROR_DIGEST_BASE = "REACT_ROUTER_ERROR";
	ERROR_DIGEST_REDIRECT = "REDIRECT";
	ERROR_DIGEST_ROUTE_ERROR_RESPONSE = "ROUTE_ERROR_RESPONSE";
	navigateEffectWarning = `You should call navigate() in a React.useEffect(), not when your component is first rendered.`;
	OutletContext = React.createContext(null);
	defaultErrorElement = /* @__PURE__ */ React.createElement(DefaultErrorComponent, null);
	RenderErrorBoundary = class extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				location: props.location,
				revalidation: props.revalidation,
				error: props.error
			};
		}
		static getDerivedStateFromError(error) {
			return { error };
		}
		static getDerivedStateFromProps(props, state) {
			if (state.location !== props.location || state.revalidation !== "idle" && props.revalidation === "idle") return {
				error: props.error,
				location: props.location,
				revalidation: props.revalidation
			};
			return {
				error: props.error !== void 0 ? props.error : state.error,
				location: state.location,
				revalidation: props.revalidation || state.revalidation
			};
		}
		componentDidCatch(error, errorInfo) {
			if (this.props.onError) this.props.onError(error, errorInfo);
			else console.error("React Router caught the following error during render", error);
		}
		render() {
			let error = this.state.error;
			if (this.context && typeof error === "object" && error && "digest" in error && typeof error.digest === "string") {
				const decoded = decodeRouteErrorResponseDigest(error.digest);
				if (decoded) error = decoded;
			}
			let result = error !== void 0 ? /* @__PURE__ */ React.createElement(RouteContext.Provider, { value: this.props.routeContext }, /* @__PURE__ */ React.createElement(RouteErrorContext.Provider, {
				value: error,
				children: this.props.component
			})) : this.props.children;
			if (this.context) return /* @__PURE__ */ React.createElement(RSCErrorHandler, { error }, result);
			return result;
		}
	};
	RenderErrorBoundary.contextType = RSCRouterContext;
	errorRedirectHandledMap = /* @__PURE__ */ new WeakMap();
	blockerId = 0;
	alreadyWarned = {};
	alreadyWarned2 = {};
	useOptimisticImpl = React["useOptimistic"];
	stableUseOptimisticSetter = () => void 0;
	hydrationRouteProperties = ["HydrateFallback", "hydrateFallbackElement"];
	Deferred = class {
		constructor() {
			this.status = "pending";
			this.promise = new Promise((resolve, reject) => {
				this.resolve = (value) => {
					if (this.status === "pending") {
						this.status = "resolved";
						resolve(value);
					}
				};
				this.reject = (reason) => {
					if (this.status === "pending") {
						this.status = "rejected";
						reject(reason);
					}
				};
			});
		}
	};
	MemoizedDataRoutes = React.memo(DataRoutes2);
	AwaitErrorBoundary = class extends React.Component {
		constructor(props) {
			super(props);
			this.state = { error: null };
		}
		static getDerivedStateFromError(error) {
			return { error };
		}
		componentDidCatch(error, errorInfo) {
			if (this.props.onError) this.props.onError(error, errorInfo);
			else console.error("<Await> caught the following error during render", error, errorInfo);
		}
		render() {
			let { children, errorElement, resolve } = this.props;
			let promise = null;
			let status = 0;
			if (!(resolve instanceof Promise)) {
				status = 1;
				promise = Promise.resolve();
				Object.defineProperty(promise, "_tracked", { get: () => true });
				Object.defineProperty(promise, "_data", { get: () => resolve });
			} else if (this.state.error) {
				status = 2;
				let renderError = this.state.error;
				promise = Promise.reject().catch(() => {});
				Object.defineProperty(promise, "_tracked", { get: () => true });
				Object.defineProperty(promise, "_error", { get: () => renderError });
			} else if (resolve._tracked) {
				promise = resolve;
				status = "_error" in promise ? 2 : "_data" in promise ? 1 : 0;
			} else {
				status = 0;
				Object.defineProperty(resolve, "_tracked", { get: () => true });
				promise = resolve.then((data2) => Object.defineProperty(resolve, "_data", { get: () => data2 }), (error) => {
					this.props.onError?.(error);
					Object.defineProperty(resolve, "_error", { get: () => error });
				});
			}
			if (status === 2 && !errorElement) throw promise._error;
			if (status === 2) return /* @__PURE__ */ React.createElement(AwaitContext.Provider, {
				value: promise,
				children: errorElement
			});
			if (status === 1) return /* @__PURE__ */ React.createElement(AwaitContext.Provider, {
				value: promise,
				children
			});
			throw promise;
		}
	};
	createRoutesFromElements = createRoutesFromChildren;
	defaultMethod = "get";
	defaultEncType = "application/x-www-form-urlencoded";
	_formDataSupportsSubmitter = null;
	supportedFormEncTypes = /* @__PURE__ */ new Set([
		"application/x-www-form-urlencoded",
		"multipart/form-data",
		"text/plain"
	]);
	HOLE = -1;
	NAN = -2;
	NEGATIVE_INFINITY = -3;
	NEGATIVE_ZERO = -4;
	NULL = -5;
	POSITIVE_INFINITY = -6;
	UNDEFINED = -7;
	TYPE_BIGINT = "B";
	TYPE_DATE = "D";
	TYPE_ERROR = "E";
	TYPE_MAP = "M";
	TYPE_NULL_OBJECT = "N";
	TYPE_PROMISE = "P";
	TYPE_REGEXP = "R";
	TYPE_SET = "S";
	TYPE_SYMBOL = "Y";
	TYPE_URL = "U";
	TYPE_PREVIOUS_RESOLVED = "Z";
	Deferred2 = class {
		constructor() {
			this.promise = new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
			});
		}
	};
	TIME_LIMIT_MS = 1;
	getNow = () => Date.now();
	yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 0));
	objectProtoNames2 = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
	globalObj = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : void 0;
	ESCAPE_LOOKUP = {
		"&": "\\u0026",
		">": "\\u003e",
		"<": "\\u003c",
		"\u2028": "\\u2028",
		"\u2029": "\\u2029"
	};
	ESCAPE_REGEX = /[&><\u2028\u2029]/g;
	SingleFetchRedirectSymbol = Symbol("SingleFetchRedirect");
	SingleFetchNoResultError = class extends Error {};
	NO_BODY_STATUS_CODES = /* @__PURE__ */ new Set([
		100,
		101,
		204,
		205
	]);
	nextPaths$1 = /* @__PURE__ */ new Set();
	discoveredPathsMaxSize$1 = 1e3;
	discoveredPaths$1 = /* @__PURE__ */ new Set();
	MANIFEST_VERSION_STORAGE_KEY = "react-router-manifest-version";
	FrameworkContext = React.createContext(void 0);
	FrameworkContext.displayName = "FrameworkContext";
	CRITICAL_CSS_DATA_ATTRIBUTE = "data-react-router-critical-css";
	isHydrated = false;
	RemixErrorBoundary = class extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				error: props.error || null,
				location: props.location
			};
		}
		static getDerivedStateFromError(error) {
			return { error };
		}
		static getDerivedStateFromProps(props, state) {
			if (state.location !== props.location) return {
				error: props.error || null,
				location: props.location
			};
			return {
				error: props.error || state.error,
				location: state.location
			};
		}
		render() {
			if (this.state.error) return /* @__PURE__ */ React.createElement(RemixRootDefaultErrorBoundary, {
				error: this.state.error,
				isOutsideRemixApp: true
			});
			else return this.props.children;
		}
	};
	isBrowser2 = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
	try {
		if (isBrowser2) window.__reactRouterVersion = "7.18.4";
	} catch (e) {}
	HistoryRouter.displayName = "unstable_HistoryRouter";
	Link$8 = React.forwardRef(function LinkWithRef({ onClick, discover = "render", prefetch = "none", relative, reloadDocument, replace: replace2, mask, state, target, to, preventScrollReset, viewTransition, defaultShouldRevalidate, ...rest }, forwardedRef) {
		let { basename, navigator, useTransitions } = React.useContext(NavigationContext);
		let isAbsolute = typeof to === "string" && ABSOLUTE_URL_REGEX.test(to);
		let parsed = parseToInfo(to, basename);
		to = parsed.to;
		let href = useHref(to, { relative });
		let location = useLocation$1();
		let maskedHref = null;
		if (mask) {
			let resolved = resolveTo(mask, [], location.mask ? location.mask.pathname : "/", true);
			if (basename !== "/") resolved.pathname = resolved.pathname === "/" ? basename : joinPaths([basename, resolved.pathname]);
			maskedHref = navigator.createHref(resolved);
		}
		let [shouldPrefetch, prefetchRef, prefetchHandlers] = usePrefetchBehavior(prefetch, rest);
		let internalOnClick = useLinkClickHandler(to, {
			replace: replace2,
			mask,
			state,
			target,
			preventScrollReset,
			relative,
			viewTransition,
			defaultShouldRevalidate,
			useTransitions
		});
		function handleClick(event) {
			if (onClick) onClick(event);
			if (!event.defaultPrevented) internalOnClick(event);
		}
		let isSpaLink = !(parsed.isExternal || reloadDocument);
		let link = /* @__PURE__ */ React.createElement("a", {
			...rest,
			...prefetchHandlers,
			href: (isSpaLink ? maskedHref : void 0) || parsed.absoluteURL || href,
			onClick: isSpaLink ? handleClick : onClick,
			ref: mergeRefs(forwardedRef, prefetchRef),
			target,
			"data-discover": !isAbsolute && discover === "render" ? "true" : void 0
		});
		return shouldPrefetch && !isAbsolute ? /* @__PURE__ */ React.createElement(React.Fragment, null, link, /* @__PURE__ */ React.createElement(PrefetchPageLinks, { page: href })) : link;
	});
	Link$8.displayName = "Link";
	NavLink$1 = React.forwardRef(function NavLinkWithRef({ "aria-current": ariaCurrentProp = "page", caseSensitive = false, className: classNameProp = "", end = false, style: styleProp, to, viewTransition, children, ...rest }, ref) {
		let path = useResolvedPath(to, { relative: rest.relative });
		let location = useLocation$1();
		let routerState = React.useContext(DataRouterStateContext);
		let { navigator, basename } = React.useContext(NavigationContext);
		let isTransitioning = routerState != null && useViewTransitionState(path) && viewTransition === true;
		let toPathname = navigator.encodeLocation ? navigator.encodeLocation(path).pathname : path.pathname;
		let locationPathname = location.pathname;
		let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
		if (!caseSensitive) {
			locationPathname = locationPathname.toLowerCase();
			nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
			toPathname = toPathname.toLowerCase();
		}
		if (nextLocationPathname && basename) nextLocationPathname = stripBasename(nextLocationPathname, basename) || nextLocationPathname;
		const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
		let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(endSlashPosition) === "/";
		let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
		let renderProps = {
			isActive,
			isPending,
			isTransitioning
		};
		let ariaCurrent = isActive ? ariaCurrentProp : void 0;
		let className;
		if (typeof classNameProp === "function") className = classNameProp(renderProps);
		else className = [
			classNameProp,
			isActive ? "active" : null,
			isPending ? "pending" : null,
			isTransitioning ? "transitioning" : null
		].filter(Boolean).join(" ");
		let style = typeof styleProp === "function" ? styleProp(renderProps) : styleProp;
		return /* @__PURE__ */ React.createElement(Link$8, {
			...rest,
			"aria-current": ariaCurrent,
			className,
			ref,
			style,
			to,
			viewTransition
		}, typeof children === "function" ? children(renderProps) : children);
	});
	NavLink$1.displayName = "NavLink";
	Form = React.forwardRef(({ discover = "render", fetcherKey, navigate, reloadDocument, replace: replace2, state, method = defaultMethod, action, onSubmit, relative, preventScrollReset, viewTransition, defaultShouldRevalidate, ...props }, forwardedRef) => {
		let { useTransitions } = React.useContext(NavigationContext);
		let submit = useSubmit();
		let formAction = useFormAction(action, { relative });
		let formMethod = method.toLowerCase() === "get" ? "get" : "post";
		let isAbsolute = typeof action === "string" && ABSOLUTE_URL_REGEX.test(action);
		let submitHandler = (event) => {
			onSubmit && onSubmit(event);
			if (event.defaultPrevented) return;
			event.preventDefault();
			let submitter = event.nativeEvent.submitter;
			let submitMethod = submitter?.getAttribute("formmethod") || method;
			let doSubmit = () => submit(submitter || event.currentTarget, {
				fetcherKey,
				method: submitMethod,
				navigate,
				replace: replace2,
				state,
				relative,
				preventScrollReset,
				viewTransition,
				defaultShouldRevalidate
			});
			if (useTransitions && navigate !== false) React.startTransition(() => doSubmit());
			else doSubmit();
		};
		return /* @__PURE__ */ React.createElement("form", {
			ref: forwardedRef,
			method: formMethod,
			action: formAction,
			onSubmit: reloadDocument ? onSubmit : submitHandler,
			...props,
			"data-discover": !isAbsolute && discover === "render" ? "true" : void 0
		});
	});
	Form.displayName = "Form";
	ScrollRestoration.displayName = "ScrollRestoration";
	fetcherId = 0;
	getUniqueFetcherId = () => `__${String(++fetcherId)}__`;
	SCROLL_RESTORATION_STORAGE_KEY = "react-router-scroll-positions";
	savedScrollPositions = {};
}));
//#endregion
//#region node_modules/react-router/dist/development/chunk-H4DAEOV7.mjs
/**
* react-router v7.18.4
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
function ServerRouter({ context, url, nonce }) {
	if (typeof url === "string") url = new URL(url);
	let { manifest, routeModules, criticalCss, serverHandoffString } = context;
	let routes = createServerRoutes(manifest.routes, routeModules, context.future, context.isSpaMode);
	context.staticHandlerContext.loaderData = { ...context.staticHandlerContext.loaderData };
	for (let match of context.staticHandlerContext.matches) {
		let routeId = match.route.id;
		let route = routeModules[routeId];
		let manifestRoute = context.manifest.routes[routeId];
		if (route && manifestRoute && shouldHydrateRouteLoader(routeId, route.clientLoader, manifestRoute.hasLoader, context.isSpaMode) && (route.HydrateFallback || !manifestRoute.hasLoader)) delete context.staticHandlerContext.loaderData[routeId];
	}
	let router = createStaticRouter(routes, context.staticHandlerContext, { branches: context.branches });
	return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FrameworkContext.Provider, { value: {
		manifest,
		routeModules,
		criticalCss,
		serverHandoffString,
		future: context.future,
		ssr: context.ssr,
		isSpaMode: context.isSpaMode,
		routeDiscovery: context.routeDiscovery,
		nonce,
		serializeError: context.serializeError,
		renderMeta: context.renderMeta
	} }, /* @__PURE__ */ React.createElement(RemixErrorBoundary, { location: router.state.location }, /* @__PURE__ */ React.createElement(StaticRouterProvider, {
		router,
		context: context.staticHandlerContext,
		hydrate: false
	}))), context.serverHandoffStream ? /* @__PURE__ */ React.createElement(React.Suspense, null, /* @__PURE__ */ React.createElement(StreamTransfer, {
		context,
		identifier: 0,
		reader: context.serverHandoffStream.getReader(),
		textDecoder: new TextDecoder(),
		nonce
	})) : null);
}
function createRoutesStub(routes, _context) {
	return function RoutesTestStub({ initialEntries, initialIndex, hydrationData, future }) {
		let routerRef = React.useRef();
		let frameworkContextRef = React.useRef();
		if (routerRef.current == null) {
			frameworkContextRef.current = {
				future: {
					v8_passThroughRequests: future?.v8_passThroughRequests === true,
					v8_middleware: future?.v8_middleware === true,
					v8_trailingSlashAwareDataRequests: future?.v8_trailingSlashAwareDataRequests === true
				},
				manifest: {
					routes: {},
					entry: {
						imports: [],
						module: ""
					},
					url: "",
					version: ""
				},
				routeModules: {},
				ssr: false,
				isSpaMode: false,
				routeDiscovery: {
					mode: "lazy",
					manifestPath: "/__manifest"
				}
			};
			routerRef.current = createMemoryRouter(processRoutes(convertRoutesToDataRoutes(routes, (r) => r), _context !== void 0 ? _context : future?.v8_middleware ? new RouterContextProvider() : {}, frameworkContextRef.current.manifest, frameworkContextRef.current.routeModules), {
				initialEntries,
				initialIndex,
				hydrationData
			});
		}
		return /* @__PURE__ */ React.createElement(FrameworkContext.Provider, { value: frameworkContextRef.current }, /* @__PURE__ */ React.createElement(RouterProvider$1, { router: routerRef.current }));
	};
}
function processRoutes(routes, context, manifest, routeModules, parentId) {
	return routes.map((route) => {
		if (!route.id) throw new Error("Expected a route.id in react-router processRoutes() function");
		let newRoute = {
			id: route.id,
			path: route.path,
			index: route.index,
			Component: route.Component ? withComponentProps(route.Component) : void 0,
			HydrateFallback: route.HydrateFallback ? withHydrateFallbackProps(route.HydrateFallback) : void 0,
			ErrorBoundary: route.ErrorBoundary ? withErrorBoundaryProps(route.ErrorBoundary) : void 0,
			action: route.action ? (args) => route.action({
				...args,
				context
			}) : void 0,
			loader: route.loader ? (args) => route.loader({
				...args,
				context
			}) : void 0,
			middleware: route.middleware ? route.middleware.map((mw) => (...args) => mw({
				...args[0],
				context
			}, args[1])) : void 0,
			handle: route.handle,
			shouldRevalidate: route.shouldRevalidate
		};
		let entryRoute = {
			id: route.id,
			path: route.path,
			index: route.index,
			parentId,
			hasAction: route.action != null,
			hasLoader: route.loader != null,
			hasClientAction: false,
			hasClientLoader: false,
			hasClientMiddleware: false,
			hasErrorBoundary: route.ErrorBoundary != null,
			module: "build/stub-path-to-module.js",
			clientActionModule: void 0,
			clientLoaderModule: void 0,
			clientMiddlewareModule: void 0,
			hydrateFallbackModule: void 0
		};
		manifest.routes[newRoute.id] = entryRoute;
		routeModules[route.id] = {
			default: newRoute.Component || Outlet$1,
			ErrorBoundary: newRoute.ErrorBoundary || void 0,
			handle: route.handle,
			links: route.links,
			meta: route.meta,
			shouldRevalidate: route.shouldRevalidate
		};
		if (route.children) newRoute.children = processRoutes(route.children, context, manifest, routeModules, newRoute.id);
		return newRoute;
	});
}
function byteStringToUint8Array(byteString) {
	let array = new Uint8Array(byteString.length);
	for (let i = 0; i < byteString.length; i++) array[i] = byteString.charCodeAt(i);
	return array;
}
async function encodeCookieValue(value, secrets) {
	let encoded = encodeData(value);
	if (secrets.length > 0) encoded = await sign(encoded, secrets[0]);
	return encoded;
}
async function decodeCookieValue(value, secrets) {
	if (secrets.length > 0) {
		for (let secret of secrets) {
			let unsignedValue = await unsign(value, secret);
			if (unsignedValue !== false) return decodeData(unsignedValue);
		}
		return null;
	}
	return decodeData(value);
}
function encodeData(value) {
	return btoa(myUnescape(encodeURIComponent(JSON.stringify(value))));
}
function decodeData(value) {
	try {
		return JSON.parse(decodeURIComponent(myEscape(atob(value))));
	} catch (e) {
		return {};
	}
}
function myEscape(value) {
	let str = value.toString();
	let result = "";
	let index = 0;
	let chr, code;
	while (index < str.length) {
		chr = str.charAt(index++);
		if (/[\w*+\-./@]/.exec(chr)) result += chr;
		else {
			code = chr.charCodeAt(0);
			if (code < 256) result += "%" + hex(code, 2);
			else result += "%u" + hex(code, 4).toUpperCase();
		}
	}
	return result;
}
function hex(code, length) {
	let result = code.toString(16);
	while (result.length < length) result = "0" + result;
	return result;
}
function myUnescape(value) {
	let str = value.toString();
	let result = "";
	let index = 0;
	let chr, part;
	while (index < str.length) {
		chr = str.charAt(index++);
		if (chr === "%") {
			if (str.charAt(index) === "u") {
				part = str.slice(index + 1, index + 5);
				if (/^[\da-f]{4}$/i.exec(part)) {
					result += String.fromCharCode(parseInt(part, 16));
					index += 5;
					continue;
				}
			} else {
				part = str.slice(index, index + 2);
				if (/^[\da-f]{2}$/i.exec(part)) {
					result += String.fromCharCode(parseInt(part, 16));
					index += 2;
					continue;
				}
			}
		}
		result += chr;
	}
	return result;
}
function warnOnceAboutExpiresCookie(name, expires) {
	warnOnce(!expires, `The "${name}" cookie has an "expires" property set. This will cause the expires value to not be updated when the session is committed. Instead, you should set the expires value when serializing the cookie. You can use \`commitSession(session, { expires })\` if using a session storage object, or \`cookie.serialize("value", { expires })\` if you're using the cookie directly.`);
}
function createEntryRouteModules(manifest) {
	return Object.keys(manifest).reduce((memo, routeId) => {
		let route = manifest[routeId];
		if (route) memo[routeId] = route.module;
		return memo;
	}, {});
}
function isServerMode(value) {
	return value === "development" || value === "production" || value === "test";
}
function sanitizeError(error, serverMode) {
	if (error instanceof Error && serverMode !== "development") {
		let sanitized = /* @__PURE__ */ new Error("Unexpected Server Error");
		sanitized.stack = void 0;
		return sanitized;
	}
	return error;
}
function sanitizeErrors(errors, serverMode) {
	return Object.entries(errors).reduce((acc, [routeId, error]) => {
		return Object.assign(acc, { [routeId]: sanitizeError(error, serverMode) });
	}, {});
}
function serializeError(error, serverMode) {
	let sanitized = sanitizeError(error, serverMode);
	return {
		message: sanitized.message,
		stack: sanitized.stack
	};
}
function invariant(value, message) {
	if (value === false || value === null || typeof value === "undefined") {
		console.error("The following error is a bug in React Router; please open an issue! https://github.com/remix-run/react-router/issues/new/choose");
		throw new Error(message);
	}
}
function matchServerRoutes(manifest, dataRoutes, branches, pathname, basename) {
	let matches = matchRoutesImpl(dataRoutes, pathname, basename ?? "/", false, branches);
	if (!matches) return null;
	return matches.map((match) => {
		let route = manifest[match.route.id];
		invariant(route, `Route with id "${match.route.id}" not found in manifest.`);
		return {
			params: match.params,
			pathname: match.pathname,
			route
		};
	});
}
async function callRouteHandler(handler, args, future) {
	let result = await handler({
		request: future.v8_passThroughRequests ? args.request : stripRoutesParam(stripIndexParam(args.request)),
		url: args.url,
		params: args.params,
		context: args.context,
		pattern: args.pattern
	});
	if (isDataWithResponseInit(result) && result.init && result.init.status && isRedirectStatusCode(result.init.status)) throw new Response(null, result.init);
	return result;
}
function stripIndexParam(request) {
	let url = new URL(request.url);
	let indexValues = url.searchParams.getAll("index");
	url.searchParams.delete("index");
	let indexValuesToKeep = [];
	for (let indexValue of indexValues) if (indexValue) indexValuesToKeep.push(indexValue);
	for (let toKeep of indexValuesToKeep) url.searchParams.append("index", toKeep);
	let init = {
		method: request.method,
		body: request.body,
		headers: request.headers,
		signal: request.signal
	};
	if (init.body) init.duplex = "half";
	return new Request(url.href, init);
}
function stripRoutesParam(request) {
	let url = new URL(request.url);
	url.searchParams.delete("_routes");
	let init = {
		method: request.method,
		body: request.body,
		headers: request.headers,
		signal: request.signal
	};
	if (init.body) init.duplex = "half";
	return new Request(url.href, init);
}
function setDevServerHooks(devServerHooks) {
	globalThis[globalDevServerHooksKey] = devServerHooks;
}
function getDevServerHooks() {
	return globalThis[globalDevServerHooksKey];
}
function getBuildTimeHeader(request, headerName) {
	if (typeof process !== "undefined") try {
		if (process.env.hasOwnProperty("IS_RR_BUILD_REQUEST") && process.env.IS_RR_BUILD_REQUEST === "yes") return request.headers.get(headerName);
	} catch (e) {}
	return null;
}
function groupRoutesByParentId(manifest) {
	let routes = {};
	Object.values(manifest).forEach((route) => {
		if (route) {
			let parentId = route.parentId || "";
			if (!routes[parentId]) routes[parentId] = [];
			routes[parentId].push(route);
		}
	});
	return routes;
}
function createStaticHandlerDataRoutes(manifest, future, parentId = "", routesByParentId = groupRoutesByParentId(manifest)) {
	return (routesByParentId[parentId] || []).map((route) => {
		let commonRoute = {
			hasErrorBoundary: route.id === "root" || route.module.ErrorBoundary != null,
			id: route.id,
			path: route.path,
			middleware: route.module.middleware,
			loader: route.module.loader ? async (args) => {
				let preRenderedData = getBuildTimeHeader(args.request, "X-React-Router-Prerender-Data");
				if (preRenderedData != null) {
					let encoded = preRenderedData ? decodeURI(preRenderedData) : preRenderedData;
					invariant(encoded, "Missing prerendered data for route");
					let uint8array = new TextEncoder().encode(encoded);
					let data2 = (await decodeViaTurboStream(new ReadableStream({ start(controller) {
						controller.enqueue(uint8array);
						controller.close();
					} }), global)).value;
					if (data2 && SingleFetchRedirectSymbol in data2) {
						let result = data2[SingleFetchRedirectSymbol];
						let init = { status: result.status };
						if (result.reload) throw redirectDocument(result.redirect, init);
						else if (result.replace) throw replace(result.redirect, init);
						else throw redirect(result.redirect, init);
					} else {
						invariant(data2 && route.id in data2, "Unable to decode prerendered data");
						let result = data2[route.id];
						invariant("data" in result, "Unable to process prerendered data");
						return result.data;
					}
				}
				return await callRouteHandler(route.module.loader, args, future);
			} : void 0,
			action: route.module.action ? (args) => callRouteHandler(route.module.action, args, future) : void 0,
			handle: route.module.handle
		};
		return route.index ? {
			index: true,
			...commonRoute
		} : {
			caseSensitive: route.caseSensitive,
			children: createStaticHandlerDataRoutes(manifest, future, route.id, routesByParentId),
			...commonRoute
		};
	});
}
function createServerHandoffString(serverHandoff) {
	return escapeHtml(JSON.stringify(serverHandoff));
}
function getDocumentHeaders(context, build) {
	return getDocumentHeadersImpl(context, (m) => {
		let route = build.routes[m.route.id];
		invariant(route, `Route with id "${m.route.id}" not found in build`);
		return route.module.headers;
	});
}
function getDocumentHeadersImpl(context, getRouteHeadersFn, _defaultHeaders) {
	let boundaryIdx = context.errors ? context.matches.findIndex((m) => context.errors[m.route.id]) : -1;
	let matches = boundaryIdx >= 0 ? context.matches.slice(0, boundaryIdx + 1) : context.matches;
	let errorHeaders;
	if (boundaryIdx >= 0) {
		let { actionHeaders, actionData, loaderHeaders, loaderData } = context;
		context.matches.slice(boundaryIdx).some((match) => {
			let id = match.route.id;
			if (actionHeaders[id] && (!actionData || !actionData.hasOwnProperty(id))) errorHeaders = actionHeaders[id];
			else if (loaderHeaders[id] && !loaderData.hasOwnProperty(id)) errorHeaders = loaderHeaders[id];
			return errorHeaders != null;
		});
	}
	const defaultHeaders = new Headers(_defaultHeaders);
	return matches.reduce((parentHeaders, match, idx) => {
		let { id } = match.route;
		let loaderHeaders = context.loaderHeaders[id] || new Headers();
		let actionHeaders = context.actionHeaders[id] || new Headers();
		let includeErrorHeaders = errorHeaders != null && idx === matches.length - 1;
		let includeErrorCookies = includeErrorHeaders && errorHeaders !== loaderHeaders && errorHeaders !== actionHeaders;
		let headersFn = getRouteHeadersFn(match);
		if (headersFn == null) {
			let headers2 = new Headers(parentHeaders);
			if (includeErrorCookies) prependCookies(errorHeaders, headers2);
			prependCookies(actionHeaders, headers2);
			prependCookies(loaderHeaders, headers2);
			return headers2;
		}
		let headers = new Headers(typeof headersFn === "function" ? headersFn({
			loaderHeaders,
			parentHeaders,
			actionHeaders,
			errorHeaders: includeErrorHeaders ? errorHeaders : void 0
		}) : headersFn);
		if (includeErrorCookies) prependCookies(errorHeaders, headers);
		prependCookies(actionHeaders, headers);
		prependCookies(loaderHeaders, headers);
		prependCookies(parentHeaders, headers);
		return headers;
	}, new Headers(defaultHeaders));
}
function prependCookies(parentHeaders, childHeaders) {
	let parentSetCookieString = parentHeaders.get("Set-Cookie");
	if (parentSetCookieString) {
		let cookies = splitCookiesString(parentSetCookieString);
		let childCookies = new Set(childHeaders.getSetCookie());
		cookies.forEach((cookie) => {
			if (!childCookies.has(cookie)) childHeaders.append("Set-Cookie", cookie);
		});
	}
}
function throwIfPotentialCSRFAttack(request, allowedActionOrigins) {
	let originHeader = request.headers.get("origin");
	let originDomain = null;
	let originUrl = null;
	try {
		if (typeof originHeader === "string" && originHeader !== "null") {
			originUrl = new URL(originHeader);
			originDomain = originUrl.host;
		} else originDomain = originHeader;
	} catch {
		throw new Error(`\`origin\` header is not a valid URL. Aborting the action.`);
	}
	let requestUrl = new URL(request.url);
	let originMatchesRequest = originUrl ? originUrl.origin === requestUrl.origin : originDomain === requestUrl.host;
	if (originDomain && !originMatchesRequest) {
		if (!isAllowedOrigin(originDomain, allowedActionOrigins)) throw new Error("The `request.url` origin does not match `origin` header from a forwarded action request. Aborting the action.");
	}
}
function matchWildcardDomain(domain, pattern) {
	const domainParts = domain.split(".");
	const patternParts = pattern.split(".");
	if (patternParts.length < 1) return false;
	if (domainParts.length < patternParts.length) return false;
	while (patternParts.length) {
		const patternPart = patternParts.pop();
		const domainPart = domainParts.pop();
		switch (patternPart) {
			case "": return false;
			case "*": if (domainPart) continue;
			else return false;
			case "**":
				if (patternParts.length > 0) return false;
				return domainPart !== void 0;
			case void 0:
			default: if (domainPart !== patternPart) return false;
		}
	}
	return domainParts.length === 0;
}
function isAllowedOrigin(originDomain, allowedActionOrigins = []) {
	return allowedActionOrigins.some((allowedOrigin) => allowedOrigin && (allowedOrigin === originDomain || matchWildcardDomain(originDomain, allowedOrigin)));
}
function getNormalizedPath(request, basename, future) {
	basename = basename || "/";
	let url = new URL(request.url);
	let pathname = url.pathname;
	if (future?.v8_trailingSlashAwareDataRequests) {
		if (pathname.endsWith("/_.data")) pathname = pathname.replace(/_\.data$/, "");
		else pathname = pathname.replace(/\.data$/, "");
	} else {
		if (stripBasename(pathname, basename) === "/_root.data") pathname = basename;
		else if (pathname.endsWith(".data")) pathname = pathname.replace(/\.data$/, "");
		if (stripBasename(pathname, basename) !== "/" && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
	}
	let searchParams = new URLSearchParams(url.search);
	searchParams.delete("_routes");
	let search = searchParams.toString();
	if (search) search = `?${search}`;
	return {
		pathname,
		search,
		hash: ""
	};
}
async function singleFetchAction(build, serverMode, staticHandler, request, handlerUrl, loadContext, handleError) {
	try {
		try {
			throwIfPotentialCSRFAttack(request, Array.isArray(build.allowedActionOrigins) ? build.allowedActionOrigins : []);
		} catch (e) {
			return handleQueryError(/* @__PURE__ */ new Error("Bad Request"), 400);
		}
		let handlerRequest = build.future.v8_passThroughRequests ? request : new Request(handlerUrl, {
			method: request.method,
			body: request.body,
			headers: request.headers,
			signal: request.signal,
			...request.body ? { duplex: "half" } : void 0
		});
		return handleQueryResult(await staticHandler.query(handlerRequest, {
			requestContext: loadContext,
			skipLoaderErrorBubbling: true,
			skipRevalidation: true,
			generateMiddlewareResponse: build.future.v8_middleware ? async (query) => {
				try {
					return handleQueryResult(await query(handlerRequest));
				} catch (error) {
					return handleQueryError(error);
				}
			} : void 0,
			normalizePath: (r) => getNormalizedPath(r, build.basename, build.future)
		}));
	} catch (error) {
		return handleQueryError(error);
	}
	function handleQueryResult(result) {
		return isResponse(result) ? result : staticContextToResponse(result);
	}
	function handleQueryError(error, status = 500) {
		handleError(error);
		return generateSingleFetchResponse(request, build, serverMode, {
			result: { error },
			headers: new Headers(),
			status
		});
	}
	function staticContextToResponse(context) {
		let headers = getDocumentHeaders(context, build);
		if (isRedirectStatusCode(context.statusCode) && headers.has("Location")) return new Response(null, {
			status: context.statusCode,
			headers
		});
		if (context.errors) {
			Object.values(context.errors).forEach((err) => {
				if (!isRouteErrorResponse(err) || err.error) handleError(err);
			});
			context.errors = sanitizeErrors(context.errors, serverMode);
		}
		let singleFetchResult;
		if (context.errors) singleFetchResult = { error: Object.values(context.errors)[0] };
		else singleFetchResult = { data: Object.values(context.actionData || {})[0] };
		return generateSingleFetchResponse(request, build, serverMode, {
			result: singleFetchResult,
			headers,
			status: context.statusCode
		});
	}
}
async function singleFetchLoaders(build, serverMode, staticHandler, request, handlerUrl, loadContext, handleError) {
	let routesParam = new URL(request.url).searchParams.get("_routes");
	let loadRouteIds = routesParam ? new Set(routesParam.split(",")) : null;
	try {
		let handlerRequest = build.future.v8_passThroughRequests ? request : new Request(handlerUrl, {
			headers: request.headers,
			signal: request.signal
		});
		return handleQueryResult(await staticHandler.query(handlerRequest, {
			requestContext: loadContext,
			filterMatchesToLoad: (m) => !loadRouteIds || loadRouteIds.has(m.route.id),
			skipLoaderErrorBubbling: true,
			generateMiddlewareResponse: build.future.v8_middleware ? async (query) => {
				try {
					return handleQueryResult(await query(handlerRequest));
				} catch (error) {
					return handleQueryError(error);
				}
			} : void 0,
			normalizePath: (r) => getNormalizedPath(r, build.basename, build.future)
		}));
	} catch (error) {
		return handleQueryError(error);
	}
	function handleQueryResult(result) {
		return isResponse(result) ? result : staticContextToResponse(result);
	}
	function handleQueryError(error) {
		handleError(error);
		return generateSingleFetchResponse(request, build, serverMode, {
			result: { error },
			headers: new Headers(),
			status: 500
		});
	}
	function staticContextToResponse(context) {
		let headers = getDocumentHeaders(context, build);
		if (isRedirectStatusCode(context.statusCode) && headers.has("Location")) return new Response(null, {
			status: context.statusCode,
			headers
		});
		if (context.errors) {
			Object.values(context.errors).forEach((err) => {
				if (!isRouteErrorResponse(err) || err.error) handleError(err);
			});
			context.errors = sanitizeErrors(context.errors, serverMode);
		}
		let results = {};
		let loadedMatches = new Set(context.matches.filter((m) => loadRouteIds ? loadRouteIds.has(m.route.id) : m.route.loader != null).map((m) => m.route.id));
		if (context.errors) for (let [id, error] of Object.entries(context.errors)) results[id] = { error };
		for (let [id, data2] of Object.entries(context.loaderData)) if (!(id in results) && loadedMatches.has(id)) results[id] = { data: data2 };
		return generateSingleFetchResponse(request, build, serverMode, {
			result: results,
			headers,
			status: context.statusCode
		});
	}
}
function generateSingleFetchResponse(request, build, serverMode, { result, headers, status }) {
	let resultHeaders = new Headers(headers);
	resultHeaders.set("X-Remix-Response", "yes");
	if (SERVER_NO_BODY_STATUS_CODES.has(status)) return new Response(null, {
		status,
		headers: resultHeaders
	});
	resultHeaders.set("Content-Type", "text/x-script");
	resultHeaders.delete("Content-Length");
	return new Response(encodeViaTurboStream(result, request.signal, build.entry.module.streamTimeout, serverMode), {
		status: status || 200,
		headers: resultHeaders
	});
}
function generateSingleFetchRedirectResponse(redirectResponse, request, build, serverMode) {
	let redirect2 = getSingleFetchRedirect(redirectResponse.status, redirectResponse.headers, build.basename);
	let headers = new Headers(redirectResponse.headers);
	headers.delete("Location");
	headers.set("Content-Type", "text/x-script");
	return generateSingleFetchResponse(request, build, serverMode, {
		result: request.method === "GET" ? { [SingleFetchRedirectSymbol]: redirect2 } : redirect2,
		headers,
		status: 202
	});
}
function getSingleFetchRedirect(status, headers, basename) {
	let redirect2 = headers.get("Location");
	if (basename) redirect2 = stripBasename(redirect2, basename) || redirect2;
	return {
		redirect: redirect2,
		status,
		revalidate: headers.has("X-Remix-Revalidate") || headers.has("Set-Cookie"),
		reload: headers.has("X-Remix-Reload-Document"),
		replace: headers.has("X-Remix-Replace")
	};
}
function encodeViaTurboStream(data2, requestSignal, streamTimeout, serverMode) {
	let controller = new AbortController();
	let timeoutId = setTimeout(() => {
		controller.abort(/* @__PURE__ */ new Error("Server Timeout"));
		cleanupCallbacks();
	}, typeof streamTimeout === "number" ? streamTimeout : 4950);
	let abortControllerOnRequestAbort = () => {
		controller.abort(requestSignal.reason);
		cleanupCallbacks();
	};
	requestSignal.addEventListener("abort", abortControllerOnRequestAbort);
	let cleanupCallbacks = () => {
		clearTimeout(timeoutId);
		requestSignal.removeEventListener("abort", abortControllerOnRequestAbort);
	};
	return encode(data2, {
		signal: controller.signal,
		onComplete: cleanupCallbacks,
		plugins: [(value) => {
			if (value instanceof Error) {
				let { name, message, stack } = serverMode === "production" ? sanitizeError(value, serverMode) : value;
				return [
					"SanitizedError",
					name,
					message,
					stack
				];
			}
			if (value instanceof ErrorResponseImpl) {
				let { data: data3, status, statusText } = value;
				return [
					"ErrorResponse",
					data3,
					status,
					statusText
				];
			}
			if (value && typeof value === "object" && SingleFetchRedirectSymbol in value) return ["SingleFetchRedirect", value[SingleFetchRedirectSymbol]];
		}],
		postPlugins: [(value) => {
			if (!value) return;
			if (typeof value !== "object") return;
			return ["SingleFetchClassInstance", Object.fromEntries(Object.entries(value))];
		}, () => ["SingleFetchFallback"]]
	});
}
function derive(build, mode) {
	let dataRoutes = createStaticHandlerDataRoutes(build.routes, build.future);
	let serverMode = isServerMode(mode) ? mode : "production";
	let staticHandler = createStaticHandler(dataRoutes, {
		basename: build.basename,
		instrumentations: build.entry.module.instrumentations,
		future: build.future
	});
	let errorHandler = build.entry.module.handleError || ((error, { request }) => {
		if (serverMode !== "test" && !request.signal.aborted) console.error(isRouteErrorResponse(error) && error.error ? error.error : error);
	});
	let requestHandler = async (request, initialContext) => {
		let params = {};
		let loadContext;
		let handleError = (error) => {
			if (mode === "development") getDevServerHooks()?.processRequestError?.(error);
			errorHandler(error, {
				context: loadContext,
				params,
				request
			});
		};
		if (build.future.v8_middleware) {
			if (initialContext && !(initialContext instanceof RouterContextProvider)) {
				let error = /* @__PURE__ */ new Error("Invalid `context` value provided to `handleRequest`. When middleware is enabled you must return an instance of `RouterContextProvider` from your `getLoadContext` function.");
				handleError(error);
				return returnLastResortErrorResponse(error, serverMode);
			}
			loadContext = initialContext || new RouterContextProvider();
		} else loadContext = initialContext || {};
		let requestUrl = new URL(request.url);
		let normalizedPathname = getNormalizedPath(request, build.basename, build.future).pathname;
		let isSpaMode = getBuildTimeHeader(request, "X-React-Router-SPA-Mode") === "yes";
		if (!build.ssr) {
			let decodedPath = decodeURI(normalizedPathname);
			if (build.basename && build.basename !== "/") {
				let strippedPath = stripBasename(decodedPath, build.basename);
				if (strippedPath == null) {
					errorHandler(new ErrorResponseImpl(404, "Not Found", `Refusing to prerender the \`${decodedPath}\` path because it does not start with the basename \`${build.basename}\``), {
						context: loadContext,
						params,
						request
					});
					return new Response("Not Found", {
						status: 404,
						statusText: "Not Found"
					});
				}
				decodedPath = strippedPath;
			}
			if (build.prerender.length === 0) isSpaMode = true;
			else if (!build.prerender.includes(decodedPath.replace(/\/$/, "")) && !build.prerender.includes(decodedPath.replace(/[^/]$/, "/"))) {
				if (requestUrl.pathname.endsWith(".data")) {
					errorHandler(new ErrorResponseImpl(404, "Not Found", `Refusing to SSR the path \`${decodedPath}\` because \`ssr:false\` is set and the path is not included in the \`prerender\` config, so in production the path will be a 404.`), {
						context: loadContext,
						params,
						request
					});
					return new Response("Not Found", {
						status: 404,
						statusText: "Not Found"
					});
				} else isSpaMode = true;
			}
		}
		let manifestUrl = getManifestPath(build.routeDiscovery.manifestPath, build.basename);
		if (build.routeDiscovery.mode === "lazy" && requestUrl.pathname === manifestUrl) try {
			return await handleManifestRequest(build, staticHandler.dataRoutes, staticHandler._internalRouteBranches, requestUrl);
		} catch (e) {
			handleError(e);
			return new Response("Unknown Server Error", { status: 500 });
		}
		let matches = matchServerRoutes(build.routes, staticHandler.dataRoutes, staticHandler._internalRouteBranches, normalizedPathname, build.basename);
		if (matches && matches.length > 0) Object.assign(params, matches[0].params);
		let response;
		if (requestUrl.pathname.endsWith(".data")) {
			response = await handleSingleFetchRequest(serverMode, build, staticHandler, request, normalizedPathname, loadContext, handleError);
			if (isRedirectResponse(response)) response = generateSingleFetchRedirectResponse(response, request, build, serverMode);
			if (build.entry.module.handleDataRequest) {
				response = await build.entry.module.handleDataRequest(response, {
					context: loadContext,
					params: matches ? matches[0].params : {},
					request
				});
				if (isRedirectResponse(response)) response = generateSingleFetchRedirectResponse(response, request, build, serverMode);
			}
		} else if (!isSpaMode && matches && matches[matches.length - 1].route.module.default == null && matches[matches.length - 1].route.module.ErrorBoundary == null) response = await handleResourceRequest(serverMode, build, staticHandler, matches.slice(-1)[0].route.id, request, loadContext, handleError);
		else {
			let { pathname } = requestUrl;
			let criticalCss = void 0;
			if (build.unstable_getCriticalCss) criticalCss = await build.unstable_getCriticalCss({ pathname });
			else if (mode === "development" && getDevServerHooks()?.getCriticalCss) criticalCss = await getDevServerHooks()?.getCriticalCss?.(pathname);
			response = await handleDocumentRequest(serverMode, build, staticHandler, request, loadContext, handleError, isSpaMode, criticalCss);
		}
		if (request.method === "HEAD") return new Response(null, {
			headers: response.headers,
			status: response.status,
			statusText: response.statusText
		});
		return response;
	};
	if (build.entry.module.instrumentations) requestHandler = instrumentHandler(requestHandler, build.entry.module.instrumentations.map((i) => i.handler).filter(Boolean));
	return {
		serverMode,
		staticHandler,
		errorHandler,
		requestHandler
	};
}
async function handleManifestRequest(build, dataRoutes, branches, url) {
	if (url.toString().length > 7680) return new Response(null, {
		statusText: "Bad Request",
		status: 400
	});
	if (build.assets.version !== url.searchParams.get("version")) return new Response(null, {
		status: 204,
		headers: { "X-Remix-Reload-Document": "true" }
	});
	let patches = {};
	if (url.searchParams.has("paths")) {
		let pathParam = url.searchParams.get("paths") || "";
		let paths = new Set(pathParam.split(",").filter(Boolean));
		for (let path of paths) {
			if (!path.startsWith("/")) path = `/${path}`;
			let matches = matchServerRoutes(build.routes, dataRoutes, branches, path, build.basename);
			if (matches) for (let match of matches) {
				let routeId = match.route.id;
				let route = build.assets.routes[routeId];
				if (route) patches[routeId] = route;
			}
		}
		return Response.json(patches, { headers: { "Cache-Control": "public, max-age=31536000, immutable" } });
	}
	return new Response("Invalid Request", { status: 400 });
}
async function handleSingleFetchRequest(serverMode, build, staticHandler, request, normalizedPath, loadContext, handleError) {
	let handlerUrl = new URL(request.url);
	handlerUrl.pathname = normalizedPath;
	return isMutationMethod(request.method) ? await singleFetchAction(build, serverMode, staticHandler, request, handlerUrl, loadContext, handleError) : await singleFetchLoaders(build, serverMode, staticHandler, request, handlerUrl, loadContext, handleError);
}
async function handleDocumentRequest(serverMode, build, staticHandler, request, loadContext, handleError, isSpaMode, criticalCss) {
	try {
		if (isMutationMethod(request.method)) try {
			throwIfPotentialCSRFAttack(request, Array.isArray(build.allowedActionOrigins) ? build.allowedActionOrigins : []);
		} catch (e) {
			handleError(e);
			return new Response("Bad Request", { status: 400 });
		}
		let result = await staticHandler.query(request, {
			requestContext: loadContext,
			generateMiddlewareResponse: build.future.v8_middleware ? async (query) => {
				try {
					let innerResult = await query(request);
					if (!isResponse(innerResult)) innerResult = await renderHtml(innerResult, isSpaMode);
					return innerResult;
				} catch (error) {
					handleError(error);
					return new Response(null, { status: 500 });
				}
			} : void 0,
			normalizePath: (r) => getNormalizedPath(r, build.basename, build.future)
		});
		if (!isResponse(result)) result = await renderHtml(result, isSpaMode);
		return result;
	} catch (error) {
		handleError(error);
		return new Response(null, { status: 500 });
	}
	async function renderHtml(context, isSpaMode2) {
		let headers = getDocumentHeaders(context, build);
		if (SERVER_NO_BODY_STATUS_CODES.has(context.statusCode)) return new Response(null, {
			status: context.statusCode,
			headers
		});
		if (context.errors) {
			Object.values(context.errors).forEach((err) => {
				if (!isRouteErrorResponse(err) || err.error) handleError(err);
			});
			context.errors = sanitizeErrors(context.errors, serverMode);
		}
		let state = {
			loaderData: context.loaderData,
			actionData: context.actionData,
			errors: context.errors
		};
		let baseServerHandoff = {
			basename: build.basename,
			future: build.future,
			routeDiscovery: build.routeDiscovery,
			ssr: build.ssr,
			isSpaMode: isSpaMode2
		};
		let entryContext = {
			manifest: build.assets,
			branches: staticHandler._internalRouteBranches,
			routeModules: createEntryRouteModules(build.routes),
			staticHandlerContext: context,
			criticalCss,
			serverHandoffString: createServerHandoffString({
				...baseServerHandoff,
				criticalCss
			}),
			serverHandoffStream: encodeViaTurboStream(state, request.signal, build.entry.module.streamTimeout, serverMode),
			renderMeta: {},
			future: build.future,
			ssr: build.ssr,
			routeDiscovery: build.routeDiscovery,
			isSpaMode: isSpaMode2,
			serializeError: (err) => serializeError(err, serverMode)
		};
		let handleDocumentRequestFunction = build.entry.module.default;
		try {
			return await handleDocumentRequestFunction(request, context.statusCode, headers, entryContext, loadContext);
		} catch (error) {
			handleError(error);
			let errorForSecondRender = error;
			if (isResponse(error)) try {
				let data2 = await unwrapResponse(error);
				errorForSecondRender = new ErrorResponseImpl(error.status, error.statusText, data2);
			} catch (e) {}
			context = getStaticContextFromError(staticHandler.dataRoutes, context, errorForSecondRender);
			if (context.errors) context.errors = sanitizeErrors(context.errors, serverMode);
			let state2 = {
				loaderData: context.loaderData,
				actionData: context.actionData,
				errors: context.errors
			};
			entryContext = {
				...entryContext,
				staticHandlerContext: context,
				serverHandoffString: createServerHandoffString(baseServerHandoff),
				serverHandoffStream: encodeViaTurboStream(state2, request.signal, build.entry.module.streamTimeout, serverMode),
				renderMeta: {}
			};
			try {
				return await handleDocumentRequestFunction(request, context.statusCode, headers, entryContext, loadContext);
			} catch (error2) {
				handleError(error2);
				return returnLastResortErrorResponse(error2, serverMode);
			}
		}
	}
}
async function handleResourceRequest(serverMode, build, staticHandler, routeId, request, loadContext, handleError) {
	try {
		return handleQueryRouteResult(await staticHandler.queryRoute(request, {
			routeId,
			requestContext: loadContext,
			generateMiddlewareResponse: build.future.v8_middleware ? async (queryRoute) => {
				try {
					return handleQueryRouteResult(await queryRoute(request));
				} catch (error) {
					return handleQueryRouteError(error);
				}
			} : void 0,
			normalizePath: (r) => getNormalizedPath(r, build.basename, build.future)
		}));
	} catch (error) {
		return handleQueryRouteError(error);
	}
	function handleQueryRouteResult(result) {
		if (isResponse(result)) return result;
		if (typeof result === "string") return new Response(result);
		return Response.json(result);
	}
	function handleQueryRouteError(error) {
		if (isResponse(error)) return error;
		if (isRouteErrorResponse(error)) {
			handleError(error);
			return errorResponseToJson(error, serverMode);
		}
		if (error instanceof Error && error.message === "Expected a response from queryRoute") {
			let newError = /* @__PURE__ */ new Error("Expected a Response to be returned from resource route handler");
			handleError(newError);
			return returnLastResortErrorResponse(newError, serverMode);
		}
		handleError(error);
		return returnLastResortErrorResponse(error, serverMode);
	}
}
function errorResponseToJson(errorResponse, serverMode) {
	return Response.json(serializeError(errorResponse.error || /* @__PURE__ */ new Error("Unexpected Server Error"), serverMode), {
		status: errorResponse.status,
		statusText: errorResponse.statusText
	});
}
function returnLastResortErrorResponse(error, serverMode) {
	let message = "Unexpected Server Error";
	if (serverMode !== "production") message += `

${String(error)}`;
	return new Response(message, {
		status: 500,
		headers: { "Content-Type": "text/plain" }
	});
}
function unwrapResponse(response) {
	let contentType = response.headers.get("Content-Type");
	return contentType && /\bapplication\/json\b/.test(contentType) ? response.body == null ? null : response.json() : response.text();
}
function flash(name) {
	return `__flash_${name}__`;
}
function createSessionStorage({ cookie: cookieArg, createData, readData, updateData, deleteData }) {
	let cookie = isCookie(cookieArg) ? cookieArg : createCookie(cookieArg?.name || "__session", cookieArg);
	warnOnceAboutSigningSessionCookie(cookie);
	return {
		async getSession(cookieHeader, options) {
			let id = cookieHeader && await cookie.parse(cookieHeader, options);
			return createSession(id && await readData(id) || {}, id || "");
		},
		async commitSession(session, options) {
			let { id, data: data2 } = session;
			let expires = options?.maxAge != null ? new Date(Date.now() + options.maxAge * 1e3) : options?.expires != null ? options.expires : cookie.expires;
			if (id) await updateData(id, data2, expires);
			else id = await createData(data2, expires);
			return cookie.serialize(id, options);
		},
		async destroySession(session, options) {
			await deleteData(session.id);
			return cookie.serialize("", {
				...options,
				maxAge: void 0,
				expires: /* @__PURE__ */ new Date(0)
			});
		}
	};
}
function warnOnceAboutSigningSessionCookie(cookie) {
	warnOnce(cookie.isSigned, `The "${cookie.name}" cookie is not signed, but session cookies should be signed to prevent tampering on the client before they are sent back to the server. See https://reactrouter.com/explanation/sessions-and-cookies#signing-cookies for more information.`);
}
function createCookieSessionStorage({ cookie: cookieArg } = {}) {
	let cookie = isCookie(cookieArg) ? cookieArg : createCookie(cookieArg?.name || "__session", cookieArg);
	warnOnceAboutSigningSessionCookie(cookie);
	return {
		async getSession(cookieHeader, options) {
			return createSession(cookieHeader && await cookie.parse(cookieHeader, options) || {});
		},
		async commitSession(session, options) {
			let serializedCookie = await cookie.serialize(session.data, options);
			if (serializedCookie.length > 4096) throw new Error("Cookie length will exceed browser maximum. Length: " + serializedCookie.length);
			return serializedCookie;
		},
		async destroySession(_session, options) {
			return cookie.serialize("", {
				...options,
				maxAge: void 0,
				expires: /* @__PURE__ */ new Date(0)
			});
		}
	};
}
function createMemorySessionStorage({ cookie } = {}) {
	let map = /* @__PURE__ */ new Map();
	return createSessionStorage({
		cookie,
		async createData(data2, expires) {
			let id = Math.random().toString(36).substring(2, 10);
			map.set(id, {
				data: data2,
				expires
			});
			return id;
		},
		async readData(id) {
			if (map.has(id)) {
				let { data: data2, expires } = map.get(id);
				if (!expires || expires > /* @__PURE__ */ new Date()) return data2;
				if (expires) map.delete(id);
			}
			return null;
		},
		async updateData(id, data2, expires) {
			map.set(id, {
				data: data2,
				expires
			});
		},
		async deleteData(id) {
			map.delete(id);
		}
	});
}
function href(path, ...args) {
	let params = args[0];
	let result = trimTrailingSplat(path).replace(/\/:([\w-]+)(\?)?/g, (_, param, questionMark) => {
		const isRequired = questionMark === void 0;
		const value = params?.[param];
		if (isRequired && value === void 0) throw new Error(`Path '${path}' requires param '${param}' but it was not provided`);
		return value === void 0 ? "" : "/" + value;
	});
	if (path.endsWith("*")) {
		const value = params?.["*"];
		if (value !== void 0) result += "/" + value;
	}
	return result || "/";
}
function trimTrailingSplat(path) {
	let i = path.length - 1;
	let char = path[i];
	if (char !== "*" && char !== "/") return path;
	i--;
	for (; i >= 0; i--) if (path[i] !== "/") break;
	return path.slice(0, i + 1);
}
function injectRSCPayload(rscStream) {
	let decoder = new TextDecoder();
	let resolveFlightDataPromise;
	let flightDataPromise = new Promise((resolve) => resolveFlightDataPromise = resolve);
	let startedRSC = false;
	let buffered = [];
	let timeout = null;
	function flushBufferedChunks(controller) {
		for (let chunk of buffered) {
			let buf = decoder.decode(chunk, { stream: true });
			if (buf.endsWith(trailer)) buf = buf.slice(0, -trailer.length);
			controller.enqueue(encoder2.encode(buf));
		}
		buffered.length = 0;
		timeout = null;
	}
	return new TransformStream({
		transform(chunk, controller) {
			buffered.push(chunk);
			if (timeout) return;
			timeout = setTimeout(async () => {
				flushBufferedChunks(controller);
				if (!startedRSC) {
					startedRSC = true;
					writeRSCStream(rscStream, controller).catch((err) => controller.error(err)).then(resolveFlightDataPromise);
				}
			}, 0);
		},
		async flush(controller) {
			await flightDataPromise;
			if (timeout) {
				clearTimeout(timeout);
				flushBufferedChunks(controller);
			}
			controller.enqueue(encoder2.encode("</body></html>"));
		}
	});
}
async function writeRSCStream(rscStream, controller) {
	let decoder = new TextDecoder("utf-8", { fatal: true });
	const reader = rscStream.getReader();
	try {
		let read;
		while ((read = await reader.read()) && !read.done) {
			const chunk = read.value;
			try {
				writeChunk(JSON.stringify(decoder.decode(chunk, { stream: true })), controller);
			} catch (e) {
				writeChunk(`Uint8Array.from(atob(${JSON.stringify(btoa(String.fromCodePoint(...chunk)))}), m => m.codePointAt(0))`, controller);
			}
		}
	} finally {
		reader.releaseLock();
	}
	let remaining = decoder.decode();
	if (remaining.length) writeChunk(JSON.stringify(remaining), controller);
}
function writeChunk(chunk, controller) {
	controller.enqueue(encoder2.encode(`<script>${escapeScript(`(self.__FLIGHT_DATA||=[]).push(${chunk})`)}<\/script>`));
}
function escapeScript(script) {
	return script.replace(/<!--/g, "<\\!--").replace(/<\/(script)/gi, "</\\$1");
}
function ErrorWrapper({ renderAppShell, title, children }) {
	if (!renderAppShell) return children;
	return /* @__PURE__ */ React3.createElement("html", { lang: "en" }, /* @__PURE__ */ React3.createElement("head", null, /* @__PURE__ */ React3.createElement("meta", { charSet: "utf-8" }), /* @__PURE__ */ React3.createElement("meta", {
		name: "viewport",
		content: "width=device-width,initial-scale=1,viewport-fit=cover"
	}), /* @__PURE__ */ React3.createElement("title", null, title)), /* @__PURE__ */ React3.createElement("body", null, /* @__PURE__ */ React3.createElement("main", { style: {
		fontFamily: "system-ui, sans-serif",
		padding: "2rem"
	} }, children)));
}
function RSCDefaultRootErrorBoundaryImpl({ error, renderAppShell }) {
	console.error(error);
	let heyDeveloper = /* @__PURE__ */ React3.createElement("script", { dangerouslySetInnerHTML: { __html: `
        console.log(
          "\u{1F4BF} Hey developer \u{1F44B}. You can provide a way better UX than this when your app throws errors. Check out https://reactrouter.com/how-to/error-boundary for more information."
        );
      ` } });
	if (isRouteErrorResponse(error)) return /* @__PURE__ */ React3.createElement(ErrorWrapper, {
		renderAppShell,
		title: "Unhandled Thrown Response!"
	}, /* @__PURE__ */ React3.createElement("h1", { style: { fontSize: "24px" } }, error.status, " ", error.statusText), heyDeveloper);
	let errorInstance;
	if (error instanceof Error) errorInstance = error;
	else {
		let errorString = error == null ? "Unknown Error" : typeof error === "object" && "toString" in error ? error.toString() : JSON.stringify(error);
		errorInstance = new Error(errorString);
	}
	return /* @__PURE__ */ React3.createElement(ErrorWrapper, {
		renderAppShell,
		title: "Application Error!"
	}, /* @__PURE__ */ React3.createElement("h1", { style: { fontSize: "24px" } }, "Application Error"), /* @__PURE__ */ React3.createElement("pre", { style: {
		padding: "2rem",
		background: "hsla(10, 50%, 50%, 0.1)",
		color: "red",
		overflow: "auto"
	} }, errorInstance.stack), heyDeveloper);
}
function RSCDefaultRootErrorBoundary({ hasRootLayout }) {
	let error = useRouteError();
	if (hasRootLayout === void 0) throw new Error("Missing 'hasRootLayout' prop");
	return /* @__PURE__ */ React3.createElement(RSCDefaultRootErrorBoundaryImpl, {
		renderAppShell: !hasRootLayout,
		error
	});
}
function createRSCRouteModules(payload) {
	const routeModules = {};
	for (const match of payload.matches) populateRSCRouteModules(routeModules, match);
	return routeModules;
}
function populateRSCRouteModules(routeModules, matches) {
	matches = Array.isArray(matches) ? matches : [matches];
	for (const match of matches) routeModules[match.id] = {
		links: match.links,
		meta: match.meta,
		default: noopComponent
	};
}
function useSafe(promise) {
	if (useImpl) return useImpl(promise);
	throw new Error("React Router v7 requires React 19+ for RSC features.");
}
async function routeRSCServerRequest({ request, serverResponse, createFromReadableStream, renderHTML, hydrate = true }) {
	const url = new URL(request.url);
	if (isReactServerRequest(url) || isManifestRequest(url) || request.headers.has("rsc-action-id") || serverResponse.headers.get("React-Router-Resource") === "true") return serverResponse;
	if (!serverResponse.body) throw new Error("Missing body in server response");
	const detectRedirectResponse = serverResponse.clone();
	let serverResponseB = null;
	if (hydrate) serverResponseB = serverResponse.clone();
	const body = serverResponse.body;
	let buffer;
	let streamControllers = [];
	const createStream = () => {
		if (!buffer) {
			buffer = [];
			return body.pipeThrough(new TransformStream({
				transform(chunk, controller) {
					buffer.push(chunk);
					controller.enqueue(chunk);
					streamControllers.forEach((c) => c.enqueue(chunk));
				},
				flush() {
					streamControllers.forEach((c) => c.close());
					streamControllers = [];
				}
			}));
		}
		return new ReadableStream({ start(controller) {
			buffer.forEach((chunk) => controller.enqueue(chunk));
			streamControllers.push(controller);
		} });
	};
	let deepestRenderedBoundaryId = null;
	const getPayload = () => {
		const payloadPromise = Promise.resolve(createFromReadableStream(createStream()));
		return Object.defineProperties(payloadPromise, {
			_deepestRenderedBoundaryId: {
				get() {
					return deepestRenderedBoundaryId;
				},
				set(boundaryId) {
					deepestRenderedBoundaryId = boundaryId;
				}
			},
			formState: { get() {
				return payloadPromise.then((payload) => payload.type === "render" ? payload.formState : void 0);
			} }
		});
	};
	let renderRedirect;
	let renderError;
	try {
		if (!detectRedirectResponse.body) throw new Error("Failed to clone server response");
		const payload = await createFromReadableStream(detectRedirectResponse.body);
		if (serverResponse.status === 202 && payload.type === "redirect") {
			if (hasInvalidProtocol(payload.location)) throw new Error("Invalid redirect location");
			const headers2 = new Headers(serverResponse.headers);
			headers2.delete("Content-Encoding");
			headers2.delete("Content-Length");
			headers2.delete("Content-Type");
			headers2.delete("X-Remix-Response");
			headers2.set("Location", payload.location);
			return new Response(serverResponseB?.body || "", {
				headers: headers2,
				status: payload.status,
				statusText: serverResponse.statusText
			});
		}
		let reactHeaders = new Headers();
		let status = serverResponse.status;
		let statusText = serverResponse.statusText;
		let html = await renderHTML(getPayload, {
			onError(error) {
				if (typeof error === "object" && error && "digest" in error && typeof error.digest === "string") {
					renderRedirect = decodeRedirectErrorDigest(error.digest);
					if (renderRedirect) return error.digest;
					let routeErrorResponse = decodeRouteErrorResponseDigest(error.digest);
					if (routeErrorResponse) {
						renderError = routeErrorResponse;
						status = routeErrorResponse.status;
						statusText = routeErrorResponse.statusText;
						return error.digest;
					}
				}
			},
			onHeaders(headers2) {
				for (const [key, value] of headers2) reactHeaders.append(key, value);
			}
		});
		const headers = new Headers(reactHeaders);
		for (const [key, value] of serverResponse.headers) headers.append(key, value);
		headers.set("Content-Type", "text/html; charset=utf-8");
		if (renderRedirect) {
			if (hasInvalidProtocol(renderRedirect.location)) throw new Error("Invalid redirect location");
			headers.set("Location", renderRedirect.location);
			return new Response(html, {
				status: renderRedirect.status,
				headers
			});
		}
		const redirectTransform = new TransformStream({ flush(controller) {
			if (renderRedirect) {
				if (hasInvalidProtocol(renderRedirect.location)) return;
				controller.enqueue(new TextEncoder().encode(`<meta http-equiv="refresh" content="0;url=${escapeAttribute(renderRedirect.location)}"/>`));
			}
		} });
		if (!hydrate) return new Response(html.pipeThrough(redirectTransform), {
			status,
			statusText,
			headers
		});
		if (!serverResponseB?.body) throw new Error("Failed to clone server response");
		const body2 = html.pipeThrough(injectRSCPayload(serverResponseB.body)).pipeThrough(redirectTransform);
		return new Response(body2, {
			status,
			statusText,
			headers
		});
	} catch (error) {
		if (error instanceof Response) return error;
		if (renderRedirect) {
			if (hasInvalidProtocol(renderRedirect.location)) throw new Error("Invalid redirect location");
			return new Response(`Redirect: ${renderRedirect.location}`, {
				status: renderRedirect.status,
				headers: { Location: renderRedirect.location }
			});
		}
		try {
			let normalizedError = renderError ?? error;
			let [status, statusText] = isRouteErrorResponse(normalizedError) ? [normalizedError.status, normalizedError.statusText] : [500, ""];
			let retryRedirect;
			let reactHeaders = new Headers();
			const html = await renderHTML(() => {
				const payloadPromise = Promise.resolve(createFromReadableStream(createStream())).then((payload) => Object.assign(payload, {
					status,
					errors: deepestRenderedBoundaryId ? { [deepestRenderedBoundaryId]: normalizedError } : {}
				}));
				return Object.defineProperties(payloadPromise, {
					_deepestRenderedBoundaryId: {
						get() {
							return deepestRenderedBoundaryId;
						},
						set(boundaryId) {
							deepestRenderedBoundaryId = boundaryId;
						}
					},
					formState: { get() {
						return payloadPromise.then((payload) => payload.type === "render" ? payload.formState : void 0);
					} }
				});
			}, {
				onError(error2) {
					if (typeof error2 === "object" && error2 && "digest" in error2 && typeof error2.digest === "string") {
						retryRedirect = decodeRedirectErrorDigest(error2.digest);
						if (retryRedirect) return error2.digest;
						let routeErrorResponse = decodeRouteErrorResponseDigest(error2.digest);
						if (routeErrorResponse) {
							status = routeErrorResponse.status;
							statusText = routeErrorResponse.statusText;
							return error2.digest;
						}
					}
				},
				onHeaders(headers2) {
					for (const [key, value] of headers2) reactHeaders.append(key, value);
				}
			});
			const headers = new Headers(reactHeaders);
			for (const [key, value] of serverResponse.headers) headers.append(key, value);
			headers.set("Content-Type", "text/html; charset=utf-8");
			if (retryRedirect) {
				if (hasInvalidProtocol(retryRedirect.location)) throw new Error("Invalid redirect location");
				headers.set("Location", retryRedirect.location);
				return new Response(html, {
					status: retryRedirect.status,
					headers
				});
			}
			const retryRedirectTransform = new TransformStream({ flush(controller) {
				if (retryRedirect) {
					if (hasInvalidProtocol(retryRedirect.location)) return;
					controller.enqueue(new TextEncoder().encode(`<meta http-equiv="refresh" content="0;url=${escapeAttribute(retryRedirect.location)}"/>`));
				}
			} });
			if (!hydrate) return new Response(html.pipeThrough(retryRedirectTransform), {
				status,
				statusText,
				headers
			});
			if (!serverResponseB?.body) throw new Error("Failed to clone server response");
			const body2 = html.pipeThrough(injectRSCPayload(serverResponseB.body)).pipeThrough(retryRedirectTransform);
			return new Response(body2, {
				status,
				statusText,
				headers
			});
		} catch (error2) {}
		throw error;
	}
}
function RSCStaticRouter({ getPayload }) {
	const decoded = getPayload();
	const payload = useSafe(decoded);
	if (payload.type === "redirect") {
		if (hasInvalidProtocol(payload.location)) throw new Error("Invalid redirect location");
		throw new Response(null, {
			status: payload.status,
			headers: { Location: payload.location }
		});
	}
	if (payload.type !== "render") return null;
	let patchedLoaderData = { ...payload.loaderData };
	for (const match of payload.matches) if (shouldHydrateRouteLoader(match.id, match.clientLoader, match.hasLoader, false) && (match.hydrateFallbackElement || !match.hasLoader)) delete patchedLoaderData[match.id];
	const context = {
		get _deepestRenderedBoundaryId() {
			return decoded._deepestRenderedBoundaryId ?? null;
		},
		set _deepestRenderedBoundaryId(boundaryId) {
			decoded._deepestRenderedBoundaryId = boundaryId;
		},
		actionData: payload.actionData,
		actionHeaders: {},
		basename: payload.basename,
		errors: payload.errors,
		loaderData: patchedLoaderData,
		loaderHeaders: {},
		location: payload.location,
		statusCode: 200,
		matches: payload.matches.map((match) => ({
			params: match.params,
			pathname: match.pathname,
			pathnameBase: match.pathnameBase,
			route: {
				id: match.id,
				action: match.hasAction || !!match.clientAction,
				handle: match.handle,
				hasErrorBoundary: match.hasErrorBoundary,
				loader: match.hasLoader || !!match.clientLoader,
				index: match.index,
				path: match.path,
				shouldRevalidate: match.shouldRevalidate
			}
		}))
	};
	const router = createStaticRouter(payload.matches.reduceRight((previous, match) => {
		const route = {
			id: match.id,
			action: match.hasAction || !!match.clientAction,
			element: match.element,
			errorElement: match.errorElement,
			handle: match.handle,
			hasErrorBoundary: !!match.errorElement,
			hydrateFallbackElement: match.hydrateFallbackElement,
			index: match.index,
			loader: match.hasLoader || !!match.clientLoader,
			path: match.path,
			shouldRevalidate: match.shouldRevalidate
		};
		if (previous.length > 0) route.children = previous;
		return [route];
	}, []), context);
	const frameworkContext = {
		future: {
			v8_middleware: false,
			v8_trailingSlashAwareDataRequests: true,
			v8_passThroughRequests: true
		},
		isSpaMode: false,
		ssr: true,
		criticalCss: "",
		manifest: {
			routes: {},
			version: "1",
			url: "",
			entry: {
				module: "",
				imports: []
			}
		},
		routeDiscovery: payload.routeDiscovery.mode === "initial" ? {
			mode: "initial",
			manifestPath: defaultManifestPath$1
		} : {
			mode: "lazy",
			manifestPath: payload.routeDiscovery.manifestPath || defaultManifestPath$1
		},
		routeModules: createRSCRouteModules(payload)
	};
	return /* @__PURE__ */ React.createElement(RSCRouterContext.Provider, { value: true }, /* @__PURE__ */ React.createElement(RSCRouterGlobalErrorBoundary, { location: payload.location }, /* @__PURE__ */ React.createElement(FrameworkContext.Provider, { value: frameworkContext }, /* @__PURE__ */ React.createElement(StaticRouterProvider, {
		context,
		router,
		hydrate: false,
		nonce: payload.nonce
	}))));
}
function isReactServerRequest(url) {
	return url.pathname.endsWith(".rsc");
}
function isManifestRequest(url) {
	return url.pathname.endsWith(".manifest");
}
function getHydrationData({ state, routes, getRouteInfo, location, basename, isSpaMode }) {
	let hydrationData = {
		...state,
		loaderData: { ...state.loaderData }
	};
	let initialMatches = matchRoutes(routes, location, basename);
	if (initialMatches) for (let match of initialMatches) {
		let routeId = match.route.id;
		let routeInfo = getRouteInfo(routeId);
		if (shouldHydrateRouteLoader(routeId, routeInfo.clientLoader, routeInfo.hasLoader, isSpaMode) && (routeInfo.hasHydrateFallback || !routeInfo.hasLoader)) delete hydrationData.loaderData[routeId];
		else if (!routeInfo.hasLoader) hydrationData.loaderData[routeId] = null;
	}
	return hydrationData;
}
var encoder, sign, unsign, createKey, createCookie, isCookie, ServerMode, globalDevServerHooksKey, SERVER_NO_BODY_STATUS_CODES, createRequestHandler, createSession, isSession, encoder2, trailer, RSCRouterGlobalErrorBoundary, noopComponent, defaultManifestPath$1, useImpl;
var init_chunk_H4DAEOV7 = __esmMin((() => {
	init_chunk_OB3PAWPO();
	encoder = /* @__PURE__ */ new TextEncoder();
	sign = async (value, secret) => {
		let data2 = encoder.encode(value);
		let key = await createKey(secret, ["sign"]);
		let signature = await crypto.subtle.sign("HMAC", key, data2);
		let hash = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=+$/, "");
		return value + "." + hash;
	};
	unsign = async (cookie, secret) => {
		let index = cookie.lastIndexOf(".");
		let value = cookie.slice(0, index);
		let hash = cookie.slice(index + 1);
		let data2 = encoder.encode(value);
		let key = await createKey(secret, ["verify"]);
		try {
			let signature = byteStringToUint8Array(atob(hash));
			return await crypto.subtle.verify("HMAC", key, signature, data2) ? value : false;
		} catch (e) {
			return false;
		}
	};
	createKey = async (secret, usages) => crypto.subtle.importKey("raw", encoder.encode(secret), {
		name: "HMAC",
		hash: "SHA-256"
	}, false, usages);
	createCookie = (name, cookieOptions = {}) => {
		let { secrets = [], ...options } = {
			path: "/",
			sameSite: "lax",
			...cookieOptions
		};
		warnOnceAboutExpiresCookie(name, options.expires);
		return {
			get name() {
				return name;
			},
			get isSigned() {
				return secrets.length > 0;
			},
			get expires() {
				return typeof options.maxAge !== "undefined" ? new Date(Date.now() + options.maxAge * 1e3) : options.expires;
			},
			async parse(cookieHeader, parseOptions) {
				if (!cookieHeader) return null;
				let cookies = parse(cookieHeader, {
					...options,
					...parseOptions
				});
				if (name in cookies) {
					let value = cookies[name];
					if (typeof value === "string" && value !== "") return await decodeCookieValue(value, secrets);
					else return "";
				} else return null;
			},
			async serialize(value, serializeOptions) {
				return serialize(name, value === "" ? "" : await encodeCookieValue(value, secrets), {
					...options,
					...serializeOptions
				});
			}
		};
	};
	isCookie = (object) => {
		return object != null && typeof object.name === "string" && typeof object.isSigned === "boolean" && typeof object.parse === "function" && typeof object.serialize === "function";
	};
	ServerMode = /* @__PURE__ */ ((ServerMode2) => {
		ServerMode2["Development"] = "development";
		ServerMode2["Production"] = "production";
		ServerMode2["Test"] = "test";
		return ServerMode2;
	})(ServerMode || {});
	globalDevServerHooksKey = "__reactRouterDevServerHooks";
	SERVER_NO_BODY_STATUS_CODES = /* @__PURE__ */ new Set([...NO_BODY_STATUS_CODES, 304]);
	createRequestHandler = (build, mode) => {
		let _build;
		let serverMode;
		let staticHandler;
		let errorHandler;
		let _requestHandler;
		return async function requestHandler(request, initialContext) {
			_build = typeof build === "function" ? await build() : build;
			if (typeof build === "function") {
				let derived = derive(_build, mode);
				serverMode = derived.serverMode;
				staticHandler = derived.staticHandler;
				errorHandler = derived.errorHandler;
				_requestHandler = derived.requestHandler;
			} else if (!serverMode || !staticHandler || !errorHandler || !_requestHandler) {
				let derived = derive(_build, mode);
				serverMode = derived.serverMode;
				staticHandler = derived.staticHandler;
				errorHandler = derived.errorHandler;
				_requestHandler = derived.requestHandler;
			}
			return _requestHandler(request, initialContext);
		};
	};
	createSession = (initialData = {}, id = "") => {
		let map = new Map(Object.entries(initialData));
		return {
			get id() {
				return id;
			},
			get data() {
				return Object.fromEntries(map);
			},
			has(name) {
				return map.has(name) || map.has(flash(name));
			},
			get(name) {
				if (map.has(name)) return map.get(name);
				let flashName = flash(name);
				if (map.has(flashName)) {
					let value = map.get(flashName);
					map.delete(flashName);
					return value;
				}
			},
			set(name, value) {
				map.set(name, value);
			},
			flash(name, value) {
				map.set(flash(name), value);
			},
			unset(name) {
				map.delete(name);
			}
		};
	};
	isSession = (object) => {
		return object != null && typeof object.id === "string" && typeof object.data !== "undefined" && typeof object.has === "function" && typeof object.get === "function" && typeof object.set === "function" && typeof object.flash === "function" && typeof object.unset === "function";
	};
	encoder2 = new TextEncoder();
	trailer = "</body></html>";
	RSCRouterGlobalErrorBoundary = class extends React3.Component {
		constructor(props) {
			super(props);
			this.state = {
				error: null,
				location: props.location
			};
		}
		static getDerivedStateFromError(error) {
			return { error };
		}
		static getDerivedStateFromProps(props, state) {
			if (state.location !== props.location) return {
				error: null,
				location: props.location
			};
			return {
				error: state.error,
				location: state.location
			};
		}
		render() {
			if (this.state.error) return /* @__PURE__ */ React3.createElement(RSCDefaultRootErrorBoundaryImpl, {
				error: this.state.error,
				renderAppShell: true
			});
			else return this.props.children;
		}
	};
	noopComponent = () => null;
	defaultManifestPath$1 = "/__manifest";
	useImpl = React["use"];
}));
//#endregion
//#region node_modules/react-router/dist/development/dom-export.mjs
/**
* react-router v7.18.4
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
var dom_export_exports = /* @__PURE__ */ __exportAll({
	HydratedRouter: () => HydratedRouter$1,
	RouterProvider: () => RouterProvider2,
	unstable_RSCHydratedRouter: () => RSCHydratedRouter,
	unstable_createCallServer: () => createCallServer,
	unstable_getRSCStream: () => getRSCStream
});
function RouterProvider2(props) {
	return /* @__PURE__ */ React.createElement(RouterProvider$1, {
		flushSync: ReactDOM.flushSync,
		...props
	});
}
function initSsrInfo() {
	if (!ssrInfo && window.__reactRouterContext && window.__reactRouterManifest && window.__reactRouterRouteModules) {
		if (window.__reactRouterManifest.sri === true) {
			const importMap = document.querySelector("script[rr-importmap]");
			if (importMap?.textContent) try {
				window.__reactRouterManifest.sri = JSON.parse(importMap.textContent).integrity;
			} catch (err) {
				console.error("Failed to parse import map", err);
			}
		}
		ssrInfo = {
			context: window.__reactRouterContext,
			manifest: window.__reactRouterManifest,
			routeModules: window.__reactRouterRouteModules,
			stateDecodingPromise: void 0,
			router: void 0,
			routerInitialized: false
		};
	}
}
function createHydratedRouter({ getContext, instrumentations }) {
	initSsrInfo();
	if (!ssrInfo) throw new Error("You must be using the SSR features of React Router in order to skip passing a `router` prop to `<RouterProvider>`");
	let localSsrInfo = ssrInfo;
	if (!ssrInfo.stateDecodingPromise) {
		let stream = ssrInfo.context.stream;
		invariant$1(stream, "No stream found for single fetch decoding");
		ssrInfo.context.stream = void 0;
		ssrInfo.stateDecodingPromise = decodeViaTurboStream(stream, window).then((value) => {
			ssrInfo.context.state = value.value;
			localSsrInfo.stateDecodingPromise.value = true;
		}).catch((e) => {
			localSsrInfo.stateDecodingPromise.error = e;
		});
	}
	if (ssrInfo.stateDecodingPromise.error) throw ssrInfo.stateDecodingPromise.error;
	if (!ssrInfo.stateDecodingPromise.value) throw ssrInfo.stateDecodingPromise;
	let routes = createClientRoutes(ssrInfo.manifest.routes, ssrInfo.routeModules, ssrInfo.context.state, ssrInfo.context.ssr, ssrInfo.context.isSpaMode);
	let hydrationData = void 0;
	if (ssrInfo.context.isSpaMode) {
		let { loaderData } = ssrInfo.context.state;
		if (ssrInfo.manifest.routes.root?.hasLoader && loaderData && "root" in loaderData) hydrationData = { loaderData: { root: loaderData.root } };
	} else hydrationData = getHydrationData({
		state: ssrInfo.context.state,
		routes,
		getRouteInfo: (routeId) => ({
			clientLoader: ssrInfo.routeModules[routeId]?.clientLoader,
			hasLoader: ssrInfo.manifest.routes[routeId]?.hasLoader === true,
			hasHydrateFallback: ssrInfo.routeModules[routeId]?.HydrateFallback != null
		}),
		location: window.location,
		basename: window.__reactRouterContext?.basename,
		isSpaMode: ssrInfo.context.isSpaMode
	});
	if (window.history.state && window.history.state.masked) window.history.replaceState({
		...window.history.state,
		masked: void 0
	}, "");
	let router2 = createRouter({
		routes,
		history: createBrowserHistory(),
		basename: ssrInfo.context.basename,
		getContext,
		hydrationData,
		hydrationRouteProperties,
		instrumentations,
		mapRouteProperties,
		future: { v8_passThroughRequests: ssrInfo.context.future.v8_passThroughRequests },
		dataStrategy: getTurboStreamSingleFetchDataStrategy(() => router2, ssrInfo.manifest, ssrInfo.routeModules, ssrInfo.context.ssr, ssrInfo.context.basename, ssrInfo.context.future.v8_trailingSlashAwareDataRequests),
		patchRoutesOnNavigation: getPatchRoutesOnNavigationFunction(() => router2, ssrInfo.manifest, ssrInfo.routeModules, ssrInfo.context.ssr, ssrInfo.context.routeDiscovery, ssrInfo.context.isSpaMode, ssrInfo.context.basename)
	});
	ssrInfo.router = router2;
	if (router2.state.initialized) {
		ssrInfo.routerInitialized = true;
		router2.initialize();
	}
	router2.createRoutesForHMR = createClientRoutesWithHMRRevalidationOptOut;
	window.__reactRouterDataRouter = router2;
	return router2;
}
function HydratedRouter$1(props) {
	if (!router) router = createHydratedRouter({
		getContext: props.getContext,
		instrumentations: props.instrumentations
	});
	let [criticalCss, setCriticalCss] = React.useState(process.env.NODE_ENV === "development" ? ssrInfo?.context.criticalCss : void 0);
	React.useEffect(() => {
		if (process.env.NODE_ENV === "development") setCriticalCss(void 0);
	}, []);
	React.useEffect(() => {
		if (process.env.NODE_ENV === "development" && criticalCss === void 0) document.querySelectorAll(`[${CRITICAL_CSS_DATA_ATTRIBUTE}]`).forEach((element) => element.remove());
	}, [criticalCss]);
	let [location2, setLocation] = React.useState(router.state.location);
	React.useLayoutEffect(() => {
		if (ssrInfo && ssrInfo.router && !ssrInfo.routerInitialized) {
			ssrInfo.routerInitialized = true;
			ssrInfo.router.initialize();
		}
	}, []);
	React.useLayoutEffect(() => {
		if (ssrInfo && ssrInfo.router) return ssrInfo.router.subscribe((newState) => {
			if (newState.location !== location2) setLocation(newState.location);
		});
	}, [location2]);
	invariant$1(ssrInfo, "ssrInfo unavailable for HydratedRouter");
	useFogOFWarDiscovery(router, ssrInfo.manifest, ssrInfo.routeModules, ssrInfo.context.ssr, ssrInfo.context.routeDiscovery, ssrInfo.context.isSpaMode);
	return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FrameworkContext.Provider, { value: {
		manifest: ssrInfo.manifest,
		routeModules: ssrInfo.routeModules,
		future: ssrInfo.context.future,
		criticalCss,
		ssr: ssrInfo.context.ssr,
		isSpaMode: ssrInfo.context.isSpaMode,
		routeDiscovery: ssrInfo.context.routeDiscovery
	} }, /* @__PURE__ */ React.createElement(RemixErrorBoundary, { location: location2 }, /* @__PURE__ */ React.createElement(RouterProvider2, {
		router,
		useTransitions: props.useTransitions,
		onError: props.onError
	}))), /* @__PURE__ */ React.createElement(React.Fragment, null));
}
function createCallServer({ createFromReadableStream, createTemporaryReferenceSet, encodeReply, fetch: fetchImplementation = fetch }) {
	const globalVar = window;
	let landedActionId = 0;
	return async (id, args) => {
		let actionId = globalVar.__routerActionID = (globalVar.__routerActionID ?? (globalVar.__routerActionID = 0)) + 1;
		const temporaryReferences = createTemporaryReferenceSet();
		const payloadPromise = fetchImplementation(new Request(location.href, {
			body: await encodeReply(args, { temporaryReferences }),
			method: "POST",
			headers: {
				Accept: "text/x-component",
				"rsc-action-id": id
			}
		})).then((response) => {
			if (!response.body) throw new Error("No response body");
			return createFromReadableStream(response.body, { temporaryReferences });
		});
		React.startTransition(() => Promise.resolve(payloadPromise).then(async (payload) => {
			if (payload.type === "redirect") {
				let location2 = normalizeRedirectLocation(payload.location);
				validateNavigationTarget(payload.location, location2, new URL(window.location.href), "allow-explicit");
				if (payload.reload || isExternalLocation(location2)) {
					if (hasInvalidProtocol(location2)) throw new Error("Invalid redirect location");
					window.location.href = location2;
					return;
				}
				React.startTransition(() => {
					globalVar.__reactRouterDataRouter.navigate(location2, { replace: payload.replace });
				});
				return;
			}
			if (payload.type !== "action") throw new Error("Unexpected payload type");
			const rerender = await payload.rerender;
			if (rerender && landedActionId < actionId && globalVar.__routerActionID <= actionId) {
				if (rerender.type === "redirect") {
					let location2 = normalizeRedirectLocation(rerender.location);
					validateNavigationTarget(rerender.location, location2, new URL(window.location.href), "allow-explicit");
					if (rerender.reload || isExternalLocation(location2)) {
						if (hasInvalidProtocol(location2)) throw new Error("Invalid redirect location");
						window.location.href = location2;
						return;
					}
					React.startTransition(() => {
						globalVar.__reactRouterDataRouter.navigate(location2, { replace: rerender.replace });
					});
					return;
				}
				React.startTransition(() => {
					let lastMatch;
					for (const match of rerender.matches) {
						globalVar.__reactRouterDataRouter.patchRoutes(lastMatch?.id ?? null, [createRouteFromServerManifest(match)], true);
						lastMatch = match;
					}
					window.__reactRouterDataRouter._internalSetStateDoNotUseOrYouWillBreakYourApp({
						loaderData: Object.assign({}, globalVar.__reactRouterDataRouter.state.loaderData, rerender.loaderData),
						errors: rerender.errors ? Object.assign({}, globalVar.__reactRouterDataRouter.state.errors, rerender.errors) : null
					});
				});
			}
		}).catch(() => {}));
		return payloadPromise.then((payload) => {
			if (payload.type !== "action" && payload.type !== "redirect") throw new Error("Unexpected payload type");
			return payload.actionResult;
		});
	};
}
function createRouterFromPayload({ fetchImplementation, createFromReadableStream, getContext, payload }) {
	const globalVar = window;
	if (globalVar.__reactRouterDataRouter && globalVar.__reactRouterRouteModules) return {
		router: globalVar.__reactRouterDataRouter,
		routeModules: globalVar.__reactRouterRouteModules
	};
	if (payload.type !== "render") throw new Error("Invalid payload type");
	globalVar.__reactRouterRouteModules = globalVar.__reactRouterRouteModules ?? {};
	populateRSCRouteModules(globalVar.__reactRouterRouteModules, payload.matches);
	let routes = payload.matches.reduceRight((previous, match) => {
		const route = createRouteFromServerManifest(match, payload);
		if (previous.length > 0) route.children = previous;
		else if (!route.index) route.children = [];
		return [route];
	}, []);
	let applyPatchesPromise;
	globalVar.__reactRouterDataRouter = createRouter({
		routes,
		getContext,
		basename: payload.basename,
		history: createBrowserHistory(),
		hydrationData: getHydrationData({
			state: {
				loaderData: payload.loaderData,
				actionData: payload.actionData,
				errors: payload.errors
			},
			routes,
			getRouteInfo: (routeId) => {
				let match = payload.matches.find((m) => m.id === routeId);
				invariant$1(match, "Route not found in payload");
				return {
					clientLoader: match.clientLoader,
					hasLoader: match.hasLoader,
					hasHydrateFallback: match.hydrateFallbackElement != null
				};
			},
			location: payload.location,
			basename: payload.basename,
			isSpaMode: false
		}),
		async patchRoutesOnNavigation({ path, signal }) {
			if (payload.routeDiscovery.mode === "initial") {
				if (!applyPatchesPromise) applyPatchesPromise = (async () => {
					if (!payload.patches) return;
					let patches = await payload.patches;
					React.startTransition(() => {
						patches.forEach((p) => {
							window.__reactRouterDataRouter.patchRoutes(p.parentId ?? null, [createRouteFromServerManifest(p)]);
						});
					});
				})();
				await applyPatchesPromise;
				return;
			}
			if (discoveredPaths.has(path)) return;
			await fetchAndApplyManifestPatches([path], createFromReadableStream, fetchImplementation, signal);
		},
		dataStrategy: getRSCSingleFetchDataStrategy(() => globalVar.__reactRouterDataRouter, true, payload.basename, createFromReadableStream, fetchImplementation)
	});
	if (globalVar.__reactRouterDataRouter.state.initialized) {
		globalVar.__routerInitialized = true;
		globalVar.__reactRouterDataRouter.initialize();
	} else globalVar.__routerInitialized = false;
	let lastLoaderData = void 0;
	globalVar.__reactRouterDataRouter.subscribe(({ loaderData, actionData }) => {
		if (lastLoaderData !== loaderData) globalVar.__routerActionID = (globalVar.__routerActionID ?? (globalVar.__routerActionID = 0)) + 1;
	});
	globalVar.__reactRouterDataRouter._updateRoutesForHMR = (routeUpdateByRouteId) => {
		const oldRoutes = window.__reactRouterDataRouter.routes;
		const newRoutes = [];
		function walkRoutes(routes2, parentId) {
			return routes2.map((route) => {
				const routeUpdate = routeUpdateByRouteId.get(route.id);
				if (routeUpdate) {
					const { routeModule, hasAction, hasComponent, hasErrorBoundary, hasLoader } = routeUpdate;
					const newRoute = createRouteFromServerManifest({
						clientAction: routeModule.clientAction,
						clientLoader: routeModule.clientLoader,
						element: route.element,
						errorElement: route.errorElement,
						handle: route.handle,
						hasAction,
						hasComponent,
						hasErrorBoundary,
						hasLoader,
						hydrateFallbackElement: route.hydrateFallbackElement,
						id: route.id,
						index: route.index,
						links: routeModule.links,
						meta: routeModule.meta,
						parentId,
						path: route.path,
						shouldRevalidate: routeModule.shouldRevalidate
					});
					if (route.children) newRoute.children = walkRoutes(route.children, route.id);
					return newRoute;
				}
				const updatedRoute = { ...route };
				if (route.children) updatedRoute.children = walkRoutes(route.children, route.id);
				return updatedRoute;
			});
		}
		newRoutes.push(...walkRoutes(oldRoutes, void 0));
		window.__reactRouterDataRouter._internalSetRoutes(newRoutes);
	};
	return {
		router: globalVar.__reactRouterDataRouter,
		routeModules: globalVar.__reactRouterRouteModules
	};
}
function getRSCSingleFetchDataStrategy(getRouter, ssr, basename, createFromReadableStream, fetchImplementation) {
	let dataStrategy = getSingleFetchDataStrategyImpl(getRouter, (match) => {
		let M = match;
		return {
			hasLoader: M.route.hasLoader,
			hasClientLoader: M.route.hasClientLoader,
			hasComponent: M.route.hasComponent,
			hasAction: M.route.hasAction,
			hasClientAction: M.route.hasClientAction
		};
	}, getFetchAndDecodeViaRSC(createFromReadableStream, fetchImplementation), ssr, basename, true, (match) => {
		let M = match;
		return M.route.hasComponent && !M.route.element;
	});
	return async (args) => args.runClientMiddleware(async () => {
		let context = args.context;
		context.set(renderedRoutesContext, []);
		let results = await dataStrategy(args);
		const renderedRoutesById = /* @__PURE__ */ new Map();
		for (const route of context.get(renderedRoutesContext)) {
			if (!renderedRoutesById.has(route.id)) renderedRoutesById.set(route.id, []);
			renderedRoutesById.get(route.id).push(route);
		}
		React.startTransition(() => {
			for (const match of args.matches) {
				const renderedRoutes = renderedRoutesById.get(match.route.id);
				if (renderedRoutes) for (const rendered of renderedRoutes) window.__reactRouterDataRouter.patchRoutes(rendered.parentId ?? null, [createRouteFromServerManifest(rendered)], true);
			}
		});
		return results;
	});
}
function getFetchAndDecodeViaRSC(createFromReadableStream, fetchImplementation) {
	return async (args, basename, trailingSlashAware, targetRoutes) => {
		let { request, context } = args;
		let url = singleFetchUrl(request.url, basename, trailingSlashAware, "rsc");
		if (request.method === "GET") {
			url = stripIndexParam$1(url);
			if (targetRoutes) url.searchParams.set("_routes", targetRoutes.join(","));
		}
		let res = await fetchImplementation(new Request(url, await createRequestInit(request)));
		if (res.status >= 400 && !res.headers.has("X-Remix-Response")) throw new ErrorResponseImpl(res.status, res.statusText, await res.text());
		invariant$1(res.body, "No response body to decode");
		try {
			const payload = await createFromReadableStream(res.body, { temporaryReferences: void 0 });
			if (payload.type === "redirect") return {
				status: res.status,
				data: { redirect: {
					redirect: payload.location,
					reload: payload.reload,
					replace: payload.replace,
					revalidate: false,
					status: payload.status
				} }
			};
			if (payload.type !== "render") throw new Error("Unexpected payload type");
			context.get(renderedRoutesContext).push(...payload.matches);
			let results = { routes: {} };
			const dataKey = isMutationMethod(request.method) ? "actionData" : "loaderData";
			for (let [routeId, data] of Object.entries(payload[dataKey] || {})) results.routes[routeId] = { data };
			if (payload.errors) for (let [routeId, error] of Object.entries(payload.errors)) results.routes[routeId] = { error };
			return {
				status: res.status,
				data: results
			};
		} catch (cause) {
			throw new Error("Unable to decode RSC response", { cause });
		}
	};
}
function RSCHydratedRouter({ createFromReadableStream, fetch: fetchImplementation = fetch, payload, getContext }) {
	if (payload.type !== "render") throw new Error("Invalid payload type");
	let { routeDiscovery } = payload;
	let { router: router2, routeModules } = React.useMemo(() => createRouterFromPayload({
		payload,
		fetchImplementation,
		getContext,
		createFromReadableStream
	}), [
		createFromReadableStream,
		payload,
		fetchImplementation,
		getContext
	]);
	React.useEffect(() => {
		setIsHydrated();
	}, []);
	React.useLayoutEffect(() => {
		const globalVar = window;
		if (!globalVar.__routerInitialized) {
			globalVar.__routerInitialized = true;
			globalVar.__reactRouterDataRouter.initialize();
		}
	}, []);
	let [{ routes, state }, setState] = React.useState(() => ({
		routes: cloneRoutes(router2.routes),
		state: router2.state
	}));
	React.useLayoutEffect(() => router2.subscribe((newState) => {
		if (diffRoutes(router2.routes, routes)) React.startTransition(() => {
			setState({
				routes: cloneRoutes(router2.routes),
				state: newState
			});
		});
	}), [
		router2.subscribe,
		routes,
		router2
	]);
	const transitionEnabledRouter = React.useMemo(() => ({
		...router2,
		state,
		routes
	}), [
		router2,
		routes,
		state
	]);
	React.useEffect(() => {
		if (routeDiscovery.mode === "initial" || window.navigator?.connection?.saveData === true) return;
		function registerElement(el) {
			let path = el.tagName === "FORM" ? el.getAttribute("action") : el.getAttribute("href");
			if (!path) return;
			let pathname = el.tagName === "A" ? el.pathname : new URL(path, window.location.origin).pathname;
			if (!discoveredPaths.has(pathname)) nextPaths.add(pathname);
		}
		async function fetchPatches() {
			document.querySelectorAll("a[data-discover], form[data-discover]").forEach(registerElement);
			let paths = Array.from(nextPaths.keys()).filter((path) => {
				if (discoveredPaths.has(path)) {
					nextPaths.delete(path);
					return false;
				}
				return true;
			});
			if (paths.length === 0) return;
			try {
				await fetchAndApplyManifestPatches(paths, createFromReadableStream, fetchImplementation);
			} catch (e) {
				console.error("Failed to fetch manifest patches", e);
			}
		}
		let debouncedFetchPatches = debounce(fetchPatches, 100);
		fetchPatches();
		new MutationObserver(() => debouncedFetchPatches()).observe(document.documentElement, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: [
				"data-discover",
				"href",
				"action"
			]
		});
	}, [
		routeDiscovery,
		createFromReadableStream,
		fetchImplementation
	]);
	const frameworkContext = {
		future: {
			v8_middleware: false,
			v8_trailingSlashAwareDataRequests: true,
			v8_passThroughRequests: true
		},
		isSpaMode: false,
		ssr: true,
		criticalCss: "",
		manifest: {
			routes: {},
			version: "1",
			url: "",
			entry: {
				module: "",
				imports: []
			}
		},
		routeDiscovery: payload.routeDiscovery.mode === "initial" ? {
			mode: "initial",
			manifestPath: defaultManifestPath
		} : {
			mode: "lazy",
			manifestPath: payload.routeDiscovery.manifestPath || defaultManifestPath
		},
		routeModules
	};
	return /* @__PURE__ */ React.createElement(RSCRouterContext.Provider, { value: true }, /* @__PURE__ */ React.createElement(RSCRouterGlobalErrorBoundary, { location: state.location }, /* @__PURE__ */ React.createElement(FrameworkContext.Provider, { value: frameworkContext }, /* @__PURE__ */ React.createElement(RouterProvider$1, {
		router: transitionEnabledRouter,
		flushSync: ReactDOM.flushSync
	}))));
}
function createRouteFromServerManifest(match, payload) {
	let hasInitialData = payload && match.id in payload.loaderData;
	let initialData = payload?.loaderData[match.id];
	let hasInitialError = payload?.errors && match.id in payload.errors;
	let initialError = payload?.errors?.[match.id];
	let isHydrationRequest = match.clientLoader?.hydrate === true || !match.hasLoader || match.hasComponent && !match.element;
	invariant$1(window.__reactRouterRouteModules);
	populateRSCRouteModules(window.__reactRouterRouteModules, match);
	let dataRoute = {
		id: match.id,
		element: match.element,
		errorElement: match.errorElement,
		handle: match.handle,
		hasErrorBoundary: match.hasErrorBoundary,
		hydrateFallbackElement: match.hydrateFallbackElement,
		index: match.index,
		loader: match.clientLoader ? async (args, singleFetch) => {
			let _isHydrationRequest = isHydrationRequest;
			isHydrationRequest = false;
			return await match.clientLoader({
				...args,
				serverLoader: () => {
					preventInvalidServerHandlerCall("loader", match.id, match.hasLoader);
					if (_isHydrationRequest) {
						if (hasInitialData) return initialData;
						if (hasInitialError) throw initialError;
					}
					return callSingleFetch(singleFetch);
				}
			});
		} : ((_, singleFetch) => callSingleFetch(singleFetch)),
		action: match.clientAction ? (args, singleFetch) => match.clientAction({
			...args,
			serverAction: async () => {
				preventInvalidServerHandlerCall("action", match.id, match.hasLoader);
				return await callSingleFetch(singleFetch);
			}
		}) : match.hasAction ? (_, singleFetch) => callSingleFetch(singleFetch) : () => {
			throw noActionDefinedError("action", match.id);
		},
		path: match.path,
		shouldRevalidate: match.shouldRevalidate,
		hasLoader: true,
		hasClientLoader: match.clientLoader != null,
		hasAction: match.hasAction,
		hasClientAction: match.clientAction != null
	};
	if (typeof dataRoute.loader === "function") dataRoute.loader.hydrate = shouldHydrateRouteLoader(match.id, match.clientLoader, match.hasLoader, false);
	return dataRoute;
}
function callSingleFetch(singleFetch) {
	invariant$1(typeof singleFetch === "function", "Invalid singleFetch parameter");
	return singleFetch();
}
function preventInvalidServerHandlerCall(type, routeId, hasHandler) {
	if (!hasHandler) {
		let msg = `You are trying to call ${type === "action" ? "serverAction()" : "serverLoader()"} on a route that does not have a server ${type} (routeId: "${routeId}")`;
		console.error(msg);
		throw new ErrorResponseImpl(400, "Bad Request", new Error(msg), true);
	}
}
function getManifestUrl(paths) {
	if (paths.length === 0) return null;
	if (paths.length === 1) return new URL(`${paths[0]}.manifest`, window.location.origin);
	let basename = (window.__reactRouterDataRouter.basename ?? "").replace(/^\/|\/$/g, "");
	let url = new URL(`${basename}/.manifest`, window.location.origin);
	url.searchParams.set("paths", paths.sort().join(","));
	return url;
}
async function fetchAndApplyManifestPatches(paths, createFromReadableStream, fetchImplementation, signal) {
	paths = getPathsWithAncestors(paths);
	let url = getManifestUrl(paths);
	if (url == null) return;
	if (url.toString().length > 7680) {
		nextPaths.clear();
		return;
	}
	let response = await fetchImplementation(new Request(url, { signal }));
	if (!response.body || response.status < 200 || response.status >= 300) throw new Error("Unable to fetch new route matches from the server");
	let payload = await createFromReadableStream(response.body, { temporaryReferences: void 0 });
	if (payload.type !== "manifest") throw new Error("Failed to patch routes");
	paths.forEach((p) => addToFifoQueue(p, discoveredPaths));
	let patches = await payload.patches;
	React.startTransition(() => {
		patches.forEach((p) => {
			window.__reactRouterDataRouter.patchRoutes(p.parentId ?? null, [createRouteFromServerManifest(p)]);
		});
	});
}
function addToFifoQueue(path, queue) {
	if (queue.size >= discoveredPathsMaxSize) {
		let first = queue.values().next().value;
		if (typeof first === "string") queue.delete(first);
	}
	queue.add(path);
}
function debounce(callback, wait) {
	let timeoutId;
	return (...args) => {
		window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => callback(...args), wait);
	};
}
function isExternalLocation(location2) {
	return new URL(location2, window.location.href).origin !== window.location.origin;
}
function normalizeRedirectLocation(location2) {
	if (PROTOCOL_RELATIVE_URL_REGEX.test(location2)) {
		let path = resolvePath(location2);
		return path.pathname + path.search + path.hash;
	}
	return location2;
}
function cloneRoutes(routes) {
	if (!routes) return void 0;
	return routes.map((route) => ({
		...route,
		children: cloneRoutes(route.children)
	}));
}
function diffRoutes(a, b) {
	if (a.length !== b.length) return true;
	return a.some((route, index) => {
		if (route.element !== b[index].element) return true;
		if (route.errorElement !== b[index].errorElement) return true;
		if (route.hydrateFallbackElement !== b[index].hydrateFallbackElement) return true;
		if (route.hasErrorBoundary !== b[index].hasErrorBoundary) return true;
		if (route.hasLoader !== b[index].hasLoader) return true;
		if (route.hasClientLoader !== b[index].hasClientLoader) return true;
		if (route.hasAction !== b[index].hasAction) return true;
		if (route.hasClientAction !== b[index].hasClientAction) return true;
		return diffRoutes(route.children || [], b[index].children || []);
	});
}
function getRSCStream() {
	let encoder = new TextEncoder();
	let streamController = null;
	let rscStream = new ReadableStream({ start(controller) {
		if (typeof window === "undefined") return;
		let handleChunk = (chunk) => {
			if (typeof chunk === "string") controller.enqueue(encoder.encode(chunk));
			else controller.enqueue(chunk);
		};
		window.__FLIGHT_DATA || (window.__FLIGHT_DATA = []);
		window.__FLIGHT_DATA.forEach(handleChunk);
		window.__FLIGHT_DATA.push = (chunk) => {
			handleChunk(chunk);
			return 0;
		};
		streamController = controller;
	} });
	if (typeof document !== "undefined" && document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => {
		streamController?.close();
	});
	else streamController?.close();
	return rscStream;
}
var ssrInfo, router, defaultManifestPath, renderedRoutesContext, nextPaths, discoveredPathsMaxSize, discoveredPaths;
var init_dom_export = __esmMin((() => {
	init_chunk_H4DAEOV7();
	init_chunk_OB3PAWPO();
	ssrInfo = null;
	router = null;
	defaultManifestPath = "/__manifest";
	renderedRoutesContext = createContext();
	nextPaths = /* @__PURE__ */ new Set();
	discoveredPathsMaxSize = 1e3;
	discoveredPaths = /* @__PURE__ */ new Set();
}));
//#endregion
//#region node_modules/react-router/dist/development/index.mjs
/**
* react-router v7.18.4
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
var development_exports = /* @__PURE__ */ __exportAll({
	Await: () => Await,
	BrowserRouter: () => BrowserRouter,
	Form: () => Form,
	HashRouter: () => HashRouter,
	IDLE_BLOCKER: () => IDLE_BLOCKER,
	IDLE_FETCHER: () => IDLE_FETCHER,
	IDLE_NAVIGATION: () => IDLE_NAVIGATION,
	Link: () => Link$8,
	Links: () => Links,
	MemoryRouter: () => MemoryRouter,
	Meta: () => Meta,
	NavLink: () => NavLink$1,
	Navigate: () => Navigate,
	NavigationType: () => Action,
	Outlet: () => Outlet$1,
	PrefetchPageLinks: () => PrefetchPageLinks,
	Route: () => Route$1,
	Router: () => Router,
	RouterContextProvider: () => RouterContextProvider,
	RouterProvider: () => RouterProvider$1,
	Routes: () => Routes$1,
	Scripts: () => Scripts,
	ScrollRestoration: () => ScrollRestoration,
	ServerRouter: () => ServerRouter,
	StaticRouter: () => StaticRouter$1,
	StaticRouterProvider: () => StaticRouterProvider,
	UNSAFE_AwaitContextProvider: () => AwaitContextProvider,
	UNSAFE_DataRouterContext: () => DataRouterContext,
	UNSAFE_DataRouterStateContext: () => DataRouterStateContext,
	UNSAFE_ErrorResponseImpl: () => ErrorResponseImpl,
	UNSAFE_FetchersContext: () => FetchersContext,
	UNSAFE_FrameworkContext: () => FrameworkContext,
	UNSAFE_LocationContext: () => LocationContext,
	UNSAFE_NavigationContext: () => NavigationContext,
	UNSAFE_RSCDefaultRootErrorBoundary: () => RSCDefaultRootErrorBoundary,
	UNSAFE_RemixErrorBoundary: () => RemixErrorBoundary,
	UNSAFE_RouteContext: () => RouteContext,
	UNSAFE_ServerMode: () => ServerMode,
	UNSAFE_SingleFetchRedirectSymbol: () => SingleFetchRedirectSymbol,
	UNSAFE_ViewTransitionContext: () => ViewTransitionContext,
	UNSAFE_WithComponentProps: () => WithComponentProps,
	UNSAFE_WithErrorBoundaryProps: () => WithErrorBoundaryProps,
	UNSAFE_WithHydrateFallbackProps: () => WithHydrateFallbackProps,
	UNSAFE_createBrowserHistory: () => createBrowserHistory,
	UNSAFE_createClientRoutes: () => createClientRoutes,
	UNSAFE_createClientRoutesWithHMRRevalidationOptOut: () => createClientRoutesWithHMRRevalidationOptOut,
	UNSAFE_createHashHistory: () => createHashHistory,
	UNSAFE_createMemoryHistory: () => createMemoryHistory,
	UNSAFE_createRouter: () => createRouter,
	UNSAFE_decodeViaTurboStream: () => decodeViaTurboStream,
	UNSAFE_getHydrationData: () => getHydrationData,
	UNSAFE_getPatchRoutesOnNavigationFunction: () => getPatchRoutesOnNavigationFunction,
	UNSAFE_getTurboStreamSingleFetchDataStrategy: () => getTurboStreamSingleFetchDataStrategy,
	UNSAFE_hydrationRouteProperties: () => hydrationRouteProperties,
	UNSAFE_invariant: () => invariant$1,
	UNSAFE_mapRouteProperties: () => mapRouteProperties,
	UNSAFE_shouldHydrateRouteLoader: () => shouldHydrateRouteLoader,
	UNSAFE_useFogOFWarDiscovery: () => useFogOFWarDiscovery,
	UNSAFE_useScrollRestoration: () => useScrollRestoration,
	UNSAFE_withComponentProps: () => withComponentProps,
	UNSAFE_withErrorBoundaryProps: () => withErrorBoundaryProps,
	UNSAFE_withHydrateFallbackProps: () => withHydrateFallbackProps,
	createBrowserRouter: () => createBrowserRouter,
	createContext: () => createContext,
	createCookie: () => createCookie,
	createCookieSessionStorage: () => createCookieSessionStorage,
	createHashRouter: () => createHashRouter,
	createMemoryRouter: () => createMemoryRouter,
	createMemorySessionStorage: () => createMemorySessionStorage,
	createPath: () => createPath,
	createRequestHandler: () => createRequestHandler,
	createRoutesFromChildren: () => createRoutesFromChildren,
	createRoutesFromElements: () => createRoutesFromElements,
	createRoutesStub: () => createRoutesStub,
	createSearchParams: () => createSearchParams,
	createSession: () => createSession,
	createSessionStorage: () => createSessionStorage,
	createStaticHandler: () => createStaticHandler2,
	createStaticRouter: () => createStaticRouter,
	data: () => data,
	generatePath: () => generatePath,
	href: () => href,
	isCookie: () => isCookie,
	isRouteErrorResponse: () => isRouteErrorResponse,
	isSession: () => isSession,
	matchPath: () => matchPath,
	matchRoutes: () => matchRoutes,
	parsePath: () => parsePath,
	redirect: () => redirect,
	redirectDocument: () => redirectDocument,
	renderMatches: () => renderMatches,
	replace: () => replace,
	resolvePath: () => resolvePath,
	unstable_HistoryRouter: () => HistoryRouter,
	unstable_RSCStaticRouter: () => RSCStaticRouter,
	unstable_routeRSCServerRequest: () => routeRSCServerRequest,
	unstable_setDevServerHooks: () => setDevServerHooks,
	unstable_usePrompt: () => usePrompt,
	unstable_useRoute: () => useRoute,
	unstable_useRouterState: () => useRouterState,
	useActionData: () => useActionData,
	useAsyncError: () => useAsyncError,
	useAsyncValue: () => useAsyncValue,
	useBeforeUnload: () => useBeforeUnload,
	useBlocker: () => useBlocker,
	useFetcher: () => useFetcher,
	useFetchers: () => useFetchers,
	useFormAction: () => useFormAction,
	useHref: () => useHref,
	useInRouterContext: () => useInRouterContext,
	useLinkClickHandler: () => useLinkClickHandler,
	useLoaderData: () => useLoaderData,
	useLocation: () => useLocation$1,
	useMatch: () => useMatch,
	useMatches: () => useMatches,
	useNavigate: () => useNavigate$1,
	useNavigation: () => useNavigation,
	useNavigationType: () => useNavigationType,
	useOutlet: () => useOutlet,
	useOutletContext: () => useOutletContext,
	useParams: () => useParams$1,
	useResolvedPath: () => useResolvedPath,
	useRevalidator: () => useRevalidator,
	useRouteError: () => useRouteError,
	useRouteLoaderData: () => useRouteLoaderData,
	useRoutes: () => useRoutes,
	useSearchParams: () => useSearchParams,
	useSubmit: () => useSubmit,
	useViewTransitionState: () => useViewTransitionState
});
var init_development = __esmMin((() => {
	init_chunk_H4DAEOV7();
	init_chunk_OB3PAWPO();
}));
//#endregion
//#region node_modules/react-router-dom/dist/index.js
/**
* react-router-dom v7.18.4
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
var require_dist = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var index_exports = {};
	__export(index_exports, {
		HydratedRouter: () => import_dom.HydratedRouter,
		RouterProvider: () => import_dom.RouterProvider
	});
	module.exports = __toCommonJS(index_exports);
	var import_dom = (init_dom_export(), __toCommonJS$1(dom_export_exports));
	__reExport(index_exports, (init_development(), __toCommonJS$1(development_exports)), module.exports);
	0 && (module.exports = {
		HydratedRouter,
		RouterProvider,
		...(init_development(), __toCommonJS$1(development_exports))
	});
}));
//#endregion
//#region src/playground/loader.js
var import_dist = require_dist();
var loadPlayground = () => import("./assets/Playground-CpET1Yxy.js");
var preloadPlayground = () => {
	loadPlayground();
};
var appIntent = {
	onPointerEnter: preloadPlayground,
	onFocus: preloadPlayground,
	onTouchStart: preloadPlayground
};
//#endregion
//#region src/site/site.js
var SITE = {
	name: "KubeDojo",
	tagline: "Practice Kubernetes on a cluster you can't break.",
	description: "KubeDojo simulates kind, k3d, docker, kubectl and Helm 2 in your browser. Type real commands, watch the cluster react, then export what you built as a setup script for your own machine.",
	url: "".replace(/\/$/, ""),
	nav: [{
		to: "/blog",
		label: "Blog"
	}],
	app: {
		to: "/app",
		label: "Open the playground"
	}
};
var absolute = (path) => SITE.url ? SITE.url + path : path;
//#endregion
//#region src/blog/generated/index.json
var generated_default = [
	{
		"slug": "start-here",
		"title": "Local Kubernetes with kind and k3d: start here",
		"description": "What this learning lab covers, in which order to read it, and the one rule to follow before you run anything.",
		"order": 0,
		"tags": ["overview"],
		"date": "2026-10-16",
		"minutes": 4,
		"words": 679,
		"headings": [
			"Read in this order",
			"Try it in your browser",
			"The whole thing on one page",
			"What you need",
			"One rule before you start"
		]
	},
	{
		"slug": "concepts",
		"title": "Concepts: what each piece is",
		"description": "Clusters, nodes, taints, contexts, kubeconfig, namespaces and Services, explained once so the guides can refer back to them.",
		"order": 1,
		"tags": ["basics", "concepts"],
		"date": "2026-10-14",
		"minutes": 19,
		"words": 2633,
		"headings": [
			"The big picture",
			"kind",
			"Cluster, nodes, control plane",
			"Names, kubeconfig and contexts",
			"Namespaces",
			"Taints and tolerations",
			"Objects you will meet",
			"How a pod finds a node",
			"How pods find each other: Services and DNS",
			"Getting to your apps from the Mac",
			"Docker networks and localhost",
			"What a local cluster does not prove"
		]
	},
	{
		"slug": "users-and-permissions",
		"title": "Users and permissions: who may do what, in which namespace",
		"description": "Roles, bindings, ServiceAccounts and the layers of a complete access-control setup for a cluster.",
		"order": 2,
		"tags": ["rbac", "security"],
		"date": "2026-10-14",
		"minutes": 21,
		"words": 2173,
		"headings": [
			"1. The big picture: three questions, asked in order",
			"2. The objects",
			"3. Hands-on 1: a program with limited access (ServiceAccount)",
			"4. Hands-on 2: a person with a certificate (a user in a group)",
			"5. What a complete ACL for a cluster consists of",
			"6. Dangerous permissions: check these before you grant",
			"7. On a managed cluster (GKE)",
			"8. Clean up the lab objects"
		]
	},
	{
		"slug": "kind-cluster",
		"title": "Create a local Kubernetes cluster with kind",
		"description": "From nothing to a running multi-node cluster: install the tools, create local-cluster-1, switch kubectl to it, make namespaces.",
		"order": 3,
		"tags": ["kind"],
		"date": "2026-10-14",
		"minutes": 13,
		"words": 1474,
		"headings": [
			"Part 1 — Prepare the machine",
			"Part 2 — Create the cluster",
			"Part 3 — Switch to the cluster",
			"Part 4 — The nodes",
			"Part 5 — Namespaces",
			"Where next"
		]
	},
	{
		"slug": "k3d-cluster",
		"title": "Create a local Kubernetes cluster with k3d",
		"description": "The same journey with k3d, plus live node add and remove, a load balancer, ingress, metrics and a built-in registry.",
		"order": 4,
		"tags": ["k3d"],
		"date": "2026-10-14",
		"minutes": 16,
		"words": 1296,
		"headings": [
			"kind or k3d?",
			"Part 1 — Prepare the machine",
			"Part 2 — Create the cluster",
			"Part 3 — Switch to the cluster",
			"Part 4 — The nodes",
			"Part 5 — Namespaces",
			"Part 6 — What k3d gives you that kind does not",
			"Part 7 — Stop, start, delete"
		]
	},
	{
		"slug": "run-your-image",
		"title": "Run your own image in the cluster",
		"description": "Get an image you built into the cluster with kind load or a local registry, then update it.",
		"order": 5,
		"tags": ["docker", "images"],
		"date": "2026-10-14",
		"minutes": 11,
		"words": 1218,
		"headings": [
			"Part 1 — Run your own image",
			"Part 2 — Habits and gotchas worth knowing",
			"Where next"
		]
	},
	{
		"slug": "deploy-apps",
		"title": "Deploy apps into your namespaces, one at a time",
		"description": "Run an app in each namespace, place pods on chosen nodes, and reach what you deployed.",
		"order": 6,
		"tags": ["kubectl", "namespaces"],
		"date": "2026-10-14",
		"minutes": 13,
		"words": 1354,
		"headings": [
			"Part 1 — Deploy, one app at a time",
			"Part 2 — Use what you deployed",
			"Where next"
		]
	},
	{
		"slug": "helm-2-chart",
		"title": "Deploy with a Helm 2 chart: every template, explained",
		"description": "Package an application as a Helm 2 chart and deploy it: image pull secret, ConfigMap, Secret, Service, Ingress, autoscaling and more.",
		"order": 7,
		"tags": ["helm"],
		"date": "2026-10-14",
		"minutes": 39,
		"words": 4762,
		"headings": [
			"1. How Helm 2 works",
			"2. Set up Helm 2 on your cluster",
			"3. What a chart is made of",
			"4. The template language in ten minutes",
			"5. Build the chart, file by file",
			"6. Check the chart before installing it",
			"7. Install, upgrade, roll back, remove",
			"8. Secrets and credentials: keep them out of the release",
			"9. One chart, many environments",
			"10. A checklist for \"a perfect system\"",
			"11. Helm 2 versus Helm 3",
			"12. When something goes wrong",
			"13. Clean up"
		]
	},
	{
		"slug": "clean-up",
		"title": "Stop, shut down and clean up",
		"description": "Three levels of tidying, from deleting namespaces to removing the cluster and its kubectl context.",
		"order": 8,
		"tags": ["kind", "k3d"],
		"date": "2026-10-14",
		"minutes": 6,
		"words": 493,
		"headings": [
			"Part 1 — Delete the namespaces (the cluster stays)",
			"Part 2 — Stop the cluster and start it again",
			"Part 3 — Complete shutdown"
		]
	}
];
//#endregion
//#region src/blog/data.js
var posts = generated_default;
var bySlug = (slug) => generated_default.find((p) => p.slug === slug);
var allTags = () => [...new Set(generated_default.flatMap((p) => p.tags))].sort();
var neighbours = (slug) => {
	const i = generated_default.findIndex((p) => p.slug === slug);
	return {
		prev: generated_default[i - 1] || null,
		next: generated_default[i + 1] || null
	};
};
var loaders = /* #__PURE__ */ Object.assign({
	"./generated/posts/clean-up.json": () => Promise.resolve().then(() => clean_up_exports),
	"./generated/posts/concepts.json": () => Promise.resolve().then(() => concepts_exports),
	"./generated/posts/deploy-apps.json": () => Promise.resolve().then(() => deploy_apps_exports),
	"./generated/posts/helm-2-chart.json": () => Promise.resolve().then(() => helm_2_chart_exports),
	"./generated/posts/k3d-cluster.json": () => Promise.resolve().then(() => k3d_cluster_exports),
	"./generated/posts/kind-cluster.json": () => Promise.resolve().then(() => kind_cluster_exports),
	"./generated/posts/run-your-image.json": () => Promise.resolve().then(() => run_your_image_exports),
	"./generated/posts/start-here.json": () => Promise.resolve().then(() => start_here_exports),
	"./generated/posts/users-and-permissions.json": () => Promise.resolve().then(() => users_and_permissions_exports)
});
var cache = /* @__PURE__ */ new Map();
var pending = /* @__PURE__ */ new Map();
function seedPost(post) {
	cache.set(post.slug, post);
}
function loadPost(slug) {
	if (cache.has(slug)) return Promise.resolve(cache.get(slug));
	const key = `./generated/posts/${slug}.json`;
	if (!loaders[key]) return Promise.resolve(null);
	if (!pending.has(slug)) pending.set(slug, loaders[key]().then((m) => {
		const p = m.default;
		cache.set(slug, p);
		return p;
	}));
	return pending.get(slug);
}
function usePost(slug) {
	const hit = cache.get(slug);
	if (hit) return hit;
	if (!loaders[`./generated/posts/${slug}.json`]) return null;
	throw loadPost(slug);
}
//#endregion
//#region src/components/Logo.jsx
function Logo({ size = 26 }) {
	return /* @__PURE__ */ jsxs("svg", {
		className: "logo-mark",
		width: size,
		height: size,
		viewBox: "0 0 32 32",
		"aria-hidden": "true",
		focusable: "false",
		children: [/* @__PURE__ */ jsx("path", {
			d: "M16 2.5 27.7 9.25v13.5L16 29.5 4.3 22.75V9.25z",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2.2",
			strokeLinejoin: "round"
		}), /* @__PURE__ */ jsx("path", {
			d: "M4.3 13.4h23.4v5.2H4.3z",
			fill: "var(--accent)"
		})]
	});
}
//#endregion
//#region src/components/ThemeToggle.jsx
var KEY = "kubedojo:theme";
function ThemeToggle() {
	const flip = () => {
		const root = document.documentElement;
		const next = (root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark" ? "light" : "dark";
		root.dataset.theme = next;
		try {
			localStorage.setItem(KEY, next);
		} catch (e) {}
	};
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		className: "icon-btn theme-toggle",
		onClick: flip,
		"aria-label": "Switch between light and dark theme",
		title: "Switch theme",
		children: [/* @__PURE__ */ jsxs("svg", {
			className: "i-sun",
			width: "18",
			height: "18",
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.8",
			strokeLinecap: "round",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "4"
			}), /* @__PURE__ */ jsx("path", { d: "M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" })]
		}), /* @__PURE__ */ jsx("svg", {
			className: "i-moon",
			width: "18",
			height: "18",
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.8",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			"aria-hidden": "true",
			children: /* @__PURE__ */ jsx("path", { d: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" })
		})]
	});
}
//#endregion
//#region src/components/SiteLayout.jsx
function Header() {
	return /* @__PURE__ */ jsx("header", {
		className: "site-header",
		children: /* @__PURE__ */ jsxs("div", {
			className: "wrap bar",
			children: [
				/* @__PURE__ */ jsxs(import_dist.Link, {
					to: "/",
					className: "brand",
					"aria-label": `${SITE.name} home`,
					children: [/* @__PURE__ */ jsx(Logo, {}), /* @__PURE__ */ jsx("span", { children: SITE.name })]
				}),
				/* @__PURE__ */ jsx("nav", {
					className: "main-nav",
					"aria-label": "Main",
					children: SITE.nav.map((n) => /* @__PURE__ */ jsx(import_dist.NavLink, {
						to: n.to,
						className: ({ isActive }) => isActive ? "active" : void 0,
						children: n.label
					}, n.to))
				}),
				/* @__PURE__ */ jsx(ThemeToggle, {}),
				/* @__PURE__ */ jsxs(import_dist.Link, {
					to: SITE.app.to,
					className: "btn btn-primary btn-sm",
					...appIntent,
					children: [/* @__PURE__ */ jsx("span", {
						className: "long",
						children: SITE.app.label
					}), /* @__PURE__ */ jsx("span", {
						className: "short",
						children: "Playground"
					})]
				})
			]
		})
	});
}
function Footer() {
	return /* @__PURE__ */ jsx("footer", {
		className: "site-footer",
		children: /* @__PURE__ */ jsxs("div", {
			className: "wrap",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "foot-grid",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs(import_dist.Link, {
						to: "/",
						className: "brand",
						"aria-label": `${SITE.name} home`,
						children: [/* @__PURE__ */ jsx(Logo, {}), /* @__PURE__ */ jsx("span", { children: SITE.name })]
					}), /* @__PURE__ */ jsx("p", {
						className: "foot-note",
						children: "A simulator for learning kind, k3d, docker, kubectl and Helm 2. It runs in your browser and never touches your computer or a real cluster."
					})] }),
					/* @__PURE__ */ jsxs("nav", {
						"aria-label": "Product",
						children: [/* @__PURE__ */ jsx("h2", { children: "Product" }), /* @__PURE__ */ jsxs("ul", { children: [
							/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(import_dist.Link, {
								to: "/app",
								...appIntent,
								children: "Playground"
							}) }),
							/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(import_dist.Link, {
								to: "/blog",
								children: "Blog"
							}) }),
							/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(import_dist.Link, {
								to: "/privacy",
								children: "Privacy"
							}) })
						] })]
					}),
					/* @__PURE__ */ jsxs("nav", {
						"aria-label": "Guides",
						children: [/* @__PURE__ */ jsx("h2", { children: "The guides" }), /* @__PURE__ */ jsx("ul", { children: posts.slice(0, 6).map((p) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(import_dist.Link, {
							to: `/blog/${p.slug}`,
							children: p.title.replace(/:.*$/, "")
						}) }, p.slug)) })]
					})
				]
			}), /* @__PURE__ */ jsx("p", {
				className: "foot-fine",
				children: "Everything on this site runs locally in your browser. No analytics, no cookies."
			})]
		})
	});
}
function SiteLayout() {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("a", {
			className: "skip-link",
			href: "#main",
			children: "Skip to content"
		}),
		/* @__PURE__ */ jsx(Header, {}),
		/* @__PURE__ */ jsx("main", {
			id: "main",
			tabIndex: -1,
			children: /* @__PURE__ */ jsx(import_dist.Outlet, {})
		}),
		/* @__PURE__ */ jsx(Footer, {})
	] });
}
//#endregion
//#region \0@oxc-project+runtime@0.154.0/helpers/esm/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}
//#endregion
//#region \0@oxc-project+runtime@0.154.0/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
//#endregion
//#region \0@oxc-project+runtime@0.154.0/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.154.0/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}
//#endregion
//#region src/components/ErrorBoundary.jsx
var ErrorBoundary = class extends Component {
	constructor(..._args) {
		super(..._args);
		_defineProperty(this, "state", { error: null });
	}
	static getDerivedStateFromError(error) {
		return { error };
	}
	render() {
		if (!this.state.error) return this.props.children;
		return /* @__PURE__ */ jsxs("div", {
			className: "crash",
			role: "alert",
			children: [
				/* @__PURE__ */ jsx("h1", { children: "Something broke in the simulator." }),
				/* @__PURE__ */ jsx("p", { children: "Your saved files are untouched. Reload to start a fresh simulated world." }),
				/* @__PURE__ */ jsx("pre", { children: String(this.state.error && this.state.error.message || this.state.error) }),
				/* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "btn btn-primary",
						onClick: () => location.reload(),
						children: "Reload"
					}),
					" ",
					/* @__PURE__ */ jsx("a", {
						className: "btn",
						href: "/",
						children: "Back to the home page"
					})
				] })
			]
		});
	}
};
//#endregion
//#region src/site/meta.js
var PUBLISHER = {
	"@type": "Organization",
	name: SITE.name
};
function metaFor(path) {
	const p = path.replace(/\/+$/, "") || "/";
	if (p === "/") return {
		path: "/",
		title: `${SITE.name}: practice Kubernetes on a cluster you can't break`,
		description: SITE.description,
		type: "website",
		jsonld: [{
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: SITE.name,
			description: SITE.description,
			...SITE.url ? { url: SITE.url } : {}
		}, {
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: SITE.name,
			applicationCategory: "DeveloperApplication",
			operatingSystem: "Any (runs in a web browser)",
			description: SITE.description,
			offers: {
				"@type": "Offer",
				price: "0",
				priceCurrency: "USD"
			}
		}]
	};
	if (p === "/blog") return {
		path: p,
		title: `Blog · ${SITE.name}`,
		description: "A step-by-step course on running a real multi-node Kubernetes cluster on your own computer with kind and k3d: concepts, deployments, images, Helm 2, permissions and clean-up.",
		type: "website",
		jsonld: [{
			"@context": "https://schema.org",
			"@type": "Blog",
			name: `${SITE.name} blog`,
			blogPost: posts.map((x) => ({
				"@type": "BlogPosting",
				headline: x.title,
				url: absolute("/blog/" + x.slug)
			}))
		}]
	};
	const m = /^\/blog\/([\w-]+)$/.exec(p);
	if (m) {
		const post = bySlug(m[1]);
		if (post) return {
			path: p,
			title: `${post.title} · ${SITE.name}`,
			description: post.description,
			type: "article",
			published: post.date,
			jsonld: [{
				"@context": "https://schema.org",
				"@type": "Article",
				headline: post.title,
				description: post.description,
				datePublished: post.date,
				dateModified: post.date,
				author: PUBLISHER,
				publisher: PUBLISHER,
				...SITE.url ? { mainEntityOfPage: absolute(p) } : {}
			}]
		};
	}
	if (p === "/privacy") return {
		path: p,
		title: `Privacy · ${SITE.name}`,
		description: "KubeDojo has no accounts, no analytics and no network calls. This page lists the only two things it stores in your browser.",
		type: "website"
	};
	if (p === "/app") return {
		path: p,
		title: `Playground · ${SITE.name}`,
		description: "The KubeDojo playground: a simulated kind, k3d, docker, kubectl and Helm 2 environment with a live view of the cluster.",
		type: "website",
		noindex: false
	};
	return {
		path: p,
		title: `Page not found · ${SITE.name}`,
		description: "This page does not exist.",
		type: "website",
		noindex: true
	};
}
//#endregion
//#region src/components/usePageMeta.js
function usePageMeta({ title, description }) {
	useEffect(() => {
		if (title) document.title = title;
		if (description) {
			let m = document.querySelector("meta[name=\"description\"]");
			if (!m) {
				m = document.createElement("meta");
				m.name = "description";
				document.head.appendChild(m);
			}
			m.content = description;
		}
	}, [title, description]);
}
//#endregion
//#region src/landing/scenes.js
var NODES = [
	{
		id: "cp",
		name: "control-plane",
		role: "control-plane"
	},
	{
		id: "w1",
		name: "worker",
		role: "worker"
	},
	{
		id: "w2",
		name: "worker2",
		role: "worker"
	}
];
var PODS = [
	{
		id: "web-a",
		w: "web"
	},
	{
		id: "web-b",
		w: "web"
	},
	{
		id: "web-c",
		w: "web"
	},
	{
		id: "web-d",
		w: "web"
	},
	{
		id: "api-a",
		w: "api"
	},
	{
		id: "api-b",
		w: "api"
	}
];
var SHEETS = [
	{
		n: 1,
		title: "cluster",
		rev: "A",
		note: "3 nodes, nothing running",
		pods: {},
		svc: false,
		down: [],
		callouts: [{
			at: "node",
			text: "NODE: one machine of the cluster"
		}, {
			at: "frame",
			text: "CLUSTER: the boundary of everything below"
		}]
	},
	{
		n: 2,
		title: "deploy",
		rev: "B",
		note: "4 web pods, one Service",
		pods: {
			"web-a": ["w1", "Running"],
			"web-b": ["w1", "Running"],
			"web-c": ["w2", "Running"],
			"web-d": ["w2", "Running"]
		},
		svc: true,
		down: [],
		callouts: [{
			at: "pod",
			text: "POD: one running copy of the app"
		}, {
			at: "svc",
			text: "SERVICE: a stable address for the pods"
		}]
	},
	{
		n: 3,
		title: "break",
		rev: "C",
		note: "api cannot pull its image",
		pods: {
			"web-a": ["w1", "Running"],
			"web-b": ["w1", "Running"],
			"web-c": ["w2", "Running"],
			"web-d": ["w2", "Running"],
			"api-a": ["w1", "ImagePullBackOff"],
			"api-b": ["w2", "ImagePullBackOff"]
		},
		svc: true,
		down: [],
		callouts: [{
			at: "fail",
			text: "ImagePullBackOff: image ngnix:1.27 not found",
			tone: "bad"
		}]
	},
	{
		n: 4,
		title: "lose a node",
		rev: "D",
		note: "worker lost, pods move",
		pods: {
			"web-a": ["w2", "Running"],
			"web-b": ["w2", "Running"],
			"web-c": ["w2", "Running"],
			"web-d": ["w2", "Running"],
			"api-a": ["w2", "ImagePullBackOff"],
			"api-b": ["w2", "ImagePullBackOff"]
		},
		svc: true,
		down: ["w1"],
		callouts: [{
			at: "down",
			text: "NotReady: node worker stopped answering",
			tone: "bad"
		}]
	},
	{
		n: 5,
		title: "take it home",
		rev: "E",
		note: "exported as setup.sh",
		pods: {
			"web-a": ["w2", "Running"],
			"web-b": ["w2", "Running"],
			"web-c": ["w2", "Running"],
			"web-d": ["w2", "Running"],
			"api-a": ["w2", "ImagePullBackOff"],
			"api-b": ["w2", "ImagePullBackOff"]
		},
		svc: true,
		down: ["w1"],
		stamp: true,
		callouts: []
	}
];
var SCRIPT_LINES = [
	"#!/usr/bin/env bash",
	"set -euo pipefail",
	"guard() { … }",
	"kind create cluster --name dojo",
	"kubectl apply -f - <<EOF",
	"  kind: Deployment  # web x4",
	"EOF",
	"kubectl rollout status …"
];
var G = {
	nodeY: 128,
	nodeW: 200,
	nodeH: 262,
	nodeX: [
		40,
		260,
		480
	],
	slot: 34,
	gap: 8,
	padX: 14,
	padY: 54,
	cols: 4,
	svc: {
		x: 360,
		y: 52
	}
};
var slotPos = (nodeIdx, k) => ({
	x: G.nodeX[nodeIdx] + G.padX + k % G.cols * (G.slot + G.gap),
	y: G.nodeY + G.padY + Math.floor(k / G.cols) * (G.slot + G.gap)
});
function layout(sheet) {
	const count = {
		cp: 0,
		w1: 0,
		w2: 0
	};
	const out = [];
	for (const p of PODS) {
		const st = sheet.pods[p.id];
		if (!st) {
			out.push({
				...p,
				on: false
			});
			continue;
		}
		const [node, status] = st;
		const ni = NODES.findIndex((n) => n.id === node);
		out.push({
			...p,
			on: true,
			node,
			status,
			...slotPos(ni, count[node]++)
		});
	}
	return out;
}
//#endregion
//#region src/landing/Drawing.jsx
var tone$1 = (st) => st === "Running" ? "ok" : st === "ContainerCreating" || st === "Pending" ? "warn" : "bad";
var cube = "M7 12.5 17 7.5l10 5v10l-10 5-10-5zM7 12.5l10 5 10-5M17 17.5v10";
function Drawing({ step = 0, crosshair = false }) {
	const hatchId = "hatch" + useId().replace(/:/g, "");
	const sheet = SHEETS[Math.min(step, SHEETS.length - 1)];
	const pods = layout(sheet);
	const [info, setInfo] = useState(null);
	const ref = useRef(null);
	const [xy, setXy] = useState(null);
	const webOn = pods.filter((p) => p.on && p.w === "web");
	const counts = {
		cp: 0,
		w1: 0,
		w2: 0
	};
	for (const p of pods) if (p.on) counts[p.node]++;
	const groups = (n) => {
		const g = {};
		for (const p of pods) if (p.on && p.node === n) g[p.w] = (g[p.w] || 0) + 1;
		return Object.entries(g);
	};
	useEffect(() => {
		if (!crosshair || !ref.current || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
		const el = ref.current;
		let raf = 0, last = null;
		const move = (e) => {
			last = e;
			if (!raf) raf = requestAnimationFrame(() => {
				raf = 0;
				const r = el.getBoundingClientRect();
				const x = last.clientX - r.left, y = last.clientY - r.top;
				el.style.setProperty("--cx", x + "px");
				el.style.setProperty("--cy", y + "px");
				setXy([Math.round(x * 720 / r.width), Math.round(y * 560 / r.height)]);
			});
		};
		const leave = () => setXy(null);
		el.addEventListener("pointermove", move);
		el.addEventListener("pointerleave", leave);
		return () => {
			el.removeEventListener("pointermove", move);
			el.removeEventListener("pointerleave", leave);
			cancelAnimationFrame(raf);
		};
	}, [crosshair]);
	return /* @__PURE__ */ jsxs("figure", {
		className: "dwg" + (xy ? " has-xy" : ""),
		"data-step": step,
		ref,
		children: [/* @__PURE__ */ jsxs("svg", {
			viewBox: "0 0 720 560",
			role: "img",
			"aria-label": `Drawing, sheet ${sheet.n} of ${SHEETS.length}: ${sheet.title}. ${sheet.note}.`,
			children: [
				/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("pattern", {
					id: hatchId,
					width: "7",
					height: "7",
					patternTransform: "rotate(45)",
					patternUnits: "userSpaceOnUse",
					children: /* @__PURE__ */ jsx("line", {
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "7",
						stroke: "currentColor",
						strokeWidth: "1.2"
					})
				}) }),
				/* @__PURE__ */ jsxs("g", {
					className: "frame",
					children: [/* @__PURE__ */ jsx("rect", {
						x: "22",
						y: "104",
						width: "676",
						height: "304",
						rx: "2"
					}), /* @__PURE__ */ jsx("text", {
						x: "34",
						y: "98",
						className: "lbl",
						children: "CLUSTER · dojo"
					})]
				}),
				/* @__PURE__ */ jsxs("g", {
					className: "svc" + (sheet.svc ? " on" : ""),
					children: [
						/* @__PURE__ */ jsx("text", {
							x: "40",
							y: "42",
							className: "lbl",
							children: "CLIENT"
						}),
						/* @__PURE__ */ jsx("rect", {
							x: "40",
							y: "48",
							width: "64",
							height: "26",
							rx: "2",
							className: "box"
						}),
						/* @__PURE__ */ jsx("text", {
							x: "72",
							y: "65",
							className: "mono mid",
							children: "curl"
						}),
						/* @__PURE__ */ jsx("path", {
							d: `M104 61H${G.svc.x - 16}`,
							className: "wire flow"
						}),
						/* @__PURE__ */ jsx("circle", {
							cx: G.svc.x,
							cy: G.svc.y + 9,
							r: "16",
							className: "box strong"
						}),
						/* @__PURE__ */ jsx("text", {
							x: G.svc.x,
							y: G.svc.y + 13,
							className: "mono mid",
							children: "svc"
						}),
						/* @__PURE__ */ jsx("text", {
							x: G.svc.x + 24,
							y: G.svc.y + 4,
							className: "lbl",
							children: "SERVICE · web"
						}),
						webOn.map((p) => /* @__PURE__ */ jsx("line", {
							className: "wire flow",
							x1: G.svc.x,
							y1: G.svc.y + 25,
							x2: p.x + 17,
							y2: p.y
						}, p.id + p.node + p.x + p.y))
					]
				}),
				NODES.map((n, i) => {
					const down = sheet.down.includes(n.id);
					const x = G.nodeX[i];
					return /* @__PURE__ */ jsxs("g", {
						className: "node" + (down ? " down" : ""),
						children: [
							/* @__PURE__ */ jsx("rect", {
								x,
								y: G.nodeY,
								width: G.nodeW,
								height: G.nodeH,
								rx: "2",
								className: "box strong"
							}),
							down && /* @__PURE__ */ jsx("rect", {
								x,
								y: G.nodeY,
								width: G.nodeW,
								height: G.nodeH,
								rx: "2",
								fill: `url(#${hatchId})`,
								className: "hatch"
							}),
							/* @__PURE__ */ jsx("line", {
								x1: x,
								y1: G.nodeY + 34,
								x2: x + G.nodeW,
								y2: G.nodeY + 34,
								className: "rule"
							}),
							/* @__PURE__ */ jsx("text", {
								x: x + 12,
								y: G.nodeY + 22,
								className: "lbl tag",
								children: "NODE"
							}),
							/* @__PURE__ */ jsx("text", {
								x: x + 56,
								y: G.nodeY + 22,
								className: "mono",
								children: n.name
							}),
							/* @__PURE__ */ jsx("circle", {
								cx: x + G.nodeW - 16,
								cy: G.nodeY + 17,
								r: "4.5",
								className: down ? "led bad" : "led ok"
							}),
							/* @__PURE__ */ jsx("text", {
								x: x + 12,
								y: G.nodeY + G.nodeH - 12 - groups(n.id).length * 15,
								className: "lbl dim",
								children: down ? "NotReady" : `${counts[n.id]} pod${counts[n.id] === 1 ? "" : "s"}`
							}),
							groups(n.id).map(([w, c], gi) => /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("text", {
								x: x + 12,
								y: G.nodeY + G.nodeH - 12 - (groups(n.id).length - 1 - gi) * 15,
								className: "lbl tag",
								children: "DEPLOYMENT"
							}), /* @__PURE__ */ jsxs("text", {
								x: x + 100,
								y: G.nodeY + G.nodeH - 12 - (groups(n.id).length - 1 - gi) * 15,
								className: "mono",
								children: [
									w,
									" ×",
									c
								]
							})] }, w))
						]
					}, n.id);
				}),
				pods.map((p, i) => {
					const pos = p.on ? {
						x: p.x,
						y: p.y
					} : slotPos(1, i);
					return /* @__PURE__ */ jsxs("g", {
						className: `pod ${p.on ? "on " + tone$1(p.status) : "off"}`,
						style: {
							transform: `translate(${pos.x}px, ${pos.y}px)`,
							transitionDelay: p.on ? `${i % 4 * 70}ms` : "0ms"
						},
						onPointerEnter: () => p.on && setInfo(`${p.id} · ${p.node === "w1" ? "worker" : "worker2"} · ${p.status}`),
						onPointerLeave: () => setInfo(null),
						children: [
							/* @__PURE__ */ jsx("rect", {
								width: G.slot,
								height: G.slot,
								rx: "3",
								className: "podbox"
							}),
							/* @__PURE__ */ jsx("path", {
								d: cube,
								className: "cube",
								transform: "translate(0 0)"
							}),
							tone$1(p.status) === "bad" && /* @__PURE__ */ jsx("path", {
								d: "M9 9 25 25M25 9 9 25",
								className: "cross"
							})
						]
					}, p.id);
				}),
				sheet.callouts.map((c, i) => {
					const spec = {
						node: {
							x1: 120,
							y1: 390,
							x2: 120,
							y2: 426,
							tx: 40,
							ty: 440
						},
						frame: {
							x1: 640,
							y1: 104,
							x2: 640,
							y2: 92,
							tx: 372,
							ty: 98
						},
						pod: {
							x1: 291,
							y1: 216,
							x2: 200,
							y2: 428,
							tx: 40,
							ty: 440
						},
						svc: {
							x1: G.svc.x + 14,
							y1: G.svc.y,
							x2: G.svc.x + 40,
							y2: 28,
							tx: G.svc.x + 44,
							ty: 26
						},
						fail: {
							x1: 375,
							y1: 222,
							x2: 200,
							y2: 428,
							tx: 40,
							ty: 440
						},
						down: {
							x1: 300,
							y1: 390,
							x2: 150,
							y2: 428,
							tx: 40,
							ty: 440
						}
					}[c.at];
					if (!spec) return null;
					return /* @__PURE__ */ jsxs("g", {
						className: "callout " + (c.tone || ""),
						style: { animationDelay: `${300 + i * 150}ms` },
						children: [/* @__PURE__ */ jsx("path", {
							d: `M${spec.x1} ${spec.y1}L${spec.x2} ${spec.y2}`,
							className: "leader"
						}), /* @__PURE__ */ jsx("text", {
							x: spec.tx,
							y: spec.ty,
							className: "note",
							children: c.text
						})]
					}, c.at + c.text);
				}),
				/* @__PURE__ */ jsxs("g", {
					className: "sheet-script" + (sheet.stamp ? " on" : ""),
					children: [
						/* @__PURE__ */ jsx("rect", {
							x: "396",
							y: "112",
							width: "288",
							height: "284",
							rx: "2",
							className: "paper"
						}),
						/* @__PURE__ */ jsx("text", {
							x: "410",
							y: "134",
							className: "lbl tag",
							children: "SETUP.SH"
						}),
						SCRIPT_LINES.map((l, i) => /* @__PURE__ */ jsx("text", {
							x: "410",
							y: 160 + i * 26,
							className: "mono sm",
							children: l
						}, i)),
						/* @__PURE__ */ jsxs("g", {
							className: "stamp",
							transform: "translate(590 372) rotate(-9)",
							children: [/* @__PURE__ */ jsx("rect", {
								x: "-70",
								y: "-22",
								width: "140",
								height: "44",
								rx: "3"
							}), /* @__PURE__ */ jsx("text", {
								x: "0",
								y: "6",
								className: "stampt",
								children: "VERIFIED"
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("g", {
					className: "tb",
					transform: "translate(396 438)",
					children: [
						/* @__PURE__ */ jsx("rect", {
							width: "304",
							height: "104",
							className: "box strong"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "0",
							y1: "26",
							x2: "304",
							y2: "26",
							className: "rule"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "0",
							y1: "52",
							x2: "304",
							y2: "52",
							className: "rule"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "0",
							y1: "78",
							x2: "304",
							y2: "78",
							className: "rule"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "214",
							y1: "26",
							x2: "214",
							y2: "104",
							className: "rule"
						}),
						/* @__PURE__ */ jsxs("text", {
							x: "10",
							y: "17",
							className: "mono b",
							children: [
								"KUBEDOJO / SHEET ",
								sheet.n,
								" OF ",
								SHEETS.length
							]
						}),
						/* @__PURE__ */ jsx("text", {
							x: "10",
							y: "43",
							className: "mono",
							children: sheet.title
						}),
						/* @__PURE__ */ jsxs("text", {
							x: "224",
							y: "43",
							className: "mono",
							children: ["REV ", sheet.rev]
						}),
						/* @__PURE__ */ jsx("text", {
							x: "10",
							y: "69",
							className: "mono sm",
							children: info || sheet.note
						}),
						/* @__PURE__ */ jsx("text", {
							x: "224",
							y: "69",
							className: "mono sm",
							children: xy ? `X ${xy[0]}` : "SCALE 1:1"
						}),
						/* @__PURE__ */ jsx("text", {
							x: "10",
							y: "95",
							className: "mono sm",
							children: `${pods.filter((p) => p.on).length} pods · ${NODES.length - sheet.down.length}/${NODES.length} nodes`
						}),
						/* @__PURE__ */ jsx("text", {
							x: "224",
							y: "95",
							className: "mono sm",
							children: xy ? `Y ${xy[1]}` : "DWG 001"
						})
					]
				})
			]
		}), crosshair && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("i", {
			className: "xh xh-v",
			"aria-hidden": "true"
		}), /* @__PURE__ */ jsx("i", {
			className: "xh xh-h",
			"aria-hidden": "true"
		})] })]
	});
}
//#endregion
//#region src/landing/Story.jsx
var CREATE = [...[
	"cat > kind.yaml <<'EOF'",
	"kind: Cluster",
	"apiVersion: kind.x-k8s.io/v1alpha4",
	"nodes:",
	"- role: control-plane",
	"- role: worker",
	"- role: worker",
	"EOF"
], "kind create cluster --name dojo --config kind.yaml"];
var run = (cmds) => `/app?run=${encodeURIComponent(JSON.stringify(cmds))}&notour=1`;
var STEPS = [
	{
		name: "cluster",
		title: "One command, three nodes.",
		text: "kind builds a cluster whose nodes are Docker containers. This drawing is what the simulator builds for you: a control-plane node and two workers, ready and empty.",
		code: ["kind create cluster --name dojo --config kind.yaml"],
		run: CREATE
	},
	{
		name: "deploy",
		title: "Deploy, and watch it fill.",
		text: "A Deployment asks for four copies of the app. The scheduler places the pods on the workers, and a Service gives them a single address.",
		code: ["kubectl create deployment web --image=nginx:1.27 --replicas=4", "kubectl expose deployment web --port=80"],
		run: [
			...CREATE,
			"kubectl create deployment web --image=nginx:1.27 --replicas=4",
			"kubectl expose deployment web --port=80",
			8,
			"kubectl get pods -o wide"
		]
	},
	{
		name: "break",
		title: "Break it on purpose.",
		text: "One typo in an image name and two pods never start. The Events say exactly why. Fix the name and the Deployment replaces them by itself.",
		code: ["kubectl create deployment api --image=ngnix:1.27 --replicas=2", "kubectl describe pod -l app=api"],
		run: [
			...CREATE,
			"kubectl create deployment api --image=ngnix:1.27 --replicas=2",
			8,
			"kubectl get pods"
		]
	},
	{
		name: "lose a node",
		title: "Lose a machine.",
		text: "Stop a node and Kubernetes starts its pods again on the nodes that are left. In kind a node is a Docker container, so this is a real failure, not a mock.",
		code: ["docker stop dojo-worker"],
		run: [
			...CREATE,
			"kubectl create deployment web --image=nginx:1.27 --replicas=4",
			10,
			"docker stop dojo-worker",
			40,
			"kubectl get pods -o wide"
		]
	},
	{
		name: "take it home",
		title: "Take it home.",
		text: "When it works, export it. A script rebuilds this cluster with kind or k3d on your computer, and refuses to run against any other cluster of yours.",
		code: [],
		run: null
	}
];
function Story() {
	const [active, setActive] = useState(0);
	const refs = useRef([]);
	useEffect(() => {
		if (!matchMedia("(min-width: 981px)").matches) return;
		const io = new IntersectionObserver((es) => {
			for (const e of es) if (e.isIntersecting) setActive(Number(e.target.dataset.step));
		}, { rootMargin: "-42% 0px -42% 0px" });
		refs.current.forEach((el) => el && io.observe(el));
		return () => io.disconnect();
	}, []);
	return /* @__PURE__ */ jsx("section", {
		className: "story",
		"aria-label": "How KubeDojo works, in five sheets",
		children: /* @__PURE__ */ jsxs("div", {
			className: "wrap story-grid",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "story-text",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "hero",
						ref: (el) => {
							refs.current[0] = el;
						},
						"data-step": "0",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "kicker",
								children: "a simulator for kind, k3d, docker, kubectl and helm 2"
							}),
							/* @__PURE__ */ jsx("h1", { children: "practice kubernetes on a cluster you can't break." }),
							/* @__PURE__ */ jsx("p", {
								className: "hero-sub",
								children: "Type real commands, watch the cluster react, then export what you built as a setup script for your own machine. Everything runs in this page: no account, no install, no network calls."
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "hero-cta",
								children: [/* @__PURE__ */ jsx(import_dist.Link, {
									to: "/app",
									className: "btn btn-primary",
									...appIntent,
									children: SITE.app.label
								}), /* @__PURE__ */ jsx(import_dist.Link, {
									to: "/blog",
									className: "btn",
									children: "Read the guides"
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "hero-note",
								children: "scroll: the drawing on the right is the simulator's own cluster, one sheet at a time."
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "step-fig mobile-only",
						children: /* @__PURE__ */ jsx(Drawing, { step: 0 })
					}),
					STEPS.map((s, i) => /* @__PURE__ */ jsxs("article", {
						className: "step",
						"data-step": i,
						ref: (el) => {
							if (i > 0) refs.current[i] = el;
						},
						children: [
							/* @__PURE__ */ jsxs("p", {
								className: "step-no",
								children: [
									"sheet ",
									String(i + 1).padStart(2, "0"),
									" / ",
									s.name
								]
							}),
							/* @__PURE__ */ jsx("h2", { children: s.title }),
							/* @__PURE__ */ jsx("p", { children: s.text }),
							s.code.length > 0 && /* @__PURE__ */ jsx("pre", {
								className: "step-code",
								tabIndex: 0,
								children: /* @__PURE__ */ jsx("code", { children: s.code.map((c) => "$ " + c).join("\n") })
							}),
							s.run ? /* @__PURE__ */ jsxs(import_dist.Link, {
								className: "arrow-link",
								to: run(s.run),
								...appIntent,
								children: ["run this in the playground ", /* @__PURE__ */ jsx("span", {
									"aria-hidden": "true",
									children: "→"
								})]
							}) : /* @__PURE__ */ jsxs(import_dist.Link, {
								className: "arrow-link",
								to: "/app",
								...appIntent,
								children: ["open the playground and press the export icon ", /* @__PURE__ */ jsx("span", {
									"aria-hidden": "true",
									children: "→"
								})]
							}),
							i > 0 && /* @__PURE__ */ jsx("div", {
								className: "step-fig mobile-only",
								children: /* @__PURE__ */ jsx(Drawing, { step: i })
							})
						]
					}, s.name))
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "story-fig",
				"aria-hidden": "false",
				children: /* @__PURE__ */ jsx("div", {
					className: "sticky",
					children: /* @__PURE__ */ jsx(Drawing, {
						step: active,
						crosshair: true
					})
				})
			})]
		})
	});
}
//#endregion
//#region src/landing/Section.jsx
function Section({ id, no, label, title, children }) {
	return /* @__PURE__ */ jsx("section", {
		className: "sheet",
		id,
		"aria-labelledby": id + "-h",
		children: /* @__PURE__ */ jsx("div", {
			className: "wrap",
			children: /* @__PURE__ */ jsxs("div", {
				className: "sheet-frame",
				children: [
					/* @__PURE__ */ jsxs("header", {
						className: "sheet-head",
						children: [/* @__PURE__ */ jsxs("span", { children: ["sheet ", String(no).padStart(2, "0")] }), /* @__PURE__ */ jsx("span", { children: label })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "sheet-body",
						children: [/* @__PURE__ */ jsx("h2", {
							id: id + "-h",
							className: "statement",
							children: title
						}), children]
					}),
					/* @__PURE__ */ jsxs("footer", {
						className: "sheet-foot",
						"aria-hidden": "true",
						children: [
							/* @__PURE__ */ jsx("span", { children: "kubedojo" }),
							/* @__PURE__ */ jsx("span", { children: "dwg 001" }),
							/* @__PURE__ */ jsxs("span", { children: ["rev ", String.fromCharCode(64 + (no % 26 || 26))] })
						]
					})
				]
			})
		})
	});
}
var demos_default = {
	hero: [
		{
			"cmd": "kind create cluster --name dojo --config kind.yaml",
			"out": [
				"Creating cluster \"dojo\" ...",
				" ✓ Ensuring node image (kindest/node:v1.35.0) 🖼",
				" ✓ Preparing nodes 📦 📦 📦",
				" ✓ Writing configuration 📜",
				" ✓ Starting control-plane 🕹️",
				" ✓ Installing CNI 🔌",
				" ✓ Installing StorageClass 💾",
				" ✓ Joining worker nodes 🚜",
				"Set kubectl context to \"kind-dojo\""
			],
			"snap": [
				{
					"name": "control-plane",
					"ready": true,
					"role": "control-plane",
					"pods": []
				},
				{
					"name": "worker",
					"ready": true,
					"role": "worker",
					"pods": []
				},
				{
					"name": "worker2",
					"ready": true,
					"role": "worker",
					"pods": []
				}
			]
		},
		{
			"cmd": "kubectl create deployment web --image=nginx:1.27 --replicas=4",
			"out": ["deployment.apps/web created"],
			"snap": [
				{
					"name": "control-plane",
					"ready": true,
					"role": "control-plane",
					"pods": []
				},
				{
					"name": "worker",
					"ready": true,
					"role": "worker",
					"pods": [{
						"id": "4k4wb",
						"status": "ContainerCreating"
					}, {
						"id": "dw5w6",
						"status": "ContainerCreating"
					}]
				},
				{
					"name": "worker2",
					"ready": true,
					"role": "worker",
					"pods": [{
						"id": "wb9pm",
						"status": "ContainerCreating"
					}, {
						"id": "7s65r",
						"status": "ContainerCreating"
					}]
				}
			]
		},
		{
			"cmd": "kubectl get pods",
			"out": [
				"NAME                  READY   STATUS    RESTARTS   AGE",
				"web-bbd7113d6-wb9pm   1/1     Running   0          12s",
				"web-bbd7113d6-4k4wb   1/1     Running   0          12s",
				"web-bbd7113d6-7s65r   1/1     Running   0          12s",
				"web-bbd7113d6-dw5w6   1/1     Running   0          12s"
			],
			"snap": [
				{
					"name": "control-plane",
					"ready": true,
					"role": "control-plane",
					"pods": []
				},
				{
					"name": "worker",
					"ready": true,
					"role": "worker",
					"pods": [{
						"id": "4k4wb",
						"status": "Running"
					}, {
						"id": "dw5w6",
						"status": "Running"
					}]
				},
				{
					"name": "worker2",
					"ready": true,
					"role": "worker",
					"pods": [{
						"id": "wb9pm",
						"status": "Running"
					}, {
						"id": "7s65r",
						"status": "Running"
					}]
				}
			]
		},
		{
			"cmd": "docker stop dojo-worker",
			"out": ["dojo-worker"],
			"snap": [
				{
					"name": "control-plane",
					"ready": true,
					"role": "control-plane",
					"pods": []
				},
				{
					"name": "worker",
					"ready": true,
					"role": "worker",
					"pods": [{
						"id": "4k4wb",
						"status": "Running"
					}, {
						"id": "dw5w6",
						"status": "Running"
					}]
				},
				{
					"name": "worker2",
					"ready": true,
					"role": "worker",
					"pods": [{
						"id": "wb9pm",
						"status": "Running"
					}, {
						"id": "7s65r",
						"status": "Running"
					}]
				}
			]
		},
		{
			"cmd": "kubectl get pods",
			"out": [
				"NAME                  READY   STATUS    RESTARTS   AGE",
				"web-bbd7113d6-wb9pm   1/1     Running   0          82s",
				"web-bbd7113d6-7s65r   1/1     Running   0          82s",
				"web-bbd7113d6-pmwmf   1/1     Running   0          58s",
				"web-bbd7113d6-ncp9h   1/1     Running   0          58s"
			],
			"snap": [
				{
					"name": "control-plane",
					"ready": true,
					"role": "control-plane",
					"pods": []
				},
				{
					"name": "worker",
					"ready": false,
					"role": "worker",
					"pods": []
				},
				{
					"name": "worker2",
					"ready": true,
					"role": "worker",
					"pods": [
						{
							"id": "wb9pm",
							"status": "Running"
						},
						{
							"id": "7s65r",
							"status": "Running"
						},
						{
							"id": "pmwmf",
							"status": "Running"
						},
						{
							"id": "ncp9h",
							"status": "Running"
						}
					]
				}
			]
		}
	],
	scenarios: [
		{
			"id": "image",
			"tab": "ImagePullBackOff",
			"title": "A typo in the image name",
			"lesson": "Two replicas, zero running. The Events say why: the registry has no image called ngnix. Fix the name and the Deployment replaces the pods by itself.",
			"lines": [
				{
					"cmd": "kubectl create deployment web --image=ngnix:1.27 --replicas=2",
					"out": ["deployment.apps/web created"]
				},
				{
					"cmd": "kubectl get pods",
					"out": [
						"NAME                  READY   STATUS             RESTARTS   AGE",
						"web-4737f5h42-zf87j   0/1     ImagePullBackOff   0          25s",
						"web-4737f5h42-mwqvr   0/1     ImagePullBackOff   0          25s"
					]
				},
				{
					"cmd": "kubectl describe pod -l app=web | grep -E 'Failed|BackOff' | head -2",
					"out": ["      Reason:       ImagePullBackOff", "  Warning   Failed      24s   kubelet             Failed to pull image \"ngnix:1.27\": rpc error: code = Unknown desc =…"]
				},
				{
					"cmd": "kubectl set image deployment/web ngnix=nginx:1.27",
					"out": ["deployment.apps/web image updated"]
				},
				{
					"cmd": "kubectl get pods",
					"out": [
						"NAME                  READY   STATUS    RESTARTS   AGE",
						"web-7ff35962c-bv9ff   1/1     Running   0          20s",
						"web-7ff35962c-6l9cf   1/1     Running   0          19s"
					]
				}
			],
			"run": [
				"kind create cluster --name dojo",
				"kubectl create deployment web --image=ngnix:1.27 --replicas=2",
				8,
				"kubectl get pods"
			]
		},
		{
			"id": "crash",
			"tab": "CrashLoopBackOff",
			"title": "A container that exits straight away",
			"lesson": "The image pulls fine and the process dies with exit code 1. Kubernetes restarts it with growing delays. Logs show what it printed before dying.",
			"lines": [
				{
					"cmd": "kubectl run crash --image=busybox -- sh -c \"echo starting; exit 1\"",
					"out": ["pod/crash created"]
				},
				{
					"cmd": "kubectl get pod crash",
					"out": ["NAME    READY   STATUS             RESTARTS   AGE", "crash   0/1     CrashLoopBackOff   2          40s"]
				},
				{
					"cmd": "kubectl logs crash",
					"out": ["starting", "starting"]
				},
				{
					"cmd": "kubectl describe pod crash | grep -E 'BackOff|Back-off'",
					"out": ["      Reason:       CrashLoopBackOff", "  Warning   BackOff     21s (x2 over 35s)   kubelet             Back-off restarting failed container crash in pod cra…"]
				}
			],
			"run": [
				"kind create cluster --name dojo",
				"kubectl run crash --image=busybox -- sh -c \"echo starting; exit 1\"",
				20,
				"kubectl get pod crash",
				"kubectl logs crash"
			]
		},
		{
			"id": "node",
			"tab": "Node failure",
			"title": "A worker node disappears",
			"lesson": "kind nodes are Docker containers, so stopping one is a real node failure. The node goes NotReady and its pods are recreated on the nodes that are left.",
			"lines": [
				{
					"cmd": "kubectl create deployment web --image=nginx:1.27 --replicas=4",
					"out": ["deployment.apps/web created"]
				},
				{
					"cmd": "kubectl get pods -o wide",
					"out": [
						"NAME                  READY   STATUS    RESTARTS   AGE   IP           NODE           NOMINATED NODE   READINESS GATES",
						"web-bbd7113d6-g5fbr   1/1     Running   0          15s   10.244.2.5   dojo-worker2   <none>           <none>",
						"web-bbd7113d6-nqxnn   1/1     Running   0          15s   10.244.1.6   dojo-worker    <none>           <none>",
						"web-bbd7113d6-5nq5t   1/1     Running   0          15s   10.244.2.6   dojo-worker2   <none>           <none>",
						"web-bbd7113d6-7n5zq   1/1     Running   0          15s   10.244.1.7   dojo-worker    <none>           <none>"
					]
				},
				{
					"cmd": "docker stop dojo-worker",
					"out": ["dojo-worker"]
				},
				{
					"cmd": "kubectl get nodes",
					"out": [
						"NAME                 STATUS     ROLES           AGE    VERSION",
						"dojo-control-plane   Ready      control-plane   2m0s   v1.35.0",
						"dojo-worker          NotReady   <none>          2m0s   v1.35.0",
						"dojo-worker2         Ready      <none>          2m0s   v1.35.0"
					]
				},
				{
					"cmd": "kubectl get pods -o wide",
					"out": [
						"NAME                  READY   STATUS    RESTARTS   AGE   IP           NODE           NOMINATED NODE   READINESS GATES",
						"web-bbd7113d6-g5fbr   1/1     Running   0          75s   10.244.2.5   dojo-worker2   <none>           <none>",
						"web-bbd7113d6-5nq5t   1/1     Running   0          75s   10.244.2.6   dojo-worker2   <none>           <none>",
						"web-bbd7113d6-cjdgg   1/1     Running   0          48s   10.244.2.8   dojo-worker2   <none>           <none>",
						"web-bbd7113d6-pz2c4   1/1     Running   0          48s   10.244.2.9   dojo-worker2   <none>           <none>"
					]
				}
			],
			"run": [
				"cat > kind.yaml <<'EOF'",
				"kind: Cluster",
				"apiVersion: kind.x-k8s.io/v1alpha4",
				"nodes:",
				"- role: control-plane",
				"- role: worker",
				"- role: worker",
				"EOF",
				"kind create cluster --name dojo --config kind.yaml",
				"kubectl create deployment web --image=nginx:1.27 --replicas=4",
				10,
				"docker stop dojo-worker",
				40,
				"kubectl get nodes"
			]
		},
		{
			"id": "rbac",
			"tab": "RBAC",
			"title": "Who may delete pods?",
			"lesson": "A new ServiceAccount can do nothing. A Role grants verbs on resources, a RoleBinding attaches it to the account, and only inside that one namespace.",
			"lines": [
				{
					"cmd": "kubectl create serviceaccount dev -n web",
					"out": ["serviceaccount/dev created"]
				},
				{
					"cmd": "kubectl auth can-i delete pods --as=system:serviceaccount:web:dev -n web",
					"out": ["no"]
				},
				{
					"cmd": "kubectl create role pod-admin --verb=get,list,delete --resource=pods -n web",
					"out": ["role.rbac.authorization.k8s.io/pod-admin created"]
				},
				{
					"cmd": "kubectl create rolebinding dev-pods --role=pod-admin --serviceaccount=web:dev -n web",
					"out": ["rolebinding.rbac.authorization.k8s.io/dev-pods created"]
				},
				{
					"cmd": "kubectl auth can-i delete pods --as=system:serviceaccount:web:dev -n web",
					"out": ["yes"]
				},
				{
					"cmd": "kubectl auth can-i delete pods --as=system:serviceaccount:web:dev -n default",
					"out": ["no"]
				}
			],
			"run": [
				"kind create cluster --name dojo",
				"kubectl create namespace web",
				"kubectl create serviceaccount dev -n web",
				"kubectl auth can-i delete pods --as=system:serviceaccount:web:dev -n web"
			]
		}
	],
	script: {
		"source": [
			"kubectl create namespace shop",
			"kubectl create deployment web --image=nginx:1.27 --replicas=2 -n shop",
			"kubectl expose deployment web --port=80 -n shop"
		],
		"excerpt": "#!/usr/bin/env bash\nset -euo pipefail\nguard() { …refuse to run unless kubectl points at the new local cluster… }\n\n# ---- the cluster ----\ncat > \"${LAB}/kind-config.yaml\" <<'PG_EOF'\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nnodes:\n- role: control-plane\n- role: worker\n- role: worker\nPG_EOF\nif kind get clusters 2>/dev/null | grep -qx dojo; then echo \"kind cluster dojo already exists, reusing it\"; …\nkubectl config use-context kind-dojo\n\n# Deployment\nguard\nkubectl apply -f - <<'PG_EOF'\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\n  namespace: shop\n  labels:\n    app: web\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:1.27\nPG_EOF\n\n# ---- wait until they are ready ----\nkubectl rollout status deployment/web -n shop --timeout=300s || echo \"WARNING: web was not ready in time, continuing\"",
		"lines": 97
	}
};
//#endregion
//#region src/landing/ClusterPane.jsx
var tone = (s) => s === "Running" ? "ok" : s === "ContainerCreating" || s === "Pending" ? "warn" : s === "Terminating" ? "dim" : "bad";
function ClusterPane({ nodes }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "cp",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "cp-title",
			children: ["cluster ", /* @__PURE__ */ jsx("b", { children: "dojo" })]
		}), (nodes || []).map((n) => /* @__PURE__ */ jsxs("div", {
			className: "cp-node" + (n.ready ? "" : " down"),
			children: [/* @__PURE__ */ jsxs("div", {
				className: "cp-nh",
				children: [
					/* @__PURE__ */ jsx("i", { className: "dot " + (n.ready ? "ok" : "bad") }),
					/* @__PURE__ */ jsx("span", { children: n.name }),
					/* @__PURE__ */ jsx("em", { children: n.ready ? n.role : "NotReady" })
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "cp-pods",
				children: n.pods.map((p) => /* @__PURE__ */ jsx("span", {
					className: "pod " + tone(p.status),
					title: p.status,
					children: p.id
				}, p.id))
			})]
		}, n.name))]
	});
}
//#endregion
//#region src/landing/HeroDemo.jsx
var frames = demos_default.hero;
var LiveDemo = lazy(() => import("./assets/Embed-i4SxIqNU.js"));
var preloadLive = () => import("./assets/Embed-i4SxIqNU.js");
var flatten = (upTo) => frames.slice(0, upTo + 1).flatMap((f) => [{
	k: "cmd",
	t: f.cmd
}, ...f.out.map((t) => ({
	k: "out",
	t
}))]);
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function HeroDemo() {
	const [lines, setLines] = useState(() => flatten(frames.length - 1));
	const [snap, setSnap] = useState(frames[frames.length - 1].snap);
	const [typing, setTyping] = useState(null);
	const [live, setLive] = useState(false);
	const root = useRef(null);
	useLayoutEffect(() => {
		if (!live && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setLines([]);
			setSnap(null);
		}
	}, [live]);
	useEffect(() => {
		if (live || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		let stop = false;
		let visible = true;
		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
		}, { threshold: .15 });
		io.observe(root.current);
		const whenVisible = async () => {
			while (!visible && !stop) await sleep(300);
		};
		(async () => {
			while (!stop) {
				setLines([]);
				setSnap(null);
				await sleep(600);
				for (const f of frames) {
					await whenVisible();
					if (stop) return;
					for (let c = 1; c <= f.cmd.length && !stop; c++) {
						setTyping(f.cmd.slice(0, c));
						await sleep(c % 7 === 0 ? 70 : 24 + c % 3 * 8);
					}
					setTyping(null);
					setLines((l) => [...l, {
						k: "cmd",
						t: f.cmd
					}]);
					await sleep(260);
					setSnap(f.snap);
					for (const t of f.out) {
						if (stop) return;
						setLines((l) => [...l, {
							k: "out",
							t
						}]);
						await sleep(t.length > 60 ? 70 : 45);
					}
					await sleep(1500);
				}
				await sleep(3200);
			}
		})();
		return () => {
			stop = true;
			io.disconnect();
		};
	}, [live]);
	const shown = lines.slice(-17);
	return /* @__PURE__ */ jsxs("figure", {
		className: "demo",
		ref: root,
		children: [
			/* @__PURE__ */ jsxs("figcaption", {
				className: "demo-bar",
				children: [/* @__PURE__ */ jsx("span", { children: "bench: terminal and cluster" }), /* @__PURE__ */ jsx("span", {
					className: "demo-live",
					children: live ? "live simulator" : "real simulator output"
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "demo-body",
				children: live ? /* @__PURE__ */ jsx("div", {
					className: "demo-embed",
					children: /* @__PURE__ */ jsx(Suspense, {
						fallback: /* @__PURE__ */ jsx("div", {
							className: "demo-loading",
							children: "Loading the simulator…"
						}),
						children: /* @__PURE__ */ jsx(LiveDemo, {})
					})
				}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("pre", {
					className: "term",
					"aria-label": "Terminal session",
					children: [shown.map((l, i) => /* @__PURE__ */ jsx("div", {
						className: l.k,
						children: l.k === "cmd" ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
							/* @__PURE__ */ jsx("span", {
								className: "ps",
								children: "$"
							}),
							" ",
							l.t
						] }) : l.t
					}, lines.length - shown.length + i)), typing !== null ? /* @__PURE__ */ jsxs("div", {
						className: "cmd",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "ps",
								children: "$"
							}),
							" ",
							typing,
							/* @__PURE__ */ jsx("span", { className: "caret" })
						]
					}) : /* @__PURE__ */ jsxs("div", {
						className: "cmd",
						children: [/* @__PURE__ */ jsx("span", {
							className: "ps",
							children: "$"
						}), /* @__PURE__ */ jsx("span", { className: "caret" })]
					})]
				}), /* @__PURE__ */ jsx(ClusterPane, { nodes: snap })] })
			}),
			/* @__PURE__ */ jsx("div", {
				className: "demo-foot",
				children: live ? /* @__PURE__ */ jsxs("p", { children: [
					"This is the real simulator. Try ",
					/* @__PURE__ */ jsx("code", { children: "kind create cluster --name dojo" }),
					", then ",
					/* @__PURE__ */ jsx("code", { children: "kubectl create deployment web --image=nginx:1.27" }),
					"."
				] }) : /* @__PURE__ */ jsxs("button", {
					type: "button",
					className: "link-btn",
					onClick: () => setLive(true),
					onPointerEnter: preloadLive,
					onFocus: preloadLive,
					onTouchStart: preloadLive,
					children: ["Type your own commands ", /* @__PURE__ */ jsx("span", {
						"aria-hidden": "true",
						children: "→"
					})]
				})
			})
		]
	});
}
//#endregion
//#region src/landing/Scenarios.jsx
var runLink = (run) => `/app?run=${encodeURIComponent(JSON.stringify(run))}&notour=1`;
function Scenarios() {
	const [cur, setCur] = useState(0);
	const uid = useId();
	const tabs = useRef([]);
	const list = demos_default.scenarios;
	const s = list[cur];
	const onKey = (e) => {
		const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
		if (!d) return;
		e.preventDefault();
		const n = (cur + d + list.length) % list.length;
		setCur(n);
		tabs.current[n] && tabs.current[n].focus();
	};
	return /* @__PURE__ */ jsxs(Section, {
		id: "break",
		no: 7,
		label: "case files",
		title: "read the symptoms, then fix it.",
		children: [/* @__PURE__ */ jsx("div", {
			className: "tabs",
			role: "tablist",
			"aria-label": "Failure scenarios",
			onKeyDown: onKey,
			children: list.map((x, i) => /* @__PURE__ */ jsx("button", {
				ref: (el) => {
					tabs.current[i] = el;
				},
				role: "tab",
				id: `${uid}-t${i}`,
				"aria-selected": i === cur,
				"aria-controls": `${uid}-p`,
				tabIndex: i === cur ? 0 : -1,
				className: i === cur ? "on" : "",
				onClick: () => setCur(i),
				children: x.tab
			}, x.id))
		}), /* @__PURE__ */ jsxs("div", {
			className: "scn",
			role: "tabpanel",
			id: `${uid}-p`,
			"aria-labelledby": `${uid}-t${cur}`,
			children: [/* @__PURE__ */ jsxs("div", {
				className: "scn-text",
				children: [
					/* @__PURE__ */ jsx("h3", { children: s.title }),
					/* @__PURE__ */ jsx("p", { children: s.lesson }),
					/* @__PURE__ */ jsxs(import_dist.Link, {
						className: "arrow-link",
						to: runLink(s.run),
						...appIntent,
						children: ["run it in the playground ", /* @__PURE__ */ jsx("span", {
							"aria-hidden": "true",
							children: "→"
						})]
					})
				]
			}), /* @__PURE__ */ jsx("pre", {
				className: "term scn-term",
				tabIndex: 0,
				"aria-label": `Terminal transcript: ${s.title}`,
				children: s.lines.map((l, i) => /* @__PURE__ */ jsxs("div", {
					className: "scn-step",
					style: { "--i": i },
					children: [/* @__PURE__ */ jsxs("div", {
						className: "cmd",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "ps",
								children: "$"
							}),
							" ",
							l.cmd
						]
					}), l.out.map((o, j) => /* @__PURE__ */ jsx("div", {
						className: "out",
						children: o
					}, j))]
				}, i))
			}, s.id)]
		})]
	});
}
//#endregion
//#region src/landing/TakeItHome.jsx
var FACTS = [
	["It reads the cluster, not your history.", "The script is built from what exists in your current kubectl context: nodes with their labels and taints, namespaces, Deployments, Services, ConfigMaps, RBAC. A typo you made along the way is not in it."],
	["It will not touch another cluster.", "Every step runs behind a guard that stops unless kubectl points at the new local kind or k3d cluster."],
	["It waits and it can be run twice.", "Each Deployment is rolled out before the next step, and an existing cluster with the same name is reused."],
	["Secrets are your call.", "They are included on request, with their values, and the header of the script says so."]
];
function TakeItHome() {
	return /* @__PURE__ */ jsxs(Section, {
		id: "real",
		no: 8,
		label: "export",
		title: "test it here, then run it for real.",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "home-grid",
			children: [/* @__PURE__ */ jsx("ul", {
				className: "facts",
				children: FACTS.map(([h, p]) => /* @__PURE__ */ jsxs("li", { children: [
					/* @__PURE__ */ jsx("strong", { children: h }),
					" ",
					p
				] }, h))
			}), /* @__PURE__ */ jsxs("figure", {
				className: "code-window",
				children: [/* @__PURE__ */ jsxs("figcaption", { children: [/* @__PURE__ */ jsx("span", { children: "setup.sh" }), /* @__PURE__ */ jsx("em", { children: "excerpt of a generated script" })] }), /* @__PURE__ */ jsx("pre", {
					tabIndex: 0,
					children: /* @__PURE__ */ jsx("code", { children: demos_default.script.excerpt })
				})]
			})]
		}), /* @__PURE__ */ jsxs("p", {
			className: "after",
			children: [
				"The script above came from this session in the simulator: ",
				/* @__PURE__ */ jsx("code", { children: "kubectl create namespace shop" }),
				", a two-replica nginx Deployment and its Service, on a three-node kind cluster. ",
				/* @__PURE__ */ jsx(import_dist.Link, {
					className: "arrow-link",
					to: "/app",
					...appIntent,
					children: "open the playground and press the export icon"
				})
			]
		})]
	});
}
//#endregion
//#region src/blog/progress.js
var READ = "kubedojo:read";
var LAST = "kubedojo:last";
var safe = (fn) => {
	try {
		return fn();
	} catch (e) {
		return null;
	}
};
var readSet = () => new Set(safe(() => JSON.parse(localStorage.getItem(READ) || "[]")) || []);
var markRead = (slug) => safe(() => {
	const s = readSet();
	if (s.has(slug)) return;
	s.add(slug);
	localStorage.setItem(READ, JSON.stringify([...s]));
});
var setLast = (slug) => safe(() => localStorage.setItem(LAST, slug));
function useProgress() {
	const [state, setState] = useState({
		read: /* @__PURE__ */ new Set(),
		last: null
	});
	useEffect(() => {
		setState({
			read: readSet(),
			last: safe(() => localStorage.getItem(LAST))
		});
	}, []);
	return state;
}
//#endregion
//#region src/landing/Course.jsx
function Course() {
	const { read, last } = useProgress();
	const resume = last && bySlug(last);
	const done = posts.filter((p) => read.has(p.slug)).length;
	return /* @__PURE__ */ jsxs(Section, {
		id: "guides",
		no: 9,
		label: "the guides",
		title: "a short course, in the order you would do it.",
		children: [
			(done > 0 || resume) && /* @__PURE__ */ jsxs("p", {
				className: "resume",
				"aria-live": "polite",
				children: [done > 0 && /* @__PURE__ */ jsxs("span", { children: [
					done,
					" of ",
					posts.length,
					" read. "
				] }), resume && /* @__PURE__ */ jsxs(Fragment$1, { children: [
					"Pick up at ",
					/* @__PURE__ */ jsx(import_dist.Link, {
						to: `/blog/${resume.slug}`,
						children: resume.title
					}),
					"."
				] })]
			}),
			/* @__PURE__ */ jsx("ol", {
				className: "course",
				children: posts.map((p) => /* @__PURE__ */ jsxs("li", {
					className: read.has(p.slug) ? "is-read" : void 0,
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "n",
							"aria-hidden": "true",
							children: String(p.order).padStart(2, "0")
						}),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", { children: /* @__PURE__ */ jsx(import_dist.Link, {
							to: `/blog/${p.slug}`,
							children: p.title
						}) }), /* @__PURE__ */ jsx("p", { children: p.description })] }),
						/* @__PURE__ */ jsx("span", {
							className: "m",
							children: read.has(p.slug) ? "read" : `${p.minutes} min`
						})
					]
				}, p.slug))
			}),
			/* @__PURE__ */ jsx("p", {
				className: "after",
				children: /* @__PURE__ */ jsx(import_dist.Link, {
					className: "arrow-link",
					to: "/blog",
					children: "browse and search all posts"
				})
			})
		]
	});
}
//#endregion
//#region src/landing/Limits.jsx
var MODELLED = [
	"Multi-node kind and k3d clusters, node failure and rescheduling",
	"Deployments, rolling updates and rollbacks",
	"Probes, init containers, sidecars, OOMKilled",
	"HPA, PodDisruptionBudgets, drains",
	"RBAC, ServiceAccounts, quotas, Pod Security",
	"Ingress with ingress-nginx and Traefik",
	"Helm 2 with Tiller, hooks, tests and rollback",
	"docker build, run, exec, volumes and compose",
	"A shell with pipes, heredocs, loops, vi, ls and tree"
];
var NOT = [
	"Your own application code. An image built from your Dockerfile answers on its EXPOSEd port and does nothing else.",
	"Registries beyond about 25 well-known Docker Hub images.",
	"StatefulSets and PersistentVolumes.",
	"CRDs and operators.",
	"Real networking, real TLS and the internet."
];
function Limits() {
	return /* @__PURE__ */ jsxs(Section, {
		id: "limits",
		no: 10,
		label: "tolerances",
		title: "close to the real tools, and honest about the gaps.",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "two-col",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", { children: "within tolerance" }), /* @__PURE__ */ jsx("ul", { children: MODELLED.map((x) => /* @__PURE__ */ jsx("li", { children: x }, x)) })] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", { children: "out of scope" }), /* @__PURE__ */ jsx("ul", { children: NOT.map((x) => /* @__PURE__ */ jsx("li", { children: x }, x)) })] })]
		}), /* @__PURE__ */ jsx("p", {
			className: "after",
			children: "The first run of an exported script on a real machine is the real test. Where the simulator is more forgiving than the real tools, the guides say so."
		})]
	});
}
//#endregion
//#region src/landing/Faq.jsx
var FAQ = [
	["Is it safe to run?", "Nothing in it is real. There is no Docker and no cluster, and once the page has loaded it makes no network requests at all. The only thing it writes is a small amount of data to your browser's local storage."],
	["Do I need Docker or a cluster to use it?", "No. You need them only if you want to run an exported script on your own computer."],
	["What does it save?", "The virtual files you create (for example the Helm chart in ~/myapp) and whether you have seen the tour. The simulated clusters are not saved: each visit, and each press of Reset, starts a fresh world."],
	["Why does it start in a red PRODUCTION cluster?", "On purpose. A real mistake in kubectl is usually run against the wrong context, so the first habit worth building is reading kubectl config current-context before you type."],
	["How close is it to real kubectl?", "Commands, flags and output are modelled on the real tools, and pods go through the same states you would see. It is a simulation, so expect gaps: the section above lists them."],
	["Does it work on a phone?", "The guides and this page do. The playground is built around a keyboard and a wide screen, so on a phone it is usable but cramped."]
];
function Faq() {
	return /* @__PURE__ */ jsx(Section, {
		id: "faq",
		no: 11,
		label: "questions",
		title: "before you start.",
		children: /* @__PURE__ */ jsx("div", {
			className: "faq",
			children: FAQ.map(([q, a]) => /* @__PURE__ */ jsxs("details", { children: [/* @__PURE__ */ jsx("summary", { children: q }), /* @__PURE__ */ jsx("p", { children: a })] }, q))
		})
	});
}
//#endregion
//#region src/pages/Home.jsx
function Home() {
	usePageMeta(metaFor("/"));
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Story, {}),
		/* @__PURE__ */ jsxs(Section, {
			id: "bench",
			no: 6,
			label: "the bench",
			title: "now type your own.",
			children: [/* @__PURE__ */ jsx("p", {
				className: "after",
				children: "Below is a recorded session. Press the link under it and the same window becomes the real simulator: kind, k3d, docker, kubectl and helm 2, running in your browser."
			}), /* @__PURE__ */ jsx(HeroDemo, {})]
		}),
		/* @__PURE__ */ jsx(Scenarios, {}),
		/* @__PURE__ */ jsx(TakeItHome, {}),
		/* @__PURE__ */ jsx(Course, {}),
		/* @__PURE__ */ jsx(Limits, {}),
		/* @__PURE__ */ jsx(Faq, {})
	] });
}
//#endregion
//#region src/pages/Blog.jsx
var haystack = (p) => [
	p.title,
	p.description,
	p.tags.join(" "),
	p.headings.join(" ")
].join(" ").toLowerCase();
var index = posts.map((p) => ({
	p,
	h: haystack(p)
}));
function Blog() {
	usePageMeta(metaFor("/blog"));
	const [{ q, tag }, setF] = useState({
		q: "",
		tag: ""
	});
	useEffect(() => {
		const p = new URLSearchParams(location.search);
		setF({
			q: p.get("q") || "",
			tag: p.get("tag") || ""
		});
	}, []);
	const { read, last } = useProgress();
	const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
	const shown = useMemo(() => index.filter(({ p, h }) => (!tag || p.tags.includes(tag)) && terms.every((t) => h.includes(t))).map((x) => x.p), [q, tag]);
	const apply = (next) => {
		setF(next);
		const p = new URLSearchParams();
		if (next.q) p.set("q", next.q);
		if (next.tag) p.set("tag", next.tag);
		history.replaceState(history.state, "", location.pathname + (p.size ? "?" + p : ""));
	};
	const set = (k, v) => apply({
		q,
		tag,
		[k]: v
	});
	const resume = last && posts.find((p) => p.slug === last);
	const done = posts.filter((p) => read.has(p.slug)).length;
	return /* @__PURE__ */ jsxs("div", {
		className: "wrap blog-index",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "page-head",
				children: [
					/* @__PURE__ */ jsx("h1", { children: "Blog" }),
					/* @__PURE__ */ jsx("p", {
						className: "lede",
						children: "A short course on running a real multi-node Kubernetes cluster on your own computer with kind or k3d: the concepts, deployments, your own images, Helm 2, permissions and clean-up. Read it in order or jump to what you need, and try every command in the playground first."
					}),
					(done > 0 || resume) && /* @__PURE__ */ jsxs("p", {
						className: "resume",
						"aria-live": "polite",
						children: [done > 0 && /* @__PURE__ */ jsxs("span", { children: [
							done,
							" of ",
							posts.length,
							" read. "
						] }), resume && /* @__PURE__ */ jsxs(Fragment$1, { children: [
							"Continue with ",
							/* @__PURE__ */ jsx(import_dist.Link, {
								to: `/blog/${resume.slug}`,
								children: resume.title
							}),
							"."
						] })]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "filters",
				role: "search",
				children: [/* @__PURE__ */ jsxs("label", {
					className: "search",
					children: [/* @__PURE__ */ jsx("span", {
						className: "sr-only",
						children: "Search posts"
					}), /* @__PURE__ */ jsx("input", {
						type: "search",
						value: q,
						onChange: (e) => set("q", e.target.value),
						placeholder: "Search: taints, helm, kind load…",
						autoComplete: "off",
						spellCheck: false
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "chips",
					role: "group",
					"aria-label": "Filter by tag",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						className: !tag ? "on" : "",
						"aria-pressed": !tag,
						onClick: () => set("tag", ""),
						children: "All"
					}), allTags().map((t) => /* @__PURE__ */ jsx("button", {
						type: "button",
						className: tag === t ? "on" : "",
						"aria-pressed": tag === t,
						onClick: () => set("tag", tag === t ? "" : t),
						children: t
					}, t))]
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "count",
				"aria-live": "polite",
				children: shown.length === posts.length ? `${posts.length} posts` : `${shown.length} of ${posts.length} posts`
			}),
			shown.length ? /* @__PURE__ */ jsx("ol", {
				className: "post-list",
				children: shown.map((p) => /* @__PURE__ */ jsx("li", {
					className: read.has(p.slug) ? "is-read" : void 0,
					children: /* @__PURE__ */ jsxs(import_dist.Link, {
						to: `/blog/${p.slug}`,
						className: "row-link",
						children: [/* @__PURE__ */ jsx("span", {
							className: "n",
							"aria-hidden": "true",
							children: String(p.order).padStart(2, "0")
						}), /* @__PURE__ */ jsxs("span", {
							className: "body",
							children: [
								/* @__PURE__ */ jsx("h2", { children: p.title }),
								/* @__PURE__ */ jsx("span", {
									className: "desc",
									children: p.description
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "meta",
									children: [p.tags.map((t) => /* @__PURE__ */ jsx("i", { children: t }, t)), /* @__PURE__ */ jsx("span", { children: read.has(p.slug) ? "read" : `${p.minutes} min read` })]
								})
							]
						})]
					})
				}, p.slug))
			}) : /* @__PURE__ */ jsxs("p", {
				className: "empty",
				children: [
					"Nothing matches “",
					q,
					"”. ",
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "link-btn",
						onClick: () => apply({
							q: "",
							tag: ""
						}),
						children: "Clear the filters"
					})
				]
			})
		]
	});
}
//#endregion
//#region src/pages/NotFound.jsx
function NotFound() {
	usePageMeta(metaFor("/404-not-found"));
	return /* @__PURE__ */ jsxs("div", {
		className: "wrap notfound",
		children: [
			/* @__PURE__ */ jsx("h1", { children: "That page is not here." }),
			/* @__PURE__ */ jsx("p", { children: "The link may be old, or mistyped. The guides and the playground are one click away." }),
			/* @__PURE__ */ jsxs("p", {
				className: "row",
				children: [
					/* @__PURE__ */ jsx(import_dist.Link, {
						className: "btn btn-primary",
						to: "/blog",
						children: "Go to the blog"
					}),
					" ",
					/* @__PURE__ */ jsx(import_dist.Link, {
						className: "btn",
						to: "/",
						children: "Home"
					})
				]
			})
		]
	});
}
//#endregion
//#region src/pages/Post.jsx
var total = posts.filter((p) => p.order > 0).length;
function Toc({ toc, active }) {
	if (!toc.length) return null;
	return /* @__PURE__ */ jsxs("nav", {
		className: "toc",
		"aria-label": "On this page",
		children: [/* @__PURE__ */ jsx("p", {
			className: "toc-title",
			children: "On this page"
		}), /* @__PURE__ */ jsx("ol", { children: toc.map((t) => /* @__PURE__ */ jsx("li", {
			className: "d" + t.depth + (active === t.id ? " on" : ""),
			children: /* @__PURE__ */ jsx("a", {
				href: `#${t.id}`,
				"aria-current": active === t.id ? "true" : void 0,
				children: t.text
			})
		}, t.id)) })]
	});
}
function PostBody({ slug }) {
	const post = usePost(slug);
	const { hash } = (0, import_dist.useLocation)();
	const navigate = (0, import_dist.useNavigate)();
	const [active, setActive] = useState("");
	const body = useRef(null);
	usePageMeta(post ? metaFor("/blog/" + slug) : {});
	useEffect(() => {
		if (!post) return;
		if (hash) {
			const el = document.getElementById(decodeURIComponent(hash.slice(1)));
			if (el) {
				el.scrollIntoView();
				return;
			}
		}
		window.scrollTo(0, 0);
	}, [
		slug,
		hash,
		post
	]);
	useEffect(() => {
		if (!post) return;
		setLast(slug);
		const heads = [...body.current.querySelectorAll("h2[id], h3[id]")];
		const io = new IntersectionObserver((es) => {
			for (const e of es) if (e.isIntersecting) setActive(e.target.id);
		}, { rootMargin: "-72px 0px -70% 0px" });
		heads.forEach((h) => io.observe(h));
		let marked = false;
		const mark = () => {
			if (marked) return;
			marked = true;
			markRead(slug);
		};
		const end = document.getElementById("post-end");
		const done = new IntersectionObserver(([e]) => {
			if (e.isIntersecting) mark();
		}, { threshold: 0 });
		if (end) done.observe(end);
		if (end && end.getBoundingClientRect().top < window.innerHeight) mark();
		let raf = 0;
		const onScroll = () => {
			if (raf) return;
			raf = requestAnimationFrame(() => {
				raf = 0;
				const d = document.documentElement;
				if (window.innerHeight + window.scrollY >= d.scrollHeight - 4) mark();
			});
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => {
			io.disconnect();
			done.disconnect();
			window.removeEventListener("scroll", onScroll);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [slug, post]);
	if (!post) return /* @__PURE__ */ jsx(NotFound, {});
	const { prev, next } = neighbours(slug);
	const onClick = (e) => {
		const copy = e.target.closest(".code-copy");
		if (copy) {
			const code = copy.closest("figure").querySelector("code");
			const text = code.textContent;
			const done = () => {
				copy.textContent = "Copied";
				setTimeout(() => {
					copy.textContent = "Copy";
				}, 1600);
			};
			if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
			else {
				const r = document.createRange();
				r.selectNodeContents(code);
				const s = getSelection();
				s.removeAllRanges();
				s.addRange(r);
				try {
					document.execCommand("copy");
				} catch (er) {}
				s.removeAllRanges();
				done();
			}
			return;
		}
		const a = e.target.closest("a");
		if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
		const href = a.getAttribute("href") || "";
		if (href.startsWith("/") && !href.startsWith("//")) {
			e.preventDefault();
			navigate(href);
		}
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
		className: "read-progress",
		"aria-hidden": "true"
	}), /* @__PURE__ */ jsxs("div", {
		className: "wrap post-layout",
		children: [/* @__PURE__ */ jsxs("article", {
			className: "post",
			children: [
				/* @__PURE__ */ jsxs("nav", {
					className: "crumbs",
					"aria-label": "Breadcrumb",
					children: [
						/* @__PURE__ */ jsx(import_dist.Link, {
							to: "/blog",
							children: "Blog"
						}),
						/* @__PURE__ */ jsx("span", {
							"aria-hidden": "true",
							children: "/"
						}),
						/* @__PURE__ */ jsx("span", { children: post.order === 0 ? "Start here" : `Part ${post.order} of ${total}` })
					]
				}),
				/* @__PURE__ */ jsxs("header", {
					className: "post-head",
					children: [
						/* @__PURE__ */ jsx("h1", { children: post.title }),
						/* @__PURE__ */ jsx("p", {
							className: "lede",
							children: post.description
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "post-meta",
							children: [
								/* @__PURE__ */ jsxs("span", { children: [post.minutes, " min read"] }),
								/* @__PURE__ */ jsx("span", {
									"aria-hidden": "true",
									children: "·"
								}),
								/* @__PURE__ */ jsxs("time", {
									dateTime: post.date,
									children: ["Updated ", post.date]
								}),
								post.tags.map((t) => /* @__PURE__ */ jsx(import_dist.Link, {
									className: "tag",
									to: `/blog?tag=${t}`,
									children: t
								}, t))
							]
						})
					]
				}),
				/* @__PURE__ */ jsxs("details", {
					className: "toc-mobile",
					children: [/* @__PURE__ */ jsx("summary", { children: "On this page" }), /* @__PURE__ */ jsx(Toc, {
						toc: post.toc,
						active
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "prose",
					ref: body,
					onClick,
					onPointerOver: (e) => {
						if (e.target.closest && e.target.closest(".code-try")) preloadPlayground();
					},
					dangerouslySetInnerHTML: { __html: post.html }
				}),
				/* @__PURE__ */ jsx("div", {
					id: "post-end",
					style: { height: 1 }
				}),
				/* @__PURE__ */ jsxs("aside", {
					className: "try-cta",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("strong", { children: "Try it before you type it on your machine." }), /* @__PURE__ */ jsx("span", { children: "The playground runs every command in these guides against a simulated cluster." })] }), /* @__PURE__ */ jsx(import_dist.Link, {
						className: "btn btn-primary",
						to: "/app",
						...appIntent,
						children: "Open the playground"
					})]
				}),
				/* @__PURE__ */ jsxs("nav", {
					className: "pager",
					"aria-label": "Previous and next post",
					children: [prev ? /* @__PURE__ */ jsxs(import_dist.Link, {
						className: "prev",
						to: `/blog/${prev.slug}`,
						children: [/* @__PURE__ */ jsx("span", { children: "Previous" }), prev.title]
					}) : /* @__PURE__ */ jsx("span", {}), next ? /* @__PURE__ */ jsxs(import_dist.Link, {
						className: "next",
						to: `/blog/${next.slug}`,
						children: [/* @__PURE__ */ jsx("span", { children: "Next" }), next.title]
					}) : /* @__PURE__ */ jsx("span", {})]
				})
			]
		}), /* @__PURE__ */ jsxs("aside", {
			className: "post-side",
			children: [/* @__PURE__ */ jsx(Toc, {
				toc: post.toc,
				active
			}), /* @__PURE__ */ jsxs("nav", {
				className: "course-nav",
				"aria-label": "The course",
				children: [/* @__PURE__ */ jsx("p", {
					className: "toc-title",
					children: "The course"
				}), /* @__PURE__ */ jsx("ol", { children: posts.map((p) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(import_dist.Link, {
					to: `/blog/${p.slug}`,
					"aria-current": p.slug === slug ? "page" : void 0,
					children: p.title.replace(/:.*$/, "")
				}) }, p.slug)) })]
			})]
		})]
	})] });
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
function Post() {
	const { slug } = (0, import_dist.useParams)();
	return /* @__PURE__ */ jsx(Suspense, {
		fallback: /* @__PURE__ */ jsx(Skeleton, {}),
		children: /* @__PURE__ */ jsx(PostBody, { slug }, slug)
	});
}
//#endregion
//#region src/pages/Privacy.jsx
function Privacy() {
	usePageMeta(metaFor("/privacy"));
	return /* @__PURE__ */ jsxs("div", {
		className: "wrap text-page",
		children: [/* @__PURE__ */ jsxs("header", {
			className: "page-head",
			children: [/* @__PURE__ */ jsx("h1", { children: "Privacy" }), /* @__PURE__ */ jsx("p", {
				className: "lede",
				children: "There are no accounts, no analytics and no cookies. Once a page has loaded, the playground makes no network requests."
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "body",
			children: [
				/* @__PURE__ */ jsx("h2", { children: "What is stored in your browser" }),
				/* @__PURE__ */ jsx("p", { children: "Four small entries in local storage, all created by you using the site, none sent anywhere:" }),
				/* @__PURE__ */ jsxs("ul", { children: [
					/* @__PURE__ */ jsxs("li", { children: [
						/* @__PURE__ */ jsx("code", { children: "k8s-playground:fs:v1" }),
						": the virtual files you create in the playground (for example the Helm chart in ",
						/* @__PURE__ */ jsx("code", { children: "~/myapp" }),
						")."
					] }),
					/* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("code", { children: "k8s-playground:tour:v1" }), ": a flag saying you have seen the guided tour."] }),
					/* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("code", { children: "kubedojo:theme" }), ": your light or dark choice, if you made one."] }),
					/* @__PURE__ */ jsxs("li", { children: [
						/* @__PURE__ */ jsx("code", { children: "kubedojo:read" }),
						" and ",
						/* @__PURE__ */ jsx("code", { children: "kubedojo:last" }),
						": which guides you finished and which one you were on, to show your progress."
					] })
				] }),
				/* @__PURE__ */ jsx("p", { children: "Clear them with your browser's “clear site data”, or press “Wipe all my files” in the playground's Files tab." }),
				/* @__PURE__ */ jsx("h2", { children: "What the playground does not do" }),
				/* @__PURE__ */ jsx("p", { children: "The simulated clusters, containers and commands exist only in the page's memory. Nothing you type is uploaded, and the playground cannot reach your computer, your Docker or any real cluster. The setup script it can generate is built locally, in the page, and downloaded by your browser." }),
				/* @__PURE__ */ jsx("h2", { children: "Hosting" }),
				/* @__PURE__ */ jsx("p", { children: "Whoever hosts this site may keep ordinary server logs (IP address, requested page, time). KubeDojo itself adds no third-party scripts, fonts or trackers." })
			]
		})]
	});
}
//#endregion
//#region src/App.jsx
var Playground = lazy(loadPlayground);
function App() {
	return /* @__PURE__ */ jsxs(import_dist.Routes, { children: [/* @__PURE__ */ jsx(import_dist.Route, {
		path: "/app",
		element: /* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsx(Suspense, {
			fallback: /* @__PURE__ */ jsx("div", {
				className: "boot",
				role: "status",
				children: "Loading the playground…"
			}),
			children: /* @__PURE__ */ jsx(Playground, {})
		}) })
	}), /* @__PURE__ */ jsxs(import_dist.Route, {
		element: /* @__PURE__ */ jsx("div", {
			className: "site",
			children: /* @__PURE__ */ jsx(SiteLayout, {})
		}),
		children: [
			/* @__PURE__ */ jsx(import_dist.Route, {
				index: true,
				element: /* @__PURE__ */ jsx(Home, {})
			}),
			/* @__PURE__ */ jsx(import_dist.Route, {
				path: "blog",
				element: /* @__PURE__ */ jsx(Blog, {})
			}),
			/* @__PURE__ */ jsx(import_dist.Route, {
				path: "blog/:slug",
				element: /* @__PURE__ */ jsx(Post, {})
			}),
			/* @__PURE__ */ jsx(import_dist.Route, {
				path: "privacy",
				element: /* @__PURE__ */ jsx(Privacy, {})
			}),
			/* @__PURE__ */ jsx(import_dist.Route, {
				path: "*",
				element: /* @__PURE__ */ jsx(NotFound, {})
			})
		]
	})] });
}
//#endregion
//#region src/blog/generated/posts/clean-up.json
var clean_up_exports = /* @__PURE__ */ __exportAll({
	date: () => date$8,
	default: () => clean_up_default,
	description: () => description$8,
	html: () => html$8,
	minutes: () => 6,
	order: () => 8,
	slug: () => slug$8,
	tags: () => tags$8,
	title: () => title$8,
	toc: () => toc$8,
	words: () => 493
});
var slug$8 = "clean-up";
var title$8 = "Stop, shut down and clean up";
var description$8 = "Three levels of tidying, from deleting namespaces to removing the cluster and its kubectl context.";
var tags$8 = ["kind", "k3d"];
var date$8 = "2026-10-14";
var toc$8 = [
	{
		"depth": 2,
		"id": "part-1--delete-the-namespaces-the-cluster-stays",
		"text": "Part 1 — Delete the namespaces (the cluster stays)"
	},
	{
		"depth": 2,
		"id": "part-2--stop-the-cluster-and-start-it-again",
		"text": "Part 2 — Stop the cluster and start it again"
	},
	{
		"depth": 2,
		"id": "part-3--complete-shutdown",
		"text": "Part 3 — Complete shutdown"
	}
];
var html$8 = "<p>For the kind cluster <code>local-cluster-1</code>; for a k3d cluster see the last section of\n<a href=\"/blog/k3d-cluster\">Create a local Kubernetes cluster with k3d</a>. Three levels, from lightest to complete. Pick the one you\nneed.</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>You want</th><th>Level</th></tr></thead><tbody><tr><td>Free memory for a while, keep everything</td><td>Part 2: stop the cluster</td></tr>\n<tr><td>Empty the cluster, keep the cluster</td><td>Part 1: delete the namespaces</td></tr>\n<tr><td>Remove everything this guide made</td><td>Part 3: complete shutdown</td></tr></tbody></table></div>\n<h2 id=\"part-1--delete-the-namespaces-the-cluster-stays\"><a class=\"anchor\" href=\"#part-1--delete-the-namespaces-the-cluster-stays\" aria-label=\"Link to this section\">#</a>Part 1 — Delete the namespaces (the cluster stays)</h2>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20namespace%20web%20cache%20db%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete namespace web cache db</code></pre></figure>\n<p>Deletes the namespaces and everything inside them: Deployments, pods, Services. The cluster and its nodes\nkeep running, empty.</p>\n<h2 id=\"part-2--stop-the-cluster-and-start-it-again\"><a class=\"anchor\" href=\"#part-2--stop-the-cluster-and-start-it-again\" aria-label=\"Link to this section\">#</a>Part 2 — Stop the cluster and start it again</h2>\n<p>kind has no stop command, but its nodes are Docker containers, so stop those. Everything inside the cluster\nis kept:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20stop%20%24(kind%20get%20nodes%20--name%20local-cluster-1)%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker stop $(kind get nodes --name local-cluster-1)</code></pre></figure>\n<p><code>kind get nodes</code> prints the three node names; <code>docker stop</code> stops each one. The memory is freed.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20ps%20--format%20'table%20%7B%7B.Names%7D%7D%5C%5Ct%7B%7B.Status%7D%7D'%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker ps --format <span class=\"hljs-string\">&#x27;table {{.Names}}\\t{{.Status}}&#x27;</span></code></pre></figure>\n<p>The three <code>local-cluster-1-…</code> containers are gone from the running list.</p>\n<p>To bring it back:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20start%20%24(kind%20get%20nodes%20--name%20local-cluster-1)%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker start $(kind get nodes --name local-cluster-1)</code></pre></figure>\n<p>Wait a minute or two, then:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20nodes%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get nodes</code></pre></figure>\n<p>All three <code>Ready</code> (they show <code>NotReady</code> for a short while). Your namespaces and deployments are still there;\ntheir pods restart on their own.</p>\n<h2 id=\"part-3--complete-shutdown\"><a class=\"anchor\" href=\"#part-3--complete-shutdown\" aria-label=\"Link to this section\">#</a>Part 3 — Complete shutdown</h2>\n<p>Do these in order. Each removes one layer; stop wherever you like.</p>\n<p><strong>1. Delete the cluster</strong> (the three node containers and everything inside):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kind%20delete%20cluster%20--name%20local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kind delete cluster --name local-cluster-1</code></pre></figure>\n<p>kind also removes the cluster&#39;s entries from <code>~/.kube/config</code>: the context, cluster and user, all named\n<code>kind-local-cluster-1</code>.</p>\n<p><strong>2. Check what kubectl still lists:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20get-contexts%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config get-contexts</code></pre></figure>\n<p><code>kind-local-cluster-1</code> should be gone. If it is still listed, it is a stale entry: this happens when the\ncluster was removed another way (for example its containers were deleted with <code>docker rm</code>, so kind never\ncleaned the file). Remove it by hand. A context is only a pointer, so deleting it never touches a cluster:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20delete-context%20kind-local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config delete-context kind-local-cluster-1</code></pre></figure>\n<p>Read the exact name from the <code>NAME</code> column first, and never delete a cloud context (<code>gke_…</code>) you still use.\nIf the cluster and user entries are also left behind, remove them too (they share the context&#39;s name):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20delete-cluster%20kind-local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config delete-cluster kind-local-cluster-1</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20delete-user%20kind-local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config delete-user kind-local-cluster-1</code></pre></figure>\n<p><strong>3. Pick a current context on purpose.</strong> If the deleted one was current, kubectl now has none:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20current-context%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config current-context</code></pre></figure>\n<p>An error <code>current-context is not set</code> means exactly that. Choose one, or leave it empty until you need it:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20use-context%20%3Cthe%20context%20you%20want%3E%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config use-context &lt;the context you want&gt;</code></pre></figure>\n<p><strong>4. Remove the registry</strong>, if you made one in Part 1.2 of <a href=\"/blog/run-your-image\">Run your own image in the cluster</a> (this deletes every image pushed to it):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20rm%20-f%20kind-registry%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker <span class=\"hljs-built_in\">rm</span> -f kind-registry</code></pre></figure>\n<p><strong>5. Check nothing is left in Docker:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20ps%20-a%20--format%20'table%20%7B%7B.Names%7D%7D%5C%5Ct%7B%7B.Status%7D%7D'%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker ps -a --format <span class=\"hljs-string\">&#x27;table {{.Names}}\\t{{.Status}}&#x27;</span></code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kind%20get%20clusters%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kind get clusters</code></pre></figure>\n<p>No <code>local-cluster-1-…</code> or <code>kind-registry</code> containers, and <code>kind get clusters</code> does not list\n<code>local-cluster-1</code>.</p>\n<p><strong>6. Delete the files you wrote</strong> (optional):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">rm</span> kind-config.yaml</code></pre></figure>\n<p><strong>7. Free the disk</strong> (optional). The node image stays in Docker&#39;s cache:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker image <span class=\"hljs-built_in\">rm</span> kindest/node:&lt;tag&gt;</code></pre></figure>\n<p>Find the tag with <code>docker image ls | grep kindest</code>.</p>\n<p><strong>8. Quit Docker Desktop</strong> (optional) to free memory: menu-bar whale icon → Quit Docker Desktop. With the\ncluster deleted, nothing is left running.</p>\n<p><strong>9clean everything</strong> clean unused resources at once (asks first, removes all stopped containers and dangling images):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20system%20prune%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker system prune</code></pre></figure>\n";
var clean_up_default = {
	slug: slug$8,
	title: title$8,
	description: description$8,
	order: 8,
	tags: tags$8,
	date: date$8,
	minutes: 6,
	words: 493,
	toc: toc$8,
	html: html$8
};
//#endregion
//#region src/blog/generated/posts/concepts.json
var concepts_exports = /* @__PURE__ */ __exportAll({
	date: () => date$7,
	default: () => concepts_default,
	description: () => description$7,
	html: () => html$7,
	minutes: () => 19,
	order: () => 1,
	slug: () => slug$7,
	tags: () => tags$7,
	title: () => title$7,
	toc: () => toc$7,
	words: () => words$7
});
var slug$7 = "concepts";
var title$7 = "Concepts: what each piece is";
var description$7 = "Clusters, nodes, taints, contexts, kubeconfig, namespaces and Services, explained once so the guides can refer back to them.";
var tags$7 = ["basics", "concepts"];
var date$7 = "2026-10-14";
var words$7 = 2633;
var toc$7 = [
	{
		"depth": 2,
		"id": "the-big-picture",
		"text": "The big picture"
	},
	{
		"depth": 2,
		"id": "kind",
		"text": "kind"
	},
	{
		"depth": 2,
		"id": "cluster-nodes-control-plane",
		"text": "Cluster, nodes, control plane"
	},
	{
		"depth": 2,
		"id": "names-kubeconfig-and-contexts",
		"text": "Names, kubeconfig and contexts"
	},
	{
		"depth": 3,
		"id": "where-the-name-comes-from",
		"text": "Where the name comes from"
	},
	{
		"depth": 3,
		"id": "the-kind--prefix-is-added-by-kind",
		"text": "The kind- prefix is added by kind"
	},
	{
		"depth": 3,
		"id": "the-kubeconfig-file-three-lists-and-a-pointer",
		"text": "The kubeconfig file: three lists and a pointer"
	},
	{
		"depth": 3,
		"id": "a-fourth-name-kinds-own",
		"text": "A fourth name: kind's own"
	},
	{
		"depth": 3,
		"id": "they-are-separate-prove-it-by-renaming-the-context",
		"text": "They are separate: prove it by renaming the context"
	},
	{
		"depth": 3,
		"id": "looking-at-the-real-file",
		"text": "Looking at the real file"
	},
	{
		"depth": 2,
		"id": "namespaces",
		"text": "Namespaces"
	},
	{
		"depth": 3,
		"id": "the-system-namespaces",
		"text": "The system namespaces"
	},
	{
		"depth": 2,
		"id": "taints-and-tolerations",
		"text": "Taints and tolerations"
	},
	{
		"depth": 2,
		"id": "objects-you-will-meet",
		"text": "Objects you will meet"
	},
	{
		"depth": 2,
		"id": "how-a-pod-finds-a-node",
		"text": "How a pod finds a node"
	},
	{
		"depth": 2,
		"id": "how-pods-find-each-other-services-and-dns",
		"text": "How pods find each other: Services and DNS"
	},
	{
		"depth": 2,
		"id": "getting-to-your-apps-from-the-mac",
		"text": "Getting to your apps from the Mac"
	},
	{
		"depth": 2,
		"id": "docker-networks-and-localhost",
		"text": "Docker networks and localhost"
	},
	{
		"depth": 2,
		"id": "what-a-local-cluster-does-not-prove",
		"text": "What a local cluster does not prove"
	}
];
var html$7 = "<p>Read this once. The guides (<a href=\"/blog/kind-cluster\">Create a local Kubernetes cluster with kind</a>,\n<a href=\"/blog/k3d-cluster\">Create a local Kubernetes cluster with k3d</a>, <a href=\"/blog/deploy-apps\">Deploy apps into your namespaces, one at a time</a>) refer back to these\nideas.</p>\n<h2 id=\"the-big-picture\"><a class=\"anchor\" href=\"#the-big-picture\" aria-label=\"Link to this section\">#</a>The big picture</h2>\n<p>You want a real Kubernetes cluster on your own computer to learn on, without cloud bills or risk. kind makes\none out of Docker containers:</p>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code> your Mac\n └── Docker Desktop\n     ├── local-cluster-1-control-plane   container = the &quot;brain&quot; node\n     ├── local-cluster-1-worker          container = a node that runs your pods\n     ├── local-cluster-1-worker2         container = another one\n     └── kind-registry                   (optional) container = a private image store</code></pre></figure>\n<p>Inside the nodes, your applications run as pods, grouped into namespaces:</p>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code> local-cluster-1\n ├── namespace web     web-… ×2 (nginx)     Service web\n ├── namespace cache   cache-… (redis)      Service cache\n └── namespace db      db-… (postgres)      Service db</code></pre></figure>\n<h2 id=\"kind\"><a class=\"anchor\" href=\"#kind\" aria-label=\"Link to this section\">#</a>kind</h2>\n<p><strong>K</strong>ubernetes <strong>i</strong>n <strong>D</strong>ocker. Each Kubernetes <em>node</em> is one Docker container that itself runs Kubernetes\ncomponents. The result behaves like a real multi-machine cluster: same <code>kubectl</code>, same YAML, same objects.\nDelete the cluster and nothing else on your Mac is touched. It is for learning and testing, not production.</p>\n<h2 id=\"cluster-nodes-control-plane\"><a class=\"anchor\" href=\"#cluster-nodes-control-plane\" aria-label=\"Link to this section\">#</a>Cluster, nodes, control plane</h2>\n<ul>\n<li><strong>Cluster</strong> — the whole thing: one control plane plus workers.</li>\n<li><strong>Control-plane node</strong> — runs the API server (what <code>kubectl</code> talks to), the scheduler (decides which node\nruns each pod), and etcd (the cluster&#39;s database). It is tainted so ordinary pods stay off it.</li>\n<li><strong>Worker node</strong> — runs your pods.</li>\n</ul>\n<p>kind fixes the node list at creation. To change it, delete the cluster and create it again from an edited\nconfig file.</p>\n<h2 id=\"names-kubeconfig-and-contexts\"><a class=\"anchor\" href=\"#names-kubeconfig-and-contexts\" aria-label=\"Link to this section\">#</a>Names, kubeconfig and contexts</h2>\n<p><code>~/.kube/config</code> lists every cluster kubectl knows, and how to log in. A <strong>context</strong> is one entry: cluster +\nuser (+ optional default namespace). The <strong>current context</strong> is where every command goes. <code>kind create cluster</code> adds <code>kind-&lt;cluster name&gt;</code> and switches to it; <code>k3d cluster create</code> does the same with\n<code>k3d-&lt;cluster name&gt;</code>.</p>\n<p>Why it matters: if the same file holds a cloud or work cluster, running <code>kubectl delete</code> while the wrong\ncontext is current deletes things there. Check with <code>kubectl config current-context</code>.</p>\n<h3 id=\"where-the-name-comes-from\"><a class=\"anchor\" href=\"#where-the-name-comes-from\" aria-label=\"Link to this section\">#</a>Where the name comes from</h3>\n<figure class=\"code\" data-lang=\"yaml\"><figcaption><span class=\"lang\">yaml</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-attr\">kind:</span> <span class=\"hljs-string\">Cluster</span>\n<span class=\"hljs-attr\">apiVersion:</span> <span class=\"hljs-string\">kind.x-k8s.io/v1alpha4</span>\n<span class=\"hljs-attr\">name:</span> <span class=\"hljs-string\">local-cluster-1</span>      <span class=\"hljs-comment\"># &lt;-- this line</span></code></pre></figure>\n<p><code>name:</code> is the cluster&#39;s name. kind uses it in two places:</p>\n<ul>\n<li>the node containers are named <code>&lt;name&gt;-control-plane</code>, <code>&lt;name&gt;-worker</code>, <code>&lt;name&gt;-worker2</code>;</li>\n<li>the kubectl context is named <code>kind-&lt;name&gt;</code>.</li>\n</ul>\n<p>Without that line, kind falls back to the name <code>kind</code>: nodes called <code>kind-control-plane</code> and a context called\n<code>kind-kind</code>.</p>\n<p>The same name can be given on the command line, where it overrides the file:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kind%20create%20cluster%20--name%20local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kind create cluster --name local-cluster-1</code></pre></figure>\n<h3 id=\"the-kind--prefix-is-added-by-kind\"><a class=\"anchor\" href=\"#the-kind--prefix-is-added-by-kind\" aria-label=\"Link to this section\">#</a>The <code>kind-</code> prefix is added by kind</h3>\n<p>When <code>kind create cluster</code> finishes, it writes new entries into <code>~/.kube/config</code>, named <code>kind-</code> plus the\ncluster name. The prefix is fixed; the config file cannot change it. It exists so kind clusters are easy to\nspot next to cloud ones such as <code>gke_...</code> in <code>kubectl config get-contexts</code>.</p>\n<p>To use another context name, rename it afterwards (see &quot;They are separate&quot; below).</p>\n<h3 id=\"the-kubeconfig-file-three-lists-and-a-pointer\"><a class=\"anchor\" href=\"#the-kubeconfig-file-three-lists-and-a-pointer\" aria-label=\"Link to this section\">#</a>The kubeconfig file: three lists and a pointer</h3>\n<p><code>~/.kube/config</code> holds three separate lists, plus the current context:</p>\n<figure class=\"code\" data-lang=\"yaml\"><figcaption><span class=\"lang\">yaml</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-attr\">clusters:</span>                          <span class=\"hljs-comment\"># WHERE the cluster is</span>\n<span class=\"hljs-bullet\">-</span> <span class=\"hljs-attr\">name:</span> <span class=\"hljs-string\">kind-local-cluster-1</span>\n  <span class=\"hljs-attr\">cluster:</span>\n    <span class=\"hljs-attr\">server:</span> <span class=\"hljs-string\">https://127.0.0.1:54321</span>\n    <span class=\"hljs-attr\">certificate-authority-data:</span> <span class=\"hljs-string\">...</span>\n\n<span class=\"hljs-attr\">users:</span>                             <span class=\"hljs-comment\"># WHO you log in as</span>\n<span class=\"hljs-bullet\">-</span> <span class=\"hljs-attr\">name:</span> <span class=\"hljs-string\">kind-local-cluster-1</span>\n  <span class=\"hljs-attr\">user:</span>\n    <span class=\"hljs-attr\">client-certificate-data:</span> <span class=\"hljs-string\">...</span>\n    <span class=\"hljs-attr\">client-key-data:</span> <span class=\"hljs-string\">...</span>\n\n<span class=\"hljs-attr\">contexts:</span>                          <span class=\"hljs-comment\"># WHICH cluster + WHICH user (+ namespace)</span>\n<span class=\"hljs-bullet\">-</span> <span class=\"hljs-attr\">name:</span> <span class=\"hljs-string\">kind-local-cluster-1</span>\n  <span class=\"hljs-attr\">context:</span>\n    <span class=\"hljs-attr\">cluster:</span> <span class=\"hljs-string\">kind-local-cluster-1</span>  <span class=\"hljs-comment\"># points into the clusters list</span>\n    <span class=\"hljs-attr\">user:</span> <span class=\"hljs-string\">kind-local-cluster-1</span>     <span class=\"hljs-comment\"># points into the users list</span>\n    <span class=\"hljs-attr\">namespace:</span> <span class=\"hljs-string\">web</span>                 <span class=\"hljs-comment\"># optional default namespace</span>\n\n<span class=\"hljs-attr\">current-context:</span> <span class=\"hljs-string\">kind-local-cluster-1</span></code></pre></figure>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Thing</th><th>What it is</th><th>Holds</th></tr></thead><tbody><tr><td><strong>Cluster</strong> (kubeconfig entry)</td><td>The address of an API server</td><td>URL and CA certificate</td></tr>\n<tr><td><strong>User</strong></td><td>An identity</td><td>Certificate and key, or a token</td></tr>\n<tr><td><strong>Context</strong></td><td>A named pairing of one cluster and one user</td><td>Pointers to the other two, and an optional default namespace</td></tr></tbody></table></div>\n<p>kubectl only ever uses <strong>contexts</strong>. When you run <code>kubectl get pods</code>, it takes the current context, follows\nits <code>cluster</code> pointer to find where to send the request, and follows its <code>user</code> pointer to find how to\nauthenticate.</p>\n<h3 id=\"a-fourth-name-kinds-own\"><a class=\"anchor\" href=\"#a-fourth-name-kinds-own\" aria-label=\"Link to this section\">#</a>A fourth name: kind&#39;s own</h3>\n<p><code>local-cluster-1</code>, without the prefix, is the name <code>kind</code> knows the cluster by:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kind%20get%20clusters%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kind get clusters</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kind%20delete%20cluster%20--name%20local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kind delete cluster --name local-cluster-1</code></pre></figure>\n<p>kind is not kubectl, so it does not use kubeconfig names. It uses the <code>name:</code> from your config file.</p>\n<p>All the names side by side:</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Name</th><th>Used by</th><th>Example</th></tr></thead><tbody><tr><td><code>local-cluster-1</code></td><td><code>kind</code> commands, node container names</td><td><code>kind get nodes --name local-cluster-1</code></td></tr>\n<tr><td><code>kind-local-cluster-1</code> (cluster entry)</td><td>kubeconfig internals</td><td>rarely typed</td></tr>\n<tr><td><code>kind-local-cluster-1</code> (user entry)</td><td>kubeconfig internals</td><td>rarely typed</td></tr>\n<tr><td><code>kind-local-cluster-1</code> (context)</td><td><code>kubectl</code></td><td><code>kubectl config use-context kind-local-cluster-1</code></td></tr></tbody></table></div>\n<h3 id=\"they-are-separate-prove-it-by-renaming-the-context\"><a class=\"anchor\" href=\"#they-are-separate-prove-it-by-renaming-the-context\" aria-label=\"Link to this section\">#</a>They are separate: prove it by renaming the context</h3>\n<p>kind gave all three kubeconfig entries one name because it is the simplest choice, not because they must\nmatch. Rename only the context:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20rename-context%20kind-local-cluster-1%20lab%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config rename-context kind-local-cluster-1 lab</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20get-contexts%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config get-contexts</code></pre></figure>\n<p>The context is now <code>lab</code>. Its CLUSTER and AUTHINFO columns still say <code>kind-local-cluster-1</code>, because the\npointers inside it did not change, and everything still works:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20--context%20lab%20get%20nodes%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl --context lab get nodes</code></pre></figure>\n<p>To undo:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20rename-context%20lab%20kind-local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config rename-context lab kind-local-cluster-1</code></pre></figure>\n<p>Cloud tools do the same thing: your <code>gke_...</code> contexts also repeat one long name in all three columns.</p>\n<h3 id=\"looking-at-the-real-file\"><a class=\"anchor\" href=\"#looking-at-the-real-file\" aria-label=\"Link to this section\">#</a>Looking at the real file</h3>\n<p>Show the file with secrets hidden:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20view%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config view</code></pre></figure>\n<p>Show only the current context&#39;s entries:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20view%20--minify%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config view --minify</code></pre></figure>\n<p>List the names of each part:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20get-clusters%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config get-clusters</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20get-users%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config get-users</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20get-contexts%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config get-contexts</code></pre></figure>\n<h2 id=\"namespaces\"><a class=\"anchor\" href=\"#namespaces\" aria-label=\"Link to this section\">#</a>Namespaces</h2>\n<p>Folders inside a cluster. They separate teams or environments, let two apps use the same name, and let you\nlist or delete one group at a time (<code>-n &lt;name&gt;</code> on commands, <code>-A</code> for all). Deleting a namespace deletes\neverything in it. They are not a security wall by themselves.</p>\n<h3 id=\"the-system-namespaces\"><a class=\"anchor\" href=\"#the-system-namespaces\" aria-label=\"Link to this section\">#</a>The system namespaces</h3>\n<p>Every cluster starts with a few namespaces that Kubernetes creates for itself. Your apps do not go in them.\nThis section says what each one holds, so you recognise what you see and know what is safe to leave alone.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20namespaces%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get namespaces</code></pre></figure>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>NAME              STATUS\ndefault           Active\nkube-system       Active\nkube-public       Active\nkube-node-lease   Active</code></pre></figure>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Namespace</th><th>One-line purpose</th></tr></thead><tbody><tr><td><code>kube-system</code></td><td>The cluster&#39;s own components: DNS, networking, the control plane</td></tr>\n<tr><td><code>kube-public</code></td><td>Information that anyone, even without logging in, may read</td></tr>\n<tr><td><code>kube-node-lease</code></td><td>One small heartbeat object per node</td></tr>\n<tr><td><code>default</code></td><td>Where objects go when you give no <code>-n</code>; yours to use</td></tr></tbody></table></div>\n<hr>\n<h4 id=\"kube-system\"><a class=\"anchor\" href=\"#kube-system\" aria-label=\"Link to this section\">#</a>kube-system</h4>\n<p>The home of the cluster&#39;s own machinery. What is inside depends on the kind of cluster.</p>\n<h5 id=\"in-a-kind-cluster-the-3-node-cluster-from-01-kind-cluster-spinmd01-kind-cluster-spinmd\"><a class=\"anchor\" href=\"#in-a-kind-cluster-the-3-node-cluster-from-01-kind-cluster-spinmd01-kind-cluster-spinmd\" aria-label=\"Link to this section\">#</a>In a kind cluster (the 3-node cluster from <a href=\"/blog/kind-cluster\">Create a local Kubernetes cluster with kind</a>)</h5>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Pod</th><th>Kind</th><th>What it does</th></tr></thead><tbody><tr><td><code>kube-apiserver-&lt;control-plane&gt;</code></td><td>static pod</td><td>The API server: what <code>kubectl</code> talks to</td></tr>\n<tr><td><code>etcd-&lt;control-plane&gt;</code></td><td>static pod</td><td>The cluster&#39;s database</td></tr>\n<tr><td><code>kube-scheduler-&lt;control-plane&gt;</code></td><td>static pod</td><td>Picks a node for each new pod</td></tr>\n<tr><td><code>kube-controller-manager-&lt;control-plane&gt;</code></td><td>static pod</td><td>Runs the loops that keep reality matching your Deployments and the like</td></tr>\n<tr><td><code>coredns-…</code> (usually 2)</td><td>Deployment</td><td>Cluster DNS: how <code>web.web</code> becomes an IP</td></tr>\n<tr><td><code>kube-proxy-…</code> (one per node)</td><td>DaemonSet</td><td>Makes Services work by routing traffic to their pods</td></tr>\n<tr><td><code>kindnet-…</code> (one per node)</td><td>DaemonSet</td><td>The network plugin: gives pods IPs and lets them reach each other</td></tr></tbody></table></div>\n<p>Terms:</p>\n<ul>\n<li><strong>Static pod:</strong> started by a node&#39;s kubelet from a file on disk, not by a Deployment. The name ends with the\nnode name. In kind the files are in <code>/etc/kubernetes/manifests</code> on the control-plane node.</li>\n<li><strong>DaemonSet:</strong> runs one pod on every node. A 3-node cluster has three <code>kube-proxy</code> and three <code>kindnet</code>\npods.</li>\n</ul>\n<p>Besides pods, the namespace holds:</p>\n<ul>\n<li>the Service <code>kube-dns</code> (the stable address in front of <code>coredns</code>);</li>\n<li>ConfigMaps such as <code>coredns</code> and <code>kube-proxy</code> (their settings);</li>\n<li>ServiceAccounts, and bootstrap tokens used when nodes join;</li>\n<li>Leases used for leader election between components.</li>\n</ul>\n<p>kind&#39;s local storage provisioner is not here; it has its own namespace, <code>local-path-storage</code>.</p>\n<h5 id=\"in-k3s-and-k3d\"><a class=\"anchor\" href=\"#in-k3s-and-k3d\" aria-label=\"Link to this section\">#</a>In k3s and k3d</h5>\n<p><code>coredns</code>, <code>local-path-provisioner</code>, <code>metrics-server</code> and <code>traefik</code> (the bundled ingress), plus <code>svclb-…</code>\npods for LoadBalancer Services. k3s runs the control plane inside one process, so there are no separate\n<code>kube-apiserver</code>, <code>etcd</code> or <code>kube-scheduler</code> pods.</p>\n<h5 id=\"in-gke\"><a class=\"anchor\" href=\"#in-gke\" aria-label=\"Link to this section\">#</a>In GKE</h5>\n<p>Google runs the control plane, so there is no <code>kube-apiserver</code> or <code>etcd</code> pod to see. Typically present:\n<code>kube-dns</code> and <code>kube-dns-autoscaler</code>, <code>metrics-server</code>, <code>konnectivity-agent</code>, the persistent disk driver\n(<code>pdcsi-node</code>), logging and metrics agents (<code>fluentbit-…</code>, <code>gke-metrics-agent</code>), and network pods (<code>netd</code> or\n<code>anetd</code>). The exact list varies with the cluster&#39;s settings.</p>\n<h5 id=\"rules-of-thumb\"><a class=\"anchor\" href=\"#rules-of-thumb\" aria-label=\"Link to this section\">#</a>Rules of thumb</h5>\n<ul>\n<li>Do not deploy your own apps into <code>kube-system</code>.</li>\n<li>Do not delete things there casually. Deleting <code>coredns</code> breaks DNS for the whole cluster; deleting\n<code>kube-proxy</code> breaks Services.</li>\n<li>When pods cannot resolve names or reach Services, <code>kube-system</code> is the first place to look.</li>\n</ul>\n<h5 id=\"looking-at-it\"><a class=\"anchor\" href=\"#looking-at-it\" aria-label=\"Link to this section\">#</a>Looking at it</h5>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20pods%20-n%20kube-system%20-o%20wide%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get pods -n kube-system -o wide</code></pre></figure>\n<p>All the components and the node each runs on.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20daemonset%2Cdeployment%20-n%20kube-system%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get daemonset,deployment -n kube-system</code></pre></figure>\n<p>Which are per-node and which are replicated.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20configmap%20-n%20kube-system%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get configmap -n kube-system</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20exec%20local-cluster-1-control-plane%20ls%20%2Fetc%2Fkubernetes%2Fmanifests%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker <span class=\"hljs-built_in\">exec</span> local-cluster-1-control-plane <span class=\"hljs-built_in\">ls</span> /etc/kubernetes/manifests</code></pre></figure>\n<p>The static pod files on the kind control-plane node: <code>etcd.yaml</code>, <code>kube-apiserver.yaml</code>,\n<code>kube-controller-manager.yaml</code>, <code>kube-scheduler.yaml</code>.</p>\n<hr>\n<h4 id=\"kube-public\"><a class=\"anchor\" href=\"#kube-public\" aria-label=\"Link to this section\">#</a>kube-public</h4>\n<p>A namespace whose contents can be read by <strong>everyone, including users who are not logged in</strong>. It is meant for\ncluster information that must be available before anyone has credentials.</p>\n<h5 id=\"what-is-in-it\"><a class=\"anchor\" href=\"#what-is-in-it\" aria-label=\"Link to this section\">#</a>What is in it</h5>\n<p>Normally one ConfigMap:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20configmap%20-n%20kube-public%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get configmap -n kube-public</code></pre></figure>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>NAME           DATA   AGE\ncluster-info   1      10m</code></pre></figure>\n<p><code>cluster-info</code> holds a small kubeconfig fragment: the API server&#39;s address and the cluster&#39;s CA certificate.\nA new node reads it when joining a cluster built with <code>kubeadm</code>, to find the API server and to check it is\ntalking to the right one. kind builds its nodes with kubeadm, so it is there.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20configmap%20cluster-info%20-n%20kube-public%20-o%20yaml%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get configmap cluster-info -n kube-public -o yaml</code></pre></figure>\n<h5 id=\"facts\"><a class=\"anchor\" href=\"#facts\" aria-label=\"Link to this section\">#</a>Facts</h5>\n<ul>\n<li>There are no pods in it, and your apps do not go there.</li>\n<li>The public read access comes from a Role and RoleBinding that grant it to anonymous users. Nothing in this\nnamespace should be secret.</li>\n<li>Many managed clusters, GKE included, leave <code>kube-public</code> empty or unused.</li>\n<li>It is rarely touched in day-to-day work. Seeing it empty is normal.</li>\n</ul>\n<hr>\n<h4 id=\"kube-node-lease\"><a class=\"anchor\" href=\"#kube-node-lease\" aria-label=\"Link to this section\">#</a>kube-node-lease</h4>\n<p>A namespace that holds one <strong>Lease</strong> object per node. A Lease is a tiny record with a name, an owner and a\n&quot;last renewed&quot; timestamp.</p>\n<h5 id=\"what-it-is-for\"><a class=\"anchor\" href=\"#what-it-is-for\" aria-label=\"Link to this section\">#</a>What it is for</h5>\n<p>Each node&#39;s kubelet renews its own Lease every few seconds (about 10 by default). That is the node&#39;s\nheartbeat: &quot;I am alive&quot;. The control plane watches the timestamps. If a Lease has not been renewed for around\n40–50 seconds, the node is marked <code>NotReady</code> (shown as <code>Unknown</code> in some outputs), and pods on it are later\nrescheduled elsewhere.</p>\n<p>Before Leases, each heartbeat updated the whole Node object, which is large; with many nodes that put real\nload on etcd. A Lease is small and cheap to update, so the heartbeat can be frequent without cost. The full\nNode status is now updated much less often.</p>\n<h5 id=\"looking-at-it-1\"><a class=\"anchor\" href=\"#looking-at-it-1\" aria-label=\"Link to this section\">#</a>Looking at it</h5>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20lease%20-n%20kube-node-lease%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get lease -n kube-node-lease</code></pre></figure>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>NAME                            HOLDER                          AGE\nlocal-cluster-1-control-plane   local-cluster-1-control-plane   10m\nlocal-cluster-1-worker          local-cluster-1-worker          10m\nlocal-cluster-1-worker2         local-cluster-1-worker2         10m</code></pre></figure>\n<p>One Lease per node, named after the node.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20lease%20local-cluster-1-worker%20-n%20kube-node-lease%20-o%20yaml%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get lease local-cluster-1-worker -n kube-node-lease -o yaml</code></pre></figure>\n<p>The <code>renewTime</code> field changes every few seconds. Run it twice to watch it move.</p>\n<h5 id=\"facts-1\"><a class=\"anchor\" href=\"#facts-1\" aria-label=\"Link to this section\">#</a>Facts</h5>\n<ul>\n<li>There are no pods in it, and nothing for you to manage; it is entirely automatic.</li>\n<li>The Lease is deleted when its node is removed from the cluster.</li>\n<li>Components such as the scheduler also use Leases for leader election, but those live in <code>kube-system</code>, not\nhere.</li>\n<li>Stopping a node container (<code>docker stop local-cluster-1-worker</code>) stops its Lease renewals; after the grace\nperiod the node goes <code>NotReady</code>. That is a quick way to watch the mechanism work.</li>\n</ul>\n<hr>\n<h4 id=\"side-by-side\"><a class=\"anchor\" href=\"#side-by-side\" aria-label=\"Link to this section\">#</a>Side by side</h4>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th></th><th><code>kube-system</code></th><th><code>kube-public</code></th><th><code>kube-node-lease</code></th></tr></thead><tbody><tr><td>Holds</td><td>Cluster components (pods, Services, ConfigMaps)</td><td>One ConfigMap, <code>cluster-info</code></td><td>One Lease per node</td></tr>\n<tr><td>Pods inside</td><td>Yes</td><td>No</td><td>No</td></tr>\n<tr><td>Who can read</td><td>Cluster admins</td><td>Everyone, anonymous included</td><td>Cluster admins</td></tr>\n<tr><td>Changes over time</td><td>When components restart or upgrade</td><td>Almost never</td><td>Every few seconds, automatic</td></tr>\n<tr><td>You should</td><td>Look, don&#39;t touch</td><td>Leave alone</td><td>Leave alone</td></tr></tbody></table></div>\n<h2 id=\"taints-and-tolerations\"><a class=\"anchor\" href=\"#taints-and-tolerations\" aria-label=\"Link to this section\">#</a>Taints and tolerations</h2>\n<p>A label lets a pod choose a node. A <strong>taint</strong> works the other way round: it is a &quot;keep out&quot; sign on a node.\nThe scheduler will not place a pod on a tainted node unless the pod carries a matching permission slip, a\n<strong>toleration</strong>.</p>\n<p>A taint is written <code>key=value:effect</code>, for example <code>dedicated=data:NoSchedule</code>.</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Effect</th><th>What it does</th></tr></thead><tbody><tr><td><code>NoSchedule</code></td><td>New pods without a toleration are not placed here. Pods already running stay.</td></tr>\n<tr><td><code>PreferNoSchedule</code></td><td>A soft version: avoided, but used if nothing else fits.</td></tr>\n<tr><td><code>NoExecute</code></td><td>Also evicts pods already running there that do not tolerate it.</td></tr></tbody></table></div>\n<p>A toleration names the taint it covers (<code>key</code>, <code>effect</code>) and how to compare it (<code>operator</code>):</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>operator</th><th>Matches when</th><th><code>value</code></th></tr></thead><tbody><tr><td><code>Exists</code></td><td>the node has a taint with that key, whatever its value</td><td>leave it out</td></tr>\n<tr><td><code>Equal</code> (the default)</td><td>the key <strong>and</strong> the value are both the same</td><td>required</td></tr></tbody></table></div>\n<p>A toleration is permission, not a command: it lets a pod onto a tainted node but does not send it there. To\nsend it, add a <code>nodeSelector</code> as well. In kind the control-plane node carries the taint\n<code>node-role.kubernetes.io/control-plane:NoSchedule</code>, which is why your pods land on the workers. The hands-on\nversion, with the commands, is Part 4.4 of <a href=\"/blog/kind-cluster\">Create a local Kubernetes cluster with kind</a>.</p>\n<h2 id=\"objects-you-will-meet\"><a class=\"anchor\" href=\"#objects-you-will-meet\" aria-label=\"Link to this section\">#</a>Objects you will meet</h2>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Object</th><th>What it is</th><th>Example</th></tr></thead><tbody><tr><td>Pod</td><td>One running copy of an app (one or more containers). The smallest unit.</td><td><code>web-7d9f…-abcde</code></td></tr>\n<tr><td>Deployment</td><td>&quot;Keep N identical pods of this image running.&quot; Replaces dead pods, handles updates.</td><td><code>web</code></td></tr>\n<tr><td>ReplicaSet</td><td>What a Deployment uses internally to hold the N pods. You rarely touch it.</td><td><code>web-7d9f…</code></td></tr>\n<tr><td>Service</td><td>A stable name and address in front of changing pods.</td><td><code>web.web</code></td></tr>\n<tr><td>ClusterIP Service</td><td>The default: reachable only inside the cluster.</td><td><code>web</code></td></tr>\n<tr><td>NodePort Service</td><td>Also opens a fixed port on every node, for access from outside.</td><td><code>web-public</code></td></tr>\n<tr><td>ExternalName Service</td><td>Only a DNS nickname for another name; no pods behind it.</td><td>—</td></tr>\n<tr><td>Secret</td><td>Passwords and keys handed to pods.</td><td>—</td></tr>\n<tr><td>ConfigMap</td><td>Non-secret settings or files handed to pods.</td><td>—</td></tr>\n<tr><td>Label</td><td>A key=value sticky note on any object; selectors use them to find objects.</td><td><code>role=data</code></td></tr>\n<tr><td>Taint / toleration</td><td>A node &quot;keep out&quot; mark / a pod&#39;s &quot;I&#39;m allowed&quot; pass.</td><td>control-plane</td></tr></tbody></table></div>\n<h2 id=\"how-a-pod-finds-a-node\"><a class=\"anchor\" href=\"#how-a-pod-finds-a-node\" aria-label=\"Link to this section\">#</a>How a pod finds a node</h2>\n<p>You ask for a Deployment. The Deployment makes pods. The <strong>scheduler</strong> picks a worker for each pod, by free\nresources and by your rules (<code>nodeSelector</code>, taints). The node&#39;s <strong>container runtime</strong> (containerd, inside\nthe kind node) pulls the image and starts it.</p>\n<p>That last step is why local images need a bridge: containerd inside the node pulls from registries on the\nnetwork, not from your Mac&#39;s Docker image list. See Part 8 of the guide (<code>kind load</code> or a local registry).</p>\n<h2 id=\"how-pods-find-each-other-services-and-dns\"><a class=\"anchor\" href=\"#how-pods-find-each-other-services-and-dns\" aria-label=\"Link to this section\">#</a>How pods find each other: Services and DNS</h2>\n<p>Pod IPs change every time a pod is replaced, so you never use them. A Service gives a stable name, and\ncluster DNS resolves it:</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>From</th><th>Name to use</th></tr></thead><tbody><tr><td>a pod in the same namespace</td><td><code>web</code></td></tr>\n<tr><td>a pod in any namespace</td><td><code>web.web</code> (<code>&lt;service&gt;.&lt;namespace&gt;</code>)</td></tr>\n<tr><td>fully written</td><td><code>web.web.svc.cluster.local</code></td></tr></tbody></table></div>\n<h2 id=\"getting-to-your-apps-from-the-mac\"><a class=\"anchor\" href=\"#getting-to-your-apps-from-the-mac\" aria-label=\"Link to this section\">#</a>Getting to your apps from the Mac</h2>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Method</th><th>How</th><th>Good for</th></tr></thead><tbody><tr><td><code>kubectl port-forward</code></td><td>A tunnel from a Mac port to one Service or pod, for as long as the command runs</td><td>quick look, no setup</td></tr>\n<tr><td>NodePort + <code>extraPortMappings</code></td><td>A fixed Mac port wired to a node port at cluster creation</td><td>always-on access</td></tr>\n<tr><td>Ingress / Gateway</td><td>HTTP routing by host and path</td><td>later, when you want to practise it</td></tr></tbody></table></div>\n<h2 id=\"docker-networks-and-localhost\"><a class=\"anchor\" href=\"#docker-networks-and-localhost\" aria-label=\"Link to this section\">#</a>Docker networks and <code>localhost</code></h2>\n<p>Inside a container, <code>localhost</code> means <strong>that container</strong>. So the registry is <code>localhost:5001</code> from your Mac\nbut <code>kind-registry:5000</code> from a node. The <code>kind</code> Docker network is what lets the nodes reach containers you\nattach to it, like the registry.</p>\n<h2 id=\"what-a-local-cluster-does-not-prove\"><a class=\"anchor\" href=\"#what-a-local-cluster-does-not-prove\" aria-label=\"Link to this section\">#</a>What a local cluster does not prove</h2>\n<ul>\n<li>One machine: no real network latency, no real node failures, no cloud load balancers or storage classes.</li>\n<li>Throwaway data: pod storage disappears with the pod unless you add a volume.</li>\n<li>Your CPU architecture applies: on Apple Silicon, nodes are arm64, and an image built only for amd64 may\nnot run.</li>\n</ul>\n";
var concepts_default = {
	slug: slug$7,
	title: title$7,
	description: description$7,
	order: 1,
	tags: tags$7,
	date: date$7,
	minutes: 19,
	words: words$7,
	toc: toc$7,
	html: html$7
};
//#endregion
//#region src/blog/generated/posts/deploy-apps.json
var deploy_apps_exports = /* @__PURE__ */ __exportAll({
	date: () => date$6,
	default: () => deploy_apps_default,
	description: () => description$6,
	html: () => html$6,
	minutes: () => 13,
	order: () => 6,
	slug: () => slug$6,
	tags: () => tags$6,
	title: () => title$6,
	toc: () => toc$6,
	words: () => words$6
});
var slug$6 = "deploy-apps";
var title$6 = "Deploy apps into your namespaces, one at a time";
var description$6 = "Run an app in each namespace, place pods on chosen nodes, and reach what you deployed.";
var tags$6 = ["kubectl", "namespaces"];
var date$6 = "2026-10-14";
var words$6 = 1354;
var toc$6 = [
	{
		"depth": 2,
		"id": "part-1--deploy-one-app-at-a-time",
		"text": "Part 1 — Deploy, one app at a time"
	},
	{
		"depth": 3,
		"id": "11-web--nginx-two-copies-in-namespace-web",
		"text": "1.1 web — nginx, two copies, in namespace web"
	},
	{
		"depth": 3,
		"id": "12-cache--redis-in-namespace-cache",
		"text": "1.2 cache — Redis, in namespace cache"
	},
	{
		"depth": 3,
		"id": "13-db--postgres-pinned-to-the-data-node",
		"text": "1.3 db — Postgres, pinned to the data node"
	},
	{
		"depth": 3,
		"id": "14-a-single-bare-pod",
		"text": "1.4 A single bare pod"
	},
	{
		"depth": 3,
		"id": "15-pin-a-pod-to-a-specific-node-by-name",
		"text": "1.5 Pin a pod to a specific node by name"
	},
	{
		"depth": 3,
		"id": "16-see-everything",
		"text": "1.6 See everything"
	},
	{
		"depth": 2,
		"id": "part-2--use-what-you-deployed",
		"text": "Part 2 — Use what you deployed"
	},
	{
		"depth": 2,
		"id": "where-next",
		"text": "Where next"
	}
];
var html$6 = "<p>Run an app in each namespace, place pods on chosen nodes, and use what you deployed. This assumes the cluster\nfrom <a href=\"/blog/kind-cluster\">Create a local Kubernetes cluster with kind</a> (or <a href=\"/blog/k3d-cluster\">Create a local Kubernetes cluster with k3d</a>)\nis running, <code>kubectl config current-context</code> shows it, and the namespaces <code>web</code>, <code>cache</code> and <code>db</code> exist.\nThe commands are the same on kind and k3d, except where a note says otherwise.</p>\n<h2 id=\"part-1--deploy-one-app-at-a-time\"><a class=\"anchor\" href=\"#part-1--deploy-one-app-at-a-time\" aria-label=\"Link to this section\">#</a>Part 1 — Deploy, one app at a time</h2>\n<p>Each app below goes into its own namespace. A <strong>Deployment</strong> is the standard way to run an app: you say\n&quot;keep N copies of this image running&quot;, and Kubernetes creates the pods and replaces any that die.</p>\n<h3 id=\"11-web--nginx-two-copies-in-namespace-web\"><a class=\"anchor\" href=\"#11-web--nginx-two-copies-in-namespace-web\" aria-label=\"Link to this section\">#</a>1.1 <code>web</code> — nginx, two copies, in namespace <code>web</code></h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20deployment%20web%20--image%3Dnginx%3A1.27%20--replicas%3D2%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web</code></pre></figure>\n<ul>\n<li><code>deployment web</code> — the Deployment&#39;s name (its pods are named <code>web-&lt;hash&gt;-&lt;hash&gt;</code>).</li>\n<li><code>--image=nginx:1.27</code> — what to run. Always pin a version rather than <code>latest</code>; <a href=\"/blog/run-your-image\">Run your own image in the cluster</a> shows why.</li>\n<li><code>--replicas=2</code> — two pods.</li>\n<li><code>-n web</code> — in the <code>web</code> namespace.</li>\n</ul>\n<p>Wait for it:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20rollout%20status%20deployment%2Fweb%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl rollout status deployment/web -n web</code></pre></figure>\n<p>Prints <code>successfully rolled out</code>. Now see where the scheduler put the pods:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20pods%20-n%20web%20-o%20wide%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get pods -n web -o wide</code></pre></figure>\n<p>The <code>NODE</code> column shows each pod&#39;s node. With no instructions the scheduler spreads them over the workers.</p>\n<p>Give the pods a stable name inside the cluster with a <strong>Service</strong>:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20expose%20deployment%20web%20--port%3D80%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl expose deployment web --port=80 -n web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20service%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get service -n web</code></pre></figure>\n<p><code>web</code> with a <code>CLUSTER-IP</code>. Other pods can now reach nginx at <code>web</code> (same namespace) or <code>web.web</code>\n(<code>&lt;service&gt;.&lt;namespace&gt;</code>, from any namespace).</p>\n<h3 id=\"12-cache--redis-in-namespace-cache\"><a class=\"anchor\" href=\"#12-cache--redis-in-namespace-cache\" aria-label=\"Link to this section\">#</a>1.2 <code>cache</code> — Redis, in namespace <code>cache</code></h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20deployment%20cache%20--image%3Dredis%3A7-alpine%20-n%20cache%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create deployment cache --image=redis:7-alpine -n cache</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20rollout%20status%20deployment%2Fcache%20-n%20cache%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl rollout status deployment/cache -n cache</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20expose%20deployment%20cache%20--port%3D6379%20-n%20cache%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl expose deployment cache --port=6379 -n cache</code></pre></figure>\n<p>Prove it works by running a command inside the pod:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20exec%20-n%20cache%20deploy%2Fcache%20--%20redis-cli%20ping%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl <span class=\"hljs-built_in\">exec</span> -n cache deploy/cache -- redis-cli ping</code></pre></figure>\n<p>Prints <code>PONG</code>.</p>\n<h3 id=\"13-db--postgres-pinned-to-the-data-node\"><a class=\"anchor\" href=\"#13-db--postgres-pinned-to-the-data-node\" aria-label=\"Link to this section\">#</a>1.3 <code>db</code> — Postgres, pinned to the <code>data</code> node</h3>\n<p>This one is placed deliberately. A YAML manifest lets you say more than the one-line <code>create</code> can. The\n<code>nodeSelector</code> below means &quot;only on a node labelled <code>role=data</code>&quot; (Part 4.3 of <a href=\"/blog/kind-cluster\">Create a local Kubernetes cluster with kind</a> labelled <code>worker2</code> that way):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20apply%20-f%20-%20%3C%3C'EOF'%22%2C%22apiVersion%3A%20apps%2Fv1%22%2C%22kind%3A%20Deployment%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20db%22%2C%22%20%20namespace%3A%20db%22%2C%22spec%3A%22%2C%22%20%20replicas%3A%201%22%2C%22%20%20selector%3A%22%2C%22%20%20%20%20matchLabels%3A%22%2C%22%20%20%20%20%20%20app%3A%20db%22%2C%22%20%20template%3A%22%2C%22%20%20%20%20metadata%3A%22%2C%22%20%20%20%20%20%20labels%3A%22%2C%22%20%20%20%20%20%20%20%20app%3A%20db%22%2C%22%20%20%20%20spec%3A%22%2C%22%20%20%20%20%20%20nodeSelector%3A%22%2C%22%20%20%20%20%20%20%20%20role%3A%20data%22%2C%22%20%20%20%20%20%20containers%3A%22%2C%22%20%20%20%20%20%20%20%20-%20name%3A%20postgres%22%2C%22%20%20%20%20%20%20%20%20%20%20image%3A%20postgres%3A16-alpine%22%2C%22%20%20%20%20%20%20%20%20%20%20env%3A%22%2C%22%20%20%20%20%20%20%20%20%20%20%20%20-%20name%3A%20POSTGRES_PASSWORD%22%2C%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20value%3A%20local-only%22%2C%22%20%20%20%20%20%20%20%20%20%20ports%3A%22%2C%22%20%20%20%20%20%20%20%20%20%20%20%20-%20containerPort%3A%205432%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl apply -f - &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: db\n  namespace: db\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: db\n  template:\n    metadata:\n      labels:\n        app: db\n    spec:\n      nodeSelector:\n        role: data\n      containers:\n        - name: postgres\n          image: postgres:16-alpine\n          <span class=\"hljs-built_in\">env</span>:\n            - name: POSTGRES_PASSWORD\n              value: local-only\n          ports:\n            - containerPort: 5432\nEOF</code></pre></figure>\n<ul>\n<li><code>kubectl apply -f -</code> — create or update whatever the YAML describes; <code>-</code> means &quot;read it from the lines\nthat follow&quot;.</li>\n<li><code>selector.matchLabels</code> / <code>template.metadata.labels</code> — how the Deployment recognises its own pods. The two\nmust match.</li>\n<li><code>nodeSelector</code> — the placement rule.</li>\n<li><code>env</code> — a throwaway password. Real secrets belong in a Kubernetes Secret, not in YAML you commit.</li>\n</ul>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20rollout%20status%20deployment%2Fdb%20-n%20db%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl rollout status deployment/db -n db</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20expose%20deployment%20db%20--port%3D5432%20-n%20db%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl expose deployment db --port=5432 -n db</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20exec%20-n%20db%20deploy%2Fdb%20--%20psql%20-U%20postgres%20-c%20'select%20version()'%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl <span class=\"hljs-built_in\">exec</span> -n db deploy/db -- psql -U postgres -c <span class=\"hljs-string\">&#x27;select version()&#x27;</span></code></pre></figure>\n<p>Prints the Postgres version.</p>\n<h3 id=\"14-a-single-bare-pod\"><a class=\"anchor\" href=\"#14-a-single-bare-pod\" aria-label=\"Link to this section\">#</a>1.4 A single bare pod</h3>\n<p>A Deployment is for apps that must stay up. For a quick one-off, run a plain pod:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20run%20toolbox%20--image%3Dbusybox%3A1.36%20-n%20web%20--restart%3DNever%20--command%20--%20sleep%203600%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl run toolbox --image=busybox:1.36 -n web --restart=Never --<span class=\"hljs-built_in\">command</span> -- <span class=\"hljs-built_in\">sleep</span> 3600</code></pre></figure>\n<p><code>--restart=Never</code> makes it a plain pod: if it dies, nothing recreates it. <code>sleep 3600</code> keeps it alive for an\nhour so you can work inside it.</p>\n<h3 id=\"15-pin-a-pod-to-a-specific-node-by-name\"><a class=\"anchor\" href=\"#15-pin-a-pod-to-a-specific-node-by-name\" aria-label=\"Link to this section\">#</a>1.5 Pin a pod to a specific node by name</h3>\n<p>Besides labels, every node has a built-in <code>kubernetes.io/hostname</code> label:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20apply%20-f%20-%20%3C%3C'EOF'%22%2C%22apiVersion%3A%20v1%22%2C%22kind%3A%20Pod%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20pinned%22%2C%22%20%20namespace%3A%20web%22%2C%22spec%3A%22%2C%22%20%20nodeSelector%3A%22%2C%22%20%20%20%20kubernetes.io%2Fhostname%3A%20local-cluster-1-worker%22%2C%22%20%20containers%3A%22%2C%22%20%20%20%20-%20name%3A%20nginx%22%2C%22%20%20%20%20%20%20image%3A%20nginx%3A1.27%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl apply -f - &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\napiVersion: v1\nkind: Pod\nmetadata:\n  name: pinned\n  namespace: web\nspec:\n  nodeSelector:\n    kubernetes.io/hostname: local-cluster-1-worker\n  containers:\n    - name: nginx\n      image: nginx:1.27\nEOF</code></pre></figure>\n<h3 id=\"16-see-everything\"><a class=\"anchor\" href=\"#16-see-everything\" aria-label=\"Link to this section\">#</a>1.6 See everything</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20pods%20-A%20-o%20wide%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get pods -A -o wide</code></pre></figure>\n<p><code>-A</code> means all namespaces. Find your pods and their <code>NODE</code>:</p>\n<ul>\n<li><code>web-…</code> ×2 (spread over both workers), plus <code>toolbox</code> and <code>pinned</code> (<code>pinned</code> on <code>local-cluster-1-worker</code>)</li>\n<li><code>cache-…</code> on a worker</li>\n<li><code>db-…</code> on <code>local-cluster-1-worker2</code>, because of <code>role=data</code></li>\n</ul>\n<p>Or just one folder at a time:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20all%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get all -n web</code></pre></figure>\n<p><strong>Check:</strong> every pod is <code>Running</code> and <code>READY</code> shows <code>1/1</code> (give the first image pulls a minute).</p>\n<hr>\n<h2 id=\"part-2--use-what-you-deployed\"><a class=\"anchor\" href=\"#part-2--use-what-you-deployed\" aria-label=\"Link to this section\">#</a>Part 2 — Use what you deployed</h2>\n<p><strong>2.1 Open nginx from your Mac with a port-forward.</strong> This tunnels a Mac port to a Service. It stays in the\nforeground, so use a second terminal tab for the <code>curl</code>:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20port-forward%20svc%2Fweb%208081%3A80%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl port-forward svc/web 8081:80 -n web</code></pre></figure>\n<p>In the other tab:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22curl%20-s%20http%3A%2F%2Flocalhost%3A8081%20%7C%20head%20-5%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>curl -s http://localhost:8081 | <span class=\"hljs-built_in\">head</span> -5</code></pre></figure>\n<p>The start of the nginx welcome page. Stop the tunnel with <code>Ctrl-C</code>.</p>\n<p><strong>2.2 Reach one namespace from another.</strong> Run a short-lived pod in <code>cache</code> that fetches the page from the\n<code>web</code> Service:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20run%20dns-test%20-n%20cache%20--rm%20-i%20--restart%3DNever%20--image%3Dbusybox%3A1.36%20--%20wget%20-qO-%20http%3A%2F%2Fweb.web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl run dns-test -n cache --<span class=\"hljs-built_in\">rm</span> -i --restart=Never --image=busybox:1.36 -- wget -qO- http://web.web</code></pre></figure>\n<p>In one sentence: it starts a temporary pod in <code>cache</code>, uses it to fetch a page from the <code>web</code> Service in another\nnamespace, prints the result, and deletes the pod.</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Part</th><th>Meaning</th></tr></thead><tbody><tr><td><code>kubectl run dns-test</code></td><td>Create a single pod named <code>dns-test</code></td></tr>\n<tr><td><code>-n cache</code></td><td>Put it in the <code>cache</code> namespace, so the request comes from there</td></tr>\n<tr><td><code>--image=busybox:1.36</code></td><td>The container image: a tiny Linux toolbox that includes <code>wget</code></td></tr>\n<tr><td><code>--restart=Never</code></td><td>A plain one-off pod: run once, do not restart when it finishes</td></tr>\n<tr><td><code>--rm</code></td><td>Delete the pod when the command ends</td></tr>\n<tr><td><code>-i</code></td><td>Keep stdin attached and wait for the command, so its output shows in your terminal</td></tr>\n<tr><td><code>--</code></td><td>Everything after this is the command to run inside the pod, not options for kubectl</td></tr>\n<tr><td><code>wget -qO- http://web.web</code></td><td>The command the pod runs</td></tr></tbody></table></div>\n<p>The command inside the pod:</p>\n<ul>\n<li><code>wget</code> downloads a URL.</li>\n<li><code>-q</code> is quiet (no progress output).</li>\n<li><code>-O-</code> writes the page to standard output instead of a file, so it appears on your screen.</li>\n<li><code>http://web.web</code> is <code>&lt;service&gt;.&lt;namespace&gt;</code>: the Service <code>web</code> in the namespace <code>web</code>.</li>\n</ul>\n<p><strong>What it proves.</strong> The pod is in <code>cache</code> but reaches a Service in <code>web</code>. Cluster DNS turns <code>web.web</code> into the\nService&#39;s address, so a pod in one namespace can call a Service in another. The output is the nginx welcome\npage HTML. Run from inside the <code>web</code> namespace, plain <code>web</code> would work too, because the namespace part\ndefaults to the pod&#39;s own.</p>\n<p>A warning &quot;couldn&#39;t attach to pod&quot; is harmless: the pod finished before kubectl attached.</p>\n<p><strong>2.3 Reach a Service without port-forward (NodePort).</strong> This reaches <code>web</code> from your local machine at\n<code>localhost:8080</code>, with no command left running.</p>\n<p><strong>The problem.</strong> A normal Service (ClusterIP) is reachable only from inside the cluster, and kind&#39;s nodes are\nDocker containers, so their ports are not open on your local machine either. A request has to cross two\nboundaries:</p>\n<ol>\n<li><strong>Local machine to node container.</strong> This is what <code>extraPortMappings</code> in Part 2.1 of <a href=\"/blog/kind-cluster\">Create a local Kubernetes cluster with kind</a> set up: local port\n<code>8080</code> goes to port <code>30080</code> on the control-plane container.</li>\n<li><strong>Node to pod.</strong> This is what a <code>NodePort</code> Service sets up: port <code>30080</code> on every node forwards to the\nService&#39;s pods.</li>\n</ol>\n<p>Create the Service:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20apply%20-f%20-%20%3C%3C'EOF'%22%2C%22apiVersion%3A%20v1%22%2C%22kind%3A%20Service%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20web-public%22%2C%22%20%20namespace%3A%20web%22%2C%22spec%3A%22%2C%22%20%20type%3A%20NodePort%22%2C%22%20%20selector%3A%22%2C%22%20%20%20%20app%3A%20web%22%2C%22%20%20ports%3A%22%2C%22%20%20%20%20-%20port%3A%2080%22%2C%22%20%20%20%20%20%20targetPort%3A%2080%22%2C%22%20%20%20%20%20%20nodePort%3A%2030080%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl apply -f - &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\napiVersion: v1\nkind: Service\nmetadata:\n  name: web-public\n  namespace: web\nspec:\n  <span class=\"hljs-built_in\">type</span>: NodePort\n  selector:\n    app: web\n  ports:\n    - port: 80\n      targetPort: 80\n      nodePort: 30080\nEOF</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22curl%20-s%20http%3A%2F%2Flocalhost%3A8080%20%7C%20head%20-5%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>curl -s http://localhost:8080 | <span class=\"hljs-built_in\">head</span> -5</code></pre></figure>\n<p>The nginx page again, no tunnel running.</p>\n<p><strong>The YAML, field by field</strong></p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Field</th><th>Meaning</th></tr></thead><tbody><tr><td><code>name: web-public</code>, <code>namespace: web</code></td><td>A second Service next to the existing <code>web</code> one, in the same namespace as the pods</td></tr>\n<tr><td><code>type: NodePort</code></td><td>In addition to a normal cluster address, open a fixed port on every node</td></tr>\n<tr><td><code>selector: app: web</code></td><td>Send traffic to pods labelled <code>app=web</code>; <code>kubectl create deployment web</code> labelled its pods that way</td></tr>\n<tr><td><code>port: 80</code></td><td>The Service&#39;s own port, used inside the cluster</td></tr>\n<tr><td><code>targetPort: 80</code></td><td>The port the nginx container listens on</td></tr>\n<tr><td><code>nodePort: 30080</code></td><td>The port opened on each node. It must match the <code>containerPort: 30080</code> in <code>kind-config.yaml</code> and be in the range 30000–32767</td></tr></tbody></table></div>\n<p><strong>The path a request takes</strong></p>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>curl localhost:8080\n  → local machine, port 8080\n  → control-plane container, port 30080     (extraPortMappings)\n  → Service web-public                      (NodePort)\n  → one of the web pods, port 80</code></pre></figure>\n<p><strong>Why it works through the control-plane node.</strong> The <code>extraPortMappings</code> entry is on the control-plane node,\nbut the pods run on the workers. This still works because kube-proxy opens the node port on <strong>every</strong> node,\nnot only the ones running the pods. Traffic arriving at the control-plane&#39;s port <code>30080</code> is forwarded across\nthe cluster to a <code>web</code> pod on whichever worker has one.</p>\n<p><strong>Compared with <code>port-forward</code> (2.1)</strong></p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th></th><th><code>kubectl port-forward</code></th><th>NodePort + <code>extraPortMappings</code></th></tr></thead><tbody><tr><td>Needs a command left running</td><td>yes</td><td>no</td></tr>\n<tr><td>Set up when</td><td>any time</td><td>the port mapping must exist when the cluster is created</td></tr>\n<tr><td>Spreads traffic over pods</td><td>no, it picks one pod</td><td>yes, across all of them</td></tr></tbody></table></div>\n<p><strong>If it does not answer:</strong> check that the cluster was created with the <code>extraPortMappings</code> block, that\n<code>kubectl get svc -n web</code> shows <code>30080</code> for <code>web-public</code>, and that <code>kubectl get endpoints web-public -n web</code>\nlists pod IPs (an empty list means the selector matches nothing).</p>\n<p><strong>2.4 Logs and a shell:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20logs%20deploy%2Fweb%20-n%20web%20--tail%3D5%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl logs deploy/web -n web --<span class=\"hljs-built_in\">tail</span>=5</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20exec%20-it%20toolbox%20-n%20web%20--%20sh%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl <span class=\"hljs-built_in\">exec</span> -it toolbox -n web -- sh</code></pre></figure>\n<p>A shell inside the <code>toolbox</code> pod (<code>exit</code> to leave).</p>\n<p><strong>2.5 Watch Kubernetes heal itself.</strong> In one tab:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20pods%20-n%20web%20-w%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get pods -n web -w</code></pre></figure>\n<p>In another, delete one of the <code>web</code> pods (copy a real name from the list):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete pod &lt;web-pod-name&gt; -n web</code></pre></figure>\n<p>The Deployment immediately starts a replacement. The bare pods <code>toolbox</code> and <code>pinned</code> would not come back.\n<code>Ctrl-C</code> ends the watch.</p>\n<p><strong>2.6 Scale up and down:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20scale%20deployment%20web%20--replicas%3D4%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl scale deployment web --replicas=4 -n web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20scale%20deployment%20web%20--replicas%3D2%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl scale deployment web --replicas=2 -n web</code></pre></figure>\n<hr>\n<h2 id=\"where-next\"><a class=\"anchor\" href=\"#where-next\" aria-label=\"Link to this section\">#</a>Where next</h2>\n<ul>\n<li>Run an image you built yourself: <a href=\"/blog/run-your-image\">Run your own image in the cluster</a></li>\n<li>Stop or remove it all: <a href=\"/blog/clean-up\">Stop, shut down and clean up</a></li>\n</ul>\n";
var deploy_apps_default = {
	slug: slug$6,
	title: title$6,
	description: description$6,
	order: 6,
	tags: tags$6,
	date: date$6,
	minutes: 13,
	words: words$6,
	toc: toc$6,
	html: html$6
};
//#endregion
//#region src/blog/generated/posts/helm-2-chart.json
var helm_2_chart_exports = /* @__PURE__ */ __exportAll({
	date: () => date$5,
	default: () => helm_2_chart_default,
	description: () => description$5,
	html: () => html$5,
	minutes: () => 39,
	order: () => 7,
	slug: () => slug$5,
	tags: () => tags$5,
	title: () => title$5,
	toc: () => toc$5,
	words: () => words$5
});
var slug$5 = "helm-2-chart";
var title$5 = "Deploy with a Helm 2 chart: every template, explained";
var description$5 = "Package an application as a Helm 2 chart and deploy it: image pull secret, ConfigMap, Secret, Service, Ingress, autoscaling and more.";
var tags$5 = ["helm"];
var date$5 = "2026-10-14";
var words$5 = 4762;
var toc$5 = [
	{
		"depth": 2,
		"id": "1-how-helm-2-works",
		"text": "1. How Helm 2 works"
	},
	{
		"depth": 2,
		"id": "2-set-up-helm-2-on-your-cluster",
		"text": "2. Set up Helm 2 on your cluster"
	},
	{
		"depth": 3,
		"id": "21-the-client",
		"text": "2.1 The client"
	},
	{
		"depth": 3,
		"id": "22-tiller-its-account-and-its-permission",
		"text": "2.2 Tiller: its account and its permission"
	},
	{
		"depth": 3,
		"id": "23-install-tiller-matching-the-client-version",
		"text": "2.3 Install Tiller, matching the client version"
	},
	{
		"depth": 3,
		"id": "24-tillers-security-problem-and-the-habit-that-follows",
		"text": "2.4 Tiller's security problem, and the habit that follows"
	},
	{
		"depth": 2,
		"id": "3-what-a-chart-is-made-of",
		"text": "3. What a chart is made of"
	},
	{
		"depth": 2,
		"id": "4-the-template-language-in-ten-minutes",
		"text": "4. The template language in ten minutes"
	},
	{
		"depth": 2,
		"id": "5-build-the-chart-file-by-file",
		"text": "5. Build the chart, file by file"
	},
	{
		"depth": 3,
		"id": "51-chartyaml-the-charts-identity",
		"text": "5.1 Chart.yaml: the chart's identity"
	},
	{
		"depth": 3,
		"id": "52-valuesyaml-every-setting-in-one-place",
		"text": "5.2 values.yaml: every setting in one place"
	},
	{
		"depth": 3,
		"id": "53-templateshelperstpl-names-and-labels-defined-once",
		"text": "5.3 templates/helpers.tpl: names and labels, defined once"
	},
	{
		"depth": 3,
		"id": "54-serviceaccountyaml-the-pods-identity",
		"text": "5.4 serviceaccount.yaml: the pod's identity"
	},
	{
		"depth": 3,
		"id": "55-imagepullsecretyaml-the-registry-login-regsecret",
		"text": "5.5 imagepullsecret.yaml: the registry login (regsecret)"
	},
	{
		"depth": 3,
		"id": "56-configmapyaml-settings",
		"text": "5.6 configmap.yaml: settings"
	},
	{
		"depth": 3,
		"id": "57-secretyaml-credentials",
		"text": "5.7 secret.yaml: credentials"
	},
	{
		"depth": 3,
		"id": "58-deploymentyaml-the-application",
		"text": "5.8 deployment.yaml: the application"
	},
	{
		"depth": 3,
		"id": "59-serviceyaml-a-stable-name-for-the-pods",
		"text": "5.9 service.yaml: a stable name for the pods"
	},
	{
		"depth": 3,
		"id": "510-ingressyaml-http-routing-from-outside",
		"text": "5.10 ingress.yaml: HTTP routing from outside"
	},
	{
		"depth": 3,
		"id": "511-hpayaml-autoscaling-the-pods",
		"text": "5.11 hpa.yaml: autoscaling the pods"
	},
	{
		"depth": 3,
		"id": "512-pdbyaml-stay-available-during-maintenance",
		"text": "5.12 pdb.yaml: stay available during maintenance"
	},
	{
		"depth": 3,
		"id": "513-pvcyaml-storage-that-outlives-the-pod",
		"text": "5.13 pvc.yaml: storage that outlives the pod"
	},
	{
		"depth": 3,
		"id": "514-networkpolicyyaml-who-may-talk-to-the-pods",
		"text": "5.14 networkpolicy.yaml: who may talk to the pods"
	},
	{
		"depth": 3,
		"id": "515-job-migrateyaml-a-hook-that-runs-before-each-install-or-upgrade",
		"text": "5.15 job-migrate.yaml: a hook that runs before each install or upgrade"
	},
	{
		"depth": 3,
		"id": "516-cronjobyaml-a-scheduled-task",
		"text": "5.16 cronjob.yaml: a scheduled task"
	},
	{
		"depth": 3,
		"id": "517-notestxt-what-to-tell-the-user-after-install",
		"text": "5.17 NOTES.txt: what to tell the user after install"
	},
	{
		"depth": 3,
		"id": "518-teststest-connectionyaml-a-built-in-check",
		"text": "5.18 tests/test-connection.yaml: a built-in check"
	},
	{
		"depth": 3,
		"id": "519-helmignore",
		"text": "5.19 .helmignore"
	},
	{
		"depth": 3,
		"id": "520-requirementsyaml-other-charts-you-depend-on",
		"text": "5.20 requirements.yaml: other charts you depend on"
	},
	{
		"depth": 3,
		"id": "521-other-objects-you-may-add",
		"text": "5.21 Other objects you may add"
	},
	{
		"depth": 2,
		"id": "6-check-the-chart-before-installing-it",
		"text": "6. Check the chart before installing it"
	},
	{
		"depth": 2,
		"id": "7-install-upgrade-roll-back-remove",
		"text": "7. Install, upgrade, roll back, remove"
	},
	{
		"depth": 2,
		"id": "8-secrets-and-credentials-keep-them-out-of-the-release",
		"text": "8. Secrets and credentials: keep them out of the release"
	},
	{
		"depth": 2,
		"id": "9-one-chart-many-environments",
		"text": "9. One chart, many environments"
	},
	{
		"depth": 2,
		"id": "10-a-checklist-for-a-perfect-system",
		"text": "10. A checklist for \"a perfect system\""
	},
	{
		"depth": 2,
		"id": "11-helm-2-versus-helm-3",
		"text": "11. Helm 2 versus Helm 3"
	},
	{
		"depth": 2,
		"id": "12-when-something-goes-wrong",
		"text": "12. When something goes wrong"
	},
	{
		"depth": 2,
		"id": "13-clean-up",
		"text": "13. Clean up"
	}
];
var html$5 = "<p>How to package an application as a Helm 2 chart and deploy it into a namespace: what each file in the chart is\nfor, when you need it, and how the pieces fit together into a complete, production-shaped release (image pull\nsecret, ConfigMap, Secret, Service, Ingress, autoscaling, disruption budget and more).</p>\n<blockquote>\n<p><strong>Not tested yet.</strong> Written from Helm 2&#39;s documented behaviour. The chart is a complete, runnable example\n(<code>myapp</code>, which runs nginx) so every template can be shown in context. Run it once and fix anything that\ndiffers on your versions. It assumes the cluster and namespaces from\n<a href=\"/blog/kind-cluster\">Create a local Kubernetes cluster with kind</a> (or <a href=\"/blog/k3d-cluster\">Create a local Kubernetes cluster with k3d</a>).</p>\n</blockquote>\n<blockquote>\n<p><strong>Helm 2 is end-of-life</strong> (support ended in 2020) and Tiller, its in-cluster server, is a known security\nweak point (section 2.4). Use Helm 2 only because a project pins it. For a new project use Helm 3, which has\nno Tiller; section 11 lists the differences.</p>\n</blockquote>\n<hr>\n<h2 id=\"1-how-helm-2-works\"><a class=\"anchor\" href=\"#1-how-helm-2-works\" aria-label=\"Link to this section\">#</a>1. How Helm 2 works</h2>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code> your terminal                          the cluster\n ┌────────────┐   helm install    ┌────────────────────┐   creates    ┌───────────────────┐\n │ helm       │ ────────────────► │ Tiller (a pod in   │ ───────────► │ Deployment,       │\n │ (client)   │   chart + values  │ kube-system)       │   objects    │ Service, Secret…  │\n └────────────┘                   └────────────────────┘              └───────────────────┘</code></pre></figure>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Word</th><th>Meaning</th></tr></thead><tbody><tr><td><strong>Chart</strong></td><td>A folder of templates plus default settings: one application, packaged</td></tr>\n<tr><td><strong>Values</strong></td><td>The settings that fill the templates: image tag, replicas, hostnames</td></tr>\n<tr><td><strong>Template</strong></td><td>A Kubernetes YAML file with <code>{{ … }}</code> holes that values fill in</td></tr>\n<tr><td><strong>Release</strong></td><td>One installed copy of a chart, with a name (<code>web-prod</code>). Install the same chart twice, get two releases</td></tr>\n<tr><td><strong>Revision</strong></td><td>A numbered version of a release. Every upgrade makes a new one; rollback goes back to an old one</td></tr>\n<tr><td><strong>Tiller</strong></td><td>The server half of Helm 2. The client sends it the chart; Tiller renders it and applies it</td></tr></tbody></table></div>\n<p>Three consequences of Tiller to remember:</p>\n<ul>\n<li><strong>The client and Tiller must be the same Helm version</strong>, or Helm refuses with an &quot;incompatible versions&quot;\nerror.</li>\n<li><strong>Tiller acts with its own ServiceAccount&#39;s permissions</strong>, not yours. Whatever it may do, anyone who can talk to\nit may do.</li>\n<li><strong>Tiller stores every release inside the cluster</strong>, as ConfigMaps in <code>kube-system</code>, including the values and\nthe rendered manifests. See section 2.4 and section 8.</li>\n</ul>\n<hr>\n<h2 id=\"2-set-up-helm-2-on-your-cluster\"><a class=\"anchor\" href=\"#2-set-up-helm-2-on-your-cluster\" aria-label=\"Link to this section\">#</a>2. Set up Helm 2 on your cluster</h2>\n<h3 id=\"21-the-client\"><a class=\"anchor\" href=\"#21-the-client\" aria-label=\"Link to this section\">#</a>2.1 The client</h3>\n<p>Pick the Helm 2 version to use and keep it the same everywhere (client and Tiller). This guide uses <strong>2.17.0</strong>,\nthe last Helm 2 release.</p>\n<p><strong>Native binary:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22curl%20-fsSL%20https%3A%2F%2Fget.helm.sh%2Fhelm-v2.17.0-darwin-amd64.tar.gz%20%7C%20tar%20xz%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>curl -fsSL https://get.helm.sh/helm-v2.17.0-darwin-amd64.tar.gz | tar xz</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">sudo</span> <span class=\"hljs-built_in\">mv</span> darwin-amd64/helm /usr/local/bin/helm2</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20version%20--client%20--short%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 version --client --short</code></pre></figure>\n<p><code>Client: v2.17.0+g…</code>. On Apple Silicon this runs under Rosetta. Old Helm 2 builds are made with an old Go\ntoolchain, and on some macOS versions they <strong>crash with a segmentation fault</strong>. If yours does, use the\ncontainer version instead.</p>\n<p><strong>Container version</strong> (a Linux copy of the client, started per command). Create the kubeconfig it will use. It\nmust use the cluster&#39;s address as seen <em>from inside Docker&#39;s <code>kind</code> network</em>, so it has its own file:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22mkdir%20-p%20~%2F.helm2%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">mkdir</span> -p ~/.helm2</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kind%20get%20kubeconfig%20--internal%20--name%20local-cluster-1%20%3E%20~%2F.kube%2Fkind-internal%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kind get kubeconfig --internal --name local-cluster-1 &gt; ~/.kube/kind-internal</code></pre></figure>\n<p>Do these in this order. If <code>~/.kube/kind-internal</code> does not exist when Docker is asked to share it, Docker\ncreates an <strong>empty folder</strong> with that name and everything after fails. (This container setup is for kind. On k3d, use the native binary.)</p>\n<p>Then define a shell function (put it in <code>~/.zshrc</code> to keep it):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-function\"><span class=\"hljs-title\">helm2</span></span>() {\n  docker run --<span class=\"hljs-built_in\">rm</span> -i --platform linux/amd64 --network kind \\\n    -v <span class=\"hljs-string\">&quot;<span class=\"hljs-variable\">$HOME</span>/.kube/kind-internal:/root/.kube/config:ro&quot;</span> \\\n    -v <span class=\"hljs-string\">&quot;<span class=\"hljs-variable\">$HOME</span>/.helm2:/root/.helm&quot;</span> \\\n    -v <span class=\"hljs-string\">&quot;<span class=\"hljs-variable\">$PWD</span>:/work&quot;</span> -w /work \\\n    --entrypoint helm lachlanevenson/k8s-helm:v2.17.0 <span class=\"hljs-string\">&quot;<span class=\"hljs-variable\">$@</span>&quot;</span>\n}</code></pre></figure>\n<p>Line by line:</p>\n<ul>\n<li><code>docker run --rm -i</code> — run Helm in a throwaway container.</li>\n<li><code>--platform linux/amd64</code> — the image is Intel-only; Docker emulates it on Apple Silicon.</li>\n<li><code>--network kind</code> — join the network where the cluster&#39;s API server has the name the internal kubeconfig uses.</li>\n<li><code>-v …kind-internal:/root/.kube/config:ro</code> — hand Helm the kubeconfig, read-only.</li>\n<li><code>-v ~/.helm2:/root/.helm</code> — keep Helm&#39;s settings and repository cache between runs.</li>\n<li><code>-v &quot;$PWD:/work&quot; -w /work</code> — make the current folder visible inside, so <code>helm2 install ./myapp</code> finds your chart.</li>\n<li><code>--entrypoint helm … &quot;$@&quot;</code> — run <code>helm</code> with whatever arguments you typed.</li>\n</ul>\n<p>Check that the image tag exists (<code>docker pull lachlanevenson/k8s-helm:v2.17.0</code>); any image that contains the\nHelm 2 client works the same way.</p>\n<h3 id=\"22-tiller-its-account-and-its-permission\"><a class=\"anchor\" href=\"#22-tiller-its-account-and-its-permission\" aria-label=\"Link to this section\">#</a>2.2 Tiller: its account and its permission</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20-n%20kube-system%20create%20serviceaccount%20tiller%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl -n kube-system create serviceaccount tiller</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20clusterrolebinding%20tiller%20--clusterrole%3Dcluster-admin%20--serviceaccount%3Dkube-system%3Atiller%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create clusterrolebinding tiller --clusterrole=cluster-admin --serviceaccount=kube-system:tiller</code></pre></figure>\n<p>This gives Tiller <code>cluster-admin</code>, which is the easy lab setup and the unsafe one (section 2.4).</p>\n<h3 id=\"23-install-tiller-matching-the-client-version\"><a class=\"anchor\" href=\"#23-install-tiller-matching-the-client-version\" aria-label=\"Link to this section\">#</a>2.3 Install Tiller, matching the client version</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20pull%20--platform%20linux%2Famd64%20ghcr.io%2Fhelm%2Ftiller%3Av2.17.0%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker pull --platform linux/amd64 ghcr.io/helm/tiller:v2.17.0</code></pre></figure>\n<p>Tiller&#39;s image is Intel-only too. On Apple Silicon, turn on <em>Use Rosetta for x86_64/amd64 emulation</em> in Docker\nDesktop first.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20init%20--service-account%20tiller%20--tiller-image%20ghcr.io%2Fhelm%2Ftiller%3Av2.17.0%20--stable-repo-url%20https%3A%2F%2Fcharts.helm.sh%2Fstable%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 init --service-account tiller --tiller-image ghcr.io/helm/tiller:v2.17.0 --stable-repo-url https://charts.helm.sh/stable</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20-n%20kube-system%20rollout%20status%20deploy%2Ftiller-deploy%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl -n kube-system rollout status deploy/tiller-deploy</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20version%20--short%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 version --short</code></pre></figure>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>Client: v2.17.0+g…\nServer: v2.17.0+g…</code></pre></figure>\n<p>Both lines must show the same version.</p>\n<p><strong>If <code>helm2 init</code> fails, you are probably on an older Helm 2 (2.10–2.14).</strong> Those describe Tiller as an\n<code>extensions/v1beta1</code> Deployment, which modern Kubernetes removed. Have Helm print the description instead of\napplying it, rewrite it to <code>apps/v1</code>, and apply that with kubectl:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20init%20--service-account%20tiller%20--tiller-image%20ghcr.io%2Fhelm%2Ftiller%3Av2.10.0%20--stable-repo-url%20https%3A%2F%2Fcharts.helm.sh%2Fstable%20--output%20yaml%20%7C%20perl%20-pe%20's%23%5EapiVersion%3A%20extensions%2Fv1beta1%23apiVersion%3A%20apps%2Fv1%23%3B%20s%23%5E(%5C%5Cs%2B)replicas%3A%201%23%241replicas%3A%201%5C%5Cn%241selector%3A%20%7BmatchLabels%3A%20%7Bapp%3A%20helm%2C%20name%3A%20tiller%7D%7D%23'%20%7C%20kubectl%20apply%20-f%20-%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 init --service-account tiller --tiller-image ghcr.io/helm/tiller:v2.10.0 --stable-repo-url https://charts.helm.sh/stable --output yaml | perl -pe <span class=\"hljs-string\">&#x27;s#^apiVersion: extensions/v1beta1#apiVersion: apps/v1#; s#^(\\s+)replicas: 1#$1replicas: 1\\n$1selector: {matchLabels: {app: helm, name: tiller}}#&#x27;</span> | kubectl apply -f -</code></pre></figure>\n<p>The <code>perl</code> part changes the API version and adds the <code>selector</code> that <code>apps/v1</code> requires. Then finish the\nclient side with <code>helm2 init --client-only --stable-repo-url https://charts.helm.sh/stable</code>.</p>\n<h3 id=\"24-tillers-security-problem-and-the-habit-that-follows\"><a class=\"anchor\" href=\"#24-tillers-security-problem-and-the-habit-that-follows\" aria-label=\"Link to this section\">#</a>2.4 Tiller&#39;s security problem, and the habit that follows</h3>\n<ul>\n<li>Tiller with <code>cluster-admin</code> lets anyone who can reach it do anything in the cluster.</li>\n<li><strong>Release data is stored as ConfigMaps in <code>kube-system</code></strong>, including your values. A secret passed to a chart\ncan be read by anyone who may read ConfigMaps there.</li>\n</ul>\n<p>The habit: <strong>do not put real secrets in values or in chart templates.</strong> Create them separately (section 8) and\nlet the chart only reference them by name. A tighter setup (Tiller per namespace with a limited Role) exists\nbut is more work; see the Helm 2 docs on &quot;securing your Helm installation&quot;.</p>\n<hr>\n<h2 id=\"3-what-a-chart-is-made-of\"><a class=\"anchor\" href=\"#3-what-a-chart-is-made-of\" aria-label=\"Link to this section\">#</a>3. What a chart is made of</h2>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>myapp/\n├── Chart.yaml            name, version, description of the chart\n├── values.yaml           the default settings\n├── requirements.yaml     other charts this one depends on (optional)\n├── .helmignore           files to leave out of the package\n├── files/\n│   └── app.conf          plain files the templates can read\n├── charts/               downloaded dependency charts (filled by `helm dep update`)\n└── templates/\n    ├── _helpers.tpl          named snippets reused by the other templates (no object created)\n    ├── NOTES.txt             message printed after install\n    ├── serviceaccount.yaml   the pod&#39;s identity\n    ├── imagepullsecret.yaml  the registry login (&quot;regsecret&quot;)\n    ├── configmap.yaml        settings\n    ├── secret.yaml           credentials\n    ├── deployment.yaml       the app itself\n    ├── service.yaml          a stable name and address for the pods\n    ├── ingress.yaml          HTTP routing from outside\n    ├── hpa.yaml              autoscaling the pods\n    ├── pdb.yaml              limit disruption during node maintenance\n    ├── networkpolicy.yaml    who may talk to the pods\n    ├── pvc.yaml              storage\n    ├── job-migrate.yaml      a task to run before each install or upgrade (a hook)\n    ├── cronjob.yaml          a scheduled task\n    └── tests/\n        └── test-connection.yaml   a check run by `helm test`</code></pre></figure>\n<p>Every file in <code>templates/</code> that does not start with <code>_</code> is rendered, and each document in it becomes a\nKubernetes object. Files that render to nothing (a switched-off <code>{{ if }}</code>) are simply skipped.</p>\n<hr>\n<h2 id=\"4-the-template-language-in-ten-minutes\"><a class=\"anchor\" href=\"#4-the-template-language-in-ten-minutes\" aria-label=\"Link to this section\">#</a>4. The template language in ten minutes</h2>\n<p>Templates are Go templates. Anything inside <code>{{ }}</code> is evaluated; the rest is copied as is.</p>\n<p><strong>Where values come from:</strong></p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Expression</th><th>Value</th></tr></thead><tbody><tr><td><code>.Values.image.tag</code></td><td>A setting from <code>values.yaml</code>, <code>-f file</code> or <code>--set</code></td></tr>\n<tr><td><code>.Release.Name</code></td><td>The name you gave the release</td></tr>\n<tr><td><code>.Release.Namespace</code></td><td>The namespace it is installed into</td></tr>\n<tr><td><code>.Release.Revision</code></td><td>1 for install, then 2, 3… on each upgrade</td></tr>\n<tr><td><code>.Release.IsInstall</code> / <code>.Release.IsUpgrade</code></td><td>true on the matching operation</td></tr>\n<tr><td><code>.Release.Service</code></td><td><code>Tiller</code> in Helm 2</td></tr>\n<tr><td><code>.Chart.Name</code>, <code>.Chart.Version</code>, <code>.Chart.AppVersion</code></td><td>From <code>Chart.yaml</code></td></tr>\n<tr><td><code>.Template.BasePath</code></td><td>The <code>templates/</code> folder, for including another file</td></tr>\n<tr><td><code>.Files.Get &quot;files/app.conf&quot;</code></td><td>The text of a file in the chart</td></tr>\n<tr><td><code>.Capabilities.APIVersions.Has &quot;x/v1&quot;</code></td><td>Whether the cluster supports an API</td></tr></tbody></table></div>\n<p><strong>What to do with them:</strong></p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Syntax</th><th>Meaning</th></tr></thead><tbody><tr><td><code>{{ .Values.x | quote }}</code></td><td>Pipe a value through a function, here wrapping it in quotes</td></tr>\n<tr><td><code>{{ default &quot;a&quot; .Values.x }}</code></td><td>Use <code>&quot;a&quot;</code> if <code>x</code> is empty</td></tr>\n<tr><td><code>{{ required &quot;x is required&quot; .Values.x }}</code></td><td>Stop with an error if <code>x</code> is empty</td></tr>\n<tr><td><code>{{ if .Values.x }} … {{ else }} … {{ end }}</code></td><td>Conditional</td></tr>\n<tr><td><code>{{ range $k, $v := .Values.map }} … {{ end }}</code></td><td>Loop</td></tr>\n<tr><td><code>{{ with .Values.x }} … {{ end }}</code></td><td>Run only if set, and make <code>.</code> mean <code>x</code> inside</td></tr>\n<tr><td><code>{{ toYaml .Values.x | indent 8 }}</code></td><td>Turn a value into YAML and indent it 8 spaces</td></tr>\n<tr><td><code>{{ include &quot;myapp.fullname&quot; . }}</code></td><td>Run a named snippet from <code>_helpers.tpl</code></td></tr>\n<tr><td><code>{{ printf &quot;%s-%s&quot; a b }}</code></td><td>Build a string</td></tr>\n<tr><td><code>{{ .Values.x | b64enc }}</code>, <code>sha256sum</code>, <code>trunc 63</code></td><td>Encode, hash, shorten</td></tr></tbody></table></div>\n<p><strong>Two details that cause most template bugs:</strong></p>\n<ul>\n<li><strong><code>{{-</code> and <code>-}}</code> trim whitespace</strong> on that side, including newlines. <code>{{- if … }}</code> removes the line break\nbefore it, which keeps the output free of blank lines.</li>\n<li><strong>Inside <code>range</code> and <code>with</code>, <code>.</code> changes.</strong> To reach the top-level values from inside, save what you need\nfirst (<code>{{- $fullName := include &quot;myapp.fullname&quot; . -}}</code>) or use <code>$</code> (the root).</li>\n</ul>\n<p><strong>Helm 2 limits.</strong> There is no <code>lookup</code> function (Helm 3 only). Use <code>indent</code>, not <code>nindent</code> (older Helm 2\nversions do not have it). A release name may be at most 53 characters.</p>\n<hr>\n<h2 id=\"5-build-the-chart-file-by-file\"><a class=\"anchor\" href=\"#5-build-the-chart-file-by-file\" aria-label=\"Link to this section\">#</a>5. Build the chart, file by file</h2>\n<p>Start in the folder where you keep your work:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22mkdir%20-p%20myapp%2Ftemplates%2Ftests%20myapp%2Ffiles%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">mkdir</span> -p myapp/templates/tests myapp/files</code></pre></figure>\n<h3 id=\"51-chartyaml-the-charts-identity\"><a class=\"anchor\" href=\"#51-chartyaml-the-charts-identity\" aria-label=\"Link to this section\">#</a>5.1 <code>Chart.yaml</code>: the chart&#39;s identity</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2FChart.yaml%20%3C%3C'EOF'%22%2C%22apiVersion%3A%20v1%22%2C%22name%3A%20myapp%22%2C%22version%3A%200.1.0%22%2C%22appVersion%3A%20%5C%221.0%5C%22%22%2C%22description%3A%20A%20sample%20web%20app%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/Chart.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\napiVersion: v1\nname: myapp\nversion: 0.1.0\nappVersion: <span class=\"hljs-string\">&quot;1.0&quot;</span>\ndescription: A sample web app\nEOF</code></pre></figure>\n<ul>\n<li><code>apiVersion: v1</code> — <strong>Helm 2 charts use <code>v1</code>.</strong> <code>v2</code> is for Helm 3 charts and Helm 2 rejects it.</li>\n<li><code>name</code> — the chart&#39;s name; must match the folder.</li>\n<li><code>version</code> — the version of the <strong>chart</strong> (bump it when you change the templates).</li>\n<li><code>appVersion</code> — the version of the <strong>application</strong> inside (informational).</li>\n</ul>\n<h3 id=\"52-valuesyaml-every-setting-in-one-place\"><a class=\"anchor\" href=\"#52-valuesyaml-every-setting-in-one-place\" aria-label=\"Link to this section\">#</a>5.2 <code>values.yaml</code>: every setting in one place</h3>\n<p>The defaults for everything the templates read. A chart with a good <code>values.yaml</code> needs no template edits for\na new environment.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/values.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\nnameOverride: <span class=\"hljs-string\">&quot;&quot;</span>\nfullnameOverride: <span class=\"hljs-string\">&quot;&quot;</span>\n\nreplicaCount: 2\n\nimage:\n  repository: nginx\n  tag: <span class=\"hljs-string\">&quot;1.27&quot;</span>\n  pullPolicy: IfNotPresent\n\n<span class=\"hljs-comment\"># The registry login. Prefer to create it with kubectl (section 8) and only give the name here.</span>\nimagePullSecret:\n  name: <span class=\"hljs-string\">&quot;&quot;</span>                  <span class=\"hljs-comment\"># e.g. regsecret</span>\n  create: <span class=\"hljs-literal\">false</span>             <span class=\"hljs-comment\"># true = build it from the values below (see warning in section 8)</span>\n  registry: <span class=\"hljs-string\">&quot;&quot;</span>\n  username: <span class=\"hljs-string\">&quot;&quot;</span>\n  password: <span class=\"hljs-string\">&quot;&quot;</span>\n  email: <span class=\"hljs-string\">&quot;&quot;</span>\n\nserviceAccount:\n  create: <span class=\"hljs-literal\">true</span>\n  name: <span class=\"hljs-string\">&quot;&quot;</span>\n  automountToken: <span class=\"hljs-literal\">false</span>     <span class=\"hljs-comment\"># most apps never call the Kubernetes API</span>\n\npodAnnotations: {}\npodSecurityContext: {}\nsecurityContext: {}\n\n<span class=\"hljs-built_in\">env</span>:                        <span class=\"hljs-comment\"># plain environment variables</span>\n  APP_MODE: production\n\nconfig:                     <span class=\"hljs-comment\"># becomes a ConfigMap, loaded as environment variables</span>\n  LOG_LEVEL: info\n  FEATURE_X: <span class=\"hljs-string\">&quot;true&quot;</span>\n\nsecret:\n  existingSecret: <span class=\"hljs-string\">&quot;&quot;</span>        <span class=\"hljs-comment\"># name of a Secret you created yourself (recommended)</span>\n  create: <span class=\"hljs-literal\">false</span>             <span class=\"hljs-comment\"># true = the chart makes one from `data` below</span>\n  data: {}                  <span class=\"hljs-comment\"># DB_PASSWORD: &quot;&quot;</span>\n\nservice:\n  <span class=\"hljs-built_in\">type</span>: ClusterIP\n  port: 80\n  targetPort: 80\n\ningress:\n  enabled: <span class=\"hljs-literal\">false</span>\n  className: <span class=\"hljs-string\">&quot;&quot;</span>\n  annotations: {}\n  hosts:\n    - host: myapp.local\n      paths:\n        - /\n  tls: []\n\nresources:\n  requests:\n    cpu: 50m\n    memory: 64Mi\n  limits:\n    cpu: 200m\n    memory: 128Mi\n\nlivenessProbe:\n  httpGet:\n    path: /\n    port: http\n  initialDelaySeconds: 10\n  periodSeconds: 10\n\nreadinessProbe:\n  httpGet:\n    path: /\n    port: http\n  periodSeconds: 5\n\nautoscaling:\n  enabled: <span class=\"hljs-literal\">false</span>\n  minReplicas: 2\n  maxReplicas: 6\n  targetCPUUtilizationPercentage: 70\n\npdb:\n  enabled: <span class=\"hljs-literal\">true</span>\n  minAvailable: 1\n\nnetworkPolicy:\n  enabled: <span class=\"hljs-literal\">false</span>\n\npersistence:\n  enabled: <span class=\"hljs-literal\">false</span>\n  size: 1Gi\n  storageClass: <span class=\"hljs-string\">&quot;&quot;</span>\n  mountPath: /data\n\nmigration:\n  enabled: <span class=\"hljs-literal\">false</span>\n  <span class=\"hljs-built_in\">command</span>: [<span class=\"hljs-string\">&quot;sh&quot;</span>, <span class=\"hljs-string\">&quot;-c&quot;</span>, <span class=\"hljs-string\">&quot;echo migrating&quot;</span>]\n\ncronjob:\n  enabled: <span class=\"hljs-literal\">false</span>\n  schedule: <span class=\"hljs-string\">&quot;0 * * * *&quot;</span>\n  <span class=\"hljs-built_in\">command</span>: [<span class=\"hljs-string\">&quot;sh&quot;</span>, <span class=\"hljs-string\">&quot;-c&quot;</span>, <span class=\"hljs-string\">&quot;echo hourly&quot;</span>]\n\nnodeSelector: {}\ntolerations: []\naffinity: {}\nEOF</code></pre></figure>\n<p>The rule behind the layout: <strong>every behaviour a team might want to change is a value</strong>, and every optional\nobject has an <code>enabled</code> (or <code>create</code>) switch so it can be turned off without editing a template.</p>\n<h3 id=\"53-templateshelperstpl-names-and-labels-defined-once\"><a class=\"anchor\" href=\"#53-templateshelperstpl-names-and-labels-defined-once\" aria-label=\"Link to this section\">#</a>5.3 <code>templates/_helpers.tpl</code>: names and labels, defined once</h3>\n<p>A file starting with <code>_</code> renders nothing. It holds named snippets that the other templates call with\n<code>include</code>. Without it, every template would repeat the same naming and label logic.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/_helpers.tpl &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n{{- define <span class=\"hljs-string\">&quot;myapp.name&quot;</span> -}}\n{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix <span class=\"hljs-string\">&quot;-&quot;</span> -}}\n{{- end -}}\n\n{{- define <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> -}}\n{{- <span class=\"hljs-keyword\">if</span> .Values.fullnameOverride -}}\n{{- .Values.fullnameOverride | trunc 63 | trimSuffix <span class=\"hljs-string\">&quot;-&quot;</span> -}}\n{{- <span class=\"hljs-keyword\">else</span> -}}\n{{- <span class=\"hljs-variable\">$name</span> := default .Chart.Name .Values.nameOverride -}}\n{{- <span class=\"hljs-keyword\">if</span> contains <span class=\"hljs-variable\">$name</span> .Release.Name -}}\n{{- .Release.Name | trunc 63 | trimSuffix <span class=\"hljs-string\">&quot;-&quot;</span> -}}\n{{- <span class=\"hljs-keyword\">else</span> -}}\n{{- <span class=\"hljs-built_in\">printf</span> <span class=\"hljs-string\">&quot;%s-%s&quot;</span> .Release.Name <span class=\"hljs-variable\">$name</span> | trunc 63 | trimSuffix <span class=\"hljs-string\">&quot;-&quot;</span> -}}\n{{- end -}}\n{{- end -}}\n{{- end -}}\n\n{{- define <span class=\"hljs-string\">&quot;myapp.chart&quot;</span> -}}\n{{- <span class=\"hljs-built_in\">printf</span> <span class=\"hljs-string\">&quot;%s-%s&quot;</span> .Chart.Name .Chart.Version | replace <span class=\"hljs-string\">&quot;+&quot;</span> <span class=\"hljs-string\">&quot;_&quot;</span> | trunc 63 | trimSuffix <span class=\"hljs-string\">&quot;-&quot;</span> -}}\n{{- end -}}\n\n{{- define <span class=\"hljs-string\">&quot;myapp.selectorLabels&quot;</span> -}}\napp.kubernetes.io/name: {{ include <span class=\"hljs-string\">&quot;myapp.name&quot;</span> . }}\napp.kubernetes.io/instance: {{ .Release.Name }}\n{{- end -}}\n\n{{- define <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> -}}\nhelm.sh/chart: {{ include <span class=\"hljs-string\">&quot;myapp.chart&quot;</span> . }}\n{{ include <span class=\"hljs-string\">&quot;myapp.selectorLabels&quot;</span> . }}\napp.kubernetes.io/version: {{ .Chart.AppVersion | quote }}\napp.kubernetes.io/managed-by: {{ .Release.Service }}\n{{- end -}}\n\n{{- define <span class=\"hljs-string\">&quot;myapp.serviceAccountName&quot;</span> -}}\n{{- <span class=\"hljs-keyword\">if</span> .Values.serviceAccount.create -}}\n{{- default (include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> .) .Values.serviceAccount.name -}}\n{{- <span class=\"hljs-keyword\">else</span> -}}\n{{- default <span class=\"hljs-string\">&quot;default&quot;</span> .Values.serviceAccount.name -}}\n{{- end -}}\n{{- end -}}\n\n{{- define <span class=\"hljs-string\">&quot;myapp.secretName&quot;</span> -}}\n{{- default (include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> .) .Values.secret.existingSecret -}}\n{{- end -}}\nEOF</code></pre></figure>\n<p>What each snippet gives you:</p>\n<ul>\n<li><code>myapp.fullname</code> — the name used for every object: <code>&lt;release&gt;-&lt;chart&gt;</code> (cut to 63 characters, the Kubernetes\nlimit). Two releases of the same chart in one namespace never collide, because the release name differs.</li>\n<li><code>myapp.selectorLabels</code> — the <strong>two labels that identify this release&#39;s pods</strong>. The Deployment&#39;s selector and\nthe Service&#39;s selector both use exactly these. <strong>They must never change after the first install</strong>: a\nDeployment&#39;s selector cannot be edited.</li>\n<li><code>myapp.labels</code> — the selector labels plus the standard descriptive ones (<code>app.kubernetes.io/…</code>), put on every\nobject so <code>kubectl get all -l app.kubernetes.io/instance=&lt;release&gt;</code> finds the whole release.</li>\n<li><code>myapp.serviceAccountName</code> / <code>myapp.secretName</code> — &quot;the one this chart created, or the one the user named&quot;.</li>\n</ul>\n<h3 id=\"54-serviceaccountyaml-the-pods-identity\"><a class=\"anchor\" href=\"#54-serviceaccountyaml-the-pods-identity\" aria-label=\"Link to this section\">#</a>5.4 <code>serviceaccount.yaml</code>: the pod&#39;s identity</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2Fserviceaccount.yaml%20%3C%3C'EOF'%22%2C%22%7B%7B-%20if%20.Values.serviceAccount.create%20%7D%7D%22%2C%22apiVersion%3A%20v1%22%2C%22kind%3A%20ServiceAccount%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%7B%7B%20include%20%5C%22myapp.serviceAccountName%5C%22%20.%20%7D%7D%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22automountServiceAccountToken%3A%20%7B%7B%20.Values.serviceAccount.automountToken%20%7D%7D%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/serviceaccount.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n{{- <span class=\"hljs-keyword\">if</span> .Values.serviceAccount.create }}\napiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: {{ include <span class=\"hljs-string\">&quot;myapp.serviceAccountName&quot;</span> . }}\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\nautomountServiceAccountToken: {{ .Values.serviceAccount.automountToken }}\n{{- end }}\nEOF</code></pre></figure>\n<ul>\n<li>Pods use the namespace&#39;s shared <code>default</code> account unless told otherwise. A dedicated account per app means\nits permissions (if any) can be set per app. See <a href=\"/blog/users-and-permissions\">Users and permissions: who may do what, in which namespace</a>.</li>\n<li><code>automountServiceAccountToken: false</code> stops Kubernetes from putting an API token inside the pod. An app that\nnever calls the API should not have one.</li>\n<li>The file also shows the standard pattern: <code>{{- if … }}</code> wraps the whole object, so one value switches it\non or off.</li>\n<li>To give the app API permissions, add a <code>role.yaml</code> (a Role) and <code>rolebinding.yaml</code> for this account.</li>\n</ul>\n<h3 id=\"55-imagepullsecretyaml-the-registry-login-regsecret\"><a class=\"anchor\" href=\"#55-imagepullsecretyaml-the-registry-login-regsecret\" aria-label=\"Link to this section\">#</a>5.5 <code>imagepullsecret.yaml</code>: the registry login (<code>regsecret</code>)</h3>\n<p>Needed only when the image lives in a <strong>private registry</strong>. The public images (<code>nginx</code>, <code>redis</code>) and the local\nregistry from <a href=\"/blog/run-your-image\">Run your own image in the cluster</a> need none. A pod that cannot pull shows\n<code>ImagePullBackOff</code>, with <code>pull access denied</code> in <code>kubectl describe pod</code>.</p>\n<p><code>regsecret</code> is simply the conventional name for this Secret. Its type is <code>kubernetes.io/dockerconfigjson</code>, and\nit holds a Docker login.</p>\n<p><strong>The recommended way is to create it outside the chart</strong> (so the password never enters a release record):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create secret docker-registry regsecret --docker-server=registry.example.com --docker-username=&lt;user&gt; --docker-password=&lt;password&gt; --docker-email=&lt;email&gt; -n web</code></pre></figure>\n<p>Then the chart only needs the name: <code>--set imagePullSecret.name=regsecret</code>.</p>\n<p><strong>If the chart must create it</strong>, this template builds it from values:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2Fimagepullsecret.yaml%20%3C%3C'EOF'%22%2C%22%7B%7B-%20if%20.Values.imagePullSecret.create%20%7D%7D%22%2C%22apiVersion%3A%20v1%22%2C%22kind%3A%20Secret%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%7B%7B%20required%20%5C%22imagePullSecret.name%20is%20required%5C%22%20.Values.imagePullSecret.name%20%7D%7D%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22type%3A%20kubernetes.io%2Fdockerconfigjson%22%2C%22data%3A%22%2C%22%20%20.dockerconfigjson%3A%20%7B%7B%20include%20%5C%22myapp.dockerconfigjson%5C%22%20.%20%7C%20b64enc%20%7D%7D%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/imagepullsecret.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n{{- <span class=\"hljs-keyword\">if</span> .Values.imagePullSecret.create }}\napiVersion: v1\nkind: Secret\nmetadata:\n  name: {{ required <span class=\"hljs-string\">&quot;imagePullSecret.name is required&quot;</span> .Values.imagePullSecret.name }}\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\n<span class=\"hljs-built_in\">type</span>: kubernetes.io/dockerconfigjson\ndata:\n  .dockerconfigjson: {{ include <span class=\"hljs-string\">&quot;myapp.dockerconfigjson&quot;</span> . | b64enc }}\n{{- end }}\nEOF</code></pre></figure>\n<p>and a helper that builds the JSON. Add it to <code>_helpers.tpl</code>:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%3E%20myapp%2Ftemplates%2F_helpers.tpl%20%3C%3C'EOF'%22%2C%22%22%2C%22%7B%7B-%20define%20%5C%22myapp.dockerconfigjson%5C%22%20-%7D%7D%22%2C%22%7B%7B-%20%24auth%20%3A%3D%20printf%20%5C%22%25s%3A%25s%5C%22%20.Values.imagePullSecret.username%20.Values.imagePullSecret.password%20%7C%20b64enc%20-%7D%7D%22%2C%22%7B%7B-%20printf%20%5C%22%7B%5C%5C%5C%22auths%5C%5C%5C%22%3A%7B%5C%5C%5C%22%25s%5C%5C%5C%22%3A%7B%5C%5C%5C%22username%5C%5C%5C%22%3A%5C%5C%5C%22%25s%5C%5C%5C%22%2C%5C%5C%5C%22password%5C%5C%5C%22%3A%5C%5C%5C%22%25s%5C%5C%5C%22%2C%5C%5C%5C%22email%5C%5C%5C%22%3A%5C%5C%5C%22%25s%5C%5C%5C%22%2C%5C%5C%5C%22auth%5C%5C%5C%22%3A%5C%5C%5C%22%25s%5C%5C%5C%22%7D%7D%7D%5C%22%20.Values.imagePullSecret.registry%20.Values.imagePullSecret.username%20.Values.imagePullSecret.password%20.Values.imagePullSecret.email%20%24auth%20-%7D%7D%22%2C%22%7B%7B-%20end%20-%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt;&gt; myapp/templates/_helpers.tpl &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n\n{{- define <span class=\"hljs-string\">&quot;myapp.dockerconfigjson&quot;</span> -}}\n{{- <span class=\"hljs-variable\">$auth</span> := <span class=\"hljs-built_in\">printf</span> <span class=\"hljs-string\">&quot;%s:%s&quot;</span> .Values.imagePullSecret.username .Values.imagePullSecret.password | b64enc -}}\n{{- <span class=\"hljs-built_in\">printf</span> <span class=\"hljs-string\">&quot;{\\&quot;auths\\&quot;:{\\&quot;%s\\&quot;:{\\&quot;username\\&quot;:\\&quot;%s\\&quot;,\\&quot;password\\&quot;:\\&quot;%s\\&quot;,\\&quot;email\\&quot;:\\&quot;%s\\&quot;,\\&quot;auth\\&quot;:\\&quot;%s\\&quot;}}}&quot;</span> .Values.imagePullSecret.registry .Values.imagePullSecret.username .Values.imagePullSecret.password .Values.imagePullSecret.email <span class=\"hljs-variable\">$auth</span> -}}\n{{- end -}}\nEOF</code></pre></figure>\n<p>How the pod uses it: the Deployment (5.8) lists <code>imagePullSecrets: - name: regsecret</code>. Alternatively, attach it to\nthe ServiceAccount once, and every pod using that account gets it automatically.</p>\n<p>Careful: a password with a <code>&quot;</code> in it breaks the JSON above, and the password ends up in the release record\n(section 2.4). That is why <code>kubectl create secret docker-registry</code> is the better choice.</p>\n<h3 id=\"56-configmapyaml-settings\"><a class=\"anchor\" href=\"#56-configmapyaml-settings\" aria-label=\"Link to this section\">#</a>5.6 <code>configmap.yaml</code>: settings</h3>\n<p>For settings that are not secret: log level, feature flags, URLs, whole config files.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2Fconfigmap.yaml%20%3C%3C'EOF'%22%2C%22apiVersion%3A%20v1%22%2C%22kind%3A%20ConfigMap%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22data%3A%22%2C%22%7B%7B-%20range%20%24key%2C%20%24value%20%3A%3D%20.Values.config%20%7D%7D%22%2C%22%20%20%7B%7B%20%24key%20%7D%7D%3A%20%7B%7B%20%24value%20%7C%20quote%20%7D%7D%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22---%22%2C%22apiVersion%3A%20v1%22%2C%22kind%3A%20ConfigMap%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D-files%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22data%3A%22%2C%22%20%20app.conf%3A%20%7C%22%2C%22%7B%7B%20.Files.Get%20%5C%22files%2Fapp.conf%5C%22%20%7C%20indent%204%20%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/configmap.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\ndata:\n{{- range <span class=\"hljs-variable\">$key</span>, <span class=\"hljs-variable\">$value</span> := .Values.config }}\n  {{ <span class=\"hljs-variable\">$key</span> }}: {{ <span class=\"hljs-variable\">$value</span> | quote }}\n{{- end }}\n---\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}-files\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\ndata:\n  app.conf: |\n{{ .Files.Get <span class=\"hljs-string\">&quot;files/app.conf&quot;</span> | indent 4 }}\nEOF</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ffiles%2Fapp.conf%20%3C%3C'EOF'%22%2C%22greeting%20%3D%20hello%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/files/app.conf &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n<span class=\"hljs-comment\"># example config file, shipped inside the chart</span>\ngreeting = hello\nEOF</code></pre></figure>\n<p>Two ConfigMaps, for two ways to deliver settings:</p>\n<ul>\n<li><strong>As environment variables.</strong> The first one holds key/value pairs from <code>values.yaml</code>; the Deployment loads\nthem all with <code>envFrom</code>. Quote every value (<code>| quote</code>): environment variables are strings, and a bare\n<code>true</code> or <code>8080</code> would be rendered as a boolean or number and rejected.</li>\n<li><strong>As files.</strong> The second holds a whole file read from the chart (<code>.Files.Get</code>), which the Deployment mounts\nas a file. Keep it separate from the first: a key like <code>app.conf</code> is not a valid environment variable name.</li>\n</ul>\n<p><strong>A ConfigMap change does not restart pods by itself.</strong> The Deployment (5.8) carries a checksum of the\nConfigMap in an annotation, so a changed ConfigMap changes the pod template, which makes Kubernetes roll the\npods.</p>\n<h3 id=\"57-secretyaml-credentials\"><a class=\"anchor\" href=\"#57-secretyaml-credentials\" aria-label=\"Link to this section\">#</a>5.7 <code>secret.yaml</code>: credentials</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2Fsecret.yaml%20%3C%3C'EOF'%22%2C%22%7B%7B-%20if%20and%20.Values.secret.create%20(not%20.Values.secret.existingSecret)%20%7D%7D%22%2C%22apiVersion%3A%20v1%22%2C%22kind%3A%20Secret%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22type%3A%20Opaque%22%2C%22stringData%3A%22%2C%22%7B%7B-%20range%20%24key%2C%20%24value%20%3A%3D%20.Values.secret.data%20%7D%7D%22%2C%22%20%20%7B%7B%20%24key%20%7D%7D%3A%20%7B%7B%20%24value%20%7C%20quote%20%7D%7D%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/secret.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n{{- <span class=\"hljs-keyword\">if</span> and .Values.secret.create (not .Values.secret.existingSecret) }}\napiVersion: v1\nkind: Secret\nmetadata:\n  name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\n<span class=\"hljs-built_in\">type</span>: Opaque\nstringData:\n{{- range <span class=\"hljs-variable\">$key</span>, <span class=\"hljs-variable\">$value</span> := .Values.secret.data }}\n  {{ <span class=\"hljs-variable\">$key</span> }}: {{ <span class=\"hljs-variable\">$value</span> | quote }}\n{{- end }}\n{{- end }}\nEOF</code></pre></figure>\n<ul>\n<li><code>stringData</code> takes plain text and lets the API server store it encoded. (Under <code>data</code> you would have to\nbase64-encode each value yourself.)</li>\n<li>The chart only creates the Secret when <code>secret.create</code> is true <strong>and</strong> no <code>existingSecret</code> is named. The\nrecommended pattern is the opposite: create the Secret yourself (section 8) and set\n<code>secret.existingSecret=&lt;name&gt;</code>, so the credentials never pass through Helm.</li>\n<li><strong>A base64 Secret is not encrypted</strong>, only encoded. Protect it with permissions\n(<a href=\"/blog/users-and-permissions\">Users and permissions: who may do what, in which namespace</a>) and, on a real cluster, encryption at\nrest.</li>\n<li>Do not generate random passwords in the template (<code>randAlphaNum</code>): every upgrade would generate a new one and\nHelm 2 has no <code>lookup</code> to read the old one.</li>\n</ul>\n<h3 id=\"58-deploymentyaml-the-application\"><a class=\"anchor\" href=\"#58-deploymentyaml-the-application\" aria-label=\"Link to this section\">#</a>5.8 <code>deployment.yaml</code>: the application</h3>\n<p>The most important file. It keeps N copies of your container running and replaces them safely on change.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/deployment.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\nspec:\n{{- <span class=\"hljs-keyword\">if</span> not .Values.autoscaling.enabled }}\n  replicas: {{ .Values.replicaCount }}\n{{- end }}\n  selector:\n    matchLabels:\n{{ include <span class=\"hljs-string\">&quot;myapp.selectorLabels&quot;</span> . | indent 6 }}\n  strategy:\n    <span class=\"hljs-built_in\">type</span>: RollingUpdate\n    rollingUpdate:\n      maxUnavailable: 0\n      maxSurge: 1\n  template:\n    metadata:\n      annotations:\n        checksum/config: {{ include (<span class=\"hljs-built_in\">print</span> $.Template.BasePath <span class=\"hljs-string\">&quot;/configmap.yaml&quot;</span>) . | <span class=\"hljs-built_in\">sha256sum</span> }}\n        checksum/secret: {{ include (<span class=\"hljs-built_in\">print</span> $.Template.BasePath <span class=\"hljs-string\">&quot;/secret.yaml&quot;</span>) . | <span class=\"hljs-built_in\">sha256sum</span> }}\n      {{- with .Values.podAnnotations }}\n{{ toYaml . | indent 8 }}\n      {{- end }}\n      labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.selectorLabels&quot;</span> . | indent 8 }}\n    spec:\n      serviceAccountName: {{ include <span class=\"hljs-string\">&quot;myapp.serviceAccountName&quot;</span> . }}\n      {{- <span class=\"hljs-keyword\">if</span> .Values.imagePullSecret.name }}\n      imagePullSecrets:\n        - name: {{ .Values.imagePullSecret.name }}\n      {{- end }}\n      {{- with .Values.podSecurityContext }}\n      securityContext:\n{{ toYaml . | indent 8 }}\n      {{- end }}\n      terminationGracePeriodSeconds: 30\n      containers:\n        - name: {{ .Chart.Name }}\n          image: <span class=\"hljs-string\">&quot;{{ .Values.image.repository }}:{{ required &quot;</span>image.tag is required<span class=\"hljs-string\">&quot; .Values.image.tag }}&quot;</span>\n          imagePullPolicy: {{ .Values.image.pullPolicy }}\n          {{- with .Values.securityContext }}\n          securityContext:\n{{ toYaml . | indent 12 }}\n          {{- end }}\n          ports:\n            - name: http\n              containerPort: {{ .Values.service.targetPort }}\n              protocol: TCP\n          <span class=\"hljs-built_in\">env</span>:\n            - name: POD_NAME\n              valueFrom:\n                fieldRef:\n                  fieldPath: metadata.name\n          {{- range <span class=\"hljs-variable\">$key</span>, <span class=\"hljs-variable\">$value</span> := .Values.<span class=\"hljs-built_in\">env</span> }}\n            - name: {{ <span class=\"hljs-variable\">$key</span> }}\n              value: {{ <span class=\"hljs-variable\">$value</span> | quote }}\n          {{- end }}\n          envFrom:\n            - configMapRef:\n                name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}\n            - secretRef:\n                name: {{ include <span class=\"hljs-string\">&quot;myapp.secretName&quot;</span> . }}\n                optional: <span class=\"hljs-literal\">true</span>\n          livenessProbe:\n{{ toYaml .Values.livenessProbe | indent 12 }}\n          readinessProbe:\n{{ toYaml .Values.readinessProbe | indent 12 }}\n          resources:\n{{ toYaml .Values.resources | indent 12 }}\n          volumeMounts:\n            - name: files\n              mountPath: /etc/myapp\n              readOnly: <span class=\"hljs-literal\">true</span>\n          {{- <span class=\"hljs-keyword\">if</span> .Values.persistence.enabled }}\n            - name: data\n              mountPath: {{ .Values.persistence.mountPath }}\n          {{- end }}\n      volumes:\n        - name: files\n          configMap:\n            name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}-files\n      {{- <span class=\"hljs-keyword\">if</span> .Values.persistence.enabled }}\n        - name: data\n          persistentVolumeClaim:\n            claimName: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}\n      {{- end }}\n      {{- with .Values.nodeSelector }}\n      nodeSelector:\n{{ toYaml . | indent 8 }}\n      {{- end }}\n      {{- with .Values.affinity }}\n      affinity:\n{{ toYaml . | indent 8 }}\n      {{- end }}\n      {{- with .Values.tolerations }}\n      tolerations:\n{{ toYaml . | indent 8 }}\n      {{- end }}\nEOF</code></pre></figure>\n<p>What each part does:</p>\n<ul>\n<li><strong><code>apiVersion: apps/v1</code></strong> — the current API for Deployments. Older charts say <code>extensions/v1beta1</code> or\n<code>apps/v1beta1</code>, which modern Kubernetes removed. <code>apps/v1</code> also <strong>requires <code>selector</code></strong>.</li>\n<li><strong><code>replicas</code></strong> is left out when the autoscaler is on. If both set it, every upgrade would reset the count\nthe autoscaler chose.</li>\n<li><strong><code>selector.matchLabels</code></strong> — how the Deployment recognises its pods. It must match the pod template&#39;s labels\nand, once created, cannot be changed.</li>\n<li><strong><code>strategy</code></strong> — <code>maxUnavailable: 0, maxSurge: 1</code> means &quot;start one new pod, wait until it is ready, then stop\none old pod&quot;: an update never drops below the full count.</li>\n<li><strong><code>checksum/config</code>, <code>checksum/secret</code></strong> — hashes of those two files inside the pod template. Change a\nConfigMap or Secret value and the hash changes, the pod template changes, and Kubernetes rolls the pods so\nthey pick up the new settings.</li>\n<li><strong><code>imagePullSecrets</code></strong> — the registry login from 5.5, only when a name is set.</li>\n<li><strong><code>podSecurityContext</code> / <code>securityContext</code></strong> — run as non-root, drop privileges, read-only filesystem. Empty\nby default because it depends on the image; for an app you control, set <code>runAsNonRoot: true</code>,\n<code>allowPrivilegeEscalation: false</code>, <code>readOnlyRootFilesystem: true</code> and drop all capabilities.</li>\n<li><strong><code>image</code></strong> — <code>repository:tag</code>. <code>required</code> makes the install fail with a clear message if no tag was given.\nUse a specific tag (<code>1.27</code>, a commit hash), never <code>latest</code>.</li>\n<li><strong><code>env</code></strong> — the <code>POD_NAME</code> entry shows <code>valueFrom: fieldRef</code>, a value Kubernetes fills in (pod name, namespace,\nnode name); the loop adds plain entries from <code>values.env</code>. To take a single key from a Secret, use\n<code>valueFrom: secretKeyRef: {name: …, key: …}</code>.</li>\n<li><strong><code>envFrom</code></strong> — loads <strong>every</strong> key of the ConfigMap and the Secret as environment variables. <code>optional: true</code>\nlets the pod start when the Secret does not exist yet.</li>\n<li><strong><code>livenessProbe</code></strong> — &quot;is it stuck?&quot; On failure, Kubernetes <strong>restarts</strong> the container.</li>\n<li><strong><code>readinessProbe</code></strong> — &quot;can it take traffic?&quot; On failure, the pod is <strong>taken out of the Service</strong>, not\nrestarted. This is what makes rolling updates safe. (A <code>startupProbe</code>, for slow-starting apps, holds off the\nother two until the first start succeeds.)</li>\n<li><strong><code>resources</code></strong> — <code>requests</code> is what the scheduler reserves for the pod; <code>limits</code> is the ceiling. Without\nrequests, autoscaling by CPU does not work. A pod over its memory limit is killed; over its CPU limit it is\nslowed down.</li>\n<li><strong><code>volumeMounts</code> / <code>volumes</code></strong> — the files ConfigMap mounted as a read-only folder, and optionally the\npersistent volume from 5.13.</li>\n<li><strong><code>nodeSelector</code>, <code>affinity</code>, <code>tolerations</code></strong> — placement, as in\n<a href=\"/blog/deploy-apps\">Deploy apps into your namespaces, one at a time</a> and <a href=\"/blog/concepts\">Concepts: what each piece is</a>. Spread the replicas over nodes with a\npod anti-affinity rule, passed as a value:</li>\n</ul>\n<figure class=\"code\" data-lang=\"yaml\"><figcaption><span class=\"lang\">yaml</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-attr\">affinity:</span>\n  <span class=\"hljs-attr\">podAntiAffinity:</span>\n    <span class=\"hljs-attr\">preferredDuringSchedulingIgnoredDuringExecution:</span>\n      <span class=\"hljs-bullet\">-</span> <span class=\"hljs-attr\">weight:</span> <span class=\"hljs-number\">100</span>\n        <span class=\"hljs-attr\">podAffinityTerm:</span>\n          <span class=\"hljs-attr\">topologyKey:</span> <span class=\"hljs-string\">kubernetes.io/hostname</span>\n          <span class=\"hljs-attr\">labelSelector:</span>\n            <span class=\"hljs-attr\">matchLabels:</span>\n              <span class=\"hljs-attr\">app.kubernetes.io/name:</span> <span class=\"hljs-string\">myapp</span></code></pre></figure>\n<ul>\n<li><strong><code>terminationGracePeriodSeconds</code></strong> — how long a pod gets to finish in-flight requests after it is told to\nstop. Raise it for slow shutdowns.</li>\n</ul>\n<p><strong>Namespaces:</strong> none of these files sets <code>metadata.namespace</code>. The namespace comes from\n<code>helm install --namespace web</code>, so the same chart installs anywhere.</p>\n<h3 id=\"59-serviceyaml-a-stable-name-for-the-pods\"><a class=\"anchor\" href=\"#59-serviceyaml-a-stable-name-for-the-pods\" aria-label=\"Link to this section\">#</a>5.9 <code>service.yaml</code>: a stable name for the pods</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2Fservice.yaml%20%3C%3C'EOF'%22%2C%22apiVersion%3A%20v1%22%2C%22kind%3A%20Service%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22spec%3A%22%2C%22%20%20type%3A%20%7B%7B%20.Values.service.type%20%7D%7D%22%2C%22%20%20ports%3A%22%2C%22%20%20%20%20-%20name%3A%20http%22%2C%22%20%20%20%20%20%20port%3A%20%7B%7B%20.Values.service.port%20%7D%7D%22%2C%22%20%20%20%20%20%20targetPort%3A%20http%22%2C%22%20%20%20%20%20%20protocol%3A%20TCP%22%2C%22%20%20selector%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.selectorLabels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/service.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\napiVersion: v1\nkind: Service\nmetadata:\n  name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\nspec:\n  <span class=\"hljs-built_in\">type</span>: {{ .Values.service.type }}\n  ports:\n    - name: http\n      port: {{ .Values.service.port }}\n      targetPort: http\n      protocol: TCP\n  selector:\n{{ include <span class=\"hljs-string\">&quot;myapp.selectorLabels&quot;</span> . | indent 4 }}\nEOF</code></pre></figure>\n<ul>\n<li><code>selector</code> — the <strong>same</strong> selector labels as the Deployment. This is how the Service finds the pods.</li>\n<li><code>port</code> — the Service&#39;s port. <code>targetPort: http</code> — the container port <strong>by name</strong> (<code>http</code> from the\nDeployment), so the number lives in one place.</li>\n<li><code>type</code> — <code>ClusterIP</code> (inside the cluster only), <code>NodePort</code> (a fixed port on every node), <code>LoadBalancer</code>\n(an external address from the cloud or from k3d&#39;s load balancer).</li>\n<li>Other pods reach it as <code>&lt;release&gt;-myapp</code> (same namespace) or <code>&lt;release&gt;-myapp.&lt;namespace&gt;</code>.</li>\n</ul>\n<h3 id=\"510-ingressyaml-http-routing-from-outside\"><a class=\"anchor\" href=\"#510-ingressyaml-http-routing-from-outside\" aria-label=\"Link to this section\">#</a>5.10 <code>ingress.yaml</code>: HTTP routing from outside</h3>\n<p>Needs an ingress controller in the cluster (k3d bundles Traefik; on kind install one).</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/ingress.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n{{- <span class=\"hljs-keyword\">if</span> .Values.ingress.enabled }}\n{{- <span class=\"hljs-variable\">$fullName</span> := include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . -}}\n{{- <span class=\"hljs-variable\">$svcPort</span> := .Values.service.port -}}\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: {{ <span class=\"hljs-variable\">$fullName</span> }}\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\n  {{- with .Values.ingress.annotations }}\n  annotations:\n{{ toYaml . | indent 4 }}\n  {{- end }}\nspec:\n  {{- <span class=\"hljs-keyword\">if</span> .Values.ingress.className }}\n  ingressClassName: {{ .Values.ingress.className }}\n  {{- end }}\n  {{- <span class=\"hljs-keyword\">if</span> .Values.ingress.tls }}\n  tls:\n  {{- range .Values.ingress.tls }}\n    - hosts:\n      {{- range .hosts }}\n        - {{ . | quote }}\n      {{- end }}\n      secretName: {{ .secretName }}\n  {{- end }}\n  {{- end }}\n  rules:\n  {{- range .Values.ingress.hosts }}\n    - host: {{ .host | quote }}\n      http:\n        paths:\n        {{- range .paths }}\n          - path: {{ . }}\n            pathType: Prefix\n            backend:\n              service:\n                name: {{ <span class=\"hljs-variable\">$fullName</span> }}\n                port:\n                  number: {{ <span class=\"hljs-variable\">$svcPort</span> }}\n        {{- end }}\n  {{- end }}\n{{- end }}\nEOF</code></pre></figure>\n<ul>\n<li><code>networking.k8s.io/v1</code> is the current API (Kubernetes 1.19 and later). The older <code>extensions/v1beta1</code> and\n<code>networking.k8s.io/v1beta1</code> Ingresses are removed from current clusters. To support old and new clusters,\nbranch on <code>.Capabilities.APIVersions.Has &quot;networking.k8s.io/v1&quot;</code>.</li>\n<li><code>$fullName</code> and <code>$svcPort</code> are saved at the top because <code>.</code> changes meaning inside the <code>range</code> loops.</li>\n<li><code>tls</code> names a Secret holding the certificate (type <code>kubernetes.io/tls</code>), created by hand or by cert-manager.</li>\n<li><code>annotations</code> carry controller-specific settings, for example <code>nginx.ingress.kubernetes.io/proxy-body-size</code>.</li>\n</ul>\n<h3 id=\"511-hpayaml-autoscaling-the-pods\"><a class=\"anchor\" href=\"#511-hpayaml-autoscaling-the-pods\" aria-label=\"Link to this section\">#</a>5.11 <code>hpa.yaml</code>: autoscaling the pods</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2Fhpa.yaml%20%3C%3C'EOF'%22%2C%22%7B%7B-%20if%20.Values.autoscaling.enabled%20%7D%7D%22%2C%22apiVersion%3A%20autoscaling%2Fv2%22%2C%22kind%3A%20HorizontalPodAutoscaler%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22spec%3A%22%2C%22%20%20scaleTargetRef%3A%22%2C%22%20%20%20%20apiVersion%3A%20apps%2Fv1%22%2C%22%20%20%20%20kind%3A%20Deployment%22%2C%22%20%20%20%20name%3A%20%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D%22%2C%22%20%20minReplicas%3A%20%7B%7B%20.Values.autoscaling.minReplicas%20%7D%7D%22%2C%22%20%20maxReplicas%3A%20%7B%7B%20.Values.autoscaling.maxReplicas%20%7D%7D%22%2C%22%20%20metrics%3A%22%2C%22%20%20%20%20-%20type%3A%20Resource%22%2C%22%20%20%20%20%20%20resource%3A%22%2C%22%20%20%20%20%20%20%20%20name%3A%20cpu%22%2C%22%20%20%20%20%20%20%20%20target%3A%22%2C%22%20%20%20%20%20%20%20%20%20%20type%3A%20Utilization%22%2C%22%20%20%20%20%20%20%20%20%20%20averageUtilization%3A%20%7B%7B%20.Values.autoscaling.targetCPUUtilizationPercentage%20%7D%7D%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/hpa.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n{{- <span class=\"hljs-keyword\">if</span> .Values.autoscaling.enabled }}\napiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}\n  minReplicas: {{ .Values.autoscaling.minReplicas }}\n  maxReplicas: {{ .Values.autoscaling.maxReplicas }}\n  metrics:\n    - <span class=\"hljs-built_in\">type</span>: Resource\n      resource:\n        name: cpu\n        target:\n          <span class=\"hljs-built_in\">type</span>: Utilization\n          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}\n{{- end }}\nEOF</code></pre></figure>\n<ul>\n<li>Adds pods when average CPU use passes the target (a percentage <strong>of the pod&#39;s CPU request</strong>, so requests are\nrequired), and removes them when it falls.</li>\n<li>Needs metrics-server (bundled with k3s; install it on kind).</li>\n<li><code>autoscaling/v2</code> needs Kubernetes 1.23 or later; on older clusters use <code>autoscaling/v2beta2</code>.</li>\n<li>This is <strong>pod</strong> autoscaling. Adding nodes is a different system.</li>\n</ul>\n<h3 id=\"512-pdbyaml-stay-available-during-maintenance\"><a class=\"anchor\" href=\"#512-pdbyaml-stay-available-during-maintenance\" aria-label=\"Link to this section\">#</a>5.12 <code>pdb.yaml</code>: stay available during maintenance</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2Fpdb.yaml%20%3C%3C'EOF'%22%2C%22%7B%7B-%20if%20.Values.pdb.enabled%20%7D%7D%22%2C%22apiVersion%3A%20policy%2Fv1%22%2C%22kind%3A%20PodDisruptionBudget%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22spec%3A%22%2C%22%20%20minAvailable%3A%20%7B%7B%20.Values.pdb.minAvailable%20%7D%7D%22%2C%22%20%20selector%3A%22%2C%22%20%20%20%20matchLabels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.selectorLabels%5C%22%20.%20%7C%20indent%206%20%7D%7D%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/pdb.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n{{- <span class=\"hljs-keyword\">if</span> .Values.pdb.enabled }}\napiVersion: policy/v1\nkind: PodDisruptionBudget\nmetadata:\n  name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\nspec:\n  minAvailable: {{ .Values.pdb.minAvailable }}\n  selector:\n    matchLabels:\n{{ include <span class=\"hljs-string\">&quot;myapp.selectorLabels&quot;</span> . | indent 6 }}\n{{- end }}\nEOF</code></pre></figure>\n<p>When someone drains a node (<code>kubectl drain</code>, an upgrade), Kubernetes evicts its pods. A PodDisruptionBudget\nsays &quot;never take me below this many pods&quot;: a drain waits instead of evicting the last healthy copy. It only\nhelps with more than one replica; with <code>minAvailable: 1</code> and one replica, a drain would block forever. Needs\nKubernetes 1.21 or later for <code>policy/v1</code>.</p>\n<h3 id=\"513-pvcyaml-storage-that-outlives-the-pod\"><a class=\"anchor\" href=\"#513-pvcyaml-storage-that-outlives-the-pod\" aria-label=\"Link to this section\">#</a>5.13 <code>pvc.yaml</code>: storage that outlives the pod</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2Fpvc.yaml%20%3C%3C'EOF'%22%2C%22%7B%7B-%20if%20.Values.persistence.enabled%20%7D%7D%22%2C%22apiVersion%3A%20v1%22%2C%22kind%3A%20PersistentVolumeClaim%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22spec%3A%22%2C%22%20%20accessModes%3A%22%2C%22%20%20%20%20-%20ReadWriteOnce%22%2C%22%20%20%7B%7B-%20if%20.Values.persistence.storageClass%20%7D%7D%22%2C%22%20%20storageClassName%3A%20%7B%7B%20.Values.persistence.storageClass%20%7D%7D%22%2C%22%20%20%7B%7B-%20end%20%7D%7D%22%2C%22%20%20resources%3A%22%2C%22%20%20%20%20requests%3A%22%2C%22%20%20%20%20%20%20storage%3A%20%7B%7B%20.Values.persistence.size%20%7D%7D%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/pvc.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n{{- <span class=\"hljs-keyword\">if</span> .Values.persistence.enabled }}\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\nspec:\n  accessModes:\n    - ReadWriteOnce\n  {{- <span class=\"hljs-keyword\">if</span> .Values.persistence.storageClass }}\n  storageClassName: {{ .Values.persistence.storageClass }}\n  {{- end }}\n  resources:\n    requests:\n      storage: {{ .Values.persistence.size }}\n{{- end }}\nEOF</code></pre></figure>\n<p>A claim asks the cluster for a disk. <code>ReadWriteOnce</code> means one node at a time. In a lab, the default storage\nclass (bundled in k3s and kind) hands out a local directory. With several replicas and <code>ReadWriteOnce</code>, use a\nStatefulSet with <code>volumeClaimTemplates</code> instead, so each pod gets its own disk (see the end of this section).</p>\n<h3 id=\"514-networkpolicyyaml-who-may-talk-to-the-pods\"><a class=\"anchor\" href=\"#514-networkpolicyyaml-who-may-talk-to-the-pods\" aria-label=\"Link to this section\">#</a>5.14 <code>networkpolicy.yaml</code>: who may talk to the pods</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2Fnetworkpolicy.yaml%20%3C%3C'EOF'%22%2C%22%7B%7B-%20if%20.Values.networkPolicy.enabled%20%7D%7D%22%2C%22apiVersion%3A%20networking.k8s.io%2Fv1%22%2C%22kind%3A%20NetworkPolicy%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22spec%3A%22%2C%22%20%20podSelector%3A%22%2C%22%20%20%20%20matchLabels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.selectorLabels%5C%22%20.%20%7C%20indent%206%20%7D%7D%22%2C%22%20%20policyTypes%3A%22%2C%22%20%20%20%20-%20Ingress%22%2C%22%20%20ingress%3A%22%2C%22%20%20%20%20-%20from%3A%22%2C%22%20%20%20%20%20%20%20%20-%20podSelector%3A%20%7B%7D%22%2C%22%20%20%20%20%20%20ports%3A%22%2C%22%20%20%20%20%20%20%20%20-%20port%3A%20%7B%7B%20.Values.service.targetPort%20%7D%7D%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/networkpolicy.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n{{- <span class=\"hljs-keyword\">if</span> .Values.networkPolicy.enabled }}\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\nspec:\n  podSelector:\n    matchLabels:\n{{ include <span class=\"hljs-string\">&quot;myapp.selectorLabels&quot;</span> . | indent 6 }}\n  policyTypes:\n    - Ingress\n  ingress:\n    - from:\n        - podSelector: {}\n      ports:\n        - port: {{ .Values.service.targetPort }}\n{{- end }}\nEOF</code></pre></figure>\n<p>By default every pod can reach every other pod. This allows traffic to the app&#39;s port only from other pods in\nthe <strong>same namespace</strong> and drops the rest. Add another <code>from</code> entry (<code>namespaceSelector</code>) for an ingress\ncontroller in a different namespace. It does nothing unless the cluster&#39;s network plugin enforces policies (see\n<a href=\"/blog/users-and-permissions\">Users and permissions: who may do what, in which namespace</a>).</p>\n<h3 id=\"515-job-migrateyaml-a-hook-that-runs-before-each-install-or-upgrade\"><a class=\"anchor\" href=\"#515-job-migrateyaml-a-hook-that-runs-before-each-install-or-upgrade\" aria-label=\"Link to this section\">#</a>5.15 <code>job-migrate.yaml</code>: a hook that runs before each install or upgrade</h3>\n<p>A <strong>hook</strong> is an object Helm runs at a point in the release&#39;s life, instead of installing it with the rest.\nThe classic use is a database migration.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2Fjob-migrate.yaml%20%3C%3C'EOF'%22%2C%22%7B%7B-%20if%20.Values.migration.enabled%20%7D%7D%22%2C%22apiVersion%3A%20batch%2Fv1%22%2C%22kind%3A%20Job%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D-migrate-%7B%7B%20.Release.Revision%20%7D%7D%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22%20%20annotations%3A%22%2C%22%20%20%20%20%5C%22helm.sh%2Fhook%5C%22%3A%20pre-install%2Cpre-upgrade%22%2C%22%20%20%20%20%5C%22helm.sh%2Fhook-weight%5C%22%3A%20%5C%22-5%5C%22%22%2C%22%20%20%20%20%5C%22helm.sh%2Fhook-delete-policy%5C%22%3A%20hook-succeeded%2Cbefore-hook-creation%22%2C%22spec%3A%22%2C%22%20%20backoffLimit%3A%201%22%2C%22%20%20template%3A%22%2C%22%20%20%20%20spec%3A%22%2C%22%20%20%20%20%20%20restartPolicy%3A%20Never%22%2C%22%20%20%20%20%20%20containers%3A%22%2C%22%20%20%20%20%20%20%20%20-%20name%3A%20migrate%22%2C%22%20%20%20%20%20%20%20%20%20%20image%3A%20%5C%22%7B%7B%20.Values.image.repository%20%7D%7D%3A%7B%7B%20.Values.image.tag%20%7D%7D%5C%22%22%2C%22%20%20%20%20%20%20%20%20%20%20command%3A%22%2C%22%7B%7B%20toYaml%20.Values.migration.command%20%7C%20indent%2012%20%7D%7D%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/job-migrate.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n{{- <span class=\"hljs-keyword\">if</span> .Values.migration.enabled }}\napiVersion: batch/v1\nkind: Job\nmetadata:\n  name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}-migrate-{{ .Release.Revision }}\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\n  annotations:\n    <span class=\"hljs-string\">&quot;helm.sh/hook&quot;</span>: pre-install,pre-upgrade\n    <span class=\"hljs-string\">&quot;helm.sh/hook-weight&quot;</span>: <span class=\"hljs-string\">&quot;-5&quot;</span>\n    <span class=\"hljs-string\">&quot;helm.sh/hook-delete-policy&quot;</span>: hook-succeeded,before-hook-creation\nspec:\n  backoffLimit: 1\n  template:\n    spec:\n      restartPolicy: Never\n      containers:\n        - name: migrate\n          image: <span class=\"hljs-string\">&quot;{{ .Values.image.repository }}:{{ .Values.image.tag }}&quot;</span>\n          <span class=\"hljs-built_in\">command</span>:\n{{ toYaml .Values.migration.command | indent 12 }}\n{{- end }}\nEOF</code></pre></figure>\n<ul>\n<li><code>helm.sh/hook: pre-install,pre-upgrade</code> — run it <strong>before</strong> the rest is created or changed. Others:\n<code>post-install</code>, <code>post-upgrade</code>, <code>pre-delete</code>, <code>post-delete</code>, <code>pre-rollback</code>, <code>post-rollback</code>, <code>test-success</code>.</li>\n<li><code>hook-weight</code> — the order among several hooks (lowest first).</li>\n<li><code>hook-delete-policy</code> — <code>hook-succeeded</code> removes the Job when it finishes OK; <code>before-hook-creation</code> removes\nan old copy first so a repeat run does not collide.</li>\n<li>Helm waits for the hook Job to finish. If it fails, the install or upgrade fails and nothing else is changed.</li>\n<li><strong>A pre-install hook runs before the chart&#39;s ConfigMap and Secret exist.</strong> If the job needs them, create them\nfirst (section 8), or mark those objects as hooks with a lower weight.</li>\n</ul>\n<h3 id=\"516-cronjobyaml-a-scheduled-task\"><a class=\"anchor\" href=\"#516-cronjobyaml-a-scheduled-task\" aria-label=\"Link to this section\">#</a>5.16 <code>cronjob.yaml</code>: a scheduled task</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2Fcronjob.yaml%20%3C%3C'EOF'%22%2C%22%7B%7B-%20if%20.Values.cronjob.enabled%20%7D%7D%22%2C%22apiVersion%3A%20batch%2Fv1%22%2C%22kind%3A%20CronJob%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D-cron%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22spec%3A%22%2C%22%20%20schedule%3A%20%7B%7B%20.Values.cronjob.schedule%20%7C%20quote%20%7D%7D%22%2C%22%20%20concurrencyPolicy%3A%20Forbid%22%2C%22%20%20successfulJobsHistoryLimit%3A%201%22%2C%22%20%20failedJobsHistoryLimit%3A%203%22%2C%22%20%20jobTemplate%3A%22%2C%22%20%20%20%20spec%3A%22%2C%22%20%20%20%20%20%20template%3A%22%2C%22%20%20%20%20%20%20%20%20spec%3A%22%2C%22%20%20%20%20%20%20%20%20%20%20restartPolicy%3A%20OnFailure%22%2C%22%20%20%20%20%20%20%20%20%20%20containers%3A%22%2C%22%20%20%20%20%20%20%20%20%20%20%20%20-%20name%3A%20cron%22%2C%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20image%3A%20%5C%22%7B%7B%20.Values.image.repository%20%7D%7D%3A%7B%7B%20.Values.image.tag%20%7D%7D%5C%22%22%2C%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20command%3A%22%2C%22%7B%7B%20toYaml%20.Values.cronjob.command%20%7C%20indent%2016%20%7D%7D%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/cronjob.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n{{- <span class=\"hljs-keyword\">if</span> .Values.cronjob.enabled }}\napiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: {{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }}-cron\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\nspec:\n  schedule: {{ .Values.cronjob.schedule | quote }}\n  concurrencyPolicy: Forbid\n  successfulJobsHistoryLimit: 1\n  failedJobsHistoryLimit: 3\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          restartPolicy: OnFailure\n          containers:\n            - name: cron\n              image: <span class=\"hljs-string\">&quot;{{ .Values.image.repository }}:{{ .Values.image.tag }}&quot;</span>\n              <span class=\"hljs-built_in\">command</span>:\n{{ toYaml .Values.cronjob.command | indent 16 }}\n{{- end }}\nEOF</code></pre></figure>\n<p>Runs a container on a schedule (cron syntax). <code>concurrencyPolicy: Forbid</code> skips a run if the previous one is\nstill going. <code>batch/v1</code> needs Kubernetes 1.21 or later.</p>\n<h3 id=\"517-notestxt-what-to-tell-the-user-after-install\"><a class=\"anchor\" href=\"#517-notestxt-what-to-tell-the-user-after-install\" aria-label=\"Link to this section\">#</a>5.17 <code>NOTES.txt</code>: what to tell the user after install</h3>\n<p>Printed by <code>helm install</code> and <code>helm status</code>. Not a Kubernetes object.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2FNOTES.txt%20%3C%3C'EOF'%22%2C%22%7B%7B%20.Chart.Name%20%7D%7D%20%7B%7B%20.Chart.AppVersion%20%7D%7D%20is%20installed%20as%20release%20%5C%22%7B%7B%20.Release.Name%20%7D%7D%5C%22%20in%20namespace%20%5C%22%7B%7B%20.Release.Namespace%20%7D%7D%5C%22.%22%2C%22%22%2C%22%7B%7B-%20if%20.Values.ingress.enabled%20%7D%7D%22%2C%22Open%3A%22%2C%22%7B%7B-%20range%20.Values.ingress.hosts%20%7D%7D%22%2C%22%20%20http%3A%2F%2F%7B%7B%20.host%20%7D%7D%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22%7B%7B-%20else%20%7D%7D%22%2C%22Reach%20it%20from%20your%20local%20machine%3A%22%2C%22%20%20kubectl%20port-forward%20svc%2F%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D%208080%3A%7B%7B%20.Values.service.port%20%7D%7D%20--namespace%20%7B%7B%20.Release.Namespace%20%7D%7D%22%2C%22%20%20curl%20http%3A%2F%2Flocalhost%3A8080%22%2C%22%7B%7B-%20end%20%7D%7D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/NOTES.txt &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n{{ .Chart.Name }} {{ .Chart.AppVersion }} is installed as release <span class=\"hljs-string\">&quot;{{ .Release.Name }}&quot;</span> <span class=\"hljs-keyword\">in</span> namespace <span class=\"hljs-string\">&quot;{{ .Release.Namespace }}&quot;</span>.\n\n{{- <span class=\"hljs-keyword\">if</span> .Values.ingress.enabled }}\nOpen:\n{{- range .Values.ingress.hosts }}\n  http://{{ .host }}\n{{- end }}\n{{- <span class=\"hljs-keyword\">else</span> }}\nReach it from your <span class=\"hljs-built_in\">local</span> machine:\n  kubectl port-forward svc/{{ include <span class=\"hljs-string\">&quot;myapp.fullname&quot;</span> . }} 8080:{{ .Values.service.port }} --namespace {{ .Release.Namespace }}\n  curl http://localhost:8080\n{{- end }}\nEOF</code></pre></figure>\n<h3 id=\"518-teststest-connectionyaml-a-built-in-check\"><a class=\"anchor\" href=\"#518-teststest-connectionyaml-a-built-in-check\" aria-label=\"Link to this section\">#</a>5.18 <code>tests/test-connection.yaml</code>: a built-in check</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2Ftemplates%2Ftests%2Ftest-connection.yaml%20%3C%3C'EOF'%22%2C%22apiVersion%3A%20v1%22%2C%22kind%3A%20Pod%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20%5C%22%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D-test%5C%22%22%2C%22%20%20labels%3A%22%2C%22%7B%7B%20include%20%5C%22myapp.labels%5C%22%20.%20%7C%20indent%204%20%7D%7D%22%2C%22%20%20annotations%3A%22%2C%22%20%20%20%20%5C%22helm.sh%2Fhook%5C%22%3A%20test-success%22%2C%22spec%3A%22%2C%22%20%20restartPolicy%3A%20Never%22%2C%22%20%20containers%3A%22%2C%22%20%20%20%20-%20name%3A%20wget%22%2C%22%20%20%20%20%20%20image%3A%20busybox%3A1.36%22%2C%22%20%20%20%20%20%20command%3A%20%5B%5C%22wget%5C%22%5D%22%2C%22%20%20%20%20%20%20args%3A%20%5B%5C%22-qO-%5C%22%2C%20%5C%22%7B%7B%20include%20%5C%22myapp.fullname%5C%22%20.%20%7D%7D%3A%7B%7B%20.Values.service.port%20%7D%7D%5C%22%5D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/templates/tests/test-connection.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\napiVersion: v1\nkind: Pod\nmetadata:\n  name: <span class=\"hljs-string\">&quot;{{ include &quot;</span>myapp.fullname<span class=\"hljs-string\">&quot; . }}-test&quot;</span>\n  labels:\n{{ include <span class=\"hljs-string\">&quot;myapp.labels&quot;</span> . | indent 4 }}\n  annotations:\n    <span class=\"hljs-string\">&quot;helm.sh/hook&quot;</span>: test-success\nspec:\n  restartPolicy: Never\n  containers:\n    - name: wget\n      image: busybox:1.36\n      <span class=\"hljs-built_in\">command</span>: [<span class=\"hljs-string\">&quot;wget&quot;</span>]\n      args: [<span class=\"hljs-string\">&quot;-qO-&quot;</span>, <span class=\"hljs-string\">&quot;{{ include &quot;</span>myapp.fullname<span class=\"hljs-string\">&quot; . }}:{{ .Values.service.port }}&quot;</span>]\nEOF</code></pre></figure>\n<p>A pod that only runs when you type <code>helm2 test &lt;release&gt;</code>. If it exits successfully the test passes. It proves\nthe Service resolves and answers.</p>\n<h3 id=\"519-helmignore\"><a class=\"anchor\" href=\"#519-helmignore\" aria-label=\"Link to this section\">#</a>5.19 <code>.helmignore</code></h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20myapp%2F.helmignore%20%3C%3C'EOF'%22%2C%22.git%2F%22%2C%22*.swp%22%2C%22*.bak%22%2C%22*.tmp%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; myapp/.helmignore &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\n.git/\n*.swp\n*.bak\n*.tmp\nEOF</code></pre></figure>\n<p>Files listed here are left out when the chart is packaged. Same idea as <code>.gitignore</code>.</p>\n<h3 id=\"520-requirementsyaml-other-charts-you-depend-on\"><a class=\"anchor\" href=\"#520-requirementsyaml-other-charts-you-depend-on\" aria-label=\"Link to this section\">#</a>5.20 <code>requirements.yaml</code>: other charts you depend on</h3>\n<p>If your app needs Redis or Postgres, depend on their charts instead of writing them:</p>\n<figure class=\"code\" data-lang=\"yaml\"><figcaption><span class=\"lang\">yaml</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-attr\">dependencies:</span>\n  <span class=\"hljs-bullet\">-</span> <span class=\"hljs-attr\">name:</span> <span class=\"hljs-string\">redis</span>\n    <span class=\"hljs-attr\">version:</span> <span class=\"hljs-string\">&quot;&lt;pick one with: helm2 search stable/redis -l&gt;&quot;</span>\n    <span class=\"hljs-attr\">repository:</span> <span class=\"hljs-string\">https://charts.helm.sh/stable</span>\n    <span class=\"hljs-attr\">condition:</span> <span class=\"hljs-string\">redis.enabled</span></code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20dependency%20update%20myapp%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 dependency update myapp</code></pre></figure>\n<p>Downloads the dependency into <code>myapp/charts/</code>. <code>condition: redis.enabled</code> lets a user switch it off with a value.\nSettings for the dependency go under its name in your values (<code>redis: {…}</code>). <strong>Helm 2 uses <code>requirements.yaml</code>\nnext to <code>Chart.yaml</code>; Helm 3 puts dependencies inside <code>Chart.yaml</code>.</strong></p>\n<h3 id=\"521-other-objects-you-may-add\"><a class=\"anchor\" href=\"#521-other-objects-you-may-add\" aria-label=\"Link to this section\">#</a>5.21 Other objects you may add</h3>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>File</th><th>When you need it</th></tr></thead><tbody><tr><td><code>statefulset.yaml</code></td><td>The app needs a stable identity and its own disk per pod (databases, queues): pods are named <code>name-0</code>, <code>name-1</code>, … and each gets a volume from <code>volumeClaimTemplates</code>. Replaces <code>deployment.yaml</code>, and needs a <strong>headless Service</strong> (<code>clusterIP: None</code>) named in <code>serviceName</code></td></tr>\n<tr><td><code>role.yaml</code> + <code>rolebinding.yaml</code></td><td>The app itself calls the Kubernetes API (a controller, an operator). Grant only the verbs it uses to the chart&#39;s ServiceAccount</td></tr>\n<tr><td><code>daemonset.yaml</code></td><td>One pod on every node (log shippers, node monitors)</td></tr>\n<tr><td><code>servicemonitor.yaml</code></td><td>You run Prometheus Operator and want the app&#39;s metrics scraped</td></tr>\n<tr><td><code>resourcequota.yaml</code>, <code>limitrange.yaml</code></td><td>Usually <strong>not</strong> in an app chart: they belong to the namespace, set once by whoever owns the cluster</td></tr>\n<tr><td>CRDs in <code>crds/</code></td><td>Helm 2 has no special CRD handling (Helm 3 adds a <code>crds/</code> folder). Install CRDs separately</td></tr></tbody></table></div>\n<hr>\n<h2 id=\"6-check-the-chart-before-installing-it\"><a class=\"anchor\" href=\"#6-check-the-chart-before-installing-it\" aria-label=\"Link to this section\">#</a>6. Check the chart before installing it</h2>\n<p><strong>Is it well-formed?</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20lint%20myapp%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 lint myapp</code></pre></figure>\n<p><code>1 chart(s) linted, no failures</code>. Warnings such as <code>icon is recommended</code> are harmless.</p>\n<p><strong>What would it produce?</strong> Render the templates locally. This needs no Tiller and changes nothing:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20template%20myapp%20--name%20demo%20--namespace%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 template myapp --name demo --namespace web</code></pre></figure>\n<p>Read the output. Look for objects missing, indentation wrong, empty values. Render one file:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20template%20myapp%20--name%20demo%20--namespace%20web%20-x%20templates%2Fdeployment.yaml%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 template myapp --name demo --namespace web -x templates/deployment.yaml</code></pre></figure>\n<p>With settings:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20template%20myapp%20--name%20demo%20--namespace%20web%20--set%20replicaCount%3D3%2Cingress.enabled%3Dtrue%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 template myapp --name demo --namespace web --<span class=\"hljs-built_in\">set</span> replicaCount=3,ingress.enabled=<span class=\"hljs-literal\">true</span></code></pre></figure>\n<p><strong>Ask the server to check it too</strong> (renders, validates against the API, installs nothing):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20install%20myapp%20--name%20demo%20--namespace%20web%20--dry-run%20--debug%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 install myapp --name demo --namespace web --dry-run --debug</code></pre></figure>\n<hr>\n<h2 id=\"7-install-upgrade-roll-back-remove\"><a class=\"anchor\" href=\"#7-install-upgrade-roll-back-remove\" aria-label=\"Link to this section\">#</a>7. Install, upgrade, roll back, remove</h2>\n<p>Make sure <code>web</code> exists (<code>kubectl get ns web</code>) and that <code>kubectl config current-context</code> is your lab cluster.</p>\n<p><strong>Install:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20install%20myapp%20--name%20demo%20--namespace%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 install myapp --name demo --namespace web</code></pre></figure>\n<ul>\n<li><code>myapp</code> — the chart folder. <code>--name demo</code> — the release name. <code>--namespace web</code> — where to put it.</li>\n<li>Prints the objects it created, then <code>NOTES.txt</code>.</li>\n</ul>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20ls%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 <span class=\"hljs-built_in\">ls</span></code></pre></figure>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>NAME   REVISION   UPDATED   STATUS     CHART       APP VERSION   NAMESPACE\ndemo   1          …         DEPLOYED   myapp-0.1.0 1.0           web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20all%20-n%20web%20-l%20app.kubernetes.io%2Finstance%3Ddemo%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get all -n web -l app.kubernetes.io/instance=demo</code></pre></figure>\n<p>Everything belonging to this release, found through the labels from <code>_helpers.tpl</code>.</p>\n<p><strong>Test it:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20test%20demo%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 <span class=\"hljs-built_in\">test</span> demo</code></pre></figure>\n<p><strong>Upgrade</strong> — change an image tag or a setting, and Helm makes revision 2:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20upgrade%20demo%20myapp%20--namespace%20web%20--set%20replicaCount%3D3%20--set%20image.tag%3D1.27.1%20--wait%20--timeout%20300%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 upgrade demo myapp --namespace web --<span class=\"hljs-built_in\">set</span> replicaCount=3 --<span class=\"hljs-built_in\">set</span> image.tag=1.27.1 --<span class=\"hljs-built_in\">wait</span> --<span class=\"hljs-built_in\">timeout</span> 300</code></pre></figure>\n<ul>\n<li><code>--wait</code> — do not return until the pods are ready. <code>--timeout 300</code> — give up after 300 seconds.</li>\n<li>Settings you do not repeat <strong>go back to the chart&#39;s defaults</strong>, unless you add <code>--reuse-values</code>. This\nsurprises everyone once. Keep your settings in files (section 9) and pass them every time.</li>\n</ul>\n<p><strong>The command to use in a pipeline: install if new, upgrade if it exists:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 upgrade --install demo myapp --namespace web -f values.yaml --<span class=\"hljs-built_in\">set</span> image.tag=&lt;tag&gt; --<span class=\"hljs-built_in\">wait</span> --<span class=\"hljs-built_in\">timeout</span> 300</code></pre></figure>\n<p>Add <code>--atomic</code> to roll back automatically if the upgrade fails.</p>\n<p><strong>Look at what is installed:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20status%20demo%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 status demo</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20get%20values%20demo%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 get values demo</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20get%20manifest%20demo%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 get manifest demo</code></pre></figure>\n<p><code>get values</code> shows the settings used; <code>get manifest</code> the exact YAML Helm applied.</p>\n<p><strong>History and rollback:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20history%20demo%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 <span class=\"hljs-built_in\">history</span> demo</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20rollback%20demo%201%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 rollback demo 1</code></pre></figure>\n<p>Goes back to revision 1&#39;s chart and values, as a new revision 3.</p>\n<p><strong>Remove it:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20delete%20demo%20--purge%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 delete demo --purge</code></pre></figure>\n<p>Deletes every object and the release record. Without <code>--purge</code>, Helm 2 keeps the record and <strong>the name cannot be\nreused</strong>.</p>\n<hr>\n<h2 id=\"8-secrets-and-credentials-keep-them-out-of-the-release\"><a class=\"anchor\" href=\"#8-secrets-and-credentials-keep-them-out-of-the-release\" aria-label=\"Link to this section\">#</a>8. Secrets and credentials: keep them out of the release</h2>\n<p>Helm 2 stores each release, including its values, as a ConfigMap in <code>kube-system</code>. So:</p>\n<p><strong>Create credentials yourself, once, outside Helm:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20secret%20generic%20demo-app%20-n%20web%20--from-literal%3DDB_PASSWORD%3Dchange-me%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create secret generic demo-app -n web --from-literal=DB_PASSWORD=change-me</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create secret docker-registry regsecret -n web --docker-server=registry.example.com --docker-username=&lt;user&gt; --docker-password=&lt;password&gt;</code></pre></figure>\n<p><strong>Point the chart at them by name:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20upgrade%20--install%20demo%20myapp%20--namespace%20web%20--set%20secret.existingSecret%3Ddemo-app%20--set%20imagePullSecret.name%3Dregsecret%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 upgrade --install demo myapp --namespace web --<span class=\"hljs-built_in\">set</span> secret.existingSecret=demo-app --<span class=\"hljs-built_in\">set</span> imagePullSecret.name=regsecret</code></pre></figure>\n<p>The chart then carries only names, never values. Rotating a password means updating the Secret and restarting\nthe pods (<code>kubectl rollout restart deployment/demo-myapp -n web</code>).</p>\n<p>For team use, keep Secrets in git <strong>encrypted</strong>, with Sealed Secrets, SOPS or an external secrets operator that\nsyncs from a vault. Never commit a plain <code>values-secret.yaml</code>.</p>\n<hr>\n<h2 id=\"9-one-chart-many-environments\"><a class=\"anchor\" href=\"#9-one-chart-many-environments\" aria-label=\"Link to this section\">#</a>9. One chart, many environments</h2>\n<p>The same chart deploys every environment; only the values change. One file per environment, in git:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20values-dev.yaml%20%3C%3C'EOF'%22%2C%22replicaCount%3A%201%22%2C%22image%3A%22%2C%22%20%20tag%3A%20%5C%221.27%5C%22%22%2C%22ingress%3A%22%2C%22%20%20enabled%3A%20true%22%2C%22%20%20hosts%3A%22%2C%22%20%20%20%20-%20host%3A%20myapp.dev.local%22%2C%22%20%20%20%20%20%20paths%3A%20%5B%5C%22%2F%5C%22%5D%22%2C%22pdb%3A%22%2C%22%20%20enabled%3A%20false%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; values-dev.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\nreplicaCount: 1\nimage:\n  tag: <span class=\"hljs-string\">&quot;1.27&quot;</span>\ningress:\n  enabled: <span class=\"hljs-literal\">true</span>\n  hosts:\n    - host: myapp.dev.local\n      paths: [<span class=\"hljs-string\">&quot;/&quot;</span>]\npdb:\n  enabled: <span class=\"hljs-literal\">false</span>\nEOF</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20values-prod.yaml%20%3C%3C'EOF'%22%2C%22replicaCount%3A%203%22%2C%22autoscaling%3A%22%2C%22%20%20enabled%3A%20true%22%2C%22%20%20minReplicas%3A%203%22%2C%22%20%20maxReplicas%3A%2010%22%2C%22resources%3A%22%2C%22%20%20requests%3A%20%7Bcpu%3A%20250m%2C%20memory%3A%20256Mi%7D%22%2C%22%20%20limits%3A%20%7Bcpu%3A%20%5C%221%5C%22%2C%20memory%3A%20512Mi%7D%22%2C%22networkPolicy%3A%22%2C%22%20%20enabled%3A%20true%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; values-prod.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\nreplicaCount: 3\nautoscaling:\n  enabled: <span class=\"hljs-literal\">true</span>\n  minReplicas: 3\n  maxReplicas: 10\nresources:\n  requests: {cpu: 250m, memory: 256Mi}\n  limits: {cpu: <span class=\"hljs-string\">&quot;1&quot;</span>, memory: 512Mi}\nnetworkPolicy:\n  enabled: <span class=\"hljs-literal\">true</span>\nEOF</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20upgrade%20--install%20myapp-dev%20myapp%20--namespace%20dev%20-f%20values-dev.yaml%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 upgrade --install myapp-dev myapp --namespace dev -f values-dev.yaml</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 upgrade --install myapp-prod myapp --namespace prod -f values-prod.yaml --<span class=\"hljs-built_in\">set</span> image.tag=&lt;tag&gt;</code></pre></figure>\n<p><strong>Which value wins</strong> (last one beats earlier ones): the chart&#39;s <code>values.yaml</code>, then each <code>-f file</code> in the order\ngiven, then <code>--set</code>. So the order is defaults → environment file → the one value the pipeline sets.</p>\n<hr>\n<h2 id=\"10-a-checklist-for-a-perfect-system\"><a class=\"anchor\" href=\"#10-a-checklist-for-a-perfect-system\" aria-label=\"Link to this section\">#</a>10. A checklist for &quot;a perfect system&quot;</h2>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Area</th><th>Do this</th></tr></thead><tbody><tr><td><strong>Naming and labels</strong></td><td>One <code>fullname</code> helper; the standard <code>app.kubernetes.io/*</code> labels on every object; never edit selector labels after the first install</td></tr>\n<tr><td><strong>Image</strong></td><td>A specific tag or commit hash, never <code>latest</code>; a private registry uses <code>imagePullSecrets</code> (<code>regsecret</code>) created outside the chart</td></tr>\n<tr><td><strong>Health</strong></td><td>A <code>readinessProbe</code> and a <code>livenessProbe</code> on every container</td></tr>\n<tr><td><strong>Resources</strong></td><td><code>requests</code> and <code>limits</code> on every container; autoscaling needs requests</td></tr>\n<tr><td><strong>Availability</strong></td><td>At least 2 replicas, a rolling update with <code>maxUnavailable: 0</code>, a PodDisruptionBudget, anti-affinity to spread over nodes</td></tr>\n<tr><td><strong>Config</strong></td><td>Non-secret settings in a ConfigMap; a checksum annotation so config changes roll the pods</td></tr>\n<tr><td><strong>Secrets</strong></td><td>Created outside the chart, referenced by name; <code>existingSecret</code> pattern; encrypted in git</td></tr>\n<tr><td><strong>Identity</strong></td><td>A ServiceAccount per app; no API token unless the app calls the API; a Role only if it does</td></tr>\n<tr><td><strong>Security</strong></td><td><code>runAsNonRoot</code>, <code>allowPrivilegeEscalation: false</code>, read-only root filesystem, dropped capabilities; Pod Security labels on the namespace</td></tr>\n<tr><td><strong>Network</strong></td><td>A NetworkPolicy that allows only the traffic the app needs</td></tr>\n<tr><td><strong>Data</strong></td><td>A migration hook (or init step) before the new version starts; PVCs or a StatefulSet for state</td></tr>\n<tr><td><strong>Operations</strong></td><td><code>NOTES.txt</code>; a <code>helm test</code>; <code>helm lint</code> and <code>helm template</code> in CI; <code>--atomic</code> or <code>--wait</code>; per-environment values files in git</td></tr>\n<tr><td><strong>Portability</strong></td><td><code>apps/v1</code>, <code>networking.k8s.io/v1</code> and similar current APIs; no hard-coded namespace; <code>.Capabilities</code> checks if you must support old clusters</td></tr></tbody></table></div>\n<hr>\n<h2 id=\"11-helm-2-versus-helm-3\"><a class=\"anchor\" href=\"#11-helm-2-versus-helm-3\" aria-label=\"Link to this section\">#</a>11. Helm 2 versus Helm 3</h2>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th></th><th>Helm 2</th><th>Helm 3</th></tr></thead><tbody><tr><td>Server in the cluster</td><td>Tiller (needs install, RBAC, version match)</td><td>None: Helm uses your own kubeconfig and permissions</td></tr>\n<tr><td>Release records stored in</td><td>ConfigMaps in <code>kube-system</code></td><td>Secrets in the release&#39;s own namespace</td></tr>\n<tr><td>Release names</td><td>Global, unique across the cluster</td><td>Per namespace</td></tr>\n<tr><td><code>Chart.yaml</code> <code>apiVersion</code></td><td><code>v1</code>, dependencies in <code>requirements.yaml</code></td><td><code>v2</code>, dependencies inside <code>Chart.yaml</code></td></tr>\n<tr><td>Install</td><td><code>helm install ./chart --name x</code></td><td><code>helm install x ./chart</code></td></tr>\n<tr><td>Delete</td><td><code>helm delete x --purge</code></td><td><code>helm uninstall x</code></td></tr>\n<tr><td>Template function <code>lookup</code></td><td>no</td><td>yes</td></tr>\n<tr><td>CRDs</td><td>no special support</td><td>a <code>crds/</code> folder</td></tr></tbody></table></div>\n<p>To move a running Helm 2 setup over, use the <code>helm 2to3</code> plugin, which converts releases in place.</p>\n<hr>\n<h2 id=\"12-when-something-goes-wrong\"><a class=\"anchor\" href=\"#12-when-something-goes-wrong\" aria-label=\"Link to this section\">#</a>12. When something goes wrong</h2>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Message</th><th>Cause and fix</th></tr></thead><tbody><tr><td><code>Error: could not find tiller</code></td><td>Tiller&#39;s pod is not ready: <code>kubectl -n kube-system rollout status deploy/tiller-deploy</code></td></tr>\n<tr><td><code>Error: incompatible versions client[…] server[…]</code></td><td>Client and Tiller differ. Reinstall one so both match (section 2)</td></tr>\n<tr><td><code>Error: no available release name found</code></td><td>Tiller is reachable but has a problem, often its ServiceAccount permissions: recheck 2.2</td></tr>\n<tr><td><code>Error: a release named demo already exists</code></td><td>Use <code>helm2 upgrade --install</code>, or <code>helm2 delete demo --purge</code> first</td></tr>\n<tr><td><code>Error: UPGRADE FAILED: &quot;demo&quot; has no deployed releases</code></td><td>The first install failed and left a record: <code>helm2 delete demo --purge</code>, then install again</td></tr>\n<tr><td><code>error converting YAML to JSON</code> / <code>did not find expected key</code></td><td>Indentation or whitespace wrong in a template. Run <code>helm2 template</code> and read the output at the line number</td></tr>\n<tr><td><code>no matches for kind &quot;X&quot; in version &quot;…&quot;</code></td><td>The template uses an API version your cluster does not have (or no longer has). Use a current one (5.8, 5.10)</td></tr>\n<tr><td><code>field is immutable</code> / <code>selector</code> error on upgrade</td><td>You changed the Deployment&#39;s selector. Delete the Deployment (<code>helm2 delete --purge</code>) and install again</td></tr>\n<tr><td>Pods <code>ImagePullBackOff</code></td><td>Wrong image or tag; private registry without <code>regsecret</code>; a local image not loaded (<a href=\"/blog/run-your-image\">Run your own image in the cluster</a>)</td></tr>\n<tr><td>Pods <code>CreateContainerConfigError</code></td><td>A referenced ConfigMap or Secret key is missing; <code>kubectl describe pod</code> names it</td></tr>\n<tr><td><code>helm2: segmentation fault</code></td><td>The native Helm 2 binary crashes on your OS: use the container version (2.1)</td></tr>\n<tr><td><code>~/.kube/kind-internal</code> is a directory</td><td>Docker made a folder because the file was missing: <code>rmdir</code> it, create the file, retry (2.1)</td></tr></tbody></table></div>\n<hr>\n<h2 id=\"13-clean-up\"><a class=\"anchor\" href=\"#13-clean-up\" aria-label=\"Link to this section\">#</a>13. Clean up</h2>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20delete%20demo%20--purge%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 delete demo --purge</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20delete%20myapp-dev%20--purge%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 delete myapp-dev --purge</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22helm2%20delete%20myapp-prod%20--purge%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>helm2 delete myapp-prod --purge</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20secret%20demo-app%20regsecret%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete secret demo-app regsecret -n web</code></pre></figure>\n<p>To remove Tiller itself:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20-n%20kube-system%20delete%20deployment%20tiller-deploy%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl -n kube-system delete deployment tiller-deploy</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20-n%20kube-system%20delete%20service%20tiller-deploy%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl -n kube-system delete service tiller-deploy</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20clusterrolebinding%20tiller%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete clusterrolebinding tiller</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20-n%20kube-system%20delete%20serviceaccount%20tiller%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl -n kube-system delete serviceaccount tiller</code></pre></figure>\n<p>Deleting the whole cluster (<a href=\"/blog/clean-up\">Stop, shut down and clean up</a>) removes all of it, Tiller included.</p>\n";
var helm_2_chart_default = {
	slug: slug$5,
	title: title$5,
	description: description$5,
	order: 7,
	tags: tags$5,
	date: date$5,
	minutes: 39,
	words: words$5,
	toc: toc$5,
	html: html$5
};
//#endregion
//#region src/blog/generated/posts/k3d-cluster.json
var k3d_cluster_exports = /* @__PURE__ */ __exportAll({
	date: () => date$4,
	default: () => k3d_cluster_default,
	description: () => description$4,
	html: () => html$4,
	minutes: () => 16,
	order: () => 4,
	slug: () => slug$4,
	tags: () => tags$4,
	title: () => title$4,
	toc: () => toc$4,
	words: () => words$4
});
var slug$4 = "k3d-cluster";
var title$4 = "Create a local Kubernetes cluster with k3d";
var description$4 = "The same journey with k3d, plus live node add and remove, a load balancer, ingress, metrics and a built-in registry.";
var tags$4 = ["k3d"];
var date$4 = "2026-10-14";
var words$4 = 1296;
var toc$4 = [
	{
		"depth": 2,
		"id": "kind-or-k3d",
		"text": "kind or k3d?"
	},
	{
		"depth": 2,
		"id": "part-1--prepare-the-machine",
		"text": "Part 1 — Prepare the machine"
	},
	{
		"depth": 2,
		"id": "part-2--create-the-cluster",
		"text": "Part 2 — Create the cluster"
	},
	{
		"depth": 2,
		"id": "part-3--switch-to-the-cluster",
		"text": "Part 3 — Switch to the cluster"
	},
	{
		"depth": 2,
		"id": "part-4--the-nodes",
		"text": "Part 4 — The nodes"
	},
	{
		"depth": 2,
		"id": "part-5--namespaces",
		"text": "Part 5 — Namespaces"
	},
	{
		"depth": 2,
		"id": "part-6--what-k3d-gives-you-that-kind-does-not",
		"text": "Part 6 — What k3d gives you that kind does not"
	},
	{
		"depth": 3,
		"id": "61-reach-an-app-with-ingress-or-a-loadbalancer",
		"text": "6.1 Reach an app with Ingress or a LoadBalancer"
	},
	{
		"depth": 3,
		"id": "62-metrics-and-pod-autoscaling",
		"text": "6.2 Metrics and pod autoscaling"
	},
	{
		"depth": 3,
		"id": "63-your-own-images",
		"text": "6.3 Your own images"
	},
	{
		"depth": 3,
		"id": "64-dashboard",
		"text": "6.4 Dashboard"
	},
	{
		"depth": 2,
		"id": "part-7--stop-start-delete",
		"text": "Part 7 — Stop, start, delete"
	}
];
var html$4 = "<p>The same journey as <a href=\"/blog/kind-cluster\">Create a local Kubernetes cluster with kind</a>, with k3d instead of kind: install,\ncreate the cluster <code>local-cluster-1</code>, switch kubectl to it, look at the nodes, make namespaces. Then the extras\nthat make k3d feel more like a managed cloud cluster (GKE): adding and removing nodes live, a load balancer,\ningress, metrics, a built-in registry and a dashboard.</p>\n<p>k3d runs <strong>k3s</strong>, a small certified Kubernetes, inside Docker. Each node is a Docker container, as with kind.</p>\n<blockquote>\n<p><strong>Not tested yet.</strong> Written from k3d&#39;s documented behaviour. Run it once and fix anything that differs\n(<code>k3d &lt;command&gt; --help</code> shows the exact flags for your version).</p>\n</blockquote>\n<p>New to the words (node, context, namespace)? See <a href=\"/blog/concepts\">Concepts: what each piece is</a>.</p>\n<h2 id=\"kind-or-k3d\"><a class=\"anchor\" href=\"#kind-or-k3d\" aria-label=\"Link to this section\">#</a>kind or k3d?</h2>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th></th><th>kind</th><th>k3d</th></tr></thead><tbody><tr><td>Add or remove a node on a running cluster</td><td>no, re-create the cluster</td><td>yes, <code>k3d node create</code> / <code>delete</code></td></tr>\n<tr><td>Load balancer, ingress, metrics-server</td><td>install them yourself</td><td>bundled with k3s</td></tr>\n<tr><td>Local registry</td><td>a few manual steps</td><td>one flag</td></tr>\n<tr><td>Kubernetes</td><td>upstream, as it ships</td><td>k3s, lighter and faster to start</td></tr>\n<tr><td>Context name</td><td><code>kind-&lt;name&gt;</code></td><td><code>k3d-&lt;name&gt;</code></td></tr></tbody></table></div>\n<p>Everything you learn about kubectl, namespaces, Deployments, Services and <code>nodeSelector</code> is the same on both.</p>\n<p>The names used throughout:</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Thing</th><th>Name</th></tr></thead><tbody><tr><td>Cluster</td><td><code>local-cluster-1</code></td></tr>\n<tr><td>kubectl context</td><td><code>k3d-local-cluster-1</code> (k3d always adds the <code>k3d-</code> prefix)</td></tr>\n<tr><td>Nodes</td><td><code>k3d-local-cluster-1-server-0</code>, <code>k3d-local-cluster-1-agent-0</code>, <code>k3d-local-cluster-1-agent-1</code></td></tr>\n<tr><td>Load balancer container</td><td><code>k3d-local-cluster-1-serverlb</code></td></tr>\n<tr><td>Registry container</td><td><code>k3d-local-registry</code></td></tr>\n<tr><td>Namespaces</td><td><code>web</code>, <code>cache</code>, <code>db</code></td></tr></tbody></table></div>\n<p>k3s calls the control-plane a <strong>server</strong> and a worker an <strong>agent</strong>.</p>\n<hr>\n<h2 id=\"part-1--prepare-the-machine\"><a class=\"anchor\" href=\"#part-1--prepare-the-machine\" aria-label=\"Link to this section\">#</a>Part 1 — Prepare the machine</h2>\n<p><strong>1.1 Start Docker</strong> and give it enough memory, as in Part 1 of\n<a href=\"/blog/kind-cluster\">Create a local Kubernetes cluster with kind</a>: roughly 4 GB or more for three nodes.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20info%20--format%20'%7B%7B.ServerVersion%7D%7D'%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker info --format <span class=\"hljs-string\">&#x27;{{.ServerVersion}}&#x27;</span></code></pre></figure>\n<p><strong>1.2 Install the tools:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>brew install k3d</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>brew install --cask headlamp</code></pre></figure>\n<p><code>k3d</code> makes the cluster. <code>headlamp</code> is a desktop dashboard that reads your kubeconfig (used in Part 6). You\nalso need <code>kubectl</code>: <code>brew install kubectl</code> if <code>kubectl version --client</code> does not work.</p>\n<p><strong>Check:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22k3d%20version%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>k3d version</code></pre></figure>\n<p>Prints the k3d and k3s versions.</p>\n<hr>\n<h2 id=\"part-2--create-the-cluster\"><a class=\"anchor\" href=\"#part-2--create-the-cluster\" aria-label=\"Link to this section\">#</a>Part 2 — Create the cluster</h2>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22k3d%20cluster%20create%20local-cluster-1%20--servers%201%20--agents%202%20--port%20%5C%228080%3A80%40loadbalancer%5C%22%20--registry-create%20local-registry%3A0.0.0.0%3A5001%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>k3d cluster create local-cluster-1 --servers 1 --agents 2 --port <span class=\"hljs-string\">&quot;8080:80@loadbalancer&quot;</span> --registry-create local-registry:0.0.0.0:5001</code></pre></figure>\n<p>If your terminal wraps long lines, paste it in the shorter form, with <code>\\</code> at the line ends:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22k3d%20cluster%20create%20local-cluster-1%20%5C%5C%22%2C%22%20%20--servers%201%20--agents%202%20%5C%5C%22%2C%22%20%20--port%20%5C%228080%3A80%40loadbalancer%5C%22%20%5C%5C%22%2C%22%20%20--registry-create%20local-registry%3A0.0.0.0%3A5001%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>k3d cluster create local-cluster-1 \\\n  --servers 1 --agents 2 \\\n  --port <span class=\"hljs-string\">&quot;8080:80@loadbalancer&quot;</span> \\\n  --registry-create local-registry:0.0.0.0:5001</code></pre></figure>\n<p>Flag by flag:</p>\n<ul>\n<li><code>local-cluster-1</code> — the cluster name.</li>\n<li><code>--servers 1</code> — one control-plane node. <code>--agents 2</code> — two worker nodes.</li>\n<li><code>--port &quot;8080:80@loadbalancer&quot;</code> — local port 8080 → port 80 on the cluster&#39;s load balancer. This is how you\nreach Ingress and LoadBalancer Services from the browser, with no <code>port-forward</code>. Like kind&#39;s\n<code>extraPortMappings</code>, it is set at creation (add more <code>--port</code> flags for more ports).</li>\n<li><code>--registry-create local-registry:0.0.0.0:5001</code> — starts a registry container named <code>k3d-local-registry</code>,\npublished on local port 5001, and tells every node to use it.</li>\n</ul>\n<p>It takes about a minute and ends by switching your kubectl context.</p>\n<p><strong>Look at what Docker now has:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20ps%20--format%20'table%20%7B%7B.Names%7D%7D%5C%5Ct%7B%7B.Ports%7D%7D'%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker ps --format <span class=\"hljs-string\">&#x27;table {{.Names}}\\t{{.Ports}}&#x27;</span></code></pre></figure>\n<p>Three node containers (<code>…-server-0</code>, <code>…-agent-0</code>, <code>…-agent-1</code>), the load balancer <code>…-serverlb</code>, and\n<code>k3d-local-registry</code>.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22k3d%20cluster%20list%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>k3d cluster list</code></pre></figure>\n<p><strong>Check:</strong> <code>local-cluster-1</code> is listed with <code>1/1</code> servers and <code>2/2</code> agents.</p>\n<hr>\n<h2 id=\"part-3--switch-to-the-cluster\"><a class=\"anchor\" href=\"#part-3--switch-to-the-cluster\" aria-label=\"Link to this section\">#</a>Part 3 — Switch to the cluster</h2>\n<p>The context is <code>k3d-local-cluster-1</code>: k3d&#39;s prefix, the way kind&#39;s is <code>kind-</code>. How the names come about:\n<a href=\"/blog/concepts#names-kubeconfig-and-contexts\">Concepts: what each piece is</a>.</p>\n<blockquote>\n<p>If your kubeconfig also holds a cloud or work cluster, a command meant for your lab cluster will run against\nthat one when it is the current context. Always know the current context.</p>\n</blockquote>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20get-contexts%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config get-contexts</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20current-context%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config current-context</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20use-context%20k3d-local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config use-context k3d-local-cluster-1</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20cluster-info%20--context%20k3d-local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl cluster-info --context k3d-local-cluster-1</code></pre></figure>\n<p>To aim one command without switching: <code>kubectl --context k3d-local-cluster-1 get nodes</code>.</p>\n<p><strong>Check:</strong> <code>kubectl config current-context</code> prints <code>k3d-local-cluster-1</code>.</p>\n<hr>\n<h2 id=\"part-4--the-nodes\"><a class=\"anchor\" href=\"#part-4--the-nodes\" aria-label=\"Link to this section\">#</a>Part 4 — The nodes</h2>\n<p><strong>4.1 See them:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20nodes%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get nodes</code></pre></figure>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>k3d-local-cluster-1-server-0   Ready   control-plane,master\nk3d-local-cluster-1-agent-0    Ready   &lt;none&gt;\nk3d-local-cluster-1-agent-1    Ready   &lt;none&gt;</code></pre></figure>\n<p>All three <code>Ready</code>.</p>\n<p><strong>4.2 One difference from kind.</strong> In kind, the control-plane node is tainted so your pods stay off it. In\nk3s the server node has no such taint by default, so your pods <strong>can</strong> be scheduled on it too. If you want them\nonly on the agents, taint the server:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20taint%20node%20k3d-local-cluster-1-server-0%20node-role.kubernetes.io%2Fcontrol-plane%3Dtrue%3ANoSchedule%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl taint node k3d-local-cluster-1-server-0 node-role.kubernetes.io/control-plane=<span class=\"hljs-literal\">true</span>:NoSchedule</code></pre></figure>\n<p>(What a taint is, and how a toleration lets a pod past it: <a href=\"/blog/concepts#taints-and-tolerations\">Concepts: what each piece is</a>.)</p>\n<p><strong>4.3 Node pools: labels and taints.</strong> k3d has no node pools. The Kubernetes equivalent is a label that pods\nselect, and optionally a taint that keeps other pods away.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20label%20node%20k3d-local-cluster-1-agent-0%20pool%3Dapp%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl label node k3d-local-cluster-1-agent-0 pool=app</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20label%20node%20k3d-local-cluster-1-agent-1%20pool%3Ddata%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl label node k3d-local-cluster-1-agent-1 pool=data</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20taint%20node%20k3d-local-cluster-1-agent-1%20dedicated%3Ddata%3ANoSchedule%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl taint node k3d-local-cluster-1-agent-1 dedicated=data:NoSchedule</code></pre></figure>\n<p>A pod then needs both the selector and the matching toleration to land on the <code>data</code> pool:</p>\n<figure class=\"code\" data-lang=\"yaml\"><figcaption><span class=\"lang\">yaml</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-attr\">spec:</span>\n  <span class=\"hljs-attr\">nodeSelector:</span>\n    <span class=\"hljs-attr\">pool:</span> <span class=\"hljs-string\">data</span>\n  <span class=\"hljs-attr\">tolerations:</span>\n    <span class=\"hljs-bullet\">-</span> <span class=\"hljs-attr\">key:</span> <span class=\"hljs-string\">dedicated</span>\n      <span class=\"hljs-attr\">operator:</span> <span class=\"hljs-string\">Equal</span>\n      <span class=\"hljs-attr\">value:</span> <span class=\"hljs-string\">data</span>\n      <span class=\"hljs-attr\">effect:</span> <span class=\"hljs-string\">NoSchedule</span></code></pre></figure>\n<p><strong>4.4 Add and remove nodes live.</strong> This is the part kind cannot do.</p>\n<p>Add a worker:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22k3d%20node%20create%20extra%20--cluster%20local-cluster-1%20--role%20agent%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>k3d node create extra --cluster local-cluster-1 --role agent</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20nodes%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get nodes</code></pre></figure>\n<p>A new node appears (named <code>k3d-extra-0</code>; <code>k3d node list</code> shows the exact name).</p>\n<p>Remove it. Drain first so its pods move to other nodes:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20drain%20k3d-extra-0%20--ignore-daemonsets%20--delete-emptydir-data%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl drain k3d-extra-0 --ignore-daemonsets --delete-emptydir-data</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20node%20k3d-extra-0%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete node k3d-extra-0</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22k3d%20node%20delete%20k3d-extra-0%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>k3d node delete k3d-extra-0</code></pre></figure>\n<hr>\n<h2 id=\"part-5--namespaces\"><a class=\"anchor\" href=\"#part-5--namespaces\" aria-label=\"Link to this section\">#</a>Part 5 — Namespaces</h2>\n<p>Identical to kind:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20namespace%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create namespace web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20namespace%20cache%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create namespace cache</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20namespace%20db%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create namespace db</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20namespaces%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get namespaces</code></pre></figure>\n<p><code>web</code>, <code>cache</code> and <code>db</code> are there, next to the built-in <code>default</code>, <code>kube-system</code>, <code>kube-public</code> and\n<code>kube-node-lease</code>.</p>\n<p>To deploy apps into them (the same commands on k3d), see <a href=\"/blog/deploy-apps\">Deploy apps into your namespaces, one at a time</a>. Use the pool\nlabels from 4.3 instead of kind&#39;s <code>role=data</code> in the <code>nodeSelector</code>.</p>\n<hr>\n<h2 id=\"part-6--what-k3d-gives-you-that-kind-does-not\"><a class=\"anchor\" href=\"#part-6--what-k3d-gives-you-that-kind-does-not\" aria-label=\"Link to this section\">#</a>Part 6 — What k3d gives you that kind does not</h2>\n<p>k3s bundles most of what a managed cluster provides, so there is little to install:</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>GKE feature</th><th>Here</th><th>Install needed?</th></tr></thead><tbody><tr><td>Nodes you can add and remove live</td><td><code>k3d node create</code> / <code>k3d node delete</code></td><td>no</td></tr>\n<tr><td><code>type: LoadBalancer</code> gets an address</td><td>k3s&#39;s built-in service load balancer, reached through k3d&#39;s load balancer container</td><td>no</td></tr>\n<tr><td>Ingress</td><td>Traefik, bundled with k3s</td><td>no</td></tr>\n<tr><td>Metrics, <code>kubectl top</code>, pod autoscaling</td><td>metrics-server, bundled with k3s</td><td>no</td></tr>\n<tr><td>Persistent volumes</td><td><code>local-path</code> storage class, bundled with k3s</td><td>no</td></tr>\n<tr><td>Container registry (Artifact Registry)</td><td>a registry container k3d creates and wires into the nodes</td><td>one flag</td></tr>\n<tr><td>Node pools</td><td>node labels and taints</td><td>two commands</td></tr>\n<tr><td>Console UI</td><td>Headlamp</td><td>one install</td></tr>\n<tr><td>Node autoscaling, Autopilot, IAM</td><td>not available locally</td><td>—</td></tr></tbody></table></div>\n<h3 id=\"61-reach-an-app-with-ingress-or-a-loadbalancer\"><a class=\"anchor\" href=\"#61-reach-an-app-with-ingress-or-a-loadbalancer\" aria-label=\"Link to this section\">#</a>6.1 Reach an app with Ingress or a LoadBalancer</h3>\n<p>Deploy something first:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20deployment%20web%20--image%3Dnginx%3A1.27%20--replicas%3D2%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create deployment web --image=nginx:1.27 --replicas=2 -n web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20expose%20deployment%20web%20--port%3D80%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl expose deployment web --port=80 -n web</code></pre></figure>\n<p><strong>Ingress</strong> (Traefik picks it up):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20apply%20-f%20-%20%3C%3C'EOF'%22%2C%22apiVersion%3A%20networking.k8s.io%2Fv1%22%2C%22kind%3A%20Ingress%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20web%22%2C%22%20%20namespace%3A%20web%22%2C%22spec%3A%22%2C%22%20%20rules%3A%22%2C%22%20%20%20%20-%20http%3A%22%2C%22%20%20%20%20%20%20%20%20paths%3A%22%2C%22%20%20%20%20%20%20%20%20%20%20-%20path%3A%20%2F%22%2C%22%20%20%20%20%20%20%20%20%20%20%20%20pathType%3A%20Prefix%22%2C%22%20%20%20%20%20%20%20%20%20%20%20%20backend%3A%22%2C%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20service%3A%22%2C%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20name%3A%20web%22%2C%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20port%3A%22%2C%22%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20number%3A%2080%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl apply -f - &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: web\n  namespace: web\nspec:\n  rules:\n    - http:\n        paths:\n          - path: /\n            pathType: Prefix\n            backend:\n              service:\n                name: web\n                port:\n                  number: 80\nEOF</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22curl%20-s%20http%3A%2F%2Flocalhost%3A8080%20%7C%20head%20-5%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>curl -s http://localhost:8080 | <span class=\"hljs-built_in\">head</span> -5</code></pre></figure>\n<p>The nginx page: local port 8080 → load balancer → Traefik → Service → pod.</p>\n<p><strong>LoadBalancer Service</strong> (the GKE-style external address):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20expose%20deployment%20web%20--name%3Dweb-lb%20--type%3DLoadBalancer%20--port%3D80%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl expose deployment web --name=web-lb --<span class=\"hljs-built_in\">type</span>=LoadBalancer --port=80 -n web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20service%20web-lb%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get service web-lb -n web</code></pre></figure>\n<p><code>EXTERNAL-IP</code> fills in with a node address. Port 80 through <code>localhost:8080</code> is already taken by Traefik, so\nfor a second LoadBalancer Service use another port (<code>--port=8081</code>) and add a matching <code>--port</code> mapping when\ncreating the cluster, or just use <code>kubectl port-forward</code>.</p>\n<h3 id=\"62-metrics-and-pod-autoscaling\"><a class=\"anchor\" href=\"#62-metrics-and-pod-autoscaling\" aria-label=\"Link to this section\">#</a>6.2 Metrics and pod autoscaling</h3>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20top%20nodes%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl top nodes</code></pre></figure>\n<p>Works after about a minute (metrics-server is bundled). Then autoscale the pods. The autoscaler needs the pods\nto declare a CPU request:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20set%20resources%20deployment%20web%20--requests%3Dcpu%3D50m%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl <span class=\"hljs-built_in\">set</span> resources deployment web --requests=cpu=50m -n web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20autoscale%20deployment%20web%20--cpu%3D50%25%20--min%3D2%20--max%3D6%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl autoscale deployment web --cpu=50% --min=2 --max=6 -n web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20hpa%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get hpa -n web</code></pre></figure>\n<p>Shows current vs target CPU. It adds pods under load, up to 6, and removes them again. That is <strong>pod</strong>\nautoscaling, which works as it does on GKE. Node autoscaling does not exist here.</p>\n<h3 id=\"63-your-own-images\"><a class=\"anchor\" href=\"#63-your-own-images\" aria-label=\"Link to this section\">#</a>6.3 Your own images</h3>\n<p>Two ways, as in <a href=\"/blog/run-your-image\">Run your own image in the cluster</a>, and both are simpler on k3d.</p>\n<p><strong>Copy the image into the nodes</strong> (the equivalent of <code>kind load</code>):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22k3d%20image%20import%20my-app%3Av1%20-c%20local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>k3d image import my-app:v1 -c local-cluster-1</code></pre></figure>\n<p><strong>Or use the registry</strong> created with the cluster. Push from your terminal:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20build%20-t%20localhost%3A5001%2Fmy-app%3Av1%20.%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker build -t localhost:5001/my-app:v1 .</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20push%20localhost%3A5001%2Fmy-app%3Av1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker push localhost:5001/my-app:v1</code></pre></figure>\n<p>Inside the cluster the same registry has another name (a node&#39;s <code>localhost</code> is the node itself), and k3d has\nalready set up the mirror on every node. That replaces the manual registry steps in Part 1.2 of\n<a href=\"/blog/run-your-image\">Run your own image in the cluster</a>:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20deployment%20my-app%20--image%3Dk3d-local-registry%3A5000%2Fmy-app%3Av1%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create deployment my-app --image=k3d-local-registry:5000/my-app:v1 -n web</code></pre></figure>\n<h3 id=\"64-dashboard\"><a class=\"anchor\" href=\"#64-dashboard\" aria-label=\"Link to this section\">#</a>6.4 Dashboard</h3>\n<p>Open Headlamp from Applications. It lists your kubeconfig&#39;s contexts; pick <code>k3d-local-cluster-1</code>. It shows\nnodes, namespaces, pods, logs and events: the nearest thing to the Cloud Console here.</p>\n<hr>\n<h2 id=\"part-7--stop-start-delete\"><a class=\"anchor\" href=\"#part-7--stop-start-delete\" aria-label=\"Link to this section\">#</a>Part 7 — Stop, start, delete</h2>\n<p>Pause the cluster to free memory, and bring it back:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22k3d%20cluster%20stop%20local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>k3d cluster stop local-cluster-1</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22k3d%20cluster%20start%20local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>k3d cluster start local-cluster-1</code></pre></figure>\n<p>Remove the cluster. This also removes its kubectl context:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22k3d%20cluster%20delete%20local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>k3d cluster delete local-cluster-1</code></pre></figure>\n<p>The registry container created with <code>--registry-create</code> may be left behind. Remove it too:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20rm%20-f%20k3d-local-registry%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker <span class=\"hljs-built_in\">rm</span> -f k3d-local-registry</code></pre></figure>\n<p><strong>Check:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22k3d%20cluster%20list%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>k3d cluster list</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20ps%20-a%20--format%20'table%20%7B%7B.Names%7D%7D%5C%5Ct%7B%7B.Status%7D%7D'%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker ps -a --format <span class=\"hljs-string\">&#x27;table {{.Names}}\\t{{.Status}}&#x27;</span></code></pre></figure>\n<p>No <code>k3d-…</code> containers should remain. If a stale context is left in your kubeconfig, remove it as in\n<a href=\"/blog/clean-up\">Stop, shut down and clean up</a>, using the name <code>k3d-local-cluster-1</code>.</p>\n";
var k3d_cluster_default = {
	slug: slug$4,
	title: title$4,
	description: description$4,
	order: 4,
	tags: tags$4,
	date: date$4,
	minutes: 16,
	words: words$4,
	toc: toc$4,
	html: html$4
};
//#endregion
//#region src/blog/generated/posts/kind-cluster.json
var kind_cluster_exports = /* @__PURE__ */ __exportAll({
	date: () => date$3,
	default: () => kind_cluster_default,
	description: () => description$3,
	html: () => html$3,
	minutes: () => 13,
	order: () => 3,
	slug: () => slug$3,
	tags: () => tags$3,
	title: () => title$3,
	toc: () => toc$3,
	words: () => words$3
});
var slug$3 = "kind-cluster";
var title$3 = "Create a local Kubernetes cluster with kind";
var description$3 = "From nothing to a running multi-node cluster: install the tools, create local-cluster-1, switch kubectl to it, make namespaces.";
var tags$3 = ["kind"];
var date$3 = "2026-10-14";
var words$3 = 1474;
var toc$3 = [
	{
		"depth": 2,
		"id": "part-1--prepare-the-machine",
		"text": "Part 1 — Prepare the machine"
	},
	{
		"depth": 2,
		"id": "part-2--create-the-cluster",
		"text": "Part 2 — Create the cluster"
	},
	{
		"depth": 2,
		"id": "part-3--switch-to-the-cluster",
		"text": "Part 3 — Switch to the cluster"
	},
	{
		"depth": 2,
		"id": "part-4--the-nodes",
		"text": "Part 4 — The nodes"
	},
	{
		"depth": 2,
		"id": "part-5--namespaces",
		"text": "Part 5 — Namespaces"
	},
	{
		"depth": 2,
		"id": "where-next",
		"text": "Where next"
	}
];
var html$3 = "<p>From nothing to a running multi-node cluster with namespaces ready for your apps: install the tools, create the\ncluster <code>local-cluster-1</code>, switch kubectl to it, look at the nodes, make namespaces. Every command is here, one\nper line, with what it does and what you should see. Nothing depends on a script: you type (or paste) each\ncommand yourself.</p>\n<p>New to the words (node, context, namespace)? Read <a href=\"/blog/concepts\">Concepts: what each piece is</a> first, or alongside.</p>\n<p><strong>Two habits that save time</strong></p>\n<ul>\n<li><strong>Paste one command at a time.</strong> Long lines sometimes wrap in the terminal and run as two broken halves.\nEvery command below is kept short for that reason.</li>\n<li><strong>Run the check at the end of each part</strong> before moving on. If the output differs, stop and re-check the\nprevious command before going further.</li>\n</ul>\n<p>The names used throughout (change them if you like, but change them everywhere):</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Thing</th><th>Name</th></tr></thead><tbody><tr><td>Cluster</td><td><code>local-cluster-1</code></td></tr>\n<tr><td>kubectl context</td><td><code>kind-local-cluster-1</code> (kind always adds the <code>kind-</code> prefix)</td></tr>\n<tr><td>Nodes</td><td><code>local-cluster-1-control-plane</code>, <code>local-cluster-1-worker</code>, <code>local-cluster-1-worker2</code></td></tr>\n<tr><td>Namespaces</td><td><code>web</code>, <code>cache</code>, <code>db</code></td></tr></tbody></table></div>\n<hr>\n<h2 id=\"part-1--prepare-the-machine\"><a class=\"anchor\" href=\"#part-1--prepare-the-machine\" aria-label=\"Link to this section\">#</a>Part 1 — Prepare the machine</h2>\n<p><strong>1.1 Start Docker.</strong> kind runs every Kubernetes node as a Docker container, so Docker must be running.\nOpen Docker Desktop and wait until it says it is running, then:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20info%20--format%20'%7B%7B.ServerVersion%7D%7D'%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker info --format <span class=\"hljs-string\">&#x27;{{.ServerVersion}}&#x27;</span></code></pre></figure>\n<p>Prints a version number (for example <code>29.8.2</code>). An error like &quot;Cannot connect to the Docker daemon&quot; means\nDocker is not up yet.</p>\n<p><strong>1.2 Give Docker enough memory.</strong> Docker Desktop → Settings → Resources. Three nodes need roughly\n<strong>4 GB or more</strong>; 8 GB is comfortable. Apply &amp; restart, then check what Docker actually has:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20info%20--format%20'%7B%7B.MemTotal%7D%7D'%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker info --format <span class=\"hljs-string\">&#x27;{{.MemTotal}}&#x27;</span></code></pre></figure>\n<p>A number in bytes (<code>8000000000</code> ≈ 8 GB).</p>\n<p><strong>1.3 Install the tools</strong> (macOS with Homebrew):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>brew install kind kubectl</code></pre></figure>\n<ul>\n<li><code>kind</code> — creates and deletes the cluster.</li>\n<li><code>kubectl</code> — the command you use to talk to any Kubernetes cluster. (Docker Desktop may already provide\none; if <code>kubectl version --client</code> works you can skip this.)</li>\n</ul>\n<p><strong>Check:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kind%20version%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kind version</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20version%20--client%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl version --client</code></pre></figure>\n<p>Both print a version. Nothing else is needed for this guide.</p>\n<hr>\n<h2 id=\"part-2--create-the-cluster\"><a class=\"anchor\" href=\"#part-2--create-the-cluster\" aria-label=\"Link to this section\">#</a>Part 2 — Create the cluster</h2>\n<p><strong>2.1 Write the cluster description.</strong> kind builds whatever a small YAML file describes. This one asks for\none control-plane node and two worker nodes:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20kind-config.yaml%20%3C%3C'EOF'%22%2C%22kind%3A%20Cluster%22%2C%22apiVersion%3A%20kind.x-k8s.io%2Fv1alpha4%22%2C%22name%3A%20local-cluster-1%22%2C%22nodes%3A%22%2C%22%20%20-%20role%3A%20control-plane%22%2C%22%20%20%20%20extraPortMappings%3A%22%2C%22%20%20%20%20%20%20-%20containerPort%3A%2030080%22%2C%22%20%20%20%20%20%20%20%20hostPort%3A%208080%22%2C%22%20%20%20%20%20%20%20%20listenAddress%3A%20%5C%22127.0.0.1%5C%22%22%2C%22%20%20-%20role%3A%20worker%22%2C%22%20%20-%20role%3A%20worker%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; kind-config.yaml &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nname: local-cluster-1\nnodes:\n  - role: control-plane\n    extraPortMappings:\n      - containerPort: 30080\n        hostPort: 8080\n        listenAddress: <span class=\"hljs-string\">&quot;127.0.0.1&quot;</span>\n  - role: worker\n  - role: worker\nEOF</code></pre></figure>\n<p>Line by line:</p>\n<ul>\n<li><code>name: local-cluster-1</code> — the cluster&#39;s name. It becomes the prefix of the node containers and the\nsuffix of the kubectl context.</li>\n<li><code>role: control-plane</code> — the &quot;brain&quot; node: API server, scheduler, etcd.</li>\n<li><code>role: worker</code> (twice) — nodes that run your pods. Two lines, two workers.</li>\n<li><code>extraPortMappings</code> — opens a door from your Mac into the cluster: Mac port <code>8080</code> → port <code>30080</code> on the\nnode. It is used in Part 2.3 of <a href=\"/blog/deploy-apps\">Deploy apps into your namespaces, one at a time</a>. It can only be set <strong>now</strong>, when the cluster is created.</li>\n</ul>\n<p><strong>kind cannot add a node to a running cluster.</strong> To change the number of nodes, edit this file, delete the\ncluster (<a href=\"/blog/clean-up\">Stop, shut down and clean up</a>) and create it again. That takes about a minute, so experiment freely.</p>\n<p><strong>2.2 Create it</strong> (one to two minutes the first time: kind downloads a node image of about 1 GB):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kind%20create%20cluster%20--config%20kind-config.yaml%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kind create cluster --config kind-config.yaml</code></pre></figure>\n<p>It prints a checklist (Preparing nodes, Writing configuration, Starting control-plane, Joining worker\nnodes…) and ends with <code>Set kubectl context to &quot;kind-local-cluster-1&quot;</code>.</p>\n<p><strong>2.3 Look at what Docker now has.</strong> Each node is one container:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20ps%20--format%20'table%20%7B%7B.Names%7D%7D%5C%5Ct%7B%7B.Status%7D%7D'%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker ps --format <span class=\"hljs-string\">&#x27;table {{.Names}}\\t{{.Status}}&#x27;</span></code></pre></figure>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>NAMES                           STATUS\nlocal-cluster-1-worker2         Up ...\nlocal-cluster-1-worker          Up ...\nlocal-cluster-1-control-plane   Up ...</code></pre></figure>\n<p>And kind&#39;s own view:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kind%20get%20clusters%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kind get clusters</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kind%20get%20nodes%20--name%20local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kind get nodes --name local-cluster-1</code></pre></figure>\n<p><strong>Check:</strong> <code>kind get clusters</code> lists <code>local-cluster-1</code>, and three node containers are <code>Up</code>.</p>\n<hr>\n<h2 id=\"part-3--switch-to-the-cluster\"><a class=\"anchor\" href=\"#part-3--switch-to-the-cluster\" aria-label=\"Link to this section\">#</a>Part 3 — Switch to the cluster</h2>\n<p>kubectl keeps a list of clusters it can talk to (the <strong>kubeconfig</strong>, <code>~/.kube/config</code>). Each entry is a\n<strong>context</strong>: a cluster plus a user. Every kubectl command goes to the <strong>current</strong> context.</p>\n<blockquote>\n<p><strong>Why this part matters.</strong> If your kubeconfig also holds a cloud or work cluster, a command meant for\nyour toy cluster will happily run against that one. Always know the current context.</p>\n</blockquote>\n<p><strong>3.1 List the contexts</strong> (<code>*</code> marks the current one):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20get-contexts%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config get-contexts</code></pre></figure>\n<p>You should see <code>kind-local-cluster-1</code> in the list.</p>\n<p><strong>3.2 Show just the current one:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20current-context%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config current-context</code></pre></figure>\n<p><code>kind create cluster</code> already switched to the new cluster, so this normally prints <code>kind-local-cluster-1</code>.</p>\n<p><strong>3.3 Switch to it explicitly</strong> (what you run any time the current context is something else):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20use-context%20kind-local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config use-context kind-local-cluster-1</code></pre></figure>\n<p>Prints <code>Switched to context &quot;kind-local-cluster-1&quot;.</code></p>\n<p><strong>3.4 Confirm it answers:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20cluster-nfo%20--context%20kind-local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl cluster-nfo --context kind-local-cluster-1</code></pre></figure>\n<p>Prints the API server address (<code>https://127.0.0.1:&lt;random port&gt;</code>) and CoreDNS.</p>\n<p><strong>3.5 A safety habit.</strong> Add <code>--context</code> to a single command to aim it without switching:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20--context%20kind-local-cluster-1%20get%20nodes%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl --context kind-local-cluster-1 get nodes</code></pre></figure>\n<p><strong>Check:</strong> <code>kubectl config current-context</code> prints <code>kind-local-cluster-1</code>.</p>\n<hr>\n<h2 id=\"part-4--the-nodes\"><a class=\"anchor\" href=\"#part-4--the-nodes\" aria-label=\"Link to this section\">#</a>Part 4 — The nodes</h2>\n<p><strong>4.1 See them:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20nodes%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get nodes</code></pre></figure>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>NAME                            STATUS   ROLES           AGE   VERSION\nlocal-cluster-1-control-plane   Ready    control-plane   2m    v1.xx.x\nlocal-cluster-1-worker          Ready    &lt;none&gt;          2m    v1.xx.x\nlocal-cluster-1-worker2         Ready    &lt;none&gt;          2m    v1.xx.x</code></pre></figure>\n<p>All three must be <code>Ready</code>. (<code>ROLES &lt;none&gt;</code> on a worker is normal.)</p>\n<p><strong>4.2 More detail</strong>: internal IPs, OS, container runtime:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20nodes%20-o%20wide%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get nodes -o wide</code></pre></figure>\n<p><strong>4.3 Label the workers.</strong> A label is a sticky note on an object. On its own it does nothing; it only matters\nwhen a pod asks for it. In Part 1.3 of <a href=\"/blog/deploy-apps\">Deploy apps into your namespaces, one at a time</a> the Postgres pod says <code>nodeSelector: role: data</code> (&quot;run me only on a node\nlabelled <code>role=data</code>&quot;), so the scheduler puts it on the node labelled that way. A pod with no <code>nodeSelector</code>\ncan land on any worker. These two labels set up that choice; <code>role=app</code> is not used until you write a pod that\nselects it:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20label%20node%20local-cluster-1-worker%20role%3Dapp%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl label node local-cluster-1-worker role=app</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20label%20node%20local-cluster-1-worker2%20role%3Ddata%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl label node local-cluster-1-worker2 role=data</code></pre></figure>\n<p><strong>Check:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20nodes%20--show-labels%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get nodes --show-labels</code></pre></figure>\n<p>The two workers show <code>role=app</code> and <code>role=data</code> among their labels.</p>\n<p><strong>4.4 Why pods never land on the control-plane.</strong> A label lets a pod choose a node. A <em>taint</em> works the other\nway round: it is a &quot;keep out&quot; sign on the node. The scheduler (the part that picks a node for each pod) will\nnot place a pod on a tainted node unless the pod carries a matching permission slip, called a <em>toleration</em>.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20describe%20node%20local-cluster-1-control-plane%20%7C%20grep%20Taints%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl describe node local-cluster-1-control-plane | grep Taints</code></pre></figure>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>Taints:             node-role.kubernetes.io/control-plane:NoSchedule</code></pre></figure>\n<p>A taint is written <code>key=value:effect</code>:</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Part</th><th>Here</th><th>Meaning</th></tr></thead><tbody><tr><td>key</td><td><code>node-role.kubernetes.io/control-plane</code></td><td>the name of the taint</td></tr>\n<tr><td>value</td><td>(empty)</td><td>not needed, the key says it all</td></tr>\n<tr><td>effect</td><td><code>NoSchedule</code></td><td>what the taint does</td></tr></tbody></table></div>\n<p>The three effects:</p>\n<ul>\n<li><code>NoSchedule</code> — new pods without a toleration are not placed here. Pods already running stay.</li>\n<li><code>PreferNoSchedule</code> — a soft version: avoided, but used if nothing else fits.</li>\n<li><code>NoExecute</code> — also evicts pods already running there that do not tolerate it.</li>\n</ul>\n<p><strong>Why the control-plane has one.</strong> It runs the cluster&#39;s brain (API server, scheduler, etcd). If your apps\nshared the node and used up its CPU or memory, the whole cluster could slow down or stop answering. The\ncluster&#39;s own components carry the toleration, so they can run there. Your pods do not, so they only run on\nthe workers.</p>\n<p><strong>A single-node cluster is different.</strong> With only a control-plane node, kind removes this taint, because\nthere would be nowhere else to run pods. The taint is present in this 3-node config, not always.</p>\n<p><strong>Running a pod on the control-plane anyway.</strong> Give the pod a toleration:</p>\n<figure class=\"code\" data-lang=\"yaml\"><figcaption><span class=\"lang\">yaml</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-attr\">spec:</span>\n  <span class=\"hljs-attr\">tolerations:</span>\n    <span class=\"hljs-bullet\">-</span> <span class=\"hljs-attr\">key:</span> <span class=\"hljs-string\">node-role.kubernetes.io/control-plane</span>\n      <span class=\"hljs-attr\">operator:</span> <span class=\"hljs-string\">Exists</span>\n      <span class=\"hljs-attr\">effect:</span> <span class=\"hljs-string\">NoSchedule</span></code></pre></figure>\n<p>Each field says how to match a taint:</p>\n<ul>\n<li><code>key</code> — which taint this toleration is for.</li>\n<li><code>effect</code> — which effect it covers. Leave it out and it covers every effect of that key.</li>\n<li><code>operator</code> — how the key (and value) are compared. Table below.</li>\n</ul>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>operator</th><th>Matches when</th><th><code>value</code></th></tr></thead><tbody><tr><td><code>Exists</code></td><td>the node has a taint with that key, whatever its value</td><td>leave it out</td></tr>\n<tr><td><code>Equal</code> (the default)</td><td>the key <strong>and</strong> the value are both the same</td><td>required</td></tr></tbody></table></div>\n<p><code>Exists</code> fits here because the control-plane taint has no value. <code>Equal</code> fits a taint that has one, such as\n<code>dedicated=data:NoSchedule</code>: the toleration then says <code>key: dedicated</code>, <code>operator: Equal</code>, <code>value: data</code>.\nAn <code>Exists</code> toleration with no <code>key</code> at all matches every taint, a pass for the whole cluster; use it\nonly for system components.</p>\n<p>A toleration is permission, not a command. It lets a pod onto a tainted node but does not send it there. To\nsend it, add a <code>nodeSelector</code> as well.</p>\n<p>Or remove the taint from the node. The trailing <code>-</code> means &quot;delete this taint&quot;:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20taint%20node%20local-cluster-1-control-plane%20node-role.kubernetes.io%2Fcontrol-plane%3ANoSchedule-%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl taint node local-cluster-1-control-plane node-role.kubernetes.io/control-plane:NoSchedule-</code></pre></figure>\n<p>Not something to do routinely; it is mainly useful on very small clusters.</p>\n<hr>\n<h2 id=\"part-5--namespaces\"><a class=\"anchor\" href=\"#part-5--namespaces\" aria-label=\"Link to this section\">#</a>Part 5 — Namespaces</h2>\n<p>A namespace is a folder inside the cluster. Names only have to be unique within one, and you can look at\none folder at a time. Create the three used below:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20namespace%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create namespace web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20namespace%20cache%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create namespace cache</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20namespace%20db%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create namespace db</code></pre></figure>\n<p><strong>Check:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20namespaces%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get namespaces</code></pre></figure>\n<p><code>web</code>, <code>cache</code> and <code>db</code> are there, next to the built-in <code>default</code>, <code>kube-system</code>, <code>kube-public</code> and\n<code>kube-node-lease</code>.</p>\n<p>Every later command carries <code>-n &lt;namespace&gt;</code> to say which folder it means. Leave it off and kubectl uses\n<code>default</code>. (To change that default for the current context: <code>kubectl config set-context --current --namespace=web</code>. This guide always spells out <code>-n</code>, so you can skip it.)</p>\n<hr>\n<h2 id=\"where-next\"><a class=\"anchor\" href=\"#where-next\" aria-label=\"Link to this section\">#</a>Where next</h2>\n<ul>\n<li>Deploy apps into the namespaces: <a href=\"/blog/deploy-apps\">Deploy apps into your namespaces, one at a time</a></li>\n<li>Run an image you built yourself: <a href=\"/blog/run-your-image\">Run your own image in the cluster</a></li>\n<li>Prefer a cluster whose nodes you can add and remove live: <a href=\"/blog/k3d-cluster\">Create a local Kubernetes cluster with k3d</a></li>\n<li>Stop or remove it all: <a href=\"/blog/clean-up\">Stop, shut down and clean up</a></li>\n</ul>\n";
var kind_cluster_default = {
	slug: slug$3,
	title: title$3,
	description: description$3,
	order: 3,
	tags: tags$3,
	date: date$3,
	minutes: 13,
	words: words$3,
	toc: toc$3,
	html: html$3
};
//#endregion
//#region src/blog/generated/posts/run-your-image.json
var run_your_image_exports = /* @__PURE__ */ __exportAll({
	date: () => date$2,
	default: () => run_your_image_default,
	description: () => description$2,
	html: () => html$2,
	minutes: () => 11,
	order: () => 5,
	slug: () => slug$2,
	tags: () => tags$2,
	title: () => title$2,
	toc: () => toc$2,
	words: () => words$2
});
var slug$2 = "run-your-image";
var title$2 = "Run your own image in the cluster";
var description$2 = "Get an image you built into the cluster with kind load or a local registry, then update it.";
var tags$2 = ["docker", "images"];
var date$2 = "2026-10-14";
var words$2 = 1218;
var toc$2 = [
	{
		"depth": 2,
		"id": "part-1--run-your-own-image",
		"text": "Part 1 — Run your own image"
	},
	{
		"depth": 3,
		"id": "11-the-quick-way-copy-the-image-into-the-nodes",
		"text": "1.1 The quick way: copy the image into the nodes"
	},
	{
		"depth": 3,
		"id": "12-the-proper-way-a-local-registry",
		"text": "1.2 The proper way: a local registry"
	},
	{
		"depth": 2,
		"id": "part-2--habits-and-gotchas-worth-knowing",
		"text": "Part 2 — Habits and gotchas worth knowing"
	},
	{
		"depth": 2,
		"id": "where-next",
		"text": "Where next"
	}
];
var html$2 = "<p>Get an image you built into the cluster and run it, then update it. Two ways: copy it straight into the nodes,\nor push it to a small local registry. This assumes the cluster from\n<a href=\"/blog/kind-cluster\">Create a local Kubernetes cluster with kind</a> is running and the namespace <code>web</code> exists. The k3d version\nof the registry is in <a href=\"/blog/k3d-cluster\">Create a local Kubernetes cluster with k3d</a>.</p>\n<h2 id=\"part-1--run-your-own-image\"><a class=\"anchor\" href=\"#part-1--run-your-own-image\" aria-label=\"Link to this section\">#</a>Part 1 — Run your own image</h2>\n<p><strong>The problem.</strong> An image you build with <code>docker build</code> lives in your local machine&#39;s Docker. The kind nodes\nare separate containers with their own image store, and they pull images from registries on the network\n(Docker Hub and the like). They cannot see your local machine&#39;s image list. So <code>kubectl create deployment my-app --image=my-app:v1</code> fails with <code>ErrImagePull</code>: the node looks for <code>my-app:v1</code> on Docker Hub and finds\nnothing. Two ways to bridge that.</p>\n<h3 id=\"11-the-quick-way-copy-the-image-into-the-nodes\"><a class=\"anchor\" href=\"#11-the-quick-way-copy-the-image-into-the-nodes\" aria-label=\"Link to this section\">#</a>1.1 The quick way: copy the image into the nodes</h3>\n<p><code>kind load</code> copies an image from your local Docker straight into every node&#39;s image store, so no registry is\ninvolved. This walkthrough builds a tiny image of your own, loads it, runs it and updates it.</p>\n<p><strong>1. Make an image to work with.</strong> A folder with a two-line Dockerfile: nginx with its home page replaced:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22mkdir%20my-app%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">mkdir</span> my-app</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22cat%20%3E%20my-app%2FDockerfile%20%3C%3C'EOF'%22%2C%22FROM%20nginx%3A1.27%22%2C%22RUN%20echo%20'%3Ch1%3Ehello%20from%20my-app%20v1%3C%2Fh1%3E'%20%3E%20%2Fusr%2Fshare%2Fnginx%2Fhtml%2Findex.html%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">cat</span> &gt; my-app/Dockerfile &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\nFROM nginx:1.27\nRUN <span class=\"hljs-built_in\">echo</span> <span class=\"hljs-string\">&#x27;&lt;h1&gt;hello from my-app v1&lt;/h1&gt;&#x27;</span> &gt; /usr/share/nginx/html/index.html\nEOF</code></pre></figure>\n<p><strong>2. Build it</strong> with a specific tag. <code>-t my-app:v1</code> means name <code>my-app</code>, tag <code>v1</code>; the final <code>my-app</code> is the\nfolder holding the Dockerfile:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20build%20-t%20my-app%3Av1%20my-app%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker build -t my-app:v1 my-app</code></pre></figure>\n<p><strong>3. Copy it into the cluster&#39;s nodes:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kind%20load%20docker-image%20my-app%3Av1%20--name%20local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kind load docker-image my-app:v1 --name local-cluster-1</code></pre></figure>\n<p><strong>Check</strong> that the nodes now have it:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20exec%20local-cluster-1-worker%20crictl%20images%20%7C%20grep%20my-app%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker <span class=\"hljs-built_in\">exec</span> local-cluster-1-worker crictl images | grep my-app</code></pre></figure>\n<p>A line with <code>docker.io/library/my-app</code> and tag <code>v1</code>. (<code>crictl</code> is the node&#39;s own image tool; <code>kind load</code> put\nthe image on all three nodes, not just this one.)</p>\n<p><strong>4. Run it:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20deployment%20my-app%20--image%3Dmy-app%3Av1%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create deployment my-app --image=my-app:v1 -n web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20rollout%20status%20deployment%2Fmy-app%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl rollout status deployment/my-app -n web</code></pre></figure>\n<p>Kubernetes finds <code>my-app:v1</code> already on the node and does not try to download it. That is the default for any\ntag except <code>latest</code>. For <code>latest</code> (or no tag), Kubernetes always tries to pull, which would fail here. This\nis why the guide uses <code>v1</code>, not <code>latest</code>.</p>\n<p><strong>5. See your page:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20port-forward%20deploy%2Fmy-app%208082%3A80%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl port-forward deploy/my-app 8082:80 -n web</code></pre></figure>\n<p>In another tab:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22curl%20-s%20http%3A%2F%2Flocalhost%3A8082%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>curl -s http://localhost:8082</code></pre></figure>\n<p><code>&lt;h1&gt;hello from my-app v1&lt;/h1&gt;</code>. Stop the tunnel with <code>Ctrl-C</code>.</p>\n<p><strong>6. Ship a change.</strong> The node keeps the image it already has under a given tag, so re-loading the same tag\ndoes not update running pods. Use a <strong>new tag</strong> each time: rebuild as <code>v2</code>, load it, point the Deployment at it:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>sed -i <span class=\"hljs-string\">&#x27;&#x27;</span> <span class=\"hljs-string\">&#x27;s/v1/v2/&#x27;</span> my-app/Dockerfile</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20build%20-t%20my-app%3Av2%20my-app%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker build -t my-app:v2 my-app</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kind%20load%20docker-image%20my-app%3Av2%20--name%20local-cluster-1%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kind load docker-image my-app:v2 --name local-cluster-1</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20set%20image%20deployment%2Fmy-app%20my-app%3Dmy-app%3Av2%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl <span class=\"hljs-built_in\">set</span> image deployment/my-app my-app=my-app:v2 -n web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20rollout%20status%20deployment%2Fmy-app%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl rollout status deployment/my-app -n web</code></pre></figure>\n<p><code>kubectl set image deployment/my-app my-app=my-app:v2</code> reads as: in Deployment <code>my-app</code>, set the container\nnamed <code>my-app</code> to image <code>my-app:v2</code>. (<code>create deployment</code> names the container after the image, here <code>my-app</code>,\nwhich happens to match the Deployment&#39;s name. If unsure, <code>kubectl get deploy my-app -n web -o wide</code> shows it\nin the CONTAINERS column.) Kubernetes replaces the pods one at a time. Repeat the port-forward and <code>curl</code> to see\n<code>v2</code>.</p>\n<p>The <code>sed -i &#39;&#39;</code> form is the macOS one; on Linux use <code>sed -i</code> without the quotes.</p>\n<p><strong>If the pod shows <code>ErrImagePull</code> or <code>ImagePullBackOff</code>:</strong> the image was not loaded under that exact name and\ntag, or the tag is <code>latest</code>. Re-run the check in step 3 and compare the name with <code>kubectl get deploy my-app -n web -o jsonpath=&#39;{.spec.template.spec.containers[0].image}&#39;</code>.</p>\n<h3 id=\"12-the-proper-way-a-local-registry\"><a class=\"anchor\" href=\"#12-the-proper-way-a-local-registry\" aria-label=\"Link to this section\">#</a>1.2 The proper way: a local registry</h3>\n<p>A registry is a small container that stores images, like a private Docker Hub on your local machine. Build\nonce, push, and every node pulls from it. Do this when you rebuild often or want to mimic a real setup.</p>\n<p><strong>How it fits together.</strong> The registry is a plain Docker container, not a Kubernetes object, so it is reached\nthrough Docker&#39;s own networking. No NodePort is needed.</p>\n<p><em>Pushing the image (from your terminal):</em></p>\n<ul>\n<li><code>-p 127.0.0.1:5001:5000</code> publishes the container&#39;s port 5000 on your local machine&#39;s port 5001\n(loopback only, so nothing else on your network can reach it).</li>\n<li>Because of that, <code>docker push localhost:5001/my-app:v1</code> from your terminal reaches the registry.</li>\n<li>A NodePort only exposes a Kubernetes Service. This container is not one.</li>\n</ul>\n<p><em>Pulling from the cluster (from the nodes):</em></p>\n<ul>\n<li>A node cannot use <code>localhost:5001</code>, because inside a node <code>localhost</code> is the node itself.</li>\n<li>That is why the registry is connected to kind&#39;s Docker network, so nodes can reach it by name:\n<code>kind-registry:5000</code>.</li>\n<li>Each node also gets a mirror file saying &quot;<code>localhost:5001</code> means <code>http://kind-registry:5000</code>&quot;.</li>\n<li>So pods use the image name <code>localhost:5001/my-app:v1</code>, and the node quietly fetches it from\n<code>kind-registry:5000</code>.</li>\n</ul>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker push localhost:5001/my-app:v1\n  → local machine, port 5001\n  → registry container, port 5000                        (-p 127.0.0.1:5001:5000)\n\npod: image localhost:5001/my-app:v1\n  → node asks &quot;localhost:5001&quot; → mirror file says use http://kind-registry:5000\n  → registry container, over kind&#39;s Docker network       (docker network connect)</code></pre></figure>\n<p><strong>Start the registry</strong> on port 5001 (restarts with Docker):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20run%20-d%20--restart%3Dalways%20-p%20127.0.0.1%3A5001%3A5000%20--network%20bridge%20--name%20kind-registry%20registry%3A2%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker run -d --restart=always -p 127.0.0.1:5001:5000 --network bridge --name kind-registry registry:2</code></pre></figure>\n<p><strong>Put it on kind&#39;s network</strong> so the nodes can reach it by name:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20network%20connect%20kind%20kind-registry%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker network connect kind kind-registry</code></pre></figure>\n<p><strong>Teach every node that</strong> <code>localhost:5001</code> <strong>means the registry.</strong> Inside a node, <code>localhost</code> is the node itself,\nso each node needs a small mirror file. This loop does all three nodes:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-keyword\">for</span> node <span class=\"hljs-keyword\">in</span> $(kind get nodes --name local-cluster-1); <span class=\"hljs-keyword\">do</span>\n  docker <span class=\"hljs-built_in\">exec</span> <span class=\"hljs-string\">&quot;<span class=\"hljs-variable\">$node</span>&quot;</span> <span class=\"hljs-built_in\">mkdir</span> -p /etc/containerd/certs.d/localhost:5001\n  <span class=\"hljs-built_in\">printf</span> <span class=\"hljs-string\">&#x27;[host.&quot;http://kind-registry:5000&quot;]\\n&#x27;</span> | docker <span class=\"hljs-built_in\">exec</span> -i <span class=\"hljs-string\">&quot;<span class=\"hljs-variable\">$node</span>&quot;</span> <span class=\"hljs-built_in\">cp</span> /dev/stdin /etc/containerd/certs.d/localhost:5001/hosts.toml\n<span class=\"hljs-keyword\">done</span></code></pre></figure>\n<p><strong>What the loop does, line by line</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-keyword\">for</span> node <span class=\"hljs-keyword\">in</span> $(kind get nodes --name local-cluster-1); <span class=\"hljs-keyword\">do</span></code></pre></figure>\n<p><code>kind get nodes</code> prints the three node container names. The loop runs everything up to <code>done</code> once per name,\nwith the current name in <code>$node</code>.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22%20%20docker%20exec%20%5C%22%24node%5C%22%20mkdir%20-p%20%2Fetc%2Fcontainerd%2Fcerts.d%2Flocalhost%3A5001%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>  docker <span class=\"hljs-built_in\">exec</span> <span class=\"hljs-string\">&quot;<span class=\"hljs-variable\">$node</span>&quot;</span> <span class=\"hljs-built_in\">mkdir</span> -p /etc/containerd/certs.d/localhost:5001</code></pre></figure>\n<p><code>docker exec &quot;$node&quot; &lt;command&gt;</code> runs a command inside that node&#39;s container. Here it makes a folder named\nafter the registry address, <code>localhost:5001</code>, under <code>/etc/containerd/certs.d</code>. That is the folder containerd\n(the node&#39;s container runtime) reads for per-registry settings when it pulls from <code>localhost:5001</code>. <code>-p</code>\nmeans no error if the folder already exists.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22%20%20printf%20'%5Bhost.%5C%22http%3A%2F%2Fkind-registry%3A5000%5C%22%5D%5C%5Cn'%20%7C%20docker%20exec%20-i%20%5C%22%24node%5C%22%20cp%20%2Fdev%2Fstdin%20%2Fetc%2Fcontainerd%2Fcerts.d%2Flocalhost%3A5001%2Fhosts.toml%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>  <span class=\"hljs-built_in\">printf</span> <span class=\"hljs-string\">&#x27;[host.&quot;http://kind-registry:5000&quot;]\\n&#x27;</span> | docker <span class=\"hljs-built_in\">exec</span> -i <span class=\"hljs-string\">&quot;<span class=\"hljs-variable\">$node</span>&quot;</span> <span class=\"hljs-built_in\">cp</span> /dev/stdin /etc/containerd/certs.d/localhost:5001/hosts.toml</code></pre></figure>\n<p>Three parts joined by <code>|</code>:</p>\n<ul>\n<li><code>printf &#39;[host.&quot;http://kind-registry:5000&quot;]\\n&#39;</code> prints one line of text. It is the whole content of the\nfile.</li>\n<li><code>docker exec -i &quot;$node&quot; cp /dev/stdin &lt;file&gt;</code> runs <code>cp</code> inside the node. <code>-i</code> keeps stdin open, so the\nprinted line flows in through the pipe, and <code>cp /dev/stdin &lt;file&gt;</code> writes it to the file. (This is the\ntrick for writing a file into a container without an editor or a shell redirect.)</li>\n<li>The file is <code>hosts.toml</code>, in the folder from the previous line.</li>\n</ul>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-keyword\">done</span></code></pre></figure>\n<p>Ends the loop.</p>\n<p><strong>The file it creates</strong> has one line, <code>[host.&quot;http://kind-registry:5000&quot;]</code>. Read it as: &quot;for images from\n<code>localhost:5001</code>, connect to the host <code>http://kind-registry:5000</code>&quot;. It uses plain <code>http</code>, so no certificate\nsetup is needed. Every node needs its own copy, which is why the loop runs three times.</p>\n<p>This requires containerd to read that folder. If your kind version does not enable it by default, add this\nto <code>kind-config.yaml</code> <strong>before</strong> creating the cluster (the cluster must be re-created):</p>\n<figure class=\"code\" data-lang=\"yaml\"><figcaption><span class=\"lang\">yaml</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-attr\">containerdConfigPatches:</span>\n  <span class=\"hljs-bullet\">-</span> <span class=\"hljs-string\">|-\n    [plugins.&quot;io.containerd.grpc.v1.cri&quot;.registry]\n      config_path = &quot;/etc/containerd/certs.d&quot;</span></code></pre></figure>\n<p><strong>Prove it:</strong> push an image and run it from the registry.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20pull%20busybox%3A1.36%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker pull busybox:1.36</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20tag%20busybox%3A1.36%20localhost%3A5001%2Fbusybox%3A1.36%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker tag busybox:1.36 localhost:5001/busybox:1.36</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22docker%20push%20localhost%3A5001%2Fbusybox%3A1.36%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>docker push localhost:5001/busybox:1.36</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20run%20regcheck%20-n%20web%20--rm%20-i%20--restart%3DNever%20--image%3Dlocalhost%3A5001%2Fbusybox%3A1.36%20--%20echo%20it-works%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl run regcheck -n web --<span class=\"hljs-built_in\">rm</span> -i --restart=Never --image=localhost:5001/busybox:1.36 -- <span class=\"hljs-built_in\">echo</span> it-works</code></pre></figure>\n<p>Prints <code>it-works</code>. From now on, <code>docker build -t localhost:5001/my-app:v1 .</code> and <code>docker push localhost:5001/my-app:v1</code> is the whole loop, and your manifests use <code>image: localhost:5001/my-app:v1</code>.</p>\n<hr>\n<h2 id=\"part-2--habits-and-gotchas-worth-knowing\"><a class=\"anchor\" href=\"#part-2--habits-and-gotchas-worth-knowing\" aria-label=\"Link to this section\">#</a>Part 2 — Habits and gotchas worth knowing</h2>\n<ul>\n<li><strong>Never use the</strong> <code>latest</code> <strong>tag for local images.</strong> Kubernetes then always tries to pull, and fails for an\nimage that exists only on your Mac (<code>ErrImagePull</code>). A specific tag plus <code>IfNotPresent</code>, or a registry,\navoids it.</li>\n<li><strong>Describe before guessing.</strong> <code>kubectl describe pod &lt;name&gt; -n &lt;ns&gt;</code> ends with an <em>Events</em> list that says\nwhat went wrong (image not found, no node fits, probe failing).</li>\n<li><strong>A Service is not a pod.</strong> <code>port-forward</code> to a Service needs a Service that has pods behind it. A Service\nof type <code>ExternalName</code> is only a nickname for another DNS name and cannot be forwarded.</li>\n<li><strong>Data is disposable.</strong> Pod storage vanishes with the pod unless you add a volume. Fine for a lab.</li>\n<li><strong>The cluster survives a Mac restart</strong> once Docker Desktop is back. If kubectl cannot connect, start the node\ncontainers again: see Part 2 of <a href=\"/blog/clean-up\">Stop, shut down and clean up</a>.</li>\n</ul>\n<hr>\n<h2 id=\"where-next\"><a class=\"anchor\" href=\"#where-next\" aria-label=\"Link to this section\">#</a>Where next</h2>\n<ul>\n<li>Deploy more apps and place them on nodes: <a href=\"/blog/deploy-apps\">Deploy apps into your namespaces, one at a time</a></li>\n<li>Stop or remove it all: <a href=\"/blog/clean-up\">Stop, shut down and clean up</a></li>\n</ul>\n";
var run_your_image_default = {
	slug: slug$2,
	title: title$2,
	description: description$2,
	order: 5,
	tags: tags$2,
	date: date$2,
	minutes: 11,
	words: words$2,
	toc: toc$2,
	html: html$2
};
//#endregion
//#region src/blog/generated/posts/start-here.json
var start_here_exports = /* @__PURE__ */ __exportAll({
	date: () => date$1,
	default: () => start_here_default,
	description: () => description$1,
	html: () => html$1,
	minutes: () => 4,
	order: () => 0,
	slug: () => slug$1,
	tags: () => tags$1,
	title: () => title$1,
	toc: () => toc$1,
	words: () => 679
});
var slug$1 = "start-here";
var title$1 = "Local Kubernetes with kind and k3d: start here";
var description$1 = "What this learning lab covers, in which order to read it, and the one rule to follow before you run anything.";
var tags$1 = ["overview"];
var date$1 = "2026-10-16";
var toc$1 = [
	{
		"depth": 2,
		"id": "read-in-this-order",
		"text": "Read in this order"
	},
	{
		"depth": 2,
		"id": "try-it-in-your-browser",
		"text": "Try it in your browser"
	},
	{
		"depth": 2,
		"id": "the-whole-thing-on-one-page",
		"text": "The whole thing on one page"
	},
	{
		"depth": 2,
		"id": "what-you-need",
		"text": "What you need"
	},
	{
		"depth": 2,
		"id": "one-rule-before-you-start",
		"text": "One rule before you start"
	}
];
var html$1 = "<p>How to run a real, multi-node Kubernetes cluster on your own computer, using <strong>kind</strong> or <strong>k3d</strong> (Kubernetes in\nDocker), then deploy apps into it, one at a time, into namespaces you choose. It is a learning lab: cheap to\nbuild, safe to break, gone in one command.</p>\n<p>Written from a working setup on macOS (Apple Silicon, Docker Desktop, Homebrew). The idea is general: only\nthe install commands are macOS-specific.</p>\n<h2 id=\"read-in-this-order\"><a class=\"anchor\" href=\"#read-in-this-order\" aria-label=\"Link to this section\">#</a>Read in this order</h2>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>File</th><th>What it gives you</th></tr></thead><tbody><tr><td><a href=\"/blog/concepts\">Concepts: what each piece is</a></td><td>The words and ideas: kind, nodes, taints, contexts and kubeconfig, namespaces (including <code>kube-system</code>, <code>kube-public</code>, <code>kube-node-lease</code>), pods, Services. Read once, come back as needed.</td></tr>\n<tr><td><a href=\"/blog/users-and-permissions\">Users and permissions: who may do what, in which namespace</a></td><td>Who may do what in which namespace: RBAC (Roles, bindings, ServiceAccounts), hands-on users and groups, and the layers of a complete cluster ACL.</td></tr>\n<tr><td><a href=\"/blog/kind-cluster\">Create a local Kubernetes cluster with kind</a></td><td>Install the tools, create the 3-node cluster <code>local-cluster-1</code> with kind, switch to it, look at the nodes, make namespaces.</td></tr>\n<tr><td><a href=\"/blog/k3d-cluster\">Create a local Kubernetes cluster with k3d</a></td><td>The same with k3d, plus what k3d adds: live node add/remove, load balancer, ingress, metrics, a built-in registry, a dashboard.</td></tr>\n<tr><td><a href=\"/blog/run-your-image\">Run your own image in the cluster</a></td><td>Get an image you built into the cluster and run it: <code>kind load</code>, or a local registry.</td></tr>\n<tr><td><a href=\"/blog/deploy-apps\">Deploy apps into your namespaces, one at a time</a></td><td>Deploy apps into the namespaces one at a time, place pods on nodes, and use them: port-forward, DNS between namespaces, NodePort, scaling.</td></tr>\n<tr><td><a href=\"/blog/helm-2-chart\">Deploy with a Helm 2 chart: every template, explained</a></td><td>Package an app as a Helm 2 chart and deploy it: every template explained (Deployment, Service, ConfigMap, Secret, image pull secret <code>regsecret</code>, Ingress, autoscaling, hooks and more), plus Tiller setup and a production checklist.</td></tr>\n<tr><td><a href=\"/blog/clean-up\">Stop, shut down and clean up</a></td><td>Delete the namespaces, stop and start the cluster, or shut everything down and remove the kubectl context.</td></tr></tbody></table></div>\n<h2 id=\"try-it-in-your-browser\"><a class=\"anchor\" href=\"#try-it-in-your-browser\" aria-label=\"Link to this section\">#</a>Try it in your browser</h2>\n<p>Every command in these guides can be run first in the <strong>KubeDojo playground</strong>: a simulator of <code>kind</code>, <code>k3d</code>, <code>docker</code>, <code>kubectl</code> and Helm 2 with a live picture of the cluster. Nothing touches your computer, so you can follow along, make mistakes and reset. When it works, the playground can export the same cluster as a setup script for your real machine.</p>\n<p><a href=\"/app\">Open the playground</a></p>\n<p>Start with 01 (kind) or 02 (k3d). After that 03 and 04 work on either, in any order.</p>\n<h2 id=\"the-whole-thing-on-one-page\"><a class=\"anchor\" href=\"#the-whole-thing-on-one-page\" aria-label=\"Link to this section\">#</a>The whole thing on one page</h2>\n<p>What the kind guide builds, with the commands it uses:</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Step</th><th>What happens</th><th>The command</th></tr></thead><tbody><tr><td>1</td><td>Install the tools</td><td><code>brew install kind kubectl</code></td></tr>\n<tr><td>2</td><td>Describe a 3-node cluster named <code>local-cluster-1</code></td><td>write <code>kind-config.yaml</code></td></tr>\n<tr><td>3</td><td>Create it (runs Docker containers as nodes)</td><td><code>kind create cluster --config kind-config.yaml</code></td></tr>\n<tr><td>4</td><td>Point kubectl at it</td><td><code>kubectl config use-context kind-local-cluster-1</code></td></tr>\n<tr><td>5</td><td>Check the nodes</td><td><code>kubectl get nodes</code></td></tr>\n<tr><td>6</td><td>Label the workers to place pods later</td><td><code>kubectl label node &lt;node&gt; role=&lt;value&gt;</code></td></tr>\n<tr><td>7</td><td>Make namespaces</td><td><code>kubectl create namespace &lt;name&gt;</code></td></tr>\n<tr><td>8</td><td>Deploy an app into a namespace</td><td><code>kubectl create deployment &lt;name&gt; --image=&lt;image&gt; -n &lt;namespace&gt;</code></td></tr>\n<tr><td>9</td><td>Give it a stable name</td><td><code>kubectl expose deployment &lt;name&gt; --port=&lt;port&gt; -n &lt;namespace&gt;</code></td></tr>\n<tr><td>10</td><td>Look at it, from your local machine</td><td><code>kubectl get pods -A -o wide</code>, <code>kubectl port-forward</code></td></tr>\n<tr><td>11</td><td>Remove it</td><td><code>kind delete cluster --name local-cluster-1</code></td></tr></tbody></table></div>\n<p>Time: about 15 minutes the first run (most of it downloading images), a couple of minutes after that.</p>\n<h2 id=\"what-you-need\"><a class=\"anchor\" href=\"#what-you-need\" aria-label=\"Link to this section\">#</a>What you need</h2>\n<ul>\n<li>A Mac (or Linux) with <strong>Docker</strong> running, and about <strong>4–8 GB of memory</strong> given to it.</li>\n<li><strong>Homebrew</strong> for the install commands.</li>\n<li>A terminal. Everything is typed commands; no GUI steps except Docker&#39;s settings.</li>\n</ul>\n<h2 id=\"one-rule-before-you-start\"><a class=\"anchor\" href=\"#one-rule-before-you-start\" aria-label=\"Link to this section\">#</a>One rule before you start</h2>\n<p><code>kubectl</code> sends every command to the <strong>current context</strong>. If your computer also has a cloud or work cluster\nin <code>~/.kube/config</code>, that cluster may be the current one. Before any command that changes something:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20current-context%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config current-context</code></pre></figure>\n<p>It should say <code>kind-local-cluster-1</code> (or <code>k3d-local-cluster-1</code>).</p>\n";
var start_here_default = {
	slug: slug$1,
	title: title$1,
	description: description$1,
	order: 0,
	tags: tags$1,
	date: date$1,
	minutes: 4,
	words: 679,
	toc: toc$1,
	html: html$1
};
//#endregion
//#region src/blog/generated/posts/users-and-permissions.json
var users_and_permissions_exports = /* @__PURE__ */ __exportAll({
	date: () => date,
	default: () => users_and_permissions_default,
	description: () => description,
	html: () => html,
	minutes: () => 21,
	order: () => 2,
	slug: () => slug,
	tags: () => tags,
	title: () => title,
	toc: () => toc,
	words: () => words
});
var slug = "users-and-permissions";
var title = "Users and permissions: who may do what, in which namespace";
var description = "Roles, bindings, ServiceAccounts and the layers of a complete access-control setup for a cluster.";
var tags = ["rbac", "security"];
var date = "2026-10-14";
var words = 2173;
var toc = [
	{
		"depth": 2,
		"id": "1-the-big-picture-three-questions-asked-in-order",
		"text": "1. The big picture: three questions, asked in order"
	},
	{
		"depth": 2,
		"id": "2-the-objects",
		"text": "2. The objects"
	},
	{
		"depth": 3,
		"id": "the-one-idea-that-makes-namespace-permissions-work",
		"text": "The one idea that makes namespace permissions work"
	},
	{
		"depth": 3,
		"id": "built-in-clusterroles-worth-knowing",
		"text": "Built-in ClusterRoles worth knowing"
	},
	{
		"depth": 2,
		"id": "3-hands-on-1-a-program-with-limited-access-serviceaccount",
		"text": "3. Hands-on 1: a program with limited access (ServiceAccount)"
	},
	{
		"depth": 2,
		"id": "4-hands-on-2-a-person-with-a-certificate-a-user-in-a-group",
		"text": "4. Hands-on 2: a person with a certificate (a user in a group)"
	},
	{
		"depth": 2,
		"id": "5-what-a-complete-acl-for-a-cluster-consists-of",
		"text": "5. What a complete ACL for a cluster consists of"
	},
	{
		"depth": 3,
		"id": "51-plan-before-you-write-yaml-personas-and-a-matrix",
		"text": "5.1 Plan before you write YAML: personas and a matrix"
	},
	{
		"depth": 3,
		"id": "52-layers-12-bind-the-matrix",
		"text": "5.2 Layers 1–2: bind the matrix"
	},
	{
		"depth": 3,
		"id": "53-layer-3-one-serviceaccount-per-app-with-only-what-it-needs",
		"text": "5.3 Layer 3: one ServiceAccount per app, with only what it needs"
	},
	{
		"depth": 3,
		"id": "54-layer-4-admission--pod-security",
		"text": "5.4 Layer 4: admission — Pod Security"
	},
	{
		"depth": 3,
		"id": "55-layer-5-network--networkpolicy",
		"text": "5.5 Layer 5: network — NetworkPolicy"
	},
	{
		"depth": 3,
		"id": "56-layer-6-resources--quotas",
		"text": "5.6 Layer 6: resources — quotas"
	},
	{
		"depth": 3,
		"id": "57-layer-7-secrets",
		"text": "5.7 Layer 7: secrets"
	},
	{
		"depth": 3,
		"id": "58-layer-8-audit-and-review",
		"text": "5.8 Layer 8: audit and review"
	},
	{
		"depth": 2,
		"id": "6-dangerous-permissions-check-these-before-you-grant",
		"text": "6. Dangerous permissions: check these before you grant"
	},
	{
		"depth": 2,
		"id": "7-on-a-managed-cluster-gke",
		"text": "7. On a managed cluster (GKE)"
	},
	{
		"depth": 2,
		"id": "8-clean-up-the-lab-objects",
		"text": "8. Clean up the lab objects"
	}
];
var html = "<p>How to give people and programs exactly the access they need in each namespace, and nothing more, and what\nmakes up a complete access-control setup (an ACL) for a cluster. Read <a href=\"/blog/concepts\">Concepts: what each piece is</a> first if\nnamespaces, contexts or kubeconfig are new to you.</p>\n<blockquote>\n<p><strong>Not tested yet.</strong> Written from Kubernetes&#39; documented behaviour. The hands-on parts use the kind cluster\n<code>local-cluster-1</code> and the namespaces <code>web</code>, <code>cache</code> and <code>db</code> from\n<a href=\"/blog/kind-cluster\">Create a local Kubernetes cluster with kind</a>; they work the same on k3d. Run them once and fix anything\nthat differs on your version.</p>\n</blockquote>\n<hr>\n<h2 id=\"1-the-big-picture-three-questions-asked-in-order\"><a class=\"anchor\" href=\"#1-the-big-picture-three-questions-asked-in-order\" aria-label=\"Link to this section\">#</a>1. The big picture: three questions, asked in order</h2>\n<p>Every request to the cluster, whether from <code>kubectl</code> or from a program, goes through the API server, which\nasks three questions in a fixed order:</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Question</th><th>Name</th><th>Answered by</th></tr></thead><tbody><tr><td><strong>Who are you?</strong></td><td>Authentication</td><td>Certificates, tokens, or a login provider (OIDC / SSO)</td></tr>\n<tr><td><strong>Are you allowed to do this?</strong></td><td>Authorization</td><td><strong>RBAC</strong> (Roles and bindings): the heart of the ACL</td></tr>\n<tr><td><strong>Is this request acceptable?</strong></td><td>Admission</td><td>Rules about the object itself, such as Pod Security or quotas</td></tr></tbody></table></div>\n<p>A request that fails any step is refused. Most of what follows is about the middle one, RBAC.</p>\n<p>Two facts that surprise people:</p>\n<ul>\n<li><strong>Kubernetes has no user accounts.</strong> There is no <code>kubectl create user</code>. A &quot;user&quot; is simply a name that your\nauthentication method vouches for: the CN field in a certificate, or a name in an SSO token. Kubernetes only\nstores what that name may do.</li>\n<li><strong>RBAC only grants.</strong> There are no &quot;deny&quot; rules. Access is the sum of every rule that matches. No rule means\nno access, which is the safe default.</li>\n</ul>\n<hr>\n<h2 id=\"2-the-objects\"><a class=\"anchor\" href=\"#2-the-objects\" aria-label=\"Link to this section\">#</a>2. The objects</h2>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Object</th><th>Scope</th><th>What it is</th></tr></thead><tbody><tr><td><strong>Role</strong></td><td>one namespace</td><td>A list of permissions: &quot;these verbs on these resources&quot;</td></tr>\n<tr><td><strong>ClusterRole</strong></td><td>whole cluster</td><td>The same, but not tied to a namespace. Also used for cluster-wide resources (nodes, namespaces)</td></tr>\n<tr><td><strong>RoleBinding</strong></td><td>one namespace</td><td>Attaches a Role <strong>or ClusterRole</strong> to a user, group or ServiceAccount, <strong>inside that namespace</strong></td></tr>\n<tr><td><strong>ClusterRoleBinding</strong></td><td>whole cluster</td><td>Attaches a ClusterRole to a subject in <strong>every</strong> namespace</td></tr>\n<tr><td><strong>ServiceAccount</strong></td><td>one namespace</td><td>An identity for a <strong>program</strong> running in a pod (people use users and groups)</td></tr></tbody></table></div>\n<p><strong>A permission is a verb on a resource:</strong></p>\n<figure class=\"code\" data-lang=\"yaml\"><figcaption><span class=\"lang\">yaml</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-attr\">rules:</span>\n  <span class=\"hljs-bullet\">-</span> <span class=\"hljs-attr\">apiGroups:</span> [<span class=\"hljs-string\">&quot;apps&quot;</span>]\n    <span class=\"hljs-attr\">resources:</span> [<span class=\"hljs-string\">&quot;deployments&quot;</span>]\n    <span class=\"hljs-attr\">verbs:</span> [<span class=\"hljs-string\">&quot;get&quot;</span>, <span class=\"hljs-string\">&quot;list&quot;</span>, <span class=\"hljs-string\">&quot;watch&quot;</span>, <span class=\"hljs-string\">&quot;create&quot;</span>, <span class=\"hljs-string\">&quot;update&quot;</span>, <span class=\"hljs-string\">&quot;patch&quot;</span>, <span class=\"hljs-string\">&quot;delete&quot;</span>]</code></pre></figure>\n<ul>\n<li><strong>Verbs:</strong> <code>get</code>, <code>list</code>, <code>watch</code> (read), <code>create</code>, <code>update</code>, <code>patch</code>, <code>delete</code>, <code>deletecollection</code> (write).</li>\n<li><strong>Resources:</strong> <code>pods</code>, <code>services</code>, <code>deployments</code>, <code>secrets</code>, <code>configmaps</code>, and so on. Sub-resources are written\nwith a slash: <code>pods/log</code> (read logs), <code>pods/exec</code> (open a shell), <code>pods/portforward</code>.</li>\n<li><strong>apiGroups:</strong> <code>&quot;&quot;</code> (empty) for the core group (pods, services, secrets, configmaps), <code>apps</code> for\ndeployments, and so on. <code>kubectl api-resources</code> lists each resource with its group.</li>\n</ul>\n<p><strong>Subjects:</strong> who the binding applies to. Three kinds: <code>User</code> (a name), <code>Group</code> (a name that many users share)\nand <code>ServiceAccount</code>.</p>\n<h3 id=\"the-one-idea-that-makes-namespace-permissions-work\"><a class=\"anchor\" href=\"#the-one-idea-that-makes-namespace-permissions-work\" aria-label=\"Link to this section\">#</a>The one idea that makes namespace permissions work</h3>\n<p>A <strong>RoleBinding can point at a ClusterRole</strong>. The ClusterRole defines <em>what</em> (a reusable job description), and\nthe RoleBinding limits <em>where</em> (one namespace). So you write &quot;developer&quot; once and hand it out per namespace:</p>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>ClusterRole  &quot;edit&quot;        what is allowed        (defined once)\nRoleBinding  in ns &quot;web&quot;   alice  →  edit         alice can edit in web only\nRoleBinding  in ns &quot;db&quot;    bob    →  edit         bob can edit in db only</code></pre></figure>\n<h3 id=\"built-in-clusterroles-worth-knowing\"><a class=\"anchor\" href=\"#built-in-clusterroles-worth-knowing\" aria-label=\"Link to this section\">#</a>Built-in ClusterRoles worth knowing</h3>\n<p>You rarely need to write a role from scratch. Kubernetes ships these:</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>ClusterRole</th><th>Lets the subject</th></tr></thead><tbody><tr><td><code>view</code></td><td>Read most objects in the namespace. <strong>Cannot read Secrets</strong></td></tr>\n<tr><td><code>edit</code></td><td>Read and change most objects, <strong>including Secrets</strong>, and run <code>exec</code>. Cannot change roles or bindings</td></tr>\n<tr><td><code>admin</code></td><td>Everything in the namespace, including roles and bindings there, but not the namespace object itself or its quota</td></tr>\n<tr><td><code>cluster-admin</code></td><td>Everything, everywhere. Bound at cluster level it is root</td></tr></tbody></table></div>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20clusterroles%20%7C%20grep%20-vE%20'%5Esystem%3A'%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get clusterroles | grep -vE <span class=\"hljs-string\">&#x27;^system:&#x27;</span></code></pre></figure>\n<p>Lists them (without the many <code>system:</code> internal roles).</p>\n<hr>\n<h2 id=\"3-hands-on-1-a-program-with-limited-access-serviceaccount\"><a class=\"anchor\" href=\"#3-hands-on-1-a-program-with-limited-access-serviceaccount\" aria-label=\"Link to this section\">#</a>3. Hands-on 1: a program with limited access (ServiceAccount)</h2>\n<p>The quickest way to see namespace-scoped permissions work. Create an identity in <code>web</code>, give it a Role in <code>web</code>,\nand test what it can and cannot do. Run as your normal admin context\n(<code>kubectl config current-context</code> shows <code>kind-local-cluster-1</code>).</p>\n<p><strong>3.1 The identity:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20serviceaccount%20dev-alice%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create serviceaccount dev-alice -n web</code></pre></figure>\n<p><strong>3.2 A Role: what is allowed.</strong> Create, read, change and delete pods, Services and Deployments, in <code>web</code>:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20role%20web-developer%20--verb%3Dget%2Clist%2Cwatch%2Ccreate%2Cupdate%2Cpatch%2Cdelete%20--resource%3Dpods%2Cservices%2Cdeployments.apps%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create role web-developer --verb=get,list,watch,create,update,patch,delete --resource=pods,services,deployments.apps -n web</code></pre></figure>\n<p><code>deployments.apps</code> is <code>resource.group</code>: Deployments live in the <code>apps</code> group.</p>\n<p><strong>3.3 A RoleBinding: who gets it, and where:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20rolebinding%20dev-alice-web%20--role%3Dweb-developer%20--serviceaccount%3Dweb%3Adev-alice%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create rolebinding dev-alice-web --role=web-developer --serviceaccount=web:dev-alice -n web</code></pre></figure>\n<p><code>--serviceaccount=web:dev-alice</code> is <code>&lt;namespace&gt;:&lt;name&gt;</code>.</p>\n<p><strong>3.4 Test it</strong> without logging in as anyone, using impersonation (<code>--as</code>):</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20auth%20can-i%20create%20deployments%20-n%20web%20--as%3Dsystem%3Aserviceaccount%3Aweb%3Adev-alice%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl auth can-i create deployments -n web --as=system:serviceaccount:web:dev-alice</code></pre></figure>\n<p><code>yes</code>.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20auth%20can-i%20create%20deployments%20-n%20db%20--as%3Dsystem%3Aserviceaccount%3Aweb%3Adev-alice%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl auth can-i create deployments -n db --as=system:serviceaccount:web:dev-alice</code></pre></figure>\n<p><code>no</code>. The binding is in <code>web</code> only.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20auth%20can-i%20get%20secrets%20-n%20web%20--as%3Dsystem%3Aserviceaccount%3Aweb%3Adev-alice%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl auth can-i get secrets -n web --as=system:serviceaccount:web:dev-alice</code></pre></figure>\n<p><code>no</code>. Secrets were not in the Role.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20auth%20can-i%20--list%20-n%20web%20--as%3Dsystem%3Aserviceaccount%3Aweb%3Adev-alice%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl auth can-i --list -n web --as=system:serviceaccount:web:dev-alice</code></pre></figure>\n<p>Everything it may do in <code>web</code>, as a table. This is the best way to audit one identity.</p>\n<p><strong>3.5 Actually be it.</strong> Make a token and put it in its own kubeconfig entry, so you switch between &quot;me&quot; and\n&quot;alice&quot; like any two contexts:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22TOKEN%3D%24(kubectl%20create%20token%20dev-alice%20-n%20web)%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>TOKEN=$(kubectl create token dev-alice -n web)</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20set-credentials%20dev-alice%20--token%3D%5C%22%24TOKEN%5C%22%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config set-credentials dev-alice --token=<span class=\"hljs-string\">&quot;<span class=\"hljs-variable\">$TOKEN</span>&quot;</span></code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20set-context%20dev-alice-web%20--cluster%3Dkind-local-cluster-1%20--user%3Ddev-alice%20--namespace%3Dweb%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config set-context dev-alice-web --cluster=kind-local-cluster-1 --user=dev-alice --namespace=web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20--context%20dev-alice-web%20get%20pods%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl --context dev-alice-web get pods</code></pre></figure>\n<p>Works. Now try the places it should not reach:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20--context%20dev-alice-web%20get%20pods%20-n%20db%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl --context dev-alice-web get pods -n db</code></pre></figure>\n<figure class=\"code\" data-lang=\"text\"><figcaption><span class=\"lang\">text</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>Error from server (Forbidden): pods is forbidden: User &quot;system:serviceaccount:web:dev-alice&quot; cannot list resource &quot;pods&quot; in API group &quot;&quot; in the namespace &quot;db&quot;</code></pre></figure>\n<p><code>Forbidden</code> is the RBAC answer. (The token expires after about an hour by default; run <code>kubectl create token</code>\nagain for a new one. Replace <code>kind-local-cluster-1</code> with <code>k3d-local-cluster-1</code> on k3d.)</p>\n<hr>\n<h2 id=\"4-hands-on-2-a-person-with-a-certificate-a-user-in-a-group\"><a class=\"anchor\" href=\"#4-hands-on-2-a-person-with-a-certificate-a-user-in-a-group\" aria-label=\"Link to this section\">#</a>4. Hands-on 2: a person with a certificate (a user in a group)</h2>\n<p>A person needs a name your authentication method accepts. On a lab cluster the simplest is a client certificate\nsigned by the cluster. In the certificate, <strong>CN is the user name and O is the group</strong>.</p>\n<p><strong>4.1 Make a key and a certificate request:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>openssl genrsa -out alice.key 2048</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>openssl req -new -key alice.key -out alice.csr -subj <span class=\"hljs-string\">&quot;/CN=alice/O=web-developers&quot;</span></code></pre></figure>\n<p><strong>4.2 Ask the cluster to sign it.</strong> The request goes in as a Kubernetes object:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20apply%20-f%20-%20%3C%3CEOF%22%2C%22apiVersion%3A%20certificates.k8s.io%2Fv1%22%2C%22kind%3A%20CertificateSigningRequest%22%2C%22metadata%3A%22%2C%22%20%20name%3A%20alice%22%2C%22spec%3A%22%2C%22%20%20request%3A%20%24(base64%20%3C%20alice.csr%20%7C%20tr%20-d%20'%5C%5Cn')%22%2C%22%20%20signerName%3A%20kubernetes.io%2Fkube-apiserver-client%22%2C%22%20%20expirationSeconds%3A%2086400%22%2C%22%20%20usages%3A%22%2C%22%20%20%20%20-%20client%20auth%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl apply -f - &lt;&lt;<span class=\"hljs-string\">EOF\napiVersion: certificates.k8s.io/v1\nkind: CertificateSigningRequest\nmetadata:\n  name: alice\nspec:\n  request: $(base64 &lt; alice.csr | tr -d &#x27;\\n&#x27;)\n  signerName: kubernetes.io/kube-apiserver-client\n  expirationSeconds: 86400\n  usages:\n    - client auth\nEOF</span></code></pre></figure>\n<p><code>expirationSeconds: 86400</code> makes the certificate valid for one day. Keep it short (see the warning below).</p>\n<p><strong>4.3 Approve it and fetch the signed certificate:</strong></p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20certificate%20approve%20alice%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl certificate approve alice</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20csr%20alice%20-o%20jsonpath%3D'%7B.status.certificate%7D'%20%7C%20base64%20-d%20%3E%20alice.crt%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get csr alice -o jsonpath=<span class=\"hljs-string\">&#x27;{.status.certificate}&#x27;</span> | <span class=\"hljs-built_in\">base64</span> -d &gt; alice.crt</code></pre></figure>\n<p>(On older macOS the decode flag is <code>-D</code>.)</p>\n<p><strong>4.4 Add alice to your kubeconfig</strong> as a user and a context:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20set-credentials%20alice%20--client-certificate%3Dalice.crt%20--client-key%3Dalice.key%20--embed-certs%3Dtrue%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config set-credentials alice --client-certificate=alice.crt --client-key=alice.key --embed-certs=<span class=\"hljs-literal\">true</span></code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20set-context%20alice-web%20--cluster%3Dkind-local-cluster-1%20--user%3Dalice%20--namespace%3Dweb%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config set-context alice-web --cluster=kind-local-cluster-1 --user=alice --namespace=web</code></pre></figure>\n<p><strong>4.5 She can log in but may do nothing yet.</strong> No rule matches her:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20--context%20alice-web%20get%20pods%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl --context alice-web get pods</code></pre></figure>\n<p><code>Forbidden</code>. That is the safe default.</p>\n<p><strong>4.6 Bind the whole group, not the person.</strong> Anyone whose certificate says <code>O=web-developers</code> gets the same\naccess, so you manage permissions per group and only the membership changes per person. Use the built-in\n<code>edit</code> role, scoped to <code>web</code>:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20rolebinding%20web-developers-edit%20--clusterrole%3Dedit%20--group%3Dweb-developers%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create rolebinding web-developers-edit --clusterrole=edit --group=web-developers -n web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20--context%20alice-web%20get%20pods%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl --context alice-web get pods</code></pre></figure>\n<p>Works. And in another namespace:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20--context%20alice-web%20get%20pods%20-n%20db%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl --context alice-web get pods -n db</code></pre></figure>\n<p><code>Forbidden</code>.</p>\n<blockquote>\n<p><strong>There is no way to revoke a client certificate.</strong> Kubernetes has no certificate revocation list. A leaked\ncertificate stays valid until it expires. So issue short-lived certificates, and for real teams use SSO\n(OIDC), where access ends when the person&#39;s account does. To cut someone off immediately, remove the\nRoleBinding that grants their group.</p>\n</blockquote>\n<hr>\n<h2 id=\"5-what-a-complete-acl-for-a-cluster-consists-of\"><a class=\"anchor\" href=\"#5-what-a-complete-acl-for-a-cluster-consists-of\" aria-label=\"Link to this section\">#</a>5. What a complete ACL for a cluster consists of</h2>\n<p>Permissions are not only RBAC. A complete setup has layers, each stopping a different kind of mistake or\nattack:</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Layer</th><th>Question it answers</th><th>Tool</th></tr></thead><tbody><tr><td>1. Authentication</td><td>Who is this?</td><td>Client certificates (lab), OIDC / SSO (real), cloud IAM (GKE)</td></tr>\n<tr><td>2. Authorization</td><td>What may they do, and where?</td><td>Roles, ClusterRoles, bindings</td></tr>\n<tr><td>3. Workload identity</td><td>What may a <strong>program</strong> do?</td><td>One ServiceAccount per app, least permissions</td></tr>\n<tr><td>4. Admission</td><td>Is this object acceptable?</td><td>Pod Security labels, quotas, policy engines</td></tr>\n<tr><td>5. Network</td><td>Which pods may talk to which?</td><td>NetworkPolicy</td></tr>\n<tr><td>6. Resources</td><td>How much may a namespace use?</td><td>ResourceQuota, LimitRange</td></tr>\n<tr><td>7. Secrets</td><td>Who can read credentials?</td><td>RBAC on Secrets, encryption at rest</td></tr>\n<tr><td>8. Audit</td><td>Who did what, and who has access now?</td><td>Audit logs, regular reviews</td></tr></tbody></table></div>\n<h3 id=\"51-plan-before-you-write-yaml-personas-and-a-matrix\"><a class=\"anchor\" href=\"#51-plan-before-you-write-yaml-personas-and-a-matrix\" aria-label=\"Link to this section\">#</a>5.1 Plan before you write YAML: personas and a matrix</h3>\n<p>Write down who needs what. Example for the namespaces <code>web</code>, <code>cache</code> and <code>db</code>:</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Who</th><th>web</th><th>cache</th><th>db</th><th>Cluster-wide</th></tr></thead><tbody><tr><td><code>platform-admins</code></td><td>admin</td><td>admin</td><td>admin</td><td>cluster-admin (very few people)</td></tr>\n<tr><td><code>web-developers</code></td><td>edit</td><td>view</td><td>none</td><td>none</td></tr>\n<tr><td><code>db-admins</code></td><td>none</td><td>none</td><td>admin</td><td>none</td></tr>\n<tr><td><code>auditors</code></td><td>view</td><td>view</td><td>view</td><td>view</td></tr>\n<tr><td><code>ci-deployer</code> (a program)</td><td>update Deployments</td><td>none</td><td>none</td><td>none</td></tr></tbody></table></div>\n<p>Rules to design by:</p>\n<ul>\n<li><strong>Bind groups, never individuals.</strong> Adding a person means adding them to a group, not editing RBAC.</li>\n<li><strong>Least privilege.</strong> Start from no access and add what is needed.</li>\n<li><strong>Prefer the built-in <code>view</code>, <code>edit</code> and <code>admin</code></strong> bound per namespace with a RoleBinding. Write custom Roles\nonly for gaps, such as the CI deployer.</li>\n<li><strong>Keep <code>cluster-admin</code> for a handful of people</strong>, and for nothing automated.</li>\n<li><strong>Separate duties:</strong> whoever can edit workloads in <code>db</code> is not automatically whoever can read its Secrets.</li>\n</ul>\n<h3 id=\"52-layers-12-bind-the-matrix\"><a class=\"anchor\" href=\"#52-layers-12-bind-the-matrix\" aria-label=\"Link to this section\">#</a>5.2 Layers 1–2: bind the matrix</h3>\n<p>As YAML, so it can be reviewed and kept in git:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20apply%20-f%20-%20%3C%3C'EOF'%22%2C%22apiVersion%3A%20rbac.authorization.k8s.io%2Fv1%22%2C%22kind%3A%20RoleBinding%22%2C%22metadata%3A%20%7B%20name%3A%20web-developers-edit%2C%20namespace%3A%20web%20%7D%22%2C%22roleRef%3A%20%7B%20apiGroup%3A%20rbac.authorization.k8s.io%2C%20kind%3A%20ClusterRole%2C%20name%3A%20edit%20%7D%22%2C%22subjects%3A%20%5B%7B%20apiGroup%3A%20rbac.authorization.k8s.io%2C%20kind%3A%20Group%2C%20name%3A%20web-developers%20%7D%5D%22%2C%22---%22%2C%22apiVersion%3A%20rbac.authorization.k8s.io%2Fv1%22%2C%22kind%3A%20RoleBinding%22%2C%22metadata%3A%20%7B%20name%3A%20web-developers-view%2C%20namespace%3A%20cache%20%7D%22%2C%22roleRef%3A%20%7B%20apiGroup%3A%20rbac.authorization.k8s.io%2C%20kind%3A%20ClusterRole%2C%20name%3A%20view%20%7D%22%2C%22subjects%3A%20%5B%7B%20apiGroup%3A%20rbac.authorization.k8s.io%2C%20kind%3A%20Group%2C%20name%3A%20web-developers%20%7D%5D%22%2C%22---%22%2C%22apiVersion%3A%20rbac.authorization.k8s.io%2Fv1%22%2C%22kind%3A%20RoleBinding%22%2C%22metadata%3A%20%7B%20name%3A%20db-admins-admin%2C%20namespace%3A%20db%20%7D%22%2C%22roleRef%3A%20%7B%20apiGroup%3A%20rbac.authorization.k8s.io%2C%20kind%3A%20ClusterRole%2C%20name%3A%20admin%20%7D%22%2C%22subjects%3A%20%5B%7B%20apiGroup%3A%20rbac.authorization.k8s.io%2C%20kind%3A%20Group%2C%20name%3A%20db-admins%20%7D%5D%22%2C%22---%22%2C%22apiVersion%3A%20rbac.authorization.k8s.io%2Fv1%22%2C%22kind%3A%20ClusterRoleBinding%22%2C%22metadata%3A%20%7B%20name%3A%20auditors-view%20%7D%22%2C%22roleRef%3A%20%7B%20apiGroup%3A%20rbac.authorization.k8s.io%2C%20kind%3A%20ClusterRole%2C%20name%3A%20view%20%7D%22%2C%22subjects%3A%20%5B%7B%20apiGroup%3A%20rbac.authorization.k8s.io%2C%20kind%3A%20Group%2C%20name%3A%20auditors%20%7D%5D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl apply -f - &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\napiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\nmetadata: { name: web-developers-edit, namespace: web }\nroleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: edit }\nsubjects: [{ apiGroup: rbac.authorization.k8s.io, kind: Group, name: web-developers }]\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\nmetadata: { name: web-developers-view, namespace: cache }\nroleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: view }\nsubjects: [{ apiGroup: rbac.authorization.k8s.io, kind: Group, name: web-developers }]\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\nmetadata: { name: db-admins-admin, namespace: db }\nroleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: admin }\nsubjects: [{ apiGroup: rbac.authorization.k8s.io, kind: Group, name: db-admins }]\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: ClusterRoleBinding\nmetadata: { name: auditors-view }\nroleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: view }\nsubjects: [{ apiGroup: rbac.authorization.k8s.io, kind: Group, name: auditors }]\nEOF</code></pre></figure>\n<p>Each block is &quot;who (<code>subjects</code>) gets which role (<code>roleRef</code>) where (<code>namespace</code>)&quot;. The last one is a\nClusterRoleBinding, so auditors can read every namespace.</p>\n<p><code>roleRef</code> cannot be edited after creation. To change which role a binding points to, delete and re-create it.</p>\n<h3 id=\"53-layer-3-one-serviceaccount-per-app-with-only-what-it-needs\"><a class=\"anchor\" href=\"#53-layer-3-one-serviceaccount-per-app-with-only-what-it-needs\" aria-label=\"Link to this section\">#</a>5.3 Layer 3: one ServiceAccount per app, with only what it needs</h3>\n<p>Pods run as the namespace&#39;s <code>default</code> ServiceAccount unless told otherwise, so give each app its own and\ngive it nothing it does not use. A CI deployer that may only update Deployments in <code>web</code>:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20apply%20-f%20-%20%3C%3C'EOF'%22%2C%22apiVersion%3A%20v1%22%2C%22kind%3A%20ServiceAccount%22%2C%22metadata%3A%20%7B%20name%3A%20ci-deployer%2C%20namespace%3A%20web%20%7D%22%2C%22---%22%2C%22apiVersion%3A%20rbac.authorization.k8s.io%2Fv1%22%2C%22kind%3A%20Role%22%2C%22metadata%3A%20%7B%20name%3A%20deployer%2C%20namespace%3A%20web%20%7D%22%2C%22rules%3A%22%2C%22%20%20-%20apiGroups%3A%20%5B%5C%22apps%5C%22%5D%22%2C%22%20%20%20%20resources%3A%20%5B%5C%22deployments%5C%22%5D%22%2C%22%20%20%20%20verbs%3A%20%5B%5C%22get%5C%22%2C%20%5C%22list%5C%22%2C%20%5C%22patch%5C%22%2C%20%5C%22update%5C%22%5D%22%2C%22---%22%2C%22apiVersion%3A%20rbac.authorization.k8s.io%2Fv1%22%2C%22kind%3A%20RoleBinding%22%2C%22metadata%3A%20%7B%20name%3A%20ci-deployer-deployer%2C%20namespace%3A%20web%20%7D%22%2C%22roleRef%3A%20%7B%20apiGroup%3A%20rbac.authorization.k8s.io%2C%20kind%3A%20Role%2C%20name%3A%20deployer%20%7D%22%2C%22subjects%3A%20%5B%7B%20kind%3A%20ServiceAccount%2C%20name%3A%20ci-deployer%2C%20namespace%3A%20web%20%7D%5D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl apply -f - &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\napiVersion: v1\nkind: ServiceAccount\nmetadata: { name: ci-deployer, namespace: web }\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nmetadata: { name: deployer, namespace: web }\nrules:\n  - apiGroups: [<span class=\"hljs-string\">&quot;apps&quot;</span>]\n    resources: [<span class=\"hljs-string\">&quot;deployments&quot;</span>]\n    verbs: [<span class=\"hljs-string\">&quot;get&quot;</span>, <span class=\"hljs-string\">&quot;list&quot;</span>, <span class=\"hljs-string\">&quot;patch&quot;</span>, <span class=\"hljs-string\">&quot;update&quot;</span>]\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\nmetadata: { name: ci-deployer-deployer, namespace: web }\nroleRef: { apiGroup: rbac.authorization.k8s.io, kind: Role, name: deployer }\nsubjects: [{ kind: ServiceAccount, name: ci-deployer, namespace: web }]\nEOF</code></pre></figure>\n<p>For pods that never talk to the Kubernetes API (most of them), do not hand them a token at all. In the pod\nspec:</p>\n<figure class=\"code\" data-lang=\"yaml\"><figcaption><span class=\"lang\">yaml</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-attr\">spec:</span>\n  <span class=\"hljs-attr\">automountServiceAccountToken:</span> <span class=\"hljs-literal\">false</span></code></pre></figure>\n<h3 id=\"54-layer-4-admission--pod-security\"><a class=\"anchor\" href=\"#54-layer-4-admission--pod-security\" aria-label=\"Link to this section\">#</a>5.4 Layer 4: admission — Pod Security</h3>\n<p>RBAC says who may create a pod; Pod Security says what a pod may be (privileged, host networking, running as\nroot). It is switched on per namespace with a label:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20label%20namespace%20web%20pod-security.kubernetes.io%2Fenforce%3Dbaseline%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl label namespace web pod-security.kubernetes.io/enforce=baseline</code></pre></figure>\n<p><code>baseline</code> blocks the clearly dangerous settings; <code>restricted</code> is stricter. Use <code>pod-security.kubernetes.io/warn=restricted</code> first to see what would break without blocking anything.</p>\n<h3 id=\"55-layer-5-network--networkpolicy\"><a class=\"anchor\" href=\"#55-layer-5-network--networkpolicy\" aria-label=\"Link to this section\">#</a>5.5 Layer 5: network — NetworkPolicy</h3>\n<p>By default every pod can reach every other pod in every namespace. A NetworkPolicy closes that. A common start\nis &quot;deny all incoming traffic to <code>db</code>, then allow only what is needed&quot;:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20apply%20-f%20-%20%3C%3C'EOF'%22%2C%22apiVersion%3A%20networking.k8s.io%2Fv1%22%2C%22kind%3A%20NetworkPolicy%22%2C%22metadata%3A%20%7B%20name%3A%20default-deny-ingress%2C%20namespace%3A%20db%20%7D%22%2C%22spec%3A%22%2C%22%20%20podSelector%3A%20%7B%7D%22%2C%22%20%20policyTypes%3A%20%5B%5C%22Ingress%5C%22%5D%22%2C%22EOF%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl apply -f - &lt;&lt;<span class=\"hljs-string\">&#x27;EOF&#x27;</span>\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: { name: default-deny-ingress, namespace: db }\nspec:\n  podSelector: {}\n  policyTypes: [<span class=\"hljs-string\">&quot;Ingress&quot;</span>]\nEOF</code></pre></figure>\n<p><code>podSelector: {}</code> means every pod in the namespace. A NetworkPolicy does nothing unless the cluster&#39;s network\nplugin enforces it, and that depends on your setup and version. Check that <code>kind</code>&#39;s default plugin, or k3s&#39;s\nbuilt-in controller, enforces policies before relying on it, or install a plugin that does (Calico, Cilium).</p>\n<h3 id=\"56-layer-6-resources--quotas\"><a class=\"anchor\" href=\"#56-layer-6-resources--quotas\" aria-label=\"Link to this section\">#</a>5.6 Layer 6: resources — quotas</h3>\n<p>Stops one namespace from using the whole cluster:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20create%20quota%20web-quota%20--hard%3Dpods%3D20%2Crequests.cpu%3D4%2Crequests.memory%3D8Gi%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl create quota web-quota --hard=pods=20,requests.cpu=4,requests.memory=8Gi -n web</code></pre></figure>\n<h3 id=\"57-layer-7-secrets\"><a class=\"anchor\" href=\"#57-layer-7-secrets\" aria-label=\"Link to this section\">#</a>5.7 Layer 7: secrets</h3>\n<ul>\n<li><code>view</code> already excludes Secrets; <code>edit</code> and <code>admin</code> include them. Give those roles only where needed.</li>\n<li><code>list</code> on Secrets reveals their contents just like <code>get</code> does. Do not grant either casually.</li>\n<li>Encrypt Secrets at rest on real clusters (a setting on the API server; managed clusters like GKE offer it).</li>\n</ul>\n<h3 id=\"58-layer-8-audit-and-review\"><a class=\"anchor\" href=\"#58-layer-8-audit-and-review\" aria-label=\"Link to this section\">#</a>5.8 Layer 8: audit and review</h3>\n<p>Who can do something, and what can this identity do:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20auth%20can-i%20delete%20pods%20-n%20db%20--as%3Dalice%20--as-group%3Dweb-developers%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl auth can-i delete pods -n db --as=alice --as-group=web-developers</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20auth%20can-i%20--list%20-n%20web%20--as%3Dalice%20--as-group%3Dweb-developers%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl auth can-i --list -n web --as=alice --as-group=web-developers</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20rolebindings%2Cclusterrolebindings%20-A%20-o%20wide%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get rolebindings,clusterrolebindings -A -o wide</code></pre></figure>\n<p>The last one lists every grant: look for <code>cluster-admin</code> bindings and for subjects you do not recognise.</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20get%20clusterrolebindings%20-o%20wide%20%7C%20grep%20cluster-admin%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl get clusterrolebindings -o wide | grep cluster-admin</code></pre></figure>\n<p>On a real cluster, also turn on API audit logging (who did what, when) and review RBAC on a schedule: when\npeople join, change teams or leave.</p>\n<hr>\n<h2 id=\"6-dangerous-permissions-check-these-before-you-grant\"><a class=\"anchor\" href=\"#6-dangerous-permissions-check-these-before-you-grant\" aria-label=\"Link to this section\">#</a>6. Dangerous permissions: check these before you grant</h2>\n<p>Some permissions are much more powerful than they look:</p>\n<div class=\"table-wrap\" tabindex=\"0\" role=\"region\" aria-label=\"Table (scrolls sideways)\"><table><thead><tr><th>Permission</th><th>Why it is dangerous</th></tr></thead><tbody><tr><td><code>*</code> in verbs or resources</td><td>Everything, including things added later</td></tr>\n<tr><td><code>create</code> on <code>pods</code></td><td>A pod can mount Secrets and ServiceAccount tokens in its namespace, so it can reach what the namespace holds</td></tr>\n<tr><td><code>get</code> / <code>list</code> on <code>secrets</code></td><td>Reads every password and token in the namespace</td></tr>\n<tr><td><code>pods/exec</code></td><td>A shell inside a running pod, with all its access</td></tr>\n<tr><td><code>create</code> on <code>rolebindings</code> or <code>roles</code></td><td>Can grant themselves more power (Kubernetes blocks giving more than you hold, unless you also have <code>escalate</code> or <code>bind</code>)</td></tr>\n<tr><td><code>escalate</code>, <code>bind</code>, <code>impersonate</code></td><td>Direct ways to raise or borrow privileges</td></tr>\n<tr><td><code>nodes/proxy</code>, <code>nodes</code></td><td>Reaches across the whole node</td></tr>\n<tr><td><code>cluster-admin</code></td><td>Root</td></tr></tbody></table></div>\n<hr>\n<h2 id=\"7-on-a-managed-cluster-gke\"><a class=\"anchor\" href=\"#7-on-a-managed-cluster-gke\" aria-label=\"Link to this section\">#</a>7. On a managed cluster (GKE)</h2>\n<p>The same RBAC objects apply. Two additions:</p>\n<ul>\n<li><strong>Authentication and the first layer of permissions come from Google Cloud IAM.</strong> A person needs an IAM role\n(for example one that lets them reach the cluster) before Kubernetes RBAC is even asked.</li>\n<li><strong>Groups come from Google Groups</strong> (with Google Groups for RBAC enabled): bind the group&#39;s email in a\nRoleBinding, and managing membership happens in Google, not in Kubernetes.</li>\n</ul>\n<p>So on GKE: IAM decides who may connect, RBAC decides what they may do in each namespace. Your lab cluster has\nno IAM, so certificates or tokens stand in for it.</p>\n<hr>\n<h2 id=\"8-clean-up-the-lab-objects\"><a class=\"anchor\" href=\"#8-clean-up-the-lab-objects\" aria-label=\"Link to this section\">#</a>8. Clean up the lab objects</h2>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20serviceaccount%20dev-alice%20ci-deployer%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete serviceaccount dev-alice ci-deployer -n web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20role%20web-developer%20deployer%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete role web-developer deployer -n web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20rolebinding%20dev-alice-web%20web-developers-edit%20ci-deployer-deployer%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete rolebinding dev-alice-web web-developers-edit ci-deployer-deployer -n web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20rolebinding%20web-developers-view%20-n%20cache%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete rolebinding web-developers-view -n cache</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20rolebinding%20db-admins-admin%20-n%20db%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete rolebinding db-admins-admin -n db</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20clusterrolebinding%20auditors-view%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete clusterrolebinding auditors-view</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20csr%20alice%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete csr alice</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20delete-context%20dev-alice-web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config delete-context dev-alice-web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20delete-context%20alice-web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config delete-context alice-web</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20delete-user%20dev-alice%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config delete-user dev-alice</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20config%20delete-user%20alice%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl config delete-user alice</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code><span class=\"hljs-built_in\">rm</span> alice.key alice.csr alice.crt</code></pre></figure>\n<p>If you applied the NetworkPolicy, Pod Security label or quota from section 5, remove them too:</p>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20networkpolicy%20default-deny-ingress%20-n%20db%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete networkpolicy default-deny-ingress -n db</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20label%20namespace%20web%20pod-security.kubernetes.io%2Fenforce-%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl label namespace web pod-security.kubernetes.io/enforce-</code></pre></figure>\n<figure class=\"code\" data-lang=\"bash\"><figcaption><span class=\"lang\">bash</span><a class=\"code-try\" href=\"/app?run=%5B%22kubectl%20delete%20quota%20web-quota%20-n%20web%22%5D&amp;notour=1\">Try in playground</a><button type=\"button\" class=\"code-copy\" aria-label=\"Copy this code\">Copy</button></figcaption><pre tabindex=\"0\"><code>kubectl delete quota web-quota -n web</code></pre></figure>\n<p>Deleting the whole cluster (<a href=\"/blog/clean-up\">Stop, shut down and clean up</a>) removes all of it at once.</p>\n";
var users_and_permissions_default = {
	slug,
	title,
	description,
	order: 2,
	tags,
	date,
	minutes: 21,
	words,
	toc,
	html
};
//#endregion
//#region src/blog/data.server.js
var all = /* #__PURE__ */ Object.assign({
	"./generated/posts/clean-up.json": clean_up_exports,
	"./generated/posts/concepts.json": concepts_exports,
	"./generated/posts/deploy-apps.json": deploy_apps_exports,
	"./generated/posts/helm-2-chart.json": helm_2_chart_exports,
	"./generated/posts/k3d-cluster.json": k3d_cluster_exports,
	"./generated/posts/kind-cluster.json": kind_cluster_exports,
	"./generated/posts/run-your-image.json": run_your_image_exports,
	"./generated/posts/start-here.json": start_here_exports,
	"./generated/posts/users-and-permissions.json": users_and_permissions_exports
});
for (const m of Object.values(all)) seedPost(m.default);
//#endregion
//#region src/entry-server.jsx
var routes = () => [
	"/",
	"/blog",
	...posts.map((p) => "/blog/" + p.slug),
	"/privacy"
];
function render(url) {
	return renderToString(/* @__PURE__ */ jsx(import_dist.StaticRouter, {
		location: url,
		children: /* @__PURE__ */ jsx(App, {})
	}));
}
//#endregion
export { metaFor, Logo as n, require_dist as r, render, routes, _defineProperty as t };
