// Page bodies ("Reel" on the Field grid, docs/flagship/17-reel-direction.md). Each returns { page, body, viewer } for layout().
// Every block sits on the one grid (.wrap.g) through a centred span class; images are placed by partials.mjs.
import { html, raw, attrs, when } from '../lib/html.mjs';
import { dims, shown, preloadFor, picture } from '../lib/images.mjs';
import { placeLeaves, connector, TREE } from '../lib/tree-layout.mjs';
import { icon, image, row, figure, opening, heroCaption, sizesFor, spanFor, projectHref, vtTitle, CASE, capSide, words, chaptersOf, reelItem, reelSizes, aboutColumn, PORTRAIT } from './partials.mjs';

const q = (s) => `“${s}”`;
// `of`: what a repeated label leads to, read after the visible words (WCAG 2.4.4, 2.5.3)
const more = (href, label, p, { dir = 'right', ext = false, of = '' } = {}) => dir === 'left'
  ? html`<a class="more" href="${href}">${icon('arrow-left', p)}<span>${label}</span></a>`
  : html`<a class="more" href="${href}"${attrs({ target: ext ? '_blank' : null, rel: ext ? 'noopener' : null })}><span>${label}</span>${when(of, () => html`<span class="vh">: ${of}</span>`)}${icon(ext ? 'arrow-up-right' : 'arrow-right', p)}${when(ext, () => html`<span class="vh"> (opens in a new tab)</span>`)}</a>`;
const lines = (...xs) => xs.filter(Boolean).map((x, i) => html`${i ? html`<br>` : ''}${x}`);
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

  const body = html`
<div class="vh"><h1>${P.name}</h1><p>${P.line}</p><p>${P.credential}</p></div>
<section aria-labelledby="work-h"><h2 class="vh" id="work-h">Projects</h2>
<ol class="reel" role="list">${items}</ol>
</section>
<nav class="tree-root" aria-label="The index of the work">
<a class="pill pill--root" href="${p}architecture.html">Index <span class="pill__n">${cat.length}</span></a>
<svg class="tree-root__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${raw(lines)}</svg>
<ul class="tree-root__fam" role="list">${FAMILIES.map((fam) => html`<li><a class="pill" href="${p}architecture.html?family=${fam.id}">${fam.label} <span class="pill__n">${count(fam.id)}</span></a></li>`)}</ul>
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
  const relOf = (e) => (e.kind === 'drawing' ? shown(e.src, true) : e.src);
  const poster = (e, sizes = '') => html`<img src="${p}videos/web/${e.film.slug}-poster.webp" alt="" width="${e.film.w}" height="${e.film.h}" loading="lazy" decoding="async"${sizes}>`;

  // a tile: a render or a film covers its 4:3 frame (data-crop: the full picture is one click away); a drawing
  // stands whole on its raised sheet, on the drawing's own ratio, with its dark treatment (D112)
  const tile = (e, i) => {
    const anchor = [...firstOf].find(([, k]) => k === i);
    const id = anchor ? html` id="az-${anchor[0]}"` : '';
    const at = html` data-kind="${e.kind}" data-fam="${e.fam}" data-l="${letterOf(key(e))}" data-fx="centre"${id}`;
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
      return html`<span class="${cls}" data-i="${k}" style="left: ${cq(l.x)}; top: ${cq(l.y)}; width: ${cq(l.w)}"><span class="leaf__in">${inner}</span><span class="leaf__cap" aria-hidden="true">${name}</span></span>`;
    };
    return html`<div class="tree__branch" data-branch="${f.id}" style="--h: ${h}"${attrs({ hidden: i !== 0 })}><svg class="tree__lines" viewBox="0 0 ${TREE.W} ${h}" aria-hidden="true" focusable="false">${raw(leaves.map((l) => `<path d="${connector(from, l)}"/>`).join(''))}</svg>${ls.map(leaf)}</div>`;
  };
  const trunk = FAMILIES.map((f, i) => { const t = famAt(i), r = TRUNK.root, mx = (r.x + t.x) / 2; return `<path data-trunk="${f.id}" d="M${r.x} ${r.y}C${mx} ${r.y} ${mx} ${t.y} ${t.x} ${t.y}"/>`; }).join('');

  const rows = projects.map((x, i) => html`<tr><td>${pad(i + 1)}</td><th scope="row"><a class="ctl" href="${projectHref(x, p)}" data-label="${x.title}">${x.title}</a></th><td>${x.place}</td><td>${x.year}</td><td>${x.descriptor.split(' | ')[0]}</td><td>${x.office || 'ENAU, academic'}</td><td>${cat.filter((e) => e.project === x).length}</td></tr>`);

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
<span class="pill tree__root" style="left: 0; top: ${cq(TRUNK.root.y)}">Index <span class="pill__n">${cat.length}</span></span>
<svg class="tree__trunk" viewBox="0 0 ${TREE.W} ${TREE.H0}" aria-hidden="true" focusable="false">${raw(trunk)}</svg>
<div role="group" aria-label="Families">${FAMILIES.map((f, i) => html`<button class="pill tree__fam" type="button" data-family="${f.id}" aria-pressed="${i ? 'false' : 'true'}" style="left: ${cq(TRUNK.famX)}; top: ${cq(famAt(i).y)}">${f.label} <span class="pill__n">${count(f.id)}</span></button>`)}</div>
${FAMILIES.map(branch)}
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
<p class="s-text center in actions">${more(d.sakura.site, 'Programme site', p, { ext: true, of: d.sakura.title.split(' | ')[0] })}</p>
</article>`;
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'Thesis', name: t.title, alternateName: t.subtitle,
    author: { '@type': 'Person', '@id': `${site.origin}${site.base}#person`, name: site.person.name },
    sourceOrganization: { '@type': 'CollegeOrUniversity', name: 'ENAU, Université de Carthage' }, datePublished: '2024-06', url: t.read }];
  return { body, viewer: false, page: { path: 'books.html', nav: 'research', navExact: true, title: d.title, description: d.description, og: d.og, jsonld, bodyClass: 'page-research' } };
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
