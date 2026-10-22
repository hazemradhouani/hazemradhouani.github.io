# Plan 17 "Reel": the flagship rebuild, driven by scroll

## Context

**What the owner rejected and wants.** The owner rejected the result of plans 15–16 (the home "Sequence" and the "Field" look) as not premium or flagship. He also says the motion is wrong. He wants **scroll-linked** motion: the page and everything on it moves as a continuous, smoothed function of the mouse wheel, and scrolling back reverses it exactly. One-shot reveals are not what he means.

**What he supplied.**
- `docs/Scroll map.txt`: a brief for a scroll-scrubbed hero film. Its technique: a pinned stage in a tall track, video time eased toward the scroll position each frame, chapters fading in order, nav highlighting, a poster, short-GOP encodes and a fresh-eyes reviewer loop. He explicitly drops its Higgsfield and image-generation steps: "we already have everything we need".
- **dmcg.co** for the home.
- **dmcg.co/archive**, grid and family views, for the works page.
- **michaelgatt.com/about** for About, kept coherent with dmcg.
- Five photos in `docs/Images/`.

All decisions are delegated to me (CLAUDE.md, memory). They are made here and logged as D90+ at execution.

**Key finding: the repo already holds scroll-scrub material.** These are the owner's own films in `videos/`, measured with ffprobe and ffmpeg scene detection:

| Film | Length | Size | Continuous takes |
|---|---|---|---|
| zenata | 120 s | 1280×720 | Soft crossfades only; takes picked by eye in P3 |
| sidi-maarouf | 120 s | 1280×720 | 30.6–64.9 s, aerial approach (34 s) |
| sentry | 36.8 s | 1280×720 | 0–12.6 s and 16.5–26.9 s, orbits |

Alongside them: 163 images (15 heroes and 148 figures: 93 drawings, 55 renders), transparent drawing cutouts and per-project grounds (`content/grounds.json`). The Scroll-map effect therefore needs no generation at all.

---

## 1. Enhanced master brief (the prompt, rewritten)

> Transform hazemradhouani.github.io into a flagship architecture portfolio. Its home, index and about pages take their structure from dmcg.co and michaelgatt.com/about, and its motion is scroll-linked: every moving value is a pure function of one smoothed scroll value, scrolling back reverses it exactly, and nothing is a one-shot trigger except the brief page-load entrance.
>
> Use only material in the repo plus `docs/Images/`. Never invent content; mark gaps `[CONTENT NEEDED: …]`.
>
> Static and fast:
> - Hosting: GitHub Pages, no server.
> - Performance (mobile, throttled): LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
> - Accessibility: WCAG 2.2 AA, fully keyboard-operable.
> - Reduced motion: a still and complete page.
> - Checked at 320/375/768/1024/1440/1920 px in both schemes.
>
> Every motion states its purpose: orientation, feedback or hierarchy.
>
> **Borrow from the references:**
> - **dmcg:** one quiet sans voice, a centred name block, corner captions, objects on a white field, progressive edge blur, a cursor label pill, a floating filter bar, a catalog grid with an A–Z rail and lightbox, a family tree, filter state in the URL, and a blur-to-sharp entrance on the `.22,1,.36,1` curve.
> - **Gatt:** scroll-told chapters in tracked capitals with bright key words and dim connectors, letters gathering into words, words travelling on a path, tilted drifting photographs, images that tilt with scroll velocity, a chapter rail, and a sentence-shaped footer nav.
> - **Scroll map:** a pinned film scrub with eased time, chapter captions, a poster, short-GOP encodes, and a fresh-eyes reviewer gate.
>
> Copy none of their code, text or assets. Work on `flagship-upgrade` in small commits, log every decision, and merge to main by PR only after QA gates and independent reviews pass.

---

## 2. What the references actually do (observed in Chrome; bundles and CSS read)

