# 06 · Design direction v2: "Threshold"

| | |
|---|---|
| Date | 2026-10-12 |
| Supersedes | The visuals of 02-direction / 03-spec (Measured Drawing); its engineering is kept |
| Decision | D05 in `decision-log.md` |

## Idea
One identity across print and web. The site is the owner's 2026 printed portfolio translated to the screen: paper pages bound between warm-black covers, tracked Garamond capitals, Plex Sans text, one earth accent, and the arch monogram from the back cover. The arch is a threshold between the existing and the new, and the owner's conviction is written on the home page in their own words: "Look before building."

**Design read:** an architecture portfolio and research dossier for graduate committees and heritage firms, in a documentary, heritage-editorial language. Dials: variance 6, motion 4, density 3.

## Tokens (all text pairs pass WCAG 2.2 AA)
| Token | Value | Use | Contrast |
|---|---|---|---|
| paper | #F5F1E8 | page | |
| panel | #ECE8DF | plates behind drawings | |
| ink | #16120F | text | 16.5:1 paper, 15.2:1 panel |
| ink-2 | #5F5953 | secondary text | 6.1:1 paper, 5.7:1 panel |
| earth | #8D3C1E | links, focus ring, the short rule | 6.7:1 paper, 6.1:1 panel |
| cover | #15110E | header, home cover, footer | |
| cover-ink / cover-ink-2 | #EDE7DC / #B3ABA0 | text on covers | 15.3:1 / 8.3:1 |
| cover-earth | #C9805F | accent on covers | 6.0:1 |

**Type:** EB Garamond (variable 400-800, roman and italic) for names, titles and the owner's quotes; IBM Plex Sans (variable) for everything else. Both OFL, self-hosted WOFF2 with Latin-Ext loaded only when needed, metric-matched fallbacks (Times New Roman 94.77%, Arial 101.17%) so the swap does not move text. Body 17 to 19 px, nothing under 13 px. Tracked capitals +0.12em small, +0.06em large. The vertical bar `|` is the printed portfolio's separator and is used the same way.

**Shape:** radius 0, no shadows; depth only from paper, panel and cover values.

## The mark
Constructed on a 64-unit square: baseline 64 wide; arch 44 wide (radius 22) and 55 high on it; a plumb line 16 long hangs from the apex (verticality, measurement: the survey). Proportions measured on the 2026 back cover. Files: `images/brand/mark.svg` (line, currentColor, non-scaling 1.25 px stroke, used at 22 px and up), `favicon.svg` (solid arch for 16 and 32 px), `images/brand/mark-maskable.svg` (touch and manifest icons inside the 80% safe zone). The wordmark is live text in Garamond capitals, so the visible label equals the accessible name.

## Layout
- 12 columns at 1024 px and up, 8 at 768, 4 below; gutters 20 to 64 px; content max 1440 px.
- **Case-study openers:** a portrait hero makes the printed spread (text panel beside a full-height render, alternating sides); a landscape hero (wider than 1.2:1) makes a band, the image capped at its native pixels with the title block below. On phones the title block always comes first.
- **Sheets** follow a width scale learned from the reference: renders full width, key drawings 10 of 12 columns, smaller sheets 8 of 12; drawings sit on the panel plate and are never cropped or enlarged; series ("sets") sit side by side and become one column on phones so linework stays legible. Every sheet opens in a full-size viewer at native pixels.
- **Home:** cover (photograph, name, role, credential, two actions) → the conviction → Al-Arg at three scales → selected work → capabilities, each shown by a document → research → back cover.

## Motion (each has a purpose; reduced motion turns it off)
| Purpose | Treatment |
|---|---|
| Orientation | Cross-document view transitions (240 ms); a project's title morphs from the index into its page |
| Explanation | The three scales of Al-Arg arrive in the order of the argument: territory, village, house (700 ms, once) |
| Feedback | Press scale 0.97 (120 ms); underline 160 ms; title colour on hover |
| State | Menu and viewer dialogs (200 ms); filter reflow (220 ms) |

Never: loaders, page-wide fades, parallax, scroll-jacking, custom cursors, marquees, hover zoom.

## What the reference (khoavu.com) taught, and what was not copied
Kept as principles: restraint and whitespace, two typographic voices, drawings treated as seriously as photographs and never cropped, image width tied to content, depth for featured work and breadth in an index. Fixed where the reference fails: 38 MB pages (here 136-456 KB), filename alt text (here descriptive alt on every image), centred 174-character lines (here 64ch, left-aligned), no prev/next (here a next-project link on every case study), illegible mobile drawings (here single-column sets and a full-size viewer). No content, code or asset was copied.
