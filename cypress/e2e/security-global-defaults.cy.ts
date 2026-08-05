/** cSpell:ignore vscomp */

/**
 * A host application must be able to turn option-text escaping on for every dropdown at once.
 *
 * OWASP A03:2021 (Injection) / DOM XSS.
 *
 * Option label/value/description are interpolated into innerHTML, and `secureText()` is a
 * no-op unless `enableSecureText` is on — which it is not by default. A host application
 * previously had no way to turn escaping on for every dropdown at once; it had to remember
 * the flag at each of possibly hundreds of call sites.
 *
 * VirtualSelect.setGlobalDefaults() closes that gap without changing the per-instance
 * default, so existing consumers who deliberately render HTML labels are unaffected.
 */

import { mountVs, unmountVs } from '../support/mount';

describe('Security: global defaults for enableSecureText', () => {
  const mountId = 'vs-sec-global';
  const payload = '<img src=x onerror="window.__vsGlobalXss=true">';

  const resetGlobals = (win: Window) => {
    // @ts-expect-error - VirtualSelect is attached to window by the bundle
    win.VirtualSelect.setGlobalDefaults({});
    // @ts-expect-error - test marker
    win.__vsGlobalXss = undefined;
  };

  const mountWithPayload = (win: Window, extra: Record<string, unknown> = {}) =>
    mountVs(win, mountId, { options: [{ label: payload, value: 'p1' }], ...extra });

  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then(resetGlobals);
  });

  afterEach(() => {
    cy.window().then((win) => {
      unmountVs(win, mountId);
      resetGlobals(win);
    });
  });

  it('exposes setGlobalDefaults and getGlobalDefaults', () => {
    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      expect(win.VirtualSelect.setGlobalDefaults).to.be.a('function');
      // @ts-expect-error - bundle global
      expect(win.VirtualSelect.getGlobalDefaults).to.be.a('function');
    });
  });

  it('still renders option text as raw HTML by default, so behaviour is unchanged', () => {
    cy.window().then((win) => mountWithPayload(win));

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    // The documented, insecure-by-default behaviour: a real element is created.
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="p1"] img[src="x"]').should('exist');
  });

  it('escapes option text for instances created after a global default is set', () => {
    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ enableSecureText: true });
      mountWithPayload(win);
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    cy.get(`#${mountId}`).find('.vscomp-option[data-value="p1"]').should('exist');
    cy.get(`#${mountId}`).find('img[src="x"]').should('not.exist');
    // The payload is visible as text rather than parsed as markup.
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="p1"] .vscomp-option-text').should('contain', 'img');

    cy.window().then((win) => {
      // @ts-expect-error - test marker
      expect(win.__vsGlobalXss, 'payload must not execute').to.not.eq(true);
    });
  });

  it('does not let an undefined prop defeat the global default', () => {
    /**
     * `Object.assign` copies own enumerable keys *including* those whose value is `undefined`, so a
     * prop forwarded from an unset variable overwrote the global instead of falling back to it — the
     * escaping policy was silently off while the host believed it had enabled it page-wide.
     *
     * This is the exact shape a wrapper uses: `enableSecureText: this.SanitizeDropdownValues`, where
     * the wrapper property may be undefined. It also contradicts setDefaultProps()'s own `resolve()`
     * helper, which already treats `undefined` as "not supplied".
     */
    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ enableSecureText: true });
      mountWithPayload(win, { enableSecureText: undefined });
    });

    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.enableSecureText, 'the global must still win').to.equal(true);
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('img[src="x"]').should('not.exist');

    cy.window().then((win) => {
      // @ts-expect-error - test marker
      expect(win.__vsGlobalXss, 'payload must not execute').to.not.eq(true);
    });
  });

  it('lets an explicit per-instance option override the global default', () => {
    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ enableSecureText: true });
      // Opting back out for a trusted, HTML-rendering list.
      mountWithPayload(win, { enableSecureText: false });
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    cy.get(`#${mountId}`).find('.vscomp-option[data-value="p1"] img[src="x"]').should('exist');
  });

  it('merges successive calls rather than replacing the whole set', () => {
    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ enableSecureText: true });
      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ placeholder: 'Pick one' });
      // @ts-expect-error - bundle global
      const globals = win.VirtualSelect.getGlobalDefaults();

      expect(globals).to.deep.include({ enableSecureText: true, placeholder: 'Pick one' });
    });
  });

  it('applies to any prop, not just enableSecureText', () => {
    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ placeholder: 'Choose a value' });
      mountVs(win, mountId, { options: [{ label: 'One', value: '1' }] });
    });

    // `contain`, not `have.text`: the value template renders with surrounding whitespace.
    cy.get(`#${mountId}`).find('.vscomp-value').should('contain', 'Choose a value');
  });

  it('returns a copy from getGlobalDefaults, so callers cannot mutate internal state', () => {
    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ enableSecureText: true });
      // @ts-expect-error - bundle global
      const globals = win.VirtualSelect.getGlobalDefaults();
      globals.enableSecureText = false;

      // @ts-expect-error - bundle global
      expect(win.VirtualSelect.getGlobalDefaults().enableSecureText).to.eq(true);
    });
  });

  it('suppresses the insecure-by-default console warning when the global default is on', () => {
    cy.window().then((win) => {
      // @ts-expect-error - internal flag reset so the once-per-page guard does not hide the result
      win.VirtualSelect.secureTextWarningShown = false;
      cy.spy(win.console, 'warn').as('consoleWarn');

      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ enableSecureText: true });
      mountWithPayload(win);
    });

    cy.get('@consoleWarn').should((spy: any) => {
      const messages = spy.getCalls().map((c: any) => String(c.args[0]));
      expect(messages.filter((m: string) => m.includes('enableSecureText'))).to.have.length(0);
    });
  });
});
