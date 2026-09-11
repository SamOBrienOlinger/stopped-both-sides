# Characters and encounter casting

Players can choose from nine LEGO-style characters for each perspective. The 18 characters carry forward the previously selected design concept, including men, women and people with an ambiguous gender presentation. The interface labels characters by name without asking players to disclose their identity.

## Play behaviour

- Choose a side, then start the recommended situation with the ready-selected character. **Choose a different character** opens the optional picker; **Done** closes it. **Browse all 14 situations** opens the full catalogue.
- A character for the opposite side is sampled uniformly from that side's nine characters when the encounter starts. Randomness does not depend on answers, scores or appearance.
- Both characters appear at every stage, during feedback and in the recap. The same pair remains in place across stages and reloads.
- **Change character** opens an inline picker. Choosing a character updates only the active side's appearance and leaves the opposing character, stage, answers and scores intact.
- **Switch perspective** puts the player in the existing opposite character's place. That character can then be changed using the same control.
- Starting or replaying a shared situation assigns a new random counterpart; it may select the same character by chance.
- Original single-role practice also displays the pair. Its change-character control opens shared play at the same stage, with the existing choice retained.

The chosen figure represents the player's role visually. Scenario names, ages, facts, legal responsibilities, branches and scoring do not change with appearance. This distinction is stated in the picker.

## Persistence and compatibility

`encounters/characters.mjs` owns the catalogue, character validation, random casting and selected-character preferences. `encounters/engine.mjs` stores a `cast` containing one validated ID per role. All stage operations preserve it.

Version 2 encounter links carry the cast alongside fictional choices. Version 1 links still open with a deterministic default pair, preserving their previous route. Invalid IDs and IDs belonging to the wrong role are rejected. Decoding a link never rerolls a character.

Saved progress and companion-site links carry the current pair through the existing resume token. Preferred character IDs are saved separately under `stopped-both-sides:characters:v1`; clearing scores does not remove these preferences. Blocked storage still allows character changes for the current visit. No character information is uploaded to an AI service during play.

## Interface and checks

The picker uses native buttons with accessible names, `aria-pressed`, visible selection text, keyboard focus and English/Gaeilge labels. Opening it moves focus to its heading; closing it restores focus to **Change character**. Selection keeps focus on the chosen button. The layout reflows from two to five columns, and all controls have at least 48px target height. Artwork is decorative; names and the active side remain available without images.

Node coverage includes all random-selection intervals, character edits without score changes, route and progress round trips, old links, rejected IDs, blocked storage and original-mode transfer. Browser coverage includes keyboard selection, translated controls, changes during feedback and recap, reload, cross-site transfer and stable characters through complete routes. The existing responsive suite also checks the picker at 320–2560 CSS pixels and with 150% Irish text.

## Artwork record

- Faces, heads, necks and hands use a natural skin-tone spectrum from cream through tan to dark brown across both roles. Each character's exposed skin matches, and the two hero viewpoints use the same tones for Alex and Ciara. Appearance has no effect on scenario facts or scoring.
- The September 2026 colour revision uses the built-in image-generation tool to edit the original artwork, retaining the cast layout, clothing, assistive devices and role colours. All responsive hero sizes derive from the same revised image for their viewpoint.
- Asset: [cast.webp](../assets/characters/cast.webp), 1774 × 887 pixels, a six-column, three-row sheet displayed through equal square image windows.
- Generated with the built-in OpenAI image-generation tool, using the selected combined design concept as its identity reference. The result was inspected before integration and converted to WebP for local delivery.
- The final generation prompt is retained in [character-art-prompt.txt](character-art-prompt.txt).
- The source artwork has no text, role captions or embedded interface controls. Character names, selection states and translations are rendered as HTML.

Credits and design acknowledgements remain in the README. No LEGO affiliation or endorsement is claimed.
