# Plan 18 "Reel, corrected": deep correction to flagship level, in eleven resumable phases

> Approved 2026-10-22. Source plan: `C:\Users\Hazem\.claude\plans\enhance-this-prompt-for-keen-frog.md` (copied here, P1a).
> **Resume:** read this file's Progress table, start the first unticked phase, view the matching `docs/ref/` frames (gitignored; re-extract with the ffmpeg commands in §2 if missing).

## Progress

| Phase | Scope | Status | Commit / notes |
|---|---|---|---|
| P1a | Foundation: tokens, pills, footer, references, name-overlap gate | done | commit "Plan 18 P1a"; full QA 27/27 ok (file: base, 404 checks skipped) |
| P1b | Email chip, form removal, theme sync + reveal | done | commit "Plan 18 P1b" (D107, D108); chip beside Contact only from 105 rem (measured: at the plan's 64 rem it covers the name); CV regenerated now as well as in P4 |
| P2a | Home compositions (content only) | todo | |
| P2b | Home build and motion | todo | |
| P3 | Index: tree first, rebuilt; grid without margins | todo | |
| P4 | About sheet and about.html | todo | |
| P5a | Case-study reel: engine, template, 4 reference projects | todo | |
| P5b | Case-study reel: remaining 11 | todo | |
| P6 | Research, Films, 404, phone menu | todo | |
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
6. Make small commits on `flagship-upgrade`.
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

### P5b: Case-study reel (the remaining 11)
1. Projects: Ain Sebaâ, Avenir, Bolivar, Cinephile, Corallum, Foubert, La Villette, Nouvelle Medina, Papillon, Sentry, Tamansourt.
2. For each: the hero `pos`, render crops where they help the rhythm, a de-duplication pass, and one montage per theme.
3. Run `node tools/qa.mjs --only=projects/project-<slug>.html --shots` for each.
4. Re-check the four from P5a after any template fix.
5. Full QA run.

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
5. Fix whatever these runs find.

### P8: Independent review
Run parallel read-only subagents and adopt their findings or log the declines:
- design against the `docs/ref/` montages;
- WCAG 2.2 AA (`ecc:a11y-architect`);
- code (`ecc:code-reviewer`);
- performance (`ecc:performance-optimizer`).

Then update the decision log, the ledger, tools/README and memory.

### P9: PR and merge
1. Push. Open a PR to `main` (`gh pr create`) with the summary, QA evidence, perf table and the UNVERIFIED list.
2. Merge once every gate passes (delegated by CLAUDE.md).
3. Check the live site (home, index tree, About sheet, theme sync), then send the final report.

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

## 7. Verification (end to end)
- **Build and tests:** the build has no errors, and `tools/tests/*.test.mjs` (theme, tree-layout, chapters, images, identity, redirects, vendor) pass.
- **QA on the file: base:** overflow, images, axe WCAG 2.2 AA, targets, contrast, palette, crop and enlargement, grid and coverage gates, at 6 widths × 2 themes, plus the interaction passes listed per phase.
- **Performance:** `npm run perf` must show LCP < 2.5 s and CLS < 0.1 on home, index, three case studies, about, research and films. The devtools trace must show no long frames on the home reel.
- **Visual:** montages compared with `docs/ref/` (R1–R3) in both themes, and under reduced motion.
- **UNVERIFIED unless P7 proves them:** iOS Safari scrub and VT mask (Playwright WebKit attempt), and Firefox VT (feature-detected; instant swap otherwise).
