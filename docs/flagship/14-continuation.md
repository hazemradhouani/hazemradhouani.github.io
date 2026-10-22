# 14 · Continuation state (for a fresh context)

| | |
|---|---|
| Date | 2026-10-22 (sixth update) |
| Read first | `16-home-sequence-and-identity.md` (the current plan), `decision-log.md` D80–D88; before it `15-case-study-composition-and-motion.md` and D73–D79; for the image pipeline, `12-hq-dissection-plan.md` and `13-dissection-protocol.md` |
| Branch | `flagship-upgrade`; merged to `main` through a PR once the gates below pass |
| Address | the site lives at the host root, `https://hazemradhouani.github.io/` (repository `hazemradhouani.github.io`, D81); old `/portfolio/` addresses redirect |

## Done
- **Home "Sequence" and the Google identity (D80–D88, plan 16):**
  - Site name and home title HAZEM RADHOUANI; the favicon redrawn for Google's circular crop.
  - The home page is: the wordmark, a strip of facts, a window of renders (one per country; one pass, pause/play) that opens to the full width, a stack of sticky project plates on grounds from their renders (`node tools/grounds.mjs` regenerates `content/grounds.json` when a hero changes), and research on ink by a circle wipe.
  - Scroll-linked motion runs from `--p` on `[data-fx]` under `html.fx`; Lenis lerp is 0.08; hero groups drift ±16 px as a whole.
- **All 15 case studies re-derived from `Images HQ/`** (D45–D68); dark scheme without paper boxes (D69); vertical labels (D70); keys re-set as HTML (D71); content questions closed (D72).
- **Case-study composition (D73):** a "rail and copy" sheet. Rail `1 / span 3` (numbers, chapter and figure titles, labels), copy axis `4 / span 6` (sentences); plates on a case ladder (`CASE` in `tools/templates/partials.mjs`: `full` 1–12, `nine` 4–12, `text` 4–11, `narrow` 4–9, `four` 4–7). Opening: office and city, the h1, the existing `summary` as the lead, the hero hanging from col 4. Title block (`titleBlock()` in `pages.mjs`): descriptor and tag strip, spec cells, Contents from three chapters. Captions beside a hanging plate on the rail (240 characters or fewer, `capSide()`), otherwise a rail/copy row; keys as a row.
- **Chapters (D74):** `chapters: [{ title, from }]` in each `content/projects/*.json`; a chapter runs from the figure titled `from` to the next (`chaptersOf()`, tested in `tools/tests/chapters.test.mjs`); a paragraph may carry `chapter`, otherwise it stays in the Overview row. Figure order is pinned (`tools/tests/hero-partner.test.mjs`). The film is the last chapter.
- **Motion (D75, D76, D78):** house curve `cubic-bezier(.22,1,.36,1)`, in-out `cubic-bezier(.77,0,.175,1)`; plates rise from their ground line (`.rv-g` group arrival, `plate-in` / `plate-hold` counter-translate), captions and keys follow, chapter rules draw, h1 words rise (`words()`; skipped after a view-transition morph via the inline `pagereveal` hook); title morphs move without scaling (`view-transition-class: vt-title`); reduced motion keeps a 160 ms page crossfade only.
- **Smooth, inertial scrolling (D79, the owner's request 2026-10-21):** Lenis 1.3.26 vendored at `js/vendor/lenis-1.3.26.min.js` (MIT, 5.6 KB gzipped; pinned devDependency, `tools/tests/vendor.test.mjs`), loaded by `js/site.js` only for a fine pointer without reduced motion. Dialogs stop it (`data-lenis-prevent` on both); scrolling keys hand over a settling glide; Contents links glide, then update the address and move focus; the skip link stays instant.
- **QA:** `tools/qa.mjs` adds a normal-motion pass (every arrival ends in the plain layout) and a smooth-scroll pass (glide eased and settled, keyboard followed, anchors land at the scroll padding with hash and focus, dialog hold, native under reduced motion). `tools/perf.cjs` now reports the LCP element (it read an API that never exposes LCP entries).

## How to verify
`npm run serve` (background; the site at `http://127.0.0.1:8090/`), then `node --test tools/tests/*.test.mjs`, `npm run build`, `npm run qa` (add `-- --shots` for screenshots in `tools/.cache/`), `npm run perf`. Without the server: `node tools/qa.mjs --base=file:///C:/Users/Hazem/Desktop/portfolio-main/` (skips the two 404 checks). The DevTools MCP browser window may run `requestAnimationFrame` at 1 fps when occluded: measure motion and scrolling in headless Playwright, as QA does.

## Open owner questions
`content/ledger-notes.md` ("[CONTENT NEEDED]"), now including a short La Villette project text (its chapters run on the captions alone).

## Known quirks
- The GateGuard hook asks for facts before the first edit of each file and before the first shell command.
- Node `-e` with `\n` or regex backslashes inside bash heredocs mangles escapes; use a `.cjs` file or `node - <<'EOF'`.
- A bare `node tools/cutout.mjs` regenerates every project's cutouts. Always pass paths.
- Six project JSON files hold hand-formatted one-line key entries: edit them as text (or check that a rewrite keeps the formatting), never `JSON.stringify` the whole file.
- Subagents hit rate limits often. Resume them with SendMessage, since their work is saved on disk.
