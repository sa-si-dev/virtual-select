/** cSpell:ignore vscomp */

/**
 * Server-search status messages must describe an interaction the user actually made.
 *
 * WCAG 4.1.3 Status Messages (AA) requires status changes to be announced; it does not
 * license announcements for state the user cannot see. `closeDropbox()` ends with
 * `setSearchValue('')`, which on a server instance schedules a fetch, so closing the
 * dropdown spoke "Loading results" one `searchDelay` later and then the result count when
 * the host responded - two announcements, for a dropdown that is no longer open.
 *
 * The local-search path guards exactly this in `announceSearchResults()`; the server path
 * bypassed it.
 */

import { mountVs, unmountVs } from '../support/mount';

type ServerHarness = {
  /** every search value `onServerSearch` was called with, in order */
  calls: string[];
  /** hand the last-seen instance a result set, as a host's fetch callback would */
  respond: (options: Array<{ label: string; value: string }>) => void;
};

declare global {
  interface Window {
    __vsServer?: ServerHarness;
  }
}

describe('A11y: server-search announcements', () => {
  const mountId = 'vs-a11y-server-search';

  const liveRegion = () => cy.get(`#${mountId}`).find('.vscomp-live-region');
  const searchInput = () => cy.get(`#${mountId}`).find('.vscomp-search-input');
  const harness = () => cy.window().its('__vsServer');

  /**
   * `searchDelay` is deliberately long: the bug is about what happens when the dropdown is
   * closed *before* the debounce elapses, so the window has to be wide enough for Cypress to
   * type and close inside it. Nothing waits on the delay itself - the assertions wait on the
   * fetch actually being issued.
   */
  const SEARCH_DELAY = 400;

  const mount = (extra: Record<string, unknown> = {}) => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => {
      const calls: string[] = [];
      let respond: ServerHarness['respond'] = () => undefined;

      mountVs(win, mountId, {
        options: [],
        search: true,
        searchDelay: SEARCH_DELAY,
        onServerSearch: (searchValue: string, instance: { setServerOptions: (o: unknown[]) => void }) => {
          calls.push(searchValue);
          respond = (options) => instance.setServerOptions(options);
        },
        ...extra,
      });

      win.__vsServer = {
        calls,
        respond: (options) => respond(options),
      };
    });
  };

  const results = [
    { label: 'Result 1', value: 'r1' },
    { label: 'Result 2', value: 'r2' },
    { label: 'Result 3', value: 'r3' },
  ];

  beforeEach(() => mount());

  afterEach(() => {
    cy.window().then((win) => {
      unmountVs(win, mountId);
      delete win.__vsServer;
    });
  });

  context('while the dropdown is open', () => {
    it('announces that a fetch is in flight, then the number of matches', () => {
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      searchInput().focus().type('Res', { delay: 0 });

      // The spinner is a visual-only cue, so the fetch has to be announced.
      liveRegion().should('have.text', 'Loading results');

      harness().invoke('respond', results);

      liveRegion().should('have.text', '3 results available');
    });
  });

  context('after the dropdown has been closed', () => {
    it('does not announce a fetch the user did not trigger', () => {
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      searchInput().focus().type('Res', { delay: 0 });

      // Closed inside the debounce window: the user's own fetch never goes out.
      searchInput().type('{esc}');

      // Wait on the event, not on a duration: the reset performed by closeDropbox() issues a
      // fetch for the empty search value, and that is the moment the stray announcement was made.
      harness().its('calls').should('deep.equal', ['']);

      liveRegion().should('have.text', '');
    });

    it('does not announce a result count for a closed dropdown', () => {
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      searchInput().focus().type('Res', { delay: 0 });
      searchInput().type('{esc}');

      harness().its('calls').should('deep.equal', ['']);
      harness().invoke('respond', results);

      liveRegion().should('have.text', '');
    });

    /**
     * The close-time reset is not the only path here. closeDropbox() clears the search via
     * setSearchValue(''), which early-returns when the box is already empty - so a user who
     * deletes their query *before* closing leaves a pending fetch that the close never sees.
     * That fetch is still the user's own from before the close, but by the time it fires the
     * dropdown is gone, and it must not speak.
     */
    it('does not announce a fetch left pending by clearing the search before closing', () => {
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      searchInput().focus().type('Res', { delay: 0 });

      // Empty the box by hand, then close inside the debounce window: the close-time reset
      // early-returns (the value is already ''), so only the backspace's own fetch remains.
      searchInput().type('{selectall}{backspace}', { delay: 0 });
      searchInput().type('{esc}');

      harness().its('calls').should('deep.equal', ['']);

      liveRegion().should('have.text', '');
    });
  });

  context('after the dropdown has been reopened', () => {
    /**
     * The silence must not outlive the closed state. A close marks the pending reset silent;
     * once the user reopens, a host that pushes fresh options into the visible list is
     * describing something the user is looking at, and it has to be announced again.
     */
    it('announces options pushed by the host while the dropdown is open again', () => {
      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      searchInput().focus().type('Res', { delay: 0 });
      searchInput().type('{esc}');

      // The close-initiated reset runs to completion, silently.
      harness().its('calls').should('deep.equal', ['']);
      harness().invoke('respond', results);
      liveRegion().should('have.text', '');

      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-ele-wrapper').should('have.attr', 'aria-expanded', 'true');

      harness().invoke('respond', results);

      liveRegion().should('have.text', '3 results available');
    });
  });

  context('on page load', () => {
    /**
     * showOptionsOnlyOnSearch forces a search reset during construction, which on a server
     * instance schedules a fetch. That fetch spoke "Loading results" on a closed dropdown
     * the user had not touched yet - `isInitialized` could not catch it, because the flag is
     * already true by the time the debounce elapses.
     */
    it('does not announce the fetch forced by showOptionsOnlyOnSearch', () => {
      mount({ showOptionsOnlyOnSearch: true });

      // The construction-time reset issues its fetch one searchDelay after load.
      harness().its('calls').should('deep.equal', ['']);
      liveRegion().should('have.text', '');

      // Nor may the host's response to it speak - the dropdown is still closed.
      harness().invoke('respond', results);
      liveRegion().should('have.text', '');
    });
  });
});
