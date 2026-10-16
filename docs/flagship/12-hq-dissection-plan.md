# 12 · HQ dissection, cutouts, dark treatments and identity: execution plan

| | |
|---|---|
| Date | 2026-10-14 |
| Status | Approved by the owner (plan mode, 2026-10-14); executing |
| Continues | `10-hq-media-theme-continuation-brief.md`, `11-hq-media-theme-implementation-plan.md` |
| Decisions | D49–D54 in `decision-log.md` |

## Context
The owner supplied `Images HQ/` (untracked, 1.8 GB, 193 files, 16 folders) and asked for four things:
- Every image is dissected and read: crop exactly, drop studio furniture, and re-set useful text in the site's fonts.
- White backgrounds are removed perfectly.
- The site gets a light and a dark theme.
- He stops being described as "specialised in heritage/earthen". His work spans Tunisia, France, Morocco and Japan.

**Where things stand (verified this session).** A previous session left everything uncommitted on `flagship-upgrade`. It wrote brief `docs/flagship/10-…` and plan `11-…` and implemented most of Tasks 1–4:
- **D45 identity:** the new line "Architect with project work in Tunisia, France and Morocco, and research experience in Japan". `CLAUDE.md` is already updated.
- **D46:** graded alpha is the default; `halo` is retired.
- **D47 dark Field:**
  - grounds `#121311`, ink `#F7F5EF`;
  - toggles in the header, bar and menu;
  - a pre-paint bootstrap script;
  - dual-scheme QA in `tools/qa.mjs`;
  - every drawing sits on a light "inspection field" (`.nw--drawing{background:var(--drawing-bg)}`).
- **D48:** `tools/hq-audit.mjs`, `docs/flagship/hq-asset-audit.json` (193 records) and `tools/hq-media.json`.
- **Importer:** `tools/import-hq-media.mjs` (exact copy or crop), with tests in `tools/tests/*.test.mjs`.
- **Imports:** 3 renders so far: `bolivar-*-hq.jpg` and `foubert-brick-render-hq.jpg`.

**Gaps found:**
- The imported masters are full-resolution copies (5–25 MB). Their derivatives reach 6 943 px, too heavy for git and Pages.
- Crops re-encode through ffmpeg's default JPEG quality.
- There is no object matting, no text re-setting, no splitting of multi-image pages, and no dark treatment other than the light field.
- Task 5 (bulk dissection) and Task 6 (final QA, PR) are not done.

**Survey facts:**
- **Studio BELEM sheets** are 300 dpi A3 and A0 exports with frames, cartouches, key plans and legends.
- **2025 portfolio pages** have page tabs and text blocks; many hold 3–14 sub-images.
- **The `.trashed-*` files** are the best clean renders (3 840–7 680 px).
- **No PNG has real alpha.**
- **Tooling:** no Python, sharp, ImageMagick, OCR or ML matting. The engine is Node 24, ffmpeg 9.0.2, poppler, Chrome and playwright-core. Claude's vision reads the text, on zoomed tiles.

## 0. Enhanced brief (the owner's prompt, rewritten)
> Continue Hazem Radhouani's portfolio as architect, creative director, designer and engineer, under `CLAUDE.md` and briefs 10/11. Never invent facts. Decide, log and proceed.
>
> 1. **Account for all 193 HQ files.** Read every word on each at zoom. Give each text element a disposition:
>    - *furniture* (cartouche, studio mark, page tab, code, frame): cropped away;
>    - *title or scale*: becomes the HTML caption;
>    - *callout or legend on blank paper*: removed from the pixels and re-set as HTML labels or a legend in the site fonts;
>    - *intrinsic labels* (rooms, dimensions, levels): stay, summarised in the alt text;
>    - *prose or facts*: sourced content candidates.
> 2. **Give every published image a reproducible recipe:** exact source-pixel crop and split, size cap, encoder and mode. Never cut through geometry, never upscale, never edit a render.
> 3. **Remove white backgrounds perfectly, per mode:**
>    - *ink*: true colour-to-alpha with no halo;
>    - *object*: a matte connected to the border, so interior whites stay solid and shadows become translucent;
>    - *scene*: untouched.
>
>    Prove each one with pixel gates and with review sheets on white, charcoal and magenta, plus 1:1 edge zooms.
> 4. **Dark theme:** linework that is only black or grey is shown as light ink on charcoal, so its background is truly gone. Drawings whose colours carry meaning sit on the light inspection field. Renders and objects stay unchanged.
> 5. **Publish what the material supports:** better heroes and figures for all 14 projects, Villeneuve-la-Garenne, the PBR material capture, and the thesis-book mockups.
> 6. **Verify** at 6 widths × 2 themes against WCAG 2.2 AA and the performance budgets, with independent reviews. Merge through a PR.

