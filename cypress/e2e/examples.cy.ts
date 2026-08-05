/** cSpell:ignore vscomp */

// // // // //
// // // // // Get started page
// // // // //

describe('Open Get started page', () => {
  it('opened', () => {
    cy.visit('get-started');
  });
});

describe('Open Get Started page for Dropdowns interaction test', () => {
  const idSingle = 'single-select'
  const idMultiple = 'multiple-select'

  it('open the single-select dropdown', () => {
    cy.open(idSingle);
    cy.getVs(idSingle).find('.vscomp-ele-wrapper').should('not.have.class', 'closed');
  });

  it('open the multiple-select dropdown clicking directly in the DOM element', () => {
    cy.getVs(idMultiple).find('.vscomp-toggle-button').click();
    cy.getVs(idMultiple).find('.vscomp-ele-wrapper').should('not.have.class', 'closed');
  });

  it('should close single-select when opening single-select and multiple-select keep opened', () => {
    cy.getVs(idSingle).find('.vscomp-ele-wrapper').should('have.class', 'closed');
    cy.getVs(idMultiple).find('.vscomp-ele-wrapper').should('not.have.class', 'closed');
  });
});

describe('Open Get Started page for Dropdowns interaction test clicking outside', () => {
  const idSingle = 'single-select'
  const idMultiple = 'multiple-select'

  it('open the single-select dropdown', () => {
    cy.open(idSingle);
    cy.getVs(idSingle).find('.vscomp-ele-wrapper').should('not.have.class', 'closed');
  });

  it('click outside to close the single-select dropdown', () => {
    cy.get('body').click(10, 10); // Click at coordinates 10,10
    cy.getVs(idSingle).find('.vscomp-ele-wrapper').should('have.class', 'closed');
  });

  it('open the multiple-select dropdown', () => {
    cy.open(idMultiple);
    cy.getVs(idMultiple).find('.vscomp-ele-wrapper').should('not.have.class', 'closed');
  });

  it('click outside to close the multiple-select dropdown', () => {
    cy.get('body').click(10, 10); // Click at coordinates 10,10
    cy.getVs(idMultiple).find('.vscomp-ele-wrapper').should('have.class', 'closed');
  });

});



describe('Accessibility attributes - virtualized options metadata', () => {
  const id = 'single-select';

  it('exposes total list size and sequential positions without search', () => {
    cy.open(id);

    cy.getDropbox(null, id)
      .find('[role="option"][aria-setsize]')
      .first()
      .as('firstOption');

    cy.get('@firstOption')
      .invoke('attr', 'aria-setsize')
      .then((value) => {
        const setSize = Number(value);
        expect(Number.isNaN(setSize), 'aria-setsize should be a number').to.be.false;
        expect(setSize, 'aria-setsize should be greater than zero').to.be.greaterThan(0);
        cy.wrap(setSize).as('totalOptionsCount');
      });

    cy.get('@firstOption')
      .invoke('attr', 'aria-posinset')
      .then((value) => {
        const position = Number(value);
        expect(position, 'first visible option should be position 1').to.equal(1);
      });

    cy.getDropbox(null, id)
      .find('[role="option"][aria-posinset]')
      .last()
      .invoke('attr', 'aria-posinset')
      .then((value) => {
        const lastPosition = Number(value);
        expect(Number.isNaN(lastPosition), 'last option should report aria-posinset').to.be.false;
        cy.wrap(lastPosition).as('initialLastPosition');
      });

    cy.getVs(id).scrollOptions(2000);
    cy.wait(300);

    cy.get('@initialLastPosition').then((initialLastPosition) => {
      const initialPosition = Number(initialLastPosition);
      cy.getDropbox(null, id)
        .find('[role="option"][aria-posinset]')
        .last()
        .invoke('attr', 'aria-posinset')
        .then((value) => {
          const newLast = Number(value);
          expect(newLast, 'last rendered option should advance after scrolling').to.be.greaterThan(initialPosition);
        });
    });

    cy.get('body').click(10, 10);
  });

  it('updates aria-setsize and positions when filtering via search', () => {
    cy.open(id).search('Option 1234');

    cy.getDropbox(null, id)
      .find('[role="option"][aria-setsize]')
      .should('have.length.greaterThan', 0)
      .first()
      .as('filteredFirstOption');

    cy.get('@filteredFirstOption')
      .invoke('attr', 'aria-setsize')
      .then((value) => {
        const setSize = Number(value);
        expect(Number.isNaN(setSize), 'filtered aria-setsize should be numeric').to.be.false;
        expect(setSize, 'filtered aria-setsize should be greater than zero').to.be.greaterThan(0);
      });

    cy.get('@filteredFirstOption')
      .invoke('attr', 'aria-posinset')
      .then((value) => {
        const position = Number(value);
        expect(position, 'first filtered option should be position 1').to.equal(1);
      });

    cy.getDropbox(null, id)
      .find('[role="option"][aria-posinset]')
      .eq(1)
      .invoke('attr', 'aria-posinset')
      .then((value) => {
        if (value) {
          const position = Number(value);
          expect(position, 'second filtered option should be position 2').to.equal(2);
        }
      });

    cy.get('body').click(10, 10);
    cy.reload();
  });

  it('has proper ARIA attributes on listbox and options container for screen reader navigation', () => {
    /**
     * openFresh() rather than cy.open(): this case reads options by DOM position
     * (`.first()`, `.eq(1)`), and on a virtualised list of 100k those positions depend on
     * `scrollTop`. openFresh pins the scroll position and asserts no option is already
     * highlighted, so "one press reaches the first option" holds regardless of test order.
     */
    cy.openFresh(id);

    // Cache references to relevant elements for repeated assertions
    cy.getDropbox(null, id)
      .find('.vscomp-options-container')
      .should('exist')
      .as('listboxContainer');

    // aria-activedescendant belongs on the element that holds focus and has a role that
    // supports it - here the role="combobox" wrapper. It used to be asserted on
    // .vscomp-dropbox-container, a plain div with no role, where the attribute is
    // meaningless. That container is now checked for its *absence* below.
    cy.getVs(id)
      .find('.vscomp-ele-wrapper')
      .should('exist')
      .as('activeDescendantHost');

    cy.getDropbox(null, id)
      .parent('.vscomp-dropbox-container')
      .should('exist')
      .as('roleLessContainer');

    // Get the combobox wrapper ID for reference
    cy.getVs(id)
      .find('.vscomp-ele-wrapper')
      .invoke('attr', 'id')
      .as('comboboxId');

    // Verify listbox container has correct role and aria-labelledby
    cy.get('@comboboxId').then((comboboxId) => {
      cy.get('@listboxContainer')
        .should('have.attr', 'role', 'listbox')
        .should('have.attr', 'aria-labelledby', comboboxId);
    });

    /**
     * pressKeys() sends a real key press to the search input rather than chaining .type()
     * onto a node. The fixed cy.wait() it replaces was redundant anyway - the .should()
     * below retries - and a fixed wait cannot fix the underlying race.
     */
    cy.getVs(id).pressKeys('ArrowDown');

    // Get first option and verify it's focused
    cy.getDropbox(null, id)
      .find('[role="option"]')
      .first()
      .as('firstOption')
      .should('have.class', 'focused');

    // Get the ID of the first option
    cy.get('@firstOption')
      .invoke('attr', 'id')
      .as('firstOptionId');

    // Verify aria-activedescendant names the focused option on the combobox
    cy.get('@firstOptionId').then((firstOptionId) => {
      cy.get('@activeDescendantHost')
        .should('have.attr', 'aria-activedescendant', firstOptionId);
    });

    // ...and is not published on the role-less container, which has no role to carry it
    cy.get('@roleLessContainer').should('not.have.attr', 'aria-activedescendant');

    /**
     * This is the press that made the case flaky. It used to be `cy.get('@firstOption')
     * .type('{downarrow}')` - chained onto the option node aliased above, which the
     * virtualiser replaces on every render. By the time .type() ran, that node could already
     * be detached, so the keydown never reached a handler, the highlight never advanced, and
     * the assertion below timed out with "expected <div.vscomp-option> to have class focused".
     * Observed failing about 1 run in 5, more often under CPU load.
     */
    cy.getVs(id).pressKeys('ArrowDown');

    // Get second option
    cy.getDropbox(null, id)
      .find('[role="option"]')
      .eq(1)
      .as('secondOption')
      .should('have.class', 'focused');

    // Get the ID of the second option
    cy.get('@secondOption')
      .invoke('attr', 'id')
      .as('secondOptionId');

    // Verify aria-activedescendant updates to second option
    cy.get('@secondOptionId').then((secondOptionId) => {
      cy.get('@activeDescendantHost')
        .should('have.attr', 'aria-activedescendant', secondOptionId);
    });

    cy.get('body').click(10, 10);
  });
});



