// Page bodies ("Reel" on the Field grid, docs/flagship/17-reel-direction.md). Each returns { page, body, viewer } for layout().
// Every block sits on the one grid (.wrap.g) through a centred span class; images are placed by partials.mjs.
import { html, raw, attrs, when } from '../lib/html.mjs';
import { dims, shown, preloadFor, picture } from '../lib/images.mjs';
import { placeLeaves, connector, TREE } from '../lib/tree-layout.mjs';
import { icon, image, figure, opening, heroCaption, spanFor, projectHref, vtTitle, CASE, capSide, words, chaptersOf, reelItem, reelSizes, aboutColumn, PORTRAIT } from './partials.mjs';

const q = (s) => `“${s}”`;
// `of`: what a repeated label leads to, read after the visible words (WCAG 2.4.4, 2.5.3)
const more = (href, label, p, { dir = 'right', ext = false, of = '' } = {}) => dir === 'left'
  ? html`<a class="more" href="${href}">${icon('arrow-left', p)}<span>${label}</span></a>`
  : html`<a class="more" href="${href}"${attrs({ target: ext ? '_blank' : null, rel: ext ? 'noopener' : null })}><span>${label}</span>${when(of, () => html`<span class="vh">: ${of}</span>`)}${icon(ext ? 'arrow-up-right' : 'arrow-right', p)}${when(ext, () => html`<span class="vh"> (opens in a new tab)</span>`)}</a>`;
const spec = (rows) => html`<dl class="spec in">${rows.map((s) => html`<dt>${s.label}</dt><dd${attrs({ lang: s.lang })}>${s.value}</dd>`)}</dl>`;

/* ------------------------------------------------------------------ the catalog (D97, P5): every image and film of the work */
// one entry per published picture: each project's hero, every figure (or each item of a multi-image figure), and
// the films of the motion page. `kind` is what the content records (drawing, render, film); `fam` is the index's
// family, a partition that sums to the root (D110): the heroes are the projects, every other picture its kind
export function catalogOf(projects, films) {
  const out = [];
  for (const x of projects) {
    out.push({ project: x, src: x.hero.src, alt: x.hero.alt, title: 'Lead image', kind: 'render', fam: 'project', hero: true });
    for (const f of x.figures) for (const it of f.items || [f]) { const kind = f.kind === 'drawing' ? 'drawing' : 'render'; out.push({ project: x, src: it.src, alt: it.alt, title: f.title, kind, fam: kind, fig: f }); }
  }
  for (const f of films) out.push({ project: null, film: f, title: f.title, kind: 'film', fam: 'film' });
  return out;
}
export const FAMILIES = [{ id: 'project', label: 'Projects' }, { id: 'drawing', label: 'Drawings' }, { id: 'render', label: 'Renders' }, { id: 'film', label: 'Films' }];
// the one count of a family (D110): the tree's pills, the home's mini tree and QA all read it
export const countOf = (cat, fam) => cat.filter((e) => e.fam === fam).length;

/* ------------------------------------------------------------------ the index's filters (D125): facets from content only */
const PRACTICE = ['professional', 'academic'];
const idOf = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
// a Surface or Area in m²: "2 800 m²", "Village: 1.4 ha" (× 10 000); any space groups the thousands
export const surfaceOf = (v) => {
  const m = /^(?:[^:\d]+:\s*)?(\d[\d\s]*(?:\.\d+)?)\s*(m²|ha)$/u.exec(v.trim());
  if (!m) throw new Error(`facets: unparsable surface "${v}"`);
  return +m[1].replace(/\s/g, '') * (m[2] === 'ha' ? 10000 : 1);
};
// "2025-2026" is both years
export const yearsOf = (y) => {
  const m = /^(\d{4})(?:-(\d{4}))?$/.exec(y); const a = m && +m[1], b = m && +(m[2] || m[1]);
  if (!m || b < a) throw new Error(`facets: unparsable year "${y}"`);
  return Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
};
// one project's values, each a list of ids; a project without the data is in no band of that facet (Sentry and
// Avenir state no surface), never guessed. An unknown country or tag fails the build.
export function facetsOf(x, site) {
  if (!site.places.includes(x.country)) throw new Error(`facets: ${x.slug}: country "${x.country}" is not in site.json places`);
  const known = new Set(site.filters.map((f) => f.id).filter((id) => id !== 'all'));
  for (const t of x.filters) if (!known.has(t)) throw new Error(`facets: ${x.slug}: unknown tag "${t}"`);
  const practice = x.filters.filter((t) => PRACTICE.includes(t));
  if (practice.length !== 1) throw new Error(`facets: ${x.slug}: needs one practice, has ${practice}`);
  const s = x.spec.find((r) => r.label === 'Surface' || r.label === 'Area');
  const m2 = s ? surfaceOf(s.value) : null;
  return { place: [idOf(x.country)], type: x.filters.filter((t) => !PRACTICE.includes(t)),
    scale: m2 == null ? [] : [site.scales.find((b) => b.max == null || m2 <= b.max).id], year: yearsOf(x.year), practice };
}
// the panel's five rows, in the reader's order: where, what, how big, when, for whom
export const facetRows = (site, projects) => [
  { id: 'place', label: 'Place', opts: site.places.map((l) => ({ id: idOf(l), label: l })) },
  { id: 'type', label: 'Type', opts: site.filters.filter((f) => f.id !== 'all' && !PRACTICE.includes(f.id)) },
  { id: 'scale', label: 'Scale', opts: site.scales },
  { id: 'year', label: 'Year', opts: [...new Set(projects.flatMap((x) => yearsOf(x.year)))].sort().map((y) => ({ id: y, label: y })) },
  { id: 'practice', label: 'Practice', opts: site.filters.filter((f) => PRACTICE.includes(f.id)) }];
