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

  /**
   * Every test detonates into its own marker, because the payload here is genuinely live.
   *
   * Test isolation is off and `cy.visit()` only changes the hash, so all of these tests share a
   * single window that is never reloaded — this file already depends on that (see the
   * `secureTextWarningShown` reset in the last test). The insecure-by-default test creates a real
   * `<img src=x>`, and an image error event is asynchronous: measured against the built bundle it
   * fires 7 ms after the "the element exists" assertion has already passed, and *again* at 313 ms,
   * because the dropbox re-renders when its 300 ms open animation finishes and so produces a
   * second live image.
   *
   * With one page-wide marker, that second detonation landed two tests later — after the
   * `beforeEach` that had reset it — and failed whichever test was running at the time while the
   * component under test was behaving perfectly. A marker per test removes the cross-talk instead
   * of papering over it with a wait.
   */
  let markerSeq = 0;
  const newMarker = () => `__vsGlobalXss${(markerSeq += 1)}`;
  const payloadFor = (marker: string) => `<img src=x onerror="window.${marker}=true">`;
  const markerValue = (win: Window, marker: string) => (win as unknown as Record<string, unknown>)[marker];

  const resetGlobals = (win: Window) => {
    /**
     * `setGlobalDefaults()` merges, so `{}` cannot clear a key an earlier test set, and nothing
     * reloads the page to do it for us. resetGlobalDefaults() is the explicit clearing API.
     */
    // @ts-expect-error - VirtualSelect is attached to window by the bundle
    win.VirtualSelect.resetGlobalDefaults();
  };

  const mountWithPayload = (win: Window, marker: string, extra: Record<string, unknown> = {}) =>
    mountVs(win, mountId, { options: [{ label: payloadFor(marker), value: 'p1' }], ...extra });

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
    const marker = newMarker();

    cy.window().then((win) => mountWithPayload(win, marker));

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    // The documented, insecure-by-default behaviour: a real element is created.
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="p1"] img[src="x"]').should('exist');

    /**
     * And it is not inert. Asserting the detonation rather than only the element proves the
     * default really does execute attacker-controlled markup, which is the whole reason
     * setGlobalDefaults() exists; `should` retries, and the first error event lands within ~10 ms.
     */
    cy.window().should((win) => {
      expect(markerValue(win, marker), 'the insecure default really does execute the payload').to.eq(true);
    });
  });

  it('escapes option text for instances created after a global default is set', () => {
    const marker = newMarker();

    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ enableSecureText: true });
      mountWithPayload(win, marker);
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    cy.get(`#${mountId}`).find('.vscomp-option[data-value="p1"]').should('exist');
    cy.get(`#${mountId}`).find('img[src="x"]').should('not.exist');
    // The payload is visible as text rather than parsed as markup.
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="p1"] .vscomp-option-text').should('contain', 'img');

    cy.window().then((win) => {
      expect(markerValue(win, marker), 'payload must not execute').to.not.eq(true);
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
    const marker = newMarker();

    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ enableSecureText: true });
      mountWithPayload(win, marker, { enableSecureText: undefined });
    });

    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.enableSecureText, 'the global must still win').to.equal(true);
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    // Assert the option rendered *first*: `img` never existing is also true of a list that never
    // rendered at all, so on its own that check can pass for the wrong reason.
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="p1"] .vscomp-option-text').should('contain', 'img');
    cy.get(`#${mountId}`).find('img[src="x"]').should('not.exist');

    cy.window().then((win) => {
      expect(markerValue(win, marker), 'payload must not execute').to.not.eq(true);
    });
  });

  it('lets an explicit per-instance option override the global default', () => {
    const marker = newMarker();

    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ enableSecureText: true });
      // Opting back out for a trusted, HTML-rendering list.
      mountWithPayload(win, marker, { enableSecureText: false });
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

  it('ignores a non-object argument instead of wiping the configured policy', () => {
    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ enableSecureText: true });

      // A host accidentally forwarding an unset config variable must not silently turn
      // page-wide escaping off; clearing is an explicit act (resetGlobalDefaults).
      // @ts-expect-error - bundle global, deliberately wrong argument
      win.VirtualSelect.setGlobalDefaults(undefined);
      // @ts-expect-error - bundle global, deliberately wrong argument
      win.VirtualSelect.setGlobalDefaults(null);
      // @ts-expect-error - bundle global, deliberately wrong argument
      win.VirtualSelect.setGlobalDefaults('enableSecureText');

      // @ts-expect-error - bundle global
      expect(win.VirtualSelect.getGlobalDefaults().enableSecureText).to.eq(true);
    });
  });

  it('clears every configured default only through the explicit resetGlobalDefaults()', () => {
    cy.window().then((win) => {
      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ enableSecureText: true, placeholder: 'Pick one' });

      // @ts-expect-error - bundle global
      win.VirtualSelect.resetGlobalDefaults();

      // @ts-expect-error - bundle global
      expect(win.VirtualSelect.getGlobalDefaults()).to.deep.equal({});
    });
  });

  it('suppresses the insecure-by-default console warning when the global default is on', () => {
    const marker = newMarker();

    cy.window().then((win) => {
      // @ts-expect-error - internal flag reset so the once-per-page guard does not hide the result
      win.VirtualSelect.secureTextWarningShown = false;
      cy.spy(win.console, 'warn').as('consoleWarn');

      // @ts-expect-error - bundle global
      win.VirtualSelect.setGlobalDefaults({ enableSecureText: true });
      mountWithPayload(win, marker);
    });

    cy.get('@consoleWarn').should((spy: any) => {
      const messages = spy.getCalls().map((c: any) => String(c.args[0]));
      expect(messages.filter((m: string) => m.includes('enableSecureText'))).to.have.length(0);
    });
  });
});