/**
 * Arrow key behavior tests for search input.
 *
 * Up/Down in the search input navigate the option list (WAI-ARIA APG editable-combobox),
 * They used to be swallowed while the search input had focus, so no option could ever be
 * highlighted from the keyboard - a WCAG 2.1.1 (A) failure. Caret movement in the field is
 * served by Left/Right and Home/End, covered by the suites below.
 */

describe('Arrow key behavior in search input - cursor movement', () => {
  const idMultiple = 'multiple-select'

  it('moves the caret to the beginning with Home, and navigates options with Up arrow', () => {
    cy.open(idMultiple);
    // Type some text in search input
    cy.getVs(idMultiple).typeValue('ption 9', true);
    // Home moves the caret to the beginning (Up arrow now drives the option list instead)
    cy.getVs(idMultiple).pressKeys('Home');
    // Type 'O' at cursor position (should be at beginning)
    cy.getVs(idMultiple).typeValue('O');
    // Verify the text has 'O' at the beginning
    cy.getVs(idMultiple).checkOptionLabelExists('Option 9');

    // Up/Down highlight an option without taking focus out of the field
    cy.getVs(idMultiple).pressKeys('ArrowDown');
    cy.getDropbox(null, idMultiple).find('.vscomp-option.focused').should('exist');
    cy.checkActiveElementHasClass('vscomp-search-input');
  });

  it('moves the caret to the end with End key in search input', () => {
    // Clear and test End - use actual dropdown data
    cy.getVs(idMultiple).typeValue('Option 1', true);
    // End moves the caret to the end (Down arrow now drives the option list instead)
    cy.getVs(idMultiple).pressKeys('End');
    // Type '0' at cursor position (should be at end, making "Option 10")
    cy.getVs(idMultiple).typeValue('0');
    // Verify the text has '0' at the end
    cy.getVs(idMultiple).checkOptionLabelExists('Option 10');
  });

  it('should allow left and right arrow keys for cursor movement in search', () => {
    // Clear and type new text using actual dropdown data
    cy.getVs(idMultiple).typeValue('Option 55', true);
    // Move cursor left twice (to position before '5')
    cy.getVs(idMultiple).pressKeys(['ArrowLeft', 'ArrowLeft']);
    // Type 'X' in middle (before the '5')
    cy.getVs(idMultiple).typeValue('4');
    // Should have 'Option 455'
    cy.getVs(idMultiple).checkOptionLabelExists('Option 455');
    // Move cursor right twice (to end)
    cy.getVs(idMultiple).pressKeys(['ArrowRight', 'ArrowRight']);
    // Type 'Y' at end
    cy.getVs(idMultiple).typeValue('6');
    // Should have 'Option 4556'
    cy.getVs(idMultiple).checkOptionLabelExists('Option 4556');
  });

  it('should close multiple-select dropdown', () => {
    cy.get('body').click(10, 10); // Click outside to close
    cy.getVs(idMultiple).find('.vscomp-ele-wrapper').should('have.class', 'closed');
  });
});

describe('Arrow key behavior - no option navigation when search input focused', () => {
  const idMultiple = 'multiple-select'
  const searchInputSelector = '.vscomp-search-input';

  it('should not navigate options when arrow keys used in search input', () => {
    cy.open(idMultiple);
    // Type in search input - use text that will filter to a few options
    cy.getVs(idMultiple).typeValue('Option 1', true);
    // Wait for filtering to complete
    cy.wait(100);
    // Verify search input is focused
    cy.checkActiveElementHasClass('vscomp-search-input');
    // Press Down arrow while focused on search input
    cy.getVs(idMultiple).pressKeys('ArrowDown');
    // Search input should still be focused (arrow key should move cursor, not navigate options)
    cy.checkActiveElementHasClass('vscomp-search-input');
    // Press Up arrow while focused on search input
    cy.getVs(idMultiple).pressKeys('ArrowUp');
    // Search input should still be focused
    cy.checkActiveElementHasClass('vscomp-search-input');
  });

  it('should close multiple-select dropdown', () => {
    cy.get('body').click(10, 10); // Click outside to close
    cy.getVs(idMultiple).find('.vscomp-ele-wrapper').should('have.class', 'closed');
  });
});

