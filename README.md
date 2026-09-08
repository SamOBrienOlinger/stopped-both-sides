# Stopped: Both Sides

An interactive learning game for the public and Gardaí.

One repository for two connected, situation-based learning games about encounters with An Garda Síochána in the **Republic of Ireland**.

| Experience | Entry point | Focus |
| --- | --- | --- |
| **Public perspective** | `index.html` | A member of the public’s rights and responsibilities |
| **Garda perspective** | `garda/index.html` | Garda decision-making, bias, evidence and fair treatment |

Both experiences share one scenario engine, scoring system, translation catalogue, accessibility implementation and GitHub Pages deployment. See the [Garda learning guide](docs/GARDA-LEARNING.md), [research approach](research/README.md), [bibliography](research/bibliography.md) and [deployment setup](docs/GITHUB-PAGES.md).

Choose a fictional situation, explore a response, read the legal learning point and follow the story to a recap. Inspired by the learning approach in [Beaver v Otter](https://samobrienolinger.github.io/beaver-v-otter/) and [A New Life in Ireland](https://samobrienolinger.github.io/My-New-Life-in-Ireland/).

**HTML · CSS · JavaScript modules · No application dependencies**

> Educational prototype, not legal advice. Sources checked on 7 September 2026. No practising-solicitor sign-off or organisational endorsement is claimed. Northern Ireland has different laws.

## Reading, language and accessibility

Both sites include a clearer start page, direct progress navigation and Language & reading controls. Choose English or Gaeilge for all 14 shared situations and 59 stages, including both roles' choices, explanations and recaps. The current stage and scores survive a language change. Source publications and reference pages remain in English, with language labels.

Choose larger text, high contrast, more reading space or reduced motion. Keyboard focus, selected-answer labels, status announcements and control targets have been improved. The implementation targets WCAG 2.2 AA; independent accessibility testing and Irish-language/legal review remain outstanding. See [Accessibility and language](docs/ACCESSIBILITY-AND-LANGUAGE.md) for coverage, implementation, checks and review limits.

## Play both sides and track progress

Both companion sites include a clear site-switch button and a shared mode covering **14 situations and 59 stages**. Start as a member of the public or a Garda, switch perspective at any stage and keep the same scene, earlier choices and separate answers. Original-mode stages transfer directly to their matched counterpart.

- Separate running scores, feedback, completed results and best scores for each role.
- One point for an appropriate response on the stated facts; zero where reasoning needs review.
- Saved progress up to 59 unique learning points per role, with no duplicate points for repeating a stage.
- Browser-local saving and a resume point; site-switch links carry and merge progress between the companions.
- A comparison recap showing what you chose from each side.

See [Perspectives, scoring, persistence and maintenance](docs/PERSPECTIVES-AND-SCORES.md) for the rubric, AllyIndex attribution, privacy behaviour and tests. Scores reflect learning in the exercise and do not measure personal bias or professional competence.

## Play

[Play as a member of the public](https://samobrienolinger.github.io/stopped-both-sides/) · [Play as a Garda](https://samobrienolinger.github.io/stopped-both-sides/garda/)

The [GitHub repository](https://github.com/SamOBrienOlinger/stopped-both-sides) holds both experiences. GitHub Pages is configured to publish from **main → /(root)**, serving the public experience at the project root and the Garda experience at `/garda/`. See [deployment setup](docs/GITHUB-PAGES.md) for the settings and how to confirm a publication.

Serve the repository root with any static web server, then open its address in a modern browser. There is no sign-up, account, timer or external AI service. All gameplay runs in the browser.

| Situation | What it explores |
| --- | --- |
| Stopped on the street | Voluntary enquiries, identifying legal requirements and name-and-address demands |
| Asked to open your bag | Reasonable-cause suspicion, a specific drug-search power, consent and objections |
| Told you are under arrest | Reasons for arrest, a solicitor, silence and the applicable detention power |
| Understanding the station | Interpretation, legal assistance, medical needs and notifying another person |
| You are sixteen | Child safeguards, adult presence, legal advice and understanding statements |
| “Why was I singled out?” | Concerns about racism, recording facts, iReport and Fiosrú |

The original public-rights mode contains 26 decision nodes across six scenarios. Some choices lead to different follow-up scenes. Every choice gives feedback and a sourced learning point. The recap flags topics to revisit rather than awarding a score for avoiding arrest or mistreatment.

## Local development

Requirements: Python 3 for the server; Node.js 20 or later for the checks. No `npm install` or compilation is required.

```bash
cd stopped-both-sides
python3 -m http.server 8000 --bind 127.0.0.1 --directory .
```

Open [the public experience](http://localhost:8000/) or [the Garda experience](http://localhost:8000/garda/). Use HTTP instead of double-clicking `index.html`, because the game imports JavaScript modules.

```bash
npm run check
npm test
```

## Project guide

| File | Purpose |
| --- | --- |
| `index.html` | Accessible page shell, metadata and no-JavaScript fallback |
| `styles.css` | INAR-inspired theme and responsive layouts |
| `app.mjs` | Rendering, navigation, choices, feedback and learning recaps |
| `data.mjs` | Characters, scenario graphs, feedback and source register |
| `engine.mjs` | Original public game state, branching, backtracking and recaps |
| `garda/` | Garda page, original scenarios, evidence library and presentation |
| `encounters/` | One shared scenario engine, counterpart views, scoring and progress |
| `accessibility/`, `locales/` | Shared reading controls, perspective palettes and translations |
| `site.mjs` | Resolves both entrypoint addresses within the current deployment |
| `research/` | Garda research approach, bibliography and scenario evidence map |
| `assets/` | Locally hosted fonts and third-party licence notices |
| `tests/game.test.mjs` | Complete route traversal, navigation-state and static-asset checks |
| `docs/CONTENT-REVIEW.md` | Source provenance, legal-content decisions and opportunities for review |
| `.nojekyll` | Tells branch publishing to serve the authored static files directly |
| `.github/workflows/checks.yml` | Check both games on pushes and pull requests |

## Adding or reviewing content

Keep public-mode legal claims in `data.mjs` and Garda-mode content in `garda/data.mjs` and `garda/sources.mjs`, with clear source references. The shared game imports these originals directly; no cross-repository synchronisation is needed. Each decision needs a setting, question, choices, feedback, learning point, suggested words and source IDs. Every next-step ID must exist in the same scenario or equal `end`. Run the checks after editing a route.

Do not imply that identity determines guilt, that cooperation guarantees safety, or that a correct choice prevents discrimination. Distinguish a legal duty from practical advice. Introduce new legal settings as separate, reviewed scenarios; do not generalise the street-enquiry example to traffic, immigration or border checks.

## Sources

The user-supplied Google links were resolved to their original destinations:

- [Citizens Information — Questioning and surveillance](https://www.citizensinformation.ie/en/justice/arrests/questioning-and-surveillance/).
- [INAR — policing resources](https://inar.ie/?s=Police).
- [INAR / ICCL — Policing and Racial Discrimination in Ireland: A Community and Rights Perspective (PDF)](https://inar.ie/wp-content/uploads/2024/04/1.-POLICING-AND-RACIAL-DISCRIMINATION-1.pdf).
- [Irish Council for Civil Liberties](https://www.iccl.ie/), including its [2014 Criminal Justice and Garda Powers guide](https://www.iccl.ie/resources/know-your-rights-criminal-justice-and-garda-powers-2nd-edition-june-2014/).

These are supplemented by the [DPP’s letters of rights](https://www.dppireland.ie/criminal-justice-system/letters-of-rights/), current revised legislation, the [Legal Aid Board](https://www.legalaidboard.ie/about-the-legal-aid-board/criminal-legal-aid/the-garda-station-legal-advice-revised-scheme/) and [Fiosrú](https://www.fiosru.ie/about-us/faqs/). All resource links are available in the game. Older publications are clearly labelled and are not treated as current authority for every procedure.

## Accessibility and privacy

The interface uses semantic controls, keyboard focus handling, visible focus outlines, labelled progress, responsive single-column layouts, locally hosted fonts and reduced-motion support. It does not include analytics, tracking scripts or forms for personal incidents. Fictional choices, scores and a resume point are now saved in this browser. Shared play can resume after refresh. Site-switch links carry the learning record in a URL fragment; copying that link can share its included progress. Separate browsers do not automatically sync. Hosting services may retain ordinary access logs.

Automated checks cover all 594 original public-mode and 630 Garda-mode answer sequences, plus the shared-mode paths and score/transfer checks described above, including branch changes, replay and completion. These checks do not constitute browser, real-device, screen-reader or legal validation. Those reviews remain separate tasks.

## Hosting

The application files are authored at the repository root, with the Garda experience in `garda/` and shared code and assets alongside them. They can be served at a domain root or a subdirectory because asset imports are relative and views use hash navigation. No installation, compilation or generated build directory is required.

In **Settings → Pages**, use **Deploy from a branch**, branch **main**, folder **/(root)**. GitHub publishes updates when changes reach `main`; `.nojekyll` skips Jekyll processing. The checks workflow runs independently and does not block branch publication, so run `npm run check` and `npm test` before pushing. See [GitHub Pages setup and migration](docs/GITHUB-PAGES.md).

## Credits and rights

Created by Sam O’Brien-Olinger / [Sam Tim Solutions](https://samobrienolinger.github.io/SamOBrienOlinger/).

### Design and acknowledgements

The visual language draws on [INAR’s website](https://inar.ie/): teal accents, white surfaces, rounded cards and Open Sans. This is not an INAR website and does not use its logo.

The choice-and-explanation approach builds on [Beaver v Otter](https://samobrienolinger.github.io/beaver-v-otter/) and [A New Life in Ireland](https://samobrienolinger.github.io/My-New-Life-in-Ireland/). Original source publications retain their own rights.

No endorsement by INAR, ICCL or An Garda Síochána is claimed.

Open Sans is distributed under the SIL Open Font License; see `assets/OFL-Open-Sans.txt`. Interface icons include adapted Feather paths; see `assets/LICENSE-Feather.txt`. Source publications retain their own rights and are linked, not reproduced wholesale.

Copyright © 2026 Sam O’Brien-Olinger. No licence to reuse original project code or content is granted by this README. Third-party assets retain their respective licence terms.
