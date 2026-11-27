/** Visually reviewed clear standing surfaces in the ORIGINAL background art.
 * Coordinates are normalized image coordinates: x rightwards, y downwards.
 * Map opaque soles/wheels through object-fit, object-position and any backdrop
 * transform before checking them. These are conservative clear-floor polygons,
 * not actor-frame limits. Obstacles describe fixed ground footprints, not the
 * whole upright silhouette of furniture. Edge uncertainty is 1–2 source pixels.
 */
export const SCENE_GROUND_SURFACES = {
  'gpo-city': {
    polygons: [[[0.12, 1], [0.788, 1], [0.7625, 0.9], [0.7394, 0.8111], [0.7231, 0.74], [0.12, 0.74]]],
    obstacles: [
      [[0, 0.878], [0.12, 0.878], [0.12, 1], [0, 1]],
      [[0.544, 0.72], [0.597, 0.72], [0.597, 0.764], [0.544, 0.764]],
      [[0.679, 0.85], [0.704, 0.85], [0.704, 0.887], [0.679, 0.887]],
      [[0.716, 0.777], [0.731, 0.777], [0.731, 0.798], [0.716, 0.798]]
    ],
    note: 'People-free GPO poster artwork, measured on gpo-city-clear-1600.webp (1600 × 900). Use the foreground pavement below the GPO steps and inside the diagonal curb. The left planter reaches x=192; exclude the middle planter and the two nearer bollard bases. More distant pots and bollards lie above this conservative floor band. Map each hero/card/story crop separately.'
  },
  street: {
    polygons: [[[0.02, 1], [0.505, 1], [0.817, 0.552], [0.721, 0.568], [0.568, 0.66], [0.39, 0.775], [0.215, 0.89]]],
    obstacles: [
      [[0.578, 0.654], [0.681, 0.654], [0.681, 0.688], [0.578, 0.688]],
      [[0.694, 0.55], [0.766, 0.55], [0.766, 0.608], [0.694, 0.608]],
      [[0.768, 0.57], [0.788, 0.57], [0.788, 0.608], [0.768, 0.608]]
    ],
    note: 'Suburban pavement narrows toward the shelter. Its left edge follows the garden-wall base and its right edge follows the curb; exclude the tree planter, shelter feet and yellow stop pole. The road is not a standing area.'
  },
  'bus-stop': {
    polygons: [[[0.16, 1], [1, 1], [1, 0.825], [0.97, 0.794], [0.79, 0.69], [0.72, 0.66], [0.61, 0.66], [0.5, 0.75], [0.32, 0.875]]],
    obstacles: [
      [[0.654, 0.67], [0.683, 0.67], [0.683, 0.721], [0.654, 0.721]],
      [[0.765, 0.575], [0.928, 0.593], [0.928, 0.762], [0.765, 0.697]],
      [[0.932, 0.746], [0.984, 0.746], [0.984, 0.799], [0.932, 0.799]]
    ],
    note: 'Stand on the near/right pavement, beyond the diagonal curb and in front of the shelter. Fixed footprints are the bus-stop pole, bench and right shelter column; avoid the bus and road on the left.'
  },
  square: {
    polygons: [[[0, 0.96], [0.14, 0.82], [0.17, 0.76], [0.22, 0.745], [0.30, 0.70], [0.42, 0.775], [0.56, 0.86], [0.70, 0.947], [0.78, 1], [0, 1]]],
    obstacles: [[[0.194, 0.695], [0.283, 0.695], [0.283, 0.739], [0.194, 0.739]]],
    note: 'Quayside pavement lies below/left of the river-wall base, which reaches the bottom edge near x=0.8. The wall face and river are excluded. The tree planter interrupts the rear left path. Keep these original-image coordinates when the backdrop is zoomed 1.35 from left bottom.'
  },
  'football-ground': {
    polygons: [[[0, 0.709], [1, 0.709], [1, 1], [0, 1]]],
    obstacles: [
      [[0, 0.65], [0.164, 0.65], [0.164, 0.709], [0, 0.709]],
      [[0.425, 0.633], [0.481, 0.633], [0.481, 0.698], [0.425, 0.698]]
    ],
    note: 'Clear paved apron in front of the turnstile and open field gate. The reader is around x=0.45; its pedestal and the left planter are fixed obstacles. The pitch is behind the gate, not the foreground floor.'
  },
  'bicycle-workshop': {
    polygons: [[[0, 0.679], [1, 0.679], [1, 1], [0, 1]]],
    obstacles: [
      [[0, 0.602], [0.184, 0.602], [0.184, 0.664], [0, 0.664]],
      [[0.255, 0.59], [0.407, 0.59], [0.407, 0.648], [0.255, 0.648]],
      [[0.43, 0.601], [0.53, 0.601], [0.53, 0.652], [0.43, 0.652]],
      [[0.642, 0.602], [0.825, 0.602], [0.825, 0.654], [0.642, 0.654]],
      [[0.854, 0.602], [0.95, 0.602], [0.95, 0.654], [0.854, 0.654]]
    ],
    note: 'Open paved forecourt below the workshop equipment. Keep standing feet in front of the planter, workbench, bicycle repair stand, tent table and sign; those props supply the scene scale.'
  },
  'exhibition-entrance': {
    polygons: [[[0, 0.727], [0.085, 0.727], [0.09, 0.715], [0.34, 0.715], [0.37, 0.702], [0.44, 0.679], [0.685, 0.679], [0.78, 0.701], [0.86, 0.70], [1, 0.725], [1, 1], [0, 1]]],
    obstacles: [
      [[0.006, 0.615], [0.076, 0.615], [0.076, 0.722], [0.006, 0.722]],
      [[0.078, 0.57], [0.343, 0.57], [0.343, 0.708], [0.078, 0.708]],
      [[0.368, 0.625], [0.441, 0.625], [0.441, 0.696], [0.368, 0.696]],
      [[0.683, 0.625], [0.779, 0.625], [0.779, 0.692], [0.683, 0.692]],
      [[0.81, 0.597], [0.876, 0.597], [0.876, 0.691], [0.81, 0.691]]
    ],
    note: 'Foreground tiled lobby in front of the reception desk, open door leaves and two pots. The doorway threshold is deeper than the desk front; people may overlap furniture visually only when their feet are on the nearer floor.'
  },
  'community-fair': {
    polygons: [[[0, 0.655], [1, 0.655], [1, 1], [0, 1]]],
    note: 'Clear paved apron in front of the entrance columns and three stalls. All stall fronts, planters and table legs remain above this conservative floor edge; compare adult scale with stall counters and the entrance opening.'
  },
  'food-festival': {
    polygons: [[[0, 0.676], [1, 0.676], [1, 1], [0, 1]]],
    note: 'Clear paved entry apron in front of the green fence, right ticket kiosk/reader and flower planters. Grass and stalls are farther behind the gate; do not place foreground feet on the fence or kiosk plinth.'
  },
  'community-hall': {
    polygons: [[[0, 0.687], [1, 0.687], [1, 1], [0, 1]]],
    note: 'Open pavement below the hall threshold and flanking raised planters. Use the doorway height and inner reception desk as scale references; the door leaves and planters occupy the rear edge.'
  },
  'closed-shop': {
    polygons: [[[0, 0.715], [0.6, 0.715], [0.64, 0.679], [1, 0.649], [1, 1], [0, 1]]],
    note: 'Forecourt slopes in depth toward the shops on the right. The main shutter, entrance planter and right flowers end at the rear edge; keep feet on paving, clear of the lamp/tree bases farther right.'
  },
  'flat-entrance': {
    polygons: [[[0, 0.627], [1, 0.627], [1, 1], [0, 1]]],
    note: 'Broad clear paving below the entrance threshold and low planters. The glazed door, intercom and letter boxes establish building scale; the letter boxes are wall mounted, not ground space.'
  },
  station: {
    polygons: [[[0, 0.65], [0.66, 0.65], [0.76, 0.64], [0.82, 0.67], [1, 0.74], [1, 1], [0, 1]]],
    obstacles: [
      [[0.752, 0.526], [0.819, 0.526], [0.819, 0.628], [0.752, 0.628]],
      [[0.824, 0.548], [1, 0.573], [1, 0.735], [0.824, 0.66]]
    ],
    note: 'Public enquiry-room floor in front of the counter and waiting chairs. The counter ends near y=0.64; chair feet recede from y=0.66 at x=0.82 to y=0.73 on the right. Exclude the plant pot and chairs. Portrait panels crop this same source horizontally.'
  },
  'advice-room': {
    polygons: [[[0, 0.659], [0.16, 0.609], [0.29, 0.596], [0.84, 0.598], [1, 0.642], [1, 1], [0, 1]]],
    note: 'Clear foreground tiles below the bookcase, plant, two chairs, table and right cabinet. Rear furniture supplies depth; the solo portrait crop must preserve vertical image scale and use the foreground floor.'
  },
  'meeting-room': {
    polygons: [[[0, 0.56], [0.82, 0.56], [0.9, 0.58], [1, 0.593], [1, 1], [0, 1]]],
    note: 'Clear wood floor in front of the chair row, cabinet, plant and refreshments table. The far-right table feet project slightly farther forward. Both wide and solo portrait panels use the same source-image floor.'
  }
};
