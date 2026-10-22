// Page bodies ("Reel" on the Field grid, docs/flagship/17-reel-direction.md). Each returns { page, body, viewer } for layout().
// Every block sits on the one grid (.wrap.g) through a centred span class; images are placed by partials.mjs.
import { html, raw, attrs, when } from '../lib/html.mjs';
import { dims, shown, preloadFor, picture } from '../lib/images.mjs';
import { icon, image, row, cells, figure, hero, heroPartner, creditLine, heroCaption, sizesFor, spanFor, projectHref, vtTitle, vtHero, CASE, capSide, words, chaptersOf, scatter } from './partials.mjs';

const q = (s) => `“${s}”`;
// `of`: what a repeated label leads to, read after the visible words (WCAG 2.4.4, 2.5.3)
const more = (href, label, p, { dir = 'right', ext = false, of = '' } = {}) => dir === 'left'
  ? html`<a class="more" href="${href}">${icon('arrow-left', p)}<span>${label}</span></a>`
  : html`<a class="more" href="${href}"${attrs({ target: ext ? '_blank' : null, rel: ext ? 'noopener' : null })}><span>${label}</span>${when(of, () => html`<span class="vh">: ${of}</span>`)}${icon(ext ? 'arrow-up-right' : 'arrow-right', p)}${when(ext, () => html`<span class="vh"> (opens in a new tab)</span>`)}</a>`;
const lines = (...xs) => xs.filter(Boolean).map((x, i) => html`${i ? html`<br>` : ''}${x}`);
const spec = (rows) => html`<dl class="spec in">${rows.map((s) => html`<dt>${s.label}</dt><dd${attrs({ lang: s.lang })}>${s.value}</dd>`)}</dl>`;

// an image group that is also a link to its project: out of the tab order and the accessibility tree,
// since the title link beside it carries the same destination and the name
const linked = (href, markup) => html`<a class="card" href="${href}" tabindex="-1" aria-hidden="true">${markup}</a>`;

/* ------------------------------------------------------------------ the catalog (D97, P5): every image and film of the work */
// one entry per published picture: each project's hero, every figure (or each item of a multi-image figure), and
// the films of the motion page; the families are the kinds the content already records (drawing, render, film)
export function catalogOf(projects, films) {
  const out = [];
  for (const x of projects) {
    out.push({ project: x, src: x.hero.src, alt: x.hero.alt, title: 'Lead image', kind: 'render', hero: true });
    for (const f of x.figures) for (const it of f.items || [f]) out.push({ project: x, src: it.src, alt: it.alt, title: f.title, kind: f.kind === 'drawing' ? 'drawing' : 'render', fig: f });
  }
  for (const f of films) out.push({ project: null, film: f, title: f.title, kind: 'film' });
  return out;
}
export const FAMILIES = [{ id: 'drawing', label: 'Drawings' }, { id: 'render', label: 'Renders' }, { id: 'film', label: 'Films' }];

/* ------------------------------------------------------------------ home ("Reel", D97) */
// the film's chapters (D97): who, where, then what is on screen. The identity line is split where its own
// comma falls, so the page still carries it whole; --c is where each chapter stands fully in view
const CH = [0, 0.33, 0.64, 1];

