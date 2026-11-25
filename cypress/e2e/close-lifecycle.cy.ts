/** cSpell:ignore vscomp */

/**
 * One close is one close: a single `beforeClose`, a single `afterClose`, and a combobox that
 * says it is collapsed - whatever caused it.
 *
 * Three defects broke that, all from the same place: the component was not the only thing
 * closing its dropbox.
 *
 *   1. The popover behind the dropbox listens for Escape and outside clicks on its own and
 *      hides itself. Whenever the component closed for the same event, the popover was hidden
 *      twice and reported back twice: `afterClose` fired twice for one close.
 *   2. When only the popover reacted - Escape pressed while focus was outside the component -
 *      the dropbox left the screen without the component taking part: no `beforeClose`, and
 *      `aria-expanded="true"` left on a combobox with nothing expanded (WCAG 4.1.2).
 *   3. Opening one dropdown closed the others "silently", skipping the same bookkeeping: the
 *      closed combobox kept `aria-expanded="true"`, the host heard nothing, and the popover
 *      still believed it was shown - so the next open() of that dropdown put nothing on screen.
 *
 * And one of its own: a second close arriving inside the ~200ms hide transition (a double
 * click on the toggle) ran the whole close again, dispatching every event a second time.
 *
 * Popup mode (the full-screen overlay at or below `popupDropboxBreakpoint`) has no popover, so
 * none of the above reached it - and neither did the one useful thing the popover did: Escape
 * dismissing the dropdown wherever focus is. The popup block further down covers that.
 */

import { mountVs, unmountVs, makeOptions } from '../support/mount';

const LIFECYCLE_EVENTS = ['beforeOpen', 'afterOpen', 'beforeClose', 'afterClose'];

/**
 * Longer than the hide (~200ms) plus the show (~300ms) that may follow it. Every count below
 * is asserted only after this, never with a retrying should(): a duplicate event arrives late,
 * so an assertion that passes as soon as the first one lands would pass against the defect.
 */
const SETTLE = 700;

const mountId = 'vs-close-lifecycle';
const secondMountId = 'vs-close-lifecycle-2';
const outsideId = 'vs-close-lifecycle-outside';

/** the list is returned immediately and filled as the events arrive */
const record = (id = mountId) => {
  const events: string[] = [];

  cy.get(`#${id}`).then(($ele) => {
    LIFECYCLE_EVENTS.forEach((name) => {
      $ele[0].addEventListener(name, () => events.push(name));
    });
  });

  return events;
};

/**
 * Fully open means afterOpen has been dispatched - not merely that focus reached the search
 * input. The event is deferred by a tick after that focus move, so a recorder attached in
 * between would pick up this open's afterOpen as the first event of the close under test
 * (it did, on Firefox).
 *
 * Opening moves focus into the search input, except in popup mode, where it stays on the
 * combobox.
 */
const open = (id = mountId, focusedAfterOpen: '$searchInput' | '$wrapper' = '$searchInput') => {
  const state = { opened: false };

  cy.get(`#${id}`).then(($ele) => {
    $ele[0].addEventListener('afterOpen', () => { state.opened = true; }, { once: true });
  });
  cy.get(`#${id}`).find('.vscomp-toggle-button').click();
  cy.wrap(state).should('have.property', 'opened', true);
  cy.get(`#${id}`).should(($ele) => {
    expect($ele[0].ownerDocument.activeElement, `${focusedAfterOpen} focused after open`)
      .to.equal($ele[0].virtualSelect[focusedAfterOpen]);
  });
};

const addOutsideButton = (win: Window) => {
  const $outside = win.document.createElement('button');

  $outside.id = outsideId;
  $outside.textContent = 'outside';
  win.document.body.appendChild($outside);

  return $outside;
};

const cleanUp = () => {
  cy.window().then((win) => {
    unmountVs(win, mountId);
    unmountVs(win, secondMountId);
    win.document.getElementById(outsideId)?.remove();
  });
};

/** cancelable like a real key press, so a host's preventDefault() is visible to the component */
const pressEscapeOn = ($target: Element, init: KeyboardEventInit = {}) => {
  const win = $target.ownerDocument.defaultView as Window & typeof globalThis;
  const event = new win.KeyboardEvent('keydown', {
    key: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true, ...init,
  });

  $target.dispatchEvent(event);

  return event;
};

/**
 * An Escape that ends an IME composition. Chromium and Firefox flag it with isComposing; WebKit
 * fires compositionend first, so its keydown has isComposing false and keyCode 229.
 */
