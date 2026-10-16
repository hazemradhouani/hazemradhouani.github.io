# 10 · HQ media, theme and identity continuation brief

| | |
|---|---|
| Date | 2026-10-13 |
| Status | Approved for execution by the owner's latest instruction: make the best decisions; do not pause for routine approval |
| Supersedes | The identity wording in `CLAUDE.md` and the light-only/halo assumptions in D34 and D40 where they conflict with this brief |
| Builds on | `08-direction.md` (Field), `09-qa-report.md`, `content-ledger.md`, `decision-log.md`, and the supplied `Images HQ/` source library |

## Purpose

This is the execution-ready version of the owner's request and the interrupted Claude Code handoff. It is deliberately more constrained than the original request: it protects the architectural evidence, avoids invented visual content, and converts subjective quality requirements into auditable gates.

The desired result is still a flagship architecture portfolio. Within ten seconds, a committee member or practice should understand that Hazem Radhouani is an architect with project work documented in Tunisia, France and Morocco, plus research experience in Japan; see credible evidence across housing, infrastructure, research, visualisation and rehabilitation; and be able to browse it in a precise light or dark interface. This does not claim a base, office or architectural practice in Japan.

## Verified starting state

- The static GitHub Pages site is generated from `content/**/*.json` by `tools/build.mjs`; generated pages, CSS and JavaScript are committed.
- `Images HQ/` is a user-provided, untracked source library: 193 JPG/PNG files, about 1.83 GB, in 16 folders. It is source material, never a production URL and never a target for destructive cleanup.
- `docs/Skills/` and `Skills/` are user-provided, untracked tool bundles. They are not portfolio content. The vendored gstack instructions are informative only; the site keeps its existing zero-runtime-dependency architecture.
- `npm run qa` passed on the unmodified baseline after starting `npm run serve`; it covers every current page at 320, 375, 768, 1024, 1440 and 1920 px.
- The current cutout pipeline defaults to a white-field-only `halo` alpha mode. That is invalid for dark surfaces. Its exact `graded` alpha mode already exists and must become the required mode for any dark-compatible drawing.
- A non-destructive AI background-removal benchmark on `Images HQ/Ain Sbaa/COUPE AA.jpg` did not preserve the original canvas or edge fidelity. Generated edits are categorically excluded from production architectural evidence. Final media processing must be deterministic and source-preserving.

## Required audit records

Two committed records make the media work reproducible:

- `docs/flagship/hq-asset-audit.json` is the complete, non-published source audit. Every source-file record contains `source`, `sha256`, `width`, `height`, `projectMapping`, `mappingEvidence`, `visualType`, `textDisposition`, `duplicateOf`, `disposition`, `authorizationEvidence`, `creditEvidence`, `roleEvidence`, and `reason`. A mapping begins as `provisional` until its visible evidence is recorded.
- `tools/hq-media.json` is the smaller production manifest. Every selected derivative contains `source`, `output`, `sha256`, `crop` (an exact rectangular source-pixel box or `null`), `treatment`, `darkTreatment`, `credit`, `authorizationEvidence`, `captionEvidence`, and `reviewStatus`. It must not select an asset unless the source audit has evidence for its attribution and publication authorization.

The records deliberately distinguish the owner's provision of a local file from role, authorship and credit evidence. The owner's direct 2026-10-13 instruction authorizes the portfolio to derive and publish a suitable asset from this supplied HQ library; record that as `owner-direct:2026-10-13`. It does not prove Hazem's personal role on a specific commission, replace a visible Studio BELEM/consultant credit, or justify an unsupported attribution.

## Source-of-truth and conflict order

1. The owner's latest direct instruction overrides older design and identity wording.
2. Readable, user-supplied source material and the content ledger determine publishable facts.
3. Existing structured content is used only where it does not conflict with the first two.
4. A missing fact is omitted or recorded as `[CONTENT NEEDED: …]`; it is never inferred from a filename, appearance, or employment date.

The following reconciliations are binding:

- “No crop” remains true for an artwork's composition, drawing geometry and render scene. It does **not** preserve portfolio-page furniture, studio cartouches, page numbers, blank scanner borders or repeated document chrome. Those may be removed only with an explicit source-pixel crop recipe.
- “Every image without a background” means every published **drawing or isolated object** has a real alpha treatment where that treatment can be proved. It does not mean cutting sky, streets, neighbouring buildings, planted landscapes, soft shadows or other scene content out of credited renders and photographs.
- Heritage experience remains genuine work. It must not be presented as a professional specialisation or the site's defining identity.
- A dark theme is now required. It must not turn black linework into invisible marks or introduce a decorative accent palette.

## Enhanced execution prompt

