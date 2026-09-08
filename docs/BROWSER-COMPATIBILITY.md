# Browser and responsive design

The support target is current Chrome, Edge, Firefox and Safari on desktop, and current Android and iOS browsers. No finite test suite can establish support for every browser version, embedded webview, device or assistive-technology combination.

## What is implemented

- A shared mobile-first layout starts with one column and expands to two or three columns where space permits. Both perspectives load the same layout rules.
- Text and controls wrap instead of forcing horizontal scrolling. Enlarged text, Irish content and long headings are included in the checks.
- Navigation and primary controls have at least 44 CSS pixel targets. Browser zoom remains enabled; reading preferences supplement it.
- Hero perspective links stay centred near the top of their images, with at least 48px height. The images stack below 900px and use two columns on wider screens. Browser checks measure alignment, containment and image loading in English and enlarged Irish text.
- The character picker reflows from two to five columns. Controls use keyboard focus, pressed states and Irish labels. Tests cover character changes during feedback and recap, stable random counterparts, reload and transfer between sites.
- Safe-area padding protects controls on displays with cutouts. The reading dialog uses dynamic viewport height with a conventional viewport-height fallback for short landscape screens and older browsers.
- Native dialogs are preferred, with explicit Tab/Shift+Tab wrapping and focus restoration. Browsers without native modal methods get a backdrop, keyboard containment, Escape/close controls and background accessibility isolation.
- Progress copying and property checks do not require `structuredClone` or `Object.hasOwn`. Existing learning records remain readable; encounter links now include validated character IDs and still accept older links.
- Blocked browser storage allows play and reading preferences for the current visit. No browser extension or third-party runtime service is required.

## Reproducible browser checks

[Browser compatibility](../.github/workflows/browsers.yml) runs Playwright in three independent jobs: **Chromium, Firefox and WebKit**. Chromium provides coverage of the engine used by Chrome and Edge; WebKit tests are useful Safari-engine coverage, not a substitute for running shipping Safari on Apple hardware.

Branch and pull-request runs exercise both entry points under `/stopped-both-sides/` on a temporary server, matching the GitHub Pages project path. On `main`, successful game checks trigger the browser workflow, which waits for that exact commit's Pages publication before running the same suite against the live address. It checks:

| Coverage | Cases |
| --- | --- |
| Phone portrait | 320 × 568 and 390 × 844 CSS pixels |
| Short landscape | 568 × 320 CSS pixels |
| Tablet | 768 × 1024 and 1024 × 768 CSS pixels |
| Desktop | 1366 × 768, 1920 × 1080 and 2560 × 1440 CSS pixels |
| Touch and rotation | 390 × 844 portrait and 844 × 390 landscape; touch-enabled contexts |
| Reading settings | 150% text, increased spacing, high contrast, English/Gaeilge and dialog keyboard use |
| Main journeys | Home, recommended start, optional character picker, keyboard catalogue access, original practice and feedback, shared play, other-side switching, reload, recap, progress and reference pages |
| Compatibility fallback | Missing clone/property/modal APIs and blocked storage simulated in each engine |

The 78 browser checks cover page overflow, clipped text, dialog bounds and navigation target sizes. Functional assertions check choices, preserved answers, language, saved state and completion. Tests fail on page errors or missing local assets. Failure reports include screenshots and traces, retained by GitHub Actions for seven days.

To run the browser suite:

```bash
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
```

Playwright is a development dependency. Playing or publishing this static site still requires no installation or compilation. The existing Node checks remain available without installing Playwright:

```bash
npm run check
npm test
```

To run the same browser suite against the live deployment, set `TEST_BASE_URL` to the published project URL. For a Bash-compatible shell:

```bash
TEST_BASE_URL=https://samobrienolinger.github.io/stopped-both-sides/ npm run test:browser
```

Tests create isolated browser contexts with fictional choices. They do not submit complaints, contact external source publishers or collect real incident details.

## Review findings and limits

The initial browser run reproduced horizontal overflow on the public About page at 320 CSS pixels with enlarged text, reverse-Tab focus escaping the reading dialog in Chromium, and unavailable shared play when newer clone/property APIs were removed. The fixes address those failures and retain the checks as regressions. See the [workflow history](https://github.com/SamOBrienOlinger/stopped-both-sides/actions/workflows/browsers.yml) for results tied to a specific commit.

Mobile emulation and engine tests do not certify every physical phone or tablet. Shipping Safari, manufacturer-specific Android browsers, browser chrome/keyboard behaviour, physical-device zoom, VoiceOver, TalkBack, NVDA/JAWS and testing with disabled users remain separate review work. Older browsers without JavaScript modules or modern JavaScript syntax are outside the interactive game's support target; linked source publications remain available in the static page.

Both browser checks and Node checks run independently of GitHub Pages branch publishing. Review their results before moving a tested revision to `main`.

Reference: [Playwright browser coverage](https://playwright.dev/docs/browsers) and [CI setup](https://playwright.dev/docs/ci).