describe('Arrow key behavior - Home and End keys in search input', () => {
  const idMultiple = 'multiple-select'

  it('should work correctly with Home and End keys in search input', () => {
    cy.open(idMultiple);
    // Type some text using search to ensure dropdown is properly opened
    cy.getVs(idMultiple).typeValue('ption 55', true);
    // Press Home to go to beginning
    cy.getVs(idMultiple).pressKeys('Home');
    // Type at beginning
    cy.getVs(idMultiple).typeValue('O');
    // Should have 'Option 55'
    cy.getVs(idMultiple).checkOptionLabelExists('Option 55');
    // Press End to go to end
    cy.getVs(idMultiple).pressKeys('End');
    // Type at end
    cy.getVs(idMultiple).typeValue('6');
    // Should have 'Option 556'
    cy.getVs(idMultiple).checkOptionLabelExists('Option 556');
    cy.getVs(idMultiple).searchClear();
  });

  it('should close multiple-select dropdown', () => {
    cy.get('body').click(10, 10); // Click outside to close
    cy.getVs(idMultiple).find('.vscomp-ele-wrapper').should('have.class', 'closed');
  });
});

describe('Arrow key behavior - focus management and accessibility', () => {
  const idMultiple = 'multiple-select'

  it('should allow normal text editing in search while arrows navigate the list', () => {
    cy.open(idMultiple);
    // Clear and test more text editing using realistic data
    cy.getVs(idMultiple).typeValue('tion 123', true);
    // Home goes to the beginning; Up/Down are option navigation
    cy.getVs(idMultiple).pressKeys('Home');
    cy.getVs(idMultiple).typeValue('Op');
    cy.getVs(idMultiple).checkOptionLabelExists('Option 123');
    // End goes back to the end
    cy.getVs(idMultiple).pressKeys('End');
    cy.getVs(idMultiple).typeValue('44');
    cy.getVs(idMultiple).checkOptionLabelExists('Option 12344');

    // Editing stays possible because navigation never moves DOM focus off the input
    cy.getVs(idMultiple).pressKeys('ArrowDown');
    cy.checkActiveElementHasClass('vscomp-search-input');
  });

  it('should close multiple-select dropdown', () => {
    cy.get('body').click(10, 10); // Click outside to close
    cy.getVs(idMultiple).find('.vscomp-ele-wrapper').should('have.class', 'closed');
  });
});



// // // // //
// // // // // Examples page
// // // // //

describe('Open Examples page', () => {
  it('opened', () => {
    cy.visit('examples');
  });
});

describe('Default dropdown', () => {
  const id = 'single-select';

  it('go to section', () => {
    cy.goToSection('Default dropdown');
  });

  it('check clear button not exist', () => {
    cy.getVs(id).checkClearButton(false);
  });

  it('select available option', () => {
    cy.open(id).selectOption(2).hasValueText('Option 2');
  });

  it('scroll and select option', () => {
    cy.open(id).scrollOptions(600).selectOption(17).hasValueText('Option 17');
  });

  it('check clear button exist', () => {
    cy.getVs(id).checkClearButton(true);
  });

  it('reset value', () => {
    cy.resetValue(id);
  });
});

describe('With search box', () => {
  const id = 'single-search-select';

  it('go to section', () => {
    cy.goToSection('With search box');
  });

  it('search and select available option', () => {
    cy.open(id).search('Option 234').selectOption(2340).hasValueText('Option 2340');
  });

  it('search, scroll, and select option', () => {
    cy.open(id).search('Option 234').scrollOptions(600).selectOption(23406).hasValueText('Option 23406');
  });

  it('search wrong text', () => {
    cy.open(id).search('Wrong text').hasNoOptions().close();
  });

  it('reset value', () => {
    cy.resetValue(id);
  });
});

describe('With search box - Clear search text', () => {
  const id = 'single-search-select';

  it('go to section', () => {
    cy.goToSection('With search box');
  });

  it('search for a keyword', () => {
    cy.open(id).search('Option');
  });

  it('check that clear button in search does not exists', () => {
    cy.getVs(id).checkSearchClearButton(true);
  });

  it('reset value', () => {
    cy.getVs(id).resetSearchValue();
  });

  it('check that clear button in search exists', () => {
    cy.getVs(id).checkSearchClearButton(false);
  });
});

describe('Multiple select', () => {
  const id = 'sample-multi-select';

  it('go to section', () => {
    cy.goToSection('Multiple select');
  });

  it('search and select available option', () => {
    cy.open(id)
      .search('Option 2340')
      .selectOption(2340)
      .search('Option 2342')
      .selectOption(2342)
      .hasValueText('Option 2340, Option 2342');
  });

  it('search, scroll, and select option', () => {
    cy.getVs(id)
      .search('Option 987')
      .selectOption(9872)
      .scrollOptions(400)
      .selectOption(98703)
      .hasValueText('4 options selected');
  });

  it('reset value', () => {
    cy.resetValue(id);
  });

  it('select/Unselect all options', () => {
    cy.getVs(id).toggleSelectAll().hasValueText('All (100001)').toggleSelectAll().hasValueText('Select');
  });

  it('select all except one option', () => {
    cy.getVs(id).toggleSelectAll().selectOption(3).hasValueText('100000 options selected').close();
  });
});

describe('Multiple select without search', () => {
  const id = 'multi-select-without-search';

  it('go to section', () => {
    cy.goToSection('Multiple select without search');
  });

  it('select/Unselect all options', () => {
    cy.open(id).toggleSelectAll(true).hasValueText('All (100001)').toggleSelectAll(true).hasValueText('Select');
  });
});

describe('Disabled options', () => {
  const id = 'single-disabled-select';

  it('go to section', () => {
    cy.goToSection('Disabled options');
  });

  it('select disabled option', () => {
    cy.open(id).selectOption(3).hasValueText('Option 3').selectOption(2, { force: true }).hasValueText('Option 3');
  });
});