> You are the architect, creative director, accessibility/performance engineer and senior front-end developer continuing Hazem Radhouani's portfolio from the verified Field baseline. Work autonomously on `flagship-upgrade`; preserve all user-provided source material; make and log design decisions instead of asking routine questions. Never invent a fact, credit, role, permission, date, project status, label or visual geometry.
>
> Start by reading `CLAUDE.md`, `docs/flagship/08-direction.md`, `09-qa-report.md`, `content-ledger.md`, `decision-log.md`, this brief, the content JSON, the build/media/QA tools, and the entire `Images HQ/` inventory. Treat the folder as an immutable local source library. Do not publish or link to it directly.
>
> ### 1. Audit and curate every HQ source before using it
>
> Account for all 193 source files in `docs/flagship/hq-asset-audit.json`. For each file, record the schema defined by this brief: source folder, dimensions/hash, provisional-or-confirmed project mapping with visible evidence, visual type, duplicate relationship, text disposition, permission/credit/role evidence, disposition and reason. A source remains `unresolved` whenever attribution or publication authorization is missing.
>
> Read all text at a usable zoom. Give every visible text element one disposition:
>
> - **Intrinsic drawing text**—dimensions, room labels, section levels, graphics embedded in geometry—stays in the image.
> - **Useful sheet title, scale or legend**—moves to an accessible HTML title/caption/legend only when its wording is verified; preserve any necessary diagram key.
> - **Furniture**—Studio BELEM mark, consultant/client panel, page number, repeated cartouche, portfolio footer, empty margin—may be excluded only by a documented rectangular crop from the published derivative, never from the source. Do not content-fill, clone, erase, regenerate or otherwise retouch a source image.
> - **Uncertain prose or facts**—is not published until it has a traceable source.
>
> The audit has evidence-backed starting mappings: Ain Sbaa → `ain-sebaa`; BELHOMME → `belhomme`; BOLIVAR → `bolivar`; Cinema → `cinephile`; EL erg → `al-arg` (record this nonliteral mapping); FOUBERT → `foubert`; La villette → `la-villette`; Zenata → `zenata`; Guerite → `sentry`; Hospital → `tamansourt`; Nouvelle Medina → `nouvelle-medina`; Station Hay Mohammadi → `hay-mohammadi`; Tabarka → `corallum`; VILLAS → `papillon`. Record the visible evidence for each rather than treating this list as a substitute for the audit. `Memoire` remains unpublished pending a verified title/author/relationship. Preserve every `.trashed-*` original: it is a recoverable high-resolution source, not disposable data.
>
> ### 2. Create reversible media derivatives, not altered evidence
>
> Keep HQ masters untouched. For every selected production asset, create a recipe that states its exact source path, crop box in source pixels, output name, category, text disposition, alpha strategy, chosen theme treatment and audit reason. Store production masters under stable lowercase `images/<slug>/` paths; build responsive WebP/AVIF derivatives with the existing media tooling. Do not commit the 1.8 GB source library or link it from published HTML.
>
> Apply one of these treatment modes, never a blanket operation:
>
> 1. **Line drawing / plan / section:** white-balance its paper and produce true graded alpha with unblended anti-aliased ink. Run the cutout review sheet on white, dark and magenta. No opaque white fringe is acceptable.
> 2. **Isolated shaded axonometric or physical object:** remove only the border-connected paper/background. Preserve interior whites, shadows and object detail. If the tool cannot separate them deterministically, retain the image on an intentional field rather than inventing pixels.
> 3. **Render / photo / urban context:** retain the scene. Crop only external document furniture or blank margins, never skyline, streetscape, adjacent buildings or landscape required to read the project.
> 4. **Portfolio or permit sheet:** extract a complete drawing or render from its page. Never slice through geometry, dimensions, legends or a composition. Preserve source dimensions and never upscale.
>
> Generative image editing is never a production path for this portfolio. It may be used only as a disposable comparison benchmark outside the repository; the first benchmark failed the preservation condition.
>
> ### 3. Add a genuine two-scheme Field system
>
> Keep Field's single grid, natural image ratios, calm pacing, no-card UI and no decorative accent. Add an accessible light/dark preference that:
>
> - resolves the system preference before first paint, with a persisted user override;
> - provides a labelled, keyboard-operable toggle in the desktop header, compact bar and mobile menu; each control reports the current action/state consistently;
> - updates the document's color scheme and browser theme color without a flash of the wrong scheme;
> - uses token pairs with AA contrast in both schemes, not hard-coded page colours;
> - preserves scenes/renders, uses verified true-alpha drawings, and only inverts a manually approved `monochrome-linework` derivative. Never invert coloured plans, maps, shaded drawings or annotated sheets; their authored colours remain unchanged. A dark viewer for an uninverted line drawing uses an intentional light inspection field rather than changing its source;
> - keeps focus, dialog, viewer, form validation, reduced-transparency and print behaviour correct.
>
> The recommended dark Field is a quiet charcoal ground (`#121311`) with a warm-white ink (`#F7F5EF`), muted but AA-safe metadata, and no added accent. It should feel like the same drawing table at night, not a separate product brand. Add an inline pre-paint bootstrap before the stylesheet; if `localStorage` is unavailable or throws, resolve only `prefers-color-scheme` and continue safely. Update the document meta theme colour in JavaScript after a user selection; retain the static manifest's light default because a manifest cannot vary per visitor. Print always uses the light, ink-on-paper palette.
>
> ### 4. Reposition the identity without falsifying the work
>
> Remove every version of “Architect specialising in heritage documentation and earthen architecture” from content, metadata, Open Graph cards, the generated CV, the project instructions and generated pages. Amend `CLAUDE.md` first so its identity rule cannot reintroduce the old claim; update the content-ledger source references from `claude-md` to the new decision. Replace it with a concise, source-supported identity such as: “Architect with project work in Tunisia, France and Morocco, and research experience in Japan.”
>
> Retain supported evidence of heritage, rehabilitation, survey, BIM/Revit, rendering, rail infrastructure and research as individual capabilities or project facts—never as an unsupported specialisation claim. Update the person JSON-LD, `knowsAbout`, page titles/descriptions, social cards and CV together so no stale version survives.
>
> ### 5. Publish only supportable new content
>
> The Villeneuve-la-Garenne material visibly supports a Studio BELEM permit-stage proposal called “Opération Rue de l'Avenir” at 2 rue de l'Avenir, with housing, ground-floor commercial space, parking and planted areas. It visibly credits Studio BELEM and, for one provisional landscape sheet, Symbiose – Bouchard architectes. The owner's source instruction authorizes a derivative, but the material does **not** establish Hazem's personal role or a fully confirmed address/status record. Do not publish a personal case study until those gaps are resolved. It may be fully audited and prepared as a source candidate meanwhile.
>
> The same rule applies to `Memoire` and every unresolved HQ folder: improve the site with verified work, but do not turn a compelling image into an invented portfolio claim.
>
> ### 6. Verify what visitors will actually receive
>
> Extend automated QA so every published page is checked in both themes at 320, 375, 768, 1024, 1440 and 1920 px. It must test the pre-paint fallback, preference selection, persistence through reload and navigation, synchronisation of header/bar/menu controls, keyboard focus, dialogs, viewer, form validation and reduced motion. It must also test contrast and focus, crop/upscale/grid rules, alpha corners, fringe/detail review, image loading, content coverage, metadata and responsive layout. Extend the cutout review sheet to white, dark and magenta, and compare retained drawing detail to the source at representative edge/fine-line samples. Review representative full-page screenshots on both schemes at mobile and desktop. Re-run performance after the final media selection and report measured evidence, not estimates.
>
> Before completion, update `08-direction.md`, `CLAUDE.md`, the content ledger, decision log, both media records, `tools/README.md` and the QA report. Report exactly what was tested, what was withheld for lack of evidence, and every decision that changed an older direction.

