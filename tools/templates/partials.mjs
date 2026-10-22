// Shared building blocks for every page ("Field", docs/flagship/08-direction.md).
// Every image is placed at build time on the largest centred span that neither enlarges it nor makes it
// taller than MAX_H at the 1280px canvas, so its edges fall on grid lines and nothing is cropped (D32).
import { html, raw, inline, when } from '../lib/html.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { picture, dims, largest, shown, darkOf, keepOf } from '../lib/images.mjs';
import { loadCutoutConfig } from '../lib/cutout-config.mjs';
// drawings excluded from cutouts on purpose (tools/cutout.json, tools/cutout.d); any other drawing must have its cutout
const ROOT_DIR = fileURLToPath(new URL('../..', import.meta.url));
const EXCLUDED = new Set(Object.keys(loadCutoutConfig(ROOT_DIR).exclude));
const cutOrFail = (src) => { const rel = shown(src, true); if (rel === src && !EXCLUDED.has(src)) throw new Error(`No cutout for drawing ${src}: run npm run cutout`); return rel; };

// a page title in masked words (D76): each word rises inside its own clip; real spaces stay between the
// words, so reading, search, copy and the content check see the plain title
export const words = (text) => html`${String(text).split(/\s+/u).filter(Boolean).map((w, i) => html`${i ? ' ' : ''}<span class="w"><span class="w__i" style="--w: ${i}">${w}</span></span>`)}`;

export const icon = (name, p) => raw(`<svg class="icon" width="16" height="16" aria-hidden="true" focusable="false"><use href="${p}images/icons.svg#${name}"></use></svg>`);

/* ---------------------------------------------------------- geometry, mirrored from css/site.css */
const CANVAS = 1280, GUT = 32, COLW = (CANVAS - 11 * GUT) / 12;
const MAX_H = 720;                                  // 80% of a 900px desktop viewport
const N12 = { full: 12, wide: 10, nine: 9, text: 8, narrow: 6, four: 4 };
const N8 = { full: 8, wide: 8, nine: 8, text: 6, narrow: 4, four: 4 };  // the same classes on 8 columns
// a ladder is the spans an image may take, largest first: centred everywhere, except case studies, where a
// plate fills the row or hangs from the copy axis at column 4 (D73: nine 4-12, text 4-11, narrow 4-9, four 4-7)
export const CENTRED = ['full', 'wide', 'text', 'narrow', 'four'];
export const CASE = ['full', 'nine', 'text', 'narrow', 'four'];
const spanPx = (s) => N12[s] * COLW + (N12[s] - 1) * GUT;
const from = (max, ladder) => ladder.filter((s) => N12[s] <= N12[max]);

// `sizes` for something occupying `frac` of a span (`phone`: its fraction of the phone canvas)
export function sizesFor(span, frac = 1, phone = 1, tab = frac) {
  const d = Math.ceil(spanPx(span) * frac);
  return `(min-width: 90rem) ${d}px, (min-width: 64rem) ${Math.ceil(90 * N12[span] / 12 * frac)}vw, (min-width: 48rem) ${Math.ceil(90 * N8[span] / 8 * tab)}vw, ${Math.ceil(90 * phone)}vw`;
}

// the largest span that keeps the image at or under its native width and under MAX_H
export function spanFor(w, h, { max = 'full', maxH = MAX_H, ladder = CENTRED } = {}) {
  for (const s of from(max, ladder)) if (spanPx(s) <= w && spanPx(s) * h / w <= maxH) return s;
  return 'four';
}

// a justified row: the largest span where the shared height stays under maxH and no item is enlarged
export function planRow(items, { max = 'full', maxH = MAX_H, ladder = CENTRED } = {}) {
  const sum = items.reduce((a, it) => a + it.w / it.h, 0);
  for (const s of from(max, ladder)) {
    const height = (spanPx(s) - (items.length - 1) * GUT) / sum;
    if (height <= maxH && items.every((it) => height * it.w / it.h <= it.w)) return { span: s, sum };
  }
  return { span: 'four', sum };
}

