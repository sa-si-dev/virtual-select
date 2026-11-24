import { Utils, DomUtils } from './utils';
import { computePlacement } from './utils/placement';

const MARGIN = 4;
const OFFSET = 5;
const DISTANCE = 30;
const POSITION_CLASSES = 'position-top position-bottom position-left position-right';

/** @typedef {'hidden' | 'showing' | 'shown' | 'hiding'} State */

/**
 * @typedef {{
 *   $trigger: HTMLElement,
 *   $floating: HTMLElement,
 *   position: string,
 *   zIndex: number | string,
 *   showDuration: number,
 *   hideDuration: number,
 *   throttle: number,
 *   reposition: boolean,
 *   onShown: () => void,
 *   onHidden: () => void,
 * }} DropboxPositionerOptions
 */

/**
 * @param {number} x
 * @param {number} y
 */
const translate = (x, y) => `translate3d(${x}px, ${y}px, 0)`;

/**
 * Places the dropbox next to its host and runs the show and hide transitions.
 * Replaces popover-plugin: same class names, same placement, same timing.
 *
 * hidden -> showing -> shown -> hiding -> hidden; reset() jumps to hidden from anywhere.
 * Scroll and resize listeners exist only while shown, and only when `reposition` is set.
 */
export class DropboxPositioner {
  /** @param {DropboxPositionerOptions} options */
  constructor(options) {
    // Field types are declared in dropbox-positioner-fields.d.ts. timer, side, x, y, fromX and
    // fromY are written before they are first read; clearing an unset timer is a no-op.
    Object.assign(this, options);

    // popover-plugin read an empty position as 'auto'; computePlacement() throws on an unknown side.
    if (!/^(auto|top|bottom|left|right)( |$)/i.test(this.position)) {
      this.position = 'auto';
    }

    /** @type {State} */
    this.state = 'hidden';
    // Initialised here because the type checker infers `any` from the method-only writes.
    this.frame = 0;
    this.onScroll = this.onScroll.bind(this);
    this.requestUpdate = Utils.throttle(() => this.scheduleUpdate(), options.throttle);

    DomUtils.addClass(this.$trigger, 'pop-comp-ele');
    DomUtils.addClass(this.$floating, 'pop-comp-wrapper');
    DomUtils.setStyle(this.$floating, 'zIndex', String(options.zIndex));
  }

  show() {
    if (this.state !== 'hidden') {
      return;
    }

    this.state = 'showing';
    DomUtils.addClass(this.$floating, 'pop-comp-disable-events');
    DomUtils.setStyles(this.$floating, { display: 'inline-flex', transitionDuration: '0ms', transform: 'none' });
    this.place(this.$floating.getBoundingClientRect());
    DomUtils.setStyle(this.$floating, 'transform', translate(this.fromX, this.fromY));

    // INTENTIONAL forced reflow: commits the from-translate so the next writes transition from it.
    this.$floating.getBoundingClientRect();

    DomUtils.setStyles(this.$floating, {
      transitionDuration: `${this.showDuration}ms`,
      transform: translate(this.x, this.y),
      opacity: '1',
    });
    DomUtils.addClass(this.$trigger, 'pop-comp-active');
    this.timer = setTimeout(() => this.afterShow(), this.showDuration);
  }

  hide() {
    if (this.state !== 'showing' && this.state !== 'shown') {
      return;
    }

    clearTimeout(this.timer);
    this.state = 'hiding';
    DomUtils.removeClass(this.$floating, 'pop-comp-disable-events');
    this.removeListeners();
    DomUtils.setStyles(this.$floating, {
      transitionDuration: `${this.hideDuration}ms`,
      transform: translate(this.fromX, this.fromY),
      opacity: '0',
    });
    this.timer = setTimeout(() => this.afterHide(), this.hideDuration);
  }

  /** Back to the state a finished hide leaves, at once and without calling onHidden. */
  reset() {
    this.destroy(); // clears the timer, the listeners and pop-comp-active
    this.state = 'hidden';
    DomUtils.setStyles(this.$floating, { display: 'none', opacity: '0' });
    DomUtils.removeClass(this.$floating, 'pop-comp-disable-events');
  }

