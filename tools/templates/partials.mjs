// Shared building blocks for every page ("Field", docs/flagship/08-direction.md).
// Every image is placed at build time on the largest centred span that neither enlarges it nor makes it
// taller than MAX_H at the 1280px canvas, so its edges fall on grid lines and nothing is cropped (D32).
import { html, raw, inline, when } from '../lib/html.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { picture, dims, largest, shown, darkOf } from '../lib/images.mjs';
import { loadCutoutConfig } from '../lib/cutout-config.mjs';
// drawings excluded from cutouts on purpose (tools/cutout.json, tools/cutout.d); any other drawing must have its cutout
const ROOT_DIR = fileURLToPath(new URL('../..', import.meta.url));
const EXCLUDED = new Set(Object.keys(loadCutoutConfig(ROOT_DIR).exclude));
const cutOrFail = (src) => { const rel = shown(src, true); if (rel === src && !EXCLUDED.has(src)) throw new Error(`No cutout for drawing ${src}: run npm run cutout`); return rel; };

export const icon = (name, p) => raw(`<svg class="icon" width="16" height="16" aria-hidden="true" focusable="false"><use href="${p}images/icons.svg#${name}"></use></svg>`);

/* ---------------------------------------------------------- geometry, mirrored from css/site.css */
const CANVAS = 1280, GUT = 32, COLW = (CANVAS - 11 * GUT) / 12;
const MAX_H = 720;                                  // 80% of a 900px desktop viewport
const SPANS = [['full', 12], ['wide', 10], ['text', 8], ['narrow', 6], ['four', 4]];
const N12 = Object.fromEntries(SPANS);
const N8 = { full: 8, wide: 8, text: 6, narrow: 4, four: 4 };  // the same classes on 8 columns
const spanPx = (s) => N12[s] * COLW + (N12[s] - 1) * GUT;
const from = (max) => SPANS.slice(SPANS.findIndex(([s]) => s === max));

// `sizes` for something occupying `frac` of a span (`phone`: its fraction of the phone canvas)
export function sizesFor(span, frac = 1, phone = 1, tab = frac) {
  const d = Math.ceil(spanPx(span) * frac);
  return `(min-width: 90rem) ${d}px, (min-width: 64rem) ${Math.ceil(90 * N12[span] / 12 * frac)}vw, (min-width: 48rem) ${Math.ceil(90 * N8[span] / 8 * tab)}vw, ${Math.ceil(90 * phone)}vw`;
}

// the largest span that keeps the image at or under its native width and under MAX_H
export function spanFor(w, h, { max = 'full', maxH = MAX_H } = {}) {
  for (const [s] of from(max)) if (spanPx(s) <= w && spanPx(s) * h / w <= maxH) return s;
  return 'four';
}

// a justified row: the largest span where the shared height stays under maxH and no item is enlarged
export function planRow(items, { max = 'full', maxH = MAX_H } = {}) {
  const sum = items.reduce((a, it) => a + it.w / it.h, 0);
  for (const [s] of from(max)) {
    const height = (spanPx(s) - (items.length - 1) * GUT) / sum;
    if (height <= maxH && items.every((it) => height * it.w / it.h <= it.w)) return { span: s, sum };
  }
  return { span: 'four', sum };
}

/* ---------------------------------------------------------- one image */
// alt and title come from content; zoom adds the full-size viewer link (works without JS)
export function image(rel, { alt, sz, prefix = '', priority = false, zoom = false, title = '', vt = null }) {
  const { w, h } = dims(rel);
  const style = `--nw: ${w}px${vt ? `; view-transition-name: ${vt}` : ''}`;
  // a cutout carries its dark-scheme treatment (D50): inverted linework, or the inspection field
  const dark = darkOf(rel);
  const cls = `nw${dark ? ` nw--drawing nw--${dark}` : ''}`;
  if (!zoom) return picture(rel, { alt, sizes: sz, prefix, priority, cls, style });
  const big = largest(rel, prefix);
  return html`<a class="zoom-link ${cls}" style="${style}" href="${prefix}${rel}" data-viewer data-title="${title}" data-alt="${alt}" data-w="${w}" data-h="${h}" data-webp="${big.webp}" data-avif="${big.avif}"${dark ? html` data-dark="${dark}"` : ''}><span class="vh">Open full size: ${title || alt}</span>${picture(rel, { alt, sizes: sz, prefix, priority })}</a>`;
}

// a row of images sharing one height; `stack`: one per line on phones (drawings, or more than two).
// An item with `href` becomes a card: the image and its `label` in one link.
export function row(items, { prefix, max = 'full', zoom = false, after = () => '', maxH } = {}) {
  const dimsOf = items.map((it) => ({ ...it, ...dims(it.rel) }));
  const { span, sum } = planRow(dimsOf, { max, maxH });
  const stack = items.length > 2 || sum > 2.4 || items.some((it) => it.drawing || it.href);
  const free = 1 - (items.length - 1) * GUT / spanPx(span);
  const sizes = [];
  const out = dimsOf.map((it, k) => {
    const r = it.w / it.h, frac = free * r / sum;
    const sz = sizesFor(span, frac, stack ? 1 : frac); sizes.push(sz);
    const pic = image(it.rel, { alt: it.alt, sz, prefix, priority: it.priority, zoom, title: it.title, vt: it.vt });
    return html`<div class="cell" style="--r: ${(r * 100).toFixed(2)}">${it.href ? html`<a class="card" href="${it.href}">${pic}${it.label || ''}</a>` : pic}${after(it, k)}</div>`;
  });
  return { span, sizes, html: html`<div class="row${stack ? ' row--stack' : ''}">${out}</div>` };
}

