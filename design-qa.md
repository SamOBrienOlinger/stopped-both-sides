# Option 2 homepage review

18 November 2026

## Visual evidence

The comparison used the English homepage with default reading settings and no saved game. The selected mockup and the Chromium desktop capture are both 1536 × 1024 pixels. The browser viewport was 1536 × 1024 CSS pixels at device scale 1. The [comparison](../../option-2-qa/desktop-comparison.png) places the mockup on the left and the rendered site on the right at half scale. Both full frames include the entire introduction, so the comparison needed no cropped view.

- [Selected mockup](../../generated_images/exec-18cadc31-89a0-43ba-96d9-89fbc8ff7a8c.png)
- [Rendered desktop](../../option-2-qa/chromium-final/approved-shell-public-the--f475d-blin-encounter-illustration-chromium/approved-landing-public-1536.png)
- [Rendered phone at 390 × 844](../../option-2-qa/chromium-final/approved-shell-public-the--f475d-blin-encounter-illustration-chromium/approved-landing-public-390.png)

The existing navigation and page width frame the new two-column desktop layout. The heading uses the locally hosted site font and fits on two lines at both captured sizes. The teal and Garda blue controls share the same width and visual weight. The illustration uses the full existing 16:9 scene and responsive WebP sizes. The introduction and instruction remain selectable text. On phones, both role links precede the illustration.

## Findings

- **P2, resolved.** At 390px the initial heading broke “Two perspectives.” across two lines. The final layout adjusts type size to the available column width. The phone capture and the two-line test confirm the fix.
- **P2, resolved.** The existing high-contrast rule added a white panel underneath the new flush-left layout. The final hero keeps a transparent background, and high contrast leaves the two role choices visible while hiding the decorative artwork.

## Verification

The mouse and keyboard role links opened the matching setup on both homepages. Touch, portrait and landscape, high contrast, reduced motion, enlarged Irish text and 200% Arabic right-to-left text passed in the selected browser tests. The local browser checks covered both role links and found no application console errors. The two role links and both rendered layouts passed in Chromium, Firefox and WebKit. All 211 unit tests passed.

The scope covers the homepage and adjacent role selection, browsing, saved sessions, and play. Browser-emulated touch and viewport checks cover the mobile layouts.

The earlier overlap layout review remains in [the previous revision](https://github.com/SamOBrienOlinger/stopped-both-sides/blob/305a69451221ce20f857bf54a3754e9790a70428/design-qa.md).

final result: passed
