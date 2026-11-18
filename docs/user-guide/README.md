# User-flow infographic

The main README embeds `stopped-both-sides-user-flow.png` and links to the matching PDF. Both files describe the six-step shared-play journey, checked against the English interface on 18 November 2026.

The perspective buttons use the public and Garda logos supplied by the project owner. Their original JPEG files are kept here unchanged. The PDF's two perspective buttons link to the corresponding role setup; its other controls illustrate the game's controls. The PNG is a static preview.

The guide uses short instructions, vector icons, examples of game controls and a return arrow from **Next decision** to the read-and-choose step. Optional retry and perspective-switching actions are shown together. Topic chips and the choice-button illustration are examples, rather than a complete menu or a screenshot.

To regenerate both outputs from the repository root, install Python's `reportlab` package and Poppler's `pdftoppm`, then run:

```sh
python3 scripts/generate-user-flow.py
```

The generator uses the repository's Open Sans fonts, draws the text and layout in the PDF, and renders the PNG from that PDF. No extra dependencies are loaded by the game.

When the interface changes, update the generator's wording and review date alongside the main README. Regenerate both files, inspect the full PNG for clipping or overlap, check the PDF text and perspective links, and compare button labels with `encounters/ui.mjs`.