const IME_ESCAPES: Record<'isComposing' | 'keyCode229', KeyboardEventInit> = {
  isComposing: { isComposing: true },
  keyCode229: { keyCode: 229, which: 229 },
};

/**
 * Escape pressed in a host control that is not part of the component, where the key belongs to
 * that control: either it handled the key and said so with preventDefault(), or the key ended
 * an IME composition. Neither is a request to close the dropdown.
 */
const escapeTakenByHost = (id: string, how: 'preventDefault' | 'isComposing' | 'keyCode229') => {
  const events = record(id);

  cy.window().then((win) => {
    const $outside = addOutsideButton(win);

    if (how === 'preventDefault') {
      $outside.addEventListener('keydown', (e) => e.preventDefault());
    }
    $outside.focus();
    pressEscapeOn($outside, how === 'preventDefault' ? {} : IME_ESCAPES[how]);
  });
  cy.wait(SETTLE);

  cy.get(`#${id}`).should(($ele) => {
    const vs = $ele[0].virtualSelect;

    expect(vs.isOpened(), 'isOpened()').to.equal(true);
    expect(vs.$wrapper.getAttribute('aria-expanded'), 'aria-expanded').to.equal('true');
  });
  cy.wrap(events).should('deep.equal', []);
  cy.get(`#${outsideId}`).should('be.focused');
};

const assertClosed = (id = mountId) => {
  cy.get(`#${id}`).should(($ele) => {
    const vs = $ele[0].virtualSelect;

    expect(vs.isOpened(), 'isOpened()').to.equal(false);
    expect(vs.$wrapper.getAttribute('aria-expanded'), 'aria-expanded').to.equal('false');
    expect(vs.$dropboxContainer.getBoundingClientRect().height, 'rendered height').to.equal(0);
  });
};