**dmcg.co, home.**
- Stack: Next.js on Vercel, Motion (framer-motion) only, **native scroll with no smoothing and no scrub**.
- Layout: one centred column of 8 square cards (457–715 px at 1440, 20 px gaps). Each is a transparent WebM object or a rounded card with a soft shadow, translated through an inner scroller.
- Header: About and Contact on the left. The studio name centred in three lines at about 16 px. A Projects/Catalog switcher with `aria-pressed` on the right.
- Fixed bottom-corner captions.
- **Edges:** three stacked `backdrop-filter` layers (1.5, 5 and 14 px) under stepped mask gradients plus a white wash; 128 px tall at the top, 91 px at the bottom.
- **Entrance:**
  - Header: blur 6→0 in .5 s, staggered .12/.17/.28 s.
  - Cards: blur 12→0 in 1.1 s, fade in .9 s, scale 1.012→1 in 1.3 s, stagger .14 s.
  - Curve: `cubic-bezier(.22,1,.36,1)`, the same as our house curve.
- **Project open:** a click "genie" (.52–.68 s, blur 7, zoom 1.2).

**dmcg.co/archive.**
- Grid:
  - Columns: `repeat(3, minmax(0,1fr))`, gap 2.99vw/2.77vw, padding 8.33vw 4.83vw.
  - At 900 px and below: 2 columns, 12 px gap.
  - Tiles: 5 px radius on light grounds; most images 1.68:1.
  - Entry: rises `y 14→0` over .5 s, stagger .028 s.
  - Captions: 11/14 px at 40 % ink. That fails AA, so we do not copy it.
  - Clicking a tile opens a **lightbox**.
- A–Z rail. Floating filter bar of family pills (`aria-pressed`, group "Show work by type"). URL state through `URLSearchParams` and `replaceState`.
- Tree view: root pill "Catalog 106", family pills with counts, 1 px cubic-bézier SVG curves (ink at 11 %, active 44 %) fanning to thumbnails. Pills: 14.7 px radius, 14 px text.
- Font PP Neue Montreal. Label size `max(13px, .684vw)`, site edge 2.22vw, #fff/#000.

**michaelgatt.com/about.**
- Stack: Nuxt, GSAP 3.15 core and MotionPath, Lenis 1.1.16 at lerp .15.
- The whole page is **one pinned 2000vh scene**: scroll progress drives a paused GSAP timeline (a manual scrub).
- Sequence:
  1. Clip-path video reveal.
  2. "Michael is a Composer for All media", with key words large and connectors small.
  3. A mask-gradient text wipe; staircase words; letters scattering by 4–6 rem.
  4. Words travelling along SVG paths.
  5. A list of about 50 countries.
  6. Rotated videos.
  7. 22 images tilting with scroll velocity (`rotateY = clamp(v/30, ±50)`).
- A right chapter rail with labels.
- Footer nav as a sentence.
- Type: Zapf Humanist uppercase, tracking .35em, `clamp(20px, 2.33rem, 64px)`, on #000 with grey at 40 % and 20 %.
- **No reduced-motion handling and no aria on the split letters**: we must do better.

**The current site** has a busy mix of voices: lowercase Garamond nav, tracked uppercase Plex labels, the words "theme: light", a four-part meta strip and an 80rem boxed canvas. Its engine is sound and is reused:
- `js/site.js`: the `--p` driver (`naturalTop` :109, `fxItems` :119, `measure` :124, `fxUpdate` :133), Lenis 1.3.26 at lerp .08 (:186–247), the IO reveal (:152), the slideshow (:250), the `.inv` wipe (:352), the viewer/lightbox (:360) and the form (:548).
- Pipeline: `tools/build.mjs`, `tools/templates/{layout,pages,partials}.mjs` (`home` :29, `work` :162, `project` :200, `about` :307), `tools/lib/images.mjs` (`picture`, `dims`, `optStem`, `preloadFor`), `tools/media.mjs`, `tools/grounds.mjs`, `tools/qa.mjs` (passes `runMotionPass` :143, `runScrollPass` :184, `runHomePass` :259) and `tools/perf.cjs`.

---

## 3. Design direction "Reel" (logged as D90+ at execution)

