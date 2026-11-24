/**
 * @typedef {{ left: number, top: number, width: number, height: number }} Box viewport coordinates
 * @typedef {'top' | 'bottom' | 'left' | 'right'} Side
 */

/**
 * Port of popper-plugin's setPosition() maths, without the arrow.
 * The order of the steps is the behaviour: keep it.
 * `floating` is measured with transform: none.
 * `position` is 'auto', a Side, or '<Side> <left|right|top|bottom>'.
 *
 * @param {{
 *   trigger: Box,
 *   floating: Box,
 *   viewport: { width: number, height: number },
 *   position: string,
 *   margin: number,
 *   offset: number,
 *   distance: number,
 * }} input
 * @returns {{ side: Side, x: number, y: number, fromX: number, fromY: number }} all integers
 */
export function computePlacement({ trigger: t, floating: f, viewport, position, margin, offset, distance }) {
  const [primary, secondary] = position.toLowerCase().split(' ');
  const auto = t.top > viewport.height - t.top - t.height ? 'top' : 'bottom';
  let side = /** @type {Side} */ (primary === 'auto' ? auto : primary);

  const dx = t.left - f.left;
  const dy = t.top - f.top;
  const cx = dx + t.width / 2 - f.width / 2;
  const cy = dy + t.height / 2 - f.height / 2;
  const sides = {
    top: { x: cx, y: dy - f.height - margin },
    bottom: { x: cx, y: dy + t.height + margin },
    left: { x: dx - f.width - margin, y: cy },
    right: { x: dx + t.width + margin, y: cy },
  };
  let { x, y } = sides[side];

  if (secondary === 'left') x = dx;
  else if (secondary === 'right') x = dx + t.width - f.width;
  else if (secondary === 'top') y = dy;
  else if (secondary === 'bottom') y = dy + t.height - f.height;

  const minX = offset - f.left;
  const maxX = viewport.width - offset - f.left;
  const minY = offset - f.top;
  const maxY = viewport.height - offset - f.top;
  /** @type {Side | undefined} */
  let flip;

  if (x < minX) {
    if (side === 'left') flip = 'right';
    else x = t.left + t.width < offset ? dx + t.width : minX;
  } else if (x + f.width > maxX) {
    if (side === 'right') flip = 'left';
    else x = t.left > viewport.width - offset ? dx - f.width : maxX - f.width;
  }

  if (y < minY) {
    if (side === 'top') flip = 'bottom';
    else y = t.top + t.height < offset ? dy + t.height : minY;
  } else if (y + f.height > maxY) {
    if (side === 'bottom') flip = 'top';
    else y = t.top > viewport.height - offset ? dy - f.height : maxY - f.height;
  }

  if (flip) {
    side = flip;
    if (side === 'top' || side === 'bottom') y = sides[side].y;
    else x = sides[side].x;
  }

  const from = {
    top: [x, y + distance],
    bottom: [x, y - distance],
    left: [x + distance, y],
    right: [x - distance, y],
  }[side];

  /** whole pixels, toward zero; `|| 0` turns both -0 and NaN into 0 */
  const int = (/** @type {number} */ n) => Math.trunc(n) || 0;

  return { side, x: int(x), y: int(y), fromX: int(from[0]), fromY: int(from[1]) };
}
