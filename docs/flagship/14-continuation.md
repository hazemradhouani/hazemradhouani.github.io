# 14 · Continuation state (for a fresh context)

| | |
|---|---|
| Date | 2026-10-16 (second update) |
| Read first | `12-hq-dissection-plan.md` (plan), `13-dissection-protocol.md` (procedure), `decision-log.md` D45–D67 |
| Branch | `flagship-upgrade`, pushed to origin |

## Done (committed and pushed)
- **Engine and front end:**
  - `tools/lib/matte.mjs`: ink and object matting, annotation removal, edge gate, ink classes.
  - `tools/cutout.mjs` with per-project `tools/cutout.d/*.json`.
  - `tools/import-hq-media.mjs`: 2560 px cap, crops in RGB, cache.
  - `tools/media.mjs`: exact WebP heights, premultiplied alpha.
  - Dark treatments: `invert`, `invert-accent`, `field` and `object`.
  - Labels and legends re-set in HTML; an optional Research `gallery` row (D64).
  - QA gates for treatments and labels.
  - 36 tests in `tools/tests/`, all passing.
- **All 15 case studies re-derived from `Images HQ/`:** ain-sebaa (the reference case), hay-mohammadi, zenata, belhomme, nouvelle-medina, bolivar, foubert, la-villette, avenir (D53/D61), cinephile (D62), al-arg with the PBR plates and thesis mockups (D64), and corallum, sentry, tamansourt, papillon (D66). Every folder's audit has no `review-required` record; `node tools/hq-audit.mjs --check` and every `import-hq-media --check` pass.
- **Shared files:**
  - Home flagship, capabilities (D63) and selected work (D67) use the HQ media.
  - `tools/og.mjs` points at the HQ images; the Work card line follows D45.
  - The content ledger is regenerated (`node tools/ledger.mjs`).
  - 201 superseded media files are removed (D65), with the owner's permission.
- **Docs:** `tools/README.md` (HQ pipeline), `08-direction.md` (D46–D63 amendment), protocol 13 (`maxH` note).

## Blocked: the preview server
The owner allowed restarting it (2026-10-16), but the Claude Code auto-mode classifier refuses `npm run serve` and even `curl http://127.0.0.1:8090/…` ("Interfere With Workloads"). Do not work around it. Either the owner runs `npm run serve` in a separate terminal, or adds allow rules to `.claude/settings.json` (`Bash(npm run serve)`, `Bash(npm run qa*)`, `Bash(npm run perf*)`, `Bash(npm run og)`, `Bash(npm run cv)`, `Bash(node tools/qa.mjs*)`, `Bash(curl -s*127.0.0.1:8090*)`).

## Still to do, in order (all need the server except where noted)
1. `npm run og` and `npm run cv`: the share cards and the CV still show the old heroes and the old "heritage documentation and earthen architecture" line.
2. `npm run qa -- --shots` (all pages, both schemes, 6 widths), `npm run perf`, then look at the screenshots: especially the long drawings, the Tamansourt site plan (reduced 4x), the small Sentry Revit callouts and the label positions.
3. A design critique from the screenshots (the code and static accessibility reviews were run without the server; see `09-qa-report.md`).
4. Update `09-qa-report.md` with the browser results.
5. Open the PR `flagship-upgrade` → `main` and merge once every gate passes.

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