| Topic | Decision | Reason | Rejected |
|---|---|---|---|
| Voice | One sans voice for all UI and text: sentence case, regular weight, label `max(13px, .7vw)`, body 16–17 px. No tracked uppercase labels. EB Garamond capitals (tracking .3em) only in the About narrative, the research title and the film chapters. | dmcg's calm is one voice. Garamond is already shipped, so the Gatt register costs no extra bytes. | A Zapf/Optima clone: a third font for one page. |
| Sans face | **Instrument Sans** (OFL, variable), self-hosted latin and latin-ext woff2, replacing IBM Plex Sans. Licence and bytes are verified in P1 and UNVERIFIED until then; the fallback is Hanken Grotesk. | Closest open-licence relative of Neue Montreal; byte cost about the same as Plex. | Neue Montreal (commercial licence); Inter or Geist (the generic developer look CLAUDE.md warns against). |
| Field | #fff/#111 and the dark scheme are kept. Radius tokens: 6 px tiles, 8 px cards and lightbox, 999 px pills. One soft card shadow. | Matches dmcg; the dark scheme is an existing owner requirement (D47). | An accent colour (D34). |
| Header | **Left:** About, Research, Contact. **Centre:** name block "Hazem Radhouani / Architect" in two lines at 17–20 px. **Right:** Projects/Index pill switcher (`aria-pressed`) and a theme icon button. Targets ≥44×44. | dmcg structure. Research stays because committees are audience #1. The owner asked for the name "centred, smaller, clear". | The 32–60 px name (D89), superseded by the reference he calls exactly what he wants. |
| Corner captions | Fixed bottom-left "Architecture, survey and visualisation"; bottom-right "Tunisia · France · Morocco · Japan". | Identity at a glance, from D45 facts. | "Based in…": C18 is open. |
| Footer | Gatt sentence nav on every page: "See the **work**, the **research**, read **about** me, or **get in touch**." | One memorable gesture bridging both references. | A link grid. |
| Edges | A reusable `.edge` (three backdrop layers plus a field-coloured wash), top and bottom on the home and index pages. `prefers-reduced-transparency` gets the wash only. | Orientation: content melts at the edges and the fixed UI stays legible. | Opaque bars. |
| Engine | Extend the existing `--p` driver in vanilla JS; **no GSAP**. Lenis stays on fine pointers (lerp .08). The driver also runs on touch, compositor properties only. CSS `offset-path` for words on a path. | Already QA'd, about 6 KB more. Lenis already smooths the value everything reads. | GSAP plus MotionPath (about 90 KB) for what the driver and offset-path do; CSS scroll timelines (they bypass Lenis smoothing and Firefox support is partial). |
| No crop | D32 stands. Tiles are fixed 4:3 frames with the image **contained** on its project ground, inset 8 %. | dmcg tiles are objects on tinted grounds; drawings are never cropped. | `object-fit: cover`. |
| Transitions | Cross-document View Transitions: a home item or index tile morphs into the case-study hero. Firefox gets plain navigation. | dmcg's genie morph, for orientation. | A SPA router. |
| Reversals | D36 (filters removed) and D21 (no hover effects) are partly reversed: families return, and a cursor label pill is added (still no hover zoom). D89 is superseded. | The owner's explicit references (precedent D79). | — |

---

## 4. Execution prompts (run in order; each ends with build, QA, commit and decision-log entries)

**Standing rules for every prompt:**
- Read before editing, and answer GateGuard's fact prompts.
- Commits are the "backup" the brief asks for (logged).
- Never stage `docs/01/`, `docs/KHOA VU/`, `docs/Images/`, `docs/Scroll map.txt` or `docs/Screenshot*`.
- Verify with screenshots from `tools/qa.mjs --shots` in headless Playwright, not the DevTools window (it runs rAF at about 1 fps when occluded).
- Every report states what was tested, how, and what was not.

