# Content ledger

Every fact on the site comes from one of these sources (precedence in `05-brief.md`):

| Key | Source |
|---|---|
| `answer:F01`, `answer:F02` | The owner's answers recorded in `03-spec.md` §7 (2026-09-26) |
| `pdf2026:pN` | `2026 - Porfolio.pdf`, physical page N (text read visually; outlined) |
| `site` | The site text as published before this rebuild (last edited 2026-06) |
| `pdf2025:pN` | `2025 - Porfolio.pdf`, physical page N |
| `claude-md` | The identity instruction in `CLAUDE.md`; its former heritage/earthen-specialist wording is superseded for identity claims by `owner:2026-10-13` |
| `owner:2026-10-13` | The owner's current direct instruction: broad project-work identity and permission to derive/publish suitable assets from the supplied HQ library; it does not establish a project-specific personal role, author or credit |

Translations from French are literal and marked "(translated from French)". Line-break hyphens and obvious typos in the PDFs are normalised and marked.

**Image derivatives (Field, 2026-10-13).** `images/cut/**` are transparent cutouts of the drawing masters made by `tools/cutout.mjs` (D29, D30, D46). Dark-compatible drawings use reviewed graded alpha; the derivative adds no content and never changes a master. `images/books/thesis-book-closed.png` and `thesis-book-open.png` are the thesis mockups printed in `pdf2025:p46` and `pdf2025:p47`, extracted with their own soft masks (`pdfimages -png` + `alphamerge`), unchanged apart from the merge.

**HQ source library (2026-10-13).** `Images HQ/` is a user-provided, untracked and immutable 193-file source library. `docs/flagship/hq-asset-audit.json` inventories it without publishing it; `tools/hq-media.json` records only approved production derivatives. At this stage that production manifest is deliberately empty. A future derivative needs its source hash, exact crop (if any), treatment, theme treatment, credit, authorization, caption evidence and review status. The owner's access permission is recorded as `owner-direct:2026-10-13`; it is not evidence of a project-specific role, authorship or credit.

## Conflicts and how they were resolved

