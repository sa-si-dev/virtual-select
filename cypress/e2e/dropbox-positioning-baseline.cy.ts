/** cSpell:ignore vscomp */

/**
 * Characterization of where the dropdown's dropbox lands, which `pop-comp-*` / `position-*`
 * classes it carries and its computed styles, for a grid of positions, anchors and wrappers, and
 * of the state the dropbox is left in once it closes again (`<id>|after-close`).
 *
 * Expected values live in `cypress/fixtures/dropbox-baseline.json`, recorded on the code before
 * the positioning engine was replaced. The same spec must keep passing unchanged afterwards.
 *
 * Every scenario blocks tooltip-plugin, so the bundled engine places the dropbox, except the
 * `tooltip-plugin|*` ones: a page that loads tooltip.min.js after the bundle (the docs site, the
 * README's optional setup) has its dropbox placed by tooltip-plugin's older engine instead, which
 * keeps fractional coordinates. Those scenarios use a fractional anchor, where the two differ.
 *
 * Record:  npx cypress run --expose RECORD_BASELINE=1 --spec cypress/e2e/dropbox-positioning-baseline.cy.ts
 * Recording is refused unless the popover-plugin engine is loaded, so only this PR's code can do it.
 * When any scenario fails, the fixture is left alone: the actual set goes to
 * ci-results/dropbox-baseline.actual.json, in record mode and on a mismatch alike.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';
import { blockTooltipPlugin, DropboxSnapshot, recordEvents, snapshotDropbox } from '../support/dropbox-probe';

/** `self`, `body`, or the selector of a custom wrapper element. */
type Wrapper = string;

type Scenario = {
  id: string;
  position: string;
  wrapper: Wrapper;
  /** Leave tooltip-plugin loaded, so its engine replaces the bundled one. */
  keepTooltipPlugin?: boolean;
  hostStyle: Partial<CSSStyleDeclaration>;
  viewport?: [number, number];
  /** Snapshot taken before the first open, stored under `<id>|closed`. */
  closedSnapshot?: boolean;
  /** Skip opening: the scenario only characterizes the never-opened state. */
  closedOnly?: boolean;
  showAsPopup?: boolean;
  dropboxWidth?: string;
  setup?: (win: Window) => void;
  mount?: (win: Window, mountId: string, options: Record<string, unknown>, style: Partial<CSSStyleDeclaration>) => void;
  afterMount?: () => void;
};

const MOUNT_ID = 'vs-dropbox-baseline';
const FIXTURE_PATH = 'cypress/fixtures/dropbox-baseline.json';
const ACTUAL_PATH = 'ci-results/dropbox-baseline.actual.json';

const POSITIONS = [
  'auto',
  'top',
  'bottom',
  'top left',
  'top right',
  'bottom left',
  'bottom right',
  'left',
  'right',
];

const ANCHORS: Record<string, { left: string; top: string }> = {
  middle: { left: '500px', top: '350px' },
  'top-edge': { left: '500px', top: '8px' },
  'bottom-edge': { left: '500px', top: '740px' },
  'left-edge': { left: '2px', top: '350px' },
  'right-edge': { left: '1038px', top: '350px' },
};

const WRAPPERS: Wrapper[] = ['self', 'body'];

const CUSTOM_WRAPPER = `#${MOUNT_ID}-box`;

const baseHostStyle = (anchor: { left: string; top: string }): Partial<CSSStyleDeclaration> => ({
  position: 'fixed',
  width: '240px',
  maxWidth: '240px',
  ...anchor,
});

/** Mount a host inside a 300px-high scrolling box that has been scrolled by 120px. */
const mountInScrollAncestor: Scenario['mount'] = (win, mountId, options, style) => {
  const box = win.document.createElement('div');
  box.id = `${mountId}-box`;
  Object.assign(box.style, {
    position: 'absolute',
    left: '400px',
    top: '200px',
    width: '500px',
    height: '300px',
    overflow: 'auto',
  });

  const before = win.document.createElement('div');
  before.style.height = '200px';

  const after = win.document.createElement('div');
  after.style.height = '800px';

  const host = win.document.createElement('div');
  host.id = mountId;
  Object.assign(host.style, style);

  box.append(before, host, after);
  win.document.body.appendChild(box);

  // @ts-expect-error - VirtualSelect is attached to window by the bundle
  win.VirtualSelect.init({ ele: host, ...options });
  box.scrollTop = 120;
};

