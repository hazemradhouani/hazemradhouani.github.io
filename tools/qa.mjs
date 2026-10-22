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
  || 'http://127.0.0.1:8090/';
fs.mkdirSync(path.join(here, '.cache'), { recursive: true });
const SHOTS = process.argv.includes('--shots');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
let gateFails = 0;

/* ---- content coverage: every content string (not paths, ids or sources) appears in its built page */
{
  const rd = (p) => JSON.parse(fs.readFileSync(path.join(REPO, p), 'utf8'));
  const SKIP = new Set(['source', 'sources', 'og', 'id', 'slug', 'group', 'filters', 'order', 'kind', 'size', 'fit', 'lang', 'film', 'knowsAbout',
    'project', 'coverSource', 'abstractSource', 'date', 'action', 'href', 'case',
    'at', 'align', 'swatch', 'mark', 'dir', 'layout', 'layers', 'why']);  // label anchors, alignment, key colours and marks, composition data and its reasons are not visible copy
  const strings = (v, key = '', out = []) => {
    if (SKIP.has(key) || key.startsWith('$') || /Source$/.test(key)) return out;
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
  // strings left out of a page on purpose, each with its decision (none at present; D116 adds the case studies' repeats)
  const unused = {};
  for (const [src, rel] of map) { const hay = page(rel); for (const s of strings((unused[src] || ((d) => d))(rd(src)))) if (!hay.includes(norm(s))) missing.push(`${rel}: ${s.slice(0, 70)}`); }
  console.log(missing.length ? `FAIL content coverage: ${missing.length} missing\n  ${missing.slice(0, 20).join('\n  ')}` : 'ok   content coverage: every content string is on its page');
  gateFails += missing.length;
}
const axeSrc = fs.readFileSync(path.join(here, '..', 'node_modules/axe-core/axe.min.js'), 'utf8');
// a file: base runs the gates without the local server, straight from the built files; the two 404 checks
// need the server's routing (the 404 page links from the site root) and are skipped, and said so
const FILE = BASE.startsWith('file:');
const sitemap = FILE ? fs.readFileSync(path.join(REPO, 'sitemap.xml'), 'utf8') : await (await fetch(BASE + 'sitemap.xml')).text();
const LIVE = (({ origin, base }) => origin + base)(JSON.parse(fs.readFileSync(path.join(REPO, 'content/site.json'), 'utf8')));
let urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(LIVE, BASE))
  .map((u) => (FILE && u.endsWith('/') ? u + 'index.html' : u));   // the server answers a folder with its index.html
if (FILE) console.log('note  file: base, no server: 404.html and the missing-page check are not run');
else urls.push(BASE + '404.html', BASE + 'does-not-exist/x.html');
if (ONLY) urls = urls.filter((u) => u.includes(ONLY));
const WIDTHS = [320, 375, 768, 1024, 1440, 1920];
const THEMES = ['light', 'dark'];
const cutoutInspectorSource = inspectCutoutRgba.toString();
// from files, one page's images are same-origin only with this flag (the cutout gates read their pixels)
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true,
  args: FILE ? ['--allow-file-access-from-files'] : [] });

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
      controls: [...document.querySelectorAll('[data-theme-toggle]')].map((b) => ({ overridden: b.hasAttribute('aria-label') || b.hasAttribute('aria-pressed'), action: b.querySelector('[data-theme-action]')?.textContent, text: b.querySelector('[data-theme-label]')?.textContent?.trim() }))
    }));
    if (state.theme !== expected) failures.push(`${where}: theme ${state.theme}, expected ${expected}`);
    if (state.saved !== expected) failures.push(`${where}: stored ${state.saved}, expected ${expected}`);
    if (state.chrome !== (expected === 'dark' ? '#121311' : '#FFFFFF')) failures.push(`${where}: theme-color ${state.chrome}`);
    for (const control of state.controls) {
      if (control.overridden) failures.push(`${where}: control name overridden by aria-label or aria-pressed`);
      if (control.action !== `, switch to ${expected === 'dark' ? 'light' : 'dark'}`) failures.push(`${where}: incorrect control action`);
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
    // D108: under reduced motion the change is instant (in the click's own task, no view transition)
    const instant = await page.evaluate(() => { document.querySelector('[data-theme-scope="header"]').click(); return { theme: document.documentElement.getAttribute('data-theme'), vt: document.documentElement.classList.contains('theme-vt') }; });
    if (instant.theme !== 'light' || instant.vt) failures.push(`reduced motion: the change was not instant (${instant.theme}, theme-vt ${instant.vt})`);
    await verify('light', 'reduced-motion toggle');
    // another open page follows through the storage event; a page left before the change shows it after Back
    const other = await ctx.newPage();
    await other.goto(BASE + 'architecture.html', { waitUntil: 'load' });
    await page.evaluate(() => document.querySelector('[data-theme-scope="header"]').click());   // a background tab: no frames for a pointer click
    await other.bringToFront();
    await other.waitForTimeout(300);
    if (await other.evaluate(() => document.documentElement.getAttribute('data-theme')) !== 'dark') failures.push('a second open page did not follow the change (storage)');
    await other.goto(BASE + 'books.html', { waitUntil: 'load' });   // (from a file: base the name's "./" is a folder)
    await other.locator('[data-theme-scope="header"]').click();
    await other.goBack({ waitUntil: 'load' });
    await other.waitForTimeout(200);
    if (await other.evaluate(() => document.documentElement.getAttribute('data-theme')) !== 'light') failures.push('Back did not show the theme chosen on the next page');
    await other.close();
  } catch (e) { failures.push(`header/persistence interaction: ${e.message}`); }
  await ctx.close();

  // D108 with motion: a click starts the feathered reveal, a second one mid-reveal runs it back, a third forward
  // again; the page always ends in the scheme of the last click, with no console error from a skipped transition
  const live = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', reducedMotion: 'no-preference' });
  await live.addInitScript(() => { try { if (!sessionStorage.getItem('qa-seeded')) { localStorage.setItem('hazem-theme', 'light'); sessionStorage.setItem('qa-seeded', '1'); } } catch (e) {} });
  const lp = await live.newPage();
  const errors = [];
  lp.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
  lp.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));
  const state = () => lp.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme'), vt: document.documentElement.classList.contains('theme-vt'), saved: localStorage.getItem('hazem-theme') }));
  try {
    await lp.goto(BASE + 'index.html', { waitUntil: 'load' });
    await lp.waitForTimeout(800);
    // clicks timed in the page, 450ms then 150ms apart, all inside the running circle (a pointer click through
    // Playwright can land after it ends): one
    // transition for the whole run, its circle running backwards after an even number of clicks
    // from light: one click ends dark; then two (light, back to dark) end dark; then three end light
    for (const [clicks, end] of [[1, 'dark'], [2, 'dark'], [3, 'light']]) {
      const start = (await state()).theme;
      const mid = await lp.evaluate((clicks) => new Promise((res) => {
        const b = document.querySelector('[data-theme-scope="header"]'); let vts = 0;
        const orig = document.startViewTransition.bind(document); document.startViewTransition = (f) => { vts++; return orig(f); };
        let k = 0;
        const next = () => { b.click(); if (++k < clicks) setTimeout(next, k === 1 ? 450 : 150); else setTimeout(() => {
          const a = document.getAnimations().find((x) => x.effect && x.effect.pseudoElement === '::view-transition-new(root)' && x.playState === 'running');
          document.startViewTransition = orig; res({ vts, rate: a ? a.playbackRate : 0, vt: document.documentElement.classList.contains('theme-vt') });
        }, 100); };
        next();
      }), clicks);
      if (!mid.vt || mid.vts !== 1 || mid.rate !== (clicks % 2 ? 1 : -1)) failures.push(`motion, ${clicks} click(s): ${mid.vts} transition(s), circle rate ${mid.rate}, theme-vt ${mid.vt}`);
      await lp.waitForTimeout(1500);
      const s = await state();
      if (s.theme !== end || s.saved !== end || s.vt) failures.push(`motion, ${clicks} click(s) from ${start}: ended ${s.theme}, stored ${s.saved}, theme-vt ${s.vt}; expected ${end}`);
    }
  } catch (e) { failures.push(`motion reveal: ${e.message}`); }
  if (errors.length) failures.push(`motion reveal console: ${errors.join(' / ')}`);
  await live.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const mobilePage = await mobile.newPage();
  try {
    await mobilePage.goto(BASE + 'index.html', { waitUntil: 'load' });
    await mobilePage.locator('.menu-button').first().click();
    await mobilePage.locator('#menu[open] [data-theme-scope="menu"]').focus();
    await mobilePage.locator('#menu[open] [data-theme-scope="menu"]').press('Enter');
    // every control (header, menu) follows: visible state "theme: light", action ", switch to dark" (D68: no aria-pressed)
    const state = await mobilePage.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme'), all: [...document.querySelectorAll('[data-theme-toggle]')].every((b) => !b.hasAttribute('aria-pressed')
      && b.querySelector('[data-theme-label]')?.textContent?.trim() === 'theme: light' && b.querySelector('[data-theme-action]')?.textContent === ', switch to dark') }));
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

