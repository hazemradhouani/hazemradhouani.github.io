# 08 · Design direction v3: "Field"

| | |
|---|---|
| Date | 2026-10-13; amended 2026-10-13 and 2026-10-16 |
| Supersedes | 06-direction.md ("Threshold"); its engineering, content model and URLs are kept |
| Decision | D28 in `decision-log.md`; amendments D46–D63 |

## Why
The owner rejected Threshold. It had translated the printed 2026 portfolio to the screen: cream paper, warm-black covers, Garamond capitals, beige plates behind drawings, the spread opener, "Fig. n" labels, running heads and the arch monogram.

The owner's brief:
- the PDF is a **source of material**, not of design;
- a white field, with no cream;
- every image without a background;
- no crops;
- no grid or alignment errors;
- the pacing and presentation of khoavu.com/works;
- smooth, eased motion.

The audit of Threshold confirmed the defects:
- 28–63% of each hero survived its `object-fit: cover` frame;
- text started on five different columns;
- there were 11 different text measures;
- drawings were flattened on one cream and shown on another.

### Current amendment (2026-10-13)

The original brief above is retained as the historical starting point. The owner's later, execution-ready brief (`10-hq-media-theme-continuation-brief.md`) refines three parts of it without changing Field's core: Field is now a light/dark system; a reproducible source-pixel crop may remove only external document furniture, not an artwork's geometry or scene; and every dark-compatible drawing uses reviewed graded alpha rather than a white-field-only halo. The portfolio identity is likewise broad, documented project work across Tunisia, France and Morocco with research experience in Japan; heritage and earthen work remain evidence, not a defining specialisation.

### Amendment (2026-10-16): the HQ library
The case studies are re-derived from the owner's `Images HQ/` library (plan `12-hq-dissection-plan.md`, procedure `13-dissection-protocol.md`). What changed in the design:
- **Text on blank paper leaves the pixels and becomes type (D49, D57).** A free-standing title, callout or legend on a drawing's paper is erased component by component and re-set in the site's own fonts: labels in Plex Sans 600, sentence case, where the printed text stood; legends as HTML swatches sampled from the source. Intrinsic text (room names, dimensions, levels) and callouts tied to leader lines stay in the drawing (D60). Renders are never edited; one may only be reframed to exclude text printed over it (D58).
- **Dark treatment per drawing (D50).** Greyscale linework is inverted by CSS (`invert(.965)`), so the paper truly disappears on charcoal; neutral linework with thin colour accents keeps their hue (`invert-accent`); colour-coded diagrams and shaded drawings sit on the inspection field; objects and scenes are unchanged.
- **One master cap (D55, D56).** 2 560 px for every published master, derivatives at exact heights, alpha scaled premultiplied, so no reduced drawing gains a pale rim.
- **Series stay at one scale (D57).** Long strips stack one per line; a tall drawing may raise its height limit to 820 px.

## Idea
**Field.** A quiet light or dark field on which the work is laid out the way a surveyor lays drawings on a table: each object at its true proportion, nothing compositionally trimmed, everything on one grid. The interface recedes so that the drawings, renders and models lead.

The name comes from the owner's discipline: fieldwork, survey, the measured field.

## What the reference taught (studied 2026-10-12, nothing copied)
khoavu.com is a Squarespace 7.0 site. The traits we keep, as principles:
- a pure white page;
- a centred, symmetric composition on a narrow canvas;
- projects as **chapters** on one long page (image, centred metadata lines, image groups);
- two typographic voices (a small serif text and tracked uppercase sans titles);
- a lowercase centred nav;
- quiet motion (opacity fades, colour-only hovers).

Where we deliberately differ:
- **No cropping.** The reference crops to fixed ratios; Field uses justified rows instead.
- **No autoplay** (WCAG 2.2.2).
- **Long text is left-aligned** in a centred column.
- **Descriptive alt text.**
- **A two-scheme Field.** The reference remains a study of its light-page composition; Field now offers the same hierarchy on a quiet charcoal ground as well as the original white field.
- **Reduced-motion handling**, which the reference lacks.
- **Transparency is used for drawings.** On the reference it appears only on /primitive.

## Tokens
| Token | Light / dark value | Use | Contrast |
|---|---|---|---|
| bg | #FFFFFF / #121311 | the field, every surface | |
| ink | #111111 / #F7F5EF | text, focus ring | 18.9:1 light; 17.7:1 dark |
| ink-2 | #5E5E5E / #C9C7C0 | metadata, captions, hover | 6.4:1 light; 11.4:1 dark |
| line | #E6E6E6 / #45463F | hairlines only (non-text) | |
| ui | #8A8A8A / #B4B1A9 | controls and non-text borders | |
| drawing-bg | #FFFFFF / #F7F5EF | intentional inspection field for black linework | |

- There is no accent colour; the imagery carries all the colour.
- A dark field never asks black linework to disappear: each cutout carries a reviewed dark treatment (D50). Greyscale linework is inverted by CSS; colour-coded or shaded drawings stay on `drawing-bg`; objects and scenes are unchanged.
- Radius 0, no shadows.

## Theme
- The inline bootstrap resolves a saved `hazem-theme` choice or `prefers-color-scheme` before the stylesheet paints. Storage failure is non-fatal.
- The header, compact bar and mobile menu expose the same labelled keyboard-operable toggle. A user choice persists across reloads and navigation; the browser theme colour and `color-scheme` track it.
- The two schemes share the same grid, type, image ratios, motion and no-accent discipline. Scenes and authored coloured drawings are not inverted.
- Print always returns to light, ink-on-paper tokens.