// a way into the Index narrowed to one value (D129): it opens on the projects that hold it, and says how many
const intoIndex = (site, projects, k, v, label, p) => html`<a class="pill" href="${p}architecture.html?family=project&amp;${k}=${v}">${label} <span class="pill__n">${projects.filter((y) => facetsOf(y, site)[k].includes(v)).length}<span class="vh"> projects</span></span></a>`;

/* ------------------------------------------------------------------ home ("Reel, corrected", D103-D105) */
// The page opens on the reel: one composition per project (reelItem), then the root of the index with its
// families. Who and what stand in the fixed header and the corner captions; the identity block is for readers
// of the page's text (screen readers, search) and stays visually hidden (D103).
export function home(site, d, projects, ctx) {
  const p = ctx.prefix;
  const P = site.person;
  const by = Object.fromEntries(projects.map((x) => [x.slug, x]));
  const items = d.reel.map((c, i) => {
    if (!by[c.project]) throw new Error(`home: no project ${c.project}`);
    return reelItem(by[c.project], c, { prefix: p, priority: i === 0 });
  });
  const first = d.reel[0].layers.find((l) => l.role === 'main');
  if (!first) throw new Error('home: the first composition needs a main render (the page\'s largest paint)');
  const cat = catalogOf(projects, ctx.films);
  const count = (k) => countOf(cat, k);
  // the root's connectors: from its middle to the middle of each family's row (equal rows, site.css)
  const n = FAMILIES.length;
  const lines = FAMILIES.map((f, i) => { const y = ((2 * i + 1) / (2 * n) * 100).toFixed(2); return `<path d="M0 50 C50 50, 50 ${y}, 100 ${y}"/>`; }).join('');
  // the projects' places, a level under Projects (D129): from the middle of its row to the middle of each place's
  const y0 = (100 / (2 * n)).toFixed(2);
  const placeLines = site.places.map((l, i) => { const y = ((2 * i + 1) / (2 * site.places.length) * 100).toFixed(2); return `<path d="M0 ${y0} C50 ${y0}, 50 ${y}, 100 ${y}"/>`; }).join('');

  const body = html`
<div class="vh"><h1>${P.name}</h1><p>${P.line}</p><p>${P.credential}</p></div>
<section aria-labelledby="work-h"><h2 class="vh" id="work-h">Projects</h2>
<ol class="reel" role="list">${items}</ol>
</section>
<nav class="tree-root" aria-label="The index of the work">
<a class="pill pill--root" href="${p}architecture.html">Index <span class="pill__n">${cat.length}<span class="vh"> works</span></span></a>
<svg class="tree-root__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${raw(lines)}</svg>
<ul class="tree-root__fam" role="list" aria-label="Kinds of work">${FAMILIES.map((fam) => html`<li${when(fam.id === 'project', () => raw(' class="tree-root__on"'))}><a class="pill" href="${p}architecture.html?family=${fam.id}">${fam.label} <span class="pill__n">${count(fam.id)}</span></a></li>`)}</ul>
<svg class="tree-root__lines tree-root__lines--place" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${raw(placeLines)}</svg>
<ul class="tree-root__fam tree-root__places" role="list" aria-label="Projects by place">${site.places.map((l) => html`<li>${intoIndex(site, projects, 'place', idOf(l), l, p)}</li>`)}</ul>
</nav>`;
  return { body, viewer: false, page: { path: 'index.html', nav: 'home', corners: true, title: d.title, description: d.description, og: d.og, verification: true,
    preload: preloadFor(first.src, reelSizes(d.reel[0].layout), p), bodyClass: 'page-home', jsonld: [ctx.websiteLd, ctx.personLd] } };
}