// D107: the email chip opens by click and keyboard, copies the address, closes by Esc (inside the menu too, which stays
// open) and by a click outside; it never covers the name in the header and stays on screen; without the script
// Contact is a plain mailto: link
async function runChipPass() {
  const failures = [];
  const box = (page, sel) => page.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, vis: getComputedStyle(el).visibility, op: +getComputedStyle(el).opacity }; }, sel);
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', reducedMotion: 'no-preference' });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await ctx.newPage();
  const H = '.site-header .mail';
  const expanded = () => page.evaluate((H) => document.querySelector(H + ' .mail__a').getAttribute('aria-expanded'), H);
  try {
    await page.goto(BASE + 'index.html', { waitUntil: 'load' });
    if (await expanded() !== 'false') failures.push('the chip is not collapsed at load');
    await page.locator(H + ' .mail__a').click();
    await page.waitForTimeout(600);
    const open = await box(page, H + ' .mail__chip');
    if (await expanded() !== 'true' || open.vis !== 'visible' || open.op < 1) failures.push(`click did not open the chip (${open.vis}, ${open.op})`);
    await page.locator(H + ' .mail__b').click();
    await page.waitForTimeout(300);
    const copied = await page.evaluate(async (H) => ({ clip: await navigator.clipboard.readText(), want: document.querySelector(H + ' .mail__a').getAttribute('href').slice(7), done: !document.querySelector(H + ' [data-mail-done]').hidden, status: document.querySelector(H + ' [data-mail-status]').textContent }), H);
    if (copied.clip !== copied.want || !copied.done || copied.status !== 'Address copied') failures.push(`copy: clipboard "${copied.clip}", done ${copied.done}, status "${copied.status}"`);
    await page.keyboard.press('Escape');
    if (await expanded() !== 'false') failures.push('Esc did not close the chip');
    await page.locator(H + ' .mail__a').focus();
    await page.keyboard.press('Enter');
    if (await expanded() !== 'true') failures.push('Enter did not open the chip');
    await page.keyboard.press('Tab');
    if (!await page.evaluate((H) => document.activeElement === document.querySelector(H + ' .mail__b'), H)) failures.push('Tab from Contact does not reach the copy button');
    await page.keyboard.press('Escape');
    if (await expanded() !== 'false' || !await page.evaluate((H) => document.activeElement === document.querySelector(H + ' .mail__a'), H)) failures.push('Esc from the copy button did not close the chip and return to Contact');
    await page.locator(H + ' .mail__a').click();
    await page.mouse.click(4, 450);   // the field at the screen's left edge: no link there
    if (await expanded() !== 'false' || !page.url().endsWith('index.html')) failures.push('a click outside did not close the chip');
    for (const w of [1024, 1152, 1280, 1366, 1440, 1920]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(150);
      if (await expanded() !== 'true') await page.locator(H + ' .mail__a').click();
      await page.waitForTimeout(600);
      const c = await box(page, H + ' .mail__chip'), n = await box(page, '.site-header .brand');
      if (c.l < n.r && c.r > n.l && c.t < n.b && c.b > n.t) failures.push(`${w}: the open chip covers the name`);
      if (c.l < 0 || c.r > w) failures.push(`${w}: the open chip leaves the screen (${Math.round(c.l)}-${Math.round(c.r)})`);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(400);
    await page.locator('.site-footer .mail__a').click();
    await page.waitForTimeout(600);
    const f = await box(page, '.site-footer .mail__chip');
    if (f.vis !== 'visible' || f.t < 0 || f.l < 0 || f.r > 1440) failures.push(`footer chip ${f.vis} at ${Math.round(f.l)},${Math.round(f.t)}`);
  } catch (e) { failures.push(`desktop: ${e.message}`); }
  await ctx.close();
  for (const w of [320, 375]) {
    const phone = await browser.newContext({ viewport: { width: w, height: 812 }, colorScheme: 'light', reducedMotion: 'reduce', hasTouch: true });
    const pp = await phone.newPage();
    try {
      await pp.goto(BASE + 'index.html', { waitUntil: 'load' });
      await pp.locator('.menu-button').first().click();
      await pp.locator('#menu[open] .mail__a').click();
      await pp.waitForTimeout(100);
      const c = await box(pp, '#menu .mail__chip');
      if (c.vis !== 'visible' || c.l < 0 || c.r > w) failures.push(`${w} menu: chip ${c.vis} at ${Math.round(c.l)}-${Math.round(c.r)}`);
      await pp.keyboard.press('Escape');
      const s = await pp.evaluate(() => ({ chip: document.querySelector('#menu .mail__a').getAttribute('aria-expanded'), menu: document.getElementById('menu').open }));
      if (s.chip !== 'false' || !s.menu) failures.push(`${w} menu: Esc closed ${s.menu ? 'nothing' : 'the menu'} (chip ${s.chip})`);
      await pp.keyboard.press('Escape');
      if (await pp.evaluate(() => document.getElementById('menu').open)) failures.push(`${w} menu: a second Esc did not close the menu`);
      await pp.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      await pp.locator('.site-footer .mail__a').click();
      await pp.waitForTimeout(100);
      const f = await box(pp, '.site-footer .mail__chip');
      if (f.vis !== 'visible' || f.l < 0 || f.r > w || f.t < 0) failures.push(`${w} footer: chip ${f.vis} at ${Math.round(f.l)}-${Math.round(f.r)}`);
    } catch (e) { failures.push(`${w} menu: ${e.message}`); }
    await phone.close();
  }
  const nojs = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const np = await nojs.newPage();
  try {
    await np.goto(BASE + 'index.html', { waitUntil: 'load' });
    const s = await np.evaluate(() => [...document.querySelectorAll('.mail')].map((m) => ({ href: m.querySelector('.mail__a').getAttribute('href'), hidden: m.querySelector('.mail__chip').hidden })));
    if (!s.length || s.some((m) => !m.href.startsWith('mailto:') || !m.hidden)) failures.push(`without the script: ${JSON.stringify(s)}`);
  } catch (e) { failures.push(`no script: ${e.message}`); }
  await nojs.close();
  return failures;
}

