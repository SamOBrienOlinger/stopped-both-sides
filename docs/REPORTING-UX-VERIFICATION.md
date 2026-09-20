# Reporting scenarios: end-to-end UX verification

## Story and fixes

A learner starts on either homepage, chooses a perspective, opens the catalogue,
selects **Reporting wrongdoing**, and plays **You saw what happened** or
**The envelope**. They compare what each role knows, decide, read feedback and
sources, and reach a learning recap without losing their characters or progress.

The review identified three gaps in the earlier verification:

- Switching roles focused the decision prompt below the new knowledge panel.
  Both **Switch perspective** and **See the other side** now focus the panel's
  heading and scroll its beginning into view. Its three sections follow in
  document reading order. The heading has visible keyboard focus but does not
  add an extra stop to normal Tab navigation. Scenarios without a knowledge
  panel still focus the prompt; completed routes still focus the recap heading.
- The witness evidence stage described separate actions but illustrated the
  characters together. It now uses separate reflection locations, retaining the
  phone evidence and selected characters in decisions, feedback and recaps.
- Earlier all-scenario tests began with generated situation links. New reporting
  tests start at the homepage and use the visible controls, with no prebuilt game
  state, recap links or seeded storage.

## Reproducible checks

`tests/browser/reporting-journeys.spec.mjs` adds 18 tests per browser engine:

| Coverage | Assertion |
| --- | --- |
| Entry and discovery | Both homepages; keyboard activation of perspective, catalogue and reporting topic; exactly the two reporting cards |
| Journey matrix | Both scenarios × both entrypoints × English/Irish × 390px/1366px (16 full journeys) |
| Perspective context | Correct knowledge in all three sections at every stage; focused heading visible near the top; translated role announcement; Tab reaches the first choice |
| Story and artwork | Shared scene unchanged by switching; Daniel distinct from Cian; separate locations after the initial scene; images decoded before screenshots |
| Choices and feedback | Review-needed answer, try again, both role answers, feedback focus, source destinations and safe new-tab attributes |
| Continuity | Characters, answers and history preserved through switching, translation, reload and returning via the resume link |
| Recap and progress | Every stage reached through controls; both answers in comparisons; five fuller-picture steps and not-a-verdict caveat; replay, browser Back, revisit and saved completion |
| Enlarged text | Two further tests: 150% Irish at 320px portrait, 568px landscape, 768px tablet and 1366px desktop; unclipped knowledge and recap |
| Runtime | No page errors or failed local asset responses |

Focused Node regressions cover both entrypoints' English/Irish focus behaviour
and every choice in the reporting follow-up illustrations, including recap use.
The pre-existing all-scenario, compatibility, character and route suites remain.

Run the reporting browser suite alone with:

```bash
npm run test:browser -- tests/browser/reporting-journeys.spec.mjs
```

Run all checks with `npm run check`, `npm test` and `npm run test:browser`.
The [browser workflow](https://github.com/SamOBrienOlinger/stopped-both-sides/actions/workflows/browsers.yml)
records results for the exact tested commit on Chromium, Firefox and WebKit.
Branch runs do not publish or merge the site.

## Visual evidence and limits

Successful journey captures include the filtered catalogue, the viewport directly
after switching, decision context, separate evidence scene, fuller-picture recap
and expanded answer comparison. Enlarged-Irish captures are included separately.
Inspect these files in each run's `browser-report-*` artifact; their existence is
not itself evidence that someone has reviewed them. Artifacts expire after seven
days. Visual findings and the inspected run should be recorded in the handoff.

Browser-engine assertions are not a participant usability study or accessibility
certification. Screen-reader focus is covered at DOM level, not by listening to
VoiceOver, TalkBack or NVDA speech. Shipping Safari and physical-device checks,
independent Irish-language/legal review, and comprehension testing with public
and Garda learners remain separate work. Tests inspect external source links;
they do not submit complaints or exercise real reporting services.
