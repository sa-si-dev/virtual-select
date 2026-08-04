/** cSpell:ignore vscomp */

/**
 * Regression test for AI-6 / [A11Y-03] — WCAG 4.1.3 Status Messages (AA).
 *
 * The component shipped a `.vscomp-live-region` rule in the stylesheet but no JavaScript
 * ever created the element, so there were zero live regions in the DOM. Search result
 * counts, "no results", server-search loading and selection changes were all conveyed
 * visually only — a screen reader user typing into the search box heard nothing.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

describe('A11y: status announcements via a live region (AI-6)', () => {
  const mountId = 'vs-a11y-live';

  const liveRegion = () => cy.get(`#${mountId}`).find('.vscomp-live-region');

  const mount = (extra: Record<string, unknown> = {}) => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(5), search: true, ...extra }));
  };

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  context('the region itself', () => {
    beforeEach(() => mount());

    it('creates exactly one polite status region per instance', () => {
      liveRegion().should('have.length', 1);
      liveRegion().should('have.attr', 'role', 'status');
      liveRegion().should('have.attr', 'aria-live', 'polite');
      // Atomic so the whole message is re-read rather than just the changed words.
      liveRegion().should('have.attr', 'aria-atomic', 'true');
    });

    it('is visually hidden but not hidden from assistive technology', () => {
      // aria-hidden / display:none / visibility:hidden would all silence it.
      liveRegion().should('not.have.attr', 'aria-hidden');
      liveRegion().should('have.css', 'position', 'absolute');
      liveRegion().invoke('outerWidth').should('be.lessThan', 2);
    });

    it('starts empty so nothing is announced on page load', () => {
      liveRegion().should('have.text', '');
    });
  });

  context('search results', () => {
    beforeEach(() => mount());

    it('announces the number of matches while typing', () => {
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-search-input').focus().type('Option');

      liveRegion().should('have.text', '5 results available');
    });

    it('uses the singular form for a single match', () => {
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-search-input').focus().type('Option 3');

      liveRegion().should('have.text', '1 result available');
    });

    it('announces the no-results message when the search matches nothing', () => {
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-search-input').focus().type('zzzzzz');

      liveRegion().should('have.text', 'No results found');
    });

    it('does not announce a stale count when the dropdown is merely closed', () => {
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-search-input').focus().type('zzzzzz');
      liveRegion().should('have.text', 'No results found');

      // Closing resets the search internally; that must not re-announce a result count.
      cy.get(`#${mountId}`).find('.vscomp-search-input').type('{esc}');

      liveRegion().should('not.have.text', '5 results available');
    });

    it('honours custom result-count text for localisation', () => {
      mount({ searchResultsText: 'Treffer verfügbar', searchResultText: 'Treffer verfügbar' });

      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-search-input').focus().type('Option');

      liveRegion().should('have.text', '5 Treffer verfügbar');
    });
  });

  context('selection changes', () => {
    it('announces the selection summary for a multi-select', () => {
      mount({ multiple: true });

      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-option[data-value="o1"]').click();

      liveRegion().should('have.text', '1 option selected');

      cy.get(`#${mountId}`).find('.vscomp-option[data-value="o2"]').click();

      liveRegion().should('have.text', '2 options selected');
    });

    it('announces the chosen label for a single select', () => {
      mount();

      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-option[data-value="o3"]').click();

      liveRegion().should('have.text', 'Option 3 selected');
    });

    it('announces when the selection is cleared', () => {
      mount({ multiple: true });

      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-option[data-value="o1"]').click();
      liveRegion().should('have.text', '1 option selected');

      cy.get(`#${mountId}`).find('.vscomp-option[data-value="o1"]').click();

      liveRegion().should('have.text', 'No options selected');
    });

    it('announces the result of Select All', () => {
      mount({ multiple: true });

      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-toggle-all-button').click();

      liveRegion().should('have.text', '5 options selected');
    });

    it('does not announce a value supplied at initialisation', () => {
      mount({ selectedValue: 'o2' });

      liveRegion().should('have.text', '');
    });
  });

  context('lifecycle', () => {
    it('removes the region when the instance is destroyed', () => {
      mount();
      liveRegion().should('have.length', 1);

      // Scoped to this instance's region: the docs page hosts other instances, and each
      // legitimately owns a live region of its own.
      liveRegion()
        .invoke('attr', 'id')
        .then((regionId) => {
          cy.window().then((win) => unmountVs(win, mountId));

          cy.get(`#${mountId}`).should('not.exist');
          cy.get(`#${regionId}`).should('not.exist');
        });
    });
  });
});
