/** cSpell:ignore vscomp posinset setsize */

/**
 * Regression test for AI-5 / [PERF-01 + PERF-02] — INP / long tasks.
 *
 * Two costs sat on the scroll path. `calculateAriaMetadata()` walked every option and ran
 * at the top of every `renderOptions()`, and `onOptionsScroll` was bound with no throttling,
 * so a single drag produced one full O(n) re-render per scroll event (~9.5 ms at 100k
 * unthrottled, ~44 ms at 4x CPU) and blocked the main thread for the whole gesture.
 *
 * The ARIA scan now runs only when the filtered set or its order changes, and scroll
 * re-renders are coalesced to at most one per animation frame.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

describe('Perf: scroll path does no O(n) work per event (AI-5)', { testIsolation: true }, () => {
  const mountId = 'vs-perf-scroll';

  type Vs = {
    calculateAriaMetadata: () => void;
    setVisibleOptions: () => void;
    $optionsContainer: HTMLElement;
    ariaSetSize: number;
    scrollAnimationFrame: number | null;
    destroy: () => void;
  };

  const instance = () => cy.get(`#${mountId}`).then(($e) => $e[0].virtualSelect as Vs);

  /** Count calls to an instance method without changing its behaviour. */
  const countCalls = (vs: Record<string, any>, method: string, sink: { n: number }) => {
    const original = vs[method].bind(vs);

    // eslint-disable-next-line no-param-reassign
    vs[method] = (...args: unknown[]) => {
      sink.n += 1;
      return original(...args);
    };
  };

  const mount = (count: number, extra: Record<string, unknown> = {}) => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(count), search: true, ...extra }));
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
  };

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('does not rescan ARIA metadata while scrolling', () => {
    mount(2000);

    const calls = { n: 0 };

    instance().then((vs) => countCalls(vs as unknown as Record<string, any>, 'calculateAriaMetadata', calls));

    // Several distinct scroll positions, i.e. several real scroll events and re-renders.
    [200, 600, 1200, 2000, 3000].forEach((top) => {
      cy.get(`#${mountId}`).find('.vscomp-options-container').scrollTo(0, top);
    });
    cy.wait(200);

    cy.wrap(null).should(() => {
      expect(calls.n, 'calculateAriaMetadata calls during scrolling').to.equal(0);
    });
  });

  it('coalesces a burst of scroll events into at most one re-render per frame', () => {
    mount(2000);

    const renders = { n: 0 };

    instance().then((vs) => countCalls(vs as unknown as Record<string, any>, 'setVisibleOptions', renders));

    // Dispatch a burst synchronously: without coalescing this is one full re-render each.
    cy.get(`#${mountId}`).then(($e) => {
      const container = ($e[0].virtualSelect as Vs).$optionsContainer;

      for (let i = 1; i <= 20; i += 1) {
        container.scrollTop = i * 40;
        container.dispatchEvent(new Event('scroll'));
      }
    });

    cy.wait(200);

    cy.wrap(null).should(() => {
      expect(renders.n, '20 scroll events must not produce 20 re-renders').to.be.lessThan(20);
      expect(renders.n, 'the final position must still be rendered').to.be.greaterThan(0);
    });
  });

  it('still reports correct aria-setsize and aria-posinset after scrolling', () => {
    mount(2000);

    cy.get(`#${mountId}`).find('.vscomp-option[aria-setsize]').first().should('have.attr', 'aria-setsize', '2000');

    cy.get(`#${mountId}`).find('.vscomp-options-container').scrollTo(0, 4000);
    cy.wait(200);

    // setsize is a property of the filtered set, so scrolling must not change it...
    cy.get(`#${mountId}`).find('.vscomp-option[aria-setsize]').first().should('have.attr', 'aria-setsize', '2000');
    // ...while posinset must have advanced with the window.
    cy.get(`#${mountId}`)
      .find('.vscomp-option[aria-posinset]')
      .first()
      .invoke('attr', 'aria-posinset')
      .then((pos) => {
        expect(Number(pos), 'first rendered option advanced after scrolling').to.be.greaterThan(1);
      });
  });

  it('recomputes metadata when the filtered set changes', () => {
    mount(2000);

    cy.get(`#${mountId}`).find('.vscomp-search-input').focus().type('Option 15');

    // "Option 15", "Option 150".."Option 159", "Option 1500".."Option 1599" -> a smaller set.
    cy.get(`#${mountId}`)
      .find('.vscomp-option[aria-setsize]')
      .first()
      .invoke('attr', 'aria-setsize')
      .then((size) => {
        expect(Number(size), 'setsize reflects the filtered set, not the full one').to.be.lessThan(2000);
        expect(Number(size), 'setsize is still meaningful').to.be.greaterThan(0);
      });

    cy.get(`#${mountId}`).find('.vscomp-option[aria-posinset]').first().should('have.attr', 'aria-posinset', '1');
  });

  it('recomputes metadata when the option set is replaced', () => {
    mount(2000);

    cy.get(`#${mountId}`).then(($e) => $e[0].setOptions?.(makeOptions(7)));

    cy.get(`#${mountId}`).find('.vscomp-option[aria-setsize]').first().should('have.attr', 'aria-setsize', '7');
  });

  it('cancels a queued scroll re-render on destroy', () => {
    mount(2000);

    cy.get(`#${mountId}`).then(($e) => {
      const vs = $e[0].virtualSelect as Vs;

      // Queue a frame, then tear down before it can run.
      vs.$optionsContainer.scrollTop = 400;
      vs.$optionsContainer.dispatchEvent(new Event('scroll'));
      expect(vs.scrollAnimationFrame, 'a frame is queued').to.not.eq(null);

      vs.destroy();
      expect(vs.scrollAnimationFrame, 'the queued frame is cancelled on destroy').to.eq(null);
    });

    // A leaked frame would throw against detached DOM and fail the test via an uncaught error.
    cy.wait(200);
  });
});
