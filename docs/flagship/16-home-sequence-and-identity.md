# 16 · Home "Sequence", the scroll choreography, and the Google identity (D80–D89, 2026-10-21/22)

## Why
The owner asked for three things (2026-10-21):
1. Dissect the two saved reference pages in `docs/01/` (Format, format.obys.agency; Huy Phan, huyml.co) and Studio KHOA VU's works page (`docs/KHOA VU/`), and apply how their scrolling and motion feel to the portfolio.
2. A home page different from the current one: a mix of the references' scroll animation, hero images and colour changes.
3. Google to show the site as **HAZEM RADHOUANI**, with the line "architect with international experience" and the logo, the way it shows Studio KHOA VU in his screenshot (`docs/Screenshot 2026-10-21 215418.png`, untracked).

The reference folders and the screenshot stay untracked: they are third-party pages, studied and not copied (CLAUDE.md).

**Root cause of the Google request (checked 2026-10-21).** The site was served at `https://hazemradhouani.github.io/portfolio/`, and the host root and `/favicon.ico` answered 404. Google's documentation:
- "Google Search does not support site names at the subdirectory level."
- Favicons are "one per hostname".

So the site must live at the host root (D81).

## 0 · The enhanced brief (the owner's prompt, rewritten for best input and output)

> **Mission.** Rebuild the home page of Hazem Radhouani's architecture portfolio as a cinematic, scroll-choreographed sequence. Apply the same motion language across the site.
> - The motion is distilled from three references, measured from their saved source and observed live.
> - It must feel as smooth and gently eased as the references while keeping the site's quality bar: WCAG 2.2 AA, LCP < 2.5 s on throttled mobile, CLS < 0.1, INP < 200 ms, works from 320 to 1920 px in both themes, and reduced motion respected.
> - Make Google present the site as **HAZEM RADHOUANI**, with the one-line description "Architect with international experience…" and the HR logo, like the Studio KHOA VU result in the screenshot.
>
> **Inputs.**
> - The three saved pages and their asset folders.
> - The live sites, for behaviour that the saved copies don't run offline. Format's copy does not render from `file://`.
> - The repo's content JSON (the only source of facts).
> - `CLAUDE.md`, decisions D1–D79, and plan 15.
>
> **Outputs.**
> 1. The dissection with exact numbers (§1).
> 2. Decisions D80–D88 with the alternatives rejected.
> 3. The new home, plus site-wide scroll motion.
> 4. Root hosting, title, description, site name and favicon.
> 5. Extended QA.
> 6. A PR from `flagship-upgrade`, merged when the gates pass.
> 7. A live post-deploy check.
>
> **Constraints.**
> - No invented facts.
> - Static GitHub Pages; no new runtime dependency.
> - Every animation states its purpose (orientation, feedback, hierarchy). It is compositor-only where it is continuous, never blocks content, and never hides the LCP element.
> - Nothing is ever cropped (D32). Drift moves whole groups, never an image inside its frame.
> - Every reversal of an earlier decision (D37, D77) is logged with its resolution.
>
> **Definition of done.** These pass, and the screenshots have been reviewed:
> - `node --test`, `npm run build`, `npm run qa` (every pass, both themes), `npm run perf` (home mobile LCP < 2.5 s, CLS < 0.1).
> - Independent code and accessibility reviews have found nothing left open.
> - The live root serves the new home with the new title, LD, favicon and redirects.

## 1 · What the references actually do (measured from source, observed live)