/**
 * Mount a host inside an offset, positioned box that is also the dropbox wrapper (a modal body,
 * say), so the dropbox is placed relative to that box rather than the page. `scrollTop` scrolls
 * the box after init.
 */
const mountInCustomWrapper =
  (scrollTop: number): Scenario['mount'] =>
  (win, mountId, options, style) => {
    const box = win.document.createElement('div');
    box.id = `${mountId}-box`;
    Object.assign(box.style, {
      position: 'absolute',
      left: '300px',
      top: '150px',
      width: '600px',
      height: '400px',
      overflow: 'auto',
    });

    const before = win.document.createElement('div');
    before.style.height = '120px';

    const after = win.document.createElement('div');
    after.style.height = '800px';

    const host = win.document.createElement('div');
    host.id = mountId;
    Object.assign(host.style, style);

    box.append(before, host, after);
    win.document.body.appendChild(box);

    // @ts-expect-error - VirtualSelect is attached to window by the bundle
    win.VirtualSelect.init({ ele: host, ...options });
    box.scrollTop = scrollTop;
  };

const buildScenarios = (): Scenario[] => {
  const scenarios: Scenario[] = [];

  POSITIONS.forEach((position) => {
    Object.entries(ANCHORS).forEach(([anchorName, anchor]) => {
      WRAPPERS.forEach((wrapper) => {
        scenarios.push({
          id: `${position}|${anchorName}|${wrapper}`,
          position,
          wrapper,
          hostStyle: baseHostStyle(anchor),
        });
      });
    });
  });

  WRAPPERS.forEach((wrapper) => {
    scenarios.push({
      id: `page-scrolled|${wrapper}`,
      position: 'bottom left',
      wrapper,
      hostStyle: { ...baseHostStyle({ left: '500px', top: '1000px' }), position: 'absolute' },
      setup: (win) => {
        win.document.body.style.minHeight = '3000px';
      },
      afterMount: () => {
        cy.scrollTo(0, 650);
      },
    });

    scenarios.push({
      id: `scroll-ancestor|${wrapper}`,
      position: 'bottom left',
      wrapper,
      hostStyle: { width: '240px', maxWidth: '240px', position: 'relative' },
      mount: mountInScrollAncestor,
    });

    scenarios.push({
      id: `rtl|${wrapper}`,
      position: 'bottom left',
      wrapper,
      hostStyle: baseHostStyle(ANCHORS.middle),
      setup: (win) => {
        win.document.documentElement.dir = 'rtl';
      },
    });

    scenarios.push({
      id: `closed-state|${wrapper}`,
      position: 'bottom left',
      wrapper,
      hostStyle: baseHostStyle(ANCHORS.middle),
      closedOnly: true,
      closedSnapshot: true,
    });
  });

  // By default the dropbox is as wide as the host, which makes left/right alignment and rtl
  // indistinguishable. A wider dropbox makes them visible.
  ['top left', 'top right', 'bottom left', 'bottom right'].forEach((position) => {
    ['middle', 'left-edge', 'right-edge'].forEach((anchorName) => {
      WRAPPERS.forEach((wrapper) => {
        scenarios.push({
          id: `wide|${position}|${anchorName}|${wrapper}`,
          position,
          wrapper,
          hostStyle: baseHostStyle(ANCHORS[anchorName]),
          dropboxWidth: '400px',
        });
      });
    });
  });

  WRAPPERS.forEach((wrapper) => {
    scenarios.push({
      id: `wide|rtl|${wrapper}`,
      position: 'bottom left',
      wrapper,
      hostStyle: baseHostStyle(ANCHORS.middle),
      dropboxWidth: '400px',
      setup: (win) => {
        win.document.documentElement.dir = 'rtl';
      },
    });
  });

  ['bottom left', 'top right', 'auto', 'right'].forEach((position) => {
    scenarios.push({
      id: `custom-wrapper|${position}`,
      position,
      wrapper: CUSTOM_WRAPPER,
      hostStyle: { width: '240px', maxWidth: '240px', marginLeft: '150px' },
      mount: mountInCustomWrapper(0),
    });
  });

  scenarios.push({
    id: 'custom-wrapper-scrolled|bottom left',
    position: 'bottom left',
    wrapper: CUSTOM_WRAPPER,
    hostStyle: { width: '240px', maxWidth: '240px', marginLeft: '150px' },
    mount: mountInCustomWrapper(60),
  });

  ['auto', 'top right', 'bottom left'].forEach((position) => {
    WRAPPERS.forEach((wrapper) => {
      scenarios.push({
        id: `tooltip-plugin|${position}|${wrapper}`,
        position,
        wrapper,
        keepTooltipPlugin: true,
        hostStyle: baseHostStyle({ left: '500.3px', top: '350.7px' }),
      });
    });
  });

  scenarios.push({
    id: 'popup-layout',
    position: 'bottom left',
    wrapper: 'body',
    hostStyle: baseHostStyle(ANCHORS.middle),
    viewport: [400, 800],
    showAsPopup: true,
    closedSnapshot: true,
  });

  return scenarios;
};

