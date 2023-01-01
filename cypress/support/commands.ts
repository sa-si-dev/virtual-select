/** cSpell:ignore vscomp */
const dropboxCloseDuration = 200;
const optionsScrollDuration = 300;

Cypress.Commands.add('goToSection', (title) => {
  cy.get('a').contains(title).click();
});

Cypress.Commands.add('getVs', (id) => {
  cy.get(`#${id}`);
});

Cypress.Commands.add('getDropbox', (vsElem, id) => {
  cy.get(vsElem ? vsElem : `#${id}`).then(($ele) => {
    cy.get($ele[0].virtualSelect.$dropbox);
  });
});

Cypress.Commands.add('open', (id) => {
  cy.getVs(id).wait(dropboxCloseDuration).click();
});

Cypress.Commands.add('close', { prevSubject: true }, (vsElem) => {
  cy.get(vsElem).click();
});

Cypress.Commands.add('resetValue', (id) => {
  cy.getVs(id).find('.vscomp-clear-button').click();
  cy.getVs(id).hasValueText('Select');
});

Cypress.Commands.add('scrollOptions', { prevSubject: true }, (vsElem, distance) => {
  /**
   * using optionsScrollDuration here because when we open the dropdown with some values,
   * it would scroll to the selected option first. so waiting for auto scroll finish
   */
  cy.getDropbox(vsElem).wait(optionsScrollDuration).find('.vscomp-options-container').scrollTo(0, distance);

  /** returning the vscomp element to use it in the next child command */
  cy.get(vsElem);
});

Cypress.Commands.add('selectOption', { prevSubject: true }, (vsElem, value, { force = false } = {}) => {
  const values = Array.isArray(value) ? value : [value];

  values.forEach((v) => {
    cy.getDropbox(vsElem).find(`.vscomp-option[data-value="${v}"]`).click({ force });
  });

  cy.get(vsElem);
});

Cypress.Commands.add('hasValueText', { prevSubject: true }, (vsElem, valueText) => {
  cy.get(vsElem).find('.vscomp-value').contains(valueText);
  cy.get(vsElem);
});

Cypress.Commands.add('search', { prevSubject: true }, (vsElem, value) => {
  cy.getDropbox(vsElem).find('.vscomp-search-input').clear().type(value);
  cy.get(vsElem);
});

Cypress.Commands.add('toggleSelectAll', { prevSubject: true }, (vsElem, byLabel) => {
  cy.getDropbox(vsElem)
    .find(byLabel ? '.vscomp-toggle-all-label' : '.vscomp-toggle-all-button')
    .click();

  cy.get(vsElem);
});

Cypress.Commands.add('hasNoOptions', { prevSubject: true }, (vsElem) => {
  cy.getDropbox(vsElem).find('.vscomp-no-search-results').contains('No results found');
  cy.get(vsElem);
});

Cypress.Commands.add('checkClearButton', { prevSubject: true }, (vsElem, isExist) => {
  cy.get(vsElem)
    .find('.vscomp-clear-button')
    .should(isExist ? 'be.visible' : 'be.hidden');
});

Cypress.Commands.add('checkDropboxWidth', { prevSubject: true }, (vsElem, width) => {
  cy.getDropbox(vsElem).invoke('outerWidth').should('equal', width);
});

Cypress.Commands.add('checkFirstOption', { prevSubject: true }, (vsElem, optionLabel) => {
  cy.getDropbox(vsElem).find('.vscomp-option').first().contains(optionLabel);
  cy.get(vsElem);
});

Cypress.Commands.add('checkOptionGroup', { prevSubject: true }, (vsElem, title, selected) => {
  cy.getDropbox(vsElem)
    .contains(title)
    .parent('.vscomp-option')
    .should(selected ? 'have.class' : 'not.have.class', 'selected');

  cy.get(vsElem);
});

Cypress.Commands.add('selectOptionGroup', { prevSubject: true }, (vsElem, title) => {
  cy.getDropbox(vsElem).contains(title).parent('.vscomp-option').click();
  cy.get(vsElem);
});

Cypress.Commands.add('hasMarkedText', { prevSubject: true }, (vsElem, text) => {
  cy.getDropbox(vsElem).find('mark').contains(text);
});

Cypress.Commands.add('dropboxIsFixed', (id) => {
  cy.getDropbox(null, id).parent().should('have.css', 'position', 'fixed');
});

Cypress.Commands.add('closePopup', (id) => {
  cy.getDropbox(null, id).find('.vscomp-dropbox-close-button').click();
});

Cypress.Commands.add('hasFlagIcon', { prevSubject: true }, (vsElem) => {
  cy.getDropbox(vsElem).find('.vscomp-option').first().find('i.flag');
});

Cypress.Commands.add('hasValueTags', { prevSubject: true }, (vsElem, labels) => {
  labels.forEach((label) => {
    cy.get(vsElem).find('.vscomp-value-tag').contains(label);
  });
});

Cypress.Commands.add('checkValueTagsCount', { prevSubject: true }, (vsElem, count) => {
  cy.get(vsElem).find('.vscomp-value-tag').should('have.length', count);
  cy.get(vsElem);
});

Cypress.Commands.add('removeValueTag', { prevSubject: true }, (vsElem, label) => {
  cy.get(vsElem).find('.vscomp-value-tag-content').contains(label).siblings('.vscomp-value-tag-clear-button').click();
  cy.get(vsElem);
});
