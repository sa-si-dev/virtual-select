/** cSpell:ignore vscomp activedescendant combobox autocomplete */

/**
 * Regression test for AI-7 / [A11Y-01 + A11Y-05] — WCAG 2.1.1 (A) and 4.1.2 (A).
 *
 * Opening the dropdown puts focus in the search input, and both arrow handlers
 * early-returned in that state, so ArrowDown/ArrowUp did nothing at all: no option was
 * highlighted and nothing was announced. Users had to discover an undocumented Tab into
 * the listbox first.
 *
 * The highlight was also published as aria-activedescendant on the wrapper and on the
 * role-less $dropboxContainer, never on the element that actually had focus, so even when
 * navigation did work the active option was not conveyed.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

/**
 * testIsolation is disabled project-wide, but these cases repeatedly open, filter and close
 * a dropdown while asserting on focus. Leftover focus and pending re-renders from a previous
 * case leak across tests and make the focus assertions flaky for reasons unrelated to the
 * component, so this spec asks for a clean page per test.
 */
describe('A11y: arrow-key navigation from the search input (AI-7)', { testIsolation: true }, () => {
  const mountId = 'vs-a11y-search-arrows';

  const searchInput = () => cy.get(`#${mountId}`).find('.vscomp-search-input');
  const listbox = () => cy.get(`#${mountId}`).find('.vscomp-options-container');
  const focusedOption = () => cy.get(`#${mountId}`).find('.vscomp-option.focused');

  /** aria-activedescendant on the search input must name the highlighted option. */
  const assertActiveDescendantMatchesHighlight = () => {
    focusedOption()
      .invoke('attr', 'id')
      .then((optionId) => {
        expect(optionId, 'highlighted option has an id').to.be.a('string');
        searchInput().should('have.attr', 'aria-activedescendant', optionId);
      });
  };

  const mount = (extra: Record<string, unknown> = {}) => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(5), search: true, ...extra }));
  };

  const open = () => {
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    searchInput().focus();
  };

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  context('search input semantics', () => {
    beforeEach(() => {
      mount();
      open();
    });

    it('is a combobox controlling the listbox', () => {
      searchInput().should('have.attr', 'role', 'combobox');
      searchInput().should('have.attr', 'aria-autocomplete', 'list');

      listbox()
        .invoke('attr', 'id')
        .then((listboxId) => {
          expect(listboxId, 'listbox has an id to point at').to.be.a('string');
          searchInput().should('have.attr', 'aria-controls', listboxId);
        });
    });

    it('reports the expanded state', () => {
      searchInput().should('have.attr', 'aria-expanded', 'true');

      searchInput().type('{esc}');

      searchInput().should('have.attr', 'aria-expanded', 'false');
    });

    it('does not publish the highlight on the role-less dropbox container', () => {
      searchInput().type('{downarrow}');

      // aria-activedescendant on an element with no listbox/combobox role is meaningless.
      cy.get(`#${mountId}`).find('.vscomp-dropbox-container').should('not.have.attr', 'aria-activedescendant');
    });
  });

  context('ArrowDown / ArrowUp', () => {
    beforeEach(() => {
      mount();
      open();
    });

    it('highlights the first option on ArrowDown and announces it', () => {
      searchInput().type('{downarrow}');

      focusedOption().should('have.attr', 'data-value', 'o1');
      assertActiveDescendantMatchesHighlight();
    });

    it('keeps DOM focus in the search input, so typing continues to work', () => {
      searchInput().type('{downarrow}');

      // The point of driving the highlight by aria-activedescendant: focus never leaves
      // the field, so the user can keep filtering.
      cy.focused().should('have.class', 'vscomp-search-input');

      // Deliberately a single character. Each keystroke re-renders the option list and can
      // trigger a scroll-driven re-render on top of that, which Cypress's batched typing
      // outruns - a multi-character type() here drops characters and makes the test flaky
      // for reasons that have nothing to do with the component. One character proves the
      // contract: the field still receives input and the highlight follows the filtered set.
      searchInput().type('4');

      searchInput().should('have.value', '4');
      cy.focused().should('have.class', 'vscomp-search-input');
      focusedOption().should('have.attr', 'data-value', 'o4');
    });

    it('moves down through the options', () => {
      searchInput().type('{downarrow}');
      focusedOption().should('have.attr', 'data-value', 'o1');

      searchInput().type('{downarrow}');
      focusedOption().should('have.attr', 'data-value', 'o2');
      assertActiveDescendantMatchesHighlight();

      searchInput().type('{downarrow}');
      focusedOption().should('have.attr', 'data-value', 'o3');
    });

    it('moves back up through the options', () => {
      searchInput().type('{downarrow}{downarrow}{downarrow}');
      focusedOption().should('have.attr', 'data-value', 'o3');

      searchInput().type('{uparrow}');

      focusedOption().should('have.attr', 'data-value', 'o2');
      assertActiveDescendantMatchesHighlight();
    });

    it('selects the highlighted option with Enter', () => {
      searchInput().type('{downarrow}{downarrow}');
      focusedOption().should('have.attr', 'data-value', 'o2');

      searchInput().type('{enter}');

      cy.get(`#${mountId}`).then(($e) => {
        expect($e[0].virtualSelect.selectedValues).to.deep.equal(['o2']);
      });
    });

    it('tracks the filtered set after typing', () => {
      searchInput().type('Option 4');

      searchInput().type('{downarrow}');

      focusedOption().should('have.attr', 'data-value', 'o4');
      assertActiveDescendantMatchesHighlight();
    });

    it('clears aria-activedescendant when the dropdown closes', () => {
      searchInput().type('{downarrow}');
      searchInput().should('have.attr', 'aria-activedescendant').and('not.be.empty');

      searchInput().type('{esc}');

      cy.get(`#${mountId}`)
        .find('.vscomp-search-input')
        .should(($input) => {
          expect($input.attr('aria-activedescendant') || '').to.equal('');
        });
    });
  });

  context('multi-select', () => {
    it('navigates and selects without closing the dropdown', () => {
      mount({ multiple: true });
      open();

      searchInput().type('{downarrow}');
      focusedOption().should('have.attr', 'data-value', 'o1');
      searchInput().type('{enter}');

      searchInput().type('{downarrow}');
      searchInput().type('{enter}');

      cy.get(`#${mountId}`).then(($e) => {
        expect($e[0].virtualSelect.selectedValues).to.have.members(['o1', 'o2']);
      });
      searchInput().should('have.attr', 'aria-expanded', 'true');
    });
  });

  context('keyboard navigation without a search input', () => {
    it('still works when search is disabled', () => {
      mount({ search: false });
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

      cy.get(`#${mountId}`).find('.vscomp-wrapper').trigger('keydown', { keyCode: 40, which: 40 });

      focusedOption().should('exist');
    });
  });
});