describe('Option group', () => {
  const id = 'option-group-select';

  it('go to section', () => {
    cy.visit('examples');
    cy.goToSection('Option group');
  
  });

  it('select 1 child option', () => {
    cy.open(id).selectOption('1-1').hasValueText('Option 1-1').checkOptionGroup('Option group 1', false);
  });

  it('select all group options', () => {
    cy.getVs(id)
      .search('1-2')
      .selectOption('1-2')
      .search('1-3')
      .selectOption('1-3')
      .hasValueText('3 options selected')
      .checkOptionGroup('Option group 1', true);
  });

  it('unselect/select option group', () => {
    cy.getVs(id)
      .selectOptionGroup('Option group 1')
      .hasValueText('Select')
      .selectOptionGroup('Option group 1')
      .hasValueText('3 options selected');
  });

  it('includes group title in keyboard navigation and exposes it to assistive technologies', () => {
    /** openFresh() guarantees closed -> open with no highlight, so one press is one press
     * regardless of what the previous test left behind. */
    cy.openFresh(id);

    // One press reaches the group title. This needed two while the first ArrowDown was
    // still being swallowed by the focused search input.
    cy.getVs(id).find('.vscomp-wrapper').type('{downarrow}');

    cy.getDropbox(null, id)
      .find('.vscomp-option.group-title')
      .first()
      .as('groupTitle')
      .should('have.class', 'focused')
      .should('have.attr', 'tabindex', '0');

    cy.get('@groupTitle')
      .invoke('attr', 'aria-label')
      .should('include', 'Option group 1')
      .and('include', 'Select All');
  });

  it('activates group select/deselect with Enter when group title is focused', () => {
    cy.openFresh(id);

    cy.getVs(id).pressKeys('ArrowDown');
    cy.getVs(id).pressKeys('Enter');
    cy.getVs(id).hasValueText('3 options selected');
    cy.getVs(id).pressKeys('Enter');
    cy.getVs(id).hasValueText('Select');
  });

  it('navigates between group title and group options with arrow keys', () => {
    cy.openFresh(id);

    cy.getVs(id).find('.vscomp-wrapper').type('{downarrow}');

    cy.getDropbox(null, id)
      .find('.vscomp-option.group-title')
      .first()
      .as('groupTitle')
      .should('have.class', 'focused')
      .should('have.attr', 'tabindex', '0')
      .type('{downarrow}');

    cy.getDropbox(null, id)
      .find('.vscomp-option.focused')
      .should('have.class', 'group-option')
      .type('{uparrow}');

    cy.get('@groupTitle').should('have.class', 'focused');
  });

  it('opens dropdown and selects a group child option using keyboard only', () => {
    cy.openFresh(id);

    cy.getVs(id).find('.vscomp-wrapper').type('{downarrow}');

    cy.getDropbox(null, id).find('.vscomp-option.group-title').first().should('have.class', 'focused');

    /** pressKeys() sends a real key press to the search input rather than chaining .type()
     * onto an option node: the virtualiser replaces those nodes on every render, which
     * fails the command with "the page updated while this command was executing". */
    cy.getVs(id).pressKeys('ArrowDown');
    cy.getDropbox(null, id).find('.vscomp-option[data-value="1-1"]').should('have.class', 'focused');

    cy.getVs(id).pressKeys('Enter');

    cy.getVs(id).hasValueText('Option 1-1');
  });

  it('keeps focus on the last option when navigating past the end of the list', () => {
    cy.openFresh(id);

    cy.getVs(id).find('.vscomp-wrapper').type('{downarrow}');

    /** Deliberately more presses than there are rows: navigation clamps at the end, which
     * is the "navigating past the end" case under test, and this avoids hard-coding a count
     * that shifts whenever the demo's option list changes. */
    Cypress._.times(20, () => {
      cy.getDropbox(null, id).find('.vscomp-option.focused').type('{downarrow}');
    });

    cy.getDropbox(null, id)
      .find('.vscomp-option.group-option')
      .last()
      .as('lastOption')
      .should('have.class', 'focused');

    cy.get('@lastOption').type('{downarrow}');
    cy.get('@lastOption').should('have.class', 'focused');
  });
});

describe('Preselect value', () => {
  const id = 'preselect-single-select';

  it('go to section', () => {
    cy.goToSection('Preselect value');
  });

  it('preselected option', () => {
    cy.getVs(id).hasValueText('Option 3');
  });
});

describe('Preselect multiple values', () => {
  const id = 'preselect-multiple-select';

  it('go to section', () => {
    cy.goToSection('Preselect multiple values');
  });

  it('preselected option', () => {
    cy.getVs(id).hasValueText('Option 3, Option 4');
  });
});

describe('Hide clear button', () => {
  const id = 'hide-clear-select';

  it('go to section', () => {
    cy.goToSection('Hide clear button');
  });

  it('check clear button not exist before selecting value', () => {
    cy.getVs(id).checkClearButton(false);
  });

  it('select option', () => {
    cy.open(id).selectOption(3);
  });

  it('check clear button not exist after selecting value', () => {
    cy.getVs(id).checkClearButton(false);
  });
});

describe('Custom width for dropbox', () => {
  const id = 'custom-width-select';

  it('go to section', () => {
    cy.goToSection('Custom width for dropbox');
  });

  it('check dropbox width', () => {
    cy.open(id).checkDropboxWidth(130);
  });
});

describe('Allow to add new option', () => {
  const id = 'new-option-select';

  it('go to section', () => {
    cy.goToSection('Allow to add new option');
  });

  it('add a new option', () => {
    cy.open(id).search('Option not exist').selectOption('Option not exist').hasValueText('Option not exist');
  });
});

describe('Mark matched term in label', () => {
  const id = 'mark-results-select';

  it('go to section', () => {
    cy.goToSection('Mark matched term in label');
  });

  it('check marked text', () => {
    cy.open(id).search('on 32').hasMarkedText('on 32');
  });
});

describe('Showing selected options first', () => {
  const id = 'selected-first-select';

  it('go to section', () => {
    cy.goToSection('Showing selected options first');
  });

  it('check selected option moved to top', () => {
    cy.open(id).scrollOptions(2300).selectOption(28).close();
    cy.open(id).checkFirstOption('Option 28');
  });
});

describe('Using alias for searching', () => {
  const id = 'alias-select';

  it('go to section', () => {
    cy.goToSection('Showing selected options first');
  });

  it('search with label', () => {
    cy.open(id)
      .search('Col')
      .checkFirstOption('Colors')
      .search('Fru')
      .checkFirstOption('Fruits')
      .search('Mon')
      .checkFirstOption('Months')
      .search('Oth')
      .checkFirstOption('Others');
  });

  it('search with alias', () => {
    cy.getVs(id)
      .search('Ora')
      .checkFirstOption('Colors')
      .search('App')
      .checkFirstOption('Fruits')
      .search('Jan')
      .checkFirstOption('Months');
  });
});

describe('Keep dropbox always open', () => {
  const id = 'keep-open-select';

  it('go to section', () => {
    cy.goToSection('Keep dropbox always open');
  });

  it('select available option', () => {
    cy.getVs(id).selectOption(2).hasValueText('Option 2');
  });

  it('scroll and select option', () => {
    cy.getVs(id).scrollOptions(600).selectOption(17).hasValueText('Option 17');
  });

  it('reset value', () => {
    cy.resetValue(id);
  });
});

