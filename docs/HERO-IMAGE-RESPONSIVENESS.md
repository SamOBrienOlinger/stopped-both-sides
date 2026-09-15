# Full-scene hero image layout

This correction supersedes the earlier overlapping-image instructions and screenshots in the design reviews, button notes and README. The two perspectives remain horizontally opposed. The image pixels no longer overlap.

## Reported problem and correction

The previous mobile layout forced landscape source images into portrait frames, combined `height:100%` with a minimum height and `object-fit:cover`, and placed the Garda image over part of the Public image. This cropped the characters and produced a hard cut through the paired scene.

The shared landing stylesheet now uses two equal `minmax(0,1fr)` columns with a small responsive gutter. Images retain their natural proportions with `width:100%`, `height:auto`, no minimum height and `object-fit:contain`. Perspective links occupy equal-height rows above the artwork on every viewport, rather than covering faces. Character galleries continue to reflow separately.

The original artwork, character selection, game rules, translation controls, scores and saved progress are unchanged. Both entrypoints request a new stylesheet version so an older cached stylesheet does not retain the faulty layout.

## Regression coverage

The existing Chromium, Firefox and WebKit matrix now checks image loading, natural image proportions, equal column widths, horizontal alignment, a non-overlapping gutter, controls above the images, readable control labels and minimum touch targets. It covers both entrypoints at widths from 320 to 2560 CSS pixels, standard and enlarged reading settings, and touch portrait/landscape transitions.

Hero screenshots at 390, 768 and 1366 CSS pixels are attached to the browser reports in standard and enlarged-text states. These are browser-engine checks, not a claim that every physical device or browser version has been tested. Refer to the Actions run for the specific commit before treating the checks as passed.