/* ------------------------------------------------------------------ index ("Reel, corrected", D110-D112): dmcg's catalog */
// Every drawing, render and film in three views the page holds at once (tree, grid, list); the script only
// chooses which one shows and which family, and keeps both in the address. Without it the grid stands alone.
const TILE = 4 / 3;                       // the tiles' frame: a render or film covers it, a drawing stands whole on its sheet (D112)
const TILE_MAX = { w: 534, h: 400 };      // a tile at 1920 (3 columns): a render must cover it at its own size or less
const plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/gu, '');
const letterOf = (s) => plain(s).charAt(0).toUpperCase();
// the tree's pills on the canvas of tools/lib/tree-layout.mjs (1200 units = the tree's width = 100cqw): the root at
// the left, the families stacked at the middle of the first screen; a connector starts under its pill, so it
// leaves the pill's right edge whatever the pill's width
const TRUNK = { root: { x: 30, y: TREE.H0 / 2 }, famX: 180, step: 66 };
const famAt = (i) => ({ x: TRUNK.famX + 30, y: TREE.H0 / 2 + (i - (FAMILIES.length - 1) / 2) * TRUNK.step });
const cq = (v) => `${+(v / 12).toFixed(3)}cqw`;
const VIEWS = [{ id: 'grid', label: 'Grid', svg: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
  { id: 'tree', label: 'Tree', svg: '<circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 12c6 0 6-7 10-7M7 12h10M7 12c6 0 6 7 10 7"/>' },
  { id: 'list', label: 'List', svg: '<path d="M3 6h18M3 12h18M3 18h18"/>' }];

export function work(site, projects, ctx) {
  const p = ctx.prefix;
  const key = (e) => (e.project ? e.project.title : e.title);
  const cat = catalogOf(projects, ctx.films).sort((a, b) => plain(key(a)).localeCompare(plain(key(b)), 'en', { sensitivity: 'base' }));
  const firstOf = new Map();
  cat.forEach((e, i) => { const l = letterOf(key(e)); if (!firstOf.has(l)) firstOf.set(l, i); });
  const count = (k) => countOf(cat, k);
  // the filters (D125, D126): every tile, leaf and row carries its project's values; a film carries none, so it
  // shows only while no filter is set
  const facets = new Map(projects.map((x) => [x, facetsOf(x, site)]));
  const fa = (x) => raw(x ? Object.entries(facets.get(x)).filter(([, v]) => v.length).map(([k, v]) => ` data-${k}="${v.join(' ')}"`).join('') : '');
  const relOf = (e) => (e.kind === 'drawing' ? shown(e.src, true) : e.src);
  const poster = (e, sizes = '') => html`<img src="${p}videos/web/${e.film.slug}-poster.webp" alt="" width="${e.film.w}" height="${e.film.h}" loading="lazy" decoding="async"${sizes}>`;

  // a tile: a render or a film covers its 4:3 frame (data-crop: the full picture is one click away); a drawing
  // stands whole on its raised sheet, on the drawing's own ratio, with its dark treatment (D112)
  const tile = (e, i) => {
    const anchor = [...firstOf].find(([, k]) => k === i);
    const id = anchor ? html` id="az-${anchor[0]}"` : '';
    const at = html` data-kind="${e.kind}" data-fam="${e.fam}"${fa(e.project)} data-l="${letterOf(key(e))}" data-fx="centre"${id}`;
    if (e.film) {
      return html`<li class="tile"${at}><figure class="tile__fig">
<a class="tile__frame tile__frame--film" href="${p}motion.html#${e.film.id}" data-label="${e.title}" data-cat="Film" data-ground data-crop style="--g-light: #1D1D1B; --g-dark: #050505">${poster(e)}<span class="vh">${e.title}, film</span></a>
<figcaption class="tile__cap"><span class="tile__p">${e.title}</span> <span>Film</span></figcaption></figure></li>`;
    }
    const x = e.project; const rel = relOf(e);
    const pic = image(rel, { alt: e.alt, sz: '(min-width: 56.25rem) 26vw, 44vw', prefix: p, zoom: true, title: `${x.title}: ${e.title}`, project: projectHref(x, p), priority: i < 6, upto: 1200 });
    const g = ctx.grounds[x.slug];
    // a render too small to cover the largest tile is never enlarged (D112): it stands whole, at most at its own
    // size, on its project's ground, like a drawing on its sheet
    const { w, h } = dims(rel); const r = w / h;
    const lab = html` data-label="${x.title}" data-cat="${x.descriptor.split(' | ')[0]}"`;   // the pointer's label: name and category (D109)
    const whole = (fill) => html`<span class="tile__img" style="width: ${(r >= TILE ? fill : fill * r / TILE).toFixed(2)}%"${lab}>${pic}</span>`;
    let frame;
    if (e.kind === 'drawing') frame = html`<span class="tile__frame tile__frame--sheet">${whole(86)}</span>`;
    else if (Math.max(TILE_MAX.w / w, TILE_MAX.h / h) > 1) frame = html`<span class="tile__frame" data-ground style="--g-light: ${g.light}; --g-dark: ${g.dark}">${whole(100)}</span>`;
    else frame = html`<span class="tile__frame" data-ground data-crop style="--g-light: ${g.light}; --g-dark: ${g.dark}"${lab}>${pic}</span>`;
    return html`<li class="tile"${at}><figure class="tile__fig">
${frame}
<figcaption class="tile__cap"><a class="tile__p" href="${projectHref(x, p)}">${x.title}</a> <span>${e.title}</span></figcaption></figure></li>`;
  };

  // the tree (D110): the root, the four families, then every picture of the chosen family as a leaf, A to Z by
  // project like the grid, placed by tree-layout at its own ratio. An image leaf opens the viewer (which offers its
  // project); a film leaf goes to the film. The caption tag names it under the pointer or focus.
  const branch = (f, i) => {
    const ls = cat.filter((e) => e.fam === f.id);
    const { h, leaves } = placeLeaves(ls.map((e) => (e.film ? e.film.w / e.film.h : (({ w, h: hh }) => w / hh)(dims(relOf(e))))), { seed: 7 + i });
    const from = famAt(i);
    const leaf = (e, k) => {
      const l = leaves[k];
      const sz = html` sizes="${Math.ceil(l.w * 1.2 * 1.45)}px"`;   // its width at the 90rem cap, enlarged under the pointer
      const name = e.film ? e.title : e.hero ? e.project.title : `${e.project.title} · ${e.title}`;
      const inner = e.film ? html`<a class="leaf__film" href="${p}motion.html#${e.film.id}">${poster(e, sz)}<span class="vh">${e.title}, film</span></a>`
        : image(relOf(e), { alt: e.alt, sz: `${Math.ceil(l.w * 1.2 * 1.45)}px`, prefix: p, zoom: true, title: `${e.project.title}: ${e.title}`, project: projectHref(e.project, p), upto: 480 });
      const cls = `leaf${e.kind === 'drawing' ? ' leaf--drawing' : ''}${l.x + l.w / 2 > 1000 ? ' leaf--end' : ''}`;
      return html`<span class="${cls}" data-i="${k}"${fa(e.project)} style="left: ${cq(l.x)}; top: ${cq(l.y)}; width: ${cq(l.w)}"><span class="leaf__in">${inner}</span><span class="leaf__cap" aria-hidden="true">${name}</span></span>`;
    };
    return html`<div class="tree__branch" data-branch="${f.id}" style="--h: ${h}"${attrs({ hidden: i !== 0 })}><svg class="tree__lines" viewBox="0 0 ${TREE.W} ${h}" aria-hidden="true" focusable="false">${raw(leaves.map((l) => `<path d="${connector(from, l)}"/>`).join(''))}</svg>${ls.map(leaf)}</div>`;
  };
  const trunk = FAMILIES.map((f, i) => { const t = famAt(i), r = TRUNK.root, mx = (r.x + t.x) / 2; return `<path data-trunk="${f.id}" d="M${r.x} ${r.y}C${mx} ${r.y} ${mx} ${t.y} ${t.x} ${t.y}"/>`; }).join('');

  const rows = projects.map((x, i) => html`<tr${fa(x)}><td>${pad(i + 1)}</td><th scope="row"><a class="ctl" href="${projectHref(x, p)}" data-label="${x.title}">${x.title}</a></th><td>${x.place}</td><td>${x.year}</td><td>${x.descriptor.split(' | ')[0]}</td><td>${x.office || 'ENAU, academic'}</td><td>${cat.filter((e) => e.project === x).length}</td></tr>`);

  // the address's choices hide the grid's other tiles before the first layout, so their lazy images are never fetched
  // ahead of the ones shown (LCP); site.js removes the style once it has applied the same choices
  // With one choice, the first tile it shows is preloaded too: it sits deep in the page, past what a phone reaches first
  const tiles = cat.map(tile), lead = {};
  for (const t of tiles.map(String)) {
    const src = t.match(/<source type="image\/avif" srcset="([^"]+)" sizes="([^"]+)"/);
    if (!src) continue;
    const keys = [`fam=${t.match(/data-fam="([^"]+)"/)[1]}`];
    for (const [, k, v] of t.matchAll(/data-(place|type|scale|year|practice)="([^"]+)"/g)) for (const w of v.split(' ')) keys.push(`${k}=${w}`);
    for (const k of keys) lead[k] ??= [src[1], src[2]];
  }
  const pre = `<script>(function(){var L=${JSON.stringify(lead)},q=new URLSearchParams(location.search),c=[],one;['place','type','scale','year','practice'].forEach(function(k){var v=q.get(k);if(v&&/^[a-z0-9-]+$/.test(v)){c.push('.tile:not([data-'+k+'~="'+v+'"])');one=k+'='+v;}});var f=q.get('family');if(f&&f!=='all'&&/^[a-z]+$/.test(f)){c.push('.tile:not([data-fam="'+f+'"])');one='fam='+f;}if(!c.length)return;var s=document.createElement('style');s.id='ix-pre';window.ixPre=c.join(',');s.textContent=window.ixPre+'{display:none}';document.head.appendChild(s);var p=c.length===1&&L[one];if(p){var l=document.createElement('link');l.rel='preload';l.as='image';l.type='image/avif';l.setAttribute('imagesrcset',p[0]);l.setAttribute('imagesizes',p[1]);l.fetchPriority='high';document.head.appendChild(l);}}());</script>`;
  // and the first row it shows (two tiles on a phone) loads at once, ahead of the rest
  const promote = `<script>(function(){var c=window.ixPre;if(!c)return;[].slice.call(document.querySelectorAll('.tile')).filter(function(t){return !t.matches(c);}).slice(0,2).forEach(function(t){var i=t.querySelector('img');if(i){i.loading='eager';i.fetchPriority='high';}});}());</script>`;
  const body = html`${raw(pre)}
<header class="ix-head"><h1 class="col__h" id="ix-h">Index <span class="col__count">${cat.length}</span></h1>
<p class="ix-lead">Every drawing, render and film of the ${projects.length} projects, A to Z.</p></header>
<p class="ix-result" data-ix-result hidden><span data-ix-result-t></span> <button class="pill" type="button" data-filter-clear>Clear</button></p>
<div class="ix-bar" hidden>
<div class="ix-bar__group" role="group" aria-label="Show work by type"><button class="pill" type="button" data-family="all" aria-pressed="true">All</button>${FAMILIES.map((f) => html`<button class="pill" type="button" data-family="${f.id}" aria-pressed="false">${f.label}</button>`)}</div>
<button class="pill ix-bar__filter" type="button" data-filter-open aria-expanded="false" aria-controls="ix-filter"><svg class="ix-bar__ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg><span class="ix-bar__t">Filter</span> <span class="pill__n" data-filter-n hidden></span></button>
<div class="ix-filter" id="ix-filter" hidden><div class="ix-filter__in" data-lenis-prevent>
${facetRows(site, projects).map((r) => html`<div class="ix-filter__row" role="group" aria-labelledby="fl-${r.id}"><span class="ix-filter__h" id="fl-${r.id}">${r.label}</span><div class="ix-filter__opts">${r.opts.map((o) => html`<button class="pill" type="button" data-facet="${r.id}" data-value="${o.id}" aria-pressed="false">${o.label} <span class="pill__n"></span></button>`)}</div></div>`)}
</div>
<button class="pill ix-filter__clear" type="button" data-filter-clear>Clear all</button>
</div>
<div class="ix-bar__group" role="group" aria-label="View">${VIEWS.map((v) => html`<button class="pill pill--icon" type="button" data-view-btn="${v.id}" aria-pressed="${v.id === 'grid' ? 'true' : 'false'}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${raw(v.svg)}</svg><span class="vh">${v.label}</span></button>`)}</div>
</div>
<p class="vh" role="status" data-ix-status></p>
<nav class="az" aria-label="Projects A to Z" data-view-only="grid"><ul role="list">${[...firstOf.keys()].map((l) => html`<li><a href="#az-${l}">${l}</a></li>`)}</ul></nav>
<section class="ix-view ix-grid" data-view="grid" aria-labelledby="ix-h"><ol class="tiles" role="list">${tiles}</ol></section>${raw(promote)}
<section class="ix-view ix-tree" data-view="tree" aria-label="The index as a tree" hidden>
<div class="tree">
<span class="pill tree__root" style="left: 0; top: ${cq(TRUNK.root.y)}">Index <span class="pill__n">${cat.length}</span></span>
<svg class="tree__trunk" viewBox="0 0 ${TREE.W} ${TREE.H0}" aria-hidden="true" focusable="false">${raw(trunk)}</svg>
<div role="group" aria-label="Families">${FAMILIES.map((f, i) => html`<button class="pill tree__fam" type="button" data-family="${f.id}" aria-pressed="${i ? 'false' : 'true'}" style="left: ${cq(TRUNK.famX)}; top: ${cq(famAt(i).y)}">${f.label} <span class="pill__n">${count(f.id)}</span></button>`)}</div>
${FAMILIES.map(branch)}
</div>
</section>
<section class="ix-view ix-list" data-view="list" aria-label="The projects as a list" hidden>
<table class="ix-table"><caption class="vh">The <span data-list-n>${projects.length}</span> projects, with place, year, type, office and the number of images</caption>
<thead><tr><th scope="col">No.</th><th scope="col">Project</th><th scope="col">Place</th><th scope="col">Year</th><th scope="col">Type</th><th scope="col">Office</th><th scope="col">Images</th></tr></thead>
<tbody>${rows}</tbody></table>
</section>
`;
  const items = projects.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: `${site.origin}${site.base}projects/project-${x.slug}.html`, name: x.title }));
  return { body, viewer: true, page: { path: 'architecture.html', nav: 'work', navExact: true, corners: true, title: 'Index | Hazem Radhouani, architect',
    description: `Index of the work of Hazem Radhouani, architect: ${cat.length} drawings, renders and films from ${projects.length} projects in Tunisia, France and Morocco.`,
    og: 'images/og/work.jpg', bodyClass: 'page-work',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Index', url: `${site.origin}${site.base}architecture.html`, mainEntity: { '@type': 'ItemList', itemListElement: items } }] } };
}

/* ------------------------------------------------------------------ case study ("Reel, corrected", D115, D116) */
const pad = (k) => String(k).padStart(2, '0');
// a chapter (D74): a rule across the row, the number and name on the rail, its own words on the copy axis,
// then its plates; a single chapter carries no number. Its head rises into place as it enters (D115)
const chapterOf = (c, numbered, plates) => html`<section class="ch" id="ch-${c.id}" aria-labelledby="ch-${c.id}-h">
<div class="ch__head wrap g" data-fx="enter"><div class="ch__bar"></div><h2 class="ch__t s-rail" id="ch-${c.id}-h">${when(numbered, () => html`<span class="ch__n" aria-hidden="true">${pad(c.n)}</span>`)}${c.title}</h2>${when(c.text.length, () => html`<div class="prose s-copy ch__text">${c.text.map((t) => html`<p>${t.text}</p>`)}</div>`)}</div>
${plates}
</section>`;
// D116: each fact once per page. A project's `$omit` names what its page leaves out because a field it shows already
// says it: "run", "tag", "overview" (the paragraphs outside the chapters) or "spec:<label>". The strings stay in the
// JSON, and QA's coverage leaves them out the same way
const OMITTABLE = new Set(['run', 'tag', 'overview']);
function omitsOf(x) {
  const o = new Set(x.$omit || []);
  for (const k of o) if (!OMITTABLE.has(k) && !(k.startsWith('spec:') && x.spec.some((s) => `spec:${s.label}` === k))) throw new Error(`${x.slug}: $omit "${k}" is not one of run, tag, overview, spec:<a label of its spec> (D116)`);
  return o;
}

export function project(site, x, projects, ctx0) {
  const ctx = { ...ctx0, ladder: CASE };
  const p = ctx.prefix;
  const i = projects.indexOf(x);
  const next = projects[(i + 1) % projects.length];
  const omit = omitsOf(x);
  const op = opening(x, ctx);
  const figs = x.figures.filter((f) => f !== op.partner);
  const cap = heroCaption(x);
  const film = x.film ? ctx.films.find((f) => f.slug === x.film) : null;
  const filmSpan = film ? spanFor(film.w, film.h, { max: 'nine', ladder: CASE }) : null;
  const filmSide = film && capSide(filmSpan, film.text);
  const overview = omit.has('overview') ? [] : x.narrative.filter((t) => !t.chapter);
  const facts = x.spec.filter((s) => !omit.has(`spec:${s.label}`));
  const meta = [omit.has('run') ? '' : x.run, omit.has('tag') ? '' : x.tag].filter(Boolean);
  // its place, types and years, each a way into the Index narrowed to it (D129)
  const fx = facetsOf(x, site);
  const ways = [...fx.place.map((v) => [v, 'place', x.country]), ...fx.type.map((v) => [v, 'type', site.filters.find((t) => t.id === v).label]), ...fx.year.map((v) => [v, 'year', v])];
  const comp = ctx.reel.find((c) => c.project === next.slug);
  if (!comp) throw new Error(`${x.slug}: the next project, ${next.slug}, has no composition in home.json (D115)`);
  // the film closes the case study as its last chapter
  const chs = [...chaptersOf(x, figs), ...(film ? [{ title: 'Film', id: 'film', figs: [], text: [] }] : [])].map((c, k) => ({ ...c, n: k + 1 }));
  const numbered = chs.length > 1;
  const filmFig = film && html`<div class="fig block wrap g${filmSide ? ' fig--dock' : ''}" data-fx="enter"><div class="s-${filmSpan} fig__plate film"><video controls preload="none" playsinline poster="${p}videos/web/${film.slug}-poster.webp" width="${film.w}" height="${film.h}" aria-labelledby="ch-film-h" aria-describedby="film-desc"><source src="${p}videos/web/${film.slug}.mp4" type="video/mp4"><a href="${p}videos/web/${film.slug}.mp4">Download the film (MP4)</a></video></div><p class="cap s-${filmSpan}${filmSide ? ' cap--side' : ''}"><span class="cap__t">${film.label}</span> <span class="cap__x" id="film-desc">${film.text}</span></p></div>`;
  // the opening (D115): a track whose stage stands still while the hero settles from near full-bleed into its slot
  // beside the words, and the words, the caption and the facts arrive (site.css; --s: when each starts). The chapter
  // rail stands in the chapters' own box (sticky), so it shows only while they pass; site.js marks the current one
  const body = html`
<article class="case">
<header class="op" data-fx="track" style="--ar: ${op.ar.toFixed(4)}${op.nw ? `; --nw: ${op.nw}px` : ''}">
<div class="op__stage">
<div class="op__in wrap g">
<div class="op__text">
<p class="label op__k" style="--s: .06">${x.descriptor}</p>
<h1 class="h1 op__t" style="--s: .1; view-transition-class: vt-title; view-transition-name: ${vtTitle(x)}">${words(x.title)}</h1>
<p class="lead op__lead" style="--s: .18">${x.summary}</p>
${when(x.honour, () => html`<p class="label honour op__x" style="--s: .26">${x.honour}</p>`)}
${meta.map((m) => html`<p class="label op__x" style="--s: .3">${m}</p>`)}
</div>
<div class="op__side">
<div class="op__slot">${op.html}</div>
${when(cap, () => html`<p class="cap op__cap" style="--s: .34"><span class="cap__x">${cap}</span></p>`)}
<dl class="op__facts" style="--s: .4">${facts.map((s) => html`<div class="op__fact"><dt>${s.label}</dt><dd${attrs({ lang: s.lang })}>${s.value}</dd></div>`)}</dl>
</div>
</div>
</div>
</header>
${when(x.quote, () => html`<section class="block wrap g" aria-label="In the architect's words"><blockquote class="case-quote"><p class="quote">${q(x.quote.text)}</p></blockquote></section>`)}
${when(x.role.length, () => html`<section class="block wrap g" aria-labelledby="role-h"><h2 class="label s-rail" id="role-h">Role</h2><ul class="role s-copy" role="list">${x.role.map((r) => html`<li>${r.text}</li>`)}</ul></section>`)}
${when(overview.length, () => html`<section class="block wrap g" aria-labelledby="about-h"><h2 class="label s-rail" id="about-h">Project</h2><div class="prose s-copy">${overview.map((t) => html`<p>${t.text}</p>`)}</div></section>`)}
<div class="chs" id="chs" data-fx="rail" data-steps="auto">
${when(numbered, () => html`<nav class="rail" data-rail="chs" aria-label="Chapters"><ol role="list">${chs.map((c) => html`<li><a href="#ch-${c.id}" data-step><span class="rail__t"><span class="rail__n">${pad(c.n)}</span> ${c.title}</span></a></li>`)}</ol></nav>`)}
${chs.map((c) => chapterOf(c, numbered, c.id === 'film' ? filmFig : c.figs.map((f) => figure(f, figs.indexOf(f) + 1, ctx))))}
</div>
<nav class="ways wrap g" aria-labelledby="ways-h" data-fx="enter"><div class="ch__bar"></div><p class="label s-rail ways__h" id="ways-h">In the Index</p><ul class="s-copy ways__l" role="list">${ways.map(([v, k, l]) => html`<li>${intoIndex(site, projects, k, v, l, p)}</li>`)}</ul></nav>
<nav class="next" aria-label="Next project">
<div class="next__head wrap g" data-fx="enter"><div class="ch__bar"></div><p class="label s-rail next__label">Next project <span class="next__i">${pad((i + 1) % projects.length + 1)} / ${pad(projects.length)}</span></p></div>
<ol class="reel reel--next" role="list">${reelItem(next, comp, { prefix: p })}</ol>
<p class="next__all">${more(p + 'architecture.html', 'All work', p, { dir: 'left' })}</p>
</nav>
</article>`;
  const url = `${site.origin}${site.base}projects/project-${x.slug}.html`;
  const person = { '@type': 'Person', '@id': `${site.origin}${site.base}#person`, name: site.person.name };
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'CreativeWork', name: x.title, description: x.summary, url,
    image: `${site.origin}${site.base}${x.hero.src}`, dateCreated: x.date,
    genre: x.descriptor.split(' | ')[0], locationCreated: { '@type': 'Place', name: x.place },
    // an office project names the owner as contributor, unless the case study makes no role claim (D53)
    ...(x.office ? { creator: { '@type': 'Organization', name: x.office }, ...(x.noRoleClaim ? {} : { contributor: person }) } : { creator: person }),
    isPartOf: { '@type': 'WebSite', url: `${site.origin}${site.base}`, name: site.siteName } },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.origin}${site.base}` },
    { '@type': 'ListItem', position: 2, name: 'Work', item: `${site.origin}${site.base}architecture.html` },
    { '@type': 'ListItem', position: 3, name: x.title, item: url }] }];
  return { body, viewer: true, page: { path: `projects/project-${x.slug}.html`, nav: 'work', title: `${x.title} | ${x.descriptor.split(' | ')[0]} | Hazem Radhouani`,
    description: x.summary, og: ctx.ogFor(`project-${x.slug}`), ogType: 'article', ogAlt: x.hero.alt, jsonld,
    preload: preloadFor(x.hero.src, op.lcpSizes, p), bodyClass: 'page-case' } };
}

/* ------------------------------------------------------------------ research ("Reel, corrected", P6) */
// A still composition on the home reel's stage (D104, D105, D138): the first layer is the main one, the others are
// placed here in stage widths, each at its own ratio, so nothing is cropped (a cutout book stands whole on the
// field, a photograph fills its card). It assembles and leaves by the reel's centre motion. Not a link: the
// pictures keep their alt, they are the content here.
const stillSz = (w) => `(min-width: 64rem) ${Math.ceil(0.46 * w * 1.28)}vw, (min-width: 48rem) ${Math.ceil(0.72 * w)}vw, ${Math.ceil(w)}vw`;
const still = (layers, { p, priority = false }) => {
  const ls = layers.map((l) => { const { w, h } = dims(l.src); return { ...l, h: +(l.w / (w / h)).toFixed(3) }; });
  const [m] = ls;
  const layer = (l, k) => {
    const obj = l.src.startsWith('images/cut/');
    const pic = obj ? image(l.src, { alt: l.alt, sz: stillSz(l.w), prefix: p, priority: priority && !k }) : picture(l.src, { alt: l.alt, sizes: stillSz(l.w), prefix: p, priority: priority && !k });
    const role = k ? `side${l.front ? ' reel__l--front' : ''}` : 'main';
    return html`<span class="reel__l reel__l--${role}${obj ? ' reel__l--obj' : ''}"${k ? raw(` style="--l: ${l.l}; --t: ${l.t}; --w: ${l.w}; --h: ${l.h}"`) : ''}${obj ? '' : raw(' data-crop')}>${pic}</span>`;
  };
  return html`<div class="reel__it" data-fx="centre" style="--sh: 80; --ml: ${m.l}; --mt: ${m.t}; --mw: ${m.w}; --mh: ${m.h}"><div class="reel__a"><span class="reel__stage">${ls.map(layer)}</span></div></div>`;
};
const bookHead = (b, id, extra = '') => html`<p class="label">${b.label}</p>
<h2 class="h1 in" id="${id}">${b.title}</h2>
<p class="lead in">${b.subtitle}</p>
${extra}${spec(b.spec)}`;
const bookText = (b) => html`<div class="prose">${b.text.map((t) => html`<p>${t.text}</p>`)}${when(b.honour, () => html`<p class="label honour">${b.honour}</p>`)}</div>`;
export function research(site, d, ctx) {
  const p = ctx.prefix;
  const t = d.thesis; const r = d.report; const s = d.sakura;
  // the thesis as its three printed copies: the open spread in front (the page's largest paint), the cover and the
  // renders' spread behind it; then Japan as the programme's group, the certificate and the shrine (about.json's photos)
  const books = [{ src: t.cover, alt: t.coverAlt, l: 19, t: 15, w: 62 }, { ...t.gallery[0], l: 0, t: 2, w: 40 }, { ...t.gallery[1], l: 58, t: 46, w: 42 }];
  const [group, shrine, cert] = ctx.about.photos.japan;
  const japan = [{ ...group, l: 2, t: 18, w: 60 }, { ...cert, l: 66, t: 2, w: 30 }, { ...shrine, l: 56, t: 47, w: 30, front: true }];
  const { w: rw, h: rh } = dims(r.cover);
  const body = html`
