/** cSpell:ignore vscomp */

/**
 * The dropdown's open/close lifecycle: which events fire, in which order and how often, for every
 * way of closing it, plus when the dropbox follows its host and when it stops doing so.
 *
 * Written first against the code that used `popover-plugin`, then moved to the internal
 * positioner's behaviour: exactly one `beforeClose` and one `afterClose` per close, Escape from
 * outside the component is a real close, and a silent close resets the positioner.
 *
 * Virtual Select dispatches its events through `setTimeout(0)`, so every log assertion waits on
 * the recorded array (a retrying assertion) instead of reading it synchronously.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';
import { blockTooltipPlugin, recordEvents, snapshotDropbox } from '../support/dropbox-probe';

type Instance = {
  open: () => void;
  close: () => void;
  updatePosition: () => void;
  hideDuration: number;
  $dropboxContainer: HTMLElement;
};
type Host = HTMLElement & { open: () => void; close: () => void; destroy: () => void; virtualSelect: Instance };

const MOUNT_ID = 'vs-lifecycle';
const MOUNT_ID_B = 'vs-lifecycle-b';
const SETTLE_MS = 300;

const baseOptions = {
  options: makeOptions(6),
  search: true,
  showDuration: 50,
  hideDuration: 50,
};

let events: string[] = [];

const getHost = (id = MOUNT_ID) => cy.get(`#${id}`);
const toggle = (id = MOUNT_ID) => getHost(id).find('.vscomp-toggle-button');

const mount = (options: Record<string, unknown> = baseOptions, hostStyle?: Partial<CSSStyleDeclaration>) => {
  cy.window().then((win) => {
    mountVs(win, MOUNT_ID, options, hostStyle);
    events = recordEvents(win, MOUNT_ID);
  });
};

/** Wait until the log holds exactly `expected`, retrying until it does. */
const expectLog = (expected: string[]) => {
  // `events` is reassigned when the instance mounts, so read it inside the retried callback.
  cy.wrap(null).should(() => {
    expect(events).to.deep.equal(expected);
  });
};

/** Open with a click, wait for `afterOpen`, then clear the log. */
const openAndClear = () => {
  toggle().click();
  expectLog(['beforeOpen', 'afterOpen']);
  cy.then(() => {
    events.length = 0;
  });
};

const hostIn = (win: Window, id = MOUNT_ID) => win.document.getElementById(id) as Host;

/** Append a focusable button outside the component (removed in afterEach). */
const addExternalButton = () => {
  cy.window().then((win) => {
    const external = win.document.createElement('button');
    external.id = `${MOUNT_ID}-external`;
    external.textContent = 'external';
    win.document.body.appendChild(external);
  });
};

/** Count writes to `element`'s style attribute from now on. */
const watchStyleWrites = (win: Window, element: HTMLElement) => {
  const { MutationObserver: Observer } = win as Window & typeof globalThis;
  let count = 0;
  const observer = new Observer((records) => {
    count += records.length;
  });

  observer.observe(element, { attributes: true, attributeFilter: ['style'] });

  return () => {
    count += observer.takeRecords().length;
    observer.disconnect();

    return count;
  };
};

const waitFrames = (win: Window, frames: number) =>
  new Cypress.Promise<void>((resolve) => {
    const step = (left: number) => (left === 0 ? resolve() : win.requestAnimationFrame(() => step(left - 1)));

    step(frames);
  });

const scrollDocument = (win: Window) => {
  win.document.dispatchEvent(new (win as Window & typeof globalThis).Event('scroll'));
};

/** Dispatch a document scroll and a window resize, as a scrolling ancestor and a resize would. */
const scrollAndResize = (win: Window) => {
  scrollDocument(win);
  win.dispatchEvent(new (win as Window & typeof globalThis).Event('resize'));
};

/** How many requestAnimationFrame calls `act` makes synchronously. */
const countFrameRequests = (win: Window, act: () => void) => {
  const original = win.requestAnimationFrame;
  let count = 0;

  win.requestAnimationFrame = (callback) => {
    count += 1;

    return original.call(win, callback);
  };

  try {
    act();
  } finally {
    win.requestAnimationFrame = original;
  }

  return count;
};

type Registration = { target: EventTarget; type: string; listener: unknown; capture: boolean };

const captureOf = (options?: boolean | EventListenerOptions) =>
  typeof options === 'boolean' ? options : !!options?.capture;

/** Undoes the patch made by trackScrollAndResizeListeners(); the page is not reloaded between tests. */
let untrackListeners: (() => void) | undefined;

/**
 * Record `scroll` and `resize` listeners added to and removed from the window and the document
 * from now on. `live()` counts the ones added and not removed since.
 */
