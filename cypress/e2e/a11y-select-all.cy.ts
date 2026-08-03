/** cSpell:ignore vscomp */

/**
 * Regression test for AI-3 / [A11Y-04] — WCAG 4.1.2, 1.3.1 (Level A) and 2.1.1 (Level A).
 *
 * "Select All" was a bare <span tabindex="0" aria-label="Select All">: exposed to assistive
 * technology as a generic element with no role and no checked state, so its state changes were
 * inaudible. It also only responded to Enter — Space, the expected activation key for a
 * checkbox, scrolled the page instead.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

describe('A11y: Select All exposes checkbox semantics (AI-3)', () => {
  const mountId = 'vs-a11y-select-all';

  const toggleAll = () => cy.get(`#${mountId}`).find('.vscomp-toggle-all-button');
  const selectedCount = () => cy.get(`#${mountId}`).then(($e) => $e[0].virtualSelect.selectedValues.length);

  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(5), multiple: true, search: true }));
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
  });

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('exposes role="checkbox" with an accessible name', () => {
    toggleAll().should('have.attr', 'role', 'checkbox');
    toggleAll().should('have.attr', 'aria-label', 'Select All');
  });

  it('starts unchecked and reports aria-checked="true" once everything is selected', () => {
    toggleAll().should('have.attr', 'aria-checked', 'false');

    toggleAll().click();

    toggleAll().should('have.attr', 'aria-checked', 'true');
    selectedCount().should('eq', 5);
  });

  it('returns aria-checked to "false" when toggled back off', () => {
    toggleAll().click();
    toggleAll().should('have.attr', 'aria-checked', 'true');

    toggleAll().click();

    toggleAll().should('have.attr', 'aria-checked', 'false');
    selectedCount().should('eq', 0);
  });

  it('activates on Space, the expected key for a checkbox', () => {
    toggleAll().focus().type(' ', { force: true });

    selectedCount().should('eq', 5);
    toggleAll().should('have.attr', 'aria-checked', 'true');
  });

  it('still activates on Enter', () => {
    toggleAll().focus().type('{enter}', { force: true });

    selectedCount().should('eq', 5);
    toggleAll().should('have.attr', 'aria-checked', 'true');
  });

  it('calls preventDefault on Space so the page does not scroll', () => {
    // Synthetic keys never trigger native scrolling, so asserting scrollY would prove nothing.
    // The observable contract is that the component consumed the key.
    const prevented: boolean[] = [];

    cy.window().then((win) => {
      // Bubble phase on document: runs after the component's wrapper handler, so
      // defaultPrevented already reflects whatever that handler decided.
      win.document.addEventListener('keydown', (e) => {
        if (e.keyCode === 32) {
          prevented.push(e.defaultPrevented);
        }
      });
    });

    toggleAll().focus().type(' ', { force: true });

    cy.wrap(null).should(() => {
      expect(prevented, 'Space keydown seen and defaultPrevented').to.deep.equal([true]);
    });
  });

  it('reflects aria-checked when selection is driven from the options instead', () => {
    toggleAll().should('have.attr', 'aria-checked', 'false');

    // Select every option individually; Select All must follow along.
    makeOptions(5).forEach((o) => {
      cy.get(`#${mountId}`).find(`.vscomp-option[data-value="${o.value}"]`).click();
    });

    toggleAll().should('have.attr', 'aria-checked', 'true');
  });
});
