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
const years = projects.map((p) => parseInt(p.year, 10)).filter(Number.isFinite);
// Field cards (D35): a white field, the image contained at its natural ratio (never cropped), credits kept
const cards = [
  { name: 'home', title: site.person.name, line: site.person.line, img: home.flagship.hero.image },
  { name: 'work', title: 'Work', line: `${projects.length} projects in Tunisia, France and Morocco, ${Math.min(...years)} to ${Math.max(...years)}`, img: 'images/la-villette/la-villette-street-render-hq.jpg', credit: 'Render: Studio BELEM' },
  { name: 'research', title: 'Research', line: 'Between the Poetics of Place and the Value of Heritage', img: 'images/books/thesis-book-closed.png' },
  { name: 'about', title: 'About', line: site.person.credential, img: 'images/portrait.jpg' },
  { name: 'motion', title: 'Films and motion', line: 'Architectural films and motion graphic reels', img: 'images/zenata/zenata-platform-render.jpg' },
  ...projects.filter((p) => p.hero).map((p) => ({ name: 'project-' + p.slug, title: p.title, line: `${p.descriptor} | ${p.place} | ${p.year}`, img: p.hero.src, credit: p.hero.credit }))
];
for (const c of cards) {
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto(BASE + '404.html');
  await p.setContent(`<!doctype html><html><head><base href="${BASE}"><style>
@font-face{font-family:G;src:url(fonts/eb-garamond-latin-wght-normal.woff2) format("woff2");font-weight:400 800}
@font-face{font-family:P;src:url(fonts/ibm-plex-sans-latin-wght-normal.woff2) format("woff2");font-weight:100 700}
body{margin:0;width:1200px;height:630px;background:#fff;color:#111;display:grid;grid-template-columns:560px 640px;overflow:hidden}
.t{padding:60px 40px 56px 64px;display:flex;flex-direction:column;justify-content:space-between}
.who{font:600 15px P,sans-serif;letter-spacing:.22em;text-transform:uppercase}
h1{font:600 ${c.title.length > 18 ? 40 : 52}px/1.12 P,sans-serif;letter-spacing:.08em;text-transform:uppercase;margin:0 0 20px}
p{font:400 30px/1.35 G,serif;color:#111;margin:0;max-width:24ch}
.r{height:630px;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:48px 56px 40px 24px;box-sizing:border-box}
.r img{max-width:100%;max-height:505px;width:auto;height:auto;object-fit:contain;display:block}
.cr{margin-top:10px;font:400 17px G,serif;color:#5E5E5E;align-self:flex-end}
</style></head><body><div class="t"><div class="who">Hazem Radhouani</div><div><h1>${c.title}</h1><p>${c.line}</p></div><div class="who" style="color:#5E5E5E;font-size:13px">Architect</div></div>
<div class="r"><img src="${c.img}">${c.credit ? `<span class="cr">${c.credit}</span>` : ''}</div></body></html>`);
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
  const ok = await p.evaluate(() => document.fonts.check('600 20px P') && document.fonts.check('400 20px G') && [...document.images].every((i) => i.naturalWidth > 0));
  if (!ok) throw new Error('font or image not loaded for ' + c.name);
  await p.screenshot({ path: path.join(REPO, 'images/og', c.name + '.jpg'), type: 'jpeg', quality: 86 });
  await p.close();
}
console.log(`${cards.length} share cards`);
await b.close();