### P1 — Foundations: voice, tokens, chrome, safety
```
/goal Lay the Reel foundations without changing page content.
1. Check that the branch is flagship-upgrade and the tree is clean. Add to .gitignore:
   docs/01/, docs/KHOA VU/, docs/Images/, "docs/Scroll map.txt", docs/Screenshot*.
   Reason: GitHub Pages would publish other people's sites and the owner's raw phone photos.
2. Copy sections 2–3 of this plan to docs/flagship/17-reel-direction.md. Log D90+.
3. Font. Download the Instrument Sans variable woff2 (latin, latin-ext) from its official
   OFL source and record the licence and byte size. Add @font-face with a measured
   size-adjust fallback. Remove the IBM Plex Sans files and rules (removal logged).
4. Tokens in css/site.css: the label, body and display sizes; radius 6/8/999; --shadow-card;
   --edge-top 8rem and --edge-bottom 5.75rem; --site-edge max(1rem, 2.2vw).
   Delete the tracked-uppercase label styles.
5. layout.mjs: the new header; corner captions (home and index only); the sentence footer;
   the .edge component (aria-hidden).
   Page-load entrance on the house curve: header blur 6→0 in .5s, staggered .12/.17/.28s.
   No entrance under reduced motion.
6. @view-transition { navigation: auto; }, plus the naming hooks.
Done when npm run build and npm run qa are green at 6 widths in both schemes, and the
header and footer screenshots at 375 and 1440 (light and dark) are reviewed against dmcg captures.
Review: an ecc:a11y-architect subagent on the header, switcher and footer markup.
```

### P2 — Engine v2: scroll-linked primitives in `js/site.js`
```
/goal Make the --p driver the scroll-linked engine for every page.
Extend fxItems, measure and fxUpdate. Keep ES5 and a single rAF loop.
a) data-fx="track": a tall section with a sticky stage. Writes --p (0..1 across the track)
   and data-chapter from data-steps. Steps are given in the markup and never computed from text.
b) data-fx="centre": writes --d (-1..1), the item's distance from the viewport centre.
   CSS maps it to scale(1 - .12*|d|), opacity and blur(calc(6px*|d|)) on the inner media.
   Blur applies to at most 3 visible items.
c) data-scrub on a <video>: each frame, t += (p*dur - t)*0.12; set currentTime only when the
   change exceeds 1/60 s; the video stays paused. Load it on idle after the load event.
   Use the poster only when navigator.connection.saveData is on, or when no seek lands within
   1.5 s (log it to the console).
d) data-scatter word: letters are wrapped aria-hidden. Each gets seeded offsets
   (mulberry32 keyed on the word) as --x, --y and --r, and CSS lerps them by (1 - p).
   The parent keeps aria-label.
   data-path: offset-path plus offset-distance from --p, with a static fallback.
e) data-velocity: write a clamped and eased scroll velocity as --v (±1).
   It is used only for a small tilt of at most 12° (Gatt's "momentum").
f) Chapter rail: aria-current="step" follows the active chapter.
g) html.fx now applies on touch too. Lenis stays on fine pointers only.
   Under reduced motion or with no JS, every variable sits at its final state, nothing is
   hidden and no video loads.
QA passes in tools/qa.mjs:
- track --p is monotonic forward and back;
- the scrub currentTime settles within 0.25 s of its target;
- scatter accessible names are intact;
- reduced motion leaves no transforms.
Done when QA is green and a 1440 performance trace shows no task over 50 ms while scrolling.
Skills: ecc:motion-foundations; superpowers:test-driven-development for the pure helpers
(seeded random, chapter index, lerp, clamp). The helpers are tested in the QA pass, or in
tools/tests if they are factored into tools/lib.
```

### P3 — Film assets from the owner's films (no generation)
```
/goal Produce the scrub films and posters from videos/*.mp4.
1. Make 1 fps contact sheets of zenata.mp4. Find the longest single continuous camera move
   that is at least 8 s long, has no title card, no crossfade and no text, and starts on a
   frame where the whole station reads at a glance (this frame becomes the poster and the LCP).
   If there is none, use sidi-maarouf 30.6–64.9 s, captioned from content/pages/motion.json.
   Do the same for sentry (0–12.6 s), which goes in the home column.
2. Encode with ffmpeg only (D12):
   - desktop: native 1280x720, H.264 high, yuv420p, CRF 20, -g 8 -keyint_min 8
     -sc_threshold 0, no audio, +faststart;
   - mobile: 640x360, CRF 24, -g 4.
   The poster is the first frame of the encoded desktop clip, processed through
   tools/media.mjs (AVIF/WebP, with dims).
3. Write the clips to videos/scrub/<slug>-{desktop,mobile}.mp4. Budget: desktop ≤ 6 MB,
   mobile ≤ 1.5 MB. Segments are 12–15 s; -r 24 is allowed. If over budget, raise CRF by 2
   each step up to 28, then shorten the segment; never reduce the size (A3).
4. Log the segment times, why they were chosen, and the frame checks.
Done when a QA probe of 100 random seeks shows p95 seek-to-frame ≤ 120 ms, forward and
back, and the posters have been inspected at full size.
```