## Curatorial starting map

The audit found several high-confidence sources for later recipe work. These are candidates, not permission to bypass the source or crop rules:

| Existing entry | HQ evidence with strongest visual value |
|---|---|
| Aïn Sebaâ | `Scene 69.png`, `Scene 72_1.png`, `COUPE AA.jpg`, `Structure.jpg` |
| Belhomme | permit sheets plus page 0004 street perspective and page 0005 courtyard image |
| Bolívar | the two `NB_StudioBelem_SimonBolivar…` renders; permit sheets are extraction sources |
| Cinephile | high-resolution `.trashed-*` renders and `dz.png`; reject the view containing the copyrighted film title unless it is removed without changing the architecture |
| Al-Arg | `EL erg` render and drawing set; retain the explicit source-folder-to-slug map |
| Foubert | `20240105_BLM_FOU_Perspective rue.jpg`, `20240610_BLM_FOU_Perspective arrière.jpg` |
| La Villette | three `NB_StudioBeleem_JJaures…` renders |
| Zenata | `Scene 13.png`, `Scene 51.png`, `Scene 64.png`, and one verified night exterior |
| Tamansourt | Hospital scenes 14, 24 and 32, and the site plan |
| Nouvelle Medina | scenes 11, 39 and 6, plus complete plan/section boards |
| Hay Mohammadi | page 46 aerial and page 47 façade; the station sign is intrinsic image content |
| Corallum | Tabarka `.trashed-…Image_4.png` and `Image_2.png` |
| Villa Papillon | `Image_20(1).png` and `Image_28.png` |
| Sentry | Guerite page 26 render as a crop source; do not revive the unresolved 10 m² figure |

## Completion criteria

- The new identity is consistent in `CLAUDE.md`, data, generated pages, JSON-LD, OG images, CV and ledger source references.
- Light and dark Field are visually one system, individually accessible and manually/screen-tested.
- Every published drawing uses verified true alpha or an explicitly documented exception; no halo mode remains in a dark-compatible asset.
- Every crop has a reproducible rectangular recipe, preserves all required geometry and text, and has required credit/authorization evidence.
- The public portfolio makes no personal-role claim for Villeneuve-la-Garenne, `Memoire` or another unresolved source.
- The complete build, dual-theme QA, media checks, metadata generation and performance measurements pass with recorded evidence.