export function home(site, d, projects, ctx) {
  const p = ctx.prefix;
  const P = site.person;
  const by = Object.fromEntries(projects.map((x) => [x.slug, x]));
  const f = d.film;
  const fd = dims(f.poster);
  const cut = P.line.indexOf(', and ');
  const chapters = [
    html`<h1 class="film__name" id="name">${P.name}</h1><p class="film__sub">${P.credential}</p>`,
    html`<p>${P.line.slice(0, cut + 1)}</p>`,
    html`<p>${P.line.slice(cut + 2)}</p>`,
    html`<p class="film__credit">${f.caption}</p>`
  ];
  const steps = CH.map((c, i) => (i ? ((CH[i - 1] + c) / 2).toFixed(3) : '0')).join(',');
  const filmSizes = '(min-width: 80rem) 1280px, 100vw';

  // the column (D97): each project as an object on the field; its render opens beside its own drawing as it
  // crosses the centre (the building as image and as drawing), a film runs with the scroll, a single render settles
  const cols = d.column.map((c, i) => {
    const x = by[c.project];
    if (!x) throw new Error(`home: no project ${c.project}`);
    if (c.mode === 'pair' && !c.key.startsWith('images/cut/')) throw new Error(`home: key drawing ${c.key} is not a cutout in images/cut/ (A8)`);
    if (c.mode === 'pair') dims(c.key);   // throws when the file is missing (A8)
    const { w, h } = dims(x.hero.src);
    const card = c.mode === 'film'
      ? html`<span class="col__card col__film" style="aspect-ratio: ${dims(c.poster).w} / ${dims(c.poster).h}">${picture(c.poster, { alt: '', sizes: '(min-width: 48rem) 46vw, 90vw', prefix: p })}<video class="film__v" data-scrub data-src="${p}${c.desktop}" data-src-small="${p}${c.mobile}" muted playsinline preload="none" aria-hidden="true" tabindex="-1"></video></span>`
      : html`<span class="col__card" style="--nw: ${w}px; --r: ${(w / h).toFixed(4)}; aspect-ratio: ${w} / ${h}">${picture(x.hero.src, { alt: '', sizes: '(min-width: 64rem) 46vw, (min-width: 48rem) 60vw, 90vw', prefix: p })}</span>`;
    const key = c.mode === 'pair' ? html`<span class="col__key" style="--kr: ${(dims(c.key).w / dims(c.key).h).toFixed(4)}">${image(c.key, { alt: '', sz: '(min-width: 48rem) 30vw, 1px', prefix: p })}</span>` : '';
    return html`<li class="col__it col__it--${c.mode}" data-fx="centre">
<a class="col__a" href="${projectHref(x, p)}" data-label="${x.title}">
<span class="col__stage">${card}${key}</span>
<span class="col__cap"><span class="col__n" aria-hidden="true">${pad(i + 1)}</span><span class="col__t">${x.title}</span><span class="col__m">${x.place} · ${x.year}</span></span>
</a>
</li>`;
  });

  // practice: each capability proven by one document, standing on one line
  const proofItems = d.proofs.map((x) => ({ rel: shown(x.image, x.kind === 'drawing'), alt: x.alt, title: x.name }));
  const proofText = (it, i) => {
    const x = d.proofs[i];
    return html`<div class="stack-s"><h3 class="title">${x.name}</h3><p class="meta">${x.text}</p>${when(x.tools, () => html`<p class="meta">${x.tools}</p>`)}<p>${more(projectHref(by[x.project], p), x.context, p)}</p></div>`;
  };
  const book = dims(d.research.cover);
  const bookSpan = spanFor(book.w, book.h, { max: 'four' });
  const cat = catalogOf(projects, ctx.films);
  const count = (k) => cat.filter((e) => e.kind === k).length;

  const body = html`
<section class="film" id="film" data-fx="track" data-steps="${steps}" aria-labelledby="name">
<div class="film__stage">
<div class="film__frame" style="--nw: ${fd.w}px; aspect-ratio: ${fd.w} / ${fd.h}">${picture(f.poster, { alt: f.alt, sizes: filmSizes, prefix: p, priority: true })}<video class="film__v" data-scrub data-src="${p}${f.desktop}" data-src-small="${p}${f.mobile}" muted playsinline preload="none" aria-hidden="true" tabindex="-1"></video></div>
<ol class="film__ch" role="list">${chapters.map((c, i) => html`<li style="--c: ${CH[i]}">${c}</li>`)}</ol>
<ol class="rail" data-rail="film" aria-hidden="true">${CH.map(() => html`<li data-step></li>`)}</ol>
</div>
</section>

<section class="col" aria-labelledby="work-h">
<h2 class="col__h" id="work-h">Projects <span class="col__count">${projects.length}</span></h2>
<ol class="col__list" role="list">${cols}</ol>
</section>

<section class="coda wrap g" aria-labelledby="practice-h">
<div class="s-text center"><h2 class="col__h" id="practice-h">Practice</h2></div>
${cells(proofItems, { prefix: p, zoom: false, cls: 'block', after: proofText })}
</section>

<section class="coda wrap g" aria-labelledby="research-h">
<div class="s-text center"><h2 class="col__h" id="research-h">Research</h2></div>
<div class="s-${bookSpan} block" data-rv>${image(d.research.cover, { alt: d.research.coverAlt, sz: sizesFor(bookSpan), prefix: p })}</div>
<div class="s-text center in">
<h3 class="title">${d.research.title}</h3>
<p class="book__ar in" lang="ar" dir="rtl">${d.research.titleAr}</p>
<p class="meta in">${d.research.meta}<br>${d.research.award}</p>
<p class="in">${more(p + 'books.html', 'Thesis, report and the Sakura programme', p)}</p>
</div>
</section>

<nav class="coda tree-root" aria-label="The index of the work">
<a class="pill pill--root" href="${p}architecture.html">Index <span class="pill__n">${cat.length}</span></a>
<ul class="tree-root__fam" role="list">${FAMILIES.map((fam) => html`<li><a class="pill" href="${p}architecture.html?family=${fam.id}">${fam.label} <span class="pill__n">${count(fam.id)}</span></a></li>`)}</ul>
</nav>`;
  return { body, viewer: false, page: { path: 'index.html', nav: 'home', corners: true, title: d.title, description: d.description, og: d.og, verification: true,
    preload: preloadFor(f.poster, filmSizes, p), bodyClass: 'page-home', jsonld: [ctx.websiteLd, ctx.personLd] } };
}

