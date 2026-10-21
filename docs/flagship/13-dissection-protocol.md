# 13 · HQ dissection protocol

| | |
|---|---|
| Date | 2026-10-14 |
| Implements | `12-hq-dissection-plan.md` (D49–D57) |
| Reference case | Aïn Sebaâ (commit `c75cb4b`): `tools/hq-media/ain-sebaa.json`, `tools/cutout.d/ain-sebaa.json`, `docs/flagship/hq-audit/ain-sbaa.json`, `content/projects/ain-sebaa.json` |

This is the procedure for turning one `Images HQ/` folder into a case study's published images. Follow it exactly. Where a step says "look", look at the actual pixels; never infer from file names.

## 0. Rules that never bend
- **Content truth (`CLAUDE.md`).**
  - Publish only facts visible on the sources or already in the repo with a source.
  - Never invent a role, client, date, area, award or description.
  - A gap is written `[CONTENT NEEDED: …]` in the report, never filled.
- **Renders and photographs are never edited.**
  - Crop only document furniture or blank margins outside the scene: page tabs, footers, printed borders.
  - Text printed on rendered pixels stays.
- **Drawings: text on blank paper may leave the pixels (D49).**
  - **Crop first.** Use a crop whenever the text lies outside the drawing's bounding box.
  - **Erase only free-standing text.** Do it when the text sits beside or inside the drawing on blank paper; it is then re-set in HTML.
  - **Intrinsic text stays.** Room names, dimensions, levels, grid labels and signage drawn on a façade are part of the drawing.
- **Furniture is dropped, never re-set:**
  - the cartouche or title block, studio and client panels and logos;
  - project codes, page numbers, sheet frames and key-plan thumbnails;
  - north arrows only when they sit in the cartouche.
- **Client names are not published** (discretion). Renders and photographs carry no author line: every render is the owner's (D72). The office is named where the project was done.
- **English site (D17).** French and Arabic text is published as faithful English, with the original quoted in the record.
- **No upscaling, ever.** No generative or content-aware pixels, ever.

