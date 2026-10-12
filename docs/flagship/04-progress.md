# 04 · Build progress log

| | |
|---|---|
| Branch | `flagship-upgrade` (never `main`) |
| Spec | `docs/flagship/03-spec.md` (Direction A · Measured Drawing) |
| Local test server | `serve` 14.2.6 on `127.0.0.1:8081`, serving the repo through a symlink at `/portfolio/` (same base path as GitHub Pages) |
| Browser | Playwright 1.56.1 driving full Chromium 141.0.7390.37 |

Each row records what changed, how it was verified, the result, and anything left incomplete. "Verified" means observed in the browser or measured by a command whose output is quoted; anything else is marked UNVERIFIED.

## M1 · Foundations (commit `7b1aa99`)

| Task | Files | Verification | Result | Incomplete |
|---|---|---|---|---|
| Self-host fonts | `fonts/archivo-latin.woff2` (90.1 KB), `fonts/archivo-latin-ext.woff2` (86.2 KB), `fonts/ibm-plex-mono-latin-400.woff2` (14.7 KB), `fonts/ibm-plex-mono-latin-ext-400.woff2` (13.3 KB), `fonts/OFL.txt` | fontTools: Archivo exposes `wght` 100-900 and `wdth` 62-125; name tables give the copyright lines quoted in `OFL.txt`. OFL text taken from the `@fontsource` 5.3.0 packages (identical for both families). | Served as `font/woff2` by the test server; used on every page | Plex Mono 500 not shipped (not needed by the design) |
| Metric-matched fallbacks | `css/site.css` (`Archivo Fallback`, `Plex Mono Fallback`) | Values computed from `@capsizecss/metrics` 4.3.0 (Archivo xWidthAvg 440/1000, Arial 913/2048; Plex Mono 600/1000, Courier New 1229/2048) | size-adjust 98.7 %, ascent 88.96 %, descent 21.28 % | CLS effect measured in M6 |
| Tokens, base, layout, components | `css/site.css` | Rendered in Chromium at 375/1440 (screenshots in QA) | See M6 | Safari and Firefox rendering UNVERIFIED (no browser available) |
| Script | `js/site.js` | Loaded without console errors on the pages tested (QA log) | Menu fallback, viewer, register, draw-on-view, forms | Form submission to FormSubmit UNVERIFIED (host not reachable from this environment) |
| Icons | `images/icons.svg` | XML parses; five symbols | Phosphor Light paths, MIT notice embedded | – |

**Deviation from 03-spec §3/§4, logged:** the new stylesheet and script are `css/site.css` and `js/site.js` instead of rewriting `css/styles.css` and `js/main.js`. Reason: GitHub Pages caches assets for about 10 minutes, so new HTML could otherwise load a stale old stylesheet. The three old files are no longer referenced and are listed for the owner's deletion decision.

## M2 · Media (commit `48c5c0d`)

