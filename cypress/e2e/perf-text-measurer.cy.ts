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

  /**
   * The one case that needs to be the *only* instance on the page, so it mounts on a docs page
   * that hosts no demos of its own.
   *
   * `get-started` keeps two instances alive, which is why this case used to be written as
   * `if (remaining === 0) { ...assert... }` — a condition that is false on every run, so its only
   * assertion was skipped every time: it reported green while verifying nothing, and
   * `Utils.removeTextMeasurer()` was never exercised at all.
   *
   * Destroying the page's own instances to force the condition works in a plain browser but hangs
   * the Cypress runner, so this takes the other route: `properties` renders real content, loads
   * the same bundle and starts with zero instances (measured), which makes our mount genuinely the
   * last one. Nothing outside this test is torn down, and the precondition is asserted rather than
   * assumed — if that page ever gains a demo, this fails loudly instead of going quiet again.
   */
  it('removes the measurer once the last instance is destroyed', () => {
    cy.viewport(1280, 800);
    cy.visit('properties');

    cy.window().should((win) => {
      // @ts-expect-error - bundle global
      expect(win.VirtualSelect.activeInstances.size, 'this page hosts no instances of its own').to.equal(0);
    });

    cy.window().then((win) =>
      mountVs(win, mountId, { options: makeOptions(5), multiple: true, showValueAsTags: true }),
    );
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="o1"]').click();
    cy.get('.vscomp-text-measurer').should('exist');

    cy.window().then((win) => unmountVs(win, mountId));

    cy.window().should((win) => {
      // @ts-expect-error - bundle global
      expect(win.VirtualSelect.activeInstances.size, 'no instances left').to.equal(0);
    });

    cy.get('.vscomp-text-measurer').should('not.exist');
  });
});