| | Format (obys) | huyml.co | Studio KHOA VU /works |
|---|---|---|---|
| Scroll | **Lenis 1.3.26 on its defaults**: lerp 0.1 (frame-rate independent), wheel ×1, no touch smoothing, on the GSAP ticker | A custom per-frame lerp of **0.075**, wheel ×1.15, delta clamp ±240, off on coarse-pointer phones; the page height equals the viewport (virtual scroll) | Native, no library, no parallax |
| Curves | CSS `cubic-bezier(.22,1,.36,1)` only (our house curve); GSAP power2/power3 | `cubic-bezier(.22,1,.36,1)` for the UI; power2.out / power4.out for arrivals | Quartic ease-out ≈ `cubic-bezier(.165,.84,.44,1)` |
| Signature moves | Logo letters rise from a mask (0.95 s, stagger 0.085); rules draw (0.5 s); masked lines (0.7 s, stagger 0.06); **image drift ±7 % of the frame, image at 114 %**; card ↔ frame scale; **a circle wipe changes the ground**; a back-nav on scroll-up | Blur-up arrivals (opacity 0, blur 12 px, y 18 → 0, 0.7 s, stagger 0.08); hero image over 1.6 s (power4.out); **big tabular counter "18 /19"**; inactive items at opacity 0.24 (320 ms); per-project colour swatches; ground #ECECEC | **Autoplay crossfade hero**: 4 s hold, incoming 1 s, outgoing 1.2 s (the overlap makes a soft dissolve); greyscale drawings and GIFs alternate with colour renders, so the colour changes come from the images, not the page (the page itself never changes colour); centred stacked logo, serif lowercase nav |
| Not taken | In-frame drift at 114 % (it crops, D32); a 3.95 s preloader and curtain (it delays the largest paint); physics; a mobile splash; no reduced motion | Virtual scroll (breaks find-in-page, keys, anchors); WebGL; sound; no reduced motion | 8 MB GIFs; no pause control (WCAG 2.2.2) |

The site already shipped Format's engine (Lenis 1.3.26, D79) and curve (D75). The difference the owner felt came from:
- the **scroll-linked choreography** (drift, a window opening, stacking, ground changes);
- **arrival details** (letter masks, blur-up, counters);
- **Studio KHOA VU's dissolving hero**;
- a slightly **softer glide** (huyml's 0.075).

## 2 · What was built (decisions D80–D88)

### Hosting and identity
- **Root hosting (D81).**
  - `site.base` is `/`, and the repository is renamed `hazemradhouani.github.io` after the merge.
  - `portfolio/<page>` redirect stubs: canonical, refresh 0, `location.replace` keeping the hash, no `noindex`. `tools/tests/redirects.test.mjs` checks them.
  - `404.html` moves other old `/portfolio/` paths to the root.
  - QA reads the live origin from `site.json`.
- **Google identity (D82).**
  - Site name and home title HAZEM RADHOUANI.
  - The description is the D45 identity with "international experience".
  - The HR favicon is redrawn for the circular crop, and a 96 px PNG is declared.

### Engine (D83)
- Lenis lerp 0.08.
- A progress driver in `js/site.js` writes `--p` on `[data-fx]` elements, under `html.fx` (fine pointer, no reduced motion, set before the first paint).
- CSS maps `--p` to translate, scale and opacity.

### Home (D84–D87)
1. **Opening:** the name centred at a clear display size, 32 to 60 px (D89, the owner's request, replacing the full-column wordmark of D84; its letters rise from masks), the strip of facts under a rule (blur-up), and the window of renders. The window holds one render per country, dissolving as Studio KHOA VU's do, in one pass that rests on Al-Arg. It has a pause/play button that keeps its place, and it opens to the full width as the page leaves the top.
2. **Conviction.**
3. **Al-Arg at three scales.**
4. **Selected work:** a stack of sticky plates. Each sits on a ground taken from its render (`tools/grounds.mjs`, `content/grounds.json`), with a large counter, greyscale to colour as it settles, and stepping back as the next plate covers it.
5. **Capabilities.**
6. **Research and the footer on ink** in the light scheme, reached by Format's circle wipe.

### Site-wide (D88)
- Hero groups (case-study opening, Work chapters, next project) drift ±16 px as a whole.
- Captions come into focus as they rise.

### Safeguards
- **Reduced motion, touch and no-JS:** everything still and in place. Reduced motion switched on mid-visit stops it all.
- **Focus:** focus reaching a covered plate brings it back; a plate taller than the screen stops sticking.
- **Wordmark:** its words wrap between themselves rather than run past the column.
- **Print:** prints paper grounds.
- **View transitions:** only the chosen plate is named for the transition.

## 3 · Verification
Results are recorded in the PR and in `14-continuation.md`.
- `node --test tools/tests/*.test.mjs` and `npm run build`.
- `npm run qa`: every page, six widths, two themes, axe. Plus:
  - the home pass (window, stack, covered focus, renders, pause, one pass, research ground);
  - the still home checks (name fill, first screen, nothing plays or stacks under reduced motion);
  - motion and smooth-scroll passes.
- `npm run perf` (mobile, throttled).
- Screenshots reviewed in headless Chrome at 1440 and 375, with motion and with touch.
