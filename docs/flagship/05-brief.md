# 05 · Enhanced brief (v2, 2026-10-12)

This is the owner's request of 2026-10-12, rewritten as an executable brief. It supersedes nothing in `CLAUDE.md`; it adds the decisions and sources that the request implies.

## Role
Creative director, senior UX/UI designer, front-end engineer, and accessibility and performance engineer, with full delegated authority (`CLAUDE.md`, "Decision authority").

## Goal
A flagship architecture portfolio. Within 10 seconds a graduate committee or a heritage/architecture firm must see:
- **who**: Hazem Radhouani, architect;
- **what**: heritage documentation and earthen/vernacular architecture;
- **proof**: survey and documentation, BIM/Revit delivery, high-end visualisation;
- **next step**: selected work, research, contact.

## Sources of truth (precedence)
1. The owner's explicit answers (`03-spec.md` §7, 2026-09-26, and later sessions).
2. `2026 - Porfolio.pdf` (modified 2026-09-03).
3. The current site text (last edited 2026-06).
4. `2025 - Porfolio.pdf` (April 2025 content).

Rules:
- Nothing is invented.
- When sources disagree on a **number**, it is withheld until the owner confirms it.
- When they disagree on wording, the higher source wins and the conflict is logged.
- Every published fact is traceable in `content-ledger.md`.
- The PDFs and the phone number are never published.

## References
khoavu.com `/about`, `/works`, `/primitive`, `/grayscale`: pacing, layout and presentation only. Nothing is copied.

## Constraints
- Static GitHub Pages: no server, paid service or API key.
- WCAG 2.2 AA.
- Mobile, throttled: LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
- Checked at 320, 375, 768, 1024, 1440 and 1920 px.
- Purposeful motion only.
- Unique titles and descriptions, OG and Twitter cards, JSON-LD, sitemap, canonicals.
- Work on `flagship-upgrade`, ship through a PR to `main`, never force-push.

## Extensibility
- One content file per entry, plus a zero-dependency generator (`tools/`).
- A new project, or the owner's upcoming **website and app** (entry kind `digital`), becomes a coherent page by adding one data entry.
- A "Digital" navigation item appears automatically with the first digital entry.

## Deliverables
- **The site:** all existing URLs kept; two new project pages from the 2025 PDF.
- **Brand kit:** the arch mark (line and solid), the wordmark, favicons, share images.
- **Tooling:** `tools/` generator, checks and media pipeline, plus `tools/README.md`.
- **Docs:** `05-brief.md` (this file), `06-direction.md`, `brand.md`, `decision-log.md`, `content-ledger.md`, `07-qa-report.md`.
- **Content gaps:** a consolidated [CONTENT NEEDED] list.
- **The PR**, merged after the QA gates pass.

## Process
1. Research.
2. Direction.
3. **Comps first.** HTML prototypes built with the real assets, then screenshotted and critiqued. This is the image-to-code workflow without a paid image generator.
4. Brand kit and tokens.
5. Media.
6. Generator and pages.
7. Motion and interaction.
8. Metadata.
9. QA, with independent reviewer subagents.
10. PR.

## Acceptance (summary; full list in `07-qa-report.md`)
- axe: 0 violations at 375 and 1440 px on every page.
- No horizontal overflow at the six widths.
- Keyboard complete; reduced motion and no-JS both complete.
- Text ≥ 13 px (body ≥ 17 px); targets ≥ 24 px (primary ≥ 44 px).
- Lighthouse, 3-run median: mobile LCP ≤ 2.5 s and CLS ≤ 0.1; desktop Performance ≥ 95.
- Page weights within budget.
- Every fact traceable in the ledger.
