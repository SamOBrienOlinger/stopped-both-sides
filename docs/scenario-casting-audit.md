# Scenario casting audit · 27 November 2026

## Scope and casting decision

The audit covers all **34 shared situations and 99 stages**, including their
public and Garda perspectives, original practice versions, selection previews,
supporting characters, character controls and recaps. The inventory comes from
[`encounters/catalog.mjs`](../encounters/catalog.mjs); the narrative sources are
[`data.mjs`](../data.mjs), [`garda/data.mjs`](../garda/data.mjs),
[`encounters/counterparts.mjs`](../encounters/counterparts.mjs),
[`encounters/discrimination.mjs`](../encounters/discrimination.mjs) and
[`encounters/colleague-discrimination.mjs`](../encounters/colleague-discrimination.mjs).

The site owner requested White Garda characters in the racism situations. This
is an **author-directed casting choice for these fictional teaching scenes**.
The selected existing portraits are **Garda Rory (`garda-2`), Garda Jamie
(`garda-3`) and Garda Orla (`garda-8`)**. The rule covers ten situations and
30 stages: explicit racial comparisons and profiling, anti-Traveller prejudice,
and the colleague's response to anti-Muslim abuse. It applies to every Garda
shown in those scenes, including the responding or witnessing Garda and any
supporting colleague.

This choice does not make a general claim about the identities of people who
commit or experience discrimination. Irish nationality, a person's name,
Traveller membership, religion or lack of religion do not independently select
a public character's skin tone. The audit retains explicit authored Black and
White story figures where the text requires them. It does not infer a visible
appearance for autism, Deafness, civil status, parenthood or receipt of housing
assistance.

## Complete situation inventory

“White trio” means the three Garda portraits above. “Full roster” means no new
Garda restriction; existing role requirements still apply.

### Original situations: 14 situations, 59 stages

| Situation ID | Exact title | Garda casting | Public identity and audit outcome |
| --- | --- | --- | --- |
| `public-street` | Stopped on the street | Full roster | Alex in authored practice; selectable identity in shared play. No explicit ethnicity, age or gender restriction. |
| `public-search` | Asked to open your bag | Full roster | Niamh in authored practice; selectable identity in shared play. No ethnic requirement. |
| `public-arrest` | Told you are under arrest | Full roster | Daniel in authored practice; selectable identity in shared play. No ethnic requirement. |
| `public-custody` | Understanding the station | Full roster | Maya in authored practice; selectable identity in shared play. Difficulty with legal English does not require a particular ethnicity. |
| `public-young-person` | You are sixteen | Full roster | Fixed sixteen-year-old Jamie throughout. The stated age remains visible; this story contains no explicit racial comparison. |
| `public-fair-treatment` | “Why was I singled out?” | **White trio** | Fixed Amina, explicitly a Black Irish woman. Preserve her identity through the initial contact and separate reflections. |
| `garda-street` | A hunch on the street | **White trio** | The final `street-identity` stage explicitly compares Black Irish and White Irish Alex with other facts held constant. Keep the Garda consistent across the route. |
| `garda-description` | “Matches the description” | **White trio** | Amina matches the initial broad description of a Black woman in a dark jacket. Only `description-power` introduces a different person matching the fuller description. Supporting colleague must also use the trio. |
| `garda-search` | Grounds for a drug search | Full roster | Niamh in authored practice; selectable identity in shared play. No ethnic requirement in the specific or general variations. |
| `garda-communication` | When behaviour is misread | Full roster | Maya is described as autistic. Preserve the authored facts without treating autism as a visible demographic feature. |
| `garda-young-person` | A young person, an adult assumption | **White trio** | Fixed tall Black Irish sixteen-year-old Jamie initially; fixed White Irish Jamie at `young-review`. Both the playable Garda and the supporting colleague follow the trio. |
| `garda-colleague` | “We know that family” | **White trio** | Patrick is an Irish Traveller subjected to family profiling. Preserve that narrative identity; it does not impose a skin-tone restriction on the public role. Both Garda roles follow the trio. |
| `garda-new-evidence` | When the facts change | Full roster | Daniel in authored practice; selectable identity in shared play. No ethnic requirement. |
| `garda-supervision` | What the numbers leave out | Existing sergeant roster | The officer must be a supervising sergeant: Ciara (`garda-1`), Kai (`garda-6`) or Charlie (`garda-9`). The community groups in this data exercise have no stated racial identities. |