// a series in equal cells, each image contained at or under its native width, standing on one line;
// with `after`, each cell has a second row (caption, text) aligned across cells (subgrid, .cells--2)
export function cells(items, { prefix, zoom = true, after = null, cls = '', scale = false }) {
  // long strips (elevations, sections: wider than 2.4:1) stack one per line at full width, still at one scale
  const strips = items.every((it) => { const d = dims(it.rel); return d.w / d.h > 2.4; });
  const k = items.length; const n = strips ? 1 : k <= 4 ? k : k % 3 === 0 ? 3 : 4; const n8 = Math.min(n, after ? 3 : 2);
  const maxW = Math.max(...items.map((it) => dims(it.rel).w));
  const out = items.map((it, i) => {
    const f = scale ? dims(it.rel).w / maxW : 1;   // one scale across a series: each drawing as wide as its pixels say
    const pic = image(it.rel, { alt: it.alt, sz: sizesFor('full', f / n, f, f / n8), prefix, zoom, title: it.title });
    return html`<div class="cell"${scale ? html` style="--sc: ${(f * 100).toFixed(2)}%"` : ''}>${pic}${after ? after(it, i) : ''}</div>`;
  });
  return html`<div class="s-full cells${after ? ' cells--2' : ''}${scale ? ' cells--scale' : ''}${cls ? ' ' + cls : ''}" style="--n: ${n}; --n8: ${n8}; --n4: 1" data-rv>${out}</div>`;
}

/* ---------------------------------------------------------- labels re-set from a drawing (D49) */
// A label removed from the pixels returns as real text at the place it was printed: the cutout's
// sidecar gives the removed text's box as % of the cutout. Wide figures show the words in place;
// narrow ones show numbered pins on the drawing and the words in a list below (container query).
function labelsFor(rel, labels) {
  if (!labels?.length) return [];
  const side = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, rel.replace(/\.png$/u, '.json')), 'utf8'));
  return labels.map((l) => {
    const box = side.labels?.find((b) => b.id === l.at);
    if (!box) throw new Error(`${rel}: label "${l.text}" points at erase "${l.at}", which the cutout does not have`);
    return { ...box, text: l.text, align: l.align === 'end' ? 'end' : 'start' };
  });
}
// pins are 22px squares; where two would touch on the narrowest phone drawing (a 320px page less its margins),
// the figure keeps the list alone on phones rather than stacking numbers over each other
const PIN = 24, PHONE_W = 280;
function dense(labels, w, h) {
  const c = labels.map((l) => [(l.x + l.w / 2) / 100 * PHONE_W, (l.y + l.h / 2) / 100 * PHONE_W * h / w]);
  return c.some((a, i) => c.some((b, j) => j > i && Math.abs(a[0] - b[0]) < PIN && Math.abs(a[1] - b[1]) < PIN));
}
function labelled(pic, rel, labels, title) {
  const { w, h } = dims(rel);
  const pos = (l) => `--x: ${l.x}%; --y: ${l.y}%; --w: ${l.w}%; --h: ${l.h}%`;
  const cls = `lab lab--${darkOf(rel)}${dense(labels, w, h) ? ' lab--dense' : ''}`;
  // the pins' frame is the drawing alone (.lab__fig), so a pin's % position never includes the list below it
  return html`<div class="${cls}" style="--nw: ${w}px"><div class="lab__fig">${pic}<div class="lab__pins" aria-hidden="true">${labels.map((l, i) => html`<span class="lab__pin" style="${pos(l)}">${i + 1}</span>`)}</div></div><ol class="lab__list" role="list" aria-label="${title ? `Labels on the drawing: ${title}` : 'Labels on the drawing'}">${labels.map((l, i) => html`<li class="lab__item${l.align === 'end' ? ' lab__item--end' : ''}" style="${pos(l)}"><span class="lab__n" aria-hidden="true">${i + 1}</span><span class="lab__t">${l.text.split('\n').map((t, j) => html`${j ? html` <br>` : ''}${t}`)}</span></li>`)}</ol></div>`;
}
// a plain colour name for a swatch, so the colour-to-meaning key also reaches assistive technology (WCAG 1.1.1)
function colourName(hex) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const tone = l > 0.82 ? 'pale ' : l > 0.62 ? 'light ' : l < 0.36 ? 'dark ' : '';
  if (s < 0.15) return l > 0.92 ? 'white' : l < 0.1 ? 'black' : `${tone}grey`;
  const hue = ((mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 + 360) % 360;
  let name = [[15, 'red'], [40, 'orange'], [65, 'yellow'], [80, 'yellow-green'], [165, 'green'], [195, 'teal'], [255, 'blue'], [290, 'purple'], [345, 'pink'], [361, 'red']].find(([lim]) => hue < lim)[1];
  if (name === 'orange' && l < 0.45) name = 'brown';
  if ((name === 'orange' || name === 'yellow') && s < 0.45 && l > 0.6) name = 'beige';
  if ((name === 'yellow' || name === 'yellow-green') && l < 0.35) name = 'olive';
  return tone + name;
}
// a legend printed on the sheet, re-set as a list with the drawing's own colours
const legendOf = (f) => (f.legend?.length ? html`<ul class="legend s-narrow" role="list" aria-label="${f.title ? `Legend: ${f.title}` : 'Legend'}">${f.legend.map((it) => html`<li><span class="legend__sw" style="background: ${it.swatch}" aria-hidden="true"></span>${it.text}<span class="vh"> (${colourName(it.swatch)})</span></li>`)}</ul>` : '');

