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
        expect(countFrameRequests(win, () => scrollAndResize(win)), 'frames requested').to.equal(0);
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

      cy.window().then((win) => {
        hostIn(win).open();
      });

      expectLog(['beforeOpen', 'afterOpen']);
      getHost().find('.vscomp-dropbox-container').should('be.visible');
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
      });

      scrollBoxBy(60);

      cy.wait(SETTLE_MS);

      getHost().should(($host) => {
        const after = ($host[0] as Host).virtualSelect.$dropboxContainer.style.transform;

        expect(after, 'inline transform').to.equal(before);
      });
    });

    it('dropboxWrapper self stays in place inside a scaled ancestor', () => {
      cy.window().then((win) => {
        const box = win.document.createElement('div');
        box.id = `${MOUNT_ID}-box`;
        Object.assign(box.style, {
          position: 'fixed',
          left: '100px',
          top: '100px',
          transform: 'scale(0.8)',
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
          expect(countFrameRequests(win, () => scrollAndResize(win)), 'frames requested').to.equal(0);
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
