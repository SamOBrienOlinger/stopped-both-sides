# Clearer first play: review and changes

Scope: homepage → setup → first decision, on both entrypoints. The purpose is to help people begin learning about rights, responsibilities and fair decisions in Garda encounters. This is an interface review, not a new legal-content review or a usability study with participants.

## Observed starting flow

1. **Homepage — purpose present, action unclear.** [Captured homepage](design/ux/01-before-home.jpg). “Play” and “Play both sides” compete in navigation. A large title and repeated introductory sections separate the purpose from the first action. The existing paired images and perspective colours give useful context.
2. **Setup — too much before the first situation.** [Captured setup](design/ux/02-before-setup.jpg). The player sees role selection, nine character cards and a catalogue of 14 situations together. No first situation is recommended. Starting requires scrolling past the character grid.
3. **First decision — controls crowd the learning task.** [Captured decision](design/ux/03-before-decision.jpg). A perspective panel, two character panels and two score panels precede the actual scene. The same switch action appears repeatedly. The character name and scenario name are presented as competing identities.

The screenshots were captured and inspected during this review at the same desktop viewport. The browser had existing progress; the revised homepage shows its resume point. The captures therefore include a returning-player state. DOM inspection confirmed the controls and reading order. Screenshots alone cannot establish accessibility conformance or show whether learners understand the material.

## Implementation direction

- State the learning purpose in plain language and show a short read → choose → learn explanation.
- Use distinct Home and Play navigation labels.
- Offer a recommended first situation and one clear start action. Keep character customisation and the full situation library available on demand.
- Keep both characters visible in a compact area. Separate the avatar from the fictional scenario identity.
- Present the scene, decision and explanation as the main task. Keep one perspective switch and move detailed scores and supporting instructions into optional sections.
- Preserve both role answers, branching, sources, character continuity, language settings and saved progress.

## Implemented flow and visual comparison

| Screen | Before | After | Visible change |
| --- | --- | --- | --- |
| Home | [Before](design/ux/01-before-home.jpg) | [After](design/ux/04-after-home.jpg) | Plain-language purpose, Home/Play labels, clear perspective choice and a three-step explanation. |
| Setup | [Before](design/ux/02-before-setup.jpg) | [After](design/ux/05-after-setup.jpg) | A suggested situation and start button replace the mandatory scroll through the character grid and catalogue. |
| Decision | [Before](design/ux/03-before-decision.jpg) | [After](design/ux/06-after-decision.jpg) | Compact characters and one switch action leave the scene and all three first-stage choices visible in the captured desktop viewport. |

The saved before/after images were inspected together. Navigation now focuses and scrolls to the main content, so the revised setup and decision captures begin at the game content. Both sides retain their existing colours, hero images, characters and factual scenario content. Avatars represent a role; the fictional scene retains its own names and facts.

The full catalogue and supporting scores/help use native expandable sections. Character selection remains optional before starting and available at every stage. Answer feedback gives the explanation before **Next step** or **Try another answer**. The new labels and instructions have matching Gaeilge translations.

## Verification

- JavaScript syntax checks pass across 41 modules.
- 88 Node checks pass across both entrypoints, including all existing branch, score, transfer and character checks and the new recommended-start journey.
- [All 78 browser checks passed before publication](https://github.com/SamOBrienOlinger/stopped-both-sides/actions/runs/34286947442), 26 each in Chromium, Firefox and WebKit, against implementation commit `5d8a9dd4fb4a487c701c1a68cb47bd93b91f4a1d`.
- Browser coverage includes direct starts, keyboard access to all 14 situations, feedback focus, optional scores, reconsidering an answer and advancing to the next stage. The existing responsive matrix covers both roles at widths from 320 to 2560 CSS pixels, enlarged Irish text, reading settings, touch, saved progress and recap.

This is a reasoned interface improvement supported by inspection and automated checks. It does not establish a measured improvement in comprehension or an accessibility certification. Testing the first-play journey with public and Garda learners, including disabled users, remains the next research step.