const trackScrollAndResizeListeners = (win: Window) => {
  const live: Registration[] = [];
  let added = 0;
  const targets: EventTarget[] = [win, win.document];

  targets.forEach((target) => {
    const { addEventListener: add, removeEventListener: remove } = target;

    target.addEventListener = (type, listener, options) => {
      if (type === 'scroll' || type === 'resize') {
        added += 1;
        live.push({ target, type, listener, capture: captureOf(options) });
      }

      add.call(target, type, listener, options);
    };

    target.removeEventListener = (type, listener, options) => {
      const capture = captureOf(options);
      const index = live.findIndex(
        (r) => r.target === target && r.type === type && r.listener === listener && r.capture === capture,
      );

      if (index !== -1) {
        live.splice(index, 1);
      }

      remove.call(target, type, listener, options);
    };
  });

  untrackListeners = () => {
    targets.forEach((target) => {
      Reflect.deleteProperty(target, 'addEventListener');
      Reflect.deleteProperty(target, 'removeEventListener');
    });
  };

  return { added: () => added, live: () => live.length };
};

/** Undoes the matchMedia stub of the reduced-motion test; the page is not reloaded between tests. */
let restoreMatchMedia: (() => void) | undefined;

/** A host mounted inside a shadow root, which unmountVs() cannot find by id. */
let shadowHost: Host | undefined;