| ID | Conflict | Resolution |
|---|---|---|
| C01 | The Hay Mohammadi page showed a "section" and a "structure" drawing that are Nouvelle Medina Station drawings (2025 pp.36-37) | Moved to the new Nouvelle Medina page; Hay Mohammadi shows only its own renders (2025 pp.43-44) |
| C02 | Surfaces disagree between the site and the 2025 PDF: Hay Mohammadi 6 500 vs 600 m², Zenata 4 200 vs 7 200 m², Tamansourt 12 000 vs 45 000 m², Sentry 38 vs 10 m², Villa Papillon 480 vs 500 m², Cinephile 3 200 vs 4 000 m², Corallum 1 800 vs 900 m² | Owner confirmed Hay Mohammadi 600 m² (2026-10-12); the 2025 PDF figures are adopted for Zenata, Tamansourt, Villa Papillon, Cinephile and Corallum (D26); Sentry stays withheld (its own plan dimensions contradict 10 m²) |
| C03 | Al-Arg honours year: 2026 PDF "Highest Honours unanimous, ENAU 2026" vs the owner's answer (thesis June 2024, diploma February 2026) | Owner's answer; the year is left out of the translated 2026 bullet |
| C04 | Al-Arg material: site "vernacular stone architecture" vs 2026 PDF "raw earth architecture" | 2026 PDF |
| C05 | Spelling of the village: Al-Arg (both PDFs) vs ARG, Al Erg, El Erg (site) | Al-Arg in running text; kept inside proper names (Société de Préservation du Village d'ARG) and the thesis subtitle |
| C06 | Sakura distinction: "Most Appreciated Research" (owner's answer, site) vs "Best Research Award" (2026 PDF) | Owner confirmed: Most Appreciated Research (2026-10-12) |
| C07 | La Villette: site "a five-storey residential building ... through to PC submission" vs 2026 PDF "three distinct buildings ... PRO / DCE" | Site paragraphs dropped; the 2026 role and phase are used |
| C08 | Foubert caption "DCE 2026" vs 2026 PDF phase "PRO" | Phase reference removed from the caption |
| C09 | Corallum location "Tarabka" (2025 PDF) | Corrected to Tabarka, the coral town on the northern Tunisian coast |
| C10 | Supervisors: site "Prof. Monsef Al-Fourati, Prof. Adnan Ben Nejma" and "Prof. Moncef Fourati"; the 2025 PDF lists "Mr. Moncef Fourati" as a reference only | Owner confirmed: Moncef Fourati and Adnen Ben Nejma (2026-10-12) |
| C11 | "award-winning thesis" (site) where the only thesis distinction is the jury grade | Reworded to "the thesis (Highest Honours)" |
| C12 | Zenata "2nd Place, competition": site only; the 2025 PDF shows the competition sheet without a ranking | Owner confirmed the 2nd place (2026-10-12) |
| C13 | 2020-2021: site "Société de Préservation du Village d'ARG"; 2025 PDF lists BATN, Tozeur (Bureau d'Architecture et de Topographie Numérique) for the same summers, and SKI, Sousse (2022), which the site omits | Site kept, flagged |
| C14 | Bolivar year: site 2025-2026 vs 2026 PDF 2026 | 2026 PDF |
| C15 | Studio BELEM title: site "Architectural Intern, ongoing"; 2026 PDF "Licensed Architect" (personal title) | Owner: no longer at Studio BELEM; entry now 2025-2026 (2026-10-12) |
| C16 | Nouvelle Medina and Aïn Sebaâ: no office named in the 2025 PDF | Owner confirmed: Yassir Khalil Studio (2026-10-12) |
| C17 | The 2026 cover photograph (earthen alley) has no caption or place | Published without a place name |
| C18 | Where the owner is based: films page "between Paris, Casablanca, and Tunis" vs About "Paris, Casablanca, and Tokyo" (both site text); the 2026 PDF says "Tunis / Paris" | Both kept verbatim on their pages; flagged |
| C19 | The former identity says “Architect specialising in heritage documentation and earthen architecture”; the owner's 2026-10-13 instruction asks for documented work across Tunisia, France and Morocco and research in Japan | The new person line uses `owner:2026-10-13`. Heritage, earthen architecture, survey, rehabilitation, BIM/Revit, visualisation and infrastructure remain individual supported evidence; Japan is described as research, not a practice base (D45) |

## [CONTENT NEEDED]

1. Sentry surface (C02).
2. The 2020-2021 CV entry: Société de Préservation or BATN, and whether SKI (2022) belongs on the CV (C13).
3. Higher-resolution originals of the renders when available.
4. Captions or transcripts for films with speech.
5. Analytics consent for EU visitors (GA4 is idle-loaded and off under Do Not Track / Global Privacy Control; not legal advice).
6. Where you are based (C18).
7. Links and material for your website and app, when ready.
8. A short project text for La Villette, in your words: its case study now reads in four chapters (D74), but the conflicting site paragraphs were dropped (C07), so the chapters run on the captions alone. Nothing is published in their place.
Resolved on 2026-10-16 under the owner's rule of that day (D72): renders and photographs carry no author line (every render is the owner's), which closes the credit questions, including the cover photograph's author (C17; the photograph is not published, D37); Al-Arg Structure 03 takes the owner's pdf2026:p26 caption; Tamansourt is near Marrakech (geography); the remaining project questions (roles, scales, room details, Corallum's site and structure, Hotel W, Poutres Al and others listed in D72) are closed as not needed, with nothing published in their place.

Resolved by the owner on 2026-10-12: surfaces, Sakura wording, Zenata ranking, supervisors, Studio BELEM dates, Nouvelle Medina and Aïn Sebaâ office, publication permission for office drawings (the owner produced them). Resolved by the owner on 2026-10-13: the broad identity wording and authority to derive/publish a suitable supplied HQ asset, subject to the project-specific evidence rules above.
