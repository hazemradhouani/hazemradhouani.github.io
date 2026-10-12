# 07 · QA report (Threshold build, 2026-10-12)

Everything below was run against the generated site served locally under `/portfolio/` (`tools/serve.mjs`, gzip on), in Chrome stable driven by playwright-core 1.56.1. Tools: `tools/qa.mjs`, `tools/perf.cjs`, an interaction script (results quoted below). Nothing here is a claim about the live GitHub Pages host until the post-merge check at the end.

## 1. Every page, every width (`npm run qa`)
21 URLs (home, work, 14 case studies, research, about, films, 404, and a missing deep URL served by the 404 page) at 320, 375, 768, 1024, 1440 and 1920 px.

| Check | Result |
|---|---|
| axe-core 4.10.3, WCAG 2.0 / 2.1 / 2.2 A and AA, at 375 and 1440 | **0 violations on every page** (first run found 21 `image-alt` failures: decorative images had lost `alt=""`; fixed in `tools/lib/images.mjs`) |
| Horizontal overflow at all six widths | **None** (fixed during QA: header at 320 px, next-project block on phones, band titles at 1024 px, a nested grid rule on the films page) |
| Broken images | None |
| Text under 13 px | None |
| Interactive targets under 24 px (outside running text) | None (set thumbnails briefly measured 0 px tall before load; fixed with width:100% so the width/height ratio holds, which also removes layout shift) |
| Console errors | None, except the expected HTTP 404 of the deliberately missing URL |

## 2. Interaction (scripted, Chrome)
| Check | Result |
|---|---|
| Skip link is the first tab stop and visible (measured after its 200 ms slide: top 8 px) | PASS |
| Skip link moves focus to `main` | PASS |
| Visible focus ring on links | PASS |
| Full-size viewer opens as a modal with the image; Esc closes; focus returns to the opener | PASS |
| Mobile menu opens as a modal dialog; 12 Tabs never leave it; Esc closes; focus returns to Menu | PASS |
| Work filters appear only with JS; "Academic" shows 3 of 14 and the live status says so | PASS |
| JavaScript disabled: title, spec and every sheet image visible; footer navigation present | PASS |
| `prefers-reduced-motion: reduce`: the three-scales diagram is never hidden | PASS |

## 3. Performance (lab substitute, not Lighthouse)
`tools/perf.cjs`: Chrome's own LCP and layout-shift observers, 412 x 823 at DPR 2, emulated slow 4G (150 ms RTT, 1.6 Mbit/s down), 4x CPU slowdown, cache disabled, median of 3 runs.

| Page | LCP | CLS | Transfer |
|---|---|---|---|
| Home | 1.36 s | 0.000 | 398 KB |
| Work | 1.18 s | 0.000 | 456 KB |
| Al-Arg | 1.37 s | 0.000 | 371 KB |
| Belhomme | 1.77 s | 0.000 | 434 KB |
| Zenata | 1.70 s | 0.000 | 193 KB |
| Research | 1.92 s | 0.000 | 211 KB |
| About | 1.31 s | 0.000 | 312 KB |
| Films | 1.70 s | 0.000 | 453 KB |

Targets: LCP < 2.5 s, CLS < 0.1, total before interaction ≤ 900 KB: **met on every page measured**. The September audit measured mobile LCP of 3.6 to 6.9 s on the old site.

**Shipped sizes (gzip -9):** CSS 9.4 KB (46.0 KB raw), JS 4.7 KB, HTML 4.3 to 5.7 KB per page. Fonts load per need: EB Garamond Latin 44 KB + Plex Sans Latin 48 KB on every page, Garamond italic 48 KB where a quote appears, Latin-Ext only for those characters.

## 4. Not tested (stated, not assumed)
- **Lighthouse** scores: not run (the Chrome DevTools MCP audit excludes performance; the CLI was not installed). INP was not measured; there are no long tasks by construction (no framework, 4.7 KB deferred JS), but this is UNVERIFIED.
- **Safari and Firefox**: not available here. View transitions, `commandfor`/`command` on the menu button (JS fallback present) and `text-wrap` are Chromium-first; all degrade to plain behaviour. UNVERIFIED.
- **Screen readers** (NVDA, VoiceOver): not run; semantics checked by axe and by hand (landmarks, one h1 per page, labelled dialogs, alt on every image, `lang="ar"`/`lang="fr"` on foreign text).
- **Real FormSubmit delivery**: not sent (it would email the owner); the request payload is unchanged from the verified September version.
- **Live GitHub Pages**: checked after merge (see the PR).

## 5. Independent review (subagent, read-only) and fixes
| Severity | Finding | Fix | Verified |
|---|---|---|---|
| Critical | Clicking a drawing image threw (stale `.fig` selectors), so the viewer did not open | Selector updated to `.sheet` / `.zoom` | Image click opens the viewer (scripted) |
| High | Single-figure alt text sat inside an `aria-hidden` link | Image wrapper is now a non-link `div[data-viewer]`; the "Full size" link stays the keyboard and no-JS path | axe 0; markup checked |
| High | Focus ring 2.5:1 inside the dark viewer | `.viewer :focus-visible` uses the cover accent (6.0:1) | CSS |
| High (confirmed) | `object-fit` frames did not fill: `<picture>` had no height | Frame pictures carry `height: 100%` | Frame height = image height on every home frame at 375 and 1440, and on openers |
| Medium | Figure titles at the same level as the section heading | Figure titles are `h3` | QA run |
| Medium | Viewer stage label without a role; submit button lost focus while sending | `role="group"`; `aria-disabled` instead of `disabled` | Code |
| Medium | GA4 without any opt-out | Not loaded when Do Not Track or Global Privacy Control is on (consent itself remains [CONTENT NEEDED]) | Code |
| Medium | Films meta description called Sentry a station; "based in" differs between pages | Wording fixed; location conflict logged as C18 | Ledger |

Full QA re-run after the fixes: all 21 URLs clean at six widths, axe 0 violations.
