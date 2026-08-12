/** cSpell:ignore vscomp popcomp */

/**
 * A reopen that arrives while the dropbox is still closing must still open it.
 *
 * The popover refuses to show while its own hide transition is running: `show()` early-returns
 * for as long as `pop-comp-active` is on the element, and only its `afterHide` removes that
 * class. So `openDropbox()` during the ~200ms fade did all of its own work - `beforeOpen`,
 * `aria-expanded="true"`, the instance back in `openInstances` - while `popper.show()` quietly
 * did nothing and `afterShowPopper()` never ran. The pending hide then completed on top of it.
 *
 * The dropdown ended up shut with its combobox still announcing `aria-expanded="true"`, no
 * `afterOpen` ever dispatched, and focus dropped to `<body>` (the popover applies
 * `display: none` before the component gets any callback, so nothing can hand it back). The
 * host's `open()` was silently lost - it only looks like nothing happened, which is the worst
 * shape for a bug to have.
 *
 * Reachable through the public `open()` API only: `toggleDropbox()` sees `isOpened() === true`
 * for the whole transition, so a second click closes again rather than reopening.
 */

import { mountVs, unmountVs, makeOptions } from '../support/mount';

describe('Reopening while the dropbox is still closing', { testIsolation: true }, () => {
  const mountId = 'vs-reopen-during-hide';
  const secondMountId = 'vs-reopen-during-hide-2';

  const mount = (extra: Record<string, unknown> = {}) => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => {
      mountVs(win, mountId, { options: makeOptions(50), search: true, dropboxWrapper: 'body', ...extra });
    });
  };

  const open = () => {
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('not.have.class', 'closed');
  };

  /**
   * Close and reopen inside the same tick, so the reopen is guaranteed to land inside the hide
   * transition rather than racing a Cypress command hop. `isOpened()` is asserted between the
   * two to prove the transition really is still running - otherwise the case could pass by
   * testing an ordinary closed-then-open sequence.
   */
  const closeThenReopen = () => {
    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      vs.closeDropbox();
      expect(vs.isOpened(), 'still mid hide-transition when the reopen arrives').to.equal(true);
      $ele[0].open?.();
    });
  };

  /**
   * Settle first, then assert.
   *
   * Every assertion below also holds *during* the fade - `openDropbox()` sets aria-expanded and
   * clears aria-hidden synchronously, and the popover has not yet applied `display: none` - so a
   * retrying `should()` on its own would latch onto that transient and pass against the very bug
   * this spec exists for. The wait covers the hide (~200ms) plus the show that has to follow it.
   */
  const assertOpenAndVisible = () => {
    cy.wait(700);
    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('not.have.class', 'closed');
    cy.get(`#${mountId}`).should(($ele) => {
      const vs = $ele[0].virtualSelect;

      expect(vs.isOpened(), 'isOpened()').to.equal(true);
      expect(vs.$dropboxContainer.style.display, 'container display').to.not.equal('none');
      expect(vs.$dropboxContainer.getBoundingClientRect().height, 'rendered height').to.be.greaterThan(0);
      expect(vs.$wrapper.getAttribute('aria-expanded'), 'aria-expanded').to.equal('true');
      expect(vs.$dropboxWrapper.getAttribute('aria-hidden'), 'aria-hidden').to.not.equal('true');
      expect(vs.$dropboxWrapper.getAttribute('tabindex'), 'tabindex').to.equal('0');
    });
  };

  /** opening focuses the search input asynchronously (popover afterShow); wait for it */
  const waitForSearchFocus = () => {
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].ownerDocument.activeElement, 'search input focused after open')
        .to.equal($ele[0].virtualSelect.$searchInput);
    });
  };

  afterEach(() => {
    cy.window().then((win) => {
      unmountVs(win, mountId);
      unmountVs(win, secondMountId);
    });
  });

  it('ends up open and on screen', () => {
    mount();
    open();
    closeThenReopen();

    assertOpenAndVisible();
  });

  /**
   * afterShowPopper() is where the dropdown finishes opening - the `focused` class, the scroll
   * position, and the focus move onto the search input. A reopen that never reaches it leaves a
   * dropdown nobody can type into.
   */
  it('finishes the open: focus lands in the search input', () => {
    mount();
    open();
    closeThenReopen();

    assertOpenAndVisible();

    cy.get(`#${mountId}`).should(($ele) => {
      const vs = $ele[0].virtualSelect;

      expect($ele[0].ownerDocument.activeElement, 'focus after the reopen').to.equal(vs.$searchInput);
      expect(vs.$wrapper.classList.contains('focused'), 'focused class').to.equal(true);
    });
  });

  /**
   * One open() call is one open, however the reopen has to be sequenced internally. A host
   * loading options on beforeOpen must not be asked twice, and afterOpen has to arrive - it is
   * the only signal that the dropdown is actually usable.
   */
  it('dispatches beforeOpen once and afterOpen once', () => {
    mount();
    open();

    const events: string[] = [];

    cy.get(`#${mountId}`).then(($ele) => {
      ['beforeOpen', 'afterOpen', 'beforeClose', 'afterClose'].forEach((name) => {
        $ele[0].addEventListener(name, () => events.push(name));
      });
    });

    closeThenReopen();
    assertOpenAndVisible();

    /** let any late duplicate arrive before counting - dispatchEvent defers through setTimeout */
    cy.wait(300);
    cy.then(() => {
      expect(events.filter((name) => name === 'beforeOpen').length, `beforeOpen (${events.join(', ')})`).to.equal(1);
      expect(events.filter((name) => name === 'afterOpen').length, `afterOpen (${events.join(', ')})`).to.equal(1);
    });
  });

  /** a close arriving after the queued reopen wins - the dropdown must not spring back open */
  it('does not reopen when a close follows the reopen', () => {
    mount();
    open();

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      vs.closeDropbox();
      $ele[0].open?.();
      vs.closeDropbox();
    });

    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('have.class', 'closed');
    cy.wait(600);
    cy.get(`#${mountId}`).should(($ele) => {
      const vs = $ele[0].virtualSelect;

      expect(vs.isOpened(), 'isOpened() after the trailing close').to.equal(false);
      expect(vs.$dropboxWrapper.getAttribute('aria-hidden'), 'aria-hidden').to.equal('true');
    });
  });

  /**
   * A queued open is not a promise to open regardless of what happens next. The page-level close
   * paths reach an instance through `VirtualSelect.openInstances`, and a queued instance is not
   * in it by default - closeDropbox() removed it before the open was ever queued - so an outside
   * click would sail past and the dropdown would spring open ~200ms after the user dismissed it.
   */
  it('cancels a queued open when the user clicks outside', () => {
    mount();
    open();
    closeThenReopen();

    cy.get('body').click(5, 5);

    cy.wait(700);
    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('have.class', 'closed');
    cy.get(`#${mountId}`).should(($ele) => {
      const vs = $ele[0].virtualSelect;

      expect(vs.isOpened(), 'isOpened() after the outside click').to.equal(false);
      expect(vs.$dropboxWrapper.getAttribute('aria-hidden'), 'aria-hidden').to.equal('true');
    });
  });

  /**
   * Same rule for the other page-level close: opening a second dropdown closes every other one.
   * A queue that survived it would reopen ~200ms later and, through its own "close all others"
   * loop, shut the dropdown the user had just opened.
   */
  it('cancels a queued open when another dropdown opens', () => {
    mount();
    cy.window().then((win) => {
      mountVs(win, secondMountId, { options: makeOptions(50), search: true, dropboxWrapper: 'body' });
    });
    open();

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      vs.closeDropbox();
      expect(vs.isOpened(), 'still mid hide-transition when the reopen arrives').to.equal(true);
      $ele[0].open?.();
    });

    cy.get(`#${secondMountId}`).then(($ele2) => $ele2[0].virtualSelect.openDropbox());

    cy.wait(800);
    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('have.class', 'closed');
    cy.get(`#${secondMountId}`).find('.vscomp-wrapper').should('not.have.class', 'closed');
    cy.get(`#${secondMountId}`).should(($ele2) => {
      expect($ele2[0].virtualSelect.isOpened(), 'the dropdown the user opened stayed open').to.equal(true);
    });
  });

  /**
   * Cancelling a queued open must cancel only the open - not silently rewrite the decision the
   * *original* close already made about where focus goes once its own hide finishes.
   *
   * onDocumentClick() and openDropbox()'s "close all other instances" loop both do
   * `instanceObj.shouldFocusWrapperOnClose = false` before calling `closeDropbox()` on every
   * entry in openInstances - and a queued instance is in that set (this is exactly what makes
   * the previous two cases able to cancel it at all). Before this fix, `closeDropbox()`'s
   * pendingOpen branch cancelled the queue but never touched that flag back, so it stayed
   * corrupted for the *original* close's own afterHidePopper() - which fires later, once the
   * hide that started all this actually finishes.
   *
   * Reproduced with a second dropdown opening (not an outside click): opening B runs
   * "close all others" synchronously, at the very top of B.openDropbox() - well before B's own
   * ~300ms show transition could plausibly move focus into B's search input and mask the
   * corruption by overwriting document.activeElement first. The assertion reads
   * document.activeElement the moment A's own hide finishes (~200ms), safely inside that
   * window.
   */
  it('does not let a cancelled queue corrupt where the original close sends focus', () => {
    mount();
    cy.window().then((win) => {
      mountVs(win, secondMountId, { options: makeOptions(50), search: true, dropboxWrapper: 'body' });
    });
    open();
    waitForSearchFocus();

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      // A's own close: default shouldFocusWrapperOnClose (true) - this close wants focus back.
      vs.closeDropbox();
      expect(vs.isOpened(), 'still mid hide-transition').to.equal(true);
      expect(vs.shouldFocusWrapperOnClose, 'A wants focus back, before anything cancels the queue')
        .to.equal(true);

      // Something puts focus back inside A's still-visible dropbox mid-fade.
      vs.$dropboxContainer.querySelector('.vscomp-option[data-index="3"]').focus();

      // Queue a reopen of A, then cancel it by opening a second, unrelated dropdown.
      $ele[0].open?.();
    });

    cy.get(`#${secondMountId}`).then(($ele2) => $ele2[0].virtualSelect.openDropbox());

    /**
     * Read document.activeElement in a one-shot .then() the instant A's own hide finishes, not
     * inside the retrying .should() above: B's own show transition also completes on its own
     * ~300ms timer and steals focus to its search input, and a retry that happens to land after
     * that would see B's focus instead of the value under test - passing or failing for the
     * wrong reason either way. A single check right after the class appears is the only way to
     * observe the moment this method actually runs.
     */
    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('have.class', 'closed');
    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      expect(
        $ele[0].ownerDocument.activeElement,
        'focus once A\'s own close finishes - it wanted focus back, and nothing since then asked for anything else',
      ).to.equal(vs.$wrapper);
    });
  });

  /**
   * Two reopen routes can converge on one close: the queued open, and a consumer focus handler
   * reacting to the wrapper refocus that releaseFocusFromDropbox() performs. Whichever gets there
   * first, the dropdown opens once.
   */
  it('dispatches beforeOpen once when a focus handler also reopens during the close', () => {
    mount();
    open();
    waitForSearchFocus();

    const events: string[] = [];

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      $ele[0].addEventListener('beforeOpen', () => events.push('beforeOpen'));

      vs.closeDropbox();
      expect(vs.isOpened(), 'still mid hide-transition').to.equal(true);
      $ele[0].open?.();

      /** focus inside, so the hide-end release has something to hand back and fires focusin */
      vs.$dropboxContainer.querySelector('.vscomp-option[data-index="3"]').focus();
      vs.$wrapper.addEventListener('focusin', () => $ele[0].open?.(), { once: true });
    });

    assertOpenAndVisible();

    cy.wait(300);
    cy.then(() => {
      expect(events.length, `beforeOpen count (${events.join(', ')})`).to.equal(1);
    });
  });

  /**
   * A consumer focus handler that reopens the dropdown synchronously - the same pattern the
   * a11y spec's "does not hide a dropdown a focus handler reopens during the close" pins - runs
   * from inside releaseFocusFromDropbox(), which afterHidePopper() calls before its own
   * `afterClose` dispatch. By the time that reentrant open returns, isOpened() is already true
   * again - but afterClose used to fire anyway, describing a close that the same synchronous
   * call stack had already undone. A host cleaning up "now that it's closed" would run that
   * cleanup against a dropdown that is, in fact, open.
   *
   * `beforeOpen`/`afterOpen` are asserted too, so a fix that suppressed afterClose by also
   * suppressing the reopen's own events would not pass this by accident.
   */
  it('does not dispatch afterClose for a dropdown a focus handler reopened synchronously', () => {
    mount();
    open();
    waitForSearchFocus();

    const events: string[] = [];

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      ['beforeOpen', 'afterOpen', 'afterClose'].forEach((name) => {
        $ele[0].addEventListener(name, () => events.push(name));
      });

      vs.closeDropbox();
      expect(vs.isOpened(), 'still mid hide-transition').to.equal(true);

      vs.$dropboxContainer.querySelector('.vscomp-option[data-index="3"]').focus();
      vs.$wrapper.addEventListener('focusin', () => $ele[0].open?.(), { once: true });
    });

    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('not.have.class', 'closed');
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.isOpened(), 'reopened').to.equal(true);
    });

    /**
     * Retries against the live `events` array rather than a fixed wait: the reentrant open's own
     * show transition and its deferred event dispatches take a variable amount of wall-clock
     * time (the ~300ms show plus setTimeout(0) scheduling), and a one-shot check timed to "enough
     * margin in the common case" is exactly the flaky pattern this suite has hit before.
     */
    cy.wrap(null).should(() => {
      expect(events, `events (${events.join(', ')})`).to.deep.equal(['beforeOpen', 'afterOpen']);
    });
  });

  /**
   * Every other case here mounts with `dropboxWrapper: 'body'` (the portalled layout the
   * reported Chrome warning came from), which gives the dropbox its own wrapper element and
   * makes `isFocusInsideDropbox()` take its `$dropboxWrapper` branch. The default,
   * non-portalled layout takes that helper's `$dropboxContainer` fallback instead - the same
   * queue, on the layout most consumers actually use.
   *
   * Not `assertOpenAndVisible()`: `$dropboxWrapper` is only ever assigned when `dropboxWrapper`
   * is set (renderDropbox() leaves it undefined otherwise), and the aria-hidden/tabindex writes
   * that helper checks are themselves no-ops on this layout - DomUtils.setAria()/setAttr() both
   * guard on a falsy element. There is nothing to carry aria-hidden without a wrapper of its
   * own; what this layout still needs is the reopen itself.
   */
  it('also queues and replays the open on the default, non-portalled layout', () => {
    mount({ dropboxWrapper: 'self' });
    open();
    closeThenReopen();

    cy.wait(700);
    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('not.have.class', 'closed');
    cy.get(`#${mountId}`).should(($ele) => {
      const vs = $ele[0].virtualSelect;

      expect(vs.isOpened(), 'isOpened()').to.equal(true);
      expect(vs.$dropboxContainer.style.display, 'container display').to.not.equal('none');
      expect(vs.$dropboxContainer.getBoundingClientRect().height, 'rendered height').to.be.greaterThan(0);
      expect(vs.$wrapper.getAttribute('aria-expanded'), 'aria-expanded').to.equal('true');
      expect($ele[0].ownerDocument.activeElement, 'focus after the reopen').to.equal(vs.$searchInput);
    });
  });

  /** the ordinary path must not be routed through the queue */
  it('still opens immediately when no hide is running', () => {
    mount();
    open();

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('have.class', 'closed');

    cy.get(`#${mountId}`).then(($ele) => {
      $ele[0].open?.();

      /** synchronous: an open with nothing to wait for must not be deferred */
      expect($ele[0].virtualSelect.isOpened(), 'open applied in the same tick').to.equal(true);
    });

    assertOpenAndVisible();
  });
});
