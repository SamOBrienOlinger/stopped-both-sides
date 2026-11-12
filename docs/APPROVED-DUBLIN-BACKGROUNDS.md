# Approved Dublin background integration

Branch: `uimproved`. The production `main` branch is not changed.

| Approved image | Placement |
| --- | --- |
| GPO and Spire crowd | Garda landing choice |
| River Liffey and Ha'penny Bridge | Public landing choice |
| Suburban bus shelter | Bus-stop encounters |
| Suburban terraced street | Street encounters |
| Quayside cafe and promenade | Community encounters |

The five originals were explicitly selected in the conversation. Their decoded RGB SHA-256 hashes and output hashes are recorded in `assets/dublin-approved/manifest.json`. Only resizing and WebP compression are applied; people, clothing and skin tones are not regenerated or recoloured. These are Dublin-inspired illustrations, not verified geographic reconstructions or factual transport diagrams.

All production images are local files in three responsive widths (480, 960, 1600). There is no runtime request to Google, Canva or an external image host. Full landscape compositions avoid cropping people or placing text on faces. Outdoor selectable characters use per-setting pavement anchors; their identities, selection controls, states and scores are unchanged. Mixed-location reflections stack on narrow screens. Indoor images and pure indoor compositions remain unchanged.

Validation: source pixel hashes; local-file and responsive-image unit checks; existing game tests; browser image loading, dimensions, pavement bounds and role-switch preservation. Browser screenshots accompany the integration workflow for visual inspection.
