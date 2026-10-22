import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

test('the document shell resolves a safe theme before the stylesheet and exposes both theme controls', () => {
  const layout = read('tools/templates/layout.mjs');
  const bootstrap = layout.indexOf('data-theme-bootstrap');
  const stylesheet = layout.indexOf('rel="stylesheet"');
  assert.ok(bootstrap >= 0, 'missing pre-paint theme bootstrap');
  assert.ok(stylesheet > bootstrap, 'theme bootstrap must precede the stylesheet');
  assert.match(layout, /localStorage\.getItem\('hazem-theme'\)/u);
  assert.match(layout, /prefers-color-scheme:\s*dark/u);
  assert.match(layout, /themeButton\('header'\)/u);
  assert.match(layout, /themeButton\('menu'\)/u);
  assert.match(layout, /id="theme-color"/u);
  assert.match(layout, /name="color-scheme" content="light dark"/u);
});

test('the Field tokens keep contrast, a dark inspection field and print-light output', () => {
  const css = read('css/site.css');
  assert.match(css, /html\[data-theme="dark"\]/u);
  assert.match(css, /--bg:\s*#121311/u);
  assert.match(css, /--ink:\s*#F7F5EF/u);
  assert.match(css, /--drawing-bg:/u);
  assert.match(css, /\.nw--drawing/u);
  assert.match(css, /@media print[\s\S]*--bg:\s*#FFFFFF/u);
});

test('the change of scheme is a feathered circle the pointer can run back (D108)', () => {
  const css = read('css/site.css');
  assert.match(css, /@property --vt-r \{ syntax: "<length>"/u, 'the radius is a registered length, so it animates');
  assert.match(css, /html\.theme-vt::view-transition \{ pointer-events: none; \}/u, 'the page under the pictures takes the second click');
  assert.match(css, /html\.theme-vt::view-transition-new\(root\) \{[^}]*mask-image: radial-gradient\(circle at var\(--vt-x\) var\(--vt-y\), #000 calc\(var\(--vt-r\) - 6rem\), transparent var\(--vt-r\)\)/u);
  assert.match(css, /html\.theme-vt \[style\*="view-transition-name"\] \{ view-transition-name: none !important; \}/u, 'nothing else travels');
});

test('the preference controller synchronises controls and pages, persists safely and updates browser chrome', () => {
  const js = read('js/site.js');
  const theme = js.slice(js.indexOf('theme (preference, state)'), js.indexOf('menu (phones; state)'));
  assert.match(theme, /data-theme-toggle/u);
  assert.match(theme, /localStorage\.setItem\('hazem-theme'/u);
  assert.match(theme, /theme-color/u);
  assert.match(theme, /data-theme-action/u);
  assert.doesNotMatch(theme, /aria-pressed/u, 'the toggle is named by its visible state plus its action (WCAG 2.5.3)');
  assert.match(theme, /matchMedia\('\(prefers-color-scheme: dark\)'\)/u);
  assert.match(theme, /addEventListener\('storage'/u, 'another tab follows the change');
  assert.match(theme, /addEventListener\('pageshow'/u, 'a page restored by Back follows the change');
  assert.match(theme, /reduce\.matches \|\| typeof document\.startViewTransition !== 'function'/u, 'reduced motion and old browsers switch at once');
  assert.match(theme, /reveal\.anim\.reverse\(\)/u, 'a click mid-reveal runs the circle back');
  assert.match(theme, /wanted = wanted === 'dark' \? 'light' : 'dark'/u, 'the next scheme comes from the last request, never from the page');
});

test('the email chip is id-free, a mailto: link without the script, and the form is gone (D107)', () => {
  const partials = read('tools/templates/partials.mjs');
  const chip = partials.slice(partials.indexOf('export const mailChip'), partials.indexOf('\n', partials.indexOf('export const mailChip')));
  assert.match(chip, /href="mailto:\$\{email\}"/u);
  assert.match(chip, /class="mail__chip" hidden/u);
  assert.doesNotMatch(chip, /\sid=/u, 'the partial is used several times on a page');
  const js = read('js/site.js');
  assert.match(js, /navigator\.clipboard\.writeText/u);
  assert.match(js, /execCommand\('copy'\)/u);
  assert.doesNotMatch(js + read('tools/templates/pages.mjs'), /data-contact|formsubmit/iu);
  assert.equal(JSON.parse(read('content/site.json')).person.email, 'radhouani.hazem@enau.ucar.tn');
});

test('browser QA exercises both schemes, fallback resolution, theme and chip interactions', () => {
  const qa = read('tools/qa.mjs');
  assert.match(qa, /--base=/u, 'QA accepts an explicit local preview base');
  assert.match(qa, /const THEMES = \['light', 'dark'\]/u);
  assert.match(qa, /addInitScript/u);
  assert.match(qa, /runThemeInteractions/u);
  assert.match(qa, /runThemeFallback/u);
  assert.match(qa, /runChipPass/u);
  assert.match(qa, /grantPermissions\(\['clipboard-read', 'clipboard-write'\]\)/u);
  assert.match(qa, /reducedMotion:\s*'reduce'/u);
});

test('drawings get their dark treatment in the page and in the viewer: inverted linework or the inspection field (D50)', () => {
  const css = read('css/site.css');
  const js = read('js/site.js');
  const partials = read('tools/templates/partials.mjs');
  assert.match(css, /html\[data-theme="dark"\] \.nw--invert img[^{]*\{[^}]*filter:\s*invert\(\.965\)/u);
  assert.match(css, /html\[data-theme="dark"\] \.nw--invert-accent img[^{]*\{[^}]*filter:\s*invert\(\.965\) hue-rotate\(180deg\)/u);
  assert.match(css, /\.nw--drawing\.nw--field\s*\{[^}]*background:\s*var\(--drawing-bg\)/u);
  assert.match(css, /\.viewer__img\.is-invert > img/u);
  assert.match(js, /TREAT\[it\.dark\]/u, 'the treatment travels with each viewer image, not the stage');
  assert.match(js, /data-dark/u);
  assert.match(partials, /darkOf\(/u);
  assert.match(css, /@media print[\s\S]*filter:\s*none/u, 'print shows every drawing as authored, black on white');
});
