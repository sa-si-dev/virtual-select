/** cSpell:ignore vscomp */

// Tests for P1: the global window 'resize' handler used to run per-instance height
// recomputation on every resize tick, unthrottled, and threw if a wrapper had no instance.

describe('Performance: window resize handler', () => {
  const mountId = 'vs-p1-resize';

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
    return $ele;
  };

  it('throttles resize so onResize runs far fewer times than resize events fire', () => {
    cy.visit('get-started');
    cy.window().then((win) => {
      mount(win);
      // @ts-expect-error - instance back-reference
      const instance = win.document.getElementById(mountId).virtualSelect;
      cy.spy(instance, 'onResize').as('onResize');

      for (let i = 0; i < 10; i += 1) {
        win.dispatchEvent(new win.Event('resize'));
      }
    });

    // allow the trailing-edge call to fire
    cy.wait(250);
    cy.get('@onResize').its('callCount').should('be.greaterThan', 0).and('be.lessThan', 10);
  });

  it('still updates the dropdown on resize (no regression)', () => {
    cy.visit('get-started');
    cy.window().then((win) => mount(win));

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-option').should('have.length.greaterThan', 0);

    cy.window().then((win) => win.dispatchEvent(new win.Event('resize')));
    cy.wait(150);

    // dropdown remains open and functional after a resize
    cy.get(`#${mountId}`).find('.vscomp-ele-wrapper').should('not.have.class', 'closed');
    cy.get(`#${mountId}`).find('.vscomp-options-container').should('exist');
  });

  it('does not throw when a wrapper has no associated instance (guard)', () => {
    cy.visit('get-started');
    cy.window().then((win) => {
      const doc = win.document;
      const orphan = doc.createElement('div');
      orphan.innerHTML = '<div class="vscomp-ele-wrapper"></div>'; // parent has no .virtualSelect
      doc.body.appendChild(orphan);

      // would throw "Cannot read properties of undefined (reading 'onResize')" without the guard
      win.dispatchEvent(new win.Event('resize'));
    });

    // if the handler threw, Cypress would have failed the test on the uncaught exception
    cy.get('body').should('exist');
  });
});
