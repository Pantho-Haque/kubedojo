// The playground is a separate chunk. Link components call preloadPlayground when the visitor points at, focuses or touches a link
// to /app, so by the time of the click the chunk is usually already there.
export const loadPlayground = () => import('./Playground.jsx');
export const preloadPlayground = () => { loadPlayground(); };
export const appIntent = { onPointerEnter: preloadPlayground, onFocus: preloadPlayground, onTouchStart: preloadPlayground };
