# Scene composition and responsive grounding audit

Date: 27 November 2026. Starting revision: `df4e2d4989a77bba426df4b6a6d1f7496640d37f`.

## Scope and corrections

The audit covers the interactive scene renderer, opening situation previews,
compact practice/recap illustrations, and the landing hero, two perspective
previews and story preview in both public and Garda entrypoints. Character
eligibility rules, fictional identities and the established perspective logos
are preserved.

| Finding | Correction |
| --- | --- |
| Right-hand characters in quayside groups could stand on the river-wall face. | Crop the backdrop from its bottom-left origin at 1.35×, preserving the group arrangement while bringing clear pavement beneath the right-hand feet. |
| The supporting customer in the street colleague scene crossed the curb. | Move the customer and colleague left, keeping their separation and depth. |
| The bicycle's left tyre crossed the garden-wall face. | Move the bicycle and its owner together onto the pavement, with the Garda adjusted to preserve space. Both tyre contact regions are checked separately. |
| The nearest youth-group friend was too small for the shared foreground depth. | Increase that friend's frame and use the same ground baseline as Jamie. |
| Dedicated story/support artwork had inconsistent transparent padding beneath the soles. | Register the eight source variants to the same 97.5% sole line without stretching or replacing their artwork. |
| Group/preview contact shadows did not consistently meet the opaque soles. | Centre the contact shadow on the registered sole line. |
| Held phones and papers could look disproportionately large. | Reduce their dimensions, place the grip inside the hand, and scale borders with the prop container. Preserve the separate original-story props. |
| Landing figures could cross a curb or planter as preview proportions changed. | Use floor-aware front/rear offsets and matched shadow positions for phone, desktop and story proportions. |
| Small pedestrians already painted into the GPO backdrop conflicted with the scale and legs of the overlaid characters. | Use a people-free variant of that background for the four dynamic landing composites. Retain the original populated artwork. |

The existing bags and toolbox were checked against their actual opaque bottom
contours and the independently marked pavement. Their positions were retained.
The source art, contact lines, floor polygons and representative composites were
also reviewed visually; geometric assertions alone cannot judge every artistic
aspect of an illustration.

## Coverage and method

`tests/browser/scene-grounding.mjs` enumerates all 34 situations and all 99
reachable decision stages. It requests every combination of the ten public and
nine Garda portraits, in both authored and learner-selected modes, through the
same cast-normalisation rules used by the application. Restricted situations
continue to use their eligible characters. Invisible saved lead choices can
change the supporting cast, so the enumeration occurs **before** deduplication.

There are 17,820 stage inputs, rendered in full and compact form, and 6,120
opening-preview inputs: **41,760 logical renders**. Complete visual signatures
include every supporting participant, source image, pose/crop, prop, anchor,
background and rendering surface. Equivalent renders are measured once and
their input-to-composition mapping is saved in the CI coverage artifact.

The current matrix contains 4,427 distinct full compositions, 4,427 compact
compositions and 2,142 previews: **10,996 distinct compositions per browser**.
The exhaustive pass uses a 390 × 844 viewport. The responsive pass selects all
187 structural layouts plus each of the 65 artwork/crop variants in its smallest
and largest frame, producing 276 representative compositions. It runs through
both entrypoints at these viewports:

| Context | Width × height |
| --- | --- |
| Small phone | 320 × 900 |
| Phone | 390 × 844 |
| Phone landscape | 568 × 320 |
| Tablet | 768 × 1024 |
| Desktop | 1366 × 900 |
| Large desktop | 1920 × 1080 |

Compact recaps also run with Arabic direction and 200% reading size at the small
phone and desktop widths. Actual landing DOM is measured at all six viewport
sizes in both entrypoints. The scene sweeps mount the production renderers in
their real CSS containers; the existing browser suite separately exercises live
routes, choices, navigation, refresh and accessibility behaviour.

The browser measures decoded image alpha, rather than treating transparent image
boxes as the visible character. It maps the visible sole/wheel contacts through
the rendered background's cover crop and transform into independently reviewed
source-image ground polygons. Those polygons and obstacle footprints live in
`tests/browser/fixtures/scene-ground-surfaces.mjs`; they are not derived from the
production actor anchors.

Assertions cover clear ground beneath feet/wheels and floor props; opaque artwork
clipping; unchanged source proportions; actual painted intersections between
people; badges covering other people; held-object contact; prop clipping; and
contact-shadow alignment. Responsive checks compare the normalised placement,
artwork and backdrop crop across viewports. Pixel tolerances account for image
sampling and browser rounding, rather than treating nearby walls or road as
valid ground.

## Validation and reproduction

The `Browser compatibility` workflow has dedicated Chromium, Firefox and WebKit
grounding jobs. Each saves complete JSON coverage/measurement diagnostics and
selected Chromium screenshots. The general browser shards exclude the new spec
so it is exercised once per engine, alongside the existing regression suites.

```sh
npm ci
npm run check
npm test
npx playwright install --with-deps chromium firefox webkit
npm run test:browser -- scene-grounding.spec.mjs
```

Candidate branches run against their exact checked-out revision. After main is
published, production jobs wait until served assets match that revision before
running against GitHub Pages. The workflow and its artifacts provide the result
for each tested commit; this document describes the coverage and corrections.

These checks cover the specified browser engines, viewport sizes, cast inputs
and authored scene states. They do not claim an exhaustive test of every physical
device, arbitrary user stylesheet or future artwork change. The fixtures and
tests are retained so future scene changes must satisfy the same geometry checks.

## Background asset provenance

Mode: image edit (`image_gen`, `precise-object-edit`), using the existing
`assets/dublin-approved/gpo-city-1600.webp` as the sole reference. The generated
opaque result was exported to these web assets with size/format conversion only:

- `assets/dublin-approved/gpo-city-clear-480.webp`
- `assets/dublin-approved/gpo-city-clear-960.webp`
- `assets/dublin-approved/gpo-city-clear-1600.webp`

The original populated variants remain in the repository. The generated edit was
inspected before integration; the floor/obstacle fixture uses the actual new
1600 × 900 export. `landing/poster-hero.mjs`, the HTML preload and their importing
modules use the `scene-grounding-20261127` cache version.

Exact edit prompt:

> Use case: precise-object-edit. Edit target: the attached existing 1600x900 LEGO-style Dublin GPO and Spire streetscape. Create a clean background plate for separately overlaid learning-game characters. Remove ALL pedestrian/minifigure people throughout the pavement and roadside, including their wheelchair, carried bags, individual shadows/reflections and the tiny distant crowd. Fill only the removed areas naturally with the continuing same paving, road, building or planting behind them. Preserve the exact original 16:9 composition, camera position, perspective, crop and every architectural feature: GPO facade, columns, rooftop statues (KEEP the architectural statues), Irish green-white-orange flag, Spire and its base, trees, planters, pavement tile pattern, curb line, bollards, streetlights, right-hand buildings, blue-yellow double-decker bus with route number '11', and sky. Keep the original lighting, colors and polished LEGO/block illustration style. The bus may retain an indistinct driver inside; remove the person standing beside its front. No new people, characters, signs, words, structures, logos or watermarks. Do not change architecture, street geometry or the wide framing. Output only the finished opaque clean background at 16:9, ideally 1600x900 or larger with identical framing.
