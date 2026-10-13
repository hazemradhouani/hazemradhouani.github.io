// Run: npm run qa  (needs the local server: npm run serve)
// QA harness: every page at six widths. Overflow, broken images, console errors, tiny text,
// small targets, and axe-core (WCAG 2.0/2.1/2.2 A+AA) at 375 and 1440. Field gates (D39): no image
// cropped or enlarged, every block edge on a grid line, cutout corners transparent, no background
// colour outside the tokens, and every content string present in its page.
// Usage: node qa.mjs [base] [--shots] [--only=<path part>]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(here, '..');
const BASE = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'http://127.0.0.1:8090/portfolio/';
fs.mkdirSync(path.join(here, '.cache'), { recursive: true });
const SHOTS = process.argv.includes('--shots');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
let gateFails = 0;

/* ---- content coverage: every content string (not paths, ids or sources) appears in its built page */
{
  const rd = (p) => JSON.parse(fs.readFileSync(path.join(REPO, p), 'utf8'));
  const SKIP = new Set(['source', 'sources', 'og', '$comment', 'id', 'slug', 'group', 'filters', 'order', 'kind', 'size', 'fit', 'lang', 'film',
    'project', 'coverSource', 'abstractSource', 'date', 'action', 'href', 'case']);
  const strings = (v, key = '', out = []) => {
    if (SKIP.has(key) || /Source$/.test(key)) return out;
    if (typeof v === 'string') { if (v.length > 2 && !/^(images|videos|files|projects)\/|\.(jpe?g|png|webp|mp4)$/i.test(v)) out.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => strings(x, key, out));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) strings(x, k, out);
    return out;
  };
  const dec = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const norm = (s) => s.replace(/\*([^*]+)\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
  const page = (rel) => { const h = fs.readFileSync(path.join(REPO, rel), 'utf8'); return norm(dec(h) + ' ' + dec(h.replace(/<[^>]+>/g, ' '))); };
  const site = rd('content/site.json');
  const map = [['content/pages/home.json', 'index.html'], ['content/pages/research.json', 'books.html'], ['content/pages/about.json', 'about.html'],
    ['content/pages/motion.json', 'motion.html'], ...fs.readdirSync(path.join(REPO, 'content/projects')).map((f) => [`content/projects/${f}`, `projects/project-${f.replace('.json', '')}.html`])];
  const missing = [];
  for (const s of strings(site.person)) if (!page('index.html').includes(norm(s))) missing.push(`index.html: ${s.slice(0, 60)}`);
  // left out on purpose, with the decision: the home cover photograph (D37)
  const unused = { 'content/pages/home.json': (d) => { delete d.cover; return d; } };
  for (const [src, rel] of map) { const hay = page(rel); for (const s of strings((unused[src] || ((d) => d))(rd(src)))) if (!hay.includes(norm(s))) missing.push(`${rel}: ${s.slice(0, 70)}`); }
  console.log(missing.length ? `FAIL content coverage: ${missing.length} missing\n  ${missing.slice(0, 20).join('\n  ')}` : 'ok   content coverage: every content string is on its page');
  gateFails += missing.length;
}
const axeSrc = fs.readFileSync(path.join(here, '..', 'node_modules/axe-core/axe.min.js'), 'utf8');
const sitemap = await (await fetch(BASE + 'sitemap.xml')).text();
let urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace('https://hazemradhouani.github.io/portfolio/', BASE));
urls.push(BASE + '404.html', BASE + 'does-not-exist/x.html');
if (ONLY) urls = urls.filter((u) => u.includes(ONLY));
const WIDTHS = [320, 375, 768, 1024, 1440, 1920];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const report = [];
for (const url of urls) {
  const name = url.replace(BASE, '') || 'index';
  const row = { page: name, overflow: [], brokenImgs: [], console: [], small: [], targets: [], axe: {}, crop: [], upscale: [], grid: [], palette: [], alpha: [] };
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 812 : 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error' && !(url.includes('does-not-exist') && m.text().includes('status of 404'))) row.console.push(`${w}: ${m.text().slice(0, 140)}`); });
    page.on('pageerror', (e) => row.console.push(`${w}: ${e.message.slice(0, 140)}`));
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const de = document.documentElement; const out = { ow: de.scrollWidth - de.clientWidth, offenders: [], broken: [], small: [], targets: [] };
      if (out.ow > 0) for (const el of document.querySelectorAll('body *')) { const b = el.getBoundingClientRect(); if (b.right > de.clientWidth + 1 && b.width > 0) { out.offenders.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`); if (out.offenders.length > 4) break; } }
      for (const img of document.images) if (img.complete && img.naturalWidth === 0) out.broken.push(img.getAttribute('src'));
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) { const t = walker.currentNode; if (!t.textContent.trim()) continue; const el = t.parentElement; const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || el.closest('.vh,[hidden],dialog:not([open])')) continue; const fs = parseFloat(cs.fontSize); if (fs < 13) out.small.push(`${fs}px ${el.tagName.toLowerCase()}.${el.className}`); }
      for (const el of document.querySelectorAll('a[href], button, input, textarea, select, summary')) { if (el.closest('dialog:not([open]), [hidden], .vh, [inert]') || getComputedStyle(el).display === 'none') continue;
        const b = el.getBoundingClientRect(); if (b.width === 0) continue; if ((b.width < 24 || b.height < 24) && !el.closest('p, li, dd, figcaption, .cap__text')) out.targets.push(`${Math.round(b.width)}x${Math.round(b.height)} ${el.tagName.toLowerCase()}.${el.className}`); }
      // Field gates. crop: rendered ratio within 1% of the master's, never object-fit: cover; upscale: never wider than the master
      out.crop = []; out.upscale = []; out.grid = []; out.palette = [];
      for (const img of document.querySelectorAll('main img')) {
        const b = img.getBoundingClientRect(); const w = +img.getAttribute('width'), h = +img.getAttribute('height');
        if (!b.width || !w || !h) continue;
        const src = img.getAttribute('src');
        if (Math.abs(b.width / b.height - w / h) / (w / h) > 0.01) out.crop.push(`${src} ${Math.round(b.width)}x${Math.round(b.height)} vs ${w}x${h}`);
        if (getComputedStyle(img).objectFit === 'cover') out.crop.push(`${src} object-fit: cover`);
        if (b.width > w + 1) out.upscale.push(`${src} ${Math.round(b.width)}px > ${w}px`);
        // the file actually served (a derivative) must have the master's ratio, or the browser stretches it
        if (img.complete && img.naturalWidth && Math.abs(img.naturalWidth / img.naturalHeight - w / h) / (w / h) > 0.02) out.crop.push(`${img.currentSrc.split('/').pop()} served ratio ${img.naturalWidth}x${img.naturalHeight} vs ${w}x${h}`);
      }
      // grid: every block placed on a .g sits between column lines (1px tolerance)
      for (const g of document.querySelectorAll('.g')) {
        const gb = g.getBoundingClientRect(); if (!gb.width) continue;
        const cs = getComputedStyle(g); const tracks = cs.gridTemplateColumns.split(' ').map(parseFloat); const gap = parseFloat(cs.columnGap) || 0;
        const lines = []; let x = gb.left + parseFloat(cs.paddingLeft); tracks.forEach((t) => { lines.push(x); x += t; lines.push(x); x += gap; });
        const on = (v) => lines.some((l) => Math.abs(l - v) <= 1);
        for (const k of g.children) {
          const kb = k.getBoundingClientRect(); if (!kb.width || getComputedStyle(k).position === 'absolute') continue;
          if (!on(kb.left) || !on(kb.right)) out.grid.push(`${k.tagName.toLowerCase()}.${[...k.classList].join('.')} ${Math.round(kb.left)}-${Math.round(kb.right)}`);
        }
      }
      // palette: no background colour outside the tokens (white field, ink, the translucent bar)
      const ok = new Set(['rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(17, 17, 17)', 'rgba(255, 255, 255, 0.86)']);
      if (innerWidth === 375 || innerWidth === 1440) for (const el of [document.documentElement, document.body, ...document.querySelectorAll('body *')]) {
        if (el.closest('video, svg')) continue;
        const c = getComputedStyle(el).backgroundColor; if (!ok.has(c)) out.palette.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${c}`);
      }
      return out;
    });
    row.crop.push(...r.crop.map((s) => `${w}: ${s}`)); row.upscale.push(...r.upscale.map((s) => `${w}: ${s}`));
    row.grid.push(...r.grid.map((s) => `${w}: ${s}`)); row.palette.push(...r.palette.map((s) => `${w}: ${s}`));
    // alpha: every cutout keeps a transparent corner (decoded in the page, at 1440 only)
    // (drawings declared full-bleed in tools/cutout.json, with a reason, have no paper inside their frame)
    const fullBleed = Object.keys(JSON.parse(fs.readFileSync(path.join(REPO, 'tools/cutout.json'), 'utf8')).fullBleed || {})
      .map((s) => s.split('/').pop().replace(/\.\w+$/, ''));
    if (w === 1440) row.alpha.push(...await page.evaluate(async (fullBleed) => {
      const bad = [];
      for (const img of document.querySelectorAll('main img[src*="images/cut/"], main img[src*="thesis-book"]')) {
        if (fullBleed.some((s) => img.getAttribute('src').includes(s))) continue;
        img.loading = 'eager';
        const ok = await Promise.race([img.decode().then(() => true, () => false), new Promise((r) => setTimeout(() => r(false), 4000))]);
        if (!ok || !img.naturalWidth) { bad.push(`${img.getAttribute('src').split('/').pop()} did not load`); continue; }
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        const x = c.getContext('2d'); x.drawImage(img, 0, 0);
        const a = [[0, 0], [c.width - 1, 0], [0, c.height - 1], [c.width - 1, c.height - 1]].map(([i, j]) => x.getImageData(i, j, 1, 1).data[3]);
        if (Math.min(...a) > 0) bad.push(`${img.currentSrc.split('/').pop()} corners alpha ${a.join(',')}`);
      }
      return bad;
    }, fullBleed));
    if (r.ow > 0) row.overflow.push(`${w}px +${r.ow}: ${r.offenders.join(', ')}`);
    row.brokenImgs.push(...r.broken.map((s) => `${w}: ${s}`));
    row.small.push(...r.small.slice(0, 3).map((s) => `${w}: ${s}`));
    row.targets.push(...r.targets.slice(0, 3).map((s) => `${w}: ${s}`));
    if (w === 375 || w === 1440) {
      await page.addScriptTag({ content: axeSrc });
      const res = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`));
      row.axe[w] = res;
    }
    if (SHOTS && (w === 375 || w === 1440)) { await page.evaluate(() => { document.querySelectorAll("img[loading=lazy]").forEach((i) => { i.loading = "eager"; }); document.querySelectorAll(".rv").forEach((e) => e.classList.add("is-in")); }); await page.waitForLoadState("networkidle"); await page.waitForTimeout(900); }
    if (SHOTS && (w === 375 || w === 1440)) await page.screenshot({ path: path.join(here, '.cache', `${name.replace(/[\/.]/g, '_')}-${w}.jpg`), type: 'jpeg', quality: 60, fullPage: true });
    await ctx.close();
  }
  for (const k of ['brokenImgs', 'small', 'targets', 'console', 'crop', 'upscale', 'grid', 'palette', 'alpha']) row[k] = [...new Set(row[k])];
  report.push(row);
  const gates = row.crop.length + row.upscale.length + row.grid.length + row.palette.length + row.alpha.length;
  gateFails += gates;
  const bad = gates + row.overflow.length + row.brokenImgs.length + row.console.length + (row.axe[375]?.length || 0) + (row.axe[1440]?.length || 0);
  const list = (k, n = 4) => (row[k].length ? ` | ${k} (${row[k].length}) ${row[k].slice(0, n).join(' ; ')}` : '');
  console.log(`${bad ? 'FAIL' : 'ok  '} ${name}${row.overflow.length ? ' | overflow ' + row.overflow.join(' ; ') : ''}${list('brokenImgs')}${list('console', 2)}${row.axe[375]?.length ? ' | axe375 ' + row.axe[375].join(' ; ') : ''}${row.axe[1440]?.length ? ' | axe1440 ' + row.axe[1440].join(' ; ') : ''}${list('crop')}${list('upscale')}${list('grid')}${list('palette')}${list('alpha')}${list('small', 3)}${list('targets', 3)}`);
}
fs.writeFileSync(path.join(here, '.cache', 'qa-report.json'), JSON.stringify(report, null, 2));
await browser.close();
console.log(gateFails ? `Field gates: ${gateFails} failure(s)` : 'Field gates: all pass (crop, upscale, grid, palette, alpha, content coverage)');
const failed = report.some((r) => r.overflow.length || r.brokenImgs.length || r.console.length || r.axe[375]?.length || r.axe[1440]?.length);
if (gateFails || failed) process.exitCode = 1;