describe('Dropbox positioning baseline', () => {
  const recordMode = !!Cypress.expose('RECORD_BASELINE');
  const actualSet: Record<string, DropboxSnapshot> = {};
  let fixture: Record<string, DropboxSnapshot> = {};
  let anyFailed = false;

  /** JSON with a final newline, as .editorconfig asks. */
  const writeJson = (filePath: string, data: unknown) => {
    cy.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
  };

  before(() => {
    if (recordMode) {
      // Recorded on the replacement engine, the fixture would pin what it is meant to check.
      blockTooltipPlugin();
      cy.visit('get-started');
      cy.window().then((win) => {
        if (!('PopoverComponent' in win)) {
          throw new Error(
            'RECORD_BASELINE refused: record only on the popover-plugin engine (window.PopoverComponent).',
          );
        }
      });
    } else {
      cy.fixture('dropbox-baseline').then((data) => {
        fixture = data;
      });
    }
  });

  afterEach(function () {
    cy.window().then((win) => {
      unmountVs(win, MOUNT_ID);
      win.document.getElementById(`${MOUNT_ID}-box`)?.remove();
      win.document.documentElement.dir = '';
      // The page is not reloaded between scenarios: undo the page-scrolled ones' height and scroll.
      win.document.body.style.minHeight = '';
      win.scrollTo(0, 0);
    });

    if (this.currentTest?.state === 'failed') {
      anyFailed = true;
    }
  });

  after(() => {
    // A failed scenario has no entry in actualSet: recording it would drop that key from the
    // fixture. A refused recording runs this hook too, with nothing recorded: keep the fixture.
    if (anyFailed) {
      writeJson(ACTUAL_PATH, actualSet);
    } else if (recordMode && Object.keys(actualSet).length) {
      writeJson(FIXTURE_PATH, actualSet);
    }
  });

  const check = (id: string, actual: DropboxSnapshot, closed: boolean) => {
    actualSet[id] = actual;

    if (recordMode) {
      return;
    }

    const expected = fixture[id];
    expect(expected, `${id} has a fixture entry`).to.not.equal(undefined);

    // Before the first open, the previous engine already measured and placed the container at
    // init, whereas the replacement does no layout until it opens; after a close, the previous
    // engine leaves its last placement behind. So a closed snapshot only asserts what must hold
    // either way: host classes, `pop-comp-*` container classes and styles. `side` and
    // `transform` are only asserted for open snapshots.
    const popCompOnly = (names: string[]) => names.filter((name) => name.startsWith('pop-comp-'));

    expect(actual.eleClasses, `${id} host classes`).to.deep.equal(expected.eleClasses);
    expect(actual.style, `${id} computed style`).to.deep.equal(expected.style);

    if (closed) {
      expect(popCompOnly(actual.containerClasses), `${id} container classes`).to.deep.equal(
        popCompOnly(expected.containerClasses),
      );
      return;
    }

    expect(actual.side, `${id} side`).to.equal(expected.side);
    expect(actual.containerClasses, `${id} container classes`).to.deep.equal(expected.containerClasses);
    expect(Math.abs(actual.transform[0] - expected.transform[0]), `${id} x`).to.be.at.most(1);
    expect(Math.abs(actual.transform[1] - expected.transform[1]), `${id} y`).to.be.at.most(1);
  };

  buildScenarios().forEach((scenario) => {
    it(scenario.id, () => {
      const [width, height] = scenario.viewport ?? [1280, 800];
      cy.viewport(width, height);

      const keepTooltipPlugin = !!scenario.keepTooltipPlugin;

      if (!keepTooltipPlugin) {
        blockTooltipPlugin();
      }

      cy.visit('get-started');

      // Visiting the URL already open does not reload the page, which may still be the one an
      // earlier scenario loaded with or without tooltip-plugin. tooltip-plugin sets
      // `tooltipComponentInitiated`; reload when the page does not match the scenario.
      const tooltipLoaded = (win: Window) => 'tooltipComponentInitiated' in win;

      cy.window().then((win) => {
        if (tooltipLoaded(win) !== keepTooltipPlugin) {
          cy.reload();
        }
      });

      cy.window().then((win) => {
        expect(tooltipLoaded(win), 'tooltip-plugin loaded').to.equal(keepTooltipPlugin);
      });

      let events: string[] = [];

      cy.window().then((win) => {
        scenario.setup?.(win);

        const options = {
          options: makeOptions(8),
          showDuration: 50,
          hideDuration: 50,
          position: scenario.position,
          dropboxWrapper: scenario.wrapper,
          ...(scenario.dropboxWidth ? { dropboxWidth: scenario.dropboxWidth } : {}),
          ...(scenario.showAsPopup ? { showDropboxAsPopup: true } : {}),
        };

        if (scenario.mount) {
          scenario.mount(win, MOUNT_ID, options, scenario.hostStyle);
        } else {
          mountVs(win, MOUNT_ID, options, scenario.hostStyle);
        }

        events = recordEvents(win, MOUNT_ID);
      });

      scenario.afterMount?.();

      if (scenario.closedSnapshot) {
        cy.window().then((win) => {
          check(scenario.closedOnly ? scenario.id : `${scenario.id}|closed`, snapshotDropbox(win, MOUNT_ID), true);
        });
      }

      if (scenario.closedOnly) {
        return;
      }

      cy.window().then((win) => {
        (win.document.getElementById(MOUNT_ID) as HTMLElement & { open: () => void }).open();
      });

      // `events` is assigned in an earlier command, so read it inside a retried callback.
      cy.wrap(null).should(() => {
        expect(events).to.include('afterOpen');
      });

      // `afterOpen` can fire while the container is still fading in, so wait for the fade to finish
      // instead of sampling a mid-transition opacity.
      cy.window().should((win) => {
        expect(snapshotDropbox(win, MOUNT_ID).style.opacity, `${scenario.id} fade-in finished`).to.equal('1');
      });

      cy.window().then((win) => {
        check(scenario.id, snapshotDropbox(win, MOUNT_ID), false);
        (win.document.getElementById(MOUNT_ID) as HTMLElement & { close: () => void }).close();
      });

      cy.wrap(null).should(() => {
        expect(events).to.include('afterClose');
      });

      cy.window().then((win) => {
        check(`${scenario.id}|after-close`, snapshotDropbox(win, MOUNT_ID), true);
      });
    });
  });
});
