# 11 · HQ media, theme and identity implementation plan

| | |
|---|---|
| Date | 2026-10-13 |
| Status | Approved for autonomous execution under `CLAUDE.md` and brief 10 |
| Implements | `10-hq-media-theme-continuation-brief.md` |

## Guardrails

- Work in the existing `flagship-upgrade` checkout. `Images HQ/`, `Skills/` and `docs/Skills/` remain untracked, immutable user sources.
- Do not publish a source until its audit record contains the owner authorization, visible credit and an evidence-backed relationship to an existing case study. Do not create a Villeneuve-la-Garenne or `Memoire` case study.
- A production derivative is only an exact rectangular crop, deterministic resize or deterministic paper-to-alpha conversion. Generative editing, fill, erasure, cloning and content-aware retouching are prohibited.
- Add a test before each new behaviour. Run the focused test before implementation, then the whole relevant test set after it.
- Regenerate committed outputs only from their documented generators. Do not hand-edit generated HTML, OG cards, CV or responsive derivatives.

## Task 1 — Establish auditable HQ-source and production-media records

**Files**

- Create `tools/hq-audit.mjs` and `tools/tests/hq-audit.test.mjs`.
- Create `docs/flagship/hq-asset-audit.json` and `tools/hq-media.json`.
- Amend `tools/README.md`, `docs/flagship/content-ledger.md`, and `docs/flagship/decision-log.md`.

**Implementation**

1. Write failing Node tests for a deterministic inventory: stable slash-separated source paths, SHA-256, source dimensions, all required audit fields and the rule that a production-manifest source must be an approved audit entry.
2. Implement `hq-audit.mjs` as a read-only inventory validator/generator. It must identify all supported HQ source images, calculate source hashes and dimensions without modifying the source library, validate the two JSON schemas, and fail on an inventory/count mismatch or an invalid production selection.
3. Populate the complete 193-file audit with conservative dispositions. Record the visible mapping evidence where available; otherwise use `unresolved` and a reason rather than guessing. Include exact role/credit/authorization fields even when the answer is `not established`.
4. Start the production manifest with only visually reviewed, full-scene candidate assets whose project mapping and existing caption evidence are already confirmed. Each record includes a source hash, a `null` crop for an untouched scene or an exact source-pixel crop box, image treatment, dark treatment, credit, authorization evidence, caption evidence and review status. No output file is added yet merely by adding a candidate.
5. Record the inventory, its limits, and the approval gate in the ledger and decision log.

**Verification**

```powershell
node --test tools/tests/hq-audit.test.mjs
node tools/hq-audit.mjs --check
```

## Task 2 — Make the deterministic cutout workflow genuinely dark-safe

**Files**

- Amend `tools/cutout.mjs`, `tools/cutout.json`, `tools/qa.mjs`, and `tools/README.md`.
- Create `tools/tests/cutout.test.mjs`.

**Implementation**

1. Add failing fixture-driven tests for the default alpha mode, true alpha around fine antialiased ink, transparent corners, and review-sheet fields on white, charcoal and magenta.
2. Change the default to `graded`; retain `halo` only as a documented legacy exception that may never be classified dark-compatible. Update the config comment and every resulting rationale.
3. Extend `--sheet` to produce a three-panel review field: white, dark Field charcoal, and magenta. Preserve dimensions and use the same derivative in every panel.
4. Extend QA's cutout gate beyond corners: sample alpha-edge pixels to reject opaque white fringe, verify representative semi-transparent detail remains, and make the result explain which image failed. Do not attempt automatic semantic reconstruction of a drawing.
5. Rebuild existing cutouts and their responsive media only after the tests establish the safe path; inspect every changed cutout review sheet manually before accepting it.

**Verification**

```powershell
node --test tools/tests/cutout.test.mjs
npm run cutout -- --force --sheet
node tools/media.mjs --force images/cut
```

## Task 3 — Build a no-flash, accessible dual-scheme Field interface

**Files**

- Amend `tools/templates/layout.mjs`, `css/site.css`, `js/site.js`, `tools/build.mjs`, `content/site.json`, `tools/qa.mjs`, and `tools/tests/theme.test.mjs`.
- Regenerate static HTML with `npm run build`.

**Implementation**

1. Write tests that assert the generated shell has a pre-stylesheet preference bootstrap, an accessible theme switcher in the desktop header, compact bar and mobile dialog, safe storage fallback, and a static light manifest default.
2. Render `data-theme` before CSS loads. The bootstrap must use a valid persisted `light` or `dark` override when safely available, otherwise resolve `prefers-color-scheme`, without throwing if storage is blocked.
3. Add CSS tokens for a light Field and the specified charcoal/warm-white dark Field. Replace page-surface literals with tokens, preserve print's light ink-on-paper mode, and keep deliberate light inspection surfaces for non-invertible drawings.
4. Add a single preference controller in `site.js`: sync all three controls, update `aria-pressed`/action labels, persist safe choices, update the browser theme-color meta element, and respect explicit user choice over system changes.
5. Extend browser QA to execute all pages in both themes at every required width, test bootstrap/system fallback, persistence through reload and navigation, synchronization and keyboard operation of all controls, dialog/viewer/form/focus/reduced-motion states, and both palette/contrast sets.
6. Capture representative 375 and 1440 screenshots in both themes for manual visual review.

