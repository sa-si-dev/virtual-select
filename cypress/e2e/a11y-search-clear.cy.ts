/** cSpell:ignore vscomp */

/**
 * The search clear button, from the keyboard.
 *
 * WCAG 2.1.1 Keyboard (A) and 2.4.3 Focus Order (A).
 *
 * In a single select, Tab from the search input moves into the list, so the clear button is
 * reached backwards: Tab, then Shift+Tab. Two things got in the way of that path:
 *
 * - The scrollable `.vscomp-options-container` had no tabindex. Firefox makes a scroll container
 *   a tab stop by itself, so there it took one more Shift+Tab, and Enter on that stop selected the
 *   highlighted option and closed the dropdown.
 * - After the button cleared the search, focus ended on the first option rather than back in the
 *   search input that `onSearchClear()` asks for, so the next key went to the list instead of the
 *   search box.
 *
 * The real Tab order is only observable with real key presses in each engine; the first case pins
 * the attribute that produces it.
 *
 * Enter and Space are used up by the button. It moves focus into the search input during the
 * key press, so a key left unhandled reached the input afterwards: Space typed a space into the
 * search box the button had just cleared, and Enter submitted an enclosing form.
 *
 * And the options container being focusable (tabindex="-1") must not let a mouse press on its
 * own background or scrollbar take focus out of the search input.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

describe('A11y: search clear button', { testIsolation: true }, () => {
  const mountId = 'vs-a11y-search-clear';

  const mount = (extra: Record<string, unknown> = {}, viewportWidth = 1280) => {
    cy.viewport(viewportWidth, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(20), search: true, ...extra }));
  };

  /** opens the dropdown and types into the search input, so the clear button shows */
  const openAndType = () => {
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.isOpened(), 'opened').to.equal(true);
    });
    cy.get(`#${mountId}`).then(($ele) => cy.wrap($ele[0].virtualSelect.$searchInput).type('1'));
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.searchValue, 'search typed').to.equal('1');
    });
  };

  const assertClearedWithFocusInSearch = () => {
    cy.get(`#${mountId}`).should(($ele) => {
      const vs = $ele[0].virtualSelect;

      expect(vs.searchValue, 'search value').to.equal('');
      expect(vs.isOpened(), 'still open').to.equal(true);
      expect($ele[0].ownerDocument.activeElement, 'focus').to.equal(vs.$searchInput);
    });

    /**
     * Held for a moment as well: a re-render after the clear used to move focus onto the first
     * option a little later, which an immediate check passes straight through.
     */
    cy.wait(300);
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].ownerDocument.activeElement, 'focus, after the list re-rendered').to.equal(
        $ele[0].virtualSelect.$searchInput,
      );
    });
  };

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  /**
   * The button focuses the search input before it clears the search, and that focus can run a
   * host focus handler synchronously - one that destroys the component, say. destroy() stops
   * the pending server search; a clear that went on afterwards scheduled a new one, and
   * onServerSearch was then called with the destroyed instance.
   */
  it('does not start a server search when a focus handler destroyed the component during the clear', () => {
    const searches: string[] = [];

    mount({ onServerSearch: (value: string) => searches.push(value) });
    openAndType();
    cy.wrap(searches).should('deep.equal', ['1']);

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      vs.$searchClear.focus();
      expect($ele[0].ownerDocument.activeElement, 'focus on the clear button').to.equal(vs.$searchClear);
      vs.$searchInput.addEventListener('focus', () => vs.destroy(), { once: true });
      vs.$searchClear.click();
      expect(vs.isDestroyed, 'the focus handler destroyed it').to.equal(true);
    });

    /** well past searchDelay (300ms), when a scheduled search would have run */
    cy.wait(700);
    cy.wrap(searches).should('deep.equal', ['1']);
  });

  it('keeps the scrollable options list out of the Tab order', () => {
    mount();
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.$optionsContainer.getAttribute('tabindex'), 'options container tabindex').to.equal(
        '-1',
      );
    });
  });

  it('marks Enter and Space on the clear button as handled', () => {
    mount();
    openAndType();

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;
      const prevented = ['Enter', 'Space'].map((code) => {
        vs.$searchClear.focus();
        const event = new KeyboardEvent('keydown', {
          key: code === 'Space' ? ' ' : code, code, bubbles: true, cancelable: true,
        });

        vs.$searchClear.dispatchEvent(event);

        return event.defaultPrevented;
      });

      expect(prevented, 'defaultPrevented for Enter, Space').to.deep.equal([true, true]);
    });
  });

  it('hands focus back to the search input when the options container itself takes it', () => {
    mount();
    openAndType();

    /**
     * A mouse press there focuses the container, which a synthetic press cannot reproduce, so
     * the focus is given directly. The press itself must stay untouched: holding it back with
     * preventDefault() was tried and stopped the scrollbar thumb from being dragged in Firefox.
     */
    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      vs.$optionsContainer.focus();
      expect($ele[0].ownerDocument.activeElement, 'focus handed back to the search input').to.equal(vs.$searchInput);
      expect(vs.isOpened(), 'still open').to.equal(true);
    });
  });

  /**
   * Not in the popup layout, which keeps focus on the combobox when it opens so that a touch
   * device does not raise its on-screen keyboard over the list. A tap on blank list space must
   * not raise it either.
   */
  it('leaves focus alone when the options container takes it in the popup layout', () => {
    mount({}, 500);
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.showAsPopup, 'popup layout').to.equal(true);
    });
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.isOpened(), 'opened').to.equal(true);
    });

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      vs.$optionsContainer.focus();
      expect($ele[0].ownerDocument.activeElement, 'focus stays where the tap put it').to.equal(vs.$optionsContainer);
    });
  });

  ['self', 'body'].forEach((dropboxWrapper) => {
    [false, true].forEach((multiple) => {
      const name = `${multiple ? 'multi' : 'single'}-select, dropboxWrapper: ${dropboxWrapper}`;

      ['Enter', 'Space'].forEach((code) => {
        it(`returns focus to the search input after ${code} on the clear button (${name})`, () => {
          mount({ dropboxWrapper, multiple });
          openAndType();

          cy.get(`#${mountId}`).then(($ele) => {
            const vs = $ele[0].virtualSelect;

            vs.$searchClear.focus();
            expect($ele[0].ownerDocument.activeElement, 'focus on the clear button').to.equal(vs.$searchClear);
            vs.$searchClear.dispatchEvent(
              new KeyboardEvent('keydown', { key: code === 'Space' ? ' ' : code, code, bubbles: true, cancelable: true }),
            );
          });

          assertClearedWithFocusInSearch();
        });
      });

      it(`returns focus to the search input after a click on the clear button (${name})`, () => {
        mount({ dropboxWrapper, multiple });
        openAndType();

        cy.get(`#${mountId}`).then(($ele) => cy.wrap($ele[0].virtualSelect.$searchClear).click());

        assertClearedWithFocusInSearch();
      });
    });
  });
});
