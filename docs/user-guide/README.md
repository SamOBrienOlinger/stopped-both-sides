# User-flow infographic

The main README embeds `stopped-both-sides-user-flow.png` and links to the matching PDF. Both files describe the six-step **Explore both perspectives** journey for first-time users, checked against the English interface on 18 November 2026.

The perspective buttons use the public and Garda logos supplied by the project owner. Their original JPEG files are kept here unchanged. The PDF's two perspective buttons link to the corresponding role setup; its other controls illustrate the game's controls. The PNG is a static preview.

The guide uses a narrow, single-column layout with larger text and stacked controls. It explains character selection before starting, both ways to start a situation, how role switching keeps the previous answer, and the two possible labels of the same main button: **Next decision** or **View recap**. Optional actions are marked separately. The choice illustration is a diagram, rather than a screenshot.

The PNG joins three 400-unit-wide sections into a scrolling guide. The PDF lays out those same sections on three A4 pages, keeping the text large enough to print. They share one drawing routine so the wording and order match. Primary instructions use 16-17-unit text; at a displayed width of 375px this is approximately 15-16px. The main README also provides the guide as ordinary text above the image.

To regenerate both outputs from the repository root, install Python's `reportlab` package and Poppler's `pdftoppm`, then run:

```sh
python3 scripts/generate-user-flow.py
```

The generator uses the repository's Open Sans fonts and draws both formats from the same page definitions. It renders the PNG from a temporary tall PDF, which is removed afterwards. No extra dependencies are loaded by the game.

When the interface changes, update the generator's wording and review date alongside the main README. Regenerate both files; inspect all three sections at phone width for clipping or overlap; check the PDF text, A4 page sizes and perspective links; and compare button labels with `encounters/ui.mjs`. A rendering review checks legibility and content alignment; it does not establish that the guide has been tested with first-time participants.