### P4 — Home "Reel"
```
/goal Rebuild index.html as film stage → project column → index coda.
Templates: home() in tools/templates/pages.mjs. Content: content/pages/home.json, rewritten as
{ film, chapters[], column[{ project, media, alt, mode }] }.

§1 Film stage (data-fx="track", 320vh on desktop, 220vh on mobile).
   - The poster is the LCP: preloaded, fetchpriority high, explicit dimensions.
   - The frame starts centred at min(56vw, 64rem) with an 8px radius and the card shadow
     (dmcg card). It grows to min(100vw - 2*site-edge, 1280px) by p = .35. Never above the
     native width (upscale gate).
   - Time scrubs across p 0..1.
   - Four chapter captions in real HTML fade in order in the bottom-left slot:
     "Hazem Radhouani, architect." / "Project work in Tunisia, France and Morocco." /
     "Research experience in Japan." / "<film project>, <place>, <year>. <office>.",
     plus the honour only if it is in the ledger.
   - A right tick rail, the same component as on About.
   Purpose: orientation (who and where) while the work itself moves.
§2 Column (dmcg).
   - The 15 projects in site order. Each is a link whose name is title · place · year,
     data-fx="centre", with its media scrubbed by --p while crossing the centre band:
     · mode "film": the sentry scrub clip;
     · mode "pair": the hero render dissolves into the project's key drawing cutout (axo or
       plan). Both are contained at natural ratio, never cropped. Purpose: shows each project
       as built image and as drawing, which is BIM and survey evidence.
   - Renders sit on cards; cutouts sit directly on the field like dmcg objects.
   - Bottom-centre caption "07 / 15  Belhomme · Paris 18th · 2025–2026", aria-hidden.
   - Cursor label pill on fine pointers; .edge layers at top and bottom.
   - Click: a view-transition morph into the case-study hero.
   - On load, the first card does the dmcg entrance (blur 12→0, scale 1.012→1, 1.1–1.3s).
§3 Coda: the tree root "Index N" with family pills ("Drawings n · Renders n · Films n"),
   counts computed at build and linking to the index views.
Reduced motion or no JS: the poster and chapters as paragraphs, then a plain vertical list.
Touch screens follow A4.
Done when QA and the home pass are green:
- the scrub works both ways;
- chapters appear in order;
- the caption tracks the centre item;
- Tab passes through all 15 items with visible focus, and focus brings each to the centre;
- reduced motion is still and complete.
Perf on throttled mobile: LCP < 2.5s, CLS < 0.1.
Skills: frontend-design, anthropic-skills:emil-design-eng.
```

### P5 — Index (works): `architecture.html` keeps its URL, titled "Index"
```
/goal Build the dmcg catalog of the owner's work.
Data: build.mjs assembles the catalog: every project hero and figure, plus the films on the
motion page. Each entry has { project, title, kind (drawing|render|film), src, dims, ground,
href }. Family counts come from the data, never typed.
The static HTML holds every view; JS only toggles them. State lives in ?view=&family= via
URLSearchParams and replaceState, and is restored on load.
- grid (default):
  · 3 columns above 900px, 2 columns below it down to 320.
  · gap ≈ 3vw, 12px on mobile.
  · 4:3 tiles with a 6px radius on the project ground (data-ground). The image keeps its
    natural ratio, fitted to at most 84% of the frame and centred, with no object-fit (A10).
  · Captions 13/16 at ink-2 (AA), ink on hover or focus.
  · Left A–Z rail on desktop, showing only letters that exist.
  · Tiles are data-fx="centre" with a scrubbed rise (y 14→0) and scale .96→1.
  · Clicking a tile opens the existing viewer/lightbox (site.js :360): 8px radius, keyboard
    prev and next, a 44px close button and a "View project" link.
- tree (≥48rem, otherwise falls back to grid): root pill → family pills with counts → 1px
  cubic-bézier SVG curves (ink 11%, active 44%) → thumbnails on a deterministic jittered
  layout computed at build.
- list: a semantic <table> with a caption and the columns No., Project, Place, Year, Type,
  Office, Figures. Hovering a row shows a thumbnail pill. This is the committee scan view.
Floating bottom bar: a family group (aria-pressed, labelled "Show work by type") and a view
group, pills with a 999px radius, sitting over the .edge.
Changing a filter runs a same-document startViewTransition (tile view-transition-names);
under reduced motion it is instant.
The old per-project chapters on this page are removed (D36 reversal logged).
Done when QA and the index pass are green:
- every view and family works by keyboard;
- the URL round-trips;
- counts equal the data;
- no crop or upscale;
- axe is clean;
- INP of a filter click is < 200ms on throttled mobile.
```

