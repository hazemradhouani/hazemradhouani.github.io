// Run: npm run qa  (needs the local server: npm run serve)
// QA harness: every page at six widths. Overflow, broken images, console errors, tiny text,
// small targets, and axe-core (WCAG 2.0/2.1/2.2 A+AA) at 375 and 1440. Field gates (D39): no image
// cropped or enlarged, every block edge on a grid line, cutout corners/edges/detail verified, no
// background colour outside the tokens, and every content string present in its page.
// Usage: node qa.mjs [base] [--shots] [--only=<path part>]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectCutoutRgba } from './lib/cutout-alpha.mjs';
import { loadCutoutConfig } from './lib/cutout-config.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(here, '..');
const ARGS = process.argv.slice(2);
const BASE = ARGS.find((a) => a.startsWith('--base='))?.slice('--base='.length)
  || ARGS.find((a) => !a.startsWith('--'))
  || 'http://127.0.0.1:8090/portfolio/';
fs.mkdirSync(path.join(here, '.cache'), { recursive: true });
const SHOTS = process.argv.includes('--shots');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
let gateFails = 0;

/* ---- content coverage: every content string (not paths, ids or sources) appears in its built page */
{
  const rd = (p) => JSON.parse(fs.readFileSync(path.join(REPO, p), 'utf8'));
  const SKIP = new Set(['source', 'sources', 'og', '$comment', 'id', 'slug', 'group', 'filters', 'order', 'kind', 'size', 'fit', 'lang', 'film', 'knowsAbout',
    'project', 'coverSource', 'abstractSource', 'date', 'action', 'href', 'case',
    'at', 'align', 'swatch']);  // label anchors, alignment and legend colours are not visible copy
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
const THEMES = ['light', 'dark'];
const cutoutInspectorSource = inspectCutoutRgba.toString();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });

// These interaction checks run once per QA execution rather than once per page. The page loop below
// already proves both resolved schemes at every URL and width; this proves the state-changing path.
async function runThemeInteractions() {
  const failures = [];
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 900 }, colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const verify = async (expected, where) => {
    const state = await page.evaluate(() => ({
      theme: document.documentElement.getAttribute('data-theme'),
      saved: (() => { try { return localStorage.getItem('hazem-theme'); } catch (e) { return 'storage-error'; } })(),
      chrome: document.getElementById('theme-color')?.getAttribute('content'),
      controls: [...document.querySelectorAll('[data-theme-toggle]')].map((b) => ({ pressed: b.getAttribute('aria-pressed'), label: b.getAttribute('aria-label'), text: b.querySelector('[data-theme-label]')?.textContent?.trim() }))
    }));
    if (state.theme !== expected) failures.push(`${where}: theme ${state.theme}, expected ${expected}`);
    if (state.saved !== expected) failures.push(`${where}: stored ${state.saved}, expected ${expected}`);
    if (state.chrome !== (expected === 'dark' ? '#121311' : '#FFFFFF')) failures.push(`${where}: theme-color ${state.chrome}`);
    for (const control of state.controls) {
      if (control.pressed !== String(expected === 'dark')) failures.push(`${where}: unsynchronised aria-pressed`);
      if (control.label !== (expected === 'dark' ? 'Switch to light theme' : 'Switch to dark theme')) failures.push(`${where}: incorrect control action`);
      if (control.text !== `theme: ${expected}`) failures.push(`${where}: incorrect visible control label`);
    }
  };
  try {
    await page.goto(BASE + 'index.html', { waitUntil: 'load' });
    await page.locator('[data-theme-scope="header"]').focus();
    await page.locator('[data-theme-scope="header"]').press('Enter');
    await verify('dark', 'header keyboard toggle');
    await page.reload({ waitUntil: 'load' });
    await verify('dark', 'persistence through reload');
    await page.goto(BASE + 'about.html', { waitUntil: 'load' });
    await verify('dark', 'persistence through navigation');
  } catch (e) { failures.push(`header/persistence interaction: ${e.message}`); }
  await ctx.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const mobilePage = await mobile.newPage();
  try {
    await mobilePage.goto(BASE + 'index.html', { waitUntil: 'load' });
    await mobilePage.locator('.menu-button').first().click();
    await mobilePage.locator('#menu[open] [data-theme-scope="menu"]').focus();
    await mobilePage.locator('#menu[open] [data-theme-scope="menu"]').press('Enter');
    const state = await mobilePage.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme'), all: [...document.querySelectorAll('[data-theme-toggle]')].every((b) => b.getAttribute('aria-pressed') === 'false') }));
    if (state.theme !== 'light' || !state.all) failures.push('mobile menu keyboard toggle did not synchronise light preference');
  } catch (e) { failures.push(`mobile menu interaction: ${e.message}`); }
  await mobile.close();
  return failures;
}

