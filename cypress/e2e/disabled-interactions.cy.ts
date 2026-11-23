/** cSpell:ignore vscomp */

/**
 * A disabled Select must not accept user input, whatever state it was in when disabled.
 *
 * disable() only set the flag and blurred $wrapper. When the dropdown was open, focus was in the
 * search input, so the blur did nothing and the list stayed open and interactive. Apart from
 * opening via Enter, no event handler checked the disabled flag either. The only barrier was
 * `pointer-events: none` on the wrapper, which keyboard input ignores and which does not reach a
 * dropbox portalled into an external `dropboxWrapper`.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

type VsHost = HTMLElement & { disable: () => void; value: unknown };

describe('Disabled Select ignores user interaction', () => {
  const mountId = 'vs-disabled-interactions';
  const portalId = 'vs-disabled-interactions-portal';

  const host = () => cy.get(`#${mountId}`);
  const disable = () => host().then(($host) => (($host[0] as VsHost).disable()));
  const spyChange = () => host().then(($host) => $host[0].addEventListener('change', cy.spy().as('change')));
  const isExpanded = (expected: boolean) =>
    host().find('.vscomp-wrapper').should('have.attr', 'aria-expanded', String(expected));

  /** Dispatch a raw keydown so the test reaches the handler regardless of CSS pointer rules. */
  const keydown = ($el: JQuery<HTMLElement>, key: string, keyCode: number) => {
    $el[0].dispatchEvent(new KeyboardEvent('keydown', { key, keyCode, bubbles: true, cancelable: true }));
  };

  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
  });

  afterEach(() => {
    cy.window().then((win) => {
      unmountVs(win, mountId);
      win.document.getElementById(portalId)?.remove();
    });
  });

  it('closes an open dropdown and drops focus from the search input', () => {
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(3), search: true }));
    host().find('.vscomp-toggle-button').click();
    host().find('.vscomp-search-input').should('be.focused');

    disable();

    isExpanded(false);
    host().find('.vscomp-search-input').should('not.be.focused');
  });

  it('closes a dropdown portalled into an external dropboxWrapper', () => {
    cy.window().then((win) => {
      const portal = win.document.createElement('div');
      portal.id = portalId;
      win.document.body.appendChild(portal);
      mountVs(win, mountId, { options: makeOptions(3), dropboxWrapper: `#${portalId}` });
    });
    host().find('.vscomp-toggle-button').click();
    isExpanded(true);

    disable();

    isExpanded(false);
    cy.get(`#${portalId} .vscomp-dropbox-container`).should('not.be.visible');
  });

  // One key per test: pressing both would select all and then deselect all, hiding the bug.
  [
    { name: 'Enter', key: 'Enter', keyCode: 13 },
    { name: 'Space', key: ' ', keyCode: 32 },
  ].forEach(({ name, key, keyCode }) => {
    it(`does not toggle all options with ${name}`, () => {
      cy.window().then((win) =>
        mountVs(win, mountId, { options: makeOptions(3), multiple: true, keepAlwaysOpen: true }),
      );
      spyChange();
      disable();

      host().find('.vscomp-toggle-all-button').then(($btn) => {
        $btn[0].focus();
        keydown($btn, key, keyCode);
      });

      host().should(($host) => expect(($host[0] as VsHost).value).to.deep.equal([]));
      cy.get('@change').should('not.have.been.called');
    });
  });

  it('does not open from the arrow keys', () => {
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(3) }));
    disable();

    host().find('.vscomp-wrapper').then(($wrapper) => {
      $wrapper[0].focus();
      keydown($wrapper, 'ArrowDown', 40);
      keydown($wrapper, 'ArrowUp', 38);
    });

    isExpanded(false);
  });

  it('does not clear the value from Backspace or Delete', () => {
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(3), selectedValue: 'o2' }));
    spyChange();
    disable();

    host().find('.vscomp-wrapper').then(($wrapper) => {
      $wrapper[0].focus();
      keydown($wrapper, 'Backspace', 8);
      keydown($wrapper, 'Delete', 46);
    });

    host().should('have.prop', 'value', 'o2');
    cy.get('@change').should('not.have.been.called');
  });

  it('does not select an option on click', () => {
    // keepAlwaysOpen keeps the list rendered after disable(); a native click bypasses the
    // pointer-events rule, as a click on a portalled dropbox would.
    cy.window().then((win) =>
      mountVs(win, mountId, { options: makeOptions(3), keepAlwaysOpen: true, selectedValue: 'o1' }),
    );
    spyChange();
    disable();

    host().find('.vscomp-option[data-value="o3"]').then(($option) => $option[0].click());

    host().should('have.prop', 'value', 'o1');
    cy.get('@change').should('not.have.been.called');
  });
});
