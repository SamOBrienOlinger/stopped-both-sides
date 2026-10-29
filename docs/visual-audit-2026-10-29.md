# Visual audit and artwork repairs · 29 October 2026

Reviewed all six scene backgrounds, both homepage illustrations, the character sheets and their use across all 59 stages. The review covered composition, object placement, scale, cutout edges, caption collisions and Irish context.

## Repairs

| Finding | Coverage | Resolution |
| --- | --- | --- |
| Loose objects used as oversized floor overlays | 7 phone, 5 bag, 13 notebook, 15 forms, 2 toolbox and 3 laptop scenes | Removed all 45 loose overlays from the shared renderer and its scene directions. The written scenario retains every relevant fact. |
| Coloured fringe and background remnants on character cutouts | Listening, speaking and reflecting atlases; Aisling's dedicated four-pose atlas | Cleaned through built-in image editing, preserving figure identities, poses, wardrobe, wheelchair and cane. New alpha-preserving WebP assets use `-clean` filenames. |
| Location labels could overlap hair at narrow widths | Every illustrated stage, feedback preview and recap | Moved the label into its own bar above the artwork. |
| Heavy oval shadows under composited figures | Every character pair | Reduced shadow width, height and opacity. |
| Red British telephone box in the street background | Every use of `street.webp` | Removed it completely and replaced the generic distant streetscape with Dublin landmarks. |
| Generic outdoor landmarks and lamp silhouettes | Street, bus stop, square and both homepage perspectives | Added the GPO and Spire, Ha'penny Bridge and lamps informed by O'Connell Bridge references. Corrected extra generated statues and removed generic skylines from shelter posters. |

The three indoor backgrounds (station, advice room and meeting room) were visually inspected. Their neutral furnishings, abstract wall art and windows contain no identified British-specific landmarks, telephone boxes, postboxes, flags or transit symbols. They remain unchanged.

These are fictional, stylised learning illustrations using recognisable Dublin features, not a claim of a surveyed camera location or an exact streetscape reconstruction. Landmark identity and characteristic forms were checked against the references below.

## Sources used for the Irish setting

