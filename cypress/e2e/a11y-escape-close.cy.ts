/** cSpell:ignore vscomp */

/**
 * Regression test for AI-2 / [A11Y-02] — WCAG 2.1.1 & 2.1.2 (Level A).
 *
 * Escape only closed the dropdown when an external `dropboxWrapper` existed or the dropdown
 * was shown as a popup. With the default `dropboxWrapper: 'self'` on a desktop viewport the
 * guard resolved to `this.$dropboxWrapper`, which is `undefined`, so the branch was skipped
 * and the dropdown stayed open — leaving keyboard users with no way to dismiss it.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

describe('A11y: Escape closes the dropdown (AI-2)', () => {
  const mountId = 'vs-a11y-escape';

  const isExpanded = (expected: boolean) =>
    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('have.attr', 'aria-expanded', String(expected));

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  context('default config (dropboxWrapper: "self", desktop viewport)', () => {
    beforeEach(() => {
      // Wider than the 576px popup breakpoint, so showAsPopup is false — the broken path.
      cy.viewport(1280, 800);
      cy.visit('get-started');
      cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(6), search: true }));
    });

    it('closes when Escape is pressed with focus on the search input', () => {
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      isExpanded(true);

      cy.get(`#${mountId}`).find('.vscomp-search-input').focus().type('{esc}');

      isExpanded(false);
      cy.get(`#${mountId}`).find('.vscomp-dropbox-container').should('not.be.visible');
    });

    it('closes when Escape is pressed with an option focused', () => {
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      isExpanded(true);

      // ArrowDown from the search input moves the highlight; the option itself takes DOM focus
      // in non-search navigation, so target the focused option directly.
      cy.get(`#${mountId}`).find('.vscomp-option').first().focus().type('{esc}');

      isExpanded(false);
    });

    it('returns focus to the combobox after Escape so the user is not stranded', () => {
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      isExpanded(true);

      cy.get(`#${mountId}`).find('.vscomp-search-input').focus().type('{esc}');

      isExpanded(false);
      cy.focused().should('have.class', 'vscomp-wrapper');
    });
  });

  // The fix reworked which element containment is tested against, so the two layouts that
  // already worked are pinned here to prove they still do.
  context('popup layout (viewport below the popup breakpoint)', () => {
    it('still closes on Escape', () => {
      cy.viewport(480, 800);
      cy.visit('get-started');
      cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(6), search: true }));

      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      isExpanded(true);

      cy.get(`#${mountId}`).find('.vscomp-search-input').focus().type('{esc}');

      isExpanded(false);
    });
  });

  context('external dropboxWrapper', () => {
    it('still closes on Escape when the dropbox is portalled out of the wrapper', () => {
      cy.viewport(1280, 800);
      cy.visit('get-started');
      cy.window().then((win) => {
        const host = win.document.createElement('div');
        host.id = 'vs-a11y-escape-portal';
        win.document.body.appendChild(host);

        mountVs(win, mountId, {
          options: makeOptions(6),
          search: true,
          dropboxWrapper: '#vs-a11y-escape-portal',
        });
      });

      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      isExpanded(true);

      cy.get('#vs-a11y-escape-portal').find('.vscomp-search-input').focus().type('{esc}');

      isExpanded(false);

      cy.window().then((win) => win.document.getElementById('vs-a11y-escape-portal')?.remove());
    });
  });

  context('keepAlwaysOpen', () => {
    it('ignores Escape, because the dropdown is not dismissible by design', () => {
      cy.viewport(1280, 800);
      cy.visit('get-started');
      cy.window().then((win) =>
        mountVs(win, mountId, { options: makeOptions(6), search: true, keepAlwaysOpen: true }),
      );

      cy.get(`#${mountId}`).find('.vscomp-search-input').focus().type('{esc}');

      cy.get(`#${mountId}`).find('.vscomp-dropbox-container').should('be.visible');
    });
  });
});
