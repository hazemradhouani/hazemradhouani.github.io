// Page bodies. Each returns { page, body, viewer } for layout().
import { html, attrs, when } from '../lib/html.mjs';
import { picture, dims, variants, optStem } from '../lib/images.mjs';
import { mark, icon, sheet, workCard, registerRow, projectHref, vtName, SIZES } from './partials.mjs';

const q = (s) => `“${s}”`;
const lcpPreload = (rel, sizes, p) => {
  const ws = variants(rel);
  if (!ws.length) return '';
  const set = ws.map((w) => `${p}${optStem(rel)}-${w}.avif ${w}w`).join(', ');
  return html`<link rel="preload" as="image" type="image/avif" imagesrcset="${set}" imagesizes="${sizes}" fetchpriority="high">`;
};
const native = (rel) => dims(rel).w;
const more = (href, label, p, dir = 'right') => dir === 'left'
  ? html`<a class="more" href="${href}">${icon('arrow-left', p)}<span>${label}</span></a>`
  : html`<a class="more" href="${href}"><span>${label}</span>${icon('arrow-right', p)}</a>`;

/* ------------------------------------------------------------------ home */
export function home(site, d, projects, ctx) {
  const p = ctx.prefix;
  const by = Object.fromEntries(projects.map((x) => [x.slug, x]));
  const fl = d.flagship; const flp = by[fl.project];
  const coverSizes = '(min-width: 64rem) 36vw, 70vw';
  const body = html`
<section class="cover on-cover" aria-labelledby="name">
<div class="cover__inner wrap">
<div class="cover__text">
<h1 class="cover__name" id="name">${site.person.name}</h1>
<p class="cover__line">${site.person.line}</p>
<p class="cover__cred caps">${site.person.credential}</p>
<p class="cover__actions"><a class="button button--primary" href="${p}architecture.html">View work${icon('arrow-right', p)}</a><a class="button" href="${p}books.html">Research</a></p>
</div>
<figure class="cover__photo"><div class="media">${picture(d.cover.image, { alt: d.cover.alt, sizes: coverSizes, prefix: p, priority: true })}</div></figure>
</div>
</section>

<section class="section manifesto wrap" aria-labelledby="conviction">
<hr class="rule-mark">
<h2 class="manifesto__quote" id="conviction">${q(d.manifesto.quote)}</h2>
<p class="manifesto__text">${d.manifesto.text}</p>
<p class="manifesto__source">${more(p + d.manifesto.href, d.manifesto.attribution, p)}</p>
</section>

<section class="flagship" aria-labelledby="flagship-h">
<div class="wrap">
<figure class="flagship__hero"><div class="media" style="--native: ${native(fl.hero.image)}px">${picture(fl.hero.image, { alt: fl.hero.alt, sizes: SIZES.full, prefix: p })}</div></figure>
<div class="flagship__intro">
<div><h2 class="flagship__title" id="flagship-h" style="view-transition-name: ${vtName(flp)}">${fl.title}</h2><p class="flagship__lede">${fl.line}</p></div>
<div><p>${fl.text}</p><p>${more(projectHref(flp, p), 'Read the case study', p)}</p></div>
</div>
<ol class="scales" data-draw role="list">
${fl.scales.map((s) => html`<li><figure class="scales__item"><div class="plate" style="--native: ${native(s.image)}px">${picture(s.image, { alt: s.alt, sizes: '(min-width: 64rem) 30vw, 90vw', prefix: p })}</div><figcaption class="scales__label"><b>${s.label}</b> ${s.caption}</figcaption></figure></li>`)}
</ol>
</div>
</section>

<section class="section" aria-labelledby="selected-h">
<div class="wrap">
<div class="section-head"><h2 id="selected-h">Selected work</h2>${more(p + 'architecture.html', `All ${projects.length} projects`, p)}</div>
<ul class="selected" role="list">${d.selected.map((s) => workCard(by[s], ctx))}</ul>
</div>
</section>

<section class="section" aria-labelledby="proofs-h">
<div class="wrap">
<div class="section-head"><h2 id="proofs-h">Capabilities</h2></div>
<ul class="proofs" role="list">
${d.proofs.map((x) => html`<li class="proof">
<div class="proof__body"><h3 class="proof__name">${x.name}</h3><p class="proof__text">${x.text}</p>${when(x.tools, () => html`<p class="proof__tools">${x.tools}</p>`)}<p>${more(projectHref(by[x.project], p), x.context, p)}</p></div>
<figure class="proof__fig">${x.kind === 'drawing'
    ? html`<div class="plate" style="--native: ${native(x.image)}px">${picture(x.image, { alt: x.alt, sizes: SIZES.half, prefix: p })}</div>`
    : html`<div class="media media--render" style="--native: ${native(x.image)}px">${picture(x.image, { alt: x.alt, sizes: SIZES.half, prefix: p })}</div>`}</figure>
</li>`)}
</ul>
</div>
</section>

<section class="section" aria-labelledby="research-h">
<div class="wrap">
<div class="section-head"><h2 id="research-h">Research</h2>${more(p + 'books.html', 'Thesis, report and the Sakura programme', p)}</div>
<div class="research">
<figure class="research__cover"><div class="media">${picture(d.research.cover, { alt: d.research.coverAlt, sizes: '(min-width: 64rem) 22rem, 70vw', prefix: p })}</div></figure>
<div class="research__body">
<h3 class="research__title">${d.research.title}</h3>
<p class="research__ar" lang="ar" dir="rtl">${d.research.titleAr}</p>
<p class="research__meta">${d.research.meta}</p>
<p class="research__meta">${d.research.award}</p>
</div>
</div>
</div>
</section>`;
  return { body, viewer: false, page: { path: 'index.html', nav: 'home', title: d.title, description: d.description, og: d.og, verification: true,
    preload: lcpPreload(d.cover.image, coverSizes, p), bodyClass: 'page-home', jsonld: [ctx.websiteLd, ctx.personLd] } };
}