## 1. Decisions to log (D49–D54, `docs/flagship/decision-log.md`)
- **D49 · Annotation removal on blank paper.**
  - **Decision:** allowed only when all of these hold:
    - the text components lie entirely inside a declared rectangle;
    - each is a dark connected component touching no other ink;
    - the background is blank paper;
    - the drawing is not a render or photo;
    - the text is re-set in HTML.
  - **Cropping first:** use a crop instead whenever the text lies outside the drawing's bounding box.
  - **Why:** the owner explicitly asked for this, and the information is preserved as type. This supersedes brief 10's blanket "no erase" (logged as a conflict). Its ban on generative or content-aware editing stays absolute.
- **D50 · Dark treatment per drawing**, measured automatically and confirmed in review:
  - `invert`: greyscale linework, CSS `invert(.965)`. This is exact for greyscale, costs no extra bytes and switches instantly.
  - `invert-accent`: neutral ink with thin colour annotations, `invert(.965) hue-rotate(180deg)`.
  - `field`: colour-coded or shaded drawings, on the existing `--drawing-bg`.
  - `object` and `scene`: unchanged.

  Rejected:
  - Precomputed dark variants: double the files, and swapping `<source media>` breaks with a manual toggle.
  - Inverting everything: changes authored colours, as brief 10 warned.
  - Field for everything: brings the white background back, against the owner's request.
- **D51 · Master caps.**
  - Renders: long edge ≤ 2 560 px (revised from 3 840 at execution: `.git` already weighs 458 MB), area downscale, JPEG `-q:v 2` 4:4:4.
  - Drawings: ≤ 4 096 px, PNG.
  - Derivatives: 480/800/1200/1600/2000/2560, plus native only when it is ≤ the cap.
  - Rebuild the 3 imported renders at the cap.
  - Budget gate: `images/` ≤ 450 MB; images are committed once final, never as intermediate versions.
  - Why: the Pages and repo limits, while still covering a 4K viewer.
- **D52 · One manifest per project** (`tools/hq-media/<slug>.json`) and one audit file per folder (`docs/flagship/hq-audit/<folder>.json`), loaded as a union. Why: parallel agents never edit the same file.
- **D53 · Villeneuve-la-Garenne becomes a Paris case study:**
  - credited "Studio BELEM";
  - facts visible on the sheets only (programme, permit stage December 2025, location);
  - **no personal-role claim:** `[CONTENT NEEDED: your role]`;
  - client names withheld;
  - not featured on the home page.

  This supersedes brief 10's "no case study". The owner deliberately supplied the folder for the portfolio, and an office credit with no role makes no false claim.
- **D54 · Memoire:** the book mockups show the thesis title and the author "حازم رضواني". If they match `content/pages/research.json`, publish them on Research with the thesis. Cut them out in `object` mode, shadow kept translucent. The Cinephile render containing a film title stays rejected, because renders are never edited.

## 2. Phases

### Phase 0 · Baseline and safekeeping (me)
1. Run the baseline:
   - `node --test tools/tests/*.test.mjs`
   - `node tools/hq-audit.mjs --check`
   - `npm run build`
   - `npm run serve` + `npm run qa`

   Record the results and fix any red before going further.
2. Add `/Images HQ/`, `/Skills/` and `/docs/Skills/` to `.gitignore`. These are user sources and are never deleted.
3. Measure the size of `images/`.
4. Commit the previous session's work in logical steps:
   - audit;
   - graded cutouts and media;
   - dark Field and QA;
   - identity and OG/CV;
   - importer (the 3 heavy masters stay out until Phase 1a re-imports them at the cap).
