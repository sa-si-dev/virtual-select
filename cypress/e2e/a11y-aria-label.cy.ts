/** cSpell:ignore vscomp */

/**
 * Accessible names must be plain text.
 *
 * Option labels may legitimately contain markup - a flag icon, <b>, a <br>. Those labels are
 * also interpolated into aria-label attributes, where markup is meaningless: it reached the
 * screen reader as tag soup ("i class= flag France"), and a double quote in a label closed
 * the attribute early so the rest of the name was silently lost.
 *
 * WCAG 4.1.2 Name, Role, Value (A) and 1.1.1 Non-text Content (A).
 */

import { mountVs, unmountVs } from '../support/mount';

describe('A11y: accessible names are plain text', { testIsolation: true }, () => {
  const mountId = 'vs-aria-label';

  const mount = (options: unknown[], extra: Record<string, unknown> = {}) => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options, ...extra }));
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
  };

  const option = (value: string) => cy.get(`#${mountId}`).find(`.vscomp-option[data-value="${value}"]`);

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('strips markup from a grouped option name', () => {
    mount([{ label: 'Europe', options: [{ label: '<i class="flag"></i> France', value: 'fr' }] }]);

    option('fr').should('have.attr', 'aria-label').and('contain', 'France').and('not.contain', '<i');
  });

  it('strips markup from the group name carried into its children', () => {
    mount([{ label: '<b>Europe</b>', options: [{ label: 'France', value: 'fr' }] }]);

    option('fr')
      .should('have.attr', 'aria-label')
      .and('contain', 'Europe')
      .and('not.contain', '<b')
      .and('not.contain', '</b>');
  });

  it('does not run words together where a tag was removed', () => {
    mount([{ label: 'Europe', options: [{ label: 'Paris<br>France', value: 'fr' }] }]);

    // "ParisFrance" would be the result of stripping tags to an empty string.
    option('fr').should('have.attr', 'aria-label').and('contain', 'Paris France');
  });

  it('keeps a double quote in the label from truncating the name', () => {
    mount([{ label: 'Europe', options: [{ label: 'The "City" of Light', value: 'fr' }] }]);

    option('fr')
      .should('have.attr', 'aria-label')
      .and('contain', 'City')
      // Everything after the quote survived, i.e. the attribute was not broken out of.
      .and('contain', 'Light');
  });

  it('strips markup from the group header name too', () => {
    mount([{ label: '<i class="flag"></i> Europe', options: [{ label: 'France', value: 'fr' }] }], {
      multiple: true,
    });

    cy.get(`#${mountId}`)
      .find('.vscomp-option.group-title')
      .first()
      .should('have.attr', 'aria-label')
      .and('contain', 'Europe')
      .and('not.contain', '<i');
  });

  /**
   * The stripping must also work when `enableSecureText` is on — which is the mode this release
   * actively promotes, via setGlobalDefaults() and the OutSystems wrapper default.
   *
   * With escaping on, the label reaches getAriaLabelText() *already escaped*, so its
   * `/<[^>]+>/gi` tag pattern finds no `<` to match: the markup passed straight through and the
   * accessible name became the literal tag soup `<i class="flag"></i> France`. Same option, same
   * code path, opposite outcome depending on a security flag — so the fix was a no-op exactly
   * where the escaping it depends on is enabled.
   */
  [false, true].forEach((enableSecureText) => {
    it(`strips markup regardless of enableSecureText (${enableSecureText})`, () => {
      mount([{ label: 'Europe', options: [{ label: '<i class="flag"></i> France', value: 'fr' }] }], {
        enableSecureText,
      });

      option('fr')
        .should('have.attr', 'aria-label')
        .and('contain', 'France')
        .and('not.contain', '<i')
        .and('not.contain', 'class=');
    });
  });

  it('announces an ampersand in a label as an ampersand', () => {
    // The escaped storage form must not leak into the accessible name as `&amp;`.
    mount([{ label: 'Europe', options: [{ label: 'Tom & Jerry', value: 'tj' }] }], {
      enableSecureText: true,
    });

    option('tj').should('have.attr', 'aria-label').and('contain', 'Tom & Jerry').and('not.contain', '&amp;');
  });

  it('strips markup from the tag clear button name', () => {
    mount([{ label: '<i class="flag"></i> France', value: 'fr' }], {
      multiple: true,
      showValueAsTags: true,
      ariaLabelTagClearButtonText: 'Remove option',
    });

    option('fr').click();

    cy.get(`#${mountId}`)
      .find('.vscomp-value-tag-clear-button')
      .should('have.attr', 'aria-label')
      .and('contain', 'France')
      .and('contain', 'Remove option')
      .and('not.contain', '<i');
  });
});
