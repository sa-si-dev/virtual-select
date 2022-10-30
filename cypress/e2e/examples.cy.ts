describe('Open examples page', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/#/examples');
  });
});

describe('Default', () => {
  it('Go to section', () => {
    cy.get('a').contains('Default dropdown').click();
  });

  it('Select first option', () => {
    cy.selectOption('single-select', 2);
    // cy.get('#single-select')
    //   .click()
    //   .then((d) => {
    //     console.log(d[0].virtualSelect.$dropbox);

    //     cy.get(d[0].virtualSelect.$dropbox).find('.vscomp-option[data-value="2"]').click();
    //   });
  });
});