5. Copy this plan to `docs/flagship/12-hq-dissection-plan.md`, and log D49–D54.

### Phase 1 · Engine upgrades (me, tests first like plan 11)
- **a. `tools/import-hq-media.mjs`:**
  - `maxEdge` (ffmpeg `scale…:flags=area`), explicit encoders, and `outputs[]` so one page can be split into several crops;
  - a bounds and no-upscale check;
  - load `tools/hq-media/*.json`.

  Tests go in `tools/tests/import-hq-media.test.mjs`.
- **b. `tools/media.mjs`:** add the 2560 width; native width only when it is ≤ the cap. `images.mjs` `largest()` stays as it is.
- **c. `tools/cutout.mjs` (+ `tools/lib/cutout-alpha.mjs`, `cutout-review.mjs`, `cutout.json` schema):**
  - `mode: "object"`: a flood fill from the border through near-paper pixels, stopped by hysteresis and gradients; colour-to-alpha only inside the background region plus a 2 px band; manual `keep`/`bg` rectangles.
  - `erase[]`: the D49 rules, with an `id`.
  - A despeckle step.
  - A sidecar `images/cut/<slug>/<stem>.json`:
    - erase positions as % of the output (for labels);
    - ink chroma statistics giving `mono`, `accent` or `colour`;
    - trim offset.
  - Edge-clearance gate: the outer 2 px ring is transparent unless `clip: ["top", …]` is declared.
  - Review sheets: white, charcoal and magenta, plus four 1:1 edge zooms and the densest tile.
- **d. Dark treatments (D50):**
  - `partials.mjs` `figure()`/`image()` emit `nw--invert` / `nw--invert-accent` / `nw--field` from `cutout.json` `dark`;
  - CSS rules under `html[data-theme=dark]`;
  - `js/site.js` viewer copies the treatment class into the stage;
  - `qa.mjs` asserts each image's computed filter or background per theme, and warns when the manual choice disagrees with the sidecar statistic.
- **e. Labels and legends:**
  - Figure JSON gains:
    - `labels:[{at:"<erase id>", text, align}]`, positioned from the sidecar;
    - `legend:[{swatch:"#hex", text}]`.
  - Markup: absolutely positioned real text in the `.lab` container (`container-type:inline-size`), Plex Sans 600 at `clamp(13px, …)`.
  - Below about 30 rem the labels become numbered markers plus an `<ol>`.
  - QA: no overlaps, inside the image, ≥ 13 px, at all 6 widths.
- **f. Per-folder audit and per-project manifests (D52).** `hq-audit.mjs` validates the union; migrate the current JSON.

Commit after each of a–f, each with green tests.

### Phase 2 · Calibration on archetypes (me, before any fan-out)
Run the full chain on six archetypes and inspect every sheet at 100 %. Tune the defaults, and record the reference outputs in the protocol.

| Archetype | Source | Exercises |
|---|---|---|
| Wide linework | `Ain Sbaa/COUPE AA.jpg` | crop away the title, `clip` on the level lines, `invert` |
| Shaded exploded axo with labels | `Ain Sbaa/Structure.jpg` | 4 erases + labels, `field` |
| BELEM sheet | `FOUBERT [16-20]_0003` | cartouche crop, colour → `field` |
| Portfolio page split | `Zenata [6-10]_0005` | 3 plans in a series at one scale |
| Mockup | `Memoire/001.png` | `object` with shadow |
| Huge `.trashed` render | `Tabarka Image_4.png` | cap and encode |

Then write `docs/flagship/13-dissection-protocol.md`: per-file steps, tiling commands, the text-disposition table, recipe and content templates, gates, and the definition of done.

### Phase 3 · Dissection (parallel general-purpose subagents, batches of 3–4)
Each agent owns its folders exclusively:
- writes `docs/flagship/hq-audit/<folder>.json`, `tools/hq-media/<slug>.json`, its `cutout.json` entries (via a per-slug include file, so nothing is shared) and `content/projects/<slug>.json`;
- runs `import` → `cutout --sheet` → `media` for its slug only;
- views every review sheet, then iterates until the gates pass;
- returns its selections, rejections, `[CONTENT NEEDED]` items and transcribed text.