describe('Maximum values', () => {
  const id = 'max-values-select';

  it('go to section', () => {
    cy.goToSection('Maximum values');
  });

  it('select less than allowed options', () => {
    cy.open(id).selectOption([2, 4]).hasValueText('2 / 4 options selected');
  });

  it('select more than allowed options', () => {
    cy.getVs(id).scrollOptions(1800).selectOption([46, 50, 49]).hasValueText('4 / 4 options selected');
  });
});

describe('Label with description', () => {
  const id = 'with-description-select';

  it('go to section', () => {
    cy.goToSection('Label with description');
  });

  it('has description on load', () => {
    cy.open(id).checkFirstOption('Option 1 Description 1');
  });

  it('has description on scroll', () => {
    cy.getVs(id).scrollOptions(5000).checkFirstOption('Option 99 Description 99');
  });
});

describe('Search descriptions with and without normalize', () => {
  const plainId = 'with-description-search-select';
  const normalizedId = 'with-description-normalized-search-select';

  it('go to section', () => {
    cy.goToSection('Description search normalize');
  });

  it('matches descriptions as-is when searchNormalize is false', () => {
    cy.open(plainId).search('brû').checkFirstOption('Beta Crème brûlée');
  });

  it('does not normalize descriptions when searchNormalize is false', () => {
    cy.getVs(plainId).search('brulee').hasNoOptions().close();
  });

  it('normalizes descriptions when searchNormalize is true', () => {
    cy.open(normalizedId).search('brulee').checkFirstOption('Beta Crème brûlée');
  });
});

// // // // //
// // // // // Multi-language search normalize
// // // // //

describe('Multi-language search with searchNormalize: true', () => {
  const id = 'multi-language-search-select';

  it('go to section', () => {
    cy.goToSection('Multi-language search normalize');
  });

  // Latin (French / Spanish)
  it('Latin: finds Crème brûlée when searching "creme"', () => {
    cy.open(id).search('creme').checkFirstOption('Crème brûlée');
  });

  it('Latin: finds Niño when searching "nino"', () => {
    cy.getVs(id).search('nino').checkFirstOption('Niño');
  });

  // German
  it('German: finds München when searching "Munchen"', () => {
    cy.getVs(id).search('Munchen').checkFirstOption('München');
  });

  it('German: finds Mädchen when searching "Madchen"', () => {
    cy.getVs(id).search('Madchen').checkFirstOption('Mädchen');
  });

  it('German: ß is atomic — searching "Grosse" does NOT find "Größe"', () => {
    cy.getVs(id).search('Grosse').hasNoOptions();
  });

  // Norwegian
  it('Norwegian: finds Ålesund when searching "Alesund" (å decomposes)', () => {
    cy.getVs(id).search('Alesund').checkFirstOption('Ålesund');
  });

  it('Norwegian: ø is atomic — searching "Bjorn" does NOT find "Bjørn"', () => {
    cy.getVs(id).search('Bjorn').hasNoOptions();
  });

  // Swedish
  it('Swedish: finds Göteborg when searching "Goteborg"', () => {
    cy.getVs(id).search('Goteborg').checkFirstOption('Göteborg');
  });

  it('Swedish: finds Malmö when searching "Malmo"', () => {
    cy.getVs(id).search('Malmo').checkFirstOption('Malmö');
  });

  // Finnish
  it('Finnish: finds Jyväskylä when searching "Jyvaskyla"', () => {
    cy.getVs(id).search('Jyvaskyla').checkFirstOption('Jyväskylä');
  });

  it('Finnish: finds Hämeenlinna when searching "Hameenlinna"', () => {
    cy.getVs(id).search('Hameenlinna').checkFirstOption('Hämeenlinna');
  });

  // Greek
  it('Greek: finds Ένα when searching with accent', () => {
    cy.getVs(id).search('Ένα').checkFirstOption('Ένα');
  });

  it('Greek: finds Ένα when searching "Ενα" (without accent)', () => {
    cy.getVs(id).search('Ενα').checkFirstOption('Ένα');
  });

  it('Greek: finds Αθήνα by normalized description ("Πρωτευουσα")', () => {
    cy.getVs(id).search('Πρωτευουσα').checkFirstOption('Αθήνα');
  });

  // Cyrillic
  it('Cyrillic: finds Ёжик when searching with ё (exact)', () => {
    cy.getVs(id).search('Ёжик').checkFirstOption('Ёжик');
  });

  it('Cyrillic: finds Ёжик when searching "Ежик" (е instead of ё)', () => {
    cy.getVs(id).search('Ежик').checkFirstOption('Ёжик');
  });

  it('Cyrillic: finds Ёжик by normalized description (зверёк → зверек)', () => {
    cy.getVs(id).search('зверек').checkFirstOption('Ёжик');
  });

  // Vietnamese
  it('Vietnamese: finds Việt Nam when searching "Viet Nam"', () => {
    cy.getVs(id).search('Viet Nam').checkFirstOption('Việt Nam');
  });

  it('Vietnamese: finds Hà Nội when searching "Ha Noi"', () => {
    cy.getVs(id).search('Ha Noi').checkFirstOption('Hà Nội');
  });

  // Chinese
  it('Chinese: finds 北京 when searching "北京" (preserved as-is)', () => {
    cy.getVs(id).search('北京').checkFirstOption('北京');
  });

  it('Chinese: finds 北京 by description "首都"', () => {
    cy.getVs(id).search('首都').checkFirstOption('北京');
  });

  // Japanese
  it('Japanese: finds 東京 when searching kanji', () => {
    cy.getVs(id).search('東京').checkFirstOption('東京');
  });

  it('Japanese: finds カタカナ (katakana preserved as-is)', () => {
    cy.getVs(id).search('カタカナ').checkFirstOption('カタカナ');
  });

  // Korean
  it('Korean: finds 서울 (NFD-normalized symmetrically)', () => {
    cy.getVs(id).search('서울').checkFirstOption('서울');
  });

  it('Korean: finds 한국어', () => {
    cy.getVs(id).search('한국어').checkFirstOption('한국어');
  });

  // Arabic
  it('Arabic: finds مُرَحَّباً when searching "مرحبا" (tashkeel stripped)', () => {
    cy.getVs(id).search('مرحبا').checkFirstOption('مُرَحَّباً');
  });

  // Thai
  it('Thai: finds กรุงเทพ when searching exact text', () => {
    cy.getVs(id).search('กรุงเทพ').checkFirstOption('กรุงเทพ');
  });

  // Intra-word punctuation regression — guards the second .replace() pass
  // that strips non-letter characters in a Unicode-aware way.
  it('Intra-word punctuation: finds "co-op" when searching "coop"', () => {
    cy.getVs(id).search('coop').checkFirstOption('co-op');
  });

  it('Intra-word punctuation: finds "e-mail" when searching "email"', () => {
    cy.getVs(id).search('email').checkFirstOption('e-mail');
  });

  // Whitespace folding regression — labels with spaces match spaceless searches
  it('Whitespace folding: finds "Foo Bar" when searching "FooBar" (no space)', () => {
    cy.getVs(id).search('FooBar').checkFirstOption('Foo Bar');
  });

  it('Whitespace folding: finds "Foo Bar" when searching "Foo Bar" (with space)', () => {
    cy.getVs(id).search('Foo Bar').checkFirstOption('Foo Bar');
  });

  it('Whitespace folding: finds "Việt Nam" when searching "VietNam" (no space)', () => {
    cy.getVs(id).search('VietNam').checkFirstOption('Việt Nam');
  });

  // Symmetric punctuation — label has no punctuation, search has it
  it('Symmetric punctuation: finds "walkthrough" when searching "walk-through"', () => {
    cy.getVs(id).search('walk-through').checkFirstOption('walkthrough');
  });

  // Numbers (\p{N}) preserved alongside letters; non-letter chars fold both ways
  it('Numbers preserved: finds "Mars-2024" when searching "Mars2024"', () => {
    cy.getVs(id).search('Mars2024').checkFirstOption('Mars-2024');
  });

  it('Numbers preserved: finds "Mars-2024" when searching "Mars 2024" (with space)', () => {
    cy.getVs(id).search('Mars 2024').checkFirstOption('Mars-2024');
  });

  // Leading/trailing whitespace in the search input still matches
  it('Search whitespace: leading/trailing whitespace still finds Crème brûlée', () => {
    cy.getVs(id).search('  creme  ').checkFirstOption('Crème brûlée');
  });

  // Edge case — pure-punctuation search normalizes to "" and currently
  // matches every label via includes(""). This test documents the
  // behavior; if it's later considered a bug, update the assertion.
  it('Empty-after-normalize: pure-punctuation search currently matches options', () => {
    cy.getVs(id).search('!@#');
    cy.getDropbox(null, id).find('[role="option"]').should('have.length.greaterThan', 1);
  });

  // Negative case
  it('does not find non-existent text', () => {
    cy.getVs(id).search('zzznotfound').hasNoOptions().close();
  });
});

