/** cSpell:ignore vscomp securetext */

// Tests for S1: when enableSecureText is disabled (default), option text is rendered as raw HTML.
// The plugin should log a single (per page) console warning so the XSS trade-off is discoverable,
// without changing the default (kept off for large-dataset performance).

describe('Security: enableSecureText one-time warning (S1)', () => {
  const mount = (win: Window, id: string, extra: Record<string, unknown> = {}) => {
    const doc = win.document;
    const existing = doc.getElementById(id);
    if (existing) {
      existing.remove();
    }
    const $ele = doc.createElement('div');
    $ele.id = id;
    doc.body.appendChild($ele);
    // @ts-expect-error - VirtualSelect attached to window by the bundle
    win.VirtualSelect.init({ ele: $ele, options: [{ label: 'A', value: 'a' }], ...extra });
    return $ele;
  };

  it('warns once (not per instance) when enableSecureText is disabled', () => {
    cy.visit('get-started');
    cy.window().then((win) => {
      // reset the one-time flag so the assertion is deterministic regardless of demo dropdowns
      // @ts-expect-error - static flag
      win.VirtualSelect.secureTextWarningShown = false;
      cy.spy(win.console, 'warn').as('warn');

      mount(win, 'vs-s1-a');
      mount(win, 'vs-s1-b'); // second instance must NOT warn again
    });

    cy.get('@warn').its('callCount').should('eq', 1);
    cy.get('@warn').its('firstCall.args.0').should('include', 'enableSecureText');
  });

  it('does not warn when enableSecureText is enabled', () => {
    cy.visit('get-started');
    cy.window().then((win) => {
      // @ts-expect-error - static flag
      win.VirtualSelect.secureTextWarningShown = false;
      cy.spy(win.console, 'warn').as('warnEnabled');

      mount(win, 'vs-s1-c', { enableSecureText: true });
    });

    cy.get('@warnEnabled').should('not.be.called');
  });
});
