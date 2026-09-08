# Hero perspective controls — design review

final result: passed

## Scope and visual evidence

The requested change is to put the Public perspective and Garda perspective controls at the top centre of their images and keep them responsive. The annotated screenshot specifies placement; the previously selected option 1 supplies the characters and illustration style. This review covers the hero component on both existing entrypoints.

- Source visual truth: [annotated placement reference](docs/design/hero-buttons-source.jpg), 1125 × 373 pixels.
- Implementation: [browser-rendered desktop capture](docs/design/hero-buttons-desktop.jpg), 1363 × 936 pixels, CSS viewport 1363 × 936, device scale 1, home route scrolled 204px to show the full hero component.
- Selected character source: the combined option 1 concept, `exec-30743afb-725c-473a-8b43-9cde145dc15d.png`, supplied in the design conversation.
- The source annotation and implementation capture were opened together. Comparison focused on the two image/control regions, rather than comparing the cropped source with the full page. Image density was 1:1; the source and implementation have different surrounding crops and were not treated as pixel-identical pages.

## Findings

No actionable P0, P1 or P2 differences remain within this scope.

| Fidelity surface | Review |
| --- | --- |
| Fonts and typography | Existing Open Sans, bold readable button labels, 1rem text with normal wrapping. Labels translate to Irish and remain unclipped at 150% text and increased spacing. |
| Spacing and layout | Each link shares its image's grid cell, aligns to the top and centres horizontally. Desktop measurements: zero horizontal centre error, 20px top inset and 48px target height. Images stack below 900px. |
| Colour | Public teal and Garda blue use the existing role tokens. Opaque backgrounds, white text and white borders separate controls from detailed artwork. High-contrast and forced-colour treatments are included. |
| Image quality | Separate text-free generated illustrations match the selected LEGO characters. Three local WebP widths (480, 960 and 1600) allow responsive selection. Image dimensions reserve space; images stay inside rounded frames. |
| Copy and content | The two visible labels match the user's request. Both links open the matching role chooser and update its perspective palette. No character captions or concept names are baked into these hero assets. |

## Interaction and responsive verification

- Both links activated in the cloud browser, including Enter on the Garda control. The matching role was selected and all 14 situations were available.
- Tab continued from the Garda link to scores and progress. Existing focus outlines remained visible.
- Garda entrypoint checked with Irish, 150% text, high contrast and increased spacing.
- No application console errors were found in the local preview.
- All 77 Node checks passed.
- All 66 browser checks passed in Chromium, Firefox and WebKit on application commit `1dfdc33b38c378e5d4e4428dc9bd446bb180f5e1`: [workflow result](https://github.com/SamOBrienOlinger/stopped-both-sides/actions/runs/34276968356).
- Hero assertions cover loaded images, top-centre alignment, full control containment, text clipping, touch target size and stacked/two-column layouts at 320, 390, 568, 768, 1024, 1366, 1920 and 2560 CSS pixel widths, in English and enlarged Irish. Existing touch, rotation, gameplay and progress checks also passed.

## Comparison history and limits

The first usable viewport comparison passed. Full-page capture attempts omitted some decoded images in the capture, so they were excluded from visual evidence; a normal viewport screenshot with both images visible was used instead. No visual code fix was required by the comparison. An existing Node assertion was updated to expect the requested perspective labels rather than the previous start-link wording.

Physical-device and assistive-technology testing are separate work; these checks do not certify every browser/device combination.

## Implementation checklist

- [x] Separate image content from the translated interactive controls.
- [x] Centre both controls at the top with flexible dimensions and visible keyboard focus.
- [x] Verify both entrypoints, reading preferences and responsive layouts.
- [x] Preserve the current game routes, scores and progress behaviour.