### Discrimination situations: 20 situations, 40 stages

Each of these situations has `opening` and `follow-up` stages. In colleague
situations the public player is a **witness**, while a separate supporting
character is the person affected. The playable Garda is a **witnessing Garda**;
the colleague whose conduct is challenged is a separate character.

| Situation ID | Exact title | Garda casting | Public identity and audit outcome |
| --- | --- | --- | --- |
| `discrimination-gender` | Gender | Full roster | The affected participant is a woman. Retain the existing women portrait choices and a distinct male participant offered her place. |
| `discrimination-colleague-gender` | Gender: talking over a complainant | Full roster | Keep the affected woman and her male companion separate from both witnesses. |
| `discrimination-civil-status` | Civil status | Full roster | Divorced customer and second adult ticket holder. No appearance restriction follows from civil status. |
| `discrimination-colleague-civil-status` | Civil status: a report written off | Full roster | Separated person making a report. No appearance restriction follows from civil status. |
| `discrimination-family-status` | Family status | Full roster | Adult parent applying for a course. Do not add an accompanying child when the account does not place one there. |
| `discrimination-colleague-family-status` | Family status: a parent turned away | Full roster | Separate parent and dedicated seven-year-old child; keep their roles distinct from the public witness. |
| `discrimination-sexual-orientation` | Sexual orientation | Full roster | Retain the existing same-sex partner selection and distinct partner portrait. |
| `discrimination-colleague-sexual-orientation` | Sexual orientation: blaming the couple | Full roster | The affected person and partner are explicitly two women. The witness remains independently selectable. |
| `discrimination-age` | Age | Full roster | The affected applicant is 67. Retain the older public portrait pool. |
| `discrimination-colleague-age` | Age: an account dismissed as confusion | Full roster | The affected person is 72. Retain the older supporting portrait pool; do not apply it to the witness. |
| `discrimination-religious-belief` | Religious belief | Full roster | Applicant has no religion. No ethnicity, religious clothing or complexion is specified. |
| `discrimination-colleague-religious-belief` | Religious belief: a report brushed aside | **White trio** | An adult reports anti-Muslim abuse after leaving a mosque. Include the Garda roles in the author's casting rule; the affected adult has no specified ethnicity or clothing requirement. |
| `discrimination-traveller-community` | Traveller community | **White trio** | Traveller resident refused a community-room booking. Preserve Traveller identity in the text without assigning it a visual stereotype. |
| `discrimination-colleague-traveller-community` | Traveller community: a colleague prejudges the report | **White trio** | Separate Traveller complainant, public witness, acting Garda and witnessing Garda. Both officers follow the trio. |
| `discrimination-race` | Race | **White trio** | Irish spectator singled out because of an accent. Nationality and accent do not dictate complexion. The dedicated ticket steward already matches the authored White adult staff character. |
| `discrimination-colleague-race` | Race: a colleague singles someone out | **White trio** | The affected person is explicitly a Black adult. Keep `support-race-adult`; both acting and witnessing Garda follow the trio. The public witness remains independently selectable. |
| `discrimination-disability` | Disability | Full roster | Deaf person makes a report and uses a written message. No new visible-disability or ethnic restriction is justified. |
| `discrimination-colleague-disability` | Disability: communication support refused | Full roster | Separate Deaf adult requesting an ISL interpreter and public witness. Deafness does not determine skin tone or mobility equipment. |
| `discrimination-housing-assistance` | Housing assistance | Full roster | Applicant receives HAP. Income assistance does not determine a portrait. |
| `discrimination-colleague-housing-assistance` | Housing assistance: a colleague takes sides | Full roster | Separate applicant, letting agent and witnesses. No demographic appearance requirement is stated. |

## Fixed story figures and stage transitions

The visual audit checked the actual transparent character assets, including the
alternate Garda speaking pose. These existing story figures already match their
authored requirements and remain in use:

