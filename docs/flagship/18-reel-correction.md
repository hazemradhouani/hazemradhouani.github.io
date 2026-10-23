# Plan 18 "Reel, corrected": deep correction to flagship level, in fifteen resumable phases

> Approved 2026-10-22. Source plan: `C:\Users\Hazem\.claude\plans\enhance-this-prompt-for-keen-frog.md` (copied here, P1a).
> **Amendment A** approved 2026-10-23 (source: `C:\Users\Hazem\.claude\plans\enhance-this-prompt-for-elegant-reef.md`): repo sync and push rule, the sitemap rename, the Sakura link, Index filters, the case-study and Index motion finish. Brief in §1b, decisions D122–D131, phases S0, P5c, F1, F2.
> **Resume:** `git fetch origin` and merge `origin/main` if it has commits the branch lacks; read this file's Progress table (rows run in table order), start the first row not "done", view the matching `docs/ref/` frames (gitignored; re-extract with the ffmpeg commands in §2 if missing). **Push after every commit.**

## Progress

| Phase | Scope | Status | Commit / notes |
|---|---|---|---|
| P1a | Foundation: tokens, pills, footer, references, name-overlap gate | done | commit "Plan 18 P1a"; full QA 27/27 ok (file: base, 404 checks skipped) |
| P1b | Email chip, form removal, theme sync + reveal | done | commit "Plan 18 P1b" (D107, D108); chip beside Contact only from 105 rem (measured: at the plan's 64 rem it covers the name); CV regenerated now as well as in P4 |
| P2a | Home compositions (content only) | done | commit "Plan 18 P2a" (D120); `home.json` `reel` (15 items, choices table under §4 P2a); old keys marked `$remove` for P2b; QA coverage gate skips `layout`/`layers`/`why`/`$…`; home QA all gates pass |
| P2b | Home build and motion | done | commit "Plan 18 P2b" (D103–D105, D109, D112 gate); widest empty band 24vh at 1440 (gap 1.5 rem, rise 6vh, drift 8vh, measured); home LCP 1.36 s, CLS 0; frames at 1× 60 fps, at 4× CPU ~30 fps (logged in D105 with the recommendation); full QA 28/28 ok (file: base, 404 checks skipped) |
| P3 | Index: tree first, rebuilt; grid without margins | done | commit "Plan 18 P3" (D110–D112 as built, D121); families 15/132/78/3 = 228; tree from 64 rem (not 48: pills collide, measured); leaves by `tree-layout.mjs` (12 tests); switch measured in headless Chrome (interruptions settle, no errors); two small renders stand whole (no enlargement); phone header under 375 px and phone bar fixed; full QA 29/29 ok (file: base, 404 checks skipped), index re-run after the last change ok; perf not run (needs the server; P7) |
| P4 | About sheet and about.html | done | commit "Plan 18 P4" (D113, D114 as built); X in the header row and no `scrollbar-gutter` (both measured, logged in D113); new `runAboutPass` (3 pages, X/Esc/outside, drag-select, chip-then-sheet Esc, axe open, header unmoved with scrollbars shown, reduced motion, phone menu, about.html alone, no-JS link); CV regenerated (2 A4 pages); full QA 21/21 ok (file: base, 404 checks skipped); perf not run (needs the server; P7) |
| P5a | Case-study reel: engine, template, 4 reference projects | done | commit "Plan 18 P5a" (D115, D116 as built); the template serves all 15 (the 11 keep every field until P5b's `$omit` pass); engine kinds `enter` and `rail`, the opening's measured FLIP; new QA `runCasePass` (all 15: full-bleed → slot → back, rail, arrivals, reduced motion, phone, anchors); test `case-opening.test.mjs`; montages 375/1024/1440 both themes; perf on the file: base, headless (Al-Arg, Belhomme: LCP 0.29–1.06 s, CLS 0, median frame 16.7 ms at 1× and 4× CPU, p95 33 ms at 4×); network-throttled `npm run perf` not run (needs the server; P7); full QA 21/21 ok (file: base, 404 checks skipped) |
| S0 | Repo sync and push, sitemap rename, Sakura link, amendment A, PR #13 | done | commit "Plan 18 S0" (D122–D124); PR #13 (opened by the owner 2026-10-23, empty body) used as the plan's PR and its body filled in; 8 unpushed commits pushed; `origin/main` (owner's e0c0dca, 700642d) merged cleanly; build writes `sitemap-site.xml` (20 URLs) and its robots line; Sakura pill in the About sheet, about.html and Research (HTTP 200, status only; `no-print`, CV unchanged); QA fix: the case pass reports "not checked" when `--only` leaves no case study; tests 65/65; QA about/books/index/al-arg ok (file: base) |
| P5b | Case-study reel: remaining 11 | done | commit "Plan 18 P5b" (D132, D133); P5a's template unchanged, so the four reference pages were re-checked by the full run only; `$omit` on all 11 (83 strings left out across the 15, coverage gate ok); Avenir hero `pos 50% 60%`, the rest centred (checked on a sheet of each hero with the 16:9 window drawn); no render crop needed (full pages at 1440 compared); montages 1440/1024/375 in both themes at four scroll points for each of the 11 (scratchpad); `qa.mjs --only=… --shots` ok for each of the 11; QA fix: shot names now replace every non-word character (`architecture.html?view=grid` crashed `--shots` on Windows since P3); tests 65/65; full QA 22/22 ok with shots (file: base, 404 checks skipped); perf not run (P7). Seen for P5c: Nouvelle Medina's site-plan render carries a printed "Plan de masse 1:1000" title. PR #13 was merged by the owner after S0; a new PR carries the plan (D133) |
| P5c | Case-study finish: composition, surfaces, motion across all 15 (D130) | done | commit "Plan 18 P5c" (D134); renders are cards that lift, drawings lie on raised sheets, and the rail stands on a frosted pill (one rule per kind in the template); phones: a series of 4+ renders stands two to a line (Al-Arg's material maps: 1 930 → about 560 px each); Nouvelle Medina's site plan cropped above its printed title; Aïn Sebaâ's printed title can't be cropped out, so it is listed in §6; measured on all 15 (headless, file: base): widest band 13.6–14.0 vh, median frame 16.7 ms at 1× and 4×, p95 at 4× ≤ 20.9 ms on twelve pages and 33.3 ms on three, CLS 0, reversible; montages of all 15 at 1440/1024/375 (1024 light only) plus scroll frames; tests 65/65; full QA 21/21 ok with every interaction pass (case, scroll, motion, theme, chip, about, index, home) and all Field gates (file: base, 404 checks skipped, no `--shots`); network-throttled perf not run (P7) |
| F1 | Index filters: facets, markup, state, URL, panel, QA (D125–D127, D129) | done | commit "Plan 18 F1" (D135); `country` in the 15 projects (from spec Location), site.json `places`/`scales`; `facetsOf`/`facetRows` in pages.mjs (the build fails on unknown country, tag, practice, surface or year); data attributes on 225 tiles, 225 leaves, 15 rows; the Filter pill and its frosted panel (86 %, measured, not 72 %), the result line, live counts, out-of-reach choices, URL keys, Esc order; tree dims in place; new `facets.test.mjs` (4 tests; all 69 pass); new QA `runFilterPass` (all 19 choices against the built values, combine, out of reach, 4.5:1, Clear all, outside click, keyboard, tree, list, address and Back, axe open, 320/375, reduced motion, console); QA `--only=architecture` ok on every pass and gate (file: base, 404 checks skipped); screenshots 1440 light/dark, 1024 dark, 1920, 812×375, 375, 320 dark; motion is F2's |
| F2 | Filter and Index motion finish; entry points on the home and case studies (D128, D129, D131) | done | commit "Plan 18 F2" (D137); grid and list: out 160 ms, FLIP 560 ms, newcomers rise; view cut 160 ms + 8 px rise 420 ms; tree first show fans out, dims by CSS 420 ms; deep change fades, returns to the head, rises (D127 deviation); panel clip reveal (D128 deviation); swap after the next paint and tiles 24 per task (INP: at 4× CPU Clear 3 552 → 88 ms, All 2 512 → 64–288 ms, other presses 88–184 ms; at 1× 16–56 ms, panel 128–136 ms; Event Timing with real input, headless, A/B against the pre-F2 script); frames median 16.7 ms; CLS 0 at 1440, 0.0009 at 375 (font swap, pre-existing); home places (third tree level) and each case study's "In the Index" line; phone Filter icon; new QA `runWaysPass`, `runIndexMotionPass`; tests 69/69; full QA 33 ok, all Field gates (file: base, 404 checks skipped); montages 1440 both themes, 375 dark, 320 |
| P6 | Research, Films, 404, phone menu | done | commit "Plan 18 P6" (D138); Research opens on the thesis as a still composition (three cutouts, whole), the report as a duo, Sakura as a composition of the three Japan photos; Films = one 16:9 card grid (films + reels, section titles `$omit`) with a fine-pointer muted hover preview; phone menu pills (LinkedIn, CV, Films); 404 already in the pill grammar (checked through a routed origin, its paths are root-absolute); preview probe (fine, reduced motion, touch) ok, no errors; LCP 0.24–0.58 s, CLS ≤ 0.0001 (headless, file:); tests 69/69; QA `--only` books, motion, about ok on every pass and all Field gates (file: base, 404 checks skipped); screenshots 1440 light/dark, 375 light/dark; network-throttled `npm run perf` not run (P7) |
| P7 | Whole-site coherence (QA, perf, OG, WebKit) | todo | |
| P8 | Independent review | todo | |
| P9 | PR and merge | todo | |

## Context

Plan 17 "Reel" (PR #12, D90–D101) rebuilt the site after dmcg.co, but the owner judges the result not premium. This is what he flagged, checked against screenshots of the current build at 1440 px:
- **Home:** a scroll-scrubbed Sidi Maarouf film card opens the page, with the name and credential set under it, and they collide. The 15 project "objects" have no common scale (renders from 523 to 1016 px wide, drawings ghosted at the side). "Practice" and "Research" at the bottom do not belong. Gaps of 5–11 rem of empty field.
- **Buttons:** nav links animate a line underneath, where dmcg shows a soft rounded pill.
- **Theme:** it is not synchronised across tabs (no `storage` listener) or after Back (no `pageshow`), and it switches abruptly.
- **Index:** it opens on the grid. Its tiles show grey or white letterbox bands. The tree view is a sparse 15-leaf diagram with no motion.
- **About:** a separate dark "tale" page in Garamond capitals. The owner wants dmcg's About: a sheet over the current page, the page blurred behind it, closed by X, Esc or a click outside.
- **Contact:** a form section with the old address. The owner wants dmcg's animated pill showing **radhouani.hazem@enau.ucar.tn** that copies on click.
- **Case studies, Research, Films:** long static pages. The owner wants each one to be a scroll-driven reel.

The owner supplied three screen recordings of dmcg.co as the target feel (§2). Outcome: every page at that level of finish, built from this site's own content. The work is split into 11 phases, each sized for one context. After each phase the owner runs `/clear` and types `resume`.

---

## 1. Enhanced brief (the owner's prompt, rewritten for execution)

> Correct and finish the whole portfolio (every page, component, transition and motion) to the level of dmcg.co, using the owner's three recordings as the reference for feel, motion, scale, transparency, shadow and pacing. Do not copy dmcg content or assets.
>
> **Motion grammar.** All motion is a smooth, eased function of the wheel (Lenis inertia) or a short eased response to an action. It runs backwards when scrolling up and has a stated purpose (orientation, feedback, hierarchy). It never blocks reading. Text motion is limited to opacity, a translate of 12 px or less, a blur of 6 px or less on a fine pointer, and the out-curve. There is no per-letter splitting. Body copy only fades in.
>
> 1. **Home:** remove the film hero and open directly on the project reel. The fixed header and corner captions give identity in under 10 s, and nothing overlaps the centred name. Each project is one deliberate composition (main render, a second view, a key drawing) on one shared scale system. It rises from below in blur, assembles at the centre (the main image shrinks into place, secondary layers slide out from behind it), holds, then leaves upward at layered rates. Remove Practice and Research. The page ends on the index root. No empty band larger than about 25 vh.
> 2. **Chrome:** dmcg pills replace every underline animation. Contact expands into an email chip that copies `radhouani.hazem@enau.ucar.tn` and confirms "Copied". The cursor label is dmcg's frosted pill: name plus category.
> 3. **Theme:** one toggle, synchronised on every page, across tabs and after Back/Forward. It switches with a slow, feathered, eased reveal from the button, can be reversed at any moment, and is instant under reduced motion.
> 4. **Index:** opens on the tree (phones keep the grid). The tree is rebuilt as dmcg's: pills, a dense field of leaves at their own aspect (no margins of any colour), curved connectors, hover lift with caption, and an animated branch switch. Grid tiles have no margins.
> 5. **About:** a sheet over the current page (blurred page behind, header crisp). It scrolls inside and its sections focus in. It closes by X, Esc or a click outside. about.html remains standalone.
> 6. **Case studies, Research, Films:** scroll reels. Each opening hero shrinks into a composition while the title, summary and facts arrive. A chapter rail marks progress. Plates focus in and multi-image figures assemble. Renders may be cropped; drawings stay whole.
> 7. **Everywhere:** tight rhythm, only the text that explains, deliberate scale hierarchy, both themes, six widths, WCAG 2.2 AA, LCP < 2.5 s, CLS < 0.1, INP < 200 ms. No AI imagery or text.
>
> CLAUDE.md rules stay in force: no invented content, the decision log, the flagship-upgrade branch, PR then merge after QA, no new dependencies, and honest test reports.

## 1b. Amendment A (2026-10-23, the owner's additions, rewritten for execution)

> Before resuming plan 18 at P5b, fold in these additions. Each one is built to the plan's flagship bar (§1) and recorded in the decision log.
>
> 1. **Repository.** Push every commit to `origin/flagship-upgrade` as soon as it is made. Fetch before each phase and merge the owner's own commits on `main` into the branch, never overwriting them. Keep the PR to `main` (#13) current throughout, and merge it at P9 after QA. No force-push, no direct commits to `main`.
> 2. **Sitemap.** The owner renamed `sitemap.xml` to `sitemap-site.xml` on GitHub and pointed robots.txt at it. The build must generate exactly that file and that robots line. Remove the old file and log the removal. QA, tests and docs must read the new name.
> 3. **Sakura Science Program link.** `https://sagaunissp2025.my.canva.site/` is the programme's own site, supplied by the owner. Present it as an external pill wherever the programme is presented: the About column's Japan section (sheet and about.html) and the Research page's Sakura chapter. It opens in a new tab with an accessible name. Say nothing about its contents beyond what the repo already says.
> 4. **Index filters.** On the Index, the reader narrows the work by **Place** (country), **Type** (programme), **Scale** (surface band), **Year** and **Practice** (professional / academic).
>    - Facets come only from project content. A project without the data is left out of that facet, never guessed.
>    - Filters combine with the family and with every view (tree, grid, list). They live in the URL and are fully keyboard-operable.
>    - Each choice shows a live count, empty choices are disabled, and one action clears everything.
>    - Motion uses the house curves and is instant under reduced motion: the grid reflows by FLIP, the tree dims what does not match, the list collapses its rows.
>    - The home's index root and every case study's end link into filtered views.
> 5. **Case studies.** Give all 15 pages a composition and motion finish pass: deliberate layout, the reel grammar on every plate, shadows and translucency from the token family, and eased transitions between chapters and into the next project. Every part is measured, reversible and smooth.
> 6. **Index motion.** Review every transition on the Index from the smallest detail up: view switch, family switch, filter, hover, viewer, A–Z jump and the bar. Tune each to the same grammar and measure it.
>
> CLAUDE.md stays in force: no invented content, honest test reports, no new dependencies.

**Interpretation (D129).** The owner wrote "on the index page or the main page". The filters live on the **Index** (`architecture.html`, the catalog of all 228 items). The home stays the curated reel, because the first screen must say who and what within 10 s, with no controls between the reader and the work. The home's closing index root gains Place pills as its entry into filtered views. Rejected: a filter on the home reel. It would put controls on the first screen, and a reel filtered down to 3 items breaks the pacing of the 15 compositions.

---

## 2. What the recordings show (frame by frame)

**R1 home, `161653.mp4` (27 s, 1920×868).**
- Timeline: 0–4.5 s Infinite Machine, 4.5–9 Archiv/Tolan, 9–13.5 Hedroom to Groth build, 13.5–18 Americana, 18–22.5 Sandbar, 22.5–27 Evara.
- Chrome: white field. Fixed header (About and Contact | a 3-line name centred at ~22 px | Projects/Catalog/sound). Corner captions at the bottom.
- Composition: one at a time on the centre axis. Infinite Machine at 1920: main card 456 px (24 vw); a top-right card overlapping it (303 px); a bottom-right card (310 px). Cluster 558 × 590 (29 vw × 68 vh). Radius ~4 px. Very soft, large shadow (~`0 24px 48px -16px rgb(0 0 0/.15)`).
- Entry: layers rise from below, heavily blurred and semi-transparent, and sharpen near the centre. Groth: the wordmark enters large, then a frame builds around it and it becomes a card that keeps populating.
- Exit: layers rise at different rates (the top-right card first), blur and fade under the header's progressive edge.
- No visible caption. A cursor pill follows the pointer: "Name" in ink, "Category" in grey, on a frosted translucent light-grey pill with a hairline border, fully round, ~20 px text.

**R2 catalog, `162551.mp4` (61 s).**
- 0–9 s tree "Logo": hover enlarges a leaf (~1.4×), with a bigger shadow, a small white caption tag under it, and its connector darker.
- ~12 s switch to "Digital" (60 leaves): old leaves fold into the pill, new ones fan out from it, blurred and small, into a field larger than the screen.
- ~23 s "Physical". ~30 s grid: 3 equal columns of 16:10 tiles, images edge to edge, a vertical A–Z, top and bottom fading into the field.
- ~49 s and ~53 s filters. ~57 s back to the tree.
- Pills: rounded rectangles (radius ~8 px, 1 px light border). Inactive branches are greyed. Root "Catalog 106" on the left-middle.
- Leaves: no padding, no letterbox. Transparent-ground logos float with no card. Connectors are 1 px light-grey cubics from the active pill's right edge to each leaf's left edge.

**R3 About and Contact, `163444.mp4` (26 s).**
- 0–3 s Contact: a fully round chip expands right of "Contact", reading "office@… · Copy"; on click, "Copied ✓".
- ~3.5 s About: the page behind blurs very strongly (the object becomes a grey cloud) and veils white; the header stays crisp. A ~570 px column, centred, focuses in. X at the column's top right, aligned with the header row.
- 4.5–14 s inner scroll: text fades at the top edge, an image focuses in, a table on a pale grey card.
- ~19.5 s close by X: the column blurs out and the page sharpens. ~21 s reopen. ~24 s close by clicking outside.
- Nav hover: a white rounded-rect pill with a hairline fades in. The current page keeps its pill. No underlines.

---

## 3. Design decisions (log as D102+ when each lands)

| # | Decision (binding detail included) | Reason | Rejected |
|---|---|---|---|
| D102 | Plan 18 adopted; the brief in §1 is the contract | Owner asked for an enhanced prompt, then execution | — |
| D103 | **Home opens on the reel; film hero removed.** Sidi Maarouf scrub files are removed and logged. A visually hidden h1 block holds `person.name`, `person.line` and `person.credential`; content coverage needs them on index.html, and no new phrase is written | Owner rejected the film and the colliding name; the header and corners carry who, what and where | Another hero image |
| D104 | **One composition system.** Stage `--stage-w: min(46vw, 60rem, (100svh - head - edge-bottom - 4rem) * 1.25)`, aspect 5:4. Templates `trio`, `trio-m` (mirror, alternating), `duo-p` (portrait main), `film`. Shares: main 70 %, side 46 %, drawing 44 % of the stage. Renders are cropped 16:10 with `object-fit: cover` and a per-layer `pos`, marked `data-crop`. Drawings are whole on a sheet card and never inside `[data-crop]` | Coherent scale and hierarchy (the owner's main complaint) | Free placement per project |
| D105 | **Reel choreography** from the existing `centre` kind (`--d`). Dead zone: \|d\| < 0.14 is fully assembled. Entry: main scale 1.28 → 1, rise 9 vh. Secondary layers slide out from behind the main card's centre with staggered progress. Exit: layered upward drift (k = .9/1.2/1.5) and fade. **Blur once per item, on `.reel__stage`, only in the entry and exit bands, fine pointer only.** Layers get permanent `will-change: transform` on a fine pointer (shadows otherwise repaint); no `contain: paint` (it clips shadows). Item spacing tuned so the largest empty band is ≤ 25 vh | R1's layered pass-through; no new engine kind; runs backwards for free; at most about 3 live filters | Per-layer blur; sticky per-project tracks |
| D106 | **Pill grammar for every control.** At rest text only (filter and tree pills keep a border). Hover/focus: 1 px `--line` border plus `--bg-raised` fill, 200 ms, out-curve. Press scale .98. The current page keeps its pill. Radius 10 px for nav and tree, full round for chips. Inline prose links keep their underline (WCAG 1.4.1) | dmcg's buttons | Underline draw (rejected by owner) |
| D107 | **Contact = email chip.** `<a href="mailto:…">Contact</a>` stays a link; JS adds `aria-expanded` and `aria-controls` and toggles the chip (no `role=button`). The chip is a `<button>`, "radhouani.hazem@enau.ucar.tn · Copy", revealed by width and clip over 420 ms with the text focusing in. Click copies (`navigator.clipboard.writeText`, then the `execCommand` fallback, then select the text) and shows "Copied ✓" (polite live region). Esc or an outside click collapses it. Below 64 rem it drops under the item. The partial is id-free (used in header, menu, footer, sheet). The address is updated everywhere (site.json, JSON-LD, footer, menu; CV regenerated in P4; ledger source "owner:2026-10-22"). The form, FormSubmit and form JS/CSS are removed. `id="contact"` stays on about.html as an anchor | Owner's request; progressive enhancement | Keeping the form |
| D108 | **Theme.** `storage` listener (other tabs) and `pageshow` re-read (bfcache). The next theme comes from a `wanted` variable, never from `data-theme`. Swap via `document.startViewTransition`, with `t.ready.catch(()=>{})`; the class is removed in `finished` only if the transition is still current, and on `pagehide`. Under `html.theme-vt`: old image `animation:none`; old and new `mix-blend-mode: normal`; `::view-transition{pointer-events:none}` so a second click reverses mid-reveal; `[style*="view-transition-name"]{view-transition-name:none!important}`; new image `mask-image: radial-gradient(circle at var(--vt-x) var(--vt-y), #000 calc(var(--vt-r) - 6rem), transparent var(--vt-r))` with registered `@property --vt-r` animated 0 → hypotenuse + 6 rem over 950 ms on the in-out curve. A new swap skips the running one. No colour-fade fallback (every target browser has same-document VT; without it the swap is instant). Reduced motion: instant | "Smooth, dramatic, eased", reversible, synchronised | Hard circle clip; whole-page colour fade |
| D109 | **Cursor label** = frosted pill (`color-mix(in srgb, var(--bg) 72%, transparent)`, `backdrop-filter: blur(14px)`, hairline): name in ink, category in `--ink-2` (`data-cat` = the first part of the descriptor) | R1's pill | Solid ink pill |
| D110 | **Index opens on the tree** from 48 rem (phones keep the grid; the URL still wins). Families form a partition that sums to the root: **Projects 15** (the heroes, default), **Drawings 132**, **Renders 78** (heroes excluded), **Films 3** = 228. One `count()` source feeds the tree pills, grid filters, home mini-tree, site.js family whitelist and QA. Leaves are placed at build time by `tools/lib/tree-layout.mjs`: seeded jittered cells, equal leaf area at the image's own aspect, area scaled by count (shortest side ≥ 40 px), canvas height capped at about 1.6 viewports. Connectors are SVG cubics in the same viewBox (`xMidYMid meet`). Drawing leaves use `image()`'s `nw--drawing` dark treatment and float with no card | R2; no letterbox; deterministic and testable | Browser force layout |
| D111 | **Tree motion.** Branch switch with WAAPI on leaves on screen only (others snap): old leaves fold into the pill (380 ms, ease-in, scale .3, opacity 0), new ones fan out (560 ms, out-curve, stagger by distance, capped at 280 ms), connectors draw (`pathLength=1`, dashoffset). No per-leaf blur. Hover/focus: scale 1.45, lifted shadow, caption tag (`visibility:hidden` at rest, ≥ 13 px), connector to `--ink` at .55 | R2 | — |
| D112 | **Grid tiles without margins.** Renders and films use `object-fit: cover` in 4:3 tiles (`data-crop`). Drawings stand whole on a `--bg-raised` sheet card with their dark treatment. QA crop gate: `img.closest('[data-crop]')` is exempt from the crop check, but enlargement is measured as `max(ow/w, oh/h) > 1` and still fails; any `[data-crop]` containing a drawing fails. **Supersedes D32 and A10 for thumbnails and compositions** | Owner: "no white or black margins"; the full image is one click away | Letterboxing |
| D113 | **About sheet.** Built into every page at build time (works from file://), placed right after `</header>`. It is a non-modal `<dialog data-lenis-prevent>` under the header (z 18 < 20), opened with `show()`. The existing Lenis `hold` observer stops the page on its own. `main`, footer and corners are `inert`. The veil (`backdrop-filter: blur(48px)`, `--bg` 55 % wash) fades over 600 ms. The column's heading (`tabindex=-1`, `autofocus`) takes focus. An inner Lenis (`wrapper`/`content`, present in vendored 1.3.26) is created after `show()` and destroyed on close. Sections focus in with CSS `animation-timeline: view()` in `@supports` (static otherwise). Close: X; Esc (one global handler, in order: chip, then skip if a modal dialog is open, then the sheet); or an outside click where both pointerdown and click land outside `.about__col`. Close takes 450 ms; focus returns to About. Opening from the phone menu happens in the menu's `close` event. `html { scrollbar-gutter: stable }` so the header does not shift. about.html renders the same column as a page | R3; header stays crisp and usable | Top-layer modal (would blur the header); fetching about.html |
| D114 | **About content** in dmcg's register (light ground, one sans voice): bio, portrait, diploma and thesis, practice (table on a pale card), Japan with photos, tools, languages, CV link, email chip and LinkedIn. Only `about.json` text. The Gatt tale, Garamond capitals and dark ground are removed (supersedes D99, A11). EB Garamond is removed if nothing uses it | R3, owner's request | — |
| D115 | **Case-study reel.** Sticky opening track (190 svh): the hero goes from near full-bleed (16:9 crop, `hero.pos`) to a plate at ~58 % while run, title, summary and ≤ 6 facts arrive on the left. A fixed chapter rail from 80 rem (`.rail`, `data-steps="auto"`) replaces the Contents list. The rail and the hero stay outside `.g` (the grid gate). Figures use the `--d` grammar (focus-in, rise, scale .94 → 1); multi-image figures assemble (cells start stacked at the row centre and fan out). Captions follow. Next project = the shared `reelItem()` composition with the VT morph | One grammar; "the hero gets smaller, new elements appear" | Pinning each figure |
| D116 | **Rhythm and text.** `--gap-chapter` 12 → 7.5 rem and `--gap-group` 6 → 4 rem (desktop); plate to plate 4.5 rem; heading to first plate 2.5 rem. Each fact once per page; the "Project" overview is omitted when it repeats the summary. Owner text is never rewritten. Omitted strings are listed in the QA coverage `unused` map with the decision number (not deleted from the JSON) | "No empty space, no text without need" | Rewriting copy |
| D117 | **Footer** = one compact line in Instrument Sans: © 2026 name · email chip · LinkedIn · CV (PDF) · Films. The Garamond sentence is removed | One voice, less text | — |
| D118 | **Motion and surface tokens.** `--ease-out` (.22,1,.36,1) for arrivals and feedback; `--ease-in-out` (.77,0,.175,1) for travel and theme. Hover 200 ms, chip 420 ms, sheet 600/450 ms, theme 950 ms, leaves 380/560 ms. `--shadow-card` `0 1px 2px rgb(0 0 0/.04), 0 24px 48px -16px rgb(0 0 0/.16)` and `--shadow-lift`; dark scheme uses a hairline `rgb(255 255 255/.06)`. `--bg-raised` #F5F5F3 / #1A1B19. New surfaces (raised, veil wash, frosted pill) are added to the QA palette allowlist | One family, written once | — |
| D119 | `docs/Recording*.mp4` and `docs/ref/` (reference montages) are gitignored; originals untouched | Large binaries, reference only | Committing them |
| D122 | **Sitemap = `sitemap-site.xml`** (the owner's rename on `main`, e0c0dca/700642d). `build.mjs` writes it and `Sitemap: …/sitemap-site.xml`. Tracked `sitemap.xml` removed (by the merge). `qa.mjs`, `redirects.test.mjs` (which now also asserts one sitemap and the robots line) and `tools/README.md` read the new name | Keep the owner's GitHub change; one source of truth | Keeping both files (two sitemaps of the same URLs) |
| D123 | **Sakura programme link.** about.json Sakura experience gets `href`, and research.json gets `sakura.site` (source `owner:2026-10-23`). Rendered as an external pill "Programme site": `.ctl` in the About column (`no-print`, so the CV is unchanged), and `more(…, {ext:true, of})` in Research. It opens in a new tab and its vh text names the programme and "(opens in a new tab)" | Owner's request; reuses the existing patterns | Embedding the Canva site (third-party iframe, perf, a11y) |
| D124 | **Push every commit; PR #13 is the plan's PR** (opened by the owner on 2026-10-23; S0 found it and filled its body; no duplicate); fetch and merge `main` before each phase; merge commits only, no rebase of pushed history, no force | Owner: "the GitHub repo updated with every change" | Merging `main` per phase (unreviewed half-states go live) |
| D125 | **Facets from content only.** Place = new explicit `country` field per project (France 5, Morocco 7, Tunisia 3; source: each spec's Location), list in site.json `places`. Type = existing `filters` tags without professional/academic, labels from site.json `filters` (Heritage and rehabilitation 4, Residential 6, Infrastructure 4, New build 2, Cultural 2, Healthcare 1; multi-valued). Practice = professional 12 / academic 3. Year = every year in the `year` range ("2025-2026" matches both; 2022–2026). Scale = the Surface/Area spec parsed to m² (ha × 10 000) and banded by site.json `scales`: under 1 000 (8), 1 000–10 000 (3), over 10 000 (2). Sentry and Avenir state no surface, so they are in no scale band. Films carry no facets, so they match only when no facet is set. The build fails on an unknown country, tag or unparsable surface | Truth rule; deterministic and testable | Guessing Sentry's surface from "Small scale" |
| D126 | **Filter UI.** A "Filter" pill in `.ix-bar` (shows the active count) opens a frosted, non-modal panel (cursor-label surface: `--bg` 72 % + blur 14 px, hairline, `--shadow-lift`, `--r-card`). It rises above the bar on desktop and is fixed to the bottom edge on phones. It has five labelled rows of pills (`aria-pressed`, single choice per facet, a second press clears it). Live counts per choice are computed with the other facets applied; a choice at 0 gets `aria-disabled` and dimmed text that still meets 4.5:1. "Clear all". A visible result line under the Index heading ("France · Residential · 23 of 228" + Clear) and the polite `[data-ix-status]`. Esc (added to the one ordered handler: chip → modal → **filter panel** → sheet), an outside click or the pill closes it, and focus returns. The URL keys `place`, `type`, `scale`, `year`, `practice` are restored on load and Back | dmcg pill grammar; orientation; WCAG 2.2 | Dropdown selects; multi-select (more complexity than the request warrants) |
| D127 | **Per-view behaviour.** Grid: non-matching tiles are hidden. Tree: non-matching leaves dim (opacity .14, `inert`) and their connectors fade, so the layout stays stable and the subset reads in place. Family pills show live counts. List: non-matching rows are hidden and the caption gives the count. If the grid's top is above the viewport after a change, Lenis scrolls to the Index head | Stable tree layout; no empty holes; orientation | Re-running tree-layout in the browser (its layout is placed at build time) |
| D128 | **Filter motion** (purpose: orientation). Leaving tiles fade and scale to .96 (160 ms, ease-in). Then the remaining on-screen tiles FLIP to their new places (560 ms, `--ease-out`), and newcomers use the existing `is-entering` rise. Tree dimming transitions opacity over 420 ms. The panel opens with `grid-template-rows` 0fr → 1fr and contents rise 8 px (420 ms) and closes in 300 ms. A new change settles the running one at once (as `treeSettle`). Only on-screen elements animate. Reduced motion: instant | One grammar (D118); INP < 200 ms | Animating all 228 tiles |
| D129 | **Filters on the Index, entry points elsewhere** (§1b interpretation). The home's `.tree-root` gains Place pills → `architecture.html?place=…`. Each case study gets one line of pills before the next project (its country, types and year) → the filtered Index | Coherent integration without cluttering the home | Home reel filter |
| D130 | **Case-study finish (P5c).** Renders become cards (`--r-card`, `--shadow-card`, lift on hover only where they open the viewer). Drawings stay whole on `--bg-raised` sheets with a hairline. The rail is a frosted pill where it crosses images. Chapter heads: the rule draws by `--e` and the heading rises ≤ 12 px. The next-project composition uses the shared `reelItem()` and the VT morph. Each page is measured: widest empty band ≤ 25 vh at 1440, median frame ≤ 16.7 ms at 1× and p95 ≤ 33 ms at 4× CPU, CLS 0, reversible on scroll-up, static under reduced motion | Owner: "transparency and shadows, premium layout"; one family with the home | Per-page bespoke motion |
| D131 | **Index motion finish (F2).** View switch: the old view fades out (160 ms) and the new one fades in with an 8 px rise (420 ms); the tree's first show fans out like a branch switch. Family switch in the grid uses the D128 FLIP. A–Z jump uses `lenis.scrollTo` (900 ms, `--ease-in-out`) and focuses the target. The bar arrives once on load. Tile and leaf hover follow D106/D111. Each one is checked in headless Playwright: frames, interrupt-safety, no layout shift of the bar | "Smooth, eased, from smallest to biggest" | — |

---

## 4. Phases (in order; one per context; the Progress table in `docs/flagship/18-reel-correction.md` decides the next one)

**Resume protocol.** On "resume":
1. Read memory `portfolio-site-state.md`, then `docs/flagship/18-reel-correction.md` (this plan plus the Progress table).
2. Start the first unticked phase.
3. View the `docs/ref/` montages relevant to it.

**End of every phase.**
1. `npm run build`.
2. Run the tests: `node tools/tests/<x>.test.mjs` for each one touched.
3. `node tools/qa.mjs --base=file:///C:/Users/Hazem/Desktop/portfolio-main/` (`--only=` for the pages touched; a full run at the end of P1b, P3, P4, P5b and P9).
4. Review a screenshot montage of both themes at 375 and 1440 (scratchpad Playwright script with the installed Chrome).
5. Log decisions, tick Progress, update memory.
6. Make small commits on `flagship-upgrade` and **push each one** (`git push origin flagship-upgrade`, D124); PR #13 follows the branch.
7. Report what was done, what was tested and how, and what was not; then: **"Run /clear, then type resume."**

**Known quirks.** The GateGuard hook asks for facts before the first Bash command and before the first edit of each file. Python is broken (use Node and ffmpeg). Measure motion in headless Playwright, not the DevTools window. Don't start a background server unasked; use the file: base.

### P1a: Foundation (tokens, pills, footer, references)
1. Copy this plan to `docs/flagship/18-reel-correction.md` with a Progress table (P1a…P9).
2. Create `docs/ref/` with ffmpeg montages: R1 at 2/7/12/20 s; R2 at 3/12/30 s; R3 at 1.5/4/7/12/19.5 s; plus a 3×3 contact sheet per recording.
3. Update `.gitignore` (D119). Write memory (plan 18 pointer, resume protocol) and update the `MEMORY.md` line.
4. Tokens (D118); add the new surfaces to the QA palette allowlist.
5. Pill grammar (D106): remove `.nav a::after`; restyle `.nav a`, `.views a`, `.more` (pill text button, arrow nudge kept), `.pill` and the menu items.
6. Footer (D117); remove `.tale-nav`.
7. QA gate: the centred name must not overlap the nav or the tools at any width ≥ 48 rem.
8. Commit.

### P1b: Email chip, form removal, theme
1. D107: change the email in `content/site.json`; set the contact nav href to `mailto:`; add an id-free chip partial in `partials.mjs`, rendered by `layout.mjs` after Contact in the header and in the menu; add the chip module in `js/site.js` (the Esc handler is built as the shared ordered handler for P4).
2. Remove the form: the about template's form and `field()`, `about.json` `form`, the site.js form module, `.form`/`.field`/`.btn` CSS (after a grep), and the old-address fallback strings.
3. Grep the repo for `hazemradhouani@gmail.com`: zero in shipped files (docs history excepted).
4. Run `node tools/ledger.mjs`.
5. D108 theme module and CSS.
6. QA and `tools/tests/theme.test.mjs`:
   - theme A → B persists;
   - a second page syncs via `storage`;
   - Back after a change on another page shows the new theme;
   - a second click mid-reveal reverses it, and the final state equals the last click;
   - no console error on skip;
   - reduced motion is instant.
7. Chip QA:
   - click and keyboard open it;
   - copy works (grant `clipboard-read`/`clipboard-write` and read back);
   - Esc and an outside click close it;
   - without JS the link is `mailto:`;
   - the expanded chip never overlaps the name from 1024 to 1280.
8. Full QA run.

### P2a: Home compositions (content only)
1. Per project, build a contact sheet with ffmpeg of `images/<slug>/*` and `images/cut/<slug>/*`, in the scratchpad.
2. Choose `main` (strongest wide render), `side` (a different scale or view) and `drawing` (the most explanatory cutout), plus `pos` crops and a template. Sentry uses the `film` template with its existing scrub video.
3. Write `content/pages/home.json` as `reel: [{ project, layout, layers: [{ src, role, pos? }], why }]`.
4. Mark the old `film`, `column`, `proofs`, `research` and `cover` for removal in P2b.
5. Save the choices table to the progress doc.

**P2a result (D120).** Chosen from per-project contact sheets of every image the project's content references, then checked in a static preview at the D104 shares in both schemes (scratchpad `compose.mjs`). Rules: main = the case-study hero when it crops well to 16:10 (keeps the home → case morph coherent); a portrait hero takes `duo-p` (4:5); side = another time, scale or inside/outside; drawing = the cutout that explains the project and still reads on a ~290–390 px card. Every layer is an image the project already publishes (checked by script), so alt text and sources are on record.

| # | Project | Layout | Main | Side | Drawing (cutout) |
|---|---|---|---|---|---|
| 1 | Zenata | trio | platform render (hero), pos 50% 55% | dusk corner | site access axo |
| 2 | Bolivar | duo-p | courtyard render (hero, portrait) | — | raised/lowered volumes axo |
| 3 | Al-Arg | trio-m | aerial at sunset (hero) | shaded courtyard | structure 01 (wall and timber shade) |
| 4 | Nouvelle Medina | trio | night section (hero) | aerial | passenger flows axo |
| 5 | Foubert | trio-m | brick street render (hero), pos 50% 60% | rear aerial | west facade |
| 6 | La Villette | duo-p | street render (hero, portrait) | — | facade module axo |
| 7 | Sentry | film | scrub film (videos/scrub/sentry-*) | at the window | roof elevation |
| 8 | Belhomme | duo-p | corner render (hero, portrait) | — | cross-section C-C' |
| 9 | Corallum | trio | corner (hero) | interior ramp | volume study (restrict) |
| 10 | Aïn Sebaâ | trio-m | screen facade (hero) | across the tracks | ground-floor plan |
| 11 | Avenir | duo-p | avenue de Verdun render (hero), 4:5 at pos 35% 50% | — | south elevation |
| 12 | Cinephile | trio | foyer (hero) | facade at dusk | concept sketch |
| 13 | Hay Mohammadi | duo | aerial (not the hero: the 2.85:1 front loses its ends at 16:10) | front, pos 30% 50% (keeps the sign) | — (no drawing in the content) |
| 14 | Papillon | trio-m | pool (hero), pos 40% 50% | front facade | plans |
| 15 | Tamansourt | trio | path between the wings (hero) | aerial | site plan |

Rejected after the preview: Nouvelle Medina exploded structure, Sentry section B-B, Aïn Sebaâ structural concept and Papillon site plan (too faint at card size); Hay Mohammadi front at pos 50 % (cut the sign). Order kept from plan 17's column (typologies alternate; no two `duo-p` adjacent). **For P2b:** `film` is the trio geometry with the scrub film as main (16:9); `duo` places main left and side bottom right, on top; drawings are referenced by their `images/cut/` path (A8); `why` is not published. Removed in P2b: `film`, `column`, `cover`, `proofs`, `research` (marked `$remove` in the JSON).

### P2b: Home build and motion
1. `home()` in `pages.mjs`:
   - the hidden h1 block (D103);
   - `<ol class="reel">` of `reelItem()` (a new partial in `partials.mjs`, reused in P5a): `<li class="reel__it reel__it--{layout}" data-fx="centre">` holding `<a class="reel__a" data-label data-cat>` and `.reel__stage` with its layers `.reel__l--{role}`;
   - a caption shown only for `(hover:none)` and narrow screens;
   - the closing mini tree (root and families with connectors, `count()` from D110);
   - Practice and Research removed.
2. The first item is centred in the first viewport; its main image is eager with `fetchpriority=high` and a preload. The `sizes` values account for the 1.28 entry scale. On phones the drawing layer is hidden and never fetched (`loading=lazy` plus `display:none`).
3. CSS templates and the D105 choreography; the phone layout; remove the old `.film*`, `.col__it/.col__stage/.col__card/.col__key/.coda` (keep `.col__h`/`.col__count`, used by the index) and `.rail` stays for P5a.
4. In `js/site.js`, the film layer uses the existing scrub hook, and `pageswap` targets `.reel__a`.
5. D109 cursor label.
6. Remove the Sidi Maarouf scrub assets (log them) and the now-unused home JSON keys.
7. QA:
   - the crop gate amended now (D112 rules);
   - qa.mjs lines ~484–489 (`#name`) rewritten;
   - a new home pass: assembled at load; centred item at d≈0, scale 1, blur 0; entering scale > 1; reversible; focus in view; label shows name and category; 375 touch shows captions with no Lenis and no blur; reduced motion static; largest empty band ≤ 25 vh.
8. Chrome-devtools performance trace at 1440 with 4× CPU throttle: no long frames during wheel scrolling.
9. `npm run perf`: home LCP < 2.5 s.
10. A montage of all 15 compositions per theme, compared with `docs/ref/` R1.

### P3: Index (tree first, rebuilt; grid without margins)
1. `tools/lib/tree-layout.mjs`, with `tools/tests/tree-layout.test.mjs` covering: no overlaps, inside the region, deterministic, equal area within 2 %, shortest side ≥ 40 px at 1440.
2. `work()`:
   - the partition families (D110);
   - default view `tree` from 48 rem;
   - `leafAt` and the 15-leaf cap removed;
   - leaves via `image()` with the drawing treatment, `data-label`/`data-cat` and the caption tag.
3. site.js: default view by width, family whitelist from the new ids, the D111 switch.
4. CSS: pills (inactive text ≥ 4.5:1), leaves, hover, `.edge` fades, grid tiles (D112), and list hover pills.
5. QA index pass:
   - tree by default at 1440, grid at 375;
   - grid checks run at `?view=grid`;
   - branch switch by keyboard;
   - leaf counts = `count()`;
   - no overlapping leaf boxes;
   - hover enlarges;
   - the viewer works from the grid and from image leaves;
   - the URL restores the view and family.
6. Montage compared with R2.

### P4: About sheet and about.html
1. A partial `aboutSheet()`, and `tools/build.mjs` passes the about data into ctx.
2. `layout.mjs` places the sheet after `</header>` on every page except about.html.
3. `about()` renders the same column as a page. Remove the tale, its rail, `scatter`, the dark ground and `on-dark` (after a grep). Prune the unused `about.json` keys.
4. Regenerate the CV (`npm run cv`; check the print layout).
5. site.js: the sheet module per D113, completing the ordered Esc handler.
6. CSS: veil, column (34 rem, X aligned with the header row), masked edges, the pale-card table, photos, `scrollbar-gutter`.
7. QA: rewrite `runAboutPass`:
   - open from 3 pages and from the phone menu;
   - X, Esc and an outside click close it and return focus;
   - dragging a text selection does not close it;
   - the page behind is inert and does not scroll;
   - the sheet scrolls with the wheel (Lenis not preventing it);
   - reduced motion is static;
   - axe passes with the sheet open;
   - about.html works standalone;
   - without JS the link navigates;
   - the header does not shift on open.
8. Montage compared with R3.

### P5a: Case-study reel (engine, template, 4 reference projects)
1. `project()`:
   - the opening track (D115), with `hero.pos` in content;
   - the Contents list removed; `.rail` chapter links added (`data-steps="auto"`);
   - `data-fx="centre"` assembly on rows and cells;
   - Next project = `reelItem()`;
   - an optional render `crop: { ratio, pos }`, with a build error if a drawing declares a crop.
2. CSS: the opening interpolation, figure choreography, caption follow, chapter-head rise, and the D116 gaps.
3. QA: the scroll pass uses `.rail a` instead of `.toc a`; a case pass checks the opening interpolation, the rail's current chapter, anchors clear of the header, and reduced motion.
4. Apply to Al-Arg, Zenata, Belhomme and Hay Mohammadi: both themes at 375, 1024 and 1440; duplicate text omitted and listed per D116.
5. Perf for Al-Arg and Belhomme.

### S0: Sync, sitemap, Sakura, amendment A (done 2026-10-23)
1. Pushed the 8 unpushed commits. Fetched, then merged `origin/main` (the owner's e0c0dca rename and 700642d robots line; clean, git carried the rename).
2. `tools/build.mjs` writes `sitemap-site.xml` and its robots line. `qa.mjs`, `redirects.test.mjs` and `tools/README.md` read it, and the test asserts one sitemap and the robots line.
3. Sakura pill (D123) in `aboutColumn()` and `research()`.
4. This amendment. D122–D124 in the decision log, and the ledger entries.
5. Build, tests, QA on the pages touched, screenshots. Then commit and push. PR #13 (the owner's, opened that morning) is the plan's PR: its empty body filled in, no duplicate opened.

### P5b: Case-study reel (the remaining 11)
1. Projects: Ain Sebaâ, Avenir, Bolivar, Cinephile, Corallum, Foubert, La Villette, Nouvelle Medina, Papillon, Sentry, Tamansourt.
2. For each: the hero `pos`, render crops where they help the rhythm, a de-duplication pass, and one montage per theme.
3. Run `node tools/qa.mjs --only=projects/project-<slug>.html --shots` for each.
4. Re-check the four from P5a after any template fix.
5. Full QA run.

### P5c: Case-study finish (all 15, D130)
1. Make a montage of all 15 at 375/1024/1440 in both themes (scratchpad Playwright script with the installed Chrome) and audit each against D130 and the R1/R2 frames.
2. Fix at the template level once (`css/site.css` case section, `figure()`/`row()`/`opening()` in partials.mjs). Fix per project only through content (`hero.pos`, `crop`, `$omit`).
3. Measure on every page (headless Playwright, rAF sampler; rewrite the scratchpad band and perf probes): widest empty band, frames at 1× and 4× CPU, reversibility, reduced motion.
4. Run `runCasePass` and the scroll and motion passes for all 15. Re-check the 4 pages from P5a.

### F1: Index filters (structure, D125–D127)
1. Content:
   - `country` in the 15 project JSONs (with a source note);
   - site.json `places` and `scales`;
   - a ledger note.
2. `facetsOf(project, site)` in `tools/templates/pages.mjs`, next to `catalogOf`. It feeds the `data-place`, `data-type`, `data-scale`, `data-year` and `data-practice` attributes on tiles (`tile()`), leaves (`leaf()` in `branch`) and list rows. `countOf` stays the single count source.
3. The panel markup in `work()` (the `.ix-bar`, and the result line under `.ix-head`).
4. `js/site.js` index module ("the index's views and families"):
   - `ixState` gains the facets, and the URL is read and written as today;
   - `ixApply` computes matches and live counts and sets `aria-disabled`;
   - the panel opens and closes with the focus handling;
   - the filter panel joins the one Esc handler;
   - empty-state handling for URL-only combinations.
5. CSS: the panel, the result line, dimmed leaves and disabled pills (contrast checked in QA), and the phone bottom-edge panel.
6. Tests: `tools/tests/facets.test.mjs`. It checks surface parsing (m², "Village: 1.4 ha", narrow spaces), year ranges, every project's country being allowed, that each facet's counts never exceed the projects, and the band counts 8/3/2.
7. QA: a new `runFilterPass` in `tools/qa.mjs`:
   - each facet changes the visible counts to the expected numbers (computed from the built data attributes);
   - combinations and Clear;
   - URL restore and Back;
   - keyboard only (Tab, Enter/Space, Esc returns focus);
   - disabled choices are not actionable;
   - tree leaves dimmed and inert, list rows;
   - axe with the panel open;
   - no overflow at 320/375, targets ≥ 24 px;
   - reduced motion instant;
   - no console errors.

### F2: Filter and Index motion, entry points (D128, D129, D131)
1. Implement the D128 animations and the D131 finish in the index module. Reuse the `treeSettle` pattern for interruption and `measureSoon()` after every reflow, and resize Lenis when the height changes.
2. Entry points (D129):
   - Place pills in the home `.tree-root` (`home()`);
   - the case-study facet line before the next project in `project()`.
   - QA coverage and the home/case passes are updated for them.
3. Measurements in headless Playwright:
   - frames during a filter change and a view switch at 1× and 4× CPU;
   - INP proxy (input to next frame) < 200 ms;
   - CLS 0 for the bar;
   - each animation interrupted mid-way settles without errors.
   - Montage: before and after for one filter combination in each view, both themes.

### P6: Research, Films, 404, phone menu
1. Research:
   - the three thesis mockups as an opening composition (reel grammar);
   - title, Arabic title, spec, abstract, and a "Read online" pill;
   - the report as a duo;
   - Sakura as a composition (certificate and Japan photos) with its award line.
2. Films:
   - a grid of 16:9 cover cards;
   - hover preview on a fine pointer only: muted, `src` set on first hover, paused and reset on leave, never on touch or under reduced motion (WCAG 2.2.2);
   - click plays with controls (inline or in the viewer, whichever is simpler once the viewer code has been read);
   - reels in the same grid; text trimmed per D116.
3. 404 and the phone menu: pill grammar, the chip in the menu.
4. QA and perf for both pages.

### P7: Whole-site coherence
1. A full QA run at 320/375/768/1024/1440/1920 in both themes, with the motion, smooth-scroll, theme, chip, sheet, home, index and case passes.
2. `npm run perf` (median of 3) for every page type.
3. `npm run og` to regenerate the cards.
4. Playwright WebKit (2359, installed): try the theme VT and the scrub film; record the result or mark it UNVERIFIED.
5. Amendment A: `runFilterPass` at all 6 widths × 2 themes; `npm run perf` also on `architecture.html?place=france&view=grid`; the sitemap check reads `sitemap-site.xml`.
6. Fix whatever these runs find.

### P8: Independent review
Run parallel read-only subagents and adopt their findings or log the declines:
- design against the `docs/ref/` montages;
- WCAG 2.2 AA (`ecc:a11y-architect`);
- code (`ecc:code-reviewer`);
- performance (`ecc:performance-optimizer`).

The design and a11y reviewers also cover the filter panel and the entry points (amendment A).

Then update the decision log, the ledger, tools/README and memory.

### P9: PR and merge
1. Fetch and merge `origin/main` if it moved. Push. Update PR #13's body: the summary, QA evidence, perf table, the UNVERIFIED list and the content gaps.
2. Merge once every gate passes (delegated by CLAUDE.md).
3. Check the live site (home, index tree and filters, About sheet, theme sync; `robots.txt` → `sitemap-site.xml`), then send the final report.

---

## 5. Critical files
- `tools/templates/pages.mjs`: `home`, `work`, `project`, `research`, `motion`, `about`.
- `tools/templates/partials.mjs`: `reelItem`, `aboutSheet`, the chip.
- `tools/templates/layout.mjs`: header, chip, sheet, footer.
- `tools/build.mjs`: `ctx.about`.
- New: `tools/lib/tree-layout.mjs` with its test.
- `js/site.js`, new modules: theme sync and VT, chip, sheet, tree switch, film hover.
- `css/site.css`: tokens, pills, reel, tree and grid, sheet, case reel, research and films, footer.
- Content: `content/site.json`, `content/pages/{home,about}.json`, `content/projects/*.json` (`hero.pos`, crops).
- QA: `tools/qa.mjs` (palette, crop gate, home, index, about, scroll and case passes), `tools/tests/theme.test.mjs`.
- Docs: `docs/flagship/18-reel-correction.md`, `decision-log.md`, `content-ledger.md`, `.gitignore`.
- `files/hazem-radhouani-cv.pdf` (regenerated).
- Amendment A: `tools/build.mjs` (sitemap), new `tools/tests/facets.test.mjs`, `runFilterPass` in `tools/qa.mjs`, `facetsOf` in pages.mjs, `content/site.json` (`places`, `scales`), `country` in `content/projects/*.json`.

**Reuse rather than rebuild:**
- the engine: `fxItems` with the `centre`/`track` kinds, `data-steps="auto"`, `naturalTop`, `measureSoon`, and the Lenis `hold` observer;
- the scrub film handler and the `pageswap` VT hook;
- the viewer dialog;
- `picture()`, `image()` and `dims()` from `tools/lib/images.mjs`;
- `words()`, `.edge` and `.rail`;
- the index state and URL module;
- `catalogOf()`;
- the QA motion, smooth-scroll and theme passes.

## 6. Content gaps and conflicts (never guessed)
- New email: supplied by the owner on 2026-10-22, recorded in the ledger. Category labels come from the existing descriptors. Sheet copy comes only from `about.json`. Any section with no source is marked [CONTENT NEEDED] in the progress doc.
- Conflict: D89 ("name centred at 32–60 px") against removing the hero. Resolved: the name stays centred in the header (dmcg's name block, accepted in plan 17), and the hero goes at the owner's request. Logged in D103.
- Conflict: D32/A10 (no crop) against "no margins / you can crop". Resolved by D112: crops only in thumbnails, compositions and declared render crops. Drawings are never cropped, and enlargement still fails QA.
- Amendment A, the Sakura programme site: supplied by the owner on 2026-10-23 (`owner:2026-10-23`). Its contents are not described on the site.
- P5c (D134): [CONTENT NEEDED: an export of the Aïn Sebaâ site plan without its printed "PLAN MASSE 1-1000" title and north arrow, if one exists]. No crop removes them (they stand beside the lower station building the caption names), and renders stay as authored (D69), so the render is shown as it is.
- Amendment A, gaps for the filters (D125), published as absences and never guessed:
  - [CONTENT NEEDED: built surface for Sentry (guard pavilion), to place it in a scale band]
  - [CONTENT NEEDED: total surface for Avenir (R+7 and R+5), to place it in a scale band]
  - [CONTENT NEEDED: programme type for Sentry, if the owner wants it under a Type filter; today it matches Practice, Place and Year only]
- Amendment A, interpretation: "index page or the main page" read as the Index (D129, §1b).

## 7. Verification (end to end)
- **Build and tests:** the build has no errors, and `tools/tests/*.test.mjs` (theme, tree-layout, chapters, images, identity, redirects, vendor) pass.
- **QA on the file: base:** overflow, images, axe WCAG 2.2 AA, targets, contrast, palette, crop and enlargement, grid and coverage gates, at 6 widths × 2 themes, plus the interaction passes listed per phase.
- **Performance:** `npm run perf` must show LCP < 2.5 s and CLS < 0.1 on home, index, three case studies, about, research and films. The devtools trace must show no long frames on the home reel.
- **Visual:** montages compared with `docs/ref/` (R1–R3) in both themes, and under reduced motion.
- **UNVERIFIED unless P7 proves them:** iOS Safari scrub and VT mask (Playwright WebKit attempt), and Firefox VT (feature-detected; instant swap otherwise).