## 1. Files you own (and nothing else)
For your case study `<slug>` and its HQ folder `<Folder>`, you may write only:
- `docs/flagship/hq-audit/<folder-file>.json` (the folder's audit record);
- `tools/hq-media/<slug>.json` (recipes);
- `tools/cutout.d/<slug>.json` (cutout settings);
- `content/projects/<slug>.json`;
- `images/<slug>/`, `images/cut/<slug>/`, `images/opt/<slug>/`, `images/opt/cut/<slug>/`.

Do **not**:
- edit any other file, `decision-log.md`, the ledger, tools or CSS;
- run git commands other than `git status`, `git diff` and `git log`;
- commit;
- delete with `git rm`. Remove superseded files with `rm` and list them in your report.

`npm run build` and the QA command write shared generated pages; that is expected and harmless.

## 2. Read the folder
1. Read `content/projects/<slug>.json`, its current images (`images/<slug>/`, `images/cut/<slug>/`) and the project's lines in `docs/flagship/content-ledger.md`.
2. Get the size and format of every source:
   ```
   for f in "Images HQ/<Folder>"/*; do echo "$f $(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,pix_fmt -of csv=p=0 "$f")"; done
   ```
3. View every source whole, with the Read tool. Files over about 60 MB: make a 2000 px preview first:
   ```
   ffmpeg -v error -y -i "<src>" -vf scale=2000:-2 "<scratch>/preview.jpg"
   ```
4. **Read every word.** Make 1:1 tiles of every text area, with a 50 px grid for measuring:
   ```
   ffmpeg -v error -y -i "<src>" -vf "crop=W:H:X:Y,drawgrid=w=50:h=50:t=1:c=red@0.35" "<scratch>/tile.png"
   ```
   Transcribe it, then give each text element its disposition: furniture, title (becomes the caption), callout (becomes a label), legend, intrinsic, or prose/fact.
5. Map each source to the existing figures. A source is a replacement when it shows the same drawing or view; say why ("same camera, same columns"). New material needs its own reason.

## 3. Recipes (`tools/hq-media/<slug>.json`)
One entry per output, in this form:
```json
{ "source": "Images HQ/<Folder>/<file>", "output": "images/<slug>/<slug>-<what>.jpg|png", "sha256": "<from the audit record>",
  "crop": null | { "x": 0, "y": 0, "width": 100, "height": 100 },
  "treatment": "<what the crop keeps and leaves out>", "darkTreatment": "preserve-colour-scene | invert | invert-accent | field | object",
  "credit": "<visible credit or the owner's-own-work statement>", "authorizationEvidence": "owner-direct:2026-10-13",
  "captionEvidence": "<printed title or the existing figure it matches>", "reviewStatus": "approved" }
```
- **Output format by kind.** Renders and photos are `.jpg`. Drawings, diagrams and objects to cut out are `.png`. The importer caps both at 2 560 px (D55).
- **Names.** Lowercase, `<slug>-<content>`, ASCII only.
- **Measure crops on 1:1 gridded tiles.** Leave 20–60 px of blank paper around a drawing. Never cut through linework, hatch, a dimension or a shadow.
- **A multi-image page is split** into one entry per drawing or render.
- **A series at one scale** comes from one sheet, or from sheets at the same printed scale and resolution; the importer then scales every part by the same factor.

Then run:
```
node tools/import-hq-media.mjs --write --only=images/<slug>/        (add --replace after changing a recipe)
```

## 4. Audit records (`docs/flagship/hq-audit/<folder-file>.json`)
Every source in your folder gets a final record:
- **`projectMapping`:** `{ slug, status: "confirmed" }` once mapped, and `mappingEvidence` saying why.
- **`visualType`:** what the source is.
- **`textDisposition`:** the full transcription with dispositions, e.g. `title → caption: 'COUPE AA'; intrinsic: levels +7.50 +0.00`.
- **`disposition`:**
  - `approved` when used;
  - `withheld` when not used, with the reason (duplicate, superseded, low value, a copyrighted element in a render, no relationship);
  - `unresolved` only when the relationship cannot be established.
- **`creditEvidence` / `roleEvidence`:** say exactly what the published page claims and what it does not. Example: "office Studio BELEM; no personal-role statement".

Validate with `node tools/hq-audit.mjs --check`.

## 5. Cutouts (`tools/cutout.d/<slug>.json`)
```json
{ "images": { "images/<slug>/<file>.png": { "mode": "ink", "paper": [255,255,255], "floor": 0.02, "knee": 0.05,
  "clip": ["left","right"], "erase": [{ "id": "title", "x": 0, "y": 0, "w": 10, "h": 10 }], "dark": "invert" } } }
```
- **`mode`:**
  - `ink` for drawings, diagrams and shaded axonometrics; the paper becomes clear everywhere.
  - `object` only for an isolated object whose enclosed whites must stay solid (a book mockup, a white model), with `tol`/`grad`/`keep`/`bg` as needed.
- **`paper`:** set `[255,255,255]` when the sheet's border is not paper (a plan filling its frame). Use `"field"` for an uneven or vignetted ground.
- **`floor`/`knee`:**
  - clean vector exports: `0.02`/`0.05`;
  - very pale fills that must survive: `0.015`/`0.03`, or `0.01`/`0.02` for rendered diagram panels;
  - noisy JPEG scans: keep the defaults.
- **`clip`:** the sides where the drawing is clipped by its own frame by design (level lines, hatch or context running off). An undeclared edge touch fails the run. That is the "crop cuts the drawing" alarm: fix the crop before declaring a clip.
- **`erase` (D49):**
  - rectangles in **master pixels**: measure them on gridded tiles of `images/<slug>/<file>.png`, not of the HQ source;
  - give each a margin of 10–15 px around the glyphs;
  - keep them clear of any line or dash, since a component wholly inside is removed.
  - The run prints `id: -N (kept K crossing)`. N must match the glyph count (letters, dots and accents). K must be 0 unless the crossing component is not text (a shadow gradient, a line). A kept glyph means the rectangle is too tight, as when the descender of "q" was cut off in the reference case.
- **`dark` (D50):**
  - `invert` for greyscale linework;
  - `invert-accent` when thin colour accents must keep their hue (water lines, red cut marks);
  - `field` for colour-coded fills, rendered panels and shaded axonometrics;
  - `object` for objects that read on charcoal.

  The run prints the measured ink class (`mono`/`accent`/`colour`); a mismatch prints a note, and you must justify it.

Run, then look:
```
node tools/cutout.mjs --sheet images/<slug>/<file>.png ...
```
Open every `tools/.cache/cutouts/<slug>_<file>_png.jpg` (white | charcoal | magenta | dark rendering) and every `…-detail.jpg` (the densest region at 1:1). A cutout passes only when all of these hold:
- no printed title or label is left;
- no geometry is lost, and every edge is crisp at 1:1;
- no pale rim shows on charcoal;
- the dark rendering is legible;
- pale fills are present on the white panel.

## 6. Responsive media
```
node tools/media.mjs --force images/<slug> images/cut/<slug>
```

## 7. Content (`content/projects/<slug>.json`)
- **`hero`:** the strongest full-resolution render. Its `source` keeps the original key and adds `hq:<Folder>/<file>`.
- **Figure order:** context first (site plan, aerial), then plans, sections and elevations, then structure and diagrams, then closing views. Superseded figures are removed. Figures with no HQ replacement stay.
- **Each figure:** `title` (from the printed title, in English), `caption` (only facts visible on the source or in the record), `alt` (what is visible, specific, with no claims), `kind` (`drawing` for cutouts, `render` for scenes) and `source` (printed text quoted, translations noted).
- **Labels:** `"labels": [{ "at": "<erase id>", "text": "English", "align": "end"? }]`.
  - Use `"align": "end"` when the label sits left of the drawing.
  - Use `\n` for a printed line break.
  - Keep labels short; the QA fails a label over ink.
- **Keys (D71):** a printed key never stays in the pixels: crop it out, or erase it (a flat swatch touching linework takes an erase rectangle with `"match": [r, g, b]`). Re-set it as `"legend": [{ "text": "…", "mark": "fill | hatch | line | dash | dot | point | triangle | measure", "swatch": "#RRGGBB", "ground"?: "#RRGGBB", "dir"?: "left" }]` or, for a numbered schedule, `{ "code": "M1", "text": "…" }` with `"legendTitle": "Materials"`. Pick the mark the drawing uses (a dashed route is `dash`, an area `fill`). Never put a schedule in a caption. Sample each colour from the source:
  ```
  ffmpeg -i src -vf crop=5:3:X:Y,scale=1:1 -f rawvideo -pix_fmt rgb24 - | od -An -tu1
  ```
- **A tall drawing**, labelled or not, may set `"maxH": 780` (at most 820) when it reads too small under the default height limit.
- **A series** (`items`) must be at one scale. Long strips stack automatically.

## 8. Verify
1. `node tools/hq-audit.mjs --check` and `node tools/import-hq-media.mjs --check --only=images/<slug>/`.
2. `npm run build`.
3. `node tools/qa.mjs --only=projects/project-<slug>.html --shots`. The local server runs at `http://127.0.0.1:8090/portfolio/`; start `npm run serve` in the background only if it is not running.
4. Look at `tools/.cache/projects_project-<slug>_html-{light,dark}-1440.jpg` and `…-dark-375.jpg`. Crop them into segments of 1440×2050 with ffmpeg to see them. Fix anything that reads badly: a drawing too small, a label crowding, a weak order.

## 9. Report (your final message)
- Sources: used, withheld or unresolved, one line each with the reason.
- Outputs, with their dark treatment.
- Figures added, replaced and removed. Superseded files you deleted, with full paths.
- Every transcription that became a caption, label or legend, with the original and the English.
- `[CONTENT NEEDED: …]` items.
- QA result (paste the final line) and what you checked by eye.
- Anything you were unsure of.
