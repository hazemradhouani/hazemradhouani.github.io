# 08 · Design direction v3: "Field"

| | |
|---|---|
| Date | 2026-10-13 |
| Supersedes | 06-direction.md ("Threshold"); its engineering, content model and URLs are kept |
| Decision | D28 in `decision-log.md` |

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

## Idea
**Field.** A white field on which the work is laid out the way a surveyor lays drawings on a table: each object at its true proportion, nothing trimmed, everything on one grid. The interface recedes so that the drawings, renders and models lead.

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
- **Light pages.**
- **Reduced-motion handling**, which the reference lacks.
- **Transparency is used for drawings.** On the reference it appears only on /primitive.

## Tokens
| Token | Value | Use | Contrast on #FFF |
|---|---|---|---|
| bg | #FFFFFF | the field, every surface | |
| ink | #111111 | text, focus ring | 18.9:1 |
| ink-2 | #5E5E5E | metadata, captions, hover | 6.4:1 |
| line | #E6E6E6 | hairlines only (non-text) | |

- There is no accent colour; the imagery carries all the colour.
- Light scheme only: transparent black linework would vanish on a dark ground.
- Radius 0, no shadows.

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

- Pairs and triples use the same lines.
- Vertical rhythm uses three gaps only:
  - inside a group: the gutter;
  - between groups: 96 px (64 px on phones);
  - between chapters: 192 px (112 px on phones).

## Images
- **Never cropped, stretched or upscaled.** Every `<img>` shows its natural ratio. Each sits on the largest span not wider than its native pixels, so its edges fall on grid lines.
- **Justified rows:** 2–4 images share one height and fill the span exactly (`flex: <ratio> 1 0%`).
- **Cells:** drawing series in equal invisible cells, contained.
- **Drawings are transparent.** `tools/cutout.mjs` keys each sheet's own paper to alpha:
  1. white-balance the paper to white;
  2. exact white-to-alpha;
  3. a noise floor;
  4. trim to the ink.
  The result is a derived file in `images/cut/`; the master and the content are untouched.
- **Renders and photographs keep their scenery.** The sky and street are the image, many renders are credited to Studio BELEM, and no ML matting is available, so cutting them would invent edges. What is removed is every background *around* them.
- The PDF's own alpha cutouts (the thesis books, section cutaways) are used where they show the work.

## Motion
Each motion has a purpose, and reduced motion removes it.

Easing:
- `--ease-out: cubic-bezier(.16,1,.3,1)`;
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
- **Project:** hero (plate or hero pair) → centred title and spec → quote → role and narrative → figures → film → next project.
- **Research**, **About**, **Motion** and **404** use the same system.

## Brand
- The arch monogram (drawn from the PDF back cover) is retired.
- The wordmark is live text: HAZEM RADHOUANI in Plex Sans 600 capitals.
- Icons are a typographic "HR", black on white.
