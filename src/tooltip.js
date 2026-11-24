import { computePlacement } from './utils/placement';

/**
 * Virtual Select tooltip add-on (virtual-select-tooltip.min.js + .min.css), replacing
 * tooltip-plugin. Opt-in and standalone: it reads only the `data-tooltip*` attributes the core
 * writes, and neither side calls the other.
 *
 * Differences from tooltip-plugin, all deliberate:
 * - reacts only to triggers inside `.vscomp-wrapper` or `.vscomp-dropbox-wrapper`;
 * - stands down while `window.tooltipComponentInitiated` (tooltip-plugin) is set, checked per hover;
 * - reads only the eight attributes the core emits;
 * - no animation under `prefers-reduced-motion`;
 * - assigns no global apart from its own load guard.
 *
 * Kept terse on purpose: the minified file has a 1650 B gzip budget (size-budgets.json).
 */

/** @type {HTMLElement | null} the trigger being hovered, from the accepted mouseover until hide */
let trigger = null;
/** @type {HTMLElement | null} the one tooltip node; hidden is `display: none`, not removed */
let node = null;
/** the transform the node animates from on show, and back to on hide */
let from = '';
/** @type {ReturnType<typeof setTimeout> | undefined} */
let enterTimer;
/** @type {ReturnType<typeof setTimeout> | undefined} */
let hideTimer;

/**
 * @param {number} x
 * @param {number} y
 */
const translate = (x, y) => `translate3d(${x}px,${y}px,0)`;

/**
 * Transitions the node to `transform` and `opacity`; no motion under prefers-reduced-motion.
 * @param {HTMLElement} $node
 * @param {string} transform
 * @param {string} opacity
 * @param {number} ms
 * @returns {number} the duration used
 */
function animate($node, transform, opacity, ms) {
  const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;

  Object.assign($node.style, { transitionDuration: `${duration}ms`, transform, opacity });

  return duration;
}

/** Builds the node for the current trigger, places it, and animates it in. */
function show() {
  const $trigger = /** @type {HTMLElement} */ (trigger);

  // Re-rendered away during the enter delay (the core re-renders options after every open): it
  // would measure as a 0x0 box at the viewport's corner. Clearing it lets its replacement hover.
  if (!$trigger.isConnected) {
    hide();
    return;
  }

  const data = $trigger.dataset;
  const $node = document.createElement('div');

  clearTimeout(hideTimer);
  node?.remove();
  node = $node;

  $node.className = 'tooltip-comp';
  $node.innerHTML = '<i class="tooltip-comp-arrow"></i><div class="tooltip-comp-content"></div>';

  const $arrow = /** @type {HTMLElement} */ ($node.firstChild);
  const $content = /** @type {HTMLElement} */ ($node.lastChild);

  // The only HTML sink, and only on request: the core asks for it where the label it escaped
  // into the attribute is already rendered as HTML in the option or value.
  if (data.tooltipAllowHtml === 'true') {
    $content.innerHTML = /** @type {string} */ (data.tooltip);
  } else {
    $content.textContent = /** @type {string} */ (data.tooltip);
  }

  Object.assign($node.style, {
    zIndex: data.tooltipZIndex || 1,
    fontSize: data.tooltipFontSize || '14px',
    textAlign: data.tooltipAlignment || 'left',
    maxWidth: data.tooltipMaxWidth || '300px',
  });
  document.body.appendChild($node);

  const box = $node.getBoundingClientRect();
  const target = $trigger.getBoundingClientRect();
  const half = $arrow.offsetWidth / 2;
  const { side, x, y, fromX, fromY } = computePlacement({
    trigger: target,
    floating: box,
    viewport: { width: innerWidth, height: innerHeight },
    position: 'auto',
    margin: 8,
    offset: 5,
    distance: 10,
  });
  // Points at the trigger's centre without leaving the box.
  const left = Math.min(Math.max(target.left + target.width / 2 - (box.left + x), half), box.width - half);

  $node.classList.add(`position-${side}`);
  $arrow.style.transform = `translate3d(${Math.trunc(left)}px,0,0)${side === 'top' ? ' rotate(180deg)' : ''}`;
  $node.style.transform = from = translate(fromX, fromY);

  // INTENTIONAL forced reflow: commits the from-translate so the next writes transition from it.
  $node.getBoundingClientRect();
  animate($node, translate(x, y), '1', 300);
}

/** Cancels a pending show, forgets the trigger, and animates a shown node out. */
function hide() {
  clearTimeout(enterTimer);
  trigger = null;

  if (node?.style.opacity === '1') {
    const $node = node;

    hideTimer = setTimeout(() => {
      $node.style.display = 'none';
    }, animate($node, from, '0', 200));
  }
}

if (!window.virtualSelectTooltipInitiated) {
  window.virtualSelectTooltipInitiated = true;

  document.addEventListener('mouseover', (event) => {
    if (trigger || window.tooltipComponentInitiated) {
      return;
    }

    const $target = /** @type {Element} */ (event.target);
    const $trigger = /** @type {HTMLElement | null} */ ($target.closest('[data-tooltip]'));

    if (
      $trigger?.dataset.tooltip &&
      $trigger.closest('.vscomp-wrapper,.vscomp-dropbox-wrapper') &&
      !($trigger.dataset.tooltipEllipsisOnly === 'true' && $trigger.scrollWidth <= $trigger.offsetWidth)
    ) {
      trigger = $trigger;
      enterTimer = setTimeout(show, Number($trigger.dataset.tooltipEnterDelay) || 0);
    }
  });

  // Moving within the trigger is not leaving it. A trigger that left the DOM contains nothing.
  document.addEventListener('mouseout', (event) => {
    if (!trigger?.contains(/** @type {Node | null} */ (event.relatedTarget))) {
      hide();
    }
  });

  document.addEventListener('click', hide);
  document.addEventListener('touchmove', hide);

  document.addEventListener(
    'scroll',
    (event) => {
      const target = /** @type {Node} */ (event.target);

      // `document` contains every connected trigger. One no longer in the DOM is contained by
      // nothing, so any scroll hides its tooltip.
      if (trigger && (target.contains(trigger) || !trigger.isConnected)) {
        hide();
      }
    },
    { capture: true, passive: true },
  );
}
