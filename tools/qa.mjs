// Run: npm run qa  (needs the local server: npm run serve)
// QA harness: every page at six widths. Overflow, broken images, console errors, tiny text,
// small targets, and axe-core (WCAG 2.0/2.1/2.2 A+AA) at 375 and 1440. Usage: node qa.mjs [base] [--shots]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://127.0.0.1:8090/portfolio/';
fs.mkdirSync(path.join(here, '.cache'), { recursive: true });
const SHOTS = process.argv.includes('--shots');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
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
  const row = { page: name, overflow: [], brokenImgs: [], console: [], small: [], targets: [], axe: {} };
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 812 : 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') row.console.push(`${w}: ${m.text().slice(0, 140)}`); });
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
      for (const el of document.querySelectorAll('a[href], button, input, textarea, select, summary')) { if (el.closest('dialog:not([open]), [hidden], .vh') || getComputedStyle(el).display === 'none') continue;
        const b = el.getBoundingClientRect(); if (b.width === 0) continue; if ((b.width < 24 || b.height < 24) && !el.closest('p, li, dd, figcaption, .cap__text')) out.targets.push(`${Math.round(b.width)}x${Math.round(b.height)} ${el.tagName.toLowerCase()}.${el.className}`); }
      return out;
    });
    if (r.ow > 0) row.overflow.push(`${w}px +${r.ow}: ${r.offenders.join(', ')}`);
    row.brokenImgs.push(...r.broken.map((s) => `${w}: ${s}`));
    row.small.push(...r.small.slice(0, 3).map((s) => `${w}: ${s}`));
    row.targets.push(...r.targets.slice(0, 3).map((s) => `${w}: ${s}`));
    if (w === 375 || w === 1440) {
      await page.addScriptTag({ content: axeSrc });
      const res = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`));
      row.axe[w] = res;
    }
    if (SHOTS && (w === 375 || w === 1440)) { await page.evaluate(() => { document.querySelectorAll("img[loading=lazy]").forEach((i) => { i.loading = "eager"; }); document.querySelectorAll(".will-draw").forEach((e) => e.classList.add("is-drawn")); }); await page.waitForLoadState("networkidle"); await page.waitForTimeout(900); }
    if (SHOTS && (w === 375 || w === 1440)) await page.screenshot({ path: path.join(here, '.cache', `${name.replace(/[\/.]/g, '_')}-${w}.jpg`), type: 'jpeg', quality: 60, fullPage: true });
    await ctx.close();
  }
  for (const k of ['brokenImgs', 'small', 'targets', 'console']) row[k] = [...new Set(row[k])].slice(0, 6);
  report.push(row);
  const bad = row.overflow.length + row.brokenImgs.length + row.console.length + (row.axe[375]?.length || 0) + (row.axe[1440]?.length || 0);
  console.log(`${bad ? 'FAIL' : 'ok  '} ${name}${row.overflow.length ? ' | overflow ' + row.overflow.join(' ; ') : ''}${row.brokenImgs.length ? ' | broken ' + row.brokenImgs.join(' ') : ''}${row.console.length ? ' | console ' + row.console.join(' ; ') : ''}${row.axe[375]?.length ? ' | axe375 ' + row.axe[375].join(' ; ') : ''}${row.axe[1440]?.length ? ' | axe1440 ' + row.axe[1440].join(' ; ') : ''}${row.small.length ? ' | small ' + row.small.join(' ; ') : ''}${row.targets.length ? ' | targets ' + row.targets.join(' ; ') : ''}`);
}
fs.writeFileSync(path.join(here, '.cache', 'qa-report.json'), JSON.stringify(report, null, 2));
await browser.close();
