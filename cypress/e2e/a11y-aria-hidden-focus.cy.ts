/** cSpell:ignore vscomp */

/**
 * Focus must never sit inside an `aria-hidden="true"` subtree.
 *
 * Chrome refuses to apply aria-hidden when a descendant holds focus and logs "Blocked
 * aria-hidden on an element because its descendant retained focus" - so the dropbox the
 * component believes it hid stays exposed to assistive technology, which follows the tree,
 * not the component. WAI-ARIA: aria-hidden must not be used on an ancestor of the focused
 * element.
 *
 * Two windows produced it, both inside the popover's ~200ms hide transition, while the
 * dropbox is still visible, still hit-testable and still `isOpened() === true`:
 *
 *   1. closeDropbox() marked the dropbox aria-hidden immediately, 200ms before it left the
 *      screen - fixed by deferring the attribute to afterHidePopper();
 *   2. handlers gated on isOpened() kept driving the fading dropbox - hovering an option
 *      focuses it (onOptionsMouseOver -> focusOption) - so focus could re-enter after the
 *      close and still be there when the attribute finally landed. Fixed twice over: the
 *      pointer is gated during the transition (isClosingTransition), and whatever a host
 *      still pulls in programmatically is released at hide-end (releaseFocusFromDropbox).
 *
 * WCAG 4.1.2 Name, Role, Value (A), 1.3.1 Info and Relationships (A), 2.4.3 Focus Order (A).
 *
 * Deliberately not covered: the deferred re-focus in afterRenderOptions(), which fires ~20ms after
 * a render and focuses whatever still carries `.focused`. It looks like a third way in, and a case
 * for it lived here briefly - but it could not fail. Once the dropbox is closed the `closed` class
 * makes it `display: none`, so focus() on an option inside it is a no-op; before that, aria-hidden
 * has not been applied yet. A fire-time guard there would be unreachable code, and the case that
 * pretended to pin it passed whatever afterRenderOptions() did. Removed rather than left as false
 * assurance. If the `closed` rule ever stops hiding the subtree, this becomes reachable and the
 * guard becomes real.
 */

import { mountVs, unmountVs, makeOptions } from '../support/mount';

type Violation = { kind: string; focused: string; ancestor: string; stack: string };

/** the sink lives on the window so re-installing the guard repoints it instead of stacking */
type GuardHost = Window & { __ariaHiddenFocusSink?: Violation[] };

const describeEle = (el: Element | null) =>
  (el ? `${el.tagName.toLowerCase()}.${(el.getAttribute('class') || '').split(' ').join('.')}` : 'null');

/**
 * The guard judges only the component under test: the docsify page hosting these specs has
 * aria-hidden chrome of its own (sidebar, cover), and a violation there is not this
 * component's defect.
 */
const isComponentNode = (el: Element | null) => !!el && !!el.closest('[class*="vscomp"]');

function hiddenAncestor(el: Element | null): Element | null {
  let node: Element | null = el;

  while (node) {
    if (node.getAttribute && node.getAttribute('aria-hidden') === 'true') {
      return node;
    }

    node = node.parentElement;
  }

  return null;
}

const callSite = (win: Window) => {
  const raw = new (win as unknown as { Error: ErrorConstructor }).Error().stack || '';

  return raw.split('\n').slice(2, 8).map((line) => line.trim()).join(' | ');
};

/**
 * Reproduces what Chrome itself checks, from both directions: focus moving into an already
 * hidden subtree, and aria-hidden being applied over a subtree that still holds focus.
 * `Element.prototype.setAttribute` is patched rather than observed with a MutationObserver so
 * the offending call site is captured synchronously - that is what pinned the root cause to
 * `toggleOptionFocusedState` in the first place.
 */
function installAriaHiddenFocusGuard(win: Window, sink: Violation[]): void {
  const host = win as GuardHost;

  if (host.__ariaHiddenFocusSink) {
    /** already patched this window: repoint the sink rather than stacking a second patch */
    host.__ariaHiddenFocusSink = sink;
    return;
  }

  host.__ariaHiddenFocusSink = sink;

  win.document.addEventListener(
    'focusin',
    (e) => {
      const ancestor = hiddenAncestor(e.target as Element);

      if (ancestor && isComponentNode(ancestor)) {
        host.__ariaHiddenFocusSink?.push({
          kind: 'focus moved into an aria-hidden subtree',
          focused: describeEle(e.target as Element),
          ancestor: describeEle(ancestor),
          stack: callSite(win),
        });
      }
    },
    true,
  );

  const proto = (win as unknown as { Element: { prototype: Element } }).Element.prototype;
  const nativeSetAttribute = proto.setAttribute;

  proto.setAttribute = function patchedSetAttribute(this: Element, name: string, value: string) {
    nativeSetAttribute.call(this, name, value);

    /**
     * String(): DomUtils.setAria() forwards the boolean `true`, not the string. The first
     * version of this guard compared `value !== 'true'` and therefore never fired for any
     * element the component hides - the whole "attribute applied over focus" direction was
     * dead code, and deleting releaseFocusFromDropbox() left this spec green (review
     * finding on PR #492).
     */
    if (name !== 'aria-hidden' || String(value) !== 'true') {
      return;
    }

    const active = win.document.activeElement;

    if (active && active !== win.document.body && this.contains(active) && isComponentNode(this)) {
      host.__ariaHiddenFocusSink?.push({
        kind: 'aria-hidden applied over the focused element',
        focused: describeEle(active),
        ancestor: describeEle(this),
        stack: callSite(win),
      });
    }
  };
}

