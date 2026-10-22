#!/usr/bin/env node
// Builds every page of the site from content/*.json. Zero dependencies (Node 20+).
// Usage: node tools/build.mjs        (writes HTML, sitemap.xml, site.webmanifest, robots.txt)
// The generated files are committed; GitHub Pages serves them as plain static files.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { setRoot } from './lib/images.mjs';
import { layout } from './templates/layout.mjs';
import * as T from './templates/pages.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
setRoot(ROOT);
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const list = (dir) => fs.existsSync(path.join(ROOT, dir))
  ? fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.json')).map((f) => read(path.join(dir, f))) : [];
const hash = (rel) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, rel))).digest('hex').slice(0, 10);
const write = (rel, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, rel)), { recursive: true }); fs.writeFileSync(path.join(ROOT, rel), String(s)); };

const site = read('content/site.json');
const pages = Object.fromEntries(['home', 'research', 'about', 'motion'].map((k) => [k, read(`content/pages/${k}.json`)]));
const groupOrder = site.groups.map((g) => g.id);
const projects = list('content/projects').sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group) || a.order - b.order);
const digital = list('content/digital');

// Future: the owner's website and app become entries in content/digital/*.json; the nav item
// appears with the first one (template to be designed with the real material, see tools/README.md).
if (digital.length && !site.nav.some((n) => n.id === 'digital')) site.nav.splice(2, 0, { id: 'digital', label: 'Digital', href: 'digital.html' });

const abs = (rel) => site.origin + site.base + rel;
const personLd = {
  '@context': 'https://schema.org', '@type': 'Person', '@id': abs('#person'), name: site.person.name, jobTitle: site.person.jobTitle,
  description: site.person.line, url: abs(''), email: `mailto:${site.person.email}`, image: abs('images/portrait.jpg'), sameAs: [site.person.linkedin],
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'École Nationale d’Architecture et d’Urbanisme de Tunis (ENAU), Université de Carthage' },
  knowsAbout: site.person.knowsAbout,
  knowsLanguage: ['ar', 'fr', 'en'],
  award: ['Highest Honours, National Architecture Diploma, ENAU, 2026', 'Highest Honours, Final Year Architectural Thesis, ENAU, 2024', 'Most Appreciated Research, Sakura Science Program, 2025']
};
const websiteLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: site.siteName, alternateName: [site.person.name], url: abs(''), author: { '@id': abs('#person') }, inLanguage: 'en' };

const ogFor = (name) => (fs.existsSync(path.join(ROOT, `images/og/${name}.jpg`)) ? `images/og/${name}.jpg` : 'images/og/home.jpg');
const versions = { css: hash('css/site.css'), js: hash('js/site.js') };
const films = pages.motion.films;
const grounds = read('content/grounds.json');   // the plates' grounds (D86), from node tools/grounds.mjs
const ctxFor = (rel) => ({ prefix: rel.includes('/') ? '../' : '', versions, personLd, websiteLd, ogFor, films, grounds });

const out = [];
const emit = (r, rel) => { const ctx = ctxFor(rel); ctx.viewer = r.viewer; write(rel, layout(site, r.page, r.body, ctx)); out.push(r.page); };

emit(T.home(site, pages.home, projects, ctxFor('index.html')), 'index.html');
emit(T.work(site, projects, ctxFor('architecture.html')), 'architecture.html');
for (const p of projects) { const rel = `projects/project-${p.slug}.html`; const ctx = ctxFor(rel); emit(T.project(site, p, projects, ctx), rel); }
emit(T.research(site, pages.research, ctxFor('books.html')), 'books.html');
emit(T.about(site, pages.about, ctxFor('about.html')), 'about.html');
emit(T.motion(site, pages.motion, projects, ctxFor('motion.html')), 'motion.html');
// 404 is served at any depth, so its links are root-absolute
{ const ctx = { ...ctxFor('404.html'), prefix: site.base }; const r = T.notFound(site, ctx); ctx.viewer = false; write('404.html', layout(site, r.page, r.body, ctx)); }

// videos.html: kept URL, redirects to the films (maps the old anchors)
write('videos.html', `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Films | Hazem Radhouani</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${abs('motion.html')}">
<script>(function(){var m={'#video-sentry':'#film-sentry','#video-zenata':'#film-zenata'};location.replace('motion.html'+(m[location.hash]||'#films'));})();</script>
<meta http-equiv="refresh" content="0; url=motion.html#films">
</head>
<body><p>The films have moved to <a href="motion.html#films">Films and motion</a>.</p></body>
</html>
`);

// sitemap, manifest, robots
const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${out.filter((p) => !p.noindex).map((p) => `  <url><loc>${abs(p.path === 'index.html' ? '' : p.path)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
write('site.webmanifest', JSON.stringify({ name: site.siteName, short_name: 'H. Radhouani', start_url: site.base, scope: site.base, display: 'browser',
  background_color: '#FFFFFF', theme_color: site.themeColor, icons: [
    { src: 'images/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'images/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'images/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] }, null, 2) + '\n');
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${abs('sitemap.xml')}\n`);

// the site moved from /portfolio/ to the host root (D81): every old page address answers with its new one
// (no noindex: an instant refresh is read as a permanent redirect, and noindex would contradict it)
const moved = (rel) => {
  const to = abs(rel === 'index.html' ? '' : rel);
  write(`portfolio/${rel}`, `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${site.siteName}</title>
<link rel="canonical" href="${to}">
<script>location.replace(${JSON.stringify(to)}+location.search+location.hash);</script>
<meta http-equiv="refresh" content="0; url=${to}">
</head>
<body><p>This page has moved to <a href="${to}">${to}</a>.</p></body>
</html>
`);
};
for (const p of out) moved(p.path);
moved('videos.html');
if (!fs.existsSync(path.join(ROOT, '.nojekyll'))) write('.nojekyll', '');
console.log(`built ${out.length + 2} pages (${projects.length} projects) | css ${versions.css} | js ${versions.js}`);