### P6 — About: Gatt × dmcg
```
/goal Rebuild about.html as a scroll-told biography followed by a calm reference CV.
Photos: copy (never move) docs/Images/* into images/about/.
- Normalise EXIF orientation and strip all metadata. Verify by a byte scan that no
  Exif or GPS block remains.
- Cap at 2560 px, then run node tools/media.mjs images/about.
- Alt text describes the photo. Name Hazem only where the photo itself identifies him
  (the portrait, the certificate); leave group photos unnamed.
Structure:
- The header, then a scroll-scrubbed circle wipe from the field to the dark ground (the .inv
  component, now driven by --p). The narrative is on the dark ground in both schemes (A11);
  the CV returns to the field.
- A right chapter rail at ≥48rem: ticks and a label, as nav "About chapters" with anchors.
- Chapters, each a data-fx="track" about 150vh tall.
  Type: EB Garamond capitals tracked .3em. Key words clamp(22px, 2.4vw, 40px) in full ink;
  connectors at 13px in --connector, ≥4.5:1 (A11). Split letters follow A12. Every fact
  comes from about.json or the content ledger.
  0 "HAZEM RADHOUANI is an ARCHITECT". Portrait ("Just sitting") at min(36vw, 28rem),
    scrubbed from grey to colour and from scale 1.04 to 1.
  1 ENAU, Université de Carthage; National Architecture Diploma, Highest Honours,
    11 February 2026. The graduation panorama at natural ratio, scrubbed scale .9→1, never cropped.
  2 Thesis: "AL-ARG" as a data-scatter word gathering, linked to its case study.
  3 Practice: the cities and offices travel on a data-path curve, then settle into a
    Gatt-style list that highlights each line as it passes:
    Tunis 2023 · Casablanca 2024–2025 · Paris 2025–2026.
    If the 2020–21 entry conflict is still open in the ledger, withhold that entry.
  4 Japan: the Sakura Science Program 2025, in the ledger's wording.
    Three tilted photos (−4°, 3°, −2°) drift at different scrubbed rates.
    Resolve "Tokyo" (research.json :74, al-arg.json :29) against "Saga University & Waseda
    University" using the ledger; if it stays unresolved, [CONTENT NEEDED].
  5 Capabilities, from the CLAUDE.md identity and about.json skills: survey, BIM/Revit
    delivery, Unreal Engine, D5 Render, PBR material capture, rehabilitation, infrastructure.
    Then a strip of the 15 project heroes linking to the case studies, tilting by --v
    (at most 12°).
- Reference CV on the field (dmcg-calm): experience, education, distinctions, skills,
  languages, the CV download, and contact (email, LinkedIn, the existing form).
- Print layout preserved: npm run cv must still give the 2-page A4.
Done when QA and the about pass are green:
- the rail follows the scroll;
- scatter and path text keep their accessible names;
- reduced motion shows every chapter statically;
- the CV PDF is regenerated and inspected.
Screenshots at 6 widths reviewed.
```

### P7 — Coherence: case studies, research, motion, 404
```
/goal Carry Reel across every other page.
- Chrome and type come from P1.
- Case-study plates: the IO reveal becomes a scrubbed rise driven by --p.
- Heroes take the shared view-transition-name.
- Each case study ends with a 100vh "next project" track: the next hero card grows from the
  centre and its caption scrubs in. It is a link; navigation never happens automatically.
- Motion page: dmcg cards that play muted on hover or focus and pause otherwise, with posters.
- Research page: the Garamond-caps title chapter.
Done when QA is green on all 22 pages and all 8 perf pages are within budget.
```

