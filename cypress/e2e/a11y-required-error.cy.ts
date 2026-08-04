/** cSpell:ignore vscomp */

/**
 * Regression test for AI-4 / [A11Y-07] — WCAG 3.3.1 (A), 1.4.1 (A) and 4.1.2 (A).
 *
 * `required` was never exposed: the wrapper carried no aria-required, and a failed
 * validate() only toggled a `has-error` class that changed the toggle button's border
 * colour. There was no aria-invalid, no error message and no announcement — the failure
 * was communicated by colour alone, and not at all to assistive technology.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

describe('A11y: required and error state are exposed (AI-4)', () => {
  const mountId = 'vs-a11y-required';

  const wrapper = () => cy.get(`#${mountId}`).find('.vscomp-wrapper');
  const errorMessage = () => cy.get(`#${mountId}`).find('.vscomp-error-message');
  const liveRegion = () => cy.get(`#${mountId}`).find('.vscomp-live-region');
  const validate = () => cy.get(`#${mountId}`).then(($e) => $e[0].validate?.());

  const mount = (extra: Record<string, unknown> = {}) => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(5), ...extra }));
  };

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  context('aria-required', () => {
    it('is exposed when the field is required', () => {
      mount({ required: true });

      wrapper().should('have.attr', 'aria-required', 'true');
    });

    it('is absent when the field is optional', () => {
      mount();

      wrapper().should('not.have.attr', 'aria-required');
    });

    it('follows toggleRequired() at runtime', () => {
      mount();
      wrapper().should('not.have.attr', 'aria-required');

      cy.get(`#${mountId}`).then(($e) => $e[0].toggleRequired?.(true));
      wrapper().should('have.attr', 'aria-required', 'true');

      cy.get(`#${mountId}`).then(($e) => $e[0].toggleRequired?.(false));
      wrapper().should('not.have.attr', 'aria-required');
    });
  });

  context('failed validation', () => {
    beforeEach(() => mount({ required: true }));

    it('sets aria-invalid on the combobox', () => {
      wrapper().should('not.have.attr', 'aria-invalid');

      validate();

      wrapper().should('have.attr', 'aria-invalid', 'true');
    });

    it('renders a text error message, so the failure is not signalled by colour alone', () => {
      validate();

      errorMessage().should('be.visible');
      errorMessage().should('have.text', 'This field is required');
    });

    it('associates the message with the combobox via aria-describedby', () => {
      validate();

      errorMessage()
        .invoke('attr', 'id')
        .then((errorId) => {
          wrapper().should('have.attr', 'aria-describedby', errorId);
        });
    });

    it('announces the error', () => {
      validate();

      liveRegion().should('have.text', 'This field is required');
    });

    it('clears every error affordance once a value is selected', () => {
      validate();
      wrapper().should('have.attr', 'aria-invalid', 'true');

      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-option[data-value="o2"]').click();

      wrapper().should('not.have.attr', 'aria-invalid');
      wrapper().should('not.have.attr', 'aria-describedby');
      errorMessage().should('not.be.visible');
    });

    it('honours a custom required message for localisation', () => {
      mount({ required: true, requiredErrorText: 'Pflichtfeld' });

      validate();

      errorMessage().should('have.text', 'Pflichtfeld');
    });
  });

  context('minValues', () => {
    it('reports how many options are still needed', () => {
      mount({ multiple: true, required: true, minValues: 3 });

      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-option[data-value="o1"]').click();

      validate();

      errorMessage().should('have.text', 'Select at least 3 options');
      wrapper().should('have.attr', 'aria-invalid', 'true');
    });

    it('clears once enough options are selected', () => {
      mount({ multiple: true, required: true, minValues: 2 });

      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-option[data-value="o1"]').click();
      validate();
      wrapper().should('have.attr', 'aria-invalid', 'true');

      cy.get(`#${mountId}`).find('.vscomp-option[data-value="o2"]').click();

      wrapper().should('not.have.attr', 'aria-invalid');
    });
  });

  context('disableValidation', () => {
    it('leaves aria-invalid and the message alone', () => {
      mount({ required: true, disableValidation: true });

      validate();

      wrapper().should('not.have.attr', 'aria-invalid');
      errorMessage().should('not.be.visible');
    });
  });
});
