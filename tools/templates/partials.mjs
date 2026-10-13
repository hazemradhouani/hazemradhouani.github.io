// Shared building blocks for every page ("Field", docs/flagship/08-direction.md).
// Every image is placed at build time on the largest centred span that neither enlarges it nor makes it
// taller than MAX_H at the 1280px canvas, so its edges fall on grid lines and nothing is cropped (D32).
import { html, raw, inline, when } from '../lib/html.mjs';
import { picture, dims, largest, shown } from '../lib/images.mjs';

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
export function sizesFor(span, frac = 1, phone = 1) {
  const d = Math.ceil(spanPx(span) * frac);
  return `(min-width: 90rem) ${d}px, (min-width: 64rem) ${Math.ceil(90 * N12[span] / 12 * frac)}vw, (min-width: 48rem) ${Math.ceil(90 * N8[span] / 8 * frac)}vw, ${Math.ceil(90 * phone)}vw`;
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
  if (!zoom) return picture(rel, { alt, sizes: sz, prefix, priority, cls: 'nw', style });
  const big = largest(rel, prefix);
  return html`<a class="zoom-link nw" style="${style}" href="${prefix}${rel}" data-viewer data-title="${title}" data-alt="${alt}" data-w="${w}" data-h="${h}" data-webp="${big.webp}" data-avif="${big.avif}"><span class="vh">Open full size: ${title || alt}</span>${picture(rel, { alt, sizes: sz, prefix, priority })}</a>`;
}

// a row of images sharing one height; `stack`: one per line on phones (drawings, or more than two).
// An item with `href` becomes a card: the image and its `label` in one link.
export function row(items, { prefix, max = 'full', zoom = false, after = () => '', maxH } = {}) {
  const dimsOf = items.map((it) => ({ ...it, ...dims(it.rel) }));
  const { span, sum } = planRow(dimsOf, { max, maxH });
  const stack = items.length > 2 || sum > 2.4 || items.some((it) => it.drawing);
  const free = 1 - (items.length - 1) * GUT / spanPx(span);
  const sizes = [];
  const out = dimsOf.map((it, k) => {
    const r = it.w / it.h, frac = free * r / sum;
    const sz = sizesFor(span, frac, stack ? 1 : frac); sizes.push(sz);
    const pic = image(it.rel, { alt: it.alt, sz, prefix, priority: it.priority, zoom, title: it.title, vt: it.vt });
    return html`<div class="cell" style="--r: ${r.toFixed(4)}">${it.href ? html`<a class="card" href="${it.href}">${pic}${it.label || ''}</a>` : pic}${after(it, k)}</div>`;
  });
  return { span, sizes, html: html`<div class="row${stack ? ' row--stack' : ''}">${out}</div>` };
}

// a series in equal cells, each image contained at or under its native width, standing on one line;
// with `after`, each cell has a second row (caption, text) aligned across cells (subgrid, .cells--2)
export function cells(items, { prefix, zoom = true, after = null, cls = '' }) {
  const k = items.length; const n = k <= 4 ? k : k % 3 === 0 ? 3 : 4;
  const out = items.map((it, i) => html`<div class="cell">${image(it.rel, { alt: it.alt, sz: sizesFor('full', 1 / n, 1), prefix, zoom, title: it.title })}${after ? after(it, i) : ''}</div>`);
  return html`<div class="s-full cells${after ? ' cells--2' : ''}${cls ? ' ' + cls : ''}" style="--n: ${n}; --n8: ${Math.min(n, after ? 3 : 2)}; --n4: 1" data-rv>${out}</div>`;
}

/* ---------------------------------------------------------- figures of a case study */
const capOf = (f) => (f.title || f.caption || f.credit) ? html`<figcaption class="cap s-narrow">${when(f.title, () => html`<span class="cap__t">${f.title}.</span> `)}${inline(f.caption || '')}${when(f.credit, () => html` <span class="credit">${f.credit}.</span>`)}</figcaption>` : '';

export function figure(f, n, ctx) {
  const p = ctx.prefix;
  const drawing = f.kind === 'drawing';
  if (f.items) {
    const items = f.items.map((it, k) => ({ rel: shown(it.src, drawing), alt: it.alt, drawing, title: `${f.title} (${k + 1} of ${f.items.length})` }));
    if (drawing) return html`<figure class="fig block wrap g" id="fig-${n}">${cells(items, { prefix: p })}${capOf(f)}</figure>`;
    const r = row(items, { prefix: p, zoom: true });
    return html`<figure class="fig block wrap g" id="fig-${n}" data-rv><div class="s-${r.span}">${r.html}</div>${capOf(f)}</figure>`;
  }
  const rel = shown(f.src, drawing);
  const { w, h } = dims(rel);
  const span = spanFor(w, h);
  return html`<figure class="fig block wrap g" id="fig-${n}" data-rv><div class="s-${span}">${image(rel, { alt: f.alt, sz: sizesFor(span), prefix: p, zoom: true, title: f.title })}</div>${capOf(f)}</figure>`;
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