/* ------------------------------------------------------------------ index ("Reel", D98): dmcg's catalog of the work */
// Every drawing, render and film in three views the page holds at once (grid, tree, list); the script only
// chooses which one shows and which family, and keeps both in the address. Without it the grid stands alone.
const TILE = 4 / 3;                       // the tiles' frame; each image keeps its own ratio inside it (D32, A10)
const plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/gu, '');
const letterOf = (s) => plain(s).charAt(0).toUpperCase();
// the tree's places for up to fifteen leaves: a 5 x 3 field right of the families, nudged by a fixed seed
const leafAt = (i) => { const c = i % 5, r = Math.floor(i / 5); const j = Math.sin(i * 12.9898) * 43758.5453; const n = j - Math.floor(j);
  return { x: 37 + c * 13.2 + (n - 0.5) * 4, y: 17 + r * 31 + ((n * 7) % 1 - 0.5) * 8 }; };
const VIEWS = [{ id: 'grid', label: 'Grid', svg: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
  { id: 'tree', label: 'Tree', svg: '<circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 12c6 0 6-7 10-7M7 12h10M7 12c6 0 6 7 10 7"/>' },
  { id: 'list', label: 'List', svg: '<path d="M3 6h18M3 12h18M3 18h18"/>' }];

export function work(site, projects, ctx) {
  const p = ctx.prefix;
  const key = (e) => (e.project ? e.project.title : e.title);
  const cat = catalogOf(projects, ctx.films).sort((a, b) => plain(key(a)).localeCompare(plain(key(b)), 'en', { sensitivity: 'base' }));
  const firstOf = new Map();
  cat.forEach((e, i) => { const l = letterOf(key(e)); if (!firstOf.has(l)) firstOf.set(l, i); });
  const count = (k) => cat.filter((e) => e.kind === k).length;

  const tile = (e, i) => {
    const anchor = [...firstOf].find(([, k]) => k === i);
    const id = anchor ? html` id="az-${anchor[0]}"` : '';
    if (e.film) {
      const href = `${p}motion.html#${e.film.id}`;
      const r = e.film.w / e.film.h, fw = r >= TILE ? 100 : 100 * r / TILE;
      return html`<li class="tile" data-kind="film" data-l="${letterOf(key(e))}" data-fx="centre"${id}><figure class="tile__fig">
<a class="tile__frame tile__frame--film" href="${href}" data-label="${e.title}" data-ground style="--g-light: #1D1D1B; --g-dark: #050505"><span class="tile__img" style="width: ${fw.toFixed(2)}%"><img src="${p}videos/web/${e.film.slug}-poster.webp" alt="" width="${e.film.w}" height="${e.film.h}" loading="lazy" decoding="async"></span><span class="vh">${e.title}, film</span></a>
<figcaption class="tile__cap"><span class="tile__p">${e.title}</span> <span>Film</span></figcaption></figure></li>`;
    }
    const x = e.project; const rel = e.kind === 'drawing' ? shown(e.src, true) : e.src;
    const fill = e.kind === 'drawing' ? 90 : 100;
    const { w, h } = dims(rel); const r = w / h, fw = r >= TILE ? fill : fill * r / TILE;
    const g = ctx.grounds[x.slug];
    return html`<li class="tile" data-kind="${e.kind}" data-l="${letterOf(key(e))}" data-fx="centre"${id}><figure class="tile__fig">
<span class="tile__frame" data-ground style="--g-light: ${g.light}; --g-dark: ${g.dark}"><span class="tile__img" style="width: ${fw.toFixed(2)}%" data-label="${x.title}">${image(rel, { alt: e.alt, sz: '(min-width: 56.25rem) 26vw, 44vw', prefix: p, zoom: true, title: `${x.title}: ${e.title}`, project: projectHref(x, p), priority: i < 6, upto: 1200 })}</span></span>
<figcaption class="tile__cap"><a class="tile__p" href="${projectHref(x, p)}">${x.title}</a> <span>${e.title}</span></figcaption></figure></li>`;
  };

  // the tree: the root, the three families, then the projects of the chosen family (each by its first image of it)
  const leaves = (fam) => fam === 'film' ? cat.filter((e) => e.kind === 'film')
    : projects.map((x) => cat.find((e) => e.project === x && (fam === 'all' ? e.hero : e.kind === fam && !e.hero))).filter(Boolean);
  const famY = { all: 50, drawing: 30, render: 50, film: 70 };
  const branch = (fam) => {
    const from = fam === 'all' ? { x: 9, y: 50 } : { x: 27, y: famY[fam] };
    const ls = leaves(fam);
    if (ls.length > 15) throw new Error(`index: the tree has room for 15 leaves, ${fam} has ${ls.length}`);
    const paths = ls.map((e, i) => { const t = leafAt(i); const mx = (from.x + t.x) / 2; return `M ${from.x * 12} ${from.y * 6.4} C ${mx * 12} ${from.y * 6.4}, ${mx * 12} ${t.y * 6.4}, ${t.x * 12 - 40} ${t.y * 6.4}`; });
    const leaf = (e, i) => {
      const t = leafAt(i); const href = e.film ? `${p}motion.html#${e.film.id}` : projectHref(e.project, p);
      const pic = e.film ? html`<img src="${p}videos/web/${e.film.slug}-poster.webp" alt="" width="${e.film.w}" height="${e.film.h}" loading="lazy" decoding="async">`
        : picture(e.kind === 'drawing' ? shown(e.src, true) : e.src, { alt: '', sizes: '8rem', prefix: p, upto: 480 });
      return html`<a class="leaf" href="${href}" style="left: ${t.x}%; top: ${t.y}%" data-label="${key(e)}">${pic}<span class="vh">${key(e)}</span></a>`;
    };
    return html`<div class="tree__branch" data-branch="${fam}"${attrs({ hidden: fam !== 'all' })}><svg class="tree__lines" viewBox="0 0 1200 640" preserveAspectRatio="none" aria-hidden="true">${raw(paths.map((d) => `<path d="${d}"/>`).join(''))}</svg>${ls.map(leaf)}</div>`;
  };

  const rows = projects.map((x, i) => html`<tr><td>${pad(i + 1)}</td><th scope="row"><a href="${projectHref(x, p)}" data-label="${x.title}">${x.title}</a></th><td>${x.place}</td><td>${x.year}</td><td>${x.descriptor.split(' | ')[0]}</td><td>${x.office || 'ENAU, academic'}</td><td>${cat.filter((e) => e.project === x).length}</td></tr>`);

  const body = html`
<header class="ix-head"><h1 class="col__h" id="ix-h">Index <span class="col__count">${cat.length}</span></h1>
<p class="ix-lead">Every drawing, render and film of the ${projects.length} projects, A to Z.</p></header>
<div class="ix-bar" hidden>
<div class="ix-bar__group" role="group" aria-label="Show work by type"><button class="pill" type="button" data-family="all" aria-pressed="true">All</button>${FAMILIES.map((f) => html`<button class="pill" type="button" data-family="${f.id}" aria-pressed="false">${f.label}</button>`)}</div>
<div class="ix-bar__group" role="group" aria-label="View">${VIEWS.map((v) => html`<button class="pill pill--icon" type="button" data-view-btn="${v.id}" aria-pressed="${v.id === 'grid' ? 'true' : 'false'}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${raw(v.svg)}</svg><span class="vh">${v.label}</span></button>`)}</div>
</div>
<p class="vh" role="status" data-ix-status></p>
<nav class="az" aria-label="Projects A to Z" data-view-only="grid"><ul role="list">${[...firstOf.keys()].map((l) => html`<li><a href="#az-${l}">${l}</a></li>`)}</ul></nav>
<section class="ix-view ix-grid" data-view="grid" aria-labelledby="ix-h"><ol class="tiles" role="list">${cat.map(tile)}</ol></section>
<section class="ix-view ix-tree" data-view="tree" aria-label="The index as a tree" hidden>
<div class="tree">
<button class="pill pill--root tree__root" type="button" data-family="all" aria-pressed="true" style="left: 1%; top: 50%">Index <span class="pill__n">${cat.length}</span></button>
${FAMILIES.map((f) => html`<button class="pill tree__fam" type="button" data-family="${f.id}" aria-pressed="false" style="left: 17%; top: ${famY[f.id]}%">${f.label} <span class="pill__n">${count(f.id)}</span></button>`)}
<svg class="tree__lines" viewBox="0 0 1200 640" preserveAspectRatio="none" aria-hidden="true">${raw(FAMILIES.map((f) => `<path d="M 108 320 C 156 320, 156 ${famY[f.id] * 6.4}, 204 ${famY[f.id] * 6.4}"/>`).join(''))}</svg>
${['all', ...FAMILIES.map((f) => f.id)].map(branch)}
</div>
</section>
<section class="ix-view ix-list" data-view="list" aria-label="The projects as a list" hidden>
<table class="ix-table"><caption class="vh">The ${projects.length} projects, with place, year, type, office and the number of images</caption>
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

/* ------------------------------------------------------------------ case study ("rail and copy", D73) */
// the key facts as a drawing's title block: type and status on a strip, then the specification in cells
// (the strip stands outside the dl, which may only hold dt/dd groups)
const pad = (k) => String(k).padStart(2, '0');
// the chapters as numbered links, from three chapters (fewer need no table of contents)
const toc = (chs) => (chs.length < 3 ? '' : html`<nav class="toc" aria-labelledby="toc-h"><p class="label toc__h" id="toc-h">Contents</p><ol class="toc__list" role="list">${chs.map((c) => html`<li><a href="#ch-${c.id}"><span class="toc__n" aria-hidden="true">${pad(c.n)}</span>${c.title}</a></li>`)}</ol></nav>`);
const titleBlock = (x, chs) => html`<div class="tb wrap g">
<div class="tb__strip"><p class="label">${x.descriptor}</p><p class="label">${x.tag}</p></div>
<dl class="tb__cells">${x.spec.map((s) => html`<div class="tb__cell"><dt>${s.label}</dt><dd${attrs({ lang: s.lang })}>${s.value}</dd></div>`)}</dl>
${toc(chs)}
</div>`;
// a chapter (D74): a rule across the row, the number and name on the rail, its own words on the copy axis,
// then its plates; a single chapter carries no number
const chapterOf = (c, numbered, plates) => html`<section class="ch" id="ch-${c.id}" aria-labelledby="ch-${c.id}-h">
<div class="ch__head wrap g" data-rv><div class="ch__bar"></div><h2 class="ch__t s-rail" id="ch-${c.id}-h">${when(numbered, () => html`<span class="ch__n" aria-hidden="true">${pad(c.n)}</span>`)}${c.title}</h2>${when(c.text.length, () => html`<div class="prose s-copy ch__text">${c.text.map((t) => html`<p>${t.text}</p>`)}</div>`)}</div>
${plates}
</section>`;

export function project(site, x, projects, ctx0) {
  const ctx = { ...ctx0, ladder: CASE };
  const p = ctx.prefix;
  const i = projects.indexOf(x);
  const next = projects[(i + 1) % projects.length];
  const h = hero(x, ctx, { priority: true, zoom: true });
  const figs = x.figures.filter((f) => f !== h.partner);
  const cap = heroCaption(x);
  const capSideHero = capSide(h.span, [x.hero.caption, h.partner?.caption].filter(Boolean).join(' '));
  const film = x.film ? ctx.films.find((f) => f.slug === x.film) : null;
  const nh = hero(next, ctx, { max: 'narrow' });
  const filmSpan = film ? spanFor(film.w, film.h, { max: 'nine', ladder: CASE }) : null;
  const filmSide = film && capSide(filmSpan, film.text);
  const overview = x.narrative.filter((t) => !t.chapter);
  // the film closes the case study as its last chapter
  const chs = [...chaptersOf(x, figs), ...(film ? [{ title: 'Film', id: 'film', figs: [], text: [] }] : [])].map((c, k) => ({ ...c, n: k + 1 }));
  const numbered = chs.length > 1;
  const filmFig = film && html`<div class="fig block wrap g${filmSide ? ' fig--dock' : ''}" data-rv><div class="s-${filmSpan} fig__plate film"><video controls preload="none" playsinline poster="${p}videos/web/${film.slug}-poster.webp" width="${film.w}" height="${film.h}" aria-labelledby="ch-film-h" aria-describedby="film-desc"><source src="${p}videos/web/${film.slug}.mp4" type="video/mp4"><a href="${p}videos/web/${film.slug}.mp4">Download the film (MP4)</a></video></div><p class="cap s-${filmSpan}${filmSide ? ' cap--side' : ''}"><span class="cap__t">${film.label}</span> <span class="cap__x" id="film-desc">${film.text}</span></p></div>`;
  const body = html`
<article class="case">
<header class="case-head">
<div class="intro wrap g">
<p class="label case-run">${x.run}</p>
<div class="case-name"><h1 class="h1 case-title" style="view-transition-class: vt-title; view-transition-name: ${vtTitle(x)}">${words(x.title)}</h1></div>
<div class="s-copy case-lead"><p class="lead">${x.summary}</p>${when(x.honour, () => html`<p class="label honour">${x.honour}</p>`)}</div>
</div>
<div class="lead-fig wrap g fx-drift${capSideHero ? ' fig--dock' : ''}" data-fx><div class="s-${h.span} fig__plate">${h.html}</div>${when(cap, () => html`<p class="cap s-${h.span}${capSideHero ? ' cap--side' : ''}"><span class="cap__x">${cap}</span></p>`)}</div>
${titleBlock(x, chs)}
</header>
${when(x.quote, () => html`<section class="block wrap g" aria-label="In the architect's words"><blockquote class="case-quote"><p class="quote">${q(x.quote.text)}</p></blockquote></section>`)}
${when(x.role.length, () => html`<section class="block wrap g" aria-labelledby="role-h"><h2 class="label s-rail" id="role-h">Role</h2><ul class="role s-copy" role="list">${x.role.map((r) => html`<li>${r.text}</li>`)}</ul></section>`)}
${when(overview.length, () => html`<section class="block wrap g" aria-labelledby="about-h"><h2 class="label s-rail" id="about-h">Project</h2><div class="prose s-copy">${overview.map((t) => html`<p>${t.text}</p>`)}</div></section>`)}
${chs.map((c) => chapterOf(c, numbered, c.id === 'film' ? filmFig : c.figs.map((f) => figure(f, figs.indexOf(f) + 1, ctx))))}
<nav class="next chapter wrap g" aria-label="Next project">
<div class="ch__bar"></div>
<p class="label s-rail next__label">Next project <span class="next__i">${pad((i + 1) % projects.length + 1)} / ${pad(projects.length)}</span></p>
<p class="next__t"><a href="${projectHref(next, p)}" rel="next" style="view-transition-class: vt-title; view-transition-name: ${vtTitle(next)}">${next.title}</a></p>
<p class="meta s-copy next__meta">${next.descriptor}<br>${next.place} | ${next.year}</p>
<div class="s-${nh.span} next__media fx-drift" data-fx data-rv>${linked(projectHref(next, p), nh.html)}</div>
<p class="s-copy next__all">${more(p + 'architecture.html', 'All work', p, { dir: 'left' })}</p>
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
    preload: preloadFor(x.hero.src, h.lcpSizes, p), bodyClass: 'page-case' } };
}

/* ------------------------------------------------------------------ research */
// further views of the printed book (optional): one justified row, every view whole
const gallery = (b, p) => {
  if (!b.gallery?.length) return '';
  const r = row(b.gallery.map((g) => ({ rel: g.src, alt: g.alt })), { prefix: p, max: 'wide' });
  return html`<div class="s-${r.span} block" data-rv>${r.html}</div>`;
};
// priority: the first book is above the fold and is the page's largest paint, so it loads eagerly at high priority
const book = (b, p, { id, extra = '', after = '', priority = false }) => {
  const { w, h } = dims(b.cover);
  const span = spanFor(w, h, { max: 'narrow' });
  return html`<article class="chapter wrap g" aria-labelledby="${id}">
<div class="s-${span}" data-rv>${image(b.cover, { alt: b.coverAlt, sz: sizesFor(span), prefix: p, priority })}</div>
<div class="s-text center chapter__text">
<p class="label">${b.label}</p>
<h2 class="h1 in" id="${id}">${b.title}</h2>
<p class="lead in">${b.subtitle}</p>
${extra}
${spec(b.spec)}
</div>
${after}
${gallery(b, p)}
<div class="s-narrow block"><div class="prose">${b.text.map((t) => html`<p>${t.text}</p>`)}${when(b.honour, () => html`<p class="label honour">${b.honour}</p>`)}</div></div>
<p class="s-text center in actions">${more(b.read, 'Read online', p, { ext: true, of: b.title })}${when(b.case, () => more(p + b.case, 'Al-Arg case study', p))}</p>
</article>`;
};
export function research(site, d, ctx) {
  const p = ctx.prefix;
  const t = d.thesis; const r = d.report;
  const body = html`
<header class="intro wrap g"><div class="s-text center"><h1 class="h1">${words('Research')}</h1><p class="lead in">${d.intro}</p></div></header>
${book(t, p, { id: 'thesis-h', priority: true, extra: html`<p class="book__ar in" lang="ar" dir="rtl">${t.titleAr}</p>`,
    after: html`<div class="s-narrow block"><div class="prose"><p class="abstract">${t.abstract}</p></div></div>` })}
${book(r, p, { id: 'report-h' })}
<article class="chapter wrap g" aria-labelledby="sakura-h">
<div class="s-text center"><p class="label">${d.sakura.label}</p><h2 class="h1 in" id="sakura-h">${d.sakura.title}</h2><p class="lead in">${d.sakura.subtitle}</p><p class="label in honour">${d.sakura.award}</p></div>
<div class="s-narrow block"><div class="prose"><p>${d.sakura.text}</p></div></div>
</article>`;
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'Thesis', name: t.title, alternateName: t.subtitle,
    author: { '@type': 'Person', '@id': `${site.origin}${site.base}#person`, name: site.person.name },
    sourceOrganization: { '@type': 'CollegeOrUniversity', name: 'ENAU, Université de Carthage' }, datePublished: '2024-06', url: t.read }];
  return { body, viewer: false, page: { path: 'books.html', nav: 'research', navExact: true, title: d.title, description: d.description, og: d.og, jsonld, bodyClass: 'page-research' } };
}