describe('Multi-language search with searchNormalize: false', () => {
  const id = 'multi-language-search-no-normalize-select';

  it('go to section', () => {
    cy.goToSection('Multi-language search normalize');
  });

  // Exact matches — should work
  it('Latin: finds Crème brûlée only when searching with diacritics', () => {
    cy.open(id).search('Crème').checkFirstOption('Crème brûlée');
  });

  it('Greek: finds Ένα when searching exact "Ένα"', () => {
    cy.getVs(id).search('Ένα').checkFirstOption('Ένα');
  });

  it('Cyrillic: finds Ёжик when searching exact "Ёжик"', () => {
    cy.getVs(id).search('Ёжик').checkFirstOption('Ёжик');
  });

  it('Chinese: finds 北京 (no normalization needed)', () => {
    cy.getVs(id).search('北京').checkFirstOption('北京');
  });

  it('Japanese: finds 東京 (no normalization needed)', () => {
    cy.getVs(id).search('東京').checkFirstOption('東京');
  });

  it('Korean: finds 서울 (no normalization needed)', () => {
    cy.getVs(id).search('서울').checkFirstOption('서울');
  });

  // Negative cases — without normalize, accent-stripped searches should not match
  it('Latin: does NOT find Crème brûlée when searching "creme" (no normalize)', () => {
    cy.getVs(id).search('creme').hasNoOptions();
  });

  it('German: does NOT find München when searching "Munchen"', () => {
    cy.getVs(id).search('Munchen').hasNoOptions();
  });

  it('Swedish: does NOT find Göteborg when searching "Goteborg"', () => {
    cy.getVs(id).search('Goteborg').hasNoOptions();
  });

  it('Finnish: does NOT find Jyväskylä when searching "Jyvaskyla"', () => {
    cy.getVs(id).search('Jyvaskyla').hasNoOptions();
  });

  it('Greek: does NOT find Ένα when searching "Ενα" (no accent)', () => {
    cy.getVs(id).search('Ενα').hasNoOptions();
  });

  it('Cyrillic: does NOT find Ёжик when searching "Ежик" (е instead of ё)', () => {
    cy.getVs(id).search('Ежик').hasNoOptions();
  });

  it('Vietnamese: does NOT find Việt Nam when searching "Viet Nam"', () => {
    cy.getVs(id).search('Viet Nam').hasNoOptions();
  });

  it('Arabic: does NOT find مُرَحَّباً when searching "مرحبا" (tashkeel mismatch)', () => {
    cy.getVs(id).search('مرحبا').hasNoOptions();
  });

  it('Intra-word punctuation: does NOT find "co-op" when searching "coop"', () => {
    cy.getVs(id).search('coop').hasNoOptions().close();
  });
});

describe('Multi-language tags variant with searchNormalize: true', () => {
  const id = 'multi-language-tags-search-select';

  it('go to section', () => {
    cy.goToSection('Multi-language search normalize');
  });

  it('finds München with normalized search "Munchen"', () => {
    cy.open(id).search('Munchen').checkFirstOption('München');
  });

  it('selects München and renders it as a value tag', () => {
    cy.getVs(id).selectOption('munchen');
    cy.getVs(id).hasValueTags(['München']);
  });

  it('finds Việt Nam with normalized search and adds a second tag', () => {
    cy.getVs(id).search('Viet Nam').checkFirstOption('Việt Nam');
    cy.getVs(id).selectOption('vietnam');
    cy.getVs(id).hasValueTags(['München', 'Việt Nam']);
    cy.getVs(id).checkValueTagsCount(2);
  });

  it('finds Ёжик with normalized search "Ежик" and adds Cyrillic tag', () => {
    cy.getVs(id).search('Ежик').checkFirstOption('Ёжик');
    cy.getVs(id).selectOption('yozhik');
    cy.getVs(id).hasValueTags(['München', 'Việt Nam', 'Ёжик']);
    cy.getVs(id).checkValueTagsCount(3);
  });

  it('removes a value tag and reduces tag count', () => {
    cy.getVs(id).removeValueTag('München').checkValueTagsCount(2);
  });

  it('finds CJK options as-is (Chinese 北京)', () => {
    cy.getVs(id).search('北京').checkFirstOption('北京');
    cy.getVs(id).selectOption('beijing');
    cy.getVs(id).checkValueTagsCount(3).close();
  });
});