describe('A11y: aria-hidden is never applied over the focused element', { testIsolation: true }, () => {
  const mountId = 'vs-aria-hidden-focus';
  const secondMountId = 'vs-aria-hidden-focus-2';
  const violations: Violation[] = [];

  /**
   * `dropboxWrapper: 'body'` portals the dropbox out of the host element, which is the layout
   * the report came from and the only one where the dropbox has a wrapper of its own to carry
   * aria-hidden. Every dropbox query below therefore goes through the instance, not the DOM.
   */
  const mount = (extra: Record<string, unknown> = {}) => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => {
      violations.length = 0;
      installAriaHiddenFocusGuard(win, violations);
      mountVs(win, mountId, { options: makeOptions(50), search: true, dropboxWrapper: 'body', ...extra });
    });
  };

  const dropbox = () => cy.get(`#${mountId}`).then(($ele) => cy.wrap($ele[0].virtualSelect.$dropboxWrapper));

  const open = () => {
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('not.have.class', 'closed');
  };

  /** opening focuses the search input asynchronously (popover afterShow); wait for it */
  const waitForSearchFocus = () => {
    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].ownerDocument.activeElement, 'search input focused after open')
        .to.equal($ele[0].virtualSelect.$searchInput);
    });
  };

  /**
   * Dispatch a real bubbling mouseover synchronously - no Cypress command hop, so it is
   * guaranteed to land inside the hide transition it is aimed at, and no actionability check
   * can reject the half-faded element (the mid-fade state is exactly what is under test).
   */
  const hoverOptionNow = (vs: any, index: number) => {
    const $option = vs.$dropboxContainer.querySelector(`.vscomp-option[data-index="${index}"]`);
    const win = vs.$ele.ownerDocument.defaultView;

    $option.dispatchEvent(new win.MouseEvent('mouseover', { bubbles: true }));
  };

  /** the hide transition is ~200ms; wait it out so late callbacks are included */
  const assertNoViolations = () => {
    cy.wait(700);
    cy.then(() => {
      expect(violations, JSON.stringify(violations, null, 2)).to.deep.equal([]);
    });
  };

  afterEach(() => {
    cy.window().then((win) => {
      unmountVs(win, mountId);
      unmountVs(win, secondMountId);
    });
  });

  /**
   * The reported case. Selecting in a single select closes the dropbox, but the pointer is
   * still over the list while it fades out. The fading list must ignore the pointer: no new
   * highlight, no aria-activedescendant on a combobox that just announced itself collapsed,
   * no DOM focus pulled into a subtree about to be marked hidden - and focus must end on the
   * combobox, not fall to <body>.
   */
  it('ignores the pointer over the fading list and lands focus on the combobox', () => {
    mount();
    open();

    dropbox().find('.vscomp-option[data-index="2"]').click();

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      /**
       * One Cypress command hop after the click, against a 200ms transition. The pin keeps
       * the test honest: a closed dropbox ignores mouseover, so on a runner slow enough to
       * outlive the fade the hover would silently become a no-op and the test would pass
       * vacuously - this fails loudly with the reason instead.
       */
      expect(vs.isOpened(), 'still mid hide-transition').to.equal(true);

      hoverOptionNow(vs, 3);

      expect(vs.$dropboxContainer.querySelector('.vscomp-option.focused'), 'highlight after hover').to.equal(null);
      expect(vs.$wrapper.getAttribute('aria-activedescendant'), 'aria-activedescendant after hover').to.equal(null);
    });

    assertNoViolations();

    cy.get(`#${mountId}`).then(($ele) => {
      expect($ele[0].ownerDocument.activeElement, 'focus once closed').to.equal($ele[0].virtualSelect.$wrapper);
    });
  });

  it('ignores the pointer when a multi-select closes from the toggle button', () => {
    mount({ multiple: true });
    open();

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      expect(vs.isOpened(), 'still mid hide-transition').to.equal(true);

      hoverOptionNow(vs, 4);

      expect(vs.$dropboxContainer.querySelector('.vscomp-option.focused'), 'highlight after hover').to.equal(null);
    });

    assertNoViolations();
  });

  /**
   * The silent close: opening one instance closes every other one synchronously, straight
   * through afterHidePopper() - while the first instance's search input still holds focus.
   * The attribute write happens in the same script block, before the browser's style recalc
   * can drop focus to <body>, so without an explicit release aria-hidden lands over the
   * focused input. shouldFocusWrapperOnClose is false here, so the release must blur, not
   * steal focus back from the instance the user just opened.
   */
  it('releases focus from a dropdown that another instance closes silently', () => {
    mount();
    cy.window().then((win) => {
      mountVs(win, secondMountId, { options: makeOptions(50), search: true, dropboxWrapper: 'body' });
    });
    open();
    waitForSearchFocus();

    cy.get(`#${secondMountId}`).then(($ele2) => $ele2[0].virtualSelect.openDropbox());

    assertNoViolations();

    cy.get(`#${mountId}`).should(($ele) => {
      const vs = $ele[0].virtualSelect;
      const active = $ele[0].ownerDocument.activeElement;

      expect(vs.$dropboxWrapper.contains(active), 'focus inside the silently closed dropbox').to.equal(false);
      expect(vs.$dropboxWrapper.getAttribute('aria-hidden'), 'closed dropbox hidden').to.equal('true');
    });
  });

  /**
   * The pointer gate cannot cover host-driven focus: anything a host runs mid-fade that ends
   * in focusOption() (a programmatic search, a value write) focuses the option it highlights,
   * and a host can also focus() an element in the dropbox directly. The hide-end release is
   * the backstop for that whole class - focus must be back on the combobox before the subtree
   * is marked hidden.
   *
   * Driven with a direct focus() rather than through setSearchValue(): the search path
   * re-renders the options (innerHTML), which destroys the focused node and races the
   * deferred re-focus timer in afterRenderOptions() - where focus sits at hide-end then
   * depends on which fired last. The direct call is the distilled, deterministic form of
   * every path in the class.
   */
  it('releases focus a host action pulled into the dropbox mid-fade', () => {
    mount();
    open();
    waitForSearchFocus();

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      vs.closeDropbox();
      expect(vs.isOpened(), 'still mid hide-transition').to.equal(true);

      const $option = vs.$dropboxContainer.querySelector('.vscomp-option[data-index="3"]');

      $option.focus();

      /** precondition: DOM focus genuinely re-entered the fading dropbox */
      expect($ele[0].ownerDocument.activeElement, 'focus pulled into the fading dropbox').to.equal($option);
    });

    assertNoViolations();

    cy.get(`#${mountId}`).then(($ele) => {
      expect($ele[0].ownerDocument.activeElement, 'focus once closed').to.equal($ele[0].virtualSelect.$wrapper);
    });
  });

  /**
   * Tab from the search input is the one documented path that puts real DOM focus on an
   * option while a search input exists (onKeyDown -> focusFirstVisibleOption). The outside
   * click's mousedown blurs it before the close, so this pins that nothing during the hide
   * transition pulls focus back into the component.
   */
  it('keeps focus out of the dropbox when it closes with an option focused', () => {
    mount();
    open();

    cy.get(`#${mountId}`).pressKeys('Tab');
    dropbox().find('.vscomp-option.focused').should('exist');

    cy.get('body').click(5, 5);

    assertNoViolations();

    cy.window().then((win) => {
      const active = win.document.activeElement as Element;

      expect(active.closest('[class*="vscomp"]'), 'focus left inside the component').to.equal(null);
    });
  });

  it('keeps focus out of the dropbox when Escape closes it mid navigation', () => {
    mount({ search: false });
    open();

    cy.get(`#${mountId}`).pressKeys('ArrowDown');
    cy.get(`#${mountId}`).pressKeys('ArrowDown');
    cy.get(`#${mountId}`).find('.vscomp-wrapper').trigger('keydown', { key: 'Escape', keyCode: 27, which: 27 });

    assertNoViolations();

    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].ownerDocument.activeElement, 'focus once closed').to.equal($ele[0].virtualSelect.$wrapper);
    });
  });

  /**
   * The state behind all of the above: for as long as the component reports the dropbox as
   * open - and keeps answering clicks and arrow keys on it - it must not also be telling
   * assistive technology that the dropbox is not there.
   */
  it('does not mark the dropbox hidden while it still reports itself open', () => {
    mount();
    open();

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      vs.closeDropbox();

      expect(vs.isOpened(), 'still mid hide-transition').to.equal(true);
      expect(vs.$dropboxWrapper.getAttribute('aria-hidden'), 'aria-hidden while still open').to.not.equal('true');
    });

    /** and it must be hidden once the transition has actually finished */
    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('have.class', 'closed');
    cy.get(`#${mountId}`).should(($ele) => {
      const vs = $ele[0].virtualSelect;

      expect(vs.$dropboxWrapper.getAttribute('aria-hidden'), 'aria-hidden once closed').to.equal('true');
      expect(vs.$dropboxWrapper.getAttribute('tabindex'), 'tabindex once closed').to.equal('-1');
    });
  });

  /**
   * The focus release fires `focusin` on the wrapper synchronously, mid-afterHidePopper(). A
   * consumer handler reacting to it by reopening the dropdown ("restore the last dropdown"
   * hosts) used to be clobbered: the hiding writes that follow the release landed on top of
   * openDropbox()'s and left a visible, expanded dropdown carrying aria-hidden="true". The
   * writes must stand down when the dropdown is open again by the time they run.
   *
   * (`afterClose` cannot reproduce this: DomUtils.dispatchEvent() defers events through
   * setTimeout(0), so an afterClose handler always runs after afterHidePopper() finished.)
   */
  it('does not hide a dropdown a focus handler reopens during the close', () => {
    mount();
    open();
    waitForSearchFocus();

    cy.get(`#${mountId}`).then(($ele) => {
      const vs = $ele[0].virtualSelect;

      /** attached after closeDropbox() so the close-time wrapper refocus does not trigger it */
      vs.closeDropbox();
      expect(vs.isOpened(), 'still mid hide-transition').to.equal(true);

      /** put focus back inside so the hide-end release has something to hand to the wrapper */
      vs.$dropboxContainer.querySelector('.vscomp-option[data-index="3"]').focus();
      vs.$wrapper.addEventListener('focusin', () => $ele[0].open?.(), { once: true });
    });

    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('not.have.class', 'closed');

    cy.get(`#${mountId}`).should(($ele) => {
      const vs = $ele[0].virtualSelect;

      expect(vs.isOpened(), 'reopened').to.equal(true);
      expect(vs.$dropboxWrapper.getAttribute('aria-hidden'), 'aria-hidden on the reopened dropbox').to.not.equal('true');
      expect(vs.$dropboxWrapper.getAttribute('tabindex'), 'tabindex on the reopened dropbox').to.equal('0');
    });

    cy.then(() => {
      expect(violations, JSON.stringify(violations, null, 2)).to.deep.equal([]);
    });
  });

  /**
   * An open arriving mid-fade is queued behind the running hide (see
   * reopen-during-hide-transition.cy.ts for the reopen behaviour itself). This is the a11y half
   * of that path: the queue must hold the pointer gate up for the rest of the fade, so the list
   * cannot take DOM focus back while the hide is still on its way to marking the subtree hidden.
   *
   * Worth pinning separately because the obvious way to write the queue - run openDropbox()
   * eagerly and repair afterwards - lifts `isClosingTransition` and hands the fading list back
   * to the pointer, which is exactly how focus used to end up inside an aria-hidden subtree.
   */
  it('keeps the pointer gate up while an open waits behind the hide transition', () => {
    mount();
    open();
    waitForSearchFocus();

    cy.window().then((win) => {
      const $ele = win.document.getElementById(mountId)!;
      const vs = $ele.virtualSelect;

      vs.closeDropbox();
      expect(vs.isOpened(), 'still mid hide-transition when the reopen arrives').to.equal(true);

      $ele.open?.();

      expect(vs.isClosingTransition, 'pointer gate held while the open waits').to.equal(true);

      hoverOptionNow(vs, 3);

      expect(vs.$dropboxContainer.querySelector('.vscomp-option.focused'), 'highlight after hover').to.equal(null);
      expect(vs.$dropboxContainer.contains(win.document.activeElement), 'focus after hover').to.equal(false);
    });

    assertNoViolations();

    /** and the queued open still lands, on a dropbox that was never marked hidden underneath it */
    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('not.have.class', 'closed');
    cy.get(`#${mountId}`).should(($ele) => {
      const vs = $ele[0].virtualSelect;

      expect(vs.$dropboxWrapper.getAttribute('aria-hidden'), 'aria-hidden on the reopened dropbox').to.not.equal('true');
      expect(vs.$dropboxContainer.getBoundingClientRect().height, 'reopened dropbox height').to.be.greaterThan(0);
    });
  });

});