### P8 — SEO, share cards, CV
```
/goal Regenerate the derived outputs and recheck them.
- npm run og: new cards in the new voice, inspected visually.
- npm run cv: inspected.
- Titles and descriptions are unique.
- Person and CreativeWork JSON-LD are unchanged in substance.
- Sitemap and canonicals are checked; the Index keeps its URL.
```

### P9 — Independent review, gates, PR
```
/goal Prove it, then ship it.
1. Fresh-eyes design reviewer: a general-purpose subagent given only images.
   - Inputs: reference captures (dmcg home, archive grid, tree, Gatt about at 1440) and our
     screenshots at matching scroll positions.
   - One question: "Same design family and finish level?" Answer PASS or FAIL, with at most
     3 issues ranked by impact.
   - Fix and repeat for at most 5 rounds. Stop early if a round does not visibly improve.
2. Reviews, with fixes applied in one batch and logged:
   - ecc:a11y-architect: WCAG 2.2 AA on the new components;
   - ecc:code-reviewer: site.js and the templates;
   - ecc:performance-optimizer: the perf output.
3. Gates: npm run qa (6 widths × 2 schemes, and the motion, scroll, home, index and about
   passes), npm run perf (median of 3, throttled mobile), node --test tools/tests.
4. Push and open a PR from flagship-upgrade to main containing the gate results and the
   [CONTENT NEEDED] list. Merge when it is green (CLAUDE.md). Update the memory note
   portfolio-site-state.
```

---

## 4b. Binding amendments from the feasibility review (they override the prompt text above)

- **A1 — Track progress.** Tracks use their own formula: `p = clamp((y − top) / (h − vh))`. Height is measured from a stable `lvh`/`clientHeight`, not `innerHeight`, because the iOS toolbar changes it. The current formula at `site.js:136` would leave p ≈ .24 at load.
- **A2 — Scrub loop.**
  - The driver gets its own rAF that runs while any eased value is still settling, then stops.
  - A new seek starts only when `!video.seeking`; use `requestVideoFrameCallback` where it exists.
  - The video is `muted playsinline`, primed once with `play().then(pause)` after `loadeddata`.
  - The poster is a real `<img>` (AVIF/WebP srcset) under the video, which is revealed on its first `seeked`.
  - Safari/iOS behaviour is **UNVERIFIED**: there is no WebKit with H.264 on this machine. Say so in every report.
- **A3 — Film budget.**
  - The segment is capped at 12–15 s, with `-r 24` allowed.
  - CRF stops at 28; past that, shorten the segment.
  - The Sidi Maarouf fallback uses a 12–15 s window inside 30.6–64.9 s.
- **A4 — One touch rule.**
  - Fine pointer: everything, with Lenis.
  - Touch at ≥48rem: scrubbed film (mobile clip) and centre transforms, but no item blur and no backdrop layers (one gradient wash instead).
  - Touch below 48rem: the film plays muted inline on loop while the stage is visible; chapters and column transforms stay scroll-linked (opacity and transform only).
  - Reduced motion: still.
  - Add a 375 px Playwright pass with `hasTouch`/`isMobile`.
- **A5 — Paint budget.**
  - `fxUpdate` touches only items near the viewport (an IO-maintained active set) and skips hidden views.
  - The body ResizeObserver re-measures only after layout-changing events, debounced.
  - View-transition names go only on on-screen tiles (≤24), set just before the transition and cleared after.
- **A6 — Lightbox.**
  - `data-viewer` goes on grid tiles only.
  - `links` is rebuilt from the visible tiles after each filter change.
  - The dialog gets a "View project" link (`data-href`, updated in `label()`), added to `layout.mjs:103`.
  - Film tiles link to `motion.html#<id>` instead of opening the viewer.