describe('Multi-language tags variant with searchNormalize: false', () => {
  const id = 'multi-language-tags-search-no-normalize-select';

  it('go to section', () => {
    cy.goToSection('Multi-language search normalize');
  });

  it('does NOT find München when searching "Munchen" (no normalize)', () => {
    cy.open(id).search('Munchen').hasNoOptions();
  });

  it('finds München only when searching with diacritics and tags it', () => {
    cy.getVs(id).search('München').checkFirstOption('München');
    cy.getVs(id).selectOption('munchen');
    cy.getVs(id).hasValueTags(['München']);
    cy.getVs(id).checkValueTagsCount(1);
  });

  it('finds Ёжик only with exact ё (not "Ежик")', () => {
    cy.getVs(id).search('Ежик').hasNoOptions();
    cy.getVs(id).search('Ёжик').checkFirstOption('Ёжик');
    cy.getVs(id).selectOption('yozhik');
    cy.getVs(id).hasValueTags(['München', 'Ёжик']);
    cy.getVs(id).checkValueTagsCount(2).close();
  });
});

describe('Multi-language popup variant with searchNormalize: true', () => {
  const id = 'multi-language-popup-search-select';

  it('go to section', () => {
    cy.goToSection('Multi-language search normalize');
  });

  it('opens as a popup and finds München with normalized search', () => {
    cy.open(id).search('Munchen').checkFirstOption('München');
  });

  it('finds Việt Nam with normalized search inside popup', () => {
    cy.getVs(id).search('Viet Nam').checkFirstOption('Việt Nam');
  });

  it('finds Ёжик with normalized search "Ежик" inside popup', () => {
    cy.getVs(id).search('Ежик').checkFirstOption('Ёжик');
  });

  it('finds CJK options as-is (Japanese 東京)', () => {
    cy.getVs(id).search('東京').checkFirstOption('東京');
    cy.closePopup(id);
  });
});

describe('Multi-language popup variant with searchNormalize: false', () => {
  const id = 'multi-language-popup-search-no-normalize-select';

  it('go to section', () => {
    cy.goToSection('Multi-language search normalize');
  });

  it('opens as a popup and does NOT find München with normalized search', () => {
    cy.open(id).search('Munchen').hasNoOptions();
  });

  it('finds München only when searching with diacritics inside popup', () => {
    cy.getVs(id).search('München').checkFirstOption('München');
  });

  it('CJK options still match as-is (no normalization needed)', () => {
    cy.getVs(id).search('서울').checkFirstOption('서울');
    cy.closePopup(id);
  });
});

describe('Latin diacritics regression with normalize', () => {
  const normalizedId = 'with-description-normalized-search-select';

  it('go to section', () => {
    cy.goToSection('Description search normalize');
  });

  it('still normalizes Latin descriptions (brulee finds brûlée)', () => {
    cy.open(normalizedId).search('brulee').checkFirstOption('Beta');
  });

  it('still normalizes Latin descriptions (cafe finds café)', () => {
    cy.getVs(normalizedId).search('cafe').checkFirstOption('Alpha');
  });

  it('still normalizes Latin descriptions (nino finds niño)', () => {
    cy.getVs(normalizedId).search('nino').checkFirstOption('Gamma').close();
  });
});

// // // // //
// // // // // Show dropbox as popup
// // // // //

describe('Show dropbox as popup - Clear search text', () => {
  const id = 'multiple-show-as-popup-select';

  it('go to section', () => {
    cy.goToSection('Show dropbox as popup');
  });

  it('search for a keyword', () => {
    cy.open(id).search('Option');
  });

  it('check clear button exist', () => {
    cy.getVs(id).checkClearButtonPopup(true);
  });

  it('reset value', () => {
    cy.getVs(id).resetValuePopup();
  });

  it('check clear button not exist', () => {
    cy.getVs(id).checkClearButton(false);
  });

});

describe('Show dropbox as popup - Multiple', () => {
  const id = 'multiple-show-as-popup-select';

  it('go to section', () => {
    cy.goToSection('Show dropbox as popup');
  });

  it('select options', () => {
    cy.open(id)
    .search('1')
    .selectOption(1)
    .search('3')
    .selectOption(3)
    .search('7')
    .selectOption(7)
    .hasValueText('Option 1, Option 3, Option 7')
    .searchClear();
  });

  it('dropbox is fixed', () => {
    cy.dropboxIsFixed(id);
  });

  it('close popup', () => {
    cy.closePopup(id);
  });
});

describe('Show dropbox as popup - Single', () => {
  const id = 'single-show-as-popup-select';

  it('go to section', () => {
    cy.goToSection('Show dropbox as popup');
  });

  it('select option', () => {
    cy.open(id).selectOption(3).hasValueText('Option 3');
  });

  it('dropbox is fixed', () => {
    cy.open(id).dropboxIsFixed(id);
  });

  it('close popup', () => {
    cy.closePopup(id);
  });
});

describe('Server search', () => {
  const id = 'server-search-select';

  it('go to section', () => {
    cy.goToSection('Server search');
  });

  it('search and select', () => {
    cy.open(id).search('349').selectOption([2349, 349]).hasValueText('Option 2349, Option 349');
  });
});

describe('Show options only on search', () => {
  const id = 'options-on-search-select';

  it('go to section', () => {
    cy.goToSection('Show options only on search');
  });

  it('empty on load', () => {
    cy.open(id).hasNoOptions();
  });

  it('show options on search', () => {
    cy.getVs(id).search('9876').selectOption('49876').hasValueText('Option 49876');
  });
});

describe('Add image/icon', () => {
  const id = 'with-image-select';

  it('go to section', () => {
    cy.goToSection('Add image/icon');
  });

  it('has flag icon on load', () => {
    cy.open(id).hasFlagIcon();
  });

  it('has flag icon on scroll', () => {
    cy.getVs(id).scrollOptions(700).hasFlagIcon().parent().contains('Option 16');
  });

  it('has flag icon on selected item', () => {
    /**
     * cy.open() is a click, i.e. a toggle. The preceding case leaves this dropdown open, so
     * clicking here closed it and the option click then landed on a dropbox with
     * `display: none`. Open only when actually closed, and re-establish the scroll position
     * so option 16 is rendered whether or not the preceding case ran.
     */
    cy.getVs(id).then(($e) => {
      const vs = $e[0].virtualSelect;

      if (!vs.isOpened()) {
        vs.openDropbox();
      }
    });
    cy.getVs(id).find('.vscomp-wrapper').should('not.have.class', 'closed');

    cy.getVs(id).scrollOptions(700).selectOption(16).hasSelectedFlagIcon();
  });
});

