// Shared building blocks for every page.
import { html, raw, attrs, inline, when } from '../lib/html.mjs';
import { picture, dims, largest } from '../lib/images.mjs';

// The arch mark (images/brand/mark.svg), inline so it inherits currentColor.
export const mark = (cls = 'mark') => raw(`<svg class="${cls}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true" focusable="false"><path d="M10 60V27a22 22 0 0 1 44 0v33" vector-effect="non-scaling-stroke"/><path d="M32 5v16" vector-effect="non-scaling-stroke"/><path d="M0 60h64" vector-effect="non-scaling-stroke"/></svg>`);

export const icon = (name, p) => raw(`<svg class="icon" width="16" height="16" aria-hidden="true" focusable="false"><use href="${p}images/icons.svg#${name}"></use></svg>`);

export const SIZES = {
  full: '(min-width: 90rem) 1312px, calc(100vw - 2.5rem)',
  wide: '(min-width: 90rem) 1094px, (min-width: 64rem) 83vw, calc(100vw - 2.5rem)',
  narrow: '(min-width: 90rem) 875px, (min-width: 64rem) 66vw, calc(100vw - 2.5rem)',
  half: '(min-width: 64rem) 46vw, calc(100vw - 2.5rem)',
  card: '(min-width: 64rem) 46vw, (min-width: 48rem) 46vw, calc(100vw - 2.5rem)',
  opener: '(min-width: 64rem) 58vw, 100vw',
  thumb: '88px'
};

// A figure in a case study: drawings sit on a plate and never exceed their pixels;
// renders are shown at their pixels too, never enlarged.
// A set: related drawings or renders side by side, uncropped, one caption (a drawing series reads as one).
function sheetSet(f, n, ctx) {
  const p = ctx.prefix;
  const cols = f.items.length;
  const cells = f.items.map((it, k) => {
    const { w, h } = dims(it.src); const big = largest(it.src, p);
    const t = `Fig. ${n}.${k + 1} | ${f.title}`;
    const img = picture(it.src, { alt: it.alt, sizes: `(min-width: 64rem) ${Math.round(92 / cols)}vw, ${cols > 2 ? '46vw' : '92vw'}`, prefix: p });
    return html`<a class="set__cell${f.kind === 'drawing' ? ' plate' : ''}" href="${p}${it.src}" data-viewer data-title="${t}" data-alt="${it.alt}" data-w="${w}" data-h="${h}" data-avif="${big.avif}" data-webp="${big.webp}" style="--native: ${w}px"><span class="vh">Open ${t} full size</span>${img}</a>`;
  });
  return html`<figure class="sheet sheet--set sheet--${f.kind}" id="fig-${n}" style="--cols: ${cols}">
<div class="sheet__head"><h3 class="sheet__title">${f.title}</h3><span class="caps muted">Fig. ${n}</span></div>
<div class="set">${cells}</div>
${when(f.caption || f.credit, () => html`<figcaption class="cap"><span class="cap__text">${inline(f.caption)}${when(f.credit, () => html` <span class="credit">${f.credit}.</span>`)}</span></figcaption>`)}
</figure>`;
}

export function sheet(f, n, ctx) {
  const p = ctx.prefix;
  if (f.items) return sheetSet(f, n, ctx);
  const { w, h } = dims(f.src);
  const size = f.size || (f.kind === 'render' ? (w >= 1300 ? 'full' : 'wide') : (w >= 1200 ? 'wide' : 'narrow'));
  const big = largest(f.src, p);
  const id = `fig-${n}`;
  const title = `Fig. ${n} | ${f.title}`;
  const img = picture(f.src, { alt: f.alt, sizes: SIZES[size], prefix: p });
  const media = f.kind === 'drawing'
    ? html`<div class="plate" style="--native: ${w}px">${img}</div>`
    : html`<div class="media media--render" style="--native: ${w}px">${img}</div>`;
  return html`<figure class="sheet sheet--${f.kind} sheet--${size}" id="${id}">
<div class="sheet__head"><h3 class="sheet__title">${f.title}</h3><span class="caps muted">Fig. ${n}</span></div>
<div class="figlink" data-href="${p}${f.src}" data-viewer data-title="${title}" data-alt="${f.alt}" data-w="${w}" data-h="${h}" data-avif="${big.avif}" data-webp="${big.webp}">${media}</div>
<figcaption class="cap"><span class="cap__text">${inline(f.caption)}${when(f.credit, () => html` <span class="credit">${f.credit}.</span>`)}</span><a class="zoom" href="${p}${f.src}" data-viewer data-title="${title}" data-alt="${f.alt}" data-w="${w}" data-h="${h}" data-avif="${big.avif}" data-webp="${big.webp}">${icon('arrows-out', p)}Full size<span class="vh">: ${title}</span></a></figcaption>
</figure>`;
}

export const projectHref = (p, prefix) => `${prefix}projects/project-${p.slug}.html`;
export const vtName = (p) => `vt-${p.slug}`;

// Image-led card for the home page selection.
export function workCard(p, ctx) {
  const pr = ctx.prefix;
  return html`<li><a class="work-card" href="${projectHref(p, pr)}">
<div class="media media--fill" style="--ratio: 4 / 5${p.cardFocus ? `; --focus: ${p.cardFocus}` : ''}">${picture(p.hero.src, { alt: '', sizes: SIZES.card, prefix: pr })}</div>
<span class="work-card__title" style="view-transition-name: ${vtName(p)}">${p.title}</span>
<span class="work-card__meta"><span>${p.descriptor}</span><span>${p.place} | ${p.year}</span></span>
${when(p.hero.credit, () => html`<span class="credit">${p.hero.credit}</span>`)}
</a></li>`;
}

// Row of the work register.
export function registerRow(p, ctx) {
  const pr = ctx.prefix;
  const hero = p.hero;
  const pv = hero ? largest(hero.src, pr) : { avif: '', webp: '' };
  const d = hero ? dims(hero.src) : { w: 0, h: 0 };
  return html`<li class="register__item" data-tags="${p.filters.join(' ')}"><a class="register__row" href="${projectHref(p, pr)}"${attrs({ 'data-src': hero ? pr + hero.src : null, 'data-avif': pv.avif, 'data-webp': pv.webp, 'data-w': d.w || null, 'data-h': d.h || null, 'data-caption': hero ? `${p.title} | ${p.place} | ${p.year}${hero.credit ? ' | ' + hero.credit : ''}` : null })}>
<span class="register__thumb">${hero ? picture(hero.src, { alt: '', sizes: SIZES.thumb, prefix: pr }) : ''}</span>
<span class="register__text"><span class="register__name" style="view-transition-name: ${vtName(p)}">${p.title}</span><span class="register__desc">${p.descriptor}</span></span>
<span class="register__place">${p.place}</span><span class="register__year">${p.year}</span>
</a></li>`;
}