/* ------------------------------------------------------------------ about ("Reel", D99): a told story, then the CV */
// a CV list on the text span; its two columns are subgrid tracks, so they sit on grid lines
const cvBlock = (id, title, rows) => html`<section class="s-text cv" aria-labelledby="${id}"><h2 class="label cv__h" id="${id}">${title}</h2>
<ol class="cv" role="list">${rows.map((r) => html`<li class="cv__row"><span class="cv__when">${r.when}</span><div class="cv__what">${r.what}</div></li>`)}</ol></section>`;
// Michael Gatt's register (D99): the key words in Garamond capitals, the words between them small
const tk = (s) => html`<span class="tale__k">${s}</span>`;
const tc = (s) => html`<span class="tale__c">${s}</span>`;
export function about(site, d, ctx) {
  const p = ctx.prefix; const P = site.person; const t = d.tale;
  const what = (r) => html`<b>${r.what}</b>${when(r.role, () => html`<p>${r.role}</p>`)}${when(r.text, () => html`<p>${r.text}</p>`)}`;
  const sakura = d.experience.find((r) => /Sakura/u.test(r.what));
  const practice = d.experience.filter((r) => r !== sakura);
  const [dna, thesis] = d.education;
  const prize = d.distinctions.find((r) => /Sakura/u.test(r.role));
  const fig = (ph, sz, cls = '') => html`<figure class="tale__fig ${cls}">${image(ph.src, { alt: ph.alt, sz, prefix: p })}<figcaption>${ph.caption}</figcaption></figure>`;
  const portraitSizes = '(min-width: 64rem) 26rem, (min-width: 48rem) 40vw, 70vw';
  const chs = [
    { id: 'who', label: 'Architect', body: html`<div class="tale__portrait">${image(d.portrait, { alt: d.portraitAlt, sz: portraitSizes, prefix: p, priority: true })}</div>
<div class="tale__copy"><h1 class="tale__line" id="t-who-h">${tk(P.name)} ${tc('is an')} ${tk(P.jobTitle)}</h1><p class="tale__text">${d.bio}</p></div>` },
    { id: 'diploma', label: 'Diploma', body: html`<h2 class="tale__line" id="t-diploma-h">${tk(dna.what.split(' (')[0])} ${tc('with')} ${tk(dna.text)}</h2><p class="tale__sub">${dna.role}</p>${fig(t.graduation, '(min-width: 64rem) 64rem, 92vw', 'tale__fig--wide')}` },
    { id: 'thesis', label: 'Thesis', body: html`<h2 class="tale__line" id="t-thesis-h">${tc('the thesis')} <a class="tale__k tale__link" href="${p}projects/project-al-arg.html">${scatter('Al-Arg')}</a></h2><p class="tale__sub">${thesis.what} | ${thesis.role}</p><p class="tale__sub">${thesis.text}</p>` },
    { id: 'practice', label: 'Practice', body: html`<h2 class="tale__line" id="t-practice-h">${tc('practice in')} ${tk('Tunisia, France, Morocco')}</h2>
<ol class="tale__list" role="list">${practice.map((r) => { const [org, city] = r.what.split(' | '); return html`<li>${tk(city || org)}<span class="tale__m">${city ? `${org} · ` : ''}${r.when} · ${r.role}</span></li>`; })}</ol>` },
    { id: 'japan', label: 'Japan', body: html`<h2 class="tale__line" id="t-japan-h">${tk('Sakura Science Program')} ${tc('Japan,')} ${tk(sakura.when)}</h2><p class="tale__sub">${sakura.role}</p><p class="tale__sub tale__prize">${prize.what}</p>
<div class="tale__photos">${t.japan.map((ph, i) => fig(ph, '(min-width: 48rem) 24rem, 80vw', `tale__pic tale__pic--${i + 1}`))}</div>` },
    { id: 'tools', label: 'Tools', body: html`<h2 class="tale__line" id="t-tools-h">${tc('drawn and built with')}</h2>
<ol class="tale__list" role="list">${d.skills.map((s) => html`<li>${tk(s.group)}<span class="tale__m">${s.items.join(' · ')}</span></li>`)}</ol>` }
  ];
  const body = html`
<div class="tale" id="tale" data-fx="track" data-steps="auto" data-dark>
<nav class="tale-rail" aria-label="About chapters"><ol role="list" data-rail="tale">${chs.map((c) => html`<li><a data-step href="#t-${c.id}">${c.label}</a></li>`)}</ol></nav>
${chs.map((c) => html`<section class="tale__ch tale__ch--${c.id}" id="t-${c.id}" data-fx="track" aria-labelledby="t-${c.id}-h"><div class="tale__stage">${c.body}</div></section>`)}
</div>
<header class="intro about-head wrap g" id="cv">
<div class="s-text center">
<p class="print-only print-name">${P.name} | ${P.jobTitle}</p>
<p class="print-only">${P.line} ${P.email} | ${P.linkedin.replace('https://www.', '')} | ${site.origin.replace('https://', '')}${site.base}</p>
<h2 class="h1">Curriculum vitae</h2>
</div>
<div class="s-narrow block print-only"><div class="prose"><p>${d.bio}</p></div></div>
<p class="s-text center in no-print">${more(p + 'files/hazem-radhouani-cv.pdf', 'Download CV (PDF)', p)}</p>
</header>
<div class="wrap g block">
${cvBlock('exp-h', 'Experience', d.experience.map((r) => ({ when: r.when, what: what(r) })))}
${cvBlock('edu-h', 'Education', d.education.map((r) => ({ when: r.when, what: what(r) })))}
${cvBlock('dist-h', 'Distinctions', d.distinctions.map((r) => ({ when: r.when, what: what(r) })))}
${cvBlock('skills-h', 'Skills', d.skills.map((s) => ({ when: s.group, what: s.items.join(' | ') })))}
${cvBlock('lang-h', 'Languages', d.languages.map((l) => ({ when: l.level, what: l.name })))}
</div>
<section class="chapter wrap g about-contact" id="contact" aria-labelledby="contact-h">
<div class="s-text center"><h2 class="h1" id="contact-h">Contact</h2><p class="site-footer__mail in"><a href="mailto:${P.email}">${P.email}</a></p><p><a href="${P.linkedin}" target="_blank" rel="noopener">LinkedIn<span class="vh"> (opens in a new tab)</span></a></p></div>
</section>`;
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'ProfilePage', url: `${site.origin}${site.base}about.html`, mainEntity: { '@id': `${site.origin}${site.base}#person` } }, ctx.personLd];
  return { body, viewer: false, page: { path: 'about.html', nav: 'about', navExact: true, title: d.title, description: d.description, og: d.og, ogType: 'profile', jsonld,
    preload: preloadFor(d.portrait, portraitSizes, p), bodyClass: 'page-about' } };
}