| Task | Files | Verification | Result | Incomplete |
|---|---|---|---|---|
| Quality setting | – | AVIF q50 / q62 and WebP q72 / q82 of `al-arg-plans.jpg` compared to the original at 2× zoom on the drawing's own text | No visible loss at q50 AVIF (50 KB vs 511 KB JPEG); spec values kept | – |
| Image derivatives | `images/opt/**` | `media.mjs` log: 52 sources, 378 files, 11.87 MB; widths filtered to `< source width` plus the native width | Example: `al-arg/thumb.jpg` 195 KB JPEG → 43 KB AVIF at 928 px; `tamansourt/thumb.jpg` 834 KB → 165 KB at 2000 px | – |
| Foubert data URIs | `images/foubert/foubert-west-facade.jpg`, `foubert-east-facade.jpg` | Decoded bytes written unchanged (1358×1020 px) | Page weight 509 KB → 15.9 KB | – |
| La Villette data URIs | – | md5 of the decoded URIs equals `images/la-villette/La villette_page-000{1,2}.jpg` | Reused the existing files; page weight 1,043 KB → 16.7 KB | – |
| Three-scales crops | `images/opt/al-arg/scales-{territorial,urban,architectural}.jpg` | Crop boxes drawn on the source sheets and inspected before cutting | Map area 904×647; "Plan de masse · projet" 391×261; "Plan RDC · projet" 276×261 | No location claim is drawn on the territory map (the village's position could not be verified from the drawings) |
| Film posters | `videos/web/*-poster.webp` | Contact sheet of 6 frames per film reviewed; chosen frame per film recorded in `video.py` | 4-51 KB each (budget 60 KB); Sidi Maarouf now shows its own film (F08) | – |
| Web encodes | `videos/web/*.mp4` | Same frame (t = 60 s) of `zenata.mp4` original vs encode compared at 1:1 | No visible difference; 157 MB → 59 MB; peak 2.14 Mb/s (budget 2.5) | – |

## M3 · Pages (generated from `content.json`; generator and extractor kept outside the repo)

| Task | Files | Verification | Result | Incomplete |
|---|---|---|---|---|
| Verbatim extraction | – | `extract.py` asserts the expected structure of every original page (5 metadata fields per project, 5 experience rows, 3 education rows, 4 distinctions, 2 books, 3 reels, 3 films) | 12 projects, 723 text blocks | – |
| Home | `index.html` | Screenshots 375/1440; axe; overflow at 6 widths | Name as h1; identity line and strengths from `CLAUDE.md`; Al-Arg flagship with the three-scales diagram; timeline; 4 selected projects (La Villette, Zenata Station, Corallum, Belhomme); research teaser; contact | **Deviation:** Belhomme replaces Tamansourt among the 4 selected projects: it is the second project built on survey and documentation (its facade survey sheet), which is the stated core skill, while Tamansourt's gallery images are 460-500 px |
| Work register | `architecture.html` | Filters, preview, reload with `?filter=` (interaction test) | 12 real links in an ordered list (F13 fixed); filters with `aria-pressed` and a live count; preview panel at ≥1280 px with a fine pointer | – |
| Case studies × 12 | `projects/*.html` | Screenshots of 7 of 12 reviewed at 1440 and/or 375; axe and overflow on all 12 | Sticky title block (Location, Year, Studio, Type, Surface, register number), Fig. 1 hero, verbatim narrative, each gallery label as an h2 figure title (F41), numbered figures with verbatim captions and a full-size viewer; films inline on Sentry and Zenata; prev / All work / next | Role and tools per project remain [CONTENT NEEDED] |
| Research | `books.html` | Screenshot 1440; axe | Thesis, report and Sakura entries; direct Heyzine links that work without JS (F06) | Thesis and report PDFs [CONTENT NEEDED] |
| About | `about.html` | Screenshots 375/1440; form test | CV as dated rows; thesis title moved to the June 2024 entry (F01 answer); "Most Appreciated Research" (F02 answer) | – |
| Motion | `motion.html` | Screenshot 1440; no-JS test | 3 films and 3 reels as native players with posters; videos.html sub-line restored as the films lead | Captions for films with speech [CONTENT NEEDED] |
| Redirect, 404 | `videos.html`, `404.html` | Meta check; screenshot | `videos.html` → `motion.html#films` (maps `#video-sentry`/`#video-zenata` to the new film anchors); 404 with root-absolute links | GitHub Pages 404 behaviour UNVERIFIED until deployed |
| Content truth | – | `content_truth.py`: every original text block searched verbatim in the new site | 57 of 723 blocks not found verbatim; all classified (see below) | – |

**Original text not carried over verbatim (57 blocks), by reason**
- Owner's answer F02 (3): "Best Research Award" → "Most Appreciated Research" on About, in the report metadata and in the report text ("…for which the Most Appreciated Research distinction was received").
- Navigation and interface labels replaced by the new structure (about 40): "HR" logo, "Books"/"Videos" nav labels, home card and index labels ("Selected works", "Moving image", "Books / thesis", "01 / Work Architecture index", "Start a conversation"…), "Experience more", "View selected works", "Open", "Publications", "Motion Work", "swipe to navigate" (swipe gesture removed), "Watch the animation" (films now play inline), "All Work" (now "All work"), footer variants "(c) 2026" and "Hazem Radhouani · Motion".
- Metric labels whose facts remain elsewhere (8): "12 selected architecture works", "04 territories: Paris, Casablanca, Tokyo, Tunisia", "2026 professional and research portfolio", "selected works", "territories", "Paris practice", the taxonomy chips "Transformations"/"Housing" (they were links to the same list, now real filters), "Built / speculative.".
- Card meta lines that used a country where the case study states a city (5), e.g. "France · 2025–2026 · Studio BELEM": the register now shows the case-study fields (Paris, Casablanca, Tunis).
- Home positioning (3): "Architect between heritage, cities, and motion.", "Paris / Casablanca / Tokyo", "Architecture / Motion / Research": replaced by the identity line you gave in `CLAUDE.md`.
- One descriptive sentence (1): the second Sidi Maarouf description from `videos.html` ("Animation for the Sidi Maarouf RER station, canopy structure, passenger flows, and urban integration within the Casablanca metropolitan rail network."), dropped as a near-duplicate of the Motion page text. The Sentry and Zenata descriptions from `videos.html` are kept on their case studies.

## M4 · Motion and interaction (in `css/site.css` and `js/site.js`)

| Behaviour | Purpose | Verification (`interact.js`, Chromium 141) | Result |
|---|---|---|---|
| Skip link | Keyboard orientation | Tab → visible skip link; Enter → `document.activeElement` is `main`; next Tab lands inside main | PASS (F16 fixed) |
| Focus indicator | Feedback | First 14 tab stops on home all have a 2 px solid outline | PASS |
| Menu dialog (phones) | – | Opens from Menu; focus on Close; 12 Tabs never reach page content (focus passes through browser chrome once and returns); current page marked; Esc closes; focus returns to Menu | PASS (F18/F21 fixed) |
| Viewer | Drawings readable at native pixels on any screen | Full size opens the 1187 px territory map; Actual size renders 1187 px; Esc closes; focus returns to the link | PASS |
| Register filters | State change | Academic → Al-Arg, Corallum, Cinephile; "Showing 3 of 12 projects"; `?filter=academic` survives reload; rows animate with a same-document view transition | PASS |
| Register preview | Orientation | Hover row 5 → preview shows Zenata Station | PASS |
| Contact form | Feedback | Empty submit → 4 fields `aria-invalid`, focus on Name; bad email → original message; sending → `aria-busy` + disabled; stubbed 200 → original success text and reset; payload keeps the original fields and subject format | PASS (endpoint stubbed; real FormSubmit UNVERIFIED) |
| Diagrams draw once | Explanation (territorial → urban → architectural; years in order) | Below-fold diagrams start hidden and end drawn after scrolling | PASS |
| Reduced motion | – | With `prefers-reduced-motion: reduce` the diagrams are never hidden | PASS |
| No JS | Robustness | 375 px: 5 nav links visible, Menu button hidden, diagrams visible, 12 register links, 6 players with native controls | PASS |
| Page transitions | Orientation | Register → Al-Arg: `pagereveal` reports an active view transition; the h1 carries `view-transition-name: t-al-arg`, matching the register row | PASS (Safari/Firefox behaviour UNVERIFIED) |

## M5 · Metadata

| Task | Files | Verification | Result |
|---|---|---|---|
| Share images | `images/og/*.jpg` (17, 44-123 KB) | Rendered with the site's fonts (a check aborts if Archivo is not loaded); images contained, never enlarged | 1200×630 JPEG per page |
| Head metadata | all pages | `meta_check.py`: canonical absolute and equal to `og:url`; `og:image`/`twitter:image` absolute and the file exists; `og:image:alt`; `twitter:card`; titles and descriptions unique | 0 problems |
| JSON-LD | all pages | 29 blocks parse (WebSite, Person, ProfilePage, CollectionPage/ItemList, CreativeWork + BreadcrumbList ×12, Thesis) | Person corrected per F01/F02; `worksFor` is Studio BELEM only (the About page gives Yassir Khalil Studio as 2024–2025) |
| Links | all pages | 1,505 internal URLs and every `#fragment` resolved against the repo | 0 broken |
| Sitemap | `sitemap.xml` | Every `<loc>` has a file; `lastmod` 2026-09-26; `videos.html` removed (it is a `noindex` redirect) | – |
