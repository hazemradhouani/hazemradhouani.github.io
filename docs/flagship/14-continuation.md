# 14 · Continuation state (for a fresh context)

| | |
|---|---|
| Date | 2026-10-16 |
| Read first | `12-hq-dissection-plan.md` (plan), `13-dissection-protocol.md` (procedure), `decision-log.md` D45–D61 |
| Branch | `flagship-upgrade`. Pushed up to `590a63a`; the later commits are local, so push before the PR |

## Done (committed)
- **Engine and front end:**
  - `tools/lib/matte.mjs`: ink and object matting, annotation removal, edge gate, ink classes.
  - `tools/cutout.mjs` with per-project `tools/cutout.d/*.json`.
  - `tools/import-hq-media.mjs`: 2560 px cap, crops in RGB, cache.
  - `tools/media.mjs`: exact WebP heights, premultiplied alpha.
  - Dark treatments: `invert`, `invert-accent` and `field`.
  - Labels and legends re-set in HTML.
  - QA gates for treatments and labels.
  - 36 tests in `tools/tests/`.
- **Case studies re-derived from `Images HQ/`:** ain-sebaa (the reference case), hay-mohammadi, zenata, belhomme, nouvelle-medina, bolivar, foubert, la-villette, and the new `avenir` (Rue de l'Avenir, Villeneuve-la-Garenne, D53/D61).
- **Identity (D45):** in content, `CLAUDE.md` and JSON-LD.

## In flight when this was written
Two dissection agents may have left **uncommitted** work in the tree:
- **al-arg** (`Images HQ/EL erg`): the thesis drawings, two PBR material plates (clay and stone walls, maps at 1200 px) and the `Memoire` thesis-book mockups for `content/pages/research.json` (D54).
- **cinephile** (`Images HQ/Cinema`).

**Before anything else:**
1. Run `git status`.
2. For each of the two, check that its audit file (`docs/flagship/hq-audit/el-erg.json`, `memoire.json`, `cinema.json`) has no `review-required` records left.
3. Run `node tools/hq-audit.mjs --check` and `npm run build`.
4. Look at its cutout sheets in `tools/.cache/cutouts/`.
5. Commit each project separately, staging only its own paths, as the earlier per-project commits do.

If a folder is unfinished, redo it with a fresh agent that follows protocol 13.

## Still to do, in order
1. **Remaining folders**, one agent each, at most two at a time (memory is short):
   - `Tabarka` → `corallum`;
   - `Guerite` → `sentry` (do not revive the withheld 10 m² surface, C02);
   - `Hospital` → `tamansourt`;
   - `VILLAS` → `papillon`.

   The agent prompt template is the one used for the BELEM folders: protocol 13, the files owned, "skip browser QA while the server is off", "never run cutout.mjs or media.mjs without your own paths".
2. **Shared files** (main session only):
   - Point `tools/og.mjs` and `content/pages/home.json` at the new images; they still use `la-villette-street-render.jpg` and `la-villette-gate-detail.jpg`.
   - Re-pick home "selected work" and capabilities from the stronger HQ renders.
   - Delete the superseded masters that are no longer referenced (log the removal in the decision log).
   - Run `node tools/ledger.mjs`.
3. **Regenerate** `npm run og` and `npm run cv`. Both still print the old "heritage documentation and earthen architecture" line, and both need the server.
4. **The preview server** (`npm run serve`) was stopped by the system for low memory. Restart it only when the owner allows; he has not answered yet. Then:
   - `npm run qa -- --shots` (all pages, both schemes, 6 widths);
   - `npm run perf`;
   - look at the screenshots;
   - run the independent reviews (design critique, accessibility, code review).
5. **Docs:** update `09-qa-report.md` (what was tested, how, what was not), `08-direction.md` (D49–D61), `tools/README.md` (the HQ pipeline) and protocol 13 (note `maxH` may also serve unlabelled drawings).
6. **Merge:** push, open the PR `flagship-upgrade` → `main`, and merge once every gate passes.

## Open owner questions (`[CONTENT NEEDED]`, collect into the final report)
- Rue de l'Avenir: role; render credit.
- Bolívar: how the hotel and student programmes are distributed (D59); what "Hotel W" means; the drone photo's author.
- Foubert: unit count and levels (D60); "Complexe dalle BB"; the scale of the street-window sheet.
- Zenata: titles of the profile diagrams; whether to use the page-9 type and date.
- Nouvelle Medina: role; "Poutres Al".
- Hay Mohammadi: type and date from the 2025 page; plans or sections.
- La Villette: the level-2 wing rooms; what "Elevation Sud 2" shows.
- Belhomme: personal part beyond pdf2026:p9; render authorship.
- Whether the preview server may be restarted for QA.

## Known quirks
- The GateGuard hook asks for facts before the first edit of each file and before the first shell command.
- Node `-e` with `\n` inside bash heredocs mangles escapes; use a `.cjs` file or the Edit tool.
- A bare `node tools/cutout.mjs` regenerates every project's cutouts. Always pass paths.
- Subagents hit rate limits often. Resume them with SendMessage, since their work is saved on disk.