/* ---------------------------------------------------------- figures of a case study */
const capOf = (f) => (f.title || f.caption || f.credit) ? html`<figcaption class="cap s-narrow">${when(f.title, () => html`<span class="cap__t">${f.title}.</span> `)}${inline(f.caption || '')}${when(f.credit, () => html` <span class="credit">${f.credit}.</span>`)}</figcaption>` : '';

export function figure(f, n, ctx) {
  const p = ctx.prefix;
  const drawing = f.kind === 'drawing';
  if (f.items) {
    const items = f.items.map((it, k) => ({ rel: drawing ? cutOrFail(it.src) : it.src, alt: it.alt, drawing, title: `${f.title} (${k + 1} of ${f.items.length})` }));
    if (drawing) return html`<figure class="fig block wrap g" id="fig-${n}">${cells(items, { prefix: p, scale: true })}${legendOf(f)}${capOf(f)}</figure>`;
    const r = row(items, { prefix: p, zoom: true });
    return html`<figure class="fig block wrap g" id="fig-${n}" data-rv><div class="s-${r.span}">${r.html}</div>${capOf(f)}</figure>`;
  }
  const rel = drawing ? cutOrFail(f.src) : f.src;
  const { w, h } = dims(rel);
  // a tall drawing may allow a little more height (at most 820px) where its legibility needs a wider span
  const span = spanFor(w, h, f.maxH ? { maxH: Math.min(820, f.maxH) } : {});
  const pic = image(rel, { alt: f.alt, sz: sizesFor(span), prefix: p, zoom: true, title: f.title });
  const labels = drawing ? labelsFor(rel, f.labels) : [];
  return html`<figure class="fig block wrap g" id="fig-${n}" data-rv><div class="s-${span}">${labels.length ? labelled(pic, rel, labels, f.title) : pic}</div>${legendOf(f)}${capOf(f)}</figure>`;
}

/* ---------------------------------------------------------- heroes */
export const projectHref = (x, prefix) => `${prefix}projects/project-${x.slug}.html`;
export const vtTitle = (x) => `title-${x.slug}`;
export const vtHero = (x) => `hero-${x.slug}`;

// the render that keeps a portrait hero company (first single render after it), so the pair fills the span
export function heroPartner(x) {
  const { w, h } = dims(x.hero.src);
  if (w / h >= 1) return null;
  return x.figures.find((f) => f.kind === 'render' && f.src && f.src !== x.hero.src) || null;
}

// the hero of a project: one plate, or a justified pair with its partner (no crop, never enlarged)
export function hero(x, ctx, { priority = false, max = 'full', zoom = false, vt = true } = {}) {
  const p = ctx.prefix;
  const partner = heroPartner(x);
  if (partner) {
    const items = [
      { rel: x.hero.src, alt: x.hero.alt, title: x.title, vt: vt ? vtHero(x) : null, priority },
      { rel: partner.src, alt: partner.alt, title: partner.title || x.title }];
    const r = row(items, { prefix: p, max, zoom });
    return { span: r.span, html: r.html, partner, lcpSizes: r.sizes[0] };
  }
  const { w, h } = dims(x.hero.src);
  const span = spanFor(w, h, { max });
  const sz = sizesFor(span);
  return { span, html: image(x.hero.src, { alt: x.hero.alt, sz, prefix: p, priority, zoom, title: x.title, vt: vt ? vtHero(x) : null }), partner: null, lcpSizes: sz };
}

// render credits of what the hero shows, once each
export const creditLine = (x) => [...new Set([x.hero.credit, heroPartner(x)?.credit].filter(Boolean))].join(' | ');
// the full caption under a case-study hero: its caption, the partner's, then the credits
export const heroCaption = (x) => {
  const parts = [x.hero.caption, heroPartner(x)?.caption].filter(Boolean);
  const credit = creditLine(x);
  return parts.length || credit ? html`${inline(parts.join(' '))}${when(credit, () => html`${parts.length ? ' ' : ''}<span class="credit">${credit}</span>`)}` : '';
};