- [GPO · National Inventory of Architectural Heritage](https://www.buildingsofireland.ie/ga/building-of-the-month/the-general-post-office-oconnell-street-dublin-1/)
- [GPO · Visit Dublin](https://www.visitdublin.com/general-post-office)
- [Spire · Visit Dublin](https://www.visitdublin.com/the-spire)
- [Ha'penny Bridge · National Inventory of Architectural Heritage](https://www.buildingsofireland.ie/buildings-search/building/50060550/hapenny-bridge-liffey-bridge-dublin-co-dublin)
- [O'Connell Bridge and lamp standards · National Inventory of Architectural Heritage](https://www.buildingsofireland.ie/buildings-search/building/50060552/oconnell-bridge-dublin-1-2-dublin)
- [O'Connell Street conservation area · Dublin City Council](https://www.dublincity.ie/sites/default/files/media/file-uploads/2018-05/01_O_Connell_Street_ACA__adopted_09.07.01.pdf)
- [Photographic lamp reference](https://media.belvederehoteldublin.com/image/upload/f_auto%2Cg_auto%2Cc_auto%2Cw_3840%2Cq_auto/v1709209511/Uploads/Belvedere/O_Connell_Street_Bridge_Dublin_fb7cef8a65.jpg)

Reference photographs were used to guide architecture and street furniture; they are not shipped as site assets.

## Production assets

- `assets/scenes/{listening,speaking,reflecting}-clean.webp`
- `assets/characters/aisling-hijab-clean.webp`
- `assets/scenes/{street,bus-stop,square}.webp`
- `assets/heroes/{public,garda}-{480,960,1600}.webp`

All edits used the built-in OpenAI image-generation tool. Final assets were converted to WebP; no image generation occurs during play. Responsive hero variants are produced from the same approved image for each perspective.

## Final GPO detail refinement

Use case: precise-object-edit. Image 1 is the illustration to edit. Image 2 is the GPO architectural reference. Fix ONLY the missing THIRD rooftop statue on the right-hand end of the GPO's triangular pediment, at about 66% across and 30% down image 1, above and behind the Garda's head. The roof needs exactly three statues: existing left corner figure, existing central apex figure, and restore one matching stone figure on the right corner at the same baseline/scale as the left one. Do NOT put a statue on the distant far-right roof wing. Keep ALL other pixels as unchanged as possible: characters' faces, hair, bodies, uniforms, backpack, positions, hands, poster with leaves, Dublin lamps, Spire, bus, buildings, lighting, proportions and framing. Preserve polished brick-toy illustration style. No text, no red phone boxes, no postboxes, no British landmarks.

## Validation

- Visually reviewed all 59 illustrated stages with rotating cast members covering all 18 character choices.
- Reviewed street and private-advice layouts at 320px and 390px, including the cane, wheelchair and Aisling.
- Existing scene coverage renders every stage with all 81 public/Garda character pairs.
- Regression coverage rejects loose prop markup and checks that setting labels remain above the picture at phone, tablet and desktop widths.
- Learning content, choices, scores, character IDs and saved-progress contracts are unchanged.

## Character cleanup prompt

For each of the listening, speaking and reflecting atlases and Aisling's dedicated atlas:

> Repair the cutout quality only. Remove coloured halos, stray pixels, opaque fringe and old background remnants. Preserve every character's identity, skin colour, hair, wardrobe, pose, wheelchair, cane and accessories. Retain the exact grid, position, size and baseline. Keep full figures inside their cells. Produce real transparent alpha with clean anti-aliased edges, including gaps between limbs and wheelchair spokes. Do not add shadows, ground, scenery, text or labels.

## Irish background prompt set

### street

Use case: precise-object-edit. Production background repair for Stopped: Both Sides, an Irish educational website.
Image 1 is the edit target; reference 2 is the real Irish landmark for its actual architecture only; reference 3 shows actual Dublin O'Connell Bridge lamps for their shape only. Render everything in the existing polished miniature brick/toy style of image 1, not photographic cutouts.
Replace the red British telephone box completely with ordinary Dublin shopfront/paving. Rework the distant end of the street to show the recognisable granite GPO with its SIX-column portico and triangular pediment, and ONE slender silver Spire rising into the sky beside it. Replace existing generic single gas lamps with dark green Dublin O'Connell Bridge-style ornate three-lantern lamp standards based on reference 3. Retain the close red-brick shop facade on the left and warm evening atmosphere. Keep the bottom 45 percent broad empty level pavement and all furniture near the edges or in the distance. No characters or people.
Setting: unmistakably Dublin, Republic of Ireland. No red telephone boxes, no red postboxes, no London buses, no London Underground signs, no British flags, no Big Ben, no Tower Bridge, no English landmark substitutes. Do not merely recolour a British phone box; remove it. No readable invented signage, no watermarks, no added interface text.
Keep the original 16:9 landscape framing, lighting quality and coherent scale. Architecture, lamp poles and perspective must be straight and consistent, no warped bridges or floating objects. Keep all primary characters unchanged where present.

### bus-stop

Use case: precise-object-edit. Production background repair for Stopped: Both Sides, an Irish educational website.
Image 1 is the edit target; reference 2 is the real Irish landmark for its actual architecture only; reference 3 shows actual Dublin O'Connell Bridge lamps for their shape only. Render everything in the existing polished miniature brick/toy style of image 1, not photographic cutouts.
Keep the Dublin bus shelter on the left and a yellow-and-blue Dublin-style double-decker bus in the middle distance. Replace the generic church spire and distant nondescript facade with the recognisable grey granite Dublin GPO with SIX-column portico and triangular pediment, and ONE thin silver Spire beside it. Replace the generic single gas lamps with dark green Dublin ornate three-lantern standards from reference 3. Keep the bottom 45 percent broad empty pavement, no objects blocking the space where characters will be placed. No people or characters.
Setting: unmistakably Dublin, Republic of Ireland. No red telephone boxes, no red postboxes, no London buses, no London Underground signs, no British flags, no Big Ben, no Tower Bridge, no English landmark substitutes. Do not merely recolour a British phone box; remove it. No readable invented signage, no watermarks, no added interface text.
Keep the original 16:9 landscape framing, lighting quality and coherent scale. Architecture, lamp poles and perspective must be straight and consistent, no warped bridges or floating objects. Keep all primary characters unchanged where present.

Refinement:

Use case: precise-object-edit. Image 1 is the edit target. Image 2 is a factual reference for the GPO's three rooftop statues, not a style reference. Make only these precision corrections to the existing polished miniature brick/toy illustration: 1. The GPO must have exactly THREE rooftop statues, as shown in image 2: one on the central apex and one on each end of the triangular pediment. Remove every extra statue behind or outside these three. Preserve its six-column portico. 2. Replace the thick silver tower at right with a much more slender elegant silver needle representing the Spire of Dublin; no horizontal bands, base width less than half the width of one GPO column. 3. Remove the small human-shaped reflection/figure inside the bus shelter: shelter and pavement must be empty. 4. Replace the ENTIRE shelter poster artwork with a simple abstract teal leaf motif on cream, no city skyline, no towers, no text. Keep the composition, colour, lighting, aspect ratio and all other objects unchanged. This is Dublin, Ireland: no British phone boxes, red postboxes, London symbols, Big Ben or Tower Bridge. No watermarks or UI text.

### square

Use case: precise-object-edit. Production background repair for Stopped: Both Sides, an Irish educational website.
Image 1 is the edit target; reference 2 is the real Irish landmark for its actual architecture only; reference 3 shows actual Dublin O'Connell Bridge lamps for their shape only. Render everything in the existing polished miniature brick/toy style of image 1, not photographic cutouts.
Rework the setting into a quiet Dublin quayside public space. Keep the cafe at the left edge, inviting brick-built miniature style and generous clear level pavement across the bottom 45 percent. Replace the generic tall statue/column and central planter at the back with a view across the River Liffey to the unmistakable WHITE Ha'penny Bridge: ONE shallow elegant cast-iron arch and fine railings, with its own decorative overarching lamp standards as in reference 2. Keep the water behind a safe continuous stone quay parapet in the back half of the composition. Add a dark green ornate Dublin three-lantern street lamp at the edge, based on reference 3. No people, no figures, no objects scattered on the foreground. Keep the bridge at believable background scale.
Setting: unmistakably Dublin, Republic of Ireland. No red telephone boxes, no red postboxes, no London buses, no London Underground signs, no British flags, no Big Ben, no Tower Bridge, no English landmark substitutes. Do not merely recolour a British phone box; remove it. No readable invented signage, no watermarks, no added interface text.
Keep the original 16:9 landscape framing, lighting quality and coherent scale. Architecture, lamp poles and perspective must be straight and consistent, no warped bridges or floating objects. Keep all primary characters unchanged where present.

### public-hero

Use case: precise-object-edit. Production background repair for Stopped: Both Sides, an Irish educational website.
Image 1 is the edit target; reference 2 is the real Irish landmark for its actual architecture only; reference 3 shows actual Dublin O'Connell Bridge lamps for their shape only. Render everything in the existing polished miniature brick/toy style of image 1, not photographic cutouts.
EDIT ONLY THE BACKGROUND, preserve the two foreground characters exactly: curly red-brown hair, black spectacles, orange jacket and teal backpack on the public character, dark-haired Garda with navy uniform and high visibility vest. Preserve their identities, poses, sizes, positions and opposite-view composition. Preserve brick-toy material and warm daylight. Replace the generic distant church tower with the unmistakable grey granite GPO six-column portico and triangular pediment, and ONE thin silver Dublin Spire nearby. Replace generic black gas street lamps with dark green Dublin ornate three-lantern lamp standards as in reference 3. Keep the shelter and yellow-and-blue Dublin-style double-decker bus with coherent perspective and scale. Do not place new objects in their hands or on the foreground.
Setting: unmistakably Dublin, Republic of Ireland. No red telephone boxes, no red postboxes, no London buses, no London Underground signs, no British flags, no Big Ben, no Tower Bridge, no English landmark substitutes. Do not merely recolour a British phone box; remove it. No readable invented signage, no watermarks, no added interface text.
Keep the original 16:9 landscape framing, lighting quality and coherent scale. Architecture, lamp poles and perspective must be straight and consistent, no warped bridges or floating objects. Keep all primary characters unchanged where present.

Refinement:

Use case: precise-object-edit. Image 1 is the edit target. Image 2 is a factual reference for the GPO's three rooftop statues, not a style reference. Make only these precision corrections to the existing polished miniature brick/toy illustration: Replace ONLY the bus shelter poster at far left with a simple abstract teal leaf motif on cream. Remove the city skyline/towers from the poster completely. No text. Preserve the three-statue GPO, Spire, all lamps and ALL characters exactly; their faces, bodies, outfits, hands, positions and expressions must not change. Keep the composition, colour, lighting, aspect ratio and all other objects unchanged. This is Dublin, Ireland: no British phone boxes, red postboxes, London symbols, Big Ben or Tower Bridge. No watermarks or UI text.

### garda-hero

Use case: precise-object-edit. Production background repair for Stopped: Both Sides, an Irish educational website.
Image 1 is the edit target; reference 2 is the real Irish landmark for its actual architecture only; reference 3 shows actual Dublin O'Connell Bridge lamps for their shape only. Render everything in the existing polished miniature brick/toy style of image 1, not photographic cutouts.
EDIT ONLY THE BACKGROUND, preserve the two foreground characters exactly: curly red-brown hair, orange jacket and teal backpack on the public character viewed from behind at left; dark-haired female Garda facing us at right, navy uniform and high visibility vest. Preserve their faces, hair, identities, poses, sizes, positions, and opposite-view composition. Preserve brick-toy material and warm daylight. Replace the generic distant church tower with the unmistakable grey granite GPO six-column portico and triangular pediment, and ONE thin silver Dublin Spire nearby. Replace generic black gas street lamps with dark green Dublin ornate three-lantern lamp standards as in reference 3. Keep the shelter and yellow-and-blue Dublin-style double-decker bus with coherent perspective and scale. Do not place new objects in their hands or on the foreground.
Setting: unmistakably Dublin, Republic of Ireland. No red telephone boxes, no red postboxes, no London buses, no London Underground signs, no British flags, no Big Ben, no Tower Bridge, no English landmark substitutes. Do not merely recolour a British phone box; remove it. No readable invented signage, no watermarks, no added interface text.
Keep the original 16:9 landscape framing, lighting quality and coherent scale. Architecture, lamp poles and perspective must be straight and consistent, no warped bridges or floating objects. Keep all primary characters unchanged where present.

Refinement:

Use case: precise-object-edit. Image 1 is the edit target. Image 2 is a factual reference for the GPO's three rooftop statues, not a style reference. Make only these precision corrections to the existing polished miniature brick/toy illustration: 1. The GPO must have exactly THREE rooftop statues, as shown in image 2: one on the central apex and one on each end of the triangular pediment. Remove the extra statue on the far-right roof away from the triangular pediment. Preserve its six-column portico and all other architectural details. 2. Replace ONLY the bus shelter poster at far left with a simple abstract teal leaf motif on cream. Remove its city skyline and towers completely, no text. Preserve ALL characters exactly; their faces, bodies, outfits, hands, positions and expressions must not change. Keep the composition, colour, lighting, aspect ratio and all other objects unchanged. This is Dublin, Ireland: no British phone boxes, red postboxes, London symbols, Big Ben or Tower Bridge. No watermarks or UI text.

