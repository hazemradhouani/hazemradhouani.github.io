// Page bodies ("Field", docs/flagship/08-direction.md). Each returns { page, body, viewer } for layout().
// Every block sits on the one grid (.wrap.g) through a centred span class; images are placed by partials.mjs.
import { html, attrs, when } from '../lib/html.mjs';
import { dims, shown, preloadFor } from '../lib/images.mjs';
import { icon, image, row, cells, figure, hero, heroPartner, creditLine, heroCaption, sizesFor, spanFor, projectHref, vtTitle, vtHero } from './partials.mjs';

const q = (s) => `“${s}”`;
const more = (href, label, p, { dir = 'right', ext = false } = {}) => dir === 'left'
  ? html`<a class="more" href="${href}">${icon('arrow-left', p)}<span>${label}</span></a>`
  : html`<a class="more" href="${href}"${attrs({ target: ext ? '_blank' : null, rel: ext ? 'noopener' : null })}><span>${label}</span>${icon(ext ? 'arrow-up-right' : 'arrow-right', p)}${when(ext, () => html`<span class="vh"> (opens in a new tab)</span>`)}</a>`;
const lines = (...xs) => xs.filter(Boolean).map((x, i) => html`${i ? html`<br>` : ''}${x}`);
const spec = (rows) => html`<dl class="spec in">${rows.map((s) => html`<dt>${s.label}</dt><dd${attrs({ lang: s.lang })}>${s.value}</dd>`)}</dl>`;

// an image group that is also a link to its project: out of the tab order; the title link carries the name
const linked = (href, markup) => html`<a class="card" href="${href}" tabindex="-1" aria-hidden="true">${markup}</a>`;

/* ------------------------------------------------------------------ home */
export function home(site, d, projects, ctx) {
  const p = ctx.prefix;
  const P = site.person;
  const by = Object.fromEntries(projects.map((x) => [x.slug, x]));
  const fl = d.flagship; const flp = by[fl.project];
  const lead = dims(fl.hero.image);
  const leadSpan = spanFor(lead.w, lead.h);
  const leadSizes = sizesFor(leadSpan);

  // Al-Arg at three scales: whole drawings standing on one line, captions aligned below
  const scaleItems = fl.scales.map((s) => ({ rel: shown(s.image, true), alt: s.alt, title: `${s.label} | ${s.caption}` }));
  const scaleCap = (it, i) => html`<p class="cap"><span class="cap__t">${fl.scales[i].label}.</span> ${fl.scales[i].caption}</p>`;

  // selected work in justified pairs: each title under its own image
  const sel = d.selected.map((s) => by[s]);
  const pairs = [];
  for (let i = 0; i < sel.length; i += 2) pairs.push(sel.slice(i, i + 2));
  const pairRow = (pair) => row(pair.map((x) => ({ x, rel: x.hero.src, alt: '', title: x.title, vt: vtHero(x), href: projectHref(x, p),
    label: html`<span class="card__t title" style="view-transition-name: ${vtTitle(x)}">${x.title}</span>` })), {
    prefix: p, after: (it) => html`<p class="meta">${lines(it.x.descriptor, `${it.x.place} | ${it.x.year}`, it.x.hero.credit ? html`<span class="credit">${it.x.hero.credit}</span>` : '')}</p>` });

  // capabilities: each proven by one document, the documents standing on one line
  const proofItems = d.proofs.map((x) => ({ rel: shown(x.image, x.kind === 'drawing'), alt: x.alt, title: x.name }));
  const proofText = (it, i) => {
    const x = d.proofs[i];
    return html`<div class="stack-s center"><h3 class="title">${x.name}</h3><p class="meta">${x.text}</p>${when(x.tools, () => html`<p class="label">${x.tools}</p>`)}<p>${more(projectHref(by[x.project], p), x.context, p)}</p></div>`;
  };

  const book = dims(d.research.cover);
  const bookSpan = spanFor(book.w, book.h, { max: 'narrow' });

  const body = html`
<section class="intro wrap g" aria-labelledby="name">
<div class="s-text center">
<h1 class="intro__name" id="name">${P.name}</h1>
<p class="intro__line">${P.line}</p>
<p class="intro__cred label">${P.credential}</p>
<p class="actions">${more(p + 'architecture.html', 'View work', p)}${more(p + 'books.html', 'Research', p)}</p>
</div>
</section>

<div class="lead-fig wrap g"><div class="s-${leadSpan}">${linked(projectHref(flp, p), image(fl.hero.image, { alt: fl.hero.alt, sz: leadSizes, prefix: p, priority: true, vt: vtHero(flp) }))}</div></div>

<section class="block wrap g" aria-labelledby="conviction">
<div class="s-text center">
<h2 class="quote" id="conviction">${q(d.manifesto.quote)}</h2>
<p class="lead in measure">${d.manifesto.text}</p>
<p class="in">${more(p + d.manifesto.href, d.manifesto.attribution, p)}</p>
</div>
</section>

<section class="chapter wrap g" aria-labelledby="flagship-h">
<div class="s-text center"><h2 class="h1" id="flagship-h" style="view-transition-name: ${vtTitle(flp)}">${fl.title}</h2><p class="lead in">${fl.line}</p></div>
<div class="s-narrow in"><div class="prose"><p>${fl.text}</p></div></div>
<p class="s-text center in">${more(projectHref(flp, p), 'Read the case study', p)}</p>
${cells(scaleItems, { prefix: p, after: scaleCap, cls: 'block' })}
</section>

<section class="chapter wrap g" aria-labelledby="selected-h">
<div class="head s-text"><h2 class="h1" id="selected-h">Selected work</h2>${more(p + 'architecture.html', `All ${projects.length} projects`, p)}</div>
${pairs.map((pair) => { const r = pairRow(pair); return html`<div class="s-${r.span} block" data-rv>${r.html}</div>`; })}
</section>

<section class="chapter wrap g" aria-labelledby="proofs-h">
<div class="head s-text"><h2 class="h1" id="proofs-h">Capabilities</h2></div>
${cells(proofItems, { prefix: p, zoom: false, cls: 'block', after: proofText })}
</section>

<section class="chapter wrap g" aria-labelledby="research-h">
<div class="head s-text"><h2 class="h1" id="research-h">Research</h2></div>
<div class="s-${bookSpan} block" data-rv>${image(d.research.cover, { alt: d.research.coverAlt, sz: sizesFor(bookSpan), prefix: p })}</div>
<div class="s-text center in">
<h3 class="title">${d.research.title}</h3>
<p class="book__ar in" lang="ar" dir="rtl">${d.research.titleAr}</p>
<p class="meta in">${d.research.meta}<br>${d.research.award}</p>
<p class="in">${more(p + 'books.html', 'Thesis, report and the Sakura programme', p)}</p>
</div>
</section>`;
  return { body, viewer: false, page: { path: 'index.html', nav: 'home', title: d.title, description: d.description, og: d.og, verification: true,
    preload: preloadFor(fl.hero.image, leadSizes, p), bodyClass: 'page-home', jsonld: [ctx.websiteLd, ctx.personLd] } };
}

