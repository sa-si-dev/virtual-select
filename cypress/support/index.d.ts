interface HTMLElement {
  virtualSelect?: any;
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
     * cy.hasValueText('Option 2')
     */
    hasValueText(valueText: string): Chainable<any>;

    /**
     * @example
     * cy.search('Option 2')
     */
    search(value: string): Chainable<any>;

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
     * cy.dropboxIsFixed('single-select')
     */
    closePopup(id: string): Chainable<any>;

    /**
     * @example
     * cy.hasFlagIcon()
     */
    hasFlagIcon(): Chainable<any>;

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