['self', 'body'].forEach((dropboxWrapper) => {
  describe(`Closing the dropdown (dropboxWrapper: "${dropboxWrapper}")`, { testIsolation: true }, () => {
    const mount = (id = mountId) => {
      cy.window().then((win) => {
        mountVs(win, id, { options: makeOptions(50), search: true, dropboxWrapper });
      });
    };

    beforeEach(() => {
      cy.viewport(1280, 800);
      cy.visit('get-started');
      mount();
    });

    afterEach(cleanUp);

    it('reports an outside click as one close', () => {
      open();
      const events = record();

      cy.get('body').click(10, 10);
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
    });

    it('reports Escape as one close', () => {
      open();
      const events = record();

      cy.get(`#${mountId}`).then(($ele) => pressEscapeOn($ele[0].virtualSelect.$searchInput));
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
    });

    it('reports a click on another dropdown as one close', () => {
      mount(secondMountId);
      open();
      const events = record();

      cy.get(`#${secondMountId}`).find('.vscomp-toggle-button').click();
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
      cy.get(`#${secondMountId}`).should(($ele) => {
        expect($ele[0].virtualSelect.isOpened(), 'the clicked dropdown is open').to.equal(true);
      });
    });

    /**
     * Focus leaving the component does not close the dropdown by itself, so a host that moves
     * focus elsewhere leaves it open - and Escape has always dismissed it from there. It has to
     * be the component's close, not the popover vanishing on its own.
     */
    it('closes completely when Escape is pressed with focus outside the component', () => {
      open();
      const events = record();

      cy.window().then((win) => addOutsideButton(win).focus());

      cy.get(`#${mountId}`).then(($ele) => {
        const doc = $ele[0].ownerDocument;
        const $outside = doc.getElementById(outsideId) as HTMLElement;

        expect(doc.activeElement, 'focus is outside the component').to.equal($outside);
        expect($ele[0].virtualSelect.isOpened(), 'still open after focus left').to.equal(true);
        expect(events, 'nothing closed it yet').to.deep.equal([]);

        pressEscapeOn($outside);
      });
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
      cy.get(`#${outsideId}`).should('be.focused');
    });

    /**
     * Nothing focused - the host blurred or removed the focused element - is the one case where
     * this close moves focus. It follows the rule of every other close: with focus on <body>,
     * the combobox takes it, rather than the keyboard user being left nowhere (WCAG 2.4.3).
     */
    it('hands focus to the combobox when Escape is pressed with nothing focused', () => {
      open();
      const events = record();

      cy.get(`#${mountId}`).then(($ele) => {
        const doc = $ele[0].ownerDocument;

        (doc.activeElement as HTMLElement).blur();

        expect(doc.activeElement, 'nothing is focused').to.equal(doc.body);
        expect($ele[0].virtualSelect.isOpened(), 'still open after the blur').to.equal(true);
        expect(events, 'nothing closed it yet').to.deep.equal([]);

        pressEscapeOn(doc.body);
      });
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
      cy.get(`#${mountId}`).should(($ele) => {
        expect($ele[0].ownerDocument.activeElement, 'focus').to.equal($ele[0].virtualSelect.$wrapper);
      });
    });

    it('stays open when a host control handled Escape and prevented its default', () => {
      open();
      escapeTakenByHost(mountId, 'preventDefault');
    });

    (['isComposing', 'keyCode229'] as const).forEach((how) => {
      it(`stays open when Escape ends an IME composition in a host control (${how})`, () => {
        open();
        escapeTakenByHost(mountId, how);
      });
    });

    /**
     * isOpened() stays true for the whole hide transition. A second close arriving inside it
     * must find the close already running and leave it alone.
     */
    it('treats a second close() during the hide transition as the same close', () => {
      open();
      const events = record();

      cy.get(`#${mountId}`).then(($ele) => {
        $ele[0].close!();
        expect($ele[0].virtualSelect.isOpened(), 'still mid hide-transition').to.equal(true);
        $ele[0].close!();
      });
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
    });

    /**
     * isOpened() stays true for the whole hide transition, so a second toggle click inside it is
     * routed to close again and finds that close already running: the dropdown ends closed, with
     * one beforeClose and one afterClose. That a second click does not reopen is the owner's
     * decision - every click toggling was tried and turned down. A third click is the same.
     */
    [2, 3].forEach((clicks) => {
      it(`treats ${clicks} toggle clicks in a row as one close`, () => {
        open();
        const events = record();

        cy.get(`#${mountId}`).then(($ele) => {
          const vs = $ele[0].virtualSelect;

          for (let i = 0; i < clicks; i += 1) {
            vs.$toggleButton.click();
          }
          expect(vs.isOpened(), 'still mid hide-transition after the last click').to.equal(true);
        });
        cy.wait(SETTLE);

        assertClosed();
        cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
      });
    });

    /**
     * Enter has the same rule, and for the same reason: isOpened() is still true during the
     * fade, so Enter goes to "select the highlighted option", and the close has already cleared
     * the highlight - the key does nothing. Reopening on it was considered and turned down by the
     * owner: a held or double-pressed Enter selects an option and closes the list, and its next
     * repeat would put the list straight back.
     */
    it('does not reopen on Enter pressed while the close is still fading', () => {
      open();
      const events = record();

      cy.get(`#${mountId}`).then(($ele) => {
        const vs = $ele[0].virtualSelect;
        const win = $ele[0].ownerDocument.defaultView as Window & typeof globalThis;

        pressEscapeOn(vs.$searchInput);
        expect(vs.isOpened(), 'mid hide-transition').to.equal(true);
        vs.$wrapper.dispatchEvent(new win.KeyboardEvent('keydown', {
          key: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true,
        }));
      });
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
      cy.get(`#${mountId}`).should(($ele) => {
        expect($ele[0].virtualSelect.getValue(), 'nothing selected').to.equal('');
      });
    });

    /**
     * A close inside the ~300ms show transition stops the popover before it reports the open
     * finished, so afterOpen used to be lost: beforeOpen with no matching afterOpen.
     */
    it('reports an open interrupted by a close as a whole open, then the close', () => {
      const events = record();

      cy.get(`#${mountId}`).then(($ele) => {
        $ele[0].open!();
        expect($ele[0].virtualSelect.isOpened(), 'open has started').to.equal(true);
        $ele[0].close!();
      });
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(events).should('deep.equal', ['beforeOpen', 'afterOpen', 'beforeClose', 'afterClose']);
    });

    it('treats open() on a dropdown that is already open as a no-op', () => {
      open();
      const events = record();

      cy.get(`#${mountId}`).then(($ele) => $ele[0].open!());
      cy.wait(SETTLE);

      cy.wrap(events).should('deep.equal', []);
      cy.get(`#${mountId}`).should(($ele) => {
        const vs = $ele[0].virtualSelect;

        expect(vs.isOpened(), 'isOpened()').to.equal(true);
        expect(vs.$wrapper.getAttribute('aria-expanded'), 'aria-expanded').to.equal('true');
      });
    });

    /** the clear button handles Enter and Space itself; Escape still has to reach the close */
    it('closes on Escape pressed on the search clear button', () => {
      open();
      cy.get(`#${mountId}`).then(($ele) => cy.wrap($ele[0].virtualSelect.$searchInput).type('1'));
      const events = record();

      cy.get(`#${mountId}`).then(($ele) => {
        const vs = $ele[0].virtualSelect;

        expect(vs.$searchClear.getAttribute('tabindex'), 'clear button reachable').to.equal('0');
        vs.$searchClear.focus();
        expect($ele[0].ownerDocument.activeElement, 'focus on the clear button').to.equal(vs.$searchClear);
        pressEscapeOn(vs.$searchClear);
      });
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
    });

    /**
     * An Escape the dropdown used to close itself is marked handled, so an enclosing dialog or
     * host shortcut that respects defaultPrevented does not act on the same key press. An
     * Escape that closed nothing is left alone.
     */
    it('marks an Escape that closed it as handled, and only that one', () => {
      open();
      const seen: boolean[] = [];

      cy.get(`#${mountId}`).then(($ele) => {
        seen.push(pressEscapeOn($ele[0].virtualSelect.$searchInput).defaultPrevented);
      });
      cy.wait(SETTLE);
      assertClosed();

      cy.get(`#${mountId}`).then(($ele) => {
        const vs = $ele[0].virtualSelect;

        vs.$wrapper.focus();
        seen.push(pressEscapeOn(vs.$wrapper).defaultPrevented);
      });
      cy.wrap(seen).should('deep.equal', [true, false]);
    });

    /**
     * An Escape pressed in a host control closes the dropdown, but the key stays that control's:
     * it is not marked handled, so the control's own Escape behaviour (a search field clearing
     * itself, say) still runs - as it did before the document-level close existed.
     */
    it('closes on an Escape pressed in a host control, and leaves the key to that control', () => {
      open();
      const seen: boolean[] = [];

      cy.window().then((win) => {
        const $outside = addOutsideButton(win);

        $outside.focus();
        seen.push(pressEscapeOn($outside).defaultPrevented);
      });
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(seen).should('deep.equal', [false]);
    });

    /**
     * With nothing focused the key belongs to no control, so the dropdown takes it - and an
     * enclosing native <dialog> does not close on the same key press.
     */
    it('marks an Escape pressed with nothing focused that closed it as handled', () => {
      open();
      const seen: boolean[] = [];

      cy.get(`#${mountId}`).then(($ele) => {
        const doc = $ele[0].ownerDocument;

        (doc.activeElement as HTMLElement).blur();
        seen.push(pressEscapeOn(doc.body).defaultPrevented);
      });
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(seen).should('deep.equal', [true]);
    });

    /**
     * The combobox is part of the component, but with an external dropboxWrapper only the
     * document-level handler sees an Escape pressed on it.
     */

    it('marks an Escape on the combobox that closed it as handled', () => {
      open();
      const seen: boolean[] = [];

      cy.get(`#${mountId}`).then(($ele) => {
        const vs = $ele[0].virtualSelect;

        vs.$wrapper.focus();
        expect(vs.isOpened(), 'still open with focus on the combobox').to.equal(true);
        seen.push(pressEscapeOn(vs.$wrapper).defaultPrevented);
      });
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(seen).should('deep.equal', [true]);
    });

    /**
     * An Escape that cancels an IME composition in the search input belongs to the IME, the
     * same rule the document-level handler follows for a host control.
     */
    (['isComposing', 'keyCode229'] as const).forEach((how) => {
      it(`stays open when Escape ends an IME composition in its own search input (${how})`, () => {
        open();
        const events = record();
        const seen: boolean[] = [];

        cy.get(`#${mountId}`).then(($ele) => {
          seen.push(pressEscapeOn($ele[0].virtualSelect.$searchInput, IME_ESCAPES[how]).defaultPrevented);
        });
        cy.wait(SETTLE);

        cy.get(`#${mountId}`).should(($ele) => {
          const vs = $ele[0].virtualSelect;

          expect(vs.isOpened(), 'isOpened()').to.equal(true);
          expect(vs.$wrapper.getAttribute('aria-expanded'), 'aria-expanded').to.equal('true');
          expect($ele[0].ownerDocument.activeElement, 'focus').to.equal(vs.$searchInput);
        });
        cy.wrap(events).should('deep.equal', []);
        cy.wrap(seen).should('deep.equal', [false]);
      });
    });

    /**
     * The destroyed instance's hide timer also ends in the popover's own clean-up, which takes
     * the "shown" marker off the host element - the element the new instance's popover now
     * uses. Opened inside that window, the new dropdown's popover lost track of being shown,
     * and the next close never finished.
     */
    it('still closes a new instance opened on the element while the destroyed one was fading', () => {
      open();

      cy.window().then((win) => {
        const $host = win.document.getElementById(mountId) as HTMLElement;
        const vs = $host.virtualSelect;

        vs.closeDropbox();
        expect(vs.isOpened(), 'mid hide-transition').to.equal(true);
        vs.destroy();
        // @ts-expect-error - VirtualSelect is attached to window by the bundle
        win.VirtualSelect.init({ ele: $host, options: makeOptions(50), search: true, dropboxWrapper });
        $host.open!();
      });
      cy.wait(SETTLE);

      cy.get(`#${mountId}`).should(($ele) => {
        const vs = $ele[0].virtualSelect;

        expect(vs.isOpened(), 'the new instance opened').to.equal(true);
        expect(vs.$dropboxContainer.getBoundingClientRect().height, 'the new dropbox is on screen').to.be.greaterThan(0);
      });
      const events = record();

      cy.get(`#${mountId}`).then(($ele) => $ele[0].close!());
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
    });

    /** the same marker, left behind by an instance destroyed while its dropdown was simply open */
    it('opens a new instance built on the element of one destroyed while open', () => {
      open();

      cy.window().then((win) => {
        const $host = win.document.getElementById(mountId) as HTMLElement;

        $host.virtualSelect.destroy();
        // @ts-expect-error - VirtualSelect is attached to window by the bundle
        win.VirtualSelect.init({ ele: $host, options: makeOptions(50), search: true, dropboxWrapper });
        $host.open!();
      });
      cy.wait(SETTLE);

      cy.get(`#${mountId}`).should(($ele) => {
        const vs = $ele[0].virtualSelect;

        expect(vs.isOpened(), 'the new instance opened').to.equal(true);
        expect(vs.$dropboxContainer.getBoundingClientRect().height, 'the new dropbox is on screen').to.be.greaterThan(0);
      });
    });

    /**
     * A framework re-render can destroy an instance mid-fade and build a new one on the same
     * element. The old instance's hide timer still runs; it must not report its close on the
     * element the new instance now owns.
     */
    it('does not report a close after the instance is destroyed mid-fade', () => {
      open();
      const afterCloses: string[] = [];

      cy.window().then((win) => {
        const $host = win.document.getElementById(mountId) as HTMLElement;
        const vs = $host.virtualSelect;

        vs.closeDropbox();
        expect(vs.isOpened(), 'mid hide-transition').to.equal(true);
        vs.destroy();
        // @ts-expect-error - VirtualSelect is attached to window by the bundle
        win.VirtualSelect.init({ ele: $host, options: makeOptions(50), search: true, dropboxWrapper });
        $host.addEventListener('afterClose', () => afterCloses.push('afterClose'));
      });
      cy.wait(SETTLE);

      cy.wrap(afterCloses).should('deep.equal', []);
      cy.get(`#${mountId}`).should(($ele) => {
        expect($ele[0].virtualSelect.isOpened(), 'the new instance is closed').to.equal(false);
      });
    });

    /**
     * A host focus handler on the combobox can destroy the instance from inside the focus
     * hand-back at the end of the fade - a framework unmounting the component on that focus,
     * say. An open queued behind the fade must not be replayed on the destroyed instance: it
     * registered it as open again and showed its popover on the element a new instance uses.
     */
    it('does not replay a queued open on an instance a focus handler destroyed at the end of the fade', () => {
      open();

      cy.window().then((win) => {
        const $host = win.document.getElementById(mountId) as HTMLElement;
        const vs = $host.virtualSelect;

        vs.closeDropbox();
        $host.open!();
        expect(vs.pendingOpen, 'the open is queued').to.equal(true);

        /**
         * closeDropbox() has already handed focus to the combobox. Put it back in the fading
         * list - an arrow key mid-fade does that for a user - so the end of the fade hands it
         * to the combobox again, and the handler armed now runs inside that hand-back.
         */
        vs.$searchInput.focus();
        expect(win.document.activeElement, 'focus in the fading list').to.equal(vs.$searchInput);
        vs.$wrapper.addEventListener('focus', () => vs.destroy(), { once: true });

        cy.wait(SETTLE).then(() => {
          expect(vs.isDestroyed, 'the focus handler destroyed it').to.equal(true);
          // @ts-expect-error - VirtualSelect is attached to window by the bundle
          expect(win.VirtualSelect.openInstances.has(vs), 'registered as open').to.equal(false);
          expect($host.classList.contains('pop-comp-active'), 'popover marked shown on the element').to.equal(false);
        });
      });
    });

    /**
     * A click inside another instance's dropbox is a click on that instance. With its dropbox
     * portalled to <body>, the click lands in the dropbox wrapper, whose instance is recorded on
     * the wrapper itself - not on its parent, as for the component's own wrapper - so the click
     * was taken for a click on nothing in particular and this dropdown stayed open.
     *
     * A portalled dropbox is only on screen next to an open one while it fades out: the other
     * dropdown is closed, this one opened through the API, and the click lands in the fading
     * list. (A keepAlwaysOpen list is never portalled, so it cannot stand in for it.)
     */
    it('closes when an option is clicked in another instance\'s fading portalled dropbox', () => {
      cy.window().then((win) => {
        mountVs(win, secondMountId, { options: makeOptions(6), search: true, dropboxWrapper: 'body' });
      });
      open(secondMountId);

      cy.get(`#${mountId}`).then(($ele) => {
        const doc = $ele[0].ownerDocument;
        const $second = doc.getElementById(secondMountId) as HTMLElement;
        const second = $second.virtualSelect;

        expect(second.hasDropboxWrapper, 'the other dropbox is portalled').to.equal(true);
        second.closeDropbox();
        expect(second.isOpened(), 'the other dropbox is fading out').to.equal(true);
        $ele[0].open!();
        expect($ele[0].virtualSelect.isOpened(), 'this one is open').to.equal(true);

        (second.$dropboxContainer.querySelector('.vscomp-option') as HTMLElement).click();
      });
      cy.wait(SETTLE);

      assertClosed();
    });

    /**
     * open() on a dropdown still fading out is queued, and the dropdown counted as open. The
     * other open dropdown used to stay open until the queue was replayed, so for up to ~200ms
     * two counted as open, and one Escape could reach only one of them: either the other stayed
     * on screen, or - with focus in the other one - the queued one opened after the user had
     * dismissed everything. The other dropdown now closes when the open is queued, as it does
     * for an open that is not queued.
     */
    const queueOpenBehindFade = ($ele: JQuery<HTMLElement>) => {
      const vs = $ele[0].virtualSelect;
      const $second = $ele[0].ownerDocument.getElementById(secondMountId) as HTMLElement;

      $second.open!();
      expect(vs.isOpened(), 'the first is fading out').to.equal(true);
      $ele[0].open!();
      expect(vs.pendingOpen, 'its open is queued').to.equal(true);

      return $second.virtualSelect;
    };

    it('closes the other dropdown as soon as an open is queued behind a fade', () => {
      mount(secondMountId);
      open();

      cy.get(`#${mountId}`).then(($ele) => {
        const second = queueOpenBehindFade($ele);

        expect(second.isOpenOrOpening(), 'the other dropdown is closing already').to.equal(false);
        expect(second.$wrapper.getAttribute('aria-expanded'), 'its aria-expanded').to.equal('false');
      });
      cy.wait(SETTLE);

      assertClosed(secondMountId);
      cy.get(`#${mountId}`).should(($ele) => {
        expect($ele[0].virtualSelect.isOpened(), 'the queued open was replayed').to.equal(true);
      });
    });

    it('closes both on one Escape while an open is queued behind a fade', () => {
      mount(secondMountId);
      open();

      cy.get(`#${mountId}`).then(($ele) => {
        const doc = $ele[0].ownerDocument;

        queueOpenBehindFade($ele);
        (doc.activeElement as HTMLElement).blur();
        pressEscapeOn(doc.body);
      });
      cy.wait(SETTLE);

      assertClosed();
      assertClosed(secondMountId);
    });

    /**
     * No click is involved here, so nothing but the open() itself closes the first dropdown -
     * the click route above has the document click handler doing it first.
     */
    it('closes the other dropdown completely when one is opened through the API', () => {
      mount(secondMountId);
      open();
      const events = record();

      cy.get(`#${secondMountId}`).then(($ele2) => $ele2[0].open!());
      cy.wait(SETTLE);

      assertClosed();
      cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
      cy.get(`#${secondMountId}`).should(($ele) => {
        expect($ele[0].virtualSelect.isOpened(), 'the dropdown opened through the API is open').to.equal(true);
      });
    });

    it('can open the other dropdown again after the API closed it', () => {
      mount(secondMountId);
      open();

      cy.get(`#${secondMountId}`).then(($ele2) => $ele2[0].open!());
      cy.wait(SETTLE);

      const events = record();

      cy.get(`#${mountId}`).then(($ele) => $ele[0].open!());
      cy.wait(SETTLE);

      cy.wrap(events).should('deep.equal', ['beforeOpen', 'afterOpen']);
      cy.get(`#${mountId}`).should(($ele) => {
        const vs = $ele[0].virtualSelect;

        expect(vs.isOpened(), 'isOpened()').to.equal(true);
        expect(vs.$wrapper.getAttribute('aria-expanded'), 'aria-expanded').to.equal('true');
        expect(vs.$dropboxContainer.getBoundingClientRect().height, 'rendered height').to.be.greaterThan(0);
        expect(getComputedStyle(vs.$dropboxContainer).opacity, 'opacity').to.equal('1');
        expect($ele[0].ownerDocument.activeElement, 'focus lands in the search input').to.equal(vs.$searchInput);
      });
      assertClosed(secondMountId);
    });
  });
});