/* ---------------------------------------------------------- one image */
// alt and title come from content; zoom adds the full-size viewer link (works without JS)
export function image(rel, { alt, sz, prefix = '', priority = false, zoom = false, title = '', vt = null, project = '' }) {
  const { w, h } = dims(rel);
  const style = `--nw: ${w}px${vt ? `; view-transition-name: ${vt}` : ''}`;
  // a cutout carries its dark-scheme treatment (D50, D69): inverted linework, or inverted linework with its
  // solid rendered regions laid back on top in their own colours (keep: a second, decorative picture that
  // stays hidden, and so is never fetched, in the light scheme)
  const dark = darkOf(rel), keep = keepOf(rel);
  const cls = `nw${dark ? ` nw--drawing nw--${dark}` : ''}`;
  const layer = keep ? picture(keep, { alt: '', sizes: sz, prefix, cls: 'nw__keep' }) : '';
  if (!zoom) return keep ? html`<span class="${cls}" style="${style}">${picture(rel, { alt, sizes: sz, prefix, priority })}${layer}</span>` : picture(rel, { alt, sizes: sz, prefix, priority, cls, style });
  const big = largest(rel, prefix);
  return html`<a class="zoom-link ${cls}" style="${style}" href="${prefix}${rel}" data-viewer data-title="${title}" data-alt="${alt}" data-w="${w}" data-h="${h}" data-webp="${big.webp}" data-avif="${big.avif}"${project ? html` data-href="${project}"` : ''}${dark ? html` data-dark="${dark}"` : ''}${keep ? html` data-keep="${largest(keep, prefix).webp}"` : ''}><span class="vh">Open full size: ${title || alt}</span>${picture(rel, { alt, sizes: sz, prefix, priority })}${layer}</a>`;
}