**Verification**

```powershell
node --test tools/tests/theme.test.mjs
npm run build
npm run qa -- --shots
```

## Task 4 — Reposition the identity and regenerate all derived public artifacts

**Files**

- Amend `CLAUDE.md`, `content/site.json`, `content/pages/home.json`, `content/pages/about.json`, `tools/build.mjs`, and the relevant generator/template inputs.
- Amend `docs/flagship/08-direction.md`, `docs/flagship/content-ledger.md`, `docs/flagship/decision-log.md`, and `tools/README.md`.
- Regenerate `index.html`, all affected pages, `site.webmanifest`, `images/og/*.jpg`, and `files/hazem-radhouani-cv.pdf`.

**Implementation**

1. Write a failing content/metadata test that rejects the superseded specialisation wording anywhere in source, generated HTML, JSON-LD, OG text input and CV-visible source text.
2. Make the instruction authority say: project work is documented in Tunisia, France and Morocco; Japan is research experience, not a practice/base claim. Retain supported heritage/rehabilitation, BIM, visualisation and infrastructure facts only as evidence of capabilities.
3. Update the person line, home title/description, about biography, Person JSON-LD `knowsAbout`, and source references in the ledger together. Do not change factual experience entries without a cited source.
4. Revise Field documentation to preserve the single-grid/no-card direction while superseding its light-only and blanket no-crop rules with the evidence-preserving crop and two-scheme rules in brief 10.
5. Re-run the build, ledger, OG and CV generators so every published artifact agrees with the content source.

**Verification**

```powershell
node --test tools/tests/identity.test.mjs
node tools/ledger.mjs
npm run build
npm run og
npm run cv
rg -n -i "speciali[sz]ing in heritage documentation|earthen/vernacular architecture|make heritage rehabilitation a speciality" CLAUDE.md content tools *.html projects files docs
```

## Task 5 — Import only reviewed HQ derivatives and prove their presentation

**Files**

- Create `tools/import-hq-media.mjs` and `tools/tests/import-hq-media.test.mjs`.
- Amend `tools/hq-media.json`, selected `content/projects/*.json`, audit records, responsive media and generated pages.

**Implementation**

1. Add failing tests for source-hash matching, approved audit status, exact in-bounds crop boxes, lower-case destination paths, no upscale, and refusal to overwrite an output whose recipe differs.
2. Implement the importer with Node plus existing ffmpeg tooling. It reads only the committed manifest, checks its source against the immutable audit, copies or crops into stable `images/<slug>/` paths, and writes no value outside declared output paths.
3. Visually review each selected full-scene render before publication against its existing project caption. Prefer a small number of high-confidence replacements or additions over bulk image dumping. If a caption or credit cannot be verified, leave the candidate `withheld`.
4. Produce responsive WebP/AVIF derivatives through the existing media tool, amend the relevant content JSON with accurate `alt`, caption and source evidence, rebuild, and rerun alpha review where a drawing is selected.
5. Manually check selected project pages in light/dark at 375 and 1440. A colour scene remains unmodified; a drawing's theme treatment follows its manifest classification.

**Verification**

```powershell
node --test tools/tests/import-hq-media.test.mjs
node tools/hq-audit.mjs --check
node tools/import-hq-media.mjs --check
node tools/media.mjs images/<selected-slug>
npm run build
npm run qa -- --shots
```

## Task 6 — Final evidence, performance and review

**Files**

- Update `docs/flagship/09-qa-report.md`, `docs/flagship/decision-log.md`, and the continuation brief status.

**Implementation**

1. Run the complete test suite, source-audit validation, build, cutout checks, responsive media build, dual-theme browser QA, OG/CV generation and mobile performance measurement from a fresh local serve.
2. Review generated screenshots and representative cutout sheets at 100% for crop integrity, dark-field fringes, visual rhythm, focus indicators and no palette leakage.
3. Record command output, test scope, manual checks, known limitations, every withheld source and the fact that no Villeneuve-la-Garenne or `Memoire` personal case study was published.
4. Inspect the final diff for source-library edits, stale generated artifacts, accidental huge files, wrong project mappings, unsupported claims and unintended dependency changes. Request an independent code review before calling the work complete.

**Verification**

```powershell
node --test tools/tests/*.test.mjs
node tools/hq-audit.mjs --check
npm run build
npm run cutout -- --sheet
npm run media
npm run qa -- --shots
npm run perf
npm run og
npm run cv
git diff --check
git status --short
```

## Planned order and dependency rule

Tasks 1 and 2 establish the non-negotiable evidence/media rules. Task 3 may proceed independently after its test scaffolding exists; task 4 may proceed independently after its content test scaffolding exists. Task 5 depends on Task 1 and the reviewed importer; Task 6 depends on every other task. Any source that fails an audit, crop, visual or attribution gate remains in the audit as `withheld` instead of blocking the rest of the portfolio.
