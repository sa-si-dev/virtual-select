/**
 * Single select + allowNewOption: the options list must be sized for the option the user just
 * added. selectOption() closes the dropbox before it persists the new option, and the close
 * recomputes the list height without it - so the list came back one row short (0px on an
 * empty list) and `has-no-options` stayed on until something else happened to recompute.
 */
describe('Single select: adding a new option keeps the options list sized', () => {
  const id = 'vs-single-new-option-height';
  const optionHeight = 40;

  const addNewOption = (value: string) => {
    cy.getVs(id).click();
    cy.getVs(id).find('.vscomp-wrapper').should('not.have.class', 'closed');
    cy.getVs(id).typeValue(value);
    cy.getDropbox(null, id).find('.vscomp-option.current-new.focused').should('contain.text', value);
    /**
     * Enter rather than click: each keystroke re-renders the option rows, so a click can lose
     * its target between query and action. Enter selects the focused row through the same
     * selectOption() path a click takes.
     */
    cy.getVs(id).pressKeys('Enter');
    /** single select closes on select; wait for the close to land before reopening */
    cy.getVs(id).find('.vscomp-wrapper').should('have.class', 'closed');
  };

  const reopen = () => {
    cy.getVs(id).click();
    cy.getVs(id).find('.vscomp-wrapper').should('not.have.class', 'closed');
  };

  before(() => {
    cy.visit('get-started');

    cy.window().then((win) => {
      const $ele = win.document.createElement('div');
      $ele.id = id;
      win.document.body.appendChild($ele);

      // @ts-expect-error - VirtualSelect is attached to window by the bundle
      win.VirtualSelect.init({
        ele: $ele,
        allowNewOption: true,
        multiple: false,
        options: [],
      });
    });
  });

  it('sizes the list for the option added to an empty list', () => {
    addNewOption('Alpha');
    cy.getVs(id).hasValueText('Alpha');

    reopen();

    cy.getVs(id).find('.vscomp-wrapper').should('not.have.class', 'has-no-options');
    cy.getDropbox(null, id).find('.vscomp-options-list').should('have.css', 'height', `${optionHeight}px`);
    cy.getDropbox(null, id).find('.vscomp-option[data-value="Alpha"]').should('be.visible');
  });

  it('grows the list by one row for the next option added', () => {
    cy.getVs(id).click();
    cy.getVs(id).find('.vscomp-wrapper').should('have.class', 'closed');

    addNewOption('Beta');
    cy.getVs(id).hasValueText('Beta');

    reopen();

    cy.getDropbox(null, id).find('.vscomp-options-list').should('have.css', 'height', `${optionHeight * 2}px`);
    cy.getDropbox(null, id).find('.vscomp-option[data-value="Alpha"]').should('be.visible');
    cy.getDropbox(null, id).find('.vscomp-option[data-value="Beta"]').should('be.visible');
  });
});