/**
 * Popup mode: at or below `popupDropboxBreakpoint` (576px by default) the dropbox is a
 * full-screen overlay. There is no popover behind it, so a close is synchronous and was never
 * doubled - but Escape only reached the component's own keydown handler, which needs focus on
 * the component. Opening leaves focus on the combobox, so that usually held; once focus was
 * anywhere else, an overlay covering the whole page could not be dismissed from the keyboard.
 */
describe('Closing the dropdown in popup mode', { testIsolation: true }, () => {
  const mount = (id = mountId) => {
    cy.window().then((win) => {
      mountVs(win, id, { options: makeOptions(50), search: true });
    });
  };

  const openPopup = (id = mountId) => open(id, '$wrapper');

  const assertPopupClosed = (id = mountId) => {
    assertClosed(id);
    cy.get('body').should('not.have.class', 'vscomp-popup-active');
  };

  beforeEach(() => {
    // the layout is decided from the viewport width when the instance is created
    cy.viewport(500, 800);
    cy.visit('get-started');
    mount();
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.showAsPopup, 'popup mode').to.equal(true);
      expect($ele[0].virtualSelect.dropboxPopover, 'no popover in popup mode').to.equal(undefined);
    });
  });

  afterEach(cleanUp);

  /** Two handlers see this key now - the component's and the document's. Still one close. */
  it('reports Escape as one close', () => {
    openPopup();
    const events = record();

    cy.get('body').should('have.class', 'vscomp-popup-active');
    cy.get(`#${mountId}`).then(($ele) => pressEscapeOn($ele[0].virtualSelect.$wrapper));
    cy.wait(SETTLE);

    assertPopupClosed();
    cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].ownerDocument.activeElement, 'focus').to.equal($ele[0].virtualSelect.$wrapper);
    });
  });

  it('marks the Escape that closed the popup as handled', () => {
    openPopup();

    cy.get(`#${mountId}`).then(($ele) => {
      expect(pressEscapeOn($ele[0].virtualSelect.$wrapper).defaultPrevented, 'defaultPrevented').to.equal(true);
    });
    assertPopupClosed();
  });

  it('closes on an Escape pressed behind the popup, and leaves the key to that control', () => {
    openPopup();

    cy.window().then((win) => {
      const $outside = addOutsideButton(win);

      $outside.focus();
      expect(pressEscapeOn($outside).defaultPrevented, 'defaultPrevented').to.equal(false);
    });
    assertPopupClosed();
  });

  it('closes on Escape when nothing is focused, and hands focus to the combobox', () => {
    openPopup();
    const events = record();

    cy.get(`#${mountId}`).then(($ele) => {
      const doc = $ele[0].ownerDocument;

      (doc.activeElement as HTMLElement).blur();

      expect(doc.activeElement, 'nothing is focused').to.equal(doc.body);
      expect($ele[0].virtualSelect.isOpened(), 'still open after the blur').to.equal(true);

      pressEscapeOn(doc.body);
    });
    cy.wait(SETTLE);

    assertPopupClosed();
    cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].ownerDocument.activeElement, 'focus').to.equal($ele[0].virtualSelect.$wrapper);
    });
  });

  it('closes on Escape when focus is on an element behind the popup, and leaves focus there', () => {
    openPopup();
    const events = record();

    cy.window().then((win) => addOutsideButton(win).focus());

    cy.get(`#${mountId}`).then(($ele) => {
      const doc = $ele[0].ownerDocument;
      const $outside = doc.getElementById(outsideId) as HTMLElement;

      expect(doc.activeElement, 'focus is behind the popup').to.equal($outside);
      expect($ele[0].virtualSelect.isOpened(), 'still open after focus left').to.equal(true);
      expect(events, 'nothing closed it yet').to.deep.equal([]);

      pressEscapeOn($outside);
    });
    cy.wait(SETTLE);

    assertPopupClosed();
    cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
    cy.get(`#${outsideId}`).should('be.focused');
  });

  it('stays open when a host control handled Escape and prevented its default', () => {
    openPopup();
    escapeTakenByHost(mountId, 'preventDefault');
  });

  (['isComposing', 'keyCode229'] as const).forEach((how) => {
    it(`stays open when Escape ends an IME composition in a host control (${how})`, () => {
      openPopup();
      escapeTakenByHost(mountId, how);
    });
  });

  /**
   * open() does not move focus in popup mode, so it stays on the combobox of the dropdown the
   * user opened first. Escape pressed there belongs to a dropdown that is already closed.
   */
  it('closes a popup that was opened through the API while focus stayed on another dropdown', () => {
    mount(secondMountId);
    openPopup();

    cy.get(`#${secondMountId}`).then(($ele2) => $ele2[0].open!());
    cy.wait(SETTLE);

    const events = record(secondMountId);

    cy.get(`#${mountId}`).then(($ele) => {
      const doc = $ele[0].ownerDocument;
      const $second = doc.getElementById(secondMountId) as HTMLElement;

      expect($ele[0].virtualSelect.isOpened(), 'the first popup was closed').to.equal(false);
      expect($second.virtualSelect.isOpened(), 'the second popup is open').to.equal(true);
      expect(doc.activeElement, 'focus stayed on the first combobox').to.equal($ele[0].virtualSelect.$wrapper);

      pressEscapeOn(doc.activeElement as Element);
    });
    cy.wait(SETTLE);

    assertPopupClosed(secondMountId);
    cy.wrap(events).should('deep.equal', ['beforeClose', 'afterClose']);
  });
});