| Situation and stages | Figure | Required consistency |
| --- | --- | --- |
| `public-fair-treatment`, all stages; `garda-description`, `description-start`, `description-repair`, `description-detail` | `story-amina` | Black woman in a dark jacket; no yellow jacket panel or bicycle. |
| `garda-description` / `description-power` | `story-other-person` | A separate Black woman wearing a dark jacket with a yellow panel; the scene adds the red bicycle. Earlier recaps still show Amina. |
| `public-young-person`, all stages; `garda-young-person`, `young-start` and `young-contact` | `story-jamie` | The authored Black teenage Jamie, with the stated age of sixteen preserved. |
| `garda-young-person` / `young-review` | `story-jamie-comparison` | White teenage Jamie with matching clothing and pose for the explicit comparison. |
| `garda-street` / `street-identity` | `story-alex-comparison` | Both Black and White versions of Alex, with matching clothing, glasses, bag and pose. |
| `discrimination-colleague-race`, both stages | `support-race-adult` | Dedicated Black adult with backpack; never replaced by the selectable public witness. |
| `discrimination-colleague-family-status`, both stages | `support-child` | Dedicated child aged seven, separately scaled and identified. |

The definitions are in [`encounters/story-cast.mjs`](../encounters/story-cast.mjs)
and [`encounters/supporting-characters.mjs`](../encounters/supporting-characters.mjs).
`fixedStoryCharacter` resolves the figure by stage. A separately labelled
learner avatar can remain different from a fixed story character; it does not
replace that character in the scene. [`encounters/ui.mjs`](../encounters/ui.mjs)
provides this distinction and uses the stage-specific figure in cast details.

Existing women choices are `public-4`, `public-2`, `public-6`, `public-7` and
`public-10`. Older choices are `public-9`, `public-3` and `public-6`. The role
allocations, same-sex partner choices and supporting participants remain defined
in [`encounters/situation-cast.mjs`](../encounters/situation-cast.mjs).

## Casting safeguards and saved links

[`encounters/characters.mjs`](../encounters/characters.mjs) holds the ten-context
`whiteGardaSituations` set and three-entry `whiteGardaPortraits` list.
`charactersForSituation` supplies eligible portraits;
`castForSituation` preserves an eligible stored selection or selects Rory
deterministically. `changeCharacter` and `storyCastOptions` use the same rule.
Unrelated situations and global character preferences keep their existing
selection behaviour.

[`encounters/engine.mjs`](../encounters/engine.mjs) already routes new encounters,
decoded shared links and original-practice conversion through
`castForSituation`. Correcting an incompatible stored portrait therefore keeps
the current stage, answers and history. The reported link to
`discrimination-colleague-race` retains public witness `public-8`; its witnessing
Garda changes from `garda-6` to `garda-2`, and the acting Garda is a distinct
eligible colleague. The Black affected adult remains a separate participant.

Supporting officers must follow the same eligibility rule:

- `situationParticipants` selects the `acting-garda` from
  `charactersForSituation(id, 'garda')`, reserving the playable officers' IDs.
  Allocations are made before stage filtering, so identities remain stable
  between the opening and follow-up.
- `originalSceneDetails` applies the eligible Garda pool to the supporting
  colleague in `garda-young-person` (all three stages), `garda-colleague`
  (the first three stages), and `garda-description` / `description-repair`.
  It continues to reserve both displayed story identities and stored avatars,
  preventing a selected character from reappearing as a bystander.
- [`encounters/group-staging.mjs`](../encounters/group-staging.mjs) can use Rory's
  registered speaking pose from `group-speaking-gardai.webp`. That pose retains
  Rory's identity. Jamie and Orla use their existing individual uniform sprites.

Previews, live scenes, separate reflection panels and recap illustrations share
[`encounters/scenes.mjs`](../encounters/scenes.mjs). Both website editions use
these modules. Verification should cover every eligible Garda, incompatible
old casts, both playable perspectives, supporting-officer distinctness, stage
transitions, restored answers, recaps and original-practice transfers. Existing
coverage for fixed story figures, age, gender, sergeant rank and dedicated
supporting people must continue to pass.
