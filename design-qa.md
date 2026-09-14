# Homepage overlap design review

Date: 14 September 2026

## Visual target and evidence

- User references: `IMG_1256.jpeg` (public, 1125×621) and `IMG_1255.jpeg` (Garda, 1125×653), opened together with the implemented desktop screenshot in the same comparison input.
- Reused source imagery: [public scene](assets/heroes/public-1600.webp) and [Garda scene](assets/heroes/garda-1600.webp). The user requested horizontal opposition and overlap on every device, with a cloud of small bricks in the established palette.
- Browser-rendered desktop evidence: [desktop capture](docs/visual/brick-cloud-desktop.jpg), 1363×936 CSS viewport, 1348px content width excluding scrollbar; captured at device scale 1. The screenshot includes the full hero region, and the source scenes were compared as content regions, not as whole-page designs. The source screenshots have surrounding margins and much larger baked-in controls; the implementation uses existing translated live links at the site's established type scale.
- Browser-rendered mobile evidence: [enlarged Irish phone review](docs/visual/brick-cloud-phone-large.jpg), a 1363×936 browser viewport containing real 320px, 390px and 568px iframe viewports, each 800px high, at device scale 1. Each frame is scrolled to the same hero/control region. Reading settings: Gaeilge, 150% text and increased spacing. These are browser viewport checks, not physical handset tests.
- State: homepage with an existing fictional saved encounter. Both supplied characters retain matching cream/brown skin tones; no source image pixel edits were made.

## Findings and fixes

1. **P1, fixed:** initial enlarged Irish labels obscured the main characters. Small-screen role links now occupy one shared row above the images, with their full text visible and at least 48px touch height.
2. **P2, fixed:** independent button rows put the two photos at different heights when one label wrapped. A shared CSS grid keeps both photos on the same row, regardless of control height. Only non-semantic wrappers use `display:contents`; both real anchor elements retain native link semantics.
3. **P2, fixed:** the initial narrow-screen cloud was too small to read as the overlap. Its proportional width now scales independently on small screens, with visible bricks and clear principal faces.
4. **P2, fixed:** long labels could touch, and tall pill corners reduced the readable area. Mobile controls now have a capped width, sufficient separation and gentler rounded corners.

The final phone capture was taken after all four fixes. No actionable P0/P1/P2 visual issues remain in the reviewed states.

## Required fidelity surfaces

- **Typography:** existing locally hosted Open Sans, weight and role labels retained. Labels wrap within their buttons; spacing and 150% Irish text were reviewed at narrow widths.
- **Layout:** one horizontal scene row at every width, with an actual overlap of one of thirteen grid tracks. Desktop controls sit over the images; small-screen controls share a separate top row. Character galleries reflow independently. Main faces remain visible.
- **Colour:** existing public teal and Garda blue controls, white surrounding canvas, mint/pale blue/ivory mosaic bricks with limited muted terracotta. Existing role palette and logo colours retained.
- **Image quality:** original responsive WebP scenes are reused; the cloud is a generated raster with genuine alpha, supplied in 768px and 480px variants. Its background is transparent, with no artificial rectangle, CSS artwork or masks. The cloud is not stretched and cannot intercept clicks.
- **Content:** role names, learning text, routes and character names remain real HTML. A role heading identifies each character gallery after the scenes are grouped. Existing gameplay content and skin colours are unchanged.

## Interaction and verification

- Both desktop role links opened the correct setup; keyboard Enter opened the public setup.
- The cloud is decorative (`alt=""`, `aria-hidden="true"`, `pointer-events:none`).
- No application console errors were found for the local preview. Unrelated browser-extension metadata messages were excluded.
- All 88 game tests and the JavaScript syntax checks passed.
- The existing browser suite now asserts horizontal scene alignment, real overlap, cloud loading/centring, non-overlapping controls, text containment and minimum touch targets across its Chromium/Firefox/WebKit viewport matrix. CI verification is a separate deployment gate.

## Follow-up limitations

Physical devices, obsolete browser versions and a complete screen-reader session have not been tested in this change. No all-browser or all-device guarantee is claimed.

final result: passed
