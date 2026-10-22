// Document shell ("Reel", D93): head metadata, the fixed header on its edge, the corner captions, the sentence footer, dialogs.
import { html, raw, attrs, when } from '../lib/html.mjs';
import { icon } from './partials.mjs';

const abs = (site, rel) => site.origin + site.base + rel.replace(/^\.\//, '').replace(/^index\.html$/, '');

export function layout(site, page, body, ctx) {
  const p = ctx.prefix;
  const url = abs(site, page.path);
  const og = abs(site, page.og || 'images/og/home.jpg');
  const v = ctx.versions;
  const P = site.person;
  const ld = (page.jsonld || []).map((o) => raw(`<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`));
  const navItem = (n, i) => {
    const cur = page.nav === n.id ? (page.navExact ? 'page' : 'true') : null;
    return html`<li style="--i: ${i}"><a href="${p}${n.href}"${attrs({ 'aria-current': cur })}>${n.label}</a></li>`;
  };
  const home = p || './';
  const brand = (cur) => html`<a class="brand" href="${home}"${attrs({ 'aria-current': cur && page.nav === 'home' ? 'page' : null })}><span>${P.name}</span><span>${P.jobTitle}</span></a>`;
  const menuButton = html`<button class="menu-button" type="button" commandfor="menu" command="show-modal" aria-haspopup="dialog" aria-controls="menu">Menu</button>`;
  // an icon on screen (drawn for this site, inline so it also shows from file://); its name is still the state
  // followed by the action (D68), read from hidden words
  const themeButton = (scope) => html`<button class="theme-button" type="button" data-theme-toggle data-theme-scope="${scope}"><svg viewBox="0 0 256 256" aria-hidden="true" focusable="false"><circle cx="128" cy="128" r="90" fill="none" stroke="currentColor" stroke-width="14"/><path fill="currentColor" d="M128 38a90 90 0 0 0 0 180Z"/></svg><span class="vh"><span data-theme-label>theme: light</span><span data-theme-action>, switch to dark</span></span></button>`;
  const edge = (where) => html`<div class="edge${where === 'bottom' ? ' edge--bottom' : ''}" aria-hidden="true"><span class="edge__b1"></span><span class="edge__b2"></span><span class="edge__b3"></span><span class="edge__w"></span></div>`;
  const views = html`<nav class="views" aria-label="The work"><ul role="list">${site.views.map(navItem)}</ul></nav>`;
  const href = (rel) => p + rel;
  return html`<!DOCTYPE html>
<html lang="${site.lang}" data-ga="${site.ga4}" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
${when(page.noindex, () => html`<meta name="robots" content="noindex, follow">`)}
<link rel="canonical" href="${url}">
<link rel="preload" href="${p}fonts/instrument-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${page.preload || ''}
<meta id="theme-color" name="theme-color" content="${site.themeColor}">
<meta name="color-scheme" content="light dark">
<script data-theme-bootstrap>(function(){var t;try{t=localStorage.getItem('hazem-theme');}catch(e){}if(t!=='light'&&t!=='dark'){try{t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}catch(e){t='light';}}var d=document.documentElement;try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('fx');}catch(e){}d.setAttribute('data-theme',t);d.style.colorScheme=t;var m=document.getElementById('theme-color');if(m)m.content=t==='dark'?'#121311':'#FFFFFF';}());</script>
<script>addEventListener('pagereveal',function(e){if(e.viewTransition)document.documentElement.classList.add('vt-arrived');});</script>
<link rel="stylesheet" href="${p}css/site.css?v=${v.css}">
<script src="${p}js/site.js?v=${v.js}" defer></script>
<meta name="author" content="${P.name}">
${when(page.verification, () => html`<meta name="google-site-verification" content="${site.googleSiteVerification}">`)}
<link rel="icon" href="${p}favicon.svg" type="image/svg+xml">
<link rel="icon" href="${p}favicon-96x96.png" type="image/png" sizes="96x96">
<link rel="icon" href="${p}favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="${p}apple-touch-icon.png">
<link rel="manifest" href="${p}site.webmanifest">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${site.siteName}">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="${page.ogTitle || page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${page.ogAlt || page.title}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${page.ogTitle || page.title}">
<meta name="twitter:description" content="${page.description}">
<meta name="twitter:image" content="${og}">
<meta name="twitter:image:alt" content="${page.ogAlt || page.title}">
${ld}
</head>
<body class="${page.bodyClass || ''}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
${edge('top')}
<div class="site-header__in">
<nav class="nav" aria-label="Main"><ul role="list">${site.nav.map(navItem)}</ul></nav>
${brand(true)}
<div class="site-header__tools">${views}${themeButton('header')}${menuButton}</div>
</div>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site-footer">
<nav aria-label="Footer"><p class="tale-nav">See the <a href="${href('architecture.html')}">work</a>, the <a href="${href('books.html')}">research</a>, read <a href="${href('about.html')}">about</a> me, or <a href="${href('about.html#contact')}">get in touch</a>.</p></nav>
<p class="site-footer__base"><a href="mailto:${P.email}">${P.email}</a><a href="${P.linkedin}" target="_blank" rel="noopener">LinkedIn<span class="vh"> (opens in a new tab)</span></a><a href="${href('files/hazem-radhouani-cv.pdf')}">CV (PDF)</a><a href="${href('motion.html')}">Films and motion</a><span>&copy; 2026 ${P.name}</span></p>
</footer>
${when(page.corners, () => html`${edge('bottom')}<p class="corner corner--l">${site.corners[0]}</p><p class="corner corner--r">${site.corners[1]}</p>`)}
<dialog class="menu" id="menu" aria-label="Site menu" data-lenis-prevent>
<div class="wrap">
<div class="menu__top">${brand(false)}<div class="menu__controls">${themeButton('menu')}<form method="dialog"><button class="menu__close" type="submit" autofocus>close</button></form></div></div>
<nav aria-label="Main"><ul class="menu__list" role="list">${[...site.views, ...site.nav].map(navItem)}</ul></nav>
<p class="menu__contact"><a href="mailto:${P.email}">${P.email}</a><a href="${P.linkedin}" target="_blank" rel="noopener">LinkedIn<span class="vh"> (opens in a new tab)</span></a></p>
</div>
</dialog>
${when(ctx.viewer, () => html`<dialog class="viewer" id="viewer" aria-labelledby="viewer-title" data-lenis-prevent>
<div class="viewer__top"><span class="viewer__count" aria-hidden="true"></span><p class="viewer__title" id="viewer-title"></p><form method="dialog"><button class="viewer__btn" type="submit" autofocus>close${icon('x', p)}</button></form></div>
<div class="viewer__stage" tabindex="0" role="group" aria-roledescription="image viewer" aria-label="Full-size image. Arrow keys: previous and next; double click or the actual size button: zoom"></div>
<div class="viewer__bottom"><div class="viewer__nav"><button class="viewer__btn" type="button" data-viewer-toggle><span>actual size</span></button><a class="viewer__btn" data-viewer-project href="#" hidden>View project</a></div><div class="viewer__nav"><button class="viewer__btn" type="button" data-viewer-prev aria-label="Previous image">${icon('arrow-left', p)}</button><button class="viewer__btn" type="button" data-viewer-next aria-label="Next image">${icon('arrow-right', p)}</button></div></div>
</dialog>`)}
</body>
</html>
`;
}
