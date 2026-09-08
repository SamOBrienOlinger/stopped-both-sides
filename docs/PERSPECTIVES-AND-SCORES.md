# Shared perspectives and learning scores

Both sites now offer **Play both sides**, covering all 14 original situations and all 59 stages, with two authored role views per stage. The existing six public-rights situations and eight Garda situations remain available.

## Interaction contract

- Begin any shared situation as either a member of the public or a Garda.
- The current stage, shared facts and earlier route stay fixed when switching roles. Each role has its own choices and explanation.
- An answer is held separately for each role. Continuing follows the active role's selected branch; the other answer remains a comparison, not a second action committed to the story.
- Switch buttons appear before and after the shared stage, within feedback and on the recap. Every original-mode stage also offers a transfer into its exact matched counterpart, preserving the route and selected answer.
- The persistent header button switches sites. It carries the active encounter and saved learning record, selecting the destination site's default role.
- Shared scenes explicitly identify separate variations, private thoughts and separate debriefs. Information supplied to a learner must not be mistaken for information available to an actor. The supervisory situation uses a community-reviewer role for a member of the public.

## Scoring rubric

The requested model draws on [AllyIndex's quiz](https://github.com/Declan444/24-7-hackathon-team9/blob/main/quiz.html), its [scoring implementation](https://github.com/Declan444/24-7-hackathon-team9/blob/main/assets/js/app.js) and [test specification](https://github.com/Declan444/24-7-hackathon-team9/blob/main/QUIZ-TESTING.md): running points, immediate feedback, a final result, replay and a best result retained in browser storage. The implementation here is original and adapts those behaviours to branching situations and two roles. No AllyIndex code, content, assets or branding are copied.

A stage awards **1 point** where the choice supports an appropriate resolution according to its explanation and sources; **0 points** where the reasoning needs review. More than one choice may earn a point. No points are deducted for time, switching perspective or requesting help. The existing reviewed-choice annotations seed this rubric; the counterpart annotations follow the same approach.

Appropriateness includes identifying actual legal requirements, using relevant evidence, obtaining or facilitating advice and support, reconsidering unsupported assumptions, treating people fairly and recording accurately. It is not defined by the presence or absence of a search, arrest, complaint or search find. A public character is not scored as responsible for another person's misconduct. The score is an authored learning rubric, not a validated bias measure, operational assessment, legal judgment or efficacy result.

Two distinct results are shown:

1. **Current route:** points out of the decisions answered by that role. A completed role score requires an answer in that role at every stage on the finished route. Latest and best completed results are retained per situation and role; percentages allow comparison between routes of different lengths.
2. **Saved learning progress:** the best point earned at each unique stage per role, up to 59 points per role. Repeating a mastered stage never adds another point. Reconsidering a 0-point answer can improve that stage's best result to 1.

Revisiting a stage discards the subsequent active route and starts that stage's answers again. Previously learned points remain in the progress record. Replaying a lower-scoring route updates the latest completed result while retaining the best result. Simply viewing another perspective does not award points or mark its route complete.

## Persistence and transfer

`localStorage` keys: `garda-encounter-progress-v1:public` and `garda-encounter-progress-v1:garda`. The record contains fictional encounter identifiers, numeric role and choice indexes, scores and a resume point. It contains no names supplied by players, incident text or operational records.

Each site has its own browser-storage keys, scoped by site role. This keeps its record separate even when both games share the GitHub Pages origin. Header site-switch links carry the record in a versioned URL fragment, merge best results with the destination record and preserve the current stage. A received transfer is removed from the active URL after import. Current shared play retains its own compact state in the fragment for refresh and navigation. URL fragments are not sent as the HTTP request path, but copying a game link can share the learning record it includes. Separate browsers and devices do not sync automatically.

Malformed links, unsupported versions and invalid indexes are rejected. Scores in an active route are recalculated from validated choices. The record is local and user-editable; it is unsuitable for certification or appraisal. If browser storage is blocked, play continues in memory and the interface explains the limitation. Clearing progress asks for an in-page confirmation and clears this site's current browser record. Other-site stores and copied links can retain their own copies.

## Content and maintenance

Both entrypoints import the same `encounters/` directory in this repository:

| File | Responsibility |
| --- | --- |
| `original-public.mjs`, `original-garda.mjs` | Direct imports of the original situations and source registers |
| `counterparts.mjs` | Matched shared scenes and the newly authored opposite-role choices |
| `catalog.mjs` | Stable encounter IDs, source references, role views and explicit point values |
| `engine.mjs` | Role-aware state, routing, revisiting, transfer validation and original-mode import |
| `progress.mjs` | Scores, best results, persistence, validation and merge rules |
| `ui.mjs`, `styles.css` | Selection, shared play, feedback, comparison recap, progress page and responsive controls |

Edit public content in `data.mjs`, or Garda content in `garda/data.mjs` and `garda/sources.mjs`. Edit the corresponding shared scene in `encounters/counterparts.mjs` and its Irish translation alongside it. Both modes read the original data directly; there is no snapshot generator or companion checkout to synchronise. Run `npm run check` and `npm test`, then push the checked revision to `main` for GitHub Pages branch publication.

Old links carry a version identifier; a breaking format or scoring change requires an explicit migration or new version handling.

## Verification and review

Automated checks traverse 11,150 mixed-role choice routes across the shared graphs, inspect every role pairing at all 59 stages and verify original-mode transfers at every stage and recap. Focused checks cover double selection, score separation, best-score persistence, lower later results, partial-role completion, blocked storage, malformed data, cross-site link transfer, source visits, replay and clearing. The previous 594 public-mode and 630 Garda-mode paths remain covered.

Application-route checks use a minimal DOM adapter, not a real browser. Device, screen-reader, legal, Garda operational and community reviews remain outstanding. The academic and legal limitations already documented for the prototypes continue to apply. Further review should test whether the scoring encourages good reasoning without reducing nuanced rights and duties to a simplistic compliance reward.
