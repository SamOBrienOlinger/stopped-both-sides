# Interaction styling and motion

Both entrypoints use `assets/brand/enhancements.css` and
`accessibility/motion.mjs`. The changes adapt the INAR styling review to the
game's read, choose and reflect flow, using the existing public teal and Garda
blue palettes, typography and artwork.

## Where the cues apply

| Interaction | Presentation | Duration |
| --- | --- | --- |
| Start, advance or revisit a stage | Brief context surface cue and artwork fade | 200ms |
| Choose an answer | Feedback surface cue, selected label and border | 200ms |
| Switch perspective | Current-role toolbar and question surface cue | 200ms |
| Open the character picker | The complete picker settles by 4px, with every character available immediately | 280ms |
| Select a character | Selected card border and surface cue | 150ms |
| Reach the recap | Takeaway group cue, then each review card once as it enters the viewport | 280ms |
| Read information or sources | Each visible information/source group settles once per page during the visit | 280ms |
| Open an optional section | Native disclosure opens immediately, followed by a small surface movement | 280ms |
| Open language and reading settings | Dialog content surface cue after native or fallback opening | 200ms |
| Review completed situations | Brief outline cue around the actual overall progress value | 200ms |
| Hover, focus or press a control | Consistent colour, border, underline and focus treatment | 150ms |

Stage and remaining-decision labels stay together. The remaining range comes
from the branching engine; no fixed percentage is inferred for the current
situation. The overall progress element retains its real completed count out
of 14. Navigation keeps a stable header and a persistent current-page indicator.
Reference topic links identify the active location, including the containing
topic when an individual Garda evidence record is opened directly.

## Rendering rules

The apps replace the main view when a player chooses an answer, changes a
character or applies reading preferences. An unconditional entrance animation
would replay on all those redraws. The motion controller instead compares the
validated route, stage, role, answer and picker state. It runs at the end of
reading-tool decoration, after translation and character personalisation.

Cues are added on the next animation frame, after the existing synchronous
focus and scroll operations. All text and actions are visible and usable from
the first render. Only scene artwork fades; captions, headings and choices
remain opaque. Animation completion never advances the game, updates a score,
enables a button or moves focus. A short timeout removes the cue independently
of browser animation events.

Changing a language, text size, contrast, spacing or motion preference does
not replay the current stage or reset one-time reveals. Selecting a character
changes that card without reopening the picker. Switching roles at the same
stage preserves the shared scene and both answers. Native disclosure cues are
limited to summary activation, so a deep link or restored open section does
not masquerade as a new interaction.

IntersectionObserver provides the optional one-time reading cues. If it is
unavailable, the content retains its static presentation. The interactive game
still requires JavaScript, as described by the existing static fallback.

## Reading and accessibility

- Both `prefers-reduced-motion` and the site's Reduce motion setting suppress
  animations and transitions. A live system-preference change cancels cues.
- Forced-colour mode and printing use static surfaces, visible borders and
  native content. No interface depends on an animated colour difference.
- Logical spacing and borders follow Arabic direction. Static sprite placement
  and portrait cropping remain unchanged, including the fixed public/Garda
  positions in the artwork.
- Selected choices use a visible translated label as well as their existing
  `aria-pressed` state. Focus indicators and generous pointer targets apply
  across choices, character cards, filters, navigation and disclosures.
- Native details and native/fallback dialogs keep their existing semantics,
  immediate focus, keyboard handling and Escape behaviour. There are no fixed
  disclosure heights or clipped translated expansions.

The event cues deliberately stay short and local. There is no bounce, large
opposing slide, pronounced zoom, shrinking header, animated counter or delayed
scroll journey.

## Verification

`tests/browser/motion.spec.mjs` exercises actual rendered interactions in
Chromium, Firefox and WebKit. It records short-lived cues without relying on
animation duration for gameplay assertions. It covers stage and answer cues,
perspective continuity, preference and character redraws, native disclosure
restoration, original practice, and reduced-motion Arabic layouts at narrow
widths with 150% text. The existing browser suites cover the wider responsive,
translation, gameplay, character and compatibility matrix.

`tests/browser/motion-lifecycle.spec.mjs` checks continuity when individual
practice transfers to the shared game, one-time reading and recap cues,
unchanged progress during confirmation redraws, and live changes to the system
motion preference.

Run `npm test`, `npm run check` and `npm run test:browser` as documented in
[Browser compatibility](BROWSER-COMPATIBILITY.md). Automated checks and visual
inspection support this implementation; participant testing is still needed
to measure any improvement in comprehension or ease of use.