  updatePosition() {
    if (this.state !== 'showing' && this.state !== 'shown') {
      return;
    }

    /*
     * One read phase, one write phase. The untransformed origin is the rectangle minus the
     * translate applied right now, which mid-transition is not the one last written. The rect
     * read has already flushed layout, so the computed style costs no extra layout; a transform
     * of 'none' parses to the identity matrix.
     *
     * The rect is in viewport pixels, the translate in the element's own: under a scaled ancestor
     * the translate moves the box by translate * scale, so that is what comes off, per axis. Each
     * scale is the rect size over the layout size (offsetWidth / offsetHeight, already laid out by
     * the rect read); a gap under one pixel is their rounding, not a scale. The placement then runs
     * on the same viewport-pixel origin that show() measures with transform: none, so a reposition
     * writes what show() wrote, as popover-plugin did.
     */
    const rect = this.$floating.getBoundingClientRect();
    const { m41, m42 } = new DOMMatrix(getComputedStyle(this.$floating).transform);
    const scale = (/** @type {number} */ size, /** @type {number} */ layout) =>
      layout && Math.abs(size - layout) >= 1 ? size / layout : 1;

    this.place({
      left: rect.left - m41 * scale(rect.width, this.$floating.offsetWidth),
      top: rect.top - m42 * scale(rect.height, this.$floating.offsetHeight),
      width: rect.width,
      height: rect.height,
    });
    DomUtils.setStyles(this.$floating, { transitionDuration: '0ms', transform: translate(this.x, this.y) });
  }

  isShown() {
    return this.state !== 'hidden';
  }

  isHiding() {
    return this.state === 'hiding';
  }

  /** Also clears pop-comp-active: a destroy during the hide cancels the afterHide() that would. */
  destroy() {
    clearTimeout(this.timer);
    this.removeListeners();
    DomUtils.removeClass(this.$trigger, 'pop-comp-active');
  }

  afterShow() {
    this.state = 'shown';
    DomUtils.removeClass(this.$floating, 'pop-comp-disable-events');

    if (this.reposition) {
      // Scroll events do not leave a shadow root: listen on every root from the host's up to the document.
      this.roots = /** @type {Node[]} */ ([]);

      for (
        let root = /** @type {Node | undefined} */ (this.$trigger.getRootNode());
        root;
        root = /** @type {ShadowRoot} */ (root).host?.getRootNode()
      ) {
        this.roots.push(root);
        root.addEventListener('scroll', this.onScroll, { capture: true, passive: true });
      }

      window.addEventListener('resize', this.requestUpdate);
    }

    this.onShown();
  }

  afterHide() {
    this.state = 'hidden';
    DomUtils.setStyle(this.$floating, 'display', 'none');
    DomUtils.removeClass(this.$trigger, 'pop-comp-active');
    this.onHidden();
  }

  removeListeners() {
    this.roots?.forEach((root) => root.removeEventListener('scroll', this.onScroll, true));
    this.roots = undefined;
    window.removeEventListener('resize', this.requestUpdate);
    this.requestUpdate.cancel();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  /**
   * Only a scroll of the document or of an ancestor of the host moves the host. The walk goes up
   * through shadow hosts, where Node.contains() stops.
   * @param {Event} event
   */
  onScroll(event) {
    for (
      let node = /** @type {Node | null | undefined} */ (this.$trigger);
      node;
      node = node.parentNode || /** @type {ShadowRoot} */ (node).host
    ) {
      if (node === event.target) {
        this.requestUpdate();
        return;
      }
    }
  }

  /** At most one reposition per animation frame, whatever the throttle. */
  scheduleUpdate() {
    if (this.frame) {
      return;
    }

    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.updatePosition();
    });
  }

  /**
   * Compute the placement for `floating` (viewport box without transform) and apply the side class.
   * @param {{ left: number, top: number, width: number, height: number }} floating
   */
  place(floating) {
    // Sets this.side, this.x, this.y, this.fromX and this.fromY.
    Object.assign(
      this,
      computePlacement({
        trigger: this.$trigger.getBoundingClientRect(),
        floating,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        position: this.position,
        margin: MARGIN,
        offset: OFFSET,
        distance: DISTANCE,
      }),
    );
    DomUtils.removeClass(this.$floating, POSITION_CLASSES);
    DomUtils.addClass(this.$floating, `position-${this.side}`);
  }
}