/* ------------------------------------------------------------------ work register */
export function work(site, projects, ctx) {
  const p = ctx.prefix;
  const groups = site.groups.map((g) => ({ ...g, items: projects.filter((x) => x.group === g.id) })).filter((g) => g.items.length);
  const body = html`
<div class="wrap">
<header class="page-head"><h1>Work</h1><p>Places already alive. ${projects.length} projects in Paris, Morocco and Tunisia, from 2022 to 2026.</p></header>
<div class="filters" role="group" aria-label="Filter projects" hidden>
${site.filters.map((f, i) => html`<button type="button" data-filter="${f.id}" aria-pressed="${i === 0 ? 'true' : 'false'}">${f.label}</button>`)}
</div>
<p class="register__status" role="status" hidden>Showing ${projects.length} of ${projects.length} projects</p>
<div class="register__layout" data-register>
<div class="register">
${groups.map((g) => html`<section class="register__group" aria-labelledby="g-${g.id}"><h2 class="register__group-title" id="g-${g.id}">${g.label}</h2><ol class="register__list" role="list">${g.items.map((x) => registerRow(x, ctx))}</ol></section>`)}
<p class="register__empty" hidden>No project matches this filter.</p>
</div>
<aside class="preview" aria-hidden="true"><div class="media media--fill" style="--ratio: 4 / 5"></div><p class="preview__cap"></p></aside>
</div>
</div>`;
  const items = projects.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: `${site.origin}${site.base}projects/project-${x.slug}.html`, name: x.title }));
  return { body, viewer: false, page: { path: 'architecture.html', nav: 'work', navExact: true, title: 'Work | Hazem Radhouani, architect',
    description: `${projects.length} architecture projects by Hazem Radhouani: rehabilitation in Paris with Studio BELEM, rail infrastructure in Morocco, and heritage research in Tunisia.`,
    og: 'images/og/work.jpg', bodyClass: 'page-work',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Work', url: `${site.origin}${site.base}architecture.html`, mainEntity: { '@type': 'ItemList', itemListElement: items } }] } };
}

/* ------------------------------------------------------------------ case study */
export function project(site, x, projects, ctx) {
  const p = ctx.prefix;
  const i = projects.indexOf(x);
  const next = projects[(i + 1) % projects.length];
  const flip = i % 2 === 1;
  const h = x.hero;
  const lede = !x.role.length && x.narrative.length ? x.narrative[0] : null;
  const rest = lede ? x.narrative.slice(1) : x.narrative;
  let n = 0;
  const heroImg = h ? picture(h.src, { alt: h.alt, sizes: SIZES.opener, prefix: p, priority: true }) : '';
  const heroMedia = h ? (h.fit === 'contain'
    ? html`<div class="plate opener__plate" style="--native: ${native(h.src)}px">${heroImg}</div>`
    : html`<div class="media" style="--native: ${native(h.src)}px">${heroImg}</div>`) : '';
  const film = x.film ? ctx.films.find((f) => f.slug === x.film) : null;
  const hd = h ? dims(h.src) : null;
  const band = hd && hd.w / hd.h >= 1.2;
  const heroBand = band ? html`<div class="media" style="--native: ${hd.w}px; --ratio: ${hd.w} / ${hd.h}">${picture(h.src, { alt: h.alt, sizes: SIZES.full, prefix: p, priority: true })}</div>` : heroMedia;
  const heroCap = h && (h.caption || h.credit) ? html`<figcaption class="opener__credit"><span>${h.caption || ''}</span>${when(h.credit, () => html` <span class="credit">${h.credit}</span>`)}</figcaption>` : '';
  const body = html`
<article class="case">
<header class="opener${band ? ' opener--band' : flip ? ' opener--flip' : ''}${h ? '' : ' opener--text'}">
${when(h, () => html`<figure class="opener__media${h.fit === 'contain' ? ' opener__media--contain' : ''}${band ? ' wrap' : ''}">${heroBand}${heroCap}</figure>`)}
<div class="opener__panel">
<p class="opener__run">${x.title} | ${x.run}</p>
<div class="opener__body">
<hr class="rule-mark">
${when(x.quote, () => html`<p class="opener__quote">${q(x.quote.text)}</p>`)}
${x.role.length ? html`<ul class="opener__role" role="list">${x.role.map((r) => html`<li>${r.text}</li>`)}</ul>` : when(lede, () => html`<p class="opener__lede">${lede.text}</p>`)}
</div>
<div class="opener__ident">
<h1 class="opener__title" style="view-transition-name: ${vtName(x)}">${x.title}</h1>
<dl class="spec">${x.spec.map((s) => html`<dt>${s.label}</dt><dd>${s.value}</dd>`)}</dl>
<p class="opener__tag">${x.tag}</p>
</div>
</div>
</header>
${when(rest.length || x.honour, () => html`<section class="section wrap narrative" aria-labelledby="about-h"><h2 class="narrative__label" id="about-h">Project</h2><div class="prose">${rest.map((t, k) => html`<p${attrs({ class: k === 0 ? 'lede' : null })}>${t.text}</p>`)}${when(x.honour, () => html`<p class="narrative__honour caps">${x.honour}</p>`)}</div></section>`)}
${when(x.figures.length, () => html`<section class="section wrap sheets-wrap" aria-labelledby="sheets-h"><h2 class="vh" id="sheets-h">Drawings and images</h2><div class="sheets">${x.figures.map((f) => sheet(f, ++n, ctx))}</div></section>`)}
${when(film, () => html`<section class="section wrap" aria-labelledby="film-h"><div class="film"><div class="film__head"><h2 class="film__title" id="film-h">Film</h2><span class="caps muted">${film.label}</span></div><video controls preload="none" playsinline poster="${p}videos/web/${film.slug}-poster.webp" width="${film.w}" height="${film.h}" aria-describedby="film-desc"><source src="${p}videos/web/${film.slug}.mp4" type="video/mp4"></video><p class="film__text" id="film-desc">${film.text}</p></div></section>`)}
<nav class="wrap pager" aria-label="Next project">
<a class="next" href="${projectHref(next, p)}" rel="next">
<span class="next__text"><span class="caps next__label">Next project</span><span class="next__title" style="view-transition-name: ${vtName(next)}">${next.title}</span><span class="next__meta">${next.descriptor} | ${next.place} | ${next.year}</span></span>
${when(next.hero, () => html`<span class="media media--fill" style="--ratio: 4 / 3">${picture(next.hero.src, { alt: '', sizes: '(min-width: 64rem) 26rem, 90vw', prefix: p })}</span>`)}
</a>
<p class="pager__all">${more(p + 'architecture.html', 'All work', p, 'left')}</p>
</nav>
</article>`;
  const url = `${site.origin}${site.base}projects/project-${x.slug}.html`;
  const person = { '@type': 'Person', '@id': `${site.origin}${site.base}#person`, name: site.person.name };
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'CreativeWork', name: x.title, description: x.summary, url,
    ...(h ? { image: `${site.origin}${site.base}${h.src}` } : {}), dateCreated: x.date,
    genre: x.descriptor.split(' | ')[0], locationCreated: { '@type': 'Place', name: x.place },
    ...(x.office ? { creator: { '@type': 'Organization', name: x.office }, contributor: person } : { creator: person }),
    isPartOf: { '@type': 'WebSite', url: `${site.origin}${site.base}`, name: site.siteName } },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.origin}${site.base}` },
    { '@type': 'ListItem', position: 2, name: 'Work', item: `${site.origin}${site.base}architecture.html` },
    { '@type': 'ListItem', position: 3, name: x.title, item: url }] }];
  return { body, viewer: x.figures.length > 0, page: { path: `projects/project-${x.slug}.html`, nav: 'work', title: `${x.title} | ${x.descriptor.split(' | ')[0]} | Hazem Radhouani`,
    description: x.summary, og: ctx.ogFor(`project-${x.slug}`), ogType: 'article', ogAlt: h ? h.alt : x.title, jsonld,
    preload: h ? lcpPreload(h.src, band ? SIZES.full : SIZES.opener, p) : '', bodyClass: 'page-case' } };
}

/* ------------------------------------------------------------------ research */
const book = (b, p, extra) => html`<article class="book" aria-labelledby="${b.id}">
<figure class="book__cover"><div class="media">${picture(b.cover, { alt: b.coverAlt, sizes: '(min-width: 64rem) 18rem, 70vw', prefix: p })}</div></figure>
<div class="book__body">
<p class="caps muted">${b.label}</p>
<h2 class="book__title" id="${b.id}">${b.title}</h2>
<p class="lede muted">${b.subtitle}</p>
${extra || ''}
<dl class="spec">${b.spec.map((s) => html`<dt>${s.label}</dt><dd${attrs({ lang: s.lang })}>${s.value}</dd>`)}</dl>
<div class="prose">${b.text.map((t) => html`<p>${t.text}</p>`)}${when(b.honour, () => html`<p class="narrative__honour caps">${b.honour}</p>`)}</div>
<p class="book__links"><a class="button button--primary" href="${b.read}" target="_blank" rel="noopener">Read online<span class="vh"> (opens in a new tab)</span>${icon('arrow-up-right', p)}</a>${when(b.case, () => html`<a class="button" href="${p}${b.case}">Al-Arg case study</a>`)}</p>
</div>
</article>`;
export function research(site, d, ctx) {
  const p = ctx.prefix;
  const t = { ...d.thesis, id: 'thesis-h' }; const r = { ...d.report, id: 'report-h' };
  const body = html`<div class="wrap">
