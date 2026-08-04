/** cSpell:ignore vscomp multiselectable */

/**
 * Regression test for AI-10 / [A11Y-06] — WCAG 4.1.2 (A).
 *
 * The options container carries role="listbox" but never advertised that more than one
 * option could be chosen, so assistive technology presented a multi-select dropdown with
 * single-select semantics.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

describe('A11y: listbox advertises multi-selection (AI-10)', () => {
  const mountId = 'vs-a11y-multiselectable';

  const listbox = () => cy.get(`#${mountId}`).find('.vscomp-options-container');

  const mount = (extra: Record<string, unknown> = {}) => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(5), ...extra }));
  };

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('sets aria-multiselectable="true" in multiple mode', () => {
    mount({ multiple: true });

    listbox().should('have.attr', 'role', 'listbox');
    listbox().should('have.attr', 'aria-multiselectable', 'true');
  });

  it('omits aria-multiselectable for a single select', () => {
    mount();

    listbox().should('have.attr', 'role', 'listbox');
    listbox().should('not.have.attr', 'aria-multiselectable');
  });

  it('still applies when multiple comes from the element attribute', () => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => {
      const $ele = win.document.createElement('div');
      $ele.id = mountId;
      $ele.setAttribute('multiple', '');
      win.document.body.appendChild($ele);

      // @ts-expect-error - VirtualSelect is attached to window by the bundle
      win.VirtualSelect.init({ ele: $ele, options: makeOptions(5) });
    });

    listbox().should('have.attr', 'aria-multiselectable', 'true');
  });
});
