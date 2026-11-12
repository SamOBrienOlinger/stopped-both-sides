/**
 * Coordinates are physical percentages of a location panel, not viewport
 * percentages. x is the CENTRE of the square character frame.
 * These preserve the current uimproved character positions; they do not
 * certify that every background is a geographical/scenario match.
 */
const outdoor = (artwork, publicX, gardaX) => Object.freeze({
  artwork, width: 28, bottom: 6,
  centres: Object.freeze({ public: publicX, garda: gardaX })
});
const indoor = () => Object.freeze({
  artwork: null, width: 32, bottom: 5,
  centres: Object.freeze({ public: 29, garda: 71 })
});

export const SCENE_LAYOUTS = Object.freeze({
  street: outdoor('suburban-street', 34, 50),
  'bus-stop': outdoor('bus-stop', 24, 42),
  square: outdoor('quayside', 38, 56),
  station: indoor(),
  'advice-room': indoor(),
  'meeting-room': indoor()
});

/** One source of truth for BOTH the figure and its caption. */
export function sceneActorLayout(place, role, { solo = false, wide = false } = {}) {
  const layout = SCENE_LAYOUTS[place];
  if (!layout) throw new RangeError(`Missing scene layout: ${place}`);
  if (role !== 'public' && role !== 'garda') {
    throw new RangeError(`Unknown scene role: ${role}`);
  }
  const singleIndoor = solo && layout.artwork === null;
  const x = singleIndoor ? 50 : layout.centres[role];
  const width = singleIndoor ? (wide ? 32 : 68) : layout.width;
  const bottom = singleIndoor ? (wide ? 6 : 7) : layout.bottom;
  return Object.freeze({
    x, width, bottom,
    // Twice the distance to the nearer edge. Labels can wrap without shifting
    // their centre away from their character or overflowing the panel.
    labelSpace: 2 * Math.min(x, 100 - x)
  });
}

export function sceneAnchorStyle({ x, width, bottom, labelSpace }) {
  return `--scene-x:${x}%;--scene-width:${width}%;--scene-bottom:${bottom}%;--scene-label-space:${labelSpace}%;`;
}

/** Do not silently reuse pavement anchors after changing an artwork mapping. */
export function checkSceneArtwork(place, artworkName = null) {
  const layout = SCENE_LAYOUTS[place];
  if (!layout || layout.artwork !== artworkName) {
    throw new Error(`Review artwork and character anchors for ${place}: ${artworkName}`);
  }
}