<header class="page-head"><h1>Research</h1><p>${d.intro}</p></header>
${book(t, p, html`<p class="research__ar" lang="ar" dir="rtl">${t.titleAr}</p><blockquote class="abstract"><p>${t.abstract}</p></blockquote>`)}
${book(r, p)}
<article class="book book--text" aria-labelledby="sakura-h">
<div class="book__body">
<p class="caps muted">${d.sakura.label}</p>
<h2 class="book__title" id="sakura-h">${d.sakura.title}</h2>
<p class="lede muted">${d.sakura.subtitle}</p>
<p class="narrative__honour caps">${d.sakura.award}</p>
<div class="prose"><p>${d.sakura.text}</p></div>
</div>
</article>
</div>`;
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'Thesis', name: t.title, alternateName: t.subtitle,
    author: { '@type': 'Person', '@id': `${site.origin}${site.base}#person`, name: site.person.name },
    sourceOrganization: { '@type': 'CollegeOrUniversity', name: 'ENAU, Université de Carthage' }, datePublished: '2024-06', url: t.read }];
  return { body, viewer: false, page: { path: 'books.html', nav: 'research', navExact: true, title: d.title, description: d.description, og: d.og, jsonld, bodyClass: 'page-research' } };
}

/* ------------------------------------------------------------------ about */
const cvRows = (rows) => html`<ol class="cv__list" role="list">${rows.map((r) => html`<li class="cv__row"><span class="cv__when">${r.when}</span><div class="cv__what"><b>${r.what}</b>${when(r.role, () => html`<p>${r.role}</p>`)}${when(r.text, () => html`<p>${r.text}</p>`)}</div></li>`)}</ol>`;
export function about(site, d, ctx) {
  const p = ctx.prefix; const P = site.person;
  const field = (id, label, type = 'text', extra = {}) => html`<div class="field"><label for="cf-${id}">${label} <span>(required)</span></label>${type === 'textarea'
    ? html`<textarea id="cf-${id}" name="${id}" required aria-describedby="cf-${id}-err"></textarea>`
    : html`<input id="cf-${id}" name="${id}" type="${type}" required aria-describedby="cf-${id}-err"${attrs(extra)}>`}<p class="field__error" id="cf-${id}-err" hidden></p></div>`;
  const body = html`<div class="wrap">
<header class="about-head">
<div class="about-head__bio"><p class="print-only print-name">${P.name} | ${P.jobTitle}</p><p class="print-only">${P.line} ${P.email} | ${P.linkedin.replace('https://www.', '')} | ${site.origin.replace('https://', '')}${site.base}</p><h1 class="page-title">About</h1><p>${d.bio}</p><p class="no-print"><a class="button" href="${p}files/hazem-radhouani-cv.pdf" download>Download CV (PDF)</a></p></div>
<figure class="about-head__portrait"><div class="media">${picture(d.portrait, { alt: d.portraitAlt, sizes: '(min-width: 64rem) 20rem, 70vw', prefix: p, priority: true })}</div></figure>
</header>
<div class="cv">
<section class="cv__block" aria-labelledby="exp-h"><h2 class="cv__title" id="exp-h">Experience</h2>${cvRows(d.experience)}</section>
<section class="cv__block" aria-labelledby="edu-h"><h2 class="cv__title" id="edu-h">Education</h2>${cvRows(d.education)}</section>
<section class="cv__block" aria-labelledby="dist-h"><h2 class="cv__title" id="dist-h">Distinctions</h2>${cvRows(d.distinctions)}</section>
<section class="cv__block" aria-labelledby="skills-h"><h2 class="cv__title" id="skills-h">Skills</h2><ol class="cv__list" role="list">${d.skills.map((s) => html`<li class="cv__row"><span class="cv__when">${s.group}</span><div class="cv__what">${s.items.join(' | ')}</div></li>`)}</ol></section>
<section class="cv__block" aria-labelledby="lang-h"><h2 class="cv__title" id="lang-h">Languages</h2><ol class="cv__list" role="list">${d.languages.map((l) => html`<li class="cv__row"><span class="cv__when">${l.level}</span><div class="cv__what">${l.name}</div></li>`)}</ol></section>
</div>
<section class="section contact" id="contact" aria-labelledby="contact-h">
<div class="contact__direct"><h2 class="cv__title" id="contact-h">Contact</h2><a href="mailto:${P.email}">${P.email}</a><a href="${P.linkedin}" target="_blank" rel="noopener">LinkedIn<span class="vh"> (opens in a new tab)</span></a></div>
<form class="form" action="${d.form.action}" method="post" data-contact data-subject-prefix="${d.form.subjectPrefix}" novalidate>
<div class="form__hp" aria-hidden="true"><label for="cf-hp">Leave this field empty</label><input id="cf-hp" name="_honey" type="text" tabindex="-1" autocomplete="off"></div>
${field('name', 'Name', 'text', { autocomplete: 'name' })}
${field('email', 'Email', 'email', { autocomplete: 'email' })}
${field('subject', 'Subject')}
${field('message', 'Message', 'textarea')}
<p><button class="button button--primary" type="submit"><span>Send</span></button></p>
<p class="form__status" role="status"></p>
</form>
</section>
</div>`;
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'ProfilePage', url: `${site.origin}${site.base}about.html`, mainEntity: { '@id': `${site.origin}${site.base}#person` } }, ctx.personLd];
  return { body, viewer: false, page: { path: 'about.html', nav: 'about', navExact: true, title: d.title, description: d.description, og: d.og, ogType: 'profile', jsonld, bodyClass: 'page-about' } };
}

