import { useEffect } from 'react';
import { store, useStoreVersion } from './store';
import { D } from './data';

export const DEFAULTS = { theme: 'system', motion: 'system', speed: 1, depth: 'simple', live: true, editorSize: 13.5, tabs: false, guide: true, split: 42, follow: true, seen: false, voice: false, analytics: true, lang: 'en' };
export type Settings = typeof DEFAULTS;
const KEY = 'gothik-settings-v3';
// Light or dark is the whole site's choice (the same key as the site's theme toggle); the rest are gothik's own.
const THEME_KEY = 'kubedojo:theme';
function siteTheme(): string { try { const t = localStorage.getItem(THEME_KEY); return t === 'light' || t === 'dark' ? t : 'system'; } catch { return 'system'; } }

function pick(raw: unknown): Partial<Settings> {
  const out: Record<string, unknown> = {};
  if (!raw || typeof raw !== 'object') return out;
  const r = raw as Record<string, unknown>;
  for (const k of Object.keys(DEFAULTS) as (keyof Settings)[]) if (r[k] !== undefined && typeof r[k] === typeof DEFAULTS[k]) out[k] = r[k];
  if (r.underHood === true) out.depth = 'hood';
  return out as Partial<Settings>;
}

/** Current settings (defaults on the server). Read it in event handlers and effects. */
export function getSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULTS;
  return { ...DEFAULTS, ...pick(store.get(KEY, null) ?? store.get('gothik-settings-v2', {})), theme: siteTheme() };
}
export function setSetting<K extends keyof Settings>(k: K, v: Settings[K]) {
  if (k === 'theme') { try { if (v === 'system') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, String(v)); } catch { /* blocked: applies to this page only */ } }
  const { theme: _site, ...own } = getSettings();
  store.set(KEY, k === 'theme' ? own : { ...own, [k]: v });
  if (k === 'theme' || k === 'motion' || k === 'editorSize') applyTheme();
  if (k === 'lang') document.documentElement.lang = v === 'pt' ? 'pt-BR' : String(v);
}
/** Settings as React state: defaults on the server and while hydrating, then the stored values. */
export function useSettings(): Settings {
  return useStoreVersion() < 0 ? DEFAULTS : getSettings();
}

export const reduced = () => { const s = getSettings(); return s.motion === 'reduce' || (s.motion === 'system' && matchMedia('(prefers-reduced-motion: reduce)').matches); };

/** While gothik is on screen: its motion, editor size and language follow its settings (the theme is the site's). Undone on the way out. */
export function useGothikSettings() {
  useEffect(() => {
    applyTheme();
    const { lang } = getSettings(), root = document.documentElement;
    if (lang !== 'en') root.lang = lang === 'pt' ? 'pt-BR' : lang;
    return () => { root.lang = 'en'; root.classList.remove('reduce-motion', 'presenting'); };
  }, []);
}

export function applyTheme() {
  const s = getSettings(), root = document.documentElement;
  const dark = s.theme === 'dark' || (s.theme === 'system' && !matchMedia('(prefers-color-scheme: light)').matches);
  root.dataset.theme = dark ? 'dark' : 'light';
  root.classList.toggle('reduce-motion', s.motion === 'reduce');
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#0a0f12' : '#f3f2ec');
  root.style.setProperty('--editor-fs', s.editorSize + 'px');
  root.style.setProperty('--editor-lh', Math.round(s.editorSize * 1.63) + 'px');
}

/* ---------- interface language (shell only; lessons stay English) ---------- */
export const LANGS: [string, string][] = [['en', 'English'], ['es', 'Español'], ['pt', 'Português (Brasil)']];
export const translate = (lang: string, en: string) => (lang === 'en' ? en : D.i18n[lang]?.[en] ?? en);
/** t('English text') in the current interface language. */
export function useT() {
  const { lang } = useSettings();
  return (en: string) => translate(lang, en);
}
export const t = (en: string) => translate(getSettings().lang, en);
