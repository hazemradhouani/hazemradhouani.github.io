# Site tooling

The site is plain static HTML on GitHub Pages, built on the light/dark "Field" system (`docs/flagship/08-direction.md`). These scripts generate and check it; nothing here is shipped to visitors.

| Command | What it does | Needs |
|---|---|---|
| `node tools/build.mjs` (`npm run build`) | Writes every page, `sitemap.xml`, `site.webmanifest`, `robots.txt` from `content/*.json`. Places every image at build time on the largest grid span that neither enlarges nor crops it | Node 20+ only |
| `node tools/cutout.mjs [--force] [--sheet] [images/folder]` (`npm run cutout`) | Transparent cutouts of every drawing (`"kind": "drawing"` figures, plus `extra` in `tools/cutout.json`) into `images/cut/`: the sheet's own paper becomes reviewed graded alpha, trimmed to the ink. `--sheet` writes white, charcoal and magenta review panels to `tools/.cache/cutouts/`; opaque white fringe or lost partial-alpha detail is a defect | ffmpeg |
| `node tools/hq-audit.mjs --check` / `--write` | Validates / refreshes the complete immutable `Images HQ/` inventory and checks the production manifest. The audit includes dot-prefixed recoverable sources. It never changes a source image; `--write` only updates `docs/flagship/hq-asset-audit.json` | Node; local `Images HQ/` source library |
| `node tools/media.mjs [--force] [images/folder]` | AVIF + WebP widths (480 to 2000 px and the native width, never larger) for any new image; images with alpha (cutouts) get WebP only. `--force` replaces stale widths | ffmpeg |
| `node tools/ledger.mjs` | Regenerates `docs/flagship/content-ledger.md` (every fact with its source) | Node |
| `npm run serve` | Local server at http://127.0.0.1:8090/portfolio/ (same base path as GitHub Pages) | Node |
| `npm run og` | Share cards `images/og/*.jpg` and icons, rendered with the real fonts on Field's light default, images never cropped | `npm install`, Chrome |
| `npm run cv` | `files/hazem-radhouani-cv.pdf` from the About page's print layout (A4, no phone number) | `npm install`, Chrome |
| `npm run qa` | Every page in light and dark at 320/375/768/1024/1440/1920: overflow, broken images, tiny text, small targets, axe-core WCAG 2.2 AA, theme bootstrap/persistence/synchronisation, and the Field gates: no composition crop or enlargement, grid alignment, token-only surfaces, transparent cutout corners, no white fringe or lost partial-alpha detail, and content coverage | `npm install`, Chrome |
| `npm run perf` | Mobile lab check (slow 4G, 4x CPU): LCP, CLS, transfer | `npm install`, Chrome |

Set `CHROME_PATH` if Chrome is not in its default Windows location.

## HQ source workflow

`Images HQ/` is an owner-supplied source library, not a publishable asset directory. Do not rename, delete, retouch, link to, or add production URLs that point into it. Start with `node tools/hq-audit.mjs --check`; only select an image after its audit record has project, role, credit and caption evidence. Add an approved derivative beneath a stable `images/<slug>/` path, record its source hash and exact source-pixel crop (or `null`) in `tools/hq-media.json`, then run `node tools/media.mjs` to create responsive formats. Owner-provided access is not a substitute for a project-specific credit or role.

## Add a project

1. Put approved, reproducible derivatives in `images/<slug>/` (JPEG or PNG, as large as you have; never upscale). Keep supplied HQ masters in `Images HQ/` unchanged and reference them only through the audit/manifest records.
2. Copy any file in `content/projects/` to `content/projects/<slug>.json` and edit it:
   - `group`: `paris`, `morocco` or `academic` (groups are defined in `content/site.json`); `order`: position inside the group;
   - `hero`: any ratio. A portrait hero is paired with the project's first render so the pair fills the grid; nothing is cropped;
   - `figures`: drawings (`"kind": "drawing"`, shown as transparent cutouts) or renders; a figure with `items` shows a series (drawings in equal cells, renders in one justified row);
   - every fact gets a `source` (see the ledger keys). Write nothing you cannot source.
3. Run `npm run cutout -- --sheet images/<slug>` and inspect the white, charcoal and magenta panels in `tools/.cache/cutouts/`. Use graded alpha for any dark-compatible drawing. If a drawing has no paper to key (a photograph or a full-bleed coloured ground), add it to `exclude` in `tools/cutout.json`; if its border is not paper, give it a `paper` colour; if it fills its own frame, list it in `fullBleed` with the reason rather than faking transparency.
4. Run `node tools/media.mjs images/<slug> images/cut/<slug>`, then `npm run build`, `npm run og` and `npm run qa`.

## Add the website or the app (Digital)

Create `content/digital/<slug>.json`. The navigation gains a "Digital" item automatically when the first file exists. Suggested fields: `title`, `kind` (`website` or `app`), `summary`, `role`, `stack`, `status`, `links` (URL, App Store, Google Play), `screens` (images in `images/digital/<slug>/`), `year`. The page template is designed once the real material exists; it uses the same grid, spans, rows and chapter components as the case studies.
