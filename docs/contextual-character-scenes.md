# Characters within the encounter settings

The selected public and Garda characters now appear inside the illustrated
locations. Their identities remain tied to the saved cast, including during
replay, perspective changes and recaps. The label “Separate reflections” is no
longer rendered.

## Composition

- Street and bus-stop encounters put both characters on the foreground paving.
- Station encounters put both characters in the reception foreground.
- The supervision exercise includes both the supervising Garda and the community
  reviewer in the meeting room, as described by the scenario.
- Confidential advice and later independent notes use two location panels. Each
  character is inside their own setting; a Garda is never placed inside the
  public character's confidential consultation.
- Every character uses a calm, attentive stance. Choosing an answer does not
  invent another character's reaction or imply knowledge of undisclosed facts.
- No loose phone, medication, bag or other object is pasted onto a floor.
- Decisions remain before illustrations on phones. Character scale and floor
  clearance are proportional to the location, including in compact recaps.

## Asset

`assets/scenes/contextual-cast.webp` is a lossless, alpha-preserving WebP version
of the atlas created with the built-in image-generation tool. It contains all
18 characters in the established six-column, three-row order. Aisling's navy
hijab is included in her original cast position. Existing portrait controls
retain their original assets.

`encounters/scene-artwork.mjs` records the measured source boundaries and foot
positions. CSS crops each complete figure independently and aligns its feet or
wheels to a common floor, avoiding clipping caused by uneven atlas spacing.

The inputs were `assets/characters/cast.webp` for identities and ordering, and
`assets/characters/aisling-hijab-clean.webp` for Aisling's appearance.

Generation brief: preserve identities, wardrobe, skin tones, hair, glasses,
wheelchair and cane; use complete figures in equal square cells, with public
characters in the first three columns and Garda characters in the last three;
create calm conversational stances, relaxed arms and neutral expressions;
replace row 2, column 5 with the navy-hijab Garda; provide transparent alpha,
smooth edges and complete feet and assistive devices; omit scenery, text,
cell borders, loose objects and baked ground shadows. All 18 characters must
retain their original positions and consistent scale.

The backgrounds and homepage illustrations retain the Dublin imagery documented
in [the visual audit](visual-audit-2026-10-29.md).
