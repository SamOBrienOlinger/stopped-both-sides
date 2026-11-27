# How it works guide

The main README embeds `stopped-both-sides-user-flow.png` and links to the matching three-page A4 PDF. Both describe the six-step **Explore both perspectives** learning activity using the current English button labels.

The guide uses the restored public and Garda perspective logos from `assets/brand/public-perspective.webp` and `assets/brand/garda-perspective.webp`. Each role button shows its own logo, while the website's shared project branding retains the transparent Stopped: Both Sides mark. The two perspective buttons in the PDF link to the corresponding setup; all other pictured controls illustrate the website controls. The PNG is a static preview.

The main route is to choose a perspective, start the suggested situation, select an answer button, read the explanation, continue and review. Character changes are marked as optional before starting. Supporting details, trying another answer, comparing perspectives and choosing a different situation are grouped separately. The diagram is an illustration of an answer button.

Garda Aisling and Daniel illustrate the character choices available in the two roles, using the production sprites. Names and image locations are resolved from stable character IDs. The PDF uses the printable page width to make the text larger; the same three 400-by-566-unit page definitions form the scrolling PNG. Body copy is generally 12-13 logical units; smaller text is reserved for supporting labels. The main README provides ordinary text instructions as well.

Regenerate both formats with Python, ReportLab, Node and Poppler available:

```sh
python3 scripts/generate-user-flow.py
```

Review all three pages for clipping and overlap, compare button names with `encounters/ui.mjs`, and check the PDF text and perspective links. A rendering review does not establish that the guide has been tested with first-time participants. The guide has no visible review-date line or Open the game controls.
