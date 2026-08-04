/** cSpell:ignore vscomp */

/**
 * Regression test for AI-11 / [A11Y-13] — WCAG 2.5.8 Target Size (Minimum), AA.
 *
 * Two controls were smaller than the 24x24 CSS px minimum: the "Select All" checkbox
 * (measured 25x15) and the per-tag clear button (20x20). Both are pointer targets, so
 * users with limited dexterity had to hit a target under half the required area.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

const MIN_TARGET = 24;

describe('A11y: pointer targets meet the 24x24 minimum (AI-11)', () => {
  const mountId = 'vs-a11y-target-size';

  /**
   * Assert both dimensions of the first match are at least 24 CSS px.
   *
   * getBoundingClientRect() returns fractional values (a 24px box can measure
   * 23.999998 under device-pixel rounding), so compare on rounded values - otherwise the
   * assertion fails on sub-pixel noise rather than on a real target-size problem.
   */
  const assertMinTarget = (selector: string, label: string) => {
    cy.get(`#${mountId}`)
      .find(selector)
      .first()
      .then(($el) => {
        const rect = $el[0].getBoundingClientRect();

        expect(Math.round(rect.width), `${label} width`).to.be.at.least(MIN_TARGET);
        expect(Math.round(rect.height), `${label} height`).to.be.at.least(MIN_TARGET);
      });
  };

  const mount = (extra: Record<string, unknown> = {}) => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(5), ...extra }));
  };

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('gives the Select All checkbox a large enough target', () => {
    mount({ multiple: true, search: true });
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    assertMinTarget('.vscomp-toggle-all-button', 'Select All button');
  });

  it('gives the Select All checkbox a large enough target without a search input', () => {
    mount({ multiple: true, search: false });
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    assertMinTarget('.vscomp-toggle-all-button', 'Select All button (no search)');
  });

  it('gives each tag clear button a large enough target', () => {
    mount({ multiple: true, showValueAsTags: true, search: true });
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="o1"]').click();

    cy.get(`#${mountId}`).find('.vscomp-value-tag-clear-button').should('exist');
    assertMinTarget('.vscomp-value-tag-clear-button', 'tag clear button');
  });

  it('keeps the tag clear button usable: it still removes its tag', () => {
    mount({ multiple: true, showValueAsTags: true, search: true });
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="o1"]').click();
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="o2"]').click();
    cy.get(`#${mountId}`).find('.vscomp-value-tag').should('have.length', 2);

    cy.get(`#${mountId}`).find('.vscomp-value-tag-clear-button').first().click();

    cy.get(`#${mountId}`).find('.vscomp-value-tag').should('have.length', 1);
  });

  it('does not enlarge the tag itself beyond its content', () => {
    // The target grows, the visual tag should stay compact - a regression here would mean
    // the fix leaked into layout rather than the hit area.
    mount({ multiple: true, showValueAsTags: true, search: true });
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="o1"]').click();

    cy.get(`#${mountId}`)
      .find('.vscomp-value-tag')
      .first()
      .then(($tag) => {
        expect($tag[0].getBoundingClientRect().height, 'tag height').to.be.lessThan(40);
      });
  });
});