## Type
No new font files: the self-hosted EB Garamond and IBM Plex Sans swap roles.
- **EB Garamond**, the text voice:
  - body 19 px / 1.6;
  - lowercase nav;
  - captions 16 px;
  - the owner's quotes in italic.
- **IBM Plex Sans 600**, the title voice: uppercase, tracked +0.12em at small sizes and +0.08em at display sizes. Used for the wordmark, project titles and section labels.
- Tabular figures for years and dates.
- Nothing under 13 px.

## Grid (the only one)
- Canvas: max 80 rem (1280 px). Margins `clamp(20px, 5vw, 80px)`.
- Columns: 12 at 64 rem and up, 8 at 48 rem, 4 below. Gutter `clamp(16px, 2.2vw, 32px)`.
- `.g` is the only grid declaration. Blocks are placed only through centred spans:

| Class | 12 cols | 8 cols | 4 cols |
|---|---|---|---|
| `s-full` | 1–12 | 1–8 | 1–4 |
| `s-wide` | 2–11 | 1–8 | 1–4 |
| `s-text` | 3–10 | 2–7 | 1–4 |
| `s-narrow` | 4–9 | 2–7 | 1–4 |
| `s-four` | 5–8 | 3–6 | 1–4 |

Case studies use their own ladder and two text axes (rail `1 / span 3`, copy `4 / span 6`; plates `full` 1–12 or hung from col 4: `nine` 4–12, `text` 4–11, `narrow` 4–9, `four` 4–7): see `15-case-study-composition-and-motion.md` and D73.

- Pairs and triples use the same lines.
- Vertical rhythm uses three gaps only:
  - inside a group: the gutter;
  - between groups: 96 px (64 px on phones);
  - between chapters: 192 px (112 px on phones).

## Images
- **Never compositionally crop, stretch or upscale.** Every published derivative shows its natural ratio. Each sits on the largest span not wider than its native pixels, so its edges fall on grid lines.
- An exact rectangular source-pixel crop may exclude only page furniture outside the artwork: studio/client panels, repeated cartouches, page numbers, blank scanner borders or portfolio chrome. Its recipe is recorded in `tools/hq-media/<slug>.json`; it never slices drawing geometry, skyline, streetscape, neighbouring buildings or landscape. A free-standing title, label or legend on blank paper may be cropped away or erased only when it is re-set in HTML (D49).
- **Justified rows:** 2–4 images share one height and fill the span exactly (`flex: <ratio> 1 0%`).
- **Cells:** drawing series in equal invisible cells, contained.
- **Drawings are transparent where the paper can be separated without inventing pixels.** `tools/cutout.mjs` keys each sheet's own paper to graded alpha:
  1. white-balance the paper to white;
  2. retain antialiased ink with graded alpha;
  3. a noise floor;
  4. trim to the ink.
  The result is a derived file in `images/cut/`; the master and the content are untouched. Each candidate is reviewed on white, charcoal, magenta and in its dark rendering, plus a 1:1 detail; an opaque white fringe, loss of partial-alpha detail, a leftover printed label or an undeclared clipped edge fails. An isolated object (a book mockup, a white model) uses `object` mode: only the background connected to the border is keyed, so its own whites stay solid. A full-bleed exception remains on an intentional field rather than being falsely keyed.
- **Renders and photographs keep their scenery.** The sky and street are the image, many renders are credited to Studio BELEM, and no ML matting is available, so cutting them would invent edges. Only external document furniture or blank margins may be excluded by a documented crop.
- The PDF's own alpha cutouts (the thesis books, section cutaways) are used where they show the work.

## Motion
Each motion has a purpose, and reduced motion removes it. **Superseded in detail by `15-case-study-composition-and-motion.md` §3 (D75–D78)**: the house curve, the plate rise, the masked h1 and the reduced-motion crossfade. The table below is the 2026-10-13 state.

Easing:
- `--ease-out: cubic-bezier(.16,1,.3,1)` (now `cubic-bezier(.22,1,.36,1)`, D75);
- `--spring`: a critically damped spring (ω = 2π/0.45 s) sampled as `linear()`, 660 ms.

| Purpose | Treatment |
|---|---|
| Hierarchy (arrival) | Below-the-fold groups fade and rise 16 px, 700 ms, once, after the image decodes; never above the fold |
| Orientation | Cross-document view transitions: page crossfade and title morph |
| Orientation / state | The viewer opens from the clicked image and closes back into it (same path), with arrows and swipe between figures |
| Wayfinding | A compact bar slides in on scroll-up on long pages |
| Feedback | Underline draws from the left (240 ms); press 0.98 (120 ms) |
| State | Menu dialog fade, items rise 12 px, staggered 40 ms |

Never: autoplay, parallax, scroll-jacking or smooth-scroll libraries, custom cursors, hover zoom, loaders.

## Pages
- **Home:** identity → Al-Arg aerial (LCP) → "Look before building." → Al-Arg at three scales → selected work in justified pairs → capabilities (4+4+4) → research (the thesis as an object) → footer.
- **Work:** a centred index grouped by place → 14 chapters (hero, centred title and metadata, one justified row, link).
- **Project** (D73, D74; doc 15 §2): office | place line, title and the plain summary → hero → title block (descriptor and tag strip, spec cells, contents) → quote → role → overview → numbered chapters (rule, number and title on the rail, paragraphs on the copy axis, then their plates, captions beside or below) → film as the last chapter → next project.
- **Research**, **About**, **Motion** and **404** use the same system.

## Brand
- The arch monogram (drawn from the PDF back cover) is retired.
- The wordmark is live text: HAZEM RADHOUANI in Plex Sans 600 capitals.
- Icons are a typographic "HR", in the active ink token on the active field.