/* ------------------------------------------------------------------ work: an index, then one chapter per project */
// the preview row of a chapter: drawings first (the documentation), never the hero's partner, kept legible
function previewItems(x) {
  const partner = heroPartner(x);
  const all = x.figures.filter((f) => f !== partner)
    .flatMap((f) => (f.items ? f.items.map((it) => ({ src: it.src, alt: it.alt, kind: f.kind })) : [{ src: f.src, alt: f.alt, kind: f.kind }]))
    .filter((it) => it.src !== x.hero.src);
  const pick = [...all.filter((it) => it.kind === 'drawing'), ...all.filter((it) => it.kind !== 'drawing')].slice(0, 3)
    .map((it) => ({ rel: shown(it.src, it.kind === 'drawing'), alt: it.alt, drawing: it.kind === 'drawing' }));
  const ratio = (list) => list.reduce((a, it) => { const { w, h } = dims(it.rel); return a + w / h; }, 0);
  while (pick.length > 2 && ratio(pick) > 4.5) pick.pop();
  return pick;
}

function chapter(x, ctx, first) {
  const p = ctx.prefix; const href = projectHref(x, p);
  const h = hero(x, ctx, { priority: first });
  const items = previewItems(x);
  const r = items.length ? row(items, { prefix: p }) : null;
  const credit = creditLine(x);
  return { h, html: html`<article class="chapter wrap g" id="${x.slug}" aria-labelledby="t-${x.slug}">
<div class="s-${h.span}"${attrs({ 'data-rv': !first })}>${linked(href, h.html)}</div>
<div class="s-text center chapter__text">
<h2 class="title chapter__title" id="t-${x.slug}"><a href="${href}" style="view-transition-name: ${vtTitle(x)}">${x.title}</a></h2>
<p class="meta">${lines(x.descriptor, `${x.place} | ${x.year}`, x.office, credit ? html`<span class="credit">${credit}</span>` : '')}</p>
</div>
${when(r, () => html`<div class="s-${r.span} block" data-rv>${linked(href, r.html)}</div>`)}
<p class="s-text center chapter__more in">${more(href, 'View project', p)}</p>
</article>` };
}

