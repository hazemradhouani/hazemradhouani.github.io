# 14 · Continuation state (for a fresh context)

| | |
|---|---|
| Date | 2026-10-16 (third update) |
| Read first | `12-hq-dissection-plan.md` (plan), `13-dissection-protocol.md` (procedure), `decision-log.md` D45–D70 |
| Branch | `flagship-upgrade`; merged to `main` through a PR once the gates below pass |

## Done
- **All 15 case studies re-derived from `Images HQ/`** (D45–D68); the audit, the import checks and the build pass.
- **Dark scheme without paper boxes (D69):** no drawing sits on the cream field any more. 49 colour drawings are inverted with their hues held (`invert-accent`); 14 with rendered material, photographs or shaded models carry a `keep` layer (`keepLayer()` in `tools/lib/matte.mjs`, `<stem>--keep.png` beside the cutout) laid over the inverted drawing in their authored colours; six drawings whose own ground makes them legible are opaque `plate` cutouts, inverted in dark (Corallum level 01, western elevation, section A-A; Al-Arg watercolour site plan; Cinephile section and eastern facade). Renders and photographs stay as authored in both schemes. The Aïn Sebaâ and Cinephile ground floors are re-keyed against their own paper.
- **Vertical labels (D70)** for a street name along a section end.
- **QA:** fails any paper field in dark, checks keep layers per scheme; the stale mobile theme check and the strip crop tolerance are fixed. 40 tests pass.
- **Share cards and CV** regenerated with the HQ heroes and the D45 identity line.
- **Local settings:** `.claude/settings.json` (gitignored) allows `npm run serve`, `qa`, `perf`, `og`, `cv` and `curl` to the local server, so the browser gates can run.

## How to verify
`npm run serve` (background), then `node --test tools/tests/*.test.mjs`, `npm run build`, `npm run qa` (add `-- --shots` for screenshots in `tools/.cache/`), `npm run perf`. A rare `ERR_NO_BUFFER_SPACE` console line is the Windows local server under screenshot load, not the site; re-run.

## Open owner questions (`[CONTENT NEEDED]`, collect into the final report)
- Rue de l'Avenir: role; render credit.
- Bolívar: how the hotel and student programmes are distributed (D59); what "Hotel W" means; the drone photo's author.
- Foubert: unit count and levels (D60); "Complexe dalle BB"; the scale of the street-window sheet.
- Zenata: titles of the profile diagrams; whether to use the page-9 type and date.
- Nouvelle Medina: role; "Poutres Al".
- Hay Mohammadi: type and date from the 2025 page; plans or sections.
- La Villette: the level-2 wing rooms; what "Elevation Sud 2" shows.
- Belhomme: personal part beyond pdf2026:p9; render authorship.
- Cinephile: where the film library and archive sit; the plans' scale (D62).
- Al-Arg: HQ files of the village-scale site plans and Structure 02; the Functional Spaces colour key; the source of the Past-layer aerial photo; what Structure 03 is (D64).
- Corallum: the site and the structural material (D66).
- Tamansourt: the location (D66).
- Villa Papillon: how it is organised and oriented (D66).
- Sentry: the plans' scale.

## Known quirks
- The GateGuard hook asks for facts before the first edit of each file and before the first shell command.
- Node `-e` with `\n` or regex backslashes inside bash heredocs mangles escapes; use a `.cjs` file written with the Write tool.
- A bare `node tools/cutout.mjs` regenerates every project's cutouts. Always pass paths.
- Subagents hit rate limits often. Resume them with SendMessage, since their work is saved on disk.
