# Button design

Stopped: Both Sides uses one shared control style across the public and Garda experiences. Filled buttons identify the next action; outlined buttons offer secondary actions such as changing character; underlined controls support revisiting an answer or opening settings. Role colours remain teal for the public and blue for Garda.

## Role selection

Homepage controls retain the perspective name and add “Choose this side.” The second line makes it clear that the panel is interactive and opens role setup. Both perspectives receive equal emphasis because either is a valid starting point. The setup screen then gives “Start this situation” the primary emphasis. “Selected” and “Choose” labels make the active role understandable without relying only on colour. All added labels have Irish translations.

The hero controls remain at the top centre of their scenes on desktop. On narrow screens they share a row above the artwork, with flexible heights for translated or enlarged text. The two scenes remain horizontal with slightly overlapping edges. The decorative LEGO-brick cloud is absent. Existing character artwork, skin tones, scores and stored progress are preserved.

## Control behaviour

Primary controls have a 48 CSS-pixel minimum height and a 44-pixel minimum width. Secondary text controls retain at least 44 by 44 pixels. These are minimum hit areas; labels can wrap and expand instead of being truncated. Rounded rectangles provide more usable text space than the previous pill-shaped hero controls. Buttons use native HTML semantics, and navigation actions remain links.

Hover changes the colour within the correct role palette. Pressed controls use an inset treatment. Keyboard focus has a visible outline, with a white separation against artwork. Reduced-motion preferences remove transitions. System forced-colour mode uses system colours for boundaries, selection and focus. Answer buttons retain a consistent border width before and after selection; selected answers also retain their existing explicit selection text. No answer meaning, grade or scoring rule changes.

## Evidence and rationale

[GOV.UK’s button guidance](https://design-system.service.gov.uk/components/button/) recommends action-describing sentence-case labels and distinguishes primary and secondary actions. This supports the added action line and the calmer treatment of optional controls. Equal prominence for the two role choices is an application-specific decision; it is not a claim that every page should have two primary actions.

[W3C’s target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) describes a 44 by 44 CSS-pixel enhanced target criterion with exceptions. The control dimensions here use that size as a design baseline, with taller primary buttons. This does not establish whole-site AAA conformance.

[W3C’s focus-visible guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) requires a visible keyboard-focus indicator. [Its contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) describes a 4.5:1 minimum for ordinary text. The implementation retains the established dark teal and blue palette, and checks both normal and higher-contrast reading modes. These standards support the engineering checks; they do not replace evaluation with disabled users.

## Review and verification

The reviewed journey covers homepage role selection, setup, a decision, feedback and changing sides. The homepage previously used perspective names without action wording. The setup role selection relied visually on filled colour. The revised controls add explicit action and selection text. Existing start, answer and side-switch behaviour is retained.

The automated browser suite covers both entry points in Chromium, Firefox and WebKit at widths from 320 to 2560 pixels, including enlarged Irish text, touch rotation, saved progress and keyboard settings controls. Test assertions track the translated label spans inside the new controls. The game suite covers 88 existing checks.

Physical-device, assistive-technology and independent language review remain separate tasks. The changes are a component improvement, not certification of accessibility or proof of usability for every person or browser version.

Sources reviewed 14 September 2026.

The revised client passed all 78 browser checks (26 per engine) on the implementation branch, and all 88 game checks. The publication pipeline reruns the same browser suite against the live Pages files.

[Canva button reference](https://www.canva.com/d/4DSRcYhUi8-bboY) · [HTML reference](button-reference.html)
