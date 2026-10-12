# Site tooling

The site is plain static HTML on GitHub Pages. These scripts generate and check it; nothing here is shipped to visitors.

| Command | What it does | Needs |
|---|---|---|
| `node tools/build.mjs` (`npm run build`) | Writes every page, `sitemap.xml`, `site.webmanifest`, `robots.txt` from `content/*.json` | Node 20+ only |
| `node tools/media.mjs [images/folder]` | Makes AVIF + WebP widths (480 to 2000 px and the native width, never larger) for any new image | ffmpeg |
| `node tools/ledger.mjs` | Regenerates `docs/flagship/content-ledger.md` (every fact with its source) | Node |
| `npm run serve` | Local server at http://127.0.0.1:8090/portfolio/ (same base path as GitHub Pages) | Node |
| `npm run og` | Share cards `images/og/*.jpg` and icons, rendered with the real fonts | `npm install`, Chrome |
| `npm run qa` | Every page at 320/375/768/1024/1440/1920: overflow, broken images, tiny text, small targets, axe-core WCAG 2.2 AA | `npm install`, Chrome |
| `npm run perf` | Mobile lab check (slow 4G, 4x CPU): LCP, CLS, transfer | `npm install`, Chrome |

Set `CHROME_PATH` if Chrome is not in its default Windows location.

## Add a project

1. Put the source images in `images/<slug>/` (JPEG or PNG, as large as you have; never upscale).
2. Run `node tools/media.mjs images/<slug>`.
3. Copy any file in `content/projects/` to `content/projects/<slug>.json` and edit it:
   - `group`: `paris`, `morocco` or `academic` (groups are defined in `content/site.json`);
   - `order`: position inside the group; `filters`: ids from `site.json`;
   - `hero`: a landscape image (wider than 1.2:1) opens the page as a full-width band; a portrait image opens it as a two-column spread;
   - `figures`: drawings (`"kind": "drawing"`, shown on a plate, never cropped) or renders; a figure with `items` shows a series side by side;
   - every fact gets a `source` (see the ledger keys). Write nothing you cannot source.
4. Run `node tools/build.mjs`, then `npm run og` and `npm run qa`.

## Add the website or the app (Digital)

Create `content/digital/<slug>.json`. The navigation gains a "Digital" item automatically when the first file exists. Suggested fields: `title`, `kind` (`website` or `app`), `summary`, `role`, `stack`, `status`, `links` (URL, App Store, Google Play), `screens` (images in `images/digital/<slug>/`), `year`. The page template (`digital.html` and `digital/<slug>.html`) is designed once the real material exists, so it follows what the product actually is; it uses the same layout shell, tokens and opener components as the case studies.