<div class="reel reel--still">${still(books, { p, priority: true })}</div>
<header class="intro wrap g"><div class="s-text center"><h1 class="h1">${words('Research')}</h1><p class="lead in">${d.intro}</p></div></header>
<article class="chapter wrap g" aria-labelledby="thesis-h">
<div class="s-text center">${bookHead(t, 'thesis-h', html`<p class="book__ar in" lang="ar" dir="rtl">${t.titleAr}</p>`)}</div>
<div class="s-narrow block"><div class="prose"><p class="abstract">${t.abstract}</p></div></div>
<div class="s-narrow block">${bookText(t)}</div>
<p class="s-text center in actions">${more(t.read, 'Read online', p, { ext: true, of: t.title })}${more(p + t.case, 'Al-Arg case study', p)}</p>
</article>
<article class="chapter wrap g" aria-labelledby="report-h">
<div class="s-wide duo">
<div class="duo__m" style="--r: ${(rw / rh).toFixed(4)}" data-rv>${image(r.cover, { alt: r.coverAlt, sz: '(min-width: 64rem) 30vw, (min-width: 48rem) 40vw, 80vw', prefix: p })}</div>
<div class="duo__t">${bookHead(r, 'report-h')}<div class="block">${bookText(r)}</div><p class="actions">${more(r.read, 'Read online', p, { ext: true, of: r.title })}</p></div>
</div>
</article>
<article class="chapter" aria-labelledby="sakura-h">
<div class="reel reel--still reel--in">${still(japan, { p })}</div>
<div class="wrap g">
<div class="s-text center"><p class="label">${s.label}</p><h2 class="h1 in" id="sakura-h">${s.title}</h2><p class="lead in">${s.subtitle}</p><p class="label in honour">${s.award}</p></div>
<div class="s-narrow block"><div class="prose"><p>${s.text}</p></div></div>
<p class="s-text center in actions">${more(s.site, 'Programme site', p, { ext: true, of: s.title.split(' | ')[0] })}</p>
</div>
</article>`;
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'Thesis', name: t.title, alternateName: t.subtitle,
    author: { '@type': 'Person', '@id': `${site.origin}${site.base}#person`, name: site.person.name },
    sourceOrganization: { '@type': 'CollegeOrUniversity', name: 'ENAU, Université de Carthage' }, datePublished: '2024-06', url: t.read }];
  return { body, viewer: false, page: { path: 'books.html', nav: 'research', navExact: true, title: d.title, description: d.description, og: d.og, jsonld,
    preload: preloadFor(t.cover, stillSz(books[0].w), p), bodyClass: 'page-research' } };
}