export function work(site, projects, ctx) {
  const p = ctx.prefix;
  const groups = site.groups.map((g) => ({ ...g, items: projects.filter((x) => x.group === g.id) })).filter((g) => g.items.length);
  const chapters = projects.map((x, i) => chapter(x, ctx, i === 0));
  const body = html`
<header class="intro wrap g">
<div class="s-text center"><h1 class="h1">Work</h1><p class="lead in">Places already alive. ${projects.length} projects in Paris, Morocco and Tunisia, from 2022 to 2026.</p></div>
<nav class="s-wide block index center" aria-label="Projects by place">
${groups.map((g) => html`<div><h2 id="g-${g.id}">${g.label}</h2><ul role="list" aria-labelledby="g-${g.id}">${g.items.map((x) => html`<li><a href="#${x.slug}">${x.title}</a></li>`)}</ul></div>`)}
</nav>
</header>
${chapters.map((c) => c.html)}`;
  const items = projects.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: `${site.origin}${site.base}projects/project-${x.slug}.html`, name: x.title }));
  return { body, viewer: false, page: { path: 'architecture.html', nav: 'work', navExact: true, title: 'Work | Hazem Radhouani, architect',
    description: `${projects.length} architecture projects by Hazem Radhouani: rehabilitation in Paris with Studio BELEM, rail infrastructure in Morocco, and heritage research in Tunisia.`,
    og: 'images/og/work.jpg', bodyClass: 'page-work', preload: preloadFor(projects[0].hero.src, chapters[0].h.lcpSizes, p),
    jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Work', url: `${site.origin}${site.base}architecture.html`, mainEntity: { '@type': 'ItemList', itemListElement: items } }] } };
}

/* ------------------------------------------------------------------ case study */
export function project(site, x, projects, ctx) {
  const p = ctx.prefix;
  const i = projects.indexOf(x);
  const next = projects[(i + 1) % projects.length];
  const h = hero(x, ctx, { priority: true, zoom: true });
  const figs = x.figures.filter((f) => f !== h.partner);
  const cap = heroCaption(x);
  const film = x.film ? ctx.films.find((f) => f.slug === x.film) : null;
  const nh = hero(next, ctx, { max: 'narrow' });
  const filmSpan = film ? spanFor(film.w, film.h, { max: 'wide' }) : null;
  const body = html`
<article class="case">
<header class="case-head">
<div class="lead-fig wrap g"><div class="s-${h.span}">${h.html}</div>${when(cap, () => html`<p class="cap s-narrow">${cap}</p>`)}</div>
<div class="case-head__text wrap g"><div class="s-text center">
<p class="label">${x.run}</p>
<h1 class="h1 in" style="view-transition-name: ${vtTitle(x)}">${x.title}</h1>
<p class="lead in">${x.descriptor}</p>
${spec(x.spec)}
<p class="meta case-head__tag">${x.tag}</p>
</div></div>
</header>
${when(x.quote, () => html`<section class="block wrap g" aria-label="In the architect's words"><blockquote class="s-text center"><p class="quote">${q(x.quote.text)}</p></blockquote></section>`)}
${when(x.role.length, () => html`<section class="block wrap g" aria-labelledby="role-h"><div class="s-narrow"><div class="prose"><h2 class="label" id="role-h">Role</h2><ul class="role" role="list">${x.role.map((r) => html`<li>${r.text}</li>`)}</ul></div></div></section>`)}
${when(x.narrative.length || x.honour, () => html`<section class="block wrap g" aria-labelledby="about-h"><div class="s-narrow"><div class="prose"><h2 class="label" id="about-h">Project</h2>${x.narrative.map((t) => html`<p>${t.text}</p>`)}${when(x.honour, () => html`<p class="label honour">${x.honour}</p>`)}</div></div></section>`)}
${when(figs.length, () => html`<section aria-labelledby="sheets-h"><h2 class="vh" id="sheets-h">Drawings and images</h2>${figs.map((f, k) => figure(f, k + 1, ctx))}</section>`)}
${when(film, () => html`<section class="block wrap g" aria-labelledby="film-h" data-rv><div class="s-${filmSpan} film"><video controls preload="none" playsinline poster="${p}videos/web/${film.slug}-poster.webp" width="${film.w}" height="${film.h}" aria-describedby="film-desc"><source src="${p}videos/web/${film.slug}.mp4" type="video/mp4"><a href="${p}videos/web/${film.slug}.mp4">Download the film (MP4)</a></video></div><div class="s-text center in"><h2 class="title" id="film-h">Film</h2><p class="label">${film.label}</p><p class="meta in measure" id="film-desc">${film.text}</p></div></section>`)}
<nav class="chapter wrap g" aria-label="Next project">
<div class="s-text center"><p class="label">Next project</p><p class="title in"><a href="${projectHref(next, p)}" rel="next" style="view-transition-name: ${vtTitle(next)}">${next.title}</a></p><p class="meta">${next.descriptor}<br>${next.place} | ${next.year}</p></div>
<div class="s-${nh.span} next__media" data-rv>${linked(projectHref(next, p), nh.html)}</div>
<p class="s-text center in">${more(p + 'architecture.html', 'All work', p, { dir: 'left' })}</p>
</nav>
</article>`;
  const url = `${site.origin}${site.base}projects/project-${x.slug}.html`;
  const person = { '@type': 'Person', '@id': `${site.origin}${site.base}#person`, name: site.person.name };
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'CreativeWork', name: x.title, description: x.summary, url,
    image: `${site.origin}${site.base}${x.hero.src}`, dateCreated: x.date,
    genre: x.descriptor.split(' | ')[0], locationCreated: { '@type': 'Place', name: x.place },
    ...(x.office ? { creator: { '@type': 'Organization', name: x.office }, contributor: person } : { creator: person }),
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
const book = (b, p, { id, extra = '', after = '' }) => {
  const { w, h } = dims(b.cover);
  const span = spanFor(w, h, { max: 'narrow' });
  return html`<article class="chapter wrap g" aria-labelledby="${id}">
<div class="s-${span}" data-rv>${image(b.cover, { alt: b.coverAlt, sz: sizesFor(span), prefix: p })}</div>
<div class="s-text center chapter__text">
<p class="label">${b.label}</p>
<h2 class="h1 in" id="${id}">${b.title}</h2>
<p class="lead in">${b.subtitle}</p>
${extra}
${spec(b.spec)}
</div>
${after}
<div class="s-narrow block"><div class="prose">${b.text.map((t) => html`<p>${t.text}</p>`)}${when(b.honour, () => html`<p class="label honour">${b.honour}</p>`)}</div></div>
<p class="s-text center in actions">${more(b.read, 'Read online', p, { ext: true })}${when(b.case, () => more(p + b.case, 'Al-Arg case study', p))}</p>
</article>`;
};
export function research(site, d, ctx) {
  const p = ctx.prefix;
  const t = d.thesis; const r = d.report;
  const body = html`
<header class="intro wrap g"><div class="s-text center"><h1 class="h1">Research</h1><p class="lead in">${d.intro}</p></div></header>
${book(t, p, { id: 'thesis-h', extra: html`<p class="book__ar in" lang="ar" dir="rtl">${t.titleAr}</p>`,
    after: html`<blockquote class="s-narrow block"><div class="prose"><p class="abstract">${t.abstract}</p></div></blockquote>` })}
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

/* ------------------------------------------------------------------ about */
// a CV list on the text span; its two columns are subgrid tracks, so they sit on grid lines
const cvBlock = (id, title, rows) => html`<section class="s-text cv" aria-labelledby="${id}"><h2 class="label cv__h" id="${id}">${title}</h2>
<ol class="cv" role="list">${rows.map((r) => html`<li class="cv__row"><span class="cv__when">${r.when}</span><div class="cv__what">${r.what}</div></li>`)}</ol></section>`;
export function about(site, d, ctx) {
  const p = ctx.prefix; const P = site.person;
  const field = (id, label, type = 'text', extra = {}) => html`<div class="field"><label for="cf-${id}">${label} <span>(required)</span></label>${type === 'textarea'
    ? html`<textarea id="cf-${id}" name="${id}" required aria-describedby="cf-${id}-err"></textarea>`
    : html`<input id="cf-${id}" name="${id}" type="${type}" required aria-describedby="cf-${id}-err"${attrs(extra)}>`}<p class="field__error" id="cf-${id}-err" hidden></p></div>`;
  const pd = dims(d.portrait);
  const pspan = spanFor(pd.w, pd.h, { max: 'four' });
  const what = (r) => html`<b>${r.what}</b>${when(r.role, () => html`<p>${r.role}</p>`)}${when(r.text, () => html`<p>${r.text}</p>`)}`;
  const body = html`
<header class="intro about-head wrap g">
<div class="s-text center">
<p class="print-only print-name">${P.name} | ${P.jobTitle}</p>
<p class="print-only">${P.line} ${P.email} | ${P.linkedin.replace('https://www.', '')} | ${site.origin.replace('https://', '')}${site.base}</p>
<h1 class="h1">About</h1>
</div>
<div class="s-${pspan} block about-portrait">${image(d.portrait, { alt: d.portraitAlt, sz: sizesFor(pspan), prefix: p, priority: true })}</div>
<div class="s-narrow block"><div class="prose"><p>${d.bio}</p></div></div>
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
<form class="s-narrow block form" action="${d.form.action}" method="post" data-contact data-subject-prefix="${d.form.subjectPrefix}" novalidate>
<div class="form__hp" aria-hidden="true"><label for="cf-hp">Leave this field empty</label><input id="cf-hp" name="_honey" type="text" tabindex="-1" autocomplete="off"></div>
${field('name', 'Name', 'text', { autocomplete: 'name' })}
${field('email', 'Email', 'email', { autocomplete: 'email' })}
${field('subject', 'Subject')}
${field('message', 'Message', 'textarea')}
<p><button class="btn" type="submit"><span>Send</span></button></p>
<p class="form__status" role="status"></p>
</form>
</section>`;
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'ProfilePage', url: `${site.origin}${site.base}about.html`, mainEntity: { '@id': `${site.origin}${site.base}#person` } }, ctx.personLd];
  return { body, viewer: false, page: { path: 'about.html', nav: 'about', navExact: true, title: d.title, description: d.description, og: d.og, ogType: 'profile', jsonld,
    preload: preloadFor(d.portrait, sizesFor(pspan), p), bodyClass: 'page-about' } };
}

/* ------------------------------------------------------------------ films */
export function motion(site, d, projects, ctx) {
  const p = ctx.prefix;
  const by = Object.fromEntries(projects.map((x) => [x.slug, x]));
  const player = (f) => html`<video controls preload="none" playsinline poster="${p}videos/web/${f.slug}-poster.webp" width="${f.w}" height="${f.h}" aria-describedby="${f.id}-desc"><source src="${p}videos/web/${f.slug}.mp4" type="video/mp4"><a href="${p}videos/web/${f.slug}.mp4">Download the film (MP4)</a></video>`;
  const thirds = ['s-third-a', 's-third-b', 's-third-c'];
  const body = html`
<header class="intro wrap g"><div class="s-text center"><h1 class="h1">Films and motion</h1><p class="lead in">${d.intro}</p></div></header>
<section id="films" aria-labelledby="films-h">
<div class="chapter wrap g"><div class="head s-text"><h2 class="h1" id="films-h">${d.filmsTitle}</h2><p class="meta measure">${d.filmsIntro}</p></div></div>
${d.films.map((f) => html`<article class="block wrap g" id="${f.id}" aria-labelledby="${f.id}-h" data-rv><div class="s-${spanFor(f.w, f.h, { max: 'wide' })} film">${player(f)}</div><div class="s-text center in"><h3 class="title" id="${f.id}-h">${f.title}</h3><p class="label">${f.label}</p><p class="meta in measure" id="${f.id}-desc">${f.text}</p>${when(f.project && by[f.project], () => html`<p>${more(projectHref(by[f.project], p), 'The project', p)}</p>`)}</div></article>`)}
</section>
<section id="reels" aria-labelledby="reels-h">
<div class="chapter wrap g"><div class="head s-text"><h2 class="h1" id="reels-h">${d.reelsTitle}</h2></div></div>
<ul class="block wrap g" role="list" data-rv>${d.reels.map((f, k) => html`<li class="${thirds[k % 3]} film stack-s" id="${f.id}">${player(f)}<h3 class="title">${f.title}</h3><p class="label">${f.label}</p><p class="meta" id="${f.id}-desc">${f.text}</p></li>`)}</ul>
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
  const body = html`<div class="intro wrap g"><div class="s-text center"><h1 class="h1">This page does not exist</h1><p class="lead in">The address may have changed when the portfolio was rebuilt.</p><p class="actions in">${more(p + 'architecture.html', 'View work', p)}${more(p, 'Home', p)}</p></div></div>`;
  return { body, viewer: false, page: { path: '404.html', nav: null, noindex: true, title: 'Page not found | Hazem Radhouani', description: 'This page does not exist.', bodyClass: 'page-404' } };
}
