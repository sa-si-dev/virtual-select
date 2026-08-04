/** cSpell:ignore vscomp */

/**
 * Regression test for AI-17 / [PERF-03] - INP / forced synchronous layout.
 *
 * willTextOverflow() created a div, read getComputedStyle twice, appended it to <body>,
 * read clientWidth and removed it again - once per selected tag. Each mutation invalidates
 * layout for the read that follows, so a render with many tags meant a burst of forced
 * synchronous layouts.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

describe('Perf: one shared text measurer (AI-17)', { testIsolation: true }, () => {
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

    // The docs page hosts other instances, so only assert removal once none remain.
    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      const remaining = win.VirtualSelect.activeInstances?.size ?? 0;

      if (remaining === 0) {
        cy.get('.vscomp-text-measurer').should('not.exist');
      }
    });
  });
});
