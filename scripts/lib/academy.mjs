// content/academy/<course>/{index.md, NN-slug.md} -> the Academy's data, at build time. categories.json orders the shelf.
//   index.md: title, order, category, engine, subtitle, description, stages[], practice (a lesson slug)
//   engine (how a lesson is shown):
//     md     (default) NN-slug.md: id (unique across the Academy), title, emoji, stage, quiz[], practice{kind, mission | config}, setup[], format
//            format: html for lessons ported from the tutorial prototype (their bodies are HTML); Markdown otherwise.
//     go     NN-slug.md: a gothik lesson (steps, quiz, pitfalls, …) in front matter, its hook as the body; index.md names the track.
//            Shown by the Go workbench (src/go), which reads them back as generated/go-curriculum.json.
//     studio index.md lists files: the course's JS modules, run in order, defining COURSE (lessons are card decks with live
//            simulators, so they stay code). title, stages and lessons come from COURSE; shown by the studio engine.
// Returns { index, courses, go, studio, problems }. Any problem fails the build: broken links, bad quizzes, unsafe HTML, unknown practice.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import matter from 'gray-matter';
import { Marked } from 'marked';
import { labCanRun } from '../../src/academy/engine/canrun.js';

// Which Simulate each course opens, and which practice simulators a lesson may embed.
export const SIMULATE = { kubernetes: 'k8s', docker: 'docker', 'helm-3': 'helm', 'helm-2': 'helm2', terraform: 'terraform', cicd: 'gitops' };
const PRACTICE = { k8s: null, docker: ['life', 'build', 'network', 'storage', 'compose'], helm: ['values', 'install', 'release'], helm2: ['tiller', 'release'], terraform: ['workflow', 'change', 'drift'], pipeline: ['pipeline', 'gitops', 'drift'] };
const SLOT = { k8s: 'data-sim', docker: 'data-docker-sim', helm: 'data-helm-sim', helm2: 'data-helm-sim', terraform: 'data-tf-sim', pipeline: 'data-ci-sim' };

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unesc = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
// the same block the prototype's cmd() helper wrote, so ported and new lessons behave alike
const cmdBlock = code => `<div class="cmd"><pre tabindex="0">${esc(code)}</pre><button type="button" class="copy">Copy</button></div>\n`;

function markdown(src) {
  const md = new Marked({ gfm: true });
  md.use({ renderer: {
    code({ text, lang }) { return !lang || /^(bash|sh|shell|console)$/i.test(lang) ? cmdBlock(text) : `<details class="file" open><summary>📄 ${esc(lang)}</summary><pre tabindex="0">${esc(text)}</pre></details>\n`; },
  } });
  return md.parse(src);
}

