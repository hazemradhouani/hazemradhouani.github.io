// Run: npm run og  (needs the local server: npm run serve). Rewrites icons and images/og/*.jpg for every page.
// Rasterise the brand kit and the share cards in Chrome (real fonts, real mark). Usage: node brand.mjs <repo> <serverBase>
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.argv[2] || 'http://127.0.0.1:8090/portfolio/';
const rd = (p) => JSON.parse(fs.readFileSync(path.join(REPO, p), 'utf8'));
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" });

// 1. icons
const svg = (f) => fs.readFileSync(path.join(REPO, f), 'utf8');
const shoot = async (markup, w, h, out) => {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.setContent(`<html><body style="margin:0">${markup}</body></html>`);
  await p.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } }); await p.close();
};
const fav = svg('favicon.svg').replace('<svg ', '<svg width="100%" height="100%" style="display:block;width:SZpx;height:SZpx" ');
const mask = svg('images/brand/mark-maskable.svg').replace('<svg ', '<svg style="display:block;width:SZpx;height:SZpx" ');
await shoot(fav.replaceAll('SZ', 16), 16, 16, path.join(REPO, 'favicon-16x16.png'));
await shoot(fav.replaceAll('SZ', 32), 32, 32, path.join(REPO, 'favicon-32x32.png'));
await shoot(mask.replaceAll('SZ', 180), 180, 180, path.join(REPO, 'apple-touch-icon.png'));
await shoot(mask.replaceAll('SZ', 192), 192, 192, path.join(REPO, 'images/brand/icon-192.png'));
await shoot(mask.replaceAll('SZ', 512), 512, 512, path.join(REPO, 'images/brand/icon-512.png'));
await shoot(mask.replaceAll('SZ', 512), 512, 512, path.join(REPO, 'images/brand/icon-maskable-512.png'));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(REPO, 'favicon-32x32.png'), path.join(REPO, 'favicon.ico')]);
console.log('icons done');

// 2. share cards 1200x630
const site = rd('content/site.json');
const projects = fs.readdirSync(path.join(REPO, 'content/projects')).map((f) => rd('content/projects/' + f));
const home = rd('content/pages/home.json');
const cards = [
  { name: 'home', title: site.person.name, line: site.person.line, img: home.cover.image, pos: '50% 45%' },
  { name: 'work', title: 'Work', line: `${projects.length} projects in Paris, Morocco and Tunisia, 2022 to 2026`, img: 'images/la-villette/la-villette-street-render.jpg' },
  { name: 'research', title: 'Research', line: 'Between the Poetics of Place and the Value of Heritage', img: 'images/al-arg/al-arg-render-courtyard.jpg' },
  { name: 'about', title: 'About', line: site.person.credential, img: 'images/portrait.jpg' },
  { name: 'motion', title: 'Films and motion', line: 'Architectural films and motion graphic reels', img: 'images/zenata/zenata-platform-render.jpg' },
  ...projects.filter((p) => p.hero).map((p) => ({ name: 'project-' + p.slug, title: p.title, line: `${p.descriptor} | ${p.place} | ${p.year}`, img: p.hero.src, credit: p.hero.credit }))
];
const MARK = '<svg viewBox="0 0 64 64" fill="none" stroke="#EDE7DC" stroke-width="1.4" width="44" height="44"><path d="M10 60V27a22 22 0 0 1 44 0v33"/><path d="M32 5v16"/><path d="M0 60h64"/></svg>';
for (const c of cards) {
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto(BASE + '404.html');
  await p.setContent(`<!doctype html><html><head><base href="${BASE}"><style>
@font-face{font-family:G;src:url(fonts/eb-garamond-latin-wght-normal.woff2) format("woff2");font-weight:400 800}
@font-face{font-family:P;src:url(fonts/ibm-plex-sans-latin-wght-normal.woff2) format("woff2");font-weight:100 700}
body{margin:0;width:1200px;height:630px;background:#15110E;color:#EDE7DC;display:grid;grid-template-columns:640px 560px;overflow:hidden}
.t{padding:56px 56px 52px;display:flex;flex-direction:column;justify-content:space-between}
h1{font:500 ${c.title.length > 18 ? 52 : 64}px/1.04 G,serif;letter-spacing:.06em;text-transform:uppercase;margin:0 0 22px}
p{font:400 25px/1.4 P,sans-serif;color:#B3ABA0;margin:0;max-width:30ch}
.who{font:500 15px P,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#B3ABA0}
.r{height:630px;background:#221C18;position:relative}.r img{width:100%;height:100%;object-fit:cover;object-position:${c.pos || '50% 50%'};display:block}
.cr{position:absolute;right:14px;bottom:10px;font:400 14px P,sans-serif;color:#fff;text-shadow:0 0 6px #000}
.rule{width:40px;height:2px;background:#C9805F;margin-bottom:26px}
</style></head><body><div class="t"><div>${MARK}</div><div><div class="rule"></div><h1>${c.title}</h1><p>${c.line}</p></div><div class="who">Hazem Radhouani | Architect</div></div>
<div class="r"><img src="${c.img}">${c.credit ? `<span class="cr">${c.credit}</span>` : ''}</div></body></html>`);
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
  const ok = await p.evaluate(() => document.fonts.check('500 20px G') && [...document.images].every((i) => i.naturalWidth > 0));
  if (!ok) throw new Error('font or image not loaded for ' + c.name);
  await p.screenshot({ path: path.join(REPO, 'images/og', c.name + '.jpg'), type: 'jpeg', quality: 86 });
  await p.close();
}
console.log(`${cards.length} share cards`);
await b.close();
