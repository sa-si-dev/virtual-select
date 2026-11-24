/** cSpell:ignore vscomp */

/**
 * Characterization of the dropdown's open/close lifecycle: which events fire, in which order and
 * how often, for every way of closing it, plus when the dropbox follows its host.
 *
 * Pinned to what `master` does today, defects included (a duplicated `afterClose`, a dropdown
 * left "stuck" after a silent close). Assertions the positioner swap deliberately changes carry
 * the comment `// CHARACTERIZATION: master today; changes in PR 2` so they can be found and
 * rewritten.
 *
 * Virtual Select dispatches its events through `setTimeout(0)`, so every log assertion waits on
 * the recorded array (a retrying assertion) instead of reading it synchronously.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';
import { blockTooltipPlugin, recordEvents } from '../support/dropbox-probe';

type Instance = { open: () => void; close: () => void; $dropboxContainer: HTMLElement };
type Host = HTMLElement & { open: () => void; close: () => void; virtualSelect: Instance };

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

/** Undoes the matchMedia stub of the reduced-motion test; the page is not reloaded between tests. */
let restoreMatchMedia: (() => void) | undefined;

describe('Dropbox lifecycle characterization', () => {
  beforeEach(() => {
    blockTooltipPlugin();
    cy.viewport(1280, 800);
    cy.visit('get-started');
  });

  afterEach(() => {
    cy.window().then((win) => {
      restoreMatchMedia?.();
      restoreMatchMedia = undefined;
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

    it('outside click fires afterClose twice', () => {
      cy.get('body').click(5, 5);
      cy.wait(SETTLE_MS);

      // CHARACTERIZATION: master today; changes in PR 2
      expectLog(['beforeClose', 'afterClose', 'afterClose']);
    });

    it('Escape with focus inside fires afterClose twice', () => {
      getHost().find('.vscomp-search-input').focus().type('{esc}');
      cy.wait(SETTLE_MS);

      // CHARACTERIZATION: master today; changes in PR 2
      expectLog(['beforeClose', 'afterClose', 'afterClose']);
    });

    it('Escape with focus outside closes silently and leaves aria-expanded true', () => {
      cy.window().then((win) => {
        const external = win.document.createElement('button');
        external.id = `${MOUNT_ID}-external`;
        external.textContent = 'external';
        win.document.body.appendChild(external);
      });

      cy.get(`#${MOUNT_ID}-external`).focus().type('{esc}');
      cy.wait(SETTLE_MS);

      // CHARACTERIZATION: master today; changes in PR 2
      expectLog(['afterClose']);
      // CHARACTERIZATION: master today; changes in PR 2
      getHost().find('.vscomp-wrapper').should('have.attr', 'aria-expanded', 'true');
    });

    it('closing twice in one tick fires both close events twice', () => {
      cy.window().then((win) => {
        const host = win.document.getElementById(MOUNT_ID) as Host;

        host.close();
        host.close();
      });
      cy.wait(SETTLE_MS);

      // CHARACTERIZATION: master today; changes in PR 2
      expectLog(['beforeClose', 'beforeClose', 'afterClose', 'afterClose']);
    });
  });

  context('second instance', () => {
    it('opening B from script leaves A open and stuck after a later A.open()', () => {
      mount();

      cy.window().then((win) => {
        mountVs(win, MOUNT_ID_B, baseOptions);
      });

      openAndClear();

      cy.window().then((win) => {
        (win.document.getElementById(MOUNT_ID_B) as Host).open();
      });
      cy.wait(SETTLE_MS);

      // CHARACTERIZATION: master today; changes in PR 2
      expectLog([]);
      // CHARACTERIZATION: master today; changes in PR 2
      getHost().should('have.class', 'pop-comp-active');

      cy.window().then((win) => {
        (win.document.getElementById(MOUNT_ID) as Host).open();
      });
      cy.wait(SETTLE_MS);

      // CHARACTERIZATION: master today; changes in PR 2
      expectLog(['beforeOpen']);
      // CHARACTERIZATION: master today; changes in PR 2
      getHost().find('.vscomp-dropbox-container').should('not.be.visible');
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
        const instance = (win.document.getElementById(MOUNT_ID) as Host).virtualSelect as Instance & {
          hideDuration: number;
        };

        expect(instance.hideDuration, 'hide duration').to.equal(300);
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