describe('Show values as tags', () => {
  const id = 'show-value-as-tags-select';

  it('go to section', () => {
    cy.goToSection('Show values as tags');
  });

  it('select options', () => {
    cy.open(id)
      .search('3')
      .selectOption(3)
      .search('7')
      .selectOption(7)
      .scrollOptions(600)
      .search('18')
      .selectOption(18)
      .search('20')
      .selectOption(20)
      .hasValueTags(['Option 3', 'Option 7', 'Option 18', 'Option 20'])
  });

  it('remove selected options', () => {
    cy.getVs(id)
      .checkValueTagsCount(4)
      .removeValueTag('Option 7')
      .checkValueTagsCount(3)
      .removeValueTag('Option 18')
      .checkValueTagsCount(2)
      .removeValueTag('Option 20')
      .checkValueTagsCount(1)
      .removeValueTag('Option 3')
      .checkValueTagsCount(0)
      .hasValueText('Select')
      .close()
  });

  it('reset value', () => {
    const optsList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const vs = cy.open(id);
    for (let i = 0; i < optsList.length; i++) {
      vs
        .search(`Option ${optsList[i]}`)
        .selectOption(i+1);
    }
    vs.checkValueTagsCount(10).resetValue(id)
  });
});

describe('Right-to-Left text', () => {
  const id = 'direction-rtl-select';

  it('go to section', () => {
    cy.goToSection('Right-to-Left text');
  });

  it('options aligned to right', () => {
    cy.getDropbox(null, id).find('.vscomp-option').first().should('have.css', 'text-align', 'right');
  });

  it('select available option', () => {
    cy.open(id)
      .search(`1`)
      .selectOption(1)
      .search(`3`)
      .selectOption(3)
      .hasValueText('Option 1, Option 3');
  });

  it('value aligned to right', () => {
    cy.getVs(id).find('.vscomp-toggle-button').should('have.css', 'direction', 'rtl');
  });
});

describe('Disable/Enable', () => {
  const id = 'disable-enable';

  it('go to section', () => {
    cy.goToSection('Disable/Enable');
  });

  it('disable dropdown', () => {
    cy.get('#disable-enable-switch').click();
    cy.getVs(id).should('have.attr', 'disabled', 'disabled');
  });

  it('enable dropdown', () => {
    cy.get('#disable-enable-switch').click();
    cy.getVs(id).should('not.have.attr', 'disabled', 'disabled');
  });

  it('select option', () => {
    cy.open(id).selectOption(7).hasValueText('Option 7');
  });

  it('reset value', () => {
    cy.resetValue(id);
  });
});

describe('Validation', () => {
  const id = 'validation-select';

  it('go to section', () => {
    cy.goToSection('Validation');
  });

  it('submit without value', () => {
    cy.get('#validation-form').find('[type=submit]').click();
    cy.getVs(id).find('.vscomp-ele-wrapper').should('have.class', 'has-error');
  });

  it('submit with value', () => {
    cy.open(id).selectOption([3, 5]).close();
    cy.get('#validation-form').find('[type=submit]').click();
    cy.getVs(id).find('.vscomp-ele-wrapper').should('not.have.class', 'has-error');
  });

  it('reset dropdown', () => {
    cy.resetValue(id);
    cy.getVs(id).find('.vscomp-ele-wrapper').should('have.class', 'has-error');
  });

  it('reset form', () => {
    cy.get('#validation-form').find('[type=reset]').click();
    cy.getVs(id).find('.vscomp-ele-wrapper').should('not.have.class', 'has-error');
  });
});

// // // // //
// // // // // Events page
// // // // //

describe('To verify that the change event is not fired twice when selecting items after a search', () => {

  const id = 'sample-select-onchange';
  const resId = 'sample-select-changes';

  it('go to section', () => {
    cy.goToSection('Events');
  });

  it('select Option 1', () => {
    cy.open(id).selectOption(1).hasValueText('Option 1');
    cy.get(`#${resId}`).should('have.text', 'Selected = 1 | No.changes = 1');
  });

  it('search and select 123', () => {
    cy.open(id).search('123').selectOption(123).hasValueText('Option 123');
    cy.get(`#${resId}`).should('have.text', 'Selected = 123 | No.changes = 2');
  });

});


describe('To verify that the reset event is fired', () => {

  const id = 'sample-select-reset';
  const resId = 'select-reset-res';

  it('go to section', () => {
    cy.goToSection('Events');
  });

  it('select Option 1', () => {
    cy.open(id).selectOption(1).hasValueText('Option 1');
  });

  it('check clear button exist', () => {
    cy.getVs(id).checkClearButton(true);
  });

  it('reset value', () => {
    cy.resetValue(id);
    cy.get(`#${resId}`).should('have.text', 'reset event triggered');
  });

});


/**
 * Focus management regression tests
 *
 * 1. When the dropdown is open and the user clicks another focusable element
 *    (e.g., an input), the focus must stay on that element – the dropdown
 *    should not steal it back.
 * 2. When the dropdown is closed with the Escape key, focus should return to
 *    the dropdown wrapper to maintain keyboard accessibility.
 */

describe('Validate focus management clicking outside and pressing ESC', () => {

  const id = 'sample-select-onchange';

  it('go to section', () => {
    cy.goToSection('Events');
  });

  it('keeps focus on external input when clicking outside', () => {
    cy.open(id);
    // Inject an external input into the DOM for testing
    cy.document().then((doc) => {
      const input = doc.createElement('input');
      input.type = 'text';
      input.id = 'external-input';
      input.placeholder = 'External input';
      input.setAttribute(
        'style',
        'position:fixed; top:20px; left:20px; z-index:9999;'
      );
      doc.body.appendChild(input);
    });
    // Click the external input and verify focus stays there
    cy.get('#external-input').click({ force: true }).should('have.focus');
    // Verify the dropdown is closed (wrapper has class "closed")
    cy.getVs(id).find('.vscomp-ele-wrapper').should('have.class', 'closed');
    // Clean up the injected input to avoid side effects
    cy.get('#external-input').then($input => {
      $input.remove();
    });
  });

  it('refocuses dropdown wrapper when closed with ESC', () => {
    // 1. Open the dropdown
    cy.open(id);
    // 2. Press ESC to close it
    cy.getVs(id).find('.vscomp-toggle-button').type('{esc}');
    // 3. Wrapper should now have focus
    cy.getVs(id).find('.vscomp-ele-wrapper').should('have.focus');
    // 4. Ensure it is closed
    cy.getVs(id).find('.vscomp-ele-wrapper').should('have.class', 'closed');
  });

});