# Accessibility and language

Both companion sites now offer the same Language & reading control, shared game and preferences. This implementation targets WCAG 2.2 Level AA. It is not a claim of audited conformance.

## Interaction and visual design

- The home page leads with a plain English description, then a choice of starting role. The 14 shared situations support both roles. Original single-role practice is retained in a native disclosure.
- Navigation gives direct access to progress; the companion-site button remains available on every page. Situation cards have descriptive action names. Reading controls are available in the header, footer and accessibility page.
- The shared scene, active role, question, selected answer and feedback have distinct visual hierarchy. A selected answer has a visible text label as well as a border and programmatic pressed state.
- Native buttons, links, select elements, checkboxes, disclosures and a modal dialog support keyboard interaction. The dialog uses native modal behaviour where available, explicit Tab wrapping, and an older-browser fallback with Escape, background isolation and focus restoration to the opener or stable header control.
- Route navigation focuses the main heading. Answer feedback receives focus without first moving to the page top. Switching role focuses the question in the same stage. Clear-progress confirmation and cancellation focus the relevant control. A separate polite status region announces role and preference changes.
- Text enlargement (100%, 115%, 130%, 150%), high contrast, increased spacing and reduced motion are available. Settings apply explicitly on submission, without changing answers or scores. Device reduced-motion and forced-colour preferences are respected. There is no automatic audio, timer or flashing content.
- Controls generally have 44–48 CSS pixel minimum targets; flexible columns collapse for narrow layouts, and text can wrap. Browser zoom is unrestricted. Fonts are local.
- The core checked colour pairs exceed 4.5:1 for normal text and 3:1 for relevant UI boundaries/focus. Main text is 12.19:1 on white and primary buttons 7.47:1. High-contrast body/button pairs exceed 7:1. This is a palette check, not measurement of every rendered state.

## Perspective colours

The public site uses deep teal and soft mint surfaces; the Garda site uses muted blue and pale blue surfaces. Shared gameplay follows the active role, so switching perspective updates the header accent, scene, controls and supporting surfaces immediately. Role selectors, scores and recap comparisons retain their own role colour on either site. Normal and high-contrast modes each have both palettes. Role labels, selected states and focus announcements remain the primary non-colour cues. The theme follows the existing route; it does not create or modify saved game state.

## Language coverage and review status

`locales/ga-content.mjs` contains a working Irish translation of all **14 shared situations / 59 stages**, including the neutral scene and both roles' prompts, lessons, choices and feedback. `translate.mjs` adds role labels, controls, score explanations and progress/recap language. It translates trusted UI templates while preserving IDs, choice order, links and state tokens. Published source titles remain in their original English, marked with `lang="en-IE"`.

The shared mode can change between English and Gaeilge without losing the stage, role, either answer, history or scores. Choosing Irish in an original single-role session transfers the exact existing session to the matching shared situation in the same role. The original English practice remains available. About, accessibility and source-reference sections remain in English; an Irish notice explains this, and their content language is declared. The brand names are marked English.

**Independent Irish-language and Irish legal review of the translation remains outstanding.** The Irish text is a draft learning aid, not a certified legal translation. The English reference is always available through the language control. No third-party translation service receives game choices or learning records. There is no claim of additional language coverage.

When editing English content, update its Irish entry and the corresponding UI dictionary. Do not reorder translated choice arrays: each contains prompt, lesson, then alternating choice text and feedback in the original order. The coverage tests fail when stages or choices are added without a translation. The English text remains the canonical state/score source; translation does not decide routes or points.

## Preferences and privacy

Preferences use `garda-encounter-reading-v1` in localStorage. Values are validated against the supported languages, sizes and contrast settings. Blocked storage falls back to the current visit. Reset reading preferences retains the current language and does not touch the separate game progress key.

The companion link carries `?lang=en` or `?lang=ga` alongside the existing fragment-based game/progress transfer. Only the chosen language is transferred; reading preferences otherwise belong to that browser and site, using separate keys even on the shared GitHub Pages origin. No language choice is inferred from identity or location.

## Verification and remaining work

Node integration tests cover translation completeness for all 59 stages and both roles, preservation of links and semantic attributes, invalid preferences, blocked storage, live language changes, original-session transfer, role/feedback/confirmation focus targets, language-marked reference pages and separate progress storage. Existing tests traverse every original route and **11,150 mixed-role routes**, plus score and transfer behaviour. The interaction tests use a small DOM adapter, not a real browser.

The separate [browser and responsive suite](BROWSER-COMPATIBILITY.md) checks real Chromium, Firefox and WebKit engines, including 320px reflow, 150% text, increased spacing, dialog keyboard behaviour and touch input. These automated checks supplement the Node adapter tests. Physical-device browser zoom, text-spacing overrides, VoiceOver, TalkBack, NVDA/JAWS, forced colours and testing with disabled users remain necessary before asserting conformance. Further languages should receive qualified translation and review before publication. This change does not constitute legal, operational, language or independent accessibility sign-off.

References:

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WAI headings tutorial](https://www.w3.org/WAI/tutorials/page-structure/headings/)