const themeWorkflowFailures = [...await runThemeInteractions(), ...await runThemeFallback()];
const chipFailures = await runChipPass();
gateFails += chipFailures.length;
if (chipFailures.length) console.log(`FAIL email chip: ${chipFailures.join(' | ')}`);
else console.log('ok   email chip: click and keyboard, copy, Esc (in the menu too), outside click, clear of the name 1024-1920, on screen at 320/375, mailto: without the script');
gateFails += themeWorkflowFailures.length;
if (themeWorkflowFailures.length) console.log(`FAIL theme interaction/fallback: ${themeWorkflowFailures.join(' | ')}`);
else console.log('ok   theme interaction/fallback: keyboard, persistence, navigation, instant under reduced motion, other tabs, Back, reveal run back and forth, menu and storage fallback');

// Motion (D75): every other check runs with reduced motion, so this pass proves the animated path ends in the
// plain layout. Each page is read top to bottom with motion on; once every arrival has fired and every running
// animation has finished, nothing may stay hidden (opacity) or offset (transform) on a group, plate or word.
async function runMotionPass() {
  const failures = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'no-preference' });
  for (const url of urls.filter((u) => /project-|index\.html$|\/$|architecture\.html$/.test(u))) {
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'load' });
      const bad = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) { window.scrollTo({ top: y, behavior: 'instant' }); await sleep(120); }
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
        for (let t = 0; t < 50 && document.querySelector('.rv:not(.is-in), .rv-g:not(.is-in)'); t++) await sleep(100);
        await Promise.race([Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))), sleep(8000)]);
        const out = [];
        // a page with plates below the fold must have arrival groups at all, or this pass would pass on nothing
        if (document.querySelector('[data-rv]') && !document.querySelector('.rv-g')) out.push('no arrival groups: the arrival module did not run');
        for (const el of document.querySelectorAll('.rv, .rv-g')) {
          if (!el.classList.contains('is-in')) out.push(`not arrived: ${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
          else if (getComputedStyle(el).opacity !== '1') out.push(`opacity ${getComputedStyle(el).opacity}: ${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
        }
        // nothing left moved by transform, translate or scale; a [data-fx] element follows the scroll with its
        // translate and scale by design (the home pass checks those), so on it only transform must be plain
        for (const el of document.querySelectorAll('.rv, .rv-g, .nw, .nw > picture, .nw > img, .w__i, .l__i')) {
          const cs = getComputedStyle(el);
          const props = [['transform', cs.transform, ['none', 'matrix(1, 0, 0, 1, 0, 0)']], ['translate', cs.translate, ['none', '0px']], ['scale', cs.scale, ['none', '1']]];
          const moved = (el.matches('[data-fx]') ? props.slice(0, 1) : props).find(([, v, plain]) => !plain.includes(v));
          if (moved) out.push(`${moved[0]} ${moved[1]}: ${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
        }
        return out;
      });
      failures.push(...bad.slice(0, 5).map((s) => `${url.replace(BASE, '')}: ${s}`));
    } catch (e) { failures.push(`${url.replace(BASE, '')}: ${e.message}`); }
    await page.close();
  }
  await ctx.close();
  return failures;
}
// Smooth scroll (D79): with motion and a fine pointer a wheel glides (moving over several frames, settling on
// its target); a keyboard scroll in between is followed, never undone; a contents link glides to its chapter,
// stops clear of the fixed header, updates the address and moves focus; an open dialog holds the page still; the header
// stays at the top of the screen. Under reduced motion the engine never loads and scrolling stays native.
async function runScrollPass() {
  const failures = [];
  const page0 = urls.find((u) => u.includes('project-ain-sebaa')) || urls.find((u) => u.includes('project-'));
  if (!page0) return failures;
  for (const motion of ['no-preference', 'reduce']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: motion });
    const page = await ctx.newPage();
    const fail = (s) => failures.push(`${motion}: ${s}`);
    try {
      await page.goto(page0, { waitUntil: 'load' });
      await page.waitForTimeout(800);
      const lenis = await page.evaluate(() => document.documentElement.classList.contains('lenis'));
      if (motion === 'reduce') { if (lenis) fail('the smooth-scroll engine loaded under reduced motion'); await ctx.close(); continue; }
      if (!lenis) { fail('the smooth-scroll engine did not load'); await ctx.close(); continue; }
      await page.mouse.move(700, 450);
      // sampled for 1.4 s of time (not a frame count), so a faster display cannot cut the glide short
      const glide = page.evaluate(() => new Promise((res) => { const s = []; const t0 = performance.now(); const tick = () => { const t = performance.now() - t0; s.push([t, scrollY]); if (t < 1400) requestAnimationFrame(tick); else res(s); }; requestAnimationFrame(tick); }));
      await page.mouse.wheel(0, 400);
      const s = await glide;
      const at = (ms) => (s.find(([t]) => t >= ms) || s[s.length - 1])[1];
      if (!(at(80) > 8 && at(80) < 380)) fail(`a 400px wheel is not eased: ${Math.round(at(80))}px after 80ms`);
      if (s[s.length - 1][1] < 392) fail(`a 400px wheel settles at ${Math.round(s[s.length - 1][1])}px`);
      // the keyboard takes over a glide: PageDown pressed mid-glide moves the page one page from where it is,
      // the wheel's remaining distance is dropped (without the hand-over the glide would run on to its target)
      const yRest = await page.evaluate(() => scrollY);
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(1200);
      const page1 = (await page.evaluate(() => scrollY)) - yRest;   // one native page, measured here
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(500);
      // where the page is when the key goes down, read in the page (a window capture listener runs before the
      // site's own document listener): a separate read would race the glide by a frame or two
      await page.evaluate(() => addEventListener('keydown', () => { window.__yKey = scrollY; }, true));
      await page.mouse.wheel(0, 3000);
      await page.waitForTimeout(150);
      await page.keyboard.press('PageDown');
      const y1 = await page.evaluate(() => window.__yKey);
      await page.waitForTimeout(1600);
      const y2 = await page.evaluate(() => scrollY);
      if (Math.abs(y2 - (y1 + page1)) > Math.max(48, page1 * 0.12)) fail(`PageDown during a glide ended at ${Math.round(y2)}px, not one page (${Math.round(page1)}px) from ${Math.round(y1)}px: the glide was not handed over`);
      await page.mouse.wheel(0, -300);
      await page.waitForTimeout(900);
      if (!(await page.evaluate(() => { const r = document.querySelector('.site-header').getBoundingClientRect(); return getComputedStyle(document.querySelector('.site-header')).position === 'fixed' && r.top === 0; }))) fail('the fixed header (D93) left the top of the screen');
      const link = page.locator('.toc a').last();
      if (await link.count()) {
        const id = (await link.getAttribute('href')).slice(1);
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(400);
        await link.click();
        await page.waitForTimeout(1900);
        const r = await page.evaluate((id) => { const el = document.getElementById(id); return { top: el.getBoundingClientRect().top, pad: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop), hash: location.hash, focus: document.activeElement === el }; }, id);
        if (Math.abs(r.top - r.pad) > 2) fail(`a contents link stopped ${Math.round(r.top)}px from the top, not ${r.pad}px`);
        if (r.hash !== `#${id}` || !r.focus) fail('a contents link did not update the address or move focus');
      }
      const opener = page.locator('[data-viewer]').nth(2);
      await opener.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await opener.click();
      await page.waitForTimeout(900);
      const y0 = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(700);
      if ((await page.evaluate(() => scrollY)) !== y0) fail('the page scrolled behind the open viewer');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(900);
      if (await page.evaluate(() => document.documentElement.classList.contains('lenis-stopped'))) fail('smooth scroll did not resume after the viewer closed');
    } catch (e) { fail(e.message); }
    await ctx.close();
  }
  return failures;
}
// The home reel (D103-D105, D109), with motion and a fine pointer at 1440: the first composition stands assembled and
// whole on the first screen; one entering is scaled up, blurred, and its side layer still travelling; centred, it stands
// assembled; scrolling back to the entering place gives the entering values again (the motion is a function of the
// scroll); the film follows the scroll; the pointer's label names the project and its category; the widest empty band
// while compositions pass stays at or under 25vh; every project link takes focus in view and shows its caption. Then a
// 375px touch screen: captions shown, no smooth-scroll engine, no blur, no film loaded.
async function runHomePass() {
  const failures = [];
  const home = urls.find((u) => u === BASE || u.endsWith('/index.html'));
  if (!home) return failures;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'no-preference' });
  await ctx.addInitScript(() => { try { localStorage.setItem('hazem-theme', 'light'); } catch (e) {} });
  const page = await ctx.newPage();
  const fail = (s) => failures.push(s);
  const go = async (y, ms = 500) => { await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y); await page.waitForTimeout(ms); };
  // composition i: its --d, the main card's scale, the side layer's offset, the stage's blur and box; and where the
  // page stands when it is centred (c) and how far --d runs per pixel (half of the screen plus the item)
  const state = (i) => page.evaluate((i) => {
    const li = document.querySelectorAll('.reel__it')[i], st = li.querySelector('.reel__stage'), side = li.querySelector('.reel__l--side');
    const b = st.getBoundingClientRect(), r = li.getBoundingClientRect(), vh = document.documentElement.clientHeight;
    const off = side ? getComputedStyle(side).translate.split(' ').map(parseFloat) : [0];
    return { d: +li.style.getPropertyValue('--d'), scale: parseFloat(getComputedStyle(li.querySelector('.reel__l--main')).scale) || 1,
      side: Math.hypot(...off.map((v) => v || 0)), blur: parseFloat((getComputedStyle(st).filter.match(/blur\(([\d.]+)px\)/) || [0, 0])[1]),
      top: b.top, bottom: b.bottom, vh, c: r.top + scrollY + r.height / 2 - vh / 2, half: (vh + r.height) / 2 };
  }, i);
  try {
    await page.goto(home, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    const env = await page.evaluate(() => ({ fx: document.documentElement.classList.contains('fx'), lenis: document.documentElement.classList.contains('lenis'), n: document.querySelectorAll('a.reel__a').length }));
    if (!env.fx) fail('html.fx is not set with motion');
    if (!env.lenis) fail('the smooth-scroll engine did not load');
    if (env.n !== 15) fail(`${env.n} compositions, expected 15`);
    // assembled at load, whole on the first screen
    const s0 = await state(0);
    if (Math.abs(s0.d) >= 0.14 || Math.abs(s0.scale - 1) > 0.001 || s0.blur > 0.01) fail(`the first composition is not assembled at load: d ${s0.d}, scale ${s0.scale}, blur ${s0.blur}px`);
    if (s0.top < 0 || s0.bottom > s0.vh) fail(`the first composition is not whole on the first screen (${Math.round(s0.top)} to ${Math.round(s0.bottom)}px)`);
    // entering (d = 0.6), centred, then entering again on the way back up
    const k = 2;
    const pos = await state(k);
    const enterY = pos.c - 0.6 * pos.half;
    await go(enterY);
    const e1 = await state(k);
    if (!(e1.scale > 1.05 && e1.blur > 2 && e1.side > 10)) fail(`an entering composition (d ${e1.d.toFixed(2)}) is not scaled, blurred and assembling: scale ${e1.scale.toFixed(3)}, blur ${e1.blur.toFixed(1)}px, side ${e1.side.toFixed(0)}px from its place`);
    await go(pos.c);
    const c1 = await state(k);
    if (Math.abs(c1.d) > 0.02 || Math.abs(c1.scale - 1) > 0.001 || c1.blur > 0.01 || c1.side > 0.5) fail(`a centred composition is not assembled: d ${c1.d}, scale ${c1.scale}, blur ${c1.blur}px, side ${c1.side.toFixed(1)}px`);
    await go(enterY);
    const e2 = await state(k);
    if (Math.abs(e2.scale - e1.scale) > 0.005 || Math.abs(e2.blur - e1.blur) > 0.2 || Math.abs(e2.side - e1.side) > 1) fail(`scrolling back does not run the motion backwards: scale ${e1.scale.toFixed(3)} / ${e2.scale.toFixed(3)}, blur ${e1.blur.toFixed(1)} / ${e2.blur.toFixed(1)}, side ${e1.side.toFixed(0)} / ${e2.side.toFixed(0)}`);
    // the pointer's label over a centred composition: its name and category
    await go(pos.c);
    await page.mouse.move(700, 440); await page.mouse.move(720, 450);
    await page.waitForTimeout(300);
    const lab = await page.evaluate((k) => { const a = document.querySelectorAll('a.reel__a')[k], p = document.querySelector('.pill-label');
      return { on: !!p && p.classList.contains('is-on'), text: p ? [...p.children].map((s) => s.textContent) : [], want: [a.getAttribute('data-label'), a.getAttribute('data-cat')] }; }, k);
    if (!lab.on || lab.text.join('|') !== lab.want.join('|')) fail(`the pointer's label reads "${lab.text.join(' ')}" (${lab.on ? 'on' : 'off'}), not "${lab.want.join(' ')}"`);
    await page.mouse.move(5, 450);
    // the film follows the scroll, forwards and back
    const fi = await page.evaluate(() => [...document.querySelectorAll('.reel__it')].findIndex((li) => li.querySelector('.reel__film')));
    if (fi >= 0) {
      const f = await state(fi);
      await go(f.c, 300);
      try { await page.waitForFunction((fi) => document.querySelectorAll('.reel__it')[fi].querySelector('.reel__film').classList.contains('is-live'), fi, { timeout: 10000 }); }
      catch (e) { fail('the film never showed a frame (is-live)'); }
      const t = async (d) => { await go(f.c - d * f.half, 1600); return page.evaluate((fi) => document.querySelectorAll('.reel__it')[fi].querySelector('video').currentTime, fi); };
      const seen = [await t(0.4), await t(-0.4), await t(0.1)];
      if (!(seen[0] < seen[2] && seen[2] < seen[1])) fail(`the film's time does not follow the scroll both ways: ${seen.map((x) => x.toFixed(2)).join(', ')}`);
    }
    // the widest empty band while compositions pass (layers under a quarter of their opacity count as empty)
    const band = await page.evaluate(async () => {
      const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const its = [...document.querySelectorAll('.reel__it')], vh = document.documentElement.clientHeight;
      const c = (li) => { const r = li.getBoundingClientRect(); return r.top + scrollY + r.height / 2 - vh / 2; };
      const from = c(its[1]), to = c(its[6]); let worst = 0;
      for (let y = from; y <= to; y += (to - from) / 60) {
        scrollTo({ top: y, behavior: 'instant' }); await frame();
        const spans = [...document.querySelectorAll('.reel__l')].filter((l) => +getComputedStyle(l.closest('.reel__a')).opacity * +getComputedStyle(l).opacity >= 0.25)
          .map((l) => l.getBoundingClientRect()).filter((q) => q.bottom > 0 && q.top < vh).map((q) => [Math.max(0, q.top), Math.min(vh, q.bottom)]).sort((a, b) => a[0] - b[0]);
        let edge = 0, gap = 0;
        for (const [t, b] of spans) { gap = Math.max(gap, t - edge); edge = Math.max(edge, b); }
        worst = Math.max(worst, gap, vh - edge);
      }
      return worst / vh * 100;
    });
    if (band > 25.5) fail(`an empty band of ${band.toFixed(1)}vh opens while compositions pass (25 at most)`);
    // every project link takes focus in view, and shows its caption, reached as a reader reaches it: Tab from the
    // header's last control into the reel
    await go(0, 400);
    await page.locator('[data-theme-scope="header"]').focus();
    for (let i = 0; i < env.n; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(400);
      const r = await page.evaluate(() => { const a = document.activeElement; const b = a.getBoundingClientRect(); const cap = a.querySelector('.reel__cap');
        return { reel: a.classList.contains('reel__a'), top: b.top, bottom: b.bottom, vh: innerHeight, cap: cap ? +getComputedStyle(cap).opacity : 0 }; });
      if (!r.reel) { fail(`Tab ${i + 1} left the reel`); break; }
      if (r.bottom < 0 || r.top > r.vh) fail(`project link ${i + 1} took focus out of view`);
      if (r.cap < 0.95) fail(`project link ${i + 1} took focus without showing its caption (opacity ${r.cap})`);
    }
  } catch (e) { fail(e.message); }
  await ctx.close();
  // a touch screen at 375 (A4, D101): motion on, the device's own scrolling, captions to read, no blur, the poster kept
  const tctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' });
  const tp = await tctx.newPage();
  try {
    await tp.goto(home, { waitUntil: 'load' });
    await tp.waitForTimeout(3500);
    const s = await tp.evaluate(() => { const cap = document.querySelector('.reel__cap').getBoundingClientRect();
      return { fx: document.documentElement.classList.contains('fx'), lenis: document.documentElement.classList.contains('lenis'),
        film: [...document.querySelectorAll('video[data-scrub]')].map((v) => v.currentSrc).filter(Boolean),
        cap: cap.height > 0 && cap.bottom <= innerHeight && +getComputedStyle(document.querySelector('.reel__cap')).opacity === 1,
        blur: [...document.querySelectorAll('.reel__stage')].some((st) => getComputedStyle(st).filter !== 'none') }; });
    if (!s.fx) failures.push('touch: html.fx is not set');
    if (s.lenis) failures.push('touch: the smooth-scroll engine loaded on a touch screen');
    if (s.film.length) failures.push(`touch: a film loads on a narrow touch screen (${s.film[0].split('/').pop()})`);
    if (!s.cap) failures.push('touch: the first caption is not shown on the first screen');
    if (s.blur) failures.push('touch: a composition is blurred on a touch screen');
  } catch (e) { failures.push(`touch: ${e.message}`); }
  await tctx.close();
  return failures;
}
const homeFailures = await runHomePass();
gateFails += homeFailures.length;
if (homeFailures.length) console.log(`FAIL home reel: ${homeFailures.join(' | ')}`);
else console.log('ok   home reel: assembled at load, entering scaled and blurred, centred assembled, reversible, film follows the scroll, label names project and category, bands under 25vh, links focus in view with captions, touch: captions, no blur, no film');
// The index (D98): the count matches its tiles; a family chosen by keyboard shows exactly its tiles, is pressed and
// written to the address; the viewer's gallery is the visible tiles and offers their project; the tree and the list
// open from the bar; an address with a view and a family restores both.
async function runIndexPass() {
  const failures = [];
  const url = urls.find((u) => u.includes('architecture.html'));
  if (!url) return failures;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const fail = (s) => failures.push(s);
  try {
    await page.goto(url, { waitUntil: 'load' });
    const n = await page.evaluate(() => ({ all: document.querySelectorAll('.tile').length, said: +document.querySelector('.ix-head .col__count').textContent,
      d: document.querySelectorAll('.tile[data-kind="drawing"]').length, bar: !document.querySelector('.ix-bar').hidden }));
    if (n.all !== n.said) fail(`the index says ${n.said} and holds ${n.all} tiles`);
    if (!n.bar) fail('the bar did not show');
    await page.locator('.ix-bar button[data-family="drawing"]').focus();
    await page.keyboard.press('Enter');
    const s = await page.evaluate(() => ({ shown: [...document.querySelectorAll('.tile')].filter((t) => !t.hidden).length, q: location.search,
      pressed: document.querySelector('.ix-bar button[data-family="drawing"]').getAttribute('aria-pressed') }));
    if (s.shown !== n.d || !/family=drawing/.test(s.q) || s.pressed !== 'true') fail(`Drawings: ${s.shown} of ${n.d} tiles shown, address ${s.q}, pressed ${s.pressed}`);
    await page.locator('.tile:not([hidden]) [data-viewer]').first().click();
    await page.waitForTimeout(900);
    const v = await page.evaluate(() => { const a = document.querySelector('[data-viewer-project]'); return { count: document.querySelector('.viewer__count').textContent.trim(), hidden: a.hidden, href: a.getAttribute('href') }; });
    if (!v.count.endsWith(`/ ${n.d}`)) fail(`the viewer counts ${v.count}, not of the ${n.d} visible tiles`);
    if (v.hidden || !/projects\/project-/.test(v.href)) fail('the viewer does not offer the project');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    for (const view of ['tree', 'list']) {
      await page.locator(`.ix-bar [data-view-btn="${view}"]`).click();
      if (!(await page.evaluate((view) => !document.querySelector(`[data-view="${view}"]`).hidden && document.querySelector('[data-view="grid"]').hidden, view))) fail(`the ${view} did not open`);
    }
    await page.goto(url.split('?')[0] + '?view=list&family=film', { waitUntil: 'load' });
    const r = await page.evaluate(() => ({ list: !document.querySelector('[data-view="list"]').hidden, film: document.querySelector('.ix-bar button[data-family="film"]').getAttribute('aria-pressed') }));
    if (!r.list || r.film !== 'true') fail('an address with view=list&family=film did not restore both');
  } catch (e) { fail(e.message); }
  await ctx.close();
  return failures;
}
const indexFailures = await runIndexPass();
gateFails += indexFailures.length;
if (indexFailures.length) console.log(`FAIL index: ${indexFailures.join(' | ')}`);
else console.log('ok   index views: count, family by keyboard and in the address, viewer of the visible tiles with its project, tree and list, address restored');
// About (D99): with motion at 1440 the rail marks the chapter the reader is in and the header stands light over the
// dark ground; the gathered word keeps its name; under reduced motion every chapter is there to read.
async function runAboutPass() {
  const failures = [];
  const url = urls.find((u) => u.includes('about.html'));
  if (!url) return failures;
  for (const motion of ['no-preference', 'reduce']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: motion });
    await ctx.addInitScript(() => { try { localStorage.setItem('hazem-theme', 'light'); } catch (e) {} });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(600);
      const ids = await page.evaluate(() => [...document.querySelectorAll('.tale__ch')].map((c) => c.id));
      for (const [i, id] of ids.entries()) {
        await page.evaluate((id) => { const c = document.getElementById(id); scrollTo({ top: c.getBoundingClientRect().top + scrollY + c.offsetHeight * 0.3, behavior: 'instant' }); }, id);
        await page.waitForTimeout(motion === 'reduce' ? 300 : 900);
        const s = await page.evaluate(() => ({ cur: [...document.querySelectorAll('.tale-rail a')].findIndex((a) => a.getAttribute('aria-current') === 'location'), dark: document.documentElement.classList.contains('on-dark') }));
        if (s.cur !== i) failures.push(`${motion}: in chapter ${i + 1} the rail marks ${s.cur + 1}`);
        if (!s.dark) failures.push(`${motion}: the header is not light over chapter ${i + 1}`);
      }
      const word = await page.evaluate(() => { const sc = document.querySelector('.sc'); return { name: sc.querySelector('.vh').textContent, hidden: [...sc.querySelectorAll('.sc__l')].every((l) => l.getAttribute('aria-hidden') === 'true') }; });
      if (word.name !== 'Al-Arg' || !word.hidden) failures.push(`${motion}: the gathered word reads "${word.name}"`);
      if (motion === 'reduce' && await page.evaluate(() => [...document.querySelectorAll('.tale__stage > *')].some((el) => +getComputedStyle(el).opacity < 1))) failures.push('reduce: a chapter is hidden');
    } catch (e) { failures.push(`${motion}: ${e.message}`); }
    await ctx.close();
  }
  return failures;
}
const aboutFailures = await runAboutPass();
gateFails += aboutFailures.length;
if (aboutFailures.length) console.log(`FAIL about: ${aboutFailures.join(' | ')}`);
else console.log('ok   about: rail follows the chapters, header light over the ground, gathered word named, every chapter still under reduced motion');
const scrollFailures = await runScrollPass();
gateFails += scrollFailures.length;
if (scrollFailures.length) console.log(`FAIL smooth scroll: ${scrollFailures.join(' | ')}`);
else console.log('ok   smooth scroll: wheel glides and settles, keyboard followed, contents glide, dialog holds, native under reduced motion');
const motionFailures = await runMotionPass();
gateFails += motionFailures.length;
if (motionFailures.length) console.log(`FAIL motion (no-preference): ${motionFailures.length} issue(s)\n  ${motionFailures.slice(0, 20).join('\n  ')}`);
else console.log('ok   motion (no-preference): every arrival fired and every animation ended in the plain layout');
const report = [];
for (const url of urls) {
  const name = url.replace(BASE, '') || 'index';
  const row = { page: name, overflow: [], brokenImgs: [], console: [], small: [], targets: [], axe: {}, crop: [], upscale: [], grid: [], palette: [], alpha: [], fringe: [], theme: [], labels: [], chrome: [] };
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
      // chrome (D106, plan 18): with the full header (48rem and up) the centred name stands clear of the routes and the tools
      out.chrome = [];
      const nameBox = document.querySelector('.site-header .brand')?.getBoundingClientRect();
      if (innerWidth >= 768 && nameBox) for (const sel of ['.site-header .nav ul', '.site-header__tools']) {
        const b = document.querySelector(sel)?.getBoundingClientRect();
        if (b && b.width && nameBox.left < b.right && b.left < nameBox.right && nameBox.top < b.bottom && b.top < nameBox.bottom) out.chrome.push(`the name overlaps ${sel} (${Math.round(Math.min(nameBox.right, b.right) - Math.max(nameBox.left, b.left))}px)`);
      }
      // Field gates. crop: rendered ratio within 1% of the master's, never object-fit: cover; upscale: never wider than the master.
      // A render in a declared frame ([data-crop]: compositions, thumbnails, D112) may be cropped, but never enlarged (a
      // covering image is scaled by the larger of its two box ratios), and a drawing is never inside one
      out.crop = []; out.upscale = []; out.grid = []; out.palette = [];
      for (const img of document.querySelectorAll('main img')) {
        const b = img.getBoundingClientRect(); const w = +img.getAttribute('width'), h = +img.getAttribute('height');
        if (!b.width || !w || !h) continue;
        const src = img.getAttribute('src');
        // 1%, or the half pixel a box snaps by on each axis when it is that small (a long strip on a phone)
        // the layout box, not the screen box: a turned photograph (D99) is rotated, not cropped
        const cs = getComputedStyle(img); const ow = parseFloat(cs.width), oh = parseFloat(cs.height);
        const frame = img.closest('[data-crop]');
        if (frame && (img.closest('.nw--drawing') || src.includes('images/cut/'))) out.crop.push(`${src} is a drawing in a cropped frame (D112)`);
        if (frame) { if (Math.max(ow / w, oh / h) > 1 + 1 / w) out.upscale.push(`${src} enlarged ${Math.max(ow / w, oh / h).toFixed(2)}x in its frame`); }
        else {
          if (Math.abs(ow / oh - w / h) / (w / h) > Math.max(0.01, 0.5 / oh + 0.5 / ow)) out.crop.push(`${src} ${Math.round(ow)}x${Math.round(oh)} vs ${w}x${h}`);
          if (getComputedStyle(img).objectFit === 'cover') out.crop.push(`${src} object-fit: cover`);
          if (b.width > w + 1) out.upscale.push(`${src} ${Math.round(b.width)}px > ${w}px`);
        }
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
        ? new Set(['rgba(0, 0, 0, 0)', 'rgb(18, 19, 17)', 'rgb(247, 245, 239)', 'rgb(69, 70, 63)', 'rgba(18, 19, 17, 0.88)', 'rgba(18, 19, 17, 0.86)', 'rgb(26, 27, 25)'])
        : new Set(['rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(17, 17, 17)', 'rgba(255, 255, 255, 0.86)', 'rgb(245, 245, 243)']);
      // an element with data-ground stands on its project's declared ground (D86, A10: from its render, per scheme)
      const rgb = (h) => `rgb(${[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(', ')})`;
      const ground = (el) => el.matches('[data-ground]') && rgb(getComputedStyle(el).getPropertyValue(theme === 'dark' ? '--g-dark' : '--g-light').trim());
      if (innerWidth === 375 || innerWidth === 1440) for (const el of [document.documentElement, document.body, ...document.querySelectorAll('body *')]) {
        if (el.closest('video, svg, .lab__pin')) continue;
        const c = getComputedStyle(el).backgroundColor; if (!ok.has(c) && c !== ground(el)) out.palette.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${c}`);
      }
      // the home reel, still (D103-D105; this loop runs under reduced motion): the first composition stands whole on
      // the first screen, no film loads, and no composition is moved, scaled, faded or blurred
      if (document.body.classList.contains('page-home')) {
        const first = document.querySelector('.reel__stage')?.getBoundingClientRect();
        if (!first || first.top < 0 || first.bottom > innerHeight) out.theme.push('the first composition is not whole on the first screen');
        if ([...document.querySelectorAll('video[data-scrub]')].some((v) => v.currentSrc || v.getAttribute('src'))) out.theme.push('a film loads under reduced motion');
        if ([...document.querySelectorAll('.reel__a, .reel__stage, .reel__l')].some((el) => { const cs = getComputedStyle(el); return !['none', '0px'].includes(cs.translate) || cs.scale !== 'none' || cs.filter !== 'none' || cs.opacity !== '1'; })) out.theme.push('a composition moves under reduced motion');
      }
      // dark treatments (D50, D69): inverted linework is filtered only in the dark scheme; a keep drawing
      // shows its layer of solid regions, unfiltered, only in the dark scheme; no drawing may sit on a paper
      // rectangle in the dark scheme (the owner's requirement); light pages show every drawing as authored
      for (const el of document.querySelectorAll('main .nw--drawing')) {
        const img = el.querySelector('img'); if (!img) continue;
        const f = getComputedStyle(img).filter; const bg = getComputedStyle(el).backgroundColor;
        const kind = ['invert-accent', 'invert', 'keep', 'field', 'object'].find((k) => el.classList.contains(`nw--${k}`)) || 'none';
        const name = (img.getAttribute('src') || '').split('/').pop();
        const layer = el.querySelector('.nw__keep'), layerImg = layer?.querySelector('img');
        if (theme === 'light' && f !== 'none') out.theme.push(`${name} filtered in light: ${f}`);
        if (theme === 'dark' && (kind.startsWith('invert') || kind === 'keep') && !/invert\(0\.965\)/u.test(f)) out.theme.push(`${name} ${kind} not inverted in dark: ${f}`);
        if (theme === 'dark' && (kind === 'invert-accent' || kind === 'keep') && !/hue-rotate\(180deg\)/u.test(f)) out.theme.push(`${name} ${kind} without hue-rotate: ${f}`);
        if (kind === 'keep' && !layerImg) out.theme.push(`${name} keep drawing without its layer`);
        if (kind === 'keep' && layerImg && (getComputedStyle(layer).display === 'none') !== (theme === 'light')) out.theme.push(`${name} keep layer ${theme === 'light' ? 'shown in light' : 'hidden in dark'}`);
        if (kind === 'keep' && layerImg && getComputedStyle(layerImg).filter !== 'none') out.theme.push(`${name} keep layer filtered: ${getComputedStyle(layerImg).filter}`);
        if (theme === 'dark' && kind === 'field') out.theme.push(`${name} sits on a paper field in dark (D69: invert, invert-accent or keep)`);
        if (bg !== 'rgba(0, 0, 0, 0)' && !(theme === 'light' && kind === 'field')) out.theme.push(`${name} ${kind} drawing has a background in ${theme}: ${bg}`);
      }
      // labels re-set from a drawing (D49): in place, they stay inside the drawing and never overlap
      out.labels = [];
      for (const lab of document.querySelectorAll('.lab')) {
        const box = lab.getBoundingClientRect(); const items = [...lab.querySelectorAll('.lab__item')];
        if (getComputedStyle(items[0] || lab).position !== 'absolute') {   // narrow: pins on the drawing, the words in a list
          const fig = lab.querySelector('.lab__fig img'); const pins = [...lab.querySelectorAll('.lab__pin')].filter((pn) => pn.offsetParent);
          if (fig && pins.length) {
            const ib = fig.getBoundingClientRect(); const ps = pins.map((pn) => pn.getBoundingClientRect());
            pins.forEach((pn, i) => {
              const st = getComputedStyle(pn);
              const want = ib.top + (parseFloat(st.getPropertyValue('--y')) + parseFloat(st.getPropertyValue('--h')) / 2) / 100 * ib.height;
              const got = ps[i].top + ps[i].height / 2;
              if (Math.abs(got - want) > 2) out.labels.push(`pin ${i + 1} sits ${Math.round(got - want)}px from its label's place`);
              for (let j = i + 1; j < ps.length; j++) { const r = ps[i], q = ps[j]; if (r.left < q.right && q.left < r.right && r.top < q.bottom && q.top < r.bottom) out.labels.push(`pins ${i + 1} and ${j + 1} overlap`); }
            });
          }
          continue;
        }
        const rs = items.map((it) => it.getBoundingClientRect());
        rs.forEach((r, i) => {
          if (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1) out.labels.push(`"${items[i].textContent.trim()}" outside its drawing`);
          for (let j = i + 1; j < rs.length; j++) { const q = rs[j]; if (r.left < q.right && q.left < r.right && r.top < q.bottom && q.top < r.bottom) out.labels.push(`"${items[i].textContent.trim()}" overlaps "${items[j].textContent.trim()}"`); }
        });
      }
      if (de.getAttribute('data-theme') !== theme) out.theme.push(`resolved ${de.getAttribute('data-theme') || 'none'}, expected ${theme}`);
      if (getComputedStyle(de).colorScheme !== theme) out.theme.push(`color-scheme ${getComputedStyle(de).colorScheme}, expected ${theme}`);
      const controls = [...document.querySelectorAll('[data-theme-toggle]')];
      if (controls.length !== 2) out.theme.push(`theme controls ${controls.length}, expected 2 (header, menu: D93)`);
      else for (const control of controls) {
        // the name is the visible state followed by the action (WCAG 2.5.3); no aria-label may replace it
        const expectedAction = `, switch to ${theme === 'dark' ? 'light' : 'dark'}`;
        const label = control.querySelector('[data-theme-label]')?.textContent?.trim();
        const action = control.querySelector('[data-theme-action]')?.textContent;
        if (control.hasAttribute('aria-label') || control.hasAttribute('aria-pressed')) out.theme.push(`${control.dataset.themeScope} name overridden by aria-label or aria-pressed`);
        if (action !== expectedAction) out.theme.push(`${control.dataset.themeScope} action ${action}`);
        if (label !== `theme: ${theme}`) out.theme.push(`${control.dataset.themeScope} label ${label}`);
      }
      return out;
    }, theme);
    row.crop.push(...r.crop.map((s) => `${theme}/${w}: ${s}`)); row.upscale.push(...r.upscale.map((s) => `${theme}/${w}: ${s}`));
    row.grid.push(...r.grid.map((s) => `${theme}/${w}: ${s}`)); row.labels.push(...r.labels.map((s) => `${theme}/${w}: ${s}`)); row.palette.push(...r.palette.map((s) => `${theme}/${w}: ${s}`)); row.theme.push(...r.theme.map((s) => `${theme}/${w}: ${s}`)); row.chrome.push(...r.chrome.map((s) => `${theme}/${w}: ${s}`));
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
        if (img.closest('.nw__keep')) continue;   // a keep layer is opaque by design inside its regions (D69); its drawing is checked
        if (img.closest('.tile, .leaf')) continue;   // index thumbnails (D98): the same masters, checked full size on their project pages; at 480px resampling blends edge pixels
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
  for (const k of ['brokenImgs', 'small', 'targets', 'console', 'crop', 'upscale', 'grid', 'palette', 'alpha', 'fringe', 'theme', 'labels', 'chrome']) row[k] = [...new Set(row[k])];
  report.push(row);
  const gates = row.crop.length + row.upscale.length + row.grid.length + row.palette.length + row.alpha.length + row.fringe.length + row.theme.length + row.labels.length + row.chrome.length;
  gateFails += gates;
  const axeBad = Object.values(row.axe).reduce((n, items) => n + items.length, 0);
  const bad = gates + row.overflow.length + row.brokenImgs.length + row.console.length + axeBad;
  const list = (k, n = 4) => (row[k].length ? ` | ${k} (${row[k].length}) ${row[k].slice(0, n).join(' ; ')}` : '');
  const axeList = Object.entries(row.axe).filter(([, items]) => items.length).map(([key, items]) => ` | axe${key} ${items.join(' ; ')}`).join('');
  console.log(`${bad ? 'FAIL' : 'ok  '} ${name}${row.overflow.length ? ' | overflow ' + row.overflow.join(' ; ') : ''}${list('brokenImgs')}${list('console', 2)}${axeList}${list('crop')}${list('upscale')}${list('grid')}${list('palette')}${list('alpha')}${list('fringe')}${list('theme')}${list('labels')}${list('chrome')}${list('small', 3)}${list('targets', 3)}`);
}
fs.writeFileSync(path.join(here, '.cache', 'qa-report.json'), JSON.stringify(report, null, 2));
await browser.close();
console.log(gateFails ? `Field gates: ${gateFails} failure(s)` : 'Field gates: all pass (crop, upscale, grid, palette, alpha/fringe/detail, dark treatments, labels, chrome, content coverage)');
const failed = themeWorkflowFailures.length || report.some((r) => r.overflow.length || r.brokenImgs.length || r.console.length || Object.values(r.axe).some((items) => items.length));
if (gateFails || failed) process.exitCode = 1;
