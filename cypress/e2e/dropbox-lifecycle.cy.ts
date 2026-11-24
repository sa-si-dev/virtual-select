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
import { blockTooltipPlugin, recordEvents } from '../support/dropbox-probe';

type Instance = { open: () => void; close: () => void; $dropboxContainer: HTMLElement };
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

describe('Dropbox lifecycle', () => {
  beforeEach(() => {
    blockTooltipPlugin();
    cy.viewport(1280, 800);
    cy.visit('get-started');
  });

  afterEach(() => {
    cy.window().then((win) => {
      unmountVs(win, MOUNT_ID);
      unmountVs(win, MOUNT_ID_B);
      win.document.getElementById(`${MOUNT_ID}-box`)?.remove();
      win.document.getElementById(`${MOUNT_ID}-external`)?.remove();
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
    it('destroy during the hide transition fires no afterClose and leaves no listeners', () => {
      // dropboxWrapper 'body' is the configuration that attaches scroll and resize listeners.
      mount({ ...baseOptions, hideDuration: 200, dropboxWrapper: 'body' });
      openAndClear();

      let container: HTMLElement;
      let styleWrites: () => number;

      cy.window().then((win) => {
        const host = hostIn(win);
        container = host.virtualSelect.$dropboxContainer;

        host.close();
        host.destroy();
      });
      cy.wait(400);

      cy.then(() => {
        expect(events, 'close events after destroy').not.to.include('afterClose');
      });

      cy.window().then((win) => {
        styleWrites = watchStyleWrites(win, container);

        expect(() => scrollAndResize(win), 'scroll and resize after destroy').not.to.throw();
      });
      cy.window().then((win) => waitFrames(win, 2));
      cy.wait(SETTLE_MS);

      cy.then(() => {
        expect(styleWrites(), 'style writes after destroy').to.equal(0);
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
    const mountInScrollBox = (wrapper: 'self' | 'body') => {
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
        win.VirtualSelect.init({ ele: host, ...baseOptions, dropboxWrapper: wrapper });
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

      getHost().then(($host) => {
        before = ($host[0] as Host).virtualSelect.$dropboxContainer.getBoundingClientRect().top;
      });

      scrollBoxBy(60);

      getHost().should(($host) => {
        const after = ($host[0] as Host).virtualSelect.$dropboxContainer.getBoundingClientRect().top;

        expect(before - after, 'container moved up with the host').to.be.closeTo(60, 1);
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
        openAndClear();
        toggle().click();
        expectLog(['beforeClose', 'afterClose']);

        let styleWrites: () => number;

        cy.window().then((win) => {
          styleWrites = watchStyleWrites(win, container(win));
          scrollAndResize(win);
        });
        cy.window().then((win) => waitFrames(win, 2));
        cy.wait(SETTLE_MS);

        cy.then(() => {
          expect(styleWrites(), 'style writes after close').to.equal(0);
        });
      });
    });
  });

  context('reduced motion', () => {
    it('still fires the four events in order', () => {
      cy.window().then((win) => {
        const originalMatchMedia = win.matchMedia.bind(win);

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
