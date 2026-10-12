# Project: Hazem Radhouani architecture portfolio
Goal: upgrade this portfolio from a simple site to a flagship-level architecture portfolio in design, UX, content presentation, code quality, accessibility, and performance. Every decision must be deliberate and justified. Nothing is left to default.

## Audience (in priority order)
1. Graduate admissions and scholarship committees (evaluating research depth and rigor)
2. Architecture and heritage firms (evaluating skill, output quality, and professionalism)
Every design and content decision must serve these readers. A committee member should grasp who I am and what I do within 10 seconds of landing.

## Identity to express
Architect specializing in heritage documentation and earthen/vernacular architecture. Strengths: survey and documentation, BIM/Revit delivery, high-end visualization (Unreal Engine, D5 Render, PBR material capture). The design language should come from this identity, not from generic developer-portfolio trends.

## Hard rules
- Content truth: never invent projects, clients, awards, dates, metrics, quotes, or descriptions. Use only content already in the repo or content I provide. Mark gaps as [CONTENT NEEDED: description] and list them.
- Read before modifying: never edit a file you have not read in this session.
- Work on a branch named flagship-upgrade. Never commit directly to main and never force-push. Work reaches main only through a pull request from flagship-upgrade, which Claude merges once the QA gates in "Quality bar" pass.
- Never delete untracked originals (for example the portfolio PDFs). A tracked file may be removed when it is superseded, because git history can restore it; log every removal in docs/flagship/decision-log.md.
- Hosting is static (GitHub Pages). Do not introduce anything requiring a server, paid service, or API key. If one would clearly help, record it in the decision log as a recommendation instead.
- No hardcoded secrets. No new dependency without stating why it is needed and its size cost.
- No invented APIs, config keys, or library features. If a library version or API may have changed, check current docs or the installed package source. Label anything unchecked as UNVERIFIED.
- Decision authority: I delegate every decision to Claude. Do not ask me for permission or confirmation. Take the best decision for the website (design direction, information architecture, content structure, build tooling, deploy config, naming, everything) and proceed. Record each significant decision, with its reason and the alternatives rejected, in docs/flagship/decision-log.md.
- If two of my requirements conflict, resolve the conflict with the best option, log the conflict and the resolution in the decision log, and mention it in the next progress report.
- Content questions only I can answer (facts, permissions, missing material) are never guessed: publish nothing in their place, mark them [CONTENT NEEDED: description] and keep working.
- "Should work" is not "verified". Every report states what was actually tested, how, and what was not.

## Quality bar
- Accessibility: WCAG 2.2 AA minimum. Text contrast 4.5:1 (3:1 large text), visible focus states, full keyboard operation, target size at least 24x24 CSS px (prefer 44x44 for primary actions), semantic HTML, meaningful alt text, prefers-reduced-motion respected.
- Performance (mobile, throttled): LCP under 2.5s, CLS under 0.1, INP under 200ms. Images in modern formats with explicit dimensions, responsive srcset, lazy loading below the fold.
- Responsive: designed and checked at 320, 375, 768, 1024, 1440, and 1920 px widths.
- Motion: every animation has a stated purpose (orientation, feedback, or hierarchy). No decoration-only motion. Nothing blocks content.
- SEO/sharing: unique titles and meta descriptions, Open Graph and Twitter card images, structured data (Person, CreativeWork) where accurate, sitemap, canonical URLs.
- Every visual decision has a written reason (usability, identity, convention). "Looks good" is not a reason.

## Working method
- Use the skills, subagents, plugins, and MCP tools actually available in this session. Check what is loaded; do not assume a tool exists.
- Use subagents for parallel read-only analysis and for independent review of your own work.
- All planning documents go in docs/flagship/.
- Commit in small, logically complete steps with descriptive messages.

## Design reference (optional)
Claude may use this website as a design reference if useful. Reference only: study layout, pacing, and presentation; do not copy its content, code, text, or assets.
- http://www.khoavu.com/about
- http://www.khoavu.com/works
- http://www.khoavu.com/primitive