/**
 * A keepAlwaysOpen list is not dismissible, and Escape pressed elsewhere on the page has never
 * touched it. closeDropbox() on such a list does not close it but does clear its highlighted
 * option, so "still visible" would not notice the document-level handler reaching it.
 */
describe('Escape and a keepAlwaysOpen list', { testIsolation: true }, () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => {
      mountVs(win, mountId, { options: makeOptions(6), search: true, keepAlwaysOpen: true });
    });
  });

  afterEach(cleanUp);

  it('leaves the list and its highlighted option alone when Escape is pressed elsewhere on the page', () => {
    const events = record();

    cy.get(`#${mountId}`).find('.vscomp-option').eq(1).trigger('mouseover');
    cy.get(`#${mountId}`).find('.vscomp-option.focused').should('have.length', 1);

    cy.window().then((win) => {
      const $outside = addOutsideButton(win);

      $outside.focus();
      expect(win.document.activeElement, 'focus is outside the component').to.equal($outside);

      pressEscapeOn($outside);
    });
    cy.wait(SETTLE);

    cy.get(`#${mountId}`).find('.vscomp-option.focused').should('have.length', 1);
    cy.get(`#${mountId}`).find('.vscomp-dropbox-container').should('be.visible');
    cy.wrap(events).should('deep.equal', []);
  });

  /**
   * A keepAlwaysOpen list is always open, so open() has nothing to show - but it has always
   * reported the open and moved focus into the list, and a host can use it for exactly that.
   */
  it('still reports open() and moves focus into the list', () => {
    const events = record();

    cy.window().then((win) => addOutsideButton(win).focus());
    cy.get(`#${mountId}`).then(($ele) => $ele[0].open!());
    cy.wait(SETTLE);

    cy.wrap(events).should('deep.equal', ['beforeOpen', 'afterOpen']);
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].ownerDocument.activeElement, 'focus').to.equal($ele[0].virtualSelect.$searchInput);
    });
  });
});