Batches:
- A: stations (Ain Sbaa, Zenata, Nouvelle Medina, Hay Mohammadi)
- B: BELEM (Belhomme, Bolivar, Foubert, La Villette)
- C: Villeneuve, EL erg + PBR, Memoire, Cinema
- D: Tabarka, Guerite, Hospital, Villas

After each batch I:
- run build + qa on its pages;
- personally inspect every hero and ≥ 25 % of the sheets;
- commit per project.

If an agent hits a rate limit, I resume it; if that fails, I take the folder sequentially.

### Phase 4 · Content and information architecture (me)
- New `content/projects/villeneuve.json` (D53).
- A PBR material plate on Al-Arg: clay and stone walls, 5 maps each, square tiles, source "folder: By hazem".
- Memoire on Research (D54).
- Re-pick home "selected work" and capabilities from the stronger HQ renders.
- Finish the identity sweep: `rg` for the superseded wording; `knowsAbout`; the Work-page phrase "Paris, Morocco and Tunisia".
- Run `tools/ledger.mjs`, `npm run og` and `npm run cv`.

### Phase 5 · Look at what was made (design pass in both themes)
- Screenshots of every page at 320/375/768/1024/1440/1920 × light/dark (`npm run qa -- --shots`). I review them myself, using `frontend-design`/`impeccable`.
- Independent subagents:
  - `design:design-critique` (vision, against `08-direction.md`);
  - `ecc:a11y-architect`;
  - `ecc:code-reviewer` on the diff.
- Fix the findings and re-shoot.

### Phase 6 · Gates, report, PR
1. Run, from a fresh serve:
   - `node --test tools/tests/*.test.mjs`
   - `node tools/hq-audit.mjs --check`
   - `node tools/import-hq-media.mjs --check`
   - `npm run build`
   - `npm run qa` (both schemes, all gates)
   - `npm run perf` (LCP < 2.5 s, CLS < 0.1)
   - `git diff --check`
   - size budget
2. Update `09-qa-report.md` (tested, how, not tested), `08-direction.md` (D49–D54), `tools/README.md`, the ledger and memory.
3. Open a PR from `flagship-upgrade` to `main` and merge it once every gate is green (`superpowers:verification-before-completion` first).

## 3. Critical files
- **Tools:** `tools/import-hq-media.mjs`, `tools/cutout.mjs`, `tools/cutout.json`, `tools/lib/cutout-alpha.mjs`, `tools/lib/cutout-review.mjs`, `tools/media.mjs`, `tools/lib/images.mjs`, `tools/hq-audit.mjs`, `tools/qa.mjs`.
- **Templates and front end:** `tools/templates/partials.mjs`, `pages.mjs`, `layout.mjs`, `css/site.css`, `js/site.js`.
- **Content:** `content/projects/*.json`, `content/pages/{home,research}.json`, new `content/projects/villeneuve.json`, `tools/hq-media/*.json`, `docs/flagship/hq-audit/*.json`, `docs/flagship/{decision-log,content-ledger,08-direction,09-qa-report,12,13}.md`, `.gitignore`.

## 4. Verification (definition of done)
- **All 193 HQ files** have a disposition. Every published derivative has a recipe and passes the importer `--check`.
- **Every cutout** passes the pixel gates (edge clearance, fringe on charcoal, detail, no leftover erased ink, series scale, no upscale, size) and a human or vision sheet review.
- **Both themes, all pages, 6 widths:**
  - axe WCAG 2.2 AA with 0 violations;
  - palette, crop, grid and label gates green;
  - toggle persistence, sync, keyboard operation and no flash tested;
  - the dark treatment of each drawing asserted.
- **Measured:** LCP < 2.5 s and CLS < 0.1 on throttled mobile; `images/` within budget.
- **No superseded identity wording** anywhere, including `og/home.jpg` and the CV.
- **The final report** lists what was tested, what was not, every withheld source and every `[CONTENT NEEDED]` item.
