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



/**
 * Arrow key behavior tests for search input
 * Tests the fix that allows normal cursor movement in search input
 * while preserving option navigation when focus moves away from search
 */

describe('Arrow key behavior in search input - cursor movement', () => {
  const idMultiple = 'multiple-select'

  it('should allow cursor movement to beginning with up arrow in search input', () => {
    cy.open(idMultiple);
    // Type some text in search input
    cy.getVs(idMultiple).typeValue('ption 9', true);
    // Press Up arrow - should move cursor to beginning
    cy.getVs(idMultiple).pressKeys('ArrowUp');
    // Type 'O' at cursor position (should be at beginning)
    cy.getVs(idMultiple).typeValue('O');
    // Verify the text has 'O' at the beginning
    cy.getVs(idMultiple).checkOptionLabelExists('Option 9');
  });

  it('should allow cursor movement to end with down arrow in search input', () => {
    // Clear and test Down arrow - use actual dropdown data
    cy.getVs(idMultiple).typeValue('Option 1', true);
    // Press Down arrow - should move cursor to end
    cy.getVs(idMultiple).pressKeys('ArrowDown');
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

  it('should allow normal text editing with arrow keys in search', () => {
    cy.open(idMultiple);
    // Clear and test more text editing using realistic data
    cy.getVs(idMultiple).typeValue('tion 123', true);
    // Use Up arrow to go to beginning
    cy.getVs(idMultiple).pressKeys('ArrowUp');
    cy.getVs(idMultiple).typeValue('Op');
    cy.getVs(idMultiple).checkOptionLabelExists('Option 123');
    // Use Down arrow to go to end
    cy.getVs(idMultiple).pressKeys('ArrowDown');
    cy.getVs(idMultiple).typeValue('44');
    cy.getVs(idMultiple).checkOptionLabelExists('Option 12344');
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

  it('select all options', () => {
    cy.getVs(id)
      .searchClear()
      .toggleSelectAll()
      .hasValueText('All (9)')
      .checkOptionGroup('Option group 1', true)
      .checkOptionGroup('Option group 2', true)
      .checkOptionGroup('Option group 3', true);
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
    cy.open(id).selectOption(16).hasSelectedFlagIcon();
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