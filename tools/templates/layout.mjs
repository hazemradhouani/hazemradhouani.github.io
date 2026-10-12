// Document shell: head metadata, header (top cover), footer (back cover), dialogs.
import { html, raw, attrs, when } from '../lib/html.mjs';
import { mark, icon } from './partials.mjs';

const abs = (site, rel) => site.origin + site.base + rel.replace(/^\.\//, '').replace(/^index\.html$/, '');

export function layout(site, page, body, ctx) {
  const p = ctx.prefix;
  const url = abs(site, page.path);
  const og = abs(site, page.og || 'images/og/home.jpg');
  const v = ctx.versions;
  const ld = (page.jsonld || []).map((o) => raw(`<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`));
  const navItem = (n) => {
    const cur = page.nav === n.id ? (page.navExact ? 'page' : 'true') : null;
    return html`<li><a href="${p}${n.href}"${attrs({ 'aria-current': cur })}>${n.label}</a></li>`;
  };
  return html`<!DOCTYPE html>
<html lang="${site.lang}" data-ga="${site.ga4}">
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
<link rel="stylesheet" href="${p}css/site.css?v=${v.css}">
<script src="${p}js/site.js?v=${v.js}" defer></script>
<meta name="theme-color" content="${site.themeColor}">
<meta name="color-scheme" content="light">
<meta name="author" content="${site.person.name}">
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
<div class="site-header__inner wrap">
<a class="brand" href="${p || './'}"${attrs({ 'aria-current': page.nav === 'home' ? 'page' : null })}>${mark()}<span class="brand__name">${site.person.name}</span></a>
<nav class="site-nav" aria-label="Main"><ul>${site.nav.map(navItem)}</ul></nav>
<button class="menu-button" type="button" commandfor="menu" command="show-modal" aria-haspopup="dialog" aria-controls="menu"><span class="menu-button__icon" aria-hidden="true"></span>Menu</button>
</div>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site-footer">
<div class="wrap">
<div class="site-footer__mark">
${mark()}
<p class="site-footer__name">${site.person.name}</p>
<p class="site-footer__line">${site.person.line}</p>
<ul class="site-footer__contact" role="list">
<li><a href="mailto:${site.person.email}">${site.person.email}</a></li>
<li><a href="${site.person.linkedin}" target="_blank" rel="noopener">LinkedIn<span class="vh"> (opens in a new tab)</span></a></li>
</ul>
</div>
<div class="site-footer__base">
<p>&copy; 2026 ${site.person.name}</p>
<nav aria-label="Footer"><ul>${site.footerNav.map((n) => html`<li><a href="${p}${n.href}">${n.label}</a></li>`)}</ul></nav>
<p>Set in EB Garamond and IBM Plex Sans</p>
</div>
</div>
</footer>
<dialog class="menu" id="menu" aria-label="Site menu">
<div class="wrap">
<div class="menu__bar">
<a class="brand" href="${p || './'}">${mark()}<span class="brand__name">${site.person.name}</span></a>
<form method="dialog"><button class="menu__close" type="submit" autofocus>Close</button></form>
</div>
<nav aria-label="Main"><ul class="menu__list">${site.nav.map(navItem)}</ul></nav>
<p class="menu__contact"><a href="mailto:${site.person.email}">${site.person.email}</a><a href="${site.person.linkedin}" target="_blank" rel="noopener">LinkedIn<span class="vh"> (opens in a new tab)</span></a></p>
</div>
</dialog>
${when(ctx.viewer, () => html`<dialog class="viewer" id="viewer" aria-labelledby="viewer-title">
<div class="viewer__bar">
<p class="viewer__title" id="viewer-title"></p>
<div class="viewer__actions">
<button class="viewer__btn" type="button" data-viewer-toggle aria-pressed="false"><span>Actual size</span></button>
<form method="dialog"><button class="viewer__btn" type="submit" autofocus>Close${icon('x', p)}</button></form>
</div>
</div>
<div class="viewer__stage" tabindex="0" aria-label="Image, scroll or drag to pan">
</div>
</dialog>`)}
</body>
</html>
`;
}
