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
    'at', 'align', 'swatch', 'mark', 'dir', 'layout', 'layers', 'why', 'country']);  // label anchors, alignment, key colours and marks, composition data and its reasons, the Index's facets (D125) are not visible copy
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
  // a field of parts joined by " | " (a CV's "Studio BELEM | Paris") is on its page when every part is: the about
  // column sets the first part in ink and the rest in grey (D114)
  const on = (hay, s) => norm(s).split(' | ').every((x) => hay.includes(x));
  for (const s of strings(site.person)) if (!on(page('index.html'), s)) missing.push(`index.html: ${s.slice(0, 60)}`);
  // strings left out of a page on purpose (D116): a case study leaves out what its project's `$omit` names, because a
  // field the page shows already says it (the build reads the same list); every other string must be on its page
  let left = 0;
  const unused = (d) => {
    const o = new Set(d.$omit || []); if (!o.size) return d;
    const out = { ...d, run: o.has('run') ? null : d.run, tag: o.has('tag') ? null : d.tag, spec: d.spec.filter((s) => !o.has(`spec:${s.label}`)), narrative: o.has('overview') ? d.narrative.filter((t) => t.chapter) : d.narrative };
    left += strings(d).length - strings(out).length;
    return out;
  };
  for (const [src, rel] of map) { const hay = page(rel); for (const s of strings(unused(rd(src)))) if (!on(hay, s)) missing.push(`${rel}: ${s.slice(0, 70)}`); }
  console.log(missing.length ? `FAIL content coverage: ${missing.length} missing\n  ${missing.slice(0, 20).join('\n  ')}` : `ok   content coverage: every content string is on its page (${left} left out by $omit, D116)`);
  gateFails += missing.length;
}
const axeSrc = fs.readFileSync(path.join(here, '..', 'node_modules/axe-core/axe.min.js'), 'utf8');
// a file: base runs the gates without the local server, straight from the built files; the two 404 checks
// need the server's routing (the 404 page links from the site root) and are skipped, and said so
const FILE = BASE.startsWith('file:');
const sitemap = FILE ? fs.readFileSync(path.join(REPO, 'sitemap-site.xml'), 'utf8') : await (await fetch(BASE + 'sitemap-site.xml')).text();
const LIVE = (({ origin, base }) => origin + base)(JSON.parse(fs.readFileSync(path.join(REPO, 'content/site.json'), 'utf8')));
let urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(LIVE, BASE))
  .map((u) => (FILE && u.endsWith('/') ? u + 'index.html' : u));   // the server answers a folder with its index.html
