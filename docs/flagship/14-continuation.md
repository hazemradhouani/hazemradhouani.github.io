# 14 · Continuation state (for a fresh context)

| | |
|---|---|
| Date | 2026-10-16 (fourth update) |
| Read first | `12-hq-dissection-plan.md` (plan), `13-dissection-protocol.md` (procedure), `decision-log.md` D45–D72 |
| Branch | `flagship-upgrade`; merged to `main` through a PR once the gates below pass |

## Done
- **All 15 case studies re-derived from `Images HQ/`** (D45–D68); the audit, the import checks and the build pass.
- **Dark scheme without paper boxes (D69):** no drawing sits on the cream field any more. 49 colour drawings are inverted with their hues held (`invert-accent`); 14 with rendered material, photographs or shaded models carry a `keep` layer (`keepLayer()` in `tools/lib/matte.mjs`, `<stem>--keep.png` beside the cutout) laid over the inverted drawing in their authored colours; six drawings whose own ground makes them legible are opaque `plate` cutouts, inverted in dark (Corallum level 01, western elevation, section A-A; Al-Arg watercolour site plan; Cinephile section and eastern facade). Renders and photographs stay as authored in both schemes. The Aïn Sebaâ and Cinephile ground floors are re-keyed against their own paper.
- **Vertical labels (D70)** for a street name along a section end.
- **QA:** fails any paper field in dark, checks keep layers per scheme; the stale mobile theme check and the strip crop tolerance are fixed. 40 tests pass.
- **Share cards and CV** regenerated with the HQ heroes and the D45 identity line.
- **Local settings:** `.claude/settings.json` (gitignored) allows `npm run serve`, `qa`, `perf`, `og`, `cv` and `curl` to the local server, so the browser gates can run.
- **Keys (D71):** every printed key is out of the pixels and re-set as an HTML key (`legend`, optional `legendTitle` in a figure; entries `{ text, swatch, mark, code, dir, ground }`, marks `fill | hatch | line | dash | dot | point | triangle | measure | code`; `keyOf()` in `tools/templates/partials.mjs`, `.key*` in `css/site.css`). Material schedules left the captions. A flat swatch touching linework is lifted with an erase rectangle carrying `match: [r, g, b]`.
- **Content questions closed (D72):** no render or photograph carries an author line; Al-Arg Structure 03 has the owner's pdf2026 caption; Tamansourt is "near Marrakech"; the rest are closed as not needed.
- **QA without the server:** `node tools/qa.mjs --base=file:///C:/Users/Hazem/Desktop/portfolio-main/` runs every gate from the built files except the two 404 checks.

## How to verify
`npm run serve` (background), then `node --test tools/tests/*.test.mjs`, `npm run build`, `npm run qa` (add `-- --shots` for screenshots in `tools/.cache/`), `npm run perf`. A rare `ERR_NO_BUFFER_SPACE` console line is the Windows local server under screenshot load, not the site; re-run.

## Open owner questions
None for the case studies: the owner closed them on 2026-10-16 (D72). Renders carry no author line. The remaining site-wide items are in `content/ledger-notes.md` ("[CONTENT NEEDED]").

## Known quirks
- The GateGuard hook asks for facts before the first edit of each file and before the first shell command.
- Node `-e` with `\n` or regex backslashes inside bash heredocs mangles escapes; use a `.cjs` file written with the Write tool.
- A bare `node tools/cutout.mjs` regenerates every project's cutouts. Always pass paths.
- Subagents hit rate limits often. Resume them with SendMessage, since their work is saved on disk.
