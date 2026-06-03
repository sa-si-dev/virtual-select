/** cSpell:ignore vscomp classnames */

// Regression test for S3: option `classNames` was concatenated into the class attribute
// without sanitization, allowing attribute-breakout injection. Sanitization must strip the
// breakout characters (" < >) while leaving legitimate class names untouched.

describe('Security: classNames attribute-injection (S3)', () => {
  const mountId = 'vs-s3-classnames';

  const mount = (win: Window, options: unknown[]) => {
    const doc = win.document;
    const existing = doc.getElementById(mountId);
    if (existing) {
      existing.remove();
    }

    const $ele = doc.createElement('div');
    $ele.id = mountId;
    doc.body.appendChild($ele);

    // @ts-expect-error - VirtualSelect is attached to window by the bundle
    win.VirtualSelect.init({ ele: $ele, options });
    return $ele;
  };

  it('does not inject markup from a malicious classNames value', () => {
    cy.visit('get-started');
    cy.window().then((win) => {
      // @ts-expect-error - test marker
      win.__vsXssS3 = undefined;
      mount(win, [{ label: 'A', value: 'a', classNames: 'foo"><img src=x onerror="window.__vsXssS3=true' }]);
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    // the option still renders as a normal vscomp-option (no broken markup)...
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="a"]').should('have.class', 'vscomp-option');
    // ...but no element was injected and the handler never ran.
    cy.get('img[src="x"]').should('not.exist');
    cy.window().then((win) => {
      // @ts-expect-error - test marker
      expect(win.__vsXssS3, 'XSS payload should not execute').to.not.eq(true);
    });
  });

  it('preserves normal class names (no regression for non-malicious input)', () => {
    cy.visit('get-started');
    cy.window().then((win) => {
      mount(win, [{ label: 'B', value: 'b', classNames: 'my-custom-class another-class' }]);
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`)
      .find('.vscomp-option[data-value="b"]')
      .should('have.class', 'my-custom-class')
      .and('have.class', 'another-class');
  });
});