describe('Dropbox lifecycle', () => {
  beforeEach(() => {
    blockTooltipPlugin();
    cy.viewport(1280, 800);
    cy.visit('get-started');
  });

  afterEach(() => {
    cy.window().then((win) => {
      untrackListeners?.();
      untrackListeners = undefined;
      restoreMatchMedia?.();
      restoreMatchMedia = undefined;
      shadowHost?.destroy();
      shadowHost = undefined;
      unmountVs(win, MOUNT_ID);
      unmountVs(win, MOUNT_ID_B);
      win.document.getElementById(`${MOUNT_ID}-box`)?.remove();
      win.document.getElementById(`${MOUNT_ID}-external`)?.remove();
      win.document.getElementById(`${MOUNT_ID}-style`)?.remove();
    });
  });

  context('closing', () => {
    beforeEach(() => {
      mount();
      openAndClear();
    });

    it('toggle close fires beforeClose then afterClose', () => {
      toggle().click();
      cy.wait(SETTLE_MS);

      expectLog(['beforeClose', 'afterClose']);
    });

    it('outside click fires beforeClose then afterClose once', () => {
      cy.get('body').click(5, 5);
      cy.wait(SETTLE_MS);

      expectLog(['beforeClose', 'afterClose']);
    });

    it('Escape with focus inside fires beforeClose then afterClose once', () => {
      getHost().find('.vscomp-search-input').focus().type('{esc}');
      cy.wait(SETTLE_MS);

      expectLog(['beforeClose', 'afterClose']);
    });

    it('Escape with focus outside is a full close and sets aria-expanded false', () => {
      addExternalButton();

      cy.get(`#${MOUNT_ID}-external`).focus().type('{esc}');
      cy.wait(SETTLE_MS);

      expectLog(['beforeClose', 'afterClose']);
      getHost().find('.vscomp-wrapper').should('have.attr', 'aria-expanded', 'false');
    });

    it('Escape already handled elsewhere on the page leaves the dropdown open', () => {
      cy.window().then((win) => {
        const { KeyboardEvent: Keyboard } = win as Window & typeof globalThis;
        const escape = new Keyboard('keydown', { key: 'Escape', bubbles: true, cancelable: true });

        escape.preventDefault();
        win.document.body.dispatchEvent(escape);
      });
      cy.wait(SETTLE_MS);

      expectLog([]);
      getHost().find('.vscomp-wrapper').should('not.have.class', 'closed');
    });

    it('closing twice in one tick fires the close events once', () => {
      cy.window().then((win) => {
        const host = hostIn(win);

        host.close();
        host.close();
      });
      cy.wait(SETTLE_MS);

      expectLog(['beforeClose', 'afterClose']);
    });
  });

  context('destroy', () => {
    // dropboxWrapper 'body' is the configuration that attaches scroll and resize listeners.
    const withListeners = { ...baseOptions, dropboxWrapper: 'body', updatePositionThrottle: 0 };

    it('destroy during the hide transition fires no afterClose and leaves no listeners', () => {
      mount({ ...withListeners, hideDuration: 200 });

      let listeners: ReturnType<typeof trackScrollAndResizeListeners>;

      cy.window().then((win) => {
        listeners = trackScrollAndResizeListeners(win);
      });
      openAndClear();

      cy.window().then((win) => {
        const host = hostIn(win);

        host.close();
        host.destroy();

        expect(() => scrollAndResize(win), 'scroll and resize after destroy').not.to.throw();
      });
      cy.wait(400);

      cy.then(() => {
        expect(events, 'close events after destroy').not.to.include('afterClose');
        expect(listeners.added(), 'listeners added while open').to.be.at.least(2);
        expect(listeners.live(), 'listeners left after destroy').to.equal(0);
      });
      getHost().should('not.have.class', 'pop-comp-active');
    });

    // OutSystems UI's changeProperty(): a synchronous close(), then redraw() on a 0 ms timer, which
    // destroys the instance and builds a new one on the same element, all inside the default hide.
    it('close, then destroy and init on the same element in the next tick, leaves no pop-comp-active', () => {
      const options = { options: makeOptions(6), search: true };

      mount(options);
      openAndClear();

      let hideDuration = 0;

      cy.window().then(
        (win) =>
          new Cypress.Promise<void>((resolve) => {
            const host = hostIn(win);

            hideDuration = host.virtualSelect.hideDuration;
            host.close();
            win.setTimeout(() => {
              host.destroy();
              // @ts-expect-error - VirtualSelect is attached to window by the bundle
              win.VirtualSelect.init({ ele: host, ...options });
              resolve();
            }, 0);
          }),
      );

      cy.then(() => {
        expect(hideDuration, 'default hide duration').to.equal(200);
      });
      cy.wait(200 + SETTLE_MS);

      getHost().should('not.have.class', 'pop-comp-active');
      getHost().find('.vscomp-wrapper').should('have.attr', 'aria-expanded', 'false');
    });

    it('destroy while shown removes the listeners', () => {
      mount(withListeners);

      let listeners: ReturnType<typeof trackScrollAndResizeListeners>;
      let container: HTMLElement;
      let styleWrites: () => number;

      cy.window().then((win) => {
        listeners = trackScrollAndResizeListeners(win);
      });
      openAndClear();

      cy.window().then((win) => {
        const host = hostIn(win);
        container = host.virtualSelect.$dropboxContainer;

        host.destroy();

        expect(host, 'host after destroy').not.to.have.class('pop-comp-active');
        expect(listeners.added(), 'listeners added while open').to.be.at.least(2);
        expect(listeners.live(), 'listeners left after destroy').to.equal(0);

        styleWrites = watchStyleWrites(win, container);
        expect(
          countFrameRequests(win, () => scrollAndResize(win)),
          'frames requested',
        ).to.equal(0);
      });
      cy.window().then((win) => waitFrames(win, 2));

      cy.then(() => {
        expect(styleWrites(), 'style writes on the detached container').to.equal(0);
      });
    });
  });

  context('second instance', () => {
    it('opening B from script closes A silently and A reopens normally', () => {
      mount();

      cy.window().then((win) => {
        mountVs(win, MOUNT_ID_B, baseOptions);
      });

      openAndClear();

      cy.window().then((win) => {
        hostIn(win, MOUNT_ID_B).open();
      });
      getHost(MOUNT_ID_B).should('have.class', 'pop-comp-active');
      cy.wait(SETTLE_MS);

      expectLog([]);
      getHost().should('not.have.class', 'pop-comp-active');
      getHost().find('.vscomp-wrapper').should('have.attr', 'aria-expanded', 'false');

      cy.window().then((win) => {
        hostIn(win).open();
      });

      expectLog(['beforeOpen', 'afterOpen']);
      getHost().find('.vscomp-dropbox-container').should('be.visible');
    });
  });

  context('interrupted transitions', () => {
    // Long enough that the second call always lands inside the transition.
    const slow = { ...baseOptions, showDuration: 300, hideDuration: 300 };

    it('open() during the close animation finishes the close, then opens', () => {
      mount(slow);
      openAndClear();

      cy.window().then((win) => {
        const host = hostIn(win);

        host.close();
        host.open();
      });
      cy.wait(300 + SETTLE_MS);

      expectLog(['beforeClose', 'afterClose', 'beforeOpen', 'afterOpen']);
      getHost().find('.vscomp-wrapper').should('not.have.class', 'closed');
      getHost().find('.vscomp-wrapper').should('have.attr', 'aria-expanded', 'true');
      getHost().find('.vscomp-dropbox-container').should('be.visible');
    });

    it('a second toggle click during the close animation reopens the dropdown', () => {
      mount(slow);
      openAndClear();

      cy.window().then((win) => {
        const button = hostIn(win).querySelector('.vscomp-toggle-button') as HTMLElement;

        button.click();
        button.click();
      });
      cy.wait(300 + SETTLE_MS);

      expectLog(['beforeClose', 'afterClose', 'beforeOpen', 'afterOpen']);
      getHost().find('.vscomp-wrapper').should('have.attr', 'aria-expanded', 'true');
      getHost().find('.vscomp-dropbox-container').should('be.visible');
    });

    it('Down arrow during the close animation reopens the dropdown', () => {
      // A close long enough for cy.type() to land inside it.
      mount({ ...slow, hideDuration: 2000 });
      openAndClear();

      cy.window().then((win) => hostIn(win).close());
      getHost().find('.vscomp-wrapper').type('{downarrow}');
      cy.wait(300 + SETTLE_MS);

      expectLog(['beforeClose', 'afterClose', 'beforeOpen', 'afterOpen']);
      getHost().find('.vscomp-wrapper').should('have.attr', 'aria-expanded', 'true');
      getHost().find('.vscomp-dropbox-container').should('be.visible');
    });

    // An open that never finished fires no afterOpen: there is nothing left to focus or scroll.
    it('close() during the open animation fires no afterOpen', () => {
      mount(slow);

      cy.window().then((win) => {
        const host = hostIn(win);

        host.open();
        host.close();
      });
      cy.wait(300 + SETTLE_MS);

      expectLog(['beforeOpen', 'beforeClose', 'afterClose']);
    });

    it('opening B during A\'s open animation closes A silently with no afterOpen', () => {
      mount(slow);

      cy.window().then((win) => {
        mountVs(win, MOUNT_ID_B, baseOptions);
        hostIn(win).open();
        hostIn(win, MOUNT_ID_B).open();
      });
      cy.wait(300 + SETTLE_MS);

      expectLog(['beforeOpen']);
      getHost().find('.vscomp-wrapper').should('have.attr', 'aria-expanded', 'false');
    });
  });

  /**
   * Only a rotation, skew or mirror on the x or y axis makes repositions re-measure; the rotate and
   * scale properties are read as values, not as text.
   */
  context('re-measure detection', () => {
    (
      [
        ['rotate', '0deg', false],
        ['scale', '1 1 -1', false],
        ['scale', '0.8', false],
        ['rotate', '45deg', true],
        ['rotate', 'x 180deg', true],
        ['scale', '-1 1', true],
      ] as const
    ).forEach(([property, value, expected]) => {
      it(`an ancestor with ${property}: ${value} ${expected ? 'does' : 'does not'} switch to re-measuring`, () => {
        cy.window().then((win) => {
          const box = win.document.createElement('div');
          box.id = `${MOUNT_ID}-box`;
          box.style.setProperty(property, value);

          const host = win.document.createElement('div');
          host.id = MOUNT_ID;
          box.append(host);
          win.document.body.appendChild(box);

          // @ts-expect-error - VirtualSelect is attached to window by the bundle
          win.VirtualSelect.init({ ele: host, ...baseOptions });
          events = recordEvents(win, MOUNT_ID);
          hostIn(win).open();
        });
        expectLog(['beforeOpen', 'afterOpen']);

        cy.window().then((win) => {
          const instance = hostIn(win).virtualSelect as Instance & { dropboxPopover: { remeasure: boolean } };

          expect(win.getComputedStyle(win.document.getElementById(`${MOUNT_ID}-box`) as HTMLElement)[property], 'applied')
            .not.to.equal('none');
          expect(instance.dropboxPopover.remeasure, 're-measures').to.equal(expected);
        });
      });
    });
  });

  context('popup layout', () => {
    it('Escape with focus outside does not close the popup layout', () => {
      cy.viewport(400, 800);
      mount({ ...baseOptions, showDropboxAsPopup: true });
      openAndClear();
      addExternalButton();

      // The popup's backdrop covers the page, so the external button is not actionable.
      cy.get(`#${MOUNT_ID}-external`).focus().type('{esc}', { force: true });
      cy.wait(SETTLE_MS);

      expectLog([]);
      getHost().find('.vscomp-wrapper').should('not.have.class', 'closed');

      // Close it: destroy() leaves `vscomp-popup-active` (overflow: hidden) on the body, and
      // cy.visit() only changes the hash, so the class would leak into the following tests.
      cy.window().then((win) => hostIn(win).close());
      expectLog(['beforeClose', 'afterClose']);
    });
  });

  context('repositioning', () => {
    /** A scrollable box holding the host, so an ancestor can be scrolled. */
    const mountInScrollBox = (wrapper: 'self' | 'body', options: Record<string, unknown> = {}) => {
      cy.window().then((win) => {
        const box = win.document.createElement('div');
        box.id = `${MOUNT_ID}-box`;
        Object.assign(box.style, {
          // fixed: a page scroll (Cypress scrolls targets into view) must not move the box
          position: 'fixed',
          left: '400px',
          top: '100px',
          width: '500px',
          height: '300px',
          overflow: 'auto',
        });

        const before = win.document.createElement('div');
        before.style.height = '100px';

        const after = win.document.createElement('div');
        after.style.height = '1200px';

        const host = win.document.createElement('div');
        host.id = MOUNT_ID;
        Object.assign(host.style, { width: '240px', maxWidth: '240px' });

        box.append(before, host, after);
        win.document.body.appendChild(box);

        // @ts-expect-error - VirtualSelect is attached to window by the bundle
        win.VirtualSelect.init({ ele: host, ...baseOptions, ...options, dropboxWrapper: wrapper });
        events = recordEvents(win, MOUNT_ID);
      });
    };

    /** Scroll the box by `delta`; relative, because Cypress has already scrolled it to reach the toggle. */
    const scrollBoxBy = (delta: number) => {
      cy.get(`#${MOUNT_ID}-box`).then(($box) => {
        const target = $box[0].scrollTop + delta;

        $box[0].scrollTop = target;
        expect($box[0].scrollTop, 'box scrolled by the full delta').to.equal(target);
      });
    };

    it('dropboxWrapper body follows the host when an ancestor scrolls', () => {
      mountInScrollBox('body');
      openAndClear();

      let before = 0;

      // afterOpen can land while the slide is still finishing (the transition starts a frame after
      // the show timer); measure only once it has, or `before` is off by the remaining pixel or so.
      getHost().should(($host) => {
        const container = ($host[0] as Host).virtualSelect.$dropboxContainer;

        const view = container.ownerDocument.defaultView as Window;

        expect(view.getComputedStyle(container).opacity, 'fade-in finished').to.equal('1');
        before = container.getBoundingClientRect().top;
      });

      scrollBoxBy(60);

      getHost().should(($host) => {
        const after = ($host[0] as Host).virtualSelect.$dropboxContainer.getBoundingClientRect().top;

        expect(before - after, 'container moved up with the host').to.be.closeTo(60, 1);
      });
    });

    it('a reposition while the show transition still runs lands where the host now is', () => {
      cy.window().then((win) => {
        // Hold the slide back so it is still at its start after the show timer fires: the
        // dropbox is then 'shown' (listeners attached) while its translate is not the final one.
        const style = win.document.createElement('style');
        style.id = `${MOUNT_ID}-style`;
        style.textContent = '.vscomp-dropbox-container { transition-delay: 400ms !important; }';
        win.document.head.appendChild(style);
      });
      mountInScrollBox('body', { showDuration: 300, position: 'bottom left' });

      cy.window().then((win) => hostIn(win).open());
      expectLog(['beforeOpen', 'afterOpen']);
      scrollBoxBy(60);

      // The reposition's own write is held back by the same delay; let everything settle.
      cy.wait(1200);

      getHost().should(($host) => {
        const hostRect = $host[0].getBoundingClientRect();
        const rect = ($host[0] as Host).virtualSelect.$dropboxContainer.getBoundingClientRect();

        expect(rect.left, 'container left = host left').to.be.closeTo(hostRect.left, 1);
        expect(rect.top, 'container top = host bottom + margin').to.be.closeTo(hostRect.bottom + 4, 1);
      });
    });

    it('dropboxWrapper self does not rewrite the transform on ancestor scroll', () => {
      mountInScrollBox('self');
      openAndClear();

      let before = '';

      getHost().then(($host) => {
        before = ($host[0] as Host).virtualSelect.$dropboxContainer.style.transform;
        // Two empty strings would compare equal without characterizing anything.
        expect(before, 'a translate was written on open').to.match(/^translate3d\(/);
      });

      scrollBoxBy(60);

      cy.wait(SETTLE_MS);

      getHost().should(($host) => {
        const after = ($host[0] as Host).virtualSelect.$dropboxContainer.style.transform;

        expect(after, 'inline transform').to.equal(before);
      });
    });

    (
      [
        ['a scaled ancestor', 'scale(0.8)'],
        ['an ancestor scaled on one axis only', 'scale(1, 0.8)'],
      ] as const
    ).forEach(([ancestor, transform]) => {
      it(`dropboxWrapper self stays in place inside ${ancestor}`, () => {
        cy.window().then((win) => {
          const box = win.document.createElement('div');
          box.id = `${MOUNT_ID}-box`;
          Object.assign(box.style, {
            position: 'fixed',
            left: '100px',
            top: '100px',
            transform,
            transformOrigin: '0 0',
          });

          const host = win.document.createElement('div');
          host.id = MOUNT_ID;
          Object.assign(host.style, { width: '240px', maxWidth: '240px' });

          box.append(host);
          win.document.body.appendChild(box);

          // @ts-expect-error - VirtualSelect is attached to window by the bundle
          win.VirtualSelect.init({ ele: host, ...baseOptions, dropboxWrapper: 'self' });
          events = recordEvents(win, MOUNT_ID);
        });
        openAndClear();

        let before: [number, number] = [0, 0];

        getHost().should(($host) => {
          const container = ($host[0] as Host).virtualSelect.$dropboxContainer;
          const view = container.ownerDocument.defaultView as Window;

          expect(view.getComputedStyle(container).opacity, 'fade-in finished').to.equal('1');
          before = snapshotDropbox(view, MOUNT_ID).transform;

          // Opens against the host's edge: the placement is in viewport pixels, the translate in scaled ones.
          const hostRect = $host[0].getBoundingClientRect();
          const rect = container.getBoundingClientRect();

          expect(rect.left, 'container left = host left').to.be.closeTo(hostRect.left, 1);
          expect(rect.top, 'container top = host bottom + margin').to.be.closeTo(hostRect.bottom + 4, 1);
        });

        // 'self' attaches no scroll or resize listener; its repositions come from updatePosition(),
        // which the component calls when the list changes size (a search, for one).
        cy.window().then((win) => {
          for (let i = 0; i < 7; i += 1) {
            hostIn(win).virtualSelect.updatePosition();
          }

          const after = snapshotDropbox(win, MOUNT_ID).transform;

          expect(before[1], 'a translate was written').not.to.equal(0);
          expect(after[0], 'translate x after seven repositions').to.be.closeTo(before[0], 1);
          expect(after[1], 'translate y after seven repositions').to.be.closeTo(before[1], 1);
        });
      });
    });

    /**
     * A rotation or skew is not a per-axis scale: the dropbox is not claimed to sit against the
     * host's edge there (popover-plugin did not either), only to stay put across repositions.
     */
    (
      [
        ['a rotated ancestor', 'rotate(90deg)'],
        ['a skewed ancestor', 'skewX(20deg)'],
      ] as const
    ).forEach(([ancestor, transform]) => {
      it(`dropboxWrapper self does not drift inside ${ancestor}`, () => {
        cy.window().then((win) => {
          const box = win.document.createElement('div');
          box.id = `${MOUNT_ID}-box`;
          Object.assign(box.style, {
            position: 'fixed',
            left: '500px',
            top: '100px',
            transform,
            transformOrigin: '0 0',
          });

          const host = win.document.createElement('div');
          host.id = MOUNT_ID;
          Object.assign(host.style, { width: '240px', maxWidth: '240px' });

          box.append(host);
          win.document.body.appendChild(box);

          // @ts-expect-error - VirtualSelect is attached to window by the bundle
          win.VirtualSelect.init({ ele: host, ...baseOptions, dropboxWrapper: 'self' });
          events = recordEvents(win, MOUNT_ID);
        });
        cy.window().then((win) => hostIn(win).open());
        expectLog(['beforeOpen', 'afterOpen']);

        let before: [number, number] = [0, 0];

        getHost().should(($host) => {
          const container = ($host[0] as Host).virtualSelect.$dropboxContainer;
          const view = container.ownerDocument.defaultView as Window;

          expect(view.getComputedStyle(container).opacity, 'fade-in finished').to.equal('1');
          before = snapshotDropbox(view, MOUNT_ID).transform;
        });

        cy.window().then((win) => {
          for (let i = 0; i < 7; i += 1) {
            hostIn(win).virtualSelect.updatePosition();
          }

          const after = snapshotDropbox(win, MOUNT_ID).transform;

          expect(after[0], 'translate x after seven repositions').to.be.closeTo(before[0], 1);
          expect(after[1], 'translate y after seven repositions').to.be.closeTo(before[1], 1);
        });
      });
    });

    /**
     * A mirror is invisible to the open-time check when the dropbox opens with no horizontal
     * translate, so it has to come from the ancestors themselves. Here the dropbox lives in the
     * mirrored box while the host scrolls sideways in a box inside it, so x only becomes non-zero
     * after the first reposition.
     */
    it('a dropbox in a mirrored ancestor does not drift once the host has moved sideways', () => {
      cy.window().then((win) => {
        const box = win.document.createElement('div');
        box.id = `${MOUNT_ID}-box`;
        Object.assign(box.style, {
          position: 'fixed',
          left: '200px',
          top: '100px',
          width: '600px',
          height: '500px',
          transform: 'scaleX(-1)',
        });

        const scroller = win.document.createElement('div');
        scroller.id = `${MOUNT_ID}-scroller`;
        Object.assign(scroller.style, { width: '600px', height: '200px', overflow: 'auto' });

        const row = win.document.createElement('div');
        // The host starts at the box's left edge, where the dropbox rests too: the open translate has no x.
        Object.assign(row.style, { width: '1500px' });

        const host = win.document.createElement('div');
        host.id = MOUNT_ID;
        Object.assign(host.style, { width: '240px', maxWidth: '240px' });

        row.append(host);
        scroller.append(row);
        box.append(scroller);
        win.document.body.appendChild(box);

        // @ts-expect-error - VirtualSelect is attached to window by the bundle
        win.VirtualSelect.init({ ele: host, ...baseOptions, dropboxWrapper: `#${MOUNT_ID}-box` });
        events = recordEvents(win, MOUNT_ID);
        hostIn(win).open();
      });
      expectLog(['beforeOpen', 'afterOpen']);

      cy.get(`#${MOUNT_ID}-scroller`).then(($scroller) => {
        $scroller[0].scrollLeft = 100;
      });

      let before: [number, number] = [0, 0];

      // The scroll's reposition goes through the throttle and a frame: wait for it to land rather
      // than for a fixed time, or a late one leaves x at 0 and reads as drift.
      cy.window().should((win) => {
        before = snapshotDropbox(win, MOUNT_ID).transform;
        expect(before[0], 'the host move was applied').not.to.equal(0);
      });

      cy.window().then((win) => {
        for (let i = 0; i < 7; i += 1) {
          hostIn(win).virtualSelect.updatePosition();
        }

        const after = snapshotDropbox(win, MOUNT_ID).transform;

        expect(after[0], 'translate x after seven repositions').to.be.closeTo(before[0], 1);
        expect(after[1], 'translate y after seven repositions').to.be.closeTo(before[1], 1);
      });
    });

    /**
     * Scroll events do not leave a shadow root, and `document.contains()` does not look into one,
     * so a host inside a shadow root needs listeners on that root as well as on the document.
     */
    it('dropboxWrapper body follows a host inside a shadow root when its scroll box scrolls', () => {
      let box: HTMLElement;
      const opened: string[] = [];

      cy.window().then((win) => {
        const outer = win.document.createElement('div');
        outer.id = `${MOUNT_ID}-box`;
        Object.assign(outer.style, { position: 'fixed', left: '400px', top: '100px' });

        box = win.document.createElement('div');
        Object.assign(box.style, { width: '500px', height: '300px', overflow: 'auto' });

        const before = win.document.createElement('div');
        before.style.height = '100px';

        const after = win.document.createElement('div');
        after.style.height = '1200px';

        const host = win.document.createElement('div') as unknown as Host;
        Object.assign(host.style, { width: '240px', maxWidth: '240px' });

        box.append(before, host, after);
        outer.attachShadow({ mode: 'open' }).append(box);
        win.document.body.appendChild(outer);

        // @ts-expect-error - VirtualSelect is attached to window by the bundle
        win.VirtualSelect.init({ ele: host, ...baseOptions, dropboxWrapper: 'body' });
        shadowHost = host;
        host.addEventListener('afterOpen', () => opened.push('afterOpen'));
        host.open();
      });

      cy.wrap(null).should(() => {
        expect(opened, 'opened').to.include('afterOpen');
      });

      let before = 0;

      cy.wrap(null).should(() => {
        const container = (shadowHost as Host).virtualSelect.$dropboxContainer;
        const view = container.ownerDocument.defaultView as Window;

        expect(view.getComputedStyle(container).opacity, 'fade-in finished').to.equal('1');
        before = container.getBoundingClientRect().top;
      });

      cy.then(() => {
        box.scrollTop = 60;
        expect(box.scrollTop, 'box scrolled by the full delta').to.equal(60);
      });

      cy.wrap(null).should(() => {
        const after = (shadowHost as Host).virtualSelect.$dropboxContainer.getBoundingClientRect().top;

        expect(before - after, 'container moved up with the host').to.be.closeTo(60, 1);
      });
    });

    /**
     * A host slotted into a web component is laid out inside the component's shadow tree, which its
     * parentNode chain never enters: the walks have to go through the slot.
     * @param shadow the shadow root's markup, holding the one slot
     */
    const mountSlotted = (shadow: string, options: Record<string, unknown>) => {
      cy.window().then((win) => {
        const outer = win.document.createElement('div');
        outer.id = `${MOUNT_ID}-box`;
        Object.assign(outer.style, { position: 'fixed', left: '400px', top: '100px' });
        outer.attachShadow({ mode: 'open' }).innerHTML = shadow;

        const host = win.document.createElement('div');
        host.id = MOUNT_ID;
        Object.assign(host.style, { width: '240px', maxWidth: '240px' });

        outer.append(host);
        win.document.body.appendChild(outer);

        // @ts-expect-error - VirtualSelect is attached to window by the bundle
        win.VirtualSelect.init({ ele: host, ...baseOptions, ...options });
        events = recordEvents(win, MOUNT_ID);
        hostIn(win).open();
      });
      expectLog(['beforeOpen', 'afterOpen']);
    };

    it('dropboxWrapper body follows a slotted host when a scroll box in the shadow tree scrolls', () => {
      mountSlotted(
        '<div style="width: 500px; height: 300px; overflow: auto">' +
          '<div style="height: 100px"></div><slot></slot><div style="height: 1200px"></div></div>',
        { dropboxWrapper: 'body' },
      );

      let before = 0;

      getHost().should(($host) => {
        const container = ($host[0] as Host).virtualSelect.$dropboxContainer;
        const view = container.ownerDocument.defaultView as Window;

        expect(view.getComputedStyle(container).opacity, 'fade-in finished').to.equal('1');
        before = container.getBoundingClientRect().top;
      });

      cy.window().then((win) => {
        const scroller = win.document.getElementById(`${MOUNT_ID}-box`)?.shadowRoot?.firstElementChild as HTMLElement;

        scroller.scrollTop = 60;
        expect(scroller.scrollTop, 'box scrolled by the full delta').to.equal(60);
      });

      getHost().should(($host) => {
        const after = ($host[0] as Host).virtualSelect.$dropboxContainer.getBoundingClientRect().top;

        expect(before - after, 'container moved up with the host').to.be.closeTo(60, 1);
      });
    });

    it('a dropbox under a mirror in the shadow tree of a slotted host does not drift', () => {
      // Wider than the host and centred under it, so the open translate has an x to drift by.
      mountSlotted('<div style="width: 600px; transform: scaleX(-1)"><slot></slot></div>', {
        dropboxWrapper: 'self',
        dropboxWidth: '400px',
        position: 'bottom',
      });

      let before: [number, number] = [0, 0];

      getHost().should(($host) => {
        const container = ($host[0] as Host).virtualSelect.$dropboxContainer;
        const view = container.ownerDocument.defaultView as Window;

        expect(view.getComputedStyle(container).opacity, 'fade-in finished').to.equal('1');
        before = snapshotDropbox(view, MOUNT_ID).transform;
      });

      cy.window().then((win) => {
        for (let i = 0; i < 7; i += 1) {
          hostIn(win).virtualSelect.updatePosition();
        }

        const after = snapshotDropbox(win, MOUNT_ID).transform;

        expect(before[0], 'a horizontal translate was written').not.to.equal(0);
        expect(after[0], 'translate x after seven repositions').to.be.closeTo(before[0], 1);
        expect(after[1], 'translate y after seven repositions').to.be.closeTo(before[1], 1);
      });
    });

    it('dropboxWrapper body follows the host on viewport resize', () => {
      mount(
        { ...baseOptions, dropboxWrapper: 'body' },
        { position: 'fixed', top: '300px', right: '20px', width: '240px', maxWidth: '240px' },
      );
      openAndClear();

      let hostLeftBefore = 0;

      getHost().then(($host) => {
        hostLeftBefore = $host[0].getBoundingClientRect().left;
      });

      cy.viewport(1000, 800);

      getHost().should(($host) => {
        const hostLeft = $host[0].getBoundingClientRect().left;
        const containerLeft = ($host[0] as Host).virtualSelect.$dropboxContainer.getBoundingClientRect().left;

        expect(hostLeftBefore - hostLeft, 'host moved with the viewport').to.be.closeTo(280, 1);
        expect(containerLeft, 'container left edge tracks the host').to.be.closeTo(hostLeft, 1);
      });
    });

    context('listener cost', () => {
      const unthrottled = { ...baseOptions, dropboxWrapper: 'body', updatePositionThrottle: 0 };
      const container = (win: Window) => hostIn(win).virtualSelect.$dropboxContainer;

      it('repositions at most once per animation frame', () => {
        mount(unthrottled);
        openAndClear();

        let styleWrites: () => number;

        cy.window().then((win) => {
          styleWrites = watchStyleWrites(win, container(win));

          for (let i = 0; i < 10; i += 1) {
            scrollDocument(win);
          }
        });
        cy.window().then((win) => waitFrames(win, 2));

        cy.then(() => {
          // One reposition writes the transition duration and the transform.
          expect(styleWrites(), 'style writes for ten scrolls in one tick').to.be.at.most(2);
        });
      });

      it('leaves no scroll or resize listener after close', () => {
        mount(unthrottled);

        let listeners: ReturnType<typeof trackScrollAndResizeListeners>;

        cy.window().then((win) => {
          listeners = trackScrollAndResizeListeners(win);
        });
        openAndClear();
        toggle().click();
        expectLog(['beforeClose', 'afterClose']);

        cy.window().then((win) => {
          expect(listeners.added(), 'listeners added while open').to.be.at.least(2);
          expect(listeners.live(), 'listeners left after close').to.equal(0);
          // A leaked listener would request a frame before updatePosition() ignores it.
          expect(
            countFrameRequests(win, () => scrollAndResize(win)),
            'frames requested',
          ).to.equal(0);
        });
      });
    });
  });

  context('position option', () => {
    /** popover-plugin read an empty position as 'auto'; an unknown side used to throw on open. */
    (
      [
        ['empty', ''],
        ['null', null],
        ['an unknown side', 'center'],
      ] as const
    ).forEach(([name, position]) => {
      it(`opens with auto placement when position is ${name}`, () => {
        mount({ ...baseOptions, position });
        cy.window().then((win) => hostIn(win).open());
        expectLog(['beforeOpen', 'afterOpen']);

        cy.window().then((win) => {
          expect(['top', 'bottom'], 'auto picks top or bottom').to.include(snapshotDropbox(win, MOUNT_ID).side);
        });
      });
    });
  });

  context('reduced motion', () => {
    it('still fires the four events in order', () => {
      cy.window().then((win) => {
        const unboundMatchMedia = win.matchMedia;
        const originalMatchMedia = unboundMatchMedia.bind(win);

        restoreMatchMedia = () => {
          win.matchMedia = unboundMatchMedia;
        };
        win.matchMedia = ((query: string) =>
          query.includes('prefers-reduced-motion')
            ? ({
                matches: true,
                media: query,
                addEventListener() {},
                removeEventListener() {},
              } as unknown as MediaQueryList)
            : originalMatchMedia(query)) as typeof win.matchMedia;

        mountVs(win, MOUNT_ID, baseOptions);
        events = recordEvents(win, MOUNT_ID);
      });

      toggle().click();
      expectLog(['beforeOpen', 'afterOpen']);

      toggle().click();
      cy.wait(SETTLE_MS);

      expectLog(['beforeOpen', 'afterOpen', 'beforeClose', 'afterClose']);
    });
  });

  context('class timing', () => {
    it('toggles pop-comp-active and pop-comp-disable-events across open and close', () => {
      mount({ ...baseOptions, showDuration: 300, hideDuration: 300 });

      // The reduced-motion test above stubs matchMedia; a leaked stub would zero the durations.
      cy.window().then((win) => {
        expect(hostIn(win).virtualSelect.hideDuration, 'hide duration').to.equal(300);
      });

      const reads: { active: boolean; disableEvents: boolean }[] = [];

      const read = (host: Host) => {
        reads.push({
          active: host.classList.contains('pop-comp-active'),
          disableEvents: host.virtualSelect.$dropboxContainer.classList.contains('pop-comp-disable-events'),
        });
      };

      // Same tick as open()
      cy.window().then((win) => {
        const host = win.document.getElementById(MOUNT_ID) as Host;

        host.open();
        read(host);
      });

      expectLog(['beforeOpen', 'afterOpen']);

      // After afterOpen
      getHost().then(($host) => read($host[0] as Host));

      // Same tick as close()
      cy.window().then((win) => {
        const host = win.document.getElementById(MOUNT_ID) as Host;

        host.close();
        read(host);
      });

      expectLog(['beforeOpen', 'afterOpen', 'beforeClose', 'afterClose']);

      // After afterClose
      getHost().then(($host) => read($host[0] as Host));

      cy.then(() => {
        expect(
          reads.map((r) => r.active),
          'host has pop-comp-active at the four reads',
        ).to.deep.equal([true, true, true, false]);
        expect(
          reads.map((r) => r.disableEvents),
          'container has pop-comp-disable-events at the first read only',
        ).to.deep.equal([true, false, false, false]);
      });
    });
  });
});