- **A7 — Anchors.** One exported figure-anchor helper in `partials.mjs`, used by both `project()` (`pages.mjs:206,232`) and the catalog. Heroes get an anchor too. The build fails on any catalog href without a matching id.
- **A8 — Column media.**
  - `home.json` names an explicit `column[].key` cutout per project, chosen by viewing the cutouts.
  - Projects with no suitable single drawing use mode `single`: the hero only, scrubbed scale and position. This covers hay-mohammadi (0 drawings) and any project where no axo or plan reads alone.
  - Cutouts render through `image()`, so the dark-scheme treatment and the QA dark check still apply (`partials.mjs:63-64`).
  - The build fails if a key is missing from `images/cut/`.
- **A9 — QA rewritten in the same commit as the change.** Each prompt rewrites the checks its change breaks:
  - the theme-label checks (`qa.mjs:467-476`): the theme button keeps a visible or visually-hidden text name;
  - the old-home checks (`:271-328`, `:408`);
  - the motion pass's `.rv-g` and `.nw` scale rules (`:158-169`);
  - the `#bar` check in the scroll pass (`:226`).
  
  Also add a ≥24×24 target check for the A–Z and chapter rails; links inside `<li>` are skipped today (`:367`).
- **A10 — Tiles pass the crop and colour gates.**
  - Each image keeps its natural ratio (fitted to at most 84 % of the 4:3 frame) and is centred. No `object-fit`.
  - The colour gate's `.seq__plate` exemption becomes a general `[data-ground]` exemption (`qa.mjs:399`).
  - Washes are gradients built from tokens.
- **A11 — About grounds.**
  - The narrative sits on **the dark ground** (`#121311`, with `#F7F5EF` text) in both schemes, not on "ink", which is near-white in dark mode.
  - Add a `--connector` token measured at 4.5:1 or better on that ground, replacing ink-2 for the 13 px connector words.
- **A12 — Split text.** Reuse the existing `words()` pattern: the real text sits in a visually hidden span and the letters are `aria-hidden`. There is no `aria-label` on generic elements (it trips axe `aria-prohibited-attr` and the content check at `qa.mjs:39`).

## 5. Content gaps (listed, never guessed)

- `[CONTENT NEEDED: where he is based]` (C18). This is why the corner caption names the places he has worked, not a base.
- `[CONTENT NEEDED: Sakura Science host institutions]`, if the ledger cannot settle "Tokyo" vs Saga/Waseda.
- `[CONTENT NEEDED: whether to name him in the two group photos]`.
- Still open in the ledger: Sentry surface, the 2020–21 CV entry, higher-resolution renders, film captions, EU analytics consent, web/app material.

## 6. Conflicts resolved (to log)

1. **Scroll map vs CLAUDE.md content truth:** no generated imagery. The owner's own films replace it, as he instructed.
2. **The brief's backups folder vs git:** commits on the branch are the backup.
3. **D89 (name at 32–60 px) vs the dmcg reference:** a centred two-line name block at 17–20 px. It is still centred and clear, and no longer huge.
4. **D21 and D36 vs the dmcg pill and filters:** partly reversed. D32 (no crop) holds: tiles contain their images rather than cropping them.
5. **Gatt's 40 % captions and missing reduced-motion support vs WCAG:** AA contrast tokens, aria on split text, a full reduced-motion path.
6. **The brief's 1920 screenshot vs CLAUDE.md's six widths:** 1920 is the review size and the six widths are the QA gate.
7. **Lenis vs touch:** touch scrolls natively, and the scroll-linked transforms stay active.

## 7. Verification (end to end)

- `npm run build`, then `npm run serve` in the background, then `npm run qa -- --shots`. The new home, index and about passes cover:
  - the scrub is monotonic both ways;
  - chapter order, and the rail's `aria-current`;
  - filters by keyboard, and URL round-trips;
  - reduced motion is still;
  - no crop or upscale;
  - axe AA.
- `npm run perf`: on throttled mobile, LCP < 2.5 s and CLS < 0.1, plus a scripted INP probe on index filter clicks.
- No-server mode: `node tools/qa.mjs --base=file:///C:/Users/Hazem/Desktop/portfolio-main/`.
- Visual: Playwright screenshots at 320, 375, 768, 1024, 1440 and 1920, in light and dark, at 0/25/50/75/100 % scroll of each new page. I view them, and so does the fresh-eyes reviewer, next to the reference captures.
- Feel: a 1440 performance trace while wheeling through the home both ways. Motion must start on the first wheel tick, with no task over 50 ms.
