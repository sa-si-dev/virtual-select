/** cSpell:ignore vscomp pwned */

/**
 * AI-22 stage 1 — escaping was applied to the text the library *stores*, so `&` corrupted the
 * option's own identity.
 *
 * `secureText()` escapes by assigning to a text node and reading back `innerHTML`, which rewrites
 * `&` to `&amp;` (and `<`/`>`) by design — that rewriting is what makes `enableSecureText` work.
 * The mistake was storing the result in `option.value` and deriving the search keys from it.
 *
 * The three fields have different constraints, and treating them alike is what caused this:
 *
 *   - `value` reaches **no** `innerHTML` sink. It goes into the `data-value` attribute and is
 *     otherwise only compared and used as a map key. Escaping it protected nothing and made the
 *     option unaddressable: `setValue(['a&b'])` could not match a stored `a&amp;b`.
 *   - `label` and `description` **are** inserted as HTML, so they must stay escaped. They still are.
 *
 * Stage 1 therefore stores `value` verbatim, escapes `&` as well as `"` at the `data-value`
 * interpolation so the attribute still parses back to it, and derives `labelNormalized` /
 * `descriptionNormalized` from the raw text so search matches what the consumer typed.
 *
 * Note the deliberate asymmetry with `DomUtils.getAttributesText()`, which escapes quotes only:
 * its inputs are already-escaped label text, so escaping `&` there too would double it.
 *
 * Stage 2 — storing `label`/`description` raw and escaping at render — is breaking (a `labelRenderer`
 * receiving a raw label turns the common `'<b>' + d.label + '</b>'` into an injection) and is held
 * for 2.0.0. The cases at the end pin the escaping that stage 1 keeps.
 */

import { mountVs, unmountVs } from '../support/mount';