/* ------------------------------------------------------------------ about ("Reel, corrected", D113, D114) */
// the about column as a page: the column every other page opens as a sheet (partials.mjs), here with its portrait
// as the page's largest paint and the print lines of the CV (npm run cv prints this page)
export function about(site, d, ctx) {
  const p = ctx.prefix;
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'ProfilePage', url: `${site.origin}${site.base}about.html`, mainEntity: { '@id': `${site.origin}${site.base}#person` } }, ctx.personLd];
  return { body: aboutColumn(site, d, p, { page: true }), viewer: false, page: { path: 'about.html', nav: 'about', navExact: true, title: d.title, description: d.description, og: d.og, ogType: 'profile', jsonld,
    preload: preloadFor(d.portrait, PORTRAIT, p), bodyClass: 'page-about' } };
}
// a CV list on the text span; its two columns are subgrid tracks, so they sit on grid lines (the films' tools)
const cvBlock = (id, title, rows) => html`<section class="s-text cv" aria-labelledby="${id}"><h2 class="label cv__h" id="${id}">${title}</h2>
<ol class="cv" role="list">${rows.map((r) => html`<li class="cv__row"><span class="cv__when">${r.when}</span><div class="cv__what">${r.what}</div></li>`)}</ol></section>`;

/* ------------------------------------------------------------------ films */
export function motion(site, d, projects, ctx) {
  const p = ctx.prefix;
  const by = Object.fromEntries(projects.map((x) => [x.slug, x]));
  const player = (f) => html`<video controls preload="none" playsinline poster="${p}videos/web/${f.slug}-poster.webp" width="${f.w}" height="${f.h}" aria-labelledby="${f.id}-h" aria-describedby="${f.id}-desc"><source src="${p}videos/web/${f.slug}.mp4" type="video/mp4"><a href="${p}videos/web/${f.slug}.mp4">Download the film (MP4)</a></video>`;
  // films and reels in one grid of 16:9 cover cards (P6, D138): each card's label says which it is, so the two
  // section titles are left out ($omit); a fine pointer previews the film muted while it rests on the card (site.js)
  const card = (f) => html`<li class="fcard" id="${f.id}"><div class="fcard__v">${player(f)}</div>
<h2 class="title" id="${f.id}-h">${f.title}</h2><p class="label">${f.label}</p><p class="meta" id="${f.id}-desc">${f.text}</p>${when(f.project && by[f.project], () => html`<p>${more(projectHref(by[f.project], p), 'The project', p, { of: f.title })}</p>`)}</li>`;
  const body = html`
<header class="intro wrap g"><div class="s-text center"><h1 class="h1">${words('Films and motion')}</h1><p class="lead in">${d.intro}</p><p class="meta in">${d.filmsIntro}</p></div></header>
<div class="block wrap"><ul class="fgrid" id="films" role="list" data-rv>${[...d.films, ...d.reels].map(card)}</ul></div>
<section class="chapter wrap g" aria-labelledby="mabout-h">
<div class="s-text center"><h2 class="h1" id="mabout-h">${d.aboutTitle}</h2></div>
<div class="s-narrow block"><div class="prose">${d.about.map((t) => html`<p>${t}</p>`)}</div></div>
${cvBlock('tools-h', 'Tools', d.tools.map((t) => ({ when: t.name, what: t.text })))}
</section>`;
  return { body, viewer: false, page: { path: 'motion.html', nav: null, title: d.title, description: d.description, og: d.og, bodyClass: 'page-motion' } };
}

/* ------------------------------------------------------------------ 404 */
export function notFound(site, ctx) {
  const p = ctx.prefix;
  const body = html`<div class="intro wrap g"><div class="s-text center"><h1 class="h1">${words('This page does not exist')}</h1><p class="lead in">The address may have changed when the portfolio was rebuilt.</p><p class="actions in">${more(p + 'architecture.html', 'View work', p)}${more(p, 'Home', p)}</p></div></div>`;
  // an old address under /portfolio/ that has no page of its own (a file, an image) moves to the same path at the root (D81)
  // (leading slashes collapse to one: "/portfolio//elsewhere.example" must stay on this site, never a protocol-relative URL)
  const moved = html`<script>if(location.pathname.indexOf('/portfolio/')===0)location.replace(location.pathname.slice(10).replace(/^\\/+/,'/')+location.search+location.hash);</script>`;
  return { body, viewer: false, page: { path: '404.html', nav: null, noindex: true, title: 'Page not found | Hazem Radhouani', description: 'This page does not exist.', bodyClass: 'page-404', preload: moved } };
}
