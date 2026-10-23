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
| `owner:2026-10-22` | The owner's plan-18 brief: the contact address is radhouani.hazem@enau.ucar.tn (replaces the former address everywhere: header and menu chip, footer, about page, JSON-LD, CV; the contact form is removed, D107) |
| `owner:2026-10-23` | The owner's amendment A to plan 18: the Sakura Science Program's own site, `https://sagaunissp2025.my.canva.site/`, linked as "Programme site" from the About column and the Research page (D123; its contents are not described on the site); the sitemap is `sitemap-site.xml` (the owner's rename on GitHub, D122) |

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
9. Index filters (D125): the total surface of Avenir (R+7 and R+5), to place it in a scale band; Sentry's surface (item 1) does the same for Sentry. Until then both stand in no scale band.
10. Index filters (D125): a programme type for Sentry (guard pavilion), if you want it under a Type filter; today it matches Practice, Place and Year only.
Resolved on 2026-10-16 under the owner's rule of that day (D72): renders and photographs carry no author line (every render is the owner's), which closes the credit questions, including the cover photograph's author (C17; the photograph is not published, D37); Al-Arg Structure 03 takes the owner's pdf2026:p26 caption; Tamansourt is near Marrakech (geography); the remaining project questions (roles, scales, room details, Corallum's site and structure, Hotel W, Poutres Al and others listed in D72) are closed as not needed, with nothing published in their place.

Resolved by the owner on 2026-10-12: surfaces, Sakura wording, Zenata ranking, supervisors, Studio BELEM dates, Nouvelle Medina and Aïn Sebaâ office, publication permission for office drawings (the owner produced them). Resolved by the owner on 2026-10-13: the broad identity wording and authority to derive/publish a suitable supplied HQ asset, subject to the project-specific evidence rules above.

## Published facts by page (generated)

### Al-Arg (projects/project-al-arg.html)

| Field | Value | Source |
|---|---|---|
| Quote | Look before building. | pdf2026:p23 |
| Role 1 | A village in the Tunisian Jérid region / raw earth architecture never previously documented. Multiple on-site… | pdf2026:p23 |
| Role 2 | Complete reconstruction of the spatial logic / siting, natural ventilation, hierarchy of spaces. It led to a … | pdf2026:p23 (translated from French; year omitted, see ledger C03) |
| Role 3 | International distinction: Most Appreciated Research / Sakura Science Program, Tokyo 2025. The only Tunisian … | pdf2026:p23 (translated from French; award name per answer F02) |
| Project type | Heritage Conservation / Rehabilitation | pdf2026:p23 |
| Year | 2023-2024 / Published | pdf2026:p23 |
| Location | Al-Arg, Hammat Djérid, Tozeur Governorate, Tunisia | pdf2026:p23 |
| School | ENAU, University of Carthage | pdf2026:p28 |
| Surface | Village: 1.4 ha | site |
| Text 1 | Degree thesis awarded Highest Honours with a unanimous jury at ENAU, Université de Carthage, 2024. The projec… | site (spelling Al-Arg per pdf2026; material per pdf2026:p23, ledger C04) |
| Text 2 | The thesis operates at three scales simultaneously: a territorial analysis of the conditions that produced th… | site |
| Text 3 | The project was founded on field surveys and heritage documentation carried out with the Société de Préservat… | site |
| Honour | Highest Honours / Unanimous jury / ENAU, University of Carthage / June 2024 | site + answer:F01 |
| Hero image | images/al-arg/al-arg-aerial-sunset-hq.jpg | pdf2026:p27 + hq:EL erg/Render.jpg (full frame of the earlier band crop) |
| Fig. 1 | Territory: Site map / Al-Arg within the Jérid. Reading of the oasis territory as a system … | hq:EL erg/Map.jpg (legend re-set from the sheet: 'Shrine', 'Residential area', 'Underground archaeological area', 'Saline area', 'Unplanted area', 'Palm trees less than 10 y.o', 'Palm trees less than 40', 'Palm trees older than 40 y.o'; swatches are the mean of each printed swatch; the destination callouts and the north sign 'الشمال' stay on the map); pdf2026:p24 (caption) |
| Fig. 2 | Site plan, rehabilitation proposal: The rehabilitated building, in colour, among the walls of the surrounding house… | hq:EL erg/Plan 02.jpg (no printed title; the coloured proposal of 'Site plan / rehabilitation proposal', pdf2026:p25, framed closer) |
| Fig. 3 | Ground floor plan, existing state: The building today: its remaining walls, scattered rubble and palm trees inside… | hq:EL erg/Site.jpg (printed title 'Site Plan Today', kept on the plan's own ground; 'NORTH'; scale 0-25); pdf2026:p25 ('Ground floor plan / existing state') |
| Fig. 4 | Ground floor plan, proposed: Courtyards and planted patios between the earth walls; the cuts of sections A a… | hq:EL erg/Plan 01.jpg (no printed title; north sign 'الشمال', 'North'; section marks A, B); pdf2026:p25 ('Ground floor plan / proposed') |
| Fig. 5 | Sections A-A and B-B: The two cuts marked on the proposed plan, at one scale. | hq:EL erg/Section AA.jpg, Section bb.jpg (printed titles 'SECTION A-A', 'SECTION B-B', removed and restated, D49; graphic scales kept; set at one scale by their scale bars); pdf2026:p25 (A-A) |
| Fig. 6 | Past, present, future: Three layers on one axis: the building over an aerial photograph, the walls sta… | hq:EL erg/Time.jpg (callouts 'PAST', 'PRESENT', 'FUTURE' re-set as labels, D49); pdf2026:p25 |
| Fig. 7 | Functional spaces: Rooms by function. The sheet's key also lists residential and administrative sp… | hq:EL erg/Functions.jpg (printed title 'Functional Spaces'; printed key 'Residential', 'Staff Housing', 'Meditation', 'Administrative', 'Service' with three swatches, each set 17-20 px left of its own label (brown, yellow-green, red), while 'Residential' and 'Administrative' stand at the left margin with no swatch; the three pairs are re-set in HTML with the printed swatch colours and the key is cropped out, D71); pdf2026:p26 |
| Fig. 8 | Open ceilings and ventilation voids: Open ceilings and ventilation voids serve as a unique source of natural light a… | hq:EL erg/OPen.jpg (printed title 'Open Ceilings and Ventilation Voids' and the caption sentence); pdf2026:p26 |
| Fig. 9 | Panoramic views: The accessible ceilings offer panoramic views of the surrounding landscape, whi… | hq:EL erg/Panoramic.jpg (printed title 'Panoramic Views' and the caption sentence, a missing space after the comma restored); pdf2026:p26 |
| Fig. 10 | Multifunctional exterior courtyards: The exterior courtyards provide a versatile space for various activities, inclu… | hq:EL erg/Ext Court.jpg (printed title 'Multifunctional Exterior Courtyards' and the caption sentence) |
| Fig. 11 | Structures: Left, Structure 01. Timber frame / palm wood joists and posts, accessible roof.… | hq:EL erg/Structures.jpg (printed titles 'Structure 01', 'Structure 03'; one sheet, one scale); pdf2026:p26 (both captions: the owner's portfolio prints 'Structure 03. Ventilation void / natural thermal chimney integrated into the earth masonry.' beside this same drawing, D72) |
| Fig. 12 | Shaded courtyard: A slatted timber frame over the courtyard; the shadow of a palm on the earth wa… | hq:EL erg/Render 01.jpg (no printed title) |
| Fig. 13 | Clay wall material: Texture maps made by Hazem Radhouani, in order: base colour, normal, roughness,… | hq:EL erg/Clay Wall By hazem/Clay.jpg, Normal Map Clay01.jpg, Roughness Clay.jpg, Spec Clay.jpg, ORD.jpg (folder name 'By hazem'; map types from the file names, 'ORD' not expanded); downscaled from 6201 to 1200 px |
| Fig. 14 | Stone wall material: Texture maps made by Hazem Radhouani, in order: base colour, normal, roughness,… | hq:EL erg/Stone_Wall By hazem/Stone wall.jpg, Normal Map.jpg, Roughness.jpg, Specular Map.jpg, ORD.jpg (folder name 'By hazem'; map types from the file names, 'ORD' not expanded); downscaled from 6201 to 1200 px |
| Fig. 15 | Atmosphere: Entry approach through palm threshold and ochre perimeter wall at evening light… | pdf2026:p23 (images), site (caption) + hq:EL erg/Render 03.jpg, Render 02.jpg (the first two at full frame; the earlier crops had their alt texts swapped); the courtyard render has no HQ source |

### Bolivar (projects/project-bolivar.html)

| Field | Value | Source |
|---|---|---|
| Role 1 | 3D modeling and graphic production from a single model structured by phases (demolition, retention, new const… | pdf2026:p17 |
| Role 2 | Mixed programme, hotel + student residence / heavy rehabilitation of a dense urban block, Paris 19th. Project… | pdf2026:p17 (translated from French) |
| Role 3 | Scope of work including selective demolitions, rooftop extensions, green roofs, and complete restructuring of… | pdf2026:p17 |
| Project type | Rehabilitation / Student Residence | pdf2026:p17 |
| Phase | Planning Permission | pdf2026:p17 |
| Year | 2026 / Professional | pdf2026:p17 |
| Location | 32-34 Av. Simon Bolivar, Paris 19th | pdf2026:p17 |
| Office | Studio BELEM | pdf2026:p17 |
| Surface | 2 800 m² | site |
| Text 1 | A mixed-use programme combining a boutique hotel and a student residence on a complex urban site adjacent to … | site |
| Text 2 | The facade system is designed to read as a coherent architectural gesture while modulating its openings and m… | site (first sentence withheld, D59) |
| Hero image | images/bolivar/bolivar-courtyard-render-hq.jpg | pdf2026:p17 + hq:BOLIVAR/NB_StudioBelem_SimonBolivar_E-02_AvSimonBolivar-Reprise2V-Sun1_20240522-mod.jpg |
| Fig. 1 | Before and after: The block from the air before the project, with a low building, a ramp and park… | hq:BOLIVAR/PC6 - Insertion du projet dans l'environnement-A_page-0004.jpg (printed title 'Photographie de l'état Existant') + page-0005.jpg (printed title 'Insertion du projet dans l'environnement'; translated, D17); pdf2026:p22 |
| Fig. 2 | Plans, levels N01 and N04: 1:200, coloured by programme. At N01, seminar and work rooms (Hotel W), hotel s… | hq:BOLIVAR/ANX1-PC - PLANS PROJET_pages-to-jpg-0005.jpg and -0008.jpg (printed titles 'Plan de niveau N01', 'Plan de niveau N04', scale '1 : 200', legend; room labels 'Salle de seminaire', 'Salle de travail temporaire/réunion', 'Stockage BOH', 'Chambre', 'Unité étudiante'; translated, D17) |
| Fig. 3 | Roof plan: 1:200. Five non-accessible planted roofs of 32 to 130 m² on 25 to 85 cm of subs… | hq:BOLIVAR/PC5-UN PLAN DES FACADES ET DES TOITURES PROJET-A_page-0002.jpg (printed title 'Plan de Toiture', scale '1 : 200', key 1-12, labels 'Surface végétalisée non accessible : 90m² pour 55cm de substrat' with 32, 103, 97 and 130 m² for 55, 85, 25 and 55 cm, 'Pleine terre', 'Terrasse accessible'; translated, D17); pdf2026:p20 |
| Fig. 4 | Longitudinal section AA: 1:200, from avenue Simon Bolivar through the west building, levels N00 to N08, … | hq:BOLIVAR/PC3 - 1 - COUPES DU TERRAIN AVEC IMPLANTATION DU PROJET-A_page-0002.jpg (printed title 'Coupe Longitudinale AA', scale '1/200', legend 'PROJET', 'EXISTANT CONCERVE' [sic], label 'AVENUE SIMON BOLIVAR', levels 'N00 Haut' to 'N08 Bat O', 'TT Bat E', 'SS1', 'SS2', dimension 50.48; translated, D17, D49); pdf2026:p21 |
| Fig. 5 | West elevation, avenue Simon Bolivar: 1:150; 20.31 m between the property lines. Along the street, left to right: hot… | hq:BOLIVAR/PC5-UN PLAN DES FACADES ET DES TOITURES PROJET-A_page-0003.jpg (printed title 'Façade OUEST 1 (Avenue Simon Bolivar)', scale '1/150', key 1-14, labels '4. Entrée Hôtel', '3. Entrée Hôtel', '1. Sortie Hôtel', '2. Entrée Résidence Etudiante'; translated, D17); pdf2026:p19 |
| Fig. 6 | Volumetric strategy: Schematic axonometrics, in order: the volumes to be demolished, the volumes ret… | hq:BOLIVAR/PC4 - Notice decrivant le terrain et présentant le projet-B_page-0011.jpg (printed captions 'FIGURE 10. AXONOMÉTRIE SCHÉMATIQUE DES VOLUMES À DEMOLIR', 'FIGURE 11. ... DES VOLUMES CONSERVÉS', 'FIGURE 12. ... DES VOLUMES SURÉLEVÉS ET DÉCAISSÉS'; translated, D17); pdf2026:p18 |
| Fig. 7 | Vegetation section: Stratification by climatic zone. | pdf2026:p20 (no HQ source) |
| Fig. 8 | Street view:  | pdf2026:p18 + hq:BOLIVAR/NB_StudioBelem_SimonBolivar_E-01_AvSimonBolivar-Reprise2_S2_20240522.jpg |

### Belhomme (projects/project-belhomme.html)

| Field | Value | Source |
|---|---|---|
| Quote | A project does not belong to its brief / it belongs to its site. Sometimes, you have to wait until the site i… | pdf2026:p9 |
| Role 1 | Production of all graphic documents from two separate digital models / existing and proposed / linked within … | pdf2026:p9 |
| Role 2 | Originating from the Titi Barbès competition won by Studio BELEM in 2021 / residential and commercial rehabil… | pdf2026:p9 |
| Project type | Rehabilitation / Residential and Commercial | pdf2026:p9 |
| Phase | Planning Permission | pdf2026:p9 |
| Year | 2025-2026 / Professional | pdf2026:p9 |
| Location | 1-3 rue Belhomme, Paris 18th | pdf2026:p9 |
| Office | Studio BELEM | pdf2026:p9 |
| Surface | 260 m² | site |
| Text 1 | A corner residential building in Paris, its particular condition at the intersection of two streets creating … | site |
| Text 2 | The rehabilitation addresses the envelope, the common areas, and the redistribution of the upper-floor apartm… | site |
| Hero image | images/belhomme/belhomme-corner-render-hq.jpg | pdf2026:p9 + hq:BELHOMME/ANX1_merge [31-60]_page-0004.jpg (permit sheet PC6, rue Belhomme / bd Rochechouart) |
| Fig. 1 | Existing facades survey: Facades. Complete existing elevation / reading of architectural mouldings, gutt… | pdf2026:p10 |
| Fig. 2 | Demolition plans: S1 - N05. Strict coding: retained existing (black), demolition (red hatched), f… | pdf2026:p10 |
| Fig. 3 | Plans: Plan N00 / Ground floor level. Plan N02 / Standard apartment layout. | pdf2026:p12 |
| Fig. 4 | Proposed roof plan: Permit sheet PC5, 1/150. On the garden side, a planted terrace carries a semici… | hq:BELHOMME/ANX1_merge [1-30]_page-0029.jpg (printed title 'PC5 PLAN DE TOITURE PROJET', scale 1/150, legend '1 Toiture en zinc gris foncé'; translated, D17) |
| Fig. 5 | Cross-section C-C': Permit sheet PC3, 1/150. From the basement (bicycle store, refuse store, water … | hq:BELHOMME/ANX1_merge [1-30]_page-0026.jpg (printed title 'PC3 COUPE TRANSVERSALE CC'', scale 1/150; room labels Locaux vélos, Local OM, LT EAU, Commerce 2, Séjour+Cuisine; translated, D17) |
| Fig. 6 | Regulatory sections: PLU Section / Rue Belhomme. Verification of the regulatory building envelope, f… | pdf2026:p11 |
| Fig. 7 | Rue Belhomme elevation: Permit sheet PC5, 1/150. | hq:BELHOMME/ANX1_merge [1-30]_page-0030.jpg (printed title 'PC5 FACADE RUE BELHOMME', scale 1/150, numbered material legend; translated, D17); replaces the pdf2026:p11 crop of the same drawing |
| Fig. 8 | Boulevard Rochechouart elevation: Permit sheet PC5, 1/150. The 7.67 m front between the plot boundaries. | hq:BELHOMME/ANX1_merge [31-60]_page-0001.jpg (printed title 'PC5 FACADE BD ROCHECHOUART', scale 1/150, dimension 7.67, 'Limite parcellaire'; translated, D17) |
| Fig. 9 | Rear elevation: Permit sheet PC5, 1/150. The courtyard front between the neighbouring buildings. | hq:BELHOMME/ANX1_merge [31-60]_page-0002.jpg (printed title 'PC5 FACADE ARRIERE', scale 1/150, 'Heberge voisine'; translated, D17) |
| Fig. 10 | Zoom section: Permit sheet PC10, 1:50, drawn for the agreement of the public-domain manager, … | hq:BELHOMME/ANX1_merge [31-60]_page-0017.jpg (drawing title '1 ZOOM - Coupe 1 : 50' on sheet 'PC10 ACCORD DU GESTIONNAIRE'; sheet notes and legend 'Limite de propriété'; translated, D17) |
| Fig. 11 | Rear courtyard:  | pdf2026:p12 + hq:BELHOMME/ANX1_merge [31-60]_page-0005.jpg (printed title 'PC6 INSERTION DU PROJET DANS L'ENVIRONNEMENT - PROJETE -COURS ARRIERE'; translated, D17) |

### Foubert (projects/project-foubert.html)

| Field | Value | Source |
|---|---|---|
| Quote | Building new in Paris is also a responsibility toward the existing urban fabric. | pdf2026:p13 |
| Role 1 | Facade design and definition of architectural detailing / aged red eco-brick, claustra screen, brick bonding,… | pdf2026:p13 |
| Role 2 | New residential construction in dense urban fabric / PLU constraints, height envelope and setback regulations… | pdf2026:p13 (typo "Mayn" corrected) |
| Role 3 | Demonstrated mastery: structural engineer coordination, complete layer-by-layer documentation. | pdf2026:p13 |
| Project type | Residential / New Construction | pdf2026:p13 |
| Phase | PRO | pdf2026:p13 |
| Year | 2026 / Professional | pdf2026:p13 |
| Location | 1bis-3 passage Foubert, Paris 13th | pdf2026:p13 |
| Office | Studio BELEM | pdf2026:p13 |
| Surface | 420 m² | site |
| Text 1 | A new residential building on an infill plot in central Paris, designed within the constraints of the PLU loc… | site |
| Text 2 | The structural system is concrete with masonry infill, detailed in Revit for direct handover to the engineer.… | site (first sentence withheld, D60) |
| Hero image | images/foubert/foubert-brick-render-hq.jpg | pdf2026:p13 + hq:FOUBERT/20240105_BLM_FOU_Perspective rue.jpg |
| Fig. 1 | Site plan: PRO sheet 00-02, January 2026. The planted roof terrace at R+4 over the street … | hq:FOUBERT/20260129_BLM_FOU_PRO_Plan de niveaux_merge [21-25]_page-0004.jpg (printed title 'Plan de masse'; labels 'Toiture terrasse végétalisée à R+4', 'Attique accessible à R+3', 'Toiture accessible à R+1', 'Toiture accessible à R+2', 'Passage Foubert'; translated, D17) |
| Fig. 2 | Level plans: PRO sheets 10-02, 10-04 and 10-06, 1:50, January 2026: ground floor, second flo… | hq:FOUBERT/20260129_BLM_FOU_PRO_Plan de niveaux_merge [1-20] [1-15]_page-0002.jpg, page-0004.jpg, page-0006.jpg (printed titles 'Plan de niveau RDC', 'Plan de niveau R+2', 'Plan de niveau R+4', scale 1 : 50; room labels 'Atelier sur Rue', 'Hall commun', 'Jardin', 'Séjour-Cuisine', 'Terrasse'; translated, D17) |
| Fig. 3 | Longitudinal section B-B: PRO sheet 30-02, 1/50. Along the street block, from the basement cellars, refus… | hq:FOUBERT/20260129_BLM_FOU_PRO_Plan de niveaux_merge [1-20] [1-15]_page-0009.jpg (printed title 'Coupe longitudinale BB', scale 1/50; room labels 'Cave 07', 'Local OM', 'Local eau', 'Atelier sur Rue', 'Circulation commune'; levels 49.80 S1 to 68.10 TT; translated, D17) |
| Fig. 4 | Cross-section C-C: PRO sheet 30-03, 1/50. Across the plot, from the rear wing and its planted roof… | hq:FOUBERT/20260129_BLM_FOU_PRO_Plan de niveaux_merge [1-20] [1-15]_page-0010.jpg (printed title 'Coupe transversale CC', scale 1/50; room labels 'Local vélos', 'Souplex', 'Séjour-Cuisine'; translated, D17) |
| Fig. 5 | West facade: PRO sheet 20-01, January 2026. The street front on passage Foubert, 23.23 m bet… | pdf2026:p14 + site + hq:FOUBERT/20260129_BLM_FOU_PRO_Plan de niveaux_merge [1-20] [16-20]_page-0003.jpg (printed title 'Façade Ouest'; numbered legend 1-9; translated, D17) |
| Fig. 6 | East facade: PRO sheet 20-03. The garden front, 23.20 m between the property lines: timber w… | pdf2026:p15 + site + hq:FOUBERT/20260129_BLM_FOU_PRO_Plan de niveaux_merge [1-20] [16-20]_page-0005.jpg (printed title 'Façade Est'; 'Sortie Terrasse'; translated, D17) |
| Fig. 7 | Street window: PRO sheet 50-ETA-09, January 2026: wall section and exterior elevation of a win… | pdf2026:p14 + hq:FOUBERT/20260129_BLM_FOU_PRO_Plan de niveaux_merge [21-25]_page-0005.jpg (sheet title 'Fenêtre sur rue'; callouts kept on the drawing, translated, D17) |
| Fig. 8 | Attic terrace detail: PRO sheet 50-19, 1:10. Callouts on the left: guardrail fixing; metal coping; co… | pdf2026:p14 + hq:FOUBERT/20260129_BLM_FOU_PRO_Plan de niveaux_merge [1-20] [1-15]_page-0014.jpg (sheet title 'Détail terrasse attique', Ech. 1:10; callouts kept on the drawing, translated, D17) |
| Fig. 9 | Green roof terrace: PRO sheets 50-21 and 50-20, 1:10, left to right. On 50-21: L-shaped concrete ke… | pdf2026:p15 + hq:FOUBERT/20260129_BLM_FOU_PRO_Plan de niveaux_merge [1-20] [16-20]_page-0001.jpg and [1-20] [1-15]_page-0015.jpg (sheet title 'Détail terrasse végétalisée', Ech. 1:10; callouts kept on the drawing, translated, D17) |
| Fig. 10 | Rear view: From above the rear: the courtyard terrace and the planted roof. | pdf2026:p16 + hq:FOUBERT/20240610_BLM_FOU_Perspective arrière.jpg |

### La Villette (projects/project-la-villette.html)

| Field | Value | Source |
|---|---|---|
| Quote | Here, drawings don’t communicate / they contractualize. | pdf2026:p3 |
| Role 1 | Development of the DCE detail booklet: interior and exterior joinery, systematic indexing of secondary works … | pdf2026:p3 |
| Role 2 | Residential and commercial rehabilitation of a block of three distinct buildings / Paris 19th, ABF-listed bui… | pdf2026:p3 (translated from French) |
| Project type | Residential and Commercial / Rehabilitation | pdf2026:p3 |
| Phase | PRO / DCE | pdf2026:p3 |
| Year | 2025-2026 / Professional | pdf2026:p3 |
| Location | 190 av. Jean Jaurès, Paris 19th | pdf2026:p3 |
| Office | Studio BELEM | pdf2026:p3 |
| Surface | 940 m² | site |
| Hero image | images/la-villette/la-villette-street-render-hq.jpg | pdf2026:p3 + hq:La villette/NB_StudioBeleem_JJaures_LaVillette_CAM-03_AvenueJeanJaures_Rep-3_PC_20260224.jpg |
| Fig. 1 | Garden path: The framed concrete façade along the planted path. | hq:La villette/NB_StudioBeleem_JJaures_LaVillette_CAM-01_Rep-Julliet _20240716.jpg (no printed title) |
| Fig. 2 | Aerial view: Reading of the three buildings A, B and C. | pdf2026:p8 + hq:La villette/NB_StudioBeleem_JJaures_LaVillette_CAM-02_AvenueJeanJaures_Rep-Julliet_20240720_modifié.jpg |
| Fig. 3 | Site plan: Buildings A, B, and C. | pdf2026:p7 (no HQ source) |
| Fig. 4 | Level 2, building C: room types: Key plan of the room types on level 2; level 3, on the same sheet, repeats the … | hq:La villette/1050-6001-B_LAV_BLM_CHB_CAR_REP_DCE_merge_page-0006.jpg (printed titles 'Plan de repérage des Chambres Types, Niveau 2 -3 _ Bâtiments C' and 'Plan de repérage_ Niveau 2'; legend 'Chambre Standard', 'Chambre Bunkie', 'Chambre Flex', 'Chambre PMR' (no room in this colour on level 2, not re-set); translated, D17) |
| Fig. 5 | South elevation, building C: 1:100, PRO phase. The framed concrete façade from level N0 to N7, taller on the… | hq:La villette/1050-4701-G_LAV_BLM_MET_CAR_REP_A_DCE_merge_page-0008.jpg (printed title 'Elevation Sud_Bâtiment C'; cartouche 'Façades', 'Bâtiment C', '1/100', phase 'PRO'; levels 'N0-C' to 'N7-C', bays '2.75'; translated, D17) |
| Fig. 6 | Façade module, constructive axonometric: From the façade prototype booklet: one module of building C's façade, cut open … | hq:La villette/1050-6001-B_LAV_BLM_CHB_CAR_REP_DCE_merge_page-0010.jpg (printed titles 'Carnet Prototype de façade', 'Module de façade'; callouts 'Béton', 'Goutte d'eau', 'Isolation', 'Protection solaire', 'Vitrage', 'Cadre bois', 'Allège fin. Béton matricé', 'Poteau fin. Béton sablé', 'Joint creux', 'Bandeau de façade fin. Béton sablé'; translated, D17, D49); pdf2026:p5 |
| Fig. 7 | Façade module details: 1:20. Elevation, vertical section and plan of one module: a 185 cm opening betw… | hq:La villette/1050-6001-B_LAV_BLM_CHB_CAR_REP_DCE_merge_page-0011.jpg (printed titles 'Carnet Prototype de façade', 'Détails', scale '1/20'; callouts 'Bandeau de façade', 'Protection solaire', 'Menuiserierie [sic] extérieure', 'Béton matricé', 'Goutte d'eau'; dimensions 75, 185, 87, 181; translated, D17, D49); pdf2026:p5 |
| Fig. 8 | Access gate, north elevation: 1:20. Elevation (left) and section (right) of the gate: an entrance door of one… | hq:La villette/1050-4701-G_LAV_BLM_MET_CAR_REP_A_DCE_merge_page-0002.jpg (printed title 'Portail, trappe d'accès colonnes sèches– elevation nord', scale '1/20'; view titles 'ELEVATION', 'COUPE'; callouts 'Ferme porte', 'Cadre métallique thermolaqué RAL 7016', 'Tasseau bois laqué 70x35mm', 'Structure portail RAL 7016', 'Tirant metallic', 'Charniere à ressort double action / Paumelle / Gond', 'Poignée', 'Lames métalliques thermolaqués RAL 9016', 'Arret de porte asservie avec déverrouillage manuel', 'Pivot de sol asservis à arrêt électromagnétique déverrouillable'; intrinsic 'Porte d'entrée 1UP', 'Portail d'accès 5UP'; translated, D17, D49); pdf2026:p4 |
| Fig. 9 | Window guardrail, section A2: 1:15. Section A2 through a window bay, beside an axonometric of the bays on the… | hq:La villette/1050-4701-G_LAV_BLM_MET_CAR_REP_A_DCE_merge_page-0004.jpg (printed title 'Garde corps de fenêtre - elevation nord', scale '1/15'; legend 'A1 h = 68.00 cm', 'A2 h = 82.50 cm'; callouts 'Finition', 'Chappe', 'Isolation', 'IPE', 'Flocage', 'Plénum', '2 BA13', 'Blackout', 'Fenêtre oscillo battant', 'Garde corps', 'Tablette en bois'; translated, D17, D49); pdf2026:p6 |
| Fig. 10 | Courtyard:  | pdf2026:p5 (no HQ source) |

### Rue de l'Avenir (projects/project-avenir.html)

| Field | Value | Source |
|---|---|---|
| Project type | Residential and commercial / New construction | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [21-40]_page-0011.jpg ('Construction d'un bâtiment de logemebt', sic) + [1-20]_page-0009.jpg ('Local commercial 95,76 m²') |
| Phase | Building permit (PC) | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [1-20]_page-0001.jpg ('PERMIS DE CONSTRUIRE', 'Phase PC') |
| Year | 2025 / Professional | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [1-20]_page-0001.jpg ('DATE DE L'INDICE 19/12/2025') |
| Location | 2 rue de l'Avenir, Villeneuve-la-Garenne | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [1-20]_page-0001.jpg ('2 rue de l'avenir, 92000, Villeneuve-la-Garenne'; postcode left out) |
| Office | Studio BELEM | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [1-20]_page-0001.jpg ('Architecte : Studio Belem') |
| Blocks | R+7 and R+5 | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [1-20]_page-0003.jpg ('R+7', 'R+5') |
| Car park | 36 spaces, basement | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [1-20]_page-0008.jpg ('Plan SS1', spaces numbered 01 to 36) |
| Text 1 | The flood-risk prevention plan (PPRI) requires the whole building to be raised to 29.5 NGF, about 1.6 m above… | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [121-140]_page-0001.jpg (architectural notice PC 4, page 8: 'La contrainte réglementaire liée au PPRI impose une surélévation générale du bâtiment jusqu'à la cote 29,5 NGF […] Un commerce, implanté au niveau du sol naturel, occupe la partie Sud du plot A, à l'angle de l'avenue de Verdun et de la rue de l'Avenir.'; translated, D17) |
| Text 2 | The materials notice names bio-sourced materials (timber windows, French windows and curtain walls; timber de… | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [141-160] [11-20]_page-0005.jpg (materials notice PC 10-1, page 5, '3/ PROVENANCES DES MATÉRIAUX': 'Matériaux biosourcés', 'Matériaux géosourcés', 'Matériaux issus du réemploi : Brique pleine.'; translated, D17) |
| Hero image | images/avenir/avenir-avenue-de-verdun-render.jpg | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [141-160] [11-20]_page-0005.jpg (printed caption 'FIGURE 2. VUE DU BÂTIMENT DEPUIS L'AVENUE DE VERDUN.'; translated, D17) |
| Fig. 1 | Site plan: Fire-safety site plan, PC40 sheet, 1/500, December 2025. The corner block (R+7)… | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [1-20]_page-0003.jpg (printed title 'PC40 - Dossier destiné à la vérification de la conformité aux règles de sécurité incendie', 'Plan masse securité', scale 1/500; legend 'Distance borne - établissement', 'Borne incendie', 'Sortie de secours', 'Accès à l'établissement'; labels 'Accès Logement', 'Accès Parking', 'Accès Commerce', '60,41 m'; translated, D17) |
| Fig. 2 | Raised ground floor: Plan N0H, 1/200, December 2025. On avenue de Verdun (left), the shop (95.76 m²)… | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [1-20]_page-0009.jpg (printed title 'ANX0 - PLAN PROJET', 'Plan N0H', scale 1/200; labels 'Local commercial 95,76 m²', 'Sortie de secours commerce', 'Accès piéton aux logements', 'Accès Logement A', 'Accès Logement B', '20 Vélos', '60 Vélos', 'Accès parking', 'Accès vélo', 'A01', 'B01'-'B04'; translated, D17) |
| Fig. 3 | Basement, first floor and top floor: Plans SS1, N01 and N07, 1/200, December 2025, top to bottom. The car park under… | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [1-20]_page-0008.jpg, page-0010.jpg, page-0016.jpg (printed titles 'Plan SS1', 'PLAN N01', 'Plan N07', 'ANX0 - PLAN PROJET', scale 1/200; labels 'Sortie piéton principal', 'Issue de secours piéton secondaire', 'Rampe d'accès automobile', spaces '01'-'36', 'A71', 'A72'; translated, D17) |
| Fig. 4 | Longitudinal section A-A: PC3 sheet, 1/200, December 2025. From avenue de Verdun (left): the corner block… | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [101-120]_page-0009.jpg (printed title 'PC3 - PLANS DE COUPE DU TERRAIN AVEC IMPLANTATION DU PROJET', 'Coupe longitudinale AA', scale 1/200; labels 'Avenue de Verdun', 'Local commercial', 'SS1 +25,95 NGF', 'NTa +52,95 NGF'; translated, D17) |
| Fig. 5 | Cross-section E-E: PC3 sheet, 1/200, December 2025. Through the corner block, rue de l'Avenir on t… | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [101-120]_page-0013.jpg (printed title 'PC3 - PLANS DE COUPE DU TERRAIN AVEC IMPLANTATION DU PROJET', 'Coupe transversale EE', scale 1/200; labels 'NIV SOL NATUREL +27.98 NGF', 'N0Haut +29,50 NGF', 'SS1 +25,95 NGF', 'N VOISIN +29.82 NGF'; translated, D17) |
| Fig. 6 | West elevation, rue de l'Avenir: PC5 sheet, 1/200, December 2025. The rue de l'Avenir front, 67.52 m between the… | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [121-140]_page-0014.jpg (printed title 'PC5 - PLANS DE FACADES ET TOITURES', 'Élévation ouest', scale 1/200; dimension '67,52'; labels 'Accès vélo', 'Accès parking', 'Sortie de secours piétons', 'Accès piéton aux logements'; legend 'M1 Menuiseries en bois', 'M2 Béton bas carbone teinté dans la masse, teinte beige claire', 'M3 Briques de verre', 'M4 Brique pleine', 'M5 Serrurerie en métal thermolaqué, brune " mocha "', 'M6 Jardinière', 'M7 Plaquette de parement beige clair'; translated, D17) |
| Fig. 7 | South elevation, avenue de Verdun: PC5 sheet, 1/200, December 2025. The corner block's front on avenue de Verdun, … | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [121-140]_page-0015.jpg (printed title 'PC5 - PLANS DE FACADES ET TOITURES', 'Élévation sud', scale 1/200; dimension '19,22'; labels 'Sortie de secours commerce', 'Accès commerce', 'NIV SOL NATUREL +27,98 NGF'; translated, D17) |
| Fig. 8 | Planters on avenue de Verdun:  | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [121-140]_page-0001.jpg (printed caption 'FIGURE 6. VUE DES JARDINIÈRES DEPUIS L'AVENUE DE VERDUN.'; translated, D17) |
| Fig. 9 | The shop on avenue de Verdun:  | hq:Villneuve la garenne/PC40-2_DOCUMENTS DESCRIPTIFS SECURITE INCENDIE ERP_merge [121-140]_page-0001.jpg (printed caption 'FIGURE 7. VUE DU COMMERCE DEPUIS L'AVENUE DE VERDUN.'; translated, D17) |

### Zenata Station (projects/project-zenata.html)

| Field | Value | Source |
|---|---|---|
| Location | Casablanca, Zenata eco-city | site + pdf2025:p8 |
| Year | 2025 | site |
| Office | Yassir Khalil Studio | site |
| Type | Regional Rail Station | site |
| Surface | 7 200 m² | pdf2025:p8 (PDF figures adopted after the owner confirmed the PDF value for Hay Mohammadi, D26) |
| Text 1 | A regional rail station for the Casablanca metropolitan network, designed as part of a feasibility study for … | site |
| Text 2 | The architectural proposal addresses the civic dimension of infrastructure at the city scale: the station is … | site |
| Honour | Competition: 2nd Place / Casablanca Metropolitan Rail | site + answer:F01 |
| Hero image | images/zenata/zenata-platform-render.jpg | pdf2025:p7 + hq:Zenata/Scene 51.png |
| Fig. 1 | Aerial view: The station spans the tracks between two car parks. | hq:Zenata/Scene 13.png |
| Fig. 2 | Accesses: A pedestrian entrance on each side of the tracks, car parks on both sides and t… | hq:Zenata/2025 - Hazem radhouani - Portfolio - HQ [6-10]_page-0004.jpg (legend 'Accès Piétons', 'Espaces Parking', 'Avitaillement', 'Accès Véhicules'; translated, D17, D49); pdf2025:p8 |
| Fig. 3 | Plans: Levels +00.00, +04.20 and +07.75, left to right. At +00.00 the platforms run be… | hq:Zenata/2025 - Hazem radhouani - Portfolio - HQ [6-10]_page-0005.jpg (printed titles 'LEVEL +00.00', 'LEVEL +04.20', 'LEVEL +07.75'; room labels 'Quais', 'HALL 01 1026.69 m²', 'Espace d'embarquement 398.50m²'; translated, D17); pdf2025:p9 |
| Fig. 4 | Long elevation: The mast rises to +27.00 and the roof to +16.00; the concourse floor is at +7.3… | hq:Zenata/2025 - Hazem radhouani - Portfolio - HQ [6-10]_page-0004.jpg (levels +27.00, +16.00, +7.30, +0.15); pdf2025:p8 |
| Fig. 5 | End elevation: The end façade carries the station name in French and Arabic; its roof edge is … | hq:Zenata/2025 - Hazem radhouani - Portfolio - HQ [6-10]_page-0004.jpg (signage 'GARE DE ZENATA', 'محطة زناتة'; level 16.18); pdf2025:p8 |
| Fig. 6 | Programme, level +00.00: Service rooms of the two buildings beside the tracks. | hq:Zenata/2025 - Hazem radhouani - Portfolio - HQ [11-15]_page-0001.jpg (legend; translated, D17); level from the matching room names on plan 'LEVEL +00.00' (pdf2025:p9); pdf2025:p10 |
| Fig. 7 | Programme, level +04.20: The mezzanines: prayer rooms, changing rooms, cleaning and logistics. | hq:Zenata/2025 - Hazem radhouani - Portfolio - HQ [11-15]_page-0001.jpg (legend; translated, D17); level from the matching room names on plan 'LEVEL +04.20' (pdf2025:p9); pdf2025:p10 |
| Fig. 8 | Programme, level +07.75: The level over the tracks: ticket hall, sales, shops, boarding and group recept… | hq:Zenata/2025 - Hazem radhouani - Portfolio - HQ [11-15]_page-0001.jpg (legend; translated, D17); level from the matching room names on plan 'LEVEL +07.75' (pdf2025:p9); pdf2025:p10 |
| Fig. 9 | Profile diagrams: Five diagrams of the station's profile; in four of them one element is drawn in… | hq:Zenata/2025 - Hazem radhouani - Portfolio - HQ [6-10]_page-0004.jpg (no printed title or text); pdf2025:p8 |
| Fig. 10 | Exterior:  | pdf2025:p10 |
| Fig. 11 | Interiors: Ticket gates and shops; the waiting hall. | pdf2025:p10 + hq:Zenata/Scene 64.png |
| Fig. 12 | At dusk: The side of the station with the mast and stairs; the cantilevered roof seen fr… | hq:Zenata/2025 - Hazem radhouani - Portfolio - HQ [11-15]_page-0001.jpg (left column, middle render); pdf2025:p10 |
| Fig. 13 | The lit station: Dusk, with the station's name in French and Arabic on the façade. | hq:Zenata/يصي.png (signage 'GARE DE ZENATA', 'محطة زناتة') |
| Fig. 14 | At night: The glazed entrance with its escalators; the stairs under the cantilevered roof. | hq:Zenata/Scene 35.png; hq:Zenata/2025 - Hazem radhouani - Portfolio - HQ [11-15]_page-0001.jpg (left column, bottom render); pdf2025:p10 |

### Nouvelle Medina Station (projects/project-nouvelle-medina.html)

| Field | Value | Source |
|---|---|---|
| Location | Casablanca, Nouvelle Medina district | pdf2025:p36 |
| Year | March 2025 | pdf2025:p36 |
| Office | Yassir Khalil Studio | answer:2026-10-12 |
| Type | Urban Train Station / Heritage-informed connector | pdf2025:p36 |
| Area | 500 m² | pdf2025:p36 |
| Text 1 | The architectural concept rests on a contemporary interpretation of origami, where the roof becomes a structu… | pdf2025:p36 (translated from French) |
| Text 2 | This play of facets allows a subtle modulation of natural light through the interior spaces, while optimising… | pdf2025:p36 (translated from French) |
| Text 3 | Accessibility is reinforced by underground passages leading directly to the platforms, thereby avoiding confl… | hq:Nouvelle Medina/A0 MEDINA F [1]_page-0001.jpg (board 1/2, 'Orientations d'aménagement proposées du Concept Global', second paragraph; translated from French, D17) |
| Hero image | images/nouvelle-medina/nouvelle-medina-night-section-hq.jpg | pdf2025:p35 + hq:Nouvelle Medina/Scene 39_2.png |
| Fig. 1 | Site plan: 1:1000. The station roof, marked +8.50, beside the railway cutting at −6.50, wi… | hq:Nouvelle Medina/A0 MEDINA F [1]_page-0001.jpg (rendered site plan; printed title 'Plan de masse 1-1000', 'Parking', levels +8.50 and -6.50; translated) |
| Fig. 2 | Aerial view: From above the car park; the railway cutting runs behind the station. | hq:Nouvelle Medina/A0 MEDINA F [1]_page-0001.jpg (aerial render) |
| Fig. 3 | Plans: 1:200 on the sheet. The platform level at −6.50, the ground floor at +0.15 and … | hq:Nouvelle Medina/A0 MEDINA F [2]_page-0001.jpg (printed titles 'Plan Niveau Quais -06.50m', 'Plan Niveau RDC+ 0.15m', 'Plan Niveau Toiture +08.50m', 'Echelle 1/200'; translated, D17); pdf2025:p37 |
| Fig. 4 | Main and rear façades: 1:200 on the sheet. The canopy rises to +9.50; at the rear, two flights of stai… | hq:Nouvelle Medina/A0 MEDINA F [2]_page-0001.jpg (printed titles 'Façade Principale', 'Façade Arrière', levels +09.50 +07.00 +06.00 +00.15 -06.50; translated, D17); pdf2025:p37-38 |
| Fig. 5 | Sections AA′ and BB′: 1:200 on the sheet. AA′ cuts through the hall at +0.15 under the roof at +8.00;… | hq:Nouvelle Medina/A0 MEDINA F [2]_page-0001.jpg (printed titles 'Coupe AA′', 'Coupe BB′', levels +09.50 +08.00 +03.00 +00.15 -00.60); pdf2025:p38 |
| Fig. 6 | Section-elevations: 1:200 on the sheet. The station in elevation with the railway cutting in sectio… | hq:Nouvelle Medina/A0 MEDINA F [2]_page-0001.jpg (printed titles 'Façade Coupe' ×2, translated as 'section-elevation'; levels +09.50 +07.00 +03.00 +00.15 -00.60 -06.50) |
| Fig. 7 | Folding concept: From a flat sheet to the roof: folding, refining the lines and adjusting the an… | hq:Nouvelle Medina/A0 MEDINA F [1]_page-0001.jpg (printed captions 'Feuille plane / Point de départ', 'Pliage', 'Affinage des lignes', 'Ajustement des angles', translated, D17, D49; 'Toiture du projet' is printed over the roof's fold line, so it stays on the drawing and is translated in the caption) |
| Fig. 8 | Structure: Exploded axonometric: the roof envelope and the façade envelope in white HPL, t… | hq:Nouvelle Medina/A0 MEDINA F [1]_page-0001.jpg (printed callouts 'Enveloppe du Batiment (Toiture) en HPL Blanc', 'Charpente métallique de la toiture', 'Système Poutres Al / Poteaux HEA ancrés dans des massifs en Béton', 'Enveloppe du Batiment (Façade) en HPL Blanc', 'Façade vitrée'; translated, D17, D49; 'Al' not expanded); pdf2025:p36 |
| Fig. 9 | Passenger flows: Routes into the hall, over the footbridge to the platforms and back out, and th… | hq:Nouvelle Medina/A0 MEDINA F [1]_page-0001.jpg (printed legend 'FLUX PIETONS : INTERMODALITÉ - GARE', 'FLUX DES VOYAGEURS - GARE', 'FLUX DES VOYAGEURS - ACCES AUX QUAIS', 'FLUX DES VOYAGEURS - SORTIE DES QUAIS/ GARE', 'CONNEXION VERTICALE GARE/QUAIS'; translated, D17, D49; the light-blue swatch touches a road line and stays on the drawing); pdf2025:p38 |
| Fig. 10 | Corner perspective: White-model view of the glazed front and the canted glass corner under the cano… | hq:Nouvelle Medina/A0 MEDINA F [1]_page-0001.jpg (white-model perspective, no printed title) |
| Fig. 11 | Street front: The canopy carries the station's name in Arabic and French, 'Gare Nouvelle Médi… | pdf2025:p38 + hq:Nouvelle Medina/A0 MEDINA F [1]_page-0001.jpg (signage 'GARE NOUVELLE MÉDINA' on the render) |
| Fig. 12 | Along the platforms: The station stands at the edge of the railway cutting; a stair and a lift tower… | pdf2025:p38 + hq:Nouvelle Medina/A0 MEDINA F [1]_page-0001.jpg; hq:Nouvelle Medina/Scene 11_6.png |
| Fig. 13 | Sections through the cutting: Stairs and a lift lead from the hall down to the platforms. | hq:Nouvelle Medina/Scene 6_5.png; hq:Nouvelle Medina/A0 MEDINA F [1]_page-0001.jpg |
| Fig. 14 | Hall: Ticket gates and ticket machines in the hall, and the stair down to the platfor… | hq:Nouvelle Medina/A0 MEDINA F [1]_page-0001.jpg; hq:Nouvelle Medina/A0 MEDINA F [2]_page-0001.jpg |

### Aïn Sebaâ Station (projects/project-ain-sebaa.html)

| Field | Value | Source |
|---|---|---|
| Location | Casablanca, Aïn Sebaâ industrial zone | pdf2025:p40 |
| Year | February 2025 | pdf2025:p40 |
| Office | Yassir Khalil Studio | answer:2026-10-12 |
| Type | Train Station / Industrial-community gateway | pdf2025:p40 |
| Area | 900 m² | pdf2025:p40 |
| Text 1 | The project provides for the demolition of the existing station and the construction of a new two-headed rail… | pdf2025:p40 (translated from French; the sentence that follows is cut off in the PDF) |
| Text 2 | An urban footbridge will be integrated to ensure a fluid and safe connection between the two sides of the rai… | pdf2025:p42 (translated from French) |
| Text 3 | The architecture of the project rests on a roof with clean lines, designed to provide optimal protection whil… | pdf2025:p42 (translated from French) |
| Hero image | images/ain-sebaa/ain-sebaa-render-screen-hq.jpg | pdf2025:p39 + hq:Ain Sbaa/Scene 72_1.png |
| Fig. 1 | Site plan: 1:1000. The two station buildings on either side of the tracks, linked by the f… | hq:Ain Sbaa/plan masse.jpg (printed title 'PLAN MASSE 1-1000'); footbridge: pdf2025:p42 |
| Fig. 2 | Panorama:  | pdf2025:p41 |
| Fig. 3 | Ground floor, main building: Level +0.00: the controlled hall (162 m²) and the open hall (345 m²) between se… | hq:Ain Sbaa/PLAN RDC.jpg (room labels: Hall Contrôlé 162 m², Hall non contrôlé 345 m²; translated); pdf2025:p41 |
| Fig. 4 | Section A-A: Through the main building and the platforms, from level −4.10 to +7.50. | hq:Ain Sbaa/COUPE AA.jpg (printed title 'COUPE AA', levels); pdf2025:p42 |
| Fig. 5 | Main and rear façades: Section-elevations from +0.00 to +8.85; at the rear, stairs lead down to the lo… | hq:Ain Sbaa/Coupe and facade.jpg (printed titles 'COUPE FACADE PRINCIPALE', 'COUPE FACADE ARRIERE', levels; translated); pdf2025:p41 |
| Fig. 6 | Structural concept: Exploded axonometric: the envelope, the steel roof structure and the inclined c… | hq:Ain Sbaa/Structure.jpg (printed title 'PARTI STRUCTUREL' and labels 'Enveloppe', 'Charpente Metallique', 'Poteaux Inclinés'; translated, D17, D49); pdf2025:p40 |
| Fig. 7 | Flow study: Passenger routes through the main building and the secondary building. | hq:Ain Sbaa/Flux.jpg (printed title 'ETUDE DES FLUX' and legend; translated, D17); pdf2025:p40, p42 |
| Fig. 8 | Across the tracks: The station from the opposite platform. | hq:Ain Sbaa/Scene 69.png |

### Hay Mohammadi Station (projects/project-hay-mohammadi.html)

| Field | Value | Source |
|---|---|---|
| Location | Casablanca, Hay Mohammadi | site + pdf2025:p43 |
| Year | 2025 | site |
| Office | Yassir Khalil Studio | site |
| Type | RER Station | site |
| Surface | 600 m² | answer:2026-10-12 + hq:Station Hay Mohammadi/2025 - Hazem radhouani - Portfolio - HQ [46-50]_page-0001.jpg ('AREA: 600 m²') |
| Text 1 | A rapid transit station in the Hay Mohammadi district of Casablanca, one of the city's oldest and most densel… | site |
| Text 2 | The project resolves a challenging site condition where the rail line runs at grade through a constrained urb… | site |
| Hero image | images/hay-mohammadi/hay-mohammadi-front.jpg | site + pdf2025:p44 + hq:Station Hay Mohammadi/2025 - Hazem radhouani - Portfolio - HQ [46-50]_page-0002.jpg (upper render; signage 'STATION HAY MOHAMMADI' and 'محطة حي المحمدي', intrinsic) |
| Fig. 1 | Aerial view: The station's white roof beside the tracks, between the platform shelters and t… | site + pdf2025:p43 + hq:Station Hay Mohammadi/2025 - Hazem radhouani - Portfolio - HQ [46-50]_page-0001.jpg (cropped above the text panel printed on the render) |
| Fig. 2 | From the platform: The station seen across the tracks from the opposite platform. | pdf2025:p44 + hq:Station Hay Mohammadi/2025 - Hazem radhouani - Portfolio - HQ [46-50]_page-0002.jpg (lower render) |

### Sentry (projects/project-sentry.html)

| Field | Value | Source |
|---|---|---|
| Location | Casablanca Finance City | site + pdf2025:p25 |
| Year | 2024 | site |
| Office | Yassir Khalil Studio | site |
| Type | Guard Pavilion | site |
| Text 1 | A guard pavilion at Casablanca Finance City, the major financial district developed on the edge of Casablanca… | site |
| Text 2 | The pavilion is positioned at the boundary between the public road and the controlled domain, its geometry de… | site |
| Hero image | images/sentry/sentry-roof-aerial.jpg | site + pdf2025:p26 + hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0001.jpg (cropped above the page tab printed over it, D58) |
| Fig. 1 | Aerial view: The pavilion between raised planted beds, beside the road. | hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0004.jpg (left column, middle, no printed title); pdf2025:p29 |
| Fig. 2 | Roof and floor plans: Roof plan (left), dimensioned 731 by 609 with a sloping edge of 818, and floor … | hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0004.jpg (no printed titles; dimensions, 'PL' and section marks stay on the drawings); pdf2025:p29 |
| Fig. 3 | Elevations: Left: the glazed bay with its sliding window beside the perforated cladding, 31… | hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0002.jpg (no printed titles; dimensions and section marks stay on the drawings); pdf2025:p27 |
| Fig. 4 | Section A-A: Cut along line A: the room with the desk and chair, a partition, and a second r… | hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0002.jpg (no printed title; the cut through line A of the plans, section mark 'A' stays); pdf2025:p27 |
| Fig. 5 | Elevations under the sloping roof: Left: the perforated cladding under the roof. Right: the window, the wall leani… | hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0003.jpg (no printed titles; callouts kept on their leader lines, D60: 'Plaque en fer galvanisé perforée', 'Menuiserie Aluminium', 'Fenêtre coulissante'; translated, D17); pdf2025:p28 |
| Fig. 6 | Section B-B: Cut along line B: the roof, dimensioned 14 at its high end, falls from 290 to 1… | site + hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0003.jpg (no printed title; section mark 'B' and dimensions stay); pdf2025:p28 |
| Fig. 7 | 3D view: The glazed corner under the overhanging roof, between perforated panels. The ca… | hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0002.jpg (view title '1 visuel 1:1' cropped out; callouts kept on their leader lines, D60; translated, D17); pdf2025:p27 |
| Fig. 8 | At the window: A visitor at the counter; a figure seated inside the corner window, a visitor o… | hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0004.jpg (left column, top) and hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0003.jpg (left column, middle), no printed titles; pdf2025:p28-29 |
| Fig. 9 | Low view: A figure under the roof's overhang at the open end. | hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0003.jpg (left column, bottom, no printed title; cropped above the page tab printed over it, D58); pdf2025:p28 |
| Fig. 10 | Evening: The window lit in evening light, a tower behind; the pavilion against the sky a… | site + hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0003.jpg (left column, top) and hq:Guerite/2025 - Hazem radhouani - Portfolio - HQ [26-30]_page-0004.jpg (left column, bottom), no printed titles; pdf2025:p28-29 |

### Villa Papillon (projects/project-papillon.html)

| Field | Value | Source |
|---|---|---|
| Location | Marrakech, Palmeraie | pdf2025:p29 |
| Year | 2024 | site |
| Office | Yassir Khalil Studio | site |
| Type | Contemporary Villa | site |
| Surface | 500 m² | pdf2025:p29 (D26) |
| Text 1 | The architectural language draws on the spatial logic of Moroccan domestic architecture while employing a con… | site |
| Hero image | images/papillon/papillon-pool.jpg | site + hq:VILLAS/Image_28.png |
| Fig. 1 | Site plan: 1:200, north at the top. The villa near the eastern end of its plot, with the L… | hq:VILLAS/2_page-0001.jpg (printed title 'Plan Situation / Ech 1/200' and north arrow 'N', 'O', 'E', 'S', cropped out, translated from French, D17; intrinsic 'PISCINE' (pool) and dimensions stay); pdf2025:p29 ('Site Plan') |
| Fig. 2 | Plans: Level +00.00. Level +04.70. | pdf2025:p30 |
| Fig. 3 | Front façade: The inclined white frame of the upper floor over the terracotta frame of the gr… | pdf2025:p31 + hq:VILLAS/Image_19(1).png (no printed title) |
| Fig. 4 | Views: The terracotta wall and frame below the white upper volume. | pdf2025:p31 + hq:VILLAS/Image_21(1).png and Image_20(1).png (no printed titles) |

### Tamansourt Campus (projects/project-tamansourt.html)

| Field | Value | Source |
|---|---|---|
| Location | Tamansourt, near Marrakech, Morocco | site (Tamansourt); 'near Marrakech' is the town's geography, a new town in the commune of Harbil about 10 to 17 km from Marrakech (le360.ma, medias24.com); the 2025 PDF's 'Essaouira outskirts' does not fit it (D72) |
| Year | 2024 | site |
| Office | Yassir Khalil Studio | site |
| Type | Hospital and Wellness Campus | site |
| Surface | 45 000 m² | pdf2025:p33 (D26) |
| Text 1 | A hospital and wellness campus on the outskirts of Tamansourt. The programme combines a general hospital, a s… | site |
| Text 2 | The architectural proposal structures the campus around a central landscaped spine that connects arrival, adm… | site |
| Hero image | images/tamansourt/tamansourt-path.jpg | site + pdf2025:p33 + hq:Hospital/Scene 32.png |
| Fig. 1 | Site plan: 1:500. Curved wings fan out from a long curved building along one road, with pa… | hq:Hospital/A0 Plie [1]_page-0001.jpg (printed title 'Plan Masse' and scale 'ECH : 1/500', translated from French, D17; both cropped out with the page number '1') |
| Fig. 2 | Aerial view: The wings fan out across the block, with parked cars in the courts between them… | site + pdf2025:p34 + hq:Hospital/Scene 12_1.png (no printed title) |
| Fig. 3 | Frontage: Low wings with upturned roof edges, a dark glazed volume and a four-storey bloc… | pdf2025:p34 + hq:Hospital/Scene 9_1.png (no printed title) |
| Fig. 4 | Façade: Deep-set windows with splayed reveals under a thin overhanging roof, and a glaz… | pdf2025:p34 + hq:Hospital/Scene 14_1.png (no printed title) |
| Fig. 5 | Street façade: Street facade render. Main hospital block. Rammed earth-toned masonry cladding.… | site + pdf2025:p34 (no HQ source; title shortened from 'Render, Street Facade') |
| Fig. 6 | Between the wings: Stepped external stairs at the end of one wing; two bridges cross to the curved… | pdf2025:p34 + hq:Hospital/Scene 24_1.png (no printed title) |

### Corallum (projects/project-corallum.html)

| Field | Value | Source |
|---|---|---|
| Location | Tabarka, Tunisia | pdf2025:p21 ("Tarabka", typo corrected, ledger C09) |
| Year | 2023 | site |
| School | ENAU | site |
| Type | Research and Exhibition Centre | site |
| Surface | 900 m² | pdf2025:p21 (D26) |
| Text 1 | A coral research and exhibition centre on the northern Tunisian coast, designed as an academic project at ENA… | site |
| Text 2 | The project was developed through physical model-making and hand drawing alongside digital production, explor… | site |
| Hero image | images/corallum/corallum-corner.jpg | site + pdf2025:p23 + hq:Tabarka/.trashed-1762728296-Image_4.png |
| Fig. 1 | Site plan: The building, with its oval roof opening, on a planted plot between the seafron… | hq:Tabarka/.trashed-1762728296-Image_1.png (no printed title) |
| Fig. 2 | Site: Massing model of the town, the site marked in pink on the seafront. | site + hq:Tabarka/2025 - Hazem radhouani - Portfolio - HQ [21-25]_page-0005.jpg (no printed title); pdf2025:p25 |
| Fig. 3 | Aerial view: The building, in pink, among the white massing of its neighbours, the oval open… | hq:Tabarka/2025 - Hazem radhouani - Portfolio - HQ [21-25]_page-0005.jpg (lower left, no printed title); pdf2025:p25 |
| Fig. 4 | Level 01: Plan of level 01, at 15.00 m: the floor, shaded pink, with an oval at its centr… | hq:Tabarka/2025 - Hazem radhouani - Portfolio - HQ [21-25]_page-0004.jpg (printed title 'PLAN NIVEAU 01 / 15.00 m' and '1/500', footer 'Level 01 = 15.00' and 'Scale: 1 / 500', cropped out; translated, D17); pdf2025:p24 |
| Fig. 5 | Western façade and section A-A: Top: the western façade, the building beside its taller neighbours. Bottom: sec… | hq:Tabarka/2025 - Hazem radhouani - Portfolio - HQ [21-25]_page-0005.jpg (printed titles 'Western Facade', 'Section A-A' and 'COUPE A-A 1/500', cropped out; translated, D17); pdf2025:p25 |
| Fig. 6 | Formal research, volume: In the sheet's order: phase 01, verticality; phase 02, transformation; helical … | site + hq:Tabarka/2025 - Hazem radhouani - Portfolio - HQ [21-25]_page-0003.jpg (printed titles 'Phase 01 Verticality', 'Phase 02 Transformation', 'Helical Form', '2D Expansion', 'Phase 03 Guided', 'Phase 04 Pseudo-sinusoidal', 'Restrict movement', 'Change the rhythm', cropped out and re-set in the caption); pdf2025:p23 |
| Fig. 7 | Formal research, façade: 1, sliding: parallel to the east, perpendicular to the south. 2, overlapping: p… | site + hq:Tabarka/2025 - Hazem radhouani - Portfolio - HQ [21-25]_page-0004.jpg (printed text '1 Sliding Parallel to the East Perpendicular to the South', '2 Overlapping Parallel to the North Perpendicular to the East', '3 Pulling Perpendicular to the West', erased and re-set in the caption, D49); pdf2025:p24 |
| Fig. 8 | Sectional perspective: The building cut open: curving floors and dark funnel-shaped volumes, walkways … | hq:Tabarka/2025 - Hazem radhouani - Portfolio - HQ [21-25]_page-0004.jpg (lower left, no printed title; cropped above the page tab printed over it, D58); pdf2025:p24 |
| Fig. 9 | Interior: A ramp curving under the oval opening; looking up through the oval void, past t… | site + hq:Tabarka/2025 - Hazem radhouani - Portfolio - HQ [21-25]_page-0005.jpg (upper left) and hq:Tabarka/2025 - Hazem radhouani - Portfolio - HQ [21-25]_page-0004.jpg (lower middle), no printed titles; pdf2025:p24-25 |
| Fig. 10 | Corner view: Line render of the corner and its tear-shaped entrance, collaged with a pink su… | site + hq:Tabarka/2025 - Hazem radhouani - Portfolio - HQ [21-25]_page-0003.jpg (no printed title); pdf2025:p23 |
| Fig. 11 | Across the water: The building and its reflection, in daylight and in low evening light. | site + hq:Tabarka/.trashed-1762728296-Image_2.png and .trashed-1762728296-Image_6.png (no printed titles) |

### Cinephile (projects/project-cinephile.html)

| Field | Value | Source |
|---|---|---|
| Location | Tunis, Belvédère | site + pdf2025:p12 |
| Year | 2022 | site |
| School | ENAU | site |
| Type | Cinema Complex | site |
| Surface | 4 000 m² | pdf2025:p12 (D26) |
| Text 1 | A cinema complex in central Tunis, designed as an academic project at ENAU exploring the typology of the cult… | site |
| Text 2 | The programme distributes four cinema screens, a film library and archive, a cafe, and public circulation spa… | site |
| Text 3 | The project was produced at the end of the first architectural cycle at ENAU and represents the first design … | site |
| Hero image | images/cinephile/cinephile-foyer.jpg | site + pdf2025:p14 + hq:Cinema/.trashed-1762728296-Scene 2.png |
| Fig. 1 | Aerial view: The building's roofs, in pink, on a triangular block between the city grid and … | pdf2025:p11 + pdf2025:p12 (location 'overlooking Belvédère Park') + hq:Cinema/.trashed-1762728296-Image(4).png (no printed title) |
| Fig. 2 | Site study: Routes to Mohamed V Road, downtown, the Passage, Olympic City N., Mahrajen N. a… | site + hq:Cinema/Site study.png (printed title 'Site Study', erased and re-set, D49; callouts 'TO MOHAMED V ROAD', 'PALESTINE METRO STATION', 'PLACE DE L'AFRIQUE BUS STATION', 'TO DOWNTOWN', 'TO PASSAGE', 'TO OLYMPIC CITY N.', 'TO MAHRAJEN N.', 'TO R21 HIGHWAY', 'AV. TAEIB M'HIRI', 'BELVEDERE' stay on the drawing); pdf2025:p12 |
| Fig. 3 | Tree cover: Trees by species over the park and the blocks beside it. | hq:Cinema/Tree cover.png (printed title 'Tree cover'; legend 'Eucalyptus', 'Palm tree', 'Pine', 'Olive tree', 'Sempervivum', re-set); pdf2025:p12 |
| Fig. 4 | Building heights: Heights of the buildings in the three zones numbered on the map. | hq:Cinema/Buildings height.png (printed title 'Buildings Height'; legend '1 to 2 Stories', '3 to 4 Stories', '5 to 6 Stories', '7+ Stories', re-set); pdf2025:p12 |
| Fig. 5 | Sketching the ideas: Early exploration of the section, in pencil and ink; the handwritten 'Esp. cons… | site + hq:Cinema/Sketching the idea.jpg (title 'Sketching The Ideas' printed on pdf2025:p12; handwriting 'Esp. cons', for 'espace de consommation', translated, D17) |
| Fig. 6 | Level +0.00: The entrance level (+12.00 NGT): the 900 m² atrium, 17.65 m high under the slab… | hq:Cinema/Level 01.jpg (title 'LEVEL +0.00 = ±12.00 NGT' printed on pdf2025:p13; room labels 'ATIRUM Surf = 900 m² H.S.D = 17.65 m', 'Billetterie', 'Comptoir', 'Espace de consommation', 'Direction', 'Infirmerie'; translated, D17) |
| Fig. 7 | Level +5.00: Four cinema halls with raked seating, two large outer halls and two smaller inn… | site + pdf2025:p14 (printed title 'LEVEL 5.00 = ±17.00 NGT'; the site's title 'Ground Floor Plan, N01' and its caption are withheld: they contradict the printed level and the level +0.00 plan, D07) |
| Fig. 8 | Section: The upper hall with its balcony and lining over the foyers, a lower hall beneat… | site + hq:Cinema/2025 - Hazem radhouani - Portfolio - HQ [16-20]_page-0001.jpg (callouts 'DETAIL 1' to 'DETAIL 4' stay on the drawing); pdf2025:p15 |
| Fig. 9 | Sectional perspective: The building cut open lengthwise: the hall and its balcony above the foyer leve… | hq:Cinema/.trashed-1762728296-Image(7).png (no printed title) |
| Fig. 10 | Eastern façade: Diamond-pattern panels on the volumes either side of the vertical circulation t… | site + hq:Cinema/2025 - Hazem radhouani - Portfolio - HQ [16-20]_page-0001.jpg (printed title 'Eastern Facade'); pdf2025:p15 |
| Fig. 11 | Façade: Three volumes clad in diamond-pattern panels over a glazed base, reflected in w… | hq:Cinema/.trashed-1762728296-Image(6).png (no printed title) |
| Fig. 12 | Façade details: Left to right: upper façade detail, façade attachment detail, corner insulation… | hq:Cinema/2025 - Hazem radhouani - Portfolio - HQ [16-20]_page-0001.jpg (printed titles 'Upper facade Detail', 'Facade attatchment detail', 'Corner insulation detail', 'Under stairs oppnings detail', re-set with their spelling corrected); pdf2025:p15 |
| Fig. 13 | Exploded axonometric: The programme layered across all levels. | site + pdf2025:p13 + hq:Cinema/.trashed-1762728296-dz.png (no printed title) |
| Fig. 14 | Cutaway axonometric: The upper hall cut open: raked seating, the balcony and the folded lining at th… | hq:Cinema/.trashed-1762728296-Image(11).png (no printed title) |
| Fig. 15 | Foyer: The passage through the foyer, seen from an upper level. | hq:Cinema/.trashed-1762728296-Image(2).png (no printed title) |
| Fig. 16 | Auditorium: Folded timber panels line the walls and ceiling; red curtains frame the stage. | site + pdf2025:p14 + hq:Cinema/.trashed-1762728296-Image(10).png and .trashed-1762728296-Image(9).png (no printed titles) |

