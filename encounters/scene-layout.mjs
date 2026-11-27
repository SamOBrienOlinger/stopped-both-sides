/** Coordinates are physical panel percentages. x is the sprite-frame centre.
 * A frame includes transparent padding whose extent varies with each pose,
 * wheelchair and comparison illustration. Transparent frames may overlap;
 * measure the painted silhouettes and number badges to check separation.
 */
const anchor = (x, width, bottom) => Object.freeze({x, width, bottom});
const row = (width, bottom, centres) => Object.freeze(centres.map(x => anchor(x, width, bottom)));
const rows = (width, bottom) => Object.freeze({
  2: row(width, bottom, [30, 70]),
  3: row(width, bottom, [17, 50, 83]),
  4: row(Math.min(width, 27), bottom + 3, [14, 38, 62, 86]),
  5: row(Math.min(width, 25), bottom + 7, [13, 31.5, 50, 68.5, 87])
});
const profile = (artwork, publicAnchor, gardaAnchor, groups, solo = null) => Object.freeze({
  artwork, actors: Object.freeze({public: publicAnchor, garda: gardaAnchor}), groups, solo
});
const venue = (artwork, width, bottom) => profile(artwork,
  anchor(31, width, bottom), anchor(69, width, bottom), rows(width, bottom));
const room = (width, bottom) => profile(null,
  anchor(29, width, bottom), anchor(71, width, bottom), rows(width, bottom),
  // Portrait panels retain the full background height and crop its sides.
  // Scale by the panel-aspect-ratio change so the person keeps the same
  // height relative to the counter, chairs and doors in that background.
  Object.freeze({width: width * 20 / 9, wideWidth: width, bottom}));

export const SCENE_LAYOUTS = Object.freeze({
  // These pavements recede diagonally; a common baseline would put people
  // into the road or against the river wall. Width follows the same depth.
  street: profile('suburban-street', anchor(25, 28, 4), anchor(49, 24, 12), Object.freeze({
    2: Object.freeze([anchor(25, 28, 4), anchor(49, 24, 12)]),
    3: Object.freeze([anchor(18, 26, 3), anchor(43, 23, 12), anchor(65, 19, 24)]),
    4: Object.freeze([anchor(15, 25, 3), anchor(36, 22, 11), anchor(55, 19, 21), anchor(72, 16, 32)]),
    5: Object.freeze([anchor(13, 22, 3), anchor(32, 20, 10), anchor(49, 18, 19), anchor(64, 16, 29), anchor(78, 14, 39)])
  })),
  'bus-stop': profile('bus-stop', anchor(60, 26, 6), anchor(84, 24, 8), Object.freeze({
    2: Object.freeze([anchor(60, 26, 6), anchor(84, 24, 8)]),
    3: Object.freeze([anchor(41, 27, 4), anchor(65, 24, 10), anchor(87, 21, 15)]),
    4: Object.freeze([anchor(30, 26, 4), anchor(52, 25, 10), anchor(72, 22, 14), anchor(90, 19, 17)])
  })),
  square: profile('quayside', anchor(36, 28, 6), anchor(62, 28, 4), Object.freeze({
    2: Object.freeze([anchor(30, 28, 6), anchor(70, 28, 3)]),
    3: Object.freeze([anchor(17, 28, 6), anchor(50, 28, 4), anchor(83, 28, 1)]),
    4: Object.freeze([anchor(14, 27, 6), anchor(38, 27, 4), anchor(62, 27, 2), anchor(86, 27, 1)]),
    5: Object.freeze([anchor(13, 25, 6), anchor(31.5, 25, 4.5), anchor(50, 25, 3), anchor(68.5, 25, 2), anchor(87, 25, 1)])
  })),
  // The entrance/table is the scale reference. Larger groups stand slightly
  // farther back together, instead of shrinking adults on the same floor line.
  'football-ground': venue('football-ground', 28, 13),
  'bicycle-workshop': venue('bicycle-workshop', 29, 16),
  'exhibition-entrance': venue('exhibition-entrance', 29, 16),
  'community-fair': venue('community-fair', 28, 17),
  'food-festival': venue('food-festival', 28, 16),
  'community-hall': venue('community-hall', 28, 16),
  'closed-shop': venue('closed-shop', 28, 15),
  'flat-entrance': venue('flat-entrance', 28, 18),
  station: room(30, 11),
  'advice-room': room(29, 11),
  'meeting-room': room(29, 11)
});

export function sceneActorLayout(place, role, {solo = false, wide = false} = {}) {
  const layout = SCENE_LAYOUTS[place];
  if (!layout) throw new RangeError('Missing scene layout: ' + place);
  if (role !== 'public' && role !== 'garda') throw new RangeError('Unknown scene role: ' + role);
  const position = solo && layout.solo
    ? {x: 50, width: wide ? layout.solo.wideWidth : layout.solo.width, bottom: layout.solo.bottom}
    : layout.actors[role];
  return Object.freeze({...position, labelSpace: 2 * Math.min(position.x, 100 - position.x)});
}

export function sceneGroupLayout(place, count, index) {
  const position = SCENE_LAYOUTS[place]?.groups?.[count]?.[index];
  if (!position) throw new RangeError('Missing group layout: ' + place + '/' + count + '/' + index);
  return position;
}

export function sceneAnchorStyle({x, width, bottom, labelSpace}) {
  return '--scene-x:' + x + '%;--scene-width:' + width + '%;--scene-bottom:' + bottom + '%;--scene-label-space:' + labelSpace + '%;';
}

export function checkSceneArtwork(place, artworkName = null) {
  const layout = SCENE_LAYOUTS[place];
  if (!layout || layout.artwork !== artworkName) throw new Error('Review artwork and character anchors for ' + place + ': ' + artworkName);
}
