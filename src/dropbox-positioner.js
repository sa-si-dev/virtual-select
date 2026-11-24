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
    this.$trigger = options.$trigger;
    this.$floating = options.$floating;
    this.position = options.position;
    this.showDuration = options.showDuration;
    this.hideDuration = options.hideDuration;
    this.reposition = options.reposition;
    this.onShown = options.onShown;
    this.onHidden = options.onHidden;

    /** @type {State} */
    this.state = 'hidden';
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this.timer = undefined;
    this.frame = 0;
    /** the last placement written: final and from-translate */
    this.x = 0;
    this.y = 0;
    this.fromX = 0;
    this.fromY = 0;

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
    DomUtils.setStyle(this.$floating, 'display', 'inline-flex');
    this.placeUntransformed();
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
    clearTimeout(this.timer);
    this.removeListeners();
    this.state = 'hidden';
    DomUtils.setStyles(this.$floating, { display: 'none', opacity: '0' });
    DomUtils.removeClass(this.$trigger, 'pop-comp-active');
    DomUtils.removeClass(this.$floating, 'pop-comp-disable-events');
  }

  updatePosition() {
    if (this.state === 'showing') {
      // Mid-transition the current translate is not the one last written: measure without it.
      this.placeUntransformed();
    } else if (this.state === 'shown') {
      // One read, one write: the untransformed origin is the rectangle minus the last translate.
      const rect = this.$floating.getBoundingClientRect();
      this.place({ left: rect.left - this.x, top: rect.top - this.y, width: rect.width, height: rect.height });
      DomUtils.setStyle(this.$floating, 'transitionDuration', '0ms');
    } else {
      return;
    }

    DomUtils.setStyle(this.$floating, 'transform', translate(this.x, this.y));
  }

  isShown() {
    return this.state !== 'hidden';
  }

  isHiding() {
    return this.state === 'hiding';
  }

  destroy() {
    clearTimeout(this.timer);
    this.removeListeners();
  }

  afterShow() {
    this.state = 'shown';
    DomUtils.removeClass(this.$floating, 'pop-comp-disable-events');

    if (this.reposition) {
      document.addEventListener('scroll', this.onScroll, { capture: true, passive: true });
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
    document.removeEventListener('scroll', this.onScroll, { capture: true });
    window.removeEventListener('resize', this.requestUpdate);
    this.requestUpdate.cancel();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  /** @param {Event} event */
  onScroll(event) {
    const { target } = event;

    if (target === document || (target instanceof Node && target.contains(this.$trigger))) {
      this.requestUpdate();
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

  /** Clear the transform, measure, and place from the untransformed box. */
  placeUntransformed() {
    DomUtils.setStyles(this.$floating, { transitionDuration: '0ms', transform: 'none' });
    this.place(this.$floating.getBoundingClientRect());
  }

  /**
   * Compute the placement for `floating` (viewport box without transform) and apply the side class.
   * @param {{ left: number, top: number, width: number, height: number }} floating
   */
  place(floating) {
    const { side, x, y, fromX, fromY } = computePlacement({
      trigger: this.$trigger.getBoundingClientRect(),
      floating,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      position: this.position,
      margin: MARGIN,
      offset: OFFSET,
      distance: DISTANCE,
    });

    this.x = x;
    this.y = y;
    this.fromX = fromX;
    this.fromY = fromY;
    DomUtils.removeClass(this.$floating, POSITION_CLASSES);
    DomUtils.addClass(this.$floating, `position-${side}`);
  }
}
