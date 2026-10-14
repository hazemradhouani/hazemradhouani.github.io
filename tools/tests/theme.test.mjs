import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

test('the document shell resolves a safe theme before the stylesheet and exposes all three theme controls', () => {
  const layout = read('tools/templates/layout.mjs');
  const bootstrap = layout.indexOf('data-theme-bootstrap');
  const stylesheet = layout.indexOf('rel="stylesheet"');
  assert.ok(bootstrap >= 0, 'missing pre-paint theme bootstrap');
  assert.ok(stylesheet > bootstrap, 'theme bootstrap must precede the stylesheet');
  assert.match(layout, /localStorage\.getItem\('hazem-theme'\)/u);
  assert.match(layout, /prefers-color-scheme:\s*dark/u);
  assert.match(layout, /themeButton\('header'\)/u);
  assert.match(layout, /themeButton\('bar'\)/u);
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
  assert.match(css, /\.theme-button__glyph/u, 'the smallest phone header has a compact theme affordance');
  assert.match(css, /max-width:\s*23\.99rem/u, 'the compact control is scoped to the narrowest phones');
  assert.match(css, /input, textarea, select\s*\{[^}]*background:\s*var\(--bg\)/u, 'native form controls must not leak a browser-specific dark fill');
});

test('the preference controller synchronises controls, persists safely and updates browser chrome', () => {
  const js = read('js/site.js');
  assert.match(js, /data-theme-toggle/u);
  assert.match(js, /localStorage\.setItem\('hazem-theme'/u);
  assert.match(js, /theme-color/u);
  assert.match(js, /aria-pressed/u);
  assert.match(js, /matchMedia\('\(prefers-color-scheme: dark\)'\)/u);
});

test('browser QA exercises both schemes, fallback resolution and theme interactions', () => {
  const qa = read('tools/qa.mjs');
  assert.match(qa, /--base=/u, 'QA accepts an explicit local preview base');
  assert.match(qa, /const THEMES = \['light', 'dark'\]/u);
  assert.match(qa, /addInitScript/u);
  assert.match(qa, /runThemeInteractions/u);
  assert.match(qa, /runThemeFallback/u);
  assert.match(qa, /reducedMotion:\s*'reduce'/u);
});

test('drawings get their dark treatment in the page and in the viewer: inverted linework or the inspection field (D50)', () => {
  const css = read('css/site.css');
  const js = read('js/site.js');
  const partials = read('tools/templates/partials.mjs');
  assert.match(css, /html\[data-theme="dark"\] \.nw--invert img[^{]*\{[^}]*filter:\s*invert\(\.965\)/u);
  assert.match(css, /html\[data-theme="dark"\] \.nw--invert-accent img[^{]*\{[^}]*filter:\s*invert\(\.965\) hue-rotate\(180deg\)/u);
  assert.match(css, /\.nw--drawing\.nw--field\s*\{[^}]*background:\s*var\(--drawing-bg\)/u);
  assert.match(css, /\.viewer__stage\.is-invert img/u);
  assert.match(js, /data-dark/u);
  assert.match(partials, /darkOf\(/u);
  assert.match(css, /@media print[\s\S]*filter:\s*none/u, 'print shows every drawing as authored, black on white');
});
