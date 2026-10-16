# 09 · QA report: Field (2026-10-13), with the HQ re-derivation update (2026-10-16)

## Update 2026-10-16: HQ re-derivation (D45–D68), before the browser run
All 15 case studies were re-derived from `Images HQ/`. The local preview server could not be started: the owner allowed it, but the Claude Code permission classifier refused `npm run serve` and any request to `127.0.0.1:8090`. So **no browser check of the new pages has run yet**; the 2026-10-13 results below describe the previous release.

**Run and passing (commit `1baf307`):**
| Check | How | Result |
|---|---|---|
| Unit tests | `node --test tools/tests/*.test.mjs` | 39 / 39 pass, including: every shipped cutout has a sidecar and a dark treatment; every image a built page references is tracked by git; theme control naming; viewer treatment per image |
| HQ audit | `node tools/hq-audit.mjs --check` | 193 sources, 211 recipes valid; no `review-required` record in any folder |
| Masters | `node tools/import-hq-media.mjs --check --only=images/<slug>/` for every slug | all current |
| Build | `npm run build` | 22 pages, 15 projects |
| Missing images | every `images/…` reference in every built page checked on disk | 0 missing |
| Unreferenced media | exact-path scan of pages, content, tools, CSS and JS | 303 superseded files removed (D65, D68), 0 referenced |
| Cutout review | every new or re-made cutout's sheet (white, charcoal, magenta, dark rendering) and 1:1 detail, by eye; at least a quarter of each agent's sheets re-checked in the main session | passed; edge gate and erase counts clean |
| Independent static reviews | an accessibility review (WCAG 2.2 AA) and a code review of the diff, by subagents | 14 + 8 findings; adopted or declined with reasons in D68 |
| Identity sweep | grep of shipped files for the superseded wording | none left in pages or content (the share cards and CV still need regenerating) |

**Not yet run (needs the server):** `npm run qa -- --shots` (axe in both schemes, overflow, crop, grid, palette, alpha, label and pin gates at 6 widths), `npm run perf`, a screenshot review and design critique, `npm run og` and `npm run cv` (the share cards and the CV still show the old heroes and the old identity line).

---

Everything below was run on branch `flagship-upgrade` against the local server (`npm run serve`, base `/portfolio/`), with Chrome 155 unless stated otherwise.

## Automated, all pages (21 URLs, including the 404 page and a missing URL), at 320 / 375 / 768 / 1024 / 1440 / 1920 px
`npm run qa` exits 0. On every page and width it found:

| Check | Result |
|---|---|
| Horizontal overflow | none |
| Broken images | none |
| Console errors | none (the missing-URL test's own 404 is its expected outcome) |
| Text under 13 px | none |
| Interactive targets under 24 × 24 px outside text | none |
| axe-core WCAG 2.0 / 2.1 / 2.2 A + AA, at 375 and 1440 | 0 violations |
| **Crop**: rendered ratio within 1% of the master, never `object-fit: cover`; served file's ratio within 2% | 0 |
| **Upscale**: rendered width never above the master's pixels | 0 |
| **Grid**: every block on a `.g` grid starts and ends on a column line (±1 px) | 0 |
| **Palette**: background colours limited to #FFFFFF, #111111, transparent and the bar (375 and 1440) | 0 (no cream anywhere) |
| **Alpha**: every drawing cutout and book object has transparent corners (1440); one declared full-bleed map excepted (D44) | 0 |
| **Content coverage**: every content string in `content/**` is present in its page (titles included; sources, ids and paths excluded; the home cover photo left out by D37) | 0 missing |

## Performance (`npm run perf`: 412 × 823, DPR 2, slow 4G 150 ms / 1.6 Mbps, 4× CPU, median of 3)
| Page | LCP | CLS | Transfer at load |
|---|---|---|---|
| Home | 1.32 s | 0.000 | 486 KB |
| Work | 1.18 s | 0.000 | 503 KB |
| Al-Arg | 1.26 s | 0.000 | 370 KB |
| Belhomme | 1.71 s | 0.000 | 420 KB |
| Zenata | 1.40 s | 0.000 | 427 KB |
| Research | 1.66 s | 0.000 | 377 KB |
| About | 1.20 s | 0.000 | 313 KB |
| Films | 1.57 s | 0.000 | 453 KB |

Measured after the final review fixes. Every page is under the 2.5 s LCP and 0.1 CLS budgets.

## Scripted interaction (Chrome 155, Playwright)
- **Viewer on Belhomme.** The link opens the dialog, and focus lands on "close". The live title reads "Existing facades survey, image 3 of 10". ArrowRight moves to 4 of 10, with a single image in the stage. "Actual size" toggles, and Esc closes. Focus returns to the figure that was shown, and page scrolling is restored. Closing with the button animates back into the source. No console errors.
- **Cross-document view transitions.** Supported by Chrome 155: `startViewTransition` was present and `linear()` was supported. The morph itself was not inspected frame by frame.

## Visual review (one batched round, then one confirm round)
- **Screenshots** at 1440 and 375 of Home, Work, Belhomme, Al-Arg, Zenata, Research and About. Every cutout was reviewed over magenta and over white in contact sheets.
- **Independent read-only reviews by three subagents:**
  - accessibility (WCAG 2.2): 12 issues, all fixed;
  - code review: 8 issues, all fixed;
  - design critique: 12 items, 7 adopted, 5 declined with reasons in D43.
- **Firefox 157** headless screenshot of Home at 1440: the layout, fonts and transparent drawings render correctly.

## Not verified
- **Safari and iOS / iPadOS**, on any device. No Apple hardware or browser is available. Cross-document view transitions need Safari 18.2 or later; other browsers fall back to a normal navigation.
- **Firefox** beyond one headless screenshot. Interaction and the reduced-motion paths were not checked there.
- **Real screen readers** (NVDA, VoiceOver). Only static review and axe were used.
- **INP** in the field: it was not measured. Interactions are light (no handler does layout work beyond one `getBoundingClientRect`).
- **The live GitHub Pages deployment.** It is verified after the merge.
