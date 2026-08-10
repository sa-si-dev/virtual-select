/** cSpell:ignore vscomp */

/**
 * Closing the dropbox must end option navigation, immediately.
 *
 * Every default instance closes through a popover hide transition, so `afterHidePopper()` -
 * the only place that dropped the highlight - ran ~200ms after `closeDropbox()` returned.
 * Until then the previous `.focused` option and `focusedOptionIndex` survived the close, so a
 * dropdown reopened inside that window resumed navigation one step further down the list than
 * the user could see. On a grouped multi-select that shifted Enter off the group title and onto
 * its first child, so "select the whole group" silently became "select one option".
 *
 * WCAG 2.1.1 Keyboard (A) and 4.1.2 Name, Role, Value (A) - `aria-activedescendant` and the
 * visible highlight have to agree with where the next arrow key will actually go.
 */

import { mountVs, unmountVs } from '../support/mount';

const GROUPS = [
  { label: 'Group 1', options: [{ label: 'Option 1-1', value: '1-1' }, { label: 'Option 1-2', value: '1-2' }] },
  { label: 'Group 2', options: [{ label: 'Option 2-1', value: '2-1' }] },
];

describe('A11y: closing the dropbox clears option navigation state', { testIsolation: true }, () => {
  const mountId = 'vs-close-clears-highlight';

  const mount = (extra: Record<string, unknown> = {}) => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options: GROUPS, multiple: true, ...extra }));
  };

  const openAndHighlightFirst = () => {
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).pressKeys('ArrowDown');
    cy.get(`#${mountId}`).find('.vscomp-option.focused').should('have.attr', 'data-index', '0');
  };

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('drops the highlight in the same tick as the close, not when the transition ends', () => {
    mount();
    openAndHighlightFirst();

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      vs.closeDropbox();

      /**
       * Read in the same tick the close was requested. isOpened() is still true here, which
       * is the point: this pins the asynchronous popover path rather than the synchronous
       * fallback, so the test cannot pass for the wrong reason.
       */
      expect(vs.isOpened(), 'still mid hide-transition').to.equal(true);
      expect(vs.$dropboxContainer.querySelector('.vscomp-option.focused'), 'highlighted option').to.equal(null);
      expect(vs.focusedOptionIndex, 'focusedOptionIndex').to.equal(null);
    });
  });

  it('clears aria-activedescendant on close', () => {
    mount();
    openAndHighlightFirst();

    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('have.attr', 'aria-activedescendant');

    cy.get(`#${mountId}`).then(($ele) => $ele[0].virtualSelect.closeDropbox());

    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('not.have.attr', 'aria-activedescendant');
  });

  /**
   * Reopened in the *same tick* as the close, deliberately. Waiting for the `closed` class
   * first would wait out `afterHidePopper()`, which clears the highlight on its own - so the
   * case could never observe the bug it exists for. This is the user-visible symptom: reopen
   * before the hide transition finishes and navigation must still start at the top.
   */
  it('starts navigation at the first option again when reopened mid hide-transition', () => {
    mount();
    openAndHighlightFirst();
    cy.get(`#${mountId}`).pressKeys('ArrowDown');
    cy.get(`#${mountId}`).find('.vscomp-option.focused').should('have.attr', 'data-index', '1');

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      vs.closeDropbox();
      expect(vs.isOpened(), 'still mid hide-transition').to.equal(true);
      vs.openDropbox();
    });

    cy.get(`#${mountId}`).pressKeys('ArrowDown');

    // data-index 2 here would mean the pre-close highlight was carried over.
    cy.get(`#${mountId}`).find('.vscomp-option.focused').should('have.attr', 'data-index', '0');
  });

  /**
   * The same close, with a filter typed. Clearing the filter is the last thing closeDropbox()
   * does, and it used to re-highlight the first visible option - undoing the clear above and
   * pulling DOM focus onto an option that is about to be hidden.
   */
  it('keeps the highlight cleared when a search value has to be cleared too', () => {
    mount({ search: true });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-search-input').type('Option');
    cy.get(`#${mountId}`).pressKeys('ArrowDown');
    cy.get(`#${mountId}`).find('.vscomp-option.focused').should('exist');

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      vs.closeDropbox();

      expect(vs.isOpened(), 'still mid hide-transition').to.equal(true);
      expect(vs.searchValue, 'search value').to.equal('');
      expect(vs.$dropboxContainer.querySelector('.vscomp-option.focused'), 'highlighted option').to.equal(null);
      expect(vs.focusedOptionIndex, 'focusedOptionIndex').to.equal(null);
      expect(vs.$wrapper.getAttribute('aria-activedescendant'), 'aria-activedescendant').to.equal(null);
    });

    // Focus must not have been dragged into the dropbox that is being hidden.
    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('have.class', 'closed');
    cy.focused().should('have.class', 'vscomp-wrapper');
  });

  it('toggles a whole group on and off with Enter on its group title', () => {
    mount();
    openAndHighlightFirst();

    cy.get(`#${mountId}`).find('.vscomp-option.focused').should('have.class', 'group-title');

    /**
     * Asserted on the value array rather than on `.vscomp-value`: the rendered text switches
     * between a list of labels and an "N options selected" summary depending on
     * `noOfDisplayValues`, which has nothing to do with what this case is about.
     */
    cy.get(`#${mountId}`).pressKeys('Enter');
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.selectedValues, 'after the first Enter').to.deep.equal(['1-1', '1-2']);
    });

    cy.get(`#${mountId}`).pressKeys('Enter');
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.selectedValues, 'after the second Enter').to.deep.equal([]);
    });
  });

  /**
   * Negative control for the change that stopped clearing the highlight from moving DOM focus:
   * Escape must still hand focus back to the combobox rather than leaving it on an option
   * inside a dropbox that is being hidden.
   */
  it('still returns focus to the combobox when Escape closes the dropbox', () => {
    mount();
    openAndHighlightFirst();

    cy.get(`#${mountId}`).find('.vscomp-wrapper').trigger('keydown', { key: 'Escape', keyCode: 27, which: 27 });

    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('have.class', 'closed');
    cy.focused().should('have.class', 'vscomp-wrapper');
  });

  /**
   * Same control on the layout where it actually bites. showAsPopup skips initDropboxPopover(),
   * so closeDropbox() runs afterHidePopper() synchronously - i.e. right after the wrapper
   * refocus and while the options are still visible and therefore still focusable. That is the
   * path where clearing the highlight used to steal focus for real.
   */
  it('still returns focus to the combobox when a popup layout closes', () => {
    mount({ showAsPopup: true });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).pressKeys('ArrowDown');
    cy.get(`#${mountId}`).find('.vscomp-option.focused').should('exist');

    cy.get(`#${mountId}`).find('.vscomp-wrapper').trigger('keydown', { key: 'Escape', keyCode: 27, which: 27 });

    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('have.class', 'closed');
    cy.focused().should('have.class', 'vscomp-wrapper');
  });
});