// the index opens on the tree from 64rem (D110): its grid's tiles are checked at every width from their own address
urls.push(...urls.filter((u) => u.endsWith('architecture.html')).map((u) => u + '?view=grid'));
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
      const link = page.locator('.rail a').last();
      if (await link.count()) {
        const id = (await link.getAttribute('href')).slice(1);
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(400);
        await link.click();
        await page.waitForTimeout(1900);
        const r = await page.evaluate((id) => { const el = document.getElementById(id); return { top: el.getBoundingClientRect().top, pad: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop), hash: location.hash, focus: document.activeElement === el }; }, id);
        if (Math.abs(r.top - r.pad) > 2) fail(`a rail link stopped ${Math.round(r.top)}px from the top, not ${r.pad}px`);
        if (r.hash !== `#${id}` || !r.focus) fail('a rail link did not update the address or move focus');
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
// The index (D98, D110-D112): it opens on the tree at 1440 (on the projects) and on the grid at 375. The families'
// counts sum to the root, and each equals its leaves and its tiles. A family chosen by keyboard shows its branch, is
// pressed and written to the address. No two leaves of a branch overlap and every leaf stays in the tree; a leaf
// under the pointer grows, names itself and darkens its connector. The viewer's gallery is the branch's leaves, or
// the grid's visible tiles, and offers the project. An address with a view and a family restores both.
async function runIndexPass() {
  const failures = [];
  const url = urls.find((u) => u.endsWith('architecture.html'));
  if (!url) return failures;
  const fail = (s) => failures.push(s);
  const open = async (w, q = '') => {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 812 : 900 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce' });
    const page = await ctx.newPage(); await page.goto(url + q, { waitUntil: 'load' }); return { ctx, page };
  };
  const shownBranch = (page) => page.evaluate(() => [...document.querySelectorAll('[data-branch]')].filter((b) => !b.hidden).map((b) => b.dataset.branch).join());
  const viewerCount = async (page, sel, n, where) => {
    await page.locator(sel).first().click();
    await page.waitForTimeout(900);
    const v = await page.evaluate(() => { const a = document.querySelector('[data-viewer-project]'); return { count: document.querySelector('.viewer__count').textContent.trim(), hidden: a.hidden, href: a.getAttribute('href') }; });
    if (!v.count.endsWith(`/ ${n}`)) fail(`${where}: the viewer counts ${v.count}, not of the ${n} shown`);
    if (v.hidden || !/projects\/project-/.test(v.href)) fail(`${where}: the viewer does not offer the project`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
  };
  try {
    { const { ctx, page } = await open(375); const v = await page.evaluate(() => document.body.dataset.ixView); if (v !== 'grid') fail(`375 opens on the ${v}, not the grid`); await ctx.close(); }
    const { ctx, page } = await open(1440);
    const t = await page.evaluate(() => ({ view: document.body.dataset.ixView, bar: !document.querySelector('.ix-bar').hidden,
      root: +document.querySelector('.tree__root .pill__n').textContent, said: +document.querySelector('.ix-head .col__count').textContent, tiles: document.querySelectorAll('.tile').length,
      fams: [...document.querySelectorAll('.tree__fam')].map((b) => ({ id: b.dataset.family, n: +b.querySelector('.pill__n').textContent,
        leaves: document.querySelectorAll(`[data-branch="${b.dataset.family}"] .leaf`).length, tiles: document.querySelectorAll(`.tile[data-fam="${b.dataset.family}"]`).length })) }));
    if (t.view !== 'tree' || !t.bar) fail(`1440 opens on the ${t.view}${t.bar ? '' : ' without its bar'}, not the tree`);
    if (await shownBranch(page) !== 'project') fail(`the tree opens on ${await shownBranch(page) || 'nothing'}, not the projects`);
    if (t.root !== t.said || t.tiles !== t.said) fail(`root ${t.root}, heading ${t.said}, tiles ${t.tiles}`);
    if (t.fams.reduce((s, f) => s + f.n, 0) !== t.root) fail(`the families sum to ${t.fams.reduce((s, f) => s + f.n, 0)}, not the root's ${t.root}`);
    for (const f of t.fams) if (f.n !== f.leaves || f.n !== f.tiles) fail(`${f.id}: pill ${f.n}, leaves ${f.leaves}, tiles ${f.tiles}`);
    // the hover: the leaf grows to 1.45, its caption tag shows, its connector darkens
    const leaf = page.locator('[data-branch="project"] .leaf').nth(4);
    await leaf.hover();
    const h = await leaf.evaluate((l) => ({ k: l.querySelector('.leaf__in').getBoundingClientRect().width / l.getBoundingClientRect().width,
      cap: getComputedStyle(l.querySelector('.leaf__cap')).visibility, hot: l.parentNode.querySelectorAll('path.is-hot').length }));
    if (Math.abs(h.k - 1.45) > 0.02 || h.cap !== 'visible' || h.hot !== 1) fail(`a leaf under the pointer: scale ${h.k.toFixed(2)}, caption ${h.cap}, ${h.hot} connector(s) lit`);
    await page.mouse.move(5, 450);
    // each branch: chosen by keyboard, written to the address, its leaves apart and inside the tree
    for (const f of t.fams) {
      await page.locator(`.tree__fam[data-family="${f.id}"]`).focus();
      await page.keyboard.press('Enter');
      const k = await page.evaluate((id) => {
        const tree = document.querySelector('.tree').getBoundingClientRect();
        const rs = [...document.querySelectorAll(`[data-branch="${id}"] .leaf`)].map((l) => l.getBoundingClientRect());
        let overlap = 0, out = 0;
        rs.forEach((r, i) => { if (r.left < tree.left - 1 || r.right > tree.right + 1 || r.top < tree.top - 1 || r.bottom > tree.bottom + 1) out++;
          for (let j = i + 1; j < rs.length; j++) { const q = rs[j]; if (r.left < q.right - 0.5 && q.left < r.right - 0.5 && r.top < q.bottom - 0.5 && q.top < r.bottom - 0.5) overlap++; } });
        return { q: location.search, pressed: document.querySelector(`.tree__fam[data-family="${id}"]`).getAttribute('aria-pressed'), overlap, out };
      }, f.id);
      const s = await shownBranch(page);
      if (s !== f.id || !new RegExp(`family=${f.id}`).test(k.q) || k.pressed !== 'true') fail(`${f.id} by keyboard: shown ${s}, address ${k.q}, pressed ${k.pressed}`);
      if (k.overlap || k.out) fail(`${f.id}: ${k.overlap} overlapping pair(s) of leaves, ${k.out} outside the tree`);
    }
    const dr = t.fams.find((f) => f.id === 'drawing').n;
    await page.locator('.tree__fam[data-family="drawing"]').click();
    await viewerCount(page, '[data-branch="drawing"] [data-viewer]', dr, 'from a leaf');
    // the grid: a family by keyboard shows exactly its tiles; the viewer's gallery is those tiles
    await page.locator('.ix-bar [data-view-btn="grid"]').click();
    const re = t.fams.find((f) => f.id === 'render').n;
    await page.locator('.ix-bar button[data-family="render"]').focus();
    await page.keyboard.press('Enter');
    const g = await page.evaluate(() => ({ view: document.body.dataset.ixView, shown: [...document.querySelectorAll('.tile')].filter((x) => !x.hidden).length, q: location.search }));
    if (g.view !== 'grid' || g.shown !== re || !/view=grid&family=render/.test(g.q)) fail(`grid, Renders by keyboard: ${g.view}, ${g.shown} of ${re} tiles, address ${g.q}`);
    await viewerCount(page, '.tile:not([hidden]) [data-viewer]', re, 'from the grid');
    await page.locator('.ix-bar [data-view-btn="list"]').click();
    if (!(await page.evaluate(() => !document.querySelector('[data-view="list"]').hidden && document.querySelector('[data-view="grid"]').hidden))) fail('the list did not open');
    await ctx.close();
    for (const [q, view, fam] of [['?view=tree&family=render', 'tree', 'render'], ['?view=list&family=film', 'list', 'film']]) {
      const o = await open(1440, q);
      const r = await o.page.evaluate((fam) => ({ view: document.body.dataset.ixView, pressed: document.querySelector(`.ix-bar button[data-family="${fam}"]`).getAttribute('aria-pressed') }), fam);
      if (r.view !== view || r.pressed !== 'true' || (view === 'tree' && await shownBranch(o.page) !== fam)) fail(`the address ${q} did not restore both (${r.view}, pressed ${r.pressed})`);
      await o.ctx.close();
    }
  } catch (e) { fail(e.message); }
  return failures;
}
const indexFailures = await runIndexPass();
gateFails += indexFailures.length;
if (indexFailures.length) console.log(`FAIL index: ${indexFailures.join(' | ')}`);
else console.log('ok   index: tree at 1440 and grid at 375, families sum to the root and match leaves and tiles, branches by keyboard, leaves apart and inside, hover, viewer from leaves and tiles, list, addresses restored');
// The filters (D125-D127). On the grid at 1440, each choice of each facet counts, before it is pressed, exactly the
// tiles whose built values hold it, and pressed it shows exactly those, says so in the result line and the address,
// and a second press clears it. Two facets combine, a choice out of reach is not acted on, Clear all empties both.
// By keyboard alone the pill opens the panel, Tab reaches the first choice, Space presses it, Esc closes the panel
// and returns focus to the pill. The tree dims what does not match and puts it out of reach, its family pills
// counting the rest; the list leaves out its rows. An address restores the choices, and so does Back from a project.
// axe passes with the panel open. At 320 and 375 it stays on the screen with no sideways scroll, every choice at
// least 24px. Under reduced motion it shows at once. No errors in the console.
async function runFilterPass() {
  const failures = [];
  const url = urls.find((u) => u.endsWith('architecture.html'));
  if (!url) return failures;
  const fail = (s) => failures.push(s);
  const errors = [];
  const open = async (w, q = '', h = w < 768 ? 812 : 900) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(url + q, { waitUntil: 'load' }); return { ctx, page };
  };
  // what the grid shows against what the built values say it should
  const grid = (page) => page.evaluate(() => {
    const has = (el, k, v) => (el.getAttribute(`data-${k}`) || '').split(' ').includes(v);
    const chosen = [...document.querySelectorAll('[data-facet][aria-pressed="true"]')].map((b) => [b.dataset.facet, b.dataset.value]);
    const fam = document.querySelector('.ix-bar [data-family][aria-pressed="true"]').dataset.family;
    const tiles = [...document.querySelectorAll('.tile')].filter((t) => fam === 'all' || t.dataset.fam === fam);
    const want = tiles.filter((t) => chosen.every(([k, v]) => has(t, k, v)));
    const shown = [...document.querySelectorAll('.tile')].filter((t) => !t.hidden);
    const r = document.querySelector('[data-ix-result]');
    return { q: location.search, chosen: chosen.map((c) => c.join('=')).join('&'), want: want.length, of: tiles.length, shown: shown.length,
      same: shown.length === want.length && want.every((t) => !t.hidden), result: r.hidden ? '' : r.firstElementChild.textContent };
  });
  const press = (page, k, v) => page.locator(`[data-facet="${k}"][data-value="${v}"]`).click({ force: true });   // force: Playwright waits out aria-disabled
  try {
    {
      const { ctx, page } = await open(1440, '?view=grid');
      await page.locator('[data-filter-open]').click();
      if (await page.locator('#ix-filter').isHidden()) fail('the Filter pill did not open the panel');
      const choices = await page.evaluate(() => [...document.querySelectorAll('[data-facet]')].map((b) => ({ k: b.dataset.facet, v: b.dataset.value, n: +b.querySelector('.pill__n').textContent })));
      for (const c of choices) {
        await press(page, c.k, c.v);
        const s = await grid(page);
        if (!s.same || s.shown !== c.n || !s.result.endsWith(`${c.n} of ${s.of}`) || !s.q.includes(`${c.k}=${c.v}`)) fail(`${c.k}=${c.v}: counted ${c.n}, shows ${s.shown} of the ${s.want} it should; result "${s.result}", address ${s.q}`);
        await press(page, c.k, c.v);
        const z = await grid(page);
        if (z.chosen || z.shown !== z.of || z.result || z.q.includes(`${c.k}=`)) fail(`${c.k}=${c.v} pressed again: still ${z.chosen || 'set'}, ${z.shown} shown, address ${z.q}`);
      }
      // two facets, a choice out of reach, Clear all
      await press(page, 'place', 'france'); await press(page, 'type', 'residential');
      const two = await grid(page);
      if (!two.same || two.chosen !== 'place=france&type=residential' || !/place=france/.test(two.q) || !/type=residential/.test(two.q)) fail(`France and Residential: ${two.chosen}, ${two.shown} shown of ${two.want}, address ${two.q}`);
      const off = await page.locator('[data-facet][aria-disabled="true"]').first();
      if (!(await off.count())) fail('France and Residential leave no choice out of reach (Tunisia should be)');
      else {
        await off.click({ force: true });
        const after = await grid(page);
        if (after.chosen !== two.chosen || after.shown !== two.shown) fail(`a choice out of reach acted: ${after.chosen}`);
      }
      const dimmed = await page.evaluate(() => { const b = document.querySelector('[data-facet][aria-disabled="true"]'); const s = getComputedStyle(b);
        const rgb = (c) => c.match(/[\d.]+/g).slice(0, 3).map(Number); const L = (c) => { const [r, g, bl] = rgb(c).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
        const a = L(s.color), z = L(s.backgroundColor); return (Math.max(a, z) + 0.05) / (Math.min(a, z) + 0.05); });
      if (dimmed < 4.5) fail(`a choice out of reach reads at ${dimmed.toFixed(2)}:1, under 4.5:1`);
      await page.addScriptTag({ content: axeSrc });
      const ax = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => `${v.id} x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`));
      if (ax.length) fail(`axe with the panel open: ${ax.join(' ; ')}`);
      await page.locator('.ix-filter__clear').click();
      const none = await grid(page);
      if (none.chosen || none.shown !== none.of || /place=|type=/.test(none.q)) fail(`Clear all left ${none.chosen || 'nothing chosen'} with ${none.shown} of ${none.of} shown, address ${none.q}`);
      // a click outside closes it
      await page.mouse.click(5, 300);
      if (await page.locator('#ix-filter').isVisible()) fail('a click outside left the panel open');
      await ctx.close();
    }
    {
      const { ctx, page } = await open(1440, '?view=grid');
      await page.locator('[data-filter-open]').focus();
      await page.keyboard.press('Enter');
      const shown = await page.locator('#ix-filter').isVisible();
      await page.keyboard.press('Tab');
      const first = await page.evaluate(() => { const a = document.activeElement; return a.dataset.facet ? `${a.dataset.facet}=${a.dataset.value}` : a.outerHTML.slice(0, 60); });
      await page.keyboard.press('Space');
      const s = await grid(page);
      await page.keyboard.press('Escape');
      const k = await page.evaluate(() => ({ hidden: document.getElementById('ix-filter').hidden, focus: document.activeElement.hasAttribute('data-filter-open'), exp: document.querySelector('[data-filter-open]').getAttribute('aria-expanded'), badge: document.querySelector('[data-filter-n]').textContent }));
      if (!shown || first !== 'place=tunisia' || s.chosen !== 'place=tunisia' || !s.same) fail(`by keyboard: panel ${shown ? 'open' : 'closed'}, Tab reached ${first}, Space chose ${s.chosen || 'nothing'}`);
      if (!k.hidden || !k.focus || k.exp !== 'false' || k.badge !== '1') fail(`Esc: panel ${k.hidden ? 'closed' : 'open'}, focus ${k.focus ? 'on' : 'not on'} the pill, expanded ${k.exp}, badge "${k.badge}"`);
      await ctx.close();
    }
    {
      // the tree: what does not match dims in place, out of reach; the family pills count the rest
      const { ctx, page } = await open(1440, '?place=tunisia');
      const t = await page.evaluate(() => {
        const leaves = [...document.querySelectorAll('[data-branch="project"] .leaf')];
        const bad = leaves.filter((l) => (l.dataset.place === 'tunisia') === (l.classList.contains('is-off') || l.inert || +getComputedStyle(l).opacity < 0.5));
        const fams = [...document.querySelectorAll('.tree__fam')].map((b) => [+b.querySelector('.pill__n').textContent, document.querySelectorAll(`[data-branch="${b.dataset.family}"] .leaf[data-place="tunisia"]`).length]);
        return { view: document.body.dataset.ixView, bad: bad.length, fams, pressed: document.querySelector('[data-facet="place"][data-value="tunisia"]').getAttribute('aria-pressed') };
      });
      if (t.view !== 'tree' || t.pressed !== 'true' || t.bad) fail(`tree, Tunisia: ${t.view}, pressed ${t.pressed}, ${t.bad} leaf/leaves dimmed wrongly`);
      if (t.fams.some(([n, m]) => n !== m)) fail(`tree, Tunisia: family pills ${t.fams.map(([n, m]) => `${n}/${m}`).join(' ')}`);
      await ctx.close();
    }
    {
      const { ctx, page } = await open(1440, '?view=list&practice=academic');
      const l = await page.evaluate(() => ({ rows: [...document.querySelectorAll('.ix-table tbody tr')].filter((r) => !r.hidden).map((r) => r.dataset.practice), cap: document.querySelector('[data-list-n]').textContent }));
      if (l.rows.length !== 3 || l.rows.some((p) => p !== 'academic') || l.cap !== '3 of 15') fail(`list, Academic: ${l.rows.length} rows (${l.rows}), caption "${l.cap}"`);
      await ctx.close();
    }
    {
      // an address restores the choices; so does Back from a project
      const { ctx, page } = await open(1440, '?view=grid&place=morocco&scale=up-to-1000');
      const a = await grid(page);
      if (a.chosen !== 'place=morocco&scale=up-to-1000' || !a.same || !a.result) fail(`the address restored ${a.chosen || 'nothing'}, ${a.shown} shown of ${a.want}`);
      await page.locator('.tile:not([hidden]) a.tile__p').first().click();
      await page.waitForURL(/project-/);
      await page.goBack({ waitUntil: 'load' });
      const b = await grid(page);
      if (b.chosen !== a.chosen || b.shown !== a.shown) fail(`Back from a project: ${b.chosen || 'nothing chosen'}, ${b.shown} shown (was ${a.shown})`);
      await ctx.close();
    }
    for (const [w, h] of [[320, 640], [375, 812]]) {
      const { ctx, page } = await open(w, '', h);
      await page.locator('[data-filter-open]').click();
      const m = await page.evaluate(() => {
        const p = document.getElementById('ix-filter').getBoundingClientRect();
        const small = [...document.querySelectorAll('#ix-filter button')].filter((b) => { const r = b.getBoundingClientRect(); return r.width < 24 || r.height < 24; }).length;
        return { sw: document.documentElement.scrollWidth, vw: innerWidth, vh: innerHeight, p: [p.left, p.right, p.top, p.bottom].map(Math.round), small, op: getComputedStyle(document.getElementById('ix-filter')).opacity };
      });
      if (m.sw > m.vw || m.p[0] < 0 || m.p[1] > m.vw || m.p[2] < 0 || m.p[3] > m.vh) fail(`${w}: page ${m.sw} wide, panel at ${m.p}`);
      if (m.small) fail(`${w}: ${m.small} choice(s) under 24px`);
      if (m.op !== '1') fail(`${w}, reduced motion: the panel shows at opacity ${m.op}, not at once`);
      await ctx.close();
    }
  } catch (e) { fail(e.message); }
  if (errors.length) fail(`console: ${[...new Set(errors)].slice(0, 3).join(' | ')}`);
  return failures;
}
const filterFailures = await runFilterPass();
gateFails += filterFailures.length;
if (filterFailures.length) console.log(`FAIL filters: ${filterFailures.join(' | ')}`);
else console.log('ok   filters: every choice counts and shows exactly its tiles, address and result line, cleared by a second press; two combine; out of reach not acted on, 4.5:1; Clear all; outside click; keyboard (Tab, Space, Esc to the pill); tree dims in place with family counts; list rows; address and Back restore; axe open; 320/375 on screen, targets ≥ 24px, instant; no console errors');
// About (D113): the sheet. With motion at 1440 (scrollbars shown, so a shift of the header would show), About opens it
// from three pages: the column comes in, its heading takes focus, the page behind is inert and stays still under the
// wheel while the column scrolls, and the header does not move. X, Esc and a click on the veil each close it and
// return focus to About; a selection dragged out of the column does not; Esc closes an open chip in it first; axe
// passes with it open. Under reduced motion it opens and closes at once. On a 375 touch screen it opens from the menu
// and returns focus to the menu button. about.html stands alone (the column, no sheet); without the script About is
// a link to it.
async function runAboutPass() {
  const failures = [];
  const fail = (s) => failures.push(s);
  if (!urls.some((u) => u.includes('about.html'))) return failures;
  const st = (page) => page.evaluate(() => {
    const s = document.getElementById('about'), a = document.querySelector('.site-header a[data-about]');
    return { open: !!s?.open, in: !!s?.classList.contains('is-in'), cls: document.documentElement.classList.contains('sheet-open'),
      head: document.activeElement?.id === 'about-h', about: document.activeElement === a, inert: document.querySelector('main').inert,
      expanded: a?.getAttribute('aria-expanded'), y: scrollY, sy: s ? s.querySelector('.about__scroll').scrollTop : 0,
      tools: document.querySelector('.site-header .theme-button').getBoundingClientRect().left,
      col: s ? getComputedStyle(s.querySelector('.about__col')).opacity : '', gutter: innerWidth - document.documentElement.clientWidth };
  });
  const shown = (s, where) => { if (!s.open || !s.in || !s.cls || !s.head || !s.inert || s.expanded !== 'true') fail(`${where}: open ${s.open}, in ${s.in}, header class ${s.cls}, heading focused ${s.head}, page inert ${s.inert}, About expanded ${s.expanded}`); };
  const gone = (s, where) => { if (s.open || s.cls || !s.about || s.inert || s.expanded !== 'false') fail(`${where}: still open ${s.open}, header class ${s.cls}, focus back on About ${s.about}, page inert ${s.inert}, expanded ${s.expanded}`); };
  // a browser that shows its scrollbars (the shared one hides them), so a header shift on open is measurable
  const sb = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
    ignoreDefaultArgs: ['--hide-scrollbars'], args: FILE ? ['--allow-file-access-from-files'] : [] });
  const ctx = await sb.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'no-preference' });
  await ctx.addInitScript(() => { try { localStorage.setItem('hazem-theme', 'light'); } catch (e) {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));
  try {
    for (const [i, rel] of ['index.html', 'architecture.html', 'projects/project-al-arg.html'].entries()) {
      await page.goto(BASE + rel, { waitUntil: 'load' });
      await page.waitForTimeout(700);
      await page.evaluate(() => scrollTo({ top: 300, behavior: 'instant' }));
      await page.waitForTimeout(300);
      const before = await st(page);
      if (!before.gutter) fail(`${rel}: no scrollbar shown, the header shift is not measured`);
      await page.locator('.site-header a[data-about]').click();
      await page.waitForTimeout(800);
      const s = await st(page);
      shown(s, `${rel} open`);
      if (s.col !== '1') fail(`${rel}: the column stands at opacity ${s.col}`);
      if (Math.abs(s.tools - before.tools) > 0.5) fail(`${rel}: the header moved ${(s.tools - before.tools).toFixed(1)}px on open`);
      await page.mouse.move(720, 500);
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(1000);
      const w = await st(page);
      if (w.y !== before.y) fail(`${rel}: the page behind scrolled (${before.y} to ${w.y})`);
      if (w.sy < 200) fail(`${rel}: the column scrolled ${w.sy}px under a 600px wheel`);
      if (i === 0) await page.locator('[data-sheet-close]').click();
      else if (i === 1) await page.keyboard.press('Escape');
      else await page.mouse.click(60, 700);
      await page.waitForTimeout(700);
      gone(await st(page), `${rel} closed by ${['X', 'Esc', 'a click outside'][i]}`);
      if ((await st(page)).y !== before.y) fail(`${rel}: the page did not stay where it was`);
    }
    // a selection dragged from the column onto the veil keeps it open; Esc closes an open chip in it before the sheet
    await page.locator('.site-header a[data-about]').click();
    await page.waitForTimeout(800);
    const p = await page.locator('#about header.about__s p').boundingBox();
    await page.mouse.move(p.x + 40, p.y + 10);
    await page.mouse.down();
    await page.mouse.move(40, 760, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(600);
    if (!(await st(page)).open) fail('a text selection dragged out of the column closed the sheet');
    await page.locator('#about .mail__a').click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    const c = await page.evaluate(() => ({ chip: document.querySelector('#about .mail').classList.contains('is-open'), open: document.getElementById('about').open }));
    if (c.chip || !c.open) fail(`Esc with the chip open in the sheet: chip open ${c.chip}, sheet open ${c.open}`);
    // axe with the sheet open
    await page.addScriptTag({ content: axeSrc });
    const ax = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => `${v.id} x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`));
    if (ax.length) fail(`axe with the sheet open: ${ax.join(' ; ')}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    gone(await st(page), 'closed by Esc after the chip');
    // about.html: the column as a page, no sheet, About its current page
    await page.goto(BASE + 'about.html', { waitUntil: 'load' });
    const a = await page.evaluate(() => ({ sheet: !!document.getElementById('about'), h1: document.querySelector('h1')?.textContent, col: !!document.querySelector('main .about__col'),
      cur: document.querySelector('.site-header .nav a[href$="about.html"]')?.getAttribute('aria-current'), x: !!document.querySelector('[data-sheet-close]') }));
    if (a.sheet || a.x || !a.col || a.h1 !== 'Hazem Radhouani' || a.cur !== 'page') fail(`about.html: ${JSON.stringify(a)}`);
  } catch (e) { fail(e.message); }
  if (errors.length) fail(`page errors: ${errors.join(' ; ')}`);
  await ctx.close();
  await sb.close();
  // reduced motion: at once, both ways
  const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', reducedMotion: 'reduce' });
  const rp = await rm.newPage();
  try {
    await rp.goto(BASE + 'architecture.html', { waitUntil: 'load' });
    await rp.locator('.site-header a[data-about]').click();
    await rp.waitForTimeout(60);
    const s = await st(rp);
    shown(s, 'reduced motion open');
    if (s.col !== '1') fail(`reduced motion: the column stands at opacity ${s.col} 60ms after the click`);
    await rp.keyboard.press('Escape');
    await rp.waitForTimeout(60);
    gone(await st(rp), 'reduced motion, Esc');
  } catch (e) { fail(`reduced motion: ${e.message}`); }
  await rm.close();
  // the phone menu: About opens the sheet once the menu has closed; X returns focus to the menu button
  const ph = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, colorScheme: 'light', reducedMotion: 'no-preference' });
  const pp = await ph.newPage();
  try {
    await pp.goto(BASE + 'books.html', { waitUntil: 'load' });
    await pp.locator('.site-header .menu-button').tap();
    await pp.waitForTimeout(500);
    await pp.locator('#menu a[data-about]').tap();
    await pp.waitForTimeout(900);
    const s = await pp.evaluate(() => { const x = document.querySelector('[data-sheet-close]').getBoundingClientRect(); return { menu: document.getElementById('menu').open, open: document.getElementById('about').open, head: document.activeElement?.id === 'about-h', x: [x.left, x.right, x.top, x.width] }; });
    if (s.menu || !s.open || !s.head) fail(`phone: from the menu, menu open ${s.menu}, sheet open ${s.open}, heading focused ${s.head}`);
    if (!(s.x[3] >= 44 && s.x[0] >= 0 && s.x[1] <= 375 && s.x[2] >= 0)) fail(`phone: X at ${s.x.map(Math.round).join(',')}`);
    await pp.locator('[data-sheet-close]').tap();
    await pp.waitForTimeout(700);
    const g = await pp.evaluate(() => ({ open: document.getElementById('about').open, focus: document.activeElement?.classList.contains('menu-button') }));
    if (g.open || !g.focus) fail(`phone: X left the sheet open ${g.open}, focus on the menu button ${g.focus}`);
  } catch (e) { fail(`phone: ${e.message}`); }
  await ph.close();
  // without the script About is a link to about.html
  const nj = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const np = await nj.newPage();
  try {
    await np.goto(BASE + 'index.html', { waitUntil: 'load' });
    await Promise.all([np.waitForURL(/about\.html$/u, { timeout: 5000 }), np.locator('.site-header a[data-about]').click()]);
  } catch (e) { fail(`without the script, About did not lead to about.html: ${e.message.split('\n')[0]}`); }
  await nj.close();
  return failures;
}
const aboutFailures = await runAboutPass();
gateFails += aboutFailures.length;
if (aboutFailures.length) console.log(`FAIL about: ${aboutFailures.join(' | ')}`);
else console.log('ok   about: the sheet opens from three pages (focus, inert page, still page, column scrolls, header unmoved); X, Esc, outside click close it and return focus; a dragged selection keeps it; Esc closes its chip first; axe open; instant under reduced motion; from the phone menu; about.html alone; a link without the script');
// The case-study reel (D115), at 1440 with motion and a fine pointer, on every case study: the opening stands near
// full-bleed with its words hidden; at the end of its track the frame sits in its slot and the words, caption and facts
// are shown; back at the top it is near full-bleed again (a function of the scroll). The rail marks the chapter whose
// top has passed the middle of the screen, and the one before until it has. Read to the end, every plate and chapter
// head above the reading line has arrived (no fade, offset, scale or blur left). Under reduced motion the opening is
// a still page (no track, nothing moved) and a chapter reached by its address stands clear of the header; on a phone
// the opening stacks with no track.
async function runCasePass() {
  const failures = [];
  const cases = urls.filter((u) => /project-[a-z-]+\.html$/.test(u));
  if (!cases.length) return null;   // --only left no case study in the run
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'no-preference' });
  const opening = () => { const m = document.querySelector('.op__media').getBoundingClientRect(), s = document.querySelector('.op__slot').getBoundingClientRect(); const t = getComputedStyle(document.querySelector('.op__t')); return { m: [m.left, m.top, m.width, m.height], s: [s.left, s.top, s.width, s.height], t: +t.opacity, facts: +getComputedStyle(document.querySelector('.op__facts')).opacity }; };
  for (const url of cases) {
    const name = url.replace(/^.*\//, '');
    const page = await ctx.newPage();
    const fail = (s) => failures.push(`${name}: ${s}`);
    try {
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(500);
      const a = await page.evaluate(opening);
      if (!(a.m[2] >= 0.8 * 1440 || a.m[3] >= 0.7 * 900) || a.t > 0.05) fail(`the opening does not stand near full-bleed with its words hidden (${Math.round(a.m[2])}x${Math.round(a.m[3])}, title ${a.t})`);
      await page.evaluate(() => { const op = document.querySelector('.op'); scrollTo({ top: op.getBoundingClientRect().top + scrollY + op.offsetHeight - innerHeight, behavior: 'instant' }); });
      await page.waitForTimeout(500);
      const b = await page.evaluate(opening);
      if (b.m.some((v, i) => Math.abs(v - b.s[i]) > 2)) fail(`at the end of the track the frame is not in its slot (${b.m.map(Math.round)} vs ${b.s.map(Math.round)})`);
      if (b.t !== 1 || b.facts !== 1) fail(`at the end of the track the words are not shown (title ${b.t}, facts ${b.facts})`);
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(500);
      const c = await page.evaluate(opening);
      if (c.m.some((v, i) => Math.abs(v - a.m[i]) > 2)) fail('back at the top the opening is not as it was (the motion is not a function of the scroll)');
      // the rail: the chapter whose top has passed the middle is current, the one before it until then
      const rail = await page.evaluate(async () => {
        const links = [...document.querySelectorAll('.rail a')]; if (links.length < 2) return null;
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const k = Math.min(2, links.length - 1); const ch = document.querySelector(links[k].getAttribute('href'));
        const at = async (dy) => { scrollTo({ top: ch.getBoundingClientRect().top + scrollY - innerHeight / 2 + dy, behavior: 'instant' }); await sleep(400); return links.map((l) => l.getAttribute('aria-current')); };
        const past = await at(30), before = await at(-30);
        const box = document.querySelector('.rail ol').getBoundingClientRect();
        return { k, past, before, shown: box.top >= 0 && box.bottom <= innerHeight && box.width > 0 };
      });
      if (rail) {
        if (rail.past.filter(Boolean).length !== 1 || rail.past[rail.k] !== 'location') fail(`the rail does not mark chapter ${rail.k + 1} once its top passes the middle (${rail.past})`);
        if (rail.before[rail.k - 1] !== 'location') fail(`the rail does not keep chapter ${rail.k} until the next passes the middle (${rail.before})`);
        if (!rail.shown) fail('the rail is not on screen while the chapters pass');
      }
      // read to the end: everything above the reading line has arrived
      const left = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) { scrollTo({ top: y, behavior: 'instant' }); await sleep(80); }
        scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); await sleep(400);
        const out = [];
        for (const el of document.querySelectorAll('[data-fx="enter"]')) {
          if (el.getBoundingClientRect().top > innerHeight * 0.45) continue;
          for (const k of el.querySelectorAll(':scope > :is(.fig__plate, .cells, .cap, .key, .ch__t, .ch__text, .next__label), :scope .cell')) {
            const cs = getComputedStyle(k);
            if (cs.opacity !== '1' || !/^(none|0(px|%)?( 0(px|%)?)?)$/.test(cs.translate) || !['none', '1'].includes(cs.scale) || !['none', 'blur(0px)'].includes(cs.filter)) out.push(`${k.className} in ${el.id || el.className}: ${cs.opacity} ${cs.translate} ${cs.scale} ${cs.filter}`);
          }
        }
        return out;
      });
      if (left.length) fail(`not arrived after reading: ${left.slice(0, 3).join(' ; ')}`);
    } catch (e) { fail(e.message.split('\n')[0]); }
    await page.close();
  }
  await ctx.close();
  // still: reduced motion at 1440 (and a chapter by its address), and a phone
  for (const [vp, opts] of [[{ width: 1440, height: 900 }, {}], [{ width: 375, height: 812 }, { isMobile: true, hasTouch: true }]]) {
    const sc = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: vp.width === 375 ? 'no-preference' : 'reduce', ...opts });
    const page = await sc.newPage();
    const url = cases.find((u) => u.includes('project-al-arg')) || cases[0];
    const fail = (s) => failures.push(`${vp.width === 375 ? 'phone' : 'reduced motion'}: ${s}`);
    try {
      const id = await (async () => { await page.goto(url, { waitUntil: 'load' }); return page.evaluate(() => [...document.querySelectorAll('.ch')].pop()?.id); })();
      const s = await page.evaluate(() => { const st = getComputedStyle(document.querySelector('.op__stage')), m = getComputedStyle(document.querySelector('.op__media')); return { sticky: st.position, tall: document.querySelector('.op').offsetHeight > innerHeight * 1.5, pos: m.position, moved: m.translate !== 'none' || m.scale !== 'none', t: getComputedStyle(document.querySelector('.op__t')).opacity }; });
      if (s.sticky === 'sticky' || s.tall || s.pos === 'absolute' || s.moved || s.t !== '1') fail(`the opening is not a still page (${JSON.stringify(s)})`);
      if (vp.width === 1440 && id) {
        await page.goto(`${url}#${id}`, { waitUntil: 'load' });
        await page.waitForTimeout(400);
        const r = await page.evaluate((id) => ({ top: document.getElementById(id).getBoundingClientRect().top, head: document.querySelector('.site-header').getBoundingClientRect().bottom }), id);
        if (r.top < r.head - 1 || r.top > r.head + 48) fail(`a chapter reached by its address stands at ${Math.round(r.top)}px, the header ends at ${Math.round(r.head)}px`);
      }
    } catch (e) { fail(e.message.split('\n')[0]); }
    await sc.close();
  }
  return failures;
}
const caseFailures = await runCasePass();
gateFails += caseFailures?.length || 0;
if (!caseFailures) console.log('note  case studies: none in this run (--only), not checked');
else if (caseFailures.length) console.log(`FAIL case studies: ${caseFailures.length} issue(s)\n  ${caseFailures.slice(0, 20).join('\n  ')}`);
else console.log('ok   case studies: the opening settles from near full-bleed into its slot and back (a function of the scroll), words after it; the rail marks the chapter past the middle; every plate and head arrived after reading; still under reduced motion and on a phone; a chapter by its address clear of the header');
const scrollFailures = await runScrollPass();
gateFails += scrollFailures.length;
if (scrollFailures.length) console.log(`FAIL smooth scroll: ${scrollFailures.join(' | ')}`);
else console.log('ok   smooth scroll: wheel glides and settles, keyboard followed, rail links glide, dialog holds, native under reduced motion');
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
      // chrome (D106, plan 18): with the full header (48rem and up) the centred name stands clear of the routes and the
      // tools; on a phone its words stand clear of the scheme and menu buttons
      out.chrome = [];
      const brand = document.querySelector('.site-header .brand');
      const nameBox = brand?.getBoundingClientRect();
      if (innerWidth < 768 && brand) {
        const words = document.createRange(); words.selectNodeContents(brand); const t = words.getBoundingClientRect(), b = document.querySelector('.site-header__tools').getBoundingClientRect();
        if (t.right > b.left && b.right > t.left) out.chrome.push(`the name's words reach the header's buttons (${Math.round(t.right - b.left)}px)`);
      }
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
        ? new Set(['rgba(0, 0, 0, 0)', 'rgb(18, 19, 17)', 'rgb(247, 245, 239)', 'rgb(69, 70, 63)', 'rgba(18, 19, 17, 0.88)', 'rgba(18, 19, 17, 0.86)', 'rgb(26, 27, 25)', 'color(srgb 0.0705882 0.0745098 0.0666667 / 0.55)', 'color(srgb 0.0705882 0.0745098 0.0666667 / 0.86)'])
        : new Set(['rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(17, 17, 17)', 'rgba(255, 255, 255, 0.86)', 'rgb(245, 245, 243)', 'color(srgb 1 1 1 / 0.55)', 'color(srgb 1 1 1 / 0.86)']);   // the sheet's veil, the field at 55% (D113), and the frosted pill, the field at 86% (D109, the rail D115): Chrome writes a color-mix() this way
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
    if (SHOTS && (w === 375 || w === 1440)) await page.screenshot({ path: path.join(here, '.cache', `${name.replace(/[^\w-]/g, '_')}-${theme}-${w}.jpg`), type: 'jpeg', quality: 60, fullPage: true });
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
