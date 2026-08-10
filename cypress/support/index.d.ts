/**
 * VirtualSelect.setEleProps() attaches the instance and its public API directly onto the
 * host element, so specs can drive a component through the same surface consumers use.
 */
interface HTMLElement {
  virtualSelect?: any;
  reset?: (formReset?: boolean, disableChangeEvent?: boolean) => void;
  setValue?: (value: any, options?: any) => void;
  setOptions?: (options: any[], keepValue?: boolean) => void;
  setDisabledOptions?: (disabledOptions: any[], keepValue?: boolean) => void;
  setEnabledOptions?: (enabledOptions: any[], keepValue?: boolean) => void;
  toggleSelectAll?: (isSelectAll?: boolean) => void;
  isAllSelected?: () => boolean;
  addOption?: (data: any, rerender?: boolean) => void;
  getNewValue?: () => any;
  getDisplayValue?: () => any;
  getSelectedOptions?: (options?: any) => any;
  getDisabledOptions?: () => any;
  open?: () => void;
  close?: () => void;
  destroy?: () => void;
  validate?: () => boolean;
  toggleRequired?: (isRequired: boolean) => void;
}

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * @example
     * cy.goToSection('Default dropdown')
     */
    goToSection(title: string): Chainable<any>;

    /**
     * @example
     * cy.getVs('single-select')
     */
    getVs(id: string): Chainable<any>;

    /**
     * @example
     * cy.getDropbox(vsEle)
     * cy.getDropbox(null, 'single-select')
     */
    getDropbox(vsElem: any, id?: string): Chainable<any>;

    /**
     * @example
     * cy.open('single-select')
     */
    open(id: string): Chainable<any>;

    /**
     * Open from a known state - closed, no value, no highlighted option - so press counts do
     * not depend on what the previous test left behind.
     *
     * @example
     * cy.openFresh('option-group-select')
     */
    openFresh(id: string): Chainable<any>;

    /**
     * @example
     close()
     */
    close(): Chainable<any>;

    /**
     * @example
     * cy.resetValue('single-select')
     */
    resetValue(id: string): Chainable<any>;

    /**
     * @example
     * cy.resetSearchValue(vsElem)
     */
    resetSearchValue(): Chainable<any>;

    /**
     * @example
     * cy.resetValuePopup(vsElem)
     */
    resetValuePopup(): Chainable<any>;

    /**
     * @example
     * cy.scrollOptions(600)
     */
    scrollOptions(distance: number): Chainable<any>;

    /**
     * @example
     * cy.selectOption(2)
     * cy.selectOption([2, 3])
     * cy.selectOption(2, { force: true })
     */
    selectOption(value: string | number | (string | number)[], options?: { force?: boolean }): Chainable<any>;

    /**
     * @example
     * cy.checkOptionLabelExists('Option 2')
     * cy.checkOptionLabelExists(['Option 2', 'Option 3'])
     */
    checkOptionLabelExists(label: string | number | (string | number)[]): Chainable<any>;

    /**
     * @example
     * cy.checkActiveElementHasClass('vscomp-search-input')
     */
    checkActiveElementHasClass(className: string): Chainable<Subject>;

    /**
     * @example
     * cy.hasValueText('Option 2')
     */
    hasValueText(valueText: string): Chainable<any>;

    /**
     * @example
     * cy.searchClear()
     */
    searchClear(): Chainable<any>;

    /**
     * @example
     * cy.search('Option 2')
     */
    search(value: string): Chainable<any>;

    /**
     * @example
     * cy.typeValue('Option 2')
     * cy.typeValue('Option 2', true)
     */
    typeValue(value: string, clearText?: boolean): Chainable<any>;

    /**
     * @example
     * cy.pressKeys('Enter')
     * cy.pressKeys(['ArrowDown', 'Enter'])
     */
    pressKeys(keys: string | string[]): Chainable<Subject>;

    /**
     * @example
     * cy.toggleSelectAll()
     * cy.toggleSelectAll(true)
     */
    toggleSelectAll(byLabel?: boolean): Chainable<any>;

    /**
     * @example
     * cy.hasNoOptions()
     */
    hasNoOptions(): Chainable<any>;

    /**
     * @example
     * cy.checkClearButton(true)
     * cy.checkClearButton(false)
     */
    checkClearButton(isExist: boolean): Chainable<any>;

    /**
     * @example
     * cy.checkSearchClearButton(true)
     * cy.checkSearchClearButton(false)
     */
    checkSearchClearButton(isExist: boolean): Chainable<any>;
    
    /**
     * @example
     * cy.checkClearButtonPopup(true)
     * cy.checkClearButtonPopup(false)
     */
    checkClearButtonPopup(isExist: boolean): Chainable<any>;
    

    /**
     * @example
     * cy.checkDropboxWidth(200)
     */
    checkDropboxWidth(width: number): Chainable<any>;

    /**
     * @example
     * cy.checkFirstOption('Option 34')
     */
    checkFirstOption(optionLabel: string): Chainable<any>;

    /**
     * @example
     * cy.checkOptionGroup('Option group 1', true)
     * cy.checkOptionGroup('Option group 1', false)
     */
    checkOptionGroup(title: string, selected: boolean): Chainable<any>;

    /**
     * @example
     * cy.selectOptionGroup('Option group 1')
     */
    selectOptionGroup(title: string): Chainable<any>;

    /**
     * @example
     * cy.hasMarkedText('on 3')
     */
    hasMarkedText(text: string): Chainable<any>;

    /**
     * @example
     * cy.dropboxIsFixed('single-select')
     */
    dropboxIsFixed(id: string): Chainable<any>;

    /**
     * @example
     * cy.closePopup('single-select')
     */
    closePopup(id: string): Chainable<any>;

    /**
     * @example
     * cy.hasFlagIcon()
     */
    hasFlagIcon(): Chainable<any>;

     /**
     * @example
     * cy.hasFlagIcon()
     */
     hasSelectedFlagIcon(): Chainable<any>;

    /**
     * @example
     * cy.hasValueTags(['Option 3', 'Option 5'])
     */
    hasValueTags(labels: string[]): Chainable<any>;

    /**
     * @example
     * cy.checkValueTagsCount(3)
     */
    checkValueTagsCount(count: number): Chainable<any>;

    /**
     * @example
     * cy.removeValueTag(Option 7)
     */
    removeValueTag(label: string): Chainable<any>;
  }
}
