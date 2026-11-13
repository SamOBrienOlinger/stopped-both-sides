# Garda uniform artwork update — 12 November 2026

## Reference and design

The project owner supplied a photograph of three Garda members as the uniform reference. The generated artwork uses the clothing in that photograph; the fictional game characters retain their established identities rather than copying the photographed people.

Three clothing treatments are used:

| Uniform | Characters |
| --- | --- |
| Light blue short-sleeved shirt, navy trousers, duty belt | Jamie, Lee, Orla |
| Fluorescent yellow vest with silver reflective strips over light blue | Ciara, Aisling, Charlie |
| Navy zipped jacket with fluorescent yellow upper panel and silver reflective strips | Rory, Kai, Conor |

Aisling retains her light cream skin and navy hijab, with covered forearms. Orla retains her blonde hair and glasses. The nine fictional identities, natural skin-tone range and LEGO-style proportions follow the existing cast. Garda caps are used for Rory, Jamie and Conor.

## Files

- [Character atlas](../assets/characters/garda-uniforms-2026.webp): transparent 1254 × 1254, row-major 3 × 3 arrangement.
- Rows: Ciara / Rory / Jamie; Lee / Aisling / Kai; Conor / Orla / Charlie.
- [Public-view hero](../assets/heroes/public-1600.webp) and [Garda-view hero](../assets/heroes/garda-1600.webp): Ciara wears the matching vest and light blue sleeves. Each has 480, 960 and 1600 pixel responsive variants.
- [Generation prompts](garda-uniform-prompts-2026.txt): exact prompts used with the built-in image-generation tool.

The source photograph is not included in the repository. The generated PNG masters are also available in the owner's [Canva project folder](https://www.canva.com/folder/FAHavSZgztM).

The atlas was encoded as lossless WebP (757,034 bytes). Verification compared every alpha value and every nontransparent RGB value against the generated PNG: all match. Only invisible RGB values behind fully transparent pixels differ. Hero variants use WebP quality 88.

## Runtime integration

`encounters/garda-artwork.mjs` supplies the same Garda artwork to character selection, saved cast portraits, scenes, feedback and recaps. `encounters/garda-atlas.mjs` stores the measured crop boundaries, horizontal centres and foot baselines. Each officer is positioned in a 380-pixel logical frame with a common floor at 370.5 pixels (97.5% of the frame).

The original automatic horizontal flips have been removed for Garda figures so “GARDA” remains readable. The generated officers use a near-front-facing pose. Character names and other interface text remain HTML, outside the images.

The asset route changes only appearance. Character IDs, saved preferences, scene casting, choices, scoring and scenario facts retain the existing behaviour.

## Review scope

This is a focused uniform revision based on `main` at `436e646efef167a0cb6bd9ead40098c8c901c69a`. It does not incorporate the separate `uimproved` or QA branches. The older atlas and pose assets remain as historical references and for existing public-character rendering; active Garda rendering uses the new atlas.

The review branch is `feat/garda-uniforms-photo-reference-20261112`.

## Validation

- Existing automated suite: 127 public-entrypoint tests and 52 Garda-entrypoint tests passed, with no failures. The scene coverage includes every stage with all 81 public/Garda character pairs.
- After the lossless WebP packaging change, all five affected scene tests passed again.
- Syntax checks passed for all 82 JavaScript modules; the final diff passed whitespace checks.
- Visual inspection of the generated master confirmed nine distinct characters, correct row order, readable GARDA patches, intact figures and true alpha transparency. The atlas foot positions were measured from the actual output.
- Browser visual checks are **not verified**. The eight relevant Playwright cases were blocked at browser startup by the execution environment's socket restrictions. The separate browser could not access the local preview. Phone/desktop screenshot checks and Firefox/WebKit checks therefore remain for review before merging.

