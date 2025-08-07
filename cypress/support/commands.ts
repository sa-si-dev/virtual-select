/** cSpell:ignore vscomp */
import 'cypress-real-events';

const dropboxCloseDuration = 200;
const optionsScrollDuration = 300;

type SpecialKey = 'Tab' | 'Enter' | 'Escape' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End';

// Type guard function
const isValidKey = (key: string): key is SpecialKey => {
  const specialKeys = ['Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  return specialKeys.includes(key);
};

Cypress.Commands.add('goToSection', (title) => {
  cy.get('a').contains(title).click({force: true});
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

Cypress.Commands.add('resetSearchValue', { prevSubject: true }, (vsElem) => {
  cy.getDropbox(vsElem)
    .find('.vscomp-search-container')
    .find('.vscomp-search-clear').click();
  cy.getDropbox(vsElem)
    .find('.vscomp-search-container')
    .find('.vscomp-search-input')
    .should('have.attr', 'placeholder', 'Search...');
})

Cypress.Commands.add('resetValuePopup', { prevSubject: true }, (vsElem) => {
  cy.getDropbox(vsElem).find('.vscomp-search-clear').click();
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

Cypress.Commands.add('checkOptionLabelExists', { prevSubject: true }, (vsElem, label) => {
  const labels = Array.isArray(label) ? label : [label];
  cy.log('Checking option labels in visible options container:', labels);

  labels.forEach((l) => {
    cy.log(`Checking option label: ${l}`);
    // Use the data-tooltip attribute to find the option
    cy.getDropbox(vsElem)
      .find('.vscomp-options-container')
      .find(`.vscomp-option-text[data-tooltip="${l}"]`)
      .contains(l);
  });
});

Cypress.Commands.add('checkActiveElementHasClass', (className: string) => {
  cy.log(`Checking if active element has class: ${className}`);
  
  // cy.focused() is the most performant and correct way to get the active element.
  // It automatically retries until an element is focused.
  cy.focused().should('have.class', className);
});

Cypress.Commands.add('hasValueText', { prevSubject: true }, (vsElem, valueText) => {
  cy.get(vsElem).find('.vscomp-value').contains(valueText);
  cy.get(vsElem);
});

Cypress.Commands.add('search', { prevSubject: true }, (vsElem, value) => {
  cy.getDropbox(vsElem).find('.vscomp-search-input').clear().type(value);
  cy.get(vsElem);
});

Cypress.Commands.add('typeValue', { prevSubject: true }, (vsElem, value, clearText = false) => {
  // Use `cy.getDropbox(vsElem)` to get the main container and then find the search input.
  const searchInput = cy.getDropbox(vsElem).find('.vscomp-search-input');
  // Focus on the input first, which is a good practice for keyboard interactions.
  searchInput.focus();
  // Conditionally clear the text if `clearText` is true.
  if (clearText) {
    searchInput.clear();
  }
  // Use the new `cy.realType()` command from the plugin to type the value.
  searchInput.realType(value);
  cy.get(vsElem);
});

Cypress.Commands.add('pressKeys', { prevSubject: true }, (vsElem, keys) => {
  const searchInput = cy.getDropbox(vsElem).find('.vscomp-search-input');
  searchInput.focus();

  const keysToPress = Array.isArray(keys) ? keys : [keys];
  
  keysToPress.forEach(key => {
    if (isValidKey(key)) {
      // TypeScript now knows this is a valid key type
      cy.realPress(key);
    } else {
      // Log an error or fail the test if an invalid key is passed
      throw new Error(`Invalid key provided: "${key}". Must be one of: ${keysToPress.join(', ')}`);
    }
  });
  cy.get(vsElem);
});

Cypress.Commands.add('searchClear', { prevSubject: true }, (vsElem) => {
  cy.getDropbox(vsElem).find('.vscomp-search-input').clear();
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

Cypress.Commands.add('checkClearButtonPopup', { prevSubject: true }, (vsElem, isExist) => {
  cy.getDropbox(vsElem)
    .find('.vscomp-search-clear')
    .should('have.attr', 'aria-hidden')
    .and('equal', (!isExist).toString()); // Flip the boolean and convert to string
});

Cypress.Commands.add('checkSearchClearButton', { prevSubject: true }, (vsElem, isExist) => {
  cy.getDropbox(vsElem).find('.vscomp-search-container')
    .find('.vscomp-search-clear')
    .should('have.attr', 'aria-hidden')
    .and('equal', (!isExist).toString()); // Flip the boolean and convert to string
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

Cypress.Commands.add('hasSelectedFlagIcon', { prevSubject: true }, (vsElem) => {
  cy.get(vsElem).find('.vscomp-value').find('i.flag');
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