// Kubernetes lessons: a command block the Academy's lab can run gets "Set up and try". Its set-up is the lesson's
// setup commands plus every earlier runnable block, replayed in order; then the block's lines wait on the prompt one by one.
function markTries(html, setup) {
  const tries = []; const done = [...setup];
  const out = html.replace(/<div class="cmd"><pre tabindex="0">([\s\S]*?)<\/pre>/g, (m, body) => {
    const lines = unesc(body).split('\n').map(l => l.replace(/\s+#.*$/, '').trim()).filter(l => l && !l.startsWith('#'));
    const run = []; for (const l of lines) { if (!labCanRun(l)) break; run.push(l); } // the lines the lab can run, from the top
    if (!run.length) return m;
    tries.push({ setup: [...done], cmds: run, skipped: lines.length - run.length }); done.push(...run); // the block's own lines stay the learner's to type
    return `<div class="cmd" data-try="${tries.length - 1}"><pre tabindex="0">${body}</pre>`;
  });
  return { html: out, tries };
}

// plain text and a little HTML from the studio's rich text: [[term|label]], `code`, **bold**
const plain = s => String(s || '').replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, a, b) => b || a);
const rich = s => esc(plain(s)).replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
const paras = b => (Array.isArray(b) ? b : String(b || '').split(/\n\s*\n/)).filter(Boolean).map(p => `<p>${rich(p)}</p>`).join('');
const clip = s => { const t = s.replace(/[`*]/g, '').replace(/\s+/g, ' ').trim(); return t.length > 160 ? t.slice(0, 157).replace(/\s+\S*$/, '') + '…' : t; };

// A studio course: run its modules (data and pure functions, no DOM) to read COURSE.
function studio(dir, slug, meta, problems) {
  const files = meta.files || []; if (!files.length) { problems.push(`${slug}/index.md: a studio course lists its files`); return null; }
  let src; try { src = files.map(f => readFileSync(join(dir, slug, f), 'utf8')).join('\n;\n'); } catch (e) { problems.push(`${slug}: ${e.message}`); return null; }
  let C; try { C = vm.runInNewContext(src + '\n;COURSE', { console }); } catch (e) { problems.push(`${slug}: the course modules do not run: ${e.message}`); return null; }
  if (!C?.id || !C.title || !Array.isArray(C.modules)) { problems.push(`${slug}: COURSE needs id, title and modules`); return null; }
  const lessons = C.modules.flatMap((m, stage) => m.lessons.map(l => {
    const read = l.cards.find(c => c.t === 'read');
    const html = l.cards.map(c => c.t === 'read' ? (c.h ? `<h2>${rich(c.h)}</h2>` : '') + paras(c.body) : c.t === 'recap' ? `<ul>${(c.points || []).map(p => `<li>${rich(p)}</li>`).join('')}</ul>` : '').join('');
    return { id: l.id, slug: l.id, title: l.title, emoji: '', stage, description: clip(plain(l.goal ? 'Learn to ' + l.goal : read ? String(read.body) : l.title)), html, quiz: [], practice: null, tries: [], quizN: l.cards.filter(c => c.t === 'quiz').length };
  }));
  return { course: { title: C.title, subtitle: C.subtitle, description: C.tagline || C.subtitle, stages: C.modules.map(m => m.title), practice: null }, lessons,
    module: `/* eslint-disable */\n// Generated from content/academy/${slug}/ (${files.join(', ')}) by scripts/build-academy.mjs. Do not edit.\n${src}\nexport default COURSE;\n` };
}

export function buildAcademy(dir, hints = {}) {
  const problems = []; const courses = []; const full = {}; const ids = new Map(); const goLessons = []; const modules = {};
  let categories = []; try { categories = JSON.parse(readFileSync(join(dir, 'categories.json'), 'utf8')); } catch { problems.push('categories.json: missing or not valid JSON'); }
  const catAt = new Map(categories.map((c, i) => [c.id, i]));
  const dirs = readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  for (const slug of dirs) {
    const where = f => `${slug}/${f}`;
    let meta; try { meta = matter(readFileSync(join(dir, slug, 'index.md'), 'utf8')).data; } catch { problems.push(`${slug}: missing index.md`); continue; }
    const engine = meta.engine || 'md';
    if (!['md', 'go', 'studio'].includes(engine)) { problems.push(`${where('index.md')}: unknown engine "${engine}"`); continue; }
    if (engine === 'md' && !SIMULATE[slug]) { problems.push(`${slug}: unknown course folder (add it to SIMULATE)`); continue; }
    if (!catAt.has(meta.category)) problems.push(`${where('index.md')}: category "${meta.category}" is not in categories.json`);
    const base = { slug, order: meta.order, category: meta.category, engine, simulate: SIMULATE[slug] || null };
    if (engine === 'studio') {
      const s = studio(dir, slug, meta, problems); if (!s) continue;
      for (const l of s.lessons) { if (ids.has(l.id)) problems.push(`${slug}: lesson id "${l.id}" is already used by ${ids.get(l.id).course}`); ids.set(l.id, { course: slug, slug: l.slug }); l._go = []; l._at = slug; }
      modules[slug] = s.module; courses.push({ ...base, ...s.course, lessons: s.lessons }); continue;
    }
    for (const k of ['title', 'order', 'subtitle', 'description', 'stages', engine === 'go' ? 'track' : 'practice']) if (meta[k] == null) problems.push(`${where('index.md')}: missing ${k}`);
    const lessons = [];
    for (const f of readdirSync(join(dir, slug)).filter(f => /^\d\d-[\w-]+\.md$/.test(f)).sort()) {
      const { data, content } = matter(readFileSync(join(dir, slug, f), 'utf8'));
      const ls = f.replace(/^\d\d-/, '').replace(/\.md$/, ''); const at = where(f);
      if (!data.id || !data.title) { problems.push(`${at}: needs id and title`); continue; }
      if (ids.has(data.id)) problems.push(`${at}: id "${data.id}" is already used by ${ids.get(data.id).course}`);
      ids.set(data.id, { course: slug, slug: ls });
      if (!Number.isInteger(data.stage) || data.stage < 0 || data.stage >= (meta.stages || []).length) problems.push(`${at}: stage ${data.stage} is not one of the course's stages`);
      if (engine === 'go') {
        const { stage, ...lesson } = data; const hook = content.trim();
        if (lesson.track !== meta.track) problems.push(`${at}: track ${lesson.track} is not the course's track ${meta.track}`);
        goLessons.push({ ...lesson, hook });
        const html = `<p>${rich(hook)}</p>` + (lesson.goals?.length ? `<ul>${lesson.goals.map(g => `<li>${rich(g)}</li>`).join('')}</ul>` : '');
        lessons.push({ id: data.id, slug: ls, title: data.title, emoji: '', stage, description: clip(hook), html, quiz: [], practice: null, tries: [], quizN: (lesson.quiz || []).length, _go: [], _at: at });
        continue;
      }
      let html = data.format === 'html' ? content.trim() : markdown(content);
      if (/<script\b|\son[a-z]+\s*=|javascript:/i.test(html)) problems.push(`${at}: scripts and inline event handlers are not allowed in lessons`);
      const quiz = data.quiz || [];
      quiz.forEach((q, i) => { if (!q.q || !Array.isArray(q.options) || q.options.length < 2 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length || !q.why) problems.push(`${at}: quiz question ${i + 1} needs q, 2+ options, an answer index, and why`); });
      const p = data.practice || null;
      if (p) {
        if (!(p.kind in PRACTICE)) problems.push(`${at}: unknown practice kind "${p.kind}"`);
        else if (PRACTICE[p.kind] && !PRACTICE[p.kind].includes(p.mission)) problems.push(`${at}: unknown ${p.kind} mission "${p.mission}"`);
        else if (!html.includes(SLOT[p.kind])) problems.push(`${at}: practice needs a <div ${SLOT[p.kind]}></div> slot in the body`);
      }
      let tries = [];
      if (slug === 'kubernetes') ({ html, tries } = markTries(html, data.setup || []));
      const go = [...html.matchAll(/data-go="([^"]+)"/g)].map(m => m[1]);
      // a plain-text summary for the page description: the lesson's first sentence or two
      const text = html.replace(/<div class="tag">[^<]*<\/div>/g, ' ').replace(/<(h2|pre|details|button)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, m => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }[m] || ' ')).replace(/\s+/g, ' ').replace(/ ([.,;:!?])/g, '$1').trim();
      const description = text.length > 160 ? text.slice(0, 157).replace(/\s+\S*$/, '') + '…' : text;
      lessons.push({ id: data.id, slug: ls, title: data.title, emoji: data.emoji || '', stage: data.stage, description, html, quiz, practice: p, tries, _go: go, _at: at });
    }
    if (engine === 'md' && !lessons.some(l => l.slug === meta.practice)) problems.push(`${where('index.md')}: practice lesson "${meta.practice}" does not exist`);
    courses.push({ ...base, title: meta.title, subtitle: meta.subtitle, description: meta.description, stages: meta.stages, practice: meta.practice || null, ...(engine === 'go' && { track: meta.track }), lessons });
  }
  courses.sort((a, b) => catAt.get(a.category) - catAt.get(b.category) || a.order - b.order);
  // links between lessons point at lesson ids; resolve them, and fail on any that lead nowhere
  for (const c of courses) for (const l of c.lessons) { for (const id of l._go) if (!ids.has(id)) problems.push(`${l._at}: data-go="${id}" points at no lesson`); delete l._go; delete l._at; }
  // the playground's hint links must land on real lessons
  const routes = new Set(courses.flatMap(c => [`/academy/${c.slug}`, ...c.lessons.map(l => `/academy/${c.slug}/${l.slug}`)]));
  for (const [sec, h] of Object.entries(hints)) for (const [, href] of h.links) if (!routes.has(href.replace(/#(practice|quiz)$/, ''))) problems.push(`playground hint "${sec}": ${href} is not an Academy lesson`);

  const index = { categories, courses: courses.map(({ lessons, ...c }) => ({ ...c, lessons: lessons.map(l => ({ id: l.id, slug: l.slug, title: l.title, emoji: l.emoji, stage: l.stage, quiz: l.quizN ?? l.quiz.length, practice: l.practice?.kind || null, tries: l.tries.length })) })) };
  for (const c of courses) full[c.slug] = { slug: c.slug, lessons: Object.fromEntries(c.lessons.map(l => { delete l.quizN; return [l.slug, l]; })) };
  return { index, courses: full, go: goLessons, studio: modules, problems };
}
