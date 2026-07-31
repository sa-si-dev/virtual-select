/** cSpell:ignore vscomp vsele */

// Regression test for S2: customData fields (group_name / description) were interpolated
// into the option aria-label attribute without escaping, allowing an attribute-breakout XSS
// even when enableSecureText was enabled.

describe('Security: customData attribute-injection (S2)', () => {
  const mountId = 'vs-s2-xss';
  const payload = '"><img src=x onerror="window.__vsXssS2=true">';

  const mount = (win: Window, extra: Record<string, unknown> = {}) => {
    const doc = win.document;
    const existing = doc.getElementById(mountId);
    if (existing) {
      existing.remove();
    }

    const $ele = doc.createElement('div');
    $ele.id = mountId;
    doc.body.appendChild($ele);

    // @ts-expect-error - VirtualSelect is attached to window by the bundle
    win.VirtualSelect.init({
      ele: $ele,
      enableSecureText: true,
      options: [
        {
          label: 'Group',
          options: [{ label: 'Child', value: 'c1', customData: { group_name: payload, description: payload } }],
        },
      ],
      ...extra,
    });

    return $ele;
  };

  it('does not inject markup from customData and does not execute the payload', () => {
    cy.visit('get-started');

    cy.window().then((win) => {
      // @ts-expect-error - test marker
      win.__vsXssS2 = undefined;
      mount(win);
    });

    // open the dropdown so the options (and their aria-label) are rendered
    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    // the option must render...
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="c1"]').should('exist');
    // ...but the breakout payload must NOT have created a real <img> element...
    cy.get('img[src="x"]').should('not.exist');
    // ...and the onerror handler must never have run.
    cy.window().then((win) => {
      // @ts-expect-error - test marker
      expect(win.__vsXssS2, 'XSS payload should not execute').to.not.eq(true);
    });
  });

  it('keeps the aria-label intact (escaped, not broken out of the attribute)', () => {
    cy.visit('get-started');
    cy.window().then((win) => mount(win));

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`)
      .find('.vscomp-option[data-value="c1"]')
      .should('have.attr', 'aria-label')
      .and('contain', 'Child');
  });
});