// a row of images sharing one height; `stack`: one per line on phones (drawings, or more than two).
// An item with `href` becomes a card: the image and its `label` in one link.
export function row(items, { prefix, max = 'full', zoom = false, after = () => '', maxH, ladder } = {}) {
  const dimsOf = items.map((it) => ({ ...it, ...dims(it.rel) }));
  const { span, sum } = planRow(dimsOf, { max, maxH, ladder });
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
// `rv: false` when an enclosing figure arrives as one group (its key and caption arrive with the series)
export function cells(items, { prefix, zoom = true, after = null, cls = '', scale = false, rv = true }) {
  // long strips (elevations, sections: wider than 2.4:1) stack one per line at full width, still at one scale
  const strips = items.every((it) => { const d = dims(it.rel); return d.w / d.h > 2.4; });
  const k = items.length; const n = strips ? 1 : k <= 4 ? k : k % 3 === 0 ? 3 : 4; const n8 = Math.min(n, after ? 3 : 2);
  const maxW = Math.max(...items.map((it) => dims(it.rel).w));
  const out = items.map((it, i) => {
    const f = scale ? dims(it.rel).w / maxW : 1;   // one scale across a series: each drawing as wide as its pixels say
    const pic = image(it.rel, { alt: it.alt, sz: sizesFor('full', f / n, f, f / n8), prefix, zoom, title: it.title });
    return html`<div class="cell"${scale ? html` style="--sc: ${(f * 100).toFixed(2)}%"` : ''}>${pic}${after ? after(it, i) : ''}</div>`;
  });
  return html`<div class="s-full cells${after ? ' cells--2' : ''}${scale ? ' cells--scale' : ''}${cls ? ' ' + cls : ''}" style="--n: ${n}; --n8: ${n8}; --n4: 1"${rv ? html` data-rv` : ''}>${out}</div>`;
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
    return { ...box, text: l.text, align: l.align === 'end' ? 'end' : 'start', vertical: l.vertical === true };
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
  return html`<div class="${cls}" style="--nw: ${w}px"><div class="lab__fig">${pic}<div class="lab__pins" aria-hidden="true">${labels.map((l, i) => html`<span class="lab__pin" style="${pos(l)}">${i + 1}</span>`)}</div></div><ol class="lab__list" role="list" aria-label="${title ? `Labels on the drawing: ${title}` : 'Labels on the drawing'}">${labels.map((l, i) => html`<li class="lab__item${l.vertical ? ' lab__item--v' : l.align === 'end' ? ' lab__item--end' : ''}" style="${pos(l)}"><span class="lab__n" aria-hidden="true">${i + 1}</span><span class="lab__t">${l.text.split('\n').map((t, j) => html`${j ? html` <br>` : ''}${t}`)}</span></li>`)}</ol></div>`;
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
/* ---------------------------------------------------------- keys re-set from a drawing (D49, D71) */
// A key printed on the sheet (or a material schedule printed beside it) returns as real text under the
// drawing, each entry drawn in the drawing's own graphic code: a colour fill or hatch for an area, a solid,
// dashed or dotted line for a route or boundary, a point, a triangle for an access or exit marker, a measure
// line, or the circled code the drawing carries. Colour marks take the drawing's dark treatment in CSS, so the
// key always matches what the reader sees; codes are interface ink.
const svg = (box, body) => `<svg class="key__c" viewBox="${box}" aria-hidden="true" focusable="false">${body}</svg>`;
const TRI = { left: '4,8 18,1.5 18,14.5', right: '20,8 6,1.5 6,14.5', up: '12,1 19,15 5,15', down: '12,15 19,1 5,1' };
const HATCH = [-14, -10.5, -7, -3.5, 0, 3.5, 7, 10.5].map((k) => `M${k} 14L${k + 14} 0`).join('');
const MARKS = {
  fill: (c) => svg('0 0 14 14', `<rect width="14" height="14" fill="${c}"/>`),
  hatch: (c, dir, ground) => svg('0 0 14 14', `${ground ? `<rect width="14" height="14" fill="${ground}"/>` : ''}<path d="${HATCH}" stroke="${c}" stroke-width="1.2" fill="none"/>`),
  line: (c) => svg('0 0 24 16', `<path d="M1 8H23" stroke="${c}" stroke-width="2"/>`),
  dash: (c) => svg('0 0 24 16', `<path d="M0.5 8H24" stroke="${c}" stroke-width="2.5" stroke-dasharray="4.5 3"/>`),
  dot: (c) => svg('0 0 24 16', `<path d="M2 8H23" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0 4.75"/>`),
  point: (c) => svg('0 0 24 16', `<circle cx="12" cy="8" r="5" fill="${c}"/>`),
  triangle: (c, dir = 'left') => svg('0 0 24 16', `<polygon points="${TRI[dir] || TRI.left}" fill="${c}"/>`),
  measure: (c) => svg('0 0 24 16', `<path d="M6 8H19" stroke="${c}" stroke-width="1.5"/><polygon points="1,8 8,4 8,12" fill="${c}"/><circle cx="20" cy="8" r="3.25" fill="${c}"/>`),
};
const MARK_WORDS = { fill: '', hatch: ' hatching', line: ' line', dash: ' dashed line', dot: ' dotted line', point: ' dot', triangle: ' triangle', measure: ' line from a triangle to a dot' };
const markOf = (it) => it.mark || (it.code ? 'code' : 'fill');
function keyItem(it) {
  const m = markOf(it);
  if (m === 'code') return html`<li class="key__i"><span class="key__m key__m--code">${it.code}</span><span class="key__x">${it.text}</span></li>`;
  if (!MARKS[m]) throw new Error(`key mark "${m}" is not one of ${Object.keys(MARKS).join(', ')}, code`);
  if (![it.swatch, it.ground ?? '#000000'].every((c) => /^#[0-9A-F]{6}$/iu.test(c || ''))) throw new Error(`key entry "${it.text}" needs #RRGGBB colours`);
  const box = m === 'fill' || m === 'hatch';
  return html`<li class="key__i"><span class="key__m${box ? ' key__m--box' : ''}">${raw(MARKS[m](it.swatch, it.dir, it.ground))}</span><span class="key__x">${it.text}<span class="vh"> (${colourName(it.swatch)}${MARK_WORDS[m]})</span></span></li>`;
}
// short entries stand four to a row on the 8-column key (two grid columns each), long ones two to a row;
// up to three short entries stand on one centred line. Entries run down each column, as a printed
// schedule does, so a numbered key reads 1, 2, 3 ... in order: --rK is the row count at K columns and
// --cK the columns that row count fills (five entries at four columns fill three, centred as a block)
function keyOf(f) {
  if (!f.legend?.length) return '';
  const items = f.legend, n = items.length, short = items.every((it) => it.text.length <= 26);
  const layout = n <= 3 && short ? 'row' : short ? 'short' : 'long';
  const codes = items.every((it) => markOf(it) === 'code');
  const title = f.legendTitle || 'Key';
  const rows = [1, 2, 3, 4].map((c) => { const r = Math.ceil(n / c); return `--r${c}: ${r}; --c${c}: ${Math.ceil(n / r)}`; }).join('; ');
  return html`<div class="key key--${layout}${codes ? ' key--codes' : ''} s-key"><p class="key__t" aria-hidden="true">${title}</p><ul class="key__list" role="list" aria-label="${f.title ? `${title}: ${f.title}` : title}" style="${rows}">${items.map(keyItem)}</ul></div>`;
}

/* ---------------------------------------------------------- figures of a case study (D73) */
// The caption names the plate on the rail and explains it on the copy axis. A plate hanging from column 4
// keeps its caption beside it, bottom-aligned, meeting the drawing's ground line as a title does on a sheet;
// a full-width plate, or a caption too long for the 3-column rail (a 355-character caption runs 12 lines at
// 1024), takes a row below. Below 64rem the caption sits under the plate on the plate's own span.
const SIDE_MAX = 240;
export const capSide = (span, text) => span !== 'full' && !!text && text.length <= SIDE_MAX;
export const capOf = (f, span, side) => (f.title || f.caption || f.credit)
  ? html`<figcaption class="cap s-${span}${side ? ' cap--side' : ''}">${when(f.title, () => html`<span class="cap__t">${f.title}</span>`)}${when(f.caption || f.credit, () => html` <span class="cap__x">${inline(f.caption || '')}${when(f.credit, () => html` <span class="credit">${f.credit}.</span>`)}</span>`)}</figcaption>` : '';
const plate = (f, n, span, body, { rv = true, key = '' } = {}) => {
  const side = capSide(span, `${f.title || ''}${f.caption || ''}`);
  return html`<figure class="fig block wrap g${side ? ' fig--dock' : ''}" id="fig-${n}"${rv ? html` data-rv` : ''}>${body}${key}${capOf(f, span, side)}</figure>`;
};

export function figure(f, n, ctx) {
  const p = ctx.prefix; const ladder = ctx.ladder;
  const drawing = f.kind === 'drawing';
  if (f.items) {
    const items = f.items.map((it, k) => ({ rel: drawing ? cutOrFail(it.src) : it.src, alt: it.alt, drawing, title: `${f.title} (${k + 1} of ${f.items.length})` }));
    if (drawing) return plate(f, n, 'full', cells(items, { prefix: p, scale: true, rv: false }), { key: keyOf(f) });
    const r = row(items, { prefix: p, zoom: true, ladder });
    return plate(f, n, r.span, html`<div class="s-${r.span} fig__plate">${r.html}</div>`);
  }
  const rel = drawing ? cutOrFail(f.src) : f.src;
  const { w, h } = dims(rel);
  // a tall drawing may allow a little more height (at most 820px) where its legibility needs a wider span
  const span = spanFor(w, h, { ladder, ...(f.maxH ? { maxH: Math.min(820, f.maxH) } : {}) });
  const pic = image(rel, { alt: f.alt, sz: sizesFor(span), prefix: p, zoom: true, title: f.title });
  const labels = drawing ? labelsFor(rel, f.labels) : [];
  return plate(f, n, span, html`<div class="s-${span} fig__plate">${labels.length ? labelled(pic, rel, labels, f.title) : pic}</div>`, { key: keyOf(f) });
}

/* ---------------------------------------------------------- chapters of a case study (D74) */
// A chapter runs from the figure titled `from` up to the next chapter's: the figures keep their authored
// order (which decides the hero partner, the Work previews and the fig-n anchors), and a chapter can never
// be split. A paragraph joins the chapter it names; one naming none stays in the overview.
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/gu, '').toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '');
export function chaptersOf(x, figs) {
  const list = x.chapters || [];
  if (!list.length) throw new Error(`${x.slug}: no chapters (content/projects/${x.slug}.json, D74)`);
  const at = list.map((c) => {
    const hits = figs.flatMap((f, i) => (f.title === c.from ? [i] : []));
    if (hits.length !== 1) throw new Error(`${x.slug}: chapter "${c.title}" starts at "${c.from}", which names ${hits.length} figures (hero partner excluded), not 1`);
    return hits[0];
  });
  if (at[0] !== 0) throw new Error(`${x.slug}: the first chapter must start at the first figure, "${figs[0]?.title}"`);
  at.forEach((k, j) => { if (j && k <= at[j - 1]) throw new Error(`${x.slug}: chapter "${list[j].title}" starts before the chapter above it`); });
  const titles = list.map((c) => c.title);
  if (new Set(titles).size !== titles.length) throw new Error(`${x.slug}: two chapters share a title`);
  for (const t of x.narrative) if (t.chapter && !titles.includes(t.chapter)) throw new Error(`${x.slug}: a paragraph names chapter "${t.chapter}", which does not exist`);
  return list.map((c, j) => ({ title: c.title, id: slug(c.title), n: j + 1, figs: figs.slice(at[j], at[j + 1] ?? figs.length), text: x.narrative.filter((t) => t.chapter === c.title) }));
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
  const p = ctx.prefix; const ladder = ctx.ladder;
  const partner = heroPartner(x);
  if (partner) {
    const items = [
      { rel: x.hero.src, alt: x.hero.alt, title: x.title, vt: vt ? vtHero(x) : null, priority },
      { rel: partner.src, alt: partner.alt, title: partner.title || x.title }];
    const r = row(items, { prefix: p, max, zoom, ladder });
    return { span: r.span, html: r.html, partner, lcpSizes: r.sizes[0] };
  }
  const { w, h } = dims(x.hero.src);
  const span = spanFor(w, h, { max, ladder });
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

/* ---------------------------------------------------------- a word that gathers (D99, A12) */
// The word is read once, from hidden text; its letters are drawn apart by a fixed seed (mulberry32 of the word), so
// the page is the same on every visit, and CSS brings them together as the reader scrolls (--q from 1 to 0).
export const scatter = (word) => {
  let a = [...word].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0, 1779033703);
  const rnd = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return html`<span class="sc"><span class="vh">${word}</span>${[...word].map((c) => html`<span class="sc__l" aria-hidden="true" style="--x: ${((rnd() - 0.5) * 16).toFixed(2)}; --y: ${((rnd() - 0.5) * 10).toFixed(2)}; --r: ${((rnd() - 0.5) * 60).toFixed(1)}">${c}</span>`)}</span>`;
};
