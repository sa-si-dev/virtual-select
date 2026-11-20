/** cSpell:ignore vscomp */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

describe('Disabling an open Select', () => {
  const mountId = 'vs-disable-while-open';

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('does not commit a keyboard selection after disabling', () => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(3), search: true, selectedValue: 'o1' }));
    cy.get(`#${mountId} .vscomp-toggle-button`).click();
    cy.get(`#${mountId} .vscomp-search-input`).should('be.focused');

    cy.get(`#${mountId}`).then(($host) => {
      const host = $host[0] as HTMLElement & { disable: () => void };
      host.disable();
      host.addEventListener('change', cy.spy().as('change'));
    });

    const keydown = (key: string, keyCode: number) => {
      cy.get(`#${mountId} .vscomp-search-input`).should('be.focused').then(($input) => {
        $input[0].dispatchEvent(new KeyboardEvent('keydown', { key, keyCode, bubbles: true, cancelable: true }));
      });
    };

    keydown('ArrowDown', 40);
    keydown('ArrowDown', 40);
    cy.get(`#${mountId} .vscomp-option.focused`).should('not.have.attr', 'data-value', 'o1');
    keydown('Enter', 13);

    cy.get(`#${mountId}`).should('have.prop', 'value', 'o1');
    cy.get('@change').should('not.have.been.called');
  });
});
