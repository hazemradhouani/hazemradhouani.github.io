# Site tooling

The site is plain static HTML on GitHub Pages, built on the light/dark "Field" system (`docs/flagship/08-direction.md`). These scripts generate and check it; nothing here is shipped to visitors.

| Command | What it does | Needs |
|---|---|---|
| `node tools/build.mjs` (`npm run build`) | Writes every page, `sitemap.xml`, `site.webmanifest`, `robots.txt` from `content/*.json`. Places every image at build time on the largest grid span that neither enlarges nor crops it | Node 20+ only |
| `node tools/cutout.mjs [--force] [--sheet] images/<slug>/<file>.png …` (`npm run cutout`) | Transparent cutouts of drawings and isolated objects into `images/cut/`, each with a sidecar `.json` (label boxes, ink class, trim, clip). Settings: `tools/cutout.json` plus one `tools/cutout.d/<slug>.json` per case study (mode `ink`/`object`, paper, floor/knee, `clip`, `erase` rectangles, `dark` treatment). Annotations on blank paper are removed component by component (D49); an undeclared edge touch fails the run. `--sheet` writes `tools/.cache/cutouts/<name>.jpg` (white, charcoal, magenta, the dark rendering) and `<name>-detail.jpg` (densest region at 1:1). **Always pass paths**: a bare run regenerates every project | ffmpeg |
| `node tools/hq-audit.mjs --check` / `--write` | Validates the complete immutable `Images HQ/` inventory: one audit file per folder in `docs/flagship/hq-audit/` (D52), every source with a disposition, every recipe tied to an approved record. It never changes a source image | Node; local `Images HQ/` |
| `node tools/import-hq-media.mjs --check` / `--write [--replace] [--only=images/<slug>/]` | Builds the published masters from the recipes in `tools/hq-media/<slug>.json`: an exact copy or a rectangular source-pixel crop, downscaled to the 2 560 px cap (D55) and encoded explicitly. `--check` proves every master matches its recipe | ffmpeg; local `Images HQ/` |
| `node tools/media.mjs [--force] [path-prefix …]` | AVIF + WebP widths (480, 800, 1200, 1600, 2000, 2560 and the native width, never larger) for any new image; images with alpha (cutouts) get WebP only, scaled with premultiplied alpha. A drawing master that has a cutout gets no derivatives. `--force` replaces stale widths | ffmpeg |
| `node tools/ledger.mjs` | Regenerates `docs/flagship/content-ledger.md` (every fact with its source) | Node |
| `npm run serve` | Local server at http://127.0.0.1:8090/portfolio/ (same base path as GitHub Pages) | Node |
| `npm run og` | Share cards `images/og/*.jpg` and icons, rendered with the real fonts on Field's light default, images never cropped | `npm install`, Chrome |
| `npm run cv` | `files/hazem-radhouani-cv.pdf` from the About page's print layout (A4, no phone number) | `npm install`, Chrome |
| `npm run qa` | Every page in light and dark at 320/375/768/1024/1440/1920: overflow, broken images, tiny text, small targets, axe-core WCAG 2.2 AA, theme bootstrap/persistence/synchronisation, and the Field gates: no composition crop or enlargement, grid alignment, token-only surfaces, transparent cutout corners, no white fringe or lost partial-alpha detail, and content coverage | `npm install`, Chrome |
| `npm run perf` | Mobile lab check (slow 4G, 4x CPU): LCP, CLS, transfer | `npm install`, Chrome |

Set `CHROME_PATH` if Chrome is not in its default Windows location.

## HQ source workflow

`Images HQ/` is an owner-supplied source library (gitignored), not a publishable asset directory. Do not rename, delete, retouch, link to, or add production URLs that point into it. The full procedure is `docs/flagship/13-dissection-protocol.md`; in short, per case study:

1. Audit every source of the folder in `docs/flagship/hq-audit/<folder>.json`: transcription of every word with its disposition, project mapping, credit and role evidence (`node tools/hq-audit.mjs --check`).
2. Write one recipe per published view in `tools/hq-media/<slug>.json` and run `node tools/import-hq-media.mjs --write --only=images/<slug>/`. Drawing PNG masters are gitignored; their cutouts are committed.
3. Cut out the drawings (`tools/cutout.d/<slug>.json`, `node tools/cutout.mjs --sheet <paths>`) and look at every review sheet.
4. `node tools/media.mjs --force images/<slug> images/cut/<slug>`, then the content (`labels`, `legend`, `maxH`), `npm run build` and `node tools/qa.mjs --only=projects/project-<slug>.html --shots`.

Owner-provided access is not a substitute for a project-specific credit or role.

## Add a project

1. Put approved, reproducible derivatives in `images/<slug>/` (JPEG or PNG, as large as you have; never upscale). Keep supplied HQ masters in `Images HQ/` unchanged and reference them only through the audit/manifest records.
2. Copy any file in `content/projects/` to `content/projects/<slug>.json` and edit it:
   - `group`: `paris`, `morocco` or `academic` (groups are defined in `content/site.json`); `order`: position inside the group;
   - `hero`: any ratio. A portrait hero is paired with the project's first render so the pair fills the grid; nothing is cropped;
   - `figures`: drawings (`"kind": "drawing"`, shown as transparent cutouts) or renders; a figure with `items` shows a series (drawings in equal cells, renders in one justified row);
   - every fact gets a `source` (see the ledger keys). Write nothing you cannot source.
3. Run `npm run cutout -- --sheet images/<slug>` and inspect the four panels and the 1:1 detail sheet in `tools/.cache/cutouts/`. Settings go in `tools/cutout.d/<slug>.json`. If a drawing has no paper to key (a photograph or a full-bleed coloured ground), add it to that file's `exclude` with the reason; if its border is not paper, give it a `paper` colour; if it fills its own frame, list it in `fullBleed` with the reason rather than faking transparency. Choose its dark treatment (`invert`, `invert-accent`, `field` or `object`, D50).
4. Run `node tools/media.mjs images/<slug> images/cut/<slug>`, then `npm run build`, `npm run og`, `npm run qa` and `node tools/ledger.mjs`.

## Add the website or the app (Digital)

Create `content/digital/<slug>.json`. The navigation gains a "Digital" item automatically when the first file exists. Suggested fields: `title`, `kind` (`website` or `app`), `summary`, `role`, `stack`, `status`, `links` (URL, App Store, Google Play), `screens` (images in `images/digital/<slug>/`), `year`. The page template is designed once the real material exists; it uses the same grid, spans, rows and chapter components as the case studies.