/* ------------------------------------------------------------------ films */
export function motion(site, d, projects, ctx) {
  const p = ctx.prefix;
  const by = Object.fromEntries(projects.map((x) => [x.slug, x]));
  const player = (f) => html`<video controls preload="none" playsinline poster="${p}videos/web/${f.slug}-poster.webp" width="${f.w}" height="${f.h}" aria-labelledby="${f.id}-h" aria-describedby="${f.id}-desc"><source src="${p}videos/web/${f.slug}.mp4" type="video/mp4"><a href="${p}videos/web/${f.slug}.mp4">Download the film (MP4)</a></video>`;
  const thirds = ['s-third-a', 's-third-b', 's-third-c'];
  const body = html`
<header class="intro wrap g"><div class="s-text center"><h1 class="h1">${words('Films and motion')}</h1><p class="lead in">${d.intro}</p></div></header>
<section id="films" aria-labelledby="films-h">
<div class="chapter wrap g"><div class="head s-text"><h2 class="h1" id="films-h">${d.filmsTitle}</h2><p class="meta measure">${d.filmsIntro}</p></div></div>
${d.films.map((f) => html`<article class="block wrap g" id="${f.id}" aria-labelledby="${f.id}-h" data-rv><div class="s-${spanFor(f.w, f.h, { max: 'wide' })} film">${player(f)}</div><div class="s-text center in"><h3 class="title" id="${f.id}-h">${f.title}</h3><p class="label">${f.label}</p><p class="meta in measure" id="${f.id}-desc">${f.text}</p>${when(f.project && by[f.project], () => html`<p>${more(projectHref(by[f.project], p), 'The project', p)}</p>`)}</div></article>`)}
</section>
<section id="reels" aria-labelledby="reels-h">
<div class="chapter wrap g"><div class="head s-text"><h2 class="h1" id="reels-h">${d.reelsTitle}</h2></div></div>
<ul class="block wrap g" role="list" data-rv>${d.reels.map((f, k) => html`<li class="${thirds[k % 3]} film stack-s" id="${f.id}">${player(f)}<h3 class="title" id="${f.id}-h">${f.title}</h3><p class="label">${f.label}</p><p class="meta" id="${f.id}-desc">${f.text}</p></li>`)}</ul>
</section>
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
