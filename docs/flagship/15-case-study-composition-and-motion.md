# 15 · Case-study composition and site-wide motion (D73–D78, 2026-10-21)

## 0 · The enhanced brief (the prompt, rewritten for best input and output)

> **Mission.** Re-compose all 15 case-study pages (`projects/project-*.html`, built from `content/projects/*.json` by `tools/templates/pages.mjs`) and refine every animation on the site, so that a graduate committee or a firm grasps each project in 10 seconds and can read it in 2 minutes.
>
> **Composition goals.** Each page should (1) state what the project is in one plain sentence above the fold, (2) give the key facts as a scannable title block, (3) tell the project in numbered chapters (site → organisation → structure → movement → views), and (4) put every image beside the words that explain it. Every placement follows a written rule; nothing is placed "because it looks good".
>
> **Motion goals.** One house curve, gentle and decisive. The page title rises from a mask. Plates rise from their ground line. Chapter rules draw in. Page-to-page morphs. Each animation has a purpose (orientation, feedback or hierarchy). It is compositor-only, never blocks content and never delays LCP. Under `prefers-reduced-motion` every movement goes; only a short opacity crossfade between pages remains.
>
> **References** (study, don't copy):
> - **format.obys.agency**: an outline-numbered taxonomy, masked line reveals, one ease family, short staggers.
> - **heronaiapp.com**: the page as a drawing sheet, with hairline title-block cells, key : value metadata and numbering.
> - **huyml.co**: cinematic restraint. A title, one paragraph, meta rows, a stack of wide images, then "next project"; one UI curve and one transition curve.
> - What they share, measured from their source: `cubic-bezier(.22,1,.36,1)`, masked reveals, numbered key/value meta, and weak reduced-motion support. **We must do better on the last.**
>
> **Constraints (CLAUDE.md and decision log):**
> - No invented text. Reuse existing narrative, captions, summary, spec and tag.
> - No crop and no upscale (D32). No hover zoom (D21). No smooth-scroll library and no parallax (D38).
> - Dark treatments (D69), keys (D71) and labels (D49/D57/D68/D70) stay intact.
> - WCAG 2.2 AA. LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
> - Zero runtime dependencies. Every QA gate stays green at 320/375/768/1024/1440/1920 in both schemes.
>
> **Output:**
> - Small commits on `flagship-upgrade`.
> - Decision-log entries D73+ (with conflicts logged).
> - The plan copied to `docs/flagship/15-case-study-composition-and-motion.md`.
> - A QA/perf report stating what was tested and what was not.
> - A PR to main once the gates pass.

## 1 · Context: why, and what exists

**Current case study** (`pages.mjs` `project()`, viewed at 1440):
- One centred column: run label, h1, hero, descriptor, spec `dl`, a "Project" prose block, then 8–16 centred plates with centred captions, then next project.
- **Problems.** At 1440×900 the fold shows only the name and the office. `x.summary`, the plain one-line "what is it", is only used in the meta description, so the 10-second test fails. All the prose sits before all the drawings, so the reader must match paragraphs to plates. Narrow and four-column plates (30 of the plates) float in empty margins. Every element has the same weight and rhythm; there is no chapter structure.
- **What works and stays:**
  - spanFor/planRow sizing (no crop, no upscale, D32);
  - cutouts and dark treatments (D69);
  - re-set labels and keys (D49, D71);
  - the viewer that grows from its thumbnail on a spring (D38);
  - the tokens, the two type voices (D33) and no accent colour (D34).

**Motion today:**
- **House curve and spring:** `--ease-out` is expo-out `cubic-bezier(.16,1,.3,1)`; `--spring` is a `linear()` spring.
- **Arrival:** below-fold groups fade and rise 16 px over 700 ms after their images decode (`js/site.js` arrival module, `.rv/.is-in`).
- **Page changes:** cross-document view transitions crossfade (200/320 ms) and morph titles and heroes (`vtTitle`, `vtHero`).
- **Elsewhere:** the menu, the bar, link underlines, the viewer spring and crossfade.

**References, measured** (from each site's source and live in Chrome):

| Site | Essence taken | Rejected (and why) |
| --- | --- | --- |
| Format (Obys) | Outline-numbered specimen taxonomy (1 / 1.1); masked line reveals; one ease family; 60–85 ms staggers | Lenis smooth scroll; scrubbed image parallax (needs overscan, i.e. a crop, which breaks D32); pixel-canvas reveal |
| Heron | The page as a drawing sheet: hairline cells, key : value title block, bracketed numbering | Mono font (D33: no new fonts); accent orange (D34); Barba/Lenis; preloader |
| huyml | Title → one paragraph → meta rows → image stack → next project; one UI curve `(.22,1,.36,1)` plus one slow in-out for transitions | Black title card that delays content; blur reveals (filter cost, and they clash with the dark-mode filters); custom scroll |

All three share the curve `(.22,1,.36,1)`, masked reveals and numbered key/value meta. All three neglect reduced motion.

## 2 · Composition: the "rail and copy" sheet (case studies only; at ≥64rem)

**Axes.** The page has exactly two left edges on the existing 12-column grid: **col 1** and **col 4**.
- **Rail** = `1 / span 3`: chapter numbers and titles, figure captions, key titles, the "Role" and "Project" labels.
- **Copy** = `4 / span 6`: sentences.
- **Plates** use a case-study span ladder (`spanFor(w, h, { ladder: CASE })`) that either fills the row or starts at col 4:
  - `full` = 1–12;
  - `nine` = 4–12, a new 9-column span that replaces `wide` (10 columns) on case pages only;
  - `text` = 4–11, `narrow` = 4–9, `four` = 4–7.
  - The ladder keeps the same no-crop and no-upscale rule (D32). Plates that were `wide` become about 9 % narrower; the viewer still gives full size.
  - `sizesFor` learns `nine` (12 → 9 columns, 8 → 8).
- Home, work and research keep the centred ladder.
- Below 64rem everything stacks flush-left: titles first, plates on their current 8/4-column spans.

**Why** (tested by a mock in Chrome at 1440): with a centred hero the fold showed three left edges (title at col 1, summary at col 4, hero at col 2). Docking the hero at col 4 made one clear composition: the name on the rail edge, and the explanation and the evidence on the copy edge. It is also the convention of the architectural monograph (marginal titles, a text column, plates hung from it). The title-block cells (3 columns each) fall on the same lines.

**Page order:**
1. **Opening** (must pass the 10-second test at 1440×900 and at 375×812):
   - the office and city line (`x.run`) across the full row: in the 3-column rail it wrapped badly in the mock;
   - h1 at display size, flush-left;
   - the summary (`x.summary`, existing text) as the lead on the copy axis, then the honour if any.
   - Then the hero on the case ladder: it docks at col 4 unless it is `full`. It stays the LCP image at high priority; `preloadFor` gets the recomputed `sizes`, and its view-transition name is kept.
2. **Title block** (Heron's essence, an architect's title block). It has its own builder, `titleBlock(x)`, and class `.tb`. The shared `spec()` and `.spec` stay as they are, because books.html uses them (`pages.mjs:13`, `pages.mjs:222`).
   - A header strip **outside** the `dl` (a `dl` may only hold `div > dt + dd`; anything else fails axe): `x.descriptor` at left, `x.tag` at right, under a 1 px `--ink` border.
   - Then a `dl` on a 12-column subgrid that does **not** carry `.g`, because the grid gate would read `subgrid` as NaN. The spec cells are 3 columns each (4 per row; 2 per row on 8 columns; one column below 30rem, as now), each under a 1 px `--line` border.
   - Then **Contents** (rail label; numbered chapter links in 2 columns on the copy axis, 44 px targets), when there are 3 or more chapters.
3. **Quote**: large italic, `4 / -1`. Belhomme's 117 characters would run to 6 lines in 6 columns. Then **Role**: the rail label with the list on the copy axis. Then **Overview** (general paragraphs only; see Data).
4. **Chapters** (Format's taxonomy). Each is a plain `<section>`, never `.wrap.g` (nesting a second `.wrap` would double the margins, push the figure edges off the grid lines and make them narrower than their `sizes`). Its head is a `.wrap.g` row:
   - a full-span `.ch__bar` element with a `border-top` (a real element with a border, so it is neither a stray `::before` grid item nor a background colour that would fail the palette gate);
   - `01` (aria-hidden) and the h2 title on the rail;
   - the chapter's own paragraphs on the copy axis;
   - then its plates.
   - No prose is written; the paragraphs only move.
   - The film becomes the last numbered chapter.
   - **Rhythm** (from the mock): chapter to chapter `--gap-chapter`; chapter head to its first plate `--s7` (48 px), so the words bind to their evidence; plate to plate `--gap-group`.
5. **Plates:**
   - **A plate that starts at col 4** (`nine`, `text`, `narrow`, `four`) has its caption **beside it on the rail**, bottom-aligned: the title in the label voice over the caption in Garamond, meeting the drawing's ground line as a title does on a sheet.
   - The plate and its caption share one grid row with `align-items: end`, so their ground lines meet.
   - A caption longer than 240 characters (title plus text) is never put beside its plate; it goes below as a row. At 1024 the rail is about 205 px, so Tamansourt's 355-character caption would run to 12 lines, taller than its plate.
   - Below 64rem, the figcaption and the key take the plate's own span class, so they align under the plate's left edge at 768.
   - **A full-width plate or series** has its caption below it as a row: the title on the rail, the text on the copy axis.
   - **Keys** always sit below, as a row: the title on the rail, the entries on the copy axis. Long entries take 2 columns of 3 grid columns, short ones 3 of 2, and up to 3 short entries stand on one line. Columns stay on grid lines, so D71 holds.
6. **Next project:**
   - rail: "Next project" and "n / 15";
   - the title large;
   - the descriptor;
   - the next hero docked to the copy axis, keeping `hero-<slug>` so it morphs into the next page.
   - The title link is `inline-block`. A wrapped inline link has several fragments, and a view transition does not capture those, so the morph would be lost silently.
   - Its words are not split, because underlines do not carry into inline-block children.

**Data** (the lighter model the review proposed; it is contiguous by construction and needs no new SKIP key):
- Each `content/projects/*.json` gains `"chapters": [{ "title": "Plans and sections", "from": "<title of the chapter's first figure>" }]`. A chapter runs from its `from` figure up to the next chapter's `from`.
- The figure order is **not changed**, so `heroPartner()`, the Work previews and the `fig-n` ids stay as they are.
- A narrative paragraph may carry `"chapter": "<chapter title>"` when it describes that chapter's plates.
  - A general paragraph (Al-Arg P0 "Degree thesis awarded Highest Honours…", Bolivar P0 the programme) carries none.
  - It stays in an **Overview** row after Role (rail "Project", text on the copy axis), and is never forced into a chapter.
- The build validates on `figs`, the figures left after the hero partner is removed. It throws when:
  - a `from` is not exactly one figure title;
  - the first chapter does not start at the first figure;
  - a paragraph names an unknown chapter.
- **Fewer, broader chapters.** Aim for 3–5 per project, each holding 2 or more plates where the material allows (e.g. Aïn Sebaâ: Site · Plans and sections · Structure and flows · Views). A one-plate chapter would only repeat that plate's title.
  - Numbers appear from 2 chapters, Contents from 3.
  - Hay Mohammadi (2 renders) gets one chapter, shown with no number and no contents.
- **Each chapter title must be supported by its own plates' titles, captions or sources.** "Survey", "Existing state" or "Process" appear only where a plate says so (e.g. Belhomme "Existing facades survey", Corallum "Formal research").

## 3 · Motion: one family, every animation with a purpose

**Tokens** (`css/site.css` `@layer tokens`):
- `--ease-out`: `cubic-bezier(0.22, 1, 0.36, 1)`, the house curve. All three references share it, and its gentler start velocity than expo-out reads as "eased and smooth".
- `--ease-in-out`: `cubic-bezier(0.77, 0, 0.175, 1)`, used only for on-screen morphs.
- `--spring`: unchanged, viewer only.
- UI durations stay at 300 ms or less. Only the once-per-element arrivals run long (900–1100 ms), because they carry hierarchy rather than responding to input.

| # | What | Purpose | Spec |
| --- | --- | --- | --- |
| M1 | Cross-document view transition | orientation | Old root fades out in 200 ms. New root fades in and rises 12 px over 520 ms on the house curve. The hero groups morph over 600 ms on the in-out curve. **Title morph:** the case h1 gets `width: fit-content`, and its old and new snapshots use `height: 100%; object-fit: none; object-position: left top`, so the title moves and crossfades without being scaled about 3× (the review flagged blur at that scale). This is UNVERIFIED until seen. Fallback: drop `vtTitle` on case h1s and let the hero morph orient the reader, and log it. |
| M2 | h1 word rise | hierarchy (the name arrives first) | h1 only, on every page. Chapter titles, links and the menu are not split: underlines break on inline-block words, and nothing there needs it. The build splits the h1 into `<span class="w"><span class="w__i" style="--w:n">word</span></span>`, with real spaces between. `.w` is inline-block with `overflow: clip`, `padding-block: .25em` and an equal negative margin (tested: "AÏN SEBAÂ" is not clipped). Each word rises from 110 % over 700 ms, 40 ms apart, so it is done in under 0.9 s and 80 % visible in under 0.2 s. It plays on load in CSS. An inline `pagereveal` listener in `<head>` adds `.vt-arrived` to skip it when the h1 arrived by an M1 morph. |
| M3 | Plate rises from its ground line | hierarchy and identity | On arrival the `.nw` wrapper runs `translateY(100%) → 0` with `overflow: clip`, while `.nw > :is(picture, img)` (the image and the keep layer, never `span.vh`) runs `translateY(-100%) → 0`. Both use the same duration, curve and delay, so the image stays still while its mask rises, and the viewer's `sourceRect` stays correct. Compositor-only; it never animates `filter` (D69) and never `translate` on `.lab__pin` or `.lab__item`, which use it for centring. 1100 ms; cells 90 ms apart (`--i`). Never on the hero (LCP). |
| M4 | Chapter rule draws | hierarchy (marks the chapter boundary as it arrives) | `.ch__bar` scales 0 → 1 from the left over 900 ms. Title-block rules stay static; the block sits near the fold. |
| M5 | Text follows | hierarchy | The chapter number, title and paragraphs, captions, keys, `.lab__pins` and `.lab__list` (the containers only) fade in and rise 12 px over 700 ms, 150 ms after their plate. The pins wait until the plate has settled. |
| M6 | Links | feedback | The underline draws over 240 ms. The arrow nudges 3 px, only under `(hover: hover) and (pointer: fine)`. Press is 0.98 over 120 ms (unchanged). |
| M7 | Compact bar, menu | state | Bar 320 ms; menu as now (fade 240 ms, items rise 12 px, 40 ms apart), on the new curve. |
| M8 | Viewer | orientation | The spring open and close is unchanged (D38). The crossfade becomes 320 ms in and 200 ms out with a 24 px drift, so exit is faster than entry. |
| M9 | Groups without a plate (films, reels) | hierarchy | `.rv:not(:has(.nw))` keeps today's fade and 16 px rise on the new curve, so these groups do not pop in. |
| M10 | Smooth, inertial scroll (D79) | orientation (the owner's request) | Lenis 1.3.26, vendored, 5.6 KB gzipped, loaded only for a fine pointer without reduced motion. `lerp: 0.1`; touch stays native; dialogs stop it; a scrolling key takes over from a glide; Contents links glide 1.1 s on an in-out curve, then update the address and move focus; the skip link stays instant. Checked by the QA smooth-scroll pass. |

**Mechanism** (fixes from the review):
- The existing arrival module is kept: IntersectionObserver, a decode wait of at most 700 ms, never above the fold, and reveal on focus.
- At observe time the **group** gets `.rv-g` and the cells get `.rv` with `--i`. `is-in` is set on both the group and its cells.
  - Today `.rv` lands on each `.cell`, so a figure's key and caption sit outside every `.rv`. With `backwards` fill they would flash visible, then hidden, then visible.
  - So `.rv-g:not(.is-in) :is(.cap, .key, …)` hides them until the group arrives.
- `.rv` and `.rv-g` set only `opacity: 0`. `.is-in` sets opacity 1 at once, and the descendants run keyframes with `animation-fill-mode: backwards`, so the end state is the plain layout.
- The focus reveal adds `.rv--now`, which turns animations off.
- `--shots` and QA keep working because the class names are unchanged.
- Print gets `animation: none` everywhere. Today `site.css:613` only resets `.rv`.

**Browser support, checked against Chrome's developer docs:**
- `pagereveal` and cross-document view transitions: Chrome and Edge 124+, Safari 18.2+.
- Firefox: neither. There is no morph there, so the h1 rise always plays, which is the correct fallback.
- Scroll-driven CSS is not used, so it needs no check.

**Reduced motion** is "fewer and gentler", not nothing: no movement anywhere, and view transitions keep an opacity-only root crossfade of 160 ms. Without JS everything is visible. The CSS-only h1 rise is gated by `no-preference`.

**Rejected, and logged:**
- ~~Lenis or smooth scroll (D38)~~: **reversed by D79 at the owner's explicit request (2026-10-21)**; see M10 below.
- Parallax: needs an overscanned, cropped frame, which breaks D32.
- Preloaders and title cards: delay content and LCP.
- Blur reveals: the cost of `filter` on 2560 px plates, and a clash with the dark filters.
- Theme-switch crossfade: nobody asked for it; it can be added later.
- Scroll-linked progress or chapter spy: scope; the contents and the numbers already orient the reader.

## 4 · Implementation (small commits on `flagship-upgrade`)

**Skills used during execution:**
- `frontend-design:frontend-design` for the composition;
- `ecc:motion-foundations` for the motion pass;
- `ecc:accessibility` for the a11y check;
- `superpowers:verification-before-completion` before claiming any gate;
- `superpowers:requesting-code-review` for an independent reviewer subagent on the diff;
- `superpowers:finishing-a-development-branch` for the PR.

**Reused, not rebuilt:**
- `spanFor`, `planRow`, `row`, `cells`, `image`, `figure`, `keyOf`, `labelled`, `hero` and `heroCaption` in `tools/templates/partials.mjs`;
- `html`, `raw`, `attrs` and `when` in `tools/lib/html.mjs`;
- the arrival module and the viewer in `js/site.js`;
- every QA gate in `tools/qa.mjs`.

Each commit gets a build, QA and a decision-log line. Perf runs after commits 3, 9 and 10.

0. **Safety net first, green on the current site.**
   - Add the normal-motion QA pass (`tools/qa.mjs`): 1440, case studies plus home and work, `reducedMotion: 'no-preference'`. It scrolls through, then waits for `Promise.all(document.getAnimations().map(a => a.finished))`, not a fixed time (Corallum's 8-cell series takes about 2.4 s with the decode wait). It asserts:
     - every `.rv` and `.rv-g` is `.is-in` with computed opacity 1;
     - no transform remains on `.nw`, `.nw > *` or `.w__i`.
   - Add `tools/tests/hero-partner.test.mjs`, which pins each project's hero partner and preview picks, so the chapter work cannot change them unnoticed.
1. **Docs.**
   - Copy this plan to `docs/flagship/15-case-study-composition-and-motion.md`.
   - Decision log D73–D78 in `docs/flagship/decision-log.md`:
     - D73: rail and copy composition and the case ladder. On case studies only, it supersedes D42's centred captions and D18's centred landscape band for heroes that are not `full`. Home and work stay centred.
     - D74: chapters data model (`from`, an optional paragraph `chapter`, 3–5 broad chapters, titles supported by their plates);
     - D75: house curve and motion table;
     - D76: plate rise (M3) and masked words (M2);
     - D77: **conflict logged**: the references' smooth scroll and parallax are rejected under D38 and D32;
     - D78: reduced motion keeps a 160 ms crossfade.
   - In `08-direction.md`, the "Motion" table (line 125) and the case-study order get a pointer to doc 15, so the direction doc does not contradict the new rules.
2. **The case ladder.**
   - A `ladder` option on `spanFor`, `planRow`, `row` and `hero` in `partials.mjs`. The default is today's centred ladder; `CASE` is full, nine, text, narrow, four.
   - `sizesFor` learns `nine`.
   - `.page-case` placements in CSS.
   - `project()` passes `CASE`, and `preloadFor` gets the new hero `sizes`.
3. **Opening and title block.**
   - In `project()`: the run label, the h1, the summary, the honour and the hero.
   - `titleBlock(x)`, with the strip outside the `dl`.
   - The quote at `4 / -1`, Role, and the Overview.
   - CSS scoped to `.page-case`: home reuses `.cap` (`pages.mjs:31`) and `s-narrow` prose, so home, work and research stay unchanged.
   - Perf check: on the three partner-hero pages (Belhomme is in the perf list) the summary may become the LCP element. Perf prints the element tag.
4. **Figcaption and key rows.**
   - `capOf` and `keyOf` take the plate's span: title on the rail and text on the copy axis at ≥64rem; the plate's own span below.
   - The key's D71 column arithmetic is re-based on the 6-column copy axis (2 columns of 3, 3 of 2, a row for up to 3).
5. **Docking.**
   - `figure()` adds `fig--dock` when the span is below `full` and the caption is 240 characters or fewer; the caption goes beside the plate (`align-items: end`).
   - Keys always sit below.
6. **Next-project band.**
   - The rail label and the "n / 15" index.
   - An inline-block title link, not split into words.
   - The docked next hero (its view-transition name kept).
7. **Chapter helper.**
   - `chaptersOf(x, figs)` in `partials.mjs`; it does nothing until the content has chapters.
   - `tools/tests/chapters.test.mjs`: grouping by `from`, a `from` that matches no title, an ambiguous `from`, a first chapter not at the first figure, an unknown paragraph chapter, and partner-hero projects.
8. **Chapter content**, 3–5 projects per commit.
   - Read each narrative and each plate's title, caption and source, then write `chapters` and the optional paragraph `chapter`.
   - Add the Contents nav and the chapter heads.
   - Remove the visually hidden "Drawings and images" h2, because the chapters carry real h2s.
   - `ledger.mjs` and `cutout.mjs` read only `src`, `text` and `source`, so the new keys are safe. Content coverage needs no SKIP entry, because `from` and `chapter` hold visible titles.
9. **Arrival motion** (`js/site.js` arrival module, `@layer motion`):
   - the group pre-state `.rv-g`, M3 (plate rise), M4 (chapter rule), M5 (text follows), M9 (groups without a plate), `.rv--now`;
   - print `animation: none`.
10. **Tokens and transitions:**
    - the house curve;
    - M1 timings and the title-morph fix (checked through the local server);
    - M2 with the `pagereveal` one-liner next to `layout.mjs:36`;
    - the M8 viewer timings (`site.js:245–248`);
    - M6 hover gating.
11. **Regenerate and close.**
    - `npm run build`. The OG cards and CV are unaffected (no image or identity change).
    - Update `14-continuation.md`, the QA report, and the decision-log entries D73–D78.

## 5 · Verification (what "done" means; each item reported as tested, how, or not tested)

1. **Unit tests.** `node --test tools/tests/*.test.mjs` passes: the 40 existing tests plus the chapter and hero-partner tests.
2. **Build.** `npm run build` completes. The build fails loudly on a bad chapter map.
3. **QA, all gates.**
   - Run `npm run serve` in the background, then `npm run qa -- --shots`, or the server-free `node tools/qa.mjs --base=file:///C:/Users/Hazem/Desktop/portfolio-main/`.
   - Gates: crop, upscale, grid lines (this catches any rail or copy placement off a column line), palette, dark treatments, alpha and fringe, labels, content coverage, axe WCAG 2.2 AA, text ≥ 13 px, targets ≥ 24 px, no overflow.
   - Checked at 320, 375, 768, 1024, 1440 and 1920, in both schemes.
4. **The new normal-motion pass** is green: nothing stays hidden or offset.
5. **Performance.** `npm run perf`: LCP < 2.5 s and CLS < 0.1 on the throttled mobile profile. Perf runs with motion on (`perf.cjs` sets no reduced motion), so the h1 word rise is measured.
   - Read the LCP element it prints for Belhomme: a partner-hero page, where the summary may become the LCP element.
   - Compare against the last recorded LCP of 1.48–2.43 s.
6. **Visual checks in Chrome** (chrome-devtools MCP, by eye):
   - Aïn Sebaâ (the reference case), Al-Arg (the longest), Hay Mohammadi (one chapter), Belhomme (a portrait hero pair) and Sentry (with a film).
   - At 1440×900 and 375×812, light and dark: the 10-second fold test (title, what it is, where, who).
   - Diacritics not clipped in the masked words.
   - The plate rise slowed to 4× in the DevTools Animations panel.
   - The view-transition morph through `npm run serve` (the memory note says not to restart the server unasked; the owner has allowed `npm run serve` in local settings, so start it once, in the background).
     - Work to a case study, and next project to the next page.
     - Check that the title moves without being scaled or blurred, and that the next-project morph is captured. If either fails, use the M1 fallback and log it.
   - The viewer opening from a docked plate.
   - Keyboard: tab through contents, the chapters and the viewer.
7. **Independent review.** A code-review subagent on the diff, then a design-critique pass on the screenshots.
8. **Ship.** Update `14-continuation.md` and the QA report. When every gate is green, open a PR from `flagship-upgrade` to main and merge it (CLAUDE.md delegates the merge).

## 5b · Already tested while planning (Chrome, in-page mocks on the built Aïn Sebaâ page; no files changed)
- **Masked words** at 52 px with `padding-block: .25em`: "AÏN SEBAÂ STATION" keeps its diaeresis and circumflex.
- **Plate rise** (outer and counter-translate, WAAPI paused at 260 of 1100 ms on Section A-A, dark scheme): about 85 % has risen, with no errors and no filter interference.
- **Opening at 1440×900 and 375×812:** office, title, summary and hero are all above the fold.
  - With a centred hero, three left edges showed (cols 1, 2 and 4), which led to the case ladder.
  - The run label wraps in a 3-column rail, so it takes the full row.
- **Chapter head and docked plate:** the rule, "02 PLANS" on the rail, the paragraph on the copy axis, the plan hanging from col 4, and its caption title at the plate's ground line in the rail.
  - The head-to-plate gap of 96 px is too loose, which led to `--s7`.

- **Title block and contents** (Foubert, 1440, dark):
  - a full-width 1 px `--ink` rule over the header strip (descriptor at left, tag at right), then the spec cells of 3 columns, each under a `--line` rule;
  - "Contents" on the rail, and the numbered chapter links in two columns on the copy axis, 44 px targets.
  - It reads as a drawing's title block. The strong ink rule against the light cell rules gives the hierarchy.
- **Plate rise on a keep-layer drawing** (Foubert west facade, dark scheme, paused at 150 ms): the inverted linework and the authored brick layer rise together, aligned, from the ground line.

- **Independent plan review** (Plan subagent, read the code, did not run a browser). It found the defects now designed out:
  - the header strip inside the `dl` (would fail axe);
  - a `::before` rule as a stray grid item;
  - `.g` on a subgrid (would give NaN in the grid gate);
  - nested `.wrap`;
  - keys and captions outside `.rv` flashing in;
  - the fixed 1.6 s QA wait;
  - the partner-hero validation;
  - underlines under split link text;
  - fragmented next-title links in view transitions;
  - the 12-line docked caption at 1024;
  - the 6-line quote;
  - print animations.

Not yet tested:
- the view-transition morph (it needs the local server, because file:// has no same-origin navigation);
- how Chrome reports a subgrid's columns;
- Safari and Firefox rendering.

## 6 · Content limits (no invention)
- Chapter titles are standard drawing-type terms. Each must be supported by its own plates' titles, captions or sources, because a title such as "Survey" is a factual claim.
- No paragraph is written or reworded.
- Projects with no narrative (La Villette) get chapter heads without text.
- If a chapter clearly needs an explanation the sources do not give, it is listed as `[CONTENT NEEDED: …]` in `content/ledger-notes.md` and nothing is published in its place.
