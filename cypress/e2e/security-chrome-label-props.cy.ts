/** cSpell:ignore vscomp pwned labelledby */

/**
 * AI-23 — the component's own label props were interpolated raw into attributes.
 *
 * OWASP A03:2021 (Injection) and WCAG 4.1.2 (Name, Role, Value).
 *
 * Six props reach an attribute directly and none of them passes through `secureText()`, so
 * `enableSecureText: true` does not protect them. A double quote closes the attribute early: the
 * remainder is parsed as markup, and the accessible name or placeholder keeps only the prefix.
 *
 * `selectAllText` is the proof that this is a gap rather than a design. It has two sinks in the
 * same render, and they behaved differently:
 *
 *   - the group-header `aria-label` builds through `Utils.getAriaLabelText()` — full text, no
 *     injection;
 *   - the Select All button's own `aria-label` interpolated raw — `aria-label="x"`, plus a live
 *     `data-pwned` attribute on the button.
 *
 * So the fix is not a new mechanism, it is the helper AI-14 already added, applied at five more
 * sites. `aria-label` sinks get `getAriaLabelText()` (strip markup, escape quotes — the right
 * treatment for an accessible name). `placeholder` and `aria-labelledby` get quote escaping only:
 * a placeholder is visible UI text, so silently dropping markup would be wrong, and
 * `aria-labelledby` is an IDREF rather than prose.
 *
 * The constraint that stops this being a one-line change: `selectAllText` is **also** rendered as
 * `<span class="vscomp-toggle-all-label">${this.selectAllText}</span>`, where HTML works today and
 * is presumably deliberate. Only the attribute occurrence changes; the last case pins that.
 */

import { mountVs, unmountVs } from '../support/mount';

describe('Security: component label props cannot break out of their attributes', () => {
  const mountId = 'vs-chrome';
  const payload = 'x" data-pwned="1" y="';

  const mount = (win: Window, extra: Record<string, unknown> = {}) =>
    mountVs(win, mountId, {
      options: [{ label: 'Group', options: [{ label: 'Kid', value: 'k' }] }],
      multiple: true,
      search: true,
      enableSecureText: true,
      ...extra,
    });

  const openDropbox = () => cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
  const dropbox = () => cy.get(`#${mountId}`).then(($ele) => cy.wrap($ele[0].virtualSelect.$dropbox));

  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
  });

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('keeps the wrapper aria-label intact and injects nothing', () => {
    cy.window().then((win) => mount(win, { ariaLabelText: payload }));

    cy.get(`#${mountId}`).find('.vscomp-ele-wrapper').should('have.attr', 'aria-label', payload);
    cy.get(`#${mountId}`).find('[data-pwned]').should('not.exist');
  });

  it('keeps the clear button aria-label intact and injects nothing', () => {
    cy.window().then((win) => mount(win, { ariaLabelClearButtonText: payload }));

    cy.get(`#${mountId}`).find('.vscomp-clear-button').should('have.attr', 'aria-label', payload);
    cy.get(`#${mountId}`).find('[data-pwned]').should('not.exist');
  });

  it('keeps aria-labelledby intact and injects nothing', () => {
    cy.window().then((win) => mount(win, { ariaLabelledby: payload }));

    cy.get(`#${mountId}`).find('.vscomp-ele-wrapper').should('have.attr', 'aria-labelledby', payload);
    cy.get(`#${mountId}`).find('[data-pwned]').should('not.exist');
  });

  it('keeps the search placeholder intact and injects nothing', () => {
    cy.window().then((win) => mount(win, { searchPlaceholderText: payload }));

    openDropbox();
    dropbox().find('.vscomp-search-input').should('have.attr', 'placeholder', payload);
    dropbox().find('[data-pwned]').should('not.exist');
  });

  it('keeps the search clear aria-label intact and injects nothing', () => {
    cy.window().then((win) => mount(win, { ariaLabelSearchClearButtonText: payload }));

    openDropbox();
    dropbox().find('.vscomp-search-clear').should('have.attr', 'aria-label', payload);
    dropbox().find('[data-pwned]').should('not.exist');
  });

  it('keeps the Select All aria-label intact and injects nothing', () => {
    cy.window().then((win) => mount(win, { selectAllText: payload }));

    openDropbox();
    dropbox().find('.vscomp-toggle-all-button').should('have.attr', 'aria-label', payload);
    // Previously the payload put a live attribute on this very button.
    dropbox().find('.vscomp-toggle-all-button').should('not.have.attr', 'data-pwned');
    dropbox().find('[data-pwned]').should('not.exist');
  });

  it('injects nothing anywhere when every affected prop carries the payload', () => {
    cy.window().then((win) =>
      mount(win, {
        ariaLabelText: payload,
        ariaLabelledby: payload,
        ariaLabelClearButtonText: payload,
        ariaLabelSearchClearButtonText: payload,
        selectAllText: payload,
        searchPlaceholderText: payload,
      }),
    );

    openDropbox();
    cy.get(`#${mountId}`).find('[data-pwned]').should('not.exist');
    dropbox().find('[data-pwned]').should('not.exist');
  });

  it('strips markup from an accessible name, as AI-14 does for option labels', () => {
    cy.window().then((win) => mount(win, { selectAllText: 'Pick <b>all</b>' }));

    openDropbox();
    // A screen reader should hear "Pick all", not the literal tag soup it heard before.
    dropbox().find('.vscomp-toggle-all-button').should('have.attr', 'aria-label', 'Pick all');
  });

  it('still renders HTML in the visible Select All label', () => {
    cy.window().then((win) => mount(win, { selectAllText: 'Pick <b>all</b>' }));

    openDropbox();
    // The other sink for the same prop. Escaping this one would be a visible regression.
    dropbox().find('.vscomp-toggle-all-label b').should('contain', 'all');
  });

  it('leaves plain values untouched', () => {
    cy.window().then((win) =>
      mount(win, {
        ariaLabelText: 'Countries',
        selectAllText: 'Select all',
        searchPlaceholderText: 'Search...',
      }),
    );

    cy.get(`#${mountId}`).find('.vscomp-ele-wrapper').should('have.attr', 'aria-label', 'Countries');

    openDropbox();
    dropbox().find('.vscomp-toggle-all-button').should('have.attr', 'aria-label', 'Select all');
    dropbox().find('.vscomp-toggle-all-label').should('contain', 'Select all');
    dropbox().find('.vscomp-search-input').should('have.attr', 'placeholder', 'Search...');
  });
});