async function runThemeFallback() {
  const failures = [];
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  await ctx.addInitScript(() => {
    try { Storage.prototype.getItem = function () { throw new Error('storage blocked for QA'); }; } catch (e) {}
  });
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + 'index.html', { waitUntil: 'load' });
    const state = await page.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme'), chrome: document.getElementById('theme-color')?.getAttribute('content') }));
    if (state.theme !== 'dark' || state.chrome !== '#121311') failures.push(`storage fallback resolved ${state.theme}/${state.chrome}, expected dark/#121311`);
  } catch (e) { failures.push(`storage fallback: ${e.message}`); }
  await ctx.close();
  return failures;
}

const themeWorkflowFailures = [...await runThemeInteractions(), ...await runThemeFallback()];
gateFails += themeWorkflowFailures.length;
if (themeWorkflowFailures.length) console.log(`FAIL theme interaction/fallback: ${themeWorkflowFailures.join(' | ')}`);
else console.log('ok   theme interaction/fallback: keyboard, persistence, navigation, menu and storage fallback');
const report = [];
for (const url of urls) {
  const name = url.replace(BASE, '') || 'index';
  const row = { page: name, overflow: [], brokenImgs: [], console: [], small: [], targets: [], axe: {}, crop: [], upscale: [], grid: [], palette: [], alpha: [], fringe: [], theme: [], labels: [] };
  for (const w of WIDTHS) {
    for (const theme of THEMES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 812 : 900 }, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: 'reduce' });
    await ctx.addInitScript((chosenTheme) => { try { localStorage.setItem('hazem-theme', chosenTheme); } catch (e) {} }, theme);
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error' && !(url.includes('does-not-exist') && m.text().includes('status of 404'))) row.console.push(`${theme}/${w}: ${m.text().slice(0, 140)}`); });
    page.on('pageerror', (e) => row.console.push(`${theme}/${w}: ${e.message.slice(0, 140)}`));
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(400);
    const r = await page.evaluate((theme) => {
      const de = document.documentElement; const out = { ow: de.scrollWidth - de.clientWidth, offenders: [], broken: [], small: [], targets: [], theme: [] };
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
        if (img.complete && img.naturalWidth && Math.abs(img.naturalWidth / img.naturalHeight - w / h) / (w / h) > Math.max(0.02, 1.01 / Math.min(img.naturalWidth, img.naturalHeight))) out.crop.push(`${img.currentSrc.split('/').pop()} served ratio ${img.naturalWidth}x${img.naturalHeight} vs ${w}x${h}`);
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
      // palette: no background colour outside the active Field tokens. Rendered scenes are skipped;
      // they carry their authored colour and do not define interface surfaces.
      const ok = theme === 'dark'
        ? new Set(['rgba(0, 0, 0, 0)', 'rgb(18, 19, 17)', 'rgb(247, 245, 239)', 'rgb(69, 70, 63)', 'rgba(18, 19, 17, 0.88)'])
        : new Set(['rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(17, 17, 17)', 'rgba(255, 255, 255, 0.86)']);
      if (innerWidth === 375 || innerWidth === 1440) for (const el of [document.documentElement, document.body, ...document.querySelectorAll('body *')]) {
        if (el.closest('video, svg, .legend__sw, .lab__pin')) continue;
        const c = getComputedStyle(el).backgroundColor; if (!ok.has(c)) out.palette.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${c}`);
      }
      // dark treatments (D50): inverted linework is filtered only in the dark scheme; the inspection
      // field shows only in the dark scheme; light pages show every drawing as authored
      for (const el of document.querySelectorAll('main .nw--drawing')) {
        const img = el.querySelector('img'); if (!img) continue;
        const f = getComputedStyle(img).filter; const bg = getComputedStyle(el).backgroundColor;
        const kind = ['invert-accent', 'invert', 'field', 'object'].find((k) => el.classList.contains(`nw--${k}`)) || 'none';
        const name = (img.getAttribute('src') || '').split('/').pop();
        if (theme === 'light' && f !== 'none') out.theme.push(`${name} filtered in light: ${f}`);
        if (theme === 'dark' && kind.startsWith('invert') && !/invert\(0\.965\)/u.test(f)) out.theme.push(`${name} ${kind} not inverted in dark: ${f}`);
        if (theme === 'dark' && kind === 'invert-accent' && !/hue-rotate\(180deg\)/u.test(f)) out.theme.push(`${name} invert-accent without hue-rotate: ${f}`);
        if (theme === 'dark' && kind === 'field' && bg !== 'rgb(247, 245, 239)') out.theme.push(`${name} field drawing without its inspection field: ${bg}`);
        if (theme === 'dark' && kind !== 'field' && bg !== 'rgba(0, 0, 0, 0)') out.theme.push(`${name} ${kind} drawing has a background: ${bg}`);
      }
      // labels re-set from a drawing (D49): in place, they stay inside the drawing and never overlap
      out.labels = [];
      for (const lab of document.querySelectorAll('.lab')) {
        const box = lab.getBoundingClientRect(); const items = [...lab.querySelectorAll('.lab__item')];
        if (getComputedStyle(items[0] || lab).position !== 'absolute') continue;   // narrow: pins and a list
        const rs = items.map((it) => it.getBoundingClientRect());
        rs.forEach((r, i) => {
          if (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1) out.labels.push(`"${items[i].textContent.trim()}" outside its drawing`);
          for (let j = i + 1; j < rs.length; j++) { const q = rs[j]; if (r.left < q.right && q.left < r.right && r.top < q.bottom && q.top < r.bottom) out.labels.push(`"${items[i].textContent.trim()}" overlaps "${items[j].textContent.trim()}"`); }
        });
      }
      if (de.getAttribute('data-theme') !== theme) out.theme.push(`resolved ${de.getAttribute('data-theme') || 'none'}, expected ${theme}`);
      if (getComputedStyle(de).colorScheme !== theme) out.theme.push(`color-scheme ${getComputedStyle(de).colorScheme}, expected ${theme}`);
      const controls = [...document.querySelectorAll('[data-theme-toggle]')];
      if (controls.length !== 3) out.theme.push(`theme controls ${controls.length}, expected 3`);
      else for (const control of controls) {
        const expectedPressed = String(theme === 'dark');
        const expectedAction = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
        const label = control.querySelector('[data-theme-label]')?.textContent?.trim();
        if (control.getAttribute('aria-pressed') !== expectedPressed) out.theme.push(`${control.dataset.themeScope} aria-pressed ${control.getAttribute('aria-pressed')}`);
        if (control.getAttribute('aria-label') !== expectedAction) out.theme.push(`${control.dataset.themeScope} aria-label ${control.getAttribute('aria-label')}`);
        if (label !== `theme: ${theme}`) out.theme.push(`${control.dataset.themeScope} label ${label}`);
      }
      return out;
    }, theme);
    row.crop.push(...r.crop.map((s) => `${theme}/${w}: ${s}`)); row.upscale.push(...r.upscale.map((s) => `${theme}/${w}: ${s}`));
    row.grid.push(...r.grid.map((s) => `${theme}/${w}: ${s}`)); row.labels.push(...r.labels.map((s) => `${theme}/${w}: ${s}`)); row.palette.push(...r.palette.map((s) => `${theme}/${w}: ${s}`)); row.theme.push(...r.theme.map((s) => `${theme}/${w}: ${s}`));
    // alpha: every cutout keeps a transparent corner (decoded in the page, at 1440 only)
    // (drawings declared full-bleed in tools/cutout.json, with a reason, have no paper inside their frame)
    const fullBleed = Object.keys(loadCutoutConfig(REPO).fullBleed)
      .map((s) => s.split('/').pop().replace(/\.\w+$/, ''));
    if (w === 1440) {
      const cutout = await page.evaluate(async ({ fullBleed, inspectorSource }) => {
        // The function is serialised from the tested local helper rather than duplicated here.
        const inspectCutoutRgba = Function(`return (${inspectorSource});`)();
        const bad = []; const fringe = [];
      for (const img of document.querySelectorAll('main img[src*="images/cut/"], main img[src*="thesis-book"]')) {
        if (fullBleed.some((s) => img.getAttribute('src').includes(s))) continue;
        img.loading = 'eager';
        const ok = await Promise.race([img.decode().then(() => true, () => false), new Promise((r) => setTimeout(() => r(false), 4000))]);
        if (!ok || !img.naturalWidth) { bad.push(`${img.getAttribute('src').split('/').pop()} did not load`); continue; }
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        const x = c.getContext('2d'); x.drawImage(img, 0, 0);
        const a = [[0, 0], [c.width - 1, 0], [0, c.height - 1], [c.width - 1, c.height - 1]].map(([i, j]) => x.getImageData(i, j, 1, 1).data[3]);
        if (Math.min(...a) > 0) bad.push(`${img.currentSrc.split('/').pop()} corners alpha ${a.join(',')}`);
        if (!img.getAttribute('src').includes('images/cut/')) continue;
        const check = inspectCutoutRgba(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
        if (check.opaqueWhiteEdge > 3) fringe.push(`${img.currentSrc.split('/').pop()} opaque white edge samples ${check.opaqueWhiteEdge}`);
        if (!check.hasDetail) fringe.push(`${img.currentSrc.split('/').pop()} no partial-alpha detail`);
        const lab = img.closest('.lab');
        if (lab) for (const it of lab.querySelectorAll('.lab__item')) {
          if (getComputedStyle(it).position !== 'absolute') continue;
          const ib = img.getBoundingClientRect(); const lb = it.getBoundingClientRect(); const k = c.width / ib.width;
          const x0 = Math.max(0, Math.floor((lb.left - ib.left) * k)), y0 = Math.max(0, Math.floor((lb.top - ib.top) * k));
          const ww = Math.min(c.width - x0, Math.ceil(lb.width * k)), hh = Math.min(c.height - y0, Math.ceil(lb.height * k));
          if (ww < 1 || hh < 1) continue;
          const d = x.getImageData(x0, y0, ww, hh).data; let inked = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 76) inked++;
          if (inked / (ww * hh) > 0.005) fringe.push(`label "${it.textContent.trim()}" sits on the drawing (${(100 * inked / (ww * hh)).toFixed(1)}% ink beneath)`);
        }
      }
        return { bad, fringe };
      }, { fullBleed, inspectorSource: cutoutInspectorSource });
      row.alpha.push(...cutout.bad.map((s) => `${theme}/${w}: ${s}`));
      row.fringe.push(...cutout.fringe.map((s) => `${theme}/${w}: ${s}`));
    }
    if (r.ow > 0) row.overflow.push(`${theme}/${w}px +${r.ow}: ${r.offenders.join(', ')}`);
    row.brokenImgs.push(...r.broken.map((s) => `${theme}/${w}: ${s}`));
    row.small.push(...r.small.slice(0, 3).map((s) => `${theme}/${w}: ${s}`));
    row.targets.push(...r.targets.slice(0, 3).map((s) => `${theme}/${w}: ${s}`));
    if (w === 375 || w === 1440) {
      await page.addScriptTag({ content: axeSrc });
      const res = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`));
      row.axe[`${theme}-${w}`] = res;
    }
    if (SHOTS && (w === 375 || w === 1440)) { await page.evaluate(() => { document.querySelectorAll("img[loading=lazy]").forEach((i) => { i.loading = "eager"; }); document.querySelectorAll(".rv").forEach((e) => e.classList.add("is-in")); }); await page.waitForLoadState("networkidle"); await page.waitForTimeout(900); }
    if (SHOTS && (w === 375 || w === 1440)) await page.screenshot({ path: path.join(here, '.cache', `${name.replace(/[\/.]/g, '_')}-${theme}-${w}.jpg`), type: 'jpeg', quality: 60, fullPage: true });
    await ctx.close();
    }
  }
  for (const k of ['brokenImgs', 'small', 'targets', 'console', 'crop', 'upscale', 'grid', 'palette', 'alpha', 'fringe', 'theme', 'labels']) row[k] = [...new Set(row[k])];
  report.push(row);
  const gates = row.crop.length + row.upscale.length + row.grid.length + row.palette.length + row.alpha.length + row.fringe.length + row.theme.length + row.labels.length;
  gateFails += gates;
  const axeBad = Object.values(row.axe).reduce((n, items) => n + items.length, 0);
  const bad = gates + row.overflow.length + row.brokenImgs.length + row.console.length + axeBad;
  const list = (k, n = 4) => (row[k].length ? ` | ${k} (${row[k].length}) ${row[k].slice(0, n).join(' ; ')}` : '');
  const axeList = Object.entries(row.axe).filter(([, items]) => items.length).map(([key, items]) => ` | axe${key} ${items.join(' ; ')}`).join('');
  console.log(`${bad ? 'FAIL' : 'ok  '} ${name}${row.overflow.length ? ' | overflow ' + row.overflow.join(' ; ') : ''}${list('brokenImgs')}${list('console', 2)}${axeList}${list('crop')}${list('upscale')}${list('grid')}${list('palette')}${list('alpha')}${list('fringe')}${list('theme')}${list('labels')}${list('small', 3)}${list('targets', 3)}`);
}
fs.writeFileSync(path.join(here, '.cache', 'qa-report.json'), JSON.stringify(report, null, 2));
await browser.close();
console.log(gateFails ? `Field gates: ${gateFails} failure(s)` : 'Field gates: all pass (crop, upscale, grid, palette, alpha/fringe/detail, dark treatments, labels, content coverage)');
const failed = themeWorkflowFailures.length || report.some((r) => r.overflow.length || r.brokenImgs.length || r.console.length || Object.values(r.axe).some((items) => items.length));
if (gateFails || failed) process.exitCode = 1;
