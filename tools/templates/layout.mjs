// Document shell ("Field"): head metadata, the centred header, the compact bar, footer, dialogs.
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
  const brand = (cur) => html`<a class="brand" href="${home}"${attrs({ 'aria-current': cur && page.nav === 'home' ? 'page' : null })}>${P.name}</a>`;
  const menuButton = html`<button class="menu-button" type="button" commandfor="menu" command="show-modal" aria-haspopup="dialog" aria-controls="menu">menu</button>`;
  const themeButton = (scope) => html`<button class="theme-button" type="button" data-theme-toggle data-theme-scope="${scope}"><span class="theme-button__glyph" aria-hidden="true">◐</span><span class="theme-button__label" data-theme-label>theme: light</span><span class="vh" data-theme-action>, switch to dark</span></button>`;
  return html`<!DOCTYPE html>
<html lang="${site.lang}" data-ga="${site.ga4}" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
${when(page.noindex, () => html`<meta name="robots" content="noindex, follow">`)}
<link rel="canonical" href="${url}">
<link rel="preload" href="${p}fonts/eb-garamond-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${p}fonts/ibm-plex-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${page.preload || ''}
<meta id="theme-color" name="theme-color" content="${site.themeColor}">
<meta name="color-scheme" content="light dark">
<script data-theme-bootstrap>(function(){var t;try{t=localStorage.getItem('hazem-theme');}catch(e){}if(t!=='light'&&t!=='dark'){try{t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}catch(e){t='light';}}var d=document.documentElement;d.setAttribute('data-theme',t);d.style.colorScheme=t;var m=document.getElementById('theme-color');if(m)m.content=t==='dark'?'#121311':'#FFFFFF';}());</script>
<link rel="stylesheet" href="${p}css/site.css?v=${v.css}">
<script src="${p}js/site.js?v=${v.js}" defer></script>
<meta name="author" content="${P.name}">
${when(page.verification, () => html`<meta name="google-site-verification" content="${site.googleSiteVerification}">`)}
<link rel="icon" href="${p}favicon.svg" type="image/svg+xml">
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
<div class="wrap">
${brand(true)}
<nav class="nav" aria-label="Main"><ul role="list">${site.nav.map(navItem)}</ul></nav>
<div class="site-header__tools">${themeButton('header')}${menuButton}</div>
</div>
</header>
<div class="bar" id="bar" inert>
<div class="bar__in wrap">
${brand(false)}
<nav class="nav" aria-label="Site"><ul role="list">${site.nav.map(navItem)}</ul></nav>
<div class="bar__tools">${themeButton('bar')}${menuButton}</div>
</div>
</div>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site-footer">
<div class="wrap">
<p class="site-footer__mail"><a href="mailto:${P.email}">${P.email}</a></p>
<p class="site-footer__links"><a href="${P.linkedin}" target="_blank" rel="noopener">LinkedIn<span class="vh"> (opens in a new tab)</span></a><a href="${p}files/hazem-radhouani-cv.pdf">CV (PDF)</a></p>
<div class="site-footer__base">
<nav aria-label="Footer"><ul role="list">${site.footerNav.map((n) => html`<li><a href="${p}${n.href}">${n.label}</a></li>`)}</ul></nav>
<p>&copy; 2026 ${P.name}</p>
</div>
</div>
</footer>
<dialog class="menu" id="menu" aria-label="Site menu">
<div class="wrap">
<div class="menu__top">${brand(false)}<div class="menu__controls">${themeButton('menu')}<form method="dialog"><button class="menu__close" type="submit" autofocus>close</button></form></div></div>
<nav aria-label="Main"><ul class="menu__list" role="list">${site.nav.map(navItem)}</ul></nav>
<p class="menu__contact"><a href="mailto:${P.email}">${P.email}</a><a href="${P.linkedin}" target="_blank" rel="noopener">LinkedIn<span class="vh"> (opens in a new tab)</span></a></p>
</div>
</dialog>
${when(ctx.viewer, () => html`<dialog class="viewer" id="viewer" aria-labelledby="viewer-title">
<div class="viewer__top"><span class="viewer__count" aria-hidden="true"></span><p class="viewer__title" id="viewer-title"></p><form method="dialog"><button class="viewer__btn" type="submit" autofocus>close${icon('x', p)}</button></form></div>
<div class="viewer__stage" tabindex="0" role="group" aria-roledescription="image viewer" aria-label="Full-size image. Arrow keys: previous and next; double click or the actual size button: zoom"></div>
<div class="viewer__bottom"><button class="viewer__btn" type="button" data-viewer-toggle><span>actual size</span></button><div class="viewer__nav"><button class="viewer__btn" type="button" data-viewer-prev aria-label="Previous image">${icon('arrow-left', p)}</button><button class="viewer__btn" type="button" data-viewer-next aria-label="Next image">${icon('arrow-right', p)}</button></div></div>
</dialog>`)}
</body>
</html>
`;
}
