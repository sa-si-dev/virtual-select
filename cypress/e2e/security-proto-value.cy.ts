/** cSpell:ignore vscomp */

/**
 * SEC-03 — option values are used as keys of plain `{}` objects, so `__proto__` is unusable.
 *
 * This is **not** prototype pollution. `mapping['__proto__'] = true` on a plain object invokes
 * the inherited `__proto__` setter, which ignores a non-object value: nothing is written, and
 * `Object.prototype` is untouched. The first case below pins that, so the assessment stays
 * honest if the implementation changes.
 *
 * What it *is* is a state-rehydration bug, and an asymmetric one. Reading
 * `mapping['__proto__']` returns the inherited `Object.prototype`, which is truthy but never
 * `=== true` — and every one of these lookups compares against `true`. So the option is
 * reachable by click (that path never consults a mapping) but not by API:
 *
 *   - `setValue(['__proto__'])` silently selects nothing;
 *   - reading `element.value` and feeding it straight back loses the selection;
 *   - `setDisabledOptions` / `setEnabledOptions` silently skip it;
 *   - with `allowNewOption`, it is additionally mistaken for an unknown value and duplicated
 *     as a new option.
 *
 * `Object.create(null)` for the value-keyed lookups removes the inherited members, so an
 * arbitrary string key behaves like any other. `constructor` and `toString` are covered too:
 * they shadow correctly on a plain object and already worked, so they are the control that
 * proves the fix did not change ordinary behaviour.
 */

import { mountVs, unmountVs } from '../support/mount';

describe('Security: option values that collide with Object.prototype members', () => {
  const mountId = 'vs-sec-proto';

  const protoOptions = [
    { label: 'Proto', value: '__proto__' },
    { label: 'Constructor', value: 'constructor' },
    { label: 'ToString', value: 'toString' },
    { label: 'Plain A', value: 'a' },
    { label: 'Plain B', value: 'b' },
  ];

  const mount = (win: Window, extra: Record<string, unknown> = {}) =>
    mountVs(win, mountId, { options: protoOptions, ...extra });

  /** The instance, for driving the public API the way a consumer does. */
  const vs = () => cy.get(`#${mountId}`).then(($ele) => $ele[0].virtualSelect);

  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
  });

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('does not pollute Object.prototype', () => {
    cy.window().then((win) => {
      /**
       * The probe must be built in the *application's* realm.
       *
       * Spec code runs in the Cypress runner frame; `cy.window()` returns the application
       * iframe's window. Those are separate realms with separate intrinsics, so an object
       * literal written here has the runner frame's `Object.prototype` on its chain and can
       * never `equal` `win.Object.prototype` — that comparison fails whether or not anything
       * was polluted, which is exactly how this case first went wrong.
       *
       * So: snapshot the application realm's own `Object.prototype` members, run the
       * operations, and compare. A pollution would show up as a new member, and a prototype
       * swap as a fresh object no longer inheriting from it.
       */
      const appObject = (win as unknown as { Object: ObjectConstructor }).Object;
      const membersBefore = Object.getOwnPropertyNames(appObject.prototype).sort().join(',');

      mount(win);
      const $ele = win.document.getElementById(mountId) as HTMLElement;

      $ele.setValue?.(['__proto__']);
      $ele.setDisabledOptions?.(['__proto__']);
      $ele.setEnabledOptions?.(['__proto__']);

      expect(
        Object.getOwnPropertyNames(appObject.prototype).sort().join(','),
        'Object.prototype must not gain a member',
      ).to.equal(membersBefore);

      const probe = new appObject();
      expect(Object.getPrototypeOf(probe), 'a fresh object still inherits from it').to.equal(appObject.prototype);
      expect(typeof appObject.prototype, 'it is still an object, not a replaced value').to.equal('object');
    });
  });

  it('selects a "__proto__" value through setValue', () => {
    cy.window().then((win) => {
      mount(win);
      (win.document.getElementById(mountId) as HTMLElement).setValue?.(['__proto__']);
    });

    vs().should((instance) => {
      expect(instance.selectedValues, 'selection').to.deep.equal(['__proto__']);
    });
    cy.get(`#${mountId}`).find('.vscomp-value').should('contain', 'Proto');
  });

  it('round-trips a "__proto__" selection through element.value', () => {
    cy.window().then((win) => {
      mount(win);
      const $ele = win.document.getElementById(mountId) as HTMLElement;

      // Read the live value the way an app persisting state would, then restore it.
      $ele.setValue?.(['__proto__']);
      const persisted = ($ele as unknown as { value: string }).value;
      $ele.reset?.(false, true);
      $ele.setValue?.([persisted]);
    });

    vs().should((instance) => {
      expect(instance.selectedValues, 'restored selection').to.deep.equal(['__proto__']);
    });
  });

  it('selects "__proto__" alongside ordinary values in multiple mode', () => {
    cy.window().then((win) => {
      mount(win, { multiple: true });
      (win.document.getElementById(mountId) as HTMLElement).setValue?.(['__proto__', 'a', 'b']);
    });

    vs().should((instance) => {
      expect(instance.selectedValues).to.deep.equal(['__proto__', 'a', 'b']);
    });
  });

  it('disables a "__proto__" option through setDisabledOptions', () => {
    cy.window().then((win) => {
      mount(win);
      (win.document.getElementById(mountId) as HTMLElement).setDisabledOptions?.(['__proto__', 'a']);
    });

    vs().should((instance) => {
      const disabled = instance.options.filter((d: any) => d.isDisabled).map((d: any) => d.value);

      expect(disabled).to.deep.equal(['__proto__', 'a']);
    });
  });

  it('keeps a "__proto__" option enabled through setEnabledOptions', () => {
    cy.window().then((win) => {
      mount(win);
      (win.document.getElementById(mountId) as HTMLElement).setEnabledOptions?.(['__proto__']);
    });

    vs().should((instance) => {
      const enabled = instance.options.filter((d: any) => !d.isDisabled).map((d: any) => d.value);

      expect(enabled, 'only the named value stays enabled').to.deep.equal(['__proto__']);
    });
  });

  it('does not duplicate a "__proto__" value as a new option', () => {
    cy.window().then((win) => {
      mount(win, { allowNewOption: true });
      (win.document.getElementById(mountId) as HTMLElement).setValue?.(['__proto__']);
    });

    vs().should((instance) => {
      const matches = instance.options.filter((d: any) => d.value === '__proto__');

      expect(matches, 'the existing option must be reused, not re-added').to.have.length(1);
      expect(instance.selectedValues).to.deep.equal(['__proto__']);
    });
  });

  it('keeps "__proto__" in place when selection order is preserved', () => {
    cy.window().then((win) => {
      mount(win, { multiple: true });
      (win.document.getElementById(mountId) as HTMLElement).setValue?.(['b', '__proto__', 'a']);
    });

    vs().should((instance) => {
      const ordered = instance
        .getSelectedOptions({ fullDetails: true, keepSelectionOrder: true })
        .map((d: any) => d.value);

      expect(ordered).to.deep.equal(['b', '__proto__', 'a']);
    });
  });

  it('still handles other Object.prototype member names (control)', () => {
    cy.window().then((win) => {
      mount(win, { multiple: true });
      (win.document.getElementById(mountId) as HTMLElement).setValue?.(['constructor', 'toString']);
    });

    vs().should((instance) => {
      expect(instance.selectedValues).to.deep.equal(['constructor', 'toString']);
    });
  });
});
