# Accessibility and languages

Both entrypoints offer **Language & reading** in the header, footer and accessibility page. The seven added languages cover shared play, original single-role practice, navigation, progress, rights, evidence, About and accessibility information. Shared play includes all 14 situations and 59 stages, with both roles' choices, feedback and recaps.

This guide describes the implementation and automated-check scope. It does **not** record a passing test run or establish independent WCAG conformance. Use results for the exact revision under review.

## Available languages

| Language | Selector name | Language tag | Coverage |
| --- | --- | --- | --- |
| English | English | `en-IE` | Original English throughout the site |
| Irish | Gaeilge | `ga` | Existing shared-game translation and controls |
| Portuguese | Português | `pt` | Both modes and information pages |
| Arabic | العربية | `ar` | Both modes and information pages; right-to-left text |
| Polish | Polski | `pl` | Both modes and information pages |
| Romanian | Română | `ro` | Both modes and information pages |
| French | Français | `fr` | Both modes and information pages |
| Spanish | Español | `es` | Both modes and information pages |
| Mandarin Chinese, written in Simplified Chinese | 中文（简体） | `zh-Hans` | Both modes and information pages |

English remains available. Irish retains its existing behavior: selecting it during original practice transfers that session to the matching shared situation; reference sections remain in English with an Irish explanation and explicit English markup. The new languages translate original practice directly, keeping that mode active.

## Accessible interaction

- Header and footer buttons open the existing reading-settings dialog. Its language field is a labelled native `select`; options carry their own `lang` and `dir`. **Apply preferences** commits the selection. Browsing options does not apply a language or navigate.
- Opening settings focuses its heading. The dialog supports Tab wrapping and Escape, including a fallback when native dialog methods are unavailable. Apply, Cancel and closing restore focus to the opener, using its stable ID where necessary.
- Applying a language updates document/main-content `lang` and `dir`, page titles, visible text and human-readable attributes, including accessible names, image alternatives and progress descriptions. A separate polite status region announces the change without taking focus.
- Arabic uses semantic `dir="rtl"`, logical spacing/alignment and suitable font fallbacks. Chinese has script-appropriate fallbacks. Artwork and sprite coordinates retain their orientation; preserved names and references are isolated where needed.
- Existing enlarged text, high contrast, spacing and reduced motion remain available. Settings selects have a 48px minimum height; settings buttons have 44px minimum targets. Text wraps, keyboard focus remains visible and browser zoom remains available.

Applying preferences re-renders presentation while applications retain session objects. For the added languages, the current stage, characters, role, answers, route and saved scores stay intact. Open game disclosures are restored when the route stays the same. The intentional Irish transfer remains the exception to keeping an original-practice route.

## Loading, recovery and source names

Each added language is a pack in `locales/`, hosted with the site and fetched when needed. Successful packs are reused during the visit. Translation does not send choices, characters or learning records to a translation service.

During loading, the form exposes its busy state and a polite message. Apply is temporarily disabled; Cancel and closing remain available. A failed request leaves language, preferences and game state unchanged, displays an error in the dialog and re-enables Apply. Retry uses a fresh module URL to avoid a cached failed fetch. Incomplete packs are rejected before use.

Closing or cancelling invalidates a pending application attempt. A late response may cache the pack but cannot apply cancelled preferences. If a saved or URL-requested language cannot load on entry, English remains usable with a visible notice and a way to reopen settings and retry.

Published titles, author names, citations, brand names and character identities retain their original form. Preserved publication text uses `data-no-translate` and language/direction markup; surrounding explanations and controls are translated. External links still open original publications, which this feature does not translate.

## Preferences and compatibility

`accessibility/preferences.mjs` retains the per-perspective keys `garda-encounter-reading-v1:public` and `garda-encounter-reading-v1:garda`. The shared `garda-encounter-reading-v1:language` value supplies a language on a first visit to the other perspective; existing settings for that perspective take precedence.

An explicit supported `?lang=` overrides stored language. Companion-resource links carry it alongside existing game/progress transfer. Aliases include `pt-PT` for `pt` and `zh`, `zh-CN`, `zh-SG` and `cmn` for `zh-Hans`. Invalid stored values fall back to English; language is not inferred from identity or location.

Preferences remain separate from learning records and retain existing English/Irish values. If storage is blocked, settings work for the visit and a status message explains that saving is unavailable. **Reset reading preferences** keeps the active language and does not clear progress.

## Maintaining translations

1. Keep English content and game logic authoritative for routes, choice order and scores. Translation preserves IDs, action attributes, links and saved-state tokens.
2. Array positions in `locales/messages.mjs` determine pack IDs, starting at `m0000`. Append new messages; do not reorder/remove entries and shift those IDs. Update the same ID in all seven packs when its English meaning changes.
3. Each `locales/<language>-content.mjs` exports plain-text translations for every ID. Preserve tokens such as `{count}`, `{role}` and `{name}` exactly; their order can follow the language. Output is HTML-escaped.
4. Add dynamic sentences to `locales/patterns.mjs` and the catalogue as complete templates. New unmatched text falls back to English: inspect new screens and accessible descriptions as well as pack completeness.
5. Maintain Irish content and its UI dictionary separately for shared-game edits. Extend regression coverage for new states, and keep deployment version queries consistent across entrypoints, shared imports and pack loaders.

## Automated verification scope

Run from the repository root. Browser checks require the Playwright setup in the [browser guide](BROWSER-COMPATIBILITY.md).

| Command | Implemented scope |
| --- | --- |
| `npm run check` | JavaScript syntax across application modules, tests and scripts |
| `npm test` | Existing route, scoring, character, accessibility and Irish regressions; new language integration checks against both entrypoints |
| `npm run test:browser -- languages.spec.mjs` | Language journeys in configured Chromium, Firefox and WebKit projects |
| `npm run test:browser` | Full browser, layout, navigation and gameplay regressions |

`tests/languages.test.mjs` checks pack IDs, nonempty values, interpolation tokens, escaped output, preserved attributes, all 59 shared stages and 295 role-specific choices, character names, preference validation, carried links and blocked storage. Its application adapter checks retained sessions/scores, original-practice controls, reference pages and completed recaps. Adapter checks are not browser or screen-reader tests.

`tests/browser/languages.spec.mjs` exercises every added language from both entrypoints: explicit Apply, focus return, status text, accessible names, navigation, original source references, companion-site return, reload, original practice and open recap details. It checks enlarged-text layouts and spacing, adds Arabic/Chinese cases at 320px and 1366px with high contrast and 44px settings targets, and covers failed-load retry, recovery from an unavailable initial language and cancellation in native/fallback dialogs. Other suites retain English/Irish and existing gameplay coverage. Inspecting status text and attributes does not establish actual screen-reader announcements.

## Standards and outstanding review

The implementation targets **WCAG 2.2 Level AA** and uses generous control targets. It has not received an independent accessibility audit; this document claims neither AA nor AAA certification. Automated coverage supports specific behaviors, not a complete conformance evaluation.

Independent language review and Irish legal review of translated learning content remain outstanding. Accessibility review should include disabled users, keyboard-only journeys, VoiceOver/TalkBack/NVDA/JAWS on real devices, browser zoom/reflow, text-spacing overrides, forced colours and mixed-direction text. Engine/viewport tests do not certify every browser, device, assistive-technology combination or translation's accuracy.

Primary guidance: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [select plus Apply](https://www.w3.org/WAI/WCAG22/Techniques/html/H84), [language of page](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html), [language of parts](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html), [RTL markup](https://www.w3.org/International/questions/qa-html-dir.en.html), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) and [modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