describe('Security: option values are stored verbatim, not HTML-escaped', () => {
  const mountId = 'vs-amp';

  const ampOptions = [
    { label: 'Tom & Jerry', value: 'a&b' },
    { label: 'R&D', value: 'r&d' },
    { label: 'Angle <brackets>', value: 'x<y' },
    { label: 'Plain', value: 'plain' },
  ];

  const mount = (win: Window, extra: Record<string, unknown> = {}) =>
    mountVs(win, mountId, { options: ampOptions, enableSecureText: true, ...extra });

  const vs = () => cy.get(`#${mountId}`).then(($ele) => $ele[0].virtualSelect);
  const openDropbox = () => cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
  /** the dropbox is appended outside the host for the default `dropboxWrapper: 'self'` layout */
  const dropbox = () => cy.get(`#${mountId}`).then(($ele) => cy.wrap($ele[0].virtualSelect.$dropbox));

  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
  });

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('stores option values exactly as supplied', () => {
    cy.window().then((win) => mount(win));

    vs().should((instance) => {
      expect(instance.options.map((d: any) => d.value)).to.deep.equal(['a&b', 'r&d', 'x<y', 'plain']);
    });
  });

  it('selects an "&" value through setValue', () => {
    cy.window().then((win) => {
      mount(win);
      (win.document.getElementById(mountId) as HTMLElement).setValue?.(['a&b']);
    });

    vs().should((instance) => {
      expect(instance.selectedValues).to.deep.equal(['a&b']);
    });
    cy.get(`#${mountId}`).find('.vscomp-value').should('contain', 'Tom & Jerry');
  });

  it('selects a "<" value through setValue', () => {
    cy.window().then((win) => {
      mount(win);
      (win.document.getElementById(mountId) as HTMLElement).setValue?.(['x<y']);
    });

    vs().should((instance) => {
      expect(instance.selectedValues).to.deep.equal(['x<y']);
    });
  });

  it('round-trips an "&" selection through element.value', () => {
    cy.window().then((win) => {
      const $ele = win.document.getElementById(mountId) ?? mount(win);
      const $host = win.document.getElementById(mountId) as HTMLElement;
      void $ele;

      $host.setValue?.(['a&b']);
      const persisted = ($host as unknown as { value: string }).value;
      expect(persisted, 'the value read back must be the value supplied').to.equal('a&b');

      $host.reset?.(false, true);
      $host.setValue?.([persisted]);
    });

    vs().should((instance) => {
      expect(instance.selectedValues).to.deep.equal(['a&b']);
    });
  });

  it('disables an "&" option through setDisabledOptions', () => {
    cy.window().then((win) => {
      mount(win);
      (win.document.getElementById(mountId) as HTMLElement).setDisabledOptions?.(['a&b', 'plain']);
    });

    vs().should((instance) => {
      const disabled = instance.options.filter((d: any) => d.isDisabled).map((d: any) => d.value);

      expect(disabled).to.deep.equal(['a&b', 'plain']);
    });
  });

  it('reports "&" values back from getDisabledOptions', () => {
    cy.window().then((win) => {
      mount(win);
      (win.document.getElementById(mountId) as HTMLElement).setDisabledOptions?.(['r&d']);
    });

    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].getDisabledOptions?.().map((d: any) => d.value)).to.deep.equal(['r&d']);
    });
  });

  it('finds a label containing "&" by searching for it', () => {
    cy.window().then((win) => mount(win, { search: true }));

    openDropbox();
    cy.get(`#${mountId}`).then(($ele) => $ele[0].virtualSelect.setSearchValue('Tom & Jerry'));

    dropbox().find('.vscomp-option').should('have.length', 1);
    dropbox().find('.vscomp-option').should('have.attr', 'data-value', 'a&b');
  });

  it('finds a label containing "<" by searching for it', () => {
    cy.window().then((win) => mount(win, { search: true }));

    openDropbox();
    cy.get(`#${mountId}`).then(($ele) => $ele[0].virtualSelect.setSearchValue('<brackets>'));

    dropbox().find('.vscomp-option').should('have.length', 1);
    dropbox().find('.vscomp-option').should('have.attr', 'data-value', 'x<y');
  });

  it('finds a description containing "&" by searching for it', () => {
    cy.window().then((win) =>
      mountVs(win, mountId, {
        options: [
          { label: 'One', value: '1', description: 'Research & Development' },
          { label: 'Two', value: '2', description: 'Something else' },
        ],
        hasOptionDescription: true,
        enableSecureText: true,
        search: true,
      }),
    );

    openDropbox();
    cy.get(`#${mountId}`).then(($ele) => $ele[0].virtualSelect.setSearchValue('Research & Dev'));

    dropbox().find('.vscomp-option').should('have.length', 1);
    dropbox().find('.vscomp-option').should('have.attr', 'data-value', '1');
  });

  it('keeps data-value readable and un-breakable for an "&" value', () => {
    cy.window().then((win) => mount(win));

    openDropbox();
    dropbox().find('.vscomp-option').should(($options) => {
      expect(Array.from($options).map((o) => (o as HTMLElement).dataset.value)).to.deep.equal([
        'a&b',
        'r&d',
        'x<y',
        'plain',
      ]);
    });
    dropbox().find('[data-pwned]').should('not.exist');
  });

  it('still selects by click when the value contains "&" and a quote', () => {
    const tricky = 'a&b" data-pwned="1" z="';

    cy.window().then((win) => mountVs(win, mountId, { options: [{ label: 'Tricky', value: tricky }], enableSecureText: true }));

    openDropbox();
    dropbox().find('[data-pwned]').should('not.exist');
    dropbox().find('.vscomp-option').click();

    vs().should((instance) => {
      expect(instance.selectedValues).to.deep.equal([tricky]);
    });
  });

  it('receives the whole typed term, ampersand included', () => {
    cy.window().then((win) => mount(win, { search: true, allowNewOption: true }));

    openDropbox();
    cy.get(`#${mountId}`).find('.vscomp-search-input').type('Smith & Sons');

    /**
     * Deliberately separate from the storage assertion below.
     *
     * Every keystroke re-renders the option list, and with allowNewOption it also adds and
     * updates a "current new" row. Folding "typing works" and "the value is stored verbatim"
     * into one case made a dropped keystroke surface as a value mismatch, which reads like a
     * storage bug and is not one. Here the search text is asserted on its own, so a typing
     * problem is reported as a typing problem.
     */
    cy.get(`#${mountId}`).find('.vscomp-search-input').should('have.value', 'Smith & Sons');
    vs().should((instance) => {
      expect(instance.searchValueOriginal, 'the component saw the whole term').to.equal('Smith & Sons');
    });
  });

  it('stores a typed new option value verbatim', () => {
    cy.window().then((win) => mount(win, { search: true, allowNewOption: true }));

    openDropbox();
    /**
     * setSearchValue() is the entry point onSearch() calls for a keystroke, so this covers the
     * same code path without depending on per-character typing into a list that re-renders on
     * every input event - the coupling AI-1e removed elsewhere in this suite.
     */
    cy.get(`#${mountId}`).then(($ele) => $ele[0].virtualSelect.setSearchValue('Smith & Sons'));

    // the option the component derives from the search text, before anything is clicked
    vs().should((instance) => {
      const created = instance.options.find((d: any) => d.isCurrentNew);

      expect(created, 'a new option is offered').to.not.equal(undefined);
      expect(created.value, 'value stored verbatim').to.equal('Smith & Sons');
    });

    // Scoped by data-value so the retry lands on the row that carries the full term, rather
    // than whichever node the virtualiser happened to have rendered a moment earlier.
    dropbox().find('.vscomp-option.current-new[data-value="Smith & Sons"]').click();

    vs().should((instance) => {
      expect(instance.selectedValues).to.deep.equal(['Smith & Sons']);
    });
  });

  // --- what stage 1 deliberately keeps ---

  it('still renders "&" in a label as a single ampersand', () => {
    cy.window().then((win) => mount(win));

    openDropbox();
    dropbox()
      .find('.vscomp-option[data-value="a&b"] .vscomp-option-text')
      .should(($text) => {
        expect($text.text().trim()).to.equal('Tom & Jerry');
      });
  });

  it('still escapes markup in a label, so option text cannot execute', () => {
    cy.window().then((win) => {
      // @ts-expect-error - test marker
      win.__vsAmpXss = undefined;
      mountVs(win, mountId, {
        options: [{ label: '<img src=x onerror="window.__vsAmpXss=true">', value: 'p1' }],
        enableSecureText: true,
      });
    });

    openDropbox();
    dropbox().find('img[src="x"]').should('not.exist');

    cy.window().then((win) => {
      // @ts-expect-error - test marker
      expect(win.__vsAmpXss, 'payload must not execute').to.not.eq(true);
    });
  });

  it('leaves everything unchanged when escaping is off', () => {
    cy.window().then((win) => mount(win, { enableSecureText: false }));

    vs().should((instance) => {
      expect(instance.options.map((d: any) => d.value)).to.deep.equal(['a&b', 'r&d', 'x<y', 'plain']);
      expect(instance.options[0].label, 'labels are raw with escaping off').to.equal('Tom & Jerry');
    });
  });
});
