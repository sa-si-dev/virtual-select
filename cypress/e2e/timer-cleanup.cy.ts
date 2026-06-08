/** cSpell:ignore vscomp */

// Tests for P4: pending setTimeout callbacks were not cleared on destroy(), so they could run
// against a destroyed instance. Timers now go through setManagedTimeout and are cleared in destroy().

describe('Hardening: managed timeouts cleared on destroy (P4)', () => {
  const mountId = 'vs-p4-timers';

  const mount = (win: Window) => {
    const doc = win.document;
    const existing = doc.getElementById(mountId);
    if (existing) {
      existing.remove();
    }
    const $ele = doc.createElement('div');
    $ele.id = mountId;
    doc.body.appendChild($ele);
    // @ts-expect-error - VirtualSelect attached to window by the bundle
    win.VirtualSelect.init({ ele: $ele, options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }] });
    return $ele.virtualSelect;
  };

  it('cancels a pending managed timeout when the instance is destroyed', () => {
    cy.visit('get-started');
    // Use a synthetic clock so the negative assertion (timer must NOT fire) is deterministic.
    // With a real-time cy.wait, CI timer-throttling could delay a still-pending 50ms callback
    // past the wait window, making the test pass even if destroy() failed to clear it.
    cy.clock();
    cy.window().then((win) => {
      // @ts-expect-error - test marker
      win.__managedTimerFired = false;
      const instance = mount(win);
      instance.setManagedTimeout(() => {
        // @ts-expect-error - test marker
        win.__managedTimerFired = true;
      }, 50);
      instance.destroy();
    });

    // Advance well past the 50ms timeout; a cleared timer can never fire, a leaked one would.
    cy.tick(150);
    cy.window().then((win) => {
      // @ts-expect-error - test marker
      expect(win.__managedTimerFired, 'managed timeout must not fire after destroy').to.eq(false);
    });
  });

  it('does not throw when destroying right after an option select (no regression)', () => {
    cy.visit('get-started');
    cy.window().then((win) => mount(win));

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="a"]').click();

    cy.window().then((win) => {
      const $ele = win.document.getElementById(mountId);
      // @ts-expect-error - instance back-reference
      $ele.virtualSelect.destroy();
    });

    cy.wait(50);
    cy.get('body').should('exist');
    cy.window().then((win) => {
      const $ele = win.document.getElementById(mountId);
      // @ts-expect-error - instance back-reference
      expect($ele.virtualSelect, 'instance reference cleared on destroy').to.eq(undefined);
    });
  });
});
