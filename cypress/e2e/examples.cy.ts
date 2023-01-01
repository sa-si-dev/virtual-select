/** cSpell:ignore vscomp */

describe('Open examples page', () => {
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

describe('Multiple select', () => {
  const id = 'sample-multi-select';

  it('go to section', () => {
    cy.goToSection('Multiple select');
  });

  it('search and select available option', () => {
    cy.open(id).search('Option 234').selectOption([2340, 2342]).hasValueText('Option 2340, Option 2342');
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
    cy.getVs(id).toggleSelectAll().hasValueText('All (100000)').toggleSelectAll().hasValueText('Select');
  });

  it('select all except one option', () => {
    cy.getVs(id).toggleSelectAll().selectOption(3).hasValueText('99999 options selected').close();
  });
});

describe('Multiple select without search', () => {
  const id = 'multi-select-without-search';

  it('go to section', () => {
    cy.goToSection('Multiple select without search');
  });

  it('select/Unselect all options', () => {
    cy.open(id).toggleSelectAll(true).hasValueText('All (100000)').toggleSelectAll(true).hasValueText('Select');
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
      .selectOption(['1-2', '1-3'])
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

describe('Show dropbox as popup - Multiple', () => {
  const id = 'multiple-show-as-popup-select';

  it('go to section', () => {
    cy.goToSection('Show dropbox as popup');
  });

  it('select options', () => {
    cy.open(id).selectOption([1, 3, 7]).hasValueText('Option 1, Option 3, Option 7');
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
});

describe('Show values as tags', () => {
  const id = 'show-value-as-tags-select';

  it('go to section', () => {
    cy.goToSection('Show values as tags');
  });

  it('select options', () => {
    cy.open(id)
      .selectOption([3, 7])
      .scrollOptions(600)
      .selectOption([18, 20])
      .hasValueTags(['Option 3', 'Option 7', 'Option 18', 'Option 20']);
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
      .hasValueText('Select');
  });

  it('reset value', () => {
    cy.open(id).selectOption([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).checkValueTagsCount(10).resetValue(id);
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
    cy.open(id).selectOption([1, 3]).hasValueText('Option 1, Option 3');
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
