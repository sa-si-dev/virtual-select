/** cSpell:ignore vscomp pwned */

/**
 * SEC-02 — the `name` prop is interpolated raw into the hidden input's `name` attribute.
 *
 * OWASP A03:2021 (Injection) / DOM XSS, plus a functional submission bug.
 *
 * `renderWrapper()` built the field as `<input type="hidden" name="${this.name}" ...>`. Because
 * `name` reaches that template as a raw string, a double quote in it terminates the attribute
 * early: the rest of the payload is parsed as markup, and the field keeps only the *prefix* up
 * to that quote. `items["a"]` submitted as `items[` — a wrong-but-plausible field name rather
 * than an obvious absence, which is why it went unnoticed. So the same character both injects
 * and silently corrupts submission, and it does that to an entirely legitimate field name.
 *
 * `enableSecureText: true` stopped the injection but not the breakage: the escaped `&quot;`
 * became part of the submitted field name.
 *
 * There is a third defect at the same site. `name` is interpolated *before* the field's
 * `class="vscomp-hidden-input"`, so a payload that closes the tag swallows the class too.
 * `querySelector('.vscomp-hidden-input')` then returns null, and the first `setValue()` throws
 * `Cannot set properties of null (setting 'value')` inside the constructor — which the library
 * catches as "Couldn't initiate Virtual Select" and leaves the host element empty. A quote in
 * `name` plus any initial value is therefore a total loss of the control, not just of the
 * submitted field.
 *
 * The fix keeps the field and assigns the name as a DOM *property* after render. A property
 * assignment involves no HTML parsing, so there is nothing to break out of and nothing to
 * escape — the name submits verbatim whether escaping is on or off.
 *
 * These cases assert the submission contract through `FormData`, i.e. what the server actually
 * receives, rather than through the attribute alone.
 */

import { unmountVs } from '../support/mount';

describe('Security: hidden input name is not an HTML sink', () => {
  const mountId = 'vs-sec-name';
  const formId = 'vs-sec-name-form';
  const payload = 'x" data-pwned="1"><img src=x data-pwned="1">';
  const quotedName = 'items["a"]';

  /**
   * Mount inside a real `<form>`, because the whole point of the field is submission.
   * `setEleProps()` resolves `$ele.form` via `closest('form')` at init time, so the host has to
   * be in the form before `init()` runs.
   */
  const mountInForm = (win: Window, options: Record<string, unknown>): void => {
    unmountVs(win, mountId);
    win.document.getElementById(formId)?.remove();

    const $form = win.document.createElement('form');
    $form.id = formId;

    const $ele = win.document.createElement('div');
    $ele.id = mountId;
    $form.appendChild($ele);
    win.document.body.appendChild($form);

    // @ts-expect-error - VirtualSelect is attached to window by the bundle
    win.VirtualSelect.init({
      ele: $ele,
      options: [
        { label: 'Portugal', value: 'pt' },
        { label: 'Spain', value: 'es' },
      ],
      ...options,
    });
  };

  /**
   * The entries the form would actually submit.
   *
   * Built with the application window's own FormData so the read happens in the same realm as
   * the form - `FormData` lives on the global scope rather than on the `Window` interface, hence
   * the cast.
   */
  const submitted = (win: Window): FormData => {
    const $form = win.document.getElementById(formId) as HTMLFormElement;
    const WinFormData = (win as unknown as { FormData: typeof FormData }).FormData;

    return new WinFormData($form);
  };

  const submittedNames = (win: Window): string[] => Array.from(submitted(win).keys());

  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
  });

  afterEach(() => {
    cy.window().then((win) => {
      unmountVs(win, mountId);
      win.document.getElementById(formId)?.remove();
    });
  });

  it('submits a plain name, unchanged', () => {
    cy.window().then((win) => {
      mountInForm(win, { name: 'country', selectedValue: 'pt' });

      expect(submittedNames(win)).to.deep.equal(['country']);
      expect(submitted(win).get('country')).to.equal('pt');
    });
  });

  it('does not create DOM from a name containing a double quote', () => {
    cy.window().then((win) => {
      // enableSecureText is deliberately left at its default (off): the fix must not depend on it.
      mountInForm(win, { name: payload });

      expect(
        win.document.querySelectorAll(`#${mountId} [data-pwned]`).length,
        'no element may be created from the name',
      ).to.equal(0);
      expect(win.document.querySelectorAll(`#${mountId} img`).length, 'no injected img').to.equal(0);
    });
  });

  it('still submits under a name containing a double quote, verbatim', () => {
    cy.window().then((win) => {
      mountInForm(win, { name: payload, selectedValue: 'pt' });

      expect(submittedNames(win), 'the field must not be dropped from the form').to.deep.equal([payload]);
    });
  });

  it('submits a legitimately quoted field name verbatim', () => {
    cy.window().then((win) => {
      mountInForm(win, { name: quotedName, selectedValue: 'es' });

      expect(submittedNames(win)).to.deep.equal([quotedName]);
      expect(submitted(win).get(quotedName)).to.equal('es');
    });
  });

  it('does not entity-escape the field name when enableSecureText is on', () => {
    cy.window().then((win) => {
      mountInForm(win, { name: quotedName, selectedValue: 'pt', enableSecureText: true });

      // Escaping protects HTML sinks; the name is no longer one, so it must not be rewritten.
      expect(submittedNames(win)).to.deep.equal([quotedName]);
    });
  });

  it('still builds the control when the name contains a double quote and a value is set', () => {
    cy.window().then((win) => {
      cy.spy(win.console, 'error').as('consoleError');

      // The combination that used to abort the constructor: the payload swallowed the field's
      // class attribute, so setValue() dereferenced a null $hiddenInput.
      mountInForm(win, { name: payload, selectedValue: 'pt' });

      expect(win.document.querySelectorAll(`#${mountId} .vscomp-wrapper`).length, 'wrapper rendered').to.equal(1);
      expect(win.document.querySelectorAll(`#${mountId} .vscomp-hidden-input`).length, 'field present').to.equal(1);
    });

    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect, 'instance survived init').to.not.equal(undefined);
      expect($ele[0].virtualSelect.selectedValues, 'value applied').to.deep.equal(['pt']);
    });

    cy.get('@consoleError').should((spy: any) => {
      const messages = spy.getCalls().map((c: any) => String(c.args[0]));
      expect(messages.filter((m: string) => m.includes('setting \'value\''))).to.have.length(0);
    });
  });

  it('keeps the name attribute on the hidden input itself', () => {
    cy.window().then((win) => {
      mountInForm(win, { name: quotedName });

      const $hidden = win.document.querySelector(`#${mountId} .vscomp-hidden-input`) as HTMLInputElement;

      expect($hidden, 'the hidden input must still exist').to.not.equal(null);
      expect($hidden.getAttribute('name')).to.equal(quotedName);
    });
  });
});