/* ------------------------------------------------------------------ films */
export function motion(site, d, projects, ctx) {
  const p = ctx.prefix;
  const by = Object.fromEntries(projects.map((x) => [x.slug, x]));
  const player = (f) => html`<video controls preload="none" playsinline poster="${p}videos/web/${f.slug}-poster.webp" width="${f.w}" height="${f.h}" aria-describedby="${f.id}-desc"><source src="${p}videos/web/${f.slug}.mp4" type="video/mp4"><a href="${p}videos/web/${f.slug}.mp4">Download the film (MP4)</a></video>`;
  const body = html`<div class="wrap">
<header class="page-head"><h1>Films and motion</h1><p>${d.intro}</p></header>
<section id="films" aria-labelledby="films-h">
<div class="section-head"><h2 id="films-h">${d.filmsTitle}</h2></div>
<p class="muted measure">${d.filmsIntro}</p>
<div class="films mt-s6">${d.films.map((f) => html`<article class="film" id="${f.id}" aria-labelledby="${f.id}-h">${player(f)}<div class="film__head"><h3 class="film__title" id="${f.id}-h">${f.title}</h3><span class="caps muted">${f.label}</span></div><p class="film__text" id="${f.id}-desc">${f.text}</p>${when(f.project && by[f.project], () => html`<p>${more(projectHref(by[f.project], p), 'The project', p)}</p>`)}</article>`)}</div>
</section>
<section class="section" id="reels" aria-labelledby="reels-h">
<div class="section-head"><h2 id="reels-h">${d.reelsTitle}</h2></div>
<ul class="reels" role="list">${d.reels.map((f) => html`<li class="film" id="${f.id}">${player(f)}<div class="film__head"><h3 class="film__title">${f.title}</h3><span class="caps muted">${f.label}</span></div><p class="film__text" id="${f.id}-desc">${f.text}</p></li>`)}</ul>
</section>
<section class="section cv__block" aria-labelledby="mabout-h">
<h2 class="cv__title" id="mabout-h">${d.aboutTitle}</h2>
<div class="cv__body prose">${d.about.map((t) => html`<p>${t}</p>`)}<ol class="cv__list" role="list">${d.tools.map((t) => html`<li class="cv__row"><span class="cv__when">${t.name}</span><div class="cv__what">${t.text}</div></li>`)}</ol></div>
</section>
</div>`;
  return { body, viewer: false, page: { path: 'motion.html', nav: null, title: d.title, description: d.description, og: d.og, bodyClass: 'page-motion' } };
}

/* ------------------------------------------------------------------ 404 */
export function notFound(site, ctx) {
  const p = ctx.prefix;
  const body = html`<div class="wrap lost">${mark()}<h1 class="page-title">This page does not exist</h1><p class="muted">The address may have changed when the portfolio was rebuilt.</p><p class="cover__actions"><a class="button button--primary" href="${p}architecture.html">View work</a><a class="button" href="${p}">Home</a></p></div>`;
  return { body, viewer: false, page: { path: '404.html', nav: null, noindex: true, title: 'Page not found | Hazem Radhouani', description: 'This page does not exist.', bodyClass: 'page-404' } };
}
