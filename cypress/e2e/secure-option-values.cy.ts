describe('Secure option values', () => {
  const existingValueMountId = 'vs-secure-existing-value';
  const newValueMountId = 'vs-secure-new-value';

  it('preserves the original value in the hidden form input', () => {
    cy.visit('get-started');

    cy.window().then((win) => {
      const $ele = win.document.createElement('div');
      $ele.id = existingValueMountId;
      win.document.body.appendChild($ele);

      // @ts-expect-error - VirtualSelect is attached to window by the bundle
      win.VirtualSelect.init({
        ele: $ele,
        enableSecureText: true,
        multiple: true,
        setValueAsArray: true,
        options: [{ value: '<', label: 'Value with unsafe char <' }],
      });
    });

    cy.get(`#${existingValueMountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${existingValueMountId}`).find('.vscomp-option').click();

    cy.get(`#${existingValueMountId}`).find('.vscomp-hidden-input').should('have.value', '["<"]');
    cy.get(`#${existingValueMountId}`).find('.vscomp-option-text').should('contain.text', 'Value with unsafe char <');
  });

  it('preserves new values without inserting their markup', () => {
    const payload = '"><img src=x onerror="window.__vsValueXss=true">';

    cy.visit('get-started');

    cy.window().then((win) => {
      const $ele = win.document.createElement('div');
      $ele.id = newValueMountId;
      win.document.body.appendChild($ele);

      // @ts-expect-error - VirtualSelect is attached to window by the bundle
      win.VirtualSelect.init({
        ele: $ele,
        allowNewOption: true,
        enableSecureText: true,
        multiple: true,
        setValueAsArray: true,
        options: [],
      });

      // @ts-expect-error - setValue is attached to the initialized element
      $ele.setValue([payload]);
    });

    cy.get(`#${newValueMountId}`).find('.vscomp-hidden-input').should('have.value', JSON.stringify([payload]));
    cy.get(`#${newValueMountId}`).find('img').should('not.exist');
    cy.window().its('__vsValueXss').should('be.undefined');
  });
});
