/** cSpell:ignore vscomp */

/**
 * Measuring whether a tag's text overflows must not thrash layout.
 *
 * The check runs once per selected tag. It used to create a div, read getComputedStyle twice,
 * append it to <body>, read clientWidth and remove it again - and each DOM mutation
 * invalidates layout for the read that follows, so rendering many tags produced a burst of
 * forced synchronous layouts.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

describe('Perf: one shared text measurer', { testIsolation: true }, () => {
  const mountId = 'vs-measurer';

  const mount = () => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) =>
      mountVs(win, mountId, { options: makeOptions(5), multiple: true, showValueAsTags: true }),
    );
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
  };

  it('reuses a single off-screen node instead of one per tag', () => {
    mount();

    // Several tags, i.e. several willTextOverflow() calls per render.
    ['o1', 'o2', 'o3', 'o4'].forEach((v) => {
      cy.get(`#${mountId}`).find(`.vscomp-option[data-value="${v}"]`).click();
    });

    cy.get('.vscomp-text-measurer').should('have.length', 1);
  });

  it('keeps the measurer out of the accessibility tree and out of flow', () => {
    mount();
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="o1"]').click();

    cy.get('.vscomp-text-measurer').should('have.attr', 'aria-hidden', 'true');
    cy.get('.vscomp-text-measurer').should('have.css', 'position', 'absolute');
  });

  it('still detects overflow, so tag tooltips are unaffected', () => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) =>
      mountVs(win, mountId, {
        options: [
          { label: 'A label far too long to fit inside a narrow tag without being clipped', value: 'long' },
          { label: 'Ok', value: 'short' },
        ],
        multiple: true,
        showValueAsTags: true,
      }),
    );
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    cy.get(`#${mountId}`).find('.vscomp-option[data-value="long"]').click();
    // Overflowing text still gets a tooltip, i.e. the measurement still works.
    cy.get(`#${mountId}`).find('.vscomp-value-tag').first().should('have.attr', 'data-tooltip');

    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('removes the measurer once the last instance is destroyed', () => {
    mount();
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="o1"]').click();
    cy.get('.vscomp-text-measurer').should('exist');

    cy.window().then((win) => unmountVs(win, mountId));

    /**
     * The docs page hosts its own instances, so unmounting ours does not reach the state this
     * case is named for. It used to *test* for that state — `if (remaining === 0)` — which is
     * false on every run, so its only assertion was skipped every time: the case reported green
     * while verifying nothing, and `Utils.removeTextMeasurer()` was never exercised.
     *
     * Create the state instead of waiting for it. Safe to tear the page down here: this describe
     * runs with `testIsolation: true`, so the next case gets a fresh page, and this is the last
     * case in the file either way.
     */
    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      const instances = Array.from(win.VirtualSelect.activeInstances) as Array<{ destroy: () => void }>;

      expect(instances, 'the docs page has instances to destroy').to.have.length.greaterThan(0);
      instances.forEach((vs) => vs.destroy());

      // @ts-expect-error - bundle global
      expect(win.VirtualSelect.activeInstances.size, 'no instances left').to.equal(0);
    });

    cy.get('.vscomp-text-measurer').should('not.exist');
  });
});
